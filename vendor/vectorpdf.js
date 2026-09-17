/* vectorpdf.js — write the label as a REAL PDF, not a picture of one.
 *
 * Classic script. Load after jspdf and layoutspec.js. Exposes
 * globalThis.VectorPDF.
 *
 *
 * WHAT WAS WRONG
 * --------------
 * The PDF download was one line:
 *
 *     doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, W, H);
 *
 * — a screenshot in a PDF wrapper. Nothing in it is text: you cannot select a
 * serial, search for an EAN, copy an address, or correct a typo. It is a
 * picture with a .pdf extension.
 *
 *
 * WHERE THE CONTENT COMES FROM
 * ----------------------------
 * Not from re-reading the drawing code — that is interpretation, and
 * interpretation is how a label ends up 0.4 mm out with nobody able to say why.
 * layoutspec.js already replays the generator's OWN drawOnto() against a
 * recording context and reports every mark in millimetres. This consumes that,
 * so the PDF is produced by the same code path as the label on screen.
 *
 *
 * THE TYPEFACE IS THE REAL ONE, AND IT COSTS NOTHING
 * --------------------------------------------------
 * Each page already carries JioType Medium and Light as base64 TTFs, in the
 * @font-face rules the canvas draws with. jsPDF can embed a TTF from exactly
 * that — so the font is read back out of the page's own stylesheet and handed
 * to the PDF. No second copy, no extra download, and the PDF is set in the
 * face the label is actually printed in rather than in Helvetica.
 *
 * If the fonts cannot be read for any reason the text is still written, in
 * helvetica, and `report()` says so. A PDF with the right words in the wrong
 * face is recoverable; a picture is not.
 *
 *
 * WHAT STAYS A PICTURE, AND WHY THAT IS RIGHT
 * -------------------------------------------
 * The QR, the Code 128 and the placed marks (RoHS, WEEE, BIS) are graphics.
 * They are cropped from the rendered canvas at their own measured rectangle and
 * placed at the same spot, so they stay pixel-exact. Turning a barcode into
 * hundreds of vector rectangles would make it "editable" in a way nobody wants:
 * a barcode edited by hand is a barcode that no longer matches its value, which
 * is the whole defect this project exists to prevent.
 */
(function () {
'use strict';

/** The @font-face TTFs the page already carries, as base64. */
function pageFonts() {
  const out = {};
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch (e) { continue; }   // cross-origin
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      const fam = (rule.style.getPropertyValue('font-family') || '').replace(/['"]/g, '').trim();
      const src = rule.style.getPropertyValue('src') || '';
      const m = src.match(/base64,([A-Za-z0-9+/=]+)/);
      if (fam && m) out[fam] = m[1];
    }
  }
  return out;
}

/**
 * A CSS colour, as the canvas reported it, -> [r,g,b] 0-255.
 *
 * Only the forms these generators actually use: '#rgb', '#rrggbb', 'rgb(...)'
 * and the two names they write by hand. Anything unrecognised falls back to the
 * caller's default rather than guessing -- this is ink on a printed label, so an
 * unknown value must not quietly become white and vanish.
 */
function toRgb(css, fallback) {
  if (typeof css !== 'string') return fallback;
  const v = css.trim().toLowerCase();
  if (v === 'black') return [0, 0, 0];
  if (v === 'white') return [255, 255, 255];
  let m = v.match(/^#([0-9a-f]{3})$/);
  if (m) return [0, 1, 2].map((i) => parseInt(m[1][i] + m[1][i], 16));
  m = v.match(/^#([0-9a-f]{6})$/);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].substr(i, 2), 16));
  m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const n = m[1].split(',').map((x) => parseFloat(x));
    if (n.length >= 3 && n.every((x) => isFinite(x)))
      return [n[0], n[1], n[2]].map((x) => Math.max(0, Math.min(255, Math.round(x))));
  }
  return fallback;
}

/** Register those with jsPDF so doc.text() can use them. */
function embed(doc, notes) {
  const fonts = pageFonts();
  const map = {};
  for (const fam of Object.keys(fonts)) {
    try {
      const file = fam + '.ttf';
      doc.addFileToVFS(file, fonts[fam]);
      doc.addFont(file, fam, 'normal');
      map[fam] = fam;
    } catch (e) {
      notes.push('could not embed ' + fam + ': ' + e.message);
    }
  }
  if (!Object.keys(map).length) notes.push('no page font could be embedded — falling back to helvetica');
  return map;
}

/**
 * Crop one rectangle out of the rendered canvas, in millimetres.
 *
 * A generous margin is taken and then given back on placement, because a
 * barcode's quiet zone and a mark's antialiased edge both sit just outside the
 * measured box, and clipping them is visible.
 */
function crop(canvas, spec, it, padMm) {
  const sx = canvas.width / spec.label.widthMm;
  const sy = canvas.height / spec.label.heightMm;
  const pad = padMm || 0;
  const x = Math.max(0, Math.floor((it.xmm - pad) * sx));
  const y = Math.max(0, Math.floor((it.ymm - pad) * sy));
  const w = Math.min(canvas.width - x, Math.ceil((it.wmm + pad * 2) * sx));
  const h = Math.min(canvas.height - y, Math.ceil((it.hmm + pad * 2) * sy));
  if (w <= 0 || h <= 0) return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(canvas, x, y, w, h, 0, 0, w, h);
  return { url: c.toDataURL('image/png'), xmm: x / sx, ymm: y / sy, wmm: w / sx, hmm: h / sy };
}

/**
 * Build the PDF.
 *
 * @param {object}  o
 * @param {function} o.draw     the page's own drawOnto(canvas, scale)
 * @param {HTMLCanvasElement} o.canvas  the already-rendered label
 * @param {object}  o.jsPDF     the jsPDF constructor
 */
function build(o) {
  const notes = [];
  // LET capture() FIND THE ENTRY POINT ITSELF.
  //
  // Not every generator draws the same way: most have drawOnto(canvas, scale),
  // the MRP label has a no-argument draw(). layoutspec already resolves that —
  // it hooks getContext rather than passing a fake canvas, so the signature
  // stops mattering — and passing `drawOnto` in from the caller defeated it,
  // throwing "drawOnto is not defined" on the two MRP pages.
  const spec = globalThis.LabelLayout.capture(
    typeof o.draw === 'function' ? { draw: o.draw } : {});
  const L = spec.label;

  const doc = new o.jsPDF({
    orientation: L.widthMm >= L.heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [L.widthMm, L.heightMm],
    compress: true,
  });
  const have = embed(doc, notes);

  let text = 0, vector = 0, picture = 0;

  for (const it of spec.items) {
    if (it.kind === 'rect' || it.kind === 'path') {
      // PAINT IT THE COLOUR THE GENERATOR PAINTED IT. This was a flat
      // setFillColor(0) -- every rect black, whatever the canvas said -- and the
      // very first thing drawOnto() draws is the label's own WHITE ground:
      //   ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
      // so a downloaded PDF opened as a full-page BLACK rectangle with every
      // printed value invisible on top of it. The QR, the barcode and the placed
      // marks still showed, because each is an image carrying its own white
      // ground -- which is why the page looked half-right rather than empty, and
      // why a test that only asked "is the text in there?" passed it.
      const rgb = toRgb(it.color, [0, 0, 0]);
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      if (it.lineMm) doc.setLineWidth(it.lineMm);
      // A filled rect is artwork; an outlined one is the AF1 badge's border --
      // and that badge is a ROUNDED rectangle. Drawing it with doc.rect gave it
      // square corners, which is neither the artwork nor what the preview shows.
      const style = it.fill ? 'F' : 'S';
      if (it.rMm > 0) doc.roundedRect(it.xmm, it.ymm, it.wmm, it.hmm, it.rMm, it.rMm, style);
      else doc.rect(it.xmm, it.ymm, it.wmm, it.hmm, style);
      vector++;
      continue;
    }

    if (it.kind === 'code' || it.kind === 'image') {
      const c = crop(o.canvas, spec, it, it.kind === 'code' ? 0.4 : 0.1);
      if (c) { doc.addImage(c.url, 'PNG', c.xmm, c.ymm, c.wmm, c.hmm); picture++; }
      continue;
    }

    if (it.kind === 'text') {
      // Arial is NOT a page font and does not need to be. The standards lines
      // and the BIS block are specified in Arial, and Helvetica is its
      // metrically compatible counterpart and one of the PDF base fourteen —
      // so it needs no embedding and sets to the same widths. Reporting it as
      // "unavailable" was noise about a substitution that is correct.
      const SUBSTITUTE = { Arial: 'helvetica', Helvetica: 'helvetica' };
      let fam;
      if (have[it.font]) fam = it.font;
      else if (SUBSTITUTE[it.font]) fam = SUBSTITUTE[it.font];
      else {
        fam = 'helvetica';
        if (it.font && notes.indexOf('font ' + it.font + ' unavailable') === -1)
          notes.push('font ' + it.font + ' unavailable');
      }
      doc.setFont(fam, 'normal');
      doc.setFontSize(it.pt || 4.5);
      const trgb = toRgb(it.color, [0, 0, 0]);
      doc.setTextColor(trgb[0], trgb[1], trgb[2]);
      // layoutspec reports the LEFT edge and the BASELINE, which is exactly
      // what doc.text() wants — so no alignment guess is made here.
      //
      // baselineMm, NOT ymm: ymm is the point the canvas drew FROM, which for
      // a run set with textBaseline 'middle' -- the AF1 plant badge -- is the
      // middle of the run, not its baseline. Passing it as a baseline lifted
      // that text about half a cap-height inside its box.
      // A run the generator condensed -- ctx.scale(k,1) about its own origin,
      // which layoutspec reports as `condensed` -- is reproduced with the PDF's
      // own horizontal-scale operator, so the document matches the canvas
      // instead of setting the run at its natural width and overrunning.
      //
      // ALWAYS passed, never only when condensed: Tz is text state that
      // persists through the content stream, so a single condensed run would go
      // on squeezing every run drawn after it.
      const opts = { horizontalScale: it.condensed || 1 };
      doc.text(String(it.text), it.leftMm,
               it.baselineMm === undefined ? it.ymm : it.baselineMm, opts);
      text++;
    }
  }

  return { doc: doc, notes: notes, counts: { text: text, vector: vector, picture: picture }, spec: spec };
}

globalThis.VectorPDF = { build: build, pageFonts: pageFonts };
})();

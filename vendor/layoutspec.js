/* layoutspec.js — make the generator emit its OWN layout, in millimetres.
 *
 * Classic script. Load after the generator's own code. Exposes
 * globalThis.LabelLayout.
 *
 *
 * WHY THIS EXISTS
 * ---------------
 * A BarTender or CODESOFT template has to reproduce this generator's approved
 * design exactly — same positions, same fonts, same point sizes, same barcode
 * dimensions. Somebody has to author that template once per label type.
 *
 * The wrong way to give them the numbers is for a person to read the drawing
 * code and write them down. That is interpretation, and interpretation is how a
 * label ends up 0.4 mm out with nobody able to say why.
 *
 * So the numbers come from the generator itself. `capture()` runs the REAL
 * `drawOnto()` against a recording context that implements enough of the canvas
 * 2D API to be indistinguishable from one, notes every mark it makes, and
 * converts the device pixels back to millimetres. What comes out is not a
 * description of the layout — it IS the layout, produced by the same code path
 * that renders the label the operator approves on screen.
 *
 * `measureText` delegates to a real canvas context, because the drawing code
 * positions each value by measuring the width of its heading. A stub returning
 * zero would silently move every value on the label.
 */
(function () {
'use strict';

/* ------------------------------------------------------------- 2D matrix */

// [a c e]
// [b d f]   as {a,b,c,d,e,f}, matching the canvas transform.
const I = () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });

function mul(m, n) {
  return {
    a: m.a * n.a + m.c * n.b,
    b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d,
    d: m.b * n.c + m.d * n.d,
    e: m.a * n.e + m.c * n.f + m.e,
    f: m.b * n.e + m.d * n.f + m.f,
  };
}

const apply = (m, x, y) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });

/* --------------------------------------------------------------- recorder */

/**
 * A canvas 2D context that draws nothing and remembers everything.
 *
 * Only the operations this generator actually uses are recorded; the rest are
 * accepted and ignored so the drawing code runs unchanged. `measureText` is
 * real — see the note at the top of the file.
 */
function Recorder(realCtx, width, height) {
  const ops = [];
  let m = I();
  const stack = [];

  const rec = {
    // state the drawing code reads back
    font: '10px sans-serif',
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'alphabetic',
    canvas: { width: width, height: height },

    // ---- transform ----
    save() { stack.push({ m: m, font: this.font, align: this.textAlign, baseline: this.textBaseline,
                          fill: this.fillStyle, stroke: this.strokeStyle }); },
    restore() {
      const s = stack.pop();
      if (s) { m = s.m; this.font = s.font; this.textAlign = s.align; this.textBaseline = s.baseline;
               this.fillStyle = s.fill; this.strokeStyle = s.stroke; }
    },
    setTransform(a, b, c, d, e, f) { m = { a: a, b: b, c: c, d: d, e: e, f: f }; },
    resetTransform() { m = I(); },
    translate(x, y) { m = mul(m, { a: 1, b: 0, c: 0, d: 1, e: x, f: y }); },
    scale(x, y) { m = mul(m, { a: x, b: 0, c: 0, d: y, e: 0, f: 0 }); },
    rotate(r) {
      const c = Math.cos(r), s = Math.sin(r);
      m = mul(m, { a: c, b: s, c: -s, d: c, e: 0, f: 0 });
    },

    // ---- text ----
    measureText(t) { realCtx.font = this.font; return realCtx.measureText(t); },
    fillText(t, x, y) {
      const p = apply(m, x, y);
      // Measure the run as it is actually drawn: its width, and its ASCENT --
      // how far the ink rises above the baseline. A label program places a text
      // box by its TOP, a canvas draws from the BASELINE, and the difference is
      // the ascent. Reporting it here means the consumer converts with a
      // measurement instead of guessing a cap-height ratio.
      realCtx.font = this.font;
      realCtx.textBaseline = 'alphabetic';
      const M = realCtx.measureText(String(t));
      // WHERE THE ALPHABETIC BASELINE ACTUALLY IS. A canvas draws relative to
      // whatever textBaseline is set -- the AF1 plant badge uses 'middle', so
      // its y is the MIDDLE of the run, not its baseline. A consumer that wants
      // a baseline (a PDF's doc.text does) must not be handed that number raw:
      // it sets the badge about half a cap-height too high inside its box.
      //
      // Measured, not derived from a ratio: actualBoundingBoxAscent is reported
      // FROM the current textBaseline, so reading it under both settings gives
      // the distance between the two lines directly.
      let baseDy = 0;
      const tb = this.textBaseline;
      if (tb && tb !== 'alphabetic') {
        realCtx.textBaseline = tb;
        const B = realCtx.measureText(String(t));
        baseDy = (M.actualBoundingBoxAscent || 0) - (B.actualBoundingBoxAscent || 0);
        realCtx.textBaseline = 'alphabetic';
      }
      ops.push({ kind: 'text', text: String(t), x: p.x, y: p.y,
                 font: this.font, align: this.textAlign, baseline: this.textBaseline,
                 color: this.fillStyle,
                 scaleX: m.a,
                 w: (M.width || 0) * m.a,
                 baseDy: baseDy * m.d,
                 ascent: (M.actualBoundingBoxAscent || 0) * m.d,
                 descent: (M.actualBoundingBoxDescent || 0) * m.d });
    },
    strokeText(t, x, y) { this.fillText(t, x, y); },

    // ---- shapes ----
    fillRect(x, y, w, h) {
      const p = apply(m, x, y);
      // `_codeValue` is set while the page's own drawBarcode() runs, so the bars
      // it emits carry the string they encode. Without it every collapsed
      // barcode reached the template with no value of its own, and the builder
      // wrote ONE value into all of them: the carton came out with its MSN
      // barcode, its EAN barcode and all ten unit barcodes encoding the same
      // serial, while the ten text objects beside them read correctly.
      ops.push({ kind: 'rect', fill: true, x: p.x, y: p.y, w: w * m.a, h: h * m.d,
                 color: this.fillStyle, codeValue: rec._codeValue });
    },
    strokeRect(x, y, w, h) {
      const p = apply(m, x, y);
      ops.push({ kind: 'rect', fill: false, x: p.x, y: p.y, w: w * m.a, h: h * m.d,
                 color: this.strokeStyle, lineWidth: this.lineWidth * m.a });
    },
    clearRect() {},
    drawImage(img, ...a) {
      // (img, dx, dy) | (img, dx, dy, dw, dh) | (img, sx,sy,sw,sh, dx,dy,dw,dh)
      let dx, dy, dw, dh;
      if (a.length >= 8) { dx = a[4]; dy = a[5]; dw = a[6]; dh = a[7]; }
      else if (a.length >= 4) { dx = a[0]; dy = a[1]; dw = a[2]; dh = a[3]; }
      else { dx = a[0]; dy = a[1]; dw = img.width || 0; dh = img.height || 0; }
      const p = apply(m, dx, dy);
      // A barcode rendered by JsBarcode arrives here as a CANVAS, not as bars,
      // so the module-run collapsing downstream cannot see it and it was
      // recorded as a picture. A template built from that embeds the barcode as
      // an IMAGE -- fixed pixels, not an editable barcode object, which is the
      // one thing this whole exercise exists to avoid. capture() tags the canvas
      // with the value and symbology it was given; here that tag turns it back
      // into a code.
      if (img && img.__code) {
        ops.push({ kind: 'code', x: p.x, y: p.y, w: dw * m.a, h: dh * m.d,
                   symbology: img.__code.symbology, value: img.__code.value,
                   drawnAs: 'image', modules: 0, moduleW: 0, moduleH: 0 });
        return;
      }
      ops.push({ kind: 'image', name: imageName(img),
                 x: p.x, y: p.y, w: dw * m.a, h: dh * m.d });
    },

    // ---- paths: collected as a bounding box, which is all a template needs ----
    beginPath() { this._path = null; this._pathR = 0; },
    closePath() {},
    moveTo(x, y) { this._pt(x, y); },
    lineTo(x, y) { this._pt(x, y); },
    arc(x, y, r) { this._pt(x - r, y - r); this._pt(x + r, y + r); },
    // The RADIUS matters, not only where the corner is. A bounding box is all a
    // BarTender template needs, but a PDF is a RENDERING: dropping the radius
    // turned the AF1 badge's rounded rectangle into a square one.
    arcTo(x1, y1, x2, y2, r) {
      this._pt(x1, y1); this._pt(x2, y2);
      if (r > 0) this._pathR = Math.max(this._pathR || 0, r);
    },
    quadraticCurveTo(cx, cy, x, y) { this._pt(x, y); },
    bezierCurveTo(a1, b1, c1, d1, x, y) { this._pt(x, y); },
    rect(x, y, w, h) { this._pt(x, y); this._pt(x + w, y + h); },
    roundRect(x, y, w, h, r) {
      this._pt(x, y); this._pt(x + w, y + h);
      const v = Array.isArray(r) ? r[0] : r;
      if (v > 0) this._pathR = Math.max(this._pathR || 0, v);
    },
    _pt(x, y) {
      const p = apply(m, x, y);
      const b = this._path || (this._path = { x0: p.x, y0: p.y, x1: p.x, y1: p.y });
      b.x0 = Math.min(b.x0, p.x); b.y0 = Math.min(b.y0, p.y);
      b.x1 = Math.max(b.x1, p.x); b.y1 = Math.max(b.y1, p.y);
    },
    fill() { this._flushPath(true); },
    stroke() { this._flushPath(false); },
    _flushPath(filled) {
      const b = this._path;
      if (!b) return;
      ops.push({ kind: 'path', fill: filled, x: b.x0, y: b.y0,
                 w: b.x1 - b.x0, h: b.y1 - b.y0,
                 radius: (this._pathR || 0) * m.a,
                 color: filled ? this.fillStyle : this.strokeStyle,
                 lineWidth: this.lineWidth * m.a });
      this._path = null;
      this._pathR = 0;
    },

    // accepted and ignored
    clip() {}, setLineDash() {}, createLinearGradient() { return { addColorStop() {} }; },

    _ops: ops,
  };
  return rec;
}

/** Best-effort name for a drawn image, so the sheet says what it is. */
function imageName(img) {
  if (!img) return 'image';
  if (img.id) return img.id;
  if (img.__name) return img.__name;
  if (img.tagName === 'CANVAS') return 'canvas (QR or barcode)';
  const src = String(img.src || '');
  // A data: URI has no name — its tail is base64, which is worse than nothing
  // in a build sheet a person has to read.
  if (/^data:/i.test(src)) return 'embedded image';
  const m = /([^/\\]+?)(\.[a-z]+)?$/i.exec(src.split('?')[0]);
  return m ? m[1].slice(0, 40) : 'image';
}

/**
 * Collapse a run of tiny rectangles into the ONE object they really are.
 *
 * A QR is drawn module by module and a Code 128 bar by bar, so the recorder
 * faithfully reports four hundred rectangles. That is true and useless: a
 * template carries a single barcode object with a symbology and a size, and
 * nobody can author one from a list of squares.
 *
 * Runs are identified structurally, never by which generator drew them — many
 * small filled rects, adjacent in the op stream, inside one bounding box. The
 * aspect ratio then says which kind it is, the same way it does everywhere else
 * in this project: a 1D symbol is far wider than it is tall, a QR is square.
 */
function collapseCodes(ops, minRun, labelW) {
  // A MODULE candidate is a filled rect narrow enough to be one bar or one QR
  // cell. The width test is what makes the run detection work: the label's white
  // background is also a filled rect, and on the RSN label it sat immediately
  // before the code in the op stream. Including it made the run's bounding box
  // the whole label, the "each rect is small relative to the run" test failed,
  // and 2189 module rectangles came through uncollapsed.
  //
  // Width only, never height: a Code 128 bar is thin and TALL, so a height test
  // would reject the very thing this is for.
  const narrow = Math.max(2, labelW / 25);
  const isModule = (o) => o.kind === 'rect' && o.fill && o.w > 0 && o.w <= narrow;

  const out = [];
  let i = 0;
  while (i < ops.length) {
    if (!isModule(ops[i])) { out.push(ops[i++]); continue; }
    // Consecutive in the OP STREAM is not the same as one code. A page draws
    // its barcodes and its QR back to back, all as filled rects with nothing
    // between them, so a purely sequential run swallowed the lot: the pallet
    // came back as ONE object of 1959 modules where the label carries a Pallet
    // No. barcode, an EAN barcode and a QR, and the device as one where it
    // carries two. A template built from that is missing its barcodes.
    //
    // So a run is also cut where it jumps somewhere else on the label. A QR's
    // modules step back to the left on every new row, which is why the test is
    // against the cluster's BOUNDING BOX rather than against the previous rect
    // -- the next module of the same code always lands on or near that box.
    // How far away still counts as the same code, taken from the code's OWN
    // module width as the cluster grows -- not from `narrow`, which is a loose
    // upper bound (a 25th of the label) and on the carton reached 17 mm, wide
    // enough to swallow the next barcode 10 mm below. Three of the carton's ten
    // unit barcodes came through as a single 138-module "QR" that way.
    //
    // Module WIDTH, never height: a Code 128 bar is 0.35 mm wide and 5 mm tall,
    // and a reach built from its height merges the whole column again. A QR's
    // rows step down by about one module width, so this holds for both.
    // The two axes need different rules, and one shared number gets both wrong.
    //
    //   ACROSS  the bars of one Code 128 are separated by spaces of up to four
    //           modules, so the reach must clear that -- but two barcodes side
    //           by side on the pallet are 25 mm apart, so it must not clear THAT.
    //   DOWN    every bar of one barcode shares the same Y band, and a QR's next
    //           row sits directly against the last. So almost no reach is needed,
    //           and the carton's ten unit barcodes -- stacked 10 mm apart -- are
    //           separated by exactly this.
    //
    // Both are taken from the code's own module size as the cluster grows, never
    // from a fraction of the label: `narrow` is a loose upper bound and at 17 mm
    // it swallowed the next barcode down.
    let reachX = 0, reachY = 0;
    let j = i;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, maxW = 0, maxH = 0;
    while (j < ops.length && isModule(ops[j])) {
      const o = ops[j];
      if (j > i &&
          (o.x > x1 + reachX || o.x + o.w < x0 - reachX ||
           o.y > y1 + reachY || o.y + o.h < y0 - reachY)) break;
      x0 = Math.min(x0, o.x); y0 = Math.min(y0, o.y);
      x1 = Math.max(x1, o.x + o.w); y1 = Math.max(y1, o.y + o.h);
      maxW = Math.max(maxW, o.w); maxH = Math.max(maxH, o.h);
      reachX = Math.max(2, maxW * 8);
      reachY = Math.max(2, maxH * 0.6);
      j++;
    }
    const n = j - i, w = x1 - x0, h = y1 - y0;
    if (n >= minRun && h > 0) {
      out.push({ kind: 'code', x: x0, y: y0, w: w, h: h, modules: n,
                 symbology: w / h > 2.5 ? 'Code 128 (1D)' : 'QR (2D)',
                 value: ops[i].codeValue,
                 moduleW: maxW, moduleH: maxH });
    } else {
      for (let k = i; k < j; k++) out.push(ops[k]);
    }
    i = j;
  }
  return out;
}

/* ---------------------------------------------------------------- capture */

/** px -> mm, using the generator's own scale constant. */
function mmOf(px, mms) { return px / mms; }

/** "28.1px JioTypeMedium" -> { family:'JioTypeMedium', pt: 4.5 } */
function parseFont(font, pts) {
  const m = /^\s*(?:(\w+)\s+)?([\d.]+)px\s+(.+)$/.exec(font || '');
  if (!m) return { family: (font || '').trim(), pt: null };
  return { family: m[3].replace(/['"]/g, '').trim(), pt: +(parseFloat(m[2]) / pts).toFixed(2) };
}

/**
 * Run the generator's real draw path and return its layout in millimetres.
 *
 * @param {object} [opt]
 * @param {function} [opt.draw]  defaults to the page's global drawOnto
 * @param {number} [opt.mms]     px per mm at scale 1; defaults to global MMS
 * @param {number} [opt.pts]     px per pt; defaults to global PTS
 */
function capture(opt) {
  opt = opt || {};
  // A top-level `const` in a classic script lands in the global LEXICAL scope,
  // not on globalThis — so `MMS` resolves as a bare identifier from another
  // classic script while `globalThis.MMS` is undefined. `function drawOnto`
  // does become a globalThis property, which is why only the constants need
  // this. Reading them the wrong way is what made the first run report the
  // page as not exposing a layout at all.
  // Not every generator exposes the same entry point: most have
  // `drawOnto(canvas, scale)`, the MRP label has a no-argument `draw()`. Both
  // are supported by hooking getContext (below) rather than by passing a fake
  // canvas, so the signature stops mattering.
  const draw = opt.draw ||
    (typeof drawOnto !== 'undefined' ? drawOnto : undefined) ||
    globalThis.drawOnto ||
    (typeof globalThis.draw === 'function' ? globalThis.draw : undefined);
  const mms = opt.mms || (typeof MMS !== 'undefined' ? MMS : globalThis.MMS);
  const pts = opt.pts || (typeof PTS !== 'undefined' ? PTS : globalThis.PTS);
  if (typeof draw !== 'function' || !mms || !pts) {
    throw new Error('layoutspec: this page does not expose drawOnto / MMS / PTS.');
  }

  const real = document.createElement('canvas').getContext('2d');
  const src = document.getElementById('label');
  const w = src ? src.width : Math.round(45.6 * mms);
  const h = src ? src.height : Math.round(29.6 * mms);

  const rec = Recorder(real, w, h);

  // Hook getContext on the LABEL canvas only, then call the generator's own
  // draw entry point. This works whether it takes a canvas argument or fetches
  // the canvas itself, and it guarantees the recorder sees the same call
  // sequence the real render makes — the whole point of capturing rather than
  // transcribing. Restored in a finally, so a throw cannot leave the page with
  // a canvas that no longer draws.
  const proto = HTMLCanvasElement.prototype;
  const origGet = proto.getContext;
  proto.getContext = function (type) {
    if (this === src && String(type) === '2d') return rec;
    return origGet.apply(this, arguments);
  };
  // Tag whatever JsBarcode draws into, so drawImage can recover the VALUE and
  // the symbology. Reading them off the rendered bars would mean decoding our
  // own barcode; taking them from the call that made it is exact.
  // Name the marks. Every generator keeps its loaded images in one object keyed
  // by what they are -- imgs.rohs, imgs.weee, imgs.bis, imgs.dc -- but they are
  // loaded from data: URIs, whose tail is base64, so the recorder could only
  // call them "embedded image". The builder places a mark by NAME, so the MRP
  // label lost all three of its marks and the carton both of its own, silently:
  // they were counted as "skipped".
  const named = [];
  try {
    const bag = (typeof imgs !== 'undefined' ? imgs : globalThis.imgs);
    if (bag && typeof bag === 'object') {
      for (const k of Object.keys(bag)) {
        const im = bag[k];
        if (im && typeof im === 'object' && !im.__name) { im.__name = k; named.push(im); }
      }
    }
  } catch (e) { /* a page with no such bag simply has nothing to name */ }

  // The other way a generator draws a barcode: its own drawBarcode(ctx, text,
  // ...), bar by bar. Those bars ARE recorded, but nothing said what they spell.
  const origDraw = globalThis.drawBarcode;
  if (typeof origDraw === 'function') {
    globalThis.drawBarcode = function (c, text) {
      rec._codeValue = String(text);
      try { return origDraw.apply(this, arguments); }
      finally { rec._codeValue = undefined; }
    };
  }
  const origBar = globalThis.JsBarcode;
  if (typeof origBar === 'function') {
    globalThis.JsBarcode = function (el, text, o) {
      const r = origBar.apply(this, arguments);
      try {
        if (el && typeof el === 'object') {
          el.__code = { value: String(text),
                        symbology: (o && o.format) || 'CODE128' };
        }
      } catch (e) { /* a frozen element is not worth failing a capture over */ }
      return r;
    };
  }
  try {
    draw(src || { width: w, height: h, getContext: () => rec }, 1);
  } finally {
    proto.getContext = origGet;
    if (typeof origBar === 'function') globalThis.JsBarcode = origBar;
    if (typeof origDraw === 'function') globalThis.drawBarcode = origDraw;
    for (const im of named) { try { delete im.__name; } catch (e) {} }
  }

  const items = collapseCodes(rec._ops, 20, w).map((o) => {
    const base = {
      kind: o.kind,
      xmm: +mmOf(o.x, mms).toFixed(2),
      ymm: +mmOf(o.y, mms).toFixed(2),
    };
    if (o.kind === 'text') {
      const f = parseFont(o.font, pts);
      const wMm = +mmOf(o.w || 0, mms).toFixed(2);
      // The LEFT edge, derived from the draw point and the alignment the
      // generator actually used. Five runs on the device label are centred, so
      // their x is the CENTRE -- using it as a left edge shifts each of them
      // right by half its width, which is exactly what went wrong downstream.
      const leftMm = o.align === 'center' ? +(base.xmm - wMm / 2).toFixed(2)
                   : o.align === 'right'  ? +(base.xmm - wMm).toFixed(2)
                   : base.xmm;
      return Object.assign(base, {
        text: o.text, font: f.family, pt: f.pt,
        align: o.align, baseline: o.baseline,
        color: o.color,
        widthMm: wMm,
        leftMm: leftMm,
        // measured, not assumed: the ink's rise above the baseline, so a
        // consumer that positions by the top needs no cap-height guess
        ascentMm: +mmOf(o.ascent || 0, mms).toFixed(3),
        // the ALPHABETIC baseline, whatever textBaseline the page drew with
        baselineMm: +(base.ymm + mmOf(o.baseDy || 0, mms)).toFixed(3),
        topMm: +(base.ymm + mmOf((o.baseDy || 0) - (o.ascent || 0), mms)).toFixed(3),
        condensed: o.scaleX && Math.abs(o.scaleX - 1) > 0.001 ? +o.scaleX.toFixed(3) : undefined,
      });
    }
    if (o.kind === 'code') {
      return Object.assign(base, {
        name: o.symbology,
        wmm: +mmOf(o.w, mms).toFixed(2),
        hmm: +mmOf(o.h, mms).toFixed(2),
        modules: o.modules,
        moduleWmm: +mmOf(o.moduleW, mms).toFixed(3),
        // present only where the code was drawn from a known value -- a
        // module-run collapse has bars and no text to read back
        value: o.value,
        drawnAs: o.drawnAs,
      });
    }
    return Object.assign(base, {
      name: o.name,
      wmm: +mmOf(o.w, mms).toFixed(2),
      hmm: +mmOf(o.h, mms).toFixed(2),
      fill: o.fill,
      color: o.color,
      rMm: o.radius ? +mmOf(o.radius, mms).toFixed(2) : undefined,
      lineMm: o.lineWidth ? +mmOf(o.lineWidth, mms).toFixed(2) : undefined,
    });
  });

  return {
    label: {
      widthMm: +mmOf(w, mms).toFixed(2),
      heightMm: +mmOf(h, mms).toFixed(2),
      dpi: Math.round(mms * 25.4),
      pxWidth: w, pxHeight: h,
      title: document.title,
    },
    items: items,
  };
}

/** A build sheet a person can type into BarTender or CODESOFT. */
function toText(spec) {
  const L = spec.label;
  const out = [];
  out.push('TEMPLATE BUILD SHEET  —  ' + L.title);
  out.push('='.repeat(78));
  out.push(`Label ${L.widthMm} x ${L.heightMm} mm   ${L.dpi} DPI   (${L.pxWidth} x ${L.pxHeight} px)`);
  out.push('All coordinates are millimetres from the TOP-LEFT of the label.');
  out.push('Text coordinates are the BASELINE-LEFT of the run, as drawn.');
  out.push('');
  out.push('  #  TYPE   X       Y       W       H      FONT / DETAIL');
  out.push('-'.repeat(78));
  spec.items.forEach((it, i) => {
    const n = String(i + 1).padStart(3);
    const x = String(it.xmm).padStart(7), y = String(it.ymm).padStart(7);
    if (it.kind === 'text') {
      const w = String(it.widthMm).padStart(7);
      out.push(`${n}  text ${x} ${y} ${w}      -  ${it.font} ${it.pt}pt` +
               (it.condensed ? ` (condensed x${it.condensed})` : ''));
      out.push(`                                          "${it.text}"`);
    } else {
      const w = String(it.wmm).padStart(7), h = String(it.hmm).padStart(6);
      out.push(`${n}  ${it.kind.padEnd(5)}${x} ${y} ${w} ${h}  ${it.name || ''}` +
               (it.lineMm ? `  line ${it.lineMm}mm` : '') +
               (it.modules ? `  ${it.modules} modules, narrowest ${it.moduleWmm}mm` : ''));
    }
  });
  out.push('-'.repeat(78));
  out.push(`${spec.items.length} objects.`);
  return out.join('\n');
}

globalThis.LabelLayout = { capture, toText };
})();

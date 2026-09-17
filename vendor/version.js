/* version.js — what build this is, and what changed in it.
 *
 * ONE source of truth for all 31 pages. The version is stamped into each page's
 * header sub-line as a link, and the notes are rendered on release-notes.html.
 *
 * The notes are INLINE rather than fetched from a .json beside this file: these
 * pages are opened straight off disk, and a file:// page may not fetch a sibling
 * — it would fail silently and the page would show an empty list. A <script src>
 * is the one thing that does load from disk, so the data travels inside one.
 *
 * Every note carries BOTH languages. They are not in the translation dictionary
 * because they are content rather than interface: the dictionary translates a
 * string it recognises, and a note added next month would simply stay English.
 * Rendering from a pair means a note cannot be added in one language only.
 */
(function () {
'use strict';

var VERSION = "1.2.0";
var RELEASED = "2026-09-17";

var NOTES = [
  { v: "1.2.0", date: "2026-09-17", items: [
    ["Chinese now covers the whole interface, including validation and error messages.",
     "中文现已覆盖整个界面，包括校验与错误提示。"],
    ["Domain terms carry their English term, so no field can be read as the wrong one.",
     "领域术语同时标注英文原词，避免字段对应错误。"],
    ["RSN reference serials set per vendor, with the variable characters marked in red.",
     "按供应商设定参考序列号，可变字符以红色标示。"],
    ["PDF export and download filenames corrected.",
     "修正 PDF 导出与下载文件名。"]
  ] },
  { v: "1.1.0", date: "2026-09-16", items: [
    ["Added Skyquad as a third vendor, taking the generators from twenty to thirty.",
     "新增第三家供应商 Skyquad，生成器由 20 个增至 30 个。"],
    ["Download PDF now produces an editable document rather than a picture.",
     "下载 PDF 现生成可编辑文档，而非图片。"],
    ["Added an English / 中文 language toggle. The label artwork stays English.",
     "新增 English / 中文 语言切换。标签图稿保持英文。"]
  ] },
  { v: "1.0.0", date: "", items: [
    ["Twenty offline generators: two plants, two vendors, five label types.",
     "20 个离线生成器：2 个工厂、2 家供应商、5 种标签类型。"],
    ["Live preview, validation summary and PNG / JPG / PDF download.",
     "实时预览、校验摘要及 PNG / JPG / PDF 下载。"]
  ] }
];

/* The page's own language, as i18n.js leaves it on <html>. Reading the DOM
   rather than calling into I18N keeps this file independent of load order. */
function lang() {
  return (document.documentElement.lang || 'en').indexOf('zh') === 0 ? 1 : 0;
}

/* Where the root is, worked out from this script's own src, so the link is
   right whether the page sits at the root or three levels down. */
var here = (document.currentScript && document.currentScript.src) || '';
var cut = here.lastIndexOf('vendor/version.js');
var ROOT = cut >= 0 ? here.slice(0, cut) : '';

var UI = {
  notes:   ['Release notes', '版本说明'],
  version: ['Version', '版本'],
  back:    ['All builds', '全部版本 (All builds)'],
  current: ['current', '当前版本'],
  title:   ['Skyworth Label Generator', '创维标签生成器']
};

/* Its own style, injected once. The alternative is the same rule pasted into
   thirty-one stylesheets, which is how two copies come to disagree. */
function style() {
  if (document.getElementById('verCss')) return;
  var el = document.createElement('style');
  el.id = 'verCss';
  el.textContent = '.ver-link{color:inherit;text-decoration:none;border-bottom:1px dotted currentColor;'
    + 'opacity:.85}.ver-link:hover{opacity:1;border-bottom-style:solid}';
  document.head.appendChild(el);
}

function stamp() {
  style();
  var sub = document.querySelector('.h-sub');
  if (sub && !sub.querySelector('.ver-link')) {
    var a = document.createElement('a');
    a.className = 'ver-link';
    a.href = ROOT + 'release-notes.html';
    a.textContent = 'v' + VERSION;
    sub.appendChild(document.createTextNode(' · '));
    sub.appendChild(a);
  }
  // the portal has no h-sub; it carries the version in its footer instead
  var copy = document.querySelector('.f-copy');
  if (copy) {
    // Created once, but its TEXT is rewritten every time -- it carries the words
    // "Release notes", which change with the language. Guarding the whole block
    // on "does the link exist" left it in English after a switch.
    var l = copy.querySelector('.ver-link');
    if (!l) {
      var d = document.createElement('div');
      l = document.createElement('a');
      l.className = 'ver-link';
      l.href = ROOT + 'release-notes.html';
      d.appendChild(l);
      copy.appendChild(d);
    }
    l.textContent = 'v' + VERSION + ' — ' + UI.notes[lang()];
  }
}

function render() {
  var host = document.getElementById('releaseNotes');
  if (!host) return;
  var i = lang();
  host.innerHTML = '';
  NOTES.forEach(function (rel) {
    var sec = document.createElement('section');
    sec.className = 'rel';
    var h = document.createElement('h2');
    h.textContent = 'v' + rel.v;
    if (rel.date) {
      var s = document.createElement('span');
      s.className = 'rel-date';
      s.textContent = rel.date;
      h.appendChild(s);
    }
    if (rel.v === VERSION) {
      var c = document.createElement('span');
      c.className = 'rel-now';
      c.textContent = UI.current[i];
      h.appendChild(c);
    }
    sec.appendChild(h);
    var ul = document.createElement('ul');
    rel.items.forEach(function (pair) {
      var li = document.createElement('li');
      li.textContent = pair[i];
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    host.appendChild(sec);
  });
  var t = document.getElementById('rnTitle');
  if (t) t.textContent = UI.notes[i];
  var b = document.getElementById('rnBack');
  if (b) b.textContent = UI.back[i];
  document.title = UI.notes[i] + ' — ' + UI.title[i];
}

function boot() { stamp(); render(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* Re-render when the language changes. i18n.js sets <html lang>, so watching
   that attribute keeps the two files decoupled -- neither has to know the
   other's load order or call into it. */
new MutationObserver(function () { render(); stamp(); })
  .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

globalThis.AppVersion = { version: VERSION, released: RELEASED, notes: NOTES };
})();

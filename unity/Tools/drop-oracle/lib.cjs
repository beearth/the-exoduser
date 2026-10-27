// Shared extraction helpers for the D01 drop oracle: locate original declarations in game.html by text anchor and evaluate them unchanged.
const fs = require('fs'), vm = require('vm'), crypto = require('crypto');
function load(path) { const text = fs.readFileSync(path, 'utf8'); return { text, sha: crypto.createHash('sha256').update(text).digest('hex'), lines: text.split('\n') }; }
function matchEnd(src, i, open, close) {
  let depth = 0, str = null;
  for (let j = i; j < src.length; j++) {
    const ch = src[j];
    if (str) { if (ch === '\\') j++; else if (ch === str) str = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { str = ch; continue; }
    if (ch === '/' && src[j + 1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
    if (ch === open) depth++; else if (ch === close) { depth--; if (depth === 0) return j; }
  }
  throw new Error('unbalanced');
}
// text of `const NAME=<literal>` (literal only), optionally searching from a text position
function literal(src, head, from = 0) {
  const at = src.indexOf(head, from); if (at < 0) throw new Error('missing ' + head);
  const i = at + head.length, open = src[i], close = open === '{' ? '}' : open === '[' ? ']' : null;
  if (!close) throw new Error('not a literal ' + head);
  const end = matchEnd(src, i, open, close) + 1;
  return { text: src.slice(i, end), start: at, end };
}
const evalLiteral = (t, ctx = {}) => vm.runInNewContext('(' + t + ')', ctx);
// full text of `function NAME(...){...}`
function fn(src, name) {
  const at = src.indexOf('function ' + name + '('); if (at < 0) throw new Error('missing function ' + name);
  const b = src.indexOf('{', src.indexOf(')', at)); return src.slice(at, matchEnd(src, b, '{', '}') + 1);
}
module.exports = { load, literal, evalLiteral, fn, matchEnd };

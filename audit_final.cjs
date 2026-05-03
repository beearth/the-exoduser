const fs = require('fs');
const path = require('path');

const BASE = 'G:/hell';

// ── 따옴표 쌍 읽기 (single or double) ──────────────────────────────────
function readQuoted(src, pos) {
  const q = src[pos];
  if (q !== "'" && q !== '"') return null;
  let i = pos + 1, s = '';
  while (i < src.length) {
    if (src[i] === '\\') { s += src[i+1]; i += 2; continue; }
    if (src[i] === q) return { val: s, end: i };
    s += src[i++];
  }
  return null;
}

// ── 블록 파싱: { ... } 안에서 'key':'val' 추출 ─────────────────────────
function parseBlock(src, blockStart) {
  const keys = {};
  let i = blockStart;
  while (i < src.length) {
    if (/[\s,]/.test(src[i])) { i++; continue; }
    if (src[i] === '}') break;
    if (src[i] === '/' && src[i+1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (src[i] === "'" || src[i] === '"') {
      const kRes = readQuoted(src, i);
      if (!kRes) { i++; continue; }
      i = kRes.end + 1;
      while (i < src.length && /[\s:]/.test(src[i])) i++;
      if (src[i] === "'" || src[i] === '"') {
        const vRes = readQuoted(src, i);
        if (vRes) {
          keys[kRes.val] = vRes.val;
          i = vRes.end + 1;
          continue;
        }
      }
    }
    i++;
  }
  return keys;
}

function extractTable(src, varName) {
  const marker = `const ${varName}={`;
  const idx = src.indexOf(marker);
  if (idx === -1) return null;
  const braceStart = src.indexOf('{', idx + marker.length - 1);
  if (braceStart === -1) return null;
  return parseBlock(src, braceStart + 1);
}

const gameHtml = fs.readFileSync(path.join(BASE, 'game.html'), 'utf8');
const enMain  = extractTable(gameHtml, '_EN');
const enPfx   = extractTable(gameHtml, '_EN_PFX');
const enBase  = extractTable(gameHtml, '_EN_BASE');

const enMainKeys  = new Set(Object.keys(enMain  || {}));
const enPfxKeys   = new Set(Object.keys(enPfx   || {}));
const enBaseKeys  = new Set(Object.keys(enBase  || {}));

console.log(`_EN main: ${enMainKeys.size}  _EN_PFX: ${enPfxKeys.size}  _EN_BASE: ${enBaseKeys.size}`);

const LANGS = [
  {code:'zh',  up:'ZH'},   {code:'ja',  up:'JA'},   {code:'es',  up:'ES'},
  {code:'zht', up:'ZHT'},  {code:'ru',  up:'RU'},   {code:'de',  up:'DE'},
  {code:'ptbr',up:'PTBR'}, {code:'fr',  up:'FR'},   {code:'pl',  up:'PL'},
  {code:'it',  up:'IT'},   {code:'uk',  up:'UK'},   {code:'tr',  up:'TR'},
  {code:'vi',  up:'VI'},   {code:'th',  up:'TH'},   {code:'id',  up:'ID'},
  {code:'ar',  up:'AR'},   {code:'sv',  up:'SV'},   {code:'da',  up:'DA'},
  {code:'no',  up:'NO'},   {code:'fi',  up:'FI'},   {code:'cs',  up:'CS'},
  {code:'hu',  up:'HU'},   {code:'ro',  up:'RO'},   {code:'nl',  up:'NL'},
  {code:'el',  up:'EL'},   {code:'bg',  up:'BG'},
];

let totalOK = true;
const results = [];

for (const {code, up} of LANGS) {
  const file = path.join(BASE, `lang_${code}.js`);
  if (!fs.existsSync(file)) { results.push(`${code}: 파일 없음`); totalOK = false; continue; }
  const src = fs.readFileSync(file, 'utf8');

  const main = extractTable(src, `_${up}`);
  const pfx  = extractTable(src, `_${up}_PFX`);
  const base = extractTable(src, `_${up}_BASE`);

  const mainKeys = new Set(Object.keys(main || {}));
  const pfxKeys  = new Set(Object.keys(pfx  || {}));
  const baseKeys = new Set(Object.keys(base || {}));

  const missMain = [...enMainKeys].filter(k => !mainKeys.has(k));
  const missPfx  = [...enPfxKeys ].filter(k => !pfxKeys.has(k));
  const missBase = [...enBaseKeys ].filter(k => !baseKeys.has(k));

  const ok = missMain.length === 0 && missPfx.length === 0 && missBase.length === 0;
  if (!ok) totalOK = false;

  results.push({ code, up, mainSize: mainKeys.size, pfxSize: pfxKeys.size, baseSize: baseKeys.size, missMain, missPfx, missBase, ok });
}

console.log('\n====== 전체 검사 결과 ======\n');
for (const r of results) {
  if (typeof r === 'string') { console.log(r); continue; }
  const status = r.ok ? '✅' : '❌';
  const miss = r.missMain.length + r.missPfx.length + r.missBase.length;
  console.log(`${status} ${r.code.padEnd(5)} main:${String(r.mainSize).padStart(4)} pfx:${String(r.pfxSize).padStart(3)} base:${String(r.baseSize).padStart(3)}  누락:${miss}`);
  if (r.missMain.length) {
    console.log(`   MAIN 누락(${r.missMain.length}):`);
    r.missMain.forEach(k => console.log(`     '${k}'`));
  }
  if (r.missPfx.length) {
    console.log(`   PFX 누락(${r.missPfx.length}):`);
    r.missPfx.forEach(k => console.log(`     '${k}'`));
  }
  if (r.missBase.length) {
    console.log(`   BASE 누락(${r.missBase.length}):`);
    r.missBase.forEach(k => console.log(`     '${k}'`));
  }
}

console.log('\n' + (totalOK ? '✅ 전 언어 누락 없음 — 100% 동기화' : '❌ 누락 있음 — 위 항목 확인 필요'));

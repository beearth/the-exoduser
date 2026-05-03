// Fixed audit - handles both multi-line and single-line table formats
const fs = require('fs');

function extractTable(src, startMarker) {
  const start = src.indexOf(startMarker);
  if (start === -1) return null;
  // Find the opening brace
  const braceStart = src.indexOf('{', start);
  if (braceStart === -1) return null;

  // Walk chars to find matching closing brace
  let depth = 0;
  let i = braceStart;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  const block = src.slice(braceStart + 1, i);

  // Parse key:value pairs - scan char by char handling escapes
  const map = {};
  let pos = 0;
  while (pos < block.length) {
    // Skip whitespace and commas and newlines
    while (pos < block.length && (block[pos] === ' ' || block[pos] === '\n' || block[pos] === '\r' || block[pos] === '\t' || block[pos] === ',')) pos++;
    if (pos >= block.length) break;
    if (block[pos] !== "'") { pos++; continue; }

    // Read key
    pos++; // skip opening quote
    let key = '';
    while (pos < block.length) {
      if (block[pos] === '\\') { pos++; key += block[pos] || ''; pos++; continue; }
      if (block[pos] === "'") break;
      key += block[pos++];
    }
    pos++; // skip closing quote

    // Skip :
    while (pos < block.length && block[pos] !== "'") pos++;
    if (pos >= block.length) break;

    // Read value
    pos++; // skip opening quote
    let val = '';
    while (pos < block.length) {
      if (block[pos] === '\\') { pos++; val += block[pos] || ''; pos++; continue; }
      if (block[pos] === "'") break;
      val += block[pos++];
    }
    pos++; // skip closing quote

    if (key) map[key] = val;
  }
  return map;
}

const gameHtml = fs.readFileSync('game.html', 'utf8');
const enMain = extractTable(gameHtml, 'const _EN={');
const enPfx  = extractTable(gameHtml, 'const _EN_PFX={');
const enBase = extractTable(gameHtml, 'const _EN_BASE={');

console.log(`_EN: ${Object.keys(enMain).length} keys`);
console.log(`_EN_PFX: ${Object.keys(enPfx).length} keys -> ${Object.keys(enPfx).join(', ')}`);
console.log(`_EN_BASE: ${Object.keys(enBase).length} keys -> ${Object.keys(enBase).join(', ')}`);
console.log('');

// Known unicode false positives (source escape vs literal emoji - functionally identical)
const unicodeFP = new Set(['\u{1F47B} 유령!', '\u{1F9B4} 해골무덤!']);

const langs = ['zh','ja','es','zht','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg'];

const issues = [];

for (const lang of langs) {
  const src = fs.readFileSync(`lang_${lang}.js`, 'utf8');
  const up = lang.toUpperCase();

  const lMain = extractTable(src, `const _${up}={`);
  const lPfx  = extractTable(src, `const _${up}_PFX={`);
  const lBase = extractTable(src, `const _${up}_BASE={`);

  const missMain = Object.keys(enMain).filter(k => !unicodeFP.has(k) && !(k in lMain));
  const missPfx  = lPfx  ? Object.keys(enPfx).filter(k => !(k in lPfx))   : Object.keys(enPfx);
  const missBase = lBase ? Object.keys(enBase).filter(k => !(k in lBase))  : Object.keys(enBase);

  // Empty values
  const emptyMain = lMain ? Object.entries(lMain).filter(([,v]) => v === '').map(([k]) => k) : [];

  const hasProblem = missMain.length || missPfx.length || missBase.length || emptyMain.length;
  const statusStr = hasProblem ? '❌' : '✅';

  const parts = [];
  if (missMain.length) parts.push(`MISS_MAIN=${missMain.length}`);
  if (missPfx.length)  parts.push(`MISS_PFX=${missPfx.length}[${missPfx.join(',')}]`);
  if (missBase.length) parts.push(`MISS_BASE=${missBase.length}[${missBase.join(',')}]`);
  if (emptyMain.length) parts.push(`EMPTY=${emptyMain.length}`);

  console.log(`${lang.padEnd(5)}: main=${lMain?Object.keys(lMain).length:'∅'} pfx=${lPfx?Object.keys(lPfx).length:'∅'} base=${lBase?Object.keys(lBase).length:'∅'}  ${statusStr} ${parts.join(' ')}`);

  if (missMain.length) {
    issues.push({ lang, type:'main', keys: missMain });
  }
  if (missPfx.length) {
    issues.push({ lang, type:'pfx', keys: missPfx });
  }
  if (missBase.length) {
    issues.push({ lang, type:'base', keys: missBase });
  }
}

if (issues.length === 0) {
  console.log('\n✅ 모든 lang 파일 완전함!');
} else {
  console.log('\n--- DETAIL ---');
  for (const iss of issues) {
    console.log(`[${iss.lang}] ${iss.type}: ${iss.keys.join(', ')}`);
  }
}

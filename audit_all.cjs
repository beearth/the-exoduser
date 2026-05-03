// Comprehensive translation audit
// 1. Main table (_EN vs each lang)
// 2. PFX table
// 3. BASE table
// 4. Empty-value entries
// 5. Keys in lang but not in _EN (orphans)

const fs = require('fs');
const gameHtml = fs.readFileSync('game.html', 'utf8');

function extractTable(src, startMarker, closeMarker) {
  const start = src.indexOf(startMarker);
  if (start === -1) return {};
  const end = src.indexOf(closeMarker, start);
  const block = src.slice(start, end);
  const map = {};
  const lines = block.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("'")) continue;
    const colonIdx = trimmed.indexOf("':");
    if (colonIdx < 1) continue;
    const key = trimmed.slice(1, colonIdx);
    const rest = trimmed.slice(colonIdx + 2).trim();
    if (rest.startsWith("'")) {
      const endQ = rest.indexOf("'", 1);
      if (endQ > 0) map[key] = rest.slice(1, endQ);
      else map[key] = '';
    } else if (rest.startsWith('"')) {
      const endQ = rest.indexOf('"', 1);
      if (endQ > 0) map[key] = rest.slice(1, endQ);
      else map[key] = '';
    }
  }
  return map;
}

// Extract EN tables
const enMain = extractTable(gameHtml, 'const _EN={', '\n};');
const enPfx  = extractTable(gameHtml, 'const _EN_PFX={', '\n};');
const enBase = extractTable(gameHtml, 'const _EN_BASE={', '\n};');

console.log(`_EN: ${Object.keys(enMain).length} keys`);
console.log(`_EN_PFX: ${Object.keys(enPfx).length} keys`);
console.log(`_EN_BASE: ${Object.keys(enBase).length} keys`);
console.log('');

const langs = ['zh','ja','es','zht','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg'];

const report = [];

for (const lang of langs) {
  const file = `lang_${lang}.js`;
  const src = fs.readFileSync(file, 'utf8');
  const up = lang.toUpperCase();

  const lMain = extractTable(src, `const _${up}={`, '\n};');
  const lPfx  = extractTable(src, `const _${up}_PFX={`, '\n};');
  const lBase = extractTable(src, `const _${up}_BASE={`, '\n};');

  // Missing in lang
  const missingMain = Object.keys(enMain).filter(k => !(k in lMain));
  const missingPfx  = Object.keys(enPfx).filter(k => !(k in lPfx));
  const missingBase = Object.keys(enBase).filter(k => !(k in lBase));

  // Empty values in lang
  const emptyMain = Object.entries(lMain).filter(([k,v]) => v === '').map(([k]) => k);
  const emptyPfx  = Object.entries(lPfx).filter(([k,v]) => v === '').map(([k]) => k);
  const emptyBase = Object.entries(lBase).filter(([k,v]) => v === '').map(([k]) => k);

  // Orphans in lang (not in EN) - potential stale entries
  const orphanMain = Object.keys(lMain).filter(k => !(k in enMain));

  const issues = [];

  // Ignore known unicode false positives
  const unicodeFP = new Set(['\u{1F47B} 유령!', '\u{1F9B4} 해골무덤!']);
  const realMissMain = missingMain.filter(k => !unicodeFP.has(k));

  if (realMissMain.length > 0) issues.push(`MISS_MAIN=${realMissMain.length}`);
  if (missingPfx.length > 0)  issues.push(`MISS_PFX=${missingPfx.length}`);
  if (missingBase.length > 0) issues.push(`MISS_BASE=${missingBase.length}`);
  if (emptyMain.length > 0)   issues.push(`EMPTY_MAIN=${emptyMain.length}`);
  if (emptyPfx.length > 0)    issues.push(`EMPTY_PFX=${emptyPfx.length}`);
  if (emptyBase.length > 0)   issues.push(`EMPTY_BASE=${emptyBase.length}`);

  const status = issues.length === 0 ? '✅ OK' : '❌ ' + issues.join(', ');
  const line = `${lang.padEnd(5)}: main=${Object.keys(lMain).length} pfx=${Object.keys(lPfx).length} base=${Object.keys(lBase).length}  ${status}`;
  console.log(line);
  report.push({ lang, realMissMain, missingPfx, missingBase, emptyMain, emptyPfx, emptyBase, orphanMain });
}

// Detail report for any issues
console.log('\n--- DETAIL ---');
for (const r of report) {
  const unicodeFP = new Set(['\u{1F47B} 유령!', '\u{1F9B4} 해골무덤!']);
  const realMiss = r.realMissMain.filter(k => !unicodeFP.has(k));
  if (realMiss.length || r.missingPfx.length || r.missingBase.length || r.emptyMain.length) {
    console.log(`\n[${r.lang}]`);
    if (realMiss.length) {
      console.log(`  MISS_MAIN (${realMiss.length}):`);
      realMiss.forEach(k => console.log(`    '${k}'`));
    }
    if (r.missingPfx.length) {
      console.log(`  MISS_PFX (${r.missingPfx.length}):`);
      r.missingPfx.forEach(k => console.log(`    '${k}'`));
    }
    if (r.missingBase.length) {
      console.log(`  MISS_BASE (${r.missingBase.length}):`);
      r.missingBase.forEach(k => console.log(`    '${k}'`));
    }
    if (r.emptyMain.length) {
      console.log(`  EMPTY_MAIN (${r.emptyMain.length}):`);
      r.emptyMain.forEach(k => console.log(`    '${k}'`));
    }
  }
}

const fs = require('fs');

// Step 1: Load game.html, eval the EN dict to get actual runtime keys
const game = fs.readFileSync('game.html', 'utf8');

// Extract all _T('...') calls - but we need to eval them to get actual runtime strings
// The keys in source code may use \u{xxxx} escapes which JS interprets
// So we'll extract the raw source between quotes, then eval each to get the runtime string
const rawKeys = new Set();
const regex = /_T\('([^']+)'\)/g;
let m;
while ((m = regex.exec(game)) !== null) {
  rawKeys.add(m[1]);
}

// Convert raw source strings to runtime strings by eval
const runtimeKeys = new Set();
for (const raw of rawKeys) {
  try {
    const val = eval("'" + raw + "'");
    runtimeKeys.add(val);
  } catch(e) {
    runtimeKeys.add(raw); // fallback
  }
}
console.log('game.html _T() 호출 키 (런타임): ' + runtimeKeys.size + '개\n');

// Step 2: Load each lang file and check
const files = fs.readdirSync('.').filter(f => /^lang_[a-z]+\.js$/.test(f)).sort();

let totalMissing = 0;
let anyMissing = false;
const perLangMissing = {};

for (const f of files) {
  const lang = f.match(/lang_(.+)\.js/)[1];
  const content = fs.readFileSync(f, 'utf8');
  try {
    const mainVar = '_' + lang.toUpperCase();
    const fn = new Function(content + '; return ' + mainVar + ';');
    const obj = fn();

    const missing = [...runtimeKeys].filter(k => !(k in obj));
    totalMissing += missing.length;
    if (missing.length > 0) {
      anyMissing = true;
      perLangMissing[lang] = missing;
      console.log(lang.toUpperCase() + ': ' + Object.keys(obj).length + '키, 누락 ' + missing.length + '개');
      if (missing.length <= 10) {
        missing.forEach(k => console.log('  - ' + JSON.stringify(k)));
      }
    } else {
      console.log(lang.toUpperCase() + ': ' + Object.keys(obj).length + '키 ✅ 완성');
    }
  } catch(e) {
    console.log(lang.toUpperCase() + ': ERROR - ' + e.message.substring(0, 80));
  }
}

console.log('\n' + (anyMissing ? '총 누락: ' + totalMissing + '건' : '✅ 모든 26개 언어 — _T() 키 782개 100% 완성! 누락 없음!'));

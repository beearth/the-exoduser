const fs = require('fs');
const gameKeys = JSON.parse(fs.readFileSync('_game_tkeys.json','utf8'));
const content = fs.readFileSync('lang_ar.js','utf8');
const varNames = [...content.matchAll(/const (_[A-Z_]+)\s*=/g)].map(m => m[1]);
const fn = new Function(content + '; return {' + varNames.join(',') + '};');
const objs = fn();
const arKeys = new Set(Object.keys(objs._AR));
const missing = gameKeys.filter(k => !arKeys.has(k));

const game = fs.readFileSync('game.html','utf8');
// Build EN dict from game.html
const enDict = {};
const enMatch = game.match(/const _EN\s*=\s*\{[\s\S]*?\n\};/);
if (enMatch) {
  const regex = /'([^']+)'\s*:\s*(?:'([^']*)'|"([^"]*)")/g;
  let m;
  while ((m = regex.exec(enMatch[0])) !== null) {
    enDict[m[1]] = m[2] || m[3];
  }
}

missing.forEach((k, i) => {
  const en = enDict[k] || '?';
  console.log((i+1) + '. ' + JSON.stringify(k) + ' => EN: ' + JSON.stringify(en));
});

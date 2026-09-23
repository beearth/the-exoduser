import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='output/steam_review_20260916/';
const r=JSON.parse(fs.readFileSync(out+'runtime.json','utf8'));
assert.equal(r.phase,'complete');assert.ok(!r.failure);
for(const key of ['lobby','languages','restartMatrix','deathScreens','details'])assert.equal(r[key].length,29,key);
assert.equal(r.freshSettings,null);
for(const key of ['freshGame','existingGame','restart'])assert.equal(r[key].actual,r[key].expected,key);
for(const row of [...r.lobby,...r.languages,...r.restartMatrix]){assert.equal(row.actual,row.code);assert.equal(row.stored,row.code);}
for(const row of r.languages)if(row.pet.expected)assert.equal(row.pet.display,row.pet.expected,'pet '+row.code);
const restored=JSON.parse(fs.readFileSync(out+'manifest-restored.json','utf8'));
assert.ok(restored.restored&&restored.serverRestored&&restored.probeRemoved);
const pkg=JSON.parse(fs.readFileSync(out+'package-evidence.json','utf8'));
assert.ok(pkg.files.every(x=>x.matches||x.matchesCommitted));
const summary={
  at:new Date().toISOString(),runtime:r.runtime,
  languageSelectionCount:r.languages.length,lobbyCount:r.lobby.length,
  processRelaunchCount:r.restartMatrix.length,deathScreenCount:r.deathScreens.length,itemDetailAndHUDCount:r.details.length,
  freshGame:r.freshGame,existingGame:r.existingGame,firstRelaunch:r.restart,
  unhandledErrors:r.errors||[],resourceErrors:r.resourceErrors||[],
  settingsButtonOverflow:r.languages.filter(x=>x.overflow.length).map(x=>({code:x.code,overflow:x.overflow})),
  identicalPackagedResources:pkg.files.length,restored,
  limits:['Instrumented real NW.js executable on isolated QA port 3346; restored shipping port 3333.',
    'Translation coverage incomplete outside Korean. Mixed text was observed.',
    'Screenshots captured for all locales; visual inspection was representative, not a native-speaker or all-content certification.',
    'Death screen invoked through existing game death resolution in an isolated test character. Locale changes on this modal were injected through the normal settings handler.',
    'Steam client launch, Steam overlay and physical controller disconnection were not tested.']
};
fs.writeFileSync(out+'verification-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function sBlockStateSource() {
  const start = gameHtml.indexOf("case 'sBlock':{");
  const end = gameHtml.indexOf("case 'peaceShield':{", start);
  assert.ok(start >= 0 && end > start, 'sBlock state must exist');
  return gameHtml.slice(start, end);
}

test('Q hold auto-detonates only once until Q is released and pressed again', () => {
  const block = sBlockStateSource();

  assert.match(block, /if\(P\.skills\.detonate&&!P\._qDetonateFired\)\{/,
    'detonate charge must stop after the current Q hold has fired');
  assert.match(block, /if\(P\.parryT>=120\)\{_detonateBlast\('자동기폭!',wp\(\)\.el\|\|0\);P\.parryT=0;P\._qDetonateFired=true\}/,
    'the first auto-detonation must latch the current Q hold');

  const entries = gameHtml.match(/P\.s='sBlock';P\.st2=999;P\._sbParryT=20;P\._sbHoldT=0;P\._sbReleaseR=0;P\.parryT=0;P\._qDetonateFired=false;/g) || [];
  assert.equal(entries.length, 5, 'every standard Q entry must clear stale charge and re-arm one detonation');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') {
      depth++;
      opened = true;
    } else if (gameHtml[i] === '}') {
      depth--;
      if (opened && depth === 0) return gameHtml.slice(start, i + 1);
    }
  }
  assert.fail(`${name} must be complete`);
}

test('Q hold radius grows from 110px to a capped 200px over two seconds', () => {
  const source = extractFunction('_sBlockChargeRadius');
  const radius = Function(`${source};return _sBlockChargeRadius`)();

  assert.equal(radius(0), 110);
  assert.equal(radius(60), 155);
  assert.equal(radius(120), 200);
  assert.equal(radius(999), 200);
});

test('releasing Q bursts at the charged radius and carries that radius into the release parry window', () => {
  const blockStart = gameHtml.indexOf("case 'sBlock':{");
  const blockEnd = gameHtml.indexOf("case 'peaceShield':{", blockStart);
  assert.ok(blockStart >= 0 && blockEnd > blockStart, 'sBlock state must exist');
  const block = gameHtml.slice(blockStart, blockEnd);

  assert.match(block, /P\._sbHoldT=\(P\._sbHoldT\|\|0\)\+sp/,
    'holding Q must accumulate shield growth time');
  assert.match(block, /if\(!isHeld\('parry'\)\|\|P\.mp<=0\)/,
    'sBlock must stay active from the non-consuming held-key state');
  assert.doesNotMatch(block, /if\(!isAct\('parry'\)\|\|P\.mp<=0\)/,
    'sBlock must not depend on an input flag consumed by isJust checks');
  assert.match(block, /const _sbReleaseR=_sBlockChargeRadius\(P\._sbHoldT\)/,
    'release must snapshot the charged radius');
  assert.match(block, /P\._sbReleaseR=_sbReleaseR/,
    'release parry must retain the charged radius');
  assert.match(block, /G\._sbBurst=\{[^}]*maxR:_sbReleaseR/,
    'the visible shield burst must use the same charged radius');
  assert.match(block, /P\._sbHoldT=0/,
    'release must reset the next hold cycle');

  assert.match(gameHtml, /const _releasePW=P\.s!=='sBlock'&&P\._sbParryT>0&&\(P\._sbReleaseR\|\|0\)>0/);
  assert.match(gameHtml, /const _qPulseR=_sbPW\?_sBlockChargeRadius\(P\._sbHoldT\):_releasePW\?P\._sbReleaseR:0/);
  assert.match(gameHtml, /const _wwAbsR=_qPulseR>0\?_qPulseR:/,
    'ordinary Q-parryable projectiles must use the charged pulse radius');
});

test('the rendered Q shield uses the same growth curve', () => {
  assert.match(gameHtml, /_sbR=_sBlockChargeRadius\(P\._sbHoldT\)\*\.5/);
});

test('every standard Q shield entry starts a fresh charge cycle', () => {
  const entries = gameHtml.match(/P\.s='sBlock';P\.st2=999;P\._sbParryT=20;P\._sbHoldT=0;P\._sbReleaseR=0;/g) || [];
  assert.equal(entries.length, 5);
});

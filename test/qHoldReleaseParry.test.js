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

test('stormBeam unlocks peace shield without silently replacing the selected basic Q parry', () => {
  const source = extractFunction('_qIsPeaceShield');
  const isPeaceShield = Function('P', '_isFused', `${source};return _qIsPeaceShield()`);
  const fused = (id) => id === 'stormBeam';

  assert.equal(
    isPeaceShield({ skills: { peaceShield: 5 }, activeQSk: 'detonate' }, fused),
    false,
    'stormBeam must not override a non-peace Q selection',
  );
  assert.equal(
    isPeaceShield({ skills: { peaceShield: 5 }, activeQSk: 'peaceShield' }, fused),
    true,
    'peace shield must still activate when explicitly selected',
  );
});

test('Q shield starts at 100px, grows 100px per second, and caps at 500px', () => {
  const source = extractFunction('_sBlockChargeRadius');
  const radius = Function(`${source};return _sBlockChargeRadius`)();

  assert.equal(radius(0), 100);
  assert.equal(radius(60), 200);
  assert.equal(radius(120), 300);
  assert.equal(radius(180), 400);
  assert.equal(radius(240), 500);
  assert.equal(radius(999), 500);
});

test('Q hold keeps absorption fixed and reserves the growing radius for the release shockwave', () => {
  const source = extractFunction('_sBlockProjectileZone');
  const zone = Function(`${source};return _sBlockProjectileZone`)();

  assert.equal(zone(20, 0), 'absorb');
  assert.equal(zone(21, 0), 'none');
  assert.equal(zone(20, 20), 'absorb');
  assert.equal(zone(21, 20), 'parry');
  assert.equal(zone(100, 20), 'parry');
  assert.equal(zone(101, 20), 'none');
  assert.equal(zone(500, 0), 'none');
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
  assert.match(gameHtml, /const _qPulseR=P\.s==='sBlock'&&P\._sbParryT>0\?100:_releasePW\?P\._sbReleaseR:0/,
    'only the fixed press ring is active while holding; the charged radius activates on release');
  assert.match(gameHtml, /const _wwAbsR=_qPulseR>0\?_qPulseR:/,
    'ordinary Q-parryable projectiles must use the charged pulse radius');
});

test('Q parry scans the charged radius only after Q is released', () => {
  assert.match(gameHtml, /const _qCollisionScanR=P\.s==='sBlock'&&P\._sbParryT>0\?100:P\._sbParryT>0\?\(P\._sbReleaseR\|\|0\):0/,
    'the broad-phase must not turn the growing hold charge into a live parry range');
  assert.match(gameHtml, /const _qCollisionScanR2=Math\.max\(160000,_qCollisionScanR\*_qCollisionScanR\)/,
    'normal collision scanning must expand past 400px for a charged Q');
  assert.match(gameHtml, /if\(_pDist2>_qCollisionScanR2&&_pDistP2>_qCollisionScanR2&&\(!_ancHit\|\|_ancDist2>_ancHitR\*_ancHitR\)&&!p\.friendly&&!_bigBall\)/,
    'charged release targets may not be skipped before their Q parry check');
});

test('peaceShield absorbs while held after its press window, then stores the grown radius for Q release parry', () => {
  const start = gameHtml.indexOf("case 'peaceShield':{");
  const end = gameHtml.indexOf("case 'ghostWalk':{", start);
  assert.ok(start >= 0 && end > start, 'peaceShield state must exist');
  const block = gameHtml.slice(start, end);

  assert.match(block, /if\(!isHeld\('parry'\)\|\|P\.mp<=_psMpCost\)/,
    'peaceShield must use the physical held-key state');
  assert.match(block, /const _psReleaseR=P\._psShieldR\|\|100/,
    'peaceShield release must snapshot its grown shield radius');
  assert.match(block, /P\._sbReleaseR=_psReleaseR/,
    'the common Q release parry window must receive the snapshot');
  assert.match(block, /if\(_psQZone==='parry'&&_projectileParryClass\(p\)==='magic'\)/,
    'only the fixed initial press ring may parry while Q is still held');
  assert.match(block, /const _psQZone=_psDist<=20\?'absorb':P\._sbParryT>0&&_psDist<=100\?'parry':'none'/,
    'peaceShield must keep its hold absorption at 20px and use a fixed press ring');
});

test('a successful press parry cannot let its iframe block the following Q-release parry', () => {
  assert.match(gameHtml, /_pDist<_wwAbsR&&\(_qParryActive\|\|P\.iframes<=0\)&&!P\._ioActive/,
    'active Q parry windows must remain eligible while their own success iframe is active');
});

test('the rendered Q shield draws the exact charged parry boundary', () => {
  assert.match(gameHtml, /const _sbRangeR=_sBlockChargeRadius\(P\._sbHoldT\);/,
    'the hold indicator must use the same 100→500px radius as the parry check');
  assert.match(gameHtml, /X\.arc\(P\.x,P\.y,_sbRangeR,0,Math\.PI\*2\)/,
    'the visible boundary must be drawn at that exact charged radius');
});

test('releasing Q keeps a visible bubble at the stored charged radius', () => {
  const blockStart = gameHtml.indexOf("case 'sBlock':{");
  const blockEnd = gameHtml.indexOf("case 'peaceShield':{", blockStart);
  const block = gameHtml.slice(blockStart, blockEnd);
  assert.match(block, /G\._sbBurst=\{[^}]*maxR:_sbReleaseR[^}]*release:true/,
    'Q release must mark its burst so it can render the full stored bubble');
  assert.match(gameHtml, /const _bReleaseR=_b\.release\?_b\.maxR:0;/,
    'the renderer must use the stored charged radius for the release bubble');
  assert.match(gameHtml, /X\.arc\(_b\.x,_b\.y,_bReleaseR,0,Math\.PI\*2\)/,
    'the release bubble outline must reach the exact stored radius');
});

test('every standard Q shield entry starts a fresh charge cycle', () => {
  const entries = gameHtml.match(/P\.s='sBlock';P\.st2=999;P\._sbParryT=20;P\._sbHoldT=0;P\._sbReleaseR=0;/g) || [];
  assert.equal(entries.length, 5);
});

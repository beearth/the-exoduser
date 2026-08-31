import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  assert.ok(start >= 0, `missing ${startToken}`);
  const end = src.indexOf(endToken, start + startToken.length);
  assert.ok(end > start, `missing ${endToken} after ${startToken}`);
  return src.slice(start, end);
}

test('field-mob death uses the shared corpse/gore/blood kit', () => {
  const fx = sliceBetween(gameHtml, 'function _fmDeathFx(m,isFb,dmg){', 'function _fmApply(m,dmg,isFb){');
  assert.match(fx, /m\._deathFxDone=true/);
  assert.match(fx, /deathFX\(/);
  assert.match(fx, /_spawnLargeMonsterDeathFx\(/);
  assert.match(fx, /_addCorpse\(/);
  assert.match(fx, /_addGorePiece\(/);
  assert.match(fx, /_addDeathImpact\(/);
  assert.match(fx, /_fmKind:isFb\?'fb':'wm'/);
  assert.match(fx, /shake\(isFb\?18:8\)/);
});

test('_addCorpse captures field-mob sheets before boss atlas', () => {
  const corpse = sliceBetween(gameHtml, 'function _addCorpse(e,killAng,power){', 'function _addGibs(e,boomX,boomY,boomR){');
  const fmAt = corpse.indexOf("e._fmKind==='fb'");
  const ibAt = corpse.indexOf('if(!_cDrawn&&e.ib)');
  assert.ok(fmAt >= 0, 'field-mob capture must exist');
  assert.ok(ibAt > fmAt, 'field sprite must be captured before stage-boss atlas');
  assert.match(corpse, /_fmDrawSpriteTo\(c\.ctx,128,128,e,e\._fmKind==='fb'\)/);
});

test('every death leaves a visible persistent blood stain, capped so it is not a puddle', () => {
  const stain = sliceBetween(gameHtml, 'function _isLargeMob(e){', 'function _addCorpse(e,killAng,power){');
  assert.match(stain, /function _leaveFloorTrace\(e\)\{return!!e\}/);
  assert.match(stain, /Math\.max\(14,Math\.min\(36/);
  assert.match(stain, /Math\.max\(36,Math\.min\(56/);
  assert.match(stain, /s\.persist=true/);
  assert.doesNotMatch(stain, /if\(!large\)return/);
  assert.doesNotMatch(stain, /function _leaveFloorTrace\(e\)\{return!!e&&/);
  assert.doesNotMatch(gameHtml, /_poolSplatImg/);
  const corpse = sliceBetween(gameHtml, 'function _addCorpse(e,killAng,power){', 'function _addGibs(e,boomX,boomY,boomR){');
  assert.match(corpse, /_addFloorTrace\(e\)/);
  assert.match(gameHtml, /if\(typeof _clearDeathDecals==='function'\)_clearDeathDecals\(\)/);
  assert.match(gameHtml, /const _STAIN_MAX=30/);
});

test('_fmApply and tick backups share _fmDeathFx', () => {
  const apply = sliceBetween(gameHtml, 'function _fmApply(m,dmg,isFb){', 'function _hurtFieldMobs(');
  assert.match(apply, /_fmDeathFx\(m,isFb,dmg\)/);
  assert.match(gameHtml, /if\(fb\.hp<=0\)\{_fmDeathFx\(fb,true\)/);
  assert.match(gameHtml, /if\(w\.hp<=0\)\{_fmDeathFx\(w,false\)/);
  assert.doesNotMatch(gameHtml, /if\(fb\.hp<=0\)\{if\(typeof _spawnLargeMonsterDeathFx/);
  assert.doesNotMatch(gameHtml, /if\(w\.hp<=0\)\{if\(typeof _spawnLargeMonsterDeathFx/);
});

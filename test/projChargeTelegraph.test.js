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

test('committed telegraphed shots skip the 1/3 density drop', () => {
  const spawn = sliceBetween(gameHtml, 'function spawnProj(props){', 'function _recycleProj(p){');
  assert.match(spawn, /if\(!p\._commit&&!p\._druidParryVolley\)\{/);
  assert.match(spawn, /_eProjDropCnt=\(_eProjDropCnt\+1\)%3;if\(_eProjDropCnt!==0\)\{_recycleProj\(p\);return null;\}/);
  assert.match(gameHtml, /p\._commit=false/);
});

test('idle charged fire marks the projectile as committed', () => {
  assert.match(gameHtml, /function _fireChargedProj\(e\)\{/);
  const fire = sliceBetween(gameHtml, 'function _fireChargedProj(e){', 'function _tickProjCharge(e,sp){');
  assert.match(fire, /_commit:true/);
  assert.match(fire, /spawnProj\(/);
});

test('proj charge ticks before the unalerted 400px AI early-return', () => {
  const upd = sliceBetween(gameHtml, 'function updateE(e,sp){', 'function _petClaim(item){');
  const tickAt = upd.indexOf('_tickProjCharge(e,sp)');
  const earlyAt = upd.indexOf("if(!e._alerted&&!e.ib&&d>400)return");
  assert.ok(tickAt >= 0, 'updateE must tick proj charge');
  assert.ok(earlyAt > tickAt, 'charge tick must run even when the monster is far / unalerted');
  assert.match(upd, /if\(e\.stunned>0\)\{[\s\S]*_cancelProjCharge\(e\)/);
  assert.match(upd, /if\(e\._frozen>0\)\{[\s\S]*_cancelProjCharge\(e\)/);
});

test('idle only starts the charge ring; it does not own the countdown', () => {
  const idle = sliceBetween(gameHtml, "// Ranged: 모든 몬스터 탄막 발사 (1초 차징 텔레그래프)", "case'eChargeWind':{");
  assert.match(idle, /e\._projChargeT=60/);
  assert.doesNotMatch(idle, /e\._projChargeT-=sp/);
  assert.doesNotMatch(idle, /function _fireChargedProj/);
});

test('eProjAt commits windup shots so a finished round always produces a bullet', () => {
  const eProj = sliceBetween(gameHtml, 'function eProjAt(e,ang,spd,dmgMult,el,life,col,sz){', '// ═══════════════════════════════════════');
  assert.match(eProj, /_commit:true/);
});

test('shoot charge ring is a dark track plus round-cap progress arc', () => {
  const draw = sliceBetween(gameHtml, 'function _drawShootCharge(', 'function ');
  assert.match(draw, /X\.lineCap='round'/);
  assert.match(draw, /X\.arc\(x,y,R,0,Math\.PI\*2\)/);
  assert.match(draw, /X\.arc\(x,y,R,-Math\.PI\/2,-Math\.PI\/2\+Math\.PI\*2\*prog\)/);
  assert.doesNotMatch(draw, /X\.fill\(\)/);
  assert.match(gameHtml, /if\(e\._projChargeT>0&&e\._projChargeCol\)\{[\s\S]{0,360}_drawShootCharge\(/);
  assert.match(gameHtml, /if\(_eDecor&&e\.s==='eShootWind'\)\{[\s\S]{0,180}_drawShootCharge\(/);
});

test('only physical charge rings are white; fire red-bean comets retain their Q-magic color', () => {
  const chargeDraw = sliceBetween(gameHtml, '// ═══ 탄막 차징 전조', '// ═══ 피격 플래시');
  assert.match(chargeDraw, /const _pcPhysical=e\._projChargeBean==='normal'&&e\.el===EL\.P/);
  assert.match(chargeDraw, /const _pcCol=_pcPhysical\?'#f4f4f4'/);
  assert.doesNotMatch(chargeDraw, /e\._projChargeBean==='red'\?'#f4f4f4'/);
});

test('every physical eShootWind attack previews a white charge ring', () => {
  const chargeDraw = sliceBetween(gameHtml, '// 탄막 준비동작 이펙트', '// 방패돌격 잔상');
  assert.match(chargeDraw, /e\._swChargeEl===EL\.P\?'#f4f4f4'/);

  const coral = sliceBetween(gameHtml, '// 산호 파편 투사체', '// ── 67:인어 사도');
  const parasite = sliceBetween(gameHtml, '// 기생충 발사: 3방향 투사체', '// ── 69:심연의 대사도');
  const trident = sliceBetween(gameHtml, '// 삼지창 관통: 직선 투사체', '// 소용돌이: 플레이어 흡입');
  for (const physicalWindup of [coral, parasite, trident]) {
    assert.match(physicalWindup, /e\.s='eShootWind';e\.st2=60;e\._swChargeEl=EL\.P/);
  }
});

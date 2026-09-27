import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

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
  const draw = sliceBetween(gameHtml, 'function _drawShootCharge(', '\n// ── 은꼬리');
  assert.match(draw, /X\.lineCap='round'/);
  assert.match(draw, /X\.arc\(x,y,R,-Math\.PI\/2,-Math\.PI\/2\+Math\.PI\*2\*prog\)/);
  assert.doesNotMatch(draw, /X\.fill\(\)/);
  const renderedArcs = (prog) => {
    const arcs = [];
    const ctx = vm.createContext({Math, X: {
      save(){}, restore(){}, beginPath(){},
      arc(...args){this.currentArc=args},
      stroke(){arcs.push({arc:this.currentArc, color:this.strokeStyle})}
    }});
    vm.runInContext(`${draw};_drawShootCharge(0,0,10,${prog},'#ffee00',1,false)`, ctx);
    return arcs;
  };
  for (const prog of [0, .5, .99]) {
    const fullBrightArcs = renderedArcs(prog).filter(({arc,color}) =>
      arc[3] === 0 && arc[4] === Math.PI * 2 && color !== '#080808');
    assert.equal(fullBrightArcs.length, 0, `progress ${prog} must not draw a full bright ring`);
  }
  assert.match(gameHtml, /if\(e\._projChargeT>0&&e\._projChargeCol\)\{[\s\S]{0,360}_drawShootCharge\(/);
  assert.match(gameHtml, /if\(e\.s==='eShootWind'\)\{[\s\S]{0,180}_drawShootCharge\(/);
});

test('only physical charge rings are white; fire red-bean comets retain their Q-magic color', () => {
  const chargeDraw = sliceBetween(gameHtml, 'function _drawEnemyShotWarnings(', 'function radialProjs(');
  assert.match(chargeDraw, /_projectileParryClass\(\{el:e\.el,parryClass:e\._projChargeParryClass\}\)==='physical'/);
  assert.match(chargeDraw, /const _pcCol=_pcPhysical\?'#f4f4f4'/);
  assert.doesNotMatch(chargeDraw, /e\._projChargeBean==='red'\?'#f4f4f4'/);
});

test('every physical eShootWind attack previews a white charge ring', () => {
  const chargeDraw = sliceBetween(gameHtml, 'function _drawEnemyShotWarnings(', 'function radialProjs(');
  assert.match(chargeDraw, /_swPhysical=e\._swChargeEl===EL\.P/);
  assert.match(chargeDraw, /_drawShootCharge\(e\.x,e\.y,e\.r,prog,_swCol,1,_swPhysical\)/);

  const coral = sliceBetween(gameHtml, '// 산호 파편 투사체', '// ── 67:인어 사도');
  const parasite = sliceBetween(gameHtml, '// 기생충 발사: 3방향 투사체', '// ── 69:심연의 대사도');
  const trident = sliceBetween(gameHtml, '// 삼지창 관통: 직선 투사체', '// 소용돌이: 플레이어 흡입');
  for (const physicalWindup of [coral, parasite, trident]) {
    assert.match(physicalWindup, /e\.s='eShootWind';e\.st2=60;e\._swChargeEl=EL\.P/);
  }
});

test('pillar demon shockwave does not hide a physical shot inside its dark charge ring', () => {
  const pillar = sliceBetween(gameHtml, '// ── 46:기둥 악마', '// ── 47:그림자 쌍둥이');
  const shockwave = pillar.slice(pillar.indexOf('// 지면 AoE'));
  assert.match(shockwave, /_swChargeEl=EL\.D/);
  assert.doesNotMatch(shockwave, /eProjAt\([^;]*,e\.el,/);
  assert.match(shockwave, /eProjAt\([^;]*,EL\.D,/);
});

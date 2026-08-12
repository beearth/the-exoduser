import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 4B-5B / LOCK-23] L5 ATTACK-STYLE NODES — BATCH 1 ═══
// pierceCount·splashRadius·splashDmg·projSpeedPct 를 기존 LIVE primitive에 배선. 실제 행동 E2E(property-only 금지).
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);
const NEW4=['pierceCount','splashRadius','splashDmg','projSpeedPct'];

// ── _fireballExplode 실 함수 추출 + 샌드박스(스텁) ──
function buildExplode(splashRadius, splashDmg){
  const fn=gameHtml.match(/function _fireballExplode\(p\)\{[\s\S]*?p\.explR=0;\n\}/)[0];
  const hits=[];
  const env={
    _eqAffix:id=>id==='splashRadius'?splashRadius:id==='splashDmg'?splashDmg:0,
    shQuery:()=>env.__enemies,
    dst:(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1),
    elMul:()=>1,
    hurtE:(e,dmg)=>{hits.push({e,dmg})},
    pDotPool:()=>0,
    window:{}, _tvfx2Imgs:{}, playSample:()=>{}, _r:()=>1, shake:()=>{}, poolPart:()=>{}, ELC:{},
    __enemies:[], hits,
  };
  const keys=Object.keys(env);
  env.f=new Function(...keys,fn+'\nreturn _fireballExplode;')(...keys.map(k=>env[k]));
  return env;
}

// ══════════════════════════════════════════════════════════════
test('§1 배선 존재 — 4종 consumer 실제 primitive에 연결(소스 앵커)', () => {
  // projSpeedPct → vx,vy 1회 스케일
  assert.match(gameHtml,/if\(!p\._psApplied\)\{p\._psApplied=1;const _ps=_eqAffix\('projSpeedPct'\);if\(_ps>0\)\{p\.vx\*=\(1\+_ps\);p\.vy\*=\(1\+_ps\);\}\}/,'projSpeedPct 1회 스케일');
  // pierceCount → pierceMax(count-model) 3 사이트
  const pc=[...gameHtml.matchAll(/\(p\._pcBonus\|\|0\)/g)];
  assert.ok(pc.length>=3,'pierceCount pierceMax 확장 ≥3 사이트 (got '+pc.length+')');
  assert.match(gameHtml,/p\._pcBonus=_eqAffix\('pierceCount'\);/,'pierceCount _pcBonus 스폰 계산');
  // splashRadius→explR, splashDmg→explDmg
  assert.match(gameHtml,/const r=\(p\.explR\|\|80\)\*\(1\+_eqAffix\('splashRadius'\)\),dmg=~~\(\(p\.explDmg\|\|~~\(p\.dmg\*\.6\)\)\*\(1\+_eqAffix\('splashDmg'\)\)\)/,'splash explR/explDmg 배선');
});

test('§2 pierceCount E2E — 실제 관통 가능 적 수 증가 (property 아님)', () => {
  // 소스의 실제 cap 식 사용
  assert.match(gameHtml,/const _pMax=\(p\.pierceMax\|\|1\)\+\(p\._pcBonus\|\|0\);/,'generic pierce cap 식');
  function pierceThrough(pierceMax,pcBonus){
    const p={pierce:1,pierceMax,_pcBonus:pcBonus,_pierceCount:0};
    const _pMax=(p.pierceMax||1)+(p._pcBonus||0); // 소스 식과 동일
    let struck=0;
    for(let e=0;e<20;e++){
      struck++;                                    // 이 적 명중
      if(p.pierce>0&&(p._pierceCount||0)<_pMax){p._pierceCount=(p._pierceCount||0)+1;continue} // 28272 로직
      break;
    }
    return struck;
  }
  const base=pierceThrough(1,0);   // pierceMax1 → 2체
  const plus2=pierceThrough(1,2);  // +pierceCount2 → 4체
  assert.equal(base,2,'WITHOUT: pierceMax1 → 2체 명중');
  assert.equal(plus2,4,'WITH pierceCount+2 → 4체 명중');
  assert.equal(plus2-base,2,'증가분 = pierceCount');
  // tiers 의미: cnt (추가 대상 수)
  assert.equal(by('pierceCount').unit,'cnt');
  assert.deepEqual(by('pierceCount').tiers,[1,1,2,2,3]);
});

test('§3 splashRadius geometry E2E — B만 새로 맞음', () => {
  // enemies: A(dist70,base안) B(dist100,증가후안) C(dist200,둘다밖). e.r=0. base explR=80.
  const mkP=()=>({x:0,y:0,explR:80,explDmg:100,dmg:1000,el:0,fireball:true,fireBeamProj:false});
  const mkE=d=>({x:d,y:0,r:0,alive:true,el:0});
  // WITHOUT splashRadius
  let s=buildExplode(0,0);const A0=mkE(70),B0=mkE(100),C0=mkE(200);s.__enemies=[A0,B0,C0];s.f(mkP());
  const hit0=new Set(s.hits.map(h=>h.e));
  assert.ok(hit0.has(A0)&&!hit0.has(B0)&&!hit0.has(C0),'WITHOUT: A만 (r=80)');
  // WITH splashRadius +0.5 → r=120
  s=buildExplode(0.5,0);const A1=mkE(70),B1=mkE(100),C1=mkE(200);s.__enemies=[A1,B1,C1];s.f(mkP());
  const hit1=new Set(s.hits.map(h=>h.e));
  assert.ok(hit1.has(A1)&&hit1.has(B1)&&!hit1.has(C1),'WITH: A+B (B 새로 맞음), C 여전히 밖');
});

test('§4 splashDmg — explosion만 강화, main double-dip 0', () => {
  const mkP=()=>({x:0,y:0,explR:80,explDmg:100,dmg:9999,el:0,fireball:true,fireBeamProj:false}); // dmg 크게 — 영향 없어야
  const mkE=()=>({x:10,y:0,r:0,alive:true,el:0});
  // WITHOUT
  let s=buildExplode(0,0);s.__enemies=[mkE()];s.f(mkP());
  assert.equal(s.hits.length,1,'explosion hit 1회 (double-dip 없음)');
  assert.equal(s.hits[0].dmg,100,'WITHOUT: explDmg=100 (main p.dmg 9999 미반영)');
  // WITH splashDmg +0.5
  s=buildExplode(0,0.5);s.__enemies=[mkE()];s.f(mkP());
  assert.equal(s.hits.length,1,'여전히 1회 (신규 hit 없음)');
  assert.equal(s.hits[0].dmg,150,'WITH: explDmg×1.5=150 (main 불변, explosion만)');
});

test('§5 projSpeedPct E2E — 같은 시간 이동거리 정확히 ×(1+ps), dmg 불변', () => {
  const apply=gameHtml.match(/if\(!p\._psApplied\)\{p\._psApplied=1;const _ps=_eqAffix\('projSpeedPct'\);if\(_ps>0\)\{p\.vx\*=\(1\+_ps\);p\.vy\*=\(1\+_ps\);\}\}/)[0];
  function travel(ps){
    const _eqAffix=id=>id==='projSpeedPct'?ps:0;
    const p={vx:5,vy:0,_psApplied:0,dmg:777};
    new Function('p','_eqAffix',apply)(p,_eqAffix);   // 소스 식 그대로 실행
    let x=0;for(let f=0;f<10;f++)x+=p.vx*1;           // sp=1, 10프레임
    return {x,dmg:p.dmg};
  }
  const a=travel(0),b=travel(0.4);
  assert.equal(a.x,50,'WITHOUT: vx5×10=50');
  assert.ok(Math.abs(b.x-70)<1e-9,'WITH +0.4: 5×1.4×10=70');
  assert.ok(Math.abs(b.x/a.x-1.4)<1e-9,'거리비 = 1+ps');
  assert.equal(b.dmg,777,'damage 불변');
});

test('§6 homing/bounce speed retention — 방향 재계산 후 속도 유지', () => {
  // 소스 homing 재계산: p.vx=Math.cos(ca+turn)*spd; p.vy=Math.sin(ca+turn)*spd (spd=magnitude)
  assert.match(gameHtml,/p\.vx=Math\.cos\(ca\+turn\)\*spd;p\.vy=Math\.sin\(ca\+turn\)\*spd;/,'homing은 spd magnitude로 재계산');
  assert.match(gameHtml,/if\(hWall\)p\.vx=-p\.vx; if\(vWall\)p\.vy=-p\.vy;/,'bounce는 반사(magnitude 보존)');
  // 시뮬: projSpeed 적용 후 magnitude, homing 재계산해도 동일
  const p={vx:5,vy:0};const ps=0.4;p.vx*=(1+ps);p.vy*=(1+ps);
  const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
  const ca=Math.atan2(p.vy,p.vx),turn=0.3;
  p.vx=Math.cos(ca+turn)*spd;p.vy=Math.sin(ca+turn)*spd; // homing 재계산
  const spd2=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
  assert.ok(Math.abs(spd2-spd)<1e-9,'homing 후 속도 유지(증가분 소실 없음)');
  // bounce
  p.vx=-p.vx;const spd3=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
  assert.ok(Math.abs(spd3-spd)<1e-9,'bounce 후 속도 유지');
});

test('§7 기존 working L5-B 불변 — chainTarget/staggerExplosion/pierceFlat', () => {
  assert.match(gameHtml,/const _ctN=~~\(_eqAffix\('chainTarget'\)\)/,'chainTarget consumer 불변');
  assert.match(gameHtml,/if\(_eqAffix\('staggerExplosion'\)>0\)\{const _seD=~~\(dmg\*_eqAffix\('staggerExplosion'\)\)/,'staggerExplosion consumer 불변');
  assert.match(gameHtml,/p\._pierceRate=50\+_eqAffix\('pierceFlat'\);/,'pierceFlat=rate-model 불변');
  // pierceFlat(rate)와 pierceCount(count) 의미 분리
  assert.ok(!/_pierceRate.*pierceCount|pierceCount.*_pierceRate/.test(gameHtml),'pierceCount는 _pierceRate 미간섭');
});

test('§8 family metadata — 4종 태깅(Extraction 대비), roll filter 미사용', () => {
  assert.deepEqual(by('pierceCount').family,['PROJECTILE']);
  assert.deepEqual(by('projSpeedPct').family,['PROJECTILE']);
  assert.deepEqual(by('splashRadius').family,['ORB','BEAM']); // explR/explDmg 사용 family(fireball=ORB, fireBeam=BEAM)
  assert.deepEqual(by('splashDmg').family,['ORB','BEAM']);
  // roller가 family를 읽지 않음(roll distribution 불변)
  const roller=gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
  const legacy=gameHtml.match(/function rollAffixes\(grade,slot,brType\)\{[\s\S]*?\n  return result;\n\}/)[0];
  assert.ok(!/\.family/.test(roller)&&!/\.family/.test(legacy),'roller는 .family 미참조 (filter 미사용)');
});

test('§9 4종 pool 구조 불변 — L5-B, compat OFFENSE, tiers 5, uni 없음', () => {
  for(const id of NEW4){const a=by(id);
    assert.ok(a,id);assert.equal(a.layer,5,id+' L5');assert.equal(a.sub,'B',id+' B');
    assert.ok(a.compat&&a.compat.includes('OFFENSE'),id+' OFFENSE');assert.ok(!('uni'in a),id+' uni 없음');
    assert.equal(a.tiers.length,5,id+' tiers5');}
});

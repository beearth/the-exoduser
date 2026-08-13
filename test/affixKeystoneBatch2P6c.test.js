import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6C / LOCK-31] KEYSTONE BATCH 2 — 뿌리내린거인 + 핏빛계약 ═══
// LOCK-6: 거인=정지중 피해+50%·DR+15%/이속-25% · 핏빛=흡혈×2/물약·lifeRegen-50%(흡혈·시스템복원 제외).
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);
function buildKs(equip){
  const fns=['_ksBloodOath','_ksNoCrit','_ksDmgMul','_ksTakenMul','_ksRootedGiant','_ksBloodPact','_ksLifestealMul','_ksHealMul'].map(n=>gameHtml.match(new RegExp('function '+n+'\\(\\)\\{[^}]*\\}'))[0]).join('\n');
  const _eqAffix=id=>equip[id]||0;
  return new Function('_eqAffix',fns+'\nreturn {_ksBloodOath,_ksNoCrit,_ksDmgMul,_ksTakenMul,_ksRootedGiant,_ksBloodPact,_ksLifestealMul,_ksHealMul};')(_eqAffix);
}

// ══════════════════════════════════════════════════════════════
test('§1 pool — 거인(L5-B/armor)·핏빛(L6-B/wpn), keystone:1 v2only', () => {
  const rg=by('ksRootedGiant'), bp=by('ksBloodPact');
  assert.deepEqual([rg.layer,rg.sub,rg.slots[0],rg.keystone,rg.v2only],[5,'B','armor',1,1]);
  assert.deepEqual([bp.layer,bp.sub,bp.slots[0],bp.keystone,bp.v2only],[6,'B','wpn',1,1]);
});

test('§2 standing 판정 — position-delta + P6D epsilon 하드닝(sub-pixel noise 흡수)', () => {
  // [P6D] exact-equality → squared-epsilon(_KS_MOVE_EPS2). walk step ≫ eps라 게임플레이 불변, float noise/초미세 nudge만 정지로.
  const blk=gameHtml.match(/if\(P\)\{const _mdx=P\._lastX===undefined\?0:P\.x-P\._lastX,_mdy=P\._lastX===undefined\?0:P\.y-P\._lastY;P\._moving=\(P\._lastX!==undefined&&\(_mdx\*_mdx\+_mdy\*_mdy\)>_KS_MOVE_EPS2\);P\._lastX=P\.x;P\._lastY=P\.y;\}/)[0];
  assert.ok(blk,'position-delta+epsilon 배선(update 시작부)');
  const EPS2=gameHtml.match(/const _KS_MOVE_EPS2=([^;]+);/)[1];
  const eps2=new Function('return '+EPS2)();
  assert.ok(Math.abs(eps2-0.0025)<1e-12,'_KS_MOVE_EPS2=0.05² (px²)');
  function step(P){new Function('P','_KS_MOVE_EPS2',blk)(P,eps2);return P._moving}
  const P={x:0,y:0};
  assert.equal(step(P),false,'첫 프레임: _lastX undefined → 정지(false)');
  assert.equal(step(P),false,'위치 불변(Δ=0) → 정지');
  P.x=5;assert.equal(step(P),true,'실제 walk(Δ5px) → 이동');
  assert.equal(step(P),false,'다시 불변 → 정지');
  // sub-pixel noise(<0.05px) → 정지 유지(깜빡임 방지)
  P.x+=0.03;assert.equal(step(P),false,'Δ0.03px noise → 정지(흡수)');
  P.x+=0.03;P.y+=0.03;assert.equal(step(P),false,'대각 Δ(0.03,0.03)=0.0018<eps → 정지');
  // 임계 근처: 0.05px 초과 이동은 이동으로
  P.x+=0.06;assert.equal(step(P),true,'Δ0.06px>0.05 → 이동');
  // standingDmg는 여전히 consumer 없음(DEAD, 재사용 불가였음)
  assert.equal([...gameHtml.matchAll(/_eqAffix\('standingDmg'\)/g)].length,0,'standingDmg 여전히 DEAD');
});

test('§3 거인 — 이속 -25% (applyStats 최종 speed)', () => {
  assert.match(gameHtml,/if\(_ksRootedGiant\(\)\)P\.speed\*=0\.75;/,'이속 ×0.75 배선');
  function speedAfter(base,on){const blk='if(_ksRootedGiant())P.speed*=0.75;';const P={speed:base};new Function('P','_ksRootedGiant',blk)(P,()=>on);return P.speed}
  assert.equal(speedAfter(4,true),3,'S 4 → ×0.75 = 3');
  assert.equal(speedAfter(4,false),4,'미장착 S 유지');
});

test('§4 거인 — 정지중 피해+50% / 이동중 없음 (조건부)', () => {
  assert.match(gameHtml,/if\(_ksRootedGiant\(\)&&!P\._moving\)dmg=~~\(dmg\*1\.5\);/,'정지중 dmg×1.5');
  function dmgOut(base,on,moving){const blk='if(_ksRootedGiant()&&!P._moving)dmg=~~(dmg*1.5);';let dmg=base;const P={_moving:moving};dmg=new Function('dmg','P','_ksRootedGiant',blk+';return dmg;')(dmg,P,()=>on);return dmg}
  assert.equal(dmgOut(1000,true,false),1500,'장착+정지 → ×1.5');
  assert.equal(dmgOut(1000,true,true),1000,'장착+이동 → 없음');
  assert.equal(dmgOut(1000,false,false),1000,'미장착+정지 → 없음');
});

test('§5 거인 — 정지중 DR+15%(캡 우회 ×0.85) / 이동중 없음', () => {
  assert.match(gameHtml,/if\(_ksRootedGiant\(\)&&!P\._moving\)a=~~\(a\*0\.85\);/,'정지중 incoming ×0.85');
  function inc(base,on,moving){const blk='if(_ksRootedGiant()&&!P._moving)a=~~(a*0.85);';let a=base;const P={_moving:moving};a=new Function('a','P','_ksRootedGiant',blk+';return a;')(a,P,()=>on);return a}
  assert.equal(inc(1000,true,false),850,'장착+정지 → ×0.85(-15%)');
  assert.equal(inc(1000,true,true),1000,'장착+이동 → 없음');
  assert.equal(inc(1000,false,false),1000,'미장착 → 없음');
  // 유리대검(_ksTakenMul)과 순서: 유리 먼저 ×1.25 then 거인 ×0.85 (인접 라인, 둘 다 shield+HP 공통 a에; 주석 허용)
  assert.match(gameHtml,/a=~~\(a\*_ksTakenMul\(\)\);[^\n]*\n\s*if\(_ksRootedGiant\(\)&&!P\._moving\)a=~~\(a\*0\.85\);/,'유리 후 거인 DR 순서');
});

test('§6 핏빛 — 흡혈 ×2 (흡혈 전용, 회복 -50% penalty 미적용)', () => {
  assert.match(gameHtml,/P\.hp\+dmg\*_ll\*_ksLifestealMul\(\)/,'흡혈 ×_ksLifestealMul(2)');
  const on=buildKs({ksBloodPact:1}), off=buildKs({});
  assert.equal(on._ksLifestealMul(),2,'핏빛 흡혈 ×2');
  assert.equal(off._ksLifestealMul(),1,'미장착 ×1');
  // 흡혈 라인은 _ksHealMul(회복penalty) 미포함 → net ×2(상쇄 없음)
  const leechLine=gameHtml.match(/P\.hp=Math\.min\(P\.mhp,P\.hp\+dmg\*_ll\*_ksLifestealMul\(\)\)/)[0];
  assert.ok(!/_ksHealMul/.test(leechLine),'흡혈에 회복penalty 미적용(net ×2, ×2×0.5=×1 상쇄 아님)');
  // base 흡혈 0이면 결과 0
  const D=1000,ll=0;assert.equal(D*ll*on._ksLifestealMul(),0,'base 흡혈 0 → heal 0');
  assert.equal(D*0.04*on._ksLifestealMul(),80,'ll 0.04, D1000 → ×2 = 80');
});

test('§7 핏빛 — 물약·lifeRegen -50% (흡혈·시스템복원 제외)', () => {
  const on=buildKs({ksBloodPact:1});
  assert.equal(on._ksHealMul(),0.5,'핏빛 회복 ×0.5');
  assert.equal(buildKs({})._ksHealMul(),1,'미장착 ×1');
  // 물약(potHeal) 3사이트 + regen 1사이트 = _ksHealMul 4곳
  assert.equal([...gameHtml.matchAll(/\*_ksHealMul\(\)/g)].length,4,'_ksHealMul = 물약3 + regen1 = 4곳');
  assert.match(gameHtml,/~~\(potHeal\('hp'\)\*\(1\+_eqAffix\('potionPower'\)\)\*_ksHealMul\(\)\)/,'물약 heal ×0.5');
  assert.match(gameHtml,/P\.hp\+_hpr\/_regenDiv\*sp\*_ksHealMul\(\)/,'lifeRegen ×0.5');
});

test('§8 핏빛 heal scope — 시스템복원/흡혈은 penalty 제외 (전수)', () => {
  // 시스템 복원 P.hp=P.mhp 계열은 _ksHealMul 미적용(정상 초기화)
  const restores=[...gameHtml.matchAll(/P\.hp=P\.mhp[;,]/g)];
  assert.ok(restores.length>0,'시스템 복원(P.hp=P.mhp) 존재');
  for(const m of restores){const seg=gameHtml.slice(m.index,m.index+40);assert.ok(!/_ksHealMul/.test(seg),'시스템 복원에 heal penalty 미적용')}
  // 흡혈은 _ksLifestealMul만(위 §6), _ksHealMul은 물약/regen만(§7 4곳) — scope 분리 확정
  // 소비 호출부(*_ksLifestealMul) = 흡혈 1곳 (정의 function _ksLifestealMul 제외)
  assert.equal([...gameHtml.matchAll(/\*_ksLifestealMul\(\)/g)].length,1,'흡혈 배율 소비 1곳(흡혈만)');
});

test('§9 5-keystone eligibility — layer gate / slot / item당 1개', () => {
  const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const flag=gameHtml.match(/const KEYSTONE_ROLL_ENABLED=[^;]*;/)[0];
  const krate=gameHtml.match(/const KEYSTONE_ROLL_RATE=[^;]*;/)[0]; // [P6K] flag ON path rate 게이트
  const fCand=gameHtml.match(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/)[0];
  const fCount=gameHtml.match(/function _itemKeystoneCount\(item\)\{.*\}/)[0];
  const fRoll=gameHtml.match(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/)[0];
  const e=new Function('AFFIX_POOL',`${afslot}\n${flag}\n${krate}\nfunction _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${fCand}\n${fCount}\n${fRoll}\nreturn {_keystoneCandidates,_rollKeystoneOnItem};`)(POOL);
  // 5종 전체
  assert.equal(POOL.filter(a=>a.keystone).length,5,'keystone 5종');
  // 8단 하드 게이트(layerLv<8 → []): wpn/armor 공통
  assert.equal(e._keystoneCandidates('wpn',7).length,0,'wpn 7단 → 게이트 0');
  assert.equal(e._keystoneCandidates('armor',4).length,0,'armor 4단 → 게이트 0');
  // wpn 8단: 무딘(8)·유리(7)·핏빛(6) / armor 8단: 혈석(3)·거인(5)  (a.layer≤layerLv 보조필터, 8단선 전부 통과)
  assert.deepEqual(e._keystoneCandidates('wpn',8).map(a=>a.id).sort(),['ksBloodPact','ksDullConviction','ksGlassGreatsword']);
  assert.deepEqual(e._keystoneCandidates('armor',8).map(a=>a.id).sort(),['ksBloodOath','ksRootedGiant']);
  // 아이템당 1개 cap: 이미 거인 있으면 추가 0
  assert.equal(e._rollKeystoneOnItem({slot:'armor',layerLv:10,affixes:[{id:'ksRootedGiant',value:1}]},true),null,'1개 cap');
  // [P6K] non-eligible(layer<8) → null (candidate 0, flag 무관·안정). eligible 2%는 P6d §3/P6k §7 대량검증.
  assert.equal(e._rollKeystoneOnItem({slot:'weapon',layerLv:7,affixes:[]},false),null,'layer<8 → 미출현(flag 무관)');
});

test('§10 Batch1 regression + count', () => {
  assert.match(gameHtml,/if\(Math\.random\(\)\*100<statCrit\(\)\+_crBonus&&!_ksNoCrit\(\)\)\{/,'무딘 crit gate');
  assert.match(gameHtml,/dmg=~~\(dmg\*_ksDmgMul\(\)\);/,'무딘/유리 outgoing');
  assert.match(gameHtml,/if\(_ksBloodOath\(\)\)\{P\.mhp=~~\(P\.mhp\*1\.8\)/,'혈석');
  const g=buildKs({ksGlassGreatsword:1}),d=buildKs({ksDullConviction:1});
  assert.equal(g._ksDmgMul(),1.4);assert.equal(g._ksTakenMul(),1.25);assert.equal(d._ksNoCrit(),true);
  assert.equal(POOL.length,415);assert.equal(POOL.filter(a=>a.sub==='B').length,163);
});

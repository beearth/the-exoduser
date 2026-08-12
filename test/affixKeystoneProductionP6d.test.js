import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6D / LOCK-32] KEYSTONE PRODUCTION CLOSURE ═══
// roll economy(확률+균등선택) · _moving 하드닝 · tooltip contract · save/load · equip visibility.
// 전제: production drop pipeline이 layerLv≥8 미할당 → 실 economy 부재. 로직/확률/UI/save는 완비, 활성화(flag)는 BLOCKED.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);
const KS=['ksDullConviction','ksGlassGreatsword','ksBloodOath','ksRootedGiant','ksBloodPact'];
function seed(n){let s=n>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};}

// ── roll 샌드박스(flag override 가능) ──
function buildRoll(flagOn){
  const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const rate=gameHtml.match(/const KEYSTONE_ROLL_RATE=[^;]*;/)[0];
  const fCand=gameHtml.match(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/)[0];
  const fCount=gameHtml.match(/function _itemKeystoneCount\(item\)\{.*\}/)[0];
  const fRoll=gameHtml.match(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/)[0];
  const src=`const KEYSTONE_ROLL_ENABLED=${flagOn};\n${afslot}\n${rate}\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${fCand}\n${fCount}\n${fRoll}\n`+
    `return {_rollKeystoneOnItem,_keystoneCandidates,_itemKeystoneCount,KEYSTONE_ROLL_RATE};`;
  const mk=new Function('AFFIX_POOL','Math',src);
  return rng=>{const M=Object.create(Math);M.random=rng;return mk(POOL,M);};
}
const eligItem=(slot,layerLv)=>({slot,layerLv,affixes:[]});

// ══════════════════════════════════════════════════════════════
test('§1 runtime FREEZE — 5 combat consumer 무변경(재밸런싱 없음)', () => {
  assert.match(gameHtml,/dmg=~~\(dmg\*_ksDmgMul\(\)\);/,'무딘/유리 outgoing');
  assert.match(gameHtml,/a=~~\(a\*_ksTakenMul\(\)\);/,'유리 incoming');
  assert.match(gameHtml,/if\(_ksBloodOath\(\)\)\{P\.mhp=~~\(P\.mhp\*1\.8\)/,'혈석 maxHP×1.8');
  assert.match(gameHtml,/if\(_ksRootedGiant\(\)&&!P\._moving\)dmg=~~\(dmg\*1\.5\);/,'거인 정지 dmg×1.5');
  assert.match(gameHtml,/if\(_ksRootedGiant\(\)&&!P\._moving\)a=~~\(a\*0\.85\);/,'거인 정지 DR×0.85');
  assert.match(gameHtml,/if\(_ksRootedGiant\(\)\)P\.speed\*=0\.75;/,'거인 이속×0.75');
  assert.match(gameHtml,/P\.hp\+dmg\*_ll\*_ksLifestealMul\(\)/,'핏빛 흡혈×2');
  assert.equal([...gameHtml.matchAll(/\*_ksHealMul\(\)/g)].length,4,'핏빛 회복×0.5 = 4곳(물약3+regen1)');
});

test('§2 Rooted _moving 하드닝 — teleport/knockback/stationary/noise robustness', () => {
  const blk=gameHtml.match(/if\(P\)\{const _mdx=[\s\S]*?P\._lastY=P\.y;\}/)[0];
  const eps2=new Function('return '+gameHtml.match(/const _KS_MOVE_EPS2=([^;]+);/)[1])();
  const step=P=>{new Function('P','_KS_MOVE_EPS2',blk)(P,eps2);return P._moving};
  // 최초 frame
  const P={x:100,y:100};assert.equal(step(P),false,'첫 프레임 정지');
  // stationary(Δ0)
  assert.equal(step(P),false,'정지 유지');
  // stationary → moving(walk)
  P.x+=4;assert.equal(step(P),true,'walk 이동');
  // moving → stationary
  assert.equal(step(P),false,'정지 복귀');
  // teleport(대변위) → 1프레임 이동
  P.x=9999;P.y=-9999;assert.equal(step(P),true,'teleport=이동');
  assert.equal(step(P),false,'teleport 후 정지');
  // knockback 감쇠 꼬리(Δ<eps) → 정지(깜빡임 방지)
  P.x+=0.02;assert.equal(step(P),false,'kb 잔여 0.02px → 정지');
  // float noise 누적(각 <eps)
  for(let k=0;k<20;k++){P.x+=0.01;assert.equal(step(P),false,'매프레임 0.01px noise → 정지 안정')}
  // dash(대변위) → 이동
  P.x+=120;assert.equal(step(P),true,'dash=이동');
  // stage transition: lastX 이월 상태에서 spawn 점프 → 1프레임 이동 후 정지
  P.x=50;P.y=50;assert.equal(step(P),true,'stage transition 점프=1프레임 이동');
  assert.equal(step(P),false,'transition 후 정지 안정');
});

test('§3 확률 게이트 — production rate(관측≈2%) + forced=100%', () => {
  const roll=buildRoll(true)(seed(12345));
  // forced=100%: eligible면 항상 부여
  for(let i=0;i<50;i++)assert.ok(roll._rollKeystoneOnItem(eligItem('weapon',10),true),'forced eligible → keystone');
  // production 관측 확률
  const N=200000;let hit=0;
  const r2=buildRoll(true)(seed(777));
  for(let i=0;i<N;i++)if(r2._rollKeystoneOnItem(eligItem('weapon',10),false))hit++;
  const obs=hit/N;
  assert.ok(Math.abs(obs-0.02)<0.002,`관측률 ${(obs*100).toFixed(3)}% ≈ 2% (rate ${r2.KEYSTONE_ROLL_RATE})`);
  assert.equal(r2.KEYSTONE_ROLL_RATE,0.02,'KEYSTONE_ROLL_RATE=0.02');
});

test('§4 layer gate — 1~7 zero / 8~10 occurrence (production+forced 분리)', () => {
  const roll=buildRoll(true)(seed(42));
  // layerLv 1~7 → forced여도 0(게이트)
  for(let lv=1;lv<=7;lv++){
    assert.equal(roll._rollKeystoneOnItem(eligItem('weapon',lv),true),null,`lv${lv} forced → 0`);
    assert.equal(roll._keystoneCandidates('wpn',lv).length,0,`lv${lv} 후보 0`);
  }
  // layerLv 8~10 → 후보 존재 & 출현
  for(let lv=8;lv<=10;lv++){
    assert.ok(roll._keystoneCandidates('wpn',lv).length>0,`lv${lv} 후보 존재`);
    let any=false;for(let i=0;i<2000;i++)if(roll._rollKeystoneOnItem(eligItem('weapon',lv),false)){any=true;break}
    assert.ok(any,`lv${lv} production 출현`);
  }
});

test('§5 one-per-item invariant — 대량 sim 2+ = 0, cap 강제 검증', () => {
  const roll=buildRoll(true)(seed(555));
  // (A) mkItem 배선과 동일한 자연 분포: 아이템당 1회 롤 → 0 또는 1만
  const N=100000;const dist={0:0,1:0,2:0};
  for(let i=0;i<N;i++){
    const it=eligItem(i%2?'weapon':'armor',8+(i%3));
    if(roll._itemKeystoneCount(it)<1){const ks=roll._rollKeystoneOnItem(it,false);if(ks)it.affixes.push(ks);}
    const c=roll._itemKeystoneCount(it);dist[c]=(dist[c]||0)+1;
  }
  assert.equal(dist[2]||0,0,'2+ keystone = 0');
  assert.ok(dist[1]>0,'1 keystone 존재');assert.ok(dist[0]>0,'0 keystone 정상(저확률)');
  assert.ok(Math.abs(dist[1]/N-0.02)<0.003,`자연 1개 비율 ${(dist[1]/N*100).toFixed(2)}% ≈ 2%`);
  // (B) cap 강제: 이미 1개 있는 아이템 → forced(100%)여도 추가 0
  const held={slot:'weapon',layerLv:10,affixes:[{id:'ksDullConviction',value:1}]};
  for(let i=0;i<1000;i++)assert.equal(roll._rollKeystoneOnItem(held,true),null,'기보유 → forced도 cap');
});

test('§6 candidate fairness — slot 내 균등 선택(wpn 3종 1/3, armor 2종 1/2)', () => {
  const roll=buildRoll(true)(seed(9090));
  const cnt={};let wTot=0,aTot=0;
  for(let i=0;i<300000;i++){
    const w=roll._rollKeystoneOnItem(eligItem('weapon',10),true);cnt[w.id]=(cnt[w.id]||0)+1;wTot++;
    const a=roll._rollKeystoneOnItem(eligItem('armor',10),true);cnt[a.id]=(cnt[a.id]||0)+1;aTot++;
  }
  // wpn: 무딘/유리/핏빛 각 ≈1/3
  for(const id of ['ksDullConviction','ksGlassGreatsword','ksBloodPact'])
    assert.ok(Math.abs(cnt[id]/wTot-1/3)<0.01,`${id} wpn ≈1/3 (${(cnt[id]/wTot).toFixed(3)})`);
  // armor: 혈석/거인 각 ≈1/2
  for(const id of ['ksBloodOath','ksRootedGiant'])
    assert.ok(Math.abs(cnt[id]/aTot-1/2)<0.01,`${id} armor ≈1/2 (${(cnt[id]/aTot).toFixed(3)})`);
});

test('§7 5-keystone tooltip contract — [KEYSTONE] label + 장점+대가 둘 다', () => {
  const uiBlk=gameHtml.match(/const _KS_UI=\{[\s\S]*?\n\};/)[0];
  const _KS_UI=new Function('return '+uiBlk.replace(/^const _KS_UI=/,'').replace(/;$/,''))();
  for(const id of KS){
    const K=_KS_UI[id];assert.ok(K,id+' _KS_UI 존재');
    assert.ok(K.n&&K.n[0]&&K.n[1],id+' ko/en 이름');
    assert.ok(K.good&&K.good.length>=1,id+' 장점 있음');
    assert.ok(K.bad&&K.bad.length>=1,id+' 대가 있음(tradeoff 필수)');
  }
  // 렌더러에 [KEYSTONE] 블록 + 장점(▲)+대가(▼) 배선
  assert.match(gameHtml,/\[KEYSTONE\]/,'[KEYSTONE] 라벨');
  assert.match(gameHtml,/for\(const g of K\.good\)stats\+=[\s\S]*?▲/,'장점 ▲ 렌더');
  assert.match(gameHtml,/for\(const b of K\.bad\)stats\+=[\s\S]*?▼/,'대가 ▼ 렌더');
  assert.match(gameHtml,/if\(p&&p\.keystone&&_KS_UI\[af\.id\]\)\{/,'keystone 특수 분기(일반 어픽스와 구별)');
});

test('§8 tooltip semantic — SSOT 일치(핏빛=물약·HP재생, 혈석=에너지실드)', () => {
  const uiBlk=gameHtml.match(/const _KS_UI=\{[\s\S]*?\n\};/)[0];
  const _KS_UI=new Function('return '+uiBlk.replace(/^const _KS_UI=/,'').replace(/;$/,''))();
  // 무딘: +30% / crit 불가
  assert.match(_KS_UI.ksDullConviction.good[0][0],/\+30%/);assert.match(_KS_UI.ksDullConviction.bad[0][0],/치명타/);
  // 유리: +40% / 받는 +25%
  assert.match(_KS_UI.ksGlassGreatsword.good[0][0],/\+40%/);assert.match(_KS_UI.ksGlassGreatsword.bad[0][0],/받는 피해 \+25%/);
  // 혈석: HP+80% / 에너지 실드(enemy 아님)
  assert.match(_KS_UI.ksBloodOath.good[0][0],/HP \+80%/);assert.match(_KS_UI.ksBloodOath.bad[0][0],/에너지 실드/);
  assert.ok(!/적|enemy/i.test(_KS_UI.ksBloodOath.bad[0][0]+_KS_UI.ksBloodOath.bad[0][1]),'혈석 대가에 enemy 혼동 표현 없음');
  // 거인: 정지 +50%·DR+15% / 이속 -25%
  assert.equal(_KS_UI.ksRootedGiant.good.length,2,'거인 장점 2줄(피해+DR)');
  assert.match(_KS_UI.ksRootedGiant.good[0][0],/정지 중.*\+50%/);assert.match(_KS_UI.ksRootedGiant.good[1][0],/정지 중.*\+15%/);
  assert.match(_KS_UI.ksRootedGiant.bad[0][0],/이동 속도 -25%/);
  // 핏빛: 흡혈×2 / "물약·HP재생 -50%" (전체회복 아님)
  assert.match(_KS_UI.ksBloodPact.good[0][0],/흡혈.*×2/);
  assert.match(_KS_UI.ksBloodPact.bad[0][0],/물약.*HP재생.*-50%/);
  assert.ok(!/모든 회복|all heal/i.test(_KS_UI.ksBloodPact.bad[0][0]+_KS_UI.ksBloodPact.bad[0][1]),'핏빛 대가에 "모든 회복" 금지(범위 정확)');
});

test('§9 save/load — affix-ID만으로 복원(runtime state 미저장)', () => {
  // keystone 아이템 = 일반 affix 1개(id,value 마커). JSON round-trip → equip → _eqAffix → 효과 helper true.
  const item={slot:'armor',layerLv:10,affixes:[{id:'ksRootedGiant',tier:0,value:1}]};
  const restored=JSON.parse(JSON.stringify(item)); // save→load
  assert.deepEqual(restored.affixes,item.affixes,'affix round-trip 동일');
  // runtime 파생 상태(_ks*)가 아이템에 저장되지 않음 — affixes 외 keystone 필드 없음
  assert.ok(!('_ksRootedGiant'in restored)&&!('_moving'in restored),'runtime 파생 필드 미저장');
  // _eqAffix 재구성 → helper 복원
  const fRebuild=gameHtml.match(/function _eqAffixRebuild\(\)\{.*\}/)[0];
  const fEq=gameHtml.match(/function _eqAffix\(id\)\{[^}]*\}/)[0];
  const fRG=gameHtml.match(/function _ksRootedGiant\(\)\{[^}]*\}/)[0];
  const env=new Function('SLOT_NAMES','INV',`let _eqAffixCache=null;${fRebuild}\n${fEq}\n${fRG}\nreturn {_eqAffix,_ksRootedGiant};`)
    (['armor'],{equipped:{armor:restored}});
  assert.equal(env._eqAffix('ksRootedGiant'),1,'load 후 _eqAffix=1');
  assert.equal(env._ksRootedGiant(),true,'load 후 거인 효과 복원(affix-ID만으로)');
});

test('§10 equip visibility — keystone 마커 배선', () => {
  assert.match(gameHtml,/function _itemHasKeystone\(it\)\{return !!\(it&&it\.affixes&&it\.affixes\.some\(a=>_isKeystone\(a\.id\)\)\)\}/,'_itemHasKeystone');
  assert.match(gameHtml,/if\(_itemHasKeystone\(item\)\)_markHtml\+=/,'inv 셀 keystone 마커(◈)');
  assert.match(gameHtml,/keystone:1/,'keystone:1 metadata 유지(§15 extraction 대비)');
});

test('§11 production wire — flag-gated inert(legacy byte-identical) + append-only(C1 무손상)', () => {
  assert.match(gameHtml,/const KEYSTONE_ROLL_ENABLED=false;/,'flag off(BLOCKED — economy 부재)');
  // mkItem 배선: flag로 단락 → Math.random 미소비 → 레거시 동일. append만(정상 affix 제거 없음).
  assert.match(gameHtml,/if\(KEYSTONE_ROLL_ENABLED&&item\.affixes&&_itemKeystoneCount\(item\)<1\)\{const _ks=_rollKeystoneOnItem\(item,false\);if\(_ks\)item\.affixes\.push\(_ks\);\}/,'mkItem 배선(append-only, flag-gated)');
  // flag off → 실제 롤 null
  const rollOff=buildRoll(false)(seed(1));
  assert.equal(rollOff._rollKeystoneOnItem(eligItem('weapon',10),false),null,'flag off → production 미출현');
  // 일반 롤 후보 제외(C1: keystone은 일반 layered 롤 distribution 불변)
  assert.match(gameHtml,/if\(a\.keystone\)continue;/,'_affixLayerCandidates keystone 제외(C1 불변)');
});

test('§12 slot eligibility — wpn:3 / armor:2 후보(HEAD 정확)', () => {
  const roll=buildRoll(true)(seed(3));
  assert.deepEqual(roll._keystoneCandidates('wpn',10).map(a=>a.id).sort(),['ksBloodPact','ksDullConviction','ksGlassGreatsword']);
  assert.deepEqual(roll._keystoneCandidates('armor',10).map(a=>a.id).sort(),['ksBloodOath','ksRootedGiant']);
  // 그 외 슬롯 후보 0(현재 5종은 wpn/armor 전용)
  for(const s of ['shield','bracelet','helmet','ring1'])assert.equal(roll._keystoneCandidates(s,10).length,0,s+' 후보 0');
  assert.equal(POOL.filter(a=>a.keystone).length,5,'keystone 5종');
});

test('§13 Batch1/2 runtime regression + legacy v2only', () => {
  const g=gameHtml;
  assert.match(g,/if\(Math\.random\(\)\*100<statCrit\(\)\+_crBonus&&!_ksNoCrit\(\)\)\{/,'무딘 crit gate 무변경');
  for(const id of KS)assert.equal(by(id).v2only,1,id+' v2only(legacy byte-identical)');
  assert.equal(POOL.length,415);assert.equal(POOL.filter(a=>a.sub==='B').length,163);
});

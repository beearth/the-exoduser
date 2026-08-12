import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6B / LOCK-30] KEYSTONE BATCH 1 — 무딘확신·유리대검·혈석의서약 ═══
// LOCK-6 트레이드오프 3종 combat consumer + eligibility(8단+/1개 cap). 확률 UNRESOLVED(flag off).
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);
const KS=['ksDullConviction','ksGlassGreatsword','ksBloodOath'];

// ── keystone 헬퍼 추출(controlled _eqAffix) ──
function buildKs(equip){
  const fns=['_ksBloodOath','_ksNoCrit','_ksDmgMul','_ksTakenMul'].map(n=>gameHtml.match(new RegExp('function '+n+'\\(\\)\\{[^}]*\\}'))[0]).join('\n');
  const _eqAffix=id=>equip[id]||0;
  return new Function('_eqAffix',fns+'\nreturn {_ksBloodOath,_ksNoCrit,_ksDmgMul,_ksTakenMul};')(_eqAffix);
}
// ── eligibility 추출(_getAffixDef는 동등 pool-find 스텁) ──
function buildEligibility(){
  const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const flag=gameHtml.match(/const KEYSTONE_ROLL_ENABLED=[^;]*;/)[0];
  const fCand=gameHtml.match(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/)[0];
  const fCount=gameHtml.match(/function _itemKeystoneCount\(item\)\{.*\}/)[0];
  const fRoll=gameHtml.match(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/)[0];
  return new Function('AFFIX_POOL',`${afslot}\n${flag}\nfunction _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${fCand}\n${fCount}\n${fRoll}\nreturn {_keystoneCandidates,_itemKeystoneCount,_rollKeystoneOnItem,KEYSTONE_ROLL_ENABLED};`)(POOL);
}

// ══════════════════════════════════════════════════════════════
test('§1 keystone representation — 3종 pool(keystone:1, v2only, 정상 롤 제외)', () => {
  const map={ksDullConviction:[8,'wpn'],ksGlassGreatsword:[7,'wpn'],ksBloodOath:[3,'armor']};
  for(const id of KS){const a=by(id);assert.ok(a,id);assert.equal(a.keystone,1,id+' keystone:1');assert.equal(a.v2only,1,id+' v2only');
    assert.equal(a.sub,'B');assert.equal(a.tiers.length,5);assert.ok(a.compat&&a.compat.length>=1,id+' compat');
    assert.equal(a.layer,map[id][0]);assert.equal(a.slots[0],map[id][1]);}
  // 일반 롤 후보 제외 앵커
  assert.match(gameHtml,/if\(a\.keystone\)continue;/,'_affixLayerCandidates keystone 제외');
});

test('§2 무딘확신 — 배선 + _ksDmgMul/_ksNoCrit', () => {
  assert.match(gameHtml,/if\(Math\.random\(\)\*100<statCrit\(\)\+_crBonus&&!_ksNoCrit\(\)\)\{/,'crit gate(&&!_ksNoCrit, Math.random 선평가)');
  assert.match(gameHtml,/dmg=~~\(dmg\*_ksDmgMul\(\)\);/,'outgoing +% (eShield 직전)');
  const none=buildKs({}), dull=buildKs({ksDullConviction:1});
  assert.equal(none._ksDmgMul(),1,'미장착 ×1.0');
  assert.equal(dull._ksDmgMul(),1.3,'무딘확신 ×1.30');
  assert.equal(none._ksNoCrit(),false);assert.equal(dull._ksNoCrit(),true);
});

test('§3 무딘확신 crit 불가 — statCrit 무관, RNG parity', () => {
  // 소스: if(Math.random()*100<statCrit()+_crBonus && !_ksNoCrit()){crit}
  function crit(noCrit,roll,statCrit){ /* roll=Math.random() 소비됨(선평가) */ return (roll*100<statCrit)&&!noCrit; }
  // 100% crit 상태(statCrit 100)라도 keystone이면 crit 0
  assert.equal(crit(true,0.0,100),false,'100% crit override → crit 0');
  assert.equal(crit(true,0.99,100),false,'keystone 중 항상 crit 0');
  // 미장착: 정상 crit
  assert.equal(crit(false,0.10,50),true,'미장착 정상 crit(roll<statCrit)');
  assert.equal(crit(false,0.90,50),false,'미장착 정상 non-crit');
  // RNG: Math.random은 && 앞이라 keystone 여부 무관하게 항상 호출(소스 확인)
  assert.match(gameHtml,/Math\.random\(\)\*100<statCrit\(\)\+_crBonus&&!_ksNoCrit\(\)/,'Math.random 선평가(RNG sequence 불변)');
});

test('§4 유리대검 — outgoing ×1.40 / incoming ×1.25 배선', () => {
  assert.match(gameHtml,/a=~~\(a\*_ksTakenMul\(\)\);/,'hurtP incoming +25% (DR 후 최종 1회)');
  const glass=buildKs({ksGlassGreatsword:1});
  assert.equal(glass._ksDmgMul(),1.4,'유리대검 주는 ×1.40');
  assert.equal(glass._ksTakenMul(),1.25,'유리대검 받는 ×1.25');
  // 미장착 incoming ×1.0
  assert.equal(buildKs({})._ksTakenMul(),1);
});

test('§5 비정상 동시 장착 fixture — 무한/NaN 없음(가산)', () => {
  const both=buildKs({ksDullConviction:1,ksGlassGreatsword:1});
  assert.ok(Math.abs(both._ksDmgMul()-1.7)<1e-9,'무딘+유리 가산 1+0.3+0.4≈1.70(무한/NaN 없음)');
  assert.ok(Number.isFinite(both._ksDmgMul())&&Number.isFinite(both._ksTakenMul()),'유한');
});

test('§6 혈석의서약 — maxHP×1.8 / 플레이어 shield 0 (enemy eShield 무관)', () => {
  const blk=gameHtml.match(/if\(_ksBloodOath\(\)\)\{P\.mhp=~~\(P\.mhp\*1\.8\);P\.hp=Math\.min\(P\.hp,P\.mhp\);P\.mshield=0;P\.shield=0\}/)[0];
  assert.ok(blk,'혈석 배선 존재');
  assert.ok(!/e\.eShield|e\.eShieldMax/.test(blk),'enemy e.eShield 미접촉(플레이어 P.mshield/shield만)');
  function bloodOath(mhp,hp,mshield,shield,on){const P={mhp,hp,mshield,shield};new Function('P','_ksBloodOath',blk)(P,()=>on);return P}
  // 장착: mhp×1.8, 현재HP 무상헐링(min), shield 0
  let P=bloodOath(1000,700,150,150,true);
  assert.equal(P.mhp,1800,'maxHP ×1.8');assert.equal(P.hp,700,'현재 HP 무상헐링(min 유지)');
  assert.equal(P.mshield,0,'플레이어 max shield 0');assert.equal(P.shield,0,'현재 shield 0');
  // 미장착: 불변
  P=bloodOath(1000,700,150,150,false);
  assert.deepEqual([P.mhp,P.hp,P.mshield,P.shield],[1000,700,150,150],'미장착 불변');
  // current HP > new max 케이스(해제 clamp는 applyStats P.hp=min(P.hp,P.mhp) 선례): 장착시도 hp 900 → min(1800) 유지
  assert.equal(bloodOath(1000,900,0,0,true).hp,900,'hp 900 ≤ 1800 유지');
});

test('§7 혈석 tradeoff — afterParryShield도 shield 금지(mshield=0)', () => {
  // ksBloodOath로 P.mshield=0이면 afterParryShield P.shield=min(0,shield+val)=0
  const apsBlk=gameHtml.match(/\{const _apS=_eqAffix\('afterParryShield'\);if\(_apS>0\)\{P\.shield=Math\.min\(P\.mshield,P\.shield\+_apS\);[^\n]*\}\}/)[0];
  const P={shield:0,mshield:0,x:0,y:0}; // 혈석 적용 후 상태
  new Function('P','_eqAffix','_T','addTxt',apsBlk)(P,id=>id==='afterParryShield'?60:0,s=>s,()=>{});
  assert.equal(P.shield,0,'mshield=0이면 afterParryShield로도 shield 안 생김(tradeoff 강제)');
});

test('§8 eligibility — 8단 게이트 / slot / 아이템당 1개 cap / 확률 미결정', () => {
  const e=buildEligibility();
  assert.equal(e.KEYSTONE_ROLL_ENABLED,false,'확률 UNRESOLVED → flag off');
  // 8단 미만 → 후보 0
  assert.equal(e._keystoneCandidates('wpn',7).length,0,'layerLv 7 → 후보 0');
  // 8단+ wpn → 무딘(8)·유리(7)·핏빛(6) (P6C 핏빛 wpn 추가)
  const c8=e._keystoneCandidates('wpn',8).map(a=>a.id).sort();
  assert.deepEqual(c8,['ksBloodPact','ksDullConviction','ksGlassGreatsword'],'wpn 8단 → 무딘·유리·핏빛');
  // armor 8단 → 혈석(3)·거인(5) (P6C 거인 armor 추가)
  assert.deepEqual(e._keystoneCandidates('armor',8).map(a=>a.id).sort(),['ksBloodOath','ksRootedGiant'],'armor 8단 → 혈석·거인');
  // forced 아니고 flag off → null (silent random roll 없음)
  assert.equal(e._rollKeystoneOnItem({slot:'weapon',layerLv:10,affixes:[]},false),null,'flag off → 미출현');
  // forced → 후보 1개 부여
  const r=e._rollKeystoneOnItem({slot:'weapon',layerLv:10,affixes:[]},true);
  assert.ok(r&&by(r.id).keystone,'forced → keystone 1개');
  // 이미 1개 → cap(추가 0)
  assert.equal(e._rollKeystoneOnItem({slot:'weapon',layerLv:10,affixes:[{id:'ksDullConviction',value:1}]},true),null,'아이템당 1개 cap');
  // 8단 미만 forced여도 후보 0 → null
  assert.equal(e._rollKeystoneOnItem({slot:'weapon',layerLv:7,affixes:[]},true),null,'8단 미만 → 미출현');
});

test('§9 legacy/구조 보호 — POOL 413/B 161, keystone은 v2only(legacy byte-identical)', () => {
  assert.equal(POOL.length,415);assert.equal(POOL.filter(a=>a.sub==='B').length,163);
  for(const id of KS)assert.equal(by(id).v2only,1,id+' v2only(legacy 제외)');
});

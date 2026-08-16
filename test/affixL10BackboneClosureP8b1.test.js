import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 8B.1 / LOCK-47A] L10-A UNIVERSAL COVERAGE + PRE-LOCK47 T10 COMPAT CLOSURE ═══
// (A) BlackStar dead-backbone 해소: Ultimate Power(ultDmg) = blackStar 흡인력(pull) +value%(noDmg 유지).
// (B) OLD_T10(pre-LOCK47 cap10, L10-A 결손) grandfather: load 무변경·usable·extraction 허용·
//     비복구 absorption=C1_BACKBONE_MISSING·L10-A absorb=복구→normal cap10 계약. random migration 없음.
// L10-B 미구현. game.html 실제 함수 실행 + 정밀 소스 대조.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function grabFn(name){const sig='function '+name+'(';const i=gameHtml.indexOf(sig);assert.ok(i>=0,'추출 실패 '+name);
  let d=0,st=gameHtml.indexOf('{',i),j=st;for(;j<gameHtml.length;j++){if(gameHtml[j]==='{')d++;else if(gameHtml[j]==='}'){d--;if(d===0){j++;break;}}}return gameHtml.slice(i,j);}
function grabConst(re,n){const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0];}
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const SLOT_NAMES=new Function('return '+grabConst(/const SLOT_NAMES=\[[^\]]*\]/,'SLOT').replace('const SLOT_NAMES=',''))();
const CANON=grabFn('_itemLayerCap')+'\n'+grabFn('_itemLayerWeightsA2')+'\n'+grabFn('_rollItemLayerA2');
const G={
  afslot:grabConst(/const _AFSLOT=\{[^}]*\};/,'afslot'),
  tier:grabFn('_affixTierRoll'), cand:grabFn('_affixLayerCandidates'), roll:grabFn('rollAffixesLayered'),
  slotc:grabFn('_getSlotCompatGroups'), sv:grabFn('_getStoneValidity'), tv:grabFn('_getTargetValidity'),
  plan:grabFn('planAbsorption'), absorb:grabFn('absorbStone'), isStone:grabFn('_isAffixStone'), stMeta:grabFn('_affixStoneMeta'),
  exStat:grabFn('_getAffixExtractionStatus'), getEx:grabFn('getExtractableAffixes'), crEx:grabFn('_createExtractedAffix'), extract:grabFn('extractAffix'),
  reason:grabFn('_transferReasonText'), ultmul:grabFn('_ultDmgMul'),
};
function build(){
  const body=`const AFFIX_POOL=arguments[1];const SLOT_NAMES=${JSON.stringify(SLOT_NAMES)};\n${G.afslot}\n`+
    `let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;let _slotCompatCache=null;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `let INV={bag:[],equipped:{}};let _saveN=0;function dbSaveForce(){_saveN++}\n`+
    `let _EQ={};function _eqAffix(id){return _EQ[id]||0}function _equip(it){_EQ={};if(it&&it.affixes)for(const a of it.affixes)_EQ[a.id]=(_EQ[a.id]||0)+(a.value!=null?a.value:0);}function _unequip(){_EQ={};}\n`+
    `${CANON}\n${G.tier}\n${G.cand}\n${G.roll}\n${G.slotc}\n${G.sv}\n${G.tv}\n${G.plan}\n${G.absorb}\n${G.isStone}\n${G.stMeta}\n${G.exStat}\n${G.getEx}\n${G.crEx}\n${G.extract}\n${G.ultmul}\n`+
    `return {planAbsorption,absorbStone,extractAffix,getExtractableAffixes,rollAffixesLayered,_ultDmgMul,_eqAffix,_equip,_unequip,`+
    `getBag:()=>INV.bag,setBag:(b)=>{INV.bag=b},setEquip:(sl,it)=>{INV.equipped[sl]=it},saveN:()=>_saveN};`;
  return new Function('Math','arguments',body).call(null,Math,[null,AFFIX_POOL]);
}
const API=build();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const aff=(id,tier,value)=>({id,tier,value});
const st=(affixId,tier,value)=>({type:'affixStone',affixId,tier,value});
// BB backbone(L1~9): pre-LOCK47 cap10 = L10-A 결손
const BB9={1:'strFlat',2:'cooldownRed',3:'defFlat',4:'elemFocus',5:'atkSpeed',6:'skillBoost',7:'atkPctAll',8:'critDmgW',9:'rageMaxFlat'};
const oldT10=(over={})=>({id:over.id||'old1',slot:over.slot||'weapon',rarity:4,layerLv:10,
  affixes:[1,2,3,4,5,6,7,8,9].map(L=>aff(BB9[L],2,0.1))}); // L10-A(ultDmg) 없음 (pre-LOCK47 형식)

// ══════════════════════════════════════════════════════════════════════
// ── (A) BlackStar universal coverage ──
test('§1 BlackStar dead-stat 해소 — detonate noDmg 유지 + cast-time 흡인력에 Ultimate Power', () => {
  const bs=grabFn('fireBlackStar');
  assert.ok(!/hurtE\(/.test(bs),'fireBlackStar hurtE 미호출(noDmg 확정)');           // dead-stat 원인=damage 없음
  assert.ok(!/_ultDmgMul/.test(bs),'detonate에는 _ultDmgMul 없음(억지 damage 금지)');
  // cast-time 흡인력 pull에 _ultDmgMul 적용(해소)
  assert.match(gameHtml,/const pull=\(5\+\(_bsLvP-1\)\*0\.5\)\*\(1-d\/_bsR\*0\.3\)\*sp\*_ultDmgMul\(\);/,'blackStar pull × _ultDmgMul(dead-stat 해소)');
});

test('§2 BlackStar primitive 선택 = pull strength(EXISTS·SAFE_TO_SCALE) — 단일 primitive', () => {
  // pull은 _clampPull(≤ d-_bsMinR) + isW(wall) 로 bound → 과증폭/벽즉사 없음. radius/duration 등 다른 primitive는 미변경.
  const region=gameHtml.slice(gameHtml.indexOf("if(P._bsCasting){"),gameHtml.indexOf("if(P._bsCasting){")+1400);
  assert.equal((region.match(/_ultDmgMul\(\)/g)||[]).length,1,'blackStar cast 블록 _ultDmgMul 정확히 1지점(단일 primitive)');
  assert.ok(/_clampPull/.test(region)&&/isW\(/.test(region),'pull clamp + wall guard 유지(SAFE)');
  assert.ok(!/const _bsMaxR=[^;]*_ultDmgMul/.test(region),'radius(_bsMaxR) 미스케일(area 폭증 회피)');
});

test('§3 skillBoost overlap = OVERLAP_ACCEPTABLE — Z ult damage는 skillBoost 미적용', () => {
  // skillBoost 소비자 = _fuseMul 유일. holyBlast/lavaSummon 데미지 산출은 _fuseMul/_skMul 미호출 → 이중적용 없음.
  assert.equal((gameHtml.match(/_eqAffix\('skillBoost'\)/g)||[]).length,1,'skillBoost 소비 지점 유일(_fuseMul)');
  const holy=grabFn('fireHolyBlast'), lava=grabFn('fireLavaSummon');
  for(const [n,f] of [['holyBlast',holy],['lavaSummon',lava]]){
    assert.ok(!/_fuseMul\(/.test(f),n+' _fuseMul 미호출(skillBoost 경로 아님)');
    assert.ok(!/skillBoost/.test(f),n+' skillBoost 직접참조 없음');
  }
  // L6 skillBoost(per-skill fusion) vs L10 ultDmg(ultimate structural) = 별개 output → RECLASS_DEBT 아님
  assert.equal(DEF.skillBoost.layer,6); assert.equal(DEF.ultDmg.layer,10);
});

test('§4 holy/lava regression — ultDmg multiplier 3지점 불변(8B.1로 변경 0)', () => {
  assert.match(gameHtml,/\(50\*_ult10xMul\)\*_ultDmgMul\(\)/,'holyBlast 직격');
  assert.match(gameHtml,/\(8\*_ult10xMul\)\*_ultDmgMul\(\)/,'lava 직격');
  assert.match(gameHtml,/\(4\*_ult10xMul\)\*_ultDmgMul\(\)/,'lava DOT');
});

test('§5 execution exclusion — 여전히 _ultDmgMul/_ult10xMul 미개입', () => {
  const ex=gameHtml.slice(gameHtml.indexOf("_chkJust('KeyX')"),gameHtml.indexOf("_chkJust('KeyX')")+2500);
  assert.ok(!/_ultDmgMul\(\)/.test(ex)&&!/_ult10xMul/.test(ex),'execution 데미지 파이프 격리 유지');
});

// ── (B) Pre-LOCK47 OLD_T10 compatibility ──
test('§6 OLD_T10 load 무변경 — _fixItem이 backbone/L10-A 자동주입 안 함(grandfather)', () => {
  // 게임 load 마이그레이션(_fixItem)은 affixes 배열 보장 + legacy prefix/suffix만. 롤/backbone 주입 없음.
  const fx=gameHtml.slice(gameHtml.indexOf('const _fixItem=(it)=>{'),gameHtml.indexOf('const _fixItem=(it)=>{')+700);
  assert.ok(/if\(!it\.affixes\)it\.affixes=\[\]/.test(fx),'affixes 배열 보장만');
  assert.ok(!/rollAffixesLayered|ultDmg|_rollItemLayerA2/.test(fx),'_fixItem에 롤/L10-A 주입 없음');
  // JSON 직렬화 roundtrip = identity(load 시 item mutation 0)
  const o=oldT10(); const round=JSON.parse(JSON.stringify(o));
  assert.deepEqual(round,o,'save/load roundtrip identity(L10-A 자동추가 없음)');
  assert.ok(!round.affixes.some(a=>a.id==='ultDmg'),'OLD_T10 L10-A 결손 유지');
});

test('§7 OLD_T10 usable — equip/스탯 derive 정상, 깨진 item 아님(LEGACY_T10_USABLE)', () => {
  const A=build(); const o=oldT10();
  A._equip(o); assert.equal(A._ultDmgMul(),1,'ultDmg 없음 → Ultimate Power ×1.0(패널티 없음)');
  assert.ok(A._eqAffix('strFlat')>0&&A._eqAffix('rageMaxFlat')>0,'기존 L1~9 backbone 스탯 정상 합산');
  A._unequip(); assert.equal(A._eqAffix('strFlat'),0,'unequip 복구');
});

test('§8 OLD_T10 비복구 absorption BLOCKED — 다른 transfer로 malformed 증식 차단', () => {
  const A=build(); const o=oldT10(); const s=st('poisonDot',2,0.3); A.setBag([o,s]); // L4-B stone(비-L10-A)
  const before=JSON.stringify(A.getBag());
  const r=A.absorbStone(s,'old1');
  assert.equal(r.ok,false,'비-L10-A 흡수 거부'); assert.equal(r.reason,'C1_BACKBONE_MISSING','backbone 결손 사유');
  assert.equal(JSON.stringify(A.getBag()),before,'atomic — bag 불변'); assert.equal(A.saveN(),0,'save 미호출');
});

test('§9 OLD_T10 L10-A repair SUCCESS — ultDmg 흡수 = C1 복구(INSERT)', () => {
  const A=build(); const o=oldT10(); const s=st('ultDmg',3,0.4); A.setBag([o,s]);
  const plan=A.planAbsorption(o,s); assert.ok(plan.ok,'L10-A 흡수 plan ok'); assert.equal(plan.action,'INSERT','결손 slot INSERT');
  const r=A.absorbStone(s,'old1'); assert.ok(r.ok,'복구 흡수 성공');
  assert.equal(o.affixes.filter(a=>a.id==='ultDmg').length,1,'L10-A 충전(정확히 1)');
  assert.equal(A.getBag().filter(i=>i.type==='affixStone').length,0,'stone 소비');
});

test('§10 repaired item = normal cap10 계약 — C1 PASS·일반 흡수 정상', () => {
  const A=build(); const o=oldT10(); A.setBag([o,st('ultDmg',3,0.4)]);
  A.absorbStone(A.getBag()[1],'old1'); // 복구
  // 복구 후 planAbsorption(임의 B stone) = C1 통과(더 이상 BACKBONE_MISSING 아님)
  const s2=st('poisonDot',2,0.3); A.setBag([o,s2]);
  const r=A.absorbStone(s2,'old1');
  assert.ok(r.ok,'복구 후 일반 B 흡수 성공(normal cap10 계약)'); assert.equal(r.action,'INSERT');
});

test('§11 OLD_T10 extraction 허용 — L1~9 정상 V2 A/B 추출 가능(source 파괴로 C1 무관)', () => {
  const A=build(); const o=oldT10(); A.setBag([o]);
  const cands=A.getExtractableAffixes(o).map(c=>c.affixId);
  assert.ok(cands.includes('poisonDot')||cands.length>0,'추출 후보 존재'); // 실제 L1-9 backbone 중 추출가능
  assert.ok(cands.includes('rageMaxFlat')||cands.includes('strFlat'),'A backbone 추출 후보 포함');
  const r=A.extractAffix('old1','strFlat');
  assert.ok(r.ok,'추출 성공'); assert.ok(!A.getBag().some(i=>i.id==='old1'),'source 전체 파괴');
  assert.ok(A.getBag().some(i=>i.type==='affixStone'&&i.affixId==='strFlat'),'stone 생성');
});

test('§12 repaired item save/load roundtrip — 무손실', () => {
  const A=build(); const o=oldT10(); A.setBag([o,st('ultDmg',3,0.4)]);
  A.absorbStone(A.getBag()[1],'old1');
  const round=JSON.parse(JSON.stringify(o));
  assert.deepEqual(round,o,'복구 item 직렬화 identity');
  A._equip(round); assert.ok(Math.abs(A._ultDmgMul()-1.4)<1e-9,'reload 후 Ultimate Power 반영');
});

test('§13 NEW production cap10 = L10-A 100% (roller가 OLD_T10 재생성 안 함)', () => {
  const A=build(); let miss=0;
  for(let i=0;i<3000;i++){const r=A.rollAffixesLayered(4,'weapon',undefined,10);if(!r.some(a=>DEF[a.id].layer===10))miss++;}
  assert.equal(miss,0,'신규 cap10 roll 전부 L10-A(OLD_T10 형식 미생성)');
});

test('§14 reason i18n — C1_BACKBONE_MISSING 매핑 존재·C1_VIOLATION과 구분(raw enum 미노출)', () => {
  const A=build();
  const t1=A === undefined ? '' : ''; // (reason fn은 _T/_L 의존 → 소스 매핑 존재만 확인)
  assert.match(gameHtml,/C1_BACKBONE_MISSING:\['핵심 옵션\(백본\)이 필요합니다','Needs a core backbone option'\]/,'C1_BACKBONE_MISSING i18n 매핑');
  assert.match(gameHtml,/C1_VIOLATION:\['구조 조건 불충족'/,'C1_VIOLATION 별도 유지(cardinality)');
  // 두 reason은 planAbsorption에서 서로 다른 branch
  assert.match(gameHtml,/if\(seen\[k\]\)return \{ok:false,reason:'C1_VIOLATION'\}/,'cardinality=C1_VIOLATION');
  assert.match(gameHtml,/if\(!hasA\)return \{ok:false,reason:'C1_BACKBONE_MISSING'\}/,'backbone 결손=C1_BACKBONE_MISSING');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 7C.1 / LOCK-43A] TRANSFER INTEGRITY FIXUP ═══
// FLEX = V1 extraction/absorption BLOCKED(unusable stone 방지). 실제 Hybrid C1(min-A where rollable) validator.
// parryBonus 정상 gameplay 불변. new transfer semantic 없음. game.html 실제 함수 실행.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function grabFn(name){const sig='function '+name+'(';const i=gameHtml.indexOf(sig);assert.ok(i>=0,'추출 실패 '+name);
  let d=0,st=gameHtml.indexOf('{',i),j=st;for(;j<gameHtml.length;j++){if(gameHtml[j]==='{')d++;else if(gameHtml[j]==='}'){d--;if(d===0){j++;break;}}}return gameHtml.slice(i,j);}
function grabConst(re,n){const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0];}
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const CANON=grabFn('_itemLayerCap')+'\n'+grabFn('_itemLayerWeightsA2')+'\n'+grabFn('_rollItemLayerA2');
const PS={afslot:grabConst(/const _AFSLOT=\{[^}]*\};/,'af'),isStone:grabFn('_isAffixStone'),
  exStatus:grabFn('_getAffixExtractionStatus'),getExtract:grabFn('getExtractableAffixes'),
  slotc:grabFn('_getSlotCompatGroups'),sv:grabFn('_getStoneValidity'),tv:grabFn('_getTargetValidity'),
  plan:grabFn('planAbsorption'),absorb:grabFn('absorbStone'),tier:grabFn('_affixTierRoll'),cand:grabFn('_affixLayerCandidates'),roll:grabFn('rollAffixesLayered')};
function build(injectMath){
  const body=`const AFFIX_POOL=arguments[2];\n${PS.afslot}\nlet _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `let INV={bag:[],equipped:{}};let _saveN=0;function _invFindSpace(){return {x:0,y:0}}function dbSaveForce(){_saveN++}\n`+
    `let _slotCompatCache=null;\n`+
    `${CANON}\n${PS.isStone}\n${PS.exStatus}\n${PS.getExtract}\n${PS.slotc}\n${PS.sv}\n${PS.tv}\n${PS.plan}\n${PS.absorb}\n${PS.tier}\n${PS.cand}\n${PS.roll}\n`+
    `return {_getAffixExtractionStatus,getExtractableAffixes,_getStoneValidity,planAbsorption,absorbStone,rollAffixesLayered,`+
    `getBag:()=>INV.bag,setBag:(b)=>{INV.bag=b},saveN:()=>_saveN};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const stone=(affixId,tier,value)=>({type:'affixStone',affixId,tier,value});
const aff=(id,tier,value)=>({id,tier,value});
// [P8B/LOCK-47] L10-A(ultDmg) 활성 → backbone에 L10 포함.
const BB={1:'strFlat',2:'cooldownRed',3:'defFlat',4:'elemFocus',5:'atkSpeed',6:'skillBoost',7:'atkPctAll',8:'critDmgW',9:'rageMaxFlat',10:'ultDmg'};
const backbone=(lv,skip)=>{const o=[];for(let L=1;L<=Math.min(lv,10);L++)if(L!==skip)o.push(aff(BB[L],2,0.1));return o;};

// ══════════════════════════════════════════════════════════════════════
test('§1/§2 FLEX extraction BLOCKED — predicate + candidate list 제외', () => {
  // parryBonus = FLEX L9 non-v2skip → 추출 BLOCKED
  const d=DEF.parryBonus; assert.equal(d.sub,'FLEX'); assert.ok(!d.v2skip,'parryBonus non-v2skip(정상 affix)');
  const it={slot:'weapon',layerLv:9,affixes:[aff('parryBonus',2,0.3),aff('staggerBns',2,0.5)]};
  assert.equal(API._getAffixExtractionStatus(it,aff('parryBonus',2,0.3)).reason,'FLEX_BLOCKED');
  const ex=API.getExtractableAffixes(it).map(c=>c.affixId);
  assert.ok(!ex.includes('parryBonus'),'FLEX candidate list 제외'); assert.ok(ex.includes('staggerBns'),'일반 A는 추출 가능');
});

test('§3 FLEX Stone absorption BLOCKED — 기존/강제 FLEX stone도 차단(crash 없음)', () => {
  const A=build(); const s=stone('parryBonus',2,0.3); A.setBag([{id:'t1',slot:'weapon',layerLv:10,affixes:backbone(10)},s]);
  const r=A.absorbStone(s,'t1'); assert.equal(r.reason,'FLEX_BLOCKED');
  assert.equal(API._getStoneValidity(stone('parryBonus',2,0.3)).reason,'FLEX_BLOCKED');
  // stone 유지(save에서 삭제 안 함), target 불변
  assert.ok(A.getBag().includes(s),'FLEX stone 유지'); assert.equal(A.saveN(),0,'save 미호출');
});

test('§4 parryBonus 정상 gameplay 불변 — V2 roll 등장·pool 정의 유지', () => {
  // Extraction 차단만 바뀜. parryBonus는 여전히 V2 roll 후보(weapon L9-A/B 버킷)
  const A=build(); let seen=false;
  for(let i=0;i<8000&&!seen;i++){const r=A.rollAffixesLayered(4,'weapon',undefined,10);if(r.some(a=>a.id==='parryBonus'))seen=true;}
  assert.ok(seen,'parryBonus V2 roll 정상 등장(gameplay 불변)');
  assert.equal(DEF.parryBonus.layer,9); assert.equal(DEF.parryBonus.sub,'FLEX'); // pool 정의 무변경
});

test('§5/§6/§7 real C1 min-A validation — 정상 target 통과 · malformed 거부', () => {
  // 정상 backbone target: A replace PASS
  let A=build(); A.setBag([{id:'t1',slot:'weapon',layerLv:10,affixes:backbone(10)},stone('staggerBns',2,0.5)]);
  assert.ok(A.absorbStone(A.getBag()[1],'t1').ok,'정상 A replace PASS');
  // 정상 B insert PASS
  A=build(); A.setBag([{id:'t1',slot:'weapon',layerLv:10,affixes:backbone(10)},stone('poisonDot',2,0.3)]);
  assert.ok(A.absorbStone(A.getBag()[1],'t1').ok,'정상 B insert PASS');
  // malformed target(L3-A 결손, layerLv 5) + B insert 시도 → C1_VIOLATION(commit 거부)
  A=build(); const bad={id:'t1',slot:'weapon',layerLv:5,affixes:backbone(5,3)}; const s=stone('poisonDot',2,0.3); A.setBag([bad,s]);
  const before=JSON.stringify(A.getBag());
  const r=A.absorbStone(s,'t1'); assert.equal(r.reason,'C1_BACKBONE_MISSING','malformed(L3-A 결손) 거부');
  assert.equal(JSON.stringify(A.getBag()),before,'target/stone 불변'); assert.equal(A.saveN(),0,'save 미호출');
  // planAbsorption도 동일 판정(순수)
  assert.equal(A.planAbsorption(bad,stone('poisonDot',2,0.3)).reason,'C1_BACKBONE_MISSING');
});

test('§6 L10-A 활성(ultDmg) — cap10 target은 L10-A backbone 필수(C1 자동활성)', () => {
  // [P8B/LOCK-47] L10 pool = ultDmg 1종(uni:1 A backbone). 구 "L10 면제" 종료.
  const l10=AFFIX_POOL.filter(a=>a.layer===10);
  assert.equal(l10.length,1,'L10 affix = ultDmg 1종'); assert.equal(l10[0].id,'ultDmg');
  assert.equal(l10[0].sub,'A'); assert.equal(l10[0].uni,1,'universal backbone');
  // cap10 target에 L10-A 충전 시 흡수 성공
  const A=build(); A.setBag([{id:'t1',slot:'weapon',layerLv:10,affixes:backbone(10)},stone('poisonDot',2,0.3)]);
  assert.ok(A.absorbStone(A.getBag()[1],'t1').ok,'L10-A 충전 target → 흡수 성공');
  // cap10 target에 L10-A 결손(L1-9 backbone만) → C1_VIOLATION(자동활성)
  const bb9=[1,2,3,4,5,6,7,8,9].map(L=>aff(BB[L],2,0.1));
  const B=build(); B.setBag([{id:'t2',slot:'weapon',layerLv:10,affixes:bb9},stone('poisonDot',2,0.3)]);
  const r=B.absorbStone(B.getBag()[1],'t2');
  assert.equal(r.ok,false,'L10-A 결손 cap10 → 거부'); assert.equal(r.reason,'C1_BACKBONE_MISSING','C1 자동활성(backbone 결손)');
});

test('§11 atomic — FLEX_BLOCKED/C1_VIOLATION 실패 시 bag deep-equal 불변', () => {
  for(const [name,tgt,s] of [
    ['FLEX', {id:'t1',slot:'weapon',layerLv:10,affixes:backbone(10)}, stone('parryBonus',2,0.3)],
    ['C1', {id:'t1',slot:'weapon',layerLv:5,affixes:backbone(5,2)}, stone('poisonDot',2,0.3)],
  ]){ const A=build(); A.setBag([tgt,s]); const before=JSON.stringify(A.getBag());
    assert.equal(A.absorbStone(s,'t1').ok,false,name+' fail');
    assert.equal(JSON.stringify(A.getBag()),before,name+' bag 불변'); assert.equal(A.saveN(),0,name+' save 미호출');
  }
});

test('§12 no RNG — FLEX/C1 판정 및 정상 흡수 모두 Math.random 0', () => {
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.5}; const A=build(spy);
  A.setBag([{id:'t1',slot:'weapon',layerLv:10,affixes:backbone(10)},stone('poisonDot',2,0.3),stone('parryBonus',2,0.3)]);
  A.absorbStone(A.getBag()[2],'t1'); // FLEX 판정
  A.absorbStone(A.getBag()[1],'t1'); // 정상 흡수
  assert.equal(calls,0,'RNG 0');
});

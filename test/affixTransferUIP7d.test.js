import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 7D / LOCK-44] AFFIX TRANSFER PLAYER UI — logic/VM layer ═══
// UI VM/wrapper는 domain API 위임(compat/gate/dup/C1 재구현 없음). DOM(_txRender) 제외한 pure 로직 검증.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function grabFn(name){const sig='function '+name+'(';const i=gameHtml.indexOf(sig);assert.ok(i>=0,'추출 실패 '+name);
  let d=0,st=gameHtml.indexOf('{',i),j=st;for(;j<gameHtml.length;j++){if(gameHtml[j]==='{')d++;else if(gameHtml[j]==='}'){d--;if(d===0){j++;break;}}}return gameHtml.slice(i,j);}
function grabConst(re,n){const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0];}
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const CANON=grabFn('_itemLayerCap')+'\n'+grabFn('_itemLayerWeightsA2')+'\n'+grabFn('_rollItemLayerA2');
const FNS=['_isAffixStone','_getAffixExtractionStatus','getExtractableAffixes','_createExtractedAffix','extractAffix','_affixStoneMeta',
  '_getSlotCompatGroups','_getStoneValidity','_getTargetValidity','planAbsorption','absorbStone',
  '_transferReasonText','_affixNameOf','_layerSubLabel','_compatSlotLabel','_extractionVM','_absorptionTargetsVM','_absorptionPreviewVM','_uiExtract','_uiAbsorb'];
const AFSLOT=grabConst(/const _AFSLOT=\{[^}]*\};/,'af');
function build(injectMath){
  const src=FNS.map(grabFn).join('\n');
  const body=`const AFFIX_POOL=arguments[2];\n${AFSLOT}\nlet _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;let _slotCompatCache=null;let AFFIX_NAMES_KO={};\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\nfunction _L(ko,en){return ko}function _T(s){return s}\n`+
    `let INV={bag:[],equipped:{}};let _saveN=0,_renderN=0,_notifyN=0,_transferBusy=false;function _invFindSpace(){return {x:0,y:0}}function dbSaveForce(){_saveN++}function renderInv(){_renderN++}function notify(){_notifyN++}\n`+
    `${CANON}\n${src}\n`+
    `return {_transferReasonText,_extractionVM,_absorptionTargetsVM,_absorptionPreviewVM,_uiExtract,_uiAbsorb,_compatSlotLabel,_layerSubLabel,getExtractableAffixes,extractAffix,absorbStone,`+
    `setBag:(b)=>{INV.bag=b},setEquip:(sl,it)=>{INV.equipped[sl]=it},getBag:()=>INV.bag,renderN:()=>_renderN,notifyN:()=>_notifyN};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build();
const stone=(affixId,tier,value)=>({type:'affixStone',affixId,tier,value});
const aff=(id,tier,value)=>({id,tier,value});
const BB={1:'strFlat',2:'cooldownRed',3:'defFlat',4:'elemFocus',5:'atkSpeed',6:'skillBoost',7:'atkPctAll',8:'critDmgW',9:'rageMaxFlat'};
const backbone=(lv,skip)=>{const o=[];for(let L=1;L<=Math.min(lv,9);L++)if(L!==skip)o.push(aff(BB[L],2,0.1));return o;};
const tgt=(over={})=>({id:over.id||'t1',slot:over.slot||'weapon',rarity:4,layerLv:over.layerLv||10,name:over.name||'테스트장비',affixes:over.affixes||backbone(over.layerLv||10,over.skip)});
const REASONS=['ITEM_EQUIPPED','TARGET_EQUIPPED','TARGET_NOT_V2','TARGET_TOO_LOW','INCOMPATIBLE_SLOT','DUPLICATE_ID','DUPLICATE_GROUP','FLEX_BLOCKED','KEYSTONE_BLOCKED','LEGACY_BLOCKED','V2SKIP_BLOCKED','C1_VIOLATION','STALE_TARGET','STONE_NOT_IN_BAG','TARGET_NOT_IN_BAG','COMMIT_FAILED'];

// ══════════════════════════════════════════════════════════════════════
test('§11 reason 매핑 — enum 문자열 직접 노출 0, 전 reason 매핑', () => {
  for(const r of REASONS){const t=API._transferReasonText(r);assert.ok(t&&t!==r,r+' → user text(enum 노출 아님)');}
  assert.equal(API._transferReasonText('__unknown__'),'불가','미지정 reason 안전 폴백');
});

test('§20 compat label — OFFENSE/DEFENSE/ACCESSORY → 공격/방어/장신구', () => {
  assert.equal(API._compatSlotLabel('weapon'),'공격');
  assert.equal(API._compatSlotLabel('boots'),'방어');
  assert.equal(API._compatSlotLabel('ring1'),'장신구');
  assert.equal(API._compatSlotLabel('armor'),'방어/공격'.split('/').every(x=>API._compatSlotLabel('armor').includes(x))?API._compatSlotLabel('armor'):'?','armor multi');
});

test('§4/§5/§27-A/G Extraction VM — candidate 위임·FLEX/keystone 제외·파괴경고', () => {
  const it={id:'s1',slot:'weapon',layerLv:9,name:'검',affixes:[aff('staggerBns',2,0.5),aff('parryBonus',2,0.3),aff('ksDullConviction',0,1),aff('skWhirlDmg',2,0.3)]};
  const vm=API._extractionVM(it); assert.ok(vm.ok);
  const ids=vm.candidates.map(c=>c.affixId);
  assert.ok(ids.includes('staggerBns'),'V2-A 노출');
  assert.ok(!ids.includes('parryBonus'),'FLEX 제외(§G)'); assert.ok(!ids.includes('ksDullConviction'),'keystone 제외'); assert.ok(!ids.includes('skWhirlDmg'),'v2skip 제외');
  const c=vm.candidates.find(c=>c.affixId==='staggerBns'); assert.ok(c.label&&c.name&&c.value===0.5&&c.sub==='A','표시필드');
  assert.ok(/파괴/.test(vm.warning),'파괴 경고(§6)');
});

test('§27-A/§7 Extraction confirm — source 파괴·stone 생성·renderInv·busy/identity', () => {
  const A=build(); const it={id:'s1',slot:'weapon',layerLv:9,name:'검',affixes:[aff('staggerBns',2,0.5)]}; A.setBag([it]);
  const rn0=A.renderN(); const r=A._uiExtract('s1','staggerBns'); assert.ok(r.ok);
  assert.equal(A.getBag().find(i=>i.id==='s1'),undefined,'source 파괴'); assert.equal(A.getBag().filter(i=>i.type==='affixStone').length,1,'stone 1개');
  assert.ok(A.renderN()>rn0,'성공 시 renderInv 호출');
  // §24 double-submit: 재호출 → domain identity로 ITEM_NOT_IN_BAG(2번 파괴 없음)
  const r2=A._uiExtract('s1','staggerBns'); assert.equal(r2.ok,false); assert.equal(A.getBag().filter(i=>i.type==='affixStone').length,1,'stone 여전히 1개');
});

test('§10/§11/§27-D Absorption target VM — valid active / invalid reasonText', () => {
  const A=build(); const s=stone('poisonDot',2,0.3); // L4-B, OFFENSE
  A.setBag([tgt({id:'wp',slot:'weapon'}),tgt({id:'rg',slot:'ring1'}),tgt({id:'lo',slot:'weapon',layerLv:3}), s]);
  const tv=A._absorptionTargetsVM(s);
  const wp=tv.find(t=>t.id==='wp'),rg=tv.find(t=>t.id==='rg'),lo=tv.find(t=>t.id==='lo');
  assert.ok(wp.ok&&wp.action,'weapon(OFFENSE) valid');
  assert.equal(rg.ok,false); assert.ok(rg.reasonText&&rg.reasonText!=='INCOMPATIBLE_SLOT','ring incompatible → user text');
  assert.equal(lo.ok,false); assert.ok(/단수/.test(lo.reasonText),'layerLv 3 too low → user text'); // poisonDot L4 > 3
});

test('§12/§13/§27-C/E Absorption preview — INSERT/REPLACE·exact value·old→new', () => {
  const A=build();
  // B INSERT
  let pv=A._absorptionPreviewVM(tgt({slot:'weapon'}),stone('poisonDot',3,0.42));
  assert.ok(pv.ok&&pv.action==='INSERT'&&pv.oldAffix===null); assert.equal(pv.newAffix.value,0.42,'exact value'); assert.ok(/단/.test(pv.label),'N단 label');
  // A REPLACE(backbone atkSpeed L5-A)
  pv=A._absorptionPreviewVM(tgt({slot:'armor'}),stone('staggerBns',2,0.7));
  assert.ok(pv.ok&&pv.action==='REPLACE'&&pv.oldAffix&&pv.oldAffix.id==='atkSpeed','A cross-slot REPLACE, old=atkSpeed(backbone)');
  assert.equal(pv.newAffix.value,0.7,'new exact');
  // incompatible → ok:false + reasonText
  pv=A._absorptionPreviewVM(tgt({slot:'ring1'}),stone('poisonDot',2,0.3));
  assert.equal(pv.ok,false); assert.ok(pv.reasonText&&pv.reasonText!=='INCOMPATIBLE_SLOT');
});

test('§27-C/E/§26 Absorption confirm — apply·stone 소비·old 소멸·save/load', () => {
  const A=build(); const s=stone('staggerBns',2,0.9);
  const t=tgt({id:'t1',slot:'armor'}); A.setBag([t,s]);
  const r=A._uiAbsorb(s,'t1'); assert.ok(r.ok&&r.action==='REPLACE');
  assert.ok(t.affixes.some(a=>a.id==='staggerBns'&&a.value===0.9),'new affix'); assert.ok(!t.affixes.some(a=>a.id==='atkSpeed'),'old 소멸');
  assert.equal(A.getBag().filter(i=>i.type==='affixStone').length,0,'stone 소비');
  // save/load via UI path
  const round=JSON.parse(JSON.stringify(t)); assert.ok(round.affixes.some(a=>a.id==='staggerBns'&&a.value===0.9)&&round.layerLv===10);
});

test('§17/§27-F equipped source/target blocked (domain 위임)', () => {
  // extraction: equipped source
  let A=build(); A.setEquip('weapon',{id:'eqW',slot:'weapon',layerLv:9,affixes:[aff('staggerBns',2,0.5)]}); A.setBag([]);
  assert.equal(A._uiExtract('eqW','staggerBns').reason,'ITEM_EQUIPPED');
  // absorption: equipped target(id) → absorbStone TARGET_EQUIPPED
  A=build(); const s=stone('staggerBns',2,0.5); A.setEquip('weapon',{id:'eqT',slot:'weapon',layerLv:10,affixes:backbone(10)}); A.setBag([s]);
  assert.equal(A._uiAbsorb(s,'eqT').reason,'TARGET_EQUIPPED');
});

test('§16 stale — 대상/stone 변경 시 안전 실패(domain 재검증)', () => {
  const A=build(); const s=stone('staggerBns',2,0.5); const t=tgt({id:'t1',slot:'weapon'}); A.setBag([t,s]);
  // stone을 bag에서 제거(정렬/이동 시뮬) 후 흡수 시도
  A.setBag([t]);
  assert.equal(A._uiAbsorb(s,'t1').reason,'STONE_NOT_IN_BAG');
  // target 제거
  const B=build(); const s2=stone('staggerBns',2,0.5); B.setBag([s2]);
  assert.equal(B._uiAbsorb(s2,'gone').reason,'TARGET_NOT_IN_BAG');
});

test('§25 no RNG — _uiExtract/_uiAbsorb 중 Math.random 0', () => {
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.5}; const A=build(spy);
  const s=stone('poisonDot',2,0.3); A.setBag([tgt({id:'t1',slot:'weapon'}),{id:'s1',slot:'weapon',layerLv:9,affixes:[aff('staggerBns',2,0.5)]},s]);
  A._uiAbsorb(s,'t1'); A._uiExtract('s1','staggerBns');
  assert.equal(calls,0,'transfer UI RNG 0');
});

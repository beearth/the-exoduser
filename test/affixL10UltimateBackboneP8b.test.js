import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 8B / LOCK-47] L10-A ULTIMATE DAMAGE BACKBONE — production activation ═══
// ultDmg = 궁극(Z Ultimate) 피해 % universal C1 backbone(uni:1·v2only·layer10·sub A).
// 소비자 _ultDmgMul()=1+_eqAffix('ultDmg') → Z ult 데미지 3지점(holyBlast/lava 직격/lava DOT)에만 적용.
// execution(X키)·blackStar(noDmg) 미수혜. C1 자동활성·cap10 mandatory·전 15슬롯 reachable·Transfer auto-fit·Keystone 불변.
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
  afslot:grabConst(/const _AFSLOT=\{[^}]*\};/,'afslot'), krate:grabConst(/const KEYSTONE_ROLL_RATE=[^;]*;/,'krate'),
  tier:grabFn('_affixTierRoll'), cand:grabFn('_affixLayerCandidates'), roll:grabFn('rollAffixesLayered'),
  slotc:grabFn('_getSlotCompatGroups'), sv:grabFn('_getStoneValidity'), tv:grabFn('_getTargetValidity'),
  plan:grabFn('planAbsorption'), absorb:grabFn('absorbStone'), isStone:grabFn('_isAffixStone'), stMeta:grabFn('_affixStoneMeta'),
  exStat:grabFn('_getAffixExtractionStatus'), getEx:grabFn('getExtractableAffixes'), crEx:grabFn('_createExtractedAffix'), extract:grabFn('extractAffix'),
  kcand:grabFn('_keystoneCandidates'), iskey:grabFn('_isKeystone'), ultmul:grabFn('_ultDmgMul'),
};
function build(injectMath){
  const body=`const AFFIX_POOL=arguments[2];const SLOT_NAMES=${JSON.stringify(SLOT_NAMES)};\n${G.afslot}\n${G.krate}\n`+
    `let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;let _slotCompatCache=null;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `let INV={bag:[],equipped:{}};let _saveN=0;function _invFindSpace(){return {x:0,y:0}}function dbSaveForce(){_saveN++}\n`+
    `let _EQ={};function _eqAffix(id){return _EQ[id]||0}function _equip(it){_EQ={};if(it&&it.affixes)for(const a of it.affixes)_EQ[a.id]=(_EQ[a.id]||0)+(a.value!=null?a.value:0);}function _equipMany(items){_EQ={};for(const it of items)if(it&&it.affixes)for(const a of it.affixes)_EQ[a.id]=(_EQ[a.id]||0)+(a.value!=null?a.value:0);}function _unequip(){_EQ={};}\n`+
    `${CANON}\n${G.tier}\n${G.cand}\n${G.roll}\n${G.slotc}\n${G.sv}\n${G.tv}\n${G.plan}\n${G.absorb}\n${G.isStone}\n${G.stMeta}\n${G.exStat}\n${G.getEx}\n${G.crEx}\n${G.extract}\n${G.kcand}\n${G.iskey}\n${G.ultmul}\n`+
    `function _mkItem(slot,rarity,pLv){var lv=_rollItemLayerA2(Math.min(900,Math.floor((pLv||900)/10)*10),Math.random);return {id:'i'+(Math.random()),slot,rarity,layerLv:lv,affixes:rollAffixesLayered(rarity,slot,slot==='bracelet'?'demon':undefined,lv)};}\n`+
    `return {AFFIX_POOL,SLOT_NAMES,planAbsorption,absorbStone,extractAffix,getExtractableAffixes,rollAffixesLayered,_affixLayerCandidates,_keystoneCandidates,_isKeystone,_ultDmgMul,_eqAffix,_equip,_equipMany,_unequip,_mkItem,`+
    `getBag:()=>INV.bag,setBag:(b)=>{INV.bag=b},setEquip:(sl,it)=>{INV.equipped[sl]=it},saveN:()=>_saveN,get KRATE(){return KEYSTONE_ROLL_RATE}};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build();
const AFSLOT=new Function(G.afslot+'return _AFSLOT;')();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
const aff=(id,tier,value)=>({id,tier,value});
const BB={1:'strFlat',2:'cooldownRed',3:'defFlat',4:'elemFocus',5:'atkSpeed',6:'skillBoost',7:'atkPctAll',8:'critDmgW',9:'rageMaxFlat',10:'ultDmg'};
const capTarget=(slot='weapon',lv=10,skip=null)=>({id:'t1',slot,rarity:4,layerLv:lv,affixes:(()=>{const o=[];for(let L=1;L<=Math.min(lv,10);L++)if(L!==skip)o.push(aff(BB[L],2,0.1));return o;})()});

// ══════════════════════════════════════════════════════════════════════
test('§1 ultDmg pool 정의 — layer10·sub A·uni:1·v2only·type0·group ultD·weight>0·5tier pct', () => {
  const d=DEF.ultDmg; assert.ok(d,'ultDmg 존재');
  assert.equal(d.layer,10,'layer 10'); assert.equal(d.sub,'A','sub A'); assert.equal(d.uni,1,'universal backbone');
  assert.equal(d.v2only,1,'v2only(legacy byte-identical 보존)'); assert.equal(d.type,0,'type 0(prefix)');
  assert.equal(d.group,'ultD','group ultD'); assert.ok(d.weight>0,'weight>0'); assert.equal(d.unit,'pct','pct');
  assert.equal(d.tiers.length,5,'5 tiers');
  // L10 pool = ultDmg(A) + [P8C/LOCK-48] ultRageGain(B). L10-A는 ultDmg 단독(sub A).
  assert.deepEqual(AFFIX_POOL.filter(a=>a.layer===10&&a.sub==='A').map(a=>a.id),['ultDmg'],'L10-A = ultDmg 1종(sub A)');
  assert.deepEqual(AFFIX_POOL.filter(a=>a.layer===10).map(a=>a.id).sort(),['ultDmg','ultRageGain'],'L10 pool = ultDmg(A)+ultRageGain(B) [P8C]');
  // group·id 중복 없음
  assert.equal(AFFIX_POOL.filter(a=>a.id==='ultDmg').length,1,'id 유일');
  assert.equal(AFFIX_POOL.filter(a=>a.group==='ultD').length,1,'group 유일');
});

test('§2 tier curve = skillBoost 참조(REFERENCE_AFFIX) — 인플레 없음', () => {
  // REFERENCE_AFFIX = skillBoost(uni:1 ability-damage% backbone). L10_TIERS = REFERENCE_TIERS verbatim.
  assert.deepEqual(DEF.ultDmg.tiers,DEF.skillBoost.tiers,'ultDmg tiers == skillBoost tiers([.10,.15,.25,.40,.55])');
  assert.deepEqual(DEF.ultDmg.tiers,[.10,.15,.25,.40,.55]);
  // pool에 layer→magnitude 단조증가 규칙 부재 검증(L9 rageDmg < L6 skillBoost) → 인플레 금지 근거
  assert.ok(DEF.rageDmg.tiers[4]<DEF.skillBoost.tiers[4],'L9 rageDmg(.44) < L6 skillBoost(.55): layer↑≠magnitude↑');
});

test('§3 i18n name/desc — AFFIX_NAMES_KO·_AFFIX_DESC 등록(기존 KO-only 규약)', () => {
  assert.match(gameHtml,/ultDmg:'종언의'/,'AFFIX_NAMES_KO.ultDmg 등록');
  assert.match(gameHtml,/ultDmg:'궁극위력\+'/,'_AFFIX_DESC.ultDmg 등록(8B.1 Ultimate Power)');
});

test('§4 소비자 배선 — 3 Z Ultimate 핵심 output에 _ultDmgMul() 곱, 정의 존재', () => {
  assert.match(gameHtml,/function _ultDmgMul\(\)\{return 1\+_eqAffix\('ultDmg'\);\}/,'_ultDmgMul 정의');
  assert.match(gameHtml,/\(50\*_ult10xMul\)\*_ultDmgMul\(\)/,'holyBlast dmg × _ultDmgMul');
  assert.match(gameHtml,/\(8\*_ult10xMul\)\*_ultDmgMul\(\)/,'lavaSummon 직격 dmg × _ultDmgMul');
  assert.match(gameHtml,/\(4\*_ult10xMul\)\*_ultDmgMul\(\)/,'lava DOT tick × _ultDmgMul (FULL_COVERAGE)');
  // [8B.1] blackStar 흡인력(pull) × _ultDmgMul — dead-stat 해소(damage 아님)
  assert.match(gameHtml,/const pull=\(5\+\(_bsLvP-1\)\*0\.5\)\*\(1-d\/_bsR\*0\.3\)\*sp\*_ultDmgMul\(\);/,'blackStar pull strength × _ultDmgMul');
});

test('§5 execution hard exclusion — execution 데미지 산출에 _ultDmgMul 미개입', () => {
  // execution 데미지 = meleeRef()*_exWpnMul*statStr()*pAtkMul() + 보스HP% 직접감산. _ult10xMul/_ultDmgMul 미사용.
  const execBlock=gameHtml.slice(gameHtml.indexOf('KeyX')&&gameHtml.indexOf("_chkJust('KeyX')"),gameHtml.indexOf("_chkJust('KeyX')")+2500);
  assert.ok(!/_ultDmgMul\(\)/.test(execBlock),'execution 블록에 _ultDmgMul 없음');
  assert.ok(!/_ult10xMul/.test(execBlock),'execution 블록에 _ult10xMul 없음(별도 데미지 파이프)');
});

test('§6 blackStar noDmg — hurtE·_ultDmgMul 미호출(견인 전용)', () => {
  // fireBlackStar(detonate)는 여전히 noDmg — hurtE·_ultDmgMul 미호출. L10-A는 cast-time 흡인력에만 작용(별도 위치).
  const bs=grabFn('fireBlackStar');
  assert.ok(!/hurtE\(/.test(bs),'blackStar detonate hurtE 미호출(noDmg 유지)');
  assert.ok(!/_ultDmgMul/.test(bs),'blackStar detonate에는 _ultDmgMul 없음(damage 미생성)');
});

test('§7 _ultDmgMul 소비자 semantic — 1+Σ ultDmg, equip/unequip 완전복구·stacking', () => {
  const A=build();
  assert.equal(A._ultDmgMul(),1,'미착용 = ×1.0');
  A._equip({affixes:[aff('ultDmg',2,0.25)]}); assert.ok(Math.abs(A._ultDmgMul()-1.25)<1e-9,'단일 0.25 → ×1.25');
  A._equipMany([{affixes:[aff('ultDmg',2,0.25)]},{affixes:[aff('ultDmg',4,0.40)]}]); assert.ok(Math.abs(A._ultDmgMul()-1.65)<1e-9,'0.25+0.40 합산 → ×1.65');
  A._unequip(); assert.equal(A._ultDmgMul(),1,'unequip 완전복구 = ×1.0');
  // 무관 affix는 영향 0
  A._equip({affixes:[aff('skillBoost',2,0.5)]}); assert.equal(A._ultDmgMul(),1,'skillBoost는 ult 무관 → ×1.0');
});

test('§8 C1 activation(roller) — cap10 매번 L10-A, cap<10 zero', () => {
  const A=build();
  const rng=mul(0x8B); let with10=0,below=0;
  for(let i=0;i<500;i++){const r=A.rollAffixesLayered(4,'weapon',undefined,10);if(r.some(a=>DEF[a.id].layer===10))with10++;}
  assert.equal(with10,500,'cap10 weapon 매번 L10-A(sole A backbone) 생성');
  for(let cap=1;cap<=9;cap++)for(let i=0;i<100;i++){const r=A.rollAffixesLayered(4,'weapon',undefined,cap);for(const a of r)if(DEF[a.id].layer===10)below++;}
  assert.equal(below,0,'layerLv<10 → L10-A 0');
});

test('§9 reachability — 전 15슬롯 L10-A 후보에 ultDmg 도달(uni backbone)', () => {
  const A=build();
  for(const slot of SLOT_NAMES){
    const cand=A._affixLayerCandidates(AFSLOT[slot],slot==='bracelet'?'demon':undefined,10,'A');
    assert.ok(cand.some(c=>c.id==='ultDmg'),`${slot} L10-A 후보에 ultDmg 포함`);
    // [P8C/LOCK-48] L10-B(ultRageGain)는 weapon(OFFENSE·wpn slot)에만 도달, 그 외 슬롯 부재
    const bCand=A._affixLayerCandidates(AFSLOT[slot],slot==='bracelet'?'demon':undefined,10,'B');
    if(slot==='weapon')assert.ok(bCand.some(c=>c.id==='ultRageGain'),'weapon L10-B 후보에 ultRageGain');
    else assert.ok(!bCand.some(c=>c.id==='ultRageGain'),`${slot} L10-B(ultRageGain) 부재(slot-gated)`);
  }
});

test('§10 C1 backbone(absorption) — cap10 L10-A 결손 target 거부, 충전 target 통과, cap9 면제', () => {
  // 충전된 cap10 target → 흡수 성공
  let A=build(); A.setBag([capTarget('weapon',10),{type:'affixStone',affixId:'poisonDot',tier:2,value:0.3}]);
  assert.ok(A.absorbStone(A.getBag()[1],'t1').ok,'L10-A 충전 cap10 → 흡수 성공');
  // L10-A 결손 cap10 → C1_BACKBONE_MISSING ([8B.1] backbone 결손 전용 reason)
  A=build(); A.setBag([capTarget('weapon',10,10),{type:'affixStone',affixId:'poisonDot',tier:2,value:0.3}]);
  const r=A.absorbStone(A.getBag()[1],'t1'); assert.equal(r.ok,false); assert.equal(r.reason,'C1_BACKBONE_MISSING','L10-A 결손 cap10 거부');
  // cap9 target(L10-A 없음)은 면제(L10 iteration 미도달)
  A=build(); A.setBag([capTarget('weapon',9),{type:'affixStone',affixId:'poisonDot',tier:2,value:0.3}]);
  assert.ok(A.absorbStone(A.getBag()[1],'t1').ok,'cap9 → L10-A 면제, 흡수 성공');
});

test('§11 Keystone independence — 후보/2% rate 불변(ultDmg 비-keystone)', () => {
  const A=build();
  assert.equal(A._isKeystone('ultDmg'),false,'ultDmg는 keystone 아님');
  // keystone 후보 = 기존과 동일(weapon L8:3, armor L8:2)
  assert.equal(A._keystoneCandidates('wpn',8).length,3,'weapon L8 keystone 후보 3(불변)');
  assert.equal(A._keystoneCandidates('armor',8).length,2,'armor L8 keystone 후보 2(불변)');
  assert.equal(A._keystoneCandidates('wpn',10).length,3,'weapon L10 keystone 후보 3(ultDmg 미포함)');
  assert.ok(!A._keystoneCandidates('wpn',10).some(c=>c.id==='ultDmg'),'ultDmg는 keystone 후보 아님');
  assert.equal(A.KRATE,0.02,'KEYSTONE_ROLL_RATE 0.02 FREEZE');
});

test('§12 Transfer 자동통합 — extract→stone→cross-slot L10 absorb(REPLACE), TARGET_TOO_LOW', () => {
  const A=build();
  // cap10 weapon에서 ultDmg 추출
  const src=capTarget('weapon',10); src.id='src'; A.setBag([src]);
  const exCands=A.getExtractableAffixes(src); const uc=exCands.find(c=>c.affixId==='ultDmg');
  assert.ok(uc,'ultDmg 추출 가능(extractable)');
  const rEx=A.extractAffix('src','ultDmg'); assert.ok(rEx.ok,'추출 성공');
  const stone=A.getBag().find(i=>i.type==='affixStone'); assert.ok(stone&&stone.affixId==='ultDmg','affixStone 생성');
  assert.equal(stone.value,0.1,'exact value 보존');
  assert.ok(!A.getBag().some(i=>i.id==='src'),'source item 파괴(destructive)');
  // cross-slot: armor cap10 target에 흡수(REPLACE — A universal)
  const tgt=capTarget('armor',10); tgt.id='tgtA'; A.setBag([tgt,stone]);
  const st=A.getBag().find(i=>i.type==='affixStone');
  const plan=A.planAbsorption(tgt,st); assert.ok(plan.ok,'cross-slot(armor) L10-A absorb plan ok'); assert.equal(plan.action,'REPLACE','A backbone REPLACE');
  const rAb=A.absorbStone(st,'tgtA'); assert.ok(rAb.ok,'흡수 성공');
  assert.equal(tgt.affixes.filter(a=>a.id==='ultDmg').length,1,'L10-A 정확히 1(dup 없음)');
  // TARGET_TOO_LOW: cap9 target
  const A2=build(); const low=capTarget('weapon',9); low.id='low';
  const s2={type:'affixStone',affixId:'ultDmg',tier:2,value:0.25}; A2.setBag([low,s2]);
  const r2=A2.absorbStone(s2,'low'); assert.equal(r2.ok,false); assert.equal(r2.reason,'TARGET_TOO_LOW','cap9 target은 L10-A 흡수 불가');
});

test('§13 save/load roundtrip — ultDmg affix 직렬화 무손실', () => {
  const A=build();
  const it=capTarget('weapon',10); const ud=it.affixes.find(a=>a.id==='ultDmg');
  const round=JSON.parse(JSON.stringify(it));
  const ud2=round.affixes.find(a=>a.id==='ultDmg');
  assert.deepEqual(ud2,ud,'ultDmg {id,tier,value} 직렬화 동일');
  // 재로드 후 _ultDmgMul 정상
  A._equip(round); assert.ok(Math.abs(A._ultDmgMul()-(1+ud.value))<1e-9,'reload 후 소비자 정상');
});

test('§14 massive V2 invariants — 200k cap10, L10-A mandatory·dup/C1/keystone 0·cap<10 L10 zero', () => {
  const A=build(); const rng=mul(0xF00D); let noL10at10=0,l10below=0,dupG=0,ks=0,c1=0;
  for(let i=0;i<200000;i++){
    const cap=1+(~~(rng()*10)); const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    const r=A.rollAffixesLayered(4,slot,slot==='bracelet'?'demon':undefined,cap);
    const has10=r.some(a=>DEF[a.id].layer===10);
    if(cap>=10&&!has10)noL10at10++; if(cap<10&&has10)l10below++;
    const gseen={},aBy={};
    for(const a of r){const d=DEF[a.id]; if(d.keystone)ks++; if(gseen[d.group])dupG++; gseen[d.group]=1;
      if(d.sub==='A'){aBy[d.layer]=(aBy[d.layer]||0)+1;if(aBy[d.layer]>1)c1++}}
  }
  assert.equal(noL10at10,0,'cap10 전부 L10-A 보유(mandatory)');
  assert.equal(l10below,0,'cap<10 L10-A 0');
  assert.equal(dupG,0,'group dup 0'); assert.equal(ks,0,'정상롤 keystone 0'); assert.equal(c1,0,'per-layer A cardinality C1 0');
});

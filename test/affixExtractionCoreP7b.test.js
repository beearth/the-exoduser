import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 7B / LOCK-42] AFFIX EXTRACTION CORE — destructive source transaction ═══
// bag unequipped equipment의 affix 1개 → 성공 시 source item 전체 파괴 → affixStone 1개.
// deterministic(RNG 0)·비용 0·exact tier/value. BLOCKED: keystone/LEGACY/v2skip/CORE/special/invalid.
// atomic(부분 mutation 0). Absorption 미구현. game.html 실제 함수 verbatim 실행.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab=(re,n)=>{const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0]};
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
// production roller(source item 생성용)
const CANON=grab(/function _itemLayerCap\(itemLv\)\{[^}]*\}/,'cap')+'\n'+grab(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/,'w')+'\n'+grab(/function _rollItemLayerA2\(itemLv,rng\)\{[\s\S]*?return cap\}/,'r');
const parts={
  ex:grab(/function _getAffixExtractionStatus\(item,affix\)\{[\s\S]*?\n\}/,'exStatus'),
  gea:grab(/function getExtractableAffixes\(item\)\{[\s\S]*?\n\}/,'getExtractable'),
  create:grab(/function _createExtractedAffix\(affix\)\{[\s\S]*?\n\}/,'create'),
  extract:grab(/function extractAffix\(sourceItemId,affixId\)\{[\s\S]*?\n\}/,'extract'),
  isStone:grab(/function _isAffixStone\(it\)\{[^}]*\}/,'isStone'),
  meta:grab(/function _affixStoneMeta\(stone\)\{[\s\S]*?valid:!!d\};\}/,'meta'),
  ico:grab(/function _itemIco\(it,col,sz\)\{[^}]*\}/,'ico'),
  afslot:grab(/const _AFSLOT=\{[^}]*\};/,'afslot'),tier:grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/,'t'),
  cand:grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/,'c'),roll:grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/,'r2'),
};
function build(injectMath){
  const body=`const AFFIX_POOL=arguments[2];const SLOT_NAMES=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband'];const AFFIX_NAMES_KO={};\n`+
    `${parts.afslot}\nlet _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\nfunction _slotGlyph(){return 'ICON'}\n`+
    `let INV={bag:[],equipped:{}};let _saveN=0;function _invFindSpace(){return {x:0,y:0}}function dbSaveForce(){_saveN++}\n`+
    `${CANON}\n${parts.tier}\n${parts.cand}\n${parts.roll}\n`+
    `${parts.ex}\n${parts.gea}\n${parts.create}\n${parts.extract}\n${parts.isStone}\n${parts.meta}\n${parts.ico}\n`+
    `function _mkItem(slot,rarity,pLv){var lv=_rollItemLayerA2(Math.min(900,Math.floor((pLv||900)/10)*10),Math.random);return {id:'i'+(Math.random()),slot,rarity,layerLv:lv,affixes:rollAffixesLayered(rarity,slot,slot==='bracelet'?'demon':undefined,lv)};}\n`+
    `return {_getAffixExtractionStatus,getExtractableAffixes,_createExtractedAffix,extractAffix,_isAffixStone,_affixStoneMeta,_itemIco,_mkItem,`+
    `getBag:()=>INV.bag,setBag:(b)=>{INV.bag=b},setEquip:(sl,it)=>{INV.equipped[sl]=it},saveN:()=>_saveN};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
const KS_IDS=['ksDullConviction','ksGlassGreatsword','ksBloodOath','ksRootedGiant','ksBloodPact'];
const item=(over)=>Object.assign({id:'src1',slot:'weapon',rarity:4,layerLv:9,affixes:[]},over);
const aff=(id,tier,value)=>({id,tier,value});

// ══════════════════════════════════════════════════════════════════════
test('§1/§2 V2-A / V2-B extraction — 성공·stone 스키마 정확', () => {
  const A=build(); // sub A 예: 저층 A affix
  const aA=AFFIX_POOL.find(a=>a.sub==='A'&&a.layer>=1&&!a.v2skip&&!a.keystone);
  const aB=AFFIX_POOL.find(a=>a.sub==='B'&&a.layer>=1&&!a.v2skip&&!a.keystone);
  for(const d of [aA,aB]){ const A2=build();
    const it=item({affixes:[aff(d.id,2,0.33)]}); A2.setBag([it]);
    // 순수 생성자 = 정확히 4필드(payload 스키마)
    assert.deepEqual(Object.keys(A2._createExtractedAffix(aff(d.id,2,0.33))).sort(),['affixId','tier','type','value'],'stone payload 정확히 4필드');
    const r=A2.extractAffix('src1',d.id);
    assert.ok(r.ok,`${d.sub} 추출 성공`);
    assert.equal(r.stone.type,'affixStone'); assert.equal(r.stone.affixId,d.id);
    // 금지 메타 필드 부재(_gx/_gy는 bag 위치 — 스키마 아님·허용)
    for(const f of ['layer','sub','compat','family','src','absCnt','sourceSlot','sourceItem'])assert.ok(!(f in r.stone),f+' 없음');
  }
});

test('§3/§14 exact tier/value — strict equality, reroll/round 없음', () => {
  for(const [t,v] of [[0,0.12],[4,999],[2,-0.5],[3,0.0001]]){ const A=build();
    const it=item({affixes:[aff('staggerBns',t,v)]}); A.setBag([it]);
    const r=A.extractAffix('src1','staggerBns'); assert.ok(r.ok);
    assert.strictEqual(r.stone.tier,t,'tier strict'); assert.strictEqual(r.stone.value,v,'value strict');
  }
});

test('§0/§6 whole source destroyed · exactly one stone · non-selected 미복제', () => {
  const A=build();
  const it=item({affixes:[aff('staggerBns',2,0.3),aff('armorPen',1,0.2),aff('atkSpeed',3,0.1)]}); A.setBag([it,item({id:'other',affixes:[aff('staggerBns',1,0.1)]})]);
  const r=A.extractAffix('src1','staggerBns'); assert.ok(r.ok);
  const bag=A.getBag();
  assert.equal(bag.find(i=>i.id==='src1'),undefined,'source item 전체 파괴');
  const stones=bag.filter(i=>i.type==='affixStone'); assert.equal(stones.length,1,'stone 정확히 1개');
  // 선택 안 된 affix(armorPen/atkSpeed)는 stone/bag 어디에도 복제 안 됨(item과 함께 소멸)
  assert.equal(stones[0].affixId,'staggerBns');
  assert.ok(bag.find(i=>i.id==='other'),'무관 item 불변');
});

test('§7 equipped blocked — equipped source 추출 FAIL·equipped 불변', () => {
  const A=build(); const eq=item({id:'eqW',affixes:[aff('staggerBns',2,0.3)]}); A.setEquip('weapon',eq);
  const before=JSON.stringify(eq);
  const r=A.extractAffix('eqW','staggerBns'); assert.equal(r.ok,false); assert.equal(r.reason,'ITEM_EQUIPPED');
  assert.equal(JSON.stringify(eq),before,'equipped item 완전 불변');
});

test('§12 all 5 Keystone blocked — getExtractable 노출 0·직접 호출 KEYSTONE_BLOCKED', () => {
  for(const ks of KS_IDS){ const A=build();
    const it=item({affixes:[aff(ks,0,1),aff('staggerBns',2,0.3)]}); A.setBag([it]);
    // keystone은 getExtractable에 미노출, 일반 affix는 노출
    const ex=A.getExtractableAffixes(it).map(c=>c.affixId);
    assert.ok(!ex.includes(ks),ks+' 미노출'); assert.ok(ex.includes('staggerBns'),'일반 affix 노출');
    // 직접 강제 호출도 차단
    assert.equal(A.extractAffix('src1',ks).reason,'KEYSTONE_BLOCKED',ks+' 직접 차단');
    // 일반 affix는 성공(keystone item이어도 keystone 외 추출 가능)
    assert.ok(A.extractAffix('src1','staggerBns').ok,'keystone item의 일반 affix 추출 가능');
  }
});

test('§13 legacy / v2skip / invalid blocked', () => {
  const A=build();
  const it=item({affixes:[aff('armorPen',0,0.2), aff('skWhirlDmg',2,0.3), aff('__nope__',1,0.5)]}); A.setBag([it]);
  // armorPen = LEGACY(layer0) → LEGACY_BLOCKED
  assert.equal(A._getAffixExtractionStatus(it,aff('armorPen',0,0.2)).reason,'LEGACY_BLOCKED');
  // skWhirlDmg = v2skip → V2SKIP_BLOCKED
  assert.equal(A._getAffixExtractionStatus(it,aff('skWhirlDmg',2,0.3)).reason,'V2SKIP_BLOCKED');
  // 정의 없음 → INVALID_AFFIX
  assert.equal(A._getAffixExtractionStatus(it,aff('__nope__',1,0.5)).reason,'INVALID_AFFIX');
  // NaN value → INVALID_VALUE
  assert.equal(A._getAffixExtractionStatus(it,aff('staggerBns',2,NaN)).reason,'INVALID_VALUE');
  assert.equal(A.getExtractableAffixes(it).length,0,'전부 blocked → 노출 0');
});

test('§18-atomic 실패 시 bag/equip/stone unchanged (deep compare)', () => {
  const cases=[
    ['stale/missing', A=>{A.setBag([item({affixes:[aff('staggerBns',2,.3)]})]);return ['nosuch','staggerBns']}],
    ['equipped', A=>{A.setEquip('weapon',item({id:'eq',affixes:[aff('staggerBns',2,.3)]}));A.setBag([]);return ['eq','staggerBns']}],
    ['keystone', A=>{A.setBag([item({affixes:[aff('ksDullConviction',0,1)]})]);return ['src1','ksDullConviction']}],
    ['v2skip', A=>{A.setBag([item({affixes:[aff('skWhirlDmg',2,.3)]})]);return ['src1','skWhirlDmg']}],
    ['NaN', A=>{A.setBag([item({affixes:[aff('staggerBns',2,NaN)]})]);return ['src1','staggerBns']}],
    ['missing affix', A=>{A.setBag([item({affixes:[aff('staggerBns',2,.3)]})]);return ['src1','atkSpeed']}],
  ];
  for(const [name,setup] of cases){ const A=build(); const args=setup(A);
    const before=JSON.stringify({bag:A.getBag()}); const sn=A.saveN();
    const r=A.extractAffix(args[0],args[1]); assert.equal(r.ok,false,name+' fail');
    assert.equal(JSON.stringify({bag:A.getBag()}),before,name+' bag 불변(부분 mutation 0)');
    assert.equal(A.saveN(),sn,name+' save 미호출');
    assert.equal(A.getBag().filter(i=>i.type==='affixStone').length,0,name+' stone 0');
  }
});

test('§8/§19 stale source identity — id 재확인(index 비의존)', () => {
  const A=build(); const a=item({id:'A',affixes:[aff('staggerBns',2,.3)]}),b=item({id:'B',slot:'armor',affixes:[aff('staggerBns',1,.1)]});
  A.setBag([a,b]);
  // 정렬/이동 시뮬: bag 순서 뒤집기
  A.setBag([b,a]);
  const r=A.extractAffix('A','staggerBns'); assert.ok(r.ok,'id로 정확한 item 파괴');
  assert.equal(A.getBag().find(i=>i.id==='A'),undefined,'A 파괴'); assert.ok(A.getBag().find(i=>i.id==='B'),'B 불변(잘못된 item 파괴 안 함)');
});

test('§15/§17 stone bag render safety · invalid stone safe', () => {
  const A=build();
  assert.equal(A._itemIco({type:'affixStone',affixId:'staggerBns'},'#fff',16),'💠','stone icon 세이프');
  assert.equal(A._itemIco(null),'','null 세이프');
  // 유효 stone meta
  const m=A._affixStoneMeta({type:'affixStone',affixId:'staggerBns',tier:2,value:0.3});
  assert.ok(m.valid&&m.layer>=1&&(m.sub==='A'||m.sub==='B'),'valid stone meta');
  // invalid affixId stone → valid:false, crash 없음
  const bad=A._affixStoneMeta({type:'affixStone',affixId:'__x__',tier:0,value:0});
  assert.equal(bad.valid,false,'invalid stone unusable(no crash)');
});

test('§16 stone save/load roundtrip — type/affixId/tier/value 동일', () => {
  const A=build(); A.setBag([item({affixes:[aff('staggerBns',3,0.42)]})]);
  const r=A.extractAffix('src1','staggerBns'); assert.ok(r.ok);
  const stone=A.getBag().find(i=>i.type==='affixStone');
  const round=JSON.parse(JSON.stringify(stone));
  assert.equal(round.type,'affixStone'); assert.equal(round.affixId,'staggerBns'); assert.strictEqual(round.tier,3); assert.strictEqual(round.value,0.42);
  // load 후에도 meta 재해석 정상
  const m=A._affixStoneMeta(round); assert.ok(m.valid,'load 후 pool lookup 정상');
});

test('§15-no-RNG — extractAffix 중 Math.random 0회', () => {
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.5}; const A=build(spy);
  A.setBag([item({affixes:[aff('staggerBns',2,0.3)]})]);
  const r=A.extractAffix('src1','staggerBns'); assert.ok(r.ok);
  assert.equal(calls,0,'extraction transaction RNG 0');
});

test('§19 production V2 sweep — 15 slot × 다층, extractable 감사(leak 0)', () => {
  const A=build(seededMath(0x7B)); const SLOTS=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband'];
  let stones=0,ksLeak=0,legacyLeak=0,v2skipLeak=0,badVal=0,poolFail=0,tvMismatch=0;
  for(let n=0;n<20000;n++){ const slot=SLOTS[n%SLOTS.length]; const it=A._mkItem(slot,3,900);
    const ex=A.getExtractableAffixes(it);
    for(const c of ex){ const d=DEF[c.affixId];
      if(!d){poolFail++;continue}
      if(d.keystone)ksLeak++; if(d.sub==='LEGACY')legacyLeak++; if(d.v2skip)v2skipLeak++;
      if(typeof c.value!=='number'||!isFinite(c.value))badVal++;
    }
    // 실제 추출 1건 검증(첫 extractable)
    if(ex.length){ const B=build(); const clone=JSON.parse(JSON.stringify(it)); B.setBag([clone]);
      const r=B.extractAffix(clone.id,ex[0].affixId);
      if(r.ok){stones++; if(r.stone.tier!==ex[0].tier||r.stone.value!==ex[0].value)tvMismatch++;
        if(!DEF[r.stone.affixId])poolFail++;}
    }
  }
  assert.ok(stones>0,'추출 성공 다수'); assert.equal(ksLeak,0,'keystone leak 0'); assert.equal(legacyLeak,0,'legacy leak 0');
  assert.equal(v2skipLeak,0,'v2skip leak 0'); assert.equal(badVal,0,'invalid value 0'); assert.equal(poolFail,0,'pool resolve 실패 0');
  assert.equal(tvMismatch,0,'tier/value exact 0 mismatch');
});

test('§0 반복 추출 불가(source 파괴로 자연 성립) · §17 old save(stone 없음) 정상', () => {
  const A=build(); A.setBag([item({affixes:[aff('staggerBns',2,0.3)]})]);
  assert.ok(A.extractAffix('src1','staggerBns').ok); // 1회
  assert.equal(A.extractAffix('src1','staggerBns').reason,'ITEM_NOT_IN_BAG','파괴 후 재추출 불가');
  // stone 없는 bag은 정상
  const B=build(); B.setBag([item({affixes:[aff('staggerBns',2,0.3)]})]);
  assert.equal(B.getExtractableAffixes(B.getBag()[0]).length,1,'stone 없는 정상 item');
});

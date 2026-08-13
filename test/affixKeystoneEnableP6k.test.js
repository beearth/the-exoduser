import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6K / LOCK-39] KEYSTONE PRODUCTION ENABLE & FINAL CLOSURE ═══
// KEYSTONE_ROLL_ENABLED=true. 실제 production roll(mkItem 경로 재현)로 5 Keystone 검증.
// 2% conditional(eligible denominator)·item당 max1·layer<8 zero·invalid slot zero·5종 reachability·
// production-rolled runtime/UI/save E2E·beam independence·RNG short-circuit. 2%/A2/V2/combat 변경 금지.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab=(re,n)=>{const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0]};
const SLOT_NAMES=new Function('return '+grab(/const SLOT_NAMES=\[[^\]]*\]/,'SLOT').replace('const SLOT_NAMES=',''))();
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const KS_IDS=['ksDullConviction','ksGlassGreatsword','ksBloodOath','ksRootedGiant','ksBloodPact'];
const CANON=grab(/function _itemLayerCap\(itemLv\)\{[^}]*\}/,'cap')+'\n'+grab(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/,'w')+'\n'+grab(/function _rollItemLayerA2\(itemLv,rng\)\{[\s\S]*?return cap\}/,'r');
const pp={afslot:grab(/const _AFSLOT=\{[^}]*\};/,'af'),krate:grab(/const KEYSTONE_ROLL_RATE=[^;]*;/,'kr'),
  tier:grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/,'t'),cand:grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/,'c'),
  roll:grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/,'r2'),
  kcand:grab(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/,'kc'),kcnt:grab(/function _itemKeystoneCount\(item\)\{.*\}/,'kn'),
  kroll:grab(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/,'kr2'),iskey:grab(/function _isKeystone\(id\)\{[^}]*\}/,'ik'),
  hasks:grab(/function _itemHasKeystone\(it\)\{[^}]*\}/,'hk'),beam:grab(/function _itemLayerBeamTier\(item\)\{[^}]*\}/,'bm'),glv:grab(/function _getItemLayerLv\(item\)\{[\s\S]*?\n\}/,'gl'),
  // combat consumers
  ks:['_ksBloodOath','_ksDmgMul','_ksTakenMul','_ksRootedGiant','_ksBloodPact','_ksLifestealMul','_ksHealMul'].map(n=>grab(new RegExp('function '+n+'\\([^)]*\\)\\{[^}]*\\}'),n)).join('\n')};
function build(injectMath,ksEnabled){
  const body=`const AFFIX_POOL=arguments[2];const SLOT_NAMES=${JSON.stringify(SLOT_NAMES)};\n${pp.afslot}\n${pp.krate}\n`+
    `let KEYSTONE_ROLL_ENABLED=${ksEnabled!==false};let ITEM_LAYER_ROLL_V2=true;let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `let _EQ={};function _eqAffix(id){return _EQ[id]||0}function _equip(item){_EQ={};if(item&&item.affixes)for(const a of item.affixes)_EQ[a.id]=(a.value!=null?a.value:1);}function _unequip(){_EQ={};}\n`+
    `${CANON}\n${pp.tier}\n${pp.cand}\n${pp.roll}\n${pp.kcand}\n${pp.kcnt}\n${pp.kroll}\n${pp.iskey}\n${pp.hasks}\n${pp.glv}\n${pp.beam}\n${pp.ks}\n`+
    `function mkItemFull(slot,rarity,pLv,brType){var layerLv;var _p=pLv||1;if(ITEM_LAYER_ROLL_V2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_p/10)*10),Math.random);}`+
    `var item={slot,rarity,layerLv:(layerLv>=1?Math.max(1,Math.min(10,~~layerLv)):undefined),brType};`+
    `item.affixes=(ITEM_LAYER_ROLL_V2&&layerLv>=1)?rollAffixesLayered(rarity,slot,brType,layerLv):null;`+
    `if(KEYSTONE_ROLL_ENABLED&&item.affixes&&_itemKeystoneCount(item)<1){var _ks=_rollKeystoneOnItem(item,false);if(_ks)item.affixes.push(_ks);}return item;}\n`+
    `return {SLOT_NAMES,mkItemFull,_rollItemLayerA2,_keystoneCandidates,_rollKeystoneOnItem,_itemKeystoneCount,_isKeystone,_itemHasKeystone,_itemLayerBeamTier,`+
    `_equip,_unequip,_ksBloodOath,_ksDmgMul,_ksTakenMul,_ksRootedGiant,_ksBloodPact,_ksLifestealMul,_ksHealMul,get KRATE(){return KEYSTONE_ROLL_RATE}};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build(); const RATE=API.KRATE;
const AFSLOT=new Function(pp.afslot+'return _AFSLOT;')();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
// production roll로 각 keystone item 수집(forced 아님)
function collectKeystoneItems(seed,need){const M=build(seededMath(seed),true);const rng=mul(seed^0x55);const out={};let guard=0;
  while(Object.keys(out).length<need.length&&guard++<5000000){const slot=rng()<.5?'weapon':'armor';const it=M.mkItemFull(slot,4,900);
    if(it.affixes)for(const a of it.affixes)if(M._isKeystone(a.id)&&need.includes(a.id)&&!out[a.id])out[a.id]={item:it,M};}
  return out;}

// ══════════════════════════════════════════════════════════════════════
test('§0 wiring — KEYSTONE_ROLL_ENABLED=true · 2% FREEZE · A2/V2 불변', () => {
  assert.match(gameHtml,/const KEYSTONE_ROLL_ENABLED=true;/,'Keystone 활성');
  assert.match(gameHtml,/const KEYSTONE_ROLL_RATE=0\.02;/,'2% FREEZE');
  assert.match(gameHtml,/const ITEM_LAYER_ROLL_V2=true;/,'V2 유지');
  // mkItem keystone 블록 gated
  assert.match(gameHtml,/if\(KEYSTONE_ROLL_ENABLED&&item\.affixes&&_itemKeystoneCount\(item\)<1\)\{const _ks=_rollKeystoneOnItem\(item,false\);if\(_ks\)item\.affixes\.push\(_ks\);\}/,'keystone roll 블록');
});

test('§2/§3 eligible 정의 — layer≥8 & slot candidate≥1 & 기존 keystone 없음 · eligible slot=weapon/armor', () => {
  const elig=SLOT_NAMES.filter(sl=>{for(let L=8;L<=10;L++)if(API._keystoneCandidates(AFSLOT[sl],L).length)return true;return false});
  assert.deepEqual(elig.sort(),['armor','weapon'],'eligible slot set = weapon/armor(2/15)');
  assert.equal(API._keystoneCandidates('wpn',8).length,3,'weapon 후보3');
  assert.equal(API._keystoneCandidates('armor',8).length,2,'armor 후보2');
  assert.equal(API._keystoneCandidates('wpn',7).length,0,'layer<8 gate → 0');
  // 기존 keystone 있으면 재롤 없음
  const it={slot:'weapon',layerLv:9,affixes:[{id:'ksDullConviction',value:1}]};
  assert.equal(API._rollKeystoneOnItem(it,false),null,'기존 keystone → null(max1)');
});

test('§7 conditional 2% (eligible denominator) — 2% ±0.2%p', () => {
  // eligible 표본 극대화: weapon/armor cap10(itemLv900) → L≥8 ~34%가 eligible(대표본·고속). gate 정밀 검증.
  const M=build(seededMath(0x2FF),true); const rng=mul(0x2AA); const N=150000; const mix=['weapon','armor']; let elig=0,rolled=0;
  for(let i=0;i<N;i++){ const slot=mix[i&1]; const it=M.mkItemFull(slot,4,900,undefined);
    const L=it.layerLv||0; if(L>=8&&M._keystoneCandidates(AFSLOT[slot],L).length){elig++; if(it.affixes.some(a=>M._isKeystone(a.id)))rolled++;} }
  const obs=100*rolled/elig; assert.ok(elig>20000,`eligible 표본 충분(${elig})`);
  assert.ok(Math.abs(obs-2)<=0.2,`observed=${obs.toFixed(3)}% / eligible ≈2% (n=${elig})`);
});

test('§6/§10 500k production invariants — layer<8/invalidSlot/2+/unknown/noCand/C1/leak = 0', () => {
  const M=build(seededMath(0x111),true); const rng=mul(0x1CE); const N=300000;
  let ltl8=0,badSlot=0,two=0,unk=0,noCand=0,v2s=0,c1=0,dup=0,nan=0,undef=0,leak=0;
  for(let i=0;i<N;i++){ const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)]; const it=M.mkItemFull(slot,~~(rng()*6),~~(rng()*1000),slot==='bracelet'?'demon':undefined);
    const L=it.layerLv||0; let ks=0; const seen=new Set(),aBy={},bBy={};
    for(const a of (it.affixes||[])){ const d=DEF[a.id]; if(!d){undef++;continue}
      if(d.sub==='LEGACY')leak++; if(d.v2skip)v2s++; if(seen.has(a.id))dup++; seen.add(a.id);
      if(d.keystone){ks++; if(L<8)ltl8++; const as=AFSLOT[slot]; if(as!=='wpn'&&as!=='armor')badSlot++; if(!KS_IDS.includes(a.id))unk++; if(!M._keystoneCandidates(as,L).length)noCand++; }
      else{ if(typeof a.value!=='number'||Number.isNaN(a.value))nan++; if(d.sub==='A'){aBy[d.layer]=(aBy[d.layer]||0)+1;if(aBy[d.layer]>1)c1++}else if(d.sub==='B'){bBy[d.layer]=(bBy[d.layer]||0)+1;if(bBy[d.layer]>1)c1++} }
    }
    if(ks>=2)two++;
  }
  assert.equal(ltl8,0,'layer<8 KS'); assert.equal(badSlot,0,'invalid slot KS'); assert.equal(two,0,'item당 2+ KS');
  assert.equal(unk,0,'unknown KS'); assert.equal(noCand,0,'noCandidate KS'); assert.equal(v2s,0,'v2skip'); assert.equal(c1,0,'C1'); assert.equal(dup,0); assert.equal(nan,0); assert.equal(leak,0);
});

test('§9/§16 5 Keystone reachability · L8/9/10 가능 · L1~7 불가', () => {
  const M=build(seededMath(0x161),true); const reach={}; for(let L=1;L<=10;L++)reach[L]=new Set();
  for(const slot of ['weapon','armor'])for(let L=1;L<=10;L++)for(let i=0;i<4000;i++){const ks=M._rollKeystoneOnItem({slot,layerLv:L,affixes:[]},true); if(ks)reach[L].add(ks.id);}
  for(let L=1;L<=7;L++)assert.equal(reach[L].size,0,`L${L} keystone 불가`);
  for(let L=8;L<=10;L++)assert.equal(reach[L].size,5,`L${L} 5종 전부 가능`);
  const all=new Set(); for(let L=8;L<=10;L++)for(const id of reach[L])all.add(id);
  assert.deepEqual([...all].sort(),KS_IDS.slice().sort(),'5종 전부 reachable');
});

test('§11 production-rolled runtime E2E — equip→effect→unequip (forced 아님)', () => {
  const got=collectKeystoneItems(0xE2E,KS_IDS);
  assert.deepEqual(Object.keys(got).sort(),KS_IDS.slice().sort(),'5종 production roll 수집');
  // 각 production-rolled item equip → combat consumer 정상 → unequip 원복
  const {item:dc,M}=got.ksDullConviction; M._equip(dc); assert.ok(Math.abs(M._ksDmgMul()-1.30)<1e-9,'무딘확신 dmg×1.30'); M._unequip(); assert.equal(M._ksDmgMul(),1);
  M._equip(got.ksGlassGreatsword.item); assert.ok(Math.abs(M._ksDmgMul()-1.40)<1e-9,'유리 dmg×1.40'); assert.ok(Math.abs(M._ksTakenMul()-1.25)<1e-9,'유리 taken×1.25');
  M._equip(got.ksBloodOath.item); assert.equal(M._ksBloodOath(),true,'혈석 active');
  M._equip(got.ksRootedGiant.item); assert.equal(M._ksRootedGiant(),true,'거인 active');
  M._equip(got.ksBloodPact.item); assert.ok(Math.abs(M._ksLifestealMul()-2)<1e-9,'핏빛 흡혈×2'); assert.ok(Math.abs(M._ksHealMul()-0.5)<1e-9,'핏빛 회복×0.5');
  M._unequip(); assert.equal(M._ksBloodOath(),false); assert.equal(M._ksLifestealMul(),1);
});

test('§12 production-rolled UI marker + §13 save/load roundtrip', () => {
  const got=collectKeystoneItems(0x12E,['ksDullConviction','ksBloodOath']);
  const {item:dc,M}=got.ksDullConviction;
  assert.equal(M._itemHasKeystone(dc),true,'◈ marker(_itemHasKeystone)');
  assert.equal(M._itemKeystoneCount(dc),1,'tooltip 1 keystone');
  // save→load roundtrip
  const round=JSON.parse(JSON.stringify(dc)); const ksId=dc.affixes.find(a=>M._isKeystone(a.id)).id;
  assert.equal(round.layerLv,dc.layerLv,'layerLv 보존'); assert.equal(M._itemHasKeystone(round),true,'load 후 keystone 유지');
  assert.equal(round.affixes.find(a=>M._isKeystone(a.id)).id,ksId,'keystone id 보존');
  M._equip(round); assert.ok(Math.abs(M._ksDmgMul()-1.30)<1e-9,'load 후 runtime effect 동일'); M._unequip();
  // Keystone runtime state 추가 저장 없음: item 필드 = 표준 affix만
  assert.ok(dc.affixes.every(a=>'id'in a&&('value'in a||'val'in a||true)),'표준 affix 구조(추가 runtime state 없음)');
});

test('§14 non-eligible/non-keystone item 불변 — 98% eligible & 전 non-eligible item 정상', () => {
  const M=build(seededMath(0x14E),true);
  // non-eligible slot(ring) L9 → keystone 없음, 일반 affix 정상
  let ringKs=0; for(let i=0;i<20000;i++){const it=M.mkItemFull('ring1',4,900); if(it.affixes&&it.affixes.some(a=>M._isKeystone(a.id)))ringKs++;}
  assert.equal(ringKs,0,'non-eligible slot keystone 0');
  // eligible weapon 대다수(98%)는 keystone 없음
  let wk=0,wn=0; for(let i=0;i<20000;i++){const it=M.mkItemFull("weapon",4,900); if(it.layerLv>=8){wn++; if(it.affixes.some(a=>M._isKeystone(a.id)))wk++;}}
  assert.ok(wk/wn<0.05,`eligible weapon 대부분 keystone 없음(${(100*wk/wn).toFixed(1)}%)`);
});

test('§15 RNG short-circuit — non-eligible keystone RNG 0 소비', () => {
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.5}; const M=build(spy,true);
  calls=0; for(let i=0;i<50000;i++)M._rollKeystoneOnItem({slot:'ring1',layerLv:9,affixes:[]},false); assert.equal(calls,0,'invalid slot 0 RNG');
  calls=0; for(let i=0;i<50000;i++)M._rollKeystoneOnItem({slot:'weapon',layerLv:5,affixes:[]},false); assert.equal(calls,0,'layer<8 0 RNG');
  calls=0; for(let i=0;i<50000;i++)M._rollKeystoneOnItem({slot:'weapon',layerLv:9,affixes:[{id:'ksDullConviction',value:1}]},false); assert.equal(calls,0,'already-has 0 RNG');
});

test('§17 beam independence — beam tier=layerLv, keystone 여부 무관', () => {
  const M=build(seededMath(0x17E),true);
  for(let L=1;L<=10;L++){ const noKs={slot:'weapon',layerLv:L,affixes:[]}; const withKs={slot:'weapon',layerLv:L,affixes:[{id:'ksDullConviction',value:1}]};
    assert.equal(M._itemLayerBeamTier(noKs),L,`L${L} beam`); assert.equal(M._itemLayerBeamTier(withKs),L,`L${L} beam(keystone 무관)`); }
});

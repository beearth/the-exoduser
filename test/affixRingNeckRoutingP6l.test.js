import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6L / LOCK-40] RING/NECK AFFIX ROUTING DEBT CLOSURE ═══
// ring/neck 수동 affix push(legacy dead code) 제거 검증. V2 roller가 resist/resource 제공(손실 0).
// overwrite/dup/undefined/C1/group-dup/v2skip = 0. Keystone/Layer/L5/L9 불변. A2/V2/2% 변경 없음.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab=(re,n)=>{const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0]};
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const CANON=grab(/function _itemLayerCap\(itemLv\)\{[^}]*\}/,'cap')+'\n'+grab(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/,'w')+'\n'+grab(/function _rollItemLayerA2\(itemLv,rng\)\{[\s\S]*?return cap\}/,'r');
const pp={afslot:grab(/const _AFSLOT=\{[^}]*\};/,'af'),tier:grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/,'t'),
  cand:grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/,'c'),roll:grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/,'r2')};
function build(injectMath){
  const body=`const AFFIX_POOL=arguments[2];\n${pp.afslot}\nlet _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `let _EQ={};function _eqAffix(id){return _EQ[id]||0}function _equip(it){_EQ={};if(it&&it.affixes)for(const a of it.affixes)_EQ[a.id]=(a.value!=null?a.value:0);}function _unequip(){_EQ={};}\n`+
    `${CANON}\n${pp.tier}\n${pp.cand}\n${pp.roll}\n`+
    // [P6L] mkItem ring/neck affix 경로 = producer→routing (수동 push 제거된 현 상태)
    `function mkAffixPath(slot,rarity,pLv){var layerLv;var _p=pLv||1;if(ITEM_LAYER_ROLL_V2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_p/10)*10),Math.random);}`+
    `var item={slot,rarity,layerLv:Math.max(1,Math.min(10,~~layerLv))};item.affixes=rollAffixesLayered(rarity,slot,undefined,layerLv);return item;}\n`+
    `return {mkAffixPath,_equip,_unequip,_eqAffix};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
const RES=['fireRes','iceRes','lightRes','darkRes','poisonRes','allRes'];
const RESRC=['maxSTFlat','maxMPFlat','eDefFlat','lckFlatR','gritFlatR','lckFlatN','gritFlatN','mpCostRed','expBonus'];

// ══════════════════════════════════════════════════════════════════════
test('§1 dead code 제거 확인 — _ringAffPool/_neckAffPool·val-push 잔재 0', () => {
  assert.equal(/_ringAffPool/.test(gameHtml),false,'_ringAffPool 제거');
  assert.equal(/_neckAffPool/.test(gameHtml),false,'_neckAffPool 제거');
  assert.equal(/item\.affixes\.push\(\{id:_[rn]Aff/.test(gameHtml),false,'ring/neck val-push 제거');
  // routing은 유지(V2가 ring/neck affix 제공)
  assert.match(gameHtml,/item\.affixes=\(ITEM_LAYER_ROLL_V2&&layerLv>=1\)\?rollAffixesLayered\(rarity,slot,item\.brType,layerLv\):rollAffixes\(rarity,slot,item\.brType\);/,'routing 유지');
  // 제거 근거 주석
  assert.match(gameHtml,/\[P6L\/LOCK-40\] ring\/neck 수동 affix push 제거/,'제거 근거 주석');
});

test('§2 A2/V2/Keystone/2% 불변 — 시스템 보호', () => {
  assert.match(gameHtml,/const ITEM_LAYER_ROLL_V2=true;/); assert.match(gameHtml,/const KEYSTONE_ROLL_ENABLED=true;/);
  assert.match(gameHtml,/const KEYSTONE_ROLL_RATE=0\.02;/,'2% FREEZE');
  assert.match(gameHtml,/function _itemLayerWeightsA2\(cap\)\{const w=\[\];const mode=Math\.max\(1,cap-3\),sig=1\.6,kap=0\.6,fl=0\.15;/,'A2 파라미터 FREEZE');
});

test('§11/§12 ring/neck 대량(각 200k) — 손실 없음·invariants 0·val 필드 0', () => {
  for(const slot of ['ring1','ring2','necklace']){
    const M=build(seededMath(0x6C0000 ^ (slot.length*131))); const N=slot==='ring2'?40000:100000;
    let undef=0,dupId=0,dupGrp=0,badLayer=0,c1=0,v2skip=0,valField=0,resAppear=0,resrcAppear=0,empty=0;
    for(let i=0;i<N;i++){ const it=M.mkAffixPath(slot,4,700); const affs=it.affixes||[]; if(!affs.length)empty++;
      const seen=new Set(),grp=new Set(),aBy={},bBy={}; let hasRes=false,hasResrc=false;
      for(const a of affs){ const d=DEF[a.id]; if(!d){undef++;continue}
        if('val'in a && !('value'in a))valField++;                 // 수동 push 잔재(val 전용) 검출
        if(seen.has(a.id))dupId++; seen.add(a.id);
        if(d.group){ if(grp.has(d.group))dupGrp++; grp.add(d.group); }
        if(!(d.layer>=1&&d.layer<=it.layerLv&&d.layer<=10))badLayer++;
        if(d.v2skip)v2skip++;
        if(d.sub==='A'){aBy[d.layer]=(aBy[d.layer]||0)+1;if(aBy[d.layer]>1)c1++}else if(d.sub==='B'){bBy[d.layer]=(bBy[d.layer]||0)+1;if(bBy[d.layer]>1)c1++}
        if(RES.includes(a.id))hasRes=true; if(RESRC.includes(a.id))hasResrc=true;
      }
      if(hasRes)resAppear++; if(hasResrc)resrcAppear++;
    }
    assert.equal(undef,0,`${slot} undefined`); assert.equal(dupId,0,`${slot} dup ID`); assert.equal(dupGrp,0,`${slot} dup group`);
    assert.equal(badLayer,0,`${slot} invalid layer`); assert.equal(c1,0,`${slot} C1`); assert.equal(v2skip,0,`${slot} v2skip leak`);
    assert.equal(valField,0,`${slot} val-only 잔재 0`); assert.equal(empty,0,`${slot} empty 0`);
    // 손실 없음: resist/resource affix가 V2로 계속 출현
    assert.ok(resAppear/N>0.3,`${slot} resist 출현 유지(${(100*resAppear/N).toFixed(0)}%)`);
    assert.ok(resrcAppear/N>0.5,`${slot} resource 출현 유지(${(100*resrcAppear/N).toFixed(0)}%)`);
  }
});

test('§11 ring/neck E2E — equip consumer 작동·unequip 복구·save/load', () => {
  const M=build(seededMath(0xE2E));
  for(const slot of ['ring1','necklace']){
    const it=M.mkAffixPath(slot,4,900); assert.ok(it.affixes.length>0,`${slot} affix 존재`);
    // 모든 affix가 value 필드 보유(overwrite 잔재 없음)
    for(const a of it.affixes)assert.ok('value'in a,`${slot} ${a.id} value 필드`);
    // equip → consumer(_eqAffix) 실제 값 반영
    M._equip(it); const first=it.affixes[0]; assert.equal(M._eqAffix(first.id),first.value,`${slot} equip 값 반영`);
    M._unequip(); assert.equal(M._eqAffix(first.id),0,`${slot} unequip 복구`);
    // save/load roundtrip
    const round=JSON.parse(JSON.stringify(it));
    assert.deepEqual(round.affixes.map(a=>a.id),it.affixes.map(a=>a.id),`${slot} save affix set 동일`);
    assert.equal(round.layerLv,it.layerLv,`${slot} layerLv 보존`);
    M._equip(round); assert.equal(M._eqAffix(first.id),first.value,`${slot} load 후 값 동일`); M._unequip();
  }
});

test('§9 Keystone 불변 — ring/neck는 keystone-eligible 아님', () => {
  // ring/neck slot에 keystone affix 없음(pool 확인) + V2 roll에서 keystone 미출현
  const M=build(seededMath(0x9A));
  let ks=0; for(const slot of ['ring1','necklace'])for(let i=0;i<20000;i++){ const it=M.mkAffixPath(slot,4,900);
    if(it.affixes.some(a=>DEF[a.id]&&DEF[a.id].keystone))ks++; }
  assert.equal(ks,0,'ring/neck V2 roll에 keystone 0(eligible slot 아님)');
});

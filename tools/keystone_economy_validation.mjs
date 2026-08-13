// ═══════════════════════════════════════════════════════════════════════════
// LOCK-39 — KEYSTONE PRODUCTION ENABLE & FINAL CLOSURE (Phase 6K)
// ───────────────────────────────────────────────────────────────────────────
// 실제 production 함수 verbatim: A2 producer·V2 roller·_keystoneCandidates·_rollKeystoneOnItem·
//   mkItem keystone 블록(KEYSTONE_ROLL_ENABLED 게이트). A/B/C 확률 분리(§1), observed 2%(§7),
//   5종 distribution(§9), 1M invariants(§6), L8/9/10 reachable(§16).
// 2% conditional rate·A2·combat 변경 금지. 실행: node tools/keystone_economy_validation.mjs
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
import { readFileSync } from 'node:fs';
const g = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab=(re,n)=>{const m=g.match(re);if(!m)throw new Error('추출 실패 '+n);return m[0]};
const SLOT_NAMES=new Function('return '+grab(/const SLOT_NAMES=\[[^\]]*\]/,'SLOT').replace('const SLOT_NAMES=',''))();
const AFFIX_POOL=(()=>{const s=g.indexOf('const AFFIX_POOL=[');const e=g.indexOf('\n];',s);
  return new Function('return '+g.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const CANON=grab(/function _itemLayerCap\(itemLv\)\{[^}]*\}/,'cap')+'\n'+grab(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/,'w')+'\n'+grab(/function _rollItemLayerA2\(itemLv,rng\)\{[\s\S]*?return cap\}/,'roll');
const P={afslot:grab(/const _AFSLOT=\{[^}]*\};/,'af'),krate:grab(/const KEYSTONE_ROLL_RATE=[^;]*;/,'kr'),
  tier:grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/,'t'),cand:grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/,'c'),
  roll:grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/,'r'),
  kcand:grab(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/,'kc'),kcnt:grab(/function _itemKeystoneCount\(item\)\{.*\}/,'kn'),
  kroll:grab(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/,'kr2'),iskey:grab(/function _isKeystone\(id\)\{[^}]*\}/,'ik')};
function build(injectMath,ksEnabled){
  const body=`const AFFIX_POOL=arguments[2];const SLOT_NAMES=${JSON.stringify(SLOT_NAMES)};\n${P.afslot}\n${P.krate}\n`+
    `let KEYSTONE_ROLL_ENABLED=${!!ksEnabled};let ITEM_LAYER_ROLL_V2=true;let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${CANON}\n${P.tier}\n${P.cand}\n${P.roll}\n${P.kcand}\n${P.kcnt}\n${P.kroll}\n${P.iskey}\n`+
    // 실제 mkItem producer→routing→keystone 블록 재현(verbatim 게이트)
    `function mkItemFull(slot,rarity,pLv,brType){var layerLv;var _plvP=pLv||1;`+
    `if(ITEM_LAYER_ROLL_V2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_plvP/10)*10),Math.random);}`+
    `var item={slot,rarity,layerLv:(layerLv>=1?Math.max(1,Math.min(10,~~layerLv)):undefined),brType};`+
    `item.affixes=(ITEM_LAYER_ROLL_V2&&layerLv>=1)?rollAffixesLayered(rarity,slot,brType,layerLv):null;`+
    `if(KEYSTONE_ROLL_ENABLED&&item.affixes&&_itemKeystoneCount(item)<1){var _ks=_rollKeystoneOnItem(item,false);if(_ks)item.affixes.push(_ks);}`+
    `return item;}\n`+
    `return {SLOT_NAMES,mkItemFull,_rollItemLayerA2,_itemLayerCap,_keystoneCandidates,_rollKeystoneOnItem,_itemKeystoneCount,_isKeystone,get KRATE(){return KEYSTONE_ROLL_RATE}};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build(Math,true); const RATE=API.KRATE;
const AFSLOT=new Function(P.afslot+'return _AFSLOT;')();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
const KS_IDS=['ksDullConviction','ksGlassGreatsword','ksBloodOath','ksRootedGiant','ksBloodPact'];

const OUT=[]; const log=(...a)=>{const s=a.join(' ');OUT.push(s);console.log(s)};
log('═══════════════════════════════════════════════════════════════════════');
log('LOCK-39 KEYSTONE PRODUCTION ENABLE & FINAL CLOSURE — 실제 production path');
log('═══════════════════════════════════════════════════════════════════════');

// §2 keystone metadata + eligible slot set (HEAD 기준)
log('\n── §2 keystone metadata (HEAD POOL) + eligible slot set ──');
for(const id of KS_IDS){const d=DEF[id];log(`  ${id}: slots=${JSON.stringify(d.slots)} layer=${d.layer} keystone=${d.keystone} sub=${d.sub}`);}
const eligSlots=SLOT_NAMES.filter(sl=>{const as=AFSLOT[sl];for(let L=8;L<=10;L++)if(API._keystoneCandidates(as,L).length)return true;return false});
log(`  eligible item slot set = ${JSON.stringify(eligSlots)} (${eligSlots.length}/${SLOT_NAMES.length} = ${eligSlots.length}/15)`);
log(`  weapon 후보(L≥8): ${API._keystoneCandidates('wpn',8).map(c=>c.id).join(',')} | armor 후보(L≥8): ${API._keystoneCandidates('armor',8).map(c=>c.id).join(',')}`);

// §1/§8 scenario별 A / B / C (실제 producer + 실제 _keystoneCandidates)
log('\n── §1/§8 scenario별 A=P(L≥8) / B=P(eligible item) / C=P(actual Keystone)=B×0.02 ──');
const scen={EARLY:[1,150],MID:[300,600],LATE:[700,890],ENDGAME:[900,900],UNIFORM:[0,999]};
log('  scenario | A P(L≥8) | B P(eligible) | C P(Keystone) | items/Keystone');
for(const k of Object.keys(scen)){const[lo,hi]=scen[k];const rng=mul(0x5C0+k.length);const N=300000;let a=0,b=0;
  for(let i=0;i<N;i++){const pLv=lo+~~(rng()*(hi-lo+1));const itemLv=Math.min(900,Math.floor(pLv/10)*10);const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    const L=API._rollItemLayerA2(itemLv,rng);if(L>=8){a++;if(API._keystoneCandidates(AFSLOT[slot],L).length)b++;}}
  const A=a/N,B=b/N,C=B*RATE;
  log(`  ${k.padEnd(8)} | ${(A*100).toFixed(2)}% | ${(B*100).toFixed(3)}% | ${(C*100).toFixed(4)}% | ${C>0?'1/'+Math.round(1/C):'∞'}`);
}
log('  ▶ 6J "ENDGAME 34.22%" = A(P(L≥8)). B(eligible)=A×2/15≈4.56%, C=B×0.02≈0.0913%≈1/1095. (label 확인, 코드 무변경)');

// §7 observed conditional 2% (실제 mkItem keystone roll, flag=true) — eligible denominator
log('\n── §7 observed conditional 2% (실제 production roll, eligible denominator) ──');
{const M=build(seededMath(0x2FF),true);const rng=mul(0x2AA);const N=2000000;let elig=0,rolled=0;
  for(let i=0;i<N;i++){const pLv=~~(rng()*1000);const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];const rarity=~~(rng()*6);const br=slot==='bracelet'?(rng()<.5?'demon':'life'):undefined;
    const it=M.mkItemFull(slot,rarity,pLv,br);const L=it.layerLv||0;const isElig=(L>=8&&M._keystoneCandidates(AFSLOT[slot],L).length>0);
    if(isElig)elig++;if(it.affixes&&it.affixes.some(a=>M._isKeystone(a.id)))rolled++;}
  const obs=100*rolled/elig;log(`  N=${N} eligible=${elig} keystone rolled=${rolled} → observed = ${obs.toFixed(3)}% / eligible (목표 2%, tol ±0.15%p)`);
  log(`  ▶ ${Math.abs(obs-2)<=0.15?'CONDITIONAL_2PCT_OK':'OUT_OF_TOL'} (2% denominator=eligible item, all-item 해석 아님)`);
}

// §6/§10 million-item invariants (flag=true)
log('\n── §6/§10 1,000,000 production items (flag=true) invariants ──');
{const M=build(seededMath(0x111),true);const rng=mul(0x1CE);const N=1000000;
  let ksLayerLt8=0,ksBadSlot=0,ks2plus=0,ksUnknown=0,ksNoCand=0,v2skip=0,c1=0,dup=0,nan=0,undef=0,legacyLeak=0;let ksTotal=0;const dist={};
  for(let i=0;i<N;i++){const pLv=~~(rng()*1000);const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];const rarity=~~(rng()*6);const br=slot==='bracelet'?(rng()<.5?'demon':'life'):undefined;
    const it=M.mkItemFull(slot,rarity,pLv,br);const L=it.layerLv||0;const affs=it.affixes||[];
    let ksCount=0;const seen=new Set(),aBy={},bBy={};
    for(const a of affs){const d=DEF[a.id];if(!d){undef++;continue}
      if(d.sub==='LEGACY')legacyLeak++;if(d.v2skip)v2skip++;
      if(seen.has(a.id))dup++;seen.add(a.id);if(typeof a.value!=='number'||Number.isNaN(a.value)){if(!d.keystone)nan++;}
      if(d.keystone){ksCount++;ksTotal++;dist[a.id]=(dist[a.id]||0)+1;
        if(L<8)ksLayerLt8++;const as=AFSLOT[slot];if(as!=='wpn'&&as!=='armor')ksBadSlot++;
        if(!KS_IDS.includes(a.id))ksUnknown++;if(!M._keystoneCandidates(as,L).length)ksNoCand++;}
      else{if(d.sub==='A'){aBy[d.layer]=(aBy[d.layer]||0)+1;if(aBy[d.layer]>1)c1++}else if(d.sub==='B'){bBy[d.layer]=(bBy[d.layer]||0)+1;if(bBy[d.layer]>1)c1++}}
    }
    if(ksCount>=2)ks2plus++;
  }
  log(`  N=${N} keystone total=${ksTotal} (${(100*ksTotal/N).toFixed(3)}% all-items)`);
  log(`  layer<8 KS=${ksLayerLt8} invalidSlot KS=${ksBadSlot} item당2+ KS=${ks2plus} unknown KS=${ksUnknown} noCandidate KS=${ksNoCand}`);
  log(`  v2skip leak=${v2skip} C1 violation=${c1} dupID=${dup} NaN=${nan} undefinedAffix=${undef} legacyLeak=${legacyLeak}`);
  const bad=ksLayerLt8+ksBadSlot+ks2plus+ksUnknown+ksNoCand+v2skip+c1+dup+nan+undef+legacyLeak;
  log(`  ▶ ${bad===0?'ALL_INVARIANTS_CLEAN':'INVARIANT_FAIL'}`);
  // §9 distribution
  log('\n── §9 5 Keystone distribution (실제 production roll) ──');
  for(const id of KS_IDS){const c=dist[id]||0;log(`  ${id}: ${c} (${ksTotal?(100*c/ksTotal).toFixed(1):0}% of keystones)`);}
  log(`  주: weapon 후보3(각~1/3), armor 후보2(각~1/2). slot frequency 동일(2/15)이므로 global share = wpn 3종≈(1/2)×(1/3)=1/6, armor 2종≈(1/2)×(1/2)=1/4. 20% 균등 아님.`);
}

// §16 L8/9/10 reachable · L1~7 zero (per keystone)
log('\n── §16 Layer/Keystone relationship (L8/9/10 가능, L1~7 불가) ──');
{const M=build(seededMath(0x161),true);const reachAt={};for(let L=1;L<=10;L++)reachAt[L]=new Set();
  for(const slot of ['weapon','armor'])for(let L=1;L<=10;L++){for(let i=0;i<3000;i++){const it={slot,layerLv:L,affixes:[]};const ks=M._rollKeystoneOnItem(it,true);if(ks)reachAt[L].add(ks.id);}}
  for(let L=1;L<=10;L++){const s=[...reachAt[L]];log(`  L${L}: ${s.length?s.join(','):'(none)'}`);}
  const lowZero=[1,2,3,4,5,6,7].every(L=>reachAt[L].size===0);const highOk=[8,9,10].every(L=>reachAt[L].size>0);
  log(`  ▶ L1~7 keystone=0: ${lowZero} · L8/9/10 reachable: ${highOk} → ${lowZero&&highOk?'LAYER_GATE_OK':'FAIL'}`);
}

// §15 RNG short-circuit (non-eligible = keystone RNG 미소비)
log('\n── §15 RNG short-circuit (non-eligible item keystone RNG 0 소비) ──');
{let calls=0;const spy=Object.create(Math);spy.random=()=>{calls++;return 0.5};const M=build(spy,true);
  // layer<8 & candidate 0 → _rollKeystoneOnItem이 Math.random 게이트 전에 return
  calls=0;for(let i=0;i<100000;i++)M._rollKeystoneOnItem({slot:'ring1',layerLv:9,affixes:[]},false); // invalid slot(candidate 0)
  const c1=calls;calls=0;for(let i=0;i<100000;i++)M._rollKeystoneOnItem({slot:'weapon',layerLv:5,affixes:[]},false); // layer<8
  const c2=calls;calls=0;for(let i=0;i<100000;i++)M._rollKeystoneOnItem({slot:'weapon',layerLv:9,affixes:[{id:'ksDullConviction',value:1}]},false); // already has
  const c3=calls;
  log(`  non-eligible RNG 소비: invalidSlot=${c1} layer<8=${c2} alreadyHasKS=${c3} → ${(c1+c2+c3)===0?'SHORT_CIRCUIT_OK':'FAIL'}`);
}

log('\n═══ GATE (see sections above) ═══');
log('  ⚠ 이 tool은 flag=true sandbox 검증. game.html flag flip은 별도(commit).');
import('fs').then(fs=>fs.writeFileSync(new URL('./keystone_economy_validation.out.txt', import.meta.url), OUT.join('\n')+'\n'));

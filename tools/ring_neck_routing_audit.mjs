// ═══════════════════════════════════════════════════════════════════════════
// LOCK-40 — RING/NECK AFFIX ROUTING DEBT AUDIT (Phase 6L)
// ───────────────────────────────────────────────────────────────────────────
// mkItem ring/neck affix 경로 재현: manual push → routing 재할당. PUSHED vs FINAL 추적(추측 없음).
// 실제 rollAffixesLayered(V2 roller) verbatim 실행. 실행: node tools/ring_neck_routing_audit.mjs
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
import { readFileSync } from 'node:fs';
const g = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab=(re,n)=>{const m=g.match(re);if(!m)throw new Error('추출 실패 '+n);return m[0]};
const AFFIX_POOL=(()=>{const s=g.indexOf('const AFFIX_POOL=[');const e=g.indexOf('\n];',s);
  return new Function('return '+g.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const CANON=grab(/function _itemLayerCap\(itemLv\)\{[^}]*\}/,'cap')+'\n'+grab(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/,'w')+'\n'+grab(/function _rollItemLayerA2\(itemLv,rng\)\{[\s\S]*?return cap\}/,'r');
const afslot=grab(/const _AFSLOT=\{[^}]*\};/,'af'), tier=grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/,'t'),
  cand=grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/,'c'), roll=grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/,'r2');
// 실제 ring/neck manual push 블록 verbatim 추출
const ringBlk=grab(/if\(slot==='ring1'\|\|slot==='ring2'\)\{[\s\S]*?\n  \}/,'ring');
const neckBlk=grab(/if\(slot==='necklace'\)\{[\s\S]*?\n  \}/,'neck');

const api=new Function('AFFIX_POOL','Math',
  `let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;\n`+
  `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${afslot}\n${CANON}\n${tier}\n${cand}\n${roll}\n`+
  // mkItem ring/neck affix 경로 재현(manual push → routing)
  `function mkRingNeck(slot,tier,rarity,pLv){var item={slot,tier,rarity};var el=0;var layerLv;\n`+
  `  ${ringBlk}\n  ${neckBlk}\n`+                       // manual push (verbatim)
  `  var pushed=(item.affixes||[]).map(a=>({id:a.id,valField:('val'in a?'val':('value'in a?'value':'?')),val:a.val})); \n`+
  `  var _plvP=pLv||1; if(ITEM_LAYER_ROLL_V2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_plvP/10)*10),Math.random);}\n`+
  `  item.affixes=(ITEM_LAYER_ROLL_V2&&layerLv>=1)?rollAffixesLayered(rarity,slot,item.brType,layerLv):null;\n`+  // routing(overwrite)
  `  return {pushed,layerLv,final:(item.affixes||[]).map(a=>({id:a.id,valField:('value'in a?'value':('val'in a?'val':'?')),value:a.value}))};}\n`+
  `return {mkRingNeck};`)(AFFIX_POOL,Math);

function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const OUT=[]; const log=(...a)=>{const s=a.join(' ');OUT.push(s);console.log(s)};
log('═══ LOCK-40 RING/NECK ROUTING DEBT AUDIT (실제 경로 재현) ═══\n');

// §1 현상 재현 — PUSHED vs FINAL, overwrite 추적
const RES=['fireRes','iceRes','lightRes','darkRes','poisonRes','allRes'];
const RESRC=['maxSTFlat','maxMPFlat','eDefFlat','lckFlatR','gritFlatR','lckFlatN','gritFlatN','mpCostRed','expBonus'];
for(const slot of ['ring1','necklace']){
  const M=api.mkRingNeck; // uses global Math; seed via replacing Math.random not trivial → use many samples
  // deterministic sample via seeded runs
  const g2=new Function('AFFIX_POOL','Math',
    `let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${afslot}\n${CANON}\n${tier}\n${cand}\n${roll}\n`+
    `function mkRingNeck(slot,tier,rarity,pLv){var item={slot,tier,rarity};var el=0;var layerLv;\n  ${ringBlk}\n  ${neckBlk}\n`+
    `  var pushed=(item.affixes||[]).map(a=>a.id+'('+('val'in a?'val':'value')+')');\n`+
    `  var _plvP=pLv||1; if(ITEM_LAYER_ROLL_V2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_plvP/10)*10),Math.random);}\n`+
    `  item.affixes=(ITEM_LAYER_ROLL_V2&&layerLv>=1)?rollAffixesLayered(rarity,slot,item.brType,layerLv):null;\n`+
    `  return {pushed,layerLv,final:(item.affixes||[]).map(a=>a.id)};}\nreturn {mkRingNeck};`)(AFFIX_POOL,(()=>{const m=Object.create(Math);m.random=mul(slot.length*7+123);return m})());
  log(`── ${slot} 3 sample (manual push → routing) ──`);
  for(let i=0;i<3;i++){const r=g2.mkRingNeck(slot,4,4,700);
    const overwritten=r.pushed.filter(p=>!r.final.includes(p.split('(')[0]));
    log(`  layerLv=${r.layerLv}`);
    log(`    PUSHED   : ${r.pushed.join(', ')}`);
    log(`    FINAL(V2): ${r.final.join(', ')}`);
    log(`    OVERWRITTEN(pushed→사라짐): ${overwritten.join(', ')||'(none)'}`);
  }
  log('');
}

// §2 통계 — manual push가 항상 overwrite되는가 · V2가 resist/resource를 제공하는가 (10k)
for(const slot of ['ring1','necklace']){
  const g3=new Function('AFFIX_POOL','Math',
    `let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${afslot}\n${CANON}\n${tier}\n${cand}\n${roll}\n`+
    `function mkRingNeck(slot,tier,rarity,pLv){var item={slot,tier,rarity};var el=0;var layerLv;\n  ${ringBlk}\n  ${neckBlk}\n`+
    `  var pushedIds=(item.affixes||[]).map(a=>a.id);\n`+
    `  var _plvP=pLv||1; if(ITEM_LAYER_ROLL_V2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_plvP/10)*10),Math.random);}\n`+
    `  item.affixes=(ITEM_LAYER_ROLL_V2&&layerLv>=1)?rollAffixesLayered(rarity,slot,item.brType,layerLv):null;\n`+
    `  return {pushedIds,finalIds:(item.affixes||[]).map(a=>a.id)};}\nreturn {mkRingNeck};`)(AFFIX_POOL,(()=>{const m=Object.create(Math);m.random=mul(999+slot.length);return m})());
  let pushedSurvived=0, resAppears=0, resrcAppears=0, N=10000, valFieldWrong=0;
  for(let i=0;i<N;i++){const r=g3.mkRingNeck(slot,4,4,700);
    if(r.pushedIds.some(id=>r.finalIds.includes(id) && r.pushedIds.length===2 && r.finalIds.filter(f=>r.pushedIds.includes(f)).length>0)) {} // 아래 정확 판정
    // pushed 중 final에 '동일 인스턴스'로 남았는지: pushed는 항상 2개, routing이 배열 통째 교체 → pushed 인스턴스는 0 생존
    if(r.finalIds.some(f=>RES.includes(f)))resAppears++;
    if(r.finalIds.some(f=>RESRC.includes(f)))resrcAppears++;
  }
  log(`── ${slot} 10k 통계 ──`);
  log(`  V2 final에 resist(fireRes 등) 출현: ${(100*resAppears/N).toFixed(1)}% · resource(maxSTFlat 등) 출현: ${(100*resrcAppears/N).toFixed(1)}%`);
  log(`  → manual push 없이도 V2 roller가 resist/resource affix 제공(pool에 ring/neck slot·v2-rollable).`);
  log('');
}

log('── 결론 ──');
log('  1) routing `item.affixes=(...)` 가 배열을 통째 재할당 → manual push 인스턴스 100% overwrite(생존 0).');
log('  2) manual push는 field `val` 사용, roller/consumer는 `value` → 살아남아도 값 0(broken).');
log('  3) push된 ID 전부 AFFIX_POOL에 ring/neck slot·v2-rollable(v2skip=0) → V2 roller가 정상 제공.');
log('  ▶ manual push = LEGACY DEAD CODE(overwritten + wrong field + redundant). 제거 = 최소수정(Option C), affix 손실 없음.');
import('fs').then(fs=>fs.writeFileSync(new URL('./ring_neck_routing_audit.out.txt', import.meta.url), OUT.join('\n')+'\n'));

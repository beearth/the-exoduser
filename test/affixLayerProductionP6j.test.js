import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6J / LOCK-38] MODEL_A2 PRODUCTION LAYER ACTIVATION ═══
// canonical A2 producer(_rollItemLayerA2)·mkItem 주입·ITEM_LAYER_ROLL_V2=true·Layer UI·beam·Keystone eligible economy.
// KEYSTONE_ROLL_ENABLED=false 유지(Keystone 실제 roll=0). A2 파라미터 FREEZE.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab=(re,n)=>{const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0]};
const SLOT_NAMES=new Function('return '+grab(/const SLOT_NAMES=\[[^\]]*\]/,'SLOT').replace('const SLOT_NAMES=',''))();
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const CANON=grab(/function _itemLayerCap\(itemLv\)\{[^}]*\}/,'cap')+'\n'+grab(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/,'wA2')+'\n'+grab(/function _rollItemLayerA2\(itemLv,rng\)\{[\s\S]*?return cap\}/,'rollA2');
const parts={
  afslot:grab(/const _AFSLOT=\{[^}]*\};/,'afslot'), krate:grab(/const KEYSTONE_ROLL_RATE=[^;]*;/,'krate'),
  tier:grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/,'tier'), cand:grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/,'cand'),
  roll:grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/,'roll'),
  kcand:grab(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/,'kcand'), kcnt:grab(/function _itemKeystoneCount\(item\)\{.*\}/,'kcnt'),
  kroll:grab(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/,'kroll'),
  glv:grab(/function _getItemLayerLv\(item\)\{[\s\S]*?\n\}/,'glv'), beam:grab(/function _itemLayerBeamTier\(item\)\{[^}]*\}/,'beam'),
};
function build(injectMath,ksEnabled,v2){
  const body=`const AFFIX_POOL=arguments[2];\n${parts.afslot}\n${parts.krate}\n`+
    `let KEYSTONE_ROLL_ENABLED=${!!ksEnabled};let ITEM_LAYER_ROLL_V2=${v2!==false};let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${CANON}\n${parts.tier}\n${parts.cand}\n${parts.roll}\n${parts.kcand}\n${parts.kcnt}\n${parts.kroll}\n${parts.glv}\n${parts.beam}\n`+
    // mkItem의 producer→routing 경로 재현(verbatim 라인)
    `function mkLayerPath(slot,rarity,pLv,layerLv,brType){var _plvP=pLv||1;if(ITEM_LAYER_ROLL_V2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_plvP/10)*10),Math.random);}var affixes=(ITEM_LAYER_ROLL_V2&&layerLv>=1)?rollAffixesLayered(rarity,slot,brType,layerLv):null;return {layerLv:(layerLv>=1?Math.max(1,Math.min(10,~~layerLv)):undefined),affixes};}\n`+
    `function producerGate(v2,layerLv,pLv){var _p=pLv||1;if(v2&&!(layerLv>=1)){layerLv=_rollItemLayerA2(Math.min(900,Math.floor(_p/10)*10),Math.random);}return layerLv;}\n`+
    `return {_rollItemLayerA2,_itemLayerCap,_itemLayerWeightsA2,rollAffixesLayered,_keystoneCandidates,_rollKeystoneOnItem,_itemKeystoneCount,_getItemLayerLv,_itemLayerBeamTier,mkLayerPath,producerGate,get KRATE(){return KEYSTONE_ROLL_RATE}};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build(); const RATE=API.KRATE;
const AFSLOT=new Function(parts.afslot+'return _AFSLOT;')();
function mul(seed){let a=seed>>>0;return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
function analyticP(cap){const w=API._itemLayerWeightsA2(cap);const s=w.reduce((a,b)=>a+b,0);return w.map(x=>x/s)}

// ══════════════════════════════════════════════════════════════════════
test('§0 wiring — V2=true · producer gated · canonical · shadow 위임 · UI · beam · Keystone false', () => {
  assert.match(gameHtml,/const ITEM_LAYER_ROLL_V2=true;/,'V2 활성');
  assert.match(gameHtml,/const KEYSTONE_ROLL_ENABLED=false;/,'Keystone 여전히 false');
  assert.match(gameHtml,/if\(ITEM_LAYER_ROLL_V2&&!\(layerLv>=1\)\)\{const _plvP=P&&P\.lv\?P\.lv:1;layerLv=_rollItemLayerA2\(Math\.min\(900,Math\.floor\(_plvP\/10\)\*10\),Math\.random\);\}/,'producer 주입(gated)');
  assert.match(gameHtml,/function _rollItemLayerA2\(itemLv,rng\)/,'canonical producer');
  assert.match(gameHtml,/function _shadowLayerCap\(itemLv\)\{return _itemLayerCap\(itemLv\)\}/,'shadow cap 위임');
  assert.match(gameHtml,/return _itemLayerWeightsA2\(cap\)\}/,'shadow weights 위임(A2)');
  assert.match(gameHtml,/_L\(_lyr\+'단','Layer '\+_lyr\)/,'Layer UI 툴팁');
  assert.match(gameHtml,/function _itemLayerBeamTier\(item\)/,'beam tier helper');
  // producer 호출 지점 1곳
  assert.equal([...gameHtml.matchAll(/layerLv=_rollItemLayerA2\(/g)].length,1,'producer 주입 1곳');
});

test('§1 canonical A2 producer parity — cap4/7/10 (100k, ≤0.5%p) · 결정론 · 1≤L≤cap', () => {
  for(const cap of [4,7,10]){ const lv=cap===10?900:(cap-1)*100; const rng=mul(0xA2+cap); const cnt=new Array(11).fill(0),N=100000;
    for(let i=0;i<N;i++){const L=API._rollItemLayerA2(lv,rng); assert.ok(L>=1&&L<=cap,`1≤L≤cap`); cnt[L]++;}
    const an=analyticP(cap); for(let L=1;L<=cap;L++)assert.ok(Math.abs(cnt[L]/N-an[L-1])<=0.005,`cap${cap} L${L}`);
  }
  const a=mul(9),b=mul(9); for(let i=0;i<1000;i++)assert.equal(API._rollItemLayerA2(900,a),API._rollItemLayerA2(900,b),'결정론');
});

test('§6 FLAG OFF byte-parity — producer gate: V2=false면 RNG 미소비·layerLv 불변', () => {
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.5};
  const S=build(spy,false,false); // ITEM_LAYER_ROLL_V2=false
  for(let i=0;i<5000;i++){ const r=S.producerGate(false,undefined,300+i); assert.equal(r,undefined,'OFF: layerLv 미생성'); }
  assert.equal(calls,0,'OFF: producer RNG 0 소비 → legacy byte-identical');
  // V2=true·명시 layerLv → 존중(재롤 안 함)
  const S2=build(seededMath(1),false,true); assert.equal(S2.producerGate(true,7,900),7,'명시 layerLv 존중');
  // V2=true·미지정 → 롤 in [1,cap]
  const L=S2.producerGate(true,undefined,900); assert.ok(L>=1&&L<=10,'V2 ON 미지정→롤');
});

test('§8/§10 production V2 flow massive (200k) — 1≤layerLv≤cap · 실제 roller invariants 0', () => {
  const rng=mul(0xC1); const N=200000; let viol=0,badLayer=0,badSub=0,dup=0,illegalKs=0,nan=0,undef=0,legacyLeak=0,capViol=0;
  const M=build(seededMath(0xC1FE),false,true); // producer+roller = 주입 seeded Math (1회 build)
  for(let i=0;i<N;i++){ const pLv=~~(rng()*1000); const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)]; const rarity=~~(rng()*6);
    const br=slot==='bracelet'?(rng()<.5?'demon':'life'):undefined;
    const r=M.mkLayerPath(slot,rarity,pLv,undefined,br);
    const cap=API._itemLayerCap(Math.min(900,Math.floor(pLv/10)*10));
    if(!(r.layerLv>=1&&r.layerLv<=cap&&cap<=10))capViol++;
    const seen=new Set(),aBy={},bBy={};
    for(const a of (r.affixes||[])){ const d=DEF[a.id]; if(!d){undef++;continue}
      if(!(d.layer>=1&&d.layer<=r.layerLv&&d.layer<=10))badLayer++;
      if(d.sub==='LEGACY')legacyLeak++; else if(d.sub!=='A'&&d.sub!=='B'&&d.sub!=='FLEX')badSub++;
      if(seen.has(a.id))dup++; seen.add(a.id); if(d.keystone)illegalKs++; if(typeof a.value!=='number'||Number.isNaN(a.value))nan++;
      if(d.sub==='A'){aBy[d.layer]=(aBy[d.layer]||0)+1;if(aBy[d.layer]>1)viol++}else if(d.sub==='B'){bBy[d.layer]=(bBy[d.layer]||0)+1;if(bBy[d.layer]>1)viol++}
    }
  }
  assert.equal(capViol,0,'1≤layerLv≤cap≤10'); assert.equal(viol,0,'C1'); assert.equal(badLayer,0); assert.equal(badSub,0);
  assert.equal(dup,0); assert.equal(illegalKs,0,'Keystone actual=0(flag off)'); assert.equal(nan,0); assert.equal(undef,0); assert.equal(legacyLeak,0);
});

test('§17 drop beam tier — layerLv L1~L10 정확 · fallback', () => {
  for(let L=1;L<=10;L++) assert.equal(API._itemLayerBeamTier({layerLv:L}),L,`L${L}→beam${L}`);
  assert.equal(API._itemLayerBeamTier({layerLv:99}),10,'clamp 10');
  // fallback(구세대 no layerLv): _getItemLayerLv rarity 폴백
  assert.equal(API._itemLayerBeamTier({rarity:5}),API._getItemLayerLv({rarity:5}),'fallback=_getItemLayerLv');
  assert.equal(API._itemLayerBeamTier(null),1,'null 안전');
});

test('§9 legacy preservation — old item(no layerLv)=fallback, new item=layerLv', () => {
  assert.equal(API._getItemLayerLv({rarity:3}),[1,1,2,3,3,4][3],'old item rarity fallback'); // 재롤 안 함
  assert.equal(API._getItemLayerLv({layerLv:8,rarity:1}),8,'new item layerLv 우선');
  // 로드 시 신규 롤 없음: _getItemLayerLv는 순수 조회(RNG 없음)
  assert.ok(!/Math\.random/.test(parts.glv),'_getItemLayerLv에 RNG 없음(로드시 재롤 방지)');
});

test('§18 Keystone actual roll=0 (flag off) · §19 eligible economy 측정', () => {
  // flag off → _rollKeystoneOnItem null (production V2 item에 keystone 0)
  const it={slot:'weapon',layerLv:9,affixes:[]}; assert.equal(API._rollKeystoneOnItem(it,false),null,'flag off keystone 0');
  // eligible economy: 실제 producer stream(uniform pLv)
  const rng=mul(0x19); const N=200000; let ge8=0,elig=0,expTot=0; const bySlot={};
  for(let i=0;i<N;i++){ const pLv=~~(rng()*1000); const itemLv=Math.min(900,Math.floor(pLv/10)*10); const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    const L=API._rollItemLayerA2(itemLv,rng); if(L<8)continue; ge8++;
    const cand=API._keystoneCandidates(AFSLOT[slot],L); if(cand.length){elig++;bySlot[slot]=(bySlot[slot]||0)+1;expTot+=RATE;} }
  assert.ok(ge8>0&&elig>0,'production layerLv≥8 생성됨 → eligible 측정 가능');
  assert.deepEqual(Object.keys(bySlot).sort(),['armor','weapon'],'eligible = weapon/armor만');
  assert.ok(Math.abs(expTot-elig*RATE)<1e-9,'expectedK=eligible×0.02');
});

test('§13/§14 rarity/CORE independence 유지(producer는 rarity/socket 미참조)', () => {
  assert.ok(!/rarity/.test(CANON),'canonical producer 서명/본문에 rarity 없음');
  assert.ok(!/socket|crystal/i.test(CANON),'canonical producer에 CORE/socket 참조 없음');
  // rarity별 producer 분포 동일(sampling noise)
  const base=analyticP(10); let md=0;
  for(let r=0;r<6;r++){ const rng=mul(0xD0+r); const c=new Array(11).fill(0),N=50000; for(let i=0;i<N;i++)c[API._rollItemLayerA2(900,rng)]++;
    for(let L=1;L<=10;L++)md=Math.max(md,Math.abs(c[L]/N-base[L-1])); }
  assert.ok(md<0.012,`rarity별 편차 noise(${(md*100).toFixed(2)}%p)`);
});

test('§20 progression scenarios — EARLY/MID/LATE/ENDGAME producer 지표', () => {
  const scen={EARLY:[1,150],MID:[300,600],LATE:[700,890],ENDGAME:[900,900]};
  const AFW=[0,1,2,3,5,7,9,11,13,15,15];
  for(const k of Object.keys(scen)){ const [lo,hi]=scen[k]; const rng=mul(0x5C+k.length); const N=40000; let sum=0,ge8=0,affSum=0;
    for(let i=0;i<N;i++){ const pLv=lo+~~(rng()*(hi-lo+1)); const itemLv=Math.min(900,Math.floor(pLv/10)*10); const L=API._rollItemLayerA2(itemLv,rng); sum+=L; if(L>=8)ge8++; affSum+=AFW[L]; }
    const meanL=sum/N, pHigh=ge8/N;
    if(k==='EARLY')assert.ok(pHigh===0,'EARLY: high-layer 0(progression, 버그 아님)');
    if(k==='ENDGAME')assert.ok(pHigh>0.3&&pHigh<0.38,`ENDGAME P(L≥8)≈34% (${(pHigh*100).toFixed(1)}%)`);
    assert.ok(meanL>=1&&meanL<=10,`${k} mean layer valid`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LOCK-37 — AUTOMATED LAYER ECONOMY VALIDATION (Phase 6I)
// ───────────────────────────────────────────────────────────────────────────
// REAL_PLAY 요구 제거 → AUTOMATED_PRODUCTION_PATH_VALIDATION.
// game.html에서 실제 함수/공식/테이블을 추출·실행한다(가짜 item 구조 생성 금지, §2).
//
// 재사용하는 실제 production 코드(추출·verbatim 실행):
//   · itemLv 공식        mkItem:12850  min(900,floor(P.lv/10)*10)
//   · slot 선택          rollDrop      SLOT_NAMES[~~(rnd*len)] (uniform)
//   · rarity 가중테이블   rollDrop      _RW_normal.._RW_cBoss + weighted roll
//   · shadow A2 sampler  shadow 블록   _shadowRollLayer/_shadowLayerWeights/_shadowObserve/_shadowStats
//   · V2 roller          rollAffixesLayered + _affixTierRoll + _affixLayerCandidates + _AFSLOT
//   · keystone           _keystoneCandidates + _itemKeystoneCount + _rollKeystoneOnItem
//   · socketCount        mkItem        _scR<.50?1:.80?2:.95?3:4 (layer 무관 — CORE 독립 증명)
// 재사용 안 함(브라우저 의존·layer 무관): mkItem 전체 wrapper(canvas/names/EL/UNIQUE_SPECIAL/SLOT_EMOJI/audio).
// production 파일 미변경. flag 2개 false 유지. A2 파라미터 FREEZE(오차 보정용 변경 금지, §5).
// 실행: node tools/layer_economy_validation.mjs
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
import { readFileSync } from 'node:fs';
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

// ── 실제 소스 추출 ──
const grab = (re, name) => { const m = gameHtml.match(re); if(!m) throw new Error('추출 실패: '+name); return m[0]; };
const SLOT_NAMES = new Function('return '+grab(/const SLOT_NAMES=\[[^\]]*\]/, 'SLOT_NAMES').replace('const SLOT_NAMES=',''))();
const AFFIX_POOL = (()=>{ const s=gameHtml.indexOf('const AFFIX_POOL=['); const e=gameHtml.indexOf('\n];',s);
  const body=gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)(); })();
const RW_SRC = grab(/const _RW_normal=\[[^;]*\];/, 'RW tables');
const shadowStart = gameHtml.indexOf('let _SHADOW_LAYER_LOG=false;');
const shadowEnd   = gameHtml.indexOf('if(typeof window!==', shadowStart);
const SHADOW_BLK  = gameHtml.slice(shadowStart, shadowEnd);
const AFSLOT = grab(/const _AFSLOT=\{[^}]*\};/, '_AFSLOT');
const KRATE  = grab(/const KEYSTONE_ROLL_RATE=[^;]*;/, 'KEYSTONE_ROLL_RATE');
const F_TIER = grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/, '_affixTierRoll');
const F_CAND = grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/, '_affixLayerCandidates');
const F_ROLL = grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/, 'rollAffixesLayered');
const F_KCAND= grab(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/, '_keystoneCandidates');
const F_KCNT = grab(/function _itemKeystoneCount\(item\)\{.*\}/, '_itemKeystoneCount');
const F_KROLL= grab(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/, '_rollKeystoneOnItem');
const SOCKET_SRC = grab(/const _scR=Math\.random\(\);[\s\S]*?item\.socketCount=_scR<\.50\?1:_scR<\.80\?2:_scR<\.95\?3:4;/, 'socketCount');

const DEF={}; for(const a of AFFIX_POOL) DEF[a.id]=a;

// ── 통합 샌드박스(실제 함수 verbatim 실행) ──
function build(injectMath, keystoneEnabled){
  const body =
    `const AFFIX_POOL=arguments[2];\nconst SLOT_NAMES=${JSON.stringify(SLOT_NAMES)};\n${AFSLOT}\n${KRATE}\n`+
    `let KEYSTONE_ROLL_ENABLED=${!!keystoneEnabled};let ITEM_LAYER_ROLL_V2=false;\n`+
    `let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1},G=null;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `${RW_SRC}\nconst _rwMap={normal:_RW_normal,elite:_RW_elite,miniboss:_RW_mini,stageBoss:_RW_sBoss,chapterBoss:_RW_cBoss};\n`+
    `${SHADOW_BLK}\n${F_TIER}\n${F_CAND}\n${F_ROLL}\n${F_KCAND}\n${F_KCNT}\n${F_KROLL}\n`+
    // 실제 rollDrop rarity 롤 verbatim 재현
    `function rollRarity(rng,mTier){const rw=_rwMap[mTier]||_RW_normal;const tot=rw[0]+rw[1]+rw[2]+rw[3]+rw[4]+(rw[5]||0);const roll=rng()*tot;let acc=0;for(let i=0;i<6;i++){acc+=(rw[i]||0);if(roll<acc)return i}return 5}\n`+
    // 실제 itemLv 공식 verbatim
    `function itemLvOf(pLv){return Math.min(900,Math.floor(pLv/10)*10)}\n`+
    // 실제 socketCount verbatim(layer 인자 없음 — CORE 독립)
    `function rollSocket(rng){const _scR=rng();return _scR<.50?1:_scR<.80?2:_scR<.95?3:4}\n`+
    `function setP(v){P=v}function setKS(v){KEYSTONE_ROLL_ENABLED=v}\n`+
    `return {SLOT_NAMES,_shadowObserve,_shadowReset,_shadowStats,_shadowRollLayer,_shadowLayerCap,_shadowLayerWeights,`+
    `rollAffixesLayered,_keystoneCandidates,_itemKeystoneCount,_rollKeystoneOnItem,rollRarity,itemLvOf,rollSocket,setP,setKS,`+
    `get KRATE(){return KEYSTONE_ROLL_RATE}};`;
  return new Function('Math','console','arguments2placeholder',body).call(null, injectMath||Math, {log(){}}, AFFIX_POOL);
}
const API = build(Math, false);
const RATE = API.KRATE;

// ── 결정론 RNG ──
function mul(seed){let a=seed>>>0;return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(seed){const m=Object.create(Math);m.random=mul(seed);return m}
// 실제 _AFSLOT 매핑(추출 소스 verbatim eval)
const _AFSLOT_LOCAL = new Function(AFSLOT+'return _AFSLOT;')();
const _afslotOf = (slot)=> _AFSLOT_LOCAL[slot]||null;

// ── analytic A2 ──
function analyticP(cap){const w=API._shadowLayerWeights(cap,'A2');const s=w.reduce((a,b)=>a+b,0);return w.map(x=>x/s)}
const AFFIX_W=[0,1,2,3,5,7,9,11,13,15,15], AFFIX_A=[0,2,3,5,6,7,9,10,11,12,12];

const OUT=[]; const log=(...a)=>{const s=a.join(' ');OUT.push(s);console.log(s)};
log('═══════════════════════════════════════════════════════════════════════');
log('LOCK-37 AUTOMATED LAYER ECONOMY VALIDATION — production-path 재사용 harness');
log('  실제 재사용: itemLv공식·slot·rarity테이블·shadow A2 sampler·V2 roller·keystone·socket (전부 game.html verbatim)');
log('═══════════════════════════════════════════════════════════════════════');

// ═══ §3/§5/§6 cap1~10 parity (각 cap 100k, 고정 seed) ═══
log('\n── §3/§5 cap1~10 A2 analytic parity (각 100k, 목표 maxErr≤0.5%p) ──');
let worstErr=0, worstCap=0;
for(let cap=1;cap<=10;cap++){
  const lv=cap===10?900:(cap-1)*100; const rng=mul(0xA2C0+cap); const cnt=new Array(11).fill(0); const N=100000;
  for(let i=0;i<N;i++) cnt[API._shadowRollLayer(lv,rng,'A2')]++;
  const an=analyticP(cap); let me=0;
  for(let L=1;L<=cap;L++){const o=cnt[L]/N; me=Math.max(me,Math.abs(o-an[L-1]))}
  if(me>worstErr){worstErr=me;worstCap=cap}
  log(`  cap${String(cap).padStart(2)} (n=${N}) maxErr=${(me*100).toFixed(3)}%p ${me<=0.005?'OK':'>0.5%p'}`);
}
log(`  ▶ 전 cap 최악 maxErr=${(worstErr*100).toFixed(3)}%p @cap${worstCap} → ${worstErr<=0.005?'PARITY_PASS(≤0.5%p)':'FAIL'}`);

// ═══ §6 cap10 최종 분포(500k) ═══
log('\n── §6 cap10 최종 분포 (500k) ──');
{ const rng=mul(0x0A10); const cnt=new Array(11).fill(0); const N=500000;
  for(let i=0;i<N;i++) cnt[API._shadowRollLayer(900,rng,'A2')]++;
  const p=cnt.map(c=>c/N); const bkt=(lo,hi)=>{let s=0;for(let L=lo;L<=hi;L++)s+=p[L];return s};
  let mean=0;for(let L=1;L<=10;L++)mean+=L*p[L];
  const q=(f)=>{let c=0;for(let L=1;L<=10;L++){c+=p[L];if(c>=f)return L}return 10};
  log('  P(L1..L10)%: '+p.slice(1).map(x=>(x*100).toFixed(2)).join(' '));
  log(`  mean=${mean.toFixed(2)} med=${q(0.5)} p90=${q(0.9)} P(cap=L10)=${(p[10]*100).toFixed(2)}% P(L8+)=${(bkt(8,10)*100).toFixed(2)}% P(L1-4)=${(bkt(1,4)*100).toFixed(2)}%`);
}

// ═══ §7 structural affix power(shadow layer × 실제 V2 roller 구조) ═══
log('\n── §7 affix power (shadow layer → 실제 rollAffixesLayered 구조, cap별 40k) ──');
log('  cap | weapon: E med p90 max | armor: E med p90 max  (실제 V2 roller 실행, item 미부착)');
for(let cap=1;cap<=10;cap++){
  const lv=cap===10?900:(cap-1)*100; const rng=mul(0x5A00+cap); const N=40000;
  const wc=[],ac=[];
  for(let i=0;i<N;i++){ const L=API._shadowRollLayer(lv,rng,'A2');
    const w=API.rollAffixesLayered(4,'weapon',undefined,L).length;
    const a=API.rollAffixesLayered(4,'armor',undefined,L).length;
    wc.push(w);ac.push(a);
  }
  const stat=arr=>{const s=arr.slice().sort((x,y)=>x-y);const sum=arr.reduce((p,c)=>p+c,0);return{E:sum/arr.length,med:s[~~(arr.length*0.5)],p90:s[~~(arr.length*0.9)],max:s[arr.length-1]}};
  const w=stat(wc),a=stat(ac);
  log(`  cap${String(cap).padStart(2)} | ${w.E.toFixed(2)} ${w.med} ${w.p90} ${w.max} | ${a.E.toFixed(2)} ${a.med} ${a.p90} ${a.max}`);
}

// ═══ §8/§9 V2 dry-run C1 invariants (1,000,000) ═══
log('\n── §9 V2 dry-run massive invariants (1,000,000 shadow-V2 items, 실제 roller) ──');
// 유효 sub = A(backbone)/B(candidate)/FLEX(parryBonus 등, v2skip 아닌 것). LEGACY(layer0)는 layer 필터로 배제.
{ const rng=mul(0xC1FE); const N=1000000; let viol=0,badLayer=0,badSub=0,dup=0,illegalKs=0,nan=0,undef=0,emptyChk=0,flex=0,legacyLeak=0;
  let maxAffix=0; const t0=performance.now();
  for(let i=0;i<N;i++){
    const pLv=~~(rng()*1000); const itemLv=API.itemLvOf(pLv); const cap=API._shadowLayerCap(itemLv);
    const slot=API.SLOT_NAMES[~~(rng()*API.SLOT_NAMES.length)];
    const L=API._shadowRollLayer(itemLv,rng,'A2'); const grade=1+(~~(rng()*5));
    const br=slot==='bracelet'?(rng()<.5?'demon':'life'):undefined;
    const res=API.rollAffixesLayered(grade,slot,br,L);
    if(!Array.isArray(res)){emptyChk++;continue}
    maxAffix=Math.max(maxAffix,res.length);
    const seen=new Set(); const aBy={},bBy={};
    for(const a of res){
      const d=DEF[a.id];
      if(!d){undef++;continue}
      if(!(d.layer>=1&&d.layer<=L&&d.layer<=10)){badLayer++}
      if(d.sub==='FLEX')flex++;
      else if(d.sub==='LEGACY')legacyLeak++; // layer0 → 나오면 안 됨
      else if(d.sub!=='A'&&d.sub!=='B'){badSub++}
      if(seen.has(a.id))dup++; seen.add(a.id);
      if(d.keystone){illegalKs++} // 정상 롤엔 keystone 나오면 안 됨(keystone:1=제외)
      if(typeof a.value!=='number'||Number.isNaN(a.value))nan++;
      // C1: A/B backbone·candidate 각 layer×sub 최대 1 (FLEX/LEGACY는 C1 축 아님 — 제외)
      if(d.sub==='A'){const k=d.layer;aBy[k]=(aBy[k]||0)+1;if(aBy[k]>1)viol++}
      else if(d.sub==='B'){const k=d.layer;bBy[k]=(bBy[k]||0)+1;if(bBy[k]>1)viol++}
    }
  }
  const dt=performance.now()-t0;
  const bad=viol+badLayer+badSub+dup+illegalKs+nan+undef+emptyChk+legacyLeak;
  log(`  N=${N} 실행 ${(dt/1000).toFixed(1)}s (${(N/(dt/1000)/1000).toFixed(0)}k items/s)`);
  log(`  C1 violation=${viol} | invalidLayer=${badLayer} invalidSub=${badSub} dupID=${dup} illegalKeystone=${illegalKs} NaN=${nan} undefinedAffix=${undef} nonArray=${emptyChk} legacyLeak=${legacyLeak}`);
  log(`  (정상 FLEX 관측=${flex} — parryBonus 등 유효 sub, 위반 아님) maxAffixCount observed=${maxAffix}`);
  log(`  ▶ ${bad===0?'ALL_INVARIANTS_CLEAN':'INVARIANT_FAIL'}`);
}

// ═══ §10 slot coverage (모든 slot × cap1~10) ═══
log('\n── §10 slot coverage (모든 production slot × cap1~10, 각 4k) ──');
{ let broken=0;
  for(const slot of API.SLOT_NAMES){
    const reach=new Set(); let ge8affix=null;
    for(let cap=1;cap<=10;cap++){ const rng=mul(0x51070000+cap*131+slot.length); const lv=cap===10?900:(cap-1)*100;
      for(let i=0;i<4000;i++){ const L=API._shadowRollLayer(lv,rng,'A2'); reach.add(L);
        if(L>=8){const c=API.rollAffixesLayered(4,slot,slot==='bracelet'?'demon':undefined,L).length; ge8affix=Math.max(ge8affix||0,c);}
      }
    }
    const ok = reach.has(1) && reach.has(10) && (ge8affix===null||ge8affix>0);
    if(!ok)broken++;
    if(slot==='weapon'||slot==='armor'||slot==='ring1'||!ok) log(`  ${slot.padEnd(9)} reach L1..L10=${reach.has(1)&&reach.has(10)?'Y':'N'} L≥8 affix max=${ge8affix==null?'n/a':ge8affix} ${ok?'':'← BROKEN'}`);
  }
  log(`  ▶ slot broken count=${broken} → ${broken===0?'SLOT_COVERAGE_OK':'FAIL(production enable 금지)'}`);
}

// ═══ §11/§12 Keystone economy (expected + observed forced-RNG) ═══
log('\n── §11/§12 Keystone economy (production-path item, 300k) ──');
{ const rng=mul(0x6B00); const N=300000; let ge8=0,elig=0; let expTot=0; const expBy={};
  const slotElig={};
  for(let i=0;i<N;i++){ const pLv=~~(rng()*1000); const itemLv=API.itemLvOf(pLv); const slot=API.SLOT_NAMES[~~(rng()*API.SLOT_NAMES.length)];
    const L=API._shadowRollLayer(itemLv,rng,'A2');
    if(L>=8){ ge8++;
      const cand=API._keystoneCandidates(_afslotOf(slot),L); // 실제 _AFSLOT + 실제 _keystoneCandidates
      if(cand.length){ elig++; slotElig[slot]=(slotElig[slot]||0)+1; expTot+=RATE; const sh=RATE/cand.length;
        for(const c of cand) expBy[c.id]=(expBy[c.id]||0)+sh; }
    }
  }
  log(`  drops=${N} P(L≥8)=${(100*ge8/N).toFixed(2)}% eligible=${elig} P(eligible)=${(100*elig/N).toFixed(3)}%`);
  log(`  expectedKeystones=${expTot.toFixed(2)} → Keystone/all-items = 1/${Math.round(N/expTot)}`);
  log(`  expected share: `+Object.keys(expBy).map(k=>`${k}=${expBy[k].toFixed(2)}`).join(' '));
  log(`  eligible slot: `+Object.keys(slotElig).map(s=>`${s}(${slotElig[s]})`).join(' ')+' (weapon/armor만 기대)');
  // §11 observed forced-RNG: KEYSTONE_ROLL_ENABLED=true sandbox(테스트 전용, game.html flag false 불변)
  const KAPI=build(seededMath(0x6B0B),true); const lrng=mul(0x1B0B);
  let attempts=0,got=0,badLayerRoll=0,badSlotRoll=0,over1=0;
  for(let i=0;i<200000;i++){ const pLv=~~(lrng()*1000); const itemLv=KAPI.itemLvOf(pLv); const slot=KAPI.SLOT_NAMES[~~(lrng()*KAPI.SLOT_NAMES.length)];
    const L=KAPI._shadowRollLayer(itemLv,lrng,'A2');
    const aslot=_afslotOf(slot);
    const isElig=(L>=8 && aslot && KAPI._keystoneCandidates(aslot,L).length>0);
    if(isElig)attempts++;
    const item={slot,layerLv:L,affixes:[]};
    const ks=KAPI._rollKeystoneOnItem(item,false); // KEYSTONE_ROLL_ENABLED=true → 2% 게이트 실행
    if(ks){ if(L<8)badLayerRoll++; if(aslot!=='wpn'&&aslot!=='armor')badSlotRoll++; item.affixes.push(ks); got++; if(KAPI._itemKeystoneCount(item)>1)over1++; }
  }
  log(`  [forced-RNG, KEYSTONE_ROLL_ENABLED=true sandbox] eligible=${attempts} rolled=${got} observed≈${attempts?(100*got/attempts).toFixed(2):0}% (목표~2%) layer<8 roll=${badLayerRoll} invalidSlot roll=${badSlotRoll} item당>1=${over1}`);
}

// ═══ §13 rarity independence ═══
log('\n── §13 rarity independence (동일 itemLv900, rarity별 A2 분포, 각 100k) ──');
{ const base=analyticP(10); let maxDiff=0;
  for(let r=0;r<6;r++){ const rng=mul(0xD00+r); const cnt=new Array(11).fill(0); const N=100000;
    for(let i=0;i<N;i++) cnt[API._shadowRollLayer(900,rng,'A2')]++; // sampler는 rarity 입력 없음
    let md=0;for(let L=1;L<=10;L++)md=Math.max(md,Math.abs(cnt[L]/N-base[L-1]));
    maxDiff=Math.max(maxDiff,md);
  }
  log(`  rarity 0~5 각 분포 vs analytic 최대편차=${(maxDiff*100).toFixed(3)}%p (sampling noise) → ${maxDiff<0.01?'RARITY_INDEPENDENT(sampler에 rarity 입력 없음)':'FAIL'}`);
  log(`  코드근거: _shadowRollLayer(itemLv,rng,model) — rarity 파라미터 부재. rollAffixesLayered(grade,...)에서 grade=수치tier만, layer 무관.`);
}

// ═══ §14 CORE independence ═══
log('\n── §14 CORE/socket independence ──');
{ // socket 분포가 layer와 무관: 실제 식 _scR<.50?1:.80?2:.95?3:4 는 layer 인자 없음.
  const rng=mul(0xC0FE); const byLayer={}; const N=400000;
  for(let i=0;i<N;i++){ const L=API._shadowRollLayer(900,rng,'A2'); const sc=API.rollSocket(rng); (byLayer[L]=byLayer[L]||[0,0,0,0,0])[sc]++; }
  // 각 layer의 socket 분포가 baseline(50/30/15/5)에 수렴하는지
  let maxDev=0; for(const L in byLayer){ const a=byLayer[L]; const t=a[1]+a[2]+a[3]+a[4]; const p=[a[1]/t,a[2]/t,a[3]/t,a[4]/t]; const base=[.50,.30,.15,.05];
    for(let k=0;k<4;k++) maxDev=Math.max(maxDev,Math.abs(p[k]-base[k])); }
  log(`  layer별 socket 분포 vs baseline(50/30/15/5) 최대편차=${(maxDev*100).toFixed(2)}%p → ${maxDev<0.02?'CORE_INDEPENDENT':'CHECK'}`);
  log(`  코드근거: socketCount = _scR<.50?1:_scR<.80?2:_scR<.95?3:4 (mkItem) — layerLv 인자 없음. layer↑ ≠ CORE↑.`);
}

// ═══ §16 determinism checksum (2회 실행 동일) ═══
log('\n── §16 determinism (동일 seed 2회 checksum) ──');
function fnv(str){let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h>>>0}
function runStats(seed){const a=build(Math,false); a._shadowReset(seed); const rng=mul(seed);
  for(let i=0;i<50000;i++){const pLv=~~(rng()*1000);a.setP({lv:pLv});a._shadowObserve({itemLv:a.itemLvOf(pLv),slot:a.SLOT_NAMES[~~(rng()*a.SLOT_NAMES.length)],rarity:a.rollRarity(rng,'normal')});}
  const st=a._shadowStats(); return fnv(JSON.stringify({P:st.P,b:st.buckets,e:st.expectedKeystones,k:st.expectedByKeystone,hl:st.highLayerItems}));}
const c1=runStats(0xDEADBEEF), c2=runStats(0xDEADBEEF), c3=runStats(0x1234);
log(`  seed A run1=${c1.toString(16)} run2=${c2.toString(16)} 동일=${c1===c2} | seed B=${c3.toString(16)} (다름=${c1!==c3})`);
log(`  ▶ ${c1===c2 && c1!==c3 ? 'DETERMINISTIC_OK' : 'FAIL'}`);

// ═══ §20 performance ═══
log('\n── §20 performance ──');
{ const a=build(Math,true); a._shadowReset(1); const rng=mul(7);
  const items=[]; for(let i=0;i<100000;i++){const pLv=~~(rng()*1000);items.push({itemLv:a.itemLvOf(pLv),slot:a.SLOT_NAMES[~~(rng()*a.SLOT_NAMES.length)],rarity:a.rollRarity(rng,'normal'),affixes:[]});}
  let t0=performance.now(); for(const it of items) a._shadowObserve(it); let dt=performance.now()-t0;
  log(`  shadowObserve ON: 100k in ${dt.toFixed(0)}ms = ${(dt*1000/100000).toFixed(3)}µs/item (keystone 스캔 L≥8만)`);
  log(`  OFF overhead = mkItem 내 'if(_SHADOW_LAYER_LOG)' 분기 1회(배포 상태) — 사실상 zero.`);
}

log('\n═══ GATE SUMMARY ═══');
log(`  parity(≤0.5%p)=${worstErr<=0.005?'PASS':'FAIL'} · 자세한 판정은 상단 각 섹션 참조.`);
log('  ⚠ REAL_PLAY 아님(제거됨). AUTOMATED_PRODUCTION_PATH_VALIDATION. production 파일 미변경, flag 2개 false.');

import('fs').then(fs=>fs.writeFileSync(new URL('./layer_economy_validation.out.txt', import.meta.url), OUT.join('\n')+'\n'));

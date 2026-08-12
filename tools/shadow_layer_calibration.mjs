// ═══════════════════════════════════════════════════════════════════════════
// LOCK-34 — MODEL A LAYER DISTRIBUTION CALIBRATION (Phase 6F, SHADOW-ONLY)
// ───────────────────────────────────────────────────────────────────────────
// 순수 shadow simulation. game.html / production RNG / drop / save 를 절대
// 건드리지 않는다. 독립 seeded RNG(mulberry32). production 확률 LOCK 아님 —
// 분포 shape 후보(A1/A2/A3)를 search-bound로 거르기 위한 calibration 도구.
//
// 실행: node tools/shadow_layer_calibration.mjs
// 동일 seed 반복 → 동일 결과(결정론) 검증 포함.
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ─── 독립 seeded RNG (production Math.random 미소비) ───
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 0x6F6C; // 고정 seed
const DRAWS = 100000; // cap당 최소 100k

// ─── §1 layerCap formula (audit candidate) ───
// itemLv = min(900, floor(P.lv/10)*10) → {0,10,...,900}
function layerCap(itemLv){ return Math.max(1, Math.min(10, 1 + Math.floor(itemLv / 100))); }

// ─── §8 structural affix-count profile (LOCK-33 §7, N에 의해 결정론적) ───
const AFFIX_WEAPON = {1:1,2:2,3:3,4:5,5:7,6:9,7:11,8:13,9:15,10:15};
const AFFIX_ARMOR  = {1:2,2:3,3:5,4:6,5:7,6:9,7:10,8:11,9:12,10:12};

// ─── 3개 분포 shape (weight function over L=1..cap) ───
// 전부: L>cap=0, w(1)>0(L1 reachable), w(cap)>0(cap reachable), deterministic.
function weightsA1(cap){ // HIGH-BIASED: cap 인접 비중 높음(기하 상승)
  const r = 1.35, w = [];
  for(let L=1; L<=cap; L++) w.push(Math.pow(r, L-1));
  return w;
}
function weightsA2(cap){ // MID-BIASED: mode=cap-3, cap=jackpot damp, 저층 floor
  const mode = Math.max(1, cap-3), sigma = 1.6, kappa = 0.6, floor = 0.15, w = [];
  for(let L=1; L<=cap; L++){
    let g = Math.exp(-((L-mode)*(L-mode))/(2*sigma*sigma));
    if(L===cap && cap>1) g *= kappa;      // 최고단 jackpot 감쇠
    w.push(g + floor);                     // 저층 floor 보장
  }
  return w;
}
function weightsA3(cap){ // BROAD: L1~cap 넓게, 상위 완만 상승(선형)
  const alpha = 0.35, w = [];
  for(let L=1; L<=cap; L++) w.push(1 + alpha*(L-1));
  return w;
}
const MODELS = { A1: weightsA1, A2: weightsA2, A3: weightsA3 };

// ─── shadow 순수함수 ───
function _shadowLayerCap(itemLv){ return layerCap(itemLv); }
function _shadowRollLayer(itemLv, rng, model){
  const cap = _shadowLayerCap(itemLv);
  const w = MODELS[model](cap);
  const sum = w.reduce((a,b)=>a+b, 0);
  let x = rng() * sum;
  for(let L=1; L<=cap; L++){ x -= w[L-1]; if(x < 0) return L; }
  return cap;
}

// ─── 분석적(정규화 weight) 확률 — MC와 대조용 ───
function analyticP(cap, model){
  const w = MODELS[model](cap);
  const sum = w.reduce((a,b)=>a+b, 0);
  return w.map(x => x/sum); // idx0 = L1
}

// ─── 지표 계산 ───
function entropy(p){ let h=0; for(const q of p){ if(q>0) h -= q*Math.log2(q); } return h; }
function quantileLayer(p, q){ // p: array idx0=L1. 반환: 층(1-based)
  let c=0; for(let i=0;i<p.length;i++){ c+=p[i]; if(c>=q-1e-12) return i+1; } return p.length;
}
function meanLayer(p){ let m=0; for(let i=0;i<p.length;i++) m += (i+1)*p[i]; return m; }
function bucket(p, lo, hi){ let s=0; for(let L=lo; L<=hi && L<=p.length; L++) s += p[L-1]; return s; }

// ─── §7 cap 1~10 simulation (MC 100k + analytic 대조) ───
function simulateCap(cap, model){
  const itemLv = cap===10 ? 900 : (cap-1)*100; // 대표 itemLv (cap 밴드 하단)
  const rng = mulberry32(SEED ^ (cap*2654435761) ^ (model.charCodeAt(1)*40503));
  const counts = new Array(cap).fill(0);
  for(let i=0;i<DRAWS;i++){ counts[_shadowRollLayer(itemLv, rng, model)-1]++; }
  const mc = counts.map(c => c/DRAWS);
  const an = analyticP(cap, model);
  const maxErr = Math.max(...mc.map((v,i)=>Math.abs(v-an[i])));
  return { cap, itemLv, mc, an, maxErr };
}

// ─── 어픽스 파워 프로파일 ───
function affixProfile(cap, model, tbl){
  const p = analyticP(cap, model);
  // 어픽스 개수 분포 = 층 분포를 count 테이블로 매핑(§7: count는 층에 의해 결정론적)
  const expected = (()=>{ let e=0; for(let L=1;L<=cap;L++) e += tbl[L]*p[L-1]; return e; })();
  const p50L = quantileLayer(p, 0.5), p90L = quantileLayer(p, 0.9);
  return {
    expectedAffix: expected,
    p50Affix: tbl[p50L], p90Affix: tbl[p90L],
    maxAffix: tbl[cap], // cap reachable = 최고 affix 수
  };
}

// ─── 실행 ───
const OUT = [];
function log(...a){ OUT.push(a.join(' ')); console.log(...a); }

log('═══ LOCK-34 SHADOW LAYER CALIBRATION ═══');
log(`seed=0x${SEED.toString(16)} draws/cap=${DRAWS}`);
log('');

// [검증 1] layerCap formula vs itemLv 구조
log('── §1 layerCap formula 검증 (itemLv=min(900,floor(lv/10)*10)) ──');
const bands = [[0,90],[100,190],[200,290],[300,390],[400,490],[500,590],[600,690],[700,790],[800,890],[900,900]];
let capOk = true;
for(let k=0;k<bands.length;k++){
  const [lo,hi]=bands[k]; const expect=k+1;
  const gotLo=layerCap(lo), gotHi=layerCap(hi);
  const ok = gotLo===expect && gotHi===expect;
  if(!ok) capOk=false;
  log(`  itemLv ${String(lo).padStart(3)}~${String(hi).padStart(3)} → cap ${gotLo}${gotLo!==gotHi?'~'+gotHi:''}  (expect ${expect}) ${ok?'OK':'CONFLICT'}`);
}
log(`  ▶ cap10 = itemLv 900 유일(캡 900). formula ${capOk?'무충돌 CONFIRMED':'CONFLICT!'}`);
log('');

// [검증 2] 결정론 — 동일 seed 반복 동일
const r1 = simulateCap(10,'A2').mc, r2 = simulateCap(10,'A2').mc;
const deterministic = r1.every((v,i)=>v===r2[i]);
log(`── 결정론 검증: 동일 seed 반복 결과 동일 = ${deterministic?'PASS':'FAIL'} ──`);
log('');

// [§7] cap 1~10 simulation — 각 모델
for(const model of ['A1','A2','A3']){
  log(`════════ MODEL ${model} ════════`);
  log('cap itemLv | L1..L10 분포(%) | mean med p90 P(cap) P(cap-1+) P(L1-4) entropy | MC오차');
  for(let cap=1; cap<=10; cap++){
    const s = simulateCap(cap, model);
    const p = s.an; // analytic(정확) 사용, MC는 대조
    const dist = [];
    for(let L=1;L<=10;L++) dist.push(L<=cap ? (p[L-1]*100).toFixed(1) : '  . ');
    const m = meanLayer(p), med = quantileLayer(p,0.5), p90 = quantileLayer(p,0.9);
    const pcap = p[cap-1], pcapm1 = bucket(p, Math.max(1,cap-1), cap), plow = bucket(p,1,4), h = entropy(p);
    log(`${String(cap).padStart(2)}  ${String(s.itemLv).padStart(4)}  | ${dist.join(' ')} | `+
        `${m.toFixed(2)} ${med} ${p90} ${(pcap*100).toFixed(1)}% ${(pcapm1*100).toFixed(1)}% ${(plow*100).toFixed(1)}% ${h.toFixed(2)}b | ${(s.maxErr*100).toFixed(2)}%`);
  }
  log('');
}

// [§6] cap=10 search-bound 판정
log('── §6 cap=10 search-bound 판정 (L10:1~8% / L8-10:15~35% / L1-4:≥15%) ──');
for(const model of ['A1','A2','A3']){
  const p = analyticP(10, model);
  const pL10 = p[9]*100, pL8_10 = bucket(p,8,10)*100, pL1_4 = bucket(p,1,4)*100;
  const ok10 = pL10>=1 && pL10<=8, ok8 = pL8_10>=15 && pL8_10<=35, okLow = pL1_4>=15;
  log(`  ${model}: L10=${pL10.toFixed(1)}%${ok10?'✓':'✗'}  L8-10=${pL8_10.toFixed(1)}%${ok8?'✓':'✗'}  L1-4=${pL1_4.toFixed(1)}%${okLow?'✓':'✗'}  → ${(ok10&&ok8&&okLow)?'PASS':'FAIL'}`);
}
log('');

// [§8] structural affix power curve — cap별
for(const model of ['A1','A2','A3']){
  log(`── §8 affix power (${model}) — cap | E[wpn] p50 p90 max / E[armor] p50 p90 max ──`);
  for(let cap=1; cap<=10; cap++){
    const w = affixProfile(cap, model, AFFIX_WEAPON);
    const a = affixProfile(cap, model, AFFIX_ARMOR);
    log(`  cap${String(cap).padStart(2)}: wpn E=${w.expectedAffix.toFixed(2)} p50=${w.p50Affix} p90=${w.p90Affix} max=${w.maxAffix} | armor E=${a.expectedAffix.toFixed(2)} p50=${a.p50Affix} p90=${a.p90Affix} max=${a.maxAffix}`);
  }
  log('');
}

// [§9] unlock-boundary smoothness (cap k→k+1)
for(const model of ['A1','A2','A3']){
  log(`── §9 boundary smoothness (${model}) — cap→cap+1 | Δmean-layer Δmean-wpn-affix Δp90-wpn ──`);
  for(let cap=1; cap<10; cap++){
    const p0 = analyticP(cap,model), p1 = analyticP(cap+1,model);
    const m0 = meanLayer(p0), m1 = meanLayer(p1);
    const w0 = affixProfile(cap,model,AFFIX_WEAPON), w1 = affixProfile(cap+1,model,AFFIX_WEAPON);
    log(`  L${cap}→L${cap+1} (itemLv ${cap*100-10}→${cap*100}): Δmean=${(m1-m0).toFixed(2)} ΔwpnE=${(w1.expectedAffix-w0.expectedAffix).toFixed(2)} Δwpn-p90=${w1.p90Affix-w0.p90Affix}`);
  }
  log('');
}

// [§10/§11] cap=10 3-bucket 저단 잔존 + [§16] Keystone per-item
log('── §10/§11 cap=10 3-bucket 잔존 + §16 Keystone per-item ──');
log('   Keystone/item = P(L≥8|cap10) × P(eligible slot=2/15) × 0.02');
for(const model of ['A1','A2','A3']){
  const p = analyticP(10, model);
  const b1 = bucket(p,1,4)*100, b2 = bucket(p,5,7)*100, b3 = bucket(p,8,10)*100;
  const pGE8 = bucket(p,8,10);
  const ksPerItem = pGE8 * (2/15) * 0.02;
  const N = ksPerItem>0 ? Math.round(1/ksPerItem) : Infinity;
  log(`  ${model}: L1-4=${b1.toFixed(1)}% L5-7=${b2.toFixed(1)}% L8-10=${b3.toFixed(1)}% (all>0=${b1>0&&b2>0&&b3>0}) | P(L≥8)=${(pGE8*100).toFixed(1)}% → Keystone 1/${N} items(cap10)`);
}
log('');
log('   주: cap<8(itemLv<700) 아이템은 P(L≥8)=0 → Keystone 불가. 시간단위 변환은 kill/drop rate 없어 미산출(날조 금지).');

// 파일로도 저장
import('fs').then(fs=>{
  fs.writeFileSync(new URL('./shadow_layer_calibration.out.txt', import.meta.url), OUT.join('\n')+'\n');
});

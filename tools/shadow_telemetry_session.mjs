// ═══════════════════════════════════════════════════════════════════════════
// LOCK-36 — SHADOW TELEMETRY SESSION HARNESS (Phase 6H)
// ───────────────────────────────────────────────────────────────────────────
// ⚠ SIMULATED — NOT REAL_PLAY. 실제 브라우저 플레이 세션이 아니라 game.html의
//   itemLv/slot 생성 공식을 코드-정확하게 재현한 자동 스트림이다(§7 라벨링 준수).
//   game.html의 shadow telemetry 블록을 그대로 추출·실행해 필드 정합/cap-parity/
//   경제 지표를 검증한다. production/RNG/drop 미변경(별도 프로세스, game.html 미접촉).
//
// 실행: node tools/shadow_telemetry_session.mjs
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const SLOT_NAMES = new Function('return '+gameHtml.match(/const SLOT_NAMES=\[[^\]]*\];/)[0].replace('const SLOT_NAMES=',''))();

// game.html shadow 블록 + keystone deps 추출 → 실행(테스트 harness와 동일 경로)
function buildTel(){
  const start = gameHtml.indexOf('let _SHADOW_LAYER_LOG=false;');
  const end   = gameHtml.indexOf('if(typeof window!==', start);
  const shadowBlk = gameHtml.slice(start, end);
  const poolStart = gameHtml.indexOf('const AFFIX_POOL=[');
  const poolEnd = gameHtml.indexOf('\n];', poolStart);
  const pool = gameHtml.slice(poolStart, poolEnd+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  const afslot = gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const rate = gameHtml.match(/const KEYSTONE_ROLL_RATE=[^;]*;/)[0];
  const fCand = gameHtml.match(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/)[0];
  const canon = gameHtml.match(/function _itemLayerCap\(itemLv\)\{[^}]*\}/)[0]+'\n'+gameHtml.match(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/)[0];
  const body = `${pool}\n${afslot}\n${rate}\n${fCand}\nlet P=null,G=null;\n${canon}\n`+shadowBlk+
    `\nreturn {_shadowObserve,_shadowReset,_shadowStats,_shadowReport,setP(v){P=v},setG(v){G=v}};`;
  return new Function('Math','console',body)(Math,{log(){}});
}
const T = buildTel();

// ─── 코드-정확 itemLv 공식(game.html:12850) ───
const itemLvOf = (pLv) => Math.min(900, Math.floor(pLv/10)*10);
// SIMULATED rarity(층과 독립 — byRarity 필드 시연용, 합성값임을 명시)
function simRarity(rng){const r=rng();return r<.60?0:r<.82?1:r<.93?2:r<.98?3:r<.995?4:5}

function runSession(label, pLvStart, pLvEnd, N, seedTelemetry, stageOf){
  T._shadowReset(seedTelemetry);
  // 독립 스트림용 LCG(플레이어 진행/슬롯/rarity 생성 — telemetry RNG와 별개)
  let s = 0x1234^seedTelemetry>>>0; const rng=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
  for(let i=0;i<N;i++){
    const frac=i/(N-1||1), pLv=Math.round(pLvStart+(pLvEnd-pLvStart)*frac);
    const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    T.setP({lv:pLv}); T.setG({stage:stageOf(frac)});
    T._shadowObserve({itemLv:itemLvOf(pLv), slot, rarity:simRarity(rng), affixes:[], socketCount:1, crystals:[null]});
  }
  return { label, pLvStart, pLvEnd, N, st:T._shadowStats() };
}

const OUT=[]; const log=(...a)=>{const s=a.join(' ');OUT.push(s);console.log(s)};

log('═══════════════════════════════════════════════════════════════');
log('LOCK-36 SHADOW TELEMETRY SESSION — ⚠ SIMULATED (NOT REAL_PLAY)');
log('game.html shadow 블록 추출·실행. itemLv 공식 코드-정확 재현. production 미접촉.');
log('═══════════════════════════════════════════════════════════════');

function reportSession(R){
  const st=R.st;
  log(`\n──── ${R.label} ────  [SIMULATED]`);
  log(`session: pLv ${R.pLvStart}→${R.pLvEnd}  drops=${st.draws}  adequacy=${st.adequacy}  (dur=SIMULATED n/a)`);
  log(`  itemLv band(actual) / cap / drops:`);
  for(const band of Object.keys(st.byBand).map(Number).sort((a,b)=>a-b)){const b=st.byBand[band];log(`    band ${band*100}~${band*100+90}${band===9?'+':''}  cap${b.cap}  n=${b.draws}`)}
  log(`  shadow layer P(L1..L10)%: `+st.P.slice(1).map(x=>(x*100).toFixed(1)).join(' '));
  log(`  buckets L1-4=${(st.buckets.L1_4*100).toFixed(1)}% L5-7=${(st.buckets.L5_7*100).toFixed(1)}% L8-10=${(st.buckets.L8_10*100).toFixed(1)}%  mean=${st.mean.toFixed(2)} med=${st.median} p90=${st.p90} P(cap)=${(st.Pcap*100).toFixed(1)}%`);
  log(`  cap-conditioned parity vs LOCK-34 analytic (maxErr):`);
  for(const cap of Object.keys(st.capParity).map(Number).sort((a,b)=>a-b)){const c=st.capParity[cap];log(`    cap${cap}(n=${c.n})  obs%=[${c.obs.map(x=>(x*100).toFixed(0)).join(',')}]  ana%=[${c.ana.map(x=>(x*100).toFixed(0)).join(',')}]  maxErr=${(c.maxErr*100).toFixed(2)}%p`)}
  log(`  affix implication: weapon E=${st.affix.weapon.expected.toFixed(2)} med=${st.affix.weapon.median} p90=${st.affix.weapon.p90} | other E=${st.affix.other.expected.toFixed(2)} med=${st.affix.other.median} p90=${st.affix.other.p90}`);
  log(`  keystone: highLayer(≥8)=${st.highLayerItems}  eligible=${st.eligibleKeystoneItems}  P(eligible)=${st.draws?(100*st.eligibleKeystoneItems/st.draws).toFixed(2):0}%  expectedK=${st.expectedKeystones.toFixed(3)}`);
  const byK=st.expectedByKeystone; if(Object.keys(byK).length) log(`    expected by keystone: `+Object.keys(byK).map(k=>`${k}=${byK[k].toFixed(3)}`).join(' '));
  else log(`    expected by keystone: (none — 이 session에 L≥8 eligible 없음)`);
  log(`  slot P(layer≥8): `+Object.keys(st.bySlot).map(sl=>`${sl}:${st.bySlot[sl].draws?(100*st.bySlot[sl].ge8/st.bySlot[sl].draws).toFixed(0):0}%`).slice(0,6).join(' ')+' ...');
}

// A. SIMULATED_SWEEP — 전 itemLv band 균일 노출(cap-parity·필드 검증, 대표본)
reportSession.calls=0;
const A = runSession('SIMULATED_SWEEP (pLv 0→900 uniform, cap1~10 전역)', 0, 900, 60000, 0x6F6C, f=>Math.min(34,~~(f*34)));
reportSession(A);

// B. SIMULATED_EARLYGAME — 데모/초반 플레이 근사(§14 progression reality)
const B = runSession('SIMULATED_EARLYGAME (pLv 1→150, 데모 근사)', 1, 150, 800, 0xEA12, f=>~~(f*4));
reportSession(B);

// C. SIMULATED_ENDGAME_REACH — itemLv900 도달 확인(§15 reachability)
const C = runSession('SIMULATED_ENDGAME (pLv 900, cap10)', 900, 900, 2000, 0x900, ()=>34);
reportSession(C);

log('\n─ §15 endgame reachability(코드 기준): itemLv=min(900,floor(P.lv/10)*10) → P.lv≥900이면 itemLv=900=cap10 reachable. 위 C는 도달 확인.');
log('─ §14 구분: EARLYGAME(B)에서 L8-10/keystone 미출현은 itemLv 저구간(cap 낮음) 때문 — Layer economy 버그 아님(progression 상태).');
log('─ ⚠ 위 전부 SIMULATED. REAL_PLAY telemetry = window._shadowLayer.enable("A2")→실플레이→.report()로 별도 수집 필요(미수집).');

import('fs').then(fs=>fs.writeFileSync(new URL('./shadow_telemetry_session.out.txt', import.meta.url), OUT.join('\n')+'\n'));

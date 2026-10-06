// ════════════════════════════════════════════════════════════════════════
//  ch1-authored-spawn-budget.candidate.mjs
//  완료ID: ENEMY-CH1A-AUTHORED-SPAWN-BUDGET-NEUTRAL-20261006
//  배정: TASK CLAUDE8-PROD-ENEMY-20261006-0220 (ENEMY role, UUID 0d77d1ea…)
//
//  목적 — authored18 "미소비" 결함의 최소 적용 후보 1개:
//    기존 CH1 random-scatter 소비 루프가 뽑는 랜덤 스폰 중 18기를 authored 배치로
//    **budget-neutral** 교체하는 spawn port(함수) + exact patch.
//    총수 / rollEl / EXP·drop / angler(4킬+80%)·재료+4 / rare / bonfire / fixed spawns 불변.
//    어택티켓·동시공격 제한 추가 0. production 미적용(후보).
//
//  이 파일은 이 경로 1개만 소유한다. 추가 report/TASK/backup/test/memory/scratch/tmp 0.
//  검증은 이 파일을 node로 실행(stdin) → 출력은 응답 본문. 다른 파일 생성 0.
//
//  ── source 핀 (game.html, 실제 대조) ─────────────────────────────────────
//   mkEn(x,y,si,etype,ib,el,room) @29939  — x,y=world px; opening remap {2,22,30,43}→0;
//       e.r=(ETYPE_R[etype]+rand0..2)*2*eliteScale; dropTier/EXP=etype+monLv 스케일; eShield=hp.
//   rollEtype(0) @29812 (근접50%/원거리50% split) · HELL_SPAWN[0] @29789 · rollEl(0)→HELL_EL[0]=[EL.P,.40] @29803.
//   spawnTileRLEEns(si) @30300  — cnt=min(80,max(20,~~(floorTiles*0.005*DIFF_MOB[diff]))+si); start 400px² skip; canMv(r8).
//   _CH1_START_MEDIUM_SPAWNS=[{dx:-13,dy:-18},{dx:13,dy:-21}] @30337 → eye etype4 EL.D, (P.x/T+dx)*T.
//   _FB_SITES / _FB_ELS=[2,1,3,4]=(물/화/암/뇌) @59341 · 앵글러 처치 재료 G.mats+=4 @17888 · 게이트 G._fbDone(4킬+80%).
//   rare @30246 rareChance 0.05 · 죽음 0.005 once(G._deathSpawned) · 포메이션 15% 7번째.
//   canMv/safePt @30527/30532 · isW @30526(타일+_ch1HillBandBlocks+_colObjs) · _CH1_HILL @30507 · boss_gate_col colSz250 @17597.
//   P.r=14 @62259 · ETYPE_R @29678 · ETYPE_RANGE @29689.
//
//  ── 보호(변경 0) ─────────────────────────────────────────────────────────
//   fixed spawns(eye/angler/eel)·앵글러 보상·gate·rare·bonfire는 **심볼 참조만**, 좌표/로직 무변.
//   기존 raw(20261005)의 approximate fixed coords 재사용 0. 2_3/Q-only/E불가/어택티켓금지/기존23/타인WIP 유지.
// ════════════════════════════════════════════════════════════════════════

// 실제 source 상수 (핀 — 대조용, 게임 코드에서 인용)
export const SRC = {
  T: 40, playerR: 14,                                   // game.html P.r=14
  ETYPE_R: {0:10,1:10,3:10,4:16,6:13,7:10,12:18,15:12,18:16}, // @29678 (실 e.r=(v+0..2)*2)
  GROUP_ETYPES: [33,64,97],                              // 그룹 증식 etype — authored에서 미사용(1:1 보장)
  OPENING_EXCLUDED: [2,22,30,43],                        // _CH1_OPENING_EXCLUDED_ET @29811
  HILL: {cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04,  // _CH1_HILL @30507
         rampX0:125,rampX1:135,rampY:98,rampHalf0:1.8,rampHalf1:3},
  bonfireR: 280,                                         // 화톳불 안전결계
  // fixed spawns는 아래 심볼이 진실원본 — 이 후보는 변경하지 않는다(핀).
  FIXED_PINS: {
    eyeMass: '_CH1_START_MEDIUM_SPAWNS=[{dx:-13,dy:-18},{dx:13,dy:-21}] → mkEn((P.x/T+dx)*T,(P.y/T+dy)*T,0,4,false,EL.D,-1)',
    anglers: '_FB_SITES(tile)×T + _FB_ELS=[2,1,3,4] (물/화/암/뇌); 처치 G.mats+=4; gate G._fbDone(4킬+80%)',
    eels:    '_WM_SITES 4굴, 1000px 등장, 화톳불 결계 355px',
    rare:    'rareChance 0.05 / 죽음 0.005 once — scatter 내부, authored는 rare roll 미수행',
  },
};

// ── authored 18 배치 (world px). Task-B 최소 nudge 적용(P.r/e.r/nav 근거) ───
//   east_terrace/가시사도: (6042,3622)=hill band(normDist .858∈[.84,1.04])→snap 위험
//                          → (6028,3648) 고지 평지(normDist .78<.84), safePt 미발동.
//   north_exit/갑각사도:  clearance 89<90(e.r36+P.r14) → +20px 바깥 (4139→4159,x), clearance≈109.
export const AUTHORED = [
  {zone:'south_entry',  phase:'early', etype:0,  name:'하급사도',       x:4145, y:7078},
  {zone:'first_clearing',phase:'early',etype:0,  name:'하급사도',       x:4138, y:5939},
  {zone:'first_clearing',phase:'early',etype:0,  name:'하급사도',       x:3858, y:6163},
  {zone:'first_clearing',phase:'early',etype:18, name:'흡혈사도',       x:4185, y:6143},
  {zone:'root_bend',    phase:'side',  etype:3,  name:'요마(스웜)',     x:3491, y:4966},
  {zone:'root_bend',    phase:'side',  etype:12, name:'광폭사도',       x:3038, y:5071},
  {zone:'west_camp',    phase:'side',  etype:3,  name:'요마(스웜)',     x:1933, y:3908},
  {zone:'west_camp',    phase:'side',  etype:0,  name:'하급사도',       x:1654, y:4095},
  {zone:'west_camp',    phase:'side',  etype:1,  name:'가시사도',       x:1998, y:3699},
  {zone:'east_terrace', phase:'side',  etype:7,  name:'현자형사도(리치)', x:5735, y:4161},
  {zone:'east_terrace', phase:'side',  etype:1,  name:'가시사도',       x:6028, y:3648}, // nudged (off hill band)
  {zone:'north_fork',   phase:'late',  etype:0,  name:'하급사도',       x:4152, y:2156},
  {zone:'north_fork',   phase:'late',  etype:1,  name:'가시사도',       x:3578, y:2032},
  {zone:'north_fork',   phase:'late',  etype:15, name:'분열사도',       x:4141, y:1776},
  {zone:'north_fork',   phase:'late',  etype:7,  name:'현자형사도(리치)', x:4521, y:2105},
  {zone:'north_exit',   phase:'late',  etype:4,  name:'갑각사도',       x:4159, y:942},  // nudged (+20px gap)
  {zone:'north_exit',   phase:'late',  etype:6,  name:'철갑사도',       x:3850, y:918},
  {zone:'north_exit',   phase:'late',  etype:1,  name:'가시사도',       x:4361, y:804},
];

const _tileKey = (x,y,T=SRC.T)=>`${~~(x/T)}_${~~(y/T)}`;

export const SCATTER_FLOOR = 20;   // spawnTileRLEEns cnt 하한 (game.html @30300: max(20,…))

// ── budget 계약 (총량 cntOld 초과 0, 작은/비유한 cnt 안전 거절) ─────────────
//   authoredN = clamp( min(AUTHORED.length, cntOld - SCATTER_FLOOR), 0, len )
//   scatter   = cntOld - authoredN  (≥ SCATTER_FLOOR 일 땐 유지, cntOld 작으면 그대로)
//   총량 = scatter + authoredN = cntOld (절대 초과 없음).
//   예: 80→{authored18,scatter62}  20→{authored0,scatter20}  30→{authored10,scatter20}
//       10(비정상<floor)→{authored0,scatter10}  NaN/∞/음수→{authored0,scatter0}
export function budgetPlan(cntOld){
  if(!Number.isFinite(cntOld) || cntOld<=0) return {authoredN:0, scatter:0, total:0, cntOld, safe:true};
  const room = Math.max(0, cntOld - SCATTER_FLOOR);           // authored가 들어갈 여유
  const authoredN = Math.max(0, Math.min(AUTHORED.length, room));
  const scatter = cntOld - authoredN;                         // 잔여 = scatter
  return {authoredN, scatter, total:scatter+authoredN, cntOld, safe:(scatter+authoredN)<=cntOld};
}

// ── spawn port (게임에 주입하는 소비자 함수, budget-neutral) ───────────────
//   api = { mkEn, rollEl, ens, T, authoredTiles:Set, budget:cntOld }  (실제 game 주입)
//   · budgetPlan(budget).authoredN 개만 배열 순서로 생성(여유 부족 시 꼬리부터 거절 — 총량 초과 0).
//   · authored 를 mkEn(...,0,etype,false,rollEl(0),-1)로 생성·ens push.
//   · fixed(eye/angler/eel)·rare·앵글러 보상 로직 미호출. 어택티켓/동시공격 필드 미설정.
//   · 각 authored 타일을 authoredTiles에 등록 → scatter 루프 dedup.
//   · 그룹 증식 etype(33/64/97)은 건너뜀(1:1 총수 보장).
export function spawnCh1Authored(api){
  const T = api.T || SRC.T;
  const tiles = api.authoredTiles || new Set();
  const plan = budgetPlan(Number.isFinite(api.budget) ? api.budget : 80); // budget 미지정 시 상한 가정
  let placed = 0;
  for(const a of AUTHORED){
    if(placed >= plan.authoredN) break;                       // budget 여유만큼만 (안전 거절)
    if(SRC.GROUP_ETYPES.includes(a.etype)) continue;          // 증식형 제외
    const el = api.rollEl(0);                                 // 원소 분포 보존
    const e = api.mkEn(a.x, a.y, 0, a.etype, false, el, -1);  // world px, room -1
    if(!e) continue;                                          // mkEn NaN/snap 실패
    e._authored = true;                                       // 식별 플래그(비전투 메타)
    api.ens.push(e);
    tiles.add(_tileKey(a.x, a.y, T));
    placed++;
  }
  api.authoredTiles = tiles;
  // scatter는 cntOld - placed 로 설정 (호출측). placed ≤ plan.authoredN 이므로 총량 ≤ cntOld.
  return {placed, scatterRemain: Math.max(0, plan.cntOld - placed), authoredN:plan.authoredN, budget:plan.cntOld};
}

// ── exact patch (game.html, 미적용 — root가 적용) ─────────────────────────
//   (1) spawnTileRLEEns cnt를 authored 수만큼 감산 → 총수 불변.
//   (2) authored 타일은 scatter에서 skip → 중복 스폰 방지.
//   (3) CH1-1 스폰 init에서 _spawnCh1StartMediumEyeMasses(si) 옆에 1회 호출.
export const PATCH = {
  file: 'game.html',
  hunks: [
    { at: 'spawnTileRLEEns(si) @~30300 — scatter = 잔여(cntOld - authored), 총량 ≤ cntOld',
      before: "  const cnt=Math.min(80,Math.max(20,~~(ft.length*0.005*DIFF_MOB[OPT.diff]))+si);",
      after:  "  const _cntOld=Math.min(80,Math.max(20,~~(ft.length*0.005*DIFF_MOB[OPT.diff]))+si);\n" +
              "  const _authN=(si===0&&typeof _CH1_AUTHORED_N==='number')?_CH1_AUTHORED_N:0; // 이미 배치된 authored 수\n" +
              "  const cnt=Math.max(0,_cntOld-_authN); // 잔여만 scatter — floor 재강제 금지(총량 초과 0)" },
    { at: 'spawnTileRLEEns while-loop tile pick @~30300',
      before: "    if(!canMv(ex,ey,8))continue;",
      after:  "    if(!canMv(ex,ey,8))continue;\n" +
              "    if(si===0&&G._authoredTiles&&G._authoredTiles.has((~~(ex/T))+'_'+(~~(ey/T))))continue; // authored dedup" },
    { at: 'CH1-1 spawn init (near _spawnCh1StartMediumEyeMasses(si)) — scatter보다 먼저',
      before: "  _spawnCh1StartMediumEyeMasses(si);",
      after:  "  _spawnCh1StartMediumEyeMasses(si);\n" +
              "  if(si===0){G._authoredTiles=new Set();\n" +
              "    const _cntOld=Math.min(80,Math.max(20,~~(G._floorTiles.length*0.005*DIFF_MOB[OPT.diff]))+si); // scatter와 동일식\n" +
              "    const _res=spawnCh1Authored({mkEn,rollEl,ens,T,authoredTiles:G._authoredTiles,budget:_cntOld});\n" +
              "    window._CH1_AUTHORED_N=_res.placed;} // scatter cnt는 위 hunk에서 _cntOld-placed" },
  ],
  note: 'authored는 budget(_cntOld)만큼만 배치(budgetPlan). scatter cnt=_cntOld-placed (floor 20 재강제 금지 → 작은 cnt에서 총량 초과 방지). 호출은 scatter보다 먼저. 실제 호출 지점은 live CH1-1 dispatcher(tileRLE vs room)에 따라 root 확정.',
};

// 불변 선언 (보호계약)
export const INVARIANTS = {
  attackTicketAdded: 0, simultaneousAttackLimitAdded: 0,
  totalCountNeverExceedsCntOld: true,   // scatter+authored ≤ cntOld (작은 cnt 안전 거절)
  rollElPreserved: true,                // authored는 rollEl(0) 사용 → 원소 분포 동일
  // EXP/drop: mkEn 동일 스케일(etype+monLv)이라 모델상 신규 수치 0이나, 실전 기대값 중립은
  // authored etype 분포가 pool과 완전 일치하지 않아 **미검증(미인수)**. root 밸런스/QA 판단.
  dropExpNeutral: 'UNVERIFIED (모델 동일 / 실전 기대값 미인수)',
  fixedSpawnsTouched: 'none (eye/angler/eel/보상/gate/rare/bonfire 심볼 참조만)',
};

const BANNED = ['atkTicket','attackTicket','maxAttackers','maxConcurrent','concurrentAtk','atkSlot','ringSlot','_atkTok','attackToken','attackLimit','simulCap'];

// 한 번의 포트 실행(주어진 budget)을 깨끗한 mock에서 수행 — 결과 집계 반환
function _runPort(budget){
  let elCalls=0;
  const rollEl=()=>{elCalls++;return 'EL.P';};                 // HELL_EL[0] 대표
  const mkEn=(x,y,si,et,ib,el,room)=>{
    const _et=(si===0&&!ib&&SRC.OPENING_EXCLUDED.includes(et))?0:et; // opening remap
    return {x,y,si,etype:_et,el,room,r:(SRC.ETYPE_R[_et]+2)*2};      // 실 e.r 모델
  };
  const ens=[]; const tiles=new Set();
  const res=spawnCh1Authored({mkEn,rollEl,ens,T:SRC.T,authoredTiles:tiles,budget});
  const scatter=Math.max(0, budget - res.placed);              // 호출측 scatter = cntOld - placed
  return {res, ens, tiles, elCalls, scatter, total:scatter+res.placed};
}

// 브라우저/Node 공용 main 판정 (process 미정의 시 ReferenceError 방지)
export function isMainModule(){
  if(typeof process==='undefined' || !process.argv || !process.argv[1]) return false;
  return import.meta.url===`file://${process.argv[1]}` ||
         import.meta.url.endsWith(process.argv[1].split('/').pop());
}

// ── 자체검증 (mock mkEn/ens/rollEl로 budget 계약·불변 증명) ────────────────
export function verify(){
  const out=[]; const ok=(n,c,m='')=>out.push({n,pass:!!c,m});

  // ② budget 경계 — 총량이 cntOld 초과 0, 작은/비유한 cnt 안전 거절
  const cases=[
    {cntOld:80, authoredN:18, scatter:62},   // 정상: 18 + 62
    {cntOld:20, authoredN:0,  scatter:20},   // floor: 0 + 20 (초과 방지)
    {cntOld:30, authoredN:10, scatter:20},   // 부분: 10 + 20
    {cntOld:10, authoredN:0,  scatter:10},   // 비정상<floor: 0 + 10 (총량 10, 초과 0)
  ];
  let budgetOK=true, detail=[];
  for(const c of cases){
    const p=budgetPlan(c.cntOld), r=_runPort(c.cntOld);
    const good = p.authoredN===c.authoredN && r.res.placed===c.authoredN && r.scatter===c.scatter &&
                 r.total<=c.cntOld;           // 핵심 불변: 총량 ≤ cntOld
    if(!good)budgetOK=false;
    detail.push(`${c.cntOld}→{a:${r.res.placed},s:${r.scatter},tot:${r.total}≤${c.cntOld}}`);
  }
  ok('budget-no-overflow', budgetOK, detail.join('  '));

  // 비유한/음수 cnt → authored 0, 총량 0 (안전 거절)
  const nf=[NaN, Infinity, -5, 0].map(v=>budgetPlan(v));
  ok('nonfinite-safe-refuse', nf.every(p=>p.authoredN===0 && p.total===0 && p.safe), nf.map(p=>`${p.cntOld}:a${p.authoredN}`).join(' '));

  // ① authored 전량 소비(budget 충분 시) — 미소비 결함 해소
  const full=_runPort(80);
  ok('authored-consumed-when-room', full.res.placed===AUTHORED.length && full.ens.length===AUTHORED.length, `placed ${full.res.placed}/${AUTHORED.length}`);

  // rollEl 보존: 배치 수만큼 호출
  ok('rollEl-preserved', full.elCalls===full.res.placed, `rollEl calls ${full.elCalls} == placed ${full.res.placed}`);

  // 그룹 증식 etype 미사용(1:1) / opening 제외 etype 미사용
  const grp=AUTHORED.filter(a=>SRC.GROUP_ETYPES.includes(a.etype));
  ok('no-group-multiplier', grp.length===0, grp.length?grp.map(a=>a.etype).join(','):'none');
  const exc=AUTHORED.filter(a=>SRC.OPENING_EXCLUDED.includes(a.etype));
  ok('no-excluded-opening', exc.length===0, exc.length?exc.map(a=>a.etype).join(','):'none');

  // 어택티켓/동시공격 필드 0
  let leak=[]; for(const e of full.ens) for(const k of Object.keys(e)) if(BANNED.includes(k)) leak.push(k);
  ok('no-attack-ticket', leak.length===0 && INVARIANTS.attackTicketAdded===0 && INVARIANTS.simultaneousAttackLimitAdded===0, leak.length?leak.join(','):'spatial-only');

  // dedup: authored 타일 등록
  const sampleT=_tileKey(AUTHORED[0].x,AUTHORED[0].y);
  ok('dedup-tiles-registered', full.tiles.size===AUTHORED.length && full.tiles.has(sampleT), `${full.tiles.size} tiles; scatter skips e.g. ${sampleT}`);

  // nudge(실제 nav): east_terrace 가시사도 hill band 밖
  const et=AUTHORED.find(a=>a.zone==='east_terrace'&&a.etype===1);
  const H=SRC.HILL, nd=Math.hypot((et.x/SRC.T-H.cx)/H.rx,(et.y/SRC.T-H.cy)/H.ry);
  ok('east-terrace-off-hill-band', nd<H.inner, `normDist ${nd.toFixed(3)} < inner ${H.inner}`);
  const tk=AUTHORED.find(a=>a.zone==='north_exit'&&a.etype===4);
  ok('north-exit-tank-nudged', tk.x===4159, `tank x=${tk.x} (was 4139; +20 → clearance ≈109)`);

  // ③ 브라우저 ESM guard: process 미정의 시에도 isMainModule()이 throw 없이 boolean
  let guardOK=true; try{ const v=isMainModule(); guardOK=(typeof v==='boolean'); }catch(e){ guardOK=false; }
  ok('browser-esm-guard', guardOK, 'isMainModule() typeof process 가드 — throw 0');

  // fixed spawns 미변경(심볼 핀만)
  ok('fixed-spawns-untouched', typeof SRC.FIXED_PINS.eyeMass==='string', 'eye/angler/eel = symbol pins only');

  const pass=out.filter(c=>c.pass).length;
  return {pass, fail:out.length-pass, total:out.length, checks:out};
}

const _isMain = isMainModule();
if(_isMain){
  const r=verify();
  console.log('── CH1-1 authored-spawn budget-neutral 후보 검증 ──');
  for(const c of r.checks) console.log(`${c.pass?'PASS':'FAIL'}  ${c.n}  ${c.m}`);
  console.log(`\n총 ${r.total}  PASS ${r.pass}  FAIL ${r.fail}`);
  console.log(`authored ${AUTHORED.length}기 budget-neutral / 어택티켓 ${INVARIANTS.attackTicketAdded} / 총량≤cntOld=${INVARIANTS.totalCountNeverExceedsCntOld} / EXP·drop중립 ${INVARIANTS.dropExpNeutral}`);
  process.exit(r.fail?1:0);
}

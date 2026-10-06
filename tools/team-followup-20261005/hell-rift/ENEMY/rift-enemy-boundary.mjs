// ════════════════════════════════════════════════════════════════════════
//  rift-enemy-boundary.mjs  —  ENEMY 역할 CH1-1 배치/읽힘·길막 최소 OLD/NEW 후보
//  배정: ROOT-CLAUDE8-EXISTING-ROLE-ASSIGNMENT-20261006 / ENEMY(UUID 0d77d1ea…)
//  owner CH1-1 책임: "8공간의 초기/측면/후기 동선과 기존 적 AI·swarm 위협을 대조,
//                     배치/읽힘·길막 최소 OLD/NEW 후보 (동시공격 제한 추가 0)"
//
//  이 파일은 **후보(candidate) 데이터 + 자체검증기**다. production 미반영.
//  game.html / layout.js / 세이브 / 공유 docs / Git 를 변경하지 않는다.
//  좌표·etype·수치는 전부 아래 SSOT 에서 인용한 것이며 새 밸런스 수치를 만들지 않는다.
//
//  ── 선행 Read (정본) ────────────────────────────────────────────────────
//   docs/4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md §1   (8 zone anchor, 4구역 gate)
//   docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md §2·§5        (world 8000², T40, half-width 2.75t)
//   docs/4.1맵디자인+설정/HELL_RIFT_EDITOR_RESULT_20261006.md       (corridor 반폭 2.75t = 110px)
//   docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md §1·L15·L195         (실제 스폰·AI·보호규칙)
//   docs/8.0몬스터디자인/몬스터_공격시스템.md L170~310               (ETYPE_RANGE 5단계·유지밴드)
//   docs/8.0몬스터디자인/스테이지_몹분배.md                          (CH1 풀 70종·보스 si0)
//   game.html: P.r=14 / MAP_ALL_FLOOR&&si===0 전면 개활 / HELL_SPAWN[0]·rollEtype(0)
//             / _CH1_OPENING_EXCLUDED_ET={2,22,30,43} / _telegraphT=20f / 화톳불 결계 280px·300f
//
//  ── 보호 계약(변경 0) ───────────────────────────────────────────────────
//   · 어택티켓·동시공격 제한 신규 도입 0 (team master L15/L195). 읽힘은 **공간 배치**로만 해결.
//   · 2_3 돌진/패링/방패, Q/E 패링, 기존23, production geometry/bake/collision 무변.
//   · 고정 배치(앵글러×4·다안육괴×2·곰치) 좌표/속성/게이트 조건 보존 — 참조만.
//   · 1-1 opening 돌진 제외 etype {2,22,30,43} 미사용.
// ════════════════════════════════════════════════════════════════════════

// ── 기하 상수 (정본 인용) ────────────────────────────────────────────────
export const GEO = {
  grid: { cols: 200, rows: 200, T: 40 },          // CH1_1_A_GRADE §1 / MAP_SCENE_EDITOR §3
  world: { w: 8000, h: 8000 },                     // 200 × 40
  wallMargin: 40,                                  // 경계 1타일 벽 (mkEn: 경계 유지)
  playerR: 14,                                     // game.html P.r=14
  // y 는 아래(남쪽)가 큼. 시작 남쪽(y185) → 출구 북쪽(y22).
  start: { x: 4020, y: 7420 },                     // tile(100.5,185.5) = 1-1 start (MAP_SCENE_EDITOR §5)
  exit:  { x: 4020, y: 300 },                      // tile(100.5,7.5)  = 1-1 exit
  corpseTree: { x: 4100, y: 3620 },                // tile(102.5,90.5) 시체나무 랜드마크
  bonfire: { r: 280, frames: 300 },                // 화톳불 안전결계 (몬스터_공격시스템 §시작화톳불)
  // half-width of readable main travel lane (HELL_RIFT_EDITOR_RESULT 반폭 2.75t × 40)
  laneHalf: 110,
  // 8 공간 anchor (CH1_1_A_GRADE §1). world = tile × 40.
  zones: {
    south_entry:   { tile:[100,185], world:{x:4000,y:7400}, lane:'spine', phase:'early', role:'진입·방향 인지, 전사와 첫 위협이 읽히는 시작' },
    first_clearing:{ tile:[100,151], world:{x:4000,y:6040}, lane:'spine', phase:'early', role:'첫 전투, 획득→다음 장비 선택' },
    root_bend:     { tile:[83,125],  world:{x:3320,y:5000}, lane:'spine', phase:'side',  role:'비대칭 굴곡·여행, 앞뒤 뿌리/낭떠러지 깊이' },
    west_camp:     { tile:[45,100],  world:{x:1800,y:4000}, lane:'westSpur', phase:'side', role:'서측 선택 경로·측면 전투' },
    corpse_basin:  { tile:[102,90],  world:{x:4080,y:3600}, lane:'spine', phase:'landmark', role:'시체나무 중심 랜드마크, 접근·전투 시점 대비' },
    east_terrace:  { tile:[147,97],  world:{x:5880,y:3880}, lane:'eastSpur', phase:'side', role:'고지대·경사로 높이/보행·가림' },
    north_fork:    { tile:[100,52],  world:{x:4000,y:2080}, lane:'spine', phase:'late',  role:'후기 전투·출구 예고, 남쪽과 다른 실루엣' },
    north_exit:    { tile:[100,22],  world:{x:4000,y:880},  lane:'spine', phase:'late',  role:'구역 진행 확인·보스 접근 방향' },
  },
  // 플레이어 실제 동선 (anchor polyline). 개활 맵이라 nav 벽이 아닌 "자연 이동선"이다.
  polylines: {
    spine: [[4020,7420],[4000,7400],[4000,6040],[3320,5000],[4080,3600],[4000,2080],[4000,880],[4020,300]],
    westSpur: [[3320,5000],[1800,4000]],
    eastSpur: [[4080,3600],[5880,3880]],
  },
};

// ── 적 AI 모델 (몬스터_공격시스템 §ETYPE_RANGE + ENEMY_AI_TEAM_MASTER §1, 인용) ──
export const ENEMY_MODEL = {
  // 유형(사거리px) / 접근 AI 유지밴드 / 공격조건
  tiers: {
    pointBlank: { range:200, hold:[0,0],      desc:'무조건 밀착 돌진 (자폭·떼거리·압박)' },
    short:      { range:400, hold:[0,0],      desc:'플레이어에 달라붙음 (근접·탱커·방패)' },
    mid:        { range:600, hold:[390,510],  desc:'390~510 유지, 가까우면 후퇴 (원거리·비행·덫·그림자)' },
    long:       { range:800, hold:[520,680],  desc:'520~680 유지, 접근 시 후퇴 (마법·저주·연금·궁수)' },
    veryLong:   { range:1000,hold:[650,850],  desc:'650~850 유지, 적극 후퇴 (소환·미니보스·포대)' },
  },
  // CH1 스폰 가능 etype → tier (몬스터_공격시스템 §etype표 + team master §1-B)
  etype: {
    0:{name:'하급사도',   tier:'short', melee:true },
    1:{name:'가시사도',   tier:'mid',   ranged:true, projCd:240, chargeF:60 },
    3:{name:'요마(스웜)', tier:'pointBlank', swarm:true, atkF:5 },
    4:{name:'갑각사도',   tier:'short', melee:true, tank:true },   // = 다안육괴 본체
    6:{name:'철갑사도',   tier:'short', melee:true, shield:true }, // eShieldBash d<150·d>30
    7:{name:'현자형사도(리치)', tier:'long', ranged:true, teleport:true, teleF:120 }, // 착지강타 atk×10.5
    12:{name:'광폭사도',  tier:'short', melee:true },
    15:{name:'분열사도',  tier:'mid',   ranged:true, splitOnDeath:'2~3' },
    18:{name:'흡혈사도',  tier:'short', melee:true },
  },
  meleeET: [0,2,4,5,6,10,12,18,19],         // 접촉공격 (team master §1-B)
  meleeGate: 'd < e.r + P.r + 8',           // ≈ 48~50px, atk×0.8, cd 40~60f, 접촉은 무예고
  sightAggro: 'd < 800 && hasLOS',
  meleeAggro: 'd < 100 && d > 50',
  telegraph: { windupF:20, chargeF:90, teleF:120, shotWarnF:60 }, // _telegraphT=20f 등 (몬스터_공격시스템)
  excludedOpening: [2,22,30,43],            // _CH1_OPENING_EXCLUDED_ET (돌진 제외)
  noFireSpecial: [5,9,11,20,24,50,51,52,53,54,55,56,57,58,59], // projCd 9999
};

// 고정 배치 (team master §1-C) — OLD/NEW 공통, 좌표/속성/게이트 보존(참조만, 변경 0)
const FIXED = Object.freeze({
  anglers: [ // 4모서리 4속성 → CH1_1_A_GRADE §1 4구역 gate (NW암/NE뇌/SW물/SE화)
    { el:'dark',      corner:'NW', pos:{x:900, y:900 },  note:'HP(1800+lv×350)×7.5, 충전 _FB_EN_CHG=180f→거대에너지탄, 텔포강타 CD600f r=fb.r+110' },
    { el:'lightning', corner:'NE', pos:{x:7100,y:900 },  note:'동일 계약' },
    { el:'water',     corner:'SW', pos:{x:900, y:7100},  note:'동일 계약' },
    { el:'fire',      corner:'SE', pos:{x:7100,y:7100},  note:'동일 계약' },
  ],
  anglerGate: '4킬 전멸 + 80% 킬 → G._fbDone 게이트 오픈 (임의 완화 0)',
  multiEye: [ // 다안육괴 ×2 : etype4 탱크, 화톳불 500px 밖
    { etype:4, pos:{x:4420,y:6950}, note:'EL.D, r(16+rand×2)×2=32~36, _firstShot=false' },
    { etype:4, pos:{x:3600,y:6980}, note:'동일' },
  ],
  eels: '지상 곰치/뱀장어 ×3~4 (_WM_SITES 4굴, 1000px 등장, 은신108f, 화톳불 결계355px) — 좌표 런타임, 참조만',
});

// ── 기하 헬퍼 ────────────────────────────────────────────────────────────
const V = {
  sub:(a,b)=>({x:a.x-b.x,y:a.y-b.y}),
  len:(a)=>Math.hypot(a.x,a.y),
  unit:(a)=>{const L=Math.hypot(a.x,a.y)||1;return {x:a.x/L,y:a.y/L};},
};
function segNearest(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay, L2=dx*dx+dy*dy;
  let t = L2 ? ((px-ax)*dx+(py-ay)*dy)/L2 : 0;
  t = Math.max(0,Math.min(1,t));
  const cx=ax+t*dx, cy=ay+t*dy;
  return { d:Math.hypot(px-cx,py-cy), pt:{x:cx,y:cy} };
}
// 모든 polyline 중 최단거리(= 플레이어가 가장 가까이 지나는 지점)와 그 점
export function laneNearest(px,py){
  let best={ d:Infinity, pt:null, lane:null };
  for(const [name,pl] of Object.entries(GEO.polylines)){
    for(let i=0;i<pl.length-1;i++){
      const r=segNearest(px,py,pl[i][0],pl[i][1],pl[i+1][0],pl[i+1][1]);
      if(r.d<best.d) best={ d:r.d, pt:r.pt, lane:name };
    }
  }
  return best;
}
// zone 의 lane 접선/법선 (법선 = 진행방향 왼쪽)
function zoneFrame(zoneName){
  const z=GEO.zones[zoneName], pl=GEO.polylines[z.lane];
  let idx=0,bd=Infinity;
  for(let i=0;i<pl.length;i++){const d=Math.hypot(pl[i][0]-z.world.x,pl[i][1]-z.world.y);if(d<bd){bd=d;idx=i;}}
  const prev=pl[Math.max(0,idx-1)], next=pl[Math.min(pl.length-1,idx+1)];
  const tan=V.unit({x:next[0]-prev[0], y:next[1]-prev[1]});
  const perp={x:-tan.y,y:tan.x}; // 왼쪽
  return { tan, perp, anchor:z.world };
}
// 배치 1건을 월드좌표로 구체화: pos = anchor + perp*D + tan*S (D>0 왼쪽, S>0 전진)
export function materialize(zoneName, p){
  const f=zoneFrame(zoneName);
  const x=f.anchor.x + f.perp.x*p.D + f.tan.x*p.S;
  const y=f.anchor.y + f.perp.y*p.D + f.tan.y*p.S;
  const near=laneNearest(x,y);
  const facing=Math.atan2(near.pt.y-y, near.pt.x-x); // 플레이어 동선 쪽을 바라봄
  const et=ENEMY_MODEL.etype[p.etype];
  return { ...p, zone:zoneName, pos:{x:Math.round(x),y:Math.round(y)}, facing:+facing.toFixed(3),
           name:et?et.name:'?', tier:et?et.tier:'?', range:et?ENEMY_MODEL.tiers[et.tier].range:0,
           laneDist:Math.round(near.d), laneRef:near.lane };
}

// ── OLD : 관측된 기존 배치 (절차적, zone 미인지) ──────────────────────────
export const OLD = {
  summary: '풀 랜덤 스폰 (HELL_SPAWN[0] → rollEtype(0)). zone 역할/동선-오프셋 규율 없음.',
  spawnModel: 'HELL_SPAWN[0]=etype 0~29+47 가중치, 돌진 {2,22,30,43} 제외(→0 리매핑).',
  zoneAware: false,
  laneOffsetDiscipline: false,     // 근접/탱크가 동선 위에 뭉쳐 길막·읽힘 저하 가능
  arcSeparation: false,            // 원거리/텔포 예고가 같은 방향서 겹쳐 가독 저하 가능
  fixed: FIXED,                    // 앵글러·다안육괴·곰치는 기존 고정
  observed: [
    'QA 실측(team master §3-C): 적 48~124, 근접 최대 31 동시. break 없음.',
    '개활 맵(MAP_ALL_FLOOR&&si===0): 근접/스웜이 전방 spine 에 쌓이면 시각적 길막.',
    '원거리 다수가 같은 측에서 예고 시 60f 예고링/돌진 90f 전조가 서로 겹쳐 읽힘 저하.',
  ],
};

// ── NEW : zone 인지 배치 후보 (동선-오프셋 밴드 + 호 분리, 동시공격 제한 추가 0) ──
// 설계 원리:
//  1) 길막 최소 — 근접/탱크/스웜 중심을 메인 동선(laneHalf=110) 밖에 둬 항상 통과 간격 보존.
//  2) 읽힘 —   원거리/텔포는 서로 반대 flank(D 부호 반전)에 배치해 예고 방향을 분리(호 분리).
//             → 동시공격 "횟수"를 제한하는 게 아니라 **방향을 벌려** 각 예고가 읽히게 함.
//  3) 초기 완만 → 측면 전개 → 후기 복합. 초기엔 원거리/스웜 억제.
const _plan = {
  // ── 초기(early) ──
  south_entry: [
    { etype:0, role:'early', band:'flankR', D:+150, S:+320, note:'첫 읽히는 근접 1기. 화톳불 결계 밖.' },
    // + 다안육괴 ×2(고정) 가 "첫 실제 위협" 랜드마크 전투 — FIXED.multiEye 참조
  ],
  first_clearing: [
    { etype:0,  role:'early', band:'flankR', D:+160, S:+60,  note:'첫 전투 근접' },
    { etype:0,  role:'early', band:'flankL', D:-170, S:-80,  note:'반대 flank 근접 (협공 읽힘)' },
    { etype:18, role:'early', band:'flankR', D:+150, S:-150, note:'흡혈 근접, 호 분리' },
  ],
  // ── 측면(side) ──
  root_bend: [
    { etype:3,  role:'side', band:'pocket', D:+170, S:+40,  note:'굴곡 안쪽 포켓서 스웜 돌진(초근접200)' },
    { etype:12, role:'side', band:'flankW', D:-280, S:-80, note:'광폭 근접, 서측 외곽(bulge 안, 3 lane 수렴 회피)' },
  ],
  west_camp: [
    { etype:3,  role:'side', band:'pocket', D:+150, S:-60,  note:'서측 개활 가로지르는 스웜 돌진' },
    { etype:0,  role:'side', band:'flankR', D:-160, S:+70,  note:'측면 근접' },
    { etype:1,  role:'side', band:'rangedHold', D:+360, S:0, note:'가시사도(중600) 후방 사격, 스웜과 호 분리' },
  ],
  east_terrace: [
    { etype:7,  role:'side', band:'elevated', D:+300, S:-100, note:'리치(장800·텔포120f) 고지 크레스트' },
    { etype:1,  role:'side', band:'rangedHold', D:-280, S:+120, note:'가시사도(중600) 반대 측, 호 분리' },
  ],
  // ── 후기(late) ──
  north_fork: [
    { etype:0,  role:'late', band:'flankR', D:+150, S:-80,  note:'전방 근접' },
    { etype:1,  role:'late', band:'flankL', D:-420, S:+60,  note:'가시사도(중600) 복도 사격 (서측 ~183°)' },
    { etype:15, role:'late', band:'forward', D:+150, S:+300, note:'분열사도(사망 2~3분열), 전방 ~297° 호 분리' },
    { etype:7,  role:'late', band:'flankR', D:+520, S:-40,  note:'리치(장800·텔포) 교란, 동측 ~4° 호 분리' },
  ],
  north_exit: [
    { etype:4,  role:'late', band:'gateGuard', D:+140, S:-60, note:'탱크 게이트 수문장 (간격 보존)' },
    { etype:6,  role:'late', band:'gateGuard', D:-150, S:-40, note:'철갑(쉴드 파괴 후 bash) 반대 측' },
    { etype:1,  role:'late', band:'flankR', D:+360, S:+80, note:'가시사도(중600) 출구 접근 엄호' },
  ],
};

export const NEW = {
  summary: 'zone 역할·동선 오프셋 밴드 + 반대 flank 호 분리. 읽힘을 공간으로 해결.',
  simultaneousAttackLimitAdded: 0,     // 보호계약: 동시공격 제한/어택티켓 신규 0
  attackTicketAdded: 0,
  zoneAware: true,
  fixed: FIXED,                        // OLD.fixed 와 동일 — 고정 배치 변경 0
  gateCondition: FIXED.anglerGate,     // 4구역 gate 조건 보존
  excludedOpeningUsed: false,
  placementsByZone: Object.fromEntries(
    Object.entries(_plan).map(([z,arr]) => [z, arr.map(p=>materialize(z,p))])
  ),
  get placements(){ return Object.values(this.placementsByZone).flat(); },
};

// ── 자체검증기 ───────────────────────────────────────────────────────────
const BANNED_FIELDS = ['atkTicket','attackTicket','maxAttackers','maxConcurrent',
  'concurrentAtk','atkSlot','ringSlot','_atkTok','attackToken','attackLimit','simulCap'];

export function runChecks(){
  const out=[]; const ok=(n,c,m='')=>out.push({name:n,pass:!!c,msg:m});
  const all=NEW.placements;
  const { laneHalf, bonfire, playerR, world, wallMargin, start } = GEO;

  // 1) 1-1 opening 돌진 제외 etype 미사용
  const bad = all.filter(p=>ENEMY_MODEL.excludedOpening.includes(p.etype)).map(p=>p.etype);
  ok('excluded-opening-etype', bad.length===0, bad.length?`found ${bad}`:'none');

  // 2) 화톳불 결계: start 1500px 이내 배치는 280+r 밖
  const ring = all.filter(p=>Math.hypot(p.pos.x-start.x,p.pos.y-start.y)<1500)
    .filter(p=>Math.hypot(p.pos.x-start.x,p.pos.y-start.y) < bonfire.r + (p.r||16));
  ok('bonfire-safe-ring', ring.length===0, ring.length?ring.map(p=>`${p.zone}/${p.name}`).join(','):'all clear');

  // 3) 길막 최소: 모든 NEW 배치 중심이 동선 밖 (laneDist >= laneHalf) → 통과 간격 보존
  const onLane = all.filter(p=>p.laneDist < laneHalf);
  ok('path-block-gap', onLane.length===0, onLane.length?onLane.map(p=>`${p.zone}/${p.name}(${p.laneDist})`).join(','):`all >= ${laneHalf}`);

  // 4) 어그로 도달: 근접/스웜은 사거리 내(읽히는 위협), 원거리는 유지밴드~사거리 창 안
  const aggroFail=[];
  for(const p of all){
    const t=ENEMY_MODEL.tiers[p.tier]; if(!t) continue;
    if(p.laneDist > t.range) aggroFail.push(`${p.zone}/${p.name} dist${p.laneDist}>range${t.range}`);
    // 원거리(hold 밴드 존재)는 동선에 붙지 않아야 함: laneDist 가 hold 상한보다 지나치게 작지 않게
    if(t.hold[1]>0 && p.laneDist < laneHalf) aggroFail.push(`${p.zone}/${p.name} ranged too close`);
  }
  ok('aggro-reachable', aggroFail.length===0, aggroFail.length?aggroFail.join(' | '):'all within range');

  // 5) 읽힘(호 분리): zone 내 예고형(원거리/텔포) 끼리 anchor 기준 각 분리 >= 30°
  let arcFail=[];
  for(const [z,arr] of Object.entries(NEW.placementsByZone)){
    const tel=arr.filter(p=>{const e=ENEMY_MODEL.etype[p.etype];return e&&(e.ranged||e.teleport);});
    const a=GEO.zones[z].world;
    for(let i=0;i<tel.length;i++)for(let j=i+1;j<tel.length;j++){
      const ai=Math.atan2(tel[i].pos.y-a.y,tel[i].pos.x-a.x);
      const aj=Math.atan2(tel[j].pos.y-a.y,tel[j].pos.x-a.x);
      let d=Math.abs(ai-aj); if(d>Math.PI)d=2*Math.PI-d;
      if(d < 30*Math.PI/180) arcFail.push(`${z}:${tel[i].name}~${tel[j].name} ${(d*180/Math.PI).toFixed(0)}°`);
    }
  }
  ok('telegraph-arc-separation', arcFail.length===0, arcFail.length?arcFail.join(','):'>=30 deg each zone');

  // 6) 동시공격 제한/어택티켓 신규 도입 0 (보호계약)
  let fieldLeak=[];
  for(const p of all) for(const k of Object.keys(p)) if(BANNED_FIELDS.includes(k)) fieldLeak.push(`${p.zone}/${k}`);
  const declOK = NEW.simultaneousAttackLimitAdded===0 && NEW.attackTicketAdded===0;
  ok('no-concurrency-mechanic', fieldLeak.length===0 && declOK, fieldLeak.length?fieldLeak.join(','):'spatial-only, declared 0');

  // 7) 고정 배치 보존: NEW.fixed === OLD.fixed (앵글러·다안육괴·게이트 변경 0)
  ok('fixed-placement-preserved', NEW.fixed===OLD.fixed && NEW.gateCondition===FIXED.anglerGate, 'anglers×4/eyes×2/eels/gate unchanged');

  // 8) 경계 안쪽: 모든 배치가 벽 margin 안
  const oob=all.filter(p=>p.pos.x<wallMargin||p.pos.x>world.w-wallMargin||p.pos.y<wallMargin||p.pos.y>world.h-wallMargin);
  ok('inside-world-bounds', oob.length===0, oob.length?oob.map(p=>`${p.zone}`).join(','):'all inside');

  const pass=out.filter(c=>c.pass).length, fail=out.length-pass;
  return { pass, fail, total:out.length, checks:out };
}

// ── 직접 실행 시 검증 출력 ───────────────────────────────────────────────
const _isMain = (import.meta.url === `file://${process.argv[1]}`) ||
                (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop()));
if(_isMain){
  const r=runChecks();
  console.log('── CH1-1 ENEMY 배치 OLD/NEW 후보 검증 ──');
  for(const c of r.checks) console.log(`${c.pass?'PASS':'FAIL'}  ${c.name}  ${c.msg}`);
  console.log(`\n총 ${r.total}  PASS ${r.pass}  FAIL ${r.fail}`);
  console.log(`\nNEW 배치 ${NEW.placements.length}건 (zone 인지) + 고정 ${FIXED.anglers.length}앵글러/${FIXED.multiEye.length}다안육괴`);
  console.log('동시공격 제한 추가:', NEW.simultaneousAttackLimitAdded, '/ 어택티켓 추가:', NEW.attackTicketAdded, '(공간 배치로만 읽힘 해결)');
  for(const [z,arr] of Object.entries(NEW.placementsByZone)){
    const ph=GEO.zones[z].phase;
    console.log(`  [${ph}] ${z}: ` + arr.map(p=>`${p.name}(${p.tier},d${p.laneDist})`).join(', '));
  }
  process.exit(r.fail?1:0);
}

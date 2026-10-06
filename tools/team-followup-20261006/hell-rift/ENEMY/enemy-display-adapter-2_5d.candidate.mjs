// ════════════════════════════════════════════════════════════════════════
//  enemy-display-adapter-2_5d.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ENEMY-CANDIDATE
//  배정: TASK CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ENEMY (ROLE ENEMY, UUID 0d77d1ea…)
//
//  목표(goal doc §ENEMY): "일반 적의 기존 방향/접지/표시 크기 계약을 캐릭터 API로
//    연결할 후보. 새 spawn/AI 수치 변경 금지."
//
//  이 파일은 **표시 adapter(순수 매핑/정규화)** 다. 실제 rig 생성은 root read-only
//  API(createCharacterRig/characterRigFrame)에만 위임하고, 지원되지 않는 상태/대상은
//  fallback으로 **명시**한다. spawn·AI·난이도·피해·수치 0. production/게임 미실행.
//
//  ── 근거 source (실제 read, 인용) ───────────────────────────────────────
//   tools/2_5d/character-rigs.mjs  (createCharacterRig 반환 {object3d,update,snapshot,dispose})
//     · update(dt,{mode∈'idle'|'walk'|'run'|'attack', direction∈int0..7, phase?, speed?}) → object3d
//     · 잘못된 mode/direction → throw ('모션/8방향 계약 오류').  height∈(0,20] world.
//   tools/2_5d/character-rig-catalog.mjs
//     · CHARACTER_RIG_CATALOG ids = {'warrior','silvertail','dark-druid'} 뿐 (일반 적 rig 없음).
//     · directions = [south,se,east,ne,north,nw,west,sw] (index 0..7).
//     · frames: warrior{idle2,walk8,run8,attack9} silvertail{idle2,walk4,run4,attack9} druid{idle1,walk4,run4,attack4}
//     · foot anchor(anchorY)=발 baseline, anchorX=수평 중심. ref height = 몸높이 px.
//   game.html 적 표시 계약(인용): 8방향 render `_baseSz=Math.max(e.r*7,80)` (@5187/5247),
//     발/그림자 baseline `e.y+e.r*0.35` (@5195/5214), heading `e.facing=atan2(P.y-e.y,P.x-e.x)`
//     또는 `atan2(e.vy,e.vx)` (@5184/10521), 상태 e.s(idle/eWalk/eChase/eApproach/attack/charge/hit),
//     셀 ATLAS_ENEMY_LAYOUT cell(32/48/56/64/80).
//
//  ── UNKNOWN / 미구현 (완료로 꾸미지 않음) ────────────────────────────────
//   · 일반 적(etype 0~99)에 대응하는 2.5D rig = **없음**(카탈로그 3종뿐) → 전부 fallback.
//   · lab world단위↔게임 px 비율(worldUnitsPerPx) = 다른 checkout/스케일 → **CALIBRATION_REQUIRED**
//     (3387 실측 전까지 미지수; 추론값으로 대체하지 않음).
//   · dark-druid rig는 보스 소유(BOSS 역할) — 여기선 매핑만 노출, ENEMY가 점유하지 않음.
//
//  보호: 2_3/Q-only magic·blackBean 패링/E 불가/어택티켓 금지/기존23/사용자 save/타인 WIP 보존.
// ════════════════════════════════════════════════════════════════════════

// 카탈로그 실제 id (character-rig-catalog.mjs 와 1:1 — 이 목록 밖은 미지원)
export const RIG_IDS = Object.freeze(['warrior', 'silvertail', 'dark-druid']);
export const RIG_DIRECTIONS = Object.freeze(['south','se','east','ne','north','nw','west','sw']);
export const RIG_MODES = Object.freeze(['idle', 'walk', 'run', 'attack']);

// 게임 적 표시 계약 (game.html 인용 — 수치 변경 0, 읽기 전용 상수)
export const ENEMY_DISPLAY = Object.freeze({
  displaySizePx: (e) => Math.max((e && e.r || 0) * 7, 80),      // @5187/5247 _baseSz
  footBaseline:  (e) => ({ x: e.x, y: e.y + (e.r || 0) * 0.35 }), // @5195 그림자 baseline
  centerAnchor:  Object.freeze({ x: 0.5, y: 1 }),               // 발 기준(bottom-center), rig anchorX/anchorY 정합
  headingField:  'e.facing (radians, y-down)',                  // @5184/10521
});

// ── 방향: e.facing(radians, y-down) → rig direction index 0..7 ────────────
//   정준각: south=+π/2, se=+π/4, east=0, ne=-π/4, north=-π/2, nw=-3π/4, west=±π, sw=+3π/4
export function rigDirectionFromFacing(facing){
  const a = Number.isFinite(facing) ? facing : Math.PI/2;       // 미지정 → south
  return (((Math.round((Math.PI/2 - a) / (Math.PI/4))) % 8) + 8) % 8;
}

// ── 상태: e.s → rig mode. 미지원 상태는 fallback(hold)로 **명시** ─────────
const STATE_MODE = Object.freeze({
  idle:'idle', eIdle:'idle',
  eWalk:'walk', eChase:'walk', eApproach:'walk', walk:'walk', move:'walk',
  charge:'run', eCharge:'run', dash:'run', multiDash:'run', bossJump:'run',
  attack:'attack', eAttack:'attack', windup:'attack', eWindup:'attack', swing:'attack',
});
// 대응 rig mode 없음 → base mode 로 hold, fallbackState=true 로 caller에 통지
const STATE_FALLBACK = Object.freeze({
  hit:'idle', stagger:'idle', pStun:'idle', stun:'idle', hurt:'idle',
  block:'idle', recover:'idle', dead:'idle', dying:'idle', spawn:'idle',
});
export function rigModeFromState(state){
  if(STATE_MODE[state]) return { mode: STATE_MODE[state], fallbackState: false };
  if(STATE_FALLBACK[state]!==undefined) return { mode: STATE_FALLBACK[state], fallbackState: true, unsupported: state };
  return { mode: 'idle', fallbackState: true, unsupported: state || '(empty)' }; // 미지의 상태도 안전 fallback
}

// ── 표시 크기 → rig height(world). worldUnitsPerPx 는 3387 calibration 필요 ─
//   height = displaySizePx(e) × worldUnitsPerPx.  호출측이 lab 실측 비율을 주입.
//   비율 미지정 시 null 반환(추론 금지) — caller는 fallback 또는 calibration 요구.
export function rigHeightFromDisplay(e, worldUnitsPerPx){
  if(!Number.isFinite(worldUnitsPerPx) || worldUnitsPerPx <= 0) return null; // CALIBRATION_REQUIRED
  const px = ENEMY_DISPLAY.displaySizePx(e);
  const h = px * worldUnitsPerPx;
  return (Number.isFinite(h) && h > 0 && h <= 20) ? h : null;                 // rig height∈(0,20]
}

// ── rig id 해결: 일반 적은 rig 없음 → null(fallback). caller가 명시 매핑 주입 가능 ─
//   rigIdFor(e) 주입값은 카탈로그 id 로만 허용. dark-druid 는 BOSS 소유 → ENEMY 경로 제외.
export function resolveRigId(e, rigIdFor){
  if(typeof rigIdFor === 'function'){
    const id = rigIdFor(e);
    if(id && RIG_IDS.includes(id) && id !== 'dark-druid') return id;
    if(id === 'dark-druid') return null; // 보스 소유, ENEMY가 점유 금지
  }
  return null; // 일반 적(etype 0~99): 2.5D rig 미존재 → fallback
}

// ── adapter 생성 ─────────────────────────────────────────────────────────
//   api = { createCharacterRig, THREE, worldUnitsPerPx, rigIdFor }
//   rig 가능 → {kind:'rig', rig, sync(dt,e), footWorld(e), dispose}
//   불가(일반 적/미주입/calibration 없음) → {kind:'fallback-2d', reason, draw2d 계약}
export async function createEnemyRigAdapter(e, api = {}){
  const { createCharacterRig, THREE, worldUnitsPerPx, rigIdFor } = api;
  const id = resolveRigId(e, rigIdFor);
  const height = rigHeightFromDisplay(e, worldUnitsPerPx);
  // fallback 판정 (정직하게 사유 명시)
  if(!id)                          return _fallback('no-rig', e);          // 일반 적 = rig 없음
  if(typeof createCharacterRig!=='function' || !THREE) return _fallback('no-three-runtime', e);
  if(height==null)                 return _fallback('calibration-required', e);

  const rig = await createCharacterRig(id, { THREE, height });             // root API 위임
  return Object.freeze({
    kind: 'rig', id, object3d: rig.object3d,
    // 매 프레임: 게임 적 e 로부터 mode/direction 정규화 → rig.update 구동(이동/피해/저장 변경 0)
    sync(dt, ent){
      const en = ent || e;
      const m = rigModeFromState(en.s);
      const direction = rigDirectionFromFacing(en.facing);
      // run 은 walk 아트 재사용(카탈로그 계약). attack phase 는 게임이 주면 전달.
      rig.update(Number.isFinite(dt) ? dt : 0, {
        mode: m.mode, direction,
        phase: Number.isFinite(en._atkPhase) ? en._atkPhase : undefined,
        speed: Number.isFinite(en.speed) ? en.speed : 0,
      });
      return { mode: m.mode, direction, fallbackState: m.fallbackState, unsupported: m.unsupported };
    },
    footWorld(ent){ return ENEMY_DISPLAY.footBaseline(ent || e); },         // 발 접지 좌표(그림자 baseline)
    snapshot(){ return rig.snapshot(); },
    dispose(){ rig.dispose(); },
  });
}
function _fallback(reason, e){
  return Object.freeze({
    kind: 'fallback-2d', reason,                                            // 'no-rig'|'no-three-runtime'|'calibration-required'
    // 기존 2D 아틀라스 render 계약 그대로 사용 (어댑터는 좌표/방향/크기만 정규화 제공)
    draw2d: Object.freeze({
      sizePx: ENEMY_DISPLAY.displaySizePx(e),
      foot: ENEMY_DISPLAY.footBaseline(e),
      direction: rigDirectionFromFacing(e && e.facing),
      note: '일반 적은 2.5D rig 미존재 → 기존 _ch8Atlas/_chAtlas 2D 유지(미대체).',
    }),
  });
}

// ── 자체검증 (mock rig 로 계약·fallback·미지원 명시 증명 — 게임 미실행) ────
export function verify(){
  const out=[]; const ok=(n,c,m='')=>out.push({n,pass:!!c,m});

  // 1) 방향: 8개 정준 facing → 기대 index (rig directions 순서와 정합)
  const cases=[[Math.PI/2,0],[Math.PI/4,1],[0,2],[-Math.PI/4,3],[-Math.PI/2,4],[-3*Math.PI/4,5],[Math.PI,6],[3*Math.PI/4,7]];
  const dirOK=cases.every(([a,i])=>rigDirectionFromFacing(a)===i);
  ok('direction-8-canonical', dirOK, cases.map(([a,i])=>`${i}:${rigDirectionFromFacing(a)}`).join(' '));

  // 2) 상태 매핑: 지원 상태 + 미지원 fallback 명시
  const sup=rigModeFromState('eChase'), hit=rigModeFromState('hit'), unk=rigModeFromState('???');
  ok('state-mode-map', sup.mode==='walk'&&!sup.fallbackState && hit.mode==='idle'&&hit.fallbackState && unk.fallbackState,
     `walk:${sup.mode} hit:${hit.mode}/${hit.fallbackState} unk:${unk.fallbackState}`);

  // 3) height: calibration 없으면 null(추론 금지), 있으면 (0,20]
  const h0=rigHeightFromDisplay({r:16}, undefined), h1=rigHeightFromDisplay({r:16}, 0.012);
  ok('height-calibration-gated', h0===null && Number.isFinite(h1) && h1>0 && h1<=20, `noCal:${h0} cal:${h1&&h1.toFixed(3)}`);

  // 4) 일반 적 = rig 없음(정직) : etype 0~99 전부 resolveRigId null
  let anyRig=false; for(let et=0;et<100;et++){ if(resolveRigId({etype:et})!==null) anyRig=true; }
  ok('general-enemies-unrigged', !anyRig, '0..99 → null (fallback-2d)');

  // 5) 주입 매핑: 카탈로그 id만 허용, dark-druid(보스) 제외
  ok('rigid-injection-guard',
     resolveRigId({},()=>'warrior')==='warrior' && resolveRigId({},()=>'dark-druid')===null && resolveRigId({},()=>'goblin')===null,
     'warrior✓ druid→null(boss) unknown→null');

  // 6) fallback 경로: rig 없음/런타임 없음/calibration 없음 사유 명시
  return Promise.all([
    createEnemyRigAdapter({r:16,etype:0,facing:0,s:'idle'}, {}),                                   // no-rig
    createEnemyRigAdapter({r:16,facing:0,s:'idle'}, {rigIdFor:()=>'warrior'}),                      // no-three-runtime
    createEnemyRigAdapter({r:16,facing:0,s:'idle'}, {rigIdFor:()=>'warrior', THREE:{}, createCharacterRig:async()=>({})}), // calibration-required
    // 7) rig 경로: mock createCharacterRig 가 유효 {mode,direction}로 update 호출받는지
    (async()=>{
      let got=null; const mockRig={object3d:{}, update:(dt,o)=>{got=o;return {};}, snapshot:()=>({}), dispose:()=>{}};
      const ad=await createEnemyRigAdapter({r:16,facing:-Math.PI/2,s:'eChase',speed:2},
        {rigIdFor:()=>'warrior', THREE:{SkinnedMesh:1,Bone:1,Skeleton:1}, worldUnitsPerPx:0.012, createCharacterRig:async()=>mockRig});
      const r=ad.kind==='rig'?ad.sync(0.016,{r:16,facing:-Math.PI/2,s:'eChase'}):null;
      return {ad,got,r};
    })(),
  ]).then(([f1,f2,f3,rigCase])=>{
    ok('fallback-no-rig', f1.kind==='fallback-2d'&&f1.reason==='no-rig', f1.reason);
    ok('fallback-no-three', f2.kind==='fallback-2d'&&f2.reason==='no-three-runtime', f2.reason);
    ok('fallback-calibration', f3.kind==='fallback-2d'&&f3.reason==='calibration-required', f3.reason);
    ok('rig-sync-valid-contract',
       rigCase.ad.kind==='rig' && rigCase.got && RIG_MODES.includes(rigCase.got.mode) &&
       Number.isInteger(rigCase.got.direction) && rigCase.got.direction>=0 && rigCase.got.direction<8 && rigCase.got.mode==='walk' && rigCase.got.direction===4,
       rigCase.got?`mode=${rigCase.got.mode} dir=${rigCase.got.direction}`:'no update');
    const pass=out.filter(c=>c.pass).length;
    return {pass, fail:out.length-pass, total:out.length, checks:out};
  });
}

function _isMain(){ return (typeof process!=='undefined') && process.argv && process.argv[1] &&
  (import.meta.url===`file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].split('/').pop())); }
if(_isMain()){
  verify().then(r=>{
    console.log('── CH1 2.5D ENEMY display adapter 검증 ──');
    for(const c of r.checks) console.log(`${c.pass?'PASS':'FAIL'}  ${c.n}  ${c.m}`);
    console.log(`\n총 ${r.total}  PASS ${r.pass}  FAIL ${r.fail}`);
    console.log('일반 적 rig: 없음(전부 fallback-2d) / spawn·AI·수치 변경 0 / height=CALIBRATION_REQUIRED(worldUnitsPerPx)');
    process.exit(r.fail?1:0);
  });
}

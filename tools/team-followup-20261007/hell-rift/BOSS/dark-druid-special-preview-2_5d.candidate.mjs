// dark-druid-special-preview-2_5d.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-RIFT-QUALITY-NOW-20261007-SPECIAL-PREVIEW / ROLE BOSS / UUID 72ba2963-…
// COMMON_GOAL CH1-RIFT-QUALITY-NOW-20261007
// OFFICIAL-COMPLETION-ID CH1-RIFT-QUALITY-NOW-20261007-SPECIAL-PREVIEW-CANDIDATE
//
// 기존 다크드루이드 특수모션 시트(dive/emerge/transform/beast)의 **fullSHA·cell·frame·방향**을
// 실제 **표시(display) consumer**에 연결하는 소유 후보. root 채택/표시 통합/동일화면 검수 전
// **미등록·미인수** candidate. source(PNG/game.html/catalog) 읽기 전용, 변경 0.
//
// UNIT1: 시트 fullSHA + 실제 draw cell/frame/방향 → display 지시(drawInstruction).
// UNIT2: 기존 draw 계약(game.html:10577-10589) 대조; foot/referenceHeight는 시트 baked 아님
//   → **UNKNOWN**(추정 0, 런타임 파생 기록). 표시가능(displayReady) vs 미인수(accepted=false) 분리.
//
// 전제·보존: PNG/캐릭터/GLB/collider/combat/pattern/원본 state·flags 변경 0. v3 계약
//   (lastStand=context / 유한 reviving / 정확 state allowlist) 유지 — 이 모듈은 **특수 4시트만**
//   담당하고 비특수 state는 범위 밖(fail-closed). reviving 유한창은 v3 transform-hold 소관.
//
// 실제 source:line 근거(game.html):
//   10512 _loadDruidSheets files={…beast,transform,dive,emerge}
//   10577-10579 cell: sx=round(col*iw/cols), cw=round((col+1)*iw/cols)-sx (dirless: col=frame%cols,row=~~(frame/cols))
//   10559 dive 0→7(min(7,~~(p*8))) / 10560 under=7 / 10561 erupt 7→0(max(0,7-~~(p*8)))
//   10567 emerge prep 0→7 / warn 7→0 ; 10570 transform 0→7(p=1-st2/45) ; 10571 beast frame=dir(8방향,dirless)
//   10535 under 스프라이트 숨김 ; 10580-10585 런타임 scale dw=e.r*spec.dw,dh=e.r*spec.dh,draw(-dw/2,-dh*.86),dive/transform/beast dw=dh*(cw/ch)*1.12
//   catalog 형식: character-rig-catalog.mjs:49-53 {path,x,y,w,h,anchorX,anchorY,referenceHeight}
// PNG fullSHA/pixel dims: 실제 shasum -a256 + IHDR(2026-10-07 확인).
// ─────────────────────────────────────────────────────────────────────────────

export const RIG_ID = 'dark-druid';
export const UNKNOWN = 'UNKNOWN';

// 실제 fullSHA256 + 실제 픽셀 크기(dive/emerge 동일 바이트). draw grid는 game.html 소비와 일치.
export const SHEETS = Object.freeze({
  dive:      { path: 'assets/sprites/boss/boss_dark_druid_dive.png',      fullSHA: '4d154deda10592a655b2504ddcfa186f2e9af443da1146166683c8ad50c506ce', width: 1774, height: 887, cols: 4, rows: 2, dirless: true, cells: 8 },
  emerge:    { path: 'assets/sprites/boss/boss_dark_druid_emerge.png',    fullSHA: '4d154deda10592a655b2504ddcfa186f2e9af443da1146166683c8ad50c506ce', width: 1774, height: 887, cols: 4, rows: 2, dirless: true, cells: 8 },
  transform: { path: 'assets/sprites/boss/boss_dark_druid_transform.png', fullSHA: '7b329ce2d70b9572144391579405029cc74ac07c479b67d73783bea021dc365d', width: 2400, height: 724, cols: 8, rows: 1, dirless: true, cells: 8 },
  beast:     { path: 'assets/sprites/boss/boss_dark_druid_beast.png',     fullSHA: '41cf09b5b90208bf343f13032664bcccbc9d22607a1aa913ab953e257860b8fd', width: 1774, height: 887, cols: 4, rows: 2, dirless: true, cells: 8 },
});

// 특수모션 state(=v3 STATE_CLASS의 특수 7종) → {sheet, seq}. seq=frame 산출 규칙(실 draw 근거).
// kind: 'phaseAsc' 0→7, 'phaseDesc' 7→0, 'fixed7', 'dir'(frame=direction). visible=false는 under만.
export const SPECIAL_STATES = Object.freeze({
  bossDruidDive:  { sheet: 'dive',      seq: 'phaseAsc',  visible: true,  src: 'game.html:10559' },
  bossDruidUnder: { sheet: 'dive',      seq: 'fixed7',    visible: false, src: 'game.html:10560/10535' },
  bossDruidErupt: { sheet: 'dive',      seq: 'phaseDesc', visible: true,  src: 'game.html:10561' },
  bossTelePrep:   { sheet: 'emerge',    seq: 'phaseAsc',  visible: true,  src: 'game.html:10567' },
  bossTeleWarn:   { sheet: 'emerge',    seq: 'phaseDesc', visible: true,  src: 'game.html:10567' },
  bossChargeWind: { sheet: 'transform', seq: 'phaseAsc',  visible: true,  src: 'game.html:10570' },
  bossCharge:     { sheet: 'beast',     seq: 'dir',       visible: true,  src: 'game.html:10571' },
});

const clampPhase = p => Math.max(0, Math.min(1, p));

// game.html:10577-10579와 동일 정수경계 cell. frame 범위 밖 → throw(잘못된 cell 반례).
export function cellRect(sheetId, frame) {
  const s = SHEETS[sheetId];
  if (!s) throw new Error(`UNKNOWN sheet: ${sheetId}`);
  if (!Number.isInteger(frame) || frame < 0 || frame >= s.cells) throw new Error(`frame 범위 오류 ${sheetId}#${frame} (0..${s.cells - 1})`);
  const col = frame % s.cols, row = Math.floor(frame / s.cols);
  const x = Math.round(col * s.width / s.cols), y = Math.round(row * s.height / s.rows);
  const w = Math.round((col + 1) * s.width / s.cols) - x, h = Math.round((row + 1) * s.height / s.rows) - y;
  return Object.freeze({ col, row, x, y, w, h });
}

// state + phase(0..1) + direction(0..7) → frame. 실 draw 규칙 거울. 잘못된 입력 → fail-closed throw.
export function frameForState(state, { phase = 0, direction = 0 } = {}) {
  const sp = SPECIAL_STATES[state];
  if (!sp) throw new Error(`NOT-SPECIAL-MOTION state: ${state}`); // 비특수 state는 범위 밖(v3 소관)
  if (sp.seq === 'dir') {
    if (!Number.isInteger(direction) || direction < 0 || direction > 7) throw new Error(`direction 범위 오류: ${direction}`);
    return direction; // beast: frame=dir (10571)
  }
  if (sp.seq === 'fixed7') return 7;
  const p = clampPhase(phase);
  const asc = Math.min(7, ~~(p * 8));
  return sp.seq === 'phaseDesc' ? Math.max(0, 7 - ~~(p * 8)) : asc;
}

// 실제 표시(display) consumer: state→(sheet,fullSHA,frame,cell,방향) + 표시/미인수 분리.
// foot/referenceHeight는 UNKNOWN(추정 0). visible=false(under)는 billboard 숨김.
export function drawInstruction(state, { phase = 0, direction = 0 } = {}) {
  const sp = SPECIAL_STATES[state];
  if (!sp) return Object.freeze({ state, status: 'NOT-SPECIAL-MOTION', displayReady: false, note: 'v3 일반 state 소관; 이 모듈은 특수 4시트만' });
  const sheet = SHEETS[sp.sheet];
  const frame = frameForState(state, { phase, direction });
  const cell = cellRect(sp.sheet, frame);
  return Object.freeze({
    state, sheet: sp.sheet, path: sheet.path, fullSHA: sheet.fullSHA,
    frame, direction: sp.seq === 'dir' ? direction : null, dirless: sheet.dirless,
    cell,                                   // {col,row,x,y,w,h} — drawImage 소스 rect
    visible: sp.visible,                    // under=false(10535 숨김)
    footAnchor: UNKNOWN,                    // 시트 baked 아님(추정 0)
    referenceHeight: UNKNOWN,               // 런타임 dh=e.r*spec.dh(10580)
    destBasis: 'runtime: dw=e.r*spec.dw; dh=e.r*spec.dh; dive/transform/beast dw=dh*(cw/ch)*1.12; draw(-dw/2,-dh*.86) (game.html:10580-10585)',
    artStatus: 'exists-2d-unregistered',    // 원화 실재·2D 소비, 2.5D catalog 미등록
    catalogRegistered: false,               // root 채택 전
    accepted: false, acceptance: 'PENDING-NOT-ASSESSED', // 미인수: 화면/native 미관측
    displayReady: true,                     // 표시 지시는 계산됨(원화 실재)
    srcLine: sp.src,
  });
}

// ── 순수 stdin 검증(새 반례만; FAIL→nonzero). frame/방향/경계/UNKNOWN/표시·미인수 분리 ──
export function verify() {
  const R = []; const ok = (n, c, d) => R.push({ name: n, ok: !!c, detail: d || '' });
  const throws = fn => { try { fn(); return false; } catch { return true; } };

  // UNIT1: cell/frame/방향 연결
  ok('dive Dive phase0→frame0', frameForState('bossDruidDive', { phase: 0 }) === 0);
  ok('dive Dive phase1→frame7', frameForState('bossDruidDive', { phase: 1 }) === 7);
  ok('dive Under→frame7 & visible false', frameForState('bossDruidUnder') === 7 && drawInstruction('bossDruidUnder').visible === false);
  ok('dive Erupt phase0→7 phase1→0', frameForState('bossDruidErupt', { phase: 0 }) === 7 && frameForState('bossDruidErupt', { phase: 1 }) === 0);
  ok('emerge Prep asc / Warn desc', frameForState('bossTelePrep', { phase: 1 }) === 7 && frameForState('bossTeleWarn', { phase: 1 }) === 0);
  ok('transform Wind phase.5→3 (8셀)', frameForState('bossChargeWind', { phase: 0.5 }) === 4);
  ok('beast frame=direction(5)', frameForState('bossCharge', { direction: 5 }) === 5);
  // cell 정확(실 draw 수치): transform#7 x=2100 w=300 ; dive#5 col1 row1
  const t7 = cellRect('transform', 7), d5 = cellRect('dive', 5);
  ok('transform#7 x=2100 w=300', t7.x === 2100 && t7.w === 300 && t7.col === 7 && t7.row === 0);
  ok('dive#5 col1 row1', d5.col === 1 && d5.row === 1);
  // cell 타일링(gap/overlap 0)
  for (const id of Object.keys(SHEETS)) {
    const s = SHEETS[id]; let rowW = 0; for (let c = 0; c < s.cols; c++) rowW += cellRect(id, c).w;
    let colH = 0; for (let r = 0; r < s.rows; r++) colH += cellRect(id, r * s.cols).h;
    ok(`${id} tiles exactly`, rowW === s.width && colH === s.height, `ΣW=${rowW}/${s.width} ΣH=${colH}/${s.height}`);
  }
  // UNIT2: draw 계약 대조 + UNKNOWN 미추정 + 표시/미인수 분리
  const di = drawInstruction('bossDruidDive', { phase: 0.5 });
  ok('foot/refHeight=UNKNOWN(추정 0)', di.footAnchor === UNKNOWN && di.referenceHeight === UNKNOWN);
  ok('표시가능 vs 미인수 분리', di.displayReady === true && di.accepted === false && di.acceptance === 'PENDING-NOT-ASSESSED');
  ok('artStatus=exists-2d-unregistered & 미등록', di.artStatus === 'exists-2d-unregistered' && di.catalogRegistered === false);
  // fail-closed 반례
  ok('비특수 state→NOT-SPECIAL(throw frame)', throws(() => frameForState('idle')) && drawInstruction('idle').status === 'NOT-SPECIAL-MOTION');
  ok('direction 범위 밖→throw', throws(() => frameForState('bossCharge', { direction: 8 })) && throws(() => frameForState('bossCharge', { direction: -1 })));
  ok('frame 범위 밖 cellRect→throw', throws(() => cellRect('dive', 8)) && throws(() => cellRect('dive', -1)));
  ok('UNKNOWN sheet→throw', throws(() => cellRect('nope', 0)));
  ok('phase clamp(>1→7, <0→0 asc)', frameForState('bossDruidDive', { phase: 9 }) === 7 && frameForState('bossDruidDive', { phase: -9 }) === 0);

  return { ok: R.every(r => r.ok), results: R };
}

// 실 성공 tool: PNG를 읽어 저장된 fullSHA/dims가 실제 디스크와 일치하는지 대조.
export async function verifySheets() {
  const fs = await import('node:fs'); const crypto = await import('node:crypto');
  const url = await import('node:url'); const pathlib = await import('node:path');
  const here = pathlib.dirname(url.fileURLToPath(import.meta.url));
  const root = pathlib.resolve(here, '../../../../'); // → PROJECT_ROOT
  const out = [];
  for (const [id, s] of Object.entries(SHEETS)) {
    try {
      const b = fs.readFileSync(pathlib.join(root, s.path));
      const sha = crypto.createHash('sha256').update(b).digest('hex');
      const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
      out.push({ id, ok: sha === s.fullSHA && w === s.width && h === s.height, sha: sha.slice(0, 12), dims: `${w}x${h}` });
    } catch (e) { out.push({ id, ok: false, error: e.message }); }
  }
  return { ok: out.every(o => o.ok), out };
}

export default { RIG_ID, UNKNOWN, SHEETS, SPECIAL_STATES, cellRect, frameForState, drawInstruction, verify, verifySheets };

const _isMain = (() => { try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; } })();
if (_isMain) {
  const r = verify();
  for (const c of r.results) console.log(`  ${c.ok ? 'OK' : 'FAIL'} ${c.name}${c.detail ? ' :: ' + c.detail : ''}`);
  const d = await verifySheets();
  for (const o of d.out) console.log(`  ${o.ok ? 'OK' : 'FAIL'} disk ${o.id} ${o.error ? ':: ' + o.error : 'sha=' + o.sha + ' ' + o.dims}`);
  const pass = r.ok && d.ok;
  console.log(`verify: ${pass ? 'PASS' : 'FAIL'}`);
  try { process.exitCode = pass ? 0 : 1; } catch { /* ignore */ }
}

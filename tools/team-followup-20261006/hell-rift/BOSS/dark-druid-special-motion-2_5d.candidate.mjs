// dark-druid-special-motion-2_5d.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-BOSS-SPECIAL-MOTION-SOURCE
// ROLE BOSS / UUID 72ba2963-… / COMMON GOAL CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006
// OFFICIAL-COMPLETION-ID CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-BOSS-SPECIAL-MOTION-SOURCE-CANDIDATE
//
// 다크드루이드 특수모션(dive/emerge/transform/beast) **source 매핑** 모듈. root catalog
// 형식(id/asset/frame/cell/footAnchor/height)에 맞춘 소유 후보 — root 채택 전 **미등록**.
// 전용 원화 실재(2D 소비)와 2.5D catalog 등록 여부를 구분. 추정 채움 금지:
//   · 실존 PNG의 asset bounds는 **실제 IHDR에서 읽은 값**(아래 상수) — 바이트/추정 아님.
//   · cell/frame/row는 **실제 draw source**(game.html:10558-10589)의 정수경계 샘플링과 동일.
//   · footAnchor/referenceHeight는 시트에 **baked 안 됨**(런타임 e.r*spec, draw -dw/2,-dh*.86)
//     → **UNKNOWN**로 표기(숫자 추정 0). 실존 안 하는 시트/미확인 metadata 채우지 않음.
//
// PNG/새 캐릭터/대체 bossGLB 생성 0, collider/combat/pattern/원본 state·flags 변경 0.
// v3 계약(lastStand=context / 유한 reviving / 정확 state allowlist) 유지 — 아래 STATE_TO_SHEET는
// v3 STATE_CLASS의 특수모션 state와 정확히 일치.
//
// 실제 source 근거(game.html):
//   10577-10579 cell 샘플: _fc=dirless?frame%cols:frame, _fr=dirless?~~(frame/cols):dir;
//     sx=round(_fc*iw/cols), sy=round(_fr*ih/rows), cw=round((_fc+1)*iw/cols)-sx, ch=round((_fr+1)*ih/rows)-sy
//   10562 dive cols4 rows2 dirless / 10568 emerge cols4 rows2 dirless /
//   10570 transform cols8 rows1 dirless / 10571 beast cols4 rows2 frame=dir(8dir)
//   10559 dive 0→7 / 10560 under 7 / 10561 erupt 7→0 ; 10567 emerge prep0→7/warn7→0
//   10580-10585 런타임 scale: dw=e.r*spec.dw, dh=e.r*spec.dh; dive/transform/beast dw=dh*(cw/ch)*1.12; draw(-dw/2,-dh*.86)
//   catalog 형식 근거: character-rig-catalog.mjs:49-53 rectangle()→{path,x,y,w,h,anchorX,anchorY,referenceHeight}; :36 dark-druid assets=[idle,walk,attack]
// ─────────────────────────────────────────────────────────────────────────────

export const RIG_ID = 'dark-druid';
export const UNKNOWN = 'UNKNOWN';

// 실제 PNG IHDR에서 읽은 픽셀 크기(2026-10-06 확인). bytes/sha도 실제값.
// dive/emerge는 동일 바이트(sha 4d154ded…) — 같은 시트, 역순 재생.
export const SPECIAL_MOTION = Object.freeze({
  dive: Object.freeze({
    asset: { path: 'assets/sprites/boss/boss_dark_druid_dive.png', width: 1774, height: 887, bytes: 2609546, sha256: '4d154deda105' },
    grid: { cols: 4, rows: 2, dirless: true, cells: 8 },
    consumedAt: 'game.html:10558', // 10559 dive 0→7 / 10560 under frame7 / 10561 erupt 7→0
    states: { bossDruidDive: '0→7', bossDruidUnder: '7', bossDruidErupt: '7→0' },
    footAnchor: UNKNOWN,       // 시트 baked 없음 — 런타임 draw(-dw/2,-dh*.86). 추정 0.
    referenceHeight: UNKNOWN,  // 런타임 dh=e.r*spec.dh (10580). 추정 0.
    sourceScaleBasis: 'dw=dh*(cw/ch)*1.12; dh=e.r*spec.dh; draw anchor(-dw/2,-dh*.86) (game.html:10581/10585)',
  }),
  emerge: Object.freeze({
    asset: { path: 'assets/sprites/boss/boss_dark_druid_emerge.png', width: 1774, height: 887, bytes: 2609546, sha256: '4d154deda105' },
    grid: { cols: 4, rows: 2, dirless: true, cells: 8 },
    consumedAt: 'game.html:10564', // 10567 prep 0→7 / warn 7→0
    states: { bossTelePrep: '0→7', bossTeleWarn: '7→0' },
    footAnchor: UNKNOWN, referenceHeight: UNKNOWN,
    sourceScaleBasis: 'dw=e.r*spec.dw; dh=e.r*spec.dh; draw anchor(-dw/2,-dh*.86) (game.html:10580/10585)',
  }),
  transform: Object.freeze({
    asset: { path: 'assets/sprites/boss/boss_dark_druid_transform.png', width: 2400, height: 724, bytes: 1634653, sha256: '7b329ce2d70b' },
    grid: { cols: 8, rows: 1, dirless: true, cells: 8 },
    consumedAt: 'game.html:10570', // 0→7 서있는→야수
    states: { bossChargeWind: '0→7' },
    footAnchor: UNKNOWN, referenceHeight: UNKNOWN,
    sourceScaleBasis: 'dw=dh*(cw/ch)*1.12; dh=e.r*spec.dh; draw anchor(-dw/2,-dh*.86) (game.html:10581/10585)',
  }),
  beast: Object.freeze({
    asset: { path: 'assets/sprites/boss/boss_dark_druid_beast.png', width: 1774, height: 887, bytes: 1788236, sha256: '41cf09b5b902' },
    grid: { cols: 4, rows: 2, dirless: true, cells: 8 }, // 셀=방향(frame=dir), 렌더에선 dirless 샘플이나 의미상 8방향
    consumedAt: 'game.html:10571', // frame=dir 8방향 야수
    states: { bossCharge: 'dir(0..7)' },
    footAnchor: UNKNOWN, referenceHeight: UNKNOWN,
    sourceScaleBasis: 'dw=dh*(cw/ch)*1.12; dh=e.r*spec.dh; draw anchor(-dw/2,-dh*.86) (game.html:10581/10585)',
  }),
});

// v3 STATE_CLASS 특수모션 state ↔ 시트 (정확 일치, 추정 없음).
export const STATE_TO_SHEET = Object.freeze({
  bossDruidDive: 'dive', bossDruidUnder: 'dive', bossDruidErupt: 'dive',
  bossTelePrep: 'emerge', bossTeleWarn: 'emerge',
  bossChargeWind: 'transform', bossCharge: 'beast',
});

// game.html:10577-10579와 동일한 정수경계 cell 샘플링. frame 범위 밖 → throw(잘못된 cell 반례).
export function cellRect(sheetId, frameIndex) {
  const s = SPECIAL_MOTION[sheetId];
  if (!s) throw new Error(`UNKNOWN sheet: ${sheetId}`);
  const { cols, rows, cells } = s.grid, { width: iw, height: ih } = s.asset;
  if (!Number.isInteger(frameIndex) || frameIndex < 0 || frameIndex >= cells) throw new Error(`frame 범위 오류 ${sheetId}#${frameIndex} (0..${cells - 1})`);
  const col = frameIndex % cols, row = Math.floor(frameIndex / cols);
  const x = Math.round(col * iw / cols), y = Math.round(row * ih / rows);
  const w = Math.round((col + 1) * iw / cols) - x, h = Math.round((row + 1) * ih / rows) - y;
  return Object.freeze({ path: s.asset.path, col, row, x, y, w, h });
}

// root catalog 형식 후보(미등록). footAnchor/referenceHeight는 UNKNOWN 유지(추정 0).
export function toCatalogCandidate(sheetId) {
  const s = SPECIAL_MOTION[sheetId];
  if (!s) throw new Error(`UNKNOWN sheet: ${sheetId}`);
  const cellBounds = [];
  for (let i = 0; i < s.grid.cells; i++) cellBounds.push(cellRect(sheetId, i));
  return Object.freeze({
    id: RIG_ID, sheet: sheetId,
    asset: s.asset, grid: s.grid, states: s.states,
    frames: s.grid.cells,
    cellBounds: Object.freeze(cellBounds),
    footAnchor: s.footAnchor,            // UNKNOWN — 시트 미baked, 런타임 파생
    referenceHeight: s.referenceHeight,  // UNKNOWN
    sourceScaleBasis: s.sourceScaleBasis,
    artStatus: 'exists-2d-unregistered', // 원화 실재·2D 소비, 2.5D catalog 미등록
    catalogRegistered: false,            // root 채택 전 후보
  });
}

// 공급된 anchor가 셀 경계 안인지 검증(잘못된 anchor 반례). 시트 baked UNKNOWN이면 비교불가→null.
export function validateAnchor(sheetId, frameIndex, anchorX, anchorY) {
  const r = cellRect(sheetId, frameIndex);
  if (!Number.isFinite(anchorX) || !Number.isFinite(anchorY)) return { ok: false, reason: 'anchor not finite' };
  const inside = anchorX >= 0 && anchorX <= r.w && anchorY >= 0 && anchorY <= r.h;
  return { ok: inside, reason: inside ? '' : `anchor out of cell bounds (w=${r.w},h=${r.h})`, bakedAnchor: UNKNOWN };
}

// ── 순수 stdin 검증: frame/asset bounds·UNKNOWN metadata·잘못된 cell/anchor 반례(새 검사만) ──
export function verify() {
  const R = []; const ok = (n, c, d) => R.push({ name: n, ok: !!c, detail: d || '' });

  // 1) asset bounds = 실제 IHDR 값(>0), grid cells=cols*rows
  for (const [id, s] of Object.entries(SPECIAL_MOTION)) {
    ok(`${id} asset>0 & grid cells=cols*rows`, s.asset.width > 0 && s.asset.height > 0 && s.grid.cells === s.grid.cols * s.grid.rows, `${s.asset.width}x${s.asset.height}`);
    ok(`${id} footAnchor/height=UNKNOWN(추정 0)`, s.footAnchor === UNKNOWN && s.referenceHeight === UNKNOWN);
  }
  // 2) cell 타일링: 한 행의 셀 폭 합 = iw, 한 열의 셀 높이 합 = ih (gap/overlap 0)
  for (const [id, s] of Object.entries(SPECIAL_MOTION)) {
    const { cols, rows } = s.grid, iw = s.asset.width, ih = s.asset.height;
    let rowW = 0; for (let c = 0; c < cols; c++) rowW += cellRect(id, c).w;
    let colH = 0; for (let r = 0; r < rows; r++) colH += cellRect(id, r * cols).h;
    ok(`${id} cells tile exactly (ΣW=iw, ΣH=ih)`, rowW === iw && colH === ih, `ΣW=${rowW}/${iw} ΣH=${colH}/${ih}`);
  }
  // 3) 잘못된 cell 반례: 범위 밖 frame → throw
  const throws = (fn) => { try { fn(); return false; } catch { return true; } };
  ok('frame -1 → throw', throws(() => cellRect('dive', -1)));
  ok('frame=cells(8) → throw', throws(() => cellRect('dive', 8)));
  ok('frame 8.5 → throw', throws(() => cellRect('transform', 8.5)));
  ok('UNKNOWN sheet → throw', throws(() => cellRect('nope', 0)));
  // 4) transform 8x1 정확 셀(실제 draw 수치)
  const t7 = cellRect('transform', 7);
  ok('transform#7 col7/row0 w=300', t7.col === 7 && t7.row === 0 && t7.w === 300 && t7.x === 2100, `${t7.x},${t7.w}`);
  // dive 4x2 frame5 → col1,row1
  const d5 = cellRect('dive', 5);
  ok('dive#5 col1/row1', d5.col === 1 && d5.row === 1);
  // 5) 잘못된 anchor 반례: 셀 밖/비유한 → ok:false; baked는 UNKNOWN
  ok('anchor out-of-bounds → ok:false', validateAnchor('dive', 0, 99999, 0).ok === false);
  ok('anchor NaN → ok:false', validateAnchor('dive', 0, NaN, 10).ok === false);
  ok('anchor baked=UNKNOWN(비교불가 표기)', validateAnchor('dive', 0, 10, 10).bakedAnchor === UNKNOWN);
  // 6) STATE_TO_SHEET는 v3 특수모션 state와 정확 일치(추정 state 없음)
  const expect = ['bossDruidDive', 'bossDruidUnder', 'bossDruidErupt', 'bossTelePrep', 'bossTeleWarn', 'bossChargeWind', 'bossCharge'].sort().join(',');
  ok('STATE_TO_SHEET = v3 특수모션 allowlist', Object.keys(STATE_TO_SHEET).sort().join(',') === expect);
  // 7) toCatalogCandidate: 미등록 + footAnchor UNKNOWN + cellBounds=frames
  const cc = toCatalogCandidate('beast');
  ok('catalog candidate: 미등록+UNKNOWN anchor+cellBounds', cc.catalogRegistered === false && cc.footAnchor === UNKNOWN && cc.cellBounds.length === cc.frames);

  return { ok: R.every(r => r.ok), results: R };
}

export default { RIG_ID, UNKNOWN, SPECIAL_MOTION, STATE_TO_SHEET, cellRect, toCatalogCandidate, validateAnchor, verify };

const _isMain = (() => { try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; } })();
if (_isMain) {
  const r = verify();
  for (const c of r.results) console.log(`  ${c.ok ? 'OK' : 'FAIL'} ${c.name}${c.detail ? ' :: ' + c.detail : ''}`);
  console.log(`verify: ${r.ok ? 'PASS' : 'FAIL'}`);
  try { process.exitCode = r.ok ? 0 : 1; } catch { /* ignore */ }
}

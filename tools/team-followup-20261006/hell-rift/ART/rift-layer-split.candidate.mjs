/* ============================================================================
 * rift-layer-split.candidate.mjs
 * TASK CLAUDE8-PROD-ART-20261006-0220  ·  endID ART-RIFT-LAYER-SPLIT-CANDIDATE-20261006
 *
 * PURPOSE
 *   지옥의 틈 원화(painterly-v2, 1920²)에 "구워진" 고정 큰 인물(망자) 2기와 기존
 *   플레이어(전사, 7-tile 스프라이트)의 시각 크기·접지·가림 불일치를 푸는 후보.
 *   원화 원본을 변경하지 않고, 런타임 클립 마스크로 인물 영역을 독립 레이어처럼
 *   합성/깊이정렬하는 데이터·함수를 제공한다. 새 캐릭터·이미지 산출 0.
 *
 * 두 모드
 *   MODE_OVERLAY (now, 비이미지)  : 구워진 인물을 그대로 두고 footline 기준 깊이
 *       정렬만 추가. 플레이어가 인물보다 북(뒤)일 때 원화에서 인물 영역을 클립해
 *       플레이어 위에 다시 그린다 → 전사가 큰 인물 앞을 잘못 덮는 문제 해소.
 *       (hell-rift-depth.js `fronts`/`foreground()`와 동일 기법, source 수정 0)
 *   MODE_SPLIT_CLEANPLATE (held)  : 구워진 인물을 들어내고 뒤의 구멍을 메워 플레이어
 *       스케일 NPC로 교체. 구멍 메우기 = 공식 imagegen 작업 → 사용자 승인 전까지
 *       보류(HELD). 본 파일은 그 영역/사유만 기술하고 픽셀을 칠하지 않는다.
 *
 * 절대 하지 않는 것
 *   - 원화/scene/depth 소스 수정 0. Python/Canvas 등으로 픽셀 편집 0.
 *   - 구멍이 "원화 색으로 복원됐다"는 주장 0 (cleanPlate.fill은 null, 상태 HELD).
 *   - 승인 필요한 imagegen을 우회하지 않음.
 * ========================================================================== */
'use strict';

/* ---- 불변 상수 (코드/문서 핀) ------------------------------------------- */
export const WORLD = Object.freeze({ cols: 200, rows: 200, tileSize: 40, px: 8000 });
export const ART = Object.freeze({ w: 1920, h: 1920, worldPerArtPx: 8000 / 1920 }); // 25/6 ≈ 4.16667

export const SOURCE_PINS = Object.freeze({
  painting:  'a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4', // hell-rift-painterly-v2.png (scene.sourcePins.painting 일치 = 원본 불변)
  abyss:     'ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991',
  sceneJson: 'f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac', // hell-rift.scene.json
  depthJs:   '3fdcd297131a193b1a454bc6a40bdfe94b7343bce5134a65a172b4b812d63dd0', // tools/hell-rift-depth.js
  nav:       'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
});

/* ---- 기존 플레이어(전사) 접지/크기 기준 (hell-rift-depth.js + 에디터 SSOT) --- */
export const PLAYER = Object.freeze({
  sheet: 'img/exoduser_warrior/<dir>.png', dirs: 8, sheetPx: [1008, 48], cell: 48,
  // depth.js actor(): size=7*scale(=7 tiles), foot=player.y, topLeftY=y-size*0.88, shadow ellipse .8×.3 tile
  spriteTiles: 7, footAnchorFracY: 0.88, shadowTile: { rx: 0.8, ry: 0.3 },
  // 에디터 SSOT actor 계약: 고정 80/29 배율, source foot row 43/48
  editorScale: 80 / 29, sourceFootRow: 43 / 48,
  worldFootprint: Object.freeze({ bodyTilesTall: 7, bodyWorldPxTall: 280, shadowWorldRx: 32, shadowWorldRy: 12 }),
});

/* ---- 고정 큰 인물 2기 (원화에 구워짐) -----------------------------------
 * anchor/footTile = 정확(scene 카메라 + MAP_CANDIDATE 랜드마크 좌표 일치).
 * artPx = 25/6 역매핑으로 산출한 발 지점(정확).
 * bboxTiles / maskPoly / estHeightTiles = 추정(APPROX) — 실제 실루엣은 원화 육안
 * 트레이스가 있어야 확정. traceNeeded=true 로 미검증 표시.
 * ------------------------------------------------------------------------ */
function footArtPx(wx, wy) { return [+(wx / ART.worldPerArtPx).toFixed(1), +(wy / ART.worldPerArtPx).toFixed(1)]; }
function octagon(cx, cy, hw, hh) { // bbox 중심(cx,cy) 반폭/반높이 → 8각 placeholder 폴리곤(타일)
  const kx = hw * 0.41, ky = hh * 0.41;
  return [[cx - kx, cy - hh], [cx + kx, cy - hh], [cx + hw, cy - ky], [cx + hw, cy + ky],
          [cx + kx, cy + hh], [cx - kx, cy + hh], [cx - hw, cy + ky], [cx - hw, cy - ky]];
}
function makeFigure(id, role, worldFoot, bboxTiles) {
  const [fx, fy] = worldFoot;                       // world px 발 지점
  const footTile = +(fy / WORLD.tileSize).toFixed(2);
  const cxT = fx / WORLD.tileSize, botT = fy / WORLD.tileSize;
  const hwT = bboxTiles.w / 2, hhT = bboxTiles.h / 2, cyT = botT - hhT;
  return Object.freeze({
    id, role,
    worldFoot: Object.freeze({ x: fx, y: fy }),
    footTile,                                        // 깊이정렬 기준선 (정확)
    artFootPx: Object.freeze(footArtPx(fx, fy)),     // 원화 1920² 발 좌표 (정확)
    // 아래는 추정 영역/마스크 — 확정 전
    bboxTiles: Object.freeze({ x0: cxT - hwT, y0: botT - bboxTiles.h, x1: cxT + hwT, y1: botT }),
    maskPolyTiles: Object.freeze(octagon(cxT, cyT, hwT, hhT).map(p => Object.freeze(p))),
    estHeightTiles: bboxTiles.h, estHeightWorldPx: bboxTiles.h * WORLD.tileSize,
    estVsPlayer: +(bboxTiles.h / PLAYER.spriteTiles).toFixed(2), // 플레이어 7-tile 대비 배수(추정)
    approx: true, traceNeeded: true,
  });
}
export const FIXED_FIGURES = Object.freeze([
  // 멈춘 망자의 턱 / gift(양도) — scene cam-2 world(1580,4900) = tile(39.5,122.5) = MAP_CANDIDATE (39,122)
  makeFigure('fig-gift', 'gift', [1580, 4900], { w: 6, h: 16 }),
  // 부탁을 품은 턱 / request(구출) — scene cam-4 world(5820,4660) = tile(145.5,116.5) = MAP_CANDIDATE (145,116)
  makeFigure('fig-request', 'request', [5820, 4660], { w: 6, h: 16 }),
]);

/* ---- clean-plate(구멍) 사양 — 보류(HELD), 픽셀 미작성 --------------------- */
export const CLEAN_PLATE = Object.freeze(FIXED_FIGURES.map(f => Object.freeze({
  figureId: f.id,
  requiredFor: 'MODE_SPLIT_CLEANPLATE (구워진 인물을 들어내 플레이어 스케일 NPC로 교체할 때만)',
  // 구멍 = 인물 bbox의 world 영역(추정). 실제 메우기는 하지 않는다.
  holeRegionWorld: Object.freeze({
    x0: f.bboxTiles.x0 * WORLD.tileSize, y0: f.bboxTiles.y0 * WORLD.tileSize,
    x1: f.bboxTiles.x1 * WORLD.tileSize, y1: f.bboxTiles.y1 * WORLD.tileSize,
  }),
  fill: null,                                   // ← 구멍을 메운 데이터 없음
  status: 'HELD_PENDING_IMAGEGEN_APPROVAL',
  reason: '구멍 뒤 지면/절벽 복원은 공식 imagegen/API 작업이며 직접 인간 승인/자동거절 대상. '
        + '우회(Python/Canvas 픽셀 페인트) 금지. 승인 후 별도 root 계획으로만 진행.',
  claimRestoredWithOriginalColors: false,       // 원화 색 복원 주장 금지
})));

/* ---- 렌더러 적용 순서 ---------------------------------------------------- */
// 기존 depth.js layerOrder에 'rift-fixed-figure-front'를 전사 뒤에 삽입(=footline foreground와 동형).
export const LAYER_ORDER_BASE = Object.freeze([
  'painted-terrain', 'far-abyss-in-fissure', 'contact-shadow',
  'existing-warrior', 'footline-foreground', 'fissure-mist',
]);
export function applyOrder() {
  const o = [...LAYER_ORDER_BASE];
  o.splice(o.indexOf('existing-warrior') + 1, 0, 'rift-fixed-figure-front');
  return Object.freeze(o);
}

/* ---- 기하 유틸 (depth.js와 동일 규약: view={ox,oy,scale}, 타일좌표) -------- */
export function pointInPoly(x, y, poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
  }
  return hit;
}
export function figureWorldBox(fig) {
  return { x: fig.bboxTiles.x0 * WORLD.tileSize, y: fig.bboxTiles.y0 * WORLD.tileSize,
           w: (fig.bboxTiles.x1 - fig.bboxTiles.x0) * WORLD.tileSize,
           h: (fig.bboxTiles.y1 - fig.bboxTiles.y0) * WORLD.tileSize };
}
// 깊이 판정: 플레이어가 인물 발선보다 북(y<foot)이면 인물이 앞(플레이어를 가림).
export function playerDepthVsFigure(player, fig) {
  return (player.y / WORLD.tileSize) < fig.footTile ? 'figure-front' : 'figure-back';
}

/* ---- MODE_OVERLAY 적용 함수 (비이미지, 원본 불변) ------------------------
 * depth.js foreground()와 동일하게 원화(art)에서 인물 폴리곤 영역만 클립해 다시
 * 그린다. 플레이어가 뒤(북)일 때만 그리며, 겹치면 .38로 페이드(발밑 가독 확보).
 * art = 이미 그려진 원화 레이어와 같은 소스(미수정). 어떤 픽셀도 새로 칠하지 않음.
 * ------------------------------------------------------------------------ */
export function drawFiguresOverlay(ctx, art, view, player, { figures = FIXED_FIGURES, fadeOverlap = 0.38 } = {}) {
  let drawn = 0, faded = 0;
  for (const fig of figures) {
    if (playerDepthVsFigure(player, fig) !== 'figure-front') continue; // 플레이어가 앞이면 구워진 배경이 뒤에 그대로 → 추가 그리기 불필요
    const poly = fig.maskPolyTiles;
    const px = player.x / WORLD.tileSize, py = player.y / WORLD.tileSize;
    const overlap = [0.8, 2, 3.5, 5].some(dy => pointInPoly(px, py - dy / 1, poly));
    ctx.save();
    ctx.beginPath();
    poly.forEach((p, i) => { const X = view.ox + p[0] * view.scale, Y = view.oy + p[1] * view.scale; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
    ctx.closePath(); ctx.clip();
    ctx.globalAlpha = overlap ? fadeOverlap : 1;
    ctx.drawImage(art, view.ox, view.oy, WORLD.cols * view.scale, WORLD.rows * view.scale); // 미수정 원화에서 클립 영역만
    ctx.restore();
    drawn++; if (overlap) faded++;
  }
  return { drawn, faded };
}

/* ---- 자기검증 (stdin 전용, 파일 산출 없음) -------------------------------- */
export function validate() {
  const errs = [];
  for (const f of FIXED_FIGURES) {
    const [ax, ay] = f.artFootPx;
    if (Math.abs(ax - f.worldFoot.x / ART.worldPerArtPx) > 0.2) errs.push(`${f.id} artFootPx x`);
    if (f.footTile !== +(f.worldFoot.y / WORLD.tileSize).toFixed(2)) errs.push(`${f.id} footTile`);
    if (f.maskPolyTiles.length !== 8) errs.push(`${f.id} poly!=8`);
    if (ax < 0 || ax > ART.w || ay < 0 || ay > ART.h) errs.push(`${f.id} artPx out of 1920²`);
  }
  if (CLEAN_PLATE.some(c => c.fill !== null)) errs.push('cleanPlate.fill must be null (HELD)');
  if (CLEAN_PLATE.some(c => c.claimRestoredWithOriginalColors)) errs.push('must not claim original-color restore');
  if (!applyOrder().includes('rift-fixed-figure-front')) errs.push('layer insert missing');
  return { ok: errs.length === 0, errs, figures: FIXED_FIGURES.length,
           order: applyOrder(), cleanPlateStatus: CLEAN_PLATE.map(c => c.status) };
}

export default { WORLD, ART, SOURCE_PINS, PLAYER, FIXED_FIGURES, CLEAN_PLATE,
  LAYER_ORDER_BASE, applyOrder, pointInPoly, figureWorldBox, playerDepthVsFigure,
  drawFiguresOverlay, validate };

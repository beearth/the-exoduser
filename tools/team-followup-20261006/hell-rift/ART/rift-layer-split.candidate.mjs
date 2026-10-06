/* ============================================================================
 * rift-layer-split.candidate.mjs   (ART owned candidate — modify-only)
 * TASK CLAUDE8-RESIDENT-ART-20261006-0324
 * endID ROOTRESIDENT-ROLE-FOLLOWUP-20261006
 * consumer: root ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006
 *
 * WHAT THIS IS
 *   지옥의 틈 "독립 주민 레이어" 후보(c508 scene)를 소비하는 **순수 계획·검증
 *   adapter**. 1254² clean-plate + 1254² RGBA atlas(2×2 정적 주민4)와 각 주민의
 *   atlas crop·standing80/seated 비례·foot pivot(.5,1)·현재 foot/approach 좌표를
 *   계획값으로 들고, 유한값/비율/핀을 **거절 검증**한다. 캔버스 렌더·픽셀 추출·
 *   이미지 산출은 하지 않는다(소비자/ANIMVFX 소관).
 *
 * 설계 근거(root 동기화 대상 docs)
 *   - CH1_1_A_GRADE_PRODUCTION_20261005.md §16 (ART row: 기존인물 참조·원본보존·
 *     clean plate·player80 기준 크기/foot/alpha, c508 대조, 픽셀정확추출 표기0,
 *     이전 camera POI/280px body/근사8각mask 보류)
 *   - MAP_SCENE_EDITOR_20261005.md §12 (독립 주민 배경·body·대화 편집 계약 표)
 *   - HELL_RIFT_EDITOR_RESULT_20261006.md (원화 분리/크기정합 NEXT PASS)
 *   - 맵/접지/camera/충돌/QA 수치는 EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9 +
 *     _MAP_SSOT_INDEX 소관이며, 본 adapter는 그것들을 **구현하지 않고 미완료로 명시**.
 *
 * 금지/보류 (절대)
 *   - 원본 painting/abyss/결과씬 byte 불변. 파생(plate/atlas)은 "정확 픽셀 추출"이
 *     아니며 exact 원본 identity를 주장하지 않는다.
 *   - bbox는 atlas alpha>8 경계일 뿐 **해부학적 발뼈/애니메이션/높이 물리 규격이
 *     아니다**. foot(.5,1)은 **선언된 배치 pivot**이지 측정된 발이 아니다.
 *   - 이전 280px body / camera POI / 근사 8각 마스크를 실제 발로 쓰지 않는다(보류).
 *   - 새 PNG·이미지 생성·PixelLab 0. ART 인간승인/자동거절 imagegen·ANIM decoder 보류 유지, 우회 0.
 *   - 접지 그림자/고해상 재질/주민 애니메이션/높이 모델 = 미완료. 채택 0(notAdopted).
 * ========================================================================== */
'use strict';

export const WORLD = Object.freeze({ cols: 200, rows: 200, tileSize: 40, px: 8000 });
// 파생 에셋/원화 매핑: source 1254² ← 원화 1920² ×(1254/1920=209/320); world ← source ×(8000/1254)
export const SOURCE_SPACE = Object.freeze({
  size: 1254, worldPerSourcePixel: 8000 / 1254, artToSourceScale: 1254 / 1920, // 0.653125 = 209/320
});

export const SOURCE_PINS = Object.freeze({
  painting:      'a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4', // 원본 불변
  abyss:         'ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991',
  resultScene:   'f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac',
  residentScene: 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a', // v2 (현재 검수 대상)
  cleanPlate:    'aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673', // 1254²
  residentAtlas: 'ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38', // 1254² RGBA
  originalNav:   '52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb',
  nav:           'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
  strictModule:  '0a04ff1f502ef77604a5eb7e8b194c2eb48c5fea8f7abb12e936f8ade33428a3', // tools/map-scene-rift-residents.mjs (상위 계약)
  editor:        '9250f66d8f14acc1699e114bdf861660267434d6581af6c6d0849a71bf6bba70',
});
// 상위 strict 계약 위치 (본 adapter는 중복 구현 아님; 교차검증 시 주입)
export const STRICT_MODULE_PATH = '../../../map-scene-rift-residents.mjs';
export const NAV_LOCK = Object.freeze({ walkableCount: 1192, radius: 12, bfs: 1185 }); // 불변

// 기존 플레이어(전사) 크기 기준 — 주민 원근 비교용 (hell-rift-depth.js / 에디터 SSOT)
export const PLAYER = Object.freeze({ bodyWorldPxTall: 280, spriteTiles: 7, editorScale: 80 / 29, sourceFootRow: 43 / 48 });

/* ---- 주민 4 계획값 (MAP_SCENE_EDITOR §12 표와 1:1, 모두 정확) --------------
 * crop = atlas(1254²) alpha>8 bbox 영역 (해부학적 발 아님).
 * foot = body object 현재 x/y (= logical/visual foot, labelHeight=height).
 * approach = §12 검수 고정 좌표 (body 이동해도 자동 재배치 안 함).
 * pose: standing(height80) | seated(berin, height=80*352/578).
 * width = height × crop.w/crop.h.
 * ------------------------------------------------------------------------ */
const STANDING_H = 80;
function mk(id, npcId, pose, crop, foot, approach) {
  const h = pose === 'seated' ? STANDING_H * 352 / 578 : STANDING_H;
  const w = h * crop.w / crop.h;
  return Object.freeze({
    id, npcId, pose,
    crop: Object.freeze(crop), foot: Object.freeze(foot), approach: Object.freeze(approach),
    width: w, height: h, aspect: crop.w / crop.h, pivot: Object.freeze({ x: 0.5, y: 1 }),
  });
}
export const RESIDENTS = Object.freeze([
  mk('resident-haran', 'rift-rest-haran',    'standing', { x: 169, y: 27,  w: 350, h: 578 }, { x: 4660, y: 6660 }, { x: 4660, y: 6700 }),
  mk('resident-berin', 'rift-gift-berin',    'seated',   { x: 748, y: 257, w: 363, h: 352 }, { x: 6020, y: 5580 }, { x: 5980, y: 5620 }),
  mk('resident-nessa', 'rift-request-nessa', 'standing', { x: 197, y: 660, w: 262, h: 547 }, { x: 6300, y: 5020 }, { x: 6220, y: 5020 }),
  mk('resident-dorik', 'rift-prepare-dorik', 'standing', { x: 813, y: 742, w: 240, h: 465 }, { x: 5220, y: 2500 }, { x: 5180, y: 2540 }),
]);

/* ---- 미완료/보류/비주장 명시 (ART 소관 경계) ----------------------------- */
export const COMPLETION_NOTES = Object.freeze({
  bboxBasis: 'atlas alpha>8 경계. 해부학적 발뼈/애니메이션/높이 물리 아님.',
  footPivot: 'foot(.5,1) = 선언된 배치 pivot(바닥중심). 측정된 발 접지점이 아님.',
  grounding: 'INCOMPLETE — 접지 그림자/바닥 정합 미구현.',
  material:  'INCOMPLETE — 고해상 재질/파생 인물 재질 미구현.',
  animation: 'INCOMPLETE — 주민 애니메이션 미구현 (현재 2×2 정적 4).',
  retired:   '이전 280px body / camera POI / 근사 8각 마스크 = 보류, 실제 발로 사용 안 함.',
  identity:  '파생 plate/atlas는 정확 픽셀 추출이 아니며 exact 원본 identity 주장 안 함.',
  generation:'새 PNG/이미지 생성/PixelLab 0. 원본 byte 불변.',
  adoption:  'notAdopted = true. fixture PASS ≠ 본편/native/청취/A급.',
});

/* ---- 거절 검증 (유한값/비율/핀/월드범위) --------------------------------- */
const finite = v => typeof v === 'number' && Number.isFinite(v);
const inWorld = v => finite(v) && v >= 0 && v < WORLD.px;

export function validatePlan({ tol = 1e-9 } = {}) {
  const rejects = [];
  if (SOURCE_SPACE.size !== 1254) rejects.push('source size != 1254');
  for (const r of RESIDENTS) {
    const c = r.crop;
    // crop 유한·1254² 내부
    if (![c.x, c.y, c.w, c.h].every(finite) || c.w <= 0 || c.h <= 0 ||
        c.x < 0 || c.y < 0 || c.x + c.w > SOURCE_SPACE.size || c.y + c.h > SOURCE_SPACE.size)
      rejects.push(`${r.id}: crop out of 1254² or non-finite`);
    // 크기·비율
    if (!finite(r.width) || !finite(r.height) || r.height < 1 || r.height > 32000) rejects.push(`${r.id}: height out of [1,32000]`);
    if (Math.abs(r.width / r.height - c.w / c.h) > 1e-6) rejects.push(`${r.id}: width/height != crop aspect`);
    const expH = r.pose === 'seated' ? STANDING_H * 352 / 578 : STANDING_H;
    if (Math.abs(r.height - expH) > tol) rejects.push(`${r.id}: height != pose spec (${expH})`);
    // foot / approach 월드 유한·범위
    if (!inWorld(r.foot.x) || !inWorld(r.foot.y)) rejects.push(`${r.id}: foot out of world`);
    if (!inWorld(r.approach.x) || !inWorld(r.approach.y)) rejects.push(`${r.id}: approach out of world`);
    // pivot 고정
    if (r.pivot.x !== 0.5 || r.pivot.y !== 1) rejects.push(`${r.id}: pivot != (.5,1)`);
  }
  // atlas crop 겹침 경고(2×2 정적 4 — 겹치면 거절)
  for (let i = 0; i < RESIDENTS.length; i++) for (let j = i + 1; j < RESIDENTS.length; j++) {
    const a = RESIDENTS[i].crop, b = RESIDENTS[j].crop;
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)
      rejects.push(`crop overlap ${RESIDENTS[i].id}∩${RESIDENTS[j].id}`);
  }
  return { ok: rejects.length === 0, rejects, residents: RESIDENTS.length };
}

/* ---- scene 교차검증 (c508) — 상위 strict profile 주입 가능 --------------- */
export function validateAgainstScene(scene, { strictProfile = null } = {}) {
  const rejects = [];
  try {
    const sp = scene?.sourcePins || {};
    for (const [k, pin] of [['painting', SOURCE_PINS.painting], ['cleanPlate', SOURCE_PINS.cleanPlate], ['residentAtlas', SOURCE_PINS.residentAtlas]])
      if (sp[k] !== pin) rejects.push(`scene.sourcePins.${k} mismatch`);
    const rev = scene?.residentLayerReview;
    if (rev?.kind !== 'independent-resident-preview-v1' || rev?.notAdopted !== true) rejects.push('residentLayerReview kind/notAdopted');
    const foot = scene?.layers?.find(l => l.id === 'foot');
    if (!foot || foot.sort !== 'foot' || foot.parallax !== 1 || !foot.visible) rejects.push('foot layer contract');
    for (const r of RESIDENTS) {
      const o = foot?.objects?.find(o => o.id === 'obj-' + r.id);
      if (!o) { rejects.push(`${r.id}: scene object missing`); continue; }
      if (o.pivotX !== 0.5 || o.pivotY !== 1 || o.rotation !== 0 || o.flipX || o.opacity !== 1 || o.mask !== undefined) rejects.push(`${r.id}: object transform contract`);
      if (o.x !== r.foot.x || o.y !== r.foot.y) rejects.push(`${r.id}: scene foot != plan (${o.x},${o.y})`);
      if (Math.abs(o.width - r.width) > 1e-6 || Math.abs(o.height - r.height) > 1e-6) rejects.push(`${r.id}: scene size != plan`);
    }
    if (typeof strictProfile === 'function' && strictProfile(scene) === null) rejects.push('strict residentPaintingProfile() returned null');
  } catch (e) { rejects.push('exception: ' + (e?.message || e)); }
  return { ok: rejects.length === 0, rejects };
}

// 순수 계획 헬퍼: foot y 오름차순 삽입 순서(§12 foot.sort). 렌더 아님.
export function footSortOrder(residents = RESIDENTS) {
  return residents.map(r => ({ id: r.id, y: r.foot.y })).sort((a, b) => a.y - b.y).map(r => r.id);
}
export function atlasCrop(r) { return { ...r.crop }; }
export function worldFromSourcePx(px) { return px * SOURCE_SPACE.worldPerSourcePixel; }

export function validate() {
  const plan = validatePlan();
  return { ok: plan.ok, plan, notes: COMPLETION_NOTES, pins: Object.keys(SOURCE_PINS).length,
           footOrder: footSortOrder(), adopted: false };
}

export default { WORLD, SOURCE_SPACE, SOURCE_PINS, STRICT_MODULE_PATH, NAV_LOCK, PLAYER,
  RESIDENTS, COMPLETION_NOTES, validatePlan, validateAgainstScene, footSortOrder,
  atlasCrop, worldFromSourcePx, validate };

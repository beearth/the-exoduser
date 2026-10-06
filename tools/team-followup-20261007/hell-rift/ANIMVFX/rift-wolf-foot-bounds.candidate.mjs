/*
 * rift-wolf-foot-bounds.candidate.mjs — ANIMVFX CANDIDATE (corrupted_wolf foot-bounds metadata)
 *
 * Goal   : CH1-RIFT-MAIN-PARALLEL-20261007
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-MAIN-PARALLEL-20261007-ANIMVFX-CANDIDATE
 *
 * WHAT — read-only ALPHA-SILHOUETTE bounds / lowest-foot-row metadata for the existing
 *   corrupted_wolf 2.5D display sprite, consuming the public contract in
 *   tools/2_5d/corrupted-wolf.mjs:
 *     CORRUPTED_WOLF_LIMITS  (:40-46)  cell 256, cols 8, rows 5, col 5, row 1, framesPerMob 4,
 *                                      alphaThreshold 16, defaultPreviewFPS 6, metadataFPS 'UNKNOWN',
 *                                      footAnchor 'UNKNOWN', referenceHeight 'UNKNOWN'
 *     CORRUPTED_WOLF_SOURCES (:35-39)  8 idle atlas PNG (2048×1280) + 8 walk atlas PNG (8192×1280),
 *                                      + idle/walk atlas JSON — each byte+SHA256 pinned
 *     copyCellBottomUp       (:94-104) runtime cell extraction (bottom-up flip, alphaThreshold 16)
 *     cellRect               (:52-61) source cell UV (col5/row1; walk x=(20+frame)*256)
 *
 * The embedded WOLF_FOOT_BOUNDS were MEASURED read-only from the pinned PNGs via a stdlib
 * (zlib) decode of the non-interlaced RGBA8 atlases — no PIL, no install, no file write, no PNG
 * change. Values are ALPHA-SILHOUETTE extents in SOURCE cell pixels (origin top-left, y down),
 * NOT anatomical feet or IK (foot anchor / reference height stay UNKNOWN). Runtime preview FPS 6
 * and metadataFPS UNKNOWN are preserved. Consuming these bounds must NOT change the cell UV
 * (cellRect), plane scale/height, billboard direction, atlas, nav, geometry or the source PNG —
 * they are derived descriptors only. Decorative metadata; protection 2_3 / Q-only magic blackBean
 * (E non-parry) / no-attack-ticket untouched. No movement/native/visual acceptance here.
 */

'use strict';

export const WOLF_FOOT_PROVENANCE = Object.freeze({
  status: 'ROOT-UNADOPTED-METADATA-CANDIDATE',
  basis: 'tools/2_5d/corrupted-wolf.mjs',
  measurement: 'stdlib-zlib-rgba8-decode (read-only; no PIL/install/write)',
  coordinateSpace: 'source-cell-top-left-y-down (256²); runtime copyCellBottomUp flips to bottomUpRow = 255 - lowestFootRow',
  anatomicalFoot: false, ik: false, footAnchor: 'UNKNOWN', referenceHeight: 'UNKNOWN',
  metadataFPS: 'UNKNOWN', previewFPS: 6, nativeAccepted: false, visualVerdict: 'RETOUCH / NOT-OBSERVED'
});

export const WOLF_FRAME_CONTRACT = Object.freeze({
  skin: 'corrupted_wolf', cell: 256, cols: 8, rows: 5, col: 5, row: 1,
  dirs: Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']),
  idleFrames: 1, walkFramesPerMob: 4, validWalkFrames: Object.freeze([0, 1, 2]),
  blankWalkFrame: 3, blankFallback: 'idle-same-dir', alphaThreshold: 16, previewFPS: 6,
  idleAtlas: Object.freeze({ width: 2048, height: 1280 }), walkAtlas: Object.freeze({ width: 8192, height: 1280 }),
  idleMetaSHA256: 'f4842e1834074c31ec2a04d5b803924029aa4e6da3c1f4be3bc7e469b771049b',
  walkMetaSHA256: '4b18470e74a5b5afe1747e48a91fb2e78f5c9d213e336cef79074e94fcdbed9e',
  validFramesTotal: 32 // 8 idle + 8 dirs × 3 non-blank walk frames
});

// Measured [x, y, w, h, lowestFootRow, alphaCount] in source cell pixels (alpha > 16). dir order = contract.dirs.
export const WOLF_FOOT_BOUNDS = Object.freeze({
  idle: Object.freeze([
    [102, 80, 55, 108, 187, 4114], [69, 88, 116, 100, 187, 6339], [63, 86, 131, 96, 181, 6800],
    [69, 80, 119, 102, 181, 6148], [100, 74, 60, 117, 190, 4758], [72, 80, 119, 102, 181, 6126],
    [66, 86, 125, 96, 181, 6660], [77, 86, 114, 102, 187, 6145]
  ].map(Object.freeze)),
  // walk[dir][frame]; frame 3 is null (blank → idle-same-dir fallback) in every direction.
  walk: Object.freeze([
    [[105, 83, 50, 99, 181, 3686], [105, 80, 50, 102, 181, 3692], [105, 80, 50, 102, 181, 3752], null],
    [[72, 94, 108, 91, 184, 5282], [69, 94, 111, 91, 184, 5238], [72, 94, 110, 86, 179, 5239], null],
    [[69, 86, 125, 96, 181, 6010], [69, 86, 125, 88, 173, 6198], [69, 83, 125, 99, 181, 6454], null],
    [[66, 83, 111, 102, 184, 5602], [66, 83, 111, 102, 184, 5397], [61, 83, 119, 97, 179, 5755], null],
    [[108, 91, 44, 91, 181, 3137], [108, 91, 44, 94, 184, 3139], [105, 91, 47, 91, 181, 3182], null],
    [[77, 83, 114, 97, 179, 5855], [75, 83, 116, 97, 179, 5909], [72, 83, 119, 99, 181, 5494], null],
    [[63, 86, 128, 96, 181, 6066], [63, 86, 128, 94, 179, 6115], [63, 88, 128, 89, 176, 6141], null],
    [[77, 86, 111, 102, 187, 5986], [77, 86, 111, 96, 181, 5738], [77, 86, 111, 99, 184, 5751], null]
  ].map(frames => Object.freeze(frames.map(f => f && Object.freeze(f)))))
});

const CELL = WOLF_FRAME_CONTRACT.cell, THR = WOLF_FRAME_CONTRACT.alphaThreshold;
const toBounds = a => a && Object.freeze({ x: a[0], y: a[1], w: a[2], h: a[3], lowestFootRow: a[4], alphaCount: a[5] });
const okDir = d => Number.isInteger(d) && d >= 0 && d <= 7;

/**
 * Pure measurement (the same algorithm that produced WOLF_FOOT_BOUNDS). `rgba` is one cell's
 * RGBA (length cell*cell*4, rows top-down). Returns alpha-silhouette bounds or null if empty.
 * This is NOT an anatomical foot: lowestFootRow is the lowest alpha>threshold row only.
 */
export function measureFootBounds(rgba, { cell = CELL, alphaThreshold = THR } = {}) {
  if (!rgba || typeof rgba.length !== 'number' || rgba.length !== cell * cell * 4) return null;
  let minx = Infinity, miny = Infinity, maxx = -1, maxy = -1, on = 0;
  for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
    if (rgba[(y * cell + x) * 4 + 3] > alphaThreshold) {
      on++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
  }
  if (on === 0) return null;
  return Object.freeze({ x: minx, y: miny, w: maxx - minx + 1, h: maxy - miny + 1, lowestFootRow: maxy, alphaCount: on });
}

/** Foot bounds for a direction/mode/frame, applying the blank-frame-3 → idle-same-dir fallback. */
export function frameFootBounds(dir, mode = 'idle', frame = 0) {
  if (!okDir(dir)) throw new Error('wolf direction 0..7 필요');
  if (mode !== 'idle' && mode !== 'walk') throw new Error("wolf mode 'idle'|'walk' 필요");
  if (mode === 'idle') return Object.freeze({ dir, mode: 'idle', frame: 0, source: 'idle', fallback: null, bounds: toBounds(WOLF_FOOT_BOUNDS.idle[dir]) });
  const entry = Number.isInteger(frame) && frame >= 0 && frame < 4 ? WOLF_FOOT_BOUNDS.walk[dir][frame] : null;
  if (entry) return Object.freeze({ dir, mode: 'walk', frame, source: 'walk', fallback: null, bounds: toBounds(entry) });
  return Object.freeze({ dir, mode: 'walk', frame, source: 'idle', fallback: 'idle-same-dir', bounds: toBounds(WOLF_FOOT_BOUNDS.idle[dir]) }); // blank/invalid walk frame
}

/** 8-direction baseline delta of idle bounds: dir minus reference (default south=0). */
export function dirBaselineDelta(dir, reference = 0, mode = 'idle') {
  if (!okDir(dir) || !okDir(reference)) throw new Error('wolf direction 0..7 필요');
  const table = mode === 'walk' ? WOLF_FOOT_BOUNDS.walk.map(f => f[0]) : WOLF_FOOT_BOUNDS.idle;
  const a = table[dir], b = table[reference];
  if (!a || !b) return null;
  return Object.freeze({ dir, reference, mode, dx: a[0] - b[0], dy: a[1] - b[1], dw: a[2] - b[2], dh: a[3] - b[3], dLowestFootRow: a[4] - b[4] });
}

export function snapshot() {
  return Object.freeze({
    endId: 'CH1-RIFT-MAIN-PARALLEL-20261007-ANIMVFX-CANDIDATE',
    contract: WOLF_FRAME_CONTRACT, provenance: WOLF_FOOT_PROVENANCE,
    idleMeasured: WOLF_FOOT_BOUNDS.idle.length,
    walkFramesMeasured: WOLF_FOOT_BOUNDS.walk.reduce((n, f) => n + f.filter(Boolean).length, 0),
    blankWalkFrames: WOLF_FOOT_BOUNDS.walk.reduce((n, f) => n + f.filter(v => v === null).length, 0),
    anatomicalFoot: false, previewFPS: 6, metadataFPS: 'UNKNOWN', sourcePNGMutated: false, nativeAccepted: false
  });
}

export default Object.freeze({ WOLF_FOOT_PROVENANCE, WOLF_FRAME_CONTRACT, WOLF_FOOT_BOUNDS, measureFootBounds, frameFootBounds, dirBaselineDelta, snapshot });

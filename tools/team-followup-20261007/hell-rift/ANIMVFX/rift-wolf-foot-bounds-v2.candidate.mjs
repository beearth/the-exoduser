/*
 * rift-wolf-foot-bounds-v2.candidate.mjs — ANIMVFX CANDIDATE (strict-input fix over v1)
 *
 * Goal   : CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007-ANIMVFX-CANDIDATE
 *
 * Fixes the API-strictness defects root's meaning review flagged on v1
 * (tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds.candidate.mjs,
 * 8099B / 0ab46a800fba78a33ffac3c7d64948e273a29b768a760c0a42837fe0d9a410e9 — unadopted, unchanged;
 * its 5 measured-data checks passed, 4 API checks failed). v1 source:line of the defects:
 *   measureFootBounds  (v1:80)  `{cell=…, alphaThreshold=…}` destructuring EXECUTES opts getters,
 *                               no cell/threshold validation, length mismatch returned null (not reject)
 *   frameFootBounds    (v1:97-99) invalid/NaN/out-of-range frame fell into the blank → idle fallback
 *   dirBaselineDelta   (v1:103-105) unknown mode silently used idle numbers under an unknown label
 *
 * The MEASURED table (PNG16 + JSON2, 32 valid + 8 blank walk-frame-3) is preserved verbatim from v1
 * (root's independent bitmap audit matched it); it is NOT re-measured here. alpha>16 bottom is the
 * visible silhouette edge (public alphaTest 0.01, corrupted-wolf.mjs:202; alphaThreshold 16 :42/:101),
 * NOT an anatomical foot or IK — footAnchor / referenceHeight stay UNKNOWN, preview FPS 6 preserved.
 * Read-only metadata; no PNG/JSON/UV/position/size/geometry/nav mutation; measured table frozen;
 * borrowed pixels never written. Protection 2_3 / Q-only magic blackBean (E non-parry) /
 * no-attack-ticket untouched. No movement/native/visual acceptance here.
 */

'use strict';

export const WOLF_FOOT_PROVENANCE = Object.freeze({
  status: 'ROOT-UNADOPTED-METADATA-CANDIDATE',
  basis: 'tools/2_5d/corrupted-wolf.mjs', v1: 'rift-wolf-foot-bounds.candidate.mjs',
  v1sha256: '0ab46a800fba78a33ffac3c7d64948e273a29b768a760c0a42837fe0d9a410e9',
  rootReviewReported: 'raw61-meaning-result.json (data5 PASS / api4 FAIL) — reported by root, not read here',
  measurement: 'preserved from v1 (stdlib-zlib rgba8 decode; not re-measured)',
  coordinateSpace: 'source-cell top-left y-down (256²); bottomUpRow = 255 - lowestFootRow',
  anatomicalFoot: false, ik: false, footAnchor: 'UNKNOWN', referenceHeight: 'UNKNOWN',
  alphaTest: 0.01, alphaThreshold: 16, metadataFPS: 'UNKNOWN', previewFPS: 6,
  nativeAccepted: false, visualVerdict: 'RETOUCH / NOT-OBSERVED'
});

export const WOLF_FRAME_CONTRACT = Object.freeze({
  skin: 'corrupted_wolf', cell: 256, cols: 8, rows: 5, col: 5, row: 1,
  dirs: Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']),
  idleFrames: 1, walkFramesPerMob: 4, validWalkFrames: Object.freeze([0, 1, 2]),
  blankWalkFrame: 3, blankFallback: 'idle-same-dir', alphaThreshold: 16, previewFPS: 6,
  idleMetaSHA256: 'f4842e1834074c31ec2a04d5b803924029aa4e6da3c1f4be3bc7e469b771049b',
  walkMetaSHA256: '4b18470e74a5b5afe1747e48a91fb2e78f5c9d213e336cef79074e94fcdbed9e',
  validFramesTotal: 32
});

// Strict input contract (exports table) — every call fails closed outside these.
export const STRICT_INPUT_CONTRACT = Object.freeze({
  rgba: 'Uint8Array | Uint8ClampedArray, length === cell*cell*4; read-only; index-get throw => reject',
  opts: 'undefined | plain object; cell/alphaThreshold read via own DATA descriptor only (accessor/inherited/Proxy-throw => reject; getters never executed)',
  cell: 'integer 1..4096 (fractional/NaN/Infinity/0/negative/string => reject)',
  alphaThreshold: 'finite number 0..255 (negative/string/NaN/Infinity => reject)',
  dir: 'integer 0..7', reference: 'integer 0..7', mode: "'idle' | 'walk' (unknown => reject)",
  frame: 'integer 0..3 (NaN/fractional/out-of-range => reject, never blank-fallback); idle requires 0',
  emptyCell: 'valid input, no alpha>threshold => returns null (distinct from invalid-input reject)'
});

// Measured [x,y,w,h,lowestFootRow,alphaCount] in source cell pixels (alpha>16) — preserved from v1.
const TABLE = Object.freeze({
  idle: Object.freeze([
    [102, 80, 55, 108, 187, 4114], [69, 88, 116, 100, 187, 6339], [63, 86, 131, 96, 181, 6800],
    [69, 80, 119, 102, 181, 6148], [100, 74, 60, 117, 190, 4758], [72, 80, 119, 102, 181, 6126],
    [66, 86, 125, 96, 181, 6660], [77, 86, 114, 102, 187, 6145]
  ].map(Object.freeze)),
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
export const WOLF_FOOT_BOUNDS = TABLE;

const CELL = WOLF_FRAME_CONTRACT.cell, THR = WOLF_FRAME_CONTRACT.alphaThreshold, MAX_CELL = 4096;
const toBounds = a => a && Object.freeze({ x: a[0], y: a[1], w: a[2], h: a[3], lowestFootRow: a[4], alphaCount: a[5] });

// Read an opt WITHOUT executing getters: own data descriptor only; accessor / inherited / Proxy-throw => reject.
function readOpt(opts, key, dflt) {
  if (opts === undefined || opts === null) return dflt;
  if (typeof opts !== 'object' || Array.isArray(opts)) throw new Error('wolf opts plain object 필요');
  let desc, present;
  try { desc = Object.getOwnPropertyDescriptor(opts, key); present = key in opts; }
  catch (_) { throw new Error('wolf opts 접근 거부'); }          // Proxy trap throw — no message inspection
  if (desc === undefined) { if (present) throw new Error('wolf opts inherited 거부'); return dflt; }
  if (!Object.prototype.hasOwnProperty.call(desc, 'value')) throw new Error('wolf opts accessor 거부'); // getter/setter
  return desc.value;                                              // data value; getter never executed
}
function validCell(v) { if (!Number.isInteger(v) || v <= 0 || v > MAX_CELL) throw new Error('wolf cell 정수 1..4096 필요'); return v; }
function validThreshold(v) { if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 255) throw new Error('wolf alphaThreshold 유한수 0..255 필요'); return v; }
const okDir = d => Number.isInteger(d) && d >= 0 && d <= 7;

/** Strict pure measurement. Throws on invalid input; returns null for a valid-but-empty cell. */
export function measureFootBounds(rgba, opts) {
  const cell = validCell(readOpt(opts, 'cell', CELL));
  const alphaThreshold = validThreshold(readOpt(opts, 'alphaThreshold', THR));
  if (!(rgba instanceof Uint8Array) && !(rgba instanceof Uint8ClampedArray)) throw new Error('wolf rgba Uint8Array/Clamped 필요');
  if (rgba.length !== cell * cell * 4) throw new Error('wolf rgba length 불일치');   // explicit reject (not null)
  let minx = Infinity, miny = Infinity, maxx = -1, maxy = -1, on = 0;
  try {
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
      const a = rgba[(y * cell + x) * 4 + 3];
      if (a > alphaThreshold) { on++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
    }
  } catch (_) { throw new Error('wolf rgba 읽기 거부'); }          // Proxy index-get throw — reject
  if (on === 0) return null;                                       // valid, empty silhouette
  return Object.freeze({ x: minx, y: miny, w: maxx - minx + 1, h: maxy - miny + 1, lowestFootRow: maxy, alphaCount: on });
}

/** Strict foot bounds; only a genuine blank walk frame (frame 3) falls back to idle-same-dir. */
export function frameFootBounds(dir, mode = 'idle', frame = 0) {
  if (!okDir(dir)) throw new Error('wolf dir 정수 0..7 필요');
  if (mode !== 'idle' && mode !== 'walk') throw new Error("wolf mode 'idle'|'walk' 필요");
  if (!Number.isInteger(frame) || frame < 0 || frame > 3) throw new Error('wolf frame 정수 0..3 필요'); // NaN/fractional/5 => reject, never fallback
  if (mode === 'idle') {
    if (frame !== 0) throw new Error('wolf idle frame 0 only');
    return Object.freeze({ dir, mode: 'idle', frame: 0, source: 'idle', fallback: null, bounds: toBounds(TABLE.idle[dir]) });
  }
  const entry = TABLE.walk[dir][frame];
  if (entry) return Object.freeze({ dir, mode: 'walk', frame, source: 'walk', fallback: null, bounds: toBounds(entry) });
  return Object.freeze({ dir, mode: 'walk', frame, source: 'idle', fallback: 'idle-same-dir', bounds: toBounds(TABLE.idle[dir]) }); // genuine blank (frame 3)
}

/** 8-direction baseline delta; unknown mode is rejected (no idle+label fallback). */
export function dirBaselineDelta(dir, reference = 0, mode = 'idle') {
  if (!okDir(dir) || !okDir(reference)) throw new Error('wolf dir/reference 0..7 필요');
  if (mode !== 'idle' && mode !== 'walk') throw new Error("wolf mode 'idle'|'walk' 필요"); // reject unknown mode
  const table = mode === 'walk' ? TABLE.walk.map(f => f[0]) : TABLE.idle;
  const a = table[dir], b = table[reference];
  if (!a || !b) throw new Error('wolf baseline 값 없음');
  return Object.freeze({ dir, reference, mode, dx: a[0] - b[0], dy: a[1] - b[1], dw: a[2] - b[2], dh: a[3] - b[3], dLowestFootRow: a[4] - b[4] });
}

export function snapshot() {
  return Object.freeze({
    endId: 'CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007-ANIMVFX-CANDIDATE',
    contract: WOLF_FRAME_CONTRACT, strictInput: STRICT_INPUT_CONTRACT, provenance: WOLF_FOOT_PROVENANCE,
    idleMeasured: TABLE.idle.length,
    walkFramesMeasured: TABLE.walk.reduce((n, f) => n + f.filter(Boolean).length, 0),
    blankWalkFrames: TABLE.walk.reduce((n, f) => n + f.filter(v => v === null).length, 0),
    anatomicalFoot: false, previewFPS: 6, metadataFPS: 'UNKNOWN', sourcePNGMutated: false, nativeAccepted: false
  });
}

export default Object.freeze({ WOLF_FOOT_PROVENANCE, WOLF_FRAME_CONTRACT, STRICT_INPUT_CONTRACT, WOLF_FOOT_BOUNDS, measureFootBounds, frameFootBounds, dirBaselineDelta, snapshot });

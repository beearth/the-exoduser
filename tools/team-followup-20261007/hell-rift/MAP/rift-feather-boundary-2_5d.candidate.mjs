/* MAP rift feather-boundary 2.5D consumer — CH1-RIFT-QUALITY-NOW-20261007-MAP-FEATHER-CANDIDATE
 *
 * Read-only. Writes NO source/scene/nav/mask/sourcePNG/public/game/save files.
 * UNIT1: consume the opening (abyss) + foreground alpha BOUNDARY, preserving source XY/UV/nav/mask, for Three.
 * UNIT2: confirm the feather width SOURCE BASIS + UNIT (no arbitrary value) and give boundary-alpha /
 *        inside·outside / registration-transform counter-examples.
 *
 * Feather contract (source:line, verified — not fabricated):
 *   - value : scene object `maskFeather` field (abyss obj-rift-depth = 120). NEVER hardcoded here; read per scene.
 *   - unit  : WORLD px. Bound [0,160], requires mask — map-scene-core.js:119.
 *   - formula: alpha = inside(point-in-polygon) ? smoothstep(min(1, d/feather)) : 0 ; smoothstep(t)=t²(3−2t) ;
 *             feather=0 ⇒ hard clip. d = distance (world px) to nearest mask-polygon edge.
 *             — map-scene-editor.js maskedPicture :46 (hard clip), :51-58 (inside/distance/smoothstep*255).
 *   - mask is WORLD-FIXED even with sourceParallax (only the image source shifts) — MAP_SCENE_EDITOR_20261005 §3.
 *   - current Three terrain does NOT apply feather (rift-terrain.mjs snapshot maskFeatherApplied:false) → this gap.
 *   - UV preserved as global world/8000 (rift-terrain.mjs:69 q[0]/8000, 1-q[1]/8000).
 */
import '../../../map-scene-core.js';
import { RIFT_TERRAIN } from '../../../2_5d/rift-terrain.mjs';

const K = globalThis.MapSceneCore;
const finite = (n, l) => { if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(l + ' 유한수 오류'); return n; };
const smoothstep = (t) => { const v = Math.min(1, Math.max(0, t)); return v * v * (3 - 2 * v); };

/* Object world→local (px in [0,width]×[0,height]) using pivot. */
function toLocal(o, wx, wy) { return { x: (wx - (o.x - o.pivotX * o.width)), y: (wy - (o.y - o.pivotY * o.height)) }; }
function polygonPx(o) { return o.mask.map(([mx, my]) => [mx * o.width, my * o.height]); }
function insideAndDistance(poly, px, py) {
  let inside = false, distance = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const v = poly[i], u = poly[j], dx = v[0] - u[0], dy = v[1] - u[1];
    if ((v[1] > py) !== (u[1] > py) && px < (u[0] - v[0]) * (py - v[1]) / (u[1] - v[1]) + v[0]) inside = !inside;
    const t = Math.max(0, Math.min(1, ((px - u[0]) * dx + (py - u[1]) * dy) / (dx * dx + dy * dy || 1)));
    distance = Math.min(distance, Math.hypot(px - u[0] - t * dx, py - u[1] - t * dy));
  }
  return { inside, distance };
}

/* Boundary alpha at a WORLD point for a masked object — exact editor maskedPicture math (:51-58). */
export function boundaryAlpha(o, worldX, worldY) {
  if (!o?.mask) throw new Error('마스크 없는 객체는 feather 경계가 없습니다');
  const feather = o.maskFeather ?? 0;
  const q = toLocal(o, finite(worldX, 'world x'), finite(worldY, 'world y'));
  const { inside, distance } = insideAndDistance(polygonPx(o), q.x, q.y);
  if (!inside) return 0;                                   // hard clip outside the polygon
  if (!feather) return 1;                                  // feather=0 ⇒ hard edge inside
  return smoothstep(Math.min(1, distance / feather));      // 0 at edge → 1 at ≥feather
}

/* UNIT2: feather width source basis + unit, verified against the scene (no arbitrary value). */
export function featherContract(scene) {
  const p = K.validate(scene);
  const masked = [];
  for (const l of p.layers) for (const o of l.objects) if (o.mask) masked.push({ layer: l.id, objectId: o.id, maskFeather: o.maskFeather ?? 0, sourceParallax: o.sourceParallax, maskPts: o.mask.length });
  for (const m of masked) {
    m.inBound = m.maskFeather >= 0 && m.maskFeather <= 160;
    m.unit = 'world-px';
    m.status = m.inBound ? 'VERIFIED' : 'FAIL';
  }
  return {
    source: 'scene object maskFeather field (read per scene; not hardcoded)',
    validateBound: 'map-scene-core.js:119 — number(maskFeather,0,160) + mask required',
    formula: 'alpha = inside ? smoothstep(min(1,d/feather)) : 0 ; smoothstep(t)=t²(3−2t) ; feather=0 hard clip (map-scene-editor.js:46,:51-58)',
    unit: 'world-px', bound: [0, 160], maskWorldFixed: true, masked
  };
}

/* UNIT1: opening (abyss) + foreground alpha-boundary consumption spec, preserving source XY/UV/nav/mask.
 * Headless returns registration + per-object feather boundary sampler + UV mapping. If THREE is provided the
 * actual material build is left to root's terrain owner (we do NOT fabricate a Three render pass headless). */
export function consumeFeatherBoundary(scene, { THREE = null, worldSize = 8000 } = {}) {
  const p = K.validate(scene);
  const opening = p.layers.find(l => l.id === 'abyss')?.objects.find(o => o.mask && o.sourceParallax !== undefined) || null;
  const foreground = (p.layers.find(l => l.id === 'foot')?.objects || []).filter(o => o.mask && o.id.startsWith('obj-') && !o.id.startsWith('obj-resident-'));
  const spec = (o) => ({
    objectId: o.id, maskFeather: o.maskFeather ?? 0,
    xy: { x: o.x, y: o.y, width: o.width, height: o.height, pivotX: o.pivotX, pivotY: o.pivotY },
    worldPolygon: o.mask.map(([mx, my]) => ({ x: o.x - o.pivotX * o.width + mx * o.width, y: o.y - o.pivotY * o.height + my * o.height })),
    uv: o.mask.map(([mx, my]) => ({ u: (o.x - o.pivotX * o.width + mx * o.width) / worldSize, v: 1 - (o.y - o.pivotY * o.height + my * o.height) / worldSize })),
    alphaAt: (wx, wy) => boundaryAlpha(o, wx, wy)
  });
  return {
    openingSupported: !!opening,
    opening: opening ? spec(opening) : null,
    foreground: foreground.map(spec),
    registration: { walkableCount: p.walkable.filter(Boolean).length, navSha256: p.sourcePins?.nav, start: { ...p.start }, exit: { ...p.exit }, world: { ...p.world } },
    featherContract: featherContract(p),
    threeBuild: THREE ? { status: 'PENDING', reason: 'actual Three material build is root terrain-owner scope; sampler+UV+XY supplied, no headless render claim' } : { status: 'PENDING', reason: 'no THREE' },
    maskFeatherApplied: 'consumer-provided (current rift-terrain.mjs = false)'
  };
}

/* Fail-closed: any feather/mask/XY transform vs canonical breaks registration. */
export function compareFeatherRegistration(scene, canonical) {
  const a = K.validate(scene), b = K.validate(canonical), diffs = [];
  const mk = (p) => { const m = new Map(); for (const l of p.layers) for (const o of l.objects) if (o.mask) m.set(o.id, { maskFeather: o.maskFeather ?? 0, x: o.x, y: o.y, width: o.width, height: o.height, pivotX: o.pivotX, pivotY: o.pivotY, mask: o.mask }); return m; };
  const ma = mk(a), mb = mk(b);
  if (ma.size !== mb.size) diffs.push('masked object count ' + ma.size + '≠' + mb.size);
  for (const [id, x] of ma) {
    const y = mb.get(id); if (!y) { diffs.push(id + ' missing in canonical'); continue; }
    for (const k of ['maskFeather', 'x', 'y', 'width', 'height', 'pivotX', 'pivotY']) if (x[k] !== y[k]) diffs.push(id + '.' + k + ' changed');
    if (JSON.stringify(x.mask) !== JSON.stringify(y.mask)) diffs.push(id + '.mask polygon changed');
  }
  return { ok: diffs.length === 0, diffs };
}

export const RIFT_FEATHER_BOUNDARY = Object.freeze({
  completionId: 'CH1-RIFT-QUALITY-NOW-20261007-MAP-FEATHER-CANDIDATE',
  scene: RIFT_TERRAIN.scene, sceneSha256: RIFT_TERRAIN.sceneSha256 + ' (verify before trusting)',
  feather: { source: 'scene object maskFeather (abyss 120)', unit: 'world-px', bound: [0, 160], formula: 'smoothstep(min(1,d/feather)); feather=0 hard clip', arbitrary: false },
  preserves: ['source XY', 'global UV (world/8000)', 'nav', 'mask polygon'],
  mutates: 'none — read-only; actual Three build + same-camera before/after visual review are root-owned gates'
});

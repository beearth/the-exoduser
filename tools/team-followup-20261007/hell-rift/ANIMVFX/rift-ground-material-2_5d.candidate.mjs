/*
 * rift-ground-material-2_5d.candidate.mjs — ANIMVFX CANDIDATE
 *
 * Goal   : CH1-RIFT-QUALITY-NOW-20261007  (gate doc: CH1_2_5D_PRODUCTION_GOALS_20261006.md §2026-10-08)
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-QUALITY-NOW-20261007-GROUND-MATERIAL-CANDIDATE
 *
 * WHAT — the 2.5D (THREE) consumption point of the COMPLETED editor ground material
 *   `tools/map-scene-rift-ground-detail.mjs` (RIFT_GROUND_DETAIL, lines 7-12):
 *     src   assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png (1024×1536)
 *     sha256 a38117e63349bc486b038baab9ad266bd98f30c74306629ee0cb93df6eb7da84
 *     crop  {x:320,y:1120,w:240,h:240}  (240²)   worldSpan 160   alpha .4
 *   Reproduces that module's 2×2 mirror tile (buildPattern, lines 49-58 → 480²) and world
 *   tiling period (worldSpan·2 = 320, cf. snapshot.worldPeriod line 126) as a THREE ground
 *   overlay, confined to the live walkable nav (soft inward fade like lines 69-70), so
 *   non-walkable / abyss ground gets ZERO material (alpha 0), matching MAP GUIDE §GATE-4
 *   (no hard black tile edges; fade inward) and §13 (floor contamination → baked/visual).
 *
 * WORLD-FIXED — geometry is built in world→scene space via terrain.worldToScene (rift-terrain.mjs:60);
 *   it does not follow the camera or actor. NO new RAF/timer (built once in prepare(); the caller's
 *   single renderer draws the mesh; invalidateNav() only rebuilds the mask on demand). dispose()
 *   frees its own texture/alphaMap/geometry/material and detaches its mesh.
 *
 * LIMITS — this is a tiled micro-detail overlay; it does NOT restore the painting's native
 *   resolution (no original-resolution claim). THREE has no built-in 'soft-light' blend (the 2D
 *   source uses soft-light, line 120); this overlay uses standard alpha at opacity .4 and flags the
 *   blend-mode match as PENDING (root may supply a soft-light shader). Decorative only: no input,
 *   no scene/nav/save/source mutation; protection 2_3 / Q-only magic blackBean (E non-parry) /
 *   no-attack-ticket untouched. On-screen alignment/appearance is UNKNOWN here (no GPU/browser).
 */

'use strict';

// Frozen mirror of RIFT_GROUND_DETAIL (map-scene-rift-ground-detail.mjs:7-12). Pass the real
// imported constant via options.texture to guarantee single-source identity; this is validated.
const DEFAULT_TEXTURE = Object.freeze({
  src: 'assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png',
  width: 1024, height: 1536,
  sha256: 'a38117e63349bc486b038baab9ad266bd98f30c74306629ee0cb93df6eb7da84',
  crop: Object.freeze({ x: 320, y: 1120, w: 240, h: 240 }), worldSpan: 160, alpha: 0.4
});
const GRID = 200, TILE = 40, WORLD = 8000;
const finiteRange = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

function descriptor(v) {
  if (!v || typeof v !== 'object' || typeof v.src !== 'string' ||
    !/^assets\/map\/hell_rift\/[A-Za-z0-9_./-]+\.png$/.test(v.src) || v.src.split('/').includes('..') ||
    !/^[a-f0-9]{64}$/.test(v.sha256 || '') || !Number.isInteger(v.width) || !Number.isInteger(v.height) ||
    !finiteRange(v.width, 1, 8192) || !finiteRange(v.height, 1, 8192)) return null;
  const c = v.crop;
  if (!c || !['x', 'y', 'w', 'h'].every(k => Number.isInteger(c[k])) || c.x < 0 || c.y < 0 || c.w < 1 || c.w > 1024 ||
    c.h !== c.w || c.x + c.w > v.width || c.y + c.h > v.height ||
    !finiteRange(v.worldSpan, 1, 32000) || !finiteRange(v.alpha, 0, 0.45)) return null;
  return { src: v.src, width: v.width, height: v.height, sha256: v.sha256, crop: { x: c.x, y: c.y, w: c.w, h: c.h }, worldSpan: v.worldSpan, alpha: v.alpha };
}

export function createRiftGroundMaterial2_5d(deps = {}) {
  const { THREE, terrain, loadImage, makeCanvas = (() => (typeof document !== 'undefined' ? document.createElement('canvas') : null)) } = deps;
  const spec = descriptor(deps.texture || DEFAULT_TEXTURE);
  const order = Number.isFinite(deps.order) ? deps.order : 5; // fixed ground layer: above plate(0)/below horn(10)/shadow(15)
  const ready = !!spec && !!THREE && !!terrain && typeof terrain.worldToScene === 'function' &&
    typeof terrain.canWalk === 'function' && typeof loadImage === 'function' &&
    typeof THREE.CanvasTexture === 'function' && typeof THREE.Mesh === 'function' &&
    typeof THREE.BufferGeometry === 'function' && typeof THREE.MeshBasicMaterial === 'function';

  const periodWorld = spec ? spec.worldSpan * 2 : null;              // 320
  const repeat = spec ? WORLD / periodWorld : null;                  // 25
  const stats = {
    active: ready, reason: ready ? 'not-prepared' : 'invalid-deps', worldFixed: true, addedRAF: 0,
    periodWorld, repeat, alpha: spec ? spec.alpha : null, composite: 'alpha(soft-light PENDING)',
    navCells: 0, nonWalkableAlpha: 0, resolutionRestored: false, prepared: false, disposed: false
  };
  if (!ready) {
    const noop = () => stats.reason;
    return Object.freeze({ prepare: async () => false, invalidateNav: noop, dispose: noop, snapshot: () => ({ ...stats }), object3d: null });
  }

  let detailTex = null, navTex = null, geometry = null, material = null, mesh = null;

  function canvas2d(w, h) {
    const c = makeCanvas(); if (!c || typeof c.getContext !== 'function') throw new Error('재질 canvas 불가');
    c.width = w; c.height = h; const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('재질 context 불가'); return { c, ctx };
  }

  function buildMirror(image) {
    const cr = spec.crop, { c, ctx } = canvas2d(cr.w * 2, cr.h * 2);   // 480²
    ctx.imageSmoothingEnabled = false;
    for (const [x, y, fx, fy] of [[0, 0, 1, 1], [cr.w * 2, 0, -1, 1], [0, cr.h * 2, 1, -1], [cr.w * 2, cr.h * 2, -1, -1]]) {
      ctx.save(); try { ctx.translate(x, y); ctx.scale(fx, fy); ctx.drawImage(image, cr.x, cr.y, cr.w, cr.h, 0, 0, cr.w, cr.h); } finally { ctx.restore(); }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.generateMipmaps = true; t.needsUpdate = true; return t;
  }

  function buildNavMask() {
    const { c, ctx } = canvas2d(GRID, GRID), img = ctx.createImageData(GRID, GRID);
    const walk = (tx, ty) => tx >= 0 && ty >= 0 && tx < GRID && ty < GRID && terrain.canWalk((tx + 0.5) * TILE, (ty + 0.5) * TILE, 0) === true;
    let cells = 0;
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const k = (y * GRID + x) * 4;
      if (!walk(x, y)) { img.data[k + 3] = 0; continue; }              // non-walkable / abyss -> 0 influence
      cells++;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255;
      const edge = x === 0 || y === 0 || x === GRID - 1 || y === GRID - 1 || !walk(x - 1, y) || !walk(x + 1, y) || !walk(x, y - 1) || !walk(x, y + 1);
      img.data[k + 3] = edge ? 128 : 255;                              // soft inward fade (GATE-4: no hard edge)
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping || 1001; t.repeat.set(1, 1);
    if (THREE.LinearFilter) { t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; }
    t.generateMipmaps = false; t.needsUpdate = true; stats.navCells = cells; return t;
  }

  function buildGeometry() {
    const b = terrain.bounds || { left: 0, right: WORLD, top: 0, bottom: WORLD };
    const lift = 1.5; // small world-height so the overlay floats just above the ground plane
    const corners = [[b.left, b.top], [b.right, b.top], [b.right, b.bottom], [b.left, b.bottom]];
    const pos = [], uv = [];
    for (const [wx, wy] of corners) {
      const v = terrain.worldToScene(wx, wy, lift); pos.push(v.x, v.y, v.z);
      uv.push(wx / WORLD, 1 - wy / WORLD);                             // same global-UV convention as terrain floor (rift-terrain.mjs:69)
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    return g;
  }

  async function prepare() {
    if (stats.disposed) return false;
    try {
      const image = await loadImage(spec.src);
      if (!image || image.naturalWidth !== spec.width || image.naturalHeight !== spec.height || image.complete === false) {
        stats.reason = 'source-mismatch'; return false;               // fail-closed: wrong byte/size source
      }
      detailTex = buildMirror(image);
      navTex = buildNavMask();
      geometry = buildGeometry();
      material = new THREE.MeshBasicMaterial({
        map: detailTex, alphaMap: navTex, transparent: true, opacity: spec.alpha,
        depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'rift-ground-material-2_5d'; mesh.frustumCulled = false; mesh.renderOrder = order;
      stats.prepared = true; stats.reason = 'ground-material-only'; stats.nonWalkableAlpha = 0;
      return true;
    } catch (_) { stats.reason = 'prepare-failed'; return false; }
  }

  function invalidateNav() {                                           // after an in-place nav edit; no RAF
    if (stats.disposed || !mesh) return stats.reason;
    try { const next = buildNavMask(); if (navTex) navTex.dispose?.(); navTex = next; if (material) { material.alphaMap = next; material.needsUpdate = true; } stats.reason = 'nav-rebuilt'; }
    catch (_) { stats.reason = 'nav-rebuild-failed'; }
    return stats.reason;
  }

  function dispose() {
    if (stats.disposed) return 0;
    stats.disposed = true; stats.active = false; stats.prepared = false;
    mesh?.removeFromParent?.();
    for (const r of [detailTex, navTex, geometry, material]) r?.dispose?.();
    detailTex = navTex = geometry = material = null;
    stats.reason = 'disposed'; return 1;
  }

  const handle = {
    prepare, invalidateNav, dispose,
    get object3d() { return mesh; },
    snapshot() { return Object.freeze({ endId: 'CH1-RIFT-QUALITY-NOW-20261007-GROUND-MATERIAL-CANDIDATE', ...stats, textureSha256: spec.sha256 }); }
  };
  return Object.freeze(handle);
}

export default Object.freeze({ createRiftGroundMaterial2_5d, DEFAULT_TEXTURE });

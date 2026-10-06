/*
 * rift-cliff-contact-underlay-2_5d.candidate.mjs — ANIMVFX CANDIDATE
 *
 * Goal   : CH1-RIFT-SEAM-CONTACT-20261007
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX-CANDIDATE
 *
 * WHAT — a world-fixed, shallow cliff/foreground CONTACT-shadow (ambient-occlusion) underlay for
 *   the Hell Rift 2.5D slice. It darkens only the thin walkable rim where the registered ground
 *   meets a non-walkable cliff / foreground / abyss edge, grounding the structures per MAP GUIDE
 *   §4 GROUND TRANSITION (sticker→FAIL) and §GATE-4 (ground connection, no hard black tile edge).
 *
 * CONSUMED PUBLIC CONTRACT (read, source:line)
 *   tools/2_5d/rift-terrain.mjs
 *     createRiftTerrain(...) -> { object3d, worldToScene(x,y,h), canWalk(x,y,r=12), bounds, occluders, ... }
 *       worldToScene     rift-terrain.mjs:61   (ground maps world->scene; h=0 is the floor)
 *       global ground UV rift-terrain.mjs:70   (uv = x/8000, 1 - y/8000)  — matched here
 *       ground order 0 / horn occluder order 10 (rift-terrain.mjs:74/123) — underlay sits at 6 (above
 *                         the pinned colour detail order 5, below occluders/actor/shadow)
 *   tools/2_5d/rift-ground-detail.mjs  (sibling colour detail on the SAME ground; nav1192 gated)
 *     nav mask grid 200², tile 40, world 8000, navCells 1192 (RIFT_GROUND_DETAIL_MATERIAL:15-16)
 *   Nav is read by SAMPLING terrain.canWalk; the raw walkable array / scene / PNG are never touched.
 *
 * GUARDS — mask guard zeroes the underlay on non-walkable (cliff/abyss) AND on deep walkable floor
 *   beyond the shallow contact width (no leak either way). Owns only its band texture + geometry +
 *   material (released exactly once); a borrowed tint texture is NEVER disposed. prepare() is
 *   epoch-guarded (latest-async wins; dispose-mid-prepare cleans the just-built owned resources),
 *   constructor-fail returns an inert handle, and dispose() is double-dispose safe. No own RAF/timer,
 *   no scene/nav/save writes, no extra geometry/collision/UV change, no new PNG. NOT a resolution
 *   restoration of the 1254² plate. Protection 2_3 / Q-only magic blackBean (E non-parry) /
 *   no-attack-ticket untouched. GPU shader-link / on-screen appearance = caller WebGL: UNKNOWN.
 */

'use strict';

const GRID = 200, TILE = 40, WORLD = 8000;

// Exports table — explicit brightness/opacity/width/colour of the contact underlay.
export const UNDERLAY_PARAMS = Object.freeze({
  contactTiles: 1.5,                 // shallow band width INTO the walkable side (tiles)
  contactWidthWorld: 1.5 * TILE,     // = 60 world px
  strength: 0.42,                    // max alpha at the cliff foot (falls to 0 at contactTiles)
  color: 0x05080a,                   // cold near-black contact shade
  blend: 'normal-dark',              // transparent dark overlay (soft-light/multiply = root PENDING)
  renderOrder: 6,                    // ground 0 < colour-detail 5 < underlay 6 < occluder 10 < shadow 15
  groundLift: 1.25                   // small world-height to float above the floor (+ polygonOffset)
});

const finite = Number.isFinite;

export function createRiftCliffContactUnderlay(deps = {}) {
  const { THREE, terrain } = deps;
  const P = Object.freeze({ ...UNDERLAY_PARAMS, ...(deps.params || {}) });
  const tint = deps.tintTexture && deps.tintTexture.isTexture === true ? deps.tintTexture : null; // borrowed, never disposed
  const ready = !!THREE && !!terrain && typeof terrain.worldToScene === 'function' && typeof terrain.canWalk === 'function' &&
    typeof THREE.DataTexture === 'function' && typeof THREE.Mesh === 'function' &&
    typeof THREE.BufferGeometry === 'function' && typeof THREE.MeshBasicMaterial === 'function';

  const stats = {
    active: ready, reason: ready ? 'not-prepared' : 'invalid-deps', preparing: false, epoch: 0,
    bandCells: 0, bandNonWalkable: 0, bandDeepFloor: 0, maxAlpha: 0, hasMesh: false,
    prepareCount: 0, canceledCleanups: 0, rePrepareDisposals: 0, ownedReleased: false,
    borrowedTintDisposed: false, ownRaf: false, ownTimers: false, sceneWrites: false, navWrites: false,
    params: P, worldFixed: true, resolutionRestored: false
  };
  if (!ready) {
    const noop = () => stats.reason;
    return Object.freeze({ prepare: async () => false, invalidateNav: noop, dispose: noop, snapshot: () => ({ ...stats }), get object3d() { return null; } });
  }

  let mesh = null, bandTex = null, geometry = null, material = null, released = false, disposed = false, epoch = 0;

  const walk = (tx, ty) => tx >= 0 && ty >= 0 && tx < GRID && ty < GRID && terrain.canWalk((tx + 0.5) * TILE, (ty + 0.5) * TILE, 0) === true;

  // Contact-AO band: alpha>0 only on walkable cells within contactTiles of a non-walkable edge.
  function buildBand() {
    const R = Math.ceil(P.contactTiles) + 1, bytes = new Uint8Array(GRID * GRID * 4);
    let cells = 0, nonWalk = 0, deep = 0, maxA = 0;
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const k = (y * GRID + x) * 4;
      if (!walk(x, y)) { bytes[k + 3] = 255; nonWalk++; continue; }   // non-walkable (cliff/abyss): alpha 0
      let best = Infinity;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        if (!dx && !dy) continue;
        if (!walk(x + dx, y + dy)) { const d = Math.hypot(dx, dy); if (d < best) best = d; } // nearest non-walkable (out-of-grid counts)
      }
      const dTiles = best;
      let a = 0;
      if (dTiles <= P.contactTiles) a = P.strength * (1 - dTiles / P.contactTiles); else deep++; // deep floor -> 0
      const b = Math.max(0, Math.min(255, Math.round(a * 255)));
      bytes[k] = bytes[k + 1] = bytes[k + 2] = b; bytes[k + 3] = 255;   // RGB carry alpha (MeshBasicMaterial.alphaMap samples .g)
      if (a > 0) cells++;
      if (a > maxA) maxA = a;
    }
    stats.bandCells = cells; stats.bandNonWalkable = nonWalk; stats.bandDeepFloor = deep; stats.maxAlpha = +maxA.toFixed(4);
    const t = new THREE.DataTexture(bytes, GRID, GRID, THREE.RGBAFormat, THREE.UnsignedByteType);
    if (THREE.NoColorSpace) t.colorSpace = THREE.NoColorSpace;
    t.flipY = false; t.magFilter = THREE.LinearFilter || undefined; t.minFilter = THREE.LinearFilter || undefined;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping || 1001; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  }

  function buildGeometry() {
    const b = terrain.bounds || { left: 0, right: WORLD, top: 0, bottom: WORLD };
    const corners = [[b.left, b.top], [b.right, b.top], [b.right, b.bottom], [b.left, b.bottom]];
    const pos = [], uv = [];
    for (const [wx, wy] of corners) { const v = terrain.worldToScene(wx, wy, P.groundLift); pos.push(v.x, v.y, v.z); uv.push(wx / WORLD, 1 - wy / WORLD); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    return g;
  }

  function disposeOwned() {
    for (const r of [bandTex, geometry, material]) { if (r && typeof r.dispose === 'function') { try { r.dispose(); } catch (_) { /* keep tearing down */ } } }
    bandTex = geometry = material = null; mesh = null; // tint is borrowed — never disposed
  }

  async function prepare() {
    if (disposed) { stats.reason = 'disposed'; return false; }
    const myEpoch = ++epoch; stats.epoch = epoch; stats.prepareCount++;
    if (mesh) { stats.rePrepareDisposals++; disposeOwned(); released = false; stats.hasMesh = false; }
    stats.preparing = true; stats.reason = 'preparing';
    try {
      if (typeof deps.tintLoader === 'function') { const t = await deps.tintLoader(); if (t && t.isTexture) { /* borrowed via loader */ } } // latest-async point
    } catch (_) { /* a failed optional tint never fails the underlay */ }
    if (disposed || myEpoch !== epoch) { stats.canceledCleanups++; stats.preparing = false; return false; } // superseded/disposed pre-build: nothing owned yet
    let t = null, g = null, m = null;
    try {
      t = buildBand(); g = buildGeometry();
      m = new THREE.MeshBasicMaterial({ color: (THREE.Color ? new THREE.Color(P.color) : P.color), map: tint || null, alphaMap: t, transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    } catch (e) {
      for (const r of [t, g, m]) r && typeof r.dispose === 'function' && r.dispose();
      if (myEpoch === epoch && !disposed) { stats.reason = 'build-failed'; stats.preparing = false; }
      return false;
    }
    // epoch/cancel AFTER build: dispose the just-built owned resources, never expose (unit 3).
    if (disposed || myEpoch !== epoch) {
      stats.canceledCleanups++;
      for (const r of [t, g, m]) r && typeof r.dispose === 'function' && r.dispose();
      stats.preparing = false; return false;
    }
    bandTex = t; geometry = g; material = m;
    mesh = new THREE.Mesh(geometry, material); mesh.name = 'rift-cliff-contact-underlay'; mesh.frustumCulled = false; mesh.renderOrder = P.renderOrder;
    released = false; stats.hasMesh = true; stats.preparing = false; stats.reason = 'contact-underlay';
    return true;
  }

  function invalidateNav() {
    if (disposed || !mesh) return stats.reason;
    try { const next = buildBand(); if (bandTex && typeof bandTex.dispose === 'function') bandTex.dispose(); bandTex = next; if (material) { material.alphaMap = next; material.needsUpdate = true; } stats.reason = 'nav-rebuilt'; }
    catch (_) { stats.reason = 'nav-rebuild-failed'; }
    return stats.reason;
  }

  function dispose() {
    if (disposed) return false;
    disposed = true; epoch++; stats.preparing = false; stats.active = false; stats.reason = 'disposed'; stats.hasMesh = false;
    if (!released) { if (mesh && typeof mesh.removeFromParent === 'function') mesh.removeFromParent(); disposeOwned(); released = true; stats.ownedReleased = true; }
    // borrowed tintTexture intentionally left alive (stats.borrowedTintDisposed stays false)
    return true;
  }

  function snapshot() {
    return Object.freeze({ endId: 'CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX-CANDIDATE', ...stats, disposed, tintBorrowed: !!tint });
  }

  return Object.freeze({ prepare, invalidateNav, dispose, snapshot, get object3d() { return mesh && !disposed ? mesh : null; } });
}

export default Object.freeze({ createRiftCliffContactUnderlay, UNDERLAY_PARAMS });

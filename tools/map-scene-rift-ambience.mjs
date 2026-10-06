/* World-space integration of the preserved ANIMVFX candidate.
 * This adapter is decorative only: no input, scene/save mutation, timers or camera transform.
 * The caller owns reduced motion and PNG-export exclusion. Recreate after in-place nav edits;
 * replacement walkable arrays are detected and cached automatically.
 */
import candidate from './team-followup-20261005/hell-rift/ANIMVFX/rift-ambience.mjs';

const PAINTING = 'assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png';
const ABYSS = 'assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png';
const PINS = Object.freeze({
  painting: 'a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4',
  abyss: 'ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991',
  originalNav: '52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb',
  nav: 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179'
});
const STRUCTURE = Object.freeze([
  ['west', 'flat', ['west-0', 'west-1']],
  ['east', 'flat', ['east-0', 'east-1']],
  ['centre', 'flat', ['centre-0', 'centre-1']],
  ['abyss', 'flat', ['rift-depth']],
  ['foot', 'foot', ['west-root', 'east-horn', 'south-root']],
  ['front', 'flat', []]
]);
const CAPS = Object.freeze({ back: .12, ground: .10, front: .10 });
const EXCLUSION = Object.freeze({ halfWidth: 40, aboveFoot: 96, belowFoot: 24 });
const WORLD = 8000, NAV_SIZE = 40000, TILE = 40;
const finite = Number.isFinite;
const identity = p => `${p.footY}:${p.size}`;
const emptyStats = () => ({ visited: 0, drawn: 0, culled: 0, peak: 0 });

function validObject(o) {
  if (!o || !['x', 'y', 'width', 'height', 'pivotX', 'pivotY', 'rotation', 'opacity'].every(k => finite(o[k]))) return false;
  if (Math.abs(o.x) > 40000 || Math.abs(o.y) > 40000 || Math.abs(o.rotation) > 360 || o.width < 1 || o.height < 1 || o.width > 32000 || o.height > 32000 || o.pivotX < 0 || o.pivotX > 1 || o.pivotY < 0 || o.pivotY > 1 || o.opacity < 0 || o.opacity > 1 || typeof o.flipX !== 'boolean') return false;
  if (o.maskFeather !== undefined && (!o.mask || !finite(o.maskFeather) || o.maskFeather < 0 || o.maskFeather > 160)) return false;
  if (o.sourceParallax !== undefined && (!o.mask || !finite(o.sourceParallax) || o.sourceParallax < 0 || o.sourceParallax > 1)) return false;
  return o.mask === undefined || (Array.isArray(o.mask) && o.mask.length >= 3 && o.mask.length <= 256 && o.mask.every(v => Array.isArray(v) && v.length === 2 && v.every(n => finite(n) && n >= 0 && n <= 1)));
}

/** Only the saved, isolated painted-rift result has the supported coordinate contract. */
export function supportsRiftAmbience(scene) {
  try {
    if (!scene || scene.format !== 'exoduser-map-scene' || scene.version !== 1 || scene.productionStatus !== 'ISOLATED_EDITOR_RESULT_NOT_ADOPTED') return false;
    if (scene.world?.cols !== 200 || scene.world.rows !== 200 || scene.world.tileSize !== TILE || !Array.isArray(scene.walkable) || scene.walkable.length !== NAV_SIZE) return false;
    if (scene.start?.x !== 4020 || scene.start.y !== 7740 || scene.exit?.x !== 4020 || scene.exit.y !== 1740 || scene.navigationReview?.basis !== 'painted-eastern-ledge') return false;
    if (!Object.entries(PINS).every(([key, value]) => scene.sourcePins?.[key] === value)) return false;
    if (!Array.isArray(scene.assets) || scene.assets.length > 128 || !Array.isArray(scene.layers) || scene.layers.length !== STRUCTURE.length) return false;
    let count = 0;
    for (const [i, [id, sort, ids]] of STRUCTURE.entries()) {
      const l = scene.layers[i];
      if (l?.id !== id || l.sort !== sort || l.parallax !== 1 || typeof l.visible !== 'boolean' || !Array.isArray(l.objects)) return false;
      if ((count += l.objects.length) > 2000 || !l.objects.every(validObject)) return false;
      for (const assetId of ids) {
        const o = l.objects.find(v => v.id === `obj-${assetId}` && v.assetId === assetId);
        const a = scene.assets.find(v => v.id === assetId);
        if (!o || !a || a.src !== (assetId === 'rift-depth' ? ABYSS : PAINTING) || a.width !== 1920 || a.height !== 1920) return false;
        if (assetId === 'rift-depth' && !o.mask) return false;
      }
    }
    return true;
  } catch (_) { return false; }
}

function worldPoint(o, u, v) {
  const x = (u - o.pivotX) * o.width * (o.flipX ? -1 : 1), y = (v - o.pivotY) * o.height;
  const a = o.rotation * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return { x: o.x + x * c - y * s, y: o.y + x * s + y * c };
}
function polygon(o) { return (o.mask || [[0, 0], [1, 0], [1, 1], [0, 1]]).map(([u, v]) => worldPoint(o, u, v)); }
function inside(points, x, y) {
  let result = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) result = !result;
  }
  return result;
}
function pathPolygon(ctx, points) {
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.closePath(); ctx.clip();
}
function actorBox(player) {
  return player && finite(player.x) && finite(player.y) ? {
    x0: player.x - EXCLUSION.halfWidth, x1: player.x + EXCLUSION.halfWidth,
    y0: player.y - EXCLUSION.aboveFoot, y1: player.y + EXCLUSION.belowFoot
  } : null;
}
function overlaps(box, x, y, rx, ry = rx) {
  return box && x + rx >= box.x0 && x - rx <= box.x1 && y + ry >= box.y0 && y - ry <= box.y1;
}
function clipActor(ctx, box) {
  if (!box) return;
  ctx.beginPath(); ctx.rect(0, 0, WORLD, WORLD);
  ctx.rect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
  ctx.clip('evenodd');
}
function usableContext(ctx) {
  return ctx && ['save', 'restore', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'clip', 'rect', 'arc', 'ellipse', 'fill'].every(k => typeof ctx[k] === 'function');
}

/** ctx already has DPR/viewport transforms. canWalk receives (scene, x, y, radius=12). */
export function createRiftAmbience(scene, canWalk) {
  if (!supportsRiftAmbience(scene) || typeof canWalk !== 'function') return null;
  const bandStats = { back: null, ground: null, front: null };
  const sources = new Map();
  // field() omits particles at their fade endpoints. Four phases collect all 22 identities.
  for (let q = 0; q < 4; q++) for (const p of candidate.field('ground', candidate.BANDS.ground.lifeMs * q / 4)) {
    if (!sources.has(identity(p))) sources.set(identity(p), { x: p.x, y: p.footY });
  }
  let navRef, anchors = new Map(), centres = [], runs = [], navPath = null;
  let active = true, reason = '', navActive = false, navReason = '', cacheBuilds = 0, nearestComparisons = 0, canWalkChecks = 0, navCount = 0;
  function walk(x, y) { canWalkChecks++; return !!canWalk(scene, x, y, 12); }
  function rebuildNav() {
    navRef = scene.walkable; anchors = new Map(); centres = []; runs = []; navPath = null; navCount = 0; cacheBuilds++;
    navActive = false; navReason = 'invalid-nav';
    if (!Array.isArray(navRef) || navRef.length !== NAV_SIZE || !navRef.every(v => v === 0 || v === 1)) return;
    for (let y = 0; y < 200; y++) {
      let begin = -1;
      for (let x = 0; x <= 200; x++) {
        const open = x < 200 && navRef[y * 200 + x] === 1;
        if (open) {
          navCount++;
          const p = { x: (x + .5) * TILE, y: (y + .5) * TILE };
          if (walk(p.x, p.y)) centres.push(p);
          if (begin < 0) begin = x;
        } else if (begin >= 0) { runs.push({ x: begin * TILE, y: y * TILE, w: (x - begin) * TILE, h: TILE }); begin = -1; }
      }
    }
    if (!centres.length) { navReason = 'empty-nav'; return; }
    for (const [key, src] of sources) {
      let nearest, distance = Infinity;
      for (const p of centres) {
        nearestComparisons++;
        const d = (src.x - p.x) ** 2 + (src.y - p.y) ** 2;
        if (d < distance) { distance = d; nearest = p; }
      }
      anchors.set(key, nearest);
    }
    if (typeof Path2D === 'function') {
      navPath = new Path2D();
      for (const r of runs) navPath.rect(r.x, r.y, r.w, r.h);
    }
    navActive = true; navReason = '';
  }
  function refresh() {
    if (!supportsRiftAmbience(scene)) { active = false; reason = 'unsupported-scene'; return false; }
    try { if (navRef !== scene.walkable) rebuildNav(); }
    catch (_) { navActive = false; navReason = 'nav-validation-failed'; }
    active = navActive; reason = navReason;
    return active;
  }
  if (!refresh()) return null;

  function draw(ctx, band, timeMs, options = {}) {
    const stats = emptyStats();
    if (!Object.hasOwn(candidate.BANDS, band)) return stats;
    bandStats[band] = stats;
    if (!refresh() || !usableContext(ctx)) return { ...stats };
    const l = scene.layers.find(v => v.id === 'abyss'), o = l.objects.find(v => v.id === 'obj-rift-depth');
    if (band === 'back' && (!l.visible || o.opacity <= 0)) return { ...stats };
    const abyssPolygon = band === 'back' ? polygon(o) : null;
    const foot = scene.layers.find(v => v.id === 'foot');
    const occluders = band === 'front' && foot.visible ? foot.objects.filter(v => v.opacity > 0).map(polygon) : [];
    const box = actorBox(options?.player), b = candidate.BANDS[band], parts = candidate.field(band, timeMs);
    const parentAlpha = finite(ctx.globalAlpha) ? ctx.globalAlpha : 1;
    ctx.save();
    try {
      ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.rect(0, 0, WORLD, WORLD); ctx.clip();
      if (band === 'back') pathPolygon(ctx, abyssPolygon);
      if (band === 'ground') {
        if (navPath) ctx.clip(navPath);
        else { ctx.beginPath(); for (const r of runs) ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); }
      }
      clipActor(ctx, box);
      for (const p of parts) {
        stats.visited++;
        let x = p.x, y = p.y, rx = p.size * 2.4, ry = rx;
        if (band === 'back') {
          // .965 belongs to the image's source, not the fixed-world mask or this context.
          const point = worldPoint(o, p.x / WORLD, p.y / WORLD); x = point.x; y = point.y;
          if (!inside(abyssPolygon, x, y)) { stats.culled++; continue; }
        } else if (band === 'ground') {
          const a = anchors.get(identity(p));
          if (!a || !walk(a.x, a.y)) { stats.culled++; continue; }
          x = a.x; y = a.y; rx = Math.max(48, Math.min(110, p.size * .4)); ry = Math.min(24, rx * .22);
        } else if (occluders.some(points => inside(points, x, p.footY))) { stats.culled++; continue; }
        if (x < 0 || x > WORLD || y < 0 || y > WORLD || overlaps(box, x, y, rx, ry)) { stats.culled++; continue; }
        const alpha = Math.min(CAPS[band], p.alpha) * (band === 'back' ? Math.min(1, o.opacity / .38) : 1);
        if (alpha <= .001) { stats.culled++; continue; }
        const [r, g, blue] = b.color;
        ctx.globalAlpha = parentAlpha * alpha;
        ctx.fillStyle = `rgb(${r},${g},${blue})`;
        if (band !== 'ground' && typeof ctx.createRadialGradient === 'function') {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);
          gradient.addColorStop(0, `rgba(${r},${g},${blue},1)`); gradient.addColorStop(1, `rgba(${r},${g},${blue},0)`);
          ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        if (band === 'ground') ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        else ctx.arc(x, y, rx, 0, Math.PI * 2);
        ctx.fill(); stats.drawn++; stats.peak = Math.max(stats.peak, alpha);
      }
    } finally { ctx.restore(); }
    return { ...stats };
  }

  function snapshot() {
    refresh();
    return {
      endId: 'ANIMVFX-CH1-RIFT-AMBIENCE-CANDIDATE-20261006', active, reason, coordinateSpace: 'world',
      navCount, validCentres: centres.length, navClipRuns: runs.length, cacheBuilds, nearestComparisons, canWalkChecks,
      exclusion: { ...EXCLUSION }, alphaCaps: { ...CAPS },
      groundAnchors: [...anchors.values()].map(p => ({ ...p })),
      bands: Object.fromEntries(Object.entries(bandStats).map(([key, stats]) => [key, stats && { ...stats }]))
    };
  }
  return Object.freeze({ draw, snapshot });
}

/*
 * rift-ambience.mjs — ANIMVFX CANDIDATE (지옥의 틈 · 잔류자의 계곡)
 *
 * Owner role : ANIMVFX (PID 7877 / UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * Assignment : ROOT-CLAUDE8-EXISTING-ROLE-ASSIGNMENT-20261006 — "캐릭터 발접지·앞뒤 가림·VFX 수명 후보"
 * End ID     : ANIMVFX-CH1-RIFT-AMBIENCE-CANDIDATE-20261006
 *
 * WHAT THIS IS
 *   A standalone, depth-aware ambient-VFX layer for the existing image-scene rift result
 *   (assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json). It adds drifting
 *   abyss motes, grounded mist, and sparse foreground embers so the still crop composition
 *   reads as a living, breathing rift — without hiding the warrior, projectiles, or loot.
 *
 * WHAT THIS IS NOT (constraints honored)
 *   - Candidate only; NOT production acceptance. Does not mutate the scene, the map, bake,
 *     collision, saves, or any production/shared doc/git.
 *   - Does NOT overwrite or re-register MapSceneActor / editor.html / map-scene-core.js.
 *     It never auto-attaches to the editor render loop; an integrator wires the three passes in.
 *   - Pure Canvas-2D. No WebGL/GPU proxy, no image decode, no fetch, no new asset, no worker,
 *     no timers, no automation. Respects the rejected GPU/decoder접점 — zero bypass.
 *   - Deterministic (seeded) so QA can reproduce every frame from (time, view) alone.
 *   - Honors 2_3 (돌진/패링/방패 수정금지), Q-only magic parry, and the attack-ticket ban:
 *     this module draws decorative ambience only and emits no gameplay input, hit, or ticket.
 *
 * DEPTH / OCCLUSION CONTRACT (integrator places passes between the scene's own layers)
 *   abyss(back) image
 *     → drawBack(ctx, view, t)      ambient motes, parallax .965 (matches the abyss source)
 *   west / east / centre crop art
 *     → drawGround(ctx, view, t)    grounded mist, parallax 1  (foot occluders will cover it)
 *   foot layer  (west-root / east-horn / south-root occluders + MapSceneActor foot-sort)
 *     → drawFront(ctx, view, t)     sparse foreground embers, drawn last, readability-capped
 *   (actor is drawn inside the foot sort by the editor; front embers stay low-alpha above it.)
 *
 * FOOT-GROUNDING (발접지)
 *   Mist wisps are flat ground ellipses anchored to a world footline (never floating). Embers
 *   are born at a footline and rise (world y decreases = screen-up), so every particle traces
 *   back to the ground the same way the actor's 25×11 shadow grounds the warrior.
 *
 * VFX LIFETIME (수명)
 *   Each particle loops one lifeMs cycle: fade-in (first 15%) → hold → fade-out (last 30%),
 *   then culled off-viewport. snapshot() reports alive / culled / peak alpha per band.
 */

'use strict';

/* ---- scene-grounded constants (read-only mirror of the saved rift scene) ---------------- */
export const RIFT = Object.freeze({
  world: Object.freeze({ cols: 200, rows: 200, tile: 40, w: 8000, h: 8000 }),
  start: Object.freeze({ x: 4020, y: 7740 }),  // 하층 진입 (south, bottom)
  exit: Object.freeze({ x: 4020, y: 1740 }),   // 북쪽 상승로 (north, top)
  // abyss soft-mask tile bbox (74,61)→(115,163) from HELL_RIFT_EDITOR_RESULT_20261006, ×tile:
  abyss: Object.freeze({ x0: 2960, y0: 2440, x1: 4600, y1: 6520, opacity: 0.38, parallax: 0.965 }),
  // foot-layer occluders — world foot anchors (pivot 0,1 in the scene); embers avoid these boxes:
  occluders: Object.freeze([
    Object.freeze({ id: 'west-root', x: 2120, y: 5360, w: 640, h: 720 }),
    Object.freeze({ id: 'east-horn', x: 5640, y: 4320, w: 360, h: 1000 }),
    Object.freeze({ id: 'south-root', x: 4720, y: 6920, w: 520, h: 640 })
  ]),
  // ember hotspots near the readable landmarks, kept off the start/exit footline:
  embers: Object.freeze([
    Object.freeze({ x: 3180, y: 6820 }),  // cam-1 남쪽 잔불
    Object.freeze({ x: 5820, y: 4660 }),  // cam-4 부탁을 품은 턱
    Object.freeze({ x: 4100, y: 4100 })   // cam-5 심연의 빛
  ])
});

/* actor footprint used only for the readability guard (mirror of map-scene-actor.js) */
const ACTOR_BODY = 80, ACTOR_HALF = 28; // ~body height / half shadow-plus-body width in world px

/* ---- deterministic PRNG (mulberry32) — no Math.random, fully reproducible ---------------- */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* lifetime alpha envelope: fade-in 15%, hold, fade-out last 30% */
function envelope(phase) {
  if (phase < 0.15) return phase / 0.15;
  if (phase > 0.70) return (1 - phase) / 0.30;
  return 1;
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function inBox(x, y, b, pad = 0) { return x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - b.h - pad && y <= b.y + pad; }

/* ---- band definitions -------------------------------------------------------------------- */
/* Each band is a fixed population of particles whose per-cycle motion is a pure function of
 * (time, particle seed). Regions/counts/alpha are tuned for readability (character first). */
const BANDS = Object.freeze({
  // BACK: faint rising motes inside the abyss mask bbox. Matches abyss parallax so it sits in-depth.
  back: Object.freeze({
    seed: 0x41564258, count: 44, parallax: 0.965, lifeMs: 9000,
    rise: 520, sway: 90, size: [1.4, 3.0], maxAlpha: 0.12,
    color: [214, 120, 96], glow: true
  }),
  // GROUND: slow mist bands hugging the walkable corridor. Flat ellipses = grounded, no float.
  ground: Object.freeze({
    seed: 0x47524e44, count: 22, parallax: 1, lifeMs: 14000,
    rise: 40, sway: 220, size: [120, 300], maxAlpha: 0.10,
    color: [120, 128, 120], glow: false
  }),
  // FRONT: sparse foreground embers, drawn above the actor. Deliberately few + tiny + capped.
  front: Object.freeze({
    seed: 0x46524e54, count: 18, parallax: 1.04, lifeMs: 7000,
    rise: 680, sway: 60, size: [1.0, 2.4], maxAlpha: 0.22,
    color: [224, 123, 58], glow: true
  })
});

/* Spawn a particle's static identity (deterministic) for a band. */
function seedParticle(band, i) {
  const r = rng(BANDS[band].seed ^ (i * 0x9e3779b1));
  const b = BANDS[band];
  let x, y;
  if (band === 'back') {
    x = RIFT.abyss.x0 + r() * (RIFT.abyss.x1 - RIFT.abyss.x0);
    y = RIFT.abyss.y0 + r() * (RIFT.abyss.y1 - RIFT.abyss.y0);
  } else if (band === 'ground') {
    // along the south→north corridor spine, with lateral spread
    const tpos = r();
    x = RIFT.start.x + (RIFT.exit.x - RIFT.start.x) * tpos + (r() - 0.5) * 2600;
    y = RIFT.start.y + (RIFT.exit.y - RIFT.start.y) * tpos + (r() - 0.5) * 900;
  } else {
    // front embers cluster around a hotspot, nudged off the exact start/exit footline
    const h = RIFT.embers[i % RIFT.embers.length];
    x = h.x + (r() - 0.5) * 1400;
    y = h.y + (r() - 0.5) * 900;
  }
  return {
    baseX: x, footY: y,
    phaseOffset: r(),
    swayPhase: r() * Math.PI * 2,
    swayRate: 0.5 + r() * 1.3,
    size: b.size[0] + r() * (b.size[1] - b.size[0]),
    bright: 0.6 + r() * 0.4
  };
}

/* ---- pure field: particle world-state at a given time (canvas-free; QA can run in Node) --- */
export function field(band, timeMs) {
  const b = BANDS[band], out = [];
  const t = Number.isFinite(timeMs) ? Math.max(0, timeMs) : 0;
  for (let i = 0; i < b.count; i++) {
    const p = seedParticle(band, i);
    const phase = ((t / b.lifeMs) + p.phaseOffset) % 1;
    const alpha = envelope(phase) * b.maxAlpha * p.bright;
    if (alpha <= 0.001) continue;
    const sway = Math.sin(p.swayPhase + phase * Math.PI * 2 * p.swayRate) * b.sway;
    const wx = p.baseX + sway;
    const wy = p.footY - phase * b.rise;            // rise = world-y decreasing (screen-up)
    out.push({ x: wx, y: wy, footY: p.footY, alpha, size: p.size, phase });
  }
  return out;
}

/* ---- projection: world → screen for a viewport-centered camera ---------------------------- */
/* view = { cx, cy, width, height, scale }  (cx/cy = world point at viewport center) */
function project(wx, wy, parallax, view) {
  const dx = (wx - view.cx) * parallax, dy = (wy - view.cy) * parallax;
  return { sx: view.width / 2 + dx * view.scale, sy: view.height / 2 + dy * view.scale };
}
function onScreen(sx, sy, view, margin) {
  return sx >= -margin && sx <= view.width + margin && sy >= -margin && sy <= view.height + margin;
}

/* ---- drawing passes (Canvas-2D only; tolerant of a missing/partial ctx) -------------------- */
function paintBand(ctx, band, view, timeMs, stats) {
  if (!ctx || typeof ctx.beginPath !== 'function') return stats;
  const b = BANDS[band], parts = field(band, timeMs), margin = 64;
  ctx.save();
  try {
    for (const p of parts) {
      const { sx, sy } = project(p.x, p.y, b.parallax, view);
      if (!onScreen(sx, sy, view, margin)) { stats.culled++; continue; }
      // foreground embers never paint over a foot occluder (keep the depth read honest)
      if (band === 'front' && RIFT.occluders.some(o => inBox(p.x, p.footY, o, 20))) { stats.culled++; continue; }
      stats.drawn++;
      if (p.alpha > stats.peak) stats.peak = p.alpha;
      const [cr, cg, cb] = b.color, rpx = p.size * view.scale;
      ctx.globalAlpha = p.alpha;
      if (band === 'ground') {
        // flat grounded ellipse — hugs the footline, no vertical float
        const ry = Math.max(1, rpx * 0.34);
        if (typeof ctx.ellipse === 'function') {
          ctx.fillStyle = `rgba(${cr},${cg},${cb},1)`;
          ctx.beginPath(); ctx.ellipse(sx, sy, Math.max(1, rpx), ry, 0, 0, Math.PI * 2); ctx.fill();
        }
      } else if (b.glow && typeof ctx.createRadialGradient === 'function') {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(0.5, rpx * 2.4));
        g.addColorStop(0, `rgba(${cr},${cg},${cb},1)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.5, rpx * 2.4), 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = `rgba(${cr},${cg},${cb},1)`;
        ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.5, rpx), 0, Math.PI * 2); ctx.fill();
      }
    }
  } finally { ctx.restore(); }
  return stats;
}

const lastStats = { back: null, ground: null, front: null };
function run(ctx, band, view, timeMs) {
  const stats = { drawn: 0, culled: 0, peak: 0 };
  paintBand(ctx, band, view, timeMs, stats);
  lastStats[band] = stats;
  return stats;
}

export function drawBack(ctx, view, timeMs) { return run(ctx, 'back', view, timeMs); }
export function drawGround(ctx, view, timeMs) { return run(ctx, 'ground', view, timeMs); }
export function drawFront(ctx, view, timeMs) { return run(ctx, 'front', view, timeMs); }

/* ---- readability guard: character/projectile must stay legible under the front embers ----- */
/* Returns coverage of an actor-sized world box by front embers + the band's peak alpha. */
export function readability(actorWorld, timeMs) {
  const ax = actorWorld && Number.isFinite(actorWorld.x) ? actorWorld.x : RIFT.start.x;
  const ay = actorWorld && Number.isFinite(actorWorld.y) ? actorWorld.y : RIFT.start.y;
  const parts = field('front', timeMs);
  let coverAlpha = 0, peak = 0;
  for (const p of parts) {
    if (p.alpha > peak) peak = p.alpha;
    // actor box: width 2*ACTOR_HALF, from footline up ACTOR_BODY
    if (p.x >= ax - ACTOR_HALF && p.x <= ax + ACTOR_HALF && p.y >= ay - ACTOR_BODY && p.y <= ay) {
      coverAlpha += p.alpha * (p.size * p.size); // crude α·area proxy
    }
  }
  const boxArea = (2 * ACTOR_HALF) * ACTOR_BODY;
  const coverage = clamp(coverAlpha / boxArea, 0, 1);
  // thresholds: foreground must never veil the warrior
  const pass = peak <= 0.25 && coverage <= 0.03;
  return { frontPeakAlpha: +peak.toFixed(4), actorBoxCoverage: +coverage.toFixed(5), pass };
}

/* ---- snapshot for QA (mirror of MapSceneActor.snapshot shape) ----------------------------- */
export function snapshot() {
  return Object.freeze({
    endId: 'ANIMVFX-CH1-RIFT-AMBIENCE-CANDIDATE-20261006',
    bands: Object.freeze({
      back: lastStats.back ? Object.freeze({ ...lastStats.back }) : null,
      ground: lastStats.ground ? Object.freeze({ ...lastStats.ground }) : null,
      front: lastStats.front ? Object.freeze({ ...lastStats.front }) : null
    })
  });
}

/* ---- canvas-free self-test: determinism + invariants (run under Node or the browser) ------ */
export function selfTest() {
  const checks = [];
  const push = (name, ok, detail) => checks.push({ name, ok: !!ok, detail });

  // 1) determinism: same time → identical field
  const a = field('front', 3000), b = field('front', 3000);
  push('deterministic', JSON.stringify(a) === JSON.stringify(b), `${a.length} parts`);

  // 2) alpha within band cap
  let capOk = true;
  for (const band of ['back', 'ground', 'front']) {
    for (const p of field(band, 5000)) if (p.alpha > BANDS[band].maxAlpha + 1e-6) capOk = false;
  }
  push('alpha<=cap', capOk);

  // 3) back motes stay inside the abyss bbox (horizontal span after sway)
  let abyssOk = true;
  for (const p of field('back', 2200)) {
    if (p.x < RIFT.abyss.x0 - BANDS.back.sway - 1 || p.x > RIFT.abyss.x1 + BANDS.back.sway + 1) abyssOk = false;
  }
  push('back-in-abyss', abyssOk);

  // 4) foot-grounding: every particle's render y is at or above its footline (rising only)
  let groundedOk = true;
  for (const band of ['back', 'ground', 'front']) {
    for (const p of field(band, 8000)) if (p.y > p.footY + 1e-6) groundedOk = false;
  }
  push('foot-grounded', groundedOk);

  // 5) lifetime envelope: alpha is 0 at cycle edges for a mid-brightness sample
  const env = [envelope(0.001), envelope(0.5), envelope(0.999)];
  push('lifetime-envelope', env[0] < 0.05 && env[1] === 1 && env[2] < 0.05, env.join(','));

  // 6) readability at the start footline
  const rd = readability(RIFT.start, 4000);
  push('readability', rd.pass, `peak=${rd.frontPeakAlpha} cover=${rd.actorBoxCoverage}`);

  const pass = checks.every(c => c.ok);
  return { pass, checks };
}

export default Object.freeze({
  RIFT, BANDS, field, drawBack, drawGround, drawFront, readability, snapshot, selfTest
});

/* Optional browser handle for an integrator — never auto-registers into the editor loop. */
if (typeof window !== 'undefined' && !window.RiftAmbience) {
  try { window.RiftAmbience = { field, drawBack, drawGround, drawFront, readability, snapshot, selfTest, RIFT }; }
  catch (_) { /* read-only global; candidate stays passive */ }
}

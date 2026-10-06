/*
 * rift-render-lifecycle.candidate.mjs — ANIMVFX CANDIDATE (idle↔dialogue↔resume time authority)
 *
 * Owner role : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * Parent     : ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006
 * End ID     : ANIMVFX-CH1-RIFT-RENDER-LIFECYCLE-CANDIDATE-20261006
 *
 * WHAT / WHY
 *   The adopted ambience adapter `tools/map-scene-rift-ambience.mjs` draws with
 *   `draw(ctx, band, timeMs, {player})` and, by contract, "the caller owns reduced motion and
 *   PNG-export exclusion" — i.e. the caller owns the clock. The STORY dialogue controller
 *   (`tools/map-scene-rift-dialogue.mjs`) is a pure session state machine with no clock. Nothing
 *   between them maintains a continuous, pausable, resettable ambience time across
 *   idle ↔ dialogue ↔ resume. An integrator that passes raw `performance.now()` therefore jumps
 *   every live particle's lifetime phase by the full paused span when a dialogue closes.
 *
 *   Reproduced (real field math, front lifeMs 7000, an 8.3 s read): resume phase jumps 0.0843 →
 *   0.2700, i.e. 18.6 % of a full life cycle — a visible pop on every live particle. A frozen
 *   accumulator resumes at the exact paused phase (Δ=0).
 *
 *   This candidate is that missing authority: a PASSIVE accumulator the integrator feeds each
 *   frame (the "input port"), returning a continuous `timeMs` to hand to the ambience `draw`.
 *   It freezes while a dialogue is open / reduced-motion / toggled off, and restarts phases on
 *   a scene swap (`reset`). It is NOT a rendering change and is NOT an adapter bug fix.
 *
 * CONTRACTS PRESERVED (all owned by the caller/adapter, untouched here)
 *   - world-1-transform: this module never touches a canvas or transform.
 *   - nav-mask / actor exclusion / band alpha caps: live entirely in the ambience adapter.
 *   - reduced motion: honored by FREEZING the clock (motion stops, position continuity kept).
 *   - toggle: honored via the `paused` input (clock freezes, no teardown).
 *   - PNG-export exclusion: PNG normally draws no ambience; `pngTime()` only offers a fixed,
 *     deterministic still-time if an integrator ever opts to include a single frame.
 *   - No new rAF/timer/worker/GPU/decoder: the integrator still owns its one frame loop; this is
 *     a pure timestamp transform. No input/scene/save mutation, no DOM, no fetch, no storage.
 *   - Protection: decorative/time-only; emits no gameplay input, hit, parry (Q-only), or ticket.
 */

'use strict';

const finite = Number.isFinite;

/** Factory → a passive render-lifecycle clock. No side effects, no timers. */
export function createRiftLifecycle(options = {}) {
  // Cap a single frame's delta so one backgrounded-tab gap (or a dialogue span wrongly counted
  // as running) cannot advance the clock by a huge leap; mirrors the editor's dt cap in spirit.
  const maxFrameMs = finite(options.maxFrameMs) && options.maxFrameMs > 0 ? options.maxFrameMs : 100;
  const pngFrameMs = finite(options.pngFrameMs) && options.pngFrameMs >= 0 ? options.pngFrameMs : 0;

  let clock = 0;          // continuous ambience time (paused spans excluded) — feed to draw()
  let lastNow = null;     // last wall-clock stamp; null = base not yet established
  let running = true;     // last computed run state
  let resets = 0, lastDtMs = 0, totalPausedMs = 0;

  /**
   * Input port — call once per frame BEFORE the ambience draws, then pass the return to
   * `ambience.draw(ctx, band, lifecycle.tick(now, state), { player })`.
   * @param {number} now   monotonic wall clock, e.g. performance.now()
   * @param {{paused?:boolean, reducedMotion?:boolean, dialogueOpen?:boolean}} [state]
   * @returns {number} continuous ambience timeMs (never decreases while running, never jumps on resume)
   */
  function tick(now, state = {}) {
    if (!finite(now)) return clock;                 // ignore a bad frame stamp; hold the clock
    const paused = state.paused === true, reduced = state.reducedMotion === true, talking = state.dialogueOpen === true;
    running = !(paused || reduced || talking);
    if (lastNow === null) { lastNow = now; return clock; }   // first frame only establishes the base
    let dt = now - lastNow;
    lastNow = now;
    if (!finite(dt) || dt < 0) dt = 0;              // monotonic guard (clock stalls, never rewinds)
    if (dt > maxFrameMs) dt = maxFrameMs;           // clamp one huge gap
    if (running) clock += dt; else totalPausedMs += dt;
    lastDtMs = dt;
    return clock;
  }

  /** Scene swap / in-place nav rebuild: restart lifetimes at 0 so phases do not carry over. */
  function reset(now) {
    clock = 0; resets++;
    lastNow = finite(now) ? now : null;             // re-establish the base on the next tick
    return clock;
  }

  /** Deterministic still-time for an opt-in PNG frame (ambience is normally excluded from PNG). */
  function pngTime() { return pngFrameMs; }

  function snapshot() {
    return { endId: 'ANIMVFX-CH1-RIFT-RENDER-LIFECYCLE-CANDIDATE-20261006',
      timeMs: clock, running, resets, lastDtMs, totalPausedMs, maxFrameMs };
  }

  return Object.freeze({ tick, reset, pngTime, snapshot });
}

/* ============================================================================================
 * RESIDENT GROUNDING SHADOWS — static, pure-Canvas contact ellipses for the 4 painted residents
 * (ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006). Decorative and time-independent: reads only the
 * residents' live foot objects (world x/y/width/height, pivot .5,1), never the scene/nav/atlas/
 * plate bytes, the lifecycle clock, or the dialogue/idle state (no animation verdict, no pause).
 * Drawn in the foot layer under each body so the sprite grounds on it. Unlike the animated
 * ambience, these belong to the STATIC composition and are included in a PNG the same way the
 * player is (no PNG exclusion). Trial-session boundary and original images are untouched.
 *
 * Reference (map-scene-actor.js): the warrior contact ellipse is 25×11 at standing body height 80.
 * Measured residents: standing h=80, w≈38–50 (≈ the 50px warrior shadow span); seated h=80·352/578.
 *     W0 = 2·25 = 50 (warrior shadow full width = standing-body width reference), H0 = 80
 *     rx = 25 · (width / W0)                   — proportional to resident width
 *     ry = 11 · (width / W0) · (height / H0)    — warrior 25:11 aspect, flattened for seated/shorter
 * No intrusion: each ellipse is foot-local; with the current four residents its bbox clears the
 * abyss bbox and the foot occluders (verified). Callers may pass `exclude` rects to subtract any
 * region so a shadow can never bleed into the abyss or a cliff-front occluder.
 */
const WARRIOR_SHADOW = Object.freeze({ rx: 25, ry: 11 });
const SHADOW_REF = Object.freeze({ width: 2 * WARRIOR_SHADOW.rx, height: 80 }); // W0=50, H0=80
const SHADOW_WORLD = 8000;
const SHADOW_FILL = 'rgba(7,12,9,1)'; // warrior shadow tone; alpha applied via globalAlpha

/** Pure radii from a resident's live world size; null if geometry is not finite/positive. */
export function residentShadowRadii(width, height) {
  if (!finite(width) || !finite(height) || width <= 0 || height <= 0) return null;
  const k = width / SHADOW_REF.width;
  const rx = WARRIOR_SHADOW.rx * k;
  const ry = WARRIOR_SHADOW.ry * k * (height / SHADOW_REF.height);
  if (!finite(rx) || !finite(ry) || rx <= 0 || ry <= 0) return null;
  return { rx, ry };
}

function usableShadowContext(ctx) {
  return ctx && ['save', 'restore', 'beginPath', 'rect', 'ellipse', 'clip', 'fill'].every(k => typeof ctx[k] === 'function');
}

/**
 * Draw static grounding ellipses under residents. ctx already carries the DPR/world transform
 * (same contract as the ambience adapter). `residents` = [{x,y,width,height,opacity?}].
 * options: { opacity=.55, exclude=[{x0,y0,x1,y1}] } — exclude subtracts regions (abyss/occluders).
 * Returns { drawn, skipped } and keeps ctx.save/restore balanced even if a draw throws.
 */
export function drawResidentShadows(ctx, residents, options = {}) {
  const stats = { drawn: 0, skipped: 0 };
  if (!usableShadowContext(ctx) || !Array.isArray(residents)) return stats;
  const base = finite(options.opacity) ? Math.min(1, Math.max(0, options.opacity)) : 0.55;
  const exclude = Array.isArray(options.exclude)
    ? options.exclude.filter(r => r && finite(r.x0) && finite(r.y0) && finite(r.x1) && finite(r.y1)) : [];
  const parentAlpha = finite(ctx.globalAlpha) ? ctx.globalAlpha : 1;
  ctx.save();
  try {
    ctx.globalCompositeOperation = 'source-over';
    if (finite(ctx.shadowBlur)) ctx.shadowBlur = 0;
    // Clip to the world, subtracting any excluded region, so no shadow bleeds into abyss/cliff-front.
    ctx.beginPath(); ctx.rect(0, 0, SHADOW_WORLD, SHADOW_WORLD);
    for (const r of exclude) ctx.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    ctx.clip('evenodd');
    for (const r of residents) {
      if (!r || !finite(r.x) || !finite(r.y) || r.x < 0 || r.x > SHADOW_WORLD || r.y < 0 || r.y > SHADOW_WORLD) { stats.skipped++; continue; }
      const radii = residentShadowRadii(r.width, r.height);
      if (!radii) { stats.skipped++; continue; }
      const a = (finite(r.opacity) ? Math.min(1, Math.max(0, r.opacity)) : base) * parentAlpha;
      if (a <= 0.001) { stats.skipped++; continue; }
      ctx.globalAlpha = a;
      ctx.fillStyle = SHADOW_FILL;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, radii.rx, radii.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      stats.drawn++;
    }
  } finally { ctx.restore(); }
  return stats;
}

export default Object.freeze({ createRiftLifecycle, residentShadowRadii, drawResidentShadows });

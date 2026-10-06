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

export default Object.freeze({ createRiftLifecycle });

/*
 * actor-effect-release-2_5d.candidate.mjs — ANIMVFX CANDIDATE (owned-resource fault-isolated release)
 *
 * Goal   : CH1-RIFT-ACTOR-EFFECT-OWNED-RELEASE-20261007
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-ACTOR-EFFECT-OWNED-RELEASE-20261007-ANIMVFX-CANDIDATE
 *
 * WHY — public tools/2_5d/actor-effect-lifetime.mjs dispose() (L182-188) is a single flat loop:
 *   `disposed=true; for(const e of all){ e.mesh.visible=false; scene.remove(e.mesh); e.material.dispose(); }
 *    dustGeo.dispose(); attackGeo.dispose();`
 * A throw in any `scene.remove`/`material.dispose` aborts the rest → remaining meshes/materials and the
 * shared dustGeo/attackGeo are never reached (GPU geometry/material leak). (The cross-module worldlab
 * teardown is already handled by root's newer world-lab; THIS is only the actor-effect INTERNAL
 * owned-resource boundary.) Ownership read from actor-effect-lifetime.mjs: `all`=[{mesh,material,…}]
 * (acquire L91-99, per-entry material), shared `dustGeo`/`attackGeo` (L84-85), detach via `scene.remove`.
 *
 * WHAT — an independent, pure release adapter. root supplies the real owned list + shared geometries +
 * the scene.remove binding; this attempts EVERY owned mesh.visibility / detach / material.dispose and
 * each shared geometry exactly once, fault-isolated: one throw records a safe {phase,label} and the
 * rest still run. Identity-deduped (a material/geometry disposed at most once), re-entry/repeat-safe
 * (once-state set before side effects; a second release() is a no-op), and it never declares success
 * when any step failed. It does NOT inspect .error/.message, execute getters/Proxies beyond invoking
 * the supplied methods, traverse/dispose the borrowed scene/camera/textures, or clear/mutate root's
 * source arrays (it works on a fixed snapshot copy).
 *
 * SCOPE — release lifetime only. No lifetime/cap/color/foot/world-coord/motion/damage/combat/GPU-create
 * change; no rig/factory/world-lab re-implementation. Protection 2_3 / Q-only magic blackBean
 * (E non-parry) / no-attack-ticket untouched. Physical GPU memory / actual pagehide / native = UNKNOWN.
 *
 * MINIMAL OLD/NEW for root (in actor-effect-lifetime.mjs dispose()):
 *   // OLD (L183-188):
 *   //   for (const e of all) { e.mesh.visible=false; scene.remove(e.mesh); e.material.dispose(); }
 *   //   if (typeof dustGeo.dispose==='function') dustGeo.dispose();
 *   //   if (typeof attackGeo.dispose==='function') attackGeo.dispose();
 *   // NEW:
 *   //   import { createActorEffectReleaser } from '<this file>';
 *   //   createActorEffectReleaser({ sceneRemove: m => scene.remove(m), owned: all, shared: [dustGeo, attackGeo] }).release();
 *   // (`disposed=true` stays before it; clearing all/free/live afterward is unaffected — adapter copies.)
 */

'use strict';

/**
 * spec = {
 *   sceneRemove: (mesh) => void,          // detach binding (borrowed scene; never traversed/disposed)
 *   owned:  Array<{ mesh, material }>,     // per-entry owned mesh + its own material
 *   shared: Array<geometry>                // shared geometries disposed once (dustGeo, attackGeo)
 * }
 * Returns a releaser { release(), snapshot() }. release() is idempotent and re-entry safe.
 */
export function createActorEffectReleaser(spec = {}) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error('release spec 객체 필요');
  const sceneRemove = typeof spec.sceneRemove === 'function' ? spec.sceneRemove : null;
  // Fixed snapshot copies — root's arrays are never read again, mutated, or cleared by this adapter.
  const owned = Array.isArray(spec.owned) ? spec.owned.slice() : [];
  const shared = Array.isArray(spec.shared) ? spec.shared.slice() : [];

  let entered = false, done = false, result = null;
  const seen = new WeakSet();                 // identity dedup: a material/geometry released at most once

  const state = {
    endId: 'CH1-RIFT-ACTOR-EFFECT-OWNED-RELEASE-20261007-ANIMVFX-CANDIDATE',
    attempted: 0, succeeded: 0, deduped: 0, reentrantCalls: 0,
    ownedCount: owned.length, sharedCount: shared.length,
    failures: [], complete: false, reason: 'not-released'
  };

  // One isolated side-effect attempt. A throw records a safe {phase,label}; never rethrows,
  // never reads the caught error's .message/.error.
  function attempt(phase, label, fn) {
    state.attempted++;
    try { fn(); state.succeeded++; return true; }
    catch (_) { state.failures.push(Object.freeze({ phase, label })); return false; }
  }
  // Dispose an object once (identity-deduped). Returns false (skipped) if already released.
  function disposeOnce(obj, phase, label) {
    if (!obj || seen.has(obj)) { if (obj) state.deduped++; return; }
    seen.add(obj);
    attempt(phase, label, () => { const d = obj.dispose; if (typeof d === 'function') d.call(obj); });
  }

  function release() {
    if (done) { return snapshot(); }                 // idempotent: second release is a no-op
    if (entered) { state.reentrantCalls++; return snapshot(); } // re-entry during side effects: guarded no-op
    entered = true;                                  // once-state BEFORE side effects

    for (let i = 0; i < owned.length; i++) {
      const e = owned[i];
      if (!e || typeof e !== 'object') { state.failures.push(Object.freeze({ phase: 'entry', label: 'owned#' + i })); continue; }
      const mesh = e.mesh, material = e.material;
      if (mesh && !seen.has(mesh)) {
        attempt('visibility', 'mesh#' + i, () => { mesh.visible = false; });
        if (sceneRemove) attempt('remove', 'mesh#' + i, () => sceneRemove(mesh));
        seen.add(mesh);                              // dedup the mesh after its detach attempt
      } else if (mesh) { state.deduped++; }
      disposeOnce(material, 'material', 'material#' + i);   // per-entry material disposed once
    }
    for (let j = 0; j < shared.length; j++) disposeOnce(shared[j], 'shared', 'shared#' + j);

    done = true;
    state.complete = state.failures.length === 0;    // never success on any failure
    state.reason = state.complete ? 'released' : 'released-with-failures';
    result = snapshot();
    return result;
  }

  function snapshot() {
    return Object.freeze({
      ...state, done, failures: Object.freeze(state.failures.slice()),
      reached: Object.freeze({ owned: owned.length, shared: shared.length }),
      // borrowed scene/camera/textures are never traversed or disposed by this adapter
      borrowedSceneDisposed: false
    });
  }

  return Object.freeze({ release, snapshot });
}

export default Object.freeze({ createActorEffectReleaser });

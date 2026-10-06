/*
 * rift-ground-material-2_5d.v2.candidate.mjs — ANIMVFX CANDIDATE (safe lifecycle adapter)
 *
 * Goal   : CH1-RIFT-QUALITY-NEXT-20261007
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-QUALITY-NEXT-20261007-GROUND-GUARDS-V2-CANDIDATE
 *
 * WHAT — a SAFE adapter that consumes the ACTUAL root public consumer
 *   tools/2_5d/rift-ground-detail.mjs ::
 *     createRiftGroundDetailMaterial({THREE, sourceScene, plateTexture, enabled, fetcher?, makeCanvas?})
 *       -> { material, setEnabled, snapshot, dispose }                 (rift-ground-detail.mjs:157-228)
 *   The real module already verifies the full PNG byte length + SHA256 (lines 90), the live nav
 *   byte hash (nav1192, lines 159-161), nearest hard × linear soft masks (lines 73-85, 180,
 *   shader .r gate 137-139), and sRGB soft-light at alpha .4 (shader lines 128-147). This adapter
 *   DOES NOT re-implement or clone that shader, nor touch nav/source. It only adds the lifecycle
 *   safety the bare async factory lacks:
 *     - prepare EPOCH + cancel cleanup: if dispose() (or a newer prepare()) happens while the
 *       async factory is still in flight, the resolved handle is disposed immediately and never
 *       exposed — closing the dispose-during-async-prepare leak (the v1 counterexample).
 *     - re-prepare: a previous handle is disposed before a new one is built (no handle leak).
 *     - borrowed plateTexture lifetime: the adapter NEVER disposes the caller-owned plate; it
 *       disposes only the underlying handle (which itself keeps the plate, rift-ground-detail.mjs:223).
 *
 * LIFETIME — the caller owns plateTexture and the renderer. No own RAF/timer, no camera/scene/nav/
 *   save writes. The caller restores/replaces the mesh material before dispose(). Shader-link /
 *   on-screen appearance belong to the caller's real WebGL renderer: UNKNOWN/PENDING here.
 *   Protection 2_3 / Q-only magic blackBean (E non-parry) / no-attack-ticket untouched.
 */

'use strict';

const REAL_MODULE = '../../../2_5d/rift-ground-detail.mjs'; // tools/2_5d/rift-ground-detail.mjs

// Lazy default so merely importing this adapter does not pull the real module's dependency chain;
// tests inject options.factory and never trigger this import.
async function defaultFactory(opts) {
  const m = await import(REAL_MODULE);
  const fn = m.createRiftGroundDetailMaterial || m.default;
  if (typeof fn !== 'function') throw new Error('실제 지면 재질 모듈 계약을 찾을 수 없습니다');
  return fn(opts);
}

export function createRiftGroundMaterialV2(options = {}) {
  const factory = typeof options.factory === 'function' ? options.factory : defaultFactory;
  const base = {
    THREE: options.THREE, sourceScene: options.sourceScene, plateTexture: options.plateTexture,
    fetcher: options.fetcher, makeCanvas: options.makeCanvas
  };

  let handle = null, disposed = false, preparing = false, epoch = 0;
  let desiredEnabled = options.enabled !== false; // default true, matches the real module
  let reason = 'not-prepared', lastError = null;
  const counters = { prepareCount: 0, canceledCleanups: 0, rePrepareDisposals: 0, factoryErrors: 0 };

  function safeDispose(h, tag) {
    if (!h || typeof h.dispose !== 'function') return;
    try { h.dispose(); } catch (e) { lastError = `${tag}: ${String(e?.message || e)}`; }
  }

  /** Create (or recreate) the underlying material with an epoch guard. Returns boolean. */
  async function prepare() {
    if (disposed) { reason = 'disposed'; return false; }
    const myEpoch = ++epoch;                 // invalidates any older in-flight prepare
    counters.prepareCount++;
    if (handle) { counters.rePrepareDisposals++; safeDispose(handle, 're-prepare'); handle = null; } // no re-prepare leak
    preparing = true; reason = 'preparing';
    let made = null;
    try {
      made = await factory({ ...base, enabled: desiredEnabled });
    } catch (e) {
      if (myEpoch === epoch && !disposed) { counters.factoryErrors++; reason = 'prepare-failed'; lastError = String(e?.message || e); preparing = false; }
      return false;
    }
    // Epoch/cancel: disposed or superseded while awaiting -> dispose the resolved handle, never expose it.
    if (disposed || myEpoch !== epoch) {
      counters.canceledCleanups++; safeDispose(made, 'cancel');
      if (myEpoch === epoch) preparing = false;
      return false;
    }
    handle = made; preparing = false;
    if (typeof handle.setEnabled === 'function') { try { handle.setEnabled(desiredEnabled); } catch (_) { /* delegate guards itself */ } }
    reason = desiredEnabled ? 'ground-colour-detail' : 'disabled-original-plate';
    return true;
  }

  function setEnabled(value) {
    if (typeof value !== 'boolean') throw new Error('enabled는 boolean이어야 합니다');
    if (disposed) return false;
    desiredEnabled = value;
    if (handle && typeof handle.setEnabled === 'function') return handle.setEnabled(value);
    return value; // applied on next prepare()
  }

  function snapshot() {
    return Object.freeze({
      endId: 'CH1-RIFT-QUALITY-NEXT-20261007-GROUND-GUARDS-V2-CANDIDATE',
      disposed, preparing, hasMaterial: !!handle && !disposed, enabled: !disposed && desiredEnabled,
      epoch, ...counters, reason, error: lastError,
      borrowedPlateDisposed: false, ownRaf: false, ownTimers: false, sceneWrites: false, navWrites: false,
      shaderCloned: false, consumes: 'tools/2_5d/rift-ground-detail.mjs::createRiftGroundDetailMaterial',
      underlying: handle && typeof handle.snapshot === 'function' ? (() => { try { return handle.snapshot(); } catch (_) { return null; } })() : null,
      nativeAccepted: false
    });
  }

  function dispose() {
    if (disposed) return false;
    disposed = true; epoch++;                // invalidate any in-flight prepare so it self-disposes on resolve
    reason = 'disposed'; desiredEnabled = false;
    if (handle) { safeDispose(handle, 'dispose'); handle = null; }
    // plateTexture is borrowed/caller-owned — never disposed here.
    return true;
  }

  return Object.freeze({
    prepare, setEnabled, snapshot, dispose,
    get material() { return handle && !disposed ? handle.material : null; }
  });
}

export default Object.freeze({ createRiftGroundMaterialV2 });

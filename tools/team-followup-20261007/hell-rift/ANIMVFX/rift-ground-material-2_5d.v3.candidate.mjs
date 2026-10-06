/*
 * rift-ground-material-2_5d.v3.candidate.mjs — ANIMVFX CANDIDATE (defect fix over v2)
 *
 * Goal   : CH1-RIFT-QUALITY-FIX-20261007
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-QUALITY-FIX-20261007-GROUND-HANDLE-V3-CANDIDATE
 *
 * Safe lifecycle adapter over the ACTUAL root public consumer
 *   tools/2_5d/rift-ground-detail.mjs ::
 *     createRiftGroundDetailMaterial({THREE,sourceScene,plateTexture,enabled,fetcher?,makeCanvas?})
 *       -> { material, setEnabled, snapshot, dispose }                  (rift-ground-detail.mjs:157-228)
 *   The real module still owns the material contract — full PNG bytes+SHA256 (:90), live nav1192
 *   byte hash (:159-161), nearest-hard × linear-soft masks + shader .r gate (:73-85,137-139), sRGB
 *   soft-light α.4 (:128-147), borrowed-plate-not-disposed (:223). This adapter neither clones that
 *   shader nor touches nav/source; it only wraps the async factory with lifecycle safety.
 *
 * FIXES OVER v2 (raw 6304B / 840ef4bdd1fb47627acd20a4fe3183ffdc70582e7b1c886260d15b73369263c7):
 *   P2-a  factory result contract: v2 returned true (and hasMaterial true) for a factory that
 *         resolved to null or to {} (no material/setEnabled/snapshot/dispose). v3 validates the
 *         resolved handle's OWN contract, disposes an invalid-but-disposable result, and returns
 *         false with reason 'invalid-handle'.
 *   P2-b  stuck 'preparing': v2 left preparing=true when dispose() (epoch bump) landed during an
 *         in-flight prepare. v3 clears preparing in EVERY prepare exit and in dispose().
 *   All v2 guards kept: prepare epoch + cancel cleanup, re-prepare disposal, borrowed plate never
 *   disposed. No own RAF/timer, no scene/nav/save writes. Protection 2_3 / Q-only magic blackBean
 *   (E non-parry) / no-attack-ticket untouched. Shader-link / on-screen = caller WebGL: UNKNOWN.
 */

'use strict';

const REAL_MODULE = '../../../2_5d/rift-ground-detail.mjs'; // tools/2_5d/rift-ground-detail.mjs

async function defaultFactory(opts) {
  const m = await import(REAL_MODULE);
  const fn = m.createRiftGroundDetailMaterial || m.default;
  if (typeof fn !== 'function') throw new Error('실제 지면 재질 모듈 계약을 찾을 수 없습니다');
  return fn(opts);
}

/** The resolved value must honour the real module's own handle contract. */
function validHandle(h) {
  return !!h && typeof h === 'object' && h.material != null &&
    typeof h.setEnabled === 'function' && typeof h.snapshot === 'function' && typeof h.dispose === 'function';
}

export function createRiftGroundMaterialV3(options = {}) {
  const factory = typeof options.factory === 'function' ? options.factory : defaultFactory;
  const base = {
    THREE: options.THREE, sourceScene: options.sourceScene, plateTexture: options.plateTexture,
    fetcher: options.fetcher, makeCanvas: options.makeCanvas
  };

  let handle = null, disposed = false, preparing = false, epoch = 0;
  let desiredEnabled = options.enabled !== false;
  let reason = 'not-prepared', lastError = null;
  const counters = { prepareCount: 0, canceledCleanups: 0, rePrepareDisposals: 0, factoryErrors: 0, invalidHandles: 0 };

  function safeDispose(h, tag) {
    if (!h || typeof h.dispose !== 'function') return;
    try { h.dispose(); } catch (e) { lastError = `${tag}: ${String(e?.message || e)}`; }
  }

  async function prepare() {
    if (disposed) { reason = 'disposed'; return false; }
    const myEpoch = ++epoch;
    counters.prepareCount++;
    if (handle) { counters.rePrepareDisposals++; safeDispose(handle, 're-prepare'); handle = null; }
    preparing = true; reason = 'preparing';
    let made = null;
    try {
      made = await factory({ ...base, enabled: desiredEnabled });
    } catch (e) {
      if (myEpoch === epoch && !disposed) { counters.factoryErrors++; reason = 'prepare-failed'; lastError = String(e?.message || e); }
      preparing = false; return false;                                   // P2-b: always clear preparing
    }
    // Epoch/cancel: disposed or superseded while awaiting -> dispose the resolved handle, never expose.
    if (disposed || myEpoch !== epoch) {
      counters.canceledCleanups++; safeDispose(made, 'cancel');
      preparing = false; return false;                                   // P2-b: cleared unconditionally
    }
    // P2-a: validate the resolved handle's own contract; invalid -> dispose if possible, then false.
    if (!validHandle(made)) {
      counters.invalidHandles++; if (made && typeof made.dispose === 'function') safeDispose(made, 'invalid');
      reason = 'invalid-handle'; preparing = false; return false;
    }
    handle = made; preparing = false;
    try { handle.setEnabled(desiredEnabled); } catch (_) { /* delegate guards itself */ }
    reason = desiredEnabled ? 'ground-colour-detail' : 'disabled-original-plate';
    return true;
  }

  function setEnabled(value) {
    if (typeof value !== 'boolean') throw new Error('enabled는 boolean이어야 합니다');
    if (disposed) return false;
    desiredEnabled = value;
    if (handle && typeof handle.setEnabled === 'function') return handle.setEnabled(value);
    return value;
  }

  function snapshot() {
    return Object.freeze({
      endId: 'CH1-RIFT-QUALITY-FIX-20261007-GROUND-HANDLE-V3-CANDIDATE',
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
    disposed = true; epoch++; preparing = false;                         // P2-b: clear preparing on dispose
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

export default Object.freeze({ createRiftGroundMaterialV3 });

/*
 * rift-ground-consumer-handle-2_5d.candidate.mjs — ANIMVFX CANDIDATE (view-only controller)
 *
 * Goal   : CH1-RIFT-CONSUMER-LINK-20261007
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-RIFT-CONSUMER-LINK-20261007-GROUND-CONSUMER-HANDLE-CANDIDATE
 *
 * A VIEW-ONLY controller over the ACTUAL root public consumer
 *   tools/2_5d/rift-ground-detail.mjs ::
 *     createRiftGroundDetailMaterial({THREE,sourceScene,plateTexture,enabled,fetcher?,makeCanvas?})
 *       -> { material, setEnabled, snapshot, dispose }                  (rift-ground-detail.mjs:157-228, setEnabled:201)
 *   The real module owns the material contract (full PNG bytes+SHA256 :90, nav1192 byte hash
 *   :159-161, nearest-hard × linear-soft :73-85/137-139, sRGB soft-light α.4 :128-147, borrowed
 *   plate kept :223). This controller does NOT clone that shader or touch ground/nav/source.
 *
 * UNIT WORK
 *   1) view-only: exposes material + an A/B toggle snapshot (enabled on/off amounts) for visual
 *      inspection; rejects any resolved handle whose .material is NOT a real THREE material
 *      (material.isMaterial !== true) — in addition to the handle own-contract check.
 *   2) epoch-guarded state: completion/failure updates `preparing`/`reason`/`handle` ONLY when
 *      myEpoch === epoch && !disposed. An OLDER completion that resolves while a LATEST prepare is
 *      still pending must NOT flip preparing=false — it only disposes its own resolved handle.
 *   3) own vs borrowed lifetime: the controller OWNS the handle it created (released exactly once
 *      via handle.dispose()); the plateTexture is BORROWED (caller-owned) and is NEVER disposed.
 *      invalid/canceled handles are cleaned up as owned; the borrowed plate is untouched.
 *
 * No own RAF/timer, no scene/nav/save writes. Protection 2_3 / Q-only magic blackBean (E non-parry)
 * / no-attack-ticket preserved. Shader-link / GPU / on-screen appearance = caller WebGL: UNKNOWN.
 */

'use strict';

const REAL_MODULE = '../../../2_5d/rift-ground-detail.mjs'; // tools/2_5d/rift-ground-detail.mjs

async function defaultFactory(opts) {
  const m = await import(REAL_MODULE);
  const fn = m.createRiftGroundDetailMaterial || m.default;
  if (typeof fn !== 'function') throw new Error('실제 지면 재질 모듈 계약을 찾을 수 없습니다');
  return fn(opts);
}

function handleContractOk(h) {
  return !!h && typeof h === 'object' && h.material != null &&
    typeof h.setEnabled === 'function' && typeof h.snapshot === 'function' && typeof h.dispose === 'function';
}
function isThreeMaterial(m) { return !!m && typeof m === 'object' && m.isMaterial === true; }

const DETAIL_ALPHA = 0.4; // mirror of RIFT_GROUND_DETAIL_MATERIAL.alpha (rift-ground-detail.mjs:16) for the A/B snapshot

export function createRiftGroundConsumerHandle(options = {}) {
  const factory = typeof options.factory === 'function' ? options.factory : defaultFactory;
  const base = {
    THREE: options.THREE, sourceScene: options.sourceScene, plateTexture: options.plateTexture,
    fetcher: options.fetcher, makeCanvas: options.makeCanvas
  };

  let handle = null, released = false, disposed = false, preparing = false, epoch = 0;
  let desiredEnabled = options.enabled !== false;
  let reason = 'not-prepared', lastError = null;
  const counters = { prepareCount: 0, canceledCleanups: 0, rePrepareDisposals: 0, factoryErrors: 0, invalidHandles: 0, rejectedNonMaterial: 0 };

  // Owned-resource release: the controller created the handle, so it (and only it) disposes it once.
  function releaseOwned(h, tag) {
    if (!h || typeof h.dispose !== 'function') return;
    try { h.dispose(); } catch (e) { lastError = `${tag}: ${String(e?.message || e)}`; }
  }

  async function prepare() {
    if (disposed) { reason = 'disposed'; return false; }
    const myEpoch = ++epoch;
    counters.prepareCount++;
    if (handle) { counters.rePrepareDisposals++; releaseOwned(handle, 're-prepare'); handle = null; released = false; }
    preparing = true; reason = 'preparing';
    let made = null;
    try {
      made = await factory({ ...base, enabled: desiredEnabled });
    } catch (e) {
      if (myEpoch === epoch && !disposed) { counters.factoryErrors++; reason = 'prepare-failed'; lastError = String(e?.message || e); preparing = false; }
      // superseded/disposed error does NOT touch shared state (unit 2)
      return false;
    }
    // Superseded or disposed while awaiting: clean up the OWNED resolved handle only; leave
    // preparing/reason for whatever latest prepare owns them (unit 2 + unit 3).
    if (disposed || myEpoch !== epoch) {
      counters.canceledCleanups++; releaseOwned(made, 'cancel');
      return false;
    }
    // Reject invalid handle / non-THREE material (unit 1); dispose as owned.
    if (!handleContractOk(made)) {
      counters.invalidHandles++; if (made && typeof made.dispose === 'function') releaseOwned(made, 'invalid');
      reason = 'invalid-handle'; preparing = false; return false;
    }
    if (!isThreeMaterial(made.material)) {
      counters.rejectedNonMaterial++; releaseOwned(made, 'non-three-material');
      reason = 'not-three-material'; preparing = false; return false;
    }
    handle = made; released = false; preparing = false;
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

  /** View-only A/B flip for visual inspection; returns the post-toggle snapshot. */
  function toggle() { setEnabled(!desiredEnabled); return snapshot(); }

  function snapshot() {
    return Object.freeze({
      endId: 'CH1-RIFT-CONSUMER-LINK-20261007-GROUND-CONSUMER-HANDLE-CANDIDATE',
      disposed, preparing, hasMaterial: !!handle && !disposed, materialIsThree: !!handle && !disposed && isThreeMaterial(handle.material),
      enabled: !disposed && desiredEnabled, epoch, ...counters, reason, error: lastError,
      ab: { on: { enabled: true, amount: DETAIL_ALPHA }, off: { enabled: false, amount: 0 }, current: !disposed && desiredEnabled ? 'on' : 'off' },
      ownedReleased: released, borrowedPlateDisposed: false, ownRaf: false, ownTimers: false, sceneWrites: false, navWrites: false,
      shaderCloned: false, viewOnly: true, consumes: 'tools/2_5d/rift-ground-detail.mjs::createRiftGroundDetailMaterial',
      underlying: handle && typeof handle.snapshot === 'function' ? (() => { try { return handle.snapshot(); } catch (_) { return null; } })() : null,
      nativeAccepted: false
    });
  }

  function dispose() {
    if (disposed) return false;
    disposed = true; epoch++; preparing = false; reason = 'disposed'; desiredEnabled = false;
    if (handle && !released) { releaseOwned(handle, 'dispose'); released = true; handle = null; }
    // plateTexture borrowed/caller-owned — never disposed.
    return true;
  }

  return Object.freeze({
    prepare, setEnabled, toggle, snapshot, dispose,
    get material() { return handle && !disposed ? handle.material : null; }
  });
}

export default Object.freeze({ createRiftGroundConsumerHandle });

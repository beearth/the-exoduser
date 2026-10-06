/* ROOT public derivative; raw SKILL63/ENEMY64 are immutable provenance only.
 * This module reads a root job lease. Host closure/disposal cannot release it.
 * It neither handles DOM events nor freezes the game without caller hooks.
 */
const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype = Object.getPrototypeOf;
const objectPrototype = Object.prototype;
const apply = Reflect.apply;
const nativePromise = Promise;
const promisePrototype = nativePromise.prototype;
const nativeThen = getDescriptor(promisePrototype, 'then').value;
const nativeSpecies = getDescriptor(nativePromise, Symbol.species).get;
const record = fields => Object.freeze(Object.assign(Object.create(null), fields));

function plainWithoutThen(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = getPrototype(value);
  if (prototype !== null && prototype !== objectPrototype) return false;
  return !getDescriptor(value, 'then') &&
    (prototype === null || !getDescriptor(prototype, 'then'));
}

function data(value, key) {
  const descriptor = getDescriptor(value, key);
  return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor : null;
}

function projectOwned(value) {
  try {
    if (!plainWithoutThen(value)) return null;
    const owned = data(value, 'owned'), epoch = data(value, 'epoch');
    if (!owned || typeof owned.value !== 'boolean' || !epoch ||
        !Number.isSafeInteger(epoch.value) || epoch.value < 0) return null;
    return record({owned: owned.value, epoch: epoch.value});
  } catch (_) {return null;}
}

// Observe an unsupported native rejection without reading value.then.
// Own then accessors are irrelevant to the captured intrinsic. Constructor /
// species accessors are refused because nativeThen would read them internally.
function observeNativeRejection(value) {
  try {
    if (value && typeof value === 'object' && getPrototype(value) === promisePrototype &&
        !getDescriptor(value, 'constructor') &&
        data(promisePrototype, 'constructor')?.value === nativePromise &&
        getDescriptor(nativePromise, Symbol.species)?.get === nativeSpecies) {
      apply(nativeThen, value, [() => {}, () => {}]);
    }
  } catch (_) { /* UNKNOWN remains blocked; no arbitrary getter or adoption. */ }
}

// A clear hook must return synchronously: undefined/true are success.
function clearResult(value) {
  if (value === undefined || value === true) return true;
  observeNativeRejection(value);
  return false;
}

const IFRAME_MEANINGS = Object.freeze({
  KeyW: 'walk', KeyA: 'walk', KeyS: 'walk', KeyD: 'walk',
  ArrowUp: 'walk', ArrowDown: 'walk', ArrowLeft: 'walk', ArrowRight: 'walk',
  ShiftLeft: 'run', ShiftRight: 'run', KeyJ: 'attack', KeyR: 'dialogue',
  Space: 'pause', Escape: 'close-dialogue',
  Tab: 'modal-native', Enter: 'modal-native', NumpadEnter: 'modal-native'
});
const RELEASE = new Set(['keyup', 'mouseup', 'pointerup', 'pointercancel',
  'touchend', 'touchcancel', 'blur', 'focusout', 'compositionend']);
const POINTER = new Set(['mousedown', 'mouseup', 'mousemove', 'pointerdown',
  'pointerup', 'pointermove', 'pointercancel', 'click', 'dblclick', 'auxclick',
  'contextmenu', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel']);
const EVENT_TYPES = new Set(['keydown', 'keyup', 'blur', 'focusout',
  'compositionstart', 'compositionupdate', 'compositionend', ...POINTER]);

function projectEvent(value) {
  try {
    if (!plainWithoutThen(value)) return null;
    const type = data(value, 'type');
    if (!type || typeof type.value !== 'string' || !EVENT_TYPES.has(type.value)) return null;
    const copy = {type: type.value};
    for (const [key, kind] of [['code', 'string'], ['key', 'string'],
      ['repeat', 'boolean'], ['isComposing', 'boolean'], ['button', 'number']]) {
      const descriptor = getDescriptor(value, key);
      if (!descriptor) continue;
      if (!Object.hasOwn(descriptor, 'value') || typeof descriptor.value !== kind ||
          kind === 'number' && !Number.isFinite(descriptor.value)) return null;
      copy[key] = descriptor.value;
    }
    if (copy.type === 'keydown' && (!copy.code || typeof copy.code !== 'string')) return null;
    return record(copy);
  } catch (_) {return null;}
}

/**
 * createRiftParentInputLease({ports:{readOwned,clearHeld}})
 * - readOwned() synchronously returns own plain {owned:boolean,epoch:safeint>=0}.
 * - Epochs are monotonic root job identities, not host token/G.revision.
 * - clearHeld() is attempted once on first observation of each owned epoch;
 *   return undefined/true synchronously. The original port receiver is retained.
 * - Only explicit, current owned:false passes parent input/simulation through.
 * - Each suppression function reads fresh ownership; callers may instead read
 *   one policy once per frame and consume its block flag at EVERY hotpath.
 * - Project native DOM events in the caller. Classifier output is advisory:
 *   no dispatch/injection, preventDefault, focus or modal-native key mutation.
 * - captureFreshOwnership() returns {owned:true,epoch} only after stable clear;
 *   it is a detached diagnostic, not a persistent permission or release handle.
 * - Exit held release/gamepad resynchronization and actual main hooks remain
 *   caller-owned. There is no G.paused, nextStage, reward or save mutation here.
 */
export function createRiftParentInputLease(options) {
  let ports, readOwned, clearHeld;
  try {
    if (!plainWithoutThen(options)) throw null;
    ports = data(options, 'ports')?.value;
    if (!plainWithoutThen(ports)) throw null;
    readOwned = data(ports, 'readOwned')?.value;
    clearHeld = data(ports, 'clearHeld')?.value;
    if (typeof readOwned !== 'function' || typeof clearHeld !== 'function') throw null;
  } catch (_) {throw new Error('rift input lease requires own-data ports');}

  let disposed = false, busy = false, maximumEpoch = -1, releasedEpoch = -1;
  let clearEpoch = -1, clearSucceeded = false, clearAttempts = 0;

  function policy(status, reason, state = null) {
    const blocked = status !== 'inactive';
    return record({status, reason, owned: state?.owned ?? null, epoch: state?.epoch ?? null,
      block: blocked, allowParent: !blocked, blockParentInput: blocked,
      blockParentSim: blocked, blockGamepad: blocked,
      heldClearEpoch: clearEpoch < 0 ? null : clearEpoch,
      heldClearSucceeded: state?.owned === true && state.epoch === clearEpoch && clearSucceeded,
      heldClearAttempts: clearAttempts, disposed,
      parentStateWrites: false, actualMainHooksAccepted: false});
  }

  function read() {
    if (disposed) return null;
    let raw;
    try {raw = apply(readOwned, ports, []);} catch (_) {return null;}
    observeNativeRejection(raw);
    if (disposed) return null;
    const state = projectOwned(raw);
    return disposed ? null : state;
  }

  function observeEpoch(state) {
    if (state.epoch < maximumEpoch) return false;
    maximumEpoch = state.epoch;
    if (!state.owned && state.epoch === clearEpoch) releasedEpoch = Math.max(releasedEpoch, state.epoch);
    return true;
  }

  function readPolicy() {
    if (disposed) return policy('disposed', 'lease-disposed');
    if (busy) return policy('unknown', 'lease-reentrant');
    busy = true;
    try {
      const state = read();
      if (!state) return policy(disposed ? 'disposed' : 'unknown', disposed ? 'lease-disposed' : 'ownership-unknown');
      if (!observeEpoch(state)) return policy('stale', 'older-root-epoch', state);
      if (!state.owned) return policy('inactive', 'explicit-root-inactive', state);
      if (state.epoch <= releasedEpoch) return policy('stale', 'released-root-epoch-reused', state);
      if (state.epoch === clearEpoch) return policy(clearSucceeded ? 'owned' : 'unknown',
        clearSucceeded ? 'root-owned' : 'held-clear-failed', state);

      // Mark before invoking the external hook: reentry cannot clear twice.
      clearEpoch = state.epoch; clearSucceeded = false; clearAttempts++;
      let succeeded = false;
      try {succeeded = clearResult(apply(clearHeld, ports, []));} catch (_) { /* fixed reason; no Error.message read */ }
      const after = read();
      if (!after) return policy(disposed ? 'disposed' : 'unknown', disposed ? 'lease-disposed' : 'ownership-unknown-after-clear');
      if (!observeEpoch(after)) return policy('stale', 'older-root-epoch-after-clear', after);
      if (!after.owned || after.epoch !== state.epoch) return policy('stale', 'ownership-changed-during-clear', after);
      if (!succeeded) return policy('unknown', 'held-clear-failed', after);
      clearSucceeded = true;
      return policy('owned', 'root-owned', after);
    } catch (_) {
      return policy(disposed ? 'disposed' : 'unknown', disposed ? 'lease-disposed' : 'ownership-reflection-unknown');
    } finally {busy = false;}
  }

  function classifyProjectedEvent(event) {
    const initial = readPolicy();
    const decision = (target, reason, fields = {}) => record({target,
      allowParent: target === 'parent', blockParent: target !== 'parent', reason,
      owned: initial.owned, epoch: initial.epoch, routingAdvisoryOnly: true, ...fields});
    // Native events have inherited accessors; inactive passthrough must not
    // inspect them, their type, prototype, then or any getter at all.
    if (!initial.block) return decision('parent', 'explicit-root-inactive');
    if (initial.status !== 'owned') return decision('none', initial.reason, {eventKind: 'unknown'});
    const projected = projectEvent(event);
    if (!projected) return decision('none', 'projected-event-unknown', {eventKind: 'unknown'});
    // Descriptor traps can reenter/change ownership even without getter reads.
    const fresh = readPolicy();
    if (fresh.status !== 'owned' || fresh.epoch !== initial.epoch)
      return decision('none', 'event-ownership-changed', {eventKind: 'unknown'});
    if (RELEASE.has(projected.type)) return decision('none', 'parent-release-only',
      {eventKind: 'release', clearHeld: true});
    if (projected.isComposing === true || projected.type.startsWith('composition'))
      return decision('iframe', 'iframe-composition', {eventKind: 'composition'});
    if (POINTER.has(projected.type)) return decision('none', 'parent-pointer-blocked', {eventKind: 'pointer'});
    if (projected.type === 'keydown' && Object.hasOwn(IFRAME_MEANINGS, projected.code))
      return decision('iframe', 'iframe-key-advisory', {eventKind: 'key',
        labMeaning: IFRAME_MEANINGS[projected.code]});
    return decision('none', 'parent-key-blocked', {eventKind: 'key'});
  }

  const suppress = () => readPolicy().block;
  function captureFreshOwnership() {
    const current = readPolicy();
    return current.status === 'owned' && current.heldClearSucceeded
      ? record({owned: true, epoch: current.epoch}) : null;
  }
  function dispose() {
    if (disposed) return false;
    disposed = true;
    return true;
  }
  return record({readPolicy, suppressUpdate: suppress, suppressGamepadPoll: suppress,
    suppressGamepadKeyInject: suppress, suppressFacingMutation: suppress,
    suppressAutoNextStage: suppress, classifyProjectedEvent, captureFreshOwnership, dispose});
}

export const RIFT_PARENT_INPUT_LEASE = record({
  completionId: 'ROOT-RIFT-PARENT-INPUT-LEASE-20261007',
  rawProvenance: Object.freeze([
    record({role: 'SKILL', bytes: 18140,
      path: 'tools/team-followup-20261007/hell-rift/SKILL/rift-main-input-policy-v2.candidate.mjs',
      sha256: 'f37496ba97808f0f831c507d90c18b35666295e79bf648de884fcfe4bc7547b6',
      officialEnd: 'ff7cfaf0-984b-4257-b7ea-c626705f50a9'}),
    record({role: 'ENEMY', bytes: 10122,
      path: 'tools/team-followup-20261007/hell-rift/ENEMY/rift-main-simulation-policy-v2.candidate.mjs',
      sha256: '880f204f1a1a7ae7bb5b5ec7587585544c6ebfad20520ef5e82d494730020e03',
      officialEnd: '45bd281e-7659-412d-afc7-2156b118b904'})
  ]),
  directRawImport: false, synchronousOwnership: true, synchronousClearHeld: true,
  iframeMeanings: IFRAME_MEANINGS, labWalkSpeed: 260, labRunSpeed: 470,
  timers: 0, raf: 0, domWrites: false, parentStateWrites: false,
  saveWrites: false, rewardWrites: false, automaticTalk: false,
  nextStageCalls: false, mainAccepted: false, nativeAccepted: false
});

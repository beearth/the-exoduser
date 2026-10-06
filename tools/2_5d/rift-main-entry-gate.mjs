/* ROOT public derivative: raw V2 is immutable provenance, never imported.
 * This gate grants a one-shot permission; it never calls nextStage or writes a
 * player, save, reward, quest, geometry or DOM. A permission is not stage ACK.
 */
const STATUS = new Set(['clear-continue', 'dead', 'final', 'demo', 'unknown']);
const NativePromise = Promise;
const promisePrototype = NativePromise.prototype;
const nativeThen = Object.getOwnPropertyDescriptor(promisePrototype, 'then').value;
const apply = Reflect.apply;
const record = fields => Object.freeze(Object.assign(Object.create(null), fields));

function data(object, key) {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) return null;
  return descriptor;
}

function plainWithoutThen(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) return false;
  // Inspect descriptors, including an inherited accessor, without invoking it.
  if (Object.getOwnPropertyDescriptor(value, 'then')) return false;
  return prototype === null || !Object.getOwnPropertyDescriptor(prototype, 'then');
}

function admit(value) {
  try {
    if (!plainWithoutThen(value)) return null;
    const fields = Object.create(null);
    for (const key of ['stage', 'stageCleared', 'status', 'difficultyOff', 'contextId']) {
      const descriptor = data(value, key);
      if (!descriptor) return null;
      fields[key] = descriptor.value;
    }
    if (!Number.isSafeInteger(fields.stage) || fields.stage < 0 ||
        typeof fields.stageCleared !== 'boolean' || !STATUS.has(fields.status) ||
        typeof fields.difficultyOff !== 'number' || !Number.isFinite(fields.difficultyOff)) return null;
    const kind = typeof fields.contextId;
    if (fields.contextId === null || fields.contextId === undefined ||
        !['string', 'number', 'bigint', 'symbol', 'boolean'].includes(kind) ||
        kind === 'number' && !Number.isFinite(fields.contextId)) return null;
    return record(fields);
  } catch (_) {return null;}
}

const same = (a, b) => !!a && !!b && a.stage === b.stage &&
  a.stageCleared === b.stageCleared && a.status === b.status &&
  a.difficultyOff === b.difficultyOff && a.contextId === b.contextId;
const allowed = state => !!state && state.stageCleared === true && state.status === 'clear-continue';

function captureHandle(value) {
  try {
    if (!plainWithoutThen(value)) return null;
    const restore = data(value, 'restore'), disposeDescriptor = Object.getOwnPropertyDescriptor(value, 'dispose');
    if (!restore || typeof restore.value !== 'function' || disposeDescriptor &&
        (!Object.hasOwn(disposeDescriptor, 'value') || typeof disposeDescriptor.value !== 'function')) return null;
    return {receiver: value, restore: restore.value, dispose: disposeDescriptor?.value ?? null,
      restored: false, disposed: false};
  } catch (_) {return null;}
}

function cleanup(handle) {
  if (!handle) return true;
  let clean = true;
  if (!handle.restored) {
    handle.restored = true;
    try {
      const returned = observe(apply(handle.restore, handle.receiver, []));
      if (!returned || returned.promise) clean = false;
    } catch (_) {clean = false;}
  }
  if (!handle.disposed) {
    handle.disposed = true;
    try {
      if (handle.dispose) {
        const returned = observe(apply(handle.dispose, handle.receiver, []));
        if (!returned || returned.promise) clean = false;
      }
    } catch (_) {clean = false;}
  }
  return clean;
}

/* Strict same-realm native promises only. No value.then read/assimilation.
 * Proxy/foreign/subclass/thenable/own constructor or then => UNKNOWN. Brand
 * validation is NativePromise.prototype.then, captured before port execution.
 * Settlement is boxed in a null-prototype object, so raw handle then is inert.
 */
function observe(value) {
  try {
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === promisePrototype) {
      if (Object.getOwnPropertyDescriptor(value, 'then') || Object.getOwnPropertyDescriptor(value, 'constructor')) return null;
      const constructor = data(promisePrototype, 'constructor');
      if (!constructor || constructor.value !== NativePromise) return null;
      let subscribed = false;
      const promise = new NativePromise(resolve => {
        apply(nativeThen, value, [
          result => resolve(record({ok: true, value: result})),
          () => resolve(record({ok: false}))
        ]);
        subscribed = true;
      });
      // A fake Promise prototype throws in the executor; silence its internal
      // rejection and return UNKNOWN instead of exposing a pending gate.
      if (!subscribed) {apply(nativeThen, promise, [undefined, () => {}]); return null;}
      return {promise};
    }
    if (value !== null && ['object', 'function'].includes(typeof value) && !plainWithoutThen(value)) return null;
    return {value};
  } catch (_) {return null;}
}

/**
 * createRiftMainEntryGate({ports})
 * ports (own-data functions, called with ports as receiver):
 *   readState() -> own plain synchronous {stage,stageCleared,status,difficultyOff,contextId}
 *   checkpoint(captured) -> true | native Promise<true>; NOT dbSave/grant ACK
 *   enterRift(onExit,captured) -> own restore()/optional dispose() handle | native Promise<handle>
 *   resumeStage(commit,captured) -> undefined | true | native Promise<undefined|true>
 * captured is a frozen detached state plus gate-owned epoch (not G.revision).
 * Host exit only cancels this job. Root still cancels a failed/null host to
 * remove its retained error dialog, but only when hostCancelRequired is true
 * and the root job matches: stale/duplicate results must not close a new host.
 * Root resumeStage closes its top-layer host via host.cancel(), keeps the gate
 * job/input lease, then guards its existing 5000ms callback/900ms curtain:
 *   if (commit() && rootJobIsCurrent()) nextStage();
 * Handle cleanup must be synchronous; an async/unknown return blocks commit,
 * and native rejections are observed without adopting arbitrary thenables.
 * No automatic advancement/fallthrough, no RAF/timer, no actual-stage claim.
 */
export function createRiftMainEntryGate(options) {
  let ports, functions;
  try {
    if (!plainWithoutThen(options)) throw null;
    ports = data(options, 'ports')?.value;
    if (!plainWithoutThen(ports)) throw null;
    functions = Object.create(null);
    for (const key of ['readState', 'checkpoint', 'enterRift', 'resumeStage']) {
      const descriptor = data(ports, key);
      if (!descriptor || typeof descriptor.value !== 'function') throw null;
      functions[key] = descriptor.value;
    }
  } catch (_) {throw new Error('rift gate requires own-data ports');}

  let epoch = 0, current = null, disposed = false, lastPhase = 'idle', lastReason = 'idle', permissionCount = 0;
  const owns = job => !disposed && current === job && epoch === job.epoch;
  const result = (job, fields) => record({epoch: job?.epoch ?? epoch, fallthrough: false,
    commitPermissionIssued: job?.permissionIssued ?? false, ...fields});
  const enteredFailure = (job, reason, hostCancelRequired = false) => result(job,
    {entered: false, reason, hostCancelRequired});

  function read(job) {
    if (!owns(job)) return null;
    let value;
    try {value = apply(functions.readState, ports, []);} catch (_) {return null;}
    if (!owns(job)) return null;
    const state = admit(value);
    return owns(job) ? state : null;
  }
  function invalidate(job, reason, phase = 'idle') {
    if (!owns(job)) return false;
    const handle = job.handle;
    job.handle = null; job.phase = 'cancelled'; current = null; epoch++;
    lastPhase = phase; lastReason = reason;
    cleanup(handle); // No gate-state writes after invoking external cleanup.
    return true;
  }
  function failEnter(job, reason, lateHandle = null) {
    const owned = invalidate(job, reason);
    cleanup(lateHandle);
    return enteredFailure(job, owned ? reason : 'stale', owned && hostCleanupNeeded(job));
  }
  const hostCleanupNeeded = job => !disposed && !current && epoch === job.epoch + 1;

  async function enter() {
    if (disposed) return enteredFailure(null, 'disposed');
    if (current) return enteredFailure(current, 'duplicate');
    const job = {epoch: ++epoch, phase: 'entering', reason: 'entering', captured: null, handle: null,
      permissionConsumed: false, permissionIssued: false};
    current = job;
    const initial = read(job);
    if (!initial || !allowed(initial)) return failEnter(job, 'state-not-admitted');
    job.captured = record({...initial, epoch: job.epoch});
    let checkpointValue;
    try {if (!owns(job)) return enteredFailure(job, 'stale');
      checkpointValue = apply(functions.checkpoint, ports, [job.captured]);
    } catch (_) {return failEnter(job, 'checkpoint-throw');}
    const checkpointResult = observe(checkpointValue);
    if (!owns(job)) return enteredFailure(job, 'stale');
    if (!checkpointResult) return failEnter(job, 'checkpoint-unknown');
    let approval = checkpointResult.value;
    if (checkpointResult.promise) {
      let settlement;
      try {settlement = await checkpointResult.promise;} catch (_) {return failEnter(job, 'checkpoint-reject');}
      if (!owns(job)) return enteredFailure(job, 'stale');
      if (!settlement.ok) return failEnter(job, 'checkpoint-reject');
      approval = settlement.value;
    }
    if (approval !== true) return failEnter(job, 'checkpoint-not-approved');
    const beforeHost = read(job);
    if (!owns(job)) return enteredFailure(job, 'stale');
    if (!allowed(beforeHost) || !same(initial, beforeHost)) return failEnter(job, 'checkpoint-context-changed');
    const onExit = () => invalidate(job, 'host-exit');
    let hostValue;
    try {if (!owns(job)) return enteredFailure(job, 'stale');
      hostValue = apply(functions.enterRift, ports, [onExit, job.captured]);
    } catch (_) {return failEnter(job, 'host-throw');}
    const hostResult = observe(hostValue);
    if (!hostResult) return failEnter(job, 'host-unknown');
    let raw = hostResult.value;
    if (hostResult.promise) {
      let settlement;
      try {settlement = await hostResult.promise;} catch (_) {return failEnter(job, 'host-reject');}
      if (!settlement.ok) return failEnter(job, 'host-reject');
      raw = settlement.value;
    }
    const handle = captureHandle(raw);
    if (!owns(job)) {cleanup(handle); return enteredFailure(job, 'stale');}
    if (!handle) return failEnter(job, 'host-handle-invalid');
    const afterHost = read(job);
    if (!owns(job)) {cleanup(handle); return enteredFailure(job, 'stale');}
    if (!allowed(afterHost) || !same(initial, afterHost)) return failEnter(job, 'host-context-changed', handle);
    job.handle = handle; job.phase = 'rift'; job.reason = 'rift-ready';
    return result(job, {entered: true, stage: initial.stage, contextId: initial.contextId});
  }

  function continueStage() {
    const job = current;
    if (!job || !owns(job) || job.phase !== 'rift') return result(job, {scheduled: false, reason: 'not-ready'});
    const fresh = read(job);
    if (!owns(job)) return result(job, {scheduled: false, reason: 'stale'});
    if (!allowed(fresh) || !same(job.captured, fresh)) {
      invalidate(job, 'continue-context-changed');
      return result(job, {scheduled: false, reason: 'continue-context-changed', hostCancelRequired: hostCleanupNeeded(job)});
    }
    const commit = () => {
      if (!owns(job) || job.phase !== 'scheduled' || job.permissionConsumed) return false;
      const state = read(job);
      if (!owns(job)) return false;
      if (!allowed(state) || !same(job.captured, state)) {invalidate(job, 'commit-context-changed'); return false;}
      job.permissionConsumed = true; job.phase = 'committing'; job.reason = 'committing';
      const handle = job.handle; job.handle = null;
      const clean = cleanup(handle);
      if (!owns(job)) return false;
      if (!clean) {invalidate(job, 'commit-cleanup-failed'); return false;}
      const after = read(job);
      if (!owns(job)) return false;
      if (!allowed(after) || !same(job.captured, after)) {invalidate(job, 'commit-context-changed'); return false;}
      job.permissionIssued = true; job.phase = 'permission-issued'; job.reason = 'commit-permission-issued'; permissionCount++;
      lastReason = 'commit-permission-issued';
      return true;
    };
    job.phase = 'scheduled'; job.reason = 'stage-scheduled';
    let returned;
    try {if (!owns(job)) return result(job, {scheduled: false, reason: 'stale'});
      returned = apply(functions.resumeStage, ports, [commit, job.captured]);
    } catch (_) {
      const issued = job.permissionIssued;
      const owned = invalidate(job, 'resume-throw');
      return result(job, {scheduled: false, reason: owned ? 'resume-throw' : 'stale',
        commitPermissionIssued: issued, hostCancelRequired: owned && hostCleanupNeeded(job)});
    }
    const observed = observe(returned);
    if (!owns(job)) return result(job, {scheduled: false, reason: 'stale'});
    if (!observed || !observed.promise && returned !== undefined && returned !== true) {
      invalidate(job, 'resume-unknown');
      return result(job, {scheduled: false, reason: 'resume-unknown', hostCancelRequired: hostCleanupNeeded(job)});
    }
    if (observed.promise) {
      try {apply(nativeThen, observed.promise, [settlement => {
        if (!owns(job) || job.permissionIssued) return;
        if (!settlement.ok || settlement.value !== undefined && settlement.value !== true) {invalidate(job, 'resume-reject'); return;}
        const state = read(job);
        if (owns(job) && (!allowed(state) || !same(job.captured, state))) invalidate(job, 'resume-context-changed');
      }, () => {if (owns(job) && !job.permissionIssued) invalidate(job, 'resume-reject');}]);}
      catch (_) {invalidate(job, 'resume-unknown'); return result(job, {scheduled: false, reason: 'resume-unknown'});}
      if (!owns(job)) return result(job, {scheduled: false, reason: 'stale'});
    }
    if (!job.permissionIssued) {
      const state = read(job);
      if (!owns(job)) return result(job, {scheduled: false, reason: 'stale'});
      if (!allowed(state) || !same(job.captured, state)) {
        invalidate(job, 'resume-context-changed');
        return result(job, {scheduled: false, reason: 'resume-context-changed', hostCancelRequired: hostCleanupNeeded(job)});
      }
    }
    return result(job, {scheduled: true, commit, commitPermissionIssued: job.permissionIssued});
  }

  function cancel() {return current ? invalidate(current, 'cancelled') : false;}
  function dispose() {
    if (disposed) return false;
    const handle = current?.handle ?? null;
    if (current) {current.handle = null; current.phase = 'cancelled';}
    disposed = true; current = null; epoch++; lastPhase = 'disposed'; lastReason = 'disposed';
    cleanup(handle);
    return true;
  }
  function snapshot() {
    const job = current;
    return record({phase: job?.phase ?? lastPhase, disposed, epoch,
      scheduled: job?.phase === 'scheduled', commitPermissionConsumed: job?.permissionConsumed ?? false,
      commitPermissionIssued: job?.permissionIssued ?? false, permissionCount,
      stage: job?.captured?.stage ?? null, contextId: job?.captured?.contextId ?? null,
      ownsHandle: !!job?.handle, reason: job?.reason ?? lastReason, actualStageAcknowledged: false});
  }
  return record({enter, continue: continueStage, cancel, dispose, snapshot});
}

export const RIFT_MAIN_ENTRY_GATE = record({
  completionId: 'ROOT-RIFT-MAIN-ENTRY-GATE-20261007',
  sourceCandidate: 'tools/team-followup-20261007/hell-rift/MAP/rift-main-entry-guards-v2.candidate.mjs',
  sourceBytes: 11268, sourceSHA256: '646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be',
  sourceOfficialEnd: 'be7786a7-6b57-4b97-a55e-e1e7cada25e1', directRawImport: false,
  statusValues: Object.freeze([...STATUS]), nativeSameRealmPromisesOnly: true,
  fallthrough: false, timers: 0, raf: 0, saveWrites: false, rewardWrites: false,
  mainAccepted: false, nativeAccepted: false, actualStageAcknowledged: false
});

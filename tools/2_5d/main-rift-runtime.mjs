/* ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007.
 * Actual lexical game ports own the root job; this consumer adds no save,
 * reward, automatic dialogue, renderer, RAF or timer. The child remains an
 * independent 2.5D display, not a transferred player or durable quest state.
 */
import {createMainRiftHost} from './main-rift-host.mjs';
import {createRiftMainEntryGate} from './rift-main-entry-gate.mjs';
import {createRiftParentInputLease} from './rift-parent-input-lease.mjs';

const frozen = fields => Object.freeze(Object.assign(Object.create(null), fields));
const suppressors = Object.freeze({update: 'suppressUpdate', poll: 'suppressGamepadPoll',
  inject: 'suppressGamepadKeyInject', facing: 'suppressFacingMutation', auto: 'suppressAutoNextStage'});

export function createMainRiftRuntime({window: win, document: doc, ports}) {
  if (!win || !doc?.body || win.location.origin !== 'http://127.0.0.1:3387' ||
      !ports || ['readOwned', 'clearHeld', 'isCurrent', 'readHostContext', 'readGateState',
        'schedule', 'release'].some(key => typeof ports[key] !== 'function')) {
    throw new Error('rift runtime requires isolated 3387 and lexical root ports');
  }
  const lease = createRiftParentInputLease({ports: {readOwned: () => ports.readOwned(),
    clearHeld: () => ports.clearHeld()}});
  const host = createMainRiftHost({window: win, document: doc, readContext: () => ports.readHostContext()});
  let current = null, disposed = false, phase = 'idle', reason = 'idle', entered = 0, scheduled = 0;

  function owns(record) {
    return !disposed && current === record && !record.closed && ports.isCurrent(record.captured);
  }
  function removeContinue(record) {
    if (!record?.button) return;
    const button = record.button; record.button = null;
    // Only the node created by this consumer is removed. No parent text reset.
    if (button.parentNode) button.parentNode.removeChild(button);
  }
  function close(record, why, release = true) {
    if (!record || record.closed || current !== record) return false;
    record.closed = true; current = null; phase = 'idle'; reason = why;
    removeContinue(record);
    try {record.gate?.dispose();} finally {
      host.cancel();
      if (release) ports.release(record.captured, why);
    }
    return true;
  }
  function installContinue(record) {
    if (!owns(record)) return false;
    const token = host.snapshot().token;
    if (!Number.isSafeInteger(token) || token < 1) return false;
    const panel = doc.querySelector('dialog[data-main-rift-host="' + token + '"]');
    const header = panel?.firstElementChild;
    if (!panel?.open || !header || header.tagName !== 'HEADER') return false;
    const button = doc.createElement('button');
    button.type = 'button'; button.id = 'root-rift-continue-' + record.captured.epoch;
    button.textContent = '위로 올라가기 · 다음 구역';
    button.setAttribute('aria-label', '지옥의 틈을 떠나 다음 구역으로 이동');
    button.style.cssText = 'padding:9px 16px;border:1px solid #c7b580;border-radius:7px;background:#544328;color:#fff0c9;cursor:pointer;font:600 14px system-ui;';
    header.appendChild(button); record.button = button;
    return true;
  }
  async function enter(captured) {
    if (disposed || current || !ports.isCurrent(captured)) return frozen({entered: false, fallthrough: false, reason: 'stale-or-duplicate'});
    const record = {captured, gate: null, button: null, closed: false};
    current = record; phase = 'entering'; reason = 'preparing';
    record.gate = createRiftMainEntryGate({ports: {
      readState: () => ports.readGateState(captured),
      checkpoint: () => owns(record) && lease.captureFreshOwnership() !== null,
      enterRift: onExit => host.enterRift(why => {
        if (current !== record || record.closed) return;
        onExit(why); close(record, why);
      }),
      resumeStage: commit => {
        if (!owns(record)) throw new Error('stale root stage continuation');
        removeContinue(record); host.cancel();
        phase = 'scheduled'; reason = 'explicit-continue'; scheduled++;
        // Keep current root-owned lease after the iframe has been closed.
        ports.schedule(commit, captured);
        return undefined;
      }
    }});
    let result;
    try {result = await record.gate.enter();}
    catch (_) {
      close(record, 'gate-entry-failed');
      return frozen({entered: false, fallthrough: false, reason: 'gate-entry-failed'});
    }
    if (!owns(record)) {close(record, 'stale-entry'); return frozen({entered: false, fallthrough: false, reason: 'stale-entry'});}
    if (result.entered !== true || !installContinue(record)) {
      close(record, 'entry-or-continue-ui-failed');
      return frozen({entered: false, fallthrough: false, reason: 'entry-or-continue-ui-failed'});
    }
    phase = 'rift'; reason = 'ready'; entered++;
    return frozen({entered: true, fallthrough: false, rootEpoch: captured.epoch});
  }
  function continueStage() {
    const record = current;
    if (!record || !owns(record) || phase !== 'rift') return false;
    let result;
    try {result = record.gate.continue();} catch (_) {close(record, 'continue-failed'); return false;}
    if (result.scheduled !== true) {close(record, 'continue-refused'); return false;}
    return true;
  }
  function parentEvent(event) {
    if (!current || !block('update')) return false;
    const record = current;
    // Public host captures modal events before target listeners. Activate our
    // owned Continue from the earlier lexical root capture, without weakening
    // the host's existing Return/Escape/input isolation policy.
    if (record.button && event.target === record.button &&
        (event.type === 'click' || event.type === 'keydown' && !event.repeat &&
          ['Enter', 'NumpadEnter', 'Space'].includes(event.code))) {
      event.preventDefault(); event.stopImmediatePropagation(); continueStage(); return true;
    }
    const token = host.snapshot().token;
    const panel = Number.isSafeInteger(token) ? doc.querySelector('dialog[data-main-rift-host="' + token + '"]') : null;
    if (panel?.open && panel.contains(event.target)) return false; // host owns native modal defaults
    event.stopImmediatePropagation();
    if (event.type === 'keydown' && event.code === 'Escape' && !event.repeat) close(record, 'parent-escape');
    if (event.cancelable) event.preventDefault();
    return true;
  }
  function block(channel) {
    const method = suppressors[channel];
    if (!method) return true;
    return lease[method]();
  }
  function cancel(why = 'cancelled') {return close(current, why);}
  function finished(captured) {
    if (!current || current.captured !== captured) return false;
    return close(current, 'advanced', false);
  }
  function dispose() {
    if (disposed) return false;
    cancel('page-disposed'); disposed = true; host.dispose(); lease.dispose(); return true;
  }
  function snapshot() {
    return frozen({disposed, phase, reason, rootEpoch: current?.captured.epoch ?? null,
      entered, scheduled, continueButton: !!current?.button?.isConnected,
      host: host.snapshot(), lease: lease.readPolicy(), gate: current?.gate?.snapshot() ?? null,
      mainSeamConnected: true, actualStageAdvanceAccepted: false, childCharacterLinked: false,
      saveAckAccepted: false, saveWrites: 0, rewardWrites: 0, automaticTalk: false, raf: 0, timers: 0});
  }
  return frozen({enter, continue: continueStage, parentEvent, block, cancel, finished, dispose, snapshot});
}

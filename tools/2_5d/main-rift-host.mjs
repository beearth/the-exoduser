/* ROOT-owned DOM host for the stage-continuation seam, not a gate or save port.
 * The caller supplies lexical P/character/stage/context identity explicitly.
 * Only this host's dialog, iframe, status leaves and timers are mutated.
 */
export const MAIN_RIFT_HOST = Object.freeze({
  completionId: 'ROOT-RIFT-MAIN-IFRAME-HOST-20261007',
  labPath: 'tools/2_5d-world-lab.html', allowedPort: '3387',
  timeoutMs: 30000, pollMs: 100,
  mainAccepted: false, nativeAccepted: false, automaticTalk: false,
  saveWrites: false, rewardWrites: false, nextStageCalls: false,
  ownsRenderer: false, ownsRAF: false, characterSeedKey: 'main-character',
  characterLinkScope: 'initial-display-only', fullPlayerLinked: false
});
const own = (object, key) => {
  if (!object || typeof object !== 'object') throw new Error('UNKNOWN · host 객체 필요');
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (descriptor && !Object.hasOwn(descriptor, 'value')) throw new Error('UNKNOWN · host accessor: ' + key);
  return descriptor?.value;
};
function plain(value, label, realmObjectPrototype = Object.prototype) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('UNKNOWN · ' + label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== realmObjectPrototype && proto !== null || own(value, 'then') !== undefined) throw new Error('UNKNOWN · ' + label + ' plain 동기 객체 필요');
  return value;
}
const errorText = error => {
  try {
    if (error instanceof Error) {
      const message = error.message;
      if (typeof message === 'string' && message.length) return message;
    }
  } catch (_) { /* Exception formatting cannot break host settlement or cleanup. */ }
  return 'UNKNOWN · 지옥의 틈 표시 실패';
};
const identity = value => value !== null && (typeof value === 'object' || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value));

/**
 * readContext() -> own-data plain {player:P, character:string, stage:integer,
 * context:G-or-run-token, on:false, stageCleared:true, status?:primitive}.
 * It must be synchronous. The gate, checkpoint and already-held/gamepad input
 * policy remain caller-owned. enterRift(onExit) resolves to a plain once-only
 * {restore(),dispose()} handle or null. onExit(reason) only notifies a user exit
 * or automatic cancellation; the host never invokes continuation/nextStage.
 */
export function createMainRiftHost({document: doc = globalThis.document,
  window: win = globalThis.window, readContext,
  timeoutMs = MAIN_RIFT_HOST.timeoutMs, pollMs = MAIN_RIFT_HOST.pollMs} = {}) {
  if (!doc?.body || !win || typeof readContext !== 'function' || typeof doc.createElement !== 'function' ||
      typeof win.setTimeout !== 'function' || typeof win.clearTimeout !== 'function') throw new Error('지옥의 틈 host 의존성 필요');
  if (!Number.isFinite(timeoutMs) || timeoutMs < 100 || timeoutMs > 60000 ||
      !Number.isFinite(pollMs) || pollMs < 20 || pollMs > 1000) throw new Error('지옥의 틈 대기 수치 범위 오류');
  const origin = new URL(win.location.href), labURL = new URL('/' + MAIN_RIFT_HOST.labPath, origin);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.port !== MAIN_RIFT_HOST.allowedPort || labURL.origin !== origin.origin) throw new Error('지옥의 틈 host는 격리 동일 origin 3387만 지원합니다');
  const now = () => typeof win.performance?.now === 'function' ? win.performance.now() : Date.now();
  let disposed = false, sequence = 0, current = null, readingContext = false, reason = 'idle', error = null,
    completed = 0, cancelled = 0, notificationErrors = 0;

  function contextSnapshot() {
    if (readingContext) throw new Error('UNKNOWN · readContext 재진입 금지');
    readingContext = true;
    try {
    const value = plain(readContext(), 'readContext'), result = {};
    for (const key of ['player', 'character', 'stage', 'context', 'on', 'stageCleared', 'status']) result[key] = own(value, key);
    if (!result.player || typeof result.player !== 'object' || Array.isArray(result.player) ||
        typeof result.character !== 'string' || !['warrior', 'silvertail'].includes(result.character) ||
        !Number.isInteger(result.stage) || result.stage < 0 || !identity(result.context) ||
        result.on !== false || result.stageCleared !== true) throw new Error('UNKNOWN · 부모 클리어/정지/identity admission 불일치');
    if (result.status !== undefined && result.status !== null && !['string', 'boolean', 'number'].includes(typeof result.status)) throw new Error('UNKNOWN · 부모 status primitive 필요');
    if (typeof result.status === 'number' && !Number.isFinite(result.status)) throw new Error('UNKNOWN · 부모 status 유한수 필요');
    if (['dead', 'fallen', 'reviving', 'lastStand'].includes(result.status)) throw new Error('UNKNOWN · 부모 사망/부활 중');
    return Object.freeze(result);
    } finally {readingContext = false;}
  }
  function sameContext(record) {
    const fresh = contextSnapshot();
    for (const key of ['player', 'character', 'stage', 'context', 'on', 'stageCleared', 'status']) if (fresh[key] !== record.context[key]) return false;
    return true;
  }
  const isCurrent = record => !disposed && current === record && !record.closed;
  function status(record, text) {
    reason = text;
    if (record?.status && record.status.children.length === 0) record.status.textContent = text;
  }
  function settle(record, value) {
    if (record.settled) return; record.settled = true; record.resolve(value);
  }
  function clearTimer(record) {
    if (record.timer !== null) {win.clearTimeout(record.timer); record.timer = null;}
  }
  function notify(record, why) {
    if (record.notified) return; record.notified = true;
    try {
      const value = record.onExit(why);
      if (value !== undefined) Promise.resolve(value).catch(() => {notificationErrors++;});
    } catch (_) {notificationErrors++;}
  }
  function closeRecord(record, why, restoreFocus, inform) {
    if (!record || record.closed) return false;
    record.closed = true; record.phase = 'closed';
    if (current === record) current = null;
    clearTimer(record); settle(record, null);
    record.frame?.removeEventListener('load', record.onLoad);
    record.frame?.removeEventListener('error', record.onError);
    record.panel?.removeEventListener('cancel', record.onCancel);
    record.panel?.removeEventListener('close', record.onClose);
    // The child owns WebGL disposal through its existing pagehide listener.
    try {if (record.frame) record.frame.src = 'about:blank';} catch (_) { /* cross-origin failure still detaches the owned frame */ }
    try {if (record.panel?.open) record.panel.close();} catch (_) { /* detach still releases modal ownership */ }
    record.panel?.remove();
    reason = why; cancelled += why === 'restored' || why === 'disposed-handle' ? 0 : 1;
    if (restoreFocus && record.focus?.isConnected && record.focus.ownerDocument === doc) {
      try {if (!current && sameContext(record) && !current) record.focus.focus({preventScroll: true});} catch (_) { /* never focus a stale parent context */ }
    }
    if (inform) notify(record, why);
    return true;
  }
  function fail(record, failure) {
    if (!isCurrent(record)) return;
    error = errorText(failure); record.phase = 'failed'; clearTimer(record);
    status(record, error); settle(record, null);
    // Retain the owned error dialog for review. It cannot return a gate handle.
    if (record.exit && !record.exit.children.length) record.exit.textContent = '닫기';
    notify(record, 'load-failed');
  }
  function userExit(record, why = 'user-exit') {
    if (!isCurrent(record)) return false;
    return closeRecord(record, why, true, true);
  }
  function makeUI(record) {
    const panel = doc.createElement('dialog'); record.panel = panel;
    if (typeof panel.showModal !== 'function' || typeof panel.close !== 'function') throw new Error('동일 origin dialog API 필요');
    panel.dataset.mainRiftHost = String(record.id);
    panel.setAttribute('aria-labelledby', 'main-rift-host-title-' + record.id);
    panel.style.cssText = 'width:min(1400px,96vw);height:94vh;max-width:96vw;max-height:94vh;margin:auto;padding:0;border:1px solid #8c7851;border-radius:14px;background:#080d10;color:#e7dfca;box-shadow:0 28px 90px #000b;overflow:hidden;';
    const header = doc.createElement('header');
    header.style.cssText = 'height:62px;display:flex;align-items:center;gap:18px;padding:0 20px;border-bottom:1px solid #384344;background:#101719;';
    const title = doc.createElement('strong'); title.id = 'main-rift-host-title-' + record.id; title.textContent = '지옥의 틈 · 격리 표시';
    const text = doc.createElement('span'); record.status = text;
    text.setAttribute('role', 'status'); text.setAttribute('aria-live', 'polite');
    text.style.cssText = 'flex:1;font:13px/1.5 system-ui;color:#aab9b5;';
    const exit = doc.createElement('button'); record.exit = exit; exit.type = 'button'; exit.textContent = '돌아가기';
    exit.style.cssText = 'padding:9px 16px;border:1px solid #8c7851;border-radius:7px;background:#202b2a;color:#efe3bc;cursor:pointer;font:600 14px system-ui;';
    const frame = doc.createElement('iframe'); record.frame = frame;
    frame.title = '지옥의 틈 독립 2.5D 표시'; frame.src = 'about:blank';
    frame.style.cssText = 'display:block;width:100%;height:calc(100% - 63px);border:0;background:#080d10;';
    header.append(title, text, exit); panel.append(header, frame);
    record.onLoad = () => {
      if (!isCurrent(record) || frame.getAttribute('src') !== record.entryURL) return;
      try {const location = frame.contentWindow?.location; record.loaded = !!location && location.origin === origin.origin && location.pathname === labURL.pathname && location.href === record.entryURL;}
      catch (failure) {fail(record, failure);}
    };
    record.onError = () => fail(record, new Error('지옥의 틈 iframe 로드 실패'));
    record.onCancel = event => {event.preventDefault(); userExit(record, 'user-escape');};
    record.onClose = () => {if (isCurrent(record)) userExit(record, 'dialog-closed');};
    frame.addEventListener('load', record.onLoad); frame.addEventListener('error', record.onError);
    panel.addEventListener('cancel', record.onCancel); panel.addEventListener('close', record.onClose);
    doc.body.append(panel); panel.showModal(); status(record, '독립 화면 준비 중 · 본편 저장과 보상은 변경하지 않습니다.');
    frame.src = record.entryURL; exit.focus({preventScroll: true});
  }
  function handleFor(record) {
    let restored = false, released = false;
    return Object.freeze({restore() {
      if (restored || released) return false; restored = true;
      return closeRecord(record, 'restored', true, false);
    }, dispose() {
      if (released) return false; released = true;
      closeRecord(record, 'disposed-handle', true, false); return true;
    }});
  }
  function readChildState(child, initial) {
    // Child traps/opaque exceptions must never reach errorText or string coercion.
    try {
      const api = own(child, '__rift25Lab');
      if (!api) return null;
      const read = own(api, 'snapshot');
      if (typeof read !== 'function') throw null;
      const value = plain(read.call(api), 'lab snapshot', child.Object.prototype);
      const data = {};
      for (const key of ['ready', 'error', 'disposed', 'contextLost']) data[key] = own(value, key);
      if (initial) for (const key of ['initialCharacter', 'initialCharacterReady', 'selected']) data[key] = own(value, key);
      return data;
    } catch (_) {throw new Error('UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패');}
  }
  function poll(record) {
    record.timer = null;
    if (!isCurrent(record)) return;
    try {
      if (doc.hidden) return void closeRecord(record, 'parent-hidden', false, true);
      let matches;
      try {matches = sameContext(record);} catch (_) {return void closeRecord(record, 'parent-context-invalid', false, true);}
      if (!isCurrent(record)) return;
      if (!matches) return void closeRecord(record, 'parent-context-changed', false, true);
      if (!record.panel.isConnected || !record.panel.open) return void closeRecord(record, 'owned-dialog-detached', true, true);
      if (record.phase === 'active' && !record.loaded) throw new Error('지옥의 틈 활성 iframe 경로 상실');
      if (record.loaded) {
        const child = record.frame.contentWindow;
        if (!child || child.location.origin !== origin.origin || child.location.pathname !== labURL.pathname || child.location.href !== record.entryURL) throw new Error('지옥의 틈 iframe origin/경로 변경');
        const state = readChildState(child, record.phase === 'loading');
        if (!isCurrent(record)) return;
        if (!sameContext(record)) return void closeRecord(record, 'parent-context-changed', false, true);
        if (!isCurrent(record)) return;
        if (record.phase === 'active' && !state) throw new Error('지옥의 틈 활성 port 사라짐');
        if (state) {
          if (state.error || state.disposed === true || state.contextLost === true) throw new Error('지옥의 틈 표시 실패 · context/disposed/error');
          if (record.phase === 'active' && state.ready !== true) throw new Error('지옥의 틈 활성 준비 상태 상실');
          if (state.ready === true && record.phase === 'loading') {
            if (state.initialCharacterReady !== true || state.initialCharacter !== record.expectedCharacter || state.selected !== record.expectedCharacter) throw new Error('UNKNOWN · 지옥의 틈 초기 캐릭터 표시 ACK 불일치');
            record.characterAck = true;
            record.phase = 'active'; record.handle = handleFor(record); completed++;
            status(record, '독립 2.5D 공간 · 초기 캐릭터 표시 연결 · 본편 상태/보상 연동 미인수');
            settle(record, record.handle);
            try {child.focus(); child.document.getElementById('world-canvas')?.focus({preventScroll: true});} catch (_) { /* optional focus must not revoke the handle */ }
          }
        }
      }
      if (record.phase === 'loading' && now() - record.started >= timeoutMs) throw new Error('지옥의 틈 준비 시간 초과');
      if (isCurrent(record) && record.phase !== 'failed') record.timer = win.setTimeout(() => poll(record), pollMs);
    } catch (failure) {fail(record, failure);}
  }
  function enterRift(onExit) {
    if (disposed || doc.hidden) return Promise.resolve(null);
    if (typeof onExit !== 'function') throw new Error('지옥의 틈 onExit(reason) 알림 함수 필요');
    if (current && !current.closed && current.phase !== 'failed') {
      try {if (current.onExit === onExit && sameContext(current)) return current.job;} catch (_) { /* replaced context closes below */ }
      closeRecord(current, 'superseded', false, true);
      return Promise.resolve(null); // Require an explicit fresh gate admission.
    }
    if (current) closeRecord(current, 'failed-retry', true, false);
    let context;
    try {context = contextSnapshot();} catch (failure) {error = errorText(failure); reason = error; return Promise.resolve(null);}
    const entryURL = new URL(labURL.href);entryURL.searchParams.set(MAIN_RIFT_HOST.characterSeedKey, context.character);
    const record = {id: ++sequence, context, expectedCharacter:context.character, entryURL:entryURL.href, characterAck:false, onExit, started: now(), phase: 'loading',
      focus: doc.activeElement, timer: null, loaded: false, closed: false, notified: false, settled: false, handle: null};
    record.job = new Promise(resolve => {record.resolve = resolve;}); current = record; error = null;
    try {makeUI(record); if (isCurrent(record)) record.timer = win.setTimeout(() => poll(record), 0);}
    catch (failure) {fail(record, failure); if (!record.panel?.isConnected || !record.panel.open) closeRecord(record, 'UI-create-failed', true, false);}
    return record.job;
  }
  const guarded = () => !disposed && !!current && !current.closed;
  function parentKey(event) {
    if (!guarded()) return;
    event.stopImmediatePropagation();
    if (event.type === 'keydown' && event.code === 'Escape' && !event.repeat) {event.preventDefault(); userExit(current, 'user-escape');}
    else if (!['Tab', 'Enter', 'NumpadEnter', 'Space'].includes(event.code)) event.preventDefault();
  }
  function parentPointer(event) {
    if (!guarded()) return;
    const record = current; event.stopImmediatePropagation();
    if (event.type === 'click' && event.target === record.exit) {event.preventDefault(); userExit(record);}
    else if (event.target !== record.exit && event.target !== record.frame) event.preventDefault();
  }
  const pointerTypes = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'touchstart', 'touchmove', 'wheel'];
  const visibility = () => {if (doc.hidden && current) closeRecord(current, 'parent-hidden', false, true);};
  const pageHide = () => dispose();
  win.addEventListener('keydown', parentKey, true); win.addEventListener('keyup', parentKey, true);
  for (const type of pointerTypes) win.addEventListener(type, parentPointer, {capture: true, passive: false});
  doc.addEventListener('visibilitychange', visibility); win.addEventListener('pagehide', pageHide);
  function cancel() {return closeRecord(current, 'cancelled', true, false);}
  function dispose() {
    if (disposed) return false; disposed = true;
    closeRecord(current, 'host-disposed', false, false);
    win.removeEventListener('keydown', parentKey, true); win.removeEventListener('keyup', parentKey, true);
    for (const type of pointerTypes) win.removeEventListener(type, parentPointer, true);
    doc.removeEventListener('visibilitychange', visibility); win.removeEventListener('pagehide', pageHide);
    reason = 'host-disposed'; return true;
  }
  function snapshot() {
    return Object.freeze({disposed, active: current?.phase === 'active', pending: current?.phase === 'loading',
      phase: current?.phase ?? 'idle', token: current?.id ?? null, iframeLoaded: current?.loaded ?? false,
      ownedDialog: !!current?.panel?.isConnected, ownedIframe: !!current?.frame?.isConnected,
      ownedTimers: current?.timer === null || !current ? 0 : 1,
      parentStage: current?.context.stage ?? null, parentCharacter: current?.context.character ?? null,
      reason, error, completed, cancelled, notificationErrors, ...MAIN_RIFT_HOST, timeoutMs, pollMs,
      inputLimitations: 'already-held keys/gamepad/earlier same-window capture remain caller-owned',
      parentStateWrites: false, borrowedDomWrites: false, childCharacterLinked: current?.characterAck === true});
  }
  return Object.freeze({enterRift, cancel, dispose, snapshot});
}

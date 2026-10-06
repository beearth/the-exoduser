/* Same-origin editor -> independent 2.5D lab host. No scene/history/save writes.
 * The adapter owns preview restoration; this host owns iframe/wait/listener lifetime.
 */
import { createEditorPreviewEntry, EDITOR_PREVIEW_ENTRY } from './editor-preview-entry.mjs';

export const EDITOR_PREVIEW_HOST = Object.freeze({
  completionId: 'ROOT-RIFT-EDITOR-PREVIEW-HOST-20261007',
  canonicalScene: EDITOR_PREVIEW_ENTRY.canonicalScene,
  labPath: 'tools/2_5d-world-lab.html',
  timeoutMs: 30000, pollMs: 100, maxSceneBytes: 32000000,
  nativeAccepted: false, mainAccepted: false, automaticTalk: false
});
const ROOT = new URL('../../', import.meta.url);
const message = e => e instanceof Error ? e.message : 'UNKNOWN · 미리보기 오류';

export function createEditorPreviewHost({ document: doc = globalThis.document,
  window: win = globalThis.window, fetcher = globalThis.fetch,
  readEditor = null,
  timeoutMs = EDITOR_PREVIEW_HOST.timeoutMs, pollMs = EDITOR_PREVIEW_HOST.pollMs } = {}) {
  if (!doc || !win || typeof fetcher !== 'function' || (readEditor !== null && typeof readEditor !== 'function')) throw new Error('에디터 미리보기 host 의존성 필요');
  if (!Number.isFinite(timeoutMs) || timeoutMs < 100 || timeoutMs > 60000 || !Number.isFinite(pollMs) || pollMs < 20 || pollMs > 1000) throw new Error('미리보기 대기 범위 오류');
  const byId = id => { const el = doc.getElementById(id); if (!el) throw new Error('미리보기 UI 없음: ' + id); return el; };
  const button = byId('scene-preview-25d'), panel = byId('scene-preview-25d-panel'),
    frame = byId('scene-preview-25d-frame'), status = byId('scene-preview-25d-status'), closeButton = byId('scene-preview-25d-close');
  if (status.children.length !== 0 || typeof panel.showModal !== 'function' || typeof panel.close !== 'function') throw new Error('미리보기 dialog/리프 status 계약 오류');
  const labURL = new URL(EDITOR_PREVIEW_HOST.labPath, ROOT);
  if (labURL.origin !== win.location.origin) throw new Error('미리보기는 동일 origin만 지원합니다');
  const editorReader = readEditor ?? (() => {
    const api = win.EXODUSER_SCENE_EDITOR ?? win.__mapSceneEditor;
    if (!api || api.ready !== true || typeof api.snapshot !== 'function' || typeof api.selection !== 'function') throw new Error('편집기 준비 전 · snapshot/selection 없음');
    return {ready: true, scene: api.snapshot(), selected: api.selection(),
      busy: !!doc.getElementById('scene-workspace')?.inert,
      playing: typeof api.player === 'function' && api.player() !== null};
  });
  let disposed = false, epoch = 0, entry = null, canonicalBytes = null, bytesJob = null,
    fetchAbort = null, wait = null, openJob = null, active = false, frameLoaded = false,
    queuedDialogCloses = 0, reason = '선택한 주민을 2.5D 화면에서 확인하세요.';
  const setStatus = text => { reason = text; if (status.children.length === 0) status.textContent = text; };
  const isCurrent = id => !disposed && epoch === id && !doc.hidden;
  function cancelWait() { if (wait) { const item = wait; wait = null; item.cancel(); } }
  function blankFrame() { frameLoaded = false; frame.src = 'about:blank'; }
  function dismissPanel() { if (panel.open) { queuedDialogCloses++; panel.close(); } }
  function close() {
    if (disposed) return false;
    epoch++; active = false; openJob = null; cancelWait();
    fetchAbort?.abort(); fetchAbort = null; bytesJob = null;
    entry?.cancel(); blankFrame(); button.disabled = false;
    dismissPanel();
    setStatus('미리보기 닫힘 · 편집 데이터는 유지됩니다.'); return true;
  }
  async function readCanonical(id) {
    if (canonicalBytes) return canonicalBytes;
    if (bytesJob) return bytesJob;
    const controller = new AbortController(); fetchAbort = controller;
    const timer = win.setTimeout(() => controller.abort(), timeoutMs);
    const job = (async () => {
      const response = await fetcher(new URL(EDITOR_PREVIEW_HOST.canonicalScene, ROOT).href,
        {cache: 'no-store', redirect: 'error', signal: controller.signal});
      if (!response?.ok || typeof response.arrayBuffer !== 'function') throw new Error('정본 씬 HTTP 로드 실패');
      const length = Number(response.headers?.get('content-length'));
      if (Number.isFinite(length) && length > EDITOR_PREVIEW_HOST.maxSceneBytes) throw new Error('정본 씬 최대 32MB');
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength === 0 || bytes.byteLength > EDITOR_PREVIEW_HOST.maxSceneBytes) throw new Error('정본 씬 bytes 범위 오류');
      if (!isCurrent(id) || controller.signal.aborted) throw new Error('정본 씬 읽기 취소됨');
      canonicalBytes = bytes; return canonicalBytes;
    })();
    bytesJob = job;
    try { return await job; }
    finally { win.clearTimeout(timer); if (bytesJob === job) bytesJob = null; if (fetchAbort === controller) fetchAbort = null; }
  }
  function readyLab(id) {
    cancelWait();
    return new Promise((resolve, reject) => {
      const started = Date.now(); let timer = null, done = false;
      const finish = (error, api) => {
        if (done) return; done = true; win.clearTimeout(timer);
        frame.removeEventListener('error', onError); if (wait?.cancel === cancel) wait = null;
        error ? reject(error) : resolve(api);
      };
      const cancel = () => finish(new Error('2.5D 미리보기 대기 취소됨'));
      const onError = () => finish(new Error('2.5D iframe 로드 실패'));
      const poll = () => {
        if (!isCurrent(id)) return cancel();
        try {
          const child = frame.contentWindow;
          if (frameLoaded && child && child.location.href !== 'about:blank') {
            if (child.location.origin !== win.location.origin) throw new Error('2.5D iframe origin 변경');
            const api = child.__rift25Lab;
            if (api) {
              if (typeof api.snapshot !== 'function') throw new Error('2.5D snapshot port 없음');
              const state = api.snapshot();
              if (state?.error) throw new Error('2.5D 준비 실패 · ' + state.error);
              if (state?.ready === true) {
                if (typeof api.enterPreview !== 'function') throw new Error('2.5D enterPreview port 없음');
                return finish(null, api);
              }
            }
          }
        } catch (error) { return finish(error); }
        if (Date.now() - started >= timeoutMs) return finish(new Error('2.5D 준비 시간 초과 · ' + Math.ceil(timeoutMs / 1000) + '초 이내 준비되지 않았습니다.'));
        timer = win.setTimeout(poll, pollMs);
      };
      wait = {cancel}; frame.addEventListener('error', onError); timer = win.setTimeout(poll, 0);
    });
  }
  const previewPort = { async enter(payload) {
    const id = epoch;
    if (!isCurrent(id)) throw new Error('미리보기 요청 취소됨');
    if (!panel.open) panel.showModal();
    if (frame.getAttribute('src') === 'about:blank' || !frame.getAttribute('src')) { frameLoaded = false; frame.src = labURL.href; }
    const api = await readyLab(id);
    if (!isCurrent(id)) throw new Error('미리보기 준비 뒤 요청 취소됨');
    const handle = await api.enterPreview(payload);
    if (!handle || typeof handle.restore !== 'function') throw new Error('2.5D 주민 접근 진입을 거절했습니다.');
    let restored = false, released = false;
    // Adapter calls this wrapper for current and late handles. Raw restore is called once.
    return Object.freeze({ restore() {
      if (restored || released) return false; restored = true; return handle.restore();
    }, dispose() {
      if (released) return false; released = true;
      return typeof handle.dispose === 'function' ? handle.dispose() : false;
    }});
  }};
  async function open() {
    if (disposed) return {entered: false, reason: '미리보기 host 종료됨'};
    if (openJob) return openJob;
    const id = ++epoch; button.disabled = true; setStatus('선택한 주민과 정본 씬을 확인 중입니다.');
    const job = (async () => {
      await Promise.resolve(); // Assign the owned job before a synchronous reader can fail.
      try {
        const requested = editorReader(), clickSelection = requested.selected,
          clickScene = JSON.stringify(requested.scene);
        const bytes = await readCanonical(id);
        if (!isCurrent(id)) return {entered: false, reason: '미리보기 요청 취소됨'};
        const fresh = editorReader();
        if (fresh.selected !== clickSelection || JSON.stringify(fresh.scene) !== clickScene) throw new Error('정본 읽기 중 선택 또는 씬이 변경됐습니다. 다시 눌러 주세요.');
        if (!entry) entry = createEditorPreviewEntry({readEditor: editorReader, canonicalBytes: bytes, previewPort});
        const result = await entry.enter();
        if (!isCurrent(id)) return {entered: false, reason: '미리보기 요청 취소됨'};
        active = result.entered === true;
        setStatus(active ? '2.5D 주민 접근 미리보기 · 대화는 직접 시작하세요. 게임에는 저장되지 않습니다.' : result.reason || 'UNKNOWN · 미리보기 진입 실패');
        if (active) {
          // Focus is optional UI work: failure must not roll back the admitted pose.
          try { frame.contentWindow?.focus(); frame.contentWindow?.document.getElementById('world-canvas')?.focus({preventScroll: true}); }
          catch (_) { /* Keep the active preview and its close/restore handle. */ }
        }
        if (!active) { entry.cancel(); blankFrame(); dismissPanel(); }
        return result;
      } catch (error) {
        if (isCurrent(id)) { active = false; entry?.cancel(); blankFrame(); dismissPanel(); setStatus(message(error)); }
        return {entered: false, reason: message(error)};
      } finally { if (openJob === job) openJob = null; if (isCurrent(id)) button.disabled = false; }
    })(); openJob = job; return job;
  }
  const onClick = () => { void open(); }, onClose = () => { if (queuedDialogCloses > 0) { queuedDialogCloses--; return; } close(); },
    onVisibility = () => { if (doc.hidden) close(); }, onPageHide = () => dispose();
  const onFrameLoad = () => {
    if (disposed || frame.getAttribute('src') !== labURL.href) return;
    try { const loc = frame.contentWindow?.location; frameLoaded = !!loc && loc.origin === win.location.origin && loc.pathname === labURL.pathname; }
    catch (_) { frameLoaded = false; }
  };
  // Modal controls must not trigger the editor's global delete/save/undo handlers.
  // Keep native Tab/Enter/Space/Escape behavior; iframe keys are a separate window.
  const onModalKey = event => { if (!disposed && panel.open) event.stopImmediatePropagation(); };
  button.addEventListener('click', onClick); closeButton.addEventListener('click', close);
  panel.addEventListener('close', onClose); panel.addEventListener('cancel', close);
  frame.addEventListener('load', onFrameLoad);
  doc.addEventListener('visibilitychange', onVisibility); win.addEventListener('pagehide', onPageHide);
  win.addEventListener('keydown', onModalKey, true); win.addEventListener('keyup', onModalKey, true);
  function dispose() {
    if (disposed) return false; close(); disposed = true; entry?.dispose();
    button.removeEventListener('click', onClick); closeButton.removeEventListener('click', close);
    panel.removeEventListener('close', onClose); panel.removeEventListener('cancel', close);
    frame.removeEventListener('load', onFrameLoad);
    doc.removeEventListener('visibilitychange', onVisibility); win.removeEventListener('pagehide', onPageHide);
    win.removeEventListener('keydown', onModalKey, true); win.removeEventListener('keyup', onModalKey, true);
    canonicalBytes = null; entry = null; setStatus('미리보기 host 종료됨'); return true;
  }
  return Object.freeze({open, close, dispose, snapshot: () => Object.freeze({disposed, active, pending: !!openJob,
    canonicalBytes: canonicalBytes?.byteLength ?? 0, waiting: !!wait, reason, timeoutMs, pollMs,
    iframeLoaded: frameLoaded, adapter: entry?.snapshot() ?? null,
    automaticTalk: false, nativeAccepted: false, mainAccepted: false})});
}

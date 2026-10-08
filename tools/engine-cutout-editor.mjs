import { CUTOUT_SOURCE, CUTOUT_LIMITS, normalizeCutoutRig, normalizeCutoutPose,
  cutoutBounds, renderCutoutRig } from './engine/cutout-rig.mjs?v=20261009-v1';

const IDS = ['source-stage', 'source-view', 'stage', 'viewport', 'mode-original', 'mode-edit',
  'new-part', 'cancel-point', 'close-polygon', 'cancel-draft', 'pivot-mode', 'save-part',
  'rig-name', 'part-name', 'part-list', 'part-summary', 'pivot-value', 'angle', 'angle-value',
  'offset-x', 'offset-y', 'reset-pose', 'remove-part', 'zoom', 'zoom-value', 'fit',
  'status', 'notice', 'undo', 'redo', 'export', 'json', 'json-panel', 'import'];

function leaf(node, value) {
  if (node && node.children.length === 0) node.textContent = value;
}

function initialize() {
  const ui = Object.fromEntries(IDS.map(id => [id, document.getElementById(id)]));
  for (const id of IDS) if (!ui[id]) throw new Error('필수 UI가 없습니다: #' + id);
  const originalContext = ui['source-view'].getContext('2d');
  const context = ui.viewport.getContext('2d');
  if (!originalContext || !context) throw new Error('Canvas2D를 초기화하지 못했습니다.');
  const empty = normalizeCutoutRig({
    format: 'exoduser-cutout-rig', version: 1, name: '드루이드 · 원화 부위',
    source: CUTOUT_SOURCE, parts: [], pose: [],
  });
  let rig = empty;
  let selected = null;
  let viewMode = 'original';
  let interaction = 'idle';
  let draft = [];
  let draftClosed = false;
  let draftPivot = null;
  let draftName = '';
  let zoom = 100;
  let dirty = false;
  let imageState = 'loading';
  let fatal = '';
  let disposed = false;
  let observer = null;
  let workspaceView = null;
  let renderMetadata = Object.freeze({ rendered: false, reason: 'image-loading' });
  let renderCount = 0;
  let listButtons = [];
  const undo = [];
  const redo = [];
  const listeners = [];
  const urls = new Set();
  const image = new Image();

  const part = () => rig.parts.find(value => value.id === selected);
  const selectedPose = () => rig.pose.find(value => value.id === selected);
  const zeroPose = () => rig.parts.map(value => ({ id: value.id, angleDegrees: 0, x: 0, y: 0 }));

  function notice(text, error = false) {
    if (fatal && !error) return;
    leaf(ui.notice, text);
    ui.notice.dataset.state = error ? 'error' : 'info';
  }

  function disabled() {
    const unavailable = disposed || !!fatal || imageState !== 'ready';
    for (const id of IDS) if ('disabled' in ui[id]) ui[id].disabled = unavailable;
    for (const button of listButtons) button.disabled = unavailable;
    if (unavailable) return;
    ui.undo.disabled = undo.length === 0;
    ui.redo.disabled = redo.length === 0;
    ui['new-part'].disabled = rig.parts.length >= CUTOUT_LIMITS.parts;
    ui['cancel-point'].disabled = draft.length === 0 || draftClosed;
    ui['close-polygon'].disabled = draft.length < 3 || draftClosed;
    ui['cancel-draft'].disabled = draft.length === 0 && interaction === 'idle';
    ui['pivot-mode'].disabled = viewMode !== 'edit' || !(draftClosed || (part() && draft.length === 0));
    ui['save-part'].disabled = !draftClosed || !draftPivot;
    ui['part-name'].disabled = !part() && interaction === 'idle';
    ui['rig-name'].disabled = interaction !== 'idle';
    const canPose = !!part() && interaction === 'idle' && viewMode === 'edit';
    for (const id of ['angle', 'offset-x', 'offset-y']) ui[id].disabled = !canPose;
    ui['remove-part'].disabled = !part() || interaction !== 'idle';
    ui['reset-pose'].disabled = rig.parts.length === 0 || interaction !== 'idle';
  }

  function listen(node, type, handler) {
    const wrapped = event => {
      if (disposed || fatal) return;
      try { handler(event); }
      catch (error) { notice(error instanceof Error ? error.message : String(error), true); }
    };
    node.addEventListener(type, wrapped);
    listeners.push([node, type, wrapped]);
  }

  function clearDraft() {
    draft = [];
    draftClosed = false;
    draftPivot = null;
    draftName = '';
    interaction = 'idle';
  }

  function current() { return { rig, selected, viewMode, dirty }; }

  function refreshUI(rebuild = false) {
    if (document.activeElement !== ui['rig-name']) ui['rig-name'].value = rig.name;
    const chosen = part();
    const pose = selectedPose();
    if (document.activeElement !== ui['part-name']) ui['part-name'].value = interaction !== 'idle' && draft.length > 0 ?
      draftName : (chosen ? chosen.name : draftName);
    ui.angle.value = String(pose ? pose.angleDegrees : 0);
    ui['offset-x'].value = String(pose ? pose.x : 0);
    ui['offset-y'].value = String(pose ? pose.y : 0);
    leaf(ui['angle-value'], (pose ? pose.angleDegrees : 0) + '°');
    const pivot = draftPivot || (chosen && chosen.pivot);
    leaf(ui['pivot-value'], pivot ? '회전축 (' + pivot[0] + ', ' + pivot[1] + ')' : '회전축 미지정');
    leaf(ui['part-summary'], '부위 ' + rig.parts.length + ' / 16' + (draft.length ? ' · 지정한 점 ' + draft.length + ' / 64' : ''));
    ui['mode-original'].setAttribute('aria-pressed', String(viewMode === 'original'));
    ui['mode-edit'].setAttribute('aria-pressed', String(viewMode === 'edit'));
    ui['pivot-mode'].setAttribute('aria-pressed', String(interaction === 'pivot'));
    leaf(ui['zoom-value'], zoom + '%');
    if (rebuild) {
      const fragment = document.createDocumentFragment();
      listButtons = rig.parts.map(value => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.partId = value.id;
        button.setAttribute('aria-current', String(value.id === selected));
        leaf(button, value.name);
        fragment.append(button);
        return button;
      });
      ui['part-list'].replaceChildren(fragment);
    } else {
      for (const button of listButtons) button.setAttribute('aria-current', String(button.dataset.partId === selected));
    }
    disabled();
  }

  // Validate everything before touching the document, preview, draft or history.
  function commit(raw, nextSelected = selected, nextMode = viewMode) {
    const next = normalizeCutoutRig(raw);
    const changed = JSON.stringify(next) !== JSON.stringify(rig);
    if (changed) {
      undo.push(current());
      if (undo.length > 40) undo.shift();
      redo.length = 0;
    }
    rig = next;
    selected = next.parts.some(value => value.id === nextSelected) ? nextSelected : null;
    viewMode = nextMode;
    if (changed) dirty = true;
    clearDraft();
    refreshUI(true);
    drawAll();
  }

  function history(from, to) {
    if (!from.length) return;
    const state = from[from.length - 1];
    to.push(current());
    if (to.length > 40) to.shift();
    from.pop();
    ({ rig, selected, viewMode, dirty } = state);
    clearDraft();
    refreshUI(true);
    drawAll();
    notice('편집 이력을 복원했습니다.');
  }

  function transformed(point, pivot, pose) {
    const radians = pose.angleDegrees * Math.PI / 180;
    const x = point[0] - pivot[0], y = point[1] - pivot[1];
    return [pivot[0] + pose.x + x * Math.cos(radians) - y * Math.sin(radians),
      pivot[1] + pose.y + x * Math.sin(radians) + y * Math.cos(radians)];
  }

  function overlay(pose, scale) {
    context.save();
    try {
      context.lineWidth = 1.5 / scale;
      rig.parts.forEach((value, index) => {
        const points = value.polygon.map(point => transformed(point, value.pivot, pose[index]));
        context.strokeStyle = value.id === selected ? '#ffd08a' : '#75c3d2';
        context.beginPath();
        points.forEach((point, i) => i === 0 ? context.moveTo(...point) : context.lineTo(...point));
        context.closePath();
        context.stroke();
        if (value.id === selected) {
          const pivot = [value.pivot[0] + pose[index].x, value.pivot[1] + pose[index].y];
          context.beginPath();
          context.arc(pivot[0], pivot[1], 5 / scale, 0, Math.PI * 2);
          context.stroke();
        }
      });
      if (draft.length) {
        context.strokeStyle = '#ffd08a';
        context.fillStyle = '#ffd08a';
        context.beginPath();
        draft.forEach((point, i) => i === 0 ? context.moveTo(...point) : context.lineTo(...point));
        if (draftClosed) context.closePath();
        context.stroke();
        for (const point of draft) {
          context.beginPath();
          context.arc(point[0], point[1], 3 / scale, 0, Math.PI * 2);
          context.fill();
        }
      }
      if (draftPivot) {
        context.strokeStyle = '#ffcc77';
        context.beginPath();
        context.arc(draftPivot[0], draftPivot[1], 6 / scale, 0, Math.PI * 2);
        context.stroke();
      }
    } finally { context.restore(); }
  }

  function drawCanvas(canvas, ctx, data, pose, zoomFactor, guides) {
    const box = canvas.getBoundingClientRect();
    const width = Math.max(1, box.width || 300), height = Math.max(1, box.height || 500);
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const backingWidth = Math.max(1, Math.round(width * dpr));
    const backingHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== backingWidth) canvas.width = backingWidth;
    if (canvas.height !== backingHeight) canvas.height = backingHeight;
    ctx.setTransform(backingWidth / width, 0, 0, backingHeight / height, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const bounds = cutoutBounds(data, pose);
    const fit = Math.min(1, Math.max(1, width - 48) / bounds.width, Math.max(1, height - 48) / bounds.height);
    const scale = fit * zoomFactor;
    const x = (width - bounds.width * scale) / 2 - bounds.minX * scale;
    const y = (height - bounds.height * scale) / 2 - bounds.minY * scale;
    ctx.save();
    let core;
    try {
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      core = renderCutoutRig(ctx, image, data, pose);
      if (guides) overlay(pose, scale);
    } finally { ctx.restore(); }
    return Object.freeze({ width, height, backingWidth, backingHeight, dpr, fit, scale, x, y, bounds, core, guides });
  }

  function drawAll() {
    if (disposed || fatal || imageState !== 'ready') return;
    try {
      // Defining geometry and pivots always uses original source coordinates.
      const authoring = interaction === 'polygon' || interaction === 'pivot';
      const pose = normalizeCutoutPose(rig, viewMode === 'original' || authoring ? zeroPose() : rig.pose);
      const original = drawCanvas(ui['source-view'], originalContext, empty, empty.pose, 1, false);
      workspaceView = drawCanvas(ui.viewport, context, rig, pose, zoom / 100, viewMode === 'edit');
      renderCount++;
      renderMetadata = Object.freeze({ rendered: true, count: renderCount, original, workspace: workspaceView, authoringOriginalCoordinates: authoring });
      leaf(ui.status, (viewMode === 'original' ? '원형' : '편집') + ' · ' +
        (interaction === 'polygon' ? '영역 점 지정' : interaction === 'pivot' ? '회전축 지정' : '부위 선택') +
        ' · ' + rig.parts.length + ' 부위' + (dirty ? ' · 수정됨' : ''));
    } catch (error) {
      fatal = error instanceof Error ? error.message : String(error);
      renderMetadata = Object.freeze({ rendered: false, reason: 'function-error', message: fatal });
      leaf(ui.status, '편집기 기능 오류');
      notice(fatal, true);
      disabled();
    }
  }

  function nextId() {
    let index = 1;
    while (rig.parts.some(value => value.id === 'part-' + index)) index++;
    return 'part-' + index;
  }

  function draftPart(pivot) {
    return { id: nextId(), name: ui['part-name'].value, polygon: draft, pivot };
  }

  function numeric(node, label) {
    const value = node.valueAsNumber;
    if (!Number.isFinite(value)) throw new Error(label + ': 유한 숫자를 입력하세요.');
    return value;
  }

  function updatePose(channel, value) {
    if (!part() || interaction !== 'idle') throw new Error('먼저 부위를 선택하세요.');
    const pose = normalizeCutoutPose(rig, rig.pose.map(entry => entry.id === selected ? { ...entry, [channel]: value } : entry));
    commit({ ...rig, pose }, selected, 'edit');
  }

  listen(ui['new-part'], 'click', () => {
    if (rig.parts.length >= 16) throw new Error('최대 16개 부위를 만들 수 있습니다.');
    clearDraft();
    selected = null;
    viewMode = 'edit';
    interaction = 'polygon';
    draftName = '부위 ' + (rig.parts.length + 1);
    ui['part-name'].value = draftName;
    refreshUI();
    drawAll();
    notice('원화에서 영역의 점을 차례로 찍고 영역 닫기를 누르세요.');
  });
  listen(ui.viewport, 'pointerdown', event => {
    if (event.button !== 0 || imageState !== 'ready') return;
    if (viewMode !== 'edit' || interaction === 'idle') {
      notice('새 부위 또는 회전축 지정을 선택하세요.');
      return;
    }
    const rect = ui.viewport.getBoundingClientRect();
    const x = (event.clientX - rect.left - workspaceView.x) / workspaceView.scale;
    const y = (event.clientY - rect.top - workspaceView.y) / workspaceView.scale;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 414 || y < 0 || y > 620) throw new Error('원본 셀 안의 위치를 지정하세요.');
    const point = [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
    if (interaction === 'polygon') {
      if (draftClosed || draft.length >= 64) throw new Error('영역은 최대 64점입니다.');
      draft.push(point);
      refreshUI();
      drawAll();
    } else if (draftClosed) {
      draftPivot = point;
      refreshUI();
      drawAll();
      notice('회전축을 지정했습니다. 부위 저장으로 확정하세요.');
    } else if (part()) {
      commit({ ...rig, parts: rig.parts.map(value => value.id === selected ? { ...value, pivot: point } : value) });
      notice('선택 부위의 회전축을 변경했습니다.');
    }
  });
  listen(ui['cancel-point'], 'click', () => {
    if (draftClosed) return;
    draft.pop();
    refreshUI();
    drawAll();
  });
  listen(ui['close-polygon'], 'click', () => {
    const candidate = draftPart(draft[0]);
    normalizeCutoutRig({ ...rig, parts: [...rig.parts, candidate] });
    draftClosed = true;
    interaction = 'pivot';
    refreshUI();
    drawAll();
    notice('영역이 닫혔습니다. 원화에서 회전축을 지정하세요.');
  });
  listen(ui['pivot-mode'], 'click', () => {
    if (!draftClosed && !part()) throw new Error('영역을 닫거나 기존 부위를 선택하세요.');
    interaction = 'pivot';
    viewMode = 'edit';
    refreshUI();
    drawAll();
    notice('원형 좌표에서 회전축을 클릭하세요.');
  });
  listen(ui['cancel-draft'], 'click', () => {
    clearDraft();
    refreshUI();
    drawAll();
    notice('지정을 취소했습니다.');
  });
  listen(ui['save-part'], 'click', () => {
    if (!draftClosed || !draftPivot) throw new Error('영역과 회전축을 먼저 지정하세요.');
    const candidate = draftPart(draftPivot);
    commit({ ...rig, parts: [...rig.parts, candidate] }, candidate.id, 'edit');
    notice('부위를 저장했습니다. 회전이나 이동으로 분리된 영역을 확인하세요.');
  });
  listen(ui['part-list'], 'click', event => {
    const button = event.target instanceof Element ? event.target.closest('button[data-part-id]') : null;
    if (!button || button.parentElement !== ui['part-list']) return;
    selected = button.dataset.partId;
    clearDraft();
    viewMode = 'edit';
    ui['part-name'].value = part().name;
    refreshUI();
    drawAll();
  });
  listen(ui['part-name'], 'input', () => { if (interaction !== 'idle') draftName = ui['part-name'].value; });
  listen(ui['part-name'], 'change', () => {
    if (interaction !== 'idle' || !part()) return;
    commit({ ...rig, parts: rig.parts.map(value => value.id === selected ? { ...value, name: ui['part-name'].value } : value) });
  });
  listen(ui['rig-name'], 'change', () => commit({ ...rig, name: ui['rig-name'].value }));
  listen(ui.angle, 'input', () => updatePose('angleDegrees', numeric(ui.angle, '각도')));
  listen(ui['offset-x'], 'change', () => updatePose('x', numeric(ui['offset-x'], '이동 X')));
  listen(ui['offset-y'], 'change', () => updatePose('y', numeric(ui['offset-y'], '이동 Y')));
  listen(ui['reset-pose'], 'click', () => commit({ ...rig, pose: zeroPose() }));
  listen(ui['remove-part'], 'click', () => {
    if (!part()) throw new Error('먼저 부위를 선택하세요.');
    commit({ ...rig, parts: rig.parts.filter(value => value.id !== selected), pose: rig.pose.filter(value => value.id !== selected) }, null);
  });
  for (const [id, mode] of [['mode-original', 'original'], ['mode-edit', 'edit']]) listen(ui[id], 'click', () => {
    viewMode = mode;
    refreshUI();
    drawAll();
  });
  listen(ui.zoom, 'input', () => {
    const value = numeric(ui.zoom, '확대');
    if (value < 25 || value > 200 || value % 5 !== 0) throw new Error('확대는 25..200%, 간격 5입니다.');
    zoom = value;
    refreshUI();
    drawAll();
  });
  listen(ui.fit, 'click', () => {
    zoom = 100;
    ui.zoom.value = '100';
    refreshUI();
    drawAll();
  });
  listen(ui.undo, 'click', () => history(undo, redo));
  listen(ui.redo, 'click', () => history(redo, undo));
  listen(ui.import, 'click', () => {
    if (ui.json.value.length > CUTOUT_LIMITS.json) throw new Error('JSON은 1,000,000자 이하여야 합니다.');
    const candidate = normalizeCutoutRig(JSON.parse(ui.json.value));
    commit(candidate, candidate.parts[0]?.id || null, 'edit');
    notice('부위와 미리보기 JSON을 가져왔습니다.');
  });
  listen(ui.export, 'click', () => {
    const text = JSON.stringify(rig, null, 2);
    ui.json.value = text;
    ui['json-panel'].open = true;
    let anchor;
    try {
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
      urls.add(url);
      anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = (rig.name.replace(/[^a-zA-Z0-9가-힣_-]+/g, '-').slice(0, 100) || 'cutout-rig') + '.cutout.json';
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      notice('다운로드를 요청했습니다. 저장 완료는 미확인입니다. 아래 JSON도 복사할 수 있습니다.');
    } catch (error) {
      notice('다운로드 요청 실패. 아래 JSON을 복사할 수 있습니다.', true);
    } finally { if (anchor) anchor.remove(); }
  });
  listen(window, 'resize', drawAll);

  const hook = Object.freeze({
    snapshot() {
      return Object.freeze({
        rig, selected, viewMode, interaction, zoom, dirty,
        draft: Object.freeze({ points: Object.freeze(draft.map(point => Object.freeze([...point]))),
          closed: draftClosed, pivot: draftPivot ? Object.freeze([...draftPivot]) : null, name: draftName }),
        history: Object.freeze({ undo: undo.length, redo: redo.length, limit: 40 }),
        image: Object.freeze({ state: imageState, width: image.naturalWidth, height: image.naturalHeight }),
        render: renderMetadata, disposed, error: fatal,
      });
    },
  });
  Object.defineProperty(window, '__exoduserCutoutEditor', { value: hook, writable: false, configurable: true });
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (observer) observer.disconnect();
    observer = null;
    for (const [node, type, handler] of listeners) node.removeEventListener(type, handler);
    listeners.length = 0;
    image.onload = null;
    image.onerror = null;
    image.removeAttribute('src');
    for (const url of urls) URL.revokeObjectURL(url);
    urls.clear();
    undo.length = redo.length = 0;
    clearDraft();
    disabled();
    listButtons.length = 0;
    workspaceView = null;
    if (window.__exoduserCutoutEditor === hook) delete window.__exoduserCutoutEditor;
  }
  window.addEventListener('pagehide', dispose, { once: true });
  refreshUI(true);
  leaf(ui.status, '원본 이미지 준비 중');
  notice('원본이 준비되면 새 부위로 시작하세요.');
  image.onload = () => {
    if (disposed) return;
    if (image.naturalWidth !== 1656 || image.naturalHeight !== 1240) {
      imageState = 'error';
      leaf(ui.status, '원본 이미지 크기 오류');
      notice('승인된 1656×1240 원본이 필요합니다.', true);
      disabled();
      return;
    }
    imageState = 'ready';
    refreshUI();
    drawAll();
    notice('부위는 비어 있습니다. 새 부위에서 영역과 회전축을 지정하세요.');
  };
  image.onerror = () => {
    if (disposed) return;
    imageState = 'error';
    leaf(ui.status, '원본 이미지 로드 실패');
    notice('원본을 불러오지 못했습니다. 편집 기능 오류와 별개의 이미지 준비 실패입니다.', true);
    disabled();
  };
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(drawAll);
    observer.observe(ui.stage);
    observer.observe(ui['source-stage']);
  }
  image.src = new URL('../' + CUTOUT_SOURCE.asset, import.meta.url).href;
}

try { initialize(); }
catch (error) {
  leaf(document.getElementById('status'), '편집기 초기화 오류');
  leaf(document.getElementById('notice'), error instanceof Error ? error.message : String(error));
  for (const id of IDS) {
    const node = document.getElementById(id);
    if (node && 'disabled' in node) node.disabled = true;
  }
}

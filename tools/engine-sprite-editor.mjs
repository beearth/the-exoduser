import { createSpriteClip, sampleSpriteClip, spriteClipCell } from './engine/sprite-clip.mjs?v=20261009-atlas-v2';

// This editor owns its clock and loop. The shared runtime only selects a frame.
const MAX_KEYS = 2048;
const MAX_JSON_LENGTH = 1000000;
const HISTORY_LIMIT = 40;
const DEFAULT_ATLAS = Object.freeze({ sourcePath: 'assets/sprites/boss/boss_dark_druid_attack.png',
  columns: 4, rows: 8, layout: 'directional', framesPerRow: 4, directionRow: 0 });
const IDS = ['viewport', 'stage', 'status', 'notice', 'preset', 'row', 'frame',
  'key-time', 'duration', 'clip-name', 'record', 'remove', 'play', 'stop', 'loop',
  'seek', 'time', 'undo', 'redo', 'export', 'tracks', 'json', 'import', 'zoom',
  'source-path', 'columns', 'rows', 'layout', 'frames-per-row', 'frame-count', 'apply-source', 'source-summary', 'sequence'];

function leafText(node, value) {
  if (node && node.children.length === 0) node.textContent = value;
}

function makeClip(raw, requireEnvelope = false) {
  if (requireEnvelope) {
    const format = raw && Object.getOwnPropertyDescriptor(raw, 'format');
    const version = raw && Object.getOwnPropertyDescriptor(raw, 'version');
    if (!format || !('value' in format) || format.value !== 'exoduser-sprite-clip' ||
        !version || !('value' in version) || version.value !== 1) {
      throw new Error('exoduser-sprite-clip / version 1 JSON만 가져올 수 있습니다.');
    }
  }
  let result;
  try {
    // Legacy version-1 files described the original four-frame sheet only.
    result = createSpriteClip(Object.hasOwn(raw, 'atlas') ? raw : { ...raw, atlas: DEFAULT_ATLAS });
  } catch { throw new Error('원본 경로·열/행·프레임 수·모션 키를 확인하세요. 프레임은 아틀라스 범위 안, 첫 키는 0초, 키 시간은 오름차순, 길이는 0초 초과 3600초 이하입니다.'); }
  if (result.keys.length > MAX_KEYS) throw new Error('편집기 키 한도는 2048개입니다.');
  return result;
}

function presetClip(preset) {
  return makeClip(preset === 'prepare' ? {
    name: 'Druid fan preparation', frameCount: 4, durationSeconds: 1,
    keys: [{ time: 0, frame: 1 }],
  } : {
    name: 'Druid fan cast and return', frameCount: 4, durationSeconds: 20 / 60,
    keys: [{ time: 0, frame: 2 }, { time: 14 / 60, frame: 3 }],
  });
}

function initialize() {
  const ui = Object.fromEntries(IDS.map(id => [id, document.getElementById(id)]));
  for (const id of IDS) if (!ui[id]) throw new Error('필수 UI가 없습니다: #' + id);
  const canvas = ui.viewport;
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error('#viewport는 canvas여야 합니다.');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas2D를 초기화하지 못했습니다.');

  let clip = presetClip('recovery');
  let time = 0;
  let frame = sampleSpriteClip(clip, time);
  let row = 0;
  let zoom = 100;
  let playing = false;
  let dirty = false;
  let disposed = false;
  let fatalError = '';
  let imageState = 'loading';
  let pendingImage = null;
  let loadSerial = 0;
  let raf = 0;
  let lastTimestamp = null;
  let observer = null;
  let keyButtons = [];
  let activeKey = -1;
  let drawCount = 0;
  let dimensions = Object.freeze({ width: 0, height: 0, backingWidth: 0, backingHeight: 0, dpr: 1 });
  let renderMetadata = Object.freeze({ rendered: false, reason: 'image-loading' });
  const undo = [];
  const redo = [];
  const listeners = [];
  const objectURLs = new Set();
  let image = new Image();
  const inputs = ['preset', 'row', 'frame', 'key-time', 'duration', 'clip-name',
    'record', 'remove', 'play', 'stop', 'loop', 'seek', 'undo', 'redo', 'export',
    'json', 'import', 'zoom', 'sequence'];
  const sourceInputs = ['source-path', 'columns', 'rows', 'layout', 'frames-per-row', 'frame-count', 'apply-source'];

  function notice(message, error = false) {
    leafText(ui.notice, message);
    ui.notice.dataset.state = error ? 'error' : 'info';
  }

  function syncDisabled() {
    const unavailable = disposed || !!fatalError || imageState !== 'ready';
    for (const id of inputs) ui[id].disabled = unavailable;
    for (const id of sourceInputs) ui[id].disabled = disposed || !!fatalError;
    ui.json.disabled = ui.import.disabled = disposed || !!fatalError;
    if (ui.layout.value === 'linear') ui['frames-per-row'].disabled = true;
    for (const button of keyButtons) button.disabled = unavailable;
    if (unavailable) return;
    ui.row.disabled = clip.atlas.layout === 'linear';
    ui.play.disabled = playing;
    ui.stop.disabled = !playing && time === 0;
    ui.undo.disabled = undo.length === 0;
    ui.redo.disabled = redo.length === 0;
  }

  function stopPlayback(sync = true) {
    playing = false;
    lastTimestamp = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (sync) syncDisabled();
  }

  function fail(error) {
    fatalError = error instanceof Error ? error.message : String(error);
    stopPlayback(false);
    renderMetadata = Object.freeze({ rendered: false, reason: 'function-error', message: fatalError });
    leafText(ui.status, '편집기 기능 오류');
    notice(fatalError, true);
    syncDisabled();
  }

  function listen(node, type, handler) {
    const wrapped = event => {
      if (disposed || fatalError) return;
      try { handler(event); }
      catch (error) { notice(error instanceof Error ? error.message : String(error), true); }
    };
    node.addEventListener(type, wrapped);
    listeners.push([node, type, wrapped]);
  }

  function finiteInput(node, label) {
    const number = node.valueAsNumber;
    if (!Number.isFinite(number)) throw new Error(label + '에 유한한 숫자를 입력하세요.');
    return number;
  }

  function selectedFrame() {
    const value = finiteInput(ui.frame, 'Frame');
    if (!Number.isSafeInteger(value) || value < 0 || value >= clip.frameCount) {
      throw new Error('Frame은 정수 0..' + (clip.frameCount - 1) + '이어야 합니다.');
    }
    return value;
  }

  function enteredTime() {
    const value = finiteInput(ui['key-time'], '키 시각');
    if (value < 0 || value > clip.durationSeconds) throw new Error('키 시각은 0..clip 길이 사이여야 합니다.');
    return value;
  }

  function currentState() {
    // A draft cell preview is not a recorded pose and must not leak into undo.
    return { clip, time, frame: sampleSpriteClip(clip, time), dirty, image };
  }

  function syncClock() {
    ui.seek.value = String(time);
    ui['key-time'].value = String(time);
    ui.frame.value = String(frame);
    leafText(ui.time, time.toFixed(4) + ' / ' + clip.durationSeconds.toFixed(4) + ' s');
    let next = 0;
    while (next + 1 < clip.keys.length && clip.keys[next + 1].time <= time) next++;
    if (next !== activeKey) {
      if (keyButtons[activeKey]) keyButtons[activeKey].setAttribute('aria-current', 'false');
      if (keyButtons[next]) keyButtons[next].setAttribute('aria-current', 'true');
      activeKey = next;
    }
    syncDisabled();
  }

  function rebuildClipUI() {
    const atlas = clip.atlas;
    ui['source-path'].value = atlas.sourcePath;
    ui.columns.value = String(atlas.columns);
    ui.rows.value = String(atlas.rows);
    ui.layout.value = atlas.layout;
    ui['frames-per-row'].value = String(atlas.framesPerRow);
    ui['frame-count'].value = String(clip.frameCount);
    ui.row.max = String(atlas.rows - 1);
    ui.row.value = String(row);
    ui.frame.max = String(clip.frameCount - 1);
    leafText(ui['source-summary'], atlas.columns + '열 × ' + atlas.rows + '행 · ' + clip.frameCount +
      '프레임 · ' + (atlas.layout === 'linear' ? '격자 순서' : '방향행별 모션'));
    ui['clip-name'].value = clip.name;
    ui.duration.value = String(clip.durationSeconds);
    ui['key-time'].min = '0';
    ui['key-time'].max = String(clip.durationSeconds);
    ui.seek.min = '0';
    ui.seek.max = String(clip.durationSeconds);
    ui.seek.step = 'any';
    const fragment = document.createDocumentFragment();
    keyButtons = clip.keys.map((key, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sprite-key';
      button.dataset.keyIndex = String(index);
      button.setAttribute('aria-current', 'false');
      button.title = '시각 ' + key.time + '초 선택';
      leafText(button, key.time.toFixed(4) + ' s · Frame ' + key.frame);
      fragment.append(button);
      return button;
    });
    ui.tracks.replaceChildren(fragment);
    activeKey = -1;
    syncClock();
  }

  function render() {
    if (disposed || fatalError) return false;
    try {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width || ui.stage.clientWidth || 640);
      const height = Math.max(1, bounds.height || ui.stage.clientHeight || 480);
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const backingWidth = Math.max(1, Math.round(width * dpr));
      const backingHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== backingWidth) canvas.width = backingWidth;
      if (canvas.height !== backingHeight) canvas.height = backingHeight;
      dimensions = Object.freeze({ width, height, backingWidth, backingHeight, dpr });
      context.setTransform(backingWidth / width, 0, 0, backingHeight / height, 0, 0);
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
      context.filter = 'none';
      context.shadowBlur = 0;
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, width, height);
      if (imageState !== 'ready') {
        renderMetadata = Object.freeze({ rendered: false, reason: 'image-' + imageState });
        return false;
      }
      // Integer partitions retain every source pixel, including a non-divisible edge.
      const cell = spriteClipCell(clip, frame, image.naturalWidth, image.naturalHeight, row);
      const { x: sx, y: sy, width: sw, height: sh } = cell;
      const fitScale = Math.min(1, Math.max(1, width - 48) / Math.ceil(image.naturalWidth / clip.atlas.columns),
        Math.max(1, height - 48) / Math.ceil(image.naturalHeight / clip.atlas.rows));
      const scale = fitScale * zoom / 100;
      const dw = sw * scale;
      const dh = sh * scale;
      const anchorX = width / 2;
      const anchorY = Math.max(0, height - 24);
      const dx = anchorX - dw / 2;
      const dy = anchorY - dh;
      context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
      drawCount++;
      renderMetadata = Object.freeze({
        rendered: true, renderer: 'Canvas2D', drawCount, frame, row, time,
        source: cell,
        destination: Object.freeze({ x: dx, y: dy, width: dw, height: dh }),
        footAnchor: Object.freeze({ x: anchorX, y: anchorY }),
        fitScale, zoom, scale, filter: 'none', globalAlpha: 1, aspectPreserved: true,
      });
      leafText(ui.status, 'Frame ' + frame + ' · 행 ' + cell.row + ' · 원본 셀 ' + sw + '×' + sh +
        ' px · ' + zoom + '% · ' + (playing ? '재생 중' : '정지') + (dirty ? ' · 수정됨' : ''));
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  }

  function seek(nextTime) {
    if (!Number.isFinite(nextTime)) throw new Error('시각은 유한한 숫자여야 합니다.');
    if (cancelPending()) notice('이전 원본 준비를 취소하고 현재 모션을 표시합니다.');
    stopPlayback(false);
    time = Math.max(0, Math.min(clip.durationSeconds, nextTime));
    frame = sampleSpriteClip(clip, time);
    syncClock();
    render();
  }

  function cancelPending() {
    loadSerial++;
    if (!pendingImage) return false;
    pendingImage.onload = pendingImage.onerror = null;
    pendingImage.removeAttribute('src');
    pendingImage = null;
    return true;
  }

  // Called only after schema, sampling and loaded image capacity all succeeded.
  function commitClip(nextClip, boundedTime, nextImage, message) {
    const nextFrame = sampleSpriteClip(nextClip, boundedTime);
    const changed = JSON.stringify(nextClip) !== JSON.stringify(clip);
    if (changed && imageState === 'ready') {
      undo.push(currentState());
      if (undo.length > HISTORY_LIMIT) undo.shift();
      redo.length = 0;
    }
    stopPlayback(false);
    clip = nextClip;
    image = nextImage;
    imageState = 'ready';
    row = clip.atlas.directionRow;
    time = boundedTime;
    frame = nextFrame;
    if (changed) dirty = true;
    rebuildClipUI();
    render();
    if (message) notice(message);
    return changed;
  }

  // A new source remains a candidate until its dimensions are validated. Failed
  // imports cannot change the active clip, image, clock, pose or undo history.
  function replaceClip(raw, nextTime = time, message = '') {
    const nextClip = makeClip(raw);
    if (!Number.isFinite(nextTime)) throw new Error('시각은 유한한 숫자여야 합니다.');
    const boundedTime = Math.max(0, Math.min(nextClip.durationSeconds, nextTime));
    const nextFrame = sampleSpriteClip(nextClip, boundedTime);
    if (imageState === 'ready' && nextClip.atlas.sourcePath === clip.atlas.sourcePath) {
      spriteClipCell(nextClip, nextFrame, image.naturalWidth, image.naturalHeight);
      cancelPending();
      return commitClip(nextClip, boundedTime, image, message);
    }
    cancelPending();
    const serial = loadSerial;
    const candidate = pendingImage = new Image();
    const current = () => !disposed && serial === loadSerial && pendingImage === candidate;
    candidate.onload = () => {
      if (!current()) return;
      try {
        spriteClipCell(nextClip, nextFrame, candidate.naturalWidth, candidate.naturalHeight);
        candidate.onload = candidate.onerror = null;
        pendingImage = null;
        commitClip(nextClip, boundedTime, candidate, message || '원본 아틀라스를 적용했습니다.');
      } catch (error) {
        candidate.onload = candidate.onerror = null;
        pendingImage = null;
        candidate.removeAttribute('src');
        if (imageState !== 'ready') {
          imageState = 'error';
          leafText(ui.status, '원본 이미지 크기 오류');
        }
        syncDisabled();
        render();
        notice('원본 크기와 열/행 설정이 맞지 않습니다. ' + error.message, true);
      }
    };
    candidate.onerror = () => {
      if (!current()) return;
      candidate.onload = candidate.onerror = null;
      pendingImage = null;
      candidate.removeAttribute('src');
      if (imageState !== 'ready') {
        imageState = 'error';
        leafText(ui.status, '원본 이미지 로드 실패');
      }
      syncDisabled();
      render();
      notice('원본 이미지 로드 실패. 현재 모션은 유지합니다. 프로젝트의 assets/ 경로를 확인하세요.', true);
    };
    notice('새 원본을 준비 중입니다. 준비가 끝나기 전에는 현재 모션을 유지합니다.');
    candidate.src = new URL('../' + nextClip.atlas.sourcePath, import.meta.url).href;
    return false;
  }

  function restoreHistory(from, to) {
    if (from.length === 0) return;
    const previous = from[from.length - 1];
    const nextFrame = previous.frame;
    // History contains immutable module-created clips; no raw JSON is retained.
    sampleSpriteClip(previous.clip, previous.time);
    spriteClipCell(previous.clip, nextFrame, previous.image.naturalWidth, previous.image.naturalHeight);
    cancelPending();
    to.push(currentState());
    if (to.length > HISTORY_LIMIT) to.shift();
    from.pop();
    stopPlayback(false);
    clip = previous.clip;
    image = previous.image;
    imageState = 'ready';
    row = clip.atlas.directionRow;
    time = previous.time;
    frame = nextFrame;
    dirty = previous.dirty;
    rebuildClipUI();
    render();
    notice('편집 이력을 복원했습니다.');
  }

  function playFrame(timestamp) {
    raf = 0;
    if (disposed || fatalError || !playing) return;
    if (document.hidden) {
      stopPlayback();
      render();
      return;
    }
    try {
      const dt = lastTimestamp === null ? 0 : Math.max(0, Math.min(0.05, (timestamp - lastTimestamp) / 1000));
      lastTimestamp = timestamp;
      const nextTime = time + dt;
      time = ui.loop.checked ? nextTime % clip.durationSeconds : Math.min(clip.durationSeconds, nextTime);
      frame = sampleSpriteClip(clip, time);
      if (!ui.loop.checked && nextTime >= clip.durationSeconds) stopPlayback(false);
      syncClock();
      if (render() && playing) raf = requestAnimationFrame(playFrame);
    } catch (error) { fail(error); }
  }

  function startPlayback() {
    if (imageState !== 'ready' || disposed || fatalError || playing) return;
    if (document.hidden) throw new Error('창이 숨겨진 동안에는 재생을 시작하지 않습니다.');
    if (cancelPending()) notice('이전 원본 준비를 취소하고 현재 모션을 재생합니다.');
    if (time >= clip.durationSeconds) time = 0;
    frame = sampleSpriteClip(clip, time);
    playing = true;
    lastTimestamp = null;
    syncClock();
    if (render()) raf = requestAnimationFrame(playFrame);
  }

  listen(ui.preset, 'change', () => {
    if (!['prepare', 'recovery'].includes(ui.preset.value)) throw new Error('알 수 없는 preset입니다.');
    replaceClip(presetClip(ui.preset.value), 0, '기존 Druid 4×8 프리셋을 불러왔습니다.');
  });
  listen(ui.row, 'change', () => {
    const nextRow = finiteInput(ui.row, '방향행');
    replaceClip({ ...clip, atlas: { ...clip.atlas, directionRow: nextRow } }, time, '방향행을 변경했습니다.');
  });
  listen(ui.frame, 'change', () => {
    const nextTime = enteredTime();
    const nextFrame = selectedFrame();
    cancelPending();
    stopPlayback(false);
    time = nextTime;
    frame = nextFrame;
    syncClock();
    render();
    notice('셀 미리보기입니다. 키 기록을 눌러 clip에 반영하세요.');
  });
  listen(ui['key-time'], 'change', () => seek(enteredTime()));
  listen(ui['key-time'], 'input', () => stopPlayback());
  listen(ui.seek, 'input', () => seek(finiteInput(ui.seek, '시각')));
  listen(ui.duration, 'change', () => {
    const durationSeconds = finiteInput(ui.duration, '길이');
    replaceClip({ ...clip, durationSeconds }, time, 'clip 길이를 변경했습니다. 기존 키 시각은 이동하지 않습니다.');
  });
  listen(ui['clip-name'], 'change', () => {
    replaceClip({ ...clip, name: ui['clip-name'].value }, time, 'clip 이름을 변경했습니다.');
  });
  listen(ui.record, 'click', () => {
    // Read the fields on click, including a value whose change event has not fired.
    const at = enteredTime();
    const value = selectedFrame();
    const keys = clip.keys.map(key => ({ ...key }));
    const existing = keys.findIndex(key => key.time === at);
    if (existing >= 0) keys[existing] = { time: at, frame: value };
    else {
      if (keys.length >= MAX_KEYS) throw new Error('편집기 키 한도는 2048개입니다.');
      keys.push({ time: at, frame: value });
      keys.sort((a, b) => a.time - b.time);
    }
    replaceClip({ ...clip, keys }, at, '현재 시각의 Frame ' + value + ' 키를 ' + (existing >= 0 ? '교체' : '기록') + '했습니다.');
  });
  listen(ui.remove, 'click', () => {
    const at = enteredTime();
    const index = clip.keys.findIndex(key => key.time === at);
    if (index < 0) throw new Error('현재 정확한 시각에 삭제할 키가 없습니다.');
    if (clip.keys.length === 1) throw new Error('마지막 남은 키는 삭제할 수 없습니다.');
    if (index === 0) throw new Error('첫 time 0 키는 삭제할 수 없습니다.');
    replaceClip({ ...clip, keys: clip.keys.filter((_, i) => i !== index) }, at, '현재 시각의 키를 삭제했습니다.');
  });
  listen(ui.tracks, 'click', event => {
    const button = event.target instanceof Element ? event.target.closest('button[data-key-index]') : null;
    if (!button || button.parentElement !== ui.tracks) return;
    const index = Number(button.dataset.keyIndex);
    if (!Number.isSafeInteger(index) || !clip.keys[index]) return;
    seek(clip.keys[index].time);
  });
  listen(ui.play, 'click', startPlayback);
  listen(ui.stop, 'click', () => {
    seek(0);
    notice('처음 시각으로 정지했습니다.');
  });
  listen(ui.undo, 'click', () => restoreHistory(undo, redo));
  listen(ui.redo, 'click', () => restoreHistory(redo, undo));
  listen(ui.zoom, 'input', () => {
    const nextZoom = finiteInput(ui.zoom, '확대');
    if (nextZoom < 75 || nextZoom > 175 || nextZoom % 5 !== 0) throw new Error('확대는 75..175%, 간격 5입니다.');
    zoom = nextZoom;
    render();
  });
  listen(ui.layout, 'change', () => {
    if (!['directional', 'linear'].includes(ui.layout.value)) throw new Error('아틀라스 배치를 선택하세요.');
    if (ui.layout.value === 'linear') ui['frames-per-row'].value = ui.columns.value;
    syncDisabled();
    notice('열/행과 프레임 수를 확인하고 원본 설정 적용을 누르세요.');
  });
  listen(ui['apply-source'], 'click', () => {
    const columns = finiteInput(ui.columns, '열 수');
    const layout = ui.layout.value;
    const atlas = { sourcePath: ui['source-path'].value.trim(), columns,
      rows: finiteInput(ui.rows, '행 수'), layout,
      framesPerRow: layout === 'linear' ? columns : finiteInput(ui['frames-per-row'], '행당 프레임 수'),
      directionRow: layout === 'linear' ? 0 : finiteInput(ui.row, '방향행') };
    replaceClip({ ...clip, frameCount: finiteInput(ui['frame-count'], '모션 프레임 수'), atlas }, time,
      '원본 설정을 적용했습니다. 전체 프레임 순서 배치로 각 포즈를 재생할 수 있습니다.');
  });
  listen(ui.sequence, 'click', () => {
    if (clip.frameCount > MAX_KEYS) throw new Error('한 번에 배치할 수 있는 키는 2048개입니다. 필요한 포즈를 선택해 기록할 수 있습니다.');
    const keys = Array.from({ length: clip.frameCount }, (_, index) =>
      ({ time: index / clip.frameCount * clip.durationSeconds, frame: index }));
    replaceClip({ ...clip, keys }, 0, clip.frameCount + '개 포즈를 현재 모션 길이에 균등하게 배치했습니다.');
  });
  listen(ui.import, 'click', () => {
    const text = ui.json.value;
    if (text.length > MAX_JSON_LENGTH) throw new Error('JSON은 1,000,000자 이하여야 합니다.');
    const imported = makeClip(JSON.parse(text), true);
    replaceClip(imported, 0, 'sprite clip JSON을 가져왔습니다. 게임이나 저장 데이터에는 적용하지 않습니다.');
  });
  listen(ui.export, 'click', () => {
    const text = JSON.stringify(clip, null, 2);
    ui.json.value = text;
    ui.json.hidden = false;
    // The textarea may live inside a disclosure owned by the page.
    const disclosure = ui.json.closest('details');
    if (disclosure) disclosure.open = true;
    let requested = false;
    let url;
    let anchor;
    try {
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      url = URL.createObjectURL(blob);
      objectURLs.add(url);
      anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = (clip.name.replace(/[^a-zA-Z0-9가-힣_-]+/g, '-').slice(0, 100) || 'sprite-clip') + '.sprite.json';
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      requested = true;
    } catch (error) {
      notice('다운로드 요청 실패: ' + (error instanceof Error ? error.message : String(error)) +
        '. 아래 JSON을 복사할 수 있습니다.', true);
      return;
    } finally {
      if (anchor) anchor.remove();
      // Keep the URL valid for an asynchronous browser download; pagehide revokes it.
      if (requested) notice('다운로드를 요청했습니다. 저장 완료는 확인하지 않았습니다. 아래 JSON도 복사할 수 있습니다.');
    }
  });
  listen(window, 'resize', render);
  listen(window, 'blur', () => {
    stopPlayback();
    render();
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden) {
      stopPlayback();
      render();
    }
  });

  const hook = Object.freeze({
    snapshot() {
      return Object.freeze({
        clip, atlas: clip.atlas, time, frame, sampledFrame: sampleSpriteClip(clip, time), row, playing, dirty, zoom,
        history: Object.freeze({ undo: undo.length, redo: redo.length, limit: HISTORY_LIMIT }),
        dimensions, render: renderMetadata,
        image: Object.freeze({ state: imageState, width: image.naturalWidth, height: image.naturalHeight,
          pending: !!pendingImage }),
        disposed, error: fatalError,
      });
    },
  });
  Object.defineProperty(window, '__exoduserSpriteEditor', { value: hook, writable: false, configurable: true });

  function dispose() {
    if (disposed) return;
    disposed = true;
    stopPlayback(false);
    cancelPending();
    if (observer) observer.disconnect();
    observer = null;
    const retainedImages = new Set([image, ...undo.map(entry => entry.image), ...redo.map(entry => entry.image)]);
    for (const retained of retainedImages) {
      retained.onload = retained.onerror = null;
      retained.removeAttribute('src');
    }
    for (const [node, type, handler] of listeners) node.removeEventListener(type, handler);
    listeners.length = 0;
    for (const url of objectURLs) URL.revokeObjectURL(url);
    objectURLs.clear();
    undo.length = 0;
    redo.length = 0;
    keyButtons.length = 0;
    syncDisabled();
    if (window.__exoduserSpriteEditor === hook) delete window.__exoduserSpriteEditor;
  }
  window.addEventListener('pagehide', dispose, { once: true });

  ui.preset.value = 'recovery';
  ui.row.value = '0';
  ui.zoom.min = '75';
  ui.zoom.max = '175';
  ui.zoom.step = '5';
  ui.zoom.value = '100';
  ui.json.maxLength = MAX_JSON_LENGTH;
  rebuildClipUI();
  leafText(ui.status, '원본 이미지 준비 중');
  notice('원본 아틀라스가 준비되면 편집을 시작할 수 있습니다.');
  syncDisabled();
  render();
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(() => render());
    observer.observe(ui.stage);
  }
  replaceClip(clip, 0, '원본 셀을 표시합니다. Frame 선택 후 키 기록으로 모션에 반영하세요.');
}

try { initialize(); }
catch (error) {
  leafText(document.getElementById('status'), '편집기 초기화 오류');
  leafText(document.getElementById('notice'), error instanceof Error ? error.message : String(error));
  for (const id of IDS) {
    const node = document.getElementById(id);
    if (node && 'disabled' in node) node.disabled = true;
  }
}

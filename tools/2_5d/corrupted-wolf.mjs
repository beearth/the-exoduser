// ROOT-ADOPTED derivative: CH1 corrupted_wolf artwork display trial, not ghoul/AI/combat.
// Actual atlas JSON/PNG pins precede decoding. Runtime cell copies preserve source pixels;
// no generated PNG, no anatomical-foot calibration, no independent RAF/timer.
export const CORRUPTED_WOLF_PROVENANCE = Object.freeze({
  status: 'ROOT-ADOPTED-DERIVATIVE',
  source: 'tools/team-followup-20261007/hell-rift/ENEMY/corrupted-wolf-preview-2_5d.candidate.mjs',
  completionId: 'CH1-RIFT-CONSUMER-LINK-20261007-CORRUPTED-WOLF-CONSUMER-CANDIDATE',
  sourceBytes: 9814, sourceSHA256: '8479b1148c911f3c5bb7b42c8522af6b00c4d9c9cee1ccb1e9731fb9596349c2',
  end: 'bc2a6cbd-34b2-4a47-be81-f55c65075e5a',
  scope: '기존 타락 늑대 원화 표시 시험 · 본편 미채택 · 해부학적 발 미인수'
});
const DIRS = Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']);
const FILE_DIRS = Object.freeze(['south', 'south_east', 'east', 'north_east', 'north', 'north_west', 'west', 'south_west']);
const pin = (path, bytes, sha256, width, height) => Object.freeze({ path, bytes, sha256, width, height });
const IDLE_PINS = Object.freeze([
  [798229, '156e76481bc26682afe7d85c01c94477e66e1718bbe88f9d67baddbcc561da23'],
  [808193, 'ed7693ea4052cf27c4318864f6e54edc846e941a8c8e12afecf3e03c904075ba'],
  [693012, '2b4cbc2cb2f8b33f1ce10cdce6e17b4e6b7c75fff13e0fd60787ddb3e803a81a'],
  [729568, 'b63ed215d947a6eb6b4709dc03fe169bb9482fe34814ef2a78f1a7efd3b2fff3'],
  [761588, '7c4e569e3c7e35c50e72e0b9ecb7c8fffe3ee73e3b98be976ced6d7a34a8d252'],
  [722767, 'e48798ba3d89e7a80ee8942be10439126d57b876bcb5228888df9a289b586d69'],
  [655038, 'd14e94607e70a14c068402a6d1047e78ab0cd710d07c61c42ec090f592acc27f'],
  [804413, '4801bd016a0804fedbfaa5d7b97eda7924cb093565d2a7864402570df6add64e']
].map(([bytes, sha], d) => pin(`img/atlas_ch1_8dir_${FILE_DIRS[d]}.png`, bytes, sha, 2048, 1280)));
const WALK_PINS = Object.freeze([
  [2232971, '5de3eb47f666d60c72da13b9cee90a1544b1f325db62e9ce2624551205f58429'],
  [2174353, 'b5c16fd3b82d402e33d42cb087bdaf85aa1459b423aab9f8f654f74ea0142070'],
  [1972388, '95acdda361d2d74add386083fc51dd44c8ea20d7883b299d1a00be618343c854'],
  [2060929, 'ebc2ba5f5f995e0c104c81829d97162d39b888ed92ffca35f016715a9396e41f'],
  [2119638, '04471ea9d4b695cc79dd8285ce78316c4bb01749d24c4319936befa066d96538'],
  [2102807, '6a89356bb56928a991f5e7f8dd0f0234ff0597d064af271fbe6673f3f4000e6c'],
  [2008571, '564b5f56042aaeb73e585ff1b68ab44faaac08f2f07abc3b1431710c2f30ac58'],
  [2090379, '2bcf554056a6cc4fa8bd250b69644d251d85366b645fb726399ec3b1b7fa50e3']
].map(([bytes, sha], d) => pin(`img/atlas_ch1_8dir_walk_${FILE_DIRS[d]}.png`, bytes, sha, 8192, 1280)));
export const CORRUPTED_WOLF_SOURCES = Object.freeze({
  idleMeta: pin('img/atlas_ch1_8dir.json', 3367, 'f4842e1834074c31ec2a04d5b803924029aa4e6da3c1f4be3bc7e469b771049b'),
  walkMeta: pin('img/atlas_ch1_8dir_walk.json', 3218, '4b18470e74a5b5afe1747e48a91fb2e78f5c9d213e336cef79074e94fcdbed9e'),
  idle: IDLE_PINS, walk: WALK_PINS
});
export const CORRUPTED_WOLF_LIMITS = Object.freeze({
  skin: 'corrupted_wolf', cell: 256, cols: 8, rows: 5, idx: 13, col: 5, row: 1,
  framesPerMob: 4, alphaThreshold: 16, defaultHeight: 0.36,
  nativeWalkDistancePerFrame: 128, metadataFPS: 'UNKNOWN', defaultPreviewFPS: 6,
  maxDeltaSeconds: 0.05, loadConcurrency: 2, orderBase: 30, footBand: 4320,
  orderWorldSpan: 8000, orderSpan: 10, footAnchor: 'UNKNOWN', referenceHeight: 'UNKNOWN'
});
const L = CORRUPTED_WOLF_LIMITS;
const finite = v => typeof v === 'number' && Number.isFinite(v);
function requireDirection(v) {
  if (!Number.isInteger(v) || v < 0 || v > 7) throw new Error('늑대 direction 정수 0..7 필요');
}
function cellRect(mode, frame) {
  if (mode !== 'idle' && mode !== 'walk') throw new Error('늑대 mode idle/walk 필요');
  const max = mode === 'walk' ? L.framesPerMob - 1 : 0;
  if (!Number.isInteger(frame) || frame < 0 || frame > max) throw new Error('늑대 frame 범위 오류');
  const x = (mode === 'walk' ? L.col * L.framesPerMob + frame : L.col) * L.cell;
  const y = L.row * L.cell;
  const width = mode === 'walk' ? 8192 : 2048;
  if (!Number.isInteger(L.col) || L.col < 0 || L.col >= L.cols || !Number.isInteger(L.row) || L.row < 0 || L.row >= L.rows || x + L.cell > width || y + L.cell > 1280) throw new Error('늑대 cell/UV 범위 오류');
  return Object.freeze({ x, y, width: L.cell, height: L.cell });
}
async function defaultDecoder(bytes) {
  if (typeof globalThis.createImageBitmap !== 'function') throw new Error('늑대 실제 ImageBitmap 디코더 필요');
  const image = await globalThis.createImageBitmap(new Blob([bytes], { type: 'image/png' }), {
    imageOrientation: 'none', premultiplyAlpha: 'none', colorSpaceConversion: 'none'
  });
  return { image, width: image.width, height: image.height, close: () => image.close() };
}
function readCells(decoded, mode) {
  const count = mode === 'walk' ? L.framesPerMob : 1;
  const first = cellRect(mode, 0), stripWidth = count * L.cell;
  if (decoded.data != null) {
    if (!(decoded.data instanceof Uint8Array) && !(decoded.data instanceof Uint8ClampedArray)) throw new Error('늑대 RGBA Uint8Array 필요');
    if (decoded.data.length !== decoded.width * decoded.height * 4) throw new Error('늑대 RGBA 길이 불일치');
    const data = new Uint8Array(stripWidth * L.cell * 4);
    for (let y = 0; y < L.cell; y++) {
      const start = ((first.y + y) * decoded.width + first.x) * 4;
      data.set(decoded.data.subarray(start, start + stripWidth * 4), y * stripWidth * 4);
    }
    return data;
  }
  if (!decoded.image) throw new Error('늑대 디코더는 실제 image 또는 RGBA data를 반환해야 함');
  let canvas;
  if (typeof globalThis.OffscreenCanvas === 'function') canvas = new globalThis.OffscreenCanvas(stripWidth, L.cell);
  else if (globalThis.document?.createElement) { canvas = document.createElement('canvas'); canvas.width = stripWidth; canvas.height = L.cell; }
  else throw new Error('늑대 알파 검수용 2D canvas 필요');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('늑대 2D canvas 생성 실패');
  ctx.drawImage(decoded.image, first.x, first.y, stripWidth, L.cell, 0, 0, stripWidth, L.cell);
  const data = ctx.getImageData(0, 0, stripWidth, L.cell).data;
  canvas.width = 0; canvas.height = 0;
  return data;
}
function copyCellBottomUp(strip, frame, count) {
  const rgba = new Uint8Array(L.cell * L.cell * 4), stride = count * L.cell * 4;
  let on = 0;
  for (let y = 0; y < L.cell; y++) {
    const source = y * stride + frame * L.cell * 4;
    const row = strip.subarray(source, source + L.cell * 4);
    rgba.set(row, (L.cell - y - 1) * L.cell * 4);
    for (let x = 3; x < row.length; x += 4) if (row[x] > L.alphaThreshold) on++;
  }
  return { rgba, alphaCount: on };
}

/** fetcher = Fetch API; decoder(bytes, {path,width,height,signal}) => owned {image|data,width,height,close?}.
 * Factory validates/loads all 8 directions before returning. Owned atlas bitmaps close after
 * one-time cell extraction; only valid 256px DataTextures remain. signal may cancel initialization.
 */
export async function createCorruptedWolf({ THREE, fetcher = globalThis.fetch, decoder = defaultDecoder,
  height = L.defaultHeight, previewFps = L.defaultPreviewFPS, terrain = null, camera = null, signal = null } = {}) {
  for (const name of ['Group', 'PlaneGeometry', 'MeshBasicMaterial', 'Mesh', 'DataTexture']) if (typeof THREE?.[name] !== 'function') throw new Error(`늑대 THREE.${name} 필요`);
  for (const name of ['RGBAFormat', 'UnsignedByteType', 'SRGBColorSpace', 'LinearFilter', 'ClampToEdgeWrapping', 'DoubleSide']) if (THREE[name] == null) throw new Error(`늑대 THREE.${name} 필요`);
  if (typeof fetcher !== 'function' || typeof decoder !== 'function' || !globalThis.crypto?.subtle?.digest) throw new Error('늑대 fetch/decode/WebCrypto 필요');
  if (!finite(height) || height <= 0 || !finite(previewFps) || previewFps <= 0 || previewFps > 60) throw new Error('늑대 표시 height/previewFps 범위 오류');
  if (terrain && typeof terrain.worldToScene !== 'function') throw new Error('늑대 terrain.worldToScene 필요');
  if (signal && typeof signal.addEventListener !== 'function') throw new Error('늑대 AbortSignal 필요');
  const controller = new AbortController(), frames = new Map(), jobs = new Map(), epochs = new Map();
  const validWalk = Array.from({ length: 8 }, () => []), alphaCounts = Array.from({ length: 8 }, () => []);
  const closed = new WeakSet(); let disposed = false, ready = false, geometry, material, mesh, group;
  let decodedCount = 0, decodedClosedCount = 0, textureCreatedCount = 0, textureDisposedCount = 0;
  let mode = 'idle', usedMode = 'idle', direction = 0, requestedFrame = 0, selectedFrame = 0, elapsed = 0;
  let reason = 'loading', error = null, frameSource = null, fallbackFrame = null, timing = 'preview-fps', metadataFPS = 'UNKNOWN';
  const live = () => { if (disposed || controller.signal.aborted) throw new Error('늑대 초기화 취소'); };
  function closeDecoded(value) {
    if (!value || typeof value !== 'object' || closed.has(value)) return;
    closed.add(value);
    try { if (typeof value.close === 'function') value.close(); else if (typeof value.image?.close === 'function') value.image.close(); }
    finally { decodedClosedCount++; }
  }
  function release() {
    if (disposed) return false;
    disposed = true; ready = false; controller.abort(); if (group) group.visible = false;
    frames.forEach(entry => { entry.texture.dispose(); textureDisposedCount++; }); frames.clear();
    geometry?.dispose(); if (material) material.map = null; material?.dispose(); group?.removeFromParent();
    signal?.removeEventListener('abort', onAbort); reason = 'disposed'; return true;
  }
  const onAbort = () => release();
  if (signal?.aborted) { release(); throw new Error('늑대 초기화 취소'); }
  signal?.addEventListener('abort', onAbort, { once: true });
  async function verifiedBytes(info, png = false) {
    live();
    const response = await fetcher(new URL(`../../${info.path}`, import.meta.url).href, { cache: 'no-store', signal: controller.signal });
    live();
    if (!response || response.ok !== true || typeof response.arrayBuffer !== 'function') throw new Error(`늑대 HTTP 실패: ${info.path}`);
    const bytes = new Uint8Array(await response.arrayBuffer()); live();
    if (bytes.length !== info.bytes) throw new Error(`늑대 bytes 불일치: ${info.path}`);
    const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes)); live();
    const sha = Array.from(digest, v => v.toString(16).padStart(2, '0')).join('');
    if (sha !== info.sha256) throw new Error(`늑대 fullSHA 불일치: ${info.path}`);
    if (png) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      if (![137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n) || view.getUint32(8) !== 13 || String.fromCharCode(...bytes.subarray(12, 16)) !== 'IHDR' || view.getUint32(16) !== info.width || view.getUint32(20) !== info.height || bytes[24] !== 8 || bytes[25] !== 6 || bytes[26] !== 0 || bytes[27] !== 0 || bytes[28] !== 0) throw new Error(`늑대 PNG IHDR 불일치: ${info.path}`);
    }
    return bytes;
  }
  function validateMeta(bytes, walk) {
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    const mob = value?.mobs && Object.hasOwn(value.mobs, L.skin) ? value.mobs[L.skin] : null;
    if (value.cell !== L.cell || value.cols !== L.cols || value.rows !== L.rows || !mob || mob.idx !== L.idx || mob.col !== L.col || mob.row !== L.row) throw new Error('늑대 atlas JSON 셀 계약 불일치');
    if (walk) {
      if (value.frames !== L.framesPerMob || value.framesPerMob !== L.framesPerMob || JSON.stringify(value.sampleIndices) !== '[0,1,3,5]') throw new Error('늑대 walk JSON 프레임 계약 불일치');
      if (Object.hasOwn(value, 'fps')) { if (!finite(value.fps) || value.fps <= 0) throw new Error('늑대 metadata fps 오류'); metadataFPS = value.fps; }
    } else if (value.total !== 40 || JSON.stringify(value.directions) !== JSON.stringify(DIRS)) throw new Error('늑대 idle JSON 방향 계약 불일치');
  }
  function loadDirection(nextMode, nextDirection) {
    requireDirection(nextDirection);
    if (nextMode !== 'idle' && nextMode !== 'walk') return Promise.reject(new Error('늑대 mode 오류'));
    const key = `${nextMode}|${nextDirection}`;
    if (jobs.has(key)) return jobs.get(key); // Same-key sharing: no reload or stale borrowed texture.
    const epoch = (epochs.get(key) || 0) + 1; epochs.set(key, epoch);
    const task = (async () => {
      const info = nextMode === 'idle' ? IDLE_PINS[nextDirection] : WALK_PINS[nextDirection];
      const bytes = await verifiedBytes(info, true); let decoded;
      try {
        decoded = await decoder(bytes, { path: info.path, width: info.width, height: info.height, signal: controller.signal });
        if (decoded && typeof decoded === 'object') decodedCount++;
        live(); if (epochs.get(key) !== epoch) throw new Error('늑대 오래된 방향 로드');
        if (!decoded || decoded.width !== info.width || decoded.height !== info.height) throw new Error(`늑대 디코드 크기 불일치: ${info.path}`);
        const count = nextMode === 'walk' ? L.framesPerMob : 1, strip = readCells(decoded, nextMode);
        for (let f = 0; f < count; f++) {
          const { rgba, alphaCount } = copyCellBottomUp(strip, f, count);
          if (nextMode === 'walk') alphaCounts[nextDirection].push(alphaCount);
          if (alphaCount === 0) { if (nextMode === 'idle') throw new Error(`늑대 idle 셀 비어 있음: ${DIRS[nextDirection]}`); continue; }
          const texture = new THREE.DataTexture(rgba, L.cell, L.cell, THREE.RGBAFormat, THREE.UnsignedByteType);
          texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace; texture.generateMipmaps = false;
          texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping; texture.wrapT = THREE.ClampToEdgeWrapping; texture.needsUpdate = true;
          frames.set(`${key}|${f}`, { texture, source: info, cell: cellRect(nextMode, f), alphaCount }); textureCreatedCount++;
          if (nextMode === 'walk') validWalk[nextDirection].push(f);
        }
      } finally { closeDecoded(decoded); }
    })(); jobs.set(key, task); return task;
  }
  try {
    const metaBytes = await Promise.all([verifiedBytes(CORRUPTED_WOLF_SOURCES.idleMeta), verifiedBytes(CORRUPTED_WOLF_SOURCES.walkMeta)]);
    validateMeta(metaBytes[0], false); validateMeta(metaBytes[1], true); live();
    const tasks = DIRS.flatMap((_, d) => [['idle', d], ['walk', d]]); let next = 0;
    const workers = Array.from({ length: L.loadConcurrency }, async () => { while (next < tasks.length) { live(); const [m, d] = tasks[next++]; await loadDirection(m, d); } });
    await Promise.all(workers); live();
    geometry = new THREE.PlaneGeometry(1, 1); geometry.translate(0, 0.5, 0);
    material = new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, alphaTest: 0.01 });
    mesh = new THREE.Mesh(geometry, material); mesh.name = 'corrupted-wolf-existing-art'; mesh.frustumCulled = false; mesh.scale.set(height, height, 1);
    group = new THREE.Group(); group.name = 'corrupted-wolf-preview-foot-unaccepted'; group.add(mesh);
    group.userData.scope = CORRUPTED_WOLF_PROVENANCE.scope; group.userData.billboard = true;
    ready = true; reason = 'ready';
    function snapshot() {
      return Object.freeze({ skin: L.skin, settled: true, ready, disposed, visible: !!group.visible && !!mesh.visible, reason, error,
        mode, usedMode, direction, directionLabel: DIRS[direction], requestedFrame, frame: selectedFrame, elapsed,
        fellBackFromEmptyWalkFrame: fallbackFrame, timing, metadataFPS, previewFPS: previewFps,
        sourceDirection: DIRS[direction], previewFps, metadataFps: typeof metadataFPS === 'number' ? metadataFPS : null,
        metadataFpsUnknown: metadataFPS === 'UNKNOWN', frameSource,
        nativeWalkDistancePerFrame: L.nativeWalkDistancePerFrame, displayHeight: height,
        footAnchor: 'UNKNOWN', referenceHeight: 'UNKNOWN', displayAnchor: 'cell-bottom-center', full3d: false, nativeAccepted: false,
        validWalkFrames: Object.freeze(validWalk.map(a => Object.freeze(a.slice()))),
        walkAlphaCounts: Object.freeze(alphaCounts.map(a => Object.freeze(a.slice()))),
        ownedTextures: frames.size, textureCreatedCount, textureDisposedCount, decodedCount, decodedClosedCount,
        ownedTextureBytes: frames.size * L.cell * L.cell * 4, liveAtlasBitmaps: decodedCount - decodedClosedCount,
        position: Object.freeze(group.position.toArray()), provenance: CORRUPTED_WOLF_PROVENANCE,
        renderContract: Object.freeze({ transparent: true, depthTest: false, depthWrite: false, renderOrder: mesh.renderOrder }), rafCount: 0 });
    }
    function update(dt, intent = {}) {
      if (disposed) return snapshot();
      try {
        if (!finite(dt) || dt < 0 || !intent || typeof intent !== 'object') throw new Error('늑대 dt/intent 오류');
        const nextMode = intent.mode ?? 'idle', nextDirection = intent.direction ?? 0;
        if (nextMode !== 'idle' && nextMode !== 'walk') throw new Error('늑대 mode idle/walk 필요'); requireDirection(nextDirection);
        mode = nextMode; direction = nextDirection;
        if (mode === 'walk') elapsed = (elapsed + Math.min(dt, L.maxDeltaSeconds)) % (L.framesPerMob / (typeof metadataFPS === 'number' ? metadataFPS : previewFps));
        if (Object.hasOwn(intent, 'walkDistance')) {
          if (!finite(intent.walkDistance) || intent.walkDistance < 0) throw new Error('늑대 walkDistance 오류');
          requestedFrame = mode === 'walk' ? Math.floor(intent.walkDistance / L.nativeWalkDistancePerFrame) % L.framesPerMob : 0; timing = 'native-distance';
        } else { requestedFrame = mode === 'walk' ? Math.floor(elapsed * (typeof metadataFPS === 'number' ? metadataFPS : previewFps)) % L.framesPerMob : 0; timing = typeof metadataFPS === 'number' ? 'metadata-fps' : 'preview-fps'; }
        const desired = frames.get(`${mode}|${direction}|${requestedFrame}`);
        usedMode = desired ? mode : 'idle'; selectedFrame = desired ? requestedFrame : 0;
        fallbackFrame = !desired && mode === 'walk' ? requestedFrame : null;
        const selected = desired || frames.get(`idle|${direction}|0`); if (!selected) throw new Error('늑대 검증된 셀 없음');
        frameSource = Object.freeze({ path: selected.source.path, bytes: selected.source.bytes, sha256: selected.source.sha256,
          width: selected.source.width, height: selected.source.height, direction: DIRS[direction], mode: usedMode,
          frame: selectedFrame, cell: selected.cell, alphaCount: selected.alphaCount });
        if (material.map !== selected.texture) { material.map = selected.texture; material.needsUpdate = true; }
        if (Object.hasOwn(intent, 'x') || Object.hasOwn(intent, 'y')) {
          if (!finite(intent.x) || !finite(intent.y) || !terrain) throw new Error('늑대 world x/y/terrain 필요');
          const p = terrain.worldToScene(intent.x, intent.y); if (!p || ![p.x, p.y, p.z].every(finite)) throw new Error('늑대 world transform 오류');
          group.position.copy(p); mesh.renderOrder = L.orderBase + (intent.y - L.footBand) / L.orderWorldSpan * L.orderSpan;
        } else mesh.renderOrder = L.orderBase;
        if (camera) { const q = camera.quaternion; if (!q || ![q.x, q.y, q.z, q.w].every(finite) || q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w <= 0) throw new Error('늑대 camera quaternion 오류'); group.quaternion.copy(q); }
        reason = fallbackFrame === null ? 'ready' : 'empty-walk-frame-idle-fallback'; error = null; mesh.visible = true; group.visible = true;
      } catch (failure) { group.visible = false; reason = failure instanceof Error ? failure.message : '늑대 update 오류'; error = reason; }
      return snapshot();
    }
    update(0, { mode: 'idle', direction: 0 });
    return Object.freeze({ object3d: group, update, snapshot, dispose: release,
      // Shared-key preload is already complete; reused for callers without reallocating/fetching.
      loadDirection: (m, d) => disposed ? Promise.reject(new Error('늑대 disposed')) : loadDirection(m, d) });
  } catch (error) { release(); throw error; }
}

import { adaptMapSourceScene } from '../../engine/fdg/map-source-adapter.js?v=0.16.0';

const $ = id => document.getElementById(id);
const text = (node, value) => { if (node.children.length) throw new Error('Text target must be a leaf'); node.textContent = String(value); };
const INPUT_BYTES = 8 * 1024 * 1024;
const PENDING_LABELS = {
  'executionData.startAuthority': '런타임 시작점의 원본 심볼·출처',
  'executionData.logicalHeight': '원본 논리 높이 샘플 또는 정규화 함수와 출처',
  'executionData.objectColliders': '실제 오브젝트 충돌 모양·위치',
  'executionData.boundaryColliders': '절벽 경계와 진입 예외 규칙',
  'executionData.placements': '원본 장식 인스턴스 배치',
  'executionData.imageLayers': '원본 이미지 크기·잘라낼 영역·배치 기준',
  'engineAuthored.heightMapping': '논리 높이 → 엔진 높이 환산',
  'engineAuthored.startAuthority': '설계 시작점과 출처 · 원 런타임 심볼은 UNKNOWN 유지',
  'engineAuthored.imageLayers': '승인 이미지의 자르기·배치·그리기 순서',
  'engineAuthored.camera': '시작 카메라와 추적 설정',
  'engineAuthored.settings': '허용 단차와 경사',
  'engineAuthored.resourceBindings': '원본 이미지의 로컬 리소스 연결',
  'engineAuthored.executionContract': '이 장면에 사용할 실행 방식',
  previewProject: '기존 캐릭터·스킬·VFX 선택',
};

/** Original source data review. It never substitutes a fixture for a pending scene. */
export class SourceScenePanel {
  constructor({ getProject, pause, refreshUI, status, installScene, installPreview }) {
    Object.assign(this, { getProject, pause, refreshUI, status, installScene, installPreview });
    this.busy = false;
    this.listeners = []; this.result = null; this.generation = 0; this.disposed = false;
    const listen = (id, event, fn) => { const node = $(id); node.addEventListener(event, fn); this.listeners.push(() => node.removeEventListener(event, fn)); };
    listen('source-scene-open', 'click', () => this.open());
    listen('source-scene-close', 'click', () => $('source-scene-dialog').close());
    listen('source-scene-dialog', 'close', () => { if (this.busy) this.generation++; this.refreshUI(); });
    listen('source-scene-review', 'click', () => this.review());
    listen('source-scene-install', 'click', () => this.install());
    for (const [fileId, targetId] of [['source-scene-file', 'source-scene-json'], ['source-resources-file', 'source-resources-json']]) {
      listen(fileId, 'change', () => this.readFile(fileId, targetId));
    }
    for (const id of ['source-scene-json', 'source-resources-json', 'source-scene-revision-json', 'source-resources-revision-json', 'source-authoring-json']) listen(id, 'input', () => this.invalidate());
  }
  get openDialog() { return !!$('source-scene-dialog').open; }
  get previewEligible() {
    const inspection = this.result?.inspection, authored = inspection?.engineAuthoredSnapshot;
    return !!this.installPreview && !this.result?.errors?.length && inspection?.approved9?.length === 9
      && authored?.previewLayout?.anchorConvention === 'bottom-center' && authored.previewLayout.pixelsPerSourcePixel === 1
      && typeof authored.previewLayout.authoredBy === 'string' && authored.previewLayout.authoredBy.trim().length > 0
      && inspection.approved9.every(item => authored.resourceBindings?.[item.canonicalAbsolutePath] === `fdg-source/ch1-1/${item.relative.split('/').at(-1)}`);
  }
  open() { if (this.disposed) return; this.pause(); $('source-scene-dialog').showModal(); this.refreshUI(); }
  invalidate() {
    this.generation++;
    this.result = null; $('source-scene-output').replaceChildren();
    $('source-scene-install').disabled = true;
    text($('source-scene-status'), '두 원본 JSON을 검토하세요. 입력을 바꾸면 이전 검토 결과는 폐기됩니다.');
    this.draw(null);
  }
  async readFile(fileId, targetId) {
    const file = $(fileId).files?.[0], generation = ++this.generation;
    if (!file) return;
    try {
      if (file.size > INPUT_BYTES) throw new Error('각 source JSON은 UTF-8 8MiB 이하입니다.');
      const raw = await file.text();
      if (this.disposed || generation !== this.generation) return;
      $(targetId).value = raw; this.invalidate();
      text($('source-scene-status'), `${file.name} · ${new TextEncoder().encode(raw).byteLength} bytes 읽음. 다른 원본과 함께 검토하세요.`);
    } catch (error) { if (!this.disposed) text($('source-scene-status'), error.message); }
    finally { $(fileId).value = ''; }
  }
  parse(id) {
    const raw = $(id).value;
    if (new TextEncoder().encode(raw).byteLength > INPUT_BYTES) throw new Error('각 source JSON은 UTF-8 8MiB 이하입니다.');
    return JSON.parse(raw);
  }
  review() {
    if (this.disposed || this.busy) return;
    this.pause();
    try {
      const authored = $('source-authoring-json').value.trim() ? this.parse('source-authoring-json') : undefined;
      const sourceRevision = $('source-scene-revision-json').value.trim() ? this.parse('source-scene-revision-json') : undefined;
      const manifestRevision = $('source-resources-revision-json').value.trim() ? this.parse('source-resources-revision-json') : undefined;
      this.result = adaptMapSourceScene($('source-scene-json').value, $('source-resources-json').value, { previewProject: this.getProject(), engineAuthored: authored, sourceRevision, manifestRevision });
      const result = this.result, rows = document.createDocumentFragment();
      const append = (heading, values) => {
        const section = document.createElement('section'), title = document.createElement('h3'); text(title, heading); section.append(title);
        for (const value of values) { const row = document.createElement('p'); text(row, value); section.append(row); }
        rows.append(section);
      };
      if (result.errors?.length) append('입력 오류', result.errors.map(error => `오류 · ${error}`));
      const pendingLabel = item => PENDING_LABELS[item.field] || `${item.field} · ${item.reason}`;
      append('원본에서 필요한 실행 데이터', (result.pending || []).filter(item => item.classification === 'SOURCE_INPUT').map(pendingLabel));
      append('엔진에서 지정할 환산·실행 설정', (result.pending || []).filter(item => item.classification !== 'SOURCE_INPUT').map(pendingLabel));
      append('원본 → FDG 입력', (result.mapping || []).map(item => `${item.sourceField} → ${item.fdgField} · ${item.status}${item.value === undefined ? '' : ` · ${typeof item.value === 'object' ? JSON.stringify(item.value) : item.value}`}`));
      const source = result.inspection?.sourceSnapshot, manifest = result.inspection?.manifestSnapshot;
      if (source) append('원본 상태', [`stage ${source.nativeContract?.stage} · ${source.nativeContract?.symbol} / ${source.nativeContract?.version}`, `polygon ${source.boundaryPolygon?.points}점 · nav ${source.nav?.totalTiles}셀 / 바닥 ${source.nav?.walkableTiles} · polygon-only`, `START raw ${source.start?.rawTile?.join(',')} → center ${source.start?.centerTile?.join(',')} → world ${source.start?.worldPx?.join(',')}`]);
      if (result.inspection?.visualPlacements) append('추가 리비전', [`원본 장식 배치 ${result.inspection.visualPlacements.length}개 · 시각 장식이며 실제 충돌체와 별도`, result.inspection.startResolution?.role === 'engine-authored-design-start' ? '설계 시작점 적용 · 원 런타임 심볼 UNKNOWN 보존 · 실제 충돌과 높이 함수는 원본 입력 필요' : '원 런타임 시작점 또는 별도 설계 시작점을 지정하세요. 이미지 배치는 엔진 제작 설정으로 지정할 수 있습니다.']);
      if (manifest) append('승인 리소스 경로 · 자동 로드 대기', [...(manifest.sourceAssets?.items || []).map(item => `${item.role} · ${item.canonicalAbsolutePath}`), ...(manifest.groundMaterials?.items || []).filter(item => item.canonicalAbsolutePath).map(item => `${item.key} · ${item.canonicalAbsolutePath}`)]);
      $('source-scene-output').replaceChildren(rows); this.draw(result);
      const count = result.pending?.length || 0;
      $('source-scene-install').disabled = !result.candidateProject && !this.previewEligible;
      text($('source-scene-install'), result.candidateProject ? '실제 장면 연결' : '제작 미리보기 연결 · UNADOPTED');
      text($('source-scene-status'), result.errors?.length ? `원본 입력 검증 실패 · 오류 ${result.errors.length}개 · 기존 프로젝트 유지` : result.candidateProject ? '실행 후보 준비 · 이미지 디코드 확인 후 장면 연결 가능' : this.previewEligible ? '원본 9개 디코드 후 85개 배치 · 제작 미리보기 가능 · 실제 높이·충돌 미확정' : `필수 입력 ${count}건 대기 · 원본 데이터와 엔진 설정을 구분해 확인하세요.`);
      this.status('CH1-1 원본 검토 · 실행에 필요한 미확정 입력을 확인하세요.', !!result.errors?.length);
    } catch (error) { this.result = null; this.draw(null); $('source-scene-install').disabled = true; $('source-scene-output').replaceChildren(); text($('source-scene-status'), `원본 입력 실패: ${error.message} · 기존 프로젝트 유지`); }
  }
  async install() {
    if (this.disposed || this.busy || (!this.result?.candidateProject && !this.previewEligible)) return;
    const generation = ++this.generation, candidate = this.result.candidateProject;
    this.busy = true; $('source-scene-install').disabled = true;
    text($('source-scene-status'), '승인 이미지와 캐릭터 디코드 확인 중 · 기존 장면 유지');
    try {
      const options = { isCurrent: () => !this.disposed && generation === this.generation };
      if (candidate) await this.installScene(candidate, options);
      else await this.installPreview(this.result.inspection, this.result.inspection.engineAuthoredSnapshot, options);
      if (this.disposed || generation !== this.generation) return;
      $('source-scene-dialog').close(); this.status(candidate ? 'CH1-1 원본 장면 연결 · 실제 이동과 접지를 확인하세요.' : 'CH1-1 제작 미리보기 연결 · UNADOPTED · 원본 이미지 / polygon 이동 · 높이·실제 충돌은 SOURCE_PENDING');
    } catch (error) { if (!this.disposed) text($('source-scene-status'), `실제 장면 연결 실패: ${error.message}`); }
    finally { if (!this.disposed) { this.busy = false; $('source-scene-install').disabled = !this.result?.candidateProject && !this.previewEligible; this.refreshUI(); } }
  }
  draw(result) {
    const canvas = $('source-scene-nav'), context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#101922'; context.fillRect(0, 0, canvas.width, canvas.height);
    const inspection = result?.inspection, source = inspection?.sourceSnapshot;
    const map = inspection?.tiles ? { width: inspection.gridSize[0], height: inspection.gridSize[1], tiles: inspection.tiles } : null;
    canvas.dataset.sceneReady = 'false'; canvas.dataset.navScope = map ? 'polygon-only' : 'none';
    if (!map) { text($('source-scene-nav-label'), '원본 nav 검토 · 실행 캔버스와 별도'); return; }
    const scale = Math.min(canvas.width / map.width, canvas.height / map.height), left = (canvas.width - map.width * scale) / 2, top = (canvas.height - map.height * scale) / 2;
    context.fillStyle = '#334f48';
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) if (map.tiles[y * map.width + x] === 1) context.fillRect(left + x * scale, top + y * scale, scale, scale);
    const points = source?.boundaryPolygon?.data || [];
    if (points.length) { context.beginPath(); points.forEach(([x, y], i) => { if (i) context.lineTo(left + x * scale, top + y * scale); else context.moveTo(left + x * scale, top + y * scale); }); context.closePath(); context.strokeStyle = '#c9cf9e'; context.lineWidth = 1; context.stroke(); }
    const start = source?.start?.centerTile;
    if (start) { context.beginPath(); context.arc(left + start[0] * scale, top + start[1] * scale, 3, 0, Math.PI * 2); context.fillStyle = '#e7c782'; context.fill(); }
    text($('source-scene-nav-label'), `${map.width}×${map.height} 원 nav / 경계 ${points.length}점 · polygon-only · 실제 접지/충돌 미인수`);
  }
  dispose() {
    if (this.disposed) return; this.disposed = true; this.generation++;
    for (const remove of this.listeners.splice(0)) remove();
    $('source-scene-dialog').close(); this.result = null;
    for (const id of ['source-scene-json', 'source-resources-json', 'source-scene-revision-json', 'source-resources-revision-json', 'source-authoring-json']) $(id).value = '';
    $('source-scene-output').replaceChildren();
    this.draw(null); this.getProject = null; this.pause = null; this.refreshUI = null; this.status = null; this.installScene = null; this.installPreview = null;
  }
}

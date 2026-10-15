import { analyzeProject } from '../../engine/fdg/optimization.js';
import { FrameProfiler } from '../../engine/fdg/profiler.js';

const $ = id => document.getElementById(id);
const text = (node, value) => { if (node.children.length) throw new Error('Text target must be a leaf'); node.textContent = String(value); };
const mib = bytes => `${(bytes / 1048576).toFixed(2)} MiB`;
const fixed = value => Number.isFinite(value) ? value.toFixed(2) : '—';

export class OptimizationPanel {
  constructor({ getProject, getImages, getRuntime, canStart, canApply, startPreview, stopPreview, apply, download, status }) {
    Object.assign(this, { getProject, getImages, getRuntime, canStart, canApply, startPreview, stopPreview, apply, download, status });
    this.profiler = null; this.analysis = null; this.measurement = null; this.previousMeasurement = null;
    this.environment = null; this.previousEnvironment = null; this.starting = false; this.measuring = false; this.lastPaint = 0; this.request = 0; this.timer = null;
    for (const id of ['optimization-fps', 'optimization-bursts', 'optimization-particles', 'optimization-memory', 'optimization-texture', 'optimization-scenario']) {
      $(id).addEventListener('change', () => { this.stop('측정 설정 변경'); this.refresh(); });
    }
    $('optimization-start').addEventListener('click', () => this.start());
    $('optimization-stop').addEventListener('click', () => this.stop('사용자 정지'));
    $('optimization-export').addEventListener('click', () => {
      this.download(this.snapshot(), 'fdg-optimization-report.json');
      this.status('제작 예산과 프레임 측정 보고서를 내보냈습니다.');
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop('탭 숨김으로 측정 종료'); });
    window.addEventListener('blur', () => this.stop('창 포커스 해제로 측정 종료'));
  }
  get active() { return this.measuring || this.starting; }
  settings() {
    return { concurrentBursts: Number($('optimization-bursts').value), particleBudget: Number($('optimization-particles').value),
      textureBudgetMiB: Number($('optimization-memory').value), maxTextureDimension: Number($('optimization-texture').value) };
  }
  refresh() {
    this.analysis = analyzeProject(this.getProject(), { ...this.settings(), images: this.getImages() });
    const { assets, memory, recommendations, issues } = this.analysis;
    text($('optimization-memory-result'), `${mib(memory.runtimeBytes)} / ${this.analysis.settings.textureBudgetMiB} MiB · 미확인 ${memory.unknownRuntimeAssets.length}개`);
    text($('optimization-reference-result'), `${mib(memory.referenceBytes)} · 게임 미리보기 합계에서 제외`);
    const rows = document.createDocumentFragment();
    for (const asset of assets) {
      const row = document.createElement('tr'); row.dataset.scope = asset.scope; row.dataset.src = asset.src;
      const cells = [asset.owners.includes('map.groundSrc') ? '지면 후보 · 미연결' : asset.scope === 'runtime' ? '게임용 제작' : '참고 자료', asset.src.split('/').at(-1),
        asset.width && asset.height ? `${asset.width} × ${asset.height}` : '치수 미확인',
        { decoded: '실제 파일', declared: '시트 선언', unknown: '미확인' }[asset.dimensionSource], asset.rgbaBytes === null ? '미확인' : mib(asset.rgbaBytes)];
      for (const value of cells) { const cell = document.createElement('td'); text(cell, value); row.append(cell); }
      row.title = `${asset.src}\n${asset.owners.join(', ')}`; rows.append(row);
    }
    $('optimization-assets').replaceChildren(rows);
    const tips = document.createDocumentFragment();
    for (const tip of recommendations) {
      const row = document.createElement('div'); row.className = 'optimization-recommendation';
      const label = document.createElement('span');
      const effect = this.analysis.effects.find(effect => effect.id === tip.vfxId);
      text(label, `${effect?.name || tip.vfxId}: 장식 입자 ${tip.from} → ${tip.to} / 동시 ${this.analysis.settings.concurrentBursts}회`);
      const button = document.createElement('button'); text(button, '적용 · 취소 가능'); button.dataset.vfxId = tip.vfxId;
      button.disabled = this.active || !this.canApply(); button.addEventListener('click', () => this.apply(tip));
      row.append(label, button); tips.append(row);
    }
    if (!recommendations.length) { const p = document.createElement('p'); text(p, '현재 입자 설정은 선택한 제작 예산 이내입니다.'); tips.append(p); }
    $('optimization-recommendations').replaceChildren(tips);
    const warnings = document.createDocumentFragment();
    for (const issue of issues) { const p = document.createElement('p'); p.className = issue.severity === 'error' ? 'error' : ''; text(p, issue.message); warnings.append(p); }
    $('optimization-issues').replaceChildren(warnings);
    this.renderMeasurement();
  }
  async start() {
    if (this.active || !this.canStart()) return;
    this.previousMeasurement = this.measurement ? structuredClone(this.measurement) : null;
    this.previousEnvironment = this.environment ? structuredClone(this.environment) : null;
    this.profiler = null; this.measurement = null; this.environment = null;
    this.starting = true; const request = ++this.request;
    this.renderMeasurement();
    try {
      const scenario = $('optimization-scenario').value, settings = this.settings();
      const preview = await this.startPreview(scenario, settings);
      if (request !== this.request) return;
      const runtime = this.getRuntime();
      this.environment = { recordedAt: new Date().toISOString(), userAgent: navigator.userAgent,
        viewport: { width: runtime.width, height: runtime.height }, pixelRatio: runtime.pixelRatio,
        canvas: { width: runtime.canvas.width, height: runtime.canvas.height }, scenario,
        targetFps: Number($('optimization-fps').value), settings, projectId: this.getProject().id, ...preview };
      this.profiler = new FrameProfiler({ targetFps: this.environment.targetFps, capacity: 600, warmupFrames: 12 });
      this.profiler.start(scenario === 'burst' ? '동시 VFX 미리보기' : '일반 실행 미리보기', runtime.stats);
      this.starting = false; this.measuring = true; this.measurement = this.profiler.snapshot(); this.refresh();
      this.timer = setTimeout(() => this.stop('6초 측정 완료'), 6000);
      this.status('6초 동안 실제 미리보기 프레임 간격을 측정합니다.');
    } catch (error) {
      if (request !== this.request) return;
      clearTimeout(this.timer); this.timer = null; this.starting = false; this.measuring = false;
      if (this.profiler) this.measurement = this.profiler.stop();
      this.stopPreview(); this.renderMeasurement(); this.status(`측정 시작 실패: ${error.message}`, true);
    }
  }
  sample(stats) {
    if (!this.measuring || !this.profiler?.sample(stats)) return;
    if (performance.now() - this.lastPaint < 250) return;
    this.lastPaint = performance.now(); this.measurement = this.profiler.snapshot(); this.renderMeasurement();
  }
  stop(reason = '측정 종료') {
    if (!this.active) return;
    ++this.request; clearTimeout(this.timer); this.timer = null; this.starting = false; this.measuring = false;
    if (this.profiler) this.measurement = this.profiler.stop();
    if (this.environment) this.environment.stopReason = reason;
    this.stopPreview(); this.refresh(); this.status(reason);
  }
  renderMeasurement() {
    const sample = this.measurement, metrics = sample?.metrics;
    text($('optimization-profile-state'), this.starting ? '에셋 준비 중' : this.active ? `측정 중 · ${sample?.sampleCount || 0}프레임` : sample ? `측정 종료 · ${sample.sampleCount}프레임` : '측정 대기');
    text($('optimization-gap-result'), metrics ? `P50 ${fixed(metrics.frameDeltaMs.p50)} / P95 ${fixed(metrics.frameDeltaMs.p95)} / P99 ${fixed(metrics.frameDeltaMs.p99)} ms` : 'P50 / P95 / P99 —');
    text($('optimization-cpu-result'), metrics ? `CPU P95 ${fixed(metrics.cpuMs.p95)} ms · 평균 ${fixed(metrics.fps)} FPS` : 'CPU P95 — · 평균 FPS —');
    text($('optimization-load-result'), metrics ? `입자 최대 ${metrics.peakParticles} · Canvas 호출 최대 ${metrics.peakDrawCalls} · 누락 틱 ${metrics.droppedSteps}` : '입자 / Canvas 호출 / 누락 틱 —');
    text($('optimization-budget-result'), metrics ? `프레임 목표 ${fixed(sample.frameBudgetMs)} ms · 초과 ${metrics.overBudgetFrames}/${sample.sampleCount}프레임` : '목표 60FPS = 16.67ms');
    const previous = this.previousMeasurement;
    const comparable = this.previousEnvironment && this.environment && ['scenario', 'targetFps', 'vfxId', 'pixelRatio', 'viewport', 'canvas', 'settings'].every(key => JSON.stringify(this.previousEnvironment[key]) === JSON.stringify(this.environment[key]));
    text($('optimization-comparison'), previous && sample ? `${comparable ? '참고 비교 · 표본 수 확인' : '측정 조건 다름 · 참고값'}: 이전 → 현재 P95 ${fixed(previous.metrics.frameDeltaMs.p95)} → ${fixed(metrics.frameDeltaMs.p95)} ms · 입자 최대 ${previous.metrics.peakParticles} → ${metrics.peakParticles}` : '다시 측정하면 이전 결과와 비교합니다.');
    $('optimization-start').disabled = this.active || !this.canStart(); $('optimization-stop').disabled = !this.active;
    if (this.active) { $('cast').disabled = true; $('emit').disabled = true; }
    for (const id of ['optimization-fps', 'optimization-bursts', 'optimization-particles', 'optimization-memory', 'optimization-texture', 'optimization-scenario']) $(id).disabled = this.active;
    for (const button of $('optimization-recommendations').querySelectorAll('button')) button.disabled = this.active || !this.canApply();
  }
  snapshot() {
    return structuredClone({ reportVersion: 1, scope: 'fdg-authoring-preview', analysis: this.analysis,
      measurement: this.profiler ? this.profiler.snapshot() : this.measurement, previousMeasurement: this.previousMeasurement,
      environment: this.environment, previousEnvironment: this.previousEnvironment, measuring: this.active,
      interpretation: 'RGBA 디코드 추정 / Canvas CPU·rAF 프레임 측정. 실제 VRAM·GPU 시간·본편 전투 FPS 인증은 포함하지 않음.' });
  }
  dispose() { this.stop('페이지 종료'); clearTimeout(this.timer); }
}

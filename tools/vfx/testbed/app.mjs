import { createLab, CONTRACT } from './engine.mjs';

const $ = id => document.getElementById(id);
const canvas = $('field'), context = canvas.getContext('2d', { alpha: false });
const lab = createLab();
const root = new URL('../../../', import.meta.url);
const images = {}, shadows = {}, keys = new Set();
const directions = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
const assetPaths = {
  newKi: 'assets/vfx/dota-reference-20261102/ki_slash_kez_r1_sheet.png',
  oldKi: 'assets/vfx/ki_slash_silver_sheet.png',
  newSlam: 'assets/vfx/dota-reference-20261102/ground_shock_echo_r3_sheet.png',
  oldSlam: 'assets/vfx/inferno_slam_impact_sheet.png',
  hit: 'assets/vfx/ki_slash_hit_silver_sheet.png',
  target: 'img/vfx_scarecrow/scarecrow_idle_2.png',
  ...Object.fromEntries(directions.map(d => ['hero-' + d, 'img/exoduser_warrior/' + d + '.png']))
};
let ready = false, skill = 'ki', variant = 'new', repeating = false, nextRepeat = 0, repeatStep = 1;
let width = 1, height = 1, dpr = 1, lastTime = performance.now(), lastReadout = -1;

function makeShadow(image) {
  const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(image, 0, 0);
  const data = x.getImageData(0, 0, c.width, c.height), p = data.data;
  for (let i = 0; i < p.length; i += 4) { const a = Math.max(p[i], p[i + 1], p[i + 2]) * p[i + 3] / 255; p[i] = 5; p[i + 1] = 4; p[i + 2] = 6; p[i + 3] = Math.min(255, a * 2.4); }
  x.putImageData(data, 0, 0); return c;
}
function resize() {
  const r = canvas.getBoundingClientRect(); width = r.width; height = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
}
new ResizeObserver(resize).observe(canvas);
function zoom(panelWidth) { return Math.min(panelWidth / (panelWidth < 500 ? 940 : 1120), height / 670, 1.15) * Number($('zoom').value) / 100; }
function camera() { return { x: lab.state.player.x + 85, y: lab.state.player.y - 20 }; }
function frame(image, cols, index, x, y, size, angle = 0, alpha = 1, blend = 'source-over') {
  const sw = image.width / cols, sh = sw;
  context.save(); context.translate(x, y); context.rotate(angle); context.globalAlpha = Math.max(0, Math.min(1, alpha)); context.globalCompositeOperation = blend;
  context.drawImage(image, (index % cols) * sw, Math.floor(index / cols) * sh, sw, sh, -size / 2, -size / 2, size, size); context.restore();
}
function floor(panelWidth, z) {
  const cam = camera();
  const g = context.createRadialGradient(panelWidth / 2, height * .58, 30, panelWidth / 2, height * .58, Math.max(panelWidth, height) * .8);
  g.addColorStop(0, '#343a36'); g.addColorStop(.6, '#252c29'); g.addColorStop(1, '#161e1d');
  context.fillStyle = g; context.fillRect(0, 0, panelWidth, height);
  context.save(); context.translate(panelWidth / 2 - cam.x * z, height * .57 - cam.y * z); context.scale(z, z);
  context.lineWidth = 1 / z; context.strokeStyle = '#c1bd9b0a'; context.beginPath();
  const extent = 1800;
  for (let x = -extent; x <= extent; x += 100) { context.moveTo(x, -extent); context.lineTo(x, extent); }
  for (let y = -extent; y <= extent; y += 100) { context.moveTo(-extent, y); context.lineTo(extent, y); }
  context.stroke();
  context.strokeStyle = '#b8a36d18'; context.lineWidth = 2 / z; context.beginPath(); context.ellipse(0, 0, 620, 420, 0, 0, Math.PI * 2); context.stroke();
  context.restore();
}
function ground(effect, mode) {
  const p = 1 - effect.life / effect.maxLife, index = Math.min(3, Math.floor(p * 4));
  const size = CONTRACT.slamRadius * 2 * .9 * (.72 + .28 * Math.min(1, p * 3.5));
  const alpha = p < .62 ? 1 : Math.max(0, (1 - p) / .38);
  if (mode === 'old') {
    // Same hero atlas selected by current H5 giantSlam. Auxiliary passes are isolated.
    frame(images.oldSlam, 2, index, effect.x, effect.y, size, 0, alpha, 'screen');
  } else {
    frame(images.newSlam, 2, index, effect.x, effect.y, size, 0, alpha);
    // Local contact accent scales with the inspector's rage amount; visual fixture only.
    if (p < .16 && effect.rage > 0) frame(images.hit, 2, 0, effect.x, effect.y - 6, 65 + effect.rage * .9, 0, (1 - p / .16) * .65, 'lighter');
  }
}
function hero(mode) {
  const s = lab.state, p = s.player;
  const direction = directions[(Math.round(p.angle / (Math.PI / 4)) + 8) % 8];
  const moving = Math.hypot(s.axes.x, s.axes.y) > 0;
  let index = moving ? 2 + Math.floor(s.tick / 5) % 8 : Math.floor(s.tick / 30) % 2;
  if (p.animationUntil > s.tick) index = 10 + Math.min(7, Math.floor((14 - Math.min(14, p.animationUntil - s.tick)) / 14 * 8));
  if (s.charging) index = 10;
  context.fillStyle = '#0007'; context.beginPath(); context.ellipse(p.x, p.y + 2, 35, 13, 0, 0, Math.PI * 2); context.fill();
  context.save(); context.imageSmoothingEnabled = false;
  context.drawImage(images['hero-' + direction], index * 48, 0, 48, 48, p.x - 80, p.y - 137, 160, 160); context.restore();
  if (s.charging) {
    const image = images[mode === 'old' ? 'oldKi' : 'newKi'];
    frame(image, 3, Math.floor(s.tick / 7) % 3, p.x, p.y - 53, 78 + 13 * s.chargeTier, p.angle, .65 + .08 * s.chargeTier, 'lighter');
    context.fillStyle = '#282a25'; context.fillRect(p.x - 38, p.y + 24, 76, 4);
    context.fillStyle = '#dac596'; context.fillRect(p.x - 38, p.y + 24, 76 * s.chargeFrames / CONTRACT.holdMax, 4);
  }
}
function target(t) {
  context.fillStyle = '#0006'; context.beginPath(); context.ellipse(t.x, t.y + 2, 30, 10, 0, 0, Math.PI * 2); context.fill();
  context.save(); if (t.hitUntil > lab.state.tick) context.filter = 'brightness(2.6)';
  context.drawImage(images.target, t.x - 72, t.y - 132, 144, 144); context.restore();
  context.textAlign = 'center'; context.font = '11px "Malgun Gothic"'; context.fillStyle = t.hitUntil > lab.state.tick ? '#fff1c8' : '#a39e86';
  context.fillText(t.hitUntil > lab.state.tick ? '접촉' : t.id, t.x, t.y + 22);
}
function wave(w, mode) {
  const p = 1 - w.life / w.maxLife, index = Math.min(8, Math.floor(p * 9)), size = (w.step === 3 ? 252 : 192) * w.scale;
  const image = images[mode === 'old' ? 'oldKi' : 'newKi'], shadow = shadows[mode === 'old' ? 'oldKi' : 'newKi'];
  const alpha = Math.min(1, (1 - p) * 2.5), yOffset = -32;
  frame(shadow, 3, index, w.x, w.y + yOffset, size * 1.14, w.angle, alpha * .9);
  for (const [i, opacity] of [[3, .08], [1, .18]]) if (w.trail[i]) frame(image, 3, index, w.trail[i].x, w.trail[i].y + yOffset, size * .9, w.angle, alpha * opacity, 'lighter');
  frame(image, 3, index, w.x, w.y + yOffset, size * 1.08, w.angle, alpha * (w.step === 3 ? .3 : .18), 'lighter');
  frame(image, 3, index, w.x, w.y + yOffset, size, w.angle, alpha, 'lighter');
}
function drawPanel(left, panelWidth, mode) {
  context.save(); context.translate(left, 0); context.beginPath(); context.rect(0, 0, panelWidth, height); context.clip();
  const z = zoom(panelWidth), cam = camera(); floor(panelWidth, z);
  context.save(); context.translate(panelWidth / 2 - cam.x * z, height * .57 - cam.y * z); context.scale(z, z);
  const s = lab.state;
  if ($('ranges').checked) {
    context.save(); context.lineWidth = 1 / z; context.setLineDash([6 / z, 7 / z]); context.strokeStyle = '#c8b17c80';
    for (const e of s.grounds) { context.beginPath(); context.arc(e.x, e.y, CONTRACT.slamRadius, 0, Math.PI * 2); context.stroke(); }
    for (const w of s.waves) { context.beginPath(); context.arc(w.x, w.y, w.r, 0, Math.PI * 2); context.stroke(); }
    context.restore();
  }
  for (const effect of s.grounds) ground(effect, mode);
  const objects = [...s.targets.map(t => ({ y: t.y, draw: () => target(t) })), { y: s.player.y, draw: () => hero(mode) }];
  objects.sort((a, b) => a.y - b.y); for (const object of objects) object.draw();
  for (const w of s.waves) wave(w, mode);
  if ($('hit-effects').checked) for (const hit of s.impacts) {
    const progress = (s.tick - hit.born) / hit.life, index = Math.min(3, Math.floor(progress * 4));
    frame(shadows.hit, 2, index, hit.x, hit.y - 26, 140 * hit.scale * 1.14, hit.angle, .7 * (1 - progress));
    frame(images.hit, 2, index, hit.x, hit.y - 26, 140 * hit.scale, hit.angle, 1 - progress * .5, 'lighter');
  }
  context.restore();
  context.textAlign = 'left'; context.font = '11px "Malgun Gothic"'; context.fillStyle = mode === 'new' ? '#dec695' : '#b1afa5';
  context.fillText(mode === 'new' ? '시안 · 레퍼런스 반영' : '원본 · 현재 H5 시트', 15, 24);
  context.restore();
}
function draw() {
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (variant === 'split') { drawPanel(0, width / 2, 'old'); drawPanel(width / 2, width / 2, 'new'); context.strokeStyle = '#887651'; context.lineWidth = 1; context.beginPath(); context.moveTo(width / 2, 0); context.lineTo(width / 2, height); context.stroke(); }
  else drawPanel(0, width, variant);
}
function updateReadout() {
  const s = lab.state;
  $('cast-count').textContent = String(s.totalCasts); $('hit-count').textContent = String(s.totalContacts); $('active-count').textContent = String(s.waves.length + s.grounds.length);
  const lastCast = s.casts.at(-1), elapsed = lastCast ? s.tick - lastCast.tick : 0;
  $('frame-clock').textContent = !lastCast ? '준비' : s.waves.length + s.grounds.length ? elapsed + 'f · ' + (elapsed / CONTRACT.hz).toFixed(2) + 's' : '종료'; $('action-state').textContent = s.lastAction;
  $('charge-state').textContent = s.charging ? '충전 ' + s.chargeTier + '/3 · ' + (s.chargeFrames / 60).toFixed(2) + 's' : s.combo === 2 ? '다음 입력 유지 → 3타 충전' : s.combo === 1 ? '다음 입력 → 2타' : '좌클릭으로 시작';
  $('pause').textContent = s.paused ? '재생' : '정지'; $('pause').setAttribute('aria-pressed', String(s.paused));
}
function focus() { canvas.focus({ preventScroll: true }); }
function selectSkill(value) {
  skill = value; $('skill-ki').classList.toggle('active', value === 'ki'); $('skill-slam').classList.toggle('active', value === 'slam');
  $('skill-ki').setAttribute('aria-pressed', String(value === 'ki')); $('skill-slam').setAttribute('aria-pressed', String(value === 'slam'));
  $('scene-name').textContent = value === 'ki' ? '기검참 · Kez / Echo Slash' : '대지 충격 · Earthshaker / Echo Slam';
  $('primary-label').textContent = value === 'ki' ? '기검참 발동' : '대지 충격 발동'; $('primary-key').textContent = value === 'ki' ? '좌클릭' : 'Space';
  $('ki-actions').hidden = value !== 'ki'; $('tier-setting').hidden = value !== 'ki'; focus();
}
function selectVariant(value) {
  variant = value;
  for (const v of ['new', 'old', 'split']) { $('variant-' + v).classList.toggle('active', value === v); $('variant-' + v).setAttribute('aria-pressed', String(value === v)); }
  $('scene-mode').textContent = value === 'new' ? '시안' : value === 'old' ? '원본' : '동일 발동 · 나란히'; focus();
}
function togglePause() { lab.state.paused = !lab.state.paused; updateReadout(); focus(); }
function castSlam() { if (!ready) return; lab.slam(Number($('rage').value)); updateReadout(); focus(); }
function reset() { lab.reset(); keys.clear(); repeating = false; repeatStep = 1; $('repeat').setAttribute('aria-pressed', 'false'); updateReadout(); focus(); }
function aim(e) {
  const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
  const pw = variant === 'split' ? width / 2 : width, origin = variant === 'split' && px >= pw ? pw : 0, z = zoom(pw), cam = camera();
  const x = (px - origin - pw / 2) / z + cam.x, y = (py - height * .57) / z + cam.y;
  lab.state.player.angle = Math.atan2(y - (lab.state.player.y - 45), x - lab.state.player.x);
}
canvas.addEventListener('pointermove', aim);
canvas.addEventListener('pointerdown', e => { if (!ready || e.button !== 0) return; aim(e); focus(); canvas.setPointerCapture(e.pointerId); if (skill === 'ki') lab.attackDown(); else castSlam(); });
canvas.addEventListener('pointerup', () => lab.attackUp()); canvas.addEventListener('pointercancel', () => lab.cancelInput());
canvas.addEventListener('contextmenu', e => e.preventDefault());
$('primary').addEventListener('pointerdown', e => { if (!ready) return; e.preventDefault(); $('primary').setPointerCapture(e.pointerId); if (skill === 'ki') lab.attackDown(); else castSlam(); focus(); });
$('primary').addEventListener('pointerup', () => lab.attackUp()); $('primary').addEventListener('pointercancel', () => lab.cancelInput());
$('primary').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.repeat) { if (skill === 'ki') { lab.attackDown(); lab.attackUp(); } else castSlam(); } });
for (const n of [1, 2, 3]) $('cast-' + n).addEventListener('click', () => { lab.triggerKi(n, n === 3 ? Number($('tier').value) * CONTRACT.holdStep : 0); updateReadout(); focus(); });
$('cast-slam').addEventListener('click', castSlam); $('skill-ki').addEventListener('click', () => selectSkill('ki')); $('skill-slam').addEventListener('click', () => selectSkill('slam'));
for (const v of ['new', 'old', 'split']) $('variant-' + v).addEventListener('click', () => selectVariant(v));
$('pause').addEventListener('click', togglePause); $('step').addEventListener('click', () => { lab.state.paused = true; lab.step(); updateReadout(); focus(); });
$('reset').addEventListener('click', reset);
$('repeat').addEventListener('click', () => { repeating = !repeating; nextRepeat = lab.state.tick; $('repeat').setAttribute('aria-pressed', String(repeating)); focus(); });
$('targets').addEventListener('change', () => { lab.setTargets($('targets').value); keys.clear(); nextRepeat = 0; updateReadout(); });
$('rage').addEventListener('input', () => { $('rage-label').textContent = $('rage').value + '%'; });
$('zoom').addEventListener('input', () => { $('zoom-label').textContent = $('zoom').value + '%'; });
window.addEventListener('keydown', e => {
  if (!ready || e.target.closest?.('input,select,button') || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'p', '.', 'b', 'r', '1', '2', '3'].includes(k)) e.preventDefault();
  keys.add(k);
  if (!e.repeat) {
    if (k === ' ') castSlam(); if (k === 'p') togglePause(); if (k === 'b') selectVariant(variant === 'new' ? 'old' : 'new'); if (k === 'r') reset();
    if (k === '.') { lab.state.paused = true; lab.step(); updateReadout(); }
    if (['1', '2', '3'].includes(k)) lab.triggerKi(Number(k), k === '3' ? Number($('tier').value) * CONTRACT.holdStep : 0);
  }
});
window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => { keys.clear(); lab.cancelInput(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { keys.clear(); lab.cancelInput(); } lastTime = performance.now(); });
function loop(now) {
  const dt = Math.min(100, now - lastTime); lastTime = now;
  if (ready && !document.hidden) {
    lab.state.axes.x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
    lab.state.axes.y = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
    lab.advance(dt * Number($('speed').value));
    if (repeating && !lab.state.paused && lab.state.tick >= nextRepeat) {
      if (skill === 'ki') { lab.triggerKi(repeatStep, repeatStep === 3 ? Number($('tier').value) * CONTRACT.holdStep : 0); repeatStep = repeatStep % 3 + 1; }
      else lab.slam(Number($('rage').value));
      nextRepeat = lab.state.tick + (skill === 'ki' ? 45 : 90);
    }
    draw();
    if (lab.state.tick !== lastReadout || lab.state.paused) { updateReadout(); lastReadout = lab.state.tick; }
  }
  requestAnimationFrame(loop);
}
Promise.all(Object.entries(assetPaths).map(([name, source]) => new Promise((resolve, reject) => {
  const image = new Image(); image.onload = () => { images[name] = image; resolve(); }; image.onerror = () => reject(new Error(source)); image.src = new URL(source, root).href;
}))).then(() => {
  for (const key of ['oldKi', 'newKi', 'hit']) shadows[key] = makeShadow(images[key]);
  ready = true; $('loading').hidden = true; $('asset-state').textContent = '준비 완료'; $('ready-dot').classList.add('ready');
  for (const id of ['primary', 'cast-1', 'cast-2', 'cast-3', 'cast-slam', 'pause', 'step', 'repeat', 'reset']) $(id).disabled = false;
  resize(); updateReadout(); focus();
}).catch(error => { $('loading').textContent = '에셋을 불러오지 못했습니다: ' + error.message; $('asset-state').textContent = '로딩 실패'; });
requestAnimationFrame(loop);

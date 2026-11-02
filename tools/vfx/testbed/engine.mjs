// Visual contact fixture, not EXODUSER's damage/save/AI simulation.
export const CONTRACT = Object.freeze({ hz: 60, speed: 14, holdStep: 40, holdMax: 120, comboTicks: 120, slamTicks: 45, slamRadius: 500 });
export function targetsFor(preset = 'line') {
  if (preset === 'single') return [{ id: '01', x: 230, y: 0, r: 24 }];
  if (preset === 'dense') return Array.from({ length: 14 }, (_, i) => ({ id: String(i + 1).padStart(2, '0'), x: Math.cos(i * 2.399) * (140 + (i % 4) * 80), y: Math.sin(i * 2.399) * (140 + (i % 4) * 80), r: 24 }));
  return [{ id: '01', x: 180, y: 0, r: 24 }, { id: '02', x: 330, y: 0, r: 24 }, { id: '03', x: 480, y: 0, r: 24 }, { id: '04', x: 280, y: -180, r: 24 }, { id: '05', x: 280, y: 180, r: 24 }];
}
export function createLab(options = {}) {
  let targetSeed = options.targets || targetsFor();
  let serial = 0, accumulator = 0;
  const state = {};
  function reset() {
    serial = 0; accumulator = 0;
    Object.assign(state, { tick: 0, player: { x: 0, y: 0, angle: 0, animationUntil: 0 }, axes: { x: 0, y: 0 }, held: false, charging: false, chargeFrames: 0, chargeTier: 0, combo: 0, comboLeft: 0, cooldown: 0, paused: false, waves: [], grounds: [], impacts: [], casts: [], contacts: [], targets: targetSeed.map(t => ({ ...t, hits: 0, hitUntil: 0 })), lastAction: '준비', totalCasts: 0, totalContacts: 0 });
  }
  function boundedPush(list, value, limit) { list.push(value); if (list.length > limit) list.shift(); }
  function contact(target, source, angle, scale = 1) {
    target.hits++; target.hitUntil = state.tick + 10; state.totalContacts++;
    boundedPush(state.contacts, { target: target.id, source, tick: state.tick }, 128);
    boundedPush(state.impacts, { x: target.x, y: target.y - 28, angle, scale, born: state.tick, life: 12 }, 32);
  }
  function triggerKi(step, frames = 0) {
    if (![1, 2, 3].includes(step)) throw new RangeError('ki step must be 1, 2 or 3');
    const tier = step === 3 ? Math.min(3, Math.floor(Math.max(0, frames) / CONTRACT.holdStep)) : 0;
    const scale = 1 + tier * 0.4;
    const life = Math.floor([0, 250, 300, 350][step] / CONTRACT.speed);
    const p = state.player;
    const wave = { id: ++serial, x: p.x, y: p.y - 22, angle: p.angle, step, tier, scale, r: (step === 3 ? 120 : 55) * scale, life, maxLife: life, hit: new Set(), trail: [] };
    boundedPush(state.waves, wave, 24);
    const cast = { type: 'ki', step, tier, scale, tick: state.tick, x: p.x, y: p.y };
    boundedPush(state.casts, cast, 64);
    state.totalCasts++; state.combo = step; state.comboLeft = CONTRACT.comboTicks; state.cooldown = step === 3 ? 20 : 12;
    state.charging = false; state.chargeFrames = 0; state.chargeTier = 0;
    p.animationUntil = state.tick + 14;
    state.lastAction = '기검참 ' + step + '타' + (tier ? ' · 충전 ' + tier + '단' : '');
    return cast;
  }
  function attackDown() {
    if (state.held || state.cooldown > 0) return false;
    state.held = true;
    if (state.combo === 2 && state.comboLeft > 0) {
      state.charging = true; state.chargeFrames = 0; state.chargeTier = 0; state.lastAction = '3타 충전 중';
    } else triggerKi(state.combo === 1 && state.comboLeft > 0 ? 2 : 1);
    return true;
  }
  function attackUp() {
    state.held = false;
    if (state.charging) triggerKi(3, state.chargeFrames);
  }
  function cancelInput() { state.held = false; state.charging = false; state.chargeFrames = 0; state.chargeTier = 0; state.axes = { x: 0, y: 0 }; }
  function slam(rage = 100) {
    const p = state.player, value = Math.max(0, Math.min(100, Number(rage) || 0));
    const cast = { type: 'slam', rage: value, tick: state.tick, x: p.x, y: p.y };
    boundedPush(state.casts, cast, 64); boundedPush(state.grounds, { ...cast, life: CONTRACT.slamTicks, maxLife: CONTRACT.slamTicks }, 8);
    state.totalCasts++; p.animationUntil = state.tick + 18;
    state.lastAction = '대지 충격 · 분노 ' + value + '%';
    for (const t of state.targets) if (Math.hypot(t.x - p.x, t.y - p.y) <= CONTRACT.slamRadius + t.r) contact(t, 'slam', Math.atan2(t.y - p.y, t.x - p.x), 1.25);
    return cast;
  }
  function tick() {
    state.tick++;
    const p = state.player, axes = state.axes, norm = Math.hypot(axes.x, axes.y) || 1;
    p.x = Math.max(-680, Math.min(680, p.x + axes.x / norm * 4));
    p.y = Math.max(-430, Math.min(430, p.y + axes.y / norm * 4));
    state.cooldown = Math.max(0, state.cooldown - 1);
    if (!state.charging && state.comboLeft > 0 && --state.comboLeft === 0) state.combo = 0;
    if (state.charging) { state.chargeFrames = Math.min(CONTRACT.holdMax, state.chargeFrames + 1); state.chargeTier = Math.floor(state.chargeFrames / CONTRACT.holdStep); }
    for (const w of state.waves) {
      w.life--; if (w.life <= 0) continue;
      w.trail.unshift({ x: w.x, y: w.y }); if (w.trail.length > 5) w.trail.pop();
      w.x += Math.cos(w.angle) * CONTRACT.speed; w.y += Math.sin(w.angle) * CONTRACT.speed;
      for (const t of state.targets) if (!w.hit.has(t.id) && Math.hypot(t.x - w.x, t.y - w.y) <= w.r + t.r) { w.hit.add(t.id); contact(t, 'ki', w.angle, w.step === 3 ? w.scale : 1); }
    }
    state.waves = state.waves.filter(w => w.life > 0);
    for (const effect of state.grounds) effect.life--;
    state.grounds = state.grounds.filter(e => e.life > 0);
    state.impacts = state.impacts.filter(e => state.tick - e.born < e.life);
  }
  function step(count = 1) { for (let i = 0; i < Math.max(0, Math.min(600, Math.floor(count))); i++) tick(); }
  function advance(ms) {
    if (state.paused) return;
    accumulator += Math.max(0, Math.min(10000, ms));
    while (accumulator + 1e-8 >= 1000 / CONTRACT.hz) { tick(); accumulator -= 1000 / CONTRACT.hz; }
  }
  function snapshot() { return { tick: state.tick, casts: state.totalCasts, contacts: state.totalContacts, waves: state.waves.length, grounds: state.grounds.length, charging: state.charging, tier: state.chargeTier, lastAction: state.lastAction, player: { ...state.player } }; }
  function setTargets(preset) { targetSeed = targetsFor(preset); reset(); }
  reset();
  return { state, reset, triggerKi, attackDown, attackUp, cancelInput, slam, step, advance, snapshot, setTargets };
}

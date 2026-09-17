import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function block(src, marker) {
  const start = src.indexOf(marker);
  assert.ok(start >= 0, marker);
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error('Missing block end');
}

for (const file of ['game.html', 'game-easy-test.html']) {
  const src = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const init = src.slice(src.indexOf('const _HARP_TIER_F='), src.indexOf('const MBjust='));
  const start = block(src, "if(e.code==='ShiftLeft'&&G.on");
  const release = block(src, "if(e.code==='ShiftLeft'&&_dashHold&&!_harpActive");
  const hold = block(src, 'if(!_pDead&&_dashHold&&_dashHoldF<120)');
  const refire = block(src, "if(KH['ShiftLeft']&&P.s!=='fallen'");
  const flight = block(src, 'if(_harpActive&&!_harpHit)');
  function context(gauge, st = 100, wall = false) {
    const c = vm.createContext({
      P: { x: 0, y: 0, s: 'idle', skills: {}, mst: 100, st, facing: 0, poise: 0 },
      G: { on: true, paused: false, _pStats: { _dC: 0 } },
      e: { code: 'ShiftLeft', repeat: false }, KH: { ShiftLeft: true },
      _pDead: false, _gpActive: false, _dtSp: 1,
      pChargeRange: () => 1, isDimBreach: () => false, _aimDir: () => 0,
      _r: () => 1, _T: x => x, canMvBlink: () => !wall,
      dst: (x, y, a, b) => Math.hypot(a - x, b - y),
      playSample() {}, addTxt() {}, showPH() {}, _addSkProf() {}, addParts() {},
      SFX: { magic() {}, slash() {} },
    });
    vm.runInContext(init + `\n_harpGauge=${gauge};`, c);
    return c;
  }
  const state = c => vm.runInContext('({active:_harpActive,gauge:_harpGauge,range:_harpMaxDist,hold:_dashHold,x:_harpX,hit:_harpHit})', c);

  for (const mode of ['release', 'hold', 'refire', 'wall']) {
    test(`${file}: ${mode} uses the remaining gauge for a shorter chain`, () => {
      const c = context(22.5, 100, mode === 'wall');
      if (mode === 'refire') vm.runInContext(refire, c);
      else {
        vm.runInContext(start, c);
        assert.equal(state(c).hold, true, 'less than one cell can arm the chain');
        vm.runInContext('_dashHoldF=' + (mode === 'release' ? 6 : mode === 'hold' ? 11 : 0), c);
        vm.runInContext(mode === 'release' ? release : hold, c);
      }
      const expected = mode === 'release' ? 500 * 22.5 / 98 : mode === 'wall' ? 150 : 105;
      assert.equal(state(c).active, true);
      assert.equal(state(c).gauge, 0);
      assert.ok(Math.abs(state(c).range - expected) < 1e-9);
      assert.equal(c.G._pStats._dC, 1);
    });
  }
  test(`${file}: held chain spends 150 then the remaining 75 and stops at zero`, () => {
    const c = context(225);
    vm.runInContext(refire, c);
    assert.equal(state(c).range, 700);
    assert.equal(state(c).gauge, 75);
    vm.runInContext('_harpActive=false;' + refire, c);
    assert.equal(state(c).range, 350);
    assert.equal(state(c).gauge, 0);
    vm.runInContext('_harpActive=false;' + refire, c);
    assert.equal(state(c).active, false);
    assert.equal(c.G._pStats._dC, 2);
  });
  test(`${file}: zero gauge or insufficient stamina cannot fire`, () => {
    for (const [gauge, st] of [[0, 100], [75, 0]]) {
      const c = context(gauge, st);
      vm.runInContext(refire, c);
      assert.equal(state(c).active, false);
      assert.equal(state(c).gauge, gauge);
      assert.equal(c.P.st, st);
    }
  });
  test(`${file}: fractional remaining gauge cannot overshoot the paid distance`, () => {
    const c = context(1);
    vm.runInContext(refire, c);
    assert.equal(state(c).active, true);
    vm.runInContext(flight, c);
    assert.equal(state(c).hit, true);
    assert.ok(Math.abs(state(c).x - 700 / 150) < 1e-9);
  });
  test(`${file}: player reaches the paid endpoint across different frame steps`, () => {
    const moveStart = src.indexOf('    P.iframes=Math.max(P.iframes,2); // 이동 중 무적', src.indexOf('// 사슬 비행 중'));
    const move = src.slice(moveStart, src.indexOf('    // ── 경로상 적 히트', moveStart));
    const finish = src.match(/if\(\((_dashLeft-=[^)]+)\)<=0\)\{/);
    assert.ok(finish, 'movement time must advance with the actual step');
    for (const gauge of [0.1, 22.5, 75, 150]) for (const dt of [0.5, 1, 1.7, 3]) {
      const c = context(gauge);
      c._dtSp = dt;
      vm.runInContext(refire, c);
      for (let i = 0; i < 100 && !state(c).hit; i++) vm.runInContext(flight, c);
      assert.equal(state(c).hit, true);
      for (let i = 0; i < 100 && vm.runInContext('_dashLeft>0', c); i++) {
        vm.runInContext('{' + move + finish[1] + ';}', c);
      }
      assert.ok(Math.abs(c.P.x - 700 * gauge / 150) < 1e-8, `gauge=${gauge}, dt=${dt}`);
    }
  });
}

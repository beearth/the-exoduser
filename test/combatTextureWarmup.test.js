import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function fixture(file) {
  const html = readFileSync(new URL('../'+file, import.meta.url), 'utf8');
  const start = html.indexOf('function _warmupEnsAtlas(){');
  const end = html.indexOf('function _scheduleWarmupNext()', start);
  const image = ready => ({ complete: ready, naturalWidth: ready ? 512 : 0 });
  const mouth = image(true), orb = image(true), gore = image(true), impact = image(true);
  const ki = image(true), tint = { width: 512, height: 512 }, parry = image(true), bad = image(false);
  const water = image(true), medium = image(true), revival = image(true);
  const trap = image(true), corpses = Array.from({length:20},()=>({c:{width:128,height:128}}));
  const sandbox = {
    _ensWarmDone: false, _wqLen: 0, _wqIdx: 0, _wqTotal: 0, _wqBuf: [], _wqQueued: null,
    _wqGpuImages: new Set(), _saReady: false, _BONFIRE_BARRIER_IMG: image(false),
    _atlasP_img: null, _ch8Atlas: {}, _atlasExtBReady: false, _bossWalkAtlas: { ready: false },
    _atlasBReady: false, _atlasReady: false, _atlasEReady: false, _ghoulReady: {},
    _projAtlas: { ready: false }, _paReady: false, _BULLET_IMGS: [], _PSPRITES: {},
    _ESPRITES: {}, _impElSpr: {}, _impElBossSpr: {},
    _physMouthImg: mouth, _elemOrbImg: orb, _goreImgs: { bone: gore, missing: bad },
    _waterBlueFlightImg: water, _ch1StartMediumImgs: { sheet: medium },
    _mineTrapWardSheet: trap, _corpses: corpses,
    _diImgs: { hit: impact }, _kiSlashRadiant: { surfaces: [ki, tint] },
    _VFX_SHEETS: { parry_impact: { img: parry }, ki_slash_hit_0: { img: tint },
      magic_burst: { img: impact }, void_black: { img: revival }, unrelated_boss: { img: image(true) } },
    _warmupNext() {}, _warmAsyncJob() {}, // Async handoff lifecycle is exercised separately.
  };
  const queueStart = html.indexOf('function _queueWarmImage(img,cap){');
  vm.runInNewContext(html.slice(queueStart, start) + html.slice(start, end), sandbox);
  return { sandbox, expected: [mouth, orb, gore, impact, ki, tint, parry, water, medium, revival,trap,...corpses.slice(0,16).map(c=>c.c)], bad };
}

for (const file of ['game.html', 'game-easy-test.html']) {
test(file+': combat warmup submits ready projectile, gore, ki and parry surfaces before first combat draw', () => {
  const { sandbox: s, expected, bad } = fixture(file);
  s._warmupEnsAtlas();
  for (const image of expected) assert.ok(s._wqBuf.includes(image), 'A first-use combat surface was omitted');
  assert.ok(!s._wqBuf.includes(bad), 'Failed image must not be submitted');
  assert.equal(s._wqBuf.filter(image => image === expected[5]).length, 1, 'Tint shared by multiple registries is queued once');
  assert.ok(!s._wqBuf.includes(s._VFX_SHEETS.unrelated_boss.img), 'Inactive boss art is not preloaded');
  assert.ok(!s._wqBuf.includes(s._corpses[16].c), 'Corpse pool preparation is limited to the first 16 surfaces');
});

test(file+': completed and late-loaded combat images preserve dedupe and bounded queue behavior', () => {
  const { sandbox: s, expected, bad } = fixture(file);
  s._wqGpuImages.add(expected[0]); bad.complete = true; bad.naturalWidth = 256;
  s._warmupEnsAtlas();
  assert.ok(!s._wqBuf.includes(expected[0]), 'Already uploaded surface is not resubmitted');
  assert.ok(s._wqBuf.includes(bad), 'A newly ready gore surface is included on rescan');
  assert.ok(s._wqLen <= s._wqBuf.length && s._wqLen <= 80);
});
}

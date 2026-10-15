import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTACT_VFX_AUTHORING_POLICY,
  contactVfxAlpha,
} from '../engine/fdg/druid-contact-vfx.js';

const native = {
  active: true,
  kind: 'dark',
  sheet: 'Dark_MediumImpact.png',
  frame: 8,
  progress: 0.60,
  alpha: 0.8,
  overlap: true,
};
const exactPassthrough = input => {
  assert.ok(Object.is(contactVfxAlpha(input), input.alpha));
};
const close = (actual, expected) => {
  assert.ok(Math.abs(actual - expected) <= 1e-12, `${actual} != ${expected}`);
};
const freezeTree = object => {
  for (const value of Object.values(object)) {
    if (value !== null && typeof value === 'object') freezeTree(value);
  }
  return Object.freeze(object);
};

test('early contact core and unlisted kinds/materials preserve the native scalar', () => {
  for (const kind of ['dark', 'dark02']) {
    for (let frame = 0; frame < 8; frame++) {
      exactPassthrough({ ...native, kind, frame, progress: 1 });
    }
  }
  for (const kind of ['physical', 'projectile', 'hazard', 'magic', 'fire', 'lightning', '#a44cff', 'Dark']) {
    exactPassthrough({ ...native, kind, progress: 1 });
  }
  for (const sheet of ['Dark_MediumImpact.png.extra', 'assets/Dark_MediumImpact.png', 'dark_mediumimpact.png', 'Fire_ImpactFire_Sheet.png', undefined]) {
    exactPassthrough({ ...native, sheet, progress: 1 });
  }
});

test('medium tail begins exactly at frame 8 and fades only within existing progress', () => {
  exactPassthrough({ ...native, frame: 7, progress: 1 });
  for (const kind of ['dark', 'dark02']) {
    for (let frame = 8; frame < 16; frame++) {
      for (const [progress, expected] of [[0, 0.128], [0.60, 0.128], [0.80, 0.08], [1, 0.032]]) {
        const output = contactVfxAlpha({ ...native, kind, frame, progress });
        close(output, expected);
        assert.ok(output > 0 && output <= native.alpha);
      }
    }
  }
  for (const alpha of [0, -0, 1]) {
    const output = contactVfxAlpha({ ...native, alpha, progress: 1 });
    if (alpha === 0) assert.ok(Object.is(output, alpha));
    else close(output, 0.04);
  }
});

test('secondary smoke is eligible for dark only across all 16 frames', () => {
  const sheet = 'Dark_DarkSmoke_FBF_4x4.png';
  for (let frame = 0; frame < 16; frame++) {
    for (const [progress, expected] of [[0, 0.096], [0.60, 0.096], [0.80, 0.06], [1, 0.024]]) {
      close(contactVfxAlpha({ ...native, sheet, frame, progress }), expected);
    }
    exactPassthrough({ ...native, kind: 'dark02', sheet, frame, progress: 1 });
  }
  close(contactVfxAlpha({ ...native, sheet, frame: 15, progress: 1, alpha: 1 }), 0.03);
});

test('inactive or non-overlapping calls are exact and do not accept truthy substitutes', () => {
  for (const active of [false, undefined, null, 1, 'true', {}]) {
    exactPassthrough({ ...native, active, progress: 1 });
  }
  for (const overlap of [false, undefined, null, 1, 'true', {}]) {
    exactPassthrough({ ...native, overlap, progress: 1 });
  }
  for (const alpha of [NaN, Infinity, -Infinity, -0, undefined, '0.8']) {
    exactPassthrough({ ...native, active: false, alpha });
    exactPassthrough({ ...native, overlap: false, alpha });
  }
});

test('invalid alpha, progress and frame fields return the original value without coercion', () => {
  for (const alpha of [NaN, Infinity, -Infinity, -0.001, 1.001, '0.8', null, undefined]) {
    exactPassthrough({ ...native, alpha });
  }
  for (const progress of [NaN, Infinity, -Infinity, -0.001, 1.001, '0.8', null, undefined]) {
    exactPassthrough({ ...native, progress });
    exactPassthrough({ ...native, progress, alpha: -0 });
  }
  for (const frame of [-1, 16, 7.5, NaN, Infinity, '8', null, undefined]) {
    exactPassthrough({ ...native, frame });
  }
  assert.ok(Object.is(contactVfxAlpha({ alpha: NaN }), NaN));
  assert.equal(contactVfxAlpha(), undefined);
  assert.equal(contactVfxAlpha(null), undefined);
});

test('frozen authoring policy and nested native resources remain unchanged', () => {
  assert.ok(Object.isFrozen(CONTACT_VFX_AUTHORING_POLICY));
  assert.deepEqual(CONTACT_VFX_AUTHORING_POLICY, {
    mediumTailStartFrame: 8,
    mediumFrameCount: 16,
    mediumTailGain: 0.16,
    darkSmokeGain: 0.12,
    fadeStart: 0.60,
    fadeEnd: 1,
    fadeTailGain: 0.25,
  });
  assert.throws(() => { CONTACT_VFX_AUTHORING_POLICY.darkSmokeGain = 0; }, TypeError);
  const input = freezeTree({
    ...native,
    progress: 1,
    nativeEffect: {
      x: 1234.5,
      y: 9876.5,
      radius: 175,
      timer: 9,
      life: 16,
      damage: 84,
      direction: [0.6, 0.8],
      resource: { src: 'Dark_MediumImpact.png', uv: [0, 0, 0.25, 0.25] },
    },
  });
  const previous = structuredClone(input);
  close(contactVfxAlpha(input), 0.032);
  close(contactVfxAlpha(input), 0.032);
  assert.deepEqual(input, previous);
  assert.equal(input.nativeEffect.resource.src, previous.nativeEffect.resource.src);
  assert.equal(input.alpha, 0.8);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function physicalMouthClassifier() {
  const start = gameHtml.indexOf('function _isPhysicalMouthProjectile(');
  assert.ok(start >= 0, 'physical-mouth projectile classifier must exist');
  const end = gameHtml.indexOf('\n}', start) + 2;
  assert.ok(end > start + 1, 'physical-mouth projectile classifier must be complete');
  return Function(`const EL={P:0};${gameHtml.slice(start, end)};return _isPhysicalMouthProjectile`)();
}

test('untagged physical mouth and piercing physical shots are E-only projectiles', () => {
  const isPhysicalMouth = physicalMouthClassifier();
  assert.equal(isPhysicalMouth({ el: 0 }), true);
  assert.equal(isPhysicalMouth({ el: 0, pierce: true }), true);
  assert.equal(isPhysicalMouth({ el: 0, fast: true }), true);
  assert.equal(isPhysicalMouth({ el: 0, blackBean: true }), false, 'rainbow remains Q-only');
  assert.equal(isPhysicalMouth({ el: 0, web: true }), false, 'web uses its own visual/handling');
  assert.equal(isPhysicalMouth({ el: 1 }), false, 'elemental shots remain Q-parryable');
});

test('physical-mouth shots have an E reflection path and are excluded from generic Q parry', () => {
  const start = gameHtml.indexOf('// ══ 빨간콩탄:');
  const end = gameHtml.indexOf('// ══ 회전참 범위 내 탄 흡수:', start);
  assert.ok(start >= 0 && end > start, 'projectile parry section must exist');
  const parry = gameHtml.slice(start, end + 1800);
  assert.match(parry, /const _physicalMouth=_isPhysicalMouthProjectile\(p\)/);
  assert.match(parry, /if\(_physicalMouth&&!_pHit&&_pDist<_rbDeflR&&_sbActive/);
  assert.match(parry, /if\(_anyPW&&!p\.redBean&&!p\.titanEye&&!_physicalMouth\)/,
    'generic Q parry must reject physical-mouth shots');
});

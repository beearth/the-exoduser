import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') { depth++; opened = true; }
    else if (gameHtml[i] === '}') { depth--; if (opened && depth === 0) return gameHtml.slice(start, i + 1); }
  }
  assert.fail(`${name} must be complete`);
}

function physicalMouthClassifier() {
  const classStart = gameHtml.indexOf('function _projectileParryClass(');
  const classEnd = gameHtml.indexOf('function _isEnemyMagicBullet(', classStart);
  const start = gameHtml.indexOf('function _isPhysicalMouthProjectile(');
  assert.ok(classStart >= 0 && classEnd > classStart, 'projectile parry classifier must exist');
  assert.ok(start >= 0, 'physical-mouth projectile classifier must exist');
  const end = gameHtml.indexOf('\n}', start) + 2;
  assert.ok(end > start + 1, 'physical-mouth projectile classifier must be complete');
  return Function(`const EL={P:0};${gameHtml.slice(classStart, classEnd)}${gameHtml.slice(start, end)};return _isPhysicalMouthProjectile`)();
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

test('physical-mouth shots have an E reflection path and the generic Q path admits only magic shots', () => {
  const start = gameHtml.indexOf('// ══ 빨간콩탄:');
  const end = gameHtml.indexOf('// ══ 회전참 범위 내 탄 흡수:', start);
  assert.ok(start >= 0 && end > start, 'projectile parry section must exist');
  const parry = gameHtml.slice(start, end + 1800);
  assert.match(parry, /const _physicalMouth=_isPhysicalMouthProjectile\(p\)/);
  assert.match(parry, /if\(_physicalMouth&&!_pHit&&_pDist<_rbDeflR&&_sbActive/);
  assert.match(parry, /if\(_qParryActive&&_parryClass==='magic'\)/,
    'generic Q parry must admit only the independently classified magic shots');
});

test('physical projectile parries use the legacy white basic impact regardless of element color', () => {
  const doParry = extractFunction('doParry');
  const projectileUpdate = gameHtml.slice(gameHtml.indexOf('// ══ 빨간콩탄:'), gameHtml.indexOf('// ══ 무지개콩탄:'));

  assert.match(gameHtml, /registerVFX\('parry_impact','assets\/vfx\/parry_impact_sheet\.png',128,128,16,16\)/,
    'the legacy white basic parry sheet must remain registered');
  assert.match(doParry, /_impactKind==='physicalProjectile'/,
    'the shared parry feedback must have a projectile-physical branch instead of inferring from element color');
  assert.match(doParry, /playVFXAng\('parry_impact',_px,_py,1\.2,3,0,false\)/,
    'physical projectile parries must select the legacy white basic impact');
  assert.match(projectileUpdate, /doParry\(p\.dmg,p\.x,p\.y,false,'red',undefined,'physicalProjectile'\)/,
    'physical red-bean E parries must carry the physical-impact identity');
  assert.match(projectileUpdate, /doParry\(p\.dmg,p\.x,p\.y,false,p\.el,undefined,'physicalProjectile'\)/,
    'ordinary physical-mouth and fire-colored titan-eye E parries must carry the physical-impact identity');
});

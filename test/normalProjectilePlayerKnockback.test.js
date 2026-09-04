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
    if (gameHtml[i] === '{') {
      depth++;
      opened = true;
    } else if (gameHtml[i] === '}') {
      depth--;
      if (opened && depth === 0) return gameHtml.slice(start, i + 1);
    }
  }
  assert.fail(`${name} must be complete`);
}

test('ordinary projectile knockback follows its travel direction with strength 2', () => {
  const source = extractFunction('_normalProjectilePlayerKnockback');
  const knockback = Function(`${source};return _normalProjectilePlayerKnockback`)();

  assert.deepEqual(knockback({ x: 0, y: 0, vx: 8, vy: 0 }, 20, 0), { x: 2, y: 0 });
  const diagonal = knockback({ x: 0, y: 0, vx: 3, vy: 4 }, 20, 20);
  assert.equal(Math.hypot(diagonal.x, diagonal.y), 2);
  assert.ok(diagonal.x > 0 && diagonal.y > 0);
});

test('ordinary projectile direct hits pass the small vector without changing big-energy slide', () => {
  assert.match(gameHtml, /hurtP\(_pjD,\{dtype:p\.redBean\?'parry':'magic',redBean:!!p\.redBean,projHit:true,knockback:_normalProjectilePlayerKnockback\(p,P\.x,P\.y\)\}\)/,
    'the ordinary direct-hit branch must use the projectile travel vector');
  assert.match(gameHtml, /return\{x:_kx\/_km\*100,y:_ky\/_km\*100\}/,
    'large energy knockback must remain at strength 100');
});

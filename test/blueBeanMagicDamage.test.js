import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('all reflected blue bean conversions explicitly become magic projectiles', () => {
  const hits =
    gameHtml.match(
      /p\.redBean=false;p\.blueBean=true;p\.col='#00e5ff';p\.homing=true;p\.magic=true;/g
    ) || [];
  assert.equal(hits.length, 3);
});

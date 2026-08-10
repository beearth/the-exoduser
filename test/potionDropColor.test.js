import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('HP potion drops use the green recovery color for the flask and its ground glow', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /hp:\{name:'악의 추출',emoji:'👿',col:'#33cc66'/);
  const potionStart = game.indexOf("else if(it.type==='potion'){");
  const potionEnd = game.indexOf("else if(it.type==='item'){", potionStart);
  const potionDraw = game.slice(potionStart, potionEnd);
  assert.match(potionDraw, /X\.fillStyle=pt\.col/);
});

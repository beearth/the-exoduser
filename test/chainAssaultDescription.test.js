import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('Chain Blaze combat skill description explains stacked flame detonation', () => {
  const skillLine = gameHtml.match(/\{id:'chainAssault'[^\n]+/u)?.[0];
  assert.ok(skillLine, 'chainAssault skill definition must exist');
  assert.match(skillLine, /불바닥을 여러 개 쌓은 뒤/u);
  assert.match(skillLine, /충돌 스킬\(기동파괴\) 또는 분노 스킬\(지옥강타 1\)로 한 번에 폭발/u);
  assert.match(skillLine, /Stack multiple flame zones, then detonate them all at once/u);
  assert.match(skillLine, /collision skill \(Chain Crush\) or rage skill \(Hell Slam I\)/u);
});

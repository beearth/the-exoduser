import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function updateSource() {
  const start = gameHtml.indexOf('function update(){');
  const end = gameHtml.indexOf('\nfunction draw', start);
  assert.notEqual(start, -1, 'update() must exist');
  assert.notEqual(end, -1, 'draw function must follow update()');
  return gameHtml.slice(start, end);
}

test('pause guard runs after panel hotkeys but before every gameplay tick', () => {
  const source = updateSource();
  const panelHotkey = source.indexOf("if(isJust('settings'))togglePanel('settings');");
  const pauseGuard = source.indexOf('if(G.paused)return;');

  assert.notEqual(panelHotkey, -1, 'settings hotkey must be handled in update()');
  assert.notEqual(pauseGuard, -1, 'update() must stop while G.paused is true');
  assert.ok(panelHotkey < pauseGuard, 'panel hotkeys must run before the pause guard so ESC can unpause');

  for (const gameplayTick of [
    '_gameFrame++;',
    '_fbTick();',
    '_wmTick();',
    '_fdTick();',
    'if(G.pets)updatePet();',
  ]) {
    const tickIndex = source.indexOf(gameplayTick);
    assert.notEqual(tickIndex, -1, `${gameplayTick} must remain in update()`);
    assert.ok(
      pauseGuard < tickIndex,
      `${gameplayTick} must not run while the game is paused`,
    );
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameHtml = fs.readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('E shield and RMB magic remain the canonical input bindings', () => {
  assert.match(gameHtml, /weapon:'mouse0',\s*shield:'KeyE'/);
  assert.match(gameHtml, /parry:'KeyQ',\s*beam:'mouse2'/);
});

test('skill bar covers the stale baked labels with the live E and RMB bindings', () => {
  const slots = gameHtml.match(/const _SK_SLOTS=\[[\s\S]*?\n\];/);
  assert.ok(slots, 'skill-bar slot metadata must exist');
  assert.match(slots[0], /l:436,kc:'KeyE',[^\n]*bind:'shield'/);
  assert.match(slots[0], /l:522,kc:'mouse2',[^\n]*bind:'beam'/);

  const updater = gameHtml.match(/function _updateSkBarKeyLabels\(\)\{[\s\S]*?\n\}/);
  assert.ok(updater, 'skill-bar label updater must exist');
  assert.doesNotMatch(updater[0], /if\(!isPad\)\{row\.style\.display='none';return;\}/);
  assert.match(updater[0], /const code=BINDS\[s\.bind\]\|\|s\.kc/);
  assert.match(updater[0], /code==='mouse2'\?'RMB':code==='mouse0'\?'LMB':keyName\(code\)/);
  assert.match(updater[0], /row\.style\.top=isPad\?'56px':'121px'/);
});

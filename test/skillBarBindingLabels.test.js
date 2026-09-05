import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameHtml = fs.readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('E shield and RMB magic remain the canonical input bindings', () => {
  assert.match(gameHtml, /weapon:'mouse0',\s*shield:'KeyE'/);
  assert.match(gameHtml, /parry:'KeyQ',\s*beam:'mouse2'/);
});

test('skill bar keeps LMB and RMB adjacent before the Shift movement slot and E', () => {
  const slots = gameHtml.match(/const _SK_SLOTS=\[[\s\S]*?\n\];/);
  assert.ok(slots, 'skill-bar slot metadata must exist');
  assert.match(gameHtml, /#skSlotLMB\{left:392px\}/);
  assert.match(gameHtml, /#qsE\{left:436px\}/);
  assert.match(gameHtml, /#skSlot0\{left:479px\}/);
  assert.match(gameHtml, /#skSlotRMB\{left:522px\}/);
  assert.match(slots[0], /l:436,kc:'mouse2',[^\n]*bind:'beam'/);
  assert.match(slots[0], /l:479,kc:'ShiftLeft',[^\n]*pd:'LB'/);
  assert.match(slots[0], /l:522,kc:'KeyE',[^\n]*bind:'shield'/);

  const updater = gameHtml.match(/function _updateSkBarKeyLabels\(\)\{[\s\S]*?\n\}/);
  assert.ok(updater, 'skill-bar label updater must exist');
  assert.doesNotMatch(updater[0], /if\(!isPad\)\{row\.style\.display='none';return;\}/);
  assert.match(updater[0], /const code=BINDS\[s\.bind\]\|\|s\.kc/);
  assert.match(updater[0], /code==='mouse2'\?'RMB':code==='mouse0'\?'LMB':keyName\(code\)/);
  assert.match(updater[0], /row\.style\.top=isPad\?'56px':'121px'/);
});

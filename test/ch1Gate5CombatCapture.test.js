import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('tmp/verify_ch1_gate5_combat.py', 'utf8');

test('CH1 gate-5 combat capture closes panels without toggling settings open', () => {
  assert.doesNotMatch(source, /keyboard\.press\("Escape"\)/);
  assert.match(source, /typeof closeAllPanels==='function'\s*&&\s*closeAllPanels\(\)/);
});

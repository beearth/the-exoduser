import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// 의존 파일 tmp/verify_ch1_gate5_combat.py 는 미추적(untracked) — 없으면 skip
const SKIP = fs.existsSync('tmp/verify_ch1_gate5_combat.py') ? false : 'untracked dependency missing: tmp/verify_ch1_gate5_combat.py';
const source = SKIP ? '' : fs.readFileSync('tmp/verify_ch1_gate5_combat.py', 'utf8');

test('CH1 gate-5 combat capture closes panels without toggling settings open', { skip: SKIP }, () => {
  assert.doesNotMatch(source, /keyboard\.press\("Escape"\)/);
  assert.match(source, /typeof closeAllPanels==='function'\s*&&\s*closeAllPanels\(\)/);
});

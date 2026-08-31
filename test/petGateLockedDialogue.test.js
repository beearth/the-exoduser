import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game = fs.readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('first locked Hell Gate contact explains how to open it', () => {
  const start = game.indexOf('// 지옥문 봉인 중(80% 미만)이면 입장 차단');
  const end = game.indexOf('G._bossLoadPhase=1', start);
  assert.ok(start >= 0 && end > start, 'locked Hell Gate branch must exist');

  const lockedGateBranch = game.slice(start, end);
  assert.match(
    lockedGateBranch,
    /_petSayCD\('tut_gate_locked','cat','구역을 클리어하면 잠긴 지옥문이 열릴 거야\.',5,9999\)/,
  );
  assert.match(
    game,
    /'구역을 클리어하면 잠긴 지옥문이 열릴 거야\.':'Clear the area and the sealed Hell Gate will open\.'/,
  );
});

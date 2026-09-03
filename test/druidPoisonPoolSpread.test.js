import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function loadTargets() {
  const start = gameHtml.indexOf('function _druidPoisonPoolTargets(');
  assert.ok(start >= 0, 'druid poison-pool target helper must exist');
  const end = gameHtml.indexOf('\n}', start) + 2;
  assert.ok(end > start + 1, 'druid poison-pool target helper must be complete');
  return Function(`${gameHtml.slice(start, end)};return _druidPoisonPoolTargets`)();
}

test('druid poison pools target three separated lanes around the player', () => {
  const targets = loadTargets()(1000, 1000, 1000, 0);
  assert.equal(targets.length, 3);
  assert.deepEqual(targets.map(t => Math.round(t.x)), [1000, 640, 1360]);
  assert.deepEqual(targets.map(t => Math.round(t.y)), [1120, 1120, 1120]);
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      assert.ok(Math.hypot(targets[i].x - targets[j].x, targets[i].y - targets[j].y) >= 360,
        '150px-radius pools need at least a 60px gap');
    }
  }
});

test('druid lavaPools uses fixed non-overlapping radius and staggered warnings', () => {
  const lavaPools = gameHtml.indexOf("case'lavaPools':");
  const start = gameHtml.indexOf('if(G.stage===3){', lavaPools);
  const end = gameHtml.indexOf("addTxt(e.x,e.y-30,_T('☠ 독 늪!')", start);
  assert.ok(start >= 0 && end > start, 'druid lavaPools branch must exist');
  const block = gameHtml.slice(start, end);
  assert.match(block, /_druidPoisonPoolTargets\(P\.x,P\.y,e\.x,e\.y\)/);
  assert.match(block, /warnT:55\+_dl\*18/);
  assert.match(block, /r:150/);
  assert.doesNotMatch(block, /Math\.random/);
});

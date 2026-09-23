import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') { depth++; opened = true; }
    else if (gameHtml[i] === '}') {
      depth--;
      if (opened && depth === 0) return gameHtml.slice(start, i + 1);
    }
  }
  assert.fail(`${name} must be complete`);
}

function diabloFieldBuilder() {
  return Function(`${extractFunction('_rleEncodeGrid')}; return ${extractFunction('_buildDiabloField')}`)();
}

function decodeRle(rle, size) {
  const cells = [];
  for (let i = 0; i < rle.length; i += 2) {
    for (let n = 0; n < rle[i + 1]; n++) cells.push(rle[i]);
  }
  assert.equal(cells.length, size);
  return cells;
}

test('Diablo field is deterministic and uses broad field regions instead of room corridors', () => {
  const build = diabloFieldBuilder();
  const a = build(6, 200, 200);
  const b = build(6, 200, 200);
  assert.deepEqual(a.tileRLE, b.tileRLE);
  assert.deepEqual(a.regions, b.regions);

  assert.deepEqual(a.regions.map(region => region.role), ['start', 'combat', 'travel', 'combat', 'pocket', 'boss']);
  assert.ok(a.regions.filter(region => region.role === 'combat').every(region => region.rx >= 24 && region.ry >= 18));
  assert.equal(a.rooms.filter(room => room.type === 'boss').length, 1);
  assert.equal(a.rooms.find(room => room.type === 'start').cy, 181);

  const floor = decodeRle(a.tileRLE, 200 * 200).filter(Boolean).length;
  assert.ok(floor > 15000, `expected a substantial playable field, got ${floor} tiles`);
  assert.ok(floor < 30000, `outer terrain mass must remain, got ${floor} tiles`);
});

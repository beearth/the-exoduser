import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('double-tap Flash Step shares the five-cell Shift mobility gauge', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /const _HARP_GAUGE_BASE_CELLS=5;/);
  assert.match(game, /const _harpGaugeCells=_isFused\('dimRush'\)\?10:_isFused\('dimThunder'\)\?9:_dimB\?7:_hasChargeSk\?6:_HARP_GAUGE_BASE_CELLS;/);
  assert.match(game, /function _canBladeDash\(\)\{return !!\(P&&P\.skills&&P\.skills\.bladeDash>=1&&_harpGauge>=_HARP_GAUGE_COST\[1\]&&P\.mp>=\(10\+\(\(P\.skills\.bladeDash\|\|1\)-1\)\*5\)\)/);
  assert.match(game, /const _bdGaugeCost=_HARP_GAUGE_COST\[1\];[\s\S]*_harpGauge=Math\.max\(0,_harpGauge-_bdGaugeCost\);/);
  assert.doesNotMatch(game, /addTxt\(P\.x,P\.y-45,'⚡\s*'\+_bdCells/);
  assert.doesNotMatch(game, /P\._bdStk/);
  assert.doesNotMatch(game, /_bdMaxStk/);
});

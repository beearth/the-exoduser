import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('right resource orb renders a yellow Shift chain gauge ring from current chain charge', () => {
  assert.match(gameHtml, /<div id="globeMP" class="globe-container mp-globe">\s*<div class="globe-ring-wrap">\s*<div class="globe-ring-bg"><\/div>\s*<div id="mobilityRing" class="globe-ring"><\/div>\s*<div id="mobilityRingTicks" class="mobility-ring-ticks"><\/div>/);
  assert.match(gameHtml, /\.mp-globe \.globe-ring \{ --ring-col: #ffcc33; \}/);
  assert.match(gameHtml, /\.mobility-ring-ticks\{[\s\S]*repeating-conic-gradient\(from -90deg,[\s\S]*var\(--shift-cell-deg, 54deg\)[\s\S]*pointer-events:none/);
  assert.match(gameHtml, /calc\(var\(--shift-cell-deg, 54deg\) - 3deg\)/);
  assert.match(gameHtml, /mobilityRing:\$\('mobilityRing'\),mobilityRingTicks:\$\('mobilityRingTicks'\)/);
  assert.match(gameHtml, /const mobilityPct = Math\.max\(0, Math\.min\(1, _harpGauge \/ _HARP_GAUGE_MAX\)\) \* 100;[\s\S]*_hset\(E\.mobilityRing,'background',mobilityPct > 0 \? `conic-gradient\(rgba\(255,204,51,\.95\) \$\{mobilityPct\.toFixed\(2\)\}%, transparent 0%\)` : 'none'\)/);
  assert.match(gameHtml, /const _shiftCellDeg=360\*_HARP_GAUGE_COST\[1\]\/_HARP_GAUGE_MAX;[\s\S]*E\.mobilityRingTicks\.style\.setProperty\('--shift-cell-deg',_shiftCellDeg\.toFixed\(3\)\+'deg'\)/);
});

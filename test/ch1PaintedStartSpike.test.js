import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function spikeBlock(source) {
  const match = source.match(/\/\/ CH1 PAINTED START SPIKE BEGIN([\s\S]*?)\/\/ CH1 PAINTED START SPIKE END/);
  assert.ok(match, 'CH1 START baked spike block must exist');
  return match[1];
}

test('CH1 painted spike keeps the loader architecture while registering only the approved 20 SOUTH chunks', () => {
  const block = spikeBlock(gameHtml);
  assert.match(block, /stage:\s*1/);
  assert.match(block, /chunkSize:\s*1024/);
  assert.match(block, /bleed:\s*1/);
  const ids = [...block.matchAll(/'(\d,\d)':\s*'assets\/map\/ch1\/baked_spike\/south_visual_pass\/chunk_\d_\d\.png'/g)]
    .map((match) => match[1]).sort();
  assert.deepEqual(ids, [
    '0,5','0,6','1,5','1,6','2,5','2,6','3,4','3,5','3,6','3,7',
    '4,4','4,5','4,6','4,7','5,5','5,6','6,5','6,6','7,5','7,6',
  ]);
  assert.doesNotMatch(block, /for\s*\([^)]*<\s*64/);
});

test('CH1 painted spike is opt-in and skips unavailable chunks', () => {
  const block = spikeBlock(gameHtml);
  assert.match(block, /ch1BakedSpike/);
  assert.match(block, /status\s*!==\s*'ready'/);
  assert.match(block, /onerror/);
  assert.match(block, /status\s*=\s*'error'/);
});

test('CH1 painted spike warms decoded images through the existing GPU idle path before exposing them', () => {
  const block = spikeBlock(gameHtml);
  assert.match(block, /status\s*=\s*'decoded'/);
  assert.match(block, /_scheduleGpuWarm/);
  assert.match(block, /_warmImageGpu\(entry\.img\);[^\n]*entry\.status='warmed'/,
    'the existing WebGL warm path must promote decoded images to warmed');
  assert.match(block, /entry\.status==='warmed'[^\n]*entry\.status='ready'/,
    'only warmed chunks may become drawable');
});

test('CH1 painted spike camera-culls chunks instead of drawing the whole manifest', () => {
  const block = spikeBlock(gameHtml);
  assert.match(block, /G\.cam\.x/);
  assert.match(block, /G\.cam\.y/);
  assert.match(block, /Math\.floor\([^\n]*\/\s*_CH1_BAKED_SPIKE\.chunkSize\)/);
  assert.match(block, /drawnIds/);
});

test('CH1 painted spike stays between current floor and existing runtime layers', () => {
  const floor = gameHtml.indexOf("X.drawImage(_mapCvs,sx0,sy0,sw,sh,sx0,sy0,sw,sh)");
  const baked = gameHtml.indexOf('_drawCh1BakedSpike(X);');
  const hill = gameHtml.indexOf('_drawCh1Hill(X);');
  const mapObjects = gameHtml.indexOf('// ═══ MAP_OBJS 렌더 ═══');
  assert.ok(floor >= 0 && baked > floor, 'baked spike must render after the current floor');
  assert.ok(hill > baked, 'existing CH1 hill/runtime floor object must remain above baked spike');
  assert.ok(mapObjects > hill, 'existing MAP_OBJS must remain above baked spike');
});

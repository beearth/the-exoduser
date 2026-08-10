import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('debug mode attaches one browser long-task observer without affecting ordinary frames', () => {
  assert.match(gameHtml, /let _debugLongTaskObserver=null;/);
  assert.match(gameHtml, /function _installDebugLongTaskObserver\(\)\{/);
  assert.match(gameHtml, /if\(!_DEBUG_PERF\|\|_debugLongTaskObserver\|\|typeof PerformanceObserver==='undefined'\)return;/);
  assert.match(gameHtml, /console\.warn\('\[LONG TASK\] '\+_debugLongTask\.duration\.toFixed\(1\)\+'ms'\);/);
  assert.match(gameHtml, /_debugLongTaskObserver\.observe\(\{type:'longtask',buffered:true\}\);/);
  assert.match(gameHtml, /if\(_DEBUG_PERF\)_installDebugLongTaskObserver\(\);/);
});

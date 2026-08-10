import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('late special texture warmup uses browser idle time after gameplay starts', () => {
  assert.match(gameHtml, /function _scheduleGpuWarm\(work\)\{/);
  assert.match(gameHtml, /if\(typeof requestIdleCallback==='function'&&typeof G!=='undefined'&&G\.on\)\{requestIdleCallback\(work,\{timeout:120\}\)\}else setTimeout\(work,0\);/);
  assert.match(gameHtml, /function _queueShieldAuraGpuWarmup\(\)\{[\s\S]*?_scheduleGpuWarm\(\(\)=>\{_saWarmQueued=false;_warmShieldAuraGpu\(\)\}\);/);
  assert.match(gameHtml, /function _queueBonfireBarrierGpuWarmup\(\)\{[\s\S]*?_scheduleGpuWarm\(\(\)=>\{_bonfireBarrierWarmQueued=false;_warmBonfireBarrierGpu\(\)\}\);/);
});

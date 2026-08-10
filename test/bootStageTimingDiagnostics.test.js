import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('cold-start loading stages emit timing only while debug profiling is enabled', () => {
  assert.match(gameHtml, /var _DEBUG_PERF=new URLSearchParams\(location\.search\)\.get\('perf'\)==='1';/);
  assert.match(gameHtml, /let _bootPerfStart=0,_bootPerfLast=0,_bootPerfMarks=null;/);
  assert.match(gameHtml, /function _bootPerfMark\(pct,msg\)\{/);
  assert.match(gameHtml, /if\(!_DEBUG_PERF\|\|!_bootPerfMarks\)return;/);
  assert.match(gameHtml, /_bootPerfMark\(pct,msg\);/);
  assert.match(gameHtml, /console\.log\('\[BOOT PERF\] total='\+_bootPerfTotal\.toFixed\(1\)\+'ms \| '\+_bootPerfStages\);/);
});

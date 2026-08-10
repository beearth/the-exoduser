import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('debug mode reports throttled raw frame gaps before physics clamps them', () => {
  assert.match(gameHtml, /let _lastLoopTs=0,_debugHitchLogAt=0;/);
  assert.match(gameHtml, /const _rawFrameTime=timestamp-_prevTs;_prevTs=timestamp;/);
  assert.match(gameHtml, /if\(_DEBUG_PERF&&_rawFrameTime>34&&timestamp-_debugHitchLogAt>500\)\{/);
  assert.match(gameHtml, /console\.warn\('\[FRAME HITCH\] gap='\+_rawFrameTime\.toFixed\(1\)\+'ms U='\+_prof\.u\.toFixed\(1\)\+' D='\+_prof\.d\.toFixed\(1\)\+' chunkQ='\+_streamBuildQCount\+' warmQ='\+Math\.max\(0,_wqLen-_wqIdx\)\);/);
  assert.match(gameHtml, /let frameTime=_rawFrameTime;/);
});

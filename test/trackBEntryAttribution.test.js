import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const source=fs.readFileSync('game.html','utf8');

test('dcprof tracks all requested renderer entries with numeric per-frame counters',()=>{
  assert.match(source,/_entry:\{raf:0,main:0,draw:0,map:0,world:0,entity:0,post:0\}/);
  assert.match(source,/_entrySummary:function\(\)/);
  assert.match(source,/if\(_DCP\.on\)_DCP\._entry\.raf\+\+/);
  assert.match(source,/_lastLoopTs=timestamp;if\(_DCP\.on\)_DCP\._entry\.main\+\+/);
  assert.match(source,/if\(_DCP\.on\)\{_DCP\.drawInvokes\+\+;_DCP\._entry\.draw\+\+;_DCP\._entry\.map\+\+;/);
  assert.match(source,/_DCP\._entry\.world\+\+/);
  assert.match(source,/_DCP\._entry\.entity\+\+/);
  assert.match(source,/_DCP\._entry\.post\+\+/);
});

test('dcprof reports an exact numeric source-sum invariant and unknown count',()=>{
  assert.match(source,/_sourceSum:function\(\)\{let n=0;for\(let i=0;i<this\.srcDc\.length;i\+\+\)n\+=this\.srcDc\[i\];return n\}/);
  assert.match(source,/sourceSum='\+this\._sourceSum\(\)\+'\/total='\+this\.dc\+' unknown='\+this\.srcDc\[_DCP_SRC\.UNKNOWN\]/);
  assert.doesNotMatch(source,/new Error\('dcprof'\)/);
});

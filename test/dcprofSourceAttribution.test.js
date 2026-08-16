import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('dcprof attributes each GL invocation to a numeric renderer source without stacks', () => {
  assert.match(gameHtml, /const _DCP_SRC=Object\.freeze\(\{[\s\S]*MAP_CACHE:[0-9]+,[\s\S]*TILE_FALLBACK:[0-9]+,[\s\S]*WORLD_OBJECT:[0-9]+,[\s\S]*PLAYER:[0-9]+,[\s\S]*ENEMY:[0-9]+,[\s\S]*PROJECTILE:[0-9]+,[\s\S]*PARTICLE_VFX:[0-9]+,[\s\S]*DROP_ITEM:[0-9]+,[\s\S]*UI_HUD:[0-9]+,[\s\S]*POST_DEBUG:[0-9]+,[\s\S]*UNKNOWN:[0-9]+/);
  assert.match(gameHtml, /_setSource:function\(id\)\{if\(this\.on\)this\.src=id\}/);
  assert.match(gameHtml, /_onFlush:function\(qc,drew\)\{[\s\S]*this\.srcDc\[this\.src\]\+\+/);
  assert.match(gameHtml, /_onInst:function\(cnt\)\{[\s\S]*this\.srcDc\[this\.src\]\+\+/);
  assert.doesNotMatch(gameHtml, /new Error\('dcprof'\)/);
});

test('dcprof reports texture calls, actual changes, unique identities, and source counts on runaway', () => {
  assert.match(gameHtml, /_onSetTex:function\(t,changed\)\{[\s\S]*this\.texCalls\+\+[\s\S]*if\(changed\)this\.setTex\+\+[\s\S]*this\.uniqueTex\+\+/);
  assert.match(gameHtml, /sources='\+this\._srcSummary\(\)/);
  assert.match(gameHtml, /texCalls='\+this\.texCalls\+' setTex='/);
  assert.match(gameHtml, /cacheReady=/);
  assert.match(gameHtml, /enemies=/);
  assert.match(gameHtml, /projectiles=/);
  assert.match(gameHtml, /particles=/);
});

test('dcprof keeps instrumentation and fault injection debug-gated', () => {
  assert.match(gameHtml, /const _DCP_FAULT_CACHE_DELAY=.*dcprofCacheDelay/);
  assert.match(gameHtml, /if\(_DCP\.on&&_DCP_FAULT_CACHE_DELAY>0/);
  assert.match(gameHtml, /_DCP\._setSource\(_DCP_SRC\.MAP_CACHE\)/);
  assert.match(gameHtml, /_DCP\._setSource\(_DCP_SRC\.ENEMY\)/);
  assert.match(gameHtml, /_DCP\._setSource\(_DCP_SRC\.PROJECTILE\)/);
  assert.match(gameHtml, /_DCP\._setSource\(_DCP_SRC\.PARTICLE_VFX\)/);
});

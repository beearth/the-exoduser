import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('streaming maps use a queued chunk build path', () => {
  assert.match(
    gameHtml,
    /const _STREAM_BUILD_QMAX=\d+;[\s\S]*function _queueStreamChunkBuild\(cx,cy\)\{[\s\S]*function _tickStreamChunkBuild\(budgetMs,maxBuilds\)\{/,
  );
});

test('draw path queues missing chunks instead of building them inline', () => {
  assert.match(
    gameHtml,
    /if\(_streamMap\)\{[\s\S]*_queueVisibleStreamChunks\(_stx0,_sty0,_stx1,_sty1,_camCx,_camCy\);/,
  );
  assert.doesNotMatch(
    gameHtml,
    /if\(_streamMap\)\{[\s\S]*if\(!_streamChunks\[_sk\]\)\{[\s\S]*_buildStreamChunk\(_scx,_scy\)/,
  );
});

test('buildMapCache resets the stream build queue when streaming starts', () => {
  assert.match(
    gameHtml,
    /_streamBuildQHead=0;_streamBuildQTail=0;_streamBuildQCount=0;[\s\S]*if\(_shouldStreamMapCache\(G\.mw,G\.mh,_texLimit\)\)\{/,
  );
});

test('stream viewport cache is invalidated by viewport origin changes, not only camera tile delta', () => {
  assert.match(
    gameHtml,
    /let _streamVpWorldX=1e9,_streamVpWorldY=1e9,_streamVpW=0,_streamVpH=0;/,
  );
  assert.match(
    gameHtml,
    /if\(_streamVpDirty\|\|_streamVpWorldX!==_drawX\|\|_streamVpWorldY!==_drawY\|\|_streamVpW!==~~_vpW\|\|_streamVpH!==~~_vpH\)\{/,
  );
  assert.doesNotMatch(
    gameHtml,
    /if\(_streamVpDirty\|\|Math\.abs\(_curTx-_streamLastCamTx\)>2\|\|Math\.abs\(_curTy-_streamLastCamTy\)>2\)\{/,
  );
});

test('only 1000x1000 class maps force stream loading; 300x300 maps stay on the legacy cache path', () => {
  assert.match(
    gameHtml,
    /return \(mw\*mh\)>=1000\*1000;/,
  );
  assert.doesNotMatch(
    gameHtml,
    /return _pw>texLimit\|\|_ph>texLimit\|\|\(mw\*mh\)>=1000\*1000;/,
  );
});

test('buildMapCache no longer short-circuits into the incomplete distributed BMC path', () => {
  assert.doesNotMatch(
    gameHtml,
    /\[BMC\] distributed build start/,
  );
});

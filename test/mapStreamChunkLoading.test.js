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

test('boot flow defines a deferred boot map build queue instead of blocking in initStage', () => {
  assert.match(
    gameHtml,
    /let _bootMapBuildDefer=0,_bootMapBuildQueued=0,_bootMapBuildPromise=null,_bootMapBuildResolve=null;/,
  );
  assert.match(
    gameHtml,
    /function _queueBootMapBuild\(\)\{[\s\S]*const _raf=\(typeof requestAnimationFrame==='function'\)\?requestAnimationFrame:\(fn=>setTimeout\(fn,16\)\);[\s\S]*_raf\(\(\)=>\{[\s\S]*_raf\(\(\)=>\{[\s\S]*buildMapCache\(\)[\s\S]*\}\);[\s\S]*\}\);[\s\S]*\}/,
  );
  assert.match(
    gameHtml,
    /if\(_bootMapBuildDefer\)\{_queueBootMapBuild\(\)\}else\{buildMapCache\(\);\} \/\/ 타일맵 렌더 \+ 카메라 주변 청크/,
  );
});

test('startup paths defer map cache build until after the loading UI can paint', () => {
  assert.match(
    gameHtml,
    /_bootMapBuildDefer=1;\s*initStage\(G\.stage\);\s*_bootMapBuildDefer=0;/,
  );
  assert.match(
    gameHtml,
    /if\(_bootMapBuildPromise\)\{\s*setBootLoading\(97,'[^']+'\);\s*await _bootMapBuildPromise;\s*\}/,
  );
});

test('draw path queues missing chunks instead of building them inline', () => {
  const drawStart = gameHtml.indexOf('function draw(){');
  const drawEnd = gameHtml.indexOf('function drawP(){', drawStart);
  const drawSource = gameHtml.slice(drawStart, drawEnd);
  assert.ok(drawStart >= 0 && drawEnd > drawStart, 'draw function should exist');
  assert.match(
    drawSource,
    /_queueVisibleStreamChunks\(_stx0,_sty0,_stx1,_sty1,_camCx,_camCy\);/,
  );
  assert.doesNotMatch(
    drawSource,
    /if\(!_streamChunks\[_sk\]\)\{[\s\S]*_buildStreamChunk\(_scx,_scy\)/,
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
    /const _vpMoved=Math\.abs\(_streamVpWorldX-_drawX\)>T\*3\|\|Math\.abs\(_streamVpWorldY-_drawY\)>T\*3;/,
  );
  assert.match(
    gameHtml,
    /if\(_streamVpDirty\|\|_vpMoved\|\|!_streamVpCvs\|\|_useGPU\)\{/,
  );
  assert.doesNotMatch(
    gameHtml,
    /if\(_streamVpDirty\|\|Math\.abs\(_curTx-_streamLastCamTx\)>2\|\|Math\.abs\(_curTy-_streamLastCamTy\)>2\)\{/,
  );
});

test('stream loading also protects texture limits and the 64M-pixel cache ceiling', () => {
  assert.match(
    gameHtml,
    /if\(\(mw\*mh\)>=1000\*1000\) return true;[\s\S]*if\(mw\*T>texLimit \|\| mh\*T>texLimit\) return true;[\s\S]*if\(\(mw\*T\)\*\(mh\*T\) > 64000000\) return true;[\s\S]*return false;/,
  );
});

test('buildMapCache no longer short-circuits into the incomplete distributed BMC path', () => {
  assert.doesNotMatch(
    gameHtml,
    /\[BMC\] distributed build start/,
  );
});

test('buildMapCache does not reference initMapObjects-only decor locals', () => {
  assert.doesNotMatch(
    gameHtml,
    /function buildMapCache\(\)\{[\s\S]*const _collisionDeco=_chDeco\.filter\(d=>\{/,
  );
  assert.doesNotMatch(
    gameHtml,
    /function buildMapCache\(\)\{[\s\S]*const _collFloors=_dcFloors\.length>0\?_dcFloors\.slice\(\):\[\];/,
  );
});

test('stage 3 zone0 portal is lifted 50 tiles higher from the top combat room', () => {
  assert.match(
    gameHtml,
    /const _portalY=Math\.max\(6,_topRoom\.cy-\(_topRoom\.ry\|\|8\)-56\);/,
  );
});

test('map cache refreshes from late-loading assets are debounced through a single queued refresh path', () => {
  assert.match(
    gameHtml,
    /let _mapCacheRefreshQueued=0,_mapCacheRefreshToken=0;[\s\S]*function _queueMapCacheRefresh\(\)\{[\s\S]*setTimeout\(\(\)=>\{[\s\S]*buildMapCache\(\);[\s\S]*\},0\);[\s\S]*\}/,
  );
  assert.match(
    gameHtml,
    /_im\.onload=function\(\)\{_bossGateImgs\[_bgi\]=_removeWhiteBg\(_im\);if\(G\.map&&G\.bossGate&&G\.bossGate\.length&&SI_TO_HELL\[G\.stage\]===_bgi&&!G\._bossArena\)_queueMapCacheRefresh\(\)\}/,
  );
  assert.match(
    gameHtml,
    /img\.onload=\(\)=>\{console\.log\('\[GT\] '\+id\+' loaded'\);if\(G&&G\.map\)_queueMapCacheRefresh\(\)\}/,
  );
});

test('boot flow no longer does a duplicate full map rebuild immediately after waiting for map object sprites', () => {
  assert.doesNotMatch(
    gameHtml,
    /await _waitObjSprites\(8000\);\s*buildMapCache\(\);/,
  );
  const start = gameHtml.indexOf('await _waitObjSprites(8000);');
  const end = gameHtml.indexOf('BGM.play(BGM.stageKey(G.stage));', start);
  const bootSource = gameHtml.slice(start, end);
  assert.ok(start >= 0 && end > start, 'boot map asset wait should precede BGM start');
  assert.match(bootSource, /if\(_bootMapBuildPromise\)\{[\s\S]*await _bootMapBuildPromise;/);
  assert.doesNotMatch(bootSource, /\bbuildMapCache\(\);/);
});

test('boot flow no longer force-completes background init or full stream chunk prebuild during loading', () => {
  assert.doesNotMatch(
    gameHtml,
    /while\(!_bgInitDone\)\{_tickBgInit\(9999\)\}/,
  );
  assert.doesNotMatch(
    gameHtml,
    /\[MAP STREAM\] full pre-built/,
  );
  assert.match(
    gameHtml,
    /setBootLoading\(88,'맵 환경 준비 중\.\.\.'\);\s*_tickBgInit\(4\);/,
  );
  assert.match(
    gameHtml,
    /if\(_streamMap&&_streamBuildQCount>0\)\{\s*setBootLoading\(92,'주변 청크 준비 중\.\.\.'\);\s*_tickStreamChunkBuild\(6,4\);/,
  );
});

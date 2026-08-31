import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('WebGL _getTex reuses non-map GPU textures when size matches (ATMOS idle hitch)', () => {
  assert.match(gameHtml, /else if\(e&&e\.tex&&\(e\.w==null\|\|\(e\.w===sw&&e\.h===sh\)\)\)\{e\.v=src\._glVer\|\|0;e\.w=sw;e\.h=sh;return e\.tex\}/);
  assert.match(gameHtml, /_texCache\.set\(src,\{tex:t,v:src\._glVer\|\|0,w:sw,h:sh\}\);return t\}/);
});

test('WebGL map textures still go through Track D deferred-delete on version mismatch', () => {
  assert.match(gameHtml, /if\(e&&e\.tex&&src\._mapTex\)\{_texGCQueue\.push\(e\.tex\);e=null\}/);
});

test('ATMOS _atmCut only bumps _glVer when camera\/player\/alpha actually change', () => {
  assert.match(gameHtml, /var _acx=G\.cam\.x\|0,_acy=G\.cam\.y\|0,_apx=P\.x\|0,_apy=P\.y\|0/);
  assert.match(gameHtml, /if\(_atmCut\._cx!==_acx\|\|_atmCut\._cy!==_acy\|\|_atmCut\._px!==_apx\|\|_atmCut\._py!==_apy/);
  assert.match(gameHtml, /내용이 바뀐 프레임만 GPU 텍스처 재업로드/);
  assert.doesNotMatch(gameHtml, /GL 텍스처 고정 방지 \(매 프레임 갱신\)/);
});

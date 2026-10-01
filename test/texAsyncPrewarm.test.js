// [PM-001] 텍스처 비동기 프리워밍 계약 (QA·성능팀, 2026-10-01)
// 실제 GPU 동작·픽셀 동일성·전후 프레임 수치는 tools/qa_frame_probe.mjs 실측으로 검증한다.
// 이 테스트는 소스 계약(무손실 폴백·예산·컨텍스트 수명·학습 목록 동작)이 지워지지 않게 지킨다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFn(name) {
  const start = gameHtml.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' 정의 없음');
  let depth = 0, i = gameHtml.indexOf('{', start);
  for (; i < gameHtml.length; i++) { const ch = gameHtml[i]; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) break; } }
  return gameHtml.slice(start, i + 1);
}

test('디코드는 Blob 소스 createImageBitmap(premultiplyAlpha none)로 메인 스레드 밖에서 수행', () => {
  const pump = extractFn('_texPrePump');
  assert.match(pump, /fetch\(abs\)\.then\(r=>\{if\(!r\.ok\)throw 0;return r\.blob\(\)\}\)\.then\(b=>createImageBitmap\(b,\{premultiplyAlpha:'none'\}\)\)/);
  assert.match(pump, /_texPreBusy<_TEXHOT_INFLIGHT&&_texPreWait\.length&&_texPreQ\.length\+_texPreBusy<_TEXHOT_QMAX/);
});

test('프레임말 1장 업로드, 동기 경로가 먼저 올린 URL은 비트맵만 폐기, 비트맵은 항상 close', () => {
  const drain = extractFn('_texPreDrain');
  assert.match(drain, /const j=_texPreQ\.shift\(\)/);
  assert.match(drain, /!_texBySrc\.has\(j\.src\)\)_texAdoptBitmap\(j\.src,j\.bmp\)/);
  assert.match(drain, /finally\{_texPreClose\(j\)\}/);
  assert.match(extractFn('_texPreClose'), /bmp\.close\(\)/);
  assert.match(gameHtml, /_perfFrameTick\(\);\n  _texPreDrain\(\);/);
});

test('_getTex: LINEAR Image 경로에서만 URL 텍스처 채택, 크기 일치 필수, 기존 동기 업로드 폴백 유지', () => {
  assert.match(gameHtml, /if\(!e&&!_nearestHint&&_texBySrc\.size&&src instanceof HTMLImageElement\)\{const _pu=src\.src,_ps=_pu\.length<600\?_texBySrc\.get\(_pu\):null;/);
  assert.match(gameHtml, /if\(_ps&&_ps\.w===sw&&_ps\.h===sh\)\{_texCache\.set\(src,\{tex:_ps\.tex,v:src\._glVer\|\|0,w:sw,h:sh\}\);_texHotNote\(_pu,sw,sh\);return _ps\.tex\}/);
  // 동기 업로드 원문(무손실 폴백)이 그대로 남아 있어야 한다
  assert.match(gameHtml, /try\{GL\.texImage2D\(GL\.TEXTURE_2D,0,GL\.RGBA,GL\.RGBA,GL\.UNSIGNED_BYTE,src\)\}/);
});

test('프리워밍 업로드 텍스처는 Image 경로와 같은 LINEAR/CLAMP 파라미터', () => {
  const i = gameHtml.indexOf('_texAdoptBitmap=function(abs,bmp){');
  assert.ok(i >= 0);
  const body = gameHtml.slice(i, gameHtml.indexOf('};', i));
  assert.match(body, /TEXTURE_MIN_FILTER,GL\.LINEAR/);
  assert.match(body, /TEXTURE_MAG_FILTER,GL\.LINEAR/);
  assert.match(body, /TEXTURE_WRAP_S,GL\.CLAMP_TO_EDGE/);
  assert.match(body, /GL\.bindTexture\(GL\.TEXTURE_2D,_curTex\)/);
});

test('컨텍스트 수명: 초기화 때 URL 맵·프리워밍 상태 리셋, 손실 때 무효화', () => {
  assert.match(gameHtml, /_texBySrc=new Map\(\);_texPreSeen\.clear\(\);_texPrePx=0;_texHotScanned=false;/);
  assert.match(gameHtml, /_texBySrc=null;_texAdoptBitmap=null;/);
});

test('예산·목록 상수와 맵 에셋 학습 제외', () => {
  assert.match(gameHtml, /const _TEXHOT_KEY='hell_texhot_v1';/);
  assert.match(gameHtml, /const _TEXHOT_MAX=96;/);
  assert.match(gameHtml, /const _TEXHOT_MIN_PX=250000;/);
  assert.match(gameHtml, /const _TEXHOT_BUDGET_PX=64e6;/);
  const note = extractFn('_texHotNote');
  assert.match(note, /abs\.indexOf\('\/assets\/map\/'\)>=0\)return/);
  const pre = extractFn('_texPrewarmSrc');
  assert.match(pre, /_texPrePx\+px>_TEXHOT_BUDGET_PX\)return/);
});

test('학습 목록: 최근 사용순 정렬·상한·손상 값 무시 (실제 함수 실행)', () => {
  const store = new Map();
  const sandbox = {
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) },
    location: { origin: 'http://localhost:3333' },
  };
  const src = [
    "const _TEXHOT_KEY='hell_texhot_v1';const _TEXHOT_MAX=96;const _TEXHOT_MIN_PX=250000;",
    'let _texHot=null,_texHotDirty=false;',
    extractFn('_texHotLoad'), extractFn('_texHotNote'), extractFn('_texHotSave'),
    'return {_texHotLoad,_texHotNote,_texHotSave,reset(){_texHot=null;_texHotDirty=false}};',
  ].join('\n');
  const api = new Function('localStorage', 'location', src)(sandbox.localStorage, sandbox.location);
  // 손상된 저장값은 빈 목록으로
  store.set('hell_texhot_v1', '{broken');
  assert.equal(api._texHotLoad().size, 0);
  api.reset(); store.clear();
  api._texHotNote('http://localhost:3333/assets/vfx/vfx_ice_orb.png', 2304, 2304);
  api._texHotNote('http://localhost:3333/assets/vfx/small.png', 64, 64);                     // 작은 이미지 제외
  api._texHotNote('http://localhost:3333/assets/map/ch1/production_finish/chunk_1_1.png', 1026, 1026); // 맵 제외
  api._texHotNote('data:image/png;base64,AAAA', 2000, 2000);                                  // data URL 제외
  api._texHotSave();
  const saved = JSON.parse(store.get('hell_texhot_v1'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0][0], '/assets/vfx/vfx_ice_orb.png');
  assert.equal(saved[0][1], 2304 * 2304);
  // 상한 96
  for (let i = 0; i < 130; i++) api._texHotNote('http://localhost:3333/img/x' + i + '.png', 1000, 1000);
  api._texHotSave();
  assert.equal(JSON.parse(store.get('hell_texhot_v1')).length, 96);
});

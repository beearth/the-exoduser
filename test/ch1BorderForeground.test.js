// [DEPTH-SLICE2] CH1-1 경계 전경 오버행 (MAP-003+MAP-004) — placements.json 일치·좌표 변환·게이트·OFF 보존 계약
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadImage } from 'canvas';

const moduleSrc = readFileSync(new URL('../ch1-border-foreground.js', import.meta.url), 'utf8');
const gameSrc = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const easySrc = readFileSync(new URL('../game-easy-test.html', import.meta.url), 'utf8');
const buildSrc = readFileSync(new URL('../build-nwjs.mjs', import.meta.url), 'utf8');
const placements = JSON.parse(readFileSync(new URL('../assets/map/ch1/production_finish/outer90_sources/placements.json', import.meta.url), 'utf8'));

// 모듈 로드 (init은 DOM 무접근 — 텍스처는 lazy)
(0, eval)(moduleSrc);
const BFG = globalThis.Ch1BorderForeground;

test('borderFg: 모듈이 로드되고 기본 ON 상수·플래그 스위치가 존재한다', () => {
  assert.ok(BFG, 'Ch1BorderForeground 정의');
  assert.match(moduleSrc, /const DEFAULT_ON=true;/, '기본 ON (2026-10-01 팀장 판정 PASS, 끄기 ?borderFg=0)');
  assert.match(moduleSrc, /\[?\?&\]?borderFg=0/, '2차만 끄기 ?borderFg=0');
  assert.match(moduleSrc, /\[?\?&\]?borderFg=1/, '시험용 ?borderFg=1');
  assert.match(moduleSrc, /_dsEnabled/, '?depthSlice=0 이면 1·2차 모두 꺼짐 (1차 게이트 연동)');
  // RETOUCH v2 값 계약
  assert.match(moduleSrc, /const BAND=170;/, '띠 깊이 170px (팀장 지시 140~200 내 확정)');
  assert.match(moduleSrc, /const FADE_MIN=\.5,/, '가림 시 띠 알파 .5 (1차 .62 불변)');
  assert.match(moduleSrc, /const GHOST_A=\.75;/, '2차 고스트 .75 (1차 .55 불변)');
  assert.match(moduleSrc, /_dsDrawPlayerGhost\(GHOST_A\)/, '고스트 호출에 2차 알파 전달');
});

test('borderFg: 경계 polygon 53점이 layout.js boundary와 동일하다', () => {
  const layoutSrc = readFileSync(new URL('../assets/map/ch1/production_finish/layout.js', import.meta.url), 'utf8');
  const m = layoutSrc.match(/const boundary=\[([\s\S]*?)\];/);
  assert.ok(m, 'layout.js boundary');
  const pts = JSON.parse('[' + m[1].replace(/,\s*$/, '') + ']');
  assert.equal(pts.length, 53);
  assert.deepEqual(BFG._boundary, pts, '내장 polygon == layout.js');
});

test('borderFg: 띠 마스크 수식 — polygon 밖=1, 경계에서 안쪽 170px까지 smoothstep 감쇠', () => {
  // 맵 중앙(전투 바닥 한복판) = 0
  assert.equal(BFG._pip(4000, 4000), true, '중앙은 polygon 안');
  assert.equal(BFG._bandAlpha(4000, 4000), 0, '깊숙한 안쪽은 알파 0');
  // polygon 밖(숲 깊은 곳) = 1
  assert.equal(BFG._pip(400, 400), false, 'NW 숲은 polygon 밖');
  assert.equal(BFG._bandAlpha(400, 400), 1, '밖은 알파 1');
  // 북문 통로 서쪽 세그먼트 x=88타일(3520px), y=600 지점(다른 세그먼트와 충분히 떨어짐)
  const q = { x: 3520 + 85, y: 600 };
  assert.equal(BFG._pip(q.x, q.y), true);
  assert.ok(Math.abs(BFG._distB(q.x, q.y) - 85) < 1e-6, '경계 거리 85px');
  assert.ok(Math.abs(BFG._bandAlpha(q.x, q.y) - .5) < 1e-6, '85px 지점 알파 .5 (smoothstep)');
  assert.equal(BFG._bandAlpha(3520 + 171, 600), 0, '170px 안쪽에서 0');
});

test('borderFg: 내장 표가 placements.json과 일치한다 (index·좌표·variant·scale/width·flip)', () => {
  assert.equal(placements.version, '20260930-rotforest-96', 'placements 버전');
  for (const [idx, tx, ty, variant, scale] of BFG._trees) {
    assert.deepEqual(placements.placements[idx], [tx, ty, variant, scale], `T${idx}`);
  }
  for (const [idx, tx, ty, variant, width, flip] of BFG._masses) {
    const j = placements.massPlacements[idx];
    assert.deepEqual([j[0], j[1], j[2], j[3], j[4]], [tx, ty, variant, width, !!flip], `M${idx}`);
  }
});

test('borderFg: 분류 = §8.4 기반 + 착수 확인 수정(인너 나무 제외)', () => {
  const fgTrees = BFG._trees.filter(t => t[5] === 'fg').map(t => t[0]).sort((a, b) => a - b);
  assert.deepEqual(fgTrees, [3, 4, 5, 13, 16, 18, 19, 20, 24], '전경 나무 9');
  assert.equal(BFG._trees.length, 9, '분할 나무 0 — T1 T10 T31~T35는 베이크 완전 소거+무충돌로 이번 패스 제외');
  const modes = Object.fromEntries(BFG._masses.map(m => ['M' + m[0], m[6]]));
  assert.deepEqual(modes, { M1: 'split', M2: 'split', M3: 'split', M5: 'fg' }, '군락 분류');
});

test('borderFg: 좌표 변환 — 굽기 계약(410×scale·74% / width·72%·flip, bake→월드 ×1000/1024)', () => {
  const B2W = 1000 / 1024;
  for (const it of BFG._layout()) {
    const src = it.kind === 'tree'
      ? BFG._trees.find(t => 'T' + t[0] === it.id)
      : BFG._masses.find(m => 'M' + m[0] === it.id);
    const [, tx, ty] = src;
    assert.equal(it.anchorY, ty * 40, `${it.id}: 밑동 월드 y = ty×40`);
    assert.ok(Math.abs(it.x + it.w / 2 - tx * 40) <= B2W, `${it.id}: 가로 중앙 정렬 (±1 bake px)`);
    if (it.kind === 'tree') {
      const scale = src[4];
      assert.equal(it.w, Math.round(410 * scale) * B2W, `${it.id}: 한 변 410×scale bake px`);
      assert.ok(Math.abs((it.anchorY - it.y) / it.h - .74) < .002, `${it.id}: 세로 기준점 74%`);
      assert.ok(Math.abs(it.canopyB - (it.y + it.h * .60)) < .01, `${it.id}: 수관 가림 하한 = 60% (밑동·뿌리 제외)`);
    } else {
      const width = src[4];
      assert.equal(it.w, width * B2W, `${it.id}: 폭 = width bake px`);
      assert.equal(it.h, Math.round(width * 1152 / 2048) * B2W, `${it.id}: 높이 = 원본 비율`);
      assert.ok(Math.abs((it.anchorY - it.y) / it.h - .72) < .002, `${it.id}: 세로 기준점 72%`);
      assert.ok(Math.abs(it.canopyB - (it.y + it.h * .58)) < .01, `${it.id}: 수관 가림 하한 = 58%`);
    }
  }
});

test('borderFg: 게이트 — stage0 아님/보스아레나/_borderFg=false면 그리지 않는다 (OFF 경로 보존)', () => {
  assert.equal(BFG._enabled(null), false);
  assert.equal(BFG._enabled({ stage: 1, _borderFg: true }), false, '타 스테이지');
  assert.equal(BFG._enabled({ stage: 0, _bossArena: true, _borderFg: true }), false, '보스아레나');
  assert.equal(BFG._enabled({ stage: 0, _borderFg: false }), false, '런타임 OFF');
  assert.equal(BFG.drawBack(null, { stage: 0, _borderFg: false }, 0, 1600, 900), 0, 'OFF면 draw 0');
  assert.equal(BFG.drawFront(null, { stage: 0, _borderFg: false }, 0, 1600, 900), 0, 'OFF면 draw 0');
});

test('borderFg: 가림 판정 — 수관 영역만, 밑동·뿌리 아래는 제외', () => {
  const it = BFG._layout().find(i => i.id === 'T18'); // (79,192) s1.3
  const cx = it.x + it.w / 2;
  assert.equal(BFG._overlapsCanopy(it, { x: cx, y: it.y + it.h * .3 }), true, '수관 안 → 가림');
  assert.equal(BFG._overlapsCanopy(it, { x: cx, y: it.canopyB + 130 }), false, '밑동·뿌리 높이 → 가림 없음');
  assert.equal(BFG._overlapsCanopy(it, { x: it.x - 200, y: it.y + it.h * .3 }), false, '수평 밖');
});

test('borderFg: 적이 띠(수관) 아래에 있으면 해당 항목 알파 .5 규칙 (전역 ens 스텁)', () => {
  const it = BFG._layout().find(i => i.id === 'T18');
  const cx = it.x + it.w / 2;
  globalThis.ens = [{ alive: true, x: cx, y: it.y + it.h * .3, r: 14 }];
  assert.equal(BFG._enemyUnderCanopy(it), true, '수관 안 적 → 참');
  globalThis.ens = [{ alive: true, x: it.x - 500, y: it.y, r: 14 }, null, { alive: false, x: cx, y: it.y + it.h * .3, r: 14 }];
  assert.equal(BFG._enemyUnderCanopy(it), false, '밖/사망 적 → 거짓');
  delete globalThis.ens;
});

test('borderFg: 배선 — game.html 태그+호출 2줄 / easy-test 호출 2줄만 / build-nwjs 복사 1줄 / 고스트 프레임 1회 가드', () => {
  assert.match(gameSrc, /<script src="ch1-border-foreground\.js\?v=[^"]+"><\/script>/, 'game.html 스크립트 태그');
  for (const s of [gameSrc, easySrc]) {
    assert.match(s, /Ch1BorderForeground\)Ch1BorderForeground\.drawBack\(X,G,_now,VW,VH\)/, '백 패스 호출');
    assert.match(s, /_dsDrawFrontPass\(\);[^\n]*\n\s*if\(globalThis\.Ch1BorderForeground\)Ch1BorderForeground\.drawFront\(X,G,_now,VW,VH\)/, '프런트 패스 호출 위치(1차 직후)');
    assert.match(s, /if\(_dsPSnap\.gN===_now\)return;_dsPSnap\.gN=_now;/, '고스트 프레임당 1회 가드');
    assert.match(s, /function _dsDrawPlayerGhost\(_ga\)/, '고스트 알파 파라미터(2차 .75 / 1차 기본 .55)');
    assert.match(s, /X\.globalAlpha=_ga\|\|_DS_GHOST_A;/, '기본값 폴백');
  }
  assert.doesNotMatch(easySrc, /<script src="ch1-border-foreground/, 'easy-test는 호출 줄만 (다른 CH1 런타임과 동일)');
  assert.match(buildSrc, /'ch1-border-foreground\.js',/, 'NW.js 패키징 복사 목록');
});

test('borderFg: 소스 에셋 — 군락 2048×1152, 나무 1024² 이상 (텍스처 예산 근거)', async () => {
  for (const v of [1, 2]) {
    const img = await loadImage(fileURLToPath(new URL(`../assets/map/ch1/production_finish/outer90_sources/rotforest_mass_0${v}.png`, import.meta.url)));
    assert.equal(img.width, 2048, `mass_0${v} 폭`);
    assert.equal(img.height, 1152, `mass_0${v} 높이`);
  }
  for (const v of [1, 2, 3, 4]) {
    const img = await loadImage(fileURLToPath(new URL(`../assets/map/ch1/collision/rotforest_tree_0${v}.png`, import.meta.url)));
    assert.ok(img.width >= 1024 && img.height >= 1024, `tree_0${v}`);
  }
});

// [DEPTH-SLICE] 2.5D 깊이 슬라이스 1차 (CH1-1) — 밑동 피벗 / 프런트·백 분할 / 가림 페이드 / 고스트 / 플래그 OFF 불변 계약
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const files = ['game.html', 'game-easy-test.html'];
const sources = Object.fromEntries(files.map(f => [f, readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')]));

function extractFn(src, name) {
  const m = src.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n\\}|function ${name}\\([^)]*\\)\\{[^\\n]*\\}`));
  assert.ok(m, `${name} defined`);
  return m[0];
}

function buildApi(src) {
  const code = [
    extractFn(src, '_dsFootY'),
    extractFn(src, '_dsRingInside'),
    extractFn(src, '_dsIsFrontObj'),
    extractFn(src, '_dsOverlapsPlayer'),
    extractFn(src, '_dsCmpFootY'),
    'return {_dsFootY,_dsRingInside,_dsIsFrontObj,_dsOverlapsPlayer,_dsCmpFootY};'
  ].join('\n');
  return (meta, P) => new Function('_OBJ_META', 'P', '_DS_P_HW', '_DS_P_HEAD', '_DS_P_FOOT', code)(meta, P, 40, 96, 28);
}

test('depthSlice: 기본 OFF 플래그와 게이트가 두 빌드에 존재한다', () => {
  for (const f of files) {
    const s = sources[f];
    assert.match(s, /const _DS_DEFAULT=false;/, `${f}: 기본값 OFF`);
    assert.match(s, /depthSlice=1/, `${f}: URL 플래그`);
    assert.match(s, /g\.stage===0&&!g\._bossArena/, `${f}: CH1-1 한정 게이트`);
    assert.match(s, /const _dsOn=_dsEnabled\(\)&&!_EDITOR_MODE/, `${f}: draw 프레임 게이트`);
  }
});

test('depthSlice: 밑동 피벗 occ 메타 — 나무 8그루(.45) + 시체나무(몸통 기준선 -.058) + 아치 ring', () => {
  for (const f of files) {
    const s = sources[f];
    for (let i = 13; i <= 20; i++) assert.match(s, new RegExp(`m_ctree${i}:\\.45`), `${f}: m_ctree${i} footYF`);
    assert.match(s, /m_c1tree:-\.058/, `${f}: m_c1tree footYF = 몸통이 뿌리에서 솟는 선 (뿌리 치마 위는 가리지 않음)`);
    assert.match(s, /_OBJ_META\[_k\]\.occ=1/, `${f}: occ 주입`);
    assert.match(s, /_OBJ_META\.m_ctree15\.ring=1/, `${f}: 아치(rotforest_tree_04) ring 예외`);
    assert.match(s, /_OBJ_META\.m_ctree18\.ring=1/, `${f}: 아치(rotforest_tree_04) ring 예외`);
  }
});

test('depthSlice: footY 정렬 키 = 밑동 world y (스프라이트 중심 아님)', () => {
  for (const f of files) {
    const api = buildApi(sources[f])({}, { x: 0, y: 0 });
    // m_ctree 기준: sz400·scale.85 → foot = y + 400*.85*.45 = y+153
    assert.equal(api._dsFootY({ y: 7380, scale: .85 }, { sz: 400, footYF: .45 }), 7380 + 153, f);
    // m_c1tree: sz1450·footYF -.058 → 분할선 = y - 84.1 (뿌리 치마는 그 남쪽 = 바닥)
    assert.ok(Math.abs(api._dsFootY({ y: 3620, scale: 1 }, { sz: 1450, footYF: -.058 }) - (3620 - 84.1)) < .01, f);
    // 중심(y) 그대로가 아님을 확인
    assert.notEqual(api._dsFootY({ y: 100, scale: 1 }, { sz: 400, footYF: .45 }), 100, f);
  }
});

test('depthSlice: 프런트/백 분할 — 밑동이 플레이어보다 남쪽인 occ만 프런트', () => {
  const meta = { m_ctree13: { sz: 400, footYF: .45, occ: 1 }, m_rock: { sz: 400 } };
  for (const f of files) {
    const build = buildApi(sources[f]);
    const tree = { type: 'm_ctree13', x: 0, y: 1000, scale: 1 }; // footY=1180
    assert.equal(build(meta, { x: 0, y: 1100 })._dsIsFrontObj(tree), true, `${f}: 플레이어(1100) 북쪽 → 나무가 앞`);
    assert.equal(build(meta, { x: 0, y: 1300 })._dsIsFrontObj(tree), false, `${f}: 플레이어(1300) 남쪽 → 나무가 뒤`);
    assert.equal(build(meta, { x: 0, y: 1100 })._dsIsFrontObj({ type: 'm_rock', x: 0, y: 1000 }), false, `${f}: occ 없는 타입 제외`);
    const api = build(meta, { x: 0, y: 0 });
    const a = { type: 'm_ctree13', y: 500, scale: 1 }, b = { type: 'm_ctree13', y: 300, scale: 1 };
    assert.ok(api._dsCmpFootY(b, a) < 0, `${f}: footY 정렬 비교자`);
  }
});

test('depthSlice: 시체나무 — 뿌리 치마 위(분할선 남쪽)에서는 가리지 않는다', () => {
  const meta = { m_c1tree: { sz: 1450, footYF: -.058, occ: 1 } };
  for (const f of files) {
    const build = buildApi(sources[f]);
    const tree = { type: 'm_c1tree', x: 4100, y: 3620, scale: 1 }; // 분할선 3535.9, 시각 밑바닥 3912
    assert.equal(build(meta, { x: 4100, y: 3800 })._dsIsFrontObj(tree), false, `${f}: 뿌리 위(3800) → 플레이어가 위`);
    assert.equal(build(meta, { x: 4100, y: 3470 })._dsIsFrontObj(tree), true, `${f}: 몸통 뒤(3470) → 나무가 앞`);
  }
});

test('depthSlice: 아치 나무 — 고리 개구부 안에서는 가림 없음 (단일 스프라이트 예외)', () => {
  const meta = { m_ctree15: { sz: 400, footYF: .45, occ: 1, ring: 1 } };
  for (const f of files) {
    const build = buildApi(sources[f]);
    const arch = { type: 'm_ctree15', x: 1220, y: 3860, scale: .95 }; // s=380, footY≈4031, 고리 |dx|<57, dy -125~+103
    assert.equal(build(meta, { x: 1220, y: 3870 })._dsIsFrontObj(arch), false, `${f}: 고리 안 → 플레이어가 위`);
    assert.equal(build(meta, { x: 1220, y: 3700 })._dsIsFrontObj(arch), true, `${f}: 고리 위(북) 캐노피 뒤 → 나무가 앞`);
    assert.equal(build(meta, { x: 1450, y: 3900 })._dsIsFrontObj(arch), true, `${f}: 고리 밖 동측 → 나무가 앞`);
  }
});

test('depthSlice: 가림 판정 AABB — 캐노피가 플레이어를 덮을 때만 참', () => {
  const meta = { m_ctree13: { sz: 400, footYF: .45, occ: 1 } };
  for (const f of files) {
    const build = buildApi(sources[f]);
    const tree = { type: 'm_ctree13', x: 0, y: 1000, scale: 1 }; // hw200, foot1180, top780
    assert.equal(build(meta, { x: 0, y: 1000 })._dsOverlapsPlayer(tree), true, `${f}: 캐노피 안`);
    assert.equal(build(meta, { x: 600, y: 1000 })._dsOverlapsPlayer(tree), false, `${f}: 동쪽 밖`);
    assert.equal(build(meta, { x: 0, y: 400 })._dsOverlapsPlayer(tree), false, `${f}: 북쪽 밖`);
  }
});

test('depthSlice: 페이드 lerp — 목표 .62, 약 150ms(9프레임)에 90% 진행, OFF 승수는 1', () => {
  for (const f of files) {
    const s = sources[f];
    assert.match(s, /const _DS_FADE_MIN=\.62;/, f);
    assert.match(s, /const _DS_FADE_K=\.22;/, f);
    assert.match(s, /let _dsFadeMul=1;/, `${f}: OFF/백 패스 승수 1`);
    let a = 1; const target = .62, K = .22;
    for (let fr = 0; fr < 9; fr++) { a += (target - a) * K; if (Math.abs(target - a) < .01) a = target; }
    assert.ok(a <= .67, `${f}: 9프레임(≈150ms)에 89%+ 진행, a=${a}`);
    for (let fr = 0; fr < 11; fr++) { a += (target - a) * K; if (Math.abs(target - a) < .01) a = target; }
    assert.equal(a, target, `${f}: 20프레임 내 완전 수렴`);
    let up = .62; for (let fr = 0; fr < 20; fr++) { up += (1 - up) * K; if (Math.abs(1 - up) < .01) up = 1; }
    assert.equal(up, 1, `${f}: 복귀 수렴`);
  }
});

test('depthSlice: 가려진 플레이어 엑스레이 고스트 — α.55, 가려진 프레임에만, 렌더 전용 재드로우', () => {
  for (const f of files) {
    const s = sources[f];
    assert.match(s, /const _DS_GHOST_A=\.55;/, f);
    assert.match(s, /if\(_hit\)_dsDrawPlayerGhost\(\);/, `${f}: 가려진 프레임에만 고스트`);
    assert.match(s, /_dsPSnap\.on=1;_dsPSnap\.flip=_pFlip;_dsPSnap\.dir=_pDk/, `${f}: drawP 스냅샷 채움`);
    assert.match(s, /_dsPSnap\.on=0; \/\/ \[DEPTH-SLICE\]/, `${f}: drawP 시작 시 스냅샷 리셋`);
    assert.match(s, /SpriteAnimator\.draw\(P\._sa,X,0,0,_dsPSnap\.flip,_dsPSnap\.dir\)/, `${f}: 고스트=현재 프레임 재드로우(전진 없음)`);
  }
});

test('depthSlice: 플래그 OFF 경로 보존 — 기존 그림자 수치와 단일 루프 호출이 그대로 남아 있다', () => {
  for (const f of files) {
    const s = sources[f];
    assert.match(s, /else\{X\.fillStyle='rgba\(0,0,0,\.25\)';X\.beginPath\(\);X\.ellipse\(_px,_py\+_pR\+12/, `${f}: 플레이어 기존 그림자 보존`);
    assert.ok(/sa\s*\*\s*0?\.18/.test(s), `${f}: 적 기존 그림자 α.18 보존`);
    assert.match(s, /if\(_dsOn&&_dsIsFrontObj\(mo\)\)\{_dsFrontObjs\.push\(mo\);continue\}\n\s*_drawMapObjOne\(mo,_hellWinterTone\);/, `${f}: 분할은 _dsOn일 때만`);
    const fp = s.match(/drawP\(\);\n\s*if\(_dsOn&&_dsFrontObjs\.length\)_dsDrawFrontPass\(\);/g) || [];
    assert.equal(fp.length, 1, `${f}: 프런트 패스 위치`);
    assert.match(s, /\*_ch1StartOuterPropAlpha\(mo\)\*_dsFadeMul/, `${f}: 페이드 승수 적용 위치`);
    assert.match(s, /const _dsOn2=_dsEnabled\(\);\n\s*let _eIter=ens;/, `${f}: 적 인스턴싱 y정렬 게이트(MAP-013)`);
  }
});

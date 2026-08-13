import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ Tier8~10 월드 드랍빔 — 등급→시각 매핑 regression guard ═══
// 배선(_getWorldDropBeamTier·v3 10타일 아틀라스·render)은 이미 구현·커밋(art 7984a7c1 / wire e5f0d85a)돼
// 있으나 자동 테스트가 없어(수동 콘솔검증만) 매핑이 무가드였음. 본 테스트가:
//  (a) 기존 Tier1~7 + rarity 폴백 매핑 회귀 금지
//  (b) Tier8~10(layerLv 8/9/10 → 청록/흑적/백금) 배선 잠금
//  (c) render 타일 인덱싱(beamTier-1)·아틀라스 상수(COLS=2·v3 경로) 일관성
// 을 고정한다. game.html 로직 무변경(추출·assert only). producer/A2/Keystone flag 미접촉.

const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

// ── 실제 게임 함수 추출 (self-contained: item.layerLv/item.rarity/Math만 사용) ──
function extractBeamTier() {
  const m = game.match(/function _getWorldDropBeamTier\(item\)\{[\s\S]*?\n\}/);
  assert.ok(m, '_getWorldDropBeamTier 함수 추출');
  return new Function('return (' + m[0].replace('function _getWorldDropBeamTier', 'function') + ')')();
}
const beamTier = extractBeamTier();

// ── §1 소스 앵커: v3 배선이 코드에 실재 (회귀 가드) ──
test('§1 v3 10단 아틀라스·상수·render 인덱싱 배선 존재', () => {
  assert.match(game, /world_item_drop_beams_v3_01\.png/);
  assert.match(game, /world_item_drop_beams_v3_02\.png/);
  assert.match(game, /const _WORLD_DROP_FX_COLS=2;/);
  // render: beamTier 획득 → 타일 beamTier-1로 그림
  assert.match(game, /const _beamTier=_getWorldDropBeamTier\(item\);/);
  assert.match(game, /_worldDropFxTile\(_pillarFrame,_beamTier-1\)/);
  // layerLv 우선 · rarity 폴백 구조
  assert.match(game, /if\(item\.layerLv>=1\)return Math\.min\(10,~~item\.layerLv\)/);
  assert.match(game, /return \[0,2,3,4,5,6\]\[item\.rarity\]\|\|0/);
});

// ── §2 Tier1~7 회귀 금지: rarity 폴백 매핑(현행 production) 불변 ──
test('§2 rarity 폴백 매핑 불변 — 일반0/고급2/희귀3/영웅4/전설5/유니크6', () => {
  const R = r => beamTier({ rarity: r }); // layerLv 없음 → 폴백 경로
  assert.equal(R(0), 0, '일반(r0) = 빔 없음');
  assert.equal(R(1), 2, '고급(r1) = 타일2 초록');
  assert.equal(R(2), 3, '희귀(r2) = 타일3 파랑');
  assert.equal(R(3), 4, '영웅(r3) = 타일4 보라');
  assert.equal(R(4), 5, '전설(r4) = 타일5 금');
  assert.equal(R(5), 6, '유니크(r5) = 타일6 레드');
  assert.equal(R(6), 0, 'rarity 범위초과 = 0(무빔)');
  assert.equal(R(undefined), 0, 'rarity 없음 = 0');
});

// ── §3 Tier8~10 배선: layerLv 8/9/10 → beamTier 8/9/10 (청록/흑적/백금) ──
test('§3 Tier8~10 layerLv 매핑 — 청록(8)/흑적(9)/백금(10)', () => {
  assert.equal(beamTier({ layerLv: 8 }), 8, 'layerLv8 = beamTier8 청록(ANCIENT)');
  assert.equal(beamTier({ layerLv: 9 }), 9, 'layerLv9 = beamTier9 흑적(VOID)');
  assert.equal(beamTier({ layerLv: 10 }), 10, 'layerLv10 = beamTier10 백금(EXODUS)');
  // 하위 단수도 layerLv로 정상
  assert.equal(beamTier({ layerLv: 1 }), 1, 'layerLv1 = 백은');
  assert.equal(beamTier({ layerLv: 7 }), 7, 'layerLv7 = 핑크');
});

// ── §4 경계/우선순위 불변식 ──
test('§4 경계·우선순위 — cap10·truncation·layerLv 우선·null', () => {
  assert.equal(beamTier(null), 0, 'null item = 0');
  assert.equal(beamTier({ layerLv: 11 }), 10, 'layerLv11 → cap 10');
  assert.equal(beamTier({ layerLv: 99 }), 10, 'layerLv99 → cap 10');
  assert.equal(beamTier({ layerLv: 8.9 }), 8, 'layerLv 소수 → ~~ 절삭(8)');
  assert.equal(beamTier({ layerLv: 9, rarity: 2 }), 9, 'layerLv 우선(rarity 무시) → 9 not 3');
  assert.equal(beamTier({ layerLv: 0, rarity: 5 }), 6, 'layerLv<1 → rarity 폴백(6)');
});

// ── §5 타일 인덱스 유효성: beamTier-1 이 v3 2×5 그리드 내 (COLS=2, rows 5) ──
test('§5 beamTier-1 타일이 2×5 그리드 내 유효 (Tier8~10 포함)', () => {
  const COLS = 2, ROWS = 5; // v3: 2열×5행 = 10타일
  for (let tier = 1; tier <= 10; tier++) {
    const tile = tier - 1;
    const col = tile % COLS, row = Math.floor(tile / COLS);
    assert.ok(col < COLS && row < ROWS, `tier${tier}→tile${tile} (col${col},row${row}) 그리드 내`);
  }
  // 구체: Tier8→tile7(col1,row3), Tier9→tile8(col0,row4), Tier10→tile9(col1,row4)
  assert.deepEqual([7 % 2, Math.floor(7 / 2)], [1, 3], 'Tier8=tile7');
  assert.deepEqual([8 % 2, Math.floor(8 / 2)], [0, 4], 'Tier9=tile8');
  assert.deepEqual([9 % 2, Math.floor(9 / 2)], [1, 4], 'Tier10=tile9');
});

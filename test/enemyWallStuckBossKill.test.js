import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// ENEMY 팀 — 벽 끼임(_eWallStuck) 처리에서 보스가 구조 실패 시 즉사(rollDrop+_regKill)되어
// 전리품과 함께 무료로 사라지고 보스전이 종료되던 결함의 회귀 가드.
// 계약: 보스(e.ib)는 즉사 금지 — 넓은 링/플레이어 위치로 재배치, 실패해도 alive 유지. 비보스만 정리 킬.

const gameHtml = await readFile(new URL('../game.html', import.meta.url), 'utf8');

function stuckBlock() {
  // 메인 적 루프의 벽 끼임 처리 구간 추출
  const start = gameHtml.indexOf('// 벽 끼임 처리 (컬링 이전');
  assert.ok(start >= 0, '벽 끼임 처리 블록이 존재해야 함');
  const end = gameHtml.indexOf('// ── 타이머 감소', start);
  assert.ok(end > start, '벽 끼임 블록의 끝 앵커가 존재해야 함');
  return gameHtml.slice(start, end);
}

test('벽 끼임 구조 실패 시 보스(e.ib)는 즉사하지 않고 재배치된다', () => {
  const blk = stuckBlock();
  // 구조 실패 분기가 보스/비보스로 나뉘어야 함
  assert.match(blk, /if\(!_rescued0\)\{/, '구조 실패 분기가 있어야 함');
  assert.match(blk, /if\(e\.ib\)\{/, '보스 전용 분기(e.ib)가 있어야 함');
  // 보스 분기는 재배치 경로만 가진다 (kill/rollDrop/_regKill 없음)
  const ibIdx = blk.indexOf('if(e.ib){');
  const elseIdx = blk.indexOf('}else{', ibIdx);
  assert.ok(elseIdx > ibIdx, '보스 분기 뒤에 비보스 else 분기가 있어야 함');
  const bossBranch = blk.slice(ibIdx, elseIdx);
  assert.ok(!/e\.hp\s*=\s*0/.test(bossBranch), '보스 분기에는 즉사(e.hp=0)가 없어야 함');
  assert.ok(!/rollDrop\(e\)/.test(bossBranch), '보스 분기에는 rollDrop이 없어야 함');
  assert.ok(!/_regKill\(e\)/.test(bossBranch), '보스 분기에는 _regKill이 없어야 함');
  assert.match(bossBranch, /canMv\(P\.x,P\.y,e\.r\)/, '보스 분기는 플레이어 위치 재배치 폴백을 가진다');
});

test('벽 끼임 정리 킬은 비보스(else 분기)에만 남아 있다', () => {
  const blk = stuckBlock();
  const elseIdx = blk.indexOf('}else{');
  assert.ok(elseIdx >= 0, '비보스 else 분기가 있어야 함');
  const nonBoss = blk.slice(elseIdx);
  assert.match(nonBoss, /e\.hp\s*=\s*0;e\.alive\s*=\s*false/, '비보스 분기는 기존 정리 킬을 유지한다');
  assert.match(nonBoss, /_regKill\(e\)/, '비보스 정리 킬은 _regKill로 킬 크레딧 처리');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('recommended build moves old rank 8 Bone Lightning ahead of rank 1 Thunder Spear and renumbers all phases', () => {
  const start = gameHtml.indexOf('const SKILL_REC_PATH=[');
  const end = gameHtml.indexOf('];', start);
  assert.ok(start >= 0 && end > start, 'SKILL_REC_PATH must exist');
  const source = gameHtml.slice(start, end);
  const phaseNumbers = [...source.matchAll(/phase:'(\d+)\./gu)].map((match) => Number(match[1]));
  assert.deepEqual(phaseNumbers, Array.from({ length: 14 }, (_, index) => index + 1));
  assert.match(source, /phase:'1\. 해골무덤\+악의폭풍'/u);
  assert.match(source, /phase:'2\. 전격의창\+아이스스톰'/u);
  assert.match(source, /phase:'9\. 폭풍소환\+얼음보주\+뇌전걸음'/u);
  assert.match(source, /phase:'14\. 사슬 최종'/u);
  assert.ok(source.indexOf("fuse:'boneStorm'") < source.indexOf("fuse:'thunderGhost'"));
});

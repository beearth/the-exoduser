import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseCandidates, rollCandidate, toggleBuild } from './model.js';

const source = await readFile(new URL('../docs/7아이템디자인/유니크_어픽스_리스트.md', import.meta.url), 'utf8');
const candidates = parseCandidates(source);

test('the lab loads every proposed unique affix from the design document', () => {
  assert.equal(candidates.length, 22);
  assert.deepEqual(candidates.map((candidate) => candidate.id),
    Array.from({ length: 22 }, (_, index) => `U-D${String(index + 1).padStart(2, '0')}`));
  assert.ok(candidates.every((candidate) => candidate.effect && candidate.hook && candidate.risk));
});

test('a low, middle, and high roll respects the documented bands', () => {
  const rage = candidates.find((candidate) => candidate.id === 'U-D10');
  assert.deepEqual([0, 0.5, 0.999].map((point) => rollCandidate(rage, () => point)), [
    { value: 10, tier: '하옵', display: '10%' },
    { value: 15, tier: '중옵', display: '15%' },
    { value: 20, tier: '상옵', display: '20%' },
  ]);
});

test('the proposed build holds three distinct affixes and allows removing one', () => {
  const build = ['U-D03', 'U-D10', 'U-D12'];
  assert.deepEqual(toggleBuild(build, 'U-D14'), build);
  assert.deepEqual(toggleBuild(build, 'U-D10'), ['U-D03', 'U-D12']);
  assert.deepEqual(toggleBuild(['U-D03'], 'U-D12'), ['U-D03', 'U-D12']);
});

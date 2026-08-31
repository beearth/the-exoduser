import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const helperUrl = new URL('../lobby-stage-info.js', import.meta.url);
const indexUrl = new URL('../index.html', import.meta.url);

async function loadLobbyStageInfo() {
  assert.equal(
    existsSync(helperUrl),
    true,
    'the lobby needs one shared stage-info helper for online and local slots'
  );
  const source = await readFile(helperUrl, 'utf8');
  const context = {};
  vm.runInNewContext(source, context, { filename: 'lobby-stage-info.js' });
  return context.LOBBY_STAGE_INFO;
}

test('lobby maps every chapter boundary using the canonical variable stage counts', async () => {
  const { getProgress } = await loadLobbyStageInfo();
  const cases = [
    [0,  1, '썩은 숲',        1],
    [3,  1, '썩은 숲',        4],
    [4,  2, '벌레굴',          1],
    [9,  2, '벌레굴',          6],
    [10, 3, '지옥의 겨울',      1],
    [13, 3, '지옥의 겨울',      4],
    [14, 4, '고통의 화염지대',   1],
    [34, 7, '지옥성',           3],
  ];

  for (const [stage, chapter, name, floor] of cases) {
    assert.deepEqual(
      { ...getProgress(stage) },
      { stage, chapter, name, floor },
      `stage ${stage} should be ${chapter}장 ${name} ${floor}층`
    );
  }
});

test('lobby formats the screenshot saves as chapter 3 hell winter floors', async () => {
  const { formatProgress } = await loadLobbyStageInfo();
  assert.equal(formatProgress(12), '3장 지옥의 겨울 3층');
  assert.equal(formatProgress(13), '3장 지옥의 겨울 4층');
});

test('online and local lobby slots use the shared canonical formatter', async () => {
  const html = await readFile(indexUrl, 'utf8');
  assert.match(html, /<script src="lobby-stage-info\.js"><\/script>/);
  assert.equal(
    (html.match(/_formatLobbyStageProgress\(stage,_TL\)/g) || []).length,
    2,
    'online and local slot renderers must use the same formatter'
  );
  assert.doesNotMatch(html, /~~\(stage\/10\)|stage%10\+1/);
  assert.doesNotMatch(html, /\['얼음지옥','독충지옥','화염지옥'/);
});

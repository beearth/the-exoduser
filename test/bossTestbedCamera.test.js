import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const gameHtml = readFileSync(join(repoRoot, 'game.html'), 'utf8');

test('bosstest keeps the player centered instead of moving the player to the boss', () => {
  const start = gameHtml.indexOf('const _btParam');
  const end = gameHtml.indexOf('// ── 보스 정보 업데이트', start);
  const block = start >= 0 && end > start ? gameHtml.slice(start, end) : '';
  assert.match(block, /_enterBossArena\(\);/);
  assert.match(block, /window\._btBoss\s*=\s*ens\.find\(e=>e\.ib\)/);
  assert.doesNotMatch(block, /P\.x\s*=\s*window\._btBoss\.x/);
  assert.match(gameHtml, /if\(!window\._btActive&&G\._bossRef&&G\._bossRef\.alive\)/);
  assert.match(gameHtml, /if\(!_EDITOR_MODE&&G\.map\)\{const _mwPx=G\.mw\*T,_mhPx=G\.mh\*T,_cz2=Math\.max\(0\.3,G\._camZoom\|\|1\),_hvw=VW\/\(2\*_cz2\),_hvh=VH\/\(2\*_cz2\);/);
});

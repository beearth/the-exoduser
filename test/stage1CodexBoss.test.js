import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const gameHtml = readFileSync(join(repoRoot, 'game.html'), 'utf8');

test('stage 1 boss is the Codex lava warbringer', () => {
  assert.match(gameHtml, /const HELL_BOSSES=\[[\s\S]*\['흑요염 파괴자','독버섯 거인','숲의 사냥꾼','숲의 기생수'\]/);
  assert.match(gameHtml, /'흑요염 파괴자':'Obsidian Flame Destroyer'/);
  assert.match(gameHtml, /be:\(ch\.hell===0&&f===0\)\?EL\.F:th\.be,/);
});

test('stage 1 boss has a dedicated Codex concept skin path and renderer', () => {
  assert.match(gameHtml, /const STAGE1_CODEX_BOSS_SKIN='assets\/sprites\/boss\/stage1_codex_lava_warbringer\.png';/);
  assert.match(gameHtml, /const STAGE1_CODEX_BOSS_MOTION=\{/);
  assert.match(gameHtml, /windup:\{sx:1\.08,sy:\.94,y:-18,rot:-\.08,glow:\.45\}/);
  assert.match(gameHtml, /slam:\{sx:1\.18,sy:\.86,y:12,rot:\.06,glow:\.75\}/);
  assert.match(gameHtml, /function _drawStage1CodexBoss\(X,e,sa,tdY\)\{/);
  assert.match(gameHtml, /if\(!_bDrew&&G\.stage===0\)\{_bDrew=_drawStage1CodexBoss\(X,e,sa,_tdY\)\}/);
});

test('stage 1 Codex boss image asset exists in the served project tree', () => {
  assert.equal(existsSync(join(repoRoot, 'assets/sprites/boss/stage1_codex_lava_warbringer.png')), true);
});

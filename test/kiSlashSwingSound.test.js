import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('kiSlash combo uses sequential swing sounds across combo hits', () => {
  assert.match(
    gameHtml,
    /function _playKiSlashComboSfx\(step\)\{const _sw=\['sword_swing1','sword_swing2','sword_swing3'\];const _idx=Math\.max\(0,Math\.min\(2,\(step\|\|1\)-1\)\);playSample\(_sw\[_idx\],\.85,_r\(1,\.06\)\)\}/
  );
  assert.match(
    gameHtml,
    /function _isSkillSfx\(key\)\{return _SKILL_SFX_KEYS\.has\(key\)\|\|key\.startsWith\('chain_'\)\|\|key\.startsWith\('electric_storm'\)\|\|key\.startsWith\('fire_magic'\)\|\|key\.startsWith\('sword_swing'\)\}/
  );
  const uses = gameHtml.match(/_playKiSlashComboSfx\(_cresStep\);/g) || [];
  assert.equal(uses.length, 2);
});

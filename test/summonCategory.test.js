import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('Defense tab gives defensive summons their own Summon column', () => {
  assert.match(gameHtml, /\{id:'phys',name:'⚔️ 물리\/근접',nameEn:'⚔️ Physical\/Melee'/,
    'the Attack tab no longer labels its physical column as Rage');
  assert.match(gameHtml, /\{id:'summon',name:'🕯 소환',nameEn:'🕯 Summon'/);
  assert.match(gameHtml, /\{id:'def',name:'🛡 방어'[^\n]+cats:\['def','move','summon'\]/);
  for (const id of ['guardian', 'voidScarecrow', 'explodeScarecrow', 'ancestorSummon']) {
    assert.match(gameHtml, new RegExp(`\\{id:'${id}'[^\\n]+cat:'summon'`), `${id} must appear only in the Defense > Summon column`);
  }
  assert.doesNotMatch(gameHtml, /\{id:'timeWarp'[^\n]+cat:'summon'/, 'Time Warp remains a defensive utility, not a summon');
});

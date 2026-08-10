import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('Silvertail replaces every shared player voice cue with her dedicated English female samples', () => {
  assert.match(gameHtml, /const _SILVERTAIL_VOICE_MAP=\{/);
  assert.match(gameHtml, /male_grunt:'silvertail_grunt'/);
  assert.match(gameHtml, /voice_grunt:'silvertail_grunt'/);
  assert.match(gameHtml, /voice_attack:'silvertail_attack'/);
  assert.match(gameHtml, /voice_move:'silvertail_move'/);
  assert.match(gameHtml, /voice_parry1:'silvertail_parry'/);
  assert.match(gameHtml, /voice_magic:'silvertail_magic'/);
  assert.match(gameHtml, /player_dead1:'silvertail_dead1'/);
  assert.match(gameHtml, /player_dead2:'silvertail_dead2'/);
  assert.match(gameHtml, /player_dead3:'silvertail_dead3'/);
  assert.match(gameHtml, /player_dead4:'silvertail_dead4'/);
  assert.match(gameHtml, /player_hit1:'silvertail_hit1'/);
  assert.match(gameHtml, /player_hit2:'silvertail_hit2'/);
  assert.match(gameHtml, /player_hit3:'silvertail_hit3'/);
  assert.match(gameHtml, /player_hit4:'silvertail_hit4'/);
  assert.match(gameHtml, /voice_cooldown:'silvertail_cooldown'/);
  assert.match(gameHtml, /voice_resource_fail:'silvertail_resource_fail'/);
  assert.match(gameHtml, /silvertail_grunt1:'sfx\/voice\/silvertail_grunt1\.mp3'/);
  assert.match(gameHtml, /silvertail_grunt2:'sfx\/voice\/silvertail_grunt2\.mp3'/);
  assert.match(gameHtml, /silvertail_grunt3:'sfx\/voice\/silvertail_grunt3\.mp3'/);
  assert.match(gameHtml, /silvertail_parry1:'sfx\/voice\/silvertail_parry1\.mp3'/);
  assert.match(gameHtml, /silvertail_parry2:'sfx\/voice\/silvertail_parry2\.mp3'/);
  assert.match(gameHtml, /silvertail_parry3:'sfx\/voice\/silvertail_parry3\.mp3'/);
  assert.match(gameHtml, /if\(mapped==='silvertail_grunt'\)return _silvertailVariantKey\('silvertail_grunt',3\);/);
  assert.match(gameHtml, /if\(mapped==='silvertail_parry'\)return _silvertailVariantKey\('silvertail_parry',3\);/);
  assert.match(gameHtml, /const _SILVERTAIL_VOICE_REPEAT_BLOCK_MS=10000;/);
  assert.match(gameHtml, /function _silvertailVariantKey\(base,count\)/);
  assert.match(gameHtml, /if\(now-last<_SILVERTAIL_VOICE_REPEAT_BLOCK_MS\)return '';/);
  assert.match(gameHtml, /if\(!Object\.prototype\.hasOwnProperty\.call\(_SILVERTAIL_VOICE_MAP,key\)\)return key;/);
  assert.match(gameHtml, /if\(!key\)return;\s*if\(_gxVolMul<1\)/);
  assert.match(gameHtml, /if\(!key\)return;\s*if\(!P\)return;/);
  assert.match(gameHtml, /if\(key\.startsWith\('voice_'\)\|\|key==='male_grunt'\|\|key\.startsWith\('silvertail_'\)\)return _SFX_PRI\.VOICE;/);
  assert.match(gameHtml, /function playSample\(key,vol,rate,pri\)\{\s*key=_silvertailVoiceKey\(key\);/);
  assert.match(gameHtml, /function playSampleAt\(key,vol,rate,x,y\)\{\s*key=_silvertailVoiceKey\(key\);/);
  for (const key of ['silvertail_grunt', 'silvertail_attack', 'silvertail_move', 'silvertail_parry', 'silvertail_magic', 'silvertail_wakeup', 'silvertail_dead1', 'silvertail_dead2', 'silvertail_dead3', 'silvertail_dead4']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/voice/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/voice/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  for (const key of ['silvertail_grunt1', 'silvertail_grunt2', 'silvertail_grunt3']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/voice/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/voice/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  for (const key of ['silvertail_parry1', 'silvertail_parry2', 'silvertail_parry3']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/voice/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/voice/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  for (const key of ['silvertail_hit1', 'silvertail_hit2', 'silvertail_hit3', 'silvertail_hit4']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/voice/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/voice/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  for (const key of ['silvertail_cooldown', 'silvertail_resource_fail']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/voice/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/voice/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  assert.match(gameHtml, /if\(_charIdx===1&&t==='쿨다운 중\.\.\.'\)playSample\('voice_cooldown',1,1\);/);
  assert.match(gameHtml, /if\(_charIdx===1&&\/\^\(MP\|ST\|HP\) 부족!\|\^악의 부족!\/\.test\(t\)\)playSample\('voice_resource_fail',1,1\);/);
  for (const key of ['silvertail_parry_fail1', 'silvertail_parry_fail2', 'silvertail_parry_fail3', 'silvertail_parry_fail4']) {
    assert.ok(existsSync(new URL(`../sfx/voice/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
});

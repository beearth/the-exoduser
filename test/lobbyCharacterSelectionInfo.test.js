import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('renders the summoned ancestor name and caption in the lobby display', () => {
  assert.match(indexHtml, /id="charDispTitle"/);
  assert.match(indexHtml, /id="charDispSub"/);
  assert.match(indexHtml, /<video class="lobby-char-preview" id="lobbyCharPreview" muted loop playsinline><\/video>/);
  assert.match(indexHtml, /empty\.classList\.add\('selected'\)/);
  assert.match(indexHtml, /title\.textContent=_lobbyAncestorName\(\)/);
  assert.match(indexHtml, /sub\.textContent=_lobbyAncestorCaption\(\)/);
  assert.match(indexHtml, /preview\.removeAttribute\('src'\)/);
  assert.match(indexHtml, /lobby_varkan_crypt_poster_v2\.webp/);
});

test('updates the lobby display from online and local character slots', () => {
  assert.match(indexHtml, /_updateCharDisplay\(\{name:ch\.name,charIdx:_pci,stage\}\)/);
  assert.match(indexHtml, /function _selectSlot\(s\)[\s\S]*_updateCharDisplay\(s\)/);
});

test('keeps the lobby display child nodes intact during language changes', () => {
  assert.doesNotMatch(indexHtml, /'#charDispEmpty':\[/);
  assert.match(indexHtml, /if\(_selectedCharDisplay\)_updateCharDisplay\(_selectedCharDisplay\)/);
});

test('does not access the delayed DOM helper during initial language setup', () => {
  assert.match(indexHtml, /const title=document\.getElementById\('charDispTitle'\);const sub=document\.getElementById\('charDispSub'\);/);
});

test('selected jobs use the lobby English fallback outside Korean',()=>{
 const source=indexHtml.slice(indexHtml.indexOf('const _LOBBY_EN={'),indexHtml.indexOf('const _LOBBY_ZH='));
 const ctx=vm.createContext({});vm.runInContext(source+';globalThis.en=_LOBBY_EN;',ctx);
 ctx._lobbyLang=()=> 'en';
 vm.runInContext('const _LOBBY_TABLES={en:_LOBBY_EN};'+indexHtml.match(/function _TL\(s\)\{[^\n]+/)[0],ctx);
 assert.equal(ctx._TL('전사'),'Warrior');
 assert.equal(ctx._TL('블레이드 댄서'),'Blade Dancer');
 ctx._lobbyLang=()=> 'ko';assert.equal(ctx._TL('전사'),'전사');
});

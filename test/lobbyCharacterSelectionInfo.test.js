import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('renders selected character name and job in the lobby display', () => {
  assert.match(indexHtml, /id="charDispTitle"/);
  assert.match(indexHtml, /id="charDispSub"/);
  assert.match(indexHtml, /<video class="lobby-char-preview" id="lobbyCharPreview" muted loop playsinline><\/video>/);
  assert.match(indexHtml, /empty\.classList\.add\('selected'\)/);
  assert.match(indexHtml, /title\.textContent=s\.name/);
  assert.match(indexHtml, /sub\.textContent=_TL\(_vi\.job\|\|_vi\.cls\|\|''\)/);
  assert.match(indexHtml, /preview\.src=_vi\.idleVid/);
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

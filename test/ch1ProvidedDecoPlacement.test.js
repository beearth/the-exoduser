import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('CH1 uses only the six user-provided deco cuts with aspect-ratio rendering', () => {
  for (const file of [
    'provided_gore_01.png',
    'provided_gore_02.png',
    'provided_gore_03.png',
    'provided_gore_04.png',
    'provided_gore_05.png',
    'provided_gore_06.png',
  ]) {
    assert.match(gameHtml, new RegExp(file.replace('.', '\\.')));
  }
  assert.match(
    gameHtml,
    /'m_usergore1':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore2':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore3':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore4':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore5':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore6':\{sz:\d+,keepAR:1\}/
  );
});

test('CH1 user-provided gore deco is restricted to stages 1-4 and capped to 20 placements', () => {
  assert.match(
    gameHtml,
    /const _chDecoRaw=_CH_DECO\[hell\];[\s\S]*const _chDeco=_chDecoRaw\?\.filter\(d=>\(!d\.stageMin\|\|G\.stage>=d\.stageMin\)&&\(!d\.stageMax\|\|G\.stage<=d\.stageMax\)\)\|\|\[\];/
  );
  assert.match(
    gameHtml,
    /const _providedDeco=_chDeco\.filter\(d=>d\.userProvided\);[\s\S]*const _providedTarget=Math\.min\(20,_providedDeco\.length\?20:0\);/
  );
});

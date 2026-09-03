import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const gamePath = fileURLToPath(new URL('../game.html', import.meta.url));
const root = dirname(gamePath);
const gameHtml = readFileSync(gamePath, 'utf8');

test('removed Holy Blast has no executable definition, dispatch, UI, text, or preload path', () => {
  assert.doesNotMatch(gameHtml, /holyBlast/);
  assert.doesNotMatch(gameHtml, /신성폭발/);
  assert.doesNotMatch(gameHtml, /_hb(?:Cd|Casting|T|X|Y|Pillar)/);
  assert.doesNotMatch(gameHtml, /fireHolyBlast|_holyExpFrames|vfx_holycircle_gold/);
});

test('active locale catalogs and translation generators contain no removed Holy Blast strings', () => {
  const localeFiles = readdirSync(root)
    .filter((name) => /^lang_[a-z]+\.js$/i.test(name))
    .map((name) => join(root, name));
  localeFiles.push(...readdirSync(join(root, 'lang'))
    .filter((name) => name.endsWith('.js'))
    .map((name) => join(root, 'lang', name)));
  localeFiles.push(join(root, 'i18n', 'ko.json'));
  localeFiles.push(join(root, 'add_skill_descs.cjs'), join(root, 'add_translations_es_ptbr.cjs'));

  for (const file of localeFiles) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /holyBlast|신성폭발|신성폭팔/i, file);
  }
});

test('save restore accepts only skill IDs that still exist in SKILL_LIST', () => {
  assert.match(
    gameHtml,
    /const _knownSkillIds=new Set\(SKILL_LIST\.map\(sk=>sk\.id\)\);\s*for\(const k in d\.skills\)if\(_knownSkillIds\.has\(k\)\)P\.skills\[k\]=d\.skills\[k\]/,
  );
});

test('removed Holy Blast ships no dedicated icon, casting circle, explosion frames, or SFX', () => {
  const removed = [
    '../img/skillskin_upscaled/holyBlast.png',
    '../img/vfx_holycircle_gold.png',
    '../sprites/holy_explosion/sprite-384px-9-frames/frame_000.png',
    '../sprites/holy_explosion/sprite-384px-9-frames/frame_008.png',
    '../sfx/sk_holy.mp3',
  ];
  for (const relative of removed) {
    assert.equal(existsSync(fileURLToPath(new URL(relative, import.meta.url))), false, relative);
  }
});

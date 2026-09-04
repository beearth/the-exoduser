import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const gameHtml = readFileSync(join(root, 'game.html'), 'utf8');
const legacyKorean = /대왕치기(?:\s*2)?/;
const legacyEnglish = /Giant Slam(?:\s*(?:II|2))?|Inferno Slam|giant slam/;

function markdownFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

test('the two rage-slam skill names are Hell Slam 1 and Hell Slam 2', () => {
  assert.match(gameHtml, /id:'giantSlam',name:'지옥강타 1',cat:'rage',act:true/);
  assert.match(gameHtml, /id:'giantSlam2',name:'지옥강타 2',cat:'rage',act:true/);
  assert.match(gameHtml, /\{id:'spec',name:'⚙ 특수'[^\n]+cats:\['tech','rage','ult'\]/,
    'Hell Slam I/II must be listed only under the Special tab Rage category');
  assert.match(gameHtml, /infernoSlam:'지옥강타 2'/);
  assert.match(gameHtml, /infernoSlam:'Hell Slam II'/);
  assert.match(gameHtml, /pillarSlam:'지옥강타 2 \+ 악의기둥 합체\. 지옥강타 2 시 9개 악의기둥 자동 전개/);
  assert.match(gameHtml, /pillarSlam:'Hell Slam II \+ Dark Pillar fuse\. Hell Slam II auto-deploys 9 dark pillars/);
  assert.match(gameHtml, /지옥강타 1과 합체→기둥강타/);
});

test('the runtime keeps save-compatible IDs but exposes no legacy slam names', () => {
  assert.match(gameHtml, /id:'giantSlam'/);
  assert.match(gameHtml, /id:'giantSlam2'/);
  assert.match(gameHtml, /infernoSlam/);
  assert.doesNotMatch(gameHtml, legacyKorean);
  assert.doesNotMatch(gameHtml, legacyEnglish);
});

test('every locale catalog follows the Hell Slam 1 and 2 source-name contract', () => {
  const localeNames = readdirSync(root)
    .filter((name) => /^lang_[a-z]+\.js$/i.test(name));
  assert.ok(localeNames.length >= 20);
  for (const name of localeNames) {
    const source = readFileSync(join(root, name), 'utf8');
    assert.match(source, /지옥강타 1/, `${name} must contain the new first skill name`);
    assert.match(source, /지옥강타 2/, `${name} must contain the new second skill name`);
    assert.doesNotMatch(source, legacyKorean, `${name} retains a legacy Korean skill name`);
    assert.doesNotMatch(source, legacyEnglish, `${name} retains a legacy English skill name`);
  }
});

test('design docs use the same names except for the locked parry document', () => {
  const docsRoot = join(root, 'docs');
  const lockedDocPart = join('2_3 돌진+패링+방패시스템', '2_3 돌진+패링+방패시스템.md');
  const files = markdownFiles(docsRoot).filter((file) => !file.endsWith(lockedDocPart));
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, legacyKorean, `${file} retains a legacy Korean skill name`);
    assert.doesNotMatch(source, legacyEnglish, `${file} retains a legacy English skill name`);
  }
});

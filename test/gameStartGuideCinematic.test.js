import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('wake-up dialogue and four-cut controls share one centered dialog', async()=>{
  const game=await readFile(new URL('../game.html',import.meta.url),'utf8');
  assert.match(game,/<div id="introKeys" role="dialog"[\s\S]*id="introTextKr"[\s\S]*id="introTextEn"[\s\S]*id="ikBody"[\s\S]*id="ikSkip"[\s\S]*id="ikNext"/);
  assert.doesNotMatch(game,/<div id="introText">/);
  assert.match(game,/#introKeys\{justify-content:center;padding-left:0/);
  assert.match(game,/width:min\(720px,calc\(100vw - 96px\)\);max-height:calc\(100vh - 48px\);overflow-y:auto/);
  assert.doesNotMatch(game,/function _showIntroLine|function _showIntroKeys/);
  assert.match(game,/body\.replaceChildren\(\)/);
});

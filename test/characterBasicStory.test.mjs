import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('shared story data covers five selections and preserves user canon',()=>{
  const context=vm.createContext({});
  vm.runInContext(fs.readFileSync(new URL('../character-basic-stories.js',import.meta.url),'utf8'),context);
  const rows=context.EXODUSER_CHARACTER_STORIES.entries;
  assert.equal(rows.length,29);
  assert.equal(new Set(rows.map(x=>x.code)).size,29);
  const ko=rows.find(x=>x.code==='ko');
  assert.equal(ko.stories.length,5);
  assert.match(ko.stories[1],/단검.*암살자/);
  assert.match(ko.stories[1],/짝사랑/);
  assert.match(ko.stories[1],/등에 부착/);
  assert.match(ko.stories[3],/크레이아/);
  assert.match(ko.stories[4],/트발토/);
  assert.match(ko.stories[4],/수만 년/);
  for(const row of rows){assert.equal(row.stories.length,5);assert.ok(row.title);for(const s of row.stories)assert.ok(s.trim());}
});

test('web and Unity consume identical story data',{skip:!process.env.EXODUSER_UNITY_STORY_PATH},()=>{
  const context=vm.createContext({});
  vm.runInContext(fs.readFileSync(new URL('../character-basic-stories.js',import.meta.url),'utf8'),context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.EXODUSER_CHARACTER_STORIES)),JSON.parse(fs.readFileSync(process.env.EXODUSER_UNITY_STORY_PATH,'utf8')));
});

test('switching a character or language updates only the story leaf nodes',()=>{
  const title={textContent:''},body={textContent:'',dataset:{}};
  let language='ko';
  const context=vm.createContext({document:{getElementById:id=>id==='csStoryTitle'?title:body},_lobbyLang:()=>language});
  vm.runInContext(fs.readFileSync(new URL('../character-basic-stories.js',import.meta.url),'utf8'),context);
  context.refreshCharacterBasicStory(1);assert.match(body.textContent,/짝사랑/);
  language='en';context.refreshCharacterBasicStory();assert.match(body.textContent,/Wini/);
  language='ar';context.refreshCharacterBasicStory(3);assert.equal(body.dir,'rtl');
  assert.equal(body.dataset.characterIndex,'3');
  language='unknown';context.refreshCharacterBasicStory(4);assert.match(body.textContent,/Tvalto/);
});

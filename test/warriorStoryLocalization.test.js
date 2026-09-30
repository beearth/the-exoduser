import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
for(const language of ['ko','en'])test('warrior movie selects '+language+' timed captions without baked Korean',async()=>{
 class El extends EventTarget{constructor(){super();this.children=[];this.style={};this.track={mode:'disabled'};}append(...els){this.children.push(...els);}setAttribute(){}removeAttribute(){}focus(){}remove(){}load(){}pause(){}play(){return Promise.resolve();}}
 const document=new El();document.body=new El();document.activeElement=new El();document.createElement=()=>new El();
 const ctx=vm.createContext({document,console,setTimeout,clearTimeout});vm.runInContext(fs.readFileSync('character-story-player.js','utf8'),ctx);
 const promise=ctx.ExoduserCharacterStory.play({language});const video=document.body.children[0].children[0];
 assert.equal(video.src,'video/warrior_story_v23_clean.mp4?v=20261001-nemesia');
 const track=video.children.find(c=>c.kind==='subtitles');assert.ok(track);assert.equal(track.srclang,language);assert.equal(track.default,true);
 assert.equal(track.src,`video/subtitles/warrior_story_v23_${language}.vtt`);
 track.dispatchEvent(new Event('load'));assert.equal(track.track.mode,'showing');
 const body=fs.readFileSync(track.src,'utf8');const times=[...body.matchAll(/^(\d\d:\d\d:\d\d\.\d{3}) -->/gm)];assert.equal(times.length,22);
 if(language==='en')assert.doesNotMatch(body,/[가-힣]/);
 ctx.ExoduserCharacterStory.skip();assert.equal(await promise,true);
});

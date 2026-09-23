import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {languages} from '../tools/localization-catalog.mjs';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const cues=read('localization/warrior-story/cues.json');
const controls=read('localization/warrior-story/controls.json');
for(const code of languages)test(code+' film captions retain all22 timings, ending pause and translated controls',()=>{
 const rows=read('localization/warrior-story/'+code+'.json');assert.equal(rows.length,22);
 assert.equal(controls[code].length,5);
 for(const [i,row]of rows.entries()){
  assert.equal(row.id,cues[i].id);assert.equal(row.start,cues[i].start_s);assert.equal(row.end,cues[i].end_s);assert.ok(row.text.trim());
  if(code!=='ko')assert.doesNotMatch(row.text,/[가-힣�]/);
 }
 assert.equal(rows[20].end,91.395);assert.equal(rows[21].start,92.9);
 const body=fs.readFileSync('video/subtitles/warrior_story_v23_'+code+'.vtt','utf8');assert.equal((body.match(/ --> /g)||[]).length,22);
 class El extends EventTarget{constructor(){super();this.children=[];this.style={};this.track={mode:'disabled'};}append(...els){this.children.push(...els);}setAttribute(k,v){this[k]=v;}removeAttribute(){}focus(){}remove(){}load(){}pause(){}play(){return Promise.resolve();}}
 const document=new El();document.body=new El();document.activeElement=new El();document.createElement=()=>new El();
 const ctx=vm.createContext({document,setTimeout,clearTimeout,console});
 for(const file of ['localization-runtime.js','localization-data.js','character-story-player.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
 ctx.ExoduserCharacterStory.play({language:code});
 const overlay=document.body.children[0],video=overlay.children[0],track=video.children[0],ui=overlay.children[1];
 assert.equal(track.src,'video/subtitles/warrior_story_v23_'+code+'.vtt');assert.equal(overlay.dir,code==='ar'?'rtl':'ltr');
 assert.ok(ui.children[0].textContent.startsWith(controls[code][0]));assert.ok(ui.children[1].children[0].textContent.startsWith(controls[code][4]));
 ctx.ExoduserCharacterStory.skip();
});

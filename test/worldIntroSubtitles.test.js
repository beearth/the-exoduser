import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const languages='ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms'.split(' ');
function readData(){
 const file=new URL('../world-intro-subtitles-data.js',import.meta.url);
 assert.ok(existsSync(file),'all-language subtitle data must exist');
 const ctx={};vm.createContext(ctx);vm.runInContext(readFileSync(file,'utf8'),ctx);return ctx.WorldIntroSubtitleData;
}
test('all 29 languages contain all 32 semantic subtitle groups without placeholders',()=>{
 const d=readData();assert.deepEqual(Object.keys(d.languages).sort(),languages.sort());
 assert.equal(d.timings.length,32);
 assert.deepEqual(Array.from(new Set(d.sourceGroups.flat())),Array.from({length:38},(_,i)=>i+1));
 for(const [lang,lines] of Object.entries(d.languages)){
  assert.equal(lines.length,32,lang);
  lines.forEach((text,i)=>{assert.ok(typeof text==='string'&&text.trim(),`${lang}:${i}`);assert.doesNotMatch(text,/TODO|PLACEHOLDER|\ufffd/,`${lang}:${i}`);});
  if(!['ko','en'].includes(lang))assert.ok(lines.filter((s,i)=>s===d.languages.en[i]).length<3,`${lang} must not use English placeholders`);
 }
});
test('subtitle ranges preserve narration boundaries and leave the final title clear',()=>{
 const d=readData();d.timings.forEach(([s,e],i)=>{assert.ok(s<e);if(i)assert.ok(d.timings[i-1][1]<=s);assert.ok(e<113.291667);});
 assert.deepEqual(Array.from(d.timings[4]),[12.762,16.402]);
 assert.deepEqual(Array.from(d.timings[21]),[76.532,79.432]);
});
test('runtime uses clean movie and language-aware subtitle layer',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.includes('video/world_intro_v13_exodus_en.mp4'));
 assert.ok(html.includes('world-intro-subtitles.js'));
 assert.ok(html.includes('WorldIntroSubtitles.attach(movie)'));
 assert.ok(!html.includes('.world-intro-active #cinLang,'),'language choice remains visible');
});
test('closing narration names EXODUSER in the first-person plural',()=>{
 const d=readData();
 assert.equal(d.version,'v13');
 assert.equal(d.languages.ko.at(-2),'우리는 그들을…');
 assert.equal(d.languages.ko.at(-1),'엑소듀서라 부른다.');
 assert.equal(d.languages.en.at(-2),'We call them…');
 assert.equal(d.languages.en.at(-1),'Exoduser.');
 assert.equal(d.languages.en.at(-3),'Those who defy the fall.');
 assert.deepEqual(Array.from(d.timings.at(-2)),[106.020,109.292]);
 assert.deepEqual(Array.from(d.timings.at(-1)),[109.6,111.1]);
 assert.deepEqual(Array.from(d.sourceGroups.at(-1)),[38]);
 for(const lines of Object.values(d.languages))assert.doesNotMatch(lines.at(-2),/exoduser|엑소듀서|エクソデューサー/i,'name is not revealed before logo');
});

test('the escape beat names Exodus without moving the beat or Exoduser ending',()=>{
 const d=readData();
 assert.equal(d.languages.en[28],'Exodus.');
 assert.equal(d.languages.ko[28],'탈출.');
 assert.deepEqual(Array.from(d.timings[28]),[100.322,101.682]);
 assert.equal(d.languages.en[31],'Exoduser.');
});
test('only the mage subtitle moves to follow the three-second psychic shot',()=>{
 const d=readData();
 assert.deepEqual(Array.from(d.timings[24]),[84.972,87.252]);
 assert.deepEqual(Array.from(d.timings[25]),[87.889,89.729]);
 assert.deepEqual(Array.from(d.timings[26]),[90.902,93.622]);
});

test('cinema captions use double-size type and an elevated bottom anchor',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const controller=readFileSync(new URL('../world-intro-subtitles.js',import.meta.url),'utf8');
 assert.match(html,/#worldIntroVideo::cue\{[^}]*font-size:clamp\(32px,5\.4vh,50px\)/);
 assert.match(controller,/cue\.snapToLines=true;cue\.line=-3/);
 assert.match(controller,/cue\.position=50;cue\.positionAlign='center'/);
});
test('cinematic subtitles use ivory serif text with a transparent background and dark contour',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const style=html.match(/#worldIntroVideo::cue\{([^}]+)\}/)?.[1];
 assert.ok(style,'scoped native cue style exists');
 assert.match(style,/font-family:'Noto Serif','Noto Serif KR',serif/);
 assert.match(style,/font-weight:500/);
 assert.match(style,/color:#eee5d5/);
 assert.match(style,/background:transparent/);
 assert.match(style,/text-shadow:[^;]*1px 0 0[^;]*0 2px 4px[^;]*0 0 12px/);
 for(const [lang,font] of Object.entries({ja:'Noto Serif JP',zh:'Noto Serif SC',zht:'Noto Serif TC',ar:'Noto Naskh Arabic',th:'Noto Serif Thai'}))
  assert.ok(html.includes(`#worldIntroVideo[data-subtitle-language="${lang}"]::cue{font-family:'${font}'`),lang);
});
test('locale aliases cover Brazilian Portuguese, traditional Chinese and Norwegian',()=>{
 const ctx={WorldIntroSubtitleData:readData()};vm.createContext(ctx);
 vm.runInContext(readFileSync(new URL('../world-intro-subtitles.js',import.meta.url),'utf8'),ctx);
 const api=ctx.WorldIntroSubtitles;
 for(const [value,want] of Object.entries({'pt':'ptbr','pt-BR':'ptbr','zh-TW':'zht','zh-Hant-HK':'zht','zh-CN':'zh','nb-NO':'no','fr-CA':'fr'}))assert.equal(api.resolveLanguage(value),want);
 assert.equal(api.resolveLanguage('xx'),null);assert.equal(api.normalizeLanguage('xx'),'en');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/[{,]portuguese:'ptbr'/,'Steam Portuguese must use an existing subtitle option');
});
test('all SRT and WebVTT exports match the runtime translations and timings',()=>{
 const d=readData();
 const stamp=(t,sep)=>{const n=Math.round(t*1000);return [Math.floor(n/3600000),Math.floor(n/60000)%60,Math.floor(n/1000)%60].map(v=>String(v).padStart(2,'0')).join(':')+sep+String(n%1000).padStart(3,'0');};
 for(const [lang,lines] of Object.entries(d.languages))for(const [ext,sep] of [['srt',','],['vtt','.']]){
  const content=readFileSync(new URL(`../video/subtitles/world_intro_v6_${lang}.${ext}`,import.meta.url),'utf8').replaceAll('\r','');
  const expected=(ext==='vtt'?'WEBVTT\n\n':'')+lines.map((line,i)=>`${i+1}\n${stamp(d.timings[i][0],sep)} --> ${stamp(d.timings[i][1],sep)}\n${line}\n`).join('\n');
  assert.equal(content.trim(),expected.trim(),`${lang}.${ext}`);
 }
});

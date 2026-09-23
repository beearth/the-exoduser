import fs from 'node:fs';
import {languages} from './localization-catalog.mjs';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const cues=read('localization/warrior-story/cues.json');
const endings=read('localization/warrior-story/endings.json');
const controls=read('localization/warrior-story/controls.json');
const stamp=t=>new Date(Math.round(t*1000)).toISOString().slice(11,23);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const code of languages){
 if(!endings[code]||controls[code]?.length!==5)throw Error('Missing story strings '+code);
 const old=code==='ko'?{}:read('localization/character-story/'+code+'.json').prologue;
 const translated=cues.map(c=>{
  const text=c.id==='wa33a'?endings[code][0]:c.id==='wa33b'?endings[code][1]:code==='ko'?c.ko:code==='en'?c.en:old[c.id];
  if(typeof text!=='string'||!text.trim())throw Error('Missing '+code+' '+c.id);
  return {id:c.id,start:c.start_s,end:c.end_s,text};
 });
 fs.writeFileSync(`localization/warrior-story/${code}.json`,JSON.stringify(translated,null,2)+'\n');
 fs.writeFileSync(`video/subtitles/warrior_story_v23_${code}.vtt`,'WEBVTT\n\n'+translated.map(c=>`${c.id}\n${stamp(c.start)} --> ${stamp(c.end)}\n${escape(c.text)}\n`).join('\n'));
}
console.log('29 warrior subtitle tracks × 22 timed cues generated.');

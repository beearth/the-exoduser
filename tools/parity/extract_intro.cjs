// Bounded source literals only. No application execution.
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('godot/source_snapshot/game.html','utf8');
function literal(name){const start=source.indexOf('const '+name+'=');const end=source.indexOf('\n};',start)+3;return vm.runInNewContext('('+source.slice(start,end).split('=').slice(1).join('=').replace(/;$/,'')+')',{}, {timeout:1000});}
const lines=literal('INTRO_CUTSCENE_LINES');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),sandbox,{timeout:2000});
const loc=sandbox.ExoduserLocalizationData;
const speakers={GODDESS:{color:'#c084fc',label:'네메시아'},DIROY:{color:'#e8d4b8',label:'디로이'},HECTOR:{color:'#fb923c',label:'핵터'}};
for(const [lang,story] of Object.entries(loc?.stories||{})){
 if(story.intro) lines[lang]=lines.ko.map(x=>({...x,...(story.intro[x.id] ? {text:story.intro[x.id]}:{})}));
}
fs.writeFileSync('godot/data/parity_intro_source.json',JSON.stringify({source:'game.html:62746–63203',lines,speakers,localized_speakers:Object.fromEntries(Object.entries(loc?.stories||{}).map(([k,v])=>[k,v.speakers||{}]))},null,2)+'\n');
console.log('intro languages',Object.keys(lines));

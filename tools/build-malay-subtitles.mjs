import fs from 'node:fs';
import vm from 'node:vm';
const file='world-intro-subtitles-data.js',text=fs.readFileSync(file,'utf8');
const ctx=vm.createContext({});vm.runInContext(text,ctx);
const data=ctx.WorldIntroSubtitleData,lines=JSON.parse(fs.readFileSync('localization/world-intro-ms.json','utf8'));
if(lines.length!==data.timings.length)throw Error('Malay subtitle cue count differs');
const nl=text.includes('\r\n')?'\r\n':'\n';
if(!data.languages.ms){
 const at=text.lastIndexOf(nl+'  }');
 if(at<0)throw Error('Could not locate language object');
 const insert=','+nl+'    "ms": '+JSON.stringify(lines,null,2).replaceAll('\n',nl+'    ');
 fs.writeFileSync(file,text.slice(0,at).trimEnd()+insert+text.slice(at));
}else{
 const old='"ms": '+JSON.stringify(Array.from(data.languages.ms),null,2).replaceAll('\n',nl+'    ');
 const next='"ms": '+JSON.stringify(lines,null,2).replaceAll('\n',nl+'    ');
 if(!text.includes(old))throw Error('Malay subtitle formatting changed; inspect before replacing');
 fs.writeFileSync(file,text.replace(old,next));
}
const stamp=(t,sep)=>{const n=Math.round(t*1000);return [Math.floor(n/3600000),Math.floor(n/60000)%60,Math.floor(n/1000)%60].map(v=>String(v).padStart(2,'0')).join(':')+sep+String(n%1000).padStart(3,'0');};
for(const [ext,sep]of [['srt',','],['vtt','.']]){
 const content=(ext==='vtt'?'WEBVTT\n\n':'')+lines.map((line,i)=>`${i+1}\n${stamp(data.timings[i][0],sep)} --> ${stamp(data.timings[i][1],sep)}\n${line}\n`).join('\n');
 fs.writeFileSync('video/subtitles/world_intro_v6_ms.'+ext,content);
}
console.log('Malay: '+lines.length+' cues, runtime + SRT + WebVTT');

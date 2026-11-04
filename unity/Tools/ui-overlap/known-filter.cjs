// 11-04 CTO ratchet: only collisions that already existed on the desktop build (db26d55f6) may be listed as known.
// Streams overlap-report.json (one frame per line, can exceed 1 GB) and splits issues into known / unknown.
// Key = source files (no line numbers) + overlapping texts + page + language; line numbers in the list are reference only,
// so an unrelated edit above a listed line does not turn a known collision into a new one.
const fs=require('fs'),rl=require('readline');
function keyOf(frame,issue){
 const pair=[[String(issue.a.source||'').replace(/:\d+.*$/,''),issue.a.text],[String(issue.b.source||'').replace(/:\d+.*$/,''),issue.b.text]].sort((x,y)=>(x[0]+'\u0000'+x[1]).localeCompare(y[0]+'\u0000'+y[1]));
 return JSON.stringify({files:pair.map(p=>p[0]),texts:pair.map(p=>p[1]),page:frame.page,language:frame.language});
}
function entryKey(e){return JSON.stringify({files:e.files,texts:e.texts,page:e.page,language:e.language});}
function loadKnown(file){
 const list=JSON.parse(fs.readFileSync(file,'utf8').replace(/^﻿/,''));
 if(!Array.isArray(list.entries))throw new Error('known list has no entries');
 return {list,keys:new Set(list.entries.map(entryKey))};
}
async function filter(reportPath,knownPath){
 const {list,keys}=loadKnown(knownPath);let frames=0,issues=0,known=0;const unknown=new Map();
 const input=rl.createInterface({input:fs.createReadStream(reportPath),crlfDelay:Infinity});
 for await(let l of input){
  l=l.trim();if(!l.startsWith('{"schemaVersion'))continue;if(l.endsWith(','))l=l.slice(0,-1);const fr=JSON.parse(l);frames++;
  for(const i of fr.issues||[]){issues++;const k=keyOf(fr,i);if(keys.has(k)){known++;continue}
   const g=unknown.get(k)||{...JSON.parse(k),lines:[...new Set([String(i.a.source||'').split(' ')[0],String(i.b.source||'').split(' ')[0]])],count:0,sizes:[]};
   g.count++;const s=fr.width+'x'+fr.height;if(!g.sizes.includes(s))g.sizes.push(s);unknown.set(k,g);}
 }
 const unknownIssues=issues-known;
 return {frames,issues,knownIssues:known,unknownIssues,knownListEntries:list.entries.length,passed:frames>0&&unknownIssues===0,unknown:[...unknown.values()].sort((a,b)=>b.count-a.count).slice(0,50)};
}
module.exports={filter,keyOf,entryKey};
if(require.main===module){
 const [report,known,out]=process.argv.slice(2);
 filter(report,known).then(r=>{if(out)fs.writeFileSync(out,JSON.stringify(r,null,1));console.log(JSON.stringify({frames:r.frames,issues:r.issues,knownIssues:r.knownIssues,unknownIssues:r.unknownIssues,knownListEntries:r.knownListEntries,passed:r.passed}));process.exitCode=r.passed?0:1;})
  .catch(e=>{console.error(e.stack||String(e));process.exitCode=2;});
}

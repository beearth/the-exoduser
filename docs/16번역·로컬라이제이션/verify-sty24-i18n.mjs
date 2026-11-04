import fs from 'node:fs';
import cp from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const dir=path.dirname(fileURLToPath(import.meta.url));
export const git=(...a)=>cp.execFileSync('git',['-C',root,...a],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:50e6});
export const base='d80d1157e';
export const dataDir='unity/Assets/Exoduser/Resources/Data/';
export const files=git('diff','--name-only','349a9d7db',base,'--',dataDir).trim().split('\n');
export function rows(data,file){
 const out=[];
 if(file.endsWith('death_web.json'))return data.petLines.map(e=>({id:e.id+'/crow',code:'ko',text:e.crow})).concat(data.petLines.map(e=>({id:e.id+'/cat',code:'ko',text:e.cat})));
 if(data.codes){for(const e of data.entries)for(let i=0;i<data.codes.length;i++)out.push({id:e.key,code:data.codes[i],text:e.texts[i]});}
 else for(const e of data.entries){if(e.labels){for(const l of e.labels)out.push({id:l.key,code:e.code,text:l.text});}else for(const [k,v] of Object.entries(e)){if(k==='code')continue;if(Array.isArray(v))v.forEach((t,i)=>out.push({id:k+'/'+i,code:e.code,text:t}));else if(typeof v==='string')out.push({id:k,code:e.code,text:v});}}
 return out;
}
export function collect(){const targets=[];for(const file of files){
 const before=rows(JSON.parse(git('show','349a9d7db:'+file)),file),initial=rows(JSON.parse(git('show',base+':'+file)),file),current=rows(JSON.parse(fs.readFileSync(root+'/'+file,'utf8')),file);
 const prev=new Map(before.map(r=>[r.code+'|'+r.id,r.text]));
 const originalIds=new Set(initial.filter(r=>file.endsWith('visual_select_labels.json')||r.text!==prev.get(r.code+'|'+r.id)).map(r=>r.id));
 const init=new Map(initial.map(r=>[r.code+'|'+r.id,r.text]));
 const ids=new Set([...originalIds,...current.filter(r=>r.text!==init.get(r.code+'|'+r.id)).map(r=>r.id)]);
 for(const id of ids){const rr=current.filter(r=>r.id===id);targets.push({file:path.basename(file),id,original:originalIds.has(id),values:Object.fromEntries(rr.map(r=>[r.code,r.text]))});}
 }return targets;}
export const tokens=s=>(s.match(/\{(?:\d+|[A-Za-z_]\w*)(?:[^{}]*)\}|%(?:\d+\$)?[-+0 #]*\d*(?:\.\d+)?[sdif]|<\/?[a-zA-Z][^>]*>/g)||[]).sort();
export function run(){const targets=collect(),errors=[],risks=[];const codes=JSON.parse(fs.readFileSync(root+'/'+dataDir+'demo_text.json','utf8')).codes;
 const parsedFiles=[];
 for(const file of files){
  const before=JSON.parse(git('show',base+':'+file)),current=JSON.parse(fs.readFileSync(root+'/'+file,'utf8'));
  parsedFiles.push(path.basename(file));
  const initial=rows(before,file),now=rows(current,file);
  if(JSON.stringify(initial.map(r=>[r.code,r.id]))!==JSON.stringify(now.map(r=>[r.code,r.id])))errors.push({file,code:'all',type:'row-structure'});
  if(JSON.stringify(initial.filter(r=>r.code==='ko'))!==JSON.stringify(now.filter(r=>r.code==='ko')))errors.push({file,code:'ko',type:'ko-mutation'});
  if(current.entries&&!current.codes){const languageRows=current.entries.map(e=>e.code);if(languageRows.length!==29||new Set(languageRows).size!==29||languageRows.some(c=>!codes.includes(c)))errors.push({file,code:'all',type:'language-set'});}
  if(file.endsWith('visual_select_labels.json'))for(const e of current.entries)if(e.labels.length!==65||new Set(e.labels.map(l=>l.key)).size!==65)errors.push({file,code:e.code,type:'label-count/duplicate'});
 }
 const segmenter=new Intl.Segmenter('und',{granularity:'grapheme'});
 for(const t of targets){const ko=t.values.ko,en=t.values.en;if(t.file==='death_web.json')continue;
  for(const code of codes){const text=t.values[code],err=type=>errors.push({file:t.file,id:t.id,code,type,text});
   if(typeof text!=='string'||!text.trim()){err('empty');continue;}
   if(code!=='ko'&&/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7a3]/u.test(text))err('ko-copy');
   if(JSON.stringify(tokens(text))!==JSON.stringify(tokens(ko)))err('placeholder/tag');
   if((text.match(/\n/g)||[]).length!==(ko.match(/\n/g)||[]).length)err('newline');
   if((text.match(/^\s*/u)[0]!==ko.match(/^\s*/u)[0])||(text.match(/\s*$/u)[0]!==ko.match(/\s*$/u)[0]))err('boundary-space');
   if(/[\ufffd\ud800-\udfff]/u.test(text))err('unicode');
   if(/[\u202a-\u202e\u2066-\u2069]/u.test(text))err('bidi-control');
   if([...segmenter.segment(text)].some(g=>/^\p{M}+$/u.test(g.segment)))err('detached-mark');
   if(code!=='en'&&code!=='ko'&&en&&[...text].length>[...en].length*1.4)risks.push({file:t.file,id:t.id,code,ratio:([...text].length/[...en].length).toFixed(2),enLength:[...en].length,length:[...text].length,text});
  }
 }
 const result={codes,parsedFiles,keys:targets.length,originalKeys:targets.filter(t=>t.original).length,localizedKeys:targets.filter(t=>t.file!=='death_web.json').length,values:targets.reduce((n,t)=>n+Object.keys(t.values).length,0),errors,risks,targets};
 const out=process.argv.find(a=>a.startsWith('--out=')); if(out)fs.writeFileSync(out.slice(6),JSON.stringify(result,null,2));
 console.log(JSON.stringify({keys:result.keys,localizedKeys:result.localizedKeys,values:result.values,errors:errors.length,risks:risks.length}));
 for(const e of errors)console.log(JSON.stringify(e)); if(errors.length)process.exitCode=1;
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(fileURLToPath(import.meta.url)))run();

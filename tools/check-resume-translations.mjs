import fs from 'node:fs';
import {languages} from './localization-catalog.mjs';
const source=JSON.parse(fs.readFileSync('localization/resume-source.json','utf8'));
const keys=source.map(r=>r.key).sort(),errors=[],rows=[];
const tokens=s=>[...s.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort().join('|');
for(const code of languages.filter(c=>c!=='ko'&&c!=='en')){
 const file='localization/resume/'+code+'.json';if(!fs.existsSync(file)){if(process.argv.includes('--complete'))errors.push(code+': missing file');continue;}
 const data=JSON.parse(fs.readFileSync(file,'utf8'));
 if(JSON.stringify(Object.keys(data).sort())!==JSON.stringify(keys))errors.push(code+': key mismatch');
 for(const {key,en}of source){
  const v=data[key];if(typeof v!=='string'||!v.trim()){errors.push(code+': empty '+key);continue;}
  if(tokens(v)!==tokens(en))errors.push(code+': tokens '+key);
  if((v.match(/<br>/g)||[]).length!==(en.match(/<br>/g)||[]).length)errors.push(code+': line breaks '+key);
  if(/[가-힣�]/.test(v))errors.push(code+': untranslated/corrupt '+key);
  if(en.length>25&&v.trim()===en.trim())errors.push(code+': English copy '+key);
 }
 rows.push({code,count:Object.keys(data).length});
}
console.log(JSON.stringify({expectedLocales:27,completedLocales:rows.length,rows,errors},null,2));
if(errors.length)process.exitCode=1;

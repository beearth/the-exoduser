import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {languages} from '../tools/localization-catalog.mjs';
const rows=JSON.parse(fs.readFileSync('localization/resume-source.json','utf8'));
const tokens=s=>[...s.matchAll(/\{[a-zA-Z]\w*\}/g)].map(m=>m[0]).sort();
for(const code of languages.filter(c=>!['ko','en'].includes(c)))test(code+' has every resumed UI string and preserves runtime tokens',()=>{
 const data=JSON.parse(fs.readFileSync('localization/resume/'+code+'.json','utf8'));
 assert.deepEqual(Object.keys(data).sort(),rows.map(r=>r.key).sort());
 for(const {key,en}of rows){
  const value=data[key];assert.equal(typeof value,'string',key);assert.ok(value.trim(),key);
  assert.deepEqual(tokens(value),tokens(en),key);
  assert.equal((value.match(/<br>/g)||[]).length,(en.match(/<br>/g)||[]).length,key);
  assert.doesNotMatch(value,/[가-힣�]/,key);
  if(en.trim().length>25&&/[a-z]{3}/i.test(en))assert.notEqual(value.trim(),en.trim(),'English fallback: '+key);
 }
});

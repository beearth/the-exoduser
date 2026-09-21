import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {collect} from '../tools/localization-catalog.mjs';
test('every tutorial registry row matches the live source and preserves dynamic values',()=>{
 const rows=JSON.parse(fs.readFileSync('localization/tutorial-source.json','utf8'));
 const catalogs=new Map(['parry-lesson.js','resource-practice.js'].map(file=>[file,collect(file)]));
 for(const {file,key,en} of rows){
  assert.equal(catalogs.get(file).pairs.get(key),en,key);
  const tokens=s=>[...s.matchAll(/\{p\d+\}/g)].map(m=>m[0]).sort();
  assert.deepEqual(tokens(en),tokens(key),key);
  assert.doesNotMatch(en,/[가-힣]/,key);
 }
 assert.equal(rows.length,170);
});

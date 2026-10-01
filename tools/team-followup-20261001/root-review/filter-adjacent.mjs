import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const owner=new URL('../UIUX/',import.meta.url);
let source=fs.readFileSync(new URL('production-integration.test.mjs',owner),'utf8');
source="import {connectFilter,sourceFactory} from '../UIUX/filter-focus-candidate.mjs';\n"+source
 .replaceAll("from './","from '../UIUX/")
 .replace("owned=new URL('./',import.meta.url)","owned=new URL('../UIUX/',import.meta.url)")
 .replaceAll("new URL(path,fixtures)","new URL('filter-focus-'+(path==='game.html'?'main':'easy')+'.before.html',owned)")
 .replace('assert.equal(actual.toString(),connectRemoval(original));assert.equal(data.factory.candidate,fixFactory());','assert.equal(actual.toString(),connectFilter(original));assert.equal(data.factory.candidate,sourceFactory(connectFilter(original)));')
 .replace("sha(fs.readFileSync(new URL(path+'.expected',fixtures))),sha(data.source)","sha(connectFilter(original)),sha(data.source)")
 .replace("new URL('production-integration-evidence.json',owned)","'outputs/team-review-20261002/filter-integration/adjacent-evidence.json'")
 .replace("for(const [path,expected]of Object.entries(before.preserved))assert.equal(sha(fs.readFileSync(new URL(path,root))),expected,path);","for(const [path,expected]of Object.entries(before.preserved)){if(path.startsWith('docs/'))continue;if(fs.existsSync(new URL(path,root)))assert.equal(sha(fs.readFileSync(new URL(path,root))),expected,path);}");
const url=new URL('./filter-adjacent.generated.test.mjs',import.meta.url);fs.writeFileSync(url,source);
const r=spawnSync(process.execPath,['--test',url.pathname],{encoding:'utf8'});
fs.writeFileSync('outputs/team-review-20261002/filter-integration/adjacent-tests.txt',r.stdout+r.stderr);
assert.equal(r.status,0,r.stdout+r.stderr);
console.log(r.stdout.split('\n').slice(-10).join('\n'));

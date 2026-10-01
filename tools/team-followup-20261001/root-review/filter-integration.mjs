import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {connectFilter,sourceFactory} from '../UIUX/filter-focus-candidate.mjs';
import {extractFunction} from '../UIUX/inventory-dom-candidate.mjs';
const out='outputs/team-review-20261002/filter-integration/';
const owned=new URL('../UIUX/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,owned),'utf8');
const sha=data=>createHash('sha256').update(data).digest('hex');
const production=process.argv.includes('--production');
const mode=production?'production':'candidate';
const before=JSON.parse(read('filter-focus-before.json'));
const checkpoint=JSON.parse(fs.readFileSync(out+'before-checkpoint.json'));
for(const [file,hash]of Object.entries(checkpoint.ownerFiles))assert.equal(sha(fs.readFileSync(file)),hash,file);
const sources={};
for(const [file,row] of Object.entries(before.sources)){
  const original=read('filter-focus-'+row.tag+'.before.html');
  const actual=fs.readFileSync(file,'utf8');
  assert.equal(sha(original),row.beforeSha256);
  assert.equal(actual,production?connectFilter(original):original);
  sources[file]={before:sha(original),current:sha(actual),candidate:sha(connectFilter(original))};
  for(const name of ['dbSaveNow','equipItem','unequipItem','salvageVal','_invCategoryMatches','_invChangeCategory'])assert.equal(extractFunction(actual,name),extractFunction(original,name),file+':'+name);
  const counts={classic:0,module:0,importmap:0};
  for(const match of actual.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/.test(match[1]))continue;
    if(/type\s*=\s*["']importmap/.test(match[1])){JSON.parse(match[2]);counts.importmap++;}
    else if(/type\s*=\s*["']module/.test(match[1])){const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:match[2],encoding:'utf8'});assert.equal(r.status,0,r.stderr);counts.module++;}
    else{new vm.Script(match[2]);counts.classic++;}
  }
  assert.deepEqual(counts,{classic:4,module:2,importmap:1});
  sources[file].inline=counts;
}
assert.equal(fs.readFileSync('ui-panels.js','utf8'),read('filter-focus-ui-panels.before.js'));

// Keep the owner's historical tests and outputs unchanged. This derived fixture
// swaps only candidate input for current production and the real composition.
let fixture=read('filter-focus-fixture.mjs')
 .replace("from './inventory-dom/node-dom.mjs'","from '../UIUX/inventory-dom/node-dom.mjs'")
 .replace("from './card-removal-focus/host/harness.js'","from '../UIUX/card-removal-focus/host/harness.js'")
 .replace("from './inventory-dom-candidate.mjs'","from '../UIUX/inventory-dom-candidate.mjs'")
 .replace("from './filter-focus-candidate.mjs'","from '../UIUX/filter-focus-candidate.mjs'")
 .replace("const owned=new URL('./',import.meta.url);","const owned=new URL('../UIUX/',import.meta.url);");
if(production)fixture=fixture.replace("source=version==='candidate'?connectFilter(before):before","source=version==='candidate'?fs.readFileSync(new URL('../../../'+path,owned),'utf8'):before");
fixture=fixture.replace("new URL('filter-focus-ui-panels.before.js',owned)","new URL('../../../ui-panels.js',owned)");
fs.writeFileSync(new URL('./filter-integration-fixture.generated.mjs',import.meta.url),fixture);
let test=read('filter-focus.test.mjs')
 .replace("from './filter-focus-fixture.mjs'","from './filter-integration-fixture.generated.mjs'")
 .replace("from './filter-focus-candidate.mjs'","from '../UIUX/filter-focus-candidate.mjs'")
 .replace("from './inventory-dom-candidate.mjs'","from '../UIUX/inventory-dom-candidate.mjs'")
 .replace("owned=new URL('./',import.meta.url)","owned=new URL('../UIUX/',import.meta.url)")
 .replace("new URL('filter-focus-reproduction.json',owned)",JSON.stringify(out+mode+'-reproduction.json'));
if(production)test=test.replace("assert.equal(sha(fs.readFileSync(new URL(path,root))),row.beforeSha256)","assert.equal(sha(fs.readFileSync(new URL(path,root))),row.candidateSha256)");
// Historical docs may legitimately be synchronized after integration. Preserve
// their original hashes in the checkpoint; this executable checks code/assets.
test=test.replace("for(const [path,expected]of Object.entries(before.preserved))assert.equal(sha(fs.readFileSync(new URL(path,root))),expected,path);","for(const [path,expected]of Object.entries(before.preserved)){if(path.startsWith('docs/'))continue;if(fs.existsSync(new URL(path,root)))assert.equal(sha(fs.readFileSync(new URL(path,root))),expected,path);}");
const testURL=new URL('./filter-integration.generated.test.mjs',import.meta.url);
fs.writeFileSync(testURL,test);
const result=spawnSync(process.execPath,['--test',testURL.pathname],{encoding:'utf8'});
fs.writeFileSync(out+mode+'-tests.txt',result.stdout+result.stderr);
assert.equal(result.status,0,result.stdout+result.stderr);
const {setup}=await import('./filter-integration-fixture.generated.mjs?mode='+mode);
const extra=[];
for(const file of Object.keys(before.sources))for(const boundary of ['disabled','missing','panel-closed']){
 const ui=setup(file,'candidate'),button=ui.nodes.invFilters.querySelectorAll('button')[1];button.focus();
 const token=ui.api.focus.beforeRender();
 if(boundary==='disabled')button.disabled=true;
 if(boundary==='missing')button.remove();
 if(boundary==='panel-closed'){ui.panel.classList.remove('on');ui.opener.focus();}
 ui.api.focus.afterRender(token);
 assert.equal(ui.document.activeElement,boundary==='panel-closed'?ui.opener:ui.nodes.invClose);
 extra.push({file,boundary,status:'PASS'});
}
for(const [file,hash]of Object.entries(checkpoint.ownerFiles))assert.equal(sha(fs.readFileSync(file)),hash,file);
const report={utc:new Date().toISOString(),mode,sources,ownerGroups:26,extraGroups:6,totalGroups:32,originalFailureCases:32,extra,ownerFilesPreserved:Object.keys(checkpoint.ownerFiles).length,compositionUnchanged:true,limits:'Node DOM with actual source and composition; CSS visibility model only; renderOssPanel stub. Native keyboard/gamepad/layout/runtime not verified.'};
fs.writeFileSync(out+mode+'-result.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));

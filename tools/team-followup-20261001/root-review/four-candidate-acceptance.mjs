import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';
import {applyCandidate as inm, matchesIfNoneMatch} from '../BUILD/inm-matching-candidate.mjs';
import {connectOssuary} from '../UIUX/ossuary-focus-candidate.mjs';
import {extractFunction} from '../UIUX/inventory-dom-candidate.mjs';
const out='outputs/team-review-20261002/four-candidate-acceptance/';
const mode=process.argv[2],production=process.argv.includes('--production');
const sha=x=>createHash('sha256').update(x).digest('hex');
const owners=JSON.parse(fs.readFileSync(out+'owner-preservation.json'));
const verifyOwners=()=>{for(const [path,hash]of Object.entries(owners))assert.equal(sha(fs.readFileSync(path)),hash,path);};
verifyOwners();
function generated(name,text,test=false){
 const file=new URL('./four-'+name+'.generated.mjs',import.meta.url);fs.writeFileSync(file,text);
 const r=spawnSync(process.execPath,[...(test?['--test']:[]),file.pathname],{encoding:'utf8',maxBuffer:16*1024*1024});
 fs.writeFileSync(out+name+(production?'-production':'-candidate')+'.txt',r.stdout+r.stderr);
 assert.equal(r.status,0,r.stdout+r.stderr);
}
const read=path=>fs.readFileSync(path,'utf8');
if(mode==='server'){
 const original=read(out+'server.cjs.before'),current=read('server.cjs');
 assert.equal(current,production?inm(original):original);
 const candidate=production?current:inm(original);
 parse(candidate,{ecmaVersion:'latest'});
 const helper=parse(candidate,{ecmaVersion:'latest'}).body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='matchesIfNoneMatch');
 assert.equal(candidate.slice(helper.start,helper.end),matchesIfNoneMatch.toString());
 let test=read('tools/team-followup-20261001/BUILD/inm-matching-test.mjs')
  .replace("from './inm-matching-candidate.mjs'","from '../BUILD/inm-matching-candidate.mjs'")
  .replace("prefix='tools/team-followup-20261001/BUILD/inm-matching-'","prefix='"+out+"inm-"+(production?'production':'candidate')+"-'")
  .replace("source=fs.readFileSync('server.cjs','utf8'),candidate=applyCandidate(source)","source=fs.readFileSync('"+out+"server.cjs.before','utf8'),candidate="+(production?"fs.readFileSync('server.cjs','utf8')":"applyCandidate(source)"))
  .replace("assert.equal(hash(fs.readFileSync('server.cjs')),hash(source))","assert.equal(hash(fs.readFileSync('server.cjs')),hash("+(production?'candidate':'source')+"))");
 generated('inm40',test);
 if(production){
  let conditional=read('tools/team-followup-20261001/BUILD/conditional-range-test.mjs')
   .replace("from './conditional-range-candidate.mjs'","from '../BUILD/conditional-range-candidate.mjs'")
   .replace("prefix='tools/team-followup-20261001/BUILD/conditional-range-'","prefix='"+out+"conditional-'")
   .replace("source=fs.readFileSync('server.cjs','utf8'),candidate=applyCandidate(source)","source=fs.readFileSync('outputs/team-review-20261002/conditional-integration/conditional-before.cjs','utf8'),candidate=fs.readFileSync('server.cjs','utf8')")
   .replace("vm.runInNewContext('(async()=>{'","vm.runInNewContext(matchesIfNoneMatch.toString()+'\\n(async()=>{'")
   .replace('assert.equal(outsideBefore,outsideAfter)',"assert.equal(outsideBefore,outsideAfter.replace(matchesIfNoneMatch.toString()+'\\n\\n',''))")
   .replace("assert.equal(hash(fs.readFileSync('server.cjs')),hash(source))","assert.equal(hash(fs.readFileSync('server.cjs')),hash(candidate))");
  generated('conditional31',"import {matchesIfNoneMatch} from '../BUILD/inm-matching-candidate.mjs';\n"+conditional);
  let saved=read('tools/team-followup-20261001/root-review/server-integration-save.generated.mjs');
  const ast=parse(current,{ecmaVersion:'latest'}),fn=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='atomicSaveJSON');
  const oldAst=parse(original,{ecmaVersion:'latest'}),oldFn=oldAst.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='atomicSaveJSON');
  assert.equal(current.slice(fn.start,fn.end),original.slice(oldFn.start,oldFn.end));
  saved=saved.replace(/fs\.writeFileSync\((['"])[^'"]*save-evidence\.json\1/g,'fs.writeFileSync('+JSON.stringify(out+'save-evidence.json'));
  generated('save13',saved);
 }
 fs.writeFileSync(out+'server-'+(production?'production':'candidate')+'-acceptance.json',JSON.stringify({at:new Date().toISOString(),before:sha(original),candidate:sha(candidate),current:sha(current),inmGroups:40,conditionalGroups:production?31:0,saveGroups:production?13:0,exactCandidate:true,limits:'Source VM/stream doubles only; no HTTP/server/runtime. Existing conservative If-Range policy unchanged.'},null,2)+'\n');
}else if(mode==='ui'){
 const sources={};
 for(const file of ['game.html','game-easy-test.html']){
  const before=read(out+file+'.before'),actual=read(file),candidate=connectOssuary(before);
  assert.equal(actual,production?candidate:before,file);
  for(const name of ['dbSaveNow','equipItem','unequipItem','withdrawBonePart','mkBonePart','registerBonePart','_boneRegister','_invChangeCategory'])assert.equal(extractFunction(before,name),extractFunction(candidate,name),name);
  let classic=0,module=0,importmap=0;
  for(const match of (production?actual:candidate).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
   if(/\bsrc\s*=/.test(match[1]))continue;
   if(/type\s*=\s*["']importmap/.test(match[1])){JSON.parse(match[2]);importmap++;}
   else if(/type\s*=\s*["']module/.test(match[1])){const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:match[2],encoding:'utf8'});assert.equal(r.status,0,r.stderr);module++;}
   else{new vm.Script(match[2]);classic++;}
  }
  assert.deepEqual({classic,module,importmap},{classic:4,module:2,importmap:1});
  sources[file]={before:sha(before),candidate:sha(candidate),actual:sha(actual)};
 }
 assert.equal(read('ui-panels.js'),read(out+'ui-panels.js.before'));
 let fixture=read('tools/team-followup-20261001/UIUX/ossuary-focus-fixture.mjs')
  .replaceAll("from './","from '../UIUX/")
  .replace("const owned=new URL('./',import.meta.url);","const owned=new URL('../UIUX/',import.meta.url);");
 if(production)fixture=fixture.replace("source=transform(fs.readFileSync(new URL('ossuary-focus-'+tag+'.before.html',owned),'utf8'))","source=transform.name==='connectOssuary'?fs.readFileSync(path,'utf8'):fs.readFileSync(new URL('ossuary-focus-'+tag+'.before.html',owned),'utf8')");
 fixture=fixture.replace("new URL('ossuary-focus-ui-panels.before.js',owned)","'ui-panels.js'");
 fs.writeFileSync(new URL('./four-ossuary-fixture.generated.mjs',import.meta.url),fixture);
 let test=read('tools/team-followup-20261001/UIUX/ossuary-focus.test.mjs')
  .replace("from './ossuary-focus-fixture.mjs'","from './four-ossuary-fixture.generated.mjs'")
  .replace("from './ossuary-focus-candidate.mjs'","from '../UIUX/ossuary-focus-candidate.mjs'")
  .replace("from './inventory-dom-candidate.mjs'","from '../UIUX/inventory-dom-candidate.mjs'")
  .replace("owned=new URL('./',import.meta.url)","owned=new URL('../UIUX/',import.meta.url)");
 const tail=test.indexOf("test('미적용 patch");
 assert(tail>0);test=test.slice(0,tail)+"test('root exact candidate and owned bytes',()=>{const manifest=JSON.parse(fs.readFileSync('"+out+"owner-preservation.json'));for(const [file,hash]of Object.entries(manifest))assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);});\ntest.after(()=>fs.writeFileSync('"+out+"ossuary-"+(production?'production':'candidate')+"-reproduction.json',JSON.stringify({evidence},null,2)+'\\n'));\n";
 generated('ossuary34',test,true);
 fs.writeFileSync(out+'ui-'+(production?'production':'candidate')+'-acceptance.json',JSON.stringify({at:new Date().toISOString(),sources,groups:34,limits:'Actual source with Node DOM retain/blur models; native keys/gamepad/pixels/runtime and real saves unverified.'},null,2)+'\n');
}else throw Error('mode must be server or ui');
verifyOwners();
console.log(JSON.stringify({mode,production,ownersPreserved:Object.keys(owners).length,status:'PASS'}));

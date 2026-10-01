import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {parseExpressionAt} from 'acorn';
import vm from 'node:vm';
import {generateBrowserHost} from './browser-host-transform.mjs';
import {createMkItemFixture} from './browser-host/mk-item-fixture.js';
import {createD10PersistenceIntegration} from './browser-host/persistence-integration-port.js';
import {createHostPortFactory,initializeReviewHost,verifyHTTP} from './browser-host/host.js';

const protectedFiles=['game.html','server.cjs','unique-item-project/definitions.js','unique-item-project/roll-values.js',
  ...['persistence-integration-port.mjs','binding-ports.mjs','binding-d10.mjs','d10-consumer.mjs','browser-bootstrap-api.js','browser-bootstrap-ui.js'].map(name=>'tools/team-followup-20261001/ITEM/'+name)];
const original=new Map(protectedFiles.map(file=>[file,fs.readFileSync(file)]));
const rows=[];
async function check(name,action){await action();rows.push({name,status:'PASS'});}
const root='tools/team-followup-20261001/ITEM/browser-host/';
const generated=generateBrowserHost();
const savedManifest=JSON.parse(fs.readFileSync(root+'manifest.json','utf8'));
await check('변환 재실행/원문역치환·JS산출 byte동일',()=>{for(const [file,source] of Object.entries(generated.files))if(file.endsWith('.js'))assert.equal(fs.readFileSync(file,'utf8'),source);const saved=structuredClone(savedManifest),current=structuredClone(generated.manifest);delete saved.sourceGame.sha256;delete current.sourceGame.sha256;assert.deepEqual(saved,current);assert.equal(generated.manifest.modules.length,4);assert(generated.manifest.modules.every(module=>module.reverseImportEditsExact));});
await check('실제 mkItem 의존/원함수 추출과 fixture 제한',()=>{assert.equal(generated.manifest.extraction.length,11);assert.equal(generated.manifest.sourceGame.wholeHTMLExecuted,false);assert.throws(()=>createMkItemFixture({random:()=>.5})('weapon',0,0,0));});
await check('JS 전이 MIME 소스검사',()=>{const source=fs.readFileSync('server.cjs','utf8'),start=source.indexOf('const MIME = ')+'const MIME = '.length;const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;const mime=vm.runInNewContext('('+source.slice(start,end)+')');assert.equal(mime['.js'],'application/javascript');assert.equal(mime['.mjs'],undefined);assert(generated.manifest.httpChecks.every(entry=>entry.url.endsWith('.js')));});
const counters={base:0,d10:0,restoreCalls:0,restoreRng:0};
const mkItem=createMkItemFixture({random:()=>{counters.base++;return .5;}});
const real=createHostPortFactory(createD10PersistenceIntegration,counters,()=>{})({mkItem,rng:()=>{counters.d10++;return .5;}});
const request={proposalOnly:true,uniqueId:'UI-10',tier:1,element:0,baseRarity:2};
await check('생성 D10 정확1/base별도·전체 JSON/이름/affixes/소켓 보존',()=>{const item=real.createReview(request);assert.equal(counters.d10,1);assert(counters.base>1);assert(item.affixes.length>0);assert(item.socketCount>0);const before={...counters},loaded=JSON.parse(JSON.stringify(real.serializeItem(item)));assert.equal(real.restoreItem(loaded),loaded);assert.equal(real.readItem(loaded).stored,.15);assert.deepEqual(loaded,item);assert.equal(counters.base,before.base);assert.equal(counters.d10,before.d10);assert.equal(counters.restoreRng,0);assert.equal(real.consumer.begin({rage:100},{armor:loaded}),null);});
await check('legacy/missing/invalid 수리/재롤0',()=>{const before={...counters};for(const item of [{slot:'armor'},{slot:'armor',uniqueId:'UI-10'},{slot:'armor',uniqueId:'UI-10',uniqueRoll:{version:2}}]){const snapshot=structuredClone(item);assert.notEqual(real.readItem(real.restoreItem(item)).kind,'proposal');assert.deepEqual(item,snapshot);}assert.equal(counters.base,before.base);assert.equal(counters.d10,before.d10);});
function dom(){
  const createElement=tag=>({tag,parentNode:null,children:[],listeners:new Map(),textContent:'',disabled:false,checked:false,
    addEventListener(kind,listener){this.listeners.set(kind,listener);},removeEventListener(kind,listener){if(this.listeners.get(kind)===listener)this.listeners.delete(kind);},
    appendChild(node){node.parentNode=this;this.children.push(node);},removeChild(node){this.children.splice(this.children.indexOf(node),1);node.parentNode=null;},
    async click(){return this.listeners.get('click')?.();}});
  const nodes=Object.fromEntries(['status','counts','errors','install','uninstall','opt-in','review'].map(id=>[id,createElement(id)]));
  const host={listeners:new Map(),addEventListener(kind,listener){this.listeners.set(kind,listener);}};
  return {nodes,host,document:{createElement,getElementById:id=>nodes[id]}};
}
const fetchGood=async url=>url==='./manifest.json'?{ok:true,status:200,json:async()=>generated.manifest}:{ok:true,status:200,headers:{get:()=> 'application/javascript'}};
await check('HTTP 오류/비JS MIME은 읽을수있는 실패',async()=>{await assert.rejects(verifyHTTP(async()=>({ok:false,status:404})),/manifest HTTP 404/);await assert.rejects(verifyHTTP(async url=>url==='./manifest.json'?fetchGood(url):{ok:true,status:200,headers:{get:()=> 'application/octet-stream'}}),/전이 HTTP\/MIME 오류/);});
await check('HTML CSP·외부JS·자동포트 설치없음',()=>{const html=fs.readFileSync(root+'index.html','utf8');assert(html.includes("script-src 'self'"));assert(html.includes('src="./host.js"'));assert(!html.includes('src="/game.html'));assert(!html.includes('onclick='));});
await check('호스트 init/opt-in없는 클릭 생성·import0',async()=>{const fixture=dom();let fetched=0;const state=initializeReviewHost(fixture.document,fixture.host,async()=>{fetched++;throw Error('unexpected');});assert.equal(state.counters.base,0);assert(!Object.hasOwn(fixture.host,'_d10PersistenceReviewPort'));await fixture.nodes.install.click();assert.equal(fetched,0);assert.match(fixture.nodes.errors.textContent,/opt-in/);});
await check('실제 .js 체인 Node import·설치→신규→JSON→해제 UI',async()=>{const fixture=dom();Object.defineProperty(fixture.host,'_d10PersistenceReviewPort',{value:17,configurable:true,writable:false});const before=Object.getOwnPropertyDescriptor(fixture.host,'_d10PersistenceReviewPort');const state=initializeReviewHost(fixture.document,fixture.host,fetchGood);fixture.nodes['opt-in'].checked=true;await fixture.nodes.install.click();assert.equal(fixture.nodes.review.children.length,3);assert.equal(state.counters.d10,0);await fixture.nodes.review.children[0].click();assert.equal(state.counters.d10,1);const baseBefore=state.counters.base;await fixture.nodes.review.children[1].click();assert.equal(state.counters.base,baseBefore);assert.equal(state.counters.d10,1);assert.equal(state.counters.restoreRng,0);assert.match(fixture.nodes.review.children[2].textContent,/JSON 복원 proposal/);await fixture.nodes.install.click();assert.match(fixture.nodes.errors.textContent,/중복/);await fixture.nodes.uninstall.click();assert.equal(fixture.nodes.review.children.length,0);assert.deepEqual(Object.getOwnPropertyDescriptor(fixture.host,'_d10PersistenceReviewPort'),before);});
await check('호스트 import전 HTTP실패 property설치0/CSP표시',async()=>{const fixture=dom();initializeReviewHost(fixture.document,fixture.host,async()=>({ok:false,status:404}));fixture.nodes['opt-in'].checked=true;await fixture.nodes.install.click();assert.match(fixture.nodes.errors.textContent,/HTTP 404/);assert(!Object.hasOwn(fixture.host,'_d10PersistenceReviewPort'));fixture.host.listeners.get('securitypolicyviolation')({violatedDirective:'script-src',blockedURI:'fixture'});assert.match(fixture.nodes.errors.textContent,/CSP script-src/);});
await check('해제 타property보호',async()=>{const fixture=dom();initializeReviewHost(fixture.document,fixture.host,fetchGood);fixture.nodes['opt-in'].checked=true;await fixture.nodes.install.click();fixture.host._d10PersistenceReviewPort='foreign';await fixture.nodes.uninstall.click();assert.equal(fixture.host._d10PersistenceReviewPort,'foreign');});
await check('원본 byte 보존',()=>{for(const [file,bytes] of original)assert(fs.readFileSync(file).equals(bytes));});
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
process.stdout.write(JSON.stringify({checkedAt:new Date().toISOString(),pass:rows.length,fail:0,rows,
  protectedSources:Object.fromEntries([...original].map(([file,bytes])=>[file,hash(bytes)])),manifest:generated.manifest,
  sourceDrift:{initialGameSha:savedManifest.sourceGame.sha256,currentGameSha:generated.manifest.sourceGame.sha256,extractedFragmentsExact:true},
  counters,actualBrowserImport:'UNKNOWN',actualHTTP:'UNKNOWN: fixture responses only',NodeJSChainImport:'PASS',productionApplied:false},null,2)+'\n');

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {extract} from './binding-save-harness.mjs';
import {initializeReviewHost} from './browser-host/host.js';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,owned),'utf8');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const before=JSON.parse(read('browser-csp-cause-before.json'));
const oldHost=before.find(entry=>entry.file.endsWith('/host.js')).text;
const oldHTML=before.find(entry=>entry.file.endsWith('/index.html')).text;
const currentHost=read('browser-host/host.js'),currentHTML=read('browser-host/index.html'),startup=read('browser-host/csp-startup.js');
const rootRawPath='outputs/team-review-20261002/acceptance/item-browser.json';
const rootRawText=fs.readFileSync(new URL(rootRawPath,root),'utf8'),rootRaw=JSON.parse(rootRawText);
const rawFixture=Object.freeze({documentURI:'http://fixture.local/host',referrer:'',blockedURI:'inline',violatedDirective:'style-src-elem',effectiveDirective:'style-src-elem',originalPolicy:"default-src 'none'; script-src 'self'; style-src 'self'",sourceFile:'http://fixture.local/synthetic-injector.js',sample:'',disposition:'enforce',statusCode:200,lineNumber:41,columnNumber:7,timeStamp:12.25,isTrusted:false});
function dom(early=true) {
  const createElement=tag=>({tag,parentNode:null,children:[],listeners:new Map(),textContent:'',disabled:false,checked:false,
    addEventListener(kind,listener){this.listeners.set(kind,listener);},removeEventListener(kind,listener){if(this.listeners.get(kind)===listener)this.listeners.delete(kind);},
    appendChild(node){node.parentNode=this;this.children.push(node);},removeChild(node){this.children.splice(this.children.indexOf(node),1);node.parentNode=null;},
    async click(){return this.listeners.get('click')?.();}});
  const nodes=Object.fromEntries(['status','counts','errors','install','uninstall','opt-in','review'].map(id=>[id,createElement(id)]));
  const listeners=new Map();
  const host={addEventListener(kind,listener){if(!listeners.has(kind))listeners.set(kind,[]);listeners.get(kind).push(listener);}};
  const dispatch=(kind,event)=>{for(const listener of listeners.get(kind)||[])listener(event);};
  const context=vm.createContext({window:host});
  if(early)vm.runInContext(startup,context);
  return {nodes,host,dispatch,context,document:{createElement,getElementById:id=>nodes[id]},listeners};
}
const manifest=JSON.parse(read('browser-host/manifest.json'));
const fetchGood=async url=>url==='./manifest.json'?{ok:true,status:200,json:async()=>manifest}:{ok:true,status:200,headers:{get:()=> 'application/javascript'}};
const oldFailures=[];
{
  const fixture=dom(false);
  const oldInitialize=vm.runInNewContext('('+extract(oldHost,'initializeReviewHost')+')');
  oldInitialize(fixture.document,fixture.host,fetchGood);
  fixture.dispatch('securitypolicyviolation',rawFixture);
  const reduced=fixture.nodes.errors.textContent;
  assert(!reduced.includes(rawFixture.sourceFile));
  fixture.dispatch('securitypolicyviolation',{...rawFixture,sourceFile:'second-source',lineNumber:99});
  assert(!fixture.nodes.errors.textContent.includes('41'));
  fixture.dispatch('error',{message:'later-script-error'});
  assert(!fixture.nodes.errors.textContent.includes('style-src-elem'));
  oldFailures.push({case:'기존 원 host CSP 출처/좌표/이력 손실',reducedMessage:reduced,afterLaterError:fixture.nodes.errors.textContent,verdict:'FAIL 재현',fixtureKind:'synthetic event; 실제 브라우저 위반 원자료 아님'});
}
const rows=[];
async function check(name,run){await run();rows.push({name,status:'PASS'});}
await check('before 원문/기능함수 SHA 보존',()=>{for(const entry of before)assert.equal(hash(entry.text),entry.sha256);for(const name of ['createHostPortFactory','verifyHTTP'])assert.equal(extract(oldHost,name),extract(currentHost,name));});
await check('CSP byte 동일/초기 self classic 순서/inline0',()=>{
  const policy=html=>html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert.equal(policy(oldHTML),policy(currentHTML));assert(!currentHTML.includes('unsafe-inline'));assert(!currentHTML.includes('unsafe-eval'));
  assert(currentHTML.indexOf('Content-Security-Policy')<currentHTML.indexOf('src="./csp-startup.js"'));
  assert(currentHTML.indexOf('src="./csp-startup.js"')<currentHTML.indexOf('stylesheet'));
  assert(currentHTML.indexOf('src="./csp-startup.js"')<currentHTML.indexOf('src="./host.js"'));
  assert(!/<style\b|\sstyle\s*=|\son\w+\s*=/i.test(currentHTML));
});
await check('정상 baseline은 위반 관찰0/설치·RNG0',()=>{const fixture=dom();const state=initializeReviewHost(fixture.document,fixture.host,fetchGood);assert.equal(state.diagnostics.snapshot().violations.length,0);assert.equal(state.counters.base,0);assert.equal(state.counters.d10,0);assert(!Object.hasOwn(fixture.host,'_d10PersistenceReviewPort'));assert.match(fixture.nodes.errors.textContent,/리스너 실행 전/);});
await check('초기 사건 원필드·UTC·순서 보존/단일 listener',()=>{
  const fixture=dom();fixture.dispatch('securitypolicyviolation',rawFixture);
  vm.runInContext(startup,fixture.context);
  assert.equal(fixture.listeners.get('securitypolicyviolation').length,1);
  const state=initializeReviewHost(fixture.document,fixture.host,fetchGood);
  assert.equal(fixture.listeners.get('securitypolicyviolation').length,1);
  const record=JSON.parse(JSON.stringify(state.diagnostics.snapshot())).violations[0];assert.deepEqual(record.fields,rawFixture);assert.equal(record.sequence,1);assert.equal(record.phase,'startup-before-host-module');assert.match(record.observedUtc,/Z$/);
});
await check('이후 사건 누적/필드0·빈문자열 보존',()=>{const fixture=dom();initializeReviewHost(fixture.document,fixture.host,fetchGood);fixture.dispatch('securitypolicyviolation',rawFixture);fixture.dispatch('securitypolicyviolation',{...rawFixture,sourceFile:'',lineNumber:0,columnNumber:0,blockedURI:'https://fixture.invalid/resource'});const records=JSON.parse(fixture.nodes.errors.textContent).csp.violations;assert.equal(records.length,2);assert.equal(records[0].fields.sourceFile,rawFixture.sourceFile);assert.equal(records[1].fields.lineNumber,0);assert.equal(records[1].fields.sourceFile,'');});
await check('오류/설치실패/해제 후 원자료 지우지 않음',async()=>{const fixture=dom();fixture.dispatch('securitypolicyviolation',rawFixture);const state=initializeReviewHost(fixture.document,fixture.host,async()=>({ok:false,status:404}));const first=JSON.stringify(state.diagnostics.snapshot().violations);await fixture.nodes.install.click();fixture.nodes['opt-in'].checked=true;await fixture.nodes.install.click();fixture.dispatch('error',{message:'synthetic error'});fixture.dispatch('unhandledrejection',{reason:'synthetic rejection'});await fixture.nodes.uninstall.click();assert.equal(JSON.stringify(state.diagnostics.snapshot().violations),first);const printed=JSON.parse(fixture.nodes.errors.textContent);assert.equal(printed.runtimeErrors.length,4);assert.equal(printed.csp.violations[0].fields.lineNumber,41);});
await check('실제 포트 Node 설치→생성→JSON복원→해제/원자료·RNG0',async()=>{
  const fixture=dom();fixture.dispatch('securitypolicyviolation',rawFixture);Object.defineProperty(fixture.host,'_d10PersistenceReviewPort',{value:17,configurable:true,writable:false});const previous=Object.getOwnPropertyDescriptor(fixture.host,'_d10PersistenceReviewPort');
  const state=initializeReviewHost(fixture.document,fixture.host,fetchGood);fixture.nodes['opt-in'].checked=true;await fixture.nodes.install.click();assert.equal(fixture.nodes.review.children.length,3);
  await fixture.nodes.review.children[0].click();assert.equal(state.counters.d10,1);const base=state.counters.base;
  fixture.dispatch('securitypolicyviolation',{...rawFixture,lineNumber:77,sourceFile:'second-synthetic.js'});
  await fixture.nodes.review.children[1].click();assert.equal(state.counters.base,base);assert.equal(state.counters.d10,1);assert.equal(state.counters.restoreRng,0);
  assert.match(fixture.nodes.review.children[2].textContent,/JSON 복원 proposal/);await fixture.nodes.uninstall.click();assert.deepEqual(Object.getOwnPropertyDescriptor(fixture.host,'_d10PersistenceReviewPort'),previous);assert.equal(fixture.nodes.review.children.length,0);const printed=JSON.parse(fixture.nodes.errors.textContent);assert.equal(printed.csp.violations.length,2);assert.equal(printed.csp.violations[1].fields.lineNumber,77);
});
await check('snapshot 복사/원자료 외부 수정 방지',()=>{const fixture=dom();fixture.dispatch('securitypolicyviolation',rawFixture);const journal=fixture.host._itemReviewCspJournal,snapshot=journal.snapshot();snapshot.violations.length=0;assert.equal(journal.snapshot().violations.length,1);assert.throws(()=>{journal.snapshot().violations[0].fields.lineNumber=9;});});
await check('startup 미실행 fallback 전체필드/초기 UNKNOWN',()=>{const fixture=dom(false),state=initializeReviewHost(fixture.document,fixture.host,fetchGood);fixture.dispatch('securitypolicyviolation',rawFixture);assert.deepEqual(state.diagnostics.snapshot().violations[0].fields,rawFixture);assert.match(fixture.nodes.errors.textContent,/모듈 실행 이전 사건은 미관찰/);});
await check('actual root 요약과 합성 event 분리/원주입자 UNKNOWN',()=>{assert.match(rootRaw.initial.diagnostic,/origin not established/);assert.equal(rootRaw.initial.sourceFile,undefined);assert.equal(rootRaw.initial.lineNumber,undefined);assert.equal(rawFixture.isTrusted,false);assert.equal(rootRawText,fs.readFileSync(new URL(rootRawPath,root),'utf8'));});
await check('생성 전이·UI 원문 보존/서버 JS MIME 소스',()=>{for(const entry of manifest.modules)assert.equal(hash(fs.readFileSync(new URL(entry.targetPath,root))),entry.targetSha256);assert.equal(hash(fs.readFileSync(new URL(manifest.fixture.file,root))),manifest.fixture.sha256);for(const entry of manifest.unchangedDependencies)assert.equal(hash(fs.readFileSync(new URL(entry.file,root))),entry.sha256);assert.match(fs.readFileSync(new URL('server.cjs',root),'utf8'),/['"]\.js['"]\s*:\s*['"]application\/javascript/);});
console.log(JSON.stringify({utc:new Date().toISOString(),oldFailures,pass:rows.length,fail:0,rows,sourceHashes:{before:Object.fromEntries(before.map(entry=>[entry.file,entry.sha256])),after:{host:hash(currentHost),index:hash(currentHTML),startup:hash(startup)}},functionHashes:{beforeInitialize:hash(extract(oldHost,'initializeReviewHost')),afterInitialize:hash(extract(currentHost,'initializeReviewHost'))},rootRaw:{path:rootRawPath,sha256:hash(rootRawText),hasFullEventFields:false,attribution:'UNKNOWN'},syntheticViolationFixture:rawFixture,actualUI:'UNKNOWN: QA 전용 미실행',actualHTTP:'UNKNOWN: fixture responses only'},null,2));

import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||resolve(dirname(new URL(import.meta.url).pathname),'../../../../..'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const keys=[['demoEndTitle','데모 종료'],['demoEndMsg','여기까지 데모입니다. 정식 출시를 기대해주세요!'],['demoEndSupport','STEAM 위시리스트로 응원해 주세요!'],['demoEndWishlist','STEAM 위시리스트'],['demoEndLobby','로비로 돌아가기']];
const paths=['game.html','game-easy-test.html','localization-runtime.js','localization-data.js'];
const source=Object.fromEntries(paths.map(p=>[p,readFileSync(resolve(root,p),'utf8')]));
const inputHashes=paths.map(p=>({path:resolve(root,p),sha256:sha(source[p])}));
function fn(s,name){const start=s.indexOf('function '+name+'(');assert(start>=0,name);const lineEnd=s.indexOf('\n',start);const end=s.slice(start,lineEnd).trimEnd().endsWith('}')?lineEnd:name==='_applyLang'?s.indexOf("\n$('optDiff')",start):s.indexOf('\n}',start)+2;assert(end>start,name+' closing anchor');const text=s.slice(start,end);new vm.Script(text);return text;}
function declaration(s,name){const start=s.indexOf('const '+name+'=');assert(start>=0,name);const end=s.indexOf(';',start); // multiline dictionaries end at newline closing brace, not at a punctuation inside a translation
 const multi=s.slice(start,s.indexOf('\n',start)).trim().endsWith('{');
 const stop=name.startsWith('_LANG_')?s.indexOf('\n',start):multi?s.indexOf('\n};',start)+3:end+1;assert(stop>start,name);
 return s.slice(start,stop);}
const helper=`function _refreshDemoEndLanguage(){
  const labels=[['demoEndTitle','데모 종료'],['demoEndMsg','여기까지 데모입니다. 정식 출시를 기대해주세요!'],['demoEndSupport','STEAM 위시리스트로 응원해 주세요!'],['demoEndWishlist','STEAM 위시리스트'],['demoEndLobby','로비로 돌아가기']];
  for(const [id,ko] of labels){const el=document.getElementById(id);if(el&&el.children.length===0)el.textContent=_T(ko);}
}`;
const records=[],anchors=[];
function makeEnv(file,lang='ko',variant='normal'){
 const writes=[],effects=[],nodes={};
 function node(id,text,children=[]){
  const n={id,children,dataset:{},style:{display:'flex'},onclick:()=>id,marker:{id},_text:text};
  Object.defineProperty(n,'textContent',{get(){return this._text},set(v){assert.equal(this.children.length,0,'nonleaf write '+id);writes.push([id,v]);this._text=v;}});
  return n;
 }
 nodes.demoEnd=node('demoEnd','parent',[node('wrapper','✦',[node('decoration','✦')])]);
 for(const[id,ko]of keys)nodes[id]=node(id,ko);
 nodes.optLang={value:lang};
 nodes.toLobbyBtn=node('toLobbyBtn','로비로 돌아가기');
 if(variant==='nested')nodes.demoEndTitle.children.push(node('nested','preserve'));
 if(variant==='missing')delete nodes.demoEndMsg;
 if(variant==='hidden')nodes.demoEnd.style.display='none';
 const doc={documentElement:{lang:'ko',dir:'ltr'},getElementById:id=>nodes[id]||null,querySelectorAll:()=>[]};
 const s={OPT:{lang},document:doc,window:{},globalThis:null,$:id=>nodes[id]||null,console:{warn:(...a)=>effects.push(['warn',String(a[0])])},
 renderSettings:()=>effects.push(['renderSettings']),saveSettings:()=>effects.push(['saveSettings']),
 updateMagicSlot:()=>{},updateLMBSlot:()=>{},updateQSlot:()=>{},_updateUltSlot:()=>{},_renderPresetBtns:()=>{},_introGuide:false,
 _refreshPetBubbleLanguage:()=>effects.push(['petRefresh'])};
 s.globalThis=s;const c=vm.createContext(s);
 vm.runInContext(source['localization-runtime.js']+'\n'+source['localization-data.js'],c);
 const html=source[file];
 const dictionary=['_EN','_EN_PFX','_EN_BASE','_LANG_TBL','_LANG_PFX','_LANG_BASE'].map(n=>{const text=declaration(html,n);new vm.Script(text,{filename:n});return text;}).join('\n');
 const merge=html.match(/for\(const \[code,entries\]of Object.entries\(ExoduserLocalizationData.ui\)\)[^\n]+/)[0];
 vm.runInContext(dictionary+'\n'+merge+'\n'+fn(html,'_T')+'\n'+fn(html,'_L')+'\n'+fn(html,'_refreshPersistentHudLanguage'),c);
 return {s,c,nodes,writes,effects};
}
for(const file of ['game.html','game-easy-test.html']){
 const html=source[file],apply=fn(html,'_applyLang'),caller=html.match(/\$\('optLang'\)\.onchange=function\(\)\{[^\n]+/)[0];
 // Only the first-show label fragment is extracted; no nextStage/route/control execution.
 const firstLine=html.split('\n').find(l=>l.startsWith('function nextStage()'));
 const firstStart=firstLine.indexOf("const _dt=$('demoEndTitle')");
 const firstEnd=firstLine.indexOf("if(_dl)_dl.textContent=_T('로비로 돌아가기');")+ "if(_dl)_dl.textContent=_T('로비로 돌아가기');".length;
 const firstShow=firstLine.slice(firstStart,firstEnd);assert(firstStart>=0&&firstEnd>firstStart);
 for(const[name,text]of Object.entries({apply,caller,firstShow,T:fn(html,'_T'),EN:declaration(html,'_EN')}))
  anchors.push({file,name,line:html.slice(0,html.indexOf(text)).split('\n').length,sha256:sha(text)});
 const original=makeEnv(file),a=original;
 vm.runInContext(apply+'\n'+caller,a.c);
 a.nodes.optLang.value='en';a.nodes.optLang.onchange.call(a.nodes.optLang);
 const expected=keys.map(([id,ko])=>[id,vm.runInContext('_T('+JSON.stringify(ko)+')',a.c)]);
 const actual=keys.map(([id])=>[id,a.nodes[id].textContent]);
 assert(expected.some(([id,tr],i)=>tr!==keys[i][1]),'dictionary must contain actual EN keys');
 assert.deepEqual(actual,keys,'source omission no longer reproduced: re-inspect current anchor');
 assert.equal(a.s.OPT.lang,'en');assert(!a.effects.some(x=>x[0]==='warn'));
 records.push({file,phase:'actual-open-ko-en',actual,expected,defect:'five labels remain KO after actual onchange/_applyLang'});
 const candidate=apply.replace('_refreshPersistentHudLanguage();','_refreshPersistentHudLanguage();\n  _refreshDemoEndLanguage();');
 assert.notEqual(candidate,apply);
 for(const variant of ['normal','hidden','nested','missing']){
  const b=makeEnv(file,'ko',variant),before=new Map(Object.entries(b.nodes).map(([id,n])=>[id,{n,handler:n.onclick,marker:n.marker,children:n.children&&[...n.children]}]));
  vm.runInContext(helper+'\n'+candidate+'\n'+caller,b.c);
  b.nodes.optLang.value='en';b.nodes.optLang.onchange.call(b.nodes.optLang);
  for(const[id,ko]of keys){const n=b.nodes[id];if(!n||n.children.length)continue;assert.equal(n.textContent,vm.runInContext('_T('+JSON.stringify(ko)+')',b.c));}
  for(const [id,old]of before){assert.equal(b.nodes[id],old.n);assert.equal(b.nodes[id].onclick,old.handler);assert.equal(b.nodes[id].marker,old.marker);if(old.children)assert.deepEqual(b.nodes[id].children,old.children);}
  assert(!b.writes.some(x=>x[0]==='demoEnd'));
  assert(!b.effects.some(x=>x[0]==='warn'));
  if(variant==='nested')assert.equal(b.nodes.demoEndTitle.textContent,'데모 종료');
  const en=keys.filter(([id])=>b.nodes[id]&&!b.nodes[id].children.length).map(([id])=>[id,b.nodes[id].textContent]);
  b.nodes.optLang.value='ko';b.nodes.optLang.onchange.call(b.nodes.optLang);
  for(const[id,ko]of keys){if(b.nodes[id]&&!b.nodes[id].children.length)assert.equal(b.nodes[id].textContent,ko);}
  records.push({file,phase:'candidate-roundtrip',variant,en,leafOnly:true,identityHandlersChildrenPreserved:true,display:b.nodes.demoEnd.style.display});
 }
 // Real initial label fragment remains equivalent after adding refresh for fresh EN display.
 const fresh=makeEnv(file,'en');vm.runInContext(firstShow,fresh.c);
 const freshText=keys.map(([id])=>[id,fresh.nodes[id].textContent]);
 vm.runInContext(helper+'\n'+candidate+'\n'+caller,fresh.c);fresh.nodes.optLang.onchange.call(fresh.nodes.optLang);
 assert.deepEqual(keys.map(([id])=>[id,fresh.nodes[id].textContent]),freshText);
 assert.equal(fresh.nodes.toLobbyBtn.textContent,vm.runInContext("_T('로비로 돌아가기')",fresh.c));
 records.push({file,phase:'fresh-en-control',freshText});
 // Existing _T policy: missing dictionaries/keys return original text; do not add fallback translations.
 const fallback=makeEnv(file,'fr');vm.runInContext(helper+'\n'+candidate+'\n'+caller,fallback.c);
 const absent=vm.runInContext("_T('__fixture_absent_key__')",fallback.c);assert.equal(absent,'__fixture_absent_key__');
 fallback.nodes.optLang.onchange.call(fallback.nodes.optLang);
 records.push({file,phase:'fallback-observation',locale:fallback.s.OPT.lang,labels:keys.map(([id])=>[id,fallback.nodes[id].textContent]),absentKeyUnchanged:true,scope:'FR lang_*.js not loaded: explicit missing dictionary control, not actual FR translation QA'});
 // Removing only helper invocation restores the same defect and detects a broken candidate.
 const negative=makeEnv(file);vm.runInContext(helper+'\n'+candidate.replace('_refreshDemoEndLanguage();','')+'\n'+caller,negative.c);
 negative.nodes.optLang.value='en';negative.nodes.optLang.onchange.call(negative.nodes.optLang);
 assert.deepEqual(keys.map(([id])=>[id,negative.nodes[id].textContent]),keys);
 records.push({file,phase:'negative-control',removedHookDetected:true});
}
const changed=inputHashes.filter(x=>sha(readFileSync(x.path))!==x.sha256);
assert.equal(changed.length,0,'source changed during run; rerun anchored new input only');
console.log(JSON.stringify({taskId:'MARKETING-demo-end-live-locale-refresh-hb1014b',executedAt:new Date().toISOString(),root,node:process.execPath,inputHashes,anchors,records,helper,checksSha256:sha(readFileSync(new URL(import.meta.url))),sourceChanged:changed,productionApplied:false,runtimeAccepted:false,status:'SOURCE_CANDIDATE_CONTROLS_PASS',boundary:'actual onchange and full _applyLang/_T/_L/_refreshPersistentHudLanguage plus actual EN declarations/merge and localization runtime/data; first-show labels fragment only; DOM, unrelated HUD updates, settings render/save, pet refresh explicit stubs; no routes, live game/storage/browser/network'}));

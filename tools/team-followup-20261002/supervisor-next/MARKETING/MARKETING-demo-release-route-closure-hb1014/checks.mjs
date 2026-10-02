import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const ROOT=resolve(process.argv[2]||resolve(dirname(new URL(import.meta.url).pathname),'../../../../..'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const names=['game.html','game-easy-test.html','index.html','package.json','build-nwjs.mjs','node-main.js','indexdemo.html'];
const inputs=Object.fromEntries(names.map(n=>[n,readFileSync(resolve(ROOT,n),'utf8')]));
const snapshot=Object.entries(inputs).map(([file,text])=>({file:resolve(ROOT,file),sha256:sha(text)}));
function fragment(text,name){
 const re=new RegExp('(?:async )?function '+name+'\\([^\\n]*');
 const m=re.exec(text);assert(m,'missing function '+name);
 const lineEnd=text.indexOf('\n',m.index);
 let end;
 if(text.slice(m.index,lineEnd).trimEnd().endsWith('}'))end=lineEnd;
 else {end=text.indexOf('\n}',m.index);assert(end>=0,'missing closing anchor '+name);end+=2;}
 const source=text.slice(m.index,end);
 new vm.Script(source);
 return {source,line:text.slice(0,m.index).split('\n').length,sha256:sha(source)};
}
const files=vm.runInNewContext(inputs['build-nwjs.mjs'].match(/const FILES = (\[[\s\S]*?\]);/)[1]);
const dirs=vm.runInNewContext(inputs['build-nwjs.mjs'].match(/const DIRS = (\[[\s\S]*?\]);/)[1]);
const expectedWishlist='https://store.steampowered.com/app/4749590/';
const base='http://localhost:3333/';
function checkRoute(raw,{demo=false}={}){
 const u=new URL(raw,base);
 if(u.origin!==new URL(base).origin)return {ok:false,error:'unexpected-local-origin',raw};
 const target=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname).slice(1);
 const included=files.includes(target)||dirs.some(d=>target.startsWith(d+'/'));
 const exists=existsSync(resolve(ROOT,target));
 const errors=[];
 if(!exists)errors.push('missing-local-target');
 if(!included)errors.push('not-in-FILES-or-DIRS');
 if(demo&&u.searchParams.get('demo')!=='1')errors.push('demo-query-missing');
 return {ok:errors.length===0,raw,target,exists,included,errors};
}
function checkWishlist(url){return {ok:url===expectedWishlist,url,expected:expectedWishlist};}
function env(demo,save='ready',dead=false){
 const calls=[],elements=Object.fromEntries(['stageClear','demoEnd','demoEndTitle','demoEndMsg','demoEndSupport','demoEndWishlist','demoEndLobby'].map(id=>[id,{style:{},textContent:'',disabled:false}]));
 const P={hp:dead?0:10,mhp:100,st:0,mst:20,mp:0,mmp:30,shield:0,mshield:40,s:'dead'};
 const s={window:{location:{href:''},open:(...a)=>calls.push(['open',...a])},console:{error:(...a)=>calls.push(['error',String(a[0])])},
 _DEMO_MODE:demo,_DEMO_LAST_STAGE:0,_dbReady:save!=='not-ready',P,
 dbSave:async()=>{calls.push(['save',{...P}]);if(save==='reject')throw Error('fixture-save-reject');},
 _deathDlgStop:()=>calls.push(['stop']),$:id=>elements[id],_T:s=>s,
 SFX:{beamStop:()=>calls.push(['beamStop'])},G:{stage:0,on:true},ens:[],_cacheExitCenter:()=>calls.push(['cacheExit']),
 _ensWarmDone:true,_hudT:1,_hudAlive:1,SI_TO_HELL:[0,0],CHAPTER_STAGES:[{startSi:0,stages:2}],TOTAL_STAGES:2,
 doWin:()=>calls.push(['win']),initStage:n=>calls.push(['initStage',n]),BGM:{play:k=>calls.push(['bgm',k]),stageKey:n=>'stage'+n},
 showLoading:s=>calls.push(['loading',s]),_TL:s=>s,Image:class{},_testMode:true,_selectedSlotName:null,_LOBBY_BUILD:'demo',
 _demoActivateSlot:()=>true,hideLoading:()=>calls.push(['hideLoading']),setStatus:s=>calls.push(['status',s]),
 setTimeout:fn=>fn(),encodeURIComponent};
 return {s,calls,elements};
}
const anchors=[],observations=[];
for(const file of ['game.html','game-easy-test.html']){
 const source=inputs[file],wishlist=fragment(source,'openWishlist'),lobby=fragment(source,'goToLobby'),next=fragment(source,'nextStage');
 const tags=['demoEndWishlist','demoEndLobby'].map(id=>{
  const tag=source.match(new RegExp('<button[^>]*id="'+id+'"[^>]*>'))?.[0];assert(tag,'missing CTA '+id);
  const onclick=tag.match(/onclick="([^"]+)"/)?.[1];assert(onclick,'missing onclick '+id);
  anchors.push({file,id,source:tag,line:source.slice(0,source.indexOf(tag)).split('\n').length,sha256:sha(tag)});
  return onclick;
 });
 const nextCaller=source.match(/\$\('nextBtn'\)\.onclick=\(\)=>\{[\s\S]*?\n\};/)?.[0];assert(nextCaller);
 anchors.push({file,name:'nextBtn.onclick',sha256:sha(nextCaller),source:nextCaller});
 for(const [name,f]of Object.entries({openWishlist:wishlist,goToLobby:lobby,nextStage:next}))anchors.push({file,name,...f});
 const lastStage=Number(source.match(/const _DEMO_LAST_STAGE=(\d+);/)[1]);
 const original=env(true);
 original.s._DEMO_LAST_STAGE=lastStage;original.s.G.stage=lastStage;
 original.s.SI_TO_HELL=Array(lastStage+1).fill(0);
 const ctx=vm.createContext(original.s);
 vm.runInContext(next.source+'\n'+wishlist.source+'\n'+lobby.source,ctx);
 original.elements.nextBtn={style:{}};
 // Actual caller installs its handler on the explicit DOM substitute.
 vm.runInContext(nextCaller,ctx);
 original.elements.nextBtn.onclick();
 assert.equal(original.elements.demoEnd.style.display,'flex');
 assert.equal(original.s.G.stage,lastStage);assert.equal(original.s.G.on,false);
 vm.runInContext(tags[0],ctx);
 const w=checkWishlist(original.calls.find(x=>x[0]==='open')[1]);
 await vm.runInContext(tags[1],ctx);
 const l=checkRoute(original.s.window.location.href,{demo:true});
 observations.push({file,phase:'actual',wishlist:w,lobby:l,ending:{display:original.elements.demoEnd.style.display,stage:original.s.G.stage,on:original.s.G.on},calls:original.calls});
 const candidateWishlist=wishlist.source.replace("'https://store.steampowered.com/'","'"+expectedWishlist+"'");
 const candidateLobby=lobby.source.replace("'indexdemo.html'","'/?lobby=1&demo=1'");
 assert.notEqual(candidateWishlist,wishlist.source);
 for(const save of ['not-ready','ready','reject'])for(const demo of [true,false])for(const dead of [false,true]){
  async function run(wsrc,lsrc){
   const e=env(demo,save,dead),c=vm.createContext(e.s);
   vm.runInContext(wsrc+'\n'+lsrc,c);vm.runInContext(tags[0],c);await vm.runInContext(tags[1],c);
   return {e,route:checkRoute(e.s.window.location.href,{demo}),wishlist:checkWishlist(e.calls.find(x=>x[0]==='open')[1])};
  }
  const a=await run(wishlist.source,lobby.source),b=await run(candidateWishlist,candidateLobby);
  assert(b.route.ok,JSON.stringify(b.route));assert(b.wishlist.ok);
  assert.equal(JSON.stringify(a.e.calls.filter(x=>x[0]!=='open')),JSON.stringify(b.e.calls.filter(x=>x[0]!=='open')));
  assert.deepEqual(a.e.s.P,b.e.s.P);
  if(!demo||file==='game.html')assert.equal(a.e.s.window.location.href,b.e.s.window.location.href);
  observations.push({file,phase:'candidate-control',save,demo,dead,route:b.route,wishlist:b.wishlist,sideEffectsEqual:true});
 }
 // Validate sensitivity using actual function bodies mutated only in memory.
 const broken=env(true),bc=vm.createContext(broken.s);
 vm.runInContext(candidateWishlist.replace(expectedWishlist,'https://store.steampowered.com/app/0/')+'\n'+candidateLobby.replace('/?lobby=1&demo=1','missing-demo-target.html'),bc);
 vm.runInContext(tags[0],bc);await vm.runInContext(tags[1],bc);
 assert(!checkWishlist(broken.calls.find(x=>x[0]==='open')[1]).ok);
 assert(!checkRoute(broken.s.window.location.href,{demo:true}).ok);
 observations.push({file,phase:'negative-control',wishlistDetected:true,missingLocalAndDemoQueryDetected:true});
}
const gate=fragment(inputs['index.html'],'showCharGate');anchors.push({file:'index.html',name:'showCharGate',...gate});
for(const storySeen of [false,true]){
 const e=env(true),c=vm.createContext(e.s);vm.runInContext(gate.source,c);vm.runInContext('showCharGate("warrior",'+storySeen+')',c);
 const route=checkRoute(e.s.window.location.href,{demo:true});assert(route.ok);const u=new URL(e.s.window.location.href,base);
 assert.equal(u.searchParams.get('slot'),'demo');assert.equal(u.searchParams.get('test'),'1');
 assert.equal(u.searchParams.get('story'),storySeen?'warrior-v21':null);
 observations.push({file:'index.html',phase:'entry-control',storySeen,route});
}
const main=JSON.parse(inputs['package.json']).main;assert(checkRoute(main,{demo:true}).ok);
assert(inputs['node-main.js'].includes("if (pathname === '/' || pathname === '') pathname = '/index.html';"));
const changed=snapshot.filter(x=>sha(readFileSync(x.file,'utf8'))!==x.sha256);
const result={taskId:'MARKETING-demo-release-route-closure-hb1014',executedAt:new Date().toISOString(),node:process.execPath,root:ROOT,sourceInputs:snapshot,anchors,
packageMain:main,packagingScope:{files:Array.from(files),dirs:Array.from(dirs),rootIndexRewrite:'source contract only; no HTTP executed'},
observations,sourceChangedDuringRun:changed,productionApplied:false,runtimeAccepted:false,
boundary:'Full actual CTA/goToLobby/nextStage/showCharGate bodies and actual button/nextBtn callers in Node VM; DOM, timers, audio, DB save, combat/init are explicit stubs; no browser, actual storage, network or build.',
checksSha256:sha(readFileSync(new URL(import.meta.url))),status:'SOURCE_CANDIDATE_AND_CONTROLS_PASS'};
console.log(JSON.stringify(result,null,2));

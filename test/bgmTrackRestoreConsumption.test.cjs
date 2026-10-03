// Whole BGM object and settings/preset functions; exact startup restore block.
// Whole closeAllPanels exercises an unwrapped caller. initStage catch is an exact
// extracted statement, not full map initialization. Audio, DOM, storage and time
// are doubles; no actual playback, listening, native app or user settings run.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir,plain=x=>JSON.parse(JSON.stringify(x));
function extract(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8'),scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
 let js=0,maps=0;for(const m of scripts){if(/type=["']importmap/.test(m[1])){JSON.parse(m[2]);maps++}
  else if(m[2].trim()){acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/type=["']module/.test(m[1])?'module':'script'});js++}}
 assert.equal(js,6);assert.equal(maps,1);
 const src=scripts.find(m=>m[2].includes('function addExp('))[2],ast=acorn.parse(src,{ecmaVersion:'latest'});
 const variable=name=>{const nodes=ast.body.filter(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));assert.equal(nodes.length,1,name);return src.slice(nodes[0].start,nodes[0].end)};
 const fn=name=>{const marker='function '+name+'(';assert.equal(src.split(marker).length,2,name);const n=acorn.parseExpressionAt(src,src.indexOf(marker),{ecmaVersion:'latest'});return src.slice(n.start,n.end)};
 const start=src.indexOf('// 게임 시작 시 자동 불러오기'),endMarker='try{_applyCursor()}catch(e){}';assert(start>=0);
 const end=src.indexOf(endMarker,start)+endMarker.length;assert(end>start);
 const wrapped='try{BGM.play(BGM.stageKey(si));}catch(e){console.error("[BGM] stage start",e);}';assert.equal(src.split(wrapped).length,2);
 return [variable('BGM'),variable('OPT'),fn('saveSettings'),fn('_savePreset'),fn('_loadPreset'),fn('closeAllPanels'),
  'function restoreBootSettings(){'+src.slice(start,end)+'}',
  'function caughtStageMusic(si){'+wrapped+'}', 'this.BGM=BGM;this.OPT=OPT;'].join('\n');
}
function fixture(src,value,{route='boot',reject=false}={}){
 const events=[],storage=new Map(),nodes=new Map(),audios=[];let randomStep=0;
 function node(id){if(!nodes.has(id))nodes.set(id,{children:[],style:{},dataset:{},classList:{contains:()=>false,remove:(...v)=>events.push(['removeClass',id,...v])}});return nodes.get(id)}
 class AudioDouble{
  constructor(src){this.src=src;this.currentTime=0;this.volume=1;this.loop=false;this.plays=0;audios.push(this);events.push(['audio',src])}
  play(){this.plays++;events.push(['play',this.src]);return reject&&this.plays===1?Promise.reject(new Error('synthetic autoplay rejection')):Promise.resolve()}
  pause(){events.push(['pause',this.src])}removeAttribute(){events.push(['removeSrc',this.src])}load(){events.push(['load',this.src])}
 }
 const c={IS_ELECTRON:false,Audio:AudioDouble,G:{stage:0,on:true,_cutsceneDone:true,forgeOpen:true,paused:true},
  SI_TO_HELL:[0,0,0,0,0],BINDS:{beam:'mouse2',shield:'KeyE',forge:'KeyG',stats:'KeyJ',storage:'KeyN'},BINDS2:{},
  _forceCutscene:false,_cutsceneState:'PLAYING',_xbowEquipped:false,_bgmGainA:null,_bgmGainB:null,
  _T:x=>x,_L:x=>x,$:node,_inventoryFocus:{close:()=>events.push(['focusClose'])},
  _repairChainAttackBinds:()=>events.push(['repairBinds']),applyUIScale:()=>events.push(['uiScale']),
  rz:()=>events.push(['rz']),syncSettingsUI:()=>events.push(['syncUI']),renderSettings:()=>events.push(['renderSettings']),
  _applyCursor:()=>events.push(['cursor']),ExoduserI18n:{resolveLanguage:v=>v==='en'?'en':v==='ko'?'ko':null},
  localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>{storage.set(k,String(v));events.push(['store',k,String(v)])}},
  document:{addEventListener:(...a)=>events.push(['listenerAdd',a[0]]),removeEventListener:(...a)=>events.push(['listenerRemove',a[0]]),querySelectorAll:()=>[]},
  setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>2,clearInterval:()=>{},
  console:{error:(...a)=>events.push(['caught',a[0],a[1]?.name])}};
 c.Math=Object.create(Math);c.Math.random=()=>((++randomStep*7)%17)/17;
 vm.createContext(c);vm.runInContext(src,c);
 const data={binds:{},binds2:{},opt:{bgmTrack:value,diff:5,diffV2:1,bgmVol:60,lang:'ko'}};
 const key=route==='boot'?'hellcave_settings':'hellcave_preset_1';storage.set(key,JSON.stringify(data));storage.set('hellLang','ko');
 if(route==='boot')c.restoreBootSettings();else c._loadPreset(1);
 c.events=events;c.storage=storage;c.nodes=nodes;c.audios=audios;return c;
}
function snapshot(c){return plain({OPT:c.OPT,events:c.events,G:c.G,curKey:c.BGM._curKey,lastSrc:c.BGM._lastSrc,
 pending:c.BGM._pending,bound:c.BGM._bound,LRU:c.BGM._cacheLRU,
 played:Object.fromEntries(Object.entries(c.BGM._playedSets).map(([k,v])=>[k,[...v]])),done:c.BGM._actDone,
 audios:c.audios.map(a=>({src:a.src,volume:a.volume,time:a.currentTime,loop:a.loop,plays:a.plays,onended:!!a.onended}))});}
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 for(const value of ['auto','allRandom','t:boss','boss','garbage',0,null,'',false])for(const force of [false,true])for(const route of ['boot','preset']){
  test(file+' normal selection '+JSON.stringify(value)+' force='+force+' '+route+' preserves full object state',()=>{
   const c=fixture(src,value,{route}),b=fixture(old,value,{route});c.BGM.play('hell1',force);b.BGM.play('hell1',force);
   c.BGM.play('death',force);b.BGM.play('death',force);assert.deepEqual(snapshot(c),snapshot(b));
  });
 }
 for(const value of [999,-1,true,{},['x']])for(const route of ['boot','preset']){
  test(file+' truthy non-string '+JSON.stringify(value)+' '+route+' skips field without throw and plays special keys',()=>{
   const c=fixture(src,value,{route});assert.deepEqual(plain(c.OPT.bgmTrack),value);
   assert.doesNotThrow(()=>c.BGM.play('hell1'));assert.equal(c.audios.length,0,'later category guard still skips field');
   for(const key of ['death','victory','forge']){
    assert.doesNotThrow(()=>c.BGM.play(key));assert.equal(c.BGM._curKey,key);assert(c.audios.length>0);
   }
   c.saveSettings();assert.deepEqual(JSON.parse(c.storage.get('hellcave_settings')).opt.bgmTrack,value);
  });
 }
 test(file+' malformed numeric track no longer interrupts whole forge panel cleanup',()=>{
  const c=fixture(src,999);assert.doesNotThrow(()=>c.closeAllPanels());
  assert.equal(c.G.forgeOpen,false);assert.equal(c.G.paused,false);
  assert.equal(c._fuseSelId,null);assert.equal(c._skExpandedId,null);assert.equal(c.BGM._cur,null);
  assert.equal(c.nodes.get('skSlotPop').style.display,'none');
 });
 test(file+' exact initStage music catch no longer logs track TypeError',()=>{
  const c=fixture(src,999);c.caughtStageMusic(0);assert.equal(c.events.filter(e=>e[0]==='caught').length,0);
  assert.equal(c.audios.length,0,'type guard does not turn malformed category into auto');
 });
 test(file+' force bypass retains existing malformed category behavior',()=>{
  const c=fixture(src,999),b=fixture(old,999);c.BGM.play('hell1',true);b.BGM.play('hell1',true);
  assert.deepEqual(snapshot(c),snapshot(b));assert.equal(c.BGM._curKey,'hell1');assert.equal(c.audios.length,1);
 });
 test(file+' cutscene gate remains earlier than malformed track guard',()=>{
  const c=fixture(src,999),b=fixture(old,999);
  for(const f of [c,b]){f._forceCutscene=true;f.G._cutsceneDone=false;f.BGM.play('hell1');}
  assert.deepEqual(snapshot(c),snapshot(b));assert.equal(c.audios.length,0);
 });
 test(file+' normal track prefix prevents all unforced category switches',()=>{
  const c=fixture(src,'t:boss');for(const key of ['hell1','death','victory','forge'])c.BGM.play(key);
  assert.equal(c.audios.length,0);assert.equal(c.BGM._cur,null);
 });
 test(file+' special playback preserves autoplay pending and whole interaction retry',async()=>{
  const c=fixture(src,999,{reject:true});c.BGM.play('death');await Promise.resolve();await Promise.resolve();
  assert.equal(c.BGM._pending,'death');assert.equal(c.BGM._bound,true);
  assert.equal(c.events.filter(e=>e[0]==='listenerAdd').length,5);
  c.BGM._onInteract();await Promise.resolve();await Promise.resolve();
  assert.equal(c.BGM._pending,null);assert.equal(c.BGM._bound,false);
  assert.equal(c.events.filter(e=>e[0]==='listenerRemove').length,5);assert.equal(c.audios[0].plays,2);
 });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';

function declaration(file,name){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
    const code=m[1];const ast=parse(code,{ecmaVersion:'latest',sourceType:'script'});
    const fn=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);
    if(fn)return code.slice(fn.start,fn.end);
  }
  throw Error('Missing function '+name);
}
function creationContext({offline=true,fallback=false,rejected=false}={}){
  const nodes=new Map();const calls=[];const ls=new Map();
  const ctx=vm.createContext({console,_testMode:offline,_pendingVisualIdx:0,currentUser:{id:'user'},
    $:id=>{if(!nodes.has(id))nodes.set(id,{value:id==='charName'?'테스트전사':'',classList:{add(){},remove(){}},style:{}});return nodes.get(id);},
    _TL:s=>s,setStatus(){},_goLobby(){},loadLocalCharacters:async()=>{},loadCharacters:async()=>{},
    _afterCharacterCreated:async(...a)=>calls.push(a),
    localStorage:{getItem:k=>ls.get(k)||null,setItem:(k,v)=>ls.set(k,v)},
    fetch:async url=>{if(fallback)throw Error('offline');return {ok:!url.startsWith('/api/load'),json:async()=>({ok:!rejected})};},
    sb:{from:()=>({insert:async()=>({error:rejected?{code:'23505'}:null})})}
  });
  vm.runInContext(declaration('index.html','doCreateChar')+'\n'+declaration('index.html','_enterOffline'),ctx);
  return {ctx,calls,nodes};
}
for(const mode of [{offline:true},{offline:true,fallback:true},{offline:false}]){
  test('successful creation hands the saved character to its story '+JSON.stringify(mode),async()=>{
    const {ctx,calls}=creationContext(mode);await ctx.doCreateChar('테스트전사',0);
    assert.equal(calls.length,1);assert.deepEqual(Array.from(calls[0]),['테스트전사',0]);
  });
}
test('offline button override also starts the new story after save',async()=>{
  const {ctx,calls,nodes}=creationContext();ctx._enterOffline();await nodes.get('createBtn').onclick();
  assert.equal(calls.length,1);
});
test('rejected save does not start the story',async()=>{
  const {ctx,calls}=creationContext({rejected:true});await ctx.doCreateChar('테스트전사',0);assert.equal(calls.length,0);
});
test('movie handoff starts the goddess sequence without replaying old narration',()=>{
  let voicePlays=0;
  const ctx=vm.createContext({console,_bossTestReq:-1,_wantPlateTest:()=>false,_forceCutscene:false,G:{stage:0},P:{},_charIdx:0,
    location:{search:'?test=1&slot=test&story=warrior-v21'},URLSearchParams,
    _startIntro(){},_cutSeq:'PRO',_cutsceneState:null,PROLOGUE_LINES:{ko:[]},_getCutsceneImg(){},setInterval:()=>0,clearInterval(){},setTimeout:fn=>fn(),
    performance:{now:()=>0},$:()=>null,BGM:{fadeOut(){},play(){}},_proVoice:{play(){voicePlays++;return Promise.resolve();}},_PRO_VOICE_OFS:0.3
  });
  vm.runInContext(declaration('game.html','_startIntroCutscene'),ctx);ctx._startIntroCutscene();
  assert.equal(ctx._cutSeq,'INTRO');assert.equal(voicePlays,0);assert.equal(ctx.G.on,false);
});
for(const kind of ['ended','skip','error'])test('movie '+kind+' releases its media and completes once',async()=>{
  const file=new URL('../character-story-player.js',import.meta.url);assert.ok(existsSync(file),'character story player must exist');
  class El extends EventTarget{constructor(){super();this.style={};this.children=[];this.paused=true;}append(...els){this.children.push(...els);}setAttribute(){}removeAttribute(){}focus(){}remove(){}load(){}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
  const doc=new El();doc.createElement=()=>new El();doc.body=new El();doc.activeElement=new El();
  const ctx=vm.createContext({document:doc,console,setTimeout,clearTimeout});
  vm.runInContext(readFileSync(file,'utf8'),ctx);
  const player=ctx.ExoduserCharacterStory;const result=player.play({skipLabel:'Skip'});assert.equal(player.active,true);
  const video=doc.body.children[0].children[0];assert.equal(video.muted,false);
  if(kind==='skip')player.skip();else video.dispatchEvent(new Event(kind));
  assert.equal(await result,kind!=='error');assert.equal(player.active,false);assert.equal(video.paused,true);player.skip();
});
for(const visualIdx of [0,1])test('creation routing only plays the warrior movie: '+visualIdx,async()=>{
  const movies=[],gates=[],refresh=[];
  const ctx=vm.createContext({_testMode:true,_selectedSlot:null,_selectedSlotName:null,console,
    loadLocalCharacters:async()=>refresh.push('local'),loadCharacters:async()=>{},stopLobbyBgm(){},_stopHover(){},$:()=>null,
    _TL:s=>s,ExoduserCharacterStory:{play:async()=>{movies.push(1);return true;}},showCharGate:(...a)=>gates.push(a),startBGM(){}});
  vm.runInContext(declaration('index.html','_afterCharacterCreated'),ctx);await ctx._afterCharacterCreated('새전사',visualIdx);
  assert.equal(movies.length,visualIdx===0?1:0);assert.equal(refresh.length,visualIdx===0?0:1);
  if(visualIdx===0)assert.deepEqual(Array.from(gates[0]),['새전사',true]);else assert.equal(gates.length,0);
});
test('lobby BGM cannot restart underneath the story',()=>{
  let attempts=0;const ctx=vm.createContext({ExoduserCharacterStory:{active:true},bgmStarted:false,document:{getElementById:()=>null},lobbyBGM:{play(){attempts++;return Promise.resolve();}},_rmBGMListeners(){}});
  vm.runInContext(declaration('index.html','_tryBGM'),ctx);ctx._tryBGM();assert.equal(attempts,0);
});

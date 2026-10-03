const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {parse}=require('acorn');
const {createHash}=require('node:crypto');
const root=process.env.EXODUSER_TEST_SOURCE_DIR||process.cwd();
const plain=x=>JSON.parse(JSON.stringify(x));
function walk(n,out){if(!n||typeof n!=='object')return;if(n.type)out.push(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(x=>walk(x,out));else if(v&&typeof v==='object')walk(v,out);}}
function extract(file){const text=fs.readFileSync(path.join(root,file),'utf8');let scripts=0,maps=0,init,orb;
 for(const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
 if(/\bsrc\s*=/i.test(m[1]))continue;const type=/\btype\s*=\s*["']([^"']+)["']/i.exec(m[1])?.[1]||'';
 if(type==='importmap'){JSON.parse(m[2]);maps++;continue;}if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
 const ns=[];walk(parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'}),ns);scripts++;
 for(const n of ns){if(n.type==='FunctionDeclaration'&&n.id?.name==='initStage'){assert.equal(init,undefined);init=m[2].slice(n.start,n.end);}
 if(n.type==='IfStatement'){const s=m[2].slice(n.start,n.end);if(s.startsWith('if((G.stage===0||G.stage===3)&&G.bossAlive){')&&s.includes('G._druidOrbT')&&s.includes('G._druidOrbs.length=_ow')){assert.equal(orb,undefined);orb=s;}}}}
 assert.equal(scripts,6);assert.equal(maps,1);assert.ok(init&&orb);
 console.log('SOURCE '+JSON.stringify({file,sha256:createHash('sha256').update(text).digest('hex'),scripts,maps,boundary:'entire actual initStage and actual independent ORB producer/contact/movement/lifetime block; map/enemy generation and rendering/audio sinks are doubles'}));return {init,orb};}
function fixture(parts,{bossTest=-1,failMap=false}={}){
 const orb={x:200,y:200,vx:0,vy:0,t:1,r:26,dmg:100};const oldMap=[[0]],error=new Error('map generation failure');
 const events=[];const G={_druidOrbs:[orb],_druidOrbT:97,_druidParryT:83,_druidParryVolley:9,map:oldMap,mw:8,mh:8,rooms:[],cam:{x:0,y:0},pets:{},_bossRef:null,bossAlive:false};
 const P={x:200,y:200,r:10,hp:80,mhp:100,mp:10,mmp:50,st:10,mst:60,shield:0,mshield:20,iframes:0,maxChargeStocks:2};
 const map=()=>{if(failMap)throw error;G.map=Array.from({length:8},()=>Array(8).fill(0));G.mw=8;G.mh=8;G.rooms=[{type:'start',cx:4,cy:4}];G._isTileRLE=true;G.spawnHoles=[];G.bossGate=[];G.bossAlive=false;events.push('generate');};
 const sink=name=>(()=>events.push(name));
 const s={Math:Object.assign(Object.create(Math),{random:()=>.125}),G,P,ens:[],projs:[],pProjs:[],worldItems:[],MAP_OBJS:[],window:{},TOTAL_STAGES:35,_bossTestReq:bossTest,_DIABLO_FIELD_QA:false,_MAP_QA_MODE:false,_MAP_QA_COMBAT:false,_bootMapBuildDefer:false,_useGPU:false,_useGL:false,_ESPRITES:{},T:40,_skinSeqIdx:0,_eSpCache:new Map(),_impacts:[],_vfxAnims:[],_fireExps:[],_shDirty:false,_eyeObjs:[],_eyeInited:true,_bgInitQueue:[],_bgInitDone:true,_bgInitIdx:3,
 _load8DirAtlas:sink('atlas'),_getFixedMapForStage:()=>({}),genFromTemplate:map,genGauntlet:map,_buildDiabloField:map,
 _recycleProj:sink('recycle'),_recyclePProj:sink('player-recycle'),_clearDeathDecals:sink('decals'),_clearExtEPalCache:sink('enemyPalette'),_clearExtBPalCache:sink('bossPalette'),spawnRoomEns:sink('roomSpawn'),spawnCorridorEns:sink('corridorSpawn'),_canMvTile:()=>true,safePt:()=>null,canMv:()=>true,mkEn:()=>null,rollEtype:()=>0,rollEl:()=>0,SI_TO_HELL:Array(35).fill(0),STG:Array(35).fill({be:0}),_spawnCh1StartMediumEyeMasses:sink('mediumSpawn'),_regionInit:sink('regions'),buildMapCache:sink('cache'),_queueBootMapBuild:sink('queue'),initTorchLights:sink('torch'),initSwayObjects:sink('sway'),initWallEyes:sink('wallEyes'),_initEyes:sink('eyes'),initGlowObjects:sink('glow'),initMapObjects:sink('mapObjects'),_tickBgInit:sink('background'),_enterBossArena:sink('arena'),BGM:{stageKey:si=>'stage'+si,play:sink('music')},console,
 sp:1,_isDruidFinale:()=>false,dst:(x,y,a,b)=>Math.hypot(x-a,y-b),isPWin:()=>false,shQuery:()=>[],hurtE:sink('hurtE'),hurtP:dmg=>{P.hp-=dmg;events.push(['hurtP',dmg]);},poolPart:sink('part'),addParts:sink('parts'),playVFXAng:sink('vfx'),doParry:sink('parry'),elMul:()=>1,ar:()=>({el:0}),EL:{P:4},addTxt:sink('text'),_T:x=>x};
 const ctx=vm.createContext(s);vm.runInContext(parts.init,ctx);return {s,ctx,events,error,orb,oldMap,run:code=>vm.runInContext(code,ctx,{timeout:2000}),load:si=>vm.runInContext('initStage('+si+')',ctx,{timeout:2000}),tick:()=>vm.runInContext(parts.orb,ctx,{timeout:2000})};}
for(const file of ['game.html','game-easy-test.html']){const parts=extract(file);
 if(process.env.EXODUSER_BASELINE_SOURCE_DIR)test(file+' clean normal initStage is identical to prior source',()=>{const originalText=fs.readFileSync(path.join(process.env.EXODUSER_BASELINE_SOURCE_DIR,file),'utf8'); const originalInit=originalText.slice(originalText.indexOf('function initStage(si){'),originalText.indexOf('\nfunction hasLOS(',originalText.indexOf('function initStage(si){')));const a=fixture({init:originalInit,orb:parts.orb}),b=fixture(parts);for(const w of [a,b]){w.s.G._druidOrbs=[];w.s.G._druidOrbT=0;w.s.G._druidParryT=0;w.s.G._druidParryVolley=0;w.load(0);}assert.deepEqual(plain(a.s.G),plain(b.s.G));assert.deepEqual(plain(a.s.P),plain(b.s.P));assert.deepEqual(a.events,b.events);});
 for(const stage of [0,1,3,100])test(file+' complete initStage clears only prior ORB state for stage '+stage,()=>{const w=fixture(parts);w.load(stage);assert.deepEqual(plain(w.s.G._druidOrbs),[]);for(const k of ['_druidOrbT','_druidParryT','_druidParryVolley'])assert.equal(w.s.G[k],0,k);assert.equal(w.s.G.stage,Math.min(stage,34));assert.equal(w.orb.t,1);assert.equal(w.s.P.hp,100);assert.equal(w.s.P.iframes,360);assert.notEqual(w.s.G.map,w.oldMap);assert.ok(w.events.includes('music'));});
 test(file+' actual ORB contact cannot consume old-stage attack after complete initStage',()=>{const w=fixture(parts);w.load(0);w.s.G.bossAlive=true;w.s.G._bossRef=null;w.s.P.x=200;w.s.P.y=200;w.s.P.iframes=0;w.tick();assert.equal(w.s.P.hp,100);assert.equal(w.s.P.poison,0);assert.equal(w.s.P._webSlow,0);assert.ok(!w.events.some(x=>Array.isArray(x)&&x[0]==='hurtP'));});
 test(file+' live within-stage actual ORB contact and ordinary lifetime remain unchanged',()=>{const w=fixture(parts);w.s.G.stage=0;w.s.G.bossAlive=true;w.tick();assert.equal(w.s.P.hp,-20);assert.equal(w.s.P.poison,3);assert.equal(w.s.P._webSlow,80);assert.equal(w.s.G._druidOrbs.length,0);assert.deepEqual(w.events.filter(x=>Array.isArray(x)),[['hurtP',100]]);});
 test(file+' map construction exception is not swallowed by stage reset',()=>{const w=fixture(parts,{failMap:true});assert.throws(()=>w.load(0),e=>e===w.error);assert.deepEqual(plain(w.s.G._druidOrbs),[]);assert.ok(!w.events.includes('music'));});
 test(file+' existing boss-test early branch remains delegated to arena initialization',()=>{const w=fixture(parts,{bossTest:3});w.load(1);assert.equal(w.s.G.stage,3);assert.ok(w.events.includes('arena'));assert.ok(!w.events.includes('generate'));assert.equal(w.s.G._druidOrbs[0],w.orb);assert.equal(w.s.P.iframes,300);});
}

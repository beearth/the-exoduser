'use strict';
// Actual AST-extracted callbacks/helpers; JSON stdout only. No source/save/Git writes.
// --memory: existing source13 RED / scoped source14 candidate GREEN.
// --live (default): current production GREEN only. --repo is required in ignored staging.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const args=process.argv.slice(2),option=n=>{const i=args.indexOf(n);return i<0?args.find(a=>a.startsWith(n+'='))?.slice(n.length+1):args[i+1];};
const root=path.resolve(option('--repo')||path.resolve(__dirname,'..'));
const {parse}=require(require.resolve('acorn',{paths:[root]}));
const memory=args.includes('--memory'),files=['game.html','game-easy-test.html'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),plain=v=>JSON.parse(JSON.stringify(v));
const pins={
  'game.html':'5aedce268fe15d65b5636b7ff5b7d47e12db349dac5f439f9824e18bd3a5833a',
  'game-easy-test.html':'8af5aec611490134bf02f5b850a7310e49aa6796c4f4d9ba9f8952e6eeeacff3'
};
const oldAnchor='G._gSlamWave=[];G._lavaField=null;G._gwPillar=null;_shDirty=true;';
const inserted='G._druidOrbs=[];G._druidOrbT=0;G._druidParryT=0;G._druidParryVolley=0;';
const newAnchor=oldAnchor.replace('_shDirty=true;',inserted+'_shDirty=true;');
const helperNames=['_captureBossFieldState','_restoreBossFieldState','_retryDruidFinale','_isDruidFinale','_refillRespawnResources'];
const snapshotKeys=['map','mw','mh','rooms','exits','curRoom','bossGate','bossGateOpen','bossSealed','_bossCx','_bossCy','_gateY','_bossEntY','ens','mapObjs','worldItems','_fow','spawnHoles','rifts','_isTileRLE','_isOpenField','_bossUnlocked','_stageKills','_totalSpawned','_gateGuardKilled','_gateGuard','_deathSpawned','_regions','_regMidX','_regMidY','_regCurIdx','_regBannerCd','_regGateIdx','_fieldBoss','_fieldBosses','_fbDone','_fbSpawned','_fbAnnounced','_fbStage','_fireDevils','_fdSpawned','_fdAnnounced','_fdStage','_worms','_wmStage','_editorEyes'];
assert.equal(snapshotKeys.length,46);
function walk(n,visit){if(!n||typeof n!=='object')return;if(n.type)visit(n);for(const v of Object.values(n)){if(Array.isArray(v))for(const c of v)walk(c,visit);else if(v&&typeof v==='object')walk(v,visit);}}
function oneReplace(text,old,next,label){assert.equal(text.split(old).length-1,1,label);return text.replace(old,next);}
function parseHTML(html){
  const scripts=[];
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/i.test(m[1]))continue;
    const type=m[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()||'';
    if(type.includes('json')||type==='importmap'){JSON.parse(m[2]);scripts.push({type:'json'});continue;}
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    scripts.push({type:'js',text:m[2],offset:m.index+m[0].indexOf(m[2]),ast:parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'})});
  }
  return scripts;
}
function readSource(file){
  const bytes=fs.readFileSync(path.join(root,file)),html=bytes.toString('utf8');
  const expected=memory?pins[file]:option(file==='game.html'?'--expect-main-sha':'--expect-easy-sha');
  if(expected)assert.equal(sha(bytes),expected,file+' exact source pin');
  const parsed=parseHTML(html),matches=parsed.filter(s=>s.type==='js'&&s.text.includes("$('retryBtn').onclick=async()=>{"));
  assert.equal(matches.length,1,file+' unique retry script');const script=matches[0],nodes=[];walk(script.ast,n=>nodes.push(n));
  const select=(label,fn)=>{const found=nodes.filter(fn);assert.equal(found.length,1,file+' '+label+' unique AST node');return found[0];};
  const callback=select('retry callback',n=>n.type==='AssignmentExpression'&&n.left?.type==='MemberExpression'&&n.left.property?.name==='onclick'&&n.left.object?.type==='CallExpression'&&n.left.object.callee?.name==='$'&&n.left.object.arguments[0]?.value==='retryBtn').right;
  assert.equal(callback.type,'ArrowFunctionExpression');assert.equal(callback.async,true);
  const text=n=>script.text.slice(n.start,n.end),actual=text(callback);
  const helperNodes=Object.fromEntries(helperNames.map(name=>[name,select(name,n=>n.type==='FunctionDeclaration'&&n.id?.name===name)]));
  const helpers=Object.fromEntries(helperNames.map(name=>[name,text(helperNodes[name])]));
  const captureReturn=helperNodes._captureBossFieldState.body.body.find(n=>n.type==='ReturnStatement').argument;
  assert.equal(captureReturn.type,'ObjectExpression');
  const actualKeys=captureReturn.properties.map(p=>p.key.name||p.key.value);
  assert.deepEqual(actualKeys.slice().sort(),snapshotKeys.slice().sort(),'actual capture 46-key SSOT');
  for(const key of ['_druidOrbs','_druidOrbT','_druidParryT','_druidParryVolley'])assert.equal(actualKeys.includes(key),false,'transient excluded '+key);
  const orbNode=select('actual druid Orb update',n=>n.type==='IfStatement'&&text(n.test).replace(/\s/g,'')==='(G.stage===0||G.stage===3)&&G.bossAlive'&&text(n.consequent).includes('const _db=G._bossRef;G._druidOrbT='));
  let original,final;
  if(memory){original=actual;assert.equal(original.includes(inserted),false,'original has no retry transient cleanup');final=oneReplace(original,oldAnchor,newAnchor,'scoped retry insertion');}
  else{final=actual;assert.equal(final.split(newAnchor).length-1,1,'live scoped cleanup');original=oneReplace(final,newAnchor,oldAnchor,'live inverse');}
  const begin=script.offset+callback.start,end=script.offset+callback.end;
  const candidateHTML=html.slice(0,begin)+final+html.slice(end),originalHTML=html.slice(0,begin)+original+html.slice(end);
  assert.equal(oneReplace(candidateHTML,final,original,'whole source exact inverse'),originalHTML);
  if(memory)assert.equal(originalHTML,html);
  const finalParsed=memory?parseHTML(candidateHTML):parsed;
  const line=n=>html.slice(0,script.offset+n.start).split('\n').length;
  return {file,sourceBytes:bytes.length,sourceSHA256:sha(bytes),pinVerified:!!expected,helpers,orbCode:text(orbNode),
    variants:{original,final},snapshotKeys:actualKeys,callback:{line:line(callback),originalBytes:Buffer.byteLength(original),finalBytes:Buffer.byteLength(final),originalSHA256:sha(original),finalSHA256:sha(final)},
    functions:Object.fromEntries(helperNames.map(name=>[name,{line:line(helperNodes[name]),bytes:Buffer.byteLength(helpers[name]),sha256:sha(helpers[name]),unchangedByCandidate:true}])),
    orbUpdate:{line:line(orbNode),bytes:Buffer.byteLength(text(orbNode)),sha256:sha(text(orbNode)),unchangedByCandidate:true},
    originalWhole:{bytes:Buffer.byteLength(originalHTML),sha256:sha(originalHTML)},finalWhole:{bytes:Buffer.byteLength(candidateHTML),sha256:sha(candidateHTML)},changeBytes:Buffer.byteLength(candidateHTML)-Buffer.byteLength(originalHTML),inverseExact:true,
    fullParse:{js:finalParsed.filter(s=>s.type==='js').length,json:finalParsed.filter(s=>s.type==='json').length,pass:true}};
}
function fixture(src,variant,{arena=true,stage=0,unlocked=true,demo=false,dbReady=true}={}){
  const events=[],calls={capture:0,restore:0,initStage:0,enterArena:[],saved:[],hurtE:[],hurtP:[],fx:[]};
  const respawn={x:140,y:300},ordinary={id:'field-live',x:150,y:300,hp:17,alive:true,s:'chase',_homeX:150,_homeY:300},corpse={id:'field-dead',hp:0,alive:false,_revTimer:47};
  const object={id:'used-altar',used:true},loot={id:'field-loot',picked:false},hole={x:340,y:500,size:.4,_spawned:7,_spawnTotal:15},rift={id:'unspent-rift',t:9,spawned:false};
  const angler={id:'angler',hp:12,alive:true},devil={id:'devil',hp:23},worm={id:'worm',hp:31};
  const oldOrb={x:respawn.x,y:respawn.y,vx:4,vy:0,t:12,r:26,dmg:30};
  const G={stage,on:false,map:[[0,1,0],[0,0,0]],mw:200,mh:200,rooms:[{id:'field-room',cleared:true}],exits:[{x:3,y:1}],curRoom:1,bossGate:[{x:3,y:1}],bossGateOpen:true,bossSealed:false,
    _bossCx:3,_bossCy:1,_gateY:1,_bossEntY:1.5,_fow:new Uint8Array([1,2,0,1]),spawnHoles:[hole],rifts:[rift],_isTileRLE:true,_isOpenField:true,
    _bossUnlocked:unlocked,_stageKills:83,_totalSpawned:100,_gateGuardKilled:true,_gateGuard:corpse,_deathSpawned:true,
    _regions:Array.from({length:4},(_,id)=>({id,total:15,kills:12,cleared:true,fbIdx:id})),_regMidX:100,_regMidY:100,_regCurIdx:2,_regBannerCd:74,_regGateIdx:1,
    _fieldBoss:angler,_fieldBosses:[null,angler,null,null],_fbDone:true,_fbSpawned:true,_fbAnnounced:true,_fbStage:stage,
    _fireDevils:[null,devil],_fdSpawned:true,_fdAnnounced:true,_fdStage:stage,_worms:[null,worm],_wmStage:stage,_editorEyes:[{id:'field-eye'}],
    _bossArena:false,bossAlive:false,_bossRef:{id:'old-boss',alive:false},parts:[{id:'old-part'}],txts:[{id:'old-text'}],cam:{x:999,y:999},_cutsceneDone:true,
    stageTime:321,_sStats:{deaths:4,items:5},_druidOrbs:[oldOrb],_druidOrbT:47,_druidParryT:89,_druidParryVolley:3};
  const P={x:999,y:999,r:10,exp:101,hp:1,mhp:100,mp:2,mmp:70,st:3,mst:60,shield:0,mshield:50,skills:{chargeBoost:20},maxChargeStocks:5,chargeStocks:0,chargeCd:99,s:'dead',iframes:0,kb:{x:7,y:9},
    _webSlow:6,_trapSlowT:7,_freezeSlow:8,burnT:9,poison:5,_rbPoison:[{id:'poison'}],_rbBurn:[{id:'burn'}],_ioActive:true,_ioT:10,_altAtk:11,_altDef:12,_altSpd:13,_lastStandUsed:true,_reviveOnceUsed:true};
  const INV={marker:'current-inventory',bag:[{id:'current-acquisition'}]},elements=new Map();
  const $=id=>{if(!elements.has(id)){const classes=new Set(['death','victory'].includes(id)?['on']:[]);elements.set(id,{classes,classList:{add(v){classes.add(v);},remove(v){classes.delete(v);}}});}return elements.get(id);};
  const record=name=>(...args)=>{events.push(name);calls.fx.push({name,args});};
  const ctx=vm.createContext({G,P,INV,ens:[ordinary,corpse],MAP_OBJS:[object],worldItems:[loot],$,Math:Object.create(Math),
    _preArenaBackup:null,_DEMO_MODE:demo,_DEMO_LAST_STAGE:3,T:40,sp:1,_dbReady:dbReady,_forceCutscene:false,
    projs:[{id:'enemy-proj'}],pProjs:[{id:'player-proj'}],_impacts:[1],_vfxAnims:[1],_fireExps:[1],_eSpCache:new Map([['old',1]]),
    _mmInitDone:false,_mmInitCtx:{id:'old-arena-cache'},_mmDirty:0,_bgInitQueue:[()=>{}],_bgInitIdx:7,_bgInitDone:false,
    _shDirty:false,_mmRegOvlKey:'old-overlay',_raT:19,_slDirty:false,_litCamX:999,_litCamY:999,
    drawMM:Object.assign(()=>{},{_enCnt:7,_enT:0}),_HARP_GAUGE_BASE_CELLS:5,_HARP_GAUGE_COST:[0,45],_HARP_GAUGE_MAX:225,_harpGauge:4,
    _drReset:record('replay-reset'),_deathDlgStop:record('death-dialog-stop'),_recycleProj:record('enemy-projectile-recycle'),_recyclePProj:record('player-projectile-recycle'),
    _cacheExitCenter:record('exit-cache'),shRebuild:record('spatial-hash'),rebuildDeadPool:record('dead-pool'),safePt:(x,y)=>({x,y}),
    buildMapCache:record('map-cache'),initTorchLights:record('torch'),initSwayObjects:()=>{},initWallEyes:()=>{},_initEyes:()=>{},initGlowObjects:()=>{},
    BGM:{play:key=>events.push('bgm:'+key),stageKey:s=>'stage-'+s},
    initStage(s){events.push('init-stage');calls.initStage++;assert.equal(s,stage);G._druidOrbs=[{id:'factory-stage-orb'}];G._druidOrbT=91;G._druidParryT=92;G._druidParryVolley=93;},
    _enterBossArena(retry){events.push('enter-arena');calls.enterArena.push(retry);G._druidOrbs=[{id:'factory-arena-orb'}];G._druidOrbT=11;G._druidParryT=12;G._druidParryVolley=13;},
    applyStats(){events.push('apply-stats');Object.assign(P,{mhp:111,mmp:222,mst:333,mshield:444});},
    updateQS:()=>events.push('quickslots'),async dbSave(){events.push('db-start');calls.saved.push({exp:P.exp,hp:P.hp,mp:P.mp,st:P.st,shield:P.shield,on:G.on,inventory:plain(INV)});await Promise.resolve();events.push('db-end');},
    isDimBreach:()=>false,ar:()=>({bonusChargeStock:1,el:0}),bt:()=>({bonusChargeStock:1}),_isFused:()=>false,_eqAffix:key=>key==='extraST'?12:0,
    dst:(x,y,a,b)=>Math.hypot(x-a,y-b),_T:x=>x,EL:{P:3},isPWin:()=>false,elMul:()=>1,
    shQuery:()=>[ordinary],hurtE:(...args)=>calls.hurtE.push(args),hurtP:(...args)=>calls.hurtP.push(args),
    poolPart:record('orb-particle'),addParts:record('orb-parts'),playVFXAng:record('orb-vfx'),addTxt:record('orb-text'),doParry:record('orb-parry')});
  ctx.Math.random=()=>.5;
  vm.runInContext(Object.values(src.helpers).join('\n'),ctx,{timeout:1500});
  const expected=ctx._captureBossFieldState();
  assert.deepEqual(Object.keys(expected).sort(),snapshotKeys.slice().sort());
  const realCapture=ctx._captureBossFieldState,realRestore=ctx._restoreBossFieldState,realRefill=ctx._refillRespawnResources;
  ctx._captureBossFieldState=()=>{calls.capture++;events.push('capture-field');return realCapture();};
  ctx._restoreBossFieldState=b=>{calls.restore++;events.push('restore-field');assert.deepEqual(Object.keys(b).sort(),snapshotKeys.slice().sort());return realRestore(b);};
  ctx._refillRespawnResources=()=>{events.push('refill-start');const out=realRefill();events.push('refill-end');return out;};
  if(arena){ctx._preArenaBackup=expected;G._bossArena=true;G.map=[[9]];G.mw=11;G.mh=9;G.rooms=[{id:'arena'}];G.exits=[];G.bossGateOpen=false;G._bossUnlocked=false;G._regions=null;ctx.ens=[{id:'arena-enemy'}];ctx.MAP_OBJS=[];ctx.worldItems=[];G.spawnHoles=[];G.rifts=[];}
  vm.runInContext('var __retryCallback=('+src.variants[variant]+');',ctx,{timeout:1500});
  return {ctx,G,P,INV,expected,calls,events,elements,ordinary,corpse,object,loot,hole,rift,oldOrb,src,
    run:()=>ctx.__retryCallback(),currentCapture:()=>realCapture(),
    observe(){return {orbs:G._druidOrbs.length,orbT:G._druidOrbT,parryT:G._druidParryT,volley:G._druidParryVolley,bossRefNull:G._bossRef===null,bossAlive:G.bossAlive,capture:calls.capture,restore:calls.restore};}};
}
function cleared(f){assert.equal(f.G._druidOrbs.length,0);assert.notEqual(f.G._druidOrbs[0],f.oldOrb);}
function timers(f){assert.equal(f.G._druidOrbT,0);assert.equal(f.G._druidParryT,0);assert.equal(f.G._druidParryVolley,0);}
function fieldPreserved(f){
  assert.deepEqual(plain(f.currentCapture()),plain(f.expected));
  assert.equal(f.ctx.ens[0],f.ordinary);assert.equal(f.ctx.ens[1],f.corpse);assert.equal(f.ctx.MAP_OBJS[0],f.object);assert.equal(f.ctx.worldItems[0],f.loot);
  assert.equal(f.G.spawnHoles[0],f.hole);assert.equal(f.G.rifts[0],f.rift);assert.equal(f.G._fieldBosses[1],f.expected._fieldBosses[1]);
  assert.equal(f.G._regions[0].cleared,true);assert.equal(f.G.bossGateOpen,true);assert.equal(f.G._bossUnlocked,true);assert.equal(f.ordinary.hp,17);assert.equal(f.corpse.alive,false);
}
function resources(f){
  assert.equal(f.P.exp,71);assert.deepEqual([f.P.hp,f.P.mp,f.P.st,f.P.shield],[111,222,333,444]);
  assert.equal(f.P.chargeStocks,5);assert.equal(f.P.chargeCd,0);assert.equal(f.ctx._harpGauge,282);
  assert.equal(f.P.iframes,300);assert.equal(f.P.s,'idle');assert.deepEqual(plain(f.P.kb),{x:0,y:0});
  assert.deepEqual(plain(f.G._bonfire),{x:f.P.x,y:f.P.y,t:300,r:280});
  assert.equal(f.events.filter(e=>e==='apply-stats').length,1);assert.equal(f.events.filter(e=>e==='refill-end').length,1);
  assert(f.events.indexOf('apply-stats')<f.events.indexOf('refill-start'));assert(f.events.indexOf('refill-end')<f.events.indexOf('quickslots'));
}
const cases=[
  ['arena-residual-orbs-cleared',{},async f=>{await f.run();f.observation=f.observe();cleared(f);} ],
  ['arena-three-transient-timers-reset',{},async f=>{await f.run();f.observation=f.observe();timers(f);} ],
  ['unlocked-field-residual-orbs-cleared',{arena:false},async f=>{await f.run();f.observation=f.observe();cleared(f);assert.equal(f.calls.capture,1);assert.equal(f.calls.restore,1);} ],
  ['unlocked-field-three-transient-timers-reset',{arena:false},async f=>{await f.run();f.observation=f.observe();timers(f);} ],
  ['arena-46-key-field-progress-restored',{},async f=>{await f.run();fieldPreserved(f);assert.equal(f.calls.capture,0);assert.equal(f.calls.restore,1);assert.equal(f.calls.initStage,0);} ],
  ['unlocked-field-46-key-current-progress-preserved',{arena:false},async f=>{await f.run();fieldPreserved(f);assert.equal(f.calls.capture,1);assert.equal(f.calls.restore,1);assert.equal(f.calls.initStage,0);} ],
  ['snapshot-copy-and-original-entity-boundaries',{},async f=>{await f.run();assert.notEqual(f.G.map,f.expected.map);assert.notEqual(f.G.map[0],f.expected.map[0]);assert.notEqual(f.G._fow,f.expected._fow);assert.notEqual(f.G._regions,f.expected._regions);assert.notEqual(f.G._regions[0],f.expected._regions[0]);assert.notEqual(f.ctx.ens,f.expected.ens);assert.equal(f.ctx.ens[0],f.expected.ens[0]);assert.notEqual(f.ctx.worldItems,f.expected.worldItems);assert.equal(f.ctx.worldItems[0],f.expected.worldItems[0]);assert.equal(Object.keys(f.expected).length,46);} ],
  ['arena-existing-player-debuff-policy-preserved',{},async f=>{await f.run();assert.equal(f.P._webSlow,6);assert.equal(f.P.poison,5);assert.equal(f.P._lastStandUsed,true);assert.equal(f.P._rbPoison.length,1);} ],
  ['unlocked-field-existing-player-debuff-reset-preserved',{arena:false},async f=>{await f.run();for(const k of ['_webSlow','_trapSlowT','_freezeSlow','burnT','poison','_ioT','_altAtk','_altDef','_altSpd'])assert.equal(f.P[k],0,k);for(const k of ['_ioActive','_lastStandUsed','_reviveOnceUsed'])assert.equal(f.P[k],false,k);assert.equal(f.P._rbPoison.length,0);assert.equal(f.P._rbBurn.length,0);} ],
  ['exp-post-stats-refill-invulnerability-contract',{},async f=>{await f.run();resources(f);assert.equal(f.G.stageTime,321);assert.deepEqual(plain(f.G._sStats),{deaths:4,items:5});assert.deepEqual(plain(f.INV),{marker:'current-inventory',bag:[{id:'current-acquisition'}]});} ],
  ['database-after-stats-refill-and-enable',{arena:false},async f=>{await f.run();resources(f);assert.equal(f.calls.saved.length,1);assert(f.events.indexOf('quickslots')<f.events.indexOf('db-start'));assert(f.events.indexOf('db-start')<f.events.indexOf('db-end'));assert.deepEqual(f.calls.saved[0],{exp:71,hp:111,mp:222,st:333,shield:444,on:true,inventory:plain(f.INV)});} ],
  ['database-not-ready-skips-only-save',{dbReady:false},async f=>{await f.run();resources(f);assert.equal(f.calls.saved.length,0);assert.equal(f.G.on,true);} ],
  ['ordinary-pre-gate-initStage-branch',{arena:false,unlocked:false},async f=>{await f.run();assert.equal(f.calls.initStage,1);assert.equal(f.calls.capture,0);assert.equal(f.calls.restore,0);assert.deepEqual(plain(f.G._zoneState),{});assert.equal(f.G._druidOrbs[0].id,'factory-stage-orb');assert.deepEqual([f.G._druidOrbT,f.G._druidParryT,f.G._druidParryVolley],[91,92,93]);resources(f);} ],
  ['other-stage-ordinary-initStage-branch',{arena:false,stage:1},async f=>{await f.run();assert.equal(f.calls.initStage,1);assert.equal(f.calls.restore,0);assert.equal(f.G._druidOrbs[0].id,'factory-stage-orb');resources(f);} ],
  ['demo-si3-finale-retry-precedes-field-restore',{stage:3,demo:true},async f=>{const backup=f.ctx._preArenaBackup;await f.run();assert.deepEqual(f.calls.enterArena,[true]);assert.equal(f.calls.capture,0);assert.equal(f.calls.restore,0);assert.equal(f.calls.initStage,0);assert.equal(f.ctx._preArenaBackup,backup);assert.equal(f.G._druidOrbs[0].id,'factory-arena-orb');assert.deepEqual([f.G._druidOrbT,f.G._druidParryT,f.G._druidParryVolley],[11,12,13]);assert(f.events.includes('bgm:boss'));resources(f);} ],
  ['non-demo-si3-arena-uses-scoped-field-return',{stage:3},async f=>{await f.run();assert.equal(f.calls.enterArena.length,0);assert.equal(f.calls.restore,1);f.observation=f.observe();cleared(f);timers(f);} ],
  ['actual-orb-block-no-residual-FX-with-null-boss-ref',{},async f=>{await f.run();assert.equal(f.G._bossRef,null);assert.equal(f.G.bossAlive,true);const oldT=f.oldOrb.t;vm.runInContext(f.src.orbCode,f.ctx,{timeout:1500});f.observation={...f.observe(),staleOrbT:f.oldOrb.t,oldT,hurtE:f.calls.hurtE.length,hurtP:f.calls.hurtP.length,orbFX:f.calls.fx.filter(c=>c.name.startsWith('orb-')).length};assert.equal(f.calls.hurtE.length,0);assert.equal(f.calls.hurtP.length,0);assert.equal(f.observation.orbFX,0);assert.equal(f.oldOrb.t,oldT);assert.equal(f.G._druidOrbs.length,0);assert.equal(f.G._druidOrbT,1,'OrbT resets once then resumes frame accumulation');} ],
  ['common-UI-resource-state-and-projectile-cleanup',{},async f=>{await f.run();for(const id of ['death','victory'])assert.equal(f.elements.get(id).classes.has('on'),false);for(const id of ['hud','hudTop','hudCorner','mmWrap','skBar','mmLvl','globeHP','globeMP'])assert.equal(f.elements.get(id).classes.has('on'),true);assert.equal(f.ctx.projs.length,0);assert.equal(f.ctx.pProjs.length,0);assert.equal(f.G._bossArena,false);assert.equal(f.G._bossLoadPhase,0);assert.equal(f.G._bossRef,null);assert.equal(f.G.bossAlive,true);resources(f);} ]
];
(async()=>{
  const sources=files.map(readSource),results=[];
  for(const src of sources)for(const variant of memory?['original','final']:['final'])for(const [id,options,run]of cases){
    const f=fixture(src,variant,options);let error=null;try{await run(f);}catch(e){error=String(e.message);}results.push({file:src.file,variant,id,pass:!error,error,observation:f.observation||null});
  }
  const summary={};for(const variant of memory?['original','final']:['final']){const rows=results.filter(r=>r.variant===variant);summary[variant]={groups:rows.length,pass:rows.filter(r=>r.pass).length,fail:rows.filter(r=>!r.pass).length};}
  const after=Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))])),unchanged=sources.every(s=>after[s.file]===s.sourceSHA256);
  const parseTotals=sources.reduce((a,s)=>({js:a.js+s.fullParse.js,json:a.json+s.fullParse.json}),{js:0,json:0});assert.equal(parseTotals.js,12);assert.equal(parseTotals.json,2);
  let overall=unchanged&&summary.final.fail===0;
  if(memory)overall=overall&&summary.original.fail>0&&results.filter(r=>r.variant==='original'&&r.id==='actual-orb-block-no-residual-FX-with-null-boss-ref').every(r=>r.observation?.staleOrbT>r.observation.oldT&&r.observation.hurtE>0&&r.observation.orbFX>0);
  const report={schemaVersion:1,at:new Date().toISOString(),mode:memory?'memory-red-green':'live-green-only',repo:root,overallPass:overall,sourceUnchanged:unchanged,summary,fullFinalHTMLParse:{...parseTotals,pass:true},
    sourceReceipts:sources.map(({helpers,orbCode,variants,...s})=>({...s,afterSHA256:after[s.file]})),
    actualSourceExtraction:'acorn AST retry async callback, capture/restore 46-key helpers, finale predicate/retry helper, refill helper and standalone Orb update IfStatement; no copied gameplay-function implementations',
    transientResetBoundary:'Only ordinary field-return branch. OrbT is 0 at return and increments to 1 during next extracted frame; no permanent timer lock.',
    stubBoundary:{host:['DOM classList','safePt identity result','spatial hash/dead pool/cache/background callbacks','initStage and _enterBossArena branch routing sentinels'],stats:['applyStats fixed new maxima','equipment/fusion/affix/dimensional leaves'],fx:['replay/dialog/projectile recycle/BGM/quickslot/particle/text/VFX leaves'],database:'async in-memory recorder; no real DB or user save',orbDamage:'hurtE/hurtP recorders and shQuery controlled live field enemy; actual damage handler not accepted'},
    originalFailuresAreExpectedRed:memory,nativeAccepted:false,productionWritten:false,results,
    fixtureBoundary:'Controlled synthetic field/arena/death inputs; actual registration/game loop/native play/visual/audio/performance/real save and factory internals are not accepted.'};
  console.log(JSON.stringify(report,null,2));process.exitCode=overall?0:1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

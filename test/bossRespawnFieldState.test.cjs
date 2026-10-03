// Actual source fragments; no server, DOM application, game loop or result writer.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {parse}=require('acorn');
const root=path.resolve(__dirname,'..');
const sourceRoot=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const plain=value=>JSON.parse(JSON.stringify(value));
const sha=value=>createHash('sha256').update(value).digest('hex');
function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(node.type)visit(node);
  for(const value of Object.values(node)){
    if(Array.isArray(value))for(const child of value)walk(child,visit);
    else if(value&&typeof value==='object')walk(value,visit);
  }
}
function extract(file){
  const bytes=fs.readFileSync(path.join(sourceRoot,file)),source=bytes.toString('utf8'),nodes=[];
  let inlineJavaScript=0,importMapJSON=0;
  for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/i.test(match[1]))continue;
    const type=(/\btype\s*=\s*["']([^"']+)["']/i.exec(match[1])?.[1]||'').toLowerCase();
    if(type==='importmap'){JSON.parse(match[2]);importMapJSON++;continue;}
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    const ast=parse(match[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'});
    inlineJavaScript++;walk(ast,node=>nodes.push({node,text:match[2]}));
  }
  const select=(name,predicate,optional=false)=>{
    const matches=nodes.filter(({node,text})=>predicate(node,text));
    if(optional&&matches.length===0)return '';
    assert.equal(matches.length,1,file+' '+name+' exact source count');
    return matches[0].text.slice(matches[0].node.start,matches[0].node.end);
  };
  const names=['genBossArena','_enterBossArena','_retryDruidFinale','_isDruidFinale','_refillRespawnResources',
    '_cacheExitCenter','_regKill','_regionIdxAt','_fbTick','_fbTickOne','_fbClear','_fdTick','_fdTickOne','_fdClear','_wmTick',
    'shRebuild','_shClearCell','rebuildDeadPool','_appendRotatedColParts','_rebuildColObjs','_ensureColObjs',
    'isW','canMv','safePt','_ch1HillRampAt','_ch1HillBandBlocks','checkRooms','_regionClearedCount'];
  const definitions=names.map(name=>select(name,node=>node.type==='FunctionDeclaration'&&node.id?.name===name));
  for(const name of ['_captureBossFieldState','_restoreBossFieldState']){
    const text=select(name,node=>node.type==='FunctionDeclaration'&&node.id?.name===name,true);
    if(text)definitions.push(text);
  }
  const constants=['_CH1_HILL','_FB_WAKE','_FD_WAKE','_WM_WAKE','_FB_COUNT','_FD_COUNT','_WM_COUNT'];
  for(const name of constants)definitions.push(select(name,node=>node.type==='VariableDeclaration'&&
    node.declarations.length===1&&node.declarations[0].id?.name===name));
  const retry=select('actual retry handler',(node,text)=>node.type==='ExpressionStatement'&&
    text.slice(node.start,node.end).startsWith("$('retryBtn').onclick=async()=>{"));
  const stageInit=nodes.filter(({node})=>node.type==='FunctionDeclaration'&&node.id?.name==='initStage');
  assert.equal(stageInit.length,1,file+' actual initStage count');
  const stageLast=stageInit[0].node.body.body.at(-1);
  const stageAudioTail=stageInit[0].text.slice(stageLast.start,stageLast.end);
  const holes=select('actual progressive-hole update',(node,text)=>node.type==='IfStatement'&&node.test.type==='BinaryExpression'&&
    node.test.operator==='<'&&node.test.left?.name==='_gameFrame'&&node.test.right?.value===120&&text.slice(node.start,node.end).includes('h._spawnDelay'));
  const rifts=select('actual rift update',(node,text)=>node.type==='BlockStatement'&&
    text.slice(node.start,node.end).startsWith('{let rw=0;for(let ri=0;ri<G.rifts.length;ri++)'));
  assert.equal(inlineJavaScript,6);assert.equal(importMapJSON,1);
  console.log('SOURCE_METADATA '+JSON.stringify({file,sha256:sha(bytes),inlineJavaScript,importMapJSON,
    helperPresent:definitions.some(text=>text.startsWith('function _captureBossFieldState(')),
    sourceBoundary:'actual helpers/enter/retry/initStage final audio statement/genArena/special first ticks/hole+rifts/collision/hash',
    doubles:'field fixture, general-stage construction before actual audio tail, enemy factory, render/audio/background sinks, database/stat recalculation, far-asleep special inputs'}));
  const hurtPlayer=select('whole actual hurtP',node=>node.type==='FunctionDeclaration'&&node.id?.name==='hurtP');
  const dotConditions=['P.poison>0','P._rbPoison&&P._rbPoison.length>0','P._rbBurn&&P._rbBurn.length>0'];
  const dotUpdates=dotConditions.map(condition=>select('actual DOT '+condition,(node,text)=>
    node.type==='IfStatement'&&text.slice(node.test.start,node.test.end).replace(/\s/g,'')===condition));
  const iframeUpdate=select('actual iframe decrement',(node,text)=>node.type==='IfStatement'&&
    text.slice(node.start,node.end)==='if(P.iframes>0)P.iframes=Math.max(0,P.iframes-sp);');
  return {file,definitions,retry,holes,rifts,stageAudioTail,hurtPlayer,dotUpdates,iframeUpdate};
}
function fixture(parts,{stage=0,unlocked=true,tileRLE=true,demo=false}={}){
  const ordinary={id:'survivor',x:600,y:660,hp:17,mhp:100,alive:true,ib:false,s:'chase',st2:37,_homeX:600,_homeY:660,kb:{x:2,y:3}};
  const corpse={id:'revive-wait',x:700,y:700,hp:0,alive:false,ib:false,_revTimer:41,_deaths:2,_homeX:700,_homeY:700};
  const fieldIb={id:'field-ib',x:900,y:900,hp:29,alive:true,ib:true,s:'rest',st2:55};
  const fieldBoss={id:'angler',x:7000,y:7000,hp:19,alive:true,asleep:1};
  const fireDevil={id:'firedevil',x:6000,y:7000,hp:23,asleep:1};
  const worm={id:'worm',x:1000,y:7000,homeX:1000,homeY:7000,hp:31,asleep:1};
  const tree={type:'m_ctree13',x:6000,y:6000,scale:1.2,used:true,opened:true,handPlaced:true};
  const altar={type:'altar',x:5500,y:5500,used:true};
  const gateCol={type:'boss_gate_col',x:4020,y:160,opened:true};
  const loot={id:'field-loot',x:600,y:660,type:'item',item:{id:'saved-drop'}};
  const seed={P:{x:4020,y:600,r:10,lv:20,exp:100,hp:1,mhp:100,mp:1,mmp:70,st:1,mst:60,shield:0,mshield:50,
      skills:{chargeBoost:20},maxChargeStocks:5,chargeStocks:0,chargeCd:99,s:'dead',kb:{x:0,y:0}},
    INV:{inventoryMarker:'current-inventory'},ens:[ordinary,corpse,fieldIb],mapObjs:[tree,altar,gateCol],worldItems:[loot],
    G:{stage,on:true,paused:false,map:Array.from({length:200},()=>Array(200).fill(0)),mw:200,mh:200,
      rooms:[{type:'start',cx:100,cy:185,cleared:true},{type:'boss',cx:100,cy:3,cleared:false}],curRoom:1,
      exits:[{x:100,y:7}],bossGate:[{x:100,y:5}],bossGateOpen:true,bossSealed:false,bossAlive:true,
      _bossCx:100,_bossCy:3,_gateY:5,_bossEntY:3.5,_bossUnlocked:unlocked,_gateGuardKilled:true,_gateGuard:corpse,
      _stageKills:83,_totalSpawned:100,_deathSpawned:true,_isTileRLE:tileRLE,_isOpenField:true,
      spawnHoles:[{id:'partial-hole',x:4020,y:600,size:1,room:1,_triggered:true,_spawnDelay:0,_spawnTotal:10,_spawned:3,_spawnCD:7,_spawnInterval:90}],
      rifts:[{id:'partial-rift',x:4020,y:600,t:5,maxT:120,spawned:false,si:stage}],
      _regions:Array.from({length:4},(_,id)=>({id,total:25,kills:20,cleared:true,fbIdx:-1})),
      _regMidX:100,_regMidY:100,_regCurIdx:1,_regBannerCd:74,_regGateIdx:1,
      _fieldBoss:fieldBoss,_fieldBosses:[null,fieldBoss,null,null],_fbDone:true,_fbSpawned:true,_fbAnnounced:true,_fbStage:stage,
      _fireDevils:[null,fireDevil],_fdSpawned:true,_fdAnnounced:true,_fdStage:stage,
      _worms:[null,worm],_wmStage:stage,_editorEyes:[{x:700,y:800}],
      _fow:new Uint8Array(40000),_bossArena:false,parts:[],txts:[],cam:{x:4020,y:600},
      stageTime:321,_sStats:{deaths:4,items:5},_cutsceneDone:true,_aliveEns:3}};
  seed.G.map[2][2]=1;seed.G._fow[39999]=1;seed.G._fow[100]=2;
  const calls={factory:[],initStage:0,roomSpawn:0,corridorSpawn:0,mapObjects:0,mapCache:[],background:[],saved:[]};
  const elements=new Map();
  const $=id=>{if(!elements.has(id))elements.set(id,{classList:{add(){},remove(){}}});return elements.get(id);};
  const sandbox={seed,calls,$,console,window:{},Uint8Array,_DEMO_MODE:demo,_DEMO_LAST_STAGE:3,
    buildMapCache(){calls.mapCache.push({mw:sandbox.G.mw,mh:sandbox.G.mh,arena:sandbox.G._bossArena,x:sandbox.G.cam.x,y:sandbox.G.cam.y});},
    mkEn(x,y,si,etype,ib){const e={id:'factory-'+calls.factory.length,x,y,ib,alive:true,hp:100,r:10};calls.factory.push(e);return e;},
    spawnRoomEns(){calls.roomSpawn++;},spawnCorridorEns(){calls.corridorSpawn++;},
    initStage(){calls.initStage++;sandbox.G._bossUnlocked=false;sandbox.G._regions=null;sandbox.G.spawnHoles=[];sandbox.ens=[];},
    initMapObjects(){calls.mapObjects++;sandbox.MAP_OBJS=[];},
    initTorchLights(){calls.background.push('torch');},initSwayObjects(){calls.background.push('sway');},
    initWallEyes(){calls.background.push('wallEyes');},_initEyes(){calls.background.push('eyes');},initGlowObjects(){calls.background.push('glow');},
    applyStats(){Object.assign(sandbox.P,{mhp:111,mmp:222,mst:333,mshield:444});},
    async dbSave(){calls.saved.push({exp:sandbox.P.exp,inventory:plain(sandbox.INV)});},
    _fbMk(){calls.factory.push({id:'unexpected-angler'});return {x:7000,y:7000,hp:100,asleep:1};},
    _fdMk(){calls.factory.push({id:'unexpected-firedevil'});return {x:7000,y:7000,hp:100,asleep:1};},
    _wmMkAt(x,y){calls.factory.push({id:'unexpected-worm'});return {x,y,hp:100,asleep:1,homeX:x,homeY:y};},
    _wmLockDest(w){w.tpX=w.x;w.tpY=w.y;},_wmAppear(){},
    _pushOutsideBonfire(){},_drReset(){},_deathDlgStop(){},_recycleProj(){},_recyclePProj(){},_clearDeathDecals(){},
    poolPart(){},addParts(){},addTxt(){},shake(){},updateQS(){},playSample(){},_bossSfx:()=>null,_r:v=>v,
    _T:v=>v,_L:v=>v,showPH(){},ar:()=>({}),bt:()=>({}),isDimBreach:()=>false,_isFused:()=>false,_eqAffix:()=>0,
    dst:(x,y,a,b)=>Math.hypot(x-a,y-b),rollEtype:()=>0,_spawnHoleCount:()=>10,
    SFX:{groggy(){}},BGM:{play(){},stageKey:stage=>'stage-'+stage}};
  const context=vm.createContext(sandbox);
  vm.runInContext(`
    var P=seed.P,G=seed.G,INV=seed.INV,ens=seed.ens.slice(),MAP_OBJS=seed.mapObjs.slice(),worldItems=seed.worldItems.slice();
    var _preArenaBackup=null,projs=[],pProjs=[],_impacts=[],_vfxAnims=[],_fireExps=[],_eSpCache=new Map();
    var T=40,SI_TO_HELL=Array.from({length:35},(_,i)=>i<4?0:1),STG=Array.from({length:35},()=>({be:0}));
    var _BOSS_ATHEME=Array.from({length:7},()=>({rc:'rgba(1,2,3,'})),OPT={shake:100},_bossTestReq=-1;
    var _petBubble={t:0},_MAP_QA_MODE=false,_forceCutscene=false,_dbReady=true;
    var _HARP_GAUGE_BASE_CELLS=5,_HARP_GAUGE_COST=[0,45,98,150],_HARP_GAUGE_MAX=225,_harpGauge=4;
    var _bgInitQueue=[initMapObjects],_bgInitIdx=0,_bgInitDone=false;
    var _mmInitDone=false,_mmInitCtx={sentinel:'arena ctx'},_mmDirty=0,_mmCacheStage=G.stage,_mmSkip=19;
    var _mmRegOvlKey='arena overlay',_raT=19,_slDirty=false,_litCamX=G.cam.x,_litCamY=G.cam.y;
    var drawMM=function(){};drawMM._enCnt=5;drawMM._enT=0;
    var SHASH_CELL=128,_shGrid=new Map(),_shCellPool=[],_shPoolI=0,_shDirty=true,_deadPool=[];
    var _colObjs=[],_colObjsSrc=null,_colObjsN=-1,_colScaleLogged=false,_RETIRED_MAP_OBJECT_TYPES=new Set();
    var _OBJ_META={m_ctree13:{collision:true,colSz:60},boss_gate_col:{collision:true,colW:160,colH:40},altar:{}};
    var _FB_SITES=Array.from({length:20},()=>[175,175]),_FB_ELS=Array(20).fill(0),_FD_SITES=Array.from({length:20},()=>[175,175]),_WM_SITES=Array.from({length:20},()=>[175,175]),_maxEns=700,_gameFrame=121,sp=1,SPAWN_HOLE={col:'#fff',name:'hole'};
    var _exitCX=0,_exitCY=0,_dtSp=1;
    ${parts.definitions.join('\n')}
    ${parts.retry}
  `,context,{timeout:2000});
  const run=code=>vm.runInContext(code,context,{timeout:2000});
  const enter=()=>run('_enterBossArena()');
  const retry=()=>$('retryBtn').onclick();
  const ticks=()=>run('_fbTick();_fdTick();_wmTick();');
  const progressTick=()=>run(parts.holes+'\n'+parts.rifts);
  const drainBackground=()=>run('while(_bgInitIdx<_bgInitQueue.length){_bgInitQueue[_bgInitIdx++]()}');
  return {seed,sandbox,context,calls,run,enter,retry,ticks,progressTick,drainBackground,refs:{ordinary,corpse,fieldIb,fieldBoss,fireDevil,worm,tree,altar,gateCol,loot}};
}
function assertResources(w){
  const {P}=w.sandbox;
  for(const [key,max] of [['hp','mhp'],['mp','mmp'],['st','mst'],['shield','mshield']])assert.equal(P[key],P[max]);
  assert.equal(P.chargeStocks,5);assert.equal(P.chargeCd,0);assert.equal(w.sandbox._harpGauge,270);
}
function assertEnemies(w){
  const e=w.sandbox.ens;assert.equal(e.length,3);
  assert.equal(e[0],w.refs.ordinary);assert.equal(e[1],w.refs.corpse);assert.equal(e[2],w.refs.fieldIb);
  assert.equal(e[0].hp,17);assert.equal(e[0].s,'chase');assert.equal(e[0].st2,37);
  assert.deepEqual(plain(e[0].kb),{x:2,y:3});assert.equal(e[1].alive,false);assert.equal(e[1]._revTimer,41);assert.equal(e[2].hp,29);
  assert.equal(w.calls.roomSpawn,0);assert.equal(w.calls.corridorSpawn,0);
}
function installActualDot(w,parts){
  // Equipment/pet/visual sinks are doubles; damage, shield absorption and all
  // iframe/DOT mutations execute the original source, not a damage model.
  Object.assign(w.sandbox,{_petOnHit(){},enhMul:()=>0,pDefAdd:()=>0,_gritTotal:()=>0,_uEq:()=>0,
    sh:()=>({}),cp:()=>({}),gl:()=>({}),pt:()=>({}),hm:()=>({}),nc:()=>({}),rg1:()=>({}),rg2:()=>({}),blt:()=>({}),
    _logDmg(){},die(){throw new Error('unexpected death in bounded DOT fixture');}});
  w.run('var _harpActive=false,_dashActive=false,DR_CAP=.75;P.baseDef=0;INV.equipped={};');
  w.run(parts.hurtPlayer);
  return frames=>w.run(`for(let dotFrame=0;dotFrame<${frames};dotFrame++){${parts.iframeUpdate}\n${parts.dotUpdates.join('\n')}}`);
}
for(const file of ['game.html','game-easy-test.html']){
  const parts=extract(file);
  for(const key of ['poison','_rbPoison','_rbBurn'])for(const step of [1,2]){
    test(file+' arena retry clears inherited '+key+' before actual DOT resumes, sp='+step,async()=>{
      const w=fixture(parts);w.enter();
      Object.assign(w.sandbox.P,{poison:0,_rbPoison:[],_rbBurn:[],_ioActive:false,_lastStandUsed:true,_reviveOnceUsed:true});
      w.sandbox.P[key]=key==='poison'?12:[{t:600,tick:0,total:200}];
      await w.retry();const health=w.sandbox.P.hp+w.sandbox.P.shield;
      const advance=installActualDot(w,parts);w.sandbox.sp=step;
      advance(149/step|0);assert.equal(w.sandbox.P.hp+w.sandbox.P.shield,health,'respawn iframe shields damage');
      advance(351/step+1|0);assert.equal(w.sandbox.P.hp+w.sandbox.P.shield,health,'no prior-life DOT after iframe expiration');
      assert.equal(w.sandbox.P.iframes,0);assertEnemies(w);assert.equal(w.sandbox.G.bossGateOpen,true);
      assert.equal(w.sandbox.P._lastStandUsed,true);assert.equal(w.sandbox.P._reviveOnceUsed,true);
      assert.equal(w.calls.saved.length,1);assert.equal(w.sandbox.P.exp,70);
    });
  }
  for(const key of ['poison','_rbPoison','_rbBurn']){
    test(file+' ongoing-life '+key+' retains original actual damage and expiration',()=>{
      const w=fixture(parts),advance=installActualDot(w,parts);
      Object.assign(w.sandbox.P,{s:'idle',iframes:0,hp:111,mhp:111,shield:444,mshield:444,poison:0,_rbPoison:[],_rbBurn:[],_ioActive:false});
      w.sandbox.P[key]=key==='poison'?1:[{t:60,tick:0,total:200}];
      const health=w.sandbox.P.hp+w.sandbox.P.shield;advance(61);
      assert.ok(w.sandbox.P.hp+w.sandbox.P.shield<health,'current-life DOT still damages');
      assert.ok(key==='poison'?w.sandbox.P.poison<=0:w.sandbox.P[key].length===0,'original lifetime expires');
    });
  }
  // Whole actual retry handler; the general initStage path uses its actual final
  // audio statement after the existing stage-construction double, not full map init.
  for(const branch of ['opened-field','arena','general'])for(const failure of ['play','stageKey']){
    test(file+' retry audio boundary '+branch+' '+failure+' cannot strand dead resources or skip save',async()=>{
      const w=fixture(parts,{unlocked:branch!=='general'});
      if(branch==='arena')w.enter();
      w.sandbox.G.on=false;w.sandbox.P.s='dead';
      const events=[],error=new Error('injected '+failure),logs=[];
      w.sandbox.console={...console,error(...args){logs.push(args);}};
      w.sandbox.BGM={stageKey(stage){events.push(['stageKey',stage]);if(failure==='stageKey')throw error;return 'stage-'+stage;},
        play(key){events.push(['play',key]);if(failure==='play')throw error;}};
      w.sandbox.updateQS=()=>events.push(['quickslots',w.sandbox.P.hp,w.sandbox.P.mhp]);
      w.sandbox.dbSave=async()=>{events.push(['save',w.sandbox.G.on,w.sandbox.P.s]);w.calls.saved.push({exp:w.sandbox.P.exp});};
      if(branch==='general'){
        const stageDouble=w.sandbox.initStage;
        w.sandbox.initStage=si=>{stageDouble(si);w.sandbox.si=si;w.run(parts.stageAudioTail);};
      }
      await w.retry();
      assertResources(w);assert.equal(w.sandbox.G.on,true);assert.equal(w.sandbox.P.s,'idle');
      assert.equal(w.sandbox.P.iframes,300);assert.equal(w.sandbox.G._bonfire.t,300);assert.equal(w.sandbox.G._bonfire.r,280);
      assert.equal(w.sandbox.P.exp,70);assert.equal(w.calls.saved.length,1);
      assert.deepEqual(events.at(-1),['save',true,'idle']);
      assert.deepEqual(events.at(-2),['quickslots',111,111]);
      assert.equal(logs.length,1);assert.equal(logs[0].at(-1),error);
      if(branch!=='general'){
        assertEnemies(w);assert.equal(w.calls.initStage,0);assert.equal(w.sandbox.G._bossUnlocked,true);
        assert.equal(w.sandbox.G.bossGateOpen,true);assert.equal(w.sandbox.G._regions.filter(r=>r.cleared).length,4);
      }else assert.equal(w.calls.initStage,1);
    });
  }
  test(file+' retry audio boundary keeps planned cutscene mute and db-not-ready policy',async()=>{
    for(const condition of ['forced','first-stage']){
      const w=fixture(parts);w.sandbox.G.on=false;w.sandbox._dbReady=false;
      w.sandbox._forceCutscene=condition==='forced';w.sandbox.G._cutsceneDone=condition!=='first-stage';
      w.sandbox.BGM={stageKey(){throw new Error('must stay deferred');},play(){throw new Error('must stay deferred');}};
      await w.retry();assertResources(w);assert.equal(w.sandbox.G.on,true);assert.equal(w.calls.saved.length,0);assertEnemies(w);
    }
  });
  test(file+' retry audio boundary preserves non-audio cache and save error propagation',async()=>{
    const cache=fixture(parts),error=new Error('cache failure');cache.sandbox.G.on=false;
    cache.sandbox.buildMapCache=()=>{throw error;};
    await assert.rejects(cache.retry(),e=>e===error);assert.equal(cache.sandbox.G.on,false);assert.equal(cache.calls.saved.length,0);
    const save=fixture(parts),dbError=new Error('save failure');save.sandbox.G.on=false;
    save.sandbox.dbSave=async()=>{throw dbError;};
    await assert.rejects(save.retry(),e=>e===dbError);assert.equal(save.sandbox.G.on,true);assertResources(save);
  });
  test(file+' thunderStake arena transition and real retry clear only temporary state',async()=>{
    const w=fixture(parts);w.sandbox.G._thunderStakes=[{x:20,y:30,t:1,maxT:900}];
    w.sandbox.P._tsAiming=true;w.enter();
    assert.equal(w.sandbox.G._thunderStakes,null);assert.equal(w.sandbox.P._tsAiming,false);
    w.sandbox.G._thunderStakes=[{x:80,y:90,t:1,maxT:900}];w.sandbox.P._tsAiming=true;
    await w.retry();assert.equal(w.sandbox.G._thunderStakes,null);assert.equal(w.sandbox.P._tsAiming,false);
    assertEnemies(w);assert.equal(w.sandbox.G._bossUnlocked,true);assertResources(w);
  });
  test(file+' thunderStake unlocked-field retry preserves progress while cancelling aim',async()=>{
    const w=fixture(parts),before=plain(w.sandbox.G.map);
    w.sandbox.G._thunderStakes=[{x:20,y:30,t:1,maxT:900}];w.sandbox.P._tsAiming=true;
    await w.retry();assert.equal(w.sandbox.G._thunderStakes,null);assert.equal(w.sandbox.P._tsAiming,false);
    assert.equal(w.calls.initStage,0);assertEnemies(w);assert.equal(w.sandbox.G._bossUnlocked,true);
    assert.deepEqual(plain(w.sandbox.G.map),before);assertResources(w);
  });
  test(file+' arena death restores original enemies through repeated retry/reentry',async()=>{
    const w=fixture(parts,{tileRLE:false});
    for(let n=0;n<2;n++){
      w.enter();assert.equal(w.sandbox.G._bossArena,true);assert.equal(w.sandbox.ens.length,1);
      await w.retry();assertEnemies(w);assert.equal(w.sandbox.G._bossUnlocked,true);
      w.ticks();assertEnemies(w);
    }
    assertResources(w);
  });
  test(file+' opened CH1 field death preserves current field and avoids initStage',async()=>{
    const w=fixture(parts);const map=plain(w.sandbox.G.map);await w.retry();
    assert.equal(w.calls.initStage,0);assertEnemies(w);assert.deepEqual(plain(w.sandbox.G.map),map);
    assert.equal(w.sandbox.G._bossUnlocked,true);assert.equal(w.sandbox.G.bossGateOpen,true);assert.equal(w.sandbox.G.bossSealed,false);
    w.ticks();assertEnemies(w);assertResources(w);
  });
  test(file+' opened field retry preserves cleanup while arena retry clears only inherited damage statuses',async()=>{
    const flags=['_webSlow','_trapSlowT','_freezeSlow','burnT','poison','_ioT','_altAtk','_altDef','_altSpd'];
    const seedStatus=w=>{for(const key of flags)w.sandbox.P[key]=81;Object.assign(w.sandbox.P,{_rbPoison:[{t:40}],_rbBurn:[{t:50}],_ioActive:true,_lastStandUsed:true,_reviveOnceUsed:true});};
    const field=fixture(parts);seedStatus(field);field.sandbox.INV.inventoryMarker='current-on-death';field.sandbox.P.exp=200;
    await field.retry();for(const key of flags)assert.equal(field.sandbox.P[key],0,key);
    for(const key of ['_ioActive','_lastStandUsed','_reviveOnceUsed'])assert.equal(field.sandbox.P[key],false,key);
    for(const key of ['_rbPoison','_rbBurn'])assert.equal(field.sandbox.P[key].length,0,key);
    assert.equal(field.sandbox.INV.inventoryMarker,'current-on-death');assert.equal(field.sandbox.P.exp,140);assertResources(field);
    const arena=fixture(parts);arena.enter();seedStatus(arena);await arena.retry();
    for(const key of flags)assert.equal(arena.sandbox.P[key],key==='poison'?0:81,key);
    assert.equal(arena.sandbox.P._ioActive,true);
    for(const key of ['_rbPoison','_rbBurn'])assert.equal(arena.sandbox.P[key].length,0,key);
    for(const key of ['_lastStandUsed','_reviveOnceUsed'])assert.equal(arena.sandbox.P[key],true,key);
  });
  test(file+' actual checkRooms gate predicate remains eligible after restoration and still rejects locked/incomplete field',async()=>{
    for(const openedField of [false,true]){
      const w=fixture(parts);if(!openedField)w.enter();await w.retry();
      w.run('P.x=(G.exits[0].x+.5)*T;P.y=(G.exits[0].y+.5)*T;G._crT=29;checkRooms();');
      assert.equal(w.sandbox.G._bossLoadPhase,1);assert.equal(w.sandbox.G._fbDone,true);
      assert.equal(w.sandbox.G._regions.filter(r=>r.cleared).length,4);
      w.run('G._bossLoadPhase=0;G._fbDone=false;G._crT=29;checkRooms();');assert.equal(w.sandbox.G._bossLoadPhase,0);
      w.run('G._fbDone=true;G._bossUnlocked=false;G._regions.forEach(r=>r.cleared=false);G._crT=29;checkRooms();');
      assert.equal(w.sandbox.G._bossLoadPhase,0);
    }
  });
  test(file+' arena kills/drops do not pollute region snapshot or rewind player progress',async()=>{
    const w=fixture(parts);const originalRegions=plain(w.sandbox.G._regions);w.enter();
    w.run("_regKill({x:500,y:500,_homeX:500,_homeY:500,ib:false});G._stageKills=999;worldItems.push({id:'arena-only'});P.exp=200;INV.inventoryMarker='earned-in-arena';G.stageTime=999;G._sStats.deaths=7;");
    await w.retry();assert.deepEqual(plain(w.sandbox.G._regions),originalRegions);assert.equal(w.sandbox.G._stageKills,83);
    assert.equal(w.sandbox.G._totalSpawned,100);assert.equal(w.sandbox.G._gateGuard,w.refs.corpse);assert.equal(w.sandbox.G._gateGuardKilled,true);
    assert.equal(w.sandbox.G._deathSpawned,true);assert.equal(w.sandbox.P.exp,140);assert.equal(w.sandbox.INV.inventoryMarker,'earned-in-arena');
    assert.equal(w.sandbox.G.stageTime,999);assert.equal(w.sandbox.G._sStats.deaths,7);assert.equal(w.sandbox.worldItems[0],w.refs.loot);
    assert.equal(w.sandbox.worldItems.length,1);assert.equal(w.calls.saved[0].exp,140);
  });
  test(file+' special enemies retain dead slots, HP, stage flags through first tick',async()=>{
    const w=fixture(parts);w.enter();await w.retry();const factories=w.calls.factory.length;w.ticks();
    assert.equal(w.sandbox.G._fieldBosses[0],null);assert.equal(w.sandbox.G._fieldBosses[1],w.refs.fieldBoss);
    assert.equal(w.sandbox.G._fieldBoss,w.refs.fieldBoss);assert.equal(w.refs.fieldBoss.hp,19);
    assert.equal(w.sandbox.G._fireDevils[0],null);assert.equal(w.sandbox.G._fireDevils[1],w.refs.fireDevil);assert.equal(w.refs.fireDevil.hp,23);
    assert.equal(w.sandbox.G._worms[0],null);assert.equal(w.sandbox.G._worms[1],w.refs.worm);assert.equal(w.refs.worm.hp,31);
    for(const key of ['_fbStage','_fdStage','_wmStage'])assert.equal(w.sandbox.G[key],0);
    for(const key of ['_fbDone','_fbSpawned','_fbAnnounced','_fdSpawned','_fdAnnounced'])assert.equal(w.sandbox.G[key],true);
    assert.equal(w.calls.factory.length,factories);
    const empty=fixture(parts);empty.run('G._fieldBoss=null;G._fieldBosses=[];G._fireDevils=[];G._worms=[];');empty.enter();await empty.retry();
    empty.ticks();for(const key of ['_fieldBosses','_fireDevils','_worms'])assert.equal(empty.sandbox.G[key].length,0);
    assert.equal(empty.calls.factory.length,1);
  });
  test(file+' CH1 and generic arena detach field-special references before actual first ticks',async()=>{
    for(const stage of [0,2]){
      const w=fixture(parts,{stage});w.refs.worm.asleep=0;w.refs.worm.phase='hide';w.refs.worm.hideT=88;
      const before=plain([w.refs.fieldBoss,w.refs.fireDevil,w.refs.worm]);w.enter();const factories=w.calls.factory.length;
      assert.equal(w.sandbox.G._worms.length,0);if(stage===0){assert.equal(w.sandbox.G._fieldBosses,null);assert.equal(w.sandbox.G._fireDevils,null);}
      w.ticks();assert.equal(w.calls.factory.length,factories);assert.deepEqual(plain([w.refs.fieldBoss,w.refs.fireDevil,w.refs.worm]),before);
      await w.retry();assert.equal(w.sandbox.G._worms[1],w.refs.worm);assert.equal(w.refs.worm.hideT,88);
    }
  });
  test(file+' uninitialized CH1 special flags cannot generate field enemies during arena tick',async()=>{
    const w=fixture(parts);w.run('G._fbDone=false;G._fbSpawned=false;G._fdSpawned=false;G._fbStage=-1;G._fdStage=-1;G._wmStage=-1;');
    w.enter();const factories=w.calls.factory.length;w.ticks();assert.equal(w.calls.factory.length,factories);
    await w.retry();for(const key of ['_fbStage','_fdStage','_wmStage'])assert.equal(w.sandbox.G[key],-1);
    for(const key of ['_fbDone','_fbSpawned','_fdSpawned'])assert.equal(w.sandbox.G[key],false);
    assert.equal(w.sandbox.G._fieldBosses[1],w.refs.fieldBoss);assert.equal(w.sandbox.G._worms[1],w.refs.worm);
  });
  test(file+' generic arena with an uninitialized worm stage cannot regenerate field worms',async()=>{
    const w=fixture(parts,{stage:2});w.sandbox.G._wmStage=-1;w.enter();const factories=w.calls.factory.length;
    w.run('_wmTick();');assert.equal(w.calls.factory.length,factories);assert.equal(w.sandbox.G._worms.length,0);
    await w.retry();assert.equal(w.sandbox.G._wmStage,-1);assert.equal(w.sandbox.G._worms[1],w.refs.worm);
  });
  test(file+' progressive hole and rift continue partial timers without new spawn',async()=>{
    const w=fixture(parts);w.enter();await w.retry();const factories=w.calls.factory.length;w.progressTick();
    const h=w.sandbox.G.spawnHoles[0],r=w.sandbox.G.rifts[0];
    assert.equal(h._triggered,true);assert.equal(h._spawned,3);assert.equal(h._spawnTotal,10);assert.equal(h._spawnDelay,0);
    assert.equal(h._spawnCD,6);assert.equal(h._spawnInterval,90);assert.equal(r.t,6);assert.equal(r.spawned,false);
    assert.equal(w.calls.factory.length,factories);
  });
  test(file+' used objects, authored collision, field loot and exploration survive deferred initialization',async()=>{
    const w=fixture(parts);const explored=Array.from(w.sandbox.G._fow);w.enter();await w.retry();w.drainBackground();
    assert.equal(w.calls.mapObjects,0);assert.equal(w.sandbox.MAP_OBJS.length,3);
    assert.equal(w.sandbox.MAP_OBJS[0],w.refs.tree);assert.equal(w.sandbox.MAP_OBJS[1],w.refs.altar);assert.equal(w.refs.altar.used,true);
    assert.equal(w.sandbox.MAP_OBJS[2],w.refs.gateCol);assert.equal(w.refs.gateCol.opened,true);
    assert.equal(w.run('isW(6000,6000)'),true);assert.equal(w.run('isW(5800,6000)'),false);
    assert.deepEqual(Array.from(w.sandbox.G._fow),explored);assert.equal(w.sandbox.G._fowDirty,true);
    assert.equal(w.sandbox.worldItems[0],w.refs.loot);assert.deepEqual(plain(w.sandbox.G._editorEyes),[{x:700,y:800}]);
  });
  test(file+' first restored frame invalidates arena minimap/light and enemy lookup caches',async()=>{
    const w=fixture(parts);w.enter();w.run('_shDirty=true;shRebuild();_deadPool.push(ens[0]);');await w.retry();
    assert.equal(w.sandbox._mmInitDone,true);assert.equal(w.sandbox._mmInitCtx,null);assert.equal(w.sandbox._mmDirty,1);
    assert.equal(w.sandbox._mmRegOvlKey,'');assert.equal(w.sandbox._raT,0);assert.equal(w.sandbox._slDirty,true);
    assert.notEqual(w.sandbox._litCamX,w.sandbox.G.cam.x);assert.notEqual(w.sandbox._litCamY,w.sandbox.G.cam.y);
    assert.equal(w.sandbox.drawMM._enCnt,0);assert.equal(w.sandbox.drawMM._enT,29);
    assert.equal(w.run('[..._shGrid.values()].flat().every(e=>ens.includes(e))'),true);
    assert.equal(w.run('_deadPool.length===1&&_deadPool[0]===ens[1]'),true);
    const last=w.calls.mapCache.at(-1);assert.equal(last.mw,200);assert.equal(last.arena,false);assert.equal(last.x,w.sandbox.P.x);
  });
  test(file+' pre-unlock CH1 and other-stage field deaths retain normal reset',async()=>{
    for(const options of [{stage:0,unlocked:false},{stage:1,unlocked:true}]){
      const w=fixture(parts,options);await w.retry();assert.equal(w.calls.initStage,1);assert.equal(w.sandbox.P.exp,70);assertResources(w);
    }
  });
  test(file+' generic arena return preserves field and demo si3 direct retry keeps precedence',async()=>{
    const generic=fixture(parts,{stage:2,tileRLE:false});generic.enter();await generic.retry();assertEnemies(generic);assert.equal(generic.calls.initStage,0);
    const demo=fixture(parts,{stage:3,demo:true});demo.enter();const checkpoint=demo.sandbox._preArenaBackup;await demo.retry();
    assert.equal(demo.sandbox._preArenaBackup,checkpoint);assert.equal(demo.sandbox.G._bossArena,true);assert.equal(demo.sandbox.G.mw,128);
    assert.equal(demo.sandbox.ens.length,1);assert.equal(demo.sandbox.ens[0]._druidRetry,true);assert.equal(demo.calls.initStage,0);
    assert.equal(demo.sandbox.P.exp,70);assertResources(demo);
  });
  test(file+' restored field collision participates in actual safe gate spawn',async()=>{
    const w=fixture(parts);w.sandbox.MAP_OBJS.push({type:'m_ctree13',x:4020,y:460});w.enter();await w.retry();
    assert.equal(w.calls.initStage,0);assert(Number.isFinite(w.sandbox.P.x)&&Number.isFinite(w.sandbox.P.y));
    assert.notDeepEqual([w.sandbox.P.x,w.sandbox.P.y],[4020,460]);assert.equal(w.run('canMv(P.x,P.y,P.r)'),true);
    assert.equal(w.run('_exitCX'),100);assert.equal(w.run('_exitCY'),7);
  });
}

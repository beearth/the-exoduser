// Actual complete die, fallenResolve, hurtE, retry callback and initStage.
// Frame pieces use actual fallen/poison/chain/HUD source; full update/AI/native are not run.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR;
const plain=x=>JSON.parse(JSON.stringify(x));
function extract(html){
  const fn=name=>{const at=html.indexOf('function '+name+'(');assert(at>=0,name);return html.slice(at,acorn.parseExpressionAt(html,at,{ecmaVersion:'latest'}).end)};
  // Parse bounded functions rather than HTML following an isolated statement.
  const update=fn('update'),enemy=fn('updateE'),draw=fn('draw');
  const select=(code,predicate)=>{const nodes=[];function walk(n){if(!n||typeof n!=='object')return;if(n.type&&predicate(n,code))nodes.push(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v)}}walk(acorn.parse(code,{ecmaVersion:'latest'}));assert.equal(nodes.length,1);return code.slice(nodes[0].start,nodes[0].end)};
  const cond=(code,txt)=>select(code,(n,s)=>n.type==='IfStatement'&&s.slice(n.test.start,n.test.end).replace(/\s/g,'')===txt);
  const fallen=select(update,n=>n.type==='SwitchCase'&&n.test?.value==='fallen');
  const retryAt=html.indexOf("$('retryBtn').onclick=async()=>");assert(retryAt>=0);
  const arrowAt=retryAt+"$('retryBtn').onclick=".length;
  const retry=html.slice(arrowAt,acorn.parseExpressionAt(html,arrowAt,{ecmaVersion:'latest'}).end);
  return {defs:['die','_fallenResolve','hurtE','initStage','nextStage','_refillRespawnResources'].map(fn).join('\n'),
    retry,fallen:'switch(P.s){'+fallen+'}',poison:cond(enemy,'e.poisonT>0'),timer:cond(update,'G._chainT>0'),hud:cond(draw,'G._chainCnt>=2'),
    update,enemy,hurt:fn('hurtE')};
}
function fixture(p,{bossTest=-1,failMap=false}={}){
  const events=[],saved=[],texts=[],error=new Error('map failure'),els=new Map();
  const sink=name=>(...a)=>events.push([name,...a]);
  const $=id=>{if(!els.has(id))els.set(id,{style:{},classList:{add(){},remove(){},contains:()=>false}});return els.get(id)};
  const G={on:true,stage:1,kills:0,mats:0,combo:0,comboMax:0,comboTimer:0,_chainCnt:0,_chainT:0,rifts:[],spawnHoles:[],parts:[],txts:[],cam:{x:0,y:0},map:[[0]],mw:8,mh:8,rooms:[],exits:[],slowMo:0,hitStop:0,bossAlive:false,_cutsceneDone:true,_sStats:{deaths:0}};
  const P={x:200,y:200,r:10,facing:0,s:'idle',hp:100,mhp:100,mp:50,mmp:50,st:60,mst:60,shield:20,mshield:20,lv:1,exp:100,maxChargeStocks:2,skills:{}};
  const math=Object.assign(Object.create(Math),{random:()=>.75});
  const map=()=>{if(failMap)throw error;G.map=Array.from({length:8},()=>Array(8).fill(0));G.rooms=[{type:'start',cx:4,cy:4}];G._isTileRLE=true;G.spawnHoles=[];G.bossGate=[];events.push(['generate'])};
  const c={Math:math,G,P,$,window:{},console,INV:{equipped:{}},PASSIVES:{},ens:[],projs:[],pProjs:[],worldItems:[],MAP_OBJS:[],TOTAL_STAGES:35,T:40,sp:1,_now:0,
    _bossTestReq:bossTest,_BOOTH_MODE:false,_DIABLO_FIELD_QA:false,_MAP_QA_MODE:false,_MAP_QA_COMBAT:false,_bootMapBuildDefer:false,_useGPU:false,_useGL:false,_ESPRITES:{},_skinSeqIdx:0,_eSpCache:new Map(),_impacts:[],_vfxAnims:[],_fireExps:[],_shDirty:false,_eyeObjs:[],_eyeInited:true,_bgInitQueue:[],_bgInitDone:true,_bgInitIdx:0,
    _preArenaBackup:null,_forceCutscene:false,_dbReady:true,_gxTurret:null,_boothDeadF:-1,_shBufI:0,_hitSfxCd:0,_impPerFrame:0,_txtPerFrame:0,_TXT_BUDGET:12,_dpsDmg:0,_dpsBuf:[],_dpsIdx:0,_dpsVal:0,_UNDEAD_ET:new Set(),EL:{F:1,I:2,D:3,L:4,P:5},ELC:{},_HS:{kill:0},OPT:{shake:100,hitStop:100,parts:100},_ddDeaths:0,_ddChapDeathMap:{},_dmgLog:[],_drLen:0,_HARP_GAUGE_BASE_CELLS:5,_HARP_GAUGE_COST:[0,45,98,150],_harpGauge:0,_HARP_GAUGE_MAX:225,
    _T:x=>x,_L:x=>x,_r:x=>x,_eqAffix:()=>0,_eqImplicit:()=>0,_uEq:()=>0,_predBonus:()=>0,_diffSigned:()=>0,statStr:()=>1,statCrit:()=>0,statCritDmg:()=>1.5,_hunterMul:()=>1,elMul:()=>1,pDotDmg:()=>1,pDotDur:()=>1,
    wp:()=>({}),nc:()=>({}),rg1:()=>({}),rg2:()=>({}),ar:()=>({}),bt:()=>({}),shQuery:()=>[],dst:(x,y,a,b)=>Math.hypot(x-a,y-b),isDimBreach:()=>false,_isFused:()=>false,_isDruidFinale:()=>false,isRareEtype:()=>false,_retryDruidFinale:()=>false,
    SI_TO_HELL:Array(35).fill(0),STG:Array(35).fill({hell:0,be:0}),HELL_NAMES:['forest'],CHAPTER_STAGES:[{startSi:0,stages:4}],_DEMO_MODE:false,_DEMO_LAST_STAGE:3,
    _getFixedMapForStage:()=>({}),genFromTemplate:map,genGauntlet:map,_canMvTile:()=>true,canMv:()=>true,safePt:()=>null,rollEtype:()=>0,rollEl:()=>0,mkEn:()=>null,
    _eMouthXY:e=>({x:e.x,y:e.y}),_maliceMul:()=>1,addPotion:()=>false,
    _load8DirAtlas:sink('atlas'),_enterBossArena:sink('arena'),_regionInit:sink('regions'),buildMapCache:sink('cache'),initTorchLights:sink('torch'),_tickBgInit:sink('background'),
    addTxt:sink('text'),addParts:sink('parts'),poolPart:sink('particle'),shake:sink('shake'),playSample:sink('sample'),addExp:sink('xp'),
    SFX:{beamStop(){},levelup(){},die(){},groggy(){}},BGM:{stageKey:si=>'stage'+si,play:sink('music'),fadeOut:sink('fade')},
    setTimeout:f=>events.push(['timer']),async dbSave(){saved.push({exp:P.exp})},applyStats(){},updateQS(){},C:{width:800},X:{fillText:t=>texts.push(t),fillRect(){}}};
  for(const name of ['_petSayCD','_petOnDeath','ultUnmute','_stopShieldLoop','_petOnAtk','_petOnKill','_regKill','atkTicketRelease','deathFX','_spawnLargeMonsterDeathFx','_addCorpse','_addBurnCorpse','_addGorePiece','_addDeathImpact','rollDrop','checkRooms','dbSaveNow','_drReset','_deathDlgStop','_deathDlgStart','_cacheExitCenter','_recycleProj','_recyclePProj','_clearDeathDecals','_clearExtEPalCache','_clearExtBPalCache','spawnRoomEns','spawnCorridorEns','_spawnCh1StartMediumEyeMasses','initSwayObjects','initWallEyes','_initEyes','initGlowObjects','initMapObjects'])c[name]=()=>{};
  vm.createContext(c);vm.runInContext(p.defs+'\nvar retry='+p.retry,c);
  const run=s=>vm.runInContext(s,c,{timeout:2000});
  const kill=(e={hp:1,mhp:1,x:200,y:200,r:8,etype:0,alive:true,ib:false,elite:0,lv:1,mods:[],kb:{x:0,y:0}})=>{c.e=e;c.hurtE(e,10,undefined,true,{dot:true,shieldHit:true});return e};
  const hud=()=>{texts.length=0;run(p.hud);return texts.slice()};
  return {c,G,P,events,saved,els,error,run,kill,hud,retry:()=>c.retry(),tick:()=>{if(G.on){run(p.fallen);run(p.timer)}}};
}
for(const file of ['game.html','game-easy-test.html']){
  const p=extract(fs.readFileSync(path.join(dir,file),'utf8'));
  const old=baseline?extract(fs.readFileSync(path.join(baseline,file),'utf8')):p;
  test(file+' source timing premise: die leaves game running, initial chain expires before death UI',()=>{
    const w=fixture(p);w.kill();w.kill();w.c.die();assert.equal(w.G.on,true);assert.equal(w.P.st2,300);
    for(let i=0;i<300;i++)w.tick();assert.equal(w.P.s,'dead');assert.equal(w.G.on,false);assert.equal(w.G._chainCnt,0);assert.equal(w.G._chainT,0);
  });
  test(file+' late poison kills during fallen do not carry chain into rebuilt stage or reward next-life kill',async()=>{
    const w=fixture(p);const poisoned=Array.from({length:4},()=>({hp:450,mhp:450,x:200,y:200,r:8,etype:0,alive:true,ib:false,elite:0,lv:1,mods:[],kb:{x:0,y:0},poisonT:300,_poisonPool:500}));
    w.c.die();for(let i=0;i<300;i++){
      if(w.G.on){w.run(p.fallen);for(const e of poisoned){if(e.alive){w.c.e=e;w.run(p.poison)}}w.run(p.timer)}
      if(i===240){assert.equal(w.P.s,'fallen');assert.equal(w.G._chainCnt,4);assert.equal(w.G._chainT,179);assert.ok(poisoned.every(e=>!e.alive))}
    }
    assert.equal(w.G.on,false);assert.equal(w.P.s,'dead');assert.equal(w.G._chainCnt,4);assert.equal(w.G._chainT,120);
    await w.retry();assert.equal(w.G.on,true);assert.equal(w.P.s,'idle');assert.equal(w.G._chainCnt,0);assert.equal(w.G._chainT,0);assert.deepEqual(w.hud(),[]);
    assert.equal(w.G.rifts.length,0);w.kill();assert.equal(w.G._chainCnt,1);assert.equal(w.G.rifts.length,0);assert.deepEqual(w.saved,[{exp:70}]);
  });
  test(file+' ordinary chain threshold, countdown and HUD remain unchanged',()=>{
    const a=fixture(p),b=fixture(old);for(let i=1;i<=5;i++){a.kill();b.kill();assert.deepEqual(plain(a.G),plain(b.G));assert.deepEqual(a.hud(),b.hud());assert.equal(a.G._chainCnt,i===5?0:i);assert.equal(a.G.rifts.length,i===5?1:0)}
    assert.equal(a.G.rifts[0].maxT,120);assert.equal(a.G._chainT,180);for(let i=0;i<180;i++){a.run(p.timer);b.run(old.timer)}assert.deepEqual(plain(a.G),plain(b.G));assert.equal(a.G._chainT,0);
  });
  test(file+' clean full normal initStage preserves all other state and sinks',()=>{
    const a=fixture(p),b=fixture(old);a.c.initStage(1);b.c.initStage(1);assert.deepEqual(plain(a.G),plain(b.G));assert.deepEqual(plain(a.P),plain(b.P));assert.deepEqual(a.events,b.events);
  });
  for(const stage of [0,1,3,100])test(file+' full ordinary initStage resets chain with existing combo for stage '+stage,()=>{
    const w=fixture(p);w.kill();w.kill();w.c.initStage(stage);assert.equal(w.G._chainCnt,0);assert.equal(w.G._chainT,0);assert.equal(w.G.combo,0);assert.equal(w.G.stage,Math.min(stage,34));
  });
  test(file+' actual nextStage already clears chain before full stage initialization',()=>{
    const a=fixture(p),b=fixture(old);for(const w of [a,b]){w.kill();w.kill();w.c.nextStage();assert.equal(w.G._chainCnt,0);assert.equal(w.G._chainT,0);assert.equal(w.G.stage,2);assert.equal(w.G.on,true)}
    assert.deepEqual(plain(a.G),plain(b.G));assert.deepEqual(plain(a.P),plain(b.P));assert.deepEqual(a.events,b.events);
  });
  test(file+' boss-test early return stays delegated and map exception still propagates',()=>{
    const w=fixture(p,{bossTest:3});w.G._chainCnt=3;w.G._chainT=80;w.c.initStage(1);assert.equal(w.G._chainCnt,3);assert.equal(w.G._chainT,80);assert.ok(w.events.some(e=>e[0]==='arena'));
    const f=fixture(p,{failMap:true});f.G._chainCnt=3;assert.throws(()=>f.c.initStage(1),e=>e===f.error);assert.equal(f.G._chainCnt,3);
  });
  test(file+' revive-once and successful natural revival keep their existing chain lifetime',()=>{
    const a=fixture(p);a.G._chainCnt=3;a.G._chainT=80;a.c._eqAffix=k=>k==='reviveOnce'?1:0;a.c.die();assert.equal(a.P.s,'idle');assert.equal(a.G.on,true);assert.equal(a.G._chainCnt,3);
    const b=fixture(p);b.G._chainCnt=3;b.G._chainT=80;b.P._fallenCanRevive=true;b.P._fallenRevRoll=0;b.P._fallenRevChance=100;b.P._fallenRevCdFrames=6000;b.c._fallenResolve();assert.equal(b.P.s,'idle');assert.equal(b.G._chainCnt,3);assert.equal(b.G._chainT,80);
  });
}

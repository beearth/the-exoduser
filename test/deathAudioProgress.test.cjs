// Execute actual death functions and the actual revive-timer branch with audio faults.
// DOM/audio/time fixtures are controlled substitutes; this is not native gameplay QA.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parse}=require('acorn');
const root=path.resolve(__dirname,'..');
const sourceRoot=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const plain=x=>JSON.parse(JSON.stringify(x));
function extract(dir,file){
  const text=fs.readFileSync(path.join(dir,file),'utf8'),found=[];
  let scripts=0,maps=0;
  function visit(n,s){if(!n||typeof n!=='object')return;if(n.type)found.push([n,s]);
    for(const x of Object.values(n))if(Array.isArray(x))x.forEach(y=>visit(y,s));else if(x&&typeof x==='object')visit(x,s);}
  for(const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/i.test(m[1]))continue;
    const type=(/\btype\s*=\s*["']([^"']+)["']/i.exec(m[1])?.[1]||'').toLowerCase();
    if(type==='importmap'){JSON.parse(m[2]);maps++;continue;}
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    visit(parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'}),m[2]);scripts++;
  }
  const get=predicate=>{const a=found.filter(([n,s])=>predicate(n,s));assert.equal(a.length,1);
    return a[0][1].slice(a[0][0].start,a[0][0].end);};
  const defs=['die','_fallenResolve','_r','deathFX'].map(name=>get(n=>n.type==='FunctionDeclaration'&&n.id?.name===name));
  const loop=get(n=>n.type==='FunctionDeclaration'&&n.id?.name==='loop');
  const flush=get(n=>n.type==='FunctionDeclaration'&&n.id?.name==='_sfxFrameReset');
  const timer=get((n,s)=>n.type==='IfStatement'&&s.slice(n.start,n.start+28).startsWith('if(e._reviveTimer>0){'));
  assert.equal(scripts,6);assert.equal(maps,1);
  return {defs,timer,loop,flush};
}
function fixture(parts,{fault='',reviveOnce=false,revive=false,bossRevive=false}={}){
  const events=[],timers=[],elements=new Map();let rng=0;
  const error=new Error('audio fault: '+fault);
  function audio(name,...args){events.push([name,...args]);if(name===fault)throw error;}
  function effect(name,...args){events.push([name,...args]);}
  const $=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',disabled:false,
    classList:{add:tag=>effect('show',id,tag),remove:tag=>effect('hide',id,tag)}});return elements.get(id);};
  const math=Object.create(Math);math.random=()=>{rng++;return .5;};
  const P={x:10,y:20,r:10,hp:0,mhp:100,mp:2,mmp:60,st:3,mst:50,lv:100,exp:100,
    facing:0,s:'idle',_fallenCanRevive:revive,_fallenRevRoll:0,_fallenRevChance:20,_fallenRevCdFrames:10000};
  const G={stage:0,on:true,slowMo:0,kills:2,comboMax:12,_sStats:{deaths:0},_bossArena:false};
  const e={ib:true,alive:false,x:20,y:30,r:20,mhp:1000,_reviveX:20,_reviveY:30,
    _reviveTimer:180,_bossRevRoll:bossRevive?0:1,_bossRevChance:.5,_revPts:20,_maxRevPts:200};
  const box={P,G,e,$,Math:math,OPT:{shake:100},PASSIVES:{pDemon:1},_BOOTH_MODE:false,_boothDeadF:-1,
    _gxTurret:null,_xbowEquipped:false,_ddDeaths:0,_ddChapDeathMap:{},SI_TO_HELL:[0],
    HELL_NAMES:['CH1'],STG:[{hell:0}],_dmgLog:[],_drLen:0,
    _eqAffix:key=>key==='reviveOnce'&&reviveOnce?1:0,_eqImplicit:()=>0,
    _T:x=>x,_L:(ko,en)=>ko,dst:Math.hypot,_isDruidFinale:()=>false,
    ultUnmute:()=>audio('ultUnmute'),SFX:{beamStop:()=>audio('beamStop'),levelup:()=>audio('levelup'),die:()=>audio('dieSound')},
    _stopShieldLoop:()=>audio('shieldStop'),playSample:(key,...args)=>audio('sample:'+key,...args),
    BGM:{fadeOut:n=>audio('fadeOut',n),play:key=>audio('bgm:'+key)},
    setTimeout:(fn,ms)=>{timers.push({fn,ms});effect('timer',ms);},
    addTxt:(...x)=>effect('text',...x),addParts:(...x)=>effect('parts',...x),shake:(...x)=>effect('shake',...x),
    poolPart:(...x)=>effect('particle',...x),_petSayCD:(...x)=>effect('pet',...x),
    _petOnDeath:()=>effect('petOnDeath'),_deathDlgStart:()=>effect('deathDialogue'),
    playVFXAng:(...x)=>effect('vfx',...x),_reviveDruidFinale:()=>{throw Error('unexpected finale');},
    _spawnGhoul:()=>{throw Error('unexpected ghoul');}};
  vm.createContext(box);vm.runInContext(parts.defs.join('\n')+'\nfunction tickRevive(e,sp){'+parts.timer+';}',box);
  return {box,events,timers,elements,error,get rng(){return rng;}};
}
function fullDeath(f){f.box.die();assert.equal(f.box.P.s,'fallen');assert.equal(f.box.P.st2,300);
  f.box._fallenResolve();assert.equal(f.box.P.s,'dead');assert.equal(f.box.G.on,false);
  assert.equal(f.box.G._sStats.deaths,1);assert(f.events.some(x=>x[0]==='show'&&x[1]==='death'));
  assert(f.events.some(x=>x[0]==='deathDialogue'));assert.equal(f.timers[0].ms,600);f.timers[0].fn();}
for(const file of ['game.html','game-easy-test.html']){
  const parts=extract(sourceRoot,file);
  for(const fault of ['ultUnmute','beamStop','shieldStop','sample:player_dead3','dieSound','fadeOut','bgm:death']){
    test(file+' full death reaches UI and timer despite '+fault,()=>{
      const f=fixture(parts,{fault});assert.doesNotThrow(()=>fullDeath(f));
      assert(f.events.some(x=>x[0]===fault));assert.equal(f.rng,3);
      assert.equal(f.box.P._fallenRevChance,5);assert.equal(f.box.P._fallenRevRoll,50);
      assert.equal(f.elements.get('dInfo').textContent.includes('EXP -30'),true);
    });
  }
  test(file+' instant once-revive retains resources, text and no fallen timer despite voice failure',()=>{
    const f=fixture(parts,{fault:'sample:voice_second_wind',reviveOnce:true});
    assert.doesNotThrow(()=>f.box.die());assert.equal(f.box.P.hp,100);assert.equal(f.box.P.mp,60);
    assert.equal(f.box.P.st,50);assert.equal(f.box.P.iframes,120);assert.equal(f.box.P._reviveOnceUsed,true);
    assert.equal(f.box.P.s,'idle');assert(f.events.some(x=>x[0]==='text'));assert.equal(f.rng,0);
  });
  for(const fault of ['levelup','sample:voice_demon_revive'])test(file+' demon revive finishes effects despite '+fault,()=>{
    const f=fixture(parts,{fault,revive:true});assert.doesNotThrow(()=>f.box._fallenResolve());
    assert.equal(f.box.P.hp,100);assert.equal(f.box.P.mp,60);assert.equal(f.box.P.st,50);
    assert.equal(f.box.P.s,'idle');assert.equal(f.box.P.iframes,120);assert.equal(f.box.P._demonRevCd,10000);
    assert.equal(f.events.filter(x=>x[0]==='particle').length,30);assert(f.events.some(x=>x[0]==='petOnDeath'));
    assert(f.events.some(x=>x[0]==='sample:voice_demon_revive'));assert.equal(f.rng,1);
  });
  for(const revive of [false,true])test(file+' boss 180f '+(revive?'revival':'final death')+' audio error does not escape timer branch',()=>{
    const fault=revive?'sample:boss_revive':'sample:boss_final_death',f=fixture(parts,{fault,bossRevive:revive});
    for(let n=0;n<179;n++)f.box.tickRevive(f.box.e,1);
    assert.equal(f.box.e.alive,false);assert.equal(f.box.e._reviveTimer,1);
    assert.doesNotThrow(()=>f.box.tickRevive(f.box.e,1));assert.equal(f.box.e._reviveTimer,0);
    assert.equal(f.box.e.alive,revive);assert(f.events.some(x=>x[0]===fault));
    if(revive){assert.equal(f.box.e.hp,500);assert.equal(f.box.e._revPts,10);assert.equal(f.box.e._spawnT,55);
      assert.equal(f.box.e._bossReviveVFXPending,40);assert.equal(f.box.G._bossRef,f.box.e);}
    else{assert.equal(f.box.e._bossRevived,false);assert.equal(f.box.e._revPts,20);}
  });
  test(file+' unrelated visual exception still propagates',()=>{
    const f=fixture(parts,{revive:true});const error=new Error('visual fault');f.box.addTxt=()=>{throw error;};
    assert.throws(()=>f.box._fallenResolve(),e=>e===error);
  });
  for(const boss of [false,true])test(file+' '+(boss?'boss':'normal')+' direct death audio failure still emits visual feedback',()=>{
    const f=deathFxFixture(parts,true);
    assert.doesNotThrow(()=>f.box.deathFX(10,20,12,'#ff0000',boss,false,0));
    assert.equal(f.box._deathSfxFrameN,1);assert.equal(f.box._deathSfxCd,5);
    assert(f.events.some(x=>x[0]==='particle'));assert(f.events.some(x=>x[0]==='vfx'&&x[1]==='death_blood'));
  });
  for(const fault of ['backend','context'])test(file+' actual loop continues and next RAF is scheduled after '+fault+' failure',()=>{
    const f=loopFixture(parts,fault);assert.doesNotThrow(()=>f.step());
    assert.equal(f.raf.length,1);assert.equal(f.updates,1);assert.equal(f.draws,1);
    assert.equal(f.errors.length,1);assert.equal(f.errors[0][1],f.error);
    if(fault==='backend'){assert.equal(f.box._sfxQueue.length,0);assert.equal(f.box._sfxFrameCnt.test,0);}
    assert.doesNotThrow(()=>f.step());assert.equal(f.raf.length,1);assert.equal(f.updates,2);
    assert.equal(f.box._sfxQueue.length,0);assert.equal(f.errors.length,1);
  });
  test(file+' actual loop passes 180f boss-revive queued-audio error and continues through frame185',()=>{
    const f=loopFixture(parts,'boss_revive',true);
    for(let n=0;n<185;n++)assert.doesNotThrow(()=>f.step());
    assert.equal(f.updates,184);assert.equal(f.draws,185);assert.equal(f.raf.length,1);
    assert.equal(f.box.e.alive,true);assert.equal(f.box.e.hp,500);assert.equal(f.box.e._revPts,10);
    assert.equal(f.errors.length,1);assert.equal(f.errors[0][1],f.error);
    assert.equal(f.box._sfxQueue.length,0);assert.equal(f.box._sfxFrameCnt.boss_revive,0);
  });
  if(process.env.EXODUSER_TEST_BASELINE_DIR)test(file+' healthy source24/source25 events, RNG, state, timers identical',()=>{
    const old=extract(process.env.EXODUSER_TEST_BASELINE_DIR,file);
    for(const scenario of ['death','once','demon','boss-revive','boss-dead']){
      const opts={reviveOnce:scenario==='once',revive:scenario==='demon',bossRevive:scenario==='boss-revive'};
      const run=p=>{const f=fixture(p,opts);if(scenario==='death')fullDeath(f);else if(scenario==='once')f.box.die();
        else if(scenario==='demon')f.box._fallenResolve();else for(let n=0;n<180;n++)f.box.tickRevive(f.box.e,1);
        return plain({P:f.box.P,G:f.box.G,e:f.box.e,events:f.events,rng:f.rng,timers:f.timers.map(x=>x.ms)});};
      assert.deepEqual(run(parts),run(old),scenario);
    }
    for(const boss of [false,true]){
      const run=p=>{const f=deathFxFixture(p,false);f.box.deathFX(10,20,12,'#ff0000',boss,false,0);
        return plain({events:f.events,rng:f.rng,count:f.box._deathSfxFrameN,cooldown:f.box._deathSfxCd});};
      assert.deepEqual(run(parts),run(old),'healthy deathFX boss='+boss);
    }
    const oldLoop=loopFixture(old,'',true),newLoop=loopFixture(parts,'',true);
    for(let n=0;n<185;n++){oldLoop.step();newLoop.step();}
    assert.deepEqual(newLoop.snapshot(),oldLoop.snapshot(),'actual healthy loop185');
  });
}

function deathFxFixture(parts,fail){
  const f=fixture(parts);Object.assign(f.box,{_deathSfxFrameMark:-1,_sfxFrameT:1,_deathSfxFrameN:0,
    _deathSfxCd:0,_deathSfxThrottled:false,_partCnt:0,ELC:{},_ARMOR_ET:new Set(),
    sfxVol:()=>1,_bossSfx:()=>null,_deathSfxKey:()=> 'monster_die',_deathBloodScale:()=>1,
    _playSampleNow:(...args)=>{f.events.push(['direct',...args]);if(fail)throw f.error;}});
  return f;
}

function loopFixture(parts,fault,boss=false){
  const f=fixture(parts,{bossRevive:boss}),c=f.box,raf=[],errors=[],plays=[];
  let clock=100,updates=0,draws=0,failed=false;
  Object.assign(c,{_DCP:{on:false},_bootLoadKilled:true,_bootLoadActive:false,_DEBUG_PERF:false,
    _lastLoopTs:100,_prevTs:100,_loopRunning:false,_perfFrames:0,_perfLast:100,
    _prof:{u:0,d:0,f:0,t:0},_PERF_PROF:{enabled:false},document:{hidden:false,title:''},window:{},
    performance:{now:()=>clock},_acc:0,PHYS_STEP:1000/60,IS_MOBILE:false,_fpsCur:60,_hiFPS:false,
    _atmReady:false,_useGPU:false,_useGL:false,_drawOdd:0,_cutsceneState:'',_gameTime:0,_now:0,
    _sfxFrameT:0,_deathSfxCd:0,_hitSfxCd:0,_mSfxPlaying:0,_sfxQueue:[],_sfxFrameCnt:{test:1},
    _activeNodeCnt:0,_MAX_ACTIVE_NODES:99,_SFX_PER_FRAME:8,_SFX_MAX:3,_sfxCat:key=>key,_actx:{state:'running'},
    _drCaptT:0,_DR_FPS:10,_streamMap:false,_bmcDone:true,_bgInitDone:true,_matsPrev:0,_ATM_TUNE:false,
    _fpsUpdate(){},_benchTick(){},_fpsDraw(){},_drawBurst(){},_drCapture(){},_perfFrameTick(){},_texPreDrain(){},
    _pollGamepad(){},console:{error:(...x)=>errors.push(x),log(){}},
    requestAnimationFrame:fn=>raf.push(fn),
    actx(){if(fault==='context'&&!failed){failed=true;throw f.error;}return {currentTime:clock/1000};},
    _playSampleNow(key,...args){plays.push([key,...args]);if(!failed&&(fault==='backend'||fault===key)){
      failed=true;throw f.error;}},
    draw(){draws++;},update(){updates++;if(boss&&!c.e.alive)c.tickRevive(c.e,1);}});
  c.G.mats=0;c.G.cam={x:0,y:0};c.OPT.fpsCap=0;c.G._intro=true;
  c.SFX._sbSndCd=2;
  if(!boss)c._sfxQueue.push({key:'test',vol:1,rate:1,pri:1});
  c.playSample=(key,vol,rate)=>{c._sfxQueue.push({key,vol,rate,pri:1});c._sfxFrameCnt[key]=(c._sfxFrameCnt[key]||0)+1;};
  vm.runInContext(parts.flush+'\n'+parts.loop,c);raf.push(c.loop);
  return {box:c,raf,errors,error:f.error,get updates(){return updates;},get draws(){return draws;},
    step(){assert.equal(raf.length,1);clock+=1000/60;const fn=raf.shift();fn(clock);},
    snapshot(){return plain({P:c.P,G:c.G,e:c.e,events:f.events,rng:f.rng,plays,updates,draws,
      queue:c._sfxQueue,counts:c._sfxFrameCnt,gameTime:c._gameTime,acc:c._acc,frameT:c._sfxFrameT,raf:raf.length});}};
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {installDruidSlamNativeBridge} from '../engine/fdg/dark-druid-slam-bridge.js';

const rig=JSON.parse(readFileSync(new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json',import.meta.url)));
const game=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const idleId='dark-druid-slam-contact-idle-r5',slamId='dark-druid-native-slam-contact-r5';
const specSource=game.match(/3:(\{src:'assets\/sprites\/boss\/boss_dark_druid_f0\.png'[^\n]+\})/);
assert.ok(specSource,'current native druid spec');
const spec=vm.runInNewContext(`(${specSource[1]})`);
const nativeDrawStart=game.indexOf('function _drawDruidBoss(');
const nativeDrawEnd=game.indexOf('// ── 대형보스 글로벌 설정',nativeDrawStart);
assert.ok(nativeDrawStart>=0&&nativeDrawEnd>nativeDrawStart);
const nativeDrawSource=game.slice(nativeDrawStart,nativeDrawEnd);
const plain=value=>JSON.parse(JSON.stringify(value));

function context() {
  const stack=[];
  return {
    globalAlpha:1,globalCompositeOperation:'source-over',draws:[],translations:[],scales:[],fills:0,
    save(){stack.push({alpha:this.globalAlpha,composite:this.globalCompositeOperation});},
    restore(){const value=stack.pop();if(value){this.globalAlpha=value.alpha;this.globalCompositeOperation=value.composite;}},
    setTransform(){},transform(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},ellipse(){},
    translate(...args){this.translations.push(args);},scale(...args){this.scales.push(args);},
    getTransform:()=>({a:.5,b:0,c:0,d:.5,e:0,f:0}),
    drawImage(...args){this.draws.push({args,alpha:this.globalAlpha,composite:this.globalCompositeOperation});},
    fill(){this.fills++;},
  };
}

function harness(t,{idle=true}={}) {
  let stage=0,finale=false,seconds=.02,starts=0;
  const writes=[],fallbacks=[];
  const state={ib:true,alive:true,hp:1000,s:'idle',st2:0,x:2580,y:2420,r:44,facing:.4,_bossPhase:0};
  const actor=new Proxy(state,{set(target,key,value){assert.equal(key,'_nameTopOff',`unexpected bridge actor write: ${String(key)}`);writes.push(key);target[key]=value;return true;}});
  const rasterContext=context(),canvas={width:0,height:0,getContext:kind=>(assert.equal(kind,'2d'),rasterContext)};
  const image={naturalWidth:355,naturalHeight:541};
  const originalStart=function(value,move,...args){assert.equal(this,scope);assert.equal(value,actor);starts++;
    if(move.id==='slam'){state.s='bossSlamWind';state.st2=26;}return {authority:'native',move:move.id,args};};
  const originalDraw=function(...args){assert.equal(this,scope);fallbacks.push(args);return 'original-native-sheet';};
  const scope={_bossStartPattern:originalStart,_drawDruidBoss:originalDraw,_btScaleMul:.5,_BOSS_GLOW:false};
  const bridge=installDruidSlamNativeBridge({scope,rig,image,getStage:()=>stage,isFinale:()=>finale,
    clipId:slamId,...(idle?{idleClipId:idleId,getAnimationTime:()=>seconds}:{}),canvasFactory:()=>canvas});
  t.after(()=>bridge.uninstall());
  const draw=(output=context(),alpha=.8,tdY=0)=>({result:scope._drawDruidBoss(output,actor,alpha,tdY,spec),output});
  return {actor,state,scope,bridge,draw,canvas,rasterContext,image,writes,fallbacks,
    clock:value=>{seconds=value;},stage:value=>{stage=value;},finale:value=>{finale=value;},starts:()=>starts};
}

test('actual r5 idle clip samples at 24 FPS native clock boundaries and loops without advancing the clock',t=>{
  const h=harness(t),idle=rig.clips.find(c=>c.id===idleId);
  assert.equal(idle.fps,24);assert.equal(idle.duration,2);assert.equal(idle.loop,true);
  assert.equal(h.draw().result,true);assert.equal(h.bridge.getRenderSnapshot(h.actor).time,0);
  const revision=h.canvas._glVer;
  h.clock(1/24-Number.EPSILON);h.draw();assert.equal(h.bridge.getRenderSnapshot(h.actor).time,0);
  assert.equal(h.canvas._glVer,revision);
  h.clock(.041667);h.draw();assert.equal(h.bridge.getRenderSnapshot(h.actor).time,1/24);
  assert.equal(h.canvas._glVer,revision+1);assert.equal(h.bridge.getSnapshot(h.actor).clipId,idleId);
  h.clock(2+1/24);h.draw();assert.ok(Math.abs(h.bridge.getRenderSnapshot(h.actor).time-1/24)<1e-12);
  for(const bad of [-1,NaN,Infinity]){h.clock(bad);assert.equal(h.draw().result,'original-native-sheet');assert.equal(h.bridge.getSnapshot(h.actor),null);}
});

test('frozen native clock reuses idle pixels and writes only the existing display name offset',t=>{
  const h=harness(t);h.clock(.5);const before=structuredClone(h.state);h.draw();
  const rendered=h.bridge.getRenderSnapshot(h.actor),triangles=h.rasterContext.draws.length;
  assert.ok(triangles>0);assert.equal(rendered.clipId,idleId);assert.equal(rendered.time,.5);
  for(let frame=0;frame<4;frame++)h.draw();
  assert.equal(h.canvas._glVer,rendered.rasterRevision);assert.equal(h.rasterContext.draws.length,triangles);
  assert.deepEqual(Object.fromEntries(Object.entries(h.state).filter(([k])=>k!=='_nameTopOff')),before);
  assert.deepEqual(h.writes,Array(5).fill('_nameTopOff'));assert.equal(h.starts(),0);
});

test('idle consumption is restricted to normal stages 0/3 and falls back for walk, stun and finale',t=>{
  const h=harness(t);
  for(const stage of [0,3]){h.stage(stage);assert.equal(h.draw().result,true);assert.equal(h.bridge.getSnapshot(h.actor).phase,'idle');}
  const baseline=structuredClone(h.state);
  const blocked=[{stage:1},{stage:2},{stage:4},{stage:6},{state:{ib:false}},{state:{s:'eWalk'}},
    {state:{s:'bossSlamWind'}},{state:{stunned:1}},{state:{_hitStun:1}},{state:{alive:false}},{state:{hp:0}},{finale:true}];
  for(const item of blocked){
    for(const key of Object.keys(h.state))delete h.state[key];Object.assign(h.state,baseline,item.state);
    h.stage(item.stage??0);h.finale(item.finale??false);const output=context();
    assert.equal(h.draw(output,.67,15).result,'original-native-sheet',JSON.stringify(item));
    assert.equal(h.bridge.getSnapshot(h.actor),null);assert.equal(h.bridge.getRenderSnapshot(h.actor),null);
    assert.deepEqual(h.fallbacks.at(-1),[output,h.actor,.67,15,spec]);
  }
});

test('idle rig retains all three actual native alpha passes, display anchor and current native spec',t=>{
  const h=harness(t);h.clock(.5);const alpha=.73,tdY=19;
  const nativeActor=structuredClone(h.state),nativeContext=context();
  const nativeDraw=vm.runInNewContext(`${nativeDrawSource}\n_drawDruidBoss`,{
    window:{_btScaleMul:h.scope._btScaleMul,_BOSS_GLOW:false},performance:{now:()=>20},
    _drawDruidFinaleTell(){},_stage1CodexBossMotionKey:()=> 'idle',_druidDir:()=>0,
    _druidSheets:{walk:{ready:true,img:h.image}},
  });
  assert.equal(nativeDraw(nativeContext,nativeActor,alpha,tdY,spec),true);
  const {result,output}=h.draw(context(),alpha,tdY);assert.equal(result,true);
  const passes=output.draws.map(({alpha,composite})=>({alpha,composite}));
  assert.deepEqual(passes,nativeContext.draws.map(({alpha,composite})=>({alpha,composite})));
  assert.deepEqual(passes,[{alpha,composite:'source-over'},{alpha:alpha*.42,composite:'lighter'},{alpha:alpha*.42,composite:'lighter'}]);
  assert.deepEqual(output.translations,nativeContext.translations);assert.deepEqual(output.scales,nativeContext.scales);
  assert.equal(h.actor._nameTopOff,nativeActor._nameTopOff);assert.equal(spec.dw,9.3);assert.equal(spec.dh,14.1);
  assert.ok(output.draws.every(pass=>pass.args[0]===h.canvas));
});

test('adding idle preserves the same bridge slam authority and phase rendering before returning to idle',t=>{
  const withIdle=harness(t),slamOnly=harness(t,{idle:false});
  assert.equal(slamOnly.draw().result,'original-native-sheet');
  for(const h of [withIdle,slamOnly])assert.deepEqual(h.scope._bossStartPattern(h.actor,{id:'slam'},17),{authority:'native',move:'slam',args:[17]});
  for(const [state,timer] of [['bossSlamWind',26],['bossSlamWind',13],['bossSlam',8],['recover',40],['recover',1]]){
    for(const h of [withIdle,slamOnly]){h.state.s=state;h.state.st2=timer;assert.equal(h.draw().result,true);}
    assert.deepEqual(withIdle.bridge.getSnapshot(withIdle.actor),slamOnly.bridge.getSnapshot(slamOnly.actor));
    assert.deepEqual(withIdle.bridge.getRenderSnapshot(withIdle.actor),slamOnly.bridge.getRenderSnapshot(slamOnly.actor));
    assert.equal(withIdle.bridge.getRenderSnapshot(withIdle.actor).clipId,slamId);
  }
  for(const h of [withIdle,slamOnly]){h.state.s='idle';h.state.st2=0;}
  assert.equal(withIdle.draw().result,true);assert.equal(withIdle.bridge.getRenderSnapshot(withIdle.actor).clipId,idleId);
  assert.equal(slamOnly.draw().result,'original-native-sheet');assert.equal(slamOnly.bridge.getRenderSnapshot(slamOnly.actor),null);
  assert.equal(withIdle.starts(),1);assert.equal(slamOnly.starts(),1);
});

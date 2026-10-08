import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
  const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  test(file+': initial scene is rendered and settled under loading before gameplay',async()=>{
    const match=source.match(/async function _prepareStartScene\(\)\{[\s\S]*?\n\}\n/);
    assert.ok(match,'startup must prepare scene-dependent caches, not just PNG chunks');
    let now=0,draws=0,pending=2;
    const timers=[];
    const scope={G:{on:false,map:[[0]],cam:{x:0,y:0}},P:{},X:{},VW:1920,VH:1080,
      _startSceneWarmState:{},_bgInitDone:false,_streamMap:true,_streamBuildQCount:2,
      _wqLen:2,_wqIdx:0,_ensWarmDone:false,_mapCacheRefreshQueued:0,_bootMapBuildPromise:null,
      _waitObjSprites:async()=>{},_tickBgInit(){scope._bgInitDone=true},
      _tickStreamChunkBuild(){scope._streamBuildQCount=0},_warmupEnsAtlas(){scope._wqLen=0;scope._ensWarmDone=true},
      draw(){assert.equal(scope.G.on,false);draws++;},_glFlush(){},_useGL:true,_useGPU:false,
      Ch1ForestSway:{qa:()=>({pending})},Ch1FaceLife:{qa:()=>({pending:0})},
      Ch1LivingDetail:{qa:()=>({pending:0})},Ch1BorderForeground:{qa:()=>({pending:0})},
      document:{hidden:false},performance:{now:()=>now},_L:(ko,en)=>en,setBootLoading(){},
      console:{warn(){}},setTimeout(callback){timers.push(callback)}};
    scope.globalThis=scope;vm.runInNewContext(match[0],scope);
    let done=false;const task=scope._prepareStartScene().then(()=>done=true);
    await new Promise(setImmediate);
    assert.equal(done,false);
    const tick=async()=>{now+=30;const callback=timers.shift();assert.ok(callback,'yield without blocking loading UI');callback();await new Promise(setImmediate);};
    await tick();assert.equal(done,false,'pending overlays must keep loading visible');
    pending=0;
    for(let attempt=0;!done&&attempt<8;attempt++)await tick();
    await task;
    assert.equal(scope._startSceneWarmState.status,'ready');
    assert.ok(draws>=3,'include a render after asynchronous cache completion');
    assert.equal(scope.G.on,false,'preparation never advances gameplay');
  });
}

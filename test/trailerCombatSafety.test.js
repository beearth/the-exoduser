import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRealtimeTrailer } from '../tools/trailer_realtime_20260909.mjs';
import { resetScene } from '../tools/trailer_scenes_20260909.mjs';

async function installed(){
  const ctx={fillRect(){},drawImage(){}};
  const c=vm.createContext({document:{createElement:()=>({getContext:()=>ctx}),getElementById:()=>null},
    actx:()=>({state:'running',createMediaStreamDestination:()=>({})}),mbus(){},_comp:{connect(){}},
    _drawBurst(){},draw(){},drawP(){return P.iframes>0?.3:1;},MediaRecorder:{isTypeSupported:()=>true},
    P:{hp:850,mhp:1000,mp:1,mmp:10,st:2,mst:20,iframes:12,_dead:false,rage:0},
    G:{kills:0},ens:[],performance:{now:()=>1000},_gameTime:0});
  // This fake renderer reads the same VM state as the real renderer.
  vm.runInContext('window=globalThis;drawP=function(){return P.iframes>0?.3:1}',c);
  const recording=createRealtimeTrailer({root:'.',cdp:{send:async(_method,{expression})=>({result:{value:vm.runInContext(expression,c)}})}});
  await recording.install();
  vm.runInContext('__rt.active=true;__rt.protect=true;__rt.start=1000',c);
  return c;
}
test('capture resource refill cannot heal damage or overwrite gameplay iframes',async()=>{
  const c=await installed();vm.runInContext('_drawBurst()',c);
  assert.equal(c.P.hp,850);assert.equal(c.P.iframes,12);
  assert.equal(c.P.mp,10);assert.equal(c.P.st,20);
});
test('opaque player capture restores real hit invulnerability immediately after drawing',async()=>{
  const c=await installed();
  assert.equal(vm.runInContext('drawP()',c),1);
  assert.equal(c.P.iframes,12);
  vm.runInContext('__rt.active=false',c);
  assert.equal(vm.runInContext('drawP()',c),.3);
});
test('scene setup uses high HP and starts without invulnerability',()=>{
  const c=vm.createContext({G:{txts:[],cam:{}},P:{mhp:1000,mmp:100,mst:100,skills:{}},ens:[],projs:[],pProjs:[],worldItems:[],
    _vfxAnims:[],_fireExps:[],_corpses:[],K:{},MB:[],MBjust:[],BINDS:{},_HARP_GAUGE_MAX:100,shRebuild(){}});
  vm.runInContext('window=globalThis;'+resetScene+';__resetTake()',c);
  assert.equal(c.P.iframes,0);assert.ok(c.P.mhp>=100_000_000);assert.equal(c.P.hp,c.P.mhp);
});

test('replacing staged enemies rebuilds the spatial index without old invisible targets',()=>{
  const c=vm.createContext({G:{txts:[],cam:{}},P:{mhp:1000,mmp:100,mst:100,skills:{}},ens:[{alive:true}],projs:[],pProjs:[],worldItems:[],
    _vfxAnims:[],_fireExps:[],_corpses:[],K:{},MB:[],MBjust:[],BINDS:{},_HARP_GAUGE_MAX:100,_shDirty:false});
  vm.runInContext('window=globalThis;shRebuild=function(){if(_shDirty)rebuilt=true};rebuilt=false;'+resetScene+';__resetTake()',c);
  assert.equal(c.rebuilt,true);
});

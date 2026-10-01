import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('let _headCaptureWarmDone=false;'),html.indexOf('function _addSplitGibs('));
function setup(){
  const calls=[];
  const context=name=>({clearRect:(...a)=>calls.push([name,'clear',...a]),drawImage:(...a)=>{calls.push([name,'draw',...a]);}});
  const slot={active:false,life:0,x:123,y:456,ctx:context('split')};
  const img={complete:true,naturalWidth:2048,naturalHeight:1280};
  const env={_useGL:true,G:{on:false},OPT:{deathFx:true},_ch8Atlas:{1:{meta:{cell:256},dirs:{south:{ready:true,img}}}},
    _splits:[slot],_gibX:context('scratch'),_gibC:{width:48,height:48},_SPLIT_CELL:64,
    performance:{now:()=>0},Math:{random(){throw Error('must not consume RNG')}}};
  vm.createContext(env);vm.runInContext(source,env);return {env,calls,slot,img};
}
test('prepares the exact existing crop once and clears both surfaces without changing slot state',()=>{
  const {env,calls,slot,img}=setup();assert.equal(env._warmHeadCapture2d(),true);
  assert.deepEqual(calls[1],['scratch','draw',img,0,0,256,256,0,0,48,48]);
  assert.deepEqual(calls[3],['split','draw',env._gibC,0,0,48,14,0,0,64,64]);
  assert.deepEqual(calls.slice(-2),[['scratch','clear',0,0,48,48],['split','clear',0,0,64,64]]);
  assert.deepEqual({active:slot.active,life:slot.life,x:slot.x,y:slot.y},{active:false,life:0,x:123,y:456});
  assert.equal(env._warmHeadCapture2d(),false);assert.equal(calls.length,6);
});
test('skips combat, non-GL, disabled effects, active slots and unavailable images without writes',()=>{
  const cases=[e=>e.G.on=true,e=>e._useGL=false,e=>e.OPT.deathFx=false,e=>e._splits[0].active=true,
    e=>e._ch8Atlas[1].dirs.south.ready=false,e=>e._ch8Atlas[1].dirs.south.img.complete=false,
    e=>e._ch8Atlas[1].meta=null,e=>e._ch8Atlas[1].dirs.south.img.naturalHeight=0];
  for(const change of cases){const {env,calls}=setup();change(env);assert.equal(env._warmHeadCapture2d(),false);assert.equal(calls.length,0);}
});
test('failed preparation clears partial pixels and remains retryable',()=>{
  const {env,calls}=setup(),draw=env._splits[0].ctx.drawImage;
  env._splits[0].ctx.drawImage=()=>{throw Error('draw failure')};
  assert.equal(env._warmHeadCapture2d(),false);assert.deepEqual(calls.slice(-2),[['scratch','clear',0,0,48,48],['split','clear',0,0,64,64]]);
  env._splits[0].ctx.drawImage=draw;assert.equal(env._warmHeadCapture2d(),true);
});
test('cleanup failure attempts both surfaces and leaves preparation retryable',()=>{
  const {env,calls}=setup(),clear=env._gibX.clearRect;let count=0;
  env._gibX.clearRect=(...a)=>{if(++count===2)throw Error('cleanup failure');clear(...a)};
  assert.equal(env._warmHeadCapture2d(),false);
  assert.deepEqual(calls.at(-1),['split','clear',0,0,64,64]);
  assert.equal(vm.runInContext('_headCaptureWarmDone',env),false);
  env._gibX.clearRect=clear;assert.equal(env._warmHeadCapture2d(),true);
});
test('boot completion warms before hiding and still finishes on skipped or throwing preparation',()=>{
  const boot=html.slice(html.indexOf('function setBootLoading(pct,msg){'),html.indexOf('function hideBootLoading(){'));
  for(const result of [true,false,'throw']){
    const calls=[],env={_bootPerfMark(){},$:()=>null,_T:s=>s,
      _warmHeadCapture2d(){calls.push('warm');if(result==='throw')throw Error('optional failure');return result},
      hideBootLoading(){calls.push('hide')}};
    vm.createContext(env);vm.runInContext(boot,env);
    env.setBootLoading(99,'loading');assert.deepEqual(calls,[]);
    env.setBootLoading(100,'done');assert.deepEqual(calls,['warm','hide']);
  }
});

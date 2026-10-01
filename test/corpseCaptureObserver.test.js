import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../tools/qa/corpse-capture-observer.js', import.meta.url), 'utf8');

function fixture() {
  let time=0; const listeners=new Map(); const calls=[];
  class Context {
    constructor(canvas){this.canvas=canvas;this.imageSmoothingEnabled=true;this.imageSmoothingQuality='low';}
    getContextAttributes(){return {willReadFrequently:this.canvas.width===48};}
    drawImage(...args){calls.push({thisValue:this,args});if(args[0]?.fail)throw new Error('original failure');return 17;}
    clearRect(){return 19;} getImageData(){return 23;} putImageData(){return 29;}
  }
  const canvas=size=>({width:size,height:size});
  const scratch=canvas(48), target=canvas(64), corpse=canvas(128), atlas=canvas(256);
  const env={CanvasRenderingContext2D:Context,_gibC:scratch,_gibX:new Context(scratch),_atlasE:atlas,
    _splits:[{c:target,ctx:new Context(target)}],_corpses:[{c:corpse,ctx:new Context(corpse)}],
    _wqGpuImages:new Set(),G:{kills:0,on:true,paused:false},P:{hp:100,x:0,y:0,lv:1},
    OPT:{atmos:2,fpsCap:0},C:canvas(100),_useGL:true,_useGPU:false,_bootLoadActive:false,_ensWarmDone:true,
    document:{hidden:false,hasFocus:()=>true,addEventListener(){},removeEventListener(){}},
    performance:{now:()=>++time},location:{href:'http://qa.localhost/'},navigator:{userAgent:'test'},
    innerWidth:100,innerHeight:100,devicePixelRatio:1,
    addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k),
    requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>2,clearTimeout(){}};
  env.window=env;
  env._addHeadGib=function(e){env._gibX.drawImage(atlas,0,0,256,256,0,0,48,48);return env._splits[0].ctx.drawImage(scratch,0,0,48,14,0,0,64,64);};
  env._addCorpse=function(e){return env._addHeadGib(e);};
  const original={corpse:env._addCorpse,head:env._addHeadGib,draw:Context.prototype.drawImage};
  const context=vm.createContext(env);vm.runInContext(source,context);
  return {env,context,original,calls,listeners};
}

test('observes stable source/slot identity without changing return values; restores originals',()=>{
  const {env,original,calls,listeners}=fixture();
  assert.equal(env._addCorpse({etype:0,hp:0,alive:false}),17);
  assert.equal(env._addCorpse({etype:0,hp:0,alive:false}),17);
  const rows=env.__corpseCaptureQA.records.filter(r=>r.kind==='2d.drawImage'&&r.source.name==='_gibC');
  assert.equal(rows.length,2);assert.equal(rows[0].source.id,rows[1].source.id);
  assert.equal(rows[0].target.canvas.name,'_splits[0].c');
  assert.deepEqual(Array.from(rows[0].args),[0,0,48,14,0,0,64,64]);
  assert.deepEqual(Array.from(rows,r=>r.sourceObservedDraw),[1,2]);assert.equal(calls.length,4);
  env.__corpseCaptureQA.stop();env.__corpseCaptureQA.stop();
  assert.equal(env._addCorpse,original.corpse);assert.equal(env._addHeadGib,original.head);
  assert.equal(env.CanvasRenderingContext2D.prototype.drawImage,original.draw);assert.equal(listeners.size,0);
});

test('preserves original exceptions and reinstall does not nest wrappers',()=>{
  const {env,context,original}=fixture();const previous=env.__corpseCaptureQA;
  assert.throws(()=>env._gibX.drawImage({fail:true}),/original failure/);
  vm.runInContext(source,context);assert.equal(previous.stopped,true);
  env._addCorpse({etype:0});
  assert.equal(env.__corpseCaptureQA.records.filter(r=>r.kind==='_addCorpse').length,1);
  env.__corpseCaptureQA.stop();assert.equal(env.CanvasRenderingContext2D.prototype.drawImage,original.draw);
});

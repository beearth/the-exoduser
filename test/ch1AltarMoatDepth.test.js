import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCanvas, Image} from 'canvas';

const source=fs.readFileSync(new URL('../ch1-altar-moat.js',import.meta.url),'utf8');
const art=fs.readFileSync(new URL('../assets/map/ch1/collision/prop_pool.png',import.meta.url));
const hill={cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1.8,rampHalf1:3};
function render(src){
  const pool=new Image();pool.src=art;
  const env={performance,document:{createElement:()=>createCanvas(1,1)},Image:function(){return pool;}};
  env.globalThis=env;vm.createContext(env);vm.runInContext(src,env);
  const ctx=createCanvas(1900,960).getContext('2d');
  env.Ch1AltarMoat.draw(ctx,{stage:0},0,hill,40,1900,960);
  const tex=env.Ch1AltarMoat._texture(),qa=env.Ch1AltarMoat.qa();
  env.Ch1AltarMoat.draw(ctx,{stage:0},16,hill,40,1900,960);
  assert.equal(env.Ch1AltarMoat._texture(),tex,'cached texture reused');
  return {data:tex.getContext('2d').getImageData(0,0,1900,960).data,qa};
}

test('moat bank faces preserve the footprint, bridge and frame draw budget',()=>{
  // Render the same compositor with just the two face passes removed as control.
  const calls=/    bankFace\(l,g,g\.dOut,Math\.PI,TAU\);\n    bankFace\(l,g,g\.dIn,0,Math\.PI\);\n/;
  assert.match(source,calls);
  const control=render(source.replace(calls,'')),current=render(source);
  let changed=0;
  for(let y=0;y<960;y++)for(let x=0;x<1900;x++){
    const i=(y*1900+x)*4,a=control.data,b=current.data;
    assert.equal(b[i+3],a[i+3],'existing alpha footprint preserved');
    if(![0,1,2].some(k=>a[i+k]!==b[i+k]))continue;
    changed++;assert.notEqual(a[i+3],0,'no pixels outside existing texture');
    const t=Math.max(0,Math.min(1,(x-70)/400)),half=72+48*t;
    assert.ok(!(x>=70&&x<=470&&Math.abs(y-480)<=half-5),'west bridge stays open');
  }
  assert.ok(changed>0,'bank faces actually paint pixels');
  assert.equal(current.qa.lastDraws,control.qa.lastDraws);
  assert.equal(current.qa.vents,control.qa.vents);
});

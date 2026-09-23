import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function shader(entry){
 const src=readFileSync(new URL('../'+entry,import.meta.url),'utf8');
 const start=src.indexOf('function _shadePlayerPixels(');
 assert.ok(start>=0,'player relief shader exists');
 const end=src.indexOf('\n}',start)+2;
 const ctx=vm.createContext({});vm.runInContext(src.slice(start,end),ctx);
 return ctx._shadePlayerPixels;
}
function tile(w=8,h=8){
 const data=new Uint8ClampedArray(w*h*4);
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)data.set([48,40,32,255],(y*w+x)*4);
 return {data,width:w,height:h};
}
for(const entry of ['game.html','game-easy-test.html']){
 test(entry+': relief preserves alpha, transparent RGB and original input',()=>{
  const shade=shader(entry),src=tile();src.data.set([12,34,56,0],0);src.data[7]=91;
  const copy=src.data.slice(),out=shade(src,8,8);
  assert.deepEqual(src.data,copy);
  for(let i=0;i<copy.length;i+=4){assert.equal(out[i+3],copy[i+3]);if(!copy[i+3])assert.deepEqual([...out.slice(i,i+4)],[...copy.slice(i,i+4)]);}
 });
 test(entry+': upper-left relief reveals midtones while preserving dark outlines and silver',()=>{
  const shade=shader(entry),src=tile(),out=shade(src,8,8);
  assert.ok(out[(2*8+2)*4]>48,'midtone lift');
  assert.ok(out[(2*8+2)*4]>out[(5*8+5)*4],'light remains upper-left');
  for(const value of [10,199,255]){
   const flat=tile();for(let i=0;i<flat.data.length;i+=4)if(flat.data[i+3])flat.data.set([value,value,value],i);
   const lit=shade(flat,8,8);assert.deepEqual([...lit],[...flat.data]);
  }
 });
 test(entry+': neighboring animation cells cannot affect shading',()=>{
  const shade=shader(entry),single=tile(),atlas={width:16,height:8,data:new Uint8ClampedArray(16*8*4)};
  for(let y=0;y<8;y++)atlas.data.set(single.data.slice(y*32,y*32+32),y*64);
  for(let y=0;y<8;y++)for(let x=8;x<16;x++)atlas.data.set([250,10,80,255],(y*16+x)*4);
  const a=shade(single,8,8),b=shade(atlas,8,8);
  for(let y=0;y<8;y++)assert.deepEqual([...b.slice(y*64,y*64+32)],[...a.slice(y*32,y*32+32)]);
 });
 test(entry+': applying the same atlas twice never compounds lighting',()=>{
  const src=readFileSync(new URL('../'+entry,import.meta.url),'utf8'),start=src.indexOf('function _shadePlayerAtlas('),end=src.indexOf('\n}',start)+2;
  let reads=0,writes=0;const pixels=tile(),ctx=vm.createContext({_shadePlayerPixels:shader(entry)});
  vm.runInContext(src.slice(start,end),ctx);
  const canvas={width:8,height:8,getContext:()=>({getImageData:()=>{reads++;return pixels;},putImageData:()=>writes++})};
  ctx._shadePlayerAtlas(canvas,8,8);const first=pixels.data.slice();ctx._shadePlayerAtlas(canvas,8,8);
  assert.equal(reads,1);assert.equal(writes,1);assert.deepEqual(pixels.data,first);
 });
}

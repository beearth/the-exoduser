import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCanvas} from 'canvas';
import {parseExpressionAt} from 'acorn';

for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const fn=name=>{const i=src.indexOf('function '+name+'(');assert.ok(i>=0,name);return src.slice(i,parseExpressionAt(src,i,{ecmaVersion:'latest'}).end);};
 test(file+': mouth texture is bright and neutral even when the renderer ignores filters',()=>{
  const original=createCanvas(2,1),ctx=original.getContext('2d');
  ctx.fillStyle='#301008';ctx.fillRect(0,0,1,1);
  const c=vm.createContext({Math,document:{createElement:()=>createCanvas(1,1)}});
  vm.runInContext(fn('_preparePhysicalMouthSheet'),c);
  const baked=c._preparePhysicalMouthSheet(original);
  const pixels=baked.getContext('2d').getImageData(0,0,2,1).data;
  assert.ok(pixels[0]>=100,'dark flesh must remain visible on dark ground');
  assert.equal(pixels[0],pixels[1]);assert.equal(pixels[1],pixels[2]);
  assert.equal(pixels[3],255);assert.equal(pixels[7],0,'transparent padding stays transparent');
  assert.equal(baked._glVer,1,'immutable texture upload is cached');
  const calls=[];
  Object.assign(c,{X:new Proxy({}, {get:(t,k)=>t[k]||((...a)=>calls.push([k,...a])),set:(t,k,v)=>(t[k]=v,true)}),_physMouthReady:true,_physMouthSheet:baked,_physMouthImg:original,_gameFrame:0,_PHYS_MOUTH_N:[8,6,6],_PHYS_MOUTH_FW:768,_PHYS_MOUTH_FH:384});
  vm.runInContext(fn('_drawPhysMouth'),c);
  c._drawPhysMouth(0,0,67.914,0,1,0);
  assert.equal(calls.find(a=>a[0]==='drawImage')[1],baked,'draw uses baked pixels, not unsupported X.filter');
 });
}

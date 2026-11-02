import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as ground from '../web3d/ground-dressing.mjs';
test('ground contact fades source silhouettes over 40-80 world pixels without isolated alpha islands',()=>{
 assert.equal(typeof ground.featherGroundAlpha,'function');
 const w=240,h=160,pixels=new Uint8ClampedArray(w*h*4);for(let y=10;y<h-10;y++)for(let x=10;x<w-10;x++)pixels[(y*w+x)*4+3]=255;
 const alpha=ground.featherGroundAlpha(pixels,w,h,480,320);
 assert.equal(alpha[80*w+10],0);assert.ok(alpha[80*w+20]<.51);assert.ok(alpha[80*w+45]>.8);assert.equal(alpha[80*w+120],1);
 for(let x=11;x<60;x++)assert.ok(alpha[80*w+x]>=alpha[80*w+x-1]-.01);
});
test('local native ground hue and brightness survive both dark green and bright source art',()=>{
 assert.equal(typeof ground.blendGroundPixel,'function');
 for(const base of [[58,50,55],[27,32,30],[76,60,55]])for(const detail of [-1,0,1]){
  const rgb=ground.blendGroundPixel(base,detail,true);
  const ratios=rgb.map((v,i)=>v/base[i]);assert.ok(Math.max(...ratios)-Math.min(...ratios)<1e-9);
  assert.ok(ratios[0]>=.94&&ratios[0]<=1.06);
 }
});
test('every litter contact is an elongated authored connection anchored to a root mass',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../web3d/ground-dressing-ch1.json',import.meta.url)));
 for(const region of d.regions)for(const p of region.placements.filter(p=>p.groundOnly)){
  assert.ok(p.anchor,p.id+' missing physical reason');assert.ok(region.placements.some(r=>r.id===p.anchor));assert.ok(p.width/p.height>=3,p.id+' is a round island');
 }
});

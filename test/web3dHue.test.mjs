import test from 'node:test';
import assert from 'node:assert/strict';
import {shadeEnvironment} from '../web3d/lighting-model.mjs';
import {presentationRadius,renderEnergy} from '../web3d/map-look-layout.mjs';
import * as layout from '../web3d/map-look-layout.mjs';
import '../ch1-altar-moat.js';
const hue=rgb=>{const hi=Math.max(...rgb),lo=Math.min(...rgb),d=hi-lo;if(d<1e-8)return 0;const i=rgb.indexOf(hi);return ((i===0?(rgb[1]-rgb[2])/d:i===1?2+(rgb[2]-rgb[0])/d:4+(rgb[0]-rgb[1])/d)*60+360)%360;};
test('toxic green, hole purple and water cyan keep their hue under hostile colored lights',()=>{
 for(const art of [[.13,.24,.08],[.32,.10,.39],[.08,.25,.27]])for(const ambient of [[.22,.21,.31],[.28,.25,.28]])for(const light of [[1.6,.14,.17],[.6,.09,.8],[8,4,.2],[0,0,0]]){
  const lit=shadeEnvironment(art,ambient,light),delta=Math.abs(hue(art)-hue(lit));assert.ok(Math.min(delta,360-delta)<=15,`${art} -> ${lit}: hue ${delta}`);
 }
});
test('altar red pool stays inside the island and loses its broad wash',()=>{
 const row={id:'altar_ritual',radius:660,energy:.72,position:[5900,3840]};
 assert.ok(presentationRadius(row)<=360,'altar radius <=360 world px');
 assert.ok(renderEnergy(row,0)<=.72,'altar energy <= authored energy');
});
test('native toxic moat keeps all ten authored green emitters in the 3D environment',()=>{
 const hill={cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04},native=[];globalThis.Ch1AltarMoat.lights(native,hill,40);
 assert.equal(typeof layout.moatLights,'function','moat light adapter exists');const rows=layout.moatLights(hill,40);assert.equal(rows.length,10);
 rows.forEach((row,i)=>{assert.deepEqual(row.position,[native[i].x,native[i].y]);assert.deepEqual(row.color,[126/255,236/255,98/255]);assert.equal(row.radius,210);assert.equal(row.energy,.30);});
});
test('native colored emission is added after diffuse shading and survives a dark ambient',()=>{
 const emission=[.04,.12,.03],color=shadeEnvironment([.08,.09,.04],[0,0,0],[0,0,0],emission);
 assert.deepEqual(color,emission,'native self-light is neither tinted nor dimmed by environment lighting');
});

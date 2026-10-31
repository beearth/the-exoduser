import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
test('actor UV views share one immutable GPU source across direction switches',async()=>{
 const {textureView}=await import('../web3d/texture-views.mjs');
 const atlas=new THREE.Texture({width:8192,height:1280});atlas.needsUpdate=true;
 const version=atlas.source.version,views=Array.from({length:64},()=>textureView(atlas));
 views[0].repeat.set(.1,.2);views[0].offset.set(.2,.3);
 assert.equal(atlas.source.version,version);
 assert.ok(views.every(t=>t.source===atlas.source&&t.version>0));
 assert.equal(views[1].repeat.x,1);assert.equal(atlas.offset.x,0);
 const normal=new THREE.DataTexture(new Uint8Array(16),2,2);normal.needsUpdate=true;
 assert.equal(textureView(normal).isDataTexture,true);
});

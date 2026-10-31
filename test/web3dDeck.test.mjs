import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {addWoodDeck} from '../web3d/wood-deck.mjs';
test('weathered deck covers the visual crossing without changing its native height sampler',()=>{
 const group=new THREE.Group(),calls=[],height=(x,y)=>{calls.push([x,y]);return .62;},meshes=addWoodDeck(group,height);
 const matrix=new THREE.Matrix4(),point=new THREE.Vector3();let minZ=Infinity,maxZ=-Infinity;
 for(const mesh of meshes)for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix);minZ=Math.min(minZ,point.z);maxZ=Math.max(maxZ,point.z);assert.ok(Math.abs(point.x-40)<.03);assert.ok(Math.abs(point.y-.655)<1e-6);}
 assert.ok(minZ<53.6&&maxZ>66.4);assert.ok(calls.every(([x])=>x===4000));
 for(const mesh of meshes)assert.ok(Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite));
});

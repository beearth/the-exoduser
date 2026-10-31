import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const json=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const anchors=json('../assets/web3d/map-look-anchors.json');
test('boundary forest joins every edge with low masses and keeps large bases outside the 40px collision band',async()=>{
 const url=new URL('../web3d/environment-layout.mjs',import.meta.url);
 assert.ok(fs.existsSync(url),'boundary forest placement adapter required');
 const {forestLayout,signedBoundaryDistance}=await import(url);
 const data=json('../assets/web3d/forest-ch1.json'),before=JSON.stringify(anchors);
 const plan=forestLayout(data,anchors);
 assert.ok(plan.low.length>100); assert.ok(plan.trees.length>80);
 for(const p of plan.trees)assert.ok(signedBoundaryDistance(p.x,p.y,anchors)>40,'large base outside collision band');
 for(const p of plan.low)assert.ok(Math.abs(signedBoundaryDistance(p.x,p.y,anchors))<220,'low masses join the edge');
 assert.ok(new Set(plan.trees.map(p=>p.layer)).size>=3);
 assert.equal(JSON.stringify(anchors),before);
 assert.deepEqual(plan,forestLayout(data,anchors));
});


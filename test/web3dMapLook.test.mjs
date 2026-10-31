import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const json=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const data=json('../assets/web3d/map-look-ch1.json'),anchors=json('../assets/web3d/map-look-anchors.json');
const moduleURL=new URL('../web3d/map-look-layout.mjs',import.meta.url);
test('Godot authored anchors expand without shifting coordinates or mutating gameplay',async()=>{
 assert.ok(fs.existsSync(moduleURL),'MAP-LOOK placement adapter must exist');
 const {mapLookLayout}=await import(moduleURL),before=JSON.stringify(anchors),plan=mapLookLayout(data,anchors);
 assert.equal(plan.foreground.length,27);
 assert.equal(plan.shafts.length,8);
 assert.equal(plan.shadows.length,29);
 assert.deepEqual(plan.lights.find(x=>x.id==='camp_fire').position,[1820,4010]);
 assert.deepEqual(plan.lights.find(x=>x.id==='altar_ritual').position,[5900,3860]);
 assert.equal(JSON.stringify(anchors),before);
});
test('dynamic enemy and friendly effects share the 18-light limit and expire without state writes',async()=>{
 assert.ok(fs.existsSync(moduleURL),'MAP-LOOK placement adapter must exist');
 const {effectLights,holeLights}=await import(moduleURL),shots=Array.from({length:30},(_,i)=>({x:i*20,y:40,el:i%5,friendly:i%2===0,life:50}));
 const before=JSON.stringify(shots),lights=effectLights(data,shots,[]);
 assert.equal(lights.length,18);assert.equal(JSON.stringify(shots),before);
 assert.equal(effectLights(data,[],[]).length,0);
 assert.equal(holeLights(data,[{x:100,y:200,size:.5}])[0].radius,300);
});
test('foreground parallax fades on walkable floor and near the player',async()=>{
 assert.ok(fs.existsSync(moduleURL),'MAP-LOOK placement adapter must exist');
 const {foregroundPose}=await import(moduleURL),row={position:[10,20],size:800,alpha:.82};
 const p=foregroundPose(row,{x:10,y:20},{x:10,y:20},true,.12);
 assert.equal(p.alpha,.28);assert.deepEqual(p.position,[10,20]);
 assert.ok(foregroundPose(row,{x:1000,y:1000},{x:1000,y:1000},false,.12).alpha>.28);
});

test('landmark lighting keeps the authored color dominant over the moving player light',async()=>{
 const {renderEnergy}=await import(moduleURL);
 assert.equal(typeof renderEnergy,'function','renderer energy adapter required');
 assert.ok(renderEnergy({...data.player_light,id:'player',position:[0,0]},0)>.75);
 assert.ok(renderEnergy({...data.player_light,id:'player',position:[0,0]},0)<1);
 assert.ok(renderEnergy({...data.lights[0],id:'camp_fire',position:[1820,4010]},0)>1);
});

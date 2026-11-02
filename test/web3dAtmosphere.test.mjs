import test from 'node:test';import assert from 'node:assert/strict';
import * as scene from '../web3d/scene-budget.mjs';
import {paintedNormal,fogOpacity} from '../web3d/atmosphere-model.mjs';
const view={x:3000,y:6000,w:1920,h:1080},hero={x:4000,y:6500};
test('critical hits and nearby slash light are never starved by 96 distant bullets',()=>{
 const bullets=Array.from({length:96},(_,i)=>({x:120+i,y:50,life:100,el:0}));
 const hits=[{x:4050,y:6500}];const before=JSON.stringify([bullets,hits]);
 const rows=scene.dynamicLights({fx_light_limit:18,fx_lights:{'hit_effect.gd':{radius:170,energy:.85,color:[1,.9,.76]},'crescent.gd':{radius:260,energy:.7,color:[.86,.88,1]},'enemy_projectile_fire.gd':{radius:230,energy:.95,color:[1,.48,.18]}}},bullets,hits,hero,view);
 assert.ok(rows.some(r=>r.kind==='hit'));assert.ok(rows.length<=18);assert.equal(JSON.stringify([bullets,hits]),before);
});
test('all quality tiers retain the hero pool and 35 percent occlusion while reducing decorations',()=>{
 const high=scene.sceneBudget('high',false,6),low=scene.sceneBudget('low',false,20),proxy=scene.sceneBudget('high',true,20);
 assert.equal(high.occlusionAlpha,.35);assert.equal(low.occlusionAlpha,.35);assert.equal(low.heroLight,true);assert.equal(proxy.heroLight,true);
 assert.ok(low.foliage<high.foliage);assert.ok(low.particles<high.particles);assert.equal(proxy.sway,false);
});
test('increasing layer cost reduces decoration in ordered steps',()=>{
 const base=scene.sceneBudget('high',false,5),slow=scene.sceneBudget('high',false,13),verySlow=scene.sceneBudget('high',false,24);
 assert.ok(slow.scale<base.scale);assert.ok(verySlow.foliage<=slow.foliage);assert.ok(verySlow.lightLimit<=slow.lightLimit);
 assert.ok(base.lightLimit>=32);
});
test('painted luminance relief changes direction with the actual floor grain',()=>{
 assert.deepEqual(paintedNormal(.4,.4,.4,.4),[0,0,1]);
 const a=paintedNormal(.2,.6,.4,.4),b=paintedNormal(.6,.2,.4,.4);
 assert.ok(a[0]<0&&b[0]>0);assert.ok(Math.abs(Math.hypot(...a)-1)<1e-12);
});
test('two ground fog layers remain restrained, move slowly and reduce on low tier',()=>{
 const a=fogOpacity(3600,6400,0,hero),b=fogOpacity(3600,6400,10,hero);
 assert.ok(a>0&&a<.14);assert.notEqual(a,b);assert.ok(Math.abs(a-b)<.02);
 assert.ok(fogOpacity(3600,6400,0,hero,true)<a);
});

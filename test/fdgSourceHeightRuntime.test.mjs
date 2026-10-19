import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSourceHeightFixture } from './fdg-source-height-fixture.mjs';
import { SourcePreviewRuntime } from '../engine/fdg/source-preview-runtime.js';
import { validateSourcePreview } from '../engine/fdg/source-preview.js';
import { FDGRuntime } from '../engine/fdg/runtime.js';
import { createDefaultProject } from '../engine/fdg/catalog.js';

class Probe {
  globalAlpha=0.6; filter='contrast(0.9)'; stack=[]; events=[];
  save(){this.stack.push([this.globalAlpha,this.filter]);}
  restore(){[this.globalAlpha,this.filter]=this.stack.pop();}
  beginPath(){} rect(){} moveTo(){} lineTo(){} closePath(){} clip(){} transform(){}
  translate(x,y){this.events.push({kind:'translate',x,y});}
  drawImage(image,...args){if(this.fail)throw Error('UNIT cache draw failure');this.events.push({kind:'image',image,args});}
  setTransform(){} fillRect(){} fillText(){} ellipse(){} fill(){} stroke(){} arc(){} strokeRect(){}
}
function canvas(context=new Probe()){
  return {width:1000,height:600,clientWidth:1000,clientHeight:600,getContext:()=>context,
    getBoundingClientRect:()=>({left:0,top:0,width:1000,height:600}),addEventListener(){},removeEventListener(){},setAttribute(){},removeAttribute(){},
    ownerDocument:{createElement:()=>canvas(),defaultView:{devicePixelRatio:1,addEventListener(){},removeEventListener(){}}}};
}
function assetsFor(scene){
  const assets=new Map(scene.imageLayers.map(layer=>[layer.src,{status:'ready',image:{src:layer.src,naturalWidth:layer.sourceRect[2],naturalHeight:layer.sourceRect[3]}}]));
  const soil=scene.groundLayers[0]; assets.set(soil.src,{status:'ready',image:{src:soil.src,naturalWidth:1024,naturalHeight:1024}}); return assets;
}
function setup(position=[5220,3940]){
  const scene=structuredClone(makeSourceHeightFixture().scene);scene.actor.position=position;
  const cachedContext=new Probe(), cachedCanvas=canvas(cachedContext);
  const runtime=new SourcePreviewRuntime(scene,undefined,{canvasFactory:()=>cachedCanvas});
  const owner={assets:assetsFor(scene),player:{x:position[0],y:position[1],radius:12},camera:{x:position[0],y:position[1],follow:true},width:1000,height:600,canvas:canvas()};
  assert.equal(runtime.validateReady(owner.assets).ok,true);assert.equal(runtime.move(owner.player,...position),true);
  return {runtime,owner,cachedCanvas,cachedContext};
}

test('supported runtime ramp changes derived foot Z and blocks the east cliff without mutating XY/Z; capture remains XY-only with exact observation',()=>{
  const {runtime,owner}=setup([4990,3940]);assert.equal(owner.player.z,0);
  for(let x=5000;x<=5420;x+=10)assert.equal(runtime.move(owner.player,x,3940),true);
  assert.equal(owner.player.z,64);
  const captured=runtime.capture(owner.player,{x:5420,y:3876,follow:true});
  assert.deepEqual(captured.actor.position,[5420,3940]);assert.equal(captured.actor.position.length,2);
  assert.equal(captured.provenance.heightRuntimeObservation.engineFootZ,64);
  assert.equal(captured.provenance.sourcePhysicalZClaim,false);assert.equal(validateSourcePreview(captured).ok,true);
  assert.equal(runtime.move(owner.player,6670,3940),false,'a sweep cannot jump across the cliff band');
  assert.deepEqual([owner.player.x,owner.player.y,owner.player.z],[5420,3940,64]);
  const outside=setup([6670,3940]);let x=6670,blocked=false;
  for(let i=0;i<8;i++){if(!outside.runtime.move(outside.owner.player,x-10,3940)){blocked=true;break;}x-=10;}
  assert.equal(blocked,true);assert.equal(outside.runtime.blockedReason,'source-cliff-band');
  assert.equal(outside.owner.player.z,0);assert.equal(outside.runtime.snapshot(outside.owner.player).height,null);
  assert.deepEqual(outside.runtime.snapshot(outside.owner.player).sourcePending,['collision']);
  assert.equal(outside.runtime.scene.provenance.actualObjectColliderCount,null);
  runtime.dispose();outside.runtime.dispose();
});

test('projected soil uses a bounded original-texture cache once, then one surface draw; actor translation matches the mapped foot and disposal releases pixels',()=>{
  const {runtime,owner,cachedCanvas,cachedContext}=setup();const before=JSON.stringify(runtime.scene.imageLayers);
  const main=new Probe();let actor=0;
  const draw=()=>runtime.draw(main,owner,{drawActor(){actor++;}});
  draw();const initial=runtime.snapshot(owner.player,owner.camera);
  assert.equal(initial.engineFootZ,36.784000000000006);
  assert.equal(initial.groundHeightCacheBuilds,1);assert.equal(initial.groundHeightTriangles,2024);
  assert.deepEqual([cachedCanvas.width,cachedCanvas.height],[1720,944]);
  assert.equal(cachedContext.events.length,2024);
  for(const event of cachedContext.events){const [sx,sy,sw,sh]=event.args;assert.ok(sx>=0&&sy>=0&&sx+sw<=1024&&sy+sh<=1024);}
  assert.ok(main.events.some(e=>e.image===cachedCanvas));
  assert.ok(main.events.some(e=>e.kind==='translate'&&e.y===-36.784000000000006));
  draw();assert.equal(runtime.snapshot(owner.player).groundHeightCacheBuilds,1);assert.equal(actor,2);
  assert.equal(JSON.stringify(runtime.scene.imageLayers),before);
  assert.equal(main.globalAlpha,0.6);assert.equal(main.filter,'contrast(0.9)');assert.equal(main.stack.length,0);
  runtime.dispose();assert.deepEqual([cachedCanvas.width,cachedCanvas.height],[0,0]);
});

test('height patch offscreen allocates no cache and failed texture projection restores caller context before a clean retry',()=>{
  const offscreen=setup([4020,7400]);offscreen.runtime.draw(new Probe(),offscreen.owner);
  assert.equal(offscreen.runtime.snapshot(offscreen.owner.player).ownedHeightCanvases,0);offscreen.runtime.dispose();
  const {runtime,owner,cachedContext}=setup([5220,3940]);
  cachedContext.fail=true;const context=new Probe();assert.throws(()=>runtime.draw(context,owner),/UNIT cache draw failure/);
  assert.equal(context.stack.length,0);assert.equal(context.globalAlpha,0.6);assert.equal(context.filter,'contrast(0.9)');
  assert.equal(cachedContext.stack.length,0);cachedContext.fail=false;runtime.draw(context,owner);
  assert.equal(runtime.snapshot(owner.player).groundHeightCacheBuilds,1);runtime.dispose();
});

test('owner supported movement and camera follow projected foot; JSON reopen restores the derived height, camera and separate source authoring',async()=>{
  const scene=structuredClone(makeSourceHeightFixture().scene);scene.actor.position=[5220,3940];scene.camera={x:5220,y:3903.216,follow:true};
  const project=createDefaultProject();project.sourcePreview=scene;project.map.tiles=[...scene.nav.tiles];project.map.start={x:100,y:185};
  const instance=new FDGRuntime(canvas(),project);
  for(const [src,record]of assetsFor(scene))instance.assets.set(src,record);
  for(const resource of [...project.characters,...project.vfx])for(const src of new Set([resource.sprite?.src,...Object.values(resource.sprite?.directions||{})].filter(Boolean)))
    instance.assets.set(src,{status:'ready',image:{src,naturalWidth:4096,naturalHeight:4096}});
  await instance.load();assert.equal(instance.sourcePreviewReady,true);
  assert.equal(instance.moveSourcePreview(10,0),true);
  assert.equal(instance.camera.y,instance.player.y-instance.player.z);
  instance.followCharacter();assert.equal(instance.camera.y,instance.player.y-instance.player.z);
  const saved=instance.captureSourcePreview();assert.equal(saved.heightPreview.heightMapping.scalePx,64);
  const reopened=new SourcePreviewRuntime(JSON.parse(JSON.stringify(saved)));
  assert.equal(reopened.scene.provenance.heightRuntimeObservation.engineFootZ,instance.player.z);
  assert.equal(reopened.scene.camera.y,instance.camera.y);assert.equal(reopened.scene.provenance.sourcePhysicalZClaim,false);
  assert.equal(saved.provenance.actualObjectColliderCount,null);
  instance.dispose();reopened.dispose();
});

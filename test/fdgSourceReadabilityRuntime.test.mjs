import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSourceHeightFixture } from './fdg-source-height-fixture.mjs';
import { attachSourcePreviewAppearance, validateSourcePreview } from '../engine/fdg/source-preview.js';
import { SourcePreviewRuntime } from '../engine/fdg/source-preview-runtime.js';
import { FDGRuntime } from '../engine/fdg/runtime.js';
import { createDefaultProject } from '../engine/fdg/catalog.js';

// Synthetic UNIT input only. No completed suite, source file, PNG or HTTP read.
const appearance = () => ({version:1,kind:'engine-authored-readability',
  actorCutaway:{kind:'projected-ellipse',innerOpacity:.24,outerOpacity:.62,featherPx:8},
  terrainLighting:{kind:'engine-authored-directional',lightDirection:[-.45,-.65,.75],ambient:.45,contrast:.65,minBrightness:.55,maxBrightness:1.2},
  frontWalls:{kind:'source-height-derived-south',hillSegments:128,rampSegments:32,opacity:1,brightness:.55,probePx:.5},
  authoredBy:'UNIT explicit readability authoring',sourcePhysicalZClaim:false});
const frame = {width:96,height:96,anchorX:.5,anchorY:.85};
class Probe {
  globalAlpha=.6;filter='contrast(.9)';stack=[];events=[];path=[];
  save(){this.stack.push([this.globalAlpha,this.filter]);}
  restore(){[this.globalAlpha,this.filter]=this.stack.pop();}
  beginPath(){this.path=[];}rect(...p){this.path.push(['rect',...p]);}
  moveTo(...p){this.path.push(['move',...p]);}lineTo(...p){this.path.push(['line',...p]);}
  ellipse(...p){this.path.push(['ellipse',...p]);}closePath(){}clip(rule){this.events.push({kind:'clip',rule,path:structuredClone(this.path)});}
  transform(){}translate(x,y){this.events.push({kind:'translate',x,y});}
  drawImage(image,...args){if(this.failOn?.(image,this.globalAlpha))throw Error('UNIT local-cutaway draw failure');
    this.events.push({kind:'image',image,args,alpha:this.globalAlpha,filter:this.filter});}
  setTransform(){}fillRect(){}fillText(){}fill(){}stroke(){}arc(){}strokeRect(){}
}
function canvas(context=new Probe()) {return {width:1000,height:600,clientWidth:1000,clientHeight:600,getContext:()=>context,
  getBoundingClientRect:()=>({left:0,top:0,width:1000,height:600}),addEventListener(){},removeEventListener(){},setAttribute(){},removeAttribute(){},
  ownerDocument:{createElement:()=>canvas(),defaultView:{devicePixelRatio:1,addEventListener(){},removeEventListener(){}}}};}
function assetsFor(scene){const assets=new Map(scene.imageLayers.map(l=>[l.src,{status:'ready',image:{src:l.src,naturalWidth:l.sourceRect[2],naturalHeight:l.sourceRect[3]}}]));
  const soil=scene.groundLayers[0];assets.set(soil.src,{status:'ready',image:{src:soil.src,naturalWidth:1024,naturalHeight:1024}});return assets;}
function setup(position=[4020,7210]) {
  const base=structuredClone(makeSourceHeightFixture().scene);base.actor.position=position;base.camera={x:position[0],y:position[1],follow:true};
  const attached=attachSourcePreviewAppearance(base,{appearancePreview:appearance()});assert.equal(attached.ok,true,attached.errors.join('\n'));
  const cachedContext=new Probe(),cachedCanvas=canvas(cachedContext),runtime=new SourcePreviewRuntime(attached.sourcePreview,undefined,{canvasFactory:()=>cachedCanvas});
  const owner={assets:assetsFor(base),player:{x:position[0],y:position[1],radius:12},camera:{...base.camera},width:1000,height:600,canvas:canvas()};
  assert.equal(runtime.validateReady(owner.assets).ok,true);assert.equal(runtime.move(owner.player,...position),true);
  return {base,runtime,owner,cachedContext,cachedCanvas};
}
test('local cutaway preserves one actor in sorted depth and full foreground opacity outside separate ellipse subpaths',()=>{
  const {runtime,owner}=setup(),main=new Probe(),before=JSON.stringify(runtime.scene.imageLayers);
  const counts=runtime.draw(main,owner,{actorFrame:frame,drawActor(){main.events.push({kind:'actor'});}});
  const actor=main.events.findIndex(e=>e.kind==='actor');assert.equal(main.events.filter(e=>e.kind==='actor').length,1);
  assert.ok(main.events.slice(0,actor).some(e=>e.kind==='image'&&e.image.src!=='/fdg-source/ch1-1/ground/ground_dark_soil.png'));
  const front=main.events.slice(actor+1).filter(e=>e.kind==='image');assert.ok(front.length>3);
  assert.ok(front.some(e=>Math.abs(e.alpha-.6*.8*.24)<1e-12));assert.ok(front.some(e=>Math.abs(e.alpha-.6*.8*.62)<1e-12));
  assert.ok(front.some(e=>Math.abs(e.alpha-.6*.8)<1e-12));assert.ok(counts.foregroundCutawayObjects>0);
  assert.equal(counts.cutawayDrawCalls,counts.foregroundCutawayObjects*3);
  const rings=main.events.filter(e=>e.kind==='clip'&&e.path.filter(p=>p[0]==='ellipse').length===2);assert.ok(rings.length>0);
  for(const event of rings){assert.deepEqual(event.path.map(p=>p[0]),['move','ellipse','move','ellipse']);assert.equal(event.rule,'evenodd');}
  assert.equal(JSON.stringify(runtime.scene.imageLayers),before);assert.equal(main.globalAlpha,.6);assert.equal(main.filter,'contrast(.9)');assert.equal(main.stack.length,0);
  runtime.dispose();
});
test('failed local inner clip restores owner state and never draws the actor twice on retry',()=>{
  const {runtime,owner}=setup(),main=new Probe();let actor=0;
  main.failOn=(_,alpha)=>Math.abs(alpha-.6*.8*.24)<1e-12;
  assert.throws(()=>runtime.draw(main,owner,{actorFrame:frame,drawActor(){actor++;}}),/UNIT local-cutaway/);
  assert.equal(main.stack.length,0);assert.equal(main.globalAlpha,.6);assert.equal(main.filter,'contrast(.9)');assert.equal(actor,1);
  main.failOn=null;runtime.draw(main,owner,{actorFrame:frame,drawActor(){actor++;}});assert.equal(actor,2);runtime.dispose();
});
test('new shaded south walls reuse bounded soil UV and one cache while authored input, source height and source pending survive',()=>{
  const {base,runtime,owner,cachedCanvas,cachedContext}=setup([5220,3940]),main=new Probe();
  const draw=()=>runtime.draw(main,owner,{actorFrame:frame,drawActor(){}});draw();
  const initial=runtime.snapshot(owner.player);assert.ok(initial.groundHeightWallProfiles>0&&initial.groundHeightWallProfiles<=96);
  assert.ok(initial.groundHeightWallTriangles>0);assert.ok(initial.groundHeightShadedTriangles>initial.groundHeightWallTriangles);
  assert.equal(initial.groundHeightTriangles,2024+initial.groundHeightWallTriangles);assert.ok(initial.groundHeightTriangles<=2792);
  const texture=cachedContext.events.filter(e=>e.kind==='image');assert.equal(texture.length,initial.groundHeightTriangles);
  for(const event of texture){const [sx,sy,sw,sh]=event.args;assert.ok(sx>=-1e-9&&sy>=-1e-9&&sx+sw<=1024+1e-9&&sy+sh<=1024+1e-9,'original-texture UV remains bounded');}
  assert.ok(texture.some(e=>e.filter==='none'),'flat lighting stays calibrated to1');
  draw();assert.equal(runtime.snapshot(owner.player).groundHeightCacheBuilds,1);
  assert.equal(main.events.filter(e=>e.kind==='image'&&e.image===cachedCanvas).length,2);
  const captured=runtime.capture(owner.player,owner.camera);assert.deepEqual(captured.heightPreview,base.heightPreview);
  assert.deepEqual(captured.nav,base.nav);assert.deepEqual(captured.imageLayers,base.imageLayers);
  assert.deepEqual(captured.provenance.appearanceEngineAuthoredInputSnapshot,appearance());assert.equal(captured.provenance.actualObjectColliderCount,null);
  assert.deepEqual(initial.sourcePending,['collision']);assert.equal(initial.sourcePhysicalZClaim,false);
  console.log('READABILITY_CACHE',JSON.stringify({profiles:initial.groundHeightWallProfiles,wallTriangles:initial.groundHeightWallTriangles,totalTriangles:initial.groundHeightTriangles,shadedTriangles:initial.groundHeightShadedTriangles,cacheBytes:initial.groundHeightCacheBytes}));
  runtime.dispose();assert.deepEqual([cachedCanvas.width,cachedCanvas.height],[0,0]);
});
test('owner consumes actual character frame and reopens appearance authoring after supported movement without claiming native colliders',async()=>{
  const {runtime,owner}=setup(),scene=runtime.capture(owner.player,owner.camera);runtime.dispose();
  const project=createDefaultProject();project.sourcePreview=scene;project.map.tiles=[...scene.nav.tiles];project.map.start={x:100,y:185};
  const main=new Probe(),instance=new FDGRuntime(canvas(main),project);
  for(const [src,record]of assetsFor(scene))instance.assets.set(src,record);
  for(const resource of [...project.characters,...project.vfx])for(const src of new Set([resource.sprite?.src,...Object.values(resource.sprite?.directions||{})].filter(Boolean)))
    instance.assets.set(src,{status:'ready',image:{src,naturalWidth:4096,naturalHeight:4096}});
  await instance.load();assert.equal(instance.sourcePreviewReady,true);assert.ok(instance.getSourcePreviewSnapshot().foregroundCutawayObjects>0);
  assert.equal(instance.moveSourcePreview(0,-10),true);const saved=instance.captureSourcePreview();
  assert.deepEqual(saved.actor.position,[4020,7200]);assert.equal(saved.actor.position.length,2);
  assert.deepEqual(saved.appearancePreview,appearance());assert.deepEqual(saved.provenance.appearanceEngineAuthoredInputSnapshot,appearance());
  assert.equal(validateSourcePreview(JSON.parse(JSON.stringify(saved))).ok,true);
  const reopened=new SourcePreviewRuntime(JSON.parse(JSON.stringify(saved)));assert.deepEqual(reopened.scene.appearancePreview,appearance());
  assert.equal(reopened.scene.provenance.sourcePhysicalZClaim,false);assert.equal(reopened.scene.provenance.actualObjectColliderCount,null);
  reopened.dispose();instance.dispose();
});

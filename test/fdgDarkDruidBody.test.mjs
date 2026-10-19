import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PNG } from '/Users/fordeargamers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs/lib/png.js';
import { buildDarkDruidRig, buildDarkDruidScene, DRUID_SOURCE, DRUID_SOURCE_SHA256 } from '../tools/fdg-studio/build-dark-druid-body.mjs';
import { evaluateRig } from '../engine/fdg/rig.js';
import { validateRigProject } from '../engine/fdg/rig-project.js';
import { validateProject } from '../engine/fdg/project.js';
import { RigSceneRuntime } from '../engine/fdg/rig-scene-runtime.js';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';

const SCENE_PATH = new URL('../tools/fdg-studio/fixtures/dark-druid-normal-body.fdg.json', import.meta.url);
const RIG_PATH = new URL('../tools/fdg-studio/fixtures/dark-druid-normal-body.rig.json', import.meta.url);
const [sceneBytes, rigBytes, sourceBytes] = await Promise.all([fs.readFile(SCENE_PATH), fs.readFile(RIG_PATH), fs.readFile(new URL(`../${DRUID_SOURCE}`, import.meta.url))]);
const scene = JSON.parse(sceneBytes), rig = JSON.parse(rigBytes), image = PNG.sync.read(sourceBytes);
const NODE = 'dark-druid-body-node', IDLE = 'dark-druid-idle', ATTACK = 'dark-druid-staff-strike';
const FRONT_VERTICES = 3276, FRONT_TRIANGLES = 4622, MODEL_EPSILON = 1e-7;
const metrics = { scope: 'Dark Druid NORMAL first-slice authored data and CPU consumer only', browserVisualVerdict: 'ROOT_OWNED', oldSuitesExecuted: 0, sourceWrites: 0, gitCommands: 0 };
const results = [];
const clone = value => structuredClone(value);
const jsonData = value => JSON.parse(JSON.stringify(value));
const hash = value => createHash('sha256').update(value).digest('hex');
const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));
const maxVertexDrift = (a, b, indices = a.map((_, i) => i)) => Math.max(0, ...indices.map(i => distance(a[i], b[i])));
const area3 = (a, b, c) => { const u = b.map((v, i) => v - a[i]), v = c.map((n, i) => n - a[i]); return Math.hypot(u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]) / 2; };
const uvArea = t => { const [a,b,c] = t.map(i => [rig.mesh.uvs[i][0]*355, rig.mesh.uvs[i][1]*541]); return Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2; };
const sample = (clipId, time) => evaluateRig(rig, { clipId, time });
const regionIndices = region => rig.provenance.regions.flatMap((part, i) => part === region ? [i] : []);
const centroid = (vertices, indices) => [0,1,2].map(axis => indices.reduce((sum, i) => sum + vertices[i][axis], 0) / indices.length);
const matrixPoint = (m, p) => [0,1,2].map(axis => m[axis]*p[0]+m[axis+4]*p[1]+m[axis+8]*p[2]+m[axis+12]);
const phaseSamples = [[IDLE,0],[IDLE,.25],[IDLE,.5],[IDLE,1],[IDLE,1.5],[IDLE,2],[ATTACK,0],[ATTACK,.25],[ATTACK,.65],[ATTACK,.9],[ATTACK,1.1],[ATTACK,1.25],[ATTACK,1.65],[ATTACK,2],[ATTACK,2.4]];

function check(name, body) {
  test(name, async () => {
    try { await body(); results.push({ name, status: 'PASS' }); }
    catch (error) { results.push({ name, status: 'FAIL', message: error.message }); throw error; }
  });
}

function drawingContext() {
  const state = { drawImages: [], fills: [], strokes: 0, path: [], stack: [] };
  const context = {
    state, fillStyle: '#000000',
    save() { state.stack.push(this.fillStyle); }, restore() { this.fillStyle = state.stack.pop(); },
    beginPath() { state.path = []; }, moveTo(x,y) { state.path.push([x,y]); }, lineTo(x,y) { state.path.push([x,y]); }, closePath() {},
    clip() {}, transform(...values) { assert.ok(values.every(Number.isFinite)); },
    drawImage(...args) { state.drawImages.push({ image: args[0], path: clone(state.path), args: args.slice(1) }); },
    fill() { state.fills.push({ color: this.fillStyle, path: clone(state.path) }); }, stroke() { state.strokes++; },
    setTransform() {}, fillRect() {}, strokeRect() {}, clearRect() {}, arc() {}, ellipse() {}, fillText() {}, translate() {}, rotate() {}, scale() {},
    createRadialGradient() { return { addColorStop() {} }; }, createLinearGradient() { return { addColorStop() {} }; },
  };
  return context;
}

function eventSurface() {
  const events = new Map();
  return { events, addEventListener(type, listener) { if (!events.has(type)) events.set(type,new Set()); events.get(type).add(listener); },
    removeEventListener(type, listener) { events.get(type)?.delete(listener); }, countListeners() { return [...events.values()].reduce((n,set) => n+set.size,0); } };
}

function ownerSurface() {
  const context = drawingContext(), dimensions = new Map(), images = [], raf = new Map(), observers = new Set(); let nextRaf = 1;
  for (const resource of [...scene.characters,...scene.vfx]) if (resource.sprite) {
    const sprite = resource.sprite, size = [sprite.columns*sprite.frameWidth,sprite.rows*sprite.frameHeight];
    for (const src of new Set([sprite.src,...Object.values(sprite.directions || {})])) dimensions.set(src,size);
  }
  dimensions.set(DRUID_SOURCE,[355,541]);
  const window = Object.assign(eventSurface(), { devicePixelRatio:1, requestAnimationFrame(callback) { const id=nextRaf++;raf.set(id,callback);return id; }, cancelAnimationFrame(id) { raf.delete(id); },
    Image: class { constructor() { images.push(this); } set src(value) { this.source=value.replace(/^\//,''); const size=dimensions.get(this.source); assert.ok(size,`Unexpected source ${value}`); [this.naturalWidth,this.naturalHeight]=size; queueMicrotask(()=>this.onload?.()); } removeAttribute() {} },
    ResizeObserver: class { constructor() { observers.add(this); } observe() {} disconnect() { observers.delete(this); } },
  });
  const document = Object.assign(eventSurface(),{defaultView:window,hidden:false});
  const attributes = new Map();
  const canvas = Object.assign(eventSurface(), { ownerDocument:document,clientWidth:960,clientHeight:540,width:960,height:540,
    getContext() { return context; }, getBoundingClientRect() { return {left:0,top:0,width:960,height:540}; },
    hasAttribute(key) { return attributes.has(key); },setAttribute(key,value) { attributes.set(key,value); },removeAttribute(key) { attributes.delete(key); },focus() {} });
  return {context,window,document,canvas,images,raf,observers};
}

check('approved NORMAL source builds one conforming finite UV silhouette with explicit authored short sides', async () => {
  assert.equal(hash(sourceBytes),'74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68');
  assert.equal(DRUID_SOURCE_SHA256,hash(sourceBytes)); assert.deepEqual([image.width,image.height],[355,541]);
  assert.deepEqual(scene.rigScene.resources[0].project,rig);
  // Fixtures are JSON artifacts: JSON's canonical -0 => 0 conversion is part
  // of the supported serialization contract, not an authored-data change.
  assert.deepEqual(jsonData(buildDarkDruidRig(image,hash(sourceBytes))),rig); assert.deepEqual(jsonData(buildDarkDruidScene(rig)),scene);
  assert.equal(validateRigProject(rig).ok,true); assert.equal(validateProject(scene,{geometry:false}).ok,true);
  assert.deepEqual([rig.mesh.vertices.length,rig.mesh.triangles.length,rig.skeleton.bones.length,rig.clips.length],[3289,4644,19,2]);
  const p=rig.provenance, extraction=p.extraction;
  assert.equal(p.authority,'ENGINE_AUTHORING'); assert.equal(p.subject,'boss-dark-druid-NORMAL');
  assert.equal(p.sourceImageModified,false); assert.equal(p.gameplayApplied,false); assert.equal(p.fullBackAuthored,false); assert.equal(p.nativeCombatApplied,false); assert.equal(p.newFx,false);
  assert.equal(p.depthAuthoringDruid.sourceRecovered,false); assert.match(p.sourceGap,/SOURCE_GAP/);
  assert.deepEqual([extraction.alphaCutoff,extraction.visiblePixels,extraction.macroCell,extraction.leafCell,extraction.thinLeaf,extraction.edgeIterations,extraction.sourcePrecisionPx,extraction.originalVertices,extraction.originalTriangles,extraction.refinedTriangles,extraction.insertedEdgePoints],[32,127418,16,8,4,12,.0001,3276,4622,131,166]);
  assert.equal(extraction.conformingEdgeTolerancePx,.00005); assert.equal(extraction.sharedSourceVertex,true);
  const unique=new Set();let maxSourceInverseError=0,visiblePixels=0;
  for(let i=0;i<image.width*image.height;i++)if(image.data[i*4+3]>=32)visiblePixels++;
  assert.equal(visiblePixels,127418);
  const boneIds=new Set(rig.skeleton.bones.map(b=>b.id));
  rig.mesh.vertices.forEach((v,i)=> {
    assert.equal(v.length,3);assert.ok(v.every(Number.isFinite));
    assert.ok(rig.mesh.uvs[i].every(value=>Number.isFinite(value)&&value>=0&&value<=1));
    const px=[v[0]*150+221,526-v[1]*150],uvpx=[rig.mesh.uvs[i][0]*355,rig.mesh.uvs[i][1]*541];
    maxSourceInverseError=Math.max(maxSourceInverseError,distance(px,uvpx));
    const influences=rig.mesh.weights[i];assert.ok(influences.length>0);assert.ok(influences.every(w=>boneIds.has(w.boneId)&&Number.isFinite(w.weight)&&w.weight>0));
    assert.ok(Math.abs(influences.reduce((s,w)=>s+w.weight,0)-1)<1e-12);
    if(i<FRONT_VERTICES) { const key=uvpx.map(n=>Math.round(n*1e4)).join(':'); assert.ok(!unique.has(key),'Front source seam must share a single vertex');unique.add(key); }
  });
  assert.ok(maxSourceInverseError<=.0001);
  const bind=sample(null,0),areas=rig.mesh.triangles.map(t=>{assert.equal(new Set(t).size,3);assert.ok(t.every(i=>Number.isSafeInteger(i)&&i>=0&&i<3289));return area3(...t.map(i=>bind.vertices[i]));});
  assert.ok(areas.every(a=>Number.isFinite(a)&&a>1e-12));
  const totalSourceArea=rig.mesh.triangles.slice(0,FRONT_TRIANGLES).reduce((sum,t)=>sum+uvArea(t),0);
  assert.ok(totalSourceArea>visiblePixels*.85&&totalSourceArea<visiblePixels*1.1,'UV silhouette should cover the source mass, not a bounding box');
  assert.equal(rig.mesh.faceColors.slice(0,FRONT_TRIANGLES).every(c=>c===null),true);
  const side=p.depthAuthoringDruid.sideSegments;assert.equal(side.length,11);
  const rear=new Set();for(const segment of side) { assert.deepEqual(segment.faces.map(i=>rig.mesh.faceColors[i]),['#28221f','#1b1715']);
    segment.rear.forEach((r,j)=>{rear.add(r);const f=segment.front[j];assert.deepEqual(rig.mesh.vertices[r].slice(0,2),rig.mesh.vertices[f].slice(0,2));assert.equal(rig.mesh.vertices[r][2],-.055);assert.deepEqual(rig.mesh.uvs[r],rig.mesh.uvs[f]);assert.deepEqual(rig.mesh.weights[r],rig.mesh.weights[f]);}); }
  assert.equal(rear.size,13);
  metrics.geometry={vertices:3289,frontVertices:3276,triangles:4644,frontTriangles:4622,bones:19,shortSideSegments:11,rearVertices:13,authoringFaces:22,alphaVisiblePixels:visiblePixels,totalSourceArea,sourceAreaRatio:totalSourceArea/visiblePixels,minBindAreaModel2:Math.min(...areas),maxSourceInverseErrorPx:maxSourceInverseError};
});

check('actual LBS gives separate body arm staff coat motion while hand staff weld and boots stay fixed', () => {
  const bind=sample(null,0),bootIndices=[...regionIndices('leftBoot'),...regionIndices('rightBoot')];assert.ok(bootIndices.length>20);
  const boneById=new Map(rig.skeleton.bones.map(b=>[b.id,b]));assert.equal(boneById.get('staff').parent,'leftHand');assert.deepEqual(boneById.get('staff').translation,[0,0,0]);
  assert.deepEqual(['leftBoot','rightBoot'].map(id=>boneById.get(id).parent),['root','root']);
  for(const clip of rig.clips) assert.ok(clip.tracks.every(track=>!['staff','root','leftBoot','rightBoot'].includes(track.boneId)));
  for(const part of ['staff','leftHand','leftBoot','rightBoot']) for(const index of regionIndices(part))assert.deepEqual(rig.mesh.weights[index],[{boneId:part,weight:1}]);
  const phaseMetrics=[]; let maxFootDrift=0,maxWeldDrift=0,minArea=Infinity;
  for(const [clip,time]of phaseSamples) {
    const evaluated=sample(clip,time),matrices=new Map(evaluated.boneMatrices.map(b=>[b.id,b.skin]));
    const matrixDrift=Math.max(...matrices.get('staff').map((v,i)=>Math.abs(v-matrices.get('leftHand')[i])));
    assert.ok(matrixDrift<1e-12);
    const pivot=[(77-221)/150,(526-242)/150,.035]; const weldDrift=distance(matrixPoint(matrices.get('staff'),pivot),matrixPoint(matrices.get('leftHand'),pivot));
    const footDrift=maxVertexDrift(bind.vertices,evaluated.vertices,bootIndices); assert.ok(footDrift<=MODEL_EPSILON);assert.ok(weldDrift<=MODEL_EPSILON);
    const area=Math.min(...rig.mesh.triangles.map(t=>area3(...t.map(i=>evaluated.vertices[i]))));assert.ok(area>1e-12);
    assert.deepEqual(evaluated.drawOrder,rig.mesh.drawOrder);assert.deepEqual(evaluated.uvs,rig.mesh.uvs);
    maxFootDrift=Math.max(maxFootDrift,footDrift);maxWeldDrift=Math.max(maxWeldDrift,weldDrift);minArea=Math.min(minArea,area);
    phaseMetrics.push({clip,time,footDriftModel:footDrift,handStaffMatrixError:matrixDrift,handStaffWeldDriftModel:weldDrift,minAreaModel2:area});
  }
  const impact=sample(ATTACK,.9),motion={};
  for(const part of ['body','leftSleeve','rightArm','staff','coatLeft','coatRight','coatFront','coatBack']) {
    const ids=regionIndices(part);assert.ok(ids.length>0);motion[part]=centroid(impact.vertices,ids).map((v,i)=>v-centroid(bind.vertices,ids)[i]);
    assert.ok(Math.hypot(...motion[part])>1e-5,`${part} must actually move`);
  }
  for(const pair of [['body','leftSleeve'],['body','staff'],['body','coatLeft'],['coatLeft','coatRight'],['coatFront','coatBack']])assert.ok(distance(motion[pair[0]],motion[pair[1]])>.001,`${pair.join('/')} need authored relative motion`);
  const layer={coatBack:-2,coatLeft:-1,coatRight:-1,body:0,leftBoot:1,rightBoot:1,coatFront:2,head:3,leftSleeve:4,rightArm:4,leftHand:5,staff:6,'authored-arm-side':4};
  rig.provenance.triangleRegions.forEach((part,i)=>assert.equal(rig.mesh.drawOrder[i],layer[part]));
  const independent=sample(ATTACK,.9);independent.vertices[0][0]=999;independent.uvs[0][0]=.5;independent.drawOrder[0]=999;independent.texture.width=1;
  assert.deepEqual(sample(ATTACK,.9).vertices,impact.vertices);assert.equal(rig.materials[0].texture.width,355);
  metrics.motion={phaseCount:phaseMetrics.length,bootVertices:bootIndices.length,maxFootDriftModel:maxFootDrift,maxHandStaffWeldDriftModel:maxWeldDrift,minPhaseAreaModel2:minArea,relativeRegionDisplacementsModel:motion,phases:phaseMetrics};
});

check('loop idle and public clip entry return remain continuous on the same owner ticks without FX sequence', () => {
  const idle=rig.clips.find(c=>c.id===IDLE),attack=rig.clips.find(c=>c.id===ATTACK);
  assert.deepEqual([idle.duration,idle.fps,idle.loop,idle.tracks.length],[2,24,true,10]);
  assert.deepEqual([attack.duration,attack.fps,attack.loop,attack.tracks.length],[2.4,24,false,12]);
  idle.tracks.forEach(track=>assert.deepEqual(track.keys.map(k=>k.time),[0,.25,.5,.75,1,1.25,1.5,1.75,2]));
  attack.tracks.forEach(track=>assert.deepEqual(track.keys.map(k=>k.time),[0,.25,.65,.9,1.1,1.25,1.65,2,2.4]));
  assert.equal(Object.hasOwn(scene.rigScene,'sequence'),false);
  assert.deepEqual(scene.rigScene.nodes[0].returnTo,{clipId:IDLE,transitionSeconds:.35});
  const idleMovement=maxVertexDrift(sample(IDLE,0).vertices,sample(IDLE,.5).vertices);assert.ok(idleMovement>.005);
  const idleClosure=maxVertexDrift(sample(IDLE,0).vertices,sample(IDLE,2).vertices);assert.ok(idleClosure<MODEL_EPSILON);
  const attackReturn=maxVertexDrift(sample(ATTACK,0).vertices,sample(ATTACK,2.4).vertices);assert.ok(attackReturn<MODEL_EPSILON);
  const consumer=new RigSceneRuntime(scene.rigScene);try {
    consumer.update(.5);const before=consumer.getNodeSnapshot(NODE);
    assert.equal(consumer.setClip(NODE,ATTACK),true);const entry=consumer.getNodeSnapshot(NODE);
    assert.equal(maxVertexDrift(before.vertices,entry.vertices),0);assert.equal(entry.transition.duration,.25);
    const rejected=clone(entry);assert.equal(consumer.setClip(NODE,IDLE),false);assert.deepEqual(consumer.getNodeSnapshot(NODE),rejected);
    for(let i=0;i<14;i++)consumer.update(FIXED_STEP);assert.notEqual(consumer.getNodeSnapshot(NODE).transition,null);
    consumer.update(FIXED_STEP);const entered=consumer.getNodeSnapshot(NODE);assert.equal(entered.transition,null);assert.ok(Math.abs(entered.time-.25)<1e-12);
    for(let i=15;i<144;i++)consumer.update(FIXED_STEP);
    const returned=consumer.getNodeSnapshot(NODE);assert.equal(returned.clipId,IDLE);assert.equal(returned.time,0);assert.equal(returned.transition.duration,.35);
    const end=sample(ATTACK,2.4),returnContinuity=maxVertexDrift(end.vertices,returned.vertices);assert.ok(returnContinuity<MODEL_EPSILON);
    for(let i=0;i<20;i++)consumer.update(FIXED_STEP);assert.notEqual(consumer.getNodeSnapshot(NODE).transition,null);
    consumer.update(FIXED_STEP);assert.equal(consumer.getNodeSnapshot(NODE).transition,null);
    assert.equal(consumer.getSequenceSnapshot().status,'unavailable');assert.equal(consumer.takeSequenceEvent(),null);
    metrics.clips={idleMovementModel:idleMovement,idleLoopClosureModel:idleClosure,attackEndReturnModel:attackReturn,entryTicks:15,returnTicks:21,returnContinuityModel:returnContinuity,fxSequence:false};
  } finally { consumer.dispose(); }
});

check('new rig uses actual UV drawImage and explicit short-side fills in layer order at front and small yaw', () => {
  const texture=rig.materials[0].texture,readyImage={naturalWidth:355,naturalHeight:541};const views=[];
  const consumer=new RigSceneRuntime(scene.rigScene,{worldToScreen:()=>({x:480,y:495}),getImage:src=>src===texture.src?readyImage:null});
  try { consumer.seek(NODE,.9);consumer.setClip(NODE,ATTACK,0);consumer.seek(NODE,.9);
    for(const degrees of [0,-22,22]) {
      consumer.setView(degrees*Math.PI/180,degrees===0?0:6*Math.PI/180);consumer.evaluate();
      const context=drawingContext(),draws=consumer.drawNode(context,NODE,{width:960,height:540}),snapshot=consumer.getNodeSnapshot(NODE);
      assert.equal(snapshot.textureDraws,FRONT_TRIANGLES);assert.equal(snapshot.authoringDraws,degrees===0?0:22);assert.equal(draws,snapshot.textureDraws+snapshot.authoringDraws);
      assert.equal(context.state.drawImages.length,FRONT_TRIANGLES);assert.equal(context.state.fills.length,degrees===0?0:22);assert.equal(context.state.strokes,0);
      assert.ok(context.state.drawImages.every(call=>call.image===readyImage&&JSON.stringify(call.args)==='[0,0,355,541]'));
      assert.ok(context.state.fills.every(fill=>['#28221f','#1b1715'].includes(fill.color)));
      const pathKey=p=>p.map(point=>point.map(n=>Math.round(n*1e7)).join(',')).join(';');
      const triangleLayers=new Map(rig.mesh.triangles.map((t,i)=>[pathKey(t.map(index=>[snapshot.screenVertices[index].x,snapshot.screenVertices[index].y])),rig.mesh.drawOrder[i]]));
      // All image triangles are traversed in authored depth-layer order. Side fills
      // are counted separately and do not masquerade as approved source pixels.
      const imageLayers=context.state.drawImages.map(call=>triangleLayers.get(pathKey(call.path)));assert.ok(imageLayers.every(Number.isFinite));
      for(let i=1;i<imageLayers.length;i++)assert.ok(imageLayers[i]>=imageLayers[i-1]);
      views.push({yawDegrees:degrees,pitchDegrees:degrees===0?0:6,textureDraws:snapshot.textureDraws,authoringDraws:snapshot.authoringDraws,totalCanvasOperations:draws});
    }
    const bad=new RigSceneRuntime(scene.rigScene,{worldToScreen:()=>({x:480,y:495}),getImage:()=>({naturalWidth:354,naturalHeight:541})});
    try {bad.evaluate();const context=drawingContext();bad.drawNode(context,NODE);assert.equal(context.state.drawImages.length,0);}finally{bad.dispose();}
    metrics.canvas={views,sourceImageDecodedInOwnerTest:'mock dimensions only; approved PNG decoded separately for builder reproduction',visualPassClaim:false};
  } finally { consumer.dispose(); }
});

check('own capture and JSON reload preserve authored pose transition and data while clock and FX reset cleanly', async () => {
  const surface=ownerSurface(),errors=[],owner=new FDGRuntime(surface.canvas,clone(scene),{onError:error=>errors.push(error.message)});
  try {
    await owner.load();owner.pause();assert.deepEqual(errors,[]);owner.setInputEnabled(false);
    assert.equal(owner.getRigSequenceSnapshot().status,'unavailable');assert.equal(owner.replayRigSequence(),false);assert.equal(owner.stopRigSequence(),false);
    for(let i=0;i<30;i++)assert.equal(owner.step(FIXED_STEP),1);
    const idlePose=owner.getRigNodeSnapshot(NODE);assert.equal(owner.setRigClip(NODE,ATTACK),true);
    assert.equal(maxVertexDrift(idlePose.vertices,owner.getRigNodeSnapshot(NODE).vertices),0);
    for(let i=0;i<6;i++)owner.step(FIXED_STEP);
    owner.setRigView(22*Math.PI/180,6*Math.PI/180);const before=owner.getRigNodeSnapshot(NODE);
    const saved=owner.captureSceneState().project,roundtrip=JSON.parse(JSON.stringify(saved)),imageCount=surface.images.length;
    assert.deepEqual(roundtrip.rigScene.resources[0].project,rig);assert.deepEqual(roundtrip.rigScene.nodes[0].transition,before.transition);assert.equal(before.transition.elapsed,owner.getRigNodeSnapshot(NODE).transition.elapsed);
    assert.deepEqual(roundtrip.map,scene.map);assert.deepEqual(roundtrip.skills,scene.skills);assert.deepEqual(roundtrip.vfx,scene.vfx);
    assert.equal(Object.hasOwn(roundtrip.rigScene,'sequence'),false);assert.deepEqual(owner.getVfxPlaybackSnapshot(),[]);assert.equal(owner.particles.count,0);
    await owner.setProject(roundtrip);const after=owner.getRigNodeSnapshot(NODE);
    assert.deepEqual(after.vertices,before.vertices);assert.deepEqual(after.bonePositions,before.bonePositions);assert.deepEqual(after.transition,before.transition);assert.deepEqual(after.returnTo,before.returnTo);
    assert.deepEqual(owner.captureRigScene(),roundtrip.rigScene);assert.equal(owner.stats.time,0);assert.equal(surface.images.length,imageCount);assert.deepEqual(errors,[]);
    const sequence=owner.getRigSequenceSnapshot();assert.equal(sequence.status,'unavailable');assert.equal(sequence.activationId,0);assert.equal(sequence.eventCount,0);assert.equal(sequence.emittedCount,0);assert.deepEqual(sequence.activeFx,[]);assert.deepEqual(owner.getVfxPlaybackSnapshot(),[]);
    for(let i=0;i<180;i++)owner.step(FIXED_STEP);const final=owner.getRigNodeSnapshot(NODE);assert.equal(final.clipId,IDLE);assert.equal(final.transition,null);assert.deepEqual(owner.getVfxPlaybackSnapshot(),[]);assert.equal(owner.particles.count,0);
    owner.start();assert.equal(surface.raf.size,1);owner.pause();assert.equal(surface.raf.size,0);
    metrics.capture={savedAttackTimeSeconds:before.time,savedTransition:before.transition,restoredVertexDriftModel:maxVertexDrift(before.vertices,after.vertices),restoredBoneDriftModel:Math.max(...before.bonePositions.map((b,i)=>distance(b.position,after.bonePositions[i].position))),reloadOwnerClockSeconds:0,reloadSequenceStatus:sequence.status,reloadFx:sequence.activeFx.length,sourceImageInstancesBefore:imageCount,sourceImageInstancesAfter:surface.images.length,followingTicks:180,finalClip:final.clipId};
  }finally{
    owner.dispose();assert.equal(owner.state,'disposed');assert.equal(owner.assets.size,0);assert.equal(owner.particles.count,0);assert.equal(surface.raf.size,0);assert.equal(surface.observers.size,0);assert.equal(surface.canvas.countListeners()+surface.window.countListeners()+surface.document.countListeners(),0);assert.deepEqual(owner.getVfxPlaybackSnapshot(),[]);
  }
});

after(async () => {
  const folder=process.env.FDG_DRUID_BODY_TEST_EVIDENCE;if(!folder)return;
  await fs.mkdir(folder,{recursive:true});
  metrics.shipping={scene:{path:SCENE_PATH.pathname,bytes:sceneBytes.length,sha256:hash(sceneBytes)},rig:{path:RIG_PATH.pathname,bytes:rigBytes.length,sha256:hash(rigBytes)},source:{path:DRUID_SOURCE,bytes:sourceBytes.length,sha256:hash(sourceBytes),width:355,height:541}};
  await fs.writeFile(`${folder}/targeted-dark-druid-body-metrics.json`,JSON.stringify(metrics,null,2));
  await fs.writeFile(`${folder}/new-tests.json`,JSON.stringify({testFile:'test/fdgDarkDruidBody.test.mjs',firstRun:!process.env.FDG_DRUID_BODY_TEST_ATTEMPT,attempt:process.env.FDG_DRUID_BODY_TEST_ATTEMPT||'first',total:results.length,pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL').length,oldSuitesExecuted:0,results,metrics:'targeted-dark-druid-body-metrics.json'},null,2));
});

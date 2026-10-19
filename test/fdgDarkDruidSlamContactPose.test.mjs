import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { evaluateRig } from '../engine/fdg/rig.js';
import { validateRigProject } from '../engine/fdg/rig-project.js';
import { validateProject } from '../engine/fdg/project.js';

// This suite consumes only the new r5 output. Protected geometry digests were
// recorded when the producer cloned the approved mesh; no old suite/PNG read.
const rig = JSON.parse(await fs.readFile(new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json', import.meta.url), 'utf8'));
const scene = JSON.parse(await fs.readFile(new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.fdg.json', import.meta.url), 'utf8'));
const attack = rig.clips.find(clip => clip.id === 'dark-druid-native-slam-contact-r5');
const idle = rig.clips.find(clip => clip.id === 'dark-druid-slam-contact-idle-r5');
const times = [0,.15,.45,.75,1,1.06,1.09,1.12,1.16,1.26,1.42,1.65,1.95,2.3,2.6];
const samples = [...new Set([...times, ...times.slice(1).map((time, i) => (time+times[i])/2), 1.14])].sort((a,b) => a-b);
const poses = new Map(samples.map(time => [time,evaluateRig(rig,{clipId:attack.id,time})]));
const near = (actual, expected, tolerance=1e-9) => assert.ok(Math.abs(actual-expected)<=tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
const source = point => [point[0]*150+221,526-point[1]*150,point[2]];
const model = ([x,y]) => [(x-221)/150,(526-y)/150,0];
const transform = (matrix, point) => [0,1,2].map(row => matrix[row]*point[0]+matrix[row+4]*point[1]+matrix[row+8]*point[2]+matrix[row+12]);
const bone = (pose,id) => pose.boneMatrices.find(value => value.id===id);
const point = (pose,id,xy) => source(transform(bone(pose,id).skin,model(xy)));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const coreTriangles = rig.mesh.triangles.flatMap((triangle,i) => {
  const center = [0,1].map(axis => triangle.reduce((sum,v) => sum+rig.mesh.uvs[v][axis]*(axis===0?355:541),0)/3);
  return Math.hypot(center[0]-57,center[1]-110)<30 ? [{triangle,index:i,center}] : [];
});
const coreCentroid = pose => [0,1].map(axis => coreTriangles.reduce((sum,entry) => sum+entry.triangle.reduce((subtotal,index) => subtotal+source(pose.vertices[index])[axis],0)/3,0)/coreTriangles.length);

test('r5 retains approved geometry, 19-bone hierarchy, idle, markers and authored-only timeline', () => {
  assert.equal(validateRigProject(rig).ok,true);
  assert.equal(validateProject(scene,{geometry:false}).ok,true);
  assert.equal(rig.skeleton.bones.length,19);
  assert.equal(rig.mesh.vertices.length,3729);
  assert.equal(rig.mesh.triangles.length,4680);
  assert.equal(hash(rig.mesh),'e0decdaf7c1dc4351408e066d792f8d2e5b4889f4f23816a6a9338d1f9869878');
  assert.equal(hash(rig.skeleton),'2afb6bfc9ab93d810447a97021510e3f4c7257daf0675df5694f9ef58714919a');
  assert.equal(hash(rig.materials),'0ee078f5dc6aad4bcd3c17ccf6f418ebfd351d1fddf33beb193005237fef9886');
  assert.equal(hash({...idle,id:'dark-druid-slam-idle-r3'}),'eeb115b8b9b1de1f5170a8d7c3987c49a9efe7a23ac01382c4d194ad4a638338');
  assert.equal(attack.fps,24); assert.equal(attack.duration,2.6); assert.equal(attack.loop,false);
  assert.equal(attack.tracks.length,14);
  for(const track of attack.tracks) assert.deepEqual(track.keys.map(key=>key.time),times);
  assert.deepEqual(rig.provenance.bossSlam.phaseMarkers,{windStart:0,windEnd:1,strikeEnd:1.16,recoverEnd:2.6});
  assert.equal(rig.provenance.sourceGap,'SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보');
  assert.equal(rig.provenance.sourceGapCount,1);
  assert.equal(rig.provenance.slamContactAuthoring.geometryChanged,false);
  assert.equal(rig.provenance.slamContactAuthoring.weightsChanged,false);
  assert.equal(rig.provenance.bossSlam.headStaffCommonSkinCompensation,false);
  assert.equal(rig.provenance.nativeCombatApplied,false);
  assert.equal(rig.provenance.newFx,false);
  assert.equal(attack.tracks.some(track=>['staff','root','leftBoot','rightBoot'].includes(track.boneId)),false);
  assert.deepEqual(scene.rigScene.nodes[0].position,[4150,7360,0]);
  assert.deepEqual(scene.rigScene.camera,{x:4150,y:7216,follow:false,yaw:0,pitch:0});
  assert.deepEqual(scene.rigScene.nodes[0].returnTo,{clipId:idle.id,transitionSeconds:.35});
});

test('actual green-core mesh follows the hand/staff chain down to the visible boot plane', () => {
  // These thirty source-UV faces enclose the visually identified green core.
  // The test makes no claim about source alpha or all crown fringe pixels.
  assert.equal(coreTriangles.length,30);
  for(const entry of coreTriangles) {
    assert.equal(rig.provenance.triangleRegions[entry.index],'staff');
    for(const index of entry.triangle) assert.deepEqual(rig.mesh.weights[index],[{boneId:'staff',weight:1}]);
  }
  const prep=poses.get(1),contact=poses.get(1.16),prepCore=coreCentroid(prep),contactCore=coreCentroid(contact);
  const grip=point(contact,'staff',[77,242]),tip=point(contact,'staff',[75,82]);
  assert.ok(contactCore[0]>grip[0]+10,'green core must pass ahead of the grip');
  assert.ok(contactCore[1]>grip[1]+110,'green core must pass below the grip');
  assert.ok(contactCore[1]>=526-65 && contactCore[1]<=526+25,'green core must be near unchanged visible boot source-Y plane');
  assert.ok(contactCore[0]-prepCore[0]>250,'actual crown faces need a forward trajectory');
  assert.ok(contactCore[1]-prepCore[1]>400,'actual crown faces need a downward trajectory');
  near(tip[0],313.95613512617626,1e-8); near(tip[1],525.6524586433509,1e-8);
  assert.ok(tip[0]-grip[0]>20); assert.ok(tip[1]-grip[1]>150);
  // The last native slam frame samples 1.14 before recover samples 1.16.
  const before=coreCentroid(poses.get(1.14)),beforeGrip=point(poses.get(1.14),'staff',[77,242]);
  assert.ok(before[1]>beforeGrip[1]+70,'lowering must be visible before the recover contact marker');
});

test('arm lengths and planted boots stay exact while the independent head never follows staff skin', () => {
  const upper=rig.skeleton.bones.find(value=>value.id==='leftForearm').translation;
  const fore=rig.skeleton.bones.find(value=>value.id==='leftHand').translation;
  const length=(a,b)=>Math.hypot(...a.map((value,index)=>value-b[index]))*150;
  const upperLength=Math.hypot(...upper)*150,foreLength=Math.hypot(...fore)*150;
  near(upperLength,58.41232746604095,1e-8); near(foreLength,45.89117562233506,1e-8);
  const bootIndices=rig.provenance.regions.flatMap((value,index)=>['leftBoot','rightBoot'].includes(value)?[index]:[]);
  assert.ok(bootIndices.length>0);
  for(const [time,pose] of poses) {
    const position=id=>pose.bonePositions.find(value=>value.id===id).position;
    near(length(position('leftUpperArm'),position('leftForearm')),upperLength,1e-8);
    near(length(position('leftForearm'),position('leftHand')),foreLength,1e-8);
    for(let i=0;i<16;i++) near(bone(pose,'staff').skin[i],bone(pose,'leftHand').skin[i],1e-10);
    for(const index of bootIndices) for(let axis=0;axis<3;axis++) near(pose.vertices[index][axis],rig.mesh.vertices[index][axis],1e-10);
    assert.deepEqual(position('root'),[0,0,0]);
    if(time===1||time===1.16) assert.ok(Math.max(...bone(pose,'staff').skin.map((value,index)=>Math.abs(value-bone(pose,'head').skin[index])))>.1);
  }
  for(const id of ['leftUpperArm','leftForearm','leftHand']) {
    const track=attack.tracks.find(value=>value.boneId===id);
    for(const key of track.keys) assert.deepEqual(key.translation,[0,0,0]);
  }
  const staffBone=rig.skeleton.bones.find(value=>value.id==='staff');
  assert.equal(staffBone.parent,'leftHand'); assert.deepEqual(staffBone.translation,[0,0,0]); assert.deepEqual(staffBone.rotation,[0,0,0]);
});

test('rigid sleeve/crown remain unstretched through strike intervals, coat recoils later and recovery reaches bind', () => {
  const rigid=new Set(['staff','leftHand','leftUpperSleeve','leftForeSleeve']);
  let maximumBodyRatio=0;
  for(const pose of poses.values()) {
    rig.mesh.triangles.forEach((triangle,index) => {
      const region=rig.provenance.triangleRegions[index];
      if(!rigid.has(region)&&region!=='body')return;
      for(let edge=0;edge<3;edge++) {
        const a=triangle[edge],b=triangle[(edge+1)%3];
        const rest=Math.hypot(...rig.mesh.vertices[a].map((value,axis)=>value-rig.mesh.vertices[b][axis]));
        if(rest*150<1)return;
        const ratio=Math.hypot(...pose.vertices[a].map((value,axis)=>value-pose.vertices[b][axis]))/rest;
        if(rigid.has(region)) near(ratio,1,1e-8); else maximumBodyRatio=Math.max(maximumBodyRatio,ratio);
      }
    });
  }
  assert.ok(maximumBodyRatio<2.1,`body edge ratio ${maximumBodyRatio} exceeds bounded candidate authoring`);
  for(const id of ['coatLeft','coatRight','coatFront','coatBack']) {
    const keys=attack.tracks.find(value=>value.boneId===id).keys;
    const maximum=keys.reduce((best,key)=>Math.abs(key.rotation[2])>Math.abs(best.rotation[2])?key:best);
    assert.equal(maximum.time,1.42);
    assert.ok(maximum.time>rig.provenance.bossSlam.phaseMarkers.strikeEnd);
  }
  const first=poses.get(0),last=poses.get(2.6);
  for(let index=0;index<rig.mesh.vertices.length;index++)for(let axis=0;axis<3;axis++)near(last.vertices[index][axis],first.vertices[index][axis],1e-10);
  for(const track of attack.tracks)for(let i=1;i<track.keys.length;i++) {
    assert.ok(Math.abs(track.keys[i].rotation[2]-track.keys[i-1].rotation[2])<Math.PI,`${track.boneId} quaternion interval must not take the opposite arc`);
  }
});

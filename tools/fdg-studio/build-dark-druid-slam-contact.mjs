import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { evaluateRig } from '../../engine/fdg/rig.js';
import { validateRigProject } from '../../engine/fdg/rig-project.js';
import { validateProject } from '../../engine/fdg/project.js';

// New r5 track authoring consumes the approved r3 geometry JSON. It never
// reads, edits, re-extracts or regenerates the PNG or the frozen r3 files.
export const SLAM_CONTACT_IDS = Object.freeze({
  rig: 'dark-druid-slam-contact-r5',
  project: 'dark-druid-slam-contact-scene-r5',
  node: 'dark-druid-slam-contact-body-r5',
  resource: 'dark-druid-slam-contact-resource-r5',
  attack: 'dark-druid-native-slam-contact-r5',
  idle: 'dark-druid-slam-contact-idle-r5',
});
export const SLAM_CONTACT_PHASES = Object.freeze({ windStart: 0, windEnd: 1, strikeEnd: 1.16, recoverEnd: 2.6 });
const BODY_TIMES = Object.freeze([0, .15, .45, .75, 1, 1.06, 1.12, 1.16, 1.26, 1.42, 1.65, 1.95, 2.3, 2.6]);
export const SLAM_CONTACT_TIMES = Object.freeze([0, .15, .45, .75, 1, 1.06, 1.09, 1.12, 1.16, 1.26, 1.42, 1.65, 1.95, 2.3, 2.6]);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE_RIG = path.join(ROOT, 'tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.rig.json');
const BASE_SCENE = path.join(ROOT, 'tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.fdg.json');
const UNITS = 150, ORIGIN = [221, 526];
const SOURCE_GAP = 'SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보';
const clipOf = rig => rig.clips.find(clip => clip.id === SLAM_CONTACT_IDS.attack);
const toModel = ([x, y]) => [(x - ORIGIN[0]) / UNITS, (ORIGIN[1] - y) / UNITS, 0];
const toSource = point => [point[0] * UNITS + ORIGIN[0], ORIGIN[1] - point[1] * UNITS, point[2]];
const transformed = (matrix, point) => [0, 1, 2].map(row => matrix[row] * point[0] + matrix[row + 4] * point[1] + matrix[row + 8] * point[2] + matrix[row + 12]);
const sha = value => createHash('sha256').update(value).digest('hex');
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function contactClip() {
  // Preparation raises the chest and gathers the arm. In the eight-native-frame
  // strike window, the spine/chest drop first, then the elbow unfolds and the
  // hand carries its rigid staff past the grip toward the visible boot plane.
  // Coat extrema occur at 1.42, after the 1.16 contact marker.
  const rotations = {
    pelvis: [0, -.006, -.014, -.028, -.038, -.026, -.005, .010, .018, .014, -.008, -.005, -.002, 0],
    spine: [0, .022, .060, .090, .112, -.018, -.245, -.320, -.348, -.230, -.038, .034, .011, 0],
    chest: [0, .015, .045, .070, .085, .010, -.128, -.180, -.185, -.088, .022, .014, .004, 0],
    neck: [0, -.008, -.018, -.028, -.035, .015, .065, .080, .070, .030, -.012, -.010, -.003, 0],
    head: [0, -.010, -.032, -.048, -.066, .020, .052, .065, .050, .018, -.028, -.018, -.006, 0],
    leftUpperArm: Array(14).fill(0),
    leftForearm: Array(14).fill(0),
    leftHand: Array(14).fill(0),
    rightUpperArm: [0, -.025, -.075, -.145, -.205, -.065, .170, .235, .250, .130, -.075, -.023, -.007, 0],
    rightForearm: [0, .030, .090, .135, .165, .020, -.190, -.245, -.210, -.075, .065, .022, .007, 0],
    coatLeft: [0, .004, .011, .019, .025, .032, .022, .006, -.053, -.090, -.043, .028, .008, 0],
    coatRight: [0, -.003, -.009, -.016, -.023, -.031, -.019, -.004, .058, .085, .033, -.020, -.006, 0],
    coatFront: [0, .002, .007, .012, .017, .025, .024, .013, -.035, -.060, -.018, .016, .004, 0],
    coatBack: [0, .003, .008, .015, .021, .030, .028, .020, -.027, -.075, -.034, .024, .006, 0],
  };
  const pelvis = [[0,0,0],[-.008,-.008,0],[-.020,-.022,0],[-.035,-.040,0],[-.045,-.060,0],[.002,-.055,0],[.068,-.032,0],[.080,-.038,0],[.090,-.058,0],[.060,-.055,0],[.020,-.025,0],[-.010,.006,0],[-.003,.002,0],[0,0,0]];
  const spine = [[0,0,0],[-.010,.030,0],[-.035,.085,0],[-.070,.155,0],[-.105,.225,0],[.110,-.075,0],[.235,-.665,0],[.250,-.950,0],[.270,-.980,0],[.155,-.480,0],[.025,-.080,0],[-.020,.020,0],[-.006,.005,0],[0,0,0]];
  return {
    id: SLAM_CONTACT_IDS.attack,
    name: '접촉 내려찍기 · 전신 모으기 → 빠른 팔 연쇄 → 외투 후행 → 복귀',
    duration: 2.6, fps: 24, loop: false,
    tracks: Object.entries(rotations).map(([boneId, values]) => {
      const keys = BODY_TIMES.map((time, i) => ({ time,
        translation: boneId === 'pelvis' ? pelvis[i] : boneId === 'spine' ? spine[i] : [0, 0, 0], rotation: [0, 0, values[i]],
      }));
      // The existing chest/pelvis trajectory is unchanged. This midpoint gives
      // the hand's IK bake two intervals below pi instead of an opposite slerp
      // arc from 1.06 to 1.12. It does not move any native phase marker.
      const before = keys.find(key => key.time === 1.06), after = keys.find(key => key.time === 1.12);
      keys.splice(6,0,{ time: 1.09,
        translation: before.translation.map((value,axis) => (value+after.translation[axis])/2),
        rotation: before.rotation.map((value,axis) => (value+after.rotation[axis])/2),
      });
      return { boneId, keys };
    }),
    provenance: { authority: 'ENGINE_AUTHORING', nativeTimeClaim: false, phaseMarkers: { ...SLAM_CONTACT_PHASES },
      tipProbeSourcePx: [75,82], handProbeSourcePx: [77,242], bodyProbeSourcePx: [224,224],
      headStaffCommonSkinCompensation: false, staffTracks: 0,
      contactGoal: 'Posed source staff crown is ahead of and below the posed hand, near the unchanged visible boot plane; no radial damage geometry claim.',
      coatDelaySeconds: .26 },
  };
}

/** Compile existing two-bone limb rotations offline; no runtime IK or stretch. */
export function bakeSlamContactArm(rig) {
  const clip = clipOf(rig), neutral = structuredClone(rig), neutralClip = clipOf(neutral);
  for (const track of neutralClip.tracks) if (['leftUpperArm','leftForearm','leftHand'].includes(track.boneId)) {
    for (const key of track.keys) { key.translation = [0,0,0]; key.rotation = [0,0,0]; }
  }
  const upperVector = rig.skeleton.bones.find(bone => bone.id === 'leftForearm').translation;
  const foreVector = rig.skeleton.bones.find(bone => bone.id === 'leftHand').translation;
  const upperLength = Math.hypot(upperVector[0], upperVector[1]), foreLength = Math.hypot(foreVector[0], foreVector[1]);
  const upperBindAngle = Math.atan2(upperVector[1], upperVector[0]), foreBindAngle = Math.atan2(foreVector[1], foreVector[0]);
  const handOffsets = [[-81,55],[-82,43],[-82,29],[-77,10],[-71,-9],[-20,48],[15,59],[50,70],[65,62],[68,59],[28,68],[-51,53],[-76,53],[-81,55],[-81,55]];
  const staffWorldR = [0,.07,.18,.31,.40,-.24,-1.045,-1.85,-3.00,-2.86,-1.25,.08,.085,.020,0];
  let previousUpper = 0, previousFore = 0;
  const unwrap = (value, previous) => { while (value - previous > Math.PI) value -= 2 * Math.PI; while (value - previous < -Math.PI) value += 2 * Math.PI; return value; };
  const keys = SLAM_CONTACT_TIMES.map((time, i) => {
    const pose = evaluateRig(neutral, { clipId: clip.id, time });
    const chestWorld = pose.boneMatrices.find(bone => bone.id === 'chest').world;
    const parentR = Math.atan2(chestWorld[1], chestWorld[0]);
    const target = [handOffsets[i][0] / UNITS, -handOffsets[i][1] / UNITS], distance = Math.hypot(...target);
    if (distance > upperLength + foreLength || distance < Math.abs(upperLength - foreLength)) throw new Error(`Unreachable unchanged-limb target at ${time}.`);
    const elbow = -Math.acos(clamp((distance * distance - upperLength * upperLength - foreLength * foreLength) / (2 * upperLength * foreLength), -1, 1));
    const linkR = Math.atan2(target[1], target[0]) - Math.atan2(foreLength * Math.sin(elbow), upperLength + foreLength * Math.cos(elbow));
    const upper = unwrap(linkR - upperBindAngle - parentR, previousUpper);
    const fore = unwrap(elbow + upperBindAngle - foreBindAngle, previousFore);
    const hand = staffWorldR[i] - (parentR + upper + fore);
    previousUpper = upper; previousFore = fore;
    for (const [boneId, rotation] of [['leftUpperArm',upper],['leftForearm',fore],['leftHand',hand]]) {
      const key = clip.tracks.find(track => track.boneId === boneId).keys[i];
      key.translation = [0,0,0]; key.rotation = [0,0,rotation];
    }
    const shoulder = toSource(pose.bonePositions.find(bone => bone.id === 'leftUpperArm').position);
    return { time, shoulderSourcePx: shoulder.slice(0,2), handTargetOffsetSourcePx: [...handOffsets[i]],
      handTargetSourcePx: shoulder.slice(0,2).map((value, axis) => value + handOffsets[i][axis]), staffWorldR: staffWorldR[i],
      localRotation: { upper, fore, hand } };
  });
  clip.provenance.armAuthoring = { kind: 'offline-two-bone-planar-bake', authority: 'ENGINE_AUTHORING',
    upperLengthSourcePx: upperLength * UNITS, foreLengthSourcePx: foreLength * UNITS,
    shoulderLocalTranslation: [0,0,0], elbowBranch: 'negative; source bind side', staffChildOf: 'leftHand',
    staffTracks: 0, runtimeIkAdded: false, actorWorldPositionChanged: false, keys };
  return keys;
}

export function buildSlamContactRig(baseRig) {
  const rig = structuredClone(baseRig);
  const idle = structuredClone(baseRig.clips.find(clip => clip.loop));
  if (!idle) throw new Error('Approved base idle clip is required.');
  idle.id = SLAM_CONTACT_IDS.idle;
  rig.id = SLAM_CONTACT_IDS.rig; rig.name = '다크드루이드 NORMAL · 접촉 내려찍기 r5';
  rig.clips = [idle, contactClip()];
  rig.preview = { ...rig.preview, clipId: idle.id, time: 0, playing: false, pose: {} };
  rig.provenance = { ...rig.provenance, revision: 'slam-contact-r5', phaseMarkers: { ...SLAM_CONTACT_PHASES },
    sourceGap: SOURCE_GAP, sourceGapCount: 1, sourceImageModified: false, newFx: false,
    nativeCombatApplied: false, gameplayApplied: false,
    bossSlam: { ...rig.provenance.bossSlam, clipId: SLAM_CONTACT_IDS.attack, phaseMarkers: { ...SLAM_CONTACT_PHASES },
      authority: 'ENGINE_AUTHORING', headStaffCommonSkinCompensation: false, nativeTimeClaim: false },
    slamContactAuthoring: { authority: 'ENGINE_AUTHORING', baseRigId: baseRig.id,
      geometryChanged: false, weightsChanged: false, sourceTextureWritten: false, sourceTextureReadForBuild: false,
      nativePhaseMarkersChanged: false, nativeFacingPolicy: 'X mirror only; no weapon-angle pose rotation',
      pose: 'Pelvis/spine gather → chest/shoulder drop → unchanged-length upper/forearm unfold → child hand/staff downward contact → delayed coat recoil → idle',
      damageCollisionClaim: false, sourceRecovered: false },
    liveNativeGate: { status: 'NOT_OBSERVED_R5', reason: 'New authoring candidate; actual native loader and public QA are separately owned.' },
  };
  bakeSlamContactArm(rig);
  const valid = validateRigProject(rig);
  if (!valid.ok) throw new Error(valid.errors.join('\n'));
  return rig;
}

export function buildSlamContactScene(baseScene, rig) {
  const scene = structuredClone(baseScene), prior = scene.rigScene;
  if (prior.resources.length !== 1 || prior.nodes.length !== 1) throw new Error('Single approved authoring node required.');
  scene.id = SLAM_CONTACT_IDS.project; scene.name = rig.name;
  prior.resources[0] = { ...prior.resources[0], id: SLAM_CONTACT_IDS.resource, name: rig.name, project: structuredClone(rig) };
  prior.nodes[0] = { ...prior.nodes[0], id: SLAM_CONTACT_IDS.node, name: '다크드루이드 NORMAL · 접촉 slam r5',
    resourceId: SLAM_CONTACT_IDS.resource, clipId: SLAM_CONTACT_IDS.idle, time: 0, transition: null,
    returnTo: { ...prior.nodes[0].returnTo, clipId: SLAM_CONTACT_IDS.idle } };
  scene.provenance.bodyAuthoring = { ...scene.provenance.bodyAuthoring, revision: 'slam-contact-r5', fx: 0,
    phaseMarkers: { ...SLAM_CONTACT_PHASES }, nativeCombatApplied: false, liveNativeGate: structuredClone(rig.provenance.liveNativeGate) };
  const valid = validateProject(scene, { geometry: false });
  if (!valid.ok) throw new Error(valid.errors.join('\n'));
  return scene;
}

export function measureSlamContact(rig, baseRig) {
  const clip = clipOf(rig), phases = [];
  for (const time of [...new Set([...SLAM_CONTACT_TIMES, .733, 1.14])].sort((a,b) => a-b)) {
    const pose = evaluateRig(rig, { clipId: clip.id, time }), skin = id => pose.boneMatrices.find(bone => bone.id === id).skin;
    const point = (id, sourcePx) => toSource(transformed(skin(id), toModel(sourcePx)));
    const bootIndices = rig.provenance.regions.flatMap((part, i) => ['leftBoot','rightBoot'].includes(part) ? [i] : []);
    const bootDriftSourcePx = Math.max(0, ...bootIndices.map(i => Math.hypot(...pose.vertices[i].map((value, axis) => value - rig.mesh.vertices[i][axis])))) * UNITS;
    const stretchByPart = {};
    rig.mesh.triangles.forEach((triangle, triangleIndex) => {
      const region = rig.provenance.triangleRegions[triangleIndex];
      if (region === 'authored-arm-side') return;
      for (let edge = 0; edge < 3; edge++) {
        const a = triangle[edge], b = triangle[(edge+1)%3];
        const rest = Math.hypot(...rig.mesh.vertices[a].map((value, axis) => value-rig.mesh.vertices[b][axis]));
        if (rest * UNITS < 1) continue;
        const ratio = Math.hypot(...pose.vertices[a].map((value, axis) => value-pose.vertices[b][axis])) / rest;
        stretchByPart[region] = Math.max(stretchByPart[region] || 0, ratio);
      }
    });
    // Closest actually skinned crown vertex complements the bone-space probe;
    // this records a mesh vertex, not an assumed PNG opaque pixel.
    const crownVertices = rig.mesh.uvs.flatMap((uv, i) => {
      const sourcePx = [uv[0]*355,uv[1]*541];
      return rig.provenance.regions[i] === 'staff' && Math.hypot(sourcePx[0]-75,sourcePx[1]-82)<12 ? [{ index: i, sourcePx, posedSourcePx: toSource(pose.vertices[i]) }] : [];
    });
    phases.push({ time, tipSourcePx: point('staff',[75,82]), handSourcePx: point('staff',[77,242]),
      headSourcePx: point('head',[223,112]), bodySourcePx: point('spine',[224,224]), pelvisSourcePx: point('pelvis',[222,291]),
      shoulderSourcePx: toSource(pose.bonePositions.find(bone => bone.id === 'leftUpperArm').position),
      bootDriftSourcePx, handStaffSkinDrift: Math.max(...skin('staff').map((value,i) => Math.abs(value-skin('leftHand')[i]))),
      headStaffSkinDifference: Math.max(...skin('staff').map((value,i) => Math.abs(value-skin('head')[i]))),
      stretchByPart, crownVertices });
  }
  const prep = phases.find(p => p.time===1), contact = phases.find(p => p.time===1.16);
  const exact = key => JSON.stringify(rig[key]) === JSON.stringify(baseRig[key]);
  return { authority: 'ENGINE_AUTHORING numeric receipt; public visual review remains separate', ids: SLAM_CONTACT_IDS,
    phaseMarkers: SLAM_CONTACT_PHASES, phases,
    preparationToContact: Object.fromEntries(['tipSourcePx','handSourcePx','bodySourcePx','headSourcePx'].map(key => [key,contact[key].map((value,i)=>value-prep[key][i])])),
    contactTipMinusHandSourcePx: contact.tipSourcePx.map((value,i)=>value-contact.handSourcePx[i]),
    unchanged: { skeleton: exact('skeleton'), mesh: exact('mesh'), materials: exact('materials'), staffTracks: 0,
      headStaffCommonSkinCompensation: false, bootsAnimated: false, actorWorldPositionChanged: false,
      sourceGap: SOURCE_GAP, sourceGapCount: 1, sourcePngReads: 0, sourcePngWrites: 0, frozenR3Writes: 0 },
    counts: { bones: rig.skeleton.bones.length, vertices: rig.mesh.vertices.length, triangles: rig.mesh.triangles.length,
      clips: rig.clips.length, attackTracks: clip.tracks.length, keysPerAttackTrack: clip.tracks[0].keys.length, fps: clip.fps, duration: clip.duration },
    visualVerdict: 'NOT_OBSERVED', nativeCombatVerdict: 'NOT_OBSERVED_R5', sourceHiddenSurfaceVerdict: 'SOURCE_GAP_1',
  };
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const [baseRigBytes, baseSceneBytes] = await Promise.all([fs.readFile(BASE_RIG),fs.readFile(BASE_SCENE)]);
  const baseRig = JSON.parse(baseRigBytes), baseScene = JSON.parse(baseSceneBytes);
  const rig = buildSlamContactRig(baseRig), scene = buildSlamContactScene(baseScene, rig), receipt = measureSlamContact(rig,baseRig);
  const out = process.env.FDG_DRUID_SLAM_CONTACT_OUTPUT || path.join(ROOT,'out/dark-druid-slam-contact-r5');
  await fs.mkdir(out,{recursive:true});
  const rigBytes = JSON.stringify(rig)+'\n', sceneBytes = JSON.stringify(scene)+'\n';
  receipt.output = { rig: { bytes: Buffer.byteLength(rigBytes),sha256: sha(rigBytes) }, scene: { bytes: Buffer.byteLength(sceneBytes),sha256: sha(sceneBytes) } };
  for (const [name,bytes] of [['dark-druid-slam-contact-r5.rig.json',rigBytes],['dark-druid-slam-contact-r5.fdg.json',sceneBytes]]) {
    await fs.writeFile(path.join(out,name),bytes);
    await fs.writeFile(path.join(ROOT,'tools/fdg-studio/fixtures',name),bytes);
  }
  await fs.writeFile(path.join(out,'r5-build-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({ output: out, ids: SLAM_CONTACT_IDS, counts: receipt.counts, unchanged: receipt.unchanged,
    files: receipt.output, preparationToContact: receipt.preparationToContact,
    contact: receipt.phases.find(p=>p.time===1.16) },null,2));
}

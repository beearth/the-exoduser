import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProject } from '../../engine/fdg/project.js';

// These limited shell sections and tones are authored inference, not recovered anatomy/light.
export const SIDE_FINISH_RINGS = {
  chest: [[432,.68],[464,.88],[512,1],[560,1],[592,.90],[624,.72]],
  pelvis: [[640,.72],[656,.92],[688,1],[704,.90],[720,.68]],
};
export const SIDE_FINISH_TONES = {
  chest: { front: [40,34,37], rear: [29,26,29] },
  pelvis: { front: [34,30,33], rear: [25,23,26] },
};
const factorAt = (part,y) => {
  const rings=SIDE_FINISH_RINGS[part];
  if(y<=rings[0][0])return rings[0][1];
  if(y>=rings.at(-1)[0])return rings.at(-1)[1];
  const end=rings.findIndex(r=>r[0]>=y),a=rings[end-1],b=rings[end];
  return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]);
};
const hex = rgb => '#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('');

export function buildTorsoSideFinishScene(baseline) {
  const scene=structuredClone(baseline),rig=scene.rigScene.resources[0].project,mesh=rig.mesh;
  const depth=rig.provenance.depthAuthoring;
  if(depth?.revision!=='r7'||depth.sideSegments.length!==22)throw new Error('Expected frozen r7 torso shell.');
  const rearParts=new Map();
  for(const s of depth.sideSegments)for(const i of s.rear) {
    if(rearParts.has(i)&&rearParts.get(i)!==s.part)throw new Error('Rear vertex part conflict.');
    rearParts.set(i,s.part);
  }
  const rearVertices=[];
  for(const [index,part]of rearParts) {
    const sourceY=1140-mesh.vertices[index][1]*300,originalZ=mesh.vertices[index][2];
    const factor=factorAt(part,sourceY);mesh.vertices[index][2]=originalZ*factor;
    rearVertices.push({index,part,sourceY,originalZ,factor,z:mesh.vertices[index][2]});
  }
  const faceTones=[];
  for(const s of depth.sideSegments) {
    const y=s.front.reduce((sum,i)=>sum+1140-mesh.vertices[i][1]*300,0)/2;
    // Fade the existing short end sections gently; keep every side face and real depth.
    const factor=factorAt(s.part,y),toneFactor=.9+.1*factor;
    s.faces.forEach((index,i)=>{
      const role=i===0?'front':'rear';
      const rgb=SIDE_FINISH_TONES[s.part][role].map(n=>Math.round(n*toneFactor));
      const color=hex(rgb);mesh.faceColors[index]=color;
      faceTones.push({index,part:s.part,role,sourceY:y,toneFactor,color});
    });
  }
  rig.id='hell-aberrant-torso-side-finish-r8';rig.name='지옥기형 · 몸통 단면 연결과 피부 톤';
  rig.provenance.sideFinish={authority:'ENGINE_AUTHORING',revision:'r8',sourceRecovered:false,
    inputRevision:'r7',ringsSourceY:SIDE_FINISH_RINGS,paletteRGB:SIDE_FINISH_TONES,
    toneFactorFormula:'.9 + .1 * interpolatedDepthFactor',rearVertices,faceTones,
    frontSurfaceChanged:false,sideFacesRemoved:0,textureChanged:false,rendererChanged:false,nativeCombatApplied:false};
  scene.id='hell-aberrant-torso-side-finish-scene-r8';scene.name=rig.name;scene.rigScene.resources[0].name=rig.name;
  const valid=validateProject(scene,{geometry:false});if(!valid.ok)throw new Error(JSON.stringify(valid.errors));
  return scene;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
  const out=process.env.FDG_SIDE_FINISH_OUTPUT||path.join(repo,'tmp/hell-aberrant-torso-side-finish-r8');
  const baseline=JSON.parse(await fs.readFile(path.join(repo,'tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json'),'utf8'));
  const scene=buildTorsoSideFinishScene(baseline),rig=scene.rigScene.resources[0].project;
  await fs.mkdir(out,{recursive:true});
  for(const [name,value]of [['hell-aberrant-torso-side-finish.fdg.json',scene],['hell-aberrant-torso-side-finish.rig.json',rig]])await fs.writeFile(path.join(out,name),JSON.stringify(value));
  console.log(JSON.stringify({output:out,vertices:rig.mesh.vertices.length,triangles:rig.mesh.triangles.length,
    rearVertices:rig.provenance.sideFinish.rearVertices.length,coloredFaces:rig.provenance.sideFinish.faceTones.length,
    colors:[...new Set(rig.provenance.sideFinish.faceTones.map(f=>f.color))],sourceImagesRead:0}));
}

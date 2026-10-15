import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProject } from '../../engine/fdg/project.js';

// Model-space depth is authored inference, never recovered source anatomy.
export const TORSO_RINGS = [[432,470,145,.06],[464,470,150,.26],[528,480,150,.30],
  [592,480,110,.20],[632,480,75,.12],[664,480,70,.18],[704,477,60,.20],[736,470,50,0]];
export const TORSO_POLYGONS = [
  [[355,415],[400,386],[448,373],[508,363],[553,393],[585,438],[594,493],[584,551],[568,592],[542,631],[495,660],[454,655],[423,623],[388,598],[357,566],[334,523],[319,479],[322,451]],
  [[431,633],[530,650],[548,690],[519,721],[445,725],[405,699]],
];
export const TORSO_SIDE_COLORS = { chest: '#756871', pelvis: '#665b65' };
export const TORSO_BACK_DEPTH = { chest: -.18, pelvis: -.12 };
// Reviewed atomic anatomical interfaces. Do not extrude every fallback-region boundary.
export const TORSO_SIDE_EDGES = {
  chest: [[1509,1512],[1209,1210],[1210,1265],[1265,1270],[1270,1276],[1276,1280],
    [1280,1391],[1391,1395],[1395,1400],[1400,1404],[1404,1524],[1524,1528],[1528,1532]],
  pelvis: [[1644,1645],[1646,1654],[1654,1656],[1656,1657],[1655,1681],
    [1682,1694],[1693,1932],[1698,1700],[1699,1936]],
};
const SOURCE_EPSILON = .0001;
const key = p => p.map(n => Math.round(n * 10000)).join(',');
const inside = ([x,y], polygon) => {
  let result = false;
  for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [a,b]=polygon[i], [c,d]=polygon[j];
    if ((b>y)!==(d>y) && x<(c-a)*(y-b)/(d-b)+a) result=!result;
  }
  return result;
};
const depthAt = ([x,y]) => {
  if (y < 432 || y > 736 || !TORSO_POLYGONS.some(p=>inside([x,y],p))) return 0;
  const end=TORSO_RINGS.findIndex(r=>r[0]>=y), a=TORSO_RINGS[Math.max(0,end-1)], b=TORSO_RINGS[end];
  const t=a===b?0:(y-a[0])/(b[0]-a[0]), values=a.map((v,i)=>v+(b[i]-v)*t);
  return values[3]*Math.max(0,1-((x-values[1])/values[2])**2);
};

/** Geometric welding/subdivision is analysis only: original topology and weights stay intact. */
export function torsoTopology(rig) {
  const mesh=rig.mesh, regions=rig.provenance.regions;
  const points=mesh.uvs.map(([u,v])=>[u*832,v*1248]);
  const groups=new Map();
  points.forEach((p,i)=>{const k=key(p);if(!groups.has(k))groups.set(k,{point:p,indices:[]});groups.get(k).indices.push(i);});
  const torso=[...groups.values()].filter(g=>g.indices.some(i=>regions[i]==='torso'));
  const constraints=[], edgeMap=new Map();
  mesh.triangles.forEach((triangle,ti)=>{
    if(rig.provenance.triangleRegions[ti]!=='torso')return;
    for(let e=0;e<3;e++) {
      const ai=triangle[e],bi=triangle[(e+1)%3],a=points[ai],b=points[bi],dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
      const cuts=torso.flatMap(g=>{
        const p=g.point,t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length;
        return t>=-1e-8&&t<=1+1e-8&&Math.abs((p[0]-a[0])*dy-(p[1]-a[1])*dx)<=SOURCE_EPSILON*Math.sqrt(length)?[{g,t:Math.max(0,Math.min(1,t))}]:[];
      }).sort((p,q)=>p.t-q.t);
      for(const cut of cuts)if(cut.t>1e-8&&cut.t<1-1e-8)constraints.push({a:key(a),b:key(b),middle:key(cut.g.point),t:cut.t,length});
      for(let c=1;c<cuts.length;c++) {
        const p=cuts[c-1].g,q=cuts[c].g,k=[key(p.point),key(q.point)].sort().join('|');
        if(!edgeMap.has(k))edgeMap.set(k,{a:p,b:q,count:0});edgeMap.get(k).count++;
      }
    }
  });
  return {points,groups,torso,constraints:constraints.sort((a,b)=>b.length-a.length),boundary:[...edgeMap.values()].filter(e=>e.count===1)};
}

export function buildTorsoDepthScene(baseline) {
  const scene=structuredClone(baseline),rig=scene.rigScene.resources[0].project,mesh=rig.mesh;
  const {points,groups,torso,constraints,boundary}=torsoTopology(rig);
  const fixed=new Set(torso.filter(g=>g.indices.some(i=>rig.provenance.regions[i]!=='torso')).map(g=>key(g.point)));
  const depths=new Map(torso.map(g=>[key(g.point),fixed.has(key(g.point))?0:depthAt(g.point)]));
  // Coarse edges containing a fixed limb seam must themselves stay on the source plane.
  for(const c of constraints)if(fixed.has(c.middle)){depths.set(c.a,0);depths.set(c.b,0);fixed.add(c.a);fixed.add(c.b);}
  for(let pass=0;pass<12;pass++)for(const c of constraints) {
    if(!fixed.has(c.middle))depths.set(c.middle,depths.get(c.a)*(1-c.t)+depths.get(c.b)*c.t);
  }
  const changed=[];
  for(const g of torso)for(const i of g.indices)if(rig.provenance.regions[i]==='torso'&&depths.get(key(g.point))>1e-10){mesh.vertices[i][2]=depths.get(key(g.point));changed.push(i);}
  const originalVertices=mesh.vertices.length,originalTriangles=mesh.triangles.length;
  mesh.faceColors=mesh.triangles.map(()=>null);
  const rear=new Map(),sides=[];
  const rearIndex=(g,part)=>{
    const k=key(g.point);if(rear.has(k))return rear.get(k);
    const source=g.indices.find(i=>rig.provenance.regions[i]==='torso'),i=mesh.vertices.length;
    mesh.vertices.push([mesh.vertices[source][0],mesh.vertices[source][1],TORSO_BACK_DEPTH[part]]);
    mesh.uvs.push([...mesh.uvs[source]]);mesh.weights.push(structuredClone(mesh.weights[source]));
    rig.provenance.regions.push('torso-authored-side');rear.set(k,i);return i;
  };
  const boundaryKeys=new Set(boundary.map(e=>[key(e.a.point),key(e.b.point)].sort().join('|')));
  for(const [part,edges]of Object.entries(TORSO_SIDE_EDGES))for(const [ai,bi]of edges) {
    if(!boundaryKeys.has([key(points[ai]),key(points[bi])].sort().join('|')))throw new Error(`Side ${ai}/${bi} is not an atomic torso boundary.`);
    const ar=rearIndex(groups.get(key(points[ai])),part),br=rearIndex(groups.get(key(points[bi])),part);
    const start=mesh.triangles.length;
    mesh.triangles.push([ai,br,bi],[ai,ar,br]);mesh.drawOrder.push(0,0);
    mesh.faceColors.push(TORSO_SIDE_COLORS[part],TORSO_SIDE_COLORS[part]);rig.provenance.triangleRegions.push('torso-authored-side','torso-authored-side');
    sides.push({part,front:[ai,bi],rear:[ar,br],faces:[start,start+1]});
  }
  rig.id='hell-aberrant-torso-depth-r7';rig.name='지옥기형 · 흉곽과 골반 저작 두께';
  rig.provenance.depthAuthoring={authority:'ENGINE_AUTHORING',revision:'r7',sourceRecovered:false,
    originalVertices,originalTriangles,frontVertexIndices:changed,sharedSeamsZ:0,
    ringsSourcePx:TORSO_RINGS,roiSourcePx:TORSO_POLYGONS,sourceTolerancePx:SOURCE_EPSILON,
    continuityPasses:12,continuityConstraintCount:constraints.length,
    maxContinuityError:Math.max(0,...constraints.map(c=>Math.abs(depths.get(c.middle)-depths.get(c.a)*(1-c.t)-depths.get(c.b)*c.t))),
    sideColors:TORSO_SIDE_COLORS,rearDepthModel:TORSO_BACK_DEPTH,sideSegments:sides,
    fullBackAuthored:false,sourceTextureChanged:false,limbsChanged:false,nativeCombatApplied:false};
  scene.id='hell-aberrant-torso-depth-scene-r7';scene.name=rig.name;scene.rigScene.resources[0].name=rig.name;
  const valid=validateProject(scene,{geometry:false});if(!valid.ok)throw new Error(JSON.stringify(valid.errors));
  return scene;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
  const out=process.env.FDG_TORSO_OUTPUT||path.join(repo,'tmp/hell-aberrant-torso-r7');
  const baseline=JSON.parse(await fs.readFile(path.join(repo,'tools/fdg-studio/fixtures/hell-aberrant-tail-idle.fdg.json'),'utf8'));
  const scene=buildTorsoDepthScene(baseline),rig=scene.rigScene.resources[0].project,body=structuredClone(scene);delete body.rigScene.sequence;
  await fs.mkdir(out,{recursive:true});
  for(const [name,value]of [['hell-aberrant-torso-depth.fdg.json',scene],['hell-aberrant-torso-depth.rig.json',rig],['body-only-torso.fdg.json',body]])await fs.writeFile(path.join(out,name),JSON.stringify(value));
  console.log(JSON.stringify({output:out,vertices:rig.mesh.vertices.length,triangles:rig.mesh.triangles.length,
    curvedVertices:rig.provenance.depthAuthoring.frontVertexIndices.length,sideSegments:rig.provenance.depthAuthoring.sideSegments.length,
    maxContinuityError:rig.provenance.depthAuthoring.maxContinuityError,sourceImagesRead:0}));
}

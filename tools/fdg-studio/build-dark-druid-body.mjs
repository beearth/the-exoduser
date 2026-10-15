import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createDefaultProject } from '../../engine/fdg/catalog.js';
import { validateProject } from '../../engine/fdg/project.js';

export const DRUID_SOURCE = 'assets/sprites/boss/boss_dark_druid_f0.png';
export const DRUID_SOURCE_SHA256 = '74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68';
export const DRUID_UNITS = 150, DRUID_ORIGIN = [221,526], DRUID_ALPHA_CUTOFF = 32;
export const DRUID_ROIS = {
  staffCrown:[[52,24],[73,43],[91,59],[103,89],[103,133],[87,160],[73,185],[49,177],[27,154],[9,121],[6,81],[25,55],[39,42]],
  staffShaft:[[51,168],[66,162],[77,201],[87,250],[93,309],[104,377],[116,448],[130,531],[120,538],[109,458],[95,388],[84,320],[70,265],[62,215],[47,184]],
  leftHand:[[65,216],[82,219],[91,231],[88,249],[96,267],[80,277],[65,260],[61,240]],
  leftSleeve:[[156,179],[171,207],[150,250],[127,285],[100,304],[85,281],[88,256],[111,234],[134,205]],
  rightArm:[[288,189],[315,193],[327,221],[340,259],[348,290],[354,315],[353,348],[338,362],[326,350],[326,316],[315,287],[304,265],[295,234]],
  coatFront:[[208,267],[238,267],[251,310],[243,380],[234,451],[222,494],[207,458],[198,386],[197,321]],
  coatLeft:[[190,266],[210,302],[195,363],[167,428],[146,475],[113,514],[67,519],[14,495],[0,468],[59,422],[89,352],[125,291]],
  coatRight:[[246,273],[283,287],[314,339],[354,418],[354,511],[304,515],[276,480],[259,429],[247,369],[237,313]],
  leftBoot:[[143,476],[166,468],[178,487],[164,518],[141,533],[118,528],[122,511]],
  rightBoot:[[270,474],[288,476],[302,501],[315,523],[305,535],[278,533],[263,511]],
};
export const DRUID_BONES_PX = [
  ['root','발 기준',null,[221,526]],['pelvis','허리·외투 중심','root',[222,291]],
  ['spine','몸통','pelvis',[221,221]],['chest','녹색 흉곽','spine',[224,176]],
  ['neck','목','chest',[224,135]],['head','해골·비대칭 가지뿔','neck',[223,112]],
  ['leftUpperArm','지팡이 위팔','chest',[158,187]],['leftForearm','지팡이 아래팔','leftUpperArm',[122,233]],
  ['leftHand','지팡이를 잡은 손','leftForearm',[77,242]],['staff','지팡이·뼈 장식','leftHand',[77,242]],
  ['rightUpperArm','오른 위팔','chest',[291,191]],['rightForearm','오른 아래팔','rightUpperArm',[320,249]],
  ['rightHand','오른손','rightForearm',[341,317]],
  ['coatLeft','왼쪽 외투 자락','pelvis',[184,304]],['coatRight','오른쪽 외투 자락','pelvis',[259,307]],
  ['coatFront','중앙 외투 장식판','pelvis',[222,294]],['coatBack','바깥 외투 층','pelvis',[220,310]],
  ['leftBoot','왼쪽 장화','root',[160,490]],['rightBoot','오른쪽 장화','root',[281,488]],
];
// Reviewed short right-arm contours after conforming UV extraction; no full back shell.
export const DRUID_SIDE_EDGES = [[1636,1637],[1637,1638],[1638,1707],[1707,1708],[1708,1713],[1713,1712],
  [2037,2038],[2043,2037],[2042,2043],[2045,2042],[2046,2045]];
const clamp=n=>Math.max(0,Math.min(1,n)), model=([x,y],z=0)=>[(x-DRUID_ORIGIN[0])/DRUID_UNITS,(DRUID_ORIGIN[1]-y)/DRUID_UNITS,z];
const inside=([x,y],polygon)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const[a,b]=polygon[i],[c,d]=polygon[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;};
export function druidPartAt(x,y) {
  const p=[x,y];
  if(inside(p,DRUID_ROIS.leftHand))return 'leftHand';
  if(inside(p,DRUID_ROIS.staffCrown)||inside(p,DRUID_ROIS.staffShaft))return 'staff';
  if(inside(p,DRUID_ROIS.leftBoot))return 'leftBoot';if(inside(p,DRUID_ROIS.rightBoot))return 'rightBoot';
  if(inside(p,DRUID_ROIS.leftSleeve))return 'leftSleeve';if(inside(p,DRUID_ROIS.rightArm))return 'rightArm';
  if(y<154)return 'head';
  if(inside(p,DRUID_ROIS.coatFront))return 'coatFront';
  if(inside(p,DRUID_ROIS.coatLeft))return 'coatLeft';if(inside(p,DRUID_ROIS.coatRight))return 'coatRight';
  if(y>292)return 'coatBack';return 'body';
}
const weights=(...pairs)=>pairs.filter(([,weight])=>weight>1e-10).map(([boneId,weight])=>({boneId,weight}));
export function druidWeightsAt(x,y,part=druidPartAt(x,y)) {
  if(part==='staff'||part==='leftHand')return weights([part==='staff'?'staff':'leftHand',1]);
  if(part==='leftBoot'||part==='rightBoot')return weights([part,1]);
  if(part==='head'){const t=clamp((y-132)/38);return weights(['head',1-t],['neck',t]);}
  if(part==='leftSleeve') {
    const wrist=clamp((128-x)/44),shoulder=clamp((x-145)/26);
    return weights(['chest',shoulder],['leftUpperArm',(1-shoulder)*(1-wrist)],['leftForearm',(1-shoulder)*wrist]);
  }
  if(part==='rightArm'){const elbow=clamp((y-220)/75),hand=clamp((y-293)/35);return weights(['rightUpperArm',1-elbow],['rightForearm',elbow*(1-hand)],['rightHand',elbow*hand]);}
  if(part.startsWith('coat')){const t=.75*clamp((y-286)/110);return weights(['pelvis',1-t],[part,t]);}
  const neck=clamp((184-y)/42);if(neck>0)return weights(['neck',neck],['chest',1-neck]);
  const hip=clamp((y-226)/72);return weights(['spine',1-hip],['pelvis',hip]);
}
const layer={coatBack:-2,coatLeft:-1,coatRight:-1,body:0,leftBoot:1,rightBoot:1,coatFront:2,head:3,leftSleeve:4,rightArm:4,leftHand:5,staff:6};
const sourceDepth=(x,y,part)=>{
  if(part==='staff'||part==='leftHand')return .035;
  if(part.endsWith('Boot'))return 0;
  return .11*Math.exp(-(((x-225)/65)**2)-(((y-224)/95)**2))+.035*Math.exp(-(((x-134)/35)**2)-(((y-226)/50)**2));
};
const key=p=>p.map(v=>Math.round(v*10000)).join(',');

export function buildDarkDruidRig(image,sourceSha256=DRUID_SOURCE_SHA256) {
  if(image.width!==355||image.height!==541||sourceSha256!==DRUID_SOURCE_SHA256)throw new Error('Exact approved Dark Druid NORMAL source required.');
  const W=355,H=541,mask=new Uint8Array(W*H);let visiblePixels=0;
  for(let i=0;i<mask.length;i++)if(image.data[i*4+3]>=DRUID_ALPHA_CUTOFF){mask[i]=1;visiblePixels++;}
  const masked=([x,y])=>x>=0&&y>=0&&x<W&&y<H&&mask[Math.floor(y)*W+Math.floor(x)]===1;
  const vertices=[],uvs=[],skin=[],triangles=[],drawOrder=[],faceColors=[],regions=[],triangleRegions=[],indices=new Map();
  const vertex=([x,y])=>{x=Math.round(x*10000)/10000;y=Math.round(y*10000)/10000;const k=key([x,y]);if(indices.has(k))return indices.get(k);
    const part=druidPartAt(x,y),index=vertices.length;indices.set(k,index);vertices.push(model([x,y],sourceDepth(x,y,part)));uvs.push([x/W,y/H]);skin.push(druidWeightsAt(x,y,part));regions.push(part);return index;};
  const emit=polygon=>{for(let i=1;i<polygon.length-1;i++){const p=[polygon[0],polygon[i],polygon[i+1]],area=(p[1][0]-p[0][0])*(p[2][1]-p[0][1])-(p[1][1]-p[0][1])*(p[2][0]-p[0][0]);if(Math.abs(area)<.001)continue;
    const part=druidPartAt(p.reduce((s,a)=>s+a[0],0)/3,p.reduce((s,a)=>s+a[1],0)/3);triangles.push(p.map(vertex));drawOrder.push(layer[part]);faceColors.push(null);triangleRegions.push(part);}};
  const edgeInside=(a,b)=>{let p=masked(a)?a:b,q=masked(a)?b:a;for(let i=0;i<12;i++){const m=p.map((v,j)=>(v+q[j])/2);if(masked(m))p=m;else q=m;}return p;};
  const clip=p=>{const polygon=[];for(let i=0;i<3;i++){const a=p[i],b=p[(i+1)%3],ai=masked(a),bi=masked(b);if(ai)polygon.push(a);if(ai!==bi)polygon.push(edgeInside(a,b));}if(polygon.length>=3)emit(polygon);};
  const cell=(x,y,size)=>{
    const mx=Math.min(W-.0001,x+size),my=Math.min(H-.0001,y+size);let filled=0,total=0;
    for(let py=y;py<Math.min(H,y+size);py++)for(let px=x;px<Math.min(W,x+size);px++){total++;filled+=mask[py*W+px];}if(!filled)return;
    const ring=[[x,y],[mx,y],[mx,my],[x,my]],center=[(x+mx)/2,(y+my)/2];
    if(filled===total&&ring.every(masked)){emit(ring);return;}
    if(size>8||(size>4&&!masked(center)&&!ring.some(masked))){const half=size/2;for(const[dx,dy]of[[0,0],[half,0],[0,half],[half,half]])if(x+dx<W&&y+dy<H)cell(x+dx,y+dy,half);return;}
    for(let i=0;i<4;i++)clip([center,ring[i],ring[(i+1)%4]]);
  };
  for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16)cell(x,y,16);
  // Split coarse edges at existing adaptive UV vertices. Shared indices then give
  // identical XYZ and LBS at every seam without replacing the approved pixels.
  const sourcePoints=uvs.map(uv=>uv.map((v,i)=>v*[W,H][i]));let refinedTriangles=0,insertedEdgePoints=0;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const refined=[],refinedLayers=[],refinedRegions=[];
  const earClip=polygon=>{
    const remaining=[...polygon],result=[];
    while(remaining.length>3){let found=false;
      for(let i=0;i<remaining.length;i++){
        const a=remaining[(i+remaining.length-1)%remaining.length],b=remaining[i],c=remaining[(i+1)%remaining.length];
        const area=cross(sourcePoints[a],sourcePoints[b],sourcePoints[c]);if(area<=.001)continue;
        const occupied=remaining.some(p=>p!==a&&p!==b&&p!==c&&cross(sourcePoints[a],sourcePoints[b],sourcePoints[p])>=-1e-6&&cross(sourcePoints[b],sourcePoints[c],sourcePoints[p])>=-1e-6&&cross(sourcePoints[c],sourcePoints[a],sourcePoints[p])>=-1e-6);
        if(occupied)continue;result.push([a,b,c]);remaining.splice(i,1);found=true;break;
      }
      if(!found)throw new Error('Cannot triangulate authored UV boundary.');
    }
    if(cross(...remaining.map(i=>sourcePoints[i]))<=.001)throw new Error('Degenerate UV ear remainder.');result.push(remaining);return result;
  };
  triangles.forEach((triangle,ti)=>{
    const polygon=[];
    for(let e=0;e<3;e++){
      const a=sourcePoints[triangle[e]],b=sourcePoints[triangle[(e+1)%3]],dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
      const cuts=sourcePoints.flatMap((p,index)=>{const t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length;
        return t>=-1e-8&&t<1-1e-8&&Math.abs((p[0]-a[0])*dy-(p[1]-a[1])*dx)<=.00005*Math.sqrt(length)?[{index,t:Math.max(0,t)}]:[];
      }).sort((a,b)=>a.t-b.t);polygon.push(...cuts.map(c=>c.index));
    }
    const output=polygon.length===3?[triangle]:earClip(polygon);
    if(polygon.length>3){refinedTriangles++;insertedEdgePoints+=polygon.length-3;}
    for(const t of output){refined.push(t);refinedLayers.push(drawOrder[ti]);refinedRegions.push(triangleRegions[ti]);}
  });
  triangles.splice(0,triangles.length,...refined);drawOrder.splice(0,drawOrder.length,...refinedLayers);triangleRegions.splice(0,triangleRegions.length,...refinedRegions);faceColors.splice(0,faceColors.length,...triangles.map(()=>null));
  const originalVertices=vertices.length,originalTriangles=triangles.length;
  const edges=new Map();triangles.forEach(t=>{for(let i=0;i<3;i++){const a=t[i],b=t[(i+1)%3],k=[a,b].sort((a,b)=>a-b).join(':');if(!edges.has(k))edges.set(k,{a,b,count:0});edges.get(k).count++;}});
  const rearIndices=new Map(),sideSegments=[];
  const rearIndex=i=>{if(rearIndices.has(i))return rearIndices.get(i);const index=vertices.length;vertices.push([vertices[i][0],vertices[i][1],-.055]);uvs.push([...uvs[i]]);skin.push(structuredClone(skin[i]));regions.push('authored-arm-side');rearIndices.set(i,index);return index;};
  for(const [a,b]of DRUID_SIDE_EDGES){
    if(edges.get([a,b].sort((a,b)=>a-b).join(':'))?.count!==1)throw new Error('Authored arm side must use a conforming silhouette edge.');
    const ar=rearIndex(a),br=rearIndex(b),first=triangles.length;triangles.push([a,br,b],[a,ar,br]);drawOrder.push(4,4);faceColors.push('#28221f','#1b1715');triangleRegions.push('authored-arm-side','authored-arm-side');sideSegments.push({front:[a,b],rear:[ar,br],faces:[first,first+1]});
  }
  const absolute=new Map(DRUID_BONES_PX.map(([id,,,p])=>[id,model(p)]));
  const skeleton={id:'dark-druid-visible-skeleton',bones:DRUID_BONES_PX.map(([id,name,parent])=>({id,name,parent,translation:absolute.get(id).map((v,i)=>v-(parent?absolute.get(parent)[i]:0)),rotation:[0,0,0]}))};
  const idleTimes=[0,.25,.5,.75,1,1.25,1.5,1.75,2],idleAmp={spine:.006,chest:.009,head:-.008,leftUpperArm:.012,leftForearm:-.010,rightUpperArm:-.008,coatLeft:.009,coatRight:-.007,coatFront:.004,coatBack:.005};
  const idle={id:'dark-druid-idle',name:'대기 · 호흡과 외투 무게',duration:2,fps:24,loop:true,tracks:Object.entries(idleAmp).map(([boneId,amplitude])=>({boneId,keys:idleTimes.map(time=>({time,translation:boneId==='chest'?[0,.004*Math.sin(Math.PI*time),0]:[0,0,0],rotation:[0,0,amplitude*Math.sin(Math.PI*time)]}))}))};
  const attack=buildDarkDruidStaffStrikeClip();
  return {rigVersion:1,id:'dark-druid-normal-body-r1',name:'다크드루이드 NORMAL · 본체 제작',skeleton,
    mesh:{id:'dark-druid-visible-mesh',skeletonId:skeleton.id,vertices,triangles,weights:skin,uvs,drawOrder,faceColors},
    materials:[{id:'approved-dark-druid',name:'승인 다크드루이드 원화',meshId:'dark-druid-visible-mesh',skeletonId:skeleton.id,color:'#b1a28f',texture:{src:DRUID_SOURCE,width:W,height:H}}],clips:[idle,attack],
    preview:{materialId:'approved-dark-druid',clipId:idle.id,time:0,playing:false,pose:{},camera:{yaw:0,pitch:0,zoom:1}},
    provenance:{authority:'ENGINE_AUTHORING',revision:'r2',subject:'boss-dark-druid-NORMAL',source:DRUID_SOURCE,sourceSha256,sourceSize:[W,H],
      approvedCanonicalPath:'/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/sprites/boss/boss_dark_druid_f0.png',
      sourcePxPerModelUnit:DRUID_UNITS,originPx:DRUID_ORIGIN,sourceImageModified:false,gameplayApplied:false,modelKind:'visible-surface-2.5D-skinned',
      regions,triangleRegions,roisSourcePx:DRUID_ROIS,bonesSourcePx:DRUID_BONES_PX,
      extraction:{alphaCutoff:DRUID_ALPHA_CUTOFF,visiblePixels,macroCell:16,leafCell:8,thinLeaf:4,edgeIterations:12,sourcePrecisionPx:.0001,originalVertices,originalTriangles,refinedTriangles,insertedEdgePoints,conformingEdgeTolerancePx:.00005,sharedSourceVertex:true,rgbDeletion:false},
      depthAuthoringDruid:{authority:'ENGINE_AUTHORING',sourceRecovered:false,frontFormula:'0.11*exp(-((x-225)/65)^2-((y-224)/95)^2)+0.035*exp(-((x-134)/35)^2-((y-226)/50)^2); staff/hand=.035,boots=0',rearDepthModel:-.055,sideSegments,sideColors:['#28221f','#1b1715']},
      handStaff:{pivotSourcePx:[77,242],coincidentBind:true,staffTracks:0,sharedSkinMatrix:true},footPolicy:{bones:['leftBoot','rightBoot'],parent:'root',animated:false},
      phases:[{name:'대기',clip:idle.id},{name:'준비',from:0,to:.9},{name:'타격',from:.9,to:1.25},{name:'회복',from:1.25,to:2.4}],
      staffReadability:DRUID_STAFF_READABILITY,
      sourceGap:'SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보',fullBackAuthored:false,nativeCombatApplied:false,newFx:false}};
}
export const DRUID_STAFF_READABILITY={revision:'r2',authority:'ENGINE_AUTHORING',tipProbeSourcePx:[75,82],screenForward:'+X',screenDown:'+Y',driveTime:1.04,overtravelTime:1.1,settleTime:1.25,geometryChanged:false,weightsChanged:false,staffIndependentTrack:false,forceTransfer:'spine-chest-arms',headStaffSkinMatchedAtKeys:true};
export function buildDarkDruidStaffStrikeClip() {
  const times=[0,.25,.65,.9,1.04,1.1,1.25,1.65,2,2.4];
  const angles={spine:[0,.003,.006,.008,-.012,-.015,-.012,.005,.002,0],chest:[0,.002,.004,.006,-.011,-.015,-.012,.003,.001,0],head:[0,.006,.015,.023,-.016,-.020,-.018,.008,.003,0],
    leftUpperArm:[0,.003,.006,.009,-.010,-.012,-.011,.004,.001,0],leftForearm:[0,.003,.007,.012,-.006,-.008,-.007,.004,.002,0],leftHand:[0,0,.002,.002,0,0,0,0,0,0],
    rightUpperArm:[0,-.008,-.016,-.020,.026,.035,.022,-.006,-.002,0],rightForearm:[0,.005,.012,.015,-.016,-.022,-.012,.004,.001,0],
    coatLeft:[0,.002,.004,.005,-.008,-.014,-.023,.009,.002,0],coatRight:[0,-.002,-.003,-.004,.007,.013,.021,-.008,-.001,0],coatFront:[0,.001,.002,.003,-.004,-.007,-.012,.004,.001,0],coatBack:[0,.001,.003,.004,-.005,-.010,-.017,.006,.001,0]};
  const spine=[[0,0,0],[-.003,.009,0],[-.012,.033,0],[-.025,.055,0],[.115,-.165,0],[.135,-.195,0],[.130,-.220,0],[.015,-.030,0],[.003,-.008,0],[0,0,0]];
  const upper=[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[.014,-.012,0],[.018,-.018,0],[.015,-.020,0],[.004,-.002,0],[0,0,0],[0,0,0]];
  // Authored local offset: inverse neck rotation * (staff skin T - head skin T).
  const head=[[0,0,0],[-0.003931012304501683,0.0033068368825681753,0],[-0.01045937383213985,0.009172662735365178,0],[-0.016093273606415083,0.013721611362594194,0],[0.023765315505426748,-0.02046083160185281,0],[0.03033496373345614,-0.02872508624693237,0],[0.02605139342656476,-0.02959152209570428,0],[-0.0012462276567512887,0.002403251903470841,0],[-0.002116239752183652,0.001776520346043947,0],[0,0,0]];
  return {id:'dark-druid-staff-strike',name:'준비 → 지팡이 타격 → 회복 · 단발',duration:2.4,fps:24,loop:false,tracks:Object.entries(angles).map(([boneId,values])=>({boneId,keys:times.map((time,i)=>({time,translation:boneId==='spine'?spine[i]:boneId==='leftUpperArm'?upper[i]:boneId==='head'?head[i]:[0,0,0],rotation:[0,0,values[i]]}))}))};
}
export function buildDarkDruidScene(rig) {
  const scene=createDefaultProject();scene.id='dark-druid-normal-body-scene-r1';scene.name=rig.name;
  scene.rigScene={version:1,resources:[{id:'dark-druid-body',name:rig.name,project:structuredClone(rig)}],
    nodes:[{id:'dark-druid-body-node',name:'다크드루이드 NORMAL · 보이는 본체',resourceId:'dark-druid-body',position:[4150,7360,0],scale:80,visible:true,materialId:'approved-dark-druid',clipId:'dark-druid-idle',time:0,transition:null,returnTo:{clipId:'dark-druid-idle',transitionSeconds:.35}}],
    camera:{x:4150,y:7216,follow:false,yaw:0,pitch:0}};
  scene.provenance.bodyAuthoring={authority:'ENGINE_AUTHORING',subject:'boss-dark-druid-NORMAL',fx:0,entryTransitionSeconds:.25,nativeCombatApplied:false,isolatedStorageKey:'fdg.studio.dark-druid.body.r1',staffReadabilityRevision:'r2'};
  const valid=validateProject(scene,{geometry:false});if(!valid.ok)throw new Error(JSON.stringify(valid.errors));return scene;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=process.env.FDG_DRUID_BODY_OUTPUT||path.join(repo,'tmp/dark-druid-body-r1');
  const {PNG}=await import(process.env.FDG_PNG_MODULE||'pngjs'),bytes=await fs.readFile(path.join(repo,DRUID_SOURCE));
  const rig=buildDarkDruidRig(PNG.sync.read(bytes),createHash('sha256').update(bytes).digest('hex')),scene=buildDarkDruidScene(rig);await fs.mkdir(out,{recursive:true});
  for(const[name,value]of[['dark-druid-normal-body.fdg.json',scene],['dark-druid-normal-body.rig.json',rig]])await fs.writeFile(path.join(out,name),JSON.stringify(value));
  console.log(JSON.stringify({output:out,vertices:rig.mesh.vertices.length,triangles:rig.mesh.triangles.length,bones:rig.skeleton.bones.length,extraction:rig.provenance.extraction,sideSegments:rig.provenance.depthAuthoringDruid.sideSegments.length,sourceWrites:0}));
}

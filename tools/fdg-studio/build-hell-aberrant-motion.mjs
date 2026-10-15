import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Source analysis creates mesh geometry only. The original texture bytes are never written.
const { PNG } = await import(process.env.FDG_PNG_MODULE || 'pngjs');
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = process.env.FDG_MOTION_OUTPUT || path.join(repo, 'tmp/hell-aberrant-motion');
const src = 'assets/sprites/boss/stage1_codex_hell_aberrant.png';
const bytes = await fs.readFile(path.join(repo, src)), image = PNG.sync.read(bytes);
if (image.width !== 832 || image.height !== 1248) throw Error('Approved source must remain 832×1248');
const W = image.width, H = image.height, UNITS = 300, origin = [500, 1140];
const inPolygon = (x, y, p) => {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [ax, ay] = p[i], [bx, by] = p[j];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
};
// Authored inner body regions disambiguate dark/gray armor from the neutral background.
const interiors = [
  [[332,410],[401,397],[540,418],[627,494],[608,610],[540,645],[442,653],[362,585],[330,512]],
  [[282,320],[352,310],[400,345],[395,395],[350,428],[288,410],[265,369]],
  [[603,410],[650,438],[661,510],[644,612],[615,679],[599,658],[613,575]],
  [[288,568],[302,601],[277,683],[251,739],[229,718],[234,664],[263,602]],
  [[431,633],[530,650],[548,690],[519,721],[445,725],[405,699]],
  [[403,730],[442,756],[418,797],[348,826],[348,796],[373,758]],
  [[384,849],[429,881],[445,918],[420,960],[392,1025],[365,1065],[344,1061],[376,1001],[405,924],[356,875]],
  [[535,720],[571,757],[563,833],[625,942],[622,1030],[630,1100],[612,1120],[602,1070],[608,991],[540,930],[515,832]],
  // Conservative interior polygons follow visible armor, never the neutral silhouette exterior.
  [[277,306],[312,282],[347,285],[386,306],[403,342],[394,381],[375,410],[348,430],[310,446],[279,428],[269,391],[264,354]],
  [[355,415],[400,386],[448,373],[508,363],[553,393],[585,438],[594,493],[584,551],[568,592],[542,631],[495,660],[454,655],[423,623],[388,598],[357,566],[334,523],[319,479],[322,451]],
  [[432,592],[475,590],[523,613],[547,645],[530,678],[498,701],[462,697],[430,670],[416,632]],
  [[261,613],[297,605],[320,630],[320,660],[306,702],[288,738],[274,763],[248,772],[224,757],[216,731],[223,688],[242,651]],
  [[637,459],[660,480],[676,513],[679,550],[668,585],[653,625],[629,669],[616,697],[604,704],[608,665],[628,603],[633,563],[642,513]],
  [[384,709],[426,686],[463,710],[469,754],[442,796],[401,835],[370,849],[334,842],[314,816],[326,775],[350,739]],
  [[341,832],[373,839],[412,865],[444,884],[457,906],[439,932],[420,938],[387,921],[355,890],[326,861]],
  [[415,934],[436,938],[429,969],[407,1007],[393,1035],[380,1059],[356,1068],[353,1053],[378,1006],[399,968]],
  [[346,1066],[381,1062],[405,1076],[410,1090],[392,1097],[321,1094],[313,1086],[330,1075]],
  [[540,704],[584,716],[595,759],[579,817],[568,861],[545,875],[529,842],[517,789],[523,743]],
  [[556,875],[583,866],[607,890],[625,920],[634,961],[631,998],[636,1034],[647,1074],[635,1097],[613,1095],[609,1055],[605,1013],[602,972],[582,929],[557,904]],
  [[607,1090],[636,1093],[652,1111],[656,1127],[639,1137],[605,1137],[598,1121],[599,1105]],
];
const mask = new Uint8Array(W * H);
const maskReasons = { sourceColor: 0, authoredVisibleInterior: 0, discardedSmallIslands: 0 };
for (let y = 70; y < 1160; y++) for (let x = 30; x < 805; x++) {
  const at = (y * W + x) * 4, rgb = [...image.data.subarray(at, at + 3)], low = Math.min(...rgb), high = Math.max(...rgb);
  const sourceColor = high - low > 2 || high < 29 || low > 70;
  const visibleInterior = !sourceColor && interiors.some(p => inPolygon(x + .5, y + .5, p));
  if (sourceColor || visibleInterior) { mask[y * W + x] = 1; maskReasons[sourceColor ? 'sourceColor' : 'authoredVisibleInterior']++; }
}
// Discard isolated source noise; preserve all substantial visible islands, including horns.
const visited = new Uint8Array(mask.length);
for (let at = 0; at < mask.length; at++) {
  if (!mask[at] || visited[at]) continue;
  const component = [at]; visited[at] = 1;
  for (let i = 0; i < component.length; i++) {
    const p = component[i], x = p % W;
    for (const next of [p - W, p + W, x ? p - 1 : -1, x + 1 < W ? p + 1 : -1]) if (next >= 0 && next < mask.length && mask[next] && !visited[next]) { visited[next] = 1; component.push(next); }
  }
  if (component.length < 20) { maskReasons.discardedSmallIslands += component.length; component.forEach(p => { mask[p] = 0; }); }
}
const tail = [[638,724],[698,780],[747,842],[757,913],[731,972],[677,1016],[601,1032],[516,1024],[430,1007],[342,980],[271,977],[209,1007],[183,1052],[194,1096],[249,1129],[318,1141]];
const tailWidths = [38,36,29,28,27,27,24,21,22,22,21,20,19,18,17,12];
// Classification only: keep the already masked, visible curl/spines on the tail skin.
// This polygon supplies neither new source pixels nor a bridge across an occluded gap.
const visibleTailCurl = [[141,1054],[159,1011],[203,974],[257,945],[329,943],[391,960],[423,987],
  [402,1019],[345,1011],[286,1001],[235,1018],[214,1057],[227,1088],[270,1094],
  [396,1120],[421,1159],[140,1159],[140,1089]];
const leftLeg = [[404,670],[494,727],[472,813],[404,838],[489,899],[450,1002],[411,1073],[364,1115],[294,1108],[308,1042],[371,960],[380,919],[300,862],[286,802],[316,723]];
const rightLeg = [[510,684],[596,702],[615,818],[658,908],[661,1011],[689,1079],[676,1155],[579,1155],[567,1073],[582,1000],[526,930],[484,852],[484,764]];
const tailLocation = (x, y) => {
  let best = null;
  for (let i = 0; i < tail.length - 1; i++) {
    const [ax, ay] = tail[i], [bx, by] = tail[i + 1], dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    const distance = Math.hypot(x - ax - dx * t, y - ay - dy * t), width = tailWidths[i] * (1 - t) + tailWidths[i + 1] * t;
    if (!best || distance < best.distance) best = { i, t, distance, width };
  }
  return best;
};
const partAt = (x, y) => {
  if (inPolygon(x, y, leftLeg)) return 'leftLeg';
  if (inPolygon(x, y, rightLeg)) return 'rightLeg';
  const near = tailLocation(x, y);
  const visibleLowerCurl = y > 1000 && x < 300 || y > 1108 && x < 430;
  const sourceSpineMargin = y > 820 ? 32 : 12;
  if (visibleLowerCurl || inPolygon(x, y, visibleTailCurl) || y > 696 && near.distance < near.width + sourceSpineMargin) return 'tail';
  if (x < 300 && y > 755) return 'axe';
  if (x < 320 && y > 512 && y < 778) return 'leftArm';
  if (x > 594 && y > 427 && y < 797) return 'rightArm';
  if (y < 427) return 'head';
  return 'torso';
};
const model = ([x, y], z = 0) => [(x - origin[0]) / UNITS, (origin[1] - y) / UNITS, z];
const absoluteBones = [
  ['root','발 기준',null,origin],['pelvis','골반','root',[480,690]],['spine','용암 흉곽','pelvis',[440,510]],
  ['neck','목','spine',[350,385]],['head','해골·뿔','neck',[320,325]],
  ['leftArm','도끼 위팔','spine',[305,551]],['leftForearm','도끼 아래팔','leftArm',[268,664]],['axe','도끼 손잡이','leftForearm',[245,739]],
  ['rightArm','오른 위팔','spine',[628,451]],['rightForearm','오른 아래팔','rightArm',[657,601]],
  ['leftThigh','왼 허벅지','pelvis',[407,720]],['leftKnee','왼 무릎','leftThigh',[419,902]],['leftFoot','왼 발','leftKnee',[354,1076]],
  ['rightThigh','오른 허벅지','pelvis',[547,721]],['rightKnee','오른 무릎','rightThigh',[588,919]],['rightFoot','오른 발','rightKnee',[621,1120]],
  ...tail.map((point, i) => [`tail${i}`,`꼬리 ${i + 1}`,i ? `tail${i - 1}` : 'pelvis',point]),
];
const absolute = new Map(absoluteBones.map(([id,,,point]) => [id, model(point)]));
const skeleton = { id: 'hell-aberrant-visible-skeleton', bones: absoluteBones.map(([id,name,parent]) => ({ id,name,parent,
  translation: absolute.get(id).map((value, axis) => value - (parent ? absolute.get(parent)[axis] : 0)), rotation: [0,0,0] })) };
const weightsFor = (x, y, part) => {
  if (part === 'tail') { const { i, t } = tailLocation(x,y); return t < .001 ? [{boneId:`tail${i}`,weight:1}] : t > .999 ? [{boneId:`tail${i+1}`,weight:1}] : [{boneId:`tail${i}`,weight:1-t},{boneId:`tail${i+1}`,weight:t}]; }
  if (part === 'head') return [{boneId:'head',weight:1}];
  if (part === 'axe') return [{boneId:'axe',weight:1}];
  if (part === 'leftArm' || part === 'rightArm') { const upper=part, lower=part==='leftArm'?'leftForearm':'rightForearm', split=part==='leftArm'?600:522;
    const t=Math.max(0,Math.min(1,(y-split)/130));return t<.001?[{boneId:upper,weight:1}]:t>.999?[{boneId:lower,weight:1}]:[{boneId:upper,weight:1-t},{boneId:lower,weight:t}]; }
  if (part === 'leftLeg' || part === 'rightLeg') { const side=part==='leftLeg'?'left':'right';return [{boneId:y>1000?`${side}Foot`:y>845?`${side}Knee`:`${side}Thigh`,weight:1}]; }
  const t=Math.max(0,Math.min(1,(y-565)/150));return t<.001?[{boneId:'spine',weight:1}]:t>.999?[{boneId:'pelvis',weight:1}]:[{boneId:'spine',weight:1-t},{boneId:'pelvis',weight:t}];
};
const layers = {tail:-2,torso:0,head:1,leftLeg:2,rightLeg:3,leftArm:4,rightArm:4,axe:5};
const vertices=[],uvs=[],weights=[],triangles=[],drawOrder=[],vertexRegions=[],triangleRegions=[],indexByKey=new Map();
function vertex(x,y,part) { x=Math.round(x*10000)/10000;y=Math.round(y*10000)/10000;const key=`${part}:${x}:${y}`;if(indexByKey.has(key))return indexByKey.get(key);const index=vertices.length;indexByKey.set(key,index);
  vertices.push(model([x,y],layers[part]*.002));uvs.push([x/W,y/H]);weights.push(weightsFor(x,y,part));vertexRegions.push(part);return index; }
const masked = ([x,y]) => x >= 0 && y >= 0 && x < W && y < H && mask[Math.floor(y)*W+Math.floor(x)] === 1;
const edgeInside = (a,b) => {
  let inside=masked(a)?a:b, outside=masked(a)?b:a;
  for(let i=0;i<12;i++){const mid=[(inside[0]+outside[0])/2,(inside[1]+outside[1])/2];if(masked(mid))inside=mid;else outside=mid;}
  return inside;
};
const emit = (points,part) => {
  for(let i=1;i<points.length-1;i++){
    const [a,b,c]=[points[0],points[i],points[i+1]],area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    if(Math.abs(area)<.001)continue;
    const region=part||partAt((a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3);
    triangles.push([vertex(...a,region),vertex(...b,region),vertex(...c,region)]);drawOrder.push(layers[region]);triangleRegions.push(region);
  }
};
const clippedTriangle = (points,part) => {
  const polygon=[];
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],insideA=masked(a),insideB=masked(b);
    if(insideA)polygon.push(a);
    if(insideA!==insideB)polygon.push(edgeInside(a,b));
  }
  if(polygon.length>=3)emit(polygon,part);
};
function cell(x,y,size) {
  const maxX=Math.min(W,x+size),maxY=Math.min(H,y+size), part=partAt((x+maxX)/2,(y+maxY)/2);
  let total=0,filled=0,uniform=true;
  for(let py=y;py<maxY;py++)for(let px=x;px<maxX;px++){total++;filled+=mask[py*W+px];if(partAt(px+.5,py+.5)!==part)uniform=false;}
  if(!filled)return;
  const minSize=uniform&&['torso','leftLeg','rightLeg'].includes(part)?32:16;
  if(filled===total&&(uniform||size<=minSize)){emit([[x,y],[maxX,y],[maxX,maxY],[x,maxY]],part);return;}
  if(size>minSize){const half=size/2;cell(x,y,half);cell(x+half,y,half);cell(x,y+half,half);cell(x+half,y+half,half);}
  else {
    // Broad mixed leaves retain clipped boundaries; only thin unsampled islands refine further.
    const mx=(x+maxX)/2,my=(y+maxY)/2,center=[mx,my],ring=[[x,y],[maxX,y],[maxX,maxY],[x,maxY]];
    if(size>4&&!masked(center)&&!ring.some(masked)){
      const half=size/2;cell(x,y,half);cell(x+half,y,half);cell(x,y+half,half);cell(x+half,y+half,half);
    } else for(let i=0;i<ring.length;i++)clippedTriangle([center,ring[i],ring[(i+1)%ring.length]],part);
  }
}
for(let y=0;y<H;y+=64)for(let x=0;x<W;x+=64)cell(x,y,64);
// Coincident source boundaries must have coincident LBS motion. Keep every occluder
// weight unchanged; taper the tail alone toward that boundary over a local 32px strip.
const seamBlendPx=32, groupsBySource=new Map();
for(let i=0;i<vertices.length;i++){
  const source=uvs[i].map((value,axis)=>Math.round(value*[W,H][axis]*10000)/10000),key=source.join(':');
  if(!groupsBySource.has(key))groupsBySource.set(key,{source,indices:[]});
  groupsBySource.get(key).indices.push(i);
}
const anchorPriority={leftLeg:0,rightLeg:1};
const legCutCapBounds={leftLeg:[330,940,470,1064],rightLeg:[560,984,680,1064]};
const seamAnchors=[];
for(const group of groupsBySource.values()){
  if(!group.indices.some(i=>vertexRegions[i]==='tail'))continue;
  const adjacent=group.indices.filter(i=>{
    const bounds=legCutCapBounds[vertexRegions[i]], [x,y]=group.source;
    return bounds&&x>=bounds[0]&&y>=bounds[1]&&x<=bounds[2]&&y<=bounds[3];
  }).sort((a,b)=>anchorPriority[vertexRegions[a]]-anchorPriority[vertexRegions[b]]||a-b);
  if(adjacent.length)seamAnchors.push({source:group.source,region:vertexRegions[adjacent[0]],weights:structuredClone(weights[adjacent[0]])});
}
let influencedTailVertices=0,pinnedTailVertices=0;
for(let i=0;i<vertices.length;i++){
  if(vertexRegions[i]!=='tail')continue;
  const source=uvs[i].map((value,axis)=>value*[W,H][axis]);
  if(source[1]>1000&&source[0]<300||source[1]>1108&&source[0]<430)continue;
  let nearest=null,distance=Infinity;
  for(const anchor of seamAnchors){const d=Math.hypot(source[0]-anchor.source[0],source[1]-anchor.source[1]);if(d<distance){distance=d;nearest=anchor;}}
  if(!nearest||distance>=seamBlendPx)continue;
  const t=Math.max(0,Math.min(1,distance/seamBlendPx)),tailAmount=t*t*(3-2*t),blended=new Map();
  for(const influence of nearest.weights)blended.set(influence.boneId,influence.weight*(1-tailAmount));
  for(const influence of weights[i])blended.set(influence.boneId,(blended.get(influence.boneId)||0)+influence.weight*tailAmount);
  const remaining=[...blended].filter(([,weight])=>weight>1e-10),sum=remaining.reduce((value,[,weight])=>value+weight,0);
  weights[i]=remaining.map(([boneId,weight])=>({boneId,weight:weight/sum}));
  influencedTailVertices++;if(distance<.0001)pinnedTailVertices++;
}
if(vertices.length>4096||triangles.length>8192)throw Error(`Mesh exceeds existing limits: ${vertices.length} vertices/${triangles.length} triangles`);
const times=[0,.35,.65,.9,1.08,1.4,1.8,2.4,3], neutral=times.map(()=>0);
const keys=(rotations)=>times.map((time,index)=>({time,translation:[0,0,0],rotation:[0,0,rotations[index]]}));
const tracks=[
  {boneId:'spine',keys:keys([0,.06,.10,-.12,-.04,.03,0,0,0])},
  {boneId:'head',keys:keys([0,-.03,-.06,.05,.02,0,0,0,0])},
  {boneId:'leftArm',keys:keys([0,.05,.11,-.08,-.025,0,0,0,0])},
  {boneId:'leftForearm',keys:keys([0,.08,.12,-.06,-.02,0,0,0,0])},
  ...tail.map((_,i)=>{const prepare=.065*Math.exp(-i/7),sweep=-.10*Math.exp(-i/6);return {boneId:`tail${i}`,keys:keys([0,prepare*.6,prepare,sweep,sweep*.4,prepare*.13,0,0,0])};}),
];
// Bake the existing visible distal island's pivot behind the fixed left leg.
// Keep its relative local bend, while compensating inherited proximal chain T/R.
// This is authored clip data at the existing keys, not a new runtime constraint.
const distalPivotBone='tail9', distalPivot=model(tail[9]);
const rotateXY=(point,angle)=>[point[0]*Math.cos(angle)-point[1]*Math.sin(angle),point[0]*Math.sin(angle)+point[1]*Math.cos(angle)];
const distalTrack=tracks.find(track=>track.boneId===distalPivotBone);
for(let keyIndex=0;keyIndex<times.length;keyIndex++){
  let parentPosition=[...absolute.get('pelvis')],parentAngle=0;
  for(let i=0;i<9;i++){
    const bone=skeleton.bones.find(value=>value.id===`tail${i}`),track=tracks.find(value=>value.boneId===`tail${i}`),local=rotateXY(bone.translation,parentAngle);
    parentPosition=[parentPosition[0]+local[0],parentPosition[1]+local[1],parentPosition[2]+bone.translation[2]];
    parentAngle+=track.keys[keyIndex].rotation[2];
  }
  const localPivot=rotateXY([distalPivot[0]-parentPosition[0],distalPivot[1]-parentPosition[1]],-parentAngle);
  const bindLocal=skeleton.bones.find(value=>value.id===distalPivotBone).translation,key=distalTrack.keys[keyIndex];
  key.translation=[localPivot[0]-bindLocal[0],localPivot[1]-bindLocal[1],0];
  key.rotation[2]-=parentAngle;
}
const project={rigVersion:1,id:'hell-aberrant-tail-swipe-continuity-r3',name:'지옥기형 · 꼬리 휩쓸기 2.5D 제작',skeleton,
  mesh:{id:'hell-aberrant-visible-mesh',skeletonId:skeleton.id,vertices,triangles,weights,uvs,drawOrder},
  materials:[{id:'approved-source',name:'승인 본체 텍스처',meshId:'hell-aberrant-visible-mesh',skeletonId:skeleton.id,color:'#ffffff',texture:{src,width:W,height:H}}],
  clips:[{id:'tail-swipe-loop',name:'준비 → 휩쓸기 → 회복',duration:3,fps:24,loop:true,tracks},
    {id:'tail-swipe-once',name:'꼬리 휩쓸기 · 단발',duration:3,fps:24,loop:false,tracks:structuredClone(tracks)}],
  preview:{materialId:'approved-source',clipId:'tail-swipe-loop',time:0,playing:false,pose:{},camera:{yaw:0,pitch:0,zoom:1}},
  provenance:{authority:'ENGINE_AUTHORING',source:src,sourceSha256:createHash('sha256').update(bytes).digest('hex'),sourceSize:[W,H],
    modelKind:'visible-source-2.5D-texture-mesh',sourcePxPerModelUnit:UNITS,originPx:origin,sourceImageModified:false,gameplayApplied:false,
    regions:vertexRegions,triangleRegions,tailControlPointsPx:tail,tailHalfWidthsPx:tailWidths,
    extraction:{macroCell:64,minCell:16,broadUniformBodyMinCell:32,narrowBoundaryMinCell:4,boundaryPolicy:'conservative-inside source-mask edge bisection; mixed leaves retained as UV triangles',regionPolicy:'authored region classification at adaptive-cell center',edgeIterations:12,sourceCoordinatePrecisionPx:.0001,neutralChromaTolerance:2,darkThreshold:29,brightThreshold:70,minIslandPixels:20,bodyInteriorPolygonsPx:interiors,maskReasons},
    tailAuthoring:{prepareLocalAmplitudeRad:.065,sweepLocalAmplitudeRad:-.10,prepareDecaySegments:7,sweepDecaySegments:6,reason:'Reduce accumulated child rotation to retain visible pelvis-behind-legs-left-bottom source trajectory'},
    distalPivotCompensation:{authority:'ENGINE_AUTHORING',boneId:distalPivotBone,bindPivotSourcePx:tail[9],
      keyTimes:times,translationUnits:'model-unit',rotationUnits:'radians',
      formula:'localT=R(-parentWorldZ)*(bindPivotWorldXY-parentWorldXY)-bindLocalT; localZ=originalTail9LocalZ-parentWorldZ',
      preservedRelativeBend:'tail9 original local bend in fixed-pivot world frame; tail10..15 original local rotations unchanged',
      interpolation:'ordinary existing key translation lerp/quaternion slerp; pivot exact at keys, no continuous runtime constraint',
      proximalTailUnchanged:true,bonesAdded:0,hiddenTextureCreated:false},
    tailContinuity:{authority:'ENGINE_AUTHORING',visibleCurlPolygonPx:visibleTailCurl,seamBlendPx,
      visibleLowerCurlPolicy:'after unchanged leg classification: y>1000&&x<300 || y>1108&&x<430; classification only on existing source mask',
      sourceSpineMarginPx:{above820:12,below820:32},
      anchorPriority:['leftLeg','rightLeg'],legCutCapBoundsPx:legCutCapBounds,
      freeCurlPolicy:'y>1000&&x<300 || y>1108&&x<430 retains original tail-chain weights; generic axe/torso/arm anchors excluded',
      seamAnchors:seamAnchors.map(({source,region})=>({sourcePx:source,region})),
      seamAnchorCount:seamAnchors.length,influencedTailVertices,pinnedTailVertices,
      formula:'tailAmount=smoothstep(0,32,distance-to-nearest-coincident-source-seam); weights=(1-tailAmount)*unchanged-occluder-weights+tailAmount*original-tail-weights',
      occluderWeightsChanged:false,hiddenTextureCreated:false,geometryBridgeCreated:false,
      residual:'Only visible source islands are skinned. Hidden leg/hand-occluded texture remains unavailable; public pose review must judge thinning/self-intersection.'},
    phases:[{name:'준비',start:0,end:.65},{name:'휩쓸기',start:.65,end:1.08},{name:'회복',start:1.08,end:1.8},{name:'대기',start:1.8,end:3}],
    sourceGap:'SOURCE GAP / 숨은 면 미확보: Tail segments occluded by the two legs and right hand have no independent texture in the source; only visible islands are meshed. No hidden surface reconstruction.',
    footSupportPx:{left:[354,1076],right:[621,1120]},footPolicy:'Static pelvis/leg tracks; source perspective offsets preserved, no native physical ground claim',
    nativeCombatUntouched:{cooldownGameFrames:110,independentProjectileLifeGameFrames:200,attackWindow:[.15,.85],recoverLiveGameFrames:30,recoveryMetadataGameFrames:50},
  }};
const compact=JSON.stringify(project),compactBytes=new TextEncoder().encode(compact).length;
if(compactBytes>2*1024*1024)throw Error(`Rig exceeds existing 2MiB JSON limit: ${compactBytes} bytes`);
const pretty=JSON.stringify(project,null,2),published=new TextEncoder().encode(pretty).length<=2*1024*1024?pretty:compact;
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,'hell-aberrant-motion.rig.json'),published);
await fs.writeFile(path.join(out,'mesh.json'),JSON.stringify(project.mesh));
await fs.writeFile(path.join(out,'skeleton.json'),JSON.stringify(project.skeleton,null,2));
await fs.writeFile(path.join(out,'clips.json'),JSON.stringify(project.clips,null,2));
await fs.mkdir(path.join(repo,'tools/fdg-studio/fixtures'),{recursive:true});
await fs.writeFile(path.join(repo,'tools/fdg-studio/fixtures/hell-aberrant-motion.rig.json'),compact);
console.log(JSON.stringify({vertices:vertices.length,triangles:triangles.length,bones:skeleton.bones.length,regions:Object.fromEntries(Object.keys(layers).map(name=>[name,vertexRegions.filter(v=>v===name).length])),bytes:compactBytes}));

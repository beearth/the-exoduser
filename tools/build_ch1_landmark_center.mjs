import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const OUT=path.join(ROOT,'assets','map','ch1','baked_spike','outer_mass');
const manifest=JSON.parse(readFileSync(path.join(OUT,'composition.json'),'utf8'));
const geometryPath=path.join(ROOT,...manifest.geometrySource.split('/'));
const baseMaster=path.join(OUT,'large_medium','CH1_OUTER_LARGE_MEDIUM_MASTER.png');
const phaseDir=path.join(OUT,manifest.landmarkCenter.directory);
const masterPath=path.join(phaseDir,'CH1_LANDMARK_CENTER_MASTER.png');
const SIZE=8192;
sharp.concurrency(2);

const source=relative=>path.join(ROOT,...relative.split('/'));
async function assetLayer({file,left,top,width,height,rotate=0,flip=false,brightness=.52,saturation=.55,opacity=.28,blur=.4}){
  let image=sharp(source(file)).ensureAlpha();
  if(flip)image=image.flop();
  if(rotate)image=image.rotate(rotate,{background:{r:0,g:0,b:0,alpha:0}});
  image=image.resize({width,height,fit:'fill'}).modulate({brightness,saturation});
  if(blur>0)image=image.blur(blur);
  image=image.linear([1,1,1,opacity],[0,0,0,0]);
  return{input:await image.png().toBuffer(),left,top,blend:'over'};
}

// Ground-only identity. No vertical landmark, gameplay prop, or collider is created here.
const groundSvg=Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg">
 <defs><filter id="soft"><feGaussianBlur stdDeviation="18"/></filter></defs>
 <g filter="url(#soft)">
  <path d="M3070 3050C3200 2850 3510 2840 3700 3030C3890 3210 3750 3430 3470 3460C3190 3490 2910 3310 3070 3050Z" fill="#382029" opacity=".48"/>
  <path d="M1700 4710C1880 4580 2200 4630 2300 4870C2370 5070 2070 5200 1800 5080C1580 4980 1510 4840 1700 4710Z" fill="#39271c" opacity=".30"/>
  <path d="M5770 3370C5980 3240 6320 3300 6460 3520C6550 3700 6330 3870 6030 3780C5770 3700 5580 3490 5770 3370Z" fill="#41212d" opacity=".34"/>
  <path d="M1660 5760C1870 5600 2240 5650 2390 5930C2480 6160 2180 6330 1850 6210C1580 6110 1450 5920 1660 5760Z" fill="#203d2d" opacity=".38"/>
  <path d="M5740 5190C5940 5010 6300 5060 6470 5310C6570 5540 6310 5710 6010 5610C5720 5510 5540 5370 5740 5190Z" fill="#3d2231" opacity=".36"/>
 </g>
 <g fill="none" stroke-linecap="round">
  <path d="M3340 3200C3490 3100 3600 3020 3730 2900M3380 3260C3570 3340 3690 3420 3830 3540" stroke="#55313b" stroke-width="34" opacity=".30"/>
  <path d="M1960 6040C1810 5930 1690 5840 1580 5740M2020 6080C2180 6150 2300 6250 2410 6360" stroke="#31563a" stroke-width="38" opacity=".30"/>
  <path d="M6040 5440C5900 5340 5790 5250 5650 5150M6100 5490C6260 5570 6380 5660 6500 5770" stroke="#543044" stroke-width="35" opacity=".28"/>
 </g>
</svg>`);

const placements=[
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:2940,top:2870,width:760,height:650,rotate:-11,opacity:.18,brightness:.5,saturation:.48},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:3070,top:2920,width:650,height:560,rotate:18,flip:true,opacity:.13,brightness:.48,saturation:.5},
  {file:'assets/map/ch1/floor_objects/prop_g_battle.png',left:1610,top:4620,width:700,height:570,rotate:-8,opacity:.15,brightness:.58,saturation:.48},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:5710,top:3310,width:700,height:590,rotate:13,opacity:.14,brightness:.5,saturation:.52},
  {file:'assets/map/ch1/floor_objects/prop_g_toxic.png',left:1540,top:5650,width:850,height:750,rotate:-7,flip:true,opacity:.18,brightness:.55,saturation:.72},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:5660,top:5050,width:850,height:730,rotate:16,flip:true,opacity:.15,brightness:.51,saturation:.58},
];

const geometryContext={};geometryContext.globalThis=geometryContext;
vm.runInNewContext(readFileSync(geometryPath,'utf8'),geometryContext,{filename:geometryPath});
const geometryMask=geometryContext.CH1_SI1_GEOMETRY.buildMask(),walkableRects=[];
for(let y=0;y<200;y++)for(let x=0;x<200;x++)if(geometryMask[y*200+x])walkableRects.push(`<rect x="${x*40}" y="${y*40}" width="40" height="40"/>`);
const walkableAlpha=await sharp(Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg"><g fill="#fff">${walkableRects.join('')}</g></svg>`)).png().toBuffer();

// Explicit holes protect the combat void, travel compression, both tree bypasses, and boss approach.
const protectionAlpha=await sharp(Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg">
 <defs><mask id="protect">
  <rect width="8192" height="8192" fill="#fff"/>
  <g fill="#000">
   <ellipse cx="4600" cy="6320" rx="520" ry="430"/>
   <ellipse cx="3440" cy="4400" rx="370" ry="320"/>
   <ellipse cx="3000" cy="3200" rx="150" ry="180"/>
   <ellipse cx="4160" cy="3280" rx="190" ry="190"/>
   <ellipse cx="4400" cy="1520" rx="360" ry="300"/>
  </g>
 </mask></defs>
 <rect width="8192" height="8192" fill="#fff" mask="url(#protect)"/>
</svg>`)).png().toBuffer();

const layers=[];
for(const item of placements)layers.push(await assetLayer(item));
const groundRaw=await sharp(groundSvg).ensureAlpha().composite(layers).png().toBuffer();
const groundMasked=await sharp(groundRaw).composite([
  {input:walkableAlpha,blend:'dest-in'},
  {input:protectionAlpha,blend:'dest-in'},
]).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();

mkdirSync(phaseDir,{recursive:true});
await sharp(baseMaster).ensureAlpha().composite([{input:groundMasked,blend:'over'}]).png({compressionLevel:9,adaptiveFiltering:true}).toFile(masterPath);

for(const id of manifest.chunks){
  const [x,y]=id.split(',').map(Number),sx=x*1024,sy=y*1024;
  const left=Math.max(0,sx-1),top=Math.max(0,sy-1),right=Math.min(SIZE,sx+1025),bottom=Math.min(SIZE,sy+1025);
  let image=sharp(masterPath).extract({left,top,width:right-left,height:bottom-top});
  image=image.extend({left:sx===0?1:0,right:x===7?1:0,top:sy===0?1:0,bottom:y===7?1:0,extendWith:'copy'});
  await image.png({compressionLevel:9,adaptiveFiltering:true}).toFile(path.join(phaseDir,`chunk_${x}_${y}.png`));
}

const captureDir=path.join(ROOT,'captures','ch1_landmark_center_20260830','AFTER');
mkdirSync(captureDir,{recursive:true});
await sharp(masterPath).flatten({background:'#030405'}).resize({width:2048}).jpeg({quality:91}).toFile(path.join(captureDir,'01_LANDMARK_CENTER_MASTER_OVERVIEW.jpg'));
console.log(JSON.stringify({master:masterPath,chunks:manifest.chunks.length,landmarks:placements.length,newVerticalProps:0,geometryChanged:false,collisionChanged:false,routeChanged:false},null,2));

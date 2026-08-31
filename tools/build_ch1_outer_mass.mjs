import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const OUT=path.join(ROOT,'assets','map','ch1','baked_spike','outer_mass');
const manifest=JSON.parse(readFileSync(path.join(OUT,'composition.json'),'utf8'));
const geometryPath=path.join(ROOT,...manifest.geometrySource.split('/'));
const SIZE=8192;
sharp.concurrency(2);

const source=relative=>path.join(ROOT,...relative.split('/'));
async function assetLayer({file,left,top,width,height,rotate=0,flip=false,brightness=.45,saturation=.5,opacity=1,blur=0}){
  let image=sharp(source(file)).ensureAlpha();
  if(flip)image=image.flop();
  if(rotate)image=image.rotate(rotate,{background:{r:0,g:0,b:0,alpha:0}});
  image=image.resize({width,height,fit:'fill'}).modulate({brightness,saturation});
  if(blur>0)image=image.blur(blur);
  image=image.linear([1,1,1,opacity],[0,0,0,0]);
  const cropLeft=Math.max(0,-left),cropTop=Math.max(0,-top),targetLeft=Math.max(0,left),targetTop=Math.max(0,top);
  const cropWidth=Math.min(width-cropLeft,SIZE-targetLeft),cropHeight=Math.min(height-cropTop,SIZE-targetTop);
  if(cropWidth<=0||cropHeight<=0)return null;
  image=image.extract({left:cropLeft,top:cropTop,width:cropWidth,height:cropHeight});
  return{input:await image.png().toBuffer(),left:targetLeft,top:targetTop,blend:'over'};
}
async function makeLayers(items){
  const out=[];for(const item of items){const layer=await assetLayer(item);if(layer)out.push(layer)}return out;
}

const backSvg=Buffer.from(`
<svg width="8192" height="8192" viewBox="0 0 8192 8192" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <radialGradient id="deep"><stop offset="0" stop-color="#171319"/><stop offset=".55" stop-color="#0c0d0f"/><stop offset="1" stop-color="#030506"/></radialGradient>
  <linearGradient id="left" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#050707"/><stop offset=".58" stop-color="#171219"/><stop offset="1" stop-color="#251720"/></linearGradient>
  <linearGradient id="right" x1="1" y1="0" x2="0" y2="0"><stop stop-color="#030506"/><stop offset=".56" stop-color="#121014"/><stop offset="1" stop-color="#24151e"/></linearGradient>
  <linearGradient id="north" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#020304"/><stop offset=".74" stop-color="#181117"/><stop offset="1" stop-color="#2a171e"/></linearGradient>
 </defs>
 <rect width="8192" height="8192" fill="url(#deep)"/>
 <path d="M0 0H3300C2920 660 3160 1180 2730 1770C2360 2310 2670 2870 2140 3440C1750 4020 2110 4630 1510 5250C1120 5790 1580 6470 980 7160L0 8192Z" fill="url(#left)" opacity=".3"/>
 <path d="M8192 0H4930C5320 620 5070 1200 5500 1700C5940 2250 5600 2820 6210 3440C6620 3920 6170 4510 6880 5160C7270 5630 6850 6380 7520 7100L8192 8192Z" fill="url(#right)" opacity=".32"/>
 <path d="M0 0H8192V1030C7300 1280 6520 780 5680 1200C4920 1570 4180 980 3370 1320C2480 1680 1740 1110 0 1510Z" fill="url(#north)" opacity=".28"/>
 <g fill="none" stroke-linecap="round">
  <path d="M-200 1250C900 620 1700 1660 2780 930S4780 1240 5840 600S7460 1220 8420 520" stroke="#31202a" stroke-width="52" opacity=".1"/>
  <path d="M-250 3320C980 2670 1720 3700 2830 3030S4670 3420 5830 2810S7480 3560 8460 2990" stroke="#19191c" stroke-width="74" opacity=".16"/>
  <path d="M-180 5570C1040 4920 1900 6060 3120 5230S4880 5900 6110 5070S7600 5880 8410 5280" stroke="#38232e" stroke-width="58" opacity=".09"/>
  <path d="M-100 7550C1210 6830 2240 7940 3480 7180S5590 7870 6940 6980S7800 7420 8390 7140" stroke="#131619" stroke-width="86" opacity=".18"/>
 </g>
</svg>`);

// BACK: deep cropped silhouettes. They establish volume but are intentionally low-detail.
const BACK=[
  {file:'assets/map/ch1/collision/bound_n.png',left:-350,top:-170,width:2850,height:1120,brightness:.27,saturation:.38,opacity:.72,blur:1.6},
  {file:'assets/map/ch1/collision/bound_n.png',left:1650,top:-260,width:2780,height:1160,flip:true,brightness:.25,saturation:.35,opacity:.69,blur:1.8},
  {file:'assets/map/ch1/collision/bound_n.png',left:3670,top:-150,width:2680,height:1090,brightness:.29,saturation:.4,opacity:.7,blur:1.5},
  {file:'assets/map/ch1/collision/bound_n.png',left:5700,top:-210,width:2920,height:1190,flip:true,brightness:.24,saturation:.34,opacity:.74,blur:1.8},
  {file:'assets/map/ch1/collision/bound_w.png',left:-230,top:520,width:1180,height:3000,brightness:.26,saturation:.37,opacity:.75,blur:1.5},
  {file:'assets/map/ch1/collision/bound_w.png',left:-130,top:2740,width:1260,height:3090,flip:true,brightness:.25,saturation:.35,opacity:.73,blur:1.8},
  {file:'assets/map/ch1/collision/bound_w.png',left:-260,top:5200,width:1340,height:3200,brightness:.23,saturation:.34,opacity:.78,blur:1.7},
  {file:'assets/map/ch1/collision/bound_e.png',left:7250,top:430,width:1190,height:3060,brightness:.23,saturation:.34,opacity:.79,blur:1.7},
  {file:'assets/map/ch1/collision/bound_e.png',left:7100,top:2740,width:1270,height:3210,flip:true,brightness:.26,saturation:.36,opacity:.76,blur:1.6},
  {file:'assets/map/ch1/collision/bound_e.png',left:7160,top:5300,width:1280,height:3060,brightness:.22,saturation:.33,opacity:.8,blur:1.9},
  {file:'assets/map/ch1/collision/bound_s.png',left:-360,top:7160,width:2900,height:1190,brightness:.27,saturation:.38,opacity:.72,blur:1.6},
  {file:'assets/map/ch1/collision/bound_s.png',left:1710,top:7220,width:2700,height:1130,flip:true,brightness:.25,saturation:.35,opacity:.7,blur:1.8},
  {file:'assets/map/ch1/collision/bound_s.png',left:3710,top:7130,width:2740,height:1200,brightness:.28,saturation:.37,opacity:.72,blur:1.5},
  {file:'assets/map/ch1/collision/bound_s.png',left:5730,top:7190,width:2860,height:1160,flip:true,brightness:.24,saturation:.34,opacity:.74,blur:1.8},
  {file:'assets/map/ch1/collision/corner_nw.png',left:450,top:450,width:2300,height:2050,brightness:.29,saturation:.4,opacity:.62,blur:1.4},
  {file:'assets/map/ch1/collision/corner_ne.png',left:5540,top:390,width:2350,height:2070,flip:true,brightness:.28,saturation:.39,opacity:.64,blur:1.5},
  {file:'assets/map/ch1/collision/corner_sw.png',left:380,top:5860,width:2440,height:2220,flip:true,brightness:.27,saturation:.38,opacity:.66,blur:1.6},
  {file:'assets/map/ch1/collision/corner_se.png',left:5450,top:5840,width:2520,height:2250,brightness:.25,saturation:.35,opacity:.68,blur:1.7}
];

// LARGE: 30–50% overlap. Repeated source silhouettes are cropped, flipped, scaled, and buried.
const LARGE=[
  {file:'assets/map/ch1/collision/corner_sw.png',left:-360,top:1240,width:2600,height:1900,rotate:-5,brightness:.46,saturation:.54,opacity:.82},
  {file:'assets/map/ch1/collision/bound_n.png',left:720,top:2120,width:2760,height:1020,rotate:-18,flip:true,brightness:.43,saturation:.5,opacity:.8},
  {file:'assets/map/ch1/collision/mega_ribs.png',left:-160,top:2860,width:2420,height:1220,flip:true,rotate:-8,brightness:.36,saturation:.4,opacity:.62,blur:.8},
  {file:'assets/map/ch1/collision/corner_nw.png',left:310,top:3600,width:2420,height:2100,flip:true,rotate:7,brightness:.44,saturation:.52,opacity:.82},
  {file:'assets/map/ch1/collision/corner_sw.png',left:-250,top:5000,width:2740,height:2050,rotate:-6,brightness:.45,saturation:.52,opacity:.84},
  {file:'assets/map/ch1/collision/bound_s.png',left:610,top:6200,width:2780,height:1160,flip:true,rotate:8,brightness:.4,saturation:.46,opacity:.78},
  {file:'assets/map/ch1/collision/corner_ne.png',left:5960,top:1040,width:2470,height:2180,rotate:6,brightness:.46,saturation:.55,opacity:.84},
  {file:'assets/map/ch1/collision/bound_e.png',left:6360,top:2200,width:1580,height:3340,flip:true,brightness:.42,saturation:.5,opacity:.82},
  {file:'assets/map/ch1/collision/corner_se.png',left:5650,top:3000,width:2730,height:2320,flip:true,rotate:-5,brightness:.45,saturation:.52,opacity:.86},
  {file:'assets/map/ch1/collision/mega_head.png',left:6500,top:3880,width:1980,height:1460,rotate:9,brightness:.34,saturation:.39,opacity:.6,blur:.7},
  {file:'assets/map/ch1/collision/corner_ne.png',left:5690,top:4740,width:2650,height:2230,flip:true,rotate:8,brightness:.44,saturation:.51,opacity:.83},
  {file:'assets/map/ch1/collision/corner_se.png',left:5880,top:6070,width:2520,height:2050,rotate:-7,brightness:.43,saturation:.49,opacity:.82},
  {file:'assets/map/ch1/collision/bound_n.png',left:980,top:210,width:2780,height:1080,rotate:5,brightness:.45,saturation:.52,opacity:.82},
  {file:'assets/map/ch1/collision/corner_nw.png',left:2540,top:20,width:2250,height:2020,flip:true,rotate:-4,brightness:.43,saturation:.49,opacity:.78},
  {file:'assets/map/ch1/collision/bound_n.png',left:4010,top:180,width:2820,height:1100,flip:true,rotate:-4,brightness:.44,saturation:.5,opacity:.8},
  {file:'assets/map/ch1/collision/mega_ribs.png',left:4610,top:500,width:2450,height:1210,rotate:11,brightness:.35,saturation:.39,opacity:.58,blur:.8},
  {file:'assets/map/ch1/collision/cursed_tree_03.png',left:6030,top:1620,width:1450,height:2060,flip:true,brightness:.31,saturation:.4,opacity:.5,blur:.6},
  {file:'assets/map/ch1/collision/cursed_tree_11.png',left:6650,top:5150,width:1320,height:1880,brightness:.3,saturation:.39,opacity:.48,blur:.7},
  {file:'assets/map/ch1/collision/corner_sw.png',left:1160,top:6520,width:2470,height:1780,flip:true,rotate:6,brightness:.42,saturation:.48,opacity:.8},
  {file:'assets/map/ch1/collision/corner_se.png',left:3480,top:6510,width:2590,height:1820,rotate:-5,brightness:.44,saturation:.5,opacity:.81},
  {file:'assets/map/ch1/collision/bound_s.png',left:5230,top:6580,width:2810,height:1160,flip:true,rotate:6,brightness:.41,saturation:.47,opacity:.79}
];

// MEDIUM only conceals junctions; no small bones, pods, or prop_s assets are allowed.
const MEDIUM=[
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:950,top:1980,width:1820,height:900,rotate:-14,brightness:.5,saturation:.5,opacity:.66},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:1190,top:2860,width:1540,height:1240,rotate:17,flip:true,brightness:.48,saturation:.54,opacity:.58},
  {file:'assets/map/ch1/collision/prop_rib.png',left:520,top:3850,width:1420,height:1530,rotate:-13,brightness:.39,saturation:.43,opacity:.56},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:790,top:4970,width:1900,height:920,rotate:12,flip:true,brightness:.49,saturation:.5,opacity:.65},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:1050,top:5840,width:1580,height:1320,rotate:-16,brightness:.46,saturation:.48,opacity:.56},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:5380,top:1320,width:1840,height:900,rotate:13,flip:true,brightness:.49,saturation:.52,opacity:.65},
  {file:'assets/map/ch1/collision/prop_rootcage.png',left:6330,top:2260,width:1460,height:1540,rotate:9,brightness:.4,saturation:.47,opacity:.58},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:5790,top:3350,width:1600,height:1320,flip:true,rotate:15,brightness:.47,saturation:.5,opacity:.57},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:5540,top:4450,width:1900,height:920,rotate:-10,brightness:.5,saturation:.51,opacity:.66},
  {file:'assets/map/ch1/collision/prop_rib.png',left:6290,top:5350,width:1430,height:1520,flip:true,rotate:14,brightness:.4,saturation:.44,opacity:.55},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:5160,top:6150,width:1640,height:1330,rotate:-18,brightness:.47,saturation:.52,opacity:.57},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:1560,top:560,width:1840,height:900,rotate:8,brightness:.5,saturation:.52,opacity:.65},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:3260,top:350,width:1600,height:1300,flip:true,rotate:-12,brightness:.47,saturation:.51,opacity:.56},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:4770,top:600,width:1850,height:890,rotate:-7,flip:true,brightness:.49,saturation:.5,opacity:.64},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:1800,top:6530,width:1880,height:910,rotate:-8,brightness:.49,saturation:.49,opacity:.64},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:3370,top:6740,width:1640,height:1250,rotate:10,flip:true,brightness:.45,saturation:.47,opacity:.54},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:4660,top:6500,width:1910,height:930,rotate:11,flip:true,brightness:.5,saturation:.5,opacity:.65}
];

const groundConnectionSvg=Buffer.from(`
<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg">
 <g fill="none" stroke-linecap="round">
  <path d="M3280 300C2860 1050 2510 1600 2360 2260S1770 3500 1390 4220S1080 5800 2700 6760" stroke="#050607" stroke-width="100" opacity=".28"/>
  <path d="M4920 310C5290 940 5700 1550 5890 2230S6470 3540 6770 4230S7060 5740 5500 6770" stroke="#060608" stroke-width="110" opacity=".3"/>
  <path d="M1260 6900C2440 6500 3130 7090 4110 6760S5910 7000 6970 6500" stroke="#23151d" stroke-width="76" opacity=".14"/>
  <path d="M1230 1510C2350 970 3100 1470 4100 1190S5890 1450 7020 930" stroke="#2c1b23" stroke-width="68" opacity=".12"/>
 </g>
</svg>`);

const geometryContext={};geometryContext.globalThis=geometryContext;
vm.runInNewContext(readFileSync(geometryPath,'utf8'),geometryContext,{filename:geometryPath});
const geometryMask=geometryContext.CH1_SI1_GEOMETRY.buildMask(),rects=[];
for(let y=0;y<200;y++)for(let x=0;x<200;x++)if(!geometryMask[y*200+x])rects.push(`<rect x="${x*40}" y="${y*40}" width="40" height="40"/>`);
const geometryAlpha=await sharp(Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg"><g fill="#fff">${rects.join('')}</g><rect x="8000" width="192" height="8192"/><rect y="8000" width="8192" height="192"/></svg>`)).blur(manifest.geometryEdgeBlendPx).png().toBuffer();

const largeDir=path.join(OUT,'large'),mediumDir=path.join(OUT,'large_medium');
mkdirSync(largeDir,{recursive:true});mkdirSync(mediumDir,{recursive:true});
const largeMaster=path.join(largeDir,'CH1_OUTER_LARGE_MASTER.png');
const mediumMaster=path.join(mediumDir,'CH1_OUTER_LARGE_MEDIUM_MASTER.png');
const backLayers=await makeLayers(BACK),largeLayers=await makeLayers(LARGE);
const largeOrganic=await sharp(backSvg).composite([...backLayers,...largeLayers]).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();
await sharp(largeOrganic).ensureAlpha().composite([{input:geometryAlpha,blend:'dest-in'}]).png({compressionLevel:9,adaptiveFiltering:true}).toFile(largeMaster);

const mediumLayers=await makeLayers(MEDIUM.map(item=>({...item,brightness:item.brightness*.88,opacity:item.opacity*.52})));
const mediumOrganic=await sharp(largeOrganic).composite([...mediumLayers,{input:groundConnectionSvg,left:0,top:0,blend:'over'}]).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();
await sharp(mediumOrganic).ensureAlpha().composite([{input:geometryAlpha,blend:'dest-in'}]).png({compressionLevel:9,adaptiveFiltering:true}).toFile(mediumMaster);

async function extractChunks(masterPath,dir){
  for(const id of manifest.chunks){
    const [x,y]=id.split(',').map(Number),sx=x*1024,sy=y*1024;
    const left=Math.max(0,sx-1),top=Math.max(0,sy-1),right=Math.min(SIZE,sx+1025),bottom=Math.min(SIZE,sy+1025);
    let image=sharp(masterPath).extract({left,top,width:right-left,height:bottom-top});
    image=image.extend({left:sx===0?1:0,right:x===7?1:0,top:sy===0?1:0,bottom:y===7?1:0,extendWith:'copy'});
    await image.png({compressionLevel:9,adaptiveFiltering:true}).toFile(path.join(dir,`chunk_${x}_${y}.png`));
  }
}
await extractChunks(largeMaster,largeDir);await extractChunks(mediumMaster,mediumDir);

const captureDir=path.join(ROOT,'captures','ch1_outer_mass_first_20260829','MASTERS');mkdirSync(captureDir,{recursive:true});
await sharp(largeMaster).flatten({background:'#030405'}).resize({width:2048}).jpeg({quality:90}).toFile(path.join(captureDir,'02_LARGE_MASS_MASTER_OVERVIEW.jpg'));
await sharp(mediumMaster).flatten({background:'#030405'}).resize({width:2048}).jpeg({quality:90}).toFile(path.join(captureDir,'03_LARGE_MEDIUM_MASTER_OVERVIEW.jpg'));
console.log(JSON.stringify({masters:[largeMaster,mediumMaster],chunks:manifest.chunks.length,layers:{back:BACK.length,large:LARGE.length,medium:MEDIUM.length,small:0},geometry:geometryPath},null,2));

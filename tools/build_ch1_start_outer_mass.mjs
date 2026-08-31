import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const OUT=path.join(ROOT,'assets','map','ch1','baked_start_outer');
const manifest=JSON.parse(readFileSync(path.join(OUT,'composition.json'),'utf8'));
const SIZE=8192;
sharp.concurrency(2);

const source=relative=>path.join(ROOT,...relative.split('/'));
async function assetLayer({file,left,top,width,height,rotate=0,flip=false,brightness=.45,saturation=.48,opacity=1,blur=0}){
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
async function makeLayers(items){const out=[];for(const item of items){const layer=await assetLayer(item);if(layer)out.push(layer)}return out;}

const backSvg=Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <linearGradient id="L"><stop stop-color="#020404"/><stop offset=".58" stop-color="#0c0c0e"/><stop offset="1" stop-color="#27161e"/></linearGradient>
  <linearGradient id="R" x1="1" x2="0"><stop stop-color="#020304"/><stop offset=".55" stop-color="#0b0b0d"/><stop offset="1" stop-color="#23141d"/></linearGradient>
  <linearGradient id="N" y1="0" y2="1"><stop stop-color="#010203"/><stop offset=".65" stop-color="#0c0b0d"/><stop offset="1" stop-color="#2a171e"/></linearGradient>
  <linearGradient id="S" y1="1" y2="0"><stop stop-color="#020304"/><stop offset=".6" stop-color="#0d0c0e"/><stop offset="1" stop-color="#24151d"/></linearGradient>
 </defs>
 <path d="M0 0H1260C1120 620 1440 1160 1120 1760C870 2280 1300 2840 980 3400C730 3920 1210 4460 940 5060C700 5600 1230 6220 1050 6800C930 7240 1200 7700 1390 8192H0Z" fill="url(#L)"/>
 <path d="M8192 0H6700C6880 650 6540 1210 6880 1800C7150 2310 6720 2920 7040 3470C7240 3990 6840 4560 7140 5120C7340 5610 6880 6260 7040 6830C7180 7290 6910 7780 6670 8192H8192Z" fill="url(#R)"/>
 <path d="M0 0H3480C3330 260 3420 590 3160 940C2760 1280 2250 1070 1770 1190C1250 1320 720 1040 0 1430ZM4710 0H8192V1420C7500 1090 6980 1320 6440 1170C5920 1030 5410 1270 5050 900C4800 640 4890 310 4710 0Z" fill="url(#N)"/>
 <path d="M0 8192H3480C3330 7900 3440 7540 3160 7240C2760 6910 2260 7120 1770 6980C1220 6830 690 7160 0 6780ZM4710 8192H8192V6770C7510 7100 6960 6840 6430 7010C5910 7170 5410 6930 5050 7280C4790 7550 4890 7890 4710 8192Z" fill="url(#S)"/>
 <g fill="none" stroke-linecap="round">
  <path d="M1110 300C850 1150 1230 2050 930 3000S1210 4900 900 5900S1110 7240 1320 7820" stroke="#38232d" stroke-width="92" opacity=".22"/>
 <path d="M6880 260C7160 1140 6780 2070 7070 3020S6790 4920 7100 5850S6900 7200 6670 7850" stroke="#311f29" stroke-width="104" opacity=".24"/>
  <path d="M250 1190C1120 850 1910 1320 2740 930M5460 930C6320 1320 7080 840 7990 1190" stroke="#472832" stroke-width="76" opacity=".18"/>
  <path d="M250 6990C1120 7330 1910 6860 2740 7240M5460 7240C6320 6870 7080 7350 7990 6990" stroke="#3c222c" stroke-width="82" opacity=".18"/>
 </g>
</svg>`);

const BACK=[
  {file:'assets/map/ch1/collision/bound_n.png',left:-240,top:-180,width:2900,height:1160,brightness:.25,saturation:.34,opacity:.76,blur:1.6},
  {file:'assets/map/ch1/collision/bound_n.png',left:1850,top:-220,width:2500,height:1100,flip:true,brightness:.24,saturation:.33,opacity:.72,blur:1.7},
  {file:'assets/map/ch1/collision/bound_n.png',left:3900,top:-180,width:2540,height:1120,brightness:.25,saturation:.34,opacity:.73,blur:1.6},
  {file:'assets/map/ch1/collision/bound_n.png',left:5850,top:-230,width:2700,height:1160,flip:true,brightness:.23,saturation:.32,opacity:.77,blur:1.8},
  {file:'assets/map/ch1/collision/bound_w.png',left:-260,top:460,width:1200,height:3100,brightness:.24,saturation:.34,opacity:.78,blur:1.7},
  {file:'assets/map/ch1/collision/bound_w.png',left:-180,top:2730,width:1250,height:3180,flip:true,brightness:.23,saturation:.33,opacity:.76,blur:1.8},
  {file:'assets/map/ch1/collision/bound_w.png',left:-250,top:5200,width:1310,height:3200,brightness:.22,saturation:.32,opacity:.8,blur:1.8},
  {file:'assets/map/ch1/collision/bound_e.png',left:7250,top:430,width:1190,height:3120,brightness:.22,saturation:.32,opacity:.8,blur:1.8},
  {file:'assets/map/ch1/collision/bound_e.png',left:7110,top:2740,width:1280,height:3220,flip:true,brightness:.24,saturation:.34,opacity:.78,blur:1.7},
  {file:'assets/map/ch1/collision/bound_e.png',left:7160,top:5260,width:1280,height:3160,brightness:.21,saturation:.31,opacity:.82,blur:1.9},
  {file:'assets/map/ch1/collision/bound_s.png',left:-260,top:7200,width:2880,height:1180,brightness:.24,saturation:.34,opacity:.76,blur:1.7},
  {file:'assets/map/ch1/collision/bound_s.png',left:1810,top:7220,width:2550,height:1140,flip:true,brightness:.23,saturation:.33,opacity:.73,blur:1.8},
  {file:'assets/map/ch1/collision/bound_s.png',left:3890,top:7200,width:2550,height:1160,brightness:.24,saturation:.34,opacity:.74,blur:1.7},
  {file:'assets/map/ch1/collision/bound_s.png',left:5840,top:7180,width:2750,height:1200,flip:true,brightness:.22,saturation:.32,opacity:.78,blur:1.9}
];

const LARGE=[
  {file:'assets/map/ch1/collision/corner_nw.png',left:-320,top:180,width:2300,height:2050,brightness:.43,saturation:.49,opacity:.84},
  {file:'assets/map/ch1/collision/corner_sw.png',left:-360,top:1550,width:2400,height:2130,rotate:-7,brightness:.42,saturation:.48,opacity:.83},
  {file:'assets/map/ch1/collision/mega_ribs.png',left:-180,top:3060,width:2100,height:1150,flip:true,rotate:-8,brightness:.34,saturation:.38,opacity:.62,blur:.7},
  {file:'assets/map/ch1/collision/corner_nw.png',left:-260,top:3940,width:2350,height:2070,flip:true,rotate:6,brightness:.42,saturation:.49,opacity:.84},
  {file:'assets/map/ch1/collision/corner_sw.png',left:-350,top:5480,width:2450,height:2180,rotate:-5,brightness:.43,saturation:.49,opacity:.85},
  {file:'assets/map/ch1/collision/corner_ne.png',left:6210,top:150,width:2320,height:2080,brightness:.44,saturation:.51,opacity:.86},
  {file:'assets/map/ch1/collision/corner_se.png',left:6120,top:1660,width:2420,height:2180,flip:true,rotate:6,brightness:.43,saturation:.5,opacity:.85},
  {file:'assets/map/ch1/collision/mega_head.png',left:6600,top:3150,width:1900,height:1420,rotate:8,brightness:.33,saturation:.38,opacity:.6,blur:.7},
  {file:'assets/map/ch1/collision/corner_ne.png',left:6100,top:4050,width:2440,height:2180,flip:true,rotate:-6,brightness:.42,saturation:.49,opacity:.84},
  {file:'assets/map/ch1/collision/corner_se.png',left:6060,top:5580,width:2500,height:2200,rotate:7,brightness:.44,saturation:.5,opacity:.86},
  {file:'assets/map/ch1/collision/bound_n.png',left:620,top:80,width:2740,height:1080,rotate:4,brightness:.43,saturation:.49,opacity:.82},
  {file:'assets/map/ch1/collision/corner_nw.png',left:2420,top:-40,width:2170,height:1940,flip:true,rotate:-5,brightness:.41,saturation:.47,opacity:.8},
  {file:'assets/map/ch1/collision/corner_ne.png',left:3710,top:-30,width:2200,height:1960,rotate:5,brightness:.42,saturation:.48,opacity:.81},
  {file:'assets/map/ch1/collision/bound_n.png',left:4880,top:70,width:2780,height:1090,flip:true,rotate:-4,brightness:.43,saturation:.49,opacity:.82},
  {file:'assets/map/ch1/collision/bound_s.png',left:540,top:6990,width:2800,height:1160,flip:true,rotate:-5,brightness:.41,saturation:.47,opacity:.81},
  {file:'assets/map/ch1/collision/corner_sw.png',left:2390,top:6480,width:2200,height:1940,rotate:5,brightness:.42,saturation:.48,opacity:.82},
  {file:'assets/map/ch1/collision/corner_se.png',left:3710,top:6480,width:2220,height:1960,flip:true,rotate:-4,brightness:.43,saturation:.49,opacity:.82},
  {file:'assets/map/ch1/collision/bound_s.png',left:4900,top:6990,width:2790,height:1170,rotate:5,brightness:.42,saturation:.48,opacity:.82},
  {file:'assets/map/ch1/collision/cursed_tree_03.png',left:220,top:1240,width:1920,height:1120,rotate:77,brightness:.31,saturation:.39,opacity:.5,blur:.5},
  {file:'assets/map/ch1/collision/cursed_tree_11.png',left:6510,top:4860,width:1320,height:2150,flip:true,rotate:-4,brightness:.34,saturation:.42,opacity:.58,blur:.4}
];

const MEDIUM=[
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:650,top:1120,width:1550,height:820,rotate:-13,brightness:.45,saturation:.48,opacity:.42},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:560,top:2540,width:1460,height:1190,rotate:16,flip:true,brightness:.43,saturation:.49,opacity:.4},
  {file:'assets/map/ch1/collision/prop_rib.png',left:420,top:3950,width:1320,height:1460,rotate:-12,brightness:.36,saturation:.4,opacity:.4},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:580,top:5450,width:1480,height:1230,rotate:14,brightness:.42,saturation:.46,opacity:.4},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:5980,top:1050,width:1580,height:830,rotate:12,flip:true,brightness:.45,saturation:.49,opacity:.42},
  {file:'assets/map/ch1/collision/prop_rootcage.png',left:6460,top:2420,width:1380,height:1480,rotate:8,brightness:.36,saturation:.42,opacity:.41},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:6030,top:4000,width:1500,height:1240,flip:true,rotate:-14,brightness:.42,saturation:.47,opacity:.4},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:6120,top:5480,width:1500,height:1220,rotate:-16,brightness:.43,saturation:.48,opacity:.4},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:1080,top:520,width:1620,height:820,rotate:7,brightness:.45,saturation:.48,opacity:.42},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:2460,top:300,width:1420,height:1160,flip:true,rotate:-11,brightness:.42,saturation:.47,opacity:.39},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:4320,top:300,width:1420,height:1160,rotate:12,brightness:.42,saturation:.47,opacity:.39},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:5660,top:520,width:1620,height:820,rotate:-7,flip:true,brightness:.45,saturation:.48,opacity:.42},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:1040,top:6820,width:1640,height:830,rotate:-7,brightness:.44,saturation:.47,opacity:.41},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:2440,top:6780,width:1450,height:1160,rotate:10,flip:true,brightness:.41,saturation:.45,opacity:.38},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:4320,top:6780,width:1450,height:1160,rotate:-10,brightness:.41,saturation:.45,opacity:.38},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:5620,top:6820,width:1640,height:830,rotate:8,flip:true,brightness:.44,saturation:.47,opacity:.41}
];

const outerMask=await sharp(Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg"><g fill="#fff">
 <path d="M0 0H1260C1120 620 1440 1160 1120 1760C870 2280 1300 2840 980 3400C730 3920 1210 4460 940 5060C700 5600 1230 6220 1050 6800C930 7240 1200 7700 1390 8192H0Z"/>
 <path d="M8192 0H6700C6880 650 6540 1210 6880 1800C7150 2310 6720 2920 7040 3470C7240 3990 6840 4560 7140 5120C7340 5610 6880 6260 7040 6830C7180 7290 6910 7780 6670 8192H8192Z"/>
 <path d="M0 0H3480C3330 260 3420 590 3160 940C2760 1280 2250 1070 1770 1190C1250 1320 720 1040 0 1430Z"/>
 <path d="M4710 0H8192V1420C7500 1090 6980 1320 6440 1170C5920 1030 5410 1270 5050 900C4800 640 4890 310 4710 0Z"/>
 <path d="M0 8192H3480C3330 7900 3440 7540 3160 7240C2760 6910 2260 7120 1770 6980C1220 6830 690 7160 0 6780Z"/>
 <path d="M4710 8192H8192V6770C7510 7100 6960 6840 6430 7010C5910 7170 5410 6930 5050 7280C4790 7550 4890 7890 4710 8192Z"/>
 </g></svg>`)).blur(18).png().toBuffer();

const groundConnection=Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg">
 <defs><filter id="soil"><feGaussianBlur stdDeviation="34"/></filter></defs>
 <g fill="none" stroke-linecap="round">
  <path d="M1190 180C1010 1050 1260 1880 960 2780S1160 4380 900 5350S1080 6820 1300 7900" stroke="#140d12" stroke-width="250" opacity=".34" filter="url(#soil)"/>
  <path d="M6820 140C7100 980 6710 1790 7040 2670S6790 4300 7130 5160S6900 6820 6680 7900" stroke="#120c13" stroke-width="320" opacity=".44" filter="url(#soil)"/>
  <path d="M1190 220C1010 1120 1260 2010 960 2920S1140 4680 910 5570S1090 7000 1300 7870" stroke="#1b1212" stroke-width="44" opacity=".14" stroke-dasharray="360 150 210 240"/>
  <path d="M6820 180C7090 1020 6720 1900 7040 2780S6800 4480 7130 5310S6910 6900 6690 7870" stroke="#191112" stroke-width="52" opacity=".17" stroke-dasharray="420 180 250 300"/>
  <path d="M1040 1720Q1440 1870 1710 2150M930 3550Q1380 3660 1640 3980M980 5650Q1390 5480 1730 5760" stroke="#211616" stroke-width="64" opacity=".18" filter="url(#soil)"/>
  <path d="M7040 1510Q6610 1700 6380 2020M7130 3740Q6650 3860 6390 4230M7040 5740Q6670 5570 6290 5910" stroke="#1d1414" stroke-width="76" opacity=".2" filter="url(#soil)"/>
  <path d="M120 1260C1060 920 1920 1260 2870 990M5300 930C6190 1260 7110 930 8060 1270" stroke="#140c10" stroke-width="220" opacity=".38" filter="url(#soil)"/>
  <path d="M140 6990C1040 7300 1840 6990 2790 7230M5480 7220C6340 6940 7180 7240 8080 6920" stroke="#130c10" stroke-width="150" opacity=".24" filter="url(#soil)"/>
 </g>
</svg>`);

mkdirSync(OUT,{recursive:true});
const backLayers=await makeLayers(BACK),largeLayers=await makeLayers(LARGE),mediumLayers=await makeLayers(MEDIUM);
const organic=await sharp(backSvg).ensureAlpha().composite([...backLayers,...largeLayers,...mediumLayers]).png().toBuffer();
const masterPath=path.join(OUT,'CH1_1_START_OUTER_MASTER.png');
const clipped=await sharp(organic).composite([{input:outerMask,blend:'dest-in'}]).png().toBuffer();
await sharp(clipped).composite([{input:groundConnection,blend:'over'}]).png({compressionLevel:9,adaptiveFiltering:true}).toFile(masterPath);

for(const id of manifest.chunks){
  const [x,y]=id.split(',').map(Number),sx=x*1024,sy=y*1024;
  const left=Math.max(0,sx-1),top=Math.max(0,sy-1),right=Math.min(SIZE,sx+1025),bottom=Math.min(SIZE,sy+1025);
  let image=sharp(masterPath).extract({left,top,width:right-left,height:bottom-top});
  image=image.extend({left:sx===0?1:0,right:x===7?1:0,top:sy===0?1:0,bottom:y===7?1:0,extendWith:'copy'});
  await image.png({compressionLevel:9,adaptiveFiltering:true}).toFile(path.join(OUT,`chunk_${x}_${y}.png`));
}

const captureDir=path.join(ROOT,'captures','ch1_1_outer_mass_recovery_20260830','MASTER');
mkdirSync(captureDir,{recursive:true});
await sharp(masterPath).flatten({background:'#050405'}).resize({width:2048}).jpeg({quality:92}).toFile(path.join(captureDir,'CH1_1_START_OUTER_MASTER_OVERVIEW.jpg'));
console.log(JSON.stringify({master:masterPath,chunks:manifest.chunks.length,layers:{back:BACK.length,large:LARGE.length,medium:MEDIUM.length,groundConnection:1,small:0}},null,2));

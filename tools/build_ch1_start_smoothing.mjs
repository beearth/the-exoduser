import sharp from 'sharp';
import {mkdirSync,readFileSync} from 'node:fs';
import path from 'node:path';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const OUT=path.join(ROOT,'assets','map','ch1','baked_start_smoothing');
const manifest=JSON.parse(readFileSync(path.join(OUT,'composition.json'),'utf8'));
const SIZE=8192,MASTER=path.join(OUT,'CH1_1_START_SMOOTHING_MASTER.png');
const source=relative=>path.join(ROOT,...relative.split('/'));
sharp.concurrency(2);
mkdirSync(OUT,{recursive:true});

async function assetLayer({file,left,top,width,height,rotate=0,flip=false,brightness=.62,saturation=.58,opacity=.16,blur=0}){
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

const EDGE_SMOOTH=[
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:410,top:970,width:1750,height:760,rotate:-13,opacity:.19,blur:2},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:380,top:2860,width:1620,height:880,rotate:10,flip:true,opacity:.17,blur:2},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:580,top:5180,width:1820,height:780,rotate:-8,opacity:.16,blur:2},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:6220,top:1120,width:1700,height:920,rotate:12,flip:true,opacity:.22,blur:2},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:6340,top:3000,width:1660,height:800,rotate:-11,opacity:.2,blur:2},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:6140,top:5340,width:1840,height:960,rotate:8,opacity:.23,blur:2},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:1510,top:420,width:1880,height:780,rotate:6,opacity:.16,blur:2},
  {file:'assets/map/ch1/floor_objects/prop_g_edge.png',left:4460,top:420,width:1900,height:760,rotate:-7,flip:true,opacity:.19,blur:2}
];

const CORNER_VARIATION=[
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:520,top:520,width:1780,height:1320,rotate:19,opacity:.16,brightness:.55},
  {file:'assets/map/ch1/floor_objects/prop_g_toxic.png',left:6190,top:350,width:1880,height:1500,rotate:-12,flip:true,opacity:.19,brightness:.42,saturation:.48},
  {file:'assets/map/ch1/floor_objects/prop_g_battle.png',left:350,top:6550,width:1760,height:1180,rotate:-6,opacity:.07,brightness:.72,saturation:.42},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:5850,top:6310,width:2200,height:1600,rotate:17,opacity:.2,brightness:.47,saturation:.5}
];

const TREE_BASIN=[
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:2680,top:3260,width:1060,height:690,rotate:-17,opacity:.25,brightness:.46,blur:3},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:3530,top:2840,width:1120,height:730,rotate:11,flip:true,opacity:.27,brightness:.43,blur:3},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:4460,top:3600,width:910,height:610,rotate:24,opacity:.23,brightness:.44,blur:3},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:3200,top:4010,width:1190,height:590,rotate:5,flip:true,opacity:.22,brightness:.47,blur:3}
];

const SIDE_CONNECTION=[
  {file:'assets/map/ch1/floor_objects/prop_g_battle.png',left:930,top:3520,width:1780,height:1320,rotate:-9,opacity:.27,brightness:.66,saturation:.4},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:5000,top:3600,width:1840,height:1080,rotate:6,flip:true,opacity:.24,brightness:.5},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:1120,top:1370,width:1840,height:1460,rotate:25,opacity:.28,brightness:.55},
  {file:'assets/map/ch1/floor_objects/prop_g_toxic.png',left:6320,top:1490,width:1180,height:820,rotate:-13,opacity:.2,brightness:.43,saturation:.46,blur:3},
  {file:'assets/map/ch1/floor_objects/prop_g_toxic.png',left:5850,top:5070,width:1260,height:850,rotate:18,flip:true,opacity:.2,brightness:.4,saturation:.42,blur:3},
  {file:'assets/map/ch1/floor_objects/prop_g_toxic.png',left:6520,top:2440,width:760,height:980,rotate:11,opacity:.16,brightness:.41,saturation:.45,blur:3},
  {file:'assets/map/ch1/floor_objects/prop_g_corpse.png',left:5360,top:3540,width:1920,height:1120,rotate:-3,opacity:.24,brightness:.48},
  {file:'assets/map/ch1/floor_objects/prop_g_battle.png',left:1040,top:3910,width:1560,height:930,rotate:15,opacity:.22,brightness:.64,saturation:.42},
  {file:'assets/map/ch1/floor_objects/prop_g_root.png',left:4690,top:3640,width:1710,height:930,rotate:-10,opacity:.22,brightness:.5},
  {file:'assets/map/ch1/floor_objects/prop_g_toxic.png',left:6290,top:5420,width:940,height:670,rotate:-19,opacity:.18,brightness:.39,saturation:.43,blur:3}
];

const smoothingSvg=Buffer.from(`
<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <filter id="macroBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="72"/></filter>
  <filter id="soilBlur" x="-15%" y="-20%" width="130%" height="140%"><feGaussianBlur stdDeviation="48"/></filter>
  <radialGradient id="soil"><stop stop-color="#342028" stop-opacity=".18"/><stop offset=".56" stop-color="#22161b" stop-opacity=".08"/><stop offset="1" stop-color="#141014" stop-opacity="0"/></radialGradient>
  <radialGradient id="ash"><stop stop-color="#806958" stop-opacity=".32"/><stop offset=".54" stop-color="#4b3932" stop-opacity=".18"/><stop offset="1" stop-opacity="0"/></radialGradient>
  <linearGradient id="wet" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#171714" stop-opacity=".3"/><stop offset=".48" stop-color="#302d22" stop-opacity=".24"/><stop offset="1" stop-color="#22271c" stop-opacity=".12"/></linearGradient>
  <linearGradient id="fadeX"><stop stop-color="#09090b" stop-opacity=".22"/><stop offset="1" stop-color="#261820" stop-opacity="0"/></linearGradient>
  <linearGradient id="fadeR"><stop stop-color="#261820" stop-opacity="0"/><stop offset="1" stop-color="#07080a" stop-opacity=".3"/></linearGradient>
  <linearGradient id="fadeN" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#07080a" stop-opacity=".28"/><stop offset="1" stop-color="#261820" stop-opacity="0"/></linearGradient>
  <linearGradient id="fadeS" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#261820" stop-opacity="0"/><stop offset="1" stop-color="#08090a" stop-opacity=".3"/></linearGradient>
  <linearGradient id="treeSoil" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#251b1e" stop-opacity=".28"/><stop offset=".46" stop-color="#3b292c" stop-opacity=".38"/><stop offset="1" stop-color="#1b1517" stop-opacity=".29"/></linearGradient>
 </defs>
 <!-- EDGE_SMOOTH: broad, irregular inner-edge recess/protrusion fades. -->
 <g fill="none" stroke-linecap="round">
  <path d="M320 1560C820 1320 1080 1740 1420 1510S1880 1310 2250 1510" stroke="url(#fadeX)" stroke-width="310" opacity=".72"/>
  <path d="M310 4770C800 4440 1150 4950 1550 4650S1990 4400 2380 4700" stroke="#171118" stroke-width="360" opacity=".08"/>
  <path d="M7860 1340C7280 1110 7060 1690 6670 1390S6240 1240 5910 1530" stroke="#0c0d0d" stroke-width="430" opacity=".13"/>
  <path d="M7860 5260C7270 4910 7090 5500 6630 5180S6200 5010 5860 5390" stroke="#171116" stroke-width="470" opacity=".14"/>
  <path d="M1420 360C1880 770 2240 390 2760 640S3550 760 3970 440" stroke="#21151b" stroke-width="300" opacity=".07"/>
  <path d="M4350 420C4850 780 5320 340 5750 620S6510 800 6850 470" stroke="#0b0c0d" stroke-width="350" opacity=".12"/>
 </g>
 <!-- CORNER_VARIATION: intentionally non-mirrored corner footprints. -->
 <path d="M300 460C850 430 1390 740 1750 1330C1280 1420 1010 1210 720 1510C500 1220 390 890 300 460Z" fill="#2b1821" opacity=".08"/>
 <path d="M7910 320C7480 520 7240 650 6960 1010C7330 1080 7550 1480 7840 1660Z" fill="#060708" opacity=".18"/>
 <path d="M260 7890C650 7470 1110 7300 1580 7510C1350 7720 1060 7880 760 7990Z" fill="#5d4d43" opacity=".045"/>
 <path d="M7900 7900C7350 7760 7110 7410 6720 7140C7010 6890 7400 6930 7770 6640Z" fill="#151015" opacity=".18"/>
 <!-- Broad, unequal ground tongues break the four-sided room frame without adding walls. -->
 <path d="M420 1120C980 980 1320 1210 1650 1430C1940 1620 2240 1580 2590 1810C2140 1980 1780 1900 1430 1740C1060 1580 760 1710 390 1600Z" fill="url(#fadeX)" opacity=".9"/>
 <path d="M430 4440C920 4210 1290 4360 1640 4630C1900 4820 2200 4860 2470 5050C2010 5190 1660 5080 1320 4890C980 4710 700 4850 390 4770Z" fill="url(#fadeX)" opacity=".72"/>
 <path d="M400 6100C850 5820 1180 5980 1510 6200C1770 6380 2060 6340 2320 6530C1870 6680 1510 6540 1190 6380C860 6210 650 6330 380 6250Z" fill="url(#fadeX)" opacity=".86"/>
 <path d="M7770 2350C7240 2140 6900 2310 6610 2600C6370 2840 6110 2840 5820 3030C6260 3160 6660 3070 6940 2860C7250 2630 7520 2740 7820 2630Z" fill="url(#fadeR)" opacity=".9"/>
 <path d="M7800 5700C7310 5480 6940 5580 6600 5880C6330 6120 6090 6160 5760 6380C6260 6500 6650 6360 6970 6170C7290 5970 7520 6070 7830 5980Z" fill="url(#fadeR)" opacity=".76"/>
 <path d="M7830 4080C7400 3860 7050 3940 6750 4180C6480 4390 6230 4400 5950 4610C6380 4740 6760 4620 7040 4450C7330 4270 7540 4380 7850 4280Z" fill="url(#fadeR)" opacity=".88"/>
 <path d="M1020 390C1550 760 2020 690 2490 940C2920 1160 3240 1110 3540 1390C3020 1500 2640 1340 2250 1210C1800 1060 1460 1190 980 940Z" fill="url(#fadeN)" opacity=".76"/>
 <path d="M4560 360C5010 700 5380 650 5720 880C6080 1120 6400 1080 6740 1340C6260 1460 5850 1320 5520 1170C5130 990 4850 1110 4520 870Z" fill="url(#fadeN)" opacity=".9"/>
 <path d="M3020 360C3380 690 3700 650 4010 880C4280 1080 4550 1040 4780 1280C4400 1400 4040 1280 3750 1130C3450 970 3240 1080 2980 850Z" fill="url(#fadeN)" opacity=".82"/>
 <path d="M1450 7840C1900 7480 2300 7560 2670 7330C3030 7110 3330 7180 3650 6940C3200 6810 2800 6920 2460 7090C2080 7280 1770 7160 1410 7410Z" fill="url(#fadeS)" opacity=".68"/>
 <path d="M4750 7840C5160 7500 5490 7540 5820 7290C6130 7060 6460 7100 6830 6830C6380 6700 5990 6810 5670 7000C5330 7200 5060 7080 4700 7340Z" fill="url(#fadeS)" opacity=".86"/>
 <path d="M3260 7850C3650 7540 3980 7570 4260 7340C4540 7110 4800 7150 5070 6910C4700 6780 4350 6900 4080 7060C3780 7240 3520 7150 3220 7380Z" fill="url(#fadeS)" opacity=".78"/>
 <!-- TREE_BASIN: south-heavy asymmetric root/corpse influence, clear east/west bypass. -->
 <path d="M2500 3560C2670 3020 3070 2840 3400 3080C3620 2640 4080 2600 4380 3000C4760 2820 5250 3120 5600 3520C5300 3800 5480 4160 5010 4290C4760 4680 4210 4800 3820 4460C3390 4700 2910 4440 3060 4100C2700 4110 2410 3910 2500 3560Z" fill="url(#treeSoil)" opacity=".86" filter="url(#soilBlur)"/>
 <path d="M3020 3090C3420 3290 3620 3700 3540 4450M4310 2870C4430 3330 4880 3650 5410 3780M3980 3160C3690 3510 3150 3610 2710 3940M4310 3660C4590 4060 4990 4310 5260 4460" fill="none" stroke="#3b292d" stroke-width="54" stroke-linecap="round" opacity=".22" filter="url(#soilBlur)"/>
 <!-- SIDE_CONNECTION: authored POIs tied to floor without changing their coordinates. -->
 <ellipse cx="1800" cy="4230" rx="1040" ry="720" fill="url(#ash)" transform="rotate(-8 1800 4230)"/>
 <g fill="none" stroke="#44242d" stroke-linecap="round" opacity=".09">
  <path d="M1880 2100C2040 2150 2050 2300 2190 2360S2350 2450 2380 2570" stroke-width="30"/>
  <path d="M1900 2120C1810 2260 1900 2350 1840 2470" stroke-width="22"/>
  <path d="M1950 2140C2130 2070 2220 2170 2310 2140" stroke-width="18"/>
 </g>
 <ellipse cx="5880" cy="4170" rx="1190" ry="680" fill="url(#soil)" transform="rotate(3 5880 4170)"/>
 <path d="M5480 4050C5280 4010 5120 3970 4950 3900" fill="none" stroke="#3a222a" stroke-width="64" stroke-linecap="round" opacity=".17"/>
 <!-- TOXIC WET SOIL: three separated brown-black masses, never a continuous S-chain. -->
 <g fill="url(#wet)" filter="url(#soilBlur)">
  <path d="M6200 1800C6420 1510 6780 1460 7040 1660C7290 1730 7490 1970 7410 2200C7150 2390 6810 2290 6590 2380C6310 2290 6080 2080 6200 1800Z"/>
  <path d="M6120 3090C6300 2860 6600 2820 6810 2960C6990 3100 7010 3340 6840 3490C6590 3540 6440 3680 6190 3570C6030 3440 5990 3260 6120 3090Z"/>
  <path d="M5500 5270C5780 4990 6100 5040 6300 5200C6540 5060 6910 5170 7080 5440C6870 5650 6640 5660 6450 5580C6200 5840 5830 5800 5650 5580C5480 5530 5410 5400 5500 5270Z"/>
 </g>
 <!-- Five unequal contamination fragments leave readable gaps between the wet masses. -->
 <g fill="none" stroke-linecap="round">
  <path d="M7080 2420C6990 2490 6930 2570 6910 2660" stroke="#333527" stroke-width="42" opacity=".18"/>
  <path d="M6500 2700C6420 2740 6380 2790 6340 2850" stroke="#2b2b22" stroke-width="27" opacity=".16"/>
  <path d="M6200 3750C6280 3810 6360 3830 6440 3810" stroke="#302f24" stroke-width="34" opacity=".15"/>
  <path d="M6730 4040C6660 4120 6650 4200 6690 4270" stroke="#363628" stroke-width="24" opacity=".14"/>
  <path d="M6220 4630C6150 4710 6090 4780 6020 4830" stroke="#2a2a21" stroke-width="38" opacity=".16"/>
 </g>
 <!-- OPEN_FIELD: five broad, low-contrast flow patches, deliberately non-circular. -->
 <g filter="url(#macroBlur)">
  <path d="M2070 2760C2360 2500 2680 2600 2940 2520C3210 2570 3480 2740 3690 2960C3330 3260 3020 3150 2720 3290C2460 3270 2210 3190 1990 3110Z" fill="#443036" opacity=".18"/>
  <path d="M4400 2240C4680 2010 4960 2140 5230 2070C5530 2150 5750 2370 5910 2630C5530 2820 5260 2720 4960 2840C4700 2740 4480 2600 4270 2510Z" fill="#32362b" opacity=".18"/>
  <path d="M2030 4930C2380 4610 2730 4770 3050 4660C3380 4740 3650 4920 3850 5140C3490 5400 3180 5290 2860 5430C2500 5390 2180 5270 1900 5190Z" fill="#403037" opacity=".17"/>
  <path d="M4180 5000C4470 4700 4820 4840 5130 4730C5480 4830 5750 5030 5900 5210C5580 5480 5250 5390 4940 5570C4620 5510 4310 5410 4020 5350Z" fill="#30352b" opacity=".19"/>
  <path d="M2810 5940C3180 5600 3530 5770 3890 5650C4250 5750 4580 5940 4810 6150C4440 6430 4080 6330 3720 6500C3330 6460 2970 6340 2640 6260Z" fill="#443139" opacity=".17"/>
 </g>
</svg>`);

const assetGroups=[EDGE_SMOOTH,CORNER_VARIATION,TREE_BASIN,SIDE_CONNECTION];
const layers=[];
for(const group of assetGroups)for(const item of group){const layer=await assetLayer(item);if(layer)layers.push(layer);}
layers.push({input:await sharp(smoothingSvg).png().toBuffer(),left:0,top:0,blend:'over'});
const quietSvg=Buffer.from(`<svg width="8192" height="8192" xmlns="http://www.w3.org/2000/svg"><g fill="white"><ellipse cx="3160" cy="3600" rx="150" ry="110"/><ellipse cx="5000" cy="3600" rx="150" ry="110"/><ellipse cx="4000" cy="4640" rx="140" ry="105"/><ellipse cx="4000" cy="2640" rx="140" ry="105"/></g></svg>`);
const quietMask=await sharp(quietSvg).blur(28).png().toBuffer();
const overlay=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([...layers,{input:quietMask,left:0,top:0,blend:'dest-out'}]).png().toBuffer();
await sharp(source(manifest.baseMaster)).ensureAlpha().composite([{input:overlay,left:0,top:0,blend:'over'}]).png({compressionLevel:9,adaptiveFiltering:true}).toFile(MASTER);

for(const id of manifest.chunks){
  const [x,y]=id.split(',').map(Number),sx=x*1024,sy=y*1024;
  const left=Math.max(0,sx-1),top=Math.max(0,sy-1),right=Math.min(SIZE,sx+1025),bottom=Math.min(SIZE,sy+1025);
  let image=sharp(MASTER).extract({left,top,width:right-left,height:bottom-top});
  image=image.extend({left:sx===0?1:0,right:x===7?1:0,top:sy===0?1:0,bottom:y===7?1:0,extendWith:'copy'});
  await image.png({compressionLevel:9,adaptiveFiltering:true}).toFile(path.join(OUT,`chunk_${x}_${y}.png`));
}

const previewDir=path.join(ROOT,'captures','ch1_1_smoothing_20260830','MASTERS');
mkdirSync(previewDir,{recursive:true});
await sharp(source(manifest.baseMaster)).flatten({background:'#171315'}).resize({width:2048}).jpeg({quality:91}).toFile(path.join(previewDir,'CURRENT_OUTER_MASTER.jpg'));
await sharp(MASTER).flatten({background:'#171315'}).resize({width:2048}).jpeg({quality:91}).toFile(path.join(previewDir,'AFTER_SMOOTHING_MASTER.jpg'));
console.log(JSON.stringify({master:MASTER,chunks:manifest.chunks.length,baseMaster:manifest.baseMaster,roles:manifest.layerRoles,small:0,newVertical:0},null,2));

import sharp from 'sharp';
import {mkdirSync,readFileSync} from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const OUT=path.join(PROJECT_ROOT,'assets','map','ch1','baked_start_smoothing');
const manifest=JSON.parse(readFileSync(path.join(OUT,'composition.json'),'utf8'));
const SIZE=8192;
const MASTER=path.join(OUT,'CH1_1_START_SMOOTHING_MASTER.png');
const source=relative=>path.join(PROJECT_ROOT,...relative.split('/'));
sharp.concurrency(2);
mkdirSync(OUT,{recursive:true});

async function assetLayer({file,left,top,scale=1,rotate=0,flip=false,brightness=.62,saturation=.5,opacity=.25}){
  const maxScale=manifest.visualContract.maxRasterUpscale;
  if(scale>maxScale)throw new Error(`${file}: scale ${scale} exceeds maxRasterUpscale ${maxScale}`);

  const input=sharp(source(file));
  const metadata=await input.metadata();
  const width=Math.max(1,Math.round(metadata.width*scale));
  const height=Math.max(1,Math.round(metadata.height*scale));
  let image=input.ensureAlpha().resize({
    width,
    height,
    fit:'contain',
    background:{r:0,g:0,b:0,alpha:0}
  });
  if(flip)image=image.flop();
  if(rotate)image=image.rotate(rotate,{background:{r:0,g:0,b:0,alpha:0}});
  image=image
    .modulate({brightness,saturation})
    .sharpen(1.15,0.7,1.8)
    .linear([1,1,1,opacity],[0,0,0,0]);

  const rendered=await image.png().toBuffer({resolveWithObject:true});
  const renderedWidth=rendered.info.width;
  const renderedHeight=rendered.info.height;
  const cropLeft=Math.max(0,-left);
  const cropTop=Math.max(0,-top);
  const targetLeft=Math.max(0,left);
  const targetTop=Math.max(0,top);
  const cropWidth=Math.min(renderedWidth-cropLeft,SIZE-targetLeft);
  const cropHeight=Math.min(renderedHeight-cropTop,SIZE-targetTop);
  if(cropWidth<=0||cropHeight<=0)return null;

  return{
    input:await sharp(rendered.data).extract({left:cropLeft,top:cropTop,width:cropWidth,height:cropHeight}).png().toBuffer(),
    left:targetLeft,
    top:targetTop,
    blend:'over'
  };
}

const EDGE='assets/map/ch1/floor_objects/prop_g_edge.png';
const ROOT_PATCH='assets/map/ch1/floor_objects/prop_g_root.png';
const CORPSE='assets/map/ch1/floor_objects/prop_g_corpse.png';
const TOXIC='assets/map/ch1/floor_objects/prop_g_toxic.png';
const SOIL='assets/map/ch1/floor_objects/prop_g_battle.png';

// Every layer is an authored, aspect-preserving ground patch. Broad SVG gradients and
// raster blur are intentionally excluded: they produced the low-resolution purple smears.
const EDGE_SMOOTH=[
  {file:EDGE,left:180,top:930,scale:1.24,rotate:-8,opacity:.28},
  {file:ROOT_PATCH,left:190,top:2750,scale:1.18,rotate:7,flip:true,opacity:.27},
  {file:EDGE,left:240,top:5310,scale:1.22,rotate:-6,opacity:.25},
  {file:CORPSE,left:6820,top:1080,scale:1.08,rotate:9,flip:true,opacity:.3,saturation:.4},
  {file:EDGE,left:6650,top:2980,scale:1.25,rotate:-7,opacity:.28},
  {file:CORPSE,left:6780,top:5320,scale:1.16,rotate:8,opacity:.3,saturation:.4},
  {file:ROOT_PATCH,left:1450,top:170,scale:1.2,rotate:5,opacity:.25},
  {file:EDGE,left:4720,top:210,scale:1.23,rotate:-5,flip:true,opacity:.27}
];

const CORNER_VARIATION=[
  {file:ROOT_PATCH,left:130,top:160,scale:1.28,rotate:14,opacity:.25},
  {file:TOXIC,left:6820,top:160,scale:1.28,rotate:-11,flip:true,opacity:.26,brightness:.5,saturation:.34},
  {file:SOIL,left:170,top:6820,scale:1.24,rotate:-5,opacity:.16,brightness:.78,saturation:.28},
  {file:CORPSE,left:6790,top:6760,scale:1.27,rotate:13,opacity:.27,brightness:.58,saturation:.36}
];

const TREE_BASIN=[
  {file:CORPSE,left:3470,top:3490,scale:.88,rotate:-12,opacity:.32,brightness:.58,saturation:.42},
  {file:ROOT_PATCH,left:3700,top:3080,scale:.78,rotate:8,flip:true,opacity:.34,brightness:.58},
  {file:ROOT_PATCH,left:4140,top:3520,scale:.7,rotate:17,opacity:.31,brightness:.58},
  {file:CORPSE,left:3520,top:3820,scale:.7,rotate:4,flip:true,opacity:.3,brightness:.6,saturation:.4}
];

const SIDE_CONNECTION=[
  {file:SOIL,left:1300,top:3700,scale:1.08,rotate:-7,opacity:.27,brightness:.78,saturation:.28},
  {file:ROOT_PATCH,left:5400,top:3710,scale:1.05,rotate:5,flip:true,opacity:.3,brightness:.62},
  {file:ROOT_PATCH,left:1640,top:1680,scale:1.1,rotate:17,opacity:.3,brightness:.64},
  {file:TOXIC,left:6280,top:1660,scale:1.12,rotate:-9,flip:true,opacity:.28,brightness:.55,saturation:.34},
  {file:TOXIC,left:6170,top:2800,scale:.92,rotate:12,opacity:.24,brightness:.54,saturation:.32},
  {file:TOXIC,left:5700,top:4820,scale:1.2,rotate:14,flip:true,opacity:.28,brightness:.52,saturation:.32},
  {file:CORPSE,left:5520,top:3890,scale:.9,rotate:-4,opacity:.29,brightness:.6,saturation:.4},
  {file:SOIL,left:1110,top:4080,scale:.88,rotate:11,opacity:.19,brightness:.75,saturation:.28},
  {file:ROOT_PATCH,left:4860,top:4130,scale:.88,rotate:-8,opacity:.26,brightness:.6},
  {file:TOXIC,left:6240,top:5350,scale:.82,rotate:-15,opacity:.23,brightness:.52,saturation:.32}
];

const OPEN_FIELD=[
  {file:SOIL,left:2050,top:2200,scale:.68,rotate:-7,opacity:.16,brightness:.72,saturation:.24},
  {file:SOIL,left:4740,top:1900,scale:.66,rotate:8,flip:true,opacity:.17,brightness:.7,saturation:.24},
  {file:SOIL,left:2060,top:5000,scale:.7,rotate:11,opacity:.16,brightness:.72,saturation:.24},
  {file:SOIL,left:4760,top:4920,scale:.68,rotate:-9,flip:true,opacity:.17,brightness:.7,saturation:.24},
  {file:SOIL,left:3310,top:5920,scale:.72,rotate:5,opacity:.16,brightness:.72,saturation:.24}
];

const layers=[];
for(const group of [EDGE_SMOOTH,CORNER_VARIATION,TREE_BASIN,SIDE_CONNECTION,OPEN_FIELD]){
  for(const item of group){
    const layer=await assetLayer(item);
    if(layer)layers.push(layer);
  }
}

const overlay=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
  .composite(layers)
  .png()
  .toBuffer();
await sharp(source(manifest.baseMaster)).ensureAlpha()
  .composite([{input:overlay,left:0,top:0,blend:'over'}])
  .png({compressionLevel:9,adaptiveFiltering:true})
  .toFile(MASTER);

for(const id of manifest.chunks){
  const [x,y]=id.split(',').map(Number);
  const sx=x*1024;
  const sy=y*1024;
  const left=Math.max(0,sx-1);
  const top=Math.max(0,sy-1);
  const right=Math.min(SIZE,sx+1025);
  const bottom=Math.min(SIZE,sy+1025);
  let image=sharp(MASTER).extract({left,top,width:right-left,height:bottom-top});
  image=image.extend({left:sx===0?1:0,right:x===7?1:0,top:sy===0?1:0,bottom:y===7?1:0,extendWith:'copy'});
  await image.png({compressionLevel:9,adaptiveFiltering:true}).toFile(path.join(OUT,`chunk_${x}_${y}.png`));
}

const previewDir=path.join(PROJECT_ROOT,'captures','ch1_1_smoothing_20260904','MASTERS');
mkdirSync(previewDir,{recursive:true});
await sharp(source(manifest.baseMaster)).flatten({background:'#171315'}).resize({width:2048}).jpeg({quality:91}).toFile(path.join(previewDir,'CURRENT_OUTER_MASTER.jpg'));
await sharp(MASTER).flatten({background:'#171315'}).resize({width:2048}).jpeg({quality:91}).toFile(path.join(previewDir,'AFTER_CRISP_SMOOTHING_MASTER.jpg'));
console.log(JSON.stringify({master:MASTER,chunks:manifest.chunks.length,baseMaster:manifest.baseMaster,roles:manifest.layerRoles,small:0,newVertical:0},null,2));

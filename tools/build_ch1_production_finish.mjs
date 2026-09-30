import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {applyRetouchLayers} from './ch1-production-retouch.mjs';

// One fixed stage composition. This is an asset bake, not a procedural map generator.
const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'assets/map/ch1/production_finish');
const SIZE=8192,T=SIZE/200; // bake pixels per tile; runtime maps each 1024px core to 1000 world pixels
const context={};vm.runInNewContext(fs.readFileSync(path.join(OUT,'layout.js'),'utf8'),context);
const layout=context.CH1_1_PRODUCTION;
const depth=JSON.parse(fs.readFileSync(path.join(OUT,'depth/composition.json'),'utf8'));
sharp.concurrency(2);sharp.cache({memory:128,files:20,items:30});
const svg=(body,size=SIZE)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">${body}</svg>`);
const polygon=layout.boundary.map(p=>p.join(',')).join(' ');
// Visual material edge uses a deterministic, organic mask. Geometry still comes from layout.js.
const floorMask=await sharp(path.join(OUT,'floor_transition93.png')).resize(SIZE,SIZE).png().toBuffer();
const forestMask=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:'white'}}).composite([{input:floorMask,blend:'dest-out'}]).png().toBuffer();
console.log('region masks complete');
const source=f=>path.join(ROOT,'assets/map/ch1',f);
const audit=[];

async function layer(file,x,y,scale=1,opacity=1,brightness=.62,saturation=.65){
  const meta=await sharp(source(file)).metadata();
  if(scale>1.3)throw Error('Raster enlargement exceeds 1.3: '+file);
  const w=Math.round(meta.width*scale),h=Math.round(meta.height*scale);
  let left=Math.round(x*T-w/2),top=Math.round(y*T-h/2);
  const cutX=Math.max(0,-left),cutY=Math.max(0,-top);
  const width=Math.min(w-cutX,SIZE-Math.max(0,left)),height=Math.min(h-cutY,SIZE-Math.max(0,top));
  if(width<=0||height<=0)return null;
  let im=sharp(source(file)).ensureAlpha().resize(w,h,{fit:'contain'}).modulate({brightness,saturation});
  const pixels=await im.raw().toBuffer();
  // Preserve source pixels; feather only alpha so material changes do not read as stamps.
  const isGround=file.startsWith('floor_objects/');
  const feather=isGround?.24:.095;
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){
    const edge=Math.min(px/(w*feather),(w-1-px)/(w*feather),py/(h*feather),(h-1-py)/(h*feather),1);
    let a=Math.max(0,edge);a=a*a*(3-2*a);
    if(isGround){const nx=(px-w*.5)/(w*.5),ny=(py-h*.5)/(h*.5);let r=Math.max(0,Math.min(1,(1-Math.hypot(nx,ny))/.38));a*=r*r*(3-2*r);}
    pixels[(py*w+px)*4+3]=Math.round(pixels[(py*w+px)*4+3]*opacity*a*(isGround?.7:1));
  }
  const input=await sharp(pixels,{raw:{width:w,height:h,channels:4}}).extract({left:cutX,top:cutY,width,height}).png().toBuffer();
  audit.push({file,x,y,scale,opacity,brightness,saturation});
  return{input,left:Math.max(0,left),top:Math.max(0,top)};
}
async function collect(list){const out=[];for(const row of list){const l=await layer(...row);if(l)out.push(l);}return out;}

// Ground is continuous: broad material bands follow the authored places, not square stamps.
const ground=await sharp(source('ground_dark_soil.png')).ensureAlpha().modulate({brightness:.85,saturation:.48}).png().toBuffer();
const groundTile=await sharp(ground).metadata();
// Dimraeth-inspired separation: traversable ground is wider than the visible trail.
// These masks change material only. Geometry, props, spawns and lighting stay unchanged.
const litter=await sharp(path.join(OUT,'materials/forest_moss_litter.png'))
  .resize(512,512).ensureAlpha().modulate({brightness:.76,saturation:.55}).png().toBuffer();
// Rasterize the material boundary at 1024px, then upscale its alpha only.
// Full-resolution fractal filtering adds bake cost without adding source-art detail.
const soilMaskSvg=fs.readFileSync(path.join(OUT,'ground-zones.svg'),'utf8').replace('width="8192" height="8192"','width="1024" height="1024"');
const soilMaskSmall=await sharp(Buffer.from(soilMaskSvg)).png().toBuffer();
const soilMask=await sharp(soilMaskSmall).resize(SIZE,SIZE).png().toBuffer();
const soilSurface=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:'transparent'}})
  .composite([{input:ground,tile:true}]).png().toBuffer();
const trail=await sharp(soilSurface).composite([{input:soilMask,blend:'dest-in'}]).png().toBuffer();
let base=sharp({create:{width:SIZE,height:SIZE,channels:4,background:'#101514'}})
  .composite([{input:litter,tile:true},{input:trail}]);
let raw=await base.raw().toBuffer();
const surfacesSvg=svg(`
 <defs><filter id="soft"><feGaussianBlur stdDeviation="1.3"/></filter></defs>
 <g filter="url(#soft)">
  <path d="M101 198 C98 187 108 180 101 169 S87 154 99 145 C106 137 96 129 87 119 S89 103 84 95 C79 83 84 75 94 67 S102 47 100 33 L100 3" fill="none" stroke="#69523a" stroke-width="12" opacity=".3"/>
  <path d="M101 174 C79 169 60 166 60 153 C62 139 88 141 102 143 C117 140 138 146 139 155 C138 168 115 174 101 174Z" fill="#69513d" opacity=".27"/>
  <path d="M75 121 C56 118 32 111 33 99 C36 89 61 90 73 103 C84 113 82 119 75 121Z" fill="#594d3a" opacity=".3"/>
  <path d="M77 109 C67 96 76 73 92 71 C118 68 135 83 130 101 C125 114 94 118 77 109Z" fill="#333c2b" opacity=".26"/>
  <path d="M122 68 C138 67 166 60 177 47 C173 34 154 35 144 43 C139 51 129 56 122 68Z" fill="#304539" opacity=".34"/>
  <path d="M138 148 C148 157 171 157 173 143 C175 128 155 131 144 139Z" fill="#344337" opacity=".35"/>
  <path d="M95 68 C78 67 55 66 41 56 C35 42 46 35 58 39 C68 48 84 45 105 39" fill="none" stroke="#514630" stroke-width="9" opacity=".23"/>
  <path d="M93 43 C98 36 99 29 100 18" fill="none" stroke="#76634b" stroke-width="16" opacity=".26"/>
 </g>
 <g fill="none" stroke-linecap="round">
  <path d="M102 90 C97 100 86 104 78 113 M102 90 C113 98 120 111 132 113 M103 90 C111 79 113 69 123 66" stroke="#232921" stroke-width="1.6" opacity=".5"/>
  <path d="M102 91 C95 101 89 104 81 112 M102 90 C112 98 122 110 131 112 M103 90 C111 79 113 69 123 66" stroke="#74634a" stroke-width=".25" opacity=".3"/>
 </g>`,512);
// These are low-frequency color fields only. Source art remains at native resolution.
const surfacesSmall=await sharp(surfacesSvg).png().toBuffer();
const surfaces=await sharp(surfacesSmall).resize(SIZE,SIZE).png().toBuffer();
raw=await sharp(raw,{raw:{width:SIZE,height:SIZE,channels:4}}).composite([{input:surfaces}]).raw().toBuffer();
console.log('continuous ground fields complete');

// Authored low ground areas: soil at the entry/clearing, litter at transitions, roots at the tree.
const GROUND=[
 ['floor_objects/prop_g_battle.png',100,185,.95,.54,.78,.45],
 ['floor_objects/prop_g_battle.png',97,171,1.2,.58,.8,.4],
 ['floor_objects/prop_g_battle.png',91,153,1.3,.65,.8,.4],
 ['floor_objects/prop_g_battle.png',112,154,1.1,.55,.76,.42],
 ['floor_objects/prop_g_edge.png',71,159,1.2,.58,.66,.5],
 ['floor_objects/prop_g_edge.png',131,163,1.1,.5,.62,.5],
 ['floor_objects/prop_g_root.png',69,131,1.1,.52,.62,.38],
 ['floor_objects/prop_g_battle.png',90,125,1.15,.5,.72,.4],
 ['floor_objects/prop_g_battle.png',53,107,1.12,.6,.76,.4],
 ['floor_objects/prop_g_edge.png',36,117,1,.56,.63,.43],
 ['floor_objects/prop_g_root.png',88,102,1.2,.66,.64,.38],
 ['floor_objects/prop_g_root.png',113,99,1.14,.63,.65,.38],
 ['floor_objects/prop_g_corpse.png',103,79,1.15,.44,.65,.4],
 ['floor_objects/prop_g_battle.png',81,88,.92,.57,.72,.4],
 ['floor_objects/prop_g_battle.png',123,84,.95,.5,.72,.4],
 ['floor_objects/prop_g_root.png',132,106,.9,.51,.58,.42],
 ['floor_objects/prop_g_toxic.png',163,143,1.15,.38,.64,.34],
 ['floor_objects/prop_g_toxic.png',166,48,1.1,.4,.6,.33],
 ['floor_objects/prop_g_edge.png',143,58,1.12,.58,.6,.44],
 ['floor_objects/prop_g_root.png',53,58,1,.52,.62,.38],
 ['floor_objects/prop_g_battle.png',96,54,1.25,.56,.75,.4],
 ['floor_objects/prop_g_battle.png',105,35,1.13,.55,.77,.4],
 ['floor_objects/prop_g_battle.png',100,18,.85,.5,.78,.4]
];
raw=await sharp(raw,{raw:{width:SIZE,height:SIZE,channels:4}}).composite(await collect(GROUND)).raw().toBuffer();
const paintedFloor=await sharp(raw,{raw:{width:SIZE,height:SIZE,channels:4}}).composite([{input:floorMask,blend:'dest-in'}]).png().toBuffer();
console.log('ground source layers complete');
raw=null;

// Large continuous forest silhouettes: preserved direction/perspective, clipped by the same
// region design, with branches overhanging the ground rather than rectangular image collision.
const FOREST=depth.forest.map(([file,...args])=>['production_finish/depth/'+file,...args]);
const ROOT_CONNECTIONS=depth.groundRoots.map(([file,...args])=>['production_finish/depth/'+file,...args]);
const forestBackground=await sharp(source('ground_dark_soil.png')).modulate({brightness:.24,saturation:.35}).tint('#273326').png().toBuffer();
const forest=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:'#0d1512'}})
  .composite([{input:forestBackground,tile:true},...await collect(FOREST)])
  .png().toBuffer();
const clippedForest=await sharp(forest).composite([{input:forestMask,blend:'dest-in'}]).png().toBuffer();
console.log('outer forest complete');

// Medium connections lie at a named shoulder; never scattered across combat space.
const CONNECTIONS=[
 ['floor_objects/prop_g_edge.png',76,179,.95,.72,.59,.5],
 ['floor_objects/prop_g_root.png',126,181,.9,.62,.59,.42],
 ['floor_objects/prop_g_edge.png',63,168,1.1,.65,.61,.48],
 ['floor_objects/prop_g_edge.png',146,163,.95,.65,.59,.5],
 ['floor_objects/prop_g_root.png',58,129,1.1,.7,.63,.44],
 ['floor_objects/prop_g_edge.png',136,120,1.2,.68,.58,.5],
 ['floor_objects/prop_g_edge.png',30,109,1,.65,.58,.48],
 ['floor_objects/prop_g_root.png',49,73,.9,.67,.59,.45],
 ['floor_objects/prop_g_edge.png',146,74,1.05,.7,.58,.5],
 ['floor_objects/prop_g_edge.png',74,28,1,.64,.6,.5],
 ['floor_objects/prop_g_root.png',129,28,.95,.64,.58,.45]
];
const master=path.join(OUT,'CH1_1_PRODUCTION_MASTER.png');
let full=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:'#0c1411'}})
 .composite([{input:paintedFloor},{input:clippedForest},...await collect(CONNECTIONS),...await collect(ROOT_CONNECTIONS)])
 .raw().toBuffer();
const retouches=JSON.parse(fs.readFileSync(path.join(OUT,'retouch-layers.json'),'utf8'));
full=await applyRetouchLayers(full,SIZE,SIZE,OUT,retouches.layers);
await sharp(full,{raw:{width:SIZE,height:SIZE,channels:4}}).png({compressionLevel:6}).toFile(master);
console.log('master written');
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
 const sx=x*1024,sy=y*1024,left=Math.max(0,sx-1),top=Math.max(0,sy-1);
 await sharp(full,{raw:{width:SIZE,height:SIZE,channels:4}})
  .extract({left,top,width:Math.min(SIZE,sx+1025)-left,height:Math.min(SIZE,sy+1025)-top})
  .extend({left:x===0?1:0,right:x===7?1:0,top:y===0?1:0,bottom:y===7?1:0,extendWith:'copy'})
  .png({compressionLevel:6}).toFile(path.join(OUT,`chunk_${x}_${y}.png`));
}
const floorRetouch=retouches.layers.some(layer=>layer.id==='floor87')?JSON.parse(fs.readFileSync(path.join(OUT,'floor87_sources/prep.json'),'utf8')):null;
const commonSkin=floorRetouch?{file:'floor87_sources/skin_material_generated.png',mask:'floor87_sources/floor87_mask.png',retouch:'floor87',rgbScale:floorRetouch.rgbScale,opacity:floorRetouch.opacity,periodPixels:floorRetouch.periodPixels,overlapPixels:floorRetouch.overlapPixels,navFeatherPixels:floorRetouch.navFeatherPixels}:undefined;
fs.writeFileSync(path.join(OUT,'composition.json'),JSON.stringify({version:layout.version,bakeVersion:retouches.bakeVersion,retouchLayers:retouches.layers,groundMaterials:{mask:'ground-zones.svg',soil:{file:'ground_dark_soil.png',brightness:.85,saturation:.48},litter:{file:'materials/forest_moss_litter.png',tileSize:512,brightness:.76,saturation:.55},commonSkin,collisionChanges:false},alphaFeather:{groundEdge:.24,groundRadial:.38,groundOpacityMultiplier:.7,forestEdge:.095,rgbBlur:0},stage:0,masterSize:[SIZE,SIZE],worldSize:[8000,8000],chunkSize:1024,bleed:1,chunkCount:64,geometryHash:createHash('sha256').update(JSON.stringify(layout.buildRLE(200,200))).digest('hex'),regions:layout.regions,depthSource:depth,counts:{ground:GROUND.length,forest:FOREST.length,connections:CONNECTIONS.length+ROOT_CONNECTIONS.length},sourceAssets:[...new Set(audit.map(a=>a.file))],placements:audit,groundTile:[groundTile.width,groundTile.height],runtimeScatter:0,structuralRotation:0,structuralMirror:0},null,2)+'\n');
await sharp(full,{raw:{width:SIZE,height:SIZE,channels:4}}).resize(1600).jpeg({quality:90}).toFile(path.join(OUT,'composition-preview.jpg'));
console.log('CH1-1 production master + 64 chunks complete');

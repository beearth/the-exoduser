import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from 'sharp';
import {createHash} from 'node:crypto';

// Offline material retouch only. Keep the authored silhouette, roots and runtime geometry.
const ROOT=path.resolve(import.meta.dirname,'..');
const DIR=path.join(ROOT,'assets/map/ch1/production_finish');
const baseArg=process.argv.indexOf('--base');
const BEFORE=baseArg>=0?path.resolve(process.argv[baseArg+1]):path.join(ROOT,'tmp/ch1-floor87/pre87');
const OUT=path.join(ROOT,'captures/ch1_floor87/candidate');
const SIZE=8192,T=SIZE/200,OVERLAP=256,OPACITY=.94,RGB_SCALE=[.58,.62,.67];
const hash=b=>createHash('sha256').update(b).digest('hex');
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
sharp.concurrency(1);sharp.cache(false);
fs.mkdirSync(OUT,{recursive:true});
const context={};vm.runInNewContext(fs.readFileSync(path.join(DIR,'layout.js'),'utf8'),context);
const layout=context.CH1_1_PRODUCTION;
const {data:before}=await sharp(path.join(BEFORE,'CH1_1_PRODUCTION_MASTER.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const materialFile=fs.existsSync(path.join(DIR,'floor87_sources/skin_material_generated.png'))?path.join(DIR,'floor87_sources/skin_material_generated.png'):path.join(ROOT,'tmp/ch1-floor87/skin_material_generated.png');
const {data:material,info}=await sharp(materialFile).removeAlpha().raw().toBuffer({resolveWithObject:true});
if(info.width!==2048||info.height!==2048)throw Error('Expected the approved 2048px source material');
if(hash(before)!=='19e4719dc855da64d0fece88c7ad2a9977ea81759fa1d7e3b1071252330d3433')throw Error('Use the preserved pre87 master, not an already retouched floor');
const nav=Uint8Array.from({length:40000},(_,i)=>layout.contains(i%200+.5,(i/200|0)+.5)?255:0);
const softNav=await sharp(nav,{raw:{width:200,height:200,channels:1}}).resize(SIZE,SIZE,{kernel:'nearest'}).blur(34).greyscale().raw().toBuffer();
if(softNav.length!==SIZE*SIZE)throw Error('Unexpected floor mask channels');
const depth=JSON.parse(fs.readFileSync(path.join(DIR,'depth/composition.json')));
const rootMeta=await sharp(path.join(DIR,'depth/root_fan.png')).metadata();
const roots=depth.groundRoots.map(([,x,y,s])=>[x,y,rootMeta.width*s*.37/T,rootMeta.height*s*.37/T]);
// Keep root silhouettes and their contact shadows; feather the material up to their shoulders.
const axis=Array.from({length:SIZE},(_,p)=>{const q=p%(info.width-OVERLAP);return{a:q,b:q+info.width-OVERLAP,w:q<OVERLAP?smooth(q/OVERLAP):1};});
const full=Buffer.from(before),patch=Buffer.alloc(before.length),mask=Buffer.alloc(SIZE*SIZE);
let changed=0,outside=0,protectedCore=0,protectedCoreChanged=0;
const sums=Array.from({length:8},()=>({before:[0,0,0],after:[0,0,0],n:0}));
for(let y=0;y<SIZE;y++){
 const ty=y/T,yy=axis[y],yt=y*SIZE;
 for(let x=0;x<SIZE;x++){
  const i=yt+x,j=i*4,tx=x/T,walk=nav[(ty|0)*200+(tx|0)]===255;
  if(!walk)continue;
  let rootKeep=0;
  for(const [cx,cy,rx,ry] of roots){const r=Math.hypot((tx-cx)/rx,(ty-cy)/ry);rootKeep=Math.max(rootKeep,1-smooth((r-.72)/.4));}
  const peak=Math.max(before[j],before[j+1],before[j+2]);
  const brightKeep=smooth((peak-72)/38); // preserve isolated bark/rock highlights, not whole soil patches
  const a=Math.round(OPACITY*(softNav[i]/255)*(1-rootKeep)*(1-brightKeep)*255)/255;
  if(rootKeep===1){protectedCore++;}
  if(a<=0)continue;
  mask[i]=Math.round(a*255);
  const xx=axis[x];
  const aa=(yy.a*info.width+xx.a)*3,ab=(yy.a*info.width+xx.b)*3,ba=(yy.b*info.width+xx.a)*3,bb=(yy.b*info.width+xx.b)*3;
  let different=false;
  for(let k=0;k<3;k++){
   const top=material[aa+k]*xx.w+(xx.w===1?0:material[ab+k]*(1-xx.w));
   const bottom=yy.w===1?0:material[ba+k]*xx.w+(xx.w===1?0:material[bb+k]*(1-xx.w));
   const paint=(top*yy.w+bottom*(1-yy.w))*RGB_SCALE[k];
   full[j+k]=Math.round(before[j+k]*(1-a)+paint*a);
   if(full[j+k]!==before[j+k])different=true;
  }
  if(different){changed++;full.copy(patch,j,j,j+3);patch[j+3]=255;if(rootKeep===1)protectedCoreChanged++;}
 }
}
// Region averages measure the common floor, excluding root cores and transition shoulders.
const probes=[[100,185],[100,151],[83,125],[45,100],[84,90],[147,97],[100,52],[100,22]];
for(let p=0;p<probes.length;p++){
 const [tx,ty]=probes[p],s=sums[p];
 for(let y=Math.round((ty-3)*T);y<Math.round((ty+3)*T);y++)for(let x=Math.round((tx-3)*T);x<Math.round((tx+3)*T);x++){
  const i=y*SIZE+x,j=i*4;if(mask[i]<200)continue;s.n++;
  for(let k=0;k<3;k++){s.before[k]+=before[j+k];s.after[k]+=full[j+k];}
 }
 for(const key of ['before','after'])s[key]=s[key].map(v=>s.n?+(v/s.n).toFixed(3):null);
}
for(let i=0;i<SIZE*SIZE;i++){const j=i*4;if(nav[(Math.floor(i/SIZE)/T|0)*200+((i%SIZE)/T|0)]!==255&&(before[j]!==full[j]||before[j+1]!==full[j+1]||before[j+2]!==full[j+2]))outside++;}
if(outside||protectedCoreChanged)throw Error('Protected floor boundary/root core changed');
await sharp(full,{raw:{width:SIZE,height:SIZE,channels:4}}).png({compressionLevel:6}).toFile(path.join(OUT,'CH1_1_PRODUCTION_MASTER.png'));
await sharp(patch,{raw:{width:SIZE,height:SIZE,channels:4}}).png({compressionLevel:6}).toFile(path.join(OUT,'floor87_patch.png'));
await sharp(mask,{raw:{width:SIZE,height:SIZE,channels:1}}).png().toFile(path.join(OUT,'floor87_mask.png'));
await sharp(full,{raw:{width:SIZE,height:SIZE,channels:4}}).resize(1600).jpeg({quality:90}).toFile(path.join(OUT,'composition-preview.jpg'));
const chunks=[];let oldBytes=0,newBytes=0;
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
 const name=`chunk_${x}_${y}.png`,sx=x*1024,sy=y*1024,left=Math.max(0,sx-1),top=Math.max(0,sy-1);
 const output=await sharp(full,{raw:{width:SIZE,height:SIZE,channels:4}}).extract({left,top,width:Math.min(SIZE,sx+1025)-left,height:Math.min(SIZE,sy+1025)-top})
  .extend({left:x===0?1:0,right:x===7?1:0,top:y===0?1:0,bottom:y===7?1:0,extendWith:'copy'}).png({compressionLevel:6}).toBuffer();
 const previous=fs.readFileSync(path.join(BEFORE,name));oldBytes+=previous.length;
 // Preserve byte-identical PNGs when their underlying RGBA did not change.
 const oldRaw=await sharp(previous).ensureAlpha().raw().toBuffer(),newRaw=await sharp(output).ensureAlpha().raw().toBuffer();
 const same=oldRaw.equals(newRaw),file=same?previous:output;newBytes+=file.length;
 fs.writeFileSync(path.join(OUT,name),file);if(!same)chunks.push(name);
}
const report={bakeVersion:'20260929-floor-87',sourceSha256:hash(fs.readFileSync(materialFile)),beforeSha256:hash(before),rawSha256:hash(full),geometryHash:hash(JSON.stringify(layout.buildRLE(200,200))),masterSize:[SIZE,SIZE],opacity:OPACITY,rgbScale:RGB_SCALE,navFeatherPixels:34,overlapPixels:OVERLAP,periodPixels:1792,rootProtection:roots,rootCoreRadius:.72,rootFeatherRadius:.4,barkHighlightProtection:[72,110],changedPixels:changed,nonWalkableChanged:outside,protectedRootCorePixels:protectedCore,protectedRootCoreChanged:protectedCoreChanged,chunks,identicalChunks:64-chunks.length,chunkBytes:{before:oldBytes,after:newBytes},regionProbes:probes.map((tile,i)=>({tile,...sums[i]})),runtimeDrawsAdded:0,collisionChanges:false};
fs.writeFileSync(path.join(OUT,'prep.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({changed,nonWalkableChanged:outside,protectedCoreChanged,chunks:chunks.length,bytes:report.chunkBytes,regionProbes:report.regionProbes}));

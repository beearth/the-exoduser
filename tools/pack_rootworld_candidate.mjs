import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const source=path.join(root,'assets/map/ch1/rootworld_environment_candidate_v1.png');
const out=path.join(root,'assets/map/ch1/rootworld_candidate');
const meta=await sharp(source).metadata(),size=2048,core=256;
const raw=await sharp(source).resize(size,size).ensureAlpha().raw().toBuffer();
fs.mkdirSync(out,{recursive:true});
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  const sx=x*core,sy=y*core,left=Math.max(0,sx-1),top=Math.max(0,sy-1);
  await sharp(raw,{raw:{width:size,height:size,channels:4}})
    .extract({left,top,width:Math.min(size,sx+core+1)-left,height:Math.min(size,sy+core+1)-top})
    .extend({left:x===0?1:0,right:x===7?1:0,top:y===0?1:0,bottom:y===7?1:0,extendWith:'copy'})
    .png().toFile(path.join(out,`chunk_${x}_${y}.png`));
}
fs.writeFileSync(path.join(out,'composition.json'),JSON.stringify({version:'candidate-v1',source:'assets/map/ch1/rootworld_environment_candidate_v1.png',sourceSize:[meta.width,meta.height],packedSize:2048,chunkSize:256,bleed:1,chunkCount:64,worldSize:8000,geometryChanged:false,mode:'explicit QA preview only',visualVerdict:'UNREVIEWED',warning:'Packing is not detail enhancement; source resolution and boundary alignment require camera review.'},null,2)+'\n');
console.log('Packed 64 candidate chunks; source pixels unchanged except resize/crop for streaming.');

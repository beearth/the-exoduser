import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {createHash} from 'node:crypto';

// QA-only asset bake: one authored composite, then 64 crops with shared bleed.
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'assets/map/ch1/rootworld_outer');
const source=path.join(root,'assets/map/ch1/rottenwood_field_rootworld_master_v2.png');
const size=8192,unit=size/200;
sharp.concurrency(2);sharp.cache({memory:96,files:10,items:16});
const game=fs.readFileSync(path.join(root,'game.html'),'utf8');
function extract(name){
  const start=game.indexOf(`function ${name}(`);
  if(start<0)throw Error('Missing geometry function: '+name);
  let depth=0,opened=false;
  for(let i=start;i<game.length;i++){
    if(game[i]==='{'){depth++;opened=true;}
    if(game[i]==='}'&&--depth===0&&opened)return game.slice(start,i+1);
  }
  throw Error('Incomplete geometry function: '+name);
}
const build=Function(`${extract('_rleEncodeGrid')};return ${extract('_buildDiabloField')}`)();
const layout=build(0,200,200),nav=[];
for(let i=0;i<layout.tileRLE.length;i+=2)for(let n=0;n<layout.tileRLE[i+1];n++)nav.push(layout.tileRLE[i]);
if(nav.length!==40000)throw Error('Unexpected QA NAV size');
// Keep the engine-authored north gate approach visually open as well.
const visualNav=nav.slice();
for(let y=0;y<16;y++)for(let x=90;x<=110;x++)visualNav[y*200+x]=1;
const mask=Buffer.alloc(40000);
for(let y=0;y<200;y++)for(let x=0;x<200;x++){
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(x+dx>=0&&x+dx<200&&y+dy>=0&&y+dy<200&&visualNav[(y+dy)*200+x+dx])mask[y*200+x]=255;
  }
}
const maskSmall=await sharp(mask,{raw:{width:200,height:200,channels:1}})
  .resize(800,800,{kernel:'nearest'}).blur(5).png().toBuffer();
const smooth=await sharp(maskSmall).resize(size,size).raw().toBuffer({resolveWithObject:true});
const alpha=Buffer.alloc(size*size*4);
for(let i=0;i<size*size;i++){
  alpha[i*4]=alpha[i*4+1]=alpha[i*4+2]=255;
  alpha[i*4+3]=smooth.data[i*smooth.info.channels];
}
const floorMask=await sharp(alpha,{raw:{width:size,height:size,channels:4}}).png().toBuffer();
const patches={
  crown:[900,350,1650,1300],west:[250,1400,1500,1500],
  east:[2450,1050,1500,1550],south:[1250,2350,1700,1650]
};
// Named perimeter shoulders, not scatter. Centers use the locked QA tile frame.
const placements=[
  ['crown',45,13,1.1],['crown',77,-1,1.05],['east',132,1,1.05],['east',154,26,1.1],
  ['west',40,38,1.15],['west',24,66,1.1],['south',42,94,1.1],['crown',59,113,1.05],
  ['west',19,139,1.15],['south',30,165,1.05],['west',46,192,1.15],
  ['south',70,211,1.1],['south',106,214,1.1],['east',143,204,1.15],
  ['east',155,177,1.15],['south',145,148,1.05],['east',155,123,1.1],
  ['east',191,104,1.15],['east',198,72,1.1],['crown',171,49,1.1],['east',143,48,1.05]
];
const layers=[];
for(const [id,x,y,scale] of placements){
  const [left,top,width,height]=patches[id],w=Math.round(width*scale),h=Math.round(height*scale);
  const raw=await sharp(source).extract({left,top,width,height}).resize(w,h)
    .modulate({brightness:.92,saturation:.86}).ensureAlpha().raw().toBuffer();
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){
    const edge=Math.max(0,Math.min(1,px/(w*.15),(w-1-px)/(w*.15),py/(h*.15),(h-1-py)/(h*.15)));
    raw[(py*w+px)*4+3]=Math.round(255*edge*edge*(3-2*edge));
  }
  const lx=Math.round(x*unit-w/2),ty=Math.round(y*unit-h/2),cutX=Math.max(0,-lx),cutY=Math.max(0,-ty);
  const cw=Math.min(w-cutX,size-Math.max(0,lx)),ch=Math.min(h-cutY,size-Math.max(0,ty));
  if(cw<=0||ch<=0)continue;
  const input=await sharp(raw,{raw:{width:w,height:h,channels:4}})
    .extract({left:cutX,top:cutY,width:cw,height:ch}).png().toBuffer();
  layers.push({input,left:Math.max(0,lx),top:Math.max(0,ty)});
}
// A subdued continuous source sits behind the large shoulders to fill deep recesses.
const back=await sharp(source).resize(size,size).modulate({brightness:.4,saturation:.65}).png().toBuffer();
const composite=await sharp(back).ensureAlpha().composite(layers).png().toBuffer();
const full=await sharp(composite).composite([{input:floorMask,blend:'dest-out'}]).raw().toBuffer();
fs.mkdirSync(out,{recursive:true});
await sharp(full,{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(out,'master.png'));
await sharp(full,{raw:{width:size,height:size,channels:4}}).resize(1400).png().toFile(path.join(out,'preview.png'));
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  const sx=x*1024,sy=y*1024,left=Math.max(0,sx-1),top=Math.max(0,sy-1);
  await sharp(full,{raw:{width:size,height:size,channels:4}})
    .extract({left,top,width:Math.min(size,sx+1025)-left,height:Math.min(size,sy+1025)-top})
    .extend({left:x===0?1:0,right:x===7?1:0,top:y===0?1:0,bottom:y===7?1:0,extendWith:'copy'})
    .png().toFile(path.join(out,`chunk_${x}_${y}.png`));
}
fs.writeFileSync(path.join(out,'composition.json'),JSON.stringify({
  version:'20260924-rootworld-1',stage:0,qaOnly:true,source:path.relative(root,source).replaceAll('\\','/'),
  sourceSize:4096,masterSize:size,worldSize:8000,chunkSize:1024,bleed:1,chunkCount:64,
  navHash:createHash('sha256').update(JSON.stringify(layout.tileRLE)).digest('hex'),
  navSource:'_buildDiabloField(0,200,200)',floorMask:{dilateTiles:1,scale:4,blur:5},
  visualGateClearance:{x:[90,110],y:[0,15]},patches,placements,randomScatter:0,
  sourcePatchScaleMax:1.15,backScale:2,visualVerdict:'RETOUCH'
},null,2)+'\n');
console.log('Rootworld QA outer master + 64 bleed chunks baked');

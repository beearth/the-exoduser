// Deterministic offline extraction of the approved gate art. No repainting or color grading.
const fs=require('node:fs'),path=require('node:path');
const sharp=require('G:/exoduser/node_modules/sharp');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'img/ui/silver_hell');
(async()=>{
 const {data,info}=await sharp(path.join(dir,'gate_sigil_20261028.jpg')).removeAlpha().raw().toBuffer({resolveWithObject:true});
 if(info.width!==2560||info.height!==1440)throw Error('Approved source dimensions changed');
 const size=1520,base=Buffer.alloc(size*size*4),embers=Buffer.alloc(base.length);
 for(let y=0;y<1440;y++)for(let x=0;x<size;x++){
  const src=(y*2560+x+520)*3,dst=((y+40)*size+x)*4;
  const r=data[src],g=data[src+1],b=data[src+2],v=Math.max(r,g,b);
  // Smoothly remove only the near-black JPEG background; keep original RGB.
  const t=Math.max(0,Math.min(1,(v-3)/9)),a=Math.round(255*t*t*(3-2*t));
  base[dst]=r;base[dst+1]=g;base[dst+2]=b;base[dst+3]=a;
  // Isolate the source's red cracks/eye, never the iron rings or chain.
  const red=Math.max(0,r-Math.max(g,b)-3),strength=Math.min(1,red/18);
  embers[dst]=Math.min(190,r*2);embers[dst+1]=g;embers[dst+2]=b;
  embers[dst+3]=Math.round(a*strength);
 }
 for(const [name,buffer]of [['gate_sigil_loading.png',base],['gate_sigil_loading_embers.png',embers]])await sharp(buffer,{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(dir,name));
 console.log('Approved source crop x520..2039, y0..1439; centered in 1520 square; original RGB + separate red-only pulse mask.');
})().catch(e=>{console.error(e);process.exitCode=1;});

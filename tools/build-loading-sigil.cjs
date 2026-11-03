// Deterministic offline crop and CTO-requested exposure lift of the approved gate art.
const fs=require('node:fs'),path=require('node:path');
const sharp=require('G:/exoduser/node_modules/sharp');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'img/ui/silver_hell');
(async()=>{
 const {data,info}=await sharp(path.join(dir,'gate_sigil_20261028.jpg')).removeAlpha().raw().toBuffer({resolveWithObject:true});
 if(info.width!==2560||info.height!==1440)throw Error('Approved source dimensions changed');
 const size=1520,base=Buffer.alloc(size*size*4),embers=Buffer.alloc(base.length);
 const value=(x,y)=>{const p=(Math.max(0,Math.min(1439,y))*2560+Math.max(0,Math.min(2559,x)))*3;return Math.max(data[p],data[p+1],data[p+2]);};
 for(let y=0;y<1440;y++)for(let x=0;x<size;x++){
  const src=(y*2560+x+520)*3,dst=((y+40)*size+x)*4;
  const r=data[src],g=data[src+1],b=data[src+2],v=Math.max(r,g,b);
  // Alpha is computed before exposure so near-black JPEG background never resurfaces.
  const t=Math.max(0,Math.min(1,(v-3)/9)),a=Math.round(255*t*t*(3-2*t));
  // A shared RGB multiplier lifts value with gamma .65, preserving hue/saturation.
  const gain=v?Math.pow(v/255,.65)*255/v:0;
  // Restrained warm edge light follows existing chain/spike/iron relief, no new shapes.
  const gradient=Math.max(Math.abs(value(x+523,y)-value(x+517,y)),Math.abs(value(x+520,y+3)-value(x+520,y-3)));
  const edge=Math.min(.14,Math.max(0,(gradient-8)/240))*(1-Math.min(1,Math.max(0,r-Math.max(g,b))/30));
  for(let c=0;c<3;c++){const lifted=[r,g,b][c]*gain;const bone=[223,214,194][c];base[dst+c]=Math.round(Math.min(255,lifted+Math.max(0,bone-lifted)*edge));}
  base[dst+3]=a;
  // Isolate the source's red cracks/eye, never the iron rings or chain.
  const red=Math.max(0,r-Math.max(g,b)-3),strength=Math.min(1,red/18);
  embers[dst]=Math.min(220,r*gain*1.5);embers[dst+1]=g*gain;embers[dst+2]=b*gain;
  embers[dst+3]=Math.round(a*strength);
 }
 for(const [name,buffer]of [['gate_sigil_loading.png',base],['gate_sigil_loading_embers.png',embers]])await sharp(buffer,{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(dir,name));
 console.log('Approved crop x520..2039/y0..1439, centered in 1520 square; hue-preserving value gamma .65, restrained bone edge light, red-only pulse mask.');
})().catch(e=>{console.error(e);process.exitCode=1;});

/* Asset preparation from the approved A master; no paid generation. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'G:/exoduser']}));
const source='G:/exoduser/tmp/design-review/20261031_title_signboard/A';
const shared='I:/EXODUSER-Storage/codex-takeover/title-signboard/shared';
const dest=path.resolve('assets/title-signboard/A');
(async()=>{
 fs.mkdirSync(dest,{recursive:true});
 fs.copyFileSync(source+'/master-7680x2160.png',dest+'/master-7680x2160.png');
 await sharp(source+'/master-7680x2160.png').resize(5760,1620).webp({quality:96,effort:6}).toFile(dest+'/still.webp');
 const rock=await sharp(source+'/layers/contact-rock.png').resize(5760,1620).png().toBuffer();
 await sharp(source+'/layers/background-plate.png').resize(5760,1620).composite([{input:rock}]).webp({quality:96,effort:6}).toFile(dest+'/background.webp');
 await sharp(source+'/layers/silvertail.png').resize(5760,1620).webp({lossless:true,effort:6}).toFile(dest+'/silvertail.webp');
 const W=1920,H=540,base=await sharp(source+'/layers/background-plate.png').resize(W,H).raw().toBuffer();
 const sky=await sharp(source+'/masks/sky.png').resize(W,H).removeAlpha().greyscale().raw().toBuffer();
 const river=await sharp(source+'/masks/river.png').resize(W,H).removeAlpha().greyscale().raw().toBuffer();
 const raw=Buffer.alloc(W*H*3);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x,r=base[i*3],g=base[i*3+1],b=base[i*3+2],v=y/H;
  raw[i*3]=Math.round(sky[i]*Math.min(1,Math.max(0,(.49-v)/.09)));
  // Restrict broad region masks to the river's illuminated water below the bridge.
  raw[i*3+1]=Math.round(river[i]*Math.min(1,Math.max(0,(v-.72)/.045))*Math.min(1,Math.max(0,(r-g*1.45-12)/45)));
  raw[i*3+2]=r>g*1.5&&r>50?Math.round(Math.min(255,(r-g)*1.4)):0;
 }
 await sharp(raw,{raw:{width:W,height:H,channels:3}}).blur(1.2).png().toFile(dest+'/motion-mask.png');
 const handImages=[];
 for(let i=0;i<6;i++)handImages.push({input:await sharp(shared+`/hand-${i}.png`).resize(256,456,{fit:'contain',background:'#0000'}).png().toBuffer(),left:i*256,top:0});
 await sharp({create:{width:1536,height:456,channels:4,background:'#0000'}}).composite(handImages).png().toFile(dest+'/hands.png');
 const manifest={approved:'A',sourceMaster:'master-7680x2160.png',sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync(source+'/master-7680x2160.png')).digest('hex'),master:[7680,2160],runtime:[5760,1620],mask:[1920,540],hands:{cells:6,cell:[256,456]},sourceNote:'Approved composite; background originally 2048x768, upscaled/reframed. Not native 8K generation.',files:{}};
 for(const f of fs.readdirSync(dest))if(f!=='manifest.json')manifest.files[f]=crypto.createHash('sha256').update(fs.readFileSync(dest+'/'+f)).digest('hex');
 fs.writeFileSync(dest+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest));
})().catch(e=>{console.error(e);process.exitCode=1;});

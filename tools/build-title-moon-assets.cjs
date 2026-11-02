/* Approved 2026-11-02 moon relocation. Cloud restoration is a built-in image edit;
 * only that local sky patch is adopted. Original character/fortress stay intact.
 * node tools/build-title-moon-assets.cjs <original-3840x1920.png> <cloud-edit.png>
 */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
sharp.concurrency(1);
const root=path.resolve('assets/title-signboard/C2'),work=process.env.TITLE_MOON_WORK||'I:/EXODUSER-Storage/codex-takeover/title-moon-20261102';
const from={x:1212,y:167},moon={x:1180,y:309,radius:79},scale=3840/2036;
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
async function hash(p){return crypto.createHash('sha256').update(await fs.readFile(p)).digest('hex');}
(async()=>{
 const [source,edit]=process.argv.slice(2);if(!source||!edit)throw Error('Original still and moon-free cloud edit required');
 const meta=await sharp(source).metadata();if(meta.width!==3840||meta.height!==1920)throw Error('Expected 3840x1920');
 await fs.mkdir(work,{recursive:true});
 // Resample generated patch to the exact input crop; adopt only old lunar halo.
 const sky=await sharp(edit).resize(760,850,{fit:'fill'}).ensureAlpha().raw().toBuffer();
 for(let y=0;y<850;y++)for(let x=0;x<760;x++){
  const d=Math.hypot((x+1940)/scale-from.x,y/scale-from.y);
  sky[(y*760+x)*4+3]=Math.round(255*(1-smooth((d-105)/65)));
 }
 const restored=await sharp(sky,{raw:{width:760,height:850,channels:4}}).png().toBuffer();
 await fs.writeFile(root+'/moon-cloud-restoration.png',restored);
 const size=460,left=Math.round(from.x*scale-size/2),top=Math.round(from.y*scale-size/2);
 const lunar=await sharp(source).extract({left,top,width:size,height:size}).ensureAlpha().raw().toBuffer();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const d=Math.hypot((x+left)/scale-from.x,(y+top)/scale-from.y);
  lunar[(y*size+x)*4+3]=Math.round(255*(1-smooth((d-81)/35)));
 }
 const disc=await sharp(lunar,{raw:{width:size,height:size,channels:4}}).png().toBuffer();
 const toLeft=Math.round(left+(moon.x-from.x)*scale),toTop=Math.round(top+(moon.y-from.y)*scale);
 const final=await sharp(source).composite([{input:restored,left:1940,top:0},{input:disc,left:toLeft,top:toTop}]).png().toBuffer();
 await fs.writeFile(work+'/C2-close-moon-lowered-3840x1920.png',final);
 await sharp(final).webp({quality:97,effort:4}).toFile(root+'/still.webp');
 // One local RGBA plate replaces BOTH old video moon and new moon area on every
 // frame. Wide inward feather retains the original sky motion at its boundary.
 const box={x:1025,y:0,w:335,h:460},b={left:Math.round(box.x*scale),top:0,width:Math.round(box.w*scale),height:Math.round(box.h*scale)};
 const plate=await sharp(final).extract(b).ensureAlpha().raw().toBuffer();
 for(let y=0;y<b.height;y++)for(let x=0;x<b.width;x++){
  const vx=(b.left+x)/scale,vy=y/scale;
  const old=1-smooth((Math.hypot(vx-from.x,vy-from.y)-122)/62);
  const moved=1-smooth((Math.hypot(vx-moon.x,vy-moon.y)-115)/46);
  // Feather before rectangle bounds; never introduce an alpha crop edge.
  const edge=smooth(Math.min(x,b.width-1-x,y===0?100:y,b.height-1-y)/40);
  plate[(y*b.width+x)*4+3]=Math.round(255*Math.max(old,moved)*edge);
 }
 await sharp(plate,{raw:{width:b.width,height:b.height,channels:4}}).webp({lossless:true,effort:4}).toFile(root+'/moon-static.webp');
 const manifest=JSON.parse(await fs.readFile(root+'/manifest.json','utf8'));
 manifest.moonRelocation={from,to:moon,delta4K:[toLeft-left,toTop-top],plate:{path:'assets/title-signboard/C2/moon-static.webp',box:[b.left/scale,0,b.width/scale,b.height/scale],size:[b.width,b.height]},cloudRestoration:'assets/title-signboard/C2/moon-cloud-restoration.png',method:'built-in image edit for old cloud spot; exact approved moon and halo extracted; local still plate masks original video moon after cloud flow',pulse:{seconds:10,opacity:[.01,.03],blend:'screen',radius:145},builder:'tools/build-title-moon-assets.cjs',sourceSHA256:await hash(source),editSHA256:await hash(edit),stillSHA256:await hash(root+'/still.webp'),plateSHA256:await hash(root+'/moon-static.webp')};
 manifest.stillRuntimeSHA256=manifest.moonRelocation.stillSHA256;
 manifest.staticComposition='Relocated still moon (1180,309), radius79 virtual; both moon disk and boot soles visible at 16:9/21:9/32:9; local feathered still plate masks video moon';
 await fs.writeFile(root+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify(manifest.moonRelocation));
})().catch(e=>{console.error(e);process.exitCode=1;});

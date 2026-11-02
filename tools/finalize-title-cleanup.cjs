/* Install a completed local compositor run and refresh exact runtime hashes. */
const fs=require('node:fs/promises'),cp=require('node:child_process'),crypto=require('node:crypto'),sharp=require('sharp');
const work=process.argv[2],ffmpeg=process.argv[3];
const asset='assets/title-signboard/C2',root='I:/EXODUSER-Storage/codex-takeover/title-final-three-20261102';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 if(!work||!ffmpeg)throw Error('Completed render directory and absolute ffmpeg required');
 for(const width of [2560,1920]){
  const r=cp.spawnSync(ffmpeg,['-y','-v','error','-i',work+'/clean-3840.mp4','-an','-vf',`scale=${width}:${width/2}:flags=lanczos`,'-c:v','libx264','-threads','2','-preset','medium','-crf','16','-pix_fmt','yuv420p','-g','48','-movflags','+faststart',work+`/clean-${width}.mp4`],{windowsHide:true,encoding:'utf8'});
  if(r.error)throw r.error;if(r.status)throw Error(r.stderr);
 }
 await sharp(work+'/clean-still.png').webp({lossless:true,effort:4}).toFile(asset+'/still.webp');
 await fs.copyFile(work+'/moon-disc.webp',asset+'/moon-static.webp');
 await fs.copyFile(work+'/cloud-video-mask.png',asset+'/cloud-video-mask.png');
 const m=JSON.parse(await fs.readFile(asset+'/manifest.json','utf8'));
 for(const width of [3840,2560,1920]){
  const target=`video/title_motion_C2_close_${width}_20261102.mp4`;
  await fs.copyFile(work+`/clean-${width}.mp4`,target);const b=await fs.readFile(target);
  Object.assign(m.variants[width],{bytes:b.length,sha256:hash(b)});
 }
 const still=await fs.readFile(asset+'/still.webp'),moon=await fs.readFile(asset+'/moon-static.webp'),cloud=await fs.readFile(asset+'/cloud-video-mask.png');
 m.stillSource=root+'/C2-close-backblade-moon-3840x1920.png';m.stillSHA256=hash(await fs.readFile(m.stillSource));m.stillRuntimeSHA256=hash(still);
 m.moonRelocation.stillSHA256=hash(still);m.moonRelocation.plateSHA256=hash(moon);m.maskHashes['cloud-video-mask.png']=hash(cloud);m.cloudFlow.maskSHA256=hash(cloud);
 const oldRuntime=m.cleanup.runtimeCloudShader;
 m.cleanup=JSON.parse(await fs.readFile(work+'/build-receipt.json','utf8'));m.cleanup.runtimeCloudShader=oldRuntime;
 m.cleanup.runtimeCharacterShader={language:'GLSL ES 1.00',size:[3840,1920],source:'corrected still.webp only',maxDisplacementPixels:[2.4,1.1],periodSeconds:206/24,hair:{x:[2830,3180],yFade:[880,970]},cape:{x:[3060,3280],yFadeIn:[890,980],yFadeOut:[1290,1380]},rigid:'upper-back rotary hub, blade corridor, body, hands, boots',fallback:'same single-source B baked into all video variants'};
 m.bladeCorrection={reference:'img/title_bg_20261028.jpg',lock:'docs/archetypes/silvertail/SILVERTAIL_LOCKED_SPEC_v1_2.md',source:m.stillSource,method:'Built-in imagegen cropped edit, adopt only hub and blade corridor; other source pixels byte-identical',receipt:JSON.parse(await fs.readFile(root+'/blade-edit-receipt.json','utf8')),prompt:'Small upper-back rotary hub; descending black/silver blade behind torso, right mid-calf tip; hands empty. Face, pose, hair, armor, cape, boots and environment unchanged.',toolCalls:2,externalPaidGeneration:0};
 m.staticComposition='B: corrected still character fully covers video character; rigid hub/blade/body/hands/boots, hair/cape tips only inverse displacement. Kling sky + flow, separate relocated moon disc.';
 m.bladeCorrection.receipt.edit=root+'/sword-edit-selected.png';
 await fs.writeFile(asset+'/manifest.json',JSON.stringify(m,null,2)+'\n');
 console.log(JSON.stringify({variants:m.variants,stillSHA256:m.stillRuntimeSHA256}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});

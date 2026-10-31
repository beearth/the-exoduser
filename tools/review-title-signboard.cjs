const fs=require('node:fs'),path=require('node:path');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'G:/exoduser']}));
const out='I:/EXODUSER-Storage/codex-takeover/title-signboard/runtime-A';
const master='G:/exoduser/tmp/design-review/20261031_title_signboard/A/master-7680x2160.png';
(async()=>{
 const ref=await sharp(master).resize(3840,1080).png().toBuffer(),shot=await sharp(out+'/menu-3840.png').png().toBuffer();
 await sharp({create:{width:3840,height:2160,channels:3,background:'#101014'}}).composite([{input:ref,left:0,top:0},{input:shot,left:0,top:1080}]).jpeg({quality:97}).toFile(out+'/reference-vs-runtime-1x.jpg');
 const crops={face:{left:2170,top:175,width:240,height:270},feet:{left:2160,top:830,width:460,height:220},moon:{left:1420,top:40,width:460,height:360},riverHands:{left:1350,top:760,width:600,height:320},hairCloth:{left:2330,top:180,width:520,height:650}};
 for(const [name,region] of Object.entries(crops)){
  await sharp(shot).extract(region).png().toFile(out+`/${name}-1x.png`);
  const first=await sharp(out+'/menu-3840.png').extract(region).png().toBuffer(),last=await sharp(out+'/menu-3840-end.png').extract(region).png().toBuffer();
  await sharp({create:{width:region.width*2,height:region.height,channels:3,background:'#101014'}}).composite([{input:first,left:0,top:0},{input:last,left:region.width,top:0}]).png().toFile(out+`/${name}-motion-pair.png`);
 }
 // Six real browser frames, equal spacing, at 1x in selected moving areas.
 for(const regionName of ['moon','riverHands','hairCloth']){
  const region=crops[regionName],folder=out+'/frames-3840';const files=fs.readdirSync(folder).filter(f=>f.endsWith('.jpg')).sort();const parts=[];
  for(let i=0;i<6;i++){const f=files[Math.floor(i*(files.length-1)/5)];parts.push({input:await sharp(folder+'/'+f).extract(region).png().toBuffer(),left:i*region.width,top:0});}
  await sharp({create:{width:region.width*6,height:region.height,channels:3,background:'#101014'}}).composite(parts).png().toFile(out+`/${regionName}-six-frames-1x.png`);
 }
 const r=JSON.parse(fs.readFileSync(out+'/qa-receipt.json'));const summary={sizes:r.sizes.map(s=>s.size),videos:r.videos,errors:r.errors,http:r.http,reducedStopped:r.reduced.before.frames===r.reduced.after.frames,contextLoss:r.contextLoss,missingLayer:r.missingLayer,exit:r.exit};
 fs.writeFileSync(out+'/review-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
})().catch(e=>{console.error(e);process.exitCode=1;});

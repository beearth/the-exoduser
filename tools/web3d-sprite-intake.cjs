// Read-only intake of already generated HD-2D art. No paid generation or edits to its owner.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source='G:/exoduser/tmp/design-review/20261031_hd2d_sprites';
(async()=>{
 const out=path.join(root,'assets/web3d/sprites');await fs.mkdir(out,{recursive:true});const records=[];
 for(const [name,dir]of [['warrior-base','remaster-v2/warrior'],['warrior-attack','remaster-v2/warrior-attack-r3'],['warrior-dash','remaster-v2/warrior-dash-r3']])
  for(const normal of [false,true]){const src=source+'/'+dir+'/atlas'+(normal?'.normal':'')+'.png',dest=out+'/'+name+(normal?'.normal':'')+'.png',data=await fs.readFile(src);await fs.writeFile(dest,data);records.push({source:src,path:path.relative(root,dest).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(data).digest('hex'),bytes:data.length});}
 for(const dir of ['south','south_east','east','north_east','north','north_west','west','south_west'])
  for(const normal of [false,true]){const src=source+'/remaster/enemy-alpha-contract/atlas_ch1_8dir_'+dir+(normal?'.normal':'')+'.png',dest=out+'/enemy-'+dir+(normal?'.normal':'')+'.png',data=await fs.readFile(src);await fs.writeFile(dest,data);records.push({source:src,path:path.relative(root,dest).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(data).digest('hex'),bytes:data.length});}
 const sharp=require('sharp');sharp.concurrency(1);
 for(const dir of ['south','south_east','east','north_east','north','north_west','west','south_west']){
   const src=source+'/technical-2x-v2/enemy/atlas_ch1_8dir_walk_'+dir+'.normal.png',dest=out+'/enemy-walk-'+dir+'.normal.webp';
   const input=await fs.readFile(src);await sharp(input).resize(8192,1280,{kernel:'nearest'}).webp({lossless:true}).toFile(dest);const data=await fs.readFile(dest);
   records.push({source:src,path:path.relative(root,dest).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(data).digest('hex'),sourceSHA256:crypto.createHash('sha256').update(input).digest('hex'),bytes:data.length,operation:'Existing technical normal 16384x2560 to native 8192x1280, nearest / lossless WebP. No painted art generated.'});
 }
 await fs.writeFile(out+'/intake.json',JSON.stringify({sourceReport:source+'/REPORT.md',status:'Existing owner RETOUCH candidates; web opt-in review only, not Unity approval. Native walk overlays retained.',normal:'Owner silhouette bevel normals, not sculpted surface normals. Walk normals prepared offline to avoid first-movement stalls.',files:records},null,2));console.log(records.length+' original/derived color/normal files, '+records.reduce((n,r)=>n+r.bytes,0)+' bytes; source files unmodified');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

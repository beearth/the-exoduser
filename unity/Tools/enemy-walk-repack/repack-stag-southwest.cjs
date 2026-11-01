#!/usr/bin/env node
// One-shot recovery from the original tracked ZIP. No generation or direction fallback.
// node repack-stag-southwest.cjs <existing sharp module path> <new absolute evidence dir>
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../../..'),sharp=require(process.argv[2]),out=process.argv[3];
assert(out&&path.isAbsolute(out)&&!fs.existsSync(out),'a new absolute evidence directory is required');
assert(!path.relative(repo,path.resolve(out)).split(path.sep).every(part=>part!=='..'),'evidence must be outside the checkout');
const BASE='18b99a70768cfe235e1474aefe9fe4fbf6439258',ARCHIVE_REF='84dee8862e4debdf8af749cbbeb40dd6ab783ff4';
const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+repo,...args],{cwd:repo,windowsHide:true,maxBuffer:64*1024*1024});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const blob=b=>crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
const hashes=["44e5881329cd79741610cd926b13445b66b0f0514f406d7422ca7b939956a4f2","1c7f806d795bb20b596a7f70b6c6793ca1f6ddae60d6f0e6c06845626a391187","397d8422a78ea3fbbad00fd98f0910603306d59c490d2690296488a4200a154d","09685567d6b34e258141e2e45ee527a0a8a447206883dc3ecf3126df813bb9a3","50dbed703d3a4b44b3a13974c871efb8c40e3c927680f4e2207f18d05e77ccec","71c1055dcad0aa84e3a0d6fea71e61744b67402cb36d4df3a626d69519e769da"];
const atlas='img/atlas_ch1_8dir_walk_south_west.png',mirror='unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_south_west.png',metadata='img/atlas_ch1_8dir_walk.json';
const read=p=>fs.readFileSync(path.join(repo,p));
function zipEntries(zip){
  const result=new Map();let p=0;
  while(p+30<zip.length&&zip.readUInt32LE(p)===0x04034b50){
    assert.equal(zip.readUInt16LE(p+8),0,'only original stored ZIP entries are accepted');
    assert.equal(zip.readUInt16LE(p+6)&9,0,'no encrypted or streamed ZIP entries');
    const size=zip.readUInt32LE(p+18),nameSize=zip.readUInt16LE(p+26),extra=zip.readUInt16LE(p+28),name=zip.toString('utf8',p+30,p+30+nameSize),start=p+30+nameSize+extra;
    assert(start+size<=zip.length);assert(!result.has(name));result.set(name,zip.subarray(start,start+size));p=start+size;
  }
  assert.equal(result.size,289,'original archive entry count');return result;
}
async function main(){
  assert.equal(git('rev-parse','HEAD').toString().trim(),BASE,'start on the exact approved common');
  // This common commit has one CRLF line in an otherwise LF PS1 blob while
  // .gitattributes checks it out as CRLF. Preserve that checkout conversion;
  // reject every content change and every other dirty tracked path.
  const checkoutEolPaths=git('diff','--name-only').toString().trim().split(/\r?\n/).filter(Boolean);
  for(const p of checkoutEolPaths){
    assert.equal(p,'unity/Tools/devtools/exo-unity.ps1','unexpected tracked WORK');
    assert.equal(read(p).toString('utf8').replace(/\r\n/g,'\n'),git('show',BASE+':'+p).toString('utf8').replace(/\r\n/g,'\n'),'external script content changed');
  }
  assert.equal(git('diff','--cached','--name-only').length,0,'INDEX must be clean');
  const zip=git('show',ARCHIVE_REF+':blender/sprites/boss_ch1_stag.zip');
  assert.equal(sha(zip),'b99a1415351875f6edd1d90df6ac307bc9f89d215cefb3b2ec421c6d7fa2b861');assert.equal(blob(zip),'0f9878b4b07368724bc4507a909c4a1855e8decc');
  const entries=zipEntries(zip),meta=JSON.parse(entries.get('metadata.json'));
  assert.equal(meta.character.id,'1d2cba78-f46f-4133-8efa-d8e4a8d9e875');assert.equal(meta.character.name,'boss_ch1_stag');assert.equal(meta.character.directions,8);
  const packedMetadata=read(metadata);assert.equal(blob(packedMetadata),'b7358ac3baf3346ad14c7f731eb6080dc70dffa0');
  const pack=JSON.parse(packedMetadata);assert.deepEqual(pack.mobs.boss_ch1_stag,{idx:22,col:6,row:2});assert.deepEqual(pack.sampleIndices,[0,1,3,5]);assert.equal(Object.keys(pack.sampleIndicesByMob).length,17);assert(!pack.sampleIndicesByMob.boss_ch1_stag);assert.equal(pack.framesPerMob,4);assert.equal(pack.cell,256);
  const before=read(atlas);assert.equal(blob(before),'6d7f8d847dca419bb242f6e59e8bbcab55cee2fc');assert(before.equals(read(mirror)));
  let existingVerified=0;const sources=[],sourceManifest=[];
  for(const [entry,bytes] of entries){
    if(!entry.startsWith('animations/running-6-frames/'))continue;
    const tail=entry.slice('animations/running-6-frames/'.length);
    if(!tail.startsWith('south-west/')){assert(bytes.equals(git('show',BASE+':img/ch1_8dir/boss_ch1_stag/walk/'+tail)),entry);existingVerified++;}
  }
  assert.equal(existingVerified,42);assert(entries.get('rotations/south-west.png').equals(git('show',BASE+':img/ch1_8dir/boss_ch1_stag/south-west.png')));
  for(let i=0;i<6;i++){
    const tail=`frame_${String(i).padStart(3,'0')}.png`,entry='animations/running-6-frames/south-west/'+tail,p='img/ch1_8dir/boss_ch1_stag/walk/south-west/'+tail,bytes=entries.get(entry);
    assert(bytes);assert.equal(sha(bytes),hashes[i]);assert(!fs.existsSync(path.join(repo,p)),`refuse existing source ${p}`);
    assert.equal(git('ls-tree',BASE,'--',p).length,0);
    // Match the current repacker's exact sharp resize pipeline. These sources are already 256 square.
    const decoded=await sharp(bytes).resize(256,256).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(decoded.info.width,256);assert.equal(decoded.info.height,256);assert.equal(decoded.info.channels,4);
    let alpha=0;for(let j=3;j<decoded.data.length;j+=4)if(decoded.data[j])alpha++;assert(alpha>0);
    sources.push({path:p,bytes,rgba:decoded.data});sourceManifest.push({path:p,archiveEntry:entry,sha256:sha(bytes),blob:blob(bytes),width:256,height:256,alpha});
  }
  const decoded=await sharp(before).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(decoded.info.width,8192);assert.equal(decoded.info.height,1280);assert.equal(decoded.info.channels,4);
  const after=Buffer.from(decoded.data),selected=[0,1,3,5];
  for(let frame=0;frame<4;frame++)for(let y=0;y<256;y++){
    const start=((512+y)*8192+6144+frame*256)*4;
    for(let i=start+3;i<start+1024;i+=4)assert.equal(decoded.data[i],0,'expected blank baseline cells');
    sources[selected[frame]].rgba.copy(after,start,y*1024,(y+1)*1024);
  }
  let outsideDiff=0;
  for(let y=0;y<1280;y++){
    const row=y*8192*4;
    if(y>=512&&y<768){if(!decoded.data.subarray(row,row+6144*4).equals(after.subarray(row,row+6144*4)))outsideDiff++;if(!decoded.data.subarray(row+7168*4,row+8192*4).equals(after.subarray(row+7168*4,row+8192*4)))outsideDiff++;}
    else if(!decoded.data.subarray(row,row+8192*4).equals(after.subarray(row,row+8192*4)))outsideDiff++;
  }
  assert.equal(outsideDiff,0);
  const output=await sharp(after,{raw:{width:8192,height:1280,channels:4}}).png({compressionLevel:9}).toBuffer();assert((await sharp(output).ensureAlpha().raw().toBuffer()).equals(after));
  // All data/geometry/source checks complete before any product write. Preserve exact inputs and output first.
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'original-archive.zip'),zip);fs.writeFileSync(path.join(out,'before-img.png'),before);fs.writeFileSync(path.join(out,'before-unity.png'),read(mirror));fs.writeFileSync(path.join(out,'metadata-unchanged.json'),packedMetadata);fs.writeFileSync(path.join(out,'after.png'),output);
  for(const s of sources)fs.writeFileSync(path.join(out,path.basename(s.path)),s.bytes);
  const receipt={base:BASE,archiveRef:ARCHIVE_REF,archiveBlob:blob(zip),archiveSHA256:sha(zip),existingVerified,sourceManifest,packedSourceIndices:selected,rect:[6144,512,1024,256],beforeSHA256:sha(before),afterSHA256:sha(output),afterBlob:blob(output),outsideRGBAChangedBytes:0,sharpVersion:sharp.versions.sharp,preservedCheckoutEolPaths:checkoutEolPaths,writtenPaths:[...sources.map(s=>s.path),atlas,mirror],visualQA:false};
  fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
  // Compare-and-set boundary: no file observed above may drift while planning or backing up.
  assert.equal(git('rev-parse','HEAD').toString().trim(),BASE);assert(read(atlas).equals(before));assert(read(mirror).equals(before));assert(read(metadata).equals(packedMetadata));for(const s of sources)assert(!fs.existsSync(path.join(repo,s.path)));
  for(const s of sources){fs.mkdirSync(path.dirname(path.join(repo,s.path)),{recursive:true});fs.writeFileSync(path.join(repo,s.path),s.bytes,{flag:'wx'});}
  fs.writeFileSync(path.join(repo,atlas),output);fs.writeFileSync(path.join(repo,mirror),output);
  console.log(JSON.stringify({result:'SOURCE_REPAIRED',sources:6,cells:4,outsideRGBAChangedBytes:0,afterSHA256:sha(output),evidence:out,visualQA:false}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});

#!/usr/bin/env node
// Independent asset acceptance check. Run before and after the repair.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../../..'),sharp=require(process.argv[2]);
const BASE='18b99a70768cfe235e1474aefe9fe4fbf6439258';
const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+repo,...args],{cwd:repo,windowsHide:true,maxBuffer:64*1024*1024});
const baseline=p=>git('show',BASE+':'+p);
const current=p=>fs.existsSync(path.join(repo,p))?fs.readFileSync(path.join(repo,p)):git('show','HEAD:'+p);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const hashes=["44e5881329cd79741610cd926b13445b66b0f0514f406d7422ca7b939956a4f2","1c7f806d795bb20b596a7f70b6c6793ca1f6ddae60d6f0e6c06845626a391187","397d8422a78ea3fbbad00fd98f0910603306d59c490d2690296488a4200a154d","09685567d6b34e258141e2e45ee527a0a8a447206883dc3ecf3126df813bb9a3","50dbed703d3a4b44b3a13974c871efb8c40e3c927680f4e2207f18d05e77ccec","71c1055dcad0aa84e3a0d6fea71e61744b67402cb36d4df3a626d69519e769da"];
async function rgba(b){return sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});}
function cellAlpha(data,width,x,y){let count=0;for(let j=0;j<256;j++)for(let i=0;i<256;i++)if(data[((y+j)*width+x+i)*4+3])count++;return count;}
async function main(){
  const source=[],sourceProof=[];
  for(let i=0;i<6;i++){
    const p=`img/ch1_8dir/boss_ch1_stag/walk/south-west/frame_${String(i).padStart(3,'0')}.png`;
    assert(fs.existsSync(path.join(repo,p)),`missing recovered original: ${p}`);
    const bytes=fs.readFileSync(path.join(repo,p));assert.equal(sha(bytes),hashes[i],`original byte hash ${i}`);
    const decoded=await rgba(bytes);assert.equal(decoded.info.width,256);assert.equal(decoded.info.height,256);assert.equal(decoded.info.channels,4);
    const alpha=cellAlpha(decoded.data,256,0,0);assert(alpha>0);source.push(decoded.data);sourceProof.push({path:p,sha256:sha(bytes),alpha});
  }
  const metadataPath='img/atlas_ch1_8dir_walk.json';assert(current(metadataPath).equals(baseline(metadataPath)),'metadata bytes changed');
  const metadata=JSON.parse(current(metadataPath));assert.equal(Object.keys(metadata.sampleIndicesByMob).length,17);assert.deepEqual(metadata.sampleIndices,[0,1,3,5]);assert(!metadata.sampleIndicesByMob.boss_ch1_stag);assert(!metadata.mobs.skinless_hound);
  const directions=['south','south_east','east','north_east','north','north_west','west','south_west'];
  let beforeEmpty=0,afterEmpty=0,changedBytes=0,changedPixels=0,outsideChangedBytes=0,hiddenRGBChangedBytes=0;const atlasProof=[];
  for(const direction of directions){
    const p=`img/atlas_ch1_8dir_walk_${direction}.png`,mirror=`unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_${direction}.png`;
    const oldBytes=baseline(p),newBytes=current(p);assert(newBytes.equals(current(mirror)),`mirror bytes ${direction}`);
    const old=await rgba(oldBytes),now=await rgba(newBytes);assert.equal(now.info.width,8192);assert.equal(now.info.height,1280);
    if(direction!=='south_west')assert(newBytes.equals(oldBytes),`other direction bytes ${direction}`);
    for(const m of Object.values(metadata.mobs))for(let f=0;f<4;f++){
      if(!cellAlpha(old.data,8192,(m.col*4+f)*256,m.row*256))beforeEmpty++;
      if(!cellAlpha(now.data,8192,(m.col*4+f)*256,m.row*256))afterEmpty++;
    }
    if(direction==='south_west'){
      for(let pixel=0;pixel<8192*1280;pixel++){
        const x=pixel%8192,y=Math.floor(pixel/8192),allowed=x>=6144&&x<7168&&y>=512&&y<768;let changed=false;
        for(let ch=0;ch<4;ch++)if(old.data[pixel*4+ch]!==now.data[pixel*4+ch]){changedBytes++;changed=true;if(!allowed)outsideChangedBytes++;if(ch<3&&!old.data[pixel*4+3]&&!now.data[pixel*4+3])hiddenRGBChangedBytes++;}
        if(changed)changedPixels++;
      }
      assert.equal(outsideChangedBytes,0,'all RGBA bytes outside the four cells');
      for(let f=0;f<4;f++)for(let y=0;y<256;y++){
        const start=((512+y)*8192+6144+f*256)*4;
        assert(now.data.subarray(start,start+1024).equals(source[[0,1,3,5][f]].subarray(y*1024,(y+1)*1024)),`packed source row ${f}/${y}`);
      }
    }
    atlasProof.push({direction,beforeSHA256:sha(oldBytes),afterSHA256:sha(newBytes),unchanged:oldBytes.equals(newBytes)});
  }
  assert.equal(beforeEmpty,16);assert.equal(afterEmpty,12);assert(changedBytes>0);
  const result={result:'PASS',base:BASE,sourceProof,sourceFrames:6,packedSourceIndices:[0,1,3,5],metadataByteIdentical:true,overrideCount:17,beforeEmpty,afterEmpty,changedBytes,changedPixels,outsideChangedBytes,hiddenRGBChangedBytes,atlasProof,visualQA:false};
  if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({...result,sourceProof:undefined,atlasProof:undefined}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});

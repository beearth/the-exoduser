#!/usr/bin/env node
// Repack only the 16 verified four-source-frame CH1 walk skins. No art generation.
// Usage: node repack-four-frame-mobs.cjs <tracked img source root> <sharp module path>
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
if(process.argv.length!==4)throw new Error('Expected source img root and sharp module path only');
const sourceRoot=path.resolve(process.argv[2]),sharp=require(process.argv[3]);
const repo=path.resolve(__dirname,'../../..');
const atlasRoot=path.join(repo,'img'),unityRoot=path.join(repo,'unity/Assets/Exoduser/Resources/Art/enemy');
const names=['apostle_mass','apostle_knight','soul_flame','hive_bloater','spine_beast','flesh_crawler','carapace_predator','bone_centipede_pro','gas_zombie','needle_tentacle','rotting_slime_mass','flesh_eye_mass','corrupted_wolf','eye_stalker_pro','iron_butcher_pro','plague_doctor_pro'];
const dirs=['south','south-east','east','north-east','north','north-west','west','south-west'];
const CELL=256;
const git=(...args)=>cp.execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
const blob=buffer=>crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
const same=(a,b)=>Buffer.compare(a,b)===0;
const alpha=buffer=>{let n=0;for(let i=3;i<buffer.length;i+=4)if(buffer[i])n++;return n;};
function cell(raw,width,x,y){const out=Buffer.alloc(CELL*CELL*4);for(let row=0;row<CELL;row++)raw.copy(out,row*CELL*4,((y+row)*width+x)*4,((y+row)*width+x+CELL)*4);return out;}
function put(raw,width,x,y,source){for(let row=0;row<CELL;row++)source.copy(raw,((y+row)*width+x)*4,row*CELL*4,(row+1)*CELL*4);}
function closeEnough(actual,expected){let changed=0;for(let i=0;i<actual.length;i++)if(actual[i]!==expected[i]){if(Math.abs(actual[i]-expected[i])>1)return false;changed++;}return changed<=113;}
function unchangedOutside(before,after,width,height,intervalsByRow){
  const stride=width*4;
  for(let y=0;y<height;y++){
    const intervals=(intervalsByRow.get(Math.floor(y/CELL))||[]).slice().sort((a,b)=>a[0]-b[0]);
    let previous=0;
    for(const [left,right] of intervals){if(!same(before.subarray(y*stride+previous*4,y*stride+left*4),after.subarray(y*stride+previous*4,y*stride+left*4)))return false;previous=right;}
    if(!same(before.subarray(y*stride+previous*4,(y+1)*stride),after.subarray(y*stride+previous*4,(y+1)*stride)))return false;
  }
  return true;
}
async function main(){
  const metadataPath=path.join(atlasRoot,'atlas_ch1_8dir_walk.json'),oldMetadata=fs.readFileSync(metadataPath);
  if(blob(oldMetadata)!==git('rev-parse','HEAD:img/atlas_ch1_8dir_walk.json'))throw new Error('metadata changed from HEAD');
  const metadata=JSON.parse(oldMetadata),whitelist=new Set(names);
  if(metadata.cell!==CELL||metadata.framesPerMob!==4||JSON.stringify(metadata.sampleIndices)!=='[0,1,3,5]'||JSON.stringify(metadata.sampleIndicesByMob)!=='{"blood_swarm":[0,1,2,3]}')throw new Error('unexpected metadata contract');
  for(const name of names)if(!metadata.mobs[name])throw new Error(`${name}: not in walk metadata`);
  if(whitelist.size!==16)throw new Error('whitelist duplication');
  const staged=[];
  for(const direction of dirs){
    const fileName=`atlas_ch1_8dir_walk_${direction.replaceAll('-','_')}.png`,imgPath=path.join(atlasRoot,fileName),unityPath=path.join(unityRoot,fileName),imgBytes=fs.readFileSync(imgPath),unityBytes=fs.readFileSync(unityPath);
    if(!same(imgBytes,unityBytes)||blob(imgBytes)!==git('rev-parse',`HEAD:img/${fileName}`)||blob(unityBytes)!==git('rev-parse',`HEAD:unity/Assets/Exoduser/Resources/Art/enemy/${fileName}`))throw new Error(`${fileName}: baseline mismatch`);
    const decoded=await sharp(imgBytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    if(decoded.info.width!==8192||decoded.info.height!==1280||decoded.info.channels!==4)throw new Error(`${fileName}: geometry`);
    const before=Buffer.from(decoded.data),after=Buffer.from(decoded.data),intervalsByRow=new Map();
    for(const name of names){
      const position=metadata.mobs[name],x=position.col*4*CELL,y=position.row*CELL;
      const original=[];
      for(let frame=0;frame<4;frame++){
        const rel=`img/ch1_8dir/${name}/walk/${direction}/frame_${String(frame).padStart(3,'0')}.png`,sourceFile=path.join(sourceRoot,'ch1_8dir',name,'walk',direction,`frame_${String(frame).padStart(3,'0')}.png`);
        const bytes=fs.readFileSync(sourceFile);
        if(blob(bytes)!==git('rev-parse',`HEAD:${rel}`))throw new Error(`${rel}: original source differs from HEAD`);
        const resized=await sharp(bytes).resize(CELL,CELL).ensureAlpha().raw().toBuffer({resolveWithObject:true});
        if(resized.info.width!==CELL||resized.info.height!==CELL||resized.info.channels!==4||alpha(resized.data)===0)throw new Error(`${rel}: invalid source frame`);
        original.push(resized.data);
      }
      const sourceDir=path.join(sourceRoot,'ch1_8dir',name,'walk',direction);
      if(fs.readdirSync(sourceDir).filter(n=>/^frame_\d+\.png$/.test(n)).length!==4)throw new Error(`${name}/${direction}: source count changed`);
      const old=[0,1,2,3].map(frame=>cell(before,decoded.info.width,x+frame*CELL,y));
      if(!closeEnough(old[0],original[0])||!closeEnough(old[1],original[1])||!closeEnough(old[2],original[3])||alpha(old[3])!==0)throw new Error(`${name}/${direction}: expected 0,1,3,empty baseline not found`);
      put(after,decoded.info.width,x+2*CELL,y,original[2]);put(after,decoded.info.width,x+3*CELL,y,old[2]);
      if(!same(cell(before,decoded.info.width,x,y),cell(after,decoded.info.width,x,y))||!same(cell(before,decoded.info.width,x+CELL,y),cell(after,decoded.info.width,x+CELL,y))||!same(cell(after,decoded.info.width,x+3*CELL,y),old[2])||alpha(cell(after,decoded.info.width,x+2*CELL,y))===0)throw new Error(`${name}/${direction}: output cell verification failed`);
      const intervals=intervalsByRow.get(position.row)||[];intervals.push([x+2*CELL,x+4*CELL]);intervalsByRow.set(position.row,intervals);
    }
    if(!unchangedOutside(before,after,decoded.info.width,decoded.info.height,intervalsByRow))throw new Error(`${fileName}: RGBA changed outside whitelist cells`);
    const output=await sharp(after,{raw:{width:decoded.info.width,height:decoded.info.height,channels:4}}).png({compressionLevel:9}).toBuffer();
    const check=await sharp(output).ensureAlpha().raw().toBuffer();
    if(!same(check,after))throw new Error(`${fileName}: encoded pixels changed`);
    staged.push({imgPath,unityPath,output,direction});
  }
  for(const name of names)metadata.sampleIndicesByMob[name]=[0,1,2,3];
  const metadataOutput=Buffer.from(JSON.stringify(metadata,null,2)+'\n');
  // All source and RGBA checks completed before writing any product file.
  for(const item of staged){fs.writeFileSync(item.imgPath,item.output);fs.writeFileSync(item.unityPath,item.output);}
  fs.writeFileSync(metadataPath,metadataOutput);
  console.log(JSON.stringify({skins:names.length,directions:dirs.length,repairedBlankCells:names.length*dirs.length,changedCellPositions:names.length*dirs.length*2,files:staged.length*2+1}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

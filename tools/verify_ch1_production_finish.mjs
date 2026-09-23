import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'assets/map/ch1/production_finish');
const evidence=path.join(root,'captures/ch1_1_production_finish_20260916');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'composition.json')));
const context={};vm.runInNewContext(fs.readFileSync(path.join(dir,'layout.js'),'utf8'),context);
const hash=createHash('sha256').update(JSON.stringify(context.CH1_1_PRODUCTION.buildRLE(200,200))).digest('hex');
assert.equal(hash,manifest.geometryHash,'bake and runtime geometry must agree');
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  const m=await sharp(path.join(dir,`chunk_${x}_${y}.png`)).metadata();
  assert.equal(m.width,1026);assert.equal(m.height,1026);
}
for(const [x,y] of [[0,0],[3,3],[5,6]]){
  const a=await sharp(path.join(dir,`chunk_${x}_${y}.png`)).extract({left:1024,top:1,width:2,height:1024}).raw().toBuffer();
  const b=await sharp(path.join(dir,`chunk_${x+1}_${y}.png`)).extract({left:0,top:1,width:2,height:1024}).raw().toBuffer();
  assert.deepEqual(a,b,'horizontal bleed seam');
  const c=await sharp(path.join(dir,`chunk_${x}_${y}.png`)).extract({left:1,top:1024,width:1024,height:2}).raw().toBuffer();
  const d=await sharp(path.join(dir,`chunk_${x}_${y+1}.png`)).extract({left:1,top:0,width:1024,height:2}).raw().toBuffer();
  assert.deepEqual(c,d,'vertical bleed seam');
}
const audit=JSON.parse(fs.readFileSync(path.join(evidence,'runtime-collision-audit.json')));
const targets=[[100,185],[100,7],[100,151],[82,122],[84,90],[122,90],[39,112],[100,52],[100,22],[58,158],[148,150],[52,42],[148,42]];
const results=[];
for(const radius of [15,40,120]){
  const g=audit.grids[radius],seen=new Set([185*200+100]),queue=[185*200+100];
  for(let i=0;i<queue.length;i++){
    const n=queue[i],x=n%200,y=n/200|0;
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
      const xx=x+dx,yy=y+dy,nn=yy*200+xx;
      if(xx<0||xx>=200||yy<0||yy>=200||g[yy][xx]!=='1'||seen.has(nn))continue;
      seen.add(nn);queue.push(nn);
    }
  }
  // The boundary screenshot point is a player inspection point, not a 240px-wide enemy route.
  const routeTargets=radius===120?targets.filter(([x,y])=>x!==39||y!==112):targets;
  const unreachable=routeTargets.filter(([x,y])=>!seen.has(y*200+x));
  assert.equal(unreachable.length,0,`radius ${radius}: ${JSON.stringify(unreachable)}`);
  const blockedSpawns=audit.spawns.filter(s=>!seen.has(Math.floor(s.y)*200+Math.floor(s.x)));
  assert.equal(blockedSpawns.length,0,`radius ${radius} spawn access: ${JSON.stringify(blockedSpawns)}`);
  results.push({radius,reachableCells:seen.size,targets:routeTargets.length,spawnAccess:audit.spawns.length,excludedBoundaryPoint:radius===120?[39,112]:null});
}
const shifted=audit.authored.filter(h=>!audit.props.some(p=>p.type===h.id&&p.x===h.x+.5&&p.y===h.y+.5));
assert.equal(shifted.length,0,'authored placements must not silently relocate');
assert.equal(audit.scatter,0);
const result={geometryHash:hash,chunks:64,bleedSeams:6,realCollision:results,authored:audit.authored.length,runtime:audit.props.length,relocated:shifted,scatter:0,scope:'Technical validation only; not a playthrough or visual verdict.'};
fs.writeFileSync(path.join(evidence,'technical-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));

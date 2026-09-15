import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createHash} from 'node:crypto';

async function packer(){
 let mod;
 try{mod=await import('../tools/pack-silvertail-remake.mjs');}catch(e){assert.fail('sprite packer must exist: '+e.code);}
 return mod;
}
test('nine complete poses are detected despite crossing nominal grid lines',async()=>{
 const {findPoseBoxes}=await packer(),width=90,height=90,data=new Uint8Array(width*height*4);
 for(let r=0;r<3;r++)for(let c=0;c<3;c++){
  const x=5+c*30,y=2+r*30;
  for(let py=y;py<y+26;py++)for(let px=x;px<x+14;px++)data[(py*width+px)*4+3]=255;
 }
 // A sword reaches past the first column boundary, without touching the next actor.
 for(let x=19;x<34;x++)data[(74*width+x)*4+3]=255;
 const boxes=findPoseBoxes(data,width,height);
 assert.equal(boxes.length,9);assert.equal(boxes[6].right,34);
 assert.ok(boxes[0].top<boxes[3].top);assert.ok(boxes[0].left<boxes[1].left);
});
test('packing uses a shared pose scale and duplicates only the idle frame',async()=>{
 const {makeFramePlan}=await packer();
 const boxes=Array.from({length:9},(_,i)=>({left:(i%3)*100+20,top:Math.floor(i/3)*100+10,right:(i%3)*100+60,bottom:Math.floor(i/3)*100+90}));
 boxes[6].right+=30;
 const plan=makeFramePlan(boxes,48);
 assert.deepEqual(plan.sourceFrames,[0,0,1,2,3,4,5,6,7,8]);
 assert.ok(plan.scale>0);
 assert.ok(plan.bodyScale>0);
 for(const b of boxes){assert.ok((b.right-b.left)*plan.scale<=46);assert.ok((b.bottom-b.top)*plan.scale<=46);}
});
test('installed eight directions contain four distinct walk poses and matching aliases',async()=>{
 const {DIRECTIONS}=await packer();
 for(const [dir,clock,alias] of DIRECTIONS){
  const file=new URL('../img/exoduser_silvertail/'+clock+'.png',import.meta.url);
  const {data,info}=await sharp(file.pathname.replace(/^\/(\w:)/,'$1')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,480);assert.equal(info.height,48);
  const hashes=[];
  for(let f=0;f<10;f++){
   const bytes=[];let occupied=0;
   for(let y=0;y<48;y++)for(let x=0;x<48;x++){
    const i=(y*480+f*48+x)*4;bytes.push(...data.subarray(i,i+4));
    if(data[i+3]>100){occupied++;assert.ok(y>0&&y<47,dir+' vertical clipping');}
   }
   assert.ok(occupied>200,dir+' empty/thin frame');hashes.push(createHash('sha256').update(Buffer.from(bytes)).digest('hex'));
  }
  assert.equal(hashes[0],hashes[1]);assert.equal(new Set(hashes.slice(2,6)).size,4,dir+' duplicated walk');
  const aliasData=await sharp(new URL('../img/exoduser_silvertail/'+alias+'.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')).ensureAlpha().raw().toBuffer();
  assert.deepEqual(data,aliasData);
 }
});
test('missing or merged poses fail instead of silently duplicating walking frames',async()=>{
 const {findPoseBoxes}=await packer();
 assert.throws(()=>findPoseBoxes(new Uint8Array(90*90*4),90,90),/9|nine|poses/);
});

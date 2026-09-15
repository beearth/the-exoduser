import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
test('torso anchor ignores the wide silver ponytail and swinging skirt',async()=>{
 const {torsoAnchor}=await import('../tools/pack-silvertail-walk.mjs');
 const width=100,height=100,data=new Uint8Array(width*height*4);
 for(let y=0;y<100;y++)for(let x=0;x<100;x++){
  const body=x>=45&&x<65&&y>15&&y<90,hair=x>=5&&x<45&&y>8&&y<65;
  if(body||hair){const i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=body?60:200;data[i+3]=255;}
 }
 assert.ok(Math.abs(torsoAnchor(data,width,{left:5,right:65,top:8,bottom:90})-55)<1);
});
test('walk packing preserves every idle and attack pixel',async()=>{
 const {packWalk}=await import('../tools/pack-silvertail-walk.mjs');
 const base='img/exoduser_silvertail/3.png',out='tmp/walk-preservation-test.png';
 const report=await packWalk('output/silvertail_walk_fix_20260915/e.png',base,out);
 const a=await sharp(base).ensureAlpha().raw().toBuffer(),b=await sharp(out).ensureAlpha().raw().toBuffer();
 for(let y=0;y<48;y++)for(const [first,last] of [[0,96],[288,480]])assert.deepEqual(a.subarray((y*480+first)*4,(y*480+last)*4),b.subarray((y*480+first)*4,(y*480+last)*4));
 assert.equal(report.frames.length,4);
 assert.equal(new Set(report.frames.map(f=>f.target)).size,1);
 for(const f of report.frames)assert.ok(Math.abs(f.x+(f.anchor-f.box.left+2)*report.scale-f.target)<=.51);
});

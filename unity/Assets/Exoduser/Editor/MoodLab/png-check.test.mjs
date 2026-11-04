import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { decodePng, compareImages } from './png-check.mjs';

// In-memory PNG fixtures only; no image assets/captures are generated on disk.
function crc(bytes) {
  let c=0xffffffff; for(const b of bytes) { c^=b; for(let i=0;i<8;i++) c=(c>>>1)^((c&1)?0xedb88320:0); } return (c^0xffffffff)>>>0;
}
function chunk(type,data) {
  const name=Buffer.from(type), out=Buffer.alloc(12+data.length);
  out.writeUInt32BE(data.length); name.copy(out,4); data.copy(out,8); out.writeUInt32BE(crc(Buffer.concat([name,data])),8+data.length); return out;
}
function fixture(filtered, colorType=2, depth=8) {
  const header=Buffer.alloc(13); header.writeUInt32BE(2);header.writeUInt32BE(2,4);header[8]=depth;header[9]=colorType;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.from(filtered))),chunk('IEND',Buffer.alloc(0))]);
}
const expected=[10,20,30,20,40,60,11,21,31,22,42,62];
const filtered=[
  [0,10,20,30,20,40,60,0,11,21,31,22,42,62],
  [1,10,20,30,10,20,30,1,11,21,31,11,21,31],
  [2,10,20,30,20,40,60,2,1,1,1,2,2,2],
  [3,10,20,30,15,30,45,3,6,11,16,7,12,17],
  [4,10,20,30,10,20,30,4,1,1,1,2,2,2]
];
for(let filter=0;filter<5;filter++) test(`PNG golden filter ${filter}`,()=>assert.deepEqual([...decodePng(fixture(filtered[filter])).rgb],expected));
test('RGBA is composited over black consistently',()=>{
  const image=decodePng(fixture([0,255,0,0,255,10,20,30,0,0,0,255,0,255,0,0,255,255],6));
  assert.deepEqual([...image.rgb],[255,0,0,0,0,0,0,255,0,0,0,255]);
});
test('malformed CRC and unsupported format fail explicitly',()=>{
  const bad=fixture(filtered[0]);bad[29]^=1;assert.throws(()=>decodePng(bad),/CRC/);
  assert.throws(()=>decodePng(fixture(filtered[0],2,16)),/8-bit/);
});
const image=level=>({width:2,height:2,rgb:Uint8Array.from({length:12},()=>level)});
test('all six actual image pairs meet inclusive 15 threshold',()=>{
  const result=compareImages([0,15,30,45].map(image)); assert.equal(result.pairs.length,6);assert.equal(result.passed,true);assert.equal(result.pairs[0].mean,15);
});
test('identifies the deficient pair, not just pairs against a',()=>{
  const result=compareImages([0,30,35,80].map(image));assert.equal(result.passed,false);assert.deepEqual(result.pairs.filter(p=>!p.passed).map(p=>p.label),['b-c']);
});
test('mismatched dimensions cannot pass',()=>assert.throws(()=>compareImages([image(0),image(20),image(40),{width:1,height:4,rgb:new Uint8Array(12)}]),/dimensions/));

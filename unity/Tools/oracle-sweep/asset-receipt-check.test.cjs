const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {checkReceipt,recoverAsset}=require('./asset-receipt-check.cjs');
test('영수증의 파일 누락과 바이트 변조를 검출한다',async()=>{
 const b=Buffer.from('original');
 const receipt={assets:[{destination:'Art/a.png',bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')}]};
 assert.equal((await checkReceipt(receipt,async()=>b)).failed,0);
 assert.equal((await checkReceipt(receipt,async()=>Buffer.from('changed!'))).failed,1);
 const missing=await checkReceipt(receipt,async()=>{throw Error('missing tracked blob')});
 assert.equal(missing.failed,1);assert.match(missing.rows[0].error,/missing/);
});
test('분할 보관 영상은 각 조각과 전체 영수증을 함께 검사한다',async()=>{
 const bytes=Buffer.from('media'),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 const manifest={bytes:5,sha256,parts:[{path:'part.bin',bytes:5,sha256}]};
 assert.deepEqual(await recoverAsset(manifest,async()=>bytes),bytes);
 await assert.rejects(recoverAsset(manifest,async()=>Buffer.from('other')),/part/);
});
test('대상 경로는 Unity Assets 안에만 존재한다',async()=>{
 await assert.rejects(checkReceipt({assets:[{destination:'../../other'}]},async()=>Buffer.alloc(0)),/destination/);
});

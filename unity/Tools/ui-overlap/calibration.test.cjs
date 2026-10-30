const test=require('node:test'),assert=require('node:assert/strict'),{alphaReaderValid}=require('./analyze.cjs');
const proof={alphaReaderVerified:true,alphaReaderProof:'실제 GPU 대조군',alphaProbe:[0,.25,.5,1],alphaMipProbe:[1,.5,0],alphaRtProbe:[0,.25,.5,1]};
test('실제 RGBAFloat·밉·RT 원소별 대조군을 모두 요구한다',()=>assert.equal(alphaReaderValid(proof),true));
test('전부0/전부1·밉 누락·RT 반전·완료 플래그만으로 GPU판독 PASS를 만들지 않는다',()=>{
 for(const change of [{alphaProbe:[0,0,0,0]},{alphaProbe:[1,1,1,1]},{alphaMipProbe:[1,1,1]},{alphaMipProbe:[1,.5]},{alphaRtProbe:[1,.5,.25,0]},{alphaReaderVerified:false},{alphaReaderProof:''}])assert.equal(alphaReaderValid({...proof,...change}),false);
});

const test=require('node:test'),assert=require('node:assert/strict');
const {analyze}=require('./analyze.cjs');
const rect=(x,y,width,height)=>({x,y,width,height});
const text=(id,x=10,order=0,depth=0)=>({id,kind:'text',text:id,rect:rect(x,10,20,10),order,depth});
const panel={id:'판',kind:'panel',rect:rect(0,0,100,100),order:1,depth:0,clipKnown:true,axisAligned:true,opacityKnown:true,effectiveOpacity:1,opacityProof:'단색 whiteTexture 실제 알파'};
const frame=elements=>({schemaVersion:2,width:100,height:100,elements});
test('추가1 반투명 판은 뒤 글자 충돌을 숨기지 않는다',()=>{
 assert.ok(analyze(frame([text('뒤'),{...panel,effectiveOpacity:.5},text('앞',15,2)])).issues.some(i=>i.type==='글자-글자'));
});
test('추가2 불투명도 불명 판은 가림으로 쓰지 않는다',()=>{
 assert.ok(analyze(frame([text('뒤'),{...panel,opacityKnown:false,effectiveOpacity:undefined},text('앞',15,2)])).issues.some(i=>i.type==='글자-글자'));
});
test('추가3 뒤 GUI 깊이의 판은 나중 호출돼도 앞 글자를 숨기지 않는다',()=>{
 assert.ok(analyze(frame([text('뒤'),{...panel,depth:10},text('앞',15,2)])).issues.some(i=>i.type==='글자-글자'));
});
test('추가4 부분 가림은 남은 조각으로 비교한다',()=>{
 const out=analyze(frame([{...text('뒤'),rect:rect(10,10,30,10)},{...panel,rect:rect(20,0,80,100)},text('앞',25,2)]));
 assert.equal(out.issues.length,0);assert.deepEqual(out.elements.find(e=>e.id==='뒤').visibleRects,[rect(10,10,10,10)]);
});

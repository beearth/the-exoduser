const test=require('node:test'),assert=require('node:assert/strict'),{analyze}=require('./analyze.cjs');
const rect=(x,y,width,height)=>({x,y,width,height});
const text=(id,order,shadow,x=10)=>({id,kind:'text',text:'숫자',rect:rect(x,10,30,10),depth:0,order,shadow,clipKnown:true});
const fill={id:'칠',kind:'surface',rect:rect(80,80,10,10),depth:-1,order:0,clipKnown:true,axisAligned:true,opacityKnown:true,effectiveOpacity:1,opacityProof:'실제 단색 칠'};
test('다른 위치의 앞 깊이 칠 때문에 정상 그림자 통합을 막지 않는다',()=>{
 const out=analyze({schemaVersion:2,width:100,height:100,elements:[fill,text('그림자',1,true),text('본문',2,false,11)]});assert.equal(out.issues.length,0);assert.equal(out.elements.length,1);
});
test('두 글자 호출 사이의 실제 부분 칠은 다른 글자를 그림자로 합치지 않는다',()=>{
 const out=analyze({schemaVersion:2,width:100,height:100,elements:[text('먼저 검정',0,true),{...fill,depth:0,order:1,rect:rect(20,0,80,100)},text('다음 본문',2,false,12)]});assert.equal(out.issues.length,1);assert.equal(out.elements.length,2);
});

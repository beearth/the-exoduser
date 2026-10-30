const test=require('node:test'),assert=require('node:assert/strict'),g=require('./geometry.cjs');
const diamond=[{x:20,y:0},{x:40,y:20},{x:20,y:40},{x:0,y:20}],r=(x,y,width,height)=>g.rectPoly({x,y,width,height});
test('회전 판은 외접 사각형의 빈 모서리를 가리지 않는다',()=>{
 const corner=r(0,0,5,5),pieces=g.subtract(corner,diamond);assert.equal(pieces.reduce((s,p)=>s+Math.abs(g.area(p)),0),25);
 assert.equal(g.intersect(corner,diamond).length,0);
});
test('회전 판의 실제 내부만 빼고 남은 면적을 보존한다',()=>{
 assert.equal(g.subtract(r(15,15,10,10),diamond).length,0);
 const pieces=g.subtract(r(0,0,40,40),diamond);assert.equal(pieces.reduce((s,p)=>s+Math.abs(g.area(p)),0),800);
});
test('뒤집힌 꼭짓점 순서와 클립에도 동일한 차집합을 얻는다',()=>{
 for(const p of [diamond,[...diamond].reverse()]){const clip=g.intersect(p,r(20,0,20,40));assert.equal(Math.abs(g.area(clip)),400);assert.equal(g.subtract(r(0,0,5,5),clip).reduce((s,p)=>s+Math.abs(g.area(p)),0),25);}
});
const {analyze}=require('./analyze.cjs');
const surface={id:'실제 회전 칠',kind:'surface',order:1,depth:0,rect:{x:0,y:0,width:40,height:40},quad:diamond,axisAligned:false,clipKnown:true,opacityKnown:true,effectiveOpacity:1,opacityProof:'회전 whiteTexture 알파1'};
const text=(id,x,y,order)=>({id,kind:'text',text:id,order,depth:0,clipKnown:true,rect:{x,y,width:4,height:4}});
test('분석기에서도 회전 외접 상자의 빈 모서리 글자 충돌을 유지한다',()=>{
 const out=analyze({schemaVersion:2,width:40,height:40,elements:[text('뒤',0,0,0),surface,text('앞',1,1,2)]});assert.equal(out.issues.length,1);assert.equal(out.visibilityComplete,true);
});
test('실제 회전 내부의 뒤 글자만 가리고 클립 밖 잔여는 남긴다',()=>{
 assert.equal(analyze({schemaVersion:2,width:40,height:40,elements:[text('뒤',15,15,0),surface,text('앞',16,16,2)]}).issues.length,0);
 assert.equal(analyze({schemaVersion:2,width:40,height:40,elements:[text('뒤',15,15,0),{...surface,hasClip:true,clipRect:{x:20,y:0,width:20,height:40}},text('앞',16,16,2)]}).issues.length,1);
});

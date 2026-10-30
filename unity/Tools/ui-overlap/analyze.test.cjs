const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path').join(__dirname,'analyze.cjs');
test('겹침 분석기가 구현되어야 한다',()=>assert.ok(fs.existsSync(path),'실제 그리기 사각형 분석기 구현 필요'));
const analyze=fs.existsSync(path)?require(path).analyze:null;
const text=(id,x,y,w,h)=>({id,kind:'text',text:id,rect:{x,y,width:w,height:h}});
const button=(id,x,y,w,h)=>({id,kind:'button',rect:{x,y,width:w,height:h}});
test('900px 사용자 재현: 출시 안내가 행동 버튼을 침범하면 검출한다',{skip:!analyze},()=>{
 const out=analyze({width:1600,height:900,elements:[text('출시 준비 중',1251,810,74,20),button('생성',1380,816,180,44)]});
 // 실제로 겹치는 네 번째 아이콘 위치도 검사한다.
 const hit=analyze({width:1600,height:900,elements:[text('출시 준비 중',1422,810,74,20),button('생성',1380,816,180,44)]});
 assert.equal(out.issues.length,0);assert.equal(hit.issues[0].type,'글자-버튼');
});
test('자기 버튼 안 글자와 판 안 글자는 허용하고 경계 침범은 검출한다',{skip:!analyze},()=>{
 assert.equal(analyze({width:100,height:100,elements:[{...button('선택',0,0,50,30),order:0},{...text('이름',10,10,20,10),order:1}]}).issues.length,0);
 assert.equal(analyze({width:100,height:100,elements:[text('침범',40,10,20,10),button('선택',0,0,50,30)]}).issues.length,1);
});
test('먼저 그린 안내가 나중 버튼 안에 완전히 들어가도 자기 글자로 오인하지 않는다',{skip:!analyze},()=>{
 const out=analyze({width:100,height:100,elements:[{...text('출시 안내',10,10,20,10),order:0},{...button('취소',0,0,50,30),order:1}]});
 assert.equal(out.issues.length,1);
});
test('서로 다른 글자 충돌, 화면 이탈, 비겹침 경계를 구분한다',{skip:!analyze},()=>{
 assert.equal(analyze({width:100,height:100,elements:[text('가',0,0,20,10),text('나',20,0,20,10)]}).issues.length,0);
 assert.equal(analyze({width:100,height:100,elements:[text('가',0,0,20,10),text('나',19,0,20,10)]}).issues[0].type,'글자-글자');
 assert.equal(analyze({width:100,height:100,elements:[text('화면밖',90,0,20,10)]}).issues[0].type,'화면 이탈');
});
test('같은 글자의 그림자 중복만 합치고 다른 글자 충돌은 남긴다',{skip:!analyze},()=>{
 const result=analyze({width:100,height:100,elements:[{...text('가',10,10,20,10),shadow:true},text('가',11,11,20,10),text('나',15,10,20,10)]});
 assert.equal(result.elements.length,2);assert.equal(result.issues.length,1);
});
test('그림자가 아닌 같은 글자의 실제 중복도 충돌로 남긴다',{skip:!analyze},()=>{
 assert.equal(analyze({width:100,height:100,elements:[text('안내',10,10,20,10),text('안내',11,11,20,10)]}).issues.length,1);
});
test('나중 전체 배경이 덮은 기존 버튼도 가림 처리한다',{skip:!analyze},()=>{
 const out=analyze({width:100,height:100,elements:[{...button('이전 삭제',20,0,20,20),order:0},{id:'배경',kind:'panel',rect:{x:0,y:0,width:100,height:100},order:1},{...text('새 안내',10,10,20,10),order:2}]});
 assert.equal(out.issues.length,0);
});

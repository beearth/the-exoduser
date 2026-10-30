const test=require('node:test'),assert=require('node:assert/strict');
const {analyze}=require('./analyze.cjs'),{cases}=require('./baseline-regression.json');
const rect=(x,y,width,height)=>({x,y,width,height});
const text=(id,x=10,order=0,depth=0)=>({id,kind:'text',text:id,source:'임의 파일',rect:rect(x,10,20,10),order,depth,clipKnown:true});
const surface={id:'실제 칠',kind:'surface',rect:rect(20,0,80,100),order:1,depth:0,clipKnown:true,opacityKnown:true,effectiveOpacity:1,opacityProof:'whiteTexture / GUI.color.a=1',axisAligned:true};
const frame=elements=>({schemaVersion:2,width:100,height:100,elements});
test('원본1600의 준비문구↔취소 0.900px 충돌은 그대로 남는다',()=>{
 const hit=analyze(cases[0]).issues.find(i=>i.a.text==='출시 준비 중'&&i.b?.text==='취소');
 assert.ok(hit);assert.ok(Math.abs(hit.intersections[0].height-.9000244140625)<.00001);
 assert.equal(analyze(cases[0]).visibilityComplete,false,'과거 스키마를 새 계측 PASS로 재사용하지 않는다');
});
test('원본1920의 같은 준비문구↔취소 쌍은 교차하지 않는다',()=>{
 assert.ok(!analyze(cases[1]).issues.some(i=>i.a.text==='출시 준비 중'&&i.b?.text==='취소'));
});
test('설정 뒤 HUD: 누락 JSON은 후보 유지, 실제 소스의 불투명 탭 대조군만 정당한 가림',()=>{
 const old=cases[2];assert.equal(old.elements.length,2);assert.equal(analyze(old).issues.length,1);
 // 새 Player 수집 증거가 아니다. NativePanelTabBar의 실제 Fill 사각형/알파를 보충한 대조군.
 const [hud,tab]=old.elements.map(e=>({...e,depth:0,clipKnown:true}));
 const fill={...surface,id:'설정 탭 단색',rect:rect(40+4*(363.2+6),32,363.2,40),order:tab.order-.5};
 assert.equal(analyze({...old,schemaVersion:2,elements:[hud,fill,tab]}).issues.length,0);
 for(const change of [{effectiveOpacity:.5},{opacityKnown:false},{depth:10}])assert.equal(analyze({...old,elements:[hud,{...fill,...change},tab]}).issues.length,1);
 const renamed=[hud,fill,tab].map((e,i)=>({...e,text:'문자'+i,source:'다른 파일.cs:999'}));
 assert.equal(analyze({...old,elements:renamed}).issues.length,0);
});
test('부분 가림의 남은 교차는 검출하고 자기 의미 영역은 유지한다',()=>{
 const a={...text('뒤'),rect:rect(10,10,30,10)};
 const out=analyze(frame([a,surface,text('앞',15,2)]));
 assert.equal(out.issues.length,1);assert.deepEqual(out.issues[0].intersections,[rect(15,10,5,10)]);
 const button={id:'버튼',kind:'button',rect:surface.rect,depth:0,order:0,clipKnown:true};
 assert.equal(analyze(frame([button,{...surface,ownerId:'버튼'}])).elements.length,1);
});
test('가림 자체의 클립과 글자 클립을 먼저 교차시킨다',()=>{
 const a=text('뒤'),b=text('앞',15,2);
 const out=analyze(frame([a,{...surface,rect:rect(0,0,100,100),hasClip:true,clipRect:rect(40,0,60,100)},b]));
 assert.equal(out.issues.length,1);
 const clipped=analyze(frame([{...a,hasClip:true,clipRect:rect(0,0,14,100)},b]));
 assert.equal(clipped.issues.length,0);assert.deepEqual(clipped.elements[0].visibleRects,[rect(10,10,4,10)]);
});
test('낮은 GUI.depth는 먼저 호출돼도 앞, 같은 깊이는 호출 순서를 따른다',()=>{
 assert.equal(analyze(frame([{...surface,rect:rect(0,0,100,100),depth:-1,order:0},text('뒤',10,2),text('앞',15,3)])).issues.length,0);
 assert.equal(analyze(frame([{...surface,rect:rect(0,0,100,100),order:0},text('뒤',10,2),text('앞',15,3)])).issues.length,1);
});
test('불명 또는 회전 표면으로 교차0이어도 계측 완료를 선언하지 않는다',()=>{
 for(const change of [{opacityKnown:false},{axisAligned:false},{axisAligned:undefined},{depth:undefined},{clipKnown:false},{order:undefined}]){
  const out=analyze(frame([{...surface,...change}]));assert.equal(out.issues.length,0);assert.equal(out.visibilityComplete,false);
 }
});

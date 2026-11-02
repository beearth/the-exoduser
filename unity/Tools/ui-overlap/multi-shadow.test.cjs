const test=require('node:test'),assert=require('node:assert/strict'),{analyze}=require('./analyze.cjs'),base=require('./fixtures/inventory-cp-glow.json');
function f(){const frame=structuredClone(base);frame.width=2560;frame.height=1600;frame.elements=[];return frame;}
function e(id,text,x,y,order,shadow=false,source='label'){return{id,kind:'text',text,rect:{x,y,width:24,height:26},depth:0,order,shadow,hasClip:false,clipKnown:true,opacityKnown:true,effectiveOpacity:shadow?.063:1,source};}
function pair(){const frame=f(),suffix=' / 명시 CSS text-shadow 광휘 패스 / region-banner-black-shadow';for(let glyph=0;glyph<2;glyph++){const x=100+glyph*28;for(let i=0;i<8;i++){const a=i*Math.PI/4;frame.elements.push(e('s'+glyph+'-'+i,glyph?'B':'A',x+Math.cos(a)*5*4/3,100+(4+Math.sin(a)*5)*4/3,glyph*20+i,true,'label'+suffix));}frame.elements.push(e('b'+glyph,glyph?'B':'A',x,100,glyph*20+19));}return frame;}
test('이웃 본문의 선언된 배너 그림자는 스타일 페인트이며 본문끼리는 떨어져 있다',()=>assert.equal(analyze(pair()).issues.length,0));
test('그림자 선언이 있어도 실제 다른 본문 겹침은 검출',()=>{const frame=pair();frame.elements.push(e('foreign','FOREIGN',100,100,100));assert.ok(analyze(frame).issues.length>0);});
test('유계 밖 그림자는 선언만으로 제외하지 않음',()=>{const frame=pair();frame.elements[0].rect.x=120;assert.ok(analyze(frame).issues.length>0);});
test('16대10의3x3 작은 검정 그림자 군을 본문과 직접 대조',()=>{const frame=f();for(let x=-2;x<=2;x+=2)for(let y=-2;y<=2;y+=2)frame.elements.push(e('s'+x+':'+y,'A',100+x*4/3,100+y*4/3,frame.elements.length,true));frame.elements.push(e('body','A',100,100,20));assert.equal(analyze(frame).issues.length,0);});
test('일반 본문 중복은 그대로 검출',()=>{const frame=f();frame.elements=[e('a','A',100,100,0),e('b','A',100,100,1)];assert.ok(analyze(frame).issues.length>0);});
test('미선언 큰 검정 그림자는 계속 검출',()=>{const frame=f();frame.elements=[e('shadow','A',105,100,0,true),e('body','A',100,100,1)];assert.ok(analyze(frame).issues.length>0);});

function stroke(){const frame=f(),suffix=' / 명시 CSS text-shadow 광휘 패스 / death-black-outline';for(let g=0;g<2;g++){const x=100+28*g,text=g?'B':'A';for(const [i,dx,dy]of [[0,0,1],[1,-3,1],[2,3,1],[3,0,-2],[4,0,4]]){const q=e('o'+g+':'+i,text,x+dx*4/3,100+dy*4/3,g*20+i,true,'death'+suffix);q.effectiveOpacity=.35;frame.elements.push(q);}frame.elements.push(e('body'+g,text,x,100,g*20+19,false,'death'));}return frame;}
test('선언된 사망 제목4.2배율 이내 검정 외곽선은 이웃 본문과 별도 스타일',()=>assert.equal(analyze(stroke()).issues.length,0));
test('사망 제목 외곽선 선언도 다른 실제 본문 충돌은 숨기지 않음',()=>{const frame=stroke();frame.elements.push(e('other','OTHER',100,100,100,false,'death'));assert.ok(analyze(frame).issues.length>0);});
test('사망 제목 유계 밖 외곽선은 계속 검출',()=>{const frame=stroke();frame.elements[0].rect.x=120;assert.ok(analyze(frame).issues.length>0);});

function frontend(){const frame=f(),suffix=' / 명시 CSS text-shadow 광휘 패스 / frontend-black-shadow',scale=frame.height/1080;for(const [i,dx,dy]of [[0,0,1],[1,.5,3],[2,-.5,3]]){const q=e('f'+i,'A',100+dx*scale,100+dy*scale,i,true,'front'+suffix);q.effectiveOpacity=.9;frame.elements.push(q);}frame.elements.push(e('body','A',100,100,10,false,'front'));return frame;}
test('높이기준3px 전면 글자 그림자는 유계 선언으로 본문과 연결',()=>assert.equal(analyze(frontend()).issues.length,0));
test('전면 그림자도 다른 실제 본문 충돌을 숨기지 않음',()=>{const frame=frontend();frame.elements.push(e('foreign','OTHER',100,100,20,false,'front'));assert.ok(analyze(frame).issues.length>0);});
test('전면 그림자 유계 밖 패스는 계속 검출',()=>{const frame=frontend();frame.elements[0].rect.x=120;assert.ok(analyze(frame).issues.length>0);});

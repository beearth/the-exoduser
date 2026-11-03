const test=require('node:test'),assert=require('node:assert/strict'),{analyze}=require('./analyze.cjs'),fixture=require('./fixtures/multipass-cb77.json');
for(const row of fixture.cases)test('실제 cb77 다중 패스는 한 본문: '+row.name,()=>{const result=analyze(structuredClone(row.frame));assert.equal(result.issues.length,0);assert.equal(result.elements.filter(e=>e.kind==='text').length,1);});
const frame=()=>structuredClone(fixture.cases[0].frame);
function tagged(){const f=frame(),anchor={x:2280,y:1500,width:80,height:28};for(const e of f.elements){e.paintGroupId='p1';e.paintGroupText=e.text;e.paintGroupOrigin=anchor;e.paintGroupSource='DrawSpaced:one glyph';}return f;}
test('새 원점 식별자로 다중 패스를 묶고 실제 다른 본문 충돌은 유지',()=>{const f=tagged(),body=f.elements.find(e=>!e.shadow);f.elements.push({...structuredClone(body),id:'foreign',order:999,text:'다른 글자',paintGroupId:'p2',paintGroupText:'다른 글자'});const result=analyze(f);assert.equal(result.textGroups.length,1);assert.ok(result.issues.some(i=>i.type==='글자-글자'));});
test('같은 문자열·같은 위치라도 별도 본문은 합치지 않음',()=>{const f=tagged(),body=f.elements.find(e=>!e.shadow);f.elements.push({...structuredClone(body),id:'second',order:999,paintGroupId:'p2'});assert.ok(analyze(f).issues.some(i=>i.type==='글자-글자'));});
test('본문 두 개가 들어 있는 잘못된 선언은 충돌과 경고를 유지',()=>{const f=tagged(),body=f.elements.find(e=>!e.shadow);f.elements.push({...structuredClone(body),id:'duplicate',order:999});const out=analyze(f);assert.ok(out.issues.length);assert.ok(out.auditWarnings.some(x=>x.includes('다중 패스')));});
test('원점이 다른 선언은 같은 그룹으로 합치지 않음',()=>{const f=tagged();f.elements[0].paintGroupOrigin={x:0,y:0,width:80,height:28};assert.ok(analyze(f).issues.length);});
test('다른 문자열 선언은 같은 그룹으로 합치지 않음',()=>{const f=tagged();f.elements[0].text='X';assert.ok(analyze(f).issues.length);});
test('원본 클립 뒤 크기가 달라도 같은 원점의 패스는 묶음',()=>{const f=tagged();for(const e of f.elements){e.hasClip=true;e.clipRect={x:2295,y:1500,width:30,height:60};}assert.equal(analyze(f).issues.length,0);});
test('새 그룹도 본문 없는 그림자끼리 합치지 않음',()=>{const f=tagged();f.elements=f.elements.filter(e=>e.shadow);assert.ok(analyze(f).issues.length);});
test('본문의 실제 layout 원점과 다른 선언은 합치지 않음',()=>{const f=tagged(),body=f.elements.find(e=>!e.shadow);body.textLayoutRect={x:1,y:2,width:80,height:28};const out=analyze(f);assert.ok(out.issues.length);assert.ok(out.auditWarnings.some(x=>x.includes('다중 패스')));});

const test=require('node:test'),assert=require('node:assert/strict'),{analyze}=require('./analyze.cjs'),fixture=require('./fixtures/inventory-cp-glow.json');const fresh=()=>structuredClone(fixture);
test('실제 16:10 인벤 CP의 명시 두 고리 광휘와 본문은 한 의미 글자다',()=>{assert.equal(analyze(fresh()).issues.length,0)});
test('명시 광휘와 겹치는 다른 내용 글자는 계속 검출한다',()=>{const f=fresh(),body=f.elements.find(e=>!e.shadow);f.elements.push({...structuredClone(body),id:'999',order:999,text:'다른 글자'});assert.ok(analyze(f).issues.length>0)});
test('명시 광휘 밖 일반 본문의 중복은 계속 검출한다',()=>{const f=fresh(),body=f.elements.find(e=>!e.shadow);f.elements.push({...structuredClone(body),id:'999',order:999});assert.ok(analyze(f).issues.length>0)});
test('광휘 소유 근거가 없으면 큰 반경의 장식도 자동 제외하지 않는다',()=>{const f=fresh();for(const e of f.elements)e.source=e.source.replace(' / 명시 CSS text-shadow 광휘 패스','');assert.ok(analyze(f).issues.length>0)});

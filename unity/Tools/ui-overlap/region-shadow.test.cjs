const test=require('node:test'),assert=require('node:assert/strict'),{analyze}=require('./analyze.cjs'),fixture=require('./fixtures/inventory-cp-glow.json');
const suffix=' / 명시 CSS text-shadow 광휘 패스 / region-banner-black-shadow';
function frame(){
 const f=structuredClone(fixture),body=structuredClone(f.elements.find(e=>e.kind==='text'&&!e.shadow)),s=Math.min(f.width/1920,f.height/1080);body.id='body';body.order=20;body.source='declared-banner-glyph';body.clipRect={x:0,y:0,width:f.width,height:f.height};body.hasClip=true;
 const offset=(e,dx,dy)=>{e.rect.x+=dx;e.rect.y+=dy;if(e.unclippedRect){e.unclippedRect.x+=dx;e.unclippedRect.y+=dy;}if(e.quad)e.quad=e.quad.map(p=>({x:p.x+dx,y:p.y+dy}));return e;};
 f.elements=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,e=offset(structuredClone(body),Math.cos(a)*5*s,(4+Math.sin(a)*5)*s);e.id='shadow'+i;e.order=i;e.shadow=true;e.source=body.source+suffix;e.opacityKnown=true;e.effectiveOpacity=.063;return e;});f.elements.push(body);return f;
}
test('선언된5px반경/4px하향/6.3% 검정 배너 그림자는 뒤의 실제 본문에만 연결한다',()=>assert.equal(analyze(frame()).issues.length,0));
test('다른 문자열은 배너 그림자와 겹쳐도 검출한다',()=>{const f=frame();f.elements[2].text='다른 글자';assert.ok(analyze(f).issues.length>0);});
test('일반 본문 중복은 배너 그림자로 숨기지 않는다',()=>{const f=frame();f.elements.push({...structuredClone(f.elements.at(-1)),id:'duplicate',order:21});assert.ok(analyze(f).issues.length>0);});
test('정확한 선언이 없는 큰 그림자는 계속 검출한다',()=>{const f=frame();for(const e of f.elements)e.source=e.source.replace(suffix,'');assert.ok(analyze(f).issues.length>0);});
test('6.4%보다 진한 패스는 선언만으로 제외하지 않는다',()=>{const f=frame();f.elements[2].effectiveOpacity=.065;assert.ok(analyze(f).issues.length>0);});
test('알려진 불투명도 증거가 없으면 연결하지 않는다',()=>{const f=frame();f.elements[2].opacityKnown=false;assert.ok(analyze(f).issues.length>0);});
test('일반 CP 광휘의3% 한도는 그대로다',()=>{const f=frame();for(const e of f.elements)e.source=e.source.replace(' / region-banner-black-shadow','');assert.ok(analyze(f).issues.length>0);});

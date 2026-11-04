// 11-04 BuildLoop 9e97b55ae: the death screen pet lines (NativeDeathOverlay.cs:207) draw their black outline at
// (0,1.5),(-2,0),(2,0),(0,-1),(0,3) x fit, a second offset set under the same death-black-outline profile.
// The analyzer only knew the glyph outline set and counted every pass as a separate text: 357 false collisions.
const test=require('node:test'),assert=require('node:assert/strict'),{analyze}=require('./analyze.cjs'),fixture=require('./fixtures/death-pet-outline-9e97.json');
test('실제 사망 대사 외곽선 패스는 한 본문으로 묶임',()=>{const out=analyze(structuredClone(fixture.frame));assert.equal(fixture.issueCountBefore>0,true);assert.equal(out.issues.length,0);});
test('다른 대사가 실제로 겹치면 여전히 충돌',()=>{const f=structuredClone(fixture.frame),body=f.elements.find(e=>!e.shadow);const other={...structuredClone(body),id:'other',text:'다른 대사',order:9999};f.elements.push(other);assert.ok(analyze(f).issues.length>0);});
test('선언되지 않은 거리의 그림자는 묶지 않음',()=>{const f=structuredClone(fixture.frame),s=f.elements.find(e=>e.shadow);for(const k of ['rect','unclippedRect'])if(s[k])s[k].x+=9;s.visiblePolygons=[[{x:s.rect.x,y:s.rect.y},{x:s.rect.x+s.rect.width,y:s.rect.y},{x:s.rect.x+s.rect.width,y:s.rect.y+s.rect.height},{x:s.rect.x,y:s.rect.y+s.rect.height}]];s.visibleRects=[s.rect];assert.ok(analyze(f).issues.length>0);});

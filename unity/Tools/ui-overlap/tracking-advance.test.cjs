// The CPU text-run suite executes PixelAdvance. These contracts check that the
// two real renderers use it for both measurement and painting, without shrinking
// text or touching shaped zero-spacing runs / hit targets.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime',f),'utf8');
test('키 목록의 추적 자간은 같은 advance로 측정하고 그림',()=>{
 const s=read('NativeKeyBindList.cs');
 assert.match(s,/float GlyphAdvance\(/);
 assert.match(s,/w\+=GlyphAdvance\(g,st,px,css,ls,scale\)/);
 assert.match(s,/w\+=GlyphAdvance\(g,st,px,css,ls,scale\)/g);
 assert.equal((s.match(/w\+=GlyphAdvance\(g,st,px,css,ls,scale\)/g)||[]).length,2);
 assert.match(s,/if\(NativeRun\(text,ctx,ls\)\)return st\.CalcSize/);
 assert.match(s,/12,11\.52f,\.3f,C\(136,139,139\)/);
});
test('스킬 혼합 글꼴 경계는 측정과 그리기의 동일 폭 배열을 사용',()=>{
 const s=read('NativeSkills.cs');assert.match(s,/float\[\] advances=new float\[runs\.Count\]/);
 assert.match(s,/i\+1<runs\.Count&&spacing==0\?NativeUiTextRun\.PixelAdvance\(w,w,scale\):w/);
 assert.match(s,/total\+=advances\[i\]/);assert.match(s,/x\+=advances\[i\]/);
 assert.match(s,/Mixed\(new Rect\(x,237,cell,11\),SlotKey\(i\),11/);
});
test('남은 known 목록은 이번 두 출처만 제거하고 86건 감소',()=>{
 const list=JSON.parse(fs.readFileSync(path.join(__dirname,'known-overlaps.json'),'utf8'));
 assert(list.issues<=621,'other lanes may reduce the ratchet further');assert.equal(list.entries.reduce((n,e)=>n+e.count,0),list.issues);
 assert(!list.entries.some(e=>e.files.includes('NativeSkills.cs')||e.files.includes('NativeKeyBindList.cs')));
});

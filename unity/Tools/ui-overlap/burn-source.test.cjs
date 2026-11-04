const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime',f),'utf8');
test('HUD current/max rows reserve measured font height and a shadow gap',()=>{
 const s=read('NativeHud.cs');assert(s.includes('hpNumber.CalcSize(new GUIContent(values.HpCurrentText)).y'));
 assert(s.includes('NativeUiTextFlow.NextLine('));assert(!s.includes('wrap.y+90*s'));
 assert(s.includes('padding=new RectOffset(),margin=new RectOffset()'));
});
test('tab label measure/paint share separated text-element layout and serif font',()=>{
 const s=read('NativePanelTabBar.cs');assert.equal((s.match(/NativeUiTextRun.Separated\(/g)||[]).length,2);
 assert(!s.includes('text[i]'));assert(!s.includes('new Rect(x,y,40,'));
 assert(s.includes('NativeSilverHellUi.Font()'));assert(!s.includes('NativeLobbyNotoSansKR'));
});
test('forge measure/paint share run advances, tight boxes, and shadow ownership',()=>{
 const s=read('NativeForgePanel.cs');assert.equal((s.match(/NativeUiTextRun.Separated\(/g)||[]).length,2);
 assert(!s.includes('foreach(char ch in text)'));assert(!s.includes('total+16'));assert(!s.includes('oy,60,'));
 assert(s.includes('NativeUiAudit.GroupText('));
});

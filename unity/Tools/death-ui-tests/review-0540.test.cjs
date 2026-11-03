const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let failed=0;const test=(name,fn)=>{try{fn();console.log('PASS '+name);}catch(e){failed++;console.log('FAIL '+name+': '+e.message);}};
test('candidate capture uses the baseline 3D and graphics arguments',()=>{
 const s=read('Tools/death-ui-tests/candidate-capture.ps1');assert(s.includes("'--remodel3d'")&&s.includes("'-force-d3d11'"));
});
test('objective labels reserve measured value width and a 16px gap',()=>{
 const s=read('Assets/Exoduser/Runtime/NativeObjectivePanel.cs');assert(s.includes('MinimumLabelGap=16f'));
 assert(s.includes('LabelSpace(')&&s.includes('WidthForLabels(')&&s.includes('LayoutAudit'),'measured layout and 29-language runtime audit');
 const expr=s.match(/float LabelSpace\([^)]*\)\s*=>\s*([^;]+);/)[1];
 const space=new Function('panelWidth','prefix','valueWidth','valueInset','MinimumLabelGap','return '+expr);
 for(const valueWidth of [10,36,120,230])for(const prefix of [0,38]){
  const label=130,panelWidth=30+prefix+6+valueWidth+16+label;
  assert.equal(space(panelWidth,prefix,valueWidth,6,16),label);
 }
 assert(read('Assets/Exoduser/Runtime/NativeGame.DeathScreenCapture.cs').includes('objectiveLayoutAudit'),'actual Player checks all 29 languages');
});
test('name face is inset while the original thorn frame bounds stay fixed',()=>{
 const s=read('Assets/Exoduser/Runtime/NativeLobby.CharacterPresentation.cs');assert(s.includes('NameFaceInset=18f'));
 assert(s.includes('Panel(face,45,NameFaceInset,iron:true)'));
 assert(s.includes('CharacterDialogFont(')&&s.includes('NanumMyeongjo-Regular'),'explicit serif preferred for the judged dialog');
});
test('judgement 0550 limits chips to explicit settings callers and restores thorns',()=>{
 const s=read('Assets/Exoduser/Runtime/NativeLobby.SilverHell.cs');assert(s.includes('iron_480_blur2')&&s.includes('c.a*.14f'));
 assert(s.includes('bool settingsChip=false')&&!s.includes('IsCompactPlate'),'size must not select a chip outside settings');
 assert(s.includes('ThornPlate(')&&s.includes('btn_thorn_'),'small default plates keep the complete prescaled thorn art');
 for(const file of ['NativePauseMenu.A15Web.cs','NativeKeyBindList.cs']){
  const source=read('Assets/Exoduser/Runtime/'+file);
  assert(source.split('\n').filter(l=>l.includes('ActionPlate(')).every(l=>l.includes('settingsChip:true')),file+' explicit settings list');
 }
 for(const file of ['NativeLobby.CharacterDelete.cs','NativeFieldHud.cs','NativeHudSkills.cs'])assert(!read('Assets/Exoduser/Runtime/'+file).includes('settingsChip:true'),file+' must use thorns');
 assert(read('Assets/Exoduser/Runtime/NativePauseMenu.cs').includes('Panel(panel,36,12,iron:true)'));
});
test('iron sampling keeps the same physical texel size on pause and name faces',()=>{
 const s=read('Assets/Exoduser/Runtime/NativeLobby.SilverHell.cs');
 assert(s.includes('TextureWrapMode.Mirror')&&s.includes('box.width*scale/panelIron.width'),'shared iron must not stretch to the large pause rectangle');
});
console.log(JSON.stringify({groups:5,failed,passed:failed===0,scope:'source/layout contracts; actual font metrics and images are checked in the Player fixture'}));process.exitCode=failed?1:0;

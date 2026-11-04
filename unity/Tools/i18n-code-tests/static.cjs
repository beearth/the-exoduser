const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../Assets/Exoduser/Runtime');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const failures=[];
const displayTernary=/(?:==|!=)\s*"(?:ko|en)"[^;\n?]*\?\s*(?:"(?:[^"\\]|\\.)*"|[\w.]*\.(?:ko|en|nameKo))\s*:/;
assert(displayTernary.test('return Language=="ko"?"시작":"Start";'));
assert(displayTernary.test('return locale=="ko"?entry.ko:entry.en;'));
assert(!displayTernary.test('Language=="ko"?presentationKoHeading:presentationHeading'));
for(const [file,pattern] of [
 ['NativePracticePresentation.cs',/NativeLocaleCatalog.Get\("first_practice",id,lobby.Language/],
 ['NativeStatPanel.cs',/string Name\(StatDefsNode n\)\{return L\(n.nameKo,n.nameEn\);\}/],
 ['NativeLobby.cs',/string K\(string ko,string en\)\{return NativeLocaleCatalog.Text\(ko,en,Language\);\}/],
 ['NativePauseMenu.cs',/NativeLocaleCatalog.Text\(ko,en,LocaleCode\)/],
 ['NativeNextDifficultyPanel.cs',/NativeLocaleCatalog.Text\(a,b,language\)/]
])if(!pattern.test(read(file)))failures.push(file+' 표시 로더 미연결');
// Reviewed exceptions are infrastructure/geometry/compatibility state, never KO/EN text choices.
const allowed={
 'NativeBossBar.cs':/LocaleCode!="ko"\|\|missingGlyph/,
 'NativeGame.cs':/pauseMenu.English=|revive.English=|english:|english=/,
 'NativeGame.FieldHud.cs':/english=/,
 'NativeGame.StageFlow.cs':/bool English/,
 'NativeGame.StartupFlow.cs':/english=.*locale=lobby.Language/,
 'NativeLobby.CharacterPresentation.cs':/Language=="ko"\?presentationKo(?:Heading|Job):presentation(?:Heading|Job)/,
 'NativeLobby.cs':/Language=="ko"\?11.2f:3/,
 'NativeLobby.StartupPresentation.cs':/language.code=="en"|Language=="ko"\?178.72f:168/,
 'NativeObjectivePanel.cs':/WordSize\(|Width_\(|!wrap/,
 'NativeOptionText.cs':/codes\[i\]=="en"/,
 'NativePauseMenu.A15Web.cs':/return myeongjo/,
 'NativeRegionHud.cs':/if\(LocaleCode!="ko"\)/,
 'NativeStageClearOverlay.cs':/Font BodyFont/,
 'NativeLocaleCatalog.cs':/member.Key=="ko"/,
};
const recordFallback=/\b(?:e|entry|row)\.code\s*==\s*"en"/;
const excluded=/^(?:NativeGame\.(?:DeathUiCapture|LanguageMenuSmoke|LoadingTipCapture|PauseSmoke|UiOverlapCapture)\.cs)$/;
let scanned=0,exceptions=0;
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 if(entry.name==='Core'||entry.name==='Tools')continue;const p=path.join(dir,entry.name);
 if(entry.isDirectory()){scan(p);continue;}if(!p.endsWith('.cs')||excluded.test(entry.name))continue;scanned++;
 const lines=fs.readFileSync(p,'utf8').split(/\r?\n/);
 lines.forEach((line,i)=>{
  if(/(?:==|!=)\s*"(?:ko|en)"/.test(line)){
   if(displayTernary.test(line))failures.push(entry.name+':'+(i+1)+' KO/EN 문구 삼항식');
   if(recordFallback.test(line)||allowed[entry.name]?.test(line))exceptions++;
   else failures.push(entry.name+':'+(i+1)+' 언어 표시 분기 또는 미분류 비교');
  }
  if(/\.nameKo\b/.test(line)&&!(/string Name\(StatDefsNode n\)\{return L\(n.nameKo,n.nameEn\);\}/.test(line)||/sb.Append\(Name\(n\)\)/.test(line)))failures.push(entry.name+':'+(i+1)+' nameKo 직접 표시');
  if(/return\s+(?:English|english)\s*\?\s*(?:en|En|a|b)\b/.test(line))failures.push(entry.name+':'+(i+1)+' bool 기반 문구 분기');
 });
}}
scan(root);
const receipt={passed:failures.length===0,scanned,exceptions,failures};
console.log(JSON.stringify(receipt));process.exit(failures.length?1:0);

// 11-04 UI minor 7 bundle (lead review): source contracts only, Node, no Unity. Screen judgement stays with the Mac capture.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),rt=f=>read('Assets/Exoduser/Runtime/'+f);
let failed=0;const test=(name,fn)=>{try{fn();console.log('PASS '+name);}catch(e){failed++;console.log('FAIL '+name+': '+e.message);}};
const visual=rt('NativeLobby.SilverCharacter.cs'),lobby=rt('NativeLobby.SilverLobby.cs'),death=rt('NativeDeathOverlay.cs');
test('M1 cancel/create use the shared ActionPlate; create is crimson primary; labels use existing keys; no new strings',()=>{
 assert(/DrawVisualActionPlate\(cancel,CharacterDialogLabel\("cancel",K\("취소","Cancel"\)\),false,"visual-cancel",true\)/.test(visual));
 assert(/DrawVisualActionPlate\(create,locked\?CharacterDialogLabel\("comingSoon"[^;]*CharacterDialogLabel\("create",K\("생성","Create"\)\),!locked,"visual-create",!locked\)/.test(visual));
 assert(visual.includes('NativeSilverHellUi.ActionPlate(r,primary,focus||hover?1:0,pressed,28,6)'));
 assert(!visual.includes('ArtImage(cancel,silverVisualCancel)')&&!visual.includes('ArtImage(create,'));
});
test('M2 "coming soon" rail text is 14px Normal on the body path',()=>{
 assert(/var railSoon=new GUIStyle\(silverVisualCaption\)\{fontSize=14,fontStyle=FontStyle\.Normal,/.test(visual));
 assert(visual.includes('railSoon.font=CharacterTitleFont(soon)'));
 assert(/Font CharacterBodyFont\(string text\)\{[^}]*NativeSilverHellUi\.Font\(true\)/.test(visual),'body path = Hahmlet 400');
});
test('M3 lobby right-panel text floor only on super-wide edges; 16:9 unchanged',()=>{
 assert(lobby.includes('int wide=NativeUiViewport.Edges.Width>1921f?2:0;'));
 assert(lobby.includes('int nameSize=20+wide;while(nameSize>14+wide&&'));
 assert(lobby.includes('fontSize=silverMicro.fontSize+2')&&lobby.includes('fontSize=silverBody.fontSize+2'));
 assert(lobby.includes('K("전사","WARRIOR"),slotMicro')&&lobby.includes('SilverSlotCaption(name),slotBody'));
});
test('M4 settled decision screen breathes on Age (period 5s, +-5% brightness), eased in after the last option',()=>{
 assert(death.includes('BreathPeriod=5f'));
 assert(/float settle=Mathf\.Clamp01\(\(age-\(OptAt\+OptStep\*Mathf\.Max\(0,choices\.Length-1\)\+OptDur\)\)\/1\.5f\);float breath=Mathf\.Sin\(\(age-OptAt\)\*Mathf\.PI\*2\/BreathPeriod\)\*settle;/.test(death));
 assert(death.includes('(1+.05f*breath)'));
 assert(/float age=Age;/.test(death),'clock = Age (ForcedAge in captures)');
 assert(!/Time\.(unscaledTime|time)[^;]*breath/.test(death));
});
test('M5 outcome line 16px with floor 14 and FitSize floor parameter',()=>{
 assert(death.includes('int FitSize(string t,Font f,int size,float lsEm,float maxW,int floor=0)'));
 assert(death.includes('FitSize(oc,hahmlet,16,.06f,1600,14)'));
 assert(!death.includes('FitSize(oc,hahmlet,14,'));
});
test('M6 hairline = max(460, title width), grows with lp',()=>{
 assert(death.includes('HairlineMin=460f'));
 assert(death.includes('float lw=Mathf.Max(HairlineMin,SpacedWidth(tx.title,hahmletLight,ts,tls))*lp;'));
 assert(!death.includes('float lw=460*lp;'));
});
test('M7 lobby_poster PNGs: importer rule + committed metas (no mipmaps, Bilinear)',()=>{
 const imp=read('Assets/Exoduser/Editor/SourceTextureImporter.cs');
 assert(imp.includes('assetPath.StartsWith("Assets/Exoduser/Resources/Art/ui/lobby_poster/"))return true;'));
 assert(/GetVersion\(\)\{return [5-9];\}/.test(imp));
 for(const n of ['fdg_intro','warrior_story_v23_clean']){
  const meta=read('Assets/Exoduser/Resources/Art/ui/lobby_poster/'+n+'.png.meta');
  assert(/enableMipMap: 0/.test(meta)&&/filterMode: 1\b/.test(meta),n);
 }
});
console.log(JSON.stringify({groups:7,failed,passed:failed===0,scope:'source contracts; screen judgement pending'}));process.exitCode=failed?1:0;
// 11-04 ratchet (71c366324 overlap check): fr character-select name ran 2px past the panel (Cinzel wider than Hahmlet). Name shrinks to the 308px column.
{const s=require('node:fs').readFileSync(require('node:path').resolve(__dirname,'../../Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs'),'utf8');
 const ok=s.includes('while(nameSize>18&&SpacedWidth(nameFont,nameSize,nameText,3.36f*nameSize/28f)-3.36f*nameSize/28f>308f)nameSize--;')&&s.includes('DrawSpaced(x+36,bodyY+59.4f,39.2f,nameText,nameFont,nameSize,3.36f*nameSize/28f');
 console.log((ok?'PASS':'FAIL')+' 8 character-select name fits its 308px column');if(!ok)process.exitCode=1;}

// Source contracts for the runtime entry points that the isolated method probe
// cannot instantiate. Does not claim Unity compilation or pixel correctness.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../Assets/Exoduser/Runtime');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');let count=0;
function check(value,name){assert(value,name);count++;}
const game=read('NativeGame.cs');
for(const n of ['skills','forge','inventory'])check(game.includes(`if(${n}.Open){${n}.LocaleCode=lobby.Language;${n}.Draw`),n+' receives current locale before painting');
check(/NativePanelTitle\.Draw\([^;]*NativeLocaleCatalog\.Text\("성장의 각인",null,LocaleCode\)/.test(read('NativeStatPanel.cs')),'stat common title translates the complete original');
check(/name=NativeLocaleCatalog\.Text\(name,null,LocaleCode\);\s*var nameStyle/.test(read('NativeSkills.cs')),'skill info translates before name wrapping');
const lobby=read('NativeLobby.SilverLobby.cs');
check(lobby.includes('var wishlistStyle=new GUIStyle(silverMicro){wordWrap=true,clipping=TextClipping.Clip};'),'wishlist wraps inside existing column');
check(lobby.includes('new Rect(1516,866,210,42),K("STEAM 위시리스트 추가","ADD TO STEAM WISHLIST"),wishlistStyle'),'wishlist wording and clickable geometry retained');
const guide=read('NativeLobby.StartupPresentation.cs');
check(guide.includes('(r.width-32-SpacedWidth(f,16,text,0))/Mathf.Max(1,text.Length-1)'),'guide spacing respects plate inner width');
check(guide.includes('DrawSpaced(r.center.x-width/2,r.y,r.height,text,f,16,spacing,'),'guide preserves text and 16px source font');
console.log(JSON.stringify({passed:true,checks:count,scope:'source wiring only; Unity/Mac unverified'}));

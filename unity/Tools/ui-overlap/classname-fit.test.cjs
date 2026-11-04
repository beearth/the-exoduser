// 11-04 ratchet: fr character-select name (Cinzel) ran 2px past the panel. Shrink only when wider than the 308px column; fitting names stay 28pt / 3.36 tracking.
const fs=require('node:fs'),path=require('node:path');
const s=fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs'),'utf8');
let failed=0;const t=(n,ok)=>{console.log((ok?'PASS ':'FAIL ')+n);if(!ok)failed++;};
t('shrink loop only while wider than 308px, floor 18',s.includes('while(nameSize>18&&SpacedWidth(nameFont,nameSize,nameText,3.36f*nameSize/28f)-3.36f*nameSize/28f>308f)nameSize--;'));
t('draw uses the fitted size and scaled tracking',s.includes('DrawSpaced(x+36,bodyY+59.4f,39.2f,nameText,nameFont,nameSize,3.36f*nameSize/28f,NativeSilverHellUi.Bright,true);'));
t('start size 28 so fitting names are unchanged (3.36f*28/28 = 3.36)',s.includes('int nameSize=28;')&&Math.abs(3.36*28/28-3.36)<1e-9);
t('old fixed 28pt call removed',!s.includes('nameText,CharacterTitleFont(nameText),28,3.36f'));
console.log(JSON.stringify({failed,passed:failed===0}));process.exitCode=failed?1:0;

// 11-04 design judge (parity merge d50fa39a1): thorn ends covered the labels of the narrow skill-info buttons. They are an explicit chip list, never size-inferred.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const s=fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime/NativeSkills.cs'),'utf8'),h=fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime/NativeLobby.SilverHell.cs'),'utf8');
let failed=0;const test=(n,f)=>{try{f();console.log('PASS '+n);}catch(e){failed++;console.log('FAIL '+n+': '+e.message);}};
test('InfoButton forwards an explicit chip flag to ActionPlate',()=>{assert(/bool InfoButton\(Rect r,string text,bool enabled,bool primary,bool chip=false\)/.test(s));assert(/ActionPlate\(r,false,enabled&&r\.Contains\(Event\.current\.mousePosition\)\?1:0,false,22,6,settingsChip:chip\)/.test(s));});
test('only the three narrow buttons opt in',()=>{const n=(s.match(/,chip:true\)/g)||[]).length;assert.equal(n,3);for(const l of ['"강화 +":"습득",can,true,chip:true','"강화 −",supported&&lv>1,false,chip:true','"리셋",supported&&(!(id=="kiSlash"||id=="fireball")||lv>1),false,chip:true'])assert(s.includes(l),l);assert(/"이 슬롯에 장착 \["\+SlotKey\(SelectedSlot\)\+"\]",true,false\)/.test(s),'wide equip button keeps the thorn plate');});
test('chips stay an explicit choice (no geometry inference)',()=>{assert(/bool compact=settingsChip;/.test(h));});
console.log(JSON.stringify({failed,passed:failed===0}));process.exitCode=failed?1:0;

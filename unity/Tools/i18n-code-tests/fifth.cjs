// Source-only regression: the five nav captions retain hotkeys in all 29 locales.
const fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('Assets/Exoduser/Resources/Data/native_ui_fallbacks.json'));
const keys=['설정 [ESC]','인벤토리 [TAB]','대장간 [G]','스킬 [K]','능력치 [J]'];
let count=0;
for(const key of keys){const row=data.entries.find(r=>r.key===key);assert.ok(row,'missing localized tab: '+key);assert.equal(row.texts.length,29);for(const value of row.texts){assert.ok(value.endsWith(key.slice(key.indexOf(' ['))));assert.ok(value.trim());count++;}}
const tabs=read('Assets/Exoduser/Runtime/NativePanelTabBar.cs');
assert.ok(tabs.includes('NativeLocaleCatalog.Get("native_ui_fallbacks",Labels[i],locale'));
assert.ok(tabs.includes('NativeDemoText.Label'));
for(const file of ['NativeForgePanel.cs','NativeInventoryDock.cs','NativePauseMenu.cs','NativePauseMenu.A15Web.cs','NativeSkills.cs','NativeStatPanel.cs']){
 const calls=read('Assets/Exoduser/Runtime/'+file).match(/NativePanelTabBar.Draw\([^;]+/g)||[];
 assert.ok(calls.length,file);for(const call of calls)assert.ok(/,LocaleCode\)/.test(call),file+' missing current locale');count+=calls.length;
}
const name=read('Assets/Exoduser/Runtime/NativeLobby.CharacterPresentation.cs');
assert.ok(!/Art\/ui\/silver_hell\/name_(cancel|create)"/.test(name));
assert.ok(name.includes('CharacterDialogLabel("cancel"'));
assert.ok(name.includes('CharacterDialogLabel("create"'));
assert.ok(name.includes('DecisionSoundButton(create))CreateCharacter(characterName)'));
assert.ok(name.includes('NativeUiAudit.Button(cancel,"",GUIStyle.none))CloseCharacterCreation()'));
console.log('5차 데이터/진입 연결 검사 '+count+'건 통과');

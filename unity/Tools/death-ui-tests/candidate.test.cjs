const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),runtime=path.join(root,'Assets/Exoduser/Runtime');
const read=f=>fs.readFileSync(path.join(runtime,f),'utf8');
let failed=0;function test(name,fn){try{fn();console.log('PASS '+name);}catch(e){failed++;console.log('FAIL '+name+': '+e.message);}}
test('death hides whole region layer, including non-revivable wait',()=>{
 const s=read('NativeGame.RegionHud.cs'),a=s.indexOf('void DrawRegionHud()'),b=s.indexOf('regionHud.Draw(',a);
 assert(a>=0&&b>a&&s.slice(a,b).includes('DeathPresentationActive'),'death presentation must return before region draw');
});
test('four objective labels have 29 locales and whole-script rendering',()=>{
 const d=JSON.parse(fs.readFileSync(path.join(root,'Assets/Exoduser/Resources/Data/demo_text.json'),'utf8'));
 assert.equal(d.codes.length,29);for(const key of ['레벨','경험치','지역 처치','악의오브']){const e=d.entries.find(e=>e.key===key);assert(e,key);assert.equal(e.texts.length,29);assert(e.texts.every(Boolean));assert.notEqual(e.texts[d.codes.indexOf('th')],e.texts[d.codes.indexOf('en')],key+' Thai fallback');}
 const s=read('NativeObjectivePanel.cs');assert(s.includes('LabelsForLocale')&&s.includes('NativeDemoText.Label'),'locale lookup and joined Thai/RTL labels');
 const exporter=fs.readFileSync(path.join(root,'Tools/demo-text-tests/export.cjs'),'utf8');assert(exporter.includes('objectiveArea')&&exporter.includes("'지역 처치'"),'future exporter preserves objective translations');
});
test('A faces share iron path and name uses serif without lobby_panel load',()=>{
 assert(/Panel\(panel,36,12,iron:true\)/.test(read('NativePauseMenu.cs')),'pause A face');
 const name=read('NativeLobby.CharacterPresentation.cs'),body=name.slice(name.indexOf('void DrawCharacterNamePresentation()'),name.indexOf('void DrawCharacterVisualVignette'));
 assert(body.includes('Panel(panel,45,0,iron:true)'),'name A face and shared frame');
 assert(!body.includes('NativeLobbyNotoSansKR')&&!body.includes('font=noto'),'name body serif');
 assert(read('NativeLobby.CharacterDelete.cs').includes('Panel(panel,28,8,iron:true)'),'delete A face');
 assert(!read('NativeLobby.cs').includes('Art("lobby_panel")'),'unused loader removed');
 assert(read('NativeLobby.SilverHell.cs').includes('panel_frame_20261029'),'original frame preserved');
});
test('entry state override uses same visible hover path without moving OS/event pointer',()=>{
 const s=read('NativeLobby.SilverLobby.cs');assert(s.includes('EntryReviewState=="hover"')&&s.includes('EntryFocus(play)'),'direct review state shares actual glow draw');
 assert(!s.includes('Event.current.mousePosition='),'no mouse injection');
 const c=read('NativeGame.DeathUiCapture.cs');assert(c.includes('-ui-entry-state')&&c.includes('entryHoverForced'),'explicit capture argument and provenance');
});
console.log(JSON.stringify({groups:4,failed,passed:failed===0,scope:'candidate source/data contracts; Player captures remain the visual gate'}));process.exitCode=failed?1:0;

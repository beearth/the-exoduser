const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),data=path.join(root,'Assets/Exoduser/Resources/Data'),runtime=path.join(root,'Assets/Exoduser/Runtime');
const read=name=>fs.readFileSync(path.join(runtime,name),'utf8');
const codes='ko en zh ja es zht ru de ptbr fr pl it uk tr vi th id ar sv da no fi cs hu ro nl el bg ms'.split(' ');
let failed=0,checks=0;function test(name,fn){checks++;try{fn();console.log('PASS '+name);}catch(e){failed++;console.log('FAIL '+name+': '+e.message);}}
let catalog;
test('boss/HUD/dialogue catalogue has 29 complete languages and stable placeholder sets',()=>{
 catalog=JSON.parse(fs.readFileSync(path.join(data,'demo_text.json'),'utf8'));
 assert.deepEqual([...catalog.codes].sort(),[...codes].sort());
 assert.equal(new Set(catalog.entries.map(e=>e.key)).size,catalog.entries.length);
 for(const e of catalog.entries){assert.equal(e.texts.length,29,e.key);for(const value of e.texts){assert.equal(typeof value,'string');assert(value.trim(),e.key);assert.deepEqual([...value.matchAll(/\{\d+\}/g)].map(x=>x[0]).sort(),[...e.key.matchAll(/\{\d+\}/g)].map(x=>x[0]).sort(),e.key);}}
 for(const ko of ['다크드루이드','북서 · 어둠','정화','처치','앵글러 생존','심연의 앵글러','필드보스 처치!','봉인됨!','출구가 열렸다!','보스 처치 · 출구가 열렸다','새 거름이 떨어졌군.','숲은 아직 배고프다. 둥지에서 보자.'])assert(catalog.entries.find(e=>e.key===ko),ko);
 const name=catalog.entries.find(e=>e.key==='다크드루이드');assert.equal(name.texts[codes.indexOf('en')],'Dark Druid');
 for(const code of codes.filter(c=>c!=='ko'))assert.notEqual(name.texts[codes.indexOf(code)],'다크드루이드',code);
});
test('all startup locales carry every canonical cue and translated spoken lines',()=>{
 const intro=JSON.parse(fs.readFileSync(path.join(data,'startup_intro.json'),'utf8'));
 assert.deepEqual(intro.languages.map(l=>l.code).sort(),[...codes].sort());const ko=intro.languages.find(l=>l.code==='ko');
 for(const locale of intro.languages){assert.deepEqual(locale.lines.map(l=>l.id),ko.lines.map(l=>l.id),locale.code);
  for(let i=0;i<ko.lines.length;i++){const a=ko.lines[i],b=locale.lines[i];for(const k of ['t','dur','img','speaker','exit'])assert.deepEqual(b[k],a[k],locale.code+'/'+a.id+'/'+k);
   if(a.text){assert(b.text.trim(),locale.code+'/'+a.id);if(locale.code!=='ko'&&a.text!=='...')assert(!/[가-힣]/.test(b.text),locale.code+'/'+a.id+' Korean leak');}
  }
 }
});
test('boss name renderer uses locale text and can draw characters absent from Korean atlas',()=>{
 const s=read('NativeBossBar.cs');assert(s.includes('NativeDemoText.Get(s.boss,LocaleCode)'));assert(s.includes('NativeDemoText.Label('));
 assert(!s.includes('English boss\r\n // names (`_T`)'),'stale not-ported claim');
});
test('all audited field HUD/event paths use 29-language lookup',()=>{
 assert(read('NativeRegionHud.cs').includes('NativeDemoText.Get(ko,LocaleCode,en)'));
 const field=read('NativeGame.FieldBoss.cs');assert(!field.includes('lobby.Language != "ko" ?'));assert(field.includes('NativeDemoText.Get('));
 const stage=read('NativeGame.StageFlow.cs');assert(stage.includes('NativeDemoText.Get(ko,lobby.Language,en)'));assert(stage.includes('NativeDemoText.Get("보스 처치 · 출구가 열렸다",lobby.Language)'));
 assert(read('NativeGame.RegionHud.cs').includes('regionHud.LocaleCode=lobby.Language'));
});
test('Core boss dialogue reaches presentation and is suppressed under blocking UI/death',()=>{
 const s=read('NativeGame.BossDialogue.cs');assert(s.includes('BossLineRaised+=OnBossLine'));assert(s.includes('BossLineRaised-=OnBossLine'));
 assert(s.includes('DeathPresentationActive')&&s.includes('stageClear.Active')&&s.includes('lobby.IsBlocking'));
 assert(read('NativeGame.cs').includes('DrawBossDialogue();'));assert(read('NativeGame.StageFlow.cs').includes('BossDialogueAttach();'));
 const ui=read('NativeBossDialogue.cs');assert(ui.includes('3.2f')&&ui.includes('.19f')&&ui.includes('NativeDemoText.Label'));
});
test('non-Latin scripts use serif fallback and Arabic uses the existing advanced text stack',()=>{
 const s=read('NativeDemoText.cs');assert(s.includes('NativeSilverHellUi.TextFont'));assert(!s.includes('code=="ar")code="en"'));
 const ar=read('NativeDemoArabicText.cs');assert(ar.includes('TextGeneratorType.Advanced')&&ar.includes('LanguageDirection.RTL'));
});
test('intro dialogue survives the longer arena load before its 3.2-second display starts',()=>{
 const s=read('NativeGame.BossDialogue.cs');assert(s.includes('pendingBossLine=key'),'Core intro fires during load; retain its key');
 assert(s.includes('bossDialogue.Show(pendingBossLine)'),'begin visible lifetime after load');
});
test('Mac capture entry is registered and refuses persistent stores',()=>{
 const game=read('NativeGame.cs');assert(game.includes('Array.IndexOf(args,"--unity-demo-text-smoke")>=0'));
 const s=read('NativeGame.DemoTextCapture.cs');assert(s.includes('nativeSettingsStore!=null')&&s.includes('combatStore!=null')&&s.includes('CharacterStoreDirectory'));
 assert(s.includes('BossLineLog.Contains("intro0")'));assert(s.includes('sink0')&&s.includes('controlled'));
 const gate=JSON.parse(fs.readFileSync(path.join(data,'hellgate_objectives.json'),'utf8'));assert.equal(gate.entries.length,29);assert(/[\u0600-\u06ff]/.test(gate.entries.find(e=>e.code==='ar').sealedGate));
});
console.log(JSON.stringify({checks,failed,passed:failed===0,scope:'data and source contracts; no Unity/Player execution'}));process.exitCode=failed?1:0;

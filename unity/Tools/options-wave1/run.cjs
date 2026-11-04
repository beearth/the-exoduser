// Options wave 1 runner: source wiring contract (product source text) + the Core dotnet contract (Program.cs).
// usage: C:/nvm4w/nodejs/node.exe run.cjs <out-dir>     (needs DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false; stdin is never read)
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const here=__dirname,project=path.resolve(here,'../..'),runtime=path.join(project,'Assets/Exoduser/Runtime'),out=path.resolve(process.argv[2]||path.join(here,'out'));
const read=name=>fs.readFileSync(path.join(runtime,name),'utf8').replace(/\r\n/g,'\n');
const menu=read('NativePauseMenu.A15Web.cs'),keyboard=read('NativePauseMenu.Keyboard.cs'),persist=read('NativeGame.SettingsPersistence.cs'),options=read('NativeGame.SettingsOptions.cs'),game=read('NativeGame.cs'),music=read('NativeGameMusic.cs'),keylist=read('NativeKeyBindList.cs');
let checks=0;const ok=(cond,label)=>{assert(cond,label);checks++;};
// P13
ok(/settings=new NativeSettingsState\(\);cinSeen=false;/.test(persist)&&!/new NativeSettingsState\(120\)/.test(persist),'P13 boot state uses the declared default (unlimited), no hidden 120');
// P37
ok(/public void OpenSettingsDirect\(\)\{navigation\.Reset\(\);Array\.Clear\(a15Scroll,0,a15Scroll\.Length\);/.test(menu),'P37 reopening the settings clears every tab scroll');
ok(/if\(tab!=i\)\{tab=i;openSelect=-1;a15Scroll\[i\]=0;\}/.test(menu)&&/if\(tab!=previousTab\)\{settingsScroll=0;keyScroll=0;a15Scroll\[tab\]=0;\}/.test(keyboard),'P37 a tab switch (mouse or keyboard) scrolls the page back to the top');
// P01 row: first row of the game-options grid, wired to NativeOptionSet.ReduceMotion
ok(/DefReduce=new OptionDef\("optReduceMotion","reduceMotion",0,OptionKind\.Check/.test(menu),'P01 reduce motion definition');
ok(/var gameRows=new List<OptionDef>\{DefReduce\};foreach\(var d in NativeOptionSet\.All\)if\(d\.Tab==0\)gameRows\.Add\(d\);/.test(menu),'P01 reduce motion leads the game-options grid (web order), then the existing ten rows');
ok(/d\.Id=="optReduceMotion"\)return settings\.Options\.ReduceMotion\?1:0;/.test(menu)&&/settings\.Options\.ReduceMotion=on;if\(OptionChanged!=null\)OptionChanged\(d\.Key\)/.test(menu),'P01 row reads and writes the existing ReduceMotion property and notifies the host (save)');
ok(/NativeScreenTransition\.ReduceMotion=\(\)=>settings\.Options\.ReduceMotion\|\|NativeOsReducedMotion\.Enabled/.test(persist),'P01 the property is the one the screen transition already reads');
// nav rows: game 22 = 9 system rows + 11 option rows + reset + quit; counted from BuildItems
const navRows=menu.match(/A15NavRows\(\)\{return new\[\]\{(\d+),(\d+),(\d+),(\d+)\};\}/);ok(navRows&&+navRows[1]===22&&+navRows[2]===28&&+navRows[3]===3&&+navRows[4]===3,'nav rows 22/28/3/3 (+ key stops at runtime)');
const optionRows=1+require('node:fs').readFileSync(path.join(runtime,'Core/NativeOptionSet.cs'),'utf8').split('\n').filter(l=>/new OptionDef\("[^"]+","[^"]+",0,/.test(l)).length;
ok(optionRows===11,'game tab has 11 option rows (reduce motion + 10)');
ok(9+optionRows+2===+navRows[1],'game tab nav count = 9 system + '+optionRows+' option rows + reset + quit');
// P02
ok(/ApplyFrameCap\(settings\.FrameCap\);ApplySettingsLanguage\(\);(ApplySettingsOptions\(\);)?\}/.test(persist),'P02 the saved language is applied with the other host values at startup (lobby and game read lobby.Language)');
ok(/LobbyLanguage\.Startup\(settings\.Options\.Lang,lobby\.Language\)/.test(persist),'P02 saved value > start decision, empty/unknown keeps the host default');
ok(/void UpdateSettingsPersistence\(\)\n  \{\n   TrackSettingsLanguage\(\);/.test(persist)&&/settings\.Options\.Lang=now;QueueSettingsSave\(\)/.test(persist),'P02 a language change from any screen is saved');
ok(/if\(key=="preset"\)ApplySettingsLanguage\(\)/.test(options),'P02/P34 a loaded slot applies its language');
// P30
ok(/NativeBgmSelection\.Resolve\(key,track\)/.test(game)&&/music\.Sync\(key,audio,autoBgm\)/.test(game)&&/autoBgm=NativeBgmSelection\.IsAuto\(track\)/.test(game),'P30 the selected track (and whether it is auto) reaches the music host');
// BGM rotation host wiring
ok(/bool rot = rotate && audioKey == NativeBgmRotation\.FirstClip && \(key == "hell1" \|\| key\.Length == 0\);/.test(music)&&/if \(!rot && audioKey\.Length > 0\) rotation\.Reset\(\);/.test(music),'BGM rotation only on the auto field song; boss/death/victory/chosen songs reset it');
ok(/music\.loop = !rotating;/.test(music)&&/else if \(rotating && music\.clip != null && playedFor > 1f && !AudioListener\.pause\) \{ wanted = rotation\.Advance\(\);/.test(music),'BGM rotation: a rotating song plays once and the ended song advances through the normal switch (fade) path');
ok(/bedWanted = key == "hell1"/.test(music)&&/bus\.Snapshot\(key == "boss"\)/.test(music),'BGM rotation: beds and boss snapshot untouched');
ok(/public void Sync\(string key, string audioKey\)/.test(music)&&/bus\.Snapshot\(key == "boss"\)/.test(music)&&/bedWanted = key == "hell1"/.test(music),'P30 beds and boss snapshot still follow the stage key');
ok(/if\(!NativeBgmSelection\.IsSupported\(v\[i\]\)\)continue;/.test(menu)&&/string shown=NativeBgmSelection\.Effective\(settings\.Options\.BgmTrack\)/.test(menu),'P30 the menu lists only supported songs and shows an unsupported saved value as auto');
ok(/settingsBgmPreview=true/.test(options)&&/else if\(key\.Length==0&&settingsBgmPreview/.test(game),'P30 a newly chosen song is heard while the pause window is open');
// P34
ok(/NativeSettingsPreset\.Encode\(settings,NativeKeyBindInput\.Bindings\)/.test(menu)&&/NativeSettingsPreset\.Apply\(settings\.Presets\[slot\]/.test(menu),'P34 slots go through NativeSettingsPreset (keys + language)');
ok(/PresetResult\.Empty\)\{ShowPresetNote\("m\.presetEmpty"/.test(menu)&&/PresetResult\.Invalid\)\{ShowPresetNote\("m\.presetFail"/.test(menu),'P34 empty slot and broken slot give web feedback');
ok(/pauseMenu\.BindingSupported=SupportedNativeBinding/.test(game),'P34 the host key-code check is wired');
// P42
ok(/A15SyncKeyStops\(\);\n   bool held=/.test(keyboard)&&/A15SyncKeyStops\(\);\n   float contentH/.test(menu),'P42 the controls tab count follows the live key list every frame');
ok(/if\(it==null\)\{if\(tab==3&&idx>=3&&openSelect<0\)A15KeyStop\(idx-3,action\);return;\}/.test(menu),'P42 cursor stops beyond the three card/slider rows reach the key list');
ok(/keyList\.BeginListening\(keyList\.Bindings\.Listed\[NativeKeyFocus\.Row\(stop\)\],NativeKeyFocus\.IsSecondary\(stop\),lastAcceptKey\)/.test(menu)&&/public void BeginListening\(string action,bool alternate,KeyCode activator\)\{BeginListening\(action,alternate\);if\(activator!=KeyCode\.None\)held\.Add\(activator\);\}/.test(keylist),'P42 Enter/Space starts the capture without binding itself');
ok(/FocusStop==stopBase\|\|FocusStop==stopBase\+1/.test(keylist)&&/FocusStop==n\*2/.test(keylist),'P42 focus ring on slots and on the reset button');
ok(/if\(tab==3&&idx>=3&&KeyStopSpan\(idx-3,out kTop,out kBottom\)\)/.test(menu),'P42 the focused stop is scrolled into view');
// P33
ok(/pauseMenu\.CharacterIndex=CharacterRoster\.PlayableVisualIndex/.test(persist)&&/if\(!character&&Clicked\(r\)\)/.test(menu),'P33 selection mark follows the real character; the card click stays blocked');
// forbidden files untouched
// Basis: the demo-flavor lane commit merged into this branch (78cef36f9^2) - it already carries the flavor save-path files, so only changes made by the options lanes show up.
const basis=cp.execFileSync('git',['-C',project,'rev-parse','78cef36f9^2'],{encoding:'utf8'}).trim();
const names=cp.execFileSync('git',['-C',project,'diff','--name-only',basis,'--','Assets/Exoduser/Runtime/NativeHud.cs','Assets/Exoduser/Runtime/NativePanelTabBar.cs','Assets/Exoduser/Runtime/NativeForgePanel.cs','Assets/Exoduser/Runtime/NativeGame.CombatSave.cs','Assets/Exoduser/Runtime/NativeFlavorSavePaths.cs','Assets/Exoduser/Runtime/NativeFlavorStorage.cs'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
ok(names==='','forbidden files unchanged: '+names);
console.log(JSON.stringify({sourceChecks:checks}));
// dotnet Core contract
const env=Object.assign({},process.env,{DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false'}),dll=path.join(out,'dotnet-build');fs.mkdirSync(out,{recursive:true});
cp.execFileSync('dotnet',['build','-c','Release','-o',dll,path.join(here,'OptionsWave1Tests.csproj')],{env,stdio:['ignore','ignore','inherit']});
const result=cp.execFileSync('dotnet',[path.join(dll,'OptionsWave1Tests.dll'),path.join(project,'Assets/Exoduser/Resources/Data/a15_options_web.json'),path.join(out,'dotnet-out')],{env,encoding:'utf8',stdio:['ignore','pipe','inherit']});
console.log(result.trim());

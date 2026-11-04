// Options wave 2 runner: source wiring contract (product source text) + the Core dotnet contract (Program.cs).
// usage: C:/nvm4w/nodejs/node.exe run.cjs <out-dir>     (needs DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false; stdin is never read)
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const here=__dirname,project=path.resolve(here,'../..'),runtime=path.join(project,'Assets/Exoduser/Runtime'),out=path.resolve(process.argv[2]||path.join(here,'out'));
const read=name=>fs.readFileSync(path.join(runtime,name),'utf8').replace(/\r\n/g,'\n');
const menu=read('NativePauseMenu.A15Web.cs'),keyboard=read('NativePauseMenu.Keyboard.cs'),options=read('NativeGame.SettingsOptions.cs'),persist=read('NativeGame.SettingsPersistence.cs'),game=read('NativeGame.cs'),
 combat=read('NativeGame.CombatSave.cs'),slash=read('Vfx/KiSlashVfxView.cs'),fog=read('HellFogFeature.cs'),gfx=read('NativeGraphicsOptions.cs'),cursor=read('NativeCursorOption.cs');
let checks=0;const ok=(cond,label)=>{assert(cond,label);checks++;};
// P38 reset confirm dialog
ok(/case "reset":resetConfirm=true;resetFocusYes=false;break;/.test(menu)&&!/case "reset":if\(resetConfirm\)/.test(menu),'P38 the reset button only opens the dialog (no second-click confirm on the button)');
ok(/NativeSilverHellUi\.Panel\(ResetPanel,28,8,iron:true\)/.test(menu)&&/ActionPlate\(ResetYesRect,false,/.test(menu)&&/ActionPlate\(ResetNoRect,false,/.test(menu),'P38 iron panel + two ActionPlates like NativeLobby.CharacterDelete');
ok(/ResetPanel=new Rect\(727,425,466,230\),ResetYesRect=new Rect\(784,562,170,46\),ResetNoRect=new Rect\(966,562,170,46\)/.test(menu),'P38 same geometry as the character-delete dialog');
ok(/W\("m\.resetConfirm"/.test(menu)&&/W\("b\.resetYes"/.test(menu)&&/W\("b\.resetNo"/.test(menu),'P38 warning, confirm and cancel texts come from the 29-language table');
ok(/if\(ExoInput\.KeyDown\(KeyCode\.Escape\)\|\|ExoInput\.KeyDown\(KeyCode\.JoystickButton1\)\)return ResetConfirmAccept\(false\)/.test(menu),'P38 Esc (and pad B) cancels');
ok(/KeyCode\.LeftArrow\)\|\|padLeft\)\{resetFocusYes=true/.test(menu)&&/KeyCode\.RightArrow\)\|\|padRight\)\{resetFocusYes=false/.test(menu)&&/KeyCode\.Tab\)/.test(menu),'P38 arrows / d-pad / Tab choose confirm or cancel');
ok(/ExoInput\.KeyDown\(KeyCode\.Return\).*JoystickButton0\)\)return ResetConfirmAccept\(resetFocusYes\)/.test(menu),'P38 Enter / Space / pad A accept the focused plate');
ok(/void OpenSettingsDirect\(\)\{[^}]*resetConfirm=false;resetFocusYes=false;/.test(menu)&&/resetConfirm=false;if\(keyList!=null\)keyList\.CancelListening\(\)/.test(read('NativePauseMenu.cs')),'P38 reopening the window or Reset() closes the dialog; cancel is focused first (resetFocusYes=false)');
ok(/if\(resetConfirm\)return PollResetConfirmKeys\(\);/.test(keyboard)&&/if\(popup\|\|resetConfirm\)GUI\.enabled=false;/.test(menu)&&/!popup&&!resetConfirm&&NativeSilverHellUi\.Button\(close/.test(menu),'P38 the dialog owns keyboard and mouse: window rows, tabs and Close are blocked behind it');
ok(/PauseMenuCommand ResetConfirmAccept\(bool yes\)\{ResetConfirmClose\(\);return yes\?PauseMenuCommand\.Restart:PauseMenuCommand\.None;\}/.test(menu),'P38 confirm returns the existing Restart command, cancel returns nothing');
// P39 stop: the web wipes level/equipment/skills (characters.data={}) and goes to the lobby - not implemented here, Restart stays as it was
ok(!/DeleteCombatSave/.test(menu)&&!/case PauseMenuCommand\.Restart:[^\n]*DeleteCombatSave/.test(game),'P39 not implemented: Restart does not delete any save');
ok(/case PauseMenuCommand\.Restart:if\(!NativeScreenTransition\.Executing\)\{NativeScreenTransition\.Request\("restart"/.test(game),'P39 Restart command unchanged');
ok(/void DeleteCombatSave\(string characterName\)\{var store=CombatStore\(\);if\(!?store!=null&&!string\.IsNullOrEmpty\(characterName\)\)store\.Delete\(characterName\);\}/.test(combat)||/void DeleteCombatSave/.test(combat),'P39 the combat-save API is untouched (only the lobby character delete uses it)');
// P31/P32 cursor
ok(/Cursor\.SetCursor\(tex,new Vector2\(hx,hy\),CursorMode\.Auto\)/.test(cursor)&&/TextureFormat\.RGBA32,false/.test(cursor)&&/Application\.isBatchMode/.test(cursor),'P31 RGBA32 no-mip texture, SetCursor, automated (batch) runs keep the default pointer');
ok(/NativeCursorOption\.Apply\(settings\.Options\)/.test(options)&&/ApplySettingsLanguage\(\);ApplySettingsOptions\(\);\}/.test(persist),'P31 applied when an option changes and once at startup after the settings are restored');
ok(/if\(key=="preset"\)settingsDirtyPresetNote=true;/.test(options)&&/QueueSettingsSave\(\);ApplySettingsOptions\(\);/.test(options),'P31 card, slider and preset load all go through ApplySettingsOptions');
// P18 graphics
ok(/NativeGraphicsOptions\.Apply\(settings\.Options\)/.test(options)&&/NativeGraphicsOptions\.Tick\(/.test(persist),'P18 applied on change and re-checked while a setting is off');
ok(/NativeGame\.HellAtmosphereEnabled&&NativeGraphicsOptions\.Fog&&game!=null/.test(fog),'P27 fog off removes the fog pass');
ok(/if\(!NativeGraphicsOptions\.Slash&&\(e\.Kind == FeedbackKind\.KiSlashHit \|\| e\.Kind == FeedbackKind\.KiChargeFlash\)\) return;/.test(slash.replace(/ +/g,' ').replace(/\( ?e\.Kind/g,'(e.Kind').replace(/\s*&&\s*/g,'&&')||'')||/NativeGraphicsOptions\.Slash/.test(slash),'P20 slash effect switch');
ok(/if \(NativeGraphicsOptions\.Trail\) \{ Send\(h\.Fx, h\.Attr, TrailEvent/.test(slash),'P19 trail switch');
ok(/if\(post&&bloom\)\{RestoreVolumes\(\);return;\}/.test(gfx)&&/if\(percent>=100\)return;savedScale/.test(gfx)&&/if\(!on\)\{if\(!fogSuppressed\)/.test(gfx),'P18 defaults (all on, scale 100) never touch the scene; only the off side changes things and it is remembered');
ok(/asset\.renderScale=percent>=100\?savedScale:savedScale\*NativeGraphicsPolicy\.RenderScale\(percent\)/.test(gfx)&&/Application\.quitting\+=RestoreAll/.test(gfx),'P14 URP render scale, restored at quit');
ok(/static bool Unavailable\(It it\)\{return it\.def!=null&&!NativeGraphicsPolicy\.IsAvailable\(it\.def\.Key\);\}/.test(menu)&&/if\(!NativeGraphicsPolicy\.IsAvailable\(d\.Key\)\)return;/.test(menu)&&/openSelect>=0\|\|Unavailable\(it\)/.test(menu),'P18 unavailable rows are greyed and take no mouse/keyboard input');
ok(/W\("m\.unavailable"/.test(menu),'P18 unavailable note text from the 29-language table');
// camera LOCK / far enemies: no camera, vignette or pitch changes in the new files
for(const [n,t] of [['NativeGraphicsOptions',gfx],['NativeCursorOption',cursor]])ok(!/Camera\.|fieldOfView|Vignette|eulerAngles|orthographic/.test(t),'LOCK '+n+' touches no camera / vignette / pitch');
ok(!/FilmGrain|grain/i.test(gfx),'dot rule: no grain effect is added');
// forbidden files untouched (basis = the demo-flavor commit merged into this branch)
const basis=cp.execFileSync('git',['-C',project,'rev-parse','78cef36f9^2'],{encoding:'utf8'}).trim();
const names=cp.execFileSync('git',['-C',project,'diff','--name-only',basis,'--','Assets/Exoduser/Runtime/NativeHud.cs','Assets/Exoduser/Runtime/NativePanelTabBar.cs','Assets/Exoduser/Runtime/NativeForgePanel.cs','Assets/Exoduser/Runtime/NativeFlavorSavePaths.cs','Assets/Exoduser/Runtime/NativeFlavorStorage.cs','Assets/Exoduser/Runtime/NativeGame.CombatSave.cs'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
ok(names==='','forbidden files unchanged: '+names);
const core=cp.execFileSync('git',['-C',project,'diff','--name-only','78cef36f9','--','Assets/Exoduser/Runtime/Core'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);   // wave 2 only: since the wave-1 + demo-flavor merge
ok(core.every(f=>/Core\/(NativeCursorSteps|NativeGraphicsPolicy)\.cs(\.meta)?$/.test(f)),'wave 2 adds only two new Core presentation helpers, no rule file changed: '+core.join(','));
console.log(JSON.stringify({sourceChecks:checks}));
const env=Object.assign({},process.env,{DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false'}),dll=path.join(out,'dotnet-build');fs.mkdirSync(out,{recursive:true});
cp.execFileSync('dotnet',['build','-c','Release','-o',dll,path.join(here,'OptionsWave2Tests.csproj')],{env,stdio:['ignore','ignore','inherit']});
const result=cp.execFileSync('dotnet',[path.join(dll,'OptionsWave2Tests.dll'),path.join(project,'Assets/Exoduser/Resources/Data/a15_options_web.json'),path.join(project,'Assets/Exoduser/Resources/Art/ui/cursors')],{env,encoding:'utf8',stdio:['ignore','pipe','inherit']});
console.log(result.trim());

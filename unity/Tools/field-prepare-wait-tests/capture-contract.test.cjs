// Source contract for the real lobby->field loading capture (--unity-transition-loading-capture). No Unity.
const fs=require('node:fs'),path=require('node:path');const R=f=>fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime',f),'utf8');
let fail=0;const check=(ok,name)=>{console.log((ok?'PASS ':'FAIL ')+name);if(!ok)fail++;};
const game=R('NativeGame.cs'),cap=R('NativeGame.TransitionLoadingCapture.cs');
check(/IndexOf\(args,"--unity-transition-loading-capture"\)>=0\)\{[^}]*StartCoroutine\(TransitionLoadingCapture\(\)\)/.test(game),'argument branch in NativeGame.cs starts TransitionLoadingCapture');
check(/NativeQaSandbox\.Active/.test(cap)&&/IsPathRooted\(output\)/.test(cap)&&/NativeQaSandbox\.Root/.test(cap),'goes through the QA sandbox with an absolute output folder');
check(/lobby\.EnterSelectedCharacter\(\)/.test(cap),'transition starts through the shared lobby start path (EnterSelectedCharacter)');
check(!/NativeScreenTransition\.Request\(/.test(cap)&&!/EnterNativeTest\(/.test(cap)&&!/EnterFromLobby\(/.test(cap)&&!/ResetRun\(/.test(cap),'does not request, enter or reset the field itself');
check(/lobby\.AutomatedInput=false/.test(cap)&&/lobbySmoke=false/.test(cap),'automation input is released before the lobby start');
check(/WaitForEndOfFrame/.test(cap)&&/Application\.Quit\(/.test(cap),'captures at end of frame and quits');
process.exitCode=fail?1:0;

// Source contract for the 3D field abort path (no Unity): an abort during LoadSceneAsync must not leave RM1_Slice's camera / listener / volume on,
// the load loop reports progress, OnDisable frees r3Loading, and a retry is gated on pending scene operations.
const fs=require('node:fs'),path=require('node:path');const R=f=>fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime',f),'utf8');
const s=R('NativeGame.Remodel3D.cs');const t=R('NativeScreenTransition.cs');const p=R('NativeTransitionPrepare.cs');
const checks=[
 ['load loop reports progress',/while\s*\(op != null && !op\.isDone\)[^\n]*NativeTransitionProgress\.Report\(/.test(s)],
 ['AsyncOperation kept in r3LoadOp',/r3LoadOp\s*=\s*op/.test(s)],
 ['abort tears the scene down',/Remodel3DAbort[\s\S]*R3Teardown\(\)/.test(s)],
 ['in-flight load is cleaned up on completion',/!op\.isDone\)\s*\{[^}]*op\.completed \+=[^}]*R3UnloadScene\(/.test(s)],
 ['finished scene is switched off then unloaded',/R3UnloadScene[\s\S]*SetActive\(false\)[\s\S]*UnloadSceneAsync/.test(s)],
 ['restart gated on pending ops',/r3Gate\.CanStart/.test(s)&&/pendingOps==0/.test(p)],
 ['OnDisable frees r3Loading',/void OnDisable\(\)[^\n]*r3Loading = false/.test(s)||/void OnDisable\(\)[^\n]*Remodel3DAbort\("owner-disabled"/.test(s)],
 ['field entry re-enables retry',/FieldEntryRequested\(\)/.test(t)&&/FieldEntry\(\)/.test(s)],
 ['hard-cap documented in the host comment',/hard-cap/.test(t)],
 ['no stale "recovers to the lobby" wording',!/recovers to the lobby/.test(p)&&!/recovers to the lobby/.test(t)],
];
let bad=0;for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++;}process.exitCode=bad?1:0;

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
 ['same-frame abort finds the scene by name',/R3UnloadScene\(r3Scene\.IsValid\(\) \? r3Scene : SceneManager\.GetSceneByName\(R3SceneName\)\)/.test(s)],
 ['abort destroys the tracked runtime objects and unloads unused assets once',/static void R3DestroyMade\(\)[\s\S]*Destroy\(made\)[\s\S]*r3Made\.Clear\(\); Resources\.UnloadUnusedAssets\(\);/.test(s)&&(s.match(/Resources\.UnloadUnusedAssets\(\)/g)||[]).length===1],
 ['teardown runs R3DestroyMade for both branches',/else R3UnloadScene\([^\n]*\n\s*R3DestroyMade\(\);/.test(s)],
 ['success keeps the objects (list cleared, not destroyed)',/r3Loaded = true; r3Loading = false; r3Made\.Clear\(\)/.test(s)],
 ['gate abort uses MarkPermanent and one shared counter',/Abort\(bool exception\)\{if\(\+\+aborts>MaxRetries\)MarkPermanent\(\)/.test(p)],
 ['no stale "recovers to the lobby" wording',!/recovers to the lobby/.test(p)&&!/recovers to the lobby/.test(t)],
];
const A=['NativeGame.A2Bramble.cs','NativeGame.A2Field.cs','NativeGame.A2Forest.cs','NativeGame.A2RootRelief.cs','NativeGame.A2ShoreField.cs','NativeGame.HellEnvironment.cs','NativeGame.HellGround.cs','NativeGame.HellLighting.cs'];
let untracked=[];for(const f of A){const lines=R(f).split('\n');lines.forEach((l,i)=>{const r=/new (Mesh|Material|Texture2D)\b(?!\[)/g;let m;while((m=r.exec(l))){if(!l.slice(0,m.index).trimEnd().endsWith('R3Track(')&&!(f==='NativeGame.A2Forest.cs'&&/1920,1080/.test(l)))untracked.push(f+':'+(i+1));}});}
checks.push(['every runtime Mesh/Material/Texture2D made during assembly is tracked'+(untracked.length?' '+untracked.join(','):''),untracked.length===0]);
let bad=0;for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++;}process.exitCode=bad?1:0;

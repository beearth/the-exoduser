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
 ['teardown clears every cache field holding tracked objects',['a2BrambleMeshes = null','a2BrambleMaterial = null','a2Water = null','a2FieldRootMaterial = null','a2FieldSoil = null','hellActorMaterial = null','hellFlameFrames = null','hellEnvironment = null'].every(k=>new RegExp('R3Teardown\\(\\)[\\s\\S]*'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).test(s))],
 ['bramble cache uses the Unity-null rebuild check',/CacheValidity\.NeedsRebuild<UnityEngine\.Object>\(a2BrambleMaterial,a2BrambleMeshes,o=>o==null\)/.test(R('NativeGame.A2Bramble.cs'))],
 ['player terrain layers cloned from untouched originals (destroyed-layer guard)',/CacheValidity\.PickSource\(hellLayerOriginals,layers,i,l=>l==null\)/.test(R('NativeGame.HellLighting.cs'))&&/hellLayerOriginals=\(TerrainLayer\[\]\)layers\.Clone\(\)/.test(R('NativeGame.HellLighting.cs'))],
 ['flame sprites tracked',/hellFlameFrames\[i\]=R3Track\(Sprite\.Create\(/.test(R('NativeGame.HellLighting.cs'))],
 ['unload-only stall does not use a retry',/WaitingOnOps\(r3Loading\)/.test(s)],
 ['abort comment states the shared counter policy',/shares ONE counter/.test(s)&&!/retried at the next field entry\. exception=true/.test(s)],
 ['unload-only wait defers instead of counting',/WaitingOnOps\(r3Loading\)\) \{ r3Gate\.Defer\(\)/.test(s)&&!/WaitingOnOps\(r3Loading\)\) \{[^}]*r3Gate\.Abort/.test(s)],
 ['hellLayerOriginals released after a permanent abort and after success',/if \(r3Gate\.Permanent\) \{ r3Failed = true; hellLayerOriginals = null; \}/.test(s)&&/r3Loaded = true; r3Loading = false; r3Made\.Clear\(\); hellLayerOriginals = null;/.test(s)],
 ['R06: required field asset missing throws (no silent yield break)',/FieldRequirements\.FirstMissing\(a2FieldSoil!=null/.test(R('NativeGame.A2Field.cs'))&&/throw new InvalidOperationException\("A2 field required asset missing/.test(R('NativeGame.A2Field.cs'))&&!/지면 재질 누락"\);yield break/.test(R('NativeGame.A2Field.cs'))],
 ['R05: bad rig / camera throws into the abort path (scene unloaded by R3Teardown), no bare r3Failed return',/throw new System\.InvalidOperationException\("RM-1 scene rig \/ terrain not found"\)/.test(s)&&/throw new System\.InvalidOperationException\("RM-1 camera component missing"\)/.test(s)&&!/rig \/ terrain not found: staying 2D/.test(s)],
 ['R04: Remodel3DLoad disposes the guard in its finally; the guard disposes its stack in finally',/finally \{ \(run as System\.IDisposable\)\?\.Dispose\(\);/.test(s)&&/\}finally\{while\(stack\.Count>0\)/.test(p)],
 ['R07: r3Cam Unity-null check before use after the yields',/if\(r3Cam==null\)throw new InvalidOperationException\("A2 field camera destroyed during assembly"\);\s*\/\/[^\n]*\n\s*var aa=r3Cam\.GetUniversalAdditionalCameraData/.test(R('NativeGame.A2Field.cs'))],
 ['R09: root relief checks sharedMesh null before isReadable',/filters\[0\]\.sharedMesh==null\|\|!filters\[0\]\.sharedMesh\.isReadable/.test(R('NativeGame.A2RootRelief.cs'))],
 ['no stale "recovers to the lobby" wording',!/recovers to the lobby/.test(p)&&!/recovers to the lobby/.test(t)],
];
const A=['NativeGame.A2Bramble.cs','NativeGame.A2Field.cs','NativeGame.A2Forest.cs','NativeGame.A2RootRelief.cs','NativeGame.A2ShoreField.cs','NativeGame.HellEnvironment.cs','NativeGame.HellGround.cs','NativeGame.HellLighting.cs'];
let untracked=[];for(const f of A){const lines=R(f).split('\n');lines.forEach((l,i)=>{const r=/new (Mesh|Material|Texture2D)\b(?!\[)/g;let m;while((m=r.exec(l))){if(!l.slice(0,m.index).trimEnd().endsWith('R3Track(')&&!(f==='NativeGame.A2Forest.cs'&&/1920,1080/.test(l)))untracked.push(f+':'+(i+1));}});}
checks.push(['every runtime Mesh/Material/Texture2D made during assembly is tracked'+(untracked.length?' '+untracked.join(','):''),untracked.length===0]);
const cacheFields=new Set();for(const f of A){for(const l of R(f).split('\n')){const m=/\b([a-z][A-Za-z0-9_]*)\s*=\s*R3Track\(/.exec(l);if(m&&!/\bvar\s+[A-Za-z0-9_]+\s*=\s*R3Track\(/.test(l.slice(Math.max(0,m.index-6),m.index+m[0].length))&&/^(a2|hell)/.test(m[1]))cacheFields.add(m[1]);}}
const teardown=(s.match(/void R3Teardown\(\)[\s\S]*?\n        \}/)||[''])[0];const missing=[...cacheFields].filter(k=>!new RegExp('\\b'+k+'\\s*=\\s*null').test(teardown));
checks.push(['every a2*/hell* field assigned from R3Track is nulled in R3Teardown'+(missing.length?' MISSING '+missing.join(','):' ('+[...cacheFields].join(',')+')'),missing.length===0]);
let bad=0;for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++;}process.exitCode=bad?1:0;

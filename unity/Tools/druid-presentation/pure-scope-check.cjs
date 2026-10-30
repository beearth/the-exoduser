// expected 대비 순수 2D 부분 인수 경계를 Git tree 자체에서 검사한다. 작업본/INDEX 변경0.
const cp=require('node:child_process'),path=require('node:path');
const arg=k=>{const n=process.argv.indexOf(k);if(n<0)throw Error('인자 필요 '+k);return process.argv[n+1]};
const repo=arg('--repo'),expected=arg('--expected'),candidate=arg('--candidate');
const git=args=>cp.execFileSync('git',args,{cwd:repo,windowsHide:true,encoding:'utf8',maxBuffer:16*1024*1024});
const prefix='unity/Assets/Exoduser/';
const runtime=['NativeBossView.cs','NativeBossView.DruidProjectile.cs','NativeBossView.DruidImpact.cs','NativeDruidBody.cs','NativeDruidImpactClock.cs','NativeDruidProjectileSize.cs','NativeGame.BossView.cs','NativeGame.cs','NativeGame.DruidImpactCapture.cs','NativeGame.M1Check.cs','NativeGame.PlaytestCapture.cs','NativeReviewArgs.cs'];
const added=['NativeBossView.DruidProjectile.cs','NativeBossView.DruidImpact.cs','NativeDruidImpactClock.cs','NativeDruidProjectileSize.cs','NativeGame.DruidImpactCapture.cs'];
const tools=['Program.cs','ImpactChecks.cs','DamageSignalChecks.cs','run.cjs','damage-signal-check.cjs','shader-color-check.cjs','thorn-volume-check.cjs','pure-scope-check.cjs'];
const allowed=new Set([...runtime.map(n=>prefix+'Runtime/'+n),...added.map(n=>prefix+'Runtime/'+n+'.meta'),prefix+'Runtime/Core/Simulation.cs',prefix+'Resources/Shaders/DruidProjectile.shader',prefix+'Resources/Shaders/DruidProjectile.shader.meta',...tools.map(n=>'unity/Tools/druid-presentation/'+n),'docs/engine/UNITY_DRUID_R4_PURE_PARTIAL_20261031.md']);
const changed=git(['diff','--name-only',expected,candidate]).trim().split(/\r?\n/).filter(Boolean);
let checks=0,failed=0;function check(ok,label){checks++;if(!ok){failed++;console.log('FAIL '+label)}}
for(const n of changed)check(allowed.has(n),'허용 범위 '+n);
const excluded=['Resources/Shaders/DruidModelComposite.shader','Runtime/NativeDruidModelView.cs','Runtime/NativeDruidMotionClock.cs','Runtime/NativeDruidRigContract.cs'];
for(const n of excluded){const q=cp.spawnSync('git',['cat-file','-e',candidate+':'+prefix+n],{cwd:repo,windowsHide:true,encoding:'utf8'});check(q.status!==0,'제외 파일 부재 '+n);}
for(const n of runtime){let s;try{s=git(['show',candidate+':'+prefix+'Runtime/'+n])}catch{check(false,'필수 2D 파일 '+n);continue}check(!/\bNativeDruid(?:ModelView|MotionClock|RigContract)\b|\bDruid3D\b|DruidModelComposite|--unity-druid-3d/.test(s),'3D 신규 의존 없음 '+n);}
for(const n of ['unity/Assets/Scenes/FirstPlayable.unity','unity/Assets/Scenes/FirstPlayable.unity.meta'])check(git(['rev-parse',expected+':'+n]).trim()===git(['rev-parse',candidate+':'+n]).trim(),'FirstPlayable blob 동일 '+n);
const core=git(['diff','--unified=0',expected,candidate,'--',prefix+'Runtime/Core/Simulation.cs']).split(/\r?\n/);
const plus=core.filter(n=>n.startsWith('+')&&!n.startsWith('+++')),minus=core.filter(n=>n.startsWith('-')&&!n.startsWith('---'));
check(plus.length===3&&minus.length===0&&plus[1].includes('!dot && head._isCrit && total > 0')&&plus[2].includes('QueueEnemySound(FeedbackKind.EnemyCrit, enemy, "crit_heavy", .45, 1);'),'Core의 기존 계산 치명타 관찰3줄만');
console.log(JSON.stringify({검사:checks,실패:failed,변경경로:changed.length,expected,candidate,한계:'범위/tree 검증. 컴파일/GPU/M1/시각 판정은 별도'}));process.exitCode=failed?1:0;

// No Unity process, network, package restore, or writes outside this worktree.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'tools/combat-impact-check');
fs.mkdirSync(out,{recursive:true});
const latest=p=>fs.readdirSync(p).filter(x=>/^\d/.test(x)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
const sdk='C:/Program Files/dotnet/sdk',pack='C:/Program Files/dotnet/packs/Microsoft.NETCore.App.Ref';
const ref=path.join(pack,latest(pack),'ref');const tfm=fs.readdirSync(ref).at(-1);
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.name.endsWith('.cs')?[path.join(p,e.name)]:[]);
const feedback=process.argv.includes('--feedback'),m1=process.argv.includes('--m1'),region=process.argv.includes('--region'),name=feedback?'feedback':m1?'m1':region?'region':'checks';
const files=[...walk(path.join(root,'unity/Assets/Exoduser/Runtime/Core')),path.join(__dirname,feedback?'../feedback-oracle/Program.cs':m1?'M1ParryTests.cs':region?'../region-test/Program.cs':'Program.cs')];
if(m1||region)files.push(path.join(root,'unity/Assets/Exoduser/Runtime/SourceMap.cs'));
if(m1){
 const source=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeGame.M1Check.cs'),'utf8');
 const cut=source.slice(source.indexOf('            // Capture the real shield-strike parry'),source.indexOf('            for (int i = 0; i < 60 && p.State != "idle";'));
 if(!cut.includes('HurtPlayer(500)')||!cut.includes('06-parry-shield'))throw new Error('M1 shield cut not found');
 const gate=source.slice(source.indexOf('            levelUp.Hide(); sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.Loot.Clear();\n            var flow'),source.indexOf('            if (!naturalUnlock)'));
 if(!gate.includes('bool naturalUnlock ='))throw new Error('M1 09c not found');
 const generated=path.join(out,'M1Source.cs');
 fs.writeFileSync(generated,'using System;using Exoduser.UnityPort.Core;static partial class M1ParryTests{static void ShieldCut(Simulation sim,Action capture){var p=sim.Player;'+cut.replace(/yield return M1Shot\("06-parry-shield"\);/g,'capture();').replace('yield return M1ParryCameraComparison(qContact);','')+'}static void GateRoute(Simulation sim){active=sim;var p=sim.Player;'+gate.replace('levelUp.Hide();','')+'}}');files.push(generated);
}
const policy=path.join(root,'unity/Assets/Exoduser/Runtime/Vfx/CombatImpactTimeline.cs');if(fs.existsSync(policy))files.push(policy);
const args=['/nologo','/target:exe','/langversion:latest','/out:'+path.join(out,name+'.dll'),...fs.readdirSync(path.join(ref,tfm)).filter(f=>f.endsWith('.dll')).map(f=>'/r:'+path.join(ref,tfm,f)),...files];
const env={...process.env,DOTNET_CLI_HOME:out,DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
function run(a){return cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',a,{encoding:'utf8',windowsHide:true,env,timeout:60000});}
let r=run([path.join(sdk,latest(sdk),'Roslyn/bincore/csc.dll'),...args]);let log=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');
if(r.status===0){fs.writeFileSync(path.join(out,name+'.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm,framework:{name:'Microsoft.NETCore.App',version:tfm.slice(3)+'.0'},rollForward:'LatestMajor'}}));r=run([path.join(out,name+'.dll'),...(feedback?[path.join(out,'feedback.json'),path.join(__dirname,'../feedback-oracle/oracle.json')]:m1||region?[path.join(root,'unity/Assets/Exoduser/Resources/Data/ch1_map.json')]:[])]);log+=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');}
let status=r.status??1;
if(status===0&&name==='checks'){
 const art=cp.spawnSync('C:/Python314/python.exe',[path.join(root,'tools/vfx/recolor_blood_dark.py'),'--check-only'],{cwd:root,encoding:'utf8',windowsHide:true,env:{...env,PYTHONDONTWRITEBYTECODE:'1'},timeout:60000});
 log+=(art.stdout||'')+(art.stderr||'')+(art.error?.message||'');status=art.status??1;
 if(status===0){const orb=cp.spawnSync('C:/Python314/python.exe',[path.join(root,'tools/vfx/make_elem_orb_v3.py'),'--check-only'],{cwd:root,encoding:'utf8',windowsHide:true,env:{...env,PYTHONDONTWRITEBYTECODE:'1'},timeout:60000});
  log+=(orb.stdout||'')+(orb.stderr||'')+(orb.error?.message||'');status=orb.status??1;}
}
fs.writeFileSync(path.join(out,process.argv.includes('--red')?'red.log':name+'.log'),log);process.stdout.write(log);process.exitCode=status;

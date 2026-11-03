// No Unity process, network, package restore, or writes outside this worktree.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'tools/combat-impact-check');
fs.mkdirSync(out,{recursive:true});
const latest=p=>fs.readdirSync(p).filter(x=>/^\d/.test(x)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
const sdk='C:/Program Files/dotnet/sdk',pack='C:/Program Files/dotnet/packs/Microsoft.NETCore.App.Ref';
const ref=path.join(pack,latest(pack),'ref');const tfm=fs.readdirSync(ref).at(-1);
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.name.endsWith('.cs')?[path.join(p,e.name)]:[]);
const feedback=process.argv.includes('--feedback'),name=feedback?'feedback':'checks';
const files=[...walk(path.join(root,'unity/Assets/Exoduser/Runtime/Core')),path.join(__dirname,feedback?'../feedback-oracle/Program.cs':'Program.cs')];
const policy=path.join(root,'unity/Assets/Exoduser/Runtime/Vfx/CombatImpactTimeline.cs');if(fs.existsSync(policy))files.push(policy);
const args=['/nologo','/target:exe','/langversion:latest','/out:'+path.join(out,name+'.dll'),...fs.readdirSync(path.join(ref,tfm)).filter(f=>f.endsWith('.dll')).map(f=>'/r:'+path.join(ref,tfm,f)),...files];
const env={...process.env,DOTNET_CLI_HOME:out,DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
function run(a){return cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',a,{encoding:'utf8',windowsHide:true,env,timeout:60000});}
let r=run([path.join(sdk,latest(sdk),'Roslyn/bincore/csc.dll'),...args]);let log=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');
if(r.status===0){fs.writeFileSync(path.join(out,name+'.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm,framework:{name:'Microsoft.NETCore.App',version:tfm.slice(3)+'.0'},rollForward:'LatestMajor'}}));r=run([path.join(out,name+'.dll'),...(feedback?[path.join(out,'feedback.json'),path.join(__dirname,'../feedback-oracle/oracle.json')]:[])]);log+=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');}
fs.writeFileSync(path.join(out,process.argv.includes('--red')?'red.log':name+'.log'),log);process.stdout.write(log);process.exitCode=r.status??1;

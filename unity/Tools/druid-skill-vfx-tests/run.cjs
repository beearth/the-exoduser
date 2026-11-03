// Pure-calculation checks of the druid skill VFX timelines (no Unity process, no window, no sound). Compiles Core + the Unity-free timeline files with Roslyn and runs the result.
// Everything emitted goes to I:/EXODUSER-Storage/claude-runs/vfx-druid-slam/check (outside the repo).
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),out='I:/EXODUSER-Storage/claude-runs/vfx-druid-slam/check';
fs.mkdirSync(out,{recursive:true});
const latest=p=>fs.readdirSync(p).filter(x=>/^\d/.test(x)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
const sdk='C:/Program Files/dotnet/sdk',pack='C:/Program Files/dotnet/packs/Microsoft.NETCore.App.Ref';
const ref=path.join(pack,latest(pack),'ref');const tfm=fs.readdirSync(ref).at(-1);
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.name.endsWith('.cs')?[path.join(p,e.name)]:[]);
const vfx=path.join(root,'unity/Assets/Exoduser/Runtime/Vfx');
const files=[...walk(path.join(root,'unity/Assets/Exoduser/Runtime/Core')),path.join(vfx,'DruidSlamVfxTimeline.cs'),path.join(__dirname,'Program.cs')];
const args=['/nologo','/target:exe','/langversion:latest','/out:'+path.join(out,'checks.dll'),...fs.readdirSync(path.join(ref,tfm)).filter(f=>f.endsWith('.dll')).map(f=>'/r:'+path.join(ref,tfm,f)),...files];
const env={...process.env,DOTNET_CLI_HOME:out,DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
function run(a){return cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',a,{encoding:'utf8',windowsHide:true,env,timeout:120000});}
let r=run([path.join(sdk,latest(sdk),'Roslyn/bincore/csc.dll'),...args]);let log=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');
if(r.status===0){fs.writeFileSync(path.join(out,'checks.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm,framework:{name:'Microsoft.NETCore.App',version:tfm.slice(3)+'.0'},rollForward:'LatestMajor'}}));r=run([path.join(out,'checks.dll')]);log+=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');}
fs.writeFileSync(path.join(out,'checks.log'),log);process.stdout.write(log);process.exitCode=r.status??1;

// Offline real-file regression using Unity's installed .NET SDK, without NuGet.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),sdk='G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk';
const output='I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/f1-tests';
fs.mkdirSync(output,{recursive:true});
const full=process.argv.includes('--full'),name=full?'DemoFlavorTests':'ImportRecoveryTests';
const refs=path.join(sdk,'packs/Microsoft.NETCore.App.Ref/8.0.21/ref/net8.0');
const dll=path.join(output,name+'.dll');
const project=fs.readFileSync(path.join(__dirname,name+'.csproj'),'utf8');
const sources=[...project.matchAll(/<Compile Include="([^"]+)"/g)].map(m=>path.resolve(__dirname,m[1]));
const args=['-nologo','-target:exe','-out:'+dll,...fs.readdirSync(refs).filter(x=>x.endsWith('.dll')).map(x=>'-r:'+path.join(refs,x)),...sources];
const options={cwd:root,encoding:'utf8',windowsHide:true,timeout:60000};
let prefix='';
if(full){
 const contracts=cp.spawnSync(process.execPath,[path.join(__dirname,'contracts.cjs')],options);
 prefix=(contracts.stdout||'')+(contracts.stderr||'');
 if(contracts.status!==0){fs.writeFileSync(path.join(output,'full-regression.log'),prefix);process.stdout.write(prefix);process.exit(contracts.status??1);}
}
let r=cp.spawnSync(path.join(sdk,'dotnet.exe'),[path.join(sdk,'sdk/8.0.318/Roslyn/bincore/csc.dll'),...args],options);
let log=prefix+(r.stdout||'')+(r.stderr||'');
if(r.status===0){
 fs.writeFileSync(path.join(output,name+'.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.21'}}}));
 const runtimeArgs=full?[dll,path.join(root,'unity/Library/demo-flavor-tests-fixture'),path.join(root,'unity/Assets/Exoduser/Resources')]:[dll,path.join(root,'unity/Library/f1-import-recovery-fixture')];
 r=cp.spawnSync(path.join(sdk,'dotnet.exe'),runtimeArgs,options);log+=(r.stdout||'')+(r.stderr||'');
}
if(r.error)log+=r.error.message;
fs.writeFileSync(path.join(output,full?'full-regression.log':'result.log'),log);process.stdout.write(log);process.exitCode=r.status??1;

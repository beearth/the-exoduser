const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),out=process.env.EXO_ENEMY3D_CHECK_OUT||'I:/EXODUSER-Storage/codex-takeover/parry-g2/enemy3d-check';fs.mkdirSync(out,{recursive:true});
const policy=path.join(root,'unity/Assets/Exoduser/Runtime/NativeEnemyRigPolicy.cs');
if(!fs.existsSync(policy)){const m='FAIL: enemy rig presentation policy is absent\n';fs.writeFileSync(path.join(out,'policy.log'),m);process.stdout.write(m);process.exit(1);}
const pack='C:/Program Files/dotnet/packs/Microsoft.NETCore.App.Ref/8.0.6/ref/net8.0';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.name.endsWith('.cs')?[path.join(p,e.name)]:[]);
const sources=walk(path.join(root,'unity/Assets/Exoduser/Runtime/Core'));
const dll=path.join(out,'Enemy3DTests.dll'),rsp=path.join(out,'checks.rsp');
fs.writeFileSync(rsp,['-nologo','-target:exe','-langversion:latest','-out:'+dll,...fs.readdirSync(pack).filter(x=>x.endsWith('.dll')).map(x=>'-r:'+path.join(pack,x)),...sources,policy,path.join(__dirname,'Program.cs')].map(JSON.stringify).join('\n'));
const run=args=>cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',args,{windowsHide:true,encoding:'utf8',timeout:60000,maxBuffer:2000000});
let r=run(['C:/Program Files/dotnet/sdk/8.0.301/Roslyn/bincore/csc.dll','@'+rsp]);let log=(r.stdout||'')+(r.stderr||'');if(r.status===0){fs.writeFileSync(path.join(out,'Enemy3DTests.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.0'},rollForward:'LatestPatch'}}));r=run([dll,path.join(root,'unity/Assets/Exoduser/Resources/Data/enemy_rig_models.json')]);log+=(r.stdout||'')+(r.stderr||'');}fs.writeFileSync(path.join(out,'policy.log'),log);process.stdout.write(log);process.exitCode=r.status??1;

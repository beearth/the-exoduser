const cp=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');const data='C:/Program Files/Unity/Hub/Editor/6000.4.8f1/Editor/Data';
const args=[path.join(root,'unity/Tools/devtools/buildloop/assembly-compile-check.cjs'),'--project',path.join(root,'unity'),'--library','G:/exoduser-wt/codex-unity-parity-1102/unity','--output','I:/EXODUSER-Storage/codex-takeover/parry-g2/compile-current','--dotnet',data+'/NetCoreRuntime/dotnet.exe','--csc',data+'/DotNetSdkRoslyn/csc.dll'];
const r=cp.spawnSync('C:/nvm4w/nodejs/node.exe',args,{windowsHide:true,encoding:'utf8',maxBuffer:16000000,timeout:180000});process.stdout.write((r.stdout||'')+(r.stderr||''));if(r.error)console.error(r.error.message);process.exitCode=r.status??1;

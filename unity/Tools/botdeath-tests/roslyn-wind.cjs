// Existing offline Bee templates lack the WindModule used by A2RProps3D.Terrain.
// Add that installed reference without starting Unity or editing the shared templates.
const cp=require('node:child_process');
const editor=process.env.B2R_UNITY_EDITOR||'G:/unity/Editor/6000.6.7f1/Editor/Data';
const run=cp.spawnSync(editor+'/DotNetSdk/dotnet.exe',[
  editor+'/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll',...process.argv.slice(2),
  '-r:'+editor+'/Managed/UnityEngine/UnityEngine.WindModule.dll',
],{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
process.stdout.write(run.stdout||'');process.stderr.write(run.stderr||'');
if(run.error)process.stderr.write(String(run.error));
process.exitCode=run.status??1;

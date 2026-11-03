const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..'),runtime=path.join(root,'Assets/Exoduser/Runtime');
const output=process.argv[2];if(!output||!path.isAbsolute(output))throw Error('absolute output required');fs.mkdirSync(output,{recursive:true});
const read=name=>fs.readFileSync(path.join(runtime,name),'utf8');
let failures=0;function check(ok,name){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failures++;}
const game=read('NativeGame.cs'),registry=game.slice(game.indexOf('bool legacyFixture='),game.indexOf('InitializeEntryFlowCapture(args)'));
for(const flag of ['--unity-death-screen-smoke','--unity-death-ui-smoke'])check(registry.includes('"'+flag+'"'),flag+' bypasses lobby.Begin');
function method(source,name){const start=source.indexOf(name);if(start<0)throw Error('missing '+name);let at=source.indexOf('{',start),depth=1,end=at+1;for(;depth&&end<source.length;end++){if(source[end]==='{')depth++;if(source[end]==='}')depth--;}return source.slice(start,end);}
const silver=read('NativeLobby.SilverHell.cs');
const body=method(silver,'internal static Texture2D Effect(')+'\n'+method(silver,'static void PlateTextures()')+'\n'+method(silver,'static void PlateTint(');
const test=fs.readFileSync(path.join(__dirname,'MaterialProbe.cs'),'utf8').replace('/*PRODUCTION*/',body);
fs.writeFileSync(path.join(output,'Probe.cs'),test);
const data='G:/unity/Editor/6000.6.7f1/Editor/Data',dotnet=data+'/NetCoreRuntime/dotnet.exe',refs=data+'/DotNetSdk/packs/Microsoft.NETCore.App.Ref/8.0.21/ref/net8.0';
fs.writeFileSync(path.join(output,'probe.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.21'}}}));
const rsp=['-nologo','-nostdlib+','-target:exe','-out:"'+output+'/probe.dll"',...fs.readdirSync(refs).filter(x=>x.endsWith('.dll')).map(x=>'-r:"'+refs+'/'+x+'"'),'"'+output+'/Probe.cs"'].join('\n');fs.writeFileSync(output+'/probe.rsp',rsp);
let r=cp.spawnSync(dotnet,[data+'/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll','@'+output+'/probe.rsp'],{windowsHide:true,encoding:'utf8'});
if(r.status===0)r=cp.spawnSync(dotnet,[output+'/probe.dll'],{windowsHide:true,encoding:'utf8'});
console.log((r.stdout||'')+(r.stderr||''));check(r.status===0,'production plate texture: explicit color space and dark display range');
process.exitCode=failures?2:0;

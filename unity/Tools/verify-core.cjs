const fs=require('fs'),path=require('path'),cp=require('child_process');
function arg(name){const i=process.argv.indexOf(name);if(i<0||!process.argv[i+1])throw Error('Pass '+name);return path.resolve(process.argv[i+1]);}
const root=arg('--source-root'),project=arg('--project'),out=arg('--out');fs.mkdirSync(out,{recursive:true});
const oracle=path.join(out,'map-oracle.json');cp.execFileSync(process.execPath,[project+'/Tools/map-oracle.cjs',root,oracle],{windowsHide:true,stdio:'inherit'});
const dotnet=process.platform==='win32'?'C:/Program Files/dotnet/dotnet.exe':'dotnet';
const result=cp.spawnSync(dotnet,['run','--project','CoreTests.csproj','--verbosity','quiet','-p:NuGetAudit=false','-p:ExoduserProject='+project,'--',out+'/core-receipt.json',project+'/Assets/Exoduser/Resources/Data/ch1_map.json',oracle],{cwd:project+'/Tools/Tests',env:{...process.env,DOTNET_CLI_HOME:out+'/dotnet-home',DOTNET_NOLOGO:'1',DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE:'true'},windowsHide:true,timeout:120000,encoding:'utf8'});
fs.writeFileSync(out+'/core.log',(result.stdout||'')+'\n'+(result.stderr||''));console.log(result.stdout||result.stderr);process.exitCode=result.status??1;

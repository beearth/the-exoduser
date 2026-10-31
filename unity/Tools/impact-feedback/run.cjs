const fs=require('fs'),path=require('path'),cp=require('child_process');
const out=path.resolve(process.argv[2]);
if(!/^I:[\\/]/i.test(out))throw Error('검수 산출물은 I:에 지정합니다.');
fs.mkdirSync(out,{recursive:true});
const env={...process.env,DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_CLI_TELEMETRY_OPTOUT:'1'};
if(!env.DOTNET_CLI_HOME)env.DOTNET_CLI_HOME='E:/exoduser-wt/_dotnet-home';
const r=cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',['run','--project',path.join(__dirname,'ImpactFeedbackTests.csproj'),'--configuration','Release','--disable-build-servers','--property:BaseIntermediateOutputPath='+out.replace(/\\/g,'/')+'/obj/','--property:BaseOutputPath='+out.replace(/\\/g,'/')+'/bin/'],{encoding:'utf8',windowsHide:true,env,timeout:120000});
const log=(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.message:'');
fs.writeFileSync(path.join(out,'검사.log'),log);process.stdout.write(log);process.exitCode=r.status??1;

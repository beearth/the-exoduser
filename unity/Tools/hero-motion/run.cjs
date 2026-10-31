// 결과·중간 파일은 I:에만 쓴다. Unity를 시작하거나 공유 예약·세이브를 변경하지 않는다.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const output=path.resolve(process.argv[2]||'I:/EXODUSER-Storage/demo-art/hero/footwork-check');
if(!/^I:[\\/]/i.test(output))throw Error('검수 산출물은 I: 경로를 지정해야 합니다.');
fs.mkdirSync(output,{recursive:true});
const exe=process.env.EXO_DOTNET_EXE||'C:/Program Files/dotnet/dotnet.exe';
const args=['run','--project',path.join(__dirname,'HeroFootworkTests.csproj'),'--configuration','Release','--disable-build-servers',
  '--property:BaseIntermediateOutputPath='+output.replace(/\\/g,'/')+'/obj/',
  '--property:BaseOutputPath='+output.replace(/\\/g,'/')+'/bin/'];
const env={...process.env,DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_CLI_TELEMETRY_OPTOUT:'1'};
if(!env.DOTNET_CLI_HOME)env.DOTNET_CLI_HOME='E:/exoduser-wt/_dotnet-home';
const r=cp.spawnSync(exe,args,{cwd:__dirname,env,windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:4e6});
const log=(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.message:'');
fs.writeFileSync(path.join(output,'검사.log'),log);process.stdout.write(log);process.exitCode=r.status??1;

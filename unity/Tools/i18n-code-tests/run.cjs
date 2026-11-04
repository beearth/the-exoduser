const fs=require('fs'),path=require('path'),cp=require('child_process');
const unity=path.resolve(__dirname,'../..');
const out=process.argv[2]||'I:/EXODUSER-Storage/codex-takeover/i18n-code/checks';
const cache=path.join(out,'loader-cache');
fs.mkdirSync(cache,{recursive:true});fs.mkdirSync(out,{recursive:true});
const files=['Tools/i18n-code-tests/Program.cs','Assets/Exoduser/Runtime/NativeLocaleCatalog.cs','Assets/Exoduser/Runtime/Core/SaveJson.cs','Assets/Exoduser/Runtime/Core/LobbyLanguage.cs'];
const xml=s=>s.replaceAll('&','&amp;');
fs.writeFileSync(cache+'/Checks.csproj','<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit></PropertyGroup><ItemGroup>'+files.map(f=>'<Compile Include="'+xml(path.join(unity,f))+'"/>').join('')+'</ItemGroup></Project>');
fs.writeFileSync(cache+'/NuGet.Config','<configuration><packageSources><clear/></packageSources></configuration>');
const dotnet='dotnet',env={...process.env,DOTNET_CLI_HOME:path.join(out,'dotnet-home'),DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
let r=cp.spawnSync(dotnet,['build',cache+'/Checks.csproj','--verbosity','quiet','--configfile',cache+'/NuGet.Config','-p:UseSharedCompilation=false'],{env,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
fs.writeFileSync(out+'/loader-build.log',(r.stdout||'')+(r.stderr||''));
if(r.status!==0){console.error('로더 검사 컴파일 실패: '+out+'/loader-build.log');process.exit(r.status??1);}
r=cp.spawnSync(dotnet,[cache+'/bin/Debug/net10.0/Checks.dll',unity+'/Assets/Exoduser/Resources',...process.argv.slice(3)],{env,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
fs.writeFileSync(out+'/loader-tests.log',(r.stdout||'')+(r.stderr||''));console.log(r.stdout||r.stderr);process.exit(r.status??1);

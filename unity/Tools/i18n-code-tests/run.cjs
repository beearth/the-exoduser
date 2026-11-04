const fs=require('fs'),path=require('path'),cp=require('child_process');
const unity=path.resolve(__dirname,'../..'),cache=path.join(unity,'Library/I18nCodeChecks/current');
const out=process.argv[2]||'I:/EXODUSER-Storage/codex-takeover/i18n-code/checks';
fs.mkdirSync(cache,{recursive:true});fs.mkdirSync(out,{recursive:true});
const files=['Tools/i18n-code-tests/Program.cs','Assets/Exoduser/Runtime/NativeLocaleCatalog.cs','Assets/Exoduser/Runtime/Core/SaveJson.cs','Assets/Exoduser/Runtime/Core/LobbyLanguage.cs'];
const xml=s=>s.replaceAll('&','&amp;');
fs.writeFileSync(cache+'/Checks.csproj','<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit></PropertyGroup><ItemGroup>'+files.map(f=>'<Compile Include="'+xml(path.join(unity,f))+'"/>').join('')+'</ItemGroup></Project>');
fs.writeFileSync(cache+'/NuGet.Config','<configuration><packageSources><clear/></packageSources></configuration>');
const dotnet='G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk/dotnet.exe',env={...process.env,DOTNET_CLI_HOME:path.join(unity,'Library/I18nCodeChecks/home'),DOTNET_CLI_TELEMETRY_OPTOUT:'1'};
let r=cp.spawnSync(dotnet,['build',cache+'/Checks.csproj','--verbosity','quiet','--configfile',cache+'/NuGet.Config','-p:UseSharedCompilation=false'],{env,encoding:'utf8',windowsHide:true});
fs.writeFileSync(out+'/loader-build.log',(r.stdout||'')+(r.stderr||''));
if(r.status!==0){console.error('로더 검사 컴파일 실패: '+out+'/loader-build.log');process.exit(r.status??1);}
r=cp.spawnSync(dotnet,[cache+'/bin/Debug/net8.0/Checks.dll',unity+'/Assets/Exoduser/Resources'],{env,encoding:'utf8',windowsHide:true});
fs.writeFileSync(out+'/loader-tests.log',(r.stdout||'')+(r.stderr||''));console.log(r.stdout||r.stderr);process.exit(r.status??1);

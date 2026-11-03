const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const unity=path.resolve(__dirname,'../..'),cache=path.join(unity,'Library/ParityTextRunChecks/current');
const output=path.resolve(process.argv[2]||'I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/mac-gate-1320');
const dotnet=process.argv[3]||'G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk/dotnet.exe';
fs.mkdirSync(cache,{recursive:true});fs.mkdirSync(output,{recursive:true});
const xml=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
fs.writeFileSync(cache+'/Checks.csproj','<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit></PropertyGroup><ItemGroup><Compile Include="'+xml(path.join(__dirname,'Tests.cs'))+'"/><Compile Include="'+xml(path.join(unity,'Assets/Exoduser/Runtime/NativeUiTextRun.cs'))+'"/><Compile Include="'+xml(path.join(unity,'Assets/Exoduser/Runtime/NativeUiTextFlow.cs'))+'"/></ItemGroup></Project>');
fs.writeFileSync(cache+'/NuGet.Config','<configuration><packageSources><clear/></packageSources></configuration>');
const env={...process.env,DOTNET_CLI_HOME:path.join(unity,'Library/ParityTextRunChecks/dotnet-home'),DOTNET_CLI_TELEMETRY_OPTOUT:'1'};
let result=cp.spawnSync(dotnet,['build',cache+'/Checks.csproj','--verbosity','quiet','--configfile',cache+'/NuGet.Config','-p:UseSharedCompilation=false'],{env,encoding:'utf8',windowsHide:true});
fs.writeFileSync(output+'/text-run-build.log',(result.stdout||'')+(result.stderr||''));
if(result.status!==0){console.error('text run compile failed; see text-run-build.log');process.exit(result.status??1);}
result=cp.spawnSync(dotnet,[cache+'/bin/Debug/net8.0/Checks.dll',output+'/text-flow-model.json'],{env,encoding:'utf8',windowsHide:true});
fs.writeFileSync(output+'/text-run-tests.log',(result.stdout||'')+(result.stderr||''));
console.log(result.stdout||result.stderr||'No test output');process.exit(result.status??1);

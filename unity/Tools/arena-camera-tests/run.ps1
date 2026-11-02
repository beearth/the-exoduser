param([string]$Output='I:\EXODUSER-Storage\codex-takeover\unity-11-fullrun\arena-camera-tests')
$ErrorActionPreference='Stop';$project=(Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
New-Item -ItemType Directory -Force -Path $Output|Out-Null
$env:DOTNET_CLI_HOME=Join-Path $project 'Library\FullRunDotnetHome';$env:DOTNET_CLI_TELEMETRY_OPTOUT='1';$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE='1';$env:TEMP=Join-Path $Output 'temp';$env:TMP=$env:TEMP
New-Item -ItemType Directory -Force -Path $env:TEMP|Out-Null
$program=@'
using System;using System.IO;using System.Collections.Generic;using System.Text.Json;using Exoduser.UnityPort;
class Program{static int Main(string[] args){var rows=new List<object>();int bad=0;void Check(bool ok,string name){rows.Add(new{name,passed=ok});if(!ok){bad++;Console.WriteLine("FAIL "+name);}}
foreach(float aspect in new[]{16f/9,21f/9,32f/9}){
var f=NativeArenaCameraLayout.Fit(6.75f,aspect,0,15,12,40,0,0);
Check(.96f*1080/(2*f.half)>=55,"distant boss cannot shrink the hero below55px at "+aspect);
float heroY=.5f-f.y/(2*f.half);Check(heroY>=.27f-.001f&&heroY<=.73f+.001f,"distant entry keeps the hero above HUD at "+aspect);
f=NativeArenaCameraLayout.Fit(6.75f,aspect,30,0,70,12,0,0);float heroX=.5f-f.x/(2*f.half*aspect);Check(heroX>=.2f-.001f&&heroX<=.8f+.001f,"horizontal separation keeps the controlled hero visible at "+aspect);
f=NativeArenaCameraLayout.Fit(6.75f,aspect,0,0,5,7,0,0);Check(Math.Abs(f.half-6.75f)<.001f,"nearby small encounter retains the web base zoom at "+aspect);
}
File.WriteAllText(args[0],JsonSerializer.Serialize(new{passed=rows.Count-bad,failures=bad,scope="Actual camera layout helper; numerical framing only, no GPU visual claim",rows},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine("checks="+rows.Count+" failures="+bad);return bad>0?1:0;}}
'@
[IO.File]::WriteAllText((Join-Path $Output 'Program.cs'),$program)
[IO.File]::WriteAllText((Join-Path $Output 'CameraTests.csproj'),'<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit></PropertyGroup><ItemGroup><Compile Include="Program.cs"/><Compile Include="'+$project.Replace('\','/')+'/Assets/Exoduser/Runtime/NativeArenaCameraLayout.cs"/></ItemGroup></Project>')
[IO.File]::WriteAllText((Join-Path $Output 'NuGet.Config'),'<configuration><packageSources><clear/></packageSources></configuration>')
$dotnet='G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\dotnet.exe'
& $dotnet build (Join-Path $Output 'CameraTests.csproj') --verbosity quiet '-p:NuGetAudit=false' 2>&1|Tee-Object (Join-Path $Output 'build.log')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
& $dotnet (Join-Path $Output 'bin\Debug\net8.0\CameraTests.dll') (Join-Path $Output 'result.json') 2>&1|Tee-Object (Join-Path $Output 'test.log')
exit $LASTEXITCODE

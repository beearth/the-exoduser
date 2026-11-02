param([string]$Output='I:\EXODUSER-Storage\codex-takeover\unity-11-fullrun\modal-tests')
$ErrorActionPreference='Stop'
$project=(Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
New-Item -ItemType Directory -Force -Path $Output | Out-Null
$env:DOTNET_CLI_HOME=Join-Path $project 'Library\FullRunDotnetHome'
$env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH='false';$env:DOTNET_GENERATE_ASPNET_CERTIFICATE='false';$env:DOTNET_CLI_TELEMETRY_OPTOUT='1'
$env:TEMP=Join-Path $Output 'temp';$env:TMP=$env:TEMP
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
$source=[IO.File]::ReadAllText((Join-Path $project 'Assets\Exoduser\Runtime\NativeGame.cs'))
$start=$source.IndexOf('            if(!gameFocused){Running=false;return;}',[StringComparison]::Ordinal)
$end=$source.IndexOf('            // Web stat window:',$start,[StringComparison]::Ordinal)
if($start -lt 0 -or $end -le $start){throw 'Actual NativeGame.Update input boundary not found'}
$prefix=@'
using System;using System.IO;using System.Text.Json;
class Program {
class Panel { public bool Active; }
bool gameFocused=true,a15DirectReview,Running=true;Panel nextDifficulty=new Panel();int hotkeys,views;bool backgroundInput;
bool HandleA15DirectKeys()=>false;bool HandlePanelHotkeys(){hotkeys++;return false;}void UpdateViews(){views++;}
void ActualUpdateInputBoundary(){
'@
$suffix=@'
backgroundInput=true;}
static int Main(string[] args){
var modal=new Program();modal.nextDifficulty.Active=true;modal.ActualUpdateInputBoundary();
var normal=new Program();normal.ActualUpdateInputBoundary();
var unfocused=new Program();unfocused.gameFocused=false;unfocused.ActualUpdateInputBoundary();
bool a=!modal.backgroundInput&&modal.hotkeys==0&&modal.views==1;
bool b=normal.backgroundInput&&normal.hotkeys==1;
bool c=!unfocused.backgroundInput&&unfocused.hotkeys==0&&!unfocused.Running;
int failures=(a?0:1)+(b?0:1)+(c?0:1);
File.WriteAllText(args[0],JsonSerializer.Serialize(new{failures,checks=3,modalBlocksBackground=a,normalInputPreserved=b,unfocusedGuardPreserved=c,scope="Actual NativeGame.Update prefix with panel/key polling spies; Player key/GUI verification pending"},new JsonSerializerOptions{WriteIndented=true}));
Console.WriteLine("checks=3 failures="+failures);return failures==0?0:1;}}
'@
[IO.File]::WriteAllText((Join-Path $Output 'Program.cs'),$prefix+"`n"+$source.Substring($start,$end-$start)+"`n"+$suffix)
[IO.File]::WriteAllText((Join-Path $Output 'ModalTests.csproj'),'<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><NuGetAudit>false</NuGetAudit></PropertyGroup></Project>')
[IO.File]::WriteAllText((Join-Path $Output 'NuGet.Config'),'<configuration><packageSources><clear/></packageSources></configuration>')
$dotnet='G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\dotnet.exe'
& $dotnet build (Join-Path $Output 'ModalTests.csproj') --verbosity quiet 2>&1 | Tee-Object -FilePath (Join-Path $Output 'build.log')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
& $dotnet (Join-Path $Output 'bin\Debug\net8.0\ModalTests.dll') (Join-Path $Output 'result.json') 2>&1 | Tee-Object -FilePath (Join-Path $Output 'test.log')
exit $LASTEXITCODE

param([Parameter(Mandatory=$true)][string]$RuntimeDirectory,[Parameter(Mandatory=$true)][string]$ManagedDirectory,[Parameter(Mandatory=$true)][string]$Output,[string]$Sdk='G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk')
$ErrorActionPreference='Stop'
New-Item -ItemType Directory -Path $Output -Force|Out-Null
$refs=Get-ChildItem -LiteralPath ($Sdk+'/packs/Microsoft.NETCore.App.Ref/8.0.21/ref/net8.0') -Filter '*.dll'|ForEach-Object {'-r:"'+$_.FullName+'"'}
$argsList=@('-nologo','-target:exe',('-out:"'+$Output+'/HeaderLayoutTests.dll"'))+$refs+@('"'+$PSScriptRoot+'/HeaderLayoutProgram.cs"')
[IO.File]::WriteAllLines(($Output+'/tests.rsp'),$argsList)
[IO.File]::WriteAllText(($Output+'/HeaderLayoutTests.runtimeconfig.json'),'{"runtimeOptions":{"tfm":"net8.0","framework":{"name":"Microsoft.NETCore.App","version":"8.0.21"}}}')
& ($Sdk+'/dotnet.exe') ($Sdk+'/sdk/8.0.318/Roslyn/bincore/csc.dll') ('@'+$Output+'/tests.rsp')
if($LASTEXITCODE-ne 0){exit $LASTEXITCODE}
& ($Sdk+'/dotnet.exe') ($Output+'/HeaderLayoutTests.dll') $RuntimeDirectory $ManagedDirectory
exit $LASTEXITCODE

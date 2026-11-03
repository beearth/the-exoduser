param(
 [string]$ProjectRoot=(Join-Path $PSScriptRoot '../..'),
 [string]$Output='I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/frontend-tests',
 [string]$Node='C:/nvm4w/nodejs/node.exe',
 [string]$DotNet='G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk/dotnet.exe'
)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
foreach($executable in $Node,$DotNet){if(!(Test-Path -LiteralPath $executable)){throw ('검사 실행 파일 없음: '+$executable)}}
& $Node (Join-Path $PSScriptRoot 'run.cjs') $ProjectRoot $Output $DotNet
if($LASTEXITCODE -ne 0){throw ('프런트엔드 회귀 실패: exit='+$LASTEXITCODE)}

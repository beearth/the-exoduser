param(
 [Parameter(Mandatory=$true)][string]$Exe,
 [Parameter(Mandatory=$true)][string]$Output,
 [string]$Worktree=(Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path,
 [switch]$OverlapOnly
)
$ErrorActionPreference='Stop'
$exo=Join-Path $Worktree 'unity/Tools/devtools/exo-unity.ps1'
$node='C:/nvm4w/nodejs/node.exe'
$runtime=Join-Path (Split-Path $Exe -Parent) 'EXODUSER-Unity_Data/Managed/Exoduser.Runtime.dll'
$runtimeSha=(Get-FileHash -LiteralPath $runtime -Algorithm SHA256).Hash.ToLower()
New-Item -ItemType Directory -Path $Output -Force|Out-Null
if(-not $OverlapOnly){
 & $exo player -Worktree $Worktree -Exe $Exe -Desktop batch -Owner ui-overlap-check -TimeoutSec 300 -Args ('--unity-m1-check,-force-d3d11,-output,'+(Join-Path $Output 'm1'))
 if($LASTEXITCODE-ne 0){throw 'M1 실행 안전 검사 실패'}
 $m1=Get-Content -LiteralPath (Join-Path $Output 'm1/m1-check.json') -Raw -Encoding UTF8|ConvertFrom-Json
 if(@($m1.stages|Where-Object {$_.status-ne 'ok'}).Count-gt 0){throw 'M1 단계 실패'}
}
& $exo player -Worktree $Worktree -Exe $Exe -Owner ui-overlap-check -TimeoutSec 480 -Args ('--unity-ui-overlap-check,-force-d3d11,-output,'+(Join-Path $Output 'overlap'))
if($LASTEXITCODE-ne 0){throw 'UI 겹침 실행 안전 검사 실패'}
& $node (Join-Path $PSScriptRoot 'analyze.cjs') (Join-Path $Output 'overlap')
if($LASTEXITCODE-ne 0){throw 'UI 겹침 또는 화면/언어/해상도 검사 누락'}
$coverage=Get-Content -LiteralPath (Join-Path $Output 'overlap/coverage.json') -Raw -Encoding UTF8|ConvertFrom-Json
if($coverage.runtimeSha256-ne $runtimeSha-or (Get-FileHash -LiteralPath $runtime -Algorithm SHA256).Hash.ToLower()-ne $runtimeSha){throw '실제 검수 Runtime SHA 불일치'}
[ordered]@{passed=$true;runtimeSha256=$runtimeSha;exeSha256=(Get-FileHash -LiteralPath $Exe -Algorithm SHA256).Hash.ToLower();exe=$Exe;output=$Output;verifiedAt=[DateTime]::UtcNow.ToString('o')}|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $Output '검수_바이너리.json') -Encoding UTF8
Write-Output 'M1 옆 전 화면 UI 겹침 필수 검사 통과'

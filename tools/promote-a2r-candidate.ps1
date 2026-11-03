param(
 [Parameter(Mandatory=$true)][string]$SourceSha,
 [Parameter(Mandatory=$true)][string]$SmokeReceipt,
 [Parameter(Mandatory=$true)][switch]$MapLeadPass
)
# Only promote the two fixed lane folders after the map lead reviews the actual screens.
$ErrorActionPreference='Stop'
if(-not $MapLeadPass){throw 'Map lead PASS is required'}
$next='I:\EXODUSER-Storage\map25d\a2r-build-next'
$live='I:\EXODUSER-Storage\map25d\a2r-build'
foreach($path in @($next,$live)){
 if(Test-Path -LiteralPath $path){if((Get-Item -LiteralPath $path).Attributes -band [IO.FileAttributes]::ReparsePoint){throw "Reparse point refused: $path"}}
}
$stamp=Get-Content -LiteralPath (Join-Path $next 'build-commit.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if($stamp.sourceSha -ne $SourceSha){throw 'Candidate source SHA mismatch'}
$play=Get-Content -LiteralPath $SmokeReceipt -Raw -Encoding UTF8 | ConvertFrom-Json
$sight=Get-Content -LiteralPath (Join-Path (Split-Path $SmokeReceipt) 'sight-smoke.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$floor=Get-Content -LiteralPath (Join-Path (Split-Path $SmokeReceipt) 'floor-projection.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if(-not $play.passed -or -not $play.sightVerified -or -not $sight.passed -or $floor.projected -ne 4 -or $floor.standingFloorArt -ne 0){throw 'Current play, real sight and floor evidence must PASS'}
$active=@(Get-CimInstance Win32_Process | Where-Object {$_.ExecutablePath -and $_.ExecutablePath.StartsWith($live+'\',[StringComparison]::OrdinalIgnoreCase)})
if($active.Count -gt 0){throw 'Candidate is being played; do not stop the user program or replace it'}
New-Item -ItemType Directory -Force -Path $live | Out-Null
& robocopy.exe $next $live /E /XJ /R:1 /W:1 /NP /NFL /NDL /LOG:I:\EXODUSER-Storage\map25d\a2redesign\candidate-promotion.log | Out-Null
if($LASTEXITCODE -ge 8){throw "Candidate copy failed: $LASTEXITCODE"}
& (Join-Path $PSScriptRoot 'update-a2r-shortcut.ps1') -BuildDir $live -SmokeReceipt $SmokeReceipt -SourceSha $SourceSha

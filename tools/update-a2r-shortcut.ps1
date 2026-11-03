param([string]$BuildDir='I:\EXODUSER-Storage\map25d\a2r-build',[Parameter(Mandatory=$true)][string]$SmokeReceipt,[string]$SourceSha='working-tree-pending-commit',[switch]$RecordOnly)
# Adapted from update-candidate-shortcut.ps1; keeps every previous candidate build.
$ErrorActionPreference='Stop'
$exe=Join-Path $BuildDir 'EXODUSER-A2R.exe'
if(-not(Test-Path -LiteralPath $exe)){throw "A2R exe missing: $exe"}
$proof=Get-Content -LiteralPath $SmokeReceipt -Raw -Encoding UTF8 | ConvertFrom-Json
if(-not $proof.passed -or $proof.errors -ne 0 -or -not $proof.arrived -or -not $proof.noTeleport){throw 'A2R play-smoke must PASS with errors0 and noTeleport'}
$entry=Get-Content -LiteralPath 'I:\EXODUSER-Storage\map25d\a2r-entry-check\fullrun.json' -Raw -Encoding UTF8 | ConvertFrom-Json
if($entry.frontendFailure -or $entry.frontendBoundaries -notcontains 'lobby-game' -or -not($entry.samples | Where-Object {$_.scene -eq 'field'})){throw 'Same-package ordinary lobby entry proof is required'}
$sandbox='I:\EXODUSER-Storage\map25d\a2r-play-sandbox'
New-Item -ItemType Directory -Force -Path $sandbox | Out-Null
$lnk=Join-Path ([Environment]::GetFolderPath('Desktop')) '지옥의 길 1-1 맵 후보 (Unity).lnk'
$shell=New-Object -ComObject WScript.Shell
$prev='';if(Test-Path -LiteralPath $lnk){$prev=$shell.CreateShortcut($lnk).TargetPath}
if(-not $RecordOnly){
 $s=$shell.CreateShortcut($lnk);$s.TargetPath=$exe
 $s.Arguments="-force-d3d11 --remodel3d --a2r1-light --a2r-play-sandbox `"$sandbox`" --unity-mute -logFile `"$sandbox\Player.log`""
 $s.WorkingDirectory=$BuildDir;$s.IconLocation="$exe,0"
 $s.Description='1-1 A2R 후보: 조명·웹 에셋·나무 투명화, 영웅=리마스터 미적용'
 $s.Save()
}
$actual=$shell.CreateShortcut($lnk)
if($actual.TargetPath -ne $exe -or $actual.Arguments -notlike '*--a2r-play-sandbox*'){throw 'Shortcut readback mismatch'}
$line="{0}`t{1}`tprev={2}`tSHA={3}`t영웅=리마스터 미적용`tRecordOnly={4}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$exe,$prev,$SourceSha,$RecordOnly
Add-Content -LiteralPath 'I:\EXODUSER-Storage\map25d\shortcut-history.log' -Value $line -Encoding UTF8
Write-Output "A2R shortcut verified: $exe; SHA=$SourceSha"

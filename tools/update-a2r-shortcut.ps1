param([string]$BuildDir='I:\EXODUSER-Storage\map25d\a2r-build',[Parameter(Mandatory=$true)][string]$SmokeReceipt,[string]$SourceSha='working-tree-pending-commit',[switch]$RecordOnly)
# Adapted from update-candidate-shortcut.ps1; keeps every previous candidate build.
$ErrorActionPreference='Stop'
$exe=Join-Path $BuildDir 'EXODUSER-A2R.exe'
if(-not(Test-Path -LiteralPath $exe)){throw "A2R exe missing: $exe"}
$proof=Get-Content -LiteralPath $SmokeReceipt -Raw -Encoding UTF8 | ConvertFrom-Json
if(-not $proof.passed -or $proof.errors -ne 0 -or -not $proof.arrived -or -not $proof.noTeleport){throw 'A2R play-smoke must PASS with errors0 and noTeleport'}
if(-not $proof.ordinaryEntryVerified -or $proof.legacyFrontendBypass -or $proof.frontendBoundaries.Count -lt 2){throw 'Ordinary entry and route must both PASS in the current run'}
if(-not $proof.sightVerified){throw 'Actual three-tree sight smoke must PASS; a synthetic GPU probe is insufficient'}
$sight=Get-Content -LiteralPath (Join-Path (Split-Path $SmokeReceipt) 'sight-smoke.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if(-not $sight.passed -or @($sight.shots | Where-Object {$_.on -and ($_.heroSurfaces -le 0 -or $_.gpuPixels -le 0)}).Count -gt 0){throw 'Real occluding tree surfaces and GPU coverage are required'}
if($proof.heroFrame -ne 'rigpixel live Point RT'){throw 'Current smoke must show live rigpixel rendering'}
$assets=Get-Content -LiteralPath (Join-Path (Split-Path $SmokeReceipt) 'web-assets-receipt.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$plants=@($assets.items | Where-Object {$_.added -and $_.kind -eq 'vegetation'})
if($assets.floating -ne 0 -or $plants.Count -ne 113){throw 'Grounding/vegetation receipt mismatch'}
for($i=0;$i -lt $plants.Count;$i++){for($j=0;$j -lt $i;$j++){if($plants[$i].variant -ne $plants[$j].variant){continue};$dx=$plants[$i].worldX-$plants[$j].worldX;$dz=$plants[$i].worldZ-$plants[$j].worldZ;if($dx*$dx+$dz*$dz -lt 10.89){throw 'Adjacent identical vegetation painting remains'}}}
$sandbox='I:\EXODUSER-Storage\map25d\a2r-play-sandbox'
New-Item -ItemType Directory -Force -Path $sandbox | Out-Null
$lnk=Join-Path ([Environment]::GetFolderPath('Desktop')) '지옥의 길 1-1 맵 후보 (Unity).lnk'
$shell=New-Object -ComObject WScript.Shell
$prev='';if(Test-Path -LiteralPath $lnk){$prev=$shell.CreateShortcut($lnk).TargetPath}
if(-not $RecordOnly){
 $s=$shell.CreateShortcut($lnk);$s.TargetPath=$exe
 $s.Arguments="-force-d3d11 --hero-render=rigpixel --remodel3d --a2r1-light --a2r-play-sandbox `"$sandbox`" --unity-mute -logFile `"$sandbox\Player.log`""
 $s.WorkingDirectory=$BuildDir;$s.IconLocation="$exe,0"
 $s.Description='1-1 A2R 후보: 조명·웹 에셋·나무 투명화, 영웅=rigpixel 후보'
 $s.Save()
}
$actual=$shell.CreateShortcut($lnk)
if($actual.TargetPath -ne $exe -or $actual.Arguments -notlike '*--a2r-play-sandbox*' -or $actual.Arguments -notlike '*--hero-render=rigpixel*'){throw 'Shortcut readback mismatch'}
$line="{0}`t{1}`tprev={2}`tSHA={3}`t영웅=rigpixel 후보`tRecordOnly={4}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),$exe,$prev,$SourceSha,$RecordOnly
Add-Content -LiteralPath 'I:\EXODUSER-Storage\map25d\shortcut-history.log' -Value $line -Encoding UTF8
Write-Output "A2R shortcut verified: $exe; SHA=$SourceSha"

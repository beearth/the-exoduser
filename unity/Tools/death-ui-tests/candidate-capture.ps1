param(
 [string]$Worktree='G:/exoduser-wt/codex-unity-death',
 [string]$Exe='I:/EXODUSER-Storage/ui-candidate/build/EXODUSER-Unity.exe',
 [string]$OutputRoot='G:/exoduser/tmp/design-review/20261104_ui_candidate'
)
$ErrorActionPreference='Stop'
$runner='I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1'
if([IO.Path]::GetFullPath($OutputRoot).Replace('\','/') -ne 'G:/exoduser/tmp/design-review/20261104_ui_candidate'){throw 'Unexpected candidate capture root'}
if([IO.Path]::GetFullPath($Exe).Replace('\','/') -ne 'I:/EXODUSER-Storage/ui-candidate/build/EXODUSER-Unity.exe'){throw 'Unexpected candidate executable'}
if(-not(Test-Path -LiteralPath $Exe)){throw 'Build must succeed before capture'}
$rows=New-Object System.Collections.ArrayList
$cases=@(
 @{folder='lobby-zero';screen='lobby';count='0';state='normal'},
 @{folder='lobby-two';screen='lobby';count='2';state='normal'},
 @{folder='character-create';screen='character-create';count='2';state='normal'},
 @{folder='character-name';screen='character-name';count='2';state='normal'},
 @{folder='character-delete';screen='character-delete';count='2';state='normal'},
 @{folder='pause';screen='pause';count='0';state='normal'},
 @{folder='settings';screen='settings';count='0';state='normal'},
 @{folder='entry-hover';screen='lobby';count='2';state='hover'},
 @{folder='death';screen='death';count='2';state='normal'}
)
foreach($width in @(1920,3840)){
 foreach($case in $cases){
  $out=Join-Path (Join-Path $OutputRoot $width) $case['folder']
  New-Item -ItemType Directory -Force -Path $out | Out-Null
  $argsList=@('-mute-audio','-screen-fullscreen','0','-screen-width',"$width",'-screen-height','1080','--unity-boss-direct','0','-output',$out,'-logFile',(Join-Path $out 'player.log'))
  if($case['screen'] -eq 'death'){$argsList+='--unity-death-screen-smoke'}
  else{
   $argsList+=@('--unity-death-ui-smoke','-ui-screen',$case['screen'],'-ui-characters',$case['count'],'-ui-state',$case['state'])
   if($case['folder'] -eq 'entry-hover'){$argsList+=@('-ui-entry-state','hover')}
  }
  & $runner player -Worktree $Worktree -Exe $Exe -PcException candidate -Owner 'death-ui-candidate' -JobArgs $argsList -TimeoutSec 150 -Json *> (Join-Path $out 'runner.log')
  $code=$LASTEXITCODE
  if($code -ne 0){Get-Content -LiteralPath (Join-Path $out 'runner.log') -Tail 12;throw "Candidate capture stopped: $width/$($case['folder']), exit=$code; no unchanged rerun"}
  $receipt=if($case['screen'] -eq 'death'){'death-screen-capture.json'}else{"death-ui-$($case['screen'])_$($case['state'])_$($case['count'])chars.json"}
  $record=Get-Content -LiteralPath (Join-Path $out $receipt) -Encoding UTF8 -Raw | ConvertFrom-Json
  if(-not $record.passed){throw "Product receipt failed: $width/$($case['folder'])"}
  [void]$rows.Add([ordered]@{width=$width;screen=$case['folder'];passed=$true;receipt=(Join-Path $out $receipt)})
  Write-Output "CAPTURE PASS $width/$($case['folder'])"
 }
}
$summary=[ordered]@{passed=$true;scope='controlled actual Player captures, not natural input/play or design approval';rows=@($rows)}
[IO.File]::WriteAllText((Join-Path $OutputRoot 'capture-current.json'),($summary | ConvertTo-Json -Depth 8),(New-Object Text.UTF8Encoding($false)))

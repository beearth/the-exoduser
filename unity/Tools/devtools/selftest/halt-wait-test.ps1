$ErrorActionPreference='Stop'
# 11-04: a vfx-summon Player queued before HALT was created started at 13:23 anyway, because HALT was only checked when the
# command began. Every wait loop must stop when HALT appears, and `build` must be gated like run/start/player. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$Root=Join-Path 'I:/EXODUSER-Storage/devtools/fix-1104-haltwait' ('fixture-'+[guid]::NewGuid().ToString('N'))
$QueueRoot=Join-Path $Root 'queue';$LockPath=Join-Path $Root '_pc_lock.json';$HaltPath=Join-Path $Root 'HALT';$ExclusivePath=Join-Path $Root '_player_exclusive.json'
$Utf8NoBom=New-Object Text.UTF8Encoding($false);$MaxPlayerSlots=2;$ExoUnityVersion='selftest'
$Owner='vfx-summon';$Kind='player';$Worktree='fixture';$TtlMin=120;$Note='test';$WaitMin=5;$PollSec=0;$KeepReservation=$false;$Exclusive=$false;$PcException='candidate'
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Say($m){}
function Get-CommitFreeGB {return 30}
$script:sleeps=0
function Start-Sleep { param($Seconds,$Milliseconds) $script:sleeps++; if($script:sleeps -eq 2){ [IO.File]::WriteAllText($HaltPath,'{"cause":"selftest"}') } }
try {
 New-Item -ItemType Directory -Path $Root -Force|Out-Null
 # both slots busy -> the Player waits; HALT appears during the wait -> it must stop, not start later
 foreach($i in 1,2){Write-JsonAtomic (Join-Path $Root ('_player_slot_'+$i+'.json')) ([ordered]@{owner='devtools-player';pid=$PID;exe='other.exe';startedAt=(NowIso);token=('t'+$i);reservedAs=('lane'+$i)})}
 $r=$null;try{Acquire-PlayerSlot 'summon.exe' $PID;$r='admitted'}catch{$r=$_.Exception.Message}
 Check ($r -like 'HALT:*') ('Player admitted or wrong stop after HALT appeared: '+$r)
 Check (-not $script:PlayerSlotPath) 'slot written after HALT'
 # Editor lock wait stops the same way
 Remove-Item -LiteralPath $HaltPath -Force;$script:sleeps=0
 Write-JsonAtomic $LockPath ([ordered]@{owner='devtools-runner';pid=$PID;worktree='other';startedAt=(NowIso);token='x'})
 $r=$null;try{Acquire-Slot 'devtools-runner' 'fixture' $PID (Join-Path $Root 'q');$r='locked'}catch{$r=$_.Exception.Message}
 Check ($r -like 'HALT:*') ('Editor lock wait did not stop on HALT: '+$r)
 # build is gated at entry like run/start/player (checked on the source; calling the gate would exit this test)
 $text=(Get-Command Test-HaltGate).Definition
 Check ($text -match "'build'") 'build missing from the HALT gate'
 'PASS: '+$n+' HALT-while-waiting decisions; Unity launches=0'
} finally {
 Release-PlayerAdmission
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-haltwait\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

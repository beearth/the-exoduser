$ErrorActionPreference='Stop'
# 11-04: several QA Players decoding 4K lobby movies at once made BuildLoop's M1 and UI overlap checks time out.
# A buildloop/-Exclusive Player waits until no other Player runs, then holds the only slot; others wait. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$Root=Join-Path 'I:/EXODUSER-Storage/devtools/fix-1104-exclusive' ('fixture-'+[guid]::NewGuid().ToString('N'))
$QueueRoot=Join-Path $Root 'queue';$LockPath=Join-Path $Root '_pc_lock.json';$HaltPath=Join-Path $Root 'HALT'
$ExclusivePath=Join-Path $Root '_player_exclusive.json'
$Utf8NoBom=New-Object Text.UTF8Encoding($false);$MaxPlayerSlots=2;$ExoUnityVersion='selftest'
$Owner='buildloop';$Kind='player';$Worktree='fixture';$TtlMin=120;$Note='test';$WaitMin=-1;$PollSec=0;$KeepReservation=$false
$Exclusive=$false;$PcException='buildloop'
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Say($m){}
function Get-CommitFreeGB {return 30}
function Try-Acquire { try { Acquire-PlayerSlot 'fake.exe' $PID; Release-PlayerAdmission; return 'ok' } catch { return $_.Exception.Message } }
function Reset-Me { $script:PlayerSlotPath=$null; $script:PlayerSlotToken=$null; Release-PlayerAdmission }
try {
 New-Item -ItemType Directory -Path $Root -Force|Out-Null
 # another lane's Player is running: the loop must wait, not cut it
 $other=Join-Path $Root '_player_slot_1.json'
 Write-JsonAtomic $other ([ordered]@{owner='devtools-player';pid=$PID;exe='other.exe';startedAt=(NowIso);token='other';reservedAs='fullrun-measure'})
 $r=Try-Acquire
 Check ($r -like '*단독 실행 대기*') ('loop entered beside a running Player: '+$r)
 Check (Test-Path $other) 'running Player slot was touched'
 Remove-Item -LiteralPath $other -Force; Reset-Me
 # nobody else: the loop takes the only slot and marks exclusivity
 Check ((Try-Acquire) -eq 'ok') 'exclusive acquire failed on an empty machine'
 $mine=$script:PlayerSlotPath;$mineToken=$script:PlayerSlotToken
 $x=Read-Json $ExclusivePath
 Check ($x -and $x.token -eq $mineToken -and $x.reservedAs -eq 'buildloop') 'exclusive marker not written'
 # a normal lane Player now waits even though a second slot is free
 $script:PlayerSlotPath=$null;$script:PlayerSlotToken=$null;$PcException='candidate';$Owner='ui-candidate'
 $r=Try-Acquire
 Check ($r -like '*단독 실행 중*') ('normal Player admitted during exclusive run: '+$r)
 # new Editor work also waits while the exclusive check runs (server start/batch via Acquire-Slot, server submit via Wait-ExclusivePlayer)
 $edit=$null;try{Wait-ExclusivePlayer 'Editor';$edit='ran'}catch{$edit=$_.Exception.Message}
 Check ($edit -like '*단독 검사 대기*') ('Editor job not held during exclusive check: '+$edit)
 $slot=$null;try{Acquire-Slot 'devtools-runner' 'fixture' $PID (Join-Path $Root 'q');$slot='locked'}catch{$slot=$_.Exception.Message}
 Check ($slot -like '*BuildLoop 단독 검사*') ('Editor lock taken during exclusive check: '+$slot)
 Check (-not (Test-Path $LockPath)) 'Editor lock file written during exclusive check'
 # the loop finishes: marker and slot go, normal Players flow again with two slots
 $script:PlayerSlotPath=$mine;$script:PlayerSlotToken=$mineToken;Release-PlayerSlot
 Check (-not (Test-Path $ExclusivePath)) 'exclusive marker left after release'
 Reset-Me
 Check ((Try-Acquire) -eq 'ok') 'normal Player blocked after exclusive release'
 Check (-not (Test-Path $ExclusivePath)) 'normal Player wrote an exclusive marker'
 Reset-Me
 Check ((Try-Acquire) -eq 'ok') 'second concurrent normal slot no longer available'
 'PASS: '+$n+' exclusive Player decisions; Unity launches=0'
} finally {
 Release-PlayerAdmission
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-exclusive\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

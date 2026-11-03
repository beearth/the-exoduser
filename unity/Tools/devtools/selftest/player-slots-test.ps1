$ErrorActionPreference='Stop'
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$Root=Join-Path 'I:/EXODUSER-Storage/devtools/fix-1103-slots' ('fixture-'+[guid]::NewGuid().ToString('N'))
$QueueRoot=Join-Path $Root 'queue';$LockPath=Join-Path $Root '_pc_lock.json'
$HaltPath=Join-Path $Root 'HALT'
$Utf8NoBom=New-Object Text.UTF8Encoding($false);$MaxPlayerSlots=2;$ExoUnityVersion='2026.11.03-slots1'
$Owner='a';$Kind='player';$Worktree='fixture';$TtlMin=120;$Note='test';$WaitMin=-1;$PollSec=0;$KeepReservation=$false
$script:checks=0
function Check($condition,$why){if(-not $condition){throw ('FAIL: '+$why)};$script:checks++}
function Say($m){}
function Get-CommitFreeGB {return 30}
function Get-UnityProcs {return @([pscustomobject]@{Id=123;ProcessName='EXODUSER-Unity'})}
try {
 Check ([bool](Get-Command Acquire-PlayerSlot -ErrorAction SilentlyContinue)) 'Player still shares Editor slot; independent acquisition missing'
 New-Item -ItemType Directory -Path $Root -Force|Out-Null
 Cmd-Reserve|Out-Null
 Check (@(Get-Reservations 'editor').Count -eq 0) 'player reservation blocks editor'
 Check (@(Get-Reservations 'player').Count -eq 1) 'player reservation missing'
 $Kind='editor';Cmd-Reserve|Out-Null
 Check (@(Get-Reservations 'editor').Count -eq 1) 'same owner cannot reserve each kind'
 $Kind='player';Cmd-Unreserve|Out-Null
 Check (@(Get-Reservations 'editor').Count -eq 1) 'unreserve player removed editor'
 $legacyRes=Join-Path $QueueRoot '000-old.json'
 Write-JsonAtomic $legacyRes @{owner='legacy';createdAt=(NowIso);expiresAt=[datetime]::UtcNow.AddHours(1).ToString('o')}
 Check (@(Get-Reservations 'editor').Count -eq 2) 'missing kind must be editor'
 Check (@(Get-Reservations 'player').Count -eq 0) 'legacy reservation entered player FIFO'
 Acquire-PlayerSlot 'fake.exe' $PID
 Check ($null -ne $script:PlayerAdmissionHandle) 'admission must stay serialized until process creation'
 $mutexBlocked=$false
 try{$probe=[IO.File]::Open((Join-Path $Root '_player_admission.guard'),'OpenOrCreate','ReadWrite','None');$probe.Dispose()}catch [IO.IOException]{$mutexBlocked=$true}
 Check $mutexBlocked 'OS admission lock does not exclude another writer'
 $WatchNames=@('EXODUSER-selftest-none')
 $guard=Invoke-Guarded "$env:SystemRoot/System32/cmd.exe" @('/c','exit','0') $Root 5 0 @() $false
 Check ($null -eq $script:PlayerAdmissionHandle) 'process creation did not release admission lock'
 $held=Read-Json $script:PlayerSlotPath
 Check ($held.runnerVersion -eq $ExoUnityVersion -and $held.token -and $held.exe -eq 'fake.exe') 'slot schema/version'
 Check (@(Get-PlayerSlots).Count -eq 1) 'first slot not counted'
 $first=$script:PlayerSlotPath;$firstToken=$script:PlayerSlotToken
 Acquire-PlayerSlot 'fake.exe' $PID
 Release-PlayerAdmission
 Check (@(Get-PlayerSlots).Count -eq 2) 'second slot not admitted alongside first'
 $second=$script:PlayerSlotPath;$secondToken=$script:PlayerSlotToken
 $blocked=$false;try{Acquire-PlayerSlot 'fake.exe' $PID}catch{$blocked=$_.Exception.Message -like '*Player*대기 시간 초과*'}
 Check $blocked 'third player not blocked / timeout contract'
 $script:PlayerSlotPath=$second;$script:PlayerSlotToken='foreign';Release-PlayerSlot
 Check (Test-Path $second) 'foreign token released'
 $script:PlayerSlotToken=$secondToken;Release-PlayerSlot
 Check (-not(Test-Path $second)) 'own slot not released'
 $script:PlayerSlotPath=$first;$script:PlayerSlotToken=$firstToken;Release-PlayerSlot
 Write-JsonAtomic $first @{owner='test';pid=2147483646;startedAt=(NowIso);token='dead'}
 Check (@(Get-PlayerSlots -Reap).Count -eq 0 -and -not(Test-Path $first)) 'dead pid not reclaimed'
 Write-JsonAtomic $first @{owner='test';pid=$PID;startedAt='2000-01-01T00:00:00Z';token='reused'}
 Check (@(Get-PlayerSlots -Reap).Count -eq 0 -and -not(Test-Path $first)) 'reused pid not reclaimed'
 $stale=[pscustomobject]@{owner='test';pid=2147483646;startedAt=(NowIso);token='stale'}
 Write-JsonAtomic $first @{owner='test';pid=$PID;startedAt=(NowIso);token='new-owner'}
 Remove-StalePlayerSlot $first $stale
 Check (Test-Path $first) 'stale snapshot removed a newly acquired slot'
 Remove-Item -LiteralPath $first
 Write-JsonAtomic $LockPath @{owner='devtools-player';pid=$PID;startedAt=(NowIso)}
 Check ((Get-LegacyPlayerCount) -eq 1) 'old player lock not counted'
 Write-JsonAtomic $LockPath @{owner='devtools-player';pid=2147483646;startedAt=(NowIso)}
 Check ((Get-LegacyPlayerCount) -eq 0) 'dead old player counted because a new Player is alive'
 Write-JsonAtomic $LockPath @{owner='devtools-player';pid=$PID;startedAt='2000-01-01T00:00:00Z'}
 Check ((Get-LegacyPlayerCount) -eq 0) 'reused old player pid counted'
 Write-JsonAtomic $LockPath @{owner='devtools-player';pid=$PID;startedAt=(NowIso)}
 Acquire-PlayerSlot 'fake.exe' $PID
 Release-PlayerAdmission
 $blocked=$false;try{Acquire-PlayerSlot 'fake.exe' $PID}catch{$blocked=$true}
 Check $blocked 'legacy + new permits third player'
 Release-PlayerSlot
 Remove-Item -LiteralPath $LockPath
 $old=Read-Json $legacyRes;$old.createdAt=[datetime]::UtcNow.AddMinutes(-21).ToString('o');Write-JsonAtomic $legacyRes $old
 Check ((Get-PlayerDrainReason) -match 'legacy') 'starvation drain absent'
 $blocked=$false;try{Acquire-PlayerSlot 'fake.exe' $PID}catch{$blocked=$_.Exception.Message -match '굶주림'}
 Check $blocked 'starvation gate did not stop admission'
 $Owner='legacy';Check (-not(Get-PlayerDrainReason)) 'own editor reservation drains own player';$Owner='a'
 Get-ChildItem -LiteralPath $Root -Filter '_player_slot_*.json'|Remove-Item
 $key=[string]$old.owner+'|'+[string]$old.createdAt
 Write-JsonAtomic (Join-Path $Root '_player_drain.json') @{key=$key;zeroAt='';idleUntil=''}
 Check ((Get-PlayerDrainReason) -match '빈 Editor 창') 'zero players did not open the editor window'
 Write-JsonAtomic (Join-Path $Root '_player_drain.json') @{key=$key;zeroAt=[datetime]::UtcNow.AddSeconds(-121).ToString('o');idleUntil=''}
 Check (-not(Get-PlayerDrainReason)) 'idle front reservation still drains after the 120s window'
 Check ([bool](Read-Json (Join-Path $Root '_player_drain.json')).idleUntil) 'idle cooldown not recorded'
 Check (-not(Get-PlayerDrainReason)) 'drain returned during the 30-min idle cooldown'
 Write-JsonAtomic $LockPath @{owner='devtools-server';pid=$PID;startedAt=(NowIso)}
 Check (-not(Get-PlayerDrainReason)) 'drain triggered while editor lock occupied'
 Acquire-PlayerSlot 'fake.exe' $PID
 Release-PlayerAdmission
 Check (@(Get-PlayerSlots).Count -eq 1) 'new player cannot overlap editor'
 Release-PlayerSlot
 Remove-Item -LiteralPath $LockPath
 $old.createdAt=NowIso;Write-JsonAtomic $legacyRes $old
 function Get-CommitFreeGB {return 9}
 $blocked=$false;try{Acquire-PlayerSlot 'fake.exe' $PID}catch{$blocked=$_.Exception.Message -match '10GB'}
 Check $blocked 'player minimum 10GB lost'
 function Get-CommitFreeGB {return 30}
 # slots3: 예약만 걸어 둔 앞 예약·죽은/재사용 대기 pid는 순서를 막지 않는다.
 $Owner='pre';$Kind='player';Cmd-Reserve|Out-Null
 $Owner='deadw';Cmd-Reserve|Out-Null
 $dw=@(Get-Reservations 'player'|Where-Object owner -eq 'deadw')[0]
 Write-JsonAtomic $dw.file @{owner='deadw';kind='player';createdAt=$dw.createdAt;expiresAt=$dw.expiresAt;waitPid=2147483646;waitSince=(NowIso)}
 $Owner='reusedw';Cmd-Reserve|Out-Null
 $rw=@(Get-Reservations 'player'|Where-Object owner -eq 'reusedw')[0]
 Write-JsonAtomic $rw.file @{owner='reusedw';kind='player';createdAt=$rw.createdAt;expiresAt=$rw.expiresAt;waitPid=$PID;waitSince='2000-01-01T00:00:00Z'}
 Check ((Get-ReservationWaiterState (@(Get-Reservations 'player'|Where-Object owner -eq 'pre')[0])) -eq 'reserved') 'pre-reservation not classified reserved-only'
 Check ((Get-ReservationWaiterState (@(Get-Reservations 'player'|Where-Object owner -eq 'deadw')[0])) -eq 'dead') 'dead waiter pid not detected'
 Check ((Get-ReservationWaiterState (@(Get-Reservations 'player'|Where-Object owner -eq 'reusedw')[0])) -eq 'dead') 'reused waiter pid not detected'
 $Owner='late';Cmd-Reserve|Out-Null
 Acquire-PlayerSlot 'fake.exe' $PID
 Release-PlayerAdmission
 Check (@(Get-PlayerSlots).Count -eq 1) 'pre-reserved/dead front reservations still block a live waiter'
 $lateRes=@(Get-Reservations 'player'|Where-Object owner -eq 'late')[0]
 Check ([int]$lateRes.waitPid -eq $PID -and $lateRes.waitSince) 'waiter pid not recorded on own reservation'
 Cmd-Reserve|Out-Null
 Check ([int](@(Get-Reservations 'player'|Where-Object owner -eq 'late')[0]).waitPid -eq $PID) 'renewal erased waiter pid'
 $q=(Cmd-Queue) -join "`n"
 Check ($q -match 'pre - .*예약만' -and $q -match 'deadw - .*종료 - 건너뜀' -and $q -match 'late - .*실행 중') 'status waiter labels missing'
 Release-PlayerSlot;Cmd-Unreserve|Out-Null
 foreach($o in 'pre','deadw','reusedw'){$Owner=$o;Cmd-Unreserve|Out-Null}
 $Owner='b';$Kind='player';Cmd-Reserve|Out-Null;$Owner='c';Cmd-Reserve|Out-Null
 $Owner='b';Set-ReservationWaiter $PID;$Owner='c'
 $q=(Cmd-Queue) -join "`n"
 Check ($q -match 'b - .*대기 중\(pid '+$PID+' 살아 있음\)') 'status live waiter label missing'
 $blocked=$false;try{Acquire-PlayerSlot 'fake.exe' $PID}catch{$blocked=$_.Exception.Message -match '맨 앞은 b'}
 Check $blocked 'player FIFO bypassed'
 $Owner='b';Acquire-PlayerSlot 'fake.exe' $PID
 Release-PlayerAdmission
 $bp=$script:PlayerSlotPath;$bt=$script:PlayerSlotToken
 $Owner='c';Acquire-PlayerSlot 'fake.exe' $PID
 Release-PlayerAdmission
 Check (@(Get-PlayerSlots).Count -eq 2) 'active front reservation blocks second player'
 Release-PlayerSlot;$script:PlayerSlotPath=$bp;$script:PlayerSlotToken=$bt;Release-PlayerSlot
 $Owner='a';$Kind='editor';Cmd-Unreserve|Out-Null;Remove-Item -LiteralPath $legacyRes
 Acquire-Slot 'devtools-runner' $Root $PID ''
 Check (Test-Path $LockPath) 'editor is blocked by user player process'
 Release-Lock $PID
 # Exercise real Cmd-Player reservation cleanup without ever creating a Unity process.
 $ExecDir=Join-Path $Root '_exec';$Exe=Join-Path $Root 'fake.exe';[IO.File]::WriteAllText($Exe,'never executed')
 $JobArgs=@();$ArgsJson='';$Desktop='batch';$DryRun=$false
 function Acquire-PlayerSlot {throw 'fixture admission failure'}
 $Owner='cleanup';$Kind='editor';Cmd-Reserve|Out-Null
 $blocked=$false;try{Cmd-Player}catch{$blocked=$_.Exception.Message -eq 'fixture admission failure'}
 Check $blocked 'Cmd-Player did not reach admission boundary'
 Check (@(Get-Reservations 'player'|Where-Object owner -eq 'cleanup').Count -eq 0) 'failed player leaked auto reservation'
 Check (@(Get-Reservations 'editor'|Where-Object owner -eq 'cleanup').Count -eq 1) 'player cleanup removed editor reservation'
 $KeepReservation=$true;try{Cmd-Player}catch{}
 Check (@(Get-Reservations 'player'|Where-Object owner -eq 'cleanup').Count -eq 1) 'KeepReservation lost'
 'PASS: '+$script:checks+' player/editor slot decisions; Unity launches=0'
} finally {
 if(Get-Command Release-PlayerAdmission -ErrorAction SilentlyContinue){Release-PlayerAdmission}
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1103-slots\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

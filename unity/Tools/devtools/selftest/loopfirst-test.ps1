$ErrorActionPreference='Stop'
# 11-04 CTO priority 1 (desktop swap): run 8ad7fa322's UI check Player waited behind 7 FIFO player reservations for 40 minutes
# and the swap failed. A buildloop Player skips the player reservation queue and the drain, waits at least 180 minutes, and
# while it waits other new Players stay out. Exclusive/slot rules still hold. Uses a harmless ping as the other waiter. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$Root=Join-Path 'I:/EXODUSER-Storage/devtools/fix-1104-loopfirst' ('fixture-'+[guid]::NewGuid().ToString('N'))
$QueueRoot=Join-Path $Root 'queue';$LockPath=Join-Path $Root '_pc_lock.json';$HaltPath=Join-Path $Root 'HALT'
$ExclusivePath=Join-Path $Root '_player_exclusive.json'
$Utf8NoBom=New-Object Text.UTF8Encoding($false);$MaxPlayerSlots=2;$ExoUnityVersion='selftest'
$Owner='buildloop';$Kind='player';$Worktree='fixture';$TtlMin=120;$Note='test';$WaitMin=-1;$PollSec=0;$KeepReservation=$false
$Exclusive=$false;$PcException='buildloop'
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Say($m){}
function Get-CommitFreeGB {return 30}
function Try-Acquire { try { Acquire-PlayerSlot 'fake.exe' $PID; Release-PlayerAdmission; return 'ok' } catch { return $_.Exception.Message } }
function Reset-Me { if($script:PlayerSlotPath){Remove-Item -LiteralPath $script:PlayerSlotPath -Force -ErrorAction SilentlyContinue}; Remove-Item -LiteralPath $ExclusivePath -Force -ErrorAction SilentlyContinue; $script:PlayerSlotPath=$null; $script:PlayerSlotToken=$null; Release-PlayerAdmission }
function Add-WaitingReservation($owner,$waitPid){
 New-Item -ItemType Directory -Force -Path $QueueRoot|Out-Null
 $p=Join-Path $QueueRoot ('20000101T000000000_'+$owner+'_player_'+[guid]::NewGuid().ToString('N')+'.json')
 Write-JsonAtomic $p ([ordered]@{owner=$owner;kind='player';worktree='x';note='t';createdAt='2000-01-01T00:00:00Z';expiresAt=([DateTime]::UtcNow.AddHours(2).ToString('o'));waitPid=$waitPid;waitSince=(NowIso)})
 return $p
}
$ping=$null
try {
 New-Item -ItemType Directory -Path $Root -Force|Out-Null
 $ping=Start-Process "$env:SystemRoot\System32\PING.EXE" -ArgumentList '-n','120','127.0.0.1' -WindowStyle Hidden -PassThru
 # another lane is first in the player reservation queue and really waiting: a normal Player waits, the loop goes first
 $res=Add-WaitingReservation 'fullrun-measure' $ping.Id
 $PcException='candidate';$Owner='ui-candidate'
 $r=Try-Acquire
 Check ($r -like '*player 예약 큐 맨 앞*') ('normal Player skipped the reservation queue: '+$r)
 Reset-Me
 $PcException='buildloop';$Owner='buildloop'
 Check ((Try-Acquire) -eq 'ok') 'buildloop Player did not go before the reservation queue'
 Check (-not (Test-Path (Get-PriorityPath))) 'priority marker left after admission'
 Reset-Me; Remove-Item -LiteralPath $res -Force
 # the loop still never cuts a running Player (exclusive rule)
 $other=Join-Path $Root '_player_slot_1.json'
 Write-JsonAtomic $other ([ordered]@{owner='devtools-player';pid=$PID;exe='other.exe';startedAt=(NowIso);token='other';reservedAs='fullrun-measure'})
 $r=Try-Acquire
 Check ($r -like '*단독 실행 대기*') ('loop entered beside a running Player: '+$r)
 Check (-not (Test-Path (Get-PriorityPath))) 'priority marker left after a timed-out wait'
 Remove-Item -LiteralPath $other -Force; Reset-Me
 # while a live loop waiter holds the marker, other new Players stay out even with free slots
 Write-JsonAtomic (Get-PriorityPath) ([ordered]@{pid=$ping.Id;processStart=$ping.StartTime.ToUniversalTime().ToString('o');owner='buildloop';since=(NowIso)})
 $PcException='candidate';$Owner='ui-candidate'
 $r=Try-Acquire
 Check ($r -like '*BuildLoop Player 우선 대기*') ('normal Player entered while the loop waits: '+$r)
 Check (Test-Path (Get-PriorityPath)) 'someone else removed the loop marker'
 # a marker whose process start does not match (pid reused) or whose pid is gone does not block
 Write-JsonAtomic (Get-PriorityPath) ([ordered]@{pid=$ping.Id;processStart='2000-01-01T00:00:00.0000000Z';owner='buildloop';since=(NowIso)})
 Check ((Try-Acquire) -eq 'ok') 'reused pid marker blocked a normal Player'
 Reset-Me
 $ping.Kill();$ping.WaitForExit()
 Write-JsonAtomic (Get-PriorityPath) ([ordered]@{pid=$ping.Id;processStart='';owner='buildloop';since=(NowIso)})
 Check ((Try-Acquire) -eq 'ok') 'dead loop waiter blocked a normal Player'
 Reset-Me
 # the 180-minute floor applies only to buildloop and only to positive waits; Clear only removes its own marker
 $PcException='buildloop'
 Check (Test-LoopFirst) 'buildloop not recognised'
 $PcException='cto-swap'
 Check (-not (Test-LoopFirst)) 'cto-swap treated as loop'
 Clear-PriorityWaiter $PID
 Check (Test-Path (Get-PriorityPath)) 'Clear removed another process marker'
 'PASS: '+$n+' loop-first decisions; Unity launches=0'
} finally {
 if($ping -and -not $ping.HasExited){$ping.Kill()}
 Release-PlayerAdmission
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-loopfirst\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

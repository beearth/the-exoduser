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
 # editor reservations: a live BuildLoop run moves its editor reservation to the front; a dead loop does not
 New-Item -ItemType Directory -Force -Path $QueueRoot|Out-Null
 function Add-EditorReservation($owner,$stamp){ $p=Join-Path $QueueRoot ($stamp+'_'+$owner+'_editor_'+[guid]::NewGuid().ToString('N')+'.json'); Write-JsonAtomic $p ([ordered]@{owner=$owner;kind='editor';worktree='x';note='t';createdAt=([DateTime]::UtcNow.AddMinutes(-1).ToString('o'));expiresAt=([DateTime]::UtcNow.AddHours(2).ToString('o'))}); return $p }
 $e1=Add-EditorReservation 'codex-map-fieldbuild' '20000101T000000001'; $e2=Add-EditorReservation 'buildloop' '20000101T000000002'
 function Test-BuildLoopRunning { return $true }
 Check ((@(Get-Reservations 'editor'))[0].owner -eq 'buildloop') 'live loop editor reservation not first'
 Check ((@(Get-Reservations 'editor')).Count -eq 2) 'reordering lost a reservation'
 Check ((@(Get-Reservations 'player')).Count -eq 0 -or (@(Get-Reservations 'player'))[0].owner -ne 'buildloop') 'player reservations reordered'
 $Owner='someone'; Check ((Get-PlayerDrainReason) -like '*buildloop*') 'loop editor reservation does not drain new Players at once'
 function Test-BuildLoopRunning { return $false }
 Check ((@(Get-Reservations 'editor'))[0].owner -eq 'codex-map-fieldbuild') 'dead loop reservation jumped the queue'
 Check (-not (Get-PlayerDrainReason)) 'young non-loop editor reservation drained Players'
 Remove-Item -LiteralPath $e1,$e2 -Force; Remove-Item -LiteralPath (Join-Path $Root '_player_drain.json') -Force -ErrorAction SilentlyContinue
 # grant: the CTO-chosen owner goes right after BuildLoop for N Players, then the normal queue again
 $ping2=Start-Process "$env:SystemRoot\System32\PING.EXE" -ArgumentList '-n','120','127.0.0.1' -WindowStyle Hidden -PassThru
 $res2=Add-WaitingReservation 'fullrun-measure' $ping2.Id
 $Owner='char-reshoot';$GrantCount=1;$TtlMin=60;$Note='t';$PcException='candidate'; Cmd-Grant
 Check ($null -ne (Get-PriorityGrant 'char-reshoot')) 'grant not recorded'
 Check ((Try-Acquire) -eq 'ok') 'granted owner did not skip the reservation queue'
 Check ([int](Get-PriorityGrant 'char-reshoot' | Measure-Object).Count -eq 0) 'grant not spent after admission'
 Check (-not (Test-Path (Get-GrantWaitPath 'char-reshoot'))) 'grant wait marker left after admission'
 Reset-Me
 $r=Try-Acquire
 Check ($r -like '*player 예약 큐 맨 앞*') ('spent grant still skipped the queue: '+$r)
 Reset-Me; Remove-Item -LiteralPath $res2 -Force
 # a live grant waiter keeps other new Players out; a BuildLoop waiter still goes before the grant
 $Owner='char-reshoot';$GrantCount=2; Cmd-Grant
 Write-JsonAtomic (Get-GrantWaitPath 'char-reshoot') ([ordered]@{pid=$ping2.Id;processStart=$ping2.StartTime.ToUniversalTime().ToString('o');owner='char-reshoot';since=(NowIso)})
 $Owner='map-lane'
 $r=Try-Acquire
 Check ($r -like '*Player 우선 순번 대기*') ('normal Player entered while a grant waits: '+$r)
 Reset-Me
 Write-JsonAtomic (Get-PriorityPath) ([ordered]@{pid=$ping2.Id;processStart=$ping2.StartTime.ToUniversalTime().ToString('o');owner='buildloop';since=(NowIso)})
 $Owner='char-reshoot'
 $r=Try-Acquire
 Check ($r -like '*BuildLoop Player 우선 대기*') ('grant went before the BuildLoop waiter: '+$r)
 Reset-Me; Remove-Item -LiteralPath (Get-PriorityPath),(Get-GrantWaitPath 'char-reshoot') -Force -ErrorAction SilentlyContinue
 $ping2.Kill();$ping2.WaitForExit()
 # editor grant: BuildLoop, then the granted editor owner, then the rest; a player grant does not reorder editors
 $e1=Add-EditorReservation 'codex-map-fieldbuild' '20000101T000000001'; $e2=Add-EditorReservation 'vfx-druid' '20000101T000000003'; $e3=Add-EditorReservation 'buildloop' '20000101T000000004'
 $script:GrantKindArg=$true;$Kind='editor';$Owner='vfx-druid';$GrantCount=1;$TtlMin=60; Cmd-Grant; $script:GrantKindArg=$false;$Kind='player'
 function Test-BuildLoopRunning { return $true }
 $order=@(Get-Reservations 'editor' | ForEach-Object { $_.owner }) -join ','
 Check ($order -eq 'buildloop,vfx-druid,codex-map-fieldbuild') ('editor order with loop: '+$order)
 function Test-BuildLoopRunning { return $false }
 $order=@(Get-Reservations 'editor' | ForEach-Object { $_.owner }) -join ','
 Check ($order -eq 'vfx-druid,codex-map-fieldbuild,buildloop') ('editor order without loop: '+$order)
 Check ($null -eq (Get-PriorityGrant 'vfx-druid' 'player')) 'editor grant leaked into player grants'
 Check ($null -ne (Get-PriorityGrant 'char-reshoot' 'player')) 'editor grant replaced the player grant of another owner'
 Use-PriorityGrant 'vfx-druid' 'editor'
 $order=@(Get-Reservations 'editor' | ForEach-Object { $_.owner }) -join ','
 Check ($order -eq 'codex-map-fieldbuild,vfx-druid,buildloop') ('spent editor grant still reorders: '+$order)
 Remove-Item -LiteralPath $e1,$e2,$e3 -Force
 # rank: quit-fix A/B (0) before BuildLoop (1) before the character re-shoot (2) before combo4 (3)
 $ping3=Start-Process "$env:SystemRoot\System32\PING.EXE" -ArgumentList '-n','120','127.0.0.1' -WindowStyle Hidden -PassThru
 $ps3=$ping3.StartTime.ToUniversalTime().ToString('o')
 $Kind='player';$script:GrantKindArg=$false;$TtlMin=60;$GrantCount=3
 $Owner='claude-quit-fix';$GrantRank=0; Cmd-Grant
 $Owner='char-reshoot';$GrantRank=2; Cmd-Grant
 $Owner='ulead-combo4';$GrantRank=3; Cmd-Grant
 Write-JsonAtomic (Get-GrantWaitPath 'claude-quit-fix') ([ordered]@{pid=$ping3.Id;processStart=$ps3;owner='claude-quit-fix';since=(NowIso)})
 $PcException='buildloop';$Owner='buildloop'
 $r=Try-Acquire
 Check ($r -like '*Player 우선 순번 대기: claude-quit-fix*') ('BuildLoop went before the rank-0 A/B: '+$r)
 Reset-Me; Remove-Item -LiteralPath (Get-GrantWaitPath 'claude-quit-fix') -Force
 Write-JsonAtomic (Get-PriorityPath) ([ordered]@{pid=$ping3.Id;processStart=$ps3;owner='buildloop';since=(NowIso)})
 $PcException='candidate';$Owner='claude-quit-fix'
 Check ((Try-Acquire) -eq 'ok') 'rank-0 A/B waited for the BuildLoop waiter'
 Reset-Me
 $Owner='char-reshoot'
 $r=Try-Acquire
 Check ($r -like '*BuildLoop Player 우선 대기*') ('rank-2 grant went before BuildLoop: '+$r)
 Reset-Me; Remove-Item -LiteralPath (Get-PriorityPath) -Force
 Write-JsonAtomic (Get-GrantWaitPath 'char-reshoot') ([ordered]@{pid=$ping3.Id;processStart=$ps3;owner='char-reshoot';since=(NowIso)})
 $Owner='ulead-combo4'
 $r=Try-Acquire
 Check ($r -like '*Player 우선 순번 대기: char-reshoot*') ('rank-3 grant went before rank 2: '+$r)
 Reset-Me
 $Owner='claude-quit-fix'
 Check ((Try-Acquire) -eq 'ok') 'rank-0 waited for a rank-2 waiter'
 Reset-Me; Remove-Item -LiteralPath (Get-GrantWaitPath 'char-reshoot') -Force
 # editor ranks: BuildLoop 1, vfx 2, combo4 3, preview 4, then the rest
 $e1=Add-EditorReservation 'codex-map-fieldbuild' '20000101T000000001'; $e2=Add-EditorReservation 'claude-integration-preview' '20000101T000000002'; $e3=Add-EditorReservation 'ulead-combo4' '20000101T000000003'; $e4=Add-EditorReservation 'vfx-druid' '20000101T000000004'; $e5=Add-EditorReservation 'buildloop' '20000101T000000005'
 $script:GrantKindArg=$true;$Kind='editor';$GrantCount=1
 $Owner='vfx-druid';$GrantRank=2; Cmd-Grant; $Owner='ulead-combo4';$GrantRank=3; Cmd-Grant; $Owner='claude-integration-preview';$GrantRank=4; Cmd-Grant
 $script:GrantKindArg=$false;$Kind='player'
 function Test-BuildLoopRunning { return $true }
 $order=@(Get-Reservations 'editor' | ForEach-Object { $_.owner }) -join ','
 Check ($order -eq 'buildloop,vfx-druid,ulead-combo4,claude-integration-preview,codex-map-fieldbuild') ('editor rank order: '+$order)
 Remove-Item -LiteralPath $e1,$e2,$e3,$e4,$e5 -Force
 $ping3.Kill();$ping3.WaitForExit()
 'PASS: '+$n+' loop-first decisions; Unity launches=0'
} finally {
 if($ping -and -not $ping.HasExited){$ping.Kill()}
 Release-PlayerAdmission
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-loopfirst\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

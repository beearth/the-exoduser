$ErrorActionPreference='Stop'
$source=Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Get-UnityWaitReason','Set-WaitResult','Update-AttemptState'){
 $f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 if(-not $f){throw ('FAIL: queue timeout is still classified as build FAIL; missing '+$name)}
 . ([scriptblock]::Create($f.Extent.Text))
}
function Log($m){Write-Host $m}
$n=0
foreach($c in @(
 @{log='予約';want=''},
 @{log='예약 순번 대기 시간 초과(40분): codex-map25d';want='Unity 순번 대기 초과: codex-map25d'},
 @{log='슬롯 대기 시간 초과(90분): 예약 큐 맨 앞은 map25d(work) - 내 차례 아님';want='Unity 순번 대기 초과: map25d'},
 @{log='슬롯 대기 시간 초과(90분): 잠금 보유: devtools-server pid 48348 G:/map';want='Unity 순번 대기 초과: devtools-server'},
 @{log='EXO_QUEUE_WAIT owner=front-owner';want='Unity 순번 대기 초과: front-owner'},
 @{log='Player 슬롯 대기 시간 초과(60분): Player 슬롯 2/2';want='Unity 순번 대기 초과: Player 슬롯 2/2'},
 @{log='error CS0103: timeout';want=''},
 @{log='컴파일/임포트 대기 시간 초과';want=''},
 @{log='대기 시간 초과 3600 초 (job abc)';want=''}
)){
 $a=Get-UnityWaitReason $c.log
 if($a -ne $c.want){throw ('FAIL: expected ['+$c.want+'] observed ['+$a+']')};$n++
}
$run=[ordered]@{verdict='FAIL';failReasons=@('build failed');replaceNote='';smokeNote=''}
Set-WaitResult $run 'Unity 순번 대기 초과: front'
if($run.verdict -ne 'WAIT' -or $run.failReasons.Count -ne 0){throw 'FAIL: WAIT counted as failure'}
$st=[pscustomobject]@{lastAttemptSha='before';lastAttemptVerdict='PASS'}
Update-AttemptState $st 'next' 'WAIT' $false
if($st.lastAttemptSha -ne 'before'){throw 'FAIL: WAIT blocks next cycle retry'}
if($st.lastAttemptVerdict -ne 'WAIT'){throw 'FAIL: WAIT verdict must release a previous same-SHA failure on next cycle'}
Update-AttemptState $st 'next' 'FAIL' $false
if($st.lastAttemptSha -ne 'next'){throw 'FAIL: actual build failure not recorded'}
Update-AttemptState $st 'branch' 'PASS' $true
if($st.lastAttemptSha -ne 'next'){throw 'FAIL: branch modified deployment attempt'}
'PASS: '+($n+5)+' wait classification/state decisions; Unity launches=0'

# Exercise the real Cmd-Run finally path with only environment boundaries replaced.
foreach($name in 'Cmd-Run','WriteJson','ReadJson'){
 $f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 . ([scriptblock]::Create($f.Extent.Text))
}
$fixture=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1103-slots' ('wait-run-'+[guid]::NewGuid().ToString('N'))
$Cfg=@{Out=$fixture;Worktree=$fixture};$RunsDir=Join-Path $fixture 'runs';$HaltFile=Join-Path $fixture 'HALT'
$MainRef='origin/unity/main';$Ref=$MainRef;$NoSwap=$false;$Force=$true;$Utf8=New-Object Text.UTF8Encoding($false)
$script:saved=[pscustomobject]@{deployed=$null;pending=$null;lastAttemptSha='before';lastAttemptVerdict='PASS';history=@()}
function Load-State {return $script:saved}
function Save-State($s){$script:saved=$s}
function Get-HeadInfo {return [pscustomobject]@{short='abcdef012';full='abcdef012345';subject='fixture'}}
function Get-Changed {return [pscustomobject]@{count=0;items=@()}}
function Load-Rules {return @{}}
function Acquire-Lock {return $true}
function Release-Lock {}
function Write-MemLog {}
function Get-UserSaveSnapshot {return @{}}
$script:queued=$false
function Set-UnityReservation($command){$script:queued=($command -eq 'reserve')}
function Wait-Ready {if(-not $script:queued){throw 'FAIL: waited before reserve'};return $false}
function Get-BlockingUnityOwner {return 'front-owner'}
function Prune-Runs {}
function Write-Status {}
Cmd-Run
$f=Get-ChildItem $RunsDir -Recurse -Filter run.json|Select-Object -First 1
$r=ReadJson $f.FullName
if($r.verdict -ne 'WAIT' -or $r.failReasons.Count -ne 0 -or $script:saved.history[0].fail -ne 0){throw 'FAIL: real run did not persist WAIT/fail=0'}
if($script:saved.lastAttemptSha -ne 'before' -or -not $script:queued){throw 'FAIL: retry state/WAIT keeps FIFO reservation'}
'PASS: real Cmd-Run WAIT receipt/history, no attempt SHA update, reserve before wait, WAIT keeps FIFO reservation'

# Real hidden PowerShell child for the queue command; fake launcher stays inside this fixture.
$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq 'Set-UnityReservation'|Select-Object -First 1
. ([scriptblock]::Create($f.Extent.Text))
$Cfg=@{Worktree=$fixture;WaitMaxMin=90;BuildTimeoutMin=90};$LoopDir=$fixture
$fake=Join-Path $fixture 'unity/Tools/devtools/exo-unity.ps1'
New-Item -ItemType Directory -Path (Split-Path $fake) -Force|Out-Null
[IO.File]::WriteAllText($fake,@'
param([string]$Command,[string]$Owner,[string]$Worktree,[string]$Note,[int]$TtlMin,[string]$Kind)
if($Owner -ne 'buildloop' -or $TtlMin -ne 210){exit 2}
[Console]::Error.WriteLine('queue-stderr-'+$Command)
Write-Output ('queue-stdout-'+$Command)
exit 0
'@,$Utf8)
Set-UnityReservation 'reserve'
Set-UnityReservation 'unreserve'
'PASS: real hidden reservation subprocess, owner=buildloop, TTL=210, stderr accepted'
foreach($name in 'Get-BlockingUnityOwner','Prop'){
 $fun=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 . ([scriptblock]::Create($fun.Extent.Text))
}
$queue=Join-Path $fixture 'queue';New-Item -ItemType Directory -Path $queue -Force|Out-Null
WriteJson (Join-Path $queue '1.json') @{owner='editor-front';expiresAt=[datetime]::UtcNow.AddHours(1).ToString('o')}
WriteJson (Join-Path $queue '2.json') @{owner='player-front';kind='player';expiresAt=[datetime]::UtcNow.AddHours(1).ToString('o')}
if((Get-BlockingUnityOwner 'editor' $fixture) -ne 'editor-front' -or (Get-BlockingUnityOwner 'player' $fixture) -ne 'player-front'){throw 'FAIL: blocking owner crosses reservation kinds'}
'PASS: blocking owner is kind-specific; legacy missing kind is editor'

# Build -> smoke has its own waiting boundary after the build consumed its reservation.
$fixture=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1103-slots' ('phase-wait-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture|Out-Null
& git.exe -C $fixture init -q
if($LASTEXITCODE -ne 0){throw 'fixture git init failed'}
$Cfg=@{Out=$fixture;Worktree=$fixture;Node='unused';KeepRuns=10};$RunsDir=Join-Path $fixture 'runs';$HaltFile=Join-Path $fixture 'HALT'
$script:saved=[pscustomobject]@{deployed=$null;pending=$null;lastAttemptSha='before';lastAttemptVerdict='PASS';history=@()}
$script:FixtureGitExe=(Get-Command git.exe).Source
function git.exe { & $script:FixtureGitExe -c ('safe.directory='+$fixture.Replace('\','/')) @args }
$script:queued=$false;$script:readyCalls=0
function Set-UnityReservation($command,$kind='editor'){$script:queued=($command -eq 'reserve');if($command -eq 'reserve'){$script:reservationKind=$kind}}
function GitR {return 'abcdef012345'}
function Test-RequiredMedia {return @()}
function Judge-Log {return [pscustomobject]@{fail=0;known=0}}
function Get-UnityProcs {return @([pscustomobject]@{Id=555})}
function Wait-Ready {
 $script:readyCalls++
 if(-not $script:queued){throw 'FAIL: build-to-smoke wait happened before reserve'}
 return ($script:readyCalls -eq 1)
}
function Invoke-Exo($command,$jobArgs,$logBase){
 if($command -ne 'build'){throw 'fixture must stop before real smoke'}
 $script:queued=$false
 New-Item -ItemType Directory -Path $jobArgs[1] -Force|Out-Null
 [IO.File]::WriteAllText((Join-Path $jobArgs[1] 'EXODUSER-Unity.exe'),'fixture, never executed')
 WriteJson $jobArgs[3] @{passed=$true}
 return [pscustomobject]@{exit=0;receipt=$null;waitReason=''}
}
function Run-Smoke {
 if(-not $script:queued -or $script:reservationKind -ne 'player'){throw 'FAIL: smoke missing player reservation'}
 return [pscustomobject]@{waitReason='Unity 순번 대기 초과: Player 슬롯 2/2';ran=$false;exit=1;timedOut=$false;windowSeen=$false;slowExit=$false;note='';seconds=0}
}
Cmd-Run
$f=Get-ChildItem $RunsDir -Recurse -Filter run.json|Select-Object -First 1
$r=ReadJson $f.FullName
if($r.verdict -ne 'WAIT' -or $script:readyCalls -ne 1){throw ('FAIL: smoke waiting boundary: '+$r.verdict+' '+$r.replaceNote)}
if($script:saved.lastAttemptSha -ne 'before' -or $script:saved.history[0].fail -ne 0){throw 'FAIL: post-build WAIT retry/failure state'}
if(-not(Test-Path (Join-Path $f.DirectoryName 'waiting-build/EXODUSER-Unity.exe'))){throw 'FAIL: WAIT package not preserved'}
'PASS: build-to-smoke reserve before wait, WAIT retry state, completed package preserved'

# A forced retry of an already-failed SHA can WAIT too: the next ordinary cycle must still enter.
$script:saved.lastAttemptSha='abcdef012345';$script:saved.lastAttemptVerdict='WAIT'
$script:readyCalls=0;$script:queued=$false;$Force=$false
Cmd-Run
if($script:readyCalls -ne 1){throw 'FAIL: ordinary cycle skipped a previous same-SHA WAIT'}
'PASS: ordinary same-SHA cycle retries after forced WAIT; lastAttemptSha retained'

# 11-03: an ABORT after build left build_new with pending=null and every later cycle aborted on it.
$orphan=Join-Path $fixture 'build_new';New-Item -ItemType Directory -Path $orphan -Force|Out-Null
[IO.File]::WriteAllText((Join-Path $orphan 'orphan.txt'),'left by an aborted cycle')
$script:saved.pending=$null;$Force=$true;$script:queued=$false
function Wait-Ready {return $true}
function Run-Smoke {throw 'fixture abort after build'}
Cmd-Run
$f=Get-ChildItem $RunsDir -Directory|Sort-Object Name|Select-Object -Last 1
$r=ReadJson (Join-Path $f.FullName 'run.json')
if($r.verdict -ne 'ABORT'){throw ('FAIL: abort fixture verdict '+$r.verdict)}
if(-not(Test-Path (Join-Path $f.FullName 'orphan-build-before/orphan.txt'))){throw 'FAIL: orphan build_new not archived before build'}
if(-not(Test-Path (Join-Path $f.FullName 'aborted-build/EXODUSER-Unity.exe'))){throw 'FAIL: own aborted build not archived'}
if(Test-Path $orphan){throw 'FAIL: build_new still blocks the next cycle'}
'PASS: orphan build_new archived, own ABORT build archived, next cycle unblocked'

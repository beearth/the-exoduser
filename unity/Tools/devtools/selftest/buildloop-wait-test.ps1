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
Update-AttemptState $st 'next' 'FAIL' $false
if($st.lastAttemptSha -ne 'next'){throw 'FAIL: actual build failure not recorded'}
Update-AttemptState $st 'branch' 'PASS' $true
if($st.lastAttemptSha -ne 'next'){throw 'FAIL: branch modified deployment attempt'}
'PASS: '+($n+4)+' wait classification/state decisions; Unity launches=0'

# Exercise the real Cmd-Run finally path with only environment boundaries replaced.
foreach($name in 'Cmd-Run','WriteJson','ReadJson'){
 $f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 . ([scriptblock]::Create($f.Extent.Text))
}
$fixture=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1102\fix2' ('wait-run-'+[guid]::NewGuid().ToString('N'))
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
if($script:saved.lastAttemptSha -ne 'before' -or $script:queued){throw 'FAIL: retry state/reservation cleanup'}
'PASS: real Cmd-Run WAIT receipt/history, no attempt SHA update, reserve before wait, reservation cleanup'

# Real hidden PowerShell child for the queue command; fake launcher stays inside this fixture.
$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq 'Set-UnityReservation'|Select-Object -First 1
. ([scriptblock]::Create($f.Extent.Text))
$Cfg=@{Worktree=$fixture;WaitMaxMin=90;BuildTimeoutMin=90};$LoopDir=$fixture
$fake=Join-Path $fixture 'unity/Tools/devtools/exo-unity.ps1'
New-Item -ItemType Directory -Path (Split-Path $fake) -Force|Out-Null
[IO.File]::WriteAllText($fake,@'
param([string]$Command,[string]$Owner,[string]$Worktree,[string]$Note,[int]$TtlMin)
if($Owner -ne 'buildloop' -or $TtlMin -ne 210){exit 2}
[Console]::Error.WriteLine('queue-stderr-'+$Command)
Write-Output ('queue-stdout-'+$Command)
exit 0
'@,$Utf8)
Set-UnityReservation 'reserve'
Set-UnityReservation 'unreserve'
'PASS: real hidden reservation subprocess, owner=buildloop, TTL=210, stderr accepted'

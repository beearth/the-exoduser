param(
 [string]$Source=(Join-Path $PSScriptRoot '../buildloop/buildloop.ps1'),
 [string]$Output='I:/EXODUSER-Storage/devtools/fix-1103-ui-invocation'
)
$ErrorActionPreference='Stop';Set-StrictMode -Version 2
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($Source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Read-UiOverlapSummary','Invoke-UiOverlapCheck'){
 $f=$ast.FindAll({param($n)$n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 if($f){. ([scriptblock]::Create($f.Extent.Text))}
}
# 11-04 ratchet: the known-list step (Apply-UiKnownList) runs node on the loop worktree; these decisions test the raw summary only.
function Apply-UiKnownList($run,$stateObj,$runDir){}
function Get-UiCheckDir($runDir){ return (Join-Path $runDir 'ui-check') }; function Save-UiCheckRecord($uiDir,$runDir){}   # 11-04: UI 출력 위치(G:)는 이 판정과 무관
$st=$null
$uiTry=$ast.FindAll({param($n)$n -is [Management.Automation.Language.TryStatementAst] -and $n.Extent.Text.Contains("`$uiLog = Join-Path `$runDir 'ui-overlap.log'")},$true)|Sort-Object {$_.Extent.Text.Length}|Select-Object -First 1
if(-not $uiTry){throw 'FAIL: UI invocation block not found'}
$fixture=Join-Path $Output ('invocation-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture -Force|Out-Null
$Utf8=New-Object Text.UTF8Encoding($false);$checks=0
function Check($condition,$why){if(-not $condition){throw ('FAIL: '+$why)};$script:checks++}
$records=@()
foreach($case in @(@{name='stderr-exit0';exit=0;issues=0;pass=$true},@{name='stderr-exit2';exit=2;issues=0;pass=$false},@{name='stderr-issues147';exit=0;issues=147;pass=$false})){
 $runDir=Join-Path $fixture ($case.name+' path with spaces');New-Item -ItemType Directory -Path $runDir|Out-Null
 $stage=Join-Path $runDir 'fake build';$Cfg=@{Worktree=(Join-Path $runDir 'fake worktree')}
 $uiCheck=Join-Path $runDir 'fake UI checker.ps1';$run=[ordered]@{}
 $body=@'
param($Exe,$Worktree,$Output,[switch]$OverlapOnly)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
[Console]::Error.WriteLine('[exo-unity] 예약 추가: ui-overlap-check ()')
Start-Sleep -Milliseconds 60
[Console]::Out.WriteLine('fixture stdout after reservation')
$dir=Join-Path $Output 'overlap';New-Item -ItemType Directory -Path $dir -Force|Out-Null
[IO.File]::WriteAllText((Join-Path $dir 'overlap-summary.json'),'SUMMARY',(New-Object Text.UTF8Encoding($false)))
[IO.File]::WriteAllText((Join-Path $dir 'overlap-report.json'),'small fixture, never parsed')
[IO.File]::WriteAllText((Join-Path $Output 'arguments.json'),(@{Exe=$Exe;Worktree=$Worktree;OverlapOnly=[bool]$OverlapOnly}|ConvertTo-Json),(New-Object Text.UTF8Encoding($false)))
exit EXIT
'@
 $passed=($case.issues -eq 0).ToString().ToLower()
 $summary='{"passed":'+$passed+',"frameCount":1395,"issueCount":'+$case.issues+',"missing":[]}'
 $body=$body.Replace('SUMMARY',$summary).Replace('exit EXIT',('exit '+$case.exit))
 [IO.File]::WriteAllText($uiCheck,$body,(New-Object Text.UTF8Encoding($true)))
 $uiExit=$null;$global:LASTEXITCODE=$null;$caught=$null
 try{. ([scriptblock]::Create($uiTry.Extent.Text))}catch{$caught=@{type=$_.Exception.GetType().FullName;message=$_.Exception.Message;fullyQualifiedErrorId=$_.FullyQualifiedErrorId;category=[string]$_.CategoryInfo;scriptStackTrace=$_.ScriptStackTrace}}
 $result=$null;if($run.Contains('uiOverlap')){$result=$run.uiOverlap}
 $record=@{case=$case.name;expectedNativeExit=$case.exit;assignedUiExit=$uiExit;lastExitCode=$global:LASTEXITCODE;error=$caught;uiOverlap=$result;errorActionPreference=$ErrorActionPreference;stdoutBytes=$(if(Test-Path (Join-Path $runDir 'ui-overlap.log')){(Get-Item (Join-Path $runDir 'ui-overlap.log')).Length}else{$null})}
 $records+=$record
 [IO.File]::WriteAllText((Join-Path $Output 'invocation-results.json'),($records|ConvertTo-Json -Depth 9),$Utf8)
 Check ($null -eq $caught) ('stderr caused parent ABORT before native completion: '+($caught|ConvertTo-Json -Compress))
 Check ($null -ne $result -and $result.exit -eq $case.exit) 'real native exit not retained'
 Check ($result.passed -eq $case.pass) 'stderr or exit/summary changed product verdict incorrectly'
 Check ($ErrorActionPreference -eq 'Stop') 'global error policy weakened'
 Check ([IO.File]::ReadAllText((Join-Path $runDir 'ui-overlap.log')).Contains('fixture stdout after reservation')) 'stdout lost'
 Check ([IO.File]::ReadAllText($result.stderrLog).Contains('[exo-unity] 예약 추가: ui-overlap-check ()')) 'raw stderr lost'
 $argsSeen=[IO.File]::ReadAllText((Join-Path $runDir 'ui-check/arguments.json'))|ConvertFrom-Json
 Check ($argsSeen.Exe -eq (Join-Path $stage 'EXODUSER-Unity.exe') -and $argsSeen.Worktree -eq $Cfg.Worktree -and $argsSeen.OverlapOnly) 'quoted arguments changed'
 if($case.issues){Check ($result.issueCount -eq 147) '147 overlap issues lost'}
 'PASS: '+$case.name+' actual native exit='+$result.exit+' passed='+$result.passed+'; stdout/stderr retained'
}

# An unstarted process or unknown native exit is an invocation error, never fabricated exit0/exit1.
function Start-Process {throw [InvalidOperationException]::new('fixture process start rejected')}
$run=[ordered]@{};$failed=$false
try{. ([scriptblock]::Create($uiTry.Extent.Text))}catch{$failed=$true}
Check ($failed -and $run.uiOverlap.exit -eq $null -and -not $run.uiOverlap.passed) 'launch error swallowed/fabricated exit'
Remove-Item function:Start-Process
function Start-Process {
 $p=[pscustomobject]@{Handle=1;Id=2147483646;ExitCode=$null}
 $p|Add-Member ScriptMethod WaitForExit {};$p|Add-Member ScriptMethod Refresh {};$p|Add-Member ScriptMethod Dispose {}
 return $p
}
$run=[ordered]@{};$failed=$false
try{. ([scriptblock]::Create($uiTry.Extent.Text))}catch{$failed=$true}
Check ($failed -and $run.uiOverlap.exit -eq $null -and -not $run.uiOverlap.passed) 'unknown native exit fabricated/swallowed'
Remove-Item function:Start-Process
'PASS: '+$checks+' UI invocation assertions; no Unity/Player/build/GPU; fixture='+$fixture

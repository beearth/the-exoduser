param(
 [string]$Output = 'I:/EXODUSER-Storage/devtools/fix-1103-overlap-summary',
 [string]$Source = (Join-Path $PSScriptRoot '../buildloop/buildloop.ps1')
)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
# Import full definitions at script scope (including their parameter lists).
$functions=@('Read-UiOverlapSummary','Invoke-UiOverlapCheck','ReadJson','WriteJson','Cmd-Run','Update-AttemptState','Prop')
foreach($name in $functions){
 $f=$ast.FindAll({param($n)$n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1
 if(-not $f){throw ('FAIL: missing bounded UI summary consumer: '+$name)}
 . ([scriptblock]::Create($f.Extent.Text))
}
$fixture=Join-Path $Output ('fixture-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture -Force|Out-Null
$Utf8=New-Object Text.UTF8Encoding($false)
$summary=Join-Path $fixture 'overlap-summary.json';$detail=Join-Path $fixture 'overlap-report.json'
[IO.File]::WriteAllText($detail,'detail content must never be read')
$lockedDetail=[IO.File]::Open($detail,'Open','ReadWrite','None')
$script:checks=0
function Check($condition,$why){if(-not $condition){throw ('FAIL: '+$why)};$script:checks++}
function Put($text){[IO.File]::WriteAllText($summary,$text,$Utf8)}
try {
 Put '{"passed":true,"frameCount":1395,"issueCount":0,"missing":[]}'
 $r=Read-UiOverlapSummary $summary 0 $detail
 Check ($r.valid -and $r.passed -and $r.frameCount -eq 1395 -and $r.issueCount -eq 0) 'valid PASS rejected'
 Check ($r.detailReport -eq $detail -and $r.receipt -eq $summary) 'detail/summary evidence paths not retained'
 Put '{"passed":false,"frameCount":1395,"issueCount":147,"missing":[]}'
 $r=Read-UiOverlapSummary $summary 0 $detail
 Check ($r.valid -and -not $r.passed -and $r.issueCount -eq 147) 'real overlap failure relaxed'
 Put '{"passed":true,"frameCount":1395,"issueCount":147,"missing":[]}'
 Check (-not (Read-UiOverlapSummary $summary 0 $detail).passed) 'contradictory passed=true bypasses issues'
 Put '{"passed":true,"frameCount":1395,"issueCount":0,"missing":["HUD/ko/3840x1080"]}'
 Check (-not (Read-UiOverlapSummary $summary 0 $detail).passed) 'missing coverage bypassed'
 Put '{"passed":false,"frameCount":1395,"issueCount":0,"missing":[]}'
 Check (-not (Read-UiOverlapSummary $summary 0 $detail).passed) 'analyzer false bypassed'
 Put '{"passed":true,"frameCount":0,"issueCount":0,"missing":[]}'
 Check (-not (Read-UiOverlapSummary $summary 0 $detail).passed) 'zero captures accepted'
 Put '{"passed":true,"frameCount":1,"issueCount":0,"missing":[]}'
 Check (-not (Read-UiOverlapSummary $summary 0 (Join-Path $fixture 'missing-detail.json')).passed) 'missing detail evidence accepted'
 foreach($exit in @(1,2,-1,$null)) {Check (-not (Read-UiOverlapSummary $summary $exit $detail).passed) 'nonzero/missing analyzer exit accepted'}
 foreach($bad in @(
  '{}','null','[]','{"passed":true','{"passed":true,"frameCount":1,"issueCount":0}',
  '{"passed":"true","frameCount":1,"issueCount":0,"missing":[]}',
  '{"passed":1,"frameCount":1,"issueCount":0,"missing":[]}',
  '{"passed":true,"frameCount":"1","issueCount":0,"missing":[]}',
  '{"passed":true,"frameCount":1,"issueCount":"0","missing":[]}',
  '{"passed":true,"frameCount":1,"issueCount":0,"missing":""}',
  '{"passed":true,"frameCount":1,"issueCount":0,"missing":null}',
  '{"passed":true,"frameCount":1,"issueCount":0,"missing":[false]}',
  '{"passed":true,"frameCount":-1,"issueCount":0,"missing":[]}',
  '{"passed":true,"frameCount":1,"issueCount":-1,"missing":[]}',
  '{"passed":true,"frameCount":1.5,"issueCount":0,"missing":[]}',
  '{"passed":true,"frameCount":1,"issueCount":false,"missing":[]}',
  '{"passed":true,"frameCount":9007199254740992,"issueCount":0,"missing":[]}',
  '{"passed":true,"passed":false,"frameCount":1,"issueCount":0,"missing":[]}',
  '{"passed":false,"passed":true,"frameCount":1,"issueCount":0,"missing":[]}',
  '{"passed":true,"frameCount":1,"issueCount":0,"missing":[],}',
  '{/* comment */"passed":true,"frameCount":1,"issueCount":0,"missing":[]}',
  '{"passed":true,"frameCount":1,"issueCount":0,"missing":[],"extra":0}'
 )) {Put $bad;$r=Read-UiOverlapSummary $summary 0 $detail;Check (-not $r.valid -and -not $r.passed) ('malformed/schema error accepted: '+$bad)}
 Put '{"missing":[],"issueCount":0,"frameCount":1,"passed":true}'
 Check ((Read-UiOverlapSummary $summary 0 $detail).passed) 'property order changes rejected'
 $json=[IO.File]::ReadAllText($summary)
 Put ($json+(' '*(65536-$Utf8.GetByteCount($json))))
 Check ((Read-UiOverlapSummary $summary 0 $detail).passed) '64KiB boundary rejected'
 Put ($json+(' '*(65537-$Utf8.GetByteCount($json))))
 $r=Read-UiOverlapSummary $summary 0 $detail
 Check (-not $r.valid -and -not $r.passed -and $r.note -match '65536') 'oversized summary not bounded'
 [IO.File]::WriteAllBytes($summary,[byte[]]@(0xc3,0x28))
 Check (-not (Read-UiOverlapSummary $summary 0 $detail).valid) 'invalid UTF8 accepted'
 Remove-Item -LiteralPath $summary
 Check (-not (Read-UiOverlapSummary $summary 0 $detail).passed) 'missing summary accepted'
 Put $json
 $hold=[IO.File]::Open($summary,'Open','ReadWrite','None')
 try {Check (-not (Read-UiOverlapSummary $summary 0 $detail).passed) 'unreadable summary accepted'} finally {$hold.Dispose()}
 $rules=[IO.File]::ReadAllText((Join-Path $PSScriptRoot '../buildloop/smoke-rules.json'))|ConvertFrom-Json
 Check ($rules.uiOverlap.receipt -eq 'ui-check/overlap/overlap-summary.json' -and $rules.uiOverlap.detailReport -eq 'ui-check/overlap/overlap-report.json' -and $rules.uiOverlap.maxReceiptBytes -eq 65536 -and $rules.uiOverlap.maxIssues -eq 0) 'smoke-rules receipt contract drift'
 'PASS: '+$script:checks+' bounded/strict/fail-closed UI summary checks; locked detail never opened; Unity launches=0'
} finally {$lockedDetail.Dispose()}

# Real 81-byte source-only reuse. The 1.39GB detailed report is passed only as an evidence path.
$actual='I:/EXODUSER-Storage/unity-latest/loop/runs/20261103-025650441_09192f7/ui-check/overlap'
$reused=Read-UiOverlapSummary (Join-Path $actual 'overlap-summary.json') 0 (Join-Path $actual 'overlap-report.json')
Check ($reused.valid -and -not $reused.passed -and $reused.frameCount -eq 1395 -and $reused.issueCount -eq 147) '81-byte production FAIL was not preserved'
WriteJson (Join-Path $Output 'actual-summary-result.json') $reused
'PASS: actual 81B summary reused, frames1395/issues147 remains FAIL even with analyzer exit0; detail not read'

# Exercise the real Cmd-Run decision/persistence using environment boundaries only.
# No Unity/Player/build/GPU launch; fake UI checker is a tiny hidden PowerShell script.
function Log($m){Write-Host $m}
function Load-State {return $script:state}
function Save-State($s){$script:state=$s}
function Get-HeadInfo {return [pscustomobject]@{short='abcdef012';full='abcdef012345';subject='source-only UI receipt fixture'}}
function Get-Changed {return [pscustomobject]@{count=0;items=@()}}
function Load-Rules {return @{}}
function Acquire-Lock {return $true}
function Release-Lock {}
function Write-MemLog {}
function Get-UserSaveSnapshot {return @{}}
function Compare-UserSave {return [pscustomobject]@{changed=0;files=@()}}
function Set-UnityReservation {}
function Wait-Ready {return $true}
function GitR {return 'abcdef012345'}
function git.exe {$global:LASTEXITCODE=0}
function Test-RequiredMedia {return @()}
function Judge-Log {return [pscustomobject]@{fail=0;known=0;graphicsOk=$true;gfx=@();failById=@{}}}
function Judge-M1 {return [pscustomobject]@{present=$true;fail=0;ok=23;neutral=0;deviceType='Direct3D11';guiRepaints=1;headless=$false;device='fixture';captureMode='fixture'}}
function Make-Thumbs {return @('fixture.png')}
function Measure-Caps {return [pscustomobject]@{total=1;black=0}}
function Prune-Runs {}
function Write-Status {}
function Invoke-Exo($command,$jobArgs,$logBase){
 if($command -ne 'build'){throw 'unexpected launch path'}
 New-Item -ItemType Directory -Path $jobArgs[1] -Force|Out-Null
 [IO.File]::WriteAllText((Join-Path $jobArgs[1] 'EXODUSER-Unity.exe'),'never executed')
 WriteJson $jobArgs[3] @{passed=$true}
 return [pscustomobject]@{exit=0;receipt=$null;waitReason=''}
}
function Run-Smoke($buildDir,$smokeDir){
 $ui=Join-Path (Split-Path $smokeDir) 'ui-check/overlap'
 New-Item -ItemType Directory -Path $ui -Force|Out-Null
 if($null -ne $script:caseJson){[IO.File]::WriteAllText((Join-Path $ui 'overlap-summary.json'),$script:caseJson,$Utf8)}
 [IO.File]::WriteAllText((Join-Path $ui 'overlap-report.json'),'fixture evidence: never parsed')
 return [pscustomobject]@{waitReason='';seconds=0;ran=$true;exit=0;timedOut=$false;windowSeen=$false;slowExit=$false;note='fixture'}
}
$MainRef='origin/unity/main';$Ref=$MainRef;$NoSwap=$true;$Force=$true;$SkipSmoke=$false;$HudSmoke=$false;$Mode='desktop';$AllowKnown=$false
$realReadJson=(Get-Item function:ReadJson).ScriptBlock
function ReadJson($path){if($path.EndsWith('overlap-report.json')){throw 'FORBIDDEN full detail read'};& $realReadJson $path}
foreach($case in @(
 @{name='issues147';json=[IO.File]::ReadAllText((Join-Path $actual 'overlap-summary.json'));verdict='FAIL'},
 @{name='clean-pass';json='{"passed":true,"frameCount":1395,"issueCount":0,"missing":[]}';verdict='PASS'},
 @{name='malformed';json='{"passed":true';verdict='FAIL'},
 @{name='missing';json=$null;verdict='FAIL'},
 @{name='bad-exit';json='{"passed":true,"frameCount":1395,"issueCount":0,"missing":[]}';verdict='FAIL';exit=2}
)){
 $dir=Join-Path $fixture $case.name;New-Item -ItemType Directory -Path $dir -Force|Out-Null
 $Cfg=@{Out=$dir;Worktree=$dir;Node='unused';KeepRuns=10};$RunsDir=Join-Path $dir 'runs';$HaltFile=Join-Path $dir 'HALT'
 $script:state=[pscustomobject]@{deployed=$null;pending=$null;lastAttemptSha='before';lastAttemptVerdict='PASS';history=@()}
 $script:caseJson=$case.json
 $checker=Join-Path $dir 'unity/Tools/ui-overlap/check.ps1';New-Item -ItemType Directory -Path (Split-Path $checker) -Force|Out-Null
 $checkerExit=0;if($case.exit){$checkerExit=$case.exit}
 $checkerBody='param($Exe,$Worktree,$Output,[switch]$OverlapOnly)'+"`n"+'exit '+$checkerExit
 [IO.File]::WriteAllText($checker,$checkerBody,$Utf8)
 Cmd-Run
 $file=Get-ChildItem $RunsDir -Recurse -Filter run.json|Select-Object -First 1
 $result=ReadJson $file.FullName
 Check ($result.verdict -eq $case.verdict -and -not $result.replaced) ('real Cmd-Run '+$case.name+' verdict='+$result.verdict+' note='+$result.replaceNote)
 if($case.name -eq 'issues147'){Check ($result.uiOverlap.issueCount -eq 147) '147 issues lost in run receipt'}
 'PASS: actual Cmd-Run '+$case.name+' => '+$result.verdict+', replaced=false; detail ReadJson forbidden'
}
'PASS: total '+$script:checks+' assertions; Unity/Player/build launches=0; fixtures='+$fixture

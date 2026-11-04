$ErrorActionPreference='Stop'
# 11-04: Players stuck in a kernel driver wait after Quit stayed alive with one thread and frozen CPU, and four more were
# launched on top of them. Find-ZombiePlayers must flag only one-thread processes whose CPU time does not move. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq 'Find-ZombiePlayers'|Select-Object -First 1
if(-not $f){throw 'FAIL: missing Find-ZombiePlayers'}
. ([scriptblock]::Create($f.Extent.Text))
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
$script:tick=0
function Fake($id,$threads,$cpuSec,$moving){ [pscustomobject]@{Id=$id;ProcessName='EXODUSER-Unity';Threads=@(1..$threads);WorkingSet64=1GB;StartTime=(Get-Date);Base=$cpuSec;Moving=$moving} | Add-Member -PassThru ScriptProperty TotalProcessorTime { [TimeSpan]::FromSeconds($this.Base + $(if($this.Moving){$script:tick}else{0})) } }
function Get-Process { param($Name,$Id,$ErrorAction) if($Id){ $p=@($script:procs|Where-Object Id -eq $Id); if(-not $p.Count){throw 'gone'}; return $p[0] }; return $script:procs }
function Start-Sleep { param($Milliseconds,$Seconds) $script:tick++ }
$script:procs=@((Fake 61680 1 9.7 $false),(Fake 35348 48 120 $true),(Fake 777 1 0.2 $true))
$z=@(Find-ZombiePlayers)
Check ($z.Count -eq 1 -and $z[0].pid -eq 61680) ('zombie set wrong: '+(($z|ForEach-Object pid) -join ','))
Check ($z[0].threads -eq 1 -and $z[0].cpuSec -eq 9.7) 'zombie details'
$script:procs=@((Fake 35348 48 120 $true))
Check (@(Find-ZombiePlayers).Count -eq 0) 'running user build flagged'
$script:procs=@()
Check (@(Find-ZombiePlayers).Count -eq 0) 'no process flagged'
'PASS: '+$n+' zombie Player decisions; Unity launches=0'

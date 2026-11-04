$ErrorActionPreference='Stop'
# 11-04: a zombie is a Player at least 120 s old whose CPU is frozen and whose log ends in the shutdown phase (05:06 drivers).
# A slow start (13:09 PID 44556 on a saturated USB HDD: 1 thread, 0.1 s CPU, log still at "Mono path") is not one. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($name in 'Find-ZombiePlayers','Get-PlayerLogPath','Get-LastLogLine','Read-SharedText','Read-DiskIdle','Wait-DiskIdle'){$f=$ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)|Where-Object Name -eq $name|Select-Object -First 1;if(-not $f){throw ('FAIL: missing '+$name)};. ([scriptblock]::Create($f.Extent.Text))}
$asg=$ast.FindAll({param($n) $n -is [Management.Automation.Language.AssignmentStatementAst] -and $n.Left.Extent.Text -eq '$ZombieShutdownPattern'},$true)|Select-Object -First 1
Invoke-Expression $asg.Extent.Text
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Say($m){}
$dir=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1104-zombie2' ('fixture-'+[guid]::NewGuid().ToString('N'));New-Item -ItemType Directory -Force -Path $dir|Out-Null
function Log($name,$lines){$p=Join-Path $dir ($name+'.log');[IO.File]::WriteAllText($p,($lines -join "`n")+"`n");return $p}
$shutdownLog=Log 'shutdown' @('Mono path[0] = x','[Physics::Module] Cleanup current backend.','Input System module state changed to: ShutdownInProgress.','Input Polling Thread exited.','Input System module state changed to: Shutdown.')
$startLog=Log 'start' @("Mono path[0] = 'I:/x/Managed'","Mono config path = 'I:/x/etc'")
$script:tick=0
function Fake($id,$ageSec,$threads,$cpuSec,$moving,$log){ [pscustomobject]@{Id=$id;ProcessName='EXODUSER-Unity';Threads=@(1..$threads);WorkingSet64=1GB;StartTime=(Get-Date).AddSeconds(-$ageSec);Base=$cpuSec;Moving=$moving;Log=$log} | Add-Member -PassThru ScriptProperty TotalProcessorTime { [TimeSpan]::FromSeconds($this.Base + $(if($this.Moving){$script:tick}else{0})) } }
function Get-Process { param($Name,$Id,$ErrorAction) if($Id){ $p=@($script:procs|Where-Object Id -eq $Id); if(-not $p.Count){throw 'gone'}; return $p[0] }; return $script:procs }
function Get-CimInstance { param($ClassName,$Filter,$ErrorAction) if($ClassName -eq 'Win32_Process'){ return @($script:procs | ForEach-Object { [pscustomobject]@{ProcessId=$_.Id;CommandLine=('"x.exe" -logFile "'+$_.Log+'" --unity-mute')} }) }; $v=$script:disk[[Math]::Min($script:di,$script:disk.Count-1)];$script:di++;return [pscustomobject]@{PercentIdleTime=$v;CurrentDiskQueueLength=$(if($v -lt 50){3}else{0})} }
function Start-Sleep { param($Milliseconds,$Seconds) $script:tick++ }
try {
 # 05:06 kind: old, frozen, log ends at Shutdown -> zombie
 $script:procs=@((Fake 61680 3600 1 9.7 $false $shutdownLog))
 $z=@(Find-ZombiePlayers)
 Check ($z.Count -eq 1 -and $z[0].pid -eq 61680 -and $z[0].lastLogLine -like '*Shutdown*') 'shutdown-stuck Player not flagged'
 # 13:09 kind: 76 s old, 1 thread, frozen at "Mono path" -> not a zombie (slow start, timeout handles it)
 $script:procs=@((Fake 44556 76 1 0.1 $false $startLog))
 Check (@(Find-ZombiePlayers).Count -eq 0) 'slow starting Player (76 s) flagged'
 # even past 120 s a Player still in the start phase is not a zombie
 $script:procs=@((Fake 44556 600 1 0.1 $false $startLog))
 Check (@(Find-ZombiePlayers).Count -eq 0) 'Player stuck in start phase flagged as zombie'
 # shutdown log but CPU still moving -> not a zombie
 $script:procs=@((Fake 7 600 40 30 $true $shutdownLog))
 Check (@(Find-ZombiePlayers).Count -eq 0) 'Player still exiting with CPU flagged'
 # no log path -> not a zombie
 $script:procs=@((Fake 8 600 1 1 $false (Join-Path $dir 'missing.log')))
 Check (@(Find-ZombiePlayers).Count -eq 0) 'Player without readable log flagged'
 # disk wait: busy (idle 0) then idle >= 50 for 10 samples -> start, recording the counters
 $script:disk=@(0,0,5,80,90,95,96,97,98,99,99,99,99,99);$script:di=0
 $w=Wait-DiskIdle 'I:\EXODUSER-Storage\x\EXODUSER-Unity.exe' 600
 Check ($w.measured -and -not $w.timedOut -and $w.idleAtStart -ge 50 -and $w.drive -eq 'I:') ('disk wait result wrong: '+($w|ConvertTo-Json -Compress))
 Check ($script:di -ge 13) 'disk wait started before 10 idle seconds'
 # disk never idle -> stop waiting at the limit and start with a warning
 $script:disk=@(0);$script:di=0
 $w=Wait-DiskIdle 'I:\EXODUSER-Storage\x\EXODUSER-Unity.exe' 0
 Check ($w.timedOut -and $w.idleAtStart -eq 0) 'disk wait limit not applied'
 'PASS: '+$n+' zombie/disk-wait decisions; Unity launches=0'
} finally {
 if((Test-Path $dir) -and [IO.Path]::GetFullPath($dir).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-zombie2\fixture-')){Remove-Item -LiteralPath $dir -Recurse -Force}
}

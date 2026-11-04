$ErrorActionPreference='Stop'
# 11-04: a vfx-summon Player queued before HALT was created started at 13:23 anyway, because HALT was only checked when the
# command began. Every wait loop must refuse to start (exit 3) when HALT appears, and `build` must be gated. Unity launches=0.
$source=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../exo-unity.ps1'))
$base='I:\EXODUSER-Storage\devtools\fix-1104-haltwait'
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
$child=@'
param($source,$root,$mode)  # not $kind: PowerShell names are case-insensitive and the exo $Kind below would overwrite it
$ErrorActionPreference='Stop'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$Root=$root;$QueueRoot=Join-Path $Root 'queue';$LockPath=Join-Path $Root '_pc_lock.json';$HaltPath=Join-Path $Root 'HALT';$ExclusivePath=Join-Path $Root '_player_exclusive.json';$Tickets=Join-Path $Root '_tickets'
$Utf8NoBom=New-Object Text.UTF8Encoding($false);$MaxPlayerSlots=2;$ExoUnityVersion='selftest'
$Owner='vfx-summon';$Kind='player';$Worktree='fixture';$TtlMin=120;$Note='test';$WaitMin=5;$PollSec=0;$KeepReservation=$false;$Exclusive=$false;$PcException='candidate'
function Say($m){}
function Get-CommitFreeGB {return 30}
$script:sleeps=0
function Start-Sleep { param($Seconds,$Milliseconds) $script:sleeps++; if($script:sleeps -eq 2){ [IO.File]::WriteAllText($HaltPath,'{"cause":"selftest"}') } }
try {
 # editor: HALT already there when the wait loop starts (the lock fixture may be taken as stale on the first pass)
 if($mode -eq 'player'){ Acquire-PlayerSlot 'summon.exe' $PID } else { [IO.File]::WriteAllText($HaltPath,'{}'); Acquire-Slot 'devtools-runner' 'fixture' $PID (Join-Path $Root 'q') }
 'STARTED'
} finally { if($script:PlayerSlotPath -and (Test-Path $script:PlayerSlotPath)){ 'SLOT-LEFT' } ; 'FINALLY' }
'@
$childPath=Join-Path $base 'halt-wait-child.ps1'
New-Item -ItemType Directory -Force -Path $base | Out-Null
[IO.File]::WriteAllText($childPath,$child,(New-Object Text.UTF8Encoding($true)))
function Run-Case($kind){
 $root=Join-Path $base ('fixture-'+[guid]::NewGuid().ToString('N'));New-Item -ItemType Directory -Force -Path $root | Out-Null
 $u=New-Object Text.UTF8Encoding($false)
 if($kind -eq 'player'){ foreach($i in 1,2){[IO.File]::WriteAllText((Join-Path $root ('_player_slot_'+$i+'.json')),('{"owner":"devtools-player","pid":'+$PID+',"exe":"other.exe","startedAt":"'+[DateTime]::UtcNow.ToString('o')+'","token":"t'+$i+'","reservedAs":"lane'+$i+'"}'),$u)} }
 else { [IO.File]::WriteAllText((Join-Path $root '_pc_lock.json'),('{"owner":"devtools-runner","pid":'+$PID+',"worktree":"other","startedAt":"'+[DateTime]::UtcNow.ToString('o')+'","token":"x"}'),$u) }
 $out=& "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $childPath $source $root $kind 2>&1 | ForEach-Object { [string]$_ }
 $rc=$LASTEXITCODE
 if([IO.Path]::GetFullPath($root).StartsWith($base+'\fixture-')){Remove-Item -LiteralPath $root -Recurse -Force}
 return [pscustomobject]@{rc=$rc;out=($out -join "`n")}
}
try {
 $p=Run-Case 'player'
 Check ($p.rc -eq 3) ('Player wait did not refuse with exit 3: rc='+$p.rc+' '+$p.out)
 Check ($p.out -notmatch 'STARTED' -and $p.out -match 'FINALLY' -and $p.out -notmatch 'SLOT-LEFT') ('Player started or cleanup skipped: '+$p.out)
 $e=Run-Case 'editor'
 Check ($e.rc -eq 3 -and $e.out -notmatch 'STARTED') ('Editor lock wait did not refuse with exit 3: rc='+$e.rc+' '+$e.out)
 $text=[IO.File]::ReadAllText($source)
 Check ($text -match "'start', 'run', 'build', 'player', 'browser'") 'build missing from the HALT gate'
 'PASS: '+$n+' HALT-while-waiting decisions; Unity launches=0'
} finally { Remove-Item -LiteralPath $childPath -Force -ErrorAction SilentlyContinue }

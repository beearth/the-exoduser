$ErrorActionPreference='Stop'
# 11-04 CTO: when a Player has to be killed, the receipt keeps thread wait reasons, GameInput service state and whether the kill
# worked, so the kill-proof layer can be counted apart. Uses a harmless ping as the timed-out child. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Say($m){}
$WatchNames=@('EXODUSER-selftest-none');$script:PlayerAdmissionHandle=$null
$dir=Join-Path 'I:\EXODUSER-Storage\devtools\fix-1104-stall' ('fixture-'+[guid]::NewGuid().ToString('N'));New-Item -ItemType Directory -Force -Path $dir|Out-Null
$log=Join-Path $dir 'player.log';[IO.File]::WriteAllText($log,"Mono path[0] = x`nInput System module state changed to: Shutdown.`n")
try {
 $snap=Get-StallSnapshot $PID
 Check ($snap.threads -gt 0 -and $snap.waitReasons.Count -gt 0) 'thread wait reasons not read'
 Check (@($snap.services | Where-Object name -eq 'GameInputRedistService').Count -le 1) 'service rows malformed'
 $g=Invoke-Guarded "$env:SystemRoot\System32\PING.EXE" @('-n','60','127.0.0.1') $dir 2 0 @($log) $false
 Check ($g.timedOut -and $null -ne $g.stall) 'timeout did not record stall diagnostics'
 Check ($g.stall.before.threads -gt 0) 'stall snapshot before kill missing threads'
 Check ($g.stall.killedWithin15s -eq $true) 'kill result not recorded'
 Check ($g.stall.lastLogLine -like '*Shutdown.*') 'last log line not recorded'
 $ok=Invoke-Guarded "$env:SystemRoot\System32\cmd.exe" @('/c','exit','0') $dir 10 0 @() $false
 Check ($null -eq $ok.stall -and -not $ok.timedOut) 'normal exit carries stall diagnostics'
 'PASS: '+$n+' stall diagnostics decisions; Unity launches=0'
} finally {
 if((Test-Path $dir) -and [IO.Path]::GetFullPath($dir).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-stall\fixture-')){Remove-Item -LiteralPath $dir -Recurse -Force}
}

$ErrorActionPreference='Stop'
# 11-04 CTO: the user removed the HALT and reboots after today's work. A listed unkillable zombie (pid + start time) only warns;
# a Player whose parent exo-unity runner is alive is left to that runner; any other zombie still makes the HALT. Unity launches=0.
$source=Join-Path $PSScriptRoot '../exo-unity.ps1'
$tokens=$null;$errors=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors)
if($errors.Count){throw $errors[0]}
foreach($f in $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
$script:said=@();function Say($m){$script:said+=$m}
$script:halted=$null;function New-Halt($cause,$what,$logs,$t){$script:halted=$cause}
function Reject($m){throw ('REJECT '+$m)}
$Root=Join-Path 'I:/EXODUSER-Storage/devtools/fix-1104-zombieknown' ('fixture-'+[guid]::NewGuid().ToString('N'))
$ExecDir=Join-Path $Root '_exec';$Utf8NoBom=New-Object Text.UTF8Encoding($false);$ExoUnityVersion='selftest';$Exe='x.exe'
try {
 New-Item -ItemType Directory -Force -Path (Join-Path $ExecDir 'done')|Out-Null
 $me=[pscustomobject]@{pid=$PID;name='EXODUSER-Unity';threads=1;cpuSec=1}
 $start=(Get-Process -Id $PID).StartTime.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss')
 Check (-not (Test-ZombieKnown $me)) 'unlisted zombie known'
 Write-JsonAtomic (Get-ZombieKnownPath) ([ordered]@{zombies=@([ordered]@{pid=$PID;processStart=$start;note='t'})})
 Check (Test-ZombieKnown $me) 'listed zombie not known'
 Stop-ForZombies @($me) 'player'
 Check ($null -eq $script:halted) 'known zombie made a HALT'
 Check (@($script:said | Where-Object { $_ -like '*알려진 kill 불가 좀비*' }).Count -eq 1) 'known zombie not warned'
 Write-JsonAtomic (Get-ZombieKnownPath) ([ordered]@{zombies=@([ordered]@{pid=$PID;processStart='2000-01-01T00:00:00';note='reused pid'})})
 Check (-not (Test-ZombieKnown $me)) 'reused pid treated as known'
 $r=$null;try{Stop-ForZombies @($me) 'player'}catch{$r=$_.Exception.Message}
 Check ($script:halted -like '*재부팅 필요*' -and $r -like 'REJECT*') 'new zombie no longer makes the HALT'
 $body=$ast.Extent.Text
 Check ($body.Contains('$after = @($after | Where-Object { -not (Test-ZombieKnown $_) })')) 'post-run HALT still counts known zombies'
 Check ($body.Contains("return ([string]`$pp.CommandLine -match 'exo-unity\.ps1')")) 'managed rule missing'
 'PASS: '+$n+' zombie-known decisions; Unity launches=0'
} finally {
 if((Test-Path $Root) -and [IO.Path]::GetFullPath($Root).StartsWith('I:\EXODUSER-Storage\devtools\fix-1104-zombieknown\fixture-')){Remove-Item -LiteralPath $Root -Recurse -Force}
}

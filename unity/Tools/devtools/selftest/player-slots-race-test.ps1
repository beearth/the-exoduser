$ErrorActionPreference='Stop'
$base='I:/EXODUSER-Storage/devtools/fix-1103-slots'
$fixture=Join-Path $base ('race-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture|Out-Null
$source=(Resolve-Path (Join-Path $PSScriptRoot '../exo-unity.ps1')).Path
$utf8=New-Object Text.UTF8Encoding($true)
$child=Join-Path $fixture 'contender.ps1'
[IO.File]::WriteAllText($child,@'
param($source,$rootDir,$identity)
$ErrorActionPreference='Stop'
$t=$null;$e=$null;$ast=[Management.Automation.Language.Parser]::ParseFile($source,[ref]$t,[ref]$e)
foreach($f in $ast.FindAll({param($n)$n -is [Management.Automation.Language.FunctionDefinitionAst]},$true)){. ([scriptblock]::Create($f.Extent.Text))}
$Root=$rootDir;$LockPath=Join-Path $Root '_pc_lock.json';$QueueRoot=Join-Path $Root 'queue'
$Utf8NoBom=New-Object Text.UTF8Encoding($false);$MaxPlayerSlots=2;$ExoUnityVersion='2026.11.03-slots1'
$Owner=$identity;$WaitMin=-1;$PollSec=0
function Get-CommitFreeGB {return 30}
function Say($m){}
[IO.File]::WriteAllText((Join-Path $Root ($identity+'.ready')),'ready')
while(-not(Test-Path (Join-Path $Root 'go'))){Start-Sleep -Milliseconds 20}
try {
 Acquire-PlayerSlot 'fixture.exe' $PID
 [IO.File]::WriteAllText((Join-Path $Root ($identity+'.admitted')),$script:PlayerSlotToken)
 $holdUntil=(Get-Date).AddSeconds(30)
 while(-not(Test-Path (Join-Path $Root 'release')) -and (Get-Date) -lt $holdUntil){Start-Sleep -Milliseconds 20}
}catch{
 if($_.Exception.Message -notmatch 'Player .*초과'){throw}
 [IO.File]::WriteAllText((Join-Path $Root ($identity+'.blocked')),'blocked')
}finally{Release-PlayerSlot}
'@,$utf8)
try { foreach($legacy in 0,1){
 $wave=Join-Path $fixture ([string]$legacy);New-Item -ItemType Directory -Path $wave|Out-Null
 [IO.File]::WriteAllText((Join-Path $wave '_player_slot_1.json'),(@{owner='stale';pid=2147483646;startedAt=[datetime]::UtcNow.ToString('o');token='stale'}|ConvertTo-Json))
 if($legacy){[IO.File]::WriteAllText((Join-Path $wave '_pc_lock.json'),(@{owner='devtools-player';pid=$PID;startedAt=[datetime]::UtcNow.ToString('o')}|ConvertTo-Json))}
 $procs=@();foreach($i in 1..4){
  $pr=Start-Process -FilePath "$env:SystemRoot/System32/WindowsPowerShell/v1.0/powershell.exe" -WindowStyle Hidden -PassThru -ArgumentList @('-NoProfile','-NonInteractive','-File',$child,$source,$wave,('p'+$i)) -RedirectStandardOutput (Join-Path $wave ($i.ToString()+'.out')) -RedirectStandardError (Join-Path $wave ($i.ToString()+'.err'))
  $null=$pr.Handle;$procs+=$pr
 }
 $until=(Get-Date).AddSeconds(20)
 while(@(Get-ChildItem $wave -Filter '*.ready').Count -lt 4){if((Get-Date) -gt $until){throw 'contender readiness timeout'};Start-Sleep -Milliseconds 50}
 [IO.File]::WriteAllText((Join-Path $wave 'go'),'go')
 while((@(Get-ChildItem $wave -Filter '*.admitted').Count+@(Get-ChildItem $wave -Filter '*.blocked').Count) -lt 4){if((Get-Date) -gt $until){throw 'contender decision timeout'};Start-Sleep -Milliseconds 50}
 $n=@(Get-ChildItem $wave -Filter '*.admitted').Count
 [IO.File]::WriteAllText((Join-Path $wave 'release'),'release')
 foreach($pr in $procs){$pr.WaitForExit();$pr.Refresh();if($pr.ExitCode -ne 0){throw 'contender subprocess failed'}}
 if($n -ne (2-$legacy)){throw ('atomic cap failed: legacy='+$legacy+' admitted='+$n)}
 if(@(Get-ChildItem $wave -Filter '_player_slot_*.json').Count){throw 'own slots not released'}
 Write-Output ('PASS: 4 real contenders, legacy='+$legacy+', admitted='+$n+', released=all')
} } finally {
 foreach($d in @(Get-ChildItem -LiteralPath $fixture -Directory)) { [IO.File]::WriteAllText((Join-Path $d.FullName 'release'),'release') }
 foreach($pr in $procs){$null=$pr.WaitForExit(5000)}
}
# 고유 I: fixture만 제거한다. 실패 영수증은 그대로 보존한다.
if(-not [IO.Path]::GetFullPath($fixture).StartsWith('I:\EXODUSER-Storage\devtools\fix-1103-slots\race-')){throw 'fixture outside allowed root'}
Remove-Item -LiteralPath $fixture -Recurse -Force

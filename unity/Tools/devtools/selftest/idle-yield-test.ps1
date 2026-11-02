$ErrorActionPreference='Stop'
$p=Join-Path $PSScriptRoot '../../..' # tests only, no Unity process
$policy=Join-Path $p 'Assets/Exoduser/Editor/DevTools/JobServer/IdleYieldPolicy.cs'
if(-not(Test-Path $policy)){throw 'FAIL: idle server has no self-yield policy'}
Add-Type -Path $policy
$n=0
foreach($c in @(@{kind='';want=$true},@{kind='editor';want=$true},@{kind='player';want=$false})){
 if([Exoduser.DevTools.IdleYieldPolicy]::IsEditorWaiter($c.kind) -ne $c.want){throw 'FAIL: player waiter causes editor idle yield'};$n++
}
foreach($c in @(
 @{state='idle';idle=179;waiters=@('other');want=$false},
 @{state='idle';idle=180;waiters=@('other');want=$true},
 @{state='idle';idle=500;waiters=@();want=$false},
 @{state='running';idle=500;waiters=@('other');want=$false},
 @{state='compiling';idle=500;waiters=@('other');want=$false},
 @{state='idle';idle=500;waiters=@('self');want=$false},
 @{state='idle';idle=180;waiters=@('self','other');want=$true}
)){
 $actual=[Exoduser.DevTools.IdleYieldPolicy]::ShouldYield($c.state,$c.idle,180,'self',[string[]]$c.waiters)
 if($actual -ne $c.want){throw ('FAIL: '+($c|ConvertTo-Json -Compress))};$n++
}
if(-not [Exoduser.DevTools.IdleYieldPolicy]::ShouldYield('idle',5,5,'self',[string[]]@('other'))){throw 'FAIL: configurable threshold'}
'PASS: '+($n+1)+' idle-yield decisions; Unity launches=0'

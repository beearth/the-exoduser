# Register only after unity/main integration. -WhatIf has no copy/registration side effects.
[CmdletBinding(SupportsShouldProcess=$true)]
param([ValidateRange(1,1440)][int]$Minutes=20,[switch]$Remove,[switch]$Status,[string]$TaskName='EXODUSER-Unity-BuildLoop')
$ErrorActionPreference='Stop'
$bin='I:\EXODUSER-Storage\unity-latest\loop\bin'
if($Status){Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue;return}
if($Remove){if($PSCmdlet.ShouldProcess($TaskName,'Unregister current-user build watch')){Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false};return}
$identity=[Security.Principal.WindowsIdentity]::GetCurrent().Name
$actionArgs='-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" run -Mode desktop' -f (Join-Path $bin 'buildloop.ps1')
$act=New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument $actionArgs -WorkingDirectory $bin
$trg=New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes $Minutes)
$set=New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 3) -StartWhenAvailable
$principal=New-ScheduledTaskPrincipal -UserId $identity -LogonType Interactive -RunLevel Limited
[pscustomobject]@{TaskName=$TaskName;User=$identity;RunLevel='Limited';LogonType='Interactive';EveryMinutes=$Minutes;Execute=$act.Execute;Arguments=$actionArgs;WorkingDirectory=$bin;MultipleInstances='IgnoreNew'} | Format-List
if($PSCmdlet.ShouldProcess($TaskName,'Register current-user build watch')){
 if(-not(Test-Path -LiteralPath (Join-Path $bin 'source.json'))){throw 'After merge, run buildloop.ps1 install from the integrated clean checkout first.'}
 if([IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') -ne $bin){throw 'Run registration from the installed loop/bin only.'}
 $source=Get-Content -LiteralPath (Join-Path $bin 'source.json') -Raw -Encoding UTF8 | ConvertFrom-Json
 & git.exe -C $source.worktree merge-base --is-ancestor $source.installedSource origin/unity/main
 if($LASTEXITCODE -ne 0){throw 'Installed source is not merged in origin/unity/main.'}
 Register-ScheduledTask -TaskName $TaskName -Action $act -Trigger $trg -Settings $set -Principal $principal -Description 'unity/main: hidden desktop smoke, safe build replacement' -Force | Out-Null
}

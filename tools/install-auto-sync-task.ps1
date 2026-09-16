$ErrorActionPreference = 'Stop'
$taskName = 'ExoduserAutoCleanup50'
$repoPath = Split-Path -Parent $PSScriptRoot
$nodePath = @('C:\nvm4w\nodejs\node.exe', 'G:\NODE.JS\node.exe') | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $nodePath) { throw 'A working Node.js executable is required.' }
$psExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$scriptPath = Join-Path $repoPath 'auto_commit.ps1'
$arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $scriptPath + '"'
$action = New-ScheduledTaskAction -Execute $psExe -Argument $arguments -WorkingDirectory $repoPath
$userId = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
$poll = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$logon = New-ScheduledTaskTrigger -AtLogOn -User $userId
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($poll,$logon) -Settings $settings -Principal $principal -Description 'Local checkpoint at 50 changed files, after 60 seconds idle and validation. No push or file deletion.' -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Get-ScheduledTask -TaskName $taskName | Select-Object TaskName,State

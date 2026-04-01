$taskName = "HellAutoSyncEvery3Hours"
$repoPath = "G:\hell"
$psExe = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$scriptPath = Join-Path $repoPath "auto_commit.ps1"
$taskRun = "`"$psExe`" -ExecutionPolicy Bypass -File `"$scriptPath`""

schtasks /Create /TN $taskName /SC HOURLY /MO 3 /TR $taskRun /F | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to register scheduled task: $taskName"
}

Write-Host "Installed scheduled task: $taskName"

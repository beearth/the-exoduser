param([string]$Method = 'Exoduser.Rm3SliceBuilder.All', [string]$Log = 'run1.log')
# RM-3 Unity batch run: no window, no sound. -batchmode without -nographics so the GPU RenderTexture capture works; Start-Process -WindowStyle Hidden; AudioListener.volume = 0 inside Capture/Fps.
# Takes the shared Unity lock (I:\EXODUSER-Storage\unity-jobs\_pc_lock.json) atomically before starting and removes it afterwards; waits while another job holds it.
$ErrorActionPreference = 'Stop'
$env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH = 'false'; $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'; $env:DOTNET_NOLOGO = '1'; $env:DOTNET_CLI_HOME = 'E:/exoduser-wt/_dotnet-home'
$out = 'I:/EXODUSER-Storage/rm3'
$lockPath = 'I:\EXODUSER-Storage\unity-jobs\_pc_lock.json'
$lockBody = (@{ startedAt = (Get-Date).ToString('s'); note = 'RM-3 slice build + capture + fps (batchmode, no window, no sound)'; pid = $PID; owner = 'rm-3'; worktree = 'E:\exoduser-wt\pc-unity-rm3' } | ConvertTo-Json)
$have = $false
for ($i = 0; $i -lt 360 -and -not $have; $i++) {
    try { $fs = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None); $b = [Text.Encoding]::UTF8.GetBytes($lockBody); $fs.Write($b, 0, $b.Length); $fs.Close(); $have = $true }
    catch [System.IO.IOException] { Start-Sleep -Seconds 10 }
}
if (-not $have) { Write-Output 'LOCK_TIMEOUT'; exit 2 }
try {
    $running = @(Get-Process -Name Unity -ErrorAction SilentlyContinue | Where-Object { -not $_.HasExited }).Count
    if ($running -gt 0) { Write-Output ('UNITY_RUNNING=' + $running); exit 3 }
    $args2 = @('-batchmode', '-quit', '-projectPath', 'E:/exoduser-wt/pc-unity-rm3/unity', '-executeMethod', $Method, '-logFile', ($out + '/' + $Log), '-outDir', ($out + '/cuts'), '-fpsOut', ($out + '/rm3_fps.json'))
    $p = Start-Process -FilePath 'G:\unity\Editor\6000.6.7f1\Editor\Unity.exe' -ArgumentList $args2 -PassThru -WindowStyle Hidden
    $p.WaitForExit(1500000) | Out-Null
    if (-not $p.HasExited) { Write-Output 'TIMEOUT'; } else { Write-Output ('exit=' + $p.ExitCode) }
}
finally { Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue }

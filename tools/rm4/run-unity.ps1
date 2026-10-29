# RM-4 Unity batch runner. Gate: refuses to start while any Unity editor / EXODUSER-Unity player is running (PC-wide one-at-a-time rule) or while the memory commit headroom is below 20 GB.
# Usage: powershell -File tools/rm4/run-unity.ps1 -Method Exoduser.Rm4SliceBuilder.Run -Log run1.log [-Extra "-outDir I:/EXODUSER-Storage/rm4/cuts -cuts start,heart,gate -capsule 1"]
param([string]$Method = 'Exoduser.Rm4SliceBuilder.Run', [string]$Log = 'run.log', [string]$Extra = '', [int]$TimeoutMs = 1500000)
$ErrorActionPreference = 'Stop'
$env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH = 'false'; $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'; $env:DOTNET_NOLOGO = '1'; $env:DOTNET_CLI_HOME = 'E:/exoduser-wt/_dotnet-home'
$proj = 'E:/exoduser-wt/pc-unity-rm4/unity'; $logDir = 'I:/EXODUSER-Storage/rm4/logs'; New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$busy = @(Get-Process -Name 'Unity', 'EXODUSER-Unity' -ErrorAction SilentlyContinue | Where-Object { -not $_.HasExited })
if ($busy.Count -gt 0) { Write-Output ('BUSY: ' + (($busy | ForEach-Object { $_.ProcessName + ':' + $_.Id }) -join ',')); exit 3 }
$c = (Get-Counter '\Memory\Committed Bytes', '\Memory\Commit Limit').CounterSamples; $free = ($c[1].CookedValue - $c[0].CookedValue) / 1GB
if ($free -lt 20) { Write-Output ('LOW COMMIT headroom GB=' + [math]::Round($free, 1)); exit 4 }
# PC-wide Unity lock (10-28 map lead rule): created atomically, removed when this run ends. An existing lock is never overwritten or deleted here (stale locks are cleaned by their owner / the tools lead).
$lockPath = 'I:/EXODUSER-Storage/unity-jobs/_pc_lock.json'; New-Item -ItemType Directory -Force -Path (Split-Path $lockPath) | Out-Null
try { $fs = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None) }
catch { Write-Output ('LOCKED: ' + (Get-Content -Raw $lockPath -ErrorAction SilentlyContinue)); exit 5 }
$lockJson = (@{ startedAt = (Get-Date -Format 's'); note = ('RM-4 ' + $Method + ' (batchmode, no window, no sound)'); pid = $PID; owner = 'rm-4'; worktree = 'E:\exoduser-wt\pc-unity-rm4' } | ConvertTo-Json)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($lockJson); $fs.Write($bytes, 0, $bytes.Length); $fs.Close()
$args2 = @('-batchmode', '-quit', '-projectPath', $proj, '-executeMethod', $Method, '-logFile', ($logDir + '/' + $Log))
if ($Extra) { $args2 += $Extra.Split(' ') }
try {
$p = Start-Process -FilePath 'G:\unity\Editor\6000.6.7f1\Editor\Unity.exe' -ArgumentList $args2 -PassThru -WindowStyle Hidden
$p.WaitForExit($TimeoutMs) | Out-Null
if (-not $p.HasExited) { Write-Output 'TIMEOUT (process left running: stop it before anything else)' } else { Write-Output ('exit=' + $p.ExitCode + ' hasExited=' + $p.HasExited) }
} finally {   # keep the lock while a timed-out Unity is still running
  if ($p -and $p.HasExited) { Remove-Item -LiteralPath $lockPath -ErrorAction SilentlyContinue }
  elseif (-not $p) { Remove-Item -LiteralPath $lockPath -ErrorAction SilentlyContinue }
}

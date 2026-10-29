# RM-2 P1 runner. One Unity process at a time, only when the PC has >= 20 GB commit headroom and no other Unity/EXODUSER-Unity is running (CTO rule 10-28).
# Usage (from E:/exoduser-wt/pc-unity-rm2): powershell -NoProfile -File tools/rm2/run-rm2.ps1 -Step Run      # builds RM2_Slice.unity + overlap/islands/navmesh/wedge/hero/render-bounds json
#                                                                                       -Step Cap      # start/repa/repb/repc 1600x900 with capsule + top overlay
#                                                                                       -Step Wedge    # capsule visibility test for every lump above 0.9u
#                                                                                       -Step Fps      # 3D on/off FPS at START
# No window, no sound: -batchmode without -nographics (GPU RenderTexture capture), Start-Process -WindowStyle Hidden, AudioListener.volume = 0 inside every Rm2SliceBuilder entry point. No -popupwindow / fullscreen / second monitor.
# Takes the shared Unity lock (I:\EXODUSER-Storage\unity-jobs\_pc_lock.json) atomically before starting (CreateNew; a lock whose pid is dead is stale and replaced) and removes it afterwards; exits 2 while another job holds it.
param([ValidateSet('Run','Cap','Wedge','Fps')][string]$Step = 'Run', [string]$LibrarySource = 'E:/exoduser-wt/pc-unity-rm1/unity/Library')
$ErrorActionPreference = 'Stop'
$proj = 'E:/exoduser-wt/pc-unity-rm2/unity'; $out = 'I:/EXODUSER-Storage/rm2'; New-Item -ItemType Directory -Force -Path $out | Out-Null
$lockPath = 'I:\EXODUSER-Storage\unity-jobs\_pc_lock.json'
$lockBody = (@{ startedAt = (Get-Date).ToString('s'); note = ('RM-2 slice ' + $Step + ' (batchmode, no window, no sound)'); pid = $PID; owner = 'rm-2'; worktree = 'E:\exoduser-wt\pc-unity-rm2' } | ConvertTo-Json)
function Try-Lock {
    try { $fs = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None); $b = [Text.Encoding]::UTF8.GetBytes($lockBody); $fs.Write($b, 0, $b.Length); $fs.Close(); return $true }
    catch [System.IO.IOException] { return $false }
}
$have = Try-Lock
if (-not $have -and (Test-Path $lockPath)) {
    # stale = the pid recorded in the lock no longer runs
    try { $old = Get-Content -LiteralPath $lockPath -Raw | ConvertFrom-Json; if ($old.pid -and -not (Get-Process -Id ([int]$old.pid) -ErrorAction SilentlyContinue)) { Remove-Item -LiteralPath $lockPath -Force; $have = Try-Lock } } catch { }
}
if (-not $have) { Write-Output 'WAIT: Unity lock held by another job (_pc_lock.json)'; exit 2 }
try {
    $busy = Get-Process EXODUSER-Unity, Unity -ErrorAction SilentlyContinue | Where-Object { -not $_.HasExited }
    if ($busy) { Write-Output ('WAIT: Unity already running (' + (($busy | ForEach-Object { $_.Id }) -join ',') + ')'); exit 2 }
    $c = Get-Counter '\Memory\Committed Bytes', '\Memory\Commit Limit'; $v = @{}; foreach ($s in $c.CounterSamples) { $v[$s.Path.Split('\')[-1]] = $s.CookedValue }
    $free = ($v['commit limit'] - $v['committed bytes']) / 1GB
    $need = 20; if (-not (Test-Path "$proj/Library") -and -not (Test-Path $LibrarySource)) { $need = 30 }   # no Library to copy from RM-1 = full import
    if ($free -lt $need) { Write-Output ('WAIT: commit headroom {0:N1} GB < {1} GB' -f $free, $need); exit 3 }
    $env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH = 'false'; $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'; $env:DOTNET_NOLOGO = '1'; $env:DOTNET_CLI_HOME = 'E:/exoduser-wt/_dotnet-home'
    if (-not (Test-Path "$proj/Library") -and (Test-Path $LibrarySource)) { robocopy $LibrarySource "$proj/Library" /E /XJ /NFL /NDL /NJH /NJS /NP | Out-Null }
    $node = 'C:\nvm4w\nodejs\node.exe'
    foreach ($s in 'restore-lobby-media.cjs', 'restore-warrior-story.cjs') { & $node "$proj/Tools/$s" --project $proj | Out-Null }
    $method = switch ($Step) { 'Run' { 'Exoduser.Rm2SliceBuilder.Run' } 'Cap' { 'Exoduser.Rm2SliceBuilder.Capture' } 'Wedge' { 'Exoduser.Rm2SliceBuilder.Wedge' } 'Fps' { 'Exoduser.Rm2SliceBuilder.Fps' } }
    $a = @('-batchmode', '-quit', '-projectPath', $proj, '-executeMethod', $method, '-logFile', "$out/unity_$Step.log")
    if ($Step -eq 'Cap') { $a += @('-outDir', "$out/cuts", '-cuts', 'start,repa,repb,repc,top', '-capsule', '1') }
    if ($Step -eq 'Wedge') { $a += @('-outDir', "$out/wedge") }
    if ($Step -eq 'Fps') { $a += @('-out', "$out/rm2_fps.json") }
    $p = Start-Process -FilePath 'G:\unity\Editor\6000.6.7f1\Editor\Unity.exe' -ArgumentList $a -PassThru -WindowStyle Hidden
    $p.WaitForExit(1500000) | Out-Null
    if (-not $p.HasExited) { Stop-Process -Id $p.Id -Force; Write-Output 'TIMEOUT (killed)' } else { Write-Output ('exit=' + $p.ExitCode) }
    Start-Sleep 3; $left = Get-Process Unity -ErrorAction SilentlyContinue | Where-Object { -not $_.HasExited }
    if ($left) { Write-Output ('STILL RUNNING: ' + (($left | ForEach-Object { $_.Id }) -join ',')) } else { Write-Output 'unity process ended' }
}
finally { Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue }

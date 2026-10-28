# 시험용(조사): 보이지 않는 별도 Windows 데스크톱(CreateDesktop + STARTUPINFO.lpDesktop)에서 플레이어를 batchmode 없이 띄운다.
# 확인: D3D12 렌더·Present, OnGUI 호출(guiRepaints), ScreenCapture 에 UI 가 찍히는지, 소리(--unity-mute), 포커스 일시정지, 사용자 데스크톱 MainWindowHandle=0.
# 잠금(_pc_lock.json)을 직접 잡고, Unity/플레이어 0개를 확인한 뒤에만 실행한다. 끝나면 프로세스 종료·데스크톱 핸들 닫기·잠금 삭제.
# 사용: powershell -NoProfile -ExecutionPolicy Bypass -File desktop-probe.ps1 -BuildDir I:\EXODUSER-Storage\unity-latest\build_new -Out I:\EXODUSER-Storage\devtools\dt15\desktop-probe
param(
  [string]$BuildDir = 'I:\EXODUSER-Storage\unity-latest\build_new',
  [string]$Out = 'I:\EXODUSER-Storage\devtools\dt15\desktop-probe',
  [string]$Flag = '--unity-m1-check',
  [int]$TimeoutSec = 300
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$lockFile = 'I:\EXODUSER-Storage\unity-jobs\_pc_lock.json'
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Text; using System.Collections.Generic;
public static class HD {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Unicode)] public static extern IntPtr CreateDesktop(string name, IntPtr dev, IntPtr devmode, int flags, uint access, IntPtr sa);
  [DllImport("user32.dll")] public static extern bool CloseDesktop(IntPtr h);
  [DllImport("user32.dll")] public static extern bool EnumDesktopWindows(IntPtr hDesk, EnumProc p, IntPtr l);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("kernel32.dll", SetLastError=true, CharSet=CharSet.Unicode)] public static extern bool CreateProcess(string app, StringBuilder cmd, IntPtr pa, IntPtr ta, bool inherit, uint flags, IntPtr env, string cwd, ref STARTUPINFO si, out PROCESS_INFORMATION pi);
  [DllImport("kernel32.dll")] public static extern uint WaitForSingleObject(IntPtr h, uint ms);
  [DllImport("kernel32.dll")] public static extern bool GetExitCodeProcess(IntPtr h, out uint code);
  [DllImport("kernel32.dll")] public static extern bool TerminateProcess(IntPtr h, uint code);
  [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr h);
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] public struct STARTUPINFO { public int cb; public string lpReserved; public string lpDesktop; public string lpTitle; public int dwX, dwY, dwXSize, dwYSize, dwXCountChars, dwYCountChars, dwFillAttribute, dwFlags; public short wShowWindow, cbReserved2; public IntPtr lpReserved2, hStdInput, hStdOutput, hStdError; }
  [StructLayout(LayoutKind.Sequential)] public struct PROCESS_INFORMATION { public IntPtr hProcess, hThread; public int dwProcessId, dwThreadId; }
  public static string[] Windows(IntPtr desk) {
    var l = new List<string>();
    EnumDesktopWindows(desk, delegate(IntPtr h, IntPtr p) { var sb = new StringBuilder(256); GetWindowText(h, sb, 256); l.Add((IsWindowVisible(h) ? "V " : "H ") + sb.ToString()); return true; }, IntPtr.Zero);
    return l.ToArray();
  }
}
'@
$exe = Join-Path $BuildDir 'EXODUSER-Unity.exe'
if (-not (Test-Path -LiteralPath $exe)) { throw "플레이어가 없다: $exe" }
New-Item -ItemType Directory -Force -Path $Out | Out-Null
# 잠금
$deadline = (Get-Date).AddMinutes(60); $got = $false
while ($true) {
  try {
    $fs = [IO.File]::Open($lockFile, 'CreateNew', 'Write', 'None')
    $body = @{ owner = 'devtools-buildloop'; pid = $PID; worktree = 'desktop-probe'; startedAt = (Get-Date).ToString('s'); note = 'DT-15 hidden desktop probe' } | ConvertTo-Json
    $b = [Text.Encoding]::UTF8.GetBytes($body); $fs.Write($b, 0, $b.Length); $fs.Close(); $got = $true; break
  } catch [IO.IOException] {
    $h = $null; try { $h = Get-Content -LiteralPath $lockFile -Raw | ConvertFrom-Json } catch { }
    if ($null -ne $h -and $h.pid -and -not (Get-Process -Id ([int]$h.pid) -ErrorAction SilentlyContinue)) { Remove-Item -LiteralPath $lockFile -Force -ErrorAction SilentlyContinue; continue }
    if ((Get-Date) -gt $deadline) { throw '잠금 대기 초과' }
    Write-Host ('잠금 보유 중: {0} - 30초 후 재시도' -f $h.owner); Start-Sleep -Seconds 30
  }
}
$desk = [IntPtr]::Zero; $pi = New-Object HD+PROCESS_INFORMATION; $result = [ordered]@{ startedAt = (Get-Date).ToString('s'); build = $BuildDir; flag = $Flag }
try {
  while (@(Get-Process Unity, EXODUSER-Unity -ErrorAction SilentlyContinue | Where-Object { -not $_.HasExited }).Count -gt 0) { Write-Host 'Unity/플레이어 대기'; Start-Sleep -Seconds 30 }
  $name = 'ExoProbe' + $PID
  $desk = [HD]::CreateDesktop($name, [IntPtr]::Zero, [IntPtr]::Zero, 0, 0x10000000, [IntPtr]::Zero)
  if ($desk -eq [IntPtr]::Zero) { throw ('CreateDesktop 실패 ' + [Runtime.InteropServices.Marshal]::GetLastWin32Error()) }
  $result.desktop = $name
  $sandbox = Join-Path $Out 'sandbox'; New-Item -ItemType Directory -Force -Path $sandbox | Out-Null
  $cmd = New-Object Text.StringBuilder ('"{0}" {1} --unity-mute --unity-qa-sandbox "{2}" -output "{3}" -screen-width 1600 -screen-height 900 -screen-fullscreen 0 -logFile "{4}"' -f $exe, $Flag, $sandbox, $Out, (Join-Path $Out 'player.log'))
  $si = New-Object HD+STARTUPINFO; $si.cb = [Runtime.InteropServices.Marshal]::SizeOf($si); $si.lpDesktop = 'WinSta0\' + $name
  $ok = [HD]::CreateProcess($null, $cmd, [IntPtr]::Zero, [IntPtr]::Zero, $false, 0, [IntPtr]::Zero, (Split-Path -Parent $exe), [ref]$si, [ref]$pi)
  if (-not $ok) { throw ('CreateProcess 실패 ' + [Runtime.InteropServices.Marshal]::GetLastWin32Error()) }
  $result.pid = $pi.dwProcessId
  $sw = [Diagnostics.Stopwatch]::StartNew(); $userWin = 0; $maxHidden = 0; $titles = @()
  while ([HD]::WaitForSingleObject($pi.hProcess, 2000) -eq 258) {
    $p = Get-Process -Id $pi.dwProcessId -ErrorAction SilentlyContinue
    if ($null -ne $p) { $p.Refresh(); if ($p.MainWindowHandle -ne [IntPtr]::Zero) { $userWin++ } }   # 사용자 데스크톱에서 보이는 창이면 0 이 아니다
    $w = [HD]::Windows($desk); if ($w.Count -gt $maxHidden) { $maxHidden = $w.Count; $titles = $w }
    if ($sw.Elapsed.TotalSeconds -gt $TimeoutSec) { [void][HD]::TerminateProcess($pi.hProcess, 99); $result.timedOut = $true; break }
  }
  [uint32]$code = 0; [void][HD]::GetExitCodeProcess($pi.hProcess, [ref]$code)
  $result.exit = [int]$code; $result.seconds = [int]$sw.Elapsed.TotalSeconds
  $result.userDesktopMainWindowHandleNonZeroSamples = $userWin
  $result.hiddenDesktopWindows = $maxHidden; $result.hiddenDesktopWindowTitles = $titles
} finally {
  if ($pi.hProcess -ne [IntPtr]::Zero) { [void][HD]::CloseHandle($pi.hProcess); [void][HD]::CloseHandle($pi.hThread) }
  Start-Sleep -Milliseconds 500
  if ($pi.dwProcessId) { Get-Process -Id $pi.dwProcessId -ErrorAction SilentlyContinue | Stop-Process -Force }
  if ($desk -ne [IntPtr]::Zero) { [void][HD]::CloseDesktop($desk); $result.desktopClosed = $true }
  if ($got) { try { $h = Get-Content -LiteralPath $lockFile -Raw | ConvertFrom-Json; if ($h.owner -eq 'devtools-buildloop' -and [int]$h.pid -eq $PID) { Remove-Item -LiteralPath $lockFile -Force } } catch { } }
  [IO.File]::WriteAllText((Join-Path $Out 'probe.json'), ($result | ConvertTo-Json -Depth 5), (New-Object Text.UTF8Encoding($false)))
}
$result | ConvertTo-Json -Depth 5

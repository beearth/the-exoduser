# PC-MAP3D stage-1 capture launcher: borderless 1920x1080 window moved to the right side monitor (5120,0) with SWP_NOACTIVATE,
# never always-on-top, killed after 240 seconds. Audio is muted inside the player (AudioListener.volume=0).
param([string]$Exe, [string]$Out, [string]$ExtraArgs = "")
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class WinMove {
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
}
"@
Add-Type -AssemblyName System.Windows.Forms
$screens = [System.Windows.Forms.Screen]::AllScreens | ForEach-Object { "$($_.DeviceName) $($_.Bounds) primary=$($_.Primary)" }
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$args = @("-popupwindow", "-screen-width", "1920", "-screen-height", "1080", "--unity-world3d-capture", $Out, "-logFile", (Join-Path $Out "player.log"))
if ($ExtraArgs) { $args += $ExtraArgs.Split(" ") }
$p = Start-Process -FilePath $Exe -ArgumentList $args -PassThru
$moved = $false; $rect = $null; $started = Get-Date
while (-not $p.HasExited -and ((Get-Date) - $started).TotalSeconds -lt 240) {
  $p.Refresh()
  if (-not $moved -and $p.MainWindowHandle -ne [IntPtr]::Zero) {
    # SWP_NOACTIVATE (0x10) | SWP_SHOWWINDOW (0x40); HWND_TOP (0) -> not topmost
    [void][WinMove]::SetWindowPos($p.MainWindowHandle, [IntPtr]::Zero, 5120, 0, 1920, 1080, 0x50)
    $r = New-Object WinMove+RECT; [void][WinMove]::GetWindowRect($p.MainWindowHandle, [ref]$r); $rect = "$($r.L),$($r.T),$($r.R),$($r.B)"; $moved = $true
  }
  Start-Sleep -Milliseconds 500
}
$killed = $false
if (-not $p.HasExited) { $killed = $true; Stop-Process -Id $p.Id -Force }
$elapsed = [int]((Get-Date) - $started).TotalSeconds
@{ screens = $screens; windowRectAfterMove = $rect; moved = $moved; killedAt240s = $killed; elapsedSeconds = $elapsed; exitCode = $(if ($p.HasExited) { $p.ExitCode } else { $null }) } | ConvertTo-Json | Set-Content (Join-Path $Out "launcher.json")
Get-Content (Join-Path $Out "launcher.json")

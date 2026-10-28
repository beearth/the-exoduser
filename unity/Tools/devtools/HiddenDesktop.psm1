# HiddenDesktop.psm1 - 보이지 않는 별도 Windows 데스크톱(CreateDesktop + STARTUPINFO.lpDesktop)에서 프로세스를 띄우는 공용 모듈
# exo-unity.ps1 player(-Desktop hidden)와 DT-15 buildloop/desktop-probe.ps1 이 함께 쓴다. PowerShell 5.1 호환.
# 사용:
#   Import-Module <이 파일> -Force
#   $d = New-HiddenDesktop
#   $p = Start-DesktopProcess -Desktop $d -CommandLine '"C:\x\game.exe" -logFile "C:\x\a.log"' -WorkingDirectory C:\x
#   ... Get-Process -Id $p.ProcessId / Get-DesktopWindows $d ...
#   Close-DesktopProcess $p; Close-HiddenDesktop $d
# 사용자 데스크톱에는 창이 생기지 않는다(Get-Process 의 MainWindowHandle 은 현재 데스크톱 기준이라 0 이다).

if (-not ('HD' -as [type])) {
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
}

function New-HiddenDesktop {
    param([string]$Name = ('ExoDesk' + $PID + '_' + [Guid]::NewGuid().ToString('N').Substring(0, 6)))
    $h = [HD]::CreateDesktop($Name, [IntPtr]::Zero, [IntPtr]::Zero, 0, 0x10000000, [IntPtr]::Zero)
    if ($h -eq [IntPtr]::Zero) { throw ('CreateDesktop 실패 ' + [Runtime.InteropServices.Marshal]::GetLastWin32Error()) }
    return [pscustomobject]@{ Name = $Name; Handle = $h; Closed = $false }
}

function Start-DesktopProcess {
    param($Desktop, [string]$CommandLine, [string]$WorkingDirectory)
    $cmd = New-Object Text.StringBuilder ($CommandLine)
    $si = New-Object HD+STARTUPINFO
    $si.cb = [Runtime.InteropServices.Marshal]::SizeOf($si)
    $si.lpDesktop = $Desktop.Name   # 현재 윈도우 스테이션의 데스크톱 이름(스테이션 접두어 없이)
    $pi = New-Object HD+PROCESS_INFORMATION
    $cwd = [NullString]::Value; if ($WorkingDirectory) { $cwd = $WorkingDirectory }   # PowerShell ? $null ??鍮?臾몄옄?대줈 ?섍린誘濡?NullString ???대떎(鍮?臾몄옄?댁씠硫?CreateProcess ?ㅻ쪟 3/123)
    $ok = [HD]::CreateProcess([NullString]::Value, $cmd, [IntPtr]::Zero, [IntPtr]::Zero, $false, 0, [IntPtr]::Zero, $cwd, [ref]$si, [ref]$pi)
    if (-not $ok) { throw ('CreateProcess 실패 ' + [Runtime.InteropServices.Marshal]::GetLastWin32Error()) }
    return [pscustomobject]@{ ProcessId = $pi.dwProcessId; hProcess = $pi.hProcess; hThread = $pi.hThread; Closed = $false }
}

function Get-DesktopWindows {
    param($Desktop)
    return @([HD]::Windows($Desktop.Handle))
}

function Wait-DesktopProcess {
    # 종료했으면 $true. TimeoutMs 안에 안 끝나면 $false
    param($Process, [int]$TimeoutMs = 2000)
    return ([HD]::WaitForSingleObject($Process.hProcess, [uint32]$TimeoutMs) -ne 258)
}

function Get-DesktopProcessExitCode {
    param($Process)
    [uint32]$code = 0
    [void][HD]::GetExitCodeProcess($Process.hProcess, [ref]$code)
    return [int]$code
}

function Stop-DesktopProcess {
    param($Process, [int]$ExitCode = 99)
    [void][HD]::TerminateProcess($Process.hProcess, [uint32]$ExitCode)
}

function Close-DesktopProcess {
    param($Process)
    if ($Process -and -not $Process.Closed) {
        [void][HD]::CloseHandle($Process.hProcess); [void][HD]::CloseHandle($Process.hThread)
        $Process.Closed = $true
    }
}

function Close-HiddenDesktop {
    param($Desktop)
    if ($Desktop -and -not $Desktop.Closed -and $Desktop.Handle -ne [IntPtr]::Zero) {
        [void][HD]::CloseDesktop($Desktop.Handle)
        $Desktop.Closed = $true
    }
    return ($Desktop -and $Desktop.Closed)
}

Export-ModuleMember -Function New-HiddenDesktop, Start-DesktopProcess, Get-DesktopWindows, Wait-DesktopProcess, Get-DesktopProcessExitCode, Stop-DesktopProcess, Close-DesktopProcess, Close-HiddenDesktop

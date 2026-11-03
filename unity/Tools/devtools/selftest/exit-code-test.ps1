$ErrorActionPreference='Stop'
# 11-04 r17: a hidden-desktop Player stopped from outside reports 0xFFFFFFFF. Get-DesktopProcessExitCode cast it with
# [int], threw "Value was either too large or too small for an Int32" and the final receipt was lost. Unity launches=0.
Import-Module (Join-Path $PSScriptRoot '../HiddenDesktop.psm1') -Force -DisableNameChecking
$n=0;function Check($c,$why){if(-not $c){throw ('FAIL: '+$why)};$script:n++}
function Exit-Of([int]$code){
 $si=New-Object Diagnostics.ProcessStartInfo((Join-Path $env:SystemRoot 'System32\cmd.exe'),('/c exit '+$code))
 $si.UseShellExecute=$false;$si.CreateNoWindow=$true
 $p=[Diagnostics.Process]::Start($si);$h=$p.Handle;$p.WaitForExit()
 try { return Get-DesktopProcessExitCode ([pscustomobject]@{hProcess=$h}) } finally { $p.Dispose() }
}
Check ((Exit-Of 0) -eq 0) 'exit 0'
Check ((Exit-Of 3) -eq 3) 'exit 3'
Check ((Exit-Of -1) -eq -1) 'exit 0xFFFFFFFF not read as -1'
Check ((Exit-Of -1073741510) -eq -1073741510) 'exit 0xC000013A (Ctrl+C) not read as signed'
'PASS: '+$n+' exit code conversions; Unity launches=0'

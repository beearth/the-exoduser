# buildloop.ps1 run 을 N분마다 부르는 포그라운드 루프. 끄려면 Ctrl+C.
# 사용: powershell -NoProfile -ExecutionPolicy Bypass -File watch.ps1 -Minutes 20 [-AllowKnown]
param([int]$Minutes = 20, [switch]$AllowKnown)
$ErrorActionPreference = 'Continue'
$loop = Join-Path $PSScriptRoot 'buildloop.ps1'
while ($true) {
  try {
    if ($AllowKnown) { & $loop run -AllowKnown } else { & $loop run }
  } catch { Write-Host ('[watch] 오류: ' + $_.Exception.Message) }
  Write-Host ('[watch] {0} - {1}분 후 다시 확인' -f (Get-Date -Format 'MM-dd HH:mm:ss'), $Minutes)
  Start-Sleep -Seconds ($Minutes * 60)
}

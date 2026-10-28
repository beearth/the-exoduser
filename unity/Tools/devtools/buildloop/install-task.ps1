# Windows 예약 작업 등록 스크립트. 만들기만 했고 실행하지 않았다(등록은 개발툴 총괄이 결정).
# 사용: powershell -NoProfile -ExecutionPolicy Bypass -File install-task.ps1 [-Minutes 30] [-Remove]
# 주의: 스크립트는 워크트리가 아니라 `buildloop.ps1 install` 로 복사한 loop\bin 에서 돌린다.
param([int]$Minutes = 30, [switch]$Remove, [string]$TaskName = 'EXODUSER-Unity-BuildLoop')
$bin = 'I:\EXODUSER-Storage\unity-latest\loop\bin'
if ($Remove) { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false; Write-Host "삭제: $TaskName"; return }
if (-not (Test-Path -LiteralPath (Join-Path $bin 'buildloop.ps1'))) { throw "먼저 buildloop.ps1 install 로 $bin 에 복사하세요." }
$act = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -ExecutionPolicy Bypass -File "{0}" run' -f (Join-Path $bin 'buildloop.ps1'))
$trg = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes $Minutes)
$set = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 3) -StartWhenAvailable
Register-ScheduledTask -TaskName $TaskName -Action $act -Trigger $trg -Settings $set -Description 'unity/main 새 커밋 빌드 + GPU 스모크 + 바로가기 빌드 교체' | Out-Null
Write-Host "등록: $TaskName ($Minutes 분마다). 데스크톱 세션이 있어야 스모크 창이 뜬다."

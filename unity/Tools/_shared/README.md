# 도구 경로 공용 헬퍼 후보 — K1 미완료

이 헬퍼는 아직 기존 러너에 연결되지 않았다. 회귀 검사가 두 번 실패하여 구현을 중단한 상태이며, 사용 가능한 이식성 기능으로 보장하지 않는다. 근거: `docs/0마스터플랜/worklog/cloud-lanes/K1-tools-portable_20261105.md`.

예정 사용 계약:

- .NET: `EXO_DOTNET` 실행 파일 → PATH의 dotnet → 기존 Windows 설치 경로.
- Python: `EXO_PYTHON` 실행 파일 → PATH의 python3 → PATH의 python → 기존 Windows 설치 경로.
- 찾지 못하면 `건너뜀(경로 없음)`을 출력한다. 건너뜀은 검사의 PASS 또는 결과 수를 뜻하지 않는다.
- `EXO_DOTNET_ROLLFORWARD=1`은 동기 실행 래퍼의 임시 global.json 정책만 `latestPatch`로 바꾸는 후보다. 원본 파일은 유지한다. 기본값에서는 기존 정책을 유지한다.
- 러너에서 `require('../_shared/toolpaths.cjs')`로 읽고 경로 탐색과 `spawnSync` 래퍼를 함께 사용하도록 설계했다. 실제 이식은 미실시다.

재개 시 첫 확인: Windows PATHEXT에서 반환된 `dotnet.EXE`와 fixture의 `dotnet.exe` 비교 계약. Python·SDK 임시 정책·정리·실제 .NET 실행은 이후 확인한다. 변경 전 기준은 combat-impact C#914/0, resource-oracle530/0이다. combat-impact 기존 `--pure`는 아트 검사도 실행하므로 별도 정리가 필요하다.

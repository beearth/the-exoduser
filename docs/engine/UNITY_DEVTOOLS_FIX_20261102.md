# 개발툴 미병합 통합 — 2026-11-02

| 입력 | 처리 |
|---|---|
| tools 94b8e6590 | Codex 래퍼·보수적 scan 추가, README의 현행 실행기 예시도 보존 |
| storage fe1bc518f | 현행 NTFS E: DOTNET_CLI_HOME 유지. 옛 I: 지정은 폐기 |
| batchlog 898f229e4 | 로그 없음/잠김에도 실패 영수증과 세이브 대조 보존 |
| buildloop3 0ea27c069 | desktop 기본화, requiredMedia title_motion_20261028.mp4, 현행 게임 코드 위에 병합 |

| 런타임 변경 | 값·범위 |
|---|---|
| M1 보스 앞 배치 | 11a Y+150, 12a/12b Y+420. 테스트 하네스 배치만 변경 |
| HUD 스모크 종료 | batchmode 또는 --unity-mute 자동 실행에서 Quit(0) |

빌드 감시 안전 계약과 사용법은 `unity/Tools/devtools/README.md`를 따른다. 이번 작업은 unity/main 직접 병합·예약 작업 등록·바로가기 교체를 하지 않는다. 실제 게이트 영수증과 한계는 `I:/EXODUSER-Storage/devtools/fix-1102/REPORT.md`에 기록한다.

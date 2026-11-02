# 개발툴 미병합 통합 — 2026-11-02

| 입력 | 처리 |
|---|---|
| tools 94b8e6590 | Codex 래퍼·보수적 scan 추가, README의 현행 실행기 예시도 보존 |
| storage fe1bc518f | 현행 NTFS E: DOTNET_CLI_HOME 유지. 옛 I: 지정은 폐기 |
| batchlog 898f229e4 | 로그 없음/잠김에도 실패 영수증과 세이브 대조 보존 |
| buildloop3 0ea27c069 | desktop 기본화, requiredMedia title_motion_20261028.mp4, 현행 게임 코드 위에 병합 |
| 후속 공통 줄기 9e771f771 | push 전 정상 merge. exo 최소 6GB의 d05c8b1ab 수정 원문 보존. buildloop 충돌은 최소 8GB·COMMON_RULES 권장 12/20GB 경고만으로 해결 |

| 런타임 변경 | 값·범위 |
|---|---|
| M1 보스 앞 배치 | 11a Y+150, 12a/12b Y+420. 테스트 하네스 배치만 변경 |
| HUD 스모크 종료 | batchmode 또는 --unity-mute 자동 실행에서 Quit(0) |

빌드 감시 안전 계약과 사용법은 `unity/Tools/devtools/README.md`를 따른다. 이번 작업은 unity/main 직접 병합·예약 작업 등록·바로가기 교체를 하지 않는다. 실제 게이트 영수증과 한계는 `I:/EXODUSER-Storage/devtools/fix-1102/REPORT.md`에 기록한다.

| 감시 변경 | 계약 |
|---|---|
| 실행·메모리 | exo-unity만 Unity/Player 실행. 기존 최소 6GB 불변, buildloop 최소 8GB. 권장 Library 있음 12GB/없음 20GB는 경고 |
| 출력·교체 | 본편 I:/EXODUSER-Storage/unity-latest/build만. build_prev_<sha>_<시각> 보관, 사용자 실행 중 pending, branch NoSwap은 pending도 교체하지 않음 |
| 메타데이터 | utc·branch·commit(full)·exe·exeSha256·buildRun·m1Run·previousBuild 갱신, custom/desktop 필드 유지, 구 검수 참조는 null |
| 실행 경로 | source checkout 또는 설치된 source.json의 NTFS 경로. clean unity/main·detached만 FF 갱신, 사용자 원본·lane WIP 수정 금지 |
| 감시 설치 | 병합 뒤 loop/bin, 사용자 Limited·Interactive, 20분, -WindowStyle Hidden -NonInteractive, IgnoreNew. WhatIf는 조회·계획만 |
| 보존 | 자동 prune·build_prev 삭제·강제 checkout 제거. 시험 패키지 보관, 실패 본편은 해당 run/failed-build로 이동해 다음 SHA 차단 방지. 바탕화면 lnk·인자 불변 |
| 필수 UI | 기존 M1 뒤 ui-overlap/check.ps1 -OverlapOnly 게이트 유지 |

이번 Roslyn 사전 검사에서 수집한 Core 114개·Runtime 207개 소스의 Player/Editor 정의 부분 컴파일은 오류 0이었다. Editor 55개 소스 검사에서 Rm4PoolLightCuller 참조 누락이 두 번 남아 사용자 재시도 제한에 따라 검수 게이트를 중단했다. 검사기가 `Remodel/Exoduser.Runtime.asmref`를 따라 Runtime 밖 Remodel/CH1_4 소스를 수집하지 않은 입력 문제이며 실제 Unity 컴파일 실패로 확정하지 않는다. 전체 컴파일·Unity 빌드·동일 빌드 M1·HUD 3장·guiRepaints·창 0·USER_SAVE 0은 미검증, MERGE_READY 아님.

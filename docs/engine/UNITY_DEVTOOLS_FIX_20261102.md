# 개발툴 미병합 통합 — 2026-11-02

| 입력 | 처리 |
|---|---|
| tools 94b8e6590 | Codex 래퍼·보수적 scan 추가, README의 현행 실행기 예시도 보존 |
| storage fe1bc518f | 현행 NTFS E: DOTNET_CLI_HOME 유지. 옛 I: 지정은 폐기 |
| batchlog 898f229e4 | 로그 없음/잠김에도 실패 영수증과 세이브 대조 보존 |
| buildloop3 0ea27c069 | desktop 기본화, requiredMedia title_motion_20261028.mp4(최소 1,000,000 bytes), 현행 게임 코드 위에 병합. smoke-rules는 CRLF→LF 서식만 정리하고 JSON 값 동일 검사 |
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

## fix2 — idle 양보·대기 판정·어셈블리 사전 검사

| 변경 | 수치·이름·동작 |
|---|---|
| idle 양보 | start -IdleYieldSec 기본 180초, 범위 1..86400. 서버 자신이 연속 idle + 다른 owner의 유효 예약/생존 티켓을 검사. job·컴파일·임포트·대기자 0·자기 예약만이면 상주 유지 |
| 안전 | 자기 PID/lock token 확인. admission.lock과 yielding.json으로 제출과 종료를 직렬화. 기존 stop 정상 Exit(0), PID 종료 전 PC 잠금 제거 없음. 다음 run은 기존 예약/FIFO의 1회 batch 대체. 타 서버 종료·재기동 없음 |
| 관측 | I:/EXODUSER-Storage/unity-jobs/yield.log 사건 1줄. server.json idleSec·idleYieldSec·waitingOthers·owner, status 양보 예정. 기존 구버전 서버 미적용 |
| buildloop 예약 | 대기 전 reserve -Owner buildloop, 실행기에도 같은 owner. WaitMin 기본 60분, 이번 게이트 90분. 만료=WaitMaxMin+BuildTimeoutMin(90)+30분, 회차 종료 시 자기 예약 반환 |
| WAIT | 예약/슬롯/티켓 대기 초과를 Unity 순번 대기 초과: 앞 owner로 기록. 실패 0·lastAttemptSha 유지·회색 배지. job 실행 후 컴파일/임포트 대기는 WAIT가 아님 |
| 사전 검사 | compile-check.ps1 + assembly-compile-check.cjs. asmdef·이름/GUID asmref의 최근접 경계로 소스 수집, 참조 순서/Player·Editor 분리, 결과·DLL은 I:. 미지원 defineConstraints는 오류로 표시 |
| 단위 시험 | 양보 8건, WAIT·상태 12건 및 실제 Cmd-Run의 예약→WAIT→영수증/이력→예약반환. asmdef·GUID asmref·중첩 경계·Editor/predefined 어셈블리 fixture. Unity 실행 없이 검사 |
| 검수 범위 | 사전 검사 1회: Player Core114/Runtime217, Editor Core114/Runtime217/Editor56 모두 오류0. 종료 경합 후속 수정은 정식 Unity 게이트에서 확인. 과거 Rm4PoolLightCuller 누락은 asmref 수집으로 해결 |

정식 게이트·단계표·HUD 캡처·원격 SHA·남은 한계는 I:/EXODUSER-Storage/devtools/fix-1102/fix2/REPORT.md에 기록한다. 브랜치 NoSwap으로 unity-latest와 바로가기는 교체하지 않는다.

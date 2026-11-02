# Unity 빌드 감시 — 2026-11-02

origin/unity/main 변경을 확인해 exo-unity Win 빌드 → 숨은 데스크톱 M1 → 기존 필수 UI 겹침 검사 → 판정 → build 교체를 수행한다. 예약 등록은 병합 뒤 총괄이 한다.

| 명령/옵션 | 계약 |
|---|---|
| buildloop.ps1 check / status | 원격 소스 대조 / 상태판 |
| buildloop.ps1 run -Force -Ref <branch> -Mode desktop | 브랜치 자체 시험, 자동 NoSwap. desktop 기본, batch는 명시적 대안 |
| -Worktree <소유 NTFS checkout> | 소스 실행 시 기본은 이 스크립트의 checkout. 설치본은 source.json의 통합 checkout |
| -WaitMin <분> | 기본 60, 예약·PC 슬롯 대기 예산을 exo에도 전달. fix2 브랜치 게이트는 90 |
| -OutputRoot <I: 경로> | 브랜치 시험은 별도 출력. 본편 교체는 unity-latest에서만 |
| buildloop.ps1 swap | 이전 PASS 후보 pending 재시도. NoSwap에서는 상태도 읽지 않음 |
| buildloop.ps1 install | 병합된 깨끗한 unity/main 또는 detached checkout만 loop/bin으로 복사하고 source.json 기록 |
| install-task.ps1 [-WhatIf] [-Status] [-Remove] | 사용자 Limited/Interactive, 20분, IgnoreNew, 숨김·NonInteractive. -WhatIf는 등록/설치 없이 계획만 출력 |
| watch.ps1 | 수동 호환 루프(20분). 예약 작업과 중복 실행하지 않음 |

실행 파일은 I:/EXODUSER-Storage/unity-latest/loop/bin/buildloop.ps1이다. 등록·해제 명령은 상위 README에 있다. 사용자의 로그인 세션에서만 숨은 데스크톱을 사용할 수 있다.

| 안전 경계 | 동작 |
|---|---|
| 메모리 | buildloop 최소 8GB; Library 있음 12GB/없음 20GB는 경고. exo 최소 6GB 불변 |
| 동시 실행 | buildloop run.lock 파일 핸들은 회차만 직렬화. PC Unity 슬롯·예약/FIFO·크래시 재시도·USER_SAVE·창/음소거 보호는 exo-unity 하나가 처리 |
| 소스 갱신 | 현재 HEAD가 대상이면 유지. 변경 있는 checkout/타 lane/비 FF는 거부. clean unity/main은 ff-only, clean detached는 정상 switch. 강제 checkout 없음 |
| 빌드 | exo-unity build, PortVerification.Build -remodel-scenes 1. 미디어 복원과 requiredMedia 검사는 유지 |
| 스모크 | exo-unity player -Desktop hidden -force-d3d11, 1600×900, OnGUI guiRepaints>0. --unity-mute·QA sandbox·사용자 창 0·잔여 프로세스 검사 |
| 판정 | 대기 전 reserve -Owner buildloop. 예약·PC 슬롯·티켓 대기 초과는 회색 WAIT(사유: Unity 순번 대기 초과: 앞 owner), 실패 0·lastAttemptSha 보존·다음 주기 재시도. 실제 job 실행 후 시간 초과/컴파일·빌드·로그·M1·사용자 세이브·필수 UI 검사 실패는 FAIL. 알려진 결함 KNOWN은 PASS가 아님. batch에서 HUD 없는 캡처는 UI 근거로 쓰지 않음 |
| 교체 | build만 교체. 이전 build는 build_prev_<이전 commit>_<시각>으로 영구 보존. 사용자 실행 중이면 pending, 다음 회차에 먼저 재시도하며 새 후보로 덮어쓰지 않음 |
| 메타데이터 | build-commit.json의 utc·branch·commit(full SHA)·exe·exeSha256·buildRun·m1Run·previousBuild 갱신. runtime/core DLL 해시 갱신, 구 패키지 검수 참조는 null. 기존 custom/desktop 필드 보존. 새 시각 판정은 미검증 |
| 바로가기 | .lnk 파일과 -force-d3d11 --remodel3d 인자는 읽기 대조만 하며 쓰지 않음 |
| 보관 | loop/runs/<id> 빌드/로그/캡처/run.json. 실패 본편은 같은 run의 failed-build로 옮겨 다음 SHA를 막지 않음. 브랜치 패키지와 과거 run 자동 삭제 없음 |

브랜치 시험 기본 출력은 I:/EXODUSER-Storage/devtools/branch-runs/<ref>이며 -OutputRoot로 별도 I: 경로를 지정할 수 있다. 본편 상태·build-commit·build·바로가기를 교체하지 않는다. 동일 실패는 원인 수정 후 한 번만 재시도한다. exo의 내부 crash retry도 같은 횟수에 포함한다.

회귀 검사: selftest/buildloop-contract-test.ps1은 I:의 고유 fixture에서 이전 build 보관·메타데이터 보존·사용자 실행 중 교체 보류·NoSwap pending 차단을 검사한다. 실제 Unity 빌드·Player·캡처 판정을 대신하지 않는다.

기존 UI 겹침 검사는 M1 후 ui-overlap/check.ps1 -OverlapOnly로 수행한다. 이 검사가 실패해도 임의 생략하거나 PASS로 바꾸지 않는다.

Roslyn 사전 검사: compile-check.ps1 -Output <I: 경로>. 기본 LibraryProject는 G:/exoduser-wt/codex-unity-parity-1102/unity의 기존 Bee RSP를 읽는다. 현재 작업본의 asmdef·asmref(이름/GUID)를 따라 소스를 배정하고 Core→Runtime→Editor 순서로 Player/Editor를 분리 컴파일한다. defineConstraints 등 미지원 입력은 성공으로 간주하지 않는다. result.json의 실제 DLL·종료코드를 확인하며 Unity 컴파일이 최종 판정이다.

빌드가 예약을 소비한 뒤 스모크 전 다른 Unity를 기다리는 경계에도 reserve -Owner buildloop를 먼저 수행한다. Unity 없는 실제 Cmd-Run 경계 시험으로 WAIT·lastAttemptSha 보존·완료 패키지 waiting-build 보관을 확인한다. 진행 중이던 bb2b0f619 게이트의 해당 경로는 대기자 0으로 통과했고, 이 보완은 도구 전용 후속 변경이다.

WAIT는 본편 lastAttemptSha를 보존하면서 lastAttemptVerdict만 WAIT로 기록한다. 같은 SHA가 과거 실패로 남아 있어도 다음 일반 주기는 WAIT를 재시도하며, check도 Force가 필요하다는 경고를 내지 않는다. 브랜치 NoSwap의 배포 attempt 상태는 계속 변경하지 않는다. 분류/상태 단위13건과 실제 동일 SHA 다음 주기 fixture로 확인한다.

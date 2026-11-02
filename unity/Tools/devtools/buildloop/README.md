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
| 메모리 | 빌드 준비 최소8GB, exo Editor 최소6GB. Library 있음12GB/없음20GB 권장 경고. Player 최소10GB |
| 동시 실행 | buildloop run.lock은 회차만 직렬화. Editor _pc_lock 1개와 Player 전용 슬롯 2개·종류별 FIFO·크래시·USER_SAVE·창/음소거 보호는 exo-unity가 처리 |
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

| UI 영수증 소비 계약 (2026-11-03) | 값·판정 |
|---|---|
| 작은 영수증 | ui-check/overlap/overlap-summary.json만 읽음. 허용 길이65,536B, 읽기/버퍼65,537B 이하(읽는 중 증가의 초과 탐지1B 포함), UTF-8 엄격 해독 |
| 엄격 스키마 | passed(bool), frameCount/issueCount(0..9,007,199,254,740,991의 JSON 정수), missing(문자열 배열) 정확4필드. 중복/추가 키·주석·끝 쉼표·타입 강제 변환 불허 |
| PASS | 검사 exit0 + passed=true + frameCount>0 + issueCount=0 + missing빈배열 + 상세 보고서 파일 경로 존재. 누락/읽기 실패/손상/잘못된 타입·음수/비정상exit는 FAIL |
| 상세 근거 | overlap-report.json은 경로와 존재 여부만 보존. 거대 본문을 읽거나 해시/파싱하지 않음. 겹침_검사.md·PNG 보존 |
| 규칙/회귀 | smoke-rules.uiOverlap의 receipt=summary, detailReport=상세경로, maxReceiptBytes=65536, maxIssues=0. selftest/buildloop-overlap-summary-test.ps1:48검증과 실제 Cmd-Run PASS/FAIL/누락/손상/비정상exit. 원본81B 요약의1395장·147건은 FAIL 유지 |

이번 소스 수정은 원본 ABORT run을 재작성하지 않으며 새 촬영·Unity/Player·빌드·GPU 실행 없이 검증한다. 설치본 반영은 정상 회차 종료·fingerprint/CAS 확인 후 별도 인수 단계다.

UI 호출은 `Invoke-UiOverlapCheck`가 숨긴 PowerShell 자식을 띄워 stdout을 `ui-overlap.log`, stderr를 `ui-overlap.err.log`로 직접 보존한다. PS5.1의 `& powershell ... *> log`가 예약 안내 stderr를 `NativeCommandError`로 바꾸어 EAP=Stop 부모를 ABORT시키던 경로를 분리했다. 전역 오류 정책은 Stop을 유지한다. 프로세스 핸들·실제 종료를 기다린 뒤 확인한 native exit만 요약 판정에 전달하며, 기동/종료값 확인 실패는 exit=null의 호출 ABORT로 남긴다. stderr 문구만으로 제품 FAIL을 만들거나 종료 코드를 합성하지 않는다. run.uiOverlap의 stderrLog/processId도 보존한다. selftest/ui-overlap-invocation-test.ps1은 같은 예약 문구+exit0/2·147FAIL·공백 경로·기동 실패·종료값 미확인24검증이며, 기존 엄격 요약48검증을 함께 유지한다.

Roslyn 사전 검사: compile-check.ps1 -Output <I: 경로>. 기본 LibraryProject는 G:/exoduser-wt/codex-unity-parity-1102/unity의 기존 Bee RSP를 읽는다. 현재 작업본의 asmdef·asmref(이름/GUID)를 따라 소스를 배정하고 Core→Runtime→Editor 순서로 Player/Editor를 분리 컴파일한다. defineConstraints 등 미지원 입력은 성공으로 간주하지 않는다. result.json의 실제 DLL·종료코드를 확인하며 Unity 컴파일이 최종 판정이다.

스모크 앞 reserve는 -Kind player다. Editor 사전 대기는 없고 Player 전용 슬롯·10GB·FIFO를 따른다. Get-BlockingUnityOwner는 종류에 맞는 앞 owner/slot을 읽는다. Player 슬롯 초과도 WAIT·lastAttemptSha 보존·waiting-build 보관으로 처리하며 실제 Cmd-Run fixture로 검사한다.
ABORT 회차가 만든 build_new는 그 회차 폴더 aborted-build로 보관한다. pending 없이 남은 build_new(이전 ABORT 고아)는 다음 회차가 orphan-build-before로 보관하고 진행한다(11-03 회차마다 ABORT 정체 수정). pending 후보·링크는 옮기지 않는다.

WAIT는 본편 lastAttemptSha를 보존하면서 lastAttemptVerdict만 WAIT로 기록한다. 같은 SHA가 과거 실패로 남아 있어도 다음 일반 주기는 WAIT를 재시도하며, check도 Force가 필요하다는 경고를 내지 않는다. 브랜치 NoSwap의 배포 attempt 상태는 계속 변경하지 않는다. 분류/상태 단위13건과 실제 동일 SHA 다음 주기 fixture로 확인한다.

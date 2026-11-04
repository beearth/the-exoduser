# Unity 빌드 감시 — 2026-11-02

origin/unity/main 변경을 확인해 exo-unity Win 빌드 → 숨은 데스크톱 M1 → 기존 필수 UI 겹침 검사 → 판정 → build 교체를 수행한다. 예약 등록은 병합 뒤 총괄이 한다.

| 명령/옵션 | 계약 |
|---|---|
| buildloop.ps1 check / status | 원격 소스 대조 / 상태판 |
| buildloop.ps1 run -Force -Ref <branch> -Mode desktop | 브랜치 자체 시험, 자동 NoSwap. desktop 기본, batch는 명시적 대안 |
| -Worktree <소유 NTFS checkout> | 소스 실행 시 기본은 이 스크립트의 checkout. 설치본은 source.json의 통합 checkout |
| -WaitMin <분> | 기본 60, 예약·PC 슬롯 대기 예산을 exo에도 전달. fix2 브랜치 게이트는 90 |
| -Gate3D off|trial|on | 11-04 CTO 데모=3D. 기본 trial: 관문 m1-check(2D 인자 그대로) 뒤 같은 build_new로 `--remodel3d` m1-check를 1회 더 돌려 run.json trial3d(ran·exit·timedOut·m1 ok/fail·firstBlocked·logFail·passed)와 로그 "3D 관문 시험(기록만)"에만 남긴다. 판정·교체·WAIT에 쓰지 않는다. on: 관문 스모크 자체를 `--remodel3d`로. PASS 확인 뒤 기본을 on으로 바꾸고 겹침 검사도 3D 인자로 맞춘다. 검사 selftest/buildloop-gate3d-test.ps1 |
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
빌드가 다시 쓰는 Unity 직렬화 추적 파일(unity/Assets·ProjectSettings 아래 .meta·.mat·.asset·.unity, 작업본 수정만)은 버리지 않고 남긴 채 진행한다. 새 커밋과 겹치는 파일이 하나라도 있으면 그 목록으로 중단한다(정리는 사용자 확인). INDEX 변경·그 밖의 파일 변경은 예전처럼 중단. 11-03 guid만 있는 .meta 824개·재질 29개·URP 설정·FirstPlayable.unity 재직렬화로 12:25부터 회차마다 중단된 일의 수정. 시험 selftest/buildloop-reserialize-test.ps1.
새 커밋이 바꾸는 파일의 작업본 사본(유지 중인 재직렬화·미추적)이 커밋 내용과 똑같으면 그 파일만 스테이징하고 갱신한다. git은 내용이 같아도 로컬 수정·미추적 파일이 있으면 fast-forward를 거부하기 때문이다(내용 손실 0). 내용이 다르면 아래 자동 폐기 규칙을 거친 뒤 남은 것만 목록과 함께 중단한다.

자동 폐기(11-04 사용자 "알아서 자동으로 버려"): 새 커밋과 내용이 다른 유지 파일 중 (a) HEAD와 공백만 다른 것(`git diff --ignore-all-space --ignore-blank-lines`), (b) HEAD가 fileFormatVersion·guid 두 줄뿐인 빈 .meta이고 작업본 guid가 같은 것만 버린다. 원본은 runs/<id>/discarded/<경로>에 해시 확인 후 복사하고 list.json에 사유를 남긴 뒤 `git restore --worktree`로 HEAD 판에 맞추고 fast-forward 한다(run.json autoDiscarded). 미추적·스테이징·값 차이·guid 차이·.meta/.mat/.asset/.unity 밖 파일은 예전처럼 중단한다. 11-03 밤 silver_hell meta 11개(공백만)·button_iron.png.meta(빈 meta를 같은 guid로 채움)로 회차마다 멈춘 일의 처리. 시험 selftest/buildloop-autodiscard-test.ps1.

배포 기록: Load-State가 build-commit.json(루프 형식 commit·utc, 수동 교체 형식 shaFull·at)을 읽어 state.json deployed와 커밋이 다르고 시각이 같거나 늦으면 deployed로 받아들인다(verdict EXTERNAL, runId=by, 로그 한 줄). CTO 수동 교체가 build-commit.json만 바꿔 상태판 '마지막 배포 빌드'가 틀리던 일의 수정.

WAIT는 본편 lastAttemptSha를 보존하면서 lastAttemptVerdict만 WAIT로 기록한다. 같은 SHA가 과거 실패로 남아 있어도 다음 일반 주기는 WAIT를 재시도하며, check도 Force가 필요하다는 경고를 내지 않는다. 브랜치 NoSwap의 배포 attempt 상태는 계속 변경하지 않는다. 분류/상태 단위13건과 실제 동일 SHA 다음 주기 fixture로 확인한다.


UI 겹침 래칫(11-04 CTO): 전 화면 UI 검사가 겹침을 내면 `unity/Tools/ui-overlap/known-filter.cjs`로 `known-overlaps.json`과 대조한다. 키는 출처 파일(줄 번호 제외)·겹친 두 문자열·화면·언어이고, 목록의 줄 번호는 참고용이다(무관한 수정으로 줄이 밀려도 같은 결함). 목록 밖 겹침이 하나라도 있으면 FAIL. 목록은 바탕화면 빌드에 이미 있던 결함만 담고(출처 줄 git blame이 그 빌드 이전), 건수는 state.uiKnownMin보다 늘 수 없다(래칫 위반 FAIL). 결과는 runs/<id>/ui-check/known-filter.json. 시험 selftest/buildloop-ui-known-test.ps1, ui-overlap/known-filter.test.cjs.

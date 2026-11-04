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

fix1 당시 검수(이전 기록): Roslyn 사전 검사에서 수집한 Core 114개·Runtime 207개 소스의 Player/Editor 정의 부분 컴파일은 오류 0이었다. Editor 55개 소스 검사에서 Rm4PoolLightCuller 참조 누락이 두 번 남아 사용자 재시도 제한에 따라 검수 게이트를 중단했다. 검사기가 `Remodel/Exoduser.Runtime.asmref`를 따라 Runtime 밖 Remodel/CH1_4 소스를 수집하지 않은 입력 문제이며 실제 Unity 컴파일 실패로 확정하지 않는다. 전체 컴파일·Unity 빌드·동일 빌드 M1·HUD 3장·guiRepaints·창 0·USER_SAVE 0은 미검증, MERGE_READY 아님.

## fix2 — idle 양보·대기 판정·어셈블리 사전 검사

| 변경 | 수치·이름·동작 |
|---|---|
| idle 양보 | start -IdleYieldSec 기본 180초, 범위 1..86400. 서버 자신이 연속 idle + 다른 owner의 editor 예약/생존 editor 티켓만 검사(kind 없음=editor). player는 제외. job·컴파일·임포트·대기자 0·자기 예약만이면 상주 유지 |
| 안전 | 자기 PID/lock token 확인. admission.lock과 yielding.json으로 제출과 종료를 직렬화. 기존 stop 정상 Exit(0), PID 종료 전 PC 잠금 제거 없음. 다음 run은 기존 예약/FIFO의 1회 batch 대체. 타 서버 종료·재기동 없음 |
| 관측 | I:/EXODUSER-Storage/unity-jobs/yield.log 사건 1줄. server.json idleSec·idleYieldSec·waitingOthers·owner, status 양보 예정. 기존 구버전 서버 미적용 |
| buildloop 예약 | 대기 전 reserve -Owner buildloop, 실행기에도 같은 owner. WaitMin 기본 60분, 이번 게이트 90분. 만료=WaitMaxMin+BuildTimeoutMin(90)+30분, 회차 종료 시 자기 예약 반환 |
| WAIT | 예약/슬롯/티켓 대기 초과를 Unity 순번 대기 초과: 앞 owner로 기록. 실패 0·lastAttemptSha 유지·회색 배지. job 실행 후 컴파일/임포트 대기는 WAIT가 아님 |
| 사전 검사 | compile-check.ps1 + assembly-compile-check.cjs. asmdef·이름/GUID asmref의 최근접 경계로 소스 수집, 참조 순서/Player·Editor 분리, 결과·DLL은 I:. 미지원 defineConstraints는 오류로 표시 |
| 단위 시험 | 양보 8건, WAIT·상태 13건 및 실제 Cmd-Run의 예약→WAIT→영수증/이력→예약반환. asmdef·GUID asmref·중첩 경계·Editor/predefined 어셈블리 fixture. Unity 실행 없이 검사 |
| 검수 범위 | 사전 검사 1회: Player Core114/Runtime217, Editor Core114/Runtime217/Editor56 모두 오류0. 종료 경합 후속 수정은 정식 Unity 게이트에서 확인. 과거 Rm4PoolLightCuller 누락은 asmref 수집으로 해결 |

정식 게이트·단계표·HUD 캡처·원격 SHA·남은 한계는 I:/EXODUSER-Storage/devtools/fix-1102/fix2/REPORT.md에 기록한다. 브랜치 NoSwap으로 unity-latest와 바로가기는 교체하지 않는다.

slots1부터 스모크 앞 reserve는 -Kind player이며 Editor가 끝나기를 기다리는 경계를 없앴다. 실행기의 Player FIFO·2슬롯·10GB 검사를 따른다. Unity 없는 실제 Cmd-Run fixture로 Player WAIT·lastAttemptSha 보존·waiting-build 보관을 확인한다. 과거 bb2b0f619 실행과 새 도구 검증은 구분한다.

WAIT는 본편 lastAttemptSha를 보존하면서 lastAttemptVerdict만 WAIT로 기록한다. 같은 SHA가 과거 실패로 남아 있어도 다음 일반 주기는 WAIT를 재시도하며, check도 Force가 필요하다는 경고를 내지 않는다. 브랜치 NoSwap의 배포 attempt 상태는 계속 변경하지 않는다. 분류/상태 단위13건과 실제 동일 SHA 다음 주기 fixture로 확인한다.

## fix2 정식 게이트 결과 — 2026-11-02 22:17 KST

| 항목 | 실제 근거·판정 |
|---|---|
| 실행 | 20261102-203736254_bb2b0f6, 20:37:36→22:17:46, -Mode desktop -WaitMin 90, 1회 |
| 입력 경계 | 빌드/실행기 입력 bb2b0f619. 후속 8ff21c0b6·94d375308은 도구/시험/docs만 변경, Assets·ProjectSettings Git tree 동일. 후속 경계는 Unity 없는 시험으로 확인; 수정된 감시 전체의 실게이트 재실행은 하지 않음 |
| 정식 컴파일·패키징 | 6000.6.7f1 Win64 Succeeded, errors0, exit0, 약9.6분, 6,450,820,809 bytes |
| 별도 빌드 로그 | shader-not-found 결함12 + 알려진 DBT-N1 17. Terrain AddPass/BaseMapGen 의존성 누락. 대기 오류로 생긴 FAIL 수와 구분하며 무시/재분류하지 않음 |
| 최종 판정 | WAIT: Unity 순번 대기 초과: unity-parity-third-1102. M1 앞 예약을 약90.5분 기다림. 대기 자체는 FAIL 아님; 이력 fail12는 위 빌드 로그 결함 |
| M1·GUI·캡처 | ran=false, m1-check.json 없음, guiRepaints 미측정, HUD 3장 미생성·미검증. 기대 단계23개는 fix2/M1_STAGE_STATUS.md의 미실행 표. 필수 UI 검사도 미실행 |
| 보호 | buildRunner USER_SAVE changed0; M1 보호/사용자 창0은 실행 증거 없음. 빌드 에디터 관측 창0, 별도 WAIT 상태판 브라우저 창0/잔여0. 자기 buildloop 예약 반환, replaced=false/NoSwap |
| 보존·후속 | 자기 Unity 파생 tracked851개 I: SHA 보존 후 Git 입력 복원. 출처가 확정되지 않은 untracked57개 유지. 새 서버 실양보 사건·M1/HUD·셰이더 로그 수정은 남음. READY 아님 |

상세 영수증·로그·미실행 캡처 경로·최종 원격 tip은 I:/EXODUSER-Storage/devtools/fix-1102/fix2/REPORT.md. 이번 브랜치는 unity/main·unity-latest 설치·예약 작업 등록을 하지 않았다.

## slots1 — Editor와 Player 분리 (2026-11-03)

| 항목·구현 | 현행 계약 |
|---|---|
| ExoUnityVersion | 2026.11.03-slots1. status 첫 줄·-Json runnerVersion·슬롯 파일에 기록 |
| Editor / Acquire-Slot | _pc_lock 1개, 다른 Unity.exe 0개, EXODUSER-Unity는 통과를 막지 않음. 최소6GB/buildloop8GB, 권장12/20GB 경고 유지 |
| Player / Acquire-PlayerSlot | MaxPlayerSlots=2, _player_slot_1.json·_player_slot_2.json CreateNew. owner·pid(실행기)·exe·startedAt·token·reservedAs·runnerVersion |
| 상한·stale | 생존 슬롯+생존 구버전 devtools-player lock 1개로 계산. 사용자 직접 Player는 제외. pid 사망/생성시각>startedAt이면 동일 token·pid·startedAt 재확인 후 회수. 생성시각 조회 실패는 보수적으로 유지 |
| 구버전 경쟁 | 구 Player가 있으면 후보 slot 파일도 1개로 제한하며 획득 후 상한·10GB·drain 재검사. _pc_lock/타인 프로세스 조작 없음 |
| 시작 인계 | _player_admission.guard의 배타 핸들을 슬롯 획득부터 실제 자식 생성까지 유지. 두 새 실행기와 구 실행기가 모두 Unity0을 보고 3개를 시작할 수 있는 경합 방지. 생성 뒤 즉시 반환, 실패/프로세스 종료 시 핸들 반환 |
| 예약 | reserve/unreserve -Kind editor 또는 player(기본editor). kind 없음=editor. 종류별 FIFO. 만료 예약은 읽기 제외, 타 담당 파일 삭제 안 함 |
| Player Owner | 자기 player 예약 자동 생성·완료/대기실패 뒤 반환. KeepReservation이면 유지. 실행 중 예약은 waiting FIFO 제외하여 두 번째 슬롯 진입 허용 |
| 굶주림 방지 | editor 선두 등록 후20분 이상 + _pc_lock 파일 없음이면 새 Player 통과 중단. status·대기 메시지에 owner 표시. Editor 획득/예약 반환·만료 뒤 재평가 |
| idle | IdleYieldPolicy.IsEditorWaiter로 editor 예약·티켓만 계산. 기본 idle180초 불변 |
| 보호·영수증 | 무창 hidden 기본·무음·GUID별 sandbox/log·PID+GUID desktop·USER_SAVE·HALT·자기 자손 정리 유지. Player receipt에 processId·startedAt·finishedAt·hiddenDesktopName·slot 추가 |
| buildloop | 스모크 -Kind player, Editor 사전 대기 제거. Player 슬롯 시간초과도 WAIT. Get-BlockingUnityOwner(kind)는 종류별 앞 예약/보유자 반환 |
| install-bin | ps1·psm1·cjs·mjs·json·md를 I:/EXODUSER-Storage/unity-jobs/bin에 복사, bin_prev_<UTC시각> 보관. 모듈은 PSScriptRoot, 프로젝트·미디어는 Worktree. 이번 작업에서 실행하지 않음 |
| 단위 | player-slots-test.ps1 35판정(실제 숨김 CMD 자식 생성·시작 인계 반환 포함), race-test stale 회수 포함 실제4경쟁자×2파형(신2/구1+신1), idle11, WAIT상태14+종류별 앞 owner·실제 Cmd-Run fixture. 나머지 기존 인자·티켓·로그·교체·그래픽·소스수집 회귀 포함 |
| 실제 2개 M1 | concurrent-20261103-010419014: 각각23/23, guiRepaints1145/1160, 창/USER_SAVE/잔여0. 실제 동시 생존 표본8개·23.252초 이상, 실행기 구간27.631초. sampled 커밋 여유 최저18.185GiB, 다른 Editor 빌드 job과도2.434초 겹침. HUD 각3장 직접 확인 |

실제 동시 M1·단계표·6개 HUD 직접 판정·커밋 여유·원격 tip·남은 문제는 I:/EXODUSER-Storage/devtools/fix-1103-slots/REPORT.md. fix2의 원본 run/smoke는 덮어쓰지 않는다. 최종 시작 인계·delete-pending 보완은 Unity 없는 자식 생성/경합 시험으로 검증했으며 M1 2회 제한 때문에 이후 Unity 재실행은 하지 않았다. 변경 C#의 정식 Unity 컴파일·새 빌드는 별도다.

## UI 요약 소비자 메모리 차단 수정 — 2026-11-03

| 항목 | 계약·근거 |
|---|---|
| 원인 | run20261103-025650441_09192f7의 상세 overlap-report.json 1,391,748,321B를 buildloop ReadJson이 전체 파싱하다 Insufficient memory ABORT. 원본 run/상세/PNG/겹침_검사.md 보존 |
| 소비자 | Read-UiOverlapSummary가 overlap-summary.json만 읽음. 허용65,536B·실제읽기/버퍼65,537B 이하(증가 탐지1B 포함), 엄격 UTF-8·4필드·중복/추가 키·주석/끝쉼표/잘못된 타입·음수 정수 거부. count 범위0..9,007,199,254,740,991 |
| 판정 | exit0 + passed=true + frameCount>0 + issueCount=0 + missing빈배열 + 상세 파일 경로 존재만 PASS. 요약 누락/손상/읽기불가·비정상exit는 FAIL. 상세는 경로/존재만 확인하고 본문 읽기·해시·파싱0 |
| 결과 필드 | run.uiOverlap에 passed·valid·exit·receipt·detailReport·maxReceiptBytes·bytes·frameCount·issueCount·missing·note·log. UI호출 후 stderrLog/processId 추가, 기동/종료값 미확인시 exit=null의 호출ABORT. smoke-rules receipt=요약, detailReport=상세, maxReceiptBytes=65536; maxIssues=0 유지 |
| 실제 재사용 | 원본81B {passed:false,frameCount:1395,issueCount:147,missing:[]}는 source-only 재판정에서도 FAIL. 원본ABORT/교체false를 수정하지 않음 |
| 시험 | selftest/buildloop-overlap-summary-test.ps1 RED→GREEN 48검증. 잠긴 상세 파일·ReadJson 상세 호출 금지, 실제 Cmd-Run의 FAIL147/PASS/손상/누락/비정상exit 및 replaced=false. WAIT/보관·NoSwap 회귀 PASS |
| 경계 | 본인 소스/시험/규칙/docs만 변경. 설치본·워처·task·타 소유자의 예약/프로세스·제품UI 변경0. 새Unity/Player/빌드/GPU/인코딩·1395재촬영0. M1 --remodel3d 누락은 별도 항목으로 유지 |

테스트 원문·입력/설치본 fingerprint·원격SHA·한국어 결과는 I:/EXODUSER-Storage/devtools/fix-1103-overlap-summary/REPORT.md. 설치 반영은 root 직접 인수 뒤 공식 경로·정상 회차 종료·CAS를 확인하는 별도 단계다.

root 인수 후 통합 경계(2026-11-03): 기존 private 브랜치에서 공통426544563dcd7068ac661a7ee7876fd91f69d19a를 정상 merge하고, 공통 대비 순변경은 위5경로만 유지한다. 공식 canonical G:/exoduser-wt/codex-buildloop는 unity/main09192f7bbc4650d9ba17408bf2de7cdd95c4f28d·INDEX0·기존미인수tracked WORK855개로 관측됐다. run.lock 비점유/task Ready/구09192회차03:44:26 ABORT 종료와 별개로 Cmd-Install의 clean-source 조건을 충족하지 못하므로 설치HOLD, WIP복원·대체작업본으로 우회 설치0이다. 실제 source/원격 SHA·회귀·bin/task/실게임 fingerprint·최종 경계는 I:/EXODUSER-Storage/devtools/fix-1103-overlap-install/REPORT.md에 기록한다.

## UI 호출 stderr 승격 ABORT 분리 — 2026-11-03

| 항목 | 근거·계약 |
|---|---|
| 새 원본 | 20261103-042553959_b6b9998는04:36:00 ABORT/replaced=false, build/smoke exit0, ui-overlap.log0B·새coverage없음. 원본 UI native exit는 기록되지 않아 미확인 |
| 원인 재현 | 설치1d89와 b6 모두 `& powershell ... *> uiLog` 호출을 사용. EAP=Stop인 PS5.1에서 `[exo-unity] 예약 추가: ui-overlap-check ()` stderr가 NativeCommandError/RemoteException으로 승격되어 종료값 대입 전에 중단. 이전09192의거대JSON/147FAIL과 별개 |
| 최소 변경 | Invoke-UiOverlapCheck의 Start-Process -WindowStyle Hidden, stdout/stderr 직접파일분리, handle·WaitForExit·Refresh 후 실제exit만 반환. 전역ErrorActionPreference 완화0, 기동/종료값미확인은호출ABORT+exit=null |
| 판정 | stderr만있고 exit0+정상요약이면 기존요약조건으로판정. exit2/147FAIL은계속FAIL. nativeexit 합성·실패삼키기·PASS조작0, 엄격4키/64KiB 계약불변 |
| 시험 | ui-overlap-invocation-test.ps1: 실제두구호출RED→GREEN24검증(공백경로·stderr보존·실native0/2·FAIL147·기동실패/종료값미확인). 기존요약48·WAIT·보관/NoSwap회귀 PASS. 실제UI/Player/GPU실행0 |

원본·오류stream·소스/설치대조·private SHA·한국어결과는 I:/EXODUSER-Storage/devtools/fix-1103-ui-invocation/REPORT.md. source candidate는 제품/설치 검증과 구분하며 원본run과0B로그·예약을 수정하지 않는다.


### 2026-11-03 CTO 위임 분기 수정

checkout exo-unity.ps1은 install-bin 및 EXO_UNITY_NO_FORWARD=1을 로컬 본문에 남긴다. 실제 공용 경로로 실행한 경우에도 재위임하지 않는다. 일반 호출은 Stop 설정 후 공용 bin Test-Path Leaf를 먼저 확인하고 누락 시 stderr와 exit1로 중단한 뒤, 존재할 때만 인수를 그대로 위임하고 exit 코드를 전달한다. tests/forwarding.test.ps1이 실제 스텁 블록을 추출해 격리된 가짜 bin으로 위임 인수/exit7, install-bin 로컬, opt-out 로컬, 자기 경로 로컬, 누락 exit1의5분기를 확인했다. 실제 install-bin·공용 bin 갱신·Unity 실행은 수행하지 않았다. Unity 실행은 계속 I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1만 사용한다.

## 2026-11-04 오후 병합본 계약 보충

대조 기준은 unity/main `3abbea79e`다. 아래는 저장소 소스 계약이며 bin 설치 상태·예약 작업 설정·실행본 갱신을 확인한 결과가 아니다. 앞 절의 11-03 시험·버전은 당시 이력으로 유지한다.

| 항목 | 병합된 값·범위 |
|---|---|
| 실행기 버전·우선권 | `2026.11.04-loopfirst`. `-PcException buildloop` Player만 player FIFO와 editor 굶주림 방지 drain을 건너뛴다. `cto-swap`·candidate에는 적용하지 않는다. 양수 `-WaitMin`이 180 미만일 때만 180분으로 올린다. 0·음수는 올리지 않는다 |
| 우선 대기 표식 | `_player_priority.json`의 pid·processStart로 생존·PID 재사용을 확인한다. 대기 중 일반 새 Player를 막고 입장·대기 종료 시 자기 표식만 반환한다. 돌고 있는 Player를 끊지 않으며 단독·슬롯·10GB 메모리·HALT·세이브 보호 조건은 유지한다 |
| BuildLoop `-Gate3D` | 허용값 off/trial/on, 기본 trial. off는 기존 관문만, trial은 기존 M1 종료0·판정 객체 생성 뒤 같은 빌드로 `--remodel3d` M1을 1회 더 실행해 `run.trial3d`에만 기록한다. trial 결과는 PASS/FAIL·WAIT·교체에 반영하지 않는다. on은 주 M1에 3D 인자를 붙인다. UI 겹침 검사까지 자동 3D로 바뀌었다는 뜻은 아니다 |
| M1 촬영 인자 | `-review-width <px>` 320..7680, `-review-height <px>` 240..4320. 누락·비정수·범위 밖은 축별 기본 1600×900. 무창 RenderTexture와 창 모드 SetResolution이 사용한다. batch에서는 같은 `-screen-width/-screen-height`를 함께 준다 |
| M1 영수증 | `captureWidth/captureHeight/screenWidth/screenHeight`. batch 화면 배치 크기가 촬영 크기와 다르면 `[M1] headless capture` 경고. 해상도 변경은 자연 플레이·UI 품질 통과의 증거가 아니다 |
| 소스 자체검사 | `selftest/loopfirst-test.ps1` Check 12개, `selftest/buildloop-gate3d-test.ps1` Check 8개. 기존 `buildloop-overlap-summary-test.ps1`·`ui-overlap-invocation-test.ps1`는 Apply-UiKnownList를 대체해 raw summary 계약을 검사한다. 개수는 소스 대조이며 이번 감사의 재실행 결과가 아니다 |
| 제외한 설치본 | grant·haltexempt는 이 기준의 저장소 실행기 옵션이 아니다. 설치본 전용 운영 이력을 저장소 구현으로 승격하지 않는다 |

구현: `unity/Tools/devtools/exo-unity.ps1`, `buildloop/buildloop.ps1`, `NativeReviewArgs.cs`·`NativeGame.M1Check.cs`. 상세 사용법은 `unity/Tools/devtools/README.md`·`buildloop/README.md`다. 감사에서 Unity 실행·설치·시험 재실행은 하지 않았다.

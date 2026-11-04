# Mac 로딩 원화·하단 오버레이 후보 — 2026-11-01 KST

PC R5 `0a60cbcee273e1150ba7df8909acb77dd9f18edc`에서 게임 구역 전환 화면에 필요한 자산·선택·그리기만 선별 이식한다. 첫 팁 Player의 PASS와 저장 게이트는 이 원화 후보의 시험 결과가 아니다.

| 항목 | 현행 구현 |
|---|---|
| 승인 ID | `01–12, 15, 16, 18, 19` = 16종. `ForStage(stage)`는 이 순서로 순환 |
| 자산 | ID별 `NN.png` 원본, `NN-16.png` 1920×1200, `NN-21.png` 2560×1080, `NN-32.png` 3840×1080. 총 PNG 64개와 대응 `.meta` 64개 |
| variant | `W/H > 2560/1080`이면 `-32`, 그렇지 않고 `W/H > 1920/1080`이면 `-21`, 나머지 `-16`. 경계는 낮은 쪽 |
| 좌표 | 중앙 안전영역 배율 `s=min(W/1920,H/1080)`, 원화와 하단의 확장 배율 `e=H/1080`, 논리 너비 `W/e`. 원화는 화면 cover |
| 누락 variant | 같은 ID 원본을 512px 폭 `LoadingBlur.shader` RenderTexture로 흐리게 하고 밝기 `.28` cover 배경과 contain 전경을 겹침. blur shader 누락 시 같은 원본을 어둡게 cover. 원본도 누락되면 검정 바탕과 상태 정보 표시 |
| 하단 | 그라데이션 높이 물리 `clamp(.22H,150,300)` px. 제목, 구역 detail, `clamp01(LoadT/35)` 진행선, 팁 순서. 제목 글자 크기 `round(clamp(.021H,16,26)/e)`, detail `round(clamp(.0135H,11,17)/e)`, 하단 여백 물리 `clamp(.03H,18,44)` px |
| 팁 | 기존 `NativeLoadingTips` 승인 4종·현재 primary/secondary 바인딩·영어 폴백·`FontPixels(H)` 유지. 물리 `GUI.matrix=identity`에서 진행선 아래 8px. PC helper의 중복 팁은 이식하지 않음 |
| 코드 경계 | 새 `NativeLoadingSelection.cs`, 최소 `NativeUiSafeArea.cs`/`NativeUiViewport.cs`, shader 및 원화 자산. 기존 `NativeGame.cs`/`NativeGame.StageFlow.cs`와 QA `NativeGame.LoadingTipCapture.cs` 변경. 로비 gate·다른 viewport UI는 제외 |
| 합성 순서 | `NativeGame.OnGUI`의 HUD 뒤에서 `StageFlowDrawLoad()`를 그려 전체 원화와 하단 상태판이 전투 HUD를 덮음. `LoadPhase>0`인 프레임에는 뒤의 전투 안내를 그리지 않음 |
| QA 표본 | 기존 언어·키 48개에 1920×1080, 2560×1080, 2880×810, 3024×1964 각각 승인 16종 + variant 강제 누락 1종 = 68개 추가. 비배치 Player Repaint audit와 PNG로 source·팁·파일을 확인 |
| QA 해상도 순서 | 창 모드 1920→2560→2880, 마지막에 3024 전체화면. 1920과 3024에서 팁 24개씩, 각 해상도에서 원화 17개씩 수집. Mac Player의 전체화면→작은 창 전환이 적용되지 않아 순서를 한 방향으로 고정 |

현행 Core 114개와 Runtime/Remodel 200개 소스를 Roslyn 4.10/.NET 8로 각각 정적 컴파일 exit 0 확인했다. 이는 Unity import/Player 화면 검사가 아니다. 첫 공식 ARM64 Settings QA 빌드는 Succeeded/오류0, M1 exit0/차단0/일반 저장11항목 변화0. 첫 GUI에서 로딩 원화가 HUD 아래에 놓이고 글자 단위 audit 때문에 기존 전체 문구 탐지가 실패했다. 수정본 두 번째 공식 빌드는 Succeeded/오류0, 같은 앱 M1 exit0. 두 번째 GUI는 팁 48개 실제 캡처 후 3024 전체화면에서 1920 창으로 되돌리지 못해 원화 수집 전에 종료2. 세 번째 후보는 해상도 수집 순서를 바로잡는다.

### 해상도 순서 수정본 결과

커밋 `00d5f2b518b4c66c5ff5688e19b334f461a39326`을 새 APFS QA 프로젝트에서 Unity 6000.6.7f1 공식 ARM64 Settings QA로 빌드했다. `build-3-receipt.json`은 `Succeeded`/errors0, 같은 앱 M1은 23/23·firstBlocked 빈 문자열·exit0이다. 첫 GUI는 macOS의 이전 창 크기 2704×1634가 남아 1920 요청 검사에서 exit2였고, **동일 앱**을 `-screen-width 1920 -screen-height 1080 -screen-fullscreen 0`으로 다시 열어 비배치 GUI exit0을 얻었다.

| 실제 Player 결과 | 값 |
|---|---|
| 표본 | 팁 48, 원화 68 = PNG·Repaint audit 각 116. 1920×1080·2560×1080·2880×810·3024×1964 원화 각 17, 강제 variant 누락 폴백 각 1 |
| 계약 확인 | 승인 ID 16개 variant source·팁·PNG 존재 전체 통과, `loading-tip-receipt.json` passed=true |
| 무음·종료 | Listener pause=true, volume=0, outputPeak=0, Direct VideoPlayer=0, `QA_MEDIA_DRAIN_COMPLETE LOADING_TIPS`, exit0 |
| 일반 저장 | 사전 11항목과 M1·GUI 종료 후 목록의 존재·크기·SHA-256 동일 |
| 1x 화면 | 1920 기본, 2880 확장/누락 폴백, 3024 기본 PNG 직접 확인. 원화가 HUD를 가리고 제목/detail/진행선/팁이 보임. **표본 VISUAL VERDICT: PASS** |

증거 경로는 `/Users/fordeargamers/exoduser-wt/_out/mac-loading-art-overlay-20261101/`의 `build-3-receipt.json`, `m1-3/m1-check.json`, `gui-3b/loading-tip-receipt.json`, 각 원본 PNG/JSON, `ordinary-before.json`·`ordinary-after-m1-3.json`·`ordinary-after-gui-3b.json`이다. GUI는 QA에서 StageIndex·언어·키와 강제 원화 ID/누락 variant를 설정했으므로 자연 구역 진행의 16종 노출 증거는 아니다. 후속 승인 로고는 별도 자산·로비 참조 범위로 이 결과 이후 적용됐으며 로딩 116표본을 중복 실행하지 않았다.

### 공통 반영과 일반 제품 앱 — 2026-11-01

후속 문서까지 포함한 정확 커밋 `9d4692f75e8e59c0779ed2f0d0020cb4c866742d`를 기존 `unity/main:f60d89b5cea8d35599c91c85c20bcdd6d2e593aa`에서 비강제 fast forward하고 원격 SHA를 재확인했다. 코드 차이에 Core/맵/URP 변경은 없고, 추가 shader는 로딩 전용 `LoadingBlur.shader`다. 로고 변경 뒤에도 로딩 제품 코드 자체는 `00d5f2b5`와 같다.

같은 소스의 별도 APFS 프로젝트와 자기 Unity Library 캐시에서 **일반** ARM64 `PortVerification.Build`를 실행했다. `build-product-receipt.json`은 `settingsQa=false`, `uiQa=false`, `Succeeded`, errors0, product `EXODUSER · Unity 이식 검증판`, bundle ID `com.ForDearGamers.EXODUSER----Unity-----------------`이다. 새 앱은 `/Users/fordeargamers/exoduser-wt/_out/mac-loading-art-overlay-20261101/build-product/EXODUSER-Unity.app`에만 있고 기존 사용자 앱/런처를 교체하지 않았다. 실행 파일 SHA-256 `601a185a881b0916450d73ad6970262786663e996d0bb3d8f61187dd639a7eb7`, Runtime `60188a4bc849245d72865771f5936d34a9d6113e4a73f15e75efb59949b1f194`, Core `836f58db9575a0a68429bd94c8cc25405248a2a7cf0f4f37eaed91b706c90bce`. 두 DLL SHA는 앞선 Settings QA 앱과 각각 같다.

일반 제품 앱의 격리 M1은 23/23·firstBlocked 빈 문자열·정상 drain·exit0이지만, 일반 사용자 저장 11항목 중 `~/Library/Preferences/com.ForDearGamers.EXODUSER----Unity-----------------.plist` 834B의 SHA가 첫 실행에서 변경됐다. roster/combat 등 나머지 10항목은 동일. 새 OS sandbox로 Preferences 쓰기를 막는 방법도 M1 exit0이었으나 동일 plist SHA가 다시 바뀌었다. **두 번 실패해 제품 앱 추가 실행을 중단**했고 두 번째 실행 직전 보존한 plist bytes를 복원하여 해당 직전 SHA와 11항목 전체 일치를 확인했다. 첫 실행 *전* SHA로 되돌릴 원본 bytes는 보유하지 않아 그 초기 상태의 복원은 주장하지 않는다. 원인은 Unity/macOS의 제품 번들 ID Preferences 세션 갱신으로 관측됐으며 게임 roster/combat 저장 변경은 없었다. 이 저장 게이트 때문에 일반 앱의 실제 title/loading GUI·무음은 미완이고 QA 앱의 GUI 통과를 일반 앱 통과로 대체하지 않는다. 기존 설치 실행 경로가 특정되지 않아 자동 교체도 하지 않았다.

## 11-04 필드 조립 대기 — 로비→필드 전환에서 3D 필드 조립 중 되돌리지 않기

상태: PC 검사·컴파일만, 화면 판정 전(Mac 판정 필요).

| 항목 | 내용 |
|---|---|
| 원인 | `Remodel3DLoad` 코루틴이 `HellLightingSetup`→`A2FieldSetup`을 한 프레임에 동기로 끝냈다(실측 15471ms). 전환 흐름(`ScreenTransitionFlow`, Core)은 Preparing 12초 상한을 실시간 델타로 재서, 긴 프레임 하나가 상한을 넘기거나 12초 안에 준비가 안 되면 곧바로 `Failed`→`SCREEN_TRANSITION_RECOVER`로 로비에 되돌렸다. 다만 근거 로그(`capture-1920/Player.log`)의 되돌림 12건은 `return-lobby`(영상 경계)이고 조립 완료 줄 뒤에 찍혀 있어, 조립 시간이 그 12건의 유일한 원인이라고는 확정하지 못했다. 조립 동기 블록과 한 프레임 델타 실패는 코드로 확정. |
| 실패 조건(11-04 fix2 정정) | 오류(예외·디코더 오류) 즉시, 또는 진행 보고가 멈춘 채 프레임이 도는 시간이 조립 중 20초·조립 아닐 때 12초, 또는 준비 시작 뒤 실시간 120초(절대 상한)일 때만. 실패해도 로비로 되돌리지 않고 롤백 없이 그대로 연다(3D 필드는 2D로 연다, 아래 fix2 표). Preparing 동안 Core 흐름 시계는 호스트(`NativeScreenTransition`)가 0으로 고정해 Core의 12초·한 프레임 실패가 발동하지 않는다. Core는 수정하지 않았다. |
| 멈춤 판정 | `TransitionPrepareWatchdog`: 프레임 시간을 프레임당 0.25초로 잘라 누적, 진행 보고(`NativeTransitionProgress.Beats`)가 바뀌면 0으로. 20초는 이전 상한 12초와 실측 조립 15.5초보다 길고, 한 프레임 긴 끊김은 0.25초로만 센다. 조립이 아닐 때(영상 대기 등)는 기존 12초 유지. 20초·12초는 설계 값이며 느린 PC 실측은 없다. |
| 준비 완료 조건 | 기존 `prepared()`에 "조립 진행 중 아님"을 더했다. 조립이 끝나야 reveal. |
| 조립 분할 | `A2FieldSetup`을 단계 사이에 `yield return null`로 프레임을 넘기는 코루틴으로 바꿨다(`A2FieldSetupSteps`). 단계 순서·호출·인자·수치는 그대로이며 `A2FieldOuterMass→A2Foreground→A2FieldLandmarks→A2FieldConnections→A2FieldGround→A2FieldGroundCover→A2BridgeMoss→A2FieldAtmosphere` 호출 순서도 같다. 조립 중에는 `r3Cam`을 끄고 끝나면 이전 상태로 되돌려, 반쯤 만든 필드가 비치지 않는다. `HellLightingSetup`·`A2ForestSetup`·`Remodel3DLoad`는 이 코루틴을 `yield return`으로 이어 받는다. |
| 진행 표시 | 문구 없음(번역 항목 없음). 로딩 문구 아래 가는 은빛 선: 바탕 `--sv-dk #4f5352`(.55), 채움 `--sv-lt #c9c7c3`(.85)과 끝 `--sv-hi #f6f5f2`. 폭 max(160, 화면높이×.2), 두께 1px(1080 기준), 우측·하단 여백은 기존 문구와 같다. 채움은 조립 단계 보고(추정 가중치)를 완만하게 따라가며, 조립이 없는 전환에서는 그리지 않는다. 기존 인장·불씨·후광·문구는 그대로이고, 불씨·후광 호흡은 호스트 시계로 계속 움직인다(곡선은 Core와 같은 식). |
| 검사 | `unity/Tools/field-prepare-wait-tests/run.cjs`(Unity 없이 Roslyn/dotnet, 20초 조립 지연·15초 한 프레임 끊김·20초 한 프레임·보고 멈춤 20초 뒤 실패·비조립 12초·오류 즉시·보고 단조 증가). 지연 주입은 검사 코드 안에서만 한다. |

### 11-04 fix2 — 독립 검증 FAIL 8건 수정 (동작 표)

상태: PC 검사·참조 컴파일만, Mac 화면 판정 전. Core(`ScreenTransitionFlow`) 무수정, 호스트 쪽 대기·감시만 고쳤다. 진행선 색·위치·시점은 그대로.

| # | 검증 지적 | 처리 |
|---|---|---|
| 1 | Begin 전 공백 | 둘 다 적용. (a) `Remodel3DLoad`가 첫 줄(씬 로드 전)에서 `NativeTransitionProgress.Begin("remodel3d-load")`를 먼저 부른다. (b) 필드로 가는 전환(`lobby-game`·`story-game`)은 `NativeGame.FieldPreparePending`(3D 요청됨·필드 화면·r3Loaded=false·r3Failed=false) 동안에도 준비 완료로 보지 않는다. 보스 아레나 시작이면 pending이 아니라 기다리지 않는다. |
| 2 | 조립 예외 | `AssemblyGuard.Run`이 중첩 코루틴을 한 곳에서 돌려 예외를 잡는다(Unity는 중첩 예외를 로그만 남기고 멈춤). 예외 시 대기 중 반복자를 Dispose(finally 실행), `r3Failed=true`, `r3Loading=false`, `r3Cam`·`r3Roots`·`a2Root` 끄기, 진행 상태 해제. 화면은 기존 2D 경로로 열린다. 사유 `assembly-exception: <형식>: <메시지>`는 로그(`[RM-INT]`)와 전환 기록 `error`(`NativeTransitionProgress.Failure`)에 남는다. |
| 3 | 절대 상한 | 준비(Preparing) 시작 뒤 실시간 120초(`HardCapSeconds`). 프레임 지연은 자르지 않고 센다. 넘으면 `prepare-hard-cap(120s)`로 실패 처리하고 2번과 같은 안전 중단(`NativeGame.AbortFieldPrepare`: 조립 코루틴 정지, 3D 실패, 2D로 열기). |
| 4 | 전역 Active 고착 | `Begin`이 소유 토큰(세대)을 돌려주고 `End(token)`은 자기 세대일 때만 반영한다. `Release()`는 세대를 올려 옛 소유자의 늦은 End를 무시한다. 전환 시작(`Request`)과 매 프레임 감시(`ReleaseOrphan`)가 조립 코루틴이 이미 끝났는데(`r3Loading=false`) 남은 Active를 강제로 정리한다. |
| 5 | 메뉴 전환 대기 | 대기·진행선·멈춤 감시는 필드로 가는 전환(`lobby-game`·`story-game`)에만 건다. `splash-menu`·`world-lobby`·`lobby-select` 등은 조립이나 pending을 기다리지 않는다. |
| 6 | 실패 사유 덮어쓰기 | `TransitionPrepareWatchdog.FirstReason`: 전환 기록의 첫 사유를 유지하고 경고 로그도 한 번만 남긴다. FadeIn 프레임의 `prepare-failed`·뒤늦은 problem이 덮지 못한다. |
| 7 | 문구 정정 | "로비로 되돌림"은 사실이 아니다: 실패하면 롤백 없이 그대로 연다(3D는 2D로). 상한은 `prepare-timeout (12s)`가 아니라 `prepare-stalled`(조립 20s·비조립 12s)와 `prepare-hard-cap(120s)`. |
| 8 | root-guard 범위 | `root-guard.test.cjs`가 `Runtime/NativeGame*.cs` 전체(98개)를 보고, 조립 IEnumerator(`A2FieldSetup`·`A2ForestSetup`·`HellLightingSetup`·`Remodel3DLoad` 등)가 `yield return`·`StartCoroutine`·`AssemblyGuard.Run` 밖에서 문장으로 불리면 FAIL한다. 미병합 fieldbuild 브랜치는 병합 때 `A2Redesign.cs`의 무가드 foreach와 Setup 호출부를 이 검사로 확인한다. |

시간 상한 요약: 조립 중 보고 멈춤 20초, 비조립 12초(기존), 전환 한 번 준비 절대 120초. 검사 `run.cjs`는 기존 13개에 (a) Begin 전 2초 무보고+21초 조립, (b) 조립 중 예외, (c) 보고가 계속 와도 120초에서 hard-cap, (d) 고착 Active 뒤 다음 전환·옛 소유자 End 무시, (e) 첫 사유 보존, (f) 메뉴 전환 비대기를 더해 29개다. 20초·12초·120초는 설계 값이며 느린 PC 실측은 없다.

### 11-04 fix3 — 재검증 지적 정리 (상한·실패 시 3D 처리)

상태: PC 하니스·참조 컴파일만, Unity 실컴파일·Mac 화면 판정 전. Core·화면 디자인 무변경.

| 항목 | 동작 |
|---|---|
| 120초 상한 | 프레임당 최대 2초(`HardCapMaxFrame`)로 잘라 센다. 125초 한 프레임(디버거·절전)은 2초, 0.2fps(5초 프레임)는 프레임당 2초라 30프레임이 60초다. 보고가 계속 와도 클램프 프레임 60개(60fps면 실시간 120초)에서 `prepare-hard-cap(120s)`. 정지 판정(20초·12초)은 기존 0.25초 클램프 그대로. |
| 실패 시 3D 처리(fix2의 "그 세션 내내 2D"를 대체) | 어떤 중단이든 롤백 없이 그대로 연다. 반쯤 만든 3D는 끄고 `R3Teardown`으로 정리한다(씬 언로드, `r3Roots`·`r3Cam`·`a2Root` 등 참조 해제). 중단 사유별 재시도: (1) `prepare-stalled`·`prepare-hard-cap`·소유자 비활성화는 `r3Failed`를 두지 않고 **다음 필드 입장(필드 전환 `Request`)마다** 다시 시도한다. (2) 조립 예외는 **재시도 1회**(`FieldLoadGate.MaxExceptionRetries`), 두 번째 예외부터 `r3Failed=true`로 그 세션은 2D. (3) 씬 없음·리그 없음 같은 결정적 실패는 기존대로 `r3Failed`. 재시도 전 대기 중이면 `FieldPreparePending`은 false라 현재 전환은 2D로 열린다. |
| 씬 로드 중 중단 | `LoadSceneAsync`의 AsyncOperation을 `r3LoadOp`에 잡아 두고, 로드 루프가 진행값이 바뀔 때마다 `Report("remodel3d-scene")`한다(정지는 그대로 감지). 로드가 끝나기 전에 중단되면 `completed`에서 그 씬 루트를 끄고 언로드한다(RM1_Slice의 Main Camera·AudioListener·전역 Volume 고아 방지). 로드·언로드가 남아 있는 동안은 재시작하지 않는다(`FieldLoadGate.PendingOps`). |
| OnDisable | `NativeGame.OnDisable`이 조립 중(`r3Loading`)이면 `owner-disabled`로 중단·정리하고(다음 입장에 재시도), 아니면 `r3Loading`만 해제한다. |
| 진행선 | 실패한 전환(`flow.Failed` 또는 기록된 error)에서는 진행선 목표를 현재 값에 고정해 100%까지 채우지 않는다. 이어지는 FadeIn이 선을 지운다. 성공 때는 조립 끝에 1로 찬다. |
| 주석 | "로비로 되돌림" 표현을 `NativeTransitionPrepare.cs`에서 실제 동작(롤백 없이 열고 3D는 정리)으로, `NativeScreenTransition.cs`에 120초 hard-cap을 적었다. |
| 검사 | `run.cjs` 46/0(fix2의 29개에 125초 한 프레임·0.2fps·재시도 정책·중단 뒤 다음 입장 재시도·진행선 고정 추가), `abort-contract.test.cjs`(씬 로드 고아 정리·OnDisable·주석 계약 10건), `root-guard`·`capture-contract` PASS. 실게임의 `UnloadSceneAsync`·재시도 조립은 Mac 확인 필요. |

## 11-04 로비→필드 전환 로딩 촬영 모드

상태: PC 컴파일·소스 검사만, 촬영 미실행(Mac 공용 실행기로 촬영).

- 사용법: `--unity-transition-loading-capture <절대 출력 폴더>` (QA 격리 저장소 필수, 창 모드 1920x1080, 소리 0). 끝나면 `Application.Quit`, 실패 시 receipt `error`와 0이 아닌 종료 코드(예외 2, 샘플 누락·로비 복귀 4).
- 시작: 격리 저장소에 전사 `검수전사`를 만들고(자동 입력 상태), 자동 입력을 풀어 로비 "시작" 버튼과 같은 `lobby.EnterSelectedCharacter()`를 호출한다. 전환·조립 코드는 건드리지 않는다. 시작·소개 페이지(Nemesis·Guide)는 Esc와 같은 상태기계 `Skip()`으로만 넘기고 횟수를 receipt `introSkips`에 적는다.
- 샘플(렌더 끝 프레임 `WaitForEndOfFrame`): 전환이 시작될 때마다(`NativeScreenTransition.History`의 `started`) 그 전환 기준 +0.45초 인장 `transition-<boundary>-seal.png`, +1.2초 문구·진행선 `transition-<boundary>-label.png`(전환이 아직 Busy일 때만). 그 밖에 (c) `Active`이고 Fraction 0.5 이상인 첫 프레임 (d) 조립이 끝난 첫 프레임(전환 Busy, 페이드인 전) (e) 필드가 보인 뒤 1초. 각 샘플의 `boundary`가 찍힌 전환이다. 소개 페이지 Skip은 전환이 Busy가 아닐 때만 한다.
- 해상도: `--unity-transition-loading-size <W>x<H>`(기본 1920x1080, 창 모드·무음 유지).
- receipt `transition-loading.json`: 샘플별 경과·Fraction·Active·Busy·Phase·경계 이름·로비 단계·조립 단계명·해상도·PNG 경로, `returnedToLobby`, `assemblySeconds`, `totalSeconds`, `boundaries`, `missing`. 조립이 전환 밖에서 일어나 (c)(d)가 없으면 `missing`에 남기고 종료 코드 4.
- 검사: `unity/Tools/field-prepare-wait-tests/capture-contract.test.cjs`(인자 분기·격리 저장소·공용 시작 경로 호출).

# 전사 v23 자연완주 → 최초 안내: Mac Player QA 기대 행 (PC 읽기 전용)

## 승인 원문과 현재 경로

- 원본 인수는 `docs/engine/UNITY_WARRIOR_STORY_SOURCE_20261025.md`, Mac 제품/기존 영수증은 `UNITY_MAC_WARRIOR_STORY_20261025.md`, 후속 입장 계약은 `UNITY_MAC_STARTUP_FLOW_20261025.md`, 첫 안내/실습은 `UNITY_MAC_FIRST_PRACTICE_20261026.md`. 10/27 `UNITY_MAC_START_TO_FIELD_QA_20261027.md`는 **전사 영상에서 Esc hold skip으로 안내에 간 실키 순회**다. 2025 Mac의 예전 `--unity-character-story-smoke` 자연완주 8/8은 당시 앱의 fixture 결과이지 이번 A06 일반 UI의 자연완주→첫 안내 새 PASS가 아니다.
- `origin/unity/main` `5073a08de798a7f3c4d36b3cf051be052ac5b528`의 `NativeLobby.CharacterStory` / `WarriorStoryState` / `FrontendEntryFlow` / `NativeLobby.StartupPresentation` / `NativeGame.StartupFlow`를 판독했다. 앞선 `44ac7ac7` 이후 해당 소스·승인 문서 차이는 없다. 대상 영상은 승인된 **`warrior_story_v23_clean.mp4` 97,796,468B, SHA-256 `277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34`**. 세계관 정본 `world_intro_v22b_steam.mp4`와 구별한다. 이번 인수는 638자막 큐·전체 영상 frame/청음을 다시 감사하지 않는다.

| 경계 | 일반 UI 무입력·후속 입력에서 기대할 상태 | 새 Mac 영수증에 필요한 관찰 / 제외 |
|---|---|---|
| 새 전사 생성 성공 | roster commit 후 **외형 0 전사만** `BeginCreatedCharacterStory()` 1회. 영상/자막이 모달을 소유하고 생성 Enter 잔여 입력은 다음 cue로 전파되지 않음 | 격리 `--unity-frontend-review -output <고유 절대경로>`와 roster revision·선택 이름/인덱스 기록. 비전사 자동 진입이나 중복 슬롯을 만들지 않음 |
| 영상 자연 종료 | 조작 없이 `movie.Ended` → `WarriorStoryState.Finish(true)` 1회. `Seen=true`는 현재 session 값이며 영속 storySeen을 저장하지 않음 | 실제 영상 재생 중 대표 frame·종료 뒤 상태를 구분. 벽시계 관찰만으로 정확한 마지막 frame/전체 22cue/오디오 PASS를 만들지 않음 |
| 종료 직후 로고 게이트 | `Entering=true`에서 영상 close·자막 제거, 기존 **1.2초** `DrawEntryLoadingLogo()`. 이 시간은 새로 더하는 1.2초가 아님 | 영상 frame→로고→다음 화면 순서, 잔여 키/마우스가 전투나 로비에 새 입력으로 누출되지 않는지. 영상 자연 종료만으로 바로 안내 1/4를 기대하지 않음 |
| 같은 이름의 입장 | `EntryReady`에서 선택 인덱스와 이름이 생성 당시와 같은지 재대조하고 `BeginCharacterEntry(true)`를 1회 호출; `FrontendEntryFlow.Begin(...,loadingAlreadyShown=true)`는 **네메시스**로 바로 시작 | 동일 이름·선택 로스터 유지. 일반 선택 오류/로비 복귀 시 늦은 입장은 취소. 기존 로고 게이트 뒤 추가 로딩 1.2초를 요구하지 않음 |
| 네메시스 → 안내 | 네메시스 대사 행은 자동 전체완주가 아니라 해당 입력으로 넘기거나 `Esc`/Start 즉시, `Space` 약 2초 hold로 skip. 종료/skip 뒤 `GuideStep=0`, **1 / 4 이동과 공격**, `눈을 떠`, 이동·좌클릭·우클릭 안내가 보임 | 이번 Mac 자연 영상 QA가 안내까지 보려면 네메시스 경계의 입력을 따로 기록. 이 입력을 전사 영상 skip으로 보고하지 않음. Guide 최초 화면의 제목·본문·버튼 가림/잘림을 1280/1920에서 판단 |
| 최초 안내 준비·skip | Guide 진입 때 기존 `ResetRun()` **1회**, enemy renderer는 안내 중 숨김, `voice_wakeup` 1회, gameplay는 정지. 새 단계 입력 fence와 250ms 다음 debounce. 안내의 `Esc`/Start·skip 버튼 즉시 또는 `Space` 약 2초 hold는 안내 자체의 종료 명령 | 영상 생성 Enter/네메시스 skip 키가 안내 다음/skip으로 연속 전파되지 않음. 안내 skip 뒤 커튼 900ms·입력 해제 fence를 거쳐 field/첫 실습으로 이동. 원래 roster/사용자 save를 쓰지 않음 |

영상 자연 종료와 **첫 안내 도달**은 별도 판정이다. 기존 Mac 전사 이야기는 이전 앱에서 자연완주 8/8 및 같은 이름 입장이 확인됐고, A06 일반 UI에서는 10/27 skip→안내 경로가 확인됐다. 새로 배정된 Mac 검수 전에는 두 근거를 합쳐 A06 일반 UI 자연완주→첫 안내 PASS라고 쓰지 않는다. 실제 Player·화면·OS 입력 검수는 Mac 담당; 이 파일은 정적 기대값만 보존한다.

## 승인 UI/UX/intro 큐의 남은 실구현 불일치 상위 3

| 우선 | 현재 구현과 원문/화면의 구체적 차이 | 관련 행·제안 경계 |
|---|---|---|
| 1 | 최초 안내 2·3쪽은 Q/E, 사슬·전격이동, Space·가시덫·회복영역 등 원본 조작을 안내한다. 현재 Native 첫 실습은 이동·좌클릭의 첫 두 조건만 실제 연결했고 Q/E 등은 미지원 안내다. 이 문구를 보고 즉시 실행 가능한 조작으로 기대하면 오해가 생긴다. | `UNITY_MAC_STARTUP_FLOW_20261025.md` §4컷 안내/검증, `UNITY_MAC_FIRST_PRACTICE_20261026.md` §남은 범위. UI 문구·단계의 지원 상태 표시/검수 계약을 owner가 정리할 대상. **새 Core 기능 제안 아님** |
| 2 | 안내 4쪽은 **“물약은 설정한 HP% 이하 시 자동 사용”**이라고 하지만 B11 원본 함수 계약은 `OPT.autoPotThr`를 쓰지 않는다. Native 안내 문구가 조작 가능한 임계값이 실제 적용된다는 인상을 준다. | `NativeLobby.StartupPresentation.cs:172`, `UNITY_B11_AUTOPOTION_20261026.md` §1/§5. 먼저 원문·실제 동작에 맞는 UI 설명 범위를 검토할 owner 행. 자동 물약 계산/threshold Core 변경 제안 아님 |
| 3 | 웹 전사 영상의 패드 B/Start hold·A 등 다음 입력은 원본 계약에 있지만 현행 Native 전사 영상은 키보드/마우스만 구현했다. 영상은 재생돼도 패드만 쓰는 사용자는 원본의 다음/skip 조작을 못 한다. | `UNITY_WARRIOR_STORY_SOURCE_20261025.md` §입력과 수명, `UNITY_MAC_WARRIOR_STORY_20261025.md` §미완료. A06 영상 자연완주와 별도 입력/안내 UX 차이로 유지. 전체 638큐·영상 재감사 또는 Core 기능 작업을 이 문서에서 시작하지 않음 |

이 표는 이미 문서·현재 소스에서 확인되는 차이만 나열한다. K/G/J 대표 화면의 1280/1920 가림·잘림은 기존 Mac 인수에서 새 결함이 없었으므로 목록에 넣지 않았다. 물리 마우스·전체 다국어/RTL·정밀 frame/청음은 검수 HOLD이며 제품 불일치가 확인된 것처럼 세지 않는다. 제품/Editor/Player/push 변경 0.

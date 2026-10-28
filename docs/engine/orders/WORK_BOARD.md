## 2026-10-27 Mac A15 설정 4탭 최소 연결·Player 후속

PC `f0f882c19`의 레이아웃 명세/입력 oracle을 Mac `a3869387` blob과 대조했다. Mac 소유 PauseMenu/Navigation/Keyboard의 게임·화면·사운드·조작 4탭, 실제 FPS/fullscreen/SFX/BGM callback, 조작 탭 내 기존 key list와 scroll/footer를 연결. 게임 옵션·패드 재지정은 미지원 명시. 후속 비대기 Tab은 설정 초점을 옮기며, 순수 navigation42/42, 최종 Unity ARM64 Settings QA Player 빌드 Succeeded/오류0. 귀속 확인된 QA PID의 720p 4탭/SFX60→61%와 1080p 화면·사운드 2열 캡처 확인. 좁은 1열·실기 key capture·청취/재시작은 HOLD. [범위·근거](../UNITY_MAC_A15_4TAB_20261027.md).

## 2026-10-27 Mac 표시 릴리스 메타 원격 main 동기화

원격 main `607110d52`의 최신 INBOX에 0.7.7 통합 표시 승인 없음. `release-version.json`(0.7.5/2026-10-20/ea-full, blob `528ad945f`) bytes만 Mac `release_web.json`으로 인수했다. 게임/미디어/app id/flavor 변경0, 새 Player build0. `8adfcc577` HEAD 전체 Unity6000.6.7f1 Editor Verify 1회 exit0/receipt PASS, HUD GPU·Inventory·Lobby PASS. 생성 `.meta` 411+1 원복. [원본 SHA·영수증](../UNITY_MAC_RELEASE_METADATA_20261027.md).

## 2026-10-27 Mac A05 오류 뒤 수동 마지막 cue 후속

오류 callback만은 완료0, 사용자 `NextCut()<0` 수동 마지막 cue는 오류 뒤에도 완료, 5초 hold는 별도 완료로 분리했다. 격리 Editor fixture 24/24 PASS. 고유 Settings QA ARM64 앱 1회 빌드 Succeeded/errors0. marker QA root에서 첫 실행 세계관 자연 종료→`cinSeen:true` revision2→3→동일 앱/루트 재시작 로비 직행 **Player PASS**; 키 리맵·패드 JSON 유지. [계약](../UNITY_MAC_A05_CINSEEN_20261027.md).

## 2026-10-27 Mac A05 재방문 세계관 스킵

PC 검토 `571a08648`의 최소 hunk를 Mac 설정 v2 선택적 `cinSeen:true`와 정상 앱 첫 진입에 연결했다. 세계관 자연 종료/마지막 cue 또는 실제 5초 hold만 완료 처리한다. 격리 Unity Editor fixture 21/21 PASS·exit0/C# 오류0. 사용자 Player 자연 재시작·실창 입력은 HOLD. [계약·영수증](../UNITY_MAC_A05_CINSEEN_20261027.md).

## 2026-10-27 Mac 시작 인벤토리 seed QA 교정·전체 Verify

PC-U04b 정본의 기본 장비15+고유 유골함1=전체16, belt null, bag10/어픽스20과 Mac Editor 구형 `worn==15` 충돌을 확인했다. 제품 seed/oracle byte 동일, 집중 정적8/8. `VerifyInventory`의 QA 조건만 분리한 뒤 Unity6000.6.7f1 실제 Metal Editor 전체 `Verify` 단회 exit0/receipt PASS. HUD GPU·Inventory·Lobby 순차 PASS; Player/PC AMD·실기 UI 검사 아님. [슬롯·ID·SHA·로그](../UNITY_MAC_INVENTORY_SEED_QA_20261027.md).

## 2026-10-27 Mac A06 HUD Metal Editor 판정

PC 계측·웹 clipping hunk만 Mac Editor QA에 적용했다. Unity6000.6.7f1 `-nographics` 없는 단회 실행에서 `Metal / Apple M5 Pro / Gamma`, raw RGBA 5점, composition PASS·HUD GPU resource mask PASS. 전체 `Verify`는 다음 Inventory seed counts 예외로 exit2/receipt없음이며 이 실패를 HUD GPU 오류로 계산하지 않는다. Player·Runtime·셰이더·Gamma·개인앱 변경0. [정확 수치·로그·남은 원인](../UNITY_MAC_A06_GPU_METAL_20261027.md).

## 2026-10-27 Mac A04 생성 뒤 전사 이야기 외형 가드

PC `08af46705af26291d9d5add4904ad82a268142c1`의 `NativeLobby.Characters.cs` 한 줄을 Mac에 적응했다. 저장 성공 뒤 외형 0만 기존 전사 이야기·입장으로 가고, 외형 1–4는 현재 잠금 유지·미래 생성 허용 시 로비 잔류다. Mac Unity6000.6.7f1 Editor 컴파일1회 종료0/C# 오류0, Player 빌드0. PC 추출 검사 6/6은 실기 GUI 결과가 아니다. [외형별 계약·Mac 검증](../UNITY_MAC_WARRIOR_STORY_20261025.md#2026-10-27-a04-생성-뒤-외형별-이야기-분기).

## 2026-10-27 Mac A03 패치노트 QA 직접진입 실창 결과

source `fae70452d` 고유 ARM64 1회 Succeeded/errors0/C# 오류·경고0. `open -n` 단일 격리 PID18734에서 ko 0.7.5/0.7.0 본문, 키보드 Down 스크롤, es/cs 긴 라벨, N 뒤입력 차단, Esc 닫기와 roster0/selected-1 불변을 확인했다. **QA 직접진입·키보드 PASS**, launcher 실제 마우스 클릭 HOLD. 실제 내용1280×720/캡처1280×784이며 1024 최소창 미검증. [영수증·화면·경계](../UNITY_MAC_A03A04_UI_REVIEW_20261027.md).

## 2026-10-27 Mac A04 es 긴 문구 배치 재검수 결과

source `c03f20489` 고유 ARM64 build4 Succeeded/errors0/C# 오류·경고0. 1280×720 실창 es 특성 제목/본문·클래스·출시 안내의 겹침/잘림을 제거하고 가로 스크롤0; ko/en/ja 대표 화면도 직접 겹침0. **목표 es 1280×720 VISUAL VERDICT: PASS.** 1024×576 요청이 실제 1280×720으로 떠 좁은 화면 hitbox·스크롤 조작은 HOLD. CUA 뒤 무플래그 고유 QA PID4개 발견·종료, A03 패치노트 modal/뒤입력 GUI도 HOLD. [빌드·화면·경계](../UNITY_MAC_A03A04_UI_REVIEW_20261027.md).

## 2026-10-27 Mac A03/A04 통합 UI QA 판정

고유 앱 source `8bcba21b4` ARM64 빌드 1회 Succeeded/오류0. 실창 ja 생성·이름 및 격리 QA 캐릭터 삭제 기본취소 Return/Esc 확인, 실제 삭제0. es 긴 시각선택 특성·클래스 라벨 겹침/잘림으로 **VISUAL VERDICT: RETOUCH**. CUA 좌표 클릭이 Unity 기존 버튼에도 적용되지 않아 A03 modal·뒤입력은 HOLD. [화면·PID·args·빌드 영수증](../UNITY_MAC_A03A04_UI_REVIEW_20261027.md).

## 2026-10-27 Mac A03/A04 UI 실창 검수 후보

고유 QA 빌드 product/id 분기 `-a03a04UiQa true`를 Editor 빌드 경로에 추가했다. 일반·기존 Settings QA identity는 유지하고 빌드 뒤 복원한다. [고유 앱·저장 격리 계약](../UNITY_MAC_A03A04_UI_REVIEW_20261027.md). 실제 ARM64 빌드·CUA 창 식별·입력 판정은 후속 기록한다.

## 2026-10-27 Mac A03/A04 전달 인수·컴파일 현행

PC 전달 문서 커밋 `d132f425b67a16bc1d393eea710778d86222abd5`를 확인했다. 제품 후보 `97227ceb7c4a33becd2fe55d4ab1712dc8013182`의 Runtime tree `8376905b93fc0df4170c9ecc67acb47577990f99`를 고정해 A03 패치노트와 A04 생성·삭제·시각선택 해당 파일·hunk만 Mac에 인수했다. 아래 preflight는 전달 전 시점의 읽기 기록이다. 현재 상태는 [인수 상세와 검증 경계](../UNITY_MAC_A03A04_INTEGRATION_20261027.md)를 따른다. Unity 6000.6.7f1 batch import·compile exit 0, C# 오류·경고 0; 기존 UAC1001은 남는다. Player·GUI 실행 0이며 실제 화면·키 입력 검수는 미실시다.

## 2026-10-27 Mac A03/A04 원격 UI 후보 최소 인수 preflight

읽기 기준은 Mac `58dbec328b75d54831874766f6c2ad3718ead5fb`와 PC 후보 원격 `codex/ui-resume-player-20261026` `97227ceb7c4a33becd2fe55d4ab1712dc8013182`다. `git fetch`/`git show`/차이 읽기만 수행했다. PC가 작성 중인 `a03-a04-mac-handoff.md`는 이 SHA의 트리에 아직 없어 실제 전달·수신·합의로 표시하지 않는다. 제품 파일 적용·merge·Editor/Player/빌드 0.

| 분리된 최소 구역 | PC 후보 경로·고정값 | Mac 대조/의존 |
|---|---|---|
| A03 본문·언어 라벨 | `unity/Assets/Exoduser/Resources/Data/patch_notes.json` + `.meta`: 0.7.5/0.7.0 두 항목, SHA256 `e4eac388…`; `patch_notes_labels.json` + `.meta`: 29언어×3문구=87, SHA256 `bbea905b…` | 로비 콘텐츠 외 다른 리소스·옛 0.7.7 WIP 미인수. PC 문서의 정적 87/87은 PC 검수 근거이며 Mac 웹 재검수는 0 |
| A03 UI | `unity/Assets/Exoduser/Runtime/NativeLobby.PatchNotes.cs` + `.meta` 신규, `NativeLobby.cs`의 로비 입력 차단·launcher·modal 호출 소규모 hunk | partial의 `K`/`Label`/`Fill`/`Border`/`DismissOutside`/`Language`/`AutomatedInput` 등 필요 심볼은 Mac 로비에 존재. 그러나 PC `NativeLobby.cs` 전체를 가져오면 Mac `--unity-arabic-caption-preview` overlay 초기화·world 합성과 `NativeLobbyBuildLabels.Draw(913f)`가 삭제됨. 해당 세 Mac 구역 보존 필수 |
| A04 생성·삭제 라벨 | `character_dialog_labels.json` + `.meta`: 교정 후 SHA256 `423a5689…`, 29언어×14키=406. `NativeLobby.Characters.cs`의 라벨 lookup·초점 상태, `NativeLobby.CharacterPresentation.cs`의 이름 대화상자 사용, `NativeLobby.CharacterDelete.cs`의 삭제 질문/버튼/키보드 방향 hunk | `CharacterDialogLabel`은 Characters에서 정의해 Presentation/Delete가 참조. `characterRestoreCreateFocus`·`characterVisualFocusPending`은 Characters에서 정의해 로비·Presentation이 참조. 세 파일/로비의 create-card 초점 hunk를 묶어야 컴파일 가능성 있음. roster/저장 로직은 가져오지 않음 |
| A04 시각선택 라벨 | `visual_select_labels.json` + `.meta`: SHA256 `4383fe4c…`, 29언어×42키=1,218. `NativeLobby.CharacterPresentation.cs`의 `VisualSelectionLabel` lookup·표시 hunk | 기존 캐릭터 문구 배열·미디어 경로는 보존. PC 문서의 별도 6개 한·영 폴백, 기존 콘텐츠 차이 7곳은 라벨 1,218 분모 밖이며 Mac 채택/디자인 예외 승인 아님 |

다음 최소 적용 순서는 (1) A03 partial + 해당 JSON/meta와 Mac `NativeLobby.cs` **호출 hunk만** 수동 적응, (2) A04 교정 생성·삭제 JSON/meta + Characters/Presentation/Delete와 create-card 초점 hunk, (3) 시각선택 JSON/meta + Presentation의 라벨 hunk다. 각 단계는 PC 소유 원본 해시/manifest 수신 후 별도 인수·검증이 필요하다. PC 자체 Unity 컴파일 0오류 기록은 Mac 조합 컴파일 PASS가 아니다. `NativeLobby*.cs` 파일 통째 덮어쓰기, 전체 branch merge, raw `cin_title_logo.png`, 지역 글꼴/HOLD 자산, 기존 콘텐츠 차이 7곳의 임의 수리, 타 팀 WIP 인수는 하지 않는다. Mac ar overlay·누적19patch·설정 v2·build label은 유지한다. PC의 최신 디자인 예외·7곳 콘텐츠 차이 판단은 [PC 총괄 전달함](PC_TO_MAC_INBOX_20261021.md)으로 회신받을 사안으로 기록하며 현재 열람/동의는 확인되지 않았다.

## 2026-10-27 Mac A15/A16 설정 저장 후보

Editor 전용 headless 설정 IO fixture `NativeSettingsIoVerification.Run`을 Mac 소유로 추가했다. 고유 `_out/UNITY-MAC-A15A16-IO-*`·marker·절대 경로·QA 플래그를 요구한다. 소스 `152378099`에서 Unity6000.6.7f1 독립 Editor write 50/50·read 45/45, 양쪽 종료 코드0. v1 revision7→v2 revision8, 20동작 두 슬롯·4설정·중첩 pad JSON 보존을 전용 파일에서 확인했다. 이는 Editor IO 인수이며 Player/GUI/OS 입력/19패치 런타임은 HOLD. [영수증·계약](../UNITY_MAC_KEYBIND_PERSISTENCE_20261027.md).

후속 import·compile: 고정 후보 `6edb0ce9d`에서 Unity6000.6.7f1 batchmode exit0/C# 오류0. 새 UAC1015는 `[NonSerialized]`로 수리 후 재컴파일 exit0·새 경고0(기존 UAC1001 유지). Resources 변경0. 창 없는 v2 write/read smoke는 기존 fixture의 fullscreen·오디오·PNG 조건과 충돌하므로 Player 빌드/실행0, 런타임 HOLD. [근거](../UNITY_MAC_KEYBIND_PERSISTENCE_20261027.md).

Mac 소유 `NativeSettingsStore`/`NativeGame.SettingsPersistence`/`NativePauseMenu` 어댑터에 JSON schema v2 `binds`·`binds2` 20동작을 연결했다. 기존 v1 경로·4개 설정값·패드 JSON을 보존하고 v1 기본 키로 이주한다. 격리 .NET 모델/IO 90 + 별도 프로세스 write3/read2 PASS. Player/Editor 빌드와 실제 키 페이지·OS 입력·기존 19개 GUI 통합 인수는 아직 HOLD. PC 소유 `KeyBindings`/`NativeKeyBindList`는 미수정. [계약·위험](../UNITY_MAC_KEYBIND_PERSISTENCE_20261027.md).

## 2026-10-26 Mac Unity 현재 소유 블록

이 블록이 현재 Mac Unity 작업 상태다. 아래10/25 NEXT/ACTIVE는 완료 당시의 이력이므로 현재 할 일로 재사용하지 않는다.

| 상태 | 현재 단위 / 담당 / 실제 범위 |
|---|---|
| COMPLETE | 첫2실습·world-blend HUD 인수 유지. 지원 SFX/BGM·FPS·fullscreen 저장/복원: 모델61+별도write3/read2, 실제 격리 Player6회63/63·성공/오류 설정창 확인. source9d587ca15, 정상 ARM64 errors0. [설정 인수](../UNITY_MAC_SETTINGS_PERSISTENCE_20261026.md) / [최신 실행본](../UNITY_MAC_PLAYABLE_20261025.md) |
| COMPLETE | 720p 착용 안내 문장만 짧게 정리. source837636a26·Player8/8·720/1080 두 PNG 직접 인수·정상 ARM64 errors0. 글꼴/viewport/스크롤바/장비 동작 보존. [인수](../UNITY_MAC_INVENTORY_HINT_20261026.md) |
| COMPLETE | 같은 language_pointer가 다음 자막 범위를 읽기 전용으로 확정: 실제 caption=NanumMyeongjo-Regular, 우크라이나어 ї/є/і의 cmap 매핑 없음. 메뉴 Noto 검사와 구분·제품/다운로드/GPU/저장 변경0. [근거](../UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md) |
| COMPLETE | 원본 초반 무음·Gate original soundtrack 복구. FDG 호출 muted=true, native intro track0일 때만 원본 MP3 packet fallback. 실제 Player31/31·normal b4560e63 ARM64 errors0, 정상 저장 hash 동일·기존 사용자 앱 유지. [인수](../UNITY_MAC_INTRO_SILENCE_20261026.md) |
| ACTIVE | 실제 Claude 기존 조명 담당 UNITY-MAP-LIGHT-01의 d3a4a9a3b 코드 제출 회수. Unity/GPU 해제를 전달했으며 별도 빌드·화면·조명 전후 성능 검수로 진행. 공용 NativeGame 두 줄은 별도 patch 대조, 자동 병합/시각 PASS 아직 없음 |
| PENDING | GPT API 이미지1개는 OPENAI_API_KEY 부재로 요청0·생성0. 안전한 로컬 인증 후 필요한 자산만 진행. 다른 제공자 잔액 소진 주장은 하지 않음. 자막3문자 후속은 보존 |

### 2026-10-26 Mac→PC 우선순위 협의 송신 — Mac 소유 기록
1. Mac `codex/unity-mac-20261024`의 `eaa1c0bff`는 `--unity-arabic-caption-preview` 전용 ATG 후보이며 일반 실행 채택은 0이다. cue20 720/1080과 `ar→ko`만 실제 확인했다.
2. Mac 우선순위는 같은 HEAD 재빌드 1회 후 cue32(0-based index31) `EXODUSER.`와 아랍어 32큐의 원문·시간·결합·문장부호·줄바꿈을 순서대로 확인하는 것이다. 실패 큐는 RETOUCH로 남긴다.
3. PC UI는 별도 브랜치·소유 범위로 유지해 Mac ATG 검수와 자동 병합하지 않는다. 현재 PC focus·키보드 QA 결과는 Mac 측에서 수신·인수한 증거가 없어 완료라고 표시하지 않는다.
4. PC 담당에게 요청할 협의 순서는 focus 복귀·키보드 조작의 실제 QA 결과와 SHA를 먼저 공유하고, 그 뒤 원본 UI 차이 중 공용 접점만 소유자끼리 대조하는 것이다.
5. 이 블록은 Mac 측 송신 기록이다. 상대의 열람·답신·합의는 아직 확인되지 않았으며, 확인 전에는 수신/합의 완료로 승격하지 않는다.

Mac 후속 실제 상태: 같은 HEAD `763667931` ARM64 빌드에서 cue32 `.EXODUSER` RETOUCH를 발견해 `a249c4eb4`에서 문장별 RTL/LTR을 고쳤다. `cdc50a1e6`는 기존 QA 플래그 시작 언어만 ar로 지정한다. 최종 ARM64 오류0 Player의 플래그 실행에서 720p 32/32 가시 문구·결합·문장부호·한 줄/잘림·순서와 cue32 `EXODUSER.` 및 ar→ko 복귀 PASS. [32큐 인수표](../UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md). 일반 실행 채택0. 이 기록 당시 PC 회신은 미수신이었고, 이후 수신은 아래에 기록했다.

Mac 배경폭 후속: `9cc2759c1` ARM64 오류0 빌드에서 720p 웹 동일 cue22·긴 cue21·짧은 cue29·라틴 cue32 및 1080p 긴 cue21·cue28/메뉴·짧은 cue26·ar→ko를 격리 Player로 확인했다. 배경은 내용 폭을 따른다. 이번 빌드 32큐 전수 재확인과 일반 실행 채택은 하지 않았다. QA는 `--unity-frontend-review --unity-arabic-caption-preview -output 새절대경로` 세 조건 모두 사용하며 preview 플래그만으로 저장 격리되지 않는다. 추가 화면 수집 중 CUA가 플래그 없는 PID1571을 자동 실행해 즉시 종료·증거 제외했고, 이 앱의 일반 프로필 읽기 가능성은 [QA 기록](../UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md)에 남겼다. 위 Mac→PC 협의의 송신은 `763667931`의 `docs/engine/orders/WORK_BOARD.md`다. PC/Claude의 실제 회신은 `f974d5e33`의 [PC_TO_MAC_INBOX_20261021.md](PC_TO_MAC_INBOX_20261021.md) §2026-10-26 밤4에 있다. 회신은 Mac 자막 우선과 PC 별도 소유, 공용 접점 대조 일정의 Mac 결정을 수락했다. 최신 PC UI 누적 patch 15개 요청은 같은 전달함 §밤6에 접수됐지만 자동 적용·병합·Mac 실기 검수는 하지 않았다.

Mac A02 자기 큐: 최종 fit `9cc2759c1` 720p cue1–32 전수 실화면 검수는 안전한 PID/인자↔창 선택 수단이 없어 미검증. CUA `getApp` 자동 실행 경로를 재사용하지 않고 새 Player/빌드0; 이전 32큐 manifest와 최종 JSON 32×3 동일·최종 코드 SHA/빌드 일치·가로 최대84% 불변을 읽기 전용 대조했다. [채택 관문표](../UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md). 일반 ar 승격 HOLD, 기존 Player·개인 저장 보존, PC 누적 패치 통합은 별도 소유 합의·검수 범위로 유지한다.

Mac UI 누적 통합 preflight: 최신 PC 전달함 밤11은 기존 18개를 `a48faf9ea` **19개**로 대체한다. Mac `941ee99bc`의 인덱스·제품 파일을 보존한 `_out` 임시 사본 순차 `git apply --check`에서 1 `U04B`, 13 `A24`, 14 `A26_nativelobby_buildlabels`가 FAIL(1·14의 3-way도 충돌), 나머지 16개 PASS*는 실패를 건너뛴 잠정 문맥 결과다. 실제 병합·빌드·schema 변경0. [19개 표·소유/충돌 구역](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md). PC 답신 필요: 1번 inventory smoke 갱신 hunk, 13번 Mac `DiagnosticUiEnabled` 보존 기준, 14번 Mac 세계관/ATG 로비에서 build label 삽입점. 선행 충돌 해소 후 2–3번 U08 tab bar를 첫 UI 적용 후보로 재검사한다. A02 최종 fit 32큐 실화면 HOLD와 기존 앱·저장 보존은 유지한다.

Mac UI 1번 U04B 후속: 현재 Mac inventory fixture의 기본 선택 흐름을 보존하고 PC patch가 요구한 `maxMana=Simulation.Player.MaxMana`, `mana=Simulation.Player.Mana` 두 QA 영수증 필드만 `NativeGame.cs`에 적응했다. `-output`/저장 계약·전투 수치 불변. 소스 백업과 독립 diff를 `_out/UNITY-MAC-UI-U04B-20261026/`에 보관했고 [키·시점·검사표](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md)에 기록했다. 수정 소스 임시 사본에서 다음 2→3 U08 tab bar `git apply --check`·임시 적용 2/2 PASS; 제품 적용·빌드·Player0. 13·14는 미해결, A02 fit32 실화면 HOLD 유지.

Mac UI 누적 소스 checkpoint: PC 최신 `a48faf9ea`의 PC 소유 파일·문서를 merge로 인수한다. merge-tree가 예고한 충돌은 `NativeGame.cs` inventory smoke 한 곳이었고 Mac `ef8080387` U04B 두 필드/기존 fixture 흐름을 그대로 보존해 해소했다. PC 원본은 기본 선택 해제 QA 장면 두 줄을 가졌으나 이번 Mac fixture에는 추가하지 않는다. 2–12 hook 적용은 다음 단계, 13·14 충돌 보류. 이 시점 빌드·Player 판정 없음.

Mac UI hook 2→3 checkpoint: PC 소스 merge 뒤 `U08_nativegame_tabbar`·`U08_nativepausemenu_tabbar`를 받은 순서로 `git apply --check`→실제 적용했다. `NativeGame.cs` 탭 요청 라우팅과 `NativePauseMenu.cs` 설정 프리셋 표시는 [계약표](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md)에 기록. `NativePanelTabBar`는 PC blob 그대로, Mac ATG·설정 저장 코드는 변경0. 4–12 후속/13·14 충돌 보류, Mac 빌드·Player 미실행.

Mac UI hook 4→6 checkpoint: U05 skill smoke focus, A07B NativeGame G/J/F10·inventory smoke, A07B NativePauseMenu TAB/K를 원본 patch 순서대로 `git apply --check`→적용했다. [파일·의미 표](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md). PC 소유 입력/탭바 blob 직접수정0, 원래 Mac ATG·저장 코드 보존. 7–12 후속, 13·14 충돌 보류; OS 키/Player 검수 없음.

Mac UI hook 7→12 checkpoint: A13 능력치·A14 대장간·A20 레벨업·A21 사망·A22 클리어 배선·A23 보스바 배선을 PC 원본 순서로 모두 문맥 검사→`NativeGame.cs`에 적용했다. 13 A24는 Mac `DiagnosticUiEnabled` HUD 조건에서 재차 실패해 **미적용**, 14 이후도 순서상 보류. [단계표](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md). Unity 6000.6.7f1 비대화형 script compile 1회 exit0·error CS0·warning CS0, 기존 UAC1001만; import `.meta` churn 412개는 백업/HEAD 대조 후 작업 상태로 복원. Player·OS 입력·화면·저장 회귀 미검증, 기존 사용자 앱 보존. PC 질문 3건은 바로 아래 유지한다.

Mac UI hook 13→14 후속: PC 새 답신이 없는 상태에서 Mac 소유 문맥만 수동 적응했다. A24는 `DiagnosticUiEnabled` 진단 배지 조건을 보존하면서 구역 제목 1회·정본 목표 패널을 조건 밖에 연결; 지역 총량은 미이식. A26 lobby는 `DrawLobby()` 전원 버튼 뒤에 BuildFlavor 라벨 호출 1회, 기존 세계관/ATG·진단 preview 분기 유지. [적응 patch·계약](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md). 정적 적용·diff 검사만 PASS, 화면/Player 미검증. 아래 PC 질문은 원본 충돌·Mac 적응 근거로 유지하며 PC 확인이 오면 대조한다. 15–19는 다음 순서 검사 단계.

Mac UI hook 15→19 후속: A26 PortVerification flavor, A16 PauseMenu/NativeGame 키 설정·QA, B11 Simulation 자동 물약/장비 입력을 원본 patch 순서로 적용했다. 저장 schema v2 구현0. B11은 `Materials += 4` 유지, 일반 킬 드랍 난수 1→2개와 hp만 악의+1인 웹 계약으로 변경. [19개 완료 단계표·공식·남은 런타임 관문](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md). Mac B11 원본 함수 oracle2438/0, Unity6000.6.7f1 비대화형 compile exit0·CS오류/경고0(기존 UAC1001). Editor `.meta` churn은 사전 작업 상태로 복원. **코드 통합·컴파일 PASS, Player/OS 입력/로비라벨/자동물약 실플레이/저장 회귀 미검증**. 기존 앱·개인 저장 보존, A02 fit32 실화면 HOLD. 아래 PC 질문은 Mac 적응의 확인 요청으로 남긴다.

PC에 답신 필요한 원본 근거 3건:
1. 원본 `a48faf9ea:U04B_nativegame_inventory_smoke_mana.patch`는 기본 선택 해제 장면을 context로 쓰지만 Mac `NativeGame.cs` inventory smoke에는 그 장면이 없다. Mac은 영수증 두 필드를 같은 생성 지점에 적응했다. 이 스냅샷 시점·키 계약이 PC 의도와 일치하는지 확인 요청.
2. 원본 `A24_nativegame_areatitle.patch` HUD hunk는 `if(lobby.ActiveCharacterName.Length>0)`을 기대하지만 Mac은 `if(lobby.DiagnosticUiEnabled&&lobby.ActiveCharacterName.Length>0)`이다. 일반 실행의 진단 배지 숨김을 보존하면서 A24 objective panel을 연결하는 기준 확인 요청.
3. 원본 `A26_nativelobby_buildlabels.patch`의 `DrawPower(...)` 다음 context는 Mac 로비/세계관·ATG 후속 문맥과 달라 적용되지 않는다. 현재 로비의 선택/캡션 분기를 보존한 build label 호출 삽입 기준점 확인 요청.

일반 사용자 앱38141/48476/52157는 종료하지 않았다. 앞선 격리 검수의 별도 product/id 기록과 구분해, 이번 유효 ATG Player는 제품 ID가 같지만 `--unity-frontend-review`로 설정 I/O를 끄고 새 절대 `-output`으로 캐릭터 저장을 분리했다. 다만 위 플래그 없는 PID1571은 일반 프로필을 읽었을 수 있어 원래 prefs·캐릭터 파일 무접근/무변경은 입증하지 않는다. 첫부팅FPS120/기본값60·60·0/고정60Hz 유지. 웹/Godot/전투save IO·새설정·새팀·자동화·유료생성·PC재가동0.

### 2026-10-26 Mac→PC 맵 실행 보충안 참조 전달

총괄 전달과 원격 ref/file tree 확인: 별도 docs-only `codex/ch1-unity-map-plan-20261026`의 `0eb4991ab6cc37ff4d9ee134e966d62ccdb33b75`에 `docs/4.1맵디자인+설정/CH1_1_UNITY_HIGH_QUALITY_MAP_PLAN_20261026.md`, `meshy-map-pipeline-20261026.md`, `unity-map-render-contract-20261026.md`, `figures/CH1_1_MAP_BLUEPRINT_20261026.png`, `figures/CH1_1_R2_CAMERA_COMPOSITION_20261026.png`가 있다. 상위 맵 기획의 CH1-1 실행 보충안으로 art bible 명도·재질 후보, 8QA 좌표, 기술 제약과 이견표를 문서 대조 대상으로 전달한다. Meshy는 M1까지 PC 단독 호출·공유 `credits.log` 기록, Mac 호출0으로 전달받았다. 이미 인증된 DPAPI launcher를 전제로 `setx`/`.zshrc` 평문 키 등록은 제안하지 않는다. **이 행은 참조 수신 기록이며 제품 코드/맵 자산 병합·제작·시각 PASS·PC 수신/합의 완료가 아니다.** Mac ar 작업 소유는 유지한다.

## 2026-10-25 Unity web language-menu parity COMPLETE

Bounded menu/input unit; existing storage preserved. [Contract](../UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md).

# 공동 작업판 (Claude 총괄 ↔ Codex 총괄) — 단일 기준

## 2026-10-25 사용자 지정 세계관 정본 적용·웹 표시 수정 완료

최신 정본은 사용자가 직접 첨부한 world_intro_v22b_steam.mp4/102,204,634B/SHA3b99d59b...다. 기존 최신본미확정 판단 종료. 같은 Mac 구현 담당이 정확 파일 적용·재생·전환을 우선하고, 기존 지원 담당은 파일 인수만 담당한다. [정본과 실제 적용 상태](../UNITY_WORLD_INTRO_CANONICAL_20261025.md). 정본+표시 source d789dd1ae 원격 보존, ARM64 errors0, 정본12/12 자연완주·7PNG 확인. 일반 실행도 열었으며 사용자 전사 이야기 진행 중 보존. 다음은 언어 메뉴 입력 확정과 기존 웹 시각/저장 흐름 차이 제거. 신규 업데이트는 이식/비교검수 이후다.

## 2026-10-25 Mac 누적 실행본·소지품 키보드 완료

정상 한국어 로비 PID35707을 열어 사용자 조작 가능한 누적본을 확인했다. [실행 경로·포함 범위·대표 캡처](../UNITY_MAC_PLAYABLE_20261025.md). 같은 담당이 소지품 방향키/G/C/Enter·상세 스크롤·포커스 차단을 연결했다. 모델33/33·Player17/17·8PNG·실제 최소화/복원 후 해제·키보드 PASS. ARM64 errors0, 직접 실행과 macOS 앱 실행의 포커스 차이를 기록했다. [검수 완료](../UNITY_MAC_INVENTORY_KEYS_20261025.md).

## 2026-10-25 Mac 일시정지·설정 키보드 완료

원본 UI 우선 후속: 선택·값 조절·뒤로/재개·종료와 창 포커스 복귀 차단 완료. 모델33/33·Player21/21·실제 키보드/창 최소화복귀 PASS, 표시 잘림 수정 후8PNG·최종 ARM64 errors0. NEXT: 소지품 키보드 선택·비교/상세·장착/해제. 이번 코드·빌드·검수 마감. [범위와 결과](../UNITY_MAC_PAUSE_KEYS_20261025.md). 기존 담당만 NativeGame/NativePauseMenu·빌드·공유 docs 소유.

## 2026-10-25 Mac 신규 전사 이야기·생성 진입 완료

원본 영상·29×22자막,22cut/1.2초hold/1.2초gate 연결. 모델41/41·실제 skip15/실패7/자연완주8=30/30, ARM64 오류0. CUA 격리 저장으로 생성 Enter1.6초·짧은Esc/긴Esc·같은이름의실제플레이진입 확인, 저장revision1회증가·검수앱종료. [인수 기록](../UNITY_MAC_WARRIOR_STORY_20261025.md). 전투진행save/패드/전체다국어font·RTL은별도. **NEXT:** 남은 일시정지/설정 키보드 조작·메뉴 focus 복귀.

## 2026-10-25 Mac 캐릭터 삭제·목록 저장 완료

삭제 모델58·복원13·디스크53·삭제 Player9·새 프로세스4회 저장16/16 통과. 최종 ARM64 오류0, 한/영2해상도 표시·CUA 기본취소/확인삭제·긴Enter 입력 차단과 정상 부팅 확인. 캐릭터 이름·선택만 새 Unity 파일에 저장하며 전투 진행/기존 save는 별도. [인수 기록](../UNITY_MAC_CHARACTER_SLOTS_20261025.md). 다음 원본 신규 전사 story(22cue/1200ms 스킵)→미리보기 진입을 착수했다. 지원은 원본 추출/독립 계약, 기존 담당은 NativeLobby/Flow·GPU·공용 docs 소유 유지.

## 2026-10-25 Mac 세션 캐릭터 생성·선택 검수 완료

기존 스킬 마감 후 대기 상태를 확인하고 동일 담당이 구현했다. 원본 이름/5슬롯/전사만 생성 제한·세션 목록→선택 이름의 실제 preview 진입 연결. 새 모델41/41·Player행동16/16·CUA 일반 키/한글붙여넣기/중복/선택 진입 확인, 최종 ARM64 build 오류0·표시9장 확인. 영속 저장·IME 직접 조합·자동 마우스·전체화면은 미인수. [범위와 영수증](../UNITY_MAC_CHARACTER_UI_20261025.md). 검수 CLI 종료, 새 팀·자동화·PC 재가동 없음. **NEXT:** 원본 캐릭터 삭제 확인/취소·선택 갱신을 세션 목록에 연결하는 남은 메뉴 단위. 전체 이식 완료나 상시 자동 실행을 의미하지 않는다.

## 2026-10-25 Mac 스킬 상세·슬롯 UI 검수 완료

K 창·원본13슬롯 선택·기검참 상태/충전 HUD 연결. 모델34/34, 최종 Player6/6, ARM64 빌드 오류0, 720p/1080p 화면 확인. CUA K/숫자/End/ESC 조작과 최종 제목 잘림 수정을 검수했다. 전체 스킬 실행기·포지·저장은 미이식. [범위와 근거](../UNITY_MAC_SKILL_UI_20261025.md). **NEXT:** 캐릭터 생성·선택과 슬롯 세션/저장 경계. 원본 이름2~8자·금지문자·중복·최대5슬롯을 확인했으며 캐릭터 코드는 아직 변경하지 않았다.

## 2026-10-25 Mac 장비 비교·일시정지 설정 통합

**이번 단위 완료:** 장비 비교156·지원 설정66·실제 Player15검사 통과, ARM64 build 오류0·화면8장 확인. OS 직접 메뉴 입력과 전체화면 전환은 미검수. **NEXT:** 스킬·퀵슬롯 → 캐릭터 생성·슬롯 → 남은 메뉴. 기존 담당이 원본/기존 기능 범위부터 연결하며 새 자동화·신규 팀을 만들지 않는다. [통합 범위](../UNITY_MAC_INVENTORY_SETTINGS_20261025.md). 언어 해상도 진단은 [근거 보존](../UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md) 후 마감, 자동 마우스/본문 글꼴·RTL은 미완료. 영상·offset·저장·PC·자동화 변경0.


## 2026-10-25 Mac 로비·시네마틱 언어 선택 연결 완료

동일29개 이름 목록/2열 키보드, 실제 EN자막 변경·Esc6초 목록취소의 skip차단·키해제 후 정상skip·KO로비복귀 확인. 일반build 오류0. [최종 입력 검수](../UNITY_MAC_CINEMATIC_LANGUAGE_20261025.md). 검수 앱은 한국어 로비로 열어뒀다. **NEXT:** 29개 자막 본문 글꼴/RTL과 새 목록 해상도·정밀 마우스 입력의 미완료 범위를 실제 근거로 좁힌다. 영상/offset/저장/전투/PC/자동화 변경0.


## 2026-10-25 Mac 로비 언어 이름 완료 → 시네마틱 선택 통일

23원문 이름·6개 ko/en 대체 이름으로29목록 가독성 개선. 실제 한/영 화면과2열 키 입력 확인, 일반 build 오류0. [검수](../UNITY_MAC_LANGUAGE_NAMES_20261025.md). **NEXT/ACTIVE:** 같은 담당이 시네마틱 언어 선택의 이름/키보드/닫기 규칙을 연결하고 장면넘김 입력 누출을 차단한다. 전체29자막 폰트/RTL은 별도. 영상/offset/저장/전투/자동화 변경0.


## 2026-10-25 Mac 로비 팝업 조작 검수 → 언어 목록 가독성

일반 Mac 빌드 오류0. CUA 실제 L 열기·FR 선택·Esc 취소·마지막 AR 경계·Tab KO 순환·바깥 클릭 닫기를 확인했다. 작은 selector 마우스 입력은 미확인, Unity 실행 차단 아님. [결과](../UNITY_MAC_LOBBY_POPUP_20261025.md). **NEXT/ACTIVE:** 같은 담당이 언어 목록의 자국어명 가독성·기존 폰트 지원 범위를 조사한다. 기존20/9·536/42 반복0, 영상/저장/전투/PC/자동화 변경0.


## 2026-10-25 Mac 로비 자막 선택 완료 → 팝업 조작 진행

로비29선택·메뉴 ko/en 구분, 원본 locale alias/unknown→en 연결. 순수536/536·Native42/42, 원본 목록 순서 수정 후 ARM64 일반 빌드 오류0. 정상 CUA 기본 표시와 probe의 KO/FR/PTBR 렌더를 구분했으며 OS selector 클릭은 미인수. [근거](../UNITY_MAC_LOBBY_LANGUAGE_20261025.md). **NEXT/ACTIVE:** 같은 Mac 담당 NativeLobby 팝업 Esc/바깥 클릭 닫기·키보드 선택·입력 누출 방지. 자국어명/RTL 전체 현지화 미완료. 기존20/9 재검·영상/저장/전투/PC/자동화 변경0.


## 2026-10-25 Mac 로비 표시 완료 → 언어 선택 연결 진행

로비 개발 오버레이 제거/우측 preview·저장 불가 안내 구현, 소스 전용 새 Mac QA에서 build errors0 및 CUA 실제 로비 화면 확인. 기존20/9 suite 재검0. 중복 소스/TypeDB 캐시 실패도 보존. [이번 결과](../UNITY_MAC_LOBBY_COPY_20261025.md). **NEXT/ACTIVE:** 같은 Mac 담당이 NativeLobby 언어 표시/29자막·ko/en메뉴 구분을 연결한다. 지원 담당은 별도 산출물 경로의 순수 locale alias resolver만 소유하며 공유 INDEX/GPU/빌드는 수정하지 않는다. 영상/offset/전투/저장/자동화 변경0.


## 2026-10-25 Mac 시네마틱 조작 — 최신

재생중일시정지버튼을연결하고 별도controls fixture에서 pause/resume·focus복귀9/9PASS. 최초8/9실패는기존fixture강제focus복구간섭으로분리수정했으며기본클라이언트재생코드는보존. Mac일반build0오류/실제라벨2PNG확인. OS직접입력/최신영상승인/전체디자인미인수. 다음은로비개발문구·조작안내정리. unity자동화현재상태는TOML부재로재확인불가,중복생성0. [변경·실측·경계](../UNITY_MAC_LOBBY_CONTROLS_20261025.md).


## 2026-10-25 Mac 로비·인트로 실제 재생 — 현행

동일 일반앱의 첫 실행은 Metal 표시 대기/101초 무진행으로 실패 기록했다. 단일스레드 비교와 기본옵션 재검수는 각각20/20PASS,113초 자연끝·2718frame·5영상/자막/음성/BGM/로비전환·replay/holdskip 모델경로 확인. 기본옵션도 성공해렌더링설정 영구변경0, 최초멈춤원인 미확정. 런타임/영상교체0. 다음단위는 pause/resume·focus 복귀와 조작UI 원본대조/짧은실제검수. [결과·경계·다음행동](../UNITY_MAC_LOBBY_20261025.md).


## 2026-10-24 Mac 원본 재감사·중앙 HUD 재설계 — 현행

후속결과: Mac6000.6.7f1격리 compile/verify 및ARM64일반build오류0. HUD3×6·인벤3×10자동검사PASS,실제18PNG/3해상도. 마지막HUD키보정도재빌드·실화면확인. CUA직접mouse좌표불일치로클릭/드래그인수미완료,전체디자인승인미완료. [화면·검수](../UNITY_UI_COMPOSITION_20261024.md#실제-mac-검수-결과).

v22b 최신 승인 주장을 철회하고 원본 비교를 마쳤다. ROOT v15/main v17/Unity v22b selector 차이,30개 복사본 SHA 일치,27개 source ROOT/main blob 일치를 확인했으나 최신 승인본은 미확인이다. 영상 교체0. 사용자 최신 디아블로식 방향에 따라 중앙 약1040px HUD,640px 장비/600px 가방·상세와 중앙시야를 설계·구현 중이다. 이전 도킹 PASS는 당시 좁은 범위의 이력이다. [원본 감사](../UNITY_SOURCE_BASELINE_20261024.md), [현행 설계·검수](../UNITY_UI_COMPOSITION_20261024.md). PC 개발/세이브/맵/전투 확장0.

Hub는 사용자가 로그인하고6000.6.7f1 설치를 시작한 화면을 확인했다. 기존6000.4.8f1 프로젝트 버전은 보존하며 Editor 설치 완료 후 별도 검수본에서 확인한다. 이전 약관 대기 기록을 현재 미해결 상태로 반복하지 않는다.

## 2026-10-24 Mac Unity 인수 — 최신

사용자 “이제 맥에서 다 해라”의 PC 인계를 받아 Mac Codex가 `codex/unity-mac-20261024` / `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`에서 인수했다. 원격 `ffa85d62`/tree6068a62 대조, v22b byte-exact 복구 완료. 현재 소유 변경은 Editor 빌드 타깃·출력과 관련 docs뿐이며 기존 런타임은 그대로다. Hub 약관 확인·로그인/라이선스가 선행조건이고 Mac Editor/Player 인수는 미완료다. PC 개발·과거 팀 재가동0. 아래 ACTIVE 표기는 과거 PC 이력이며 최신 인계의 PC heartbeat PAUSED가 우선한다. [실제 인수·다음 행동](../UNITY_MAC_TAKEOVER_20261024.md).

## 2026-10-24 UNITY-LOBBY-01 — 로비·인트로 최우선

사용자 최신 “일단 게임 로비부터 인트로 시네마틱같은것들만 잘 옴겨”. PC Codex가 기존 소유 Unity 브랜치에서 NativeLobby/Video/CoreLobbyFlow·NativeGame 진입/차단·원본 미디어·자기 Tools/docs 소유. G:index 흐름 + 사용자 최신 v22b override 기준 FDG→타이틀→ENTER문→세계관→로비 연결, Core65/영상adapter13·정적0오류/실제Editor 미디어29×32검사PASS. Windows/Player 영상·음향·화면 검수는 진행 중. 계정/캐릭터 생성/기존 저장은 미이식 표시, Godot/원본/공유main INDEX480·세이브·기존창 보존. 자동 heartbeat도 로비/인트로 우선으로 갱신했다. [현황·근거·미완료](../UNITY_LOBBY_20261024.md).

## 2026-10-24 최신 우선순위 — UI/UX 이식 후 Unity 재제작

사용자가 UI/UX와 재사용할 기존 아트·데이터를 먼저 제대로 이식하고, 이후 Unity에서 맵·모션·이펙트 등을 대부분 새로 제작할 방향을 확정했다. 직전 자동 진행의 드랍 생성/획득 최우선은 교체한다. 다음 단위는 원본↔Unity UI/UX 미완료 현황표와 가장 중요한 미이식 화면/상호작용이며, UI 실제 동작에 필요한 최소 기반만 함께 연결한다. 기존 전투·표현·Godot본은 보존한다. 기존 heartbeat exoduser-unity도 새 방향으로 갱신했으며 ACTIVE/10분 간격을 유지한다. [현재 작업 범위](../UNITY_UI_FIRST_REBUILD_20261024.md)가 아래 과거 전체 이식/비교 기록에 우선한다.

## 2026-10-24 UNITY-INVENTORY-01 — 시작 장비·가방 화면

PC Codex / codex/unity-port-20261024 / 새 Inventory core·NativeInventory·Simulation adapter·원본 이미지 복사·자기 Tools/docs 소유. 원본 장착15/마법가방10/20어픽스 보존,909검사 및 기존93/7/26/130/36회귀 통과. 화면/Tab/장착·해제·정리/drag/no-heal 연결. 실제Editor JSON null 오류 수정 후PASS, Windows build0오류·Player inventory10/10·전투6/6(4처치/8소리) 및 PNG3장/release확인. tracked18파일복구909/909와core compile0도확인. VISUAL RETOUCH/수동입력·조건부 전투효과·저장·드랍생성/전체이식 미완료. Godot/웹/공유main INDEX480·사용자 세이브 보존. [상태와 한계](../UNITY_INVENTORY_20261024.md).

## 2026-10-24 UNITY-HUD-01 — 원본 자원 표시

PC Codex / codex/unity-port-20261024 / NativeHud·HudValues·shader·원본 아이콘/폰트 복사·자기 Tools/docs 소유. Model130/130·기존93/7/26·기본맵36/36·정적0오류. I: 독립 실제Editor/GPU3상태·Windows build0오류·HUD Player6/6·전투회귀6/6(4처치/소리8회),PNG3상태+release 픽셀검토까지 확인했다. Git tracked20파일만 복원한HUD130/130도통과했다. VISUAL RETOUCH 유지. CSS 전체 filter/전체 HUD·미구현 스킬을 추가한 것으로 확대하지 않는다. Godot/웹/공용main/INDEX480·기존창 보존. [상태·검수](../UNITY_HUD_20261024.md).

## 2026-10-24 UNITY-FEEDBACK-01 — 기검참 명중광·원음

PC Codex / codex/unity-port-20261024 / unity Runtime·Editor·Tools·원본 미디어 복사·관련 docs만 소유. Core26/26·기존93/7/36·정적 컴파일0오류 및 실제 Editor/import/frame sequence·Windows build(errors0)를 통과했다. I: 독립 복사본의 실제 Player에서4처치·음향8회재생/출력peak.30688885·명중광4/완충광1·PNG5종을 확인했다. 전체 시각은 RETOUCH, 수동 플레이·EQ/compressor·고FPS clock·전체 이식은 남아 있다. Godot와 열린 Editor·공용 main INDEX480경로는 보존한다. [상태·미완료·검수](../UNITY_FEEDBACK_20261024.md).

## 2026-10-24 사용자 지시 — UNITY-PORT-01

최우선 방향 정정: “고도는 남겨두고 유니티도 해보는거야 뭐가 더 쉽나”. Godot를 유지하고 Unity도 시험해 같은 범위의 구현·수정/회귀·원본 재현·실행 안정성을 비교한다. 최종 엔진은 미확정이다. 이 아래 초기 ‘Unity 전환’ 표현은 확정 결정으로 읽지 않는다.

최신 실행 경계: 초기 license 종료198은 해소됐다. 실제 Editor 검사와 Windows build(Succeeded/errors0)를 통과했고 실제 Player 자동이동 X4020→4101.58496·120f차지/해제·4처치·PNG4종을 확인했다. VISUAL RETOUCH(시작구간). 현재 새 시작 메뉴 창을 열어두었다. 첫 Cubemap오인 import는 Texture2D 명시/GetVersion1로 수정했다. 아래 초기 “license 차단” 문장은 이전 기록이다. 전체 게임/수동 플레이 인수는 별도다.

추가 지시 “고도본도 저장해두고 유니티도 한번 해봐”: Godot4,979파일/2,071,696,605bytes를 I: 별도 보존본으로 복사하고 전 파일 SHA256 및 증분 Git 번들을 검증했다. Unity 기본 스킬을 기검참으로 연결하고1·2타/3타 홀드·40/80/120f 차지·검기 관통/벽/LOS·적 포이즈 및 원본 실버 시트/잉크/잔상 표현을 추가했다. 초기 라이선스 차단 뒤 실제 Editor/build/Player를 확인했으며, 초기 기본 무기 검증과 기검참 대조 기록은 [현재 보고서](../UNITY_PORT_20261024.md)에서 구분한다. 후속 명중광·차지 섬광·원음5개는 UNITY-FEEDBACK-01로 연결한다. 원본 hitstop은 소비 직전0으로 비활성화한다.

Unity 비교 시험 담당은 PC Codex / `codex/unity-port-20261024` / 기존 소유 worktree의 `unity/`와 관련 docs다. Godot 원격 `7d67c4182`·공용 main/INDEX/WIP·사용자 세이브를 보존한다. 초기 독립 모델 검사와 license 종료198 뒤 실제 Editor/Windows Player 검사까지 진행한 경계는 [현재 상태·범위·다음 검수](../UNITY_PORT_20261024.md)를 따른다. 이전 Godot 통계는 Unity 진척률이나 난이도 비교 결과가 아니다.

## 2026-10-23 PC Codex 인수 — PORT-TAKEOVER-01

2026-10-24 후속 `PORT-TAKEOVER-03`: 같은 PC Codex가 G17 모체 산란의 `SFX.magic(3)` 중 원본 `fire_magic1` 샘플 레이어를 연결했다. Main의 G 전용 sample 진입·G sfx 분기·기존 runtime 검사·원본 MP3 1개·관련 docs 범위. **격리 기술 검수 후보**: WASAPI 집중122/0·G204/0(실제 모체 caller2회)·sound45/0·ERROR0. 돌진/그로기·마법 합성 DSP는 실제 출력 adapter 부재로 미이식 유지하며 다른 소리로 대체하지 않는다. 원본 모체 AI/자식 생성·피해·Q/E·저장·맵 및 공용 main 무수정. [보고서](reports/PORT-TAKEOVER-03_REPORT.md), 최종 SHA/근거 `I:/EXODUSER-Storage/qa/port-magic-20261024/DONE.json`.

2026-10-24 사용자 지시 "이식작업 여기서 계속하자"로 같은 인수 브랜치에서 재개했다. `PORT-TAKEOVER-02`는 G 이동음 7원본 MP3, Main의 공용 sample queue 진입 함수, G `play_sample`, 기존 G runtime 검사 및 sound40의 AUDIO-01 기대 경로 정정과 관련 docs만 소유한다. **격리 구현·기술 검수 후보**: G190/0·sound45/0·shield166/0·kill47/0, WASAPI 이동음107/0·실제 노드5·ERROR0. 연속47h는11PASS/7NOT_READY이며 전체 이식/자연 보스 완료가 아니다. 기존 actor/전투/맵/저장 owner와 타 팀 WIP는 보존한다. [검수·실패·미완료](reports/PORT-TAKEOVER-02_REPORT.md), 최종 원격 SHA 등 외부 근거 `I:/EXODUSER-Storage/qa/port-resume-20261024/DONE.json`.

사용자 직접 지시: "이식작업 니가 이어받아서 계속해 토큰세이브 MD나 다 보고". PC Codex가 이전 PC Claude의 중단 작업을 인수한다. 기존 PC/Mac 작업자를 자동 재가동하지 않고, 공용 main의 INDEX/WORK와 원 작업자의 WIP는 보존한다.

| 작업ID | 담당 / 브랜치 | 소유 범위 | 상태 |
|---|---|---|---|
| PORT-TAKEOVER-01 / PC-ENEMY-ACTORS | PC Codex / `codex/port-takeover-20261023` / `E:/exoduser-wt/codex-port-takeover-20261023` | G actor/kernel/spawn/decor 신규 4파일, 원 PC WIP의 factory/Main/E spawn/death FX/natural base/stage adapter/Player의 명시 7구역, G 전용 테스트·오라클, 자기 보고서와 현재 인계 문맥 | **격리 기술 검수·백업 후보 / VISUAL RETOUCH**. 최신 Mac 코드 `9734e2e79` 위에 보존 WIP를 3way 적용, 충돌0. 최종 GUI148/0·직접 회귀4종0실패·ERROR0. 원 폴더 무수정. 자연 플레이·웹1x·사운드 미완료 및 최종 제출 SHA는 [보고서](reports/PORT-TAKEOVER-01_REPORT.md)/외부 DONE.json 참조 |

기존 context pack 15종을 모두 읽었으며, 그 안의 10월20~21일 구현 현황은 당시 snapshot이다. 최신 계보는 17d → ENEMY-VIS → SWEEP-B2/B3 → E2E-TAIL-02 → G04-02이다. SWEEP-B4 문서-only 보류를 구현 완료로 올리지 않는다. 코드 main 병합·기존 사용자 실행판 교체·Steam 배포는 이번 후보 검수와 별개다.

> 이 문서가 **지금 누가 무엇을 하는지의 유일한 기준**이다. 새 작업을 시작하거나 끝낼 때 양쪽 총괄 모두 이 표를 먼저 읽고 갱신한다(경로 지정 커밋, 문서만 main 직접 push 허용).
> 상위 계획: [FDG_GAME_DEVELOPMENT_PLAN.md](../FDG_GAME_DEVELOPMENT_PLAN.md) · 사용자용 현황: [FDG_GODOT_PORT_STATUS.md](../FDG_GODOT_PORT_STATUS.md) · Mac 지시서: [MAC_ORDERS_20261020.md](MAC_ORDERS_20261020.md)

> **2026-10-20 저녁 사용자 지시로 역할 전환**: "자동작업은 이제 맥북만 24시간 켜둘꺼니까 거기서 하는거야", "너는 가끔 PC에서 잘 구동돼나 테스트정도만 하면됄듯".
> - 작업 배정·검수·**main 병합 = 맥북총괄(Mac Claude)**. 아래 공통 규칙 1의 "Claude 총괄"은 이제 맥북총괄을 뜻한다. 병합 전 검수 기준은 그대로다(원본 행 대조, 병합본 위 독립 재실행, 회귀 목록, 정확한 경로 스테이징, force 금지).
> - PC Claude = **PC(Windows) 구동 테스트 담당**. 가끔 main을 PC Godot 4.7.2로 돌려 회귀와 실창 동작을 확인하고, 결함은 이 표에 행으로 올린다. PC에서는 새 자동 작업을 배정하지 않는다.
> - PC VS Code Codex에서 이미 돌고 있던 P2-006b·P2-008b(+P2-008a-FIX 우선)·P2-009a는 PC가 켜져 있는 동안 계속 진행한다. 결과 브랜치는 맥북총괄이 검수한다. PC가 꺼져 멈추면 Mac이 인수한다.

> **2026-10-20 사용자 운영 원칙(확정)**: "PC는 수동작업 전용이고 맥은 자동전용", "총괄은 클로드 코딩작업은 코덱스". → 자동으로 도는 구현·추적은 Mac Codex, 배정·검수는 Claude(Mac 맥북총괄 = 자동 트랙, PC Claude = 사용자가 직접 시키는 수동 작업). PC Codex 신규 자동 배정 없음.

> **2026-10-20 사용자 지시 "대기 중인 검수 건은 PC에서 병합해. 병합본 테스트 재실행 후 main에 넣어."** → PC Claude가 11+1건 병합(3f73456fa~2826b6738). 최종 main 기본 회귀 18종 중 17 PASS, p1002g 1실패(P2-008a-FIX 대기).

## DEMO11-24b · 2026-10-21 Mac 후속

- 동일 브랜치 인수5a3af410에서 이어감. 306id 분류=게임14/PC50/드랍0인id0/소비 미확인242. 기존 게임 시스템 owner13id를 값 캐시로 연결, 신규131/0·원문13사례 일치·직접 회귀6종 각1회4167/0·최종ERROR/누수/잔류0. 실제 intro 뒤 회복 identity 인계는1회·owner/clock guard 유지. Main+23/-3/State0/보호·저장0. 수동 퀵슬롯 potionCdRed1id 및 원본 소비 미확인242개는 미완료로 남기고 PC50+기존72/혼합 부분은 pc-iface-pack 인계. [후속 보고서](reports/demo11-24b_REPORT.md) 및 `_out/demo11-24b/`.

## DEMO11-24 · 2026-10-21 Mac 단위

- 담당: 이 Mac Codex 창. main0138c5bb + 22r d276e02e 정상merge 기준. 데모 affix 후보398레코드/396id 전수·원본 롤 빈도 표 작성, 기존 PC 재계산 소비18id 실제 Main 검증639/0·원문18사례360필드 불일치0. hurtE72id·기타306id 및 native 데모금지필터 차이는 미완료 인계. Main/State/보호/저장0줄, 장착 receipt 관찰 +1줄. 직접 회귀2종 각1회735/0·ERROR/누수/잔류0. 제출은 [보고서](reports/demo11-24_REPORT.md) 및 `_out/demo11-24/`에 기록한다.

## DEMO11-22r · 2026-10-21 Mac 단위

- 담당: 이 Mac Codex 창. 최종 main `0138c5bb` 정상merge `da098350`, PC runtime `a28117c1`/드랍 종료수정`72e602d1` 포함. 실제 INV17슬롯 장착/해제·PC equipment refresh·rollback·DEMO11-27 이전 continuation 기능 검증 완료: 신규442/0·직접회귀2614/0·ERROR/누수/잔류0. 전투 핵심/피해식/저장/UI owner 변경 없음. 제출 근거는 [단위 보고서](reports/demo11-22r_REPORT.md)와 외부 `_out/demo11-22r/`.

## DEMO11-23 · Mac BLOCKED

- main0138c5bb+22r d276e02e. SV-SHARED는 계산 전용이며 actual STORAGE owner/입출고 부재. 제품0줄·계산회귀149486/0·실제 UI/IO 미검수. [필요 인수](reports/demo11-23_REPORT.md).

## DEMO11-23b · 실제 공유창고/가방 UI 검수 대기

- 기존06c State/IO·22r 장착을 단일 owner로 재사용. main0138+완료06c93f 정상merge fb76706(미병합 의존 명시). 신규1286/0·집중10/0·직접회귀150073/0·3캡처 준비, 전투0/번역CRLF 보존. [보고서](reports/demo11-23b_REPORT.md).

## 역할 (2026-10-20 사용자 지시 기준)
| 역할 | 누구 | 하는 일 |
|---|---|---|
| Claude 총괄 | PC Claude 세션 "Godot PC/Mac 이식 작업 지침" | 작업 배정·검수(원본 행·테스트 독립 재실행·화면 1x 확인)·main 병합·계획/현황 문서 |
| Codex 총괄 | Mac Codex(ROOT/ENGINE) | Mac 쪽 Codex 작업 배정·진행 관측·Mac 실행 인수, 이 표 갱신 |
| 맥북총괄 | Mac Claude 세션 | Mac 검증(실창 플레이·녹화), Codex 터미널 진행 관측·SHA 보고 |
| 실행 원칙 | 사용자 | "맥북으로 거의다", "단순업무는 코덱스", "토큰도 다 쓰고 환경도 다 쓰고" |

## 공통 규칙
1. **main 병합은 Claude 총괄만**(검수 후). 다른 모두는 자기 브랜치(`codex/…`, `claude/…`)에 커밋·push만.
2. 작업 시작 전 아래 "진행 중" 표에 행 추가 + **소유 파일** 기재. 다른 행의 소유 파일은 수정 금지(필요하면 그 담당에게 요청 또는 보고서에 기재).
3. 작업 끝 = 보고서(`docs/engine/orders/reports/<작업ID>_REPORT.md`, 자기 브랜치) + 이 표의 상태를 "검수 대기"로 + 브랜치명·SHA 기재.
4. 원본 행 근거·수치 무조정·가짜 PASS 금지·원본 에셋 바이트 복사·격리 사용자 폴더·2_3/Q·E/세이브 불변 — 계획 문서 규칙 그대로.
5. 같은 일을 두 곳에서 하지 않는다. 비어 보이면 표를 먼저 확인.

## 진행 중 (2026-10-20 갱신: Claude 총괄)

DEMO11-44: Mac Codex / `codex/demo11-44-20261021` / NativePets·catalog/generator·Main357 추가1줄·자기 tests/docs. 기존9 ID 추가69/102, 신규75/0·Node10/0. 제품 피해·회복/State writer 변경0, 자연 전투·시각 미확인. [보고서](reports/demo11-44_REPORT.md).

| 작업ID | 내용 | 담당·환경 | 브랜치 | 소유 파일(다른 담당 수정 금지) | 상태 |
|---|---|---|---|---|---|
| DEMO11-32 | 화마귀 family tick·탄·사망·aggro 소비자 | Mac Codex | codex/demo11-32-20261021 | 신규 FD전용2파일·Main342/3058–3064·State1589–1594·자기 테스트/docs | **부분 구현·통합 BLOCKED** — source18사례/초기8·실제35 작은탄 검증. 큰탄 specialized/PC contact·hit/실제clock·MAP11 Marker 미인수, 31과 통합 후보 기록. 신규906/0·예산2/0·기존51/0(총959/0), 최종 수치는 [보고서](reports/demo11-32_REPORT.md), 보호/35/맵0줄 |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |

| DEMO11-38 | stageClear 다음→demoEnd·위시리스트/데모 로비 | Mac Codex | codex/demo11-38-20261021 | Main/State 종료 접점·native_demo_end_*·native_demo_lobby·새 scene/test·자기 docs | **시각 PASS·반송 merge 검수 대기** — 최초183/0·반송38/17/PC refresh439/0, 예상 거부ERROR1 외0. stage1 생성0/중복 clear 거부·실제 Tree pause/구 Main 해제. 1920×1080+1x crop, DEMO11-37 신호 직접 주입(사망 연동未). Main+20/State+15, 최종SHA는 _out/demo11-38/DONE.txt |


| DEMO11-09 | 데모 일시정지·입력 프로필·설정 인계 | Mac Codex | codex/demo11-09-20261021 | Main pause 접점·native_demo_pause_menu·신규 test·자기 docs | **일부 화면 자료 준비 / 설정 BLOCKED** — pause·back·resume/기존 BINDS 안내153/0 각1회. S01 missing3/S10 부재·설정writer미인수, Main+10/-0·State/전투0. 전체완료아님, 캡처 _out/demo11-09/captures/, 최종SHA는DONE |


| DEMO11-19ui | 성장 별자리·투자/환불 계획·예약 UI | Mac Codex | codex/demo11-19ui-20261021 | native_growth_panel·추출 data/SVG/tool·신규 test·Main 설치6줄·자기 docs | **검수 대기** — 19r0c136318 merge·기능/관련709/0·최종 렌더12/0·전체2장/1x4장, 사용자 눈 검수 대기. 보고서 demo11-19ui_REPORT.md |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |
| DEMO11-19r | 실제 성장 투자/리셋/예약→PC refresh·XP 순서 | Mac Codex | codex/demo11-19r-20261021 | State 성장/XP 접점·Main event API·native_demo_growth_owner·신규test/oracle·자기docs | **기술 검수 대기** — 신규383/0(원문24)+기존6suite2827/0=3210/0. 실제PC거부복구2·XP순서, main에PC a28117c1 포함. HUD최소표시/full UI·저장IO未, 최종SHA는 _out/demo11-19r/DONE |

| DEMO11-09 | 데모 일시정지·입력 프로필·설정 인계 | Mac Codex | codex/demo11-09-20261021 | Main pause 접점·native_demo_pause_menu·신규 test·자기 docs | **일부 화면 자료 준비 / 설정 BLOCKED** — pause·back·resume/기존 BINDS 안내153/0 각1회. S01 missing3/S10 부재·설정writer미인수, Main+10/-0·State/전투0. 전체완료아님, 캡처 _out/demo11-09/captures/, 최종SHA는DONE |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | Main3069–3076·신규selected0 consumer·자기 테스트/docs | **부분 구현·통합 BLOCKED** —43 9b763da9 ff merge, selected0 기존 P3→실제World→43 origin. 1/4 자연등록·5/6 AI·PC 보호owner·source scheduler 미완, 5종벤치0(미충족). 신규48/0+관련338/0, P3 ObjectDB8 경고보존. [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |

| DEMO11-perf-enemy | 30/60 적 fixed-tick·상위10 profile·Mac 최적화 | Mac Codex | codex/demo11-perf-enemy-20261021 | World3206–3241 기하 질의·Flesh249–256 분리·신규test/tools/docs | 진단 제출: 동치+관련8825/0, native CPU 평균9.58%/10.31% 감소. 전체30개체 최대18.975/20.652ms로8.333ms 목표 미달, PC권위 OLD/NEW·동시Godot 한계 기록. [보고서](reports/demo11-perf-enemy_REPORT.md) |
| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |

| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | Main3069–3076·신규selected0 consumer·자기 테스트/docs | **부분 구현·통합 BLOCKED** —43 9b763da9 ff merge, selected0 기존 P3→실제World→43 origin. 1/4 자연등록·5/6 AI·PC 보호owner·source scheduler 미완, 5종벤치0(미충족). 신규48/0+관련338/0, P3 ObjectDB8 경고보존. [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |
| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |

| MAP11-PROD / DEMO11-45 | Main 실제 MAP11 provider·gate·상자 소비 | Mac Codex | codex/map11-prod-20261021 | Main/World map-only 접점·State transport/상자·신규 어댑터/테스트·자기 docs | **검수 대기 / 상자 PC 완료 대기** — Main37/0·상자26/0·관련170/0·map계약1case, 실제 provider/Marker 연결. [보고서](reports/map11-prod_REPORT.md) |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |
| DEMO11-20 | 실제 State addExp META-06 cap100·회복/표시/저장 인계 | Mac Codex | codex/demo11-20-20261021 | native_source_new_run_state.gd의 addExp 구역·신규 테스트/oracle·자기 docs | **검수 대기** — State cap100 실제연결·회복/표시/저장 인계, 신규214/0+관련1099/0=1313/0 각1회. State+62/−8·피해/Main/맵0줄, 저장IO未·collectorHOLD. 후속 aa1eaea5a merge·목록API0·자기코드추가수정0·관련4suite 각1회1313/0. 최종SHA는 원로그 DONE.txt |




| DEMO11-33 | 곰치4개체·Marker/실tick/물기/HP사망·aggro 인계 | Mac Codex | codex/demo11-33-20261021 | native_demo11_worm*·Main 설치/API·31 registry 보조field접점·새 tests/원본시트·자기 docs | **구현·검증 완료/통합 인수 대기** — main0138c5bb9+31/76bcae8d merge50f31d37. 기능9,339/0·벤치265/0 max2.460ms. MAP Marker/PC producer·자연전투 후행,32/보호경로0·helper 통합 제안만. [보고](reports/demo11-33_REPORT.md) |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |
| DEMO11-31 | 1-1 앵글러 family·Marker/기상/실탄/PC처치→지역 gate | Mac Codex | codex/demo11-31-20261021 | native_demo11_angler*·field energy carrier·35 registry field 접점·Main 설치/API·새 tests/원문asset·자기 docs | **검수 대기** — main45be76e4+37/05f41cc7 merge8992ef35. 기능1613/0+bench263/0 cleanPASS(max4.649ms), Main+6·registry+31/−4, State/World/PC 피해/패링·지형0. 실제Marker/PC producer·전용연출 후행. 최종SHA는 _out/demo11-31/DONE.txt |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | Main3069–3076·신규selected0 consumer·자기 테스트/docs | **부분 구현·통합 BLOCKED** —43 9b763da9 ff merge, selected0 기존 P3→실제World→43 origin. 1/4 자연등록·5/6 AI·PC 보호owner·source scheduler 미완, 5종벤치0(미충족). 신규48/0+관련338/0, P3 ObjectDB8 경고보존. [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |
| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |

| DEMO11-37 | P3 지역/앵글러 gate→Marker arena→PC 최종 사망→보상/기록/종료 인계 | Mac Codex | codex/demo11-37-20261021 | native_demo11_encounter/clear_result·Main 설치/API·State progression/reward·새 tests·자기 docs | **검수 대기** — mainac3764bf+35/38 정상merge=e7d855b6. 기능410/0+bench1회260/0 cleanPASS(max1.512ms), Main+14/State新32+既1줄수정. PC 사망/전투·맵0줄, provider접촉/PC最終producer 후행. 최종SHA는 _out/demo11-37/DONE.txt |
| DEMO11-20 | 실제 State addExp META-06 cap100·회복/표시/저장 인계 | Mac Codex | codex/demo11-20-20261021 | native_source_new_run_state.gd의 addExp 구역·신규 테스트/oracle·자기 docs | **검수 대기** — State cap100 실제연결·회복/표시/저장 인계, 신규214/0+관련1099/0=1313/0 각1회. State+62/−8·피해/Main/맵0줄, 저장IO未·collectorHOLD. 후속 aa1eaea5a merge·목록API0·자기코드추가수정0·관련4suite 각1회1313/0. 최종SHA는 원로그 DONE.txt |
| DEMO11-38 | stageClear 다음→demoEnd·위시리스트/데모 로비 | Mac Codex | codex/demo11-38-20261021 | Main/State 종료 접점·native_demo_end_*·native_demo_lobby·새 scene/test·자기 docs | **화면 비교 자료 준비·검수 대기** — 183/0, 예상 거부ERROR1 외0. stage1 생성0/중복 clear 거부·실제 Tree pause/구 Main 해제. 1920×1080+1x crop, DEMO11-37 신호 직접 주입(사망 연동未). Main+20/State+15, 최종SHA는 _out/demo11-38/DONE.txt |
| p2001i-diag | p2001i 종료 ERROR·ObjectDB/리소스 수명 진단 | Mac Codex | codex/p2001i-diag-20261020 | 자기 보고서·CHANGELOG·작업판 자기 행만(제품/기존 테스트0) | **검수 대기** — main6d987cb8 원문6종377/0·종료 ERROR/누수0, I 원문3회18/0. 외부 대기제거 대조에서 음성 MP3/Playback2객체·리소스1 ID일치 재현, 하니스 조기quit 판정. 보고서·최종SHA는 원로그 DONE.txt |
| DOC-SYNC | 오늘 통합분 원본 수치·설계 docs 동기화 감사 | PC Codex | codex/doc-sync-pc-20261020 | DOC-SYNC_REPORT.md 및 설계 문서10개 정정 구역(2_3 제외) | **검수 완료·main 병합(Claude 총괄)** — 설계 문서 10종 원본 기준 정정, 코드 무변경. 2_4는 P2-004b와 충돌 → 상세 문장 유지+정정 주석 |
| P2-001l | 패링 연습 단계 0~7·입력 제한(allows) | PC heavy 담당 | claude/p2-001l-lesson-steps-20261020 | native_parry_lesson_flow.gd 등 레슨 파일, player.gd·main.gd 입력 처리 함수 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 병합본 독립 재실행 9종 0실패(L·K·H·J·QE·5c·HUD·지역·시작스킬), 화면 RETOUCH·step1~7·챕터2 미이식 |
| P2-006a | 드랍 바닥 표시·줍기·인벤 반입 | PC heavy 담당 — **Claude 사용 한도로 중단**(작업 폴더 G:\exoduser-wt\p2-002a-hud에 진행분 보존) | claude/p2-006a-drop-pickup-20261020 | 드랍 렌더·줍기 신규 스크립트 | **기능 완료·main 병합 / 디자인 미검수(RETOUCH)** — 총괄 독립: world_drops 18/0·pickup_contract 17/0·HUD 36/0·시작 스킬 27/0. 원본 에셋 189개 해시 일치(Codex). 처치 직후 캡처에서 드랍이 피 효과에 가려 판독 불가 → P2-006b 화면 마감 | |
| TRACE-META | 3.2 메타·진행·14 밸런스 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a1586f-15cb(MAC-LIVE에서 전환) | codex/trace-meta-20261020 | FDG_SOURCE_TRACE_META_20261020.md | 검수 대기 — 30191be0d (맥북총괄 검수) |
| P2-006b | 드랍 화면 마감(피 효과 후 판독 캡처·라벨/빔 1x)·캡처의 LMB 슬롯 빈 칸 원인 확인 | PC VS Code Codex 4(P2-001l 후) | codex/p2-006b-pc-20261020 (`2c7342646`) | native_world_drops.gd 표시부·전용 검수 하니스 | 검수 대기 / RETOUCH — b933b2da5의 A 코드 누락을 이 브랜치에만 승인 제출본으로 보완. LMB는 A 하니스 weapon 강제 지정 원인(6/0), nearest 누락 RED1/1→GREEN1/0. 효과 카운트0 후 실제 좌표 1x·6등급 비교 완료, 밝기/그림자·OS 창 검수 미완. 상세 P2-006b_REPORT.md |
| P3-002 | 소환굴 시스템·후속 스폰·지역 처치 분모 | 클라우드 세션 cloud-spawnholes | claude/p3-002-spawn-holes | 소환굴 신규 스크립트, world 동적 등록 호출부 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 지역 초기화 순서 원본 31655 정정, 298/0·회귀 10종 0실패 |
| P2-007a | UI 마감: 원본 글꼴(나눔명조·Cinzel)·검기 색·인트로 가이드 패널 | 클라우드 세션 cloud-ui-polish | claude/p2-007a-ui-polish | assets/fonts, crescent.gd 색, 인트로 가이드 패널 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — PC(Windows) 병합본 p2007a 115/0(Malgun Gothic 실존 시 원본 CSS 3순위 체인으로 테스트 기대값 정정, 제품 무변경)·회귀 13종 0실패. p1002g 실패 1건은 main 선재(P2-008a 빙결전사 포이즈 경로)로 별도. 종료 resources 17 잔류 경고 |
| MAC-VERIFY | 최근 통합분 Mac 헤드리스 테스트 | Mac VS Code Codex 01a1586e-c1b7 | codex/mac-verify-20261020 (394c01388) | 없음 | **검수 완료·보고서 main 반영(Claude 총괄)** — 17종 실패 0, p1002e 검사 수 변동은 시작 장비 RNG(기지), stderr ERROR 3종은 QA-002 |
| QA-002 | 테스트 결정성(시작 장비 시드, 테스트 한정)·p2005b/c 종료 누수·p2003a dummy 텍스처 ERROR | Mac VS Code Codex 01a1586e-c1b7(맥북총괄 배정) | codex/qa-002-20261020 | 해당 테스트·(제품 결함 시 수정안만) | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — 병합본 10종+contracts 재실행: 10종 0실패·stderr ERROR 0(p2005c/p2003a 누수 해소 확인), p1002g 1실패는 main 선재 P2-008a 포이즈 결함(동일 라벨) |
| P5-001a | Mac 실행판·macOS export 점검 | Mac VS Code Codex 01a1586f-09bf | codex/p5-001a-mac-20261020 (67d625aaa) | 없음 | **검수 완료·보고서 main 반영** — Mac 네이티브 실행 CONFIRMED, 화면 관찰은 Godot 앱 제어 권한 미승인으로 BLOCKED, macOS 프리셋·4.7.2 export 템플릿 없음 |
| MAC-LIVE | Mac 실창 첫 전투 녹화 | Mac Codex(trace-meta로 전환) | codex/mac-live-20261020 (8b727b15b) | 없음 | BLOCKED — Godot 앱 제어 미승인으로 게임 창 녹화 불가. 부팅 렌더(Movie Maker 30초) 정상, 엔진 FPS 평균 138·최저 45(36표본) |
| MAC-TESTSWEEP | MAC-VERIFY 외 godot/tests 32종 Mac 헤드리스 | Mac VS Code Codex 01a1586f-2389 | codex/mac-testsweep-20261020 (cd6055eed) | 없음 | **검수 완료·보고서 main 반영** — 29 통과·3 미통과: starter_state 148/1(P3-003 병합 회귀, PC 재현 — STARTER-REGIONS 수정 배정), type3_spawn_recipe(외부 oracle 누락), windows_native_package(Windows export 전제) |
| STARTER-REGIONS | starter_state G 필드 수 기대값을 원본 지역 초기화 기준으로 정정(또는 제품 결함 보고) | Mac VS Code Codex 01a1586f-2389 | codex/starter-regions-fix-20261020 | test_native_main_source_starter_state.gd, STARTER-REGIONS_REPORT.md, 이 행만 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — P3-002 `_totalSpawned`(30625) 키 1개 추가 반영, 148/0 |
| TRACE-INVENTORY | 2_7 인벤토리·장비 원본 전수 추적·이식 설계(문서만) | Mac VS Code Codex 01a1586f-09bf(18:32 착수) | codex/trace-inventory-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만 |
| TRACE-QUICKSLOT | 2_8 퀵슬롯·물약 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-5597(18:32 착수) | codex/trace-quickslot-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, 이식 단위 7개 |
| TRACE-SAVE | 15 세이브·데이터 원본 추적·이식 설계(세이브 형식은 보호 범위 표시만) | Mac VS Code Codex 01a158a5-5a79(18:32 착수) | codex/trace-save-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, SV-CONTRACT부터 이식 |
| TRACE-SETTINGS | 3.3 키바인딩·설정 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-6274(18:32 착수) | codex/trace-settings-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, S01~S10 이식 순서안 |
| TRACE-REVIVE-SHIELD | 2_5 부활·에너지쉴드 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-6b36(18:32 착수) | codex/trace-revive-shield-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만 |
| QA-001 | 기존 실패 테스트 7종 원인 진단 | PC Codex(codex exec) | codex/qa-001-pc-20261020 | 지정 테스트 7종 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 실패 18건+스크립트 오류 1건 해소, 제품 코드 0줄, 총괄 독립 재실행 7종 0실패 |
| P3-001 | 맵 pit_poison 타원 충돌 계약 | PC Codex(codex exec) | codex/p3-001-pc-20261020 | engine/fdg/map-source-adapter.js, godot/data/map.json, 맵 계약 테스트 | **검수 완료·main 병합(Claude 총괄 대리 커밋 3081760c5)** — Godot 195/195·Node 10, 실창 미검증 |
| P2-004b | 펫 대사 카테고리 160여 종 | **PC Codex**(codex exec) | codex/p2-004b-pc-20261020 | native_pets.gd 대사 테이블 | **검수 완료·main 병합(Claude 총괄)** — 원문 171/0, 대사 822/0, 런타임 10/0, 펫 회귀 20/0, Node 1/1(총괄 독립). 선언 연결 60·데이터 전용 111, 자연 발화 전체·실화면 미검증 | |
| P3-003 | 지역 시스템 | Mac Codex ENGINE(채택) + PC 총괄 통합 | codex/p3-003-20261020 → main | native_regions.gd 등 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 42702 _regKill 연결 포함 |
| FEATURE-INVENTORY | 전체 기능 분모 표·이식 상태 판정 | **PC VS Code Codex 1**(P3-003 중복 배정을 중단하고 전환 — P3-003은 Mac ENGINE 단독) | codex/feature-inventory-pc-20261020 | docs/engine/FDG_FEATURE_INVENTORY_20261020.md | **main 병합(Claude 총괄 2026-10-20)** — 1,061행 분모, 완료(격리) 6·실플레이 0 |
| SV-CONTRACT | 세이브 5경로 key set 계약 테스트(제품 무변경) | Mac Codex 창6 01a158a5-5a79 | codex/sv-contract-20261020 | tests/test_native_save_contract.gd(신규) | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — PC Windows 병합본 3,023/0(실행 시 `-- --node-bin=C:/nvm4w/nodejs/node.exe` 필요: 기본 node shim 깨짐)·contracts·starter 0실패 |
| QS-01 | 퀵슬롯 1번 단위: 신규 계산 모듈+테스트(공용 0줄) | Mac Codex 창5 01a158a5-5597 | codex/qs-01-20261020 | 신규 모듈·테스트만 | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — PC 병합본 318/0, 원본 28072·35894 대조 일치, 재생 바인딩·p2005d 재생·contracts 0실패. 자동 물약 런타임 연결은 다음 단위 |
| SETTINGS-S01 | 설정 원본 default 읽기 전용 view(source_options_state.gd 무수정) | Mac Codex 창7 01a158a5-6274 | codex/settings-s01-20261020 | native_settings_read_view.gd·test(신규) | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — PC 병합본 unit 112/0·actual_main 12/0(`-- --only=unit|actual_main` 필수), starter·HUD·contracts 0실패. OPT actual 35/누락 3(textScale·panelFit·diffV2) NOT_READY 유지 |
| TRACE-WEAPONS | 2_2 무기·활·속성 원본 추적(문서만) | Mac Codex 창4 01a1586f-2389 | codex/trace-weapons-20261020 | FDG_SOURCE_TRACE_WEAPONS 문서 | 진행 중 |
| TRACE-BOSS-CH1 | 8.1 1장 보스 무브셋·HP·패턴 추적(문서만) | Mac Codex 창8 01a158a5-6b36 | codex/trace-boss-ch1-20261020 | FDG_SOURCE_TRACE_BOSS_CH1 문서 | 진행 중 |
| TRACE-SKILLS | 2_1 스킬·합체 원본 추적(문서만) | Mac Codex 01a1589e-e914 | codex/trace-skills-20261020 | 추적 문서 1개 | 검수 대기 — 17255c3e9 (맥북총괄 검수) |
| TRACE-ITEMS | 7 아이템·어픽스 원본 추적(문서만) | Mac Codex 01a1589e-f8d5 | codex/trace-items-20261020 | 추적 문서 1개 | 검수 대기 — 33486451a (맥북총괄 검수) |
| P2-008a | 1-1 초기 미지원 적: etype20 빙결전사 exact 3개체(order4/10/12) | PC VS Code Codex | codex/p2-008a-ch1-enemies-pc-20261020 → main | enemy_melee_ch1_ice_warrior.gd·etype20 json·factory 등록 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 원본 39057~39060 빈 근접 분기·40499 _meleeET 제외·31154 _noProjEtypes[20] 확인(무공격 = 원본 동작), 병합본 14종 0실패, 지원 9/미지원 7, 화면·실플레이 미 |
| TRACE-CH1-ENEMIES | 1장 미이식 적 원본 추적(문서만) — PC P2-008a 구현과 겹치지 않게 P2-008a 범위는 참고만 | Mac Codex 01a1589f-0218 | codex/trace-ch1-enemies-20261020 | 추적 문서 1개 | 진행 중 |
| QA-005 | Mac Codex 구현 단위 | Mac Codex | codex/qa-005-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| QA-006 | Mac Codex 구현 단위 | Mac Codex | codex/qa-006-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| META-04 | Mac Codex 구현 단위 | Mac Codex | codex/meta-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| META-05 | Mac Codex 구현 단위 | Mac Codex | codex/meta-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| DEMO11-35 | BC09 실제 탄 출생·registry·tick/expiry | Mac Codex | codex/demo11-35-20261021 | [보고서](reports/demo11-35_REPORT.md) | 일반 탄 연결 제출(main 미병합). 신규53/0·BC09 56664/0·기존일반탄4그룹/0. bench1회 tick최대1.049ms이나 draw오류256으로 전체PASS제외→색fallback draw6/0, 재벤치0. PC 접촉/특수 owner·자연clock 대기 |
| DEMO11-34 | stage0 보스 actor·AI assembler | Mac Codex | codex/demo11-34-20261021 | [보고서](reports/demo11-34_REPORT.md) | 구현·격리 검증 제출(main 미병합). 신규195/0·BC01~10 354093/0·권위22/0·intro18/0. Main +17/-0; 실제 자연전투는 source clock/prefix 및 PC 보호 owner 대기. PC 피해·패링·HP/poise·부활 소유자 및 source clock/prefix 명시 ack 필요  성능 후속 main8dbbf2b0(aa1eaea5a 포함) 정상merge·13파일 목록API0·자체제품변경0; 관련8종654/0 각1회, main 미병합 |
| DEMO11-01 | 1-1 데모 실행 권위 | Mac Codex | codex/demo11-01-20261021 | [보고서](reports/demo11-01_REPORT.md) | **main 병합(PC Claude 2026-10-21)** — 병합본 신규 22/0(의도된 거부 ERROR 1)·부팅 경로 회귀 11종 0실패 |
| META-06 | Mac Codex 구현 단위 | Mac Codex | codex/meta-06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| IT-05 | Mac Codex 구현 단위 | Mac Codex | codex/it-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SK-S04 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SK-S05 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC04 | Mac Codex 구현 단위 | Mac Codex | codex/bc04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC05 | Mac Codex 구현 단위 | Mac Codex | codex/bc05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC06 | Mac Codex 구현 단위 | Mac Codex | codex/bc06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC07 | Mac Codex 구현 단위 | Mac Codex | codex/bc07-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-05 | Mac Codex 구현 단위 | Mac Codex | codex/snd-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-06 | Mac Codex 구현 단위 | Mac Codex | codex/snd-06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-07 | Mac Codex 구현 단위 | Mac Codex | codex/snd-07-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-08 | Mac Codex 구현 단위 | Mac Codex | codex/snd-08-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-TRANSPORT-READ | Mac Codex 구현 단위 | Mac Codex | codex/sv-transport-read-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-RESTORE-PLAYER | Mac Codex 구현 단위 | Mac Codex | codex/sv-restore-player-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-RESTORE-ITEMS | Mac Codex 구현 단위 | Mac Codex | codex/sv-restore-items-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-SHARED-READ | Mac Codex 구현 단위 | Mac Codex | codex/sv-shared-read-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-RESTORE-FLOW | Mac Codex 구현 단위 | Mac Codex | codex/sv-restore-flow-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-SAVE-PRIMITIVE | Mac Codex 구현 단위 | Mac Codex | codex/sv-save-primitive-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH1-03 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH1-04 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH2-01 | Mac Codex 구현 단위 | Mac Codex | codex/ch2-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH2-02 | Mac Codex 구현 단위 | Mac Codex | codex/ch2-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| NW-01 | Mac Codex 구현 단위 | Mac Codex | codex/nw-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| NW-02 | Mac Codex 구현 단위 | Mac Codex | codex/nw-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| NW-03 | Mac Codex 구현 단위 | Mac Codex | codex/nw-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| EC2-01 | Mac Codex 구현 단위 | Mac Codex | codex/ec2-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| EC2-02 | Mac Codex 구현 단위 | Mac Codex | codex/ec2-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| QA-007 | 신규 테스트 Windows 이식성: OS.execute 출력 전체 결합·UTF-8 디코드(임시 파일 경유 권장), node 경로 인자 일관(NW-02 "node" 고정 제거), 심볼릭링크 검사 Windows 분기, slot_reader JSON.x·ch2_02 resource_manifest_pin 원인 확인 | Mac Codex(배정 요청) | codex/qa-007-20261020 | 해당 테스트만, 제품 0 | **main 병합(PC Claude 2026-10-20) — 부분 개선**: PC Windows에서 NW-01/02/03 통과로 전환(이전 209/137/283실패), 전송 검증 63/0, 이식성 Node 3/4. 잔여는 QA-007b. 제품 코드 0 |
| QA-007b | QA-007 Windows 잔여: ① SV 테스트 4종(inventory/player restore·shared_store_read·slot_reader)도 NW처럼 UTF-8 임시 파일 경유 — Windows OS.execute가 한글을 "???"로 깨뜨려 JSON 해석 실패 ② Node: Windows junction 경로가 심볼릭 거부보다 먼저 "Output inside source root" 검사에 걸림(qa007Portability·fdgCh1AreaSource 2·fdgCh2Stage4Source) — 거부 순서/메시지 기대값을 Windows에서 같은 의미로 ③ fdgCh1Stage1Source CLI 종료코드 1≠0 ④ fdgCh1Stage1World hand12·ch2_02 resource_manifest_pin(Mac 1실패 보존분과 동일 여부) | Mac Codex(배정 요청) | codex/qa-007b-20261020 | 테스트·도구만, 제품 0 | **main 병합(PC Claude 2026-10-20 4차)** — PC Windows: SV 4종·junction·Ch1Stage1Source·이식성 Node 11/0·전송 2종 통과로 전환, BC2-01~04 0실패, 기본 회귀 0실패. 잔여 2건(fdgCh1Stage1World "12 hands" 객체 불일치·ch2_02 resource_manifest_pin)은 Mac에서도 보존된 선재 결함 → CH-MAP-PIN으로 분리 |
| BC2-03 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 4차)** — PC Windows: SV 4종·junction·Ch1Stage1Source·이식성 Node 11/0·전송 2종 통과로 전환, BC2-01~04 0실패, 기본 회귀 0실패. 잔여 2건(fdgCh1Stage1World "12 hands" 객체 불일치·ch2_02 resource_manifest_pin)은 Mac에서도 보존된 선재 결함 → CH-MAP-PIN으로 분리 |
| BC2-04 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 4차)** — PC Windows: SV 4종·junction·Ch1Stage1Source·이식성 Node 11/0·전송 2종 통과로 전환, BC2-01~04 0실패, 기본 회귀 0실패. 잔여 2건(fdgCh1Stage1World "12 hands" 객체 불일치·ch2_02 resource_manifest_pin)은 Mac에서도 보존된 선재 결함 → CH-MAP-PIN으로 분리 |
| CH-MAP-PIN | 선재 결함 2건: fdgCh1Stage1World "latest main original full initMapObjects … 12 hands"(Node) · test_ch2_02 standalone_scene_ready resource_manifest_pin(Godot). Mac·PC 공통 재현. CH1-06이 보고한 "기존 맵 실패 9건"과 같은 뿌리인지 확인 후 수정 | Mac Codex(배정 요청) | codex/ch-map-pin-20261020 | 맵 소스 도구·테스트 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| CH-MAP-PIN-2 | fdgMapResourceProvenance(신규) PC 병합본 1/3: 기대 main 출처 SHA b25a018ac·manifest SHA를 git 이력에서 읽어 비교 → 병합 커밋 구성이 달라지면 다른 커밋(8524bbbb4)이 잡혀 실패. 병합 후에도 성립하는 출처 판정으로(커밋 SHA 대신 기록된 provenance JSON·원본 바이트 기준) | Mac Codex(배정 요청) | codex/ch-map-pin-2-20261020 | 테스트·도구만 | 배정 요청 — PC 원로그 G:/exoduser-wt/_out/merge-batch8/ |
| BC2-07 | Mac Codex 단위 | Mac Codex | codex/bc2-07-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| BC2-06 | Mac Codex 단위 | Mac Codex | codex/bc2-06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| EC4-02 | Mac Codex 단위 | Mac Codex | codex/ec4-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| BC3-01r | Mac Codex 단위 | Mac Codex | codex/bc3-01r-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 6차)** — 통합본 3장 보스 catalog·3장 적 3종·4장 적·2장 보스 5종·기본 회귀 4종 0실패, 경고 0 |
| EC3-03 | Mac Codex 단위 | Mac Codex | codex/ec3-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 6차)** — 통합본 3장 보스 catalog·3장 적 3종·4장 적·2장 보스 5종·기본 회귀 4종 0실패, 경고 0 |
| EC4-01 | Mac Codex 단위 | Mac Codex | codex/ec4-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 6차)** — 통합본 3장 보스 catalog·3장 적 3종·4장 적·2장 보스 5종·기본 회귀 4종 0실패, 경고 0 |
| EC3-02 | Mac Codex 단위 | Mac Codex | codex/ec3-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| BC2-05 | Mac Codex 단위 | Mac Codex | codex/bc2-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| TRACE-BOSS-CH4 | Mac Codex 단위 | Mac Codex | codex/trace-boss-ch4-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| TRACE-MAPS-CH4 | Mac Codex 단위 | Mac Codex | codex/trace-maps-ch4-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| TRACE-ENEMIES-CH4 | Mac Codex 단위 | Mac Codex | codex/trace-enemies-ch4-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| P2001I-DIAG | Mac Codex 단위 | Mac Codex | codex/p2001i-diag-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| BC2-01 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC2-02 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC-CHAIN-M | BC08→BC09→BC-INTEG-01→BC3-02 정상 merge·원본/회귀 | Mac Codex | codex/bc-integ-01-20261020 | 기존 보스 모듈 통합·bc-chain-m_REPORT.md | 03-bc-integ-01 검증 완료, 단계별 정상 push·원격 SHA는 DONE 참조 |
| BC-INTEG-01 | BC02 원본 ELC 색·BC08 장 catalog 일반화, CH1 기본 byte 보존 | Mac Codex(맥북총괄 직접 배정) | codex/bc-integ-01-20261020 | native_ch1_boss_spawn_contract.gd·native_ch1_boss_movement_states.gd, 신규 bc_integ_01 테스트/오라클·자기 보고서 | **검수 대기** — 신규 73394/0·BC01~10 354093/0·CH2 119182/0·contracts5/0, 기존 회귀 무수정·Main/State/저장0. SHA는 자기 보고서 원로그 DONE.txt |
| BC08 | Mac Codex 구현 단위 | Mac Codex | codex/bc08-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC09 | Mac Codex 구현 단위 | Mac Codex | codex/bc09-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC10 | Mac Codex 구현 단위 | Mac Codex | codex/bc10-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| EC3-01 | Mac Codex 구현 단위 | Mac Codex | codex/ec3-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| TRACE-BOSS-CH3 | Mac Codex 구현 단위 | Mac Codex | codex/trace-boss-ch3-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| LOOK-001 | Godot 룩 4안 비교 | Mac Codex | codex/look-001-20261020 | look001/ | **병합됨(MAP-LOOK 기반으로 8524bbbb4에 포함)** — 제품 경로는 MAP-LOOK이 대체 |
| QA-004 | Mac Codex 구현 단위 | Mac Codex | codex/qa-004-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| QA-003 | Mac Codex 구현 단위 | Mac Codex | codex/qa-003-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| META-01 | Mac Codex 구현 단위 | Mac Codex | codex/meta-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| META-02 | Mac Codex 구현 단위 | Mac Codex | codex/meta-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| META-03 | Mac Codex 구현 단위 | Mac Codex | codex/meta-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-02 | Mac Codex 구현 단위 | Mac Codex | codex/it-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-03 | Mac Codex 구현 단위 | Mac Codex | codex/it-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-04 | Mac Codex 구현 단위 | Mac Codex | codex/it-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SK-S02 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SK-S03 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| BC02 | Mac Codex 구현 단위 | Mac Codex | codex/bc02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| BC03 | Mac Codex 구현 단위 | Mac Codex | codex/bc03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-02 | Mac Codex 구현 단위 | Mac Codex | codex/snd-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-03 | Mac Codex 구현 단위 | Mac Codex | codex/snd-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-04 | Mac Codex 구현 단위 | Mac Codex | codex/snd-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TI-00 | Mac Codex 구현 단위 | Mac Codex | codex/ti-00-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TI-01 | Mac Codex 구현 단위 | Mac Codex | codex/ti-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| CH1-01 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| CH1-02 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| MAP-LOOK | 맵 표현 강화 1·2차(부분 광원·요철·접지 그림자·근경 원근·흔들림·빛줄기·지역 환경광·번개) — PoE2·No Rest 레퍼런스 | PC Claude 직접 | claude/map-look-20261020 → main | native_map_look.gd·map_look_*.gdshader·data/map_look_ch1.json | **main 병합(PC Claude 2026-10-20)** — test_map_look 16/0·회귀 13종 0실패(p1002g는 P2-008a-FIX 대기). 실게임 기본 ON·하니스 OFF. [문서](../../4.1맵디자인+설정/MAP_LOOK_GODOT_PASS1_20261020.md) |
| MAPLOOK-HOLE | 소환굴 공허 연출 모듈 | PC VS Code Codex | codex/maplook-hole-pc-20261020 | scripts/maplook/spawn_hole_fx.gd | **main 병합(MAP-LOOK과 함께)** 67/0 |
| MAPLOOK-TOXIC / SHADOW / MIST | 독액 수면 / 캐릭터 접지 그림자 / 월드 바닥 안개 모듈 | PC VS Code Codex | codex/maplook-{toxic,shadow,mist}-pc-20261020 | scripts/maplook/ 각 1파일 | 큐 대기(아직 착수 전) |
| BC01 | 1장 보스 1번 단위 구현(공용 0줄) | Mac Codex ttys009 | codex/bc01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SV-COLLECT | 세이브 수집 어댑터(port_modules/save_adapter) | Mac Codex ttys007 | codex/sv-collect-20261020 | 신규 모듈·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TRACE-ELITES | 정예 modifier·오라 원본 추적(문서만) | Mac Codex ttys004 | codex/trace-elites-20261020 | 추적 문서 | 진행 중 |
| W01 | 무기 1번 단위 구현(공용 0줄) | Mac Codex(무기 스레드) | codex/w01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| P2-008a-FIX | P2-008a 빙결전사 포이즈 경로 정지 결함 수정(crawler 413 etype≠0 거부 → hurtE 42490 halt, p1002g 1실패) | PC VS Code Codex(P2-008a 작성자, P2-008b 스레드에 최우선 큐) | codex/p2-008b-ch1-enemies-pc-20261020 | enemy_melee_ch1_ice_warrior.gd 등 | **main 병합(PC Claude 2026-10-20)** — Mac 49528efdb: 빙결전사 3프로필 정확 도메인(crawler 413 일반화)·p1002g 집계 정정(halts==0·_verify_kill 유지 diff 확인). PC 병합본 p1002g·p1002f·factory·etype20·crawler·fix_poise·contracts 0실패 |
| P2-008b | 1-1 미지원 적 다음 개체(order11 etype47 우선) | PC VS Code Codex | codex/p2-008b-ch1-enemies-pc-20261020 | enemy_factory.gd·신규 적 스크립트 | 진행 중 — 2a05d13f7: order11 etype47·order9 등록(지원 9→11 추정). 미검수·미병합. 빙결전사와 같은 crawler 상속이면 포이즈 halt 확장 여부 확인 필요 |
| P2-009a | 피드백 UI | PC VS Code Codex | codex/p2-009a-feedback-ui 계열 | native_skill_slots.gd 등 | 진행 중 |
| SK-S01 | 스킬 1번 단위 구현 | Mac Codex | codex/sk-s01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-01 | 사운드 1번 단위 구현 | Mac Codex | codex/snd-01-20261020 | 신규 파일 2·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-01 | 아이템 1번 단위 구현 | Mac Codex | codex/it-01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TRACE-MAPS-CH1 | 1장 맵 원본 추적 | Mac Codex | codex/trace-maps-ch1-20261020 | 추적 문서 | 진행 중 |
| TRACE-LOBBY | 로비·캐릭터 선택 원본 추적 | Mac Codex | codex/trace-lobby-20261020 | 추적 문서 | 진행 중 |
| TRACE-SOUND | 6 사운드 원본 추적(문서만) | Mac Codex 01a1589f-0bf8 | codex/trace-sound-20261020 | 추적 문서 1개 | 검수 대기 — 16a198403 (맥북총괄 검수) |

## 공용(누구도 단독 소유 아님 — 수정 시 최소 줄·보고 필수)

### FEATURE-INVENTORY PC 배정 (2026-10-20 사용자 최신 지시)

| 작업ID | 담당·브랜치 | 소유 파일 | 상태 |
|---|---|---|---|
| FEATURE-INVENTORY | PC Codex · codex/feature-inventory-pc-20261020 | docs/engine/FDG_FEATURE_INVENTORY_20261020.md, docs/engine/orders/reports/FEATURE-INVENTORY_REPORT.md; 관련 계획 문서에 snapshot 링크만 추가 | 검수 대기 · 1,061행, 원본/근거3389참조·등록집합 대조. 정적 첫22통과/1서식실패 후 해당1검사만 수정·통과. 게임 실행/실플레이 인수 아님. P3-003은 Mac ENGINE 소유로 무수정. 커밋 SHA는 보고서 마감 단락/원격 ref에서 확인 |

FEATURE-INVENTORY 문서 체크포인트: `32492e498a3e5f53471c85eb6a6f752755b53000` / 브랜치 `codex/feature-inventory-pc-20261020`. 최종 판정 없음387·일부665·격리완료6·실플레이0·미확인3. 의미 검토의 보수화25행/집계 영향만 별도2검사군 통과(`classification-03.json`). 원본 HEAD 고정 snapshot이며 최신 main 전체 진행률로 사용하지 않는다.

`godot/scripts/main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`(공용 피해 집행자), `native_source_new_run_state.gd`(G/P 소유자)

## 검수·병합 완료 기록 (최근)
P1-002.C~H, P2-001a~k, P2-002a/b, P2-003a, P2-004a, P2-005a~d — main ad7f15777까지. 상세는 계획 문서 작업표.

## 보존된 미완 작업 (현재 배정과 별도)

- Mac Codex ENGINE의 이전 `GODOT-INTEGRATE-DEATH-CORPSE-ONE-ENEMY-20261020`은 구 worktree(`codex/p1-002-audio-live-queue-20261018`, HEAD `3c5023a4`)에서 보존 마감했습니다. `world.gd`·`enemy_melee_flesh_crawler.gd`·신규 `native_normal_enemy_corpses.gd` WIP만 해당 구 worktree에 남아 있으며, 최신 main 파일의 소유권을 주장하지 않습니다. 담당 보고는 compile 통과, 실제 경로는 imported ctex 누락 실패이며 화면·양성 사망 인수 및 관련 docs 동기화는 미완료입니다. 신규 SHA·main 반영 없음. 원로그/변경 보존: Mac ENGINE의 `death-runtime-resume-20261020/PRESERVED-HANDOFF-20261020.json`. P3-003에는 섞지 않습니다.

## 공용 연결 요청 (미수정·총괄 조정)

- **P3-003 → PC Claude 총괄:** `native_normal_enemy_hurte.gd::_kill_pipeline`의 원본 42702 `stageKills` write 직후 실제 적을 `NativeRegions.record_actor_kill(_enemy)`의 원본 `_regKill` 대응 경로에 전달하는 약4줄이 필요합니다. MAC 지시서의 ‘공용 피해 집행자 — 수정 필요하면 보고서에만’에 따라 ENGINE는 이 파일을 수정하지 않습니다. PC 총괄이 삽입 또는 정확한 수정 범위를 확정해 주세요. 피해 계산·드랍·입력 변경은 요청하지 않습니다.
- **P3-003 ↔ P3-002:** 소환굴 확정 후 `NativeRegions.initialize_stage()`를 호출하는 연결 지점은 P3-002 담당·PC 총괄이 조정합니다. P3-003은 `_totalSpawned`·World 동적 등록에 쓰지 않으며, 실제 소환굴 분모가 없으면 미연결 상태를 그대로 보고합니다.

- **P3-003 환경 검증 기록:** 원앱 Godot 4.7.2의 첫 import에서 WT asset reimport·editor layout 완료 후 `~/Library/Application Support/Godot/editor_settings-4.7.tres` 저장 ERROR로 중단(exit −15). clean import PASS가 아닙니다. 원로그 `~/exoduser-wt/_out/P3-003/import-01.*` 보존, 추가 import·전역 설정 권한 확대 없이 생성된 자기 WT 캐시와 고유 격리 userdir로 실Main A/B 첫 검수 9assert/0fail·exit0·ERROR0을 확인했습니다(`actual-01.*`). Main HUD-bind 직후 배선 정정 후 `actual-order-02`(PID1015)도 9assert/0fail·exit0·ERROR0으로 보고됐습니다. override는 비웠고 editor_settings는 사전 사본과 exact hash 동일입니다. 실제 화면·전체 지역 전투 인수는 아직 없습니다.
- **P3-003 중복 방지:** 이 판의 담당은 기존 Mac ENGINE 단독입니다. PC 총괄의 FEATURE-INVENTORY 행에서 다른 P3 중복 배정 중단·전환을 확인했습니다. ROOT는 맥북총괄 관할 터미널에 별도 지시하거나 같은 지역 작업을 중복 배정하지 않습니다.

## P3-003 원격 제출 · PC Claude 총괄 검수 요청

- 브랜치 `codex/p3-003-20261020`, 원격 검수 SHA [`919f6a28ab4e64e8a07cd403551777d8dbc77e6a`](https://github.com/beearth/the-exoduser/commit/919f6a28ab4e64e8a07cd403551777d8dbc77e6a), [제출 보고서](https://github.com/beearth/the-exoduser/blob/919f6a28ab4e64e8a07cd403551777d8dbc77e6a/docs/engine/orders/reports/P3-003_REPORT.md).
- CLI push 최초 인증 실패는 원로그에 보존했습니다. ROOT가 공식 GitHub 연결로 등록된 8경로만 게시했으며 원격 branch ref·parent(base `efdbf76b`)·변경8경로를 확인했습니다. 로컬 최종 `8d7e67a66d5acb10e223191bec681692df080ab8`과 원격 전체 tree는 `ffb3443402e57613f238fbc36cbb25ede84eb223`로 동일합니다. 원격 API 커밋 SHA는 별도이며 로컬3커밋·INDEX/WORK는 변경하지 않았습니다. 강제 push·reset·main 코드 병합 없음.
- core27/0, 실제 Main 최초9/0 및 배선 정정9/0은 별개 검수입니다. 표시 최초6통과1실패·단일 기대값 수리1/0, import 종료 설정 저장 실패도 그대로 보존합니다. C 실제 처치·P3-002 확정 분모·필드보스 전투/효과·실창1x는 미완이므로 전체 지역 진행 완료가 아닙니다. 위 요청 연결점과 보고서를 PC 총괄이 검수·조정한 뒤 코드 main 병합을 결정합니다.

2026-10-24 사용자 실제 검수: 세계관 구버전/끊김 FAIL. v22b 최신 연결·로비 원본 장식 보강·개발 PlayerConnection 제거·고정 실행경로·1변수 영상 A/B 진단으로 재검수한다. 자동으로 다음 전투/맵에 넘어가지 않는다.

2026-10-24 재작업: 최신v22b113.2507초자연완주/2718frame·20/20PASS·오디오폐기0·일반빌드UDP/TCP0확인. 원본로비장식복원/High444프로파일호환파생본/폰트400·600·700과작은글자잘림보정후실제UI-probe12/12PASS·caption/detail11/10행·독립수정검토PASS. 고정E:실행본152파일SHA대조, I:검수보존. 캐릭터생성/저장/계정/전체UI인수는별도미완료로유지한다.

2026-10-24 사용자 추가 요청 UI-DOCK: PoE2 참고 화면처럼 화면경계에 붙는 일체감을 HUD/인벤토리/독립검토로 병렬 진행한다. 기존 EXODUSER 아트를 사용하고 NativeHud·NativeInventory·NativeGame OnGUI 소유를 분리한다. 원본 구슬/bar 알파 여백에 따른 하단 틈·잘림과 인벤 개별카드 구조를 교정한다. 인트로 소스·Godot·사용자저장·공유 INDEX 보존. [범위·배치·검수](../UNITY_UI_DOCK_20261024.md).

2026-10-24 UI-DOCK 검수: 실제3해상도×HUD/인벤6런PASS·18PNG실제크기대조, 독립시각이번도킹PASS(7PNG), build0오류. 고정E:실행본152파일SHA대조갱신, 이전본I:보존. 인트로/모델/세이브불변, OS직접입력·전체UI인수와구분. I:/EXODUSER-Storage/qa/unity-ui-dock-20261024/suite.json·LIVE.json·SAVED.json.


2026-10-25 공조후속: PC현재디스크index는v17이며UnitycapturedPC와SHA일치,실제실행창은미확인. Steam별도v22b/+0.400초를인게임에섞지않는다. 지원담당928cue/17컷데이터대조를인수했고최종영상승인은계속미확정. [경계·지원근거](../UNITY_SOURCE_BASELINE_20261024.md#2026-10-25-pcmac-공조-원본-대조-후속).
## 2026-10-27 Mac A06 HUD 좌표 인수

PC freeze `741d97ba1`의 dock/skills 두 파일만 Mac에 적용, 원본 사본·SHA 보관. 720p/1080p 격리 ARM64 Player 네 화면/55검사 PASS, 해당 좌표·foundation 접점·키라벨 VISUAL PASS. OS 포인터와 구형 Editor composition oracle 갱신은 HOLD. 기존 사용자 앱·roster 보존. [인수 수치와 증거](../UNITY_MAC_A06_HUD_COORDINATE_20261027.md).

## 2026-10-27 Mac 실제 시작→필드 키보드 QA

A06 고유 ARM64 QA 앱 재사용·신규 빌드0. 실제 일반 시작에서 실버테일 반복 타이틀→문→정본 v22b 영상→격리 로비0/5→전사 생성 취소→전사 `A06QA` 생성/스토리→안내 4단계→필드 HUD→W 이동까지 키보드 PASS. FDG 단독 frame·이번 청음, 113초 자연완주·실습 완료·OS 물리 마우스는 HOLD. 격리 QA roster revision1/1명, 기존 세 앱/개인 파일 보존, QA PID 종료. [단계별 표·원본 PNG](../UNITY_MAC_START_TO_FIELD_QA_20261027.md).

## 2026-10-27 Mac 정본 세계관 일반 UI 자연완주

같은 A06 고유 앱·신규 빌드0, 새 절대 QA output/PID22329에서 제목문 `Return` 뒤 입력 없이 정본 SHA `3b99d59b…`의 초반·중간 frame을 관찰하고 129.133초 gate→로비 wall 후 0/5 자동 전환을 확인했다. 일반 UI 자연 로비 전환 PASS; 정밀 영상 길이/마지막 frame PNG·이번 오디오 계측은 HOLD. 이전 시작→필드 보고의 skip 경로와 분리한다. QA PID 종료·기존 앱3 유지·roster 파일 생성0. [시간표·PNG](../UNITY_MAC_NATURAL_WORLD_INTRO_20261027.md).

## 2026-10-27 Mac A15 조작 캡처·저장 후속

QA 전용 직접 진입에서 OS Esc/Tab 키 캡처를 검증하고, 캡처 완료 키가 메뉴에 중복 전달되는 결함을 소비 프레임 가드로 수정했다. 같은 표시된 격리 루트의 SFX61·`up=Tab` v2 저장과 재시작 화면 복원 PASS. ARM64 최종 빌드 오류0, 실제 Player 2회, 빌드 2회(첫 실행 발견 결함 수정). 일반 경로 마우스 클릭·좁은 창·청각·패드는 HOLD. [상세](../UNITY_MAC_A15_4TAB_20261027.md#2026-10-27-조작-키-캡처격리-저장-player-후속).

후속 보존 회귀: 같은 앱/코드로 새 표시된 A05 QA 루트에서 SFX35→36·주 키 KeyZ→Tab을 저장하고 재시작했다. `cinSeen:true`, 기존 패드 JSON, 별도 unknown sentinel, 보조 KeyX의 동일값·raw token을 확인했다. 실제 QA Player write/read 각1회, 빌드0. 요청1099px에서 캡처 창1100px·사운드2열이므로 1열/scroll은 HOLD. 사용자 앱3개·일반 설정/로스터를 건드리지 않았다. [표](../UNITY_MAC_A15_4TAB_20261027.md#2026-10-27-a15-저장-시-a05미지원-데이터-보존-회귀).

후속 1098px·라벨 후보 preflight: 고유 QA Player 새 표시 루트에서 1회 실행, 실제 1098px 사운드 1열 첫·끝 카드/고정 footer/휠 뒤 같은 위치 PASS. PC `157e3e8f…` 후보는 62 ID·29 locale 자료만 읽었고 공통373값 감사 외 전체 QA 확정 전 제품 연결0. Mac `NativeGame`/`NativePauseMenu` locale 전달·조회기와 PC 소유 키 목록 hook, IMGUI glyph/RTL 게이트를 기록. 코드/빌드0, 기존 사용자 앱3개 유지. [경계·이미지](../UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md).

## 2026-10-27 Mac A15 라벨 exact 43 부분 연결 / PC 키 목록 owner 검토 요청

PC 고정 `766250b64d833acd4172c83fb694820777d68b1b`의 QA v2가 exact43×29=1247/1247(영어 fallback135), semantic6/native-only13을 확정했다. Mac은 검수된 exact43 값만 배열형 resource/provider에 담고 `NativePauseMenu` 제목·4탭 **5 ID**를 연결했다. ko/en 기존 화면, ja `設定`, es `Ajustes`, cs `Nastavení` 실제 제목 표시와 ARM64 QA 빌드 오류0. 키 목록 **38 ID**는 provider에는 있지만 화면은 영어로 남는다. `NativeKeyBindList`·`KeyBindings` 제품 코드는 수정하지 않았다.

**PC 키 목록 owner 요청:** [검토용 좁은 patch](../unity_patches/A15_keylist_locale_seam.patch)는 `NativeKeyBindList`의 ko/en T/L·동작명·키명에 `NativeA15SettingsLabels.GetKeyByKo`를 넣고 Mac caller가 locale을 전달하는 hunk다. 현재 Mac HEAD에서 `git apply --check --ignore-space-change` PASS, **미적용·미컴파일**. PC가 소유 범위/문구 fallback·행 충돌 정책을 검토해 승인할 때만 별도 제품 연결/실화면 QA를 수행한다. semantic6/native-only13, 4탭 영어 fallback, ar/RTL HOLD, v2/`cinSeen`/입력·저장 불변. [43 ID 표·증거](../UNITY_MAC_A15_LABEL_ADAPTER_20261027.md).

**다음 A15 인수 기준(예약):** PC owner의 exact base SHA·최소 hunk와 QA의 provider/resource 독립감사가 도착하면 두 결과를 대조한다. 그 전에는 키 목록 제품 수정·추가 빌드를 하지 않는다. 인수 후 ko/en 기존 표시, ja/es/cs **실제 키 목록**과 장문 fit, 캡처 중 Esc/Tab 격리, ar 영어 및 semantic6/native-only13 fallback을 격리 Player에서 확인한다. `NativeKeyBindList`·`KeyBindings`는 PC 소유, Mac은 locale 전달 접점과 QA 영수증만 맡는다. v2/`cinSeen`/입력·저장과 기존 19 patch는 보존한다.

**독립 UI 큐 단일 후보:** 위 A15 회신과 무관하게 남은 [A02 최종 fit 720p 32큐 실화면 검수](../UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md)를 다음 후보로 올린다. `NativeArabicCaptionOverlay.cs`·caption JSON은 읽기 전용, Mac 소유는 격리 QA 실행/32큐 증거와 자기 보고 행만이다. 먼저 기존 실패 원인인 PID·시작 인자↔창 매핑을 안전하게 고정한 뒤 한 Player에서 순서·결합·문장부호·배경 폭·잘림을 판정한다. 매핑이 확보되지 않으면 HOLD를 유지하며 일반 ar 승격은 하지 않는다.

**A15 후속 인수 완료:** PC owner가 `7065b7fe3`의 기존 최소 seam을 exact38 연결안으로 승인해 Mac `NativeKeyBindList`/`NativePauseMenu` hunk를 적용했다. provider exact43 allowlist·중복/누락 fallback을 함께 보강했다. 원본 리소스 불변, 정적 변형자료 4종 예상 판정, ARM64 Settings QA 빌드1회 성공/오류0, 격리 Player1회 ko/en/ja/es/cs 키 목록 실표시·장문·Esc 취소/Tab 캡처 후 조작 탭 유지 확인. 앞의 승인 대기/영어 목록은 해당 시점 이력이다. `KeyBindings`·저장 v2·`cinSeen`·입력 처리·19 patch 불변. ar 영어는 코드/자료 감사만, ar GUI/RTL·전체29언어·물리 마우스 HOLD. [증거](../UNITY_MAC_A15_LABEL_ADAPTER_20261027.md#2026-10-27-pc-seam-인수allowlist-보강-후속).

**A15 글꼴 후속 / PC 키 목록 owner 요청:** exact43 미검수23 locale를 현재 Settings/KeyList 스타일 폰트 cmap과 대조해 15 locale/170 ID×locale 결손 행을 확인했다. Mac 소유 `NativePauseMenu`의 el/th/zh 제목·탭은 기존 지역 폰트로 보정, ARM64 QA 빌드1회 오류0·격리 Player 위험 문자 3화면 및 ko 원상복귀 PASS. `NativeKeyBindList` 제품 추가 변경0. [글꼴 patch](../unity_patches/A15_keylist_regional_font_seam.patch)→[긴 행 patch](../unity_patches/A15_keylist_long_name_fit_after_font.patch)는 PC owner 검토용 미적용 제안이며 격리복사 순차 apply-check만 PASS. 그리스어 shield 실제 긴 행이 버튼 앞에서 끊겨 보여 목록 **RETOUCH/HOLD**; 다른 10 locale/12행 폭 초과는 정적 추정이다. PC owner는 지역 폰트·Width/Run 동일 스타일·cache 키와 2행 fit을 함께 검토해 정확 base patch를 회신 요청. ar 영어/semantic6/native-only13, v2/`cinSeen`/입력·19 patch 유지, 전체29 GUI·RTL·일반 마우스 미검증. [최소표·영수증·플래그 없는 창 제외 기록](../UNITY_MAC_A15_FONT_COVERAGE_20261027.md).

**Unity 줄기 전환:** 사용자 결정에 따라 `codex/unity-mac-20261024`의 A15 글꼴 감사·INBOX 병합 HEAD `412124ef5efa73611bf0d33dd211074e4d10132e`를 `unity/main`에 **비강제 fast-forward**로 올렸다. 현재 Mac 작업 checkout도 `unity/main`으로 전환했고 이전 `codex/unity-mac-20261024` 원격은 삭제 없이 `412124ef5`에서 동결한다. 다음 Unity 작업은 `unity/main` 기준 `codex/unity-*` 작업 브랜치에서 진행해 `unity/main`으로 합친다. 웹 `main`과 Godot 줄기에는 병합하지 않았다.

**A15 Game 탭 로비 버튼 HOLD:** 최신 웹 `main` `2ede62fa3`의 `toLobbyBtn2`는 사망 자원 복구→`dbSave()` 대기→로비 이동을 시도한다. Unity `9bc0c1c18`/현재의 일시정지 `ReturnLobby`는 화면만 전환하고 전투 진행은 저장하지 않는다(캐릭터 roster는 이름·슬롯·선택만 저장). 동일 버튼을 Game 탭에 바로 연결하지 않았으며 제품 수정·빌드·Player 실행 0. 진행 snapshot 저장/로드 owner 계약과 실패 안내가 확정된 뒤 격리 Player에서 로비 왕복·사망·설정 unknown 보존을 확인한다. PC 키 목록 글꼴 패치도 미적용. [대응표·최소 인수 계약](../UNITY_MAC_A15_GAME_LOBBY_CONTRACT_20261027.md). 전환 근거는 INBOX `693b66f00:172–182`, 원격 `unity/main` 확인 SHA는 `d8f874a34ad088603ba6c76ac41e9b709b63a470`이다.

**A15 키 목록 글꼴/긴 행 인수:** PC UI `97be6444b6…`의 고정 blob·patch SHA/순서를 확인해 지역 font→**clip 포함 수정** 긴 이름 hunk를 `NativeKeyBindList`에 적용했다. Unity 6000.6.7f1에서 `GetInstanceID()` CS0619가 나 `(Font,int)` cache 키로 최소 수리했고 ARM64 Settings QA 최종 빌드 성공/오류0(초기 컴파일 실패는 별도 기록). 격리 Player 1280 el/th/zh 목록·ko 복귀, el 방패 두 줄, 1920 상하단/스크롤, Esc/Tab 캡처 유지 확인. **오른쪽 E 클릭이 왼쪽 Q 캡처로 들어가는 OS hit rect 실패**와 1280 하단·12행 전체 폭·Thai shaping·29언어 GUI는 HOLD. 입력/저장/키 rect 코드는 수정하지 않았고 413 generated files를 HEAD bytes로 복원. [적용 표·PID·화면 증거](../UNITY_MAC_A15_FONT_COVERAGE_20261027.md#pc-소유-수정본-인수제품-적용--실화면--2026-10-27).

**원격 복구점:** 위 A15 제품+docs 커밋 `a8cab8e3b37168009e61ee058523adb543a2e4d8`을 `unity/main`에 비강제 fast-forward로 반영한 것을 원격 SHA로 확인했다. 예전 `codex/unity-mac-20261024` 원격은 `412124ef5efa73611bf0d33dd211074e4d10132e`에서 동결 유지. 웹 `main`·Godot로 병합하지 않았다.

**A15 E/Q MouseDown 진단과 입력 도구 경계:** `unity/main` 원격 `19a47e27d1533f5d8dd51dc95f4698bee207c56a`의 Mac opt-in QA trace는 E/Q/E/drag의 다른 CUA 목표에서도 같은 Unity 그룹 전 `(493,590)`·그룹 후 `(413,330)`을 관측했다. 클릭 전 pending capture는 false, `GUI.matrix=identity`, `BeginGroup` 차이는 `content=(80,260)`과 일치한다. Q rect에는 포함되고 E rect에는 포함되지 않는다. PC UI/QA의 정적 draw/hit rect 수식은 144/144 PASS이나 실제 OS 마우스 PASS는 아니다. 후속 컴퓨터 사용 API 문서 확인에서 macOS `App`/`Target`에 pointer-only `move`/`hover`가 없어 같은 안전 PID에서 move→click 원인 분리 불가; `getApp(path)`는 인자 없는 중복 앱을 연 이력이 있어 재호출하지 않았다. 후속 Player/빌드/제품 좌표 보정 0. **SOURCE RECT/그룹 산술 PASS, OS 입력·물리 마우스 RETOUCH/HOLD**로 분리하고 다음 UI 큐로 진행한다. [로그·API 경계](../UNITY_MAC_A15_FONT_COVERAGE_20261027.md#a15-e-to-q-mousedown-trace--2026-10-27).

**A15 Game 전체 화면 버튼 완료:** 웹 `game.html:2617`의 Game 영역 전체 화면 버튼을 Mac `NativePauseMenu`의 첫 카드/index4로 연결했다. Display index5와 동일 카드·`Screen.fullScreen`·`SetFullscreenPreference`/v2 저장 경로를 재사용하고 `PauseNavigation` Game Count6→7만 추가. F11·로비·새 옵션 없음. 순수 navigation44/44, ARM64 Settings QA 빌드 1회 Succeeded/errors0. 격리 QA PID42292에서 키보드 Game 켜짐→창 모드 꺼짐, Display 꺼짐 동기화, v2 revision10→11 저장과 `cinSeen`/unknown/pad/보조 키 보존 PASS; PID42346 재시작에서 창 모드·Game 꺼짐, ko/en 카드 표시 확인. 두 PID 종료·사용자 앱 미접촉. **변경 구역 VISUAL PASS**, 물리 mouse/29언어/로비 저장 HOLD. [좌표·ID·증거](../UNITY_MAC_A15_4TAB_20261027.md#2026-10-27-game-탭-전체-화면-버튼-후속).

**A15 1280 위험 문자/목록 하단 후속:** 위 최종 QA 앱을 새 marker 루트의 PID43099에서 재사용, 빌드/코드 변경0. 실제 1280×720 Game viewport의 한글 목록 상단·고정 footer PASS. 지원 scroll 입력 1회 후에도 첫 행 위치가 그대로여서 **1280 하단/scroll HOLD**; 실패 입력 반복·임의 native 주입 없음. F8 `el` 대표 방패 이름 2행은 E 버튼 전에 끝나 visual PASS. F8 `th` 대표 행은 글리프가 보이고 뚜렷한 행/버튼 겹침·tofu는 없으나 결합 부호 shaping 정확성은 판정 불가로 **HOLD**. 일반 물리 mouse/전체29언어도 HOLD. PID 종료. [컷·로그·범위](../UNITY_MAC_A15_FONT_COVERAGE_20261027.md#1280-bottom-scroll-and-greekthai-representative-player-review--2026-10-27).

**U08 상단 탭바 OS 키/배치 인수:** 최종 ARM64 Settings QA 앱을 새 marker root에서 재사용(새 build/제품 수정0). 정확 argv의 PID43596(1280)과 PID43626(1920)에서 Settings 활성 탭, K→Skill, TAB→Inventory와 각각의 활성 강조·본문의 탭바 아래 배치를 대표 화면으로 확인. 1280 Inventory K→Skill, Skill/Inventory ESC→field, field ESC→pause, pause K→Skill; 1920 Inventory ESC→field도 확인. 키보드·대표 1280/1920 시각 PASS. 이전 macOS click 위치 문제가 있어 탭바 mouse 클릭/물리 mouse는 HOLD; Forge/Stat과 픽셀 동등성도 별도. QA PID 종료·사용자 앱 미접촉. [컷·로그·판정](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md#u08-keyboard-tab-transition-player-review--2026-10-27).

**U04B 인벤토리 화면 인수:** 같은 최종 Settings QA 빌드와 postossuary seed, 격리 marker 루트에서 장비 1920 및 유골함 1280/1920 Player 스모크를 실행(build0·제품/seed/Core 변경0). U08의 장비 1280/1920 캡처도 재사용했다. 대표 화면의 장비·가방·자원/전투력·제목/탭바/본문·하단은 잘림/겹침 없이 PASS; 장비 `15/16`은 일반 장비만, 실제 `initialEquipped=16`은 유골함 포함이며 가방10·최대MP480·현재MP330·전투력1656이다. 유골함 페이지 0/300은 범주별 가방 수다. 정확 argv의 QA PID44276/44308/44315는 종료. 물리 mouse 아이템 클릭·이동·장착은 HOLD, 유골함 수집/해제·유물/보관함 본문은 PC-U04b 원문 미구현 범위. 신규 layout owner patch 필요 없음. U08의 옛 Settings TAB 설명은 현재 Settings 초점 이동/일시정지 루트 인벤토리 전환으로 문서 정정했고 키 코드는 그대로다. [영수증·화면 표](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md#u04b-inventory-player-screen-acceptance--2026-10-27).

**U05 K 스킬창 대표 화면 인수:** PC-U05/선행 Mac 스킬 계약을 읽고 같은 최종 Settings QA 앱의 U08 실제 K 입력 캡처(1280/1920)를 재판독했다. 새 Player·build·제품/스킬/저장 변경0. Skill 탭 강조, `전투 스킬` 제목, 13슬롯·LMB 기검참 Lv1과 12슬롯 `미이식`, 악의1,000/LV1, 왼쪽 정보·가운데 제단·오른쪽 로드맵·하단 버튼 모두 대표 두 viewport 안에 있어 배치 PASS. 기존 U08 실제 키 관측의 1280 Skill ESC→field/field ESC→pause/pause K→Skill은 재실행하지 않고 근거만 인용했다. 물리 mouse 습득·장착/hover는 이전 위치 문제로 HOLD; U05 원문 미이식 SP·강화·합성은 그대로다. 새 가림/잘림 결함이 없어 owner hunk 요청 없음. [화면·소스 경계](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md#u05-k-skill-window-representative-player-acceptance--2026-10-27).

**A14 G 대장간 대표 화면 인수:** PC-A14 계약·기본 KeyG/NativeGame 배선 확인 뒤 기존 최종 Settings QA 앱의 격리 1280/1920 Player에서 OS G 열기, 1280 G 닫기·1920 ESC 닫기 PASS. 붉은 Forge 탭, `복수의 대장간`, 6개 왼쪽 탭, 강화 본문, 악의1000·현재 seed 장비3카드/99%/비용7500과 하단 버튼이 viewport 안에 있음. 긴 목록은 내부 스크롤. build/제품/Core/save 변경0, 귀속 QA PID 종료. 기본 강화 탭 외 5탭 실화면과 물리 mouse/실제 강화는 HOLD; owner hunk 필요 없음. [컷·로그·범위](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md#a14-g-forge-window-player-acceptance--2026-10-27).

**A13 J 능력치 대표 화면 인수:** PC-A13 계약·기본 KeyJ/NativeGame 배선 확인 뒤 A14와 같은 격리 1280/1920 Player를 순차 재사용(동시 QA Player1). 실제 OS J 열기, 1280 J 닫기·1920 ESC 닫기 PASS. 붉은 Stat 탭, `성장의 각인`, 길 목록·검색, 트리·기본 분석판·하단이 viewport 안에 있음. `265/265`는 전체 정의 노드, 길 카운터와 AP/투자/효과의 `미이식`은 현재 상태 계약이다. 1280 왼쪽 설명 줄바꿈과 오른쪽 내부 스크롤은 정상 범위. build/제품/Core/save 변경0, QA PID 종료. 노드/검색/줌 등 실제 입력·물리 mouse 및 투자 실행은 HOLD; owner hunk 필요 없음. [컷·로그·범위](../UNITY_MAC_PC_UI_PREFLIGHT_20261026.md#a13-j-stat-panel-player-acceptance--2026-10-27).

**A05-IO 전사 영상 자연완주 → 첫 시작 안내:** 기존 최종 Settings QA 앱의 일반 타이틀·세계관·로비에서 새 전사를 만든 뒤 영상에 입력하지 않았다. 끝의 보라색 화면은 정지 영상이 아니라 별도 네메시아 입장 시네마틱의 대사 입력 대기였다. 추적 ARM64 QA 빌드 1회(errors0)에서 영상 time 95.000/96.400초 뒤 해당 대사로 이행하고, 대사를 Return으로 정상 진행해 첫 안내 1/4를 캡처했다. 임시 종료 대체 분기는 0회 실행되어 제품 코드에서 제거했고 최종 Runtime/Core/save/media 변경0. 정본 영상 SHA 일치·격리 roster 1명/revision1, 중복·오류0으로 시각 경로 PASS. 청음 HOLD, 세계관 재생을 생략한 두 번째 로비 진입은 QA 직접 진입으로 구분한다. QA PID 둘 종료·사용자 앱/저장 보존. [시간표·PNG·범위](../UNITY_MAC_WARRIOR_NATURAL_QA_20261027.md).

**A05 시작 안내 물약 문구 정합:** PC UI/QA 확정 범위대로 Mac `NativeLobby.StartupPresentation.cs`의 Guide 4/4 note ko/en 한 줄만 `물약은 자동 사용` / `Potions activate automatically`로 바꿨다. HP% 설정 UI/API가 없는 현재 Mac Game 탭 및 B11의 부족HP≥회복량 조건과 맞춘다. GuideRows/hint/4쪽 본문·영상/Core/설정 저장 변경0, 원본 소스 백업. 문구 diff·관련 docs 검색/동기화만 확인했고 새 Player·청음은 미검수. [현재 문자열·조건 표](../UNITY_MAC_STARTUP_FLOW_20261025.md#2026-10-27-a05-시작-안내-4쪽-물약-문구).

**Mac 전사/입장 안내 기존 패드 논리 연결:** 기존 Unity Submit/Confirm0·Cancel1 및 로비 Start7/9 읽기만 `FrontendPadFrame`으로 전달한다. 전사 Confirm edge Next, Cancel/Start hold는 기존1.2초 `WarriorStoryState`; 네메시스 Confirm Next·Cancel 2초 hold·Start 즉시 Skip; 안내 Confirm은 키보드 focus와 무관하게 Next, Start 즉시 Skip이다. 눌린 채 진입/페이지 전환/focus 복귀 시 release fence, 프레임1회 소비. 순수 논리 Editor20/20, ARM64 Settings QA 빌드1회/errors0. 실제 OS 패드·기종별 표기·웹 추가 버튼2/3 검수 HOLD. 키보드/마우스/영상/Simulation/save 변경0, 사용자 앱/저장 미접촉. [전사·안내 계약](../UNITY_MAC_WARRIOR_STORY_20261025.md#2026-10-27-기존-네이티브-패드-입력의-전사-이야기-연결).

**Mac 전사/안내 패드 연결 통합 QA:** 별도 Settings QA ARM64 앱에서 A05 marker·추가 marker·실행 PID·격리 root를 검증한 뒤 의미 Confirm/Start 프레임을 실제 `NativeLobby`로 주입했다. 캐릭터 생성→정본 전사 영상 Next·짧은 hold 해제·1.2초 skip→네메시스→안내 250ms gate·skip focus 중 Confirm Next→4/4 `물약은 자동 사용`→Start 필드 진입 **16/16 PASS**. 잘못된 PID는 종료2로 거절. 일반 검토 launcher는 별도 빈 profile의 첫 제목 화면 확인, 전체 일반 경로 재완주는 미실시. 빌드1회/errors0, 소스↔앱 영상 SHA 일치. 물리 OS 패드/표기/청각 HOLD, 사용자 앱·일반 저장·Godot 미접촉. [앱·화면·영수증](../UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md).

**Mac frontend pad 동시 입력 회귀 최종 Rev4:** 웹 `index.html` 전사 핸들러는 B/Start skip hold와 Confirm Next를 같은 프레임에 독립 처리한다. Unity Story 정책의 hold 중 Next 억제를 제거하고, QA 플래그에서만 다음 cue·수용 횟수·hold·bounded seek 완료를 계측했다. 요청 전 영상5.733333s→다음 cue10.000000s, 실제 Next 수용1→2, hold=true/해제0. Editor22/22, 실제 NativeLobby 18/18, ARM64 Settings QA Rev4 build errors0. 패드 감지 중 전사/Nemesis hint를 기존 A/B/Start 표현으로 보강, 720p 두 화면과 Guide4/4 시각 확인. 잘못된 PID exit2; 첫 후보/Rev2/Rev3 앱 superseded. 최신 일반 launcher 별도 빈 profile 첫 제목 화면만 확인; 전체 일반 경로·물리 OS 패드·청음 HOLD. 사용자 앱/일반 저장/Godot 미접촉. [최종 앱·영수증](../UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md#최종-rev4--동시-입력-회귀와-패드-힌트).

**Mac Rev4 일반 키보드 자연 경로 완료:** 최종 `2c54cc4c8` 앱/실행 파일 SHA `6594af88...f2f` 그대로, 빌드·코드 수정0. 별도 빈 A05 marker root의 일반 launcher는 QA 주입·직접진입·seed 없이 PID54220을 실행했다. FDG→제목→문→정본 세계관 무입력 자연 종료(문/로비 캡처 간127.5초, 영상113.678초, 격리 `cinSeen:true`)→N/Tab×6/Return 전사 `MacQA27` 생성→정본 이야기 무입력 자연 종료(시작/네메시스 캡처 간105.5초, 영상96.4초)→Return 대사→안내1~4/물약 문구→필드 HUD/W700ms 지형 이동까지 시각 PASS. 격리 로스터 revision1/1명, PID 종료. 물리 패드·마우스/공격·실전투·청음·픽셀동등성 HOLD. 사용자 앱3/일반 저장/Godot 보존. [최종 일반 경로 증거](../UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md#rev4-일반-키보드-자연-경로-후속--2026-10-27).

**Mac Rev4 Finder 검토 helper:** `_out/UNITY-MAC-FRONTEND-PAD-INTEGRATED-REV4-20261027/EXODUSER 검토 실행.app`과 `RUNME-검토실행.md`를 추가했다. helper는 기존 안전 `launch-review.command`만 터미널 창 없이 호출한다. plist lint/ad hoc 서명 검사 후 실제 PID55075에서 같은 A05 marker root·제품/절대 output·인자만 확인했고 첫 제목 화면을 저장한 뒤 그 PID만 종료했다. 새 Unity build/게임 코드/사용자 앱 교체/배포0. Rev4 제품 소스 `2c54cc4c8`→병합 HEAD `ade9908ae`의 Runtime/Editor/StreamingAssets diff0, 소스 파일 SHA/앱 실행 SHA 불변을 매니페스트에 고정했다. 이전 `.command`도 사용 가능, 물리 패드·마우스/공격·실전투·청음 HOLD. [helper·해시·경계](../UNITY_MAC_FRONTEND_PAD_INTEGRATED_QA_20261027.md#finder용-검토-실행-앱--2026-10-27).

**Mac CoreTests 설정 scope 복구:** `NativeSettingsStore.cs`의 Unity 직접 참조 2개를 제거하고 Unity 호출부가 QA 제품명·identifier를 명시 전달한다. A05 marker/절대 root/혼합 flag/개인 저장 fallback 거부 유지. 수정 전 CS0103 2, 수정 후 CoreTests 35/35·오류0, 독립 저장 보호 18/18 PASS. v2 `cinSeen`·미지 JSON 왕복 및 손상 원본 bytes 보존 확인. 새 Unity build/Player 실행0, 사용자 앱/저장 미접촉. [조건·영수증](../UNITY_MAC_SETTINGS_PERSISTENCE_20261026.md#2026-10-27-coretests-독립-컴파일-복구).

**Mac A05 킬루 피눈물 v3 미디어 입력:** 채택 `main:d038ba4ab:video/warrior_story_v23_clean.mp4` 94,795,327B/SHA `8b824842…dba28ab`를 Unity StreamingAssets와 Git 복구 4파트/manifest에 동일 바이트로 반영. `restore-warrior-story.cjs`·원본/복원 `cmp` PASS, 기존 영상/파트 `_out` 백업. JSON 영상명·22컷·29×22자막·NativeLobby 재생 참조 불변. 새 영상 생성/편집·Unity Editor/Windows Player 빌드·배포0; 실제 51~58초 시청/음성·자막·종료/skip은 별도 검수 HOLD. 기존 Rev4 앱은 이전 미디어 snapshot. [해시·파트 표](../UNITY_MAC_WARRIOR_STORY_20261025.md#2026-10-27-킬루-피눈물-v3-미디어-입력-동기화).

**Mac A05 v3 후속 재생 인수:** 새 ARM64 Settings QA 후보 build1, 앱 내 영상 94,795,327B/`8b824842…dba28ab`, 실행 파일 `5b8ea55a…dd857e`. 실제 VideoPlayer 첫 자막·>50초 컷/피눈물 화면·자연 종료→같은 전사 필드 **8/8**, 별도 skip **15/15** PASS. Editor C# 오류0·build Succeeded이나 `NativeGame` 생성자 UnityException으로 receipt `errors=1`: clean gate RETOUCH. AVFoundation 색공간 fallback, 청음/정밀 싱크, Windows Player HOLD. 기존 Rev4/정상 앱·저장·배포 변경0; 관찰 도구의 인자 없는 QA 재실행 PID58730 즉시 종료/증거 제외. [후보 launcher·영수증·조건](../UNITY_MAC_WARRIOR_STORY_20261025.md#2026-10-27-mac-arm64-v3-후보-재생-gate).

## 2026-10-27 Mac A05 v3 Editor 오류 0 후속

`NativeGame.WorldDrops.cs` D01 빔 `MaterialPropertyBlock`을 생성자 필드 초기화에서 첫 실제 빔 렌더로 옮겼다. ARM64 Settings QA build `Succeeded/errors=0`, 설정 격리 18/18, Player 드랍 15/15·빔6, v3 미디어 SHA 일치. 새 격리 검토 launcher는 [후속 영수증](../UNITY_MAC_NATIVEGAME_CTOR_FIX_20261027.json)에 고정했다. 이전 v3/Rev4와 사용자 앱·저장은 유지. 전체 영상 재실행·Windows·청음은 HOLD.

## 2026-10-28 Mac unity/main 통합·Editor gate

Mac 소유 `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`의 clean `1548338e16f52ef0c58a140c813006213c966f7e`를 새 `codex/unity-mac-sync-20261028` 브랜치에서 원격 `unity/main` `444ee86fc16d862edce5eb2897f777253ec257dd`로 fast-forward했다. PC M1 전투·드랍·지역/보스 Core/연결과 DT-01/02/03 도구·QA fail-closed 정책을 그대로 인수했고, Mac 제품 코드·Hero Light 공용 설정은 수정하지 않았다. Unity 6000.6.7f1 Mac `PortVerification.Verify` 1회, `-batchmode -quit -projectPath <checkout>/unity -executeMethod PortVerification.Verify -receipt <QA>/verify-receipt.json -logFile <QA>/verify.log --unity-qa-sandbox <QA>/qa-sandbox`: 종료 2, CS 오류 0, Unity receipt 미생성. `UNITY_UI_COMPOSITION_BOUNDS_PASS` 뒤 HUD GPU 픽셀 상태1 검사 실패(`hpRed=false`, `hpUpperEmpty=false`, `manaUpperEmpty=false`); 현재 Metal/Apple M5 Pro/Linear이며 이전 A06 검사는 Gamma였다. Linear 전환은 RM-0 소유 `0ebc103c0`의 결정이므로 공용 색공간을 되돌리거나 QA oracle을 완화하지 않았다. 정확 로그·gate 결과는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-SYNC-20261028/verify.log` 및 `gate-result.json`. Unity 임포트가 바꾼 추적 431개는 사전 tar에서 byte 복원, 생성 `.meta` 8개만 제거; 기존 Player/사용자 세이브·영상 전수검사·새 빌드/Player 실행 0. **Mac 통합 소스 컴파일 오류 0, Editor Verify FAIL/HOLD**. 다음 M1 한 단위: HUD Linear 판정 원인을 RM-0/QA 소유와 조율해 gate를 회복한 뒤, 격리된 최신 Player에서 로비→1-1 진입을 실제 확인한다.

**2026-10-28 Mac Linear HUD gate 후속:** 동일 checkout/`444ee86fc` 기준 `NativeHud.Probe`의 Linear readback RGB만 sRGB→linear로 정규화하고 기존 alpha/임계값/셰이더/자원은 유지. 수정 전/후 파일 `_out/UNITY-MAC-SYNC-20261028/hud-linear-before/`, 재검 1회 Metal/Linear 상태0·1·2 HUD GPU PASS/C# 오류0. 후속 A15 SFX 5% 현행 코드와 1% Editor 기대 불일치로 전체 Verify exit2/receipt 없음; 지시된 두 번째 실패에서 중단. [로그·18픽셀](../UNITY_MAC_A06_GPU_METAL_20261027.md#2026-10-28-linear-통합-뒤-hud-probe-정규화). 다음 M1 한 단위는 A15 소유자가 단계 계약을 정합한 뒤 격리된 최신 Player에서 로비→1-1 진입 실제 확인이다.

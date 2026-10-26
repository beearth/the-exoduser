# Mac A15 29언어 라벨 후보 연결 경계·1098px QA — 2026-10-27

## 입력과 채택 상태

PC 고정 commit `157e3e8f3cb63299c48fd484ba7056fd9dceb9b8`의 `docs/engine/ui_handoff/a15-settings-locale-source-handoff-20261027.md`, `a15-settings-locale-oracle-audit-20261027.md`, `a15-settings-locale-source-candidate.json`을 Git blob으로 읽었다. JSON은 **78,874 bytes**, SHA-256 `25fd0d15acb6b76c28b9a99fedc87bb0c4e006981949e7ebd14140e2823ef7ec`, **62 ID·29 locale**다. 현재 Mac 브랜치의 제품 Resources에는 넣지 않았다. PC 감사의 공통 13매핑 373값 불일치0은 전체 62 ID 검수가 아니며, 원 QA 추출기는 27개 `lang_*.js` 로드를 빠뜨려 비한국어 fallback 판정에 사용할 수 없다. 보정/전체 매핑 QA 범위가 확정될 때까지 제품 채택0이다.

| 접점 | 현행 Mac 코드 | 필요한 최소 연결과 소유 경계 |
|---|---|---|
| 언어 선택 | `NativeLobby.Language`는 `LobbyLanguage.Normalize`의 29코드를 보유한다. `NativeGame.OnGUI`는 설정에 `lobby.Language!="ko"` boolean만 전달한다. | Mac `NativeGame`→`NativePauseMenu`에 정규화된 locale 코드를 전달하고, 누락 ID는 현행 ko/en fallback을 유지하는 조회기를 별도 도입해야 한다. 현행 boolean을 즉시 제거할 근거는 없다. |
| 설정 4탭·카드·footer | Mac 소유 `NativePauseMenu.T(ko,en)` 리터럴과 고정 GUIStyle. | 화면에 보이는 ID만 검증된 lookup으로 감싼다. 탭 4개는 웹 `ui-panels.js`가 ko/en 리터럴이라 다른 27언어에서도 영어를 유지해야 한다. `settings.game.unavailable`·저장/QA 안내 등 native-only **13개**는 임의 번역하지 않는다. FPS/전체화면/오디오 6개 semantic 대응은 기능 확대 없이 라벨만 다룬다. |
| 조작 목록 | PC 소유 `NativeKeyBindList`의 `T/L`, `ui.en` ko→en 사전, `KeyBindings.Name(action,bool)`·`KeyName(code,bool)`이 2언어 분기다. Mac `NativePauseMenu`는 목록에 `English`와 저장 문구를 전달한다. | 20동작명·키 표시명·목록 문구의 locale hook은 PC 소유 인터페이스 확정이 먼저다. Mac이 해당 소스/리소스의 29언어 치환을 독자 적용하지 않는다. 현재 후보의 44 ID는 29값, 18 ID는 ko/en 2값이며 `key.action.storage`는 영어 Storage fallback이다. |
| 데이터 형식 | 후보는 `entries` 객체 안에 62개의 가변 키와 `locale` 객체를 둔다. 현재 목록 리소스는 `JsonUtility`의 고정 `TabDef/TextsDef/EnPair`다. | 그대로 `JsonUtility`에 넣는 hunk는 맞지 않는다. 채택 시 검증된 62 ID와 locale을 배열형 직렬화 자료로 변환하거나 승인된 파서를 사용하는 작은 adapter가 필요하다. 저장 schema v2·키 동작·기존 ko/en 값은 건드리지 않는다. |
| 글꼴/방향 | 설정·목록 IMGUI는 NativeLobbyNotoSansKR/NanumMyeongjo를 사용한다. CJK·Thai 자막용 별도 폰트와 Arabic 자막 UI Toolkit 경로는 있으나 설정 전체 font provider는 없다. | 29언어 glyph coverage·폭/줄바꿈, Arabic shaping/bidi/RTL은 별도 시각/입력 검증 게이트다. 원문 존재나 자막 전용 폰트를 설정 PASS로 계상하지 않는다. |

## 기존 QA Player 1098px 한 번 실행

코드/빌드 변경 0. 고유 Settings QA ARM64 앱 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-CAPTURE-20261027/build/EXODUSER-Unity.app`을 새 표시된 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-1098-20261027`에서 `--unity-cinematic-persistence-review --unity-a15-direct -a15-phase read -screen-width 1098 -screen-height 720 -screen-fullscreen 0`로 **1회** 실행했다. PID33055와 전체 argv를 확인했고 앱을 종료했다. `audio-one-column-before.jpg`와 `audio-one-column-after-wheel.jpg`는 모두 **1098×784** JPEG(상단 창 chrome 포함)다.

실제 사운드 화면에서 효과음 카드가 위, 배경 음악 카드가 아래에 놓인 **1열**을 확인했다. 첫·끝 카드가 content 안에 완전히 보이고 고정 footer의 기본값/뒤로 버튼과 겹치지 않았다. content 설계 높이 610, 단열 마지막 카드 끝+여백 `238+190+18=446`이므로 코드의 `max(0,446-610)=0`; content 안에서 휠을 한 번 내린 전후 카드와 footer 위치도 그대로였다. 이 조건의 1열·scroll 상한 0·footer 시각 판정은 PASS. 조작 목록 자체의 맨 아래, 다른 언어 fit/RTL, 물리 마우스, 청각 출력, 미지원 게임 옵션과 A15 전체 완료는 별도 HOLD다. 앞선 1099px 요청에서 1100px·2열이었던 사실은 [A15 기록](UNITY_MAC_A15_4TAB_20261027.md)에 보존한다.

위 라벨 채택0은 PC `157e3e8f…` 당시 상태다. PC 최신 `766250b64d833acd4172c83fb694820777d68b1b`가 exact 43 ID/1247값과 semantic6/native-only13 경계를 확정한 뒤 Mac 화면 5 ID와 provider 자료를 부분 연결했다. PC 소유 키 목록의 38 ID 화면 연결은 검토용 패치로만 남았다. [고정 입력·ID별 상태·실화면](UNITY_MAC_A15_LABEL_ADAPTER_20261027.md).

후속 승인에서 PC owner가 키 목록 최소 patch를 인수했고 Mac은 `NativeKeyBindList` 38 ID 실표시와 provider exact43 allowlist를 연결했다. 1280×720 ko/en/ja/es/cs 대표 목록·장문 및 Esc/Tab 캡처 격리를 QA Player 1회로 확인했다. 이 문서의 앞선 키 목록 미연결 상태는 preflight 시점 이력이다. ar 실화면/RTL·전체29언어·물리 마우스는 계속 HOLD. [최신 인수](UNITY_MAC_A15_LABEL_ADAPTER_20261027.md#2026-10-27-pc-seam-인수allowlist-보강-후속).

글꼴 게이트 최신 상태: 위 표는 preflight 시점이다. Mac A15 제목/탭의 `el/th/zh`만 번들 지역 폰트로 보정해 1280×720 실화면을 봤다. PC 소유 키 목록은 [exact43 글꼴 감사·미적용 patch](UNITY_MAC_A15_FONT_COVERAGE_20261027.md)대로 15 locale의 현재 글꼴 cmap 결손과 대표 그리스어 긴 행 fit 위험이 남는다. 전체29 GUI/RTL PASS가 아니다.

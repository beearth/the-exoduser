# Mac A15 exact 라벨 43 ID 연결 — 2026-10-27

## 고정 입력·범위

PC commit `766250b64d833acd4172c83fb694820777d68b1b`의 후보 JSON SHA-256 `10308928cebfdd117abf6009691e084c9e129e59565b443f6e5914a8c1b4db78`와 QA v2 JSON SHA-256 `54d16aa0d70cc739371f5c4b2f501634d2db206c6b382408f7eaf0c3019b0364`를 입력으로 삼았다. QA는 직접 대응 **43 ID × 29 locale = 1247/1247 유효 표시값**, 그 안의 영어 fallback **135값**을 확정했다. 의미 대응 6 ID와 웹 정본 없는 native-only 13 ID는 연결 대상에서 제외했다. 원 QA의 27개 언어 스크립트 누락은 v2 보정 결과와 구분한다. 기존 `e7fe487bf` 코드의 저장 v2·`cinSeen`·입력 처리 및 19 UI patch는 수정하지 않았다.

## 코드 연결

| 영역 | 소유·적용 | 결과 |
|---|---|---|
| 자료 | `Resources/Data/a15_settings_labels_exact.json`에 검수된 exact 43 ID만 배열형으로 저장. **1112** locale 문자열과 **135** 영어 fallback을 사용한다. 리소스 SHA-256 `edf3a9034b44ac86edf4f9f3375fd080c42018c8e8a609d25c56c994d651d4bd` | `JsonUtility` 고정 배열 스키마. 후보의 가변 `entries` 객체를 런타임에서 직접 파싱하지 않음 |
| Mac provider | `NativeA15SettingsLabels`가 ID→locale와 key 원문→ID를 최초 1회 구축. 리소스 누락·형식 오류·ID 수/집합 불일치 때 원래 ko/en 문구로 되돌림. `ar`은 영어 fallback 강제 | 43 ID 로드 로그 PASS. Arabic shaping/RTL을 지원한다고 주장하지 않음 |
| Mac 화면 | `NativeGame`이 기존 정규화된 `lobby.Language`를 `NativePauseMenu.LocaleCode`에 전달. `NativePauseMenu`의 제목+4탭 **5 ID**만 `Exact` 조회 | ko/en 원래 문자열 유지. 27언어 탭은 웹 정본대로 영어. 의미 대응6/Native 전용13은 기존 문구 유지 |
| PC 소유 목록 | 나머지 **38 ID**의 T/L·동작명·마우스 키명은 PC owner가 인수한 [좁은 hunk](unity_patches/A15_keylist_locale_seam.patch)로 `NativeKeyBindList`에 연결. `NativePauseMenu`가 정규화 locale을 목록에 전달 | base blob 확인·격리 적용 후 Mac 제품에 적용, 기존 CRLF 보존. ARM64 빌드·ja/es/cs 실제 목록 표시 PASS |
| QA 동선 | marker가 있는 Settings QA 직접 진입에서만 F8로 ko→en→ja→es→cs를 순환하고 제목·키 이름 provider 결과를 로그에 남김 | 일반 실행 언어 선택/설정 저장과 별개 |

## 43 ID별 적용 표

| ID | 한국어 원문 | 영어 fallback | 현재 표시 연결 |
|---|---|---|---|
| `settings.title` | 설정 | Settings | Mac 화면 |
| `settings.tab.game` | 게임 | Game | Mac 화면 |
| `settings.tab.display` | 화면 | Display | Mac 화면 |
| `settings.tab.audio` | 사운드 | Audio | Mac 화면 |
| `settings.tab.controls` | 조작 | Controls | Mac 화면 |
| `key.mode.kbm` | ⌨ 키보드·마우스 | ⌨ Keyboard & Mouse | Mac 화면(PC patch 인수) |
| `key.mode.pad` | 🎮 게임패드 | 🎮 Gamepad | Mac 화면(PC patch 인수) |
| `key.text.alt` | 보조 | Sub | Mac 화면(PC patch 인수) |
| `key.text.listenMain` | ⟨ 입력 대기... ⟩ | ⟨ Waiting... ⟩ | Mac 화면(PC patch 인수) |
| `key.text.listenAlt` | ⟨ 대기 ⟩ | ⟨ Wait ⟩ | Mac 화면(PC patch 인수) |
| `key.text.hint` | 아무 키 또는 마우스 버튼을 누르세요 (ESC = 취소) | Press any key or mouse button (ESC = cancel) | Mac 화면(PC patch 인수) |
| `key.text.reset` | 키 설정 초기화 (또는 F5 키) | Reset Key Bindings (or F5) | Mac 화면(PC patch 인수) |
| `key.text.resetDone` | 키 설정 초기화 완료 | Key settings reset | Mac 화면(PC patch 인수) |
| `key.text.fixed` | 고정 | Lock | Mac 화면(PC patch 인수) |
| `key.text.padTitle` | 🎮 게임패드 버튼 설정 | 🎮 Gamepad Button Config | Mac 화면(PC patch 인수) |
| `key.text.padReset` | 패드 키 초기화 | Reset Pad Keys | Mac 화면(PC patch 인수) |
| `key.text.padGuide` | 🎮 전체 조작 가이드 | 🎮 Full Controls Guide | Mac 화면(PC patch 인수) |
| `key.action.up` | 위로 이동 | Move Up | Mac 화면(PC patch 인수) |
| `key.action.down` | 아래로 이동 | Move Down | Mac 화면(PC patch 인수) |
| `key.action.left` | 왼쪽 이동 | Move Left | Mac 화면(PC patch 인수) |
| `key.action.right` | 오른쪽 이동 | Move Right | Mac 화면(PC patch 인수) |
| `key.action.weapon` | 무기 공격 | Weapon Attack | Mac 화면(PC patch 인수) |
| `key.action.shield` | 칼등 처내기 (탭=처내기, 홀드=연사) | Blade Parry (tap=parry, hold=rapid) | Mac 화면(PC patch 인수) |
| `key.action.bow` | Space 분노 폭발 | Space Rage Burst | Mac 화면(PC patch 인수) |
| `key.action.charge` | 사슬 이동 | Chain Dash | Mac 화면(PC patch 인수) |
| `key.action.parry` | 데빌포스 흡수 | Devilforce Absorb | Mac 화면(PC patch 인수) |
| `key.action.beam` | 마법 (탭=투사체, 홀드=빔) | Magic (tap=projectile, hold=beam) | Mac 화면(PC patch 인수) |
| `key.action.skill` | 전투 스킬 | Combat Skills | Mac 화면(PC patch 인수) |
| `key.action.forge` | 대장간 | Forge | Mac 화면(PC patch 인수) |
| `key.action.inventory` | 인벤토리 | Inventory | Mac 화면(PC patch 인수) |
| `key.action.settings` | 설정 | Settings | Mac 화면(PC patch 인수) |
| `key.action.interact` | 아이템 줍기 | Pick Up Item | Mac 화면(PC patch 인수) |
| `key.action.storage` | 보관함 | Storage | Mac 화면(PC patch 인수) |
| `key.action.stats` | 능력치 (스탯/패시브) | Stats (Stats/Passives) | Mac 화면(PC patch 인수) |
| `key.action.skillCycle` | 스킬 슬롯 배정 | Skill Slot Assign | Mac 화면(PC patch 인수) |
| `key.action.irisToggle` | 유령불꽃 켜기/끄기 | Ghost Flame On/Off | Mac 화면(PC patch 인수) |
| `key.action.bladeToggle` | 기동칼날개 자동 켜기/끄기 | Bladewing Auto On/Off | Mac 화면(PC patch 인수) |
| `key.code.none` | 없음 | None | Mac 화면(PC patch 인수) |
| `key.code.mouse0` | 좌클릭 | LMB | Mac 화면(PC patch 인수) |
| `key.code.mouse1` | 휠클릭 | MMB | Mac 화면(PC patch 인수) |
| `key.code.mouse2` | 우클릭 | RMB | Mac 화면(PC patch 인수) |
| `key.code.mouse3` | 마우스4 | Mouse4 | Mac 화면(PC patch 인수) |
| `key.code.mouse4` | 마우스5 | Mouse5 | Mac 화면(PC patch 인수) |

## 검증 영수증·시각 범위

- 자료 대조 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-LABEL-20261027/data-verification.json`: exact ID 집합43/43, 후보값1112/1112, 영어 fallback135, 의미6/native-only13 분리. 키 목록의 보관함은 기존 영어 `Storage` fallback이다.
- Unity 6000.6.7f1 Mac ARM64 고유 Settings QA `PortVerification.Build` **1회 Succeeded**, 오류0, receipt `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-LABEL-20261027/build-receipt.json`. 기존 UAC1001 외 C# 오류 없음. 빌드 생성 tracked 413파일은 `build-generated.patch`로 보존 후 HEAD bytes 복원.
- 같은 앱을 새 marker 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-LOCALE-20261027`에서 `--unity-cinematic-persistence-review --unity-a15-direct -a15-phase read`로 **1회** 실행했다. 로그 `A15_LABEL_RESOURCE loaded=True ids=43`; F8 로그의 제목은 en `Settings`, ja `設定`, es `Ajustes`, cs `Nastavení`; keyUp provider 값은 각각 `Move Up`, `上移動`, `Mover Arriba`, `Pohyb nahoru`였다. 화면 JPEG `settings-ko/en/ja/es/cs.jpg`에서 ko/en 기존 제목·4탭 및 ja/es/cs 제목을 확인했다. 이 시점의 ja/es/cs 키 목록은 영어였고 provider 조회 로그를 실표시로 승격하지 않았다. 아래 후속에서 실제 목록을 연결·재검수했다.
- 리소스 제거/손상 주입, 29언어 전체 글리프·길이 fit, Arabic shaping/bidi/RTL, 물리 마우스·청각 출력, 미지원 게임 옵션은 이번 실기 범위가 아니다. 기존 1098px 1열 PASS와 전체 A15 판정은 별개다.

## 2026-10-27 PC seam 인수·allowlist 보강 후속

PC UI owner가 고정 base `7065b7fe309aacbbe09292dbd19e76b2fad55c94`의 검토 패치를 `NativeKeyBindList`/`NativePauseMenu` 최소 hunk로 인수했다. Mac은 `NativeKeyBindList.cs` blob `3ffd4a57c902c6745b3895973b9abfc79ac1c36e`, `NativePauseMenu.cs` blob `afb6ff18b5faff316082fbc0f8850b82693c72f4`에서 `git apply --check --ignore-space-change` 후 적용했다. 목록 파일의 기존 CRLF 313/315줄과 예외 LF 2줄을 보존했고 diff는 목록 +6/−6, 메뉴 +2/−2줄이다. `KeyBindings`·저장·입력 처리 변경은 없다.

| 검수 항목 | 결과·범위 |
|---|---|
| provider 입력 검증 | 로더에 승인 exact 43 ID allowlist와 중복·누락 검사를 넣었다. 원본 리소스 SHA-256 `edf3a9034b44ac86edf4f9f3375fd080c42018c8e8a609d25c56c994d651d4bd`는 불변. 실패 시 기존 ko/en fallback 및 `ar` 영어 fallback 유지 |
| 변형 자료 QA | 원본 복사본 43 허용, 1 ID 교체 43·중복 43·누락 42 거부. [정적 소스/fixture 영수증](/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-ALLOWLIST-20261027/allowlist-qa.json). 변형 리소스의 Unity 런타임 주입은 하지 않았으므로 주입 실기 PASS로 계산하지 않음 |
| 빌드 | `PortVerification.Build -settingsQa true` ARM64 **1회 Succeeded**, 오류0, 기존 UAC1001만. [receipt](/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-KEYLIST-20261027/build-receipt.json). 첫 Unity CLI 호출은 잘못된 메서드 네임스페이스로 Build 진입 전 종료되어 성공 빌드 1회와 별도 기록. 빌드 생성 tracked 413/meta 2파일은 `_out`에 보존한 뒤 작업 상태 복원 |
| Player 실표시 | 새 marker 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-KEYLIST-20261027`에서 QA Player **1회**. `settings-ko/en/ja/es/cs.jpg`를 확인: ko/en 기존 제목·행, ja/es/cs 실제 동작명·보조·마우스 키명 표시. 1280×720의 대표 긴 행은 열 경계 안에 표시됨. 로그 `A15_LABEL_RESOURCE loaded=True ids=43`와 F8 locale 조회 일치 |
| 캡처 격리 | 같은 Player에서 F6→Esc는 캡처만 취소하고 조작 탭 유지, F6→Tab은 `up=Tab`으로 표시하고 조작 탭 유지. 실제 `capture-esc.jpg`, `capture-tab.jpg` 보존. 새 격리 QA 루트 외 설정·로스터는 사용하지 않음 |
| 남은 경계 | `ar` 영어 fallback은 코드 분기와 PC QA 데이터 감사로 확인, **ar 실화면/RTL 미검증**. 전체 29 locale 글리프·길이, 물리 마우스 클릭, 청각, 패드, 일반 실행 흐름은 이번 Player 1회의 PASS가 아님. semantic6/native-only13은 연결하지 않았고 기존 ko/en 문구를 유지 |

후속 글꼴 감사: 아직 실화면 검수하지 않은 23 locale의 exact43 표시 문자열을 실제 Settings/KeyList 스타일 폰트 cmap과 대조했다. 15 locale/170 ID×locale 행에 결손이 있고 Mac 소유 `NativePauseMenu`의 el/th/zh 제목·탭만 번들 지역 폰트로 보완해 ARM64 빌드1회 및 격리 Player 위험 문자·ko 복귀를 확인했다. PC 소유 목록의 글꼴·장문 fit은 별도 patch 제안 상태다. [누락 최소표·실화면 범위](UNITY_MAC_A15_FONT_COVERAGE_20261027.md).

PC UI owner의 새 인수본 `97be6444b6…` 뒤 키 목록 38 ID 표시 경로에 지역 font/폭·렌더 동일 style과 이름 2행/clip을 적용했다. 기존 exact43 자료/ID allowlist는 변경하지 않았다. el/th/zh 목록 및 ko 복귀는 격리 Player 상단 화면에서 보였으나 OS 마우스 hit rect 실패와 전체29 언어/RTL·Thai shaping은 HOLD. [최신 제품·검수 경계](UNITY_MAC_A15_FONT_COVERAGE_20261027.md#pc-소유-수정본-인수제품-적용--실화면--2026-10-27).

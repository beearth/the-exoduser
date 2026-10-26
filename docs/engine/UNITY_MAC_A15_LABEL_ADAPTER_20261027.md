# Mac A15 exact 라벨 provider 부분 연결 — 2026-10-27

## 고정 입력·범위

PC commit `766250b64d833acd4172c83fb694820777d68b1b`의 후보 JSON SHA-256 `10308928cebfdd117abf6009691e084c9e129e59565b443f6e5914a8c1b4db78`와 QA v2 JSON SHA-256 `54d16aa0d70cc739371f5c4b2f501634d2db206c6b382408f7eaf0c3019b0364`를 입력으로 삼았다. QA는 직접 대응 **43 ID × 29 locale = 1247/1247 유효 표시값**, 그 안의 영어 fallback **135값**을 확정했다. 의미 대응 6 ID와 웹 정본 없는 native-only 13 ID는 연결 대상에서 제외했다. 원 QA의 27개 언어 스크립트 누락은 v2 보정 결과와 구분한다. 기존 `e7fe487bf` 코드의 저장 v2·`cinSeen`·입력 처리 및 19 UI patch는 수정하지 않았다.

## 코드 연결

| 영역 | 소유·적용 | 결과 |
|---|---|---|
| 자료 | `Resources/Data/a15_settings_labels_exact.json`에 검수된 exact 43 ID만 배열형으로 저장. **1112** locale 문자열과 **135** 영어 fallback을 사용한다. 리소스 SHA-256 `edf3a9034b44ac86edf4f9f3375fd080c42018c8e8a609d25c56c994d651d4bd` | `JsonUtility` 고정 배열 스키마. 후보의 가변 `entries` 객체를 런타임에서 직접 파싱하지 않음 |
| Mac provider | `NativeA15SettingsLabels`가 ID→locale와 key 원문→ID를 최초 1회 구축. 리소스 누락·형식 오류·ID 수 불일치 때 원래 ko/en 문구로 되돌림. `ar`은 영어 fallback 강제 | 43 ID 로드 로그 PASS. Arabic shaping/RTL을 지원한다고 주장하지 않음 |
| Mac 화면 | `NativeGame`이 기존 정규화된 `lobby.Language`를 `NativePauseMenu.LocaleCode`에 전달. `NativePauseMenu`의 제목+4탭 **5 ID**만 `Exact` 조회 | ko/en 원래 문자열 유지. 27언어 탭은 웹 정본대로 영어. 의미 대응6/Native 전용13은 기존 문구 유지 |
| PC 소유 목록 | 나머지 **38 ID**는 자료와 provider 조회 가능. `NativeKeyBindList`의 T/L·동작명·마우스 키명 표시에는 새 hook이 아직 없음 | [검토용 좁은 hunk](unity_patches/A15_keylist_locale_seam.patch) `git apply --check --ignore-space-change` PASS, 제품 적용·컴파일 **0**. PC owner 검토 후 별도 연결 필요 |
| QA 동선 | marker가 있는 Settings QA 직접 진입에서만 F8로 ko→en→ja→es→cs를 순환하고 제목·키 이름 provider 결과를 로그에 남김 | 일반 실행 언어 선택/설정 저장과 별개 |

## 43 ID별 적용 표

| ID | 한국어 원문 | 영어 fallback | 현재 표시 연결 |
|---|---|---|---|
| `settings.title` | 설정 | Settings | Mac 화면 |
| `settings.tab.game` | 게임 | Game | Mac 화면 |
| `settings.tab.display` | 화면 | Display | Mac 화면 |
| `settings.tab.audio` | 사운드 | Audio | Mac 화면 |
| `settings.tab.controls` | 조작 | Controls | Mac 화면 |
| `key.mode.kbm` | ⌨ 키보드·마우스 | ⌨ Keyboard & Mouse | provider 준비 / PC 목록 seam 대기 |
| `key.mode.pad` | 🎮 게임패드 | 🎮 Gamepad | provider 준비 / PC 목록 seam 대기 |
| `key.text.alt` | 보조 | Sub | provider 준비 / PC 목록 seam 대기 |
| `key.text.listenMain` | ⟨ 입력 대기... ⟩ | ⟨ Waiting... ⟩ | provider 준비 / PC 목록 seam 대기 |
| `key.text.listenAlt` | ⟨ 대기 ⟩ | ⟨ Wait ⟩ | provider 준비 / PC 목록 seam 대기 |
| `key.text.hint` | 아무 키 또는 마우스 버튼을 누르세요 (ESC = 취소) | Press any key or mouse button (ESC = cancel) | provider 준비 / PC 목록 seam 대기 |
| `key.text.reset` | 키 설정 초기화 (또는 F5 키) | Reset Key Bindings (or F5) | provider 준비 / PC 목록 seam 대기 |
| `key.text.resetDone` | 키 설정 초기화 완료 | Key settings reset | provider 준비 / PC 목록 seam 대기 |
| `key.text.fixed` | 고정 | Lock | provider 준비 / PC 목록 seam 대기 |
| `key.text.padTitle` | 🎮 게임패드 버튼 설정 | 🎮 Gamepad Button Config | provider 준비 / PC 목록 seam 대기 |
| `key.text.padReset` | 패드 키 초기화 | Reset Pad Keys | provider 준비 / PC 목록 seam 대기 |
| `key.text.padGuide` | 🎮 전체 조작 가이드 | 🎮 Full Controls Guide | provider 준비 / PC 목록 seam 대기 |
| `key.action.up` | 위로 이동 | Move Up | provider 준비 / PC 목록 seam 대기 |
| `key.action.down` | 아래로 이동 | Move Down | provider 준비 / PC 목록 seam 대기 |
| `key.action.left` | 왼쪽 이동 | Move Left | provider 준비 / PC 목록 seam 대기 |
| `key.action.right` | 오른쪽 이동 | Move Right | provider 준비 / PC 목록 seam 대기 |
| `key.action.weapon` | 무기 공격 | Weapon Attack | provider 준비 / PC 목록 seam 대기 |
| `key.action.shield` | 칼등 처내기 (탭=처내기, 홀드=연사) | Blade Parry (tap=parry, hold=rapid) | provider 준비 / PC 목록 seam 대기 |
| `key.action.bow` | Space 분노 폭발 | Space Rage Burst | provider 준비 / PC 목록 seam 대기 |
| `key.action.charge` | 사슬 이동 | Chain Dash | provider 준비 / PC 목록 seam 대기 |
| `key.action.parry` | 데빌포스 흡수 | Devilforce Absorb | provider 준비 / PC 목록 seam 대기 |
| `key.action.beam` | 마법 (탭=투사체, 홀드=빔) | Magic (tap=projectile, hold=beam) | provider 준비 / PC 목록 seam 대기 |
| `key.action.skill` | 전투 스킬 | Combat Skills | provider 준비 / PC 목록 seam 대기 |
| `key.action.forge` | 대장간 | Forge | provider 준비 / PC 목록 seam 대기 |
| `key.action.inventory` | 인벤토리 | Inventory | provider 준비 / PC 목록 seam 대기 |
| `key.action.settings` | 설정 | Settings | provider 준비 / PC 목록 seam 대기 |
| `key.action.interact` | 아이템 줍기 | Pick Up Item | provider 준비 / PC 목록 seam 대기 |
| `key.action.storage` | 보관함 | Storage | provider 준비 / PC 목록 seam 대기 |
| `key.action.stats` | 능력치 (스탯/패시브) | Stats (Stats/Passives) | provider 준비 / PC 목록 seam 대기 |
| `key.action.skillCycle` | 스킬 슬롯 배정 | Skill Slot Assign | provider 준비 / PC 목록 seam 대기 |
| `key.action.irisToggle` | 유령불꽃 켜기/끄기 | Ghost Flame On/Off | provider 준비 / PC 목록 seam 대기 |
| `key.action.bladeToggle` | 기동칼날개 자동 켜기/끄기 | Bladewing Auto On/Off | provider 준비 / PC 목록 seam 대기 |
| `key.code.none` | 없음 | None | provider 준비 / PC 목록 seam 대기 |
| `key.code.mouse0` | 좌클릭 | LMB | provider 준비 / PC 목록 seam 대기 |
| `key.code.mouse1` | 휠클릭 | MMB | provider 준비 / PC 목록 seam 대기 |
| `key.code.mouse2` | 우클릭 | RMB | provider 준비 / PC 목록 seam 대기 |
| `key.code.mouse3` | 마우스4 | Mouse4 | provider 준비 / PC 목록 seam 대기 |
| `key.code.mouse4` | 마우스5 | Mouse5 | provider 준비 / PC 목록 seam 대기 |

## 검증 영수증·시각 범위

- 자료 대조 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-LABEL-20261027/data-verification.json`: exact ID 집합43/43, 후보값1112/1112, 영어 fallback135, 의미6/native-only13 분리. 키 목록의 보관함은 기존 영어 `Storage` fallback이다.
- Unity 6000.6.7f1 Mac ARM64 고유 Settings QA `PortVerification.Build` **1회 Succeeded**, 오류0, receipt `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A15-LABEL-20261027/build-receipt.json`. 기존 UAC1001 외 C# 오류 없음. 빌드 생성 tracked 413파일은 `build-generated.patch`로 보존 후 HEAD bytes 복원.
- 같은 앱을 새 marker 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-LOCALE-20261027`에서 `--unity-cinematic-persistence-review --unity-a15-direct -a15-phase read`로 **1회** 실행했다. 로그 `A15_LABEL_RESOURCE loaded=True ids=43`; F8 로그의 제목은 en `Settings`, ja `設定`, es `Ajustes`, cs `Nastavení`; keyUp provider 값은 각각 `Move Up`, `上移動`, `Mover Arriba`, `Pohyb nahoru`였다. 화면 JPEG `settings-ko/en/ja/es/cs.jpg`에서 ko/en 기존 제목·4탭 및 ja/es/cs 제목을 확인했다. ja/es/cs의 키 목록은 현재 영어이며 provider 조회 로그를 실표시로 승격하지 않는다.
- 리소스 제거/손상 주입, 29언어 전체 글리프·길이 fit, Arabic shaping/bidi/RTL, 물리 마우스·청각 출력, 미지원 게임 옵션은 이번 실기 범위가 아니다. 기존 1098px 1열 PASS와 전체 A15 판정은 별개다.

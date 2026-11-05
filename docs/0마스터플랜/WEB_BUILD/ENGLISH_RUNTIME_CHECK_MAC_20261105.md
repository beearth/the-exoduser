# 영어 모드 런타임 점검 (2026-11-05, Mac)

**결론: 영어로 바꾸면 로비·필드 HUD·설정 본문은 영어로 나오고, 인벤토리·스킬·능력치·대장간 네 패널과 패널 상단 탭, 아이템 획득 알림은 한글 그대로다.** 이 상태로는 크로마 심사자가 패널을 여는 순간 한글을 본다.

게임 코드는 바꾸지 않았다. 캡처는 커밋하지 않는 로컬 프로브로 찍었다(`tools/web_build/local_lang_probe.cs.txt`). 기준 커밋은 `3ec4a900e`, 1920×1080, 예외 0건이다.

## 1. 언어가 정해지는 경로

| 질문 | 답 | 위치 |
|---|---|---|
| 기본 언어 | `ko` | `NativeLobby.Language` |
| 전환 함수 | `lobby.SetLanguage(code)` 하나로 모인다 | `NativeLobby.cs:48` |
| 설정 화면에서 고를 때 | `SetLanguage` 호출 후 설정 저장 | `NativeGame.cs:153` (`pauseMenu.LanguagePicked`) |
| 로비 언어 메뉴 | `SetLanguage` 호출 | `NativeLobby.LanguageMenu.cs:25`, `:64` |
| 다음 실행 때 복원 | 저장된 `Options.Lang`을 읽어 `SetLanguage` | `NativeGame.SettingsPersistence.cs:45-50` |
| 코드가 영어를 판단하는 값 | `lobby.Language != "ko"` | `NativeGame.StageFlow.cs:18` |
| `-qa-locale` | **지옥문 목표 캡처 안에서만 읽는다.** `--unity-hellgate-objective-check`로 들어갈 때만 동작하고 다른 실행에서는 아무것도 바꾸지 않는다 | `NativeGame.HellGateObjectiveCapture.cs:50`, 진입 `NativeGame.cs:161` |

이전 캡처의 HUD가 한글이었던 이유는 `-qa-locale`을 줘도 일반 실행에서는 언어가 `ko`로 남았기 때문이다.

**한글이 남는 이유는 두 가지다.**

1. **패널 코드가 언어 값을 읽지 않는다.** 아래 파일에는 언어 분기가 한 줄도 없고 한글이 코드에 고정돼 있다.
2. **영어 데이터가 있어도 안 쓰거나, 아예 없다.**
   - 능력치: `stat_panel_web.json`의 31개 노드에 `nameEn`·`descEn`·`noteEn`이 모두 있는데, `NativeStatPanel.cs:160`이 `nameKo`만 돌려주고 `:461`이 `noteKo`만 그린다. 별(`stars`) 항목은 확인하지 않았다.
   - 기검참 설명: `skill_ui.json`에 `descriptionEn`이 있지만 런타임 코드에 읽는 곳이 없다(선언 `Core/SkillUiState.cs:4`뿐).
   - 스킬 48종: `skill_defs_web.json`에 영어 칸이 없다.
   - 대장간: `forge_web.json`에 영어 칸이 없다.
   - 아이템 이름: `Core/DropTablesData.cs:573` 등과 `inventory_seed.json`에 한글만 있다.

## 2. 화면별 결과

| 화면 | 결과 | 캡처 |
|---|---|---|
| FDG 로고·타이틀 메뉴 | 영어 | [타이틀](ENGLISH_RUNTIME_CHECK_MAC_20261105/01-title.jpg) |
| 로비 | 영어. **단, 캐릭터 칸 2개에 글자가 비어 있다**(아래 §4) | [로비](ENGLISH_RUNTIME_CHECK_MAC_20261105/02-lobby.jpg) |
| 필드 HUD | 영어. 레벨·경험치·구역 처치·목표·SP·CP·키 표시 | [필드](ENGLISH_RUNTIME_CHECK_MAC_20261105/03-field.jpg) |
| 획득 알림 | **한글** | [1x 크롭](ENGLISH_RUNTIME_CHECK_MAC_20261105/04-toast-crop-1x.jpg) |
| 인벤토리 | **전부 한글** | [인벤토리](ENGLISH_RUNTIME_CHECK_MAC_20261105/05-inventory.jpg) |
| 스킬 | **거의 전부 한글.** 슬롯 키 이름과 Lv만 영어 | [스킬](ENGLISH_RUNTIME_CHECK_MAC_20261105/06-skill.jpg) |
| 능력치 | **거의 전부 한글.** STR 등 약자만 영어 | [능력치](ENGLISH_RUNTIME_CHECK_MAC_20261105/07-stat.jpg) |
| 대장간 | **전부 한글** | [대장간](ENGLISH_RUNTIME_CHECK_MAC_20261105/08-forge.jpg) |
| 설정 | 본문 영어, **상단 탭만 한글** | [설정](ENGLISH_RUNTIME_CHECK_MAC_20261105/09-settings.jpg) |

## 3. 영어 모드에서 한글이 남는 자리

아래는 실제 화면에서 본 문구의 출처다. 전체 후보는 [`korean_code_literals_mac_20261105.csv`](korean_code_literals_mac_20261105.csv)에 있다.

| 화면 | 남는 문구 | 파일:줄 |
|---|---|---|
| 모든 패널 상단 탭 | 설정·인벤토리·대장간·스킬·능력치 | `NativePanelTabBar.cs:15` |
| 획득 알림 | 등급명, "획득!" | `NativeGame.WorldDrops.cs:136`, `:143` |
| 알림 | 쓰러졌습니다 | `NativeGame.cs:349` |
| 알림 | 석궁 자동발사 ON/OFF | `NativeGame.cs:553` |
| 알림 | 패링 관련 안내 | `NativeGame.cs:327` |
| 공격 슬롯 상태줄 | 준비, 공격 중, 충전, 체력 부족 등 | `Core/SkillUiState.cs:16-24`, 조합 `NativeHudSkills.cs:79` |
| 인벤토리 | 하위 탭(장비·유골함·유물·보관함) | `NativeInventoryDock.cs:181` |
| 인벤토리 | 장착 중 / 장착 부위·유물 홈 | `NativeInventoryDock.cs:197`, `:214` |
| 인벤토리 | 정렬 / 아이템 필터 | `NativeInventoryDock.cs:259`, `:267` |
| 인벤토리 | 장비 기록·현재 전투 구성 / 공격·방어·추가 효과 | `NativeInventoryDock.cs:344-345`, `:351` |
| 인벤토리 | 전체 쓰레기 지정 / 악의오브 | `NativeInventoryDock.cs:404`, `:116` |
| 인벤토리 | 비교 창(화면에 띄우지는 않음) | `NativeInventoryComparison.cs` 전체 |
| 인벤토리 | 아이템 이름 | `Core/DropTablesData.cs:573` 등, `Resources/Data/inventory_seed.json` |
| 스킬 | 전투 스킬 / 슬롯 조건 | `NativeSkills.cs:191`, `:211` |
| 스킬 | 강화·습득 버튼 | `NativeSkills.cs:250-251` |
| 스킬 | 합성 안내 | `NativeSkills.cs:277` |
| 스킬 | 닫기·일괄 레벨업·추천 자동 | `NativeSkills.cs:311-314` |
| 스킬 | 스킬 이름·설명, "넣을 수 있는 스킬" | `Resources/Data/skill_defs_web.json`, `skill_ui.json` |
| 능력치 | 성장의 각인 / 전투의 길 | `NativeStatPanel.cs:221`, `:228` |
| 능력치 | 필터·길 이름 | `NativeStatPanel.cs:250`, `:256` |
| 능력치 | 투자 레벨 / 패시브 분석 | `NativeStatPanel.cs:429`, `:470` |
| 능력치 | 노드 이름·설명 | `NativeStatPanel.cs:160`, `:461` (영어 데이터 있음) |
| 능력치 | 자동 투자 예약 / 하단 버튼 | `NativeStatPanel.cs:500-516`, `:525-527` |
| 대장간 | 제목 | `NativeForgePanel.cs:123` |
| 대장간 | 탭·강화 문구·성공률 등 | `Resources/Data/forge_web.json`, `NativeForgePanel*.cs` |

언어 분기가 없는 파일의 한글 줄 수:

| 파일 | 한글 줄 |
|---|---|
| `NativeInventoryComparison.cs` | 58 |
| `NativeSkills.cs` | 34 |
| `NativeStatPanel.cs` | 33 |
| `NativeInventoryDock.cs` | 30 |
| `NativeInventoryOssuary.cs` | 26 |
| `NativeInventoryStorage.cs` | 13 |
| `NativeForgePanel*.cs` | 12 |
| `NativeInventoryCrystals.cs` | 11 |

## 4. 확인하지 못한 것

- **설정 화면의 언어 메뉴를 직접 누르지 않았다.** 프로브가 `SetLanguage("en")`을 직접 불렀다. 메뉴도 같은 함수를 부르는 것은 코드로만 확인했다. 재시작 후 복원도 실행해 보지 않았다.
- **1-1을 끝까지 플레이하지 않았다.** 그래서 이 문서는 "한 판의 전체 목록"이 아니라 "멈춘 화면과 코드에서 찾은 목록"이다. 실제 전투, 보스, 사망, 구역 정화, 스테이지 클리어, 로딩 팁, 첫 연습은 이번에 화면으로 보지 않았다. 이 화면들의 코드에는 언어 분기가 있다.
- **획득 알림은 실제로 주워서 띄운 것이 아니다.** `NativeGame.WorldDrops.cs:143`과 같은 조합을 프로브가 `Toast`로 호출했고, 이름 자리는 "Test"다.
- **적 머리 위 이름, 데미지 숫자**: 이번 캡처에는 나타나지 않았다.
- **로비 캐릭터 칸 2개의 빈 글자**: QA 샌드박스의 빈 세이브 때문일 수 있지만 원인을 확인하지 않았다. 한국어 모드와 비교하지 않았다.
- **`NativeDemoText.Get`의 대체 동작**: 표에 없는 키는 영어 모드에서 `fallback ?? key`를 돌려준다(`NativeDemoText.cs:32`). 호출에 영어 fallback이 없으면 키인 한글이 그대로 나온다. 이 경로로 남는 수는 세지 않았다.

## 5. 고칠 때 참고

코드 수정은 지시 범위 밖이라 하지 않았다. 작업량은 추정이다.

- **가장 싸다:** 능력치 노드(영어 데이터가 있음, `Name`과 `noteKo` 자리), 기검참 설명, 패널 탭 1줄, 등급명·획득 알림.
- **번역문 작성이 필요하다:** 스킬 48종, 대장간, 아이템 이름. `CLAUDE.md` 규칙대로 `번역대상_전체목록.md`에 먼저 올려야 한다.
- **패널 고정 문구:** 파일별로 `NativePauseMenu.T(ko,en)`(`NativePauseMenu.cs:53`)과 같은 방식을 쓸 수 있다.
- **1-1 데모 범위 판단이 필요하다:** 유골함·보관함·유물·제작을 제출판에서 열어 둘지에 따라 분량이 달라진다.

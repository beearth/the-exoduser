# Unity 레벨업 표시 (분모 A20) — PC-A20 (2026-10-26)

기준: 사용자 확정 "UI는 일단 그대로 이식". 웹 기준 `G:/exoduser/game.html`(main 1770c2698, 아래 줄 번호는 d5f32ff57과 같음)과 `level-up-vfx.js`. 구현: 단순작업2. 브랜치 `claude/unity-pc-overlays-20261026`(`cc39eb672` 기준). 커밋은 맥북 총괄 검수 뒤.

## 2026-10-31 현행 연결 계약

아래 §4~5는 2026-10-26 초기 patch의 이력이다. 현행 `Simulation.AddExperience`는 실제 레벨 상승 시 `LevelledUp`을 호출하고, `NativeGame.OnLevelledUp`은 `sound.PlayLevelUp`·오버레이 표시·저장 요청을 처리한다. 레벨업 효과음은 현재 [ENTER·UI 사운드 계약](UNITY_UI_SOUND_MATCH_20261031.md)의 웹 합성 원음으로 연결되어 있다. 초기 patch의 ‘콜백 없음/효과음 미이식’을 현행 구현 상태로 해석하지 않는다.

| 항목 | 현행 값 / 검수 |
|---|---|
| 일반 경험치 | `Core/LevelExp.cs`의 `LevelExp.Add`: `trans=false`이면 입력을 정수 나누기3 후 보너스 적용. 이 단위에서 공식 변경0 |
| 초월 | 같은 Core의 1000레벨 이상 일일 상승 제한과 초월 처리가 존재한다. 아래 초기 문서의 ‘1000까지만’은 당시 이력 |
| 실제 레벨업 캡처 | 기존 NativeLevelUpOverlay.Capture와 UiSoundCapture 모두 일반 `AddExperience(MaxExperience*3)` 경로로 레벨 상승을 유발한다. UiSoundCapture의 frame330(22초)은 실제 Level 증가와 ui_levelup 이벤트1회를 함께 확인한다 |
| 수정 근거 | R5 캡처260ccf8f에서 `AddExperience(MaxExperience)` 입력으로 레벨업이 발생하지 않아 RED. 녹음 도구의 입력량만3배로 맞췄으며 제품 Core·레벨업 콜백·효과음 경로는 변경하지 않는다. 수정 후 새 공식 Player 검수는 UI 사운드 문서에 누적 |

## 1. 웹 근거 — 실제 레벨업은 무엇으로 구성되나

| 요소 | 종류 | 코드 | 이식 |
|---|---|---|---|
| `#lvUpScreen`/`#lvUpTitle`/`#lvUpSub`/`#lvUpClose` | **미사용 오버레이**(HTML만 있고 어디서도 `opacity:1`로 열지 않음. 13920 숨김 목록, 43177 닫기 핸들러만 존재) | `game.html` 3103-3107 | **이식하지 않음** |
| 빛기둥·링·불꽃 | 캔버스 VFX | `level-up-vfx.js` 74-95 trigger/update, 109-136 draw, `game.html` 54487·54492 | **미이식**(Unity 재제작 대상). 지속 3.0s |
| **"Lv. N"** | **캔버스 텍스트**(월드 좌표, 플레이어 머리 위) | `level-up-vfx.js` 96-107 `drawLabel`(호출 `game.html` 54493) | **이식** |
| **"LEVEL UP!"/"TRANSCEND!"** | **DOM 토스트 `#ph`** | `game.html` 43164 `showPH(…,'#ffdd00'/'#d38aff',2500)`, 함수 43611, CSS 679-680 | **이식** |
| "SP +N [AP +M]" 떠오르는 글씨 | 캔버스 `addTxt`(43167) — **그리기 화이트리스트에 걸려 화면에 나오지 않음**(`game.html` 54839-54845: `시전·그로기·무적·CRIT·사망·탈출·✟·🌋`만 허용) | 43167 | 해당 없음(웹에서도 안 보임) |
| 왼쪽 HUD "✦ SP +3" 줄 | HUD DOM(상태 표시) | NativeHud 소유 영역 | 이 단위 범위 밖 |

### 타이밍(웹 정의)

- 라벨(`DURATION` 3.5s): 나이 `age`(게임 dt 누적). 알파 = `min(1, age/.08) × clamp((3.5-age)/.6)`. y = 플레이어 y − 70 − 18×`min(1, age/3.5)`. 24px `Cinzel`(700으로 합성), 어두운 색 4방향(±1,±1) 복사 + 채움. 금색 채움 `#ffe6a3`/외곽 `#241707`, 마성(`PASSIVES.pDemon>pHuman`) `#e5b4ff`/`#1d092b`. 0.24s 안에 다시 트리거되면 age를 유지(merge).
- 토스트: `#ph` `position:fixed; bottom:180px; left:50%; translateX(-50%)`, `font-weight:900`, `font-size:clamp(1.2rem,2.5vw,1.8rem)`(1920px에서 28.8px), `letter-spacing:.2em`(5.76px), `text-shadow:0 0 25px currentColor`, `transition:opacity .1s`. `.on` 2.5s 유지 후 사라짐(재호출 시 타이머만 재시작). 글꼴 `Noto Sans KR`. 색 `#ffdd00`, 마성 `#d38aff`, 초월(`P.lv>1000`) 문구 "TRANSCEND!". 계산 박스 x858.8 y859 w202.4 h41(1920×1080).
- 웹 시점별 실측(headless 캡처, `E:/exoduser-wt/_out/pc-a20/web/lvup_info.json`): 토스트 opacity 1은 0~2.2s, 2.77s에 0. 라벨·VFX는 3.5s에 종료.

## 2. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeLevelUpOverlay.cs` | 오버레이(라벨·토스트·페이드), 공개 API 아래 |
| 신규 | `unity/Assets/Exoduser/Runtime/NativeLevelUpOverlay.Capture.cs` | `--unity-overlay-capture levelup <dir>` 검증 진입 |
| 신규 | `Resources/Data/levelup_web.json` | 웹 정의(타이밍·문구·색·스프라이트 좌표, 줄 번호) |
| 신규 | `Resources/Art/ui/overlay/levelup_label.png` | "Lv. "·숫자 0-9 × 금/마성의 웹 canvas 1x 렌더 크롭(웹 `Cinzel` 24px, `drawLabel` 외곽 방식 그대로, 생성 이미지 아님) |
| 신규 | `docs/engine/unity_patches/A20_nativegame_levelup.patch` | 9번째 patch(트리거 연결) |

## 3. 공개 API

```
var overlay=new NativeLevelUpOverlay();
overlay.Show(int newLevel, bool demonic=false);   // 레벨은 호출자가 넘긴 Unity 값
overlay.Draw(Vector2 playerScreenPx);              // OnGUI에서 매 프레임, 플레이어의 화면 픽셀 좌표(좌상단 원점)
overlay.Hide(); overlay.Active; overlay.Level;
overlay.ForcedAge                                   // 검증용: 설정하면 시계 대신 이 나이를 쓴다
```

시계는 `Time.unscaledTime`(웹은 게임 dt라 일시정지 중에는 멈춘다 — Unity는 멈추지 않는 차이, 아래 §6).

## 4. 초기 트리거 patch 이력 (`A20_nativegame_levelup.patch`, 2026-10-26)

- **Unity에 레벨업 이벤트(콜백)는 없다.** `Simulation.AddExperience`(Core/Simulation.cs:290-306)는 `levelled`를 지역변수로만 쓰고 이벤트를 내보내지 않는다. 대신 레벨은 실제 상태이므로 patch는 `Update`에서 `Simulation.Player.Level`이 직전 값보다 커졌는지 읽어 `levelUp.Show(level)`을 부른다(가짜 트리거 아님, 웹 호출 위치는 `addExp` 43164-43169).
- 연결 줄: 필드 `NativeLevelUpOverlay levelUp;int levelUpSeen;`, Awake에서 생성, `ResetRun`에서 `levelUp.Hide();levelUpSeen=Player.Level`, `Update`의 레벨 비교, `OnGUI`에서 알림 문구 뒤에 `levelUp.Draw(player 화면 픽셀)`(`view.WorldToScreenPoint`).
- 순서: 기존 6개(U04B→U08 NativeGame→U08 PauseMenu→U05→A07B NativeGame→A07B PauseMenu)→A13→A14→**A20**(9개) 순서대로 `git apply --check` 통과, 실제 적용 후 Win64 빌드 errors 0, 되돌린 뒤 NativeGame*·NativePauseMenu* 변경 0.
- 레벨업 효과음(`SFX.levelup`)·체력/스태미나/마나 20% 회복은 이 단위 범위 밖(회복은 Simulation이 이미 수행).

## 5. 2026-10-26 당시 미이식

- 빛기둥·링·불꽃 VFX(`level-up-vfx.js` 캔버스, Unity 재제작).
- 레벨업 효과음 연결, 마성 판정(`PASSIVES.pDemon>pHuman`)은 호출자가 `demonic`으로 넘겨야 함 — 패시브 상태가 Unity에 없어 patch는 항상 금색(`Show(level)`).
- 초월(1000 초과) 구간: Unity 시뮬레이션이 레벨 1000까지만 올리므로 "TRANSCEND!" 문구는 정의만 있고 호출 경로 없음.

## 6. 남은 차이

- 토스트 글자 굵기: 웹 Noto Sans KR 900 대비 Unity는 Noto Sans KR Bold(700 파일), 글로우는 방사형 텍스처 근사.
- 라벨은 1x 크롭이라 해상도 배율이 바뀌면 흐려진다(설계 좌표 1920×1080 기준). 숫자 사이 커닝은 글자별 advance 합.
- 일시정지 중에도 Unity 시계는 흐른다(웹은 멈춤).
- 웹은 플레이어가 화면 중앙보다 아래에 그려지는 경우가 있어(06a) 라벨 절대 위치는 플레이어 화면 좌표를 넘겨 받아 결정한다(Unity는 카메라가 플레이어를 따라가 중앙).

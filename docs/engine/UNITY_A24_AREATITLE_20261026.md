# Unity 구역 제목·지역 처치 표시 (분모 A24, 웹 `#areaTitle` + `#mmLvl`) — PC-A24 (2026-10-26)

기준: 사용자 확정 "UI는 일단 그대로 이식". 웹 기준 `G:/exoduser/game.html`(main 1770c2698). 구현: 단순작업2. 브랜치 `claude/unity-pc-overlays-20261026`(A22 `98ed00497` 위, Unity 6000.6.7f1). 커밋은 맥북 총괄 검수 뒤. 마스터 보드 A24의 두 부분을 한 단위로 처리: ① 구역 진입 제목 연출(`#areaTitle`), ② 오른쪽 위 목표 패널의 "지역 처치" 줄이 들어 있는 `#mmLvl`(레벨·경험치·경험치 바·지역 처치·악의).

## 1. 웹 근거

| 요소 | 코드·CSS | 이식 |
|---|---|---|
| 제목 마크업 | `#areaTitle > #areaTitleKr + #areaTitleEn` 2678 | 이식 |
| 제목 CSS | 333-338: 상단 18%(194.39px), 폭 760, `::before/::after` 선(폭 21%=159.594px, 높이 1px, `linear-gradient(90deg, transparent, rgba(164,147,115,.54))`, 불투명 .8, 오른쪽은 `scaleX(-1)`), KR 24.8px `Cinzel Decorative`(없는 글자는 Nanum Myeongjo)·자간 3.968px·`rgba(223,214,194,.9)`·`text-shadow 0 2px 6px #000`, EN 11.2px `Cinzel`·자간 3.584px·`rgba(168,153,127,.72)`·위 여백 5px, `filter: drop-shadow(0 5px 12px rgba(0,0,0,.9))` | 이식(필터는 근사) |
| 애니메이션 | 338-339 `hudAreaTitle 3.1s ease-in-out both`: 0% opacity 0·ty −15px·blur 5px → 13%·69% opacity 1·ty 0·blur 0 → 100% opacity 0·ty +7px·blur 2px (구간마다 ease-in-out) | 시간표 그대로 |
| 호출 | `_showHudAreaTitle(stage,st)` 60243: stage가 바뀔 때만 실행. KR `제{n}구역 · {name}`(영어 `AREA {n} · {name}`), EN `THE {NAME}`, 호출 위치는 HUD 느린 경로 60319 | 문구 표를 정의 JSON에, 호출은 patch |
| 구역 이름 표 | `STG[i].kr/n` 35개(썩은 숲 1~4구역, 벌레굴 1~6, 지옥의 겨울 1~4, 화염지대 1~7, 지옥 군단 1~5, 사도의 마굴 1~6, 지옥성 1~3) | `Data/areatitle_web.json` `names` 35행 |
| 목표 패널 | `#mmLvl` 마크업 2575-2586, CSS 372-379·1008, `#mmLvl::before`(top 3px, 좌우 12px, 190×1px, `linear-gradient(90deg, transparent, rgba(235,186,103,.64), transparent)`), 값 갱신 60319-60330(`지역 처치` = 현재 지역 처치/총량, 지역 없는 맵은 스테이지 전체) | 이식 |
| 패널 숫자 | 216×153.39px, 오른쪽 20px·위 16px, 안쪽 여백 12/14/13, 테두리 1px `rgba(156,122,75,.68)`, 배경 `linear-gradient(145deg, rgba(38,31,27,.96), rgba(13,14,17,.94) 46%, rgba(9,10,13,.93))`, 행 높이 24, 라벨 12.64px/12px 색 `#cbbd9f`, 값 색 `#eee4d4`·경험치 `#dfcfaa`·레벨 16px 700 `#f2e6cb`, 경험치 바 3px(채움 `linear-gradient(90deg, rgba(122,101,72,.55), rgba(196,171,124,.85))`), 구분선 `rgba(192,151,92,.48)`, 악의 값은 패딩 2px 6px | 계산 스타일 덤프(`web/panel_layout.json`)대로 |
| 값 변화 | `hudCountPulse .34s ease-out`(translateY 1→−1→0, opacity .5→1, 45%에 `#d8c49d`) | 이식(값이 바뀔 때) |

웹 정식 빌드 캡처: `E:/exoduser-wt/_out/pc-a24/web/`(`area_t0|60|150|300|403|1100|2140|2500|2900|3099.png` = Web Animations `currentTime` 고정, `area_layout.json`·`panel_layout.json` = 계산 스타일 덤프, `area_stg.json`, 패널 `panel_a.png`·`panel_b.png`). 서버는 전용 포트 3424, 끝난 뒤 종료.

## 2. 정의와 상태

| 구분 | 값 | 출처 |
|---|---|---|
| 정의(웹) | 구역 이름 표 35행, 문구 형식(ko/en), 키프레임·길이·지오메트리, 패널 라벨(ko/en), 펄스 시간, 제목용 글리프 atlas(Cinzel Decorative 24.8px 숫자·대문자·`·`·공백, Cinzel 11.2px 대문자·공백) | `Resources/Data/areatitle_web.json`, `Resources/Art/ui/area/area_atlas.png` |
| 상태(Unity 값) | 구역 번호 = 0(Unity는 1장 첫 구역만 있어 patch가 0을 넘김), 레벨·경험치·최대 경험치 = `Simulation.Player`, 처치 수 = `Simulation.Kills`, 악의 = `Simulation.Materials`, 영어 여부 = `lobby.Language` | patch |
| 미이식 | 지역별 처치 총량(Unity에는 지역 개념과 총 스폰 수가 없음 → "N / 미이식"), 구역 전환 이벤트(구역은 시작 한 번만), 챕터 전체 구역 수 표시 | "미이식" 문구 또는 호출 없음 |

## 3. 파일

| 구분 | 경로 |
|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeAreaTitle.cs`, `NativeAreaTitle.Capture.cs`, `NativeObjectivePanel.cs` |
| 신규 | `Resources/Data/areatitle_web.json`, `Resources/Art/ui/area/area_atlas.png`(웹 canvas 1x 렌더 크롭, 글리프 칸마다 클리핑) (+.meta) |
| 신규 | `docs/engine/unity_patches/A24_nativegame_areatitle.patch`(13번째, A23 다음) |
| 기존 파일 수정 | 없음(NativeGame.cs는 patch로만) |

## 4. 공개 API

```
var title=new NativeAreaTitle();      title.Show(int stageIndex, bool english=false);  title.Draw();  title.Hide();  title.Active;  title.ForcedAge
title.Sample(ageSec, out opacity, out ty, out blur);  title.KrText();  title.EnText();     // 시간표·문구(검증용 공개)
var panel=new NativeObjectivePanel(); panel.Draw(float hudWidth, new NativeObjectivePanel.Info{level, exp, maxExp, materials, areaKills?, areaTotal?, english});
panel.ForcedPulseAge                                                                       // 검증용
```

## 5. 트리거 patch (`A24_nativegame_areatitle.patch`, NativeGame.cs 6 hunk)

- 필드·생성·`ResetRun`에서 `areaTitle.Hide()`, `areaTitleShown=false`.
- `Update`: 로비 차단이 끝난 뒤 한 번 `areaTitle.Show(0, lobby.Language!="ko")`(웹 `_showHudAreaTitle`은 stage가 바뀔 때 HUD 느린 경로에서 부르며, **Unity에는 구역 전환 이벤트가 없고 구역도 0 하나라서 실행 시작 1회만 연결**). `--unity-*` 인자가 붙은 검증 픽스처에서는 띄우지 않는다(`--unity-world-3d` 제외) — 기존 스모크 캡처를 건드리지 않기 위해.
- `OnGUI`: 기존 임시 상태 패널(`StatusBackdrop` + "1장 · 썩은 숲"/"Lv. 경험치"/"처치 악의" 라벨 3줄)을 `objective.Draw(hudWidth, Info{…})`로 교체, 제목은 클리어 패널 그리기 뒤에서 `areaTitle.Draw()`.
- 순서: 기존 6개 → A13 → A14 → A20 → A21 → A22 → **A24**(12개) 순서대로 `git apply --check` 통과, 새 pristine 적용 결과가 작업본과 같음. 실제 적용해 Win64 빌드(6000.6.7f1) errors 0·error CS 0·warning CS 0, 되돌린 뒤 `NativeGame*`·`NativePauseMenu*` 변경 0.

## 6. 검증

- 캡처 `--unity-overlay-capture area <dir>`(`E:/exoduser-wt/_out/pc-a24/caps/`, `area-capture.json` passed, failures 0). 키프레임 샘플(opacity·translateY·blur) 10시점이 웹 계산 스타일(시점별 값)과 허용오차 내 일치(opacity ±.012, ty ±.2px, blur ±.1px): 예) 150ms 웹 .2885/−10.67/3.557 = Unity 같음. 문구 `제1구역 · 썩은 숲 1구역`·`THE ROTTEN FOREST`, 11번째 구역 `제11구역 · 지옥의 겨울 1구역`, 표 밖은 "미이식".
- 비교 이미지 `E:/exoduser-wt/_out/pc-a24/cmp/`: `area_t0|60|150|300|403|1100|2140|2500|2900|3099.jpg`(웹 | Unity), 1x 크롭 `area_crop1x_title.jpg`(t=1.1s)·`area_crop1x_title_t150.jpg`·`area_crop1x_title_t2500.jpg`, 패널 `panel_crop1x_a.jpg`(Lv1 0/15 0/32 1,000)·`panel_crop1x_b.jpg`(Lv15 1,234/2,000 7/32 12,345)·`panel_unity_real_1x.png`(실제 Unity 상태: "N / 미이식").
- 회귀(1회): inventory-oracle 892 checks / 0 failures, inventory-navigation 35/35.

## 7. 남은 차이

- 배경: 웹은 뒤의 게임 월드가 비치고, 캡처 모드의 Unity 배경은 검정(실제 게임에서는 카메라가 월드를 그린다).
- `blur()`·`drop-shadow()`는 IMGUI에 없어 글자를 둘러싼 오프셋 복사본으로 근사(연출 초반 블러 모양, 그림자 번짐이 웹과 약간 다름).
- 글자 두께: 브라우저 래스터화가 IMGUI보다 굵어 패널 글자는 0.4px 어긋난 2회 그리기로 보정(그래도 웹보다 약간 가늘다). 제목 한글은 Nanum Myeongjo Regular(웹과 같은 대체 글꼴).
- 패널의 "지역 처치" 값은 "N / 미이식"(웹 "0 / 32"), 웹 월드 요소(미니맵·타이머 `#stageClock`·SP 박스 등)는 이 단위 범위 밖.
- 패널 위의 `#hudCorner`(SP·전투력 박스), `#stageClock`, 구역 배너 `#regionBanner`는 미이식.
- 화면에서 사라지는 조건(웹 인벤토리 열림 시 `display:none`)은 Unity가 인벤토리 화면 자체를 따로 그리므로 동일 결과.

## 7. 누적 순서 재생성 (맥북 총괄, 2026-10-26)

- 이 단위는 overlays 브랜치(`98ed00497`, A22까지)에서 만들어졌고 patch가 "12번째"였으나, 같은 시각 A23 보스 바(`f9636b021`)가 12번 `A23_nativegame_bossbar.patch`로 먼저 인수됐다. 두 patch가 `NativeGame.cs`의 같은 줄 4곳(필드 선언·생성·`ResetRun`의 Hide·`OnGUI` Draw)을 고쳐 A23 뒤에 그대로 적용되지 않았다.
- `git merge-file`(기준 = patch 1~11 적용, 한쪽 = +A23, 다른쪽 = +A24 원본)로 합집합 해소 후 A23 적용 상태 기준으로 다시 만든 것이 현재 `A24_nativegame_areatitle.patch`(13번째)다. 해소 규칙: 필드·생성·Hide는 둘 다 유지, `OnGUI`는 구역 제목 Draw를 보스 바 Draw보다 먼저(웹 z-index `#areaTitle` 19 < `#bossBar` 22, `game.html` 333·387). A24 변경 줄은 원본과 같음(보스 바 토큰만 추가된 것 외 차이 0).
- 브랜치: 누적 대상 `claude/unity-pc-inventory-u04-20261026`(`f9636b021` 위)으로 옮겨 커밋. 위 §5의 "12개 순서" 검증은 원본 기준 기록이며, 13개 누적 적용 빌드는 아래 8절에 기록한다.

## 8. 13개 누적 적용 검증 (단순작업2, 2026-10-26, `E:/exoduser-wt/pc-unity-win` f9636b021)

| 단계 | 결과 |
|---|---|
| patch 13개 순서 apply (U04B → U08 nativegame → U08 pausemenu → U05 → A07B nativegame → A07B pausemenu → A13 → A14 → A20 → A21 → A22 → A23 → A24) | 전부 `git apply --check` + apply 통과 |
| Win64 빌드(6000.6.7f1, 미디어 재조립 뒤, `PortVerification.Build`) | errors 0, error CS 0, warning CS 0, receipt passed |
| `--unity-overlay-capture area` (창 5120,0 NOACTIVATE, 240초 제한) | 종료 코드 0(19초), `area-capture.json` passed, failures 0 (검사 15개 전부 PASS) |
| `--unity-overlay-capture boss` (같은 조건) | 종료 코드 0(8초), `bossbar-capture.json` passed, failures 0 (검사 12개 전부 PASS) |
| 역순 `git apply -R` 13개 | 전부 통과, 되돌린 뒤 `NativeGame*`·`NativePauseMenu*` 변경 0 |

산출물: `E:/exoduser-wt/_out/pc-a24/v13/`(`build/`, `build.log`, `receipt.json`, `caps_area/`, `caps_boss/`, 실행 스크립트 `run_area.ps1`·`run_boss.ps1`). A24 원본·untracked 파일은 건드리지 않았다.

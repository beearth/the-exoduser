# Unity 사망 화면 (분모 A21, 웹 `#death`) — PC-A21 (2026-10-26)

기준: 사용자 확정 "UI는 일단 그대로 이식". 웹 기준 `G:/exoduser/game.html`(main 1770c2698, 아래 줄 번호는 d5f32ff57과 같음). 구현: 단순작업2. 브랜치 `claude/unity-pc-overlays-20261026`(A20 `b287bc962` + `origin/claude/unity-pc-inventory-u04-20261026` `af86aa59c` merge `35e335e33`, Unity 6000.6.7f1). 커밋은 맥북 총괄 검수 뒤.

## 1. 웹 근거

| 요소 | 코드·CSS | 이식 |
|---|---|---|
| 표시 시점 | `die()`(43723-43757)는 쓰러짐 5초 카운트다운 → `_fallenResolve`(43851-43896)의 사망 분기가 `#death.on`을 켬 | 트리거는 patch(Hp ≤ 0) |
| `#death` | `position:fixed; inset:0; background:url(img/cin_remember_wide.png) center/cover; opacity 0→1, transition 2.5s ease-out`(646-647) | 이식(원본 PNG 바이트 그대로) |
| 빛 `::before` | 400→40px 방사형 `rgba(180,140,100,.08)`, 4s(648-649) | 이식(거의 보이지 않음) |
| 제목 `.dt` | 45.44px, ls `.14em`, `rgba(218,210,193,.94)`, 그림자, **`dp` 5s ease-in-out 무한 opacity .3↔.8**(657-658). 애니메이션이 페이지 로드부터 돌아 위상이 임의 | 이식(위상은 앱 시계, 테스트 훅 `PulseOffset`) |
| 부제 `.ds` | 19.52px, ls `.12em`, `rgba(198,184,158,.82)`(659) | 이식 |
| 정보 `#dInfo` | `💀 N 처치 \| 1장 — 썩은 숲 \| EXP -N \| 🔥 최대콤보 N`, 17.92px Cinzel+Nanum, ls .13em, `rgba(174,151,111,.82)`(660, 43870) | 이식(숫자는 호출자 값, EXP 손실은 Unity가 깎지 않아 `EXP 미이식`) |
| 버튼 `.retry` | `다시 일어서라`(16.8px, ls .14em), `.retry-lobby` `리플레이 보기`·`로비로 돌아가기`(13.12px)(661-663) | 이식, 호버 색(662) 포함 |
| 피해 로그 `#dDmgLog` | 오른쪽 24px, 세로 중앙, `-N 출처` 줄 + "맞아서 사망"(43871-43893) | 구조 이식, Unity에는 피해 로그가 없어 **"미이식"** |
| 펫 대사 `#deathPetDlg` | 두 포트레이트 720×480(`scale(1.5)`), 대사 상자 안 한 줄씩, opacity .25s, 10초마다 로테이션(43819-43848), 대사 표 `_DD_LINES` 28종(43759-43792) | 이식(표 전체를 정의 JSON으로) |
| 리플레이 화면 `#deathReplay` | 검정 바탕, "☠ 사망 리플레이"(25.6px, ls .4em, #cc4444), 시간(Courier 17.6px), 바(80% 폭, 4px)(649-656, 43648-43715) | **모양만**(`DrawReplayShape`), 녹화 데이터 없음 |

웹 시점별 실측(`E:/exoduser-wt/_out/pc-a21/web/death_info.json`, 실제 `_fallenResolve` 사망 분기 호출 후): `#death` opacity .40(0.72s) → .73(1.41s) → .92(1.98s) → 1(2.67s~), 펫 대사 opacity 1(0.72s~), 제목 opacity .30~.80 펄스, 대사 로테이션은 10.8s 시점에 교체.

## 2. 정의와 상태

| 구분 | 값 | 출처 |
|---|---|---|
| 정의(웹) | 제목·부제·버튼 문구·"보스 재도전"·"맞아서 사망"·정보 줄 문구·구역 이름 7개·타이밍·펫 대사 28종+풀 9종·atlas 좌표 | `Resources/Data/death_web.json`(줄 번호·추출 시각 기록) |
| 상태(Unity 값, 호출자가 넘김) | 처치 수 = `Simulation.Kills`, EXP 손실 = 없음(`expLoss=-1` → `EXP 미이식`), 사망 횟수(앱 시작 후 `NativeGame`이 센 값) | patch |
| 미이식 | EXP 손실(웹 43867의 `Experience`×30% 차감을 Unity가 하지 않으므로 숫자를 만들어 보여 주지 않음; 차감 로직이 생기면 실제 차감 값을 `expLoss`로 넘긴다), 최대 콤보(Unity엔 현재 콤보만 있음), 피해 로그, 구역 번호(Unity엔 1장만 있어 patch가 0 고정), 보스 판정(`dd_boss*`)·마지막 피해 출처(`dd_rare/dd_trash/dd_dot/dd_proj/dd_grab`)·최대 콤보(`dd_highcombo`) 기반 펫 대사 선택 | "미이식" 문구 또는 선택 분기 생략 |

펫 대사 선택은 `_ddPickEvent`(43795-43818)에서 Unity 상태로 판단 가능한 분기만 이식: 사망 1회 이하 → `dd_first`, 10회 이상 → `dd_repeat10`, 5회 이상 → `dd_repeat5`, 그 밖에 → `dd_ch<구역>`. 이후 10초마다 풀 9종을 섞어 돌린다.

## 3. 파일

| 구분 | 경로 |
|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeDeathOverlay.cs`, `NativeDeathOverlay.Capture.cs` |
| 신규 | `Resources/Data/death_web.json`, `Resources/Art/ui/death/{cin_remember_wide, crow_portrait, cat_portrait, death_atlas}.png`(앞 3개는 웹 원본 바이트 그대로 `img/cin_remember_wide.png`, `img/crow/portrait.png`, `img/cat_pet/portrait.png`; atlas는 웹 canvas 1x 렌더 크롭: Cinzel 숫자·라틴, 💀 🔥, ☠) (+.meta) |
| 신규 | `docs/engine/unity_patches/A21_nativegame_death.patch`(10번째) |
| 기존 파일 수정 | 없음 |

## 4. 공개 API

```
var death=new NativeDeathOverlay();
death.OnRetry=…; death.OnLobby=…;                      // 로비 연결은 미이식(null이면 버튼은 모양만)
death.Show(new NativeDeathOverlay.Info{kills, chapter, expLoss(-1=미이식), maxCombo(-1=미이식), deaths, retryBoss, damageLog(null=미이식)});
death.Draw();  death.Hide();  death.Active;
death.DrawReplayShape(float progress01, float remainingSeconds);   // 모양만
death.ForcedAge, death.PulseOffset                                 // 검증용
```

## 5. 트리거 patch (`A21_nativegame_death.patch`, NativeGame.cs 6 hunk)

- 필드 `death/deathCount/deathShown`, Awake에서 생성·`OnRetry=RetryFromDeath`, `ResetRun`에서 `death.Hide()`.
- `Update`: `Player.Hp<=0`이 되면 한 번 `death.Show(Info{kills=Simulation.Kills, chapter=0, expLoss=-1, maxCombo=-1, deaths=++deathCount, damageLog=null})`. Hp가 다시 양수가 되면 숨김. 기존 스모크(`pauseSmoke/hudSmoke/inventorySmoke`)에서는 작동하지 않게 막아 기존 검증을 건드리지 않는다.
- `OnGUI`: 사망 중에는 일시정지 메뉴 대신 사망 화면을 그린다(`death.Active&&p.Hp<=0`). 키보드(`pauseMenu.PollKeys`)는 그대로.
- `RetryFromDeath`: 일시정지 메뉴의 다시 시작 명령과 같은 처리(`ResetRun();…;Running=true`). "다시 일어서라" 버튼이 그 동작.
- 쓰러짐 5초 카운트다운 구간은 Unity에 없다(Hp 0이면 바로 사망 화면). 웹 `die()`의 쓰러짐 연출은 이번 범위 밖.
- 순서: 기존 6개 → A13 → A14 → A20 → **A21**(10개) 순서대로 `git apply --check` 통과, 실제 적용해 Win64 빌드(Unity 6000.6.7f1) errors 0·경고 0, 되돌린 뒤 `NativeGame*`·`NativePauseMenu*` 변경 0.

## 6. 미이식·남은 차이

- 미이식: 사망 리플레이 재생(모양만), 쓰러짐 연출, 로비로 돌아가기 동작, 최대 콤보·피해 로그·구역·보스 상태 기반 표시, 웹이 사망 시 적용하는 EXP 손실 차감과 그 표시(정보 줄은 `EXP 미이식`).
- 글꼴: 제목·버튼은 웹 Nanum Myeongjo 700(진짜 굵기) 대신 Regular를 합성 굵게 → 제목 폭 약 7% 넓음. 펫 대사는 웹 Malgun Gothic 700 대신 Noto Sans KR Bold, 줄바꿈 위치가 달라질 수 있음(웹 "수 있 / 어," 대신 Unity "수 있어, / 포기하지 마!").
- 포트레이트의 `drop-shadow` 필터는 생략.
- 페이드 중 웹은 뒤의 게임 월드가 비치는데, 캡처 모드의 Unity 배경은 검정(실제 게임에서는 카메라가 월드를 그린다).
- 정보 줄은 Unity에서 "EXP 미이식"·"최대콤보 미이식"이라 웹보다 길다.

## 7. 검수 반영 (2026-10-26)

맥북 총괄 검수: 일어나지 않는 EXP 손실을 숫자로 보이면 가짜 상태 → `Info.expLoss=-1`이면 `EXP 미이식`, patch도 `expLoss=-1`. 10개 순서 `git apply --check` 재통과(11번째 A22 포함 11개도 통과), 정보 줄 캡처 1장 재촬영.


## 2026-10-31 R3 부활 대기와 사망 제목 계측

|항목|변경|
|---|---|
|부활 대기|NativeRevive의중앙panel은cx−140/cy−56/폭280/높이136, 보조문구는cx−140/cy+50/폭280/높이22. 기존카운트56px/확률/해제·실패·저장규칙불변. 실제R2의3s와쓰러짐교차를해소하는UI수정후보|
|사망제목·펫대사외곽선|실제그림은유지하고PaintDeathGlyph로같은본문과검정outline의호출source를맞춤. death-black-outline프로필은실제후행본문/동일clip·치수·반경4.2×safeScale/알파≤1.001이증명될때만스타일페인트로분리. 다른본문충돌·미선언/유계밖그림자검출유지|
|검수|그림자56회귀PASS. 실제R3 Player·동일DLL M1·5해상도글자/컴포넌트/1x전에는완료아님. [현재전범위계약](UNITY_UI_ULTRAWIDE_20261031.md)|

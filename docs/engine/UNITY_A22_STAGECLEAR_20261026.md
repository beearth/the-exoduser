# Unity 스테이지 클리어 결과 화면 (분모 A22, 웹 `#stageClear`/`#clearResult`) — PC-A22 (2026-10-26)

기준: 사용자 확정 "UI는 일단 그대로 이식". 웹 기준 `G:/exoduser/game.html`(main 1770c2698, 아래 줄 번호). 구현: 단순작업2. 브랜치 `claude/unity-pc-overlays-20261026`(A21 위, Unity 6000.6.7f1). 커밋은 맥북 총괄 검수 뒤.

## 1. 웹 근거

| 요소 | 코드·CSS | 이식 |
|---|---|---|
| 마크업 | `#stageClear`(제목 `#clearTitle`, `#clearTitleEn`, 부제 `#clearSub`, 결과 `#clearResult`, 통계 `#clearStats`, 버튼 `#nextBtn`) 3203-3210 | 이식 |
| 스타일 | `#stageClear` 하단 80px 고정, 폭 368, `opacity .5s` 페이드(356-364) | 이식(앵커·페이드) |
| 표시 흐름 | 구역 클리어 41925-42035: 통계 줄 + 뱃지(41946-41988), 소지옥 보스 분기(41985-41996), 데모 최종 구역 분기(~42000-42003) | 문구 3종을 정의 JSON에, 구성은 `Kind{Zone,HellEscape,DemoEnd}` |
| 결과 블록 | `_showClearResult` 42059-42130(랭크 크레스트 + 클리어 타임/점수 + 2열 항목 + 베스트 줄) | 이식 |
| 공식 | `_clearParTime`=round(90+총스폰×2.5), `_clearParScore`=총스폰×10+3500, 점수=처치×10+지역×500+보스 1000+max(0,기준−클리어)×10+무사망 500+무피격 500+최대콤보×5−사망×300(0 이하는 0), 랭크=시간비(≤.7 →3, ≤1 →2, ≤1.5 →1)+점수(≥기준 →2, ≥60% →1)+무사망 1 → ≥6 S, ≥4 A, ≥3 B, ≥2 C, 아니면 D | 그대로 `Compute`/`Rank`(정의값은 JSON) |
| 랭크 색 | S #e3c27a, A #a9c8a4, B #9db8cc, C #c2b6a9, D #8d7c65 | 이식 |

레이아웃 수치(1920×1080 DOM 덤프 `E:/exoduser-wt/_out/pc-a22/web/clear_layout.json`)와 각 시점 캡처(`web/clear_t0|150|300|600|1500.png`)는 **정식 빌드**(`build-target.js`를 `'full'`로 바꿔 Playwright로 캡처)에서 얻었다. 데모 기준 캡처(`web-refs-20261026/08_stage_clear.png`)는 데모 빌드라 문구만 다르다.

## 2. 문구 — 정식판과 데모판

| 구분 | 제목 / 영문 | 부제 | 버튼 | 근거 |
|---|---|---|---|---|
| 정식판 구역 클리어(기본값) | 구역 클리어! / ZONE CLEARED | 정비 후 다음으로 이동하세요 | 다음 구역으로 ▶ | game.html `_DEMO_MODE=false` 분기 + 정식 빌드 Playwright 캡처에서 확인 |
| 정식판 소지옥 보스 | `{소지옥 이름} 탈출!`(자물쇠 글리프) / HELL ESCAPED | 다음 소지옥이 기다리고 있다... | 다음 소지옥으로 ▶ | game.html 41985-41996 |
| 데모 최종 구역(빌드 분기 정의, A26 범위) | 구역 클리어! / ZONE CLEARED | 썩은 숲을 정복했습니다. | 데모 종료 | 웹 기준 캡처 08 |

정식판 버튼 문구는 "확인되지 않음"이 아니라 위 표와 같이 코드·정식 빌드 캡처로 확인했다. 어느 쪽 문구를 쓸지는 `Kind`로 고르며, 빌드 분기 자체(데모/정식 스위치)는 A26 범위.

## 3. 정의와 상태

| 구분 | 값 | 출처 |
|---|---|---|
| 정의(웹) | 문구 3종·라벨·통계 낱말·뱃지 12종·공식 상수·타이밍(페이드 0.5s)·atlas 좌표 | `Resources/Data/stageclear_web.json`(줄 번호 기록) |
| 상태(Unity 값) | 처치 수 = `Simulation.Kills`, 클리어 타임 = `Simulation.TickCount/60` | 캡처 `unity_clear_real.png` |
| 미이식(Unity에 상태 없음) | 총 스폰 수, 지역 정화 수, 보스 처치, 사망/크리/패링/물약, 총 데미지·받은 데미지·최대한방, 사슬기동·이동 거리, 최대콤보(현재 콤보만 있음), 기록(베스트·신기록) | "미이식" 문구 표시. 이 값들에 의존하는 항목(점수·랭크 글자·타임어택·시간 보너스 등)도 "미이식" |

뱃지는 Unity 상태로 증명되는 조건만 표시한다(없으면 줄에서 생략). 예: 실제 상태 캡처에서 `스피드런`만 나온다(클리어 타임이 있고 ≤180s).

## 4. 파일

| 구분 | 경로 |
|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeStageClearOverlay.cs`, `NativeStageClearOverlay.Capture.cs` |
| 신규 | `Resources/Data/stageclear_web.json`, `Resources/Art/ui/clear/clear_atlas.png`(웹 canvas 1x 렌더 크롭: Cinzel 숫자·라틴, ▶ ✓ ✗, 자물쇠 SVG) (+.meta) |
| 신규 | `docs/engine/unity_patches/A22_nativegame_stageclear.patch`(11번째) |
| 기존 파일 수정 | 없음(NativeGame.cs는 patch로만) |

## 5. 공개 API

```
var clear=new NativeStageClearOverlay();
clear.OnNext=…;                                         // 다음 구역으로 / 데모 종료 버튼 콜백(null이면 모양만)
clear.Show(new NativeStageClearOverlay.Input{kind, hellIndex, stageKills?, totalSpawned?, clearSeconds?, regionsCleared?, bossKilled?, deaths?, dmgTaken?, comboMax?, dmgDealt?, crits?, parries?, potions?, maxHit?, dashCount?, dashMeters?, walkMeters?, bestSeconds?, bestScore?, bestRank});   // null = 미이식
clear.Draw();  clear.Hide();  clear.Active;
clear.ParSeconds(total), clear.ParScore(total), clear.Rank(clearSec, parSec, score, parScore, deaths);
clear.ForcedAge                                          // 검증용
```

## 6. 트리거 patch (`A22_nativegame_stageclear.patch`, 11번째, NativeGame.cs 4 hunk)

**이벤트 없음.** Unity에는 스테이지 클리어·보스 처치·구역 이탈 이벤트가 없다(`Simulation`/`NativeGame` 확인: 보스·클리어·지역 상태 없음, 1장만 존재). 그래서 patch는 연결 줄(`Show` 호출)을 넣지 않고, 아래 배선만 넣는다. 가짜 트리거를 만들지 않는다.

- 필드 `NativeStageClearOverlay stageClear;`, Awake에서 생성.
- `ResetRun`에서 `stageClear.Hide()`.
- `OnGUI`에서 `if(stageClear.Active)stageClear.Draw();`(사망 화면 그리기 앞).
- 이벤트가 생기면 그 지점에서 `stageClear.Show(Input{…})` 한 줄을 더하면 된다.
- 순서: 기존 6개 → A13 → A14 → A20 → A21 → **A22**(11개) 순서대로 `git apply --check` 통과. 실제 적용해 Win64 빌드(6000.6.7f1) errors 0·error CS 0·warning CS 0. 되돌린 뒤 `NativeGame*`·`NativePauseMenu*`·`NativeInventory*` 변경 0.

## 7. 검증

- 캡처: `--unity-overlay-capture clear <dir>`(`E:/exoduser-wt/_out/pc-a22/caps/`, receipt `stageclear-capture.json` passed, failures 0). 프레임: 시점 0/.15/.3/.6/1.5s(정식판 값), 데모 종료판, 소지옥 탈출판, 실제 Unity 상태판.
- 공식 확인: 168스폰 → 기준 510초, 기준 점수 5,180, 웹 정식 캡처 값(5처치·4초·보스 1,000)으로 점수 7,110·랭크 S, 데모 값(16처치·7초)으로 7,190·S. 웹과 일치.
- 비교 이미지 `E:/exoduser-wt/_out/pc-a22/cmp/`: `clear_t0|150|300|600|1500.jpg`, `clear_demo.jpg`, 1x 크롭 `clear_crop1x_panel|result|stats_btn|demo.jpg`("왼쪽 웹 / 오른쪽 Unity (A22 스테이지 클리어) · 수치 차이=무작위 롤").
- 회귀(1회): inventory-oracle 892 checks / 0 failures, inventory-navigation 35/35.

## 8. 남은 차이

- 배경: 웹은 뒤의 게임 월드가 비치고, 캡처 모드의 Unity 배경은 검정(실제 게임에서는 카메라가 월드를 그린다).
- 글꼴: 제목 Nanum Myeongjo 700 대신 Regular를 합성 굵게. 버튼은 Noto Sans KR SemiBold(웹 600).
- 통계 줄 "베스트": 웹은 `--:--`(저장된 기록 없음), Unity는 기록 상태가 없어 "미이식". 데모 캡처의 "신기록!" 태그도 기록 상태가 없어 표시하지 않는다.
- 실제 상태 프레임은 총 스폰 수가 없어 점수·랭크 글자·타임어택이 전부 "미이식".
- 웹이 `G._clearRecords`로 합치는 기록 저장, 소지옥 이름 목록 외의 구역 이탈 흐름, 클리어 사운드·화면 전환은 이번 범위 밖.

## 맥북 총괄 검수 (2026-10-26)

- 인수. 1x 결과 블록·전체 배치가 웹 정식판(`#clearResult`)과 같다(`docs/engine/unity_pc_win_refs/clear_a22_t1500.jpg`).
- 비교 캡처의 점수 7,110·랭크 S·보스 처치 1,000 등은 **웹 정식 값(5처치·4초)을 넣은 공식 검증용 테스트 값**이다. 게임 상태 표시가 아니다. 실제 게임에서는 Unity에 클리어·보스·구역 이탈 이벤트가 없어 patch 11(A22)이 `Show`를 호출하지 않는다("이벤트 없음") — 이벤트가 생기면 그때 연결.
- 정식 빌드 문구 확인 방법: Playwright `ctx.route('**/build-target.js')`로 응답만 바꿔 정식(full) 캡처. 원본 `G:/exoduser/build-target.js`는 수정하지 않았다(git 변경 0 확인).

## 2026-10-29 900p 글자 크기 보정

결과 패널은 1920×1080 설계 좌표를 유지하되 `s=min(1,Screen.width/1280,Screen.height/900)`으로 그린다. 가로 중앙, 세로 이동 `Screen.height-1080*s`이며 버튼 하단은 실제 화면 하단에서 `80*s` 위다. 1600×900에서 제목21px·결과폭368px을 유지해 웹 CSS 고정 크기와 맞춘다. 점수·랭크·통계·전환 수명은 그대로다. 검수와 영수증은 RM-1 슬라이스 문서의 2026-10-29 절과 unity-visual REPORT를 참조한다.

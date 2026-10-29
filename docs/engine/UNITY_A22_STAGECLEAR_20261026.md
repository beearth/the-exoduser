# Unity 스테이지 클리어 결과 화면 (분모 A22, 웹 `#stageClear`/`#clearResult`) — PC-A22 (2026-10-26)

> §1~8과 맥북 검수는 2026-10-26 초기 이식 이력이다. 당시 “이벤트 없음/미이식”은 현재 일반 실행 상태가 아니다. 현행 계약은 맨 아래 2026-10-30 절을 따른다.

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

## 2026-10-30 클리어 표시 재작업 후보 — 현행 계약

작업ID `unity-stageclear-presentation-rework-20261030T002030KST`. 출발점 `a2f5058652a91b10ca1357f4a9c39db99a0cbadf`. 이번은 private 제작 후보이며 unity/main 통합·바로가기 교체 권한은 없다. 원본 웹 `game.html` blob `1439fadd79e75034ce1e5286a3b885fc67e69c6f`와 기존 1600×900 캡처를 재사용했다. 새 웹 QA·기통과 M1·Core oracle을 반복하지 않는다.

### 원인과 증거 범위

| 관측 | 실제 원인·범위 | 처리 |
|---|---|---|
| 상단 LV/SP와 시간 중첩 | 일반 `OnGUI`가 HUD/타이머·레벨업·완료 결과를 함께 그림. `StageFlowPump`는 실제 완료 이벤트에 SP 세계문자를 추가. 기존 M1은 가속 처치/이동으로 최근 LV가 출구 근처에 남음 | 완료 활성 중 결과를 최우선으로 그림. 일시적 전투 HUD/LV/세계문자는 그 프레임에서 겹쳐 그리지 않음. 게임 중 표시·Core 수명 불변 |
| 패널 밑 희미한 중복 통계와 미이식 | 일반 `BuildStats`가 처치/시간을 다시 그리고 미지원 값을 내부 문구로 채움. QA에만 생긴 문구가 아님 | 일반 결과는 측정된 값만 한 번. 초기 공식/누락상태 재현은 명시적 `--unity-ui-diagnostics`에서만 유지 |
| 버튼 표시/포인터 불일치 | 900p 보정 그림과 이전 1920×1080 포인터 계산이 다름. 기존 1600×900 버튼 좌상단 내부 점(691,777)이 입력 밖 | `ButtonScreenRect`를 렌더·포인터가 공유 |

기존 기준은 `ntfs-20261029/accepted-m1/caps/13-stage-clear.png`, `boss-text-20261029/integration-m1-20261030/caps/13-stage-clear.png`. 이들은 기존 가속 M1의 실제 완료 이벤트 프레임이다. 모든 자연 플레이에 같은 상단 중첩이 지속된다는 증거는 아니다. 초기 `--unity-overlay-capture clear`는 명시적 주입 전용으로 일반 실행과 구분하며, 과거 영수증은 수정하지 않는다.

### 실제 데이터와 지원 경계

| 표시 | 현행 입력 | 누락 시 |
|---|---|---|
| 클리어 시간 | `Stage.BossClearSeconds` → 분:초 | 항목 없음 |
| 처치 / 총 스폰 | `Stage.StageKills / TotalSpawned` | 없는 분모·항목은 생성하지 않음 |
| SP 보상 | 완료 이벤트를 처리한 Tick 직전/직후 `Player.StatPoints` 차이. 현재 Core 완료 보상 +10은 그대로 | 보상 없고 보유량만 있으면 보유 SP로 구분 |
| 지역 정화 | `Simulation.RegionClearedCount()` | 항목 없음 |
| 물약 / 사망 | `PotionState.PotionsUsed / deathCount` | 측정된 0은 표시, null은 생략 |
| 점수·등급·기록·추가 통계 | 초기 웹 공식은 보존. 피해/최대콤보 등 필수 수집이 없어 일반 실행 점수·등급은 미지원 | 0·S·부분 합계·가짜 베스트로 채우지 않음. 구현 상태는 문서·명시적 진단에만 남김 |
| 다음 행동 | 기존 `StageClearNext`의 `SaveCombatNow → 로비` 유지. 일반 문구는 실제 행동인 ‘로비로 돌아가기’, 데모 최종은 ‘데모 종료’ | 다음 구역 1-2 미이식은 문서에 보존. 일반 전환 Toast의 내부 설명은 진단에서만 표시 |

`NativeStageClearPresentation`은 저장 스키마가 아닌 읽기 전용 모델·배치·중복 클릭 차단이다. Core/점수공식/보상/경제/저장 스키마는 변경하지 않았다. 표시만을 위해 실제 보상·저장·이동 기능을 제거하지 않는다. 버튼은 활성 후 0.5초부터 사용, 한 번만 콜백. Enter/Space는 화면이 열린 뒤 키가 놓인 것을 확인한다.

### 배치·언어 계약

| 항목 | 값 |
|---|---|
| 기본 패널 | 폭560, 기본 높이 계산 시작272. 실제 보상 행+78, 완전한 점수·등급 있을 때만+56, 알려진 세부 통계당+30. 버튼 전22/높이56/하단28. 실제 보상+세부3행 일반 결과는 높이546 |
| 화면 적응 | `s=min(1,(W-32)/560,(H-32)/높이)`, 중앙 배치. 버튼 x28/폭504. 그림과 입력이 같은 실제 좌표 사용 |
| 시선 순서 | 영문 보조12 → 제목34 → 부제16 → 시간44/처치34 → 실제 SP34 → 세부16/18 → 실제 행동20 |
| 장문 | 높이에 맞춰 최소12까지 글자 크기 조정·줄바꿈. 작은 창에서 전체 패널을 같은 비율로 축소. 실제 글꼴 `CalcHeight` 넘침과 글리프를 별도 캡처 감사 |
| 언어 | 기존 지원29코드, 원본 웹 사전14개 키를 `stageclear_labels.json`에 연결. 원문 없는30항목은 원본 영문/영문 폴백. 새 독립 번역 완료 주장 없음 |
| 글꼴 | 기존 Nanum/Cinzel 및 지역별 Noto 재사용. 아랍어는 기존 IMGUI RTL 제약으로 명시적 영문 폴백, 아랍어 조판 완료 아님 |

### 후보 검사·실행 구분

순수 표시 모델·경계·공유 입력 좌표·실측0/null 구분·보상·부분점수 금지·중복버튼 검사 **30/30 통과**, `unity/Tools/stageclear-presentation-tests`. 증거 `I:/EXODUSER-Storage/unity-visual/stageclear-20261030/표시-데이터-버튼검사.json`.

새 표적 캡처 `--unity-stageclear-presentation-capture`는 격리 신규 캐릭터의 기존 진입 API 후 QA 직접 아레나 진입·강제 처치/출구 이동으로 **실제 Core 완료 이벤트와 SP 변화**를 확인한다. 자연 M1/손조작 E2E가 아니다. 1600×900/960×540, 29언어, 생산 버튼의 실제 격리 저장/로비 이동을 확인한다. 별도 `qa-snapshot`은 이전 M1의 확인된 137/168·88초·SP10 등을 화면에 복사하며 현재 시뮬레이션 결과가 아니다. 새 후보 빌드·실화면·제작자 1x 판정은 아래 최종 영수증에서만 확정한다. 전체 품질 RETOUCH와 다른 보스/맵 잔여는 유지한다.

- 빌드 준비 이력: 최초 Unity 실행 `25297d24`는 `Labels` 타입/메서드 이름 충돌(CS0102)로 실패. 메서드를 `CurrentLabels`로 변경했다. 기존 Unity 응답파일의 제한 C# 컴파일에서 신규 `GetInstanceID` 사용의 CS0619를 확인해 캐시 키를 `(Font,크기,굵기)` 타입 참조로 수정했다. 두 원인은 각각 1회이며 같은 원인 2회 반복하지 않았다. 두 번째 제한 컴파일 exit0, 기존 외부 경고15건 보존. Player/시각 통과로 간주하지 않는다.

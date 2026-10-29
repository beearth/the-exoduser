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
| 화면 적응 | 현재 재질 후보는 `s=min(1,(W-32)/592,(H-32)/(높이+32))`, 중앙 배치. 본문 둘레16px의 원화 외곽까지 화면여백16 보장. 버튼 x28/폭504·그림/입력 공유는 유지 |
| 시선 순서 | 영문 보조12 → 제목34 → 부제16 → 시간44/처치34 → 실제 SP34 → 세부16/18 → 실제 행동20 |
| 장문 | 높이에 맞춰 최소12까지 글자 크기 조정·줄바꿈. 작은 창에서 전체 패널을 같은 비율로 축소. 실제 글꼴 `CalcHeight` 넘침과 글리프를 별도 캡처 감사 |
| 언어 | 기존 지원29코드, 원본 웹 사전14개 키를 `stageclear_labels.json`에 연결. 원문 없는30항목은 원본 영문/영문 폴백. 새 독립 번역 완료 주장 없음 |
| 글꼴 | 기존 Nanum/Cinzel 및 지역별 Noto 재사용. 아랍어는 기존 IMGUI RTL 제약으로 명시적 영문 폴백, 아랍어 조판 완료 아님 |

### 후보 검사·실행 구분

순수 표시 모델·경계·공유 입력 좌표·실측0/null 구분·보상·부분점수 금지·중복버튼 검사 **30/30 통과**, `unity/Tools/stageclear-presentation-tests`. 증거 `I:/EXODUSER-Storage/unity-visual/stageclear-20261030/표시-데이터-버튼검사.json`.

새 표적 캡처 `--unity-stageclear-presentation-capture`는 격리 신규 캐릭터의 기존 진입 API 후 QA 직접 아레나 진입·강제 처치/출구 이동으로 **실제 Core 완료 이벤트와 SP 변화**를 확인한다. 자연 M1/손조작 E2E가 아니다. 1600×900/960×540, 29언어, 생산 버튼의 실제 격리 저장/로비 이동을 확인한다. 별도 `qa-snapshot`은 이전 M1의 확인된 137/168·88초·SP10 등을 화면에 복사하며 현재 시뮬레이션 결과가 아니다. 새 후보 빌드·실화면·제작자 1x 판정은 아래 최종 영수증에서만 확정한다. 전체 품질 RETOUCH와 다른 보스/맵 잔여는 유지한다.

- 빌드 준비 이력: 최초 Unity 실행 `25297d24`는 `Labels` 타입/메서드 이름 충돌(CS0102)로 실패. 메서드를 `CurrentLabels`로 변경했다. 기존 Unity 응답파일의 제한 C# 컴파일에서 신규 `GetInstanceID` 사용의 CS0619를 확인해 캐시 키를 `(Font,크기,굵기)` 타입 참조로 수정했다. 두 원인은 각각 1회이며 같은 원인 2회 반복하지 않았다. 두 번째 제한 컴파일 exit0, 기존 외부 경고15건 보존. Player/시각 통과로 간주하지 않는다.

- 첫 표적 실행 `dcd7e99c`: 실행기 종료0/창0/잔여0/USER_SAVE0이나 내부 검사는 137중5실패. 실제 이벤트/보상/데이터3건과 첫2프레임 경계 실패. 쓰러짐 화면을 직접 확인했으며 성공 증거로 채택하지 않았다. 아레나 입장이 Iframes를90으로 초기화한 뒤 하네스가 생존보조를 갱신하지 않아 긴 QA 처치 중 사망 상태에 머물렀다. 하네스는 각 QA Tick 전에 HP/쉴드/무적을 갱신하도록 수정하고 이벤트 실패 시 즉시 종료·원상태를 기록한다. Core 사망/피해/완료 규칙과 검사 기준은 불변. 기존 빈 입력 언어 프레임은 실제 데이터 검증으로 세지 않는다.

- 두 번째 후보 빌드 `aa346818` 오류0, 표적 Player `37e90023` 내부138/138·실제1/168처치/16초/+10SP·저장revision1→2·로비이동·창0/잔여0/USER_SAVE0. 1x에서 영문 보조제목과 큰 제목의 동일 `ZONE CLEARED` 중복을 발견해 같은 문구일 때 보조제목을 생략한다. 명시적 진단 인자도 독립 overlay 생성 경로에 기본 전달한다. 최종 소스는 별도 빌드/표적 캡처로 식별하며 두 번째 후보 성공을 새 Runtime에 소급하지 않는다.

### 최종 제작 후보·실화면 영수증 (2026-10-30)

| 구분 | 정확한 근거 |
|---|---|
| 제품 후보/실제 빌드 입력 | `2376c58584281c4fa74352da75f45311bddbd466`, Unity tree `02a7af43c255640ce5cf547e54b33956946762bd`. 이후는 관련 docs만 추가하며 최종 private SHA는 아래 영수증에 분리 |
| Win64 빌드 | `d8684b11`, Unity6000.6.7f1·6000.6 계열 컴파일 오류0·빌드 영수증 errors0. 출력 `stageclear-20261030/candidate3-build/EXODUSER-Unity.exe`. 실행기 errorLogs=2는 BuildReport errors와 별도 집계. 로그의 라이선스 토큰 갱신 메시지 등을 보존하며 컴파일/빌드 실패로 합치지 않음 |
| 실제 Player | `143c1383`, 위 정확 exe·D3D11/RX9070XT·무창/무음/격리저장·정상종료0·창0·잔여0·USER_SAVE0 |
| 새 표시/행동 검사 | 순수 표시30/30(연결 helper 동일 byte), 새 최종 Runtime 표적170/170, 프레임32개(실제 이벤트1600/960 2 +29언어 +별도 확인값복사1). 넘침0/누락글리프0/화면밖버튼0/일반 미이식문구0/동일영문제목중복0 |
| 실제 결과 데이터 | QA 직접 진입·생존보조·강제 처치 후 실제 출구 Core 이벤트: 1/168처치,16초,보상+10SP/보유10SP,지역0/물약0/사망0. 0은 실제 측정값이다. 점수/등급은 미지원 그대로 |
| 저장·다음 행동 | 생산 `RequestNext → StageClearNext`가 격리 캐릭터 저장 revision1→2·파일존재·결과닫기·로비이동 실행. 중복요청 거부. 실제 마우스 손조작/OS 키보드 E2E 검사는 아님 |
| 동일 표시값 비교 | `qa-snapshot`에 기존 검증 M1 확인값137/168·88초·SP10·지역4/물약0/사망0을 복사. 현재 시뮬레이션 데이터나 같은 사건 전후로 부르지 않음 |
| 실제 버튼/크기 | 1600×900: 패널(520,177,560,546), 버튼(548,639,504,56). 960×540: 패널 여백16, 버튼(245.538,445.846,468.923,52.103). 모두 화면 안. 640×360은 순수 배치 검사만, 실제 캡처 아님 |
| 런타임 식별 | Runtime SHA256 `89440bab113c92835d802fd791d6506942490d147abda7f916ef677b63529efc` / Core `e6d89a07efae6882c3062ac6b9d9fe1d8acdb00340d3a671ba175282a2ab65c5`. launcher SHA9806abde...는 이전과 같아 단독 후보 증거로 쓰지 않음 |
| Core·기존 증거 | Core tree `23ae5783080d45cb40804b4b59b1e9b8f7811244`·DLL byte 불변. 기존 oracle 재사용이며 새 실행0. 기통과 빌드/M1/웹 QA 반복0. **새 Runtime의 전체 M1 미실행**, 이전23/23 소급0 |

제작자가 최종 1600×900 원본·1x 패널, 960×540 한국어·영문·덴마크어 긴 버튼·그리스어 긴 제목·일본어 장문을 직접 열었다. 제목→시간/처치→SP보상→측정 통계→저장·로비 버튼의 순서, 정렬/여백, 기존 HUD/LV/SP/타이머 중첩 제거와 내부 구현 문구/희미한 중복줄 제거를 확인했다. 원본웹·두 기존Unity 전과 같은 해상도로 나란히 비교했다. 29언어 경계·글리프 감사는 자동 검사이며 모든 번역 의미를 사람이 검수했다는 뜻은 아니다. 영어 폴백30항목·아랍어 RTL 제약은 남는다.

**제작자 1x 판정: 클리어 표시 국소 개선을 확인한 제출 후보 / 전체 품질 RETOUCH, root 독립 검수 대기.** 미지원 점수·등급·기록 수집, 다음구역1-2, 손조작/장시간/자연 클리어 M1의 새 증거는 미완료/미검증으로 유지한다. 보스 리마스터·문자 중요도 계층 추가 다듬기·외곽 둥치/지면 접합은 별도이며 이번에 변경0. 전체6항목/AAA/보스아트 PASS0.

| 검수 파일 | 경로 (`I:/EXODUSER-Storage/unity-visual/stageclear-20261030/` 기준) |
|---|---|
| 최종 실제 원본 | `candidate3-caps/event-result-1600-ko.png`, `event-result-960-ko.png`, `locale-960-*.png` |
| 전후 원본 크기 | `최종_전후_실제이벤트_1600.png`, `최종_전후_같은표시값_1600.png`, `최종_전후_이전accepted_1600.png`, `최종_원본웹_현재후보_1600.png` (좌우 각1600×900, 사건/조건 차이를 표제에 표시) |
| 1x | `최종_1x_실제결과패널.png`, `최종_1x_확인값복사패널.png` |
| 데이터·실행·보존 | `candidate3-caps/stageclear-presentation-review.json`, `candidate3-build-receipt.json`, `시도-실패이력.json`, `자동임포트-최종보존복구.json`, `후보-제출영수증.json` |

Unity자동임포트450파일은 I에 보관·SHA 확인 후 승인 입력 byte로 보존했다. 보호된 guard만 WORK에 남기며 INDEX는 비운다. oldI/MP4원본·자동메타/구 실행본/사용자 세이브/과거 실패·7공백 예외를 보존한다. 전체 diff-check PASS로 꾸미지 않으며 이번 정확12파일의 diff 검사와 구분한다. **private 후보 제출만**, unity/main push·바로가기 교체·다른 큐 인수·자동 사용자 앱 실행·새 팀/작업본/writer·비용/삭제/배포·CTO_STATE 쓰기0. 이번 한 건 제출 후 대기한다.

## 2026-10-30 지정 통합 게이트 인수 — 클리어 표시 RETOUCH

중앙 CTO가 후보 `5f2996dccdd7d5b4dea732ea71d224db1970447a`의 소스·최종 표적170검사·143c1383·실제1600/960/긴번역1x를 독립 인수하고 기존 동일 NTFS 담당을 이번 한 건 unity-integrator로 지정했다. 이전 제작후보의 ‘전체 M1 미실행/독립검수대기/통합권한없음’은 제출 당시 이력이며, 이번 게이트는 아래로 갱신한다.

| 경계 | 이번 확인 |
|---|---|
| 제품 입력 | 실제 빌드입력 `2376c58584281c4fa74352da75f45311bddbd466`와 후보5f2996dcc의 Unity tree `02a7af43c255640ce5cf547e54b33956946762bd` 동일. Runtime `89440bab113c92835d802fd791d6506942490d147abda7f916ef677b63529efc`, Core `e6d89a07efae6882c3062ac6b9d9fe1d8acdb00340d3a671ba175282a2ab65c5` 실제 파일 SHA 대조. launcher9806해시만으로 새 후보를 증명하지 않음 |
| 최초 전체 M1 | **47961226,23/23**. 정확 `I:/EXODUSER-Storage/unity-visual/stageclear-20261030/candidate3-build/EXODUSER-Unity.exe`의 변경 Runtime 최초 전체M1을 안전 실행기로 1회. D3D11/RX9070XT·무창/무음/격리저장·정상종료0·창0·잔여0·USER_SAVE0. 기존23/23 소급 아님 |
| 단계·장면 | 출입/연습종료·이동·전투·회피/QE·스킬·지역/아레나·보스·클리어·저장/이어하기·캡처32장 pause없음 등23단계 통과. 새13-stage-clear는 실제M1완료137/168·88초·지역4·SP10을 직접 열어 확인. Simulation.Tick/API 가속 하네스이며 손조작E2E·전영상 자연재생은 아님 |
| 원격·소유 | fetch 후 expected unity/main `a2f5058652a91b10ca1357f4a9c39db99a0cbadf` 유지, 후보조상/정확12파일·INDEX비어있음/WORK보호guard만 확인. 이번 제품+필요검수docs만 정상 비강제 fast-forward 대상. 타 큐/다른 후보 포함0 |
| 실행 전 안전 | 16:25:40Z Unity/UPM/Player0·잠금없음·큐/티켓0·커밋여유22.73GiB·G/E NTFS·E여유1362734583808바이트. 프로젝트/Library G, DOTNET/UPM E, 출력I |
| 반복·보존 | 새빌드/기통과표적QA·번역/30표시검사/Coreoracle 반복0. 기존 제작법/조건별 컴파일·첫QA5실패/이전후보·7공백예외/oldI/guard/MP4/구실행본/세이브 보존. root 수신검증의 failed키 혼동은 실제 **failures=0,170검사**로 정정했으며 제품실패/카운터증가 아님 |

**root 독립 판정: 중복/미이식 표시·버튼좌표 개선은 기술 RETOUCH 인수.** 패널 재질/완성도·30영문폴백·점수/등급/기록 수집 미구현은 남긴다. 아랍어RTL 영문폴백·다음1-2·장시간/손조작/Mac 실행은 미완료/미검증이며 보스 전체리마스터·문자계층·외곽접합 잔여도 유지한다. 전체6항목/보스아트/AAA PASS0·신규FAIL아트채택0. WORK_QUALITY§1.1의 제작법·가장이른실물판정·동일실패2회/HOLD 규칙을 유지하며 이번은 새 제작/재설계가 아니다.

기존 일반 Unity 바로가기의 연결 대상은 위 candidate3-build와 `-force-d3d11 --remodel3d`이다. 현재값이 기존 boss-text candidate2 연결과 일치할 때만 고유 변경전백업을 만들고 연결한다. 미리보기/accepted-build/기존boss-text/old unity-latest·사용자창/세이브는 보존하며 자동 사용자 앱 실행0. **최종 source 원격SHA·네속성·Managed/백업/미리보기 해시 readback은 같은 폴더의 `통합-최종영수증.json`과 `통합-최종연결확인.json`에서 분리 확정한다.** M1 단계 근거는 `통합-새M1-단계영수증.json`, 실제 전체프레임은 `integration-m1-20261030/caps/`. 이 한 건 후 대기하며 새 팀/작업본/writer·비용/삭제·OS/권한/신뢰·외부배포/Steam/SetLive·서버재시작·CTO_STATE쓰기0.

## 2026-10-30 재질·프레임 마감 제작 기획 — WORK_QUALITY §1.1

이번은 c122746b9 이후 같은 private 작업본의 제작후보 한 건이며 unity/main/바로가기 교체 권한은 없다. 시간→처치→실제SP→저장·로비 행동과 데이터/경제/저장/기존다국어 계약을 유지한다.

| 기획 항목 | 이번 실물·방법·중단 기준 |
|---|---|
| 직접 본 기준 | 기존 `Resources/Art/ui/forge/window_base.png`(980×1056)의 바깥 금속 모서리/마모 테, `ui/inventory/iron_480.png`(480×480)의 어두운 미세 재질을 원본과 모서리 크롭으로 직접 열었다. 원화 SHA/임포트/guard는 I의 `stageclear-material-20261030/원화-입력보존.json`에 기록 |
| 현재 차이·경험 | candidate3의 평면 갈색 그라데이션/일자 테는 재질·용접/마모·모서리 마감이 부족하다. 완료정보의 세로 시선 순서와 명료한 숫자/로비 행동은 유지하고 원화의 물성을 좁은 프레임과 조용한 본문에 연결 |
| 제작법 | forge의 기사/중앙문양/기능칸 내용은 쓰지 않고 바깥 모서리와 얇은 테만 UV 분리. 모서리는 균일 축소, 직선 테는 한 구간을 crop-to-fit하여 반복띠/방향별 늘어짐을 피함. 본문은 iron 단일 cover UV(반복0/가로세로 같은 배율), 버튼은 얇은 기존 금속 테와 같은 재질의 분리된 행동면 |
| 가장 이른 판정 | 먼저 1600 전체/실제1x 크기의 모서리-직선 접합·본문/숫자·버튼 재사용 실물 합성을 확인. 이 사전실물은 새 Player 증거가 아니며 통과 후에만 native 연결/후보빌드. 이후 같은 값137/168·88초·SP10인 candidate3 전/새후와1600/960 비교 |
| 탈락·재작업 | 늘어진 모서리·끼어든 기사/문양/기능칸·반복띠·검은 사각패치/테 접합단절·본문가독성 저하·버튼 잘림/입력불일치 중 핵심이 있으면 그 방법 수정. 같은방법2후보실패/HOLD 유지. 적합원화가 없으면 도형/색 교체로 완료를 꾸미지 않고 부족입력만 보고 |
| 범위·비용·게이트 | NativeStageClearOverlay/필요최소UV·경계 helper/직접검사·docs만. 원본이미지byte/다른창/기존실행본/세이브 불변. 새이미지생성·비용0. 기존성공검사 반복0, 새Runtime빌드·필요표시/입력·언어경계·격리세이브만 새 증거로 분리. 전체RETOUCH·패널완성독립검수대기 |

### 사전 실물 판정과 현재 재질 후보 계약

첫 사전 원화 합성에서 모서리의 불투명 검은44px 사각 여백과 본문 입자 경쟁을 확인해 인수하지 않았다. 같은 색만 바꾼 확장 대신 **원화의 모서리 외곽을 2px행 UV 클립**으로 바꿨다. 두 번째 사전1x에서는 사각 여백 없이 금속 장식/테가 접합되고 조용한 본문/버튼에서 기존 숫자를 읽을 수 있어 native 연결 단계로 진행한다. 사전 PNG는 기존캡처문자와 원화UV의 오프라인 실물 합성이며 새 Player·자연클리어 증거가 아니다. 둘 다 `stageclear-material-20261030/사전*`에 보존했다.

| 항목 | 정확한 현재 후보 |
|---|---|
| 원화 | forge980×1056 SHA fbdb39a36b6e9c09a783387c6738296a8d360f609a674d929f1dbdcf444cf44c / iron480×480 SHA351213ee873fd70e61750821e12a6846a0bd0f2f5bd53fe08ad2a1266c65ce8a. 이미지·meta byte 불변 |
| 본문 외곽 | 논리본문560×546, 원화 외곽은 x/y-16·폭592·높이578. 56px 원화 네 모서리를 동일44/56배율로 표시. 밝은 금속 외곽만 2px행의 source span으로 클립하여 불투명 사각배경 제외. 원화 그림/alpha/Importer 수정0 |
| 테 | forge 상단y9..19/하단y1032..1042/좌x6..15/우x965..975. 방향별같은44/56배율, 필요한길이만한번UVcrop. 반복tile0·기사/원형문양 샘플0 |
| 본문/버튼 | iron한장씩 중앙cover UV·가로세로 같은배율, 반복0. 본문색곱.45/버튼.65, 버튼hover×1.2. 버튼은 빈 안쪽프레임(263,372,687,579)의10px마모테만1:1 crop/9-slice, 칸 내용/전체기능창 늘여붙임0 |
| 표시·입력 | 시간/처치/SP/데이터/버튼논리좌표·폰트/문구·키/중복차단·콜백 유지. 새16px외곽을 포함한화면적응만조정해960×540의버튼높이49.218px. UVplan은높이변화때만계산·재사용. 원화로드/규격실패는기존평면fallback을보여주지만재질검수는실패처리 |
| 검사 | 새UV/화면경계 전용3해상도(1600×900/960×540/640×360), 총1775개patch불변식검사 통과. 최초빈plan에서실패를확인한뒤구현. 640은기하검사만. 기존30/170/M1/번역전체/oracle를재실행하지않음 |
| 새 표적 캡처 | `--unity-stageclear-material-capture`+격리저장+boss-direct0. 실제아레나렌더에정지한QA표시, 기존M1확인값137/168·88초·SP10·지역4 주입. 1600/960한국어·960 en/el/da/ja/ms/ar의새프레임/본문/버튼경계만검사. 리뷰진입은세이브차단, USER_SAVE는실행기전후대조. 새Core/전체M1/자연완료/손조작E2E 아님 |

새제한컴파일은오류0(기존외부경고15유지). .NET 최초run은지정출력과실행경로가달라검사시작전실패했고기존build+DLL직접실행으로수정했다. 그뒤빈plan의의도된실패→구현후통과로구분하며제품실패카운터로바꾸지않는다. 최종새Runtime/1x실화면판정은실행후영수증에서만확정한다.

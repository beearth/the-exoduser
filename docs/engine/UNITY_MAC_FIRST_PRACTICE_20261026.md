# Unity 첫 이동·좌클릭 실습 — 2026-10-26

2026-10-29 후속: ARM64 Settings QA 앱의 실제 OS 입력으로 이동부터 사슬 이동까지 **1~9단계 완료**, 10단계 방향+Space 구르기 0/5에서 입력 도구 제한으로 HOLD. 우클릭 5/5를 막던 웹/Unity 마우스 버튼 번호 불일치를 수정했다. 11~12단계와 일반 1-1 몹·드롭은 미검증. [버튼 대응표·빌드·실입력 증거](UNITY_MAC_PRACTICE_MOUSE_BRIDGE_20261029.md).

상태: ROOT 실제 Player·직접입력·새 패널 인수 완료. 새 범위 모델34검사와 scripted runtime5검사 PASS. 전체 전투12·자원8·시스템7 실습 또는 배지 완료가 아니다.

## 원본과 범위

기존 readonly 인수본 `character-source-current/tutorial-source/parry-lesson.js`의 SHA256은 `95fff33fdaef534cf9cf89e72c2cdf0fa165988b188c9a57ffa22d9b5b079464`, actual PC `game.html` SHA256은 `d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5`다. 재수집·서버 접근 없이 사용한다. `Resources/Data/first_practice.json`은 source KO/EN11쌍(차징 안내3쌍 포함)과 수치/해시 원장이다. UI는 현재 언어를 읽어 문구를 고르며 웹 storage를 읽거나 쓰지 않는다. 힌트의 JS escape는 decode한 runtime 문자열로 추출했으며 실제 newline 존재/literal backslash+n 부재도 모델검사한다.

| 원본 조건 / 위치 | native 접점 / 성공 근거 |
|---|---|
| `tick` step−3, 방향입력 중 실제 이동120px | 정상 FixedUpdate의 충돌 후 Player 좌표 차이를 `FirstPracticeFlow.ObserveMovement`에 전달. 버튼/입력만 있거나 벽에 막혀 좌표가 같으면0. WASD/방향키 지원 |
| movement 성공 뒤90tick | Flow MovementSuccess에서90 tick 뒤 Attack. 입력만으로 다음 단계 완료 불가 |
| `spawnAttackEnemies` source229~246 | 실제 `SpawnNormalEnemy` 사용. 동시 최대3, 반경120, source48후보/각도/처치수 offset, 서로40px 이상. 기존 Map.CanMove(radius24)/LineOfSight 통과 위치만 입장. source hp=mhp1/atk0/spd0, shield/poise 등 나머지 필드 보존 |
| `hurtEnemy` source649~680 | 이 arena에 등록된 동일 actor 참조에만 source lesson branch 적용: 유효한 실제 명중 뒤 hp0/Alive=false. 기존 일반 shield/damage/보상 공식은 일반 actor에 그대로 유지 |
| left10kill + fullcharge kill | 실제 Tick 안 HitArc/UpdateKiProjectiles 피해 직후 immutable event(EnemyId/AttackKind/Step/ChargeTier/Killed/FromTick). Flow 등록 lesson id와 실제죽음/중복여부 검사.10kill와 step3/tier3 kill1회를 모두 만족해야 AttackDone |
| 3단 차징120tick | 기존 KiSlash의 charge tier 계산/충전·해제·투사체 충돌을 그대로 사용. 충전만·무처치 발사·tier2 kill은 차징 kill 조건을 통과하지 못함 |
| source tick505 자원/holdmeter | 해당 arena 매 tick HP/shield=원래 값, MP/ST=max, iframe0/KB0 유지. source hold문구·tier=floor(ticks/40)·meter=ticks/120 표시. 실제 kill count는 cap하지 않고 표시만min10 |
| 다음 단계−1 우클릭 | 실제 메커닉 미이식이므로 다음 단계를 성공으로 처리하지 않음. 지원 첫2조건 완료 안내와 ‘1-1 전투로 계속’ 제공. 배지 지급0 |

## Core 관측·lesson 분기

`Simulation.Tick`은 기존 본문을 try/finally로 감싸 tick 실행 여부만 기록한다. 원래 인수된 계산·피해 호출 순서·RNG·Feedback queue를 변경하지 않는다. `HitArc`와 `KiSlash.UpdateKiProjectiles`가 피해 직후 별도 관측 event를 발행한다. Ki projectile은 생성 당시 실제 Tick 안이었는지와 charge tier를 내부 필드에 보존한다. 외부 `HurtEnemy`는 event가 없고, 외부 `SpawnKiSlash`는 이후 Tick 명중해도 FromTick=false이므로 수료에 사용할 수 없다.

source는 lesson 적 처치에서 일반 보상을 지급하지 않는다. `RegisterFirstPracticeActor`는 같은 Simulation.Enemies의 살아 있는 actor 참조만 받는다. 해당 actor만 `ApplyEnemyDamage` 초입에서 source 직접kill을 수행하고, `KillEnemy`는 Alive=false 뒤 즉시 반환한다. EXP·level·악의·loot·potion·combo·일반kill counter·보상RNG 모두0이며 shield필드는 그대로다. 일반 actor는 이 분기를 타지 않는다. 새 전투수치/피해공식/밸런스/Q/E 설계는 없다.

## 원래 run 보존·종료

`NativePracticeFlow`는 입장 준비가 끝난 정상 startup 진입 후 시작하며 legacy smoke의 direct entry 계약은 유지한다. 현재 장비가 반영된 Config를 JSON으로 별도 복사하고 원본과 같은 시작좌표의 transient `FirstPracticeSession.Arena`를 만든다. 기본 LMB를 source처럼 kiSlash로 선택하고 연습 dummy의 AI는 정지시킨다. 원래 Simulation 객체 전체를 `Original`로 보관하므로 원래5적/Player/Config/proj/loot/자원/clock/진행/난수상태/콜백은 변하지 않는다. 일부 필드만 복사해 RNG/보상 상태가 누락되는 snapshot이 아니다.

Config는 primitive/string 필드뿐이며 JSON deep copy와 Session의 동일참조 거부로 공유 변이를 막는다. arena만 EnemyAiEnabled=false라 native atk0→최소1 피해/poise/KB 경로 자체가 실행되지 않는다. iframe0·접촉거리에서900tick 무피해/무밀림 모델검사로 확인했다. 원래 run의 EnemyAiEnabled 값은 보존된다.

원본 `assets/ui/tutorial/parry-plaque-v1.png`는 기존 ROOT checkout의 동일 파일에서 native `Resources/Art/ui/tutorial/parry-plaque-v1.png`로 동일 byte 이식했다.1024×1536, SHA256 `302bb96f5f43004133afe9d8e3658d78bfa166e75994b58f65a0589110c0772d`. 실제 GUI.DrawTexture 배경으로 사용한다. 패널은 균등1080좌표에서 right24/top150/372×650, accepted HUD 위쪽/오른쪽에 배치한다. 새 생성/유료 art는 없다.

연습 중 인벤/스킬 열기는 source action 허용 범위에 맞춰 차단하여 원래 Inventory 변이를 막는다. 기존 ESC pause/focus·HUD 슬롯 입력 계산은 보존한다. 완료 후 계속 또는 skip이면 연습 event 구독과 actor 목록을 해제하고 원래 Simulation 참조를 복원한다. lesson view/impact/audio를 정리하고 HUD를 원래 상태로 갱신한다. 모든 키/마우스가 해제되기 전까지 기존 frontend release fence로 원래 world 입력을 막는다. Restart는 transient session을 폐기한 뒤 기존 ResetRun을 수행한다. 로비 복귀도 session을 종료한다.

원본 start/finish의 arena arrays·player/좌표/자원/스킬 복원 목적은 전체 객체 격리로 지킨다. source 전체27실습·실패탄/포즈/resetPose의 미이식 Q/E/Space fields를 발명하지 않는다. 이번 skip은 해당 입장 session 종료이며 영속 optout/기존 웹skip key·배지·캐릭터 save 변경은 없다. 원본 global storage namespace를 Native에 쓰지 않는다.

## 새 범위 검수

새 `Tools/first-practice/FirstPracticeTests.csproj`를 Unity6000.6.7f1 bundled .NET8.0.318로 실행,34 PASS. 무입력/무이동/119대120/90tick, 실제 CanMove=false120tick/열린충돌 Tick의120px, 외부HurtEnemy·외부SpawnKiSlash 미인정, 무처치 fullcharge/tier2 kill 미수료, 실제 Tick10kill+fullcharge 수료, duplicate/비lesson actor 제외, source shield보존·보상0, 정지dummy900tick, refill/Config독립, skip/finish 원래 객체그래프/자원/clock/RNG 보존을 확인했다. 원장11문구/threshold/newline도 확인한다. 영수증은 `_out/UNITY-MAC-LOBBY-20261025/first-practice-model-20261026.json`이다.

정확 실행명령(저장소 루트):

```sh
/Applications/Unity/Hub/Editor/6000.6.7f1/Unity.app/Contents/Resources/Scripting/DotNetSdk/dotnet run --project unity/Tools/first-practice/FirstPracticeTests.csproj --verbosity quiet -p:NuGetAudit=false -- unity/Assets/Exoduser/Resources/Data/first_practice.json /Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/first-practice-model-20261026.json
```

## ROOT 전용 새 Player fixture

`--unity-first-practice-review -output <freshdir>`는 일반 roster 대신 `<freshdir>/character-roster-v1`만 지정하고 직접 정상게임 준비→BeginFirstPractice까지만 진입한다. intro 상태에서 CUA 조작 가능하며 자동이동/자동완료가 없다. `first-practice-review.json`에 direct preparation이며 startup 자연통과 검사가 아님을 기록한다.

`--unity-first-practice-capture -output <freshdir>`는 같은 직접준비 후 실제 FixedUpdate와 공유하는 HandleFirstPracticeTick에 scripted 방향/공격 입력을 보낸다. 실제 충돌·피해·차징·처치 경로는 그대로이고 OS입력이 아니다. intro/move/attack-progress/charge-full/tier3-complete/continue-restored720p6장과 progress KO1080p/EN720p2장을 기록한 뒤 KO로 복귀한다. receipt는 원래 Simulation/Player/Config/적참조·clock·HP·악의·RNG state 복원과 보상0, 실제10kill+fullcharge를 기록한다. 기존 startup 전체 재생/suite는 수행하지 않는다. 정상 product 진입은 `EnterFromLobby`의 prepared+비legacy 조건으로 별도 배선되어 있다.

담당 제출은 순수모델 검사까지였으며, 아래 ROOT 인수에서 실제 Player·직접입력·표현 검수를 추가했다. 기존 suite·HUD/생성/네메시아/4컷안내 전체 재검사와 서버 실행은 하지 않았다.


## ROOT 인수 및 이번 단위 마감 — 2026-10-26

사용 가능한 새 누적 실행본은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-FIRST-PRACTICE-20261026/build-d0ea9d1/EXODUSER-Unity.app`다. 제품 source `d0ea9d1b656603952571ee63270e434571d9a1d5`를 정상 원격 ref에서 확인한 뒤 기존 격리 QA 프로젝트에 변경 Assets를 복사했다. non-meta/non-generated-scene334파일682135609B의 SHA256 불일치0, 추가 runtime C#0. Unity6000.6.7f1/ARM64/빌드 오류0/1971655502B다.

새 capture fixture5/5 PASS: 실제 충돌 이동120px, 90tick 전환, 실제11처치 중3단 차징 검기 처치로 두 조건 완료, 일반 보상0, 원래 Simulation 전체 참조/Player/Config/적/HP526/악의1000/clock/RNG1085968971 복원. 모델34개를 다시 돌리거나 이전 프런트 검사군을 반복하지 않았다. capture는 직접 준비 후 scripted input이며 정상 startup 자연통과나 OS입력 증거가 아니다.

ROOT는 별도 `manual-d0ea9d1` namespace에서 CUA 실제 D1100ms와 좌클릭/3800ms 유지·해제로 두 체크 완료를 확인했다. 이어 ‘1-1 전투로 계속’ 실제 클릭으로 실습 패널이 닫히고 ESC 일시정지로 돌아오는 것을 확인했다. 이 직접입력 증거는 대화 CUA 화면이며 로컬 PNG로 저장했다고 주장하지 않는다. fixture 초기 review JSON의 passed 기본값은 최종 결과가 아니고, 최종 관측은 [인수 영수증](UNITY_MAC_FIRST_PRACTICE_ACCEPTANCE_20261026.json)에 구별했다.

새8PNG에서 plaque·KO720/1080 및 EN720 문구·체크·충전3/3 게이지·완료 안내를 인수했다. VISUAL VERDICT: PASS (이번 실습 패널 범위). 기존 HUD의 LMB/RMB/Shift/Ctrl/Space는 폭이 빽빽하지만 각 clip content 사이8logical px(720p5.33px) 간격이 유지되어 확정된 겹침은 없었다. 슬롯수·입력·기존 표시를 변경하지 않았다. 기존 AVFoundation 색상 fallback 및 Mono 종료 경고는 남으며 무경고/전체 아트 완성은 주장하지 않는다.

검수 앱은 모두 종료했다. 원래 사용자 앱 PID38141과 저장은 보존했고, 사용자 결과 제시용 기존 완성본9dd 정상 앱 PID48476을 열어 정상 로비를 앞에 띄웠다. 일반 목록의 기존1/5 캐릭터를 읽었으며 생성·삭제·덮어쓰기0. 새 실습이 기존 실행창에 자동 반영되었다고 주장하지 않는다.

## 다음 이식 목록과 게임 업데이트 인계

이번 마감 기준은 누적 실행본/오류0, 첫 두 조건의 실제 입력 완료, 원래 상태 복원, GitHub 복구점, 미완료 목록 구분이다. 모두 충족했다. 이 프런트+첫 실습 단위를 확정하고 사용자 우선순위의 게임 업데이트로 넘긴다. 이 인수 때문에 다음 모든 이식을 먼저 끝내야 한다고 범위를 늘리지 않는다.

미이식은 별도 유지한다: 나머지 전투 실습(우클릭·덫·Q/E·사슬/돌진·Space·분노·회복영역 실제 메커닉 포함), 자원8·시스템7, 전체 배지·영속 skip, 전투 저장과 전체 본편 내용·보이스/VFX의 native 동등성. 원본 본편·PC 게임 업데이트와 이 부분 이식의 완성도를 구분한다. 이번 마감 뒤 새 모션·맵·VFX·전체27실습 확장은 시작하지 않았다.

## A18 PC 이식 진행 — 2026-10-28 (claude/unity-pc-a18-20261027)

웹 원본은 `origin/main`의 `parry-lesson.js`(방향키+Space 단계 = "구르기", 일반 `G:\exoduser` 작업본은 구버전 "전격이동"). 순서는 웹과 같다: −3 이동 → −2 좌클릭 → −1 우클릭 → 8 가시덫 → 0..7 패링·홀딩·사슬·구르기·분노.

| 단계 | 상태 | 성공 근거 |
|---|---|---|
| −3 이동 120px | 이식 | 충돌 후 실제 좌표 차이 |
| −2 좌클릭 10처치 + 3단 차징 | 이식 | Tick 안 kiSlash/weapon 처치 이벤트 |
| −1 우클릭 5처치 | 이식(이번) | 악의구(fireball) 폭발 Tick 안 처치 이벤트. 실습 적이 ShQuery에 보이도록 `lessonActors` 인자 추가(석궁은 기존 오라클대로 제외 유지) |
| 8 가시덫 | 이식(이번) | 가시덫 구역 DOT 틱 처치 이벤트 10 + 설치 후 방향키로 구역 중심 120px 이탈. 적 10마리: hp=max(1,가시덫피해)×(5+n)×.5, 쉴드 동량, 속도 1.6(웹 flow-field 대신 직선 추적+축 슬라이드), 가시덫 슬로(`_spikeSlow`) 반영 |
| 0 마법탄 패링 · 1 물리탄 패링 | 이식(3차) | 실습 적(8슬롯 280px, 링 60틱 → 속도 3 탄). 비행·패링 판정·반사(청콩)·유도·폭발은 Core(`ParryReflect.Resolve`/`PayReflectParry`/`ReflectHoming`/`ReflectContact`)를 그대로 호출하고 레슨은 오입력·접촉 미스(웹 레슨 분기)와 60틱 재시도만 붙인다. 완료 = 패링된 탄이 쏜 적을 실제로 처치 |
| 2 Q 홀딩 · 3 E 홀딩 | 이식(3차) | 홀드 시작 때 5발 볼리(800px 부채꼴, 마법 5종 / 물리 5종 플래그), 해제 상태 전이에서 충전 판정(Q 120틱·반경≥300, E kiGather 180·차징 배율 3) 뒤 3발 이상 한 번에 패링. 틀리면 60틱 재시도 |
| 4 Shift 사슬 이동 | 이식(2차) | 1·2·3단을 순서대로, 각 단계 `HarpTier`가 목표와 같고 `DashActive` 뒤 실제 좌표 ≥1px 이동해야 완료. 단계 사이 기동력·스태미나 보충, 틀린 단/막힘 피드백 |
| 5 방향키+Space 구르기 | 이식(2차) | Space를 방향키와 함께 눌러 `RollActive`가 실제로 켜질 때만 1회, 놓은 뒤 다시 눌러야 다음, 5회 |
| 6 패링·분노 축적 | 이식(3차) | 10발 볼리를 스스로 반복 발사, 하나라도 패링되고 분노 100 도달 시 완료(분노는 `ParryRewards` 지급 그대로) |
| 7 분노 발동 | 이식(2차) | 6단계에서 쌓은 분노 사용(100 미만이면 100까지 보충), 24마리 두 겹 링, 150틱 SPACE 슬롯 포커스(패널 숨김·화살표), 그 뒤 방향키 뗀 채 Space만으로 `giantSlam` 분노 소비(`RageCastHook`) ≥100 |

- 패널: 웹 `#parryLesson` 1920×1080 실측 좌표(400×1048, right 56, top 16). 틀=웹 실제 패널의 투명 스틸(`Art/ui/tutorial/lesson_base.png`), 12행 체크리스트·현재 행 붉은 강조·힌트·홀드 막대·건너뛰기·진행 헤어라인. 상단 우측 목표 패널은 실습 중 숨긴다.
- 입력 게이팅(웹 `allowKey`): 좌클릭=무기, 우클릭=E 마법(beam), 가시덫=슬롯 1. 그 외 Q/E/Shift/구르기 입력은 아레나에 전달되지 않는다.
- 수정: `fireball` 효과음이 `NativeFeedbackAudio` 허용 목록에 없어 우클릭 마법 시전이 예외를 던졌다 → 웹 `sfx/magic/fireball.mp3` 추가.
- 검증: `Tools/first-practice` 69 PASS(우클릭·가시덫 진짜 Tick, 사슬·구르기·분노 흐름), 실제 플레이어 스크립트 캡처(이동→좌클릭→우클릭→가시덫→사슬→구르기→분노 폭발, 보상 0, 원본 복원).
- 수정(2차): 연습 틱이 `SetPlayerCombatInput`/`SetRollInput`을 FixedUpdate와 합쳐 틱당 3번 불러 직전 입력 상태가 항상 false가 되어 Shift를 뗀 순간·구르기 키 엣지가 사라졌다 → 연습 중에는 연습 틱이 틱당 1회만 입력을 설정한다.
- 12단계 전부 이식(`FirstPracticeFlow.Ported` 전부 true, 완료 문구는 웹 "전투 준비 완료"). 패링 단계 입력은 틱당 1회 설정(엣지 보존).
- 카메라: 연습 시작 위치가 1-1 남쪽 맵 가장자리라 화면 아래가 검게 보였다(맵 경계 바깥). 원인은 Unity 카메라에 웹 `_clampCamToMap`(game.html 12023)이 없던 것 — `NativeGame.CameraClamp.cs`로 추가(2026-10-28, 브랜치 camclamp). 웹과 같은 식: 보이는 반폭/반높이=VW,VH/(2·줌), 맵이 더 작으면 가운데, 흔들림은 clamp 뒤에 더함. 보스 아레나는 `BossArenaLayout` 128×108×40px. 1-1(8000×8000) 시작·남·서·동·북·SW·NE 7곳에서 카메라 좌표가 웹과 같고(예: 북 540, 남 7460, 서 960, 동 7040) 화면 밖 영역이 보이지 않는다. `--unity-cam-capture -output <dir>`로 재현.

- 3차 검증: `Tools/first-practice` 88 PASS(Core 반사 API 실호출 — E 쳐내기 반사→쏜 적 처치, Q는 물리탄 미반사, 홀드·볼리·분노 규칙). 실제 플레이어 스크립트 캡처 이동→좌→우→가시덫→패링 마법/물리→홀딩 Q/E→사슬→구르기→분노 패링→분노 폭발 전 구간 PASS(보상 0, 원본 복원). 캡처 시 포커스를 잃으면 일시정지 메뉴가 덮이므로 `PracticeShot`이 메뉴를 닫고 포커스를 맞춘 뒤 찍는다.

# Unity 첫 이동·좌클릭 실습 — 2026-10-26

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

# Unity 원본 기반 기본 무기·기검참 코어 — 2026-10-24

> 2026-10-31 A2 표현 경로 보충: 기존 `SourceMap(MapData)` 생성자를 보존하고 `SourceMap(MapData, Func<float,float,bool> additionalBlocked)`를 추가했다. 선택 경계는 `Blocked` 입구에서 검사하며 비A2는 null로 기존 질의를 보존한다. A2만 승인 다리 아래 수로를 `A2ForestLayout.BlockedCore`로 보행·시야·투사체에 같이 적용하며, 원본 JSON과 Core 전투 코드는 변경하지 않는다. 경계 수치·회귀·실제 화면 상태는 `UNITY_KEYSHOT_A2_20261030.md`를 따른다. 수치 회귀 통과를 시각·Player 검수 통과로 해석하지 않는다.

사용자 최신 지시에 따라 Godot를 보존하고 Unity도 비교 시험한다. 최종 엔진 선택은 미확정이다. 이 문서는 Unity용 순수 C# 코어의 실제 구현 범위와 검증을 기록한다. Godot 파일, 웹 게임 코드, 세이브는 수정하지 않았다. 초기 license 차단 뒤 부모가 실제 Editor import/compile/asset 검사를 통과했다. Windows Player/시각/수동 플레이는 별도 게이트다. 아래 .NET 검사와 전체 이식 완료를 혼동하지 않는다.

## 소스와 프로필

| 항목 | 값 / 근거 |
|---|---|
| 소스 | `godot/source_snapshot/game.html` |
| SHA-256 | `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` |
| 현재 웹과 대조 | 소유 E: root `game.html` hash `189899b47b2efa464cd0d99dc75480b27232e89a94c868c87fa514fd13f86c7e`; 공용 G: hash `d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5`. 파일 전체 byte는 서로 다름. 아래 핵심 함수13개를 Acorn으로 추출해 원문 비교하면 G:는 snapshot과 전부 같음; E:는 `mkItem`만 다르고 나머지12개 동일. 원문 전체 최신 이식이라고 확대하지 않음 |
| native 코어 | `unity/Assets/Exoduser/Runtime/Core/Simulation.cs`, `SimulationState.cs`, `SourceStarterFixture.cs`, `KiSlash.cs` |
| 좌표 / 시간 | 원본 픽셀 좌표, +Y 아래, `Tick` 1회 = 원본 60Hz 1프레임 |
| 원본 기본 스킬 | `mkP` 29029의 `kiSlash`; `CreateKiSlash()`가 이 기본 선택을 복원. `CreateBasicWeapon()`도 명시적인 비교 모드로 보존 |
| 실제 시작 장비 fixture | 원본 `mkP → defaultItems → applyStats`를 Node VM에서 오프라인 실행, 15장비 원본 객체 보존 |
| fixture 난수 / 시계 | LCG seed `0x20261024`, 원본 factory 난수 505회, 명시 시계 `1792796400000`ms |
| fixture 의미 | 한 가지 유효한 원본 시작 장비 표본. 브라우저 부팅 전체 난수 재현이나 C# 전체 `mkItem` 구현이 아님 |
| JS 실행 위치 | I:의 오프라인 검증/export 전용. Unity 실행 중 JS/WebView/브라우저 없음 |
| 추가 가방 / 세이브 | 신규 시작 가방 10장비, 슬롯 복원, 공용 악의 연동 미구현 |

Unity 이식 후보의 원본 기본 공격 모드는 `SourceStarterFixture.CreateKiSlash()`를 사용하고, `CreateBasicWeapon()`은 기본 무기 비교용이다. `new SimulationConfig()`의 `source-seed-basic-weapon`은 장비 없는 수식 검사용 fixture이며 실제 시작 장비라고 표시하면 안 된다. 초기 라이선스 차단 뒤 Editor import/compile/asset 검사 통과까지 진행했으며 Player/시각은 상위 보고서에서 구분한다.

## 원본 15장비 표본에서 추출한 native 설정

| 필드 | 값 | 원본 위치 |
|---|---:|---|
| 최대 HP / ST / MP / 쉴드 | 526 / 240 / 330 / 285 | `defaultItems` 16171–16172, `applyStats` 27904–27965, `recalcSt` 16427–16433 |
| 시작 HP / ST / MP / 쉴드 | 각 최대치로 채움 | `initStage` 31569 |
| 기본 ATK / 물리 DEF 합계 | 15 / 100 | `applyStats` 27928, `hurtP` 43511 |
| 플레이어 속도 | 2.7196000000000002px/frame (C# float 저장) | `applyStats` 27929 |
| HP / ST / MP regen 기본 | 각각 .05 | 27931–27934, 실제 프레임 회복은 idle `/8`, 행동중 `/16` (32715–32721) |
| 무기 | 녹슨 검, 공격18, 속도.45, 사거리54, 반각.95 | 원본 `mkItem` 결과. `wRange + bonusRange*4` |
| 공격속도 배율 | 1.0336 | `statDex` 27996 |
| 피해 배율 / 악세 피해 추가 | .7 / 0 | `_passDmgSum` 28015, `hurtE` 42232 |
| 회심 / 회심배율 / 드롭배율 | 0% / 1.5 / 1 | 원본 `statCrit`, `statCritDmg`, `statDropBonus` |
| 인트로 무적 | 600프레임 | `_openIntroCurtain` 63414의 실제 원문 |

전체 원본 장비 JSON과 함수 anchor 목록은 `I:\EXODUSER-Storage\qa\unity-port-20261024\starter-oracle\starter-fixture.json`에 보존한다. 부모 작업자가 필요한 runtime JSON을 `Assets`로 복사할 수 있다.

원문 비교 함수는 `mkP`, `mkItem`, `defaultItems`, `applyStats`, `recalcSt`, `stCost`, `hitArc`, `hurtE`, `hurtP`, `updateE`, `addExp`, `_calcMaxExp`, `_openIntroCurtain`이다. 영수증은 같은 QA 폴더 `live-source-comparison.json`이다.

## 구현 범위

| 구현 | 수치 / 계약 | 원본 |
|---|---|---|
| 기본 이동 | 대각 정규화, X/Y 독립 충돌 슬라이드, 행동중 .8배 | 33004–33029, 33349–33355 |
| 플레이어 넉백 | 이동 `kb*.5`의 합성 벡터를 1회 충돌검사, 통과할 때 X/Y 함께 적용, 충돌 여부와 무관하게 `kb*=.65` (sp=1). 보행의 축별 슬라이드를 넉백에 사용하지 않음 | 32764 |
| 기본 공격 | ST5, `wSwing=5`, 세 번째 Tick에 남은3 경계에서 1회 hit, 회복 `int(16/(weaponSpeed*attackSpeed))` | 31987, 33055–33058, 33357–33366 |
| 기검참 비용·발사 | ST `10+(KiSlashLv-1)*2`, 1/2타는 공격 admission에서 즉시 검기, 3타는 windup999 홀드→release 검기. 기본 무기 스윙의 접촉 판정도 유지 | 31987, 33055–33058, 16835–16858 |
| 검기 피해 | `int(meleeRef*7*.7*(12+(KiSlashLv-1)*10.08*.5)*2^chargeTier)`; 실제 시작 장비 meleeRef33/Lv1 무충전1940. raw mkP meleeRef8/Lv1 무충전470/full3763 | 16821–16827, 28772, 44545–44558 |
| 검기 3타 충전 | 40/80/120프레임에서 tier1/2/3, 피해2/4/8배, scale1.4/1.8/2.2. 120에서 cap하지만 홀드 중 자동 발사하지 않음; release Tick에서 충전1 증가 뒤 발사 | 16814–16817, 16840–16858 |
| 검기 수명·속도 | 속도14, life `int(([250,300,350]+(Lv-1)*15)/14)`; Lv1 life17/21/25. life감소→0이면종료→이동 순서여서 실제 이동224/280/336px | 16790–16812, 19823–19832 |
| 검기 범위·벽·관통 | radius55/55/120×3타scale, center wall 판정, strict distance `<r+enemy.r` 및 target LOS, 적 객체 identity마다1회·총 관통 무제한. pool16 | 16779–16812, 19832–19844 |
| 검기 trail | 5슬롯을 발사 위치로 초기화, 매 simulation Tick `head=(head+1)%5` 후 새 좌표 기록. 뷰가 렌더 프레임마다 별도 진행시키지 않도록 `TrailX/Y,TrailHead` 제공 | 16809–16810, 19830–19831 |
| 검기 피해 옵션 | 원문 `poiseHit=true,kbMult=.5,noImpact=true`, 물리 원소0. 임의 `noElReact` 옵션은 원문에 없어 추가하지 않음. 쉴드 차감 뒤 HP overflow 피해로 ordinary 포이즈 차감,0이면180stun; stunned 직접 피해1.5배 | 19839, 42338, 42464–42490, 19974–19999 |
| 일반 포이즈 회복 | stun 만료는 `MaxStunned` marker만0으로 하고 포이즈를 최대치로 채우지 않음. hitStun/stunned 조기 return을 지난 eligible update 200회마다 `int(MaxPoise*.15)` 증가, 타이머0. 새 포이즈 피해는 타이머0 | 34451–34456, 38618–38638, 38663–38666, 19978–19979 |
| 물리 피해 | `int((baseAtk+weaponAtk+enhanceAtk+15)*6)` → `int(raw*.7)+int(5*1.5)`; 반경과 각도 양쪽 판정 | 33360–33364, 37610–37619 |
| JS 수치 | .7은 C# double로 보존. 장비 없는 표본 raw180×.7은 JS에서125.99999999999999, trunc125+7=132 | 오프라인 Node 수치 확인 |
| 일반 적 | etype0, 비엘리트·물리 원소 제한. Lv1 stage0 diff5 HP875, 쉴드875, ATK31 | 31127–31186 |
| 적 속도 / 반경 | `(.39+u*.08)*1.5`, `(10+u*2)*2` | 30860, 31139–31141 |
| 피격 | 쉴드 우선→남는 피해 HP, 중복 사망 방지, 일반 HP 피격 idle 경직8, 넉백 최대15 | 42114–42115, 42345–42385, 42415–42416, 42464–42485 |
| 사망 보상 | 일반 kill +4악의, 물약 hp/st/mp 1개 카운터, XP `max(5,int(lv*.4))`→`int(/3)` | 43094–43116, 43142 |
| 레벨업 | 초기 maxExp15; 15개 Lv1 처치→Lv2 exp0, 다음 maxExp20, SP3 AP1. 리소스20% 보충 | 29020, 43130–43160 |
| 장비 드롭 요청 | 일반45%×dropBonus, 등급 가중치 `[65,22,9,3,1,.01]`, 슬롯16개/원소6개 선택 | 32014–32035 |
| 픽업 연결 경계 | 화면 내 최고등급→동급 최근접, 홀드9프레임. 실제 화면/인벤토리 callback 승인 전 picked=false 유지 | 32935–32968 |
| RNG | 명시 seed LCG 또는 주입한 `[0,1)` 공급자; Unity 전역 난수 미사용 | 원본 Math.random 결정값을 명시 공급 |

## 명시된 미완료 범위

- 원본 기본 `kiSlash` 발사·수명·일반 etype0 접촉/피해·3타 홀드 기본 경로를 옮겼다. 유니크 예열/충전 추가피해/풀차지 회심/검기 패링·전설 콤보 분노·숙련도·field mob 별도 소비자는 남아 있다. 나머지 스킬, 보호 Q/E 설계는 이번 코드에서 재작성하지 않는다.
- 원본은 hitstop3/6 요청을 기록하나32586에서 소비 직전0으로 비활성화한다. 임의 freeze는 추가하지 않는다. 화면 shake·slowMo 및 전체 clock은 별도다. 명중광·차지 섬광·5샘플 연결은 [UNITY-FEEDBACK-01](UNITY_FEEDBACK_20261024.md)로 후속하며 실제 Editor/Player 근거를 모델 검사와 구분한다.
- etype0의 LOS 알림·추적 및 직접 이동 fallback·접촉 타격 부분을 이식했다. 원본 flow field, stuck 우회/텔레포트, 분리력, 벽충돌 추가 피해, 멀리 있는 적의 tier별 scheduler는 남아 있다. 임의 공격 티켓은 추가하지 않는다.
- 원본 일반 원거리 타이머(180–300 초기, 240 cooldown, 60 charge, etype0 range400)는 상태값만 유지한다. 발사체/패링 클래스는 미구현이며 임의 탄으로 치환하지 않는다.
- 장비 드롭은 `equipment-roll-pending` 요청이다. `mkItem`, affix/implicit 전체 생성, 실제 인벤토리/장착, 위치용 RNG, 유골/결정/돌/그 외 드롭은 남아 있다. 요청을 만들어 놓고 “정상 아이템 획득”이라고 보고하지 않는다.
- C# 시뮬레이션은 전체 웹 RNG stream replay가 아니다. UNITY-FEEDBACK-01에서 기검참 cast/charge 샘플 RNG를 원본 순서대로 추가했으나, 그 외 presentation RNG·elite factory RNG·미이식 loot factory RNG가 남으므로 같은 seed로 모든 프레임/드롭 동일하다고 주장하지 않는다.
- 플레이어 피격은 기본 물리 DEF/쉴드/HP/4칸 포이즈의 좁은 범위다. 회피/리소스 전체 회복·완전한 stagger/stun/죽음 부활·저장·패시브 자동투자·고레벨 해금·초월 일일제한 등은 별도다.
- 보스·클리어·다음 지역·모든 등장 몬스터·전 UI·오디오/VFX·원본 시각 동등성 미완료다.

## 검증 기록

| 검증 | 결과 / 범위 | 영수증 |
|---|---|---|
| 첫 코어 RED | C# `Simulation` 부재로 기대 실패. Unity Editor 자체는 라이선스로 실행 실패해 Unity RED 아님 | 부모 `core-red.json` |
| 코어 / 맵 의미 검사 | 부모 독립 .NET 검사 36/36, 원본 피해/이동/충돌/쉴드/실제 15처치 XP/중복지급 방지 포함 | 부모 `core-behavior-01.json` |
| 시작 장비 fixture RED | absent `SourceStarterFixture`로 의미상 실패 | `starter-oracle/red-fixture.json` |
| 시작 장비 fixture GREEN | 원본 오프라인 export 설정23개 vs C# 설정23/23 일치, float 허용오차1e-5 | `starter-oracle/green-fixture.json` |
| 넉백 보정 RED → GREEN | 원본32764와 다른 기존 `+kb`/`.05` decay/축별 슬라이드를 재현해 5검사 중4실패 → 원본 `kb*.5`/`.65`/합성 벡터 충돌로 수정 후5/5. 초기 kbX12→X6/kbX7.8, 벽으로 막힌 벡터는 두 축 모두 정지하면서 decay 유지 | `starter-oracle/test-knockback/red.json`, `green.json` |
| 기검참 source oracle RED → GREEN | native API 미존재 RED → Node 원본 함수40표본의 spawn/lifetime 및 native integration 총93/93. Lv1/3, raw/실제 장비, hold39/40/79/80/119/120/999, strict 접촉 경계, 쉴드→HP 실제처치, 포이즈/넉백, 벽/LOS, 3타 release·120cap 검증 | `unity/Tools/ki-slash-oracle/runs/red.json`, `green-03-poise.json` |
| 새 기검참 함수 현재 G: 대조 | `spawnCrescent`, `_fireKiSlashCrescent`, `_kiSlashHoldTier/Multiplier`, `_beginKiSlashThirdCharge`, `_updateKiSlashThirdCharge`, `updateCrescents`, `_poiseHit` 8개 원문 전부 snapshot과 동일 | 같은 Tools의 `oracle.json.live_comparison` |
| 일반 포이즈 검토 보정 RED → GREEN | 실제 원문 timer/updateE prefix를 순서대로 실행한 Node oracle: ordinary stun 만료 poise0 유지/R1, eligible199회0/R199,200회15/R0,400회30/R0. 초기 C# 7/7실패 → 즉시 최대회복 삭제·200회15% 회복 구현 후7/7. hitStun/stunned 동안 regen 정지도 확인 | 같은 Tools의 `poise-oracle.json`, `runs/red-poise.json`, `runs/green-poise.json` |
| 기본 무기/맵 회귀 | 최종 포이즈 수정 후 기존36/36 유지 | `I:\EXODUSER-Storage\qa\unity-port-20261024\ki-poise-regression\core-receipt.json` |
| 실제 Unity Editor / Windows Player / 화면 | 별도. .NET 결과만으로 성공 주장 금지 | 부모 결과 참조 |
| 실제 엔진 후속 | 부모가 Editor 검사·Windows build 및 Player 자동이동/120f차지/해제·4처치·PNG4종을 확인. 수동 플레이/전체 게임 검증과 구분 | `UNITY_PORT_20261024.md`의 실제 산출물 표 |

변경 소유권은 Core C# 4파일, `Tools/ki-slash-oracle/`, 이 문서다. 다른 작업자의 SourceMap·에디터·렌더러·Resources·공용 Git index는 수정하지 않는다. 이 Tools의 실체는 I: Junction이다.

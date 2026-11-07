# 33° 쿼터뷰에서 탄막 액션이 성립하는 조건 — 레인 BH 연구 (2026-11-05)

- 브리프: [BRIEF_OVERNIGHT2_20261105 §BH](../worklog/cloud-lanes/BRIEF_OVERNIGHT2_20261105.md). 정체성 한 줄: **"33도 쿼터뷰 루팅 핵슬 탄막 액션 RPG"**([DIRECTION_RESET 14:50~15:00](../DIRECTION_RESET_20261105.md)).
- 범위: 공개 자료 조사 + 우리 Core 수치 대조 + Mac 33° 탄막 테스트 판정 기준표 초안. **Core 수치 변경 0**(바꾸고 싶은 것은 §7 "Core 제안"으로 번호만 붙임). 설계 금지(어택 티켓·무지개탄 Q 패링·docs/2_3 설계 불변) 유지.
- 출처 표기: 이 클라우드 세션은 WebFetch가 전 도메인에서 차단돼(`getaddrinfo ENOTFOUND`) 페이지를 직접 열지 못했다. 그래서 웹 근거는 전부 **검색 발췌**(검색 결과 요약으로만 확인)이고, 발췌에서도 수치가 안 나온 항목은 **미검증**이다. 두 출처 이상이 아닌 수치는 "단일 출처"로 적었다. 미검증 수: **11**(§8 집계).
- Core 인용은 `unity/Assets/Exoduser/Runtime/Core` 기준 파일:줄이다(브랜치 `claude/unity-cloud-bullet-readability-20261105`, unity/main 2f8ef03 기준). 틱은 60틱/초, 거리는 Core 월드 px(웹 1920×1080 1:1 기준)다.

## 0. 우리 Core의 탄·회피·패링 수치 (대조 기준)

| 항목 | 값 | 출처(Core) |
|---|---|---|
| 플레이어 반경 | 15 px | `SimulationState.cs:52` |
| 보스 투사체 기본 크기·반경 | `Sz = 1`, `R = 4` | `DruidBoss.Hazards.cs:9` |
| 보스 투사체 → 플레이어 판정 | `collR = 15 + Sz×3`, 실제 피격 `hitR = collR + 4`; 패링창이 열려 있으면 `collR×3 + 12` | `DruidBoss.Hazards.cs:220-223` |
| 일반 적 콩(충전 뒤 발사) | black(무지개탄) 4.4 px/틱 Sz 2.0 `#00aa00` / red 2.8 유도 Sz 1.5 `#cc1100` / dark 3.3 Sz 1.6 `#a44cff` / fire 3.2 Sz 1.6 `#ff2e22` / water 3.2 Sz 1.6 `#317cec` / special 3.0 Sz 2.5 / 기본 3.0 Sz 1.5 | `EnemyAi.cs:109-115` |
| 원거리 적 예고 | 사거리 400 px 안에서 쿨 240틱, **충전 링 60틱** 뒤 발사 | `Simulation.cs:402`, `EnemySpawn.Ai.cs:12` |
| 드루이드 부채꼴(fan) | 6 px/틱, 반경 16, 10 + 1.5×페이즈 발, 각폭 π×0.55, `ParryClass="magic"` | `DruidBoss.Moves.cs:78-83` |
| 드루이드 조수파(tideWave) | 15 px/틱(리모델 ×0.75 = 11.25), 띠 폭 60, 틈 0.8 rad, 최대 1750 | `DruidBoss.Moves.cs:106`, `DruidRemodelData.cs:53` |
| 추적 지뢰 | 반경 60, 속도 상한 1.5(리모델 ×0.7) | `DruidBoss.Moves.cs:117`, `DruidRemodelData.cs:54` |
| 필드보스 에너지탄 / 적콩 | 10 px/틱 Sz 48 R 20 / 9 px/틱 Sz 6.4 R 12 유도 | `Simulation.FieldBoss.cs:136,145` |
| 드루이드 돌진 | 22 px/틱 × 40틱(최대 880 px) | `DruidRemodelData.cs:45` |
| 드루이드 예고(Tele) 틱 | slashCombo 32 · slam 48 · charge 54 · groundFissure 40 · fan 38 · grab 60 · burrowStrike 50 · chaseAoe 30 · summon 60 · tideWave 70 · seekerMines 40 · heartbeat 90; 페이즈가 올라도 예고는 줄지 않음(`TeleM = 1`); 추격 장판 경고 30, 분출 경고 30 | `DruidRemodelData.cs:66-77,90-92,29,52` |
| 구르기 | 거리 175 px, 18프레임, **무적 14틱**(뒤 4틱 열림), 게이지 45 | `RollRules.cs:10-13` |
| E 패링(sBash) | 상태 20틱 중 **활성 16틱**(`st2 > 4`), 회복 28틱 ÷ (1 + 0.1×pParry) | `ParryRules.cs:11-12,24,137` |
| Q 패링(sBlock) | 진입 패링창 20틱 × (1 + cape), 해제 패링창 12틱, 누름 패링 반경 100, 흡수 반경 20, 차지 반경 100→500(240틱) | `ParryRules.cs:15-17,25,70` |
| 패링 성공 무적 | 25틱 | `ParryRewards.cs:14` |
| 체인대시 | 비행 63 px/프레임, 착지 무적 48 | `ChainDash.cs:16,18` |
| 경직 탈출/자연 종료 무적 | 30 / 60틱 | `PlayerPoise.cs:13` |
| 무지개탄 규칙 | `BlackBean`은 Q(magic)만, E로 치면 잘못 입력; Q 성공 시 블루콩 `#00e5ff` 유도 반사 | `DruidBoss.Reflect.cs:69`, `ParryReflect.cs:97,162-164`, `ParryRules.cs:88,115` |
| 아군 투사체 예 | 파이어볼 5.5 px/틱 반경 12, 빙결 날 반경 12 | `Skills/SkillRules.cs:91,78` |

환산: 4.4 px/틱 = 264 px/s, 3.0 = 180, 6 = 360, 15 = 900, 22 = 1,320. 구르기 평균 9.7 px/틱. 일반 콩이 400 px를 날아오는 시간은 91~143틱(1.5~2.4 s)이다.

## 1. 레퍼런스별 탄 문법

| 게임 | 탄 크기(화면 대비)·판정 vs 그림 | 색 문법 | 속도·밀도 | 출처·접속 |
|---|---|---|---|---|
| 동방(탄막 원형) | 플레이어 판정은 스프라이트보다 훨씬 작다("그레이징" = 스프라이트는 스치고 판정은 안 닿음). 픽셀값은 공개 수치 없음(4×4~5×5 추정은 단일 익명 글, **미검증**). Reimu 판정이 다른 캐릭터보다 작다는 건 복수 출처 | 탄 색은 탄 종류·주인 구분용, 집중 모드에서 판정 점 표시(점 크기 ≠ 실제 판정) | 밀도 상한 공개 수치 없음(**미검증**) | shmups.wiki Touhou, giantbomb Grazing, maribelhearn.com FAQ — 검색 발췌 |
| Enter the Gungeon | 탄 판정 = 스프라이트 중심 픽셀(wiki.gg Hitbox), 플레이어 판정도 몸보다 작고 게임이 보여주지 않음(fandom). "탄이 판정보다 커 보인다"는 플레이어 불만 존재 | 적탄 붉은/분홍 계열 단색, 아군탄은 총기 색. 공식 색 규칙 문서 없음 | 구르기 무적은 롤의 전반(약 3/4) 뒤 열림 — 플레이어 글 1건, **미검증**. 적탄 기본 속도 공개 수치 없음(**미검증**). 탄속 감소 아이템은 -20%·-32% 곱 | enterthegungeon.wiki.gg Hitbox·Dodge_Roll, fandom Hitbox, Steam 토론 — 검색 발췌 |
| Nuclear Throne | 픽셀아트, 탄 1발 피해 3. 탄 px·속도 공개 수치 없음(**미검증**) | 적탄 단색 고대비 | JW Nijman "Art of Screenshake"(2013): 총구 화염·탄 크게·카메라 킥·흔들림을 하나씩 더하는 피드백 강연. "흔들림은 일관된 시각 언어여야 한다(폭발과 탄 스침이 같은 흔들림이면 구분 불가)". 탄 색 관련 발언은 발췌에 없음 | gdcvault 1020517, gamejuice.pages.dev, infovore.org — 검색 발췌 |
| Hades 1·2 | 아이소메트릭 2D. 원거리 적 공격은 바닥 원형 표식. 대시 중 전 피해 면역, 대시 공격·캐스트 등 다른 행동이면 남은 대시의 면역 소멸(fandom Hades II mechanics, Steam 토론 복수) | 적 공격 표식 붉은 계열, 아군 보온 효과는 신별 색 | 대시 프레임 7, 피벗 대시 10(구글 문서 1건, **미검증**). Hades 2는 대시 전 녹색 번쩍 뒤 무적 시작(PC Gamer). 공식 가독성 강연은 못 찾음(**미검증**) | hades.fandom.com Gameplay_mechanics/Hades_II, pcgamer.com, steamcommunity — 검색 발췌 |
| Returnal | 3인칭 "불릿 발레". 탄은 크고 발광하는 구체·띠, 적·탄 스폰 위치를 바로 짚을 수 있게 하는 것이 초단위 몰입의 핵심(MobileSyrup 인터뷰). 클러터 없는 화면을 GDC 2022에서 지켜냈다는 요지 | 보스 가이드: Ixion 주 위협 파랑 탄, 주황 에너지 = 재배치 예고; Algos 파랑 탄은 추적 쉬움, 빨강 뒤따름; Phrike 빨강 미사일은 약하게 선회·보라 구체. **공식 색 규칙 문서는 없음(미검증)**. 파란 레이저는 대시로 못 뚫음(가이드 복수) | 대시 무적 있음, 대시 사이 짧은 취약, 프레임 수치 없음(**미검증**) | gamedeveloper.com GDC2022 Returnal, mobilesyrup 인터뷰, gamingbolt·gamepressure 보스 가이드, kakuchopurei — 검색 발췌 |
| Furi | 패링은 "피해를 받는 순간" 입력, 완벽 패링은 회복+반격. Thoa: "일본식, 초고속·즉응". 창 수치 없음(**미검증**) | 패링 가능 공격은 붉은 섬광이 관례(가이드 요지) | — | gamepressure Furi tips, actugaming 인터뷰, gematsu — 검색 발췌 |
| Nine Sols | 완벽 패링 0.133 s(≈8틱), 0.133~0.5 s 전 입력은 불완전 패링(내상 피해). 연타하면 창이 줄어듦. Sekiro 비교 약 12틱 | 패링 가능 탄·공격은 붉은/흰 섬광, 불가 공격은 붉은 빛+별 표식(가이드) | 2D라 카메라 문제 없음(리뷰) | ninesols.wiki.gg Parry, switchbladegaming, primagames, Steam 토론 — 검색 발췌(0.133 s는 2출처) |
| PoE2 | 구르기는 투사체·단타만 피함, 장판·AoE·DoT는 못 피함, 무적은 애니메이션 전반만(poe2wiki, mobalytics, sportskeeda 3출처). Bulwark 키스톤은 무적 대신 피해감소 | GGG: "보스 예고가 공정하게 느껴지는 것이 매우 중요"(개발 영상, maxroll 요약). 플레이어 불만: 내 냉기 장판과 적 장판이 같은 모양, 장판이 표식을 가림 | — | poe2wiki Dodge_roll, maxroll 보스 디자인, pathofexile.com 포럼 3598854·3906258 — 검색 발췌 |
| D4 | S4(2024-05)부터 카메라 줌아웃 영구 추가(Fletcher 확정). 비율 수치 없음(**미검증**) | 접근성: "한눈에 정보"가 목표, 플레이어/아이템 하이라이트 색 선택 가능. 2.5.0 PTR: 엘리트 어픽스 시각 명료성 개선 | 실패 사례: Lair 보스 공격이 바닥과 같은 색(icy-veins), 워락 지속 장판이 시야를 덮음(icy-veins 토글 요청) | news.blizzard.com 23954932, pcgamesn, icy-veins — 검색 발췌 |
| Vampire Survivors | 대량 탄 성능: Phaser → Unity 1.6(2023-08-17) 이전으로 성능·호환 개선, Steam Deck 체감 다수 | 적탄 거의 없음, 아군 탄 과다 → "역탄막" | 밀도 상한은 성능이 정함 | gamingonlinux, pcgamer, wikipedia — 검색 발췌 |

**공통점(= 우리 정답):**
1. **판정 ≤ 그림.** 모든 탄막 게임이 탄 판정을 그림보다 작게 둔다(동방·Gungeon). 우리 Core도 같다: 피격 반경 `15 + 3·Sz + 4`이고 Sz 1.5 탄의 자기 반경은 8.5 px. 그림은 이보다 **크게** 그려야 하고 작게 그리면 FAIL.
2. **색 = 주인 + 대응법.** 적탄/아군탄은 색상환에서 멀리 두고, 패링 가능 여부는 색만 아니라 **섬광·모양**으로도 표시한다(Nine Sols·Furi). 우리 Core 색 앵커: 적 무지개탄 `#00aa00`·빨강 유도 `#cc1100`·반사 블루콩 `#00e5ff`.
3. **예고 → 발사 → 도착** 3단계. 바닥 표식(Hades·PoE2·D4)이나 충전 링(우리 60틱)이 발사 전에 보인다. 예고 없는 빠른 탄은 모든 게임에서 불만 1순위.
4. **회피는 짧은 전 피해 면역 + 뒤쪽 열림.** Hades(행동하면 소멸), PoE2(전반만), Gungeon(후반 열림), 우리(18 중 14).

## 2. 기울어진 카메라의 문제와 해법

33° 피치(LOCK 34°)에서 생기는 네 가지 문제와, 레퍼런스가 쓰는 해법이다. 바닥 원은 세로로 `sin 33° ≈ 0.545`배 눌리고, 원근이라 북쪽(먼 곳) 탄은 작아진다. 레퍼런스 대부분은 정사(2D 아이소) 또는 탑다운이어서 이 문제가 없고, 우리는 **원근 쿼터뷰 탄막**이라 사례가 적다(검색에서 개발자 글 0건, **미검증 공백**).

| 문제 | 증상 | 레퍼런스 해법 | 우리 적용안(표현만, Core 무변경) |
|---|---|---|---|
| 먼 탄 작아짐 | 북쪽 적의 탄이 핵 4~6 px로 줄어 바닥 잡티와 구분 안 됨 | Returnal: 탄을 크고 발광하는 구체로, 거리와 무관하게 빛남. Hades: 2D라 크기 고정 | 탄 렌더 크기에 **거리 보정 하한**(화면 지름 ≥ 기준표 값). 판정은 Core 그대로, 그림만 커짐 |
| 바닥과 분리 안 됨 | 공중 탄인지 바닥 장판인지 모름 | 아이소 커뮤니티 공통: **접지 그림자/링**(탄 아래 바닥에 작은 어두운 원), 높이 고정. Hades 원거리 표식도 바닥 원 | 모든 적탄에 바닥 접지 점(그림자) + 탄은 바닥에서 고정 높이(플레이어 허리) |
| 겹침 | 부채꼴 10~13발이 먼 곳에서 한 덩어리 | 동방: 탄끼리 겹쳐도 핵+테두리 2색이라 개수가 읽힘. Nex Machina: 바닥을 어둡고 단색으로 | 탄 = 밝은 핵 + 어두운 테두리(1~2 px) 2층. 1-1 바닥 톤은 탄 색과 ΔL* 확보(§6) |
| 가림·안개 | 고목·안개·비네트가 먼 탄을 지움 | D4 Lair 보스 "바닥과 같은 색" 실패. CLAUDE.md 카메라 LOCK: 먼 적을 지우면 FAIL | 탄은 안개 영향 제외 레이어, 가림 투명화(A2SightFade) 대상에 탄 포함 안 함(탄은 항상 위) |

유도탄(red bean 2.8 px/틱, 필드보스 적콩 9 px/틱)은 원근 때문에 **진행 방향 읽기**가 더 어렵다. Returnal 가이드의 "약하게 선회하는 빨강 미사일은 트레일로 읽는다"처럼 유도탄에만 짧은 트레일을 둔다.

## 3. 회피·패링·무적 관례 vs 우리 Core

| 관례 | 레퍼런스 | 우리 Core | 판단 |
|---|---|---|---|
| 회피 무적은 짧고 뒤가 열림 | Hades 대시(행동하면 소멸), PoE2 전반만, Gungeon 후반 열림 | 구르기 18 중 14 무적, 뒤 4 열림(`RollRules.cs:11-12`) | 관례와 같다. 14틱 = 233 ms, Hades 추정 7프레임보다 길고 PoE2보다 명확. 유지 |
| 회피 거리는 탄 벽 두께를 넘는다 | — | 175 px. 부채꼴 10~13발 한 겹의 두께는 탄 반경 16×2 = 32 px → 쉽게 넘음 | 테스트 §6 B-2에서 벽 두께 상한 = 175 − 2×hitR |
| 패링창 8~16틱 | Nine Sols 8(완벽)·30(불완전), Sekiro 12(2차 출처) | E 활성 16틱(`ParryRules.cs:11`), Q 진입 20·해제 12 | 우리가 넉넉한 편. 탄막에서는 "넉넉한 창 + 큰 판정 반경(패링창 열리면 `collR×3+12`)"이 Core에 이미 있다. 유지 |
| 패링 가능 탄은 색+섬광 | Nine Sols·Furi 붉은 섬광, Returnal 파란 레이저 = 대시 불가 | 무지개탄(Q만)·물리탄(E)·금지탄 3종이 `ParryClass`로 나뉨(`ParryRules.cs:88`) | 색 3종 + 섬광 3종(§6 C-3)으로 표현. 설계는 바꾸지 않음 |
| 패링 보상 | Nine Sols 기(Qi) 충전, Furi 회복 | 성공 무적 25틱, 반사 블루콩 유도, 무지개 피해감소 ≤ 50% | 유지 |
| 장판은 회피 못 함 | PoE2 원칙 | 추격 장판·독 웅덩이는 `PIframes <= 0`만 확인(`DruidBoss.Hazards.cs:380,449`) → 구르기 무적이면 피함 | 우리가 더 관대. 바꾸지 않음(Core 제안 아님, 기록만) |

## 4. 핵앤슬래시 + 탄막 공존 사례·실패

**성립 사례**
- **Hades**: 근접 다수 처치가 기본이고 원거리 적은 바닥 표식 + 느린 탄, 대시 전 피해 면역이 둘을 잇는다. 방 하나에 근접·원거리 혼성이지만 탄 수는 적다.
- **Returnal**: 근접(검)과 탄막을 "대시로 탄을 뚫는다"로 묶었다. 탄이 크고 느리고 발광한다. 파란 레이저만 예외(뚫지 못함) → 예외는 색으로 못 박는다.
- **Vampire Survivors**: 반대로 아군 탄이 화면을 덮고 적은 몸으로 밀려온다("역탄막"). 적탄이 거의 없어 가독성 문제를 비켜 갔다.
- **Nex Machina**: 탑다운, 어두운 단색 바닥 + 네온 탄. 카메라가 플레이어를 안 따라가 위치를 잃는다는 불만이 있었다(카메라는 플레이어 고정이 안전).

**실패 사례(불만이 공개된 것)**
- **D4 워락 장판**: 지속 바닥 효과가 아군·적 구분 없이 시야를 덮어 토글 요청(icy-veins). → 아군 효과는 바닥에, 적탄은 공중에: **층을 나눠야** 한다.
- **D4 Lair 보스**: 보스 공격 색 = 바닥 색. → ΔL* 기준(§6 C-1).
- **PoE2**: 내 냉기 장판과 적 장판이 같은 모양·색. → 아군 장판은 테두리만, 적 장판은 채움(제안).
- **No Rest for the Wicked** 포럼 "적과 공격이 잘 안 보임"(forum.norestforthewicked.com) → 어두운 분위기 게임의 공통 함정. 우리 1-1(안개·숲)도 같은 위험.

**우리 결론:** 공존 조건은 (1) 탄은 공중, 아군 효과는 바닥 — 층 분리, (2) 근접 다수 처치 중에도 탄이 보이게 **적탄은 항상 최상위 레이어 + 접지 점**, (3) 어택 티켓 없이도 탄 밀도 상한으로 공정성 확보(§6 B-3), (4) 구르기 14틱·Q 패링 반경 100이 탄막 대응 수단이므로 탄속 상한은 "예고 → 도착 ≥ 30틱"으로 묶는다.

## 5. 33° 테스트 설계 (Mac, DIRECTION_RESET 14:50)

- 장면: 1-1 빈 바닥(피치 33°) → 합격 뒤 고목 1그루. 플레이어는 남쪽 1/4 지점, 적은 북쪽(먼 곳)·동서(옆)·남쪽(가까움) 3거리.
- 패턴 3종, Core 수치 그대로: ① 원형(일반 콩 3.0 px/틱 Sz 1.5, 16발 균등) ② 나선(같은 콩, 1발/4틱, 각 10°씩) ③ 부채꼴(드루이드 fan 6 px/틱 반경 16, 10발, π×0.55). 추가로 ④ 무지개탄 1발(4.4 px/틱 Sz 2.0, Q 패링용) ⑤ 빨강 유도 1발(2.8 px/틱).
- 캡처: 1920×1080·3840×1080 각 1x 컷 3장(먼·옆·근) + 3x 크롭 + 10초 무음 영상, Unity·UE 양쭉. 측정은 스크린샷 px(3x 크롭에서 원본 px로 환산).
- 판정 사용자. 아래 기준표는 판정의 **최소선**이며, 통과해도 "같은 게임인가" 눈 판정이 남는다.

## 6. 판정 기준표 초안 (수치)

기준 해상도 1920×1080(3840×1080은 세로 같으니 같은 px). 월드 px는 Core, 화면 px는 캡처 측정값.

### A. 크기

| # | 항목 | 최소(FAIL 경계) | 목표 | 근거 |
|---|---|---|---|---|
| A-1 | 먼 탄(북쪽 끝 적 발사) 화면 핵 지름 | ≥ 8 px | ≥ 12 px | 1 px ≈ 1.6′(24″ 60 cm), 모양·색 인지에 5~8′ 필요. Returnal "탄은 어디서나 크고 발광" |
| A-2 | 가까운 탄 화면 지름 | ≥ 16 px | 20~28 px | 플레이어 몸(반경 15 → 지름 30 px 월드)의 절반 이상이어야 몸과 비교 가능 |
| A-3 | 그림 반경 ≥ 판정 반경 | 그림 ≥ `3·Sz + 4` px 월드 (Sz 1.5 → 8.5, Sz 2.0 → 10) | 그림 = 판정 × 1.2~1.5 | 동방·Gungeon 공통 "판정 ≤ 그림", `DruidBoss.Hazards.cs:220-222` |
| A-4 | 먼/가까운 탄 크기비 | ≥ 0.5 (먼 탄이 근 탄의 절반 이상) | ≥ 0.6 | 원근 보정 하한. 0.5 미달이면 거리 보정 렌더 적용 |
| A-5 | 접지 점(바닥 그림자) | 모든 적탄에 있음, 먼 곳에서 ≥ 4 px | ≥ 6 px | 아이소 커뮤니티 공통 해법(§2) |

### B. 통로·밀도

| # | 항목 | 최소 | 목표 | 근거 |
|---|---|---|---|---|
| B-1 | 탄 간 통로(탄 중심 간 거리, 월드) | ≥ 2×hitR = 2×(15 + 3·Sz + 4) → Sz 1.5: **47 px**, Sz 2.0: 50 px | ≥ 60 px(플레이어 지름 2배) | 통과하려면 두 탄 판정이 플레이어 판정과 안 닿아야 함 |
| B-2 | 탄 벽 두께(한 번에 구르기로 넘을 두께, 월드) | ≤ 175 − 2×hitR → Sz 1.5: **≤ 128 px** | ≤ 100 px | `RollRules.cs:10` 175 px, 무적 14/18 |
| B-3 | 화면 동시 적탄 수(1-1) | ≤ 40 | ≤ 30 | fan 최대 13발×2보스 페이즈 + 일반 콩 몇 발. 넘으면 성능이 아니라 가독성 FAIL |
| B-4 | 먼 통로 화면 폭 | ≥ 30 px 화면(사이에 바닥이 보임) | ≥ 40 px | B-1 47 px 월드가 원근으로 줄어도 읽혀야 함 |
| B-5 | 겹침 | 3x 크롭에서 탄 개수가 셀 수 있음(핵+테두리 2층) | — | 동방 2색 탄 관례 |

### C. 색·대비

| # | 항목 | 최소 | 목표 | 근거 |
|---|---|---|---|---|
| C-1 | 탄 핵 vs 탄 아래 바닥 밝기차 ΔL*(CIELAB) | ≥ 30 | ≥ 45 | WCAG 1.4.11 비텍스트 3:1 대비(≈ΔL* 30~35)를 하한으로 차용. D4 "바닥과 같은 색" 실패 |
| C-2 | 적탄 vs 아군탄 색상각 차 Δh | ≥ 90° | ≥ 120° | 적 `#00aa00`/`#cc1100` vs 아군 `#00e5ff`(Core 앵커). 녹색(120°) vs 시안(180°)은 60°로 부족 → 적 무지개탄은 **무지개 테두리+흰 핵**으로 모양 차이를 더함 |
| C-3 | 패링 분류 3종 표식 | 물리(E) 따뜻한 단색·실선 테두리 / 마법·무지개(Q) 무지개 테두리·흰 핵 / 금지 어두운 보라·X 없는 점선 | 발사 순간 섬광 3종 다름 | Nine Sols·Furi 섬광, Returnal 파란 레이저 예외. `ParryRules.cs:88` 분류 그대로 |
| C-4 | 안개·비네트 뒤 먼 탄 ΔL* | ≥ 25 | ≥ 35 | CLAUDE.md 카메라 LOCK "먼 적 지우면 FAIL" 확장 |
| C-5 | 점 0 | 탄·트레일·접지 점에 디더링·그레인 0(3x 크롭) | — | CLAUDE.md 4.2-7 |

### D. 예고·시간

| # | 항목 | 최소 | 목표 | 근거 |
|---|---|---|---|---|
| D-1 | 충전 링 보임 | 60틱 링이 먼 적에서도 화면 폭 ≥ 2 px 선으로 보임 | ≥ 3 px | `Simulation.cs:402` 60틱 |
| D-2 | 예고 시작 → 첫 피격 가능 | ≥ 30틱(0.5 s) | ≥ 45틱 | 단순 반응 15틱 + 구르기 시작. 드루이드 Tele 최소 30(`DruidRemodelData.cs:73,29`) |
| D-3 | 탄 체공(발사 → 플레이어 도달) | ≥ 24틱 | ≥ 40틱 | 콩 3.0 px/틱·400 px = 133틱 OK; 돌진 22 px/틱은 예고 54틱이 대신함 |
| D-4 | 유도탄 트레일 | 길이 ≥ 2×탄 지름, 방향이 1x에서 읽힘 | — | Returnal 미사일 |
| D-5 | 10초 영상 | 탄이 바닥 장판으로 오해되는 컷 0 | — | §2 층 분리 |

### 판정
- A·B·C·D 어느 한 줄이 "최소" 미달이면 FAIL. 전부 최소 통과 + 눈 판정("Hades·Returnal 옆에 놓아도 탄이 읽히는가") PASS일 때만 다음(고목 1그루)으로.
- 같은 방법 두 후보가 같은 줄에서 연속 FAIL이면 렌더 방법을 바꾼다(예: 스프라이트 → 거리 보정 메시 + 접지 데칼).

## 7. Core 제안 (변경 아님, 번호만)

1. **Core 제안 BH-1**: 투사체 `Sz`→그림 지름 환산을 표현층 상수 하나로 두고 docs에 적는다(지금은 웹 그림이 oracle, Unity 환산값 미기록).
2. **Core 제안 BH-2**: 일반 콩 7종 색(`EnemyAi.cs:109-115`)을 "주인·대응법" 축으로 재배치할지 검토(물리/마법/금지 3분류와 색이 1:1이 아님). 수치·판정은 그대로.
3. **Core 제안 BH-3**: 장판(추격·독·용암)이 구르기 무적에 걸러지는 현행(`DruidBoss.Hazards.cs:380,449`)을 유지할지 PoE2식(장판은 무적 무시)으로 갈지 사용자 결정 항목으로 올림. 지금은 유지.

## 8. 매뉴얼 07·08 반영 제안과 미검증 집계

- 매뉴얼 07(VFX)·08 파일은 이 체크아웃·origin/unity/main·연구 브랜치 4개 어디에도 아직 없다(2026-11-05 23시 기준, `MANUAL/` 경로 0건). 만들어지면 §6 A~D를 "탄·투사체" 절로 넣고, §2 표의 "우리 적용안" 열을 제작 절차에 옮긴다. 특히 07에는 **접지 점·2층 탄·안개 제외 레이어·거리 보정 하한**, 08(임팩트 쪽이면)에는 **패링 분류 3종 섬광**을 넣는다.
- 미검증 11건: ① 동방 판정 픽셀값 ② 동방 밀도 상한 ③ Gungeon 구르기 무적 비율 ④ Gungeon 적탄 기본 속도 ⑤ Nuclear Throne 탄 px·속도 ⑥ Hades 대시 프레임(7/10) ⑦ Supergiant 가독성 공식 발언 ⑧ Returnal 공식 색 규칙 ⑨ Returnal 대시 프레임 ⑩ Furi 패링창 수치 ⑪ D4 S4 줌아웃 비율. 원근 쿼터뷰 탄막의 개발자 1차 자료는 0건(공백).
- 다음: 네트워크 허용 뒤 ninesols.wiki.gg Parry·poe2wiki Dodge_roll·gdcvault Returnal·Hades fandom 4곳을 직접 열어 "검색 발췌"를 "열림"으로 올린다.

## 출처 목록(URL · 접속 여부)

모두 **검색 발췌**(WebSearch 요약만, 페이지 직접 열기 실패):
- https://shmups.wiki/library/Unknwn/Touhou · https://www.giantbomb.com/grazing/3015-6614/ · https://maribelhearn.com/faq/shots
- https://enterthegungeon.wiki.gg/wiki/Hitbox · https://enterthegungeon.wiki.gg/wiki/Dodge_Roll_(Move) · https://enterthegungeon.fandom.com/wiki/Hitbox · https://steamcommunity.com/app/377860/discussions/0/154645539342221159
- https://www.gdcvault.com/play/1020517/ (Nuclear Throne 강연) · https://gamejuice.pages.dev/articles/screen-shake-guide · https://infovore.org/?p=5275
- https://hades.fandom.com/wiki/Gameplay_mechanics/Hades_II · https://pcgamer.com/games/action/if-youre-struggling-with-hades-2s-small-changes-dont-worrytheyll-click · https://www.pcgamer.com/uk/hades-guide-tips-and-tricks
- https://www.gamedeveloper.com/gdc2022/a-third-person-action-roguelike-bullet-hell-arcade-thriller-the-making-of-returnal · https://mobilesyrup.com/2021/02/25/returnal-ps5-housemarque-interview/ · https://gamingbolt.com/returnal-guide-how-to-beat-all-bosses · https://www.gamepressure.com/returnal/phrike/zce60a · https://kakuchopurei.com/2021/04/30/returnal-guide-tips-how-to-survive-atropos
- https://www.gamedeveloper.com/design/how-housemarque-designed-the-vibrant-bullet-hell-scape-of-i-nex-machina-i- · https://gamesbeat.com/nex-machina-blasts-your-eyeballs-with-its-robotron-like-hordes/
- https://ninesols.wiki.gg/wiki/Parry · https://www.switchbladegaming.com/action-rpg/parry-timing-guide/ · https://primagames.com/tips/how-to-parry-in-nine-sols-explained
- https://www.gamepressure.com/furi/general-tips/zf9033 · https://www.actugaming.net/interview-developpeurs-de-furi-beat-them-all-dun-genre-nouveau-2-16481 · https://www.gematsu.com/2015/10/stylized-action-game-furi-coming-ps4-pc-2016
- https://www.poe2wiki.net/wiki/Dodge_roll · https://mobalytics.gg/poe-2/guides/dodge-roll-mechanic · https://sportskeeda.com/mmo/path-exile-2-poe2-dodge-roll-system-iframes · https://maxroll.gg/poe2/news/poe-2-boss-design-insights · https://www.pathofexile.com/forum/view-thread/3598854 · https://www.pathofexile.com/forum/view-thread/3906258
- https://news.blizzard.com/en-us/article/23954932/combatting-demons-with-accessibility-in-diablo-iv · https://www.pcgamesn.com/diablo-4/season-4-camera-distance · https://www.icy-veins.com/d4/news/diablo-4-effect-toggles-players-renew-calls-for-this-feature/ · https://wp-prod.icy-veins.com/?p=82740
- https://www.gamingonlinux.com/2023/07/vampire-survivors-switching-to-new-game-engine-on-august-17 · https://www.pcgamer.com/vampire-survivors-set-for-hefty-fps-boost-as-its-new-engine-finally-gets-a-release-date-its-like-a-completely-different-game · https://en.wikipedia.org/wiki/Vampire_Survivors
- https://forum.norestforthewicked.com/t/finding-it-very-hard-to-see-enemies-and-attacks/20379
- https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html (요지는 kb.daisy.org·digitala11y.com 발췌로 확인)
- 아이소 탄 그림자·높이 토론: https://itch.io/post/7764176 · https://forums.unrealengine.com/t/top-view-collision-detection-at-different-heights/129104 · https://itch.io/post/11969901

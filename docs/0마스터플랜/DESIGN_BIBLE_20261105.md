# EXODUSER 정체성 디자인 바이블 초안 — "33도 쿼터뷰 루팅 핵슬 탄막 액션 RPG" (2026-11-05)

> 레인 GD(클라우드, docs만, 코드 무수정). 브리프: [BRIEF_OVERNIGHT2_20261105 §GD](worklog/cloud-lanes/BRIEF_OVERNIGHT2_20261105.md).
> 이 문서는 **지금 Core에 있는 규칙 위에서 정체성을 선명하게 하는 문서**다. 새 시스템을 발명하지 않고, Core 수치·판정을 바꾸지 않는다(바꿀 제안은 "Core 제안 Cn"으로만 번호를 붙인다). 설계 금지(어택 티켓 없음, 무지개탄 Q 전용 패링, `docs/2_3` 설계 불변)를 그대로 지킨다.
> 근거 등급: **[Core]** = `unity/Assets/Exoduser/Runtime/Core` 코드에서 직접 읽은 값 / **[문서]** = 우리 연구 문서(링크) / **[검색]** = 이 세션 WebSearch 발췌(원문 열람 안 함) / **[미검증]** = 출처를 못 열었거나 1건뿐. 화면 수치는 전부 Mac 비교판에서 다시 잰다.
> 입력 문서 중 unity/main에 아직 없는 것은 §9 출처표에 브랜치를 적었다. 브랜치에만 있는 파일은 `git show origin/<브랜치>:<경로>`로 읽는다.
> **반영:** BH 레인 [GAME_STUDY/bullet_hell_quarter_view](GAME_STUDY/bullet_hell_quarter_view.md)(`claude/unity-cloud-bullet-readability-20261105` @ fe84a6f)과 LT 레인 [GAME_STUDY/loot_feel](GAME_STUDY/loot_feel.md)(`claude/unity-cloud-loot-feel-20261105` @ 9f2c9c6)은 06:02·06:11 UTC에 push돼 §2·§3·§4·§6·§7·§8에 반영했다. EP 레인(Core 이식)은 이 문서 범위 밖이라 기다리지 않았다. NRftW 프레임 실측은 어느 레인에도 없다(G-2).

## 0. 한 쪽 요약

- **정체성(사용자 원문 11-05 15:00):** "33도 쿼터뷰 루팅 핵슬 탄막 액션 RPG." 이후 모든 디렉션은 이 한 줄에 맞춘다([DIRECTION_RESET 14:40~15:00](DIRECTION_RESET_20261105.md)).
- **왜 특색인가(§1):** ① 이 조합의 선례는 2D 픽셀 로그라이트(Death Must Die·Tiny Rogues·Hero Siege·Realm of the Mad God)에만 있고, **영구 장비 ARPG 루팅 + 탄막 + 먼 적이 작게 보이는 원근 쿼터뷰(33~34°) + 3D 월드 위 픽셀 캐릭터**를 한 화면에 둔 게임은 조사 범위에서 0건이다. ② 우리 탄막은 Core 패링 분류(물리·마법·금지, 무지개탄은 Q 전용)로 "피하는 탄"과 "받아치는 탄"이 갈리고 패링 보상(자원·소재)이 루팅 경제로 흘러 들어간다. 탄막이 회피 퍼즐이 아니라 **핵슬의 자원**이다.
- **기둥 5개(§4):** 분위기=황천 · 가독성=PoE2 · 전리품=D4 · 임팩트=팬텀블레이드 제로 · 동작 무게=No Rest for the Wicked. 충돌 시 우선순위는 **가독성(먼 적·탄) > 임팩트 > 전리품 > 동작 무게 > 분위기**다. 근거: 카메라 LOCK "먼 적이 지워지면 FAIL"은 모든 매뉴얼의 공통 FAIL 조건이고(MANUAL 01~15), 분위기 수치는 공개 근거 0건이라 사용자 캡처 판정 전까지 다른 기둥을 누를 수 없다([MANUAL/02 §0](MANUAL/02_light_fog_grade.md)).
- **열린 결정(§7):** 사용자 결정 17건(그중 Core 제안이 걸린 것 7건; Core 제안 번호는 GD C1~C5·BH-1~3·LT-C1~3). 나머지 매뉴얼 결정 코드(D01~D15, 150여 건)는 [MANUAL/00_INDEX §3](MANUAL/00_INDEX.md)에 그대로 두고 이 문서는 정체성에 닿는 것만 올린다.
- **수치의 성격:** 탄 가독성 판정표(BH §6 A~D)와 드롭 리듬 계산(LT §5.1)은 반영했다. 레퍼런스 실측값은 어느 문서에도 없고(히트스톱 ms·안개·기둥 높이·드롭음·NRftW 프레임), Core 값을 제외한 모든 수치는 Mac 비교판 전까지 시작값이다.

---

## 1. 한 문장 정체성과 왜 특색인지

### 1.1 한 문장을 다섯 조각으로

| 조각 | 뜻(이 게임에서) | Core·LOCK 근거 | 책임 기둥 |
|---|---|---|---|
| **33도 쿼터뷰** | 직교가 아닌 **원근** 탑다운. 피치가 낮아 북쪽 먼 적은 작게, 남쪽 전경 고목은 크게 보인다. 먼 적이 보이는 생동감이 핵심이다 | 1-1 LOCK = ForestA2 피치 **34°**·거리 16.5u·수직 FOV 46.9453°(`NativeRemodel3D.cs`, [MANUAL/03 §3.1](MANUAL/03_camera_occlusion.md)). **33°는 11-05 빈 바닥 실험 표기**(LOCK과 1° 차이, [DIRECTION_RESET 14:40](DIRECTION_RESET_20261105.md)) → 열린 결정 G-1 | 가독성(PoE2) |
| **루팅** | 적을 죽이면 장비가 떨어지고, 주운 장비가 **캐릭터 몸에 보이고 갈아입혀진다**(11-05 15:05 "루팅 게임이므로 장비 가시화가 캐릭터 파이프라인의 첫 요구사항") | 장비 슬롯 17·드롭 슬롯 16(`DropTablesData.SlotNames`), 등급 6(일반~유니크), 몬스터 등급별 가중치·드롭 수(`WorldDrop.cs`), 가시 슬롯 10([CHARACTER_PIPELINE §0.1](MANUAL/CHARACTER_PIPELINE_20261105.md)) | 전리품(D4) |
| **핵슬** | 근접 다수 처치. **어택 티켓(동시 공격 제한) 없음**(설계 금지) | 1-1 시작부터 12~16마리 동시(`Simulation.StartMobs.cs`), 클리어 = 80% 처치 + 수호자; 히트스톱은 Core가 계산(일반 5·처치 4·큰 처치 12틱) | 임팩트(PBZ) |
| **탄막** | 적·보스가 원형·나선·부채꼴 탄을 쏘고, 플레이어는 **구르기(18틱, 앞 14틱 무적)**로 피하거나 **패링**으로 받아친다. 탄은 색·크기·패링 분류가 있다 | 적 탄 5종 색·크기·속도(`EnemyAi.cs:109-115`), 드루이드 부채꼴 10+1.5×페이즈 발·속도 6·반경 16(`DruidBoss.Moves.cs:78`), 패링 분류 `physical/magic/forbidden`(`DruidBoss.Hazards.cs`), **무지개탄(blackBean)은 Q로만**(`ParryRewards.cs`, CLAUDE.md §7) | 가독성·임팩트 |
| **액션 RPG** | 실시간 판정 위에 성장·스킬·속성·어픽스. 규칙의 정답은 Unity Core(웹 oracle 검증) | `Runtime/Core` 133파일, 60fps 틱, 100px = 1u | 전부 |

### 1.2 같은 조합의 게임이 있는가 — 조사 결과 [검색]

이 세션 WebSearch로 "isometric/top-down + bullet hell + loot/ARPG" 조합을 찾았다. 원문은 열지 않았고(검색 발췌), 상점 페이지 문구는 발췌 기준이다. 우리 연구 문서 20개와 REFERENCE_INDEX에는 **탄막 레퍼런스(Gungeon·Returnal·동방·Nine Sols·Furi·Vampire Survivors) 0건, "아이소+탄막+루팅" 선례 0건**이었다(GAME_STUDY 추출 §2-h, D4 추출 §2g).

| 게임 | 시점·렌더 | 탄막 | 루팅(영구 장비) | 우리와 다른 점 | 출처 |
|---|---|---|---|---|---|
| **Death Must Die** (EA 2023~) | 아이소메트릭 2D 스프라이트, 서바이버류 | "bullet hell gameplay" 명시, 닷지 | **디아블로식 장비(무기·방어구·반지·펜던트, 등급)** | 런 기반 로그라이트, 하데스식 신 축복, 군중 규모의 자동전투 감각. 패링 분류 없음, 원근 3D 월드 없음. 아이템 랜덤성 과다 비판 | [SteamSpy 태그 Isometric·Loot·Bullet Hell·Hack and Slash·Action RPG](https://steamspy.com/app/2334730) · [GamesRadar](https://gamesradar.com/steams-latest-roguelike-hit-is-a-hades-and-vampire-survivors-mash-up-with-some-impressive-rpg-flair) · [PCGamesN](https://www.pcgamesn.com/death-must-die/act-2-steam) |
| **Tiny Rogues** | 탑다운 2D 픽셀, 방 단위 | "rogue-lite bullet-hell dungeon crawler" 자기 서술 | 무기 400+·장비 500+(런 안) | 런마다 초기화, 2D, 방 단위 전투, 근접 핵슬 아님 | [Steam(ko)](https://store.steampowered.com/app/2088570/Tiny_Rogues/?l=koreana) · [rogueliker 리뷰](https://rogueliker.com/tiny-rogues-review/) |
| **Hero Siege** | 탑다운 2D 픽셀 | 사용자 태그 "Bullet Hell"(443) | 등급 Normal~Satanic, 아이템 1000+ | 탄막은 태그뿐(상점 문구 없음), 2D 픽셀, 쿼터뷰 원근 없음 | [SteamSpy](https://steamspy.com/app/269210) · [itch.io](https://panicartstudios.itch.io/hero-siege) |
| **Realm of the Mad God** | 탑다운 8비트, MMO | "massively-multiplayer cooperative bullet hell shooter" | 드롭 루팅, 영구 사망 | 슈터(원거리), 영구 사망, 2D | [Wikipedia](https://en.wikipedia.org/wiki/Realm_of_the_Mad_God) |
| **The Slormancer** | 탑다운 2D 픽셀 ARPG | 상점 문구 없음(PCGamesN이 "Vampire Survivors식 탄막 파워 판타지"로 비유) | 디아블로식 루팅 | 탄막은 비유 수준 | [PCGamesN](https://www.pcgamesn.com/games-like-diablo-pc) · [Fanatical](https://www.fanatical.com/en/game/the-slormancer) |
| **Chronicon** | 2D 아이소메트릭 픽셀 | 없음(트윈스틱 조준) | 디아블로2식 루팅 | 탄막 아님 | [gamingonlinux](https://www.gamingonlinux.com/2020/08/fantastic-2d-action-rpg-chronicon-has-now-released/) |
| **Ravenswatch** | 아이소메트릭 3D 로그라이크 | 보스 패턴이 "border on bullet hell"(프리뷰) | 장비 루팅 없음(런 업그레이드) | 루팅 없음 | [Shacknews](https://www.shacknews.com/article/134922/ravenswatch-pc-early-access-preview?amphtml=1) |
| **Hades II** | 아이소메트릭, 대시 중심 | "bullet hell" 표현 없음 | 축복(장비 아님) | 루팅 없음 | 검색 결과 종합(원문 미열람) |
| **PoE2 / Diablo IV** | 고정 원근 탑다운 3D | **보스 한정** 탄막류(PoE2 개발 포럼 "Exarch bullet hell의 더 어려운 버전", D4 릴리트 파동 회피) | AAA 루팅 | 장르 정체성이 탄막이 아니고 일반전은 근접 군중. 카메라는 "가깝다·위에서 본다" 불만([GAME_STUDY/poe2 §7](GAME_STUDY/poe2.md)) | [mein-mmo](https://mein-mmo.de/en/path-of-exile-2-throws-you-into-boss-fights-that-are-reminiscent-less-of-diablo-4-and-more-of-dark-souls,1167623) · [Icy Veins 릴리트](https://icy-veins.com/d4/news/how-to-beat-echo-of-lilith-diablo-4/) |
| **황천(黄天逆途)** | 탑다운 3D, 초기 "아이작·건전 계열" → ARPG 중심 | 상세 미확인 | 상세 미확인 | 분위기 기준작. 루팅·탄막 세부는 공개 자료 0 | [GAME_STUDY/downfall_of_yellowsky §5](GAME_STUDY/downfall_of_yellowsky.md), [codex_yellowsky_cn](GAME_STUDY/codex_yellowsky_cn.md) |

**결론.** 탄막+루팅은 **2D 픽셀 로그라이트**에서 이미 성립한 조합이고(Death Must Die가 가장 가깝다), AAA 루팅 ARPG는 탄막을 **보스 양념**으로만 쓴다. 다음 네 가지를 동시에 가진 게임은 찾지 못했다.

1. **영구 장비 ARPG 루팅**(런 리셋 없음, 슬롯 17·어픽스 티어·등급 6)과 장비 가시화.
2. **탄막에 패링 분류**가 있어 "피하기"와 "받아치기"가 갈리고, 패링 보상이 자원(`ParryRewards`: 무지개탄 패링 소재 ×2)으로 루팅 경제에 들어간다.
3. **원근 쿼터뷰(33~34°)**: 먼 적이 작게 보이고 다가온다. 탑다운 탄막 게임은 거의 전부 직교·2D라 탄 크기가 화면 어디서나 같다. 우리는 원근 때문에 **먼 탄이 작아지는 문제**를 직접 풀어야 하고(§3), 그 해법이 곧 특색이다. BH 레인도 "원근 쿼터뷰 탄막의 개발자 1차 자료는 검색에서 0건"으로 같은 공백을 확인했다([bullet_hell_quarter_view §2](GAME_STUDY/bullet_hell_quarter_view.md)). 가장 가까운 3D 사례는 Returnal(3인칭, 탄을 크고 발광하는 구체로 거리와 무관하게 읽힘)과 Nex Machina(탑다운, 어두운 단색 바닥 + 네온 탄)다.
4. **3D 월드(실제 조명·안개) + 저해상도 픽셀 캐릭터**(HD-2D, 11-03 결정).

이 넷이 "특색"의 내용이다. 동시에 **위험**이기도 하다: 선례가 없다는 것은 "33° 원근에서 탄막이 읽히는가"를 우리가 처음 증명해야 한다는 뜻이다. 그래서 사용자 지시가 "33도로 화면을 한번 해 보고 **탄막 액션이 가능하면** 해 보자"다. 탄막 가독성 테스트(빈 바닥 합격 뒤, Core 투사체 반경·속도, 원형·나선·부채꼴, 1x·10초 영상, 1920·3840, Unity·UE 양쪽)가 이 문서의 첫 검증 관문이다.

### 1.3 이 문서가 바꾸지 않는 것

- Core 수치·판정(틱·반경·속도·확률·HP)·설계 금지(어택 티켓 없음, 무지개탄 Q 전용, `docs/2_3` 설계 불변). 바꿀 제안은 §8.2 "Core 제안 C1~C5"에만 번호로 둔다.
- 카메라 LOCK(1-1 피치 34°, 거리만 줌). 33° 실험이 합격해도 LOCK 변경은 사용자 결정(G-1).
- 매뉴얼 15개의 수치. 이 문서는 그 수치 중 정체성에 닿는 것을 **인용**하고 우선순위를 정할 뿐, 새 수치를 만들지 않는다.

---

## 2. 핵심 루프 (1장)

```
탐험(1-1 남→북 다리·양쪽 늪·고목 전경, 먼 적이 작게 보인다)
  → 교전(근접 다수 처치 + 탄막 회피·패링: 구르기 14틱 무적 / E 16틱 창 / Q 무지개탄)
    → 루팅(처치 → 등급색 기둥·이름표 → 줍기 → 획득 알림)
      → 장비 가시화(장착 즉시 몸에 반영, 1x에서 세트 구분)
        → 강해짐(어픽스·스킬·합체 → 더 큰 탄막·엘리트·보스를 받아친다)
          → 다음 구역·보스(드루이드 3목숨) → 처음으로
```

| 단계 | 플레이어가 느껴야 하는 것 | Core가 이미 정한 것 [Core] | 지금 화면 상태(코드 기준, 화면 미검증) | 책임 기둥·매뉴얼 |
|---|---|---|---|---|
| **탐험** | 어둡고 축축한 지옥 숲인데 **길과 먼 적은 읽힌다**. 북쪽 먼 적 3마리가 작게 움직이는 것이 보인다 | 1-1 시작 적 12~16마리 + 소환굴 168 총원(`Simulation.StartMobs.cs`); 이동 2.6px/틱 | 원근 카메라·클램프·보스 줌 있음(관례 A1~A3); **가림 페이드 B1 없음→60d48b0f1 병합, 화면 판정 전**; 실루엣 B2 없음 ([ARPG_CONVENTIONS §0](ARPG_CONVENTIONS_CHECKLIST_20261105.md)) | 분위기(황천)·가독성(PoE2) / [01](MANUAL/01_world_map.md)·[02](MANUAL/02_light_fog_grade.md)·[03](MANUAL/03_camera_occlusion.md) |
| **교전 — 근접** | 한 번 휘두르면 여럿이 맞고, 맞은 순간이 **밝고 짧다**. 영웅은 캔슬이 빨라 흐름이 끊기지 않는다(PBZ식), 적·보스는 무겁다(NRftW식) | 기본 공격 예비 0·휘두름 5·회복 ~35틱(`SkillRules`·MOTION §3); 히트스톱 일반 5/처치 4/큰 처치 12/패링 2/기절 5(`EnemyHurt.*`, `ParryRewards`); 포이즈 붕괴 슬로 20 | Core 히트스톱을 Runtime이 **패링 외엔 소비 안 함**(관례 D1 부분); 피격 섬광 미확인 D2 | 임팩트(PBZ)·동작 무게(NRftW) / [04](MANUAL/04_motion_player.md)·[05](MANUAL/05_motion_monster.md)·[07](MANUAL/07_combat_impact.md) |
| **교전 — 탄막** | 탄은 **색·크기·예고**로 "피할지 받아칠지"가 한눈에 갈린다. 먼 탄도 보인다. 구르기 끝 4틱의 노출과 패링 창 16틱이 몸에 익는다 | 적 탄: black 4.4px/틱·Sz 2.0·`#00aa00`, red 2.8·1.5·유도, dark 3.3·1.6, fire/water 3.2·1.6, special 3.0·2.5, 기본 3.0·1.5(`EnemyAi.cs:109-115`); 원거리 적 충전 60틱(`:775`); 드루이드 fan 속도 6·반경 16·발수 10+1.5×페이즈, 미사일 14+2×페이즈·Sz 3·유도, 지뢰 Sz 5; 플레이어 반경 15px; 구르기 18/14틱·175px; E sBash 20틱 중 창 16, Q 해제 창 12, Q 누름 패링 반경 100; 분류 `physical/magic/forbidden`, **blackBean = Q 전용·성공 시 유도 반사**(CLAUDE.md §7) | 보스 탄 전용 뷰 있음, 아군 효과 감쇠 옵션 없음(C2 부분); 일반 적 바닥 예고 드루이드 전용(E2 부분); 패링 가능 색 구분 미확인(E5). 피격 판정 `hitR = 15 + 3·Sz + 4`(Sz 1.5 탄 → 23.5px), 패링창 열리면 `collR×3 + 12`, 패링 성공 무적 25틱(`DruidBoss.Hazards.cs:220-223`, `ParryRewards.cs:14`, [BH §0](GAME_STUDY/bullet_hell_quarter_view.md)) | 가독성(PoE2)·임팩트(PBZ) / [08](MANUAL/08_vfx.md)·[06](MANUAL/06_boss.md)·[BH §6 판정표](GAME_STUDY/bullet_hell_quarter_view.md) |
| **루팅** | 처치 뒤 **기둥이 서고 이름이 뜬다**. 고등급은 소리로 멀리서도 안다. 일반은 조용하다 | 등급 가중치 일반 {65,22,9,3,1,.01} / 엘리트 {25,35,25,12,3,.03} / 미니보스 {10,25,30,25,10,.1} / 스테이지 보스 {0,0,30,50,20,.2} / 챕터 보스 {0,0,0,30,70,.7}; 드롭 수 {1,1,2,3,5}; 일반 적 드롭 확률 .45×드롭 보너스; **챕터 보스 첫 드롭은 전설 보장**; 바닥 보존 20개; 엘리트 드롭 보너스 매직 +.5/레어 +1.5/챔피언 +3(`WorldDrop.cs`, `EliteTables.cs`) | 아이콘+등급 빛기둥 있음, **바닥 이름표 없음(G1)**, 토스트 한국어 고정(G4), 엘리트 표시 없음(H2), 드롭음 없음(L-02). 계산(LT §5.1): 일반몹 처치당 장비 45%·희귀 이상 5.85%(17처치에 1)·전설 0.45%(약 220처치에 1); 1-1 드루이드(장보스) 3개 전부 희귀 이상, **전설 1개 이상 48.7%**; 챕터 보스 전설 100%. `MinPickRarity`는 표시 필터가 아니라 **생성 필터**(임계 미만은 아이템이 안 생김, `WorldDrop.cs:65`). 줍기는 R키로 화면 안 최고 등급→가까운 것(`Simulation.cs:324-336`) | 전리품(D4) / [11](MANUAL/11_loot_items.md)·[LT §2.2·§5](GAME_STUDY/loot_feel.md) |
| **장비 가시화** | 투구를 바꾸면 **1x 픽셀 렌더에서 머리가 달라 보인다**. 세트 A↔B가 실루엣으로 구분된다 | 가시 슬롯 10(weapon·shield·boots·armor·helmet·bow·gloves·pants·belt·cape), 비가시 7; 장착 이벤트 경로 `InventoryState.changed()`(CH §0.1) | **없음**(11 §3.4 "장비 시각화 없음"). CH 레인 C1~C5 실습 대기 | 전리품(D4)·캐릭터 / [CHARACTER_PIPELINE](MANUAL/CHARACTER_PIPELINE_20261105.md) |
| **강해짐** | 어픽스·스킬·합체가 "다음 탄막을 받아칠 수 있다"로 돌아온다 | 어픽스 풀·티어(`DropTablesData`), 스킬 6슬롯·레벨 20(`SkillRules`), 패링 보상(무지개탄 ×1.5 자원·소재 2000) | 툴팁 비교 있음(G5), 줍기 필터 있음(G3) | 전리품(D4) / `2_1`·`7`·`14` SSOT |
| **보스** | 막을 수 있는 연타 → 피해야 하는 마무리(DANGER) → 큰 빈틈. 3목숨마다 몸이 작아진다 | 리모델 드루이드 3목숨 HP 100/60/40%·크기 ×1.0/.85/.70, 12기술 예고 24~90틱, 막기 가능 slashCombo·slam·charge·tideWave, 기술 간격 45/36/30(`DruidRemodelData.cs`) | 바닥 예고·보스바·등장 있음(E1·H3·H4) | 동작 무게(NRftW)·임팩트 / [06](MANUAL/06_boss.md)·[13](MANUAL/13_cinematics.md) |

루프의 **한 바퀴 길이**는 데모 v0 목표 "1-1 한 판 10~15분, 크래시 0"(CLAUDE.md §1)이다. 루프 안에서 가장 약한 고리는 코드 기준으로 **장비 가시화(없음) → 바닥 이름표(없음) → 히트스톱 소비(없음) → 가림(판정 전)** 순이고, 이것이 §6 목표 경험을 못 만드는 직접 원인이다.

---

## 3. 33° 원근이 각 요소에 요구하는 것

원근 쿼터뷰의 물리: 화면 px ≈ 월드 u × 75 px/u(1080p·16.5u·FOV 46.9453° 근사, [MANUAL/03 §3.2](MANUAL/03_camera_occlusion.md)); 깊이가 2배면 픽셀 높이는 절반(`h_px = f·h/z`, [codex_3d_pixel §2](GAME_STUDY/codex_3d_pixel.md)); 피치 34°에서 높이 h의 화면 투영 ≈ 0.829h, 바닥 길이 l의 투영 ≈ 0.559l([MANUAL/02 §3.5](MANUAL/02_light_fog_grade.md)); 화면 위쪽 광선은 낮은 안개층을 더 오래 통과하므로 **안개 표면 높이가 아니라 시선 경로 투과율**로 판정한다([codex_urp_mood §10](GAME_STUDY/codex_urp_mood.md)).

| 요소 | 원근이 만드는 문제 | 요구(합격선) | 수치·근거 | 상태 |
|---|---|---|---|---|
| **먼 적** | 북쪽 적은 작고(키샷 안 2에서 발 y 25~32%, 높이 2~4%H [추정]) 안개·어둠·비네트에 먼저 묻힌다 | 어떤 연출(안개·가림 투명화·비네트·어둠·HUD·드롭 기둥·VFX)도 먼 적을 지우지 않는다. 발 y 20~35% 띠에 적 3마리 이상 | **M-FAR**: 안개 ON/OFF ΔL* 비율 ≥0.70 AND ΔL*(ON) ≥20, 3마리 각각 최저값([MANUAL/02 §3.2](MANUAL/02_light_fog_grade.md)); `MON-FAR-01` 가장 먼 깊이에서 가족 3종을 1x 무음 영상으로 맞힘([05 §6](MANUAL/05_motion_monster.md)) | [문서] 정본. 실측 전 |
| **탄(투사체)** | 먼 탄은 작아지고, 바닥에 붙은 탄은 바닥과 분리가 안 되며, 겹치면 경계가 사라진다. 2D 탄막의 "탄 크기 일정" 전제가 깨진다 | ① 탄 중심·윤곽·진행 방향·피해 경계·영웅 발밑이 보호 정보([08 §2-11](MANUAL/08_vfx.md)) ② 가는 탄은 **최소 화면 두께·경계**부터 고치고 정지 확대로 합격 금지(08 §3.5) ③ 색만으로 구별 금지, 흑백에서도 방향·접점이 읽힘(08 §6) ④ 정렬 큐 **적 예고 > 적 탄 > 플레이어 피격 > 플레이어 타격 > 장식**([phantom_blade_zero §10](GAME_STUDY/phantom_blade_zero.md)) ⑤ VFX 외곽과 Core 판정 원 오차 ≤1텍셀, 3깊이(08 §3.3) ⑥ 예고는 두 색만: 막을 수 있음 뼈색 `#efe6d2` / 피해야 함 무지개 DANGER 링, **빨강 금지(빨콩 혼동)**(08 §2-2) | **BH 판정표 초안([bullet_hell_quarter_view §6](GAME_STUDY/bullet_hell_quarter_view.md), 최소/목표):** A-1 먼 탄 핵 지름 ≥8/12px · A-2 가까운 탄 ≥16/20~28px · A-3 그림 반경 ≥ 판정 `3·Sz+4`(그림 = 판정 ×1.2~1.5) · A-4 먼/근 크기비 ≥0.5/0.6(미달 시 거리 보정 렌더) · A-5 모든 적탄에 접지 점 ≥4/6px · B-1 탄 간 통로 ≥2×hitR = 47px(Sz 1.5)/60px 월드 · B-2 구르기로 넘는 탄 벽 ≤175−2×hitR = 128/100px · B-3 동시 적탄 ≤40/30 · B-4 먼 통로 화면 폭 ≥30/40px · C-1 탄 핵 vs 바닥 ΔL* ≥30/45 · C-2 적탄 vs 아군탄 색상각 ≥90°/120° · C-3 패링 분류 3종 표식(물리 따뜻한 단색·실선 / 마법·무지개 테두리+흰 핵 / 금지 어두운 보라·점선) + 발사 섬광 3종 · C-4 안개·비네트 뒤 먼 탄 ΔL* ≥25/35 · C-5 점 0 · D-1 충전 링 60틱이 먼 적에서 ≥2/3px 선 · D-2 예고→첫 피격 ≥30/45틱 · D-3 체공 ≥24/40틱 · D-4 유도탄 트레일 ≥2×지름 · D-5 10초 영상에서 탄이 장판으로 오해되는 컷 0. 한 줄이라도 최소 미달이면 FAIL, 전부 통과 + "Hades·Returnal 옆에 놓아도 읽히는가" 눈 판정. 해법 4가지(BH §2): 거리 보정 하한, 접지 점+고정 높이, 밝은 핵+어두운 테두리 2층, 탄은 안개·가림 제외 최상위 레이어 | [문서] 초안, 미검증 11건. 채택 여부 G-5 |
| **발밑·접지** | 원근에서 탄·장판이 "떠 보이면" 어느 바닥 칸이 위험한지 모른다 | 지면 예고·장판은 월드 Decal로 바닥에 붙이고, 캐릭터 부착 효과만 저해상도 경로(D08-4); 발밑 원은 어떤 상태에서도 사라지지 않음, ZTest Always([03 §2-9·§3.5](MANUAL/03_camera_occlusion.md)) | [문서] | 결정 대기 ★D08-4 |
| **가림** | 남쪽 전경 고목·덤불이 영웅을 덮는다 | 1단계 알파 페이드(0.30, 사라짐 0.15초·돌아옴 0.30초, 디더 금지) → 2단계 가려진 부분만 은빛 실루엣(`--sv-lt`, 알파 0.65). 가림 해제 뒤에도 먼 적·바닥 예고가 남아야 함 | [03 §3.3·3.4](MANUAL/03_camera_occlusion.md); 관례 B1·B2 | B1 병합(화면 판정 전), B2 없음 |
| **전리품 이름표·기둥** | 기둥이 높으면 먼 적 구역을 가리고, 라벨이 원근 바닥 위에서 겹친다 | 기둥은 낮고 가늘게, 화면 위쪽 1/3에서 기둥 알파 ≤.5, 먼 적 가림 면적 0; 라벨은 화면 좌표 정렬(세로 밀기 최대 4단 → 2열 → 접기), 20개 혼잡·최장 번역명 겹침 0; 표시 기본 = 희귀 이상 + 가까운 5개, Alt로 전부 | [11 §3.2·§6](MANUAL/11_loot_items.md); LT 제안 6-3 "드롭 직후 3초 자동 표시(희귀 이상)", LT §8 "탄막 판정 장면에 바닥 드롭 20개 혼잡 컷 1장 포함" | 이름표 없음(G1). LT 제안은 매뉴얼 11 반영 대기 |
| **HUD** | 하단 HUD가 높으면 남쪽(가까운) 전투를, 상단 요소는 먼 적을 가린다 | 하단 한 덩어리, 판 ≤7%, 틀 포함 점유 ≤23%(C r2 예외 ★D09-16); **먼 적·탄막이 HUD보다 먼저 보임(F6)**; HUD 끄기 가능; 중첩 창은 90% 미만(전체 화면 창 예외) | [09 §2-3·§6](MANUAL/09_hud.md), [10 M8](MANUAL/10_menus.md) | C r2 미구현, H4 C 화면 미검수 |
| **영웅·몬스터 동작** | 전후(남북) 베기는 투영 폭이 작아지고, 먼 깊이에서 예비동작 정점이 픽셀 깜빡임에 지워진다 | 근·중·원 3깊이에서 단색 실루엣으로 읽힘; 예비 정점 외곽 ≥4텍셀(보스 6); 발 이동 ≤1텍셀 | [04 §2-11·2-15](MANUAL/04_motion_player.md), [05 §2-12](MANUAL/05_motion_monster.md) | MO_BASELINE 두 경로 모두 불합격 |
| **보스 아레나 카메라** | 큰 보스·장판을 담으려고 피치를 바꾸면 LOCK 위반 | 피치 34.0° 불변, 거리만 16.5u 유지 + 대기술 때 +8~15%·0.4~0.6초(D03-4/D06-2); 아레나 먼 가장자리 적·소환체가 보임 | [03 §3.1](MANUAL/03_camera_occlusion.md), [06 §6](MANUAL/06_boss.md) | 줌 수치 〔재확인〕 |
| **안개·후처리** | 분위기를 올리는 수단(안개·비네트·어둠)이 모두 먼 적을 먼저 지운다 | 높이 안개 기본, **거리 안개 끔**(키샷 1회 시험 후 ΔL<70%면 즉시 끔), 비네트 ≤0.2이고 위 25% 띠 0, DoF·틸트시프트·그레인·색수차 금지, 노출 고정 | [02 §2-4·§7](MANUAL/02_light_fog_grade.md), [downfall_of_yellowsky §1.5 C1~C9](GAME_STUDY/downfall_of_yellowsky.md) | 현 코드 청록 안개 → 색 결정 ★D02-1 |
| **픽셀 캐릭터 합성** | 저해상도 RT와 원근 월드의 깊이가 어긋나면 고목 뒤 캐릭터가 앞에 그려진다 | 1텍셀 = 1080p 1px(`NativeRigPixelPolicy`), 정수 확대, 색·깊이·ID의 카메라 행렬 일치, 실루엣이 고목 깊이를 받는지 Mac 시험(★D03-9) | [codex_3d_pixel §3](GAME_STUDY/codex_3d_pixel.md), [CH §1.5](MANUAL/CHARACTER_PIPELINE_20261105.md) | K7 실험 대기 |

**33° 실험이 답해야 하는 것(사용자 지시 순서):** 빈 바닥(지면 재질·주광·높이 안개·노출 고정·카메라 33°) 합격 → 고목 1그루 → 캐릭터 대역 → **탄막 가독성 테스트**(Core 투사체 반경·속도 그대로, 원형·나선·부채꼴, 1x 컷·10초 영상, 1920·3840, Unity·UE 양쪽, 판정 사용자). 이 테스트의 판정표가 BH 산출물이고, 통과 전에는 §1의 "특색"은 가설이다.

---

## 4. 기둥 5개와 합격 기준 1줄

충돌 우선순위: **가독성 > 임팩트 > 전리품 > 동작 무게 > 분위기**(§0). 레퍼런스는 "공통점이 정답"이다(CLAUDE.md §4.1). 한 게임의 에셋·코드·수치는 반입하지 않고, 아래 "안 배우는 것"은 그 게임을 따라 하면 우리 LOCK이나 설계 금지와 충돌하는 항목이다.

| # | 기둥 = 기준작 | 배우는 것 | 안 배우는 것(충돌) | **합격 기준 1줄** | 근거·상태 |
|---|---|---|---|---|---|
| 1 | **분위기 = 황천(Downfall of Yellowsky)** | 어둡고 사실적인 3D 위의 강한 광영 대비, 입자 많은 전투광, 고정 탑다운에 집중된 특효, 단일 모티프 일관성(→ 실버 헬로 치환) | 흐림·이펙트와 인물·배경 섞임(공개 비판), 회색 적, 느린 이동, 사용자 시야 거리 조절(v0 없음), "UE5라서 Lumen" 추론 | **사용자가 지정한 황천 캡처 3~5장(D02-5) 옆에 1-1 키샷을 같은 크기로 놓았을 때 "같은 계열의 분위기"라고 사용자가 말하고, 그 상태에서 M-FAR가 통과한다.** | [MANUAL/02 §0·§6 MOOD-CMP](MANUAL/02_light_fog_grade.md); [downfall_of_yellowsky §0·§1.5](GAME_STUDY/downfall_of_yellowsky.md). **광원·안개·색 공개 수치 0건**, 엔진 UE5는 2024 자기 신고 1건 → 수치는 전부 [기준]·[추정] |
| 2 | **가독성 = PoE2(+D4)** | 광원 역할 3분할(키·영웅 빛·장소), "어둡다" 불만은 실패, 적 예고가 항상 플레이어 VFX를 이김(테두리 2~3px·채움 ≤35%, 가림 ≤60%), 높이 안개·거리 안개 끔, 노출 고정 | PoE1식 화면 가득한 탄·파티클, 가까운 카메라(PoE2·D4 공통 불만), Radiance Cascades 자체(우리는 APV) | **10초 정상 속도 무음 영상에서 영웅·가장 가까운 적·탄의 위치와 다음 공격 방향을 먼저 말할 수 있고, 먼 적 3마리가 M-FAR를 통과하며, 흑백으로 바꿔도 탄의 방향·접점이 읽힌다. 탄은 BH 판정표 A~D의 최소선을 한 줄도 빠짐없이 넘는다.** | [GAME_STUDY/poe2 §0 R1~R7](GAME_STUDY/poe2.md); [MANUAL/02 READ-CMP](MANUAL/02_light_fog_grade.md); [08 §6](MANUAL/08_vfx.md). 출처 S12a·S15a 접속불가, 수치는 [제안] |
| 3 | **전리품 = D4(+PoE2·Last Epoch 공통)** | 드롭 오디오 3시점(드롭/호버/잔류), 희귀도는 색 하나가 아니라 색+기둥+이름 글자+소리, 아이콘 배경 탈채도+테두리 장식, 필터 "안 나옴 vs 숨겨짐" 구별, 비교 툴팁 명시 조작 | D4 Mythic 기둥 수치(미공개) 끌어오기, 세 ARPG의 흰/파랑/노랑 하위 색(우리 회/초록/파랑 유지 ★D11-8), 희귀도 색을 몸에 입히기(CH 6-4) | **20개 드롭이 깔린 바닥을 회색 변환해도 등급 순서가 읽히고, 이름표가 겹치지 않으며, 눈을 감고 일반 드롭과 유니크 드롭을 소리로 구분한다(L1·L2·L8). 1-1 보스 처치 장면에서 드롭 3개의 등급이 회색 캡처에서도 구별되고 전설이 있으면 1x에서 먼저 눈에 든다(LT 6-9). 그리고 주운 투구가 1x 픽셀 렌더에서 머리 실루엣을 바꾼다(CH C3; 1-1 완성 범위 = 가시 방어구 8슬롯×tier 3단 24파트 + 무기 7 + 석궁 3 = 34메시, LT §3.3).** | [MANUAL/11 §6 L1~L10](MANUAL/11_loot_items.md); [codex_menus_loot §2·§6](GAME_STUDY/codex_menus_loot.md); [CH §1.5](MANUAL/CHARACTER_PIPELINE_20261105.md). D4 이름표 RGB·기둥 높이·수명·드롭음 길이 전부 미확인; 절대 드롭 수치는 어느 게임도 비공개라 우리 Core에서 계산([loot_feel §1·§5](GAME_STUDY/loot_feel.md)) |
| 4 | **임팩트 = Phantom Blade Zero** | 끊기지 않는 흐름(Core 캔슬 틱에 클립을 버림, 블렌드 아웃 ≤3틱), 예고 두 색(파랑/빨강 → 우리 뼈색/DANGER), 막기·회피·완벽 패링을 동작·소리·빛 세 채널로 벌림, 밝음은 접점에만(C-CORE 5틱) | 히트스톱 "거의 없음"을 그대로(PBZ도 "접촉이 약하다" 비판 → 우리는 Core 히트스톱 소비 + 히트 플래시 2~3틱), 잉크·먹선 본체, 무기 교체 콤보, 트레일러 푸시인 | **1x 10초 무음 영상만 보고 막기와 완벽 패링을 10/10 구분하고, 최악 중첩 장면(아군 반복 공격+궁극기+적 장판+탄)에서 먼 적과 적 예고가 그대로 읽힌다.** | [GAME_STUDY/phantom_blade_zero §0 규칙 1~10](GAME_STUDY/phantom_blade_zero.md); [MANUAL/07 §3.1b·§6](MANUAL/07_combat_impact.md). PBZ 프레임 데이터 공개 없음(★D07-4 등급 하향) |
| 5 | **동작 무게 = No Rest for the Wicked** | 적·보스의 무게 있는 예비동작·끝까지 가는 공격·큰 동작 뒤 빈틈(M1~M7), 애니메이션 주도 전투·무기 무게, 보스는 밀리지 않음 | 플레이어까지 무겁게(플레이어는 PBZ식 빠른 캔슬 — 충돌 없음, [PBZ §2.3](GAME_STUDY/phantom_blade_zero.md)), 스태미나식 공격 제한(어택 티켓 금지), Wwise 도입 | **드루이드 슬램·3연 휘두름·전환 10초 무음 영상 3편에서 예비→발동→빈틈이 영상만으로 읽히고, NRftW 공개 영상과 같은 크기로 나란히 놓아도 "같은 체급의 무게"로 보인다(사용자). 영웅 idle·walk·attack1은 채점표 7항목 중 ○ 6 이상.** | [MANUAL/06 §1·§6](MANUAL/06_boss.md); [BRIEF_MOTION §5](worklog/cloud-lanes/BRIEF_MOTION_PIPELINE_20261105.md); [MO_BASELINE](MANUAL/MO_BASELINE/MO_BASELINE_20261105.md) 현재 두 경로 모두 불합격. **NRftW 프레임 실측은 어느 연구 문서에도 없음**(80.lv 원문 Mac 열람 대기) → G-2 |

공통 판정 방법(전 기둥): 1920×1080 + 3840×1080, 1x·3x 크롭(3x 점 0), 10초 무음 영상, 레퍼런스는 블러로 구도만 전달한 같은 크기 비교판, 판정은 Mac, "RETOUCH는 PASS가 아니다"(CLAUDE.md §4.1·§4.2, [WORK_QUALITY_STANDARD](WORK_QUALITY_STANDARD_20261029.md)).

---

## 5. 하지 않을 것

### 5.1 설계 금지 (사용자 확정, CLAUDE.md §7)
1. 어택 티켓(동시 공격 제한)을 구현하지 않는다. 핵앤슬래시다. 성능 예산을 "동시 적 수·가시 리그 수·공격 수 제한"으로 맞추지 않는다([15 §7](MANUAL/15_performance_budget.md)).
2. 무지개탄(blackBean)은 Q(sBlock·해제·peaceShield)로만 패링한다. E(sBash)로는 불가. `parryClass='magic'`, Q 성공 시 블루콩 유도 반사. E 패링 성공 연출을 무지개탄에 붙이지 않는다.
3. `docs/2_3 돌진+패링+방패시스템/`의 설계(판정·수치·공식)를 고치지 않는다.

### 5.2 카메라·화면
4. 피치를 바꾸지 않는다(1-1 LOCK 34°; 33°는 실험). 줌은 거리만. 마우스 휠 줌·회전 흔들림·FOV로 줌 흉내 없음. 비ForestA2 값(48.7°·14u) 반입 금지([03 §7](MANUAL/03_camera_occlusion.md)).
5. 먼 적을 지우는 것 일체: 거리 안개, 비네트(위 25% 띠), 어둠, 가림 투명화, 드롭 기둥, HUD 꼭대기, VFX 접점 빛, 전경 덤불 배치. 이것은 모든 매뉴얼의 공통 FAIL이다.
6. DoF·틸트시프트·색수차·자동 노출·그레인·노이즈·디더·점묘·스크린도어 컷아웃. 3x 크롭에서 점 0(CLAUDE.md §4.2-7).
7. 전체 노출을 내려 분위기를 대신하기. 순흑 면적(UI 제외) 0%.
8. 사용자 시야 거리 조절은 데모 v0에 넣지 않는다(★D03-8).

### 5.3 전투·탄막·임팩트
9. 새 시간 정지·슬로모션을 추가하지 않는다(11-03 R3). `Time.timeScale` 금지. 보스 처치 슬로 미도입(★D13-10). 기존 Core 히트스톱 신호만 소비하고 합산하지 않는다.
10. 예고에 빨강(빨콩 혼동)·네온·시안·호박색·황록(독·바닥과 같은 색)을 쓰지 않는다. 예고 색은 두 가지뿐.
11. 색만으로 아군/적·속성/대응 행동을 구별하지 않는다. 흑백에서도 읽혀야 한다(XAG 103 취지).
12. 숨긴 공격을 만들지 않는다. 예고를 Core 구간보다 짧게(TeleM<1)·길게(Core 변경) 만들지 않는다(★D06-7은 Core 제안 올리지 않음).
13. 렌더 순서만으로 가독성이 해결됐다고 주장하지 않는다. 판정은 최악 중첩 장면·실제 속도·무음.
14. 탄막 밀도·탄 수를 Core 밖에서 "감축"하지 않는다. 줄이는 것은 장식(잔여→연무→중복 발광→보조 입자)뿐. 공정성은 Core 밖 밀도 상한(BH B-3 동시 적탄 ≤40)으로 판정하되, 넘으면 성능이 아니라 가독성 FAIL로 기록한다.
14b. 층을 섞지 않는다: **적탄은 공중·최상위 레이어·안개 제외·가림 투명화 제외, 아군 효과는 바닥**(D4 워락 장판·PoE2 장판 혼동 실패 사례, [BH §4](GAME_STUDY/bullet_hell_quarter_view.md)). 탄 그림을 판정보다 작게 그리지 않는다(판정 ≤ 그림, 동방·Gungeon 공통).

### 5.4 전리품·UI
15. 등급을 색 하나로만 말하지 않는다. 라벨 판 전체를 등급색으로 칠하지 않는다(색은 이름 글자에만). 일반 등급에 화려한 연출을 주지 않는다.
16. 원색 초록·노랑 텍스트, 금·황동 틀, 이모지 아이콘, 산세리프 단독·시스템 폰트, 4방향 외곽선, 검은 판·블러 채움(CLAUDE.md §4.2, 실버 헬).
17. 한국어 고정 문자열을 남기지 않는다. 표시 텍스트는 29개 언어 목록에 등록한다(CLAUDE.md §8).

### 5.5 제작 방식
18. AI 3D 생성 메시(Meshy·Tripo)를 자산 기본형으로 쓰지 않는다(11-05 09:30). 생성 도구는 콘셉트 탐색 이미지까지. PixelLab 캐릭터 생성, 스크립트 키(bpy) 애니메이션, 모캡 그대로, 자동 리그 결과 그대로 금지.
19. 레퍼런스 게임의 에셋·코드·게임 파일 분석·프레임 캡처 도구·영상 반입 금지. 공개 자료만, 출처 2개 이상만 사실.
20. 한 게임만 따라 하지 않는다. 트레일러·홍보 카메라를 플레이 카메라 변경 근거로 쓰지 않는다(PBZ 푸시인 정정).
21. "웹 먼저 고치고 Unity 이식" 절차를 쓰지 않는다. 웹은 규칙 oracle이다(11-03).
22. 관문(브리프→블록아웃→형태→재질→반입→Mac 판정)을 건너뛰어 "일단 넣고 나중에" 하지 않는다. 같은 방법 2회 FAIL이면 방법을 바꾼다. 비교판 없는 "완료"는 미검증이다.
23. 도구 사용 매뉴얼(`MANUAL/TOOLS/<도구>.md`, 실습 기록 포함) 없이 그 도구를 제작에 쓰지 않는다(11-05 09:50).

---

## 6. 목표 경험 — 첫 60초 · 첫 보스 · 첫 전설 드롭

세 장면 모두 "현재 Core가 만들어 내는 사건" 위에 "표현이 보장해야 하는 체험"을 얹은 것이다. 시간은 60fps 틱 기준이며 연출 길이는 전부 [추정] 시작값이다([13 §3](MANUAL/13_cinematics.md)).

### 6.1 첫 60초 (타이틀 → 1-1 첫 교전)

| 시각 | 플레이어가 보고 듣는 것 | 보장하는 규칙·수치 | 근거 |
|---|---|---|---|
| 0~10초 | 어둠 속 가운데 로고, 몇 줄의 글자 메뉴, 32:9까지 이어지는 큰 원화/영상. 세리프 글자, 은빛 강철 | "큰 메인 이미지에 깔끔한 UI", 검은 판·블러 0, 입력 반응 ≤0.2초, 자막 설정은 첫 음성 전 | [10 §1·§3.2](MANUAL/10_menus.md), [13 §3.6·§3.8](MANUAL/13_cinematics.md) |
| 10~25초 | 로비: 화면 50~70%가 캐릭터와 장면, 가장자리 그라데이션 위 목록, ENTER 하나. 캐릭터 선택 = 영웅 선택 | 로비·캐릭터 선택을 첫인상으로 앞당김(D10-5). 접속·로드 대기는 연출 시간에 넣지 않음 | [10 §3.2](MANUAL/10_menus.md) |
| 25~35초 | 로딩(원화+팁, 감시 20초) → **1-1 남쪽 다리 위**. 축축한 숲, 빛 웅덩이 2~4곳, 늪 위 낮은 안개. 북쪽 멀리 **작은 적 3마리가 움직인다** | 키샷 구도안 2: 영웅 발 (50,60)%, 후속 적 발 (48~55,25~32)%, 높이 2~4%H; M-FAR 통과; HUD 판 ≤7% | [01 §3.1](MANUAL/01_world_map.md), [FIRST_SCENE_PLAN §2](MANUAL/FIRST_SCENE_PLAN.md) |
| 35~50초 | 가까운 적 2마리(다안 육괴, etype 4)가 다가온다. 첫 휘두름: 적이 **은백 섬광 2~3틱**, Core 히트스톱 5틱, 숫자 은백. 적 하나 처치 → 4틱 정지, 쓰러짐 0.4~0.7초 | Core: 기본 공격 휘두름 5틱·회복 ~35틱; 히트스톱 일반 5/처치 4; 숫자 0.8초·치명 1.3배 | [07 §3.1b·§3.2](MANUAL/07_combat_impact.md), `Simulation.StartMobs.cs` |
| 50~60초 | 원거리 적이 **60틱 충전**(팔 끝 섬광, 바닥 표시) → 탄 하나가 날아온다. 플레이어는 구르기(18틱, 앞 14틱 무적)로 피하거나 E(20틱 중 16틱 창)로 받아친다. 받아치면 스파크 80~130·금속음. 첫 드롭: 일반 아이템은 조용히 바닥에, 고급이면 낮은 초록 기둥 70% | Core: 원거리 적 사거리 400·쿨 240·충전 60틱, 기본 탄 3.0px/틱·Sz 1.5·속성색 → 400px 도달 133틱(2.2초, BH D-3 ≥24틱 충족); 피격 반경 23.5px; 드롭 확률 .45·가중치 {65,22,9,3,1,.01}; 기둥 높이 0/70/80/90/100/100% | `EnemyAi.cs:109-115,775`, `WorldDrop.cs`, [11 §3.2](MANUAL/11_loot_items.md) |

**60초의 합격:** 플레이어가 묻지 않아도 ① 어디로 가는지(북쪽 다리) ② 무엇이 오는지(먼 적 3) ③ 탄을 피할지 받아칠지(색·예고) ④ 무엇이 떨어졌는지(기둥·이름표)를 안다. 지금 ④의 이름표와 ③의 패링 가능 색 구분은 **없음**(관례 G1·E5).

### 6.2 첫 보스 — 1-1 다크 드루이드 (리모델 3목숨)

| 구간 | 체험 | 규칙·수치 [Core]·[문서] |
|---|---|---|
| 진입 | 아레나 문이 닫히고 카메라가 **거리만** 0.6초 늘어난다(피치 34° 그대로). 보스가 천천히 걸어 들어와 멈추고 포효, 이름·HP바(2.0초 연출). 등장 ≤240틱, 스킵 가능 | [13 §3.1](MANUAL/13_cinematics.md), [06 §3.4](MANUAL/06_boss.md) |
| 첫 교전 | 이름·HP바 표시부터 조작 가능, 첫 예비동작까지 ≥60틱의 정적. 보스는 영웅의 ~2.8배, 걷기는 플레이어의 40~50%, 밀리지 않는다 | [06 §2-9·2-10](MANUAL/06_boss.md) |
| 리듬 | **막을 수 있는 연타(뼈색 예고, slashCombo 1·2타, 예고 32/24틱) → 피해야 하는 마무리(DANGER 링, 3타) → 회복 80틱의 빈틈**(막기 성공 시 +30틱, 머리 낮춤·발광 ×0.5). 슬램 예고 48틱·반경 140px, 부채꼴 탄 10+발·속도 6, 조수 파동(막기 가능), 무지개탄은 Q로만 | `DruidRemodelData.cs`, [06 §3.1](MANUAL/06_boss.md), [PBZ §5](GAME_STUDY/phantom_blade_zero.md) |
| 목숨 전환 | HP 100→60→40%, 몸 ×1.0→.85→.70, 전환 120틱(무릎→축소→등 뿌리 노출→뿌리 3타→재기립), 기술 간격 45→36→30틱으로 빨라진다 | `DruidRemodelData.cs`(D06-1 3목숨) |
| 처치 | Core 큰 처치 히트스톱 12틱 그대로(새 슬로 없음), 침강 ≤180틱(피·파편 없음), 출구 표시 | [13 §3.1](MANUAL/13_cinematics.md), ★D13-10 |
| 드롭 | 스테이지 보스 가중치 {0,0,30,50,20,.2}·3개 → **희귀 30%/영웅 50%/전설 20%**. 전설 기둥 100%·HDR ≤3·장식음 | `WorldDrop.cs`, [11 §3.2](MANUAL/11_loot_items.md) |

**합격:** 10초 무음 영상 3편(슬램·3연·전환)에서 예비→발동→빈틈이 읽히고, 1x에서 막기와 완벽 패링이 소리 없이 구분되며, 아레나 먼 가장자리의 소환체가 안개·비네트에 지워지지 않는다. 연타 변주(2/3/4)는 Core에 없다 → Core 제안 C3.

### 6.3 첫 전설 드롭

| 단계 | 체험 | 규칙·수치 |
|---|---|---|
| 떨어지는 순간 | 처치 지점에서 포물선 0.3~0.4초 + 바운스 1회 6px. **금빛(채도 낮춘 `#ffaa00`, D11-2) 기둥이 1.0초 동안 100%로 서고** 낮은 금속 공명 1음 + 꼬리(일반·고급 드롭음과 다른 층) | [11 §3.2·§3.4](MANUAL/11_loot_items.md) |
| 지속 | 기둥 40%로 내려가 멀리서도 보이되 위쪽 1/3에서 알파 ≤.5(먼 적 보호). **이름표는 희귀 이상 상시**(D11-3), 등급색 글자 Hahmlet 18px, 무채색 판 | 같은 문서 |
| 줍기 | 줍기 반경 안에서 라벨 밝기 +20%, 획득 토스트 1.8초(번역 등록), 툴팁은 착용품과 ▲▼ 비교(150ms + 고정 키) | 같은 문서 §3.3 |
| 장착 | 장착 즉시 **몸에 보인다**(가시 슬롯 10). 전설은 세트 매핑표로 실루엣이 달라지고 1x에서 구분(XOR ≥8% [미검증]) | [CH §1.4·§1.5·§6-3](MANUAL/CHARACTER_PIPELINE_20261105.md) |
| 언제 오는가 | **Core 보장은 챕터 보스 첫 드롭뿐**(`rarity = 4 if ChapterBoss && di == 0`). 1-1 드루이드(장보스)는 3개 부채꼴 전부 희귀 이상, 전설 1개 이상 **48.7%**; 일반 적은 약 220처치에 1(LT §5.1). 전설·유니크 효과는 Core에 미연결(IA B-01, LT L-10)이라 지금 "첫 전설"은 숫자 7개다. 데모 1-1 한 판(10~15분)에서 보장할지는 Core 제안 C4(=LT-D1)·열린 결정 G-11 | `WorldDrop.cs`, [LT §5·§8](GAME_STUDY/loot_feel.md) |

**합격(L8):** 눈을 감고 일반 드롭과 전설 드롭을 소리로 구분한다. 회색 변환 캡처에서도 전설 기둥이 가장 높고 넓다. 장착 뒤 1x 비교판에서 "다른 장비를 입었다"가 보인다.

---

## 7. 열린 결정 목록 (사용자)

정체성에 직접 닿는 것만 올린다. 매뉴얼 결정 코드 전체는 [MANUAL/00_INDEX §3](MANUAL/00_INDEX.md)(★ 충돌 먼저 → 💰 → 나머지, 〔재확인〕 18건)에 있고, 그 목록을 여기서 반복하지 않는다. 추천이 있는 것은 첫 줄에 적었다. **이 문서는 결정하지 않는다.**

| # | 결정 | 선택지 | 추천·메모 | 연결 |
|---|---|---|---|---|
| G-1 | **"33도"와 LOCK 34°** — 정체성 문장의 33°는 실험 표기인가, LOCK을 33°로 바꾸는 것인가 | A) LOCK 34° 유지, 33°는 빈 바닥·탄막 실험 표기로만 / B) 실험 합격 시 LOCK을 33°로 개정(1-1 구도 전부 재판정) | A 추천. 1° 차이는 투영 ≈0.4% 차이로 구도 재판정 비용 대비 이득이 없다. 실험 캡처에 두 값 병기 | [DIRECTION_RESET 14:40](DIRECTION_RESET_20261105.md), [03 §3.1](MANUAL/03_camera_occlusion.md) |
| G-2 | **동작 무게 기둥의 판정 근거** — NRftW 프레임 실측이 어느 문서에도 없다 | A) 감각 원칙 M1~M7 + 10초 영상 같은 크기 비교로 판정(현행) / B) Mac에서 공개 영상 관찰 메모(프레임 계수 도구 없이) 1회 뒤 판정 | B 추천(공개 영상 관찰은 허용, 캡처 도구·반입은 금지) | [06 §9](MANUAL/06_boss.md), GAME_STUDY 추출 §2-d |
| G-3 | **표현 히트스톱(기둥 4 vs 기둥 1 충돌)** | A) PBZ 문서: Core 정지 0 + 대상 1 포즈 홀드 ≤2틱 + 히트 플래시 필수(D07-1 A) / B) 황천 문서: 표현 히트스톱 0.06~0.09초 / C) D4: 경타 2~3·강타 4~6틱 | A 추천. §4 우선순위(임팩트 > 분위기)와 R3(새 정지 없음)에 맞고, 기존 Core 히트스톱 5/4/12는 그대로 소비 | [07 §3.1](MANUAL/07_combat_impact.md), [downfall_of_yellowsky §3](GAME_STUDY/downfall_of_yellowsky.md) |
| G-4 | **예고 두 색 문법 확정** — 뼈색(막을 수 있음)/무지개 DANGER(피해야 함) + 색약 대응 | A) 두 색 + 형태·밝기·움직임 차이로 색약 대응(옵션 없음, v0) / B) 색약 팔레트 교체 옵션(K8) v0 포함 | A 추천(v0), K8은 출시 전 | [08 §2-2](MANUAL/08_vfx.md), [ARPG_CONVENTIONS E5·K8](ARPG_CONVENTIONS_CHECKLIST_20261105.md) |
| G-5 | **탄 가독성 판정표 초안(BH §6 A~D) 채택** — 33° 탄막 테스트의 최소선으로 쓸지 | A) 초안 그대로 최소선 채택, 목표값은 Mac 실측 뒤 개정 / B) 항목 축소(A·C만) | A 추천. 미검증 11건은 전부 레퍼런스 쪽이고 우리 기준은 Core 값에서 계산됐다 | [bullet_hell_quarter_view §5·§6](GAME_STUDY/bullet_hell_quarter_view.md) |
| G-6 | **바닥 이름표 표시 조건** | A) 희귀 이상 상시 + Alt로 전부(D11-3·D11-4) / B) Alt 전용 | A 추천(핵슬 밀집 전투에서 Alt 누를 손이 없다) | [11 §8](MANUAL/11_loot_items.md) |
| G-7 | **등급 색 체계** — 하위 3단 회/초록/파랑 유지 vs 세 ARPG 흰/파랑/노랑; 유니크 자수정 vs 빨강 통일 | A) 현행 유지 + 채도 조정 + 유니크 자수정 통일·구조 단서(D11-1·D11-8) / B) 관례 색으로 교체 | A 추천(웹 라이브판 사용자 학습 유지). 〔재확인〕 | [11 §3.1b](MANUAL/11_loot_items.md) |
| G-8 | **장비 가시화의 등급 표현** — 몸에 등급 색을 입힐지 | A) 안 입힘, 유니크만 발광·문양 예외(CH 6-4, 실버 헬 "등급색은 이름 글자에만") / B) 팔레트 틴트 5단 | A 추천 | [CH §1.4·§6](MANUAL/CHARACTER_PIPELINE_20261105.md) |
| G-9 | **Core 제안 C1 — 기본 공격 예비 6틱**(D-MO-2) | A) 예비 6·휘두름 5·회복 28 = 총 39틱 유지 / B) 현행 예비 0 / C) 4 또는 8틱 | 문서 제목은 "사용자 결정: 6틱"이나 Core 미적용·CTO 배정 대기. 핵슬 반응성(PBZ)과 무게(NRftW)의 경계라 정체성 결정이다 | [MOTION_PIPELINE D-MO-2](MANUAL/MOTION_PIPELINE_20261105.md) |
| G-10 | **Core 제안 C3 — 드루이드 연타 변주 2/3/4** | A) 제안서 올림 / B) 리모델 3목숨 그대로(변주 없음) | PBZ 연구 "G1 후보". 보스 보드에서 판정 | [PBZ §5.3](GAME_STUDY/phantom_blade_zero.md), [06](MANUAL/06_boss.md) |
| G-11 | **Core 제안 C4(=LT-D1) — 데모 1-1에서 첫 전설 보장** | A) 현행 유지(1-1 보스 48.7% + 챕터 보스 100%) / B) 1-1 보스 첫 롤 전설 확정(데모 플래그, D4 베타 상향 사례) | LT 추천 A(매 판 전설이면 가치 하락). GD는 데모 v0 ④ "첫인상" 때문에 B도 올린다. 어느 쪽이든 전설 효과 미연결(L-10)부터 풀어야 체험이 된다 | `WorldDrop.cs`, [LT §7](GAME_STUDY/loot_feel.md), CLAUDE.md §1 |
| G-12 | **데모 v0 종류·양 잠금** | 캐릭터 1 · 일반전 1구간 · 보스 1 · 보상 선택 1 · 사망→재도전 · 저장→재개. 진행도 = Mac 판정 통과 구간 수 | 승인 요청(연구 제안, 사례 팀 관행 아님) | [00_INDEX §3.6](MANUAL/00_INDEX.md), [codex_small_team_pipeline §8](GAME_STUDY/codex_small_team_pipeline.md) |
| G-13 | **황천 기준 캡처 3~5장 지정**(D02-5) | 사용자가 공개 실기 영상에서 장면을 지정 | 지정 전에는 기둥 1을 판정할 수 없고, 수치는 전부 [기준] | [02 §8](MANUAL/02_light_fog_grade.md) |
| G-14 | **접근성 최소 v0 범위** — UI 배율(K7)·글자 3단·색약(K8) | A) 글자 3단(0.85/1/1.25)만 v0 / B) +UI 배율 / C) +색약 | A(D14-4) 추천, XAG 200%는 어느 안도 미충족임을 명시 | [14 §3.2c](MANUAL/14_text_font_l10n.md), [ARPG_CONVENTIONS K7·K8](ARPG_CONVENTIONS_CHECKLIST_20261105.md) |
| G-15 | **Core 제안 C2·C5** — 행동불능 해제 직후 큰 기술 판정 금지 30틱(D06-3) / 포이즈 붕괴 슬로 20을 표현에서 억제(D07-2) | 각각 A) 제안서 올림 / B) 보류 | 둘 다 〔재확인〕·CTO 결정 전 구현 금지 | [06 §8](MANUAL/06_boss.md), [07 §8](MANUAL/07_combat_impact.md) |
| G-16 | **색 문법 충돌 — 적 엘리트 색 = 아이템 등급 색**(매직 `#4488ff`=희귀, 레어 `#ffaa00`=전설, 챔피언 `#ff4444`≈유니크 기둥 빨강) | A) 엘리트 색을 표현 표로 옮겨 다른 팔레트(LT-C3) / B) 아이템 등급 색을 바꿈(D11-8 대안) | A 추천(웹 사용자가 학습한 아이템 색 유지). 탄·예고 두 색 문법(G-4)과 한 표에서 정한다 | `EliteTables.cs:26-28`, [LT §5.2 L-09](GAME_STUDY/loot_feel.md) |
| G-17 | **장판과 구르기 무적** — 추적 장판·독 웅덩이가 `PIframes <= 0`만 확인해 구르기 무적이면 통과(현행) vs PoE2식(장판은 무적 무시) | A) 현행 유지(Core 제안 BH-3 보류) / B) PoE2식 Core 제안 | A 추천. 탄막+핵슬 공존에서 구르기가 탄·장판 둘 다의 답이어야 밀집 전투가 성립한다 | `DruidBoss.Hazards.cs:380,449`, [BH §3·§7](GAME_STUDY/bullet_hell_quarter_view.md) |

**집계:** 사용자 결정 17건(G-1~G-17). Core 제안이 걸린 것 7건(C1 G-9, C2·C5 G-15, C3 G-10, C4=LT-D1 G-11, LT-C3 G-16, BH-3 G-17). 레인별 나머지 결정(BH 없음, LT-D2~D5)은 각 문서에 둔다. 엔진 결정(K1~K7)은 이 목록 밖이며 [ENGINE_DECISION](ENGINE_DECISION_20261105.md)을 따른다 — 어느 엔진이든 §1~§6은 그대로 쓴다(매뉴얼 1·2·3·6·7절 엔진 독립).

---

## 8. Core 사실표와 Core 제안

### 8.1 이 문서가 인용한 Core 값 (`unity/Assets/Exoduser/Runtime/Core`, unity/main)

| 영역 | 값 | 파일 |
|---|---|---|
| 틱 | 60fps, 월드 100px = 1u, 플레이어 반경 15px, 이동 2.6px/틱(행동 중 ×0.8) | `SimulationState.cs:52`, `InventoryState.cs:143` |
| 구르기 | 18틱(0.3초), 무적 앞 14틱, 뒤 4틱 노출, 거리 175px ease-out, 게이지 1칸 | `RollRules.cs` |
| E 패링(sBash) | 20틱, 창 16틱(망토 보정 상한 20), 판정 8번째 틱, 회복 28/속도 | `ParryRules.cs` |
| Q 패링 | 해제 창 12틱, 누름 패링 반경 100·흡수 20, 틀린 입력 반경 100 | `ParryRules.cs` |
| 패링 분류 | `physical`(E·Q) / `magic`(Q) / `forbidden`(불가); blackBean = magic = **Q 전용**, red bean 보상 ×0.5 / rainbow ×1.5, 소재 500/1000/2000 | `DruidBoss.Hazards.cs`, `ParryRewards.cs` |
| 적 탄 | black 4.4px/틱·Sz 2.0·`#00aa00`·수명 400 / red 2.8·1.5·`#cc1100`·유도 / dark 3.3·1.6·`#a44cff` / fire 3.2·1.6·`#ff2e22` / water 3.2·1.6·`#317cec` / special 3.0·2.5 / 기본 3.0·1.5(속성색); 충전 60틱; 속성색 ELC `#bbbbbb #ff5522 #3388ff #9933cc #ffee00 #ff88cc #88aa44` | `EnemyAi.cs:109-115,775`, `EnemyFactory.cs:34` |
| 드루이드 탄 | fan 속도 6·반경 16·10+1.5×페이즈 발·부채 0.55π / 미사일 14+2×페이즈·Sz 3·유도 / 지뢰 Sz 5·180틱 / 조수 파동 속도 15·최대 1750 / 추적 장판 리모델 6구역·반경 150·예고 30(`DruidRemodelData.cs:28-29`; 비리모델 웹값은 10개·반경 450) | `DruidBoss.Moves.cs`, `DruidRemodelData.cs` |
| 히트스톱(Core 계산) | 일반 타격 5, 처치 4, 큰 처치 12(지배자·심판자 12, 화룡 15), 플레이어 기절 5, 패링 2, 포이즈 붕괴 슬로 20 | `EnemyHurt.Body.cs:129`, `EnemyHurt.Death.cs:318`, `EnemyHurt.DeathTail.cs:140`, `PlayerPoise.cs`, `ParryRewards.cs` |
| 드롭 | 가중치 일반 {65,22,9,3,1,.01} / 엘리트 {25,35,25,12,3,.03} / 미니보스 {10,25,30,25,10,.1} / 스테이지 보스 {0,0,30,50,20,.2} / 챕터 보스 {0,0,0,30,70,.7}; 드롭 수 {1,1,2,3,5}; 일반 확률 .45; 챕터 보스 첫 드롭 전설; 바닥 보존 20; 슬롯 17(드롭 16, ossuary 제외) | `WorldDrop.cs`, `DropTablesData.cs:14` |
| 엘리트 | 일반/매직 `#4488ff`/레어 `#ffaa00`/챔피언 `#ff4444`; HP ×1/2/3/5, 공격 ×1/1.3/1.6/2, 드롭 보너스 0/.5/1.5/3 | `EliteTables.cs` |
| 1-1 시작 | 다안 육괴 2 + 게이트 수호자(elite 3, HP ×4·공격 ×2) + 호위 4~6(elite 1) + 일반 8~12; 소환굴 총원 168 | `Simulation.StartMobs.cs` |
| 드루이드 리모델 | 3목숨 HP 100/60/40%, 크기 ×1.0/.85/.70, 기술 간격 45/36/30, 예고 slash 32/24·slam 48·charge 54·fissure 40·fan 38·grab 60·burrow 50(+30)·chaseAoe 30×6·summon 60·tide 70·mines 40·heartbeat 90/60; 회복 60~90; 조준 고정 12 | `DruidRemodelData.cs`([06 §3.1](MANUAL/06_boss.md) 인용) |
| 기본 공격 | 예비 0·휘두름 5·접점 3번째 틱·회복 `int(16/(WeaponSpeed×AtkSpdMul))` ≈35 | [MOTION_PIPELINE §3](MANUAL/MOTION_PIPELINE_20261105.md) |
| 탄 판정 | 보스 투사체 기본 `Sz 1·R 4`; 플레이어 피격 `collR = 15 + 3·Sz`, `hitR = collR + 4`; 패링창 열림 시 `collR×3 + 12`; 패링 성공 무적 25틱; 원거리 적 사거리 400·쿨 240·충전 60틱; 체인대시 비행 63px/프레임·착지 무적 48; 경직 탈출/종료 무적 30/60 | `DruidBoss.Hazards.cs:9,220-223`, `ParryRewards.cs:14`, `Simulation.cs:402`, `ChainDash.cs:16,18`, `PlayerPoise.cs:13`([BH §0](GAME_STUDY/bullet_hell_quarter_view.md)) |
| 줍기·필터 | R키: 화면 안 최고 등급→가까운 것, 누르면 9틱마다 반복, 거리 제한 없음; `MinPickRarity`는 생성 필터(미만 등급은 생성 안 함); 드롭 위치 적 ±15px 지터; 1-1 엘리트 비율 매직 3%·레어 0·챔피언 0 | `Simulation.cs:170,324-336`, `WorldDrop.cs:65,71`, `EliteTables.cs:32`([LT §2.2·§5](GAME_STUDY/loot_feel.md)) |

### 8.2 Core 제안 (번호만, 구현 금지)

| # | 제안 | 출처 | 결정 |
|---|---|---|---|
| C1 | 기본 공격 1타에 `wWindup` 6틱 추가, 회복 6틱 축소(총 39틱 유지) | D-MO-2 | G-9 |
| C2 | 보스 행동불능 해제 직후 큰 기술 판정 금지 30틱 | D06-3 | G-15 |
| C3 | 드루이드 연타 변주 2/3/4 | PBZ §5.3 | G-10 |
| C4 | 데모 1-1 스테이지 보스 첫 드롭 전설 보장(데모 플래그) | 이 문서 §6.3 | G-11 |
| C5 | 포이즈 붕괴 슬로 20을 표현에서 억제 | D07-2 | G-15 |

| BH-1 | 투사체 `Sz`→그림 지름 환산 상수를 표현층 하나로 두고 docs에 기록 | [BH §7](GAME_STUDY/bullet_hell_quarter_view.md) | 표현 쪽, 승인 불필요 후보 |
| BH-2 | 일반 콩 7종 색을 "주인·대응법" 축으로 재배치 검토(수치·판정 불변) | BH §7 | G-4·G-16과 한 표 |
| BH-3 | 장판이 구르기 무적에 걸러지는 현행 유지 vs PoE2식 | BH §7 | G-17 |
| LT-C1 | 화폐·재료 드롭 이식 때 자동 줍기 반경 상수(장비 제외) | [LT §7](GAME_STUDY/loot_feel.md) | IA §2.3 뒤 |
| LT-C2 | 일반몹 연속 무드롭 k(6)회 뒤 드롭 확정 | LT §7 | LT-D2(v0 미도입 추천) |
| LT-C3 | 적 엘리트 색을 Core 데이터에서 표현 표로, 아이템 등급 색과 다른 팔레트 | LT §7 | G-16 |

올리지 않기로 추천된 것: slashCombo 3타 예고 24→40틱(★D06-7, Core 24틱 안에서 DANGER 링·바닥 대비로 키움).

---

## 9. 출처

### 9.1 우리 문서 (경로는 `docs/0마스터플랜/` 기준, 브랜치 = 이 문서 작성 시점에 그 파일이 있는 곳)

| 문서 | 브랜치 | 이 문서에서 쓴 곳 |
|---|---|---|
| [DIRECTION_RESET_20261105](DIRECTION_RESET_20261105.md) | unity/main | §0·§1·§5·§7 G-1 |
| [BRIEF_OVERNIGHT2_20261105](worklog/cloud-lanes/BRIEF_OVERNIGHT2_20261105.md) | unity/main | 범위 |
| [BRIEF_MOTION_PIPELINE](worklog/cloud-lanes/BRIEF_MOTION_PIPELINE_20261105.md) · [BRIEF_CHARACTER_DEEP](worklog/cloud-lanes/BRIEF_CHARACTER_DEEP_20261105.md) | unity/main | §4 기둥 5, §2 장비 가시화 |
| [ARPG_CONVENTIONS_CHECKLIST_20261105](ARPG_CONVENTIONS_CHECKLIST_20261105.md) | `claude/unity-cloud-arpg-conventions-20261105` | §2 현재 상태, §5, §7 |
| [ENGINE_DECISION_20261105](ENGINE_DECISION_20261105.md) | `claude/unity-cloud-engine-decision-20261105` | §7 말미 |
| [MANUAL/00_INDEX](MANUAL/00_INDEX.md) ~ [15](MANUAL/15_performance_budget.md) | `claude/unity-cloud-manual-draft-20261105` | §3·§4·§5·§6·§7 |
| [MANUAL/FIRST_SCENE_PLAN](MANUAL/FIRST_SCENE_PLAN.md) | `codex/unity-study-first-scene-plan-20261105` | §6.1(Meshy/Tripo 문구는 09:30 결정으로 폐기 대상) |
| [MANUAL/CHARACTER_PIPELINE_20261105](MANUAL/CHARACTER_PIPELINE_20261105.md) | `claude/unity-cloud-character-20261105` | §1·§2·§4·§6.3·§7 |
| [MANUAL/MOTION_PIPELINE_20261105](MANUAL/MOTION_PIPELINE_20261105.md) · [MO_BASELINE](MANUAL/MO_BASELINE/MO_BASELINE_20261105.md) | `claude/unity-cloud-motion-20261105` | §4 기둥 5, §8.1, G-9 |
| [GAME_STUDY/poe2](GAME_STUDY/poe2.md) | `claude/unity-cloud-poe2-study-20261105` | 기둥 2 |
| [GAME_STUDY/phantom_blade_zero](GAME_STUDY/phantom_blade_zero.md) | `claude/unity-cloud-phantomblade-study-20261105` | 기둥 4, §3 정렬 큐, G-3·G-10 |
| [GAME_STUDY/downfall_of_yellowsky](GAME_STUDY/downfall_of_yellowsky.md) | `claude/unity-cloud-yellowsky-study-20261105` | 기둥 1, §3 안개 |
| [GAME_STUDY/REFERENCE_INDEX_20261105](GAME_STUDY/REFERENCE_INDEX_20261105.md) | `claude/unity-cloud-reference-scout-20261105` | §1.2 "탄막 레퍼런스 0건" |
| [GAME_STUDY/bullet_hell_quarter_view](GAME_STUDY/bullet_hell_quarter_view.md) (BH) | `claude/unity-cloud-bullet-readability-20261105` @ fe84a6f | §1.2·§2·§3 판정표·§5·§6.1·§7 G-5·G-17·§8 |
| [GAME_STUDY/loot_feel](GAME_STUDY/loot_feel.md) (LT) | `claude/unity-cloud-loot-feel-20261105` @ 9f2c9c6 | §2·§3·§4 기둥 3·§6.3·§7 G-11·G-16·§8 |
| [GAME_STUDY/codex_*](GAME_STUDY/) 20편(combat_impact·frame_data·motion_direction·vfx_direction·menus_loot·keyshot_composition·urp_mood·sound_music·3d_pixel·3d_pixel_small_team·cinematic_text·small_team_pipeline·tech_budget·asset_size·engine_ai_friendliness·yellowsky·yellowsky_cn·synthesis·DIGEST·SOURCE_VERIFY) | `codex/unity-study-*-20261105` | §1~§4 전반 |
| [D4_STUDY/01~04](D4_STUDY/) | `claude/unity-cloud-d4-study-20261105`, `-boss`, `-combat`, `-ui` | 기둥 2·3·4, §3 |
| [WORK_QUALITY_STANDARD_20261029](WORK_QUALITY_STANDARD_20261029.md) · [AAA_QUALITY_STANDARD_20260927](AAA_QUALITY_STANDARD_20260927.md) | unity/main | 판정 방법 |
| [실버 헬](../3.1%20ui%20hud%20디자인/DESIGN_CONCEPT_SILVER_HELL_20261028.md) | unity/main | 색 토큰 |
| Core 코드 | unity/main `unity/Assets/Exoduser/Runtime/Core` | §8.1 |

### 9.2 웹 (이 세션 WebSearch, 전부 **검색 발췌·원문 미열람**)

Death Must Die: https://steamspy.com/app/2334730 · https://gamesradar.com/steams-latest-roguelike-hit-is-a-hades-and-vampire-survivors-mash-up-with-some-impressive-rpg-flair · https://www.pcgamesn.com/death-must-die/act-2-steam / Tiny Rogues: https://store.steampowered.com/app/2088570/Tiny_Rogues/?l=koreana · https://rogueliker.com/tiny-rogues-review/ / Hero Siege: https://steamspy.com/app/269210 · https://panicartstudios.itch.io/hero-siege / Realm of the Mad God: https://en.wikipedia.org/wiki/Realm_of_the_Mad_God / The Slormancer: https://www.pcgamesn.com/games-like-diablo-pc · https://www.fanatical.com/en/game/the-slormancer / Chronicon: https://www.gamingonlinux.com/2020/08/fantastic-2d-action-rpg-chronicon-has-now-released/ / Ravenswatch: https://www.shacknews.com/article/134922/ravenswatch-pc-early-access-preview?amphtml=1 / PoE2 보스: https://mein-mmo.de/en/path-of-exile-2-throws-you-into-boss-fights-that-are-reminiscent-less-of-diablo-4-and-more-of-dark-souls,1167623 · https://gamingbolt.com/?p=605901 / D4 릴리트: https://icy-veins.com/d4/news/how-to-beat-echo-of-lilith-diablo-4/ · https://www.shacknews.com/article/135943/diablo-4-lilith-boss-tips-how-to-beat / 카메라 각도(D4·PoE2·Hades 공식 수치 없음): https://us.forums.blizzard.com/en/d3/t/diablo-4-camera-perspective/47070 · https://www.pathofexile.com/forum/view-thread/3264537

### 9.3 미검증 집계

- 웹 출처 10건 전부 원문 미열람(검색 발췌). "bullet hell" 표기가 상점 공식 문구인 것은 Tiny Rogues·Realm of the Mad God 2건, 사용자 태그·제3자 서술인 것은 Death Must Die·Hero Siege·Slormancer·Ravenswatch·PoE2·D4.
- 레퍼런스 실측 수치(히트스톱 ms·안개·글자 px·기둥 높이·드롭음·NRftW 프레임)는 20개 연구 문서 어디에도 확정값이 없다. 이 문서의 수치는 Core 값을 제외하면 전부 [문서] 시작값이고 Mac 비교판이 최종 근거다.
- 정체성 문장 "33도" vs 코드·매뉴얼 34°(G-1). FIRST_SCENE_PLAN의 Meshy/Tripo 문구는 09:30 결정과 충돌(폐기 대상).
- BH 미검증 11건(동방 판정 px·밀도, Gungeon 무적 비율·탄속, Nuclear Throne, Hades 대시 프레임, Supergiant 발언, Returnal 색 규칙·대시, Furi 창, D4 S4 줌 비율), LT 외부 출처 48건 전부 검색 발췌(열림 0). 두 레인 모두 원근 쿼터뷰 탄막·절대 드롭 수치의 1차 자료 0건.

## 변경 이력
- 2026-11-05 초안(레인 GD, 클라우드, docs만). 입력: unity/main 2f8ef03 + 연구 브랜치 31개 + BH fe84a6f + LT 9f2c9c6.

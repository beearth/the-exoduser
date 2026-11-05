# 아이템·어픽스 감사 — 2026-11-05 (레인 IA, 설계↔Core↔웹 전수 대조)

> **요약: 불일치 9건 · Core 미구현 어픽스 37종(전설 특수 18·유니크 특수 39·임플리싯 1·아이템 기본 필드 16은 별도 집계) · 죽은 어픽스 242종(+임플리싯 8).** AFFIX_POOL 409행/407 id 전부를 설계 문서·Core·웹 세 곳에서 대조했고 수치(티어·단위·슬롯·가중치·접두/접미)는 **세 곳이 100% 같다**. 차이는 전부 "누가 그 값을 읽느냐"(소비 여부)와 문서 누락에서 난다.

| 항목 | 값 |
|---|---|
| 브리프 | [BRIEF_SYSTEMS_AUDIT_20261105 §0·§1·§3](../0마스터플랜/worklog/cloud-lanes/BRIEF_SYSTEMS_AUDIT_20261105.md) — 조사·설계·백로그까지. **Core 코드는 읽기만 했고 바꾸지 않았다.** |
| 기준 커밋 | Unity Core = origin/unity/main `bd06f3819`. 웹 oracle = 같은 브랜치의 대조용 `game.html`(sha256 `189899b4…`). `DropTablesData.cs`는 웹 `0d42e0cbc`에서 생성한 표인데 AFFIX_POOL·IMPLICIT·LEGENDARY·UNIQUE·UNIQUE_ART 전 항목이 현 웹과 필드 단위로 같다(차이 1건: §0.2 #4 u_n02 문구). |
| 읽은 Core | `ItemFactory.cs`(381줄) · `DropTablesData.cs`(596줄, 생성물) · `InventoryState.cs` · `InventoryData.cs` · `EquipmentApplication.cs` · `InventoryCombatPower.cs` · `InventoryComparison.cs` · `AutoPotionEquipment.cs` · `WorldDrop.cs` · 어픽스를 읽는 전투 코드(`EnemyHurt*.cs`·`Simulation.PlayerHurt.cs`·`Simulation.Crossbow.cs`·`Skills/*.cs`·`SimulationRage.cs`·`Simulation.EnemyBridge.cs`·`Simulation.Growth.cs`) |
| 읽은 docs | `7아이템디자인/` 전부(ITEM_TEAM_MASTER·아이템_어픽스_시스템·슬롯별_어픽스_풀·유니크_어픽스_리스트·exoduser-item-system-full·현황분석·Layer 재분류·전수매핑 402·UNIQUE 계약·TOP8·ON_CRIT·드롭 프리뷰) · `2_7 인벤토리+장비시스템/`(2_7·3파트) · `14밸런스+수치테이블/보석품질_소켓석_수치표.md` · `_archive/7아이템디자인/DEMO11_24*.md` |
| 판정 방법 | **소비 = 값을 읽어 효과에 쓰는 코드가 있다.** Core는 `AffixTotal/EqAffix/HurtAffix("id")`·`a.id=="id"` 리터럴을 전수 검색하고, 생성 전용(ItemFactory 선부여 풀·DemoBanned)·단위표(`AffixUnit`)·비교 패널(`InventoryComparison`)·통계 라벨은 소비에서 뺐다. 웹은 `_eqAffix('id')` 163곳 + 원소 동적 조회(`_elAx/_elBn` 42216~42217) + `_slotFlatAtk`의 `a.id===`(28766)를 소비로 보고, 스탯 패널(51200~51600)·AFFIX_POOL 정의 구간만의 참조는 **표시 전용(미소비)**으로 뺐다. 이 기준은 10-21 DEMO11-24b 기록의 "소비처 미확인 242"와 같은 수(242)로 수렴한다. |
| 산출 도구 | 임시 스크립트로 풀 파싱·diff·소비 스캔(저장소에 넣지 않음). 수치 재확인은 `DropTablesData.cs:36~444`와 `game.html:14370~15015`를 같은 id로 열면 된다. |

## 0.1 숫자 요약

| 구분 | 수 | 근거 |
|---|---:|---|
| AFFIX_POOL 행 / 고유 id | 409 / 407 | `critDmgW`·`antiRevive` 2행씩 (슬롯만 다름) |
| 세 곳 수치 일치 | 409/409 행 | 티어 5칸·unit·slots·group·weight·minGrade·tierW·skewRoll·brType 필드 diff 0 |
| **구현**(Core가 읽고 효과에 씀) | **128 id** | §1 상태 "구현". 이 중 `reviveOnce`는 드랍 불가 |
| **Core 미구현**(웹은 전투에서 읽는데 Core는 안 읽음) | **37 id** | §4.1 목록. 스탯형 16 + 전투형 21 |
| **죽음**(웹·Core 어디서도 효과로 안 읽음) | **242 id** | 235 + 웹 스탯 패널 표시만 하는 7(원소 저항 5·allRes·maxMPPct). 08-10 현황분석의 236에 그 뒤 추가분·패널 전용 보정 |
| 드랍 불가 | 2 id | `lastStand`·`reviveOnce`: `tiers[0]=null`인데 롤 필터가 `tiers[0]!=null`을 요구 (웹 15150·15153, Core ItemFactory.cs:347·352) |
| 임플리싯 16 stat | Core 7 소비 / 웹 8 소비 / 양쪽 죽음 8 | §3.4 |
| 전설 특수 19 | Core 1(`_lBowCrit`) / 웹 19 | Core 브리지가 `LEq = zero`(Simulation.EnemyBridge.cs:88) |
| 유니크 특수 39 | Core 0 / 웹 39 | Core 브리지가 `UEq = zero`(같은 줄). 훅 8개는 이식돼 있으나 값이 항상 0 |
| 아이템 기본 필드 | Core 미소비 16 | §3.3. 예: 귀걸이 기본 `mpRegen`, 투구 `beamDmg/elements`, 무기 `wStCost` |
| 문서↔코드 불일치 | 9건 | §0.2 |
| Core 변경 제안 | 10건(C-IA-01~10) | §6. 승인 전 구현 금지 |

## 0.2 불일치표 (문서 ↔ Core ↔ 웹, 수치 1이라도 다른 것)

| # | 위치 | 문서/코드 A | 문서/코드 B | 판정 | 고칠 곳 |
|---:|---|---|---|---|---|
| 1 | `아이템_어픽스_시스템.md` Part 5 방어생존 표 | `reviveOnce`(부활의, armor SUF, hp, tiers null/null/null/.20/.35, w10) 행 **없음** | Core `DropTablesData.cs:105` · 웹 `game.html:14464` 존재 | 문서 누락 | Part 5 방어생존(55종→56) 행 추가 + 드랍불가 표기 |
| 2 | `아이템_어픽스_시스템.md:726` | `endMaliceGain` 이름 **종결악의오브의** | 웹 `AFFIX_NAMES_KO`·Unity `affix_defs_web.json` **종결악의의** | 문서 오기 | 문서를 코드 이름으로 |
| 3 | `슬롯별_어픽스_풀.md` G절 | 본문 546 슬롯행 | 헤더·Core 556 슬롯행. 누락 10쌍: `kiSlashParry`·`kiSlashFullCrit`(wpn·gloves·bracelet), `maliceWeakAmp`(helm), `rageSkDmg`·`rageSkCrit`(wpn), `reviveOnce`(armor) | 문서 누락 (10-08 이후 추가분) | G절 해당 슬롯 표에 10행 추가 |
| 4 | `DropTablesData.cs` Unique `u_n02` Ko | Core "**구르기·**전격이동 경로의 적에게 약화…" | 현 웹 `UNIQUE_SPECIAL.u_n02` "전격이동 경로의 적에게 약화…" | Core 표시 문자열 구버전(생성 원본 0d42e0cb) | 표 재생성 시 반영(Core 변경 아님, 표시 문자열만) |
| 5 | `exoduser-item-system-full.md:1099` | "드랍 홈 수 **1~4 롤 유지**, 자연 홈 q=1" | `2_7`·`보석품질_소켓석_수치표` 10-10 규칙 "신규 장비 **0홈**" = Core `socketCount=0`(ItemFactory.cs:291) | 문서 구문 잔존 | item-system-full 줄을 0홈으로 |
| 6 | `2_7 인벤토리+장비시스템.md` §신규 슬롯 headband | "**maxMPPct 어픽스 제거됨** → ST와 대칭" | AFFIX_POOL에 `maxMPPct`(headband·neck, w55) **존재**, 다만 웹·Core 어디서도 안 읽음(죽음) | 문서↔코드 불일치 | 사용자 결정: 풀에서 제거(문서대로) vs 구현 — 백로그 B-04에 포함 |
| 7 | `어픽스_시스템_현황분석_2026-08-10.md` §9 "적용 166" | 저항 6종(`fireRes iceRes lightRes darkRes poisonRes allRes`)·`maxMPPct`를 ✅ 적용으로 분류 | 현 웹에서 `_eqAffix('fireRes')` 등은 스탯 패널 표시(51315~51379)뿐, 피해 공식에 없음 | 집계 오류(또는 그 뒤 제거) | 적용 166→159, 미적용 236→242로 정정(이 문서 §1이 현행) |
| 8 | 설계(아이템_어픽스_시스템 `closeDR`/`farDR` "근접/원거리 피해감소") | 설계 의도: 적과의 거리 | 웹 `hurtP` 43,5xx·Core `Simulation.PlayerHurt.cs:100`: 거리 = **원점에서 플레이어까지** `|P.x|+|P.y|` → 실제 맵에서 `farDR` 상시, `closeDR` 사실상 불발 | 설계↔코드 불일치(양쪽 동일 버그, Core 주석에도 명시) | Core 변경 제안 C-IA-05 |
| 9 | 설계 `bossDR`(보스 피해감소, 망토) | 설계: 보스 공격 DR | 웹 43534 `opts.src.ib` — `src`는 라벨 문자열이라 `ib` 없음 → 항상 0. Core는 `bossDR`를 읽지 않음 | 양쪽 죽음(Core 미구현 37에 포함) | C-IA-05 |

> 이 밖의 "값" 대조는 전부 일치했다: 등급별 어픽스 수 `[0,2,3,5,6,7]`, RARITY_MUL `[1,1.2,1.5,1.8,2.2,2.5]`, ATK 바닥 `[0,.05,.15,.25,.40,.50]`, 슬롯별 풀 수량(무기 142·석궁 25·왕관 53·갑옷 47·보조무기 26·장갑 14·바지 15·부츠 27·망토 17·벨트 25·팔찌 33·반지 52·목걸이 51·귀걸이 27·유골함 2), 장신구 LCK/근성 5티어(목걸이 20~100·그 외 10~50), `shieldBlockDR` 4/7/11/16/22%p, `potionCdRed` 상한 20%, itemLv/reqLv 공식, itemPower 가중치(Core는 유물 항만 없음).

---

## 1. 어픽스 전수표 (AFFIX_POOL 409행, 코드 순서)

읽는 법: **설계 문서** `=`는 `아이템_어픽스_시스템.md` Part 5 행과 5티어·unit·슬롯·w가 같다는 뜻. **Core 값/웹 값**은 같은 값이 있는 줄 번호. **상태**: `구현`=Core가 읽어 효과에 씀 / `Core 미구현`=웹 전투 코드는 읽는데 Core는 안 읽음 / `죽음`=웹·Core 모두 효과로 안 읽음(정의·드랍·툴팁·itemPower까지만 됨). **Core 소비 파일:줄**은 `unity/Assets/Exoduser/Runtime/Core/` 기준, **웹 소비 줄**은 `game.html` 기준(`(패널)`=스탯 패널 표시만). 티어 값은 롤 상한이 `baseTier(등급 0~2)+⌊Lv/200⌋`이라 T4·T5는 Lv200·400부터만 나온다(§2.1).

| # | ID | 이름(ko) | P/S | 슬롯 허용 | T1/T2/T3/T4/T5 | unit | w | 설계 문서(아이템_어픽스_시스템 Part5) | Core 값 | 웹 값 | 상태 | Core 소비 파일:줄 | 웹 소비 줄 | 비고 |
|---:|---|---|---|---|---|---|---:|---|---|---|---|---|---|---|
| 1 | `poisonDot` | 맹독의 | PRE | 무기 | 5/8/14/22/32 | dps | 100 | = | =(DropTablesData.cs:36) | =(game.html:14375) | **구현** | EnemyHurt.Body.cs:141 | 42424 |  |
| 2 | `fireDot` | 불꽃의 | PRE | 무기 | 6/10/17/26/38 | dps | 100 | = | =(DropTablesData.cs:37) | =(game.html:14376) | **구현** | EnemyHurt.Body.cs:141 | 42424 |  |
| 3 | `iceDot` | 냉기의 | PRE | 무기 | 4/7/12/18/26 | dps | 90 | = | =(DropTablesData.cs:38) | =(game.html:14377) | **구현** | EnemyHurt.Body.cs:141 | 42424 |  |
| 4 | `lightChain` | 번개의 | PRE | 무기 | 8/13/22/35/50 | dmg | 85 | = | =(DropTablesData.cs:39) | =(game.html:14378) | **구현** | EnemyHurt.Body.cs:158 | 42438 |  |
| 5 | `darkCurse` | 암흑의 | PRE | 왕관 | 0.12/0.2/0.35/0.55/0.75 | prob | 70 | = | =(DropTablesData.cs:40) | =(game.html:14379) | **구현** | EnemyHurt.Body.cs:161 | 42440 |  |
| 6 | `armorPen` | 관통의 | PRE | 무기 | 0.05/0.08/0.14/0.22/0.32 | pct | 75 | = | =(DropTablesData.cs:41) | =(game.html:14381) | **죽음** | - | - |  |
| 7 | `staggerBns` | 파쇄의 | PRE | 무기 | 5/8/14/22/32 | val | 70 | = | =(DropTablesData.cs:42) | =(game.html:14382) | **구현** | EnemyHurt.Body.cs:217 | 42489 |  |
| 8 | `chainTarget` | 연쇄의 | PRE | 석궁 | 1/1/2/3/4 | cnt | 60 | = | =(DropTablesData.cs:43) | =(game.html:14383) | **구현** | EnemyHurt.Body.cs:164 | 42442 |  |
| 9 | `killSlayer` | 학살의 | PRE | 무기 | 0.1/0.15/0.25/0.4/0.55 | pct | 75 | = | =(DropTablesData.cs:44) | =(game.html:14384) | **구현** | EnemyHurt.Death.cs:235 | 42652 |  |
| 10 | `comboBoost` | 추적자의 | PRE | 무기 | 0.12/0.2/0.35/0.55/0.75 | pct | 60 | = | =(DropTablesData.cs:45) | =(game.html:14385) | **구현** | EnemyHurt.cs:243 | 42295 |  |
| 11 | `dashBoost` | 사슬의 | PRE | 무기 | 0.15/0.25/0.4/0.65/0.9 | pct | 55 | = | =(DropTablesData.cs:46) | =(game.html:14386) | **구현** | Simulation.PlayerCombat.cs:119 | 32291 |  |
| 12 | `skillBoost` | 궁극의 | PRE | 무기 | 0.1/0.15/0.25/0.4/0.55 | pct | 65 | = | =(DropTablesData.cs:47) | =(game.html:14387) | **Core 미구현** | - | 44557 |  |
| 13 | `elemFocus` | 집중의 | PRE | 왕관 | 0.08/0.12/0.2/0.32/0.44 | pct | 70 | = | =(DropTablesData.cs:48) | =(game.html:14389) | **구현** | EnemyHurt.cs:164 | 42214 |  |
| 14 | `atkSpeed` | 쾌속의 | PRE | 무기·왕관 | 0.04/0.06/0.1/0.16/0.22 | pct | 85 | = | =(DropTablesData.cs:49) | =(game.html:14390) | **Core 미구현** | - | 27994 |  |
| 15 | `parryBonus` | 패리의 | PRE | 무기 | 0.12/0.2/0.35/0.55/0.75 | pct | 65 | = | =(DropTablesData.cs:50) | =(game.html:14391) | **Core 미구현** | - | 28036 |  |
| 16 | `cooldownRed` | 집중력의 | PRE | 무기 | -0.02/-0.03/-0.05/-0.07/-0.1 | pct | 70 | = | =(DropTablesData.cs:51) | =(game.html:14392) | **구현** | Skills/Simulation.Skills.cs:107 | 28065 |  |
| 17 | `magicDmg` | 마력의 | PRE | 왕관 | 0.06/0.1/0.18/0.28/0.4 | pct | 85 | = | =(DropTablesData.cs:52) | =(game.html:14393) | **구현** | Skills/Simulation.Skills.cs:102 | 28008 |  |
| 18 | `critDmgW` | 극대화의 | SUF | 무기·왕관 | 0.1/0.2/0.3/0.4/0.5 | pct | 60 | = | =(DropTablesData.cs:53) | =(game.html:14395) | **Core 미구현** | - | 27998 | tierW; 중복행 1/2 |
| 19 | `critRate` | 광폭의 | PRE | 반지·목걸이·팔찌 | 0.01/0.02/0.03/0.04/0.05 | pct | 50 | = | =(DropTablesData.cs:54) | =(game.html:14396) | **Core 미구현** | - | 27997 | tierW |
| 20 | `critDmgW` | 극대화의 | SUF | 반지·목걸이·팔찌 | 0.1/0.2/0.3/0.4/0.5 | pct | 50 | = | =(DropTablesData.cs:55) | =(game.html:14397) | **Core 미구현** | - | 27998 | tierW; 중복행 2/2 |
| 21 | `sharpAtk` | 예리한 | PRE | 무기 | 20/50/170/330/500 | val | 25 | = | =(DropTablesData.cs:56) | =(game.html:14399) | **구현** | Simulation.Crossbow.cs:95; EquipmentApplication.cs:19 | 28766 | DEMO 금지; tierW; skew 3.0 |
| 22 | `brutalAtk` | 맹렬한 | PRE | 무기 | 20/50/170/330/500 | val | 20 | = | =(DropTablesData.cs:57) | =(game.html:14400) | **구현** | Simulation.Crossbow.cs:95; EquipmentApplication.cs:19 | 28766 | DEMO 금지; tierW; skew 3.0 |
| 23 | `ruinAtk` | 파멸의 | SUF | 무기 | 20/50/170/330/500 | val | 15 | = | =(DropTablesData.cs:58) | =(game.html:14401) | **구현** | Simulation.Crossbow.cs:95; EquipmentApplication.cs:19 | 28766 | DEMO 금지; tierW; skew 3.0 |
| 24 | `staggerExplosion` | 스태거폭발의 | SUF | 무기 | 0.18/0.3/0.5/0.8/1.15 | pct | 35 | = | =(DropTablesData.cs:59) | =(game.html:14403) | **구현** | EnemyHurt.Body.cs:220; EnemyHurt.Body.cs:222 | 42492 | DEMO 금지 |
| 25 | `elemConvert` | 원소전환의 | SUF | 무기 | 0.12/0.2/0.35/0.55/0.75 | prob | 40 | = | =(DropTablesData.cs:60) | =(game.html:14404) | **구현** | EnemyHurt.cs:162 | 42211 | DEMO 금지 |
| 26 | `parryExplosion` | 패링폭발의 | SUF | 무기 | 0.25/0.4/0.7/1.1/1.6 | atk | 35 | = | =(DropTablesData.cs:61) | =(game.html:14405) | **Core 미구현** | - | 38545 | DEMO 금지 |
| 27 | `abundDmg` | 풍요의 | SUF | 무기·왕관 | 0.08/0.12/0.2/0.32/0.44 | pct | 45 | = | =(DropTablesData.cs:62) | =(game.html:14407) | **구현** | EnemyHurt.cs:188 | 42238 |  |
| 28 | `predDmg` | 약자포식의 | SUF | 무기·왕관 | 0.08/0.12/0.2/0.32/0.44 | pct | 45 | = | =(DropTablesData.cs:63) | =(game.html:14408) | **구현** | EnemyHurt.cs:192 | 42243 |  |
| 29 | `fullLifeDmg` | 만혈의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 35 | = | =(DropTablesData.cs:64) | =(game.html:14409) | **구현** | EnemyHurt.cs:190 | 42240 | tierW |
| 30 | `lowLifeDmg` | 사선의 | SUF | 무기 | 0.15/0.25/0.4/0.6/0.85 | pct | 35 | = | =(DropTablesData.cs:65) | =(game.html:14410) | **구현** | EnemyHurt.cs:191 | 42241 | tierW |
| 31 | `overkilDmg` | 처형의 | SUF | 무기 | 0.2/0.35/0.55/0.8/1.1 | pct | 30 | = | =(DropTablesData.cs:66) | =(game.html:14411) | **구현** | EnemyHurt.cs:193 | 42244 | DEMO 금지; tierW |
| 32 | `closeDmg` | 근접살의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 50 | = | =(DropTablesData.cs:67) | =(game.html:14413) | **구현** | EnemyHurt.cs:195 | 42248 |  |
| 33 | `farDmg` | 원거리의 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 50 | = | =(DropTablesData.cs:68) | =(game.html:14414) | **구현** | EnemyHurt.cs:195 | 42249 |  |
| 34 | `stunDmgUp` | 경직파의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:69) | =(game.html:14416) | **구현** | EnemyHurt.cs:196 | 42251 |  |
| 35 | `frozenDmgUp` | 동파의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:70) | =(game.html:14417) | **구현** | EnemyHurt.cs:197 | 42252 |  |
| 36 | `burnDmgUp` | 연소의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:71) | =(game.html:14418) | **구현** | EnemyHurt.cs:198 | 42253 |  |
| 37 | `poisonDmgUp` | 맹독살의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:72) | =(game.html:14419) | **구현** | EnemyHurt.cs:199 | 42254 |  |
| 38 | `curseDmgUp` | 저주살의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 50 | = | =(DropTablesData.cs:73) | =(game.html:14420) | **구현** | EnemyHurt.cs:200 | 42255 |  |
| 39 | `slowDmgUp` | 구속의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 50 | = | =(DropTablesData.cs:74) | =(game.html:14421) | **구현** | EnemyHurt.cs:201 | 42256 |  |
| 40 | `bossSlayer` | 왕살의 | SUF | 무기·왕관 | 0.1/0.18/0.28/0.4/0.55 | pct | 40 | = | =(DropTablesData.cs:75) | =(game.html:14423) | **구현** | EnemyHurt.cs:202 | 42258 | tierW |
| 41 | `eliteSlayer` | 정예살의 | SUF | 무기·왕관 | 0.12/0.2/0.32/0.46/0.65 | pct | 45 | = | =(DropTablesData.cs:76) | =(game.html:14424) | **구현** | EnemyHurt.cs:203 | 42259 |  |
| 42 | `mobSlayer` | 군살의 | SUF | 무기 | 0.15/0.25/0.4/0.6/0.85 | pct | 60 | = | =(DropTablesData.cs:77) | =(game.html:14425) | **구현** | EnemyHurt.cs:204 | 42260 |  |
| 43 | `firstStrike` | 선제의 | SUF | 무기 | 0.15/0.25/0.4/0.6/0.85 | pct | 40 | = | =(DropTablesData.cs:78) | =(game.html:14427) | **구현** | EnemyHurt.cs:194 | 42245 |  |
| 44 | `lifeLeech` | 흡혈의 | SUF | 무기 | 0.005/0.01/0.018/0.028/0.04 | pct | 35 | = | =(DropTablesData.cs:79) | =(game.html:14429) | **구현** | EnemyHurt.Body.cs:60 | 42361 | tierW |
| 45 | `manaLeech` | 흡마의 | SUF | 무기 | 0.008/0.015/0.025/0.04/0.06 | pct | 35 | = | =(DropTablesData.cs:80) | =(game.html:14430) | **구현** | EnemyHurt.Body.cs:62 | 42363 | tierW |
| 46 | `stLeech` | 흡정의 | SUF | 무기 | 0.005/0.01/0.018/0.028/0.04 | pct | 35 | = | =(DropTablesData.cs:81) | =(game.html:14431) | **구현** | EnemyHurt.Body.cs:63 | 42364 | tierW |
| 47 | `lifeOnHit` | 타격재생의 | SUF | 무기 | 1/2/4/7/11 | val | 45 | = | =(DropTablesData.cs:82) | =(game.html:14432) | **구현** | EnemyHurt.Body.cs:64 | 42365 |  |
| 48 | `onKillHeal` | 처치회복의 | SUF | 무기·왕관 | 5/10/18/28/40 | val | 50 | = | =(DropTablesData.cs:83) | =(game.html:14434) | **구현** | EnemyHurt.Death.cs:238 | 42654 |  |
| 49 | `onKillMana` | 처치흡마의 | SUF | 무기·왕관 | 5/10/18/28/40 | val | 50 | = | =(DropTablesData.cs:84) | =(game.html:14435) | **구현** | EnemyHurt.Death.cs:239 | 42655 |  |
| 50 | `onKillStam` | 처치활력의 | SUF | 무기 | 3/6/10/16/24 | val | 45 | = | =(DropTablesData.cs:85) | =(game.html:14436) | **구현** | EnemyHurt.Death.cs:240 | 42656 |  |
| 51 | `onKillSpeed` | 처치질주의 | SUF | 무기 | 0.05/0.08/0.12/0.18/0.25 | pct | 40 | = | =(DropTablesData.cs:86) | =(game.html:14438) | **구현** | EnemyHurt.Death.cs:242 | 42658 |  |
| 52 | `rageMaxFlat` | 격노의 | PRE | 무기 | 10/20/35/55/80 | val | 45 | = | =(DropTablesData.cs:87) | =(game.html:14440) | **구현** | SimulationRage.cs:30 | 27890 |  |
| 53 | `rageDmg` | 광분의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 45 | = | =(DropTablesData.cs:88) | =(game.html:14441) | **구현** | SimulationRage.cs:30 | 46466 |  |
| 54 | `rageSkCrit` | 격노일섬의 | SUF | 무기 | 0.05/0.08/0.12/0.18/0.25 | prob | 40 | = | =(DropTablesData.cs:89) | =(game.html:14443) | **구현** | EnemyHurt.cs:262 | 42310 |  |
| 55 | `rageSkDmg` | 분쇄의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 40 | = | =(DropTablesData.cs:90) | =(game.html:14444) | **구현** | EnemyHurt.cs:257 | 42307 |  |
| 56 | `defFlat` | 강철의 | PRE | 갑옷·보조무기·장갑·바지·부츠·망토 | 10/20/30/40/50 | val | 100 | = | =(DropTablesData.cs:91) | =(game.html:14449) | **구현** | InventoryState.cs:143 | 27942 |  |
| 57 | `maxHPFlat` | 강인의 | PRE | 갑옷·보조무기·장갑·바지·부츠·망토 | 60/100/200/300/420 | val | 90 | = | =(DropTablesData.cs:92) | =(game.html:14450) | **구현** | Simulation.Growth.cs:13; InventoryState.cs:142 | 27913 |  |
| 58 | `shieldFlat` | 수호의 | PRE | 갑옷·보조무기·장갑·바지·부츠·망토 | 120/200/400/600/840 | val | 80 | = | =(DropTablesData.cs:93) | =(game.html:14451) | **구현** | InventoryState.cs:142 | 27961 |  |
| 59 | `maxHPPct` | 활력의 | PRE | 갑옷 | 0.05/0.08/0.14/0.22/0.32 | pct | 80 | = | =(DropTablesData.cs:94) | =(game.html:14452) | **구현** | Simulation.Growth.cs:14; InventoryState.cs:142 | 27913 |  |
| 60 | `movSpeed` | 신속의 | PRE | 부츠·망토 | 0.03/0.05/0.09/0.14/0.2 | pct | 85 | = | =(DropTablesData.cs:95) | =(game.html:14453) | **Core 미구현** | - | 27927 |  |
| 61 | `physDR` | 물리방패의 | SUF | 갑옷·보조무기 | 0.04/0.06/0.1/0.16/0.22 | pct | 80 | = | =(DropTablesData.cs:96) | =(game.html:14455) | **구현** | Simulation.PlayerHurt.cs:87 | 43514 |  |
| 62 | `reflect` | 반사의 | SUF | 갑옷·보조무기 | 0.03/0.05/0.09/0.15/0.22 | pct | 70 | = | =(DropTablesData.cs:97) | =(game.html:14456) | **Core 미구현** | - | 43604 |  |
| 63 | `thorns` | 가시의 | SUF | 갑옷·장갑 | 2/4/8/14/22 | val | 65 | = | =(DropTablesData.cs:98) | =(game.html:14457) | **Core 미구현** | - | 43602 |  |
| 64 | `barrier` | 흡수의 | SUF | 갑옷 | 8/15/28/45/65 | val | 60 | = | =(DropTablesData.cs:99) | =(game.html:14458) | **구현** | Simulation.PlayerHurt.cs:94 | 43526 |  |
| 65 | `ccRes` | 인내의 | SUF | 바지 | 0.08/0.12/0.2/0.32/0.44 | pct | 70 | = | =(DropTablesData.cs:100) | =(game.html:14459) | **Core 미구현** | - | 34982 |  |
| 66 | `crisisBoost` | 위기의 | SUF | 갑옷 | 0.15/0.25/0.4/0.65/0.9 | pct | 45 | = | =(DropTablesData.cs:101) | =(game.html:14460) | **구현** | EnemyHurt.cs:173 | 42222 |  |
| 67 | `counterHit` | 피격반격의 | SUF | 갑옷·보조무기 | 0.1/0.15/0.25/0.4/0.55 | prob | 40 | = | =(DropTablesData.cs:102) | =(game.html:14461) | **Core 미구현** | - | 43600 |  |
| 68 | `statusClean` | 정화의 | SUF | 바지 | 1/1/1/2/3 | cnt | 50 | = | =(DropTablesData.cs:103) | =(game.html:14462) | **Core 미구현** | - | 32745 |  |
| 69 | `lastStand` | 불굴의 | SUF | 갑옷 | null/null/null/null/1 | cnt | 20 | = | =(DropTablesData.cs:104) | =(game.html:14463) | **Core 미구현** | - | 43606 | 드랍불가(T1 null) |
| 70 | `reviveOnce` | 부활의 | SUF | 갑옷 | null/null/null/0.2/0.35 | hp | 10 | 누락 | =(DropTablesData.cs:105) | =(game.html:14464) | **구현** | InventoryState.cs:144 | 43727 | 드랍불가(T1 null) |
| 71 | `dropRate` | 약탈의 | SUF | 부츠·망토 | 0.08/0.12/0.2/0.32/0.44 | pct | 70 | = | =(DropTablesData.cs:106) | =(game.html:14466) | **구현** | InventoryState.cs:143 | 27999 |  |
| 72 | `goldBonus` | 골드의 | SUF | 부츠 | 0.1/0.15/0.25/0.4/0.55 | pct | 70 | = | =(DropTablesData.cs:107) | =(game.html:14467) | **구현** | SimulationRage.cs:30; EnemyHurt.DeathTail.cs:489 | 32950 |  |
| 73 | `potionPower` | 포션강화의 | SUF | 바지 | 0.12/0.2/0.35/0.55/0.75 | pct | 60 | = | =(DropTablesData.cs:108) | =(game.html:14468) | **구현** | AutoPotionEquipment.cs:11 | 28232 |  |
| 74 | `extraST` | 사슬의 | SUF | 부츠·바지 | 5/10/20/30/45 | val | 50 | = | =(DropTablesData.cs:109) | =(game.html:14469) | **Core 미구현** | - | 32785 |  |
| 75 | `healthyDef` | 건강방어의 | SUF | 갑옷·보조무기 | 5/10/18/28/40 | val | 50 | = | =(DropTablesData.cs:110) | =(game.html:14471) | **구현** | Simulation.PlayerHurt.cs:97 | 43530 |  |
| 76 | `injuredDR` | 중상보호의 | SUF | 갑옷·보조무기 | 0.06/0.1/0.16/0.24/0.34 | pct | 45 | = | =(DropTablesData.cs:111) | =(game.html:14472) | **구현** | Simulation.PlayerHurt.cs:98 | 43531 |  |
| 77 | `injuredSpeed` | 위기질주의 | SUF | 부츠 | 0.04/0.07/0.11/0.16/0.22 | pct | 45 | = | =(DropTablesData.cs:112) | =(game.html:14473) | **Core 미구현** | - | 27927 |  |
| 78 | `dotDR` | 지속피해방어의 | SUF | 바지·망토 | 0.06/0.1/0.16/0.24/0.34 | pct | 55 | = | =(DropTablesData.cs:113) | =(game.html:14474) | **구현** | Simulation.PlayerHurt.cs:99 | 43532 |  |
| 79 | `bossDR` | 왕피해방어의 | SUF | 갑옷·보조무기 | 0.05/0.08/0.14/0.22/0.3 | pct | 35 | = | =(DropTablesData.cs:114) | =(game.html:14475) | **Core 미구현** | - | 43534 | tierW |
| 80 | `closeDR` | 근접방어의 | SUF | 갑옷 | 0.05/0.08/0.14/0.22/0.3 | pct | 45 | = | =(DropTablesData.cs:115) | =(game.html:14476) | **구현** | Simulation.PlayerHurt.cs:100 | 43536 |  |
| 81 | `farDR` | 원거리방어의 | SUF | 보조무기·망토 | 0.05/0.08/0.14/0.22/0.3 | pct | 45 | = | =(DropTablesData.cs:116) | =(game.html:14477) | **구현** | Simulation.PlayerHurt.cs:100 | 43536 |  |
| 82 | `hpOnKill` | 처치생명의 | SUF | 갑옷·장갑 | 3/6/10/16/24 | val | 50 | = | =(DropTablesData.cs:117) | =(game.html:14478) | **구현** | EnemyHurt.Death.cs:238 | 42654 |  |
| 83 | `shieldOnKill` | 처치수호의 | SUF | 갑옷·보조무기 | 5/10/18/28/40 | val | 45 | = | =(DropTablesData.cs:118) | =(game.html:14479) | **구현** | EnemyHurt.Death.cs:241 | 42657 |  |
| 84 | `fireRes` | 화염수호 | SUF | 반지·목걸이·벨트·귀걸이·팔찌 | 0.08/0.12/0.2/0.32/0.44 | pct | 100 | = | =(DropTablesData.cs:119) | =(game.html:14485) | **죽음** | - | 51316(패널) | 웹 스탯 패널 표시만 |
| 85 | `iceRes` | 빙결수호 | SUF | 반지·목걸이·벨트·귀걸이·팔찌 | 0.08/0.12/0.2/0.32/0.44 | pct | 100 | = | =(DropTablesData.cs:120) | =(game.html:14486) | **죽음** | - | 51316(패널) | 웹 스탯 패널 표시만 |
| 86 | `lightRes` | 암전수호 | SUF | 반지·목걸이·벨트·귀걸이·팔찌 | 0.08/0.12/0.2/0.32/0.44 | pct | 100 | = | =(DropTablesData.cs:121) | =(game.html:14487) | **죽음** | - | 51317(패널) | 웹 스탯 패널 표시만 |
| 87 | `darkRes` | 암흑수호 | SUF | 반지·목걸이·벨트·귀걸이·팔찌 | 0.08/0.12/0.2/0.32/0.44 | pct | 90 | = | =(DropTablesData.cs:122) | =(game.html:14488) | **죽음** | - | 51317(패널) | 웹 스탯 패널 표시만 |
| 88 | `poisonRes` | 독수호 | SUF | 반지·목걸이·벨트·귀걸이·팔찌 | 0.06/0.1/0.18/0.28/0.4 | pct | 90 | = | =(DropTablesData.cs:123) | =(game.html:14489) | **죽음** | - | 51318(패널) | 웹 스탯 패널 표시만 |
| 89 | `allRes` | 전원소수호 | SUF | 목걸이 | 0.03/0.05/0.09/0.15/0.22 | pct | 50 | = | =(DropTablesData.cs:124) | =(game.html:14490) | **죽음** | - | 51315(패널) | 웹 스탯 패널 표시만 |
| 90 | `eDefFlat` | 원소수호의 | SUF | 목걸이·반지·벨트·귀걸이·팔찌 | 25/50/100/150/220 | val | 40 | = | =(DropTablesData.cs:125) | =(game.html:14491) | **구현** | InventoryState.cs:143 | 43512 |  |
| 91 | `maxSTFlat` | 지속의 | PRE | 벨트·팔찌·반지·목걸이·귀걸이 | 20/40/60/80/100 | val | 75 | = | =(DropTablesData.cs:126) | =(game.html:14493) | **구현** | InventoryState.cs:142 | 16431 |  |
| 92 | `maxMPFlat` | 마나의 | PRE | 벨트·팔찌·반지·목걸이·귀걸이 | 20/40/60/80/100 | val | 75 | = | =(DropTablesData.cs:127) | =(game.html:14494) | **구현** | InventoryState.cs:142 | 27931 |  |
| 93 | `mpCostRed` | 절약의 | PRE | 귀걸이·목걸이 | -0.05/-0.08/-0.14/-0.22/-0.3 | pct | 80 | = | =(DropTablesData.cs:128) | =(game.html:14495) | **구현** | Skills/Simulation.Skills.cs:109 | 28041 |  |
| 94 | `stCostRed` | 절약의 | PRE | 벨트·팔찌 | -0.05/-0.08/-0.14/-0.22/-0.3 | pct | 75 | = | =(DropTablesData.cs:129) | =(game.html:14496) | **구현** | Simulation.Crossbow.cs:103; Skills/Simulation.Skills.cs:110 | 31983 |  |
| 95 | `expBonus` | 경험의 | SUF | 목걸이 | 0.06/0.1/0.18/0.28/0.4 | pct | 65 | = | =(DropTablesData.cs:130) | =(game.html:14498) | **구현** | EquipmentApplication.cs:12 | 43143 |  |
| 96 | `antiRevive` | 진혼의 | SUF | 목걸이·팔찌 | 0.04/0.08/0.12/0.16/0.2 | pct | 40 | = | =(DropTablesData.cs:131) | =(game.html:14499) | **구현** | EnemyHurt.cs:160; EnemyHurt.Death.cs:83 | 42209 | tierW; 중복행 1/2 |
| 97 | `antiRevive` | 진혼의 | SUF | 반지 | 0.02/0.04/0.08/0.12/0.16 | pct | 40 | = | =(DropTablesData.cs:132) | =(game.html:14500) | **구현** | EnemyHurt.cs:160; EnemyHurt.Death.cs:83 | 42209 | tierW; 중복행 2/2 |
| 98 | `revivePow` | 부활의 | PRE | 팔찌 | 0.06/0.1/0.18/0.28/0.4 | pct | 80 | = | =(DropTablesData.cs:133) | =(game.html:14502) | **구현** | InventoryState.cs:144 | 43741 | brType demon |
| 99 | `reviveCd` | 윤회의 | PRE | 팔찌 | -0.06/-0.1/-0.18/-0.28/-0.4 | pct | 70 | = | =(DropTablesData.cs:134) | =(game.html:14503) | **구현** | InventoryState.cs:144 | 43747 | brType demon |
| 100 | `lifeMaxHP` | 생명력의 | PRE | 팔찌 | 0.05/0.08/0.14/0.22/0.32 | pct | 85 | = | =(DropTablesData.cs:135) | =(game.html:14505) | **구현** | Simulation.Growth.cs:14; InventoryState.cs:142 | 27913 | brType life |
| 101 | `lifeRegen` | 재생의 | PRE | 팔찌 | 1/3/6/10/15 | val | 80 | = | =(DropTablesData.cs:136) | =(game.html:14506) | **Core 미구현** | - | 27930 | brType life |
| 102 | `lifeHealPow` | 치유의 | PRE | 팔찌 | 0.06/0.1/0.18/0.28/0.4 | pct | 75 | = | =(DropTablesData.cs:137) | =(game.html:14507) | **Core 미구현** | - | 32713 | brType life |
| 103 | `lckFlatN` | 행운의 | PRE | 목걸이 | 20/40/60/80/100 | val | 80 | = | =(DropTablesData.cs:138) | =(game.html:14509) | **Core 미구현** | - | 27996 |  |
| 104 | `lckFlatR` | 행운의 | PRE | 반지·팔찌·벨트·귀걸이 | 10/20/30/40/50 | val | 80 | = | =(DropTablesData.cs:139) | =(game.html:14510) | **Core 미구현** | - | 27996 |  |
| 105 | `gritFlatN` | 근성의 | SUF | 목걸이 | 20/40/60/80/100 | val | 80 | = | =(DropTablesData.cs:140) | =(game.html:14511) | **구현** | InventoryState.cs:136 | 27897 |  |
| 106 | `gritFlatR` | 근성의 | SUF | 반지·팔찌·벨트·귀걸이 | 10/20/30/40/50 | val | 80 | = | =(DropTablesData.cs:141) | =(game.html:14512) | **구현** | InventoryState.cs:136 | 27897 |  |
| 107 | `healthyAtk` | 건강공세의 | SUF | 반지·목걸이 | 0.08/0.14/0.22/0.32/0.44 | pct | 45 | = | =(DropTablesData.cs:142) | =(game.html:14514) | **구현** | EnemyHurt.cs:189 | 42239 |  |
| 108 | `injuredDmg` | 중상폭발의 | SUF | 반지·목걸이 | 0.12/0.2/0.32/0.46/0.65 | pct | 40 | = | =(DropTablesData.cs:143) | =(game.html:14515) | **구현** | EnemyHurt.cs:191 | 42241 |  |
| 109 | `injuredLeech` | 중상흡혈의 | SUF | 반지 | 0.008/0.015/0.025/0.04/0.06 | pct | 30 | = | =(DropTablesData.cs:144) | =(game.html:14516) | **구현** | EnemyHurt.Body.cs:60 | 42361 | tierW |
| 110 | `vsBossDmg` | 토벌의 | SUF | 목걸이·반지 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:145) | =(game.html:14517) | **구현** | EnemyHurt.cs:202 | 42258 | tierW |
| 111 | `vsEliteDmg` | 정예토벌의 | SUF | 목걸이 | 0.1/0.18/0.28/0.4/0.55 | pct | 40 | = | =(DropTablesData.cs:146) | =(game.html:14518) | **구현** | EnemyHurt.cs:203 | 42259 |  |
| 112 | `fireDmgPct` | 화염강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 70 | = | =(DropTablesData.cs:147) | =(game.html:14524) | **구현** | EnemyHurt.cs:167 | 42216 |  |
| 113 | `firePen` | 화염관통의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.32 | pct | 50 | = | =(DropTablesData.cs:148) | =(game.html:14525) | **죽음** | - | - |  |
| 114 | `fireOnHit` | 발화의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | prob | 55 | = | =(DropTablesData.cs:149) | =(game.html:14526) | **구현** | EnemyHurt.Body.cs:70 | 42371 |  |
| 115 | `fireBurst` | 화염폭발의 | SUF | 무기 | 15/28/45/70/100 | val | 35 | = | =(DropTablesData.cs:150) | =(game.html:14527) | **죽음** | - | - |  |
| 116 | `fireDuration` | 맹화의 | PRE | 왕관 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:151) | =(game.html:14528) | **죽음** | - | - |  |
| 117 | `fireDmgBns` | 화염의힘 | SUF | 반지·목걸이 | 0.06/0.1/0.18/0.28/0.4 | pct | 60 | = | =(DropTablesData.cs:152) | =(game.html:14529) | **구현** | EnemyHurt.cs:168 | 42217 |  |
| 118 | `iceDmgPct` | 빙결강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 70 | = | =(DropTablesData.cs:153) | =(game.html:14531) | **구현** | EnemyHurt.cs:167 | 42216 |  |
| 119 | `icePen` | 빙결관통의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.32 | pct | 50 | = | =(DropTablesData.cs:154) | =(game.html:14532) | **죽음** | - | - |  |
| 120 | `iceOnHit` | 동결의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | prob | 50 | = | =(DropTablesData.cs:155) | =(game.html:14533) | **구현** | EnemyHurt.Body.cs:71 | 42372 |  |
| 121 | `iceBurst` | 빙결폭발의 | SUF | 무기 | 12/22/38/58/85 | val | 35 | = | =(DropTablesData.cs:156) | =(game.html:14534) | **죽음** | - | - |  |
| 122 | `iceDuration` | 영빙의 | PRE | 왕관 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:157) | =(game.html:14535) | **죽음** | - | - |  |
| 123 | `iceDmgBns` | 빙결의힘 | SUF | 반지·목걸이 | 0.06/0.1/0.18/0.28/0.4 | pct | 60 | = | =(DropTablesData.cs:158) | =(game.html:14536) | **구현** | EnemyHurt.cs:168 | 42217 |  |
| 124 | `lightDmgPct` | 뇌전강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 70 | = | =(DropTablesData.cs:159) | =(game.html:14538) | **구현** | EnemyHurt.cs:167 | 42216 |  |
| 125 | `lightPen` | 뇌전관통의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.32 | pct | 50 | = | =(DropTablesData.cs:160) | =(game.html:14539) | **죽음** | - | - |  |
| 126 | `lightOnHit` | 감전의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | prob | 50 | = | =(DropTablesData.cs:161) | =(game.html:14540) | **구현** | EnemyHurt.Body.cs:72 | 42373 |  |
| 127 | `lightBurst` | 뇌전폭발의 | SUF | 무기 | 18/32/52/80/115 | val | 35 | = | =(DropTablesData.cs:162) | =(game.html:14541) | **죽음** | - | - |  |
| 128 | `lightDuration` | 낙뢰의 | PRE | 왕관 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:163) | =(game.html:14542) | **죽음** | - | - |  |
| 129 | `lightDmgBns` | 뇌전의힘 | SUF | 반지·목걸이 | 0.06/0.1/0.18/0.28/0.4 | pct | 60 | = | =(DropTablesData.cs:164) | =(game.html:14543) | **구현** | EnemyHurt.cs:168 | 42217 |  |
| 130 | `darkDmgPct` | 암흑강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 65 | = | =(DropTablesData.cs:165) | =(game.html:14545) | **구현** | EnemyHurt.cs:167 | 42216 |  |
| 131 | `darkPen` | 암흑관통의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.32 | pct | 45 | = | =(DropTablesData.cs:166) | =(game.html:14546) | **죽음** | - | - |  |
| 132 | `darkOnHit` | 침식의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | prob | 45 | = | =(DropTablesData.cs:167) | =(game.html:14547) | **구현** | EnemyHurt.Body.cs:73 | 42374 |  |
| 133 | `darkBurst` | 암흑폭발의 | SUF | 무기 | 14/26/42/65/95 | val | 30 | = | =(DropTablesData.cs:168) | =(game.html:14548) | **죽음** | - | - |  |
| 134 | `darkDuration` | 심연의 | PRE | 왕관 | 0.1/0.18/0.28/0.4/0.55 | pct | 50 | = | =(DropTablesData.cs:169) | =(game.html:14549) | **죽음** | - | - |  |
| 135 | `darkDmgBns` | 암흑의힘 | SUF | 반지·목걸이 | 0.06/0.1/0.18/0.28/0.4 | pct | 55 | = | =(DropTablesData.cs:170) | =(game.html:14550) | **구현** | EnemyHurt.cs:168 | 42217 |  |
| 136 | `poisonDmgPct` | 맹독강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 65 | = | =(DropTablesData.cs:171) | =(game.html:14552) | **구현** | EnemyHurt.cs:170 | 42219 |  |
| 137 | `poisonPen` | 독관통의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.32 | pct | 45 | = | =(DropTablesData.cs:172) | =(game.html:14553) | **죽음** | - | - |  |
| 138 | `poisonOnHit` | 중독의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | prob | 55 | = | =(DropTablesData.cs:173) | =(game.html:14554) | **구현** | EnemyHurt.Body.cs:74 | 42375 |  |
| 139 | `poisonBurst` | 독폭발의 | SUF | 무기 | 10/20/35/55/80 | val | 30 | = | =(DropTablesData.cs:174) | =(game.html:14555) | **죽음** | - | - |  |
| 140 | `poisonDuration` | 맹독지속의 | PRE | 왕관 | 0.12/0.2/0.32/0.46/0.65 | pct | 55 | = | =(DropTablesData.cs:175) | =(game.html:14556) | **죽음** | - | - |  |
| 141 | `poisonDmgBns` | 독의힘 | SUF | 반지·목걸이 | 0.06/0.1/0.18/0.28/0.4 | pct | 55 | = | =(DropTablesData.cs:176) | =(game.html:14557) | **구현** | EnemyHurt.cs:170 | 42219 |  |
| 142 | `meleeDmgPct` | 격투의 | PRE | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 75 | = | =(DropTablesData.cs:177) | =(game.html:14562) | **구현** | EnemyHurt.cs:227 | 42276 |  |
| 143 | `rangedDmgPct` | 원사의 | PRE | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 75 | = | =(DropTablesData.cs:178) | =(game.html:14563) | **구현** | EnemyHurt.cs:228; Simulation.EnemyBridge.cs:81 | 42277 |  |
| 144 | `spellDmgPct` | 주술의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 75 | = | =(DropTablesData.cs:179) | =(game.html:14564) | **구현** | EnemyHurt.cs:229; EnemyHurt.cs:230 | 42278 |  |
| 145 | `beamDmgPct` | 광선의 | PRE | 왕관 | 0.1/0.18/0.28/0.4/0.55 | pct | 55 | = | =(DropTablesData.cs:180) | =(game.html:14565) | **구현** | EnemyHurt.cs:230 | 42279 |  |
| 146 | `dotDmgPct` | 침식의 | PRE | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 60 | = | =(DropTablesData.cs:181) | =(game.html:14566) | **구현** | EnemyHurt.cs:231 | 42280 |  |
| 147 | `projDmgPct` | 탄도의 | PRE | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 65 | = | =(DropTablesData.cs:182) | =(game.html:14567) | **구현** | EnemyHurt.cs:228; EnemyHurt.cs:232 | 42277 |  |
| 148 | `aoeRadiusPct` | 확산의 | PRE | 무기·왕관 | 0.06/0.1/0.16/0.24/0.34 | pct | 55 | = | =(DropTablesData.cs:183) | =(game.html:14568) | **죽음** | - | - |  |
| 149 | `critRateMelee` | 근접회심의 | PRE | 무기 | 0.01/0.02/0.03/0.04/0.06 | pct | 45 | = | =(DropTablesData.cs:184) | =(game.html:14573) | **구현** | EnemyHurt.cs:263 | 42311 | tierW |
| 150 | `critRateSpell` | 마법회심의 | PRE | 왕관 | 0.01/0.02/0.03/0.04/0.06 | pct | 45 | = | =(DropTablesData.cs:185) | =(game.html:14574) | **구현** | EnemyHurt.cs:264 | 42312 | tierW |
| 151 | `critRateBow` | 사격회심의 | PRE | 석궁 | 0.01/0.02/0.03/0.04/0.06 | pct | 45 | = | =(DropTablesData.cs:186) | =(game.html:14575) | **구현** | EnemyHurt.cs:265; Simulation.EnemyBridge.cs:82 | 42313 | tierW |
| 152 | `meleeAtkSpd` | 근접쾌속의 | PRE | 무기 | 0.04/0.07/0.11/0.16/0.22 | pct | 65 | = | =(DropTablesData.cs:187) | =(game.html:14576) | **Core 미구현** | - | 33364 |  |
| 153 | `bowAtkSpd` | 사격쾌속의 | PRE | 석궁 | 0.04/0.07/0.11/0.16/0.22 | pct | 65 | = | =(DropTablesData.cs:188) | =(game.html:14577) | **Core 미구현** | - | 28696 |  |
| 154 | `castSpeed` | 영창의 | PRE | 왕관 | 0.04/0.07/0.11/0.16/0.22 | pct | 65 | = | =(DropTablesData.cs:189) | =(game.html:14578) | **구현** | Skills/Simulation.Fireball.cs:38 | 28050 |  |
| 155 | `elemPenAll` | 전속성관통의 | SUF | 무기 | 0.03/0.05/0.09/0.15/0.22 | pct | 30 | = | =(DropTablesData.cs:190) | =(game.html:14579) | **죽음** | - | - | tierW |
| 156 | `shieldBypass` | 쉴드파괴의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.32 | prob | 30 | = | =(DropTablesData.cs:191) | =(game.html:14580) | **죽음** | - | - | tierW |
| 157 | `armorShred` | 갑옷분쇄의 | SUF | 무기 | 3/6/10/16/24 | val | 50 | = | =(DropTablesData.cs:192) | =(game.html:14581) | **죽음** | - | - |  |
| 158 | `projSpeedPct` | 탄속의 | PRE | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 55 | = | =(DropTablesData.cs:193) | =(game.html:14582) | **죽음** | - | - |  |
| 159 | `onHitFireball` | 화구발사의 | SUF | 무기 | 0.04/0.07/0.11/0.16/0.22 | prob | 25 | = | =(DropTablesData.cs:194) | =(game.html:14585) | **죽음** | - | - | tierW |
| 160 | `onHitChainL` | 연쇄뇌격의 | SUF | 무기 | 0.04/0.07/0.11/0.16/0.22 | prob | 25 | = | =(DropTablesData.cs:195) | =(game.html:14586) | **죽음** | - | - | tierW |
| 161 | `onHitFreeze` | 동결타의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.3 | prob | 40 | = | =(DropTablesData.cs:196) | =(game.html:14587) | **구현** | EnemyHurt.Body.cs:77 | 42378 |  |
| 162 | `onHitStun` | 경직타의 | SUF | 무기 | 0.03/0.05/0.09/0.15/0.22 | prob | 35 | = | =(DropTablesData.cs:197) | =(game.html:14588) | **구현** | EnemyHurt.Body.cs:76 | 42377 |  |
| 163 | `onHitPoison` | 독침의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | prob | 45 | = | =(DropTablesData.cs:198) | =(game.html:14589) | **죽음** | - | - |  |
| 164 | `onHitBleed` | 출혈의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.3 | prob | 40 | = | =(DropTablesData.cs:199) | =(game.html:14590) | **구현** | EnemyHurt.Body.cs:75 | 42376 |  |
| 165 | `onHitWeaken` | 약화의 | SUF | 무기 | 0.04/0.07/0.11/0.16/0.22 | prob | 35 | = | =(DropTablesData.cs:200) | =(game.html:14591) | **죽음** | - | - |  |
| 166 | `onHitSlow` | 둔화의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | prob | 40 | = | =(DropTablesData.cs:201) | =(game.html:14592) | **죽음** | - | - |  |
| 167 | `onHitMark` | 표적의 | SUF | 무기 | 0.05/0.08/0.14/0.22/0.3 | prob | 30 | = | =(DropTablesData.cs:202) | =(game.html:14593) | **죽음** | - | - |  |
| 168 | `onCritExplode` | 회심폭발의 | SUF | 무기 | 0.2/0.35/0.55/0.8/1.15 | pct | 20 | = | =(DropTablesData.cs:203) | =(game.html:14594) | **구현** | EnemyHurt.cs:279 | 42320 | tierW |
| 169 | `onCritChain` | 회심연쇄의 | SUF | 무기 | 0.15/0.25/0.4/0.6/0.85 | pct | 20 | = | =(DropTablesData.cs:204) | =(game.html:14595) | **구현** | EnemyHurt.cs:286 | 42321 | tierW |
| 170 | `onCritFreeze` | 회심빙결의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | prob | 30 | = | =(DropTablesData.cs:205) | =(game.html:14596) | **구현** | EnemyHurt.cs:293 | 42322 |  |
| 171 | `onCritHeal` | 회심치유의 | SUF | 무기 | 5/10/18/28/40 | val | 35 | = | =(DropTablesData.cs:206) | =(game.html:14597) | **구현** | EnemyHurt.cs:295 | 42323 |  |
| 172 | `onCritMana` | 회심영력의 | SUF | 무기 | 3/6/10/16/24 | val | 35 | = | =(DropTablesData.cs:207) | =(game.html:14598) | **구현** | EnemyHurt.cs:296 | 42324 |  |
| 173 | `onCritShield` | 회심수호의 | SUF | 무기·왕관 | 5/10/18/28/40 | val | 30 | = | =(DropTablesData.cs:208) | =(game.html:14599) | **구현** | EnemyHurt.cs:297 | 42325 |  |
| 174 | `onHitDefBoost` | 피격강화의 | SUF | 갑옷·보조무기 | 5/10/18/28/40 | val | 40 | = | =(DropTablesData.cs:209) | =(game.html:14600) | **죽음** | - | - |  |
| 175 | `onHitThorns` | 반격가시의 | SUF | 갑옷·장갑 | 3/6/10/16/24 | val | 45 | = | =(DropTablesData.cs:210) | =(game.html:14601) | **죽음** | - | - |  |
| 176 | `onDodgeDmg` | 회피반격의 | SUF | 부츠·망토 | 0.1/0.18/0.28/0.4/0.55 | pct | 35 | = | =(DropTablesData.cs:211) | =(game.html:14603) | **죽음** | - | - |  |
| 177 | `onParryBurst` | 패링폭파의 | SUF | 보조무기 | 0.15/0.25/0.4/0.6/0.85 | pct | 30 | = | =(DropTablesData.cs:212) | =(game.html:14604) | **죽음** | - | - |  |
| 178 | `onBlockHeal` | 블록치유의 | SUF | 보조무기 | 5/10/18/28/40 | val | 40 | = | =(DropTablesData.cs:213) | =(game.html:14605) | **죽음** | - | - |  |
| 179 | `onBlockMana` | 블록영력의 | SUF | 보조무기 | 3/6/10/16/24 | val | 40 | = | =(DropTablesData.cs:214) | =(game.html:14606) | **죽음** | - | - |  |
| 180 | `kiSlashParry` | 검기막이의 | SUF | 무기·장갑·팔찌 | 20/20/20/20/20 | tick | 30 | = | =(DropTablesData.cs:215) | =(game.html:14608) | **Core 미구현** | - | 16826 | minGrade 5 |
| 181 | `kiSlashFullCrit` | 극참의 | SUF | 무기·장갑·팔찌 | 1/1/1/1/1 | pct | 30 | = | =(DropTablesData.cs:216) | =(game.html:14610) | **구현** | EnemyHurt.cs:267 | 42315 |  |
| 182 | `skWhirlDmg` | 회전참강화 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:217) | =(game.html:14613) | **죽음** | - | - |  |
| 183 | `skBeamDmg` | 옴니빔강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:218) | =(game.html:14614) | **죽음** | - | - |  |
| 184 | `skFireballDmg` | 화구강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:219) | =(game.html:14615) | **죽음** | - | - |  |
| 185 | `maliceWeakAmp` | 잠식의 | SUF | 왕관 | 0.05/0.08/0.12/0.16/0.2 | pct | 35 | = | =(DropTablesData.cs:220) | =(game.html:14616) | **구현** | Skills/Simulation.Fireball.cs:159 | 24572 |  |
| 186 | `skMissileDmg` | 미사일강화 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:221) | =(game.html:14617) | **죽음** | - | - |  |
| 187 | `skBlueShotDmg` | 청탄강화 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:222) | =(game.html:14618) | **죽음** | - | - |  |
| 188 | `skBlastShotDmg` | 폭렬탄강화 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:223) | =(game.html:14619) | **죽음** | - | - |  |
| 189 | `skHellRayDmg` | 지옥광선강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:224) | =(game.html:14620) | **죽음** | - | - |  |
| 190 | `skMaliceStormDmg` | 악의폭풍강화 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:225) | =(game.html:14621) | **죽음** | - | - |  |
| 191 | `skChainSlashDmg` | 연쇄참강화 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:226) | =(game.html:14622) | **죽음** | - | - |  |
| 192 | `skGiantSlamDmg` | 지옥강타 1 강화 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:227) | =(game.html:14623) | **죽음** | - | - |  |
| 193 | `skGhostWalkDmg` | 유령보행강화 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:228) | =(game.html:14624) | **죽음** | - | - |  |
| 194 | `skMaliceMortarDmg` | 악의박격강화 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:229) | =(game.html:14625) | **죽음** | - | - |  |
| 195 | `skFireAuraDmg` | 화염오라강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:230) | =(game.html:14626) | **죽음** | - | - |  |
| 196 | `skIceOrbDmg` | 빙구강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:231) | =(game.html:14627) | **죽음** | - | - |  |
| 197 | `skFireBeamDmg` | 화염빔강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:232) | =(game.html:14628) | **죽음** | - | - |  |
| 198 | `skMaliceHuntDmg` | 악의사냥강화 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:233) | =(game.html:14629) | **죽음** | - | - |  |
| 199 | `skDarkPillarDmg` | 암흑기둥강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:234) | =(game.html:14630) | **죽음** | - | - |  |
| 200 | `skPlagueDmg` | 역병강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:235) | =(game.html:14631) | **죽음** | - | - |  |
| 201 | `skSpikeAuraDmg` | 가시오라강화 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:236) | =(game.html:14632) | **죽음** | - | - |  |
| 202 | `skChainAssaultDmg` | 연쇄돌격강화 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:237) | =(game.html:14633) | **죽음** | - | - |  |
| 203 | `dodgeChance` | 회피의 | SUF | 부츠·망토 | 0.02/0.04/0.06/0.09/0.13 | pct | 45 | = | =(DropTablesData.cs:238) | =(game.html:14636) | **Core 미구현** | - | 43432 | tierW |
| 204 | `dodgeCooldown` | 회피쿨감의 | SUF | 부츠 | -0.05/-0.08/-0.14/-0.22/-0.3 | pct | 50 | = | =(DropTablesData.cs:239) | =(game.html:14637) | **죽음** | - | - |  |
| 205 | `maxHPPctArmor` | 생명력의 | PRE | 바지·보조무기 | 0.04/0.07/0.11/0.16/0.22 | pct | 65 | = | =(DropTablesData.cs:240) | =(game.html:14638) | **죽음** | - | - |  |
| 206 | `shieldPct` | 수호력의 | PRE | 갑옷 | 0.1/0.16/0.28/0.44/0.64 | pct | 55 | = | =(DropTablesData.cs:241) | =(game.html:14639) | **죽음** | - | - |  |
| 207 | `shieldRegenPct` | 수호재생의 | SUF | 갑옷·보조무기 | 0.04/0.07/0.11/0.16/0.22 | pct | 50 | = | =(DropTablesData.cs:242) | =(game.html:14640) | **죽음** | - | - |  |
| 208 | `shieldCdRed` | 수호쿨감의 | SUF | 보조무기 | -0.05/-0.08/-0.14/-0.22/-0.3 | pct | 45 | = | =(DropTablesData.cs:243) | =(game.html:14641) | **Core 미구현** | - | 14308 |  |
| 209 | `hpRegenFlat` | 재생의 | PRE | 갑옷·장갑 | 1/2/4/7/11 | val | 60 | = | =(DropTablesData.cs:244) | =(game.html:14642) | **죽음** | - | - |  |
| 210 | `hpRegenPct` | 재생력의 | PRE | 갑옷 | 0.03/0.05/0.09/0.15/0.22 | pct | 50 | = | =(DropTablesData.cs:245) | =(game.html:14643) | **죽음** | - | - |  |
| 211 | `stRegenFlat` | 활력재생의 | PRE | 부츠·바지 | 1/2/3/5/8 | val | 55 | = | =(DropTablesData.cs:246) | =(game.html:14644) | **죽음** | - | - |  |
| 212 | `stRegenPct` | 활력의 | PRE | 벨트 | 0.03/0.05/0.09/0.15/0.22 | pct | 50 | = | =(DropTablesData.cs:247) | =(game.html:14645) | **죽음** | - | - |  |
| 213 | `mpRegenFlat` | 마력재생의 | PRE | 귀걸이·목걸이 | 1/2/3/5/8 | val | 55 | = | =(DropTablesData.cs:248) | =(game.html:14646) | **죽음** | - | - |  |
| 214 | `mpRegenPct` | 마력의 | PRE | 귀걸이 | 0.03/0.05/0.09/0.15/0.22 | pct | 50 | = | =(DropTablesData.cs:249) | =(game.html:14647) | **죽음** | - | - |  |
| 215 | `fireDR` | 화염보호의 | SUF | 갑옷·망토 | 0.04/0.07/0.11/0.16/0.22 | pct | 55 | = | =(DropTablesData.cs:250) | =(game.html:14648) | **죽음** | - | - |  |
| 216 | `iceDR` | 빙결보호의 | SUF | 갑옷·바지 | 0.04/0.07/0.11/0.16/0.22 | pct | 55 | = | =(DropTablesData.cs:251) | =(game.html:14649) | **죽음** | - | - |  |
| 217 | `lightDR` | 뇌전보호의 | SUF | 갑옷·장갑 | 0.04/0.07/0.11/0.16/0.22 | pct | 55 | = | =(DropTablesData.cs:252) | =(game.html:14650) | **죽음** | - | - |  |
| 218 | `darkDR` | 암흑보호의 | SUF | 갑옷·보조무기 | 0.04/0.07/0.11/0.16/0.22 | pct | 50 | = | =(DropTablesData.cs:253) | =(game.html:14651) | **죽음** | - | - |  |
| 219 | `poisonDRdef` | 해독의 | SUF | 갑옷·부츠 | 0.04/0.07/0.11/0.16/0.22 | pct | 50 | = | =(DropTablesData.cs:254) | =(game.html:14652) | **죽음** | - | - |  |
| 220 | `allDR` | 만물보호의 | SUF | 갑옷 | 0.02/0.04/0.06/0.09/0.13 | pct | 15 | = | =(DropTablesData.cs:255) | =(game.html:14653) | **죽음** | - | - | tierW |
| 221 | `eliteDR` | 정예보호의 | SUF | 갑옷 | 0.05/0.08/0.14/0.22/0.3 | pct | 35 | = | =(DropTablesData.cs:256) | =(game.html:14654) | **죽음** | - | - |  |
| 222 | `stunRes` | 경직저항의 | SUF | 바지·장갑 | 0.06/0.1/0.16/0.24/0.34 | pct | 55 | = | =(DropTablesData.cs:257) | =(game.html:14655) | **Core 미구현** | - | 34982 |  |
| 223 | `freezeRes` | 빙결저항의 | SUF | 바지·부츠 | 0.06/0.1/0.16/0.24/0.34 | pct | 55 | = | =(DropTablesData.cs:258) | =(game.html:14656) | **죽음** | - | - |  |
| 224 | `slowRes` | 감속저항의 | SUF | 부츠 | 0.06/0.1/0.16/0.24/0.34 | pct | 55 | = | =(DropTablesData.cs:259) | =(game.html:14657) | **구현** | Simulation.EnemyAi.cs:171 | 34699 |  |
| 225 | `knockbackRes` | 넉백저항의 | SUF | 갑옷·보조무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 50 | = | =(DropTablesData.cs:260) | =(game.html:14658) | **죽음** | - | - |  |
| 226 | `dashRange` | 돌진거리의 | PRE | 부츠 | 0.05/0.08/0.14/0.22/0.3 | pct | 45 | = | =(DropTablesData.cs:261) | =(game.html:14659) | **죽음** | - | - |  |
| 227 | `dashCooldown` | 돌진쿨감의 | SUF | 부츠·망토 | -0.04/-0.07/-0.11/-0.16/-0.22 | pct | 45 | = | =(DropTablesData.cs:262) | =(game.html:14660) | **Core 미구현** | - | 32789 |  |
| 228 | `movSpeedCombat` | 전투질주의 | PRE | 부츠 | 0.03/0.05/0.08/0.12/0.18 | pct | 40 | = | =(DropTablesData.cs:263) | =(game.html:14661) | **Core 미구현** | - | 27927 |  |
| 229 | `movSpeedOOC` | 평화질주의 | PRE | 부츠·망토 | 0.06/0.1/0.16/0.24/0.34 | pct | 60 | = | =(DropTablesData.cs:264) | =(game.html:14662) | **Core 미구현** | - | 27928 |  |
| 230 | `pickupRadius` | 습득범위의 | SUF | 부츠 | 10/20/35/55/80 | val | 55 | = | =(DropTablesData.cs:265) | =(game.html:14663) | **죽음** | - | - |  |
| 231 | `strFlat` | 힘의 | PRE | 반지·목걸이·벨트·팔찌·귀걸이 | 5/10/18/28/40 | val | 60 | = | =(DropTablesData.cs:266) | =(game.html:14666) | **구현** | InventoryState.cs:140 | 27907 |  |
| 232 | `dexFlat` | 민첩의 | PRE | 반지·목걸이·벨트·팔찌·귀걸이 | 5/10/18/28/40 | val | 60 | = | =(DropTablesData.cs:267) | =(game.html:14667) | **구현** | InventoryState.cs:140 | 27907 |  |
| 233 | `intFlat` | 지능의 | PRE | 반지·목걸이·벨트·팔찌·귀걸이 | 5/10/18/28/40 | val | 60 | = | =(DropTablesData.cs:268) | =(game.html:14668) | **구현** | InventoryState.cs:140 | 27907 |  |
| 234 | `vitFlat` | 활력의 | PRE | 반지·목걸이·벨트·팔찌·귀걸이 | 5/10/18/28/40 | val | 60 | = | =(DropTablesData.cs:269) | =(game.html:14669) | **구현** | InventoryState.cs:140 | 27907 |  |
| 235 | `allStat` | 만능의 | SUF | 목걸이 | 2/4/7/11/16 | val | 15 | = | =(DropTablesData.cs:270) | =(game.html:14670) | **죽음** | - | - | tierW |
| 236 | `maxSTPct` | 지구력의 | PRE | 벨트·팔찌 | 0.05/0.08/0.14/0.22/0.3 | pct | 55 | = | =(DropTablesData.cs:271) | =(game.html:14671) | **죽음** | - | - |  |
| 237 | `maxMPPct` | 마나력의 | PRE | 귀걸이·목걸이 | 0.05/0.08/0.14/0.22/0.3 | pct | 55 | = | =(DropTablesData.cs:272) | =(game.html:14672) | **죽음** | - | 51379(패널) | 웹 스탯 패널 표시만 |
| 238 | `resourceOnHit` | 타격자원의 | SUF | 반지 | 1/2/3/5/8 | val | 35 | = | =(DropTablesData.cs:273) | =(game.html:14673) | **죽음** | - | - |  |
| 239 | `fireResMax` | 화염한계의 | SUF | 목걸이·반지 | 1/2/3/4/5 | val | 20 | = | =(DropTablesData.cs:274) | =(game.html:14674) | **죽음** | - | - | tierW |
| 240 | `iceResMax` | 빙결한계의 | SUF | 목걸이·반지 | 1/2/3/4/5 | val | 20 | = | =(DropTablesData.cs:275) | =(game.html:14675) | **죽음** | - | - | tierW |
| 241 | `lightResMax` | 뇌전한계의 | SUF | 목걸이·반지 | 1/2/3/4/5 | val | 20 | = | =(DropTablesData.cs:276) | =(game.html:14676) | **죽음** | - | - | tierW |
| 242 | `darkResMax` | 암흑한계의 | SUF | 목걸이·반지 | 1/2/3/4/5 | val | 20 | = | =(DropTablesData.cs:277) | =(game.html:14677) | **죽음** | - | - | tierW |
| 243 | `poisonResMax` | 독한계의 | SUF | 목걸이·반지 | 1/2/3/4/5 | val | 20 | = | =(DropTablesData.cs:278) | =(game.html:14678) | **죽음** | - | - | tierW |
| 244 | `skillCdRed` | 스킬쿨감의 | SUF | 귀걸이 | -0.04/-0.07/-0.11/-0.16/-0.22 | pct | 50 | = | =(DropTablesData.cs:279) | =(game.html:14679) | **구현** | Skills/Simulation.Skills.cs:107 | 28065 |  |
| 245 | `potionCdRed` | 물약쿨감의 | SUF | 벨트 | -0.04/-0.07/-0.11/-0.16/-0.22 | pct | 55 | = | =(DropTablesData.cs:280) | =(game.html:14680) | **Core 미구현** | - | 28228 |  |
| 246 | `craftBonus` | 장인의 | SUF | 반지 | 0.03/0.05/0.08/0.12/0.18 | pct | 15 | = | =(DropTablesData.cs:281) | =(game.html:14681) | **죽음** | - | - | tierW |
| 247 | `goldFind` | 탐욕의 | SUF | 벨트 | 0.08/0.14/0.22/0.32/0.44 | pct | 55 | = | =(DropTablesData.cs:282) | =(game.html:14682) | **죽음** | - | - |  |
| 248 | `expBonusRing` | 수련의 | SUF | 반지 | 0.05/0.08/0.14/0.22/0.3 | pct | 50 | = | =(DropTablesData.cs:283) | =(game.html:14683) | **죽음** | - | - |  |
| 249 | `dropRateAcc` | 수집의 | SUF | 목걸이·반지 | 0.05/0.08/0.14/0.22/0.3 | pct | 45 | = | =(DropTablesData.cs:284) | =(game.html:14684) | **죽음** | - | - |  |
| 250 | `demonDmg` | 악마의힘 | SUF | 팔찌 | 0.08/0.14/0.22/0.32/0.44 | pct | 55 | = | =(DropTablesData.cs:285) | =(game.html:14685) | **죽음** | - | - | brType demon |
| 251 | `demonDR` | 악마보호의 | SUF | 팔찌 | 0.05/0.08/0.14/0.22/0.3 | pct | 50 | = | =(DropTablesData.cs:286) | =(game.html:14686) | **죽음** | - | - | brType demon |
| 252 | `soulHarvest` | 영혼수확의 | SUF | 팔찌 | 1/2/3/5/8 | val | 40 | = | =(DropTablesData.cs:287) | =(game.html:14687) | **죽음** | - | - | brType demon |
| 253 | `lifeLeechBr` | 생명흡수의 | SUF | 팔찌 | 0.005/0.01/0.018/0.028/0.04 | pct | 40 | = | =(DropTablesData.cs:288) | =(game.html:14688) | **죽음** | - | - | brType life |
| 254 | `overhealShield` | 과치유수호의 | SUF | 팔찌 | 0.1/0.18/0.28/0.4/0.55 | pct | 25 | = | =(DropTablesData.cs:289) | =(game.html:14689) | **죽음** | - | - | brType life; tierW |
| 255 | `onFullManaDmg` | 만마력의 | SUF | 귀걸이 | 0.08/0.14/0.22/0.32/0.44 | pct | 40 | = | =(DropTablesData.cs:290) | =(game.html:14690) | **죽음** | - | - |  |
| 256 | `whileMovingDR` | 이동방어의 | SUF | 벨트 | 0.04/0.07/0.11/0.16/0.22 | pct | 40 | = | =(DropTablesData.cs:291) | =(game.html:14691) | **죽음** | - | - |  |
| 257 | `whileStationaryDmg` | 정지공세의 | SUF | 반지 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:292) | =(game.html:14692) | **죽음** | - | - |  |
| 258 | `afterDodgeDmg` | 회피공세의 | SUF | 반지·팔찌 | 0.1/0.18/0.28/0.4/0.55 | pct | 30 | = | =(DropTablesData.cs:293) | =(game.html:14693) | **죽음** | - | - |  |
| 259 | `afterParryShield` | 패링보호의 | SUF | 팔찌·보조무기 | 10/18/28/40/60 | val | 35 | = | =(DropTablesData.cs:294) | =(game.html:14694) | **죽음** | - | - |  |
| 260 | `comboThreshold` | 콤보폭발의 | SUF | 반지·목걸이 | 0.05/0.08/0.14/0.22/0.3 | pct | 30 | = | =(DropTablesData.cs:295) | =(game.html:14695) | **죽음** | - | - |  |
| 261 | `flatPhysDmg` | 물리타격의 | PRE | 무기 | 8/16/28/44/65 | val | 80 | = | =(DropTablesData.cs:296) | =(game.html:14697) | **죽음** | - | - |  |
| 262 | `flatFireDmg` | 화염타격의 | PRE | 무기 | 6/12/22/36/52 | val | 65 | = | =(DropTablesData.cs:297) | =(game.html:14698) | **죽음** | - | - |  |
| 263 | `flatIceDmg` | 빙결타격의 | PRE | 무기 | 5/10/18/30/44 | val | 65 | = | =(DropTablesData.cs:298) | =(game.html:14699) | **죽음** | - | - |  |
| 264 | `flatLightDmg` | 뇌전타격의 | PRE | 무기 | 7/14/24/38/55 | val | 65 | = | =(DropTablesData.cs:299) | =(game.html:14700) | **죽음** | - | - |  |
| 265 | `flatDarkDmg` | 암흑타격의 | PRE | 무기 | 6/12/22/36/52 | val | 60 | = | =(DropTablesData.cs:300) | =(game.html:14701) | **죽음** | - | - |  |
| 266 | `flatPoisonDmg` | 독타격의 | PRE | 무기 | 5/10/18/30/44 | val | 60 | = | =(DropTablesData.cs:301) | =(game.html:14702) | **죽음** | - | - |  |
| 267 | `minDmgFlat` | 최소공격의 | PRE | 무기 | 3/6/10/16/24 | val | 55 | = | =(DropTablesData.cs:302) | =(game.html:14703) | **죽음** | - | - |  |
| 268 | `maxDmgFlat` | 최대공격의 | PRE | 무기 | 5/10/18/28/40 | val | 55 | = | =(DropTablesData.cs:303) | =(game.html:14704) | **죽음** | - | - |  |
| 269 | `atkPctAll` | 전투력의 | PRE | 무기·왕관 | 0.06/0.1/0.16/0.24/0.34 | pct | 50 | = | =(DropTablesData.cs:304) | =(game.html:14705) | **죽음** | - | - |  |
| 270 | `weaponRange` | 무기사거리의 | PRE | 무기 | 0.04/0.07/0.11/0.16/0.22 | pct | 55 | = | =(DropTablesData.cs:305) | =(game.html:14706) | **죽음** | - | - |  |
| 271 | `bowRange` | 활사거리의 | PRE | 석궁 | 0.05/0.08/0.14/0.22/0.3 | pct | 55 | = | =(DropTablesData.cs:306) | =(game.html:14707) | **죽음** | - | - |  |
| 272 | `doubleStrike` | 이중타의 | SUF | 무기 | 0.02/0.04/0.06/0.09/0.13 | prob | 20 | = | =(DropTablesData.cs:307) | =(game.html:14708) | **죽음** | - | - | tierW |
| 273 | `multiShot` | 다중발사의 | SUF | 석궁 | 0.03/0.05/0.08/0.12/0.18 | prob | 20 | = | =(DropTablesData.cs:308) | =(game.html:14709) | **죽음** | - | - | tierW |
| 274 | `pierceChance` | 관통의 | PRE | 석궁 | 0.05/0.08/0.14/0.22/0.3 | prob | 50 | = | =(DropTablesData.cs:309) | =(game.html:14710) | **죽음** | - | - |  |
| 275 | `pierceCount` | 관통횟수의 | PRE | 석궁 | 1/1/2/2/3 | cnt | 40 | = | =(DropTablesData.cs:310) | =(game.html:14711) | **죽음** | - | - |  |
| 276 | `pierceDmgKeep` | 관통유지의 | SUF | 석궁 | 0.1/0.18/0.28/0.4/0.55 | pct | 40 | = | =(DropTablesData.cs:311) | =(game.html:14712) | **죽음** | - | - |  |
| 277 | `chainDmgKeep` | 연쇄유지의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 40 | = | =(DropTablesData.cs:312) | =(game.html:14713) | **죽음** | - | - |  |
| 278 | `splashRadius` | 범위확장의 | PRE | 석궁 | 0.06/0.1/0.16/0.24/0.34 | pct | 45 | = | =(DropTablesData.cs:313) | =(game.html:14714) | **죽음** | - | - |  |
| 279 | `splashDmg` | 범위피해의 | SUF | 석궁 | 0.1/0.18/0.28/0.4/0.55 | pct | 35 | = | =(DropTablesData.cs:314) | =(game.html:14715) | **죽음** | - | - |  |
| 280 | `chargeAtkDmg` | 돌진공격의 | PRE | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 50 | = | =(DropTablesData.cs:315) | =(game.html:14716) | **죽음** | - | - |  |
| 281 | `counterAtkDmg` | 반격공격의 | PRE | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 45 | = | =(DropTablesData.cs:316) | =(game.html:14717) | **죽음** | - | - |  |
| 282 | `backstabDmg` | 후방타의 | SUF | 무기 | 0.12/0.2/0.32/0.46/0.65 | pct | 35 | = | =(DropTablesData.cs:317) | =(game.html:14718) | **죽음** | - | - |  |
| 283 | `executeDmg` | 처형의 | SUF | 무기 | 0.15/0.25/0.4/0.6/0.85 | pct | 30 | = | =(DropTablesData.cs:318) | =(game.html:14719) | **죽음** | - | - | tierW |
| 284 | `dotTickRate` | 침식가속의 | PRE | 무기 | 0.05/0.08/0.14/0.22/0.3 | pct | 40 | = | =(DropTablesData.cs:319) | =(game.html:14720) | **죽음** | - | - |  |
| 285 | `bleedDps` | 출혈의 | PRE | 무기 | 5/10/18/28/40 | dps | 60 | = | =(DropTablesData.cs:320) | =(game.html:14721) | **죽음** | - | - |  |
| 286 | `bleedDuration` | 출혈지속의 | PRE | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 50 | = | =(DropTablesData.cs:321) | =(game.html:14722) | **죽음** | - | - |  |
| 287 | `flatMagicDmg` | 마법타격의 | PRE | 왕관 | 6/12/22/36/52 | val | 60 | = | =(DropTablesData.cs:322) | =(game.html:14723) | **죽음** | - | - |  |
| 288 | `spellAmp` | 주문증폭의 | PRE | 왕관 | 0.05/0.08/0.14/0.22/0.3 | pct | 45 | = | =(DropTablesData.cs:323) | =(game.html:14724) | **죽음** | - | - |  |
| 289 | `killStreakDmg` | 연살뎀의 | SUF | 무기 | 0.03/0.05/0.08/0.12/0.18 | pct | 35 | = | =(DropTablesData.cs:324) | =(game.html:14725) | **죽음** | - | - |  |
| 290 | `killStreakSpd` | 연살속의 | SUF | 무기 | 0.02/0.04/0.06/0.09/0.13 | pct | 35 | = | =(DropTablesData.cs:325) | =(game.html:14726) | **죽음** | - | - |  |
| 291 | `momentumDmg` | 기세의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:326) | =(game.html:14727) | **죽음** | - | - |  |
| 292 | `standingDmg` | 정지공격의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 35 | = | =(DropTablesData.cs:327) | =(game.html:14728) | **죽음** | - | - |  |
| 293 | `movingDmg` | 이동공격의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:328) | =(game.html:14729) | **죽음** | - | - |  |
| 294 | `recentParryDmg` | 패링공세의 | SUF | 무기 | 0.12/0.2/0.32/0.46/0.65 | pct | 30 | = | =(DropTablesData.cs:329) | =(game.html:14730) | **죽음** | - | - |  |
| 295 | `nearDeathDmg` | 임사폭발의 | SUF | 무기 | 0.2/0.35/0.55/0.8/1.1 | pct | 20 | = | =(DropTablesData.cs:330) | =(game.html:14731) | **죽음** | - | - | tierW |
| 296 | `fullStaminaDmg` | 만기력공의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:331) | =(game.html:14732) | **죽음** | - | - |  |
| 297 | `fullManaDmg2` | 만마력공의 | SUF | 무기·왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 35 | = | =(DropTablesData.cs:332) | =(game.html:14733) | **죽음** | - | - |  |
| 298 | `freshKillDmg` | 신선처치의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 35 | = | =(DropTablesData.cs:333) | =(game.html:14734) | **죽음** | - | - |  |
| 299 | `stunDuration` | 경직연장의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 45 | = | =(DropTablesData.cs:334) | =(game.html:14735) | **죽음** | - | - |  |
| 300 | `freezeDuration` | 빙결연장의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 45 | = | =(DropTablesData.cs:335) | =(game.html:14736) | **죽음** | - | - |  |
| 301 | `slowEfficiency` | 둔화강화의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 40 | = | =(DropTablesData.cs:336) | =(game.html:14737) | **죽음** | - | - |  |
| 302 | `poisonStack` | 독중첩의 | SUF | 무기 | 1/1/2/2/3 | cnt | 35 | = | =(DropTablesData.cs:337) | =(game.html:14738) | **죽음** | - | - |  |
| 303 | `bleedStack` | 출혈중첩의 | SUF | 무기 | 1/1/2/2/3 | cnt | 35 | = | =(DropTablesData.cs:338) | =(game.html:14739) | **죽음** | - | - |  |
| 304 | `igniteDmg` | 발화강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 50 | = | =(DropTablesData.cs:339) | =(game.html:14740) | **죽음** | - | - |  |
| 305 | `frostbiteDmg` | 동상강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 50 | = | =(DropTablesData.cs:340) | =(game.html:14741) | **죽음** | - | - |  |
| 306 | `shockDmg` | 감전강화의 | PRE | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 50 | = | =(DropTablesData.cs:341) | =(game.html:14742) | **죽음** | - | - |  |
| 307 | `critMultiOnLowHP` | 사선회심의 | SUF | 무기 | 0.1/0.2/0.3/0.4/0.5 | pct | 25 | = | =(DropTablesData.cs:342) | =(game.html:14743) | **죽음** | - | - | tierW |
| 308 | `armorDefPct` | 갑옷강화의 | PRE | 갑옷 | 0.06/0.1/0.16/0.24/0.34 | pct | 65 | = | =(DropTablesData.cs:343) | =(game.html:14745) | **죽음** | - | - |  |
| 309 | `shieldBlockDR` | 블록흡수의 | SUF | 보조무기 | 0.04/0.07/0.11/0.16/0.22 | pct | 50 | = | =(DropTablesData.cs:344) | =(game.html:14746) | **Core 미구현** | - | 28053 |  |
| 310 | `shieldBashDmg` | 방패타격의 | SUF | 보조무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 45 | = | =(DropTablesData.cs:345) | =(game.html:14747) | **죽음** | - | - |  |
| 311 | `shieldStagger` | 방패경직의 | SUF | 보조무기 | 3/6/10/16/24 | val | 45 | = | =(DropTablesData.cs:346) | =(game.html:14748) | **죽음** | - | - |  |
| 312 | `glovesAtkSpd` | 격투속의 | PRE | 장갑 | 0.03/0.05/0.08/0.12/0.18 | pct | 55 | = | =(DropTablesData.cs:347) | =(game.html:14749) | **Core 미구현** | - | 33364 |  |
| 313 | `glovesCritDmg` | 격투회심의 | SUF | 장갑 | 0.06/0.1/0.16/0.24/0.34 | pct | 45 | = | =(DropTablesData.cs:348) | =(game.html:14750) | **Core 미구현** | - | 27998 |  |
| 314 | `glovesStagger` | 격투경직의 | PRE | 장갑 | 2/4/7/11/16 | val | 50 | = | =(DropTablesData.cs:349) | =(game.html:14751) | **죽음** | - | - |  |
| 315 | `pantsHPRegen` | 하반재생의 | PRE | 바지 | 1/2/3/5/8 | val | 55 | = | =(DropTablesData.cs:350) | =(game.html:14752) | **죽음** | - | - |  |
| 316 | `pantsCCDuration` | CC단축의 | SUF | 바지 | -0.06/-0.1/-0.16/-0.24/-0.34 | pct | 45 | = | =(DropTablesData.cs:351) | =(game.html:14753) | **죽음** | - | - |  |
| 317 | `bootsDashDmg` | 돌진타의 | SUF | 부츠 | 0.1/0.18/0.28/0.4/0.55 | pct | 45 | = | =(DropTablesData.cs:352) | =(game.html:14754) | **죽음** | - | - |  |
| 318 | `bootsChargeRange` | 돌진범위의 | PRE | 부츠 | 0.05/0.08/0.14/0.22/0.3 | pct | 45 | = | =(DropTablesData.cs:353) | =(game.html:14755) | **죽음** | - | - |  |
| 319 | `bootsMSOnKill` | 처치질주의 | SUF | 부츠 | 0.04/0.07/0.11/0.16/0.22 | pct | 40 | = | =(DropTablesData.cs:354) | =(game.html:14756) | **죽음** | - | - |  |
| 320 | `cloakDodgeDR` | 회피감쇠의 | SUF | 망토 | 0.06/0.1/0.16/0.24/0.34 | pct | 35 | = | =(DropTablesData.cs:355) | =(game.html:14757) | **죽음** | - | - |  |
| 321 | `cloakMSPct` | 은신질주의 | PRE | 망토 | 0.03/0.05/0.08/0.12/0.18 | pct | 50 | = | =(DropTablesData.cs:356) | =(game.html:14758) | **죽음** | - | - |  |
| 322 | `cloakElemDR` | 속성감쇠의 | SUF | 망토 | 0.03/0.05/0.08/0.12/0.18 | pct | 40 | = | =(DropTablesData.cs:357) | =(game.html:14759) | **죽음** | - | - |  |
| 323 | `burnDR` | 화상저항의 | SUF | 망토 | 0.1/0.16/0.24/0.36/0.5 | pct | 45 | = | =(DropTablesData.cs:358) | =(game.html:14760) | **Core 미구현** | - | 43533 |  |
| 324 | `helmMPPct` | 마나왕관의 | PRE | 왕관 | 0.04/0.07/0.11/0.16/0.22 | pct | 50 | = | =(DropTablesData.cs:359) | =(game.html:14761) | **죽음** | - | - |  |
| 325 | `helmCastSpd` | 시전왕관의 | PRE | 왕관 | 0.04/0.07/0.11/0.16/0.22 | pct | 50 | = | =(DropTablesData.cs:360) | =(game.html:14762) | **죽음** | - | - |  |
| 326 | `helmCooldown` | 쿨감왕관의 | PRE | 왕관 | -0.04/-0.07/-0.11/-0.16/-0.22 | pct | 45 | = | =(DropTablesData.cs:361) | =(game.html:14763) | **구현** | Skills/Simulation.Skills.cs:107 | 28065 |  |
| 327 | `helmExpPct` | 경험왕관의 | SUF | 왕관 | 0.05/0.08/0.14/0.22/0.3 | pct | 45 | = | =(DropTablesData.cs:362) | =(game.html:14764) | **죽음** | - | - |  |
| 328 | `hybAtkHP` | 공생의 | SUF | 갑옷 | 0.04/0.07/0.11/0.16/0.22 | pct | 30 | = | =(DropTablesData.cs:363) | =(game.html:14766) | **죽음** | - | - |  |
| 329 | `hybDefSpd` | 수질의 | SUF | 부츠 | 0.03/0.05/0.08/0.12/0.18 | pct | 30 | = | =(DropTablesData.cs:364) | =(game.html:14767) | **죽음** | - | - |  |
| 330 | `hybCritLeech` | 회심흡의 | SUF | 무기 | 0.005/0.01/0.015/0.02/0.03 | pct | 20 | = | =(DropTablesData.cs:365) | =(game.html:14768) | **죽음** | - | - | tierW |
| 331 | `hybHPMP` | 체마의 | PRE | 갑옷 | 30/60/100/150/220 | val | 25 | = | =(DropTablesData.cs:366) | =(game.html:14769) | **죽음** | - | - |  |
| 332 | `hybHPST` | 체기의 | PRE | 갑옷 | 30/60/100/150/220 | val | 25 | = | =(DropTablesData.cs:367) | =(game.html:14770) | **죽음** | - | - |  |
| 333 | `hybMPST` | 마기의 | PRE | 벨트 | 20/40/70/110/160 | val | 25 | = | =(DropTablesData.cs:368) | =(game.html:14771) | **죽음** | - | - |  |
| 334 | `hybAllRegen` | 전재생의 | PRE | 갑옷 | 1/2/3/5/8 | val | 20 | = | =(DropTablesData.cs:369) | =(game.html:14772) | **죽음** | - | - | tierW |
| 335 | `hybStrDex` | 힘민의 | PRE | 반지 | 3/6/10/16/24 | val | 30 | = | =(DropTablesData.cs:370) | =(game.html:14773) | **죽음** | - | - |  |
| 336 | `hybStrInt` | 힘지의 | PRE | 반지 | 3/6/10/16/24 | val | 30 | = | =(DropTablesData.cs:371) | =(game.html:14774) | **죽음** | - | - |  |
| 337 | `hybDexInt` | 민지의 | PRE | 귀걸이 | 3/6/10/16/24 | val | 30 | = | =(DropTablesData.cs:372) | =(game.html:14775) | **죽음** | - | - |  |
| 338 | `hybLckGrit` | 운근의 | PRE | 목걸이 | 5/10/18/28/40 | val | 25 | = | =(DropTablesData.cs:373) | =(game.html:14776) | **죽음** | - | - |  |
| 339 | `hybDropExp` | 수확의 | SUF | 부츠 | 0.04/0.07/0.11/0.16/0.22 | pct | 30 | = | =(DropTablesData.cs:374) | =(game.html:14777) | **죽음** | - | - |  |
| 340 | `hybFireIce` | 빙화의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | pct | 25 | = | =(DropTablesData.cs:375) | =(game.html:14778) | **죽음** | - | - |  |
| 341 | `hybLightDark` | 뇌암의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | pct | 25 | = | =(DropTablesData.cs:376) | =(game.html:14779) | **죽음** | - | - |  |
| 342 | `hybMeleeSpell` | 근마의 | SUF | 무기·왕관 | 0.05/0.08/0.14/0.22/0.3 | pct | 25 | = | =(DropTablesData.cs:377) | =(game.html:14780) | **죽음** | - | - |  |
| 343 | `hybElemDotDmg` | 속성침식의 | SUF | 무기·왕관 | 0.06/0.1/0.16/0.24/0.34 | pct | 30 | = | =(DropTablesData.cs:378) | =(game.html:14781) | **죽음** | - | - |  |
| 344 | `ringFireDmg` | 화염반지의 | SUF | 반지 | 0.06/0.1/0.16/0.24/0.34 | pct | 50 | = | =(DropTablesData.cs:379) | =(game.html:14784) | **죽음** | - | - |  |
| 345 | `ringIceDmg` | 빙결반지의 | SUF | 반지 | 0.06/0.1/0.16/0.24/0.34 | pct | 50 | = | =(DropTablesData.cs:380) | =(game.html:14785) | **죽음** | - | - |  |
| 346 | `ringLightDmg` | 뇌전반지의 | SUF | 반지 | 0.06/0.1/0.16/0.24/0.34 | pct | 50 | = | =(DropTablesData.cs:381) | =(game.html:14786) | **죽음** | - | - |  |
| 347 | `ringDarkDmg` | 암흑반지의 | SUF | 반지 | 0.06/0.1/0.16/0.24/0.34 | pct | 50 | = | =(DropTablesData.cs:382) | =(game.html:14787) | **죽음** | - | - |  |
| 348 | `ringPoisonDmg` | 독반지의 | SUF | 반지 | 0.06/0.1/0.16/0.24/0.34 | pct | 50 | = | =(DropTablesData.cs:383) | =(game.html:14788) | **죽음** | - | - |  |
| 349 | `ringDmgPerCombo` | 콤보반지의 | SUF | 반지 | 0.002/0.004/0.006/0.009/0.013 | pct | 25 | = | =(DropTablesData.cs:384) | =(game.html:14789) | **죽음** | - | - |  |
| 350 | `ringMPOnKill` | 처치마나의 | SUF | 반지 | 3/6/10/16/24 | val | 40 | = | =(DropTablesData.cs:385) | =(game.html:14790) | **죽음** | - | - |  |
| 351 | `ringProjPierce` | 관통반지의 | SUF | 반지 | 0.04/0.07/0.11/0.16/0.22 | pct | 30 | = | =(DropTablesData.cs:386) | =(game.html:14791) | **죽음** | - | - |  |
| 352 | `neckAllDmg` | 만능목걸이의 | SUF | 목걸이 | 0.04/0.07/0.11/0.16/0.22 | pct | 25 | = | =(DropTablesData.cs:387) | =(game.html:14793) | **죽음** | - | - | tierW |
| 353 | `neckCritDmg` | 회심목걸이의 | SUF | 목걸이 | 0.06/0.1/0.16/0.24/0.34 | pct | 35 | = | =(DropTablesData.cs:388) | =(game.html:14794) | **Core 미구현** | - | 27998 |  |
| 354 | `neckElemPen` | 관통목걸이의 | SUF | 목걸이 | 0.03/0.05/0.08/0.12/0.18 | pct | 25 | = | =(DropTablesData.cs:389) | =(game.html:14795) | **죽음** | - | - | tierW |
| 355 | `neckSkillDmg` | 스킬목걸이의 | SUF | 목걸이 | 0.06/0.1/0.16/0.24/0.34 | pct | 35 | = | =(DropTablesData.cs:390) | =(game.html:14796) | **죽음** | - | - |  |
| 356 | `neckComboMax` | 콤보한계의 | SUF | 목걸이 | 5/10/15/20/30 | val | 30 | = | =(DropTablesData.cs:391) | =(game.html:14797) | **죽음** | - | - |  |
| 357 | `neckKillHeal` | 처치치유의 | SUF | 목걸이 | 3/6/10/16/24 | val | 40 | = | =(DropTablesData.cs:392) | =(game.html:14798) | **죽음** | - | - |  |
| 358 | `beltSTMax` | 지구벨트의 | PRE | 벨트 | 5/10/18/28/40 | val | 55 | = | =(DropTablesData.cs:393) | =(game.html:14800) | **죽음** | - | - |  |
| 359 | `beltPotionHP` | 포션벨트의 | SUF | 벨트 | 0.1/0.18/0.28/0.4/0.55 | pct | 50 | = | =(DropTablesData.cs:394) | =(game.html:14801) | **죽음** | - | - |  |
| 360 | `beltSTRegen` | 활력벨트의 | PRE | 벨트 | 1/2/3/5/8 | val | 50 | = | =(DropTablesData.cs:395) | =(game.html:14802) | **죽음** | - | - |  |
| 361 | `beltGoldDrop` | 탐욕벨트의 | SUF | 벨트 | 0.06/0.1/0.16/0.24/0.34 | pct | 50 | = | =(DropTablesData.cs:396) | =(game.html:14803) | **죽음** | - | - |  |
| 362 | `headbandMPMax` | 마나띠의 | PRE | 귀걸이 | 5/10/18/28/40 | val | 55 | = | =(DropTablesData.cs:397) | =(game.html:14805) | **죽음** | - | - |  |
| 363 | `headbandCastSpd` | 시전띠의 | PRE | 귀걸이 | 0.03/0.05/0.08/0.12/0.18 | pct | 50 | = | =(DropTablesData.cs:398) | =(game.html:14806) | **구현** | Skills/Simulation.Fireball.cs:38 | 28050 |  |
| 364 | `headbandMPRegen` | 마력띠의 | PRE | 귀걸이 | 1/2/3/5/8 | val | 50 | = | =(DropTablesData.cs:399) | =(game.html:14807) | **죽음** | - | - |  |
| 365 | `headbandSpellDmg` | 주술띠의 | SUF | 귀걸이 | 0.06/0.1/0.16/0.24/0.34 | pct | 45 | = | =(DropTablesData.cs:400) | =(game.html:14808) | **죽음** | - | - |  |
| 366 | `headbandElemDmg` | 속성띠의 | SUF | 귀걸이 | 0.05/0.08/0.14/0.22/0.3 | pct | 40 | = | =(DropTablesData.cs:401) | =(game.html:14809) | **죽음** | - | - |  |
| 367 | `arcWarriorDmg` | 전사의힘 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 30 | = | =(DropTablesData.cs:402) | =(game.html:14812) | **죽음** | - | - |  |
| 368 | `arcWarriorHP` | 전사생명의 | PRE | 갑옷 | 30/60/100/150/220 | val | 30 | = | =(DropTablesData.cs:403) | =(game.html:14813) | **죽음** | - | - |  |
| 369 | `arcWarriorLifeSteal` | 전사흡혈의 | SUF | 무기 | 0.004/0.008/0.014/0.022/0.032 | pct | 20 | = | =(DropTablesData.cs:404) | =(game.html:14814) | **죽음** | - | - | tierW |
| 370 | `arcWarriorPoise` | 전사인내의 | PRE | 갑옷 | 5/10/18/28/40 | val | 35 | = | =(DropTablesData.cs:405) | =(game.html:14815) | **죽음** | - | - |  |
| 371 | `arcMageDmg` | 마법사의힘 | SUF | 왕관 | 0.08/0.14/0.22/0.32/0.44 | pct | 30 | = | =(DropTablesData.cs:406) | =(game.html:14816) | **죽음** | - | - |  |
| 372 | `arcMageMP` | 마법사마나의 | PRE | 귀걸이 | 20/40/70/110/160 | val | 30 | = | =(DropTablesData.cs:407) | =(game.html:14817) | **죽음** | - | - |  |
| 373 | `arcMageShield` | 마법사수호의 | PRE | 갑옷 | 30/60/100/150/220 | val | 30 | = | =(DropTablesData.cs:408) | =(game.html:14818) | **죽음** | - | - |  |
| 374 | `arcMageElemDmg` | 마법사속성의 | SUF | 왕관 | 0.06/0.1/0.16/0.24/0.34 | pct | 30 | = | =(DropTablesData.cs:409) | =(game.html:14819) | **죽음** | - | - |  |
| 375 | `arcRangerDmg` | 궁수의힘 | SUF | 석궁 | 0.08/0.14/0.22/0.32/0.44 | pct | 30 | = | =(DropTablesData.cs:410) | =(game.html:14820) | **죽음** | - | - |  |
| 376 | `arcRangerRange` | 궁수사거리의 | PRE | 석궁 | 0.05/0.08/0.14/0.22/0.3 | pct | 30 | = | =(DropTablesData.cs:411) | =(game.html:14821) | **죽음** | - | - |  |
| 377 | `arcRangerPierce` | 궁수관통의 | SUF | 석궁 | 0.04/0.07/0.11/0.16/0.22 | pct | 30 | = | =(DropTablesData.cs:412) | =(game.html:14822) | **죽음** | - | - |  |
| 378 | `arcRangerMS` | 궁수질주의 | PRE | 부츠 | 0.03/0.05/0.08/0.12/0.18 | pct | 35 | = | =(DropTablesData.cs:413) | =(game.html:14823) | **죽음** | - | - |  |
| 379 | `arcTankHP` | 탱크생명의 | PRE | 갑옷 | 40/80/130/200/280 | val | 30 | = | =(DropTablesData.cs:414) | =(game.html:14824) | **죽음** | - | - |  |
| 380 | `arcTankDef` | 탱크방어의 | PRE | 갑옷·보조무기 | 5/10/18/28/40 | val | 30 | = | =(DropTablesData.cs:415) | =(game.html:14825) | **죽음** | - | - |  |
| 381 | `arcTankBlock` | 탱크블록의 | PRE | 보조무기 | 0.03/0.05/0.08/0.12/0.18 | pct | 30 | = | =(DropTablesData.cs:416) | =(game.html:14826) | **죽음** | - | - |  |
| 382 | `arcTankThorns` | 탱크가시의 | SUF | 갑옷 | 4/8/14/22/32 | val | 35 | = | =(DropTablesData.cs:417) | =(game.html:14827) | **죽음** | - | - |  |
| 383 | `arcAssassinCrit` | 암살회심의 | SUF | 무기 | 0.02/0.04/0.06/0.09/0.13 | pct | 25 | = | =(DropTablesData.cs:418) | =(game.html:14828) | **죽음** | - | - |  |
| 384 | `arcAssassinBack` | 암살후방의 | SUF | 무기 | 0.15/0.25/0.4/0.6/0.85 | pct | 20 | = | =(DropTablesData.cs:419) | =(game.html:14829) | **죽음** | - | - | tierW |
| 385 | `arcAssassinPoison` | 암살독의 | SUF | 무기 | 0.08/0.14/0.22/0.32/0.44 | pct | 30 | = | =(DropTablesData.cs:420) | =(game.html:14830) | **죽음** | - | - |  |
| 386 | `arcAssassinDodge` | 암살회피의 | SUF | 망토 | 0.02/0.04/0.06/0.09/0.13 | pct | 25 | = | =(DropTablesData.cs:421) | =(game.html:14831) | **죽음** | - | - |  |
| 387 | `endBossKiller` | 종결자의 | SUF | 무기 | 0.1/0.18/0.28/0.4/0.55 | pct | 15 | = | =(DropTablesData.cs:422) | =(game.html:14833) | **죽음** | - | - | tierW |
| 388 | `endSurvival` | 생존자의 | SUF | 갑옷 | 0.05/0.08/0.14/0.22/0.3 | pct | 15 | = | =(DropTablesData.cs:423) | =(game.html:14834) | **죽음** | - | - | tierW |
| 389 | `endShield` | 종결수호의 | PRE | 갑옷 | 50/100/180/280/400 | val | 15 | = | =(DropTablesData.cs:424) | =(game.html:14835) | **죽음** | - | - |  |
| 390 | `endCritDmg` | 종결회심의 | SUF | 무기 | 0.1/0.2/0.3/0.4/0.5 | pct | 10 | = | =(DropTablesData.cs:425) | =(game.html:14836) | **죽음** | - | - | tierW |
| 391 | `endAtkFlat` | 종결공격의 | PRE | 무기 | 30/70/150/260/400 | val | 8 | = | =(DropTablesData.cs:426) | =(game.html:14837) | **죽음** | - | - | tierW; skew 3.0 |
| 392 | `endAllRes` | 종결저항의 | SUF | 목걸이 | 0.04/0.07/0.11/0.16/0.22 | pct | 10 | = | =(DropTablesData.cs:427) | =(game.html:14838) | **죽음** | - | - | tierW |
| 393 | `endAllDmg` | 종결파괴의 | SUF | 목걸이 | 0.05/0.08/0.14/0.22/0.3 | pct | 8 | = | =(DropTablesData.cs:428) | =(game.html:14839) | **죽음** | - | - | tierW |
| 394 | `endAllDR` | 종결보호의 | SUF | 갑옷 | 0.03/0.05/0.08/0.12/0.18 | pct | 8 | = | =(DropTablesData.cs:429) | =(game.html:14840) | **죽음** | - | - | tierW |
| 395 | `endLeech` | 종결흡혈의 | SUF | 무기 | 0.006/0.012/0.02/0.03/0.042 | pct | 8 | = | =(DropTablesData.cs:430) | =(game.html:14841) | **죽음** | - | - | tierW |
| 396 | `endPoise` | 종결인내의 | PRE | 갑옷 | 10/20/35/55/80 | val | 15 | = | =(DropTablesData.cs:431) | =(game.html:14842) | **죽음** | - | - |  |
| 397 | `endCooldownAll` | 종결쿨감의 | SUF | 왕관 | -0.03/-0.05/-0.08/-0.12/-0.18 | pct | 10 | = | =(DropTablesData.cs:432) | =(game.html:14843) | **구현** | Skills/Simulation.Skills.cs:107 | 28065 | tierW |
| 398 | `endExpBonus` | 종결경험의 | SUF | 목걸이 | 0.08/0.14/0.22/0.32/0.44 | pct | 15 | = | =(DropTablesData.cs:433) | =(game.html:14844) | **죽음** | - | - |  |
| 399 | `endDropBonus` | 종결약탈의 | SUF | 부츠 | 0.08/0.14/0.22/0.32/0.44 | pct | 15 | = | =(DropTablesData.cs:434) | =(game.html:14845) | **죽음** | - | - |  |
| 400 | `endMaliceGain` | 종결악의의 | SUF | 반지 | 0.1/0.18/0.28/0.4/0.55 | pct | 20 | 이름 불일치('종결악의오브의') | =(DropTablesData.cs:435) | =(game.html:14846) | **죽음** | - | - |  |
| 401 | `endSTR` | 종결힘의 | PRE | 반지 | 8/16/28/44/65 | val | 12 | = | =(DropTablesData.cs:436) | =(game.html:14847) | **죽음** | - | - |  |
| 402 | `endDEX` | 종결민첩의 | PRE | 반지 | 8/16/28/44/65 | val | 12 | = | =(DropTablesData.cs:437) | =(game.html:14848) | **죽음** | - | - |  |
| 403 | `endINT` | 종결지능의 | PRE | 반지 | 8/16/28/44/65 | val | 12 | = | =(DropTablesData.cs:438) | =(game.html:14849) | **죽음** | - | - |  |
| 404 | `endLCK` | 종결행운의 | PRE | 목걸이 | 15/30/50/75/110 | val | 10 | = | =(DropTablesData.cs:439) | =(game.html:14850) | **죽음** | - | - |  |
| 405 | `endGrit` | 종결근성의 | SUF | 목걸이 | 15/30/50/75/110 | val | 10 | = | =(DropTablesData.cs:440) | =(game.html:14851) | **죽음** | - | - |  |
| 406 | `endKillChain` | 종결연살의 | SUF | 무기 | 0.06/0.1/0.16/0.24/0.34 | pct | 15 | = | =(DropTablesData.cs:441) | =(game.html:14852) | **죽음** | - | - |  |
| 407 | `pierceFlat` | 관통력의 | SUF | 석궁 | 100/200/300/400/500 | val | 40 | = | =(DropTablesData.cs:442) | =(game.html:14853) | **구현** | Simulation.Crossbow.cs:100 | 17348 | tierW |
| 408 | `ancDmg` | 전대의 | PRE | 유골함 | 0.1/0.18/0.28/0.4/0.55 | pct | 80 | = | =(DropTablesData.cs:443) | =(game.html:14855) | **Core 미구현** | - | 45816 |  |
| 409 | `ancHP` | 계승의 | SUF | 유골함 | 0.3/0.6/0.9/1.2/1.5 | pct | 70 | = | =(DropTablesData.cs:444) | =(game.html:14856) | **Core 미구현** | - | 45820 |  |

---

## 2. 생성 규칙표 (문서 vs Core vs 웹)

### 2.1 어픽스 롤 (`rollAffixes` ↔ `ItemFactory.RollAffixes`)

| 규칙 | 설계 문서 | Core (`ItemFactory.cs`) | 웹 (`game.html`) | 상태 |
|---|---|---|---|---|
| 등급별 어픽스 수 | `[0,2,3,5,6,7]` (아이템_어픽스_시스템 Part 1-B, 2_7) | 338: `{0,2,3,5,6,7}[grade]` | 15142 | 일치 |
| 접두/접미 교대 | 홀수 등급 PRE→SUF, 짝수 SUF→PRE | 340: `grade%2==1 ? {pre,suf} : {suf,pre}`, 343 `i%2` | 15144·15146 | 일치. 결과 PRE/SUF 수: 고급 1/1, 희귀 1/2, 영웅 3/2, 전설 3/3, 유니크 4/3 |
| 같은 group 금지 | Part 1-B | 347·352 `usedG` | 15150·15153 | 일치 |
| 가중 추첨 | w | 346~354 | 15150~15154 | 일치 |
| T1 null 제외 | (문서 없음 → 현황분석 §7-2에만) | 347·352 `double.IsNaN(a.Tiers[0])` | 15150·15153 `tiers[0]!=null` | 일치. **`lastStand`·`reviveOnce` 영구 드랍 불가** |
| minGrade | Part 1-B(10-08 신설, `kiSlashParry` 5) | 347·352 `a.MinGrade > grade` | 15150·15153 | 일치 |
| 티어 상한 | `min(5-1, baseTier + ⌊Lv/200⌋)`, baseTier 전설·유니크 2 / 영웅 1 / 그 외 0 | 344~345·355 | 15147~15148·15157 | 일치. Lv 기준은 **플레이어 레벨**(아이템 레벨 아님). 데모 Lv 상한 100 → T4·T5 절대 불출 |
| tierW 이산 롤 | ★ 표기 | 357~363 `(tierW[ti]||1)` | 15159~15163 | 일치 |
| 연속 롤·skewRoll | ↓ 표기 | 365~369 `cnt/val`은 정수 `lo+⌊rr×(hi-lo+1)⌋`, 그 외 `toFixed(4)` | 15165~15167 | 일치 |
| 티어 표기(tierIdx) | — | 370 (연속 롤은 T1~T3 경계만 판정) | 15168 | 일치. 문서 없음(현황분석 §7-8만 언급) |
| DEMO 금지 7 | 현황분석·아이템_어픽스_시스템 | 319·330 `DemoBanned` | 16650 `_DEMO_AFFIX_BANNED`, 15138 | 일치 (`sharpAtk brutalAtk ruinAtk overkilDmg staggerExplosion parryExplosion elemConvert`) |
| 팔찌 brType 풀 | demon 5·life 5 | 332 `a.BrType != brType` 제외 | 15138 | 일치. **웹 대장간 리롤(50460)은 brType을 안 넘겨 팔찌 전용 어픽스가 리롤 때 사라짐**(현황분석 §7-5 미수정). Unity 대장간은 리롤 실행 자체가 미구현(형태만) |
| 반지·목걸이 선부여 | — (현황분석 §7-3 "덮어쓰기 데드코드") | 228~229 `PrePick` — 난수 소비만 재현 | 16059~16083 | 일치(웹 버그 호환). 문서화: 이 표 |

### 2.2 아이템 생성 (`mkItem` ↔ `ItemFactory.MkItem`)

| 규칙 | 설계 문서 | Core | 웹 | 상태 |
|---|---|---|---|---|
| RARITY_MUL | `[1,1.2,1.5,1.8,2.2,2.5]` | DropTablesData.cs:13 | 14351 | 일치 |
| ATK 롤 | `max=⌊(200+tier×200+Lv)/4⌋`, 바닥 `[0,5,15,25,40,50]%`, `rnd²` | 69~71 | 15922~15923 | 일치 |
| 슬롯 기본값 | 2_7 §방어구/장신구 기본 자원(bonusHp/St/Shield/Mp `tier×50+10+⌊rnd×40⌋`, 바지·벨트 추가분) | 74~112 (`base` 리터럴 74~88을 전 슬롯 평가해 난수 순서 재현, 슬롯 switch 95~112) | 15925~15957 | 일치. **2_7에는 DEF `20+tier×20`, 벨트 dmgBonus `10+tier×10`, 목걸이 `20+tier×20`·critRate 10, 반지 critRate 5, 귀걸이 `mpRegen=(1+tier)×2`, 부츠 spd `tier×.08`, 장갑 `tier×.04`, 망토 `tier×.03`, 보조무기 stagger `15+tier×8`·wt `10-tier`, 갑옷 charge `8+tier×5`/chargeDist `22+tier×4`/chargeW `12+tier×5`, 투구 beam `1.5+tier×1.2` 표가 없다** → 백로그 D-01 |
| 무기 타입 7·석궁 3 | 3파트_아이템분류 | DropTablesData.cs:549~563, MkItem 129~161 | 15863~15893, 15958~15990 | 일치 (atkMul/stCost/spdMul/arcW/range/stagger/projSpd 동일) |
| 무기·보조무기 el=0 고정 | 3파트 | 114 | — | 일치 |
| 원소 6종(P F I D L H) 이름표 | 2_7 없음 | 방어구·장신구 Names 6행, 석궁·팔찌 5행(신성 el=5는 타입명 폴백), 무기 `_WP_MOD` 5행(el=5→0행) | 동일 구조 | 일치. 문서 없음 → D-01 |
| 비무기 스탯 보너스 | 2_7 §itemPower 비고 | 233~257·303: 장신구 bLck+bGrit 확정 + STR/DEX/INT 1개(`4+tier×4+rarity×6`×0.8~1.2); 방어구 등급별 0~3개 | 16086~16106 | 일치 |
| 임플리싯 17 | 아이템_어픽스_시스템·2_7 | DropTablesData.cs:446~464, MkItem 268~275 `Lo+rnd×(Hi-Lo)` toFixed(2) | 15016~15035, 16117 | 일치 |
| 전설 특수(rarity≥4) | 19종 부위 무관 무작위 1 | 276~281 | 16126~16133 | 일치(생성). 효과는 §3.4 |
| 유니크 특수(rarity≥5) + 외관 | 39종 무작위 1 + UNIQUE_ART 27 | 282~296 (`HasRoll`·`Scale`·`secs` 포함) | 16134~16150 | 일치(생성) |
| itemLv/reqLv | `⌊Lv/10⌋×10`(캡 900), `reqLv=max(0,itemLv-10)` | 297~298 | — | 일치. Core `TryEquip`가 reqLv 검사(InventoryState.cs:96) |
| 소켓 | 10-10: 신규 0홈, 최대 5 | 299 `socketCount=0, crystals=[], socketQ=[]` | 동일 | 일치(item-system-full만 구문 잔존, §0.2 #5) |
| 투구 원소·스플래시·관통 | 문서 없음 | 195~215 (`elements` 등급별 +0~3, `splashR`·`splashMul`·`magicPen`, 혼돈/전지전능의 왕관 이름) | 16022~16042 | 일치. 문서 없음 → D-01 |
| 장갑·벨트 potCd | — | 218·224 유니크(5)는 표 길이 5라 **NaN**(웹 quirk 보존), 줍기 때 0으로(InventoryState.cs:50) | 동일 | 일치. 사용자 결정 필요(유니크 물약 쿨감 0이 의도인가) → B-09 |
| 부츠 chargeCharge | — | 189~194 유니크 확률 NaN→미부여 | 동일 | 일치. 같은 결정 B-09 |

### 2.3 드랍 (`rollDrop` ↔ `WorldDrop.Roll`)

| 규칙 | 설계 문서(item-system-full §드롭 확률·STEP 6) | Core (`WorldDrop.cs`) | 웹 | 상태 |
|---|---|---|---|---|
| 몹 분류 | normal/elite/miniboss(etype 90~99)/stageBoss/chapterBoss | 21~27 | 32007~32010 | 일치 |
| 등급 가중치 | 일반 `[65,22,9,3,1,.01]` 엘리트 `[25,35,25,12,3,.03]` 미니 `[10,25,30,25,10,.1]` 장보스 `[0,0,30,50,20,.2]` 챕보스 `[0,0,0,30,70,.7]` | 14~15 | 32012 | 일치 |
| 드랍 수·확률 | 1/1/2/3/5, 일반 45%×dropBonus | 16~17·53~55 | 32014~32018 | 일치 |
| 챕터보스 첫 롤 전설 | 보장 | 59 | 32024 | 일치 |
| 슬롯·원소·티어 | 16슬롯 균등(유골함 제외), 원소 6 균등, tier=e.dropTier | 66~68 | 32027~32029 | 일치 |
| 줍기 필터 | minPickRar·minPickLvTier | 65·70 | 32026·32031 | 일치 |
| 월드 보존 20 | `_wiPush` | 82~96 | 16721 | 일치 |
| 탐욕 저주 ×0.5 | 있음 | 호출부 `Config.DropBonus`에 없음(Simulation.cs:309 주석 "no greed curse yet") | 32004 | **Core 미구현**(저주 시스템 부재) |
| 유골 부위·유물·소켓석 드랍 | 2_7·보석품질 | 미이식(WorldDrop 주석) | 32032~ | **Core 미구현** |

### 2.4 강화·유물(소켓)·분해·리롤

| 시스템 | 설계 문서 | Core | 웹 | 상태 |
|---|---|---|---|---|
| 강화 enh | 2_7 §강화 효과: ATK/DEF `enh×0.25`, HP/ST/MP 강화 세트 | `Admitted`가 `enh!=0` 거부(InventoryState.cs:33). 공식만 보존: `EnhanceDefense` shield/armor/cape ×0.25, `WeaponEnhanceAttack` ×0.25 | 28093~ | **Core 미수용**(데이터 거부). HP/ST/MP 세트 공식은 Core에 없음 |
| 유물 품질 q·홈·공명 | 보석품질_소켓석_수치표(배율 `0.75+0.5q/100`, 홈 b=(q−1)/99, 공명 ×2, 동·은·금) | `crystals/socketQ/socketCount` 모두 0만 허용. Unity 유물 탭은 "미이식" 표시 | 구현 | **Core 미수용** |
| 소켓석 드랍·개방·승급 | 같은 문서 §3·§4 | 없음 | 구현 | **Core 미구현** |
| 분해 salvageVal | 2_7 §분해 보상 | `InventoryState.cs:64~67` 공식 이식(`forge_web.json` 표) | 28187 | 일치(공식). Unity 대장간 실행은 형태만(NativeForgePanel.cs:13) |
| 리롤 | item-system-full STEP 8 | 실행 없음 | 50460 (brType 누락 버그) | **Core 미구현** |
| itemPower | 2_7 §종합지수 | InventoryState.cs:107~113 웹과 동일, 유물 항만 없음 | 구현 | 일치(유물 제외) |
| 전투력 calcCP | — | InventoryCombatPower.cs (STATS·PASSIVES 항 0) | 49487 | 부분 이식(주석에 명시) |

---

## 3. 장비 적용표 (어픽스 → 스탯 → 전투 공식)

### 3.1 파이프라인

`InventoryState.CalculateStats`(InventoryState.cs:126~144) → `Simulation.ApplyEquipment`(EquipmentApplication.cs) → `Config.*`/`Player.*` → 전투 코드. 성장(SP) 반영은 `Simulation.Growth.cs`가 같은 식을 다시 계산한다. 전투 중 어픽스는 `EnemyHurtContext.EqAffix`(= `AffixTotal`, 장착 전 슬롯 **합산**), 피격은 `HurtAffix`. 전설·유니크 특수는 `LEq/UEq`인데 **브리지가 둘 다 `zero`**(Simulation.EnemyBridge.cs:88)라 Core에서는 값이 항상 0이다. 예외: 석궁 전설 `_lBowCrit`만 `legendarySpecial`/`legendaryVal`을 직접 읽는다(Simulation.Crossbow.cs:104).

### 3.2 구현 128종의 연결 (Core 기준, 그룹별)

| 그룹 | 어픽스 | 들어가는 스탯·공식 | Core 위치 |
|---|---|---|---|
| 능력치 플랫 | `strFlat dexFlat intFlat vitFlat` | `es/ed/ei/vit` → 최대 HP(`str×5+vit×3`), 최대 MP(`int×2`), 쉴드(`int×5`), 리젠, 이속(`dex×.005`) | InventoryState.cs:140~143 |
| 근성 | `gritFlatN gritFlatR` | `_gritTotal` → HP/MP/ST +1/pt, DEF·eDEF `⌊grit×.5⌋` | 136 |
| 자원 플랫/% | `maxHPFlat maxHPPct lifeMaxHP maxSTFlat maxMPFlat shieldFlat` | 최대 HP/ST/MP/쉴드 | 142, Growth.cs:13~14 |
| 방어 플랫 | `defFlat eDefFlat` | `PlayerPhysicalDefense/EnergyDefense` → DR `def/(def+2500)` 캡 75% | 143, PlayerHurt.cs:86~87 |
| 피격 DR | `physDR barrier healthyDef injuredDR dotDR closeDR farDR` | physDR는 DR 합(물리만), barrier 플랫 차감, 조건부 DR 합 캡 50% | PlayerHurt.cs:87~100 (`closeDR/farDR` 거리 버그 §0.2 #8) |
| 둔화 저항 | `slowRes` | 덫 둔화 `120×(1−min(.5,slowRes))` | Simulation.EnemyAi.cs:171 |
| 드랍·경험·악의 | `dropRate expBonus goldBonus` | `DropBonus=1+lck×.0015+dropRate`, `Config.ExpBonus`, 악의 `×(1+goldBonus)` | 143, EquipmentApplication.cs:12, EnemyHurt.DeathTail.cs:489, SimulationRage.cs:30 |
| 분노 | `rageMaxFlat rageDmg rageSkDmg rageSkCrit` | 분노 최대·분노 피해, 분노 스킬 `×(1+rageSkDmg)`, 크리 `+rageSkCrit×100` | SimulationRage.cs:30, EnemyHurt.cs:257·262 |
| 물약 | `potionPower` (+장갑·벨트 `potCd`) | 자동 물약 회복량·쿨 | AutoPotionEquipment.cs |
| 부활 | `antiRevive reviveOnce revivePow reviveCd` | Config.AntiRevive/ReviveOnce/RevivePow/ReviveCd; antiRevive는 언데드 피해 `×(1+v)`·부활 억제 | 144, EnemyHurt.cs:160, EnemyHurt.Death.cs:83·207·223 |
| 무기 플랫 ATK | `sharpAtk brutalAtk ruinAtk` | `WeaponFlatAttack` → meleeRef, 석궁·투구 동일 | EquipmentApplication.cs:19, Crossbow.cs:95, Skills.cs:94 |
| 쿨·비용 | `cooldownRed helmCooldown endCooldownAll skillCdRed mpCostRed stCostRed castSpeed headbandCastSpd magicDmg maliceWeakAmp` | 스킬 쿨 합, 마나 비용 `PMagicCost`, ST 비용, 시전 속도 `×(1+castSpeed+headbandCastSpd)`, 마법 피해 합, 악의 약화 단계 | Skills.cs:102~110, Fireball.cs:38·159 |
| 석궁 | `pierceFlat rangedDmgPct projDmgPct critRateBow` | 관통, 원거리 % , 석궁 크리 % | Crossbow.cs:100~102, EnemyBridge.cs:81~82 |
| 돌진 | `dashBoost` | 사슬돌진 경로 피해 | PlayerCombat.cs:119 |
| DoT·속성 부여 | `poisonDot fireDot iceDot lightChain darkCurse chainTarget fireOnHit iceOnHit lightOnHit darkOnHit poisonOnHit onHitBleed onHitStun onHitFreeze` | 중독/화상 풀 `dmg×.10`, 빙결 DoT `mhp×(.008+v×.0002)`, 연쇄 2체, 저주 확률, 추가 대상 `dmg×.3`, 적중 상태이상 확률 | EnemyHurt.Body.cs:70~77·141~166 |
| 경직 | `staggerBns staggerExplosion` | 체간 피해 +v, 격파 시 폭발 `dmg×v` 반경 100 | EnemyHurt.Body.cs:217~223 |
| 흡수·회복 | `lifeLeech injuredLeech manaLeech stLeech lifeOnHit onKillHeal hpOnKill onKillMana onKillStam shieldOnKill onKillSpeed killSlayer onCritHeal onCritMana onCritShield` | HP/MP/ST 흡수, 처치 회복·이속, 처치 버프 | EnemyHurt.Body.cs:60~64, EnemyHurt.Death.cs:235~242, EnemyHurt.cs:295~297 |
| 조건부 피해(합연산 1회) | `abundDmg healthyAtk fullLifeDmg lowLifeDmg injuredDmg predDmg overkilDmg firstStrike closeDmg farDmg stunDmgUp frozenDmgUp burnDmgUp poisonDmgUp curseDmgUp slowDmgUp bossSlayer vsBossDmg eliteSlayer vsEliteDmg mobSlayer` | `cAx` 합 → `dmg×(1+cAx)` | EnemyHurt.cs:186~205 |
| 속성 % | `fireDmgPct iceDmgPct darkDmgPct lightDmgPct` + `*DmgBns` 4 + `poisonDmgPct poisonDmgBns elemFocus elemConvert crisisBoost` | 공격 원소별 `×(1+pct+bns)`, 무속성→무기 원소 전환 확률, 위기(HP<30%) 배수 | EnemyHurt.cs:162~173 |
| 타입 % | `meleeDmgPct spellDmgPct beamDmgPct dotDmgPct` (+원거리 2) | `tyAx` 합 → `×(1+tyAx)` | EnemyHurt.cs:227~234 |
| 콤보·크리 | `comboBoost critRateMelee critRateSpell kiSlashFullCrit onCritExplode onCritChain onCritFreeze` | 약점 노출 스택 `×(1+stk×.03)`, 크리 보너스 `+v×100`, 크리 프록(`pure` 재호출: 재귀 가드 없음, ON_CRIT 관측과 동일 경로) | EnemyHurt.cs:243~294 |

### 3.3 아이템 기본 필드(어픽스 밖) 소비

| 필드 | 생성 슬롯 | Core 소비 | 웹 소비 | 상태 |
|---|---|---|---|---|
| `atk spd wRange wArcW bonusRange` | 무기 | WeaponAttack/Speed/Range(+bonusRange×4)/Arc | 있음 | 구현 |
| `wStCost` `wStagger` | 무기 | 없음(CP만) | 휘두르기 ST 비용·경직 | **Core 미구현** |
| `bowSpd bowRange bowProjSpd bonusRange` | 석궁 | Crossbow.cs:97~98 | 있음 | 구현 |
| `bowStCost` `bowPierce` | 석궁 | 없음(itemPower만) | 발사 ST·관통 확률 | **Core 미구현** |
| `def eDef bonusHp bonusSt bonusShield bonusMp bStr bDex bInt bLck bGrit dmgBonus critRate atkSpd potCd` | 방어구·장신구 | CalculateStats·AutoPotion·목걸이 피해 합 | 있음 | 구현 |
| `beamDmg elements splashR splashMul magicPen` | 투구 | splash·magicPen은 패링샷(ParryShot.cs:40)만, `beamDmg/elements`는 itemPower·CP만 | 옴니빔·원소 | **beamDmg·elements Core 미구현** |
| `charge` | 갑옷 | ChainDash.cs:116 | 있음 | 구현 |
| `chargeDist chargeW chargeAoE bonusChargeDist` | 갑옷·부츠 | 없음(CP만) | 돌진 거리·폭·광역 | **Core 미구현** |
| `chargeCharge` | 부츠 | 없음 | 돌진 충전 | **Core 미구현** |
| `stagger shieldWt` | 보조무기 | 없음 | 방패 경직·무게 | **Core 미구현** |
| `mpRegen`(귀걸이 기본 `(1+tier)×2`) `stRegen` `critDmg` | 귀걸이 등 | 없음(CP만) | 리젠·크리뎀 | **Core 미구현** |
| `antiRevive`(무기·보조무기·석궁 기본 롤 0.01~0.20) | 무기류 | 없음 | 없음(어픽스만 씀) | 양쪽 죽음(난수 소비만) |
| `legendaryVal uniqueVal` | 전설·유니크 | `_lBowCrit`만 | 있음 | §3.4 |
| `enh socketCount crystals socketQ` | — | 0만 허용 | 있음 | Core 미수용(§2.4) |

### 3.4 임플리싯·전설·유니크

| 종류 | Core 소비 | 웹 소비 | 양쪽 죽음 |
|---|---|---|---|
| 임플리싯 16 stat | `_iMaxHP _iMaxHPPct _iLifeHPPct _iAtkSpd _iMovSpd _iRevPow _iMagDmg` 7 (`_iPhysDR _iElemRes _iStsRes`는 InventoryStats 필드로 계산되지만 읽는 곳 없음) | 위 7 + `_iAncPow` 8 | `_iAtkPct`(무기 공격력%!) `_iPierce`(석궁) `_iBlockPct`(보조무기) `_iPhysDR`(갑옷) `_iStsRes`(바지) `_iElemRes`(반지) `_iDashCd`(망토) `_iBeltPot`(벨트) 8 — 임플리싯 17칸 중 절반이 장식 |
| 전설 특수 19 | `_lBowCrit` 1. 나머지 18은 훅이 이식돼 있으나 `LEq=zero`: `_lBeltBuff _lBootsEvade _lSpearStack _lDaggerKill _lAxeBleed _lRingElem _lRingKill _lClubKB _lHammerShock _lMaceShock`(EnemyHurt*.cs), `_lSwordCombo _lShieldParry _lArmorRegen _lHelmFree _lGloveElem _lPantsRegen _lCapeParry _lNeckLow`는 훅 자체 없음 | 19 전부(item-system-full §전설 특수 19종) | 0 |
| 유니크 특수 39 | 0. 훅 이식 8(`_uAxeLeech _uClubStun _uMaceExplode _uGhostFuel _uChainBleedEcho _uTrapOffshoot _uPoiseOrbFracture _uSkyPoiseRefund`)도 `UEq=zero` | 39 전부 | 0 |
| 유니크 외관 27 | 생성·이름만(`uniqueArt`) | 이미지 표시 | 화면 트랙 |

---

## 4. 빈 곳

### 4.1 설계(웹)에는 있고 Core에 없는 것 — Core 미구현 어픽스 37

| 묶음 | 어픽스 | 웹 공식(줄) | Core에 필요한 연결 |
|---|---|---|---|
| 스탯형 A: 크리·행운 | `critRate`(×100 가산, 27997) `critDmgW neckCritDmg glovesCritDmg`(크리뎀 합, 27998) `lckFlatN lckFlatR`(`_eqLckTotal`, 27996) | statCrit/statCritDmg/_eqLckTotal | `CalculateStats`의 `PlayerCriticalChance/Multiplier`·`lck` 합에 추가 (Core는 지금 `bLck`만 더함) |
| 스탯형 B: 속도 | `atkSpeed`(27994) `meleeAtkSpd glovesAtkSpd`(33364 회수 틱) `bowAtkSpd`(28696) `movSpeed movSpeedCombat injuredSpeed`(27927) `movSpeedOOC`(27928) | statDex·P.speed·wRecover·bowRecover | AttackSpeedMultiplier·PlayerSpeed·석궁 회수 틱 |
| 스탯형 C: 자원·회복 | `lifeRegen`(27930 `/60`) `lifeHealPow`(32713) `extraST`(32785 기동 게이지) `potionCdRed`(28228 캡 .2) `dashCooldown`(32789) `shieldCdRed`(33050 Q 보호막 쿨) | 리젠·물약·돌진 쿨·Q 쿨 | PlayerHpRegen, AutoPotion, ChainDash 쿨, Q 쿨 |
| 전투형 A: 피격 | `reflect`(43604 반사 `a×v`) `thorns`(43602 플랫) `counterHit`(43600 확률 반격) `dodgeChance`(43432 `×100`, 캡 35) `lastStand`(43606, 드랍 불가) `ccRes stunRes`(34982·41348 경직/스턴 시간 `×(1−min(.5,v))`) `bossDR`(43534, 웹도 죽음) `burnDR`(43533) `shieldBlockDR`(28053 `pGuardAbsorb` 캡 .5) | hurtP·pStun·가드 흡수 | `Simulation.PlayerHurt`·경직·에너지쉴드 흡수율 |
| 전투형 B: 패링·스킬 | `parryBonus`(28036 반사탄 피해 `×(1+v)`) `parryExplosion`(38545 패링 폭발 `meleeRef×str×v`, DEMO 금지) `kiSlashParry`(16826, minGrade 5) `skillBoost`(44557 합체 배율 `×(1+v)`) `statusClean`(32745 10초마다 상태이상 n개 해제) | 패링·합체 | `Simulation.ParryReflect`·KiSlash·합체 배율·상태이상 타이머 |
| 전대(유골함) | `ancDmg ancHP`(45816·45820) | 전대 소환 | 전대 소환 시스템 부재 → 소환 레인과 함께 |

### 4.2 Core에는 있고 문서에 없는 것

| 항목 | Core 위치 | 문서 처리 |
|---|---|---|
| `reviveOnce` 풀 행 | DropTablesData.cs (armor SUF, w8, T1~T4 null) | §0.2 #1 |
| 슬롯별 풀 10쌍 | 위 §0.2 #3 | 슬롯별_어픽스_풀 G절 |
| 슬롯 기본값 공식 전체(DEF·eDEF·spd·charge·beam·critRate·dmgBonus·mpRegen·stagger·wt) | ItemFactory.cs:95~112 | 2_7에 "슬롯 기본값 표" 신설 (D-01) |
| 투구 원소 수·스플래시·관통 공식, 혼돈/전지전능의 왕관 조건 | ItemFactory.cs:195~215 | 같은 표 |
| 유니크 장갑·벨트 potCd NaN→0, 부츠 chargeCharge 미부여 | ItemFactory.cs:218·224·189, InventoryState.cs:50 | 2_7에 사실 표기 + B-09 결정 |
| 반지·목걸이 선부여 난수 재현 | ItemFactory.cs:228~229 | 이 문서 §2.1 |
| `Config.ExpBonus`·`DropBonus` 연결, `InventoryStats.PhysicalDamageReduction/ElementResistance/StatusResistance` 미사용 필드 | EquipmentApplication.cs:12, InventoryData.cs | 이 문서 §3.4 |
| Unity 어픽스 표시 데이터 `Resources/Data/affix_defs_web.json`(417행, **ko만**)·`inventory_labels.json` | Runtime | 번역 §7 |
| Unity 대장간·유물 탭 "형태만" 상태 | NativeForgePanel.cs:13, NativeInventoryCrystals.cs:9 | 2_7에 Unity 이식 상태 열 |

### 4.3 어느 쪽에도 없지만 ARPG 관례상 필요한 것

브리프가 가리킨 `ARPG_CONVENTIONS_CHECKLIST`는 저장소에 없다(`git ls-tree` 전수 검색 결과 없음). 아래는 PoE2·D4·Last Epoch·Torchlight 공통 관례 기준이며, 화면 쪽은 "화면 트랙"으로만 표시한다.

| 관례 | 현 상태 | 분류 |
|---|---|---|
| **원소 저항이 실제로 피해를 줄인다** | 저항 어픽스 6종·임플리싯 `_iElemRes`가 패널 숫자뿐 | 시스템 — B-02 |
| 어픽스 티어가 **아이템 레벨/드랍 지역**에 묶인다 | 플레이어 Lv/200 → 데모(Lv≤100)에서 T4·T5 불출, 같은 몹이 Lv400 캐릭터에게 T5를 줌 | 시스템 — B-06 (사용자 결정) |
| 전설·유니크의 **고유 효과가 동작**한다 | Core 0/39, 1/19 | 시스템 — B-01 |
| 어픽스 수가 **등급 안에서 변동**(예: 레어 3~4) | 고정 `[0,2,3,5,6,7]` | 설계 유지(사용자 확정 값) — 변경 제안 없음 |
| 드랍 **보정(pity)**·첫 장비 보장 | 없음(item-system-full §드롭 확률 명시) | 사용자 결정 — B-12 |
| 크리 확률·회피·이속 **상한** | 웹 회피 35 외 없음, Core 크리 캡 없음 | 밸런스 — B-11 |
| 크래프팅(리롤·강화·소켓) 실행 | Unity 형태만 | 시스템 — B-07·B-08 |
| 등급 색·전리품 이름표·빛기둥·비교 툴팁·롤 범위(하/중/상옵) 표시 | 웹 구현, Unity 미검수 | **화면 트랙** |
| 툴팁에 티어 범위(T값 중 어디인지) 표시 | 웹 유니크만 하/중/상옵 | **화면 트랙** |

---

## 5. 백로그 (우선순위 순)

열: 무엇을 / 왜 / Core 변경 / 크기 / 사용자 결정. **상위 10개(B-01~B-10)는 수용 기준까지** 적어 구현 브리프로 바로 쓸 수 있게 했다. Core 변경이 있는 항목은 §6의 제안 번호로 승인받은 뒤 별도 구현 레인(웹 oracle 대조 포함)이 한다.

### B-01 전설·유니크 특수효과 Core 연결 (`LEq/UEq` 브리지)
- **무엇을:** `Simulation.EnemyBridge.BuildHurtContext`의 `LEq = zero, UEq = zero`를 장착 아이템의 `legendarySpecial/legendaryVal`·`uniqueSpecial/uniqueVal`을 읽는 리더로 바꾸고(웹 `_lEq` 캐시·`_uEq` "첫 값 1개·비가산" 규칙), 훅이 없는 전설 8종(`_lSwordCombo _lShieldParry _lArmorRegen _lHelmFree _lGloveElem _lPantsRegen _lCapeParry _lNeckLow`)과 유니크 31종의 발동 지점을 웹 줄(유니크_어픽스_리스트 A·G절, item-system-full §전설 19종)대로 이식.
- **왜:** 전설·유니크가 지금 Unity에서는 "7어픽스 + 이름"일 뿐이다. 데모 1-1에서 전설 드랍(일반 1%·보스 20~70%)이 나오면 즉시 티가 난다.
- **Core 변경:** 있음 — C-IA-01. **크기:** L(브리지 S, 훅 이식 M×2). **사용자 결정:** 없음(웹 oracle 그대로).
- **수용 기준:** ① 같은 시드·같은 장비로 웹과 Core의 `_lEq/_uEq` 반환값 58종(19+39) 전부 일치. ② 전설 19종·유니크 39종 각각 발동 1회 이상을 기록하는 oracle 테스트(기존 `Tools/drop-oracle` 방식)가 PASS. ③ 비장착·중복 장착(두 슬롯 같은 stat)에서 비가산 확인. ④ `EnemyHurt*`의 기존 어픽스 테스트 회귀 0. ⑤ docs: 유니크_어픽스_리스트에 "Unity Core 연결" 열 추가.

### B-02 원소 저항 실제 적용 설계 (`fireRes iceRes lightRes darkRes poisonRes allRes` + `_iElemRes` + 원소 DR 5종)
- **무엇을:** 저항 → 받는 원소 피해 감소 공식을 정한다. 제안: `hurtP(magic, el)`에서 `dmg × (1 − min(0.75, res_el + allRes + _iElemRes×.01))`, 기존 eDEF DR과 **곱연산**, 상태이상 지속엔 미적용(별도 `*DR`/`*Duration` 어픽스가 있으므로). 적 원소가 없는 피해(물리)는 미적용. `fireDR iceDR lightDR darkDR poisonDRdef`(현재 죽음)는 같은 자리에 "원소별 DR"로 합산하거나 제거.
- **왜:** 티어 3 어픽스 풀(반지·목걸이·벨트·귀걸이·팔찌 SUF, w100으로 **가장 흔한 접미**)이 장식이다. 플레이어가 저항 장비를 모아도 아무 일이 없다.
- **Core 변경:** 있음 — C-IA-02. **크기:** M. **사용자 결정:** 공식(위 제안 채택 여부), 상한(75%/50%), 원소 DR 5종 통합 여부.
- **수용 기준:** ① 저항 0%·44%(T5)·캡 조건에서 같은 원소 피격 피해가 공식대로(단위 테스트 3케이스). ② 물리 피격·DoT 지속은 변화 0. ③ 웹과 다른 값이 되므로 `docs/7아이템디자인/아이템_어픽스_시스템.md` 저항 절에 "Unity Core 공식, 웹 oracle과 차이"를 표로 기록. ④ 스탯 패널(화면 트랙)에 같은 수치가 뜨는지는 별도 레인.

### B-03 Core 미구현 어픽스 37종 이식 — 1차 "스탯형 16"
- **무엇을:** §4.1 스탯형 A·B·C 16종(`critRate critDmgW neckCritDmg glovesCritDmg lckFlatN lckFlatR atkSpeed meleeAtkSpd glovesAtkSpd bowAtkSpd movSpeed movSpeedCombat movSpeedOOC injuredSpeed lifeRegen lifeHealPow extraST potionCdRed dashCooldown shieldCdRed` 중 스탯 합에 들어가는 것)을 `CalculateStats`/`ApplyEquipment`/`AutoPotion`에 웹 공식 그대로 연결.
- **왜:** 반지·목걸이·장갑의 핵심 접미(크리·공속·행운)가 Core에서 0이라 장비 비교·전투력이 거짓말을 한다.
- **Core 변경:** 있음 — C-IA-03. **크기:** M. **사용자 결정:** 없음.
- **수용 기준:** ① 16종 각각 T1 값 장착 전/후 `InventoryStats` 또는 해당 Config 값이 웹 `applyStats` 결과와 소수 4자리까지 일치(oracle 비교 16케이스). ② `_eqLckTotal` 경로: `lckFlatN` 장착 시 크리 확률 `+v×.025`, 드랍 보너스 `+v×.0015` 확인. ③ `potionCdRed` 캡 .2 유지. ④ InventoryComparison 행 라벨에 16종 한글명 표시(`inventory_labels.json` 추가, 번역 §7).

### B-04 죽은 어픽스 242종 처분 결정
- **무엇을:** 08-10 `어픽스_Layer_재분류_설계` FINAL DECISION LOCK의 MERGE/REWORK/REMOVE 분류를 현행 242종에 다시 매핑해 **삭제 / 구현 / 통합** 3안 중 하나를 묶음별로 받는다(스킬강화 sk* 20·아키타입 arc* 20·엔드게임 end* 21·플랫뎀 9·원소 Pen/Burst/Duration 15·리젠 9·하이브리드 16·장신구 특화 11·기타). `maxMPPct`(§0.2 #6)도 여기서 같이.
- **왜:** 드랍의 59%가 "있는 척"이다. 구현 전까지는 풀에서 빼는 것이 플레이어에게 정직하고, 빼면 구세이브(웹) 고아 어픽스 처리가 필요하다.
- **Core 변경:** 결정에 따라(삭제면 `DropTablesData` 재생성 = 웹 풀 변경과 동기, 구현이면 C-IA-06 이후). **크기:** 결정 S, 실행 L. **사용자 결정:** **필수**(3안·묶음별).
- **수용 기준:** ① 242종 전부가 결정표에 `KEEP-IMPL / MERGE→id / REMOVE` 중 하나로 적힌다. ② REMOVE 묶음은 웹 `AFFIX_POOL`과 Core 표가 같은 커밋에서 빠지고 `_fixItem` 마이그레이션 계획이 문서에 있다. ③ 결정 뒤 이 문서 §1 상태 열을 갱신한다.

### B-05 드랍 불가 2종 수정 (`lastStand`·`reviveOnce`)
- **무엇을:** `lastStand tiers:[null,null,null,null,1]`·`reviveOnce tiers:[null,null,null,.20,.35]`를 "상위 티어 전용" 의도로 살리려면 롤 필터를 `tiers[maxTier]!=null`(상한 티어에 값이 있으면 후보)로 바꾸거나, 의도가 "전설 이상에서 1개"면 `minGrade:4`와 5칸 전부 채운 표로 고친다.
- **왜:** 효과 코드(웹 43606, Core `ReviveOnce`)는 있는데 영원히 안 나온다. 현황분석 §7-2가 08-10에 지적했고 그대로다.
- **Core 변경:** 있음 — C-IA-04(표 또는 필터). **크기:** S. **사용자 결정:** 어느 등급·티어부터 나오게 할지.
- **수용 기준:** ① 결정한 등급에서 10만 회 롤 시 두 어픽스 출현 > 0, 그 미만 등급 0. ② 웹 `rollAffixes`와 Core `RollAffixes`가 같은 변경을 받고 같은 시드 결과 일치. ③ 아이템_어픽스_시스템 Part 5에 두 행 갱신.

### B-06 티어 게이팅 기준 변경 (플레이어 Lv → 아이템 레벨/드랍 티어)
- **무엇을:** `lvBonus=⌊P.lv/200⌋`을 `dropTier`(챕터 0~4) 또는 `itemLv` 기반으로 바꾼다. 제안: `maxTier=min(4, baseTier + dropTier/2)` 같은 표를 두고, 플레이어 레벨 항은 제거.
- **왜:** 데모(Lv 상한 100)에서 T4·T5가 절대 안 나오고, 반대로 1장을 도는 고레벨 캐릭터가 T5를 받는다. ARPG 관례는 "지역이 티어를 정한다".
- **Core 변경:** 있음 — C-IA-06. **크기:** M(공식 S + 밸런스 표). **사용자 결정:** **필수**(표 값·데모 상한 티어).
- **수용 기준:** ① 1-1(dropTier 0) 전설에서 나올 수 있는 최대 티어가 결정표와 일치(10만 회 분포표). ② Lv1과 Lv500이 같은 몹에서 같은 분포. ③ 웹 oracle과 **의도적으로** 달라지므로 차이를 아이템_어픽스_시스템 §티어 결정 규칙에 "Unity Core 규칙 / 웹 규칙" 두 줄로 기록.

### B-07 강화(enh)·유물(q·홈)·소켓석 Core 수용
- **무엇을:** `InventoryState.Admitted`의 `enh/socketCount/crystals/socketQ` 거부를 풀고, 2_7·보석품질 수치표의 공식(ATK/DEF `enh×0.25`, HP/ST/MP 강화 세트, 유물 배율 `0.75+0.5q/100`, 홈 b·공명 ×2, 동·은·금)을 `CalculateStats`·itemPower·CP에 넣는다. 드랍(소켓석 1.5~40%·티어 가중 `B^(10−t)`)은 WorldDrop 후속.
- **왜:** 웹 민맥싱 레이어 전부가 Unity에 없다. 데모 v0 범위 밖일 수 있어 범위 결정이 먼저다.
- **Core 변경:** 있음 — C-IA-07. **크기:** L. **사용자 결정:** 데모 v0 포함 여부(강화만 / 강화+유물 / 전부).
- **수용 기준:** ① 강화 +10 무기·갑옷의 ATK·DEF·HP가 웹 `applyStats`와 일치. ② q=1/50/100 유물과 홈 q·공명 4케이스가 보석품질 수치표의 워크드 예시(×1.000·×1.909·×2.818·×3.000)와 일치. ③ 세이브 왕복(CombatSave) 후 값 보존. ④ 유물 탭 "미이식" 문구 제거는 화면 트랙.

### B-08 대장간 리롤·분해 Core 실행 (+ 웹 brType 버그 동반 수정)
- **무엇을:** Unity `NativeForgePanel` 리롤·분해를 `ItemFactory.RollAffixes(rarity, slot, brType, …)`·`InventoryState.SalvageValue`에 연결하고 악의 차감을 `Simulation.Materials`에 반영. 웹 `rerollAffixes(item)`(50460)도 `item.brType`을 넘기도록 유지보수 패치 후보로 올린다(웹은 부록 W 절차).
- **왜:** 팔찌 리롤 시 악마/생명 전용 어픽스가 사라지는 버그가 웹에 남아 있고, Unity는 버튼이 그림이다.
- **Core 변경:** 있음(실행 API) — C-IA-08. **크기:** M. **사용자 결정:** 리롤 비용 표(웹 현행 유지 여부).
- **수용 기준:** ① 생명 팔찌 100회 리롤에서 life 전용 어픽스 출현 > 0, demon 전용 0. ② 분해 보상이 2_7 §분해 공식과 등급 6종에서 일치. ③ 악의 잔액 음수 불가.

### B-09 유니크 등급 quirk 2건 결정 (장갑·벨트 potCd NaN, 부츠 chargeCharge 미부여)
- **무엇을:** 표 길이 5라 rarity 5에서 undefined/NaN이 되는 두 곳에 유니크 값을 추가(제안: potCd 장갑 .35·벨트 .26, chargeCharge 확률 1)하거나 "유니크는 전설 값 승계"로 정한다.
- **왜:** 최고 등급 장갑이 물약 쿨감 0, 부츠가 돌진 충전 0 — 플레이어가 버그로 느낀다.
- **Core 변경:** 있음 — C-IA-09(웹 표와 동시). **크기:** S. **사용자 결정:** 값.
- **수용 기준:** ① rarity 5 장갑·벨트·부츠 1,000개 생성에서 NaN 0, 결정 값 분포 일치. ② 웹 `mkItem` 같은 표 수정으로 oracle 일치 유지. ③ 2_7 §방어구/장신구 기본 자원에 행 추가.

### B-10 Core 미구현 어픽스 2차 "전투형 21" (`reflect thorns counterHit dodgeChance lastStand ccRes stunRes bossDR burnDR shieldBlockDR parryBonus parryExplosion kiSlashParry skillBoost statusClean ancDmg ancHP` 등)
- **무엇을:** §4.1 전투형 A·B를 `Simulation.PlayerHurt`·`ParryReflect`·KiSlash·합체 배율·상태이상 타이머에 웹 줄대로 연결. `bossDR`은 C-IA-05와 함께 `HurtOptions.Source`에 보스 플래그를 실어 **웹에서 죽어 있던 것을 살린다**(웹과 차이 기록). 유골함 2종은 전대 소환 레인 뒤.
- **왜:** 보조무기·망토·바지의 생존 접미와 패링 빌드 어픽스가 전부 0이다.
- **Core 변경:** 있음 — C-IA-03(2차). **크기:** M~L. **사용자 결정:** `bossDR` 부활 여부, `dodgeChance` 캡(웹 35%) 유지.
- **수용 기준:** ① 21종 각각 발동 테스트 1개 이상(피격 반사·가시·반격·회피·불굴·CC 시간·패링 폭발·합체 배율·정화). ② `lastStand` 1회 발동 후 재발동 없음. ③ 웹 수치와 같은 입력에서 같은 출력(차이는 bossDR만, 문서화).

### B-11~B-15 (수용 기준 생략, 다음 라운드)
| # | 무엇을 | 왜 | Core 변경 | 크기 | 사용자 결정 |
|---|---|---|---|---|---|
| B-11 | 크리 확률·공속·이속·회피 상한표 | 캡 없음(DR 75%만) → 고레벨에서 폭주 | 있음(C-IA-10) | S | 상한 값 |
| B-12 | 드랍 pity·첫 장비 보장 | 1-1 10~15분에 장비 0개 가능(일반 45%×65% 일반) | 있음 | S | 보장 규칙 |
| B-13 | 투구 `beamDmg/elements`·무기 `wStCost/wStagger`·귀걸이 `mpRegen`·보조무기 `stagger/shieldWt`·돌진 `chargeDist/W/AoE/Charge`·`critDmg/stRegen` 기본 필드 연결(§3.3) | 생성은 되는데 Core 전투가 안 읽음 | 있음 | M | 없음(스킬 레인 의존: 옴니빔·돌진) |
| B-14 | 탐욕 저주·유골 부위 드랍 이식 | WorldDrop 주석 미이식 | 있음 | S/M | 없음 |
| B-15 | `onCritChain/onCritExplode` 재귀 가드 | ON_CRIT 관측(웹 스택 오버플로), Core 같은 `pure` 재호출 구조 | 있음 | S | 없음 |

### D-01 문서 작업 (이 레인 후속, Core 변경 없음)
§0.2 #1·#2·#3·#5·#6·#7 수정, 2_7에 "슬롯 기본값 표"·"투구 원소/스플래시 표"·"Unity 이식 상태 열" 신설, 현황분석 집계 정정. 크기 S. 승인 불필요(docs 동기화 규칙).

---

## 6. Core 변경 제안 목록 (승인 전 구현 금지)

| 번호 | 내용 | 백로그 | 웹 oracle과의 관계 |
|---|---|---|---|
| C-IA-01 | `LEq/UEq` 실제 리더 + 전설 8·유니크 31 훅 이식 | B-01 | 일치시킴 |
| C-IA-02 | 원소 저항 피해 감소 공식 신설 | B-02 | **의도적 차이**(웹은 미적용) |
| C-IA-03 | 미구현 어픽스 37 연결(1차 스탯 16, 2차 전투 21) | B-03·B-10 | 일치시킴(bossDR만 차이) |
| C-IA-04 | 드랍 불가 2종 표/필터 수정 | B-05 | 웹과 동시 |
| C-IA-05 | `closeDR/farDR` 거리 기준을 적과의 거리로, `bossDR` 소스 플래그 | B-10 | **의도적 차이**(웹 버그 미수정 상태) |
| C-IA-06 | 티어 게이팅을 dropTier/itemLv 기준으로 | B-06 | **의도적 차이** |
| C-IA-07 | enh·유물·소켓 데이터 수용 + 공식 | B-07 | 일치시킴 |
| C-IA-08 | 리롤·분해 실행 API | B-08 | 일치시킴(+웹 brType 수정) |
| C-IA-09 | 유니크 potCd/chargeCharge 표 확장 | B-09 | 웹과 동시 |
| C-IA-10 | 크리·공속·이속·회피 상한 | B-11 | 의도적 차이 |

---

## 7. 번역 대상

- 이 감사로 **새로 추가되는 표시 문자열은 0건**(docs만). `번역대상_전체목록.md` 신규 등록 없음.
- 다만 Unity 쪽 어픽스 표시 데이터는 **한국어만** 들어 있다: `Resources/Data/affix_defs_web.json`(이름 417·설명 265), `inventory_labels.json`, `DropTablesData.cs`의 임플리싯 17·전설 19·유니크 39·유니크 외관 27 Ko. 웹은 같은 문자열을 `_T()`로 28개 언어 번역한다(목록 CAT-83 `_AFFIX_DESC` 235개, CAT-84 `AFFIX_NAMES_KO` No.2349~2736, 전설/유니크 특수 No.2751·2858, 추가분 No.2972~·3012~·3110~). **Unity 29언어 반입은 기존 번호를 그대로 쓰는 데이터 작업**이며 B-03 수용 기준 ④와 함께 처리한다(번역_가이드의 통합 표 위치 결정 뒤).

## 8. 이 문서가 바꾸지 않은 것

- Core 코드·웹 코드·다른 docs 수치는 바꾸지 않았다. 문서 수정 대상은 §0.2·D-01에 줄 번호로만 적었다.
- 숫자 재검증 방법: AFFIX_POOL은 `DropTablesData.cs:36~444` ↔ `game.html:14370~15015`, 롤 규칙은 `ItemFactory.cs:321~372` ↔ `game.html:15131~15180`, 생성은 `ItemFactory.cs:59~301` ↔ `game.html:15894~16160`, 드랍은 `WorldDrop.cs` ↔ `game.html:32002~32040`.

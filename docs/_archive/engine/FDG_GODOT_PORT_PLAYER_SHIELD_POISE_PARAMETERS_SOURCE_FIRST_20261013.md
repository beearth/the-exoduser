## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# FDG Godot Port — player_shield_poise_parameters_source FIRST (2026-10-13)

TASK `GODOT-PORT-PLAYER-SHIELD-POISE-PARAMETERS-SOURCE-FIRST-20261013`
상태: **독립 producer 기술 PASS (최초·유일 isolated 실행 8그룹 234검사 FAIL0, exit0) · central 바인딩 PENDING** — 실제 Main/공유 Player/stage orchestration/sink 설치 미완. 제품 전체 완료 아님.

## 1. 소유 파일 (이 3개만)

| 파일 | 역할 |
|---|---|
| `godot/port_modules/player_shield_poise_parameters_source/producer.gd` | 원 applyStats @28584-28586(poise 초기화) / @28622-28623(mshield/shield) 를 분리된 2 stage 로 plan + 단일 sink dispatch |
| `godot/port_modules/player_shield_poise_parameters_source/test_first.gd` | 신규 isolated SceneTree test (`--only=` 그룹 선택, ledger marker 1개) |
| `docs/engine/FDG_GODOT_PORT_PLAYER_SHIELD_POISE_PARAMETERS_SOURCE_FIRST_20261013.md` | 이 문서 |

Player/World/Main/Git/save/server/UI/asset, 다른 producer, 공통 docs, CHANGELOG 편집 0. `docs/2_3 …` 는 읽기전용(불변).

## 2. 원 수식 / source line (canonical `exoduser-migration-20261001/game.html`, 읽기전용)

| 항목 | 원 표현식 | line | 이 모듈 처리 |
|---|---|---|---|
| 유효 INT | `s.int=STATS.int+_eqInt+_lb+~~_eqAffix('intFlat')` | 28566-28569 | **재계산 0.** `player_resource_parameters_source.plan_apply_stats().values.s_int` 를 provider 로 받음 |
| 14 방어슬롯 | `_allDefSlots=['shield','armor','boots','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2']` | 28578 | `SourceParameters.DEF_SLOTS` 공용 상수 재사용 |
| bonusShield 합 | `if(_dit){…_totalBonusShield+=(+_dit.bonusShield\|\|0)…}` | 28581 | shield 전용 14슬롯 합(resource plan 은 bonusShield 미노출). 원 슬롯 순서로 누적 |
| maxPoise | `P.maxPoise=4;` | 28584 | stage `poise_init` 항상 기록 |
| poise | `if(P.poise===undefined\|\|P.poise>4)P.poise=4;` | 28585 | 키 부재(=undefined) 또는 ToNumber>4 일 때만 기록 |
| poiseR | `if(P.poiseR===undefined)P.poiseR=0;` | 28586 | 키 부재일 때만 기록 |
| 최대 쉴드 | `P.mshield=~~(100+s.int*5+_totalBonusShield+_eqAffix('shieldFlat'));` | 28622 | stage `shield`. `~~` = 공용 `CombatStatFormula.js_to_int32` |
| 현재 쉴드 | `P.shield=Math.min(P.shield,P.mshield);` | 28623 | stage `shield`. NaN 전파 그대로, 현재값 0 보충 0 |
| (범위 밖) | `recalcSt()` | 28624 | `player_resource_parameters_source.run_recalc_st` 소유 — 이 모듈은 호출 0 |

### 원 설계 문서 대조 (읽기전용, 보고만)

- `docs/2_5 …/2_5 부활+에너지쉴드시스템.md` §144-153: `100 + INT×5 + bonusShield + shieldFlat` — source 와 일치. 문서의 "bonusShield 장신구 6슬롯" 은 **생성 측** 규칙이며, 합산 측 source(@28581)는 14슬롯 전부를 읽는다 → 이 모듈은 source 대로 14슬롯 합산(그 외 3슬롯 weapon/helmet/bow 는 제외).
- 같은 문서 §173-178 쉴드 자동 리젠(`shieldRegenT=180`, `pShieldCdMul`, `(0.3+INT×0.003)×pMRegenMul()`)은 regen tick 소유 → **이 모듈 범위 밖**(pMRegen getter 읽기/이식 0).
- `docs/2_3 …` §159-166: `maxPoise = 4`, 자동회복 없음, 피격/패링/탈출기 변화 — source applyStats 에도 poise 리젠 getter/writer 가 없음과 일치. 소모/기절/패링 +1 은 범위 밖.

## 3. JS 의미 보존

| 경우 | 원 의미 | 포트 |
|---|---|---|
| `P.poise===undefined` | 키 부재(또는 JS undefined 값) | Dictionary **키 부재**만 undefined. Godot `null` 은 JS `null` 이므로 undefined 아님 |
| `P.poise>4` | 관계 비교 ToNumber | `AffixReader.js_to_number(v, present)` 후 `> 4.0` — `"5"`/`[5]`→true, `{}`/NaN/null/false→false |
| poise 보존 변형 | null/false/NaN/음수/0/정확히4 | 쓰기 0, 그대로 둠(SOURCE_NON_FINITE 아님 — 원도 보존) |
| poiseR | 존재하면 값 무관 보존 | 키 존재 검사만 |
| `(+_dit.bonusShield\|\|0)` | ToNumber 후 NaN/0→0 | `js_to_number` + `AffixReader.js_truthy`. 필드 부재/빈 item `{}` = 유효 source fallback 0 |
| `if(_dit)` | ToBoolean | `AffixReader.js_truthy` (truthy primitive item 은 프로퍼티 undefined → 0) |
| `~~(…)` | ToInt32 (부호 wrap, 비유한→0) | `CombatStatFormula.js_to_int32` — 예: 2147483894.5 → -2147483402, Infinity → 0 |
| `Math.min(P.shield,…)` | ToNumber, NaN 전파 | 부재→NaN, `"abc"`→NaN, null→0, `"250"`→250, +Inf→mshield, −Inf→−Inf |
| 비유한 결과 | 원은 `P.mshield` 를 먼저 유한값으로 대입한 뒤 `P.shield` 에 NaN/−Inf 대입(부분 기록) | **SOURCE_NON_FINITE** + `diagnostic_packet` 만, packet 전체 거부·sink 0 (mshield 도 미기록). **유한 domain 포트 경계**이며 원 비유한 부분 기록의 정확한 alias 가 아님. 새 gameplay 게이트 아님 |
| Godot Object 값/item | 원 JSON 상태에 없음 | NOT_READY `unsupported_shape:*` / `unsupported_item_shape:*` |
| 덧셈 순서 | 좌→우 | `((100 + s_int*5) + bonus) + shieldFlat`, bonus 는 14슬롯 순서 누적 |

중복 generic coercion 0: `js_to_number/js_truthy`(equipment_affix_reader), `js_to_int32`(combat_stat_formula), `DEF_SLOTS/KIND_APPLY_STATS/READY`(player_resource_parameters_source) 재사용.

## 4. Public API (`producer.gd`, `extends RefCounted`)

| API | 종류 | 설명 |
|---|---|---|
| `configure(providers: Dictionary, sink: Callable) -> Dictionary` | 바인딩 | Callable 의 RefCounted owner 강참조 보관. readiness 반환 |
| `clear()` | 바인딩 | 전체 해제 → NOT_READY, owner 해제 |
| `readiness()` | 준비도 | provider 호출 0. `stages.poise_init/shield.{ready,missing}`, `sink_ack_contract`, `missing_upstream` |
| `plan_poise_init()` | 파생(순수) | packet `apply_stats_poise_init` writes `maxPoise[, poise][, poiseR]` |
| `plan_shield()` | 파생(순수) | resource_plan provider **1회** 호출 → packet `apply_stats_shield` writes `mshield, shield`. values: `s_int, total_bonus_shield, bonus_slots, shield_flat, mshield_raw, mshield, shield_before_present, shield_before, shield` |
| `run_poise_init_stage()` | dispatch | poise stage 단독: plan → sink 1회 |
| `run_shield_stage()` | dispatch | shield stage 단독: plan → sink 1회. recalcSt/캐시 무효화 호출 0 |
| `read_current()` | 현재값 읽기 | 현재 P 의 `shield,mshield,maxPoise,poise,poiseR` 원값 그대로. 키 부재→NOT_READY+`missing`; 존재하나 유한 number 아님→`non_finite_number` 진단(보충 0) |
| `dispatch_count()`, `resource_plan_calls()`, `last_result()` | 진단 | — |

Status: `READY` / `NOT_READY`(provider·projection·sink·shape 누락, packet null) / `SOURCE_NON_FINITE`(Math.min 비유한, sink 0) / `SINK_REJECTED`(**PORT BINDING** — sink ack `false`. 원에는 ack 가 없으며 gameplay 게이트 아님).

Packet: `{kind, source, writes:[{field, value, source, expr}]}` — sink 는 writes 를 순서대로 같은 P 필드에 대입.

## 5. Provider (매 호출 live)

| 키 | 원 | 필요 stage | production 상태 |
|---|---|---|---|
| `player` | 현재 `P` | poise_init, shield, read_current | **없음** — native Player 에 shield/mshield/maxPoise/poise/poiseR source projection 없음 (ENGINE) |
| `inventory` | 현재 `INV` (`equipped`) | shield | **없음** — ITEM/ENGINE |
| `eq_affix` | `_eqAffix(id)` + `_eqAffixCache` | shield | **재사용**: `Callable(equipment_affix_reader, "eq_affix")` ({status,value}; READY 만 값, READY_PARTIAL/NOT_READY → NOT_READY) |
| `resource_plan` | applyStats 내 `s.int` | shield | **재사용**: 새 READY `player_resource_parameters_source.plan_apply_stats()` 결과. central 이 공통 plan 을 1회 계산해 같은 결과를 돌려주는 Callable 로 공급 가능. `SOURCE_BOOT`/NOT_READY/SOURCE_NON_FINITE/kind 불일치/`s_int` 부재 → NOT_READY |
| sink | `Callable(packet)->bool` | run_* | **미설치** — ENGINE (공유 P 적용) |

## 6. Stage 와 원 applyStats 순서 (central orchestration 소유)

원 applyStats 는 다른 owner 대입과 교차하므로 두 stage 를 **연속 결합하지 않는다**. central 이 아래 위치에서 각각 호출:

| 순서 | 원 line | owner |
|---|---|---|
| 1 | @28566-28581 유효스탯/14슬롯 합 | resource plan(s.int) / HP owner / 이 모듈(bonusShield) — 계산만 |
| 2 | @28582 mhp, @28583 baseDef | HP / DEF owner |
| 3 | **@28584-28586 poise 초기화** | **이 모듈 `run_poise_init_stage()`** |
| 4 | @28588-28620 ATK/speed/ST·HP·MP 리젠/결정/HP·MP 상한/패시브 | ATK·speed / resource(`apply_stats_resource_parameters`) / HP·DEF owner |
| 5 | **@28622-28623 mshield/shield** | **이 모듈 `run_shield_stage()`** |
| 6 | @28624 recalcSt (`invalidate_eq_caches` → mst/st) | resource `run_recalc_st()` |

주의: shield stage 는 **6 의 캐시 무효화 이전**에 실행해야 원과 같은 `_eqAffixCache`(intFlat/shieldFlat) 를 본다. `SourceParameters.run_apply_stats()` 는 phase1 과 recalcSt(invalidate 포함)를 묶으므로 **shield stage 전에 호출하면 안 된다**. central 은 같은 applyStats 패스에서 공통 plan 1개로 원 anchor 순서대로 각 owner sink 를 실행한다: `plan_apply_stats` → HP/DEF → poise stage → … → resource phase1 sink → shield stage → `run_recalc_st()`.

**Fixture adapter ≠ 설치된 orchestration**: 테스트 rig 는 `resource_plan` 에 `Callable(sp, "plan_apply_stats")` 를 직접 바인딩하므로 shield stage 호출마다 새 실제 plan 이 계산된다(실 SourceParameters 가 s_int 18 을 공급해 새 실제 ordered sink 까지 도달함을 검증). 실제 central 은 HP/DEF producer 와 공유하는 **같은 공통 fresh plan 을 1회 계산**해 그 결과를 돌려주는 provider 를 설치해야 한다. 새 producer 자체는 stage 당 provider 1회만 읽고, 두 번째 plan·recalcSt·캐시 무효화를 스스로 호출하지 않는다.

## 7. 파생 vs 현재 / 범위 gap

- **파생**: `plan_*`/`run_*` 만. boot/현재 P 값을 파생 READY 로 승격하지 않음.
- **현재**: `read_current()` 는 required player provider 의 원값 그대로. 부재 = NOT_READY+missing, 값 날조 0.
- poise: 원에 자동 player poise 리젠 getter/writer 없음 → 리젠/현재값 clamp 정책/필드 발명 0.
- 범위 밖(타 owner, 변경 0): HP/DEF/MP/ST 파생(HPDEFMPST), 쉴드 리젠 tick(`shieldRegenT`, pMRegen), hurtP 쉴드 흡수, poise 소모/기절(pStun)/패링 +1/탈출기 복원, Q/E, status clock, attack ticket, active cap, 무적, 난이도 보정, save/restore, HUD.
- native 60 / 기존 clock 보존: 이 모듈은 `_process`/`_physics_process`/timer 0.

`MISSING_UPSTREAM`: `current_P`, `current_INV`, `resource_plan`(central 공통 plan 공급), `install_sink`(+ stage orchestration). 하나라도 없으면 NOT_READY, 중립값 보충 0.

**invalid provider NOT_READY ≠ source fallback**: provider/projection/sink 부재, INV/`equipped` 부재, boot·NOT_READY·SOURCE_NON_FINITE resource plan, 미바인딩 affix reader → NOT_READY(sink 0). 반면 item 의 `bonusShield` 필드 부재/0, 빈 장비 `{}`, `shieldFlat` 어픽스 부재(원 `||0`) 는 원 source 가 0 으로 처리하는 **유효 fallback** 이며 READY (테스트: 190 / 165).

## 8. 신규 isolated test — **최초·유일 실행 PASS (8그룹 234검사 FAIL0)**

실행: `godot --headless --script res://port_modules/player_shield_poise_parameters_source/test_first.gd` (전체) — 재실행 시 선택 예: `-- --only=shield_math,not_ready` 또는 `-- --only=cache_supplier` (별도 custom isolated 디렉터리). 그룹 이름: `poise_init, shield_source, shield_math, cache_supplier, not_ready, stage_order, current_reader, keepalive`. exit 0 PASS / 1 FAIL / 2 INVALID(검사0·unknown group). stderr `SCRIPT ERROR`/parse error 시 exit 무관 INVALID. 출력 marker: `PLAYER_SHIELD_POISE_LEDGER=<json>` (`routines`, `assertions`, `failures`, `failed_groups`, `calls`{run/plan/read 호출 수, producer sink dispatch, authority sink 호출, resource_plan provider 호출, invalidate_affix_cache 호출, physics/process/render/clock 0}).

실 production 체인: `player_resource_parameters_source.plan_apply_stats` (s.int — 가짜 s_int 0) + `equipment_affix_reader.eq_affix`/캐시 + `combat_reference_source.lv_b/eq_stat`, 모두 같은 `Authority` constructor fixture 의 P/STATS/INV 를 참조. sink 는 같은 P Dictionary 에 순서대로 대입.

| group | 내용 | 검사 | 결과 |
|---|---|---:|---|
| `poise_init` | 부재→4 / null·false·NaN·−2·0·4·4(int)·`{}` 보존(타입 포함) / 4.5·"5"·7·[5]→4 / maxPoise 9→4 / poiseR 부재→0, null·NaN 보존 / 재실행 maxPoise 만 / Object→NOT_READY 쓰기0 / plan 순수 | 104 | 첫 PASS |
| `shield_source` | s.int 18 = 실 plan values.s_int; 14슬롯 bonus 137.5 (weapon/helmet/bow 제외, "30"/null/"x"/{}/−20/7.5); shieldFlat 40; ~~367.5=367; min(500,367); writes mshield→shield; plan provider stage당 1회; mp/mmp/poise 미기록; 캐시 무효화 0 | 18 | 첫 PASS |
| `shield_math` | ToInt32 wrap −2147483402 (공용 js_to_int32 교차); 음수 max −612; 음수 현재 −50; null→0; "250"; +Inf→367; bonus Inf→0; 부재/NaN/"abc"/−Inf → SOURCE_NON_FINITE·sink0·0보충0 | 53 | 첫 PASS |
| `cache_supplier` | in-place bonusShield 는 live, intFlat/shieldFlat stale(467) → supplier `invalidate_affix_cache()` + ring2 장착 → 592; 해제 후 stale 372 → 무효화 후 282 | 13 | 첫 PASS |
| `not_ready` | 미설정 / poise-only 바인딩 stage 분리 / sink 누락 / P null / INV.equipped 부재(plan 호출0) / inventory provider 부재 / boot·미설정·SOURCE_NON_FINITE resource plan / 미바인딩 affix / Object item / sink false=SINK_REJECTED(PORT_BINDING) vs 유효 fallback 190·빈 장비 165 | 23 | 첫 PASS |
| `stage_order` | 고정 constructor fixture trace 명령(mhp/baseDef/baseAtk/mmp) 사이 poise→shield 교차, stage당 packet1, run_apply_stats/run_recalc_st API 부재, invalidate 0, shield 단독은 poise 미기록 | 9 | 첫 PASS |
| `current_reader` | stage 전 missing maxPoise/poise/poiseR + 원값만; stage 후 367/367/4/4/0; plan/sink 호출0; null poise 진단; projection null / provider 부재 NOT_READY | 8 | 첫 PASS |
| `keepalive` | caller 가 fixture 를 놓아도 producer 가 유지·기록, clear() 후 해제·NOT_READY | 6 | 첫 PASS |
| 합계 | 8 고유 그룹 | **234** | **FAIL0** |

`stage_order` 의 HP/DEF/MMP 교차는 **고정 constructor fixture 의 trace 명령**(`Authority.other_owner_write`)이며, 실제 공유 HP/DEF owner 통합이나 live Player 필드 주입이 아니다.

### 8.1 최초·유일 실행 (attempt1)

| 항목 | 값 |
|---|---|
| UTC | `2026-10-13T18:43:32.009621Z` → `2026-10-13T18:43:32.266203Z` (약 0.257초) |
| Godot | v4.7.2.stable.official (headless, 외부 `fixture-attempt1/` custom isolated 디렉터리) |
| 선택 | 전체(`--only` 없음) 8 그룹 |
| 결과 | 234검사 / FAIL0 / exit 0 / verdict PASS |
| stderr | 빈 값 — SCRIPT ERROR 0 / ERROR 0 / parse error 0 |
| INVALID / 재시도 / 제품 수리 | 0 / 0 / 0 |
| automatic physics/process/render | runtime.json `unmeasured` (driver 자체 physics/process/render/clock 사용 0) |

### 8.2 Ledger `calls` (원값 그대로)

| 항목 | 횟수 | 해석 |
|---|---:|---|
| `run_poise_init_stage` | 25 | NOT_READY/sink 누락 분기 포함 |
| `run_shield_stage` | 35 | NOT_READY/SOURCE_NON_FINITE/SINK_REJECTED 분기 포함 |
| `plan_poise_init` / `plan_shield` | 2 / 2 | 직접 순수 plan |
| `read_current` | 5 | — |
| `resource_plan_provider_calls` | 31 | shield plan 37회(run35+plan2) 중 provider 이전 조기 NOT_READY 6회 제외 — stage 당 최대 1회 |
| `direct_plan_apply_stats` | 1 | `shield_source` 의 s_int 교차검증용 직접 호출 |
| `invalidate_affix_cache` | 2 | `cache_supplier` 의 supplier 무효화 호출 |
| `producer_sink_dispatches` | 41 | **accepted 기록 수 아님** — 거부 ack(SINK_REJECTED) 음성 분기 1회 포함 |
| `authority_sink_calls` | 40 | ledger 집계 대상 Authority 의 sink 호출(거부 ack 1회 포함). 차이 1 = keepalive 의 분리 Authority(집계 목록 밖) |
| `physics_process_render_clock` | 0 | — |

실제 기존 `SourceParameters.plan_apply_stats` 가 공급한 **s_int 18** 이 새 producer 를 거쳐 새 실제 ordered sink(같은 constructor P 의 `mshield→shield` 순 대입) 까지 도달했다.

## 9. headless vs public / FPS

- 이 test 는 headless 계산·dispatch 계약 검증이다. driver physics/process/render/clock 0, 자동 frame 수 **UNMEASURED** → FPS/프레임 수치·공개 플레이·픽셀 근거 아님.
- 공개 pixels / GUI / FPS min 240 / 1080p 관측 없음. 실제 Main/Player 설치, 공개 자연 플레이에서의 shield/poise 표시·소모는 미완(ENGINE/central).

## 10. 관련 문서 (executor 의 전체 keyword 검색으로 central 동기화 인계)

직접 읽음: `docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md` §144-178, `docs/2_3 돌진+패링+방패시스템/2_3 돌진+패링+방패시스템.md` §159-166(읽기전용), `docs/engine/FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md`. `docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md`, `tools/marketing_capture_studio_20261009.*` 미접근.

관련 docs 전체 경로 검색 keyword: `mshield|shieldFlat|bonusShield|maxPoise|poiseR|player_shield_poise_parameters_source|plan_apply_stats` (docs/ 전체, 위 정확한 marketing 파일 제외, `docs/2_3 …` 는 불변 — 경로만 central 인계). 검색과 일치 파일 수는 이 문서 작성 **후** executor 가 갱신하는 외부 기록(`…/team-port/player_shield_poise_parameters_source/related-doc-paths.txt`)이 기준이며, 여기서는 수를 적지 않는다. 이 모듈은 자기 신규 문서만 편집했고 기존 docs 변경 0. 공통 docs 동기화(2_5 "6슬롯" 생성 규칙 vs 합산 14슬롯 등)는 central 담당.

## 11. Receipt / authored 경계

| 항목 | 기록 |
|---|---|
| 작성자 | 실제 Claude Code CLI, 기본 모델 `claude-opus-5-5` (model override 0), PID 28366, session `cc9db45e-b44f-43f3-b791-6f0f17077056`, UTC 2026-10-13T18:32:11Z 시작 |
| 권한 | `--restricted` / `dontAsk` / tools Read·Glob·Grep·Write·Edit / MCP `{}` / 정확한 자기 경로 3개만 Write·Edit |
| 최초 Write | producer.gd / test_first.gd / 이 문서 — 3파일. 작성 중 parse 안전 조정(`as` cast, lambda→명명 mutator)은 **첫 테스트 이전**의 source 구성 편집이며 제품 실패 수리 아님 |
| 첫 실행 이후 | code/test **FROZEN** — 변경·재실행 0 (`code-test-first-pass-frozen.json` sha256 기록). 이 doc-only resume 은 같은 session 의 별도 PID 로 실행되며 PID 는 executor 기록(`claude-doc-launch.json`) 기준 |
| 사전 receipt | 작성 전 WORK+HEAD 부재/parent/symlink 확인 `scope-absence-backup.json`; 이 receipt 전 문서 외부 백업 `doc-before-first-pass-receipt.md` |
| 0 항목 | shared/Git/human input/save/server/PNG/import/old test 읽기·실행 0, 다른 producer/Player/World/Main 변경 0, 기존 docs 변경 0 |
| 원 source 보존 | maxPoise 4, poise 초기화 @28584-28586, shield @28622-28623, 14슬롯 합 그대로. 자동 poise 리젠 필드/정책 발명 0 |

**최종 상태**: 독립 producer 기술 PASS(최초·유일 실행 234/234). **central 바인딩 PENDING** — 공유 Player projection, 현재 INV, 공통 fresh plan 1회 공급, sink 설치, 원 anchor 순서(shield 는 recalcSt invalidate 이전) orchestration 이 남아 있으며, 제품 전체 완료로 주장하지 않는다.

Codex executor 권한 audit 보충: 초기 제작 PID 28366 세션의 permission_denials는 0이다. doc-only resume PID 33070에서 허용된 문서 옆 FDG_GODOT_PORT_PLAYER_SHIELD_POISE_PARAMETERS_SOURCE_FIRST_20261013.md.__tail_unused__ 빈 Write 1회를 시도했고 restricted 권한이 거부했다. 해당 파일 생성 0, 권한 변경·우회·동일 거절 경로 재시도 0이며 이후 정확한 자기 문서 Edit만 성공했다. doc-only permission_denials=1, 소유 밖 성공 Write=0으로 기록한다. 이 보충은 성공 code/test의 변경·재실행을 하지 않는 Codex executor receipt이다.

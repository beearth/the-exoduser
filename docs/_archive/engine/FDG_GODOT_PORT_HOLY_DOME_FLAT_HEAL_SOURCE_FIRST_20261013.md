## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

# FDG Godot Port — holy_dome_flat_heal_source FIRST (2026-10-13)

TASK `GODOT-PORT-HOLY-DOME-FLAT-HEAL-SOURCE-FIRST-20261013` · 상태 **독립 HP-only flat 공급자 / 첫 실행 7그룹 92검사 ALL PASS(exit 0)** · 실제 현재 `_fuseStar('holyDome')` 공급자 부재 = Main gap(필수 reader NR). 바인딩 readiness와 분기별 guard skip은 Main 권위 전체가 아니다.

이 모듈은 원 `updatePlayer` 회복의 영역 flat 리젠 중 **HP 대입만** 포팅한다. 수동 source phase이며 자체 clock은 없다. `_inHolyDome`과 첫 매치 index는 [holy_dome_presence_source](FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md)가 소유한다. 같은 guard와 같은 `_hdFlat`는 readonly 패킷으로 돌려준다. ENGINE은 이 값으로 MP와 ST를 원 HP→MP→ST 순서대로 소비한다.

## Module paths

| path | role |
|---|---|
| `godot/port_modules/holy_dome_flat_heal_source/producer.gd` | HP flat 계획 + HP sink 1회 (new) |
| `godot/port_modules/holy_dome_flat_heal_source/test_first.gd` | isolated tests G01–G07 (`--only` / `--report`) (new) |
| `godot/port_modules/holy_dome_presence_source/producer.gd` | `presence_detail()` 공급 (readonly 재사용) |
| `godot/port_modules/equipment_affix_reader/producer.gd` | `eq_affix('skillBoost')`, `js_truthy` / `js_to_number` (readonly 재사용) |
| `godot/port_modules/detonate_blast/producer.gd` | `static fuse_mul(star, skill_boost)` (readonly 재사용, 수식 복사 0) |
| R `game.html:33348-33352`, `45027-45032`, `45088` | original source (read-only) |

## Source (exact, HP 부분만 소유)

```js
let _inHolyDome=false,_hdLv=1;                                                        // 33348
if(G._fireZones){for(...){const _hd=G._fireZones[_hdi];
  if(_hd.type==='holyDome'&&dst(P.x,P.y,_hd.x,_hd.y)<_hd.r){_inHolyDome=true;_hdLv=_hd.lv||1;break}}}  // 33349
if(_inHolyDome&&P.hp>0){const _hdFlat=(10+_hdLv*2)/60*sp*_fuseMul('holyDome');
  P.hp=Math.min(P.mhp,P.hp+_hdFlat);P.mp=...;P.st=...}                                // 33352
function _fuseStar(skId){if(!P._fused)return 0; ... _FUSE_PAIRS/_FUSE_GEM_GROUPS ...} // 45027-45032
function _fuseMul(skId){const s=_fuseStar(skId);const _fm=s>=2?1+(s-1)*.2:1;
  return skId==='chargeBoost'||skId==='magicBlink'?_fm:_fm*(1+_eqAffix('skillBoost'))}  // 45088
```

| 단계 | 원 | 포트 |
|---|---|---|
| 1 판정 | 첫 매치 holyDome, strict `<` | `presence_detail()` READY true + `index`. 거리/type 재평가 0 |
| 2 레벨 | `_hd.lv\|\|1` 다음 `_hdLv*2` ToNumber | 같은 현재 G reader로 `G._fireZones[index]`만 읽음. 재스캔/lv max/alias 0 |
| 3 guard | `_inHolyDome&&P.hp>0` | false → `outside`. hp≤0 → `hp_guard_skip`. 둘 다 `_fuseMul`/mhp/sink 0 |
| 4 배율 | `_fuseStar` → `_eqAffix('skillBoost')` 순 | `fuse_star_reader('holyDome')` → `skill_boost_reader('skillBoost')` → `Detonate.fuse_mul` |
| 5 수량 | `(10+lv*2)/60*sp*fm` 좌→우 | 동일 순서. 돔×2 추가 0, 자연 HP 배율(pRegen/lifeHealPow/pAbund/pPred) 0 |
| 6 HP 대입 | `Math.min(P.mhp,P.hp+_hdFlat)`, hp<mhp guard 없음 | `hp_sink(new_hp)` 1회. full/overcap에도 대입하며 overcap은 mhp로 downclamp |
| 7 MP/ST | 같은 guard/flat | **비소유**. `shared_guard_active` + `mpst_flat_amount` readonly handoff |

자연 HP(33356-33358), regen 율, MP/ST 대입은 별도 모듈 소유이다. presence의 수명·지속시간·zone 생성·G 공급도 별도 모듈 소유이다.

## Public API

| API | contract |
|---|---|
| `configure(presence_reader, current_world_reader, current_player_reader, fuse_star_reader, skill_boost_reader, hp_sink) -> readiness` | 6 Callable. RefCounted owner를 강하게 보유한다. 전역 setter는 없다 |
| `readiness()` | `{ready,status,missing[]}`. 값 호출 0. 이번 tick의 guard가 fuse를 쓰지 않아도 누락된 필수 fuse reader를 표시 |
| `plan_native(sp)` | 쓰기 0. `{status,reason,outcome,sp,presence_status,selected_index,level_raw,level_raw_present,level_origin,level,star,skill_boost,fuse_mul,flat_amount,hp_packet{hp_before,mhp,new_hp},shared_guard_active,mpst_flat_amount,source}` |
| `advance_native(sp)` | 먼저 sink 유효성을 확인한다(누락 시 NR이며 read와 dispatch는 0). 이어 plan을 수행하고 `heal`일 때만 `hp_sink(new_hp: float) -> bool`를 정확히 1회 호출한다. `true`가 아니면 `hp_sink_rejected` |
| `read_counts()` / `clear()` | 진단 카운트 / 바인딩·owner 해제 |

- `presence_reader`는 `Callable(presence, "presence_detail")`이다. `current_world_reader`와 `current_player_reader`는 presence에 준 것과 **같은** 현재 G/P reader여야 한다.
- **계약 한계(identity 미증명):** producer는 presence의 private reader에 접근하지 않는다. presence 술어가 쓰는 G reader와 여기 주어진 G reader가 같은 객체인지 증명하지 않으며, 위치를 다시 스캔하지도 않는다. 매 호출에서 확인하는 것은 선택 zone 검증뿐이다. 선택 index가 범위를 벗어나면 `selected_zone_missing`이다. `_fireZones[index]`가 `type==='holyDome'` Dictionary가 아니면 `selected_zone_mismatch`이다. 거리 술어는 다시 평가하지 않는다. 코드 주석 "presence 와 다른 G 를 읽었으면 NR"과 테스트 G06의 "different G reader → mismatch NR"은 이 index/type 검증만을 뜻하며 완전한 identity 증명이 아니다. 다른 G가 같은 index에 holyDome zone을 갖고 있으면 통과한다. 따라서 ENGINE은 **동일한** 실제 G/P callback을 바인딩해야 한다. 또 presence 호출부터 sink까지 G/P가 바뀌지 않는 readonly 안정 phase에서 호출해야 한다.
- `fuse_star_reader(skId) -> {status:"READY", value:finite number, reason}`. `skill_boost_reader(id)`는 `equipment_affix_reader.eq_affix`이다. 정확히 `READY`만 권위로 인정한다. `READY_PARTIAL_AFTER_SOURCE_THROW`, `SOURCE_THROW`, `NOT_READY`, 비유한값, 비숫자, bool, 누락 value는 모두 NR이다. 중립 star 0, fuse 1, boost 0으로 채우는 fallback은 없다.
- affix lazy cache는 그대로 유지한다. 무효화는 원 지점에서 ENGINE/ITEM이 `invalidate_affix_cache()`로 호출한다.

## NR / unsupported (packet null, sink 0)

| 입력 | 결과 |
|---|---|
| sp 비숫자/NaN/±Inf | `sp_unsupported:non_finite_or_non_number` (read 0) |
| sp < 0 | `sp_unsupported:negative`. 원은 음수 flat을 그대로 적용하지만 port는 명시 미지원(가짜 pause 아님) |
| presence status ≠ READY (G null, `SOURCE_THROW` zone null 등) | `presence_not_ready:<status>:<reason>` |
| G/P 부재·비Dictionary, 선택 zone 부재/불일치 | NR |
| `lv` 가 Array/Dictionary/StringName/기타 | `zone_level_unsupported_shape:<type>`. 1로 대체하지 않는다 |
| hp 누락/비숫자/비유한 | `player_hp_unsupported`. 기본값 없음. guard 이전 |
| mhp 누락/비숫자/비유한 | `player_mhp_unsupported`. 원 순서대로 fuse read 이후 |
| 최종 HP NaN/±Inf | `hp_output_non_finite_unsupported`. 지원 범위는 유한 출력. +Inf flat 또는 유한 overflow는 `Math.min`이 mhp로 cap하므로 READY |

범위 주의:
- **레벨 검증 순서:** 레벨 shape/ToNumber 검증은 HP guard보다 먼저 한다. 그래서 형식이 잘못된 raw level(Array, Dictionary 등)은 원에서라면 hp≤0 guard skip이 될 tick에서도 NR이 될 수 있다. 지원 범위는 유한 숫자, 숫자 문자열, 원시 falsy 현재 zone level이다. 형식이 잘못된 모든 JS 값과의 완전한 parity는 주장하지 않는다.
- **비유한 최종 HP:** +Inf flat → mhp cap은 지원한다. 최종 HP가 NaN이나 -Inf가 되는 입력은 NR이다. 원처럼 손상된 HP를 기록하지 않으며, 이 경우 source parity를 날조하지 않는다.
- **sp:** 음수 sp는 미지원이다. sp 0은 원 그대로 대입한다(overcap downclamp 포함).
- **출력 경계:** outside와 hp≤0에서는 fuse 호출이 0이다. sink가 없으면 preflight에서 NR이며 모든 read가 0이다. 이는 의도된 출력 경계이다.

## Level defaults (`_hd.lv||1` → ToNumber)

| raw | level | origin |
|---|---|---|
| 없음 | 1 | `default_absent` |
| `null` / `false` / `0` / `NaN` / `''` | 1 | `default_falsy` |
| `'0'` (truthy 문자열) | 0 → flat 10/60 | `raw` |
| `'2'` | 2 → flat 14/60 | `raw` |
| `true` | 1 | `raw` |
| `'abc'` | NaN → 최종 HP NaN → NR | `raw` |
| `'Infinity'` / `1e308` | +Inf flat → mhp cap | `raw` |

ToNumber 변환은 `||1` 판정 뒤에 `AffixReader.js_to_number`로 한다. truthy 판정은 `AffixReader.js_truthy`이다.

## `_fuseStar` authority (Main gap)

- 실제 현재 `_fuseStar('holyDome')` 공급자(`P._fused`, `_FUSE_PAIRS`, `_isFused`, `_FUSE_GEM_GROUPS`)는 **아직 없다**. 이 모듈도 테이블이나 `_fuseStar`를 구현하지 않는다. ENGINE/SKILL이 production reader를 공급하기 전까지 Main에서 active + hp>0 tick은 NR이다.
- 테스트의 `UnfusedStarFixture`는 **fixture 전용**이다. 원 첫 줄 `if(!P._fused)return 0`만 현재 P로 읽어 star 0을 반환한다. truthy `_fused`에서는 `current_fuse_tables_missing` NR이며 star 1이나 2로 가정하지 않는다. `ConstStar`의 star 3은 명시 constructor provenance이고 production 권위가 아니다.
- 구분: constructor 비융합 source 0 ≠ 바인딩되지 않은 현재 star. 후자는 NR이다.

## Tests

`godot --headless --path <isolated fixture> --script res://port_modules/holy_dome_flat_heal_source/test_first.gd -- [--only=G0x[,G0y]] [--report=<json>]` → exit 0 PASS / 1 FAIL / 2 INVALID(unknown group 또는 group script error). report: `result, groups_requested, groups_completed, script_errors, checks, failed`.

fixture는 순수 `.gd` 5개이다. 신규 2개와 readonly production 3개(presence, affix, detonate_blast)로 구성되며 이전 테스트, PNG, import, UI, 서버, 저장소는 0이다.

| group | 내용 |
|---|---|
| G01 binding_readiness | full ready, RefCounted이며 clock 없음. unconfigured NR. star reader 누락 시 readiness에 표시되고 outside는 READY, active는 NR(sink/boost 0). sink 누락 NR(read 0), clear |
| G02 selection_level | M30·원거리 holy·lv3·lv9 → index 2 / lv3. 실제 presence → affix 0.1 → `fuse_mul` → sink. MP/ST 불변 + handoff. level defaults 10건. unsupported lv 2건. `'abc'` NR. M30 단독 → outside |
| G03 presence_boundary | 3-4-5 dst==r는 outside(P/G/fuse/sink 0), r+ε는 heal. r0 같은 점, 대소문자 type, `_fireZones` 부재/null |
| G04 hp_guard_quantity | hp 0/-3은 guard skip(fuse/mhp/sink 0). full이어도 대입하고 overcap은 downclamp. sp0 대입. sp 2.5 수량. sp 음수/NaN/Inf/문자열 NR. +Inf cap, 유한 overflow cap, -Inf NR. hp/mhp 누락·문자열 NR. sink false |
| G05 fuse_authority | fused → NR(boost 0). falsy `_fused` → 0. 명시 star3/1. 잘못된 star 7종 NR. affix null/throw/partial/Inf NR. affix 부재 → fm 1 |
| G06 current_mutation_cache | G null, SOURCE_THROW, 다른 G reader 불일치/부재. lv·zone 순서·mhp·P 위치를 호출 사이에 변경. affix lazy cache 유지 → 호출자 무효화 후 반영 |
| G07 retention_manual_clock | 분리된 rig owner의 강한 보유. plan×3 쓰기 0. advance 1회 dispatch. clear 시 owner 해제 |

fixture 피연산자(hp 50/mhp 100, skillBoost 0.1, sp 1)는 기술 값일 뿐 제품 값이나 Main readiness가 아니다.

### Result

| group | result |
|---|---|
| G01_binding_readiness | PASS |
| G02_selection_level | PASS |
| G03_presence_boundary | PASS |
| G04_hp_guard_quantity | PASS |
| G05_fuse_authority | PASS |
| G06_current_mutation_cache | PASS |
| G07_retention_manual_clock | PASS |

- **결과:** 첫 실행 1회이다. 7개 그룹 모두 완료했고 92개 검사가 모두 PASS(exit 0)이다. FAIL, INVALID, script error는 모두 0이다.
- **수정·재실행:** product와 fixture test 수정은 0이다. 성공 그룹 반복 실행도 0이다. 이전 presence/HP/stat/natural/strict/QE 테스트 실행도 0이다.
- **실행 환경:** Codex executor가 Godot 4.7.2 headless 고립 fixture에서 신규 unit만 실행했다. fixture는 신규 code/test 2개와 readonly production 의존성 3개(presence, equipment_affix_reader, detonate_blast) 복사본이다. asset, font, import, GUI, public pixel, GPU/FPS는 0이다.
- **증명 경로:** 실제 production `presence_detail`과 같은 현재 G/P를 쓰는 고정 constructor로 시작한다. 이어 실제 Affix `skillBoost`와 재사용 `Detonate.fuse_mul`을 거쳐 신규 HP producer에 이르고, 단일 쓰기 가능 HP sink에서 끝난다.
- **런타임 범위:** 명시 메서드만 호출하는 RefCounted이다. 자체 physics/process/clock/render는 0이다. SceneTree 전역 frame은 계측하지 않았다.
- **관측의 성격:** 관측은 source 국소 관측이며 완전한 native parity가 아니다. 이전 oracle replay는 0이다.
- **fixture 한계:** 비융합 star 0 reader는 원 `if(!P._fused)return 0` 분기를 **fixture에서만** 구현한다. 라벨된 star 3 constructor 값은 수식 테스트일 뿐 production 현재 `_fuseStar` 증명이 아니다.
- **Main 승격 금지:** 실제 Main `_fuseStar('holyDome')` 공급자는 여전히 부재하다. 이 필수 reader가 없으면 NR이다. 추정 중립 1, `G={}`, source/Main ready로의 승격은 없다.
- **최종 bytes:** 테스트된 최종 code/test bytes는 이 doc 작성 뒤 Codex가 검증한다. 이 마감에서 code와 test는 봉인 상태이며 수정·재독·재실행은 0이다.

## Remaining gaps (not claimed)

| gap | owner |
|---|---|
| production `_fuseStar('holyDome')` reader(현재 `P._fused` + `_FUSE` 테이블) | ENGINE / SKILL |
| presence와 이 모듈에 **동일한** 실제 G/P callback을 연결하고 readonly 안정 phase에서 호출(identity는 이 모듈이 증명하지 않음), Player HP sink | ENGINE |
| root phase: holy presence → flat HP(이 모듈) → flat MP → flat ST → 율 precompute(`_hdMul`) → 자연 HP → ST/MP 순서 연결. flat HP는 자연 HP와 ST/MP 쓰기보다 앞선다 | ENGINE |
| MP/ST flat 대입(`mpst_flat_amount` 소비). 이 모듈은 공유 flat 수량만 돌려주며 MP/ST를 쓰지 않는다. flat 3자원 완료도 주장하지 않는다. 원 HP→MP→ST 전체 순서는 다른 owner가 바인딩할 때 중앙에서 완성한다 | ENGINE / 자원 regen 소유 모듈 |
| zone owner/lifetime/생성, presence 공급 | 다른 module |
| 자연 HP caller, ST/MP 율·대입, main phase | 다른 module / ENGINE |
| affix cache 무효화 지점 연결 | ENGINE / ITEM |

flat에는 pRegen, pAbund, lifeHealPow, 돔×2를 적용하지 않는다(원 동일). 이 constructor 통과는 Main, public, GPU, 시각, 240FPS 완료가 아니다. 공통 docs와 ENGINE 문서는 수정하지 않았다(0건).

## Related docs (keyword `_hdFlat|_hdLv|holy_dome_flat|holy flat|holyflat`, 미수정)

`docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md`, `docs/CHANGELOG_SYNC.md`, `docs/engine/FDG_ENGINE.md`, `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md`, `docs/engine/FDG_INTEGRATION_INTERFACE.md`, `docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_RESOURCE_REGENERATION_BINDING_20261014.md`, `docs/engine/FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_HP_REGENERATION_SOURCE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md`.

## Checkpoint

작업 범위:
- **작성 경로:** 신규 3경로만 작성했다.
- **수정 0:** 기존 module, Player, World, 공통 docs, 2_3, marketing은 수정하지 않았다. Git(stage/commit/revert), 서버(3333/3334), 저장소, 입력, GUI도 손대지 않았다(0건).
- **작성 전 확인:** 중복 CLI/session 0을 확인했다. 대상의 WORK·HEAD 부재와 backup은 기록되었다.

작성 세션:
- 실제 Claude 초기 PID 18630
- session `438f1791-8e1b-42b2-a967-0e7f5698f618`
- model `claude-opus-5-5`(override 없음)
- dontAsk/restricted, denials 0

마감 범위: 이 doc만 마감했다. code/test는 봉인 상태이다.

ENGINE 인계: 공유 keyword의 허용 docs 메타데이터(약 41경로)와 신규 doc 경로는 ENGINE에 인계된다. 정상 code와 docs checkpoint, 공통 docs 현재값 동기화는 ENGINE이 독립적으로 마감한다.

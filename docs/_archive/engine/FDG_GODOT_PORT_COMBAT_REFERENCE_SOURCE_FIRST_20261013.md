> **2026-10-15 현재 LMB 공격값 연결:** actual source provider의 현재 무기/강화/affix/baseAtk/STR·레벨/봉인/패시브 계산을 Main→Player→Crescent·기존 melee 피해 소비에 연결했다. 원0.7을7.0으로 바꾸지 않았다. [현재 계약·검수 한계](FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15).

| API / 범위 | 현재 계약 |
|---|---|
| Main.read_native_attack_parameters()(0) / Player.get_native_attack_parameters()(0) | fresh 현재 provider packet;미공급NR/요청비용 전 거부. 기본 원raw식과Ki meleeRef식을 구분한다. |
| Crescent.configure | 기존5인자,반환bool. current melee_ref×7×statStr1×current pAtkMul×스킬배율×차지배율,기존ToInt32. 일반타격은current pre×pAtkMul×pMeleeMul1+기존ST보너스. |
| 검수 / 남은 범위 | 4guard PASS+고정RNG 기대실패5→exact R VM oracle로교정한5PASS=9고유/첫전체clean아님. 실제공격packet→기존Enemy피해API소비;공간충돌·공개실전미증명. 속도/binds/held/SFX·전체피해/동적환경미완,latestfullfalse. |

## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

# FDG Godot Port — Combat Reference Source (meleeRef/magicRef) FIRST — 2026-10-13

TASK `GODOT-PORT-COMBAT-REFERENCE-SOURCE-FIRST-20261013` · 상태: **독립 reader 기술 완료 / 고유 10그룹 142검사 PASS** · 실제 공유 authority 바인딩·Main 플레이·시각·최소사양 240 미검수

소유 파일 3개 (신규):

| 파일 | 역할 |
|---|---|
| `godot/port_modules/combat_reference_source/producer.gd` | 원 `meleeRef()`/`magicRef()` 현재값 provider + 원 `_eqStat`/`_slotFlatAtk`/`_lvB`/`_weaponSeal` 읽기·계산 |
| `godot/port_modules/combat_reference_source/test_first.gd` | 격리 첫 테스트 (`--only=<group>`, 체크 0 그룹 → INCOMPLETE) |
| `docs/engine/FDG_GODOT_PORT_COMBAT_REFERENCE_SOURCE_FIRST_20261013.md` | 이 문서 |

## 1. 원 식 (canonical `game.html`, 읽기 전용)

| 원 | 줄 | 식 |
|---|---|---|
| `wp()` / `hm()` | 17020 / 17024 | `INV.equipped.weapon\|\|{}` / `INV.equipped.helmet\|\|{}` |
| `enhMulAtk(n)` | 28745 | `n*0.25` |
| `_eqStatRebuild` | 28627 | SLOT_NAMES 순서, `if(it)for(k2 in it) if(k2[0]==='b'&&typeof it[k2]==='number') cache[k2.slice(1)]=(cache[sk]\|\|0)+it[k2]` |
| `_eqStat(k)` | 28628 | `if(!_eqStatCache)_eqStatRebuild();return _eqStatCache[k]\|\|0` |
| `_slotFlatAtk(it)` | 29403 | `if(!it\|\|!it.affixes)return 0;` id `=== 'sharpAtk'\|'brutalAtk'\|'ruinAtk'` 이면 `s+=(+a.value\|\|0)` |
| `_lvB()` | 29405 | `~~(P.lv*.5)` |
| `meleeRef()` | 29407 | `(((+wp().atk\|\|0)+enhMulAtk(wp().enh\|\|0))+_slotFlatAtk(wp())+P.baseAtk+(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal>0?.3:1)` |
| `magicRef()` | 29409 | 같은 식, `hm()` / `STATS.int` / `_eqStat('Int')` |

원 상태값 (모듈은 **읽기만** 함, 기본값으로 공급하지 않음): mkP `baseAtk:8, lv:1` (@29657, `_weaponSeal` 키 없음) · recalc `P.baseAtk=G.on?15+((G.stage||1)-1)*2:15` (@28588) · `STATS={str:0,dex:0,int:0,vit:0,lck:0}` (@28268) · `P._weaponSeal=(P._weaponSeal||0)+600` (@41967) / 감소 (@37784).

교차 확인한 문서: `docs/14밸런스+수치테이블/스킬데미지공식표.md` L124~126 (`(ATK+enhMulAtk+slotFlat+baseAtk+STR/INT)×봉인`), `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md` L214 (`ATK + 강화×0.25`). 둘 다 원 식과 같다.

## 2. 계수 / 필드

| 항 | 필드 (원 raw) | 계수 / 변환 |
|---|---|---|
| 무기·투구 ATK | `item.atk` | `+x\|\|0` (ToNumber, NaN/0 → 0) |
| 강화 | `item.enh` | `(x\|\|0)*0.25` (truthy raw 를 ToNumber) |
| flat ATK | `item.affixes[i].{id,value}` | id 엄격 일치 3종, `+value\|\|0` 합 |
| baseAtk | `P.baseAtk` | JS `+` (문자열이면 **연결**) |
| 스탯 | `STATS.str` / `STATS.int` | JS `+` (문자열이면 연결) |
| 장비 스탯 | 모듈 private `_eqStatCache` 의 `Str` / `Int` | 캐시는 모든 슬롯 item 의 b 접두 + `typeof==='number'` 키 **전부**로 구축 (bool/string 제외, 일반 필드 `baseAtk`→`aseAtk`, `bonusHp`→`onusHp` 포함). 중간 NaN 은 다음 `\|\|0` 에서 0 으로 리셋. §4a |
| 레벨 | `P.lv` | `~~(ToNumber*0.5)` (ROOT `Formula.js_to_int32`) |
| 봉인 | `P._weaponSeal` | `ToNumber > 0` → ×0.3, 아니면 ×1 |

평가 순서 (throw 순서 보존): INV(wp/hm) → `_slotFlatAtk` → `P.baseAtk` → `STATS.<k>` → `_eqStat` → `_lvB` → `P._weaponSeal`.

## 3. raw 변환 (coercion)

| 입력 | 결과 |
|---|---|
| `atk "abc"` / `atk [40]` | 0 / 40 |
| `enh "4"` / `enh 0` / `enh {}` | 1 / 0 / NaN (READY non_finite) |
| `P.baseAtk "15"` (무기 50, 스탯항 23) | `"5015"+"23"` → 501523 (`terms.string_concat=true`) |
| `STATS.str "10"` | `"10"+10+3="10103"`, `65+"10103"` → 6510103 |
| `P.baseAtk` / `STATS.str` 없음 | NaN (READY, `non_finite=true`) |
| `P.lv` 없음 / `"7"` | lvB 0 / 3 |
| `_weaponSeal`: 없음, `"0"`, null, -5, NaN, `[]` | ×1 |
| `_weaponSeal`: 600, `"1"`, true, `[3]` | ×0.3 |
| affixes string / number / `{}` | 0회 순회 → 0 |

## 4. 상태: READY / NOT_READY / SOURCE_THROW / READY_PARTIAL

원 데이터 null 과 callback 의 null 반환을 구분한다:
- **reader(callback) 가 null 반환** = 현재 authority 없음 → `NOT_READY`, `<label>_reader_null`, value null.
- **반환된 INV 안의 원 데이터 null** (`equipped:null`, `affixes[i]:null`) = 원 TypeError → `SOURCE_THROW`.

| 상황 | status | value |
|---|---|---|
| 세 reader 모두 바인딩, 원 산술 완료 | `READY` | number (NaN/±Inf 이면 `non_finite=true`) |
| 장비 없음 (유효한 빈 `INV.equipped`) + mkP | `READY` | **8** (P.baseAtk=8 을 읽은 결과) |
| 장비 없음 + recalc P (baseAtk 15) | `READY` | 15 |
| `INV.equipped` 가 null 이 아닌 primitive (예: 0) | `READY` | 빈 장비와 같음 (원은 throw 안 함) |
| reader 미바인딩 (일부만 바인딩 포함) | `NOT_READY` | null, `missing=[INV,P,STATS 중 빠진 것]` |
| Callable 대상 해제 | `NOT_READY` | null, `<label>_reader_target_freed` |
| INV / P / STATS reader 가 null 반환 | `NOT_READY` | null, `INV_reader_null` / `P_reader_null` / `STATS_reader_null` |
| `INV.equipped` null / 없음 | `SOURCE_THROW` | null, `of null`·`of undefined (reading 'weapon'·'helmet')` |
| `affixes[i]` null | `SOURCE_THROW` | null, `reading 'id' @slot.affixes[i]` |
| `_eqStatRebuild` throw 후 남은 부분 `{}` 캐시로 계산 | `READY_PARTIAL_AFTER_SOURCE_THROW` | 원 숫자 (비권위). `*_ref_value()` 는 null |
| Godot Object 인 item/affix/스칼라, `{length:…}` 인 affixes, String/StringName/int/float/bool/null 이 아닌 item 키, Array 를 더하는 경우, 정수가 아닌 수를 문자열로 연결 | `NOT_READY` | null (포트 미지원 shape) |

미바인딩이나 null authority 를 8/15/0/1 같은 중립값으로 채워 READY 로 보고하는 경로는 없다. P/STATS 가 primitive 일 때는 원처럼 속성이 undefined 로 읽힌다 (별도 안전 검사 없음).

## 4a. `_eqStatCache` (모듈 private, 원 `let _eqStatCache=null`)

| 동작 | 원 | 포트 |
|---|---|---|
| 초기값 | `null` | `null` |
| 구축 | `_eqStat` 호출 시 null 이면 `_eqStatRebuild()` | 같음 (lazy). 캐시가 있으면 INV.equipped 를 다시 읽지 않음 |
| 구축 내용 | `_eqStatCache={}` 먼저 → SLOT_NAMES 순서, item 마다 for-in 키, `k2[0]==='b'&&typeof==='number'`, `(c[sk]\|\|0)+v` | 같음. 키는 전부 저장 (Str/Int 만 거르지 않음) |
| 반환 | `_eqStatCache[k]\|\|0` | 같음 + `origin`(sum/absent_zero), `rebuilt`, 진단용 `slots` |
| 구축 중 throw | 부분 `{}` 가 남고 다음 호출부터 그 값을 반환 | `SOURCE_THROW` 1회 → 이후 `READY_PARTIAL` (원 숫자) |
| in-place 장비 변경 | 무효화 전까지 stale | 같음 — 모듈이 변경을 추정하지 않음 |
| atk/enh/flat/P/STATS/_weaponSeal | 매 호출 live | 같음 (캐시 대상 아님) |

ENGINE 이 원 지점에서 호출해야 하는 이벤트:

| 원 지점 | 호출 |
|---|---|
| `_refreshEquipmentStats` (@16798, equip/unequip 후) | `invalidate_eq_stat_cache()` |
| `recalcSt` (@16934) | `invalidate_eq_stat_cache()` |
| `_inventoryEquipCP` (@49832~49836) | `tok=capture_eq_stat_cache_token()` → INV.equipped 교체 + `invalidate_eq_stat_cache()` → 계산 → finally INV 복원 + `restore_eq_stat_cache_token(tok)` (identity 그대로, 복제 없음) |

lifecycle: `configure_inventory_reader` (유효·무효 모두) / `clear_readers` → 캐시 null. 캐시가 있어도 매 호출 INV authority 를 확인 → 미바인딩·해제·null 이면 `NOT_READY` (캐시 값을 반환하지 않음). 일시적 null 반환은 캐시를 지우지 않는다.

for-in 순서: 정수형 키가 먼저지만 정수형 키는 `b` 로 시작할 수 없으므로 b 키 순서는 Dictionary 삽입 순서와 같다. 진단 snapshot 의 키 순서는 Godot 삽입 순서다 (원 캐시 객체에서 sk 가 정수형인 경우 예: `b5`→`"5"` 의 열거 순서와 다를 수 있음 — 값에는 영향 없음). String 과 StringName 이 같은 내용으로 함께 있는 item 키는 확인하지 않은 gap.

## 5. API

| 메서드 | 반환 |
|---|---|
| `configure_inventory_reader(Callable)` / `configure_player_reader(Callable)` / `configure_stats_reader(Callable)` | bool. invalid → false 이고 해당 reader 해제. INV 는 바인딩·해제 모두 `_eqStatCache` 를 null 로 |
| `clear_readers()` | 전부 해제 + 캐시 null |
| `melee_ref()` / `magic_ref()` / `reference_for_kind(kind)` | `{status, value, non_finite, source, reason, terms?, missing?}` |
| `melee_ref_value()` / `magic_ref_value()` | READY 이면 float (NaN 포함), 그 외(READY_PARTIAL 포함) null — ROOT formula 용 |
| `bind_combat_stat_formula(formula)` | `formula.configure_ref_readers(melee_ref_value, magic_ref_value)`. 세 reader 모두 바인딩돼야 함 |
| `eq_stat(k)` | 원 `_eqStat`: `{…, origin: sum\|absent_zero, rebuilt, slots}` |
| `invalidate_eq_stat_cache()` | 원 `_eqStatCache=null` |
| `capture_eq_stat_cache_token()` / `restore_eq_stat_cache_token(tok)` | `{cache(identity), partial, last_throw, slots}` |
| `is_eq_stat_cache_built()` / `eq_stat_cache_snapshot()` / `rebuild_eq_stat_cache()` | 진단: 구축 여부 / 복사본(미구축 null) / 현재 authority 로 강제 rebuild |
| `slot_flat_atk(it, label)` / `lv_b()` / `weapon_seal_active()` | 원 helper 1:1 |

`terms`: `slot, item (원 item 참조 그대로 / 없으면 새 {}), item_fallback_empty, atk_term, enh_term, slot_flat_atk, base_atk_raw/present, stat_raw/present, eq_stat, eq_stat_slots, eq_stat_rebuilt, eq_stat_partial, lv_b, pre_seal, string_concat, seal_active, seal_mul`.

## 6. 의존성 / 차용 (읽기 전용)

| 의존 .gd | 쓰는 것 |
|---|---|
| `port_modules/combat_stat_formula/producer.gd` | `SLOT_NAMES`, static `js_to_int32`, 내부 미바인딩 인스턴스의 `_js_add`/`_js_num` (JS `+`·문자열 연결, 관례상 private 이지만 재구현하지 않고 차용) |
| `port_modules/equipment_affix_reader/producer.gd` | static `js_truthy`, 인스턴스 `js_to_number` |

테스트에서만 쓰는 의존: `player_passives_source/producer.gd` (현재 PASSIVES reader → formula), `combat_qe/combat_qe_runtime.gd` (`_do_parry_native`), `combat_qe/producer.gd` (`parry_proj_damage`, `BLUE_REFLECT_COL`). NativePlayer/`player.gd`/에셋 preload 없음.

이 모듈이 다시 구현하지 않은 것: `_uEq`, `_eqImplicit`, `_eqAffix`, `_passDmgSum`, pAtkMul/pMagicMul, PASSIVES 상태·투자, STATS 할당·병합, level-effect, save restore.

## 7. 연결 지점과 남은 현재 authority 연결 (ENGINE)

| 연결 지점 | 현재 상태 |
|---|---|
| INV reader | ROOT affix reader·formula 와 **같은 Callable** 을 공유 가능. 실제 공유 INV authority 바인딩은 ENGINE 몫 |
| P reader (`baseAtk`, `lv`, `_weaponSeal`) | 네이티브 P Dictionary authority 가 없음 → ENGINE 연결 필요 (`player.gd @export melee_ref=8.0` 는 원 식이 아니므로 쓰지 않음) |
| STATS reader | 네이티브 현재 STATS authority 가 없음 (save_adapter 는 `context.STATS` 를 입력으로 받을 뿐). 이 모듈은 STATS 를 만들지 않음 → ENGINE/BUILD 연결 필요 |
| formula ref 채널 | number 전용 계약이라 SOURCE_THROW 도 formula 에서는 `NOT_READY meleeRef_unsupported_shape:Nil` 로 보임. 정확한 사유는 `melee_ref()` 로 확인 |
| `_eqStat` 캐시 이벤트 | 원 lazy 캐시를 구현함 (§4a). 원 무효화 지점 3곳(@16798/@16934/@49832~49836)에서 `invalidate`/`capture`/`restore` 를 호출하는 연결은 ENGINE 몫 — 연결 전에는 원처럼 stale 상태가 유지됨 |
| ROOT affix reader 캐시 | 같은 원 지점에서 `invalidate_affix_cache()` / affix token 도 함께 호출해야 함 (ROOT 소유, 이 모듈은 쓰지 않음) |
| `bowRef()` (@29408) | 범위 밖 |
| 공유 NativePlayer `get_parry_scale/get_ki_floor` | 연결 안 됨 (SKILL/ENGINE 소유). 테스트에서는 고정 RefCounted `ParryPlayer` 로만 소비 |
| `q_shield_mp_cost` | formula subset 의 `required_missing=["q_shield_mp_cost"]` 그대로 남음 — 8개 전부 READY 아님 |

## 8. 테스트 (`test_first.gd`) — 첫 유효 10그룹 / 142검사 PASS

Codex executor는 저장소 Godot 프로젝트를 실행하지 않고 외부 `fixture-attempt3/`에 필요한 순수 `.gd` 7개만 복사해 `Godot 4.7.2 --headless --path <isolated fixture> --script res://port_modules/combat_reference_source/test_first.gd`로 실행했다. 2개 자기 script + 5개 필요한 읽기 전용 producer/runtime 의존이며 이전 test/PNG/import 0. fixture는 별도 userdir 이름 `EXODUSER-CombatReferenceSource-Isolated-20261013`와 physics 60을 사용한다. 자동 physics/process/render/input 및 사용자 저장 파일 접근 0. 테스트 자체 종료 코드 0 PASS / 1 FAIL / 2 INCOMPLETE이나 컴파일 오류는 exit와 별도로 INVALID로 판정한다.

| group | 검증 내용 |
|---|---|
| `not_ready` | 미바인딩 / 일부 바인딩 / invalid / 대상 해제 / INV·P·STATS reader null 반환 → NOT_READY null. 원 데이터 null(equipped·affix) → SOURCE_THROW, 미지원 shape |
| `empty_floor` | 빈 장비 + mkP → 8, recalc → 15, `equipped=0` → READY, 미바인딩 null 과 구분 |
| `terms` | 장비 상태 melee 88 / magic 51.5, 항별 값, 슬롯 순서, item 참조 identity |
| `coercion` | §3 표 (b-stat 변경 뒤에는 원 무효화 지점처럼 invalidate) |
| `seal` | 봉인 분기 10종 |
| `live` | STATS/atk/P 는 다시 바인딩하지 않아도 live 반영 (98, ki 960, 118, 39). INV 교체 후 무효화 전에는 원 stale `_eqStat` 10 → 48, invalidate 후 38 |
| `cache` | lazy 구축, b-numeric 키 전부(`aseAtk`/`onusHp`, string·bool 제외), Str/Int in-place 변경 → 무효화 전 stale (98/51.5, atk 는 live) → 후 108/61.5, 캐시 identity 유지, CP preview capture→172→restore identity 108, null authority → NOT_READY (캐시 유지), 새 INV 바인딩 → null → 28, invalid/해제 → NOT_READY, rebuild throw → SOURCE_THROW → READY_PARTIAL 78 → invalidate 88, 미지원 키 shape, stale 캐시가 runtime 반사에 반영 (862 → 862 → invalidate 후 1842) |
| `formula` | 실제 ROOT formula: scale 5.6 / 61.6 / 36.05, ki 78 / 862 / 1034 (pAtk 2), throw·NaN 전파, `required_missing=[q_shield_mp_cost]` |
| `consumer` | 실제 `CombatQERuntime._do_parry_native`: 빈 장비 E100→78 (ki-floor 분기), 장비 E4000→2410 (scale 분기), E100→862, Q4000→2240 + blue 유도반사, 봉인 E100→258, 방패 parryBonus .25 × legSP 2 → 6026. 미준비/NaN → runtime 호출 안 함 (bank 그대로) |
| `readonly` | INV/P/STATS/PASSIVES 와 item identity 변화 없음, P 에 키 쓰기 없음, provider 는 Node 가 아님 |

TECH_OPERANDS (제품 값 아님): 입사 탄 dmg 100/4000, isQ 선택, `ParryPlayer.parry_bank/sb_parry_t`, `ParryProj.*`. 방패 케이스의 `affix.invalidate_affix_cache()` 는 원 equip 후 무효화 지점을 테스트가 대신 호출한 것.

화면/입력/1080p240/clock 없음 — 명시적인 메서드 호출만 사용.

## 9. 관련 문서 (중앙 handoff)

키워드 파일명 검색 (`INGAME_CAPTURE_STUDIO_20261009.md` 제외, 2_3 은 수정하지 않음):
`docs/engine/FDG_GODOT_PORT_COMBAT_STAT_FORMULA_FIRST_20261013.md` (§5 item 2 를 이 모듈이 해소, ENGINE 바인딩은 남음) · `FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md` (§`parry_scale` 미제공 행) · `FDG_GODOT_PORT_PLAYER_PASSIVES_SOURCE_FIRST_20261013.md` (§item 3) · `FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md` · `docs/14밸런스+수치테이블/스킬데미지공식표.md` · `BASIC_ATTACK_DAMAGE_20260910.md` · `MAGIC_ATTACK_DAMAGE_20260910.md` · `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md` · `docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md`. 공통 문서 동기화는 ENGINE 몫 (이 작업에서는 수정하지 않음).


## 10. 첫 실행 ledger / 실제 제작 주체

| 시도 | raw exit / 시간 | 유효 결과 | 수리 / 반복 |
|---|---|---|---|
| attempt1 | 0 / 0.156038583초 | test 정적 타입 오류 `RefCounted` script 인스턴스와 `Node` 비교, 그룹 0 / 검사 0, **INVALID** | Codex executor가 test1줄을 script instance base type 검사로 수리. 제품 숫자/동작 변경 0 |
| attempt2 | 2 / 0.599103625초 | 새 `reference(kind)`가 native `RefCounted.reference()->bool`와 충돌해 dependency compile 실패. 출력된 0검사 및 consumer FAIL은 **모두 INVALID**, 유효 PASS/FAIL 0 | Codex executor가 자기 API 이름만 `reference_for_kind`로 수리. 선언/내부 caller 및 자기 docs만 변경, 숫자/캐시/계산 변경 0 |
| attempt3 | 0 / 0.258162417초 | 아래 고유 10그룹 / 142검사 PASS, stderr 빈 값 / SCRIPT ERROR 0 | 아직 미실행인 10그룹의 첫 유효 실행. 실행 후 제품/fixture 수리 0, 유효 성공 재실행 0 |

| group | checks | first valid status |
|---|---:|---|
| not_ready | 25 | PASS |
| empty_floor | 7 | PASS |
| terms | 12 | PASS |
| coercion | 14 | PASS |
| seal | 11 | PASS |
| live | 8 | PASS |
| cache | 32 | PASS |
| formula | 14 | PASS |
| consumer | 14 | PASS |
| readonly | 5 | PASS |
| 합계 | 142 | 10개 고유 그룹 PASS |

실제 Claude Code CLI: 기본 설정 모델 `claude-opus-5-5` (모델 지정/설정 변경 0), session `2415d57b-e193-4009-8130-2b8b0ffb0980`. 최초 PID178 / UTC2026-10-13T15:48:50.471303 / 673565ms, 실행 전 원 lazy cache 보완 PID3668 / UTC2026-10-13T16:02:13.775081 / 347523ms. 두 호출 모두 restricted/dontAsk, Read/Glob/Grep + 자기 신규3파일 정확 Write/Edit만, permission denial 0 / Bash·Agent·MCP·GUI 0. 원 계산/API/test/doc 작성과 실행 전 cache 보완은 실제 Claude, 위 두 compiler 수리와 첫 isolated 실행/이 ledger는 Codex executor다.

명시 실제 `_do_parry_native` 호출은 9회(새 cache group 3 + 새 consumer group 6), 미바인딩/NaN gate 두 경우는 호출하지 않았다. 해당 runtime 함수 원본문을 호출하지만 플레이어/탄은 고정 RefCounted constructor fixture다. source/native clock 진전·자동 physics·render·public play·인게임 pixels·FPS 측정 0. 새 숫자 getter만으로 PASS한 것이 아니라 ROOT actual formula의 parry_scale/ki_floor와 actual QE runtime의 반사 피해/blue homing 분기까지 최초 소비했다. 원 공격 ticket·탄 제거·HP/좌표/AI/clock live 주입·난이도 변경 0.

원본/제작물·실행 로그: `E/godot-native-first/team-port/combat_reference_source/` 아래 `claude-stream.jsonl`, `claude-pretest-stream.jsonl`, 각 launch/prompt/stderr 및 `test-attempt{1,2,3}.{stdout,stderr}`, 각 engine/launch log. 수정 전 신규3파일 working/HEAD 부재·실 parent/symlink 확인 receipt와 실행 전 생성 byte backup, parser/API rename 전 자기3파일 byte backup도 이 외부 폴더에 보관했다. 기존 성공 suite/hash/PNG/copy/import 재생 0, shared 파일/Git/서버/배송 artifact/인간 paused 화면/save 접근 0.

관련 docs 파일명 검색은 전용 `keyword-doc-matches.json`의 **33경로(새 문서1 + 기존32)**를 중앙에 인계한다. exact marketing 제외 / 2_3 immutable, 기존 공통 docs 편집 0. ENGINE이 실제 authority/cache event 연결과 해당 공통 docs 현재값 동기화 후 정상 code+docs checkpoint를 담당한다. 이 결과로 full8/QE Main/전체 Godot/최소사양 1080p240 완료를 주장하지 않는다.

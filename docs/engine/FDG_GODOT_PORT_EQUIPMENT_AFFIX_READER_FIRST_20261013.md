## ENGINE actual resource regeneration binding - 2026-10-14

The new optional binding uses the SAME Player and World. It replaces the partial ST-only branch after binding and consumes World dt_sp/frame/ens once. Missing actual MP/base rates/current G/source phase rejects binding. Constructor fixture providers do not establish production Main authority. The previous .28 ST base stays only for an unbound Player; provider loss after binding never revives that fallback.

| Public API / value | Contract |
|---|---|
| Player.bind_native_resource_regeneration(adapter) | Same Player/World, five required methods, exact bool readiness, single persistent binding |
| Player.get_native_resource_regeneration_snapshot() | Deep copy of adapter snapshot plus persistent bound flag; unavailable adapter reports ready=false and bound |
| World.bind_native_player_resource_regeneration(adapter) | Existing ready World player only; no new actor/input/clock |
| ExoduserNativeResourceRegenerationAdapter.configure | Actual authority state s/st/mst/mp/mmp/stR/mpR; source rate supplier and holyDome supplier; lesson and exact source-phase readiness callbacks |
| Source rate / sink | Strict base-first 12-slot MP then ST rates; holy multiplier 2 or 1 once; idle /8, other /16, beam MP x0.5; source ST then MP ordered single atomic packet, including cap downclamp |
| Native clock / exclusions | Actual World dt_sp/frame/epoch/ens identity, duplicate/pause/lifecycle rejection. Dead Player skips regen. Chapter2 lesson skips writes. No HP/holy flat/QE/potion/save changes |
| Integration proof | 7 unique groups / 170 clean checks: first5/139, repaired clock13, repaired provider-loss18. Actual checks219 across 3 attempts; initial FAIL1 and SCRIPT_ERROR2/6 preserved. Clean success groups and old source suites rerun0 |
| Main / visual | Actual MP/current G and holyflat->rate precompute->HP->STMP phase unadopted. Constructor witness is not full source-phase proof. Main/character/pixel/240FPS remain unproven; VISUAL RETOUCH |

Exact contracts and first runtime evidence: [Resource regeneration binding SSOT](FDG_GODOT_RESOURCE_REGENERATION_BINDING_20261014.md).

---

# FDG Godot Port — Equipment Affix Reader FIRST (2026-10-13)

TASK `GODOT-PORT-EQUIPMENT-AFFIX-READER-FIRST-20261013` · 작성: Claude (코드/테스트/문서 저작만) · **격리 기술 마감: 고유 9그룹/69checks 첫 PASS** (2026-10-13 UTC / 2026-10-14 KST, executor exit 0·stderr/SCRIPT ERROR 0)

## 소유 파일 (신규 3개)

| 파일 | 역할 |
|---|---|
| `godot/port_modules/equipment_affix_reader/producer.gd` | 원 `_eqAffixRebuild`/`_eqAffix`/`sh()`/`_legSP` 실행 provider + SKILL subset adapter |
| `godot/port_modules/equipment_affix_reader/test_first.gd` | SceneTree 격리 테스트 (`--only=group`) |
| `docs/engine/FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md` | 이 문서 |

공유 Player/world/factory/driver/ITEM/SKILL 파일 수정 0. Git 변이 0. 아이템/어픽스/RNG 생성 0.

## 원 소스 (canonical `exoduser-migration-20261001/game.html`, 읽기전용)

| 원 | 위치 | 원문 |
|---|---|---|
| `SLOT_NAMES` | @15843 | `['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2']` |
| `_eqAffixRebuild` | @28631 | `_eqAffixCache={};for(si…SLOT_NAMES){const it=INV.equipped[SLOT_NAMES[si]];if(it&&it.affixes)for(i<it.affixes.length){const a=it.affixes[i];_eqAffixCache[a.id]=(_eqAffixCache[a.id]\|\|0)+(+a.value\|\|0)}}` |
| `_eqAffix` | @28632 | `if(!_eqAffixCache)_eqAffixRebuild();return _eqAffixCache[id]\|\|0` |
| `sh` | @17021 | `return INV.equipped.shield\|\|{}` (캐시 없음, live) |
| `_legSP` | @28684 (pParryProjDmg) | `(sh()._lShieldParry\|\|0)>0?sh()._lShieldParry:1` |
| `_sbCd` | @15041 / @34176 / @34207 / @34278 / @34428 | `~~(30*(1+_eqAffix('shieldCdRed')))` |
| `LEGENDARY_SPECIAL.shield` | @15770 | `{ko:'패리 성공 시 반격 데미지 ×2', stat:'_lShieldParry', val:2}` |
| 전설 기록 | @16636–16641 | `item.legendarySpecial={ko,stat,val}` — **`item._lShieldParry` 는 기록하지 않음** |

`_lShieldParry` 리터럴은 game.html 전체에서 @15770(표) 과 @28684(리더) 2곳뿐 → 원 생성 아이템에서 `_legSP` 는 항상 1(원 동작 그대로 dormant). 포트는 `legendarySpecial` 로부터 값을 유도하지 **않는다**(진단 flag `legendary_special_declared` 만).

### 캐시 무효화 (`_eqAffixCache=null`) 원 지점

| 원 지점 | 위치 | 포트 seam |
|---|---|---|
| `_refreshEquipmentStats` (equipItem @16871 / unequipItem @16884 / @46394) | @16798 | `invalidate_affix_cache()` — ITEM `post_effects_pending` 후 ENGINE 호출 |
| `recalcSt` (리롤 @51300, @51637, @62723, @64415… 등) | @16934 | `invalidate_affix_cache()` |
| `_testAffix` / `_testAffixClear` (콘솔 디버그) | @28644 / @28649 | 미포팅 (디버그) |
| `_inventoryEquipCP` 저장/null/finally 복원 | @49820 / @49833 / @49836 | `capture_affix_cache_token()` → `invalidate_affix_cache()` → `restore_affix_cache_token(tok)` (캐시 객체 identity 보존) |
| 스탯창 선구축 | @51770 | `ensure_affix_cache_built()` |

모듈은 장비 변화를 스스로 감지/추정해 무효화하지 않는다. 무효화 전 조회는 원과 동일하게 stale 값을 반환한다. 원 근거가 없는 지점은 하나뿐이다: **유효한** Callable 로 `configure_inventory_reader()` 를 호출하거나 `clear_inventory_reader()` 를 호출하면 캐시를 null 로 시작한다(원 초기 상태 `let _eqAffixCache=null` @28630에 대응하는 포트 바인딩 경계). **invalid Callable 로 configure 하면 `false` 를 반환하고, 기존 reader 와 캐시는 그대로 유지된다(해제하지 않음).** 해제하려면 `clear_inventory_reader()` 를 호출해야 한다.

## 보존된 의미 (coercion / truthiness / 순서)

| 항목 | 원 의미 | 포트 |
|---|---|---|
| 슬롯 순회 | `SLOT_NAMES` 순서 (INV.equipped 키 순서 아님) | `SLOT_NAMES` 고정 순회 → float 누적 순서 동일 |
| `it` truthiness | `{}` 빈 객체 truthy, null/undefined skip | `js_truthy` (빈 Dictionary/Array = true) |
| `it.affixes` | Array 순회, string 은 문자 순회, number/object 는 `.length` undefined → 0회 | 동일. `length` 키가 있는 object 는 **NOT_READY `unsupported_affixes_shape`** |
| `a` null | `a.id` TypeError, `_eqAffixCache` 는 부분 `{}` 로 잔존 | 해당 호출 `SOURCE_THROW`(value null), 이후 `READY_PARTIAL_AFTER_SOURCE_THROW` 로 부분값 반환 |
| `a.id` 키 | JS ToString: `7`/`7.0`→`"7"`, null→`"null"`, 부재→`"undefined"`, NaN/±Infinity | `js_property_key`. 문자열 id(원 카탈로그 id 전부)는 그대로. 숫자 id 는 \|v\| ≤ `JS_SAFE_INTEGER_MAX`=2^53−1 인 정수만 지원. 비정수 float, 그리고 2^53−1 을 넘는 int/float(예: `1e20`; Godot int64 는 2^63 에서 overflow)는 키를 날조하지 않고 rebuild 에서 **NOT_READY `unsupported_affix_id_shape`**, query 에서 **NOT_READY `unsupported_query_id_shape`** 를 반환한다 — 비정규 숫자 id 포맷 gap |
| `+a.value\|\|0` | ToNumber, NaN/0 → 0 | `js_to_number` (null→0, 부재→NaN, bool, string 은 `js_trim` 후 `""`→0, ASCII `[0-9]` 십진만 허용(비ASCII 숫자 → NaN), `0x`/`0b`/`0o`, `Infinity`, `[]`→0, `[x]`→x, 기타 object→NaN) |
| string trim | ECMAScript StringToNumber: WhiteSpace + LineTerminator | `js_trim`/`is_js_whitespace`: U+0009–000D, U+0020, U+00A0, U+1680, U+2000–200A, U+2028, U+2029, U+202F, U+205F, U+3000, U+FEFF. Godot `strip_edges()` 는 사용하지 않는다(집합이 다름) |
| Object.prototype 키 | `_eqAffixCache['constructor'/'toString'/'__proto__'…]` 는 상속 프로퍼티 때문에 함수 반환이나 문자열 연결이 일어난다 | **미지원 gap**(재현하지 않음 — Dictionary 의 일반 키로 취급). `shieldCdRed`/`parryBonus` 는 이 영향을 받지 않는다 |
| `(cache[k]\|\|0)` | 누적 중 NaN(예: Inf+−Inf) 이면 0 으로 리셋 | 동일 |
| `cache[id]\|\|0` 조회 | NaN/0/부재 → 0 | 동일, `origin` = `sum` / `absent_zero` |
| 중복 | 같은 item 내 동일 id 합, 같은 레코드가 두 슬롯이면 두 번 합 | 동일 |
| `sh()` | truthy shield identity, 아니면 매번 새 `{}` | `read_shield()` identity 보존, `fallback_empty` |
| `_legSP` | `(raw\|\|0)>0 ? raw : 1`, 곱셈에서 ToNumber (`"3"`→3, `true`→1, `[4]`→4) | `leg_shield_parry()` `value/applied/raw/raw_present` |

## 공개 API (subset)

| 메서드 | 반환 | 원 대응 |
|---|---|---|
| `configure_inventory_reader(reader: Callable) -> bool` / `configure(...)` | invalid Callable → false (기존 바인딩 유지) | — (reader = 현재 `INV` Dictionary 반환, ITEM `item_armor_element/producer.gd` 와 같은 shape) |
| `clear_inventory_reader()` / `is_configured()` | | — |
| `eq_affix(id) -> {status,id,value,origin,reason}` | READY 값 / NOT_READY value null | `_eqAffix(id)` |
| `rebuild_affix_cache() -> {status,reason,truthy_item_slots}` | | `_eqAffixRebuild()` |
| `invalidate_affix_cache()` | | `_eqAffixCache=null` |
| `ensure_affix_cache_built()` | | @51770 |
| `is_affix_cache_built()` / `affix_cache_snapshot()` | 진단(복사본) | — |
| `capture_affix_cache_token()` / `restore_affix_cache_token(tok)` | identity 보존 | `_inventoryEquipCP` |
| `read_shield() -> {status,shield,fallback_empty,reason}` | | `sh()` |
| `leg_shield_parry() -> {status,value,applied,raw,raw_present,shield_fallback_empty,legendary_special_declared}` | | `_legSP` |
| `read_combat_qe_subset() -> {status,provided,not_ready,still_missing,detail}` | 키 = SKILL `CombatQEStatsReader.MISSING_API` 이름 | — |
| `sync_combat_qe_player(player) -> {status,written,not_ready,still_missing}` | all-or-nothing | — |

### status

| status | 의미 | value |
|---|---|---|
| `READY` | 유효 INV.equipped 에서 원 식으로 계산 (빈 장비면 원 정의 0 / `_legSP` 1) | float |
| `NOT_READY` | `inventory_reader_unbound` / `inventory_null` / `inventory_not_dictionary` / `equipped_missing` / `equipped_not_dictionary` / `unsupported_*` | null |
| `SOURCE_THROW` | 원 rebuild 가 TypeError 로 중단된 호출 | null |
| `READY_PARTIAL_AFTER_SOURCE_THROW` | throw 후 원 부분 캐시 값 | float (sync 는 거부) |

## SKILL 연동 seam (combat_qe)

| SKILL 주입점 (`native_player_combat_qe.gd`) | 공급 | 소비 식 |
|---|---|---|
| `shield_cd_red` | `eq_affix("shieldCdRed").value` | `combat_qe_runtime._native_cd`: `int(30*(1+red))` = `~~(30*(1+shieldCdRed))` |
| `parry_bonus` | `eq_affix("parryBonus").value` | `producer.parry_proj_damage`: `int(base*parry_dmg_mul*(1+parry_bonus)*leg)` |
| `leg_shield_parry` | `leg_shield_parry().value` | 위 식의 `leg` |

원은 Q 입력 시점/패링 시점에 live 로 조회한다. ENGINE 은 `handle_q_press()` / `on_projectile_contact()` 호출 **직전에** `sync_combat_qe_player(player)` 를 호출해야 한다(sync 는 시점 스냅샷이며, 원 live 조회를 대신하지 않음). NOT_READY 면 아무것도 쓰지 않으며, SKILL `@export` 중립값은 제품값으로 승격되지 않는다.

**테스트에서 관찰하는 소비자 범위 (정정, 2026-10-14):** `native_player_combat_qe.gd` 는 `scripts/player.gd` 를 상속하고, `player.gd` 는 원 동결 PNG(`ki_slash_radiant_sheet.png`)를 static preload 한다. 상위 범위가 원 PNG 의 import/copy/hash 를 금지하므로 테스트는 이 파일을 preload 하지 않는다. 따라서 **NativePlayerQE 의 `handle_q_press()` / `on_projectile_contact()` 진입부는 이 테스트에서 관찰되지 않는다.** 대신 테스트는 아래 실 SKILL 코드를 직접 호출한다.
- Q: 실 `QEP.route_q` → 실 `QEP.make_shield_block_intent` → 실 `CombatQERuntime.enter_shield_block`
- 접촉: 실 `QEP.is_parry_window`/`QEP.resolve_contact` → 실 `CombatQERuntime._do_parry_native` (밑줄 접두 메서드지만 패링 성공 본문 그 자체)

대상은 테스트 안의 고정 constructor `QEPlayerFixture`(RefCounted)다. 이 fixture 는 Runtime 이 읽고 쓰는 field·메서드만 선언하고, 3개 주입점은 `null` 로 시작하며 `reader.sync_combat_qe_player()` 공개 API 로만 채워진다. `mana 100 / radius 15 / parry_scale 150 / parry_dmg_mul 1.0 / melee_ref 8 / stat_str 1 / p_atk_mul 1 / is_q_magic_parry_active true` 는 **명시적 기술 fixture 입력**이다(SKILL `@export` 기본과 같은 수치일 뿐, 제품값도 아니고 소스 provider readiness 도 아님). 전체 NativePlayer, GUI, native 입력, 8개 스탯 READY 는 주장하지 않는다.

## 미해결 gap (이 모듈 범위 밖)

| field / 소비처 | 원 | 상태 |
|---|---|---|
| `block_base` | `pGuardAbsorb()+pShieldBlock()` | 미제공 |
| `q_shield_mp_cost` | `P.mp` | 미제공 |
| `parry_dmg_mul` | `pParryDmg()` | 미제공 (테스트는 기술 fixture 입력 1.0, 제품값 아님) |
| `parry_scale` | `magicRef*statInt*pMagicMul` / `meleeRef*statStr*pAtkMul` | 미제공 (기술 fixture 입력 150) |
| NativePlayerQE 진입부 | `handle_q_press` / `on_projectile_contact` | 테스트 미관찰 (player.gd PNG static preload 회피) |
| `p_atk_mul` | `pAtkMul` | 미제공 |
| parryBonus 판정반경 | `_parryR`/`_parryRDet` @35480/35481 `~~(_eqAffix('parryBonus')*20/30)` | SKILL 미소비 |
| parryBonus 회복 | @39111 `_pbMul=1+_eqAffix('parryBonus')` | SKILL 미소비 |
| 나머지 어픽스 id | `_eqAffix(...)` 전체 소비처 | 리더는 임의 id 를 합산하지만 소비처 연동 0 |
| `_eqStat`/`_eqImplicit`/`applyStats` | @28627/@28653 | 범위 밖 |
| 무효화 호출 연결 | equip/unequip/recalcSt/리롤 | ENGINE/ITEM 연결 필요 (`invalidate_affix_cache`) |
| 실 INV 소유 | Main INV (save/restore 포함) | 미연결 — 테스트는 고정 constructor fixture + ITEM armor swap |

전체 Main INV 이식, 8개 스탯 전부 제공, 일반 이식 완료를 **주장하지 않는다**.

## 명시적 vs 자동 경로

| 구분 | 내용 |
|---|---|
| 명시적 native 메서드 | 위 표의 모든 API — 호출될 때만 INV 읽기/캐시 변경 |
| 자동 physics/process/render | 없음 (RefCounted, 노드/시그널/타이머 0) |
| 공개 play/성능 | 영향 0. 조회는 캐시 hit 시 O(1), rebuild 는 17슬롯 × affixes |

## 테스트 (`test_first.gd`) — 고유 9그룹 첫 PASS 이력

실행(executor): `godot --headless --path godot -s res://port_modules/equipment_affix_reader/test_first.gd [-- --only=g1,g2]`
종료코드 0=PASS, 1=FAIL, 2=INCOMPLETE(체크 0개 또는 알 수 없는 group). 의존 .gd(전부, asset preload 0):
1. `res://port_modules/equipment_affix_reader/producer.gd` (preload 0)
2. `res://port_modules/item_armor_element/equipment_armor_swap.gd` (`extends RefCounted`, preload 0)
3. `res://port_modules/combat_qe/combat_qe_runtime.gd` (`extends RefCounted`, preload → 4)
4. `res://port_modules/combat_qe/producer.gd` (`extends RefCounted`, preload 0)

`native_player_combat_qe.gd`/`scripts/player.gd` 는 preload 하지 않는다. 기존 테스트 preload 0. Callable target 과 fixture/runtime 은 `_keeper` 에 보관한다.

| group | 내용 | 결과 |
|---|---|---|
| `coercion` | `"0.25"`/공백/null/부재/true/`"abc"`/`[]`/`["0.5"]` 합 2.0, id `7`→`"7"`, 부재→`"undefined"`, null→`"null"`, Inf+−Inf→NaN 리셋 후 +2, `"0x10"`→16; NBSP/BOM/LS/PS/U+3000/U+1680/U+205F/U+202F/U+2000–200A/TAB/VT 로 감싼 `0.25`×4 = 1.0; Arabic-Indic `"٠.٢٥"`→NaN→0; query id `1e20` → NOT_READY `unsupported_query_id_shape`; affix id `1e20` → rebuild NOT_READY + 캐시 미구축 | PASS |
| `order` | 삽입순 boots,shield,weapon 이어도 `(0.1+0.2)+0.3` (≠0.6), 비슬롯 키 무시, ossuary/headband2 포함 | PASS |
| `duplicates` | 같은 item 내 중복 + 같은 레코드 ring1/ring2 = −0.5 | PASS |
| `empty_vs_notready` | unbound/INV null/equipped 부재 → NOT_READY (value null); `{equipped:{}}` → READY 0, `_legSP` 1; `{}` item truthy 카운트; invalid 재configure → false + 기존 바인딩/캐시 유지 | PASS |
| `cache` | 첫 조회 구축, `_inventoryEquipCP` 패턴 (stale → invalidate → preview → token 복원 identity), null affix → SOURCE_THROW → PARTIAL, subset NOT_READY | PASS |
| `shield` | `_lShieldParry` 2/`"3"`/0/−2/`"abc"`/true/`[4]`, identity, legendarySpecial만→1, shield null→fallback 1 | PASS |
| `item_equip` | 실 ITEM `equip_armor` → 무효화 전 stale 0.25 → invalidate 후 0.5/−0.125 → `unequip_armor` → 0.25/0 | PASS |
| `consumer_q` | subset: 공급 3개 + 정확한 missing 5개(`block_base,q_shield_mp_cost,parry_dmg_mul,parry_scale,p_atk_mul`); shieldCdRed `" -0.125﻿"`+`"　-0.125\u2028"` → sync(fixture) → 실 `route_q`/`make_shield_block_intent`/`Runtime.enter_shield_block` → mana 90, sBlock, `_sbParryT` 20, `shield_cd==22` (round 23 아님); 빈 장비 30; unbound sync 기록 0 + 주입점 null 유지 | PASS |
| `consumer_parry` | sync(fixture) → 실 Runtime sBlock → 실 `is_parry_window`/`resolve_contact` → 실 `Runtime._do_parry_native(1000)` → `parry_bank` 2250 (pb `" 0.25 "`+`"0.25"`=.5, leg 2; PHYSICAL·MAGIC 둘 다) / 1125 (legendarySpecial만) / 750 (빈 장비) | PASS |

## ENGINE 최종 sync 참고 — 관련 키워드 문서 경로 (grep 매치, 수정 0)

`_eqAffix|shieldCdRed|_lShieldParry|parryBonus|stats_reader|equipment_affix` 키워드, 마케팅 캡처 스튜디오 문서는 제외:

- `docs/engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md`
- `docs/engine/FDG_GODOT_PORT_ITEM_HP_POTION_USE_FIRST_20261013.md`
- `docs/engine/FDG_GODOT_PORT_SLAM_STORM_BLAST_FIRST_20261013.md`
- `docs/engine/FDG_GODOT_PORT_DETONATE_BLAST_FIRST_20261013.md`
- `docs/engine/FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md`
- `docs/7아이템디자인/아이템_어픽스_시스템.md` (parryBonus 무기 PRE, shieldCdRed 견갑 SUF −0.05…−0.30)
- `docs/7아이템디자인/exoduser-item-system-full.md`, `슬롯별_어픽스_풀.md`, `어픽스_시스템_현황분석_2026-08-10.md`, `어픽스_Layer_전수매핑_402_2026-08-10.md`, `어픽스_Layer_재분류_설계_2026-08-10.md`, `ON_CRIT_RECURSION_OBSERVATION_20260910.md`
- `docs/2_7 인벤토리+장비시스템/3파트_아이템분류.md`
- `docs/2_3 돌진+패링+방패시스템/2_3 돌진+패링+방패시스템.md` (**불변/읽기전용**)
- `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md`, `docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md`
- `docs/14밸런스+수치테이블/14밸런스+수치테이블.md`, `PARRY_RESOURCE_DOUBLE_20260912.md`
- `docs/2게임디자인레벨디자인/RESOURCE_PRACTICE_20260912.md`, `docs/미구현+구현예정.md`
- `docs/8.0몬스터디자인/탄막시스템_총정리.md`, `몬스터_공격시스템.md`, `몬스터_총관리.md`, `PHYSICAL_PROJECTILE_SCALE_REWARD_20260910.md`
- `docs/12퍼포먼스·최적화/shQuery_버퍼오염_가이드.md`, `docs/13출시·마케팅/SKILL_TRAILER_V25_DAMAGE_TEXT_20260910.md`


## 첫 실행 인수와 실제 작성/실행 구분

실제 Claude CLI 초기 작성 PID 87399, session `44151619-bc29-43d5-9659-7b3373a7ba19`, configured default `claude-opus-5-5`, 493697ms. 첫 실행 전 좁은 수정 PID 90001, 같은 session/model, 206520ms. 정적 동결 PNG preload가 필요했던 NativePlayerQE 검사 경로를 실제 CombatQERuntime 본문으로 바꿨고 ECMAScript trim·ASCII 숫자·안전하지 않은 numeric id 경계를 정확히 보충했다. 두 실제 호출은 restricted/dontAsk·Read/Glob/Grep 및 정확 신규 3경로 Write/Edit만, permission_denials 0, 모델/설정/권한 우회·Bash/MCP/GUI/Agent 실행 0이다.

Codex executor는 작성 전 exact 3경로 working/HEAD 부재·realparent/symlink를 읽기 전용으로 확인하고 외부 `backup-before-write.json`에 저장했다. 첫 수정 전 3파일 바이트도 외부 보존했다. 실행 fixture에는 신규 2스크립트와 readonly 기존 production 3스크립트(`equipment_armor_swap`, `combat_qe_runtime`, `combat_qe/producer`)만 복사했다. 원 PNG/완료자료 copy·hash·import/새이미지는 0이다. executor 제품/test 수정은 0이며 이 새doc 실행 receipt만 보충했다.

첫 headless 실행만: Godot 4.7.2.stable.official.ed1daf0bf, 0.574826167초, exit 0, stderr/SCRIPT ERROR/FAIL/INVALID/INCOMPLETE 0. 고유 9그룹 69checks 전부 PASS이며 성공/기존 suite/QE39 재실행 0, 전체 최종 반복 0이다.

| 그룹 | 첫 유효 checks | 결과 |
|---|---:|---|
| coercion | 11 | PASS |
| order | 3 | PASS |
| duplicates | 2 | PASS |
| empty_vs_notready | 11 | PASS |
| cache | 8 | PASS |
| shield | 10 | PASS |
| item_equip | 8 | PASS |
| consumer_q | 10 | PASS |
| consumer_parry | 6 | PASS |
| 고유 합계 | 69 | 9그룹 PASS |

실제 새 caller episode는 ITEM `equip_armor` 1 + `unequip_armor` 1, QEP route/intent → Runtime `enter_shield_block` 명시 6호출(consumer_q 2 + parry fixture 준비 4), 접촉 recipe → Runtime `_do_parry_native` 명시 4호출이다. BurstRing은 runtime source 생성자로 만들고 `_keeper`에 보관하지만 advance/렌더는 하지 않았다. native clock/update/process/physics/render/입력은 모듈에 없고 source tick 진전은 0이다. 실행 시간은 테스트 벽시계이며 FPS나 실제 플레이 근거가 아니다. 실제 Main INV 복원·NativePlayer 입력 entry·공개 전투·원화/시각/GPU/minimum240는 미검증이다. 기술 fixture의 150/1.0/100 등 다른 operands는 source provider로 승격하지 않았다.

전체 관련 docs 검색: `_eqAffix|_eqAffixCache|shieldCdRed|parryBonus|_lShieldParry|equipment_affix_reader|전설.*(방패|견갑)`. 정확 제외 `docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md`는 검색/접근하지 않았다. `keyword-doc-matches.json`에 신규 문서를 포함한 28경로(기존27)를 저장해 ENGINE에 인계한다. 기존 문서 수정 0, `2_3` immutable 유지다. 과거 현황분석의 15슬롯 설명과 현재 source `SLOT_NAMES` 17슬롯은 역사/현재값을 구분해 중앙 sync한다. source legendary 생성의 metadata-only 경로와 `_lShieldParry` raw 소비는 자동 배율2로 보완하지 않는다.

중앙은 원 equip/unequip/recalcSt/preview cache 무효화·capture/restore 및 실제 SKILL 소비 직전 3field sync를 단일 seam으로 연결해야 한다. 현재 모듈은 실 INV/current equipment Callable가 아직 연결되지 않은 상황을 NOT_READY로 구분하며 세 원 provider만 준비했다. 5개 미제공 stat 및 sinks/전체8ready는 여전히 별도다. 관련 common docs 현행 동기화와 normal code+docs checkpoint는 ENGINE에 인계하고 worker Git/shared/main/save/API/서버/배송artifact/보호 인간화면 입력 변이는 0이다.

외부 첫 proof/로그/백업/ledger/handoff 루트: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/equipment_affix_reader/`. 실행 이후 성공자료는 동결한다.

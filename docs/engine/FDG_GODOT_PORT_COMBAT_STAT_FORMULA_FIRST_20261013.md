> 2026-10-17 ENGINE 현행: callback **12/25·미13**. play_time은 el_mul 바로 다음에 동일 Services self의 arity0 Callable로 등록했다. owner 첫 격리 공개 API 검수는 인수됐으며 자연 clock·실게임 인수는 미확인이다. main/R 마지막 공통 소스는 D9이고 I 소유 브랜치는 별도다. V12 후보는 소스 인수·첫 FAIL·별도 보완 한정성공으로 구분하며 제품 copy·World hook은 수행하지 않았다. 아래 이전 단계 숫자·원검수 결과는 당시 이력으로 보존한다. 실제 local/remote commit 상태는 단위 receipt를 따른다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.

> **2026-10-15 현재 LMB 공격값 연결:** actual source provider의 현재 무기/강화/affix/baseAtk/STR·레벨/봉인/패시브 계산을 Main→Player→Crescent·기존 melee 피해 소비에 연결했다. 원0.7을7.0으로 바꾸지 않았다. [현재 계약·검수 한계](FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15).

| API / 범위 | 현재 계약 |
|---|---|
| Main.read_native_attack_parameters()(0) / Player.get_native_attack_parameters()(0) | fresh 현재 provider packet;미공급NR/요청비용 전 거부. 기본 원raw식과Ki meleeRef식을 구분한다. |
| Crescent.configure | 기존5인자,반환bool. current melee_ref×7×statStr1×current pAtkMul×스킬배율×차지배율,기존ToInt32. 일반타격은current pre×pAtkMul×pMeleeMul1+기존ST보너스. |
| 검수 / 남은 범위 | 4guard PASS+고정RNG 기대실패5→exact R VM oracle로교정한5PASS=9고유/첫전체clean아님. 실제공격packet→기존Enemy피해API소비;공간충돌·공개실전미증명. 속도/binds/held/SFX·전체피해/동적환경미완,latestfullfalse. |

## actualMain 소비 상태 — 2026-10-14

원 producer는 실제 SourceState/SourceResources와 providerbundle10에 연결된다. actualMain 첫고유5그룹145는 처음성공4/132+fixture SCRIPTERROR consumer만13수리재검한이력이며 원독립source 성공검사는재연하지않는다. 실제초기아이템15equip+10bag/currentrawGrit0·getter·원currentCRef/Formula/Affix를소비하지만 전체파생/applyStats/fullbootstrap/actualsave복원·투자·환불/화면·240FPS는아직미완이다. 최신중앙SSOT는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md다. 아래producer의원수치·과거검증이력은보존한다.

## ENGINE actual Main source resource construction - 2026-10-14

Main now constructs one SourcePlayerResources Node before its new Player enters the Tree. Original SOURCE_BOOT stays an unchanged input record (current=false/derived=false); the actual constructed actor ST/MST and owned MP/MMP/base rates are read through a distinct current getter. This is the pre-applyStats construction phase. Actual starter-item generation, STATS/PASSIVES/INV/grit/currentG and full source phases remain pending.

| Public API / data | Current contract |
|---|---|
| Main._ready | set_world -> initialize_new_run(original SourceParameters boot) before actor Tree entry -> World child holder -> Player Tree -> World.set_player -> actual source binding |
| Player.bind_native_source_resources | Same actual Player/World; single persistent bind; no existing actor reset |
| Player.get_native_source_resource_authority / get_native_source_resources_snapshot | Actual holder reference / independent snapshot plus persistent bound flag; provider loss returns NOT_READY without MP refill |
| World.bind_native_player_source_resources | Existing ready World player and its actual World child holder only |
| Boot versus current | Input SOURCE_BOOT current=false retained; actual constructed ST/MST200, MP/MMP160, stR.28/mpR0 are real owned values, lineage new_run/source_boot_initialization |
| Atomic sink | Both current before/caps validated first; source-shaped ST->MP single synchronous commit. Synthetic packet tests prove the actual sink contract, not a natural producer branch |
| FIRST new integration | Actual Main5 groups / 71 checks / FAIL0 / ERROR0 / exit0 / 5.919514916s; no prior7/170 or original producer suite replay |
| Derived/current/restore | Derived ST/MP base100 differs from boot200/160; original intermediate writes and restore provenance stay separate. New holder phase constructed_before_apply_stats, derived_ready=false/main_full_ready=false |
| Source Main scope | Supported6/unsupported10 preserved. Empty17slot reset is not final currentINV; original actual15 equipped +10 bag factory still needed. No fake currentG/PASSIVES/grit neutral readiness |
| Whole phase / visual | holy predicate -> holyflat -> MP/ST precompute -> HP -> ST/MP writes not yet installed. Public pixel/model/240 proof pending; VISUAL RETOUCH |

Exact API and first evidence: [Main source authority SSOT](FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md).

---

# FDG Godot Port — combat_stat_formula FIRST (2026-10-13)

TASK `GODOT-PORT-COMBAT-STAT-FORMULA-FIRST-20261013`. 소유 경로 3개만:

| 경로 | 역할 |
|---|---|
| `godot/port_modules/combat_stat_formula/producer.gd` | 원 패시브/장비 전투 배율 계산 provider |
| `godot/port_modules/combat_stat_formula/test_first.gd` | 첫 headless 테스트 (서로 다른 8 그룹, 130 checks, 누적 PASS; 실행 이력은 §6) |
| `docs/engine/FDG_GODOT_PORT_COMBAT_STAT_FORMULA_FIRST_20261013.md` | 이 문서 |

공유 모듈(World/Player/OPT/INV/P/G/passive/equipment/registry, combat_qe, equipment_affix_reader)과 공통 문서는 수정하지 않았다. 중앙 문서 반영은 ENGINE 몫이다.

## 1. 원 소스 입력 (canonical `game.html`, 읽기 전용)

| 원 함수 | 줄 | 식 |
|---|---|---|
| `SLOT_NAMES` | 15843 | weapon,shield,boots,armor,helmet,bow,gloves,pants,belt,necklace,ring1,ring2,cape,bracelet,headband,ossuary,headband2 |
| `_uEq(stat)` | 17034 | SLOT_NAMES 순서에서 처음 truthy인 `it[stat]`의 raw 값, 없으면 `0` |
| `PASSIVES` 시작값 | 28300 | 소스 시작 시 초기화 `let PASSIVES={};PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0)` → 26키 = 0 (mkP 함수가 대입하는 값이 아님) |
| `_eqImplicit(stat)` | 28653 | `it._implicitStat===stat`이면 `v+=(+it._implicitVal\|\|0)` |
| `statStr()` / `statInt()` | 28654 / 28656 | 상수 `1` |
| `_passDmgSum(type)` | 28664 | `s=0; s+=pAtk*.10+(P._altAtk\|\|0); s+=(pHuman\|\|0)*.05;` melee `+(pMelee\|\|0)*.15` / magic `+pMagic*.10+_eqAffix('magicDmg')+_eqImplicit('_iMagDmg')*.01`; `(1+s)*0.7` |
| `pAtkMul()` | 28678 | `_passDmgSum('melee')` |
| `pParryDmg()` | 28683 | `1+PASSIVES.pParry*.50` |
| `pParryProjDmg` scale / kiFloor | 28684 | `isQ ? magicRef()*statInt()*pMagicMul(false) : meleeRef()*statStr()*pAtkMul()` / `~~(meleeRef()*14*statStr()*pAtkMul())` |
| `pMagicMul(forAttack=true)` | 28687 | `_passDmgSum('magic')*(1+(_uEq('_uHelmMagic')\|\|0))*(forAttack?2:1)` |
| `pShieldBlock()` | 28700 | `0` (제거된 패시브 pShield의 원 상수이며, 대체값(fallback)이 아님) |
| `pGuardAbsorb()` | 28701 | `Math.min(.50,.30+PASSIVES.pGuard*.02+_eqAffix('shieldBlockDR'))` |
| `P._altAtk` 리셋 | 32230 / 63913 | `0` |

교차 확인한 문서: `docs/14밸런스+수치테이블/MAGIC_ATTACK_DAMAGE_20260910.md` L7·L14 (pMagicMul, Q패링 `pMagicMul(false)`)와 `BASIC_ATTACK_DAMAGE_20260910.md` L9 (`meleeRef×statStr×pAtkMul`). 둘 다 원 식과 같다.

## 2. 런타임 API (`producer.gd`)

| configure | 입력 (현재 원 상태, 스냅샷 금지) | 소유 |
|---|---|---|
| `configure_passives_reader(Callable)` | 원 `PASSIVES` Dictionary 참조 | ENGINE |
| `configure_player_reader(Callable)` | 원 `P` Dictionary (`_altAtk`만 읽음) | ENGINE |
| `configure_inventory_reader(Callable)` | 원 `INV` (`equipped`). ROOT affix reader와 **같은 INV**여야 함 | ENGINE |
| `configure_affix_reader(Object)` | ROOT `equipment_affix_reader/producer.gd` 인스턴스 | ROOT |
| `configure_ref_readers(melee, magic)` | 원 `meleeRef()` / `magicRef()` 현재 number | ENGINE |

| 계산 API | 원 |
|---|---|
| `pass_dmg_sum("melee"\|"magic")` | `_passDmgSum` (bow/xbow/dot/proj는 NOT_READY `type_not_ported`) |
| `p_atk_mul()` | `pAtkMul` |
| `p_parry_dmg()` | `pParryDmg` |
| `p_magic_mul(for_attack)` | `pMagicMul` |
| `p_shield_block()` | `pShieldBlock` = 0 |
| `p_guard_absorb()` | `pGuardAbsorb` (`uncapped` 진단값 포함) |
| `block_base()` | `pGuardAbsorb()+pShieldBlock()` |
| `parry_scale(is_q)` | pParryProjDmg scale |
| `ki_floor()` | `~~(meleeRef()*14*statStr()*pAtkMul())` |
| `u_eq(stat)` / `eq_implicit(stat)` | `_uEq` / `_eqImplicit` |
| `read_combat_qe_subset(is_q)` | `{provided, not_ready, still_missing, required_missing, all_required_ready, detail, root_subset}` |
| `js_to_int32(f)` (static) | JS `~~` |

결과 형식: `{status, value, non_finite, source, undefined_reads, reason}`. QE의 공유 field나 원 상태에는 쓰지 않는다. 이 모듈 자체 캐시도 없다. `_eqAffix` 캐시는 ROOT 소유이며, 무효화도 ROOT/ENGINE이 한다.

## 3. 준비 상태(readiness) 규칙

| 상황 | status / value |
|---|---|
| reader 미바인딩 | `NOT_READY` / null, `<label>_reader_unbound` |
| Callable 대상 해제 (약참조) | `NOT_READY` / null, `<label>_reader_target_freed` (label = `PASSIVES`/`P`/`INV`/`meleeRef`/`magicRef`) |
| PASSIVES / P / INV가 null이거나 `INV.equipped`가 undefined·null | `SOURCE_THROW` / null (원 TypeError 문구) |
| `||0`로 보호되지 않은 PASSIVES 키가 없음 (`pAtk`, `pMagic`, `pParry`, `pGuard`) | `READY` / NaN, `non_finite=true`, `undefined_reads` 기록 → subset `provided`에서 제외 |
| `||0`로 보호된 키가 없음 (`pHuman`, `pMelee`, `P._altAtk`, `_uEq`) | 원 기본값 0 (실제 컨테이너가 있을 때만) |
| ROOT `eq_affix`가 `SOURCE_THROW` / `READY_PARTIAL_AFTER_SOURCE_THROW` / `NOT_READY` | 같은 status로 전파하고 value null (partial 결과는 신뢰하지 않음) |
| string `_altAtk` / `_uHelmMagic` | JS `+` 문자열 연결을 재현한다. 정수가 아닌 number를 ToString해야 하면 `NOT_READY js_number_tostring_outside_port_range` |
| Array/Object 피연산자, Object 아이템, 비-number ref | `NOT_READY` (포트 미지원 shape) |

평가 순서는 원과 같다: PASSIVES → P → `_eqAffix` → `_eqImplicit` → `_uEq`, `pGuardAbsorb` → `pShieldBlock`, ref → 배율.

## 4. SKILL `CombatQEStatsReader.REQUIRED_STATS` 커버리지

| field | 공급원 | 상태 |
|---|---|---|
| shield_cd_red | ROOT `_eqAffix('shieldCdRed')` | subset이 병합 |
| block_base | 이 모듈 | 계산됨 |
| q_shield_mp_cost | — | **missing**: `P.mp-=10`, mana sink는 ENGINE/SKILL 몫 |
| parry_bonus | ROOT `_eqAffix('parryBonus')` | subset이 병합 |
| parry_dmg_mul | 이 모듈 `pParryDmg` | 계산됨 |
| leg_shield_parry | ROOT `sh()._lShieldParry` | subset이 병합 |
| parry_scale | 이 모듈 (Q/E는 호출 시 `is_q`로 구분) | 계산됨. ref reader가 필요함 |
| p_atk_mul | 이 모듈 `pAtkMul` | 계산됨 |
| (추가) ki_floor | 이 모듈 | 계산됨. 현재 `get_ki_floor()`는 @export 자리표시값(placeholder) 곱이다 |

`all_required_ready`는 항상 false다 (q_shield_mp_cost가 없음). 이 subset이 준비됐다고 해서 live 게임에 연결된 것은 아니다.

## 5. 남은 gap (ENGINE)

1. 원 PASSIVES / P / INV를 담은 실제 Dictionary reader를 바인딩해야 한다. 지금 native Player에는 PASSIVES와 `P._altAtk` 저장소가 없다.
2. 원 `meleeRef()` / `magicRef()` 본문(무기·투구 atk, enh, `_slotFlatAtk`, baseAtk, STATS, `_eqStat`, `_lvB`, `_weaponSeal`)을 담은 provider가 필요하다. 이 모듈은 재계산하지 않는다.
3. 원 isQ 호출부(Q/sBlock true, E false, `_sbPW` 분기)에서 패링마다 `read_combat_qe_subset(is_q)`를 호출하고 그 값을 소비해야 한다. 현재 `NativePlayerCombatQE`의 parry_scale 150, parry_dmg_mul 1, p_atk_mul 1은 @export 자리표시값이며 원값이 아니다.
4. NaN·non_finite 값을 원 의미대로 소비하는 경로가 없다 (`minf`/`int()`는 NaN을 원과 다르게 처리함). 그래서 subset에서 제외했다.
5. q_shield_mp_cost (mana)가 없다.
6. 이번 포트 범위 밖: `_passDmgSum`의 bow/proj/xbow/dot 분기, 정수가 아닌 number의 JS ToString.

## 6. 첫 테스트 (`test_first.gd`)

### 6.1 fixture 출처 구분

| 값 | 성격 |
|---|---|
| PASSIVES 26키 = 0 | 원 시작값 (`PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0)` @28300) |
| `P._altAtk = 0` | 원 리셋값 (@32230 / @63913) |
| `melee_ref = 150` / `magic_ref = 120` | **테스트 전용**으로 넣은 읽기 전용 ref provider 값. 실제 live Player에서 관측한 ref가 **아니다** |
| 장비·패시브 레벨·문자열 값 (group 2~7) | 테스트 전용 생성자. 원 공식의 분기와 형변환을 검증하기 위한 입력 |

런타임 계산은 중립 대체값(neutral fallback)을 쓰지 않는다. 다만 원 raw live ref(`meleeRef()`/`magicRef()`)와 전체 원 상태(PASSIVES/P/INV) 바인딩, mana(`q_shield_mp_cost`) 준비는 **아직 ENGINE에 남아 있다** (§5).

이 모듈은 **독립 provider로만 만들어졌고, 공유 런타임에는 아직 연결되지 않았다**. 8개 field 전부 준비됨이나 QE live 승격을 주장하지 않는다. 별도로 proofdir `canonical-formula-oracle.json`(원 함수 6개를 추출한 pure-function Node oracle, 고정 source-value view 6개)이 있다. 이것은 별도의 원 소스 참조다. native 테스트는 그 파일을 읽지 않고 oracle 6개 case를 전부 소비하지도 않으므로, **자동화된 완전 parity라고 부르지 않는다**. native 테스트의 oracle은 test_first.gd 안에 원 식을 리터럴로 다시 쓴 것뿐이다.

**참조 유지**: 테스트는 reader 대상(Fixture), formula 인스턴스, ROOT reader를 강하게 보관한다 (Callable은 약참조). 두 reader가 같은 INV를 읽어도 그 스냅샷이 원 상태를 대표하지는 않는다.

**준비 상태**: API와 readiness는 부분적이다. ENGINE에 남은 정확한 missing 항목은 현재 전체 원 상태(PASSIVES/P/INV) 바인딩, `magicRef()`/`meleeRef()`, mana(`q_shield_mp_cost`), 원 isQ 호출부 wiring이다.

**공유 문서**: 이 doc의 keyword/path 목록을 공유 문서에 반영하는 일은 ENGINE 몫이다. `docs/2_3` 불변 설계 문서와 제외된 마케팅 파일(`docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md`, `tools/marketing_capture_studio_20261009.*`)은 건드리지 않았다.

### 6.2 실행 이력

| 회차 | 범위 | 결과 |
|---|---|---|
| 1차 (Codex 격리 실행) | 7 그룹, 116 checks | 6 그룹 **PASS** (91 checks): source_default_mkp 18, passive_equipment_values 11, u_eq_slot_order 6, source_undefined_throw 19, js_coercion 11, qe_runtime_consumption 26. script/예상 밖 에러 0. **주의**: Codex는 최초 세션이 문서를 쓰는 도중에 test/product를 복사했다. 그래서 1차 실행 대상은 `js_to_int32`가 이전 trunc 식 `f - fmod(f, 1.0)`을 쓰던 제품 코드다 (§6.4) |
| 1차 | readiness_missing (25 checks) | **FAIL 1건**: `freed.pParryDmg.reason`의 실제 값은 `PASSIVES_reader_target_freed`, 기대값은 `passives_reader_target_freed`. 제품 label(`PASSIVES`)이 맞고 fixture 기대값 대소문자 오타였다 |
| 수정 | 기대 문자열만 `PASSIVES_reader_target_freed`로 변경 | 제품 코드와 API는 바꾸지 않음 |
| 재실행 (Codex) | `--only=readiness_missing`만 | **PASS**: 25 checks, completed=true, 실패 0, exit 0, SCRIPT ERROR/예상 밖 에러 0. 이미 통과한 6 그룹(91)은 다시 돌리지 않음 |
| **이전 누적** | 서로 다른 7 그룹, 116 checks | 처음 6 그룹 PASS(91) + readiness_missing FAIL(25 중 1 assert) → fixture 기대값 대소문자만 수정 → 25/25 PASS. 7 그룹 전체 최종 재실행 0, 기존 QE39/affix/locale13/atlas9 테스트 실행 0. **정정**: 앞서 "기간 전체 제품 수정 0"이라고 썼는데 틀렸다. 실패 fixture 때문에 고친 제품 수정은 0이지만, 최초 세션 후반에 스스로 다듬은 제품 수정 1줄이 있었다 (§6.4) |
| 추가 그룹 1차 (Codex) | `--only=final_int32_boundaries`만, 14 checks | completed=true, **FAIL 2건** (12 PASS). 실패 원인은 fixture 생성자의 리터럴 정밀도이며 원 소스나 제품 문제가 아니다. GDScript 로더가 소수 리터럴 `9007199254740991.0`을 `9007199254740990.0`으로 읽었다 → int32_boundary_8은 기대 −1에 실제 −2, int32_boundary_9(`-9007199254740991.0` → `-9007199254740990.0`)는 기대 1에 실제 2. 원 Node oracle 입력은 정확히 ±`Number.MAX_SAFE_INTEGER`이다 |
| 수정 | 실패한 두 행만 부호 있는 INT64 리터럴 `9007199254740991` / `-9007199254740991`로 변경 (`.0` 제거). 기존 `var input: float = rows[i][0]`가 이 정확한 int64 값을 생성자에서 double로 변환한다 | 기대값, 나머지 12 case, 이전 7 그룹 본문, 제품은 바꾸지 않음. check 추가 0 |
| 추가 그룹 재실행 (Codex) | `--only=final_int32_boundaries`만, 14 checks | **PASS**: 14 checks, completed=true, 실패 0, exit 0, SCRIPT ERROR/예상 밖 에러 0. 이전 7 그룹, QE39/affix/locale/atlas 테스트, 전체 suite는 다시 돌리지 않음 |
| **최종 누적** | 서로 다른 8 그룹, 130 checks | 이전 7 그룹/116 + 새 그룹 1/14. 새 경계 그룹 1차 FAIL 2건은 ±`9007199254740991.0` 리터럴이 ±`9007199254740990`으로 읽힌 탓이었다. fixture 입력 두 행만 int64 리터럴로 고쳐 정확한 int64가 double로 변환되게 했고, 같은 그룹 14/14 PASS. 제품은 floorf/ceilf로 동결. 최초 세션 후반의 1줄 자체 수정(`f - fmod` → floor/ceil)은 §6.4에 기록. 실행되지 않은 QE assert는 제거했고 1차에서 검증된 QE 그룹 본문을 그대로 복원했으며, 그 그룹은 다시 돌리지 않음. 8 그룹 전체 최종 실행 0, 기존 QE39/ROOT affix/locale13/atlas9 재실행 0. asset/font/import, physics/process/render, timer 전진, Git, 공유 파일, live 입력, GPU/공개 proof 모두 0 |

**oracle 대응**: 새 JS ToInt32 연산자 벡터 14개(`canonical-int32-oracle-first.json`)는 생성자를 고친 뒤 native 경계 그룹의 14개 값과 하나씩 대응한다. 이것은 headless 의미 검증일 뿐이며 FPS나 성능에 관한 주장은 하지 않는다. 기존 pure-formula JS oracle 6개(`canonical-formula-oracle.json`)는 별도 참조로 남아 있고, native 테스트가 그 case 전부와 비교하지는 않는다.

**변경 없음**: 원 공식 5개와 거기서 파생한 subset API, 원 입력 바인딩, mana, ENGINE 호출부 상태는 §2~§5 그대로다. 테스트는 reader 대상(Fixture)과 formula 인스턴스, 실제 ROOT reader 객체를 강하게 보관한다.

**공유 문서**: 허용된 공유 문서 36개 경로에 keyword를 반영하는 일과 코드·문서 checkpoint는 ENGINE이 중앙에서 한다. `docs/2_3` 불변 설계 문서와 제외된 마케팅 파일은 바꾸지 않았다.

작성 세션: Claude CLI session `8480b960-e861-42d1-abbf-e7e30ad17ec6`. PID 89001(최초 작성), 92397(fixture 1차 수정), 93030(문서), 93604(새 경계 그룹·테스트 복원), 94311(int64 fixture). 이 최종 문서를 쓴 PID는 외부 metadata에 기록된다. 모두 기본 설정 모델 `claude-opus-5-5`, model override 0, 제한된 경로, dontAsk, write 거부 0. 의미 실행자(Codex)는 별도 프로세스다.
테스트 범위: physics/process/render, timer 전진, asset/font 복사·hash·import, live 입력, GPU/공개 proof 모두 0.

### 6.3 그룹

실행 명령: `godot --headless --path godot --script res://port_modules/combat_stat_formula/test_first.gd -- [--only=a,b] [--json-output=/abs.json]`

| 그룹 | 내용 |
|---|---|
| source_default_mkp | 원 시작값(PASSIVES=0, `_altAtk`=0, 장비 없음) + 테스트 전용 ref 150/120: pAtkMul .7, pMagicMul 1.4/.7, pGuardAbsorb .30, kiFloor, subset, 원 상태 변이 없음 |
| passive_equipment_values | 패시브·어픽스·implicit·`_uHelmMagic` 실제 값, 상한 .50, 현재 값 live 재읽기 |
| u_eq_slot_order | 삽입 순서가 아닌 SLOT_NAMES 순서, falsy/primitive 건너뛰기, 없으면 0 |
| readiness_missing | 미바인딩·대상 해제·ref shape → NOT_READY + null |
| source_undefined_throw | undefined → NaN, `\|\|0` 기본값, null 컨테이너 → SOURCE_THROW, ROOT throw/partial 전파 |
| js_coercion | 문자열 연결(`"100200"*0.7`), ToString 범위 밖이면 NOT_READY, bool/string 곱, ToInt32 |
| qe_runtime_consumption | 계산값을 `CombatQERuntime.shield_reduce_damage` (패링 실패·dot 조합 3가지), `QEProducer.parry_proj_damage` (kiFloor·calc 분기, Q/E), `_native_cd`에 넣어, 테스트 안에 리터럴로 쓴 원 식 oracle과 일치하는지 확인 |
| final_int32_boundaries | 최종 `Formula.js_to_int32` (원 JS `~~`, pParryProjDmg `_calc`/`_kiFloor`)의 경계값 14개. 기대값은 proofdir `canonical-int32-oracle-first.json`의 JS 실제 결과: ±.9999, ±4294967296.75, 2147483647.9, −2147483648.9, ±4294967295.5, ±9007199254740991, ±9007199254740992, ±Infinity. 기존 js_coercion 그룹의 2147483648.5/−3.7/NaN과 겹치지 않음 |

PASS 조건: 선택한 그룹이 모두 끝까지 실행되고(completed), 그룹마다 check가 1개 이상이며, 실패가 0개. 알 수 없는 그룹이나 인자가 있으면 FAIL. 마지막 줄은 `COMBAT_STAT_FORMULA_FIRST RESULT PASS|FAIL`. 현재 상태는 §6.2를 따른다.

### 6.4 최초 세션 후반의 자체 수정과 정정

최초 세션(PID 89001)은 test/product를 쓰고 나서 문서를 쓰던 중에 두 가지를 직접 수정했다. Codex의 1차 복사는 이 두 수정보다 **앞선** 상태였다.

| 대상 | 내용 | 처리 |
|---|---|---|
| `producer.gd` `js_to_int32` (1줄) | trunc 식을 `f - fmod(f, 1.0)`에서 `floorf(f) if f >= 0.0 else ceilf(f)`로 바꿈. fixture 실패 때문에 고친 것이 아니라 스스로 다듬은 것 | **현재 floorf/ceilf 식으로 동결**. 수치·공식 변경 없음. 1차 7/116은 이전 식을 검증한 결과다. 최종 식은 새 그룹 `final_int32_boundaries` (14 checks)로만 검증한다. 1차는 FAIL 2건이었고 원인은 fixture 리터럴 정밀도였다(§6.2). 두 행을 고친 뒤 재실행에서 14/14 PASS |
| `test_first.gd` qe_runtime_consumption | 1차 실행 뒤에 `floor_won`/`calc_won` 변수와 assert 2개를 추가했다. 이 assert는 한 번도 실행되지 않았음 | **제거**. 1차에서 검증된 원래 assert `parry.calc_branch_reached` (`js_to_int32(5000.0*(1.0+1.0)*0.5*p_parry*1.3*2.0) > kf`)로 되돌렸다. 다른 그룹 본문은 바꾸지 않음. 대문자 `PASSIVES` label과 `selected.assign` 러너는 유지 |

**검증 범위의 한계**: 현재 제품은 7 그룹 전체를 다시 돌려 검증한 것이 아니다. 또한 현재 제품이 1차 스냅샷과 같다고 주장하지 않는다. 원래 Node oracle 6개는 다시 돌리지 않았다. native/headless 테스트의 원 입력은 여전히 fixture뿐이다. 원 ref, mana, 호출부 wiring이 ENGINE에 남아 있다는 점(§5)도 그대로다.


## 원본 stat_str 공개 연결 — 2026-10-17

| 항목 | 현행 코드와 범위 |
|---|---|
| formula / Services | 기존 STAT_STR=1.0 → 새 stat_str()->Dictionary → read_normal_enemy_strength_multiplier()->Dictionary. 인자 각각0. 원본 _ok의 READY/value(float)/non_finite/source/undefined_reads/reason을 그대로 전달한다. |
| 소유권 / 실패 | 실제 current Main/Services/Providers 검사 전후 및 formula 객체·Script·수명 동일성 검사. 소유권 실패는 NOT_READY/provider=stat_str, query 후에는 read_result 보존. 부재 numeric value/default 0·1 추가 없음. |
| callback 등록 | 기존 6개 뒤 stat_str. 현행 7/25·미18. getter는 formula/current P/domain을 eager query하지 않는다. 기존 여섯 callback·25 presence·원 query 순서 변경 없음. |
| 새 검사 / 제한 | 실제 formula script/새 reader와 정확 추출 Services graph + 명시적 holder stand-in의 첫 신규25/25 PASS, exit0·오류/leak0. full Main 자연 configure·실제 gameplay 미검증, 기존 성공 검사 재실행0. |
| 다음 연결 | 현 V5 stat_str 세 scalar 위치는 typed 미지원이라 실제 바인딩0. 기존 ENEMY V6의 세 위치 typed 처리·인수 후 실제 caller를 연결해야 한다. latest_full_game=false 유지. |

상세 API·raw 예·실패 이유·검수 한계는 [stat_str 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md)을 따른다. 기존 State player_view/read_current_p 및 다른 수치·계산식·저장 계약은 변경하지 않았다.


## p_dot_pool 실제 소유자 추가 — 2026-10-17

| 항목 | 현행 소스 계약 |
|---|---|
| 원식 / API | Formula.p_dot_pool()->Dictionary(0): 기존 _container PASSIVES → 1+_passive_or0_mul(actualDict,"pDot",0.05) → 기존 _ok/_fail. 원 pDotPool @game.html:28068. 숫자·식·전역 상태 변경 없음. |
| binding 공개 검사 | Formula.is_passives_reader_bound_to(expected:Callable)->bool, Passives.is_current_passives_reader_bound_to(expected:Callable)->bool. 기존 bound/valid/Callable target·method/equality만 검사하여 추가 domain 조회·저장0. |
| 실제 bridge | Services.read_normal_enemy_dot_pool_multiplier()->Dictionary(0), 기존7 뒤 p_dot_pool. current Main/Services/Providers→같은 Formula/Passives/current_passives Callable/Script·binding을 전후 검사. Formula 1query, 정상 raw 같은 참조·원 status/metadata 유지. |
| 값 / 실패 | 유효Dict 필드 absent/null/falsy/NaN은 원 truthiness로1.0; owner 유실은1/{} 제조0. 기존 bound null→SOURCE_THROW 및 status 손실 경로 불변. invalid String/Infinity의 non_finite 보존; custom Object·전체 문자 grammar는 기존 부분 도메인 한계. context/객체·Script·binding post loss는 top NOT_READY/read_result 원 raw/최상위 numeric value0. |
| 현행 / 검수 | map8/25·미17, 25 presence 불변. 첫 신규 행동76/76+setup37/37 PASS/exit0/양로그 오류·leak0. 실제 Formula/Passives binding·정확 Services +명시 holder/current-reader stand-in 범위, 전체 State/Main·자연 수명·실전 미검증. setup bind query1/runtime query1과 실제 rawgrit/resource 부수조회未검증을 구분한다. |
| 다음 | V6 p_dot_pool scalar 전체4곳(170/173/566/570) typed 미지원·직결0. 첫 접점은170/173이다. 별도 consumer 인수 전 실제 kernel 등록/full25/full hurtE/latest 게임 완료0. |

상세는 [p_dot_pool 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 State/Providers getter 및 Q/E·저장·이전 승인 byte와 source sync 이력을 보존한다.


2026-10-17 사용처 정정: V6 p_dot_pool 전체는4곳(170/173/566/570, 원42163/42164/42426/42429)이며 첫 접점만170/173이다. 모두 not DOT이고, 뒤 두 곳은 각각 poisonDot/fireDot 어픽스값>0 및 해당 스택 write 후 결과<10에서 독립 조회한다. 각 지점 당시의 dmg×0.10 누적식·원 순서·lazy를 보존하며 네 곳 모두 typed 미전파다. [네 곳의 정확 조건](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 API/코드·이전 PASS는 변경하지 않는다.


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.


## 2026-10-17 ENGINE WIP: typed rand 실제 소유 경계

| 항목 | 현행 코드/한계 |
|---|---|
| actual registry | 현행 ENGINE WIP10/25·미15. 기존9 뒤 rand=Callable(self,read_normal_enemy_random_unit) 인자0을 등록했다. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.


## 2026-10-17 ENGINE WIP: rand 10번째 실제 등록

| 항목 | 현재 상태 |
|---|---|
| registry | eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. 실제10/25·미15. |
| callback | 같은 Services self의 read_normal_enemy_random_unit()->Dictionary 인자0. purpose/line은인자가아니며기존Main공개getter의forwarding을재사용한다. |
| 변경 경계 | Services map literal1개만추가. 기존9/helper/owner/sharedsampler/수식/primitive/Main/World본문은그대로다. |
| 새 검수 | 등록delta static7/7, runtime0. 키10/기존9순서·sameSelf/method·0arg·typedWorld route·다른Services bytes보존·생성시추가reader/RNG/domainquery0 확인. 기존readinessguard 전체query0은미입증이다. |
| 보존/한계 | 기존30/41/95·진단/통과parse재연0. main/R·실게임·producer/V9제품copy·scalarDict직결·ENEMY TASK·Worldhook·dummy25우회0. 이전실패/범위초과이력도그대로다. |


## 2026-10-17 normal hurtE el_mul typed owner (owner WIP 당시 기록; 현재 registry11은 후속 등록 표 참조)

| id / 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 소유 / 필드2 | Main._native_source_elements:Variant의 실제 mutable Dictionary1개, 초기값 P0/F1/I2/D3/L4/H5/E6. _native_source_elements_owner_script:WeakRef는 생성시 actual get_script() 증거1개. 초기화 marker·late bind·query-time 생성·loss 재capture/재생성0. |
| 수명 | 같은 Main에서 actor/State/Services/Formula 교체는 같은 EL identity. 새 Main은 별도 object라는 exact field holder 검증 대상. 원JS 선언/TDZ와 Main 생성·weak 구성 시점은 다르며 원current EL property 불변/자연Main 수명 동등 증거가 아니다. |
| API / 인자2 | Formula.el_mul(a:Variant,d:Variant)->Dictionary, Services.read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary. Main.read_native_source_element_multiplier(a,d,formula,services,state,providers)->Dictionary가 실제 소유자다. |
| 원 순서 / 2.0 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 순서. 각 if의 첫 actual own-member를 읽고 a와 strict 비교가 참일 때만 둘째를 읽는다. 반복 key도 재조회하며 eager7 snapshot/고정쌍 lookup0. |
| 원 꼬리 / 0.5 / 1.0 | 모든 pair 실패 뒤 a===d일 때만 actual EL.P를 읽는다. P와 strict 다르면0.5, 그 밖 정상 완료1.0. owner loss·오류·지원밖에1/0 fallback하지 않는다. |
| 부분 strict 지원 | bool/String/null(JS null만), safe integer int [-9007199254740991,9007199254740991], 모든 float(NaN/±Infinity/±0 포함). int/float는 Number 관계, bool≠number, NaN!==NaN. safe-int는 JS 표현 지원경계이며 게임 수치 cap이 아니다. cast/clamp/전역 finite guard0. |
| 지원밖 | huge int/StringName/undefined 미확정 carrier/Array/Dictionary/Object reference 등은 raw type·a/d reference를 보존한 NOT_READY, top-level value 없음. structural equality/자동 int0·String 변환0. missing/inherited/getter/prototype EL 지원은 미완. |
| guard / 실제 객체 | pre/post weak current identities·actual Script resources·같은 live Tree/World 및 State/Resources parent/current role·claim metadata. Main actual Script는 witness WeakRef와 is_same. 동기 no-await/no-event-pump이며 기존 bind3/legacy preTree 경로는 변경하지 않는다. |
| 진단 / 실패 prefix | 실제 방문 key/presence/raw value·type만 EL_reads에 쌓는다. 전체 EL map getter0. postloss는 원 owner packet을 수정/삭제/clone하지 않고 새 NOT_READY.read_result에 동일 reference로 보존한다. retry/rollback/refund0. has/key 접근 전체 횟수는 별도 계측되지 않으면 static 범위다. |
| owner WIP 당시 등록 / 소비 | 당시 실제 callback map10 / 미등록15. 현재11/미14는 후속 등록 표를 따른다. el_mul 등록11·V11·World hook·다른 consumer·scalar default0 소비0. 기존 방어구 scalar adapter와 별개의 typed API이며 그 adapter/원 game.html 수식은 변경0. |
| 검수 | 원 첫 영향 fixture와 source boundary static은 아래의 별도 기록으로 보존한다. 실행별 증거를 아래 표로 구분한다. 원 첫 실행 wholefalse는 보존하며, 승인된 입력 구성 수정 후 실패 행과 당시 미실행 경계만 새25case/74check+setup4에서 통과했다. 단일 전체 재실행 PASS가 아니며 제품 코드 수정/원기대 완화/기통과45 재연은 없다. 현재 완료는 명시 holder의 typed owner 부분 검증까지다. full Main/원JS realm/full25/fullhurtE/최신 실행 게임/PC 완료는 미확인. |


### 실행별 검증 기록과 현재 WIP 범위

| 실행 / 실제 범위 | 결과 / 해석 한계 |
|---|---|
| 원 source boundary static | 14/14. 코드 추가·기존 bind3/guard/getter/원9+rand/등록 순서 보존을 확인한 정적 경계다. 이번 마감에서 재실행하지 않는다. 전제품 compile 증거가 아니다. |
| 원 첫 owner 실행 | 23case/46check 중45true/1false, exit1, wholefalse 보존. 앞22case45true는 당시 증거이며 재연0. safe_int_mixed_float 원literal9007199254740991.0/기대0.5는 원파일 그대로다. 당시 진단 문자열 a=9007199254740991,d=9007199254740990.0만으로 원당시 binary값을 소급하지 않는다. |
| 별도 숫자 primitive 진단 | 8측정, Variant8/typed7 비교, exit0. 이 Godot4.7.2 새runner의 Array/typed float literal은433ffffffffffffe, int→float/정확bit control은433fffffffffffff. 같은 represented control값은 혼합비교true. 이 범위 literal형성 discrepancy이며 내부parser 원인·전Godot 정확성·원첫실행 bits의 소급 증거가 아니다. 제품 cast/coercion 변경0. |
| 새 입력 구성 수정 + 첫 미실행 경계 | 새25case/74uniquecheck 전true, 별도 setup4true, exit0. d=float(9007199254740991)만 QA에서 구성하고 a/기대0.5/conditionalP/assertion loop는 그대로다. 입력 타입·정수문자열·정확IEEE64ff를 ownerquery 전에 확인했다. 원45통과 재연0, split실행들을 단일 whole-run PASS로 합산하지 않는다. |
| 새 실행의 실제 한계 | same frozen 추출 newfield/method와 명시 metadata holder 대역. 두독립 holder의 EL별도객체/actualScript WeakRef field witness, 같은Main role교체 ELidentity, lazy/repeatedmember/rawargs/rawresult/postloss prefix를 해당대역 범위로 검증했다. 실제 Main/StateResources 자연configure·Script교체 자연수명·JSboot/current원EL·실게임 actor재개 증거는 아니다. 방문 진단외 Dictionary.has/key 전체횟수는 계측하지 않았다. |
| 현재 source contract | Main actual mutable EL1 + ScriptWeakRef1의 fields2. Formula.el_mul(a,d)와 Services.read_normal_enemy_element_multiplier(a,d)는 typed Dictionary/인자2. pre/post metadata guard·actual Script identity·동기 동일EL object, 원8pair/lazyP/normal2·0.5·1·NR rawref 계약은 위 표 그대로다. 신규 EL writer/marker/latebind/재capture/재생성/전역eq변경0. |
| owner WIP 당시 연결·미완 | 당시 actual callback10/미등록15·EL미등록 기록이다. 현재11/미14는 후속 등록 표를 따른다. 등록11/V11/Worldhook/15dummy/25presence 우회0. 기존9callback 각 부분지원 한계를 승격하지 않는다. full25/fullhurtE/자연runtime/최신 실행 게임/PC 완료는 미완이다. |
| 기록 보존 | 원firstfailure·pre-generation separator guard실패/실UTC未·새helper 위치교정·CRLF정규화 위반/승인prefix복원·source_* initializer metadata 범위초과 이력을 보존한다. 과거에 무접근·append-only·wholeclean이었다고 소급하지 않는다. |
| 문서 검색 범위 | 이전 uncapped928후보/100matchinglines41paths는 matching-line 단위(한줄내keyword dedup)이며 after-scan은append/newownerdoc 작성 전이다. regex전체횟수/성공decode파일수/UnicodeDecodeError 경로는未기록. 이번에는 허용18문서의 현재상태만 새경계1회로 확인하며 전수완결을 발명하지 않는다. |


상세: docs/engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md. 과거 단계의 완료/실패 기록은 해당 당시 범위로 보존한다.


## 2026-10-17 현재 normal hurtE el_mul 11번째 provider 등록

| id / 현재 계약 | 구현 상태와 범위 |
|---|---|
| registry / 현재 | Services.get_normal_enemy_damage_provider_callbacks의 기존 rand 다음에 "el_mul": Callable(self, "read_normal_enemy_element_multiplier") 한 entry를 추가했다. 실제 literal 등록11 / required25 중 미등록14. 과거10/미15·EL미등록 표는 해당 당시 단계 이력이며 현재값은 이 표다. |
| 원10 순서 | eq_affix, u_eq, p_atk_mul, melee_ref, parry_lesson_active, player_view, stat_str, p_dot_pool, l_eq, rand를 그대로 두고 마지막 el_mul만 추가. 기존 entry·getter guard·reader/Formula/Main 몸체와 반환·기존9+rand 부분지원 한계는 변경0. |
| self / 인자2 | 새 Callable은 동일 Services self와 read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary를 연결한다. Formula.el_mul(a:Variant,d:Variant)->Dictionary, Main 실제소유자 연결의 a,d 인자2와 raw type/reference는 그대로다. |
| 생성 / query 경계 | 새 literal Callable 생성은 reader/Formula/Main/domain/RNG를 호출하지 않는다. 기존 getmap membership/readiness guard 자체가 부수조회0이라는 주장은 하지 않는다. 새등록 확인은 정적경계1회/runtime0이며 Scriptload/QA/parse 재연0. |
| 실제 owner / fields2 | Main actual mutable EL Dictionary1 + actual Script witness WeakRef1. 초기 EL P0/F1/I2/D3/L4/H5/E6. query의 current Script는 witness actual object와 is_same; query-time 생성/재capture/ownerloss재생성·marker/latebind/Formula ELcache·map copy/publisher0. |
| 원 if / lazy 순서 | F→I,I→F,D→L,L→D,D→H,H→D,E→L,L→E 순서의 실제 EL member 조회. 첫 비교가 참일 때만 둘째를 읽고 반복 key는 재조회. 마지막 a===d일 때만 P; 정상완료2/0.5/1, eager7 snapshot/fixedpair lookup·실패1/0 fallback0. |
| 부분 strict 지원 | bool/String/null(JSnull만), safe integer native int [-9007199254740991,9007199254740991] 및 float NaN/Infinity/±0, mixed Number 관계. bool≠number/NaN!==NaN, StringName 자동String0. safe-int는 JS표현 지원경계이고 게임수치 cap이 아니다. product cast/clamp/전역finite/globaleq수정0. |
| 미지원 / raw failure | hugeint/StringName/미확정 undefined carrier/ArrayDictObject reference와 missing/inherited/getter/prototype EL 범위는 typed NOT_READY/raw type·args·실방문prefix·reference 보존/topvalue 없음. postloss fresh NR.read_result는 원ownerpacket을 수정·삭제·clone하지 않고 같은ref로 보존. retry/rollback/refund0. |
| 수명·수행 한계 | 같은Main role교체의 동일EL/newholder 별도EL·Scriptwitness/후손Tree경계/rawref는 명시holder 범위 검증이다. 원JS 선언/TDZ·Main 생성/weak구성 시점·current원EL property권위·불변/실StateResources 자연수명과 동등이라고 주장하지 않는다. legacy preTree/기존guard/getter코드 불변. |
| 소비·통합 미완 | registered11은 실제 typed consumer V11 연결이나 World fullhook 완료가 아니다. ENEMY V11 source/QA·Worldhook·미14 dummy·required25 gate 우회0. 원scalar float/default0로 Dictionary를 소비하도록 바꾸지 않았다. full25/fullhurtE·최신 실행게임/PC·전체 진행률/밸런스 완성은 미완이다. |
| 원 source 정적경계 | 원14/14는 당시 source 보존 정적검사이며 재실행0. 이후 owner WIP docs8/8도 별도 당시 문서경계로 보존. 이번에는 새 literal11/원10순서/타몸체/MainFormula불변/arity2/self·생성query0만 새정적1회/runtime0. |
| 원 first failure | 원23case/46check=45true1false/exit1/wholefalse·원decimal literal/기대0.5는 보존. 앞22case45true는 당시 증거, 재연0. 당시 formatted diagnostic을 실제floatbits로 소급하지 않는다. |
| 별도 numeric 진단 | 새숫자8측정·Variant8/typed7비교/exit0에서 이 실행의 float literal433ffffffffffffe와 converted/bitcontrol433fffffffffffff를 구별했다. 같은 represented값 비교true이며 내부parser 원인/전Godot 정확성·원실패당시bits 소급증명0. |
| 새 입력 수정·첫 미실행 경계 | 승인된 QA 입력 d=float(9007199254740991)만 별도구성, a/기대0.5/Ptrue/assertionloop 불변. 새25case74true/setup4true/exit0는 그 명시holder 범위이며 원45 재연0·서로다른 실행을 단일 wholePASS로 합산0. 제품코드수리나 지원정책변경이 아니다. |
| 역사·보호 | 원firstfailure·CRLF정규화 위반/승인prefix복원·source_* initializer 범위초과·pre-generation separator guard/UTC未 이력은 보존. 과거 무접근/wholeclean 소급0. 보호2_3/marketing/capture·MAP/ART/rig·원game.html 변경0. |
| 검색 metadata | 이번 새영향 scan은 후보929/UTF8성공751/해독제외178, matching-line649/경로114. matching snippets는 줄내dedup/cap없음이며 전체 regex발생수나 모든 binary/text 내용을 완결했다고 주장하지 않는다. 이전928/100/41 및 decode未 한계는 당시 기록으로 보존하며 소급보충하지 않는다. |


## 2026-10-17 play_time owner 소스 경계 현행

| 항목 | 상태 |
|---|---|
| 등록 | 실제 callback 12/25·미13, `play_time`은 el_mul 직후 동일 Services self의 arity0 Callable로 등록 |
| owner | Main/Services/State 신규4메서드와 Main Script weak witness 메타데이터1필드의 검증 WIP. `read_normal_enemy_play_time()` arity0, 첫 격리검수 인수됨 |
| 관측 | current native State `_g` literal `playTime` present 값 1회, pre/post 메타데이터 및 같은 G ref 확인. missing/unsupported/loss는 raw NOT_READY·top value 없음 |
| 한계 | 원JS clock·실게임 증가·V11/V12/Worldhook·main/R/실행판 반영 미확인/미인수. 당시 이전 단계 배너·숫자·QA는 이력으로 보존 |
| 상세 계약 | `docs/engine/FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_OWNER_20261017.md`의 지원범위·이름·reason·raw ref/prefix 및 12/25 등록 상태를 기준으로 함 |

## 2026-10-17 검증 WIP 소유 체크포인트

| 구분 | 인수 범위와 한계 |
|---|---|
| 소스·등록 | Main/Services/State 신규4 API와 Main Script 메타데이터1필드. 현재 callback12/25·미13, play_time은 el_mul 바로 다음 동일 Services self·arity0로 등록 |
| 분리된 증거 | 원정적17중15통과2실패 wholefalse / 이후 독립2확인 true / 첫격리34case477확인(설정163·행동314) 인수. 서로 다른 실행을 단일 전체 PASS로 소급하지 않음 |
| 값·ref 경계 | finite native int/float 부분지원, safe int ±9007199254740991은 local 표현 한계. raw-0·원type/ref/prefix와 postloss 원read_result를 보존하며 missing unknown/unsupported/loss는 top value 없는 NR. 0fallback·clone·retry·clock writer 없음 |
| 검수 한계 | 명시 fixture와 predicate probe에서의 검수. 실제 Main/State clock 존재·진행·자연수명·원JS identity·실게임·PC 인수 증거는 아님. raw-0 owner와 미래 consumer numeric0→literal+0 투영은 별개 |
| 후속 consumer | V12 후보 소스3+첫parse2 ROOT 인수. 첫11case43행동true지만 setup5중signed-zero1false·exit1 전체FAIL은 보존. 별도 보완4case19행동+setup4 true·exit0는 첫actual+0 및 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS에만 한정. 과거 실패와 합산 PASS 금지. 네 준비식 평가 뒤 public 호출 전 검사이므로 fail-fast 실제 고장주입 증명은 아님. 실제 clock/자연MainState/JS/fullgame 미확인. 제품 V12 copy·World hook 없음; callback12 등록은 이번 별도 경계 |
| 보존 단위 | 소유 브랜치 codex/native-play-time-owner-20261017. 문서의 자체 commit SHA를 선행 선언하지 않으며 실제 local/remote SHA·tree·parent·비강제 보존 결과는 아래 단위 receipt를 기준으로 확인 |

[체크포인트 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>) · [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md)


## 2026-10-17 play_time 열두 번째 provider 등록 — 현재 경계

| id / 항목 | 구현·인수 범위와 한계 |
|---|---|
| 등록 / 분모 | 실제 callback 12/25·미13. 전체 게임 이식률이 아닌 일반 적 피해 필수 provider 수 |
| key / target / arity / 순서 | play_time / Callable(self, "read_normal_enemy_play_time") / 0 / 기존11 key 순서를 유지하고 el_mul 바로 뒤에 한 entry만 추가 |
| query 경계 | 새 entry의 Callable 생성 자체는 값 query0. 기존 map getter 및 준비 guard 전체의 순수성은 인증하지 않음 |
| owner / 부분지원 | 기존 finite native int/float 지원 범위·safe int ±9007199254740991·raw-0·raw refs/prefix·NOT_READY 및 postloss 계약 유지. clock counter/writer/setter/default0 추가 없음 |
| 검수 / 분리 | 기존 owner34case477(설정163·행동314) 인수는 유지하며 재실행하지 않음. 원17 중15통과2실패·별도2true, V12 원FAIL 및 별도4case19행동+setup4 한정성공도 각각 보존. 이번 새 검수는 등록 영향 정적 경계만 |
| 소스 / 실행 | main/R 마지막 공통 소스 D9와 I 별도 브랜치 codex/native-play-time-owner-20261017을 구분. 실제 Main/State clock·자연 실행·JS 동등성·PC·최신 실행 게임은 미인수. V12 제품 copy·World hook·dummy13·25 gate 우회 없음 |
| 보존 증거 | [등록 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |

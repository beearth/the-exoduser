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

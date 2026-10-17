> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

# FDG Godot Port — player_passives_source FIRST (2026-10-13)

TASK `GODOT-PORT-PLAYER-PASSIVES-SOURCE-FIRST-20261013`. 범위는 **PASSIVES 상태 provider** 하나다. 소유 경로 3개만:

| 경로 | 역할 |
|---|---|
| `godot/port_modules/player_passives_source/producer.gd` | load 직후 PASSIVES derive + 현재 PASSIVES authority reader + ROOT formula 바인딩 |
| `godot/port_modules/player_passives_source/test_first.gd` | 첫 headless 테스트 고유 8그룹/97checks 최초 PASS |
| `docs/engine/FDG_GODOT_PORT_PLAYER_PASSIVES_SOURCE_FIRST_20261013.md` | 이 문서 |

공유 Player/World/progress/cache, BUILD save_adapter, SKILL combat_qe, ROOT combat_stat_formula·equipment_affix_reader 파일과 공통 문서는 수정하지 않았다. 새 helper 0, Git 0.

이 모듈은 STATS, AP/SP, grit, 환불, 레벨 효과, 패시브 선택·투자·지출, applyStats를 구현하지 않는다. 전체 restore 단계 완료, 유일한 progress 소스, 8개 stat 준비, Main 준비를 주장하지 않는다.

## 1. 원 소스 — PASSIVES 결과에 영향을 주는 식만 (canonical `game.html`, 읽기 전용)

| 원 | 줄 | 식 |
|---|---|---|
| PASSIVE_DEF | 28271~28299 | 26키, 모두 `max:10`. **load 경로는 max를 적용하지 않음** |
| PASSIVES 시작값 | 28300 | `PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0)` |
| dbRestore 조기 반환 | 3991 / 3995 | `if(!d)return false` / `if(!d.player)return false` |
| PASSIVES 병합 | 4074 | `if(d.passives)for(const k in d.passives)if(PASSIVES.hasOwnProperty(k))PASSIVES[k]=+d.passives[k]\|\|0;` |
| pShield 0화 | 4077 / 4083 | `_legacyLv=Math.max(0,~~(PASSIVES.pShield\|\|0))`; `>0`이면 `PASSIVES.pShield=0` |
| skills 마이그레이션 | 4097~4100 | `if(d.skills){ if(d.skills.humanity>0&&!PASSIVES.pHuman)PASSIVES.pHuman=Math.min(10,d.skills.humanity); if(d.skills.demonRevive>0&&!PASSIVES.pDemon)PASSIVES.pDemon=Math.min(10,d.skills.demonRevive) }` |

키 순서 (PASSIVE_DEF @28272~28298): `pAtk, pCharge, pParry, pMagic, pBow, pGuard, pRegen, pCrit, pDrop, pPierce, pMRegen, pXbow, pMelee, pCombo, pAbund, pPred, pDot, pVital, pStamina, pMalice, pFortify, pArmor, pHunter, pHuman, pDemon, pRage` (ROOT `Formula.PASSIVE_DEF_KEYS` 재사용).

- **병합**: 원 load는 PASSIVES를 리셋하지 않는다. 저장에 없는 키는 prior 값이 남으므로 prior가 필수 입력이다.
- **pShield 삭제 결과 0**: pShield는 PASSIVE_DEF에 없다. 정상 prior에서는 hasOwnProperty가 false라 키가 생기지 않는다. 0화는 prior에 pShield own key가 있을 때만 일어난다. ROOT `pShieldBlock()=0`(@28700)은 별개의 상수다.
- **pDef**는 PASSIVES에 쓰지 않는다 (save의 `pDef`는 own key가 아니므로 무시된다).

### 1.1 같은 구간의 원 효과 중 이 모듈 밖 (계산 0, 소유자 필요)

| 키 (`OUTSIDE_MODULE`) | 원 | 소유자 필요 |
|---|---|---|
| `stats_merge` | @4072 STATS 병합 | BUILD/BALANCE |
| `pshield_ap_refund` | @4076~4084 pShield `_pcv` AP 환불 | BUILD/BALANCE |
| `pdef_ap_refund` | @4087~4095 pDef `_pcv` AP 환불 | BUILD/BALANCE |
| `skills_delete` | @4098/@4099 `delete d.skills.*` (save 변이) | BUILD |
| `grit_sp_refund` | @4101~4102 grit / SP 환불 | BUILD/BALANCE |

BUILD `save_session_consumer.PENDING_STAGES`의 `"stats/passives/legacy refunds/grit after inventory"` 단계 가운데 이 모듈은 **PASSIVES 결과만** 담당한다. 나머지는 위 소유자가 맡으며, 이 단계가 완료됐다고 주장하지 않는다.

## 2. 경계 (중복 금지)

| 대상 | 소유 | 이 모듈의 사용 |
|---|---|---|
| `_passDmgSum`/`pAtkMul`/`pParryDmg`/`pMagicMul`/`pGuardAbsorb`/`pShieldBlock`/`_uEq`/`_eqImplicit` | ROOT combat_stat_formula | 재구현 0. `PASSIVE_DEF_KEYS`, `js_to_int32`만 재사용 |
| JS ToNumber/ToBoolean/property-key | ROOT equipment_affix_reader | `js_to_number`(캐시 미사용), `js_truthy`, `js_property_key` 재사용 |
| STATS 입력 | — | ROOT formula에는 `configure_stats_reader`가 없다(`statStr()`/`statInt()`=1 원 상수). 테스트도 STATS를 공급하지 않는다 |
| `P._altAtk` | ENGINE | 테스트가 원 리셋값 리터럴로 ROOT `configure_player_reader`에 직접 넣는다. 이 모듈은 거치지 않는다 |

## 3. Local API (`producer.gd`)

| API | 설명 |
|---|---|
| `derive_restore(d, prior_passives) -> Dictionary` | prior = 호출자가 공급한 실제 PASSIVES. `prior_origin="caller_current"`. 입력은 변이하지 않는다 |
| `derive_restore_from_boot(d) -> Dictionary` | prior = 원 시작값 26키=0. `prior_origin="source_boot_default @28300"`. 부팅 직후 첫 load 경로의 원 결과이며 중립 대체값이 아니다 |
| `read_passives()` | derived local PASSIVES 참조. READY가 아니면 null |
| `status()` / `last_result()` | derived `{status, reason}` / 마지막 derive 결과 |
| `configure_current_passives_reader(Callable) -> bool` | 실제 현재 PASSIVES authority. invalid면 false를 반환하고 바인딩을 해제한다 |
| `clear_current_passives_reader()` | 바인딩 해제 |
| `current_status() -> {status, reason, value}` | 매 호출마다 Callable을 다시 읽는다. value는 원 Dictionary 참조 그대로(복사·형변환·쓰기 0) |
| `read_current_passives()` | `current_status().value`. 실패하면 null이고 이전 값은 쓰지 않는다 |
| `bind_combat_stat_formula(formula, source="derived"\|"current")` | `formula.configure_passives_reader(read_passives \| read_current_passives)`. 공급원이 READY일 때만 바인딩한다 |
| `source_boot_passives()` (static) | 원 시작값의 새 Dictionary |

### 3.1 derive 결과 필드 (키 순서)

`status, reason, prior_origin, passives, applied_keys, ignored_not_own_keys, save_has_passives, pshield_cleared, skill_migrations[{skill,passive,value}], save_mutations_not_applied["delete d.skills.*"], outside_module[키 5개], source`

`passives`의 키 순서는 JS own-key 순서다(array-index 키 오름차순 → 나머지 삽입 순서). 정상 prior라면 PASSIVE_DEF 26키 순서와 같다.

### 3.2 형변환 (원 그대로)

| 입력 | 결과 |
|---|---|
| `+v\|\|0` | `"3"`→3, `" 2 "`→2, `null`→0, `true`→1, `[4]`→4, `{}`→0, `"abc"`→0, `"0x1A"`→26, `12`→12 (상한 없음) |
| for-in | Dictionary own key(JS 순서), Array/String은 인덱스 키, number/bool은 열거 0. 지원하지 않는 키 shape → NOT_READY |
| pShield `~~` | `"3.7"`→3 → 0화, `0.5`→0 → 유지 |
| `d.skills.x>0` / `Math.min(10,x)` | ToNumber 후 비교(NaN → false), 상한 10 |

## 4. Readiness

| 상황 | status / 값 |
|---|---|
| derive 호출 전 | `NOT_READY derive_not_called`, `read_passives()` null |
| `!d` / `!d.player` | `SOURCE_RETURNED_FALSE`, null. derived 바인딩 formula의 reader 해제 |
| prior null / shape / 키 shape | `NOT_READY prior_PASSIVES_unbound` / `…unsupported_shape:<type>` / `…unsupported_key_shape`. reader 해제 |
| current 미바인딩 | `NOT_READY current_passives_reader_unbound` |
| current 대상 해제 | `NOT_READY current_passives_reader_target_freed` |
| current가 null 반환 | `NOT_READY current_PASSIVES_null` |
| current가 Dictionary가 아님 | `NOT_READY current_PASSIVES_unsupported_shape:<type>` |
| current가 빈 `{}` | READY (실제로 공급된 map). formula는 원 undefined 산술로 처리한다: `pAtk`/`pParry`/`pGuard`/`pMagic`은 NaN(non_finite, subset에서 제외), `\|\|0`로 보호된 키는 0 |

current 공급원이 실패하면 formula 호출은 non-READY, value null이 된다. 원 문구상 null 컨테이너는 `SOURCE_THROW`로 표시되며, 정확한 사유는 `current_status()`에 있다. authority가 복구되면 다시 바인딩하지 않아도 live로 읽는다. derived 공급원이 실패하면 formula reader를 해제한다(`NOT_READY PASSIVES_reader_unbound`).

## 5. Caller seam / 남은 gap

1. **BUILD/ENGINE**: 실제 현재 PASSIVES 저장소와 그것을 반환하는 getter를 제공하고, 대상 객체를 보관해야 한다 → `configure_current_passives_reader`. 지금은 그 저장소가 없다.
2. **BUILD**: load 시점에 `derive_restore(snapshot, <현재 PASSIVES>)`를 호출하고 결과를 채택할지 결정해야 한다. §1.1의 STATS/환불/grit/save delete 효과는 BUILD/BALANCE가 구현해야 한다.
3. **ENGINE**: `P._altAtk` reader, `meleeRef()/magicRef()`, mana(`q_shield_mp_cost`)가 필요하다. formula subset의 `required_missing=["q_shield_mp_cost"]`는 그대로 남는다.

현재 상태와 restore 맥락의 구분: `derive_*`는 load 직후 시점만 표현한다. 그 뒤 투자·리셋·큐 처리로 바뀌는 현재 PASSIVES는 소유자(BUILD)의 authority가 `current` 공급원으로 제공해야 한다.

## 6. 첫 테스트 (`test_first.gd`) — 고유 8그룹 최초 PASS

실행: `godot --headless --path godot -s res://port_modules/player_passives_source/test_first.gd [-- --only=a,b]`
종료코드 0=PASS, 1=FAIL, 2=INCOMPLETE(알 수 없는 group / check 0개인 group / 전체 0). 마지막 줄은 `PLAYER_PASSIVES_SOURCE_FIRST RESULT PASS|FAIL|INCOMPLETE`.

| 값 | 성격 |
|---|---|
| PASSIVES 26키=0 | 원 시작값 |
| `P._altAtk=0`, INV.equipped 17슬롯 null | 원 리셋값 / 원 dbRestore 기본. ROOT reader에 직접 넣는다 |
| 현재 PASSIVES map | 명시적 current-state constructor (시작값 + 지정 레벨) |
| melee_ref 150, magic_ref 120, mana 100, poise 3, detonate_lv 0 | **기술 operand** (`TECH_OPERANDS`). 제품 readiness가 아니다 |

| 그룹 | 내용 |
|---|---|
| boot_default | derive 전 NOT_READY, 시작값 prior → 26키 순서·값 0, pShield 없음, outside_module 목록만, local 참조 |
| passive_coercion | `+v\|\|0` 9종, 상한 없음, 병합, unknown 무시, prior 비변이 |
| pshield_result | 시작값 prior에서 pShield/pDef 미추가, own pShield 0화, `~~` 경계 |
| skill_migration | humanity/demonRevive 조건·상한 10·기존 값 우선, delete 보고만, save 비변이 |
| current_reader | 미바인딩/invalid/대상 해제, authority 참조 그대로, in-place·교체 변경 live 반영, null/shape → NOT_READY 및 formula value null, 빈 `{}` NaN, 복구 live, 비변이 |
| readiness | `!d`/`!d.player`, prior null/shape/키, READY 전 바인딩 거부, 실패 시 formula reader 해제, 미보관 provider → `target_freed` |
| formula_compose | derived → ROOT formula 각 배율 = 원 식 리터럴 oracle, subset, 비변이, 재derive live (pGuard 12 → cap .50) |
| qe_runtime | derived(시작값)와 current(pAtk3/pHuman2/pMelee1/pParry2/pGuard5)의 `shield_reduce_damage`(일반/패링 실패), `_do_parry_native` 반사 피해·parryBank·blue homing |

의존 .gd: 이 producer, `combat_stat_formula/producer.gd`, `equipment_affix_reader/producer.gd`, `combat_qe/combat_qe_runtime.gd`, `combat_qe/producer.gd`. NativePlayer/PNG/asset preload 0. 자동 driver/clock/render/공개 play 0. 라이브 HP/좌표/clock/AI 주입 0.

실행 이력: 없음. Claude CLI 작성과 executor 검증은 별개다.

## 7. 중앙 동기화 대상 (ENGINE)

키워드 grep(`PASSIVES|PASSIVE_DEF|pGuardAbsorb|_passiveQueue|configure_passives_reader`, 마케팅 제외 파일은 열지 않음) 결과 중 후보:
`docs/engine/FDG_GODOT_PORT_COMBAT_STAT_FORMULA_FIRST_20261013.md` (§5 gap 1), `docs/engine/FDG_GODOT_PORT_SAVE_PLAYER_PROGRESSION_RESTORE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_SAVE_ADAPTER_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md`, `docs/15 세이브+데이터구조/15 세이브+데이터구조.md`, `docs/CHANGELOG_SYNC.md`.
`docs/2_3 …` 불변 문서(grep에 경로만 나옴)와 `docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md`, `tools/marketing_capture_studio_20261009.{html,js}`는 열거나 수정하지 않았다.


## 8. 최초 실행 인수 / 실제 Claude 작성과 executor 구분

고유 **8그룹/97checks 최초 PASS**. Godot 4.7.2.stable.official.ed1daf0bf headless, 단 한 번 실행 0.267494583초, exit 0, stderr/SCRIPT ERROR/FAIL/INVALID/INCOMPLETE 0이다. 제품/test 검사 중 수리 0, 성공 반복·이전 equipment9/69·formula6·QE39·old suite 재실행 0이다. 이 시간은 테스트 벽시계이며 FPS/성능 샘플이 아니다.

| 그룹 | 첫 유효 checks | 결과 |
|---|---:|---|
| boot_default | 10 | PASS |
| passive_coercion | 14 | PASS |
| pshield_result | 6 | PASS |
| skill_migration | 9 | PASS |
| current_reader | 19 | PASS |
| readiness | 11 | PASS |
| formula_compose | 14 | PASS |
| qe_runtime | 14 | PASS |
| 고유 합계 | 97 | 8그룹 PASS |

원 boot 26키=0와 provider 부재/null을 구분했다. current Dictionary는 매 호출 실제 authority를 읽고 in-place/replaced 값을 추종한다. null/shape/freed 실패는 이전 값을 쓰지 않으며 복구되면 live 값을 읽는다. `{}` current 컨테이너는 원 undefined → NaN 결과를 보존하며 formula subset에서 non-finite 값은 제외했다. 이를 boot 26키 0이나 unbound 중립값으로 대체하지 않았다.

새 실제 caller는 PASSIVES derived/current → ROOT actual formula → CombatQERuntime.shield_reduce_damage 명시 4호출(boot/current·일반/패링실패) 및 `_do_parry_native` 명시 2호출이다. ROOT sync가 새 constructor fixture에 적용한 것은 실제 formula 제공 subset이며 `TECH_OPERANDS`의 mana/ref/poise 등은 제품 authority readiness로 승격하지 않았다. `pGuard` 0/5의 원 흡수율 .30/.40, 일반 피해 oracle, 실패패링 oracle, source 반사 oracle와 blue/homing/friendly/magic 변이를 확인했다. 일반 load pGuard12를 max10으로 자르지 않아 formula의 원 cap.50 적용을 확인했다. 이 실행은 Q press/NativePlayer 입력·Main 세계 교전이 아니다. Renderer/native clock/physics/process 자동 driver가 없고 source clock ticks/render/input은 0이다.

실제 Claude initial PID 93112 / session `85700512-973f-4561-88af-59722b5f1f39` / configured default `claude-opus-5-5` / 651229ms. 첫 검사 전 소유 범위 정정 PID 96256 / 같은 session/model / 237587ms. STATS/AP/SP/grit/환불 구현·보고값은 첫 검사 전에 제거했고 current PASSIVES authority reader를 추가했다. 모델 설정 변경·권한 우회 0, restricted/dontAsk·Read/Glob/Grep·정확 신규 3경로 Write/Edit만, 두 호출 permission_denials 0, Bash/MCP/GUI/Agent/명령 실행 0이다. initial 작성 중 기존 equipment fixture 소스 1파일을 패턴 참고로 읽었으며 기존 검사 결과 회수/실행은 하지 않았다. 이 새 검사는 기존 테스트를 preload/copy하지 않았다.

Codex executor는 첫 작성 전에 exact 3경로 working/HEAD 부재·realparent/symlink를 읽기 전용 확인해 외부 manifest로 저장했다. scope 수정 전 3파일 바이트를 외부 보존했다. fixture에는 신규 2스크립트와 readonly 기존 production 4스크립트(combat_stat_formula/equipment_affix_reader/combat_qe_runtime/combat_qe producer)만 복사했고 원 PNG/기존 asset copy·hash·import/새 image는 0이다. BUILD restore를 preload/다시 실행하지 않았다. executor는 제품/test를 변경하지 않았고 이 새doc 실행 receipt만 보충했다.

전체 docs keyword `PASSIVE_DEF|PASSIVES|pAtkMul|pHuman|pMelee|pMagic|pGuard|pShieldBlock|player_passives_source` 검색은 정확 제외 marketing 파일을 검색/접근하지 않았다. 신규 문서를 포함한 49경로(기존48)는 `keyword-doc-matches.json`에 기록했다. `2_3`는 immutable이고 worker 기존 doc 수정 0이다. 현재 PASSIVES/global getter, 원 피해 refs/P._altAtk/mana, STATS/legacy 환불/grit/skills 삭제의 구현 여부는 작성 당시 source/API snapshot과 필요 seam을 기준으로 보고했으며 이후 타인 작업을 재감사하지 않았다.

ENGINE은 actualcurrent PASSIVES authority/getter를 공급하고 기존 World/Player/stat assembly에서 `bind_combat_stat_formula(formula, 'current')`를 단 한 번 소비해야 한다. source restore 단계의 PASSIVES local derive는 BUILD 소유 STATS/환불/grit/save delete 완료와 별개다. 이 module이 공통 STAT 본체/투자·지출/레벨 효과를 대신하지 않는다. shared docs 현재값 sync와 normal code+docs checkpoint는 중앙에 인계한다. sharedPlayer/progress/cache/World/HTML/main/API/save/Git/server/shipping/human paused 입력 변이는 0이다. 전체8stat/Main/publicplay/최저사양1080p240 미완이다.

외부 proof/실CLI로그/backup/ledger/handoff 루트: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/player_passives_source/`. 신규 성공자료는 최초 인수 뒤 동결한다.


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

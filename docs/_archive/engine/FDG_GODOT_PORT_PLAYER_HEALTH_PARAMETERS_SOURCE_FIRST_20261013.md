## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# FDG Godot Port — Player Health Parameters Source (FIRST) — 2026-10-13

TASK `GODOT-PORT-PLAYER-HEALTH-PARAMETERS-SOURCE-FIRST-20261013`

| 항목 | 값 |
|---|---|
| producer | `godot/port_modules/player_health_parameters_source/producer.gd` (FROZEN) |
| runner | `godot/port_modules/player_health_parameters_source/test_first.gd` (FROZEN) |
| 범위 | 원 `applyStats` 의 HP parameter 부분만: `P.mhp` / `P.hpR` / `Math.min` 으로 내려가는 `P.hp` |
| 범위 밖 | DEF/poise/baseAtk/speed/shield/MP/ST/recalcSt, 전체 applyStats, 피해/부활/포션/레벨업, `P._effStats`/`P._crystalStats` 쓰기, 저장/복원 |
| Main 준비 | **아님** (`SCOPE.main_ready=false`, `full_apply_stats=false`, `owns_clock=false`) |
| 실행 결과 | **FIRST PASS** — Godot 4.7.2 isolated attempt01, 6 신규 그룹 / 87 checks (§7) |

작성/역할:
- writer: Claude (PID 27508, session `fb9b5f84-3747-4571-8461-8707d9734446`, 설정 모델 `claude-opus-5-5`, restricted/dontAsk). 공개 seam 반영 리뷰(29365)도 같은 세션.
- executor: Codex (isolated 실행 + 별도 NodeJS source-local oracle).

관련 문서 (메타데이터 목록만 — 이 작업에서 수정하지 않음):
`docs/engine/FDG_ENGINE.md`, `docs/engine/FDG_INTEGRATION_INTERFACE.md`, `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md`,
`docs/engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md`, `docs/engine/FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md`,
그리고 docs14 패시브 효과 표(strHP5, hpR .12/sec, pFortify 300, pMelee 3% base bundle, pHuman 100 / grit 1).
docs14 수치는 설계 문서의 표기이며, 이 producer 의 수치는 아래 canonical R 원식만 따른다.

## 1. 원 R (canonical `game.html`, 읽기전용)

| 위치 | 원식 |
|---|---|
| @9567 | `const _diffSigned=()=>(((typeof OPT!=='undefined'&&OPT.diff!=null)?OPT.diff:5)-5)` |
| @28567 | `for(sl of SLOT_NAMES){const it=INV.equipped[sl];if(it){_eqStr+=(+it.bStr||0);…}}` (17슬롯) |
| @28568 | `_lb=_lvB()` |
| @28569 | `s.str=STATS.str+_eqStr+_lb+~~_eqAffix('strFlat')`, `s.vit=~~_eqAffix('vitFlat')` |
| @28570 | `P._effStats=s` — **중앙 소유**, 부분 str/vit 로 덮어쓰지 않음 |
| @28573 | `_diffBaseHp=Math.max(100,300-20*_diffSigned())` |
| @28574 | `_stgHp=G.on?_diffBaseHp+((G.stage||1)-1)*6:_diffBaseHp` |
| @28575 | `_afHpF=_eqAffix('maxHPFlat')`, `_afHpP=_eqAffix('maxHPPct')+_eqAffix('lifeMaxHP')`, `_imHp=_eqImplicit('_iMaxHP')`, `_imHpP=_eqImplicit('_iMaxHPPct')+_eqImplicit('_iLifeHPPct')` |
| @28578-28581 | `_allDefSlots`(14) 순: `if(_dit){_totalBonusHp+=(+_dit.bonusHp||0); if(_dit.enh>0&&_hpEnhSet.has(sl))_enhHp+=_dit.enh*1.0}` |
| @28582 | `P.mhp=~~((_stgHp+s.str*5+s.vit*3+_totalBonusHp+_afHpF+_imHp+_enhHp)*(1+_afHpP+_imHpP*.01+(PASSIVES.pMelee||0)*.03))` |
| @28589 | (nonHP, 중앙) `P.speed=…(_eqAffix('injuredSpeed')>0&&P.hp<=P.mhp*.5?…)` — min 전 현재 hp + @28582 중간 mhp 읽음 |
| @28592 | `P.hpR=.05+s.str*.002+_eqAffix('lifeRegen')/60` |
| @28596-28600 | `_cr` 18키 공통 결정 합산 → `P._crystalStats=_cr` (player_resource_parameters_source 소유 — 재합산 0) |
| @28601 | `P.mhp=~~(P.mhp+~~_cr.hp)+(PASSIVES.pHuman||0)*100+_gritHpFlat();P.hp=Math.min(P.hp,P.mhp)` |
| @28605 | `P.hpR+=_cr.hpR/60` |
| @28616-28617 | `const _fLv=PASSIVES.pFortify||0;if(_fLv>0){P.mhp+=_fLv*300;P.hp=Math.min(P.hp,P.mhp)}` |
| @28559-28560 | `_gritTotal()=(+_grit||0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR')`, `_gritHpFlat()=_gritTotal()` |
| @29655 | mkP boot: `hp:350,mhp:350` — **hpR/_crystalStats 없음** |

`_diffSigned` 위치 정정: canonical R 의 정의는 **@9567** (Codex 의 exact selector rg 로 확인). 초기 brief/초안이 가리킨 @8330 은
잘못된 위치였을 뿐 원 본문이 없었던 것이 아니다. 이 모듈은 여전히 `_diffSigned()` 결과를 **명시 provider** 로만 받는다 —
미바인딩/null 이면 NOT_READY 이며, OPT 를 읽거나 기본 5(→0)를 만들어 넣지 않는다. OPT 소유/공급은 이 모듈 밖.

### 장비 순회와 HP 강화 슬롯

| 경로 | 정확한 원 순서 / 집합 | 소비 |
|---|---|---|
| STR `SLOT_NAMES` (기존 AffixReader 상수 재사용, 17) | `weapon,shield,boots,armor,helmet,bow,gloves,pants,belt,necklace,ring1,ring2,cape,bracelet,headband,ossuary,headband2` | `(+it.bStr||0)` 순서대로 누적 |
| HP `DEF_SLOTS` (14) | `shield,armor,boots,gloves,pants,belt,necklace,ring1,ring2,cape,bracelet,headband,ossuary,headband2` | `(+it.bonusHp||0)` 순서대로 누적; weapon/bow/helmet 제외 |
| `HP_ENH_SLOTS` (3) | `gloves,pants,boots` | `enh>0`일 때 `enh*1.0`; helmet 강화 제외 |

### 상수

| 상수 | 값 | 원 |
|---|---|---|
| diff signed | `(OPT.diff ?? 5) - 5` (provider 가 공급) | @9567 |
| diff base | `max(100, 300-20*d)` | @28573 |
| stage step | `6` / stage, `G.stage||1` | @28574 |
| STR→mhp | `*5` | @28582 |
| VIT→mhp | `*3` | @28582 |
| implicit pct | `*.01` | @28582 |
| pMelee | `*.03` | @28582 |
| HP enh | `enh*1.0` (gloves/pants/boots 만, helmet 아님) | @28579/28581 |
| hpR base | `.05` | @28592 |
| STR→hpR | `*.002` | @28592 |
| lifeRegen | `/60` | @28592 |
| _cr.hpR | `/60` | @28605 |
| pHuman | `*100` | @28601 |
| pFortify | `*300` | @28617 |

## 2. Source phase / API

| phase 상수 | 원 위치 | writes (packet 내 순서) | gap (다른 owner) |
|---|---|---|---|
| `PHASE_INITIAL` | @28567-28592 | **한 packet**: `writes[0]` `mhp`@28582, `writes[1]` `hpR`@28592 | start 28566-28581 (공통 prefix, `_effStats`); **after_write_0 28583-28591** (baseDef/poise/baseAtk/speed/_oocSpeed/stR); end 28593-28600 (mmp/mpR + 공통 `_cr`) |
| `PHASE_CRYSTAL_MHP` | @28601 | `mhp` → `hp` | end 28602-28604 (baseAtk/baseDef(+grit*.5)/speed 결정) |
| `PHASE_CRYSTAL_HPR` | @28605 | `hpR` | end 28606-28615 (mpR/stR/mmp/mp/pVital/pStamina) |
| `PHASE_FORTIFY` | @28616-28617 | `mhp` → `hp` (`_fLv<=0` → writes 0, dispatch 0, `action=no_write`) | end 28618-28624 (pArmor/mshield/shield/recalcSt) |

**after_write_0 주의**: 원 nonHP 구간 28583-28591 은 `PHASE_INITIAL` packet **내부**, `writes[0]`(mhp) 적용 *후* `writes[1]`(hpR) 적용 *전*에
ENGINE sink 가 실행해야 한다 — 완전한 phase packet 사이가 아니다. 원 speed(@28589)는 min 이전 현재 hp 와 @28582 의 **중간** mhp
(최종 mhp 아님)를 읽는다. `plan.values` 는 계산값일 뿐이며 현재 P 에 쓰였다는 receipt 가 아니다.

공개 API:

| API | 설명 |
|---|---|
| `configure(providers, health_sink) -> readiness` | providers: `PROVIDER_*`→Callable. sink: `(packet: Dictionary)->bool`. Callable owner(RefCounted)·adapter 강참조 보존 |
| `readiness()` | 값 호출 없음. phase 별 `{ready, missing}` + `missing_upstream` |
| `plan_phase(phase)` / `plan_initial()` / `plan_crystal_mhp()` / `plan_crystal_hpr()` / `plan_fortify()` | 순수 계획(쓰기/sink 0). `{status, packet, values}` |
| `run_phase(phase)` | plan → writes 있으면 sink 1회 → bool ack 시 pass 진행. `PHASE_INITIAL` 은 새 pass 개시 |
| `run_health_subset()` | 4 phase 연속 — **fixture 편의**, `full_source_order=false` (원은 packet 내부/phase 사이 nonHP gap 실행) |
| `stage_state()` | `{pass_id, done, complete, acked, crystal_stage, next}` 진단 |
| `read_current_health()` | 현재 P hp/mhp/hpR 원값 + provenance (`absent`/`current_unverified`/`stage_acked:pass_N`/`current_P`) |
| `read_regen_state() -> Dictionary|null` | `hp_regeneration_source` state reader. 완료 pass + 현재 mhp/hpR == ack 일 때만 바인딩된 P, 아니면 null |
| `grit_hp_flat_provider(rp)` | 공개 seam `player_resource_parameters_source.read_source_grit_total()` (원 `_gritTotal` @28559) 결과를 deep copy 전달. private/`_fail` 접근 0, 5항 재구성 0. 대상 null/해제 → `grit_source_unbound_or_freed`, 메서드 없음 → `grit_source_missing_public_seam`, 비 Dictionary → `grit_seam_bad_result` (NOT_READY, value null). seam 의 NOT_READY/SOURCE_NON_FINITE 는 그대로 → phase NOT_READY |
| `crystal_stats_provider(rp)` | **선택적 fixture/단독 편의** (§3 crystal 참조) |

packet: `{kind, pass_id, source, writes:[{field, value, source, expr, before_present, before}], gaps:[{at, source, owner}]}`.
`before_present=false` 는 쓰기 직전 현재 P 에 그 필드가 없었다는 뜻(boot P 의 첫 hpR). sink 는 writes 를 순서대로 적용하고
gaps 의 nonHP 구간은 ENGINE 이 `at` 위치에서 실행한다.

## 3. Provider — 필수/누락/유효 0

| provider | 사용 phase | 계약 | 누락/거부 (NOT_READY, dispatch 0) | 유효 0 / 원값 |
|---|---|---|---|---|
| `player` | 전부 | 현재 P Dictionary | 미바인딩, null, 비 Dictionary; `P.hp` 부재/비유한 (crystal/fortify) | `hp:0`, 음수, 소수 유효 |
| `stats` | INITIAL | 현재 STATS | `str` 부재, 비숫자 | `str:0` |
| `passives` | INITIAL/CRYSTAL_MHP/FORTIFY | 현재 PASSIVES | 객체/배열 값 | 키 부재/0 → `||0` |
| `inventory` | INITIAL | 현재 INV | `equipped` 부재/null/비 Dictionary | 빈 equipped |
| `g` | INITIAL | 현재 G | `G={}`(on 부재), on 비 bool, on=true 인데 stage 부재/비숫자 | on=false → stage 미읽기; `stage:0` → `||1` |
| `diff_signed` | INITIAL | 원 @9567 결과: number 또는 `{status:READY,value}` | 미바인딩/null/비숫자/비 READY (OPT/기본값 생성 0) | `0`(=OPT.diff 5) 유효 |
| `eq_affix` | INITIAL | `equipment_affix_reader.eq_affix` | 비 READY (READY_PARTIAL 포함) | `absent_zero` |
| `eq_implicit` | INITIAL | `combat_stat_formula.eq_implicit` | 비 READY | 0 |
| `lv_b` | INITIAL | `combat_reference_source.lv_b` | 비 READY | 0 |
| `crystal_stats` | CRYSTAL_MHP | `{status, value:_cr, stage}` | 비 READY, stage 문자열 없음, `hp`/`hpR` 비유한 | `_cr` 0 |
| `grit_hp_flat` | CRYSTAL_MHP | `read_source_grit_total()` 결과 (원 `_gritTotal`) | 비 READY (NOT_READY/SOURCE_NON_FINITE, value null) | READY 0 |

`STATS.str:null` (원은 `null+n=n`) 은 엄격 subset 에서 미지원 NOT_READY 로 둔다.

**crystal provider 우선순위**: 권장 경로는 원 공통 stage(@28596-28600)가 한 번 만든 fresh `_cr` 값+stage 를 외부
`PROVIDER_CRYSTAL_STATS` 로 공급하고, 같은 packet 을 HP/DEF/shield 소비자가 공유하는 것. `crystal_stats_provider(rp)` 는
`plan_apply_stats()` 전체를 다시 계산(MP/ST·grit 및 추가 query 포함)하므로 단독 fixture 전용이며 원 source query 순서/Main authority
증명이 아니다. 어느 경로든 결정 테이블/합산/private getter 중복 0.

## 4. 상태 보존 / pass provenance

- `PHASE_INITIAL` 에는 `Math.min` 없음 — 현재 hp 가 새 mhp 보다 커도 그대로(원과 동일, 하향은 @28601).
- @28601 / @28617 `Math.min` 만: overcap → 하향 clamp, 음수/소수/0 hp 그대로. 추가 `min 0`/clamp/refill 없음.
- 이른 min(@28601) 결과가 보존되며, fortify 로 mhp 가 올라가도 hp 를 채우지 않는다.
- 후속 phase 는 같은 pass 의 직전 phase ack 후에만 READY; 현재 `P.mhp`/`P.hpR`/`P.hp` 가 ack 값과 다르면 `current_P.<f>_diverged_from_stage` NOT_READY.
- `PHASE_CRYSTAL_HPR` 는 `PHASE_CRYSTAL_MHP` 에서 읽은 같은 `_cr` 를 쓴다(재조회 0, 원 단일 `_cr` 객체).
- sink 거부 → `SINK_REJECTED`, pass 진행 0. 새 `PHASE_INITIAL` run 이 pass 재개시.
- 계산 결과 비유한 → `SOURCE_NON_FINITE`, packet null(diagnostic_packet 만).
- sink 의 bool ack 는 쓰기가 실제 적용됐다는 증명이 아니다 — 후속 phase 의 현재값==ack 비교가 유일한 확인이며, 신뢰된 sink 바인딩은 ENGINE 책임.

## 5. Getter — 생성 금지 규칙 / READY 의미

- boot P(hpR 없음): `read_current_health()` → `provenance.hpR="absent"`, `values` 에 hpR 키 없음, NOT_READY. **0 생성 없음**.
- boot `mhp:350` 은 `current_unverified` — 파생으로 주장하지 않음.
- 파생 hpR 정확히 0 (str 0, lifeRegen −3, 결정 0) 은 유효 → regen 소비자 `guard_skip _hpr<=0` (NOT_READY 아님).
- 부분 pass(initial 만) → `current_unverified`; `read_regen_state()` null → `hp_regeneration_source` `P_null` NOT_READY.
- **READY 의 의미**: 바인딩된 현재 Dictionary 의 hp/mhp/hpR 필드가 구조적으로 유효하고 mhp/hpR 가 이 producer 의 stage ack 숫자와
  일치한다는 것뿐. 물리적 Main Player identity/lifecycle, 같은 P 의 phase 간 안정성, 신뢰 sink 바인딩, CurrentSource holder 는
  인증하지 않는다(ENGINE).

## 6. 첫 consumer 체인

```
equipment_affix_reader.eq_affix ─┐
combat_stat_formula.eq_implicit (+ js_to_int32) ─┤
combat_reference_source.lv_b ─┤→ PHASE_INITIAL → CRYSTAL_MHP → CRYSTAL_HPR → FORTIFY → ordered parameter sink (fixture P)
public rp.read_source_grit_total() ─┤
공통 crystalEffects (_cr) ─┘
                         → hp_regeneration_source(read_regen_state) → 별도 단일 HP sink
```

runner 의 regen 호출(신규 runner 확인): `advance_native(1.0)` **1회**(write 1회, 별도 HP sink) + 순수 `plan_native(1.0)` **3회**
(pass 전 NR, hpR 외부 변경 후 NR, 파생 hpR 0 guard_skip). tick operand 1.0 은 명시 인자 — 전역 프레임/clock 과 무관.
제품 자동 physics/process/render 0; 전역 SceneTree 프레임 미계측. Gui/asset/import/server/save/Main/240 증명 없음.

## 7. 실행 기록

```
godot --headless --path godot -s port_modules/player_health_parameters_source/test_first.gd -- [--only=g1,g2] [--report=/abs/path.json]
```
exit 0 PASS / 1 FAIL / 2 INVALID (알 수 없는 인자·그룹, 비절대 `--report`, 0 checks). JSON: `status, checks, failures, failed_groups, groups, note`.

**Godot 4.7.2 isolated attempt01**: exit 0, stderr 0, SCRIPT ERROR 0. 6 신규 그룹 87 checks **FIRST PASS**.
FAIL/INVALID 0, 실행 중 producer/fixture 수정 0, 성공 그룹/기존(old) 그룹 재실행 0.

이력: 실행 전 source-integration 리뷰에서 grit adapter 를 private `_grit_total()`/`_fail` 접근에서 공개 `read_source_grit_total()`
로 전환하고 seam check 를 추가했다. **최초 초안은 실행되지 않았으며 PASS 를 주장하지 않는다** — PASS 는 seam 전환 후 버전.

| group | 내용 | 결과 |
|---|---|---|
| `initial_formula` | 실 affix/implicit/lvB → s.str 13·s.vit 2·_stgHp 312·bonusHp 35·enhHp 6 → **mhp 561**, hpR; writes[0]/[1] 순서·source·after_write_0 gap·before_present; initial 에 min 없음 | PASS |
| `crystal_fortify_order` | producer 만 남긴 retention; 실 crystalEffects·fixture `_cr`(hp 19) + 공개 grit seam 10 + pHuman 2 → **790** → hpR+=/60 → fortify **1090**; pFortify 0 → no_write | PASS |
| `state_preservation` | hp 2000/−5.5/123.25/0 → 이른 min 만, fortify 후 refill 없음 | PASS |
| `authority_missing` | grit seam 전달(READY 10, `_grit` null → NR) + adapter 대상 없음/해제/메서드 없음 NR; G={}, on=false, stage 0, stage 부재, diff null/−5/15, diff 미바인딩, eq_affix 미바인딩, crystal provider 부재(initial 은 사용 가능), P.hp 부재, boot hpR 부재(중립 0 아님) | PASS |
| `stage_order_sink` | 순서 위반, unknown phase, sink 거부, 새 pass_id, mhp diverged, sink 미바인딩 | PASS |
| `regen_consumer` | pass 전 regen NR(P_null) → pass 후 write(별도 sink) → hpR 외부 변경 NR; 파생 hpR 0 → 실제 guard_skip | PASS |

**별도 Codex NodeJS source-local oracle** (6 신규 case, 원식 지역 재현 — 전체 applyStats/게임 아님, Godot 기존 테스트 실행 아님, 픽셀 증명 없음):

| case | 결과 |
|---|---|
| base | mhp 300 / hpR .05 |
| fortify no HP refill | mhp 600 / hp 300 |
| zero hpR | mhp 175 / hpR 0 |
| stage 0 falsy (`||1`) | mhp 211 / hpR .052 |
| crystal post | mhp 645 → 945 / hpR .0585 |
| late int32 | mhp 701.5 / hp 350 |

## 8. 남은 authority / phase gap

| gap | owner |
|---|---|
| native Player 의 hp/mhp/hpR current authority, 같은 P 안정성, 신뢰 sink 설치 (bool ack ≠ 쓰기 증명) | ENGINE |
| `PHASE_INITIAL` packet 내부 after_write_0 에서 원 nonHP 28583-28591 실행 (speed 는 min 전 hp + 중간 mhp) | ENGINE (중앙) |
| phase 사이 nonHP gap 28593-28600, 28602-28604, 28606-28615, 28618-28624 interleave | ENGINE (중앙) |
| 원 @9567 `_diffSigned()`/`OPT.diff` production provider (미바인딩 시 NOT_READY 유지) | SETTINGS/BUILD |
| 현재 STATS / G(on, stage) / `_grit` authority | BUILD/ENGINE |
| ~~grit 공개 API~~ — 해소: `read_source_grit_total()` seam 소비 | — |
| 원 공통 fresh `_cr` packet(value+stage) 을 외부 `PROVIDER_CRYSTAL_STATS` 로 HP/DEF/shield 공유 공급 | resource_parameters/ENGINE |
| `P._effStats` 전체(str/dex/int/vit/lck) 쓰기 | 중앙 |
| DEF/poise/baseAtk/speed/shield/MP/ST/recalcSt, 피해/부활 | 각 owner |
| 캐시 무효화(`_eqAffixCache`/`_eqStatCache`) 원 지점 연결 | ENGINE/ITEM |

검색 메모: 저장소 전체 키워드 매칭 기준 applyStats 관련 초기 경로 67건은 현재 중앙 소유이며, 정규 checkpoint 는 ENGINE 이 관리한다.

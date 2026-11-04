## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

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

# FDG Godot Port — holy_dome_presence_source FIRST (2026-10-13)

TASK `GODOT-PORT-HOLY-DOME-PRESENCE-SOURCE-FIRST-20261013` · 기술 상태 **독립 readonly supplier / 고유9그룹383검사 PASS** · 실제 현재 World/P 연결 미완. This module ports the original `updatePlayer` `_inHolyDome` predicate as a readonly presence supplier. It feeds the `in_holy_dome` provider of [resource_regeneration_source](FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md).

It has no clock, Node, GUI, render or sink of its own. It never creates, removes, expires, advances or writes zones, G or P.

Related docs: [자원리젠+소모공식 §추가 배율](../2_1%20스킬관리+합체시스템+자원/자원리젠+소모공식.md) ("회복의 영역 (holyDome): 리젠 ×2").

## Module paths

| Path | Role |
|---|---|
| `godot/port_modules/holy_dome_presence_source/producer.gd` | readonly presence supplier |
| `godot/port_modules/holy_dome_presence_source/test_first.gd` | isolated tests G01–G09 (`--only` / `--report`) |
| `docs/engine/FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md` | this doc |
| R `game.html:33348-33350`, `game.html:32384` | original source (read-only) |
| `godot/port_modules/resource_regeneration_source/producer.gd` | consumer (read-only here; `configure` / `advance_native` / sink API) |
| `godot/port_modules/equipment_affix_reader/producer.gd` | reused read-only: `js_truthy`, `js_to_number` |

## Source (exact)

```js
let _inHolyDome=false,_hdLv=1;                                                    // 33348
if(G._fireZones){for(let _hdi=0;_hdi<G._fireZones.length;_hdi++){const _hd=G._fireZones[_hdi];
  if(_hd.type==='holyDome'&&dst(P.x,P.y,_hd.x,_hd.y)<_hd.r){_inHolyDome=true;_hdLv=_hd.lv||1;break}}}  // 33349
const _hdMul=_inHolyDome?2:1;                                                     // 33350 (regen owns)
function dst(a,b,c,d){return Math.sqrt((c-a)**2+(d-b)**2)}                        // 32384
```

| Item | Port |
|---|---|
| `if(G._fireZones)` | JS ToBoolean via `AffixReader.js_truthy` |
| forward loop, `break` on first match | `for i in range(size)`, return on first match with `index=i` |
| `_hd.type==='holyDome'` | only a `String` exactly equal to `"holyDome"` matches. A missing `type` (undefined) does not match |
| `&&` short-circuit | P, x/y/r are read only after a type match. P is read lazily, once per call |
| `dst(...)<_hd.r` | `sqrt(dx*dx+dy*dy) < ToNumber(r)` using strict `<`, so `dst==r` is false. NaN gives false |
| ToNumber of operands | `js_to_number` (missing→NaN, null→0, bool→0/1, string with JS trim/hex/bin/oct/Infinity, `[]`→0, `[n]`→n, `{}`→NaN) |
| filters | **none**: no `t/maxT/owner/hp/lv/on`, no `P.r` addition, no `P.skills`, no `G.on`, no activity/expiry gate |
| `_hdLv`, `_hd.lv\|\|1` | **not implemented**. It belongs to the flat regen at 33352 (another owner) |

## Public API

| Method | Result |
|---|---|
| `configure(world_reader: Callable, player_reader: Callable) -> Dictionary` | stores the readers, retains RefCounted owners strongly (`_owners`), returns `readiness()` |
| `clear()` | releases the readers. Later calls return NOT_READY |
| `readiness() -> Dictionary` | `{ready, status, missing}`. Calls no reader |
| `presence_detail() -> Dictionary` | `{status, value, index, reason, zones_shape, source}`. Reads current G and, if needed, P on every call |
| `in_holy_dome_value() -> Variant` | `bool` when READY, `null` otherwise. It never disguises a missing authority as `false` or a number |
| `regen_provider() -> Callable` | `Callable(self, "in_holy_dome_value")`, for regen `providers["in_holy_dome"]` (regen requires strict bool) |
| `read_counts() -> Dictionary` | diagnostic `{g, p}` reader call counts |

`world_reader()` returns the current G as a Dictionary, or null. `player_reader()` returns the current P as a Dictionary, or null.

### Status

| Input | status | value | reason |
|---|---|---|---|
| unconfigured / reader invalid (incl. freed Object owner) | NOT_READY | null | `not_ready:<missing>` |
| G reader returns null | NOT_READY | null | `world_authority_null` |
| G non-Dictionary | NOT_READY | null | `world_authority_unsupported_shape` |
| `_fireZones` absent | READY | false | `zones_shape=absent` |
| `_fireZones` null/false/0/0.0/NaN/"" | READY | false | `falsy` |
| `_fireZones` `[]` / Array without a match | READY | false | `array` |
| `_fireZones` truthy number / `true` / `{}` (no `length`) | READY | false | `non_array_no_iteration` (`.length` undefined, so the loop runs 0 times) |
| `_fireZones` non-empty String | READY | false | `string` (a character's `.type` is undefined) |
| `_fireZones` Dictionary with `length` (array-like), Packed*Array, Object | NOT_READY | null | `fire_zones_unsupported_shape*` (**gap**) |
| element null reached before a match | SOURCE_THROW | null | `zone_null_type_access`, index = element |
| element int/float/bool/String/Array, Dictionary without `type` | (skip) | — | `.type` undefined |
| element Object (non-Dictionary) | NOT_READY | null | `zone_unsupported_shape` (**gap**) |
| `type` is a StringName | NOT_READY | null | `zone_type_unsupported_shape:StringName` (**gap**; no JS analog) |
| type match and P null / non-Dictionary | NOT_READY | null | `player_authority_null` / `player_authority_unsupported_shape` |
| first match | READY | true | index = first matching `i` |

P null with **no** holyDome candidate returns READY false, because the source never evaluates `P.x` in that case (short-circuit). Absent-authority detection for P therefore happens only when a candidate exists.

## Regen boundary

Wiring: `regen.configure(state_reader, {…, "in_holy_dome": presence.regen_provider()}, resource_sink)`. If presence is not READY, the adapter returns `null`. Regen then returns `NOT_READY provider_not_bool:in_holy_dome` with dispatch 0. A valid false gives `hd_mul=1`, which is the source default. A valid true gives `hd_mul=2`.

## Tests

Codex executor는 외부 `fixture-attempt2/`의 순수 `.gd` 4개만 `Godot 4.7.2 --headless --path <isolated fixture> --script res://port_modules/holy_dome_presence_source/test_first.gd -- --report=<external json>`로 실행했다. 자기 신규2파일 + 필요한 readonly producer2개(regen/affix)이며 이전 테스트/PNG/import 0. physics60 / Compatibility / 별도 custom userdir 이름 `EXODUSER-HolyDomePresenceSource-Isolated-20261013`이다. 사용자 게임/저장 파일 접근 없이 실행했으며 자동 physics/process/render/input은 0이다.

Exit codes:
- **0**: all selected groups PASS.
- **1**: FAIL.
- **2**: INVALID. This covers a group that did not return `true` (aborted by a script error), zero checks, an unknown arg/group, or a report write failure.

The executor must also treat any `SCRIPT ERROR` line in the output as not-PASS.

| Group | Content |
|---|---|
| G01 source_literals | `"holyDome"`, `_fireZones`, source refs, `dst` 3-4-5, regen key/`HOLY_DOME_MUL=2`, no `_hdLv` surface |
| G02 missing_authority_not_ready | unconfigured / reader missing / G null / G int / G array / P null+candidate → NOT_READY + adapter null; P null without candidate → READY false with no P read |
| G03 falsy_and_non_array_shapes_false | absent/null/false/0/NaN/""/[]/5/true/{}/"ab" → READY false (shape names); array-like object and Packed array → NOT_READY gap; primitive elements skipped |
| G04 strict_type_boundary_no_extra_gates | `dst==r` false, ±ε, int operands, case/space/other types false, StringName gap, `P.r` not added, t/maxT/owner/hp/lv/on/G.on/P.skills not filtered, adapter `TYPE_BOOL` |
| G05 forward_first_match_short_circuit_throw | first match index, break before trailing null, leading/after-non-match null → SOURCE_THROW, Object element gap, P not read without a type match, P read once with candidates |
| G06 js_numeric_coercion | string/null/bool/Infinity/NaN/""/[n]/[a,b]/{}/trimmed/`"abc"`/negative r, missing x, P.x missing/null, P string/[] coords |
| G07 lifecycle_live_no_mutation | next call sees a moved zone or P, array replaced, G or P temporarily null → null then restored, G/P `var_to_str` unchanged after 20 calls, same array instance, 1 G read per call, clear/reconfigure, RefCounted owner retained after test drops ref, freed Object owner → NOT_READY |
| G08 regen_boundary_isolated_sink | real `resource_regeneration_source` + isolated `ResourceSink` (writes only fixture `SourceState.p`); outside st 10→10.5 / mp 10→10.75; inside 11.5 / 12.25 (×2); boundary-equal 12.0 / 13.0; absent zones 12.5 / 13.75; G null, SOURCE_THROW and cleared presence → `provider_not_bool:in_holy_dome`, dispatch 0, sink untouched, values unchanged; beam inside 13.0 / 14.125; `dispatch_count == packets` |
| G09 explicit_only_no_clock | not a Node; no `_process/_physics_process/_ready/advance_native/tick`; `readiness()` and building the provider read nothing; 1 read per provider call |

The fixture operands are technical only and are **not** product values or readiness: `stR=4`, `mpR=6`, `regen_mul=mregen_mul=1`, `equip_*=0`, `st=mp=10`, `mst=mmp=1000`, `sp=1.0`, guard `parry_lesson_active=false`, `s="idle"` then `"beam"`. The fixture `SourceState`, `RatesFixture` and `ResourceSink` are RefCounted and are kept explicitly by the rig Dictionary.

### Result

작성 시 Claude는 NOT_RUN으로 구분했고 이후 Codex executor가 첫 실행을 마감했다. 최초 attempt1은 test의 `var same := Variant 비교식` 타입 추론 parse error로 **INVALID/0그룹0검사**(raw exit0, 0.488558667초)였다. test1줄에 bool 타입만 명시한 뒤 아직 실행되지 않은 전 그룹을 attempt2에서 처음 유효 실행했다. **고유9그룹383검사 PASS, exit0, 0.612054166초, stderr 빈 값/SCRIPT ERROR0**. 제품 수리0, 유효 성공 재실행0, 이전 regen10/Cref/formula/QE 성공suite 실행/복사0.

Scope even after a pass:
- headless and pure, with explicit method calls
- not live readiness and not a public play or render claim
- 240 Hz, GPU and frame cost are unmeasured

## Remaining gaps (not claimed)

| Gap | Owner |
|---|---|
| live binding of `world_reader` to the current native World/G `_fireZones` authority (no such array exists in native yet) | ENGINE (World) + SKILL (holyDome cast/clock/effects create the zones) |
| live binding of `player_reader` to the current P x/y | ENGINE (sharedPlayer) |
| wiring `regen_provider()` into the live regen configure; the other 4 regen providers come from ROOT `regeneration_stat_source` | ENGINE / ROOT |
| `_hdLv` / flat regen 33352 | other owner |
| array-like objects, Packed arrays, engine Objects, StringName type | NOT_READY gap (no JS-faithful mapping claimed) |

There is **no main-loop / public play claim**. Nothing in the native game calls this module yet.

## Existing related docs (content keyword search `holyDome|in_holy_dome|holy_dome_presence_source|_fireZones` under `docs/`, central handoff; none edited)

| Path | Hits |
|---|---|
| `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` | 20 |
| `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` | 2 |
| `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식__NFD_0628_2305_백업.md` | 2 |
| `docs/2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md` | 2 |
| `docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md` | 3 |
| `docs/2_3 돌진+패링+방패시스템/2_3 돌진+패링+방패시스템.md` | 1 (immutable; path only) |
| `docs/2게임디자인레벨디자인/PLAYER_GUIDE_20260912.md` | 1 |
| `docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md` | 1 |
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | 3 |
| `docs/5.1임펙트디자인/PHASE_V1_MOTION_FIREZONE_SEAL.md` | 1 |
| `docs/5.1임펙트디자인/ZONE_LIGHT_CLASSIFICATION_20260910.md` | 2 |
| `docs/5.1임펙트디자인/BOSS_CAGE_TRAP_VFX.md` | 1 |
| `docs/6사운드디자인/6사운드디자인.md` | 3 |
| `docs/10ai에셋프롬프트모음/UI_아이콘_GPT_생성프롬프트팩.md` | 1 |
| `docs/11내러티브·로어디자인/펫_대사_스크립트.md` | 2 |
| `docs/12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.md` | 1 |
| `docs/12퍼포먼스·최적화/프레임최적화_전수조사_2026-05-21.md` | 2 |
| `docs/13출시·마케팅/13출시·마케팅.md` | 3 |
| `docs/13출시·마케팅/FRESH_CAPTURE_MANIFEST_20261008.md` | 1 |
| `docs/13출시·마케팅/GAMEPLAY_TRAILER_V22_20260909.md` | 1 |
| `docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261008.md` | 1 |
| `docs/14밸런스+수치테이블/스킬_밸런스_리포트.md` | 1 |
| `docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md` | 2 |
| `docs/14밸런스+수치테이블/스킬데미지공식표.md` | 2 |
| `docs/15 세이브+데이터구조/15 세이브+데이터구조.md` | 4 |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md` | 1 |
| `docs/CHANGELOG_SYNC.md` | 22 |
| `docs/engine/FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md` | 6 |
| `docs/engine/FDG_GODOT_PORT_SAVE_SKILL_CONFIGURATION_RESTORE_FIRST_20261014.md` | 1 |

`docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md` was excluded and not accessed. The regen doc's provider table still says `in_holy_dome` is a **gap**. Updating that line to point here is a central ENGINE docs sync item and was not edited here.

## Checkpoint

Only the three new files above were written. There are no Git, settings, shared doc, World, Player or other module changes. Commit and sync are left to the central ENGINE checkpoint.


## 첫 유효 실행 ledger / 실제 소비 경계

| 그룹 | 검사 수 | 최초 유효 결과 |
|---|---:|---|
| G01 source_literals | 9 | PASS |
| G02 missing_authority_not_ready | 42 | PASS |
| G03 falsy_and_non_array_shapes_false | 73 | PASS |
| G04 strict_type_boundary_no_extra_gates | 66 | PASS |
| G05 forward_first_match_short_circuit_throw | 35 | PASS |
| G06 js_numeric_coercion | 76 | PASS |
| G07 lifecycle_live_no_mutation | 38 | PASS |
| G08 regen_boundary_isolated_sink | 30 | PASS |
| G09 explicit_only_no_clock | 14 | PASS |
| 합계 | 383 | 고유9그룹 PASS |

새 actual `resource_regeneration_source.advance_native(1.0, guard)` 호출8회 = 유효 false/true/경계/absent/beam5회 + G authority null/source-zone TypeError/clear3회. 최초5회는 실제 격리 resource sink가 총5 packet/10개 st·mp 값을 기록했다. 부재3회는 `provider_not_bool:in_holy_dome`로 dispatch0이며 fixture 자원값을 바꾸지 않았다. predicate의 clock 진전0, regen에 명시 공급한 native tick operand 총8(실제 적용5, 거부3). 자동 physics/process/render·원 effect clock·P/nativeHP live 주입·public play·pixels·GPU·minimum1080p240 관측0. SKILL holyDome 발동/수명/삭제/flatHP/shieldregen/damage/renderer는 구현하지 않았다.

실제 Claude CLI 기본 모델 `claude-opus-5-5`, session `c7a54c8a-15dd-4649-a859-7364f6551ae5`, PID7923, UTC2026-10-13T16:18:31.255091 시작, 395055ms. 모델 override/settings 변경0. restricted/dontAsk 및 Read/Glob/Grep+자기 신규3파일의 정확 Write/Edit만 사용, permission denial0/Bash·Agent·MCP·GUI0. 원 readonly producer/새fixture/newdoc는 실제 Claude 작성; test의 bool 타입 명시1줄과 첫 isolated 실행/이 receipt는 Codex executor다. 제품 코드의 실행 후 수정0이며 성공 자료는 동결한다.

수정 전 working+HEAD 부재/실 parent·symlink 확인 `backup-before-write.json`, 원 authored test bytes `test-before-parse-repair.gd`, receipt 전 자기doc bytes `doc-before-receipt.md` 및 `claude-stream.jsonl`/launch/prompt/stderr·`test-attempt1`/`test-attempt2`의 engine/stdout/stderr/report/launch는 외부 `E/godot-native-first/team-port/holy_dome_presence_source/`에 보관한다. shared World/Player/다른module/common docs/Git/server/shipping artifact/save/userdata/human paused 화면 수정·조작0, 기존 PNG copy/hash/import0.

현재 관련 keyword 검색의 전용 `keyword-doc-matches.json`은 총31경로(자기newdoc1+existing30)를 중앙에 인계한다. 위 작성 시 목록 외에 병렬 작성된 `docs/engine/FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md`가 현재 매칭된다. exact excluded marketing 미접근/2_3 immutable, 기존 공통 docs 수정0. ENGINE이 실제 current G/P getter와 다른4개 rates 공급자/원 resource phase를 1회 연결하고 공통 docs 현재값 동기화+정상 code/docs checkpoint를 마감한다. 이 독립 reader 통과를 실제 Main/full8/wholeGodot/시각/240 완료로 승격하지 않는다.

## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

# FDG Godot Port — fusion_star_source FIRST (2026-10-13)

TASK `GODOT-PORT-FUSION-STAR-SOURCE-FIRST-20261013` · 상태 **독립 readonly `_fuseStar(skId)` 공급자 / 최초 유효 6그룹 99검사 PASS (초기 parse INVALID 1회)** · 실제 Main 현재 P holder 설치는 미완(BUILD/ENGINE).

이 모듈은 원 `_fuseStar(skId)`의 **현재 getter → 원 lookup/default 반환**만 포팅한다. 수동 호출형 RefCounted이며 자체 clock, 캐시, RNG, 쓰기는 없다. 반환 계약은 기존 [holy_dome_flat_heal_source](FDG_GODOT_PORT_HOLY_DOME_FLAT_HEAL_SOURCE_FIRST_20261013.md)의 `fuse_star_reader(skId) -> {status:READY, value:finite, reason}`과 같다. 해당 문서가 Main gap으로 기록한 "production `_fuseStar('holyDome')` reader"의 공급 측이다.

## Module paths

| path | role |
|---|---|
| `godot/port_modules/fusion_star_source/producer.gd` | 원 `_fuseStar` 현재값 공급자 + 불변 source 테이블 부분집합 (new) |
| `godot/port_modules/fusion_star_source/test_first.gd` | isolated tests G01–G06 (`--only` / `--report`) (new) |
| `godot/port_modules/equipment_affix_reader/producer.gd` | `js_truthy` (readonly 재사용) |
| `godot/port_modules/holy_dome_flat_heal_source/producer.gd` | 소비자. 테스트 체인에서만 readonly 사용 |
| R `game.html:44855-44888`, `44984-45017`, `45019`, `45027-45032` | original source (read-only) |

기존 production 탐색 결과: `_fuseStar` 구현체, `_FUSE_PAIRS`/`_FUSE_GEM_GROUPS` 상수 테이블은 없었다. `save_adapter/skill_restore_authority.gd`의 `pairs`/`groups`는 외부 `skill_restore_metadata` reader에 의존하며 그 공급자가 production에 없다. restore 전용이기도 하므로 재사용하지 않았다. `slam_storm_blast`/`detonate_blast`의 `fuse_star` stat은 **raw 숫자**를 기대하며 이 모듈의 구조화 반환과 계약이 다르다(바인딩하지 않음).

## Source (exact)

```js
const _FUSE_GEM_GROUPS={ dimBreach:{...,skills:[...]}, sixFuse:{...,star:2,...}, ... timeStep:{...,star:2,...} }; // 44855-44888
const _FUSE_PAIRS={ dimBreach:['chargeBoost','magicBlink'], ... timeStep:['timeWarp','ghostWalk'] };               // 44984-45017
function _isFused(key){return!!(P._fused&&P._fused[key])}                                                         // 45019
function _fuseStar(skId){
  if(!P._fused)return 0;
  let _max=0;
  for(const[k,v]of Object.entries(_FUSE_PAIRS)){if(!_isFused(k))continue;if(!v.includes(skId))continue;
    const _s=(_FUSE_GEM_GROUPS[k]&&_FUSE_GEM_GROUPS[k].star)||v.length;if(_s>_max)_max=_s}
  return _max;
}                                                                                                                  // 45027-45032
```

두 테이블은 원에서 `const`이며 재대입·변경 지점이 0이다. 그래서 불변 상수로 보존한다.

## Source table subset

- `FUSE_PAIRS`: 32 key이며 원 선언 순서와 값 배열을 그대로 보존한다. 멤버십은 `_FUSE_GEM_GROUPS.skills`가 아니라 이 배열로 판정한다(원 동일).
- `GEM_GROUP_STAR`: lookup에 쓰는 **key 존재 + `star` 필드만** 보존한다. color/tier/minLv/skills/hidden은 비소유이다. 원 32그룹 key가 `_FUSE_PAIRS` 32 key와 일치하므로 `_FUSE_GEM_GROUPS[k]&&` 가드는 항상 통과한다. 결과는 `star||v.length`이다.

| group | `star` | `v.length` | 결과 star |
|---|---|---|---|
| sixFuse / bladeEcho / dualScarecrow / thunderGhost / timeStep | 2 | 2 | 2 |
| siegeGhost | 3 | 2 | **3** (star 우선) |
| stormBeam | 4 | 6 | **4** |
| stormBurst | 5 | 7 | **5** |
| plagueVenom / holyWeak1 | 4 | 4 | 4 |
| holyWeak2 / holyWeak3 / holyWeak4 | 5 / 6 / 7 | 5 / 6 / 7 | 5 / 6 / 7 |
| 그 외 19그룹(dimBreach…dimBlast, elemFuse, whirlDet, slamStorm, bladeFuse, iceMortar, boneStorm, elecRepent, shieldFuse, plagueFuse, holyFuse, holyIce, pillarSpike, pillarSlam, infernoSlam) | 없음(null) | 2–6 | `v.length` |

`holyDome`은 6개 pair(holyFuse 2, holyIce 3, holyWeak1 4, holyWeak2 5, holyWeak3 6, holyWeak4 7)의 멤버이다. 원은 `_getFuseKey`식 상위 대체를 하지 않는다. 그래서 여러 그룹이 동시에 융합이면 **최대값**을 쓴다(예: holyFuse+holyWeak4 → 7). 동률이나 더 작은 값은 갱신하지 않는다(strict `>`).

## Public API

| API | contract |
|---|---|
| `configure(current_player_reader: Callable) -> readiness` | borrowed 현재 P reader. RefCounted owner를 강하게 보유한다. 전역 setter는 없다 |
| `readiness()` | `{ready,status,missing[]}`이며 값 호출은 0이다. missing: `not_configured`, `current_player_reader` |
| `fuse_star(sk_id) -> Dictionary` | `{status,value,reason,branch,skill_id,member_groups[],fused_groups[],max_group,source}`. READY일 때 value는 int, NR일 때 value는 null |
| `fuse_star_reader() -> Callable` | `Callable(self,"fuse_star")`. `holy_dome_flat_heal_source.configure(..., fuse_star_reader, ...)`에 그대로 넘긴다 |
| `provenance()` / `source_tables()` | source ref, 소유 범위, 테이블 크기 / 테이블 deep copy(상수 별칭 노출 0) |
| `read_counts()` / `clear()` | `{calls,p,ready,not_ready}` / 바인딩·owner 해제 |

호출 1회마다 현재 P를 정확히 1회 읽는다. 원은 루프마다 `_isFused`로 `P._fused`를 다시 읽지만, readonly 안정 phase를 전제로 1회 읽기와 같다.

## Branches (원 분기 보존 + 진단 구분)

| 입력 | status / value | branch·reason |
|---|---|---|
| P에 `_fused` key 없음 (undefined) | READY 0 | `source_unfused_absent` |
| `_fused` = null / false / 0 / 0.0 / NaN / `''` | READY 0 | `source_unfused_falsy` |
| 비융합 + 미지 스킬 | READY 0 | `source_unfused_*` (원 순서대로 `!P._fused`가 먼저) |
| `_fused` Dictionary(빈 `{}` 포함, truthy) + skId가 어떤 pair에도 없음 | READY 0 | `source_unknown_skill` |
| pair 멤버이지만 융합 그룹 없음(값 falsy 또는 key 부재) | READY 0 | `source_no_fused_member_group` |
| 융합 멤버 그룹 ≥1 | READY `max(star\|\|length)` | `source_fused_max` + `max_group` |

`_fused[k]` 판정은 `AffixReader.js_truthy`이다(`!!`). 1, -1, 0.5, `'x'`, `'0'`, `{}`, `[]`는 융합이다. 0, 0.0, false, `''`, null, NaN은 비융합이다. `_fused`의 key는 pair key(`holyFuse` 등)이며 스킬 id(`holyDome`)가 아니다.

## NOT_READY / unsupported (value null, 중립 0 대체 없음)

| 입력 | reason |
|---|---|
| configure 전 / clear 후 | `not_configured` |
| player reader 누락 | `current_player_reader_missing` (**원 0과 구분되는 권위 부재**) |
| P가 null / Array / String / int / Object | `player_authority_null_or_unsupported` |
| skId가 String이 아님(StringName, null, int, Array) | `skill_id_unsupported_shape:<type>`. P read 이전에 판정한다. 원 호출자는 문자열 리터럴만 넘긴다 |
| `_fused`가 truthy 비Dictionary(true, 1, `'x'`, Array, Object) | `fused_unsupported_shape:<type>`. 원 primitive에 해당 pair 프로퍼티가 없으면 0이지만, Array/Object의 named property·accessor·prototype 결과는 상태에 따라 달라질 수 있다. 이 port는 그 조회를 지원하지 않고 NR로 보고한다 |
| `_fused` Dictionary에 StringName key | `fused_key_unsupported_shape:StringName`. String/StringName 별칭 판정을 날조하지 않는다 |

소비자(holy flat)는 `status=="READY"` + 유한 value만 인정한다. 위 NR은 `fuse_star_not_ready:<reason>`이 되며 skillBoost read와 HP sink는 0이다.

## 비소유 (not implemented here)

`_fuseMul`(=`detonate_blast.fuse_mul` 재사용, chargeBoost/magicBlink 분기 포함 비소유), `_eqAffix('skillBoost')`, grit/crystal, `P._fused` 생성·restore·마이그레이션(save_adapter), `_getFuseKey`/`_skInnateStar`/`_allFuseGemGroups`/`_gemHtml`, 스킬 registry, Player/World/INV 본체. Native60과 Q-only blackBean/E 금지 사항은 그대로이며 손대지 않았다.

## Tests

`godot --headless --path <isolated fixture> --script res://port_modules/fusion_star_source/test_first.gd -- [--only=G0x[,G0y]] [--report=<json>]` → exit 0 PASS / 1 FAIL / 2 INVALID(unknown group 또는 group script error). report: `result, groups_requested, groups_completed, script_errors, checks, failed`.

fixture는 순수 `.gd` 6개이다. 신규 2개와 readonly production 4개(holy_dome_flat_heal_source, holy_dome_presence_source, equipment_affix_reader, detonate_blast)로 구성된다. 이전 테스트, PNG, import, UI, 서버, 저장소는 0이다. star 대체 fixture reader는 없으며 체인은 실제 신규 provider를 사용한다.

| group | 내용 |
|---|---|
| G01 binding_readiness | RefCounted이며 clock 없음. unconfigured NR. reader 누락 → readiness + `current_player_reader_missing` NR. readiness read 0. provenance 32/32. `fuse_star_reader()` Callable. clear |
| G02 unfused_branches | `_fused` 부재 / falsy 6종 → 0. 비융합이 미지 스킬 판정보다 먼저. `{}` → 루프 0, holyDome 멤버 6. 미지 스킬 branch. 비멤버. 스킬 id key ≠ pair key |
| G03 pair_star_semantics | 20건 star(holy 2–7, 다중 융합 max, 순서 무관, stormBurst 5<7, stormBeam 4, siegeGhost 3>2, dimBlast 6 등). fused_groups 원 순서. truthy 7종 / falsy 6종 값. key 순서. snapshot 변경이 상수에 비전파 |
| G04 authority_type_edges | P 5종 NR. truthy 비Dictionary `_fused` 5종 NR. StringName key NR. skId 4종 NR(P read 0). 호출 사이 현재 `_fused` 변경 반영, P 제거 → NR(stale 0). 호출당 P read 1 |
| G05 holy_flat_chain | 실제 holder → 신규 provider → 기존 holy flat(실 presence + affix 0.1 + `fuse_mul`) → 고립 HP sink. 비융합 star0, holyFuse 2 / holyIce 3 / holyFuse+holyWeak4 7 → HP. `{}` → 0. Array `_fused` → 소비자 NR(sink 0, boost read 0). provider 권위 누락 → 소비자 NR. hp≤0, outside → provider 호출 0 |
| G06 retention_readonly | 소비자가 provider/holder를 강하게 보유. `fuse_star` ×3에도 P 쓰기 0. 1회 적용 후 `_fused` 불변. 소비자 clear → 체인 해제. provider 자체 holder 보유/해제 |

fixture 피연산자(hp 50/mhp 100, skillBoost 0.1, sp 1, lv 기본 1)는 기술 값일 뿐 제품 값이나 Main readiness가 아니다.

### Result

**최초 유효 결과: 6그룹 / 99검사 PASS.** 실제 Claude는 신규 3파일을 작성했고 Bash 권한은 없었다. Codex executor가 새 fixture를 실행했다. 성공 군 반복, 이전 테스트 실행, 제품 수리는 0회다.

| attempt | 결과 | 실제 실행 | 수리 / 시간 |
|---|---|---|---|
| 1 | **INVALID** (raw exit 0을 PASS로 채택하지 않음) | `test_first.gd:340` Variant 기반 `weakref` 타입 추론 parse error. 그룹 0 / 검사 0 | SCRIPT ERROR 1 + load ERROR 1. 0.509432875초 |
| 2 | **첫 유효 PASS** / exit 0 | G01–G06 전부 완료 / 99검사 / failed 0 / script_errors 0 / stderr 빈 값 | 검사 선언 1줄 `var wr: WeakRef = weakref(hw.h)`만 수리. 제품 수리 0. 0.501043125초 |

| 유효 고유 group | 검사 수 |
|---|---:|
| G01 binding_readiness | 10 |
| G02 unfused_branches | 13 |
| G03 pair_star_semantics | 37 |
| G04 authority_type_edges | 20 |
| G05 holy_flat_chain | 12 |
| G06 retention_readonly | 7 |
| 합계 | **99** |

G05/G06은 기존 `holy_dome_flat_heal_source.advance_native(1)`를 **10회** 소비했다. 실제 고립 HP sink 대입 **6회**, NOT_READY **2회**(미지원 _fused Array / current reader 부재), 원 guard skip **2회**(HP 0 / 영역 밖)를 구분했다. 공급자 거부는 skillBoost 조회와 HP 쓰기 전에 멈췄다. 회복량은 별도 star 대체 reader 없이 실제 현재 P → 신규 `fuse_star` → 기존 presence/affix/holyflat/`detonate_blast.fuse_mul` → HP sink로 계산됐다.

명시 회복 tick 피연산자는 10회 모두 1이다. 신규 공급자 자체 native clock, 자동 physics/process driver, render/RNG는 0이다. 이 SceneTree 검사는 `_initialize`에서 실행·종료하며 frame await 0이다. 실제 공개 play/pixel/GPU/연속 FPS/최저사양 240 검수는 하지 않았다. 첫 격리 fixture는 pure `.gd` 6개(신규 2 + readonly production 4)이며 원 PNG copy/hash/import 0, userdata 쓰기 0, GUI/server/export 0이다.

외부 proof 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/fusion_star_source/`. `test-ledger.json`, `test-attempt1.json`, `test-attempt2.json`, 각 stdout/stderr와 `handoff.json`으로 이력을 인계한다.

실제 Claude CLI: PID **24098**, session **3349b7d9-def8-442e-83d3-18adb1587c1c**, configured default **claude-opus-5-5**, `restricted` / `dontAsk`, 정확 신규 3파일 Write/Edit만 허용. 324140ms, 권한 거부 0. 모델 변경·권한 확대·Bash/MCP/Agent/settings 우회 0. 원 code/test 최초 작성은 Claude, parse 선언 1줄과 이 결과 기록은 Codex executor이다. 이 문서는 PASS를 주장하지 않는다.

## Remaining installation needs (not claimed)

| need | owner |
|---|---|
| 실제 Main 현재 P holder(`_fused` 포함)의 생성·restore와 그 reader를 `configure(current_player_reader)`에 연결. presence/holy flat과 **같은** P reader | BUILD / ENGINE |
| Main Player가 Dictionary가 아닌 Object/Node이면 이 모듈은 NR이다. 같은 Dictionary view reader 또는 별도 adapter가 필요하다 | ENGINE |
| holy flat `readiness()`는 Callable 유효성만 본다. provider의 `readiness()`도 함께 확인해야 한다(누락 시 tick에서 `fuse_star_not_ready:current_player_reader_missing`) | ENGINE |
| `_fused` key가 StringName인 Main 상태는 미지원이다. String key 상태를 공급해야 한다 | ENGINE / SAVE |
| `detonate_blast`/`slam_storm_blast`의 raw 숫자 `fuse_star` stat 바인딩(구조화 status→숫자 변환 adapter는 NR 정책 결정 필요) | ENGINE / SKILL |
| `_fuseMul` chargeBoost/magicBlink 분기 소비자 | SKILL |

이 최초 constructor 소비 검사는 Main, 전체 stats, play, public pixel, GPU, 240FPS, 성능 완료가 아니다.

## Checkpoint

- **작성 경로:** 신규 3경로만 작성했다(producer, test_first, 이 doc).
- **수정 0:** 기존 module, Player, World, 공통 docs, 2_3, marketing, settings, assets, saves는 수정하지 않았다. Git(stage/commit/revert), 서버, 저장소, GUI, 네트워크 변경 0건이다. Claude의 명령 실행 권한은 0이며 Codex executor는 위 신규 Godot 2attempt만 실행했다.
- **읽은 source:** `game.html` 44850-45035 국소(테이블, `_isFused`, `_fuseStar`)와 holy flat doc/code/test, 재사용 helper 시그니처뿐이다. 전체 source, frozen16, 이전 assets/tests/proofs 감사는 0이다.
- **선행 확인:** 신규 3path의 working/HEAD 부재와 nearest existing real parent를 외부 `prewrite.json`에 기록했다. 타인 변경·symlink 교체·Git 수정 0이다.
- **관련 docs 검색:** Codex executor는 `rg -l` 검색 첫 범위부터 `--glob '!**/INGAME_CAPTURE_STUDIO_20261009.md'`를 적용했다. 2_3는 immutable이고 shared 문서는 편집하지 않았다. 정확 목록은 외부 `keyword-doc-matches.json`으로 인계한다. 이전 crystal 검색 편차는 그 scope receipt에만 기록되며 이번 검색에 반복되지 않았다.
- **ENGINE 인계:** 공통 docs 현재 상태 동기화와 normal code+docs checkpoint는 ENGINE 소유다. 특히 holy flat 문서의 production 공급자 부재 표현은 공급자 작성·첫 소비 완료 / Main binding 미완으로 분리해야 한다. detonate/slam raw numeric reader gap과 save skill restore holder 권위는 계속 구분한다.

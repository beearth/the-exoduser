## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

# FDG Godot Port — player_grit_source FIRST (2026-10-13)

TASK `GODOT-PORT-PLAYER-GRIT-SOURCE-FIRST-20261013`
Status: **readonly current `_grit` authority adapter + SourceParameters PROVIDER_GRIT 소비 경로 작성 / first execution 3 groups / 114 checks PASS** · 실제 authority 소유·restore·Main 설치 미완

## 1. Owned files (these 3 only)

| File | Role |
|---|---|
| `godot/port_modules/player_grit_source/producer.gd` | 현재 `_grit` authority 읽기전용 reader + `PROVIDER_GRIT` Callable |
| `godot/port_modules/player_grit_source/test_first.gd` | 격리 first test (SceneTree, `--only`) |
| `docs/engine/FDG_GODOT_PORT_PLAYER_GRIT_SOURCE_FIRST_20261013.md` | This doc |

Shared Player/World/progress/STATS/save_adapter/SourceParameters/Cref/Affix/common docs/CHANGELOG/Git 편집 0. 완료된 player_resource_parameters_source(7그룹/66검사)는 frozen, 읽기만 했다.

## 2. Original field and provenance (canonical `exoduser-migration-20261001/game.html`, read-only)

| Kind | Original | Line | 이 모듈 처리 |
|---|---|---|---|
| init | `let _grit=0; // 근성 레벨` | 28556 | `source_boot_grit()` 만(`SOURCE_BOOT`, current=false, ready=false). READY/fallback/Main 준비로 쓰지 않음 |
| consumer | `_gritTotal(){return (+_grit\|\|0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR')}` | 28559 | **재구현 0** — SourceParameters `_grit_total()` 소유. 여기서는 raw `_grit` 만 공급 |
| restore | `_grit=d.grit\|\|0;` + `if(_grit>0&&!d.gritCostModeV2){…P.sp+=_refund}` | 4101-4102 | **BUILD, Godot 미구현** (아래 §5). 구현/수정 0 |
| save | `grit:_grit,gritCostModeV2:1` | 3940, 62671, 64352, 64508 | 범위 밖 (save_adapter `pack` 이 context.grit 을 받음) |
| writers | refund `_grit=0`; applyPlan `_grit=next.grit`; 단일 투자 `_grit=next.value` | 51677, 51710, 51729 | BUILD. setter 0 |
| display | `Lv.${_grit+_lb2}` | 51799 | 범위 밖 |

결론: raw `_grit` 는 위 대입으로만 바뀌는 **독립 전역 scalar** 이다. STATS/P/PASSIVES/INV 에서 파생되지 않으므로 파생을 발명하지 않았다.

### 기존 production authority 탐색 결과 (narrow)

- `godot/**/*.gd` 의 grit 언급: `save_adapter/producer.gd` (`CONTEXT_REQUIRED` 의 `grit`, `pack`→`data.grit`, `consume` 스키마 검사 — caller-owned snapshot, live restore 아님), `save_adapter/save_session_consumer.gd` (`PENDING_STAGES` 의 `"stats/passives/legacy refunds/grit after inventory"` — 미구현), `player_passives_source/producer.gd` (`grit_sp_refund` 제외 주석), SourceParameters (`PROVIDER_GRIT` 소비자). tests 는 열지 않았다.
- **현재 `_grit` 값을 보유/공개하는 production authority 또는 restore mapping 은 없다.** 따라서 이 모듈은 상태를 복제하지 않는 reader adapter 로만 만들었고, 실제 값 보유자는 BUILD 가 설치해야 한다.

## 3. Public API (`producer.gd`, `extends RefCounted`)

| API | 설명 |
|---|---|
| `static source_boot_grit()` | 원 init literal 0 + provenance. `SOURCE_BOOT`, current/ready=false |
| `configure(reader: Callable, field := "_grit", label := "") -> Dictionary` | reader() 는 현재 authority 컨테이너(Dictionary 또는 Object)를 반환. RefCounted owner 강하게 보관. readiness 반환 |
| `clear()` | 바인딩 해제(owner 해제) → NOT_READY |
| `readiness()` | `{ready,status,missing,missing_upstream}` — reader 호출 없음. 바인딩 준비 ≠ 값 READY |
| `read_current_grit()` | `{status,ready,current,value,raw,raw_type,reason,provenance}` 매 호출 live 재읽기, 캐시·쓰기 0 |
| `provide_grit() -> Variant` | READY → `float`, 그 외 → `null` (SourceParameters `PROVIDER_GRIT` 계약) |
| `grit_provider() -> Callable` | `Callable(self,"provide_grit")` |
| `with_grit_provider(providers) -> Dictionary` | providers 복사본에 `grit` 키만 추가. 기존 grit provider 가 있으면 `grit_provider_already_bound` 거부(덮어쓰기 0) |
| `read_count()` | 진단 |

`provenance`: `{source:"game.html:28556 let _grit=0", consumer:"game.html:28559 …", restore:"game.html:4101 … — BUILD, Godot 미구현", field, authority:<label>}`.

## 4. Support subset / NOT_READY 경계

| 현재 raw | 결과 |
|---|---|
| 유한 int/float (0, 0.0, 음수 포함) | `READY`, `value=float(raw)`, `raw` 그대로. `(+_grit\|\|0)` 은 SourceParameters 가 적용 |
| 미바인딩 | `authority_unbound` |
| 알 수 없는 getter / 해제된 reader 대상 | `authority_reader_invalid` |
| reader 가 null 반환 | `authority_null` |
| 컨테이너가 Dictionary/Object 가 아님 | `authority_unsupported_shape:<type>` |
| Object 컨테이너 해제 | `authority_freed` |
| field 부재 (예: save 키 `grit` 만 있고 `_grit` 없음) | `field_absent:<field>` |
| field 값 null | `grit_null` |
| String/bool/Dictionary/Array 등 | `grit_unsupported_raw:<type>` (String/bool 만 raw echo, 컨테이너 raw 비노출) |
| NaN/±Inf | `grit_non_finite` |

모든 NOT_READY 는 `value=null`, `provide_grit()=null` → SourceParameters `grit_not_number:Nil` NOT_READY. **0 으로 채우지 않는다.** 실제 숫자 0 은 READY 이며 missing 과 구별된다.

Gap (보고만): 원 `+_grit` 는 truthy String/bool 도 숫자로 강제하고, 원 restore `d.grit||0` 은 truthy 비정상 저장값을 그대로 `_grit` 에 넣는다. 이 포트는 그 전체 coercion 을 지원하지 않는다(SourceParameters 계약도 current number 요구). NaN/Inf 는 JSON restore/정수 투자로 도달 불가로 보고 비지원. 원 `-0`/`+0` 구분 미재현.

## 5. 실제 authority — 아직 남은 것 (`MISSING_UPSTREAM`)

- `grit_authority` — 현재 `_grit` 를 소유하는 컨테이너와 reader 설치 (BUILD progress/STATS·SP 분배)
- `grit_restore` — `_grit=d.grit||0` + `!gritCostModeV2` legacy SP 환불(@4101~4102). save_session_consumer PENDING stage (BUILD)
- `grit_writers` — SP 투자/applyPlan/전체 초기화(@51677/@51710/@51729) (BUILD)
- `install` — SourceParameters providers 에 `provide_grit` 연결, applyStats/recalcSt 원 호출 지점, Main 설치 (ENGINE)

`source_boot_grit()` 는 이 중 어느 것도 충족하지 않는다.

## 6. First test (`test_first.gd`) — 3 groups / 114 checks PASS

실행: `godot --headless --script res://port_modules/player_grit_source/test_first.gd -- [--only g1,g2]`
Verdict: exit 0 = PASS(검사>0, 실패0, 선택 그룹 모두 완주) / 1 = FAIL / 2 = INVALID(검사0, 미지 그룹, 그룹 중단·0검사 그룹). stderr 에 `SCRIPT ERROR`/parse error 가 있으면 exit 와 무관하게 INVALID.

| group | 작성 검사 수 | 내용 | 결과 |
|---|---:|---|---|
| `missing_vs_zero` | 42 | 미바인딩/boot(SOURCE_BOOT, readiness 불충족, provider 미충전)/unknown getter/null authority/scalar 컨테이너/`grit` 키만 있는 field 부재/null field/String·bool·Dictionary·Array/±Inf·NaN 전부 NOT_READY+null; 실제 int 0·float 0.0 READY(값 float 0, provide 0.0 ≠ null); 음수 통과 | first PASS |
| `current_lifecycle` | 32 | provenance(28556/28559/4101, field, label); live 재읽기 4→9→0(캐시 0); read_count; 반복 읽기 후 authority 불변/추가 키 0; `with_grit_provider` 복사·중복 거부; RefCounted authority 보관→`clear()` 후 해제(WeakRef); non-RefCounted authority `free()` → `authority_reader_invalid`; Object 프로퍼티 authority(READY/null/부재/빈 field); 독립 reader | first PASS |
| `pipeline_caps` | 40 | 실 `equipment_affix_reader`(eq_affix+캐시) + 실 `combat_reference_source`(eq_stat 캐시+lv_b) + 실 SourceParameters + 새 grit provider → 원 순서 sink. (a) field 부재: binding READY 여도 `grit_not_number:Nil`, dispatch 0, P 불변 (b) 실제 0: 순수 plan mmp 164 / mst 134 (c) 7: +7 정확(171/141) (d) 캐시 구축 후 ring1 bGrit 2→5·gritFlatN 3→6 in-place 변경 → `run_apply_stats` 1회: trace `apply_stats, invalidate_eq_caches, affix.invalidate_affix_cache, cref.invalidate_eq_stat_cache, recalc_st` (무효화 각 1회), grit 읽기 2회(원 호출 지점 2곳), P.mmp 171(phase1 stale)/mp 171/mst 147(무효화 후 재구축)/st 147, stR/mpR, write 순서·mmp 중간값 150→171, 재구축 Grit 5/gritFlatN 6, authority 불변 (e) 다시 부재 → plan NOT_READY, P 유지, dispatch 총 3 | first PASS |

First isolated execution: 3 unique groups / 114 checks PASS, raw exit0, 0.616233542 seconds, empty stderr/SCRIPT ERROR0; repair0 and success-repeat0. 기대값은 test 내부의 독립 원 constructor oracle(`~~(100+s.int*2+…)+pHuman*100+_gritTotal`, `~~(100+STATS.dex*2+…)+…+_gritTotal`, `_lvB=~~(lv*.5)`)과 리터럴 둘 다로 확인한다.

Fixture(제품값 아님): P{lv10,mp999,st999}, STATS{dex10,int20}, PASSIVES{}, INV ring1{bGrit, affixes gritFlatN}, necklace{affixes gritFlatR 4}, grit authority Dictionary. 결정/pHuman/pVital/pStamina/bonus/enh 0. 모든 provider 대상은 RefCounted 로 보관. live HP/위치/AI/clock/observer/저장 파일/전역·body setter/SP 소비/levelup/결정 생성/Main 설치 0. 이전 test/receipt/source16/PNG 미열람·미복사.

## 7. Related docs keyword search (handoff to ENGINE)

Keywords `_grit|gritFlat|player_grit_source`, `docs/` 전체(정확 basename `INGAME_CAPTURE_STUDIO_20261009.md` 제외·미접근, `2_3*` 폴더 수정 0). 13 files:

- `docs/CHANGELOG_SYNC.md`
- `docs/engine/FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md`
- `docs/14밸런스+수치테이블/14밸런스+수치테이블.md`
- `docs/7아이템디자인/아이템_어픽스_시스템.md`
- `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md`
- `docs/3.1 ui hud 디자인/능력치_패시브_개편_20260909.md`
- `docs/7아이템디자인/어픽스_시스템_현황분석_2026-08-10.md`
- `docs/7아이템디자인/어픽스_Layer_전수매핑_402_2026-08-10.md`
- `docs/7아이템디자인/어픽스_Layer_재분류_설계_2026-08-10.md`
- `docs/7아이템디자인/슬롯별_어픽스_풀.md`
- `docs/3.1 ui hud 디자인/PASSIVE_TREE_REDESIGN_20260909.md`
- `docs/12퍼포먼스·최적화/코드전수조사_디버그_최적화_2026-09-03.md`
- `docs/10ai에셋프롬프트모음/UI_아이콘_GPT_생성프롬프트팩.md`

직접 narrow grep: `14밸런스+수치테이블.md:131-147`, `능력치_패시브_개편_20260909.md:52`.
Drift (보고만, 공통 docs 편집 0): `14밸런스…:136` 은 `_gritTotal() = _grit + …` 로 적었으나 원은 `(+_grit||0) + …` (@28559). 같은 문서는 restore `d.grit||0`·legacy `gritCostModeV2` 환불(@4102)을 다루지 않는다. ENGINE 이 공통 sync 및 정상 code+docs checkpoint 를 담당한다.


## 8. First execution receipt / concrete consumer boundaries

| attempt | groups | checks | verdict | duration |
|---|---|---:|---|---:|
| 1 | missing_vs_zero / current_lifecycle / pipeline_caps | 42 / 32 / 40 = 114 | PASS / exit0 / stderr empty / SCRIPT ERROR0 | 0.616233542s |

No FAIL/INVALID, no execution-time code/test repairs, no success reruns, no old successful suite executions. The executor copied only owned2 plus necessary readonly4 production scripts (SourceParameters/Affix/Cref/Formula) into the external fixture-attempt1. No old test files or PNG/texture/import operations. Portable Godot4.7.2 / physics60 / Compatibility / dedicated userdir name EXODUSER-PlayerGritSource-Isolated-20261013; actual user save/QA files were not accessed.

The new pipeline explicitly invoked actual SourceParameters.run_apply_stats twice: missing current field blocked packet dispatch once; valid current numeric7 applied the original three phase packets once. The actual constructor resource sink consumed ordered applyStats8 field writes + recalcSt2 field writes, and executed Affix.invalidate_affix_cache then Cref.invalidate_eq_stat_cache exactly once each. Within that applied run the current grit authority was read twice at the original MP/ST call sites. Observed mmp171/mp171/mst147/st147 distinguish stale phase1 cache from rebuilt phase2 cache; original intermediate mmp150 was preserved. Pure plans with actual0 returned mmp164/mst134 and actual7 returned171/141, with no sink calls. A subsequent missing field returned NOT_READY while keeping the last applied P unchanged. Clock advance0 / automatic source dispatch0 / process/render0 / public play/pixels/FPS0. No literal default0 satisfied missing readiness.

Actual Claude CLI: default configured claude-opus-5-5, session0911e52a-bcb3-4944-abc0-fa970405aa62, PID12323, started UTC2026-10-13T17:08:05.075708, duration496323ms. Model override/settings change0; restricted/dontAsk with Read/Glob/Grep and exact owned3 Write/Edit only, denial0/Bash-MCP-Agent-GUI0. All producer/first test/source doc were written by actual Claude. Codex executor ran the first fixture and appended this receipt only; production/test edits after execution0.

Before launch, own working+HEAD absence/realparent/symlink were recorded in backup-before-write.json. The initial launcher had a stdin encoding parse error before any launch or file mutation; it was immediately corrected with an ASCII prompt. The actual single Claude launch above is separate from that failed wrapper. Pre-receipt doc bytes are in doc-before-receipt.md. Actual CLI stream/prompt/launch/stderr and test-attempt1 stdout/stderr/engine/launch ledger are under E/godot-native-first/team-port/player_grit_source/.

Current provenance labels identify source declaration/call sites and caller-provided authority label; they are not proof that a saved payload was restored. No original grit restore consumer exists in native production yet, and no restored-grit case is claimed as an actual restore execution. Tests use explicitly named constructor current authority values. Source boot0 remains SOURCE_BOOT/current=false; this reader implementation does not install the missing current progress state, restore/refund, SP investment, Main caller or source global publisher.

Latest whole-keyword paths are recorded in keyword-doc-matches.json (including this new doc). Exact excluded marketing basename was not accessed and 2_3 documents stayed immutable; common docs edits0. Shared/Git/server/shipping/main/save/API/userdata/human paused screen changes0. ENGINE/BUILD must install actual current _grit authority and writers/restore, then bind the readonly public grit_provider into SourceParameters and complete source call-site/common-doc synchronization plus normal code+docs checkpoint. Full Main/restore/progress/240 readiness is unclaimed.

## actualMain 소비 상태 — 2026-10-14

원 producer는 실제 SourceState/SourceResources와 providerbundle10에 연결된다. actualMain 첫고유5그룹145는 처음성공4/132+fixture SCRIPTERROR consumer만13수리재검한이력이며 원독립source 성공검사는재연하지않는다. 실제초기아이템15equip+10bag/currentrawGrit0·getter·원currentCRef/Formula/Affix를소비하지만 전체파생/applyStats/fullbootstrap/actualsave복원·투자·환불/화면·240FPS는아직미완이다. 최신중앙SSOT는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md다. 아래producer의원수치·과거검증이력은보존한다.

# Godot actual raw grit holder·복원·SP writer 최초 소비 — 2026-10-14

TASK `CODEX7-GODOT-BUILD-RAW-GRIT-RESTORE-FIRST-20261014` / COMPLETION `RAW-GRIT-RESTORE-FIRST-20261014-C1`.

신규 `raw_grit_restore.gd`는 실제 자기 소유 `_grit` container를 가지며 getter/restore/plan commit/refund commit writer를 제공한다. ROOT readonly player_grit_source가 이 객체의 current_container Callable을 정상 configure하여 실제 변화0→3→5→0을 읽었다. `_gritTotal` 계산을 구현하지 않았다. actual isolated holder instance와 production Main singleton/publisher 연결은 구별한다.

첫 유용 tool `4f9578`(경로부재/parent/중복), source `96a844`/`3ef6d4`/`dc0f25`, 구현 `496854`, 최초 결과 `9f9e69`, 나머지 최초 결과 `6a3144`. 추가 helper 파일0. working+HEAD 부재·parent realpath/symlink 확인 후 신규3파일만 생성했다. 이전 composer10/다른 BUILD·ROOT3/114 자료·성공suite/원source SHA를 재검사하지 않았다. ROOT 코드/ledger/handoff는 수정0; 필요한 public method contract만 확인해 새 정상 caller가 소비했다.

## 원 naming·조건·순서와 실제 API

| 순서/id | 원 source 값·조건 | 실제 새 API/소비 위치 | 수치·Gate |
|---|---|---|---|
| source declaration | R/game.html:28556 `let _grit=0` | initialize(source_initialization) | 입력에 실제 _grit 필드가 있어야 소유 state를 초기화. missing을0/{}로 대체0 |
| raw/current | global _grit의 현재 scalar | current_container()/read_raw() | 초기화되면 stable 소유 Dictionary({_grit:raw}), 아니면null/notready. 현재 raw 타입을 그대로 반환 |
| restore | inventory/passive migration 뒤 `_grit=d.grit||0` | restore(serialized,caller_player) | 초기화된 source holder에만 원 fallback 적용. source current getter가 바뀐 값을 즉시 읽음 |
| legacy spent | `_grit>0 && !d.gritCostModeV2`; legacySpent=_grit*3+((_grit−1)*_grit)/2 | restore legacy branch | source 원 비용 산식만. ROOT total/장비bonus/추가근성 계산0 |
| legacy refund | refund=max(0,legacySpent−_grit); refund>0이면 `P.sp+=refund` | raw 대입 이후 SP 대입 | grit3이면9 SP 환급. v2 marker truthy이면 추가0; marker를 새로 써서 조건을 바꾸지 않음 |
| plan evaluation | source renderStatPanel.applyPlan→ExoduserStatsPanel.evaluatePlan | caller evaluator(plan,live) Callable | plan 계산/스탯/PASSIVES/cost를 새 GDScript로 복제0 |
| plan prefix | 원 queue filter·Object.assign STATS/PASSIVES | caller before_commit(next,live) | caller authority 준비 필수. 원 prefix 없는 것을 no-op/중립 성공으로 채우지 않음 |
| owned plan writes | `_grit=next.grit;P.sp=next.sp;P.ap=next.ap` | apply_plan | exact 대입순서. changes 없으면 미적용. 이후 passive투자/stat/UI/SFX/save pending |
| refund authority | source confirm 뒤 live refundTotals 재평가·safe integer SP/AP 검사 | refund_authority(live) | 원 승인 totals만 소비. 0..9007199254740991 정수 범위, 안전하지 않으면 미적용 |
| owned refund writes | P.sp+=refund.sp; P.ap=(P.ap 또는0)+refund.ap; STATS/PASSIVES clear; `_grit=0` | refund_all + clear_allocations callback | SP/AP→caller allocation clear→raw0 순서. clear 실패면 late partial 상태를 명시 |
| ROOT reader | configure(currentContainerReader,field=_grit,label)→read_current_grit | 기존 public API normal caller | numeric finite0도READY. raw string은 strict subset NOT_READY, 원raw를 숫자로 덮지 않음 |
| ROOT provider | provide_grit/grit_provider/with_grit_provider | 기존 public API normal caller | 소유 writer 변화 반영; _gritTotal 호출/복제0 |
| unpublish | 소유 객체의 publisher 수명 종료 | unpublish | getter null, ROOT notready. 없어진 publisher를 마지막0 값으로 캐시하지 않음 |

initialize는 source 선언 입력으로 최초1회만 허용한다. raw holder 내부 상태는 실제 변경되며 입력 dictionary/ROOT getter에 record packet만 보냈다고 주장하지 않는다. current_container는 현재 소유 reference를 반환한다; ROOT reader는 readonly로 읽는다. 이 public accessor의 live Main 연결은 ENGINE 책임이다.

restore의 caller SP가 필요한데 없으면 raw 대입 뒤 partial/notready다. raw 값의 source truthiness/숫자 연산과 제한적 JS string addition을 지원한다. 전체 JS valueOf/prototype/모든 숫자문법·비JSON coercion은 미지원이다. ROOT reader의 numeric subset은 이 module이 widening하지 않는다. 같은 old marker-less serialized를 다시 복원하면 source처럼 환급을 다시 더할 수 있으며 새 idempotency marker/임의 수정0이다.

## Public caller

```gdscript
var holder = preload("res://port_modules/save_adapter/raw_grit_restore.gd").new()
var current = preload("res://port_modules/player_grit_source/producer.gd").new()
holder.initialize(caller_source_declaration) # 원 _grit 필드0의 명시 입력
current.configure(holder.current_container, "_grit", "caller-owned raw grit")
var loaded = holder.restore(serialized_snapshot, caller_player)
var root_value = current.read_current_grit()
var applied = holder.apply_plan(plan, caller_player, caller_allocations, central_evaluate_plan, central_before_commit)
var refunded = holder.refund_all(caller_player, caller_allocations, central_refund_totals, central_clear_allocations)
```

모든 writer는 ready/applied/reason/partial/main_connected=false를 구분한다. caller player/allocations와 authority는 필요 field가 있어야 한다. plan/refund 원 계산 authority를 missing에서0 결과로 대체하지 않는다. UI confirm/원 live state 재조회·공유STATS/PASSIVES/queue 투자/statcap/원save 실행은 중앙 callback/tail Gate다.

## 실제 원 승인 authority·새 최초 case ledger

새 JS 준비는 실제 source 선언0과 grit restore 두 문장만 synthetic d/P에 실행하고, 실제 R/stat-panel-ui.js의 공개 createPlan/evaluatePlan/refundTotals API를 fresh fixture 입력에 호출했다. 기존 ROOT _gritTotal/native live/game/UI 실행0이다. 정상 두 case의 원 source plan은 빈 stats/passives/queue에서 raw grit3→5만 변경하므로 prefix/clear callback이 empty-vector no-change 계약을 실제 검증했다. 이것은 현재 production planner/공유 allocation writer 연결이 아니라 fixture authority다.

| case | 최초 checks | source 실제 값 | 결과 |
|---|---:|---|---|
| legacy_sequence | 12 | 초기0; 복원grit3/SP9→18(legacy+9); plan grit5/SP16; refund grit0/SP21/AP4 | PASS/exit0, ROOT 각 단계 현재값 확인 |
| marker_sequence | 12 | v2 marker1: grit3/SP9 유지; plan5/SP7; refund0/SP12/AP4 | PASS/exit0, legacy refund0 |
| raw_string | 6 | source raw 문자열3 보존, legacy SP18 | PASS/exit0, ROOT numeric subset notready·강제 숫자화0 |
| missing_holder | 2 | source 초기화 _grit 필드 없음 | PASS/exit0, getternull/ROOT·restore notready/player그대로 |

총32개 새 고유 검사, native 각 case 최초1회/4회, 수리·성공case재실행0. 두 정상 case마다 source-approved plan1/refund1, rootGetter/provide/provider wrappers가 actual current holder를 소비했다. HP71/공유state·전투/clock/skills 바꾸지 않았다. lifecycle 끝에서 ROOT getter/provide notready/null을 확인했다. Root old3/114·이전 save/skill session cases는 재연하지 않았다.

입력은 처음부터 case별 input.json/input-original.json으로 독립 byte 보존했다. 준비 시 expected_restore.player reference가 후속 source plan/refund에 의해 변경된 오류를 native 실행 전에 발견해, 이미 captured source plan_live의 SP/AP로 v2 기대 snapshot을 바로잡았다. v1 input bytes는 그대로 보존, 실제 실행 input-v2.json과 독립 input-v2-original.json도 사전 보존했다. source plan/refund API를 수리 후 재실행하지 않았으며 preparation-annotation.json에 기록했다. 원 Node sourceAPI 호출2/2만이다. case별 output-first/stdout/stderr/godot log/ledger를 분리했으며 raw 덮어쓰기/재생성0이다.

Godot4.7.2 portable headless SceneTree explicit 호출. auto physics0/render0/actualMain publisher0/publicpixels·visual0/CoreAudio·청취0/Windows0/최저240 측정0. FileAccess/log는 자기 신규 E/raw_grit_restore/cases 절대경로만. user URI/HOME/OS/sharedproject 설정0. source/current holder state는 실제 새 객체지만 Main/global Player/G 설치나 world/phase 연결은 하지 않았다. engine 내부 user-dir resolution/전체 OS syscall 감사 미실시.

## 소유·current-value 인계·미완

시작 parent `6b771b118cf95ea9f2ad15a21869cad7a3708a8a`. 완료 parent/새3파일 최초 pins·realpath·own-hunk는 owned-receipt.json. 기존 코드/shared docs/R/Git/index/앱/server/원asset/import/기존source hash 재검사0. ROOT grit 계산/provider·free120pool·HPoverflow/holyDome·crystalResourceReader·combatref/regen/homing 및 shared Player/G/Stats/PASSIVES/INV는 변경0이다.

W/R 전체 allowed docs keyword 경로 목록은 docs-search-W/R.txt/json. 지정capture/held자료 read/search/채택0. current-value: `docs/15 세이브+데이터구조/15 세이브+데이터구조.md` grit 기본0/무한·gritCostModeV2:1 저장·legacy환급; `docs/3.2메타·진행시스템/3.2메타·진행시스템.md` 근성1SP/lv·전체환불 source51 안전검사; 원 game applyPlan/Refund SP/AP/raw순서와 stat-panel-ui 공개 evaluator. 공유docs 정상 checkpoint는 ENGINE에 인계하며 수정0이다.

actual raw holder/getter/restore writer 코드는 이제 이 신규 경로에 존재하며 isolated 객체가 ROOT readonly reader로 소비됐다. production singleton/Main current-holder/restore publisher 및 production plan/refund authority·allocation callback는 여전히 미연결이다. missing production을fixture holder나readonly ROOT가 자동채웠다고 하지 않는다.

미완: actual Main/raw publisher/world/phase·production evaluator/refund/공유allocation writer·passive queue/statcap/UI/confirm/save tail·완전 JS coercion·전체restore/계정userdata·public pixels/CoreAudio/청취/Windows/최저240. ROOT _gritTotal 계산 인수나 전체 Player 준비 완료로 승격0.

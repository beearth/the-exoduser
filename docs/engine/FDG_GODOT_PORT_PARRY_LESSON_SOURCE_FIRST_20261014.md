## 실제 Main lesson file-init/current guard 연결 — 2026-10-14

실제 Main은 World/Player를 생성하기 전에 원 lesson holder를 만들고 Root publish_file_init을1회 소비한다. 원 SOURCE_BOOT/current=false 7개 partial 필드는 입력 이력으로 유지하고 실제 published current guard를 별도로 읽는다. Main wrapper LIVE Callable은 cold에서 null/NOT_READY이며 현재 holder의 게시·교체·철회를 따라간다. 실제Main을 해제하면 wrapper Callable이 무효가 된다. 외부가 강하게 보유한 Root holder의 수명과 Main 권위는 구분한다.

새 실제Main FIRST3그룹30(13/10/7) /4.374504333초/exit0/FAIL0/SCRIPT0/Parse0/ERROR0, Camera2D warning1 보존. production/test수리0, 이전117/145/88/71/원lesson7/137 재연0. 교체2→3/revoke는 명시 actualholder public-test publisher이며 원전체controller 자동진행을 뜻하지 않는다. 현재source G.on=false/pre_stage, controller.tick/start/UI/skipKey/reset/storage/G activation/updategate/HPSTMP automatic은 아직 미연결이다. 최신 API/검증은 FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md 및 FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md를 따른다. 아래독립helper/과거인수 상태는 역사로 보존한다.

# FDG Godot Port — parry_lesson_source FIRST (2026-10-14)

`native_source_player_regeneration_phase.gd`의 `services.lesson`은 인자 0 Callable → `{parry_lesson_active:bool, active일 때 parry_lesson_chapter:int}`를 요구하지만, 이를 공급하는 실제 NativeMain publisher가 없다. 이 단위는 원 `window._parryLesson` 현재 singleton을 보유하는 holder/publisher와 guard reader를 만든다. 실제 NativeMain 설치와 lesson 전체 lifecycle은 ENGINE 몫이며 여기서 증명하지 않는다.

**현재 상태 (2026-10-14, frozen).** 첫 유효 실행에서 7그룹 137 checks가 모두 PASS했다(exit 0, SCRIPT ERROR 0, ERROR 0, stderr 0). 실행 후 product/test 수정은 0이다. 이 결과가 증명하는 범위는 독립 current holder의 준비 완료까지다. 실제 Main publisher·설치, HP/UI, 공개 플레이, GPU/240FPS는 검증하지 않았다. source 쪽 Window 상태인 uncreated/unset/falsy는 MISSING(NOT_READY)과 독립적으로 구분되며, false fallback이나 Main READY 생성은 없다.

## Keyword paths

| Path | Role |
|---|---|
| `godot/port_modules/parry_lesson_source/producer.gd` | current lesson holder / publisher / guard reader (RefCounted, `class_name` 없음) |
| `godot/port_modules/parry_lesson_source/test_first.gd` | 신규 테스트 7그룹 (`-- --group=NAME`, 마지막 줄 JSON summary) |
| `docs/engine/FDG_GODOT_PORT_PARRY_LESSON_SOURCE_FIRST_20261014.md` | this doc |
| `godot/port_modules/resource_regeneration_source/producer.gd` | 소비자 Natural (read-only; public `configure_source_rates`/`advance_native`만 사용) |
| `godot/scripts/native_source_player_regeneration_phase.gd` | `services.lesson` 소비자 (ENGINE; 미편집, 미열람) |
| `godot/port_modules/equipment_affix_reader/producer.gd` | 기존 공개 `static js_truthy(v)->bool` (read-only preload로 재사용, 미편집) |
| R `parry-lesson.js:1-16, 386-407, 685-700` / R `resource-practice.js:40-46` / R `game.html:33360, 62708, 64423, 32200` | 원 source (read-only, R = `exoduser-migration-20261001`) |

## Source

| Ref | 원문(요지) | 이식 |
|---|---|---|
| game.html:33360 | `if(!(window._parryLesson?.active&&window._parryLesson.chapter===2)){` | guard. 자연 ST/MP(33361-33362)만 막는다. HP(33358)·holy flat은 앞서 독립 실행 |
| parry-lesson.js:2-6 | `window._parryLesson={t(){…}, active:false, seen:false, phase:'intro', step:0, checks:Array(8).fill(false), shot:null, get labels(){…}, heldDirections:new Set(), skipKey(){…}, …}` | `publish_file_init` 신규 리터럴. **chapter 필드 없음** |
| parry-lesson.js:12-15 | `resetForNewCharacter(){this.skippedKey=null;this.newCharacterKey=this.skipKey();this.seen=false;try{localStorage.removeItem(this.newCharacterKey)}catch{}}` | `reset_for_new_character`. active/chapter/phase/step/checks 불변 |
| parry-lesson.js:391,393 | `this.chapter=1;…this.seen=true;this.active=true;this.phase='intro';this.step=-3;this.checks=Array(this.labels.length).fill(false)` | `adopt_source_start_projection`. chapter=1 이후 labels getter → 8 |
| resource-practice.js:44-45 | `l.chapter=2;l.checks=Array(this.labels.length).fill(false);l.resourceGuide=null;l.step=0;l.pending=null;l.phase='practice';l.focusTicks=0;l.failTicks=0;` | `adopt_resource_practice_start_projection(len)`. **같은 lesson 객체** |
| parry-lesson.js:686,698 | `if(!this.active)return;` … `this.active=false;this.pending=null;this.chainPractice=null;this.attackEnemies=[];this.parryEnemy=null;this.parriedShot=null;…this.saved=null;` | `adopt_finish_state_projection` (guard + holder 상태만) |
| game.html:62708 / 64423 | 세이브 없음 새 게임 → `window._parryLesson?.resetForNewCharacter()` | 호출 위치 참조(ENGINE 연결 대상) |
| game.html:32200 | stage 전환 → `finish();seen=false` | 호출 위치 참조(ENGINE 연결 대상) |

file-init 필드 순서 `FILE_INIT_FIELD_ORDER = active, seen, phase, step, checks, shot, heldDirections`. `t()`, `get labels()`, `skipKey()`, 기타 메서드/UI는 제외한 부분 상태 packet이며 전체 controller가 아니다. `heldDirections`(Set)은 빈 Dictionary(키=원소)로 표현한다.

## Authority

| `get_authority()` | 설치 방법 | guard |
|---|---|---|
| `MISSING` (기본) | 신규 holder / `revoke` / provider 비READY·형식 오류 | **NOT_READY** (`read_guard()`=null). false로 대체하지 않음 |
| `CURRENT_LESSON` | `publish_file_init` / `publish_current` / provider `{status:"READY",lesson}` | 현재 객체에서 평가 |
| `SOURCE_PROPERTY_UNCREATED` / `_UNSET` | `publish_source_property_absent("uncreated"/"unset")` 또는 provider status 동명 | READY inactive (`?.` → undefined) |
| `SOURCE_PROPERTY_FALSY` | `publish_source_property_falsy(raw)` (raw ∈ null/false/0/""/NaN) 또는 provider `{status, raw}` | READY inactive. truthy raw 거부 |

- origin은 `own_constructor_fixture` 또는 `native_main_binding` 중 호출자 선언값이다. 모듈은 Main binding을 검증하지 않으며 provenance/snapshot의 `main_binding_proven`·`full_main_ready`는 항상 false다.
- `source_constructor_packet()`(static)은 `{packet_kind, status:"SOURCE_BOOT", current:false, fields:[[k,v]…], chapter_present:false}`. fields가 쌍 Array이므로 lesson shape가 아니다. packet 자체를 `publish_current`에 넣으면 `constructor_packet_not_current`로 거부된다.
- `publish_current`/provider lesson은 Dictionary/Object identity를 그대로 보유한다(deep clone 없음). `status` 문자열과 `ready/reason/current/packet_kind` 키를 가진 Dictionary는 provider envelope로 보고 lesson으로 받지 않는다(`provider_envelope_not_lesson`).
- `owner`는 선택이다. null이면 미선언이고 holder가 lesson을 보유한다. 명시한 owner가 freed이면 `owner_freed`, Object가 아니면 `owner_not_object`로 거부하며 생략으로 취급하지 않는다(`publish_current`와 `publish_provider_packet` 모두). 실제 NativeMain owner 인증은 ENGINE 몫이다.
- 직접 publish 거부는 이전 상태를 유지한다. provider packet의 NOT_READY/오류는 권위를 `MISSING`으로 철회한다.
- 모든 publish/revoke는 `epoch`를 +1 한다. 같은 객체에 대한 setter 투영은 epoch를 바꾸지 않는다.

## Guard 평가 (`read_guard` / `read_guard_detail`)

| 조건(순서) | 결과 |
|---|---|
| (진단용 pinned reader만) pinned epoch ≠ 현재 epoch | NR `epoch_replaced` |
| authority MISSING | NR `authority_missing:<reason>` |
| witness authority | READY `{parry_lesson_active:false}` |
| owner 선언 후 freed / Object lesson freed | NR `publisher_owner_freed` / `current_lesson_freed` |
| `active` 속성 없음 | READY inactive `active_property_missing` (JS undefined) |
| `active` JS falsy (false, 0, 0.0, NaN, null, "") | READY inactive `active_falsy`. `&&` 단락이므로 chapter는 읽지 않는다 |
| `active` JS truthy (true, 비0 수, 비어있지 않은 문자열, **빈 Array/Dictionary 포함**, Callable, Packed*, 유효 Object) | chapter 평가 |
| Godot 전용 타입(Vector2 등) | NR `active_value_unsupported_type:<type>` |
| active이면서 chapter 없음 | NR `active_chapter_missing` (binding gap) |
| chapter가 TYPE_INT | 값 그대로 (0, 3, 99, -1 포함). whitelist 없음 |
| chapter가 유한 정수 float, \|f\| ≤ 2^53−1 | 정확 int 변환 (2.0→2, -0.0→0). JS Number 2와 같은 값 |
| 그 밖 (2.5, NaN, ±Inf, 1e300, "2", null, bool, Array…) | NR `active_chapter_not_integral_number` (typed transport gap. 0/1을 지어내거나 "2"를 강제 변환하지 않음) |
| 위 변환 성공 | READY `{parry_lesson_active:true, parry_lesson_chapter:<int>}` |

READY 값은 정확한 native 키만 가진다. NR이면 Callable은 null을 반환하므로 Natural이 READY false를 받는 일이 없다. `===2` 비교 자체는 Natural(`PARRY_LESSON_CHAPTER=2`)이 수행한다. 따라서 chapter 3이나 0은 회복을 허용하고 2/2.0은 건너뛴다.

**truthiness:** 값 판정은 기존 `equipment_affix_reader` `js_truthy`를 그대로 쓴다. 이 모듈의 `js_truthy` wrapper는 freed Object와 비인식 Godot 타입(Vector2 등)만 null(NR)로 거른다.

**source와 다른 점(남은 축소):** active truthy인데 chapter가 없거나 숫자가 아니면 원 JS에서는 `===2`가 false라 회복이 진행된다. 여기서는 기본값을 지어내지 않고 NR로 둔다.

## API

| Method | 계약 |
|---|---|
| `static source_constructor_packet()->Dictionary` | 위 SOURCE_BOOT packet. 매번 새 객체 |
| `static js_truthy(v)->Variant` | 기존 Affix `js_truthy` wrapper. freed Object/비인식 타입은 null |
| `static source_chapter_int(v)->Variant` | int 그대로, 유한 정수 safe float는 정확 int, 그 밖은 null |
| `publish_file_init(origin, provenance={})` | 원 file-init publisher가 실제로 실행될 때 새 리터럴을 current로 설치 |
| `publish_current(lesson, origin, provenance={}, owner=null)` | 외부 현재 lesson(Dictionary/Object) identity 설치. owner(Object)는 WeakRef 보관 |
| `publish_provider_packet(packet, origin, provenance={}, owner=null)` | `{status:"READY",lesson}` / `SOURCE_PROPERTY_*` / 그 외 → MISSING |
| `publish_source_property_absent(kind, origin, provenance={})` / `publish_source_property_falsy(raw, origin, provenance={})` | 명시 witness |
| `revoke(reason)` | MISSING, epoch+1 |
| `get_authority()` / `get_epoch()` / `has_authority()` / `has_current_lesson()` | present flags |
| `get_current_lesson_reference()` | 실제 현재 참조(raw), 아니면 null. 진단용 raw 참조. MISSING도 null이므로 향후 PHT에 직접 바인딩하지 않고 status를 먼저 검사해야 함 (PHT 미연결) |
| `get_provenance()` / `get_counts()` / `get_snapshot()` | deep copy 진단. snapshot에 `unported` 목록 포함 |
| `read_guard()` / `read_guard_for_epoch(e)` | native dict 또는 null |
| `read_guard_detail()` / `read_guard_detail_for_epoch(e)` | `{status, ready, reason, value, epoch, authority, origin, source_phase, source}` |
| `get_dispatcher_lesson_callable()` | **실제 `services.lesson`.** `Callable(self,"read_guard")`, 인자 0. 원 `window._parryLesson`처럼 매 호출 현재 holder를 읽는다. 첫 publish 전에 얻어도 된다(cold): publish 전 NR, publish 후 READY, 교체·새 run 후에는 새 current, revoke 후 NR. frame/dedup/gate/auto driver 없음 |
| `get_pinned_dispatcher_lesson_callable()` | 진단/cohort 전용. `read_guard_for_epoch.bind(epoch)`, 교체 후 NR. 실제 service로 쓰지 않는다 |
| `reset_for_new_character(skip_key_reader:Callable, storage_remove_item:Callable=Callable())` | 쓰기 순서 skippedKey=null → reader() → newCharacterKey → seen=false → storage(key). reader 없음/arity≠0 → NR(쓰기 0). reader가 비문자열을 반환하면 NR `writes:["skippedKey"]`(native reader 계약 오류이며 기록된 prefix 쓰기는 rollback하지 않음). storage 미결합이면 `not_bound_external`. 저장소 실제 접근 0 |
| `adopt_source_start_projection()` | chapter=1 → seen=true → active=true → phase='intro' → step=-3 → checks=Array(8) false |
| `adopt_resource_practice_start_projection(len:int)` | chapter=2 → checks=Array(len) → step=0 → pending=null → phase='practice'. len 필수(기본값 없음). resourceGuide(UI)·focusTicks/failTicks(timer) 제외 |
| `adopt_finish_state_projection()` | `if(!active)return` → `finish_guard_returned`, 쓰기 0. 아니면 active=false → pending → chainPractice → attackEnemies=[] → parryEnemy → parriedShot → saved=null. `external_restoration_by_module:false`, `ui_completed:false` |

setter는 현재 객체를 제자리에서 수정하며 identity를 유지한다. Object lesson에 대상 속성이 하나라도 없으면 쓰기 전에 NR `object_property_missing`이다. 자체 clock, `_process`/`_physics_process`, 입력, UI, 타이머는 없다.

## 남은 실제 gap (ENGINE)

1. **NativeMain publication 부재.** 실제 Main의 holder 생성·보유·owner custody 인증도 아직 없다. 실제 Main이 holder를 생성·보유하고 `services.lesson = holder.get_dispatcher_lesson_callable()`로 연결해야 한다(연결은 publish 전후 어느 쪽이든 가능). 그리고 원 file-init 시점에 `publish_file_init(ORIGIN_NATIVE_MAIN_BINDING)`을 호출해야 한다. lesson 미탑재 HTML 변형이면 uncreated witness를 쓴다. 현재 검증은 자체 constructor fixture뿐이다.
2. 원 lesson controller(start/finish 외부 복원, Player/spawn/snapshot, resourcePractice.save/restore, UI/input/update/render)는 미이식이다. 이식되면 그 controller가 setter 투영 API를 호출한다.
3. `skipKey()`의 URL `test/char/slot` 공급원과 localStorage 영속성은 외부 Callable 경계로만 남아 있다. 기본 char/slot을 지어내지 않는다.
4. 새 게임(62708/64423)의 `reset_for_new_character` 호출과 stage 전환(32200)의 `finish(); seen=false` 호출 연결.
5. 같은 guard식을 쓰는 다른 소비자는 이 단위에서 연결하지 않았다. 예: R game.html:32822 harp gauge(이번 검색 중 확인).
6. typed transport gap: active인데 chapter가 없거나 fractional/비유한/문자열 등 정수가 아닌 값이면 NR이다. 원 JS는 이 경우 회복을 진행한다. 정수 chapter는 값과 무관하게 그대로, 손실 없는 정수 float는 int로 전달한다(whitelist 없음).
7. 이번 결과는 SOURCE_FIXTURE private P/rates로 실제 Natural guard 소비자를 검증한 것이다. 실제 Main/HP/UI 증명은 아니다. `natural_guard_episode`의 sink는 packet을 로그에 4회 기록하고 ACK만 반환한다. 사설 P의 ST/MP 대입이나 실제 Player resource 쓰기는 이 검사에서 관측하지 않았다.

## Tests

실행: `godot --headless --path godot --script res://port_modules/parry_lesson_source/test_first.gd [-- --group=NAME]`. 마지막 줄 JSON `{suite, group_filter, groups:[{group,checks,status,failures}], groups_run, groups_failed, status, automatic_process:0, automatic_physics:0, engine_frames_measured:false}`. 기존 테스트 파일은 읽거나 복사하거나 실행하지 않았다.

| Group | checks | 결과 | 내용 |
|---|---|---|---|
| `missing_authority` | 9 | PASS | 기본 MISSING → null/NR, dispatcher Callable arity0 null, reset/finish NR, snapshot에 Main 주장 없음 |
| `file_init_literal` | 17 | PASS | packet SOURCE_BOOT/current false/순서/매번 새 객체, packet을 current로 거부, 리터럴 키 순서·chapter 없음·checks 8·빈 Set, inactive, provenance copy, 재발행 identity/epoch, origin 거부 |
| `identity_epoch_owner` | 27 | PASS | publish 전 cold 기본 callback(NR)→file-init READY→다른 객체로 교체 후 읽기→두 번째 교체→revoke NR. pinned 진단 NR/현재 epoch. 외부 identity·변경 반영, provider READY identity, NOT_READY→MISSING, envelope 거부, Node lesson freed, 등록 후 freed owner NR, 명시 freed owner 거부(publish_current/provider), 비Object owner 거부, null owner 선택, RefCounted Object, Object 속성 누락 NR |
| `truthiness_shortcircuit_witness` | 49 | PASS | falsy 6종 + bogus chapter 단락, active 누락, truthy 7종(빈 []/{} 포함), chapter 1, 유효 chapter 0/3/99/-1/2.0/3.0/-0.0 → int, 2.5/NaN/±Inf/1e300/"2"/null/[]/true NR, chapter 누락 NR, 비지원 타입 NR, Affix wrapper, uncreated/unset/falsy witness, truthy raw 거부, provider falsy |
| `reset_ordering` | 10 | PASS | 3필드 쓰기 순서, reader/storage 호출 시점, active/chapter/phase/step/checks identity 불변, reader 누락/비문자열/arity, storage 선택 |
| `start_finish_projection` | 14 | PASS | start 순서·값·checks8·identity·epoch 유지, resource start 길이 필수·순서·UI/timer 제외, finish 순서·주장 없음·guard return |
| `natural_guard_episode` | 11 | PASS | Natural `configure_source_rates`에 SOURCE_FIXTURE private P/rate/holy/sink 사용 (Main stat producer 아님). publish 전에 cold 기본 callback 획득. file-init(chapter 없음)→apply sink1; 같은 identity ch2 active→guard_skip sink0; ch1→apply; ch3→apply; ch2.0→skip; reset 후 ch2 유지→skip; finish 상태→apply; revoke→Natural 미호출 sink0; dispatch_count 4 |

**Pre-first-execution review (2026-10-14).** 첫 실행 전 리뷰에서 반영한 수정이며 runtime 실패 때문이 아니다.
1. 기본 service callback을 epoch 고정에서 live 현재 reader로 바꿨다. pinned는 진단 전용 `get_pinned_dispatcher_lesson_callable`로 남겼다.
2. truthiness는 기존 Affix `js_truthy`를 재사용한다.
3. chapter [1,2] whitelist를 제거했다. 정수 int는 그대로, 유한 정수 float는 정확 변환한다.
4. 명시한 freed/비Object owner를 거부한다.

### 실행 ledger

| 시도 | 결과 | 채택 |
|---|---|---|
| 1 | executor의 격리 복사본에 이 테스트가 동적 load하는 자체 producer가 빠져 있었다. raw 출력은 7그룹 PASS였지만 각 그룹 check 0(부분 1 check)이었고, SCRIPT ERROR 7 / ERROR 9가 발생했다 | **시도 전체 무효, 0 채택** |
| — | executor가 copy closure만 1회 수리했다. producer/test 변경 0 | — |
| 2 (첫 유효 실행) | 7그룹 137 checks PASS. exit 0, SCRIPT ERROR 0, ERROR 0, stderr 0 | 채택, frozen |

raw 실행 check는 부분 1 + 유효 137 = 138이다. 유효 그룹·성공 결과를 재실행하지 않았다. 기존 hash/PHT/black/regeneration suite도 재실행하지 않았다. 실행 후 product 수정 0, test 수정 0이다. Pre-first-execution review 수정은 모두 첫 실행 전에 반영했으며 runtime 실패에 대한 수리가 아니다.

**Node source oracle (1회).** 새 source-local 로직만 Node로 대조했다: 초기 리터럴, `resetForNewCharacter` 순서와 storage 예외 삼킴, guard 변형 13종. 기존 테스트는 사용하지 않았고 전체 source audit도 아니다.

사실 기록 원본은 proof 디렉터리의 `check-ledger.json`과 `valid-frozen-code.json`이다.

수치·공식·자원·비용·timer·body 검증은 중복하지 않는다. 엔진 frame, 공개 시각, FPS는 측정하지 않았다.

## Provenance

| Item | Value |
|---|---|
| Author | Claude Code (Claude Agent SDK), `claude-opus-5-5`, default model |
| Writes | owned 3 paths only. shared NativeMain/Player/World/dispatcher/services/UI/input/save, assets, Git는 변경 0 |
| Reads | 지정 doc 단락, R source 지정 범위, Natural public API·STRICT rate 검증부, `project.godot` feature 줄, `equipment_affix_reader` `js_truthy`(305-323) |
| Test execution | 격리 executor. 첫 유효 실행 7그룹 137 PASS (위 ledger). writer는 실행하지 않았다 |
| 최종 sync | doc만 수정. code/test는 다시 읽거나 쓰거나 재검하지 않았다 |

## Checkpoint

변경은 이 doc과 `parry_lesson_source/producer.gd`, `test_first.gd` 세 파일뿐이다. 관련 doc keyword metadata는 외부 `related-doc-paths.txt`로 전달되며 match 수와 함께 갱신되었다. 공유 doc 동기화와 정상 code/docs checkpoint는 central ENGINE이 수행한다. `2_3`과 마케팅 문서는 읽지도 수정하지도 않았다.

최종 executor 문구 보정: 위 3개 설명(잘못된 skipKey reader return의 native prefix, raw getter의 MISSING/null 구분, sink ACK/log와 실제 resource 대입 구분)만 Codex가 이 신규 문서에서 보충했다. 코드·test 변경/재실행 0.

## 2026-10-17 악의구 finish void 소비자 후속

| 항목 | 현재 I 범위 |
|---|---|
| 숙련 | 실제 Main.source_lesson 공개 detail/reference의 active만 source JS truthy로 판별. 명시 active면 skip, inactive/known-absent면 실제 P magic+5 및 fireball 호환 동기화; unknown은 pre-emit NOT_READY |
| guard 구분 | detail.ready/value의 regen chapter guard를 숙련 active로 추정하지 않음. 보호 lesson/regen 수리 없음 |
| sample | 실제 기존 queue void front로 연결. caller _r(1,.08) 후 queue .92+U×.16, 원 gx volume skip이면 후자 없음. 신규 fireball stream 미로드 drop은 voice/cap eviction 전, finish/recover 계속 |
| 현재 미완 | actual projectile unbound, sample loader_bound=false. current _gxVolMul은 실제 Services 소유 source-global current getter로 연결. missing-provider fallback1/dummyAudio/noop-ready 없음, 실제 발사/가청/최신 전체 게임 완료 아님 |
| 원8키 | 기존8 stream 필수는 유지하되 추가 fireball key 허용. 정상8 queue/flush/voice 본체·RNG 순서 불변 |
| 상세 / 검수 | docs/engine/FDG_NATIVE_FIREBALL_FINISH_DISPATCH_20261017.md. 새 영향32/32 및 별도 lesson 경계6/6 PASS, 첫 fixture 들여쓰기 parse 실패 보존/wholeClean=false, 과거 통과 suite 재연0 |

| 새 검수(2026-10-17) | 관측과 한계 |
|---|---|
| first parse | fixture header space/source tab 혼합으로 preload 실패; --check-only로 확인 후 fixture 들여쓰기만 수리. 제품 변경0/첫 ERROR 로그 보존/wholeClean=false |
| 새 finish/queue | 변경된 실제 Main/Resource method fragments + 원 lesson 공개 module에서32/32 PASS. actor/state/backend/gx/current World RNG는 fixture. 기존8키 backend body는 새 fireball guard 아래 byte 동일, 기존 queue method도 byte 동일 |
| 새 lesson 경계 | Object inactive/active, freed current/freed publisher owner, 명시 null witness, Godot-only Vector2 active 거절6/6 PASS. 32 재연0 |
| 독립 source | 원 JS _addSkProf/playSample/_r/_playSampleNow 및 정확 finish 호출문6흐름 PASS. descriptor/P/lesson/U/이미 로드 대기중인 sample은 fixture이며 원 게임 실행/async fetch 검수 아님 |
| 순서/숫자 | 정상 given U=.25/.75의 rate=.9984, normal magic7→12/legacy fireball12, recover12. gx0은 caller draw1 후 queue jitter 없음; gx.5는gain.4. 별도 source 기대값 수정 없음 |
| 미로드 | 실제 queue 요청을 기존 flush가 소비하고 새 fireball guard가 cap/eviction 전에 drop. audible/원 decoder/async loader/음질 성공 증명 아님 |
| 종료/namespace | 마지막32와6 각각 ERROR0/WARNING0, Dummy. OS.get_user_data_dir가 FDG_ENGINE_FIREBALL_FINISH_FIXTURE_20261017_3A92로 선언과 일치. 기존 사용자 데이터 내용조회/cleanup0, 완전 save 격리 독립증명 아님 |
| 전체 미완 | 실제 fireball projectile/gx publisher/flight/원시각/sample loader·actual scene 미검증. 이전39/6/pool31·3·8/외부26/identity/pose/entry suite 재연0. 이 검사들을 게임 기능 수·이식률로 합산하지 않음 |

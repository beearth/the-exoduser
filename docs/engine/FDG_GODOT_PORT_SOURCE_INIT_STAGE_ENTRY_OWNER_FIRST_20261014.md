# FDG Godot source initStage 진입 owner — FIRST 2026-10-14

`godot/port_modules/source_init_stage_entry_owner/producer.gd`는 원 `game.html:32195 initStage(si)` 진입부를 원 순서로 실행하는 execution owner다. 소유 범위는 predecessor callback 4개 호출, lesson 분기, 같은 G에 대한 `_playerPortalPair`/druid3/`stage`/`_fireZones` 쓰기 명령뿐이다. **첫 실행 검증: 새 고유9그룹/87checks PASS**. 실제 Claude가 제품·새 검사를 작성했고 Codex executor가 자기 격리 fixture에서 처음 실행했다. 실제 Main 설치나 전체 initStage 완료는 미완이다.

## 원 source

| 원 위치 | 식 | 이 owner |
|---|---|---|
| 17050 | `const TOTAL_STAGES=35` | 상수 35 |
| 32196 | `_cancelHellgunnerBlood();_cancelHellgunnerLeap();` | service callback 2 |
| 32197 | `_rootRiftInvalidate('init-stage')` | service callback, 인자 `"init-stage"` |
| 32198 | `_resetInteractInput()` | service callback |
| 32199 | `G._playerPortalPair=null` | sink `player_portal_pair` |
| 32200 | `if(window._parryLesson){…finish();…seen=false;}` | 공개 lesson holder + restoration callback |
| 32201 | `G._druidVictory=null;G._druidFinaleBoss=null;G._druidActCue=null` | sink `druid_reset` |
| 32202 | `if(si>=TOTAL_STAGES)si=TOTAL_STAGES-1` | 상한만 |
| 32204~32211 | `if(_bossTestReq>=0){…return;}` | gate만. 참이면 NOT_READY `unowned_boss_branch` |
| 32213 | `G.stage=si` | sink `stage` |
| 32214~32217 | skin/atlas/배열 reset 24단계 | **미소유 gap** — 실제 gap owner Callable 필요 |
| 32217 | `G._fireZones=[]` | sink `fire_zones` (gap 실제 완료 뒤에만) |
| 32217 이후 | `_thunderStakes`…`_clearDeathDecals`, 32218~ | 미소유 tail 10항목 |

## 공개 API

| API | 계약 |
|---|---|
| `new(services:Dictionary, sink:Callable)` | 검사·호출 0(preflight 없음). 인스턴스 1개 = initStage 호출 1회 episode(`episode()=get_instance_id()`) |
| `run_entry(si)->Dictionary` | 이 episode 1회. 32196→32213 원 순서. 정상 끝은 `PARTIAL_PENDING_GAP`. 실패/boss 분기는 `NOT_READY` + 보존 prefix. 재호출 `ALREADY_STARTED`(호출 0) |
| `resume_after_gap(receipt_input=null)->Dictionary` | 인자가 null이 아니면 상태 변경 없이 `RECEIPT_INPUT_REJECTED`(metadata receipt/`true` ACK 수락 0). 무인자 호출은 `stage_gap_owner`를 정확히 1회 invoke 시도. 실패 terminal `NOT_READY`; 성공 시만 fireZones 쓰기 후 `PARTIAL_ENTRY_APPLIED_TAIL_PENDING` |
| `last_result()` / `ledger()` | deep copy |
| static `gap_step_ids()`(24) / `tail_step_ids()`(10) / `actual_main_binding_report()` | 서술·NOT_READY 보고 |
| `StageEntryGSink.new(current_g_reader:Callable)` | 단일 G sink. `consume(command)`, `as_sink()`, 공개 readonly `read_current_same_g(episode)`, `pinned_g_is(g)` |

결과 키: `applied_prefix`(수락된 owned 쓰기 id 진단), `source_entry_applied`(gap 실제 완료+fireZones까지일 때만 true), `pending_gap`, `unowned_tail`, `unowned_boss_branch`(7), `si_input`, `si_after_upper_clamp`, `boss_test_req`, `positive_gap_path="UNVERIFIED_MISSING_ACTUAL_GAP_OWNER"`. `stage_complete`/`full_init_stage_ack`/`g_on_written`/`startup_on`/`rollback`/`atomic`/`main_binding_proven`은 항상 false.

## Callback / authority 프로토콜

| 항목 | 규칙 |
|---|---|
| predecessor envelope | adapter가 `{status:"CALLED"}`(실제 native invocation 완료, 원 반환값은 무시) / `{status:"NOT_READY",reason}` / `{status:"THREW",reason}` 반환. null·다른 값은 `service_protocol_invalid`. 이는 원 source ACK가 아닌 native binding seam이다 |
| arity | blood/leap/interact 0, rootRift 1. 불일치 `service_arity` |
| 실패 | 그 호출 지점에서 정지, 성공 prefix 보존, rollback/재시도/preflight 없음 |
| lesson | holder 없음→`parry_lesson_holder_missing`; authority MISSING→`parry_lesson_authority_missing:MISSING`; UNCREATED/UNSET/FALSY 선언→분기 skip. CURRENT_LESSON: `active` JS truthy면 `parry_lesson_finish_restoration`(parry-lesson.js:687-697) 호출 → 공개 `adopt_finish_state_projection()`(698) → holder 재조회 후 `seen=false`. inactive면 guard return 후 `seen=false` |
| boss | `boss_test_req()` → `{status:"READY", value:number, authority:"CURRENT"|"DECLARED_SOURCE_BOOT_DEFAULT"}`만. 그 외 NOT_READY. `value>=0`(NaN false)이면 `unowned_boss_branch`, G.stage 쓰기 0 |
| si | int/float만. `>=35`(+INF 포함)→int 34. 음수/소수/NaN 원값 보존(정수화·하한 0). 비숫자→32202에서 `si_unsupported_type`. NaN/-INF는 sink가 `stage_value_unsupported:nonfinite` NACK |
| gap owner | Callable 유효·arity1 → `get_object()` 유효(Node면 inside_tree·미queued) → owner `get_source_init_stage_gap_binding()`가 `{source:"game.html:32214~32217", steps:24 ids, implementation:"actual_source_body"}` → sink `read_current_same_g(episode)` → invoke(`{schema,episode,g,source,steps}`) → 반환 `{status:"CALLED",episode,source,g(is_same)}` → 호출 후 같은 G 재확인. 어느 단계든 실패하면 fireZones 0 |

## Sink

허용 command 4종(`player_portal_pair`/`druid_reset`/`stage`/`fire_zones`)과 원 필드 순서·값(null, 유한 number, 빈 배열)만 수락한다. 형식 검사 후 reader를 쓰기마다 1회 읽고, episode 첫 G에 pin한 뒤 다른 G면 `current_g_identity_changed`, G 없음이면 `current_g_unavailable`. `_fireZones`는 sink가 새 `[]`를 만들어 대입하고 `is_same`으로 확인한다. 실제 Main은 reader로 `native_source_new_run_state.read_current_g()`를 넘겨야 하나 **아직 설치되지 않았다**.

## 실제 Main 상태

`actual_main_binding_report()`는 NOT_READY다. 없는 것: hellgunner blood/leap, rootRift, interact input, lesson restoration, Main boss request binding, **32214~32217 실제 gap owner**, read_current_g 위 sink 설치, tail owner. 실제 Main controller binding이 없으면 최초 필요한 predecessor 호출점에서 NOT_READY이며 source 쓰기까지 진행했다고 주장하지 않는다. 격리 constructor의 유효 predecessor protocol이 공급된 첫 소비에서는 G.stage까지 `PARTIAL_PENDING_GAP`이고 실제 gap owner 부재로 `stage_gap_owner_missing`에서 정지했다. 공개 lesson holder는 존재하지만 Main binding 증명은 없다.

## episode 계약

single-shot은 owner 인스턴스 한 개의 수명에만 적용된다. 전역 stage dedup/frame gate가 아니며 G·공유 tick에 dedup flag를 쓰지 않는다. 새 initStage 호출은 새 owner 인스턴스로 한다.

## FIRST 테스트 — 고유9그룹/87checks PASS

`test_first.gd`(standalone SceneTree, `-- --groups=a,b`로 그룹 선택, 그룹별 `GROUP name PASS|FAIL n/m`, 알 수 없는 그룹 exit 2). G fixture는 bootstrap 공개 `source_boot_g()` 40키, lesson은 공개 holder. predecessor/boss/restoration은 격리 fixture이고 actual Main 설치를 주장하지 않는다.

| 그룹 | 검사 |
|---|---|
| order_and_same_g | callback 4 → G read 순서, applied_prefix 3, G 43키, same G, pending 24, ledger 원 순서 |
| lesson | active finish+restoration 위치, inactive guard, restoration 누락 정지, 선언 uncreated/falsy skip, authority MISSING / holder 없음 |
| failure_prefix | rift NOT_READY, interact 누락, blood THREW, leap null 프로토콜 위반 |
| boss_gate | boss0 unowned branch(stage 쓰기 0), provider 누락, authority 불명, NaN 정상, 문자열 NR |
| stage_clamp | 35/99/34/0/-3/2.5/INF/40.0, clamp 순서, NaN/-INF sink NACK, 비숫자 si |
| sink_nack | G 상실/교체 NACK prefix 보존, 미소유 id·형식 거절, sink 없음 |
| gap_owner_absent | 위조 receipt·`true` 거절, owner 없음 NR·fireZones 0·source_entry_applied false·terminal, binding 미선언 callee invoke 0, Main 보고 NR |
| sink_fire_zones_kernel | fresh G 실제 빈 배열 쓰기 kernel만(entry 증거 아님) |
| episode_not_complete | 재run 호출 0, 새 인스턴스 새 episode, G dedup 키 0, complete 표시 0 |

gap positive path는 실제 owner가 없어 테스트하지 않는다: **UNVERIFIED_MISSING_ACTUAL_GAP_OWNER**.

## 범위 밖

boss 분기 본문, gap 24단계, tail, 맵/spawn/Player reset/bonfire/camera, post-stage 8, intro 4, HUD/atlas wait/sprite, G.on, 저장/서버. 이미지·hash·import·load·export 0. 기존 test/proof/suite read·run 0.

## 이력

- 1차 producer: gap을 `resume_after_gap(receipt)` metadata receipt(origin + 24 CALLED rows)로 넘김. 테스트 전 scope correction으로 제거하고 실제 gap owner invoke seam으로 교체. `source_entry_applied`를 prefix 배열에서 bool로 분리(`applied_prefix` 진단 신설).
- 실제 첫 실행: Godot 4.7.2.stable.official.ed1daf0bf, exit0, 0.2664875초, stderr0/SCRIPT_ERROR0. 고유9그룹/87checks 전부 첫 PASS. runtime FAIL0/INVALID0/제품·검사 수리0/성공 재실행0. 첫 실행 후 source/test 동결.

## 실제 Claude / executor ledger

| 항목 | 첫 사실 |
|---|---|
| 실제 작성자 | installed Claude CLI, default configured `claude-opus-5-5`; 최초 PID51421, session `4cec19db-c14a-4f3d-8e8c-56a58fb7952e` |
| 테스트 전 교정 | 구조 receipt로 gap을 넘길 수 있던 첫 body를 외부 WORK snapshot에 보존. 자기 CLI만 SIGINT·exit 확인 후 동일 session PID53409로 resume, 262067ms success, permission denial0. 공유 코드/권한 확대/모델 변경0 |
| read/write scope | restricted/dontAsk; Read 정확9경로(자기3/canonical1/관련 current docs2/public producer3), Write/Edit 자기3. Glob/Grep/Bash/MCP/GUI/Agent/settings/권한 우회0. old test Read/Grep/복사/실행0 |
| 첫 테스트 | 자기 `test_first.gd` 1회. groups order_and_same_g15/lesson13/failure_prefix6/boss_gate8/stage_clamp13/sink_nack9/gap_owner_absent12/sink_fire_zones_kernel5/episode_not_complete6 = 9그룹/87checks |
| fixture source G | 실제 Bootstrap 공개 `source_boot_g()`의40키 values를 같은 참조로 공급. G={} 중립 fallback0. 유효 predecessor protocol 후 portal/druid/stage 3 command의 순서와 sameG/prefix를 검사 |
| predecessor/body 구분 | 격리 constructor services의 실제 Callable invocation·trace·오류 envelope만 검사했다. blood/leap/rootRift/interact의 원 controller 내부 동작과 Main service 설치를 검증한 것이 아니다 |
| lesson | 기존 production `parry_lesson_source` 공개 holder와 finish state projection을 소비했다. restoration callback은 격리 protocol supplier. 실제 Main lesson restoration 설치 증거0 |
| boss | 원 gate 비교와 early-return을 고정 constructor 입력으로 검사했다. fixture의 -1/current/NaN 등은 현재 Main `_bossTestReq` 권위가 설치됐다는 증거가 아니다 |
| 실제 gap owner | 현재 부재. false binding callee invoke0·위조 metadata receipt 재생 거부·fireZones0·entry publication0. positive actual source body 경로는 UNVERIFIED_MISSING_ACTUAL_GAP_OWNER |
| fireZones 단독 | 실제 source-backed G sink의 새 empty array 쓰기5checks만 통과. unowned24단계나 ordered entry 완료 증거가 아니며 실제 entity/projectile reset0 |
| GD closure | 자기2 + 기존 필요한 production5 =7개. source bootstrap/lesson와 그 formula/affix/passives script 의존만 복사. 기존 tests0·assets/hash/import0 |
| 실행 격리 | custom userdir `EXODUSER-SourceInitStageEntryOwner-Isolated-20261014`. Script `_initialize()`의 새 동기 검사; module native clock/auto dispatch/render0. 전체 Godot automatic physics ticks는 계측하지 않아 숫자로 추정하지 않는다 |
| 보호 | 인간 Main/Web/브라우저 입력/재개/재로딩0; server/save/userQA/shipping artifact/Git/sharedMainStateWorld 수정0 |
| central 설치 | current G reader·실제 controller callbacks·boss authority·sameG sink·gap actual owner와 tail 필요. 이 scope는 source entry leaf이며 normal code+전체 관련 docs checkpoint는 ENGINE 소유 |

외부 proof: `E/godot-native-first/team-port/source_init_stage_entry_owner/{prewrite.json,scope-correction-stop.json,claude-launch.json,claude-resume-launch.json,claude-resume-result.json,test-attempt1.json,test-ledger.json,handoff.json}`. 최초 source body와 correction snapshot을 보존한다. 이 문서만 executor가 첫 결과로 갱신했으며 source/test 성공 후 수정0이다.

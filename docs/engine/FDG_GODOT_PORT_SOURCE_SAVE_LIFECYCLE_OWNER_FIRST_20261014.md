# SOURCE-SAVE-LIFECYCLE-OWNER-FIRST — 2026-10-14

TASK `CODEX7-GODOT-BUILD-SOURCE-SAVE-LIFECYCLE-OWNER-FIRST-20261014`.
새 실행 owner·독립 실제 fixture caller·이 문서만 W 소유한다. 신규 evidence는 `team-port/save_adapter/source_save_lifecycle_owner/`에 보존한다. 원자료 R read-only, shared Main/State/Player/World/sourceSink·Git·공유 docs는 ENGINE 소유이다.

## 저장 설계와 원 경계

1차 레퍼런스 W `docs/15 세이브+데이터구조/15 세이브+데이터구조.md`의 저장 타이밍: 30초 간격, 마지막 성공 후 10초, `G.on && _dbReady`. 좁은 R `game.html` 정의/호출 확인:

| 원 위치 | 이름/조건/수치·순서 | 새 owner 적용 |
|---|---|---|
| 3842–3843 | `_autoSaveTimer=null`, `_lastSaveTime=0` | timer queue는 새 owner, 마지막 성공 시간은 외부 primitive/current_state 소유 |
| 4315–4319 | `doAutoSave`: Date.now → 마지막 성공과 차이 `<10000` return → `G.on && _dbReady` → dbSave | `poll` due auto → `_execute` current clock/state gate → slot → current collector → primitive |
| 4321–4324 | 기존 interval clear → `setInterval(doAutoSave,30000)` | `start_auto_save`; auto timer만 제거 후 새 due=clock+30000 |
| 3632–3636 | non-RIFT `setTimeout(dbSave,3000)`; RIFT ticket add → 3000ms → await dbSave → finally ticket delete | `schedule_boot_save`, pending/settled ticket lifetime |
| 3628–3630 | busy = !saveStateReady OR !dbReady OR bootTickets.size!=0 OR saving/debounce/force/saveNowPending | `rift_save_busy()` 정확 Boolean adapter 입력 |
| 3921–3928,3968–3973 | dbSave admission·sanitize/shared pools/serializer/backend/last-success/drain | 기존 primitive/ENGINE 소유; 재구현하지 않음 |
| 64479–64481 | `_dbReady=true` → startAutoSave → boot schedule | caller가 선행 상태를 게시하고 두 공개 메서드를 순서대로 호출; 이 owner는 dbReady/stageReady 게시 안 함 |
| 62623,62743–44,62920,62955,64480–81,64595–96 | 실제 start/boot 호출 위치 | ENGINE caller 연결 미완료 |

원 source `_rootRiftViewScheduleBootSave`는 boot timer를 취소하는 정책이 없고 `startAutoSave`의 취소는 이전 interval만 대상으로 한다. 다른 cancel/slot cap/POT/durability/save 정책을 추가하지 않았다. 실제 슬롯/admission/중복 저장/마지막 성공 갱신은 primitive callback 소유이며 boot는 G.on으로 차단하지 않고 primitive를 호출한다.

## 기존 공개 API와 부족 authority

기존 `save_adapter/producer.gd`의 public `pack(context) -> {ok,data}` / `consume(data)`를 신규 실제 callback에서 그대로 소비한다. 두 고정 fixture writer API는 기존 성공 evidence root에만 쓰므로 새 namespace에서 호출하지 않았다. serializer/restore/math/new-run 26개 동작을 복제하지 않았다. `native_new_run_bootstrap_source`의 `configure/readiness/run`는 bootstrap reset 실행 API이며 lifecycle current collector, current slot/RIFT 또는 dbSave backend API가 없다. 이번 업무에서 그 reset 실행/기존 suite는 0회다. source startup activation의 completion packet을 live collector나 stageReady authority로 쓰지 않았다.

정확한 부족 생산 API는 current_state/collector/slot/RIFT 및 실제 dbSave primitive/clock 게시다. 제공자가 없으면 NOT_READY이며 통합 담당이 실제 current authority에 연결해야 한다. 신규 fixture에서는 별도 owned context·slot·state와 실제 `pack → FileAccess write/flush → reread → consume` callback을 사용한다. 완료 packet만 반환하는 stub success는 사용하지 않았다.

## 공개 실행 API

| 메서드 | 입력/반환·실행 |
|---|---|
| `configure(bindings)` / `readiness()` | 아래 6개 Callable의 실제 바인딩 여부. 누락 list와 NOT_READY |
| `start_auto_save()` | 현재 clock 읽기, 이전 auto interval 취소, 30000ms 새 일정 |
| `schedule_boot_save()` | 현재 clock/RIFT enabled 읽기, 3000ms timeout; enabled일 때만 ticket 추가 |
| `poll()` | explicit host pump. due 순서/동일 due 등록 순서 → 실행 current 재조회 → 실제 primitive 결과 소비. interval은 반복, boot는 단발 |
| `settle(request_id,result)` | 실제 pending/unknown invocation의 settled success/failure 결과 소비, finally ticket 삭제; 중복/미확인 완료 거부 |
| `rift_save_busy()` | live RIFT/current_state 및 owned boot ticket으로 busy 계산 |
| `snapshot()` | detached schedule/inflight/ticket 진단. 항상 Main_connected=false, stageReady=false |

| binding | callback packet/인자 |
|---|---|
| `clock()` | `{ready:true,ms:<finite wall-clock milliseconds>}`; Date.now domain |
| `current_state()` | `{ready:true,on:bool,db_ready:bool,last_save_ms:number,saving:bool,save_debounce:bool,pending_force:bool,save_now_pending:bool}`; busy adapter flags는 원 원소의 truthiness를 host가 전달 |
| `current_collector()` | `{ready:true,context:<현재 실제 save_adapter context Dictionary>}`; due 실행 때 다시 수집 |
| `current_slot()` | `{ready:true,value:<실제 primitive의 현재 slot identity>}` |
| `current_rift()` | `{ready:true,enabled:bool,save_state_ready:bool}`; 실제 route 판정/상태 authority 외부 소유 |
| `save_primitive(slot,context)` | actual dbSave/adapter 호출 결과 `{ready:true,settled:true,ok:bool,...}` 또는 `{ready:true,settled:false,...}` |

GDScript가 임의 host callback 예외/Promise를 자동 catch/await한다고 주장하지 않는다. host는 caught 실패와 async completion을 packet/`settle`로 전달해야 한다. 성공 여부는 owner가 발명하지 않는다. `ready=true,status=SETTLED`는 실패 결과도 정상 소비했다는 뜻이며 `result.ok=false`를 성공으로 승격하지 않는다. primitive 호출 후 malformed/unavailable outcome은 NOT_READY+inflight로 보존하되 이미 호출한 event를 재실행하지 않는다. 아직 invocation 전 authority 부재는 due event/ticket을 유지한다. 이는 source 저장 성공 주장이 아니라 adapter unavailable 경계이다.

이 helper는 engine Timer/physics 설치를 하지 않는다. ENGINE의 explicit pump가 필요하며 sleep/event-loop stall·clock jump·실시간 timer coalescing은 이번 검증 범위 밖이다. production에서는 host event-loop delivery를 별도 검수해야 한다. 새로운 slot lifetime/cancel policy를 가정하지 않으며 timeout 실행 당시 current slot/context를 읽는다.

## 신규 actual caller / native 검증

신규 5 cases / 112 assertions PASS. 첫 4 case 입력·input-original은 각 실행 전에 작성했고 실제 source 4개 함수의 신규 isolated VM oracle로 interval/조건/ticket 결과를 얻었다. primitive-outcome 추가 case도 독립 입력을 먼저 보존한 후 actual file write/failure를 검증했다.

| case | checks | 결과 |
|---|---:|---|
| `auto_current_episode` | 49 | first PASS |
| `missing_authorities` | 9 | first PASS |
| `plain_failure_episode` | 13 | first PASS |
| `primitive_outcome_episode` | 10 | first PASS |
| `rift_pending_episode` | 31 | repair1 PASS |

actual caller는 `tests/test_source_save_lifecycle_owner_first.gd`이다. 최초 auto episode는 restart로 기존 due 취소, gap/on/dbReady skip, 실행 시 변경된 slot과 P.lv=27→28을 실제 collector→pack→own file에 반영했다. missing-authorities episode는 실제 공급자 공백에서 IO를 하지 않고, 바인딩을 회복한 뒤 P.lv=33을 실제 신규 파일에 저장했다. plain failure는 on=false에서도 boot primitive가 실행되며 존재하지 않는 own parent 경로 쓰기 실패를 소비한다. RIFT pending은 실제 수집/pack 후 completion 때 성공/실패 FileAccess 결과를 받으며 ticket을 finally 해제한다. 추가 outcome case는 actual write 후 host 결과 unavailable에서 재호출 0, 실제 기록된 outcome으로 settle, duplicate settlement 거부 및 실제 filesystem failure를 확인했다.

RIFT case 첫 실행은 31 checks 중 마지막 2개 ticket/busy assertions 실패. 최초 VM oracle가 cross-context async finally까지 drain하지 않아 마지막 sync boot ticket을 1로 기록한 것이 원인이다. owner 변경 없이 failed case oracle에 매 action 후 setImmediate drain을 적용했다. 첫 input/input-original/output/log는 불변, repair1 입력/원본·output/stdout/stderr/Godot log/ledger는 별도 파일이다. 성공한 다른 3 cases/old suites는 재실행하지 않았다. 이후 신규 outcome episode는 최초 PASS. deliberate filesystem errors는 검증 입력이며 production save failure가 아니다.

원 source read/hash 재증명·old SAVE18/Qslot43/SharedMats96/Main29·117 fixture/read/grep/test replay는 0. 사용자 저장소/API/서버/network/QA latest-session/artifact는 접근하지 않았다. 기존 production public primitive/helper API 확인은 새 caller 개발 범위이며 기존 성공 test/proof를 읽지 않았다.

## docs 및 통합 인계

허용 W/R docs 전체 keyword rg-l 명령·exit·count·매칭 경로는 `docs-search-ledger.json`에 보존했다. protected 2_3와 제외 marketing doc은 glob 제외, tools marketing 파일은 검색 대상 밖이다. 공유 정본은 worker 수정 금지이므로 ENGINE이 save 설계, FDG_ENGINE/FDG_RUNTIME/FDG_INTEGRATION_INTERFACE/CHANGELOG_SYNC 및 source-startup/boot 관련 매칭 문서의 구현 상태/API/수치를 본 새 문서와 함께 동기화해야 한다. 전체 목록은 evidence ledger이다. 코드+문서+신규 test를 함께 checkpoint/commit 인수해야 하고 worker는 Git index/commit을 수정하지 않았다. test_* ignore 때문에 신규 테스트는 통합 시 명시적으로 포함해야 한다.

## Gate

| 항목 | 판정 |
|---|---|
| source 일정·interval 취소·조건·원순서·current collector → actual pack/write/result | 신규 독립 PASS |
| RIFT ticket pending/finally·실패 결과·불명확 결과 재호출 방지 | 신규 독립 PASS |
| Main current authority/clock/event pump 및 실제 dbSave backend 연결 | NOT_READY / ENGINE 미완료 |
| bootstrap 26 / full Player/State/World/sourceSink / stageReady | 미실행·미완료 |
| serializer/restore/math 기존 suites | 재실행 0 |
| 사용자 저장소/서버/API/nativeuserdata | IO 0 |
| automatic physics / render | 0 / 0 |
| visual/audio / CoreAudio / Windows / min240 | 미완료 |
| 공유 docs 전체 동기화 / 정상 Git checkpoint | ENGINE 인계 |

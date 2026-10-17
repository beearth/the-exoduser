# Normal hurtE 레슨 active-only 실제 owner (2026-10-17)

| 항목 | 현재 범위 |
|---|---|
| 실제 코드 | godot/port_modules/parry_lesson_source/producer.gd, godot/scripts/main.gd. 기존 owner에 reader 추가; 별도 상태 producer 없음. |
| SourceLesson API | read_active_status()->Dictionary (현재582행). 같은 실제 _authority/_current/_owner_declared/_owner_ref/_witness_raw/_epoch/_origin/_source_phase/_missing_reason만 읽는다. 새 state/cache/shadow current/epoch/counter/busy flag 없음. |
| Main API | read_native_normal_enemy_lesson_status()->Dictionary (현재1988행). 기존 live Main/exact SourceLessonScript 검사 후 동일 holder를 보유해 reader1회. 반환 뒤 current Main/holder identity와 기존 public get_epoch()를 재확인한다. |
| 등록 상태 | normal hurtE의 parry_lesson_active callback/ENEMY v5 미등록. 기존 typed4 map은 그대로4. 다른21/full25/full_hurtE/sourceclock/게임 준비를 이 API로 승격하지 않는다. |

## 정확 조회와 반환

| 순서/상태 | 계약 |
|---|---|
| 입구 | 기존 epoch/authority/current/declared publisher/WeakRef를 지역 변수로 읽는다. MISSING은 NOT_READY/active생략. |
| 선언 publisher 수명 | _owner_declared=false는 정상 optional 상태다. 선언한 weak publisher가 유실되면 CURRENT와 명시 witness 모두 publisher_owner_freed/NOT_READY다. ROOT 최신 지시에 따라 witness보다 먼저 검사한다. 기존 regen reader 본문은 바꾸지 않는다. |
| 명시 witness | SOURCE_PROPERTY_UNCREATED/UNSET는 READY active=false/known_absent=true. SOURCE_PROPERTY_FALSY는 기존 recognized 타입 및 AFFIX.js_truthy가 실제 false인 published raw일 때만 READY active=false/known_absent=false. unknown을 witness로 만들지 않는다. |
| CURRENT | 실제 Dictionary 또는 유효 Object의 active 속성을 정확1회 읽는다. chapter 조회0. 읽은 뒤 기존 epoch/authority/current identity(is_same)/owner_declared/WeakRef identity와 publisher/current 생존을 확인한다. 기존 recognized 타입/AFFIX.js_truthy만 사용하며 별도 finite/문자열 coercion 정책 없음. |
| 현재 부재/falsy | 유효 현재 객체의 active 누락/null/false/0/NaN/빈String은 원 truthiness false이며 정상 비활성. 빈Array/Dictionary를 포함한 원 truthy는 활성. missing authority/current 불명과 구별한다. |
| READY | status=READY, ready=true, active=bool, known_absent=bool 및 원 authority/epoch/origin/source_phase와 source=parry_lesson_source.read_active_status. 읽기마다 새 결과만 반환하며 owner에 저장하지 않는다. |
| NOT_READY | status=NOT_READY, ready=false, reason 및 관측 entry authority/epoch/origin/source_phase/source. 최상위 active 키를 생략한다. 조회 중 context변경이면 current_epoch도 원 현재값으로 기록한다. false/0 fallback 없음. |
| Main context 변화 | actual_normal_lesson_owner_unbound / actual_normal_lesson_owner_changed / actual_normal_lesson_epoch_changed. 뒤 두 상태는 원 read_result Dictionary를 그대로 중첩 보존한다. 정상/원 NR은 원 결과를 그대로 반환한다. |
| 원자성 한계 | 기존 publication/revoke epoch 증가와 holder/owner identity·생존 경계만 검증한다. 기존 동일객체 setter는 epoch를 바꾸지 않으며 내부 다중필드 snapshot/lock/트랜잭션·임의 동시 private쓰기 원자성을 주장하지 않는다. |

| module reason | 조건 |
|---|---|
| authority_missing:<기존 reason> / authority_unknown | 명시 current/witness 권위 미확인 |
| publisher_owner_freed / publisher_owner_freed_during_active_read | 선언된 weak publisher 유실 |
| falsy_witness_unsupported / falsy_witness_not_falsy | published falsy raw의 지원 타입/원 truthiness 조건 불일치 |
| current_lesson_freed / current_lesson_unknown / current_lesson_freed_during_active_read | 실제 현재 참조/수명 불명 |
| active_read_context_changed | 기존 epoch/authority/current/declared-owner/WeakRef 정체성 변경 |
| active_value_unsupported_or_freed | 원 recognized 타입 밖 또는 freed active Object |
| explicit_inactive_witness / current_active | 명시 READY reason |

## 보존·검수

| 항목 | 결과와 한계 |
|---|---|
| 사전 보존 | 정확11경로(code2/docs9)×I/R22행, WORK/HEAD44슬롯=40copy+4absent. 개별복사 시각/ancestor nonlink/realpath/분리 INDEX·WORK를 첫코드 전에 저장. |
| 첫 수정 뒤 steering | ROOT가 선언된 weak publisher를 witness에도 적용하도록 확정. 첫 임시 reader 전체를 before-root-witness-owner-steering.gd로 보존하고 실제 신규 reader의 owner 검사 위치만 첫 검수 전에 이동했다. 당시검수0. optional owner는 계속 허용. |
| 최초 실행 | active-first/runner.gd의 fixture 함수 seed가 Godot 내장 seed(1arg)와 충돌해 parse 실패/exit0/result없음/기능0. PASS 아님. 첫 runner/두 raw log는 그대로 보존한다. |
| 실패 범위 수리 | active-fixture-name-repair 별도 namespace에서 fixture 함수/호출 이름만 prepare_fixture_publication_fields로 변경. 제품 변경0. 새49/FAIL0, exit0, stdio/Godot 양로그 ERROR/WARNING/leak0. 성공49/기존31·9·108/oldproof 재연0. first_whole_clean=false. |
| 실행 대상 | 실제 수정 SourceLesson script와 기존 static AFFIX truthiness. fresh 격리 fixture가 기존 publication 필드만 seed하며 원 publish/revoke/controller 본문을 호출하지 않는다. Main은 새 bridge+기존live guard 메서드 추출 fixture이고 실제 전체 Main은 아니다. 자연 publication/실제 현재 게임 owner 수명 통합은 미검증. |
| 새 경계 | missing/witness/falsy/truthy/NaN·Inf/unsupported·freed raw/current·optional/declared publisher·witness publisher유실, Object active1/chapter0, 재진입 epoch/authority/current/WeakRef 변경과 publisher free, Main holder교체/epoch변경/queued, 같은 Dictionary 값변경과 기존epoch 유지, 기존 counts 불변. |
| 계측 한계 | raw 결과의 old_protected_functions_called=0은 fixture가 선언한 호출 범위이며 protected-body 실행 추적 계측값이 아니다. 관측된 것은 active/chapter getter 수, 기존 counts 불변, 실제 결과/양로그다. 신규 경로의 직접 guard/eval/controller 호출 없음은 정적 대조로 기록한다. 보호 본문 instrumentation/열람/편집 없음. |
| 보호 범위 | _eval/기존 source module 본문과 기존 Main 메서드는 그대로 보존. regen/chapter/fireball finish의 이전 의미·검수 기록 변경0. 실제 GUI/server/API/save/original PNG·audio read/copy/import0. Q/E·BOSS·맵 변경0. |

새 실제 API를 ROOT가 인수한 뒤에만 기존 ENEMY에서 42111 parry_lesson_active의 typed ready/active/미준비 전파 계약을 최소 확장한다. 현재 V4의 bool(Dictionary) 직결은 금지하며 unknownfalse/가짜25READY로 진행하지 않는다.

외부 NORMAL-HURTE-LESSON-ACTIVE-OWNER-20261017의 prewrite-manifest, code-write-actions, steering backup/manifest, docs검색, active-first 원실패, active-fixture-name-repair 첫49 및 final receipt를 따른다. source body-read 과거hash 미기록을 이번 backup hash로 소급하지 않는다.

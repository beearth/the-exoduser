# SV-SAVE-PRIMITIVE — 격리 메모리 fixture 구현·제품 연결 HOLD

2026-10-20 KST · 작업ID `sv-save-primitive` · 브랜치 `codex/sv-save-primitive-20261020`

## 보호 경계 판단

**자기 소유 메모리 fixture만 쓰는 primitive로 분리 가능하여 그 범위만 구현했다.** 새 모듈은 생성한 MemoryFixture의 Dictionary/PackedByteArray만 바꾸며, 실제 경로·파일·localStorage·SDK·네트워크·사용자 저장소를 받거나 실행하는 API가 없다. 제품용 `readiness()`는 항상 **HOLD / product_write_authorized=false / Main_connected=false**다. 실제 저장 primitive 인수·연결은 구현하지 않았다.

원본 형식으로 값을 만드는 serializer는 추가하지 않았다. fixture primitive는 **호출자가 이미 직렬화한 bytes**만 받는다. QA는 원문 JSON.stringify 결과 bytes를 공급해 쓰기/정리 순서를 대조한다. 기존 JSON 생산자·필드·마이그레이션 변경0이며, 이 bytes API를 제품 저장 형식으로 선언하지 않는다. `EXODUSER-Godot-Native-First` 폴더 접근/생성/읽기/쓰기0. 해당 문자열은 잘못된 fixture namespace를 거절하는 테스트에서만 사용한다.

## 기준·의존·자기 변경

`git fetch origin main` 후 최신 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. 앞 단위가 main에 없어 승인된 SV-RESTORE-FLOW `000e26d1a665b946e454452143df17fb97b14683`에서 분기했다. 선행 의존은 COLLECT `b8b8a8fa` → TRANSPORT-READ `75c4d36e`/판정 `955f3573` → RESTORE-PLAYER `c88014b6` → RESTORE-ITEMS `9b5fdf46` → SHARED-READ `9bde0cfe` → RESTORE-FLOW `000e26d1`. 앞 tip에 최신 main이 포함되어 있다.

`worktree add --no-checkout -b` 후 `sparse-checkout set --no-cone`로 필요한 원본 텍스트/docs/모듈/테스트만 받았다. 약20MiB, 대형 에셋·전체 import 없음. R의 기존 untracked는 건드리지 않았고 tracked INDEX/WORK diff0이다.

| 자기 변경 파일 | 내용 |
|---|---|
| `godot/port_modules/save_adapter/source_save_primitive.gd` | 메모리 fixture atomic/direct 연산과 cloud/local/web ACK의 순수 계산. 제품 readiness는 HOLD |
| `godot/tests/test_native_save_primitive.gd` | 지정 격리, 원문/메모리 FS 대조·부분 실패·응답 역전·불변·실제 경로 거절 검사 |
| `tools/sv_save_primitive_oracle.cjs` | 원본 server atomic/NW handler 및 game ACK/catch 발췌를 fixture FS/응답만으로 실행 |
| `docs/CHANGELOG_SYNC.md` | 허용된 최상단 기존 형식 절 |
| 이 보고서 | 판단·근거·실제 수치·중단한 제품 접점 |

## API·격리 계약

`create_fixture("EXODUSER-sv-save-primitive-Isolated-20261020")`만 MemoryFixture를 반환하며 다른 namespace는 null이다. Fixture에는 host backend/Callable/path resolver를 주입할 수 없다. 인스턴스별 저장소·descriptor·순번·fault history는 독립이다.

| API | 자기 소유 메모리에서의 동작 |
|---|---|
| `seed(token, bytes)` / `set_faults(schedule)` | 시작 전 QA 데이터/fault만 설정. transaction 시작 후 재seed/스케줄 교체 거절 |
| `begin(mode, token, bytes, virtual_process_id)` | `dev_atomic`/`nw_direct`만 허용. bytes 복사, 메모리 transaction 생성. 가상 pid는 실제 프로세스를 읽거나 생성하지 않음 |
| `advance(id)` / `run(id)` | 원본 open/write/close/rename/finally 순서를 메모리 연산으로 진행. 중간 상태를 관측하고 순서를 바꿔 같은 token 경쟁 시험 가능. settled 재호출은 쓰기 재실행0 |
| `snapshot()` | bytes/descriptor/call trace의 detached 사본. 결과 수정이 fixture 내부·호출자 bytes에 영향 없음 |
| `cloud_ack` / `local_ack` / `web_ack` | 전달된 응답/쓰기 결과·현재 identity·가상 clock만으로 last_save_ms 후보 반환. 실제 `_lastSaveTime`/global·저장소를 바꾸지 않음 |

fixture token은 자기 테스트 주소이며 **생산 슬롯 sanitize/path 정책 이식이 아니다**. primary는 ASCII 영숫자/`_`/`-`의1–128자, seed는 충돌 시험용 `.` 포함 가상 임시 token도 허용한다. primary에 `.`를 거절해 다른 transaction의 임시 token과 겹치지 않게 했다. `/`, `user://`, `res://`, host path는 주소가 될 수 없다. temp 이름은 source의 `.tmp-<pid>-<serial>`를 가상 token에 붙이며 순번은 가상 프로세스별이다. 기존 slot의 한글/50 UTF-16 길이/경로 권위는 아래 HOLD다.

fault는 open/write/close/rename/unlink의 호출 순번에 명시한다. before·write partial bytes·after-effect 예외와 cleanup 재실패를 지원한다. open-after-effect처럼 입증하지 않은 경우는 schedule 거절이다. 성공/실패 receipt도 `fixture_only=true`, `host_io=false`, `product_write_authorized=false`, `durability_verified=false`다. ACK READY는 `calculation_only=true`, `network=false`, `Main_connected=false`, `full_save_verified=false`, `connection_status=HOLD`이며 입력 시간의 성공 후보만 계산한다.

## 최신 main 원본 근거·보존한 차이

원본4파일은 최신 main과 byte 동일이다. SHA-256: game `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, server `072a95f336bc900d44f3eb68cdf8713f025d7dac52a5c3a062b5b590768400ca`, node-main `3a6704b3a72340c97e2c6c01e5eed93edebea8d9c2019a1561dfbacac19c7f06`. 발췌별 행/hash는 `source-oracle.json`에 있다.

| 원본 위치 | 이 범위의 계약·관측 |
|---|---|
| server95–116 | JSON.stringify(data,null,2) **이후** 임시 이름 순번 증가→wx open→descriptor UTF8 write→close→rename. finally는 열린 fd 재close, owned temp만 unlink, cleanup 오류 억제. 제품 serializer는 미구현이고 이미 만들어진 bytes 이후만 모델링 |
| server216–222 | body/slot/data admission 뒤 atomic, 성공200 `{ok:true,slot}`. 이 handler·서버를 실행하거나 연결하지 않음 |
| node-main129–139 | handler가 직접 pretty2 write, 예외500/데이터 없음400/성공200. QA의 truthy data write 부분을 실제 원문으로 대조. direct partial 실패는 가상 기존 target에도 일부 bytes를 남길 수 있으며 atomic과 같다고 보고하지 않음 |
| game3576–3585, 특히3580–3583 | cloud error가 없고 정확1행의 id가 **응답 시점 현재 `_charId`**와 엄격 일치할 때만 시각. 요청 당시 id를 캡처해 비교하는 새 규칙으로 바꾸지 않음. cloud catch는 정상 completion 또는 exception 후의 lastSave 계산만 모델링 |
| game63932–63940 | `_serverOk===false` 즉시 LS 성공 또는 HTTP non-ok의 내부 LS 폴백 성공 때 시각. JSON j.ok는 truthy 판정이며 반환 slot 비교가 없음. 실제 `_SLOT`은 closure의 const로 유지되고 다른 현재 슬롯은 진단 정보만 사용 |
| game63905/63939 | **원본 X10 재현**: `const saveData`는 try 내부인데 outer catch의 폴백에서 참조. transport/JSON 예외 또는 offline setter 예외 후 catch는 lastSave를 갱신하지 못함. transport/parse에서 fixture setter 호출0, offline 첫 setter 실패에서는 호출1이며 두 번째 호출0. 원문 수정0 |
| game64089–64092 | web setter가 정상 반환했을 때만 시각; throw면 catch 뒤 finally. setter 호출 자체는 fixture에서만 대조, 제품 LS adapter는 없음 |

cloud 요청A→현재B→응답A는 성공 시각을 갱신하지 않는다. 반대로 응답이B면 요청A라도 현재B와 일치해 원문이 시각을 갱신하는 결과도 그대로 보존했다. local은 `{ok:true,slot:"wrong"}`도 원문이 받아들이며, 다른 현재 슬롯으로 바뀌었다는 진단만 추가해 계산 결과를 바꾸지 않았다. 이를 안전한 제품 ACK/응답 역전 방지 구현으로 승격하지 않는다.

같은 token의 가상 writer 두 개는 open/write/close/rename 뒤 네 지점에서 원문 fake-FS hook으로 다른 writer를 실행해 대조했다. source의 서로 다른 vm은 각 process의 순번을 갖고 메모리 FS를 공유한다. Godot의 단계 인터리빙과 최종 bytes·연산 순서가 일치한다. 같은 가상 process의 연속2회는 순번1/2, 마지막 rename의 값이 남는다. **실제 Node 이벤트루프 동시성·다중 OS 프로세스·전원 장애·fsync·Windows rename/내구성 시험은 아니다.**

## 검증 방법·실패 이력

Godot4.7.2/Node24.15.0. 새 USERDIR는 `EXODUSER-sv-save-primitive-Isolated-20261020`, 기존 회귀는 각각 파일 상수 그대로. 매 실행 전 지정 pgrep predicate를 확인했고2일 때30초씩 기다렸다. 자기 Godot 순차1개, 다른 프로세스 조작0. 실행마다 override.cfg를 만들고 종료 후0byte로 비웠다. Main/에셋 import/실제 저장 폴더 접근0.

| 실행 | 실제 결과 |
|---|---|
| primitive-attempt1 | Godot exit0이나 **RESULT 없음, SCRIPT ERROR 파싱1+load ERROR1**. `namespace` 예약어를 변수로 쓴 오류. PASS 아님. fixture_namespace로 수정, 원로그 보존 |
| primitive-attempt2 | **10,364검사/실패0, exit0**, ERROR/SCRIPT ERROR/경고0. 메모리 쓰기29·가상 경쟁4·cloud21/local48 ACK |
| primitive-verified | **10,385/0, exit0**, ERROR/SCRIPT ERROR/경고0. web2 ACK 보강 |
| primitive-final | **10,388/0, exit0**, ERROR/SCRIPT ERROR/경고0. primary/temp 주소 분리·fixture 간 독립·시작 후 재seed 거절 보강 |
| 기존 test_native_save_contract | **3,023/0, exit0**, ERROR/SCRIPT ERROR/경고0, EXODUSER-sv-contract-Isolated-20261020 |
| 선행 test_native_restore_flow | **819,262/0, exit0**, ERROR/SCRIPT ERROR/경고0, EXODUSER-sv-restore-flow-Isolated-20261020, 321fixture×2 원본 평가 |

검사 수는 재귀 type/key/value/bytes/call 비교를 포함한다. 쓰기29건은 정상 원시 JSON carrier/중첩 Unicode, open 충돌·write partial/전후 예외·close/rename·cleanup 반복 실패·자기 것 아닌 temp 보존·direct 실패를 다룬다. ACK는 cloud21/local48/web2이며 mismatch/두 행/누락/SDK오류/transport/JSON오류/LS실패/늦은 identity/truthy "0" 차이를 다룬다. 누락 관측/비지원 ACK carrier/미확인 clock은 HOLD이며 성공으로 제조하지 않는다.

oracle은 원본 atomic helper/NW handler/ACK와 catch 본문을 **실제로 평가**하되 fs/setItem/fetch/완료값은 모두 메모리 fixture다. 실제 server/SDK/HTTP API/사용자 저장 helper는 실행0. local/web는 기존 try의 `const saveData`를 같은 lexical 범위의 fixture payload로 공급해 수집·protected sanitizer를 실행하지 않는다. local 내부에서 삼킨 ReferenceError **타입 자체는 정적 scope 분석의 추론**이며, 직접 관측한 것은 setter 호출 수·serverOk·시각이다. 이를 예외 타입 계측이나 실제 브라우저 장애 재현으로 보고하지 않는다. QA 원로그/실패 실행은 삭제하지 않았다.

## 구현하지 않고 멈춘 실제 접점

| 필요한 위치·권위 | HOLD 근거 |
|---|---|
| server65–67/118–120/216–222, SAVE_DIR 선언·fs 실제 owner | 실제 slot sanitize/target namespace/권한·파일 생성·rename·오류 응답 경계 필요. fixture token을 제품 path로 자동 매핑하지 않음. 서버 시작/실제 요청0 |
| node-main48–55/129–139 | APPDATA/releaseConfig.saveNamespace/saves 및 NW 직접쓰기 차이. 실제 폴더·사용자 JSON·플랫폼 정책 인수 전 접근0. atomic으로 통합하는 변경0 |
| game3533–3543/3576–3585 | admission/보호 parry·sanitize·shared flush·수집 authority→인증SDK update/updated_at/id/ACK. 이번 API는 post-completion 계산만이며 실제 수집/serializer/저장 writer/인증 연결0 |
| game63892–63940 / 64054–64092 | local `_SLOT` closure·serverOk·실제 LS namespace·catch 범위와 web key owner 필요. X10의 저장 오류 수정도 보호 범위라 미구현. 응답 역전/slot ACK 정책 변경0 |
| source_save_lifecycle_owner.gd:6,95–115 | 실제 clock/state/collector/slot/rift/primitive의6 Callable 및 settled/ok 인수 필요. 본 fixture 객체를 lifecycle primitive로 등록하지 않음. dbSaveNow/Force/pending drain/timer·beforeunload는 다음 단위/미구현 |
| main.gd:106–183, native_source_new_run_state.gd readers/writers | 제품 저장/복원 분기·live owner·부트 writer 연결이 필요하지만 공용0줄 원칙. 새 writer/기존 initializer 재사용0, HOLD |

공용6(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state)·타 담당·기존 모듈/회귀·원본4파일·project.godot·기존 데이터·세이브 형식 직접 변경0. 사용자 저장 쓰기·삭제·병합·실제 서버 호출·새 migration/version·보호 Q/E 변경0. 물리적 persistence/재시작/제품 전체 저장·화면/플레이·PC 검증 완료 주장은 없다. 알려진 선재 결함 **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**는 원문만 기록하며 이번 재실행/수정/PASS 승격 없음.

관련 전체 tracked docs 검색은 `related-docs-search.log`. 기존 trace/설계는 고치지 않고 이 보고서와 허용 CHANGELOG 절에 구현/미구현 경계를 기록했다. 정상 pre-commit·자기5개 텍스트 경로만 stage하며 test_* ignore는 자기 신규 테스트만 명시 force-add한다. git add -A/훅 우회/main push/force push/바이너리 commit0.

원로그·명령·oracle·최종 summary·보고서 사본·remote SHA/정리 영수증은 `/Users/fordeargamers/exoduser-wt/_out/sv-save-primitive/`. 자기 branch push·원격 일치·DONE.txt 기록 후 자기 worktree만 제거하며 브랜치는 유지한다. 최종 SHA/수치/정리 결과는 같은 위치 **DONE.txt**에 남긴다.

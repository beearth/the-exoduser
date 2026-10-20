# DEMO11-05 — demo native local 저장소 adapter

작업 `demo11-05` · 브랜치 `codex/demo11-05-20261021`. **격리 실제 IO 인수·제품 소비자 연결 대기**. 원본 JSON 저장 경계를 구현했으며 실제 사용자 저장소·전투·맵은 수정하지 않았다.

| 항목 | 구현·근거·소유 경계 |
|---|---|
| 기준·권한 | fetch main `0105159934d0c2a8b167bd51518dca1e0fafe50a`, gap `61ab71be`의 DEMO11-05 행. 사용자 “나눠서” 배정의 저장 IO 범위만 구현. sparse `--no-checkout` worktree. 미병합 제품 merge0 |
| 원본·형식 | G62111/62128–62173의 `hellsave_demo`/JSON.stringify→setItem→성공 시각, I3486–3520의 active·5슬롯, G3935–3944/62212의 auto/boot. game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 원문 demo는 평문 JSON이며 native 파일 내용도 전달된 문자열 그대로, 암호화/envelope·필드 마이그레이션0 |
| 실제 API·재사용 | 새 `godot/port_modules/save_adapter/demo_local_storage.gd`: open/get/read_json·begin_set/remove·advance/run/cancel·receipt 재사용/명시 해제. 기존 SV StrictJSON reader, primitive.web_ack, lifecycle owner를 실제 preload/호출. memory fixture를 제품 FS로 위장하거나 기존 HOLD를 해제하지 않음 |
| 보호·원자성 | 고정7키만, demo500/공유/임의 path 거절. 현재 userdir가 `EXODUSER-demo11-*`일 때만 하위 폴더 IO, `EXODUSER-Godot-Native-First`는 경로 검사 전에 거절. symlink 거절·독점 writer lock·동일 FS temp write/flush/readback/rename, 기존 target 선삭제0. 실패 시 이전 bytes/성공시각 유지. ID 재사용·충돌·재진입·알려진 실패 settlement 처리 |
| 공용 파일 변경 줄 | **Main0 / State0 / Player0 / World0 / HUD0 / 전투 피해·이동·2_3·맵0**. 공용 파일별 변경 줄 범위는 없음. 새 adapter/test·UID2, SAVE 추적 문서 추가 절, 이 보고서, CHANGELOG 절만. 기존 SV 3모듈도0줄 |

DEMO11-04/06은 새 adapter를 생성해 `readiness`→`open_store` 후 고정 키 API를 소비한다. Main의 demo 정책 READY/namespace 선택과 실제 collector→JSON 직렬화·Player/INV 복원은 해당 담당의 권위다. `configure_lifecycle`은 기존 SV Callable 형식에 `context.raw_json`을 받아 실제 IO primitive를 설치한다. clock은 원본 Date.now와 같은 ms 도메인, state는 on/db_ready와 기존 busy 플래그를 공급하고, 소비자가 poll을 호출한다. 이 단위가 engine timer나 Main boot를 자동 설치하지 않는다. 현재 일반 Main의 기존 userdir에서는 NOT_READY가 의도한 보호 결과다. 원격 DEMO11-01 `65f55e76`은 Main 정책 조회 접점이 있는 제출본이지만 이번 adapter가 그 미병합 코드를 호출/복사하지는 않는다.

| 검사 (Godot4.7.2, 격리 실제 FS) | 실제 결과 | 범위 |
|---|---:|---|
| 신규 storage·lifecycle 최종 | **79/0** | 정확한 UTF-8/미지 필드/null, metadata5슬롯/active, ACK, duplicate/conflict/reentrant, 실제 atomic overwrite·다른 인스턴스 lock·취소/삭제·손상/링크 거절 |
| 별도 프로세스 재읽기 | **5/0** | 앞 프로세스가 commit한 lv3/active/손상 슬롯을 재기동 후 읽음, lock 누수0 |
| 저장소 경로 IO 실패 집중 검사 | 최초 **8/2 → 수정 후8/0** | root 유실은 MISSING 아님, 파일이 root를 막으면 open 실패/미공개, 장애 후 원래 commit 보존 |
| 기존 `test_native_save_primitive` | **10,388/0**, 1회 | 원문 primitive/ACK 메모리 대조 기존 검사 무수정 |
| 기존 `test_native_slot_reader` | **5,952/0**, 1회 | 재사용 StrictJSON/기존 transport reader 검사 무수정 |

정상 최신 결과 합계16,432/0, ERROR/WARNING0. 초기 신규75/0 후 검수에서 ACK 재진입 방어와 검사를 보강해79/0을 확인했다. 이후 집중 검사8/2는 Godot 재귀 mkdir가 기존 일반 파일 경로에도 OK를 반환한 문제를 검출했다. 디렉터리·open을 확인한 뒤에만 root를 공개하도록 수정했고 **실패한 집중 검사만** 재실행해8/0을 확인했다. 최초75/0 및 집중8/2 로그는 보존하고 최신 통과 합계에 중복 가산하지 않았다. 기존 회귀는 각각1회만 실행했다.

오류 주입은 다섯 경계로 제한했다: 임시파일 open 충돌·부분 temp·commit 직전 temp 유실·외부 writer lock·root 경로의 일반 파일 충돌. 실제 OS IO를 사용하고 실패를 성공으로 바꾸지 않았다. 별도의 전체 게임/전투/맵·광범위 회귀와 editor/import는 실행하지 않았다. 신규 userdir `EXODUSER-demo11-05-Isolated-20261021`, 기존은 각 파일 상수. 매 Godot 전 정확한 pgrep 수를 기록하고2이상일 때30초씩 대기, override는 실행마다 설정/종료0byte다. 보호 사용자 폴더는 읽기/쓰기/생성0이며 해당 이름은 순수 거절 검사 문자열로만 사용했다.

잔여 경계: 원자성은 단일 키 rename 가시성이고 여러 슬롯 키 교환의 일괄 commit이 아니다. receipt 중복 방지는 인스턴스 수명/명시 해제 전까지이며 재시작 후 ID 원장을 영속화하지 않는다. 정체불명의 stale lock은 자동 제거하지 않고 이전 commit은 읽을 수 있다. crash 잠금 복구 정책·Windows 실IO·전원 차단/디렉터리 fsync 내구성·적대적 동시 symlink 교체는 미확인(`durability_verified=false`). payload는16MiB/기존 reader depth128을 넘으면 보정 없이 실패한다. 공유창고/실 Player 복원·UI/성공 알림은 DEMO11-04/06 경계이며 이번 화면 검수 완료를 주장하지 않는다.

원로그 `~/exoduser-wt/_out/demo11-05/`: 실행별 stdout/stderr/engine/meta, process-gate.jsonl, 원문 회귀 oracle, 보호·제출 receipt. R0 HEAD/branch·tracked INDEX/WORK 불변, 정상 훅·자기 branch push/원격 일치/DONE 작성 뒤 자기 worktree 제거, branch와 로그는 보존한다.

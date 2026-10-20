# NW-01 — MAP_OBJS 첫 상호작용 대상 읽기 질의

상태: **NW-01 구현·원본 대조·필수 회귀 완료. actual NPC/월드 연결 없음.** 다음 단위는 구현하지 않았다.

## 기준·의존·범위

| 항목 | 근거 |
|---|---|
| 최신 main | fetch 후 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e` |
| 선행 의존 | 지시서 `FDG_SOURCE_TRACE_NPC_WORLD_20261020.md`가 아직 main에 없어 `codex/trace-npc-world-20261020` 끝 `5e8cbd233f4bc68d028b9d6d3579d799c4b93b92`에서 분기. 추가 제품 선행 의존 없음 |
| 작업 | `codex/nw-01-20261020`, `~/exoduser-wt/nw-01`: `worktree add --no-checkout -b`→`sparse-checkout set --no-cone`. godot·필요 docs·game.html·자기 tools만. 웹 원본 대용량 에셋 미수신 |
| 변경 | 새 producer.gd·test_native_world_interaction_query.gd·oracle.cjs, 자기 UID2개, 이 보고서·CHANGELOG_SYNC 신규 절만. 공용6·기존 제품/테스트·다른 담당·원본·저장 형식·Q/E·작업판 변경0행 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD `dd49171c5b88e211575a41f185395d6c0a14b184` / branch `codex/mac-live-play-time-main-20261017`, tracked INDEX/WORK 보존. fetch·자기 worktree 관리 외 R 파일 변경0 |

## 원본·구현 계약

`game.html`은 최신 main 및 선행 지시서와 동일: 65,692행 / SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.

| 원본 행 | 그대로 보존한 질의 계약 |
|---|---|
| G:32827 | caller가 제공하는 interact_pressed/portal_used bool. false 입력 또는 이미 포탈 사용이면 다른 인수를 읽지 않고 정상 no-match. 레슨/입력/포탈 구현은 호출하지 않음 |
| G:32829–32853 | 배열의 첫 일치: bonfire 거리<60(lit 무시), lore !read/<60, breakable alive/<50, altar !used/<60. 최근접/타입별 정렬 없음. trap·m_c1altar·기타 String type은 제외 |
| G:31723 | sqrt((c−a)^2+(d−b)^2). float64로 먼저 변환해 int64 뺄셈 overflow 방지. 정확60/50 및 대각 경계는 불가 |
| G:32828–32853 | 주석 포함 원문 발췌 SHA256 `9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f`. oracle은 전체 source/hash·고유 마커·fragment/hash·distance/gate 원문을 검증하고 본문 변경 없이 VM 실행 |
| G:32854–32952 | MAP 루프의 break는 아래 상자/수거를 차단하지 않음. query 출력에 전역 입력 소진/상자 차단/보상 필드를 추가하지 않음 |
| G:25793–25808,25853–25868 | bonfire/trap 자동 생성은 비활성 상태 그대로. fixture의 bonfire 관측은 실제 생성·배치 기능을 뜻하지 않음 |

구현은 `godot/port_modules/world_interaction_query/producer.gd` 65행, `extends RefCounted`. 제안 API `query_map_object(Variant,Variant,Variant,Variant)`와 `provenance()`를 지시서대로 구현했다. 결과는 정확히 ready/matched/source_index/type/reason/source의 6키이며 index는 int 또는 null, provenance.connected=false다.

NR은 native API의 미지원 입력 계약이며 원본 JS의 예외/모든 carrier와 같은 결과라는 뜻이 아니다. gate형→inactive short-circuit→Array/player finite좌표→원소/type→관련 flag→후보좌표→첫 match 순서를 지킨다. 미사용 flag/unknown 장식의 좌표/이미 사용한 후보의 좌표/첫 match 뒤 원소는 읽지 않는다. StringName·숫자 flag·NaN/Infinity·문자좌표 등은 지원 경계에 따라 명시 NR이다. missing/null flag는 JS falsy 범위만 지원한다.

입력의 값·원소 참조·순서, 현재 P/G/INV, RNG, 입력, 신호, Node/씬, 파일·저장·오디오를 변경하지 않는다. 같은 입력 반복 결과 및 출력 사본의 독립성도 검사했다. 일반 NPC·대화·상점·제단 효과·세계 오브젝트 설치는 미연결이다.

## 실제 검증

Godot `4.7.2.stable.official.ed1daf0bf` 원앱, Node v24.15.0. 모든 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 확인. count2에서 30초씩 기다린 2회 포함, 실제 시작은 각각 count1에서 수행했고 자기 실행은 순차1개였다. process-guard.jsonl에 전부 보존했다.

신규 테스트·import·격리 상수가 없는 test_contracts는 `EXODUSER-nw-01-Isolated-20261020`, 기존 regions는 파일 USERDIR `EXODUSER-P3003-Isolated-20261020`. 신규 테스트는 userdir basename 정확일치 guard. 매 실행 override.cfg 설정/종료 finally에서0byte. import 전 App Support/Godot 파일을 백업했고 이후 기존 파일 해시 변화0이다.

| 실행 | 결과 | exit | stderr ERROR / ObjectDB / 잔류 resource |
|---|---|---:|---|
| 신규 최종 unit-final | **2304검사 / 0실패**, oracle104상황+별도 native 계약94상황 | 0 | 0 / 0 / 0 |
| test_contracts 전체 | **5그룹 통과 / 실패단정0**, only=[] | 0 | 0 / 0 / 0 |
| test_p3003_regions 전체 | **43검사 / 0실패**, core·display·actual Main | 0 | 0 / 0 / 0 |
| import(준비 작업) | 정상 import 완료, 테스트 PASS로 합산하지 않음 | 0 | 0 / 0 / 0 |

신규와 contracts 경고0. regions의 `Camera2D overridden to physics process mode due to use of physics interpolation` WARNING1은 보존하며 ObjectDB 경고가 아니다. 최종 실행들의 개별 Leaked instance도0. 기존 테스트 파일의 검사·기대값·수치·skip·격리 상수 변경0.

| 신규 검사군 | checks | failures | 관측 |
|---|---:|---:|---|
| source_oracle | 1256 | 0 | 실제 원문104상황, strict/diagonal/좌표/flags/첫순서/동률/장식 제외/gate/Number precision/short-circuit |
| domain_and_short_circuit | 1034 | 0 | native 계약94상황: 잘못된 gate·Array/좌표·StringName/flag·NR 순서·앞/뒤 malformed·int64 극값 |
| provenance_and_scope | 14 | 0 | 고정 provenance·새 반환사본·IO/Node/RNG/입력 의존 부재 |

각 입력에서 6키/반환 타입·깊은 입력 snapshot·원소 참조/순서·동일 seed 다음 RNG 값·자식 Node 개수·반복 질의·결과 사본 독립성을 검사한다. 메모리 source VM은 action 부수효과를 관측하므로 제단 fixture 등에서 oracle만 난수를 소비할 수 있다. **native query는 난수0**이며 oracle의 난수를 제품 RNG 증거로 혼동하지 않는다.

### 실패·음성 대조도 원문 보존

| 실행 | 실제 결과·취급 |
|---|---|
| unit-01 최초 | 2200검사/138실패/exit1. JSON Number의 source_index가 Godot JSON decode에서 float인 반면 API int index와 Dictionary 엄격 비교돼 성공 후보만 비교 실패. 제품 수정 없이 하니스에 정수·finite·범위·matched/null 관계104단정을 추가한 뒤 index만 int로 변환해 비교. API 출력 int 타입 검사는 유지. 최초 실패를 PASS로 승격하지 않음 |
| negative-inclusive | `<`를 임시 `<=`로 바꾸자 같은2304검사 중16실패/exit1. 엄격 경계 누락 검출 |
| negative-reversed-order | 임시 역순 탐색에서2304검사 중72실패/exit1. 첫 배열순/NR 경계 검출 |
| oracle source 변조2종 | 원본값 또는 마커 변조 사본 모두 전체 source hash gate에서 exit1로 거부. 마커 검사 자체를 통과했다고 주장하지 않음 |

음성 대조는 자기 신규 producer의 임시 오류 주입뿐이며 finally에서 원바이트 복구했다. 최종 producer는 unit-final GREEN 당시 snapshot과 SHA/바이트 동일. 기존 제품·테스트 변경0, 검사 완화/삭제·skip·고정 성공 출력0.

## 다음 단위·공용 접점 — 미착수

현재 작업은 NW-01에서 끝낸다. NW-02는 문서의 개인 포탈 **순수 proposal 후보**일 뿐 구현하지 않았다. 실제 State/Player/World 연결은 아래 권위·호출 지점이 필요하고, 이번 공용0줄 범위에서는 설치하지 않는다.

| 필요한 접점 | 현재 위치 / 원본의 필요한 쓰기·호출 | 처리 |
|---|---|---|
| 실제 G._playerPortalPair 권위·reset | state.gd의 read_current_g():175–182, initStage seam `source_init_stage_entry_owner/producer.gd:47,78`; 원본18312–18314 pair쓰기,31535/30161 reset | 현 read-only query에 holder 추가0. 실제 승인된 State sink/쓰기 위치가 확정되지 않아 추가 구현 줄 수는 미확인. 독립 G 사본을 actual로 사용하지 않음 |
| 실제 P/Player·카메라 이동 | state.gd read_current_p():581 이후, Player/World의 현재 위치 권위; 원본18319 P.x/y/vx/vy 4대입+18320 cam.x/y 2대입 | 6대입에 대응하는 실제 owner 검증/원자적 적용이 필요. 공용 Player/State/World 변경0, 편의 teleport API 추가0 |
| 입력 edge·생명주기 | 원본32113 KeyP,32825–32827 R edge·portal 사용 결과,6251/31534 reset; 현재 main.gd/Player input 및 world.gd epoch | query는 bool 입력만 받음. 실제 입력 루프에 1호출을 꽂는 것만으로 레슨/paused/hold/배열순 권위가 해결되지 않으므로 삽입 줄·순서는 해당 담당 인수 전 미확인 |

공용 연결이 필요한 후속 작업은 담당·위치·필요 줄을 확정해 별도 배정할 때까지 **미연결/BLOCKED**로 남긴다. 이번 NW-01 완료를 실제 NPC·월드 기능 완료나 분모 상향으로 확대하지 않는다. 실화면/자연 플레이·PC 실행·완전한 JS carrier 동등성은 미확인이다.

원로그 `~/exoduser-wt/_out/nw-01/`: oracle.json·명령/소스 snapshot·unit-01/unit-final/negative-*/import/contracts/regions의 out/err/json, process-guard.jsonl, accepted-summary.json, App Support 백업/해시, docs-keyword-index.txt. 코드를 바꾼 뒤 전체 tracked docs를 검색했고 수치/계약은 선행 지시서와 일치해 이 보고서·CHANGELOG_SYNC에 현재 구현/검수만 추가한다.

정상 pre-commit 훅 유지, 자기 신규 파일과 docs만 경로 지정 stage(test_* ignore는 자기 새 테스트/UID만 -f). 자기 브랜치 push·원격 SHA 일치·DONE 기록 후 사용자 지시대로 자기 sparse worktree를 제거한다. 브랜치·원로그·보고서 사본은 보존. main push/force/git add -A/훅 우회0.

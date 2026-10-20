# NW-02 — 개인 포탈 순수 상태전이 proposal

작업ID `nw-02`, 브랜치 `codex/nw-02-20261020`. NPC·월드 추적 문서 순서안 2번의 **독립 명령 계산만 완료**했다. 실제 포탈 설치·이동·입력 소비·렌더링·저장 연결은 없다. Main·State·공용6·다른 담당 파일·기존 테스트 변경은 모두 0줄이다.

## 기준·의존·소유 범위

- fetch 후 최신 `origin/main`: `e556b617190c325ca39f5add04357f5dea5ca87e`.
- NW-01이 main에 없어 승인된 끝 `d9865e4c004217a878b1d26b697011b8b8d53206`에서 분기. 추적 문서 `5e8cbd23`도 선행 의존이다. NW-01 API를 수정하거나 실제 consumer로 설치하지 않았다.
- `worktree add --no-checkout` → `sparse-checkout set --no-cone` → `read-tree -mu HEAD`. godot·engine docs·원본 game.html·훅·필요한 oracle만 materialize. 웹 대용량 에셋 추가 0.
- 신규 `godot/port_modules/player_portal_proposal/producer.gd`, `godot/tests/test_native_player_portal_proposal.gd`, 각 UID, `tools/nw02_player_portal_oracle.cjs`, 이 보고서, CHANGELOG_SYNC 맨 위 절만 제출한다.
- R `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`·브랜치·tracked INDEX/WORK를 보존한다. main push·force·add -A·훅 우회 0.

## 원본 근거와 계산 결과

모든 행은 최신 main `game.html` 기준이다. 전체 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`를 main Git object와 작업 파일 양쪽에서 대조했다. 원본 파일 수정 0.

| 원본 행 | 보존한 동작 | proposal |
|---|---|---|
| 16631,31723 | T=40, JS Number의 sqrt 거리 | 좌표를 float로 변환한 뒤 뺄셈·제곱·sqrt. 타일/3D 좌표 변환 없음 |
| 18309–18312 | on/map/P gate, dead/fallen 거부. pair 없음 또는 length>=2면 A 재시작 | set G._playerPortalPair=[현재점] 후 A 안내. 기존 pair 내용은 검사하지 않고 새 배열 명령 |
| 18313–18315 | 간격 strict `<200`이면 안내만. 정확200은 B 설치 가능 | 경고 또는 append 명령 후 B 안내. append와 전체 set 구분 |
| 18316–18318 | pair length2만 사용. 순서상 최초 `<88` 포탈 선택 | 정확88 불가. 가까운 순으로 정렬하지 않음. 양쪽 범위 겹치면 첫 항목 선택 |
| 18319–18322 | 반대편 좌표, vx/vy=0, cam이 truthy일 때 좌표, FX/문구 순서 | P.x/P.y/P.vx/P.vy → 선택적 G.cam.x/y → addParts → addTxt → showPH 순서. use는 별도 on/map/dead gate 없음 |
| 30160–30161 | 존 존재 gate 뒤 pair=null | caller의 zone_available=false면 명령0. true면 set null. _loadZone 전체 이식 아님 |
| 31534–31535 | _resetInteractInput 후 pair=null | 두 명령의 순서를 유지. initStage 나머지는 범위 밖 |
| 32108–32132,32827 | KeyP는 pause return보다 앞. R 사용 true면 MAP/chest 진입 생략 | 호출·입력 consumer는 미연결. proposal에서 pause나 입력을 판정/소비하지 않음 |

G18309–18322 원문 발췌 SHA256은 `4eae4f08342dd95a93c73982f266bec0cf7eb4a54237d4574190aa9d9a1ddfef`. oracle은 전체 원본·함수 고유 마커·포탈 함수·reset prefix·T·dst를 검사하고 **원문 그대로** VM에서 실행한다. 실제 게임 부팅·사용자 저장 접근 없이 Proxy로 순서 있는 쓰기·append·부수효과를 관측한다. reset prefix만 실행하며 전체 zone/stage 전이 동등성을 주장하지 않는다.

## API·지원 carrier·방어 계약

`extends RefCounted`, 외부 노드/리소스/State/Input/RNG/IO 의존 0. API 이름과 envelope는 native 설계이며 원본 API라고 주장하지 않는다.

| API | 입력 | 결과 |
|---|---|---|
| propose_place(snapshot: Variant) | Dictionary의 on:bool, map_present:bool, player:Dictionary/null, pair:Array/null | 설치·경고 명령 목록. source_return은 원본 undefined를 구분하는 문자열 `"undefined"` |
| propose_use(snapshot: Variant) | pair, finite x/y player, 사용 성공 시에만 cam 검사 | source_return bool. 실패 false는 정상 명령0이며 NR과 구분 |
| propose_reset(context: Variant, zone_available: Variant=null) | String `init_stage`/`load_zone`. load_zone만 bool 필수 | 각 원문 prefix 명령, source_return `"undefined"` |
| provenance() | 없음 | 원본 hash·행·connected=false의 새 중첩 Dictionary |

결과는 정확히 `ready`, `reason`, `source`, `source_return`, `commands` 5키다. 정상 reason=null, NR은 ready=false/명령0/source_return=null/사유 String. 명령은 set(path,value), append(path,value), 또는 op/args 형태다. `_L` 문구는 `{ko,en}`, `_T`는 `{key}`로 보존하며 실제 번역/효과 함수를 호출하지 않는다. 생략된 showPH duration은 생략 그대로 둔다.

지원 입력은 수치형 int/float의 finite x/y, player.s의 String/null/생략, pair의 Array/null이다. cam은 Dictionary(빈 Dictionary도 JS 객체처럼 사용), null/false를 지원한다. on/map_present/zone_available은 **caller가 판정한 명시 bool**이며 실제 G.map/G._zones reader가 아니다. Godot Dictionary의 빈 값 truthiness를 JS 객체에 그대로 대입하지 않는다.

설치 검증 순서는 snapshot→on→false 조기반환→map_present→map 없음/player null 반환→player carrier/state→dead/fallen 반환→finite xy→pair carrier→A 재시작 또는 단일점 거리다. 사용은 snapshot→pair null/Array/length→player xy→앞에서부터 필요한 점 좌표→선택된 반대편 좌표→성공 시 cam 검사다. reset은 context→zone bool 순서이고 stage는 zone 인수를 읽지 않는다. 단락 뒤의 미사용 malformed 인수는 검증하지 않는다.

지원 밖 truthy 스칼라·StringName·Node·Vector2·비finite 좌표·빈 설치 pair·malformed 점 등은 NR이다. 원본 JS가 빈 설치 배열이나 잘못된 객체에서 던지는 예외를 새 native API에서 복제하지 않는다. 성공 proposal의 모든 입력은 사전 검증하며 부분 명령을 NR에 실어 보내지 않는다. JS의 전체 coercion/동적 객체/예외 순서 동등성은 미확인이다.

## 검증 결과·실패 보존

Godot 4.7.2, 모두 `--verbose`. 아래 검사 수는 assertion 수이며 기능 분모와 합산하지 않는다.

| 실행 | 검사/상황 | 실패·exit | stderr ERROR / ObjectDB / 개별 누수 / resource |
|---|---|---|---|
| unit-final | 1851검사: 원문68상황 + native 방어계약107상황 및 provenance/직접 Variant 검사 | 0 / 0 | 0 / 0 / 0 / 0 |
| nw01-regression | 2304검사, 원문104/native94상황, 기존 파일 byte 유지 | 0 / 0 | 0 / 0 / 0 / 0 |
| contracts | 기존5그룹, failed_assertions=0 | 0 / 0 | 0 / 0 / 0 / 0 |
| regions | 기존43검사 | 0 / 0 | 0 / 0 / 0 / 0 |
| import(검사 PASS 수에 미합산) | headless editor import | exit0 | 0 / 0 / 0 / 0 |

region의 기존 Camera2D interpolation WARNING1은 원문 보존했다. 다른 최종 실행 WARNING0. 단위 검사는 ordered command 전체·원본 undefined/bool·fixture에만 명령을 적용한 후 상태·5키 carrier·입력 스냅샷·RNG·씬 자식 수·반복 안정성·중첩 결과 변경 후 새 출력 독립성을 검사한다. JSON Number int/float는 양쪽 JSON으로 동등 비교하되 bool/string/null·배열 순서·값·키는 유지한다. native bool/Array 및 NR/return carrier는 별도 단정한다.

첫 unit-01은 새 보조 함수 `_set`이 Object 가상 함수와 충돌한 컴파일 실패다. ERROR209·정상 RESULT 없음·자기 실패 Godot 프로세스만 SIGTERM(exit -15) 후 override를 비웠다. `_set_command`로 수정한 unit-02 및 unit-final은 각각1851/0. 이 실패를 PASS에 합산하지 않으며 원문/실행 코드/메타를 보존한다.

| 자체 결함 주입(매번 원복) | 유지 검사 수 | 검출 실패·exit |
|---|---|---|
| 설치 `<200`→`<=200` | 1851 | 12 / 1 |
| 사용 `<88`→`<=88` | 1851 | 9 / 1 |
| 포탈 탐색 역순 | 1851 | 15 / 1 |
| vx=0 누락(7로 잘못 초기화) | 1851 | 48 / 1 |
| 유효하지 않은 zone도 reset | 1851 | 11 / 1 |

5개 모두 SCRIPT ERROR/종료 ERROR/ObjectDB/resource0인 **의도한 assertion 실패**다. 이후 원복 byte와 unit-final 통과를 확인했다. 별도 원본 변조 파일을 oracle에 주면 원본 hash 불일치로 exit1/JSON0을 내며 기대값 자동 갱신을 거부한다. 검사 삭제·완화·skip 0.

Godot는 소유 실행을 직렬화하고 매 실행 직전 지정된 pgrep 수를 기록했다. 총12회(첫 실패1, 중간 통과1, 결함주입5, 최종1, NW01/입력 에셋 import/contracts/regions 각1)를 실행했다. 모든 launch 직전 count1, count>=2 관측·대기0. 신규/계약/import는 `EXODUSER-nw-02-Isolated-20261020`, 기존 NW01과 regions는 각 파일 USERDIR를 사용했다. 모든 override finally0byte. import 전 AppSupport Godot 68파일 백업·hash 대조, 기존68파일 변경0.

## 공용 연결 경계 — 이번 구현 0줄, 실제 연결 보류

| 필요한 실제 위치 | 필요한 줄/작업·원본 근거 | 현재 판정 |
|---|---|---|
| Main 입력 소비/레슨·paused 순서 | G32108–32132/32113의 P 배치와 G32827의 R 성공 bool 분기. 기존 Main의 정확 새 삽입 줄은 미확인 | 공용 main.gd 변경0, 키 edge를 직접 소비하지 않음 |
| State 실제 pair sink | `native_source_new_run_state.gd:175–182` G reader, `:581` P reader. G18312 set/18314 append/30161·31535 reset 대상 권위 필요 | reader를 쓰기 권한으로 간주하지 않음. sink 추가 줄 수 미확인, 변경0 |
| Player와 실제 cam owner | G18319의 P.x/y/vx/vy 4대입, G18320의 cam.x/y 2대입. native player.gd/cam 대상 및 source→world 좌표 변환 권위 필요 | 실제 좌표/velocity/카메라 갱신0. native 삽입 위치·줄 수 미확인 |
| 기존 init-stage owner | `source_init_stage_entry_owner/producer.gd:47` reset callback, `:78` WRITE_PORTAL seam과 중복 적용 방지 필요 | 다른 담당 producer 변경0. 이번 명령을 자동 dispatch하지 않음 |
| World/FX/포탈 수명 | G18321 FX/문구,51962–51972 렌더,30160/31535 reset lifetime | adapter·맵 epoch·실제 FX API 연결 미확인/0줄 |

원본에서 필요한 대입 수와 native 제품 수정 줄 수를 구분한다. native 권위/삽입 위치가 미확인이므로 임의 줄 수나 연결 완료를 만들지 않았다. 실제 연결은 공용 승인이 필요한 별도 작업이다. NW-03 및 다른 단위는 착수하지 않았다. GUI/실제 플레이/PC 동등성·실제 포탈 기능 완료는 주장하지 않는다.

## 문서·제출·정리

관련 docs 전체를 Git object 기준 검색한18행은 `docs-search.txt`에 보존했다. 기존 분모의 consumer 미연결 및 추적 D11 strict 경계 설명은 그대로 유효하다. 과거 owner의 옛 원본 행 번호는 참고로만 두며 이번 표는 최신 game.html 행이다. 기존 원본 수치나 타인 문서를 변경하지 않고 새 독립 구현 상태를 본 보고서와 CHANGELOG_SYNC에 기록했다.

원로그 `~/exoduser-wt/_out/nw-02/`: `preflight.json`, `fragments.json`, `oracle.json`, `run.py`, 실행별 out/err/json·코드 snapshot, `negative-runtime-summary.json`, `negative-source.*`, `docs-search.txt`, AppSupport 백업/hash, 보존·제출·정리 증거. 정상 pre-commit 훅 후 자기 branch만 push, 원격 SHA 일치 확인, DONE.txt 기록 후 자기 worktree만 제거한다. 최종 SHA·검사 수·remote 일치·정리 결과는 같은 폴더의 DONE.txt/submission.json/cleanup-verification.json에서 확인한다.

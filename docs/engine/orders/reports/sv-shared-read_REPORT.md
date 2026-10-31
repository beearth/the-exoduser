# SV-SHARED-READ — 공유 저장소 읽기·이관 계산 인계

2026-10-20 KST · 작업ID `sv-shared-read` · 브랜치 `codex/sv-shared-read-20261020`

## 기준·범위

`git fetch origin main` 후 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. 앞 단위가 main에 없어 승인 tip `9b5fdf468f014b20a69e4349f9d2ab326e661ca0`에서 분기했다. 선행 의존은 SV-COLLECT `b8b8a8fa` → SV-TRANSPORT-READ `75c4d36e`/판정 `955f3573` → SV-RESTORE-PLAYER `c88014b6` → SV-RESTORE-ITEMS `9b5fdf46`. 앞 tip에 최신 main이 이미 포함되어 있다.

사용자 지정 `worktree add --no-checkout -b` 후 no-cone sparse로 원본 텍스트·필요 docs/port_modules/tests/data만 받았다. 약 **20MiB**, 대형 에셋·전체 import 없음. push·원격 SHA 일치·DONE 기록 후 자기 worktree만 제거하고 브랜치·외부 원로그를 남긴다.

이번 범위는 추적 문서 §4의 5번 **공유 저장소 읽기·이관 계산만**이다. caller가 준 읽기 관측값을 해석하고, 원본이 setter를 호출할 조건/인자를 계산한다. 실제 localStorage/QA storage/서버 접근·저장·형식·마이그레이션 정책 변경은 없다. 모든 실제 연결은 HOLD다.

## 자기 변경·API

| 파일 | 역할 |
|---|---|
| `godot/port_modules/save_adapter/source_shared_store.gd` | 공유 읽기와 max 동기화/빈 창고 이관/층별 concat의 detached 계산 |
| `godot/tests/test_native_shared_store_read.gd` | 지정 격리·원본 getter/계산 발췌 대조·재조회/2회 복원·불변/HOLD 검증 |
| `tools/sv_shared_read_oracle.cjs` | 최신 checkout의 실제 source reader/계산 본문을 fixture getter와 candidate-call stub으로 평가 |
| `docs/CHANGELOG_SYNC.md` | 허용된 최상단 기존 형식 절 |
| 이 보고서 | 근거·검수·미연결 범위 |

세 API 계층은 다음과 같다. 모두 파일·네트워크·live owner를 읽거나 쓰지 않는다.

- `read_storage(mode, observation)` / `read_mats(mode, observation)`: `{state:"value",value:String|null}` 또는 `{state:"error"}`라는 **공급된 읽기 결과**만 소비한다. mode는 `browser_origin` 또는 `qa_fixture`를 명시하며 URL·OS·계정·저장소 위치를 자동 선택하지 않는다.
- `plan_store(current_storage, mode, observation)`: `_getStore`의 읽기 조건, 배열 병합/200캡, 원래 반환 참조를 사본에서 계산한다. 이미 synced인 유효 빈 배열은 재조회/병합하지 않는 원문 차이도 유지한다.
- `plan_restore(serialized, current, observations)`: 현재 G.mats snapshot과 `mode/mats_reads/storage_reads` 순서를 요구한다. 공유 악의구슬은 합산 없이 max 후보를 계산하고, 빈 공유 창고일 때만 legacy slice 후보를 만든다. **쓰기 후 재조회 관측값이 없으면 HOLD**이며 성공을 가정해 저장값을 갱신하지 않는다.

`plan_restore.plan`은 detached `serialized/mats/storage`, `plan_store.plan`은 `storage/store`다. `intents`는 원본 setter **호출 지점과 인자의 계산 기록**으로 `execute_authorized=false`; 실행기/callback은 없다. actual setter의 중복 캐시 생략·서버 POST·ACK 여부를 뜻하지 않는다. 저장 후보와 실제 값은 구분되며 실제 값은 공급된 다음 readback을 따른다. 원본이 `d.storage={}`/`d.game.mats=0`을 하는 조건도 결과 사본에만 반영하고 원본 입력은 보존한다.

모든 receipt는 `calculation_only=true`, `write_authorized=false`, `storage_io=false`, `network=false`, `restore_connected=false`, `full_restore_verified=false`. READY는 계산만, player 없는 입력은 REJECTED, namespace/owner/관측 누락·비지원 carrier/정밀도는 HOLD다. QA에서 원문이 잡지 않는 getter/JSON parse 예외는 SOURCE_THROW로 구분한다.

## 최신 main 원본 근거

원본4파일과 기존 데이터는 최신 main 대비 diff0. `game.html` SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 발췌별 행/hash는 source-oracle.json에 남겼다. 새 상수·정책을 설계한 것이 아니다.

| 원본 행 | 보존 계약 |
|---|---|
| 48521–48523 | 키 `hellcave_sharedStorage`/`hellcave_sharedMats`. 일반 창고는 get/parse 예외·비배열 JSON→[]; QA는 `JSON.parse(raw\|\|'[]')`의 타입을 그대로 반환하고 예외를 catch하지 않음 |
| 48527 | 일반 악의 `parseInt(v,10)`+finite/음수 검사+MAX_SAFE cap. QA는 Number 변환→`\|\|0`→0~MAX_SAFE clamp로 소수를 유지. "12.9"는 일반12/QA12.9, "0x10"은 일반0/QA16 |
| 3726–3729 | 저장 악의구슬 `max(0,floor(+saved\|\|0))`. 양수이고 shared와 다를 때만 max 인자 후보·세이브 사본 mats0. 다음 `_loadSharedMats`를 다시 읽어 G.mats를 결정. saved가 shared보다 작아도 setter 호출 조건과 실제 writer의 캐시 생략을 혼동하지 않음 |
| 48529의 정규화 표현식 | 후보의 `max(0,min(floor(+v\|\|0),MAX_SAFE))`만 readonly 계산. `_saveSharedMats` 본문/LS setter/server helper 실행0. `_matsSavedVal` 수정0 |
| 3741–3752 | slot storage[0]가 비어 있지 않을 때 shared 조회→비어 있을 때만 slice(0,200) 후보→이관 여부와 무관하게 d.storage={} 사본 계산. STORAGE 새 객체/_synced=false 후 다시 조회하는 원문 순서 유지 |
| 48537–48548,16259 | 최초 `_getStore`는 shared를 0번에 바인딩→다른 Array 층을 JS 숫자 key 순서대로 concat/비움→200캡→setter 호출 후보. store와 STORAGE[0]은 결과 내 같은 배열 참조. valid Array 경로에서 getStore 후 3752 초과조건은 이미 cap되어 false |

재조회가 이전 값/빈 배열/getter 실패를 돌려주는 fixture도 원문과 대조했다. 예를 들어 이관 후보가 있어도 다음 조회가 []면 계산상 창고는 []이며, 원문은 세이브 사본 storage를 비운다. 이를 실제 이관 성공으로 보고하거나 기존 실패 정책을 바꾸지 않는다. 반대 방향으로 공유에 항목이 이미 있으면 slot 항목을 합치지 않는다. 반복 복원에서 공유 악의구슬은 누적 합산되지 않는다.

## 숫자·입력 보존과 부분 지원

선행 player helper의 JS truthiness/Number 일부, slot reader의 strict JSON **문법 검사**, items helper의 graph copy/JS key 순서를 읽기 전용 재사용한다. 기존 파일 변경0. 새 JSON 해석은 18자리 이하 정수 토큰을 int64에서 double로 바꿔 안전 정수/불투명 item id를 보존한다. 문자열·배열·객체·bool/null과 key 순서를 유지하고, 입력/현재 owner/관측/후속 계산에 결과 수정이 닿지 않는다.

Godot의 `9007199254740991.0` 실수 리터럴은 실제 binary64가 원본보다1 낮았으므로, 최종 MAX_SAFE는 같은 원본 값의 **정수 리터럴→정확한 double 변환**으로 공급한다. 음의0도 비트로 보존한다. 이는 저장 형식 변경이 아니다. QA 전달용 binary64 태그는 테스트에서 해제하며 제품/세이브에 들어가지 않는다.

미입증 정밀도/형태는 정상 빈 값으로 만들지 않는다: JSON 19자리 이상 정수, 유효 숫자지만 finite/15자리 유효숫자/절댓값1e12 미만 범위를 벗어나는 소수·지수, lone surrogate/깊이128 초과는 HOLD. Number 강제변환의 큰 소수·정밀한 긴 소수/객체, pre-cap 저장 정수 문자열19자리 초과도 HOLD다. QA는 더 큰 양·음 decimal integer의 **최종 clamp**만 안전정수/0으로 정확히 계산한다. 일반 parseInt는 309자리 유효숫자의 overflow 경계만 HOLD이며, 더 긴 양수는 nonfinite→0 계약을 유지한다.

QA getter 자체는 non-array JSON을 그대로 반환할 수 있지만 후속 store/이관 계산은 검증한 Array subset만 지원해 나머지는 HOLD다. legacy string slice, 비객체 game/player, 순환/JSON 외 graph, 실제 플랫폼 namespace 결정도 HOLD. 저장 수리 규칙을 추가하거나 손상을 신규 저장으로 바꾸지 않는다.

## 실제 검수·실패 이력

Godot4.7.2/Node24.15.0. 신규 `EXODUSER-sv-shared-read-Isolated-20261020`; 기존 회귀는 각 USERDIR 상수 그대로. 매 Godot 직전 지정 pgrep predicate로 전역 count를 기록하고2 이상이면30초 대기했다. 자기 Godot 순차1개·매 종료 override.cfg 0byte. Main 부트/에셋 import 없음.

| 실행 | 실제 결과 |
|---|---|
| Node setup 관측 | 원문 slice 사이 개행이 없어 trailing line comment가 함수 선언을 삼킨 SyntaxError. 개행을 보존해 수정. 최초 stderr는 파일에 수집하지 못해 `oracle-setup-observation.json`에 **터미널 관측 요약**으로만 표시. Godot PASS가 아님 |
| shared-attempt1 | **142,792검사/59실패, exit1**, ERROR·SCRIPT ERROR·경고0. 실수 MAX_SAFE 상한/음의0와 긴 선행0 숫자 변환 불일치. 원로그 보존 |
| shared-attempt2 | **149,256/188실패, exit1**, ERROR·SCRIPT ERROR·경고0. 안전정수 문자열/동일 공유값 matrix를 추가해 상한 오류 전파까지 검출. 원로그 보존 |
| shared-verified | **149,486/0, exit0**, ERROR·SCRIPT ERROR·경고0. **읽기100 / store17 / restore131×2=262 원본 평가**. 범위1/199/200/201·재조회 실패/쓰기 미반영·공유 우선·parseInt/QA Number 차이·MAX_SAFE/음의0·객체/배열·입력/결과 불변·HOLD 경계 포함 |
| 기존 test_native_save_contract | **3,023/0, exit0**, ERROR·SCRIPT ERROR·경고0, 원본5생산자25평가 |
| 선행 test_native_inventory_restore | **126,863/0, exit0**, ERROR·SCRIPT ERROR·경고0, 272 fixture·원본544평가 |

검사 수에는 재귀 type/key/value/비트 비교가 포함된다. oracle은 실제 최신 원문 helper/본문을 평가하고, getter는 메모리 fixture만 읽는다. setter는 인자를 기록하는 stub으로 교체되어 원본 writer helper 실행0·실제 IO0이다. post-write readback은 독립 관측으로 공급하며 성공을 자작한 persistence 모형으로 대체하지 않는다. 실패 실행을 삭제/최종 통과에 합산하거나 실제 LS 왕복 PASS로 승격하지 않았다.

## 보호·실제 연결 HOLD·제출

- 공용6(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state), 타 담당/기존 테스트/기존 모듈, 원본4파일·데이터·project.godot 직접 변경0. R tracked INDEX/WORK diff0. 신규3파일+이 보고서+허용 CHANGELOG 절만 commit한다.
- 실제 localStorage/QA 저장소/namespace owner 설치, `_saveSharedStorage/_saveSharedMats/_persistSharedStorage`, `_matsSavedVal` 캐시·dirty/flush·3초 timer·서버 GET/POST/ACK는 **미연결 HOLD**다. 쓰기·파일 삭제·새 migration/version·형식 변경0. 다음 writer/lifecycle 작업 권한을 선취하지 않는다.
- 전체 dbRestore·실제 G/STORAGE 적용·SV-RESTORE-ITEMS 연결·입장/재시작 유지·실사용자/PC·화면/플레이 품질 검수는 미확인. 부분 계산 READY를 제품 복원 완료로 쓰지 않는다. 이번 계산에는 공용 파일 수정이 필요하지 않다.
- 알려진 선재 결함 원문: **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**. 이번 전체 로비 재실행·수정·PASS 승격 없음.
- docs 검색은 related-docs-search.log. 기존 trace/설계 정책·수치 변경0. root ignore test_*는 자기 신규 테스트만 명시 force-add하고 정상 pre-commit을 사용한다. 광역 add/main push/force push/훅 우회/바이너리 commit 없음.

원로그·명령·source-oracle·최종 summary·보고서 사본·원격 SHA 대조·정리 영수증: `/Users/fordeargamers/exoduser-wt/_out/sv-shared-read/`. branch/SHA/수치와 원격 일치·worktree 제거 결과는 같은 위치의 **DONE.txt**에 남긴다.

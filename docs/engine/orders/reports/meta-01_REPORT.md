# META-01 — 원본 XP 곡선 순수 모듈·경계 검증

## 결과·인수 범위

신규 `native_source_meta_exp_curve.gd`에 원본 `_calcMaxExp`의 두 분기를 이식했다. **새 모듈의 순수 곡선만 인수하며, 제품 State 연결은 0줄**이다. 최신 사용자 지시가 공용 파일 수정을 금지하므로 이전 추적 문서 §8의 State preload/RHS 치환과 실제 State 고레벨 fixture는 이번에 수행하지 않았다. 따라서 **제품의 Lv999→1000 maxExp 불일치는 아직 남는다.** 자연 고레벨 플레이·초월 일일 gate·세이브 완료를 주장하지 않는다.

| 항목 | 기준·결과 |
|---|---|
| 작업 / branch / worktree | `meta-01` / `codex/meta-01-20261020` / `~/exoduser-wt/meta-01` |
| 시작 원격 main | fetch 후 `f84e26ee0bbc929fb595b4c0af292b423588f325`에서 새 worktree 생성 |
| 선행 확인 | 최신 WORK_BOARD·MAC_ORDERS 읽음. 기존 trace 문서는 main에 아직 없으므로 이 스레드의 `30191be0dd3d0c60f459d72c624aa44b7ca30a13` 문서를 Git 객체로 읽음 |
| Godot | 원본 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, `4.7.2.stable.official.ed1daf0bf` |
| import 전 백업 | `~/Library/Application Support/Godot/` 전체 → `~/exoduser-wt/_backup/godot-appsupport-20261020-meta-01/`, 파일 68개. 원본 수정/복구 없음 |
| import | 자기 WT에서 1회, exit 0, stderr 비어 있음. 명령·원로그 `_out/meta-01/import.*` |
| 변경 파일 | 새 순수 모듈·Godot 생성 module UID·새 테스트, 이 보고서, `docs/CHANGELOG_SYNC.md` 맨 위 절 |
| 보호 | 공용 6개 스크립트·기존 테스트·game/index·설계 docs·WORK_BOARD 수정 0줄. **일반/데모 저장 game.mats 차이·저장 형식·docs/2_3·Q/E 보호** |

## 원본 근거·API

`game.html` blob `e755a2d98211ac2a6b4a53d8a1e3e7abe4714400`은 이전 추적과 동일하다. 아래 행 번호는 이번 시작 SHA 기준이다.

| 항목 | 최신 원본 행·그대로 옮긴 규칙 |
|---|---|
| 일반 곡선 | `43128–43133`: lv<1000이면 `~~((15+lv*2.5+lv*lv*.05)*Math.pow(1.001,lv))`. 양의 정수 1..999에서는 양수 int32 범위이므로 Godot `floori`와 동일 |
| 초월 곡선 | 같은 함수: lv>=1000이면 `Math.floor(5000000+(lv-999)*(lv-999)*10000)`. Godot는 64비트 정수로 계산·반환하여 signed32 wrap을 만들지 않음 |
| 신규 초기값 | `29018`: 신규 P의 maxExp15는 별도 초기값이며 `required_exp(1)=17`로 바꾸지 않음 |
| 정상 레벨업 caller | `43151`: 레벨 증가 후 `_calcMaxExp(P.lv)`. **이번 신규 모듈에 연결하지 않음** |
| 저장 복구 caller | `3601`, 개발/QA caller `61955,62224,62368`: **보호·미수정** |
| 공개 API | `static func required_exp(level: int) -> int`, RefCounted 순수 함수. 입력 계약은 정상 게임의 양의 정수 레벨. 새 clamp·cap·비용·날짜·RNG·저장 접근 없음 |
| 검증 범위 | 1..1500 모든 레벨을 실제 JS 함수와 대조. 초고레벨 수치 한계·잘못된 입력 정책·임의 정밀도는 인증하지 않음. 검증 범위를 새 게임 레벨 상한으로 사용하지 않음 |

주요 값: Lv999=142,258 / Lv1000=5,010,000 / Lv1001=5,040,000 / Lv1461=2,139,440,000 / Lv1462=2,148,690,000 / Lv1500=2,515,010,000.

현재 `godot/scripts/native_source_new_run_state.gd:523–557`의 EXP 선누적(:526)·while(:529)·초월 미이식 가드(:531–532)·일반식(:538)·SP/AP·후처리는 그대로다. 일반식을1000에 연장한142,679를 새 모듈의5,010,000으로 치환하는 작업은 **공용 파일 소유·연결 범위를 받은 다음 단위**다. 이번 테스트에 가짜 owner/provider를 넣어 제품 경계가 고쳐졌다고 보고하지 않는다.

## 검증·원로그

모든 원로그·명령 JSON·외부 runner는 `~/exoduser-wt/_out/meta-01/` 아래다. 영상·빌드 산출물은 없으며 원로그를 Git에 넣지 않는다. Godot 실행은 순차로 수행했다.

```sh
G=/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot
WT=/Users/fordeargamers/exoduser-wt/meta-01
OUT=/Users/fordeargamers/exoduser-wt/_out/meta-01
"$G" --headless --path "$WT/godot" --log-file "$OUT/import.engine.log" --import
"$G" --headless --path "$WT/godot" --log-file "$OUT/curve.engine.log" --script res://tests/test_source_meta_exp_curve.gd
node --test test/balanceExpCurve.test.js
python3 "$OUT/run-regressions.py"
```

새 테스트는 Main을 부팅하지 않아 override 없이 실행했다. 테스트 내부에서 ProjectSettings의 격리 이름을 `EXODUSER-meta-01-Isolated-20261020`으로 지정하고 실제 경로를 확인했다. user:// 파일 IO는 없으며 엔진 로그는 위 외부 경로로 보냈다. Main을 부팅하는 기존 회귀만 실행 직전에 각 파일 상수의 격리 이름을 `godot/override.cfg`에 넣고, 매번 `finally`에서 비웠다. 격리 상수 없는 contracts/encounter_factory/qe_binding은 Main 부팅·애플리케이션 user:// 저장 호출 없이 외부 로그 경로로 실행했다.

| 검증 | 실제 결과·증거 |
|---|---|
| 새 Godot 테스트 | **20 단정 / 0 실패 / skip 0**, 17개 독립 golden 값, signed32 경계, 1..1500 양수·증가 확인. `curve.stdout.log`, `.stderr.log`, `.command.json` |
| 실제 JS 원본 대조 | 새 모듈이 출력한1..1500의1500개 값과 `game.html`에서 추출한 실제 `_calcMaxExp` 함수를 Node로 평가해 **1500 일치 / 불일치0**. `source-oracle-compare.json`; 실제 inline Node 본문은 `source-oracle-compare.mjs`, argv는 `.command.json` 보존 |
| 기존 웹 oracle | **4 테스트 / 0 실패 / skip 0**. 두 HTML의 곡선·JSON 메모리 복구 계약. 실제 저장 파일 접근/형식 변경 없음. `web-exp-oracle.stdout.log` |
| 독립 코드 검토 | 다른 읽기 전용 에이전트가 공식·64비트·공용 미연결·테스트 인수 범위 확인. 수정 필요 결함 없음. 런타임 재실행을 대신한 검토로 계산하지 않음 |
| docs 동기화 | `rg -n '_calcMaxExp|native_source_meta_exp_curve|필요 경험치|초월 경험치' docs` 검색15행, `docs-keyword-search.log`. 기존 원본 수치는 변경하지 않았으므로 기존 설계표 정정 없음. 새 이식 상태·한계는 본 보고서와 CHANGELOG에 기록 |

### 기존 회귀 실측

지정 기본15종 중14종 통과·알려진 선재실패1종, 추가 XP회귀1종 통과다. 각 줄의 명령·원문·stderr는 `<테스트명>.command.json`, `.stdout.log`, `.stderr.log`, `.engine.log`에 별도로 보존했다. 선택 그룹 옵션 없이 전체 실행했으며 모든 skip은0이다.

| 테스트 | 단정/검사 또는 case / 실패 | exit | Main 격리 이름 |
|---|---:|---:|---|
| `test_contracts` | 5 case / 0 | 0 | Main 미부팅·상수 없음 |
| `test_p2002a_hud` | 36 / 0 | 0 | `EXODUSER-P2002A-Isolated-20261020` |
| `test_p2002b_minimap_corner` | 16 / 0 | 0 | `EXODUSER-P2002B-Isolated-20261020` |
| `test_p2001h_curtain_spawn` | 124 / 0 | 0 | `EXODUSER-P2001H-Isolated-20261020` |
| `test_p2001i_boot_intro` | 18 / 0 | 0 | `EXODUSER-P2001I-Isolated-20261020` |
| `test_p2001j_lesson_clock` | 21 / 0 | 0 | `EXODUSER-P2001J-Isolated-20261020` |
| `test_p2001k_lesson_practice` | 32 / 0 | 0 | `EXODUSER-P2001K-Isolated-20261020` |
| `test_p2001l_lesson_steps` | 66 / 0 | 0 | `EXODUSER-P2001L-Isolated-20261020` |
| `test_p3002_spawn_holes` | 298 / 0 | 0 | `EXODUSER-P3002-Isolated-20261020` |
| `test_p3003_regions` | 43 / 0 | 0 | `EXODUSER-P3003-Isolated-20261020` |
| `test_native_main_source_starter_state` | 148 / 0 | 0 | `EXODUSER-MainSourceStarter-Isolated-20261014` |
| `test_encounter_factory` | 3 case / 0 | 0 | Main 미부팅·상수 없음 |
| `test_p1002f_dedicated_hurte` | 381 / 0 | 0 | `EXODUSER-P1002F-Isolated-20261020` |
| `test_p1002g_kislash_hurte` | 220 / 1 | 1 | `EXODUSER-P1002G-Isolated-20261020` |
| `test_native_qe_binding` | 155 / 0 | 0 | Main 미부팅·상수 없음 |
| `test_p2001c_kill_rewards` | 45 / 0 | 0 | `EXODUSER-P2001C-Isolated-20261020` |

선재 실패 원문(기대값·제품·테스트 수정 없음):

```text
P1002G_FAIL per_enemy_coverage no native_hurte_halt emitted across combat
```

P1002G_RESULT는 `assertions:220`, `failures:1`, `halt_count:6`, `skipped:[]`, exit1이다. 사용자 지시·시작 WORK_BOARD의 P2-008a-FIX(빙결전사 etype20 `source_field_call_unavailable`)로 알려진 선재 결함에 해당한다. 이 실행 로그 자체에는 halt의 etype/reason 상세가 출력되지 않으므로 그 문자열을 새 관측 원문처럼 보충하지 않는다. 전체 원로그를 보존하며 해당 결함은 이 작업에서 고치지 않았다.

회귀 stdout/stderr의 엔진 ERROR·SCRIPT ERROR는0이었다. Main/Player를 만드는 검사에는 기존 Camera2D physics interpolation WARNING이 남았다. 경고 원문도 삭제하지 않았다. 카메라·리소스·기존 fixture 수정은 이번 범위에 포함하지 않는다.

## 남은 접점·제출

공용 State 연결·Main 실제999→1000/다중carry/부분거부 fixture·자연플레이는 미구현/미검증이다. 원본 초기15, XP 전처리, SP/AP, 자원 회복, 초월 gate, UI, 저장 형식은 그대로 보존한다. 일반/데모의 game.mats 저장 차이를 합치거나 새 serializer를 만들지 않았다. WORK_BOARD는 공용0줄 지시에 따라 변경하지 않고 이 보고서로 총괄에 인수 요청한다.

최종 커밋·원격 ref·R 보존 대조 결과는 마감 기록에서 확정하고 `~/exoduser-wt/_out/meta-01/DONE.txt`에 전체 SHA와 실제 수치를 기록한다. 자기 `codex/meta-01-20261020`만 push하며 main push·force·reset·병합은 하지 않는다.

## 커밋 인수 기록

| 항목 | 확인 |
|---|---|
| 구현·검수 체크포인트 SHA | `510404cb6373b92ce887c480d51e41fbca9d802b` — 새 모듈·UID·테스트·보고서·CHANGELOG의5경로만 포함 |
| pre-commit | `core.hooksPath=.githooks`, 정상 훅 실행·docs-sync 통과. `ALLOW_MISSING_DOCS`를 제거한 환경에서 커밋했으며 우회0. 원근거 `_out/meta-01/commit-implementation.trace.log` |
| 독립 결과표 검토 | 별도 읽기 전용 독자가16행 모두 `regression-results.json`과 숫자·exit·known 실패·skip을 대조해 차이0 확인. 재실행·검사 수에 더하지 않음 |
| R 검수 종료 시점 | 시작과 동일 branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, tracked INDEX/WORK 변경0 |
| 최종 제출 식별 | 이 SHA 기록을 추가하는 문서 후속 커밋을 포함한 최종 HEAD는 `DONE.txt`에 전체 SHA로 기록하고 자기 원격 ref와 대조한다. 구현 체크포인트와 최종 문서 HEAD를 구분 |

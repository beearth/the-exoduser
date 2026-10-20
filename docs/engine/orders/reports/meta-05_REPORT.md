# META-05 예약 패시브 큐 순수 정책

상태: **REVIEW_PENDING — 순수 정책 구현·검증 완료, 제품 writer 연결 없음**. 작업 ID `meta-05`, 브랜치 `codex/meta-05-20261020`.

## 기준·의존

착수 fetch 최신 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. META-04 최종 `51c6e51f6b2ca7f16cf368712ad53f5b51def5a7`는 main의 조상이 아니므로 사용자 지정대로 그 끝에서 분기했다. META-01→02→03→04 의존만 포함하며 main 병합·타 담당 변경 반입0. 최신 main의 `game.html`·`stat-panel-ui.js`와 parent 파일이 동일 바이트임을 `source-basis.json`에 기록했다. 메타 추적 문서는 main의 `docs/engine/FDG_SOURCE_TRACE_META_20261020.md` 순서안5를 읽었고 해당 문서 자체를 분기본에 복사/수정하지 않았다.

사용자 지시에 따라 R에서 `worktree add --no-checkout -b` 후 `sparse-checkout set --no-cone`으로 `/AGENTS.md /godot/ /docs/ /engine/ /test/ /tools/ /game.html /index.html /stat-panel-ui.js /.githooks/ /package.json`만 지정했다. 새 인덱스를 `read-tree -mu HEAD`로 초기화하고 tracked clean을 확인했다. R의 HEAD/branch/index/work는 변경하지 않는다.

## 원본과 API

| 원본 근거 | 계약·구현 |
|---|---|
| main `game.html:27699–27728` | 현재 PASSIVE_DEF26종·각max10. 정책에 두 번째 키 registry를 만들지 않고 caller의 PASSIVES 소유키/정의 snapshot을 인자로 받는다. 테스트26키/상한을 실제 main 정의와 Node에서 대조 |
| `51219–51220` | `items(raw_queue, passives)`: JS Array 대응 Array만 허용, 문자열이며 PASSIVES own-key인 항목을 먼저 필터한 뒤260개. 중복/FIFO 보존·입력 미변경 |
| `51222–51229` | `process(raw_queue, passives, ap, definitions)`: 첫 일치 정의 사용. 정의 없음/상한 도달 선두 제거. 부족 시 선두 유지하고 즉시 break, 뒤 저렴한 항목 건너뛰기0. AP차감→rank+1→shift→투자수 증가 순서 |
| `stat-panel-ui.js:4–5` | META-04 `rank_cost` 읽기 전용 재사용. 구매 전rank0..9 비용1/1/1/2/2/2/3/3/3/5, 10rank 총23AP, 다른 numeric index fallback5 |
| `51231–51233` | process 결과 `{queue,passives,ap,invested,recalculation_required}`. 정리만 있어도 결과 queue 반환. 실제 투자>0일 때만 기존 재계산 요청 true; 이 모듈은 applyStats를 직접 호출하지 않음 |
| `51251–51256` | `enqueue`: 정의·양의 safe integer amount·rank+동일키 예약수+amount≤max 검사. 거부 null, 성공 새 배열. 원본은 append 후 별도260절단 없음. 현행26×10 정상 상태는 총260 이내이며 legacy/custom 정의도 임의 추가 clamp하지 않음 |
| `51258–51260` | `cancel`: 필터/260제한 이후 인덱스로 개별 제거. safe integer·0≤index<len, 거부 null. 예약/취소는 AP/rank를 변경하지 않음 |
| `43157`, `51243–51248` | 원본 addExp의 실제 레벨업 후 처리·계획 적용 뒤 처리는 후속 제품 caller 근거만 기록. 이 단위는 State/addExp/applyPlan/UI 연결0. 환불 시 예약제거 caller도 수정0 |

숫자 rank/AP 입력 domain의 메모리 계산이다. 임의 문자열/객체 rank·AP의 JS coercion은 지원 계약에 넣지 않는다. raw 큐 값·예약 amount·취소 index의 타입 거부는 원본대로 검사한다. `_valid_count`는 META-04의 정확한 safe integer 상수9007199254740991을 읽기 전용 재사용하며 새 제한을 추가하지 않는다. definitions는 현재 owner가 제공한 `{key,max}` 구조, passives 값은 숫자 snapshot이다. 반환한 배열/랭크는 입력과 독립이며 null 거부는 sanitize 결과의 커밋도 요청하지 않는다.

## 검증

Godot `4.7.2.stable.official.ed1daf0bf`, Node v24.15.0. 로그 위치 `/Users/fordeargamers/exoduser-wt/_out/meta-05/`.

| 실행 | 실제 수치 | exit / ERROR / SKIP | stderr WARNING |
|---|---|---|---|
| 신규 test_meta_passive_queue | **1102단정/0실패**, actuals1015건 | 0 / 0 / 0 | 0 |
| 최신 main JavaScript 실제 본문 대조 | **1015건/0불일치**, 정의26종·각max10 확인 | 0 / 0 / 0 | 0 |
| META-04 test_meta_point_policy | 1076/0 | 0 / 0 / 0 | 0 |
| META-03 test_meta_salvage_policy | 68/0 | 0 / 0 / 0 | 0 |
| META-02 test_meta_enhancement_policy | 70/0 | 0 / 0 / 0 | 0 |
| META-01 test_source_meta_exp_curve | 20/0 | 0 / 0 / 0 | 0 |
| test_contracts | 5 case 통과/failed_assertions0, only=[] 전체실행 | 0 / 0 / 0 | 0 |
| test_p2001c_kill_rewards | 45/0, 그룹16+8+21·fallback_paths_used=false | 0 / 0 / 0 | 2 |
| 최초 editor import | 실행12.05초, 테스트 수치에 합산하지 않음 | 0 / 0 / 해당없음 | 0 |

신규 검사·원본 대조·회귀 모두 첫 실제 실행에서 위 수치다. 테스트 조건/기대값/기존 테스트 수정0. 최신 main을 다시 fetch해 `e556b617` 및 원본3종 동일 바이트를 재확인했다(`main-refresh-and-r-audit.json`). game.html SHA256=`4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, stat-panel-ui.js=`30ef4dd721f493d4254b29b0ae994b73688cd2220e67899243fd9af2c28d898d`.

신규 goldens는 오염 배열/비배열·own-key·필터 후260·중복 FIFO·max/정의없는 선두 제거·선두 AP부족 중단·23AP→10rank·22AP→rank9/AP4·예약 잔여상한·safe integer/비정수/문자열/불리언 거부·필터 후 취소 인덱스·全26×10=260투자/598AP·46번 AP1 순차 지급·입력 및 결과 독립을 포함한다. broad actuals는 rank/잔액/예약수/amount 경계를 원본과 비교했다. 큰 safe 경계는 높은 기존rank와 amount1로 검사해 거대한 배열을 만들지 않는다.

p2001c는 META-04 parent 파일 그대로이며 main의 후속 QA seed 변경을 임의 반입하지 않았다. 기존 Camera2D/종료 경고를 실제 ERROR와 구분한다. stderr 원문(`test_p2001c_kill_rewards.err.log`):

```text
WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.
     at: _update_process_callback (scene/2d/camera_2d.cpp:88)
     GDScript backtrace (most recent call first):
         [0] _ready (res://scripts/main.gd:212)
         [1] _boot_main (res://tests/test_p2001c_kill_rewards.gd:135)
         [2] _test_reward_owner_units (res://tests/test_p2001c_kill_rewards.gd:147)
         [3] _run (res://tests/test_p2001c_kill_rewards.gd:37)
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
```

증거: `validation-summary.json`, `meta05.json/.out.log/.err.log/.engine.log`, `meta05-source-comparison.json`, `source-comparison.out.log/.err.log`, `compare-source.cjs`, `source-main-*`, 회귀별4로그/metadata, `godot-count.log`, `run.py`. JS source-body 하니스 사전 self-check7개도 별도 로그로 보존하며 Godot 단정 수에 더하지 않는다.

실행마다 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`로 확인하고2이상이면30초 대기한다. 새 테스트는 `EXODUSER-meta-05-Isolated-20261020`, 기존 회귀는 각 파일 USERDIR/ISOLATED_DIRECTORY 상수를 사용한다. 상수 없는 contracts는 작업 격리명을 사용한다. override.cfg는 매회 설정하고 finally에서0byte로 비운다. 다른 작업 Godot를 중단하지 않는다.

신규 테스트의 actuals를 출력한 뒤 Node가 최신 main의 `_passiveQueueItems`·`_processPassiveQueue`·queuePassive/cancelQueuedPassive 콜백 본문과 stat-panel-ui.js 자체를 VM에서 실행하여 결과 구조/수치를 exact 비교한다. GDScript 계산을 JS로 재작성한 oracle이 아니다. Godot exit0만으로 성공 처리하지 않고 결과행·실행수·failures·SKIP·stderr를 분리한다.

## 보호·제출

`native_meta_passive_queue.gd`/자기UID, `test_meta_passive_queue.gd`/자기UID, 본 보고서, CHANGELOG_SYNC 상단 절만 변경한다. `docs-search.txt`에 예약/큐 관련 docs 전체 검색 결과를 기록했다. 웹 UI/저장 문서 수치는 그대로이며 이식 상태·미연결 범위는 본 보고서로 동기화한다.

공용6파일·기존 META 정책/테스트·raw_grit_restore·game.html·stat-panel-ui.js·저장 형식/실제세이브·Q/E·보호docs2_3 모두0줄. `protected-before.json`의 기존 모든 scripts/tests 및 원본151개 해시가 동일함을 확인했다(`protected-audit.json`). 제품 State 연결은 요청 scope 밖이므로 구현 완료를 실제 자동투자·능력치 효과·자연플레이·영구저장 완료로 확대하지 않는다.

자기 브랜치만 정상 pre-commit hook을 거쳐 commit/push하고 원격 SHA 일치 후 DONE.txt에 기록한다. main push·force push·git add -A·훅 우회0. 보고서 사본/로그/DONE은 worktree 밖 `_out/meta-05/`에 보존하고, 사용자 지시대로 자기 worktree만 `git worktree remove --force`로 제거한다. 최종 SHA와 제거 검증은 DONE.txt가 정본이다.

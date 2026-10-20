# META-06 demo·초월 제한 순수 정책

상태: **REVIEW_PENDING — 순수 정책 구현·검증 완료**. 작업 `meta-06`, 브랜치 `codex/meta-06-20261020`.

## 범위 판정·기준

최신 main 메타 추적 문서 `docs/engine/FDG_SOURCE_TRACE_META_20261020.md:340`의 META-06은 `native_meta_exp_gate_policy.gd`와 `test_meta_exp_gate_policy.gd`를 생성하고 **“단계별 반환값만 먼저 검증. 실제 State gate 교체는 별도 소비 배정”**하는 단위다. 순서안은 남아 있고 이 단위의 필수 공용·State·저장 수정은0줄이다. 따라서 승인된 순수 정책만 구현했다. 제품 연결은 하지 않았으며 다음 META-07도 착수하지 않는다.

착수와 마감 재fetch의 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. META-05 `2ec75a6fea87339120178a5700b141281317bc2c`가 main의 조상이 아니므로 그 끝에서 분기했다. META-01·05 및 그 선행 의존을 보존하고 main 병합·타 담당 변경 반입0. `game.html`과 `stat-panel-ui.js`는 parent/main 동일 바이트, 추적 문서는 main에서 읽고 분기본에 복사하지 않았다.

R에서 `worktree add --no-checkout -b codex/meta-06-20261020 ... 2ec75a6f` 후 `sparse-checkout set --no-cone`으로 `/AGENTS.md /godot/ /docs/ /engine/ /test/ /tools/ /game.html /index.html /stat-panel-ui.js /.githooks/ /package.json`만 받았다. 새 인덱스를 `read-tree -mu HEAD`로 초기화하고 tracked clean 확인 후 작업했다. R의 기존 branch/HEAD/index/work는 보존한다.

## 원본·API 계약

| 원본 행 — 최신 main game.html | 옮긴 계약 |
|---|---|
| `16644–16648` | 공개 demo 플래그는 caller가 bool로 주입. 정책 상수 `DEMO_LEVEL_CAP=100` 보존. 빌드 target 선택/스테이지 잠금·합체 허용목록 변경0 |
| `43122` | `date_key(local_year,local_month,local_day)`는 로컬 civil 날짜 주입. month는1기반, month/day만2자리·year 무패딩. 원본 getFullYear/getMonth/getDate와 동일하며 UTC 변환·실제 clock 읽기0 |
| `43123–43127` | `transcendence_gate(state,today)`는 날짜가 없거나 falsy/서로 다르면 먼저 날짜를 today·count0으로 바꾸고 count<1 비교. 같은 날짜 count1이면 차단. 과거뿐 아니라 미래 날짜도 다르면 reset하는 원본 유지 |
| `43137–43138` | `entry_gate(state,demo,today)`: demo100 선검사, 그 뒤 lv>=1000 일일 제한. 차단 시 `min(exp,maxExp−1)`로 낮은 기존 XP 유지. demo 차단이면 날짜/count를 건드리지 않음 |
| `43146–43148` | `loop_gate`: caller가 exp>=maxExp 확인 후 호출. 순서는 entry와 같고, 차단 시 exp를 maxExp−1로 **직접 대입**. 뒤 레벨이나 보상을 먼저 적용하지 않음 |
| `43149–43154` | `after_level_up(state)`: 이미 증가한 lv가 **>1000**일 때만 `(count||0)+1`. 999→1000은 일일 횟수 소비0. 날짜 초기화나 count의 새로운 상한 clamp를 추가하지 않음 |

입력은 런타임 필드명 `lv/exp/maxExp/_transLvDate/_transLvCount`를 가진 메모리 snapshot이다. 반환 snapshot은 상위 Dictionary를 복사하고 정책 소유 scalar 필드만 바꾼다. gate 결과 `{allowed,reason,state}`, daily 결과 `{allowed,state}`, 증가 후 결과 state, 날짜 결과 String. 이 구조를 제품 저장 스키마에 추가하지 않는다.

지원 domain은 정수 lv, 유한 숫자 exp/maxExp, 숫자 또는 부재인 count다. count NaN은 비교 시 거부·증가 시 `||0` 폴백을 검증한다. 문자열/객체/null count의 임의 JS 숫자 coercion은 지원 계약에서 제외한다. 같은 현재 날짜에 count가 아예 없으면 JS undefined<1과 같이 false이며 새0을 만들지 않는다. 날짜 자체는 부재/null/빈문자열/비문자열/다른 문자열을 원본 strict 비교대로 reset한다. source `_canTransLv`의 부수효과를 새 제품 State에 쓰는 기능은 없다.

매 초월 검사마다 **새 로컬 날짜를 주입**해야 한다. XP 지급 시작 때 날짜를 한 번만 캐시하면, 원본에서 같은 addExp 처리 도중 자정이 바뀌는 경우와 달라진다. 실제 OS/local clock 취득은 미래 caller 소유다. API에 UTC나 자동 clock 기본값을 넣지 않았다.

## 실제 검증

Godot `4.7.2.stable.official.ed1daf0bf`, Node v24.15.0. 원로그 `/Users/fordeargamers/exoduser-wt/_out/meta-06/`.

| 실행 | 실제 수치 | exit / ERROR / SKIP | WARNING |
|---|---|---|---|
| 신규 test_meta_exp_gate_policy | **1034단정/0실패** | 0 / 0 / 0 | 0 |
| 최신 main 실제 JS 본문 독립 대조 | **995결과/0불일치**: API987건+테스트 전용 조합8건 | 0 / 0 / 0 | 0 |
| META-05 test_meta_passive_queue | 1102/0 | 0 / 0 / 0 | 0 |
| META-01 test_source_meta_exp_curve | 20/0 | 0 / 0 / 0 | 0 |
| META-04 test_meta_point_policy | 1076/0 | 0 / 0 / 0 | 0 |
| META-03 test_meta_salvage_policy | 68/0 | 0 / 0 / 0 | 0 |
| META-02 test_meta_enhancement_policy | 70/0 | 0 / 0 / 0 | 0 |
| test_contracts | 5case 통과·failed_assertions0·only=[] 전체실행 | 0 / 0 / 0 | 0 |
| test_p2001c_kill_rewards | **46/0**, 그룹16+8+22·fallback_paths_used=false | 0 / 0 / 0 | 2 |
| editor import | 최초12.318초·테스트UID 갱신2.162초, 테스트 수에 합산0 | 0 / 0 / 해당없음 | 0 |

첫 실제 테스트 실행에서 위 수치를 확인했다. 새 테스트가 최초 import 뒤 작성돼 UID가 없었던 것을 제출 검사에서 발견했고, Godot editor import를 한 번 더 실행해 자기 UID를 정상 생성했다(`import-test-uid.*`). 단정 삭제/완화·기대값 변경·기존 테스트 수정0. p2001c는 parent 원본 파일 그대로다. 기존 live 처치 검사는 `test_p2001c_kill_rewards.gd:233`에서 각 hurtE outcome마다 단정하므로 이전 META-05의45개와 이번46개를 같은 고정 단정 수로 바꾸지 않는다. 이번 live그룹22개·forced_actor_fields35를 실제 결과로 기록하며 main의 후속 QA seed 변경은 임의 반입하지 않았다.

핵심 goldens: 날짜 월/일 패딩·year 무패딩·윤일/연말, 새 날짜/동일 날짜/미래 날짜·부재count·NaN, demo 선검사와 날짜 미변경, entry min/loop 직접대입 차이, 999→1000 count0·날짜 미접촉, 1000→1001 count1·당일 다음 XP 지급 차단, 다음 로컬날짜 재허용, 999에서 다중상승 후 일일 cap clamp, demo99→100 내부차단/이후 진입차단. XP 지급 도중 today/today/tomorrow/tomorrow를 주입한 조합은 **1000→1002·날짜21일·count1·최종XP5,089,999·clock조회4회**로 원본과 일치한다.

테스트 조합8건은 gate 반환값+META-01 curve와 원본 SP/AP 순서를 fixture 안에서만 연결한다. trans=true의 고정 XP를 사용하고 /3·보너스 계산은 이 조합에서 실행하지 않는다. 최신 JS는 `_getTodayStr`/`_canTransLv`/`_calcMaxExp` 실제 함수, addExp의 진입·while·카운트 본문을 추출해 VM에서 그대로 실행한다. 날짜 formatter 검사는 Date의 **로컬 getter만** 제공한 주입 clock을 사용하고, gate는 검사마다 주입 날짜를 소비한다. GDScript 공식을 JS로 다시 쓴 oracle이 아니다. 조합 범위에 예약큐·회복·스킬 해금·UI·저장 후처리는 없다. 별도 source-body 하니스 self-check5개는 Godot 단정 수에 합산하지 않는다.

Godot 실행마다 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 기록했고 이번 모든 실제 실행 전 count1이었다. runner는2이상이면30초씩 대기한다. 신규 격리는 `EXODUSER-meta-06-Isolated-20261020`, 기존은 각 파일 상수명 그대로, 상수 없는 contracts만 작업 격리명이다. override.cfg를 매회 설정하고 finally0byte로 비웠다. 완료 판정은 exit0과 함께 결과행·실행수·failures·SKIP·stderr를 확인했다.

p2001c stderr 원문은 다음과 같고 ERROR와 구분한다(`test_p2001c_kill_rewards.err.log`).

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

증거: `validation-summary.json`, `meta06.json/.out.log/.err.log/.engine.log`, `meta06-source-comparison.json`, `source-comparison.out.log/.err.log`, `compare-source.cjs`, `source-extracted.js`, `source-main-*`, 회귀별 원로그/metadata, `run.py`, `godot-count.log`. 최신 main 재fetch에도 game.html·stat-panel-ui.js·추적문서3종 동일 바이트(`main-refresh-and-r-audit.json`). game.html SHA256=`4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.

## 공용 연결 경계·보호·제출

필수 공용 수정0줄로 META-06을 마쳤다. 제품 소비를 별도로 배정할 경우의 **미수정 접점**은 다음과 같다. 이번 결과로 기존 native gate가 교체됐다고 판단하지 않는다.

| 현재 파일·위치 — parent 기준 | 미래 소비에 필요한 범위와 원본 근거 |
|---|---|
| native_source_new_run_state.gd:523–526 | apply_native_add_exp의 XP 가산 전 demo/일일 진입 검사 후보. 원본43137–43138. 실제 local 날짜/provider 및 `_transLvDate/count` runtime owner가 선행 |
| 같은 파일:529–532 | while의 기존 `unported_branch_active:transcend_level_gate` 유지 중. 원본43147–43148 gate의 소비 교체는 별도 정확 scope 필요 |
| 같은 파일:533–542 | lv 증가 후 원본43154 카운트 증가 소비 후보. 기존538의 일반식은 META-01 curve 실제연결도 아직0줄이므로 별도 의존이며 이 단위에서 고치지 않음 |
| 원본 game.html:3612/3546 등 | date/count의 복원/직렬화는 TRACE-SAVE 보호 접점. 저장필드 추가·마이그레이션·serialize 연결0 |

관련 docs 전체 검색은 `docs-search-all.txt`에 보존했다. 원본 값은 최신 main 실행부를 따르고, 기존 balance 문서 초월 보상 표와 실행 SP/AP의 차이는 main 추적 문서의 기존 분류를 유지한다. 이 작업에서 밸런스 표/다른 담당 문서를 바꾸지 않는다. 이식 상태·수치·한계는 본 보고서와 CHANGELOG_SYNC 상단 절에 동기화한다.

커밋 범위는 신규 policy/자기UID·새 test/자기UID·본 보고서·CHANGELOG_SYNC의6파일뿐이다. 공용6파일·기존 META 정책/테스트·raw_grit_restore·game/index/stat-panel 원본 등 **153개 보호 파일 해시 동일**(`protected-audit.json`). 저장 형식·실제 세이브·Q/E·보호docs2_3·State/UI/능력치/재화 writer0줄이다. 순수 gate 검수를 제품 초월·demo 제한·자연플레이·영구저장 인수로 확대하지 않는다.

자기 브랜치만 정상 pre-commit hook commit/push하고 원격 SHA와 대조한다. main push·force push·git add -A·훅 우회0. 보고서/코드 사본·원로그를 `_out/meta-06/`에 보존하고 DONE.txt를 기록한 다음 자기 worktree만 제거한다. 최종SHA·R 불변·제거 검증은 같은 경로 DONE.txt/최종audit에 기록한다. 다음 단위 자동 착수0.

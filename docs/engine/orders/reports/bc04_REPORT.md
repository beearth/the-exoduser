# BC04 — 1장 보스 선택기·콤보·RNG 순서

## 기준·의존·소유

| 항목 | 확인 |
|---|---|
| 작업·브랜치 | `bc04` / `codex/bc04-20261020`. 사용자 지시대로 `git worktree add --no-checkout -b` 후 non-cone sparse checkout. 생성 경로 `~/exoduser-wt/bc04` |
| 최신 main 원본 | fetch한 `e556b617190c325ca39f5add04357f5dea5ca87e`; game.html 65,692행·SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 작업 기준의 game.html과 byte 동일 |
| 선행 | BC03 `349ec241c12e403499a4b063a94e692fdd396543`가 main에 없어 그 끝에서 분기. BC01 catalog/BC02 spawn/BC03 utility 및 기존 테스트는 읽기만 함 |
| 충돌 사전 확인 | 최신 main `docs/engine/orders/WORK_BOARD.md` 보스 행60 TRACE-BOSS-CH1은 문서, 행66 BC01은 catalog 단위. BC04 selector·신규 테스트 쓰기 경로 중복 없음. 작업판을 공용 변경하지 않고 이 보고서로 총괄 인계 |
| 소유 경로 | 신규 `godot/scripts/native_ch1_boss_selector.gd`·`godot/tests/test_boss_ch1_bc04_selector.gd`와 실제 생성된 각 UID, 이 보고서, 허용된 CHANGELOG_SYNC 맨 위 절만 |
| 공용·타 담당 | main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state·기존 모듈/테스트·project.godot·WORK_BOARD·원본·설계 docs·Q/E·저장 형식 수정0. R HEAD/branch/INDEX/WORK 및 index byte 불변 확인 대상 |

sparse 경로는 `/godot/ /docs/ /tools/ /.githooks/ /AGENTS.md /game.html /index.html /.gitignore /*.js /*.json`뿐이다. 대용량 웹 에셋/output·node_modules를 받지 않았다. 최초 빈 index는 같은 HEAD의 `git read-tree -mu HEAD`로 초기화했다. 필요한 훅 경로를 포함했으며 checkout에 제품 변경을 섞지 않았다. 원로그와 실행 프로젝트는 `~/exoduser-wt/_out/bc04/`에 두고, push·원격 SHA 대조·DONE 작성 후 자기 worktree만 제거한다. 브랜치는 남긴다.

## 원본 행·정확 계약

| game.html 행 | 구현한 동작 |
|---|---|
| 38373–38378 | ordinary CH1 진입. CD 감소는 경직/idle 검사보다 먼저. `i < BOSS_MOVES.length(59)`의 양수 CD만 sp 차감하고 0 clamp 없음. 배열 길이가61이어도 idx59/60은 감소하지 않음 |
| 38379–38385 | stunned>0 또는 s!=idle이면 이 뒤 쓰기 없음. engage 기준180−phase×20, d>기준+30 approach / d<50 retreat / 나머지 engage. bossPatT부터 sp 차감 후 patT>0 또는 d>500 또는 d<20이면 선택·난수0 |
| 38387 | 선택 가능 시점에만 ps.avgDist=old×.95+d×.05를 반환 snapshot에 반영. null/missing ps는 유지. {}의 누락 avgDist는 JS처럼 NaN 전파하며 0을 넣지 않음 |
| 38389–38402 | 진행 중 combo의 id를 찾고 phase·최종 stage Set·명시 idx CD≤0 검사. CD 배열 자체 부재와 존재하지만 slot 부재를 구분. 유효하면 index++, CD=move.cd×ph.cdM, patT=trunc(6+u×6), history/streak, 조건부 feint/delay, start command 순서. 실패한 진행 combo만 null/0으로 리셋 |
| 38405–38410 | 원본59 ordinal 순서로 BC03 점수 평가. CH1 외 등록은 Set gate로−1·RNG0이며 점수 배열의 slot은 유지. 양수 점수 없으면 patT=10+u×10 후 종료 |
| 38412–38424 | 양수 후보1개이면 roulette draw0. 2개 이상이면 score 내림차순·동점 원본 ordinal 오름차순 정렬, 상위 min(6,n)만 weight=max(.001,score), r=u×합을 차례로 빼 r≤0 첫 후보 채택. r=0·동점·7번째 제외를 원본과 대조 |
| 38425–38430 | debug true일 때만59개 점수 기록. 기존 debug값은 false일 때 지우지 않음. history 존재 시 append 후 길이>5이면 shift 한 번만 수행. ranged이면 streak0, 그 외 이전값\|\|0에+1. 명시 idx CD 기록 후 patT=(bossPatCd+u×15)×ph.cdM |
| 38432–38435 | combo gate는 항상1회. 성공하면 원본 COMBOS 순서에서 첫 id·phase·모든 seq의 최종 Set 통과로 필터, 남은 후보가 있을 때만 choice draw1회·index1. gate 실패/후보0일 때 기존 exhausted combo를 임의로 지우지 않음 |
| 38399–38400 / 38438–38441 | canFeint일 때만 feint draw, canDelay>0일 때만 delay draw. 성공 delay=trunc(move.tele×move.canDelay). 원본 _bossStartPattern 실행 전 경계까지만 command로 반환; 패턴 본체의 추가 난수/actor 효과는 BC06 의존 |
| 16648 / 17054–17056 | 현 원본 `_DEMO_LAST_STAGE=0`인데 finale는 동시에 stage3을 요구해 도달 불가. 이를 근거로 ordinary CH1 범위만 구현하며 전용 finale AI를 대체 구현하지 않음 |

추적 문서의 history “최대5”는 정상 생성 상태에서의 결과다. 외부 입력이 이미6개라면 원본은 append 후 shift 한 번으로 여전히6개이며 그대로 보존했다. CD의 명시 idx와 배열 ordinal을 혼동하거나 고정 프레임을 추가하지 않았다. 관련 docs 전체 키워드 검색 목록은 `_out/bc04/docs-matches.txt`, 최신 main 추적 문서/작업판 읽기 사본도 원로그에 있다. DESIGN LOCK 및 기존 설계의 코어 수정 금지 범위는 읽기만 하고 새로운 독립 모듈의 구현 현황은 여기와 CHANGELOG에만 기록한다.

| 공개 API | 상태·소유 경계 |
|---|---|
| `source_receipt()` | 원본 main·해시·행·BC03 의존·demo gate 조건. live_selection_connected=false |
| `select_tick(si,enemy,sp,distance,ps,rng,boss_debug=false)` | READY이면 enemy/player_stats 다음 snapshot, outcome, 선택 시 start_pattern command, 실제 요청한 RNG ledger 반환. 모든 입력 read-only. 자동 적용·노드·전역 IO·전역 RNG·일반적 AI 연결0 |
| `pick_top_six(scores,rng)` | 동일한59-slot 점수표를 받는 가중 선택 경계. 원본 best 및 ordinal/조건부 draw를 단독 검증하는 보조 API. 메타데이터/등록 기술은 변경하지 않음 |
| NOT_READY | 미소유 stage/phase·미지원 입력 shape·필요 RNG 부재/잘못된 unit이면 적용 가능한 enemy/player_stats/start_pattern은 null. 이미 소비된 provider 호출은 ledger에 남기며 RNG rollback을 가장하지 않음 |
| 지원 값 | 실제 BC02 snapshot의 numeric/Array/Dictionary/null 형태. cooldown Array null slot은 JS의 absent/hole을 표현. 명시 JS null slot의 coercion 등 임의 외부 JS 객체 전체를 지원한다고 주장하지 않음. actor/기존 stats writer 교체0 |
| RNG 순서 | 새 선택: 각 허용 score → 후보2개 이상 roulette → pattern timer → combo gate → 후보 있을 때 choice → canFeint일 때 feint → canDelay>0일 때 delay. 연속 combo: combo timer → 조건부 feint → 조건부 delay. gate는0, 양수 점수 없음은 retry timer1 |

## 독립 검증

신규 테스트는 `EXODUSER-bc04-Isolated-20261020`을 ProjectSettings 두 값과 실제 OS userdir로 검증한다. `_out/bc04/selector-project`의 source/test는 제출본과 byte 동일하다. 기존 테스트는 수정하지 않고 각 상수의 격리 프로젝트에서 실행하며, 상수가 없는 contracts는 `EXODUSER-bc04-Contracts-Isolated-20261020` wrapper를 사용한다. wrapper의 project.godot은 userdir 이름만 다르고 scripts/tests/assets/data/scenes/port_modules는 자기 worktree에 연결한다.

독립 Node VM에서 최신 main과 같은 원본 BOSS_MOVES·BOSS_COMBOS·BOSS_PHASES·최종 CH1 Set·_bossScore·_bossAI를 행 위치 그대로 추출해 실행했다. 실제 `_bossStartPattern`만 command 기록 경계로 대체하고, finale stub은 위의 현행 불가능 조건을 근거로 둔다. 실제 selector 모듈로 expected를 만들지 않았다. 2,723개 원본 실행 중 선택2,399·미선택324, roulette 경계25개를 비교한다. 각 경우 enemy/ps 전체 key·값, command, RNG field/line/unit/순서·개수, 입력 read-only를 검사한다. 부동소수점은 `1e-12 × max(1,|expected|)` 이내이며 배열순서/문자열/boolean/key 존재는 정확 비교한다. timer6·CD50 등 핵심 정수값은 별도 정확 동등식으로도 단정한다. NaN 기대는 별도 marker로 비교한다.

| 독립 표본 | 포함한 경계 |
|---|---|
| 일반 선택 | si0..3×phase0..4, d19/20/49.5/50/130/engage엄격경계/500/501, sp.5/1/2, null/실제 ps·history/streak·debug |
| 콤보 | 모든 CH1 허용 move/phase, timer u0=6, cd100×.5=50, feint/delay 엄격확률 경계, bad id/phase/Set/CD/hole, 음수·분수 index, exhausted 보존 |
| 타이머·상태 | stunned/비idle에서도 양수CD만 감소, idx58감소와idx59/60불변·음수 잔여, blocked/all-CD·후보1개, history부재/null/[]/길이6, 각si40회 연속 snapshot 호출 |
| 가중 선택 | 정확 동점 ordinal·r0·max legal u·7/8번째 후보 제외·.001 floor·양수0/1개시 roulette0. 원본38412–38424 블록의 별도 wrapper와 비교; 강제 점수표는 실제 보스 수치가 아님 |
| 실패·접점 | provider 부재·잘못된 unit/후반 실패 후 ledger 보존, unsupported shape/stage, 실제 BC02 fields 수신·선택·원본 입력 불변. 실전 actor/피해/성능 증거로 세지 않음 |

원본 추출은 `source_oracle.mjs`, `source-extract.js`, `roulette-source.js`, `source-oracle.json`, test 전사 도구는 `build_test.py`다. 테스트에는 독립 oracle 기대값을 literal JSON 행으로 넣어 oracle 재실행 없이도 검증할 수 있다. 재현 시 브랜치를 동일 sparse 경로에 다시 받고 아래에 새로운 run basename을 쓴다. 기존 basename은 원로그 보존을 위해 재사용하지 않는다.

```sh
cd ~/exoduser-wt/bc04
node ~/exoduser-wt/_out/bc04/source_oracle.mjs
python3 ~/exoduser-wt/_out/bc04/run_one.py bc04-review-01 ~/exoduser-wt/_out/bc04/selector-project test_boss_ch1_bc04_selector --source-game=/Users/fordeargamers/exoduser-wt/bc04/game.html
```

모든 Godot 실행 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 실행하고2개 이상이면30초씩 대기한다. 각 count/시각은 `*.gate.jsonl`에 기록하며 다른 실행창/프로세스 종료0이다. stdout/stderr 원문은 `.out/.err`, 엔진은 `.engine.log`, 정확 argv/cwd/exit/ERROR/RESULT/시간은 `.json`에 보존한다.

## 실제 결과·마감

Godot `4.7.2.stable.official.ed1daf0bf`로 실행했다. 아래 시간은 engine 실행 구간이며 pgrep 대기는 별도다. 신규 최초 실행은 count2 때문에30초씩4회 대기한 뒤 count1에서 시작했다. 모든 필수 실행은 exit0·ERROR0이며, 테스트는 RESULT 존재·단정0 아님·skip/실패0을 확인했다. 재시도나 숨긴 실패는 없다.

| 검사 / 원로그 basename | 실제 결과 | exit | ERROR | 실행 초 |
|---|---|---:|---:|---:|
| 신규 최초 / `bc04-01` | 21,899단정/0실패/skip0 | 0 | 0 | 1.042 |
| BC01 기존 / `bc01-regression-01` | 681단정/0실패/skip0 | 0 | 0 | 0.182 |
| BC02 기존 / `bc02-regression-01` | 5,257단정/0실패/skip0 | 0 | 0 | 0.236 |
| BC03 기존 / `bc03-regression-01` | 31,976단정/0실패/skip0 | 0 | 0 | 0.342 |
| 자기 cold import / `import-01` | 정상 완료 | 0 | 0 | 12.717 |
| test_contracts / `contracts-01` | 5/5 case·failed_assertions0 | 0 | 0 | 2.165 |

신규 oracle 난수 호출 총20,746회이며 score14,130·roulette759·pattern timer1,137·combo gate1,137·choice617·combo timer1,262·feint480·delay1,110·retry timer114다. 기존 회귀의 USERDIR은 각 테스트 상수 `EXODUSER-bc01-Isolated-20261020`, `EXODUSER-bc02-Isolated-20261020`, `EXODUSER-bc03-Isolated-20261020` 그대로다. 전체 회귀5개(import 포함)의 receipt는 `suite-summary.json`이다.

cold import가 생성한 기존 코드/테스트의 미추적 UID136개는 import 이후 생성된 자기 파일임을 확인해 `_out/bc04/import-generated-uids/`로 옮겨 보존했다. 목록/해시는 `import-generated-uids.json`이다. 사전 존재 UID는 건드리지 않았고 자기 신규 두 UID만 제출한다. 추가로 import가 만든 미추적 에셋 메타데이터35개도 생성 시각을 확인해 `_out/bc04/import-generated-metadata/`에 보존했다. 목록/해시는 `import-generated-metadata.json`이다. 최초 정적 마감 검사는 이35개를 발견해 중단했다. 이어지는 셸 명령이 로컬 커밋87ce58d1을 먼저 작성한 점을 확인했으며, push 전 메타데이터를 보존하고 전체 마감 검사를 다시 통과시킨 뒤 이 경위를 후속 문서 커밋에 기록했다. Godot 테스트 결과와 제품 byte는 바뀌지 않았다.

| 마감 확인 | 결과 |
|---|---|
| 변경 범위 | 신규 제품 gd/uid·신규 테스트 gd/uid·보고서·CHANGELOG의6경로만 명시 stage. test_* 광역 ignore로 자기 새 테스트 gd/uid에만 `git add -f --` 사용, ignore 규칙/타 담당 수정0 |
| byte 검수 | 시작17파일(공용6·HTML2·BC01~03 의존·기존 테스트·AGENTS·project.godot) SHA256 동일. 새 테스트/제품과 실행 사본 동일, 기존 회귀 사본 동일. CHANGELOG 기존 본문 보존 |
| R·전역 | R HEAD/branch/INDEX/WORK·index byte와 Godot 전역 editor_settings 사전 사본 대조. 보호 QE·2_3·세이브 형식·원본 수치 변경0 |
| 마감 main | e556b617을 다시 fetch·원격 대조. game.html byte/행 및 WORK_BOARD 보스 소유 동일 |
| 훅·보존 | 실제 .githooks/pre-commit의 docs-sync-check 정상 사용. 우회/no-verify·main push·force push·git add -A 없음. 자기 branch push 후 원격 SHA 대조·DONE 기록·자기 worktree 제거, branch 유지. 최종 SHA·정리 결과는 `_out/bc04/DONE.txt`와 verification receipt에 기록 |
| 산출물 보존 | 원로그/실행 프로젝트·보고서 사본은 `_out/bc04/`, 제출 보고서는 branch의 `docs/engine/orders/reports/bc04_REPORT.md`. worktree 제거 후에도 재검수 가능 |


사용자가 전달한 선재 결함 원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번 작업에서는 해당 로비 전체 회귀를 재실행하거나 수정하지 않는다.

BC04는 선택·콤보 전이 packet까지다. BC05 phase/시계, BC06 startPattern 실제 효과, BC14 actor 및 BC17 Main 연결·실제 보스전·HUD·시각/성능·PC 실행은 미인수다. 공용0줄 지시를 넘는 제품 연결을 완료로 주장하지 않는다.

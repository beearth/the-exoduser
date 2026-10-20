# P2-004B PC 보고서 — 실제 적용·격리검수 인계 (2026-10-20)

## 재개 최종 상태 — 아래 이전 정지 이력을 대체

| 항목 | 실제 확인 |
|---|---|
| 위치·브랜치·기준 | `G:\exoduser-wt\codex-p2-004b`, `codex/p2-004b-pc-20261020`, HEAD `f1df29a86dc3966bab87a7f4910ae6819e167294`에서 재개. INDEX 비어 있음, 인수 문서 WIP5개 보존 |
| 원격 경계 | fetch 후 origin/main=`d3b672fea878ff99a9f110f4a6d8adf86b1e6898`. merge/rebase/checkout·main push 없음. 현재 worktree 원본만 기준 |
| 적용 | 인계 patch3개 경로를 `git apply --check`로 확인 후 apply_patch 적용. 원패치·원EVIDENCE는 당시 이력 그대로 보존 |
| 원문 | 실제 경로 카탈로그 **171/0**, 티어342일치, 변조탐지3/3. 선언연결60(기존11+신규49)/데이터전용111 유지. 대사 신작0·숫자 변경0 |
| Godot | 지정 바이너리 **4.7.2.stable.official.ed1daf0bf**, 신규 단위9그룹 **822/0**. 실제 Main 연결 하니스 최종 **10/0** |
| 회귀 | 최초 P2004A **17검사/5실패**, combat그룹6/0. 원인=테스트 휴면부팅 G.on=false인데 대사를 기대. 원본9508 gate 유지, 63412의 실제 state/curtain owner API로 G.on 활성화 후 **실패그룹만14/0** (기존11단정 유지＋준비조건3). 통과한 combat6개 재실행0 |
| 보호 | game.html·index.html·에셋·Q/E·레슨·세이브 변경0. 공용 main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 각각 **0줄** |
| 인수 수준 | 코드 적용·격리 파서/단위·Main reader/signal fixture 검수. 자연 발화60/60·실창·사람 플레이·Mac·패키지 인수는 **미확인** |

### ① 원본 근거·최소 보완

원본 카테고리별171개 표와 호출행은 아래 이전 인계 §① 및 `FDG_P2_004B_PET_DIALOGUE_20261020.md`의 ID표를 그대로 유지한다.

| 보완 | 원인·원본 근거 | 적용 |
|---|---|---|
| P2004A 하니스 활성화 | game.html:9508 `if(!G.on||!G.pets)return`; 기존 SceneTree 하니스는 커튼 휴면설치라 on=false | 제품 게이트를 제거하지 않고, 테스트에서 기존 `source_state.apply_native_intro_curtain_g_writes(source_intro_sequence,"open")`로 원본63412 G.on=true를 준비. `EXODUSER_P2004A_FAILED_ONLY=1`이면 최초 실패그룹만 실행 |
| 실제 전용 적 빙결 읽기 | Main 연결 추가검사에서 `float(enemy.get("_frozen"))`가 전용 flesh_crawler에 없는 속성을 읽어 SCRIPT ERROR. game.html:9592~9593의 살아있는 근접 빙결 관측 필요 | native_pets.gd에서 공통 공개 reader `read_native_normal_enemy_hurte_fields(_world)`를 사용. generic/전용 owner의 READY·숫자 `_frozen`만 소비. 미지원이면 `enemy_freeze_owner_absent/not_ready` 정직 정지. 다른 담당 owner는 무수정 |
| 문서 상태 | 이전 EPERM/미적용 표현·기존11 ID 경계 | 펫 docs3개·P2-004A/B·작업판을 현재 적용/검수 경계로 동기화. 과거 원로그·패치·EVIDENCE는 이력으로 보존 |

원문 자체·트리거 문턱·티어·쿨·우선순위는 후보와 동일하다. 적평균ATK의 60틱 표본은 기존 펫 로컬 `_tick` 위상이며 원본 G.frame과 동기화 인수는 여전히 별도다.

### ② 최종 변경 파일

| 경로 | 내용 |
|---|---|
| godot/scripts/native_pets.gd | 카탈로그 소비·60선언연결·111미연결 경계·기존 reader 사용 |
| godot/scripts/native_pet_dialogue_catalog.gd | 원문171 ID·원본행·모드/티어·동적표현식 보존 |
| godot/tests/test_p2004a_pets.gd | 원본 on gate에 맞는 준비＋실패그룹 선택 실행. 기존11/6단정 유지 |
| godot/tests/test_p2004b_pet_dialogue.gd | 인계 신규9그룹822검사 |
| godot/tests/test_p2004b_pet_runtime.gd | 실제 Main·전용적 reader·NativeSkillSlots/burn 읽기·평균ATK·카탈로그 경계·player telemetry signal 연결10검사 |
| tools/pet-dialogue-source.mjs | 인계 원본 추출 도구 |
| test/test_p2004b_pet_source.mjs | 인계 독립 parser171원문·342티어·변조3종 대조 |
| docs/2_4 펫시스템/2_4 펫시스템.md | 현재 적용·회귀·미인수 구분 |
| docs/2_4 펫시스템/대사_스크립트.md | 동일 상태 동기화 |
| docs/2_4 펫시스템/대사_개편_v7_설계.md | 동일 상태 동기화 |
| docs/engine/FDG_P2_004A_PETS_20261020.md | 기존9+2 ID와 이번 회귀 결과 구분 |
| docs/engine/FDG_P2_004B_PET_DIALOGUE_20261020.md | ID별표·적용/후보·owner 읽기 경계 동기화 |
| docs/engine/orders/WORK_BOARD.md | 검수대기·소유경로·체크포인트 |
| docs/engine/orders/reports/P2-004B_REPORT.md | 본 보고서 |
| docs/engine/orders/reports/P2-004B_CANDIDATE.patch | 이전 미적용 후보 원본 그대로 인수·보존. 재적용 금지 |
| docs/engine/orders/reports/P2-004B_EVIDENCE.json | 이전 권한 실패·후보 정적검수 영수증 그대로 보존 |
| docs/engine/orders/reports/P2-004B_RESUME_EVIDENCE.json | 이번 실제 적용 파일 hash·원로그 결과 |

### ③ 실제 테스트 명령·수치·원로그

출력 루트 **`G:\exoduser-wt\_out\P2-004b-pc\`**, 인수 WIP11경로는 `inherited/`, 적용 전 실제 native_pets는 `backup/godot/scripts/native_pets.gd`. C 드라이브 대형산출물0·신규에셋0/import0. 하니스는 매 실행 override.cfg를 지정 격리명으로 쓰고 종료 후 비운다. 실제 사용자 저장폴더 접근 없음.

Git Bash가 PATH에는 없었으므로 `C:/Program Files/Git/bin/bash.exe`를 Node spawnSync 인수 배열/windowsHide=true로 지정해 **사용자 제공 run_godot_tests.sh 원본 그대로** 실행했다. 테스트 해석은 helper 요약 exit가 아니라 각 `*_RESULT`와 stderr를 함께 확인했다.

| 검사 | 실제 결과 | 로그(출력루트 상대) |
|---|---|---|
| 적용 전 RED | 카탈로그 부재 ENOENT, exit1 | source-red.out/.err |
| 적용된 원문 대조 | `C:\nvm4w\nodejs\node.exe test/test_p2004b_pet_source.mjs` → 171/0·tier342·변조3/3 | source-applied.out/.err. 이전 후보171/0과 구분하여 실제 적용 경로를 검수 |
| P2004A 회귀 최초 | 17검사/5실패; spawn11/5, combat6/0 | run1/test_p2004a_pets.out.log/.err.log (exit1) |
| P2004B 신규 | 9그룹822/0·Main부팅0·save읽기0/쓰기0 | run1/test_p2004b_pet_dialogue.out.log/.err.log (exit0) |
| P2004A 실패그룹 보완 | 기존11＋준비3=14/0, combat은 skipped | failed-regression/test_p2004a_pets.out.log/.err.log (exit0) |
| 실제 Main 연결 최초 | 10검사/2실패＋SCRIPT ERROR1 | runtime1/test_p2004b_pet_runtime.out.log/.err.log (exit1). 전용 적 _frozen 직접 읽기에서 중단돼 튜토리얼·ATK집계 미도달 |
| reader 보완 후 연결 | 10/0·SCRIPT ERROR0 | runtime-fixed/test_p2004b_pet_runtime.out.log/.err.log (exit0). player위치1필드·signal fixture2회는 명시적 하니스; 자연 전투 인수 아님 |

기존 Camera2D physics interpolation 경고는 두 Main 테스트에서 관측되며 제품결함/대사실패로 숨기지 않는다. 신규9그룹822 통과와 원문171 통과는 이후 동작이 바뀌지 않은 영역이라 반복하지 않았다. 17/5와 실패그룹14/0을 단일 전체20/0 PASS로 소급하지 않는다.

~~~bash
# Git Bash에서 실행. H=C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh
bash $H G:/exoduser-wt/codex-p2-004b/godot G:/exoduser-wt/_out/P2-004b-pc/run1 test_p2004a_pets:EXODUSER-P2004A-Isolated-20261020 test_p2004b_pet_dialogue:EXODUSER-P2004B-PC-Isolated-20261020
EXODUSER_P2004A_FAILED_ONLY=1 bash $H G:/exoduser-wt/codex-p2-004b/godot G:/exoduser-wt/_out/P2-004b-pc/failed-regression test_p2004a_pets:EXODUSER-P2004A-Isolated-20261020
bash $H G:/exoduser-wt/codex-p2-004b/godot G:/exoduser-wt/_out/P2-004b-pc/runtime-fixed test_p2004b_pet_runtime:EXODUSER-P2004B-Runtime-PC-Isolated-20261020
~~~

docs 전체 관련검색은 재개 후 `rg -n P2-004B docs/`로 다시 수행했다. 현재 설명과 아래 이전 정지 이력/보존 patch를 구분했다.

### ④ 커밋·원격

본체 커밋 SHA는 실제 커밋 생성 후 후속 영수증에 기록한다. 자기 브랜치 `git push origin HEAD`와 원격 ref SHA 읽기 대조까지 수행하고 보고한다. main push/병합은 하지 않는다.

### ⑤ 남은 것

- 데이터전용111 ID·설계전용카테고리·death_dual, 패링/사슬/보스/강화/진행 콜백은 담당 시스템 인수 후 연결. 임의트리거0.
- 원본 G.frame과 `_tick` 표본 위상 일치,60개 전부의 실제 자연 발화·시각·실플레이, Mac 실행·최종 인수는 미확인.
- 아래 원EVIDENCE/후보의 hashes는 당시 파일 값이다. 최종 파일은 RESUME_EVIDENCE로 구분한다. 원패치는 보완 전 후보여서 최종 코드를 덮어쓰는 용도가 아니다.

---

## 이전 작업의 적용 정지·후보 보존 이력 (재개 전 기록, 아래 '이번'은 이전 세션을 뜻함)

**미완료: Godot 쓰기 EPERM 및 터미널 시작 권한 거부.** 이번 작업은 실제 Godot 코드 적용·컴파일·회귀·화면 검수·Git commit/push를 완료하지 못했다. 원본171 ID의 이식 후보와 독립 소스 검증, 적용 대기 패치 및 docs를 worktree 안에 보존한다. 원본 게임 에셋 변경/신규 생성0, 공용 gd 실제 변경0줄, game.html 변경0, Q/E·레슨·세이브 변경0, 사용자 localhost:3333 조작0.

## ① 원본 근거·범위

| 항목 | game.html 원본 행 | 결론 |
|---|---|---|
| 엔진 | 9389~9503 | ID쿨·티어쿨·pair·긴급 인터럽트·중복 urgent 억제 |
| 티어/가중치 | 9408~9423 | T0~T5=1200/720/480/360/240/0프레임. urgent 내부100/95/90/88/80/70/60/55/40. 동일 일반티어 코드순 우선 |
| 긴급 | 9514~9552 | HP50/30/10%·화상·500px 적평균ATK×1.2·ST<50% Lv≤100. Lv>500도 이 블록은 실행 |
| 튜토리얼·경쟁 | 9554~9737 | 튜토리얼 원본 stage0·Lv≤200, 나머지 일반대사 Lv≤500; 밀집300px·10/20, 자원50/30%, idle20초/120초, 환경30초 |
| 외부 콜백 | 9741~9814 | 처치 콤보50/100·HP<10% 처치. multi_kill9781은 정의만 있고 호출처 없음 |
| 외부 직접 호출 | 16420~16421,32877/32895,34545,38540~38541,41878/41889/41910,43862,60775 | 아이템·상자·잔해·부활몹·분노·문·부활팁·지역. 미이식 이벤트는 데이터 전용 |
| 원본 집계 | 호출122개 중 literal ID121(동일 boss_gate_open 중복) + 동적7풀 확장 | 총171 ID. 기존 Godot9튜토리얼+2긴급=11 ID, 잔여160 |

카탈로그는171 ID의 원문·화자·pair·지속시간·쿨·발화 모드·추론 티어·원본 호출행 및 pool행을 보존한다. 기존 문서의 '튜토리얼11종+긴급2종'은 실제9+2로 정정했다. stun_warn/rage_half 동적 원문은 표현식과 구성요소로 보존하며 가상값을 채우지 않는다. 전체 ID별 표는 [상세 기록](../../FDG_P2_004B_PET_DIALOGUE_20261020.md).

### 카테고리별 표 (전부 미적용 후보)

| 분류 | 원본 ID | 연결 후보 | 미연결 데이터 | game.html 원본 행 |
|---|---:|---:|---:|---|
| 외부 외부 콜백(아이템·분노·부활) | 5 | 0 | 5 | 16420,16421,38540,38541,43862 |
| 1 튜토리얼 | 18 | 9 | 9 | 9556,9557,9558,9559,9560,9561,9562,9563,9564,9565,9566,9567,9570,9571,9572,32877,32895,34545 |
| 2 키 안내 | 9 | 0 | 9 | 9577,9578,9580,9582,9583,9584,9586,9587,9588 |
| 3 긴급 | 10 | 5 | 5 | 9516,9518,9520,9522,9525,9532,9541,9542,9547,9548 |
| 4 보스 패턴·전투 | 9 | 5 | 4 | 9592,9593,9594,9595,9598,9599,9603 |
| 5 자원·힌트 | 13 | 5 | 8 | 9535,9537,9607,9608,9611,9612,9614,9615,9616,9617,9618,9619,9621 |
| 6 패링 교육·대기 | 3 | 1 | 2 | 9624,9625,9627 |
| 7 Idle 재촉·팁 | 24 | 24 | 0 | 9634,9637 |
| 8 챕터 진입 | 7 | 1 | 6 | 9651 |
| 9 챕터 환경 | 7 | 1 | 6 | 9665 |
| 10 BL 패링 발견 | 5 | 0 | 5 | 9745,9759,9761,9763,9765 |
| 11 사슬기동 | 3 | 0 | 3 | 9767,9769,9771 |
| 12 엘리트·미니보스 | 4 | 0 | 4 | 9773,9775,9777,9779 |
| 13 챕터 클리어 | 7 | 0 | 7 | 9797 |
| 15 빌드 | 5 | 0 | 5 | 9709,9710,9711,9712,9716 |
| 16 보스·스테이지·문·지역 진행 | 8 | 1 | 7 | 9675,9676,9677,9680,9684,41878,41910,60775 |
| 17 처치·콤보 | 4 | 3 | 1 | 9750,9751,9753,9781 |
| 18 강화·전설 | 3 | 0 | 3 | 9783,9785,9788 |
| 19 사망·보스 재도전 | 3 | 0 | 3 | 9691,9791,9792 |
| 20 트로피 | 4 | 0 | 4 | 9755,9800,9804,9806 |
| 21 스피드런 | 3 | 0 | 3 | 9812,9813,9814 |
| 22 펫 간 토크 | 5 | 5 | 0 | 9645 |
| 23 보스 인트로 | 7 | 0 | 7 | 9695 |
| 27 난이도 변경 | 5 | 0 | 5 | 9727,9728,9729,9730,9731 |
| 14·24~26·28~29 설계 전용 | 0 | 0 | 원본 트리거·대사 본문 없음 | v6 문서에만 존재 |
| 합계 | 171 | 60 | 111 | 기존 11 + 잔여 160 |

연결 후보60=기존11+신규49, 데이터전용111. 미이식 보스·패링/사슬 이벤트·키UI·강화·드롭·부활·지역·빌드배분·난이도 콜백은 임의 호출을 만들지 않는다. stage0의 chapter_0/env_ch0만 연결 후보이며 후속 chapter1~6은 데이터 전용. 설계 전용14·24~26·28~29는 game.html에 대사 본문/트리거가 없어 미이식으로 기록한다. 별도 death_dual28ID(43757~43844,10000ms)는 이번 인게임171 ID와 혼합하지 않는다.

## ② 변경 파일·소유권

작업위치 G:/exoduser-wt/codex-p2-004b. 시작 브랜치 codex/p2-004b-pc-20261020, HEAD f1df29a86dc3966bab87a7f4910ae6819e167294(로컬 ref 파일 읽기). 실제 godot/scripts/native_pets.gd는 시작 인덱스 blob ad05ad5ade80ec4d9000f84eda9ff0ec152493a5와 동일하게 보존한다. 게임 원본 blob e755a2d98211ac2a6b4a53d8a1e3e7abe4714400. 전체 Git status/INDEX 대 HEAD 차이는 터미널 실패로 미확인. 자기 소유4경로의 시작 INDEX/WORK 일치와 공유 인덱스 SHA256은 별도 파일 읽기로 확인했으며 전체 clean을 주장하지 않는다.

| 실제 변경 파일 | 상태·내용 |
|---|---|
| tools/pet-dialogue-source.mjs | 신규 |
| test/test_p2004b_pet_source.mjs | 신규 / 테스트 강제 경로 스테이징 필요 |
| docs/2_4 펫시스템/2_4 펫시스템.md | 수정 |
| docs/2_4 펫시스템/대사_스크립트.md | 수정 |
| docs/2_4 펫시스템/대사_개편_v7_설계.md | 수정 |
| docs/engine/FDG_P2_004A_PETS_20261020.md | 수정 |
| docs/engine/FDG_P2_004B_PET_DIALOGUE_20261020.md | 신규 |
| docs/engine/orders/WORK_BOARD.md | 수정 |
| docs/engine/orders/reports/P2-004B_REPORT.md | 신규 |
| docs/engine/orders/reports/P2-004B_CANDIDATE.patch | 신규 / Godot 변경3파일 적용 대기 |
| docs/engine/orders/reports/P2-004B_EVIDENCE.json | 신규 |

[적용 대기 패치](P2-004B_CANDIDATE.patch)는 정확히3개 Godot 경로(native_pets.gd 교체, native_pet_dialogue_catalog.gd 신규, tests/test_p2004b_pet_dialogue.gd 신규)를 포함한다. 실제 적용 전이며 main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 변경은 각각0줄이다. 패치의 새 테스트는 적용 후 git add -f 대상이다. 신규 에셋0이므로 에셋 복사/import 작업은 수행하지 않았다.

## ③ 검증 명령·수치·로그

| 검사 | 실제 결과 | 로그 / 한계 |
|---|---|---|
| 소스 대조 RED | 실제 카탈로그 파일 부재 ENOENT 감지 | 후보 생성 전 검사. 도구 실제 적용경로 쓰기는 EPERM으로 실패 |
| 독립 원본 대조 | 후보171/0·tier342·문구/숫자/pair 변조탐지3/3 | tmp/P2-004B-pc/source-parity.log. game.html을 별도 parser로 다시 읽음. Godot 아님 |
| 셔플 경계 | 수정 전 허용 인덱스 위반26(실배열 초과3); 후보1행 수정 뒤78/0 | tmp/P2-004B-pc/shuffle-boundary.json. 후보 수식 JS 산술 확인이며 Godot 아님 |
| 독립 명세 검토 | 연결후보60=코드참조60, 데이터전용111 임의호출0 | 정적 source review. randf끝값 문제1건 수정·재검토 |
| 코드품질 검토 | 확인 범위 명백한 문법/타입 문제 발견0 | 정적검토이며 Godot 파서·컴파일 결과 아님 |
| 신규 GDScript | 9그룹 작성, 실행0회 | tmp/P2-004B-pc/candidate/test_p2004b_pet_dialogue.gd. Main 부팅 없는 테스트이며 실제 res://scripts 경로에 적용 후 실행 |
| test_p2004a_pets | 이번 세션0회 | 과거17/0 결과를 이번 PASS로 재사용하지 않음 |
| Godot 버전·실행·화면 | 실행0회·미확인 | 사용자 지정4.7.2 binary는 실행 검증하지 못함. configure/telemetry/full dialogue tick/화면 미검증 |
| docs 전체검색 | Markdown842개·관련99매치 | tmp/P2-004B-pc/docs-keyword-search.json. 터미널 rg 대신 독립 fs 검색 |

소스 검증은 허용된 Node REPL 내부에서 아래 모듈을 import해 run을 호출했다(프로세스 생성 없음):

~~~js
const test = await import('file:///G:/exoduser-wt/codex-p2-004b/test/test_p2004b_pet_source.mjs');
await test.run({
  root: new URL('file:///G:/exoduser-wt/codex-p2-004b/'),
  catalog: new URL('file:///G:/exoduser-wt/codex-p2-004b/tmp/P2-004B-pc/candidate/native_pet_dialogue_catalog.gd'),
  write: value => nodeRepl.write(value)
});
~~~

권한 정상 환경에서 총괄이 수행할 명령(이번 세션 **미실행**, 사용자 기존 서버/세이브와 분리):

~~~bash
# 먼저 현 브랜치/INDEX/WORK/expected SHA를 재확인한다.
git apply --check docs/engine/orders/reports/P2-004B_CANDIDATE.patch
git apply docs/engine/orders/reports/P2-004B_CANDIDATE.patch
C:/nvm4w/nodejs/node.exe test/test_p2004b_pet_source.mjs
bash C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/codex-p2-004b/godot G:/exoduser-wt/_out/P2-004B-pc test_p2004a_pets:EXODUSER-P2004A-Isolated-20261020 test_p2004b_pet_dialogue:EXODUSER-P2004B-PC-Isolated-20261020
~~~

실행 binary는 G:/godot-engine/4.7.2/Godot_v4.7.2-stable_win64_console.exe. Main을 부팅하는 회귀는 P2004A의 USERDIR로 격리하고 override.cfg는 종료 시 비우며 커밋하지 않는다. 사용자 실제 EXODUSER-Godot-Native-First를 쓰지 않는다. 코드 수정 후 실패한 범위만 재검증하며 통과한 검사 반복은 하지 않는다.

지정 산출물 위치 G:/exoduser-wt/_out/P2-004B-pc는 이 세션 writable root 밖이라 쓰기를 시도하지 않았다. 작은 로그·후보를 worktree 내부 tmp/P2-004B-pc에 보존하고, 인계에 필요한 코드·검증 요약은 docs의 patch/EVIDENCE.json에도 포함했다. C드라이브 대형산출물0.

## ④ 커밋·push

**새 커밋 SHA 없음 / push 미실행 / 원격 expected SHA 미확인.** 시작 SHA는 f1df29a86dc3966bab87a7f4910ae6819e167294이며 작업완료 커밋으로 표시하지 않는다. 터미널은 지정 Windows PowerShell 요청에도 WindowsApps/pwsh.exe CreateProcessW 단계에서 액세스 거부(os error5)로 명령 실행 전 실패했다. Git fetch/status/stage/commit/push를 실행하지 못했으며 권한 상승·다른 shell/프로세스로 우회하거나 재시도하지 않았다. G:/exoduser의 브랜치·파일·공용 인덱스 변경0, main push·병합0.

커밋 대기: 위 실제 변경 파일 목록. 총괄이 검수 후 본 브랜치에 경로 지정 스테이징하고 테스트는 -f를 사용해 커밋·git push origin HEAD를 수행해야 한다. 실제 Godot 적용·테스트 전 완료/검수 PASS로 승격하지 않는다.

## ⑤ 남은 것·정직 정지

1. 허용된 환경에서 패치 적용과4.7.2 파싱·test_p2004a_pets 회귀·신규9그룹 실행. 현재 GDScript 컴파일/런타임 성공 근거 없음.
2. 실제 Main의 configure·NativeSkillSlots/burn/enemy owner 읽기·native_hurte/player_damage telemetry·자막과 긴급 전환을 격리 사용자 폴더로 관측. 현재 단위후보는 이 전체 연결을 호출하지 않는다.
3. 적평균ATK60프레임 표본은 기존 펫 _tick 사용. 웹 G.frame과 표본 위상/native clock 동기화는 미검증이며 총괄의 별도 인수 필요. 원본 수치는 변경하지 않았다.
4. 미연결111 ID는 실제 시스템/이벤트 인수 후 연결한다. 사슬/Q·E/레슨·공용 owner/세이브 경로 변경은 이번 범위에 넣지 않았다. 설계전용카테고리/death_dual은 별도 업무다.
5. Git 상태와 expected SHA 재확인·자기 소유 경로 커밋·본 브랜치 push·원격 SHA 읽기 대조. PC/Mac/원격 동기화 완료를 주장하지 않는다.

쓰기 실패 원오류 핵심: EPERM: operation not permitted, open G:/exoduser-wt/codex-p2-004b/godot/scripts/native_pet_dialogue_catalog.gd (직후 ENOENT). tests 대상도 EPERM/미생성. 원오류·artifact SHA256은 [EVIDENCE](P2-004B_EVIDENCE.json)와 tmp/P2-004B-pc/catalogue-write-failure.log에 보존한다. 같은 거부경로 재시도0. 패치는 검토용 후보이며 제한된 대상에 적용한 것이 아니다.

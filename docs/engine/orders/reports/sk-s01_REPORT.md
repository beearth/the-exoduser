# sk-s01 — SP 비용·누적 투자액 순수 모듈 구현 보고

상태: **SK-S01 구현·지정 검수 완료 / 총괄 검수 대기**. main 병합·실게임 인수 아님.

## 기준과 소유권

| 항목 | 실제 값 |
|---|---|
| 작업 | `sk-s01` / `codex/sk-s01-20261020` / `~/exoduser-wt/sk-s01` |
| 최신 fetch 기준 | `9528ea35b429498fcf42fe3723008219ed0ed7e1`; `19a713578` ancestor 확인, 여기에서 신규 branch/worktree 생성 |
| R 기준 | `codex/mac-live-play-time-main-20261017` / `dd49171c5b88e211575a41f185395d6c0a14b184`, 시작 tracked INDEX/WORK 차이0. R checkout/편집/merge/reset 없음 |
| 구현 지시서 | 이전 제출 `17255c3e9d07c8a62ac548b6bb6592878c72b180`의 `FDG_SOURCE_TRACE_SKILLS_20261020.md` §4.1. 현재 main에 이 문서가 없어 이전 worktree에서 읽기만 했으며 복사/병합하지 않음. 새 격리명은 사용자 최신 지시 우선 |
| 선행 확인 | 최신 WORK_BOARD 진행중/공용 소유권·개발계획 P2-005a~d/P4 보호범위·SK-S01 원본3함수. 같은 API/경로 기존 구현 없음 |
| 제품 소유 | 신규 `godot/port_modules/skill_management_cost_source/producer.gd` 및 그 .uid만 |
| 테스트 소유 | 신규 `godot/tests/test_trace_skills_s01_costs.gd` 및 그 .uid만 |
| docs | CHANGELOG_SYNC 최상단 새 절, 이 보고서. 공유 보드/기존 설계 docs·이전 추적 문서 수정0; 시작/완료 인계는 이 보고서로 전달 |
| 변경 금지 | main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd/native_skill_slots.gd 0줄. Q/E·docs/2_3·세이브형식·입력/슬롯/전투/자원/저장 owner 연결0 |

## 원본과 API 계약

원본 game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 기존 주석3911~3912의 일반1/2/3/5와 달리 실행 테이블은 전레벨1이다. 수식은 조정하지 않았다.

| API / 원본 | 옮긴 실행 계약 |
|---|---|
| `skill_up_sp_cost(cur_lv)` / 3913~3917 | next=cur+1, `[0,1,1,1,1,1,1,1,1,1,1]`, index clamp1..10, falsy fallback1 |
| `fuse_up_sp_cost(cur_lv,gem_count)` / 3918~3925 | base=일반비용, star=gem 또는2; raw=base+(star−1); cur>=9에서 star>=4→8 / star>=2→6 / 나머지raw. star4/멤버6의 선택은 호출자 소유 |
| `skill_spent_sp(skill,skill_lv)` / 3926~3930 | null skill 또는 level0→0, 그 외 spCost 누락/0이면0 + for lv=1;lv<slv;lv++ 일반비용. 전체학습원가 포함; 무료기본기 제외/환불 적용은 비소유 |
| 반환 | READY/value(int)/input, 또는 NOT_READY/reason/input(value 없음). 입력 Dictionary와 nested 객체를 clone/정규화/수정하지 않음 |
| 부분지원 | finite 정수 int/float level0..20·gem0..7·spCost0..15/누락·skill null/Dictionary. 그 밖 String/StringName/bool/Array/Object/nonfinite/소수/범위밖은 NOT_READY. caller max20을 적용하는 구현이 아니라 이 모듈의 지원경계이며 원본 JS 전체 coercion 이식 아님 |
| 평가 순서 | level 지원검사→skill null/Dictionary carrier 검사→원본 null/level0 early return→spCost key/value 검사→합산. Dictionary level0의 사용하지 않는 spCost는 검사/조회하지 않음. StringName spCost key는 Godot alias로 원 JS 지원을 위조하지 않고 별도 NOT_READY |
| 대표 값 | cur8/gem0..7=2/1/2/3/4/5/6/7; cur9·19·20=6/1/6/6/8/8/8/8. spCost10 Lv1/10/20=10/19/29, spCost15 Lv20=34, spCost0 Lv20=19 |

## 실행 검증

| 검수 | 실제 결과 | 로그·범위 |
|---|---|---|
| Godot 버전 | `4.7.2.stable.official.ed1daf0bf` | `.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` |
| 신규 첫 실행 | **2,033단정 / 실패0 / skip0 / exit0** | `new-01.out/.err/.engine.log`; stderr0byte. 정상 입력 범위 전체·int/float·8→9 cap·누적/무료·거부 raw carrier·Dictionary/nested identity·반복 무변이·InputMap/노드 미변경 |
| 원본 직접 대조 | **567행 / 불일치0** | `oracle-comparison.json`, `original-functions.js.txt`. 최신 game.html에서 실제 원본3함수를 발췌해 Node VM으로 실행한 결과와 Godot 출력 비교. single21+fusion168+spent336+missing21+null21 |
| 격리(신규) | `EXODUSER-sk-s01-Isolated-20261020` | 테스트 프로세스의 ProjectSettings만 설정하고 OS 실제 경로까지 단정. Main/override.cfg/사용자IO 없음. `--log-file`는 Git밖 출력폴더 지정 |
| 자기 WT import | exit0 / stderr0byte | `import-01.*`. 회귀 에셋용 .godot cache만; 전역 editor_settings 사전/사후 SHA 동일 |
| test_contracts | **5검사군 통과 / 실패단정0 / exit0** | 전체범위(only=[]), stderr 오류/경고0. 성공단정 개수는 원테스트가 계수하지 않아 미기록 |
| test_p2005a_start_skills | **27단정 / 실패0 / skip0 / exit0** | USERDIR=`EXODUSER-P2005A-Isolated-20261020` |
| test_p2005b_giant_slam | **12단정 / 실패0 / skip0 / exit0** | USERDIR=`EXODUSER-P2005B-Isolated-20261020` |
| test_p2005c_spike_holy | **20단정 / 실패0 / skip0 / exit0** | USERDIR=`EXODUSER-P2005C-Isolated-20261020` |
| test_p2005d_regen_wiring | **10단정 / 실패0 / skip0 / exit0** | USERDIR=`EXODUSER-P2005D-Isolated-20261020` |
| test_p2005d_ice_orb | **22단정 / 실패0 / skip0 / exit0** | 동일 USERDIR. MP50·칼날8·AoE/칼날 hit·빙결/면역 경로 |
| 회귀 stderr | **ERROR0**, Camera2D physics-interpolation WARNING 각 Main 테스트1건(총5) | 기존 경고를 숨기거나 제품 수정하지 않음. 격리 callback/원본 대역의 관측 범위를 실플레이 인수로 확대하지 않음 |

기존 회귀는 파일 상수 USERDIR를 그대로 사용한다. test_contracts에는 USERDIR/ISOLATED_DIRECTORY가 없고 Main을 부팅하지 않아, Git밖 `contracts-isolated.gd`가 원본 테스트를 상속하고 in-process 격리 설정 후 원 `_initialize`를 호출한다. 원본 테스트 내용/단정/선택 범위는 바꾸지 않는다. P2-005a/b/c/d-regen/d-ice는 각 원본 USERDIR로 WT-local override를 Main 부팅 전에 설정하고 매 종료 finally에서 0byte로 비운다. 실제 사용자 프로필/전역설정을 덮어쓰지 않는다.

## docs 동기화·보호 확인

- 코드 작성 후 `rg -n 'skillUpSpCost|fuseUpSpCost|skillSpentSp|스킬 강화 SP|합체 강화' docs -g '*.md'`로 docs 전체 검색. 원로그 `docs-keyword-matches.txt`. 기존 설계 수치 조정 없이 본 보고서의 전 상수/수식/API/지원범위 표와 CHANGELOG로 현재 부분이식 상태를 추가했다.
- 기존 게임·기존 테스트는 그대로다. P2-005 계열 회귀 합계는 **91단정/0실패**이고 contracts의5검사군과 단위를 섞어 합산하지 않는다. P2-005a~d는 의존/회귀이며 이 단위의 신규 실게임 기능완료로 산입하지 않는다. 학습·합체·SP 실제차감·표시·세이브는 아직 연결하지 않았다.
- pre-commit은 `.githooks/pre-commit` → `node tools/docs-sync-check.mjs --staged`. CHANGELOG를 함께 경로지정 stage하며 ALLOW_MISSING_DOCS/HUSKY 등 우회변수·`--no-verify`를 사용하지 않는다.
- `node tools/docs-sync-check.mjs --staged` 실제 exit0 및 staged `git diff --check` 통과. 실제 pre-commit hook의 종료 결과는 `commit.out/.err`에 보존한다. 검수 후 자기 브랜치 비강제 push·원격 ref SHA 대조·DONE에 정확 수치 기록. main push/merge/force/reset·타인 WIP 포함 없음.

원로그 폴더: `/Users/fordeargamers/exoduser-wt/_out/sk-s01/`. 실플레이·화면/음향·PC 실행은 이번 검수 범위 밖이며 **미확인**이다.

## 보존 영수증과 로그 재현

`run-regressions.py`에 테스트별 실제 argv·시각·종료값을 기록했고 `regressions.json`에 각 RESULT 원문을 보존했다. 신규 순수 테스트 명령은 `Godot --headless --path <WT>/godot --log-file <OUT>/new-01.engine.log --script res://tests/test_trace_skills_s01_costs.gd`이다. 원본 JS 직접 대조는 `<OUT>/original-functions.js.txt`의 실제 발췌문을 Node VM에서 실행한 것이며 결과567행의 마지막 값을 비교했다.

기존 `test_*` 일괄 ignore 규칙(`.gitignore:5`) 때문에 신규 테스트2경로(.gd/.uid)만 `git add -f -- <정확경로>`로 포함한다. ignore 수정·훅 비활성·force push와는 무관하며 다른 ignored/WIP는 추가하지 않는다. override.cfg는 0byte·미스테이징으로 남긴다. `.godot` 캐시는 commit하지 않는다.

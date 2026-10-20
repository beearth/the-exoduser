# integ-fix — 통합 브랜치 미해결 정리 (2026-10-21)

기반은 ls-remote로 확인한 `121a15b76c1a64c5c7f02f672caeffb74b344ed8`이다. R은 파일 읽기만 했고 `~/exoduser-wt/integ-fix`의 임시 로컬 branch `codex/integ-fix-20261021`에서 작업했다. upstream/제출 대상은 사용자 지정 `codex/demo11-integ-20261021`이다. 최종 제출 SHA·원격 대조는 외부 DONE.txt에 기록한다. main push/rebase/force0.

| 대표 테스트 | 이전/최초 결과 | 수정 후 최종 결과 (통과/실패) |
|---|---|---|
| DEMO11-41 music lifecycle | 기존47/8, headless Dummy | **55/0**, 실제 창/CoreAudio |
| EL-01 hell0 | 기존 compile ERROR4, 집계 없음 | **3327/0**, selection220·constructor72·owner162 사례 포함 |
| DEMO11-19ui | 기존36/0이나 SVG ERROR2 | **36/0**, ERROR0 |
| DEMO11-37 encounter | 기존148/0이나 SVG ERROR2 | **148/0**, ERROR0 |
| DEMO11-24b system effects | 추가 병합 최초137/1, paused live-owner read 거부 | **138/0**,14id·원본 JS13사례 |
| DEMO11-25b auto potion | 추가 병합 최초2169/400, 비사용에도 affix 조회 기대 | **2569/0**, 원본420사례 |
| MAP11 product | 최신 MAP11-14 결합 이번 검수 전 미검증 | **37/0**, 실제 Main Marker 경로 |

최종 합계6310/0·전부exit0·ERROR0. 요청4suite는 각1회만 실행했다. 추가 potion2suite는 최초 실패를 보존하고 하니스 변경 뒤 실패 suite만 각각1회 재검증했다. import는 준비이며 합계에 넣지 않는다. map product는 기술검사이고 시각 PASS가 아니다. 기존 Camera2D physics interpolation WARNING는 유지한다.

## 원인과 정확한 수정 범위

41의8실패는 **통합 merge 충돌 해소 실수/타 단위 제품 상호작용이 아닌 하니스 실행 모드 오류**다. `main.gd:757–765`는 headless 창을 hidden으로 관측하고, `native_music_lifecycle.gd:61–63`은 hidden일 때 정상 suspend한다. `native_music_media.gd:43–54`는 실제 음원과 모든 Timer를 멈추고, `:92–96`은 suspended play를 대기시킨다. 따라서 초기3곡 재생, death2/victory1, missing-file callback/handle2가 각각 실패했다. 누락 파일도 `:106–107`의 지연 실패 callback이 정지되어 관측되지 않았던 것이다. 작성자 `demo11-41_REPORT.md`의 new-03에도 동일8실패/실창 해결 근거가 있다. native_music_media/lifecycle은 기반 blob과 동일하며 제품 visibility guard를 약화하지 않았다. DEMO11-08의 intro gameplay pause 예외도 그대로 유지했다.

EL은 `port_modules/elite_spawn_rules_source/producer.gd:1`의 `ExoduserHell0EliteSelector`를 scripts-only 준비에서 놓친 global class cache 오류다. 전체 project editor import로 등록했다. 19ui/37은 `native_growth_panel.gd:65,201`의 두 SVG import 누락이다. 같은 전체 import에서 해결했다. 모든 테스트의 USERDIR 상수에 맞게 override를 설정하고 finally에서0byte로 돌렸으며, 명시 Node24·현재 worktree game.html·원본 bgm/acorn 읽기 root를 사용했다. EL은 자체 `res://../game.html`을 사용하므로 sparse root에 game.html을 포함했다.

재발 방지 하니스 `godot/tests/run_integ_fix.py:95–108`은 전체 import→41 실창→나머지 headless, 원본 인자/격리명을 고정한다. 매 프로세스 직전 exact pgrep count≥2이면30초 대기한다. 결과/argv/gate/error를 파일에 보존하고 이전 결과 덮어쓰기를 거부한다. 실제 검수는 외부 run_one.py로 동등한 argv/준비 조건을 실행했으며 커밋한 재사용 runner 자체는 py_compile/--help 확인했다. --map11=off는 기존37의 NativeRegions와 장비/음향 대표 계약을 검증하기 위한 명시 전제다. 기본 MAP11 경로는 별도 product suite로 확인했다.

추가 인수 potion 코드 자체는 변경하지 않았다. `test_demo11_24b_system_effects.gd:121–127`의 새 단언은 paused 상태에서 호출해 State `_feel_owner_current(:328–331)`에 의해 정상 거부됐으므로, 동기 read 전후에만 unpause/pause하고 프레임은 진행하지 않는다. `test_demo11_25b_auto_potion.gd:101–106`은 실제 사용 조건을 통과해 regen을 읽은 사례에만 그 직후 potion_cd_affix를 기대한다. 원본 JS oracle/모든 결과·정확한 read-order 비교·제품 guard는 유지했다.

## 병합

| 요청 단위 | 포함 확인·정상 merge |
|---|---|
| enemy-base bb3ced49 | 시작121a15b7에 이미 ancestor, 추가merge0 |
| 장비24/potion-cd 82ad1813 | `43ab9220`으로 정상 merge, 코드충돌0 |
| MAP11-10 e8888106 | 시작121a15b7에 이미 ancestor, 추가merge0 |
| MAP11-14 db9219b4 | `d4f55bb5`으로 정상 merge, 문서만 충돌 |
| i18n 973f96ef | `25b54e42`로 정상 merge. Main 끝의 독립 locale callback은 기존 장비/성장/영역 API와 병존. HUD 충돌은42의 실제 MP 표시를 유지하며 과거 'MP 미이식' placeholder는 수용하지 않음. 나머지 KO/EN 연결과 영문명 변경 인수 |

문서 독립 절은 병존한다. 번역 목록은 CRLF/LF 차이가 전체 문서 충돌을 만드는 것을 발견해, 각 merge-base/ours/theirs를 외부 임시 파일에서 LF로 정규화한3-way 비교 후 신규 절을 병존하고 CRLF로 복원했다. 최종9495줄/loneLF0, 상세 원문/normalized merge는 외부 translation-* 파일에 보존한다. MAP11-14 입력 자체의 과거 기록 중복/증가를 임의 삭제하지 않았다. game.html blob은 기반과 동일하다. 타인 WIP/사용자 저장/원본 음원·전투 보호 설계 변경0.

실행법: `python3 godot/tests/run_integ_fix.py --source-root=<읽기전용R> --node-bin=<Node24절대경로> --out=<새출력경로>`. game.html/godot를 checkout해야 하며, 엔진은 사용자 지정4.7.2 기본 경로 또는 EXODUSER_GODOT_BIN 환경변수로 선택한다. 로그 `~/exoduser-wt/_out/integ-fix/`에 최초·최종 결과, argv/gate/engine logs, source/CRLF/ancestor/R audit, diff와 제출 보고서를 보존한다.

## MAP PRODUCTION REPORT — 통합 기술 검수 한정

STAGE: CH1-1 / MAP11-14 인수. MASTER(silhouette/regions/main route/side spaces), OUTER MASS(LEFT/RIGHT/TOP/SOUTH/holes), LARGE(source/composites/overlap/repetition), MEDIUM(connections/holes), GROUND(shadow/contamination/integration), PLAYABLE(arena/travel/breathing/threat/readability), LANDMARK(primary/secondary/tertiary)는 원작성 변경을 인수했으며 이번 신규 제작/시각 판정0.
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새 캡처0, 이전 원작성 RETOUCH/인수대기 유지.
TECH QA: Main fresh→field Marker→gate→arena37/0, clear 전 Exit 거부. collision/seam/404/GPU/performance 전수 재검수0.
FILES: stage-owned는 db9219b4의3개 map script/캡처 script·관련 docs를 인수. concurrent WIP0, unrelated touched0.
GIT: 지정 경로만 stage, 정상 merge/commit 후 동일 통합 ref에 일반 push, 원격일치 후 DONE/자기WT제거. deploy0.
VISUAL VERDICT: RETOUCH (기존 판정 유지, 이번 기술 PASS로 승격하지 않음).
NEXT PASS: 원작성 시각 인수·MAP11↔37 자연 progression·모든 enemy/필드보스 동시 E2E. PC 접근/실행·청감/PCM·최종 자연 사망/clear·저장 E2E·전체 성능은 미확인이다.

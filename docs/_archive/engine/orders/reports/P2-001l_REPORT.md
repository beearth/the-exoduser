# P2-001l PC 인수 보고서 — 2026-10-20

상태: 검수 대기(부분 이식). 전체 레슨·챕터2 완료나 시각 PASS를 주장하지 않는다.
작업 worktree: `G:/exoduser-wt/p2-001h-curtain`, 브랜치 `claude/p2-001l-lesson-steps-20261020`.
인수 HEAD: `e64db2cee492d51dce036d94b9d7d15697bfbdf7`, 이전 구현 커밋 `1a47e3236`.
본 폴더 `G:/exoduser`는 공동 작업판 읽기만 했으며 수정·브랜치 전환·커밋하지 않았다.
작업판은 이 worktree에 없으므로 총괄이 원본 작업판의 P2-001l 행을 본 보고서로 갱신해야 한다.

## ① 원본 근거

| 기능 | 이 worktree 원본 행 | 적용·경계 |
|---|---|---|
| 입력 allows | parry-lesson.js:30~46 | 기존 입력 게이트 유지, 이번 인수에서 입력 함수 수정0 |
| step 0 | parry-lesson.js:182~235, 424~425, 653~682 | 실 Q 반사 이벤트 및 처치 관측. Q/E 판정 코드 변경0 |
| step 8 시작·스폰 | parry-lesson.js:261~280 | 기존 진행분 인수: 슬롯1 시전, 10마리, 반경180/220/260, 거리300/간격24, HP·동량 실드 |
| 가시덫 완료·복원 | parry-lesson.js:282~311, 655~683 | 실제 DOT 10처치+방향키120px 탈출, 스냅샷·존 정리 |
| 가시덫 피해·감속 | game.html:45507, 34398, 37471~37472 | 피해 provider 사용, 크롤러 감속 필드 수용. 신규 수치 조정 없음 |
| 단계 순서 | parry-lesson.js:496~503 | -1→8→0. K의 과거 미이식 기대값만 현행으로 수정 |
| 챕터2 | parry-lesson.js:482, 496 / resource-practice.js 별도 모듈 | 미이식. 현재 포트 done→finish 경계 유지, 성공·이식 완료로 계산하지 않음 |

## ② 변경 파일·소유권

| 파일 | 구분 |
|---|---|
| godot/scripts/native_parry_lesson_flow.gd | 이전 Claude의 미커밋 step 8·패널 진행분 인수 |
| godot/scripts/enemy_melee_flesh_crawler.gd | 이전 Claude의 감속 필드·write·소비 진행분 인수 |
| godot/tests/test_p2001l_lesson_steps.gd | 이전 Claude의 실제 가시덫·DOT·탈출 회귀 진행분 인수 |
| godot/tests/visual_p2001l_capture.gd | 이전 Claude의 step 8 캡처 진행분 인수 |
| godot/tests/test_p2001k_lesson_practice.gd | 인수 후 실패2건 원인=낡은 기대값. 정지→실제 10적 연습, 키캡1→1 + W A S D. 자동 완료 방지·스킵 복원 검사는 유지 |
| docs/engine/FDG_P2_001L_LESSON_STEPS_ALLOWS_20261020.md | 현행 step 8·한계 동기화 |
| docs/engine/FDG_P2_001K_LESSON_PANEL_PRACTICE_20261020.md | 후속 상태 동기화 |
| docs/engine/FDG_P2_001J_LESSON_FLOW_AND_CLOCK_20261020.md, FDG_GAME_DEVELOPMENT_PLAN.md | 기존 기록 보존·현행 검토 후보 링크 각2줄 |
| 본 보고서 | 원본·검수·남은 게이트 기록 |

공용 main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd:
인수 HEAD 대비 각 +0/-0줄. Q/E 판정·2_3 문서·세이브 형식·원본 에셋 변경0.
`tools/guard.baseline.json`의 기존 +1/-1줄은 본 작업과 무관하여 보존하되 스테이징·커밋 제외.

## ③ 테스트 명령·수치·로그

엔진: Godot `4.7.2.stable.official.ed1daf0bf`.
실행: 제공된 `run_godot_tests.sh <worktree>/godot G:/exoduser-wt/_out/P2-001l-pc/<회차> <테스트>:<격리이름>`.
전체 나머지 순차 실행 목록·정확한 격리 이름은 `_out/P2-001l-pc/remaining-specs.json`,
실행 래퍼는 같은 폴더 `run-remaining.cjs`. 실제 저장 폴더 사용0, 서버3333 조작0.

| 검사 | 검사/실패 | 로그 폴더 |
|---|---|---|
| test_p2001l_lesson_steps | 66/0, SKIP0, stderr ERROR0; trap_kills10, 실 Q 시도1, speed180 | regression-20261020 |
| test_p2001h_curtain_spawn | 124/0 | regression-20261020 |
| test_p2001i_boot_intro | 18/0 | regression-20261020 |
| test_p2001j_lesson_clock | 21/0 | regression-20261020 |
| test_p2001k_lesson_practice 최초 | 32/2, step8 정지·키캡의 낡은 기대값 | regression-20261020 원로그 보존 |
| test_p2001k_lesson_practice 수정 후 | 32/0, SKIP0, stderr ERROR0 | k-fixed-20261020 |
| test_p2005c_spike_holy | 20/0, 종료 resource still in use ERROR1 별도 | regression-20261020 |
| test_native_qe_binding | 155/0 | regression-20261020 |
| test_contracts | 5그룹/0실패 | regression-20261020 |

모든 로그 폴더 기준: `G:/exoduser-wt/_out/P2-001l-pc/`.
회귀 전체 최종 집계: 51종 실행, K 수정 후 결과 기준 42종 exit0 / 8종 exit1 / 1종 exit2,
실패 assertion 19건 및 fixture 로드 실패1종. 전체 PASS가 아니다. SKIP 관측0.
기계 판독 결과는 `G:/exoduser-wt/_out/P2-001l-pc/final-results.json`에 보존했다.
헬퍼는 마지막 명령만 exit를 반환하므로
헬퍼 exit0만으로 전체 통과를 주장하지 않으며 각 out/err의 FAIL·SCRIPT ERROR를 확인한다.
K 재검증과 나머지 순차 회귀 시작 구간이 잠시 겹쳤다. K는 정확한 격리 검사·SKIP0으로 완료했으며,
나머지 회귀 역시 최종 로그의 격리 경로와 SKIP를 확인한다. 이 구간은 성능 측정 근거가 아니다.

| 잔여 실패/오류 | 실제 결과 | 원인·판정·조치 |
|---|---|---|
| encounter_factory | 실패3 | source/admission actor 수 기대값. 기존 logs_final 동일 실패, 본 작업에서 actor 승격·검사 완화하지 않음 |
| etype0_physical_flesh_crawler | 실패1 + RecordingTarget.apply_native_burn script error | 기존 logs_final에도 동일. 테스트 fixture/기대값 후속 트랙, 본 작업 미수정 |
| etype4_ice_soul_flame / physical_spine_beast | 실패3 / 1 | 보존된 logs_base와 동일 수치 |
| main_source_authority | 71/6 | 보존된 logs_base·logs_final의 6개 assertion 메시지 동일 |
| main_source_player_initialization | 117/2 | movement_damage 기대값, 기존 logs_final·작업 지시서 기준선과 동일 |
| main_source_starter_state | 145/2 | 보존된 logs_base·logs_final과 동일 2메시지; 이전 L 문서의 1실패 표기는 현행에 적용하지 않음 |
| type3_spawn_recipe | exit2, 결과 ledger 없음 | invalid native constructor oracle fixture / JSON parse 오류. 보존된 logs_base·logs_final 동일 환경 문제 |
| windows_native_package | 실패1 | packaged_icu_data, icu_bytes0. 기존 기준선 동일 |
| p2003a_lighting | 10/0, ERROR1 | dummy renderer texture null, 기존 logs_final 동일. 실제 화면 검증으로 인정하지 않음 |
| p2005c_spike_holy | 20/0, ERROR1 | 종료 resources still in use3 / ObjectDB6 누수. 이전 logs_final에는 없음: 새로 관측된 cleanup 오류로 별도 잔여 기록, 원인 확정·해결 아님 |
| M30 / sprite_startup_loss / windows texture fixture | 예상 ERROR 존재 | 의도한 missing-resource·startup-loss 음성 검사의 오류. assertion 실패·실제 누수와 구분 |

기준선 비교는 기존 담당이 보존한 원로그를 읽어 확인한 것이다. 이번 세션에서 base 체크아웃으로
전환하거나 원본 WIP를 stash/reset하여 교차 실행하지 않았다. 따라서 전체 선재성의 독립 재현 완료나
추가 cleanup 오류 무해성을 주장하지 않는다. 오류를 숨기기 위한 생산 코드 변경은 하지 않았다.

### 시각 근거 경계

이전 담당 산출물 `G:/exoduser-wt/_out/p2-001l/`의 visual.out.log와 비교 이미지 인수 확인:
trap_kills10·spike_trap_done true·step1·reflected_seen true. 해당 실행에는 RID 누수 ERROR도 있다.
`cmp_p2l_step8_panel_1x.png`, `cmp_p2l_step8_field_1x.png`를 이번 세션에서 직접 열어 확인했다.
패널 키캡·제목·4/12·가시덫 상태 문구는 있으나 웹/Godot의 행간·폰트·체크박스·적 외형 차이가 남는다.
현재 세션의 새 실창 자연 플레이·녹화 검수는 하지 않았다. VISUAL VERDICT: RETOUCH.
헤드리스의 위치 주입·기본 공격 크레딧 호출은 전체 자연 입력 플레이 증거가 아니다.

## ④ 커밋·원격

구현·문서 커밋: `92df86c30` (7파일 +353/-49). 보고서 커밋은 이 커밋의 후손이다.
원격 readback SHA는 push 완료 후 최종 응답에 기록한다(보고서 자신의 SHA 자기참조는 하지 않음).
push 전 원격 main 관측 SHA `2602ae5ce8967627f8572fff57b8a4b217052710`; 본 작업은 main push·병합 없음.

## ⑤ 남은 것

- step1~7 해당 탄/행동은 미이식으로 명시 정지. 하니스의 pending 주입 전진은 실제 완료가 아니다.
- 챕터2 resource-practice 미이식. 기존 done→finish 경계이며 자원 연습 완료를 주장하지 않는다.
- 가시덫 이동은 웹 _ffMoveE 대신 기존 크롤러 AI, 피해 기준 lv1과 기존 스킬레벨 차이·슬롯1 고정 등 원본 동등성 미완. 수치 임의 수정하지 않고 총괄에 인계한다.
- 원본 암흑탄/적 외형, 반사 크레딧의 동일성 대신 이벤트+사망 관측, 수명 차이 등 L 문서의 남은 경계 유지.
- 전체 회귀의 선재 실패·종료 누수, 새 자연 플레이·시각 인수, main 병합은 별도 게이트다.

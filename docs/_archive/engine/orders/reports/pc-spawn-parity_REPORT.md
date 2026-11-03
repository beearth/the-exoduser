# PC-SPAWN-PARITY — INTEG-16b V-03 첫 진입 적 구성·레슨 시점·저프레임 보고

2026-10-23 KST, PC Claude. 기준 INTEG-16b `ff23449e`, 브랜치 `claude/pc-spawn-parity-20261023`, worktree `G:/exoduser-wt/pc-skill-writers`(재사용, 새 worktree 0, import 추가 실행 0).
원본 = 고정 스냅샷 `godot/source_snapshot/game.html`(dee094fd) 행. 웹 = `G:/exoduser` main, `PORT=3391`, 격리 저장, Playwright 헤드리스·음소거(끝난 뒤 내 서버만 종료).
원시 자료 `G:/exoduser-wt/_out/pc-spawn-parity/`(web/·probe/·logs/·regress/·tools/). 원인·계약 전문: [PC_SPAWN_PARITY_20261023.md](../../PC_SPAWN_PARITY_20261023.md).

## 1. 항목별 원인·수정

| 항목 | 원인(원본 행) | 수정 파일 | 결과 |
|---|---|---|---|
| 1 링 정예 롤 | 이미 원본 경로(`rollElite` G31065, mkEn 31134) 이식. verify 2회 875는 확률(3%/마리) | 없음 | 20회 중 9회 링 정예 1마리(1751). 롤 동작 확인 |
| 2 ring_04 정지 | 스폰은 `canMv(…,10)`(31124) 통과지만 실제 r≈22로 아래 타일벽(196행)에 코너가 걸림. 원본은 적 루프 벽 끼임 구조(G34427~34431)·`_pushOutWall`(G31724/38591)·`_ffMoveE` 우회(G31909~31952)로 빠져나오는데 crawler에 없었음 | `enemy_melee_flesh_crawler.gd`(PC) | 웹 2.0초 (3814.9,7640.9) / Godot (3813.9,7638.5) |
| 3 자연 공급 | 주기·예산·트리거·종류 롤은 원본과 같았음(시도 4초 5·10초 19). 다른 점: 소환 좌표(G35660~35673)·mkEn 좌표 검사(31124) 누락으로 소환굴 중심 생성, B/F/D/29 actor가 있어도 스케줄러 HOLD, 일부 거절이 간격 커브를 건너뜀 | `native_natural_enemy_base.gd`(Mac, 최소), `native_stage_spawn_adapter.gd`(Mac, 최소) | 시도 4초 5·10초 19(웹 6회와 같음), 등록 2·14(11종), 좌표 원본 분포 |
| 4 머리 위 라벨 | 상태(`charge_ticks`)는 있었고 표시만 미이식(G20101~20105, 24098~24123) | `enemy_melee_flesh_crawler.gd`(PC), `data/demo11_ui_i18n.json`(EN 1키) | 같은 순간 2배 크롭 일치 |
| 5 레슨 시작 | 원본과 같은 조건(+900ms `G._intro=null` 다음 틱). verify의 1.2~3.2초는 저프레임 측정 환경 | 없음(로직) | 헤드리스 0.97~1.01초·창 1.03~1.07초 / 웹 0.91~0.93초 |
| S-02 | 레슨 배경막을 전체 검정 α.5로 근사(원본 왼쪽 45% 투명 그라디언트, parry-lesson.css 1). 구역 제목은 원본도 레슨 시작 때 보임(첫 `updateHUD(true)` +174ms, 3.1초) | `native_parry_lesson_flow.gd`(PC), 테스트 `test_p2001k_lesson_practice.gd` 배경막 검사 정정 | 1.15초 화면 밝기·제목 노출 웹과 일치 |
| 레슨 뒤 iframes/st | `finish()` 691~692 복원 누락 | `native_parry_lesson_flow.gd`(PC) | 레슨 뒤 iframes 544~585(웹 569) |
| 저프레임 | 실제 CPU 과부하(헤드리스 재현). 물리 틱마다 HUD 전체 재계산 4.5ms + E 원천 중복 1.6ms → 물리 >16.6ms → 프레임당 물리 8틱 몰림 | `hud.gd`, `native_combat_qe_adapter.gd`(+iframes 복원) | P코어 고정 헤드리스 8~12초 12~27fps → 96~144fps |

## 2. 웹 대비 시계열 (레슨 건너뛰기 기준)

| 시점 | 웹(6회) | Godot 수정 전 | Godot 수정 후 |
|---|---|---|---|
| 4초 | 자연 5마리 | 1마리 | 시도 5 / 등록 2 |
| 10초 | 자연 19마리, 11~14종 | 3~5마리(etype 0·1·4·5·6·15) | 시도 19 / 등록 14, 11종(0,1,4,9,10,11,12,18,23,26,27) |
| 링 | 5마리 7초 접촉 | ring_04 정지 | 5마리 7~8초 접촉 |

## 3. 테스트

마지막 코드 수정(03:09) 뒤 실행분만 판정. 기준판 = 같은 worktree의 수정 전 ff23449e 실행(base).

| 테스트 | 결과 |
|---|---|
| test_demo11_47h_e2e (r2, 03:23) | PASS 13 / FAIL 0 |
| pc_move_skills·pc_combat_kill·pc_combat_pack_b(+mac)·pc_player_life·pc_final_death·pc_enemy_revive·pc_boss_parity·pc_skill_writers·pc_hud_stats·p2001k_lesson_practice·etype0_physical_flesh_crawler·perf_enemy_equivalence·etype_b/f_runtime·map11_stage_provider·43_stage_spawn_adapter·followups_fieldboss | 통과 |
| demo11_enemy_base(2건)·enemy_base2(18)·enemy_base3(21)·etype_a(2)·etype_d_runtime(7)·etype15_runtime(1)·p2001h_curtain_spawn(2)·p3002_spawn_holes | 실패 — **기준판과 같은 항목**(수정 전부터 있던 stale 실패, 이번 변경의 회귀 아님) |
| enemy_base_d·etype_e_admission | 기준판도 시간 초과(RC 124) |

주의: 이 회귀는 같은 테스트를 r1~r4로 여러 번 다시 돌렸다. 2026-10-23 사용자 규칙(실패 시 재실행 금지, 원인 수정 뒤 1회)이 생기기 전 실행분이다.

## 4. Mac 파일 변경 목록(스폰 공급 최소 수정)

| 파일 | 변경 |
|---|---|
| `godot/scripts/native_natural_enemy_base.gd` | `spawn_hole`: 원본 좌표 루프·나선·중심 강제, mkEn `canMv(…,10)/safePt`·null 처리, 좌표를 어댑터에 1회 전달, B/F/D/29 handoff 연결, mkEn null 외 커브 적용(`return true`). 기존 A/15/0 경로·RNG 순서·actor 생성 코드는 그대로 |
| `godot/scripts/native_stage_spawn_adapter.gd` | `set_source_spawn_position`/`clear_source_spawn_position` 추가, `request_spawn`이 provider 수락 뒤 그 그룹 1회분 좌표로 바꿔 돌려줌 |

## 5. 미확인·남음

- 미이식 자연 etype 3·7·13·14·16·17·20·21·47(시도의 약 40%)과 정예 자연 스폰(3%) — actor·모디파이어 owner 부재.
- D 생성자 자체 난수(소비 순서 차이), B/문지기 전체 반경 재검사, 지역 처치 귀속 기준(스폰 좌표 vs 그룹 지역).
- 창 모드 순간 저프레임(8~19fps 구간): 사용자 플레이 창 동시 실행·코어 배치와 분리 측정 못함.
- 사용자 창·서버 재시작 없음. Git 반영만으로 열린 실행본이 바뀌지 않는다.

## INTEG-17d 재료 리뷰 정정 (2026-10-23 Mac)

원격 tip `4f4fe928dfb617e75cff5064dc430247dd7ea446`의 실제 코드는 B/F/D/29 자연 스케줄러 HOLD를 유지한다. 위 §1·2·4의 연결/14등록·11종은 중간 시험 결과이며 최종 인수 코드의 연결 완료가 아니다. 최종 계약은 `PC_SPAWN_PARITY_20261023.md` §공급 표와 코드의 `natural_profile_scheduler_HOLD`를 따른다. Mac 두 파일은 좌표 샘플/검사·1회 전달/회수·null 이외 간격 커브를 인수하며 HOLD 해제는 하지 않았다.

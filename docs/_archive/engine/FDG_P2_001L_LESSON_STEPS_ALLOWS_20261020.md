# FDG P2-001L — 연습 step 0~7 + allows 입력 제한 (2026-10-20)

브랜치 `claude/p2-001l-lesson-steps-20261020` (base bbcbb1bda). 소유 파일:
`godot/scripts/native_parry_lesson_flow.gd`, `godot/scripts/player.gd`(입력 퍼널 한정),
`godot/tests/test_p2001l_lesson_steps.gd`, `godot/tests/visual_p2001l_capture.gd`.
`native_normal_enemy_hurte.gd`·`native_skill_slots.gd`·Q/E 판정(2_3) 불간섭(지시 준수, diff 0).

## 1. 원본 근거 (parry-lesson.js / game.html)

| 구현 | 원본 행 |
|---|---|
| step 순서 -3→-2→-1→8→0..7 | parry-lesson.js 501 |
| spawnParryEnemy: 8각 a=-π/2+i·π/4 반경 280, d>450/<160 거부, hp1·atk0·spd0 | 182~201 |
| tickParryEnemy: 적 유지→차징(60틱)→발사→샷 소실 시 cooldown 60 | 204~235 |
| 레슨 샷: dmg0·EL.D·#b26dff·homing·vx/vy=3px/틱·_lessonShot:true | 221~226 (speed 3px/틱=180px/s) |
| 차징 링: R=r+10, 바탕 #080808 α.28 w5, 진행 아크 col α(.8+prog*.2) w3.5, -π/2 시작 | game.html 24110 _drawShootCharge / 20099~20102 |
| 반사 크레딧: step 0·parryEnemy·parriedShot===shot·_lessonParryShot·friendly·parryBlueBean | 653~654 |
| 반사 처치 → completeStep | 664~682 |
| onParry → parriedShot·updateParryPractice | 424~425 |
| step0 practice 문구(제목/힌트/패링 전·후 줄) | 181~186 updateParryPractice |
| step 0~7 title/tips/key | game.html render 139~143 / key() 118 |
| checks·pending success/done | 427~434 completeStep (431~432) |
| allows: !active ∥ (intro 아닌 방향) ∥ (practice·단계 actions) | 30~33 actions()/allows() |
| 반사탄 데미지 kiFloor 바닥(dmg0 탄도 >0 반사) | game.html 28036 pParryProjDmg·포트 main.gd 1193 |

## 2. 구현 — step 0 (실구현, 실이벤트 구독만)

- 스폰: 기존 `_spawn_lesson_enemy`(mkEn 미러·etype0 리터럴 레코드 계약 재사용)로 8각 280px,
  160~450 수용 밴드(188) 재현. 수용 실패 시 cooldown 60 재시도(207).
- 차징: cooldown 45→`parry_charge=60`(228), `_dtSp=1`/렌더프레임 감쇠. 링은 `_RingDrawer`가
  24110 산식 그대로(R=r+10·바탕 원·진행 아크 #b26dff).
- 발사: 포트의 유일 Q-반사 캐리어 `enemy_projectile.gd`(dark gbBean)를 enemy.gd 214 패턴으로
  configure(dmg 0, speed 180). 캐리어 `_raw._lessonShot=true` 주입(226 spawnProj 상응 —
  반사 블루의 `opts._lessonParryShot`·지형차단 스킵(parry_blue 397) 계승).
- 판정(구독만): ① 반사 = player `telemetry_event`의 `q_projectile_reflected`(main.gd 1223 소유)
  구독 → `shot_reflected`(653 parriedShot 상응, 발사마다 리셋). ② 처치 = 반사 블루빈이
  기존 경로(parry_blue `_call_hurt`→flesh `receive_damage/4`, dmg는 kiFloor 바닥으로 >0)로
  적을 실제 사망시키면 tick이 사망+shot_reflected 관측 → `_complete_step()`(664~682 상응).
  판정 로직 신규 작성·기존 전투 코드 수정 0.
- Q 호밍 lesson 분기(19173, parry_homing_target)가 `parryEnemy` 필드명을 읽으므로
  flow 변수명을 camelCase `parryEnemy`로 고정(주석 명기) — 반사 블루가 레슨 적을 조준.

## 3. 정지 단계 (가짜 진행 금지 — STEP_HALTS)

step 1~7은 해당 탄/행동이 Godot에 미이식이라 **정직 정지**(패널 문구·키캡은 원본 그대로 렌더,
진행·스폰 없음, 스킵만 가능):

| step | 정지 사유 키 | 미이식 근거 |
|---|---|---|
| 1 | physical_projectile_reflect_unported | E/Q 반사 캐리어가 dark gbBean 한정 (enemy_projectile.gd 134 `_raw.gbBean!=true` 거부, E wave도 main.gd 1760~1779 gbBean만) |
| 2 | volley_mixed_magic_projectiles_unported | 화염·물·번개·무지개(blackBean 외) 혼합 마법탄 발리 미이식 |
| 3 | volley_physical_projectiles_unported | 이빨입탄·혈안탄·관통탄·검기파·환영검 미이식 |
| 4 | chain_movement_unported | Shift 사슬 이동 미이식 (port 입력 액션에도 'charge' 없음) → 2026-10-22 PC-MOVE-SKILLS: 행동·`charge` 액션 이식(allows 'charge' 잠금과 연동). 레슨 연습 본문(parry-lesson.js tickChainPractice 단계별 목표·리필)은 미이식이라 정지 사유 유지 — step 0~3(패링 투사체) 정지로 아직 도달 불가 |
| 5 | lightning_dash_unported | 전격이동 미이식 → 2026-10-22 PC-MOVE-SKILLS: 전격이동 행동 이식. 레슨 연습 본문(tickDashPractice 5회 카운트·MP/게이지 리필)은 미이식 — 정지 사유 유지 |
| 6 | rage_gauge_unported | 분노 게이지 미이식 |
| 7 | rage_burst_unported | 분노 발동(rageCast 689) 미이식 |
| 8 | 정지 해제 | e64db2cee 병합 후 실제 가시덫 시전·DOT 10처치·방향키 120px 탈출 연결. 원본 261~311·655~683 |

**순서 의존성**: 501 순서 -1→8→0을 유지한다. 현재 L 테스트는 step 8에서 키1 실제 시전,
실제 DOT 10처치 및 방향키 탈출 후 0으로 전진한다. 기본 공격 단계에는 하니스의 크레딧 호출과
위치 주입이 있으므로 전체 자연 입력 플레이 완료 증거로 사용하지 않는다.

### step 8 원본 계약과 이식 경계

| 항목 | 원본 parry-lesson.js | 현재 구현 |
|---|---|---|
| 시작·복원 | 261~266, 305~311 | skills.spikeTrap·mats·gc_cd 스냅샷/복원, 종료 시 가시덫 존 제거 |
| 적 | 267~280 | 최대10, 60후보, 반경180+(i%3)*40, 거리300/적간24 거부, HP=기준피해*(5+n)*0.5, 동량 eShield, 속도1.6 |
| 연습 유지 | 282~296 | 악의 최소5(원본 _malCost(10)), 존 없으면 쿨0, 방향키 유지+존에서120px 탈출, 10킬+탈출 완료 |
| 처치 | 655~683 | dot+spikeTrap+등록된 레슨 적만 인정, eShield 선흡수, HP 잔여 적용 |
| 패널 | 298~303 | 키캡 `1 + W A S D`, 가시덫 완료 체크 |
| 남은 동등성 | 263, 275, 289~294 | 스킬 슬롯1 고정 배선; 기준피해는 lv1로 계산(실제 스킬은 max(1,기존레벨)); 웹 _ffMoveE 대신 크롤러 AI. 완전 동등 주장 금지 |
| 크롤러 감속 수용 | game.html 34398, 37471 | _spike_slow/_spike_slow_lv 필드와 spike_slow write, 원본 감속식 소비 |

## 4. allows 입력 제한 배선 (player.gd +20/-1줄)

- `_native_lesson_blocks_action(action)` 헬퍼(11줄): main→source_intro_sequence→lesson_flow
  경유, flow 비활성이면 항상 통과.
- 입력 퍼널 `handle_native_input_event` action 루프에 게이트 4줄: 차단 시
  `_native_input_held[action]=false`(stuck-key 방지)·reason `parry_lesson_input_locked` 반환.
- 레거시(비-native 바인딩) `_unhandled_input` weapon 분기 1줄 방어 게이트(레슨 중 도달 불가 경로).
- flow 측: `allows_native_action()` — 포트 액션명→원본 행동명 매핑
  (move_*→방향, weapon→weapon, parry→parry, shield_bash→shield, native_magic→beam, rage_slot→bow).
- beginPractice 리스너(W/A/S/D)는 `_unhandled_input`→`_input` 승격: 게이트가 같은 키를
  lock 처리(set_input_as_handled)해도 원본 allowKey(37)처럼 항상 먼저 듣는다.
- **소유 겹침 공지(2026-10-20)**: 스킬 담당이 player.gd·main.gd에 자연 회복 배선 예정 —
  입력 처리 함수(handle_native_input_event·_unhandled_input·본 헬퍼)는 P2-001l 소유,
  그쪽은 리젠 호출만. 이번 커밋의 player.gd 변경은 위 세 함수 범위 안에만 있음.

## 5. 챕터 2 (범위 큼 — 목록만, 미구현)

원본 `window._resourcePractice`(별도 모듈) 위임: 자원 연습 labels/actions/render/가이드 행,
done 시 496 챕터2 진입. 포트는 `phase=="done"`에서 바로 finish(497) — 기존 P2-001j 상태 유지.

## 6. 검증

- `test_p2001l_lesson_steps` 58/58 PASS (격리 EXODUSER-P2001L-Isolated-20261020):
  ① allows 게이트 14 — intro 전면 차단/연습 방향 통과/단계별(weapon·parry·shield_bash·native_magic) 차단·통과/held 해제/종료 후 통과,
  ② step 0 실이벤트 15 — 기본 3스텝 실크레딧→8→0 실전진, 스폰 밴드 160~450, hp1, 차징→발사,
  캐리어 gbBean+_lessonShot+dmg0, **실 Q 패링**(parry 액션 실입력, q_projectile_reflected 구독)→
  반사 블루빈 실처치→checks[0]→step 1 전진(빗나감 재장전 대응: step 0 종료까지 재패링 루프),
  ③ 정지 29 — step 1~7 사유·키캡·문구, 정지 중 무진행·무스폰, skip 복원(링 5·레슨 적 0).
- 회귀 전체: 신규 실패 0. 기준선 동일 실패만 — encounter_factory 3·etype0 admission 1·
  initialization 2(movement_damage, main 병합 선재)·etype4 ice 3/spine 1·authority 6·
  starter_state 1·type3_spawn_recipe(oracle fixture 환경)·windows_native_package(icu 환경)
  — 전부 변경 전 base에서 동일 재현 확인(stash 교차검증). regen_phase 1회 139는 플레이키
  segfault(world.gd canvas onload), 재실행 2회 PASS·base PASS.
- 시각(1x): `_out/p2-001l/cmp_p2l_step0_field_1x.png`·`cmp_p2l_step0_panel_1x.png` +
  godot/web 원본 4쌍. 실 Q 패링 성공 장면 포함(g_step0_reflected_window.png).

## 7. 웹 대비 차이표 (step 0 — 없음/남음)

| 요소 | 상태 | 비고 |
|---|---|---|
| 패널 제목/힌트/패링 전·후 줄 (181~186) | 차이 없음 | 1x 대조 |
| 서브타이틀 5/12·현재행 하이라이트·체크리스트 문구 | 차이 없음 | |
| step 1~7 title/tips/keycap (139~143·118) | 차이 없음 | SHIFT·"↔ + SPACE"·SPACE 표기 포함 |
| 차징 링 산식 (24110) | 차이 없음 | R=r+10·바탕 α.28·진행 아크 α(.8+prog*.2)·w3.5 |
| 스폰 지오메트리(280·160~450)·hp1·cooldown 45/60·차징 60 | 차이 없음 | |
| 반사 크레딧 효과(반사탄만 처치 인정) | 차이 없음 | 653 등가 — 관측 방식은 아래 '남음' 참조 |
| 가시덫 체크박스 상태 | 남음(의도) | 포트 step 8 보류라 미체크 — 웹 스테이징은 완료 주입 |
| 653 크레딧 관측 방식 | 남음(기록) | 웹=hurtEnemy opts._lessonParryShot 동일성 검사 / 포트=q_projectile_reflected 구독+사망 관측(레슨 적탄이 1발뿐이라 등가·수정금지 파일 회피) |
| 레슨 샷 수명 | 남음(미세) | 웹 life 360 / 포트 캐리어 고정 120(=360px 비행, 280px 스폰이라 도달 충분·재장전 동작 동일) |
| 암흑탄 시각 | 남음 | 웹=EL.D 비(非)빈 암흑탄 스프라이트 / 포트=dark sphere(유일 Q-반사 캐리어) |
| 패링 적 외형 | 남음 | 웹 mkEn(etype0, EL.D) 암흑 변형 / 포트 etype0 물리 크롤러 리터럴 레코드(확장 금지 계약) 재사용 |
| e.facing 매틱 갱신(210) | 남음(코스메틱) | 포트 크롤러 자체 AI 유지, spd0·atk0이라 행동 영향 0 |
| 체크박스·풋터 버튼 폭·진행바 스타일 | 남음(k 범위) | P2-001k 승인 상태 그대로 — l 미변경 |

## 8. 남은 일(자동 진행 금지)

- step 8 현재 회귀·이식 경계는 위 표와 PC 인수 보고서 참조. 과거 §6의 58검사·시각 자료는 이전 담당 이력이며 현재 인수 검증과 구분한다.
- step 1~7: 각 탄/행동 이식 트랙 완료 시 STEP_HALTS에서 해제.
- 챕터 2 자원 연습(§5).

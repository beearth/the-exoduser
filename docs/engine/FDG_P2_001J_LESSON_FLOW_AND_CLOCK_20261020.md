# P2-001j — 커튼 직후 패링 레슨 흐름 + 업데이트 시계(타이머) 개통 (2026-10-20)

> 후속 상태: P2-001l 검토 브랜치에서 step 8 가시덫·step 0·allows를 연결했다. 아래 미이식·검수 수치는 J 당시 이력이며 현행 범위·제약은 [L 인수 보고서](orders/reports/P2-001l_REPORT.md)를 따른다. step1~7·챕터2는 여전히 미이식, main 병합은 총괄 검수 대기다.

## 1. 원본 흐름표 (현 리포 행)
| 단계 | 행 | 원문 | Godot |
|---|---|---|---|
| 루프 선두 | 32107 | `window._systemLesson?.tick();` — **반환 무시**(update를 절대 못 끊음) | 관측 presence "absent"(모듈 미이식 — 잔여는 시스템 안내 체크리스트 UI뿐) |
| 게이트1 | 32108 | `if(!G.on)return;` | phase_g_on — P2-001h/i의 state G.on 점등으로 개방 |
| 게이트2 | 32111 | `if(_parryLesson && _parryLesson.tick())return;` | **lesson flow owner** — services parry 관측이 이 위치에서 tick 1회 호출(유일 호출자) |
| 레슨 시작 | parry-lesson.js 468~474 | 비활성 tick: seen/stage0/G._intro/G.paused/_saving/P.hp/에디터·bosstest·mapqa·쿼리 게이트 통과 시 start() — 커튼 정리(63440 _intro=null) 후 자동 개입 | 동일 게이트(포트 비존재 게이트는 상수 비활성 — 잔여 목록) |
| start | 386~407 | seen=true·phase intro·**saved.ens=ens; ens=[]**(398~400)·G._bonfire 등 저장+null(400~401)·P.activeLMBSk='kiSlash'(396)·패널 | world.detach_native_enemies_for_lesson + sequence.bonfire 저장/비활성 + state p 스냅샷·강제 + intro 패널(원본 텍스트) |
| intro | 484 | phase 'intro' → return true (update 차단) | tick true → phase_parry_lesson RETURNED → stageTime 동결 |
| 스킵 | 105 | '연습 건너뛰기' → skipAll → finish | 패널 버튼 → skip_all |
| finish | 685~700 | ens 복원(689)·G 필드 복원(691)·스냅샷 복원(697)·active=false | restore_native_lesson_enemies + bonfire/LMB 복원 + seen 재시작 금지 |
| 게이트3 | 32112 | `if(_EDITOR_MODE){_editorUpdate();return}` — 3464 `?editor==='1'` file-init 상수 | 관측 {"editor_mode": false}(포트 캐노니컬 부팅엔 쿼리 표면 없음) |
| 시계 | 32742 | `G.stageTime+=sp; G.playTime+=sp;` | phase_stage_play_time → state sink 적용 — **개통** (HUD 60336 mm:ss 진행) |

레슨 중 게임 상태: 원본은 ens=[]로 적이 없고 update가 32111에서 끊겨 모든 게임 틱이
정지(이동 연습은 레슨 내부 로직). 포트 슬라이스: 적 detach(트리 제거=AI 정지)+bonfire
정지+update 차단 — 전투 판정(Q/E·2_3 돌진/패링/방패)은 일절 불변(레슨은 진행 제어만).

## 2. gap 구간 판정표 (영수증 근거)
영수증 = producer 366 "abstract owner gap receipt" {"completed":true,"returned":false}.
**발급 기준: 각 구간에 `return` 문이 없다는 정적 소스 사실**(grep 검증 — 아래 범위) →
이른 게이트를 통과한 프레임은 반드시 32742에 도달. '효과 완료' 주장이 아니라 '흐름을
끊지 않음'의 증명이며, 효과의 이식/미이식 분류는 아래와 같다(미이식분은 전부 비반환
호출이라 첫 전투의 흐름·시계에 영향 없음).

| 구간 | 행 | return | 이식분(소유자) | 미이식분(잔여) |
|---|---|---|---|---|
| panel_inputs | 32113~32131 | 없음 | — | KeyP 플레이어 포탈·패널 토글 7종·iris/blade 토글(UI/바인딩 표면 부재) |
| body_gap_to_hitstop | 32134~32584 | 없음 | 플레이어 행동 전체(player.gd·Q/E 어댑터)·충돌/플로우(world)·_gameFrame(world._native_frame)·하프/대시/체인(player) | ens null 정리(포트 레지스트리 자체 관리)·BOOTH(비활성 상수)·_fbTick/_wmTick/_fdTick(필드몹)·_regionTick(지역)·_twRecord(시간왜곡) |
| gap_hitstop_to_sp | 32595~32681 | 없음 | 파이어존류 일부(ground surface adapter) | 뇌전창/본월 수명 등(해당 스킬 미사용 시 빈 배열 순회) |
| gap_sp_to_stage_time | 32685~32741 | 없음 | dmgPeak 감쇠(state feel) | _pStats(보스 AI 카운터 — 보스 미이식)·_uqFrame/killBuff/legendary 타이머류 |

hitstop(32585~32594)/sp(32680~32683)는 gap이 아니라 producer 자체 phase(원본 비활성
hitStop=0·slowMo=0 그대로)로 이미 소유 — 변경 없음.

## 3. 변경
- `scripts/native_parry_lesson_flow.gd` 신규 — 위 흐름표의 레슨 owner(슬라이스:
  트리거·차단·intro 패널(원본 텍스트, 간이 스타일 — 디자인 미검수 명시)·스킵·복원).
  '시작' 버튼/연습 본문은 미이식 no-op 기록(가짜 진행 금지).
- `scripts/native_intro_curtain_sequence.gd` — 인트로 부팅 경로에서만 flow 설치(휴면
  설치본에 붙이면 수동 시퀀스 테스트의 기준선이 흔들림 — 원본도 stage0 신규 게임
  흐름 전용).
- `scripts/world.gd` — detach/restore_native_lesson_enemies (398~400/689 상응, 노드
  보존 분리).
- `scripts/native_source_player_initialization_services.gd` — ①system_lesson 관측
  "absent" ②parry 관측=flow tick 호출(32111 위치·횟수 동일) ③editor 증인(3464 상수)
  ④gap 4종 영수증(gap_flow_witness).
- `port_modules/source_update_clock_prefix/gap_flow_witness.gd` 신규 — 2의 영수증 owner.
- `tests/test_native_source_update_clock_play_time.gd` 계약 갱신: 구 "halt at
  system_lesson(관측 미소유)" → 관측 소유 후의 정직한 현재 게이트 = pre-stage
  **RETURNED at g_on**(원본 32108 `if(!G.on)return`이 첫 실게이트) — 사유 주석 기록.

## 4. 검증 (원로그 G:\exoduser-wt\_out\p2-001j\logs_final\)
- 신규 `test_p2001j_lesson_clock` **21/0**: dispose 전 레슨 차단(G._intro) → dispose 후
  자동 시작·적 저장/비움·bonfire null·LMB 강제·패널 → 레슨 중 clock RETURNED at
  parry_lesson + stageTime 동결 → 스킵 복원(5링 복귀·bonfire·LMB·seen 재시작 금지) →
  clock CONTINUE at stage_play_time·stageTime/playTime 증가·**HUD 타이머 00:03 진행**.
- 회귀: p2001i 18/0 · p2001h 124/0 · update_clock 30/0(계약 갱신 후) ·
  source_lesson 30/0 · intro_curtain 2종 PASS · p1002e 71/0 · p1002f 357/0 ·
  p1002g 214/0 · p2001a 31/0 · p2001b 40/0 · p2001c 46/0 · p2002a 38/0 · p2002b 16/0 ·
  contracts 5/0 · factory 3=기준선 · etype0 1=기준선 · initialization 2=선재(기존 기록).
- 화면·영상: `godot_curtain_lesson_timer_720p.mp4`(0.39MB — 커튼 닫힘→오픈→레슨 자동
  개입→스킵→5링 복원+타이머 진행) / `cmp_p2j_lesson_timer.png`(웹 00:00→00:03 타이머와
  같은 구간 — 웹 레슨 개입·스킵 후 타이머 00:03 = Godot 동일 흐름).

## 5. 잔여 (목록)
1. ~~레슨 연습 본문·패널 마감~~ — **P2-001k에서 기본 3스텝(-3/-2/-1)+42111 위임+패널
   디자인 마감**(`FDG_P2_001K_LESSON_PANEL_PRACTICE_20261020.md`). step 8·0~7·챕터2·
   dismissed 저장·allows 강제 배선은 그 문서 잔여.
3. system lesson(시스템 안내 체크리스트 UI, system-lesson.js) — 관측만 absent로 소유.
4. gap 미이식분(위 판정표 우측 열 — 패널·포탈·필드몹/지역 틱·pStats 등).
5. 웹 레슨은 스킵 전까지 G._bonfire 저장/복원으로 결계 시간도 멈춤 — 포트 동일.
   단 bonfire t는 레슨 중 포트 모듈이 감쇠 정지(active=false)로 동결하므로 원본(저장
   스냅샷)과 수치 경로는 다르나 결과 동등(문서화).
6. initialization 2실패(병합 main 선재 — HUD/이동 트랙).

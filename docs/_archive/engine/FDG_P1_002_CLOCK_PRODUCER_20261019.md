# P1-002 clock 생산자(D) 작업 문서 — 2026-10-19

> 상위: [FDG_GAME_DEVELOPMENT_PLAN.md](FDG_GAME_DEVELOPMENT_PLAN.md) P1-002.D · 사용자용 현황: [FDG_GODOT_PORT_STATUS.md](FDG_GODOT_PORT_STATUS.md). 이 문서는 기술 근거만 담는다. 완료율·ETA 없음.

## 1. 왜 이 작업인가 (차단의 정확한 위치)

| 항목 | 원본 (game.html, dd49171c5) | Godot 현재 (dd49171c5) |
|---|---|---|
| 프레임 clock | `update()` 32680~32683: `G.slowMo=0; const sp=(G.slowMo>0?.35:1)*_dtSp; …` | `port_modules/source_update_clock_prefix/producer.gd` `phase_sp()` — 포팅됨 |
| 플레이 시간 생산 | `update()` 32742: `G.stageTime=(G.stageTime\|\|0)+sp; G.playTime=(G.playTime\|\|0)+sp;` | **미포팅**. producer ORDER는 `sp`에서 끝남 |
| 생산자 구동 | `frame()` → `update()` 매 프레임 | Services `_advance_native_source_frame_callback()`는 frame-entry 4단계(timestamp→fps_cap→gap_frame_callbacks)까지만 진행. update clock prefix의 phase(system_lesson~sp)는 **제품에서 호출 0회**(선언 `declare_dt_sp`만) |
| 소비자 | hurtE 42328(`_lRingElem` 반응 쿨 120f), 유니크 쿨타임 16593/24599/24628/38520, 세이브 3555/3731, 전설 갑옷 43575 | Services `read_normal_enemy_play_time()` → State `read_native_normal_enemy_play_time()` → `_g["playTime"]` presence. 키 부재 → NOT_READY |

결론: "clock owner 연결 근거 미확정"의 실체는 **원본 생산자(32742)와 그 구동 루프가 포팅되지 않은 것**이다. 임의 counter·default 값으로 대체하지 않고 생산자 자체를 포팅한다. `(G.x||0)+sp`의 0 시작은 원본 규칙이므로 첫 프레임 0+sp 생성은 임의 default가 아니다.

## 2. 범위

- 추가: producer ORDER 끝에 `gap_sp_to_stage_time`(32684~32741, not in packet) + `stage_play_time`(32742) phase. `owner_writes` [G.stageTime, G.playTime].
- 구동: Services 프레임 콜백에서 frame-entry 뒤 update clock prefix를 순서대로 실제 호출(begin_update → … → phase_sp → gap → phase_stage_play_time → end_update). 실제 owner 없는 입력은 가짜 값으로 채우지 않고 NOT_READY/UNREACHED를 그대로 관측.
- 적용: State에 `owner_writes`를 `_g`에 1:1 적용하는 소유 메서드 1개(G.slowMo 포함). 같은 ref, 영수증 반환.
- 금지: enemy.gd/player.gd/world.gd 수정(enemy.gd는 Mac C 브랜치 소유), 새 idempotency token/epoch/캐시, 범위 밖 32684~32741 효과 구현.

## 3. 완료 조건과 증거 등급

| 등급 | 조건 | 상태 |
|---|---|---|
| 기획 확정 | 이 문서 + 계획표 D행 | ○ 2026-10-19 |
| 소스 구현 | 위 3파일 변경, 참조 함수 존재 | 진행 중 |
| 격리 검수 | godot/tests에 테스트: 프레임 N회 후 `_g.playTime == N*sp`, `read_normal_enemy_play_time().status=="READY"` 증가, 일시정지 시 증가 없음. headless 원로그 보존 | 미 |
| 실플레이 인수 | Mac 실행판에서 플레이 중 playTime 증가 관측(디버그 표시 또는 세이브 값) | 미 — PC에 Godot 바이너리 미확인, Mac 필요 |

## 4. 관련 미결

- Mac 브랜치 `codex/p1-002-hp-effect-owner-20261018`(enemy.gd HP owner, docs) main 통합 여부 — 총괄 결정 대기. 통합 시 PLAN/STATUS의 P1-002 구간 텍스트 충돌 예상(수동 해소).
- 이후 E(caller 최소 연결)는 D 완료 뒤 같은 표에 exactscope 고정 후 착수.

## 5. 소스 구현 결과 (2026-10-19, PC heavy 담당 → 총괄 인수)

| 등급 | 결과 |
|---|---|
| 소스 구현 | ○ producer.gd(+35: `gap_sp_to_stage_time`, `phase_stage_play_time`), services.gd(+104: 프레임 콜백에서 begin_update→12 phase→end_update 실호출, 결과는 `read_source_clock_input_snapshot().update_clock_result`로 관측), state.gd(+44: `apply_native_source_update_clock_writes` — "G.<key>"→같은 `_g` ref, 배치 원자 거부). main.gd 무변경(기존 `_process` 경로가 이미 매 프레임 도달). enemy/player/world 무접촉 |
| 정적 검사 | 4파일 gdtoolkit PARSE_OK, 참조 심볼 grep 확인. Godot 자체 파서·타입 검사 아님 |
| 격리 검수 | **미실행** — PC에 Godot 바이너리 없음. 테스트 `godot/tests/test_native_source_update_clock_play_time.gd`(producer 계약 3프레임 누적·일시정지·비숫자 / State sink 거부·READY 플립 / 실Main 6프레임 정직 halt) 작성만. Mac 실행 필요 |
| 실플레이 | 미 |

**정직한 현재 상태: 배선은 됐지만 플레이 중 playTime은 아직 증가하지 않는다.** 매 프레임 드라이버가 첫 단계에서 멈추며, 그 위치는 snapshot으로 관측된다. 도달을 막는 원본 생산자 결손(임의 우회 없음):

| 순서 | 막힌 phase | 결손된 원본 생산자 | 필요 작업 |
|---|---|---|---|
| 1 | system_lesson (현재 매 프레임 halt 지점) | `window._systemLesson`(system-lesson.js) 보유자/witness | parry_lesson_source류 presence holder 포팅 |
| 2 | g_on | `G.on=true` 쓰기(initStage, game.html:32209) | source_init_stage_entry_owner에 G.on 소유 추가 |
| 3 | parry_lesson | file-init 현재값이 truthy → 원본상 `tick()` 호출 | parry lesson tick 본문 포팅 또는 실제 falsy 전이 |
| 4 | editor | `_EDITOR_MODE`(game.html:3463) 보유자 | file-init 상수 holder |
| 5 | gap 4종 | panel_inputs / body_gap_to_hitstop / gap_hitstop_to_sp / gap_sp_to_stage_time 원본 본문 receipt | 각 구간 본문 포팅 또는 "효과 없음" 증명 receipt 소유자 |

추가 관측: Godot 일시정지는 `SceneTree.paused`만 쓰고 `_g["paused"]` 동기화 소유자가 없다(범위 밖 기록). 61875 accumulator 스케줄러는 `_acc` 소유자 부재로 미배선 — update 주기는 렌더 콜백당 1회.

> **2026-10-23 PC-SYS-1 갱신**: 렌더 콜백당 1회는 vsync 끔·max_fps 240에서 G.stageTime을 최대 4배 빠르게 만들었다(웹 00:03 vs Godot 00:08). `native_source_player_initialization_services.gd`가 원본 loop 누산기를 그대로 둔다 — `_prevTs`/`_acc`(G60470), frameTime=timestamp−_prevTs를 0..50 클램프(G61822·61827~61829), `_acc+=frameTime`·`_accCap=PHYS_STEP*5`(G61836~61839, `_prof.u<=8` 분기 — Godot에 update 비용 EMA 소유자가 없어 가벼운 쪽 사용), `while(_acc>=PHYS_STEP){update();_acc-=PHYS_STEP}`(G61878~61884, PHYS_STEP=1000/60 G60469). 렌더 콜백 하나에서 update prefix가 0~5회 돈다. 실측: 창 모드 건너뛴 뒤 초당 61틱(웹 60), 헤드리스(약 7fps) 초당 21틱(50ms 클램프 ×3 — 원본도 같은 규칙).

**총괄 판단**: 위 5단계 중 5(gap receipt)는 원본 update() 본문 대부분을 요구하므로, playTime 하나를 위해 전부 포팅하는 것은 첫 전투(P1-002.E) 효과 도달을 지연시킨다. 다음 배정은 (a) 1·2·4 holder 3종(작음) 포팅 + (b) gap 구간을 "첫 전투 범위에서 효과 없음" receipt로 닫을 수 있는지 원본 대조 판정, 두 갈래를 Mac 실행 검증과 함께 진행한다. 코드는 Mac 검증 전까지 main이 아닌 브랜치에 둔다.

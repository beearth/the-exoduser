# PC-BOSS-CHASE — B-01 보스 추적 + C-06·A-02·K-13 같은 조건 재측정 (2026-10-22, PC Claude)

- worktree `G:\exoduser-wt\pc-boss-parity`, branch `claude/pc-boss-chase-20261022`, 기준 `291b7edb2`(claude/pc-input-parity-20261022 tip, 추적 변경 0 확인 후 분기)
- 기준 문서 [PARITY_FULL_SWEEP_1_1_20261022](../../PARITY_FULL_SWEEP_1_1_20261022.md) B-01·C-06·A-02·K-13
- 원본 대조는 고정 스냅샷 `godot/source_snapshot/game.html`(dee094fd, snapshot.cjs/.gd)만. 행 번호는 이 스냅샷 기준(지시서의 30749·38584 등은 이전 스냅샷 4d911cdd 좌표, 해당 구간 +2)
- 산출물·로그: `G:/exoduser-wt/_out/pc-boss-chase/`(tools·logs·regress·art). Godot 은 모두 `--headless`(창 0 — 창 규칙 대상 실행 없음), 매 실행 override.cfg 격리 후 `_out/pc-boss-chase/cfg/`로 이동. `NODE_PATH=G:/exoduser/node_modules`(junction 0)

## 1. B-01 원인과 수정

### 1-1. 원인 1 — 시험 가정(원본에서도 같은 결과)

| 질문 | 원본(dee094fd) | Godot | 판정 |
|---|---|---|---|
| 보스 생성 위치 | `_enterBossArena` 30784 `mkEn((bossX+.5)*T,(bossY+.5)*T,si,0,true,STG[si].be,0)`, genBossArena 30699 의 bossX/Y = 아레나 중심(64,54). 위치에 RNG 없음 | Boss 마커(0,−8000) = 원본 (2580,2180). 같음 | 같음 |
| 생성 RNG 순서 | mkEn 31167 st2 → 31167 facing → 31170 projT → 31173 bossPatT → 31262 _bossOrbitAng → 31302 _erraticAng (etype0 ib 6회) | `native_ch1_boss_spawn_contract._RNG_SITES` 같은 6회 같은 순서 | 같음 |
| idle 추적 속도 | `_bossIdleMove` 38317: d>200 이면 0.5×1.15×min(2.5,1+d/300) = 최대 1.4375px/틱(플로우필드 방향) | 같음 | 같음 |
| idle 추가 걷기 | switch idle 40485: 보스도 일반 분기 → speed×1.6 = 0.8px/틱 **facing 방향** | 같음 | 같음 |
| 플레이어 인식 | 38686 d<800 + LOS 일 때만 `_alerted` → facing 을 플레이어로(38689) | 같음 | 같음 |
| 패턴 시작 | `_bossAI` 38387 `bossPatT>0 \|\| d>500 \|\| d<20` 이면 return | 같음 | 같음 |
| 입장 slowMo | 41802 slowMo≥60 이지만 update 32683 `G.slowMo=0`(완전 비활성) 뒤 sp 계산 → sp 1 | slowMo 소비자 없음 → sp 1 | 같음 |

- 결론: 입구(1960px)에서 비어그로 보스의 순접근은 1.4375 + 0.8×cos(facing−접근방향) = 0.64~2.24px/틱이다. 생성 facing 이 플레이어 반대쪽이면 원본에서도 B02 900틱 안에 d≤500 에 도달하지 못해 idle 900 이 된다.
- 실패 회차(facing 4.0968rad=234.7°): 원본 VM oracle 도 idle 900·min_d 1213.8(당시 Godot 1161.6, 차이는 원인 2). 실행마다 결과가 달랐던 것은 보스 생성 전 RNG 소비 횟수(비동기 부팅 프레임 수)가 달라 facing 이 달라졌기 때문이다. 하드웨어 문제 아님.
- 원본 sweep(facing 72분할, 다른 단위 고정): 첫 패턴 B02 421~1926틱, **72개 중 45개는 900틱 안에 성립 불가**(`_out/pc-boss-chase/logs/sweep72_rect.json`, `sweep72_source.json` — 원본 원형 아레나도 같은 값).

### 1-2. 원인 2 — 이식 차이(수정)

| 항목 | 원본 | 수정 전 Godot | 수정 |
|---|---|---|---|
| 보스방 `_ffDir` | 31849 `_ffBuild`: 매 프레임(32154) 플레이어 칸에서 8방향 BFS, 칸 방향 = DX/DY 순서 첫 "더 작은 거리" 이웃의 단위벡터(대각 1/√2), 거리 0 칸만 (P−칸중심) 정규화 | `world.get_path_direction` arena 분기 = LOS 면 플레이어 직선 방향 | PC 신규 `godot/scripts/native_demo11_arena_flow.gd`(원본 BFS·_ffDir) + `world.gd` 최소 훅 `bind_native_arena_flow`·arena 분기 1줄(Mac 파일, 로직 변경 없음) + `native_demo11_boss_core.gd` adopt_spawn 에서 바인딩 |
| 효과 | 실패 facing 에서 보스가 x −486 까지 흘러감 | x −297 (1180틱 최대 204px 차이) | 수정 뒤 원본과 최대 5.0e-4px(2140틱) |

- **원인 3(이식 차이, 수정)**: 원본 `_ffBuild`는 워커(31749–31796)로 비동기다. `_enterBossArena` 직후 첫 보스 틱의 `_ffDir`는 아직 필드 맵 결과(`_ffW`=200)를 보스 칸 (64,54) 인덱스로 읽어 (0,−1) 로 접근한다(y −2.875px). 실제 웹 실측 1틱. Godot 은 같은 프레임에 MAP11 필드 흐름(`world._web_parity_flow`, 직전 필드 BFS)을 같은 칸 인덱스로 읽게 했다(`arm_stale_first_frame`, 첫 조회 프레임 한 번). 이 1틱 차이가 없으면 칸 경계 통과 시점이 어긋나 1645틱 뒤부터 최대 22px·첫 패턴 7틱 차이가 났다(실패 facing).
- 지형: 사용자 결정 M10(PARITY_BOSS_01) 사각 124×104 = 웹 런타임 export `assets/boss_parity/arena.json` map. 원점 = provider 보스 마커 − (64.5, 54.5)×40.
- 남은 차이(기록): 원본은 프레임 앞(플레이어 이동 전) 위치로 BFS, Godot 은 보스 틱 조회 때 현재 위치로 준비 → 플레이어가 그 프레임에 칸 경계를 넘으면 1프레임 앞선 칸을 쓴다. 정지 장면은 같음.

### 1-3. 시험 교정(약화 아님)

- `test_pc_boss_parity` B02: 900틱 창을 **사거리 진입(d≤500) 시점부터** 센다(최대 2400틱 대기). 기존 단정(body_push>0·겹침 정지<60·공격 상태 3종·idle<700) 유지. 신규 단정 4개: 아레나 BFS 바인딩, 사거리 도달, **같은 생성 단위로 원본 VM 궤적 틱별 대조(위치 <0.05px·상태 불일치 0)**, 첫 패턴 틱 일치.
- `test_pc_boss_core` A1: 진입 300틱(사거리 밖)은 원본도 어떤 facing 이든 idle 만 나온다 → A1 은 `A1_no_pattern_before_range_source_38387`(사거리 밖이면 idle 만)을 단정하고, 기존 `boss_pattern_states`(≥3)는 A2 실제 교전 상태까지 합쳐 센다. (INTEG-12/12b 에서 "idle300/boss_pattern_states 실패, PC 원인 미확정"으로 남아 있던 항목)
- boss_core prefix/states/death oracle 3종: 고정 스냅샷 갱신(91e2774b7, 16156–16157 2줄 삽입) 뒤 줄 앵커가 맞지 않아 실행 전에 멈추던 상태(기준판 `291b7edb2`에서도 같은 실패) → `pc_move_skills_source_oracle.cjs`와 같은 SHIFT 매핑(이전 좌표 유지, 읽을 때 +2)만 추가. 판정 로직 변경 0.

### 1-4. 실제 웹 나란히 대조(완료 판정)

- 웹: `G:/exoduser` main `PORT=3393 EXODUSER_SAVE_DIR=_out/pc-boss-chase/websave node server.cjs`, Playwright 헤드리스 Chrome·`--mute-audio`, 격리 프로필(`_out/pc-boss-chase/pw_profile_web`, pc-boss-parity 프로필 사본). 문 접촉 → 원본 로딩 상태 머신 → `_enterBossArena` 직후 보스 생성 RNG 6필드만 Godot 실행과 같은 값으로 맞춤(fixture), P.hp·P.iframes 유지(Godot `_keep_alive` 와 같은 생존 fixture), 보스 `updateE` 호출마다 위치·상태 기록. 도구 `_out/pc-boss-chase/tools/web_chase.cjs`·`cmp_web.py`. 끝난 뒤 내 서버(PID 10492)만 종료.
- 결과(facing 37.0°, `logs/web_chase_bp4.json` ↔ `art/bp4/chase_godot.json`): **869틱 틱별 위치 차 최대 3.2e-10px, 상태 불일치 0, 첫 패턴 틱 같음(868), sp 1 고정**.
- 실패 facing(234.7°): 웹 ↔ 원본 oracle(첫 틱 (0,−1) 공급) 2147틱 **0.0px**. 웹 ↔ 수정 전 Godot 은 첫 틱 2.875px 뒤 1645틱부터 갈라짐(원인 3). 수정 뒤 Godot 의 이 facing 실행은 시험 RNG 로 다시 나오지 않아 웹과 직접 짝짓지 못했다(Godot↔oracle·웹↔oracle 의 두 대조로 연결).
- 화면 캡처 격자: 미실행(이번 항목은 위치·상태 시계열 대조로 판정. Godot 실행은 모두 headless).

## 2. oracle 결과

| oracle | 방법 | 결과 |
|---|---|---|
| `godot/tests/pc_boss_chase_oracle.cjs` (신규) | 원문 genBossArena·mkEn·updateE(38586–41410 전체)·_bossIdleMove·_bossAI·_ffBuild/_ffDir·적 루프 34396–34551·몸통 충돌 34351·checkRooms 로딩 41786–41816 을 줄 번호 그대로 VM 실행. 첫 `_bossStartPattern` 호출에서 멈춤 | 실패 facing: Godot 과 틱별 최대 5.0e-4px(2140틱), 첫 패턴 2141틱 같음, 상태 불일치 0. 다른 facing: 7e-11px(777틱), 첫 패턴 778틱 같음 |
| 같은 oracle `--sweep=72` | facing 만 72분할(첫 틱 지연 미공급) | 첫 패턴 421~1926틱, 45/72 는 900틱 창 성립 불가 |
| 같은 oracle `--stale-first-dir` | 진입 첫 틱 `_ffDir` 를 Godot 이 쓴 값으로 공급(워커 지연) | 실제 웹과 2147틱 0.0px, 최종 Godot(44/0 실행)과 868틱 최대 5.0e-4px |
| 같은 oracle `--scene=melee` (A-02) | etype 0·4 정예 아님 1마리 접촉 거리, 3600틱 | 첫 타 43틱, 간격 40~59틱 평균 49.28(N=144) |
| `godot/tests/pc_drop_oracle.cjs` (신규, C-06) | rollDrop 32004·mkItem·rollAffixes·mkBonePart 45790·mkSocketStone 15346 등 acorn 원문 추출, 같은 RNG 단위 주입 | 200사례×2모드 Godot `roll_drop` 과 0불일치 |
| `pc_move_skills_source_oracle.cjs` (기존, K-13 시나리오 추가) | 같은 shQuery·벽 공급 원본 궤적 대조 | `chain_hold_enemy_k13` 포함 oracle_compare 192/0 |

## 3. 미확인 3건 판정

| No. | 같은 조건 | 웹(원본) | Godot | 판정 |
|---|---|---|---|---|
| C-06 드랍 | 같은 RNG 단위 주입, 일반 160 + 정예 40, 데모/정식 | 원본 VM | 0불일치(소비 횟수·아이템 전 필드·결정·소켓석·유골), 장비 드랍 117/200 | **수정**: 단일 처치 차이는 확률(.45). 다만 처치 드랍이 데모 정책을 안 넘겨 `rollAffixes` 15137 데모 금지 7종 필터가 꺼져 있었다(원본 `_DEMO_MODE` 기본 demo 16648; 200사례 중 4사례가 모드에 따라 달라짐) → `native_normal_enemy_hurte.gd` 43110 `dropper.demo_mode = 정책 demo` |
| A-02 공격 주기 | etype 0·4, 정예 아님 1마리, 중심거리 e.r+P.r−6, 정지 플레이어, 생성 단위 0.25 | 첫 타 43, 40~59 평균 49.28 | 첫 타 43, 40~59 평균 49.33(N=72), 반경·공격력 같음 | **같음**. 2차 차이는 장면이 달랐음(여러 적). Godot 측정 때 장비 자동 석궁(2초)이 측정 적을 쏘아 경직으로 주기가 섞여 시험에서만 끔 |
| K-13 Shift 사슬 | 정지 더미 +160px, 0.6초 홀드 | 700px | 700px, 경로 적 1회 타격, 재발사 없음, 원본 틱별 대조 0불일치 | **같음**. 2차 462~570px는 자연 적 배치(다른 장면) |

## 4. 일치율

- 36항목: 같음 26 · 수정 8 · 남음 2(S-03·S-04 → PC BOOT-01) · 미확인 0.
- 수정 반영 뒤 34/36 = **94%**(2차 83%), 수정 전 기준 26/36 = 72%(2차 67%).

## 5. 테스트

공통: 매 실행 직전 `godot/override.cfg`로 격리 userdir(테스트 상수 우선) 지정, 끝나면 `_out/pc-boss-chase/cfg/`로 이동. 모두 `--headless`(창 0). 최종 코드 기준 각 1회(2차 묶음, `_out/pc-boss-chase/regress_summary.txt`). 1차 묶음은 묵은 첫 프레임 이식 전 코드(`regress_summary_run1.txt`).

| 시험 | 결과(최종) | SCRIPT ERROR / ERROR | 비고 |
|---|---|---|---|
| test_pc_boss_parity (B02 교정) | **44/0** | 0/0 | 1차 묶음(첫 프레임 이식 전) 43/0, 이식 후 단독 44/0 |
| test_pc_boss_core | 20/1 → 재실행 **29/0** | 0/0 | 실패 `player_alive_before_B`(A2 실제 교전에서 보스 돌진 1타 사망). **기준 제품 코드(291b7edb2)에서도 3회 중 1회 같은 실패** — 간헐, 이번 변경 원인 아님 |
| oracle prefix / states / death | **25,650/0 · 30,833/0 · 73,251/0** | 0/0 | 스냅샷 줄 이동 매핑 뒤(이전 0 실행·oracle_exit) |
| test_pc_combat_kill | **47/0** | 0/0 | |
| test_pc_combat_pack_b / _mac | **378/0 · 404/0** | 0/0 | _mac 단정 수는 실행마다 다름(1차 443/0) |
| test_pc_followups_fieldboss | **168/0** | 0/0 | |
| test_fieldboss_unify | 14/3 | 0/0 | 기존 잔여(INTEG-14 기록 14/3, Mac fixture provider). 변경 무관 |
| test_pc_move_skills (K-13 추가) | **271/0** | 0/0 | 이전 단독 1회 `render_pose blade_dash_squash_idle_frames` 1실패(2차 문서 기록된 간헐) → 묶음 2회 271/0 |
| test_pc_skill_writers | **80/0** | 0/0 | |
| test_pc_player_life | **101/0** | 0/0 | 1차 묶음은 산출물 폴더 미생성으로 저장 단계 SCRIPT ERROR 정지(하니스) → 폴더 만든 뒤 101/0 |
| test_pc_final_death | **60/0** | 0/0 | 1차 61/0 |
| test_pc_enemy_revive | **51/0** | 0/0 | |
| test_pc_drop_rng_parity (신규) | **7/0** | 0/0 | 200사례×2모드 0불일치 |
| test_pc_enemy_attack_cycle (신규) | **15/0** | 0/0 | |
| E2E test_demo11_47h_e2e (storage on, `EXODUSER-demo11-pc-boss-chase-Isolated-20261022`) | 10 PASS/7 NR/1 FAIL → 재실행 **13 PASS/5 NOT_READY/0 FAIL** | 0/0 | 첫 회: 필드 자연 전투 중 플레이어 쓰러짐 → level_up NR·save_handoff FAIL. 재실행은 기존 기록(INTEG-15b 13/5/0)과 같음 |
| (추가, 첫 프레임 이식 전 코드) test_p1002e / f / g, test_demo11_21_drop_inventory | 94/0 · 358/0 · 221/0 · 24/0 | 0/0 | 처치 드랍 경로 영향 확인(이후 바뀐 것은 보스방 첫 프레임뿐) |
| (추가) test_p2001c_kill_rewards | 25/1 | 0/0 | `eye_mass_01 available`(fixture 적 부재, 처치 전 단계) — 드랍 코드 무관, 미조사 |

## 6. 변경 파일

| 파일 | 소유 | 내용 |
|---|---|---|
| `godot/scripts/native_demo11_arena_flow.gd`(신규) | PC | 보스방 원본 _ffBuild BFS·_ffDir, 진입 첫 프레임 필드 흐름 1회 |
| `godot/scripts/native_demo11_boss_core.gd` | PC | adopt_spawn 에서 arena flow 바인딩·snapshot.arena_flow |
| `godot/scripts/world.gd` | Mac 파일 — **최소 훅** | `_native_arena_flow` 변수, `bind_native_arena_flow()`, arena 분기 1줄(바인딩 있을 때만 위임, 없으면 기존 LOS 경로 그대로) |
| `godot/scripts/native_normal_enemy_hurte.gd` | PC | 처치 드랍 `demo_mode` 정책 입력 |
| `godot/tests/pc_boss_chase_oracle.cjs`·`pc_drop_oracle.cjs`(신규) | PC | 원본 VM oracle |
| `godot/tests/test_pc_drop_rng_parity.gd`·`test_pc_enemy_attack_cycle.gd`(신규) | PC | C-06·A-02 |
| `godot/tests/test_pc_boss_parity.gd`·`test_pc_boss_core.gd`·`test_pc_move_skills.gd` | PC | B02 창 교정+oracle 대조, A1 단정 원본화, K-13 시나리오 |
| `godot/tests/pc_boss_core_{prefix,states,death}_oracle.cjs` | PC | 스냅샷 줄 이동 매핑 |
| docs: 이 보고서, PARITY_FULL_SWEEP(3차), BOSS_BATTLE_SETTINGS(추적 원본 수치), HELL_DEMO_BUILD_NOTES(데모 금지 어픽스), CHANGELOG_SYNC | — | |

## 7. 미확인·한계

- 보스 패턴 시작 뒤(패턴 상태·투사체) 궤적은 이 oracle 범위 밖(BC06~BC10 원본 대조 시험 소관).
- 레어몹(etype 90~99) 처치 드랍의 dropTier: Godot 은 비보스에 0 을 넘기고 원본은 min(SI_TO_HELL+2,4)=2. 현재 1-1 Godot 에 레어몹 생성 경로가 없어 도달 불가 — 기록만.
- boss_core A1 은 진입 300틱(사거리 밖) 동안 "idle 만"을 원본 의미로 단정하고, 패턴 상태 수(≥3)는 A2 실제 교전까지 합쳐 센다(원본 38387). 처음 시도한 "A1 창을 사거리 진입 뒤로 미루기"는 A2 시작 배치가 바뀌어 B 전 사망이 잦아 되돌렸다(`logs/boss_core_attempt1.diff`).
- `world.gd`(Mac 파일) 최소 훅 검토 요청.

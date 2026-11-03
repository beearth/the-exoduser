# PC-BOSS-PARITY — 1-1 필드보스·보스방 진입·보스전 웹 동일화 (2026-10-22, PC Claude)

2026-10-22 후속 테스트 교정: [TEST-FIX-01](../../TEST_FIX_01_20261022.md). 아래 수치는 각 원보고 시점의 기록이다.

- worktree `G:\exoduser-wt\pc-boss-parity`, branch `claude/pc-boss-parity-20261022`
- 기준 INTEG-10 `9133e2782` + `origin/claude/pc-boss-core-20261022`(`16e1ff825`) `--no-ff` 병합 `40bd95125`(충돌 0)
- 기준 문서 [PARITY_DIFF_LIST_20261022](../../PARITY_DIFF_LIST_20261022.md) B-01·B-02·E-01(+K-02), 계약 [PC_BOSS_CORE_CONTRACT_20261022 §7·§9](../../PC_BOSS_CORE_CONTRACT_20261022.md)
- 원본 대조는 고정 스냅샷 `godot/source_snapshot/game.html`(4d911cdd)만. 웹 캡처는 G:/exoduser main 작업 사본(game.html 바이트 동일)
- 사용자 결정: 카메라 줌 ×2.5·보스 공간 축소 S=0.4 **폐기**. 웹 카메라·원본 수치 그대로

## 1. 커밋

| SHA | 내용 |
|---|---|
| `40bd95125` | pc-boss-core WIP(16e1ff825) 병합(`--no-ff`, 충돌 0) |
| `5f16e0228` | S·×2.5 삭제(코드·테스트·캡처 도구) + 계약 §7·BOSS_BATTLE_SETTINGS |
| `dc1e3614c` | E-01 앵글러 PC interaction·근접 타격 + B-01 진입 흐름(로딩 상태 머신·오버레이·진입 부수효과) + test_pc_boss_parity |
| `2bae30bfc` | B-02 보스 몸통 충돌·사망 actor 동기화·진입 시 소환굴 비움 + 캡처 스크립트 |
| `f15baf5ab` | 원본 행 번호 주석 정정 |
| (이 커밋) | 문서: 계약 §8·§9, BOSS_BATTLE_SETTINGS, PARITY_DIFF_LIST 상태, 이 보고서, CHANGELOG_SYNC |

- 병합 주의: `docs/engine/PARITY_DIFF_LIST_20261022.md` 는 INTEG-10 기준에 없어서 `origin/main`(531314687 판)을 그대로 가져와 B-01·B-02·E-01·K-02 행과 §3-0 만 덧붙였다. main 에 병합하면 양쪽 신규 추가(add/add)로 표시될 수 있다 — 이 판(main 내용 + 상태 갱신)을 택하면 된다.
- 웹 캡처 스크립트는 저장소 밖 `G:/exoduser-wt/_out/pc-boss-parity/scripts/web_boss_capture.cjs`(격자 생성 `make_boss_compares.py`, `sheet.py`).

## 2. 항목별 결과

| 항목 | 상태 | 원인 | 조치(원본 행) |
|---|---|---|---|
| S·×2.5 폐기 | 완료 | 사용자 재결정 | `native_boss_space.gd`·core 경계 변환·`test_pc_boss_core_space.gd`·`capture_pc_boss_core.gd`(×2.5 미리보기) 삭제. 삭제 전에도 제품 effective S=1 이라 동작 동일. 원본 VM oracle 0실패 재확인 |
| B-01 보스방 진입 | PC 로직 완료 | 자연 경로(MAP11 문 transport)는 원래 `OPT.diff`·`G._stageDiffOff`·room 0 을 넣는다. parity 의 `integer_input_required` 는 하니스가 `encounter.enter(provider,{})`를 직접 부른 결과. 실제로 빠져 있던 것은 원본 로딩 상태 머신·문 판정 cadence·진입 부수효과 | `native_demo11_boss_entry.gd`(신규): checkRooms 41768–41925 + `_enterBossArena` 30749–30813 PC 부분 + 로딩 오버레이 52089–52122. 단계 실측 50/130/50/100틱 |
| E-01 필드보스 | PC 로직 완료 | 앵글러 몸 충돌·착지 강타 PC interaction 미바인딩 → 근접 시 개체 정지(`PC_body_or_slam_owner_required`). 근접 무기 → 앵글러 경로(37646) 없음 → 일반 근접 플레이로 처치 불가 | `native_field_mob_hit_owner.gd`: 부팅 때 readback+interaction 바인딩(61085–61086, 61119–61122), telemetry `melee_contact_resolved` → `_hurtFieldMobs`(37646). 4처치 → `_fbDone` 실측 |
| B-02 보스 패턴 | 동작 완료(소환 NOT_READY) | 보스 몸통 충돌(34348–34349) 미이식 → 보스가 플레이어 위로 겹쳐 d<20 → `_bossAI` 38385 패턴 시작 차단(idle 91%) | core `_push_player_out_of_body`. 이식 후 idle 41%(웹 31~40%). 패턴 slam·charge·spin·burst·shock·grab 등 관측 |
| 사망 표시 | 완료 | hurtE 최종 사망 뒤 actor 스냅샷 미동기화 → 죽은 보스·HP 바가 계속 그려짐 | core `_dead_sync_pending` → 첫 사망 틱 `_push_actor_sync` |
| K-02 클리어 진입 | 자연 경로 완료 | — | 출구 30호출 cadence → encounter.leave → `native_demo_boss_defeated(0)` |
| 소환체 mkEn | **NOT_READY** | etype 3 actor 없음(추첨 60%), mkEn 엘리트/모드/오라 롤 미이식, 기존 생성기는 소환굴 전용 | 계약 §9.5 |
| test_demo11_boss_actor | Mac 요청 | `--map11=off` 전제 테스트. off 로 돌려도 PC 코어가 owner 를 먼저 잡아 fixture 와 충돌 | 25행 다음 `main.set_meta("native_pc_boss_core","off")` 1줄. 임시 사본 확인 167/0 |

## 3. 나란히 캡처 (완료 판정)

- 웹: `PORT=3399 EXODUSER_SAVE_DIR=_out/pc-boss-parity/websave node server.cjs`(G:/exoduser main), Playwright 헤드리스 Chrome·음소거·격리 프로필(parity 프로필 사본), 1920×1080. 스크립트 `G:/exoduser-wt/_out/pc-boss-parity/scripts/web_boss_capture.cjs`
- Godot: 창 모드 `--audio-driver Dummy --resolution 1920x1080 --position 0,0`, 창 1개. `godot/tests/capture_pc_boss_parity.gd`
- 격자: `G:/exoduser-wt/_out/pc-boss-parity/compare_*.png`(왼쪽 웹·오른쪽 Godot, 0.5배; `_1x` 는 원크기 크롭)
- **콘솔 훅(웹)·fixture(Godot) 기록**: 레슨 skipAll / 플레이어 무적 유지(웹 `P.hp=P.mhp;P.iframes≥60` 50ms 간격, Godot `iframes≥60·hp=max`) / 순간이동(앵글러 마커0 +520,−80, 문 +260, 보스 +380 — Godot 은 그 점이 아레나 밖이면 아레나 중심 쪽 380) / `G._fbDone=true`·지역 4곳 cleared(웹은 그 뒤 30틱 자연 개방, Godot 은 NativeRegions 1회 실행) / 보스 HP·쉴드·부활력·reviveIframes·_bossPhase 낮춤(부활·사망 장면). 보스 패턴·로딩 상태는 주입하지 않고 자연 발생을 기다려 **상태 이름으로 짝지었다**
- 웹 플레이어 레벨 2(프로필 진행 저장), Godot 레벨 1 → 보스 HP 33,332 vs 21,017(원본 식은 같음, P.lv 차이)

| 격자 | 판정 | 같은 점 | 다른 점(담당) |
|---|---|---|---|
| compare_09a_fieldboss | 동작 같음 · 표시 다름 | 앵글러가 깨어나 마커에 서 있고 펫 대사도 같다 | 웹은 이름 "심연의 앵글러"+파란 HP 바, Godot 없음(Mac 뷰). 맵·카메라 줌(0.7 vs 1.0)·크기 차이(Mac) |
| compare_10_gate | 동작 같음 · 표시 다름 | 개방 직후 헥터 대사 같음 | 문 오브젝트(웹 눈나무 문 vs Godot 제단·기둥) 다름(Mac 맵) |
| compare_10a_entry_namecard / _1x | **거의 같음** | 장식선 2줄·다이아·이름 위치(53%)·부제 "썩은 숲 1구역"(64%)·보스 HP 바 노출·HUD 위 배치 | 웹은 후처리(그레이딩) 때문에 검정이 남색, 이름이 더 어둡다. Godot 은 순검정(Mac 후처리 체인) |
| compare_10a_entry_intro | 동작 같음 · 표시 다름 | 페이드인 직후 보스 경직·헥터 "무릎 꿇었다." | 웹은 씨앗 폭탄 탄막이 바로 보이고 보스는 화면 밖(아레나가 큼, 입구–보스 약 1960px). Godot 은 입구–보스 800px라 보스가 화면 안. 아레나 크기·바닥(Mac 맵) |
| compare_10d_boss_close | 표시 다름 | 보스 크기(화면 높이 약 300~330px)·위치·HP 바 | 웹 사슴뿔 드루이드 애니 프레임 vs Godot 8방향 정지 시트. 웹 HP 바 아래 쉴드 막대+"면역 Xs" vs Godot 숫자 "21017/21017"(Mac HUD) |
| compare_10e_slam / charge / spin | 동작 같음 · 표시 다름 | 같은 패턴 상태가 같은 시점(예고 20프레임)에 나온다 | 웹 텔레그래프 녹색 덩굴·밝은 효과 vs Godot 주황 원(Mac 텔레그래프). Godot 아레나 화면에 가로 띠 경계가 보인다(Mac 렌더) |
| compare_10f_boss_hit | 동작 같음 | 근접 타격 피해 숫자가 보스 위에 뜬다 | 숫자 글꼴·색(Mac) |
| compare_10g_revive_0/1 | 동작 같음 · 표시 다름 | 1차 즉시 부활(HP 100%) | 웹 이름 옆 "[⚠ 1 차 부활]" 표기·부활 연출 VFX, Godot 없음(Mac HUD / VFX 미이식) |
| compare_11c_killed | **같음** | 보스가 사라지고 HP 바가 없어진다(수정 후), 헥터 "…끝났다. 다음으로." | Godot 에 죽은 보스의 주황 예고 원이 남아 있다(Mac 텔레그래프가 사망 상태를 보지 않음) |
| compare_11c_exit_view | 표시 다름 | 출구 쪽 이동 | 아레나 출구 지형(Mac 맵) |
| compare_11d_clear | 동작 같음 · 표시 다름 | 출구 밟은 뒤 클리어 | 웹 결과 카드(랭크·점수) vs Godot 단독 패널(K-01, Mac) |

**완료 판정**: PC 로직(진입 흐름·필드보스·패턴 진행·피해·부활·사망·출구)은 웹과 같은 순서·같은 수치로 동작한다. **화면은 아직 같은 게임처럼 보이지 않는다** — 남은 차이는 모두 Mac 표시(맵·보스 스프라이트·텔레그래프·HUD·후처리)다. 그래서 B-02 는 "동작 완료·표시 미완"으로 둔다.

## 4. 원본 행

| 영역 | 원본 행(스냅샷 4d911cdd) |
|---|---|
| 앵글러 상수·출생 | 60974–60978(_FB_COUNT/_FB_WAKE 1000/_FB_SITES/_FB_ELS/_FB_EN_CHG 180), 60985 `_fbHp`, 61047–61066 `_fbTick` |
| 앵글러 깨어남·몸 충돌·강타 | 61069–61076, 61083–61087, 61117–61123 |
| 앵글러 처치 | 18699–18711 `_fmApply`, 18677–18697 `_fmDeathFx`, 61036–61042 `_fbMarkDead`, 18733–18756 `_hurtFieldMobs`, 37646(hitArc 끝) |
| 지옥문 개방 | 41868–41891(`_krakenOk`·지역 4곳) |
| checkRooms | 41768(정의), 35635·43115(호출), 41784–41813(로딩), 41816–41818(_crT), 41893–41925(문), 41919~(아레나 출구) |
| _enterBossArena | 30749–30813(30758–30760 잔여 적·ens, 30761 hitStop/slowMo, 30771 spawnHoles/rifts, 30780 P 상태, 30782 보스 mkEn, 30797 _crT, 30798 펫, 30805–30813 봉인 연출) |
| 보스 mkEn | 31120–31185(31124 canMv/safePt, 31145 HP 곡선) |
| 로딩 오버레이 | 52089–52122 |
| hurtP 로딩 무적 | 43420 |
| 보스 몸통 충돌 | 34348–34349 |
| _bossIdleMove / _bossAI | 38315–38372 / 38373–38440(38385 `d>500||d<20` return) |
| idle 공통 이동 | 40455–40484 |
| 소환 | 40798–40814, 37723 |

## 5. 테스트

공통: 매 실행 직전 `godot/override.cfg`로 격리 userdir 지정(테스트 상수 우선, 없으면 `EXODUSER-pc-boss-parity-Isolated-20261022`), 종료 후 `_out/pc-boss-parity/cfg/`로 이동. `NODE_PATH=G:/exoduser/node_modules`(junction 0). 원본은 `--source-game=godot/source_snapshot/game.html`. 로그 `G:/exoduser-wt/_out/pc-boss-parity/regress/`. 각 1회(아래 "재실행" 표기 제외).

| 테스트 | 결과 | SCRIPT ERROR |
|---|---|---|
| test_pc_boss_parity(신규) | **37/0** | 0 |
| test_pc_boss_core | 28/0 | 0 |
| oracle prefix / states / death | 25,650/0 · 30,833/0 · 73,251/0 | 0 |
| test_demo11_boss_projectiles / projectile_auto / coordinates / draw | 29/0 · 14/0 · 4/0 · 6/0 | 0 |
| test_boss_ch1_bc09_projectiles | 56,664/0 | 0 |
| test_pc_combat_pack_b / _mac | 378/0 · 396/0 | 0 |
| test_pc_followups_fieldboss | 167/0 | 0 |
| test_pc_final_death / enemy_revive / player_life | 60/0 · 51/0 · 101/0 | 0 |
| test_pc_m29_parry | 101/0 | 0 |
| test_native_qe_binding | 0실패(그룹별) | 0 |
| test_p1002e / f / g | 94/0 · 358/0 · 221/0 | 0 |
| test_pcib_mac_calls | 31/0 | 0 |
| test_demo11_etype15 / etype_b / etype_f | 151/0 · 42/0 · 33/0 | 0 |
| test_demo11_field_bgm_override(`--source-root`) | 18/0 | 0 |
| E2E `test_demo11_47h_e2e --demo11-storage=on` | 1차 PASS9/NR9/FAIL0, 2차 PASS11/NR7/FAIL0 | 0 |
| (참고) E2E 같은 날 변경 전(40bd95125 스크립트) | PASS11/NR7/FAIL0 | 0 |

- 하니스 사고(기록): 첫 묶음에서 projectile_auto·draw·pack_b_mac 은 부모 테스트에서 상속한 USERDIR 을 내 스크립트가 못 읽어 다른 이름으로 돌려 isolation 1실패·0단정 → 상속 USERDIR 로 재실행(위 표). test_pc_final_death 는 내가 artifacts 폴더를 만들지 않아 `store_string` null SCRIPT ERROR 후 1500초 timeout → 폴더 생성 후 재실행 60/0. 테스트 코드 문제 아님.
- E2E: 1차의 item_pickup·equip NR 은 플레이어가 enemy_kill 단계 전에 사망해서 생긴 연쇄였고, 2차·변경 전 실행은 같은 PASS11/NR7. INTEG-9 기록(PASS13/NR5)과의 차이는 enemy_kill·auto_potion(같은 날 변경 전에도 NR) — 이 PC 실행 환경 변동으로 본다(미확정).
- E2E 보스 NR(bossroom_gate·boss_defeat_signal·clear)은 **그대로 NR**. 하니스가 앵글러·지역 미처리 상태로 문에 순간이동해 `request_native_map11_transition("enter")`를 한 번 부르고 1틱 뒤 판정한다. 원본도 이 상태면 문이 봉인이고, 열린 경우에도 로딩 230틱 뒤에 아레나로 들어간다(Mac 요청 M13).
- `test_demo11_boss_actor` 는 Mac 요청 M4(그대로 실행하면 멈춤).

## 6. 성능

`godot/tests/bench_pc_boss_core_room600.gd`(헤드리스, physics 120Hz, 아레나 입장 60틱 예열 뒤 600 물리 프레임 벽시계). 변경 전 = `40bd95125` 스크립트를 같은 worktree 에 임시로 되돌려 측정(측정 뒤 HEAD 로 복원, 커밋 0).

| 조건 | mode=on mean / p50 / p95 / max (ms) | mode=off(코어 제거) mean / p95 |
|---|---|---|
| 변경 전 | 9.17 / 9.10 / 13.55 / 18.25 | 8.34 / 10.75 |
| 변경 후 1차(**다른 세션 Godot 2개 동시 실행 중** — verify-map01) | 10.02 / 9.66 / 14.59 / 18.91 | 8.32 / 10.96 |
| 변경 후 2차(동시 Godot 0) | 10.41 / 10.06 / 15.19 / 21.20 | — |
| 변경 후 3차(동시 Godot 0) | 9.03 / 8.64 / 13.24 / 31.22 | — |

- 동시 프로세스(측정 시점): chrome 21·node 14~15(웹 서버 포함)·python 2, 변경 후 1차만 다른 세션 Godot 2. 기록 `_out/pc-boss-parity/bench_procs_*.txt`.
- 판정: 변경 후 mean 9.03~10.41 은 변경 전 9.17 과 회차 변동 폭 안이다. 추가된 틱 비용은 몸통 충돌 거리 계산 1회·사망 동기화 1회뿐이다. 8.33ms 목표는 변경 전후 모두 미달(기존 상태).

## 7. Mac 요청 (최소 훅 0)

이번 작업에서 Mac 소유 파일 수정은 0이다(병합으로 들어온 pc-boss-core 의 기존 최소 훅 `native_demo11_boss_actor.gd` +5·`native_demo11_boss_projectiles.gd` +2 는 그대로).

| ID | 파일 | 요청 |
|---|---|---|
| M4 | `tests/test_demo11_boss_actor.gd` | 25행 `main = MAIN.new()` 다음 `main.set_meta("native_pc_boss_core","off")`. `--map11=off`로 실행(머리 주석). PC 임시 사본 167/0 |
| M5 | `native_demo11_angler_view.gd` | 원본 `_fbDrawOne` 61156–61186: tpT 동안 소멸/상승 프레임, 이름 "심연의 앵글러"·원소색 HP 바(220×10), 아이들 흔들림 |
| M6 | `native_demo11_anglers.gd`·angler model | interaction `source_line` 61082/61121 → 실제 원본 61085–61086 / 61119–61122(값만, 동작 영향 없음) |
| M7 | `boss11_visual_reader.gd` | 보스 `alive=false` 이면 상태 예고를 그리지 않기(사망 뒤 slam 원이 남음). 예고 색·재질을 원본(녹색 덩굴 링 등)으로 |
| M8 | `boss11_scene_actor.gd` | 원본 1-1 드루이드 렌더(`_CODEX_BOSS[3]` 애니 프레임 walk/attack 4×8·idle 8dir 4×2, dw 9.3·dh 14.1) |
| M9 | 보스 HP 바(HUD) | 원본처럼 쉴드 막대·"면역 Xs"·부활 표기 "[⚠ N 차 부활]" |
| M10 | MAP11 아레나 | 원본 `genBossArena(0)`: 사각 방 124×104타일, 보스 방 중심·입구 남쪽 끝(약 1960px), 어두운 흙 바닥. 아레나 화면 가로 띠 경계 |
| M11 | 보스 투사체 표시 | 씨앗 폭탄(bossBeanStorm) 녹색 큰 구체·덩굴 꼬리(웹) vs 작은 점(Godot) |
| M12 | 후처리 | 로딩 오버레이 아래 그레이딩(웹 남색 톤) — PARITY §2-1 후처리 체인과 같은 일 |
| M13 | `tests/test_demo11_47h_e2e.gd` bossroom_gate | 문 진입은 이제 원본처럼 `_fbDone`·지역 개방 + 30호출 cadence + 로딩 230틱 뒤 전환. 단계가 앵글러/지역을 실제로 처리(또는 기록된 fixture)하고 로딩 끝까지 기다려야 PASS 가능 |

## 8. 미확인·미이식

- 사용자 실제 실행(창·run.cmd)에서 진입 흐름을 사람이 플레이해 본 것은 아니다. 캡처는 하니스 fixture(무적·순간이동·HP 낮춤) 포함.
- Mac 실행본: 미확인(PC 에서만 실행).
- 사운드: 양쪽 음소거. SFX(groggy·포효·detonate 등) 미이식.
- 로딩 중 `P.s='idle';P.st2=0` 매 틱 강제(41785): 플레이어 상태 owner(player.gd, PC 이동 담당) 소관이라 미이식. 원본도 이동 입력은 막지 않는다.
- 스킬 경로(기검참 19844·돌진 33971·지옥강타 46566)의 `_hurtFieldMobs` 미연결.
- 근접 37646 경로의 RNG 순서 차이(§2 E-01 행).
- 웹 캡처의 플레이어 레벨 2 vs Godot 1 — 보스 HP 수치 비교는 같은 레벨에서 하지 않았다(식은 oracle 로 확인).
- 이전 E2E 실패 1회(arena 진입 직후 일반 적 1마리 잔존)는 재현하지 못했다. 원인 후보(발동 중 소환굴 지연 소환)를 원본 30771 대로 막았고 이후 3회 0마리.

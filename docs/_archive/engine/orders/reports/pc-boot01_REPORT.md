# PC-BOOT01 — 필드 진입 다중 프레임화 + Esc 일시정지 키 상태 보고

2026-10-22~23 KST, PC Claude. 기준 `bdc8ba4a1`(claude/pc-input-parity-20261022), 브랜치 `claude/pc-boot01-20261022`, worktree `G:/exoduser-wt/pc-skill-writers`(재사용, 새 worktree 없음). main 미병합.
상세 설계·계측: [BOOT01_MULTI_FRAME_STARTUP_20261022.md](../../BOOT01_MULTI_FRAME_STARTUP_20261022.md). 로그·도구·캡처: `G:/exoduser-wt/_out/pc-boot01/`.

## 1. 판정
- 진입 경로 최대 엔진 반복: **전 7,593~8,025 ms → 후 170~280 ms**(목표 500 ms 이하 충족, 3회 이상 반복 측정).
- Space 홀드 진입 키 버퍼 넘침: **0회 ×4**(hold_fix1~3, final_hold1).
- 영상 건너뛰기 → Main 전환: 12.8~15.5 s → 3.0~5.0 s.
- 진입 뒤 상태(같은 시드): 위치·HP/MP/ST·스테이지·인트로·레슨 시작·적 5마리 위치 **동일**(소수점 회복·이동 잡음만).
- Esc 일시정지: 누른 채 멈춤 → 누른 채 해제 시 전 0 px / 후 155.6 px(웹처럼 계속 걸음).
- 진입 화면: 검은 화면 → 웹 부트 로딩 화면(같은 이미지·문구·막대·팁). 나란히 비교 §5.
- 회귀: PC·전투·HUD·E2E 0실패. Mac 로비·인트로 테스트 일부 실패는 **기준판에서도 같은 지점·같은 수로 실패**(§4).

## 2. 분할 내용 요약
| 무거운 일(전) | 처리 |
|---|---|
| 첫 메시지 큐 onload 픽셀 처리 6.7 s(사용자 말 "첫 `_process` 5.8 s") | 루프를 world 정적 함수로 옮기고 로비 동안 워커 스레드에서 미리 계산 → 진입 중엔 결과만 사용 |
| world 로드·`_bind_native_startup_services`·소품·HUD 리소스 load 980개 | 로비 동안 백그라운드 예열(목록 manifest, 동시 4개) → 진입 중 load는 캐시 |
| 드랍 빔 마스크 0.6~0.8 s, 인트로 컷 디코드 0.6~0.7 s | 같은 함수로 워커 예열 |
| Main `_ready` 나머지 0.75~1.2 s | 원래 순서 그대로 11개 지점에서 프레임 양보(로비 진입일 때만), 지점마다 2프레임(첫 그리기 분리) |
| 진입 중 틱·입력 | 단계 사이 프레임만 트리 정지 + Main 하위 콜백 끄기/복원, 진입 권한 직전에 해제 |

## 3. Esc 처리
원본 13184 Esc = `togglePanel('settings')`로 G.paused만, KH 유지(13214/13330 keydown/keyup은 정지 무관). → `main._toggle_pause`의 눌림 지우기 제거. 정지 중 뗀 이동·패링·무기·실드·마법 입력은 player 정지 추적기가 기록(뗌만, 누름은 이동만), 차지 중 뗀 무기는 해제 첫 틱에 발사(원본 16852). 포커스 상실 지우기(웹 blur)는 그대로.

| 경우 | 전 | 후 | 웹(코드 대조) |
|---|---|---|---|
| 누른 채 정지 → 정지 중 뗌 → 해제 | 0 px | 0 px | 멈춤 |
| 누른 채 정지 → 누른 채 해제 | 0 px | 155.6 px/1 s | 걸음 |
| 정지 중 누름 → 누른 채 해제 | 164.8 px | 155.6 px | 걸음 |

## 4. 테스트(각 1회, 헤드리스 기본·창 모드 표기)
| 테스트 | 결과 | 비고 |
|---|---|---|
| test_pc_boot01_prewarm(신규) | 90/0 | world 작업 40종·드랍 2장 예열 바이트 = 동기 경로 |
| test_pc_combat_kill | 47/0 | |
| test_pc_move_skills | 256/0 | |
| test_pc_combat_pack_b / _mac | 378/0 / 404/0 | |
| test_pc_m29_parry | 101/0 | 1차 실패(11)는 산출물 폴더 미생성으로 node 오라클이 못 씀 → 폴더 만든 뒤 재실행 0실패 |
| test_pc_player_life | 101/0 | 1차는 같은 폴더 원인으로 store_string null → 재실행 0실패 |
| test_pc_final_death / test_pc_enemy_revive | 61/0 / 51/0 | |
| test_native_qe_binding | 0실패 | |
| p1002e / f / g | 94/0 / 358/0 / 221/0 | |
| test_pc_followups_fieldboss | 168/0 | |
| test_pc_skill_writers | 80/0 | |
| test_pc_hud_stats | 199/0 | |
| test_p2006a_world_drops | 18/0 | 드랍 빔 예열 경로 영향 확인 |
| test_demo11_08_story_intro | 12/0 | 1차 실패는 앞서 중단된 내 실행이 격리 폴더에 남긴 저장 → 폴더 비우고 재실행 |
| test_parity_ui_01 / ui_05 | 7/0 / 15/0 | ui04 테스트 파일은 없음 |
| test_demo11_authority | 22/0(ERROR 1 = 기대 오류 `Native demo boot rejected`) | |
| test_p2001i_boot_intro | 0/0, 3그룹 skipped | 기준판도 동일 skipped |
| test_demo11_47h_e2e(storage on) | PASS 11 / NOT_READY 7 / FAIL 0 | PC-COMBAT-KILL 기록(11/7/0)과 같은 수 |
| e2e_parity_intro_01(storage on, Mac 하니스, HOME 지정) | FAIL "character entry" | **기준판도 같은 FAIL**(30 s, 같은 route) |
| test_demo11_07_lobby_entry(창) | 19/5, SCRIPT ERROR 23 | **기준판도 19/5·23**(locked character UI 4 + Main handoff, preload 실패) |
| test_demo11_04_lobby(창) | `crest` 노드 없음 SCRIPT ERROR 후 정지 | 기준판 로비에도 `crest` 없음(같은 오류) |
| test_demo11_09_pause(창) / 50_settings(창) | `menu.buttons.settings` 없음 SCRIPT ERROR | 기준판도 같은 줄 같은 오류(일시정지 메뉴 파일은 기준판과 동일) |
- 07/04/09/50의 기존 실패 때문에 그 뒤 단정들은 양쪽 모두 실행되지 않았다. 이 테스트들로는 로비 진입·일시정지 변경을 검증하지 못했고, 그 부분은 프로브(§1)로만 확인했다.
- 실행 도구 `_out/pc-boot01/tools/run_regress*.sh`, 요약 `_out/pc-boot01/regress_summary.txt`, 기준판 비교 로그 `regress/fix_*.log`(수정판)·같은 이름(기준판 마지막 실행).

## 5. 웹과 나란히
- 웹: 헤드리스 Chrome·음소거, 격리 저장 서버 3397, `_out/pc-boot01/web3/`. Godot: 엔진 내부 캡처 `_out/pc-boot01/probe/shots_final2/`.
- 비교 격자 `_out/pc-boot01/scratch/cmp_sheet2.png`(로딩 3장 + 진입 직후 인트로 2장), 하단 1x 크롭 `scratch/cmp_bottom.png`.
- 같은 로딩 이미지(12번)에서: 이미지 색 평균 차 ≤0.3/255, 문구 위치·글꼴·막대·팁 일치. 다른 점: ① 문구 그림자(웹 15px 흐림 → Godot 옅은 외곽 근사), ② 단계 문구가 바뀌는 시점(Godot 단계 대응), ③ 진입 직후 인트로가 Godot은 서서히 밝아지는 중에 찍힘(인트로 모듈 동작, 이번 범위 밖).
- 웹 진입(이야기 건너뛰기 → 인트로 컷신)은 이 PC 헤드리스에서 약 17초, Godot 수정판은 영상 건너뛰기 → Main 3~5초.

## 6. 미확인·남은 위험
- 앱 시작 첫 프레임 1.27~1.47 s(로비 `_ready`+로비 시네마틱 프레임 19장 동기 load) — 범위 밖, 미수정.
- 로비 체류가 아주 짧으면 만들기→영상 시작이 1/3회 529 ms.
- 로딩 이미지·인트로 컷은 원본 source root에서 읽음 — 내보내기 빌드 경로 미해결(인트로와 같은 항목).
- Mac 실기·저사양 PC 측정 없음. 웹 측 Esc 동작은 코드 대조만(실행 측정 안 함).
- 같은 시드 비교는 프로브 경로 1개(로비 → 새 캐릭터)만. 저장 이어하기 경로는 단계 부팅을 쓰지 않음(진입 메타가 새 게임 경로에만).
- 창 위치: 초기에 `--position 5120,0`으로 실행한 판(22:00~22:08, state_*_s2·winpos 시험)은 메인 모니터(Windows x=3200)에 떴다가 옮겨졌다. 이후 `--screen 1`(실측 L=5120) → 지시에 따라 `--position 7040,0`(실측 L=5120)으로 바꿨다. 22:49~22:55 사이 내 창 실행은 없음(그 시간대는 헤드리스 회귀). 내 테스트 스크립트·프로브는 창 위치를 바꾸지 않는다(50_settings는 전체화면 전환 시험을 포함).

## 7. Mac 파일 변경 목록
| 파일 | 변경 |
|---|---|
| godot/scripts/main.gd | `_ready` 본문 → `_native_ready_body`(이름만), 단계 양보 11곳, 게이트·로그 함수, `_toggle_pause` 눌림 지우기 제거 |
| godot/scripts/world.gd | onload 루프 → 정적 `native_source_onload_rgba`(본문 이동), 예열 결과 조회, 작업표·커널 정적 함수, `_native_source_object_edge_alpha` 정적화 |
| godot/scripts/native_demo_lobby_entry.gd | `launch`를 `_launch_begin`/`_launch_finish`로 나눔(동작 동일) + `launch_staged` |
| godot/scripts/native_demo_lobby_screen.gd | 예열 시작·대기, 검은 화면 → 로딩 화면, `launch_staged` 사용 |
| godot/scripts/native_world_drops.gd | `_mask_black` 정적화, 예열 작업표·커널·결과 사용 |
| godot/scripts/native_story_intro.gd | 예열 작업표·커널, 예열 텍스처 사용 |
| godot/scripts/parity_video_intro.gd | 정적 `frame_assets` 추가(동작 변경 없음) |
PC 파일: player.gd, 신규 native_boot_prewarm.gd·native_boot_frame.gd·native_boot_loading_screen.gd, data/native_boot_prewarm_manifest.json, tools/boot01_gen_prewarm_manifest.py, tests/test_pc_boot01_prewarm.gd. 문서: 이 보고서, BOOT01 문서, PC_INPUT_PARITY(해결 표시), CHANGELOG_SYNC.

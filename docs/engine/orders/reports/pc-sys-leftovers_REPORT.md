# pc-sys-leftovers 보고서 — SWEEP-B가 PC-SYS로 넘긴 6건 (2026-10-23, PC Claude)

- 브랜치 `claude/pc-sys-leftovers-20261023`(기준 065068322), worktree `G:/exoduser-wt/pc-hud-stats` 재사용(새 worktree 없음).
- 웹 기준: 커밋 846889174의 game.html(sha `dee094fd…`, Godot `source_snapshot/game.html`과 같음). 작업 사본에서 다른 웹 파일 26개는 Playwright route로 그 커밋 blob을 돌려줌. 서버 `PORT=3390 node server.cjs`(작업 끝에 종료).
- 관측 도구: `tools/parity/pc_sys_web.cjs`(웹, 헤드리스·음소거·1920×1080), `tools/parity/pc_sys_probe.gd`(Godot, 엔진 내부 viewport 캡처). 결과물 `G:/exoduser-wt/_out/pc-sys-leftovers/`(web/·caps/·cmp/·logs/).
- 상태 표: [PARITY_SWEEP_B_PC_20261022.md §4](../../PARITY_SWEEP_B_PC_20261022.md)

## 커밋

| SHA | 항목 |
|---|---|
| 855b2fde4 | SYS-2 쓰러짐 카운트다운·부활력 문구·오버레이 레이어 |
| ae7227df3 | SYS-1 update() 횟수 = 원본 PHYS_STEP 누산기 |
| ca3feaa9b | SYS-3 G._sStats 세션 통계 |
| 517940323 | SYS-5 판정(코드 변경 없음, 문서) |
| 352782398 | SYS-4 aiEnhance·_doAiEnhance + AI 영역 천 단위 쉼표 |
| ed2277deb | SYS-4 문서 줄바꿈 복구(2_7 문서 CRLF 혼재 원형) |
| 43f8d7ece | (추가 지시) INTEG-17 07 lobby_entry Main 대기 = 도착 또는 60초 |
| 066e4e5ee | SYS-6 스킬바 키 캡 패드·재바인딩 표기 |

## 항목별 원인·수정 (원본 행)

| 번호 | 원인 | 수정 | 웹 대비 |
|---|---|---|---|
| SYS-2 사망 | ① 부활 가능 판정 차이는 시작 팔찌 brType 무작위(G16108, 악마 50%면 `_iRevPow` 5~12) — 공식(G43738~43751)은 같음. ② 원본 update()는 fallen 중 `P.st2`를 틱마다 두 번 줄임(G32794 상태 무관 + G32991 case 'fallen') → 실제 2.5초. Godot은 1씩 줄여 5초. ③ 문구 G58932는 `_T` 없음·숫자는 JS Number#toString | `native_demo11_life.gd` 틱당 2 감소, 문구 원문+`js_number_string`, 쓰러짐 오버레이 레이어 9→4(웹은 drawP 뒤 후처리 화톳불 배리어가 패널 위) | 웹 sec 5→1 간격 약 500ms·dead 2506ms / Godot 헤드리스 2388ms·창 모드 약 2.5초(캡처 정지 구간 제외). 악마 팔찌 10.86 고정 시 웹 '부활력 10.86%' = Godot. fallen 1초·dead 화면 1x 비교판 `cmp/death/` |
| SYS-1 시계 | Godot update prefix가 렌더 콜백마다 1회(vsync 끔·max_fps 240) → G.stageTime 최대 4배. SWEEP-B 최종 캡처는 00:00이 아니라 00:08(웹 00:03) | 원본 loop 누산기 그대로: G61813·61822·61827~61829(0..50 클램프)·61836~61839(cap PHYS_STEP×5)·61878~61884, PHYS_STEP G60469 | 레슨 시작 stageTime 웹 34~35 / Godot 53~54, 건너뛴 뒤 초당 웹 60 / Godot 61(창 모드). fallen 1초 캡처에서 둘 다 00:03 |
| SYS-3 통계 | Godot G에 initStage 리터럴(G31571/G62284)이 없어 모든 `if(G._sStats)`가 거짓 | State가 리터럴을 두고 deaths(G43872)·dmgDealt/maxHit(G42357)·crits(G42318)·dmgTaken(G43574)·parries(G38472, Q 반사·E 파동·M29·보스 접촉)·walked/dashDist(G32745) 누적. potions(G35912) 기존 writer가 이제 쌓임 | 2초 D 이동 walked 웹 322.6 / Godot 310.0. dodges·dashCount는 원본 경로(hurtP 회피 G43435·chargeStocks 사슬 G33523 등)가 Godot에 없어 0 |
| SYS-5 물약 | 관측 전제가 원본과 다름: updateQS G28271 `const s={type:null,count:0}; // 포션 퀵슬롯 폐지` — 물약 분기 도달 불가, useQuickslot(G28204) 호출처 0 | 코드 변경 없음(물약 HUD를 새로 만들면 원본에 없는 동작) | 웹 QSLOTS[0]={type:'hp'}여도 qs0=가시덫, qs1~3 빈 칸. Godot 스킬바 1x 같음 `cmp/potion/` |
| SYS-4 AI 강화 | aiEnhance/_doAiEnhance 미이식 | G28125~28139 루프(`ai_enhance`, World 난수 시도당 1회), G28141~28185 대상·목표·예산·알림·applyStats·addTxt·shake(8)·renderForge·dbSaveNow. #aiEnhResult는 원본도 renderForge가 즉시 비움(웹 실측 innerHTML "") → 그리지 않음. AI 영역 비용·보유·부족분 toLocaleString(G50672·G50683) 누락도 고침 | 악의 1000·목표 100 → 소비 0·enh 0·'악의 소진...' / 악의 200000·목표 3 → 시도 3·소비 26,438·+3·악의 173,562 — 웹=Godot. 표시 1x 같음 `cmp/forge/forge_ai_rich_after_ai1x.png` |
| SYS-6 키 캡 | `_updateSkBarKeyLabels`·`_gpActive` 미이식, RMB/E 고정. 캡 글자도 캡 아래로 내려가 있었음(Label 최소 높이) | `_SK_SLOTS` G28544~28558·`_updateSkBarKeyLabels` G28559~28577·keyName KBM 표 G6300~6305·`_gpActive` 전환 G13452~13478·G13873~13876 이식, 캡 글자 중앙 | KBM RMB/E, BINDS shield=KeyR·beam=mouse0 → LMB/R, 패드 LT+A…B 13칸 — 3모드 2x 비교 같음 `cmp/keycap/all_bar2x.png` |

## 회귀 (각 1회 — 간헐 실패는 재실행 결과 병기)

| 테스트 | 결과 | ERROR / SCRIPT ERROR | 조건 |
|---|---|---|---|
| test_pc_final_death | 61/0 | 0/0 | storage off |
| test_pc_enemy_revive (revive) | 51/0 | 0/0 | storage off |
| test_pc_player_life (life) | 101/0 | 0/0 | storage off |
| test_pc_combat_kill | 47/0 | 0/0 | storage off |
| test_pc_move_skills | 256/0 | 0/0 | storage off |
| test_pc_hud_stats | 199/0 | 0/0 | storage off |
| test_pc_skill_writers | 80/0 | 0/0 | storage off |
| test_demo11_23b_inventory | 1281/0 | 0/0 | storage on |
| test_demo11_27_forge | 1918/0 | 0/0 | storage off |
| test_demo11_salvage | 35/0 | 0/0 | storage off |
| test_parity_ui_05 / 06 | 15/0 · 24/0 | 0/0 | storage off |
| test_parity_hud_01 | 17/0 | 0/0 | storage off |
| sweep_b_ui_check | 18/0 | 0/0 | storage off |
| test_demo11_04_lobby | 55/0 | 0/0 | storage on, 헤드리스 |
| test_demo11_07_lobby_entry | 56/0 | 0/0 | storage on, 창 모드 |
| test_demo11_09_pause | 27/0 | 0/0 | storage on, 헤드리스 |
| test_demo11_50_settings | 48/0 | 0/0 | storage on, 창 모드. SWEEP-B 49와의 차이는 조건부 단언 `preserve_prior_isolated_evidence`(이전 격리 폴더가 있을 때만) — 새 appdata라 생략 |
| test_demo11_47h_e2e | PASS 11 / NOT_READY 7 / FAIL 0 | 0/0 | storage on, `--isolated-userdir=EXODUSER-demo11-pc-sys-leftovers-Isolated-20261023 --source-root`. 첫 실행은 이 인자를 빠뜨려 격리 가드 FAIL 1(내 실행 조건 오류) |
| test_pcia_wire_life (변경) | 13/0 | 0/0 | 최종 회귀 첫 실행 13/2('300 countdown resolves'·'Mac followups once'), 같은 코드 재실행 13/0 — 간헐 |
| test_native_main_source_starter_state (변경) | 148/0 | 0/0 | storage off |
| test_demo11_25b_auto_potion | 2569/0 | 0/0 | storage off |
| test_pc_m29_parry | 101/0 | 0/0 | storage off |
| test_pc_sys_ai_enhance (신규) | 5/0 | 0/0 | 순수 거래 |
| test_p2001j_lesson_clock · l_lesson_steps · qa004_lesson_teardown · native_source_update_clock_play_time | 21/0 · 66/0 · 98/0 · 30/0 | 0/0 | 시계 변경 영향 확인용 |
| test_p2001k_lesson_practice | 32/1 | 0/0 | 실패 `panel_design_contract start button text/min44` — SWEEP-B S-01(bace4e6c4)이 레슨 하단 버튼을 웹 실측 36px로 바꾼 것과 충돌. 이번 변경과 무관(기준선 미실행) |
| test_pc_boss_core | 28/1 | 0/0 | `boss_pattern_states`(A1 300틱 동안 idle만) — 기준선 065068322 스크립트로도 같은 실패 확인(사전 결함) |

## 테스트 변경 (판정 약화 없음)

| 테스트 | 바꾼 것 | 근거 |
|---|---|---|
| test_pcia_wire_life | 조기 해소 하한 `ceil(before)` → `ceil(before/2)`, 늦은 해소 상한 `+5` 추가 | 원본 틱당 2 감소(G32794+G32991), 웹 실측 2506ms |
| test_native_main_source_starter_state | G 정확 키 집합에 initStage `_sStats` 1개 추가 | G31571/G62284 |
| test_demo11_07_lobby_entry | Main 대기 100프레임 → 도착 또는 실시간 60초(판정 동일) | INTEG-17: BOOT-01 예열 뒤 834프레임 도착 |
| test_pc_sys_ai_enhance (신규) | 웹 실측 값 대조 5건 | G28125~28139 |

## 발견했지만 범위 밖 (다음 배정 후보)

- **플레이어 에너지쉴드 흡수 없음**: 웹 hurtP는 실드부터 깎고 HP 피해 `a`만 dmgTaken에 넣는다(같은 40 피격에서 웹 dmgTaken 0). Godot Player 피해 경로는 실드를 쓰지 않아 HP가 깎이고, 사망 시에도 shield 283이 남는다(SWEEP-B death 로그). 게임플레이 차이 큼.
- 대장간 단일 강화(카드 클릭)는 Godot에서 dbSaveNow·SFX·파티클이 빠져 있음(기존 상태, AI 강화만 저장 연결).
- test_pc_boss_core A1 보스 idle(사전 결함), test_p2001k 버튼 높이 기대값(SWEEP-B 갱신 누락).

## 운영 기록

- 창: 처음엔 `--position 7040,0`이 Windows L=5120(GetWindowRect 확인). 작업 중 모니터 배치가 바뀌어(현재 DISPLAY2 0~1920·DISPLAY3 1920~3840만 보고됨) 이후 창 모드 실행은 Godot 보고 위치 (5120,0) — 현재 화면 밖이다. 이 구간의 GetWindowRect L값은 확인하지 못했다. 사용자 창(play16b, PID 47620)은 작업 중 사라졌고 최소화된 다른 Godot 창(PID 49432)은 건드리지 않았다.
- `run_reg.sh`가 처음에 `--artifacts-dir` 폴더를 만들지 않아 final_death·player_life가 SCRIPT ERROR로 멈춤 → 내 프로세스만 종료하고 러너 수정 뒤 재실행(위 표는 재실행 결과).
- 2_7 문서를 파이썬으로 고칠 때 CRLF 혼재가 LF로 바뀌어 1910행 diff가 났다 → 원본 바이트에 삽입 15행만 다시 적용해 복구 커밋(ed2277deb). 이력 재작성 없음.
- pre-commit guard 훅이 매 커밋 `tools/guard.baseline.json`을 고친다 — 내 소유가 아니라 커밋하지 않고 끝에 `git checkout`으로 되돌림.

## 미확인

- 실제 패드 장치로의 모드 전환(가짜 InputEventJoypadButton으로만 확인), localStorage `inputMode` 저장·복원(미이식).
- 사용자 플레이 창·Mac 실기 화면 반영(Git 반영만으로 열린 실행본이 갱신됐다고 보지 않음).
- 07 lobby_entry 수정의 BOOT-01 통합본 재실행.
- 사망 화면에서 펫 대사 페이드 시점(S-03), 클리어 카드 통계 값의 웹·Godot 같은 플레이 대조(통계 누적 경로만 대조).

# INTEG-12 PC 검수 대표 비교 격자 (2026-10-22)

왼쪽이 웹, 오른쪽이 Godot이다. 원본 PNG를 JPG(품질 88)로 바꿨다. 판정·조건은 `docs/engine/PARITY_INTEG12_PC_VERIFY_20261022.md`에 있다.

- 웹: main 작업 사본(game.html = 91e2774b7), 헤드리스·음소거, tier S, 1920×1080
- Godot: INTEG-12 `codex/demo11-integ12-20261022` 8d323e2b, Windows 창 모드 1920×1080
- 원본 PNG 84장: `G:/exoduser-wt/_out/integ12-verify/compare/`

| 파일 | 장면 | 판정 |
|---|---|---|
| 01a_lobby_first | 로비 첫 화면 | 다름(세부) |
| 02b_story_t3 | 전사 이야기 | 같음(정지 still) |
| 03c_intro_dialogue | 첫 진입 INTRO 헥터 대사 | 같음 |
| 03e_guide_summon | 가이드 + 금빛 소환진 | 다름(Godot 소환진 없음) |
| 04b_field_clean | 1-1 시작 필드 | 같음 |
| 04m07_corpse_tree_crop1x | 시체나무 밀집 1x | 나무 웹 이상, 가림 고스트 이하 |
| 05a_hud_orbs_skillbar_1x | HUD 구슬·기동 링·스킬바 1x | 거의 같음(Q 아이콘) |
| 05b_hud_topright_1x | 우상단 지역 처치 0/32 | 거의 같음 |
| 05c_hud_topleft_minimap_1x | 미니맵 | 다름(색 표식 없음) |
| 05g_region_m08_north_gate_topright_1x | 북문 지역 분모 | 다름(웹 32, Godot 60) |
| 06b_skill | 스킬창 | 다름(가운데 원판 없음) |
| 06d_settings | 설정 | 다름 |
| 07c_space_slam | 지옥강타 | 같음 |
| 08c_dirspace_mid | 전격이동 | 동작함(상태 불일치) |
| 09c_entry_namecard | 보스방 네임카드 | 같음 |
| 10a_arena | 아레나 밝기 | 같음 |
| 10c_slam | 강타 예고 | 구성 같음, 드루이드 밝기 다름 |
| 10o_bossbar_1x | 보스 HP 바 1x | 같음 |
| 11a_fallen | 쓰러짐 | 같음(형식) |
| 11c_death_screen | 사망 화면 | 같음(진입 페이드 세부) |
| 11d_clear | 스테이지 클리어 | 다름 |
| 11g_lobby_return_clear | 로비 복귀 | 거의 같음 |

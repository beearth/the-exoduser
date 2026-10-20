# DEMO11-INTEG — Mac 병합 후보 통합 브랜치 (2026-10-21)

**통합 후보 준비. 33개 지정 SHA 모두 ancestor로 포함. 대표 suite 각1회: 29개 ERROR 없는 PASS, 41의 assertion8실패, 하니스 준비 오류3단위(EL-01·19ui·37). 전체 E2E/최종 인수 PASS가 아니다.**

브랜치 `codex/demo11-integ-20261021`. 시작 fetch 기준 `origin/main 0138c5bb9188d27cee10cb1a901d075092ddb88f`. 최종 **통합 코드 SHA `c6932a85fc461a31d1b2d7553ae2a02ac770d926`**. 이후 보고서/CHANGELOG만 추가한 제출 ref의 최종 SHA는 원격 브랜치와 `_out/demo11-integ/DONE.txt`에 기록한다. PC 검증·한 번의 병합 및 ttys004 E2E용이며 main push/rebase/force0.

요청 순서대로 merge를 시도했다. 시작 main에 포함된 지정 후보0개, 31은 선행44의 의존 체인으로 이미 포함되어 해당 순서에서 no-op이었다. 대표 테스트는 31도 그 시점에1회 실행했다. 충돌32단계의 원문은 `_out/demo11-integ/conflicts/<순번>/`에 보존했다. 표의 각 결과는 해당 통합 SHA에서의 검사이며, 뒤 후보의 변경까지 포함한 최종 전수 재검증으로 계산하지 않는다.

표의 테스트 파일은 모두 `godot/tests/` 아래 기존 파일이다. 파일 자체를 약화·수정하지 않았다. 원본 oracle는 명시 Node24 경로·최신 worktree game.html 절대경로를 전달했다. 원본 오디오/서사 자산 root만 R에서 읽었고 대용량 웹 에셋을 worktree로 복제하지 않았다.

| 순서·후보 | 통합 SHA | 충돌 파일 | 해소 근거 | 대표 테스트 | 결과 |
|---|---|---|---|---|---|
| 1. 38 `5ff66f32` | `7dfb3bcb` | `docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md`<br>`docs/engine/orders/WORK_BOARD.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_38_end_flow.gd` | PASS 42/0 · ERROR0 |
| 2. 41 `b447d22b` | `62f87dda` | `docs/CHANGELOG_SYNC.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_41_music_lifecycle.gd` | 검토:55검사/8실패 · ERROR0 |
| 3. 09 `dc9f34ea` | `b10605b8` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md`<br>`docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main 파일 머리: 종료 신호/EndFlow와 PauseMenu의 독립 선언 모두 유지 | `test_demo11_09_pause.gd` | PASS 25/0 · ERROR0 |
| 4. 08 `fa55755d` | `68fc2d7c` | `docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main._ready: EndFlow 설치/신호 유지 + 08의 story→waking guarded handoff 채택. 기존 무조건 intro 설치2줄은 08의 once helper로 대체(중복 owner 방지) | `test_demo11_08_story_intro.gd` | PASS 36/0 · ERROR0 |
| 5. 07 `5d07f978` | `25fd1adb` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main: EndFlow 유지 + 07 active-slot admission 전 intro 보류 분기 채택; 이동된41 음악 함수는 byte 동일 확인해 1사본만 유지 | `test_demo11_07_lobby_entry.gd` | PASS 52/0 · ERROR0 |
| 6. 06b `cadd5311` | `7ac26716` | `docs/CHANGELOG_SYNC.md`<br>`godot/scripts/native_source_new_run_state.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>State 끝: 38 clear progression와06b load-only globals/storage/commit API를 독립 함수로 모두 보존 | `test_demo11_restore_session.gd` | PASS 34/0 · ERROR0 |
| 7. 06c `93f118fb` | `e828fc68` | `docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main._ready: EndFlow 유지, 06c loaded는 dormant waking owner 설치만; 그 외07 pending→08 story→waking 순서. 기존 once helper를 재사용해 중복 intro/reset 방지 | `test_demo11_restore_connected.gd` | PASS 49/0 · ERROR0 |
| 8. 43 `9b763da9` | `638991c4` | `docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>godot/scripts/main.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인 | `test_demo11_43_stage_spawn_adapter.gd` | PASS 40/0 · ERROR0 |
| 9. 22r `d276e02e` | `7d2f6b6c` | `godot/scripts/native_source_new_run_state.gd` | godot/scripts/native_source_new_run_state.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_22r_equipment.gd` | PASS 442/0 · ERROR0 |
| 10. EL-01 `654845e4` | `17f57aad` | `docs/CHANGELOG_SYNC.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_el01_hell0.gd` | 하니스 중단:집계없음 · 컴파일ERROR4 |
| 11. 04b `2665f02d` | `4688746b` | `docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_04_lobby.gd` | PASS 60/0 · ERROR0 |
| 12. 19r `0c136318` | `18cf2e73` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_source_new_run_state.gd` | godot/scripts/main.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>godot/scripts/native_source_new_run_state.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_19r_growth.gd` | PASS 383/0 · ERROR0 |
| 13. 19ui `c6f9989b` | `066ca0af` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_growth_ui.gd` | 하니스 미검증:36/0 · ERROR2 |
| 14. 37 `05f41cc7` | `e84491b0` | `docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_source_new_run_state.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main encounter 설치 추가, loaded/pending/story once 인계 유지. State 기존 load/forge/equip/growth와37 progression 모두 보존. 이동된38 종료 함수·clear var는 byte 동일 확인 후 한 사본만 유지: identical function _open_native_demo_wishlist,identical function _return_native_demo_lobby,identical function commit_native_demo_clear,identical declaration _native_demo_clear_phase | `test_demo11_encounter.gd` | 하니스 미검증:148/0 · ERROR2 |
| 15. 50 `07c2dad4` | `c973c31e` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md`<br>`docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/port_modules/save_adapter/demo_local_storage.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>local storage: 기존 _validate_raw 위임·store 경계 유지, 50의 신규 hellLang(ko/en) 검증을 공통 validator에 결합해 read/write 동일 허용. slot JSON/active 검증 보존 | `test_demo11_50_settings.gd` | PASS 44/0 · ERROR0 |
| 16. 42 `4f1f5208` | `91320761` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main._ready: 기존35 projectile registry 설치 유지 후42 display-only HUD owner 설치 추가. 서로 독립 서비스, 피해/phase 로직 변경0 | `test_demo11_42_hud_owner.gd` | PASS 33/0 · ERROR0 |
| 17. 28 `c4f92cde` | `c8d79dec` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md`<br>`docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main: 06c loaded start 승인/기존 lifecycle 유지 후28 salvage panel 설치;41/43 공개 접점과28 State 위임 API 모두 보존. 분해/저장 owner 로직 재작성0 | `test_demo11_salvage.gd` | PASS 35/0 · ERROR0 |
| 18. 23b `0fd59ed6` | `733157cb` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md`<br>`docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_source_new_run_state.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>23b inventory 설치를 기존 demo11_enabled 내부에 유지한 뒤,28 salvage 설치를 외부에 유지(들여쓰기 scope 보존). 기존19 growth/37 progression와23b 단일 STORAGE/INV owner 모두 유지. 중복06c loaded 승인 함수는 byte 동일 확인 후1개 | `test_demo11_23b_inventory.gd` | PASS 1277/0 · ERROR0 |
| 19. 44 `78b33025` | `b8dbe0fd` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md`<br>`docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_source_new_run_state.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>44가 인수한31 angler 설치+pet owner binding을42 HUD와 함께 유지. 이동된 wishlist/State clear는 기존 byte 동일 사본 확인해 추가하지 않음;06c loaded 승인 공통 return true와23b inventory 권한 보존 | `test_demo11_44_pet_events.gd` | PASS 75/0 · ERROR0 |
| 20. type7-fix `b8e7c092` | `0a22c928` | `docs/CHANGELOG_SYNC.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_native_type7_runtime.gd` | PASS 2그룹 / 실패assertion0 |
| 21. 31 `76bcae8d` | `0a22c928` | 없음(no-op) | 44 의존에 포함됨 확인, 재병합 변경0·대표검사1회 | `test_demo11_anglers.gd` | PASS 1402/0 · ERROR0 |
| 22. 32 `4a10102a` | `c7c8cc6d` | `docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_source_new_run_state.gd` | godot/scripts/native_source_new_run_state.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main 기존42 HUD/31 angler/44 pet binding 유지하고32 fire service 설치·Marker 공개 API 추가;22r/19r/37/23b 함수 모두 보존. State32 record claim 독립 추가 유지 | `test_demo11_fire_devils.gd` | PASS 906/0 · ERROR0 |
| 23. 33 `f650c8d7` | `31f4d0d2` | `docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md`<br>`docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/main.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>Main:44 pet binding·32 fire 서비스와33 worm 설치/Marker API를 모두 유지. 기존 단일 registry의33 auxiliary-owner 변경은 정상 병합, 새 pool 생성0 | `test_demo11_worms.gd` | PASS 7874/0 · ERROR0 |
| 24. fieldboss-unify `af25fea1` | `b75f939f` | `docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_source_new_run_state.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>af25fea1 자체 diff에서 Main/State0줄 확인,31·32·33은 이미 포함 확인. 충돌은 의존부 서비스 순서/함수 위치이므로 기존 통합 Main/State byte 유지, 실제 공통 helper/refactor 파일만 인수 | `test_fieldboss_unify.gd` | PASS 14/0 · ERROR0 |
| 25. enemy-base `26406969` | `82b9f5af` | `docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_demo11_boss_projectiles.gd` | godot/scripts/main.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>단일 registry._physics_process: 이미 World가 처리한 natural frame 중복 방지→기존 D reader/retain/retire→기존field clock facade→boss fallback 순으로 결합. 각 serial/sp/entry별aggro 검증과 기존 pool 보존, 새로운 피해/clock 식0. 복수 owner 동시 E2E는 후행 | `test_demo11_enemy_base_d.gd` | PASS 21/0 · ERROR0 |
| 26. etype-a `d931ebe2` | `e40584a0` | `docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/enemy_factory.gd` | godot/scripts/enemy_factory.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_etype_a_registered.gd` | PASS 1952/0 · ERROR0 |
| 27. etype-b `c6d19973` | `04523330` | `docs/CHANGELOG_SYNC.md`<br>`godot/scripts/enemy_factory.gd`<br>`godot/scripts/main.gd` | godot/scripts/enemy_factory.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>godot/scripts/main.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_etype_b_runtime.gd` | PASS 42/0 · ERROR0 |
| 28. etype-f `ef64bd17` | `c0d26adc` | `docs/CHANGELOG_SYNC.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_etype_f_runtime.gd` | PASS 33/0 · ERROR0 |
| 29. 24 `5a3af410` | `04ed211c` | `docs/CHANGELOG_SYNC.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_24_equipment_effects.gd` | PASS 639/0 · ERROR0 |
| 30. 29 `ff7d85c3` | `65d1691f` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/CHANGELOG_SYNC.md`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_source_new_run_state.gd` | godot/scripts/main.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>godot/scripts/native_source_new_run_state.gd: 서로 다른 최상위 선언/함수만 추가 충돌, 양쪽 보존·함수 중복 없음 확인<br>문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_demo11_29_workshop.gd` | PASS 95/0 · ERROR0 |
| 31. perf `aaf52dc0` | `9415b968` | `docs/CHANGELOG_SYNC.md`<br>`docs/engine/orders/WORK_BOARD.md`<br>`godot/scripts/enemy_factory.gd`<br>`godot/scripts/main.gd`<br>`godot/scripts/native_demo11_boss_projectiles.gd` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF<br>perf 자체 커밋의3충돌파일 변경0 확인: 의존 통합/함수 위치 충돌. 기존base-D 준비형등록·D player/entry owner·field clock·F/workshop/Main API 보존, 동일D 함수/const만 byte 확인 dedup. 실제perf actor/world geometry 최적화는 정상 인수 | `test_demo11_perf_enemy_equivalence.gd` | PASS 6473/0 · ERROR0 |
| 32. MAP11-02 `6bcc483d` | `c8e004ca` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/CHANGELOG_SYNC.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_map11_stage_provider.gd` | PASS 54/0 · ERROR0 |
| 33. MAP11-11 `263498f6` | `c6932a85` | `docs/16번역·로컬라이제이션/번역대상_전체목록.md`<br>`docs/CHANGELOG_SYNC.md` | 문서 충돌: 독립 절/행을 양쪽 보존(포함 관계는 중복 제거), 번역 byte 편집·CRLF | `test_map11_field_runtime.gd` | PASS 49/0 · ERROR0 |

문서의 독립 절/행은 양쪽 보존했고 포함 관계에서는 동일 부분을 중복하지 않았다. 코드의 독립 최상위 선언/함수는 이름 충돌 여부를 확인해 함께 유지했다. 위치만 옮겨진 동일 함수·const·var는 byte 동일을 확인한 경우에만 한 사본으로 정리했다. 같은 함수의 본문/분기·들여쓰기·clock은 자동 합집합으로 처리하지 않고 위 근거대로 해소했다.

핵심 결합은 Main의 **loaded dormant → 신규 lobby admission → story → waking once** 경계, 기존 종료/encounter/HUD·inventory/분해·필드보스 설치 보존, 저장소 공통 `_validate_raw`에50의 ko/en hellLang 검증 반영, 단일 projectile registry의 **이미 dispatch된 natural 중복 방지 → D reader/retain/retire → field clock facade → boss fallback**이다. 제공 후보 밖의 전투 판정/피해/패링·새 게임 기능·저장 형식을 새로 구현하지 않았다.

| 인계 대상·분류 | 확인한 원인/근거 | 필요한 후속·현재 판정 |
|---|---|---|
| 41 작성자 / BGM 검토 | `02-41-test.err`: 초기 lobby/intro/field actual playing3건, death2건·victory1건, missing asset error/handle2건 =8실패/55. headless Dummy 드라이버. 명시 원본 bgm root 존재 검사는 통과 | intro guide/pause와 media suspend 재동기화·terminal·failed-load 수명을 단독 후보/통합본에서 비교. 근본 원인 미확인, 제품 코드 수정0·재실행0. 뒤08은 실창36/0이지만41의 재시험으로 계산하지 않음 |
| 통합/E2E 하니스 — EL-01 | `10-EL-01-test.err`: 신규 port_modules global class `ExoduserHell0EliteSelector` 미등록→컴파일 실패. 준비 스캔을 scripts만 한 통합 하니스 오류. 실행 집계 없음, 자체 실패 Godot만 SIGTERM(exit−15), 타 Godot 종료0 | 이후 준비 스캔을 전체godot로 확대·새 class import. **EL suite 재실행0/미검증**. E2E에서 editor import 후 재확인 필요, EL 제품 결함으로 단정하지 않음 |
| 통합/E2E 하니스 — 19ui·37 | 각 assertion36/0·148/0이나 `demo_growth_glyphs.svg`, `demo_growth_body.svg` 미import로 ERROR각2. ERROR0 PASS로 세지 않음 |15 준비에서 정확히 두 SVG를 import, 이후 검사 ERROR0. 기존 두 suite는 요청의1회 원칙으로 재실행0·미검증. 제품 변경0 |
| ttys004 / enemy-base·fieldboss 작성자 — 결합 경계 | enemy-base21/0·fieldboss fixture14/0은 각각 대표 범위. 여러 natural/D/field owner가 한 registry에서 동시에 활성화되는 최종 E2E는 미실행 | 위 clock 우선순위·중복serial/퇴장/retire를 통합 E2E에서 확인. 기존 B/F source-selected handoff·미연결 PC 접점·MAP11-prod 등 후보 보고서의 HOLD/NOT_READY를 해제한 것으로 해석하지 않음 |

새 class 또는 자산이 생긴 단계만 추가 editor import로 준비했고 그 실행은 대표 검사 횟수에 섞지 않았다. 모든 import 로그 ERROR0. 41의 실제 청음·Windows 실행·전체120fps·최종 자연 전투/저장 E2E는 미확인이다. 성능 대표 동치 검사6,473/0만 실행했으며 새 벤치0; perf 후보의 기존 최대 hitch 목표 미달 판정도 그대로 유지한다.

최종 정적 확인:33개 target ancestor, 미해소 merge marker0·최상위 중복 함수/선언0, 원본 game.html blob은 시작 main과 동일, 번역 목록 **CRLF4,975줄·lone LF0**(`file` 확인). `git diff --stat` 원문은 `diff-stat.txt`, 후보 문서의 CRLF/trailing-whitespace 경고 원문은 `diff-check.txt`; 임의 전체 문서 재서식0. 초기 로컬 파일/타 작업 변경을 커밋하지 않았다.

각 테스트 상수 namespace 또는 `EXODUSER-demo11-integ-Isolated-20261021`만 사용했고 실제 사용자 `EXODUSER-Godot-Native-First` 사용0. 매 Godot 실행 전 exact pgrep count≥2이면30초 대기, `*.gate.jsonl` 보존. override는 실행마다 격리 설정 후0byte. 기존 사용자 Godot를 종료하지 않았다.

원로그·순서/전체 SHA·실행 argv·namespace·실패 줄: `~/exoduser-wt/_out/demo11-integ/{manifest.json,audit.json,author_actions.json,*.json,*.out,*.err,conflicts/}`. R branch/HEAD/status 시작·종료 대조, 자기 브랜치 정상 push·원격 SHA 일치·DONE 작성 후 자기 worktree만 제거한다. PC는 이 브랜치를 별도 worktree에서 준비/import하고 Node·source 경로를 자기 환경 인자로 넘겨 검증해야 하며, main에 자동 반영하지 않는다.


## 2026-10-21 보충 — 최신 공통 기반 1f0a71fb 추가 merge

사용자 보충 지시에 따라 제출본2500b677 위에 `1f0a71fb183e949dbdabfdc74586263e0f51eb01`를 정상 merge했다. 코드 merge SHA `f79fc969e27fe66a5e6cb60bbd4601b7eb7d9554`. A d931ebe2·B c6d19973는 해당 의존의 ancestor이며 중복 merge하지 않았다. 기존33단계 검사 이력과 미검증 판정은 위 원문 그대로 유지한다.

| 경계 | 해소·검증 |
|---|---|
| 충돌4파일 | CHANGELOG_SYNC/WORK_BOARD 독립 기록 병존. Main 기존 장비·성장·필드보스·F·workshop 함수 보존, 새 의존의 A 직접 공통 ingress 제거 수용. factory A/B는 최신 단일 등록표·prepared capability로 교체하고 F 기존 생성 경로 유지 |
| 공용·보호 | 이전 제출 대비 Main3369 인근 A ingress1줄 삭제, State/World/Player 및 보호 피해 코드 추가 변경0. fieldboss clock·F 이관은 임의 변경0. 번역 CRLF 4975줄/loneLF0 |
| 대표 검사1회 | test_demo11_enemy_base2 원문 그대로89/0·ERROR0·exit0. 실제15spawn/tick·13death, B8/D25 PC death HOLD 유지. editor import는 준비 실행이며 검사 합산0. 기존 실패 suite 재실행0·새 성능 벤치0 |
| 미완료 유지 | 이전41 BGM8실패, EL/19ui/37 하니스 미검증 및 전체 E2E 인계 유지. F는 legacy 경로 유지, A/B/D와의 전체 동시 자동 자연 전투 완료 주장0 |

원로그 `~/exoduser-wt/_out/demo11-integ/supplement-1f0a71fb/`. 테스트 상수 격리명 사용, override 종료0byte, 실제 사용자 저장0. 충돌 원문·gate·argv·결과·R대조 보존.


## 2026-10-21 보충: MAP11-PROD 마지막 통합

기존3b01908d 위에 a5ad5e4e를 정상 merge했다. MAP11-02/11과 최신 A/B/D 기반 뒤에 추가했으며, main push/rebase/force는 없다.

| 항목 | 결과 |
|---|---|
| 충돌5파일 | CHANGELOG_SYNC/WORK_BOARD 독립 기록 병존. Main 기존 세션/장비/필드보스/F와 MAP11 API 병존, State 기존 transaction과 MAP11 transport/chest 병존, World 자연 admission과 MAP11 공간 API 병존 |
| 부팅 경계 | 최초 editor 준비에서 regions scope parse error 검출. MAP11은 legacy NativeRegions가 없으므로 Main에서 get_node_or_null 후 valid일 때만 기존37 configure. legacy 동작 보존, MAP11+37 progression 연결 HOLD. 교정 후 import ERROR0 |
| 대표1회 | test_map11_product 무수정 37/0, ERROR0, exit0. 실제 Main Start Marker→gate→arena, 완료 전 exit 거부. 테스트 상수 EXODUSER-map11-prod-Isolated-20261021, override 종료0byte. 재실행0/새 벤치0 |
| 인계 | 기본 MAP11/--map11=off 분기 수용. off 런타임 별도 검사는 미실행. 이전 BGM8실패/EL·19ui·37 하니스 미검증 유지. MAP11+37 지역 진행·모든 Marker 소비자 자동 연결·최종 처치/부활·전체 E2E 미확인 |

공용 변경 줄 범위는 원로그 supplement-map11-prod/shared-file-hunks.diff의 3b01908d 대비 hunk에 기록했다. 보호 전투 핵심 임의 변경0, 번역 CRLF 보존. 최초 준비 실패는 PASS에 합산하지 않는다. 원로그: ~/exoduser-wt/_out/demo11-integ/supplement-map11-prod/.


## 2026-10-21 보충: 최신 적 기반·장비24b·MAP11-10

제출8d8f5342 위에 bb3ced49→049cc1aa→e8888106 순서로 정상 merge. 과거1f0a71fb/F merge 이력 보존, 최신 bb3ced49가 둘을 포함하므로 재merge0.

| 순서·merge | 충돌 해소·대표1회 |
|---|---|
| bb3ced49 /32cfb639 | docs 번역/UI/CHANGELOG/WORK_BOARD 독립 기록 병존. Main/State 오래된 의존 함수 이동 충돌은 기존 통합 보존(commit 자체 State 변경0), Main에는 고유 E-spawn API만 추가. factory F는 최신 단일 등록표/prepared capability. base3 104/0 ERROR0,18spawn/tick·16death, B8/D25 사망HOLD |
| 049cc1aa /78fb93b7 | CHANGELOG 병존. Main loaded restore/applyStats 후 affix 초기cache rebuild, 기존 기능+24b cache API 병존. test_demo11_24b_system_effects 131/0 ERROR0, 실제Main·13종/13oracle 사례·직접kill fixture(자연loot 아님) |
| e8888106 /f9141344 | CHANGELOG 병존·코드충돌0. 선행 맵 아트/preview/shader 원작성 byte merge. test_map11_seam 18/0 ERROR0, geometry/seam receipt 검사 |

합계253/0, 각suite1회·exit0. 적/장비는 기존 하니스 전제 --map11=off, 맵은 preview scene. 새MAP11 전체 적/장비/자연진행 PASS 주장0. editor 준비 ERROR0·assertion 합산0, 새벤치0/최종E2E0/문지기29 전용suite 미실행. 틱 경로 목록생성API 신규추가0(diff 검색). 이전41 BGM8실패·EL/19ui/37 하니스 미검증·MAP11↔37 region/progression HOLD 유지. F admission은 공통기반으로 갱신했으나 보호 projectile/swoop/slam NOT_READY 해제0.

공용 변경hunk(8d8f5342 대비): main.gd: -98,0 +99,2, -261,0 +264,2, -1033 +1037,3, -1259,0 +1266,6, -2503 +2515, -2561 +2573, -2665,0 +2678, -3301,0 +3315, -3467,0 +3482,13; world.gd: 0; native_source_new_run_state.gd: 0. 상세 supplement-latest/shared-file-hunks.diff. 원본game.html blob불변, 보호전투 임의수정0. 번역 충돌 해소에 남은12개 LF를 push전 발견하여 byte방식으로 CRLF 복구: 최종CRLF4987/loneLF0. 테스트 약화0. 원로그 ~/exoduser-wt/_out/demo11-integ/supplement-latest/. 격리 각테스트상수·gate·override종료0byte·원격일치·R대조·DONE 보존.

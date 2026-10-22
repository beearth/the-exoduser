# VRAM-01 — 맵 외 텍스처 수명 축소 및 분해 (2026-10-22)

**PARTIAL / 목표 ≤1.0GB 미검증.** 기준 015d40344a8abd9f0e59148b91638b113c00a140, 브랜치 codex/vram-01-20261022. 이 기준의 조상에는 PARITY-MAP-03 f6272399가 없다. 보호된 맵·보스·아레나 파일은 수정/통합하지 않았다. 그 결과 사용자가 제시한 MAP03 전체 monitor 3.00/3.04GB와 이번 절대값을 같은 소스로 간주할 수 없다. PC 실행·동기화는 미확인이다.

## 측정 계약과 예산

1920×1080 Mac M5 Pro / Godot 4.7.2 GL Compatibility 실제 렌더. Performance RENDER_TEXTURE_MEM_USED / RENDER_VIDEO_MEM_USED와 엔진 원격 디버거 servers:memory → servers:memory_usage(RenderingServer texture_debug_usage)를 사용한다. 이 엔진에는 get_texture_debug_usage GDScript 메서드가 없다. headless 값은 GPU 근거로 사용하지 않는다. 단위 GB=10^9 bytes, MB=10^6 bytes.

| 예산/분류 | 후 field bytes | 판정 |
|---|---:|---|
| 맵 외 목표 | 1,000,000,000 | 완료 주장 불가 |
| 경로별 GPU 목록 합 | 2,769,330,333 | 엔진 보고값 |
| 이름 있는 /assets/map/ 및 /assets/maps/ | 1,717,488,984 | 보호 범위; 전후 동일 |
| 위 맵 경로 제외 잔여(익명 포함) | 1,051,841,349 | 목표보다 51,841,349 초과; 보스·익명 맵도 포함 가능 |
| monitor texture와 목록 합 차이 | 938,453,118 | 내부 할당/계수 차이 미분해. UI 또는 맵 외로 임의 배정 금지 |

경로가 없는 생성/엔진 텍스처는 소유자 미확인으로 표기했다. TSV의 load_owner는 코드/manifest 기반 추론이며 런타임 호출 stack 추적으로 과장하지 않는다. mipmap은 .import 설정이며 익명 리소스는 unknown이다. 원격 목록은 실제 해상도·포맷·bytes를 보존한다. 파일 전체 목록은 외부 산출물 *-sorted.tsv, 원시 목록은 *-textures.json이다.

## 전후 monitor

| 상태 | 전 texture / video GB | 후 texture / video GB | texture 감소 MB |
|---|---:|---:|---:|
| lobby | 0.122504 / 0.128922 | 0.122504 / 0.128922 | 0.000 |
| field | 3.786603 / 3.834018 | 3.707783 / 3.755198 | 78.820 |
| inventory | 3.910014 / 3.959007 | 3.865275 / 3.914268 | 44.739 |
| arena | 3.939703 / 3.989250 | 3.713682 / 3.762667 | 226.021 |
| skills | 3.939703 / 3.989250 | 3.816117 / 3.865665 | 123.585 |
| intro | 3.381303 / 3.422323 | 3.302483 / 3.341373 | 78.820 |

arena는 제품 Map11ProductScene.activate_space("arena")를 호출한 캡처 전용 공간 활성화 상태다. 자연 보스 입장/보스전 완료 측정은 아니다. 전후 같은 순서(로비→첫 진입 컷→필드→인벤토리→스킬→arena), 신규 격리 저장 namespace다. 준비·레슨 skip·정지/큐 시계 fixture는 캡처만 사용한다. 실제 E2E와 구분한다. 랜덤 장비 수치·선택 아이콘 shader TIME에 따른 전체 화면 차이는 별도로 보존한다.

## 큰 순 필드 표 (전)

| 경로 / 그룹 | 크기·포맷 | 개별 MB | 로드 소유자 |
|---|---|---:|---|
| res://assets/enemy/atlas_ch1_8dir_walk_south.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_walk_south_east.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_walk_east.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_walk_north_east.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_walk_north.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_walk_north_west.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_walk_west.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_walk_south_west.png | 8192x1280 RGBA8 | 41.943 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/map/ch1/boss_room_bg.png | 3072x3072 RGBA8 | 37.749 | scripts/world.gd |
| res://assets/enemy/proj_phys_mouth.png | 6144x1152 RGBA8 | 28.312 | scripts/enemy_projectile_physical.gd; scripts/enemy_factory.gd; scripts/native_element_projectile_emitter.gd |
| res://assets/map/ch1/map_1-2.jpg | 3072x3072 RGB8 | 28.312 | scripts/world.gd |
| res://assets/map/ch3/collision/prop_hellwinter_wall_atlas.png | 3072x2048 RGBA8 | 25.166 | scripts/world.gd |
| res://assets/vfx/vfx_ice_orb.png | 2304x2304 RGBA8 | 21.234 | scripts/native_skill_slots.gd |
| res://assets/vfx/vfx_void_black.png | 2304x2304 RGBA8 | 21.234 | scripts/native_spawn_hole_system.gd |
| res://assets/ui/parity_ui_03/sigil.png | 2048x2048 RGBA8 | 16.777 | native_skill_forge.render / icon_for (before: script preload header/sigil) |
| res://assets/ui/parity_ui_03/header.png | 2048x2048 RGBA8 | 16.777 | native_skill_forge.render / icon_for (before: script preload header/sigil) |
| res://assets/ui/parity_ui_02/img/ui/blackiron_frame.png | 2048x2048 RGBA8 | 16.777 | native_parity_ui_surface.texture; inventory / ossuary / life paint owners |
| res://assets/map/web_parity/detail02/swampWater.png | 1760x1800 RGBA8 | 12.672 | data manifest / dynamic path; exact caller UNRESOLVED |
| <anonymous> | 1024x2560 RGBA8 | 10.486 | UNRESOLVED generated/engine resource; not attributed to non-map |
| <anonymous> | 1024x2560 RGBA8 | 10.486 | UNRESOLVED generated/engine resource; not attributed to non-map |
| res://assets/enemy/atlas_ch1_8dir_south.png | 2048x1280 RGBA8 | 10.486 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_south_east.png | 2048x1280 RGBA8 | 10.486 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_east.png | 2048x1280 RGBA8 | 10.486 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_north_east.png | 2048x1280 RGBA8 | 10.486 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |
| res://assets/enemy/atlas_ch1_8dir_north.png | 2048x1280 RGBA8 | 10.486 | enemy_factory / etype_a_spawn preload; enemy_*._ready; type3_summoned_actor._prepare_body (shared atlas) |

## 적용 및 보류

| 위치 | 변경 | 수명·화면 계약 |
|---|---|---|
| native_inventory_panel.configure/open_panel | _build를 최초 open으로 이동 | 표시 전에 원본 같은 UI 구성, 저장·장비 writer 불변 |
| native_inventory_panel.close_panel | TextureRect.texture / Rail.image만 경로 meta로 전환, 강한 _textures 캐시 해제 | Control/스크롤/필터 유지. 재열기 시 이벤트에서 복원, Rail redraw 요청. 숨김 refresh는 생략 |
| native_parity_ui_surface.texture | 강한 static 캐시→WeakRef | 살아 있는 사용자끼리 ResourceLoader 기본 캐시 공유; 닫힌 UI가 캐시 하나 때문에 상주하지 않음 |
| native_skill_forge | header/sigil preload→UI render의 load; close 시 stage/아이콘 캐시 해제 | 원본 PNG 및 shader/레이아웃/필터 동일. K/ESC/TAB 경계에서만 수행 |
| 인트로/영상 | 변경 없음 | 첫 진입 컷은 끝날 때 기존 clear, 영화 still은 sequence 전체 사전 로드 후 queue_free. tick 로딩 금지와 전환 순간 선명도 보존 때문에 컷 단위 지연 로딩은 미적용 |
| mipmap/RGB/축소/VRAM 압축 | 변경 없음 | 적·고어·VFX import mipmap 이미 false. HUD에 LINEAR_WITH_MIPMAPS 실사용 있음. RGB/리사이즈/손실 압축의 완전 동일성 증거 없이 변경하지 않음 |

맵 외 약2GB가 모두 컷신/로비/아이콘 낭비라는 가설은 확인되지 않았다. 실제 대형 항목은 적 atlas448MB, gore151MB 등이며 이름 없는 생성 리소스와 monitor 차액이 남는다. 맵 소유 파일을 수정하거나 아직 비교하지 않은 압축을 적용해 목표 달성을 선언하지 않는다. 후속은 엔진 내부 할당의 원인 분해 및 적 atlas의 무손실 사용 셀 분리 검토다. 현재 적 생김새/이동/전투 caller를 바꾸지 않았다.

## 검수

- 관련 suite 단회: test_demo11_23b_inventory, 1281 checks / failures0, 실제 Main·저장/로드·UI 사용. SCRIPT ERROR0.
- 입력 E2E 단회: --demo11-storage=on, PASS, injections0, SCRIPT ERROR0. 실제 Escape/Space 홀드→생성 UI→Main→field. 자연 보스 클리어 E2E는 아님.
- 최종 캡처: final.json PASS, 오류0, child 종료·override 복원. inventory-reopen 캡처 포함.
- 필수 1x 비교: captures/required-comparison.json 및 *-compare-1x.png. 로비 바르칸/기사/인트로/비선택 스킬6개 픽셀 차이0. 선택 아이콘 TIME 발광은 고정하지 않았으며 원본 넓은 skills-compare-1x.png에 차이를 보존했다. 웹과의 새 전체 화면 parity 승인은 아님; 기존 UI/영상 HOLD 판정 유지.
- 측정 하니스 초기 오류(API 미공개, storage=off 인벤토리 거절, 두 번째 Main 초기화 실패)는 외부 로그에 보존한다. 유효한 전후는 before-complete와 final만 사용. before-complete는 캡처 완료 후 디버거 capture 해제 오류1건; final에서 명시 unregister로 해결. baseline 출력에 SCRIPT ERROR0 성공을 소급하지 않는다.
- R 제품 파일 수정/Godot/import0. 초기 원격 fetch 및 worktree 등록은 수행했다. 실제 Godot/import는 격리 worktree만 사용. PID81277 조작0, 타팀 Godot 보존, 자기 child 종료 확인. 사용자 실제 EXODUSER-Godot-Native-First 접근0. 새 runtime3D 로딩/이미지 생성/서버 재시작/배포0.

재현: worktree root에서 python3 godot/tests/run_vram_01_capture.py --engine <Godot절대경로> --out <고유출력> --label <고유이름>. 사전 import는 mac_harness의 격리 override로 실행한다. 출력 metadata에 argv/PID/gate/override 복원을 남긴다. 로컬 TCP 디버거는 16081만 사용하고 임의 게임 상태를 쓰지 않는다. 전체 외부 근거: ~/exoduser-wt/_out/VRAM-01/.

## MAP PRODUCTION REPORT

STAGE: CH1-1 측정만. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK: 기존 소스 보존. CAMERA QA: 메모리 캡처만, 신규 맵 품질 승인 없음. TECH QA: GPU 메모리 표와 원시 덤프 참조. FILES: stage-owned 수정0 / concurrent touched0. GIT: 전용 review branch, 배포0. VISUAL VERDICT: RETOUCH (상속된 맵/웹 차이 판정 유지; 이번 변경으로 PASS 선언 없음). NEXT PASS: 익명·내부 GPU 계수 분해; 맵팀과 별도 통합 경계 검토.

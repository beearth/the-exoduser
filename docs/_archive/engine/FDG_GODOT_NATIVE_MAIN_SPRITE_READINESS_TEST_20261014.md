> **2026-10-14 실제 Main 캐릭터 자원 검사 연결:** 기존 Player/Warrior에 source-backed 기대 정의와 읽기 전용 Inspector를 연결했다. 새 실제 Main 첫4그룹/29검증 PASS(2.2916115초), native_loaded_resources READY. 현재 방향8×모드4=32 animations/216frames/9텍스처, 방향별2/8/8/9장·1.25/7.5FPS; 목표24고유장·24FPS 충족0/32. region bounds 오류0은 원화·치마/모델 품질 해결 증거가 아니다. source wait/GPU/전체 startup·공개 플레이는 NOT_PROVEN/미인수; 성공 suite 재실행0. [Main 연결 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md).

# FDG Godot 실제 Main 스프라이트 준비 소비자 검사 (2026-10-14)

상태: 새 소비자 테스트 작성 완료, **실행 전**. 이 문서의 예정 assertion은 PASS 증거가 아니다. 실행·격리 stage·최종 UID·checkpoint는 ENGINE 총괄이 소유한다.

| 항목 | 정확한 범위 |
|---|---|
| 소유 코드 | `godot/tests/test_native_main_sprite_readiness.gd` 새 파일만 |
| 실제 제품 API | Main `get_native_player_sprite_readiness()`, `get_native_player_sprite_startup_snapshot()` |
| 기대 정의 | production `native_player_sprite_expectation.gd`가 기존 Player 빌더·combat 데이터를 사용해 공급. 실제 관측 SpriteFrames를 기대 정의로 복사하지 않음 |
| 검사기 | 기존 source 포트 `native_sprite_resource_readiness/producer.gd`의 공개 `inspect` |
| 실행 episode | 동일 cold Main 1개 → SceneTree 진입 1회 → 통상 `process_frame` 1회 → 동기 공개 읽기 → 실제 Player queue_free → Main free |
| 자료 출처 | `godot/scripts/player.gd` `DIRECTIONS`·`_build_sprite`, `godot/data/combat.json` player, 검사기 공개 결과 계약 |
| 이전 검사 | 기존 원 검사32 case·117/145/88/71 및 그 fixture 읽기·복사·실행 0 |

## 예정 그룹과 assertion

| 그룹 | assertion 수 | 목적 |
|---|---:|---|
| `cold_actual_main` | 6 | Tree 전 공개 reader 유효·명시 NOT_READY·좁은 native scope·startup 읽기0/report 빈값 |
| `actual_main_existing_player_resources` | 13 | 실제 Main/Player/Warrior 수명·32 animations/216 frames·9 CompressedTexture2D·atlas 범위 오류0·실제 `_ready` 소비1회와 narrow scope |
| `synchronous_readonly_live_getter` | 5 | 동기 공개 재조회 결과 동일·기존 노드/actor transform/velocity/animation 불변·검사기 효과6종0·startup 소비 재실행0 |
| `actual_player_and_main_lifecycle` | 5 | 실제 Player queue_free 직후 NOT_READY/실제 읽기0·cached READY 승격 금지·Main free 뒤 callable invalid(호출0) |
| 합계 | **29** | 신규 실제 Main 생성자 **1회**, 단일 소비자 episode |

출력 marker는 `NATIVE_MAIN_SPRITE_READINESS_FIRST`이며 JSON에 각 그룹 assertion 수·실패 목록·실제 생성자1회·`source_origin=actual_current_native_Main_existing_Player_Warrior`를 기록한다. 실패0이면 exit0, 아니면 exit1이다. 파일 쓰기·원 PNG/캐시 hash·자원 import·추가 body·가짜 current 값·private physics/clock 호출은 없다.

## 자원 준비와 사용자 품질 목표의 구분

| 항목 | 현재 정의 / 기대 보고 |
|---|---|
| 방향 / mode | 기존 8방향 × idle/walk/source_attack/attack 4종 = 32 animations |
| 현재 장수 | 방향당 2/8/8/9 = 27, 전체 **216 AtlasTexture frames** |
| 현재 clip 속도 | idle `60/48=1.25FPS`, 나머지 `60/8=7.5FPS` |
| 기존 공급 texture | 방향 PNG8 + `attack-bat-v1.png`1 = 고유 **9 CompressedTexture2D** |
| 사용자 목표 | animation별 실제 고유 **24장 + 24FPS** |
| 현재 품질 판정 | `quality_target.unique_frames=24`, `fps=24`, `animations_total=32`, `animations_meeting=0`, `met=false`, `readiness_gate=false` |
| native 자원 READY | 기존 실제 Texture2D/atlas/region이 현재 빌더 정의와 맞는지 한정. 잘린 의상/모델 자체의 시각 품질을 보장하지 않음 |
| 원본 startup / GPU | `source_wait_complete/gpu_upload/gpu_render=NOT_PROVEN`, `source_wait_publisher=UNCONNECTED`, source wait·stage 게시 false |
| 전체 게임 | `full_main_ready/public_play_proven/automatic_source_regeneration_bound=false`. 공개 픽셀/성능/전체 이식 완료로 승격하지 않음 |

## docs 동기화와 인수 경계

작성 전 관련 native inspector 정본과 Player 빌더·combat 데이터를 읽었다. 새 코드 작성 뒤 전체 docs를 `rg -l` 및 `grep -r -l -E`로 `native_sprite_resource_readiness|native_player_sprite_expectation|get_native_player_sprite_readiness|24FPS|24프레임|24장` 검색했으며 두 검색 모두 **118개 문서**가 매칭됐다. 과거 시점의 완료/실패 기록을 새 검사 상태로 덮어쓰지 않고 본 문서에 현재 API·29 assertion·32/216/9·24장/24FPS 격차를 기록한다. 공통 문서·Main·adapter·원 검사기·Git은 다른 담당 소유다. `docs/2_3 돌진+패링+방패시스템/` 수정0.

실제 격리 실행 결과·elapsed·stderr·실패/수리 이력은 첫 실행 후 총괄이 이 문서에 보충해야 한다. 기술 검사는 시각 검수 대체가 아니다. 이번 테스트 범위의 **VISUAL VERDICT: RETOUCH** — 새 공개 pixels·의상/모델/24고유원화/전체 VFX·GPU 검수 미실시.

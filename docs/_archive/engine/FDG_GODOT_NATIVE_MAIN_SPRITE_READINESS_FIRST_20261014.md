> **2026-10-15 native 현행:** 실제 Main 정지 UI에서 전사0/실버테일1 선택→실제 Player/profile/시트/발앵커를 연결했다. 원본 localStorage charIdx 복원은 미구현,선택 전 indexnull. 아래 고정 Warrior/selector 미구현 문구는 이전 이력이다. [현재 계약·새 검수·MAP PRODUCTION REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약).

| 변경 항목 | 현재 계약 |
|---|---|
| 선택0 / 선택1 | idle2/walk8·4/source_attack8·4/ready attack9·9,표시scale2.0·1.3. 원본R remaster 우선. 24고유장·24FPS 미달. |
| live API | Main.read_native_character_selection()(0)→Player.apply_native_character_selection(reader)(1)→get_native_character_profile_snapshot()(0). 유실시NR/본체숨김/새공격거부. original_storage_restoredfalse/latest_full_gamefalse. |
| 새 소비 / 검수 | 승인Silver body8+spin1 PNG9원바이트 최초소비. 최종격리GPU26PASS/새4프레임. publicplayfalse/VISUAL RETOUCH. 원수치/QE/physics/geometry/save/사용자창 불변. |

> **2026-10-14 실제 Main 자원 실패 시작 중단:** 현재 Main은 sprite 검사 NOT_READY에서 새Player/source holders/World를 정리하고 physics/input off 후 camera/HUD/capture 생성 전 종료한다. 새 실제Main negative episode1/원Warrior public lifecycle fault1/첫12검증 PASS(1.851974083초), 예상push_error1·예상밖ERROR0/SCRIPT0/WARNING0/수리재연0. 이전99f6의29검증은 동결. 캐릭터24장·24FPS/model/치마 품질·source startup/GPU 미완은 유지한다. [실패 경로 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST_20261014.md).

# Godot 실제 Main · 기존 Player 자원 검사 연결 · 2026-10-14

실제 Main `_ready`가 기존 Player/Warrior를 읽기 전용 검사기에 연결한다. 신규 실제 Main 소비자 첫 실행 4그룹/29검증 PASS. **native_loaded_resources만 READY이며 고유24장·24FPS, 치마/모델 품질, 전체 시작·GPU·공개 플레이는 미인수다.**

## 코드·공개 계약

| 파일 / API | 현재 값·동작 |
|---|---|
| scripts/main.gd `get_native_player_sprite_readiness()` | 현재 실제 Main·Player·World 동일 Tree/custody와 World.player 동일 객체를 확인. 기존 ready Player를 inspector root로 공급. cold/queued/missing/identity loss → NOT_READY; 이전 READY 캐시로 대체하지 않음 |
| `_ready` 연결 위치 | Player add_child / World.set_player / source resource bind 직후, signal·camera·capture·HUD 생성 전. startup_readonly_calls 1. Main은 자신의 ready 전파 중이며 검사 root는 이미 ready인 Player |
| `get_native_player_sprite_startup_snapshot()` | 최초 report deep-copy, startup_readonly_calls. cold report={} / calls0; 실제 startup report READY / calls1. 현재 상태 검사는 live getter 사용 |
| Main capture metadata | `native_player_sprite_readiness`에 최초 스냅샷 기록. QA telemetry이며 gameplay save나 시작 완료 신호가 아님 |
| scripts/native_player_sprite_expectation.gd `static build()` | `fdg-native-sprite-resource-expectation-v1`; Player 하위 Warrior, AnimatedSprite2D. 생산 Player 정의 기반의 fresh descriptor; 관측 SpriteFrames를 기대값으로 복사하지 않음 |
| port_modules/native_sprite_resource_readiness/producer.gd `static inspect(root, expected)` | ROOT final 22,907B / SHA256 23cad7bf66e363d9c941e5f076858e9470d3ee264110a0896487a58580bc5312 그대로 인수. 오류·bounds·현재 애니메이션·동기 fingerprint 검사 |
| report scope | schema fdg-native-sprite-resource-readiness-v1 / native_loaded_resources. full_main_ready=false / public_play_proven=false / automatic_source_regeneration_bound=false |
| source/GPU | source_wait_complete/gpu_upload/gpu_render=NOT_PROVEN; source_wait_publisher=UNCONNECTED; js_source_sprite_wait_published/stage_complete_published=false |

## 현재 생산 애니메이션과 요청 목표

| 모드 | 방향 수 | 방향별 frame 수 | 재생 FPS | loop | region |
|---|---:|---:|---:|---|---|
| idle | 8 | 2 | 60/48=1.25 | true | body ((0+i)×48,0,48,48) |
| walk | 8 | 8 | 60/8=7.5 | true | body ((2+i)×48,0,48,48) |
| source_attack | 8 | 8 | 7.5 | false | body ((10+i)×48,0,48,48) |
| attack | 8 | 9 | 7.5 | false | attack (i×80, direction×80,80,80) |
| 합계 / 목표 | 8×4=32 animations | 8×(2+8+8+9)=216 descriptors | 요청 24FPS | 목표 고유24장 | 9 backed texture paths (body8+attack1) |

quality_target={unique_frames:24,fps:24,animations_total:32,animations_meeting:0,met:false,readiness_gate:false}. 검사기의 unique_frames는 atlas 경로+region identity이며 픽셀 artwork 고유성 증거가 아니다. AtlasTexture region이 texture 범위 안에 있다는 검증은 원화의 치마·팔다리·무기 잘림이나 모델링 품질 해결 증거가 아니다. 기존 에셋·실제 재생 정의를 변경하지 않았다.

## 첫 실제 Main 소비자 검증

| 그룹 | 검증 수 | 결과 |
|---|---:|---|
| cold_actual_main | 6 | PASS; 같은 cold Main의 공개 getter NOT_READY, 최초 read0 |
| actual_main_existing_player_resources | 13 | PASS; 실제 Player/Warrior 32/216/9, bounds 오류0, 최초 소비1, 품질 목표0/32 |
| synchronous_readonly_live_getter | 5 | PASS; node/transform/velocity/animation 상태 불변, 같은 report, effects0, startup 추가 소비0 |
| actual_player_and_main_lifecycle | 5 | PASS; 실제 Player.queue_free → NOT_READY / read0; Main.free → 공개 Callable invalid, 호출0 |
| 합계 | 29 | 첫 4그룹 PASS / failed0 / exit0 / SCRIPT_ERROR0 / Parse0 / ERROR0 / WARNING1 |

첫 실행 2.2916115초. 실제 Main 생성자 episode1, product/test 수리0, 성공 suite 재실행0. ROOT 기존32-case/117/145/88/71 및 다른 완료 suite 읽기·복사·실행0. 이 checkpoint는 ROOT frozen 검사 파일을 포함하지 않고 producer와 새 Main consumer 검사만 인수한다. UID는 primary가 WORK와 stage 양쪽 부재를 확인한 뒤 신규3개만 생성: 0.480565459초/exit0/errors0/duplicate0/import0/runtime groups0.

격리 stage는 앞선 검증 코드/cache metadata 사본과 읽기 전용 assets/data/imported 링크를 사용했다. userdata=EXODUSER-MainSpriteReadiness-Isolated-20261014, qa/latest-session.json 생성false. 본 Main37406·브라우저·Node3333·gameplay save·기존 QA 입력/재개/재로딩0. 원래 Main/World/Player 생성자가 수행하는 다른 load·자동 physics tick은 집계하지 않았다. 검사기 자체 loads/image_reads/texture_allocations/nodes_added/draw_calls/waits=0이며 동기 read 구간 상태 불변이다. headless 관측을 1080p GPU 렌더·Windows240FPS·공개 픽셀 검수로 승격하지 않는다.

## 잔여 제작과 인수

| 잔여 항목 | 현재 판정 |
|---|---|
| 24 고유 캐릭터 이미지 + 24FPS | 미인수; 현재0/32. 프레임 반복·보간을 고유 artwork24장으로 계산하지 않음 |
| 치마/전신/무기 원화·모델 품질, 자연스러운 움직임, VFX | 실제 visual 검수 필요; 이번 resource bounds PASS로 해결 주장0 |
| JS sprite wait/timeout8000 | native resource inspector와 다른 원본 계약; publisher 미연결 |
| source startup8 post-stage /4 intro / G.on activation | actual owner completion 공급 없음. nativeREADY/initializer.completed/HUD를 원본 완료로 대체하지 않음 |
| map geometry/collision/outer mass/원근 | 변경0. 기존 frozenC ground/6 supported·10 unsupported·shipping5 유지 |
| 전체 게임/최소사양 성능/출시 | 미완료 |

VISUAL VERDICT: RETOUCH. 이번 산출은 실제 Main의 현재 자원 상태와 품질 격차를 드러내는 중앙 연결이다. 시각 PASS나 전체 엔진 완료가 아니다.

증거: E/dependency-native-main-sprite-readiness-first/{before-edit,stage-preparation.json,metadata/first-receipt.json,tests/attempt01-preledger.json,tests/attempt01-receipt.json,docs-search,checkpoint}. normal code+docs commit은 checkpoint/checkpoint-receipt.json에서 기록한다.

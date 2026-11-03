> **2026-10-15 native 현행:** 실제 Main 정지 UI에서 전사0/실버테일1 선택→실제 Player/profile/시트/발앵커를 연결했다. 원본 localStorage charIdx 복원은 미구현,선택 전 indexnull. 아래 고정 Warrior/selector 미구현 문구는 이전 이력이다. [현재 계약·새 검수·MAP PRODUCTION REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약).

| 변경 항목 | 현재 계약 |
|---|---|
| 선택0 / 선택1 | idle2/walk8·4/source_attack8·4/ready attack9·9,표시scale2.0·1.3. 원본R remaster 우선. 24고유장·24FPS 미달. |
| live API | Main.read_native_character_selection()(0)→Player.apply_native_character_selection(reader)(1)→get_native_character_profile_snapshot()(0). 유실시NR/본체숨김/새공격거부. original_storage_restoredfalse/latest_full_gamefalse. |
| 새 소비 / 검수 | 승인Silver body8+spin1 PNG9원바이트 최초소비. 최종격리GPU26PASS/새4프레임. publicplayfalse/VISUAL RETOUCH. 원수치/QE/physics/geometry/save/사용자창 불변. |

> **2026-10-14 실제 Main 캐릭터 자원 검사 연결:** 기존 Player/Warrior에 source-backed 기대 정의와 읽기 전용 Inspector를 연결했다. 새 실제 Main 첫4그룹/29검증 PASS(2.2916115초), native_loaded_resources READY. 현재 방향8×모드4=32 animations/216frames/9텍스처, 방향별2/8/8/9장·1.25/7.5FPS; 목표24고유장·24FPS 충족0/32. region bounds 오류0은 원화·치마/모델 품질 해결 증거가 아니다. source wait/GPU/전체 startup·공개 플레이는 NOT_PROVEN/미인수; 성공 suite 재실행0. [Main 연결 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md).

# FDG Godot · 실제 Player 스프라이트 검사 명세 (2026-10-14)

현재 `Player._build_sprite()`의 제작 정의를 읽기 전용 검사기에 전달하는 adapter다. 실제 관측된 `SpriteFrames`를 기대값으로 복사하지 않는다. 이 단위의 Godot 실행·UID 생성·기존 성공 검사 재실행은 0이며, 실제 Main 연결과 신규 소비자 검사는 중앙 엔진 담당 범위다.

| 소유 파일 / 공개 API | 계약 |
|---|---|
| `godot/scripts/native_player_sprite_expectation.gd` | `extends RefCounted`, 공개 `static build(profile:Dictionary={}) -> Dictionary` (0~1인자) |
| 반환 schema | `fdg-native-sprite-resource-expectation-v1` |
| 호출 | `Inspector.inspect(actual_main.player, Expectation.build())`; root는 실제 Player, 상대 하위경로 `Warrior`, target id `player_warrior`, class `AnimatedSprite2D` |
| 컨테이너 | 매 호출 fresh Dictionary/Array. 실제 Player/Node/Texture/SpriteFrames 조회·로드·생성·변형 0 |
| 정의 검증 | 검사기 `inspect`가 schema·descriptor·실제 객체를 검증한다. adapter가 READY나 source 완료를 반환하지 않으며, schema 불일치는 검사기의 `expected_definition_invalid` |

## 기존 미선택 Warrior 제작 정의와 수치

1차 근거는 `godot/scripts/player.gd:12 DIRECTIONS`와 `:701-725 _build_sprite`다. `godot/data/combat.json:26-30`의 frame count 및 idle ticks도 현재 빌더와 일치한다. adapter는 파일을 실행 중에 다시 읽거나 combat 데이터를 로드하지 않는 명시적 생산 명세이며, 빌더 변경 시 함께 갱신해야 한다.

| ID / mode | 방향별 frames | body offset | cell | speed FPS | loop | region / 자원 |
|---|---:|---:|---:|---:|---|---|
| `idle_<direction>` | 2 | 0 | 48×48 | 60/48 = 1.25 | true | `Rect2((0+i)*48,0,48,48)`; `res://assets/player/<direction>.png` |
| `walk_<direction>` | 8 | 2 | 48×48 | 60/8 = 7.5 | true | `Rect2((2+i)*48,0,48,48)`; 同上 |
| `source_attack_<direction>` | 8 | 10 | 48×48 | 60/8 = 7.5 | false | `Rect2((10+i)*48,0,48,48)`; 同上 |
| `attack_<direction>` | 9 | 적용 안 함 | 80×80 | 60/8 = 7.5 | false | `Rect2(i*80,d*80,80,80)`; `res://assets/player/attack-bat-v1.png` |

`direction` 순서와 attack의 `d`는 `[south, south-east, east, north-east, north, north-west, west, south-west]`의 index 0..7이다. 각 mode의 `i`는 0..frames−1. 방향 8 × mode 4 = **32 animations**, 8×(2+8+8+9) = **216 frame descriptors**, backing resource 경로 **9개**(body8 + attack1)다. `exact_animation_names=true`, 각 animation의 `exact_frame_count=true`다. Texture descriptor는 `AtlasTexture`, 그 atlas는 실제 공급 형식 `CompressedTexture2D`와 정확한 `res://` 경로, `region`은 Godot `Rect2` 값이다. 빌더가 별도 설정하지 않는 margin/filter_clip/duration은 기대값에 추가하지 않는다.

| 코드 상수 | 값 / 적용 |
|---|---|
| `EXPECTATION_SCHEMA` | 위 expectation schema |
| `DIRECTIONS` / `MODES` | 위 순서 8개 / idle·walk·source_attack·attack |
| `MODE_FRAME_COUNTS` | idle2 / walk8 / source_attack8 / attack9 |
| `BODY_FRAME_OFFSETS` | idle0 / walk2 / source_attack10 |
| `BODY_CELL_SIZE` / `ATTACK_CELL_SIZE` | 48 / 80 |
| `ANIMATION_TICKS_PER_SECOND` | 60.0, 빌더의 FPS 계산 분자이며 화면 성능 측정값 아님 |
| `IDLE_FRAME_TICKS` / `OTHER_FRAME_TICKS` | 48.0 / 8.0 |
| `BODY_PATH_PREFIX` / `ATTACK_PATH` | `res://assets/player/` / `res://assets/player/attack-bat-v1.png` |
| `QUALITY_UNIQUE_FRAMES` / `QUALITY_FPS` | 24 / 24.0, 사람의 요청 목표를 보고용 `quality_target`에만 전달 |

## 24장·24FPS 목표와 현재 검사 범위

요청 목표는 **실제 고유 그림 24장과 재생 24FPS 모두**다. 현재 2/8/8/9장 및 1.25/7.5FPS 명세가 목표를 충족하는 것으로 바꾸지 않는다. 정상 공급이 일치하면 검사기의 resource `status=READY`일 수 있으나 quality `animations_total=32`, `animations_meeting=0`, `met=false`, `readiness_gate=false`가 기대된다. 이 숫자는 실제 Main 검사 전에는 기대값이며 새 런타임 관측 증거가 아니다.

검사기의 `unique_frames`는 atlas 경로와 region의 서로 다른 **자원 영역** 개수다. 픽셀을 읽거나 비교하지 않으므로 24 영역이 있어도 24개의 서로 다른 원화임을 증명하지 못한다. 또한 atlas 영역이 파일 크기 안에 들어가는지 검사해도 의상·치마·손·발의 픽셀 잘림이나 모델 품질까지 판정할 수 없다. 고유 원화·실루엣·부드러운 움직임·가림·실전 화면 검수는 별도의 미완료 인수 조건이다.

`native_loaded_resources` 준비는 JS `_waitObjSprites`/전체 stage 준비, GPU upload/render, source G.on 활성화, 자동 회복, 프레임 성능, 24장·24FPS 제작 완료로 승격하지 않는다. 이 adapter의 스프라이트/node 추가·이미지/Texture 로드·hash/import·clock/state 쓰기·사용자 paused 화면 접근·Git 변경은 0이다.

| 검증 / 후속 | 상태 |
|---|---|
| 생산 정의·검사기 schema 대조 | 소스 읽기 완료; 실제 관측 프레임의 기대값 복제 0 |
| Godot 실행 / 신규 runtime PASS | 0 / 중앙 신규 소비자 검사 대기 |
| Main production hook | 중앙 엔진 담당 소유, 이 adapter에서 변경 0 |
| 시각 판정 | **VISUAL VERDICT: RETOUCH** — 새 pixels 검수 0, 고유24장·24FPS·모델 및 잘림 문제 미해결 |

관련 계약은 [읽기 전용 검사기 정본](FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md)과 [캐릭터 품질 정본](FDG_CHARACTER_QUALITY.md)을 따른다. 보호 문서 `docs/2_3 돌진+패링+방패시스템/` 및 기존 전투 수치·Q/E·원 PNG·save는 변경하지 않는다.

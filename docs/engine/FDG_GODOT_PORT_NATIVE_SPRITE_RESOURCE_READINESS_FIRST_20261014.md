## 2026-10-14 원본 OBJ 실제 생성·현재 참조 반영

| 현재 범위 | 구현·최초 검증 |
|---|---|
| sameMain/World actualoriginal | sourcekeys285→actualRaw265(initial33+deco230+dragon2)/sharedgroups11·sharedkeys31·alias20. native28/approx23과구분. realrequest265/deferred38→CPUCanvas33(hard14/key14/edge4/luma1), CSS5exactunsupportedNR. |
| 실제currentfields/lifetime | firstd.id만Canvas교체/aliasraw유지. OBJCanvascompletetrue/실NWNH/srcdeclaredUndefined; extra3undefined정책과scope·epoch분리. sameRaw230decoerrorFB64retry코드/actualfallbackruntime0. cancelobjectonly/exit각registry철회. |
| 미완권위 | CSS5processinggap+edge原_METAwritegap4; wholeOBJpublication/Wait/StageNR/sourceG.onfalse. nativeGPU/BrowserCanvaspixelparity/24unique24FPS미완. |
| 새resource·검수 | 신규original184/179358354B/sourcehash184+desthash184/byteidenticalcopy184/import184exit0/sidecar184. exactalready2재사용·oldproof/hash/copy/import0. actualMain1 FIRST14/14 PASS8.48416초/ERROR0/CameraWarning1/product수리0/oldsuccess재연0. signal828=265construct+265pending+265loaded+33Canvas. |

정확 API·수치·원필터5·edge4·특수필드·신규184bytes와미완경계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ 실제 생성·현재 참조 이식」을 따른다. 이전257missing은nativepathsubset이력이고원original현재285refs와구분한다. 285keys≠265Images≠186originalfiles≠new184를구분한다.

MAP PRODUCTION REPORT: registry/resourceonly,geometry/nav/collision/placement/outermass/기존renderer변경0; CAMERA QA미실행/TECH새14scope만. **VISUAL VERDICT: RETOUCH.**

> **2026-10-14 실제 Main 자원 실패 시작 중단:** 현재 Main은 sprite 검사 NOT_READY에서 새Player/source holders/World를 정리하고 physics/input off 후 camera/HUD/capture 생성 전 종료한다. 새 실제Main negative episode1/원Warrior public lifecycle fault1/첫12검증 PASS(1.851974083초), 예상push_error1·예상밖ERROR0/SCRIPT0/WARNING0/수리재연0. 이전99f6의29검증은 동결. 캐릭터24장·24FPS/model/치마 품질·source startup/GPU 미완은 유지한다. [실패 경로 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST_20261014.md).

> **2026-10-14 실제 Main 캐릭터 자원 검사 연결:** 기존 Player/Warrior에 source-backed 기대 정의와 읽기 전용 Inspector를 연결했다. 새 실제 Main 첫4그룹/29검증 PASS(2.2916115초), native_loaded_resources READY. 현재 방향8×모드4=32 animations/216frames/9텍스처, 방향별2/8/8/9장·1.25/7.5FPS; 목표24고유장·24FPS 충족0/32. region bounds 오류0은 원화·치마/모델 품질 해결 증거가 아니다. source wait/GPU/전체 startup·공개 플레이는 NOT_PROVEN/미인수; 성공 suite 재실행0. [Main 연결 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md).

# FDG Godot 포트 · 네이티브 스프라이트/리소스 준비 검사기 최초 구현 (2026-10-14)

> 상태: 읽기 전용 consumer 기술 마감 / **첫 실제 Main 격리 episode의 새 32 case PASS**. 실제 Claude가 코드·검사 초안을 작성하고 Codex executor가 새 검사만 실행했다. `readiness_scope=native_loaded_resources` 한정. JS `_waitObjSprites` 완료·stage_complete 게시 0, GPU 업로드/렌더 NOT_PROVEN. 이 검사기의 source wait publisher 연결은 UNCONNECTED이며 전체 stage 완료 판정이 아니다.

## 파일 소유

| 파일 | 역할 |
|---|---|
| godot/port_modules/native_sprite_resource_readiness/producer.gd | 읽기 전용 검사기. 공개 `inspect(root, expected)` 정적 함수 |
| godot/port_modules/native_sprite_resource_readiness/test_first.gd | 신규 실제 Main 생성자 1회 episode 검사(SceneTree 스크립트, 자체 quit) |
| docs/engine/FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md | 본 문서 |

공유 Main/Player/World/sourcewait/clock/assets/Git는 다른 소유자 범위이며 이번 변경 0.

## 원본 근거 (읽은 범위만)

| 근거 | 내용 |
|---|---|
| game.html:18787-18800 `_waitObjSprites(timeout)` | `_OBJ_SPR`·추가 이미지(보스룸/관문/ground tile 등)의 `complete`·`naturalWidth`를 50ms `setTimeout`로 폴링, 모두 완료 **또는** `Date.now()-t0>timeout`이면 resolve. 즉 JS 대기 완료는 timeout(호출자 8000)으로도 끝나며 "디코드 완료"를 증명하지 않는다. 네이티브 검사 READY ≠ JS wait 완료/timeout. 검사기는 이 대기·timeout·clock을 재현하지 않는다 |
| stage scripts/player.gd:12 `DIRECTIONS` | south, south-east, east, north-east, north, north-west, west, south-west (8) |
| stage scripts/player.gd:701-725 `_build_sprite` | `Warrior` AnimatedSprite2D, `SpriteFrames.new()`에서 default 제거. 방향8×모드4(idle/walk/source_attack/attack). count idle2/attack9/그외8, body offset idle0/walk2/source_attack10, speed 60/48(idle)·60/8, loop idle·walk만. body: `res://assets/player/<dir>.png` region((offset+i)×48,0,48,48). attack: `res://assets/player/attack-bat-v1.png` region(i×80, dir×80, 80,80). margin/filter_clip 미설정(기본값) |
| stage scripts/player.gd:291-309 `_ready` | `_build_sprite()`는 Player가 트리에 들어갈 때 실행 → Warrior는 실제 생성자 산물 |
| stage scripts/main.gd:30-123 `_ready` | World→Player 생성·source 초기화 후 `add_child(player)`. 공개 필드 `player`. 실패 시 early return(player null 가능) |
| stage data/combat.json `player` | idle_frames2 / walk_frames8 / source_attack_frames8 / current_attack_frames9 / idle_frame_ticks48 |

요구 집합: 32 animations / 216 frames(8×(2+8+8+9)) / 고유 텍스처 9(body8 + attack1).

## 공개 API

`Inspector.inspect(root: Variant, expected: Variant) -> Dictionary` (`preload("res://port_modules/native_sprite_resource_readiness/producer.gd")`)

- root: 호출자가 공급한 **기존** Node(Main 또는 Player). 검사기는 이 root 안의 명시된 상대 경로를 조회하며 노드를 생성하거나 다른 Tree에 붙이지 않는다.
- expected: 호출자가 실제 production 상수/데이터로 만든 정의. 검사기는 정의를 생성하지 않는다.

### expected 정의 (schema `fdg-native-sprite-resource-expectation-v1`)

| 필드 | 계약 |
|---|---|
| source | 비어있지 않은 Dictionary, 값은 모두 비공백 String(원본 위치 참조). 없으면 NOT_READY |
| targets[] | id(고유) / node_path(root 기준 상대 하위경로, 절대·`.`·`..`·subname 거부) / class `AnimatedSprite2D`\|`Sprite2D` |
| AnimatedSprite2D | exact_animation_names(bool, 선택) / animations[]{name 고유, loop?, speed?, exact_frame_count?, frames[]{index 고유≥0, duration?, texture}} |
| Sprite2D | texture 하나 |
| texture | class. `AtlasTexture`이면 atlas{class, resource_path res://} + region(Rect2 명시, 또는 null=실제 기본 Rect2()) + margin? + filter_clip?. 그 외 class는 resource_path |
| quality_target | 선택 {unique_frames int, fps}. 보고 전용, readiness gate 아님 |

### 결과 (schema `fdg-native-sprite-resource-readiness-v1`)

고정 필드: `status` READY\|NOT_READY, `reason`(첫 오류 code), `errors[]{code,at,detail}`(정의 순서대로 결정적), `readiness_scope:"native_loaded_resources"`, `source_wait_complete:"NOT_PROVEN"`, `gpu_upload/gpu_render:"NOT_PROVEN"`, `js_source_sprite_wait_published:false`, `stage_complete_published:false`, `source_wait_publisher:"UNCONNECTED"`, `inspector_effects`(loads/image reads/allocations/nodes/draw/waits 모두0), `state_unchanged`, `targets[]`, `animations[]{target,name,frames,unique_frames,speed_fps,loop}`, `textures[]`(resource_path 정렬, class/width/height), `targets_inspected/animations_inspected/frames_inspected`, 선택 `quality_target`. instance id는 결과에 넣지 않아 동일 상태 재검사 결과가 같다.

### 판정 순서와 오류 code

1. expected 없음 → `expected_definition_missing`; 구조 오류 → `expected_definition_invalid`(트리 읽기 전 중단).
2. root 수명: `root_missing/not_node/freed/queued_for_deletion/not_inside_tree/not_ready`, 실행 중 main SceneTree(`Engine.get_main_loop()`)가 아니면 `root_foreign_tree`.
3. 동기 구간: 내부 fingerprint(root/target id·parent·children, animation/frame/frame_progress/playing/speed_scale, SpriteFrames·모든 frame texture/atlas id·region) → 읽기 → fingerprint. 다르면 `state_changed_during_inspection`. await/timer/clock 없음.
4. target: `target_node_missing`, `target_<lifecycle>`, `target_outside_supplied_root`, `target_class_mismatch`.
5. AnimatedSprite2D: `sprite_frames_missing`, `animation_unexpected`(exact일 때 미기술 실제 animation), `current_animation_missing`, `current_frame_out_of_range`, `animation_missing`, `animation_loop_mismatch`, `animation_speed_mismatch`, `animation_frame_count_mismatch`, `frame_missing`, `frame_duration_mismatch`.
6. 텍스처: `texture_missing/freed/not_texture2d/placeholder/class_mismatch/zero_size`, atlas `atlas_missing/freed/not_texture2d/placeholder/class_mismatch/path_mismatch/unloaded(CompressedTexture2D load_path 빈값)/zero_size`.
7. region: Godot AtlasTexture 의미 그대로 — region 축별 크기0이면 그 축은 atlas 크기(위치 유지). 클리핑 발명0. 실제 effective region이 atlas 밖이면 `atlas_region_out_of_bounds`, 원값 비교 `atlas_region_mismatch`(정확 비교, null 기대=Rect2()), 기대 region이 실제 atlas 밖이면 `expected_region_out_of_bounds`, `atlas_margin_mismatch`, `atlas_filter_clip_mismatch`.

경로·형태·메타데이터만으로는 READY가 되지 않는다. READY는 실제 Texture2D 객체·치수·atlas·region을 읽었을 때만이며 최소 1 target/frame 실제 읽기가 필요(`no_actual_resource_read`).

## 읽기 전용 제약

producer에 ResourceLoader/load/preload(자기 외)/Image/get_image/텍스처 생성·복사·hash/reimport/RenderingServer/draw/노드 추가/Timer/await/clock/source gate·cap·clamp 코드 없음. CPU에 로드된 Texture2D 객체의 존재·치수만 확인하며 GPU 업로드·실제 렌더·VRAM은 증명하지 않는다. 텍스처 로드는 원래 Main→Player `_build_sprite`의 `load()`가 수행한 것이며 검사기 로드 0. 검사기는 JS `source_sprite_wait` 완료나 stage_complete를 설정/게시하지 않는다.

## 24장/24FPS 목표 격차

현재 native 2/8/8/9 frames, speed idle1.25·그외7.5fps. 사람 목표 고유24장+24FPS를 32개 animation 모두 충족하지 않음(`quality_target.met:false`, meeting0 기대). READY는 "현재 정의된 리소스가 로드돼 있음"이지 품질 목표 충족이 아니다. 클립 증설/변환은 이번 범위 밖.

## 신규 검사 test_first.gd — 첫 실제 episode 32 PASS

단일 신규 실제 `preload("res://scripts/main.gd").new()` → 자기 SceneTree root에 add_child → `main.ready`(미완 시) await → `process_frame` 1회 await(root ready 전파 밖으로 나오기 위함; 원래 엔진 1프레임 진행이며 검사가 clock/필드/gate를 바꾸지 않음) → 동기 검사. 기대 정의는 player.gd `DIRECTIONS` 상수 + `_build_sprite` 리터럴 + combat.json 값으로 만들고 두 출처 불일치 시 실패. Image/Texture/Sprite.new·가짜 current·old test/proof 접근 0. 입력/UI/HUD/export/save 접근 0.

| case | 기대 |
|---|---|
| descriptor_source_agrees_builder_and_combat_json | combat 2/8/8/9·48 = 빌더 리터럴 |
| missing_expected_definition / missing_tree_root / missing_source_definition | NOT_READY expected_definition_missing / root_missing / expected_definition_invalid |
| actual_main_before_tree | 실제 Main(트리 진입 전) → root_not_inside_tree |
| actual_main_constructor_built_warrior | main.player/Warrior가 AnimatedSprite2D, parent=player |
| constructor_loaded_textures_cached | 9경로 `ResourceLoader.has_cached`(test의 조회 전용; 생성자 로드 증거, 검사기 로드0과 구분) |
| actual_warrior_ready_from_main / _from_player | root=Main(`Player/Warrior`), root=Player(`Warrior`) 모두 READY |
| positive_counts_32_animations_216_frames | 32/216/9 |
| positive_deterministic / positive_state_unchanged | 재검사 동일 결과, test 독립 fingerprint(Main/Player children, Warrior parent/children, SpriteFrames, animation/frame/progress/playing, 216 texture/atlas id·region) 불변 |
| current_frames_do_not_meet_24_unique_24fps | quality met false, meeting0, readiness_gate false |
| absolute_node_path / parent_escape_node_path | expected_definition_invalid |
| missing_node / wrong_class_player_body / sprite2d_descriptor_on_animated_warrior | target_node_missing / target_class_mismatch ×2 |
| invalid_frame_index_descriptor / invalid_region_descriptor | expected_definition_invalid |
| missing_actual_animation / undescribed_actual_animation / missing_actual_frame | animation_missing / animation_unexpected / animation_frame_count_mismatch(추가 errors에 frame_missing) |
| region_mismatch / expected_region_out_of_actual_atlas / empty_default_region_not_invented | atlas_region_mismatch / atlas_region_mismatch(추가 errors에 expected_region_out_of_bounds) / atlas_region_mismatch |
| atlas_path_mismatch / current_speed_not_24fps | atlas_path_mismatch / animation_speed_mismatch |
| negative_cases_state_unchanged | 모든 negative 후 fingerprint 불변 |
| own_main_detached / own_main_freed / own_player_freed | 자기 fixture 종료 단계: root_not_inside_tree / root_freed / root_freed |

출력: `NATIVE_SPRITE_RESOURCE_READINESS_FIRST <JSON>` 1줄, 실패0이면 exit0, 아니면1. 파일 쓰기0.

## 미검증·공급 대기

- **Sprite2D 분기 실제 fixture: UNVERIFIED_SUPPLIER_MISSING.** 확인된 stage 공급 노드는 AnimatedSprite2D Warrior뿐이며 실제 Sprite2D 공급 노드 경로는 미제출. 가짜 Sprite2D 생성0. 코드 경로는 구현되어 있으나 실제 READY 증거 없음.
- 실제 깨진/누락 텍스처 negative: 공유 production 리소스를 변형하지 않기 위해 미실시. 실제 누락 소스는 별도 승인 공급이 필요.
- headless(dummy renderer)에서 CompressedTexture2D 치수는 import 메타데이터 기반이며 GPU 업로드 증명 아님.
- 실제 객체에서 body8개 각각 **1008×48**, attack1개 **720×640**를 읽었다. 실제 region bounds와 exact 기대 region을 확인했으며 PNG 파일 재해시·이미지 픽셀 읽기·재import는 0이다. 부족한 다른 공급 리소스를 준비 완료로 대체하지 않는다.
- 이 검사기의 source wait publisher adapter는 미연결; READY를 sourcewait/stage gate 완료로 게시하지 않는다. 다른 중앙 작업의 전체 설치 상태는 이번 격리 공급 증거로 확정하지 않는다.

## Executor closure 메모

- 공급 원천(동결 a465 stage): `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/dependency-source-player-initialization-first/stage/godot`.
- 실제 격리 stage GD closure **64개 = 자기2 + 동결 supplier production62**. project.godot를 격리 userdir로 복사하고 cache metadata는 `uid_cache.bin/global_script_class_cache.cfg/.gdignore` 3개만 복사했다. `assets/data/.godot/imported`는 기존 공급의 readonly symlink를 재사용했다. 기존 tests/test*.gd 복사·읽기·Grep·실행 0; 이미지 복사/hash/reimport 0.
- custom user dir: `EXODUSER-NativeSpriteReadiness-Isolated-20261014`.
- 첫 actual 실행: Godot 4.7.2.stable.official.ed1daf0bf `--headless --path fixture-attempt2 --script res://port_modules/native_sprite_resource_readiness/test_first.gd`. exit0, **2.123318292초**, stderr0/SCRIPT_ERROR0/Camera warning0. 경고가 있었다는 주장으로 바꾸지 않는다.

## 관련 문서·checkpoint

허용 키워드 검색 기준 관련 정본: [FDG_SOURCE_SCENE_EXECUTION](FDG_SOURCE_SCENE_EXECUTION.md)(decode readiness=ENGINE_IMPLEMENTATION, 필수 image ready 전 start 거부), [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)(prepare 실제 decoded 치수 gate, 24장/24FPS 목표·일괄 변환0). INGAME 캡처 스튜디오 마케팅 문서는 제외. 이 문서들의 갱신과 normal code+docs checkpoint는 중앙 소유이며 이번 변경에서 편집0.

## 실제 작성·첫 실행 ledger

| 항목 | 최초 관측 및 한계 |
|---|---|
| 실제 Claude | `/Users/fordeargamers/.local/bin/claude`, default configured `claude-opus-5-5`, PID45000, session `0bcf9f19-ddfa-4699-b586-4972681628b8`, 550989ms, success, permission denial0 |
| 권한 | restricted/dontAsk. Read는 자기3·canonical1·동결 stage Player/Main/combat3·관련 정본docs2의 정확9경로. Write/Edit는 자기3만. Glob/Grep/Bash/MCP/GUI/Agent/settings/권한우회0. 기존 test Read/Grep 재발0 |
| 수정 전 | 자기3 WORK/HEAD 부재를 외부 `prewrite.json`에 기록. 실제 parent 경로 확인, 타인 편집/Git 변경0 |
| staging 첫 preflight | `.gdshader`의 `.gd` 접두를 closure regex가 오인하여 Godot 호출 전 종료. 검사0, 제품·검사 수정0. 부분 stage 보존. exact `.gd` token regex만 교정 |
| 첫 실제 검사 | 위 preflight 이후 첫 Godot 실행이 32 case PASS/FAIL0. INVALID runtime0. 제품·검사 수리0, 이전 성공 suite 실행0, 전체32 재실행0 |
| actual supplier | 동결 a465 Main 생성자 1회가 Player/Warrior를 생성. 32 animation/216 실제 AtlasTexture frame/고유 CompressedTexture2D9를 조회. actual Main 안의 노드를 새 inspector가 생성한 것은 아니다 |
| 양성 검사의 반복 의미 | 같은 첫 episode 안에서 determinism을 위해 Main root를 두 번, Player root를 한 번 검사했다. 이는 첫 새 case의 비교이며 성공 suite 재실행이 아니다 |
| 원 생성자 texture load | Player `_build_sprite`는 attack1 + 방향8 = 9개 원 load 호출. test는 해당9경로 cache 확인, 검사기 load0. World/Main 다른 load 총수는 이번에 집계하지 않았다 |
| clock / render | Main.ready 뒤 process_frame await1. 자동 physics tick 수를 계측하지 않았으므로 0 또는 특정 tick 수로 추정하지 않는다. inspector의 동기 구간에는 await/clock·상태 쓰기0이고 before/after unchanged |
| 화면 크기 | headless Main이 관측한 viewport64×64. project의 1920×1080 설정과 별개이며 1080p render/GPU/public pixels/FPS 증거0 |
| 원 constructor marker | `FIRST_PLAYABLE_READY` 로그는 격리 constructor marker. 이번에 공개 플레이 또는 sourcewait/stage 완료로 승격하지 않았다 |
| Sprite2D | 실제 양성 공급 fixture 미제출: UNVERIFIED_SUPPLIER_MISSING. AnimatedSprite2D에 Sprite2D 기대를 적용한 거부 case는 통과했지만 실제 Sprite2D READY 증거는 없다 |
| 품질 목표 | actual 현재2/8/8/9·1.25/7.5fps. 고유24장+24FPS 목표 0/32 충족. quality gate0이며 READY로 품질 미완을 숨기지 않는다 |
| 보호 | 인간 Main/Web/브라우저 입력·재개·재로딩0, 기존 배송 export/server/save/userQA 조작0. 자기 fixture 종료 시 detach/free만 수행 |
| 후속 중앙 seam | 기존 실제 Tree와 source-backed 기대 descriptor를 `inspect`에 공급하고 오류를 소비해야 한다. sourcewait/publisher/전체 stage·GPU/24장 소비는 ENGINE 소유 |

외부 증거: `E/godot-native-first/team-port/native_sprite_resource_readiness/{claude-launch.json,claude-init.json,claude-result.json,stage-preflight-attempt1.json,test-attempt2.json,first-result.json,test-ledger.json,handoff.json}`. 이 모듈의 code/test와 첫 성공 기록은 동결하며 normal code+관련 docs checkpoint는 ENGINE에 인계한다.

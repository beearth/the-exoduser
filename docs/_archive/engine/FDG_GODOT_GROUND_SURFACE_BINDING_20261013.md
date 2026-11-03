# FDG Godot ground surface 실제 World binding — 2026-10-13

현재 상태: **실제 soil/litter underlay World 연결 및 신규 고유3 첫 실행 PASS**. 부모 fresh isolated stage에서 7.013840624999999초 / exit0 / ERROR0 / assertion0을 확인했다. 제품·검사 수리0, 성공 재실행0이다. 기존 MAP_RESOURCE의 soil/litter/Surface/Provider 성공은 동결된 다른 단위이며 재실행하거나 이번 binding PASS로 합산하지 않는다. 두 원 PNG 첫 복사·hash와 첫 Resource import는 부모 소유다. 공개 GPU 픽셀·교전·240FPS는 미검수이며 **VISUAL VERDICT: RETOUCH**를 유지한다.

## 1. 소유·선행·백업

| 항목 | 정확 범위 |
|---|---|
| worker 제품 | `godot/scripts/native_ground_surface_adapter.gd` 신규1. 부모 actual engine metadata `native_ground_surface_adapter.gd.uid=uid://ihqsym671uiu` 공급; worker 재생성0 |
| worker 검사 | `godot/tests/test_native_ground_surface_binding.gd` 신규3, `--only=<group,...>` 지원. worker 실행/import/Git/GUI0 |
| worker 문서·외부 | 이 정본과 `dependency-ground-surface-integration-first/worker/`만 |
| 부모 제품 | 실제 World `get_native_map_surface_context()`/startup 안전 설치, canonical 원 PNG2 첫 byte copy/hash, fresh stage에서 실2개만 첫 import/첫 실행/normal checkpoint |
| 기존 Root 모듈 | `map_resource/ground_surface.gd`, `ground_provider.gd`, `producer.gd`, `litter.gd` 실제 API 재사용. 수정·옛 MAP12/Provider missing branch 성공 suite 재실행0. [기존 정본](FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md)의 역사 본문 동결 |
| 선행 | 기존 map_resource 정본/API를 먼저 읽었다. map guide1047행 FULL retained 및 SSOT 순서/§23 적용. 원 layout/collision/source16/기완료 PNG·proof 재감사0 |
| 실제 parent | `f070f8a4129073acbc1b00d4b8750e70e32fda2e` |
| 백업·부재 | 부모 `before-edit-receipt.json`: World WORK=HEAD 사전 byte backup, 새 adapter/test/doc WORK·HEAD 부재. worker `before-write-owned-absence.json`은 신규 adapter/uid/test/doc WORK 부재. worker Git0 |

## 2. 원 자원과 값 — 새 조정 없음

부모 `assets-first/original-first-copy-receipt.json`의 **원 이미지2장 각각 최초 sourcehash2/targethash2**가 권위다. 새 이미지4장이라는 의미가 아니다. 합5643601B를 원 byte 그대로 복사했고 resize/수정0이다. worker는 원 PNG bytes를 열거나 hash/copy/resize/import하지 않았다.

| pass | canonical R source → 실제 Godot target | 원 pixel 크기 / bytes / 최초 양측 동일 SHA256 |
|---|---|---|
| soil | `assets/map/ch1/ground_dark_soil.png` → `res://assets/map/ch1/ground_dark_soil.png` | 1024² / 2201462B / `9d6c7d93aeffe958f8e98791a0c2a42fefeb39a7b34052ddf93db164fde078e9` |
| litter | `assets/map/ch1/production_finish/materials/forest_moss_litter.png` → `res://assets/map/ch1/materials/forest_moss_litter.png` | **1254²** / 3442139B / `af9ddfe049fedad95eff60f7546ac2475b6c58c0448e2a064b0e786995fb6f1d` |

| actual shader / geometry leaf | soil | litter | 원 권위·소비 |
|---|---|---|---|
| sampler | `soil_tex` | `litter_tex` | 실제 Provider Texture2D object를 원 ShaderMaterial에 bind |
| brightness | .85 | .76 | composition groundMaterials 각각 → RGB 곱 |
| saturation | .48 | .55 | 원 luma `.299/.587/.114`와 RGB mix. 기존 shader 그대로 |
| tile_world | 1024 world px | **512 world px** | soil groundTile / litter tileSize. litter pixel1254와 반복512를 혼동하거나 resize하지 않음 |
| overlay_alpha | 별도 uniform 없음 | .7 | alphaFeather.groundOpacityMultiplier → 기존 litter alpha 곱 |
| world_size / CanvasItem size | 8000 / 8000×8000 | 8000 / 8000×8000 | actual map width200×T40 / height200×T40 및 원 recipe |
| local origin / transform | 0,0 / identity | 0,0 / identity | 원 Surface와 actual pass 동일 공간. map 좌표 변환이나 이동 없음 |
| child z / effective z | 0 / −3002 | 1 / −3001 | Surface `z_as_relative=false`, z−3002; 두 child는 relative=true |
| 기존 World 층 | actual chunks−3000 | ground props−2500 코드분기 | 기존 source 그대로. 첫 실제 Scene에서 chunks15/props36/**groundprops0**이므로 −2500 분기의 실 sprite 관측으로 승격하지 않음 |

원 source의 shader는 texture repeat→saturation mix→brightness 곱, litter는 alpha 추가 곱이다. 새로운 soil/litter art, colour retune, fallback texture, SVG mask, zone weight/blend는 만들지 않는다.

## 3. 실제 startup·API·readiness

| API / 단계 | 실제 소비와 거부 |
|---|---|
| World `get_native_map_surface_context()->Dictionary` | actual map_data의 schema/stage/width/height/tile_size만 읽는 부모 getter. 전체 tile40000개/geometry/PNG 좌표를 새 문서에 복제하지 않음 |
| adapter `configure(world:Node2D)->bool` | live World Tree/queued 상태·getter 확인 → map context 검증 → actual Provider soil/litter 둘 다 확보 → 실제 ShaderMaterial sampler/모든 원 uniforms 확인 → Surface bind 및 실제 두 CanvasItem 검증 → 자기 자식으로 설치. context/texture/material 실패 시 자식·geometry 추가0 |
| supported map | `schema=exoduser.godot.ch1-native-first.v1`, stage0, width200, height200, tile_size40. 실제 finite 숫자만 수락하며 bool/string/null/missing/다른 stage·크기는 거부 |
| `Provider.load_soil()/load_litter()` | Root R5 `ResourceLoader.exists→load+cache`를 실제 재사용. 해당 original res path / Texture2D / width·height>0 확인. 둘 중 하나 없으면 startup reject이며 null-bound Surface를 ready로 위장하지 않음 |
| material preflight | 원 `build_floor_material` / `build_overlay_material`의 actual ShaderMaterial·shader 존재·sampler object identity·원 uniforms 검증. 성공하기 전 CanvasItem child를 만들지 않음 |
| 실제 Surface 확인 | `SoilBase` / `LitterOverlay` 두 ColorRect, actual texture samplers, 원 uniforms, size8000², origin0, rotation0/scale1, relative child0/1 확인. Root `snapshot().bound` 구조 flag를 readiness로 사용하지 않음 |
| World 설치 | 부모 actual map load 후 `NativeGroundSurface` child 추가 → configure + actual ready 확인 → collision/props/encounters 구축. 실패면 startup을 중단하고 ready_for_player를 허용하지 않음. 공용 `get_native_ground_surface_snapshot()`은 실제 adapter 상태를 읽음. collision/nav/기존 chunks/props 구축 규칙은 부모 원 코드 그대로 |
| `is_native_surface_ready()->bool` | configured·미dispose·adapter actual World parent/Tree/queuedfalse·map supported·adapter identity transform·Surface actual adapter parent/Tree/queuedfalse·Surface identity 및 absolute z−3002·실 두 material binding이 모두 필요 |
| `get_snapshot()->Dictionary` | ready/error/disposed, real texture paths·dimensions, 실제 pass 위치·size·sampler·z/local/effective·Tree/queued 상태, readonly map context, caller scope 및 resource_binding_ready. snapshot 필드는 별도 Dictionary이며 수정해도 실제 material/World를 바꾸지 않음 |
| `resource_binding_ready` | 전체 actual readiness와 동일. 단순 `bound=true`, Texture object 존재 또는 shader 객체 존재만으로 true가 아님 |
| `dispose()->bool` | 자신이 만든 Surface만 free. detached/reparented Surface도 ownership에 따라 정리하고 references/configured를 비워 disposed=true. 빈 adapter는 World child로 남을 수 있으며 반복 호출도 true. chunks/props/collider/공용 Texture resource를 free하거나 수정하지 않음 |
| 재사용·clock | disposed instance를 재configure하지 않고 새 World startup instance를 사용한다. adapter 자체 process/physics driver0; Surface는 정적 CanvasItem이며 native60/cap240/Player/AI 시간을 추가하거나 바꾸지 않음 |

Surface에 원 public `bind_textures(null,null)`를 호출하면 Root 구조 flag는 true가 될 수 있다. 실제 sampler가 없어진 경우 이 adapter의 ready/resource_binding_ready는 false여야 한다. 이것은 Root 단위 실패 주장이 아니라 실제 binding caller의 별도 필수 경계다.

## 4. 신규 검사·실행 이력

부모 fresh isolated stage에서 아래 새 script만 최초 실행하여 **고유3 유효 완료/PASS3 / FAIL0 / 미완료0**이다. 권위는 `tests/attempt-01-receipt.json` 및 observations 파일이며 raw log는 `tests/attempt-01.log`에 보존한다. 제품·검사 수리0, 성공/옛 suite 재실행0이며 추가 실행 없이 동결한다.

| 새 그룹 | 독립 관측·경계 | 상태 |
|---|---|---|
| `actual_resources_materials_and_pass_layers` | actual World startup의 underlay1/actual resource2/soil1024²·litter1254²/real shader sampler 및 원 inputs/CanvasItem8000²·identity·effectivez−3002/−3001 확인. 실제 world width200/height200/T40, collision_count427/chunks15/props36/groundprops0 및 deep snapshot 확인. shader binding은 GPU 픽셀 증거가 아님 | FIRST PASS |
| `invalid_map_atomic_preflight` | constructor-only nullable/malformed context8case 및 getter없는 Node1로 strict map rejection. Surface/pass/provider geometry child0와 cleanup 멱등 확인. 이 가상 provider를 actual canonical geometry 완료 증거로 주장하지 않으며 PNG 삭제·rename/source world값 변경0 | FIRST PASS |
| `lifecycle_cleanup_preserves_existing_world` | actual World에서 public Surface detach/reparent/queue, null rebind, adapter queue의5case 모두 readinessfalse/dispose 멱등/owned Surface free. 실제 원 collider Node/Shape ids·위치·layers, chunk/prop ids·visible·textures·z, 다른 World children, START/EXIT/context 전후 snapshot 동일/collision_count427 유지 | FIRST PASS |
| fixture 권위 | actual World 생성자와 실제 imported resources. negative provider는 생성자 context의 fake nullable source-world boundary이며 actual canonical geometry 완료 증거가 아님 | 명시 |
| 주입·실행 | live HP/position/AI/private clock/map collision/nav setter0. worker runtime/import/Git/Main/GUI0. actual World/Player physics 직접호출0/자동physics0/renderer `_draw` 직접호출0. 옛 MAP_RESOURCE/Provider missing/배달 success suite 재실행0 | 유지 |

부모 첫 actual Resource import는 **원2개만 / 6.105508917초 / exit0 / ERROR0 / 옛 resource 재import0**이다. `import-first` publish receipt에 새2 sidecar/cache2pairs만 W에 최초 공급하고 old file overwrite0을 기록했다. Root MAP module4 UID는 engine first scan metadata로 부모가 공급했다. 별도 `metadata-first/uid-first-receipt.json`의 adapter UID 생성은 exit0 / .6836175초 / source·import·test replay0이며 worker 재생성0이다. source PNG 최초 copy/hash나 import 성공만으로 실 shader pixels를 PASS로 선언하지 않는다. 부모 byte copy2/import2, 새 actual provider binding3 PASS, engine script metadata는 서로 다른 증거다.

| 첫 실행 ledger | 실제값 |
|---|---|
| backend | 부모 `dependency-ground-surface-integration-first/isolated-editor/Godot.app/Contents/MacOS/Godot --headless --path stage/godot --script res://tests/test_native_ground_surface_binding.gd` |
| 결과 | 7.013840624999999초 / exit0 / 유효 완료3/PASS3/assertion0/ERROR0 |
| geometry 범위 | actual World 첫 Scene collision_count427/chunks15/props36. lifecycle cleanup 전후 실제 geometry snapshot 동일이며 원 source 전체 collision 재감사·옛 suite 재검이 아님 |
| ground prop | 실제 groundprops0. source −2500 branch 보존을 실제 해당 sprite 관측/PASS로 과장하지 않음 |
| 계수 | World/Player 자동 physics0 및 명시 physics0, renderer `_draw` 직접 호출0, Main/save/GUI/public play/pixels0 |
| 반복·수리 | 제품·fixture 수리0 / 성공 그룹 반복0 / old MAP success suite0 / test 실행 중 추가 import0. 부모 사전 actual source2 first import는 별도 이력 |

## 5. 문서 동기화와 남은 제작

코드 후 docs 전체 관련 키워드를 rg 및 literal recursive grep로 검색해 worker 외부 로그/receipt에 저장했다. 두 exit0이며 rg89matches/30paths, literal grep63matches/25paths를 `worker/docs-search-receipt.json`에 기록했다. regex와 literal pattern 범위 차이이며 검색 누락을 동일 count로 위장하지 않는다. 현재 binding/자원 상태를 이 정본에 기록하고 부모가 공용 현재 문서와 code+docs normal checkpoint를 담당한다. Root 완료 module의 역사, 보호2_3/원 source/원PNG/Main/Player/다른 worker WIP는 변경하지 않는다. 실제 성공 전 commit 완료로 쓰지 않는다.

남은 범위는 공개 Camera/GPU 픽셀·seam/soil·litter 가독성·교전 그림자 비교와 최저 Windows1080p240 측정이다. 기존 opaque chunk가 위에 남으므로 underlay 추가 자체를 전체맵 그림 개선 완료로 주장하지 않는다. zones mask/SVG/zone blend는 기존 denied purpose **HOLD 유지**이며 대체 구현·검사·우회0이다. actual source6/미10, frozen Web/Windows5/미11과 맵 geometry·collision·nav·START/EXIT·캡·native60·source combat values는 불변이다.

## 23. MAP PRODUCTION REPORT

| 항목 | 현재 판정 |
|---|---|
| MASTER PLAN / LARGE OUTER MASS / MEDIUM CONNECTION | 기존 canonical CH1 map·배치·랜드마크 그대로. 새 geometry/outer mass/nav/좌표 제작0 |
| GROUND CONNECTION | 승인 원 soil/litter Resource2를 정적 two-pass underlay actual World에서 소비. 원2 첫 import 성공 및 새 actual binding3 FIRST PASS. 실 shader pixels 미관측 |
| PLAYABLE/COMBAT | existing chunks/props/collision/source actor를 유지. 이번 unit public play/자연 교전0 |
| CAMERA QA | identity map 공간·world8000²·깊이층 계약 기술 FIRST PASS. actual gameplay pixel/route/culling QA 미검수 |
| TECH QA | 새 고유3 FIRST PASS, 제품·검사 수리0/성공 재실행0. Root 옛 MAP12/R5 missing 검사 등을 재실행하거나 새단위 PASS로 합산0 |
| 자원 | 부모 canonical 원2 첫 byte-identical copy/hash. worker PNG 제작·수정·copy·hash·import0. 원 litter1254²와 반복512 구분 |
| VISUAL VERDICT | **RETOUCH** — 실제 GPU/source canvas/공개 Camera/seam/combat/240 미검수. 자동 기술 검사를 visual PASS로 대체하지 않음 |

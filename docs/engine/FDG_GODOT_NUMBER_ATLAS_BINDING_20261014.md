# FDG Godot number atlas 실제 World startup binding — 2026-10-14

현재 상태: **실제 one-time startup 연결 및 신규 고유2 FIRST PASS**. 새 headless actual World guard1(1.483481초)과 별도 native actual World→adapter→baker→기존 numeric consumer1(3.094918416초)을 최초 실행했고 둘 다 exit0/assert0/ERROR0/SCRIPT ERROR0이다. 제품·검사 수리 및 성공 재실행0이다. 기존 atlas9고유/105검사·8native probe와 floating text4의 성공은 동결된 별도 단위이며 재실행·새 PASS 합산0이다. font/baseline/browser raster fidelity와 공개240은 미완이며 **RETOUCH**이다.

## 1. 소유·정본·백업

| 항목 | 범위 |
|---|---|
| worker 제품 | 기존 `godot/scripts/native_floating_text_adapter.gd`의 number_atlas startup hunk만. 기존 text admission/native clock/lifecycle 판정은 바꾸지 않음 |
| 새 검사 | `godot/port_modules/number_atlas/test_native_number_atlas_binding.gd` 하나. native/headless 새 boundary를 `--only`로 분리 |
| 새 문서·외부 | 이 정본 및 `dependency-number-atlas-integration-first/worker/` |
| supplier | 실제 `godot/port_modules/number_atlas/producer.gd`, [기존 handoff](FDG_GODOT_PORT_NUMBER_ATLAS_FIRST_20261013.md) Public API. 수정·옛 테스트·옛 PNG/probe 재연0 |
| consumer | 기존 `floating_text/producer.gd` public `set_number_atlas`만 실제 사용. 수정0 |
| parent / 사전 백업 | parent `f58ae5d5`의 adapter WORK=HEAD 최초 byte backup은 `backup-before-edit/receipt.json` 및 work/head 실제 파일이 권위. 새 unit test/doc WORK·HEAD 부재. worker Git0 |
| 선행 | supplier 정본 Public API/실 코드 첫 읽기 및 retained map guide1047행 FULL·§23 적용. 관련 옛 검사의 실행·PNG 재검사 없이 실제 API로 연결 |
| 공유·보호 | World/Player/Main/FX/source map/model/QE/기존성공 proof·원PNG/fonts·타WIP 변경0. primary가 공용 docs·UID·stage·code+docs checkpoint 소유 |

첫 안내의 별도 `team-port/number_atlas/handoff` directory는 실존하지 않았다. 실제 supplier와 기존 정본의 Public API가 정정된 권위이며 광범위 E/project scan으로 경로를 추측하지 않았다. `team-port/number_atlas/`의 옛 check-ledger/PNG는 이 신규 binding 증거로 재읽거나 재실행하지 않는다.

## 2. 실제 startup API

| 단계 / 필드 | 실제 계약 |
|---|---|
| configure 유지 | 기존 World caller가 기대하는 `configure(world)->bool` 그대로. 기존 font resource preflight 및 configured=true 후 baker Node 하나를 adapter child로 설치 |
| baker owner | `NativeNumberAtlasBaker`, 실제 Node/Tree parent=adapter, `PROCESS_MODE_ALWAYS`. adapter/consumer 역시 장수명 World child. RefCounted-local Callable 수명 가짜 공급 없음 |
| deferred startup | `call_deferred("_start_number_atlas_once")` 한 번. `_number_atlas_startup_started` guard로 반복 bake·매frame 공급을 만들지 않음 |
| actual supplier | `await bake_native()->Texture2D` 한 번. 원 supplier가 real native rendering에서 생성하는 480×168 runtime ImageTexture를 받음 |
| before/after await | actual World/adapter/consumer parent·Tree·queued guards와 baker parent·Tree·queued를 확인. 바뀐 backend에 late completion을 공급하지 않음 |
| 공급 | texture dimensions480×168을 확인한 뒤 supplier의 `supply_to(_producer)` 한 번 → 기존 `set_number_atlas`. adapter·baker·consumer의 strong Texture2D references 유지 |
| headless | actual supplier는 null/status `unavailable_headless`, viewport/pixels 생성0. consumer의 `number_atlas_gap=true` 유지. 일반 text backend는 계속 ready이며 atlas를 placeholder로 위장하지 않음 |
| startup 상태 | `not_started` → `baking` → `supplied` 또는 실제 supplier failure/headless status. lifecycle loss는 `unavailable_startup_lifecycle` / `unavailable_completion_lifecycle`, 크기 오류는 `failed_runtime_atlas_dimensions`, 공급 오류는 `failed_consumer_supply` |
| snapshot 추가 | `number_atlas_startup_status`, `number_atlas_bake_calls`, `number_atlas_supply_calls`, `number_atlas_supplier_live`, `number_atlas_runtime_texture_size`, actual `number_atlas_build_report`, `number_atlas_clock_owner=startup_only_no_native_driver` |
| 기존 snapshot | `number_atlas_gap`/`number_atlas_status`는 actual consumer 상태 그대로. native bake 성공과 headless unavailable을 같은 완료로 합치지 않음 |
| clock | 새 automatic physics/globaldriver/native_tick0. supplier는 rendering scratch frame을 await하며 text life/World native60를 진행시키지 않음. 기존 post3 clock 계약 그대로 |

`bake_native()` 자체는 public 재호출 시 rebake가 가능한 supplier API지만 이 binding은 startup에서 한 번만 호출한다. 장수명 baker 또는 texture를 유지하라는 실제 handoff를 따르고 매frame bake·fallback font 생성·새 asset저장·source 원본 이미지 변형을 추가하지 않는다.

## 3. 정확한 source/port 값과 기술 범위

| 항목 | 정확 값 / source와 구별 |
|---|---|
| source atlas | 480×168, 10digits×3style rows, cell48×56 |
| source glyph | font44px / weight900, x=d×48+24 / y=row×56+6, highlight y+5·alpha.15·crit row1 제외 |
| styles | white row0 / crit row1 / shield row2. 실제 frozen supplier의 source palette 그대로 |
| source compositor | shadowBlur12, outline radius3/29offset, gradient y+4→y+48/stops0,.4,1, source-over glyph 순서. source cell clip 없음 |
| backend scratch | margin21, isolated slot90×98, scratch SubViewport900×294. source atlas값·캐릭터 animation frame가 아님 |
| backend blur | σ6/radius18 normalized CPU. 이전 supplier 검증의 권위이며 이번 binding에서 helper suite/probe를 반복하지 않음 |
| font | 기존 readonly NotoSansKR.ttf / wght900 fallback. source 우선 Pirata One은 Godot에 없어 fidelity 미완. 새 폰트 download/copy/import0 |
| consumer | 기존 num_str size≥28 분기, source rect `(digit×48,style×56,48,56)`와 실제 draw_texture_rect_region. 새 숫자 event가 실제 World 공개 `emit_native_text`로 admission되며 원 ring40/native clock 그대로 |
| 저장·경계 | runtime ImageTexture만. 원 PNG 재hash/reimport0, 새 atlas PNG/font asset 저장0. old framebuffer/capture/probe 접근0 |

glyph font shape, `textBaseline=top`의 Godot ascent approximation, no-source-canvas identity 및 crop/AA 차이는 원 supplier의 RETOUCH를 그대로 유지한다. startup wall 시간은 FPS/240/GPU 완료시간이 아니다.

## 4. 신규 의미 검사·first 실행

현재 **신규 고유2 유효 완료/PASS2 / FAIL0 / 미완료0**이다. Cground isolated stage의 scripts/scenes/port_modules/.godot cache만 재사용하고 assets/data는 baseline read-only-use symlink로 연결한 fresh `dependency-number-atlas-integration-first/stage/godot`에서 실행했다. own adapter/test와 실제 supplier gd만 정렬했으며 broad current project scan·옛 resource overwrite·asset copy/hash/import·Main/save 접근0이다.

| 그룹 | first 증거와 범위 | 상태 |
|---|---|---|
| `headless_world_startup_atlas_guard` | actual World startup→adapter owned baker1/consumer1→actual supplier unavailable_headless. bake1/supply0/gap true/mask viewport0. actual World numeric admission1과 추가 process frame에서 no rebake/no native age0 확인 | FIRST PASS |
| `native_world_startup_numeric_consumer` | **새 독립 native fixture 창**, 요청640×360/실제 root.size1280×720 관측. actual World→one bake480×168→one supply→one numeric admission `123` crit. 기존 consumer actual `num_atlas_drawn`/3digit blits row1/source regions/후속 render no rebake/native age0 확인 | FIRST PASS |
| 실행 분리 | headless는 guard이고 native는 새 caller render path이다. headless 자료로 실제 native supply/render를 주장하지 않음. old atlas9/105·8probe, old floating4, Cground3 및 이전 package/메인 성공 재실행0 | 고정 |
| 창·인간보호 | 신규 native fixture 창만 자동 종료. 기존 human fullscreen World/browser/CUA/old captures0접근, 본편 Main0/User save0. 새 tiny window를 본편 공개 플레이로 표시하지 않음 | 고정 |
| pixel 범위 | 새 consumer draw dispatch 및 sampler region 기술 검사. 기존 glyph8probe·source palette/helper 검사 반복0, 새 screenshot0. source-font/public-pixel fidelity 미검증 | RETOUCH |
| input/clock | actual World constructor + Camera constructor만. live HP/position/AI/private clock setter0. World/Player physics 직접호출0, text native_tick 직접호출0, renderer `_draw` 직접호출0 | 고정 |

두 성공 그룹은 추가 재실행 없이 고정한다. shell exit/runtime error/유효 completed와 raw GROUP marker를 별도 receipt로 보존했다. 창 크기 차이의 원인은 별도로 검증하지 않았으며 실제 관측을 요청값으로 덮어쓰지 않았다.

| 실제 실행 ledger | 결과 / 별도 증거 |
|---|---|
| headless first | `tests/attempt-01-headless-first-receipt.json`, stdout/stderr 원본. 1.483481초 / exit0 / valid1 PASS / assert0 / ERROR0 / SCRIPT ERROR0 |
| native binding first | `tests/attempt-02-native-binding-first-receipt.json`, stdout/stderr 원본. 3.094918416초 / exit0 / valid1 PASS / assert0 / ERROR0 / SCRIPT ERROR0. headless 성공 재실행0 |
| backend 실제 | Godot4.7.2.stable.official.ed1daf0bf / macOS / OpenGL API4.1 Metal90.5 / Compatibility / Apple M5 Pro |
| warning 분리 | 각 실행 stderr7행은 physics interpolation으로 Camera2D callback이 physics mode로 override된 engine warning1건. 제품 ERROR가 아니며 변경·성공 재실행하지 않음 |
| native actual 상태 | startup supplied / runtime480×168 / bake1 / supply1 / actual World event admission1 / consumer ci1·digit1,2,3 / native text·World aging0 |
| 실제 numeric source regions | digit1 `(48,56,48,56)`, digit2 `(96,56,48,56)`, digit3 `(144,56,48,56)`. consumer dispatch trace이지 source-font pixel identity 검사는 아님 |
| startup sample | 실제 build report mask_capture_us225996 / compose_us238436 / fields_computed10·reused20 / saved_files0. 새 startup wall/CPU report이며 FPS·GPU완료/240 자료가 아님. 옛8probes 재검사로 합산0 |
| native 창 | 신규 fixture1 / 요청640×360 / observed root.size1280×720 / 자동종료. old human fullscreen World/Main/browser/CUA/old capture 접근0 / 새 screenshot0 |
| 환경 준비 이력 | 첫 stage 준비에서 optional supplier `.gd.uid`가 없어 assertion으로 runtime 이전 중단1회. 실제 gd만 정렬하고 UID 부재를 기록하여 환경 수리; 제품·게임 runtime 실패가 아님. UID 임의 생성0 / old resource import0 |
| 공급 모듈 UID 후속 인수 | 위 신규 검사 2개가 통과한 뒤 primary가 실제 Godot `ResourceUID.create_id`로 `producer.gd.uid = uid://broqc4ftfpdaf`를 최초 생성(exit0/test0/import0). 최초 code adoption용 metadata이며 stage에 새 UID만 동일 바이트 최초 복사. 검사 당시 UID 부재·환경 assertion 이력은 그대로 보존하며 headless/native 재검사0. 권위: 외부 `metadata-first/uid-first-receipt.json` |
| stage/교전 경계 | exact file byte alignment `worker/stage-alignment-first.json`. World/Player physics·native_tick·`_draw` 직접호출0. 실제 Player damage/자연 AI/공개 play 증거0 |

## 5. 문서 동기화와 다음 consumer

adapter code hunk 후 docs 전체 rg/literal recursive grep를 worker 외부에 저장했다. 두 exit0 / 각각69matches·13paths를 `worker/docs-search-receipt.json`에 기록했다. source pointer/숫자/API/state 및 기존 missing-gap 역사와 새 actual startup 상태를 이 정본에서 구분하고 primary가 공용 현재 docs prefix·정상 code+docs checkpoint를 담당한다. 기존 supplier/consumer/성공 proof/보호2_3 본문은 변경하지 않는다.

이번 binding으로 native runtime atlas 공급 가능 상태를 만드는 것이며, 모든 공격 damage-number caller/QE/메인 공개HUD/다국어/폰트라이선스 결정/최저240를 완성했다고 주장하지 않는다. actual source6/미10, frozen Web/Windows5/미11·native60·map/START/EXIT·독립 projectile/Player/source stats를 변경하지 않는다. headless gap과 native supplied는 별도 런타임 판정으로 남긴다.

## 23. MAP PRODUCTION REPORT

| 항목 | 현재 판정 |
|---|---|
| MASTER/LARGE/MEDIUM/GROUND | 기존 canonical World 재사용. 새 map/nav/collision/좌표/texture-copy0 |
| PLAYABLE/COMBAT | World 공개 floating text caller의 숫자 atlas startup 연결. 본편 인간 input/자연 피해/AI·교전 증거0 |
| CAMERA QA | 신규 native fixture 생성자 Camera context에서 actual numeric consumer 기술 FIRST PASS. observed root.size1280×720 / requested640×360 별도 기록. 본편 source pixel/Camera 비교 미검수 |
| TECH QA | 신규 headless1 및 native actualbinding1 고유2 FIRST PASS. 제품·fixture 수리0 / 옛 success/probe 및 새 성공 재실행0 |
| 자원 | 원 readonly font, runtime atlas 생성만. original PNG/hash/import/reimport0. sampler consumer frozen |
| VISUAL VERDICT | **RETOUCH** — Pirata/baseline/crop/browser raster/public gameplay/최저240 미완. 신규 numeric dispatch를 전체 시각 PASS로 바꾸지 않음 |

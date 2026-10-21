> 2026-10-21 SHARP-01 품질 후보: [HiDPI·무손실·렌더 선명도](SHARP_01_RENDER_CLARITY_20261021.md). 기준c335f345. canvas_items/native resolve, 지면26import mode0, 단일 제한형clarity pass. 1080p 전후1x 선명도PASS, native2560 p95 9.793ms/p99 11.219ms/focus0, 113checks/0fail. 120fps미달/전체맵아트PASS·PC인수 아님. 아래32c의 mode2/VRAM은 당시 이력.

# MAP11-32c — 계측으로 찾은 CPU 비용, 지면 VRAM 압축, 북쪽 관광 디테일

기준/expected remote `f85cfb9ab42112a91bf2264540bebaa724761b96`, 동일 `codex/map11-32-20261021`. 로컬 전용 WT `~/exoduser-wt/MAP11-32c`, 증거 `~/exoduser-wt/_out/MAP11-32c/`. main/PC 인수·배포 아님. **PERFORMANCE FAIL / VISUAL RETOUCH**. 코어 병목을 수정했다고 주장하지 않는다.

## 측정 조건·해석 경계

수정 **전에** 30c `0f0a2888`와 32b `f85cfb9a` 및 7층 A/B를 측정했다. 30c는 같은 WT 아래 `.baseline/godot`에 해당 commit의 Godot 파일을 복원한 별도 프로젝트다. 제품 PC 코어 파일 수정0. 기존 `benchmark_map11_21._measure_attempt`를 상속하며 32b와 동일한 실제 Main/Player, field `(0,3650)`, left/down/right/up 각150 physics ticks, 1920×1080, max240, vsync OFF, zoom **.70**, offset `(0,-180)`로 통일했다. 따라서 과거 30c 문서의 다른 조건·시점 7.738ms와 이번 표를 직접 비교하지 않는다.

Godot4.7.2 GL Compatibility / Apple M5 Pro. OS와 게임 window focus를 유지한 유효 표본만 채택했다. 안개 첫 표본 focus_lost654는 `off-fog-invalid-focus/`에 보존하고 포커스 오류에 한해 한 번 교체했다. 유효한 느린 표본 재측정0. 최초 current 실행은 baseline import와 겹침을 발견해 표본 시작 전 자기 PID58833만 종료했고 결과 JSON이 없어 표본으로 세지 않는다. 별도 script profiler 실행은 비용 원인 진단이며 최종 p95가 아니다.

입력 순서·시작점은 동일하나 적/CC/충돌이 살아 있는 기존 하니스여서 실제 이동 궤적·적 상태는 결정적이지 않다. 마지막 이동량110.666world, accepted=true, 실제612physics ticks/1591render frames. 이전 200world 검사 문턱을 충족했다고 주장하지 않는다. 한 번씩의 A/B는 소음·상태 차이를 포함하므로 차이를 순수 층 비용으로 확정하거나 합산하지 않는다. 원시 path_corners·각 프로세스 관측·표본 JSON을 모두 보존했다. 일부 사전 측정에는 INTEG-6b의 headless Godot이 공존했으며 상한3을 지켰다. **최종은 모든 관측에서 자기 Godot+81277만** 존재했다.

Performance TIME_PROCESS/TIME_PHYSICS_PROCESS/RENDER_TOTAL_DRAW_CALLS_IN_FRAME/RENDER_TOTAL_PRIMITIVES_IN_FRAME/RENDER_VIDEO_MEM_USED를 읽고, `viewport_set_measure_render_time(rootRID,true)` 후 CPU/GPU 값을 기록했다. 모니터는 Godot 갱신 주기의 held 값을 읽으므로 프레임 시간과 단순 덧셈하지 않는다. viewport CPU는 제출/렌더 CPU 계측이며 process 시간과 겹친다. GPU API는 모든 표본에서 0을 반환해 **미지원/미계측(null)** 로 취급했다. GPU=0ms, GPU 병목 없음이라는 결론이 아니다. [RenderingServer API](https://docs.godotengine.org/en/stable/classes/class_renderingserver.html).

## a/b 및 층별 기여 ms — 전부 제품 수정 전

양의 Δ는 끈 표본이 빨랐다는 관측값, 음의 Δ는 느렸다는 관측값이다. 반복 평균·인과적 절감량이 아니다. CPU 값은 mean ms.

| 실행 | p95 ms | p99 ms | Δp95(current−off) ms | process | physics | render CPU | GPU | draw mean | primitives mean | VRAM p95 bytes | focus_lost |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|
| (a) 30c 0f0a2888 | 9.485 | 10.351 | +0.035 | 8.620 | 4.209 | 0.538 | null | 154.297 | 5628.648 | 2677304664 | 0 |
| (b) 32b f85cfb9a | 9.520 | 10.455 | +0.000 | 8.524 | 4.844 | 0.519 | null | 129.316 | 5504.626 | 3257505721 | 0 |
| 바닥판 OFF | 9.952 | 11.216 | -0.432 | 9.673 | 4.326 | 0.519 | null | 119.698 | 5529.318 | 3257512969 | 0 |
| source 고목4 OFF | 9.725 | 10.980 | -0.205 | 8.540 | 4.319 | 0.497 | null | 122.445 | 5480.487 | 3257505721 | 0 |
| 화면 안개+낮은 안개 OFF | 9.491 | 10.571 | +0.029 | 8.015 | 4.328 | 0.489 | null | 123.896 | 5483.663 | 3257505721 | 0 |
| 흰나무 빛/미세 변형 OFF | 10.487 | 11.756 | -0.967 | 42.591 | 4.937 | 0.576 | null | 127.808 | 5595.791 | 3255382777 | 0 |
| 핏줄펄스 strength0 | 9.895 | 10.902 | -0.375 | 8.113 | 4.430 | 0.541 | null | 126.635 | 5544.144 | 3257505721 | 0 |
| 시차 전경2 OFF | 9.183 | 10.400 | +0.337 | 8.403 | 4.016 | 0.505 | null | 124.049 | 5510.772 | 3257505721 | 0 |
| 적/전투 처리 OFF | 8.362 | 9.284 | +1.158 | 7.842 | 2.642 | 0.443 | null | 112.252 | 5322.194 | 3257360153 | 0 |

토글은 `godot/tests/capture_map11_32c.gd -- --disable-layer=<floor|trees|fog|white|pulse|foreground|combat>`에서만 동작한다. 제품 UI/기본 실행에는 연결0. floor는 legacy bake22+source floor, trees는 선택된 source고목4만, fog는 NativeFogGL+Target32LowMist, white는 기존 white_tree shader를 static unlit로 치환, pulse는 source floor strength만0, foreground는2sprite, combat은 현재 enemies와 선택한 world/main combat manager들을 PROCESS_MODE_DISABLED로 만든다. 전체 core를 제거한 실험은 아니다. `disabled_nodes`로 실제 범위를 검증 가능하다. 메모리는 해제하지 않는 draw/processing A/B다.

## 원인 함수 — PC 전달용, 수정하지 않음

내장 local script profiler(`--debug --profiling`)의 마지막10개 1초 간격 프레임 보고를 집계했다. inclusive는 하위 함수를 포함하므로 **아래 숫자는 서로 합산 금지**. 프로파일러 자체 오버헤드가 있으며 일반 최종 성능 표본과 구분한다.

| 함수 | 관측 frame 수 | inclusive mean ms | self mean ms | calls/frame mean |
|---|---:|---:|---:|---:|
| `res://scripts/native_source_player_initialization_services.gd::811::ExoduserNativeSourcePlayerInitializationServices._context_error` | 10 | 3.2288 | 0.0085 | 8.4 |
| `res://scripts/main.gd::1205::_process` | 10 | 3.1178 | 0.0032 | 1.0 |
| `res://scripts/native_source_player_providers.gd::239::ExoduserNativeSourcePlayerProviders._context_error` | 10 | 2.5923 | 0.1127 | 86.7 |
| `res://scripts/native_source_new_run_state.gd::1242::_current_error` | 10 | 2.4643 | 0.1280 | 152.8 |
| `res://scripts/main.gd::1187::_advance_native_source_clock_input` | 10 | 2.4466 | 0.0014 | 1.0 |
| `res://scripts/native_source_player_initialization_services.gd::420::ExoduserNativeSourcePlayerInitializationServices.capture_native_source_render_input` | 10 | 2.4416 | 0.0012 | 1.0 |
| `res://scripts/native_source_player_providers.gd::208::ExoduserNativeSourcePlayerProviders._ownership_error` | 10 | 2.3123 | 0.0803 | 86.7 |
| `res://scripts/native_source_player_providers.gd::189::ExoduserNativeSourcePlayerProviders._read_domain` | 10 | 2.1442 | 0.8251 | 44.4 |
| `res://scripts/native_source_player_initialization_services.gd::409::ExoduserNativeSourcePlayerInitializationServices._source_clock_context_error` | 10 | 2.0950 | 0.0016 | 5.4 |
| `res://scripts/native_source_player_initialization_services.gd::253::ExoduserNativeSourcePlayerInitializationServices._run_native_source_frame_callback` | 10 | 2.0225 | 0.0043 | 1.0 |
| `res://scripts/native_source_new_run_state.gd::175::is_native_new_run_state_ready` | 10 | 1.6953 | 0.0266 | 87.1 |
| `res://scripts/native_source_player_initialization_services.gd::235::ExoduserNativeSourcePlayerInitializationServices._source_frame_context_error` | 10 | 1.6844 | 0.0016 | 4.4 |
| `res://scripts/native_source_resource_authority.gd::602::ExoduserNativeSourceResourceAuthority._current_error` | 10 | 1.6750 | 0.5551 | 663.5 |
| `res://scripts/native_source_new_run_state.gd::1270::_actual_fields_error` | 10 | 1.6404 | 0.1181 | 152.8 |
| `res://scripts/native_source_resource_authority.gd::228::ExoduserNativeSourceResourceAuthority.read_current_resource_parameters` | 10 | 1.2269 | 0.2394 | 165.5 |

관측한 주 경로는 `main._process → _advance_native_source_clock_input → capture_native_source_render_input → _source_clock_context_error/_context_error → provider._read_domain/_ownership_error → new_run._current_error/_actual_fields_error → resource.read_current_resource_parameters/_current_error`다. source initialization `_context_error`가 current_g/current_p/current_stats/current_passives/current_inventory reader를 반복 호출하며 각 reader가 소유권/현재 값 검증으로 내려간다. profiler에서 main._process 약3.12ms, clock/input 하위 약2.45ms; provider._read_domain self 약.825ms/44.4calls, resource._current_error self 약.555ms/663.5calls가 관측됐다. 적/전투 OFF는 p95 −1.158ms, physics mean4.844→2.642ms. 이는 맵 전용 그림을 끄는 것보다 큰 관측 차이다.

PC 전달 시 owner/identity/동일Tree/field fail-closed 계약을 유지하면서 중복 검증 호출을 조사해야 한다. 임의 캐시·가드 삭제를 적용하지 않았고, PC 접근/실행/동기화도 미확인이다.

맵 측 프로파일: field_runtime.runtime_ready .3355ms/39calls(physics가 있는 보고4개), product_scene.can_move .2180ms/10.5calls, line_of_sight .1580ms/5calls, product_field_view.update_product .08675ms, product_scene._physics_process .089ms. 그래픽 bake만 반복해 3ms 이상을 해결할 근거는 없었다.

## 수정한 제품 계약

| 대상 | 변경 | 보존 |
|---|---|---|
| product_scene.can_move / line_of_sight | `current()`의 중복 전체 runtime_ready scan 제거. provider/start_marker의 instance 유효성을 검사한 뒤 provider 질의 내부의 **기존 전체 runtime_ready** 검사 한 번으로 전달 | marker 이동/삭제/reparent, transform, field/arena current 검증을 담당하는 field_runtime 구현은 그대로. provider/geometry/경로/스폰 불변. 이번에는 marker 검사 캐시화 없음 |
| 지면 texture26 | target32b ground22 + target32 floor_32b/veins_32b/foreground_32b_0/1의 compress/mode **0→2**, high_quality=false. import `path.s3tc`, vram_texture=true, imported_formats=s3tc_bptc 확인 | Compatibility에서 S3TC/BC 사용, 고품질 BPTC 요청 없음. 원본 PNG 해상도·26장·77170589disk bytes 불변. 카메라·원화 프레이밍 보존. streaming 아님 |
| 북쪽 뿌리 묘지 | root 발(-1280,2310), size980×330; skull variant0 발(-1300,2260), height310 | 기존 prop_g_root + tour_25d skull_pyramid_0 PNG만, 발 피벗 GroundContact.align/실루엣 contact AO .72, Y/4 깊이, actor 가림 복귀 |
| 북동 이끼 웅덩이/유골 | pool 발(420,1880), size830×310; skull variant2 발(640,1820), height225 | 기존 prop_pool + skull_pyramid_2 PNG, 저채도·낮은 실루엣. 기존 이동·충돌·스폰 불변 |
| 혈관 상처 | 발(-280,2050), size610×235 | 기존 patch_bloodpool_roots PNG 재사용. 작은 점 scatter0 |
| ground 팔레트/접지 | north32c_ground shader: l=.299R+.587G+.114B, moss=clamp(6(G−R)), vein=clamp(5(R−G)); ground(.333,.318,.369)/moss(.271,.294,.251)/vein(.208,.122,.161), source→tone 혼합.82, tone luminance(.45+1.1l). UV ellipse에 sin5/sin9 국소 비대칭 alpha 전이(.60→.99). source alpha 보존 | 프로젝트 원화 팔레트 #55515e/#454b40/#351f29 계열, fog#787482 기존값. 분홍풍·원화 재생성0. floor 근처 접촉은 같은 alpha 실루엣 확대1.025×1.035/발아래3world/alpha.12. 새 texture 생성0 |
| 런타임 | north32c_tour.mount setup에서만 preload/소스 opaque bbox/Material 생성. 기존 target32 rows/layers 캐시 culling·actor occlusion에 등록 | 새 process loop0, tick 목록API0/ResourceLoader0/material allocation0, runtime3D0, 플레이어/보스 scale0변경, zoom.70/offset 유지 |

## 최종 단회 성능·검수

| 항목 | before current | final |
|---|---:|---:|
| p95 ms | 9.520 | **9.122** |
| p99 ms | 10.455 | **10.247** |
| process monitor mean ms | 8.524 | 8.356 |
| physics monitor mean ms | 4.844 | 3.588 |
| viewport render CPU mean/p95 ms | 0.519/0.643 | 0.470/0.565 |
| viewport GPU | 미계측(API0) | 미계측(API0) |
| video mem p95 bytes | 3257505721 | 2825851708 |
| video mem p95 MiB | 3106.600 | 2694.942 |
| 표본 끝 draw/objects | 134/243 | 123/224 |
| focus_lost | 0 | 0 |

VRAM monitor 차이 **−431654013bytes / −411.657MiB / −13.251%**. 전체 VRAM이며 PNG 디스크 용량이 아니다. p95는 목표8.33ms를 **0.792ms초과**. 차이를 map-only의 확정 효과로 해석하지 않는다. **PERFORMANCE FAIL유지**.

6종 각1회: field41/field_runtime49/field_walk49/stage_provider54/seam18/outer26 = **237checks/0fail**. field_walk는12003 CharacterBody motion replay, 실시간 자유종주/밀집전투 성능은 아니다. seam/outer는 독립 preview 계약이며 제품 시각 PASS를 의미하지 않는다. Main capture와 최종 benchmark의 script/shader ERROR0, 기존 Camera2D interpolation WARNING 유지. 실제 저장 EXODUSER-Godot-Native-First 접근0; 모든 실행은 각 테스트/32c 격리 user dir. project.godot의 transient isolated 설정은 commit 전에 원본 복원한다.

## 눈검수·캡처

- `captures/compare_target_vs_game.png`: source target과 같은 START `(0,3700)`/camera center 약(0,3520)/zoom.70. 큰 고목·흰나무·길 구도 유지. 새 북쪽 무리는 START 밖. 압축은 원본 PNG를 바꾸지 않지만 BC 손실이 있어 byte-identical 화면이라는 주장은 하지 않는다.
- `captures/compare_1x.png`, `game_entry_1x.png`: 확대 없는 native pixel 비교.
- `captures/early_boundary.png`: 같은 `(-500,2550)`, 뿌리/유골·혈관 상처·북동 웅덩이의 비대칭3무리. 실루엣 발과 접촉 그림자 확인, 떠 있는 소품 없음. 초안의 과한 바닥 stamp 경계/검은 halo는 feather·ground AO.12로 보정했다.
- `early_boundary_1x.png`: 왼쪽 묘지/접지, `early_boundary_right_1x.png`: 북동 웅덩이/유골, `early_boundary_center_1x.png`: 이동 공간/혈관 웅덩이. 모두 native1× crop.
- `motion_2s.png`, left_roots/right_roots도 보존. motion 차이는 actor/HUD/전투효과를 포함하며 배경 움직임만의 증거가 아니다.

눈검수 **RETOUCH**: 북쪽의 디테일0 상태는 해소했고 저채도 큰 무리·접지는 확인했다. 다만 평면 풀/혈관 원화와 입구 고해상도 source의 재질 차이, 넓은 구역 전체의 장소 연결감은 잔여. AAA/전체필드 최종승인 아님. 범위 밖 카메라8board·ARENA/LATE/EXIT 재검수 미실시.

## MAP PRODUCTION REPORT

STAGE: CH1-1 START→EARLY 첫 구역.
MASTER: silhouette/regions/main route/side spaces 현행 유지. 새 동선/geometry 없음.
OUTER MASS: LEFT/RIGHT/SOUTH source 구도 유지; TOP은 기존 빈 피부 지면에 비대칭 낮은3무리. 외곽 mass 재설계 없음.
LARGE: 기존 승인 PNG root/pool/blood/skull2variant, source2차 생성0, reflection/scatter0. 무리 간 비대칭. 원본 whole tree 반복 추가0.
MEDIUM: root와 유골, pool과 유골 연결. 낮은3무리는 넓은 전투 여백을 유지. 원화 재질 통합은 RETOUCH.
GROUND: 발 피벗/opaque contact, palette grade/유기적 feather, 과한 AO 보정. 기존 지면26texture BC 압축.
PLAYABLE: main arenas/travel/breathing/threat·충돌/경로/스폰/region 유지. 낮은 시각 전용으로 collider 추가0. 기존 actor/HUD·탄 식별 유지, 밀집전투 QA 미실시.
LANDMARK: primary 흰나무·secondary 고목 유지, tertiary 북쪽 묘지/늪/상처. 전체 새 landmark hierarchy 완료 아님.
CAMERA QA: START 유지, EARLY3무리/접지 확인, SIDE L/R capture. ARENA/LANDMARK/LATE/EXIT 전체8board는 미실시.
TECH QA: field/runtime/walk/provider/seam/outer237/0; script/shader ERROR0; Performance 9.122>8.33 FAIL. GPU timestamp는 API0으로 미계측.
FILES: map11 product_scene/target32_scene + north32c_tour/ground shader +26import + test-only capture harness +관련docs. PC/core/번역CRLF/타인WIP 변경0.
GIT: 동일branch/정상hooks/경로add/비강제push만, expected f85cfb9a. 최종 SHA/remote확인/clean WT제거는 외부DONE. main/배포0.

**VISUAL VERDICT: RETOUCH / PERFORMANCE: FAIL (CPU 원인 인계).**

NEXT PASS: PC source clock/domain/resource 중복 검증의 비용을 소유권/즉시실효성 계약을 보존하며 검토. 맵 이미지만 다시 bake해 성능 달성했다고 주장하지 않는다. GPU API0 환경의 실제 GPU timestamp는 별도 지원 도구가 필요하다.


> 2026-10-22 MAP11-33 후속: 이 문서의 과거 자산·메모리·북접합 수치는 당시 이력이다. 현행은 [목표화면 MAP11-33](MAP11_TARGET_FRAMES_20261021.md#map11-33--고해상도-마감-리터치맵-텍스처-예산-2026-10-22). legacy아레나제품로드 제거/field bake 무손실trim·RGB/국소리터치, 1-1보수GPU988,351,648bytes. 182검사0fail, 성능은포커스미확보로p95 N/A(유효0).

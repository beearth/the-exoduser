# SHARP-01 — 기존 이미지의 렌더·임포트 선명도

기준 원격 `origin/codex/map11-32-20261021`을 ls-remote로 확인한 `c335f34575c6d45945fa50d69ffeb5628ecfa372` (MAP11-32c). 새 후보 `codex/sharp-01-20261021`, WT `~/exoduser-wt/SHARP-01`, 증거 `~/exoduser-wt/_out/SHARP-01/`. R은 읽기만, R Godot/import0. **정지 화면 선명도 VISUAL PASS**, 전체 맵 아트/120fps/PC 인수 완료가 아니다.

## 조사 → 현재값·조치·효과

| 원인 | 수정 전 현재값/관측 | 적용 | 효과·한계 |
|---|---|---|---|
| Mac Retina/HiDPI | allow_hidpi는 미기재지만 effective **true**. screen_scale2/DPI229/OS drawable2704×1756, system_profiler 물리 패널3024×1964·UI1352×878. 1080p 창 자체가 OS에서 무조건2배 확대된 상태는 아니었음 | allow_hidpi=true 명시, OS 디스플레이 설정 변경0 | HiDPI OFF가 원인이었다는 주장0. 이미 켜진 기능을 새로 켰다는 주장0 |
| 창/렌더 resolve | base1920×1080, window override1280×720, stretch=viewport/aspect keep/scale1/fractional. 창1280에서는1920→1280 최종축소. 창2560×1440에서도 render1920×1080, 화면으로1.3333배 확대 | stretch=**canvas_items**, aspect keep/scale1.0. default window override**1920×1080**. base1920×1080 유지 | 기본 창의 불필요한1920→1280 resolve 제거. 확대 창의 실제 framebuffer가**2560×1440**으로 증가, logical visible rect는1920×1080. 카메라FOV/zoom·actor scale 불변 |
| 크기 getter 함정 | viewport mode에서는 texture.get_size1920. canvas_items 확대 창에서는 getter가3414×1920을 보고 | 실제 `get_texture().get_image().get_size()`로 검증 | framebuffer readback은**2560×1440**. getter3414를 실제 렌더 해상도나3.16배비용으로 오보고하지 않음 |
| 지면 BC 손실 압축 | MAP11-32c의 ground22+floor_32b/veins_32b/foreground2 =26import compress/mode2/high_quality=false, S3TC BC. 색 블록 근사 존재 | 26개 모두 **compress/mode0 Lossless**, vram_texture=false/비S3TC ctex 확인 | 원본 PNG byte·해상도 보존한 채 BC 블록 손실 제거. 32c의 VRAM 절약을 의도적으로 포기한 품질 우선 후보. 디스크 PNG26장77170589bytes 불변 |
| 고목·소품·캐릭터 import | target32 고목/target30 floor_30c/주요 원화/Tour skull·pool·root/player south 등 이미 mode0, mipmaps=false, size_limit0, fix_alpha_border=true, premult_alpha=false | 그대로 유지 | 이미 무손실인 이미지를 다시 인코딩하거나 보이지 않는 해상도 증가를 주장하지 않음. alpha-border fix는 투명 경계 색 번짐 방지를 위해 보존 |
| mipmap/필터 | Viewport 기본Linear(값1), target32 sprite Inherit(0)→Linear. arena source LinearWithMipmaps(4), Tour CanvasTexture도 mipmap 필터 요청하지만 주요 PNG에는 mip chain 없음. player node Nearest(1) | 전역Nearest 강제/무조건 mipmap 제거 없음. 기존 확대 원화 mipmaps=false 및 캐릭터Nearest 보존 | 확대용 텍스처에 불필요한 mip를 새로 만들지 않음. mip chain이 없는 원화의 필터 숫자만 바꿔 개선했다고 주장0 |
| texel:pixel | 1080p START floor/고목 **1texel:.96pixel** (1.0417texel/pixel). 보스입장 floor/source 약**1:1.5032** (.6652texel/pixel). hero48×48 frame은 START **1:1.4**, entry **1:1.1274** | 원본을 그대로 선명하게 resolve. 화면배율/캐릭터·보스 scale 변경0 | source가 늘어나 표시되는 보스 원화·작은 캐릭터의 세부 한계는 남음. 48px 캐릭터를 HD 새 그림으로 복원한 것이 아님 |
| 서브픽셀 | snap_2d_transforms_to_pixel=false/vertices=false, START source sprite origin(244.8,718.8), player(960.0001,540.0002) 등 소수좌표 | rendering/2d/snap/**snap_2d_transforms_to_pixel=true**, vertices=false | 렌더 transform origin만 물리 픽셀에 정렬. 실제 actor/camera 좌표·충돌·보간 코어 불변. vertices까지 중복 스냅하지 않음. 이동 중1pixel 단위 움직임이 보일 수 있음 |
| 안개/grade/bloom | MAP11은 NativeFog2D/NativeEnvLight/NativeVignette 숨김, 화면FogGL은 측면/북경계 마스크만. 입구 LowMist alpha.035. arena 안개는 외곽ring1450~2100/중앙0. source grade identity/정적 색변환이며 neighbor blur 아님 | 안개/원화 팔레트/조명 유지 | 실제 분위기를 제거해 대비만 높이지 않음. 현재 전면 Gaussian blur/bloom가 주원인이라는 근거 없음 |
| resolve 후 미세 대비 | 기존 clarity pass 없음 | **WorldClarity CanvasLayer6** 단일screen pass, fog5 뒤/HUD10 앞. nearest screen sampler, native SCREEN_PIXEL_SIZE의5tap cross | START 껍질과 보스방 바닥 주름이 더 명확. HUD/메뉴 글자를 sharpening하지 않음. source 노이즈/새 점/디더링/새 이미지 생성0 |

[Godot 다중 해상도 문서](https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html) · [픽셀 transform 스냅](https://docs.godotengine.org/en/stable/classes/class_projectsettings.html#class-projectsettings-property-rendering-2d-snap-snap-2d-transforms-to-pixel). 실제 크기 판단은 이 후보의 readback receipt가 우선이다.

## 단일 약한 CAS 계열 패스 계약

AMD FidelityFX CAS의 공식 포트라는 뜻이 아니라, 로컬 대비에 적응하는 가중치를 쓰는 작은 자체5tap 필터다. `clarity_pass.gd`는 setup에서 CanvasLayer6/ColorRect/ShaderMaterial을 한 번 만든다. mouse_filter IGNORE, process/physics_process OFF. main/core/UI 코드 수정0.

| 항목 | 값/공식 |
|---|---|
| 입력 | screen texture5texel(center/N/S/W/E), filter_nearest/repeat_disable. SCREEN_PIXEL_SIZE로 실제 framebuffer 한 pixel 간격 |
| luminance | .299R+.587G+.114B |
| adaptive | sqrt(clamp(min(low,1−high)/max(high,.0001),0,1)), low/high는 이웃RGB min/max의 luma |
| weight | −.10×adaptive |
| local contrast | (center+weight×(N+S+W+E luma))/(1+4weight) |
| 제한 | local result를 low/high로 제한, center 대비 변화±.025 제한 후 .5혼합 → 최종 luma delta 최대±.0125. RGB도 원래5이웃 min/max 안으로 clamp |
| 합성 | RGB neighborhood 범위를 벗어나는 overshoot 제한, alpha1. UI 레이어10/전환·flash90은 패스 위에 그림 |
| 금지 요소 | 시간/랜덤/noise/디더링/점/신규 텍스처·이미지/런타임3D 없음. tick 목록API·ResourceLoader·material allocation0 |

## 동일 구도 캡처와 눈검수

원본 before는 c335f345 제품 코드/기존 import에서 촬영. after는 이 후보 코드/무손실 import. 1080p에서 실제 Main의 정상 카메라 도착 후 정지하고 source idle boss presentation fixture를 사용했다. 자연 보스 AI/HP/관문 클리어 검수는 아니다. 테스트가 frame0 idle_south를 고정하되 기존 전투효과/셰이더 TIME·HUD 값은 완전히 결정적이지 않아 모든 pixel 차이를 품질 차이라고 해석하지 않는다.

| 위치 | before/after가 동일한 계약 |
|---|---|
| START | player(0,3700), camera center(0,3700), zoom(.7,.7), 관측 offset(0,0), player scale(2,2), field transform(.7,.7;960.0001,−2050) |
| 보스방 입장 | player(0,−7200), camera center(0,−7541.45), zoom(.5637,.5637), 관측 offset(0,0), player scale(2,2), arena transform(.5637,.5637;960.0001,263.5327) |
| 카메라 보존 | 위 값은 이 frozen capture의 관측이며 기존 camera/zoom/offset/보스 scale 코드를 바꾸지 않음. physics interpolation Camera2D warning 기존 그대로 |
| 출력 | before/after 각1920×1080 PNG. 전체 비교3840×1104(board label24px). 1× crop은 원본 pixel 그대로, 재확대/리사이즈0 |

`captures/start_before_after.png`, `arena_entry_before_after.png`. 각각 `start_*/arena_entry_*_before.png`, `*_after.png` 원본도 있다. 바닥/껍질/캐릭터 1× 나란히6장: `start_floor_1x.png`, `start_bark_1x.png`, `start_character_1x.png`, `arena_entry_floor_1x.png`, `arena_entry_bark_1x.png`, `arena_entry_character_1x.png`.

**눈검수 PASS(선명도 범위)**: 고목 껍질의 갈라짐과 보스방 바닥 융기/주름의 미세 대비가 더 또렷하며, 크롭에서 밝은/검은 테두리 번짐이나 새 점·디더링은 관측하지 못했다. 색 팔레트·구도/플레이 공간 유지. 플레이어는 기존 작은 pixel-art 원본·Nearest를 유지하므로 새 고해상도 세부가 생기지 않는다. 큰 보스방 원화의 원래 부드러운 부분까지 모두 상세화했다는 판정이 아니다. 전체맵 아트의 이전 RETOUCH를 PASS로 승격하지 않는다.

확대 창 probe: before는2560×1440창에1920×1080 render, after는 readback2560×1440 render. getter3414×1920과 실제 readback을 구분했다. source/camera logical size는1920×1080 유지. default window1920×1080도 after startup에서 실제 readback1920×1080 확인.

## 최종 성능 — 유효1회, native2560×1440

| 항목 | 결과 |
|---|---|
| p95 / p99 | **9.793 / 11.219ms** |
| mean FPS | 140.063 |
| focus_lost | **0** |
| 입력 | field(0,3650), 실제Player left/down/right/up×150physics ticks, accepted=True, 관측612ticks/1429render frames |
| 이동 | 90.142world. 적/CC/충돌이 살아 있어 결정적 경로·200world 초과를 주장하지 않음 |
| 렌더 | Godot4.7.2 GL Compatibility / Apple M5 Pro, 실제 framebuffer2560×1440, logical1920×1080, vsync OFF/max240 |
| draw / objects | 표본 끝 123/224. 고정 명령 수 비교가 아니라 실시간 전투 포함 |
| video memory | 3291730949bytes / 3139.239MiB, 표본 끝 monitor |
| viewport CPU / GPU | 표본 끝 CPU 0.478ms, GPU API0은 미계측. GPU0ms/병목없음 주장이 아님 |
| 동시성 | 시작부터 종료까지54관측 모두 own+81277 이하. 다른 Codex 프로세스 변경0, 81277 입력/종료/재시작0 |

1080p 대비 native1440p는2.0736M→3.6864M pixel(**+77.778%**). 무손실 texture와screen copy/pass1개의 비용도 추가됐다. 이전 MAP11-32c의1920×1080 p95 9.122ms/VRAM p95 2825851708bytes와는 시점·해상도·전투상태·모니터 시점이 달라 **순수 HiDPI 비용/개선율로 빼지 않는다**. 이번 단회 값이 실제 고품질 후보의 비용이다. 120fps/8.33ms 목표는 미달이며 속도 개선 완료 주장은 없다. 추가1920p95나 native1440p 반복 평균은1회 지시 때문에 측정하지 않았다.

처음 performance 실행은 포커스 대기 후 결과JSON이 없어 표본 시작 없음으로 보존했다(`final-before-sample-focus-timeout/`). 다음 focus0 표본11.016/13.484ms는 ZOOM-01 editor/import가 중간에 나타난 것을 프로세스 대조로 확인해 `final-concurrency-invalid/`에 보존하고 제외했다. 추가 표본10.595/12.713ms도 ZOOM-01 GUI capture가 겹치며 focus_lost876으로 `final-focus-and-concurrency-invalid/`에 보존/제외했다. 이후81277만 존재하는 상태를30초 간격으로2회 확인한 뒤 실행했다. **느려서 재측정한 것이 아니다**. 위 최종값만 단독조건/포커스0을 충족한 유효1회다. CUA는 자기 앱의 고유 제목 `지옥의 길 · 썩은 숲 입구`를 확인한 뒤 제목줄만 포커스했다. 81277은 건드리지 않았다.

field41/stage_provider54/seam18, 각1회 **113checks/0fail**. 출력은 각test log와tests-summary.json. 이 테스트는 새 후처리/시각 PASS의 대용이 아니다. 최종 Main script/shader ERROR0, 기존 Camera2D physics interpolation WARNING 유지. 모든 Godot 실행은 EXODUSER-SHARP-01-Isolated 또는 각 테스트 격리user dir; EXODUSER-Godot-Native-First 접근0. commit에는 원래 application user-dir 이름을 복원하고 품질 설정만 포함한다.

## MAP PRODUCTION REPORT

STAGE: Godot CH1-1 START와보스방입장 렌더 파이프라인.
MASTER: silhouette/regions/main route/side spaces 불변.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH·holes 불변, 카메라 배치 수정0.
LARGE: 기존 source assets/composites/overlap/repeated silhouette 유지, source PNG 변경0.
MEDIUM: connections/holes 불변.
GROUND: 기존 shade/contamination/structure integration 보존, BC손실 제거·native resolve/약한 대비 복원.
PLAYABLE: arenas/travel/breathing/threat·이동/스폰/충돌/전투코어 불변. 단일screen pass의 비용은 위 단회 값.
LANDMARK: primary/secondary/tertiary 불변.
CAMERA QA: START/ARENA_ENTRY beforeafter1920+literal1x PASS(선명도). EARLY/SIDE/LANDMARK/LATE/EXIT 신규 아트검수 범위 밖.
TECH QA: field/provider/seam113/0, script/shaderERROR0. native2560 readback 확인, 유효p95는 위 표. 장시간 이동 snap jitter·다른 OS/PC 성능은 미검증.
FILES: project.godot/26import/product_scene mount/clarity pass script+shader/test-only harness/관련docs. 타인WIP·PCcore·번역CRLF 변경0.
GIT: 새 codex/sharp-01-20261021, parent c335f345, 정상hooks/경로add/비강제push. 최종SHA/원격확인/clean WT제거는 외부DONE. main push/배포0.

**VISUAL VERDICT: PASS — 렌더·임포트 선명도 한정. PERFORMANCE: 120fps 목표 미달.**

NEXT PASS: 원본48px 캐릭터나 확대 원화의 새로운 세부는 사용자 결정 대기 중인 별도 고해상도 원본 작업이 필요하며, 이번에 생성/외부업스케일을 실행하지 않았다. PC 전투/source clock 병목은 기존32c 인계 범위 유지.

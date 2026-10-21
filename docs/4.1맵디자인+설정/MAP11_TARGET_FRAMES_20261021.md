# 1-1 맵 목표 화면 2장 — 장면 우선 제작 원칙 (2026-10-21)

> 사용자 판정: "다 컨셉 이미지는 그럴듯한데 구현하면 따로 놀고", "맵도 좀 엉성하고 아직도".
> 상위: [MAP_IMPROVEMENT_PROJECT](MAP_IMPROVEMENT_PROJECT.md) · [MAP_LOOK_GODOT_PASS1](MAP_LOOK_GODOT_PASS1_20261020.md).

## 1. 목표 화면

| 파일 | 용도 | 핵심 |
|---|---|---|
| [target_frames/ch1_field_corridor_target.webp](target_frames/ch1_field_corridor_target.webp) | 1-1 필드 통로 | 회보라 바닥·검붉은 핏줄 균열·이끼 웅덩이, 양옆 고목이 액자처럼 길을 감싸고 안쪽 차가운 빛으로 시선 유도, 깊이 안개 |
| [target_frames/ch1_boss_arena_target.webp](target_frames/ch1_boss_arena_target.webp) | 1-1 보스룸(원형 전투장) | 살덩이 바닥·핏줄·이빨 돌기, 입 달린 나무와 알주머니가 원형 경계, 둘레 안개, 위에서 비스듬히 내려다보는 2.5D 시점 |

## 2. 왜 따로 노는가 (원인)

1. 부품(나무·바닥·소품)을 각각 다른 날·다른 프롬프트로 생성 → 빛 방향·채도·그림자·그림체가 제각각.
2. 채택 판정이 부품 단독 이미지 기준 → 게임 화면에서 어울림은 나중에야 확인.
3. 땅↔나무↔안개를 잇는 접합층(접지 그림자, 뿌리 데칼, 색 보정, 높이 안개)이 비어 있음.
4. 바닥이 반복 타일 → 그림의 "한 붓으로 이어진 바닥"이 사라짐.

## 3. 원칙 — 부품 조립 → 장면 분해로 순서를 뒤집는다

| 단계 | 내용 |
|---|---|
| 장면 먼저 | 위 목표 화면처럼 장면 1장을 먼저 확정한다 |
| 층 분해(paint-over split) | 목표 그림을 바닥판(나무·소품 지우고 채움) / Y정렬 소품(둘레 나무·알주머니를 구간별로 잘라 충돌 영역과 일치) / 전경(화면 가장자리 가지, 시차 이동) / 효과(알주머니 맥박 셰이더, 핏줄 발광 마스크, 둘레 안개 입자, 입 벌림 짧은 애니메이션)로 쪼갠다 |
| 룩 고정값 | 목표 그림에서 빛 방향·팔레트(회보라+검붉은색)·색 보정 LUT·안개 색과 짙기를 뽑아 고정. 새 부품은 이 값으로 생성·보정한 뒤에만 채택 |
| 접합층 필수 | 나무마다 뿌리 데칼+접지 그림자 세트, 바닥판 위 부드러운 가장자리 데칼 |
| 판정 기준 | 부품 단독 이미지는 판정 대상이 아니다. 게임에 배치해 같은 구도로 캡처한 화면(1920×1080, 1x 크롭 포함)을 목표 그림과 나란히 놓고, 같은 장면처럼 보일 때만 완료 |

## 4. 한계와 대응

| 한계 | 대응 |
|---|---|
| 시점 고정 | 2.5D 고정 카메라 각도와 맞춰 쓴다. 각도 변경 불가 |
| 해상도(원본 폭 2000px) | 보스룸 지름에 맞춰 업스케일 후 디테일 보강(점·디더링 금지 — CLAUDE.md 8항) |
| 큰 필드는 한 장으로 못 덮음 | 필드는 구역별 바닥판 + 데칼 혼합, 구역 경계는 데칼로 이음 |

## 5. 첫 시제품 순서

1. 보스룸: 목표 그림 1장으로 바닥판·둘레·전경·효과 층 분해 → 현재 보스룸 provider(MAP11-02, R1700)에 적용 → 나란히 비교 캡처.
2. 필드: 첫 구역 1곳만 같은 방식으로 → 비교 캡처.
3. 비교 결과의 차이 목록을 이 문서 아래 표로 누적하고 하나씩 줄인다.

| 날짜 | 장면 | 비교 캡처 | 남은 차이 | 판정 |
|---|---|---|---|---|
| 2026-10-21 | MAP11-30 보스룸 입장: 중앙→북 경계 | `~/exoduser-wt/_out/MAP11-30/captures/compare_target_vs_game.png` | 단일 원화 층 분해 첫 시제품. floor 세로 확대·clone/반사·북 경계 잘림·mouth 배치/중복·crop 접합 잔여. 아직 같은 장면 아님 | **FAIL** |
| 2026-10-21 | 같은 구도 1x | `~/exoduser-wt/_out/MAP11-30/captures/compare_1x.png` | 전체 덩어리 호흡만, 국소 pod/입2프레임 미완. 전역 LUT 대신 source identity+legacy용 측정 curve 보관. [정확 수치·단회 검수](MAP11_30_TARGET_SPLIT_20261021.md) | FAIL / 첫 시제품 보존 |
| 2026-10-21 | MAP11-30b 보스룸 같은 입장 구도1920×1080/1x | `~/exoduser-wt/_out/MAP11-30b/captures/compare_target_vs_game.png`, `compare_1x.png` | source 1px→화면.96px/균일world2.6667로 바닥 결·타원·나무 위치를 목표 화면에 대응. BACK 중복/직선 경계 크게 감소. 잔여: 일부 feather/clone/안개 차이, 화면 foot와 unprojected collision 접촉 미검수. 알주머니 국소UV/입2자세 추가. p95 **8.734ms**, focus_lost0, 단회 유효이나8.33초과 | **RETOUCH**, 성능예산 FAIL. [정확값·검수](MAP11_30B_PROJECTION_20261021.md) |
| 2026-10-21 | MAP11-30p 같은 보스룸 성능 | `~/exoduser-wt/_out/MAP11-30p/captures/compare_target_vs_game.png`, `compare_1x.png` | 정적15층 bake/바닥패스통합·zero-alpha fog cull·미사용15texture preload제거. 화면유지 PASS(평균RGB차.008996/255). 같은조건 A9.534/B9.071, 최종p95 **8.558ms**/focus_lost0/104draw. 기존feather/clone/표시충돌접촉잔여유지 | **RETOUCH / 성능예산 FAIL**(8.33초과.228ms), 복구완료 아님. [정확값·진단](MAP11_30P_PERFORMANCE_20261021.md) |

| 2026-10-21 | MAP11-30c 축척·캐릭터 접지·바닥 | `~/exoduser-wt/_out/MAP11-30c/captures/compare_target_vs_game.png`, `near_melee.png`, `compare_1x.png`, `motion_0s_2s.png` | 웹 정면 근접48:473.105:1080 대응, zoom입장.563700169/최대.8. 공유red rim/ambient·soft AO·기존연속균열 정적합성. 실제Main live0/2초 효과 확인. p95 **7.738ms**/focus_lost0 단회(후검토 보정 경계는 보고서). 잔여: 원화결의 부드러움/overview clone·접합/자연전투 미검수 | **RETOUCH**, [측정·차이표·MAP REPORT](MAP11_30C_SCALE_INTEGRATION_20261021.md) |

| 2026-10-21 | MAP11-32 필드 START→첫 통로1920×1080/1x | `~/exoduser-wt/_out/MAP11-32/captures/compare_target_vs_game.png`, `compare_1x.png` | 원화배율1.3714285714/기존줌.70·투영.6, 고목5컷/바닥clone·600px접합/rootAO/전경/낮은안개/흰빛/핏줄. START 같은구도 대응, 북접합 clone반복·기존색차·최상단fade 차이 잔여. 관련6종237/0. 유효1회 p95 **11.676ms**/focus_lost0, 무효선행7.942ms/focus1666은 제외 | **RETOUCH / 성능 FAIL**, [정확계약·차이표·MAP REPORT](MAP11_32_FIELD_TARGET_SPLIT_20261021.md) |

| 2026-10-21 | MAP11-32b 같은 START/EARLY·1x | `~/exoduser-wt/_out/MAP11-32b/captures/compare_target_vs_game.png`, `early_boundary.png`, `motion_0s_2s.png` | START zoom.70 유지, 무반사 native ground patch로 북미러/검은 hole/큰 떠 있는균열 제거. 정적22tile/전경trim에도118→124draw·219→225objects, 유효p95 **11.806ms**/p99 **12.905ms**/focus0. 넓은ground 결 부드러움 잔여 | **VISUAL RETOUCH / 성능 FAIL**, [정확값·실패경계](MAP11_32B_FIELD_BAKE_20261021.md) |


## UPSCALE-01 — 로컬 Real-ESRGAN 적용 (2026-10-22, 10-21 지시)

기준/정상 부모 `6da38c312326635fcb1424bebbac2b26b4a41350`(SHARP-01 / MAP11-32c·30c 포함). 별도 `codex/upscale-01-20261021` 후보다. main/PC/사용자의 열린 81277에 적용·재시작하지 않았다. 아래는 이 후보의 현행 자산 계약이며 위 MAP11-30/32 제작 기록은 당시 이력이다.

### 입력·도구·재현

| 항목 | 계약 |
|---|---|
| 도구 | `~/exoduser-wt/_tools/realesrgan/bin/realesrgan-ncnn-vulkan`, `realesrgan-x4plus`, `-s 4 -t 256`. **모델 파일이 있는 bin 디렉터리를 cwd로** 실행. 최초 다른 cwd 호출은139 종료, 올바른 cwd에서 정상 완료. 이를 모델/포인트 부족으로 해석하지 않음 |
| 모델 비교 | field 원본 전체를 x4plus / x4plus-anime 각 처리. `model_compare.png`의 동일 source crop 비교에서 x4plus가 껍질·균열을 보존, anime는 면을 단순화하여 제외. runtime anime0 |
| 최초 원화 | 기존 제공 PNG2000×1125 두 장을 입력. `godot/tools/upscale01_sources/`에 동일 byte 보존·sha256.json. docs WEBP나 잘라낸/축소된 floor·tree PNG를 ESRGAN 입력으로 쓰지 않음 |
| 북쪽 입력 | root/moss는 기존 `assets/map/ch1/floor_objects/prop_g_root.png`, `assets/map/ch1/collision/prop_pool.png`; blood는 승인1920² 최초 PNG(축소 전) 보존. skull0/2는 MAP11-21c의 최초 offline PNG render400px 원본을 보존하여 입력. GLB 재로딩/렌더0 |
| 주 파이프라인 | `python godot/tools/map11_upscale01.py --work <out> --sources godot/tools/upscale01_sources`. Pillow11.3/NumPy2.0.2/OpenCV5.0.0.93. 기존 `map11_30_split.py`/`map11_32_split.py`를 scratch에 실행해 authored polygon·alpha 추출; RGB는 보정한 최초 x4 원화에서 다시 sample. 중간판을 모델에 입력하지 않음 |
| 좌표 보존 | 논리 source2000×1125, 필드scale1.3714285714·center(0,3520), 보스scale2.6666666667·center(0,120)·floor extent10922.6666667 유지. 고목 offset×density / sprite scale÷density. 원본 foot·collision·source_box 고정. 화면밖 cached rect 컬링 유지 |
| clone 층 | field32b의 저장된 patch source/center·원래 seed32021 배치를 재사용. 반사 없는 patch 누적/기존 .78+.22 palette·START keep·북 fade 유지하되 source를 고해상도로 연속 sample. 기존32 splitter clone/arena reflected source clone도 동일 논리 좌표에서 재계산 |
| 보스30c | 기존 floor_detail의 연속 root/crack 층 유지. static root/shadow/BACK alpha를 고해상도 floor에 offline 합성하여 shader의 추가 underlay lookup 제거. 원본에서 새 BACK RGB를 취하며 기존 shadow의 RGB비율 유지 |
| 소품 파이프라인 | `python godot/tools/map11_upscale01_props.py <out>`. root/moss/blood는 기존 accepted colour treatment와의 저주파 차(σ4)만 복원. skull은 원render→accepted diffuse의 RGB ratio(.25~3.5, 분모≥12)를 고해상도 원render에 적용. 추가 unsharp0 |
| GPU/저장 | 새 PNG55장 모두 Lossless mode0·mipmap false·size_limit0. 기존 plain PNG 관례, 100MB 초과 파일0/LFS 신규 규칙0. 실제 저장 폴더 접근0, `EXODUSER-UPSCALE-01-Isolated`와 각 test 고유 격리폴더만 사용 |

### 색 보정·밀도·메모리

색은 source/downsampled-x4의 channel 평균 차를 RGB에 더한 뒤 opponent chroma gain을 적용한다. gain=clamp(mean(abs(original−RGBmean))/mean(abs(x4low−RGBmean)),.95,1.10). clip0~255; 노이즈/디더/추가 샤픈0. 필드 신규 clone palette의 핏줄은 기존 **#351f29**, ground#55515e/moss#454b40 유지. SHARP-01 WorldClarity의5tap·최대 luma delta±.0125는 변경0. 1x에서 새 halo/점/디더링 관측0.

| 원화 | 평균 RGB 가산 (0~255) | chroma gain |
|---|---|---|
| ch1_field_corridor_target | 3.649719, 2.294846, 1.954475 | 1.022517 |
| ch1_boss_arena_target | 2.639702, 2.025152, 0.598986 | 1.056542 |

| 교체군 | 출력·밀도 | 메모리/품질 선택 |
|---|---|---|
| field source floor/clone/root AO | 논리3200×3725 →4800×5588, 1.5×; 9tile | core≤2046 +1texel bleed 양쪽, 실제각변≤2048. 1080p1.5625texel/pixel·1440p1.171875. Retina2 목표보다 낮은 곳은 남으며 4×상주하지 않음 |
| field 고목5/전경2 | source cut 각1.5×, 기존foot/시차.025 | 무손실. 최대변≤2048, source offset/월드크기 유지 |
| arena floor/clone/30c detail | 논리4096² →8192², 2×;25tile | core≤2046+bleed. 입장1080p 약1.3305texel/pixel·1440p 약.9979. 사용자 줌 미변경, 최대zoom에서 밀도는 더 낮아질 수 있음 |
| arena 둘레7/전경2 | source cut2×, 전경4000×610을2000×610 두 장 | source_box·pod/mouth UV 논리좌표/시차.08 유지 |
| 북 root/moss/blood | 1024×1022 /1280×1040 /1024×1053 | 원본source에서 모델 처리→필요밀도로 축소·accepted색/알파 복원 |
| 북 skull0/2 | 562×600 /621×600 | 최초400px render에서 x4 추론 후1.5× 출력, 게임 높이310/225 유지 |
| 새55장 총 | 아래 실측 inventory 참조 | PNG145.523388MiB / RGBA429.890106MiB(미립맵 제외). 무손실 채택, S3TC/BPTC는 이번 후보 미채택·품질/메모리 이득 미측정 |
| S3TC/BPTC 이론 | 같은 pixel에서 BC3/BC7 약107.472527MiB | 4bpp BC1은 alpha품질 부적합. BC3/7도 손실이므로 실제 화질 검수 없이 채택하지 않음. 이 행은 산술 추정이며 실측VRAM이 아님 |
| 실제1080p Main monitor | before3268263209 → after3683076161 bytes | **+414812952bytes /395.596458MiB**. capture receipt 같은renderer/해상도, 전체게임 포함 값으로 texture만의 추정과 구분 |
| 실제1440p 단회 monitor | SHARP 이전3291730949 → 이번3706543901 bytes | +395.596458MiB. 서로 다른 실행 시점이며 엄밀한 동시 A/B 아님 |

전체 active replacement별 해상도/PNG bytes/RGBA 추정/sha256은 `godot/assets/maps/map11/upscale01/manifest.json`, 북 원본 provenance는 `north/manifest.json`, 외부 `runtime-assets.json`에 있다. preload는 setup만, tick 목록API/ResourceLoader/material 할당0. 타일은 모두 preload하므로 화면밖 컬링은 draw를 줄이며 texture 메모리 해제를 의미하지 않는다.

### 북쪽 접합 리터치 수치

| 대상 | 적용 |
|---|---|
| 받침 root판 | brightness detail=clamp((L−25)/48), radius=hypot((u−.5)/.52,(v−.56)/.55), 불규칙sin(u×25)/sin(v×31)와 .45 fade·smoothstep. alpha×edge×(.15+.55detail). 넓은 어두운 타원판 대신 기존 뿌리의 밝은 결이 남음 |
| 피/이끼 | radius=hypot((u−.5)/.58,(v−.5)/.58); reach=.13sin(26u+7v)+.10sin(29v−9u)+.10detail+.10red. .46fade/smoothstep, alpha×.62/.64. detail은 원본결과 σmax(2,width/120) 평균 차/8, red=(R−G−4)/30. 기존 source 혈관/균열의 불규칙 번짐. RGB는 σ.55 blur25%만 혼합 |
| skull 하단 | 마지막8.5%에서 불규칙sin(33u) 알파 전이, 밝은 뼈(L−28)/45 보존. bbox foot을 그대로 땅에 정렬 |
| 접촉 그림자 | root/pool의 확대복제 AO 제거(기존foot+3/1.025×1.035/alpha.12 제거). skull은 기존actor_contact128² 재사용, 발(0,−3), 폭bbox×.64/높이16world, alpha.38, z−2976. 번지는 넓은 타원 그림자 제거 |
| shader | north32c_ground의 두 번째 radial oval alpha cutoff 제거, offline irregular alpha 사용. 기존 palette mix.82 유지 |

### 검수·성능·경계

| 검수 | 결과 |
|---|---|
| 지정5종 각1회 | field41 /stage_provider54 /seam18 /30b34 /arena_preview35 = **182 checks /0fail**. 로그는 test_*.log /tests-summary.json. 30b의 source-scale 검사는2×밀도 보정한 동일world scale/같은tile origin으로 갱신 |
| 화면 | 실제 Main의 START·보스방입장·북경계, before/after 각1920×1080, literal1x 바닥·고목·소품. `~/exoduser-wt/_out/UPSCALE-01/captures/`. 북경계에서 전투밀림으로 camera center가 달랐던 초안 after/after-final은 외부 보존·판정 제외. 최종 early는 test-only freeze에서 player/camera(-500,2550)·카메라 physics interpolation OFF/reset으로 고정해 before center(-499.9999,2550.001)과 일치. 제품 camera코드/zoom/scale 변경0. START/ARENA_ENTRY는 after-final 그대로. UI/전투의 시간·적상태까지 동일pixel 보장하지 않음 |
| 성능 유효1회 | native2560×1440, logical1920×1080, M5Pro/GL Compatibility, p95 **9.798ms**, p99 **10.732ms**, mean138.681FPS, focus_lost0, 613ticks/1417frames, 실제입력 accepted/128.781world 이동 |
| 동시성 | 시작 전81277만 존재→30초 재확인. 관측58회 최대own+81277=2. 다른 import PID71249는 결과작성00:03:10 이후00:03:14 시작으로 sample과 겹치지 않음. 자기Godot 종료·81277 보존 |
| 비교 경계 | 이전SHARP 단회9.793ms와 이번9.798ms 차이는 .005ms지만 인과적 비용/성능동일 보장은 아님. **120fps/8.33ms 미달**. GPU API0은 미계측 |
| 눈검수 | 보스방 바닥 융기·고목 수피의 선명도 향상, 새 점/디더/과샤픈halo 관측0. 북쪽 넓은 어두운판·떠있는 그림자 제거, 피는 주변 균열로 옅게 연결. 전체맵 clone/원래mask/fog 한계와 다른 zoom/PC 검수는 남음 |

### MAP PRODUCTION REPORT — UPSCALE-01

STAGE: CH1-1 Godot field START/early_boundary + arena entry.
MASTER: silhouette/regions/main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 배치·hole 유지; source 재sample만.
LARGE: 최초 목표원화2·북소품원본; source cuts/overlap/repeated silhouette 위치 유지.
MEDIUM: 북 받침판/웅덩이 transition만 리터치; 전체맵 hole 신규검수0.
GROUND: floor/clone/rootAO 고해상도 재구성, 북 irregular alpha/짧은foot shadow.
PLAYABLE: arena/travel/breathing/threat/geometry·collision·PCcore·캐릭터/보스/카메라 스케일 유지. 동일Main 읽기 검수.
LANDMARK: primary/secondary/tertiary 배치 유지.
CAMERA QA: START/ARENA_ENTRY/EARLY 1920+1x 선명도·접합 검수. SIDE L/R·LATE·EXIT 전체board 범위 밖.
TECH QA: 지정5종182/0, source/model/render receipts 보존, 성능위표·VRAM위표. runtime3D0.
FILES: 새upscale01 PNG/재현도구·원본, map11 visual owners·tile shader·capture harness·30b검사·관련docs. PCcore/타WIP 변경0.
GIT: SHARP-01 부모의 새후보, 경로add/정상hook/자기branch 비강제push. exactSHA/remote읽기는 외부DONE. main push/deploy0.
VISUAL VERDICT: **PASS — 요청한 선명도·북접합 범위. 전체맵 아트와120fps는 미완료.**
NEXT PASS: 사용자 줌 결정에 맞춘 texel밀도 재평가, 전체map 반복·원래crop boundary 검수는 별도 범위.

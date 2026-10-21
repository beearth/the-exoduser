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


## MAP11-33 — 고해상도 마감 리터치·맵 텍스처 예산 (2026-10-22)

기준/정상 부모 `24662224dd40a5de45e68b5dec9d5d2c4a2736b1`(UPSCALE-01), 같은 `codex/upscale-01-20261021` 후속. 아래가 이 후보의 현행 계약이며 위 UPSCALE-01/30/32의 메모리·북접합 수치는 당시 이력이다. R 콘텐츠 읽기만, 실제 변경/실행은 `~/exoduser-wt/MAP11-33`. main/PC 인수·배포 아님.

### 리터치·좌표 계약

| 대상 | 현행 수치·구현 | 보존/검증 |
|---|---|---|
| START 좌하단 직각 | 원인은 floor가 아닌 `foreground_32b_0` 하단(화면 y≈951). 새 `finish33/foreground_0.png`: h−1−y를 reach=64+15sin(x/23)+9sin(x/11+.7)로 나눈 smoothstep 알파. RGB 그대로 | fragment 232×285·원래 시차/배치/스케일 그대로, 화면 x<140/y>950의 직각 절단 제거. 반복·미러·확장 클론 추가0 |
| EARLY 숲 수평 시작 | 고목5컷의 공통 source y0 경계를 불규칙 전이. source sx=box.x+x/1.5, sy=box.y+y/1.5; start=22+18sin(sx/71)+12sin(sx/31+.9), width=130+35sin(sx/137+.3)+25sin(sx/53); alpha×smoothstep((sy−start)/width) | RGB/밀도/배치 유지. `target32_fog.gdshader`/원래 안개 값 불변. 직선 띠의 실원인인 고목 공통 마스크 시작만 분산 |
| 해골 발 피벗 | `bones0` source y578 / `bones2` y582를 발로 사용(기존600px bbox의 가는 파편 아래끝 대신 alpha>96의 폭10% 이상인 마지막 dense row+1). 높이310/225, foot(−1300,2260)/(640,1820) 유지 | 카메라/플레이어/보스 스케일0변경. 발치만 22/18source px 정렬 |
| 해골 접촉 AO | actor_contact128² 재사용. 위치 foot+(0,1), 폭bounds×.84/높이24world, alpha.68, z−2976 | 기존 폭.64/높이16/alpha.38/위치−3을 대체. 짧은 접촉만, 큰 검정 타원 추가0 |
| 해골 흙 덮임 | v=y/h. soil=.46×smoothstep((v−(.875+.018sin(x/19)+.012sin(x/7)))/.105), RGB를(65,57,66)로 soil 비율 혼합. alpha×(1−.24smoothstep((v−.955)/.045)) | 하부 국소만. 머리·수피·바닥RGB/샤픈/밀도 불변 |
| 공용 필드 bake | `finish33/ground` 22장. core는 원본(2,2)~(2050,2050)의 nonzero-alpha bbox, 2texel bleed 보존. region/position을 crop offset만큼 보정. 완전불투명5장은 RGB8 | 재구성 core의 alpha 전부 동일, alpha>0의 RGBA byte 동일을 도구 assert. 원본 target32b는 Git 복구용 보존/실제 preload0 |
| legacy 아레나 | `product_arena_view`는 독립 Node2D, 옛 renderer 상속/생성·숨김 경로 제거. 동일 target mount/카메라rect/원형mist/외곽foot7개 유지. legacy lighting 접촉 loop 제거 | 옛 baked112MiB·ritual16MiB·static_underlay 등 캐시0 확인. 옛 파일/preview 코드 보존. provider 충돌/R1700/전투core/저장 불변 |
| import | 새30PNG Lossless mode0, mipmap false, size_limit0. 새 UID는 Godot가 생성(원본UID 복제 안 함) | 런타임3D/새 생성/inpaint0. tick 목록API/ResourceLoader/material 할당 신규0. QA 캐시열거는 test capture 시에만 수행 |

재현: `godot/tools/map11_33_finish.py`를 UPSCALE-01 기준에서 1회 실행. 기존 PNG에서 마스크/무손실 crop만 파생, 리샘플·샤픈0. `finish33/manifest.json`에 소스/출력 SHA256·규격·format 기록. 제품 경로는 target32_scene/north32c_tour/field_ground_bake의 setup 소비 경로로 연결.

### 텍스처 메모리 예산 — 전체 모니터와 분리

집계는 실제 Main START 캐시의 각 Texture2D `get_image()` 해상도/format/mipmap/data size를 1회 읽었다. EARLY/ARENA에서도 cache 존재를 확인. 전후 모든 map/mapS 이미지 후보를 검사하고 미로드를 구분했다. GPU 할당기 실측이 아닌 추정치이며, 물리 VRAM/driver tile/align overhead는 별도다.

**1-1 예산 경계**: 캐시에 남은 모든 `/map11/` 자산 + 공유 `/map/props/` 전체(실제 사용 여부보다 보수적) + field/arena scene·shader sampler 경로 + 기존 field setup의 ground_dark_soil/prop_g_edge/prop_ice_gcrack/flesh_g_0까지 포함. 다른 장의 Main 공용 catalog 캐시는 아래 별도 행·전체 표에 전부 공개한다. 화면 밖 preload/숨김도 예산에 포함한다.

| 구분 | 전 | 후 | 판단 |
|---|---:|---:|---|
| 1-1 텍스처 수 | 185 | 180 | 전후 경로 합집합 아래 표, 교체 전후 동시상주0 |
| 1-1 imported texel data bytes | 1163152872 (1109.269020MiB) | 879721040 (838.967361MiB) | mipmap false. L8=1/RGB8=3/RGBA8=4byte |
| **1-1 보수 GPU 추정** | **1267507176 (1208.789040MiB)** | **988351648 (942.565582MiB)** | 각 파일 max(data bytes,W×H×4): RGB/L8도4byte padding 가정. **0.988351648GB ≤ 1.0GB**, 여유11,648,352bytes. driver overhead 포함 보장 아님 |
| 필드 bake 22장 data | 353.376343MiB | 223.464821MiB | 투명 여백trim/opaque RGB. crop 후 GPU가RGB를4byte로 저장하면 해당 이득 일부 감소(위 보수행 반영) |
| Main 타장 포함 map-cache data | 1735446912 (1655.051147MiB) | 1448869352 (1381.749489MiB) | 1-1 예산과 구분. 원래 전장 catalog preload가 남음 |
| Main 타장 포함 map-cache 보수 GPU | 1857888596 | 1574538764 | **1.574538764GB로 1GB 초과**. Main의 모든 map계열 상주까지1GB 달성했다고 주장하지 않음 |

가장 큰 잔류: arena 고해상도 floor 약256MiB, field 고해상도 floor 약102MiB, 전역필드 crop bake 약243MiB(4byte보수), Tour diffuse/normal/contact와 source catalog. field는1080p1.5625/1440p1.171875 texel/pixel, arena입장1.3305/.9979 유지. 사용자 줌 미확정/1440p 수피·바닥 선명도를 지키기 위해 밀도 축소/BC손실 압축은 미채택. 불투명5bake만RGB, alpha필요floor/소품은 유지. 다른장 Main catalog 최적화는 해당 loader 담당 범위로 남김.

### 검수·성능·눈검수

| 항목 | 결과·증거 |
|---|---|
| 지정 테스트 각1회 | field41 /stage_provider54 /seam18 /30b34 /arena_preview35 = **182checks/0fail**, ERROR0. `tests-summary.json`/test_*.log. 마지막 해골pivot 조정은 비전투 cosmetic이며 최종Main capture로 별도 확인 |
| 실제 Main after | `~/exoduser-wt/_out/MAP11-33/captures/` start_after /early_boundary_after /arena_entry_after 각1920×1080, before 및 literal1x13board. capture camera fixture만 고정, 실제 제품camera/actor 크기 불변 |
| 선명도 | UPSCALE-01 원해상도/원RGB·clarity pass 유지. 수피/바닥1x에서 blur/halo/선명도 저하 관측0. 원화 mask가 바뀐 가장자리만 의도적으로 연화 |
| 눈검수 | START 직각 cut 제거PASS. EARLY 공통수평선 분산PASS, 해골 발pivot/AO·soil 개선PASS. 아레나 바닥/고목 유지PASS. 숲→열린흙이라는 큰 구성전이 자체·전체맵 반복은 이번 범위의 전체아트 승인 아님 |
| 필드 성능1회 시도 | **p95=N/A, focus_lost=N/A, 유효 샘플0.** 시작 전81277만/30초 대기 후 실행. 격리 실행창 포커스60초 확보 실패(`focus-unavailable.txt`), `_measure_native` 호출 전 종료. macOS frontmost 조회 `loginwindow` 상태. 자신의 PID75534 frontmost 요청1회만, 잠금해제/다른창조작0. 잠긴상태 수치를 성능으로 채택하지 않음 |
| 동시성 | 성능대기 관측147회 최대3개(81277+자기75534+다른Codex75587). 타Codex는 포커스대기 중 등장, 유효측정 없음. 자기Godot 종료·81277 살아있음 확인. 다른 프로세스 종료0 |
| 실행 격리 | 각 실행 `override.cfg`로 isolated user dir 명시, tests는각자기정해진Isolated명. 실제 저장폴더 접근0. 임시override는커밋전제거 |

### MAP PRODUCTION REPORT — MAP11-33 (§23)

STAGE: CH1-1 START/EARLY/ARENA_ENTRY 마감.
MASTER: 기존 silhouette/regions/남START→북EXIT/main/side route 보존.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 배치 유지, 좌하단 hardcut·EARLY 공통mask 시작만 불규칙 연결; 전체map hole 재검수 아님.
LARGE: 기존원화/UPSCALE01만, 새합성silhouette/반복/미러 추가0, 기존overlap 유지.
MEDIUM: START foreground 끝/북쪽 고목 전이 개선, 전체map 타구간 잔여 미검수.
GROUND: skull dense-foot pivot/짧은AO/흙오염, 바닥 cropRGBA 일치.
PLAYABLE: main arenas/combat void/travel/breathing/threat/충돌/전투core/저장 보존, 화면가독성 유지. 자연보스전 별도 미검수.
LANDMARK: 기존primary/secondary/tertiary 배치 유지.
CAMERA QA: START PASS/EARLY 범위PASS/ARENA_ENTRY 선명도PASS. SIDE_L/R/LANDMARK/LATE/EXIT 전체board 미실시.
TECH QA: route/collision/seam/preview 위5종182/0; 404해당없음(native)/리소스로드ERROR0; 성능포커스미확보로N/A.
FILES: map11전용 visual owners5·finish33 PNG30/sidecar·재현도구/QA harness·관련docs. 타팀/PCcore 수정0.
GIT: 같은branch 정상hook·경로add·비강제push, exactSHA/remote readback은 외부DONE. main push/deploy0.
VISUAL VERDICT: **PASS — 요청된 세 국소 리터치/UPSCALE 선명도. 전체맵 완성 판정은 RETOUCH 유지. PERFORMANCE: 미검증(유효 샘플0).**
NEXT PASS: 잠금해제된독점실행구간에서 field p95/focus0 측정 필요. 다른장 공유catalog 상주 최적화/전체맵composition은 별도소유 범위.

### 전체 실제로드 텍스처 표 (전/후)

경로는res://기준. 추정GPU=위4byte padding 보수값, mipmap0. 미로드는legacy 원본을삭제했다는뜻이아니며 실제캐시미존재다. 이 표는1-1예산과Main타장잔류를구분한전체합집합이며, CSV/원receipt는외부보고폴더에보존.

| 경로(res://) | 소속 | 전 해상도/포맷 | 후 해상도/포맷 | 전 추정 GPU MiB | 후 추정 GPU MiB | 상태 |
|---|---|---|---|---:|---:|---|
| `assets/map/ch1/boss_room_bg.png` | Main 타장/공용 잔류 | 3072×3072 / RGBA8 | 3072×3072 / RGBA8 | 36.000000 | 36.000000 | 유지 |
| `assets/map/ch1/collision/anim_tree_01.png` | Main 타장/공용 잔류 | 1536×1024 / RGBA8 | 1536×1024 / RGBA8 | 6.000000 | 6.000000 | 유지 |
| `assets/map/ch1/collision/bone_arch.png` | Main 타장/공용 잔류 | 281×347 / RGBA8 | 281×347 / RGBA8 | 0.371960 | 0.371960 | 유지 |
| `assets/map/ch1/collision/boss_gate.png` | Main 타장/공용 잔류 | 1536×1024 / RGBA8 | 1536×1024 / RGBA8 | 6.000000 | 6.000000 | 유지 |
| `assets/map/ch1/collision/bound_e.png` | Main 타장/공용 잔류 | 660×1800 / RGBA8 | 660×1800 / RGBA8 | 4.531860 | 4.531860 | 유지 |
| `assets/map/ch1/collision/bound_n.png` | Main 타장/공용 잔류 | 1800×653 / RGBA8 | 1800×653 / RGBA8 | 4.483795 | 4.483795 | 유지 |
| `assets/map/ch1/collision/bound_s.png` | Main 타장/공용 잔류 | 1800×697 / RGBA8 | 1800×697 / RGBA8 | 4.785919 | 4.785919 | 유지 |
| `assets/map/ch1/collision/bound_w.png` | Main 타장/공용 잔류 | 914×1800 / RGBA8 | 914×1800 / RGBA8 | 6.275940 | 6.275940 | 유지 |
| `assets/map/ch1/collision/cage_gate.png` | 1-1 예산 | 248×324 / RGBA8 | 248×324 / RGBA8 | 0.306519 | 0.306519 | 유지 |
| `assets/map/ch1/collision/corner_ne.png` | Main 타장/공용 잔류 | 1300×1228 / RGBA8 | 1300×1228 / RGBA8 | 6.089783 | 6.089783 | 유지 |
| `assets/map/ch1/collision/corner_nw.png` | Main 타장/공용 잔류 | 1300×1206 / RGBA8 | 1300×1206 / RGBA8 | 5.980682 | 5.980682 | 유지 |
| `assets/map/ch1/collision/corner_se.png` | Main 타장/공용 잔류 | 1300×1300 / RGBA8 | 1300×1300 / RGBA8 | 6.446838 | 6.446838 | 유지 |
| `assets/map/ch1/collision/corner_sw.png` | Main 타장/공용 잔류 | 1300×1298 / RGBA8 | 1300×1298 / RGBA8 | 6.436920 | 6.436920 | 유지 |
| `assets/map/ch1/collision/cursed_tree_01.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_02.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_03.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_04.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_05.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_06.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_07.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_08.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_09.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_10.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_11.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/cursed_tree_12.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch1/collision/eye_tree.png` | Main 타장/공용 잔류 | 228×331 / RGBA8 | 228×331 / RGBA8 | 0.287888 | 0.287888 | 유지 |
| `assets/map/ch1/collision/flesh_ball.png` | Main 타장/공용 잔류 | 278×238 / RGBA8 | 278×238 / RGBA8 | 0.252396 | 0.252396 | 유지 |
| `assets/map/ch1/collision/flesh_maw.png` | Main 타장/공용 잔류 | 253×274 / RGBA8 | 253×274 / RGBA8 | 0.264442 | 0.264442 | 유지 |
| `assets/map/ch1/collision/hang_cage.png` | Main 타장/공용 잔류 | 188×350 / RGBA8 | 188×350 / RGBA8 | 0.251007 | 0.251007 | 유지 |
| `assets/map/ch1/collision/mega_chapel.png` | Main 타장/공용 잔류 | 703×810 / RGBA8 | 703×810 / RGBA8 | 2.172203 | 2.172203 | 유지 |
| `assets/map/ch1/collision/mega_head.png` | Main 타장/공용 잔류 | 1115×799 / RGBA8 | 1115×799 / RGBA8 | 3.398457 | 3.398457 | 유지 |
| `assets/map/ch1/collision/mega_ribs.png` | Main 타장/공용 잔류 | 1199×582 / RGBA8 | 1199×582 / RGBA8 | 2.661964 | 2.661964 | 유지 |
| `assets/map/ch1/collision/mega_statue.png` | Main 타장/공용 잔류 | 804×1225 / RGBA8 | 804×1225 / RGBA8 | 3.757095 | 3.757095 | 유지 |
| `assets/map/ch1/collision/obelisk.png` | Main 타장/공용 잔류 | 199×342 / RGBA8 | 199×342 / RGBA8 | 0.259621 | 0.259621 | 유지 |
| `assets/map/ch1/collision/penta_circle.png` | Main 타장/공용 잔류 | 322×268 / RGBA8 | 322×268 / RGBA8 | 0.329193 | 0.329193 | 유지 |
| `assets/map/ch1/collision/pit_corpse.png` | Main 타장/공용 잔류 | 200×200 / RGBA8 | 200×200 / RGBA8 | 0.152588 | 0.152588 | 유지 |
| `assets/map/ch1/collision/pit_lava.png` | Main 타장/공용 잔류 | 200×200 / RGBA8 | 200×200 / RGBA8 | 0.152588 | 0.152588 | 유지 |
| `assets/map/ch1/collision/pit_poison.png` | Main 타장/공용 잔류 | 200×200 / RGBA8 | 200×200 / RGBA8 | 0.152588 | 0.152588 | 유지 |
| `assets/map/ch1/collision/prop_altar.png` | Main 타장/공용 잔류 | 820×753 / RGBA8 | 820×753 / RGBA8 | 2.355423 | 2.355423 | 유지 |
| `assets/map/ch1/collision/prop_camp.png` | Main 타장/공용 잔류 | 880×663 / RGBA8 | 880×663 / RGBA8 | 2.225647 | 2.225647 | 유지 |
| `assets/map/ch1/collision/prop_cocoon.png` | Main 타장/공용 잔류 | 840×736 / RGBA8 | 840×736 / RGBA8 | 2.358398 | 2.358398 | 유지 |
| `assets/map/ch1/collision/prop_corpsetree.png` | Main 타장/공용 잔류 | 1143×1400 / RGBA8 | 1143×1400 / RGBA8 | 6.104279 | 6.104279 | 유지 |
| `assets/map/ch1/collision/prop_pool.png` | Main 타장/공용 잔류 | 860×699 / RGBA8 | 860×699 / RGBA8 | 2.293167 | 2.293167 | 유지 |
| `assets/map/ch1/collision/rotforest_tree_01.png` | Main 타장/공용 잔류 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/collision/rotforest_tree_02.png` | Main 타장/공용 잔류 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/collision/rotforest_tree_03.png` | Main 타장/공용 잔류 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/collision/rotforest_tree_04.png` | Main 타장/공용 잔류 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/collision/skull_altar.png` | Main 타장/공용 잔류 | 331×345 / RGBA8 | 331×345 / RGBA8 | 0.435619 | 0.435619 | 유지 |
| `assets/map/ch1/collision/skull_totem.png` | Main 타장/공용 잔류 | 124×280 / RGBA8 | 124×280 / RGBA8 | 0.132446 | 0.132446 | 유지 |
| `assets/map/ch1/collision/sword_pile.png` | Main 타장/공용 잔류 | 267×329 / RGBA8 | 267×329 / RGBA8 | 0.335094 | 0.335094 | 유지 |
| `assets/map/ch1/collision/throne.png` | Main 타장/공용 잔류 | 230×298 / RGBA8 | 230×298 / RGBA8 | 0.261459 | 0.261459 | 유지 |
| `assets/map/ch1/diablo_field_torch_base_v1.png` | 1-1 예산 | 1180×1333 / RGBA8 | 1180×1333 / RGBA8 | 6.000290 | 6.000290 | 유지 |
| `assets/map/ch1/diablo_field_torch_flame_v1.png` | Main 타장/공용 잔류 | 1672×944 / RGBA8 | 1672×944 / RGBA8 | 6.020996 | 6.020996 | 유지 |
| `assets/map/ch1/diablo_hell_corpse_tree_v1.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch1/floor_objects/bones.png` | Main 타장/공용 잔류 | 40×32 / RGBA8 | 40×32 / RGBA8 | 0.004883 | 0.004883 | 유지 |
| `assets/map/ch1/floor_objects/clean_tumor_0_0.png` | Main 타장/공용 잔류 | 682×682 / RGBA8 | 682×682 / RGBA8 | 1.774307 | 1.774307 | 유지 |
| `assets/map/ch1/floor_objects/clean_tumor_0_1.png` | Main 타장/공용 잔류 | 682×682 / RGBA8 | 682×682 / RGBA8 | 1.774307 | 1.774307 | 유지 |
| `assets/map/ch1/floor_objects/clean_tumor_0_2.png` | Main 타장/공용 잔류 | 682×682 / RGBA8 | 682×682 / RGBA8 | 1.774307 | 1.774307 | 유지 |
| `assets/map/ch1/floor_objects/clean_tumor_1_0.png` | Main 타장/공용 잔류 | 642×624 / RGBA8 | 642×624 / RGBA8 | 1.528198 | 1.528198 | 유지 |
| `assets/map/ch1/floor_objects/clean_tumor_1_1.png` | Main 타장/공용 잔류 | 682×682 / RGBA8 | 682×682 / RGBA8 | 1.774307 | 1.774307 | 유지 |
| `assets/map/ch1/floor_objects/clean_tumor_1_2.png` | Main 타장/공용 잔류 | 653×634 / RGBA8 | 653×634 / RGBA8 | 1.579292 | 1.579292 | 유지 |
| `assets/map/ch1/floor_objects/corpse.png` | Main 타장/공용 잔류 | 48×40 / RGBA8 | 48×40 / RGBA8 | 0.007324 | 0.007324 | 유지 |
| `assets/map/ch1/floor_objects/deco_bones_03.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch1/floor_objects/deco_bones_04.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch1/floor_objects/eye1_bloodshot.png` | Main 타장/공용 잔류 | 40×40 / RGBA8 | 40×40 / RGBA8 | 0.006104 | 0.006104 | 유지 |
| `assets/map/ch1/floor_objects/eye2_terror.png` | Main 타장/공용 잔류 | 44×44 / RGBA8 | 44×44 / RGBA8 | 0.007385 | 0.007385 | 유지 |
| `assets/map/ch1/floor_objects/eyeball.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch1/floor_objects/fixed_black_0.png` | Main 타장/공용 잔류 | 704×664 / RGBA8 | 704×664 / RGBA8 | 1.783203 | 1.783203 | 유지 |
| `assets/map/ch1/floor_objects/fixed_black_1.png` | Main 타장/공용 잔류 | 670×683 / RGBA8 | 670×683 / RGBA8 | 1.745644 | 1.745644 | 유지 |
| `assets/map/ch1/floor_objects/flesh_g_0.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/floor_objects/flesh_h_0.png` | Main 타장/공용 잔류 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/floor_objects/flesh_wall_a.png` | Main 타장/공용 잔류 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/floor_objects/flesh_wall_b.png` | Main 타장/공용 잔류 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/floor_objects/frozen_bones.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch1/floor_objects/glow_flower_blue.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch1/floor_objects/glow_flower_yellow.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch1/floor_objects/larva.png` | Main 타장/공용 잔류 | 80×64 / RGBA8 | 80×64 / RGBA8 | 0.019531 | 0.019531 | 유지 |
| `assets/map/ch1/floor_objects/minibug.png` | Main 타장/공용 잔류 | 48×40 / RGBA8 | 48×40 / RGBA8 | 0.007324 | 0.007324 | 유지 |
| `assets/map/ch1/floor_objects/poison_pool.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch1/floor_objects/prop_g_battle.png` | Main 타장/공용 잔류 | 982×1000 / RGBA8 | 982×1000 / RGBA8 | 3.746033 | 3.746033 | 유지 |
| `assets/map/ch1/floor_objects/prop_g_corpse.png` | Main 타장/공용 잔류 | 1000×996 / RGBA8 | 1000×996 / RGBA8 | 3.799438 | 3.799438 | 유지 |
| `assets/map/ch1/floor_objects/prop_g_edge.png` | 1-1 예산 | 1100×529 / RGBA8 | 1100×529 / RGBA8 | 2.219772 | 2.219772 | 유지 |
| `assets/map/ch1/floor_objects/prop_g_root.png` | Main 타장/공용 잔류 | 1000×998 / RGBA8 | 1000×998 / RGBA8 | 3.807068 | 3.807068 | 유지 |
| `assets/map/ch1/floor_objects/prop_g_toxic.png` | Main 타장/공용 잔류 | 881×900 / RGBA8 | 881×900 / RGBA8 | 3.024673 | 3.024673 | 유지 |
| `assets/map/ch1/floor_objects/prop_s_bone.png` | Main 타장/공용 잔류 | 388×440 / RGBA8 | 388×440 / RGBA8 | 0.651245 | 0.651245 | 유지 |
| `assets/map/ch1/floor_objects/prop_s_pod.png` | Main 타장/공용 잔류 | 420×371 / RGBA8 | 420×371 / RGBA8 | 0.594406 | 0.594406 | 유지 |
| `assets/map/ch1/floor_objects/prop_s_root.png` | Main 타장/공용 잔류 | 440×411 / RGBA8 | 440×411 / RGBA8 | 0.689850 | 0.689850 | 유지 |
| `assets/map/ch1/floor_objects/provided_gore_01.png` | Main 타장/공용 잔류 | 455×679 / RGBA8 | 455×679 / RGBA8 | 1.178532 | 1.178532 | 유지 |
| `assets/map/ch1/floor_objects/provided_gore_02.png` | Main 타장/공용 잔류 | 487×785 / RGBA8 | 487×785 / RGBA8 | 1.458340 | 1.458340 | 유지 |
| `assets/map/ch1/floor_objects/provided_gore_03.png` | Main 타장/공용 잔류 | 470×752 / RGBA8 | 470×752 / RGBA8 | 1.348267 | 1.348267 | 유지 |
| `assets/map/ch1/floor_objects/provided_gore_04.png` | Main 타장/공용 잔류 | 481×742 / RGBA8 | 481×742 / RGBA8 | 1.361473 | 1.361473 | 유지 |
| `assets/map/ch1/floor_objects/provided_gore_05.png` | Main 타장/공용 잔류 | 488×809 / RGBA8 | 488×809 / RGBA8 | 1.506012 | 1.506012 | 유지 |
| `assets/map/ch1/floor_objects/provided_gore_06.png` | Main 타장/공용 잔류 | 484×803 / RGBA8 | 484×803 / RGBA8 | 1.482590 | 1.482590 | 유지 |
| `assets/map/ch1/floor_objects/tree_dead_01.png` | Main 타장/공용 잔류 | 64×64 / RGBA8 | 64×64 / RGBA8 | 0.015625 | 0.015625 | 유지 |
| `assets/map/ch1/floor_objects/tree_dead_02.png` | Main 타장/공용 잔류 | 64×64 / RGBA8 | 64×64 / RGBA8 | 0.015625 | 0.015625 | 유지 |
| `assets/map/ch1/floor_objects/tree_dead_03.png` | Main 타장/공용 잔류 | 64×64 / RGBA8 | 64×64 / RGBA8 | 0.015625 | 0.015625 | 유지 |
| `assets/map/ch1/floor_objects/vine_roots.png` | Main 타장/공용 잔류 | 48×32 / RGBA8 | 48×32 / RGBA8 | 0.005859 | 0.005859 | 유지 |
| `assets/map/ch1/ground_dark_soil.png` | 1-1 예산 | 1024×1024 / RGB8 | 1024×1024 / RGB8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/ch1/map_1-2.jpg` | Main 타장/공용 잔류 | 3072×3072 / RGB8 | 3072×3072 / RGB8 | 36.000000 | 36.000000 | 유지 |
| `assets/map/ch1/materials/forest_moss_litter.png` | Main 타장/공용 잔류 | 1254×1254 / RGB8 | 1254×1254 / RGB8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch1/void_vista.jpg` | Main 타장/공용 잔류 | 1672×941 / RGB8 | 1672×941 / RGB8 | 6.001862 | 6.001862 | 유지 |
| `assets/map/ch1_si1/ground_dark_soil.png` | Main 타장/공용 잔류 | 1024×1024 / RGB8 | 미로드 | 4.000000 | 0.000000 | 로드 제거/원본 보존 |
| `assets/map/ch2/collision/pit_bugs.png` | Main 타장/공용 잔류 | 200×200 / RGBA8 | 200×200 / RGBA8 | 0.152588 | 0.152588 | 유지 |
| `assets/map/ch2/collision/prop_a.png` | Main 타장/공용 잔류 | 533×942 / RGBA8 | 533×942 / RGBA8 | 1.915306 | 1.915306 | 유지 |
| `assets/map/ch2/collision/prop_b.png` | Main 타장/공용 잔류 | 479×972 / RGBA8 | 479×972 / RGBA8 | 1.776077 | 1.776077 | 유지 |
| `assets/map/ch2/collision/prop_hive.png` | Main 타장/공용 잔류 | 1024×909 / RGBA8 | 1024×909 / RGBA8 | 3.550781 | 3.550781 | 유지 |
| `assets/map/ch2/collision/prop_webp.png` | Main 타장/공용 잔류 | 496×916 / RGBA8 | 496×916 / RGBA8 | 1.733154 | 1.733154 | 유지 |
| `assets/map/ch2/floor_objects/chitin_debris.png` | Main 타장/공용 잔류 | 80×80 / RGBA8 | 80×80 / RGBA8 | 0.024414 | 0.024414 | 유지 |
| `assets/map/ch2/floor_objects/eye_mushroom.png` | Main 타장/공용 잔류 | 48×48 / RGBA8 | 48×48 / RGBA8 | 0.008789 | 0.008789 | 유지 |
| `assets/map/ch2/floor_objects/larva.png` | Main 타장/공용 잔류 | 80×64 / RGBA8 | 80×64 / RGBA8 | 0.019531 | 0.019531 | 유지 |
| `assets/map/ch2/floor_objects/minibug.png` | Main 타장/공용 잔류 | 48×40 / RGBA8 | 48×40 / RGBA8 | 0.007324 | 0.007324 | 유지 |
| `assets/map/ch2/floor_objects/mushroom_glow_01.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch2/floor_objects/toxic_mushroom.png` | Main 타장/공용 잔류 | 48×48 / RGBA8 | 48×48 / RGBA8 | 0.008789 | 0.008789 | 유지 |
| `assets/map/ch2/ground.png` | Main 타장/공용 잔류 | 512×512 / RGBA8 | 512×512 / RGBA8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch2/mega/chitin_arch.png` | Main 타장/공용 잔류 | 1328×1184 / RGBA8 | 1328×1184 / RGBA8 | 5.998047 | 5.998047 | 유지 |
| `assets/map/ch2/mega/deep_hive.png` | Main 타장/공용 잔류 | 1314×1197 / RGBA8 | 1314×1197 / RGBA8 | 5.999977 | 5.999977 | 유지 |
| `assets/map/ch2/mega/exit_organic_frame.png` | Main 타장/공용 잔류 | 1369×1149 / RGBA8 | 1369×1149 / RGBA8 | 6.000446 | 6.000446 | 유지 |
| `assets/map/ch2/mega/hive_wall_mega.png` | Main 타장/공용 잔류 | 1183×1330 / RGBA8 | 1183×1330 / RGBA8 | 6.002007 | 6.002007 | 유지 |
| `assets/map/ch2/mega/slime_cliff.png` | Main 타장/공용 잔류 | 1402×1122 / RGBA8 | 1402×1122 / RGBA8 | 6.000687 | 6.000687 | 유지 |
| `assets/map/ch2/mega/wall_broken_mega.png` | Main 타장/공용 잔류 | 1314×1197 / RGBA8 | 1314×1197 / RGBA8 | 5.999977 | 5.999977 | 유지 |
| `assets/map/ch2/mega/wall_curve_l.png` | Main 타장/공용 잔류 | 1122×1402 / RGBA8 | 1122×1402 / RGBA8 | 6.000687 | 6.000687 | 유지 |
| `assets/map/ch2/mega/wall_curve_r.png` | Main 타장/공용 잔류 | 1121×1403 / RGBA8 | 1121×1403 / RGBA8 | 5.999615 | 5.999615 | 유지 |
| `assets/map/ch2/mega/wall_ridge_l.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/mega/wall_ridge_r.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/mega/wall_skin_depth_arch.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/mega/wall_skin_hook_l.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/mega/wall_skin_hook_r.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/mega/wall_skin_jaw_arc.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/mega/wall_skin_rib_arc.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/mega/wall_skin_web_arc.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/skull_wall_tile.png` | Main 타장/공용 잔류 | 1254×1254 / RGB8 | 1254×1254 / RGB8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch2/wall_edge_tile.png` | Main 타장/공용 잔류 | 1536×1024 / RGBA8 | 1536×1024 / RGBA8 | 6.000000 | 6.000000 | 유지 |
| `assets/map/ch3/collision/pit_ice.png` | Main 타장/공용 잔류 | 200×200 / RGBA8 | 200×200 / RGBA8 | 0.152588 | 0.152588 | 유지 |
| `assets/map/ch3/collision/prop_a.png` | Main 타장/공용 잔류 | 721×966 / RGBA8 | 721×966 / RGBA8 | 2.656883 | 2.656883 | 유지 |
| `assets/map/ch3/collision/prop_b.png` | Main 타장/공용 잔류 | 694×885 / RGBA8 | 694×885 / RGBA8 | 2.342949 | 2.342949 | 유지 |
| `assets/map/ch3/collision/prop_hellwinter_carcass.png` | Main 타장/공용 잔류 | 1534×1025 / RGBA8 | 1534×1025 / RGBA8 | 5.998039 | 5.998039 | 유지 |
| `assets/map/ch3/collision/prop_hellwinter_dormant.png` | Main 타장/공용 잔류 | 1536×1024 / RGBA8 | 1536×1024 / RGBA8 | 6.000000 | 6.000000 | 유지 |
| `assets/map/ch3/collision/prop_hellwinter_execution.png` | Main 타장/공용 잔류 | 1314×1197 / RGBA8 | 1314×1197 / RGBA8 | 5.999977 | 5.999977 | 유지 |
| `assets/map/ch3/collision/prop_hellwinter_prison.png` | Main 타장/공용 잔류 | 1401×1123 / RGBA8 | 1401×1123 / RGBA8 | 6.001751 | 6.001751 | 유지 |
| `assets/map/ch3/collision/prop_hellwinter_rampart.png` | Main 타장/공용 잔류 | 1631×964 / RGBA8 | 1631×964 / RGBA8 | 5.997787 | 5.997787 | 유지 |
| `assets/map/ch3/collision/prop_hellwinter_tower.png` | Main 타장/공용 잔류 | 1632×964 / RGBA8 | 1632×964 / RGBA8 | 6.001465 | 6.001465 | 유지 |
| `assets/map/ch3/collision/prop_hellwinter_wall_atlas.png` | Main 타장/공용 잔류 | 3072×2048 / RGBA8 | 3072×2048 / RGBA8 | 24.000000 | 24.000000 | 유지 |
| `assets/map/ch3/collision/prop_ice_bridge.png` | Main 타장/공용 잔류 | 1100×656 / RGBA8 | 1100×656 / RGBA8 | 2.752686 | 2.752686 | 유지 |
| `assets/map/ch3/collision/prop_ice_cavwall.png` | Main 타장/공용 잔류 | 1200×591 / RGBA8 | 1200×591 / RGBA8 | 2.705383 | 2.705383 | 유지 |
| `assets/map/ch3/collision/prop_ice_cliff.png` | Main 타장/공용 잔류 | 917×1200 / RGBA8 | 917×1200 / RGBA8 | 4.197693 | 4.197693 | 유지 |
| `assets/map/ch3/collision/prop_ice_corpsepile.png` | Main 타장/공용 잔류 | 1100×860 / RGBA8 | 1100×860 / RGBA8 | 3.608704 | 3.608704 | 유지 |
| `assets/map/ch3/collision/prop_ice_crystals.png` | Main 타장/공용 잔류 | 893×1100 / RGBA8 | 893×1100 / RGBA8 | 3.747177 | 3.747177 | 유지 |
| `assets/map/ch3/collision/prop_ice_rampart.png` | Main 타장/공용 잔류 | 1100×655 / RGBA8 | 1100×655 / RGBA8 | 2.748489 | 2.748489 | 유지 |
| `assets/map/ch3/collision/prop_ice_ridge.png` | Main 타장/공용 잔류 | 1200×534 / RGBA8 | 1200×534 / RGBA8 | 2.444458 | 2.444458 | 유지 |
| `assets/map/ch3/collision/prop_ice_sealbeast.png` | Main 타장/공용 잔류 | 860×1100 / RGBA8 | 860×1100 / RGBA8 | 3.608704 | 3.608704 | 유지 |
| `assets/map/ch3/collision/prop_ice_sealshrine.png` | Main 타장/공용 잔류 | 1032×1100 / RGBA8 | 1032×1100 / RGBA8 | 4.330444 | 4.330444 | 유지 |
| `assets/map/ch3/collision/prop_ice_stalag.png` | Main 타장/공용 잔류 | 986×1100 / RGBA8 | 986×1100 / RGBA8 | 4.137421 | 4.137421 | 유지 |
| `assets/map/ch3/collision/prop_ice_tree.png` | Main 타장/공용 잔류 | 840×1100 / RGBA8 | 840×1100 / RGBA8 | 3.524780 | 3.524780 | 유지 |
| `assets/map/ch3/collision/prop_icecage.png` | Main 타장/공용 잔류 | 576×1290 / RGBA8 | 576×1290 / RGBA8 | 2.834473 | 2.834473 | 유지 |
| `assets/map/ch3/collision/prop_iceshrine.png` | Main 타장/공용 잔류 | 952×957 / RGBA8 | 952×957 / RGBA8 | 3.475433 | 3.475433 | 유지 |
| `assets/map/ch3/floor_objects/bones.png` | Main 타장/공용 잔류 | 40×32 / RGBA8 | 40×32 / RGBA8 | 0.004883 | 0.004883 | 유지 |
| `assets/map/ch3/floor_objects/deco_bones_03.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch3/floor_objects/frozen_bones.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch3/floor_objects/prop_hellwinter_corpsefield.png` | Main 타장/공용 잔류 | 1616×973 / RGBA8 | 1616×973 / RGBA8 | 5.998108 | 5.998108 | 유지 |
| `assets/map/ch3/floor_objects/prop_hellwinter_gate.png` | Main 타장/공용 잔류 | 1424×1105 / RGBA8 | 1424×1105 / RGBA8 | 6.002502 | 6.002502 | 유지 |
| `assets/map/ch3/floor_objects/prop_hellwinter_ritual.png` | Main 타장/공용 잔류 | 1254×1254 / RGBA8 | 1254×1254 / RGBA8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch3/floor_objects/prop_ice_debris.png` | Main 타장/공용 잔류 | 760×716 / RGBA8 | 760×716 / RGBA8 | 2.075806 | 2.075806 | 유지 |
| `assets/map/ch3/floor_objects/prop_ice_gcrack.png` | 1-1 예산 | 883×900 / RGBA8 | 883×900 / RGBA8 | 3.031540 | 3.031540 | 유지 |
| `assets/map/ch3/floor_objects/prop_ice_gdark.png` | Main 타장/공용 잔류 | 760×727 / RGBA8 | 760×727 / RGBA8 | 2.107697 | 2.107697 | 유지 |
| `assets/map/ch3/floor_objects/prop_ice_gplates.png` | Main 타장/공용 잔류 | 817×820 / RGBA8 | 817×820 / RGBA8 | 2.555618 | 2.555618 | 유지 |
| `assets/map/ch3/floor_objects/prop_ice_gsnow.png` | Main 타장/공용 잔류 | 820×798 / RGBA8 | 820×798 / RGBA8 | 2.496185 | 2.496185 | 유지 |
| `assets/map/ch3/floor_objects/prop_ice_ritual.png` | Main 타장/공용 잔류 | 1000×1000 / RGBA8 | 1000×1000 / RGBA8 | 3.814697 | 3.814697 | 유지 |
| `assets/map/ch3/ground.png` | Main 타장/공용 잔류 | 512×512 / RGB8 | 512×512 / RGB8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch3/ground_hellwinter.png` | Main 타장/공용 잔류 | 1254×1254 / RGB8 | 1254×1254 / RGB8 | 5.998672 | 5.998672 | 유지 |
| `assets/map/ch4/collision/fire_pillar.png` | Main 타장/공용 잔류 | 48×48 / RGBA8 | 48×48 / RGBA8 | 0.008789 | 0.008789 | 유지 |
| `assets/map/ch4/collision/pit_lava.png` | Main 타장/공용 잔류 | 200×200 / RGBA8 | 200×200 / RGBA8 | 0.152588 | 0.152588 | 유지 |
| `assets/map/ch4/collision/prop_a.png` | Main 타장/공용 잔류 | 452×858 / RGBA8 | 452×858 / RGBA8 | 1.479401 | 1.479401 | 유지 |
| `assets/map/ch4/collision/prop_b.png` | Main 타장/공용 잔류 | 492×928 / RGBA8 | 492×928 / RGBA8 | 1.741699 | 1.741699 | 유지 |
| `assets/map/ch4/collision/prop_brazier.png` | Main 타장/공용 잔류 | 815×874 / RGBA8 | 815×874 / RGBA8 | 2.717247 | 2.717247 | 유지 |
| `assets/map/ch4/floor_objects/lava_crack.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch4/ground.png` | Main 타장/공용 잔류 | 512×512 / RGB8 | 512×512 / RGB8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch5/collision/bone_arch.png` | Main 타장/공용 잔류 | 281×347 / RGBA8 | 281×347 / RGBA8 | 0.371960 | 0.371960 | 유지 |
| `assets/map/ch5/collision/prop_a.png` | Main 타장/공용 잔류 | 654×917 / RGBA8 | 654×917 / RGBA8 | 2.287743 | 2.287743 | 유지 |
| `assets/map/ch5/collision/prop_b.png` | Main 타장/공용 잔류 | 908×739 / RGBA8 | 908×739 / RGBA8 | 2.559708 | 2.559708 | 유지 |
| `assets/map/ch5/collision/prop_banner.png` | Main 타장/공용 잔류 | 589×1213 / RGBA8 | 589×1213 / RGBA8 | 2.725437 | 2.725437 | 유지 |
| `assets/map/ch5/collision/skull_totem.png` | Main 타장/공용 잔류 | 124×280 / RGBA8 | 124×280 / RGBA8 | 0.132446 | 0.132446 | 유지 |
| `assets/map/ch5/floor_objects/bones.png` | Main 타장/공용 잔류 | 40×32 / RGBA8 | 40×32 / RGBA8 | 0.004883 | 0.004883 | 유지 |
| `assets/map/ch5/floor_objects/deco_bones_04.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch5/ground.png` | Main 타장/공용 잔류 | 512×512 / RGB8 | 512×512 / RGB8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch6/collision/prop_a.png` | Main 타장/공용 잔류 | 718×918 / RGBA8 | 718×918 / RGBA8 | 2.514359 | 2.514359 | 유지 |
| `assets/map/ch6/collision/prop_b.png` | Main 타장/공용 잔류 | 672×920 / RGBA8 | 672×920 / RGBA8 | 2.358398 | 2.358398 | 유지 |
| `assets/map/ch6/collision/prop_eyetotem.png` | Main 타장/공용 잔류 | 484×1097 / RGBA8 | 484×1097 / RGBA8 | 2.025406 | 2.025406 | 유지 |
| `assets/map/ch6/floor_objects/corpse.png` | Main 타장/공용 잔류 | 48×40 / RGBA8 | 48×40 / RGBA8 | 0.007324 | 0.007324 | 유지 |
| `assets/map/ch6/floor_objects/eyeball.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch6/floor_objects/rune_mark.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch6/ground.png` | Main 타장/공용 잔류 | 512×512 / RGB8 | 512×512 / RGB8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/ch7/collision/obelisk.png` | Main 타장/공용 잔류 | 199×342 / RGBA8 | 199×342 / RGBA8 | 0.259621 | 0.259621 | 유지 |
| `assets/map/ch7/collision/prop_a.png` | Main 타장/공용 잔류 | 331×883 / RGBA8 | 331×883 / RGBA8 | 1.114933 | 1.114933 | 유지 |
| `assets/map/ch7/collision/prop_b.png` | Main 타장/공용 잔류 | 507×855 / RGBA8 | 507×855 / RGBA8 | 1.653614 | 1.653614 | 유지 |
| `assets/map/ch7/collision/prop_gargoyle.png` | Main 타장/공용 잔류 | 721×940 / RGBA8 | 721×940 / RGBA8 | 2.585373 | 2.585373 | 유지 |
| `assets/map/ch7/collision/throne.png` | Main 타장/공용 잔류 | 230×298 / RGBA8 | 230×298 / RGBA8 | 0.261459 | 0.261459 | 유지 |
| `assets/map/ch7/floor_objects/rune_mark.png` | Main 타장/공용 잔류 | 32×32 / RGBA8 | 32×32 / RGBA8 | 0.003906 | 0.003906 | 유지 |
| `assets/map/ch7/ground.png` | Main 타장/공용 잔류 | 512×512 / RGB8 | 512×512 / RGB8 | 1.000000 | 1.000000 | 유지 |
| `assets/map/map11/contact_masks/atlas/contact_atlas.png` | 1-1 예산 | 2048×1024 / RGBA8 | 2048×1024 / RGBA8 | 10.666668 | 10.666668 | 유지 |
| `assets/map/map11/props/skull_25d/skull_0_contact.png` | 1-1 예산 | 392×122 / RGBA8 | 392×122 / RGBA8 | 0.242878 | 0.242878 | 유지 |
| `assets/map/map11/props/skull_25d/skull_1_contact.png` | 1-1 예산 | 368×109 / RGBA8 | 368×109 / RGBA8 | 0.203358 | 0.203358 | 유지 |
| `assets/map/map11/props/skull_25d/skull_2_contact.png` | 1-1 예산 | 400×116 / RGBA8 | 400×116 / RGBA8 | 0.235828 | 0.235828 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_0_contact.png` | 1-1 예산 | 148×128 / RGBA8 | 148×128 / RGBA8 | 0.072266 | 0.072266 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_0_diffuse.png` | 1-1 예산 | 128×490 / RGBA8 | 128×490 / RGBA8 | 0.239258 | 0.239258 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_0_normal.png` | 1-1 예산 | 128×490 / RGBA8 | 128×490 / RGBA8 | 0.239258 | 0.239258 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_1_contact.png` | 1-1 예산 | 180×128 / RGBA8 | 180×128 / RGBA8 | 0.087891 | 0.087891 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_1_diffuse.png` | 1-1 예산 | 160×490 / RGBA8 | 160×490 / RGBA8 | 0.299072 | 0.299072 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_1_normal.png` | 1-1 예산 | 160×490 / RGBA8 | 160×490 / RGBA8 | 0.299072 | 0.299072 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_2_contact.png` | 1-1 예산 | 211×128 / RGBA8 | 211×128 / RGBA8 | 0.103027 | 0.103027 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_2_diffuse.png` | 1-1 예산 | 191×490 / RGBA8 | 191×490 / RGBA8 | 0.357018 | 0.357018 | 유지 |
| `assets/map/map11/props/tour_25d/hell_impaled_corpse/hell_impaled_corpse_2_normal.png` | 1-1 예산 | 191×490 / RGBA8 | 191×490 / RGBA8 | 0.357018 | 0.357018 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_0_contact.png` | 1-1 예산 | 471×104 / RGBA8 | 471×104 / RGBA8 | 0.186859 | 0.186859 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_0_diffuse.png` | 1-1 예산 | 455×400 / RGBA8 | 455×400 / RGBA8 | 0.694275 | 0.694275 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_0_normal.png` | 1-1 예산 | 455×400 / RGBA8 | 455×400 / RGBA8 | 0.694275 | 0.694275 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_1_contact.png` | 1-1 예산 | 481×104 / RGBA8 | 481×104 / RGBA8 | 0.190826 | 0.190826 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_1_diffuse.png` | 1-1 예산 | 465×400 / RGBA8 | 465×400 / RGBA8 | 0.709534 | 0.709534 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_1_normal.png` | 1-1 예산 | 465×400 / RGBA8 | 465×400 / RGBA8 | 0.709534 | 0.709534 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_2_contact.png` | 1-1 예산 | 468×104 / RGBA8 | 468×104 / RGBA8 | 0.185669 | 0.185669 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_2_diffuse.png` | 1-1 예산 | 452×400 / RGBA8 | 452×400 / RGBA8 | 0.689697 | 0.689697 | 유지 |
| `assets/map/map11/props/tour_25d/hell_spike_pit/hell_spike_pit_2_normal.png` | 1-1 예산 | 452×400 / RGBA8 | 452×400 / RGBA8 | 0.689697 | 0.689697 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_0_contact.png` | 1-1 예산 | 391×104 / RGBA8 | 391×104 / RGBA8 | 0.155121 | 0.155121 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_0_diffuse.png` | 1-1 예산 | 375×400 / RGBA8 | 375×400 / RGBA8 | 0.572205 | 0.572205 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_0_normal.png` | 1-1 예산 | 375×400 / RGBA8 | 375×400 / RGBA8 | 0.572205 | 0.572205 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_1_contact.png` | 1-1 예산 | 406×104 / RGBA8 | 406×104 / RGBA8 | 0.161072 | 0.161072 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_1_diffuse.png` | 1-1 예산 | 390×400 / RGBA8 | 390×400 / RGBA8 | 0.595093 | 0.595093 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_1_normal.png` | 1-1 예산 | 390×400 / RGBA8 | 390×400 / RGBA8 | 0.595093 | 0.595093 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_2_contact.png` | 1-1 예산 | 430×104 / RGBA8 | 430×104 / RGBA8 | 0.170593 | 0.170593 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_2_diffuse.png` | 1-1 예산 | 414×400 / RGBA8 | 414×400 / RGBA8 | 0.631714 | 0.631714 | 유지 |
| `assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_2_normal.png` | 1-1 예산 | 414×400 / RGBA8 | 414×400 / RGBA8 | 0.631714 | 0.631714 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_0_contact.png` | 1-1 예산 | 365×89 / RGBA8 | 365×89 / RGBA8 | 0.123920 | 0.123920 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_0_diffuse.png` | 1-1 예산 | 351×340 / RGBA8 | 351×340 / RGBA8 | 0.455246 | 0.455246 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_0_normal.png` | 1-1 예산 | 351×340 / RGBA8 | 351×340 / RGBA8 | 0.455246 | 0.455246 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_1_contact.png` | 1-1 예산 | 369×89 / RGBA8 | 369×89 / RGBA8 | 0.125278 | 0.125278 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_1_diffuse.png` | 1-1 예산 | 355×340 / RGBA8 | 355×340 / RGBA8 | 0.460434 | 0.460434 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_1_normal.png` | 1-1 예산 | 355×340 / RGBA8 | 355×340 / RGBA8 | 0.460434 | 0.460434 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_2_contact.png` | 1-1 예산 | 363×89 / RGBA8 | 363×89 / RGBA8 | 0.123241 | 0.123241 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_2_diffuse.png` | 1-1 예산 | 349×340 / RGBA8 | 349×340 / RGBA8 | 0.452652 | 0.452652 | 유지 |
| `assets/map/map11/props/tour_25d/tour_blood_basin/tour_blood_basin_2_normal.png` | 1-1 예산 | 349×340 / RGBA8 | 349×340 / RGBA8 | 0.452652 | 0.452652 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_0_contact.png` | 1-1 예산 | 335×156 / RGBA8 | 335×156 / RGBA8 | 0.199356 | 0.199356 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_0_diffuse.png` | 1-1 예산 | 311×600 / RGBA8 | 311×600 / RGBA8 | 0.711823 | 0.711823 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_0_normal.png` | 1-1 예산 | 311×600 / RGBA8 | 311×600 / RGBA8 | 0.711823 | 0.711823 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_1_contact.png` | 1-1 예산 | 356×156 / RGBA8 | 356×156 / RGBA8 | 0.211853 | 0.211853 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_1_diffuse.png` | 1-1 예산 | 332×600 / RGBA8 | 332×600 / RGBA8 | 0.759888 | 0.759888 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_1_normal.png` | 1-1 예산 | 332×600 / RGBA8 | 332×600 / RGBA8 | 0.759888 | 0.759888 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_2_contact.png` | 1-1 예산 | 307×134 / RGBA8 | 307×134 / RGBA8 | 0.156929 | 0.156929 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_2_diffuse.png` | 1-1 예산 | 287×520 / RGBA8 | 287×520 / RGBA8 | 0.569305 | 0.569305 | 유지 |
| `assets/map/map11/props/tour_25d/tour_chained_pillar/tour_chained_pillar_2_normal.png` | 1-1 예산 | 287×520 / RGBA8 | 287×520 / RGBA8 | 0.569305 | 0.569305 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_0_contact.png` | 1-1 예산 | 512×137 / RGBA8 | 512×137 / RGBA8 | 0.267578 | 0.267578 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_0_diffuse.png` | 1-1 예산 | 639×680 / RGBA8 | 639×680 / RGBA8 | 1.657562 | 1.657562 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_0_normal.png` | 1-1 예산 | 639×680 / RGBA8 | 639×680 / RGBA8 | 1.657562 | 1.657562 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_1_contact.png` | 1-1 예산 | 512×127 / RGBA8 | 512×127 / RGBA8 | 0.248047 | 0.248047 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_1_diffuse.png` | 1-1 예산 | 688×680 / RGBA8 | 688×680 / RGBA8 | 1.784668 | 1.784668 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_1_normal.png` | 1-1 예산 | 688×680 / RGBA8 | 688×680 / RGBA8 | 1.784668 | 1.784668 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_2_contact.png` | 1-1 예산 | 512×142 / RGBA8 | 512×142 / RGBA8 | 0.277344 | 0.277344 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_2_diffuse.png` | 1-1 예산 | 615×680 / RGBA8 | 615×680 / RGBA8 | 1.595306 | 1.595306 | 유지 |
| `assets/map/map11/props/tour_25d/tour_cocoon_tree/tour_cocoon_tree_2_normal.png` | 1-1 예산 | 615×680 / RGBA8 | 615×680 / RGBA8 | 1.595306 | 1.595306 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_0_contact.png` | 1-1 예산 | 387×141 / RGBA8 | 387×141 / RGBA8 | 0.208157 | 0.208157 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_0_diffuse.png` | 1-1 예산 | 365×540 / RGBA8 | 365×540 / RGBA8 | 0.751877 | 0.751877 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_0_normal.png` | 1-1 예산 | 365×540 / RGBA8 | 365×540 / RGBA8 | 0.751877 | 0.751877 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_1_contact.png` | 1-1 예산 | 416×141 / RGBA8 | 416×141 / RGBA8 | 0.223755 | 0.223755 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_1_diffuse.png` | 1-1 예산 | 394×540 / RGBA8 | 394×540 / RGBA8 | 0.811615 | 0.811615 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_1_normal.png` | 1-1 예산 | 394×540 / RGBA8 | 394×540 / RGBA8 | 0.811615 | 0.811615 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_2_contact.png` | 1-1 예산 | 391×141 / RGBA8 | 391×141 / RGBA8 | 0.210308 | 0.210308 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_2_diffuse.png` | 1-1 예산 | 369×540 / RGBA8 | 369×540 / RGBA8 | 0.760117 | 0.760117 | 유지 |
| `assets/map/map11/props/tour_25d/tour_torture_wheel/tour_torture_wheel_2_normal.png` | 1-1 예산 | 369×540 / RGBA8 | 369×540 / RGBA8 | 0.760117 | 0.760117 | 유지 |
| `assets/map/props/bone_arch.png` | 1-1 예산 | 281×347 / RGBA8 | 281×347 / RGBA8 | 0.371960 | 0.371960 | 유지 |
| `assets/map/props/prop_altar.png` | 1-1 예산 | 820×753 / RGBA8 | 820×753 / RGBA8 | 2.355423 | 2.355423 | 유지 |
| `assets/map/props/prop_cocoon.png` | 1-1 예산 | 840×736 / RGBA8 | 840×736 / RGBA8 | 2.358398 | 2.358398 | 유지 |
| `assets/map/props/prop_corpsetree.png` | 1-1 예산 | 1143×1400 / RGBA8 | 1143×1400 / RGBA8 | 6.104279 | 6.104279 | 유지 |
| `assets/map/props/prop_g_root.png` | 1-1 예산 | 1000×998 / RGBA8 | 미로드 | 3.807068 | 0.000000 | 로드 제거/원본 보존 |
| `assets/map/props/rotforest_tree_01.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/props/rotforest_tree_02.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/props/rotforest_tree_03.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/props/rotforest_tree_04.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/props/rotforest_tree_05.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/props/rotforest_tree_06.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/props/rotforest_tree_07.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/map/props/rotforest_tree_11.png` | 1-1 예산 | 1024×1024 / RGBA8 | 1024×1024 / RGBA8 | 4.000000 | 4.000000 | 유지 |
| `assets/maps/map11/baked_floor/arena_floor_base.png` | 1-1 예산 | 4096×4096 / RGBA8 | 미로드 | 64.000000 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/baked_floor/arena_floor_pulse.png` | 1-1 예산 | 4096×4096 / RGB8 | 미로드 | 64.000000 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/boss_dark_druid_8dir_v3.png` | 1-1 예산 | 1656×1240 / RGBA8 | 1656×1240 / RGBA8 | 7.833252 | 7.833252 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_0_contact.png` | 1-1 예산 | 512×229 / RGBA8 | 512×229 / RGBA8 | 0.447266 | 0.447266 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_0_diffuse.png` | 1-1 예산 | 650×1200 / RGBA8 | 650×1200 / RGBA8 | 2.975464 | 2.975464 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_0_normal.png` | 1-1 예산 | 650×1200 / RGBA8 | 650×1200 / RGBA8 | 2.975464 | 2.975464 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_1_contact.png` | 1-1 예산 | 512×225 / RGBA8 | 512×225 / RGBA8 | 0.439453 | 0.439453 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_1_diffuse.png` | 1-1 예산 | 663×1200 / RGBA8 | 663×1200 / RGBA8 | 3.034973 | 3.034973 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_1_normal.png` | 1-1 예산 | 663×1200 / RGBA8 | 663×1200 / RGBA8 | 3.034973 | 3.034973 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_2_contact.png` | 1-1 예산 | 512×250 / RGBA8 | 512×250 / RGBA8 | 0.488281 | 0.488281 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_2_diffuse.png` | 1-1 예산 | 591×1200 / RGBA8 | 591×1200 / RGBA8 | 2.705383 | 2.705383 | 유지 |
| `assets/maps/map11/finale_pillar/tour_chained_pillar_2_normal.png` | 1-1 예산 | 591×1200 / RGBA8 | 591×1200 / RGBA8 | 2.705383 | 2.705383 | 유지 |
| `assets/maps/map11/finish33/bones0.png` | 1-1 예산 | 미로드 | 562×600 / RGBA8 | 0.000000 | 1.286316 | 교체·trim |
| `assets/maps/map11/finish33/bones2.png` | 1-1 예산 | 미로드 | 621×600 / RGBA8 | 0.000000 | 1.421356 | 교체·trim |
| `assets/maps/map11/finish33/foreground_0.png` | 1-1 예산 | 미로드 | 232×285 / RGBA8 | 0.000000 | 0.252228 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_0_0.png` | 1-1 예산 | 미로드 | 333×127 / RGBA8 | 0.000000 | 0.161327 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_0_1.png` | 1-1 예산 | 미로드 | 1208×2052 / RGBA8 | 0.000000 | 9.455933 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_0_2.png` | 1-1 예산 | 미로드 | 1356×2052 / RGBA8 | 0.000000 | 10.614441 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_0_3.png` | 1-1 예산 | 미로드 | 1330×1366 / RGBA8 | 0.000000 | 6.930466 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_1_0.png` | 1-1 예산 | 미로드 | 303×1258 / RGBA8 | 0.000000 | 1.454063 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_1_1.png` | 1-1 예산 | 미로드 | 2052×2052 / RGBA8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_1_2.png` | 1-1 예산 | 미로드 | 2052×2052 / RGB8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_1_3.png` | 1-1 예산 | 미로드 | 2052×2052 / RGBA8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_1_4.png` | 1-1 예산 | 미로드 | 582×696 / RGBA8 | 0.000000 | 1.545227 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_2_0.png` | 1-1 예산 | 미로드 | 2052×1254 / RGBA8 | 0.000000 | 9.816010 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_2_1.png` | 1-1 예산 | 미로드 | 2052×2052 / RGB8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_2_2.png` | 1-1 예산 | 미로드 | 2052×2052 / RGB8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_2_3.png` | 1-1 예산 | 미로드 | 2052×2052 / RGB8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_2_4.png` | 1-1 예산 | 미로드 | 2052×982 / RGBA8 | 0.000000 | 7.686859 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_3_0.png` | 1-1 예산 | 미로드 | 1801×1138 / RGBA8 | 0.000000 | 7.818367 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_3_1.png` | 1-1 예산 | 미로드 | 2052×2052 / RGBA8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_3_2.png` | 1-1 예산 | 미로드 | 2052×2052 / RGB8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_3_3.png` | 1-1 예산 | 미로드 | 2052×2052 / RGBA8 | 0.000000 | 16.062561 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_3_4.png` | 1-1 예산 | 미로드 | 729×731 / RGBA8 | 0.000000 | 2.032848 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_4_1.png` | 1-1 예산 | 미로드 | 1792×1876 / RGBA8 | 0.000000 | 12.824219 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_4_2.png` | 1-1 예산 | 미로드 | 1852×2052 / RGBA8 | 0.000000 | 14.497009 | 교체·trim |
| `assets/maps/map11/finish33/ground/ground_4_3.png` | 1-1 예산 | 미로드 | 1821×2036 / RGBA8 | 0.000000 | 14.143204 | 교체·trim |
| `assets/maps/map11/finish33/left_mid.png` | 1-1 예산 | 미로드 | 742×615 / RGBA8 | 0.000000 | 1.740761 | 교체·trim |
| `assets/maps/map11/finish33/left_near.png` | 1-1 예산 | 미로드 | 1467×1388 / RGBA8 | 0.000000 | 7.767471 | 교체·trim |
| `assets/maps/map11/finish33/right_mid.png` | 1-1 예산 | 미로드 | 674×682 / RGBA8 | 0.000000 | 1.753494 | 교체·trim |
| `assets/maps/map11/finish33/right_near.png` | 1-1 예산 | 미로드 | 1233×1538 / RGBA8 | 0.000000 | 7.234016 | 교체·trim |
| `assets/maps/map11/finish33/white_tree.png` | 1-1 예산 | 미로드 | 512×291 / RGBA8 | 0.000000 | 0.568359 | 교체·trim |
| `assets/maps/map11/fog_fbm_filtered.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/gate_organic_recess.png` | 1-1 예산 | 3072×640 / RGBA8 | 3072×640 / RGBA8 | 7.500000 | 7.500000 | 유지 |
| `assets/maps/map11/ritual_root_cracks.png` | 1-1 예산 | 2048×2048 / RGBA8 | 미로드 | 16.000000 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target30/actor_contact.png` | 1-1 예산 | 128×128 / RGBA8 | 128×128 / RGBA8 | 0.062500 | 0.062500 | 유지 |
| `assets/maps/map11/target30/fog.png` | 1-1 예산 | 256×256 / L8 | 256×256 / L8 | 0.250000 | 0.250000 | 유지 |
| `assets/maps/map11/target30/legacy_to_target_curve.png` | 1-1 예산 | 256×1 / RGB8 | 256×1 / RGB8 | 0.000977 | 0.000977 | 유지 |
| `assets/maps/map11/target30/static_underlay.png` | 1-1 예산 | 2000×1125 / RGBA8 | 미로드 | 8.583069 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target30/veins.png` | 1-1 예산 | 4096×4096 / L8 | 4096×4096 / L8 | 64.000000 | 64.000000 | 유지 |
| `assets/maps/map11/target32/fog.png` | 1-1 예산 | 400×200 / L8 | 400×200 / L8 | 0.305176 | 0.305176 | 유지 |
| `assets/maps/map11/target32/veins_32b.png` | 1-1 예산 | 3200×3725 / L8 | 3200×3725 / L8 | 45.471191 | 45.471191 | 유지 |
| `assets/maps/map11/target32b/ground_0_0.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_0_1.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_0_2.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_0_3.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_1_0.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_1_1.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_1_2.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_1_3.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_1_4.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_2_0.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_2_1.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_2_2.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_2_3.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_2_4.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_3_0.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_3_1.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_3_2.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_3_3.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_3_4.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_4_1.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_4_2.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/target32b/ground_4_3.png` | 1-1 예산 | 2052×2052 / RGBA8 | 미로드 | 16.062561 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/north/blood.png` | 1-1 예산 | 1024×1053 / RGBA8 | 1024×1053 / RGBA8 | 4.113281 | 4.113281 | 유지 |
| `assets/maps/map11/upscale01/north/bones0.png` | 1-1 예산 | 562×600 / RGBA8 | 미로드 | 1.286316 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/north/bones2.png` | 1-1 예산 | 621×600 / RGBA8 | 미로드 | 1.421356 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/north/moss.png` | 1-1 예산 | 1280×1040 / RGBA8 | 1280×1040 / RGBA8 | 5.078125 | 5.078125 | 유지 |
| `assets/maps/map11/upscale01/north/root.png` | 1-1 예산 | 1024×1022 / RGBA8 | 1024×1022 / RGBA8 | 3.992188 | 3.992188 | 유지 |
| `assets/maps/map11/upscale01/target30/east_mouth.png` | 1-1 예산 | 1242×1326 / RGBA8 | 1242×1326 / RGBA8 | 6.282394 | 6.282394 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_0_0.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_0_1.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_0_2.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_0_3.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_0_4.png` | 1-1 예산 | 2048×10 / RGBA8 | 2048×10 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_1_0.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_1_1.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_1_2.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_1_3.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_1_4.png` | 1-1 예산 | 2048×10 / RGBA8 | 2048×10 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_2_0.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_2_1.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_2_2.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_2_3.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_2_4.png` | 1-1 예산 | 2048×10 / RGBA8 | 2048×10 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_3_0.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_3_1.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_3_2.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_3_3.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_3_4.png` | 1-1 예산 | 2048×10 / RGBA8 | 2048×10 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_4_0.png` | 1-1 예산 | 10×2048 / RGBA8 | 10×2048 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_4_1.png` | 1-1 예산 | 10×2048 / RGBA8 | 10×2048 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_4_2.png` | 1-1 예산 | 10×2048 / RGBA8 | 10×2048 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_4_3.png` | 1-1 예산 | 10×2048 / RGBA8 | 10×2048 / RGBA8 | 0.078125 | 0.078125 | 유지 |
| `assets/maps/map11/upscale01/target30/floor_4_4.png` | 1-1 예산 | 10×10 / RGBA8 | 10×10 / RGBA8 | 0.000381 | 0.000381 | 유지 |
| `assets/maps/map11/upscale01/target30/foreground_0.png` | 1-1 예산 | 2000×610 / RGBA8 | 2000×610 / RGBA8 | 4.653931 | 4.653931 | 유지 |
| `assets/maps/map11/upscale01/target30/foreground_1.png` | 1-1 예산 | 2000×610 / RGBA8 | 2000×610 / RGBA8 | 4.653931 | 4.653931 | 유지 |
| `assets/maps/map11/upscale01/target30/north_east.png` | 1-1 예산 | 832×632 / RGBA8 | 832×632 / RGBA8 | 2.005859 | 2.005859 | 유지 |
| `assets/maps/map11/upscale01/target30/north_heart.png` | 1-1 예산 | 788×520 / RGBA8 | 788×520 / RGBA8 | 1.563110 | 1.563110 | 유지 |
| `assets/maps/map11/upscale01/target30/north_west.png` | 1-1 예산 | 834×386 / RGBA8 | 834×386 / RGBA8 | 1.228043 | 1.228043 | 유지 |
| `assets/maps/map11/upscale01/target30/south_east.png` | 1-1 예산 | 1196×994 / RGBA8 | 1196×994 / RGBA8 | 4.535004 | 4.535004 | 유지 |
| `assets/maps/map11/upscale01/target30/south_west.png` | 1-1 예산 | 958×1486 / RGBA8 | 958×1486 / RGBA8 | 5.430557 | 5.430557 | 유지 |
| `assets/maps/map11/upscale01/target30/west_mouth.png` | 1-1 예산 | 1326×948 / RGBA8 | 1326×948 / RGBA8 | 4.795258 | 4.795258 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_0_0.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_0_1.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_0_2.png` | 1-1 예산 | 2048×1498 / RGBA8 | 2048×1498 / RGBA8 | 11.703125 | 11.703125 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_1_0.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_1_1.png` | 1-1 예산 | 2048×2048 / RGBA8 | 2048×2048 / RGBA8 | 16.000000 | 16.000000 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_1_2.png` | 1-1 예산 | 2048×1498 / RGBA8 | 2048×1498 / RGBA8 | 11.703125 | 11.703125 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_2_0.png` | 1-1 예산 | 710×2048 / RGBA8 | 710×2048 / RGBA8 | 5.546875 | 5.546875 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_2_1.png` | 1-1 예산 | 710×2048 / RGBA8 | 710×2048 / RGBA8 | 5.546875 | 5.546875 | 유지 |
| `assets/maps/map11/upscale01/target32/floor_2_2.png` | 1-1 예산 | 710×1498 / RGBA8 | 710×1498 / RGBA8 | 4.057236 | 4.057236 | 유지 |
| `assets/maps/map11/upscale01/target32/foreground_32b_0.png` | 1-1 예산 | 232×285 / RGBA8 | 미로드 | 0.252228 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/target32/foreground_32b_1.png` | 1-1 예산 | 352×262 / RGBA8 | 352×262 / RGBA8 | 0.351807 | 0.351807 | 유지 |
| `assets/maps/map11/upscale01/target32/left_mid.png` | 1-1 예산 | 742×615 / RGBA8 | 미로드 | 1.740761 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/target32/left_near.png` | 1-1 예산 | 1467×1388 / RGBA8 | 미로드 | 7.767471 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/target32/right_mid.png` | 1-1 예산 | 674×682 / RGBA8 | 미로드 | 1.753494 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/target32/right_near.png` | 1-1 예산 | 1233×1538 / RGBA8 | 미로드 | 7.234016 | 0.000000 | 로드 제거/원본 보존 |
| `assets/maps/map11/upscale01/target32/white_tree.png` | 1-1 예산 | 512×291 / RGBA8 | 미로드 | 0.568359 | 0.000000 | 로드 제거/원본 보존 |

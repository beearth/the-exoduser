# 1-1 재질 감사 (2026-11-06)

사실만 적는다. 판단과 권고는 쓰지 않는다. M2와 재질 기준선의 입력이다.

## 0. 기준과 출처

| 항목 | 값 |
|---|---|
| 코드·재질 기준 커밋 | `cf83c8a46` (origin/claude/unity-mac-clean-map-20261105, Mac `base-start`·`m0-start` 캡처가 있는 브랜치) |
| 실제 묶인 재질 목록 | `docs/0마스터플랜/CLEAN_MAP/m0_scene_renderers_412bdee09.csv` (1-1 실행 중 렌더러 덤프, 1,430행, 보이는 렌더러 1,189개). `412bdee09`와 `cf83c8a46`의 런타임 차이는 플래그 뒤 코드(`--a2-ground=m1a`, `--a2-debug-ground`)뿐이다 |
| 텍스처 해상도 | 원본 파일 헤더(PNG IHDR, JPEG SOF)와 `.meta`의 `maxTextureSize`. 웹 빌드 4회차의 축소·패딩은 반영하지 않았다 |
| 마스크 채널 값 | §1.1 값은 원본 텍스처 전체를 512px로 줄여 잰 채널별 평균, 5백분위, 95백분위다(PIL). UV 섬 안쪽만 잰 값은 §5에 있다 |
| 경로 | 기본 실행 `--remodel3d` → `A2ForestSetup` → `A2FieldSetup` (`NativeGame.A2Forest.cs:20-24`, `NativeGame.A2Field.cs:15-84`). Unity는 실행하지 않았다 |

`A2Requested`는 `NativeRemodel3D.Requested`를 그대로 돌려준다(`NativeGame.A2Forest.cs:9-16`). 따라서 3D 경로에서는 항상 A2 숲이 조립된다.

**씬 원래 렌더러:** `A2FieldSetup`은 `r3Roots` 안의 모든 MeshRenderer를 끈다(`NativeGame.A2Field.cs:30-34`). 그래서 `RM1_Slice.unity`가 참조하는 재질 18개(§1.4)는 1-1 화면에 나오지 않는다. 덤프에서도 보이는 개수가 0이다.

## 1. 재질 표

열 설명:
- **보임**은 덤프에서 `activeInHierarchy=1`이고 `rendererEnabled=1`인 렌더러 수다.
- **스무스니스(실효)**는 셰이더가 실제로 쓰는 값이다. URP Lit에 `_METALLICSPECGLOSSMAP`가 켜져 있으면 `_Smoothness`는 배율이고, 실제 값은 마스크 A × `_Smoothness`다. 이때 메탈릭은 마스크 R이고 `_Metallic`은 쓰이지 않는다 [URP Lit 동작. 이 저장소의 셰이더 코드로는 확인하지 않음].

### 1.1 URP Lit 재질 (`.mat` 값)

| 재질 | 보임 | 셰이더·키워드 | `_Smoothness` / `_Metallic` | 마스크 A(스무스니스) 평균 [p5, p95] | 마스크 R(메탈릭) | 노멀 맵 (`_BumpScale`) | 스무스니스 맵 | AO (`_OcclusionStrength`) | 알베도 해상도 (max) |
|---|---|---|---|---|---|---|---|---|---|
| RF3_Ancient_Tree_B | 286 | Lit, METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | UV 안 0.098 상수 (텍스처 전체 0.401 [0.098, 1.0], 1.0은 UV 밖, §5) | 0 | 있음 4096² (0.55) | 있음 4096² (MetallicSmoothness A) | 있음 4096² (0.6) | 4096² (4096) |
| RF3_Ancient_Tree_A | 256 | 위와 같음 | 1 / 1 | UV 안 0.098 상수 (텍스처 전체 0.401 [0.098, 1.0], 1.0은 UV 밖, §5) | 0 | 있음 4096² (0.55) | 있음 4096² | 있음 4096² (0.6) | 4096² (4096) |
| A2 마른 잔가지 목질 (런타임 복제) | 114 | A2_Loft_Bark 복제, SPECULARHIGHLIGHTS_OFF·ENVIRONMENTREFLECTIONS_OFF | 0 / 0 (`NativeGame.A2Bramble.cs:20`) | 해당 없음 | 해당 없음 | 있음 2048² (0.45, `:20`) | 없음 | 없음 | 2048² (2048) |
| RF3_Dead_Leaf_Litter | 75 | Lit, ALPHATEST·METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | 0.078 (상수) | 0 | 있음 1024² (0.25) | 있음 1024² | 있음 1024² (0.6) | 1024² (1024) |
| RF3_Fallen_Log | 34 | Lit, METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | 0.157 (상수) | 0 | 있음 2048² (0.65) | 있음 2048² | 있음 2048² (0.6) | 2048² (2048) |
| A2_Loft_Bark | 21 | Lit, NORMALMAP | 0.18 / 0 | 해당 없음 | 해당 없음 | 있음 2048² (0.8) | 없음 | 없음 (0.65, 맵 없음) | 2048² (2048) |
| A2_Loft_Inner | 21 | Lit, NORMALMAP | 0.18 / 0 | 해당 없음 | 해당 없음 | 있음 2048² (0.5) | 없음 | 없음 | 2048² (2048) |
| A2_Loft_Broken | 21 | Lit, NORMALMAP | 0.18 / 0 | 해당 없음 | 해당 없음 | 있음 2048² (0.25) | 없음 | 없음 | 2048² (2048) |
| RF3_Fungal_Colony | 20 | Lit, METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | 0.114 [0.098, 0.196] | 0 | 있음 1024² (0.55) | 있음 1024² | 있음 1024² (0.6) | 1024² (1024) |
| RF3_Moss_Cushion | 15 | Lit, ALPHATEST·METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | 0.098 (상수) | 0 | 있음 2048² (0.25) | 있음 2048² | 있음 2048² (0.6) | 2048² (2048) |
| A2_Scanned_Stump | 9 | Lit, METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | 0.089 [0.051, 0.141] (Mask A) | 0 | 있음 2048² (0.65) | 있음 2048² (Mask, AO와 같은 파일) | 있음 Mask G (0.65) | 2048² (2048) |
| RF3_Bridge_Torch_Holder | 7 | Lit, METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | 0.160 [0.051, 0.196] | 0 | 있음 1024² (0.55) | 있음 1024² | 있음 1024² (0.6) | 1024² (1024) |
| RF3_Rotten_Wood_Bridge | 1 | Lit, METALLICSPECGLOSSMAP·NORMALMAP·OCCLUSIONMAP | 1 / 1 | 0.154 [0.027, 0.200] | 0 | 있음 2048² (0.55) | 있음 2048² | 있음 2048² (0.6) | 2048² (2048) |
| RF3_Withered_Shrub | 0 (114개 꺼짐) | Lit, ALPHATEST·… | 1 / 1 | 0.098 (상수) | 0 | 있음 2048² (0.25) | 있음 2048² | 있음 2048² (0.6) | 2048² (2048) |
| RF3_Hanging_Moss | 0 (`A2_Hanging_Moss_Lit`로 교체) | Lit, ALPHATEST·… | 1 / 1 | 0.098 (Atlas_moss_01) | 0 | 있음 2048² (0.25, Atlas_moss_01_Normal) | 있음 2048² | 있음 2048² (0.6) | 2048² (2048) |

- 마스크 텍스처는 모두 `sRGBTexture: 0`이다.
- RF3 재질 10개는 `_Smoothness 1`, `_Metallic 1`, `_OcclusionStrength 0.6`, `_Cutoff 0.32`, `_BaseColor (1,1,1,1)`로 같다. `_BumpScale`만 0.25, 0.55, 0.65로 다르다.
- 경로: `unity/Assets/Exoduser/Resources/Art/map/a2/{r3,hollow,stump}/Materials/*.mat`
- FBX와 `.mat` 연결: 모델 `.meta`는 모두 `materialImportMode: 1`, `materialLocation: 1`, `materialName: 0`, `materialSearch: 1`이고 `externalObjects`는 비어 있다. 실제 연결은 위 덤프의 `materials` 열로 확인했다.

### 1.2 커스텀 셰이더 재질 (값이 셰이더 코드에 고정됨)

| 재질 | 보임 | 셰이더 | 스무스니스 계산 (파일:줄) | 측정 입력 → 대략 값 | 메탈릭 | 노멀 | 스무스니스 맵 | 알베도 해상도 |
|---|---|---|---|---|---|---|---|---|
| 지면 `a2FieldSoil` (런타임 생성) | 144 | EXODUSER/HellGroundPBR | `_FullField>.5`: `lerp(.44-.24*SoilRough, .24+.18*(1-FieldMossRough), mossMix)` (`HellGroundPBR.shader:145`) | SoilRough 평균 0.901 [0.855, 0.937] → 0.224 [0.215, 0.235]. FieldMossRough 0.933 [0.863, 0.98] → 0.252 [0.244, 0.265] | 0 (`:139`) | 있음. Soil 0.65, Root 0.65, FieldMoss 0.55 배율이 코드에 고정 (`:112-113`) | 있음. A2_ForestSoil_Roughness 1024², A2_FieldMoss_Roughness 2048² | 혼합: Soil 1024², Roots 1024², ForestFloor 1024², FieldMoss 2048² (모두 max 2048) |
| A2_Root_Cluster_Patch (런타임 복제 `a2FieldRootMaterial`) | 78 | EXODUSER/A2RootSurface | 지면 공식 (`A2RootSurface.shader:96`) → `lerp(지면, 1-ARM.g, 정점색 R)` (`:98`) | ARM G 평균 0.839 [0.773, 0.918] → 1-G = 0.161 [0.082, 0.227] | 0 (`:90`) | 있음. `_ScanNormal` 2048², 배율 0.7 고정 (`:86`) | ARM G 2048² | `_ScanMap` 2048² (max 2048), `_ScanColor (.9,.8,.63)`는 런타임 값 (`NativeGame.A2Field.cs:233`) |
| A2_Scanned_Foreground_Log | 1 | EXODUSER/A2RootSurface | `:98`와 같음. `_FullField`, `_ForestBlend`는 셰이더 기본값 0 (복제·설정 코드 없음) | ARM G 평균 0.772 [0.722, 0.82] → 1-G = 0.228 | 0 | 있음 2048² (0.7 고정) | ARM G 2048² | 2048² (2048) |
| A2_Hanging_Moss_Lit | 73 | EXODUSER/A2HangingMoss | `surface.smoothness=.15` 상수 (`A2HangingMoss.shader:34`). `.mat`의 `_Smoothness 0.15`는 셰이더가 읽지 않음 | 0.15 | 0 | **없음**. `normalTS=(0,0,1)` 고정 (`:34`) | 없음 | Atlas_hanging_moss 2048² (2048) |
| 독액 수면 `a2Water` (런타임 생성) | 1 | EXODUSER/A2ToxicRiver | `lerp(.78,.22,foam)` (`A2ToxicRiver.shader:49`) | 거품 없는 곳 0.78, 거품 0.22 | 0 | 노멀 맵 텍스처 없음 (`normalTS=(0,0,1)`, `:49`) | 없음 | 텍스처 없음 (`_BaseColor` 기반) |
| A2Atmosphere (런타임, 달빛 기둥 등) | 9 | EXODUSER/A2Atmosphere | 조명 계산 없음 [셰이더 27줄, PBR 호출 없음] | 해당 없음 | 해당 없음 | 없음 | 없음 | 없음. `_Color (1.1,1.4,1.65,.065)` (`NativeGame.A2Field.cs:305`), `(1.4,1.6,1.8,.045)` (`NativeGame.A2Forest.cs:174`) |
| A2HeightFog (런타임) | 1 | EXODUSER/A2HeightFog | 조명 계산 없음 [셰이더 36줄] | 해당 없음 | 해당 없음 | 없음 | 없음 | 없음 (`NativeGame.A2Field.cs:296`) |
| A2ContactShadow (런타임) | 1 | EXODUSER/A2ContactShadow | 해당 없음 | 해당 없음 | 해당 없음 | 없음 | 없음 | 없음 (`NativeGame.A2Enemies.cs:22`) |

- 지면 공식의 위쪽 줄들(`HellGroundPBR.shader:139-144`)은 `:145`가 `_FullField=1`일 때 덮어쓴다. `_FullField=1`은 `NativeGame.A2Field.cs:55`에서 설정한다.
- `--a2-ground=m1a` 플래그를 주면 `:147`이 `.44-.24*SoilRough(2.78u 타일)`로 다시 덮는다. 기본 실행에서는 꺼져 있다.
- 지면 `surface.occlusion=1`이다(`:138`). AO 맵을 쓰지 않는다.
- 지면 `_BaseMap`은 Terrain 레이어 diffuse이고(`NativeGame.HellGround.cs:19`), 덤프에서는 `ch1_1_r1r2_colormap_wide` 4260×3031이다. `_FullField` 경로의 알베도 식(`HellGroundPBR.shader:100-115`)은 이 맵을 쓰지 않는다 [`:100-115` 안에 `_BaseMap` 샘플이 없음].
- HD2D 스프라이트, 접촉 그림자, `Sprites-Default` 렌더러는 캐릭터·VFX용이라 이 표에서 뺐다.

### 1.3 런타임에 재질 값을 덮는 코드

| 파일:줄 | 대상 | 바꾸는 값 |
|---|---|---|
| `NativeGame.A2Field.cs:32` | 지면 | 씬 `지옥 바닥 PBR 표면` 재질을 복제해 `a2FieldSoil`로 사용 |
| `NativeGame.A2Field.cs:55` | 지면 | `_ForestBlend 1`, `_ForestTextureMix .65`, `_SoilTextureMix 1`, `_FullField 1` |
| `NativeGame.A2Field.cs:56-63` | 지면 | Forest, Soil, Root, FieldMoss의 BaseColor, Normal, Roughness 12장 지정 |
| `NativeGame.A2Field.cs:68`, `:72` | 지면 | `_FieldSdf` 200² RGBA32, `_FieldCover` 256² RGBA32 (런타임 생성, 선형) |
| `NativeGame.HellGround.cs:17-22` | 지면 원본 | HellGroundPBR 생성, `_RockMap`·`_AshMap`·`_RockNormal`·`_RockRough` 지정 (Trilinear, mipMapBias 2, aniso 8) |
| `NativeGame.A2Field.cs:229-233` | 뿌리 | A2_Root_Cluster_Patch 복제, 지면 텍스처와 float 4개 복사, `_ScanColor (.9,.8,.63)` |
| `NativeGame.A2Forest.cs:249` | 고목 (MPB) | `_BaseColor (.95,.80,.60)`, `_BumpScale .9`, `_OcclusionStrength .9` (`.mat`의 0.55, 0.6 대신) |
| `NativeGame.A2Forest.cs:245-246` | 수염이끼 | 재질을 A2_Hanging_Moss_Lit로 교체, MPB `_BaseColor (1,.95,.75)` |
| `NativeGame.A2Field.cs:276` | 나무에 붙은 이끼 (MPB) | `_BaseColor (.60,.62,.40)` |
| `NativeGame.A2Foreground.cs:26` | 전경 목질 이끼 (MPB) | `_BaseColor (.65,.62,.48)` |
| `NativeGame.A2Bramble.cs:87` | 다리 이끼 (MPB) | `_BaseColor (.62,.63,.43)` |
| `NativeGame.A2Forest.cs:248` | 고사 덤불 (MPB) | `_BaseColor (.95,.75,.50)`. 렌더러는 `NativeGame.A2Bramble.cs:25`에서 꺼짐 |
| `NativeGame.A2Forest.cs:250` | 버섯 (MPB) | `_BaseColor (.65,.55,.40)` |
| `NativeGame.A2Forest.cs:251` | 그루터기 (MPB) | `_BaseColor (.85,.78,.65)` |
| `NativeGame.A2Bramble.cs:16-22` | 잔가지 | A2_Loft_Bark 복제, `_BaseColor (1.1,.8,.5)`, `_Smoothness 0`, `_BumpScale .45`, 스펙큘러 하이라이트·환경 반사 끔 |
| `NativeGame.A2ShoreField.cs:26`, `:51` | 수면 | `_ShoreField`, `_ShoreBounds`, `_ShoreReady 1` |
| `A2RiverReflection.cs:26`, `:51-57` | 수면 | `_PlanarStrength` 0 또는 1, `_PlanarReflection` RT. D3D12에서는 0으로 끔 (`:26`) |
| `A2SightFade.cs:144-152` | 시야 가림 물체 | `EXODUSER/A2SightFade` 복제 재질로 `_BaseMap`, `_BaseColor`, `_BumpMap` 복사 |
| `NativeGame.A2Clean.cs:34-41` | 지면 | 플래그가 있을 때만 키워드 `_A2_GROUND_M1A`, `_A2_DBG_*` |

`NativeGame.HellLighting.cs`와 `NativeGame.HellEnvironment.cs`의 재질 생성(철 `_Metallic .8`, `_Smoothness .45`; 환경 `_Smoothness .24`)은 1-1 덤프에 해당 재질이 보이지 않는다. 그 이유가 `HellEnvironmentSetup`이 `!A2Requested`일 때만 도는 것인지(`NativeGame.HellLighting.cs:54`)는 철 재질 줄(`:68`)을 끝까지 추적하지 않아 [확인 불가]로 둔다.

### 1.4 씬 `RM1_Slice.unity`가 참조하는 재질 (A2 경로에서 렌더러 꺼짐)

| 재질 | 씬 참조 수 | 셰이더 | `_Smoothness` / `_Metallic` | 노멀 | 알베도 |
|---|---|---|---|---|---|
| M_RottenWoodMembrane | 15 | URP Lit, NORMALMAP | 0.1 / 0 | mass_v01_normal 1024² (`_BumpScale` 1) | mass_v01 1024² |
| M_CursedBark | 12 | URP Lit, NORMALMAP | 0.06 / 0 | mass_v01_normal 1024² (1) | mass_v01 1024² |
| M_BgTree | 6 | EXODUSER/FgCard | 해당 없음 | 없음 | card_bg_tree 256² |
| M_ToxicFlow | 3 | EXODUSER/ToxicFlow | 해당 없음 | 없음 | 없음 |
| M_FgRoots | 2 | EXODUSER/FgCard | 해당 없음 | 없음 | card_fg_roots 256² |
| M_Shaft_Hell_1, _2 | 1씩 | EXODUSER/LightShaft | 해당 없음 | 없음 | 없음 |
| M_Decal_* 11개 | 1씩 | EXODUSER/GroundDecal | 해당 없음 | 없음 | 1024² 10장, decal_wet 256² |

`unity/Assets/Exoduser/Rendering/M_HellHeightFog.mat`은 EXODUSER/HellHeightFog이고 float·color 값이 없다. 사용처는 §2의 HellFogFeature에서 다룬다.

## 2·3 공통 기준

- 기준: 커밋 `cf83c8a46`, 텍스트 추출본. Unity 실행 없음. 사실만 적고 판단은 적지 않음.
- `.meta`는 추출본에 없음(0개). GUID는 `git show cf83c8a46:<path>.meta`로 확인함.
- 패키지 버전: `unity/Packages/manifest.json`에 `com.unity.render-pipelines.universal` 17.6.0, `com.unity.cinemachine` 6.6.0이 있고, `unity/ProjectSettings/ProjectVersion.txt`는 `6000.6.7f1` (git show로 확인). 아래 enum 해석(예: mode 1=Neutral)은 URP 17 소스 enum 기준이며, 패키지 소스는 추출되지 않았음.

## 2-3. 후처리·조명 코드 경로

| 단계 | 위치 | 내용 |
|---|---|---|
| 스위치 | `unity/Assets/Exoduser/Runtime/NativeRemodel3D.cs:11-12` | `Requested` = 명령줄에 `--remodel3d`가 있을 때. 또는 (에디터이고 `--unity-qa-sandbox`가 있고 `EXO_A2_EDITOR_PREVIEW=1`일 때) |
| A2 스위치 | `unity/Assets/Exoduser/Runtime/NativeGame.A2Forest.cs:9-16` | `A2Requested`는 `NativeRemodel3D.Requested`를 그대로 반환함. 따라서 `--remodel3d`이면 A2 경로가 항상 켜짐 |
| 호출 | `unity/Assets/Exoduser/Runtime/NativeGame.StageFlow.cs:106` → `NativeGame.Remodel3D.cs:35-43` `Remodel3DSync()` | 필드(`!Stage.InArena`)에서 `Remodel3DLoad()` 코루틴을 시작함 |
| 씬 로드 | `NativeGame.Remodel3D.cs:115-116` | `CanStreamedLevelBeLoaded("RM1_Slice")`가 false이면 2D를 유지함. true이면 Additive로 로드함 |
| 빌드 포함 조건 | `unity/ProjectSettings/EditorBuildSettings.asset:8-10` | 빌드 씬 목록에는 `Assets/Scenes/FirstPlayable.unity` 하나만 있음 |
| | `unity/Assets/Exoduser/Editor/PortVerification.cs:253` | `-remodel-scenes 1`을 줄 때만 빌드 씬에 `RM1_Slice.unity`를 추가함 |
| 볼륨 1차 수정 | `NativeGame.Remodel3D.cs:136-138` | 아래 §2.3 |
| 조명 설정 | `NativeGame.Remodel3D.cs:139` → `NativeGame.HellLighting.cs:16-79` `HellLightingSetup()` | `--unity-keyshot-baseline`가 있으면 이 단계 전체를 건너뜀 |
| 지면 | `NativeGame.HellLighting.cs:53` `HellGroundSetup(g)` | 항상 실행됨 |
| | `NativeGame.HellLighting.cs:54` `if(!A2Requested)HellEnvironmentSetup(g)` | `--remodel3d` 경로에서는 건너뜀 |
| A2 숲 | `NativeGame.HellLighting.cs:78` → `NativeGame.A2Forest.cs:20-24` → `NativeGame.A2Field.cs:15-89` `A2FieldSetupSteps()` | 활성 경로 |
| A2 레거시 | `NativeGame.A2Forest.cs:26` `A2LegacyKeyshotSetup()` | 저장소 전체 grep 결과 호출하는 곳이 없음. 그 안의 `A2Atmosphere()`(:166, 스폿광 :178 포함)는 이 함수(:136)에서만 호출됨 |
| 활성화 | `NativeGame.Remodel3D.cs:141` → `:157-167` `Remodel3DSetActive(true)` → `:164` `HellLightingActive(true)` (`NativeGame.HellLighting.cs:80-93`) | RenderSettings를 런타임에 대입함 |
| 보스방 | `NativeGame.Remodel3D.cs:172` → `NativeGame.HellArenaLighting.cs:11-56` `HellArenaLate()` | `Stage.InArena`일 때만. 이때 3D 씬 루트는 `SetActive(false)` 상태(`NativeGame.Remodel3D.cs:165`) |
| HD2D 기본값 | `unity/Assets/Exoduser/Runtime/NativeHd2D.cs:10` | `Enabled`는 `--legacy-models`가 없으면 true |

---

## ② 후처리

### 2.1 씬 Volume 컴포넌트 (RM1_Slice.unity)

씬 안의 Volume은 1개임. 이 씬의 MonoBehaviour 10개 가운데 Volume은 하나뿐임(`m_EditorClassIdentifier` 기준).

| 항목 | 값 | 위치 |
|---|---|---|
| GameObject | `Global Volume` (씬 루트, Layer 0, Active 1) | `unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity:8513-8519` |
| 클래스 | `UnityEngine.Rendering.Volume` | `RM1_Slice.unity:8531` |
| m_IsGlobal | 1 | `RM1_Slice.unity:8532` |
| priority | 0 | `RM1_Slice.unity:8533` |
| blendDistance | 0 | `RM1_Slice.unity:8534` |
| weight | 1 | `RM1_Slice.unity:8535` |
| sharedProfile | guid `12932462e5f067a4cb4048a4a595235d` → `unity/Assets/Exoduser/Rendering/GlobalVolume_Hell.asset` (`.meta`를 git show로 확인) | `RM1_Slice.unity:8536` |
| 카메라 볼륨 마스크 | `m_VolumeLayerMask.m_Bits: 1` (Layer 0) | `RM1_Slice.unity:10352` |

### 2.2 GlobalVolume_Hell.asset (프로필 원본 값)

파일: `unity/Assets/Exoduser/Rendering/GlobalVolume_Hell.asset`. 컴포넌트 목록은 :55-59이고 Tonemapping, Bloom, ColorAdjustments, Vignette 4개임. 4개 모두 `active: 1`이고, 아래 파라미터는 전부 `m_OverrideState: 1`임.

| 오버라이드 | 파라미터 | 값 | overrideState | 위치 |
|---|---|---|---|---|
| Tonemapping | mode | 1 (Neutral) | 1 | :16-18 |
| | neutralHDRRangeReductionMode | 2 | 1 | :19-21 |
| | acesPreset | 3 | 1 | :22-24 |
| | hueShiftAmount | 0 | 1 | :25-27 |
| | detectPaperWhite / paperWhite | 0 / 300 | 1 / 1 | :28-33 |
| | detectBrightnessLimits / minNits / maxNits | 1 / 0.005 / 1000 | 1 | :34-42 |
| Bloom | skipIterations | 1 | 1 | :73-75 |
| | threshold | 1.05 | 1 | :76-78 |
| | intensity | 0.28 | 1 | :79-81 |
| | scatter | 0.55 | 1 | :82-84 |
| | clamp | 65472 | 1 | :85-87 |
| | tint | (1, 0.82, 0.72, 1) | 1 | :88-90 |
| | highQualityFiltering | 0 | 1 | :91-93 |
| | filter / downscale | 0 / 0 | 1 | :94-99 |
| | maxIterations | 6 | 1 | :100-102 |
| | dirtTexture / dirtIntensity | none / 0 | 1 | :103-109 |
| ColorAdjustments | postExposure | 1.3 | 1 | :123-125 |
| | contrast | 10 | 1 | :126-128 |
| | colorFilter | (1, 0.98, 0.97, 1) | 1 | :129-131 |
| | hueShift | 0 | 1 | :132-134 |
| | saturation | -8 | 1 | :135-137 |
| Vignette | color | (0.07, 0.025, 0.02, 1) | 1 | :151-153 |
| | center | (0.5, 0.5) | 1 | :154-156 |
| | intensity | 0.28 | 1 | :157-159 |
| | smoothness | 0.55 | 1 | :160-162 |
| | rounded | 0 | 1 | :163-165 |

다음 오버라이드는 이 프로필에 없음: LiftGammaGain, WhiteBalance, SplitToning, DepthOfField, FilmGrain, ChromaticAberration, MotionBlur, LensDistortion, PaniniProjection, ShadowsMidtonesHighlights, ColorCurves, ChannelMixer, ColorLookup.

#### 기본 볼륨 프로필 (파이프라인 기본값 층)

- `unity/Assets/UniversalRenderPipelineGlobalSettings.asset:277`: `URPDefaultVolumeProfileSettings.m_VolumeProfile`의 guid는 `6941a22625027324499f0c6124de829f`이고, 이것은 `unity/Assets/DefaultVolumeProfile.asset`임(`.meta`를 git show로 확인).
- `unity/Assets/UniversalRenderPipelineGlobalSettings.asset:149`: `m_DefaultSettingsVolumeProfile`의 guid는 `eda47df5b85f4f249abf7abd73db2cb2`임. [확인 불가: 이 GUID에 대응하는 `.meta`가 저장소 git grep에 없음(패키지 자산으로 추정)]
- `unity/Assets/Exoduser/Rendering/URP_PC_High.asset:95`: `m_VolumeProfile`은 none.
- DefaultVolumeProfile.asset에는 오버라이드 19종이 있고 `m_OverrideState: 1`이 121건임. 주요 값:

| 파라미터 | 값 | 위치 (`unity/Assets/DefaultVolumeProfile.asset`) |
|---|---|---|
| Bloom threshold / intensity / scatter / tint | 0.9 / 0 / 0.7 / (1,1,1,1) | :21 / :24 / :27 / :33 |
| Tonemapping mode | 0 (None) | :754 |
| ColorAdjustments postExposure / contrast / colorFilter / hueShift / saturation | 0 / 0 / (1,1,1,1) / 0 / 0 | :667 / :670 / :673 / :676 / :679 |
| Vignette color / intensity / smoothness | (0,0,0,1) / 0 / 0.2 | :504 / :510 / :513 |
| LiftGammaGain lift / gamma / gain | (1,1,1,0) ×3 | :645 / :648 / :651 |
| WhiteBalance temperature / tint | 0 / 0 | :463 / :466 |
| SplitToning balance | 0 | :488 |
| DepthOfField mode | 0 (Off) | :152 |
| FilmGrain type / intensity | 0 / 0 | :695 / :698 |
| MotionBlur mode / intensity | 0 / 0 | :127 / :133 |
| ChromaticAberration / LensDistortion / PaniniProjection / ScreenSpaceLensFlare intensity·distance | 0 | :447 / :198 / :108 / :532 |

### 2.3 런타임 볼륨 수정 (실행 순서대로)

`volume.profile`에 처음 접근하면 Unity가 sharedProfile의 인스턴스 사본을 만듦(Unity API 동작). 아래 수정은 모두 그 사본에 적용됨.

| # | 위치 | 대상 | 설정 값 | 실행 조건 |
|---|---|---|---|---|
| 1 | `unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:136-138` | ColorAdjustments(TryGet) | postExposure.Override(1), saturation.Override(-18), colorFilter.Override((0.82, 0.9, 1)) | 씬 로드 직후. 항상 실행 |
| 2 | `NativeGame.HellLighting.cs:26` | `hellProfile = profile` 사본 참조를 저장함(보스방 §2.4에서 사용) | — | `--unity-keyshot-baseline`가 없을 때 |
| 3 | `NativeGame.HellLighting.cs:27` | Tonemapping(없으면 Add) | mode.Override(ACES) | 위와 같음 |
| 4 | `NativeGame.HellLighting.cs:28-29` | ColorAdjustments(없으면 Add) | postExposure .25, contrast 16, saturation -8, colorFilter white | 위와 같음 |
| 5 | `NativeGame.HellLighting.cs:30` | SplitToning(프로필에 없으므로 Add) | shadows (0.43, 0.48, 0.54), highlights (0.55, 0.51, 0.46), balance -12 | 위와 같음 |
| 6 | `NativeGame.HellLighting.cs:31` | Bloom(TryGet) | threshold 1.1, intensity 0.16, scatter 0.48 (tint 등 나머지는 에셋 값 유지) | 위와 같음 |
| 7 | `NativeGame.HellLighting.cs:32` | Vignette(TryGet) | color (0.008, 0.012, 0.018), intensity 0.13, smoothness 0.65 | 위와 같음 |
| 8 | `NativeGame.HellLighting.cs:33` | FilmGrain가 있으면 active=false | 프로필에 FilmGrain이 없어 아무 일도 하지 않음 | 위와 같음 |
| 9 | `NativeGame.A2Field.cs:46-49` | ColorAdjustments(TryGet) | postExposure.Override(.55), contrast.Override(16) | A2 경로(`--remodel3d`이면 항상). 단 #2-8과 마찬가지로 HellLightingSetup 안에서 호출되므로 baseline 플래그가 있으면 실행되지 않음 |
| — | `NativeGame.A2Forest.cs:31-34` | ColorAdjustments postExposure .25, contrast 16 | — | 호출처가 없는 `A2LegacyKeyshotSetup` 안이라 실행되지 않음 |

**기본 실행(`--remodel3d`만 줌)에서 필드 볼륨의 최종 값** (위 순서를 적용한 결과):

| 오버라이드 | 최종 값 | 마지막으로 쓴 곳 |
|---|---|---|
| Tonemapping mode | ACES (나머지 파라미터는 에셋 값) | `NativeGame.HellLighting.cs:27` |
| Bloom | threshold 1.1 / intensity 0.16 / scatter 0.48 / tint (1, 0.82, 0.72) / skipIterations 1 / maxIterations 6 / HQ 0 | `NativeGame.HellLighting.cs:31`, tint 등은 `GlobalVolume_Hell.asset:88-102` |
| ColorAdjustments | postExposure 0.55 / contrast 16 / saturation -8 / colorFilter (1,1,1) / hueShift 0 | `NativeGame.A2Field.cs:49`, `NativeGame.HellLighting.cs:29`, `GlobalVolume_Hell.asset:132-134` |
| Vignette | color (0.008, 0.012, 0.018) / intensity 0.13 / smoothness 0.65 / center (0.5, 0.5) / rounded 0 | `NativeGame.HellLighting.cs:32`, `GlobalVolume_Hell.asset:154-165` |
| SplitToning | shadows (0.43, 0.48, 0.54) / highlights (0.55, 0.51, 0.46) / balance -12 | `NativeGame.HellLighting.cs:30` |

`--unity-keyshot-baseline`이 있으면 #1만 적용됨: Neutral 톤매핑, postExposure 1, saturation -18, colorFilter (0.82, 0.9, 1), 나머지는 에셋 값.

### 2.4 그 밖의 볼륨과 카메라 후처리 관련 런타임 코드

| 위치 | 내용 | 조건 |
|---|---|---|
| `NativeGame.HellArenaLighting.cs:22` | 보스방 리그에 Volume을 추가함: isGlobal=true, priority=20, `sharedProfile=Instantiate(hellProfile)` (최초 보스방 진입 시점의 사본을 복제) | `Stage.InArena`이고 `hellActorMaterial!=null`일 때 (`:14`) |
| `NativeGame.HellArenaLighting.cs:19-20` | 보스방 카메라를 새로 만들고 `renderPostProcessing=true` | 위와 같음 |
| `unity/Assets/Exoduser/Runtime/NativeGame.cs:108` | 2D `view` 카메라 `renderPostProcessing=true` | 범위 밖 파일이며 참고용 |
| `unity/Assets/Exoduser/Runtime/NativeRevive.DeathScreen.cs:116` | 사망 화면 Volume: global, priority 1000 | 범위 밖 파일이며 참고용. 활성 조건은 추적하지 않음 |
| `unity/Assets/Exoduser/Runtime/NativeGraphicsOptions.cs:72-87` | 옵션 `postfx`가 off이면 모든 Volume의 weight=0(:78). `bloom`이 off이면 `Bloom.active=false`(:83). 둘 다 on이면 복원만 함(:74) | 옵션 값에 따름. 기본값은 "everything on, scale 100"이며 이때 씬을 건드리지 않음(:9 주석) |
| `NativeGraphicsOptions.cs:46-51` | `resScale`이 100 미만이면 `UniversalRenderPipeline.asset.renderScale`을 변경함 | 위와 같음 |
| `NativeGraphicsOptions.cs:89-93` | 옵션 `fog`가 off이면 `RenderSettings.fog=false` | 위와 같음 |
| `unity/Assets/Exoduser/Runtime/A2RiverReflection.cs:36` | 반사용 카메라 `renderPostProcessing=false` | 범위 밖 파일이며 참고용 |

### 2.5 활성 파이프라인 에셋

| 항목 | 값 | 위치 |
|---|---|---|
| GraphicsSettings 기본 RP | guid `5edf045594cd463478d43e46c84c62e5` → `URP_PC_High.asset` | `unity/ProjectSettings/GraphicsSettings.asset:49` |
| 현재 품질 레벨 | 5 (Ultra) | `unity/ProjectSettings/QualitySettings.asset:7` |
| 플랫폼별 기본 품질 | Standalone 5 / Android 2 / iPhone 2 / WebGL 3 | `QualitySettings.asset:341 / 329 / 346 / 343` |
| Ultra의 customRenderPipeline | `URP_PC_High` (guid 5edf…) | `QualitySettings.asset:316` |
| High·Very High | `URP_PC_High` | `QualitySettings.asset:210, 263` |
| Very Low·Low·Medium | `URP_Mac_Balanced` (guid `c76f44574454409428af0de1deccf5c5`) | `QualitySettings.asset:51, 104, 157` |
| 렌더러 | `URP_PC_High_Renderer` (guid `274402fbb9be15a43b9258d918d60ee4`), 인덱스 0 | `URP_PC_High.asset:20-21` |
| 카메라 렌더러 인덱스 | -1 (파이프라인 기본값 사용) | `RM1_Slice.unity:10349` |

[확인 불가: 실제 실행 플랫폼과 사용자 품질 레벨 설정. Standalone이 기본이면 Ultra, 즉 URP_PC_High임]

### 2.6 URP 에셋과 카메라의 렌더링 설정

| 항목 | URP_PC_High | URP_Mac_Balanced | 위치 (PC / Mac) |
|---|---|---|---|
| HDR (m_SupportsHDR) | 1 | 1 | `unity/Assets/Exoduser/Rendering/URP_PC_High.asset:26` / `URP_Mac_Balanced.asset:26` |
| HDR 정밀도 | 0 | — | `URP_PC_High.asset:27` |
| MSAA | 4 | 2 | :28 / :28 |
| renderScale | 1 | 1 | :29 / :29 |
| upscalingFilter | 0 | 0 | :30 / :30 |
| ColorGradingMode / LUT 크기 | 0 (LDR) / 32 | — | `URP_PC_High.asset:79-80` |
| 렌더링 모드 (렌더러) | 0 (Forward) | — | `unity/Assets/Exoduser/Rendering/URP_PC_High_Renderer.asset:98` |
| 렌더러 기능 | Decal(:39), HellSsao(:13), HellFog(:116) | Decal만 있음 (`URP_Mac_Balanced_Renderer.asset:67`) | `URP_PC_High_Renderer.asset:74-77` |

카메라(`Main Camera`, `RM1_Slice.unity`)의 씬 값과 런타임 변경:

| 항목 | 씬 값 | 위치 | 런타임 변경 |
|---|---|---|---|
| m_HDR | 1 | :10420 | — |
| m_AllowMSAA | 1 | :10421 | — |
| m_RenderPostProcessing | 1 | :10355 | — |
| m_Antialiasing / Quality | 0 (None) / 2 | :10356-10357 | `NativeGame.A2Field.cs:85`: HD2D가 켜져 있으면 None, 아니면 SMAA. quality는 High. 기본(HD2D on)은 None |
| m_RequiresDepthTextureOption | 2 | :10345 | `NativeGame.A2Field.cs:86`: `requiresDepthTexture=true`, `depthTextureMode\|=Depth` |
| m_RenderShadows | 1 | :10344 | — |
| m_StopNaN / m_Dithering | 0 / 0 | :10358-10359 | — |
| m_AllowHDROutput | 1 | :10362 | — |
| ClearFlags / 배경색 | 2 / (0.0235, 0.0157, 0.0118) | :10385-10386 | `NativeGame.A2Field.cs:87`: 배경 (0.105, 0.145, 0.17), far 220 |
| far / FOV | 160 / 35.63778 | :10408-10409 | FOV는 `NativeGame.Remodel3D.cs:196-201`에서 `remodel_camera.json`의 verticalFieldOfView=46.9453을 vcam Lens에 대입함 (json은 git show로 확인) |
| depth | — | — | `NativeGame.Remodel3D.cs:133`: `view.depth + 10` |

### 2.7 SSAO 렌더러 기능 (HellSsaoFeature)

| 항목 | 값 | 위치 |
|---|---|---|
| 이름 / 활성 | "지옥 필드 접촉음영" / m_Active 1 | `URP_PC_High_Renderer.asset:13, 15` |
| AOMethod | 0 (Blue Noise) | :17 |
| Downsample | 0 | :18 |
| AfterOpaque | 0 | :19 |
| Source | 1 (DepthNormals) | :20 |
| NormalSamples | 1 (Medium) | :21 |
| Intensity | 0.6 | :22 |
| DirectLightingStrength | 0.12 | :23 |
| Radius | 0.18 | :24 |
| Samples | 0 (High) | :25 |
| BlurQuality | 0 (High) | :26 |
| Falloff | 100 | :27 |
| 실행 게이트 | `NativeGame.HellAtmosphereEnabled && game!=null && camera==game.Remodel3DCamera` | `unity/Assets/Exoduser/Runtime/HellSsaoFeature.cs:9` |
| HellAtmosphereEnabled 대입 | `HellLightingActive(on)`에서 `=on` | `NativeGame.HellLighting.cs:82` |

### 2.8 HellFog 렌더러 기능

| 항목 | 값 | 위치 |
|---|---|---|
| 이름 / 활성 | "지옥 필드 높이 광산란" / 1 | `URP_PC_High_Renderer.asset:116, 118` |
| 클래스 | `FullScreenPassRendererFeature` 상속 | `unity/Assets/Exoduser/Runtime/HellFogFeature.cs:4` |
| injectionPoint | 550 (BeforeRenderingPostProcessing) | `URP_PC_High_Renderer.asset:119` |
| fetchColorBuffer / requirements | 1 / 1 (Depth) | :120-121 |
| passMaterial | guid `2c3e63928d3f8ce4c89e9b073b9b73c2` → `unity/Assets/Exoduser/Rendering/M_HellHeightFog.mat` (`.meta`를 git show로 확인). 셰이더 `EXODUSER/HellHeightFog`. 머티리얼에 저장된 속성 없음 | `URP_PC_High_Renderer.asset:122`, `M_HellHeightFog.mat:11, 25-28` |
| 셰이더 하드코딩 값 | 16스텝, density `.065*exp(-max(y-.4,0)*1.8)`, 기본 산란색 (0.06, 0.12, 0.16), 불 5곳에 (0.6, 0.35, 0.15) 가산 | `unity/Assets/Exoduser/Resources/Shaders/HellHeightFog.shader:29-34` |
| 실행 게이트 | `HellAtmosphereEnabled && NativeGraphicsOptions.Fog && camera==Remodel3DCamera` | `HellFogFeature.cs:9` |
| URP_Mac_Balanced 렌더러 | HellFog·HellSsao 없음 | `URP_Mac_Balanced_Renderer.asset:27-69` |

이것과 별개로 A2 메시 기반 높이 안개가 있음: `NativeGame.A2Field.cs:293-296`에서 "A2 지면 높이 안개" GameObject(layer 4)를 만들고 화면 쿼드에 `EXODUSER/A2HeightFog` 머티리얼을 씀.

---

## ③ 조명

### 3.1 씬 라이트 (RM1_Slice.unity, Light 8개)

8개 모두 `m_Enabled 1`, `m_Lightmapping 4` (Realtime), `m_RenderMode 0`, `m_UseColorTemperature 0` (m_ColorTemperature 6570), `m_Shadows.m_Resolution -1` (파이프라인 값 사용)임. 씬에 UniversalAdditionalLightData 컴포넌트는 없음(MonoBehaviour 목록 기준).

| 이름 (계층) | 종류 | 색 | 강도 | 범위 | 그림자 종류 | 세기 / bias / normalBias | 위치 (type·색·강도 / 그림자) |
|---|---|---|---|---|---|---|---|
| Key Light (루트) | Directional (1) | (1, 0.8, 0.7) | 0.6 | — | 2 (Soft) | 0.8 / 0.05 / 0.4 | :4268-4270 / :4276-4281. 회전 :4332, ShapeRadius·ShadowAngle 기본값 |
| Lights/Pools/Pool_Toxic_02 | Point (2) | (0.718, 0.710, 0.290) | 1.8 | 3.8 | 0 (None) | 1 / 0.05 / 0.4 | :701-704 / :709-714 |
| Lights/Pools/Pool_Toxic_01 | Point | (0.718, 0.710, 0.290) | 2.4 | 4.4 | 0 | 같음 | :5848-5851 / :5856-5861 |
| Lights/Pools/Pool_Hell_03 | Point | (0.690, 0.157, 0.110) | 7.5 | 6 | 0 | 같음 | :6166-6169 / :6174-6179 |
| Lights/Pools/Pool_Hell_05 | Point | (0.690, 0.157, 0.110) | 5 | 3.6 | 0 | 같음 | :8144-8147 / :8152-8157 |
| Lights/Pools/Pool_Hell_01 | Point | (0.690, 0.157, 0.110) | 7 | 5.8 | 0 | 같음 | :9133-9136 / :9141-9146 |
| Lights/Pools/Pool_Hell_02 | Point | (0.690, 0.157, 0.110) | 6 | 5.2 | 0 | 같음 | :10216-10219 / :10224-10229 |
| Lights/Pools/Pool_Hell_04 | Point | (0.690, 0.157, 0.110) | 6 | 5.2 | 0 | 같음 | :12506-12509 / :12514-12519 |

씬 RenderSettings에 `m_Sun: {fileID: 0}`가 있음(:40). 씬 루트는 Key Light, Lights, Player Marker, Global Volume, Main Camera, CM LOOK-001, Shafts, World임.

### 3.2 런타임 라이트 수정 (실행 순서)

| # | 위치 | 대상 | 설정 값 | 조건 |
|---|---|---|---|---|
| 1 | `NativeGame.HellLighting.cs:35` | `Shafts`, `Foreground Cards`, `Background Cards`를 Destroy함 (Light 포함 여부: 씬의 Light 8개는 모두 이 아래에 없음) | — | baseline 플래그가 없을 때 |
| 2 | `NativeGame.HellLighting.cs:38` | Directional (Key Light) | color (0.85, 0.89, 1), intensity 1, Soft, shadowStrength 0.85, rotation Euler(62, 35, 0) | 위와 같음 |
| 3 | `NativeGame.HellLighting.cs:39` | 이름이 `Pool_Hell`로 시작하는 5개 | color (1, 0.60, 0.28), intensity 5, range 4.7, Soft, strength 0.8, bias 0.025, normalBias 0.1 | 위와 같음 |
| 4 | `NativeGame.HellLighting.cs:40` | 그 밖의 비방향성 라이트 (Pool_Toxic_01/02) | intensity ×0.6 (결과 1.44 / 1.08) | 위와 같음 |
| 5 | `NativeGame.HellLighting.cs:58-59` | 새로 만듦: "영웅 차가운 림광" (Player Marker 자식, local (-0.3, 1.8, 0.6)) | Point, color (0.68, 0.8, 1), range 3.5, intensity 2.2, shadows는 코드에서 지정하지 않음 | 위와 같음 |
| 6 | `NativeGame.HellLighting.cs:60-61` | 새로 만듦: "영웅 달빛 웅덩이" (Player Marker 자식, local (0, 4, 0), Euler(90, 0, 0)) | Spot, color (0.72, 0.84, 1), intensity 14, range 7, spotAngle 58, inner 40, Soft, strength 0.65, normalBias 0.1 | 위와 같음 |
| 7 | `NativeGame.HellLighting.cs:64-76` | 화로 5개 (`Art/map/keyshot/brazier.fbx`) | 코드에서 Light를 추가하지 않음. fbx `.meta`는 `importLights: 1`(:48)이지만 fbx 바이너리에서 "Light" 문자열 0건 | `NativeGame.A2Field.cs:36`에서 루트 "실제 철제 지옥불 화로"를 SetActive(false)함 |
| 8 | `NativeGame.A2Field.cs:39-43` | Directional (Key Light) | intensity 3.2, color (0.85, 0.90, 1), Soft, strength 0.55, bias 0.035, normalBias 0.12, rotation Euler(49, -32, 0) | A2 경로 (`--remodel3d`, baseline 아님) |
| 9 | `NativeGame.A2Field.cs:44` | 이름이 `Pool_`로 시작하는 7개 | `enabled=false` | 위와 같음 |
| 10 | `NativeGame.A2Field.cs:191, 193` → `NativeGame.A2Forest.cs:155-164` `A2Torch()` | 새로 만듦: "A2 횃불 불꽃" 7개. 좌표 (40.8, -74.1), (45.6, -69.5), (31, -61), (18.3, -40.2), (59, -39), (32, -15), (40, -5.5) | Point, color (1, 0.55, 0.19), range 5, intensity 7, Soft, bias 0.04, normalBias 0.1. shadowStrength는 지정하지 않음 | `RF3_Bridge_Torch_Holder` 리소스와 `hellFlameFrames`가 null이 아닐 때만 (`A2Forest.cs:157`). 두 리소스 모두 git에 있음 |
| 11 | `NativeGame.A2Field.cs:298-299` | 활성 Directional의 forward를 읽어 빛기둥 메시 방향으로 씀 (라이트는 수정하지 않음) | — | — |
| 12 | `unity/Assets/Exoduser/Runtime/NativeGame.A2Clean.cs:22-29` | a2Root 자식 가운데 유지 목록에 없는 것의 Light를 `enabled=false` (#10 횃불 7개가 여기에 해당) | — | `--a2-clean`일 때만 |
| — | `NativeGame.A2Forest.cs:143-144, 178` | Directional 2.4 / (1, 0.96, 0.90) / strength 0.65 / (54, -32, 0). Spot "A2 수관 달빛 국소광" intensity 30 / range 18 / 22°·14° / Soft | 호출처가 없는 레거시 함수 안이라 실행되지 않음 |

**기본 실행(`--remodel3d`)에서 필드 메인 라이트의 최종 값**: Directional, intensity 3.2, color (0.85, 0.90, 1), Soft, shadowStrength 0.55, bias 0.035, normalBias 0.12, 회전 (49, -32, 0) — `NativeGame.A2Field.cs:41-42`. 색온도는 쓰지 않고(`RM1_Slice.unity:4314`), 그림자 해상도는 -1(파이프라인 값, `:4277`).

### 3.3 보스방 (Stage.InArena) 라이트

| 위치 | 내용 |
|---|---|
| `NativeGame.HellArenaLighting.cs:45` | 이전 보스방 라이트를 Destroy함 |
| `NativeGame.HellArenaLighting.cs:48-51` | "보스방 국소광" Point 3개: range 7, intensity 9 / 7 / 3, color (1, 0.6, 0.3) ×2와 (0.55, 0.68, 0.85). 보스(`FindBoss()`)가 있을 때만 생성 |
| `NativeGame.HellArenaLighting.cs:39` | 3번째 라이트를 플레이어 위치로 옮기고 `_HellArenaLight0..2` 전역 셰이더 값을 설정함 |

### 3.4 파이프라인 그림자와 라이트 설정

| 항목 | URP_PC_High | URP_Mac_Balanced | 위치 (PC / Mac) |
|---|---|---|---|
| MainLightRenderingMode | 1 (PerPixel) | — | `URP_PC_High.asset:44` |
| 메인 라이트 그림자 지원 | 1 | 1 | :45 / :45 |
| 메인 라이트 섀도맵 해상도 | 2048 | 1024 | :46 / :46 |
| AdditionalLightsRenderingMode | 1 (PerPixel) | 1 | :47 / :47 |
| AdditionalLightsPerObjectLimit | 8 | 6 | :48 / :48 |
| 추가 라이트 그림자 지원 | 1 | 0 | :49 / :49 |
| 추가 라이트 섀도 아틀라스 | 4096 (티어 256 / 512 / 1024) | 2048 | :50-53 / :50 |
| ShadowDistance | 45 | 32 | :57 / :57 |
| ShadowCascadeCount | 3 | 2 | :58 / :58 |
| Cascade2Split / 3Split / 4Split | 0.25 / (0.1, 0.3) / (0.067, 0.2, 0.467) | 같음 | :59-61 / :59-61 |
| CascadeBorder | 0.2 | — | `URP_PC_High.asset:62` |
| ShadowDepthBias / NormalBias | 1 / 1 | 1 / 1 | :63-64 / :63-64 |
| SoftShadowsSupported | 1 | 1 | :66 / :66 |
| SoftShadowQuality | 2 (Medium) | 2 | :69 / :69 |
| SupportsLightLayers | 0 | — | `URP_PC_High.asset:76` |
| MixedLightingSupported | 1 | — | `URP_PC_High.asset:74` |
| ShadowTransparentReceive (렌더러) | 1 | — | `URP_PC_High_Renderer.asset:97` |

QualitySettings Ultra 레벨의 내장 파이프라인용 필드: pixelLightCount 4, shadows 2, shadowResolution 2, shadowCascades 4, shadowDistance 150, antiAliasing 4, realtimeReflectionProbes 1 (`unity/ProjectSettings/QualitySettings.asset:276-293`). URP를 쓸 때는 그림자·AA 값을 파이프라인 에셋에서 읽음(Unity 동작). [확인 불가: 런타임에 QualitySettings 값이 어떻게 해석되는지는 실행해 봐야 확인할 수 있음]

### 3.5 환경 조명 / RenderSettings

씬 값 (`RM1_Slice.unity`):

| 항목 | 값 | 위치 |
|---|---|---|
| m_Fog | 1 | :17 |
| m_FogColor | (0.165, 0.102, 0.086) | :18 |
| m_FogMode | 3 (ExponentialSquared) | :19 |
| m_FogDensity | 0.018 | :20 |
| LinearFogStart / End | 0 / 300 | :21-22 |
| m_AmbientSkyColor | (0.19, 0.12, 0.11) | :23 |
| m_AmbientEquatorColor | (0.12, 0.075, 0.07) | :24 |
| m_AmbientGroundColor | (0.05, 0.03, 0.03) | :25 |
| m_AmbientIntensity | 1 | :26 |
| m_AmbientMode | 1 (Trilight) | :27 |
| m_SkyboxMaterial | builtin fileID 10304 | :29 |
| m_DefaultReflectionMode | 0 (Skybox) | :35 |
| m_DefaultReflectionResolution | 128 | :36 |
| m_ReflectionBounces | 1 | :37 |
| m_ReflectionIntensity | 1 | :38 |
| m_CustomReflection | none | :39 |
| LightmapSettings EnableBaked / Realtime | 1 / 0 | :53-54 |
| m_EnvironmentLightingMode | 0 | :52 |

GraphicsSettings의 포그 스트리핑: m_FogStripping 1, KeepLinear 1, KeepExp 1, KeepExp2 1 (`unity/ProjectSettings/GraphicsSettings.asset:56, 66-68`).

런타임 RenderSettings 대입 (실행 순서):

| # | 위치 | 대입 | 조건 |
|---|---|---|---|
| 1 | `NativeGame.HellLighting.cs:18-20` | 씬 값을 hellOld*에 저장 (읽기만 함) | baseline 아님 |
| 2 | `NativeGame.A2Field.cs:88` → `NativeGame.A2Forest.cs:150-154` `A2Ambient()` | ambientMode Trilight, sky (0.26, 0.28, 0.30), equator (0.20, 0.19, 0.16), ground (0.075, 0.065, 0.05) | A2 경로. 이어서 #3이 덮어씀 |
| 3 | `NativeGame.HellLighting.cs:84-87` `HellLightingActive(true)` | ambientMode Trilight, sky (0.18, 0.20, 0.24), equator (0.09, 0.115, 0.15), ground (0.04, 0.045, 0.055), fog true, fogMode ExponentialSquared, fogColor (0.035, 0.065, 0.085), fogDensity 0.023, fogStart/End는 저장값 (0 / 300) | `Remodel3DSetActive(true)` 시점이고 `hellActorMaterial!=null`일 때 (`NativeGame.Remodel3D.cs:164`) |
| 4 | `NativeGame.HellLighting.cs:88-92` | `A2Ambient()`를 다시 호출해 #2 값으로 되돌림. fogColor (0.105, 0.145, 0.17), fogMode Linear, fogStart 19, fogEnd 62 | `on && A2Requested` |
| 5 | `NativeGame.HellLighting.cs:84-87` `HellLightingActive(false)` | 저장한 씬 값으로 복원함. 단 `fog = on \|\| hellOldFogOn`이고 start/end는 저장값 | 보스방 진입 등으로 3D 필드가 꺼질 때 |
| 6 | `NativeGraphicsOptions.cs:91-92` | 옵션 fog가 off이면 `RenderSettings.fog=false`, on으로 돌아오면 복원 | 옵션 값에 따름 |

**기본 실행(`--remodel3d`) 필드의 최종 값**: ambientMode Trilight, sky (0.26, 0.28, 0.30), equator (0.20, 0.19, 0.16), ground (0.075, 0.065, 0.05); fog on, Linear 19–62, color (0.105, 0.145, 0.17), density 0.023 (Linear 모드에서는 쓰이지 않음). `ambientIntensity`, `reflectionIntensity`, 반사 소스는 범위 안 파일에서 런타임 대입이 없으므로 씬 값(1 / 1 / Skybox)이 유지됨.

참고: 레거시 함수 `NativeGame.A2Forest.cs:139-140`의 ReflectionProbe(intensity 0.55)는 호출처가 없어 실행되지 않음.

### 3.6 추가 라이트 (Point/Spot) 개수

| 구분 | 개수 | 출처 | 루프·데이터 의존 여부 |
|---|---|---|---|
| 씬 Point | 7 (Pool_*) | §3.1 | 고정. A2 경로에서 7개 모두 `enabled=false` (`NativeGame.A2Field.cs:44`) |
| 런타임 Point (영웅 림광) | 1 | `NativeGame.HellLighting.cs:58-59` | 고정 |
| 런타임 Spot (영웅 달빛) | 1 | `NativeGame.HellLighting.cs:60-61` | 고정 |
| 런타임 Point (A2 횃불) | 7 | `NativeGame.A2Field.cs:191` (2개), `:192-193` (5개 루프) → `A2Forest.cs:164` | 하드코딩 좌표 7개. 리소스 null 검사에 따라 달라짐 (`A2Forest.cs:157`). `--a2-clean`이면 꺼짐 |
| 보스방 Point | 3 | `NativeGame.HellArenaLighting.cs:48-51` | 하드코딩 3개. 보스 존재 여부에 따름. 3D 필드가 꺼진 보스방 상태에서만 |
| 필드 기본 실행에서 활성인 추가 라이트 합계 | 9 (Point 8 + Spot 1) | 위 3행의 합 | 리소스가 모두 있고 `--a2-clean`이 없을 때 |

범위 밖 파일에도 런타임에 라이트를 만드는 코드가 있음(존재만 기록하며, 1-1 경로에서 활성인지는 추적하지 않았음):
- `unity/Assets/Exoduser/Runtime/NativeHeroView.cs:27-31`: Point 2개, "Hero neutral fill" 6 / 5와 "Hero cool edge" 1.6 / 4. 생성 조건은 `NativeGame.cs:238`의 `(!NativeHd2D.Enabled || RigPixelRequested)`.
- `unity/Assets/Exoduser/Runtime/Vfx/NativeImpactView.cs:53`: 충격 버스트마다 Point 1개, shadows None. 개수는 bursts 배열에 따라 정해짐.
- `unity/Assets/Exoduser/Runtime/Vfx/NativeSkillRemaster.cs:176`: 스킬 핸들마다 Point 1개, shadows None.
- `unity/Assets/Exoduser/Runtime/NativeGame.GroundReceiverCapture.cs:92`: "QA Sun" Directional (QA 캡처용).
- [확인 불가: 위 범위 밖 라이트가 1-1 필드 동시 활성 수에 얼마나 더해지는지는 실행 데이터가 필요함]

A2에서 로드하는 모델 리소스: `Resources/Art/map` 아래 fbx 가운데 `importLights: 1`인 것은 keyshot 9종이며, 모두 바이너리에서 "Light" 문자열 0건. `Resources` 아래 prefab은 1개이고 Light(!u!108)는 0개 (git show 기준).


## 4. 요약

**같은 값 묶음:**
- URP Lit 마스크형 RF3 재질 10개(보임 694): `_Smoothness 1`, `_Metallic 1`, `_OcclusionStrength 0.6`, `_BaseColor` 흰색이 같다. 마스크 R(메탈릭)은 10개 모두 0이다.
  - 실효 스무스니스(UV 안 마스크 A, §5): 10개 모두 0.078~0.157 상수이거나 p95 0.196 이하다. 고목 A·B는 0.098 상수다. 처음 보고한 "고목 평균 0.401, p95 1.0"은 텍스처 전체 값이었고, 1.0은 UV 섬 밖 여백에만 있다(정정).
- A2_Loft 3개(보임 63): `_Smoothness 0.18`, `_Metallic 0`, 마스크 없음.
- 셰이더 고정 공식 재질: 지면·뿌리·전경 목질이 같은 공식을 공유하고 실효 0.16~0.25다. 이끼는 0.15 상수, 수면은 0.78/0.22다.
- 메탈릭은 보이는 재질 전부에서 실효 0이다.

**노멀 없는 재질:** 4개 — A2_Hanging_Moss_Lit(보임 73), A2ToxicRiver, A2Atmosphere, A2HeightFog. HD2D, 스프라이트, 접촉 그림자는 세지 않았다.

**후처리 최종값(기본 실행):** ACES, Bloom 1.1/0.16/0.48, 노출 0.55, 대비 16, 채도 −8, Vignette 0.13/0.65, SplitToning 추가.

**주광:** 3.2, Soft, 2048, 45m, 캐스케이드 3. 환경광은 Trilight, 포그는 Linear 19–62다. 필드의 추가 광원은 9개다.

## 5. 보충: UV 섬 안쪽의 실효 메탈릭·스무스니스 (CTO 요청, 11-06)

**방법:**
- FBX 바이너리에서 `LayerElementUV`(UV, UVIndex)와 `PolygonVertexIndex`를 직접 읽었다. Blender나 Unity는 쓰지 않았다.
- UV 다각형을 1024²로 칠해 "UV 안" 마스크를 만들고, MetallicSmoothness 텍스처를 같은 크기로 최근접 샘플링해 겹쳤다.
- 스크립트: 세션 scratchpad의 `mat-audit/uvlib.py`, `uvall.py`, `mipbleed.py`.

### 5.1 10개 재질 (UV 안쪽)

| 재질 (텍스처) | UV 면 수 | UV 점유율 | 마스크 R(메탈릭) 평균 / p95 / R>0 비율 | 마스크 A(스무스니스) 평균 [p5, p95] / 최대 | UV 밖 A 평균 |
|---|---|---|---|---|---|
| RF3_Ancient_Tree_A | 19,888 | 0.636 | 0 / 0 / 0 | 0.098 [0.098, 0.098] / 0.098 | 0.932 |
| RF3_Ancient_Tree_B | 19,888 | 0.636 | 0 / 0 / 0 | 0.098 [0.098, 0.098] / 0.098 | 0.932 |
| RF3_Dead_Leaf_Litter | 384 | 0.766 | 0 / 0 / 0 | 0.078 상수 | 0.078 |
| RF3_Fallen_Log | 22,265 | 0.042 [UV가 0~1 밖으로 반복되는지 확인 안 함] | 0 / 0 / 0 | 0.156 [0.157, 0.157] | 0.157 |
| RF3_Fungal_Colony | 1,620 | 0.451 | 0 / 0 / 0 | 0.098 상수 | 0.127 |
| RF3_Moss_Cushion (Atlas_moss_01) | 332 | 0.171 | 0 / 0 / 0 | 0.098 상수 | 0.098 |
| RF3_Bridge_Torch_Holder | 928 | 0.374 | 0 / 0 / 0 | 0.125 [0.043, 0.196] / 0.196 | 0.180 |
| RF3_Rotten_Wood_Bridge | 7,286 | 0.124 | 0 / 0 / 0 | 0.083 [0.020, 0.129] / 0.196 | 0.164 |
| RF3_Withered_Shrub (Atlas_shrub_03) | 33,148 | 0.331 | 0 / 0 / 0 | 0.098 상수 | 0.098 |
| RF3_Hanging_Moss (Atlas_moss_01) | 11,200 | 0.171 | 0 / 0 / 0 | 0.098 상수 | 0.098 |

① **실효 메탈릭:** 10개 모두 마스크 R이 전 픽셀 0이다(텍스처 전체도 0). `_Metallic 1` 아래에서 금속으로 계산되는 픽셀은 0%다 [URP는 `_METALLICSPECGLOSSMAP`일 때 마스크 R을 메탈릭으로 씀. 이 저장소 코드로는 확인하지 않음].

② **고목 A·B의 A=1.0 위치:** UV 섬 안에서 A≥0.9인 픽셀은 0이다(0.0%). UV 밖 여백의 91.8%가 A≥0.9이고, 여백 평균은 0.932다. 그래서 몸통·이끼·뿌리 어느 부위에도 1.0은 없다. UV 안은 전부 0.098 상수다.
- 정정: §1.1에서 처음 보고한 고목 "평균 0.401, p95 1.0"은 여백이 섞인 텍스처 전체 값이었다.

### 5.2 고목 마스크 A의 밉 번짐 (계산값)

`.meta`에는 `enableMipMap 1`, `borderMipMap 0`이 있고, `mipmapFilter` 줄은 meta에서 찾지 못했다. 그래서 박스 필터(2×2 평균)를 가정해 밉을 만들고, UV 안 텍셀이 각 밉에서 읽는 A를 계산했다. A·B 결과는 같다.

| 밉 | 크기 | UV 안 A 평균 | p95 | A≥0.3 비율 |
|---|---|---|---|---|
| 0~3 | 4096~512 | 0.098 | 0.098 | 0 |
| 4 | 256 | 0.102 | 0.098 | 0.009 |
| 5 | 128 | 0.117 | 0.233 | 0.039 |
| 6 | 64 | 0.153 | 0.501 | 0.113 |
| 7 | 32 | 0.207 | 0.589 | 0.222 |
| 8 | 16 | 0.280 | 0.615 | 0.393 |

- 1-1 카메라에서 고목이 어느 밉을 읽는지는 [확인 불가: 화면 텍셀 밀도 실측 필요]이다.
- Unity의 실제 밉 필터와 압축(DXT5/BC7)이 이 값을 얼마나 바꾸는지도 확인하지 않았다.
- 고목에는 MPB `_BumpScale .9`, `_OcclusionStrength .9`가 걸린다(`NativeGame.A2Forest.cs:249`). 스무스니스 값은 바꾸지 않는다.

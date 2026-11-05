# WebGL PC 빌드 — 2026-11-05

## 2회차 스크립트

S1은 에디터 빌드 스크립트 준비 작업이다. Unity 실행·WebGL 빌드·브라우저 측정은 이 작업에서 하지 않는다. 빌드 시간, 패키지 용량, FPS, 브라우저 메모리 등 실측값은 작성하지 않는다. 사용자가 별도로 실행한 뒤 채운다.

- 작업 브랜치: codex/unity-pc-webgl-slim2-20261105
- 기준: 72e104989a184c58ec27dcde37bc1674ec37a71e
- 가져온 스크립트·에디터 메타 원본: origin/claude/unity-pc-devtools-web-20261028 @4af345fc5a1cf375607ace2807177a635e206f86
- 새로 가져온 .meta는 Editor/DevTools/WebBuild.meta와 Editor/DevTools/WebBuild/WebBuild.cs.meta다. 상위 Editor/DevTools.meta는 최초 S1 커밋 983de25704에서 옛 브랜치 GUID로 바뀌었으나, CTO 보정에 따라 72e104989의 기존 GUID a123889795cecbc468a5a6e96eea33be와 파일 바이트를 새 커밋으로 복원했다. 하위 새 메타와 코드·런타임 자산 .meta는 이번 보정에서 변경하지 않았다.
- 구현 파일: unity/Assets/Exoduser/Editor/DevTools/WebBuild/WebBuild.cs
- 보존 파일: unity/Assets/link.xml
- 템플릿 지정 PlayerSettings.WebGL.template = "PROJECT:Exoduser"는 제거한다. Exoduser WebGL 템플릿 자산은 가져오지 않는다.
- 이 문서의 219개는 기준 Git 트리에서 센 **정적 이미지 파일 수**다. 임포트·빌드 결과의 텍스처 수나 압축 효과 실측값이 아니다.

### 실행 범위와 기존 경로

새 정책은 **-slim2 true**일 때만 적용한다. 이 인자가 없으면 기존 기본 Run 및 -slim 경로를 유지한다. -slim2와 -slim이 함께 주어지면 2회차 정책을 한 번만 적용하며 이전 텍스처 정책을 중복 실행하지 않는다.

기존 영상 후처리·-videoDir·-keepVideos, -holdCjk를 통한 CJK 글꼴 제외/복원, -receipt, -probeOut, 그래픽 API·압축 인자와 종료 코드는 유지한다. 글꼴 이동/복원은 기존 동작이며 새로운 런타임 자산 이동 정책을 추가하지 않는다. 텍스처·오디오 설정은 빌드/Probe를 호출할 때 WebGL 플랫폼 override에만 기록하며, 이 제출에는 그 결과로 바뀌는 런타임 자산 .meta를 포함하지 않는다.

| 인자 | 2회차 의미 |
|---|---|
| -slim2 true | Assets/ 전체 Texture2D 및 AudioClip 대상 정책·보고 적용 |
| -unaligned true | 비4배수 텍스처에 비크런치 DXT5를 요청하는 실험. 실제 형식이 압축이라고 가정하지 않음 |
| -probeOut 경로 | 전체 텍스처 CSV. 오디오·비압축 유지/진단 CSV도 인접 경로에 저장 |
| -receipt 경로 | 기존 빌드 영수증에 분류별 override 건수와 관련 CSV 경로 추가 |
| -webAudio aac-inmemory | 사용자가 명시할 때만 1초 초과 AAC 품질0.5·CompressedInMemory 대체 정책 선택. 기본값은 보류 |
| -webAudio keep | 길이와 무관하게 모든 오디오 설정을 보존하고 보류 사유를 보고 |

오디오 인자는 아래 WebGL 지원 제약 때문에 별도 선택으로 둔 것이다. 원래 요청의 Vorbis+Streaming을 성공한 것으로 기록하지 않는다.

### 분류와 크기·밉맵 정책

분류 우선순위는 크기 의존 보호 경로/시트·아틀라스 → 확정 메시 재질·단일 UI 원화 → 미분류다. importer의 Multiple sprite, 이름의 atlas/sheet/glyph/flipbook, SpriteAtlas의 의존성·packable 폴더에 포함된 텍스처도 크기 유지 대상으로 보호한다. 모델·프리팹의 MeshRenderer/SkinnedMeshRenderer 재질 슬롯이 실제 참조하는 Texture2D만 메시 용도 근거에 추가하며, 임의의 .mat나 Resources 밖이라는 사실만으로 메시 재질로 분류하지 않는다. UI와 메시 용도가 동시에 확인되면 미분류로 남긴다.

| 분류 | 경로·타입 근거 | 최대 크기 | 목표 밉맵 | 이번 구현의 공통 설정 처리 |
|---|---|---:|---|---|
| 시트·아틀라스/고정 픽셀 원화 | 아래 보호 상수, Multiple sprite, SpriteAtlas 참조 | 유지 | 끔 | 현재 값 유지, 목표와 차이 기록 |
| 확정 메시 재질 | 아래 메시 경로 또는 실행 시 확인되는 실제 참조 | 1024 | 켬 | 현재 값 유지, 목표와 차이 기록 |
| UI 단일 원화 | 보호 경로를 제외하고 단일 원화로 확인되는 UI 경로 | 2048 | 끔 | 현재 값 유지, 목표와 차이 기록 |
| 미분류 | 경로/사용처로 단일 용도를 확정하지 못함 | 유지 | 미결정 | 현재 값 유지 |
| 노멀맵 | 기존 TextureImporterType.NormalMap 우선 | 용도 분류를 따름 | 용도 분류를 따름 | 공통 타입·sRGB·readable 변경 없음 |
| 단일 채널 마스크 | 기존 SingleChannel 타입 또는 아래 .r 소비가 확인된 정확 경로 | 용도 분류를 따름 | 용도 분류를 따름 | 공통 타입·sRGB·readable 변경 없음 |

**밉맵 제약:** TextureImporter.mipmapEnabled는 공통 importer 설정이고 TextureImporterPlatformSettings에는 대응 필드가 없다. 따라서 “WebGL 플랫폼 override만 기록” 조건과 “메시는 밉맵 켬/UI는 끔을 강제”를 동시에 새로 수행할 수 없다. 공통값 변경 허용에 대한 사용자 답변 전에는 기존값을 보존하고 불일치 항목을 CSV에 남긴다. SourceTextureImporter.cs:23,35,39,42–43도 재임포트 시 공통 밉맵을 설정한다. 이 파일은 수정하지 않는다.

확정 메시 경로(공통 접두사 Assets/Exoduser/Resources/Art/):

- map/a2/ground/: NativeGame.A2Forest.cs:41–48의 _ForestMap/_ForestNormal/_ForestRough, _Soil*, _Root* 연결.
- map/hell_lighting/rock_ground_Diffuse.jpg, burned_ground_01_Diffuse.jpg, rock_ground_nor_gl.jpg, rock_ground_Rough.jpg: NativeGame.HellGround.cs:20–22의 메시 PBR 연결.
- 같은 폴더의 torch_flame.png는 4×2 시트이므로 보호 규칙을 먼저 적용한다.

UI 후보 경로는 Art/ui/, Art/CharacterSelect/, Art/Loading/, Art/FullscreenWide/, Art/Startup/, Art/skill_icons/이다. 경로에 있다는 이유만으로 시트를 단일 UI로 축소하지 않는다. 보호·atlas 조건과 분류 모호성을 먼저 검사한다. 경로 기준으로 표현하지 못한 항목은 **미분류**로 남기고 크기를 유지한다.

단일 채널의 확정 사례는 map/hell_lighting/rock_ground_Rough.jpg다. NativeGame.HellGround.cs:21이 _RockRough로 연결하고 HellGroundPBR.shader:85 및 A2RootSurface.shader:90이 .r만 읽는다. 파일 이름에 mask/rough가 있다는 이유만으로 packed RGB/RGBA 텍스처를 BC4로 바꾸지 않는다. TitleSignboard/A/motion-mask의 sRGB=false만으로도 단일 채널이라고 단정하지 않는다.

### 크기 유지 제외 경로 25규칙

기준 72e104989에서 **접두사 8개 + 정확 파일 17개 = 25규칙**, 대상 tracked 이미지 219개다. 이후 새 파일이 추가되면 prefix에 포함되는 개수는 달라질 수 있다. 이것은 최대 크기 축소를 막는 목록이며, 압축 형식·CPU readback의 안전성을 별도로 보증하는 목록은 아니다.

자산 공통 접두사: Assets/Exoduser/Resources/Art/. 근거 소스 공통 접두사: unity/Assets/Exoduser/Runtime/. JSON 근거만 unity/Assets/Exoduser/Resources/ 기준이다.

| 종류 | 경로/접두사 | 정적 이미지 수 | 근거 파일:줄 | 유지 이유 |
|---|---|---:|---|---|
| 접두사 | player/ | 10 | NativeGame.cs:38,446–447,534 | 48px 방향 셀·80px 공격 셀; 폴더 내 dash-flight도 보수 유지 |
| 접두사 | enemy/ | 17 | NativeGame.cs:471–472,534; NativeGame.FieldBoss.cs:26–28 | 256px 셀·walk 1024px stride·앵글러4×2 |
| 접두사 | boss/dark_druid/ | 7 | NativeDruidArt.cs:12,38–49,67–76 | 시트 분할·픽셀 inset |
| 접두사 | vfx/ | 79 | NativeGame.cs:117–135; NativeSkillView.cs:42–48; NativeSkillView.Malice.cs:89–97; Vfx/CombatImpactView.cs:95–102; NativeGame.WorldDrops.cs:78–83 | 시트 다수. 단일 VFX도 섞여 있어 전체 보수 유지 |
| 접두사 | map/production_finish/ | 64 | NativeGame.cs:110,407,534; Resources/Data/ch1_map.json:1 | chunk_0_0~chunk_7_7의 고정 sx/sy/sw/sh |
| 접두사 | ui/boss/ | 3 | NativeBossBar.cs:80,139,218–220,248–249 | 이름·상태 glyph atlas |
| 접두사 | ui/silver_hell/btn_thorn_ | 20 | NativeLobby.SilverHell.cs:168–176 | 174px source edge와 선택된 밀도 연결 |
| 접두사 | ui/silver_hell/btn_chip_ | 2 | NativeLobby.SilverHell.cs:190–193 | 1x/2x 고정8px×density slice |
| 정확 파일 | map/hell_lighting/torch_flame.png | 1 | NativeGame.HellLighting.cs:62–63 | 4×2 시트 |
| 정확 파일 | lobby/varkan_idle.png | 1 | NativeLobby.cs:38–39,314 | 8×12,96프레임 |
| 정확 파일 | ui/area/area_atlas.png | 1 | NativeAreaTitle.cs:24–25,57,80 | JSON glyph 픽셀 좌표 |
| 정확 파일 | ui/death/death_atlas.png | 1 | NativeDeathOverlay.cs:44–47,71,119 | JSON glyph 픽셀 좌표 |
| 정확 파일 | ui/clear/clear_atlas.png | 1 | NativeStageClearOverlay.cs:48–49,88,133,138 | JSON atlas 픽셀 좌표 |
| 정확 파일 | ui/overlay/levelup_label.png | 1 | NativeLevelUpOverlay.cs:26,44,83 | 이름에 atlas가 없는 glyph atlas |
| 정확 파일 | ui/forge/forge_glyphs.png | 1 | NativeForgePanel.cs:39–40,56,107–111 | 잠재 atlas, 보수 유지. 현재 Spr/Adv/GlyphW는0 반환 |
| 정확 파일 | ui/keybind/keybind_glyphs.png | 1 | NativeKeyBindList.cs:23,52,83,164 | glyph atlas |
| 정확 파일 | CharacterSelect/generated/presentation_ring_atlas.png | 1 | NativeLobby.CharacterPresentation.cs:50,199 | 5×2 atlas |
| 정확 파일 | CharacterSelect/generated/trait_glyphs.png | 1 | NativeLobby.CharacterPresentation.cs:52,201 | 5×4 atlas |
| 정확 파일 | ui/inventory/rail.png | 1 | NativeInventoryWebLayout.cs:17,55–66 | 고정 source slice |
| 정확 파일 | ui/inventory/window_frame.png | 1 | NativeInventoryWebLayout.cs:17,55–66 | 같은 Rail helper |
| 정확 파일 | ui/silver_hell/panel_frame_20261029.png | 1 | NativeLobby.SilverHell.cs:103,112 | 150px slice |
| 정확 파일 | ui/silver_hell/btn_plaque_20261029.png | 1 | NativeLobby.SilverHell.cs:116–117,168 | 174px slice |
| 정확 파일 | ui/silver_hell/btn_primary_composed.png | 1 | NativeLobby.SilverHell.cs:168,182 | 같은174px source edge |
| 정확 파일 | ui/ui_bar_only.png | 1 | NativeHud.cs:40,125–131 | ±2px 글리프 제거 팽창 |
| 정확 파일 | ui/region_arrow.png | 1 | NativeRegionHud.cs:113,309–311,349–350 | 18px pad/blur 원본 픽셀 의존 |

브리프가 적은 NativeGame.cs:341의 “Invalid source sprite rect”는 이 기준 SHA에서 **534행**이다. ki_slash_silver_sheet는 117–118행의 3×3/3의 배수 검사, ki_slash_hit_silver_sheet는 122행의 **1254×1254** 검사와 135행의 **627px** 셀 때문에 크기를 유지한다.

NativeDruidArt.cs:71,97,135, NativeHud.cs:122, NativeInventoryWebLayout.cs:162, NativeRegionHud.cs:310에는 CPU 픽셀 읽기 경로도 있다. 공통 isReadable을 보존하며, 압축 후 이 코드들이 실제로 작동하는지는 사용자 빌드에서 확인해야 한다. 크기 유지가 CPU 압축 읽기 호환까지 의미하지 않는다.

크기 유지 25규칙과 별도로 **Crunch 제외 1경로**를 둔다. ui/silver_hell/gate_sigil_loading_embers.png는 NativeScreenTransition.cs:52,54에서 GetPixelBilinear로 읽는다. Unity API가 Crunch 텍스처에 이 읽기를 지원하지 않으므로 WebBuild.cs의 NoCrunchPaths는 4배수일 때 비크런치 DXT5를 요청한다. 비4배수이면 공통 비4배수 정책을 먼저 적용한다. 이 파일은 크기 유지 25규칙의 개수에 더하지 않는다.

### 압축 규칙과 거부 처리

| 입력 | WebGL 요청 | 유의점 |
|---|---|---|
| 색·UI, 폭/높이가4배수 | 알파 있으면 DXT5Crunched, 없으면 DXT1Crunched, 품질50 | 공통 sRGB·readable 변경 없음. NoCrunchPaths는 비크런치 DXT5 |
| 비4배수 기본 | 알파 있으면 비압축 RGBA32, 없으면 RGB24 | 크기 cap은 용도 분류를 따름. 공통 NPOT 설정을 바꾸지 않고 실제 크기·형식을 보고 |
| 비4배수 + -unaligned true | DXT5, crunchedCompression=false | 요청 실험. 실제 format/크기를 따로 기록; 패딩·임의 리사이즈 안 함 |
| NormalMap | BC5 우선, API가 허용할 때 DXT5nm 대체 | 기존 NormalMap 타입 유지. 단순 색 텍스처에 DXT5nm 추정 적용 안 함 |
| 단일 채널 마스크 | BC4 | 실제 단일 채널 근거가 있는 대상만 |

TextureImporter.IsPlatformTextureFormatValid(type, BuildTarget.WebGL, format)로 요청 포맷을 검증한다. 플랫폼이 거부한 조합은 ignorePlatformSupport로 우회하지 않고, 기존 override를 유지하며 거부 이유를 기록한다. 이 API는 형식/타입/플랫폼 검사이지 크기·브라우저 확장 지원 검사가 아니다.

Unity 6000.6 공식 표에서 BC4·BC5는 Web Desktop 지원, Web Mobile 미지원으로 구분된다. 비4배수 DXT5는 공식 기술 글에서 비압축 유지 가능성을 명시하므로, setter에 DXT5를 기록했다는 이유만으로 실제 GPU 형식을 DXT5로 보고하지 않는다.

4배수 여부는 임포트 후 축소된 w/h가 아닌 GetSourceTextureWidthAndHeight의 원본 폭/높이로 판정한다. 원본 크기를 확인하지 못하거나 16384를 넘으면 변경을 건너뛰고 진단한다. 크기 보호 대상의 maxTextureSize는 원본을 수용하는 cap으로 두며, 공통 NPOT/후처리 때문에 실제 크기가 달라지면 size-preserve-mismatch를 보고한다. 실제 크기 유지까지 검증됐다는 뜻은 아니다.

### 오디오: 요청과 지원 범위

**원래 요청 Vorbis 품질0.5 + Streaming은 Unity 6000.6 WebGL 지원과 맞지 않는다.** UnityCsReference의 WebGL 허용 포맷 분기는 AAC만 반환한다. 공식 WebGL 문서는 compressed load type으로 CompressedInMemory와 DecompressOnLoad를 안내한다.

- 1초 초과: 사용자 대체 허용 전에는 변경 보류 및 진단 기록. 자동으로 Vorbis/Streaming을 쓴 뒤 성공 처리하지 않는다.
- -webAudio aac-inmemory를 명시하면 AAC 품질0.5 + CompressedInMemory를 선택하는 대체 경로다.
- -webAudio keep을 명시하면 1초 이하도 포함해 전부 보존한다.
- 1초 이하: 별도 keep이 없으면 WebGL의 AAC 포맷에서 DecompressOnLoad를 지정한다. 현재 quality는 보존하고 플랫폼 설정만 다룬다.
- SetOverrideSampleSettings("WebGL", settings)의 bool 반환과 GetOverrideSampleSettings readback을 확인한다. 반환 true도 실제 브라우저 디코딩·스트리밍 성공을 뜻하지 않는다.
- 공통 defaultSampleSettings 및 PC/Mac 플랫폼 override는 바꾸지 않는다.

질문으로 남긴 사항: ① 공통 밉맵을 빌드 중 임시 변경하고 복원해도 되는지, ② 1초 초과 AAC0.5+CompressedInMemory 대체를 허용하는지. 답변 전 기본은 공통 밉맵 보존·장음 오디오 보류다.

### 보고서와 영수증

대상은 Resources 안에 한정하지 않고 **Assets/ 아래 전체 Texture2D**다. CSV 문자열의 쉼표·따옴표·줄바꿈은 Csv helper가 escape한다. -probeOut을 probe.csv로 주면 같은 폴더에 아래 네 파일을 쓴다. Run에서 -probeOut을 생략하면 텍스처 CSV는 outDir + ".textures.csv"가 된다. -slim2 true Probe는 -probeOut이 필수다.

| 파일 | 실제 열 | 값의 의미 |
|---|---|---|
| probe.csv | path,w,h,format,memBytes,분류,resources안밖,sRGB,mipmap,sourceW,sourceH,requestedFormat,status,reason | w/h/format은 로드한 Texture2D, memBytes는 Profiler.GetRuntimeMemorySizeLong. sourceW/H와 요청 형식을 따로 표시. resources안밖은 inside/outside |
| probe.audio.csv | path,길이,포맷,loadType,크기,sourceFileBytes,requestedFormat,requestedLoadType,quality,requestedQuality,status | 길이·loadType은 로드한 AudioClip, 포맷·quality는 WebGL importer 설정(없으면 default). 크기는 런타임 메모리, sourceFileBytes는 원본 파일 바이트. 요청과 readback을 구분 |
| probe.uncompressed.csv | path,w,h,requestedFormat,actualFormat,reason | 재임포트 뒤 실제 graphicsFormat이 비압축인 모든 텍스처. 비4배수 목록뿐 아니라 기존/거부로 비압축이 남은 대상도 포함 |
| probe.diagnostics.csv | path,kind,reason,expected,actual | 포맷 거부, 공통 밉맵 불일치, 원본 크기 미확인, 크기 유지 불일치, 오디오 보류/거부 |

Audio CSV의 포맷은 **importer 설정값이며 실제 WebGL 패키지 인코딩 코덱을 측정한 값이 아니다.** 크기와 sourceFileBytes도 패키지에 포함된 오디오 바이트가 아니다. 텍스처 memBytes와 영수증의 기존 빌드 bytes 역시 서로 다른 범위다.

영수증은 기존 결과·오류·bytes·영상 후처리·API·압축·engine·topAssets를 유지하고 slim2 객체에 분류별 텍스처/오디오 override 건수, texturesSkipped·audioDeferred·mipmapMismatches·actualUncompressed, 네 CSV 경로, 밉맵·장음 정책을 추가한다. Probe에도 같은 slim2 객체를 넣는다. 이번 제출에는 실제 CSV나 영수증 측정값을 생성하지 않는다.

### PhysicsModule 보존

unity/Assets/link.xml은 UnityEngine.PhysicsModule의 preserve="all" 한 assembly 항목만 추가한다. 기존 linker 항목이 있다면 그대로 두고 이 항목만 추가한다. 사용자가 확인한 “Can't add component because class 'MeshCollider' doesn't exist!” 재현 확인을 위한 보존이며, 오류가 해결됐다고 판단하지 않는다.

**이 link.xml은 이 작업 브랜치 전용이다. WebGL 조건문이 아니므로 이 브랜치에서 만드는 PC·Mac 빌드에도 적용된다.** MeshCollider 한 타입만 보존하는 것보다 범위가 넓으며 물리 모듈 stripping·용량에 영향을 줄 수 있다. unity/main·main에 병합하지 않는다.

### API와 코드 근거

- [Unity 6000.6 텍스처 포맷 지원표](https://docs.unity3d.com/6000.6/Documentation/Manual/texture-formats-reference.html)
- [TextureImporterPlatformSettings](https://docs.unity3d.com/6000.6/Documentation/ScriptReference/TextureImporterPlatformSettings.html)
- [Unity 공식 텍스처 최적화 글 — 비4배수·Crunch](https://discussions.unity.com/t/optimising-unity-texture-import-settings/1631377)
- [WebGL 오디오](https://docs.unity3d.com/6000.6/Documentation/Manual/webgl-audio.html)
- [UnityCsReference 6000.6 AAC 전용 분기](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6/Modules/AssetPipelineEditor/ImportSettings/AudioImporterInspector.cs#L244)
- [SetOverrideSampleSettings](https://docs.unity3d.com/6000.6/Documentation/ScriptReference/AudioImporter.SetOverrideSampleSettings.html)
- [GetPixelBilinear — Crunch 읽기 제한](https://docs.unity3d.com/6000.6/Documentation/ScriptReference/Texture2D.GetPixelBilinear.html)
- 설치된 UnityEditor.xml: GetSourceTextureWidthAndHeight 73864–73870행, IsPlatformTextureFormatValid 73881–73889행, 공통 mipmapEnabled 73608행, audio override 반환 7961–7988행.
- SourceTextureImporter.cs:23,35,39,42–43은 공통 밉맵, 26–35는 기존 노멀맵 분류 근거다. 이 후처리기는 WebGL override의 Set/Clear를 하지 않는다.

| 구현 항목 | WebBuild.cs 근거 |
|---|---|
| Probe의 -slim2 분기·영수증 | 77–96, 특히83–87 |
| Run의 -slim2 분기·기존 -slim 분리 | 523–537; CJK복원549; 기존 영상 처리551–564 |
| 크기 보호 25규칙·Crunch 제외1경로 | 131–149 |
| UI·메시·단일 채널 경로 근거 | 150–159 |
| Assets 전체 검색·SpriteAtlas 보호·실제 메시 참조·분류 | 186–258 |
| 원본 크기 판정·비4배수·BC5/DXT5nm·BC4·NoCrunch | 272–319 |
| WebGL 형식 검증·공통 밉맵 보존·override readback | 320–346 |
| 오디오 모드·보류·AAC 대체·readback | 349–401 |
| 전체 Texture CSV·실제 비압축 목록·크기 유지 진단 | 403–435 |
| Audio CSV 요청/설정 분리·메모리/원본 크기 | 437–455, 특히445–452 |
| CSV 경로·실패 시 진단 저장 | 462–482; Run 기본 경로527 |
| 분류별 영수증 구조·Run 영수증 추가 | 161–170,572 |

PhysicsModule 보존의 근거는 unity/Assets/link.xml:2다. 두 신규 Editor 메타의 GUID는 4af345fc5, 기존 DevTools.meta의 GUID는 72e104989를 따르며 각 .meta 2행이다. 위 코드 줄은 이 S1 제출의 WebBuild.cs를 기준으로 한다.

### 검증 범위

오프라인 컴파일은 설치된 **Unity 6000.6.7f1**의 dotnet과 Roslyn csc(8.0.318), 실제 Editor/Engine/framework 참조 DLL 296개로 수행했다. Unity WebGL Editor의 기존 응답 파일 참조 목록을 사용하고 C#9, UNITY_EDITOR·UNITY_WEBGL 조건에서 WebBuild.cs를 컴파일했다. Unity 에디터는 실행하지 않았다.

- 최종 컴파일: **exit0, 오류0, 경고0**. 첫 시도에서 object 선택 매개변수의 문자열 기본값 때문에 CS1763 오류2건이 났으며, 기본값을 null로 고친 두 번째 시도에서 통과했다. 실제 컴파일 실패는1회다.
- 컴파일한 소스 SHA-256: d48fae47af939ee6a74d87da831fac589ecfbd5ce4fd38147139617da9756155.
- Node 정적 검증: **13/13 통과**. 원본4af345fc5의 legacy ApplyWebTextures, CJK hold/restore, Run 기본·영상·기존 영수증 경로를 비교했다. 요청된 템플릿 제거·보고 범위 확대와 gated slim2 추가를 제외한 기존 경로는 같았다.
- 최초 정적 검증에서 공통 importer 필드 대입0, 보호 규칙8접두사+17정확경로, 기준 Git 이미지219개 존재, Editor 메타3개 원본 바이트 일치, link.xml PhysicsModule1항목을 확인했다. 후속 GUID 보정에서는 DevTools.meta가 72e104989와 바이트 일치하고 하위 신규 메타2개·WebBuild.cs가 983de25704와 무변경임을 확인했다. 코드 변경이 없어 오프라인 컴파일·Unity 실행은 다시 하지 않았다.

컴파일은 Unity API의 형식·호출 서명을 확인한 것이다. AssetDatabase 임포트 실행, 플랫폼 포맷 validator 결과, 재임포트 후 크기·형식·CPU readback, WebGL 빌드, MeshCollider 오류 재현·해결, 브라우저 코덱·메모리·성능·용량은 **미확인**이다. Unity 실행·실제 빌드·Importer 측정은0회이며, 측정값을 미리 채우지 않았다. 공통 밉맵 변경 허용 및 장음 AAC 대체 허용에 대한 사용자 판단도 남아 있다.

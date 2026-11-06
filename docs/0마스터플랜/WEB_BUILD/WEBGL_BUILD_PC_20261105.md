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
- 2026-11-05 프로브(1288f5258, 빌드 없음, 영수증 I:/EXODUSER-Storage/debug/webgl-20261105/audio-probe/receipt.json audioAttempts): 154개 전부 BuildTargetGroup.WebGL·"WebGL"·"Web" 세 경로 모두 SetOverrideSampleSettings set=False. 플랫폼 문자열 원인 추정은 기각. 다음 시험은 S3 뒤에 Vorbis 요청 1회만, defaultSampleSettings 임시 변경은 불허.
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

## 3회차 스크립트(S2)

기준은 S1 GUID 보정 완료 커밋 a8663c2b4bce878b4e7fb67c81bacc8c348cfee5이며 같은 codex/unity-pc-webgl-slim2-20261105 브랜치에서 이어간다. 기존 S1 절은 당시 제출·검증 기록으로 보존한다. S2는 에디터 빌드 준비와 오프라인 검증만 하며 Unity 실행·WebGL 재빌드·런타임 코드 변경·원본 자산 삭제는 하지 않는다.

### 2회차 입력 증거와 크기 단위

- CTO 제공 2회차 결과: **data.br 약687MB**. 정확한 바이트·MB/MiB 구분은 이번 보고에서 새로 측정하지 않았다.
- 영수증: E:/exoduser-wt/webgl-build-slim2-receipt.json. result=Succeeded, errors=0, bytes=963,427,532, engine=6000.6.7f1, textureOverrides=1057, audioOverrides=0, audioDeferred=154. bytes는 기존 스크립트의 BuildReport.summary.totalSize이며 data.br 크기와 동일한 값이 아니다.
- CSV: I:/EXODUSER-Storage/debug/webgl-20261105/slim2/의 textures.csv, textures.uncompressed.csv, textures.audio.csv, textures.diagnostics.csv. 아래 memBytes는 이 CSV의 RuntimeMemorySizeLong이며 원본 파일 크기·GPU 전용 메모리·압축 패키지 크기가 아니다.
- 오디오154개(1초 초과106개·이하48개)가 모두 AudioImporter rejected WebGL override를 기록했다. 원본 오디오 sourceFileBytes 합138,564,147B와 CSV 메모리 합312,393,150B도 패키지 감소 예측치로 사용하지 않는다.

### 오디오 플랫폼 원인 조사와 채택 기록

**문자열이 원인이라는 CTO 가설은 미확정이다.** S1에서 SetOverrideSampleSettings("WebGL", settings)가 false를 반환했다는 관측만으로 native 플랫폼 이름 파싱과 설정 거부를 구분할 수 없다. Unity를 실행하지 않고 확인한 범위는 정확한 UnityCsReference 6000.6.7f1 태그(commit d0e5e3e00a4f454bc2853234708c3d7c67ebca9a)의 관리 코드다.

| 근거 | 확인 사실 | S2 의미 |
|---|---|---|
| [AudioImporter.bindings.cs:64–106](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6.7f1/Modules/AssetPipelineEditor/Public/AudioImporter.bindings.cs#L64) | Contains/Get/Set에 public BuildTargetGroup 오버로드가 있음 | 문자열 파싱을 생략하는 그룹 경로를 우선 확인할 근거 |
| [같은 파일:119–140](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6.7f1/Modules/AssetPipelineEditor/Public/AudioImporter.bindings.cs#L119) | 그룹 Clear도 public. 문자열 경로는 GetBuildTargetGroupByName 후 그룹명으로 정규화 | 문자열을 "Web"로 바꾸면 해결된다고 단정하지 않음 |
| [AudioImporterInspector.cs:113–129](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6.7f1/Modules/AssetPipelineEditor/ImportSettings/AudioImporterInspector.cs#L113) | Unity Inspector가 그룹 오버로드로 Set/Clear 실행 | 공식 에디터 경로와 일치하는 선택 |
| [NamedBuildTarget.cs:55](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6.7f1/Editor/Mono/BuildPipeline/NamedBuildTarget.cs#L55) | NamedBuildTarget.WebGL.TargetName은 "WebGL" | S1과 같은 문자열이므로 교체만으로 해결 근거가 되지 않음 |
| [BuildPipeline.bindings.cs:68,80,957](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6.7f1/Editor/Mono/BuildPipeline/BuildPipeline.bindings.cs#L957) | 그룹명/역파싱 함수는 internal. GetBuildTargetName은 public이지만 target 이름 | internal API나 반사 우회 없이 진단 후보만 구성 |
| [AudioImporterInspector.cs:270–274](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6.7f1/Modules/AssetPipelineEditor/ImportSettings/AudioImporterInspector.cs#L270) 및 [Audio in Web](https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/develop/audio) | Web 허용 코덱은 AAC이며 문서의 loadType은 CompressedInMemory/DecompressOnLoad | 요청 코덱·로드 방식 자체는 문서와 맞음. 실제 임포트 성공은 빌드 담당 확인 |

후보 순서는 **BuildTargetGroup.WebGL public 오버로드 → GetBuildTargetName(BuildTarget.WebGL) 반환 문자열 → "WebGL" → "Web"**이며 같은 문자열은 중복 시도하지 않는다. "Web"는 마지막 진단 후보이고 공식 정답으로 확인된 이름이 아니다. Set 반환 true만으로 채택하지 않고 SaveAndReimport 후 새 importer의 그룹 Contains/Get에서 format·loadType·quality까지 확인한다. 거부·예외·readback 불일치는 후보별로 기록하고 원래 그룹 override를 복원한 뒤 다음 후보로 넘어간다. 복원 검증 실패는 중단 사유다.

그룹 API가 성공한 경우 영수증의 selector는 BuildTargetGroup.WebGL이고 **native 내부 문자열은 미확인**이다. 문자열 API가 성공하면 실제 전달 문자열을 기록한다. 이를 플랫폼 문자열이 바뀌어 문제가 해결됐다는 증명으로 확대하지 않는다. AAC 장음은 기존처럼 -webAudio aac-inmemory 명시 때만 적용한다.

### 비4배수 큰 원화와 -resize4 허용 범위

#### 집계 기준

| 기준 | 개수 | memBytes 합 |
|---|---:|---:|
| actualRGBA32_all | 365 | 2,060,036,103 |
| actualRGBA32_actual_dimensions_unaligned | 287 | 1,720,979,574 |
| actualRGBA32_source_dimensions_unaligned | 287 | 1,720,979,574 |
| requestedDXT5_actualRGBA32 | 288 | 1,746,082,431 |
| all_actual_dimensions_unaligned | 293 | 1,762,946,161 |

CTO 365개/2,060MB는 **전체 actual RGBA32**와 일치한다. 비4배수 RGBA32만은287개/1,720,979,574B다. 비4배수 requested DXT5 실패라고365개 전부를 적으면 안 된다. 요청DXT5→RGBA32는288개이며 그중1개는크기가4배수다.

#### 비4배수 RGBA32 큰20개

기준: actual w/h 중 하나가4배수 아님. memBytes 내림차순, 동률은경로정렬. sourceW/H도 병기한다.

| 순위 | 경로 | actual w×h | source w×h | memBytes | width/height/Sprite 의존 및 조치 | 근거 파일:줄 |
|---|---|---|---|---:|---|---|
| 1 | Assets/Exoduser/Remodel/CH1_1/Materials/Ground/ch1_1_r1r2_colormap_wide.png | 4260×3031 | 4260×3031 | 140,879,794 | 미확인—직접 코드 크기 의존은 발견 못 함, 직렬화 머티리얼/장면 경로 미감사; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:19,115-116 |
| 2 | Assets/Exoduser/Resources/Art/ui/death/cin_remember_wide.png | 1931×814 | 1931×814 | 18,604,301 | 미확인—주석만 직접 일치; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeDeathOverlay.cs:9,69-78 |
| 3 | Assets/Exoduser/Resources/Art/ui/inventory/crystals/crystals_base.png | 1836×858 | 1836×858 | 18,165,889 | 고정 Rect의 전체 UV 표시; 픽셀 크기/부분 Sprite 계약 없음; 리사이즈 허용 | unity/Assets/Exoduser/Runtime/NativeInventoryCrystals.cs:23,29; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178 |
| 4 | Assets/Exoduser/Resources/Art/ui/inventory/iron.png | 1254×1254 | 1254×1254 | 17,560,793 | 직접 width 의존 없음, 실제 소비 불명확; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:12,23,27; unity/Assets/Exoduser/Runtime/NativeInventoryDock.cs:281 |
| 5 | Assets/Exoduser/Resources/Art/ui/inventory/items/armor_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 6 | Assets/Exoduser/Resources/Art/ui/inventory/items/axe_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 7 | Assets/Exoduser/Resources/Art/ui/inventory/items/belt_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 8 | Assets/Exoduser/Resources/Art/ui/inventory/items/boots_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 9 | Assets/Exoduser/Resources/Art/ui/inventory/items/bracelet_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 10 | Assets/Exoduser/Resources/Art/ui/inventory/items/cape_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 11 | Assets/Exoduser/Resources/Art/ui/inventory/items/crossbow_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 12 | Assets/Exoduser/Resources/Art/ui/inventory/items/earring_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 13 | Assets/Exoduser/Resources/Art/ui/inventory/items/gloves_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 14 | Assets/Exoduser/Resources/Art/ui/inventory/items/helmet_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 15 | Assets/Exoduser/Resources/Art/ui/inventory/items/necklace_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 16 | Assets/Exoduser/Resources/Art/ui/inventory/items/pants_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 17 | Assets/Exoduser/Resources/Art/ui/inventory/items/shield_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 18 | Assets/Exoduser/Resources/Art/ui/inventory/items/sword_cutout.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—동적 아이템 fallback + 전체 texture Sprite rect/PPU; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeInventory.cs:36-55; unity/Assets/Exoduser/Runtime/NativeGame.WorldDrops.cs:26-32 |
| 19 | Assets/Exoduser/Resources/Art/ui/skill/roll_boots.png | 1254×1254 | 1254×1254 | 17,560,793 | 있음—ScaleToFit의 texture 종횡비; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeSkills.cs:193,218,221,243; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:174-175 |
| 20 | Assets/Exoduser/Resources/Art/ui/ui_bar_only.png | 2460×546 | 2460×546 | 16,796,981 | 있음—width/height 및 CPU 픽셀 가공; 보수 제외 | unity/Assets/Exoduser/Runtime/NativeHud.cs:40,117-132 |

#### 좁은 허용리스트11개

모두 단일 PNG·textureType 0·spriteMode 0·spriteBorder 0이다. 전체 UV를 고정 Rect에 StretchToFill하는 경로만 선정했다. 원본은 모두 2048 이하이며, 구현은 최대 크기 안에서 각 변을 가장 가까운 4배수로 반올림한다(중간값은 큰 쪽). 아래 목표 크기는 해당 함수의 계산값이며 Unity 재임포트 결과가 아니다. 이 11개에서는 감사 당시 ceil4 제안값과 결과가 같다.

| 경로 | 원본 | 계산 목표 4배수 | memBytes | 소비 근거 및 판정 |
|---|---|---|---:|---|
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/crystals_base.png | 1836×858 | 1836×860 | 18,165,889 | 고정 Rect(42,182,1836,858), StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryCrystals.cs:23,29; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/crystals/crystals_base.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_empty.png | 570×582 | 572×584 | 4,392,241 | 고정 Rect190×194, empty/item 선택만 동적, StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryCrystals.cs:24,53; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_empty.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_item.png | 570×582 | 572×584 | 4,391,217 | 고정 Rect190×194, empty/item 선택만 동적, StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryCrystals.cs:23,53; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_item.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/center_frame_baked.png | 220×250 | 220×252 | 687,729 | 고정 Rect220×250, 기본 StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryOssuary.cs:36,184; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/ossuary/center_frame_baked.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/portrait_baked.png | 720×958 | 720×960 | 8,004,685 | 고정 Rect360×479, StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryOssuary.cs:37,230; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/ossuary/portrait_baked.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_arms_dim.png | 51×51 | 52×52 | 39,624 | boneParts 네 이름만 동적; 고정 Rect51×51, 기본 StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryOssuary.cs:17,20,38,192; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_arms_dim.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_legs_dim.png | 51×51 | 52×52 | 39,624 | boneParts 네 이름만 동적; 고정 Rect51×51, 기본 StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryOssuary.cs:17,20,38,192; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_legs_dim.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_skull_dim.png | 51×51 | 52×52 | 39,624 | boneParts 네 이름만 동적; 고정 Rect51×51, 기본 StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryOssuary.cs:17,20,38,192; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_skull_dim.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_torso_dim.png | 51×51 | 52×52 | 39,624 | boneParts 네 이름만 동적; 고정 Rect51×51, 기본 StretchToFill; unity/Assets/Exoduser/Runtime/NativeInventoryOssuary.cs:17,20,38,192; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_torso_dim.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/skill/altar_lmb_clean.png | 1154×671 | 1156×672 | 9,698,581 | equipped 상태로 ring 선택; 고정1154×671*UIscale, StretchToFill; unity/Assets/Exoduser/Runtime/NativeSkills.cs:72,78,271; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/skill/altar_lmb_clean.png.meta:46,52,59 |
| Assets/Exoduser/Resources/Art/ui/skill/altar_none_clean.png | 1154×671 | 1156×672 | 9,698,581 | equipped 상태로 ring 선택; 고정1154×671*UIscale, StretchToFill; unity/Assets/Exoduser/Runtime/NativeSkills.cs:72,78,271; unity/Assets/Exoduser/Runtime/NativeUiAudit.cs:172-178; unity/Assets/Exoduser/Resources/Art/ui/skill/altar_none_clean.png.meta:46,52,59 |

합계 memBytes 55,197,419B. 압축/패키지 감소량 예측치가 아니다.

#### 추적 범위와 제외 근거

- exact resource path와 변수 소비를 Runtime 전체/Data JSON에서 검색. exact resource key and variable uses, Resources.LoadAll, Resources.Load<Texture2D>(nonliteral), width, height, Sprite.Create, GetPixel/GetPixels/ReadPixels, DrawTextureWithTexCoords, ScaleToFit/ScaleAndCrop, TextureImporter textureType/spriteMode/spriteBorder, Data JSON full resource paths.
- 아이템 cutout은 NativeInventory.cs:49–51 dynamic fallback → :55 IconTexture → NativeGame.WorldDrops.cs:26–32 전체Sprite 생성 경로라 보수 제외. JSON에만 나오는 아이콘도같은경로.
- roll_boots는 NativeSkills.cs:193,218,221,243에서ScaleToFit, NativeUiAudit.cs:174–175에서텍스처종횡비로계산하므로제외.
- ui_bar_only는 NativeHud.cs:117–132의RT·ReadPixels·CPU마스크에width/height가실제로쓰이므로제외.
- ossuary/urn_lit_baked는NativeInventoryOssuary.cs:185에서ossUrn.width/height로화면Rect를정하므로제외.
- crystals portrait는이미1020×1688(4배수)라resize대상이아님.
- colormap_wide는Runtime의직접파일명검색불일치만으로안전판정하지않는다. NativeGame.Remodel3D.cs:19,115–116의RM1_Slice직렬화장면경로가있고그소비계약이불확실해제외.
- cin_remember_wide는NativeDeathOverlay.cs:9옛설명주석만직접일치. 현재Init:69–78은다른텍스처로드. 활성소비가확정되지않아제외.
- inventory/iron은NativeInventory.cs:23에서로드하지만현재사용은iron320/iron480(:NativeInventoryDock.cs:281 등). 활성표시연결이불명확해허용리스트에서제외.
- 공통NativeUiAudit.cs:174는aspect를읽지만StretchToFill에서는:175–176의aspect분기를쓰지않는다. 따라서“width/height문자열읽기0”가아니라“원본픽셀크기를전제하는표시·크롭계약없음”이라는의미다. 일반감사알파샘플러의크기읽기도원본크기상수를요구하지않는다.

#### 미확인

- 리사이즈·재임포트후DXT5/Crunch적용,시각차이,빌드data.br감소량은빌드담당확인.
- memBytes는제공CSV의RuntimeMemorySizeLong이며원본파일크기/GPU전용메모리/Brotli크기가아니다.
- 특정패널의데모노출여부와리사이즈안전성은별개. 참조가있는리소스는demoFilter에서따로빼면안된다.


### -resize4 true의 임시 변경·복원

허용 목록은 위11개 단일PNG로 제한한다. 새로 발견한 파일을 이름이나 폴더만으로 자동 확대하지 않는다. 실행 시에도 단일 Texture2D, 시트/아틀라스 제외, 원본 크기와 importer 타입을 재확인한다. 원본의 픽셀 크기를 계약으로 쓰는 경로와 미분류는 제외한다.

`-resize4 true`는 `-slim2 true`와 함께 써야 한다. 실행 직전에 Runtime의 모든 C#과 Resources의 모든 JSON을 경로순으로 정렬하고 UTF-8/BOM·CRLF를 정규화한 SHA-256을 감사 기준과 비교한다. 기준과 다르면 리사이즈와 필터 전체를 건너뛰고 진단·영수증에 차이를 기록한다. 대상 파일도 감사 당시 원본 w/h, Default Texture2D·sprite None·border 0·NPOT None·UI 단일 원화 분류인지 다시 확인한다. 조건을 만족하지 않으면 그대로 둔다.

원본 PNG는 메모리에서 디코드하고 CPU에서 premultiplied-alpha bilinear로 보간한다. 각 변은 `maxSize` 이하의 가장 가까운 4배수로 정하며 최소 4px, 정확한 중간값은 큰 쪽으로 반올림한다. 투명 픽셀의 RGB가 가장자리에 번지는 것을 줄이도록 알파를 곱해 보간한 뒤 다시 나눈다. TextureImporter의 공통 필드와 원본 .meta 설정을 크기 조정 목적으로 바꾸지 않는다. 임시 PNG를 같은 Assets 경로에 기록하기 **전에** 원본과 .meta를 `Library/WebBuildS2Hold`에 보존하고, 동기 재임포트 후 actual w/h가 목표와 같은지 확인한다. 이후 WebGL 오버라이드를 적용하고 성공·실패 모두 finally에서 원본 바이트와 .meta를 복원한다. Unity 임포트·화면 차이는 이번에 실행하지 않았으므로 미확인이다.

### -demoFilter true의 경로별 감사

기준은 origin/claude/unity-cloud-license-audit-20261105 @e3fd69f10의 docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md §4 “실제 사용” 표와 현재 S1 최종 트리의 Resources.Load·JSON·직렬화 GUID 참조다. “제출 화면에서 숨김”과 “코드 경로상 로드 불가”를 같게 취급하지 않는다. 현재 참조가 있거나 동적 로드가 가능하면 제외하지 않고 유지 사유와 null 위험을 기록한다.

#### 필터 감사 요약

| 구분 | 정확 파일 수 | 원본 바이트 | 패키지 감소 해석 |
|---|---:|---:|---|
| 조건부 제외 허용 목록 | 81 | 282,937,176 | 실제 이동 수는 빌드 시 검사·영수증으로 확정 |
| 비Resources 후보 | 79 | 280,877,217 | 이미 FirstPlayable 의존 밖이므로 추가 packed 감소0B 추정 |
| Resources 미참조 후보 | 2 | 2,059,959 | 기존 CSV memBytes 합11,038,874B. data.br 감소는 미확인 |
| 참조 또는 불확실성으로 보존 | 76 | 164,559,987 | 제외하지 않음 |

후보 .meta 합77,791B는 위 원본 바이트에 포함하지 않는다. 원본 자산과 같은 GUID의 .meta를 함께 이동·복원한다. **282.94MB를 data.br 감소량으로 보고하면 안 된다.** 추가 패키지 감소와 관련 있는 Resources2개는 약1.965MiB의 원본 파일·10.528MiB의 CSV 메모리이며 Brotli 감소로 환산하지 않는다.

현재 빌드는 FirstPlayable 단일 씬이다. 비Resources79개 GUID의 Assets/ProjectSettings 전체 검색1286줄 중 자기 .meta79줄을 제외한 직렬화1207줄은 후보 묶음 또는 미포함 RM_Sandbox 씬 내부뿐이었다. 외부 GUID 참조0은 현재 SHA의 텍스트 감사 결과이며 Unity AssetDatabase 검증이 아니다. 실제 빌드 직전에 씬의 재귀 GetDependencies에 잡히는 후보는 보존해야 한다.

RM1_Terrain.asset는 Runtime에서 RM1을 로드할 수 있으므로 보존한다. RM3와 Sandbox Terrain은 현재 비포함 씬만 참조해 조건부 후보로 둔다. 외국어 폰트·숨김 패널·타클래스 선택 화면·필드 앵글러는 살아 있는 로드 경로 때문에 유지한다. `-demoFilter true`이면 S1의 기존 CJK hold를 자동으로 끄고 참조 있는 ja/zh/zht/th/ar 폰트를 모두 유지한다. `-demoFilter`가 꺼져 있을 때만 기존 `-holdCjk` 기본 동작을 유지한다. 참조 있는 폰트를 다시 포함하므로 2회차보다 전체 패키지가 작아진다고 보장할 수 없다.

#### 경로별 근거와 null 위험

아래 F번호는 바로 이어지는81개 제외 후보·76개 보존 경로 각각에 연결되는 근거다. 코드 줄은 **a8663c2b4bce878b4e7fb67c81bacc8c348cfee5** 기준이고 LC 줄은 e3fd69f10 기준이다. S2 코드의 새 줄번호와 혼동하지 않는다.

| ID | 분류·파일 수 | 판단 사유 | 근거 파일:줄 | 제거 시 null 위험·조건 |
|---|---|---|---|---|
| F01 | 전사 외 3D 캐릭터 20개 | 비Resources Ivan/Silvertail 파일. GUID 검색에서 이 후보군 밖 참조 0; Runtime load 문자열 없음. | unity/Assets/Exoduser/Editor/DevTools/WebBuild/WebBuild.cs:19; unity/Assets/Exoduser/Editor/DevTools/WebBuild/WebBuild.cs:543; unity/ProjectSettings/EditorBuildSettings.asset:9; e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:238 | 현재 FirstPlayable 의존 없음. 차후 프리팹/씬/AssetBundle 경로가 추가되면 모델·재질 누락 위험; BuildPlayer 씬 의존 검사에서 발견 시 보존. |
| F02 | 1-1 외 맵 58개 | 비Resources CH1_2/3/4. 직렬화 참조는 이 묶음 내부뿐, Runtime은 RM1만 로드. | unity/Assets/Exoduser/Editor/DevTools/WebBuild/WebBuild.cs:19; unity/Assets/Exoduser/Editor/DevTools/WebBuild/WebBuild.cs:543; unity/ProjectSettings/EditorBuildSettings.asset:9; unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:19; unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:115; unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:116; e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:238 | 비포함 RM3 씬을 나중에 실행하면 지형·오브젝트 누락. scene/dependency 조건이 바뀌면 필터 중단/보존. |
| F03 | Sandbox Terrain 1개 | Sandbox 씬 직렬화 참조만 있고 현재 빌드 씬/Runtime 로드 경로 없음. | unity/Assets/Exoduser/Editor/DevTools/WebBuild/WebBuild.cs:19; unity/Assets/Exoduser/Editor/DevTools/WebBuild/WebBuild.cs:543; unity/ProjectSettings/EditorBuildSettings.asset:9; unity/Assets/Exoduser/Scenes/RM_Sandbox.unity:1486; unity/Assets/Exoduser/Scenes/RM_Sandbox.unity:1497 | Sandbox 씬이 빌드에 추가되면 지형/충돌 누락. scene/dependency guard 필수. |
| F04 | 전사 외 2D 캐릭터 미참조 1개 | 필드 초상화는 minimap_warrior 리터럴로 고정. 해당 경로/이름/GUID의 Runtime·Data·serialized 사용 없음. | unity/Assets/Exoduser/Runtime/NativeFieldHud.cs:27 | 현재 코드에서 null 경로 없음; 이후 클래스별 초상 동적 로드가 생기면 보존 필요. |
| F05 | 전사 외 과거 타이틀 원화 1개 | 실제 타이틀은 C2 고정. A manifest는 제작 출처 기록이며 Runtime 소비/해당 PNG GUID 참조 없음. | unity/Assets/Exoduser/Runtime/NativeTitleSignboard.cs:8; unity/Assets/Exoduser/Runtime/NativeTitleSignboard.cs:31; unity/Assets/Exoduser/Resources/Art/TitleSignboard/A/manifest.json:22 | 현재 C2 경로는 영향 없음. A 타이틀로 회귀하거나 manifest 소비가 추가되면 보존 필요. |
| F06 | RM1 Terrain 1개 | RM1 scene 직렬화 참조 + Runtime RM1 동적 로드 가능. 1-1 데모 지형. | unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:19; unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:115; unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs:116; unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity:12064; unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity:12075 | 지형·충돌/진행 불능 위험. 현재 씬 목록과 무관하게 요청 규칙상 보존. |
| F07 | en/ko 외 폰트·Arabic 설정 9개 | ja/zh/zht/th/ar Resources.Load 및 fallback table이 남아 있음. en/ko UI라고 해도 글로벌 fallback 초기화가 로드 가능. | unity/Assets/Exoduser/Runtime/NativeLobby.cs:95; unity/Assets/Exoduser/Runtime/NativeLobby.cs:104; unity/Assets/Exoduser/Runtime/NativeLobby.SilverHell.cs:50; unity/Assets/Exoduser/Runtime/NativeA15SettingsLabels.cs:29; unity/Assets/Exoduser/Runtime/NativeA15SettingsLabels.cs:96; unity/Assets/Exoduser/Runtime/NativeArabicCaptionOverlay.cs:23; e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:232 | 대체폰트/문자 tofu/Arabic 텍스트 또는 패널 누락. 런타임 언어 경로 차단 변경 없이 제거 금지. |
| F08 | 숨김 대장간 전용 원화 2개 | NativeForgePanel.Init에서 로드하고 Draw/Open 경로가 살아 있음. | unity/Assets/Exoduser/Runtime/NativeForgePanel.cs:56; unity/Assets/Exoduser/Runtime/NativeForgePanel.cs:116; unity/Assets/Exoduser/Runtime/NativeGame.cs:575; unity/Assets/Exoduser/Runtime/NativeGame.cs:655 | 패널 배경/글리프 누락. 숨김 제출판 조건만으로 코드 로드 가능성을 제거할 수 없음. |
| F09 | 숨김 유골함 전용 원화 10개 | 인벤토리 UI 첫 초기화에서 InitOssuary/InitCrystals/InitStorage 동시 호출. | unity/Assets/Exoduser/Runtime/NativeInventoryDock.cs:34; unity/Assets/Exoduser/Runtime/NativeInventoryOssuary.cs:36; unity/Assets/Exoduser/Runtime/NativeInventory.cs:27 | Load가 null이면 InvalidOperationException. 다른 인벤토리 페이지까지 열기 실패 가능. |
| F10 | 숨김 보관함 전용 원화 17개 | 인벤토리 UI 첫 초기화에서 InitOssuary/InitCrystals/InitStorage 동시 호출. | unity/Assets/Exoduser/Runtime/NativeInventoryDock.cs:34; unity/Assets/Exoduser/Runtime/NativeInventoryStorage.cs:17; unity/Assets/Exoduser/Runtime/NativeInventory.cs:27 | Load가 null이면 InvalidOperationException. 다른 인벤토리 페이지까지 열기 실패 가능. |
| F11 | 숨김 유물/크리스탈 전용 원화 5개 | 인벤토리 UI 첫 초기화에서 InitOssuary/InitCrystals/InitStorage 동시 호출. | unity/Assets/Exoduser/Runtime/NativeInventoryDock.cs:34; unity/Assets/Exoduser/Runtime/NativeInventoryCrystals.cs:23; unity/Assets/Exoduser/Runtime/NativeInventory.cs:27 | Load가 null이면 InvalidOperationException. 다른 인벤토리 페이지까지 열기 실패 가능. |
| F12 | 전사 외 캐릭터 선택 원화 15개 | 잠긴 클래스도 5개 배열에서 초상·포스터·컷아웃을 로드. | unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs:22; unity/Assets/Exoduser/Runtime/NativeLobby.CharacterPresentation.cs:54; unity/Assets/Exoduser/Runtime/NativeLobby.CharacterPresentation.cs:56; unity/Assets/Exoduser/Runtime/NativeLobby.CharacterPresentation.cs:59 | 선택화면 미리보기/잠긴 클래스 초상·와이드 연출 누락. 플레이 가능 캐릭터만 기준으로 제거 금지. |
| F13 | 전사 외 잠금 엠블럼 4개 | 선택화면은 warrior 외 4개도 disabled emblem 동적 로드. | unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs:25; unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs:27 | 잠긴 클래스 표시 원화 누락. |
| F14 | 전사 외 구형 엠블럼 1개 | 제작 JSON destination/source에 경로가 있음. 현재 loader는 disabled 엠블럼이지만 이 감사에서 제작 데이터의 모든 소비 경로를 확정하지 않았으므로 보수적으로 유지. | unity/Assets/Exoduser/Resources/Data/character_presentation_media_20261025.json:54; unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs:27; e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:231 | 실사용 여부 추가 조사 필요. JSON 존재만으로 runtime load로 단정하지 않음. |
| F15 | 전사 외 구형 엠블럼 1개 | 제작 JSON destination/source에 경로가 있음. 현재 loader는 disabled 엠블럼이지만 이 감사에서 제작 데이터의 모든 소비 경로를 확정하지 않았으므로 보수적으로 유지. | unity/Assets/Exoduser/Resources/Data/character_presentation_media_20261025.json:47; unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs:27; e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:231 | 실사용 여부 추가 조사 필요. JSON 존재만으로 runtime load로 단정하지 않음. |
| F16 | 전사 외 구형 엠블럼 1개 | 제작 JSON destination/source에 경로가 있음. 현재 loader는 disabled 엠블럼이지만 이 감사에서 제작 데이터의 모든 소비 경로를 확정하지 않았으므로 보수적으로 유지. | unity/Assets/Exoduser/Resources/Data/character_presentation_media_20261025.json:68; unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs:27; e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:231 | 실사용 여부 추가 조사 필요. JSON 존재만으로 runtime load로 단정하지 않음. |
| F17 | 전사 외 구형 엠블럼 1개 | 제작 JSON destination/source에 경로가 있음. 현재 loader는 disabled 엠블럼이지만 이 감사에서 제작 데이터의 모든 소비 경로를 확정하지 않았으므로 보수적으로 유지. | unity/Assets/Exoduser/Resources/Data/character_presentation_media_20261025.json:61; unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs:27; e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:231 | 실사용 여부 추가 조사 필요. JSON 존재만으로 runtime load로 단정하지 않음. |
| F18 | 전사 외 와이드 원화 1개 | fullscreen_wide row 59 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1610; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F19 | 전사 외 와이드 원화 1개 | fullscreen_wide row 59 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1619; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F20 | 전사 외 와이드 원화 1개 | fullscreen_wide row 60 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1637; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F21 | 전사 외 와이드 원화 1개 | fullscreen_wide row 60 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1646; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F22 | 전사 외 와이드 원화 1개 | fullscreen_wide row 61 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1664; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F23 | 전사 외 와이드 원화 1개 | fullscreen_wide row 61 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1673; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F24 | 전사 외 와이드 원화 1개 | fullscreen_wide row 62 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1691; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F25 | 전사 외 와이드 원화 1개 | fullscreen_wide row 62 JSON outputs가 와이드 창에서 Resources.Load 대상. | unity/Assets/Exoduser/Resources/Data/fullscreen_wide.json:1700; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:15; unity/Assets/Exoduser/Runtime/NativeFullscreenArtwork.cs:23 | 해당 클래스 원화는 로드 가능; 와이드 연출 유실. 원본 fallback 존재가 제거 승인은 아님. |
| F26 | 드루이드 외 필드보스 1개 | 1-1 fieldboss 경로에서 로드. 드루이드 외라는 이유만으로 1-1 적 원화 제외 불가. | unity/Assets/Exoduser/Runtime/NativeGame.FieldBoss.cs:26 | 텍스처 null이면 표시 객체 생성이 빠져 보이지 않는 필드보스 위험. |

#### 정확 제외 후보81개

경로는 Unity 프로젝트 기준 Assets/...이다. 아래 목록은 허용 목록이며, 해당 파일 존재·씬/자원 의존 검사에서 조건을 벗어나면 실제 이동하지 않는다. 코드 파일·폴더 .meta·원본 삭제는 대상이 아니다.

| 경로 | 원본 바이트 | 근거·null 위험 | Resources 여부 |
|---|---:|---|---|
| Assets/Exoduser/Art/Characters/Ivan/Ivan_BaseColor.png | 5,341,533 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Ivan_MetallicSmoothness.png | 1,051,567 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Ivan_Normal.png | 6,742,020 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Ivan_Rigged.fbx | 18,440,908 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Ivan_Run.fbx | 18,453,404 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Ivan_Walk.fbx | 18,461,452 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun.fbx | 13,702,188 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun_BaseColor.png | 4,924,356 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun_MetallicSmoothness.png | 1,718,717 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Ivan/Weapon/Ivan_Gun_Normal.png | 4,928,373 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Silvertail_BaseColor.png | 5,604,696 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Silvertail_MetallicSmoothness.png | 361,166 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Normal.png | 6,446,779 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Rigged.fbx | 18,477,772 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Run.fbx | 18,490,220 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Silvertail_Walk.fbx | 18,498,236 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger.fbx | 14,153,404 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger_BaseColor.png | 5,708,350 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger_MetallicSmoothness.png | 1,403,853 | F01 | 밖 |
| Assets/Exoduser/Art/Characters/Silvertail/Weapon/Silvertail_Dagger_Normal.png | 5,039,560 | F01 | 밖 |
| Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_core_compare.json | 11,171 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_plan_check.json | 4,459 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_receipt.json | 10,633 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_rooms.json | 6,825 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_spawns.json | 21,294 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_2/Data/ch1_2_walk.json | 85,403 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_2/Data/rm2_build.json | 16,243 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_blocked_islands.json | 19,085 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_reach.json | 346,846 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_rooms.json | 2,873 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_source_receipt.json | 1,741 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_spawns.json | 5,311 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/ch1_3_walk.json | 68,698 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/rm3_camera_occlusion.json | 306 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/rm3_hero_layer.json | 51 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/rm3_islands.json | 6,285 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/rm3_navmesh_diff.json | 287 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Data/rm3_walk_overlap.json | 134 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood.asset | 26,012 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood_cracked.asset | 13,058 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood_drag.asset | 26,888 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_blood_drops.asset | 29,477 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_bone.asset | 7,004 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_bone_ribs.asset | 6,577 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_bone_skull.asset | 7,014 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_root.asset | 29,034 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_root_branch.asset | 11,766 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Decals_root_tangle.asset | 17,812 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/NavWalk.asset | 9,330,349 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Pool_1.asset | 5,711 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/Pool_2.asset | 5,711 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/R3_Shaft_Hell_01.asset | 3,806 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/R3_Shaft_Hell_02.asset | 3,794 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/R3_Shaft_Hell_03.asset | 3,806 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/RM3_NavMesh.asset | 83,136 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/RM3_Terrain.asset | 3,574,848 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/River_E.asset | 21,732 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/River_W.asset | 23,558 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/SporePit_1.asset | 5,713 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/SporePit_2.asset | 5,713 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/TL_Floor1.terrainlayer | 754 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/TL_Floor2.terrainlayer | 754 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Generated/TL_Floor3.terrainlayer | 754 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Materials/M_EyeBone.mat | 3,920 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Materials/M_EyePupil.mat | 3,917 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Materials/M_MushCapDark.mat | 4,105 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Materials/M_MushCapWarm.mat | 4,102 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Materials/M_MushStem.mat | 4,105 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/Materials/M_VoidDark.mat | 3,908 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_3/RM3_Slice.unity | 77,005,954 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_build.json | 61,255 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_core_compare.json | 33,043 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_plan.json | 34,632 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_reach.json | 352,086 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_receipt.json | 2,074 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_rooms.json | 3,616 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_spawns.json | 5,294 | F02 | 밖 |
| Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_walk.json | 111,926 | F02 | 밖 |
| Assets/Exoduser/Rendering/Sandbox/SandboxTerrain.asset | 1,442,300 | F03 | 밖 |
| Assets/Exoduser/Resources/Art/ui/minimap_silvertail.png | 10,168 | F04 | 안 |
| Assets/Exoduser/Resources/Art/TitleSignboard/A/silvertail.png | 2,049,791 | F05 | 안 |

#### 참조 있음 또는 미분류로 보존한76개

| 경로 | 원본 바이트 | 판정 | 근거·null 위험 |
|---|---:|---|---|
| Assets/Exoduser/Remodel/CH1_1/Generated/RM1_Terrain.asset | 3,580,716 | 참조 있음 — 보존 | F06 |
| Assets/Exoduser/Resources/Art/fonts/ArabicCaptionLatinFallback.asset | 5,792 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/ArabicCaptionNaskhDynamic.asset | 5,851 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/ArabicCaptionPanel.asset | 2,136 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/ArabicCaptionTextSettings.asset | 1,275 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/NotoNaskhArabic-Regular.ttf | 247,336 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/NotoSerifCJKjp-Regular.otf | 24,573,864 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/NotoSerifCJKsc-Regular.otf | 24,543,080 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/NotoSerifCJKtc-Regular.otf | 24,541,904 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/fonts/NotoSerifThai-Regular.ttf | 59,668 | 참조 있음 — 보존 | F07 |
| Assets/Exoduser/Resources/Art/ui/forge/forge_glyphs.png | 132,921 | 참조 있음 — 보존 | F08 |
| Assets/Exoduser/Resources/Art/ui/forge/window_base.png | 842,393 | 참조 있음 — 보존 | F08 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_arms_dim.png | 4,153 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_legs_dim.png | 3,166 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_skull_dim.png | 3,602 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/bone_torso_dim.png | 4,283 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/center_frame_baked.png | 30,618 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/node_frame_baked.png | 21,122 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/portrait_baked.png | 1,206,726 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/ring_baked.png | 257,717 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/sigil_1024.png | 587,409 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/ossuary/urn_lit_baked.png | 8,812 | 참조 있음 — 보존 | F09 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_armor.png | 1,433 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_belt.png | 1,025 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_boots.png | 934 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_bow.png | 1,260 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_bracelet.png | 2,924 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_cape.png | 1,693 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_gloves.png | 1,347 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_headband.png | 1,574 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_headband2.png | 1,574 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_helmet.png | 1,393 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_necklace.png | 1,520 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_ossuary.png | 1,661 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_pants.png | 1,319 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_ring1.png | 2,253 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_ring2.png | 2,253 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_shield.png | 1,512 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/storage/slot_weapon.png | 977 | 참조 있음 — 보존 | F10 |
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_empty.png | 78,103 | 참조 있음 — 보존 | F11 |
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/card_item.png | 322,668 | 참조 있음 — 보존 | F11 |
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/crystals_base.png | 955,920 | 참조 있음 — 보존 | F11 |
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/ossuary_skin.png | 16,836 | 참조 있음 — 보존 | F11 |
| Assets/Exoduser/Resources/Art/ui/inventory/crystals/portrait.png | 1,811,494 | 참조 있음 — 보존 | F11 |
| Assets/Exoduser/Resources/Art/CharacterSelect/hellgunner_color_cut_20261021.png | 2,605,316 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/portrait_hellgunner.jpg | 116,564 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/portrait_hellgunner_color_20261021.png | 1,365,630 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/portrait_silvertail.png | 2,704,744 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/portrait_spearmage.jpg | 98,738 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/portrait_spearmage_color_20261021.png | 1,358,579 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/portrait_transmuter.jpg | 217,115 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/portrait_transmuter_color_20261021.png | 1,320,569 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/poster_idle_hellgunner.jpg | 147,370 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/poster_idle_silvertail_4k.jpg | 485,164 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/poster_idle_spearmage.jpg | 113,844 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/poster_idle_transmuter.jpg | 218,298 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/silvertail_cut.png | 1,670,201 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/spearmage_color_cut_20261021.png | 2,892,567 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/CharacterSelect/transmuter_color_cut_20261021.png | 3,373,782 | 참조 있음 — 보존 | F12 |
| Assets/Exoduser/Resources/Art/ui/silver_hell/emblem_hellgunner_disabled.png | 260,828 | 참조 있음 — 보존 | F13 |
| Assets/Exoduser/Resources/Art/ui/silver_hell/emblem_silvertail_disabled.png | 965,982 | 참조 있음 — 보존 | F13 |
| Assets/Exoduser/Resources/Art/ui/silver_hell/emblem_spearmage_disabled.png | 272,175 | 참조 있음 — 보존 | F13 |
| Assets/Exoduser/Resources/Art/ui/silver_hell/emblem_transmuter_disabled.png | 390,745 | 참조 있음 — 보존 | F13 |
| Assets/Exoduser/Resources/Art/CharacterSelect/emblem_hellgunner.png | 458,950 | 미분류/JSON 기록 있음 — 보존 | F14 |
| Assets/Exoduser/Resources/Art/CharacterSelect/emblem_silvertail.png | 1,999,161 | 미분류/JSON 기록 있음 — 보존 | F15 |
| Assets/Exoduser/Resources/Art/CharacterSelect/emblem_spearmage.png | 458,617 | 미분류/JSON 기록 있음 — 보존 | F16 |
| Assets/Exoduser/Resources/Art/CharacterSelect/emblem_transmuter.png | 654,833 | 미분류/JSON 기록 있음 — 보존 | F17 |
| Assets/Exoduser/Resources/Art/FullscreenWide/59-32.png | 17,666,904 | 참조 있음 — 보존 | F18 |
| Assets/Exoduser/Resources/Art/FullscreenWide/59-21.png | 10,162,145 | 참조 있음 — 보존 | F19 |
| Assets/Exoduser/Resources/Art/FullscreenWide/60-32.png | 5,201,104 | 참조 있음 — 보존 | F20 |
| Assets/Exoduser/Resources/Art/FullscreenWide/60-21.png | 3,139,060 | 참조 있음 — 보존 | F21 |
| Assets/Exoduser/Resources/Art/FullscreenWide/61-32.png | 6,189,234 | 참조 있음 — 보존 | F22 |
| Assets/Exoduser/Resources/Art/FullscreenWide/61-21.png | 3,851,543 | 참조 있음 — 보존 | F23 |
| Assets/Exoduser/Resources/Art/FullscreenWide/62-32.png | 4,760,903 | 참조 있음 — 보존 | F24 |
| Assets/Exoduser/Resources/Art/FullscreenWide/62-21.png | 2,760,668 | 참조 있음 — 보존 | F25 |
| Assets/Exoduser/Resources/Art/enemy/fieldboss_angler.png | 2,802,437 | 참조 있음 — 보존 | F26 |

#### 추가 범주와 미확인

- Resources 1-1 외 맵: 추가 제외 0. Resources Art/map 현재 폴더 a2/boss_arena/hell_lighting/keyshot/production_finish/props는 현재 1-1 또는 공유 참조. prefix/dynamic Data/ch1_map 소비가 있어 폴더 통째 제외 불가. 근거: e3fd69f10:docs/0마스터플랜/WEB_BUILD/LICENSE_AUDIT_20261105.md:226
- 숨김 제작/relic 독립 원화: 미분류 — 추가 제외 0. 독립 craft/relic 전용 디렉터리 없음. forge/inventory/shared 원화에는 살아 있는 Load 경로가 있으므로 제외하지 않음.
- 드루이드 외 보스: 추가 제외 0. other boss 전용 대형 Art/boss 묶음 확인 안 됨; angler는 1-1 경로. 공유 boss UI/VFX/SFX는 드루이드도 사용하므로 제외하지 않음.
- 언어 OFL/공유 폰트: 보존. 권리문서 삭제 대상 아님. en/ko/Latin 공유 폰트 및 fallback 공용 자산도 제외하지 않음.

폴더 전체를 제외하지 않고 정확 경로만 사용한다. Resources.LoadAll, Resources.Load의 동적 경로·JSON 소비가 가능하면 직접 파일명 문자열이 없다는 이유만으로 미사용 판정을 내리지 않는다. 실제 Unity 의존 closure, S2 빌드 data.br 감소, 복원 뒤 AssetDatabase 상태·브라우저 런타임은 미확인이다.


### 임시 파일 복원과 영수증

`Library/WebBuildS2Hold/journal.tsv`는 파일 작업 전에 원래 경로·작업 종류·길이·SHA-256을 기록한다. 필터는 원본과 .meta를 함께 임시 이동하고, 리사이즈는 원본 PNG와 .meta를 복사 보존한다. S2 옵션뿐 아니라 `-slim2`에서 텍스처·오디오 플랫폼 오버라이드를 저장하는 모든 .meta도 변경 전에 보존한다. 이는 빌드 중 임시 상태를 finally에서 원래 바이트로 복원하기 위한 기록이며 원본 자산을 삭제하거나 별도 프로젝트를 만드는 방식이 아니다.

복원은 역순으로 파일을 되돌린 후 동기 AssetDatabase.Refresh와 원본 바이트 검증을 수행한다. 목적지 충돌·백업 변조·재임포트 실패·복원 뒤 .meta 변경이 있으면 해당 경로 오류를 남긴다. 실패 시 원본 보존 파일과 journal을 유지하고 영수증 `passed=false`, `result=RestorationFailed`, `s2.restorePassed=false`로 표시한다. 성공한 경우에만 기록된 임시 파일과 빈 hold 폴더를 정리한다. 미복원 hold가 있으면 새 빌드를 시작하지 않는다.

프로세스 강제 종료처럼 finally를 실행하지 못한 경우 같은 프로젝트에서 `-executeMethod Exoduser.DevTools.WebBuild.RestoreSlim3 -receipt <복구 영수증 경로>`를 빌드 담당이 실행한다. 복구는 journal의 원본을 되돌리고 동기 재임포트·바이트 검증 뒤 결과를 기록한다. 복구 실패는 exit 2와 `RestorationFailed`이며 증거를 보존한다. 이 작업에서는 Unity나 복구 executeMethod를 실행하지 않았다.

영수증 `slim2.s2`의 기록은 다음과 같다. 실제 건수는 빌드 시 확정하며 아래 후보 수를 성공 수로 미리 기록하지 않는다.

| 필드 | 의미·단위 |
|---|---|
| `resize4`, `demoFilter`, `auditMatched`, `auditExpected`, `auditActual` | 실행 옵션과 Runtime/JSON 감사 일치 결과 |
| `estimatedBuildInputBytesBefore`, `estimatedBuildInputBytesAfterFilter`, `estimatedBuildInputReduction`, `estimateBasis` | Resources + StreamingAssets + FirstPlayable 재귀 의존의 원본 파일 바이트 합. cooked/data.br 추정이 아님 |
| `filterCandidates`, `filterCount`, `filteredSourceBytes`, `filteredPaths`, `retainedPaths` | 후보 81개 중 실제 임시 이동 수·이동 원본 바이트·경로와 보존 사유. 비Resources 미포함 자산의 이동 바이트도 들어가므로 build input 감소와 다름 |
| `resizeCandidates`, `resizeCount`, `resized` | 후보 11개 중 실제 임시 PNG 기록 수, 경로·원본/목표 w/h·원본/임시 파일 바이트 |
| `audioAttempts`, `audioSelectors` | 파일별 후보 시도·채택 selector/문자열·그룹 readback 결과와 채택 selector별 건수. native 그룹 문자열은 public API에서 확정 못 하므로 미확인 |
| `restoreAttempted`, `restorePassed`, `restoreErrors`, `holdDirectory` | finally 복원 시도·성공 여부·오류 경로와 미복원 증거 위치 |

필터는 정확 후보 경로만 처리하며, 실행 시 Resources·StreamingAssets·FirstPlayable에서 시작하는 AssetDatabase.GetDependencies에 포함되는 후보는 보존한다(후보 파일 자체를 의존 탐색 root에서 제외). `filteredSourceBytes`의 총량을 패키지 절감이라고 쓰지 않고 `estimatedBuildInputReduction`과도 구분한다.

### S2 검증 상태

순수 .NET 보조 검사 **19 통과 / 0 실패**를 확인했다(`E:/exoduser-s2-tests/latest.log`). 범위는 파일+.meta 왕복 복원, 예외·부분 이동·중단 복구·충돌·변조·재임포트 실패 가정, 오디오 후보 순서·중복 제거·거부/readback 실패 시 복원, 4배수 크기·premultiplied bilinear 산술이다. Unity의 실제 AudioImporter·AssetDatabase·빌드 결과를 검증한 것은 아니다.

Unity **6000.6.7f1**에 포함된 DotNetSdk의 **csc 4.10.0-3.25064.8**과 Unity 참조 어셈블리 **316개**로 WebBuild.cs·WebBuild.Slim3.cs·WebBuildFileStage.cs 세 파일을 오프라인 컴파일했다. 결과는 **exit 0, 오류 0, 경고 0**이다. 로그·응답 파일·DLL은 I:/EXODUSER-Storage/debug/webgl-20261105/s2/offline-compile.log, offline-compile.rsp 및 같은 폴더의 컴파일 산출물에 있다. csc 호출은 에디터나 Player 실행이 아니다. 음향·필터의 별도 코드 검토에서도 추가 결함은 발견하지 못했지만 Unity 실행 검증을 대신하지 않는다.

Unity 실행·WebGL 빌드·3회차 data.br·실제 오디오 override 채택·Crunch 적용·브라우저 실행·리사이즈 화면 차이·Unity 재임포트 후 복원 상태는 **미확인**이다. 오디오 플랫폼 문자열 가설도 아직 원인 확정이 아니며, 실제 채택 selector와 readback·복원 결과를 다음 빌드 영수증으로 확인해야 한다.

### 최종 구현 근거

아래 코드는 S2 최종 제출 상태 기준이며, 위 경로 감사의 S1 기준 줄과 구분한다. 파일명 앞 공통 경로는 unity/Assets/Exoduser/Editor/DevTools/WebBuild/이다.

| 동작 | 최종 코드 파일:줄 |
|---|---|
| resize 11개·filter 81개 정확 허용 목록, Runtime/JSON 감사 기준 | WebBuild.Slim3.cs:16,18,32 |
| S2 옵션이 slim2를 요구하며 Runtime/JSON 변경 시 건너뜀 | WebBuild.Slim3.cs:144,154,183 |
| 필터 전·후 원본 크기 추정과 AssetDatabase 재귀 의존 보존 | WebBuild.Slim3.cs:171,209 |
| demoFilter에서 참조 있는 CJK 폰트 보존 | WebBuild.Slim3.cs:199 |
| resize의 importer·원본 크기 재검증, 임시 PNG와 actual 크기 확인 | WebBuild.Slim3.cs:234,242,247,270,274 |
| nearest4 크기 및 premultiplied-alpha bilinear | WebBuildFileStage.cs:224,232 |
| Texture WebGL override 저장 전 .meta 보존·readback | WebBuild.cs:345,346,348 |
| 오디오 설정 요청, public group 우선 채택·readback·후보별 원복 | WebBuild.cs:382,395,398; WebBuild.Slim3.cs:307,313,324,332,337 |
| journal 선기록, 원본/.meta 임시 이동·보존 | WebBuildFileStage.cs:109,119,124,131,132,133 |
| 역순 복원·동기 재임포트 뒤 바이트 검증·실패 증거 보존 | WebBuildFileStage.cs:145,168,170,175; WebBuild.Slim3.cs:287 |
| Build/Probe 모두 finally 복원·복원 실패 시 exit 2 | WebBuild.cs:98,100,101,565,567,573 |
| 영수증 필드 및 빌드 성공이어도 복원 실패를 실패로 기록 | WebBuild.Slim3.cs:119,360,362,365,367; WebBuild.cs:574 |
| 중단 뒤 별도 복구 진입점 | WebBuild.Slim3.cs:296; WebBuildFileStage.cs:190 |

### 빌드 담당 실행 인자와 회수 절차

기존 2회차의 프로젝트·출력·영상·로그 경로는 그대로 지정하고, 3회차 Run 또는 Probe에 다음 옵션을 준다. 여기서 명령을 실행하지 않았다.

```text
-buildTarget WebGL
-slim2 true -resize4 true -demoFilter true
-webAudio aac-inmemory
-receipt <3회차 영수증 JSON 경로>
-probeOut <3회차 textures.csv 경로>
```

Run은 -executeMethod Exoduser.DevTools.WebBuild.Run, 임포트/CSV만 확인하는 Probe는 -executeMethod Exoduser.DevTools.WebBuild.Probe다. **-webAudio aac-inmemory는 명시적 opt-in**이며 1초 초과 음원에 AAC q0.5·CompressedInMemory를 요청한다. 이 인자를 생략하면 Vorbis·Streaming을 임의 대체하지 않고 장음을 보류한다. 요청 적용이 성공했다는 뜻은 아니며 actual 채택·거부는 영수증과 오디오 CSV를 본다. `-videoDir`, `-keepVideos`, `-outDir`, `-api` 등 기존 옵션을 이번 표 때문에 생략하지 않는다.

정상·실패 종료 모두 finally 복원이 끝난 뒤 영수증을 기록한다. 중단되어 Library/WebBuildS2Hold가 남았다면 새 빌드를 덮어 시작하지 말고 같은 프로젝트에서 아래 복구 진입점을 사용한다.

```text
-executeMethod Exoduser.DevTools.WebBuild.RestoreSlim3
-receipt <복구 영수증 JSON 경로>
```

복구 영수증의 passed=true·result=Restored·slim2.s2.restorePassed=true를 확인한 뒤 다음 빌드를 시작한다. 실패한 journal과 .bin은 지우지 않으며 restoreErrors의 충돌/손상 경로부터 확인한다. 빌드 후 원본 PNG·.meta와 프로젝트 상태가 원복됐는지는 빌드 담당의 Unity 실행 결과로 최종 확인한다.

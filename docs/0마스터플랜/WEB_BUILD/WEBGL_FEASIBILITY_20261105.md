# Unity 1-1 데모 웹 브라우저 빌드(WebGL2/WebGPU) 가능성 감사 — 2026-11-05

레인 WG(클라우드). 근거: [CHROMA_AWARDS_PLAN_20261105](../CHROMA_AWARDS_PLAN_20261105.md) §2·§6. 대상: origin/unity/main `72e1049`(Unity 6000.6.7f1, URP 17.6, InputSystem 1.20.1). 코드 수정 0, 설정 수정 0. 실측 빌드는 PC 몫(§7 체크리스트).

## 0. 한 줄 결론

**조건부 가능(A안 유지 권고).** 10-28 개발툴 DT-16이 같은 프로젝트를 WebGPU로 빌드해 FDG→1-1→이동·공격 스모크를 통과한 기록이 있다(770MB→175MB, 로드 10~14초, `docs/engine/UNITY_DEVTOOLS_MASTER_20261028.md`:183). 그 뒤 10-30에 들어온 Windows 전용 `DllImport`(Tools) 1건이 새 빌드 차단 후보이고, 용량(원본 2.75GB, 기본 임포트가 비압축 8192)·첫 로딩(≤20초)·명령줄 스위치 의존(3D 필드·적 리그가 `--remodel3d` 등 인자로만 켜짐)이 가장 큰 위험이다. 차단 요소 수: **치명 4 / 중 9 / 경 10**(§2). 용량 추정은 §3, 실패 조건별 위험도는 §4.

**11-05 PC 실측(CTO 전달, 72e104989, `-slim -astc`):** 빌드 성공·오류 0이지만 **data.br 811.8MB**(10-28 축소 빌드 147MB의 5.5배). Build Report 사용자 자산 1.3GB 중 텍스처 1.0GB(75.7%)·사운드 113.6MB·메시 86.1MB·애니 62.6MB. textures.csv에 RGBA32 799MB·RGB24 117MB·비크런치 DXT5 402MB가 남아 있어 **텍스처 오버라이드가 대부분에 적용되지 않았다**. 원인 가설과 ≤300MB 도달 경로는 §3.4 용량 절감 계획. 10-28 DT-16 상세(CTO 전달): 무압축 약 770MB·첫 화면 18~23초 / 축소 174.9MB·전송 164.7MB·첫 화면 12.4초·WebGPU 1-1 연습장 진입·이동 OK·페이지 예외 0, 콘솔에 ReadPixels 실패 2건(§2.2 M1).

## 1. 조사 범위와 방법

| 항목 | 방법 | 비고 |
|---|---|---|
| 패키지·렌더 피처·셰이더·RT·GPU readback·스레드·파일 IO·P/Invoke | `unity/Assets/Exoduser/Runtime`(428파일)·`Editor`·`ProjectSettings` 전수 grep, 셰이더 30개(`.shader`·`.hlsl`) `#pragma` 대조 | 파일:줄 표기 |
| 자산 용량 | GitHub tree API(blob 크기)로 `unity/Assets` 2,172파일 집계, `.meta` 1,328개를 받아 임포트 설정 통계 | 원본 바이트 기준. 빌드 바이트는 10-28 실측과 비율로 추정 |
| 공식 문서 | 이 세션에서 `docs.unity3d.com`·`docs.unity.cn`은 DNS 차단(접속 불가). **웹 검색 발췌**로만 대조했고 각 항목에 출처 URL과 "검색 발췌/미접속"을 적었다(§9) | 원문 미확인 항목은 "미검증" |
| 선행 기록 | 웹 빌드 브랜치 `claude/unity-pc-devtools-web-20261028`(원격 `f564c7b`, 병합 안 함)의 `WebBuild.cs`·`vercel.json`·템플릿을 읽어 당시 설정을 복원 | §7 체크리스트의 기준값 |

## 2. 차단 요소 표

등급: **치명** = 빌드 실패 또는 데모 핵심이 안 됨 / **중** = 기능·품질·메모리 결함, 수정 필요 / **경** = 알고 넘어가도 되는 차이. 공수 S(반일 이하)·M(1~2일)·L(3일 이상 또는 범위 결정 필요). "미검증"은 공식 문서 원문을 못 열었거나 실측이 필요한 것.

### 2.1 치명

| # | 요소 | 위치(파일:줄) | 왜 막히나 | 대안 | 공수 |
|---|---|---|---|---|---|
| C1 | Windows 전용 P/Invoke가 Runtime 어셈블리에 있음 | `Runtime/Tools/UiTabAudioCheck.cs:74-78`, `Runtime/Tools/PauseInputCheck.cs:98-102` (`[DllImport("user32.dll")]`·`kernel32.dll`, 플랫폼 `#if` 없음, `Exoduser.Runtime.asmdef` includePlatforms 비어 있음) | Web은 IL2CPP+Emscripten 정적 링크라 외부 DLL 심볼이 없으면 링크 단계 `undefined symbol` 오류 가능(검색 발췌: WebGL은 `__Internal`만 허용). 두 파일은 10-30 커밋(`0ced574e`·`5093a76c`)에 들어와 10-28 웹 빌드에는 없었다 → **현재 unity/main은 웹 빌드 미검증** | `#if UNITY_STANDALONE_WIN` 가드 또는 `Tools/`를 별도 asmdef로 분리해 `excludePlatforms: ["WebGL"]`. QA 전용 코드라 제품 영향 0 | S |
| C2 | 자산 용량: Resources 전부 포함 + 기본 임포트 비압축 | `Editor/SourceTextureImporter.cs:24,40`(Resources/Art 아래 기본값 `maxTextureSize=8192`, `Uncompressed`), `.meta` 통계: 텍스처 1,055개 중 848개 비압축·841개 8192, **WebGL 플랫폼 오버라이드 0개** | Unity는 `Resources/` 아래 파일을 참조 여부와 무관하게 전부 빌드에 넣는다. 원본 2,748MB(§3)가 비압축으로 들어가면 데이터 파일이 수백 MB~GB. 10-28 실측 "raw 770MB" | ① WebGL 플랫폼 텍스처 오버라이드(DXT crunched/ASTC, 10-28 `WebBuild.ApplyWebTextures` 방식) ② 1-1에 필요 없는 폴더 제외(§3.3) ③ 장기: Addressables/AssetBundle로 로비·로딩 아트 분리 | L(①S, ②M, ③L) |
| C3 | 3D 필드·적 리그·영웅 리그픽셀이 명령줄 인자로만 켜짐 | `Runtime/NativeRemodel3D.cs:11`(`--remodel3d`), `Runtime/NativeGame.Enemy3D.cs:4`(`NativeEnemyRigPolicy.Requested(args)`), `Runtime/NativeGame.RigPixel.cs:7`(`--hero-render=rigpixel`), `Runtime/BuildFlavor.cs:46-49`(플레이버 인자), `KiImpactView.cs:41`, `NativeGame.Impact.cs:19` | 브라우저에는 명령줄이 없어 `Environment.GetCommandLineArgs()`가 빈 값 → 웹 빌드는 **2D 웹 동등 필드**로 뜨고 HD-2D 표현(CLAUDE.md §1 방향)이 빠진다. 10-28 스모크도 이 상태였다고 봐야 한다 | 스위치를 `ScriptableObject`/`Resources/Data/*.json` 또는 URL 쿼리(`?remodel3d=1`, `.jslib`로 읽기)로도 받게 한 줄 추가. 기본값은 빌드 define(`UNITY_WEBGL`)로 ON | S~M |
| C4 | VFX Graph는 컴퓨트(SSBO) 필수 → WebGL2 미지원 | `Packages/manifest.json`(`com.unity.visualeffectgraph 17.6.0`), `Runtime/Vfx/VfxBridge.cs:4,290-291`, `Runtime/Vfx/NativeSkillRemaster.cs:4`, `.vfx` 6개(`Resources/VFX/RM1/VFX_KiSlash`, `Resources/VFX/Impact/VFX_ImpactBurst`·`VFX_SkillMatter`, `VFX/RM1/VFX_PoisonBurst`·`VFX_CoreColor`·`VFX_CoreTest`) | VFX Graph 요구사항은 컴퓨트/SSBO(검색 발췌, 공식 패키지 문서). WebGL2에는 없고 WebGPU에만 있다. `VfxBridge.cs:290`은 "null graph는 건너뛴다"라 크래시는 안 나지만 기검참·독·임팩트 연출이 사라진다 | WebGPU 우선 + WebGL2 폴백(10-28과 같음)이면 Chrome/Edge에서는 보임. WebGL2 폴백 사용자에게는 스프라이트 시트 대체(`Art/vfx/*_sheet.png`는 이미 있음)를 `SystemInfo.supportsComputeShaders`로 분기 | M |

### 2.2 중

| # | 요소 | 위치 | 문제 | 대안 | 공수 |
|---|---|---|---|---|---|
| M1 | 동기 GPU readback(`ReadPixels`)이 게임 경로에 남아 있음 | `Runtime/NativeGame.WorldDrops.cs:43-46`(드랍 아이콘 배경 제거), `Runtime/NativeHud.cs:171`(QA 프로브), `Runtime/NativeUiAudit.cs:131`(QA) | WebGPU는 동기 readback 불가(검색 발췌: 공식 WebGPU 제한 페이지), WebGL2는 "대체로 동작". 10-28 HUD 회색 띠가 같은 원인이었고 `NativeHud.cs:122`·`NativeInventoryWebLayout.cs:162`만 CPU 경로(`NativeCpuPixels.cs:10`)로 고쳐졌다. `UNITY_HUD_WEBGPU_READBACK_20261028.md`도 WorldDrops를 "남은 곳"으로 적어 둠 | WorldDrops도 `isReadable` + `GetPixels32` CPU 경로 또는 `AsyncGPUReadback`. 드랍 아이콘 텍스처 수가 많아 `.meta` 일괄 변경 필요 | M |
| M2 | 세이브 영속성(IndexedDB 동기화) | `Runtime/Core/NativeSettingsStore.cs:110`(락 파일 `FileShare.None`),`:177-189`(`File.Replace`/`Move`), `Core/CombatSaveStore.cs:87-89,105`, `Core/CharacterRosterStore.cs:174-189`, `Runtime/NativeFlavorStorage.cs:29-34`(`persistentDataPath`) | Web의 `persistentDataPath`는 `/idbfs/<해시>`(MEMFS)이고 IndexedDB 반영은 비동기. 공식 문서는 `FS.syncfs`를 권고(검색 발췌). 자동 동기화 시점이 불명확해 탭을 닫으면 마지막 세이브가 유실될 수 있다. `File.Replace`·락 파일은 Emscripten에서 rename/무시로 처리될 것으로 보이나 **미검증**. 번들 ID가 바뀌면 경로 해시가 바뀌어 기존 세이브가 안 보임 | `.jslib` 1개로 저장 직후 `FS.syncfs(false)` 호출(S). 번들 ID 고정. 15 세이브 docs에 "웹 저장 위치·한계" 절 추가 | S |
| M3 | 오디오: PCM DecompressOnLoad 138개 + 로비·스타트업 큰 mp3 | `Editor/SourceAudioImporter.cs:13-19`(Bgm 밖 전부 `DecompressOnLoad`·PCM·`preloadAudioData=true`), `.meta` 통계 138/154, `Resources/Audio/Lobby` 25.5MB·`Startup` 9.4MB·`UI` 7.8MB 원본 | PCM 디컴프레스는 wasm 힙(초기 32MB, 최대 2048MB 설정)에 올라간다. 로비 mp3 6개(원본 25.5MB)만 PCM으로 풀면 수백 MB로 커질 수 있다(비율 추정, 미실측). Web 오디오는 Web Audio 백엔드로 기본 기능만 지원(검색 발췌) | Lobby/Startup/UI를 `CompressedInMemory`로(S). SFX(2.1MB)는 PCM 유지 가능. 메모리 측정은 §7 | S |
| M4 | `AudioMixer`·`AudioListener.GetOutputData` 의존 | `Runtime/NativeAudioMixer.cs:20,35-36`(`Exoduser.mixer` `SetFloat`), `Runtime/NativeFeedbackAudio.cs:63-66,387`(초기화 때 `GetOutputData`), `NativeLobby.UiSound.cs:48`(`FrontendUI.mixer`) | Web 오디오 지원 목록에 AudioMixer·GetOutputData가 있는지 공식 원문을 못 열었다(**미검증**). 커뮤니티 보고는 GetOutputData/GetSpectrumData가 Web에서 빈 값. 10-28 스모크가 소리까지 확인했는지도 기록 없음 | 실측 1순위(§7 측정 항목). 안 되면 `NativeAudioMixer.SfxGain`처럼 `AudioSource.volume` 경로로 폴백(코드에 이미 게인 값이 있음) | S~M |
| M5 | 적마다 카메라 렌더 요청 + RT | `Runtime/NativeEnemyRigRenderer.cs:98-104`(적 1마리당 `RenderTexture(size,size,24)` + `SubmitRenderRequest` 매 프레임), `Runtime/NativeRigPixelHero.cs:226,245`, `Runtime/A2RiverReflection.cs:31,50`(960×540 ARGBHalf 반사 카메라) | WebGL은 렌더 스레드가 없고 GL 상태 전환 비용이 크다. 화면에 적 10~20마리면 RT 바인딩·클리어·드로우가 그만큼 늘어 1080p 30fps 조건의 가장 큰 변수. ARGBHalf RT는 `EXT_color_buffer_float` 필요(데스크톱 WebGL2 사실상 전부 지원) | 적 리그 렌더를 1프레임에 N마리로 상한, 멀리 있는 적은 캐시 프레임 재사용. 반사는 웹에서 끄기 옵션 | M |
| M6 | 후처리·품질 레벨이 PC High | `ProjectSettings/QualitySettings.asset:343`(WebGL → 레벨 3 High = `URP_PC_High`: HDR, MSAA 4, 그림자 2048/캐스케이드 3, 추가광 그림자 4096), `Runtime/NativeGame.HellLighting.cs:27-32`(ACES 톤매핑·Bloom·Vignette), `NativeGame.cs:108`(`renderPostProcessing=true`), `Runtime/HellSsaoFeature.cs:4-9`(SSAO Depth 소스), `Runtime/HellFogFeature.cs:4-9`(풀스크린 패스 `HellHeightFog.shader:21` `_BlitTexture`+`SampleSceneDepth`) | 기능은 WebGL2에서 되지만 통합 GPU에서 HDR+MSAA4+SSAO+풀스크린 안개는 30fps 미달 위험. 포워드+가 아니라 포워드(`URP_PC_High_Renderer.asset:98 m_RenderingMode: 0`)인 점은 다행(포워드+는 WebGL에서 멈춤 보고 있음, 검색 발췌) | WebGL 품질 레벨을 `URP_Mac_Balanced`(MSAA 2, 그림자 1024)로 지정하고 안개·SSAO를 옵션 토글(`NativeGraphicsOptions.Fog` 이미 있음) | S |
| M7 | 메모리 설정·예외 설정 | `ProjectSettings.asset:557`(`webGLExceptionSupport: 1` 명시 throw만), `:572-577`(초기 32MB·최대 2048MB·기하 증가) | 코드가 자산 누락 때 `throw new InvalidOperationException`을 널리 쓴다(`NativeGame.cs:110,395,533` 등). 예외 지원을 None으로 내리면 성능은 좋아지지만 어떤 throw도 즉시 abort → "크래시 0"과 충돌. 힙 자동 증가는 연속 블록 실패 시 크래시(검색 발췌, 공식 메모리 페이지) | 실측 빌드는 1(명시 throw)로, 10판 크래시 0 확인 뒤에만 None 검토. 초기 메모리를 실측 힙에 맞춰 올림(예 256~512MB) | S |
| M8 | 폰트 105.6MB가 Resources에 전부 포함, OS 폰트 폴백 없음 | `Resources/Art/fonts/`(NotoSerifCJK jp·sc·tc 각 23.4MB, NotoSansKR 9.9MB, NativeLobbyNotoSansKR 3종 17.7MB 등), IMGUI 동적 폰트 사용(`NativeGame.cs:112`, `NativeInventoryWebLayout.cs:21-22` 등) | Web은 OS 폰트를 쓰지 못해 포함된 폰트에 없는 글자는 빈 칸(검색 발췌, Unity 지원 문서). 29개 언어를 다 살리면 CJK 70MB가 그대로 들어가고, 10-28처럼 CJK를 빼면 ja·zh·zht가 깨진다 | 데모 언어를 ko·en(+필요 시 1~2개)으로 좁히고 나머지 폰트를 빌드에서 제외. 번역_가이드에 "웹 데모 언어 범위"를 적는다 | S(결정) |
| M9 | 영상·StreamingAssets 전부 복사 | `Assets/StreamingAssets/Lobby/*.mp4` 12개 65.5MB(4K 캐릭터 영상 13.5·11.1MB 포함), `Runtime/NativeLobbyVideo.cs:64`(`VideoSource.Url` + `streamingAssetsPath`) | URL 재생은 Web에서 지원되는 유일한 방식이라 **방식은 맞다**(검색 발췌, 공식: VideoClip 미지원). 다만 StreamingAssets는 전부 빌드에 복사되고 4K mp4는 브라우저 디코딩 부담. Safari는 드리프트 보정 꺼짐 | 1-1 데모에 필요한 영상(FDG 인트로·타이틀·문·월드 인트로)만 720p로 재인코딩해 복사(10-28 `-videoDir` 방식). `title_motion_*` 4종 중복 정리 | S |

### 2.3 경

| # | 요소 | 위치 | 내용 | 대안 |
|---|---|---|---|---|
| L1 | `Task.Run`(스레드) | `Runtime/Tools/NativeQaCaptureWriter.cs:1,13` | Web은 관리 스레드 없음(검색 발췌, 공식 6.6 멀티스레딩 페이지). QA 전용이라 호출되지 않음 | C1과 함께 Tools 분리 |
| L2 | `Application.Quit` 버튼 | `Runtime/NativeGame.cs:744`(일시정지 메뉴), `NativeLobby.cs:260`, `NativeLobby.UiSound.cs:45` | Web에서 무동작(`webGLCloseOnQuit: 0`). 타이틀만 `NativeLobby.TitleMenu.cs:38` `#if !UNITY_WEBGL`로 숨김 | 같은 `#if`로 로비·일시정지 종료 항목 숨김(S) |
| L3 | `Application.OpenURL`(Steam 위시리스트) | `NativeLobby.Characters.cs:142`, `NativeLobby.SilverLobby.cs:126`, `TitleMenu.cs:36` | 브라우저 팝업 차단에 걸릴 수 있음. 클릭 핸들러 안이라 대체로 허용 | 그대로 |
| L4 | 하드웨어 커서 | `Runtime/NativeCursorOption.cs:30`(`Cursor.SetCursor`) | Web 지원 여부 공식 원문 미확인(**미검증**). 안 되면 기본 커서 | 실측 항목 |
| L5 | 전체화면 토글 | `Runtime/NativeGame.SettingsPersistence.cs:86`(`Screen.fullScreenMode`) | 브라우저는 사용자 입력 이벤트 안에서만 전체화면 허용(검색 발췌). 키 다운에서 호출하면 됨. Safari 미지원 | 설정 UI는 키 다운 이벤트에서 호출되는지 확인 |
| L6 | 해상도·울트라와이드 | `Runtime/NativeUiViewport.cs:6-13`(`Screen.width/height` 기반 SafeArea), 10-28 템플릿 `index.html:26`(스테이지를 16:9로 고정 `min(100vw, 100vh*16/9)`) | 코드는 어떤 비율도 맞추지만 10-28 템플릿이 캔버스를 16:9로 묶어 3840×1080에서는 좌우 검은 띠. `defaultScreenWidthWeb 960×600`(`ProjectSettings.asset:46-47`)은 템플릿이 덮어씀 | 템플릿 CSS를 `100vw×100vh`로 바꾸면 UI 쪽 32:9 대응은 코드가 이미 함. devicePixelRatio는 1로 고정 권고(4K 모니터 fps) |
| L7 | 입력 | `Runtime/Input/ExoInput.cs:16,46-47`(IME 키보드 바인딩), `:72,146`(Gamepad/Joystick) | InputSystem 1.x 문서: Web 키보드·마우스 지원, 게임패드는 W3C 표준 매핑만, 진동 없음(검색 발췌). IME 바인딩은 Web에서 의미 없음 | 패드는 Chrome에서만 보장으로 적음 |
| L8 | 리플렉션 | `Runtime/NativeUiAudit.cs:187`(`GetMethod` 비공개 IMGUI 내부 API) | IL2CPP 스트리핑 Medium 이상에서 null 가능. QA 전용 | 그대로 |
| L9 | Unity 스플래시 | `ProjectSettings.asset:20-21`(`m_ShowUnitySplashScreen: 1`) | 10-28 "다음 빌드에 끄기"로 남아 있음. 라이선스가 Personal이면 끌 수 없음 | 라이선스 확인 |
| L10 | MCP 패키지 | `Packages/manifest.json`(`com.coplaydev.unity-mcp`), `Editor/McpPlayerAssemblyFilter.cs:15` | 플레이어 빌드에서 어셈블리를 걸러내는 필터가 이미 있음 | 그대로 |

### 2.4 문제 없음으로 확인한 것

| 항목 | 근거 |
|---|---|
| 컴퓨트 셰이더·`ComputeBuffer`·`AsyncGPUReadback`·Burst·Jobs·`unsafe` | Runtime 전수 grep 0건(VFX Graph 내부 제외, C4) |
| 커스텀 셰이더 30개 | 모두 `#pragma target 3.0~3.5`, 지오메트리·테셀레이션·`RWTexture`·`StructuredBuffer` 0건. `_CLUSTER_LIGHT_LOOP`는 `HD2DSpriteLit.shader:12`에 있지만 렌더러가 포워드라 변형만 늘어남(스트리핑 대상) |
| RT 포맷 | `ARGB32` 23곳, `ARGBHalf` 1(반사), `ARGBFloat`·`RFloat` 7곳은 모두 QA 캡처 코드 |
| 네이티브 플러그인(.dll/.so/.jslib) | `unity/Assets`에 0개 |
| `PlayerPrefs` | 0건(전부 파일 저장, M2) |
| `System.Threading.Timer`·`Process.Start`·`Microphone`·`Font.CreateDynamicFontFromOSFont` | 0건 |
| Addressables·AssetBundle | 0건(그래서 전부 `Resources`, C2) |
| 씬 | `Assets/Scenes/FirstPlayable.unity` 1개(4.8KB, 참조 guid 3개). 월드는 전부 코드+Resources로 생성 → `Exoduser/Remodel`(235MB)·`Art/Characters/Silvertail·Ivan`(179MB)은 씬·프리팹 참조가 없어 빌드에 들어가지 않는 것으로 보임(추정, 빌드 리포트로 확정) |
| 영웅 모델 | `Resources/Characters/Warrior.prefab` → `Art/Characters/Warrior/RemasterR7/*`(fbx 6.7MB, BaseColor 20.8·Normal 19.2·MS 5.2MB)·대검(fbx 13.5MB+텍스처 12MB) 약 78MB 원본만 따라 들어감 |
| 패키지 | ai.navigation·cinemachine·probuilder·timeline·inputsystem·shadergraph은 Web 지원. VFX Graph만 C4 |

## 3. 자산 용량

### 3.1 원본(GitHub blob 크기, `unity/Assets` 3,363MB / 2,172파일)

| 위치 | MB | 파일 | 빌드 포함 |
|---|---|---|---|
| `Exoduser/Resources` | **2,748.1** | 1,418 | 전부(참조 무관) |
| `Exoduser/Art/Characters` | 307.8 | 51 | Warrior 약 78MB만(프리팹 참조) |
| `Exoduser/Remodel` | 234.9 | 161 | 미참조 추정 → 0 |
| `StreamingAssets/Lobby` | 65.5 | 12 mp4 | 전부 복사 |
| 코드·렌더링·VFX·씬 | 7.2 | — | — |

Resources 확장자별: PNG 2,314MB(957) · MP3 124.5(145) · FBX 114.7(74) · JPG 77.6(41) · OTF 70.2(3) · TTF 35.3(14) · WAV 7.7(9) · 기타 4MB.

### 3.2 Resources 폴더별(큰 순)

| 폴더 | MB | 파일 | 1-1 데모 필요도 |
|---|---|---|---|
| `Art/FullscreenWide` | 1,061.2 | 128 | 21:9·32:9 와이드 판(`NativeFullscreenArtwork.cs:15,23`, `Data/fullscreen_wide` 카탈로그). 웹은 16:9 캔버스면 **제외 가능** |
| `Art/map` | 559.3 | 348 | `a2` 386.8(1-1 숲, 필요) · `production_finish` 120.0 · `hell_lighting` 22.9 · `props` 18.9(ch1_map 소품 27종, 필요) · `keyshot` 8.6 · `boss_arena` 2.1 |
| `Art/Loading` | 396.0 | 74 | 로딩 그림 16종×(16:9·21:9·32:9·원본·dim·hover). 16:9 1종만 쓰면 약 1/4 |
| `Art/fonts` | 105.6 | 30 | CJK 3종 70.2MB는 ja·zh·zht 전용(M8) |
| `Art/vfx` | 97.2 | 79 | boss 53.9(드루이드 필요) · field 14.4 · combat 13.0 |
| `Audio/Bgm` | 85.3 | 16 | 1-1·보스·로비 곡만 남기면 축소 |
| `Art/Startup` | 74.3 | 23 | 첫인상(필요) |
| `Art/ui` | 68.0 | 351 | inventory 29.2 · silver_hell 9.8 · 필요 |
| `Art/CharacterSelect` | 43.0 | 33 | 영웅 1명이면 1/4 |
| `Art/lobby` | 41.6 | 24 | `varkan_idle.png` 17.5MB 1장 포함 |
| `Enemies3D/*.fbx` | 114.7 | 30 | CH1 스폰 풀(`Core/EnemyPools.cs` HellSpawn[0] etype 0~29·47)이 리그 모델 30개 중 29개를 쓴다 → 거의 전부 필요. FBX 46개가 `isReadable: 1`(메모리 2배) |
| `Art/enemy` | 26.2 | 17 | 필요 |
| `Audio/Lobby`·`Startup`·`UI`·`SFX`·`RM1` | 46.4 | 118 | 필요(M3 임포트 변경) |
| `Art/TitleSignboard` | 24.3 | 9 | 필요 |
| `Art/boss` | 16.7 | 7 | 필요 |

### 3.3 빌드 바이트 추정

- **실측 기준(10-28 DT-16):** 전체 Resources를 WebGL 오버라이드(DXT1/5 crunched 품질 60, 4의 배수가 아닌 것은 ASTC) + CJK 폰트 제외 + 영상 720p로 빌드 → **175MB(Brotli)**, 비압축 raw 770MB. 출처 `docs/engine/UNITY_DEVTOOLS_MASTER_20261028.md`:183, 설정은 웹 브랜치 `Editor/DevTools/WebBuild/WebBuild.cs`.
- **지금 unity/main:** 10-28 이후 `Art/map/a2/r3`(고목 4K 노멀 36.4MB×2 등)·보스 VFX 등이 늘었다. 같은 방식이면 **200~260MB(추정)**. 오버라이드 없이 그대로 빌드하면 **1GB 이상(추정)** → 실패 조건 즉시 위반.
- **1-1 범위로 좁힌 경우(추정):** FullscreenWide 제외(−1,061MB 원본), Loading 16:9만(−300MB), CJK 폰트 제외(−70MB), 미사용 BGM·캐릭터 선택·4K 영상 정리 → 원본 약 1.0~1.1GB → 오버라이드 뒤 **90~140MB(추정)**. 이 범위여야 §4의 첫 로딩 20초(약 100~150MB/50Mbps)가 가능하다.
- **11-05 PC 실측:** 같은 `-slim -astc` 경로로 72e104989를 빌드했는데 data.br 811.8MB. 큰 항목: `boss_name_sharp.png` 24.8MB, `RF_Ancient_Tree`/`RF3` 노멀 3장 각 22.4MB(= 4096² DXT5+밉맵 21.3MB에 해당 → 오버라이드 최대 크기 2048이 적용되지 않은 증거), `gate_sigil` 14.7MB, `Warrior_R7.fbx` 12.4MB, 설정 `window_base` 11.1MB. 위 200~260MB 추정은 **틀렸고**, 오버라이드가 실제로 걸릴 때만 성립한다(§3.4).
- 추정 근거: 비압축 RGBA32 대비 DXT5 1/4, crunch 추가 1/2~1/3, PNG 원본 대비 10-28 실측 비율(2.3GB→175MB 전체 ≒ 7~8%). 정확한 수치는 §7 빌드 리포트(`report.packedAssets`)로 대체한다.

### 3.4 용량 절감 계획(CTO 요청, 11-05 PC 실측 811.8MB → 목표 ≤300MB)

PC csv(`I:/EXODUSER-Storage/debug/webgl-20261105/`)는 이 세션에서 못 읽었다. 아래 원인은 코드·`.meta`로 세운 가설이고, csv의 `format`·`w,h` 열로 확인한 뒤 수치를 바꾼다.

#### ① 왜 오버라이드가 안 걸렸나(가설, 확인 순서대로)

| # | 가설 | 근거 | 확인 방법 |
|---|---|---|---|
| H1 | 4의 배수가 아닌 텍스처가 RGBA32/RGB24로 남음 | `.meta` 1,055개 중 1,021개가 `nPOTScale: 0`(None). DXT는 가로세로 4의 배수가 필요해 `WebBuild.ApplyWebTextures`는 그런 것만 ASTC로 보냈는데, ASTC 지정이 WebGL 빌드 서브타깃(Build Settings 텍스처 압축 = DXT 기본)과 충돌하면 Unity가 RGBA32로 내보낼 수 있음(미검증). RGBA32 799MB + RGB24 117MB = UI 스틸·로딩·와이드 판의 크기 분포와 맞음 | csv에서 `format == RGBA32`인 행의 `w % 4`, `h % 4` 확인. `EditorUserBuildSettings.webGLBuildSubtarget` 값 확인 |
| H2 | `GetWidthAndHeight` 리플렉션 실패 → 전부 "4의 배수 아님" 분기 | `WebBuild.cs` `ApplyWebTextures`가 `TextureImporter`의 비공개 메서드를 리플렉션으로 부른다. 6000.6에서 시그니처가 바뀌면 `wh == null` → 모든 텍스처가 ASTC(또는 `-astc` 없으면 DXT5Crunched) 분기로 감 | 빌드 로그에 `UNITY_WEB_SLIM textures=N`과 함께 포맷 분포를 찍도록 한 줄 추가 |
| H3 | 노멀맵·3D 텍스처가 최대 크기 2048을 무시 | 노멀 3장이 22.4MB = 4096² DXT5+밉. `SourceTextureImporter.cs:36`은 a2 폴더를 `maxTextureSize=2048`로 두므로 기본 플랫폼은 2048인데 빌드가 4096이면 WebGL 오버라이드 블록이 다른 값을 가졌거나 `-texMax 4096`으로 실행된 것 | csv `w,h` = 4096이면 PC 실행 인자 확인. `.meta`의 `buildTarget: WebGL` 블록 `maxTextureSize`·`overridden` 확인 |
| H4 | Resources 밖 텍스처 미대상 | `ApplyWebTextures`는 `Assets/Exoduser/Resources`만 검색. `Art/Characters/Warrior/RemasterR7`(BaseColor 20.8·Normal 19.2·MS 5.2MB PNG)·대검 텍스처 12MB는 프리팹 참조로 빌드에 들어가지만 오버라이드 밖 | 검색 루트를 `Assets/Exoduser`로 넓힘(S) |
| H5 | 비크런치 DXT5 402MB | 크런치가 켜져도 `textureType: NormalMap`·`isReadable: 1`(24장)·`sRGB` 선형 텍스처에는 크런치가 적용되지 않거나, `-astc` 분기에서 `crunchedCompression=false`로 덮어씀 | csv에서 DXT5 행의 경로를 보고 `.meta` `isReadable`·`textureType` 대조 |

#### ② 전 텍스처 WebGL 오버라이드 규칙(제안)

| 분류 | 경로 | 포맷 | 최대 크기 | 밉맵 | 비고 |
|---|---|---|---|---|---|
| UI 스틸·HUD·인벤토리·설정 | `Resources/Art/ui/**`, `Art/Startup`, `Art/lobby`, `Art/TitleSignboard`, `Art/CharacterSelect` | DXT5 Crunched 품질 50(알파) / DXT1 Crunched(불투명) | 2048 | 없음 | 4의 배수가 아닌 원본은 **PNG를 4의 배수로 패딩**(오프라인 스크립트, 우하단 투명 패딩)하거나 `npotScale: ToNearest`. 코드가 `Texture2D.width`로 스프라이트 사각형을 계산하는 곳(`NativeGame.cs:394-396` 소품, `NativeHud.cs:125` 바, 기검참 시트 `NativeGame.cs:117-121`)은 패딩 쪽만 가능 |
| 맵 소품·바닥 원화 | `Art/map/props`, `Art/map/production_finish`, `Art/map/keyshot` | DXT5 Crunched 50 | 1024 | 없음 | 1-1 소품 27종 |
| 3D 재질(a2 고목·바닥·hell_lighting) | `Art/map/a2/**`, `Art/map/hell_lighting` | 색: DXT1/DXT5 Crunched · 노멀: DXT5(BC5 불가, WebGL) 비크런치 | **노멀 1024, 색 2048** | 있음 | 노멀 3장 22.4→각 1.3MB(−63MB). 1-1 원근 카메라에서 고목 노멀 1024는 1x 캡처로 판정 |
| VFX 시트 | `Art/vfx/**` | DXT5 Crunched 50 | 2048 | 없음 | 보스 `druid_hit_24` 10MB 등 |
| 와이드 판 | `Art/FullscreenWide`, `Art/Loading/*-21,*-32` | **제외**(③) | — | — | 16:9 캔버스만 |
| 영웅 3D | `Art/Characters/Warrior/RemasterR7`, `Weapon` | DXT1/DXT5 Crunched, 노멀 DXT5 | 2048(색)·1024(노멀·MS) | 있음 | 검색 루트 확장(H4) |

예상 효과(csv 확인 전 추정): RGBA32 799MB → DXT5 크런치 1/8~1/10 ≈ **80~100MB**, RGB24 117MB → DXT1 크런치 ≈ **10~15MB**, 비크런치 DXT5 402MB → 크기 상한+크런치 ≈ **60~90MB**. 텍스처 합계 1.0GB → **150~200MB**(Brotli 전). 와이드 판·로딩 변형 제외(③)를 더하면 **90~130MB**.

#### ③ 1-1 데모 제외 목록(제안, 결정은 CTO)

| 대상 | 원본 MB | 제외 근거 | 방법 |
|---|---|---|---|
| `Art/FullscreenWide` 128장 | 1,061 | 21:9·32:9 전용. 웹 캔버스 16:9 고정 | 빌드 때 `Library/WebBuildHold`로 이동(10-28 CJK 폰트 방식) |
| `Art/Loading` 21·32·dim·hover 변형 | 약 300 | 16:9 16장만 사용 | 같은 방식 |
| 폰트 CJK 3종 + Arabic·Thai | 70.5 | 데모 언어 ko·en | 10-28 `-holdCjk` 그대로 + 2종 추가. 번역_가이드에 범위 기록 |
| `Audio/Bgm` 1-1 외 곡 | 85.3 중 약 50 | 1-1 필드·드루이드·로비·사망 곡만 | 카탈로그(`NativeBgmCatalog.cs`) 대조 뒤 이동 |
| `Art/CharacterSelect` 영웅 2·3·4 | 43 중 약 30 | 영웅 1명 | 이동 |
| `Art/map/production_finish` | 120 | Runtime `Resources.Load` 문자열에 이 폴더가 없음(미확인: 데이터 json이 경로를 들고 있을 수 있음) | `Data/*.json` grep 뒤 결정 |
| `Enemies3D` 1종(`Enemies3D/*` 30 중 CH1 미사용 1) | 약 4 | CH1 풀이 29종 사용 | 효과 작음, 보류 |
| `StreamingAssets/Lobby` 영상 | 65.5 | data.br 밖(별도 다운로드)이지만 총량에 포함 | 4K 2종 제외·타이틀 중복 4종 정리·720p(`-videoDir`) → 약 20MB |
| `Exoduser/Remodel`·`Art/Characters/Silvertail·Ivan` | 414 | 참조 없음(추정) → 이미 0 | 빌드 리포트로 확정 |

합계 원본 약 1.7GB 제외 → 빌드 기준 **약 150~250MB 절감**(비압축 RGBA32로 들어갔다면 그 이상).

#### ④ 사운드(113.6MB)

| 대상 | 현재 | 제안 | 예상 |
|---|---|---|---|
| Bgm 16곡 | MP3 CompressedInMemory q0.7 | Vorbis q0.4~0.5 또는 그대로 두고 곡 수를 줄임(③) | 85→30MB |
| Lobby·Startup·UI(42.7MB mp3 원본) | PCM DecompressOnLoad(`SourceAudioImporter.cs:17`) → 빌드 안에 PCM | Vorbis q0.5 CompressedInMemory | PCM 수백 MB 가능성 → 15~20MB |
| SFX·RM1(2.9MB) | PCM | 그대로(지연 중요) | 변화 없음 |

Web은 임포트 포맷을 AAC로 바꾼다는 옛 문서(2022.x)가 있어 Vorbis 지정이 그대로 반영되는지는 **미검증**. 오디오 스트리밍(Streaming 로드 타입)은 Web 지원 여부 미확인 → CompressedInMemory까지만.

#### ⑤ 메시 86.1MB·애니 62.6MB

- FBX 46개 `isReadable: 1` → 0(메모리 2배 해소, 빌드 크기는 동일). 메시 압축 `meshCompression: 0`(Off, 88개 전부) → Medium.
- `Warrior_R7.fbx` 12.4MB·`Warrior_Rigged.fbx` 18.7MB·대검 13.5MB 원본: 리그 캐시(`Warrior_Rigged_Cape.asset` 16.2MB)·중복 리그가 둘 다 들어가는지 빌드 리포트로 확인. 애니는 Compression Optimal·키프레임 축소.
- 예상: 메시 86→50MB, 애니 62→35MB.

#### ⑥ ≤300MB 도달 경로와 남는 위험

| 단계 | 누적 예상(data.br) | 전제 |
|---|---|---|
| 현재(실측) | 811.8MB | — |
| ② 오버라이드 전 텍스처 적용(H1~H5 해소) | 약 **250~330MB** | 4의 배수 패딩 또는 ASTC가 실제로 적용됨 |
| + ③ 제외 목록 | 약 **120~180MB** | CTO가 범위 결정 |
| + ④⑤ 사운드·메시 | 약 **90~140MB** | 오디오 포맷 반영 확인 |

남는 위험: (a) H1이 맞으면 패딩 스크립트가 원본 PNG 수백 장을 건드리므로 `Texture2D.width`를 읽는 코드와의 정합을 1x 캡처로 다시 봐야 한다(화면 작업 기준 §4.2). (b) ASTC 경로는 데스크톱 Chrome WebGL2에서 소프트웨어 해제라 다운로드는 줄어도 메모리는 RGBA32와 같다. (c) 첫 로딩 20초는 120~150MB가 상한이라 ③까지 해야 한다. (d) 이 절의 수치는 전부 추정이며 csv와 다음 빌드 리포트로 바꾼다.

## 4. 실패 조건별 위험도

| 조건 | 현재 상태 추정 | 위험 | 결정 변수 |
|---|---|---|---|
| 빌드 ≤300MB | **실측 811.8MB**(11-05 PC, 오버라이드 대부분 미적용). §3.4 경로대로면 90~180MB | **높음**(§3.4 ①② 해소 전까지) | FullscreenWide·Loading·폰트·영상 제외 결정, 텍스처 오버라이드 |
| 첫 로딩 ≤20초 | 10-28 175MB가 10~14초(Vercel, 사용자 회선). 데이터 파일은 시작 전 전부 받는다(Addressables 없음). 20초 안이면 데이터 ≲120~150MB(50Mbps 기준) + wasm 컴파일 + `Awake` 동기 로드(아래) | **높음** | 데이터 크기, Brotli, 호스팅 CDN, 캐싱(`webGLDataCaching: 1` 이미 ON) |
| 1080p 30fps | 적마다 RT 렌더(M5) + HDR·MSAA4·SSAO·안개(M6) + 단일 스레드. 10-28 기록에 fps 수치 없음 | **중**(통합 GPU에서는 높음) | 품질 레벨 Balanced, 적 리그 렌더 상한, 안개·SSAO 토글, WebGPU 여부 |
| 크래시 0 | 예외 설정(M7), 힙 증가 실패(M7), WebGPU 드라이버 편차(검색 발췌: "WebGPU 지원을 보고하는 모든 기기가 일관되지 않음"), 세이브 유실(M2)은 크래시는 아니지만 데모 평가에 치명 | **중** | 예외 설정 1 유지, 초기 메모리 상향, WebGL2 폴백 경로도 10판 |

### 4.1 앱 시작 지연(브리프의 5.7초) 원인 후보

docs에는 5.7초 측정 원문이 없다(검색: CH3 관련 수치만 있음). 코드로 보는 후보는 다음이고 웹에서는 전부 다운로드 뒤 추가로 걸린다.

| 후보 | 위치 | 비고 |
|---|---|---|
| `Awake`에서 동기 로드 | `NativeGame.cs:104-150`(`targetFrameRate=120`, `Data/ch1_map`, `Art/fonts/NotoSansKR` 9.9MB, 기검참 시트 2장, 일시정지 폰트) | 동적 폰트는 첫 글자 때 아틀라스 생성 |
| 효과음 전부 로드+디코드 | `NativeFeedbackAudio.cs:63`(`Resources.LoadAll<AudioClip>` 3폴더 + `LoadAudioData()` 111개) | PCM이라 디코드 시간·메모리 모두 큼(M3) |
| 소품 텍스처 36개 비압축 8192 업로드 | `NativeGame.cs:394`, `SourceTextureImporter.cs:40` | 비압축이라 GPU 업로드가 느림(C2와 같은 해법) |
| 3D 필드 조립 코루틴 | `NativeGame.RigPixel.cs:16`(최대 60초 대기), `NativeScreenTransition.cs:14`(준비 12초 상한) | 웹에서는 C3 때문에 꺼져 있을 가능성 |
| 타이틀 영상 Prepare | `NativeLobbyVideo.cs:64-71` | 10-28 DT-16 "타이틀 영상 중 Enter 무시" 가설과 연결(`UNITY_INTRO_KEYS_20261028.md`) |
| `Resources` 인덱스 | 1,418파일 | Unity가 시작 때 Resources 목록을 만들지만 파일 수 1천 단위는 보통 수십 ms |

Resources 전체를 한 번에 올리는 것이 원인은 아니다(`Resources.Load`는 요청 시 로드). 비압축 임포트와 PCM 디코드가 더 유력하다. 실측 항목은 §7.

## 5. 세이브·입력·해상도 요약

| 분야 | 현재 | Web에서 | 할 일 |
|---|---|---|---|
| 세이브 | JSON 파일 3종(`settings.v1.json`·`characters.v1.json`·`<캐릭터>.v1.json`+`shared.v1.json`), 원자적 교체·백업·락 파일, 경로 `persistentDataPath`(`NativeFlavorStorage.cs:29-34`, 플랫폼 Other는 그대로) | `/idbfs/<번들ID 해시>`에 쓰고 IndexedDB 동기화는 비동기 | `FS.syncfs` 호출(M2), `docs/15 세이브+데이터구조/15 세이브+데이터구조.md`에 웹 저장 위치·한계·삭제 방법 추가 |
| 입력 | InputSystem 1.20.1(`activeInputHandler: 2` 둘 다), `ExoInput.cs` 키보드·마우스·패드·IME | 키보드·마우스 지원, 패드는 표준 매핑만, 진동 없음 | 키 리바인딩 UI는 그대로. 패드 안내 문구에 브라우저 제한 |
| 해상도 | IMGUI 1920×1080 디자인 좌표를 `NativeUiSafeArea.Fit`로 어떤 비율에도 맞춤, 3840×1080 캡처 하네스 있음(`NativeGame.WorldUltrawideCapture.cs`) | 캔버스 크기는 템플릿 CSS가 정함. 10-28 템플릿은 16:9 고정 | 템플릿을 뷰포트 가득으로 바꾸고 3840×1080 브라우저 창에서 1x 캡처(L6) |

## 6. 공식 권장 빌드 설정과 호스팅 요건

| 항목 | 권장값 | 현재 `ProjectSettings.asset` | 근거 |
|---|---|---|---|
| 압축 | Brotli(`webGLCompressionFormat: 1`), 폴백 끔 | 1 / `webGLDecompressionFallback: 0` ✓ | Brotli는 HTTPS에서만 네이티브 해제(검색 발췌). 서버가 `Content-Encoding: br`를 못 주면 폴백 ON(`.unityweb`, 로더 커짐) |
| 메모리 | 초기 32→실측 힙 수준(256~512MB), 최대 2048, 기하 증가 | 32 / 2048 / mode 2 | 공식: 연속 블록 실패 시 크래시, 초기값을 통상 사용량으로(검색 발췌) |
| 예외 | 실측 빌드 1(명시 throw), 최종 None은 10판 크래시 0 뒤 | 1 | None은 성능·크기 이득이 크지만 모든 throw가 abort |
| 스트리핑 | Managed Stripping Medium(10-28 통과), IL2CPP `OptimizeSize` | 미지정(기본) | `WebBuild.cs` 10-28 설정 |
| 스레드 | 끔 | `webGLThreadsSupport: 0` ✓ | 코드에 스레드 없음. 켜지 않으면 COOP/COEP 헤더 불필요 |
| 그래픽 API | WebGPU → WebGL2 폴백 순서(10-28과 같음), 또는 WebGL2만(VFX 없음) | `m_BuildTargetGraphicsAPIs: []`(기본 = WebGL2) | WebGPU는 6.6에서 "실험"에서 벗어났다는 2차 보도(검색 발췌, 공식 릴리스 노트 미확인). Unity 자체 문서도 "기기별 일관성 없음" |
| 텍스처 | 플랫폼 오버라이드 DXT crunched(데스크톱) / ASTC(모바일) 또는 두 빌드 | 오버라이드 0 | 공식: 미지원 포맷은 소프트웨어 해제(메모리↑) |
| 캐싱 | `webGLDataCaching: 1` + `webGLNameFilesAsHashes: 1` | 1 / 0 | 재배포 때 캐시 무효화 |
| 템플릿 | `PROJECT:Exoduser`(10-28 제작, 로고 없는 로더) | `APPLICATION:Default` | 웹 브랜치 `Assets/WebGLTemplates/Exoduser/index.html` |
| 전원 | `webGLPowerPreference: 2`(고성능) ✓ | 2 | — |

호스팅 헤더(10-28 `unity/DevTools/Web/vercel.json`): `*.data.br`·`*.js.br` → `Content-Encoding: br`, `*.wasm.br` → `Content-Encoding: br` + `Content-Type: application/wasm`(스트리밍 컴파일), `X-Robots-Tag: noindex`. 스레드를 켤 때만 `Cross-Origin-Opener-Policy: same-origin`·`Cross-Origin-Embedder-Policy: require-corp`. 호스팅 후보: Vercel(헤더 설정 가능, 10-28 실적) / itch.io(헤더 불가 → 폴백 ON) / Cloudflare Pages(파일당 25MB 제한으로 `.data` 불가, 확인 필요) / GitHub Pages(헤더 불가·100MB 제한). 공개 링크·계정은 사용자 몫(계획 §5).

## 7. PC 실측 빌드 체크리스트

전제: PC는 컴파일·빌드 1회(계획 §6 PC 레인), 판정은 Mac. 공용 실행기 `exo-unity.ps1`로, 창 0·소리 0. WebGL 모듈 설치 여부 먼저 확인(10-28 당시 미설치 기록, `UNITY_DEVTOOLS_MASTER_20261028.md`:138).

### 7.1 빌드 설정 값

| 설정 | 값 |
|---|---|
| 스크립트 | 웹 브랜치의 `Editor/DevTools/WebBuild/WebBuild.cs`를 현재 unity/main 작업본에 **파일만 복사**해 쓴다(브랜치 병합 금지). 인자: `-api both -compression br -slim true -texMax 2048 -holdCjk true -keepVideos false -videoDir <720p 영상 폴더>` |
| 씬 | `Assets/Scenes/FirstPlayable.unity` 단일 |
| 품질 | WebGL 레벨을 `URP_Mac_Balanced`로 임시 지정(실측 비교용 High도 1회) |
| 예외/스트리핑 | ExplicitlyThrownExceptionsOnly / Medium / OptimizeSize |
| 메모리 | 초기 256MB, 최대 2048MB |
| 사전 수정(필수) | C1 가드(없으면 링크 실패 가능) |
| 사전 수정(권장) | C3 스위치 기본 ON(없으면 2D 필드만 측정됨 → 결과를 "2D"로 표기) |

### 7.2 측정 항목

| 항목 | 방법 | 기록 |
|---|---|---|
| 빌드 성공·오류 원문 | `WebBuild.Run` 영수증 JSON(`passed`·`errors`·`bytes`·`topAssets` 40개) | 실패 시 `undefined symbol` 등 원문 |
| 빌드 크기 | `Build/` 폴더 바이트(`.data.br`·`.wasm.br`·`.js.br` 각각) + StreamingAssets | ≤300MB |
| 자산 상위 40 | 영수증 `topAssets` | §3 추정 교정 |
| 첫 로딩 | Chrome DevTools Network 'Fast 4G'/제한 없음 2회, `createUnityInstance` progress 1 도달 시각, 첫 프레임 시각 | ≤20초 |
| fps | 1-1 필드 적 10마리 이상 전투 60초, DevTools Performance 또는 `NativePerfProbe` 로그, 1920×1080 창 | ≥30 |
| 메모리 | DevTools Memory → WebAssembly heap, `performance.measureUserAgentSpecificMemory` | 힙 최대치, 증가 실패 여부 |
| 콘솔 오류 | 전체 콘솔 저장(경고 포함) | 오디오·readback·셰이더 오류 |
| 소리 | 로비 BGM·UI 효과음·전투 효과음 들리는지, 볼륨 슬라이더 반응(M4) | AudioMixer 동작 여부 |
| 드랍 아이콘 | 드랍 아이템 그림 배경이 투명한지(M1) | WebGPU·WebGL2 각각 |
| 세이브 | 캐릭터 생성→1-1 진입→탭 닫기→다시 열기(M2) | 유지 여부 |
| 울트라와이드 | 창 3840×1080에서 HUD·캔버스 1x 캡처(L6) | 띠 여부 |
| API | `SystemInfo.graphicsDeviceType` 로그, WebGPU 끈 Chrome 플래그로 WebGL2 폴백 1회 | 두 경로 |
| 2D/3D | `NativeRemodel3D.Active` 로그(C3) | 어느 필드로 측정했는지 |

## 8. 대안 B — 웹 H5판(main `game.html`)

| 장점 | 단점 |
|---|---|
| 이미 브라우저 게임이고 Steam 라이브판이다. WebGL2/WebGPU/Canvas2D 자체 렌더러(`_initWebGPU`·`_initWebGL`·`_buildProxyX`), 세이브·언어 29개·입력·울트라와이드가 검증돼 있다 | 사용자가 화면을 "쓰레기통"으로 판정했고 CLAUDE.md §1은 웹에 새 디자인을 넣지 않는다고 정했다. B를 택하면 이 규칙을 사용자가 바꿔야 한다 |
| 용량·로딩·fps 실측이 있고(`docs/12퍼포먼스·최적화`) 호스팅(3333·Vercel·itch 빌드 스크립트 `build_itch.cjs`)이 준비돼 있다 | Unity에서 만든 HD-2D 필드·리그픽셀 영웅·드루이드·실버 헬 UI를 쓸 수 없다. 9주 일정(계획 §3)이 전부 Unity 기준이다 |
| 크래시 0·로딩 20초 조건을 거의 확실히 만족한다 | 두 코드베이스가 다시 갈라진다(10-27 분리 결정 역행). 비하인드 신의 "AI 파이프라인" 재료도 Unity 쪽에 있다 |
| 위험이 낮아 "제출 보험"으로 둘 수 있다 | 수상 가능성은 화면 품질에 달려 있어 B 그대로는 목표(품질선 유지)와 맞지 않는다 |

권고: A를 1주 실측(§7)으로 판정하고, B는 **제출 보험**으로만 둔다. A가 §4 조건을 못 넘으면 "A 범위 축소(WebGL2만, 적 리그 상한, 16:9만)"를 B보다 먼저 검토한다.

## 9. 출처

| 출처 | 접속 | 비고 |
|---|---|---|
| `docs/engine/UNITY_DEVTOOLS_MASTER_20261028.md`:138,183,191,198 | 읽음 | DT-16 웹 빌드 실측(175MB·10~14초·WebGPU) |
| `docs/engine/UNITY_HUD_WEBGPU_READBACK_20261028.md` | 읽음 | readback 결함·남은 곳 |
| `docs/engine/UNITY_INTRO_KEYS_20261028.md` | 읽음 | 웹 인트로 키 가설 |
| `docs/0마스터플랜/session_handoff/devtools-lead.md` | 읽음 | 웹 테스트 빌드 주소·남은 일 |
| 원격 브랜치 `claude/unity-pc-devtools-web-20261028`(`f564c7b`) `WebBuild.cs`·`vercel.json`·`index.html`·`run-web.ps1` | 읽음 | 10-28 빌드 설정 |
| https://docs.unity3d.com/6000.6/Documentation/Manual/webgl-technical-overview.html | **미접속**(DNS 차단), 검색 발췌 | 스레드·AOT·네트워킹·캐시 |
| https://docs.unity3d.com/6000.6/Documentation/Manual/WebGPU-limitations.html | 미접속, 검색 발췌 | 동기 readback 불가, 컴퓨트 제한 |
| https://docs.unity3d.com/6000.6/Documentation/Manual/web-multithreading-intro.html | 미접속, 검색 발췌 | 관리 스레드 없음, Timer 미동작, COOP/COEP |
| https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/develop/memory | 미접속, 검색 발췌 | 힙 증가·크래시, 초기 메모리 권고 |
| https://docs.unity3d.com/6000.2/Documentation/Manual/webgl-texture-compression.html | 미접속, 검색 발췌 | DXT/ETC2/ASTC, 소프트웨어 해제 |
| https://docs.unity3d.com/Documentation/Manual/webgl-deploying.html , …/webgl-server-configuration-code-samples.html | 미접속, 검색 발췌 | Brotli HTTPS, 헤더, 폴백 |
| https://docs.unity3d.com/Manual/webgl-video.html | 미접속, 검색 발췌 | VideoClip 미지원, URL만 |
| https://docs.unity3d.com/ru/Manual/webgl-audio.html (2022.x) | 미접속, 검색 발췌 | Web Audio 기본 기능, AAC 임포트, Microphone 미지원. AudioMixer·GetOutputData는 원문 미확인 |
| https://docs.unity3d.com/Packages/com.unity.inputsystem@1.4/manual/SupportedDevices.html | 미접속, 검색 발췌 | Web 키보드·마우스·표준 패드 |
| https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@16.0/manual/System-Requirements.html | 미접속, 검색 발췌 | 컴퓨트/SSBO 필수 |
| https://docs.unity3d.com/6000.6/Documentation/Manual/web-graphics-apis-intro.html | 미접속, 검색 발췌 | WebGL2 기본, WebGPU 수동 추가·폴백 순서 |
| https://docs.unity3d.com/ScriptReference/WebGLExceptionSupport.html | 미접속, 검색 발췌 | 예외 옵션 4종, None 성능 |
| https://support.unity.com/hc/en-us/articles/206619726 | 미접속, 검색 발췌 | Web은 OS 폰트 폴백 없음 |
| https://discussions.unity.com/t/unity-6-urp-froward-freezes-in-webgl/1574122 | 미접속, 검색 발췌(커뮤니티) | 포워드+ WebGL 멈춤 보고 |
| https://discussions.unity.com/t/unity-webgl-and-native-plugins-cant-build/945895 | 미접속, 검색 발췌(커뮤니티) | DllImport `__Internal`·undefined symbol |
| https://app.cinevva.com/id/news/2026-09-01-unity-6-6-webgpu-production | 미접속, 검색 발췌(2차 보도) | 6.6에서 WebGPU "실험" 표기 제거 — 공식 릴리스 노트로 확인 필요 |

## 10. 남은 일(이 감사 범위 밖)

1. PC 실측 빌드(§7) → 결과를 이 문서 §3.3·§4에 실측값으로 덮어쓴다.
2. C1·C3 수정은 유니티 총괄 배정(코드 변경이라 이 레인은 하지 않음).
3. `docs/15 세이브+데이터구조`·`16번역·로컬라이제이션/번역_가이드.md`에 웹 저장 위치·데모 언어 범위 절 추가(결정 뒤).
4. Mac이 공식 규정(브라우저 전용 여부)을 확인하면 §0 결론의 "조건부"를 다시 쓴다.

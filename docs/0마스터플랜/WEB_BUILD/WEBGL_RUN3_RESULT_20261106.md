# WebGL 3회차 결과와 4회차 후보 (3D 경로)

**목표 재정의(CTO, 2026-11-06): "300MB"는 내부 가정이었고 폐기한다.** 새 목표는 ① 총량이 포털 상한 안(≤500MB, `WEB_SIZE_CONVENTIONS_20261106.md`) ② 실제 지표는 첫 묶음 크기(관례 30~50MB)와 실제 호스트 첫 로딩 초다.

**현재(4회차, §7): data.br 525.7MB(501.3MiB)로 ①까지 약 26MB 남았고, 한 덩어리라 ②도 첫 묶음 = 총량이다. WebGPU는 3D로 정상 동작하지만 WebGL2는 지면이 안 그려져 이대로 제출할 수 없다.** 음질은 판정 전이다.

## 1. 3회차 영수증

기준 e0ff19191, `-scene3d true -webArgs --remodel3d`, 워크트리 미커밋, 빌드 39분, 런타임 코드 0. 영수증 `E:/exoduser-wt/webgl-build-run3-receipt.json`, 조치 `I:/EXODUSER-Storage/debug/webgl-20261105/run3/s3-receipt.json`, 복원 통과.

| 항목 | 2회차(2D) | 3회차(3D) |
|---|---|---|
| data.br | 687.1MB | **566.0MB** (565,963,743바이트) |
| wasm.br / framework.js.br | | 7.5MB / 0.08MB |
| 비압축 텍스처 mem 합(RGBA32+RGB24) | 2,103MiB | 1,471MiB |

측정은 로컬 서버·헤드리스·첫 로드다. 실제 호스트 값이 아니다. 프레임 간격은 화면 주사율에 묶이고 GPU 비용을 재지 않아 게임 fps 판정이 아니다.

| 항목 | WebGPU | WebGL2 |
|---|---|---|
| 3D 진입 (`[A2 전체필드]` 로그, 화면) | 정상 | 진입하나 **지면 실패** |
| 로드바 사라짐 | 15.2초 | 15.7초 |
| 1-1 유휴 60초 p50 / p95 / max | 8.3 / 12.5 / 33.4ms | 12.2 / 16.7 / 33.2ms |
| 전투 입력 1분 콘솔·페이지 오류 | 0 / 0 | 0 / 0 |
| 전투 중 100ms 초과 / 1초 초과 / 최대 | 1 / 0 / 204ms | 0 / 0 / 83ms |

화면: `docs/img/webgl-run3-webgpu-3d.jpg`, `docs/img/webgl-run3-webgl2-ground-fail.jpg`. 원본은 `run3/run-webgpu`, `run3/run-webgl2`.

### 조치 결과와 정정

| 조치 | 계획 | 실제 |
|---|---|---|
| 청크 패딩 | 64 | 64, DXT1Crunched. 리포트 256 → 8.6MiB |
| 리사이즈 | 30 | 30 크기 변경, 압축된 것 16. 나머지 14는 mip 때문에 비압축 유지 |
| 적 FBX 제외 | 32 | 32 |
| mip 끄기 | 100 | **0** |

**정정:** 조치 영수증의 mip 끄기 100건 `applied`는 틀렸다. `SourceTextureImporter.cs:43`이 `/ui/` 경로의 mip을 임포트 중 다시 켠다. `WebBuild.S3.cs`가 다시 읽어 확인하지 않아 잘못 기록됐고, 지금은 확인하게 고쳤다. CTO 결정으로 이 규칙은 유지한다. 텍스처 경로의 축소는 사실상 여기서 끝이다.

## 2. WebGL2 지면 실패 — 샘플러 목록 (수정은 Mac이 M1a와 함께)

로그(`run3/run-webgl2/console.log`): `GLSL link error: FRAGMENT shader texture image units count exceeds MAX_TEXTURE_IMAGE_UNITS(16)`. `HellGroundPBR`·`A2RootSurface` 각 32회. WebGPU에서는 0회다.

| 셰이더 | 선언·샘플 텍스처 | URP 텍스처 |
|---|---|---|
| HellGroundPBR | 20장 | 그림자·DBuffer·SSAO 등 키워드에 따라 추가, 개수 미집계 |
| A2RootSurface | 23장(위 20장 + `_ScanMap`·`_ScanNormal`·`_ScanARM`) | 같음 |

`HellGroundPBR`에서 `_FullField>.5`이면 알베도·노멀·거칠기가 뒤에서 덮어써져 결과에 안 쓰이는 텍스처(코드 읽기, 실행 미확인). 셰이더 `if`는 런타임 분기라 컴파일러가 샘플을 없애지 못하는 것으로 보인다(추정).

| 구분 | 텍스처 |
|---|---|
| `_FullField` 경로에서 씀 (11) | `_SoilMap` `_SoilNormal` `_SoilRough` `_RootMap` `_RootNormal` `_ForestMap` `_FieldMoss` `_FieldMossNormal` `_FieldMossRough` `_FieldSdf` `_FieldCover` |
| 결과에 안 쓰임 (9) | `_BaseMap` `_BumpMap` `_RockMap` `_AshMap` `_RockNormal` `_RockRough` `_ForestNormal` `_ForestRough` `_RootRough` |

다른 재질이 비-`_FullField` 경로를 쓰므로(`NativeGame.HellEnvironment.cs:41~50`) 지우기보다 경로별 키워드 분리가 후보다(추론). `A2RootSurface`는 수만 셌고 경로별로 나누지 않았다. 11장에 URP 텍스처를 더해 16 안에 드는지는 컴파일로 확인해야 한다. WebGL2에서 다른 셰이더 실패 로그는 이 둘뿐이었다(`Hidden/VFX`·`VoxelizeShader`의 미지원 안내는 별도 로그).

## 3. 오디오 Vorbis 프로브 (빌드 없음)

영수증 `I:/EXODUSER-Storage/debug/webgl-20261105/audio-probe/vorbis.txt`. 154개 전부 `BuildTargetGroup.WebGL` + Vorbis `set=False`. 대조: 같은 파일에 Standalone + Vorbis는 `set=True`, WebGL + AAC는 `set=False`. API가 배치 모드에서 막히는 것이 아니라 **WebGL 오버라이드 자체가 코덱과 무관하게 거부된다.** 오디오는 리포트 107.8MiB 그대로이고, 다음 수단은 공통 설정 임시 변경인데 CTO가 불허한 상태다. 대조 때 샘플 1개 `.meta`에 Standalone 오버라이드가 남아 되돌렸다(`git restore` 후 diff 0).

## 4. 필터 표의 실측 갱신

§4 표(`WEBGL_SIZE_TARGETS_20261105.md`)는 3회차 빌드 리포트 기준으로 갱신했다. 핵심 변화: **2D 청크는 패딩 후 8.6MiB(br 약 3.8)로 줄어 가드의 이득이 사라졌다.** 2D 청크가 3D에서 실제 로드되는지는 로드 로그가 없어 실행으로 확인하지 못했고, 코드 근거만 있다.

## 5. 4회차 후보 (설계만, 구현은 사용자 커밋 허용 뒤)

크기는 3회차 리포트 × 평균 비율 0.438의 추정이다(묶음별 실측 아님). 공통 전제: WebGL2 수정은 별도로 필요하다(§2).

### A. 첫 묶음 분할

| 경계 | 포함 | br 추정 |
|---|---|---|
| A1 로비까지 | 엔진 7.6, 셰이더 19.6, lobby 27, 캐릭터 선택 11.8, Startup 13.1, 로비 음악 11.5, 폰트 14.5, ui 루트 7.6, 기타 | **약 115MiB** |
| A2 1-1 튜토리얼까지 | A1 + a2 39, RM1 씬 37, 영웅 7.5, 튜토리얼 3.5, silver_hell 16.6, vfx 21.3 | **약 240MiB** |
| 나머지 | 패널, 보스, FullscreenWide, Loading, 나머지 BGM | 약 325MiB |

- **이 단순 분할로는 30~50MB에 못 들어간다.** A1도 약 115MiB다. 관례에 맞추려면 로비 원화·폰트·셰이더를 더 나눠야 하고, 그 값은 설계 시 재추정한다.
- 필요한 변경: Addressables는 설치돼 있지 않다(`Packages/manifest.json`). 어느 방식이든 파일을 Resources 밖으로 옮겨야 한다. `Runtime`의 `Resources.Load` 호출은 372개·104파일(캡처·검사 제외 98파일)이고 대부분 동기다.
- 설계안 A-1(권장): 단일 래퍼 `ExoRes.Load<T>`로 호출을 기계적으로 바꾸고, 필드 진입 전 전환 화면에서 AssetBundle을 내려받아 메모리에 둔 뒤 동기로 꺼낸다. 호출부를 비동기로 고치지 않아도 된다. 대기 지점은 `NativeTransitionPrepare.cs`와 `NativeGame.Remodel3D.cs`의 씬 로드. Core 0.
- 설계안 A-2: Addressables 비동기 전환. 호출부 대부분을 코루틴으로 바꿔야 해 위험이 크다.
- 위험: 동시성 없는 메모리 예산(WebGL 힙에 번들이 이중으로 올라갈 수 있음, 추정), 번들 호스팅 헤더, 놓친 호출은 런타임 예외. 방식의 출처 문서 대조는 아직 하지 않았다 [미검증].

### B. 런타임 필터 (가드·분기)

| 항목 | br 추정 | 변경 | 위험 |
|---|---|---|---|
| 2D 청크 가드 | **3.8** | `NativeGame.cs:405`(e0ff 기준) 스트리밍 분기, `:534` 예외 | 이득이 작아 **제외 권장** |
| inventory | 66.5 | `NativeInventory.cs:23,27` 필수 로드, `NativeGame.cs` 패널 열기 차단 | 장비 기능 상실, 튜토리얼 의존 미확인 |
| stat | 18.2 | 패널 열기 차단 | 같음 |
| skill + icons | 약 15 | 패널 차단, HUD 아이콘은 유지 | 튜토리얼이 스킬 장착을 쓰면 불가, 미확인 |
| forge | 1.8 | 패널 차단 | 낮음 |
| FullscreenWide 비-1-1 | 최대 60.6 | `Data/fullscreen_wide.json` 선택 경로, 누락 처리 미확인 | 1-1 사용분 미집계 |
| 보스전 제외 | 약 43 | 분기 | 1-1의 끝이 사라짐, 비권장 |

패널 4종을 빼면 약 102MiB로 data.br 약 460MB가 되지만, **CTO 결정으로 인벤토리·능력치·스킬 3패널은 제출판에 유지하므로 이 계산은 쓰지 않는다.** B에서 뺄 수 있는 것은 forge 1.8뿐이다. A 분할은 30~50MB에 못 들어가 제출 뒤 제품 과제로 기록만 한다.

## 6. 오디오·UI mip 프로브와 4회차 판정

**판정: 두 프로브 절감 합이 약 31~37MiB로 기준 50MiB 미만이라 4회차 빌드는 돌리지 않는다(CTO 조건).**

### 오디오 기본값 (빌드 없음, `audio-probe/default.csv`)

`SourceAudioImporter.cs`가 임포트 때 기본값을 덮어써, 임시 후처리기로 우회해 쟀다. 임시 파일은 지웠고 Audio 경로 `git status`는 0건이다.

| 항목 | 합계 |
|---|---|
| 원본 파일 | 132.1MiB |
| 현재 임포트 | 113.6MiB |
| 기본값 AAC q0.5 인메모리 | 85.8MiB |
| 기본값 Vorbis q0.5 인메모리 | 85.8MiB |

- **AAC와 Vorbis가 154개 전부 같은 크기다.** WebGL 대상은 포맷 요청과 무관하게 같은 결과를 내고, 달라지는 것은 품질 값뿐으로 보인다(추정, 문서 대조 전).
- 절감 27.8MiB. AAC는 br로 거의 줄지 않아 br 절감도 약 26MiB로 본다(추정). BGM 71.9 → 57.6, 로비 26.4 → 17.7, Startup 9.6 → 6.4.
- 음질 저하는 귀로 확인하지 않았다. 실제 빌드 크기는 빌드 전까지 모른다. 적용하려면 오디오용 후처리기가 빌드 때 필요하다.

### UI mip (코드 읽기, `run3/ui-mip-audit.csv`)

| 분류 | 파일 | 리포트 MiB |
|---|---:|---:|
| 1920×1080·3840×1080 둘 다 원본 크기 | 17 | 33.1 |
| 스케일됨 (제외) | 78 | 146.5 |
| 그리는 곳 없음 | 5 | 31.8 |

- 배율 규칙: `NativeUiSafeArea.cs:8` `min(w/1920,h/1080)`, `:13` `h/1080`. 대부분 큰 파일은 `stat_base` 0.9875처럼 1:1이 아니라 제외된다.
- 1:1 파일 절감은 br 약 5~11MiB다(§3 표본 비율, 추정).
- **조건의 함정: 웹 템플릿 기본 캔버스는 960×600이라 배율 0.5다.** 1:1 파일 중 16개가 그 크기에서 2배 축소되고 mip이 없으면 품질이 떨어질 수 있다. 1080 미만 창도 마찬가지다.
- 적용 비용: `SourceTextureImporter.cs:43`을 건드리지 않으려면 나중에 실행되는 후처리기가 필요하고, 전체 텍스처 재임포트를 부를 수 있다(추정). 이득에 비해 크다.

### 그리는 곳 없는 5개

- 코드·데이터 참조 없음(직접 재확인): `death/cat_portrait` 8.0, `death/crow_portrait` 8.0, `tutorial/parry-plaque-v1` 6.0. 합 22MiB, br 약 4~9MiB(추정). **런타임 변경 0으로 뺄 수 있는 후보다.**
- 로드만 하고 그리지 않음: `skill/window_base` 7.7, `tutorial/lesson_base` 2.1. 빼면 로드 결과가 null이 되는 처리를 확인해야 한다.

### 500MB까지의 후보 (CTO 판단)

data.br 566MB에서 500MB까지 약 63MiB가 필요하다. 모두 추정이다.

| 후보 | br 절감 | 런타임 변경 | 조건 |
|---|---:|---|---|
| 오디오 품질 0.5 | 약 26 | 0 | 음질 확인 |
| 참조 없는 3개 제외 | 4~9 | 0 | |
| UI mip 1:1 17개 | 5~11 | 0 | 작은 캔버스 품질, 재임포트 비용 |
| `ch1_1_r1r2_colormap_wide` POT 축소·압축 | 약 23 | 0 | 리포트 65.7MiB 최대 파일(RGBA32 4260×3031). 3D 재질이라 CTO가 앞서 mip 조치에서 제외한 부류. A2 화면에 보이는지 미확인, Mac 판정 필요 |
| 대장간 숨김 시 forge BGM 3곡 | 약 19 | 분기 가능성 | `NativeBgmCatalog.cs` 참조 정리 필요, 미확인 |

앞 4개를 합치면 약 58~69MiB로 500MB 근처다. 웹 캔버스 크기(960×600 기본값)를 키우는 템플릿 변경은 절감과 별개로 필요해 보인다.

**CTO 판단용 요약:** 총량 ≤500MB는 런타임 변경 없이 근접 가능하다. 첫 묶음은 A로만 풀리며 제출 뒤 과제다.

위 판정 뒤 CTO가 캔버스 결함 수정을 첫 항목으로 올려 4회차를 승인했다(§7). colormap 축소는 넣지 않고 Mac 판정으로 넘겼다.

## 7. 4회차 영수증

기준 e0ff19191, 3회차 조치 유지, 런타임 코드 0, 빌드 37분. 영수증 `E:/exoduser-wt/webgl-build-run4-receipt.json`, 조치 `I:/EXODUSER-Storage/debug/webgl-20261105/run4/s3-receipt.json`, 옵션 `s3-audit/run4-actions.json`.

| 항목 | 3회차 | 4회차 |
|---|---|---|
| data.br | 566.0MB | **525.7MB** (525,693,288바이트, 501.3MiB) |
| Build 전체(wasm·loader 포함) | 약 574MB | 약 533MB |
| 빌드 리포트 Complete build size | 803.5MB | 765.1MB |
| Textures / Sounds (리포트) | 995.2 / 113.6MB | 942.6 / 85.8MB |

| 조치 | 건수 | 전·후 | 상태 |
|---|---:|---|---|
| 캔버스 1920×1080 고정 | | 960×600 → 1920×1080 | 적용, 템플릿 텍스트만 |
| 오디오 기본값 q0.5 (1초 초과 클립) | 106 | 112.8 → 85.1MiB | `applied` 106, 음질 미판정 |
| UI mip 끄기 (1:1) | 17 | 파일별 영수증 | `applied` 17, 결과 다시 읽어 확인 |
| 제외 (적 FBX 32 + 참조 없는 3) | 35 | | `held` 35 |
| 청크 패딩·리사이즈 | 64 / 30 | | 3회차와 같음 |

**복원:** `git diff` 해시가 빌드 전과 일치한다(`fd67b0f56fe89e35`), `git status` 해시도 일치. Audio 경로 변경 0건, png·jpg·fbx 변경 0건, hold 폴더 비어 있음. 복원 직후 처음 잰 해시는 달랐고 다시 재니 두 번 다 일치했다. 첫 값의 원인은 미확인이다. 이 워크트리는 이전 회차의 메타 변경이 원래 남아 있어 "diff 0"은 "빌드 전과 같음"이라는 뜻이다.

### 측정 (로컬·헤드리스·첫 로드)

| 항목 | WebGPU | WebGL2 |
|---|---|---|
| 캔버스 | 1920×1080 | 1920×1080 |
| 3D 진입(`[A2 전체필드]`, 화면) | 정상 | 진입하나 **지면 실패 그대로**(샘플러 오류 64줄) |
| 로드바 사라짐 | 13.9초 | 14.7초 |
| 유휴 60초 p50 / p95 / max | 6.0 / 11.7 / 28.5ms | 5.5 / 11.5 / 24.0ms |
| 전투 1분 콘솔·페이지 오류 | 0 / 0 | 0 / 0 |
| 전투 100ms 초과 / 최대 | 1회 / 174ms | 0회 / 57ms |

프레임 간격은 주사율에 묶이고 GPU 비용을 재지 않으며, WebGL2 값은 지면이 빠진 화면이라 비교 대상이 아니다.

위 측정은 1920×1080 고정 템플릿 때의 값이다. 필러박스가 나와 CTO가 템플릿을 바꾸게 했다(아래).

### 창 맞춤 (재빌드 없이 `index.html`만 수정, WebGPU·헤드리스)

규칙: 높이 1080 고정, 폭은 창 비율대로, 상한 3840. 게임의 UI 규칙과 같다(`NativeUiSafeArea.cs:4` 디자인 1920×1080, `:13` `NativeUiEdgeArea` 배율 h/1080·폭 w/배율). 데스크톱은 `ProjectSettings.asset:88` 네이티브 해상도 기본값을 쓴다. `WebBuild.S3.cs`의 템플릿 치환도 같은 코드로 고쳤다.

| 창 | 캔버스(렌더 타깃) | CSS | 클릭 위치 | 결과 | 캡처 |
|---|---|---|---|---|---|
| 1280×720 | 1920×1080 | 1280×720 | 1080, 427 (환산) | 캐릭터 선택 진입 | `docs/img/webgl-run4-win-1280.jpg` |
| 1920×1080 | 1920×1080 | 1920×1080 | 1620, 640 | 캐릭터 선택 진입 | `docs/img/webgl-run4-win-1920.jpg` |
| 3840×1080 | 3840×1080 | 3840×1080 | 3380, 642 | 캐릭터 선택 진입 | `docs/img/webgl-run4-win-3840.jpg` |

- 콘솔 오류 0. 1-1 필드까지는 세 창에서 다시 재지 않았고, 3D 진입·프레임 값은 위 고정 템플릿 때 값이다.
- 3840×1080에서 로비 패널은 오른쪽에 붙는다. 첫 시험의 클릭 2580은 버튼이 없어 빗나갔고 3380으로 재시험했다. 판정 스크립트 오류이며 게임 문제가 아니다.
- **3840×1080에서 본 화면 문제(원인 미확인, 데스크톱 비교 안 함):** 로비 배경 가운데에 이음매, 캐릭터 선택 배경 오른쪽 약 240px 검은 띠가 보인다.
- 전체화면 버튼은 푸터와 함께 숨겼다.

화면: `docs/img/webgl-run4-webgpu-1920.jpg`, `docs/img/webgl-run4-webgl2-1920-ground-fail.jpg`.

### 음질 확인 절차 (사용자, 창은 자동으로 열지 않음)

```bash
node E:/exoduser-wt/webgl-tools/serve-run4.mjs
```

브라우저에서 `http://127.0.0.1:8090/`을 연다. 끝나면 Ctrl+C.

| 들을 소리 | 나는 때 | 비교용 원본 |
|---|---|---|
| `SFX/q_parry` | 패링 | `E:/exoduser-wt/claude-pc-webgl/unity/Assets/Exoduser/Resources/Audio/SFX/q_parry.mp3` |
| `SFX/monster_hit_flesh1` | 적 타격 | 같은 폴더 `monster_hit_flesh1.mp3` |
| `SFX/boss_howl1` | 보스전 | 같은 폴더 `boss_howl1.mp3` |

품질을 낮춘 것은 1초 초과 클립 106개뿐이다. 음악이 더 크게 영향받으니 로비 음악(`Audio/Lobby/lobby.mp3`, 5.9 → 3.9MB)도 함께 듣는 것을 권한다.

### 남은 판정

- 음질: 오디오를 듣지 못했다(무음 규칙). 효과음 3개 판정 필요. 품질 낮춘 것은 1초 초과 클립뿐이다.
- WebGL2 샘플러: Mac이 M1a와 함께 수정.
- `ch1_1_r1r2_colormap_wide`: A2 화면 노출 여부 Mac 판정(≤500MB의 남은 후보, br 약 23 추정).
- 호스트: 유료(S3+CloudFront)는 사용자 승인 항목. R2·VPS 약관 [미검증]. itch.io는 불가(압축 해제 총 500MB, 파일 200MB 초과). R2 캐시 한도 512MB도 현재 파일 크기가 넘는다.

# K4 과부하 테스트 설계 — 적 100마리, 10분, 60fps (2026-11-06)

사용자 요청(13:10, CTO 전달): "100마리 10분 전투 60프레임 과부하 테스트", "로우폴리 상위 도트".

이 문서는 **설계만** 다룬다. 실행, 설치, 로그인은 하지 않았다.
- 코드 위치의 기준은 커밋 `cf83c8a46`이다.
- UE 문서 출처 원본은 세션 scratchpad의 `k4/ue_research.md`다. WebFetch 요약으로 읽었기 때문에 인용 문장을 원문과 한 글자씩 대조하지는 않았다.
- 실행 주체: PC 세션은 Player도 UE도 실행하지 않는다. Unity 빌드는 사용자가 연다. UE 측은 Mac이나 사용자 창에서 돌린다(K3 결론).

## 1. 조건

| 항목 | 값 | 근거 |
|---|---|---|
| 동시 적 | 100마리, 10분 내내 유지 (죽으면 같은 자리 근처에 다시 스폰) | 사용자 요청 |
| 적 1체 예산 | 삼각형 [추정 10k], 본 [추정 ≤60], 텍스처 [추정 1024² 1벌]. MN 레인 `MONSTER_BUDGET_TIER` 수치가 오면 그 값으로 바꾼다 | MN 수치 미수신 |
| 애니메이션 | 100체 모두 걷기·공격 루프를 재생한다. 같은 프레임에 몰리지 않게 위상을 무작위로 둔다 | — |
| 피격·탄막 VFX 대역 | 동시 이펙트 상한 [추정 200], 파티클 총량 상한 [추정 20,000]. 피격 버스트는 적 1체당 초당 1회, 탄막은 화면에 투사체 [추정 300]개 | 상한값은 측정표에 실제 값을 기록한다 |
| 장면 | 1-1 키샷 장면(A2 숲 지면·고목·수면·안개). UE 쪽은 K3 키샷 장면 | MATERIAL_AUDIT_1-1, K3 |
| 카메라 | 1-1 카메라: 피치 34°, 거리 16.5u = 1900.8cm, 세로 FOV 46.945° | K3 §1.2 |
| 해상도 | 1920×1080, 창 모드, vsync 끔, 프레임 제한 없음 (60 고정이 아니라 남는 여유까지 잰다) | — |
| 길이 | 워밍업 30초는 버리고, 그 뒤 10분을 기록한다 | — |
| 합격선 | 프레임 시간 p95 ≤ 16.7ms. 1초 이상 정지 0회. 메모리는 10분 동안의 추이(시작과 끝의 차이, 기울기)를 기록하고 단조 증가 여부를 표시한다 | 사용자 요청 |
| 소리 | 끔 (PC 규칙). UE는 `-nosound`가 5.8 문서에 없으므로 [미검증], 대신 마스터 볼륨 0 | K3 §2 |

## 2. Unity 측

### 2.1 지금 있는 것 (파일:줄)

| 용도 | 위치 | 사실 |
|---|---|---|
| 적 스폰 API | `unity/Assets/Exoduser/Runtime/Core/Simulation.EnemyBridge.cs:16` `SpawnEnemy(x,y,etype,room,countSpawned,el)` | Core 그대로 사용 |
| 적 상한 | `Core/Simulation.EnemyCap.cs:14` `EnemyHardCap = 800, EnemyCapTarget = 700` | 100마리는 상한 아래 |
| 하네스 스폰 예 | `Runtime/NativeGame.FieldCompare.cs:50`, `NativeGame.Hd2dCapture.cs:41`, `NativeGame.M1Check.cs:383` | 모두 `--unity-qa-sandbox` + 절대 경로 `-output`이 있어야 돈다 |
| 격리 인자 | `Core/Platform/QaRunPolicy.cs:9` `--unity-qa-sandbox` | 세이브 격리 |
| 프레임 측정 | `Runtime/NativePerfProbe.cs:11-42` `--unity-perf-probe -output <dir>` → `<dir>/perf-probe.json` | 구간별 `avgFps, p50Ms, p95Ms, p99Ms, maxMs`, CPU main/render, GPU(FrameTimingManager), Draw/SetPass/Batches/Triangles/Vertices/Shadow Casters/Visible Skinned Meshes를 기록 (`:19-20`). `--perf-off shadows`로 그림자 A/B (`:14`, `:36`) |
| 구간 이름 | `Runtime/NativeGame.PerfProbe.cs:9` `PerfSegment()` | 게임 상태별 버킷 |
| 적 렌더 | `Runtime/NativeEnemyRigRenderer.cs:5` | "one Point RT per visible actor"(보이는 적 1체당 RT 1장)이다. 100체면 RT 캡처도 100번 돈다 |

**없는 것:** 100마리를 10분 유지하는 하네스는 없다. 위 스폰 예들은 수 마리 단위의 검수용이다.

### 2.2 추가할 하네스 (설계)

- 플래그: `--unity-loadtest 100 --loadtest-seconds 600` (가칭). `--unity-qa-sandbox`, 절대 경로 `-output`과 함께 줄 때만 동작한다. 기존 QA 관례(`NativeGame.Hd2dCapture.cs:25`)를 따른다.
- 동작:
  1. 1-1 필드에 진입한다(`--remodel3d`).
  2. 영웅 주변 반경 [추정 8u] 안의 보행 가능 칸(`Map.CanMove`)에 `SpawnEnemy`로 100체를 만든다.
  3. 적이 죽으면 다음 틱에 다시 스폰해 100을 유지한다.
  4. 영웅은 무적(`p.Iframes`, `NativeGame.M1Check.cs:390` 관례)으로 둔다. 자동 공격 입력은 `StepInput` 관례를 따른다.
- 이펙트 대역: 기존 피격·스킬 VFX 경로를 그대로 쓴다. 동시 이펙트 수와 파티클 수는 매초 로그에 남긴다.
- 기록:
  - `NativePerfProbe`를 같이 켜서 p50/p95/p99/max를 얻는다.
  - 1초 이상 정지는 `maxMs`와 프레임별 원자료로 센다. 원자료 덤프는 지금 없고, 프로브에 `--perf-raw`를 추가하는 설계다.
  - 메모리는 10초마다 `Profiler.GetTotalAllocatedMemoryLong`, `GetTotalReservedMemoryLong`, `GC.GetTotalMemory`를 csv로 남긴다.
- Profiler 기록 (선택):
  - Development Build + Autoconnect Profiler로 빌드하고 `-profiler-enable -profiler-log-file <path>.raw`로 실행하는 방법이 있다 [Unity 문서 인용 안 함, 미검증].
  - 10분 raw 파일은 크다. 프로브 json을 기본으로 쓴다.

### 2.3 실행 명령 (사용자가 연다)

```
<빌드폴더>\EXODUSER.exe -force-d3d11 --remodel3d --unity-qa-sandbox <격리폴더> -output <결과폴더> --unity-perf-probe --unity-loadtest 100 --loadtest-seconds 600 -screen-width 1920 -screen-height 1080 -screen-fullscreen 0
```

- `-force-d3d11 --remodel3d`는 데스크톱 인자다(`unity-jobs/bin/README.md:168`).
- `--unity-loadtest`는 아직 없는 플래그다. 하네스를 구현하기 전에는 이 명령이 그대로 돌지 않는다.
- 비교군: 같은 명령에 `--perf-off shadows`를 붙인 것.

## 3. UE 측 합성 테스트 (Core 없음)

| 단계 | 절차 | 출처 (UE 5.8 공식) |
|---|---|---|
| 스폰 | Python `unreal.EditorActorSubsystem.spawn_actor_from_class(cls, location, rotation, transient)`로 100개를 만든다. 런타임에는 BP "Spawn Actor from Class"를 루프로 돌린다 | python-api/class/EditorActorSubsystem; BlueprintAPI/Game/SpawnActorfromClass |
| 애니 | SkeletalMeshComponent에 AnimSequence를 붙인다. 구성 스크립트에서는 `override_animation_data`를 쓴다(`play_animation`·`set_animation_mode`는 일시 상태라서) | python-api/class/SkeletalMeshComponent |
| 애니 예산 (비교군) | Animation Budget Allocator 플러그인 + Component Class `SkeletalMeshComponentBudgeted`, `a.Budget.BudgetMs` 기본 1.0. 등록하면 URO가 꺼진다(C++ 주석) | animation-budget-allocator-in-unreal-engine |
| Nanite 스켈레탈 | 5.8 문서에 "Nanite Skeletal Mesh" 절이 있다(애니 LOD만 쓰고 지오메트리 LOD와 모프 타깃은 안 됨). 성숙도 표기는 [미검증]. 비교군 1개로 둔다 | nanite-virtualized-geometry-in-unreal-engine |
| VFX 대역 | FX > Niagara System > "Simple Sprite Burst" 템플릿. GPU 시뮬은 Sim Target `GPUComputeSim` + Fixed Bounds. 상한은 Effect Type 예산(Budget Scaling 4종)과 `max_gpu_particles_spawn_per_frame`로 건다. 문서에 "Max particles"라는 이름의 속성은 없다 | how-to-create-a-gpu-sprite-effect-in-niagara; performance-budgeting-using-effect-types-in-niagara; scalability-and-best-practices-for-niagara |
| 기록 | `-trace=default,memory -tracefile=<path>.utrace -statnamedevents`. 메모리 채널은 프로세스 시작부터 켜 둬야 한다. 콘솔 `Trace.Start/Stop`. 10분을 자동으로 끊는 옵션은 문서에 없다 [미검증] → 시퀀스나 타이머로 10분 뒤 `Trace.Stop` | trace-quick-start-guide; memory-insights; unreal-insights-reference |
| CSV 추출 | `UnrealInsights.exe -OpenTraceFile=<utrace> -AutoQuit -NoUI -ExecOnAnalysisCompleteCmd="@=export.rsp"`. rsp에 `TimingInsights.ExportThreads`, `ExportTimingEvents`, `ExportTimerStatistics`를 넣는다(문서 한 곳에 `ExporTimers` 오타가 있음) | timing-insights; using-the-timers-and-counters-tabs |
| 보조 | `stat unit`, `stat fps`. LLM은 `-LLM -LLMCSV`. `csvprofile`은 4.27 문서에만 있다 [5.8 미검증] | stat-commands; using-the-low-level-memory-tracker; csv-profiler(4.27) |
| 렌더 설정 | Lumen GI·반사와 VSM은 새 프로젝트에서 기본으로 켜져 있다(공식). `r.Shadow.Virtual.Enable`은 문서에 있다. `r.Nanite`, `r.DynamicGlobalIlluminationMethod`, `r.ReflectionMethod`의 5.8 기본값은 [미검증]. sg.*는 5.8 레퍼런스에 PostProcess/Shadow/Texture/Effects 4개 그룹, 0~3단계만 나온다 | lumen-global-illumination-and-reflections; virtual-shadow-maps; scalability-reference |

실행 조합 (각각 10분):
- A: 기본값 (Lumen + VSM + Nanite 정적 지형)
- B: A + Animation Budget Allocator
- C: A에서 Lumen을 끄고 VSM 대신 기존 그림자 맵 사용

각 조합의 실제 설정값은 결과 표에 함께 기록한다.

## 4. 측정 공통

### 4.1 하드웨어 기록

| 기기 | 값 |
|---|---|
| PC (11-06 실측, WMI·레지스트리) | Intel Core i9-14900KF (24코어/32스레드), RAM 64GB (2×, 6400), AMD Radeon RX 9070 XT 15.9GB (드라이버 32.0.32015.7029), Windows 11 Pro 10.0.26300, 데스크톱 5120×1440@240 |
| Mac | M 시리즈 칩 이름, GPU 코어 수, 통합 메모리, macOS 버전 — Mac 담당이 `system_profiler SPHardwareDataType SPDisplaysDataType`로 채운다 [미기록] |

### 4.2 프레임 시간 분포 산출 (공통 스크립트 설계)

- 입력:
  - Unity: `perf-probe.json`, 그리고 원자료 csv(`--perf-raw`가 생긴 뒤)
  - UE: Insights에서 내보낸 프레임 csv (Frames 트랙의 프레임별 시간)
- 출력 지표:
  - 프레임 수, 평균 fps, p50/p95/p99/p99.9/max (ms)
  - 16.7ms 초과 비율, 33.3ms 초과 횟수
  - 1초 이상 정지 횟수와 시각
  - 메모리 시작/끝/최대, 선형 기울기(MB/분)
- 구현: Node 또는 Python 하나. 워밍업 30초는 잘라낸다. 같은 스크립트로 두 엔진을 계산한다.

### 4.3 결과 표 틀

| 엔진·조합 | 기기 | 적 수(평균/최소) | 동시 이펙트·파티클(최대) | 평균 fps | p50 | p95 | p99 | max | >16.7ms 비율 | ≥1s 정지 | 메모리 시작→끝(기울기) | 합격 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Unity 기본 | PC | | | | | | | | | | | |
| Unity 그림자 끔 | PC | | | | | | | | | | | |
| UE A | Mac/PC 창 | | | | | | | | | | | |
| UE B | | | | | | | | | | | | |
| UE C | | | | | | | | | | | | |

## 5. "로우폴리 상위 도트" 대역 1체

### 5.1 Unity 현행 값

CTO가 말한 "PixelActorPass"라는 이름의 코드는 이 커밋에 없다. 해당하는 코드는 리그 픽셀 경로다.

| 항목 | 값 | 위치 |
|---|---|---|
| 영웅 캡처 | 직교 카메라 1대, `enabled=false`, 투명 배경 | `Runtime/NativeRigPixelHero.cs:50-51` |
| RT | 정사각형, `ARGB32`, Linear, `filterMode=Point`, AA 1, 밉 없음 | `NativeRigPixelHero.cs:226` |
| RT 크기 | `ceil(worldExtent/(wpp·texelScale)/32)·32`, 최소 64, 1024를 넘으면 0(대체 경로로 넘어감). 영웅은 worldExtent 5.6u | `NativeRigPixelPolicy.cs:16-21`, `NativeRigPixelHero.cs:223` |
| 텍셀 배율 | `max(1, screenHeight/1080)` (1080p에서 1) | `NativeRigPixelPolicy.cs:15` |
| wpp | 화면 1px에 해당하는 월드 길이 (발 위치에서 잼) | `NativeRigPixelHero.cs:222` |
| 격자 맞춤 | 발 기준선을 텍셀 정수배로 맞추고 `_RigPixelGrid`를 전역으로 설정 | `NativeRigPixelHero.cs:228-238` |
| 적 | 공유 캡처 카메라 1대, 격리 레이어, 보이는 적마다 Point RT 1장 | `NativeEnemyRigRenderer.cs:5`, `:25-26`, `:97` |
| 켜는 인자 | `RigPixelRequested`, `NativeRigPixelPolicy.Requested(args)` | `NativeGame.RigPixel.cs:7` |

### 5.2 UE 대응 (문서 기준)

| 단계 | 설정 | 출처 (5.8) |
|---|---|---|
| 캡처 | `SceneCaptureComponent2D`를 직교로 둔다. Capture Source는 SCS_* 중 Final Color 계열 또는 SceneColor HDR(알파 포함) | API/Runtime/Engine/ESceneCaptureSource; python-api SceneCaptureComponent2D |
| 대상만 찍기 | `PrimitiveRenderMode = PRM_USE_SHOW_ONLY_LIST` + ShowOnlyActors에 캐릭터 대역 1체 | python-api SceneCapturePrimitiveRenderMode |
| 저해상도 RT | `TextureRenderTarget2D` 크기는 Unity 식과 같게 계산한다. `filter = TF_NEAREST`, 밉 없음 | python-api TextureRenderTarget2D; TextureFilter |
| 화면 합성 | 카메라를 향한 평면 머티리얼(Unlit, Masked, RT 샘플 Nearest) 또는 UMG Image | python-api Image |
| 비용 | 문서에 있는 것: `capture_every_frame`과 수동 `capture_scene`을 함께 쓰면 중복된다는 점, RT 포맷에 따라 메모리가 최대 16배 커진다는 점. SceneCapture가 VSM 캐시를 매 프레임 무효화한다는 보고는 포럼에만 있다 [비공식] | python-api SceneCaptureComponent2D; forums 2600436 |
| 절차 | 1) K3 키샷 장면에 대역 1체(로우폴리 스켈레탈 + 걷기 애니)를 둔다. 2) 위 캡처와 RT를 붙인다. 3) 발 기준 격자 맞춤은 Unity `NativeRigPixelHero.cs:228-238`의 식을 BP로 옮긴다. 4) 1920×1080 키샷과 K4 조합 A에 같이 넣고, 캡처 1회에 드는 GPU 시간을 Insights로 따로 잰다 | — |

5.8 SceneCapture how-to 페이지는 열지 못했다 [미검증]. 위 단계는 API 페이지만으로 구성한 것이다.

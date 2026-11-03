# Unity 프레임 최적화 총괄 — 2026-11-03 착수

사용자 지시(2026-11-03): "유니티 프레임 최적화 총괄". 담당은 Mac Claude 총괄이다. 브랜치 `claude/unity-frame-opt-20261103`(기준 `origin/unity/main` `34ce305eb`), 작업본 `~/exoduser-wt/UNITY-PERF-20261103`, 산출물 `~/exoduser-wt/_out/UNITY-PERF-20261103/`.

## 1. 목표와 합격선

| 항목 | 합격선 | 비고 |
|---|---|---|
| 1-1 실플레이(필드·아레나) 프레임 비용 P95 | ≤ 16.7 ms (60 FPS 유지) | 무제한(cap 해제) 측정의 실제 프레임 시간 |
| P99 | ≤ 25 ms | |
| 100 ms 초과 프레임 | 0 (스테이지 전환 로딩 구간 제외) | 로딩 구간은 따로 표기 |
| 500 ms 초과 프레임 | 0 (전체) | 로딩 포함 |
| 전투 중 GC 할당 | 평균 ≤ 1 KB/프레임, GC 수집 ≤ 1회/분 | Mono 증분 GC |
| 화면·동작 | 웹·직전 Unity와 동일 | 최적화는 그림·수치·판정을 바꾸지 않는다 |

기준 기기: Mac = MacBook Pro M5 Pro / 24 GB / Metal / ARM64. PC = RX 9070 XT / D3D11 / x64(사용자 바탕화면 실행본과 같은 `--remodel3d -force-d3d11`).

## 2. 측정 장치 PERF-U0

| 구성 | 위치 | 내용 |
|---|---|---|
| 계측 스위치 | `Runtime/PerfProbe.cs` | `--unity-perf` 인수가 있을 때만 켠다. 꺼져 있으면 구간 호출은 정적 bool 1회 비교이고 할당 0 |
| 프레임 기록기 | `PerfRecorder`(같은 파일) | 프레임마다 실제 벽시계(직전 프레임 끝→이번 프레임 끝), FrameTimingManager CPU 메인/렌더 스레드·GPU, GC 수집 횟수, GC 할당(기록기가 유효하면 `GC Allocated In Frame`, 아니면 `GC Used Memory` 증가분), Draw Calls·Batches·SetPass·Triangles, 단계(로비/필드/아레나/로딩), 살아 있는 적 수를 기록한다. 종료 때 `perf-frames.csv`, `perf-log-events.tsv`(셰이더 업로드·오류 로그와 그 프레임), `perf-meta.json`을 쓴다 |
| 구간 시간 | `NativeGame.cs`, `NativeGame.Remodel3D.cs` | Update 전체, FixedUpdate 시뮬 틱(Simulation.Tick + StageFlowPump + DispatchFeedback), UpdateViews, StreamChunks, NativeGame.OnGUI 전체와 호출 횟수, hud.Draw, Remodel3D LateUpdate. 구간은 겹칠 수 있다(Views·Chunks ⊂ Update, Hud ⊂ Gui) |
| 프레임 상한 | 기록기 | 기본 무제한(`targetFrameRate=-1`, vSync 0)으로 비용을 잰다. `-perf-cap N`이면 N 유지 |
| 완주 QA 연동 | `NativeGame.FullRunQa.cs` | `--unity-perf`와 함께 쓰면 PNG 저장·2560/3840 해상도 전환을 하지 않는다. 경로 탐색기의 421² 배열은 재사용한다(결과 동일) |
| 프로젝트 설정 | `ProjectSettings.asset` `enableFrameTimingStats: 1`, `GraphicsSettings.asset` `m_LogWhenShaderIsCompiled: 1` | 프레임 타이밍 통계와 셰이더 업로드 로그. 둘 다 실행 비용이 무시할 수준이다 |
| 분석 | `unity/Tools/perf/analyze.py` | 단계별 평균 FPS, P50/P95/P99/최장, 33/100/500 ms 초과 수, CPU·GPU P95, 할당·GC, 드로우콜, 구간 평균·P95, 50 ms 초과 긴 프레임 상위 30개와 그 프레임의 구간·GC·셰이더 이벤트. `--compare <기준>`으로 전후 비교 |
| Mac 실행 | `unity/Tools/perf/run-mac.sh` | 다른 Unity Editor·Player가 없을 때까지 기다린 뒤 1회 실행. 1920×1080 창, 무음, 격리 세이브, 테스트 번들에만 App Nap 해제 후 복원 |

PC 실행(공용 실행기, 숨은 데스크톱): 이 브랜치로 정식 빌드한 뒤 아래 1회. 분석은 같은 `analyze.py`.

```powershell
& ./unity/Tools/devtools/exo-unity.ps1 player -Worktree '<이 브랜치 checkout>' -Owner unity-perf-u0 -Exe '<빌드>/EXODUSER-Unity.exe' -Args '--unity-fullrun-qa,--unity-perf,--remodel3d,-force-d3d11,-output,<출력>' -TimeoutSec 1800
```

사람이 직접 플레이하며 재는 방법: 실행본에 `--unity-perf --unity-qa-sandbox <폴더>`를 붙여 띄우고 평소처럼 플레이한 뒤 종료하면 `<폴더>/perf/`에 같은 파일이 생긴다.

기존 완주 QA 수치(PC 2026-11-02 자연12: 평균 78.51 FPS, P95 16.94 ms, P99 94.01 ms, 최장 8221.75 ms, 500 ms 초과 95개)는 10초마다 PNG를 저장하고 해상도를 바꾸는 QA 동작과 경로 탐색기 할당이 섞인 값이다. 제품 성능 기준선으로 쓰지 않는다.

## 3. 운영 규칙

- 최적화 한 단위 = 한 원인. 같은 측정 장치로 전후를 잰다. 개선 없거나 악화면 되돌린다.
- 그림·수치·판정 불변: 전후 같은 장면 캡처 대조, 관련 oracle·스모크 1회. 실패 테스트를 고치지 않고 다시 돌리지 않는다. 같은 테스트 2회 실패면 멈추고 보고한다.
- 전체 완주는 기준선 1회, 통합 직전 1회만. 단위별 전후 비교는 짧은 완주(`-qa-max-ticks`)로 한다.
- 다른 담당 소유 파일은 최소 hunk만 고친다. 큰 구조 변경은 `docs/engine/unity_patches/`로 넘긴다.
- Codex 주간 한도(2026-11-03 19:40 기준 82%, 11-08 09:56 초기화, 크레딧 0)를 고려해 측정 장치와 분석은 총괄이 직접 하고, Codex는 개별 수정 단위에만 쓴다.

## 4. 병목 후보 — 정적 조사(2026-11-03, 실측 전)

실행·프로파일 없이 코드만 읽은 후보다. 순위와 채택은 PERF-U0 실측으로 확정한다. 경로는 `unity/Assets/Exoduser` 기준.

### 4.1 멈춤(100 ms 이상) 후보

| ID | 후보 | 위치 | 이유 |
|---|---|---|---|
| H1 | 완주 QA 장치 자체 | `Runtime/NativeGame.FullRunQa.cs` 212(경로 탐색), 261(정책 파일 60틱마다 읽기), 144(equipment.jsonl 추가) | 재탐색마다 421² 배열과 최대 약 140만 회 CanMove. 캡처 표시가 없어 "빈 표기 긴 프레임"으로 집계됨. 제품 결함 아님 |
| H2 | 보스 이펙트 시트 첫 사용 로드 | `Runtime/NativeDruidArt.cs:22`, `Runtime/NativeBossView.cs:28-32,110` | 4608×3072 RGBA32 비압축(장당 약 57 MB) 동기 로드. Resources 텍스처 911장 중 744장 비압축 |
| H3 | 적 방향 아틀라스 첫 사용 로드 | `Runtime/NativeGame.cs` SpriteFor, `NativeGame.FieldBoss.cs:26` | 걷기 아틀라스 8192×1280 비압축(약 40 MB) × 8방향, 적이 새 방향을 볼 때 처음 로드 |
| H4 | 아레나 입장·출구 개방 한 프레임 작업 | `NativeGame.StageFlow.cs:105-123`, `NativeArenaView.cs:32-60`, `NativeGame.HellArenaLighting.cs:16-55`, `NativeGame.Remodel3D.cs:93` | 적 뷰·지면 청크 전체 파괴, 1536×1376 마스크 CPU 블러 6회 + SetPixels32/Apply 2회, 리그·조명·재질(Shader.Find) 생성, 3D 씬 전체 활성 전환 |
| H5 | 전투 자동 저장 | `NativeGame.CombatSave.cs:20,119-127`, `Core/CombatSaveStore.cs:84-90,111` | 30초마다 + 요청 5초 뒤 주 스레드에서 원자적 쓰기 2회(flush), 백업 복사·삭제 |
| H6 | 드롭 아이콘 첫 생성 | `NativeGame.WorldDrops.cs:31,40-72` | Blit → ReadPixels(GPU 대기) → CPU 채우기 → Apply |
| H7 | 셰이더 예열 없음 | 프로젝트 전체 | ShaderVariantCollection·WarmUp 0, `m_PreloadedShaders: []`. VFX·데칼·스킬 셰이더 첫 사용 때 컴파일 |
| H8 | 긴 프레임 뒤 틱 몰림 | `ProjectSettings/TimeManager.asset` Maximum Allowed Timestep 0.333 | 한 번 멈추면 다음 프레임에 FixedUpdate 최대 20회 |

### 4.2 상시 프레임 비용 후보

| ID | 후보 | 위치 | 이유 |
|---|---|---|---|
| S1 | 3D 필드에서 카메라 3대 | `NativeGame.cs:55`, `NativeGame.Remodel3D.cs:103-105`, `A2RiverReflection.cs:27,49` | 2D 카메라가 빈 culling mask로 계속 clear·후처리, 강 반사 960×540 깊이 렌더 |
| S2 | PC 렌더 설정 | `Rendering/URP_PC_High*.asset` | MSAA 4x+HDR, 주광 2048·3캐스케이드, 추가광 4096 soft shadow, DBuffer 데칼(깊이 프리패스), SSAO 전해상도+depth-normals, 안개 전체 화면 복사, soft shadow 추가광 약 10개(점광원 6면) |
| S3 | 매 프레임 SpriteRenderer 전수 검색 | `NativeGame.Remodel3D.cs:149`(FindObjectsByType), `:124`(GetComponent) | 모든 스프라이트 배열 할당 + 자세 재설정 |
| S4 | 적 뷰 갱신 할당 | `NativeGame.cs` SpriteFor(적마다 키 문자열 2회), ColorUtility 파싱, `NativeHd2D.cs:58-130`, `NativeGame.HellLighting.cs:94`(배열 할당), `NativeGame.A2Enemies.cs:24-40`(그림자 메시 매 프레임 재생성) | 적 상한 800 |
| S5 | IMGUI HUD 할당 | `NativeRegionHud.cs:126,146-158`, `NativeFieldHud.cs:21,147-148`, `NativeGame.cs` OnGUI(new GUIStyle, 적 체력바, d.amount.ToString), `NativeUiAudit.cs:50,217` | OnGUI는 프레임당 최소 2회(Layout·Repaint). 글자 단위 그리기 + 8방향 그림자, 문자열 스타일 키 |
| S6 | 시뮬레이션 할당·O(n²) | `Core/Simulation.cs:145`(Enemies.ToArray 매 틱), `Core/Simulation.EnemyAi.cs:233-243`(선형 검색 + 새 List), `Core/EnemyAi.cs:737`, `Core/Simulation.EnemyBridge.cs:70-92`(명중마다 클로저 약 30개), `NativeGame.WorldViewport.cs` | |
| S7 | 생성·파괴 반복, 매 프레임 컬렉션 | `KiSlashView.cs`, `NativeBoltView.cs`, `NativeGame.WorldDrops.cs`, `NativeGame.cs` StreamChunks(HashSet·List 매 프레임, 3D 모드에서도 1024² 비압축 지면 청크 로드·해제) | |
| S8 | 스크립팅 백엔드 Mono | `ProjectSettings.asset` scriptingBackend 기본 | IL2CPP 전환은 C# 시뮬·뷰 CPU 비용 전반을 줄이는 후보. 빌드 시간·디버깅·플러그인 영향 검토 필요 |

## 5. 작업 단위와 파일 소유

| 단위 | 범위 | 소유 파일 | 순서 |
|---|---|---|---|
| U0 | 측정 장치 + Mac 기준선 | `PerfProbe.cs`, `Tools/perf/*`, 구간 hunk | 1 (총괄 직접) |
| U1 | QA 장치 비용 분리(H1) | `NativeGame.FullRunQa.cs` | 2 — 기준선 해석에 필요 |
| U2 | 텍스처 압축·사전 로드(H2·H3·H6) | 텍스처 `.meta`, `NativeDruidArt.cs`, `NativeBossView.cs`, 로딩 경로 | 실측 순위대로 |
| U3 | 셰이더 예열(H7) | 새 `ShaderVariantCollection`, `GraphicsSettings` 사전 로드 | 실측 순위대로 |
| U4 | 아레나 전환 분산(H4) | `NativeGame.StageFlow.cs`, `NativeArenaView.cs`, `NativeGame.HellArenaLighting.cs` | |
| U5 | 저장 비동기화(H5) | `NativeGame.CombatSave.cs`, `Core/CombatSaveStore.cs` | |
| U6 | 적·액터 뷰 할당 제거(S3·S4·S7) | `NativeGame.cs` UpdateViews 범위, `NativeGame.Remodel3D.cs`, `NativeHd2D.cs`, `NativeGame.A2Enemies.cs` | |
| U7 | HUD 할당 제거(S5) | `NativeGame.cs` OnGUI 범위, `NativeHud*`, `NativeFieldHud.cs`, `NativeRegionHud.cs`, `NativeUiAudit.cs` | U6과 `NativeGame.cs`를 나누므로 동시 진행 금지 |
| U8 | 시뮬 할당·공간 검색(S6) | `Runtime/Core/*` | 웹 판정 동일성 oracle 필수 |
| U9 | 렌더 설정·카메라(S1·S2) | `Rendering/*.asset`, `HellFogFeature.cs`, `HellSsaoFeature.cs`, 카메라 생성부 | 그림 변화 가능 → 디자인 판정 필요 |
| U10 | IL2CPP 시험(S8) | `ProjectSettings.asset` | 별도 빌드로 비교만 |

## 6. Mac 기준선 R1 — 2026-11-03 19:51 (소스 = 이 브랜치 PERF-U0, 기반 `34ce305eb`)

실행: `run-mac.sh`, ARM64 정식 빌드(release, 오류 0), `--remodel3d --unity-fullrun-qa --unity-perf`, 1920×1080 창, 무제한, Ultra 품질, Apple M5 Pro / Metal. 결과 `player-death`(아레나 사망 6회·재도전 5회, 648초). 다른 Unity 프로세스 0. 원본 `~/exoduser-wt/_out/UNITY-PERF-20261103/r1-baseline-full/`(perf-frames.csv 154,339프레임, perf-summary.md).

| 지표 | 실플레이 | 필드 | 아레나 | 스테이지 로딩 | 로비·시작 |
|---|---|---|---|---|---|
| 평균 FPS | 205.8 | 133.8 | 344.8 | 637.7 | 600.3 |
| P50 / P95 / P99 ms | 3.04 / 10.69 / 14.14 | 7.18 / 12.61 / 15.93 | 2.77 / 3.79 / 4.45 | 1.35 / 3.08 / 5.94 | 0.73 / 1.34 / 2.08 |
| 최장 ms | 125.4 | 125.4 | 122.3 | 258.0 | 4568 |
| 100 ms 초과 / 500 ms 초과 | 2 / 0 | 1 / 0 | 1 / 0 | 6 / 0 | 3 / 3 |
| CPU 메인 P95 / GPU P95 ms | 7.51 / 8.90 | 10.20 / 10.60 | 3.71 / 2.25 | 3.03 / 1.14 | 1.31 / 1.01 |
| 할당 바이트/프레임 평균 | 80,469 | 93,624 | 70,763 | 75,743 | 40,445 |
| GC 수집/분 | 791 | 717 | 933 | 1,348 | 1,236 |
| Draw Calls / SetPass 평균 | 1,888 / 1,560 | 1,301 / 542 | 2,327 / 2,322 | 291 / 274 | 152 / 152 |
| 살아 있는 적 평균 | 19.9 | 45.2 | 1.0 | 1.0 | 0 |
| 구간 평균 ms Gui / Views / Update / R3Late / FixedSim / Hud / Qa | 2.09 / 0.36 / 0.32 / 0.24 / 0.06 / 0.18 / 0.09 | 1.87 / 0.72 / 0.60 / 0.55 / 0.13 / 0.22 / 0.21 | 2.26 / 0.10 / 0.11 / 0.01 / 0.01 / 0.15 / 0 | | |
| 구간 P95 ms Gui / Views | 3.40 / 1.09 | 5.67 / 1.23 | 3.16 / 0.16 | 1.76 / 0.09 | |

긴 프레임(50 ms 초과 19개) 요약:

| 시점 | ms | 위치 | 주 구간 | 판단 |
|---|---|---|---|---|
| 4.6 s | 4568 | 로비 뒤 첫 월드 생성 | Views 248, Chunks 143, GC 190회 | 시작 로딩. 한 프레임 정지 → 분할/로딩 화면 후보 |
| 15.3 s / 5.8 s | 2543 / 747 | 시작 흐름 | 구간 밖(영상·씬 로드 추정) | 시작 로딩 |
| 404~620 s × 6 | 142~258 | 아레나 입장(첫 입장 + 재도전 5) | Views 136~145 | **H4 확정**: 매 입장 `NativeArenaView.Rebuild` |
| 20.7 s | 125 | 필드 초반 적 19 | FixedSim 28 | 웨이브 생성 추정, 추적 필요 |
| 412.2 s | 122 | 아레나 | 구간 밖 | 렌더 스레드/GPU 추정 |

판단:
- Mac M5 Pro에서는 필드 P95 12.6 ms로 이미 60 FPS 합격선 안이다. 캡처를 끈 같은 완주 QA의 최장은 257 ms였다. 따라서 PC 11-02 수치(최장 8.2초, P99 94 ms)의 대부분은 QA 캡처·해상도 전환이 만든 것으로 본다. PC는 같은 장치로 다시 재야 확정된다.
- 실제 사용자가 보는 멈춤은 아레나 입장마다 약 140 ms와 시작 로딩 4.6초 정지다.
- 상시 비용의 1순위는 **할당**(프레임당 약 80 KB, GC 분당 수백 회)과 **IMGUI**(CPU 구간 1위, 아레나에서 적 1마리인데 SetPass 2,322 = 거의 모든 draw가 별도 pass)다. 필드 GPU P95 10.6 ms는 강한 GPU 기준이라 저사양에서는 렌더 설정(S1·S2)이 병목이 된다.
- 셰이더 업로드 로그는 Metal에서 0건이었다. Metal 플레이어가 로그를 남기지 않는 것인지 실제 컴파일이 없는 것인지는 PC D3D11에서 확인한다.

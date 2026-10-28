# 유니티 커스텀 총괄 마스터 (2026-10-28)

- 소유: **유니티 커스텀 총괄** `local_143f9249` (Opus, 조사·명세·검수). 구현은 소속 Sonnet 세션과 각 총괄의 단순 세션이 맡는다(§7).
- 목적(10-28 사용자): "유니티 엔진 툴을 우리가 다 사용하고 최적의 개발환경을 만드는 게 목적", "유니티 엔진을 우리가 커스텀도 하고 모든 유니티 기능들을 최대한 사용해야 해", "최종 목적은 최고의 게임을 만드는 것", "그러려면 개발도구가 가장 중요".
- 범위: Unity 기능을 얼마나 쓰는지(활용도), 엔진 커스텀(패키지 구조·렌더 파이프라인 확장·패키지 포크), 기능별 사용 표준, 패키지 도입·버전.
- 이웃 총괄
  - **Unity 개발툴·엔진 작업환경 총괄** `local_55f5cfd6`(`docs/engine/UNITY_DEVTOOLS_MASTER_20261028.md`): 작업 흐름 도구(작업 서버 DT-01, MapLint DT-02, LookDev DT-03, 빌드 루프 DT-15 등). 경계는 §6.
  - **유니티 총괄** `local_59ad835c`: `unity/main` 병합 창구·M1 배정. 이 총괄의 코드는 그쪽 병합 순번을 따른다.
  - 콘텐츠 총괄(맵 `9d17d95b`·보스전 `a98acebe`·임펙트 `da9cd0e7`·캐릭터 `7de36273`·사운드 `cf0cb8d7`·디자인 `eb8a8577`): 각 기능을 실제로 쓰는 쪽. 이 총괄은 기능 표준과 공용 부품을 만들어 준다.
- 고정 규칙(CLAUDE.md §엔진별 버전 분리·Unity 리모델링): 게임 규칙의 정답은 이식 Core(`unity/Assets/Exoduser/Runtime/Core`, oracle 검증) — 커스텀은 표현·도구·구조에만 한다. UI는 웹과 같은 모양을 유지한다. 코드는 `unity/main` 줄기로만 병합한다.

## 1. 현재 활용도 실측 (`origin/unity/main`, 10-28 10:40)

Unity 6000.6.7f1 · URP 17.6.0 · C# 파일 240개 · 씬 4개(`FirstPlayable`·`RM_Sandbox`·`RM1_Slice`·`RM3_Slice`).
측정: `git grep -l`로 `unity/Assets/**/*.cs`에서 해당 API를 쓰는 파일 수, `git ls-tree`로 에셋 수.

| 기능 | 패키지 상태 | 쓰는 파일/에셋 | 판정 |
|---|---|---|---|
| Input System | 설치(1.20.1) | **0** — 구형 `Input.GetKey` 등 16개 파일(`NativeGame`·`NativeLobby`·`NativeSkills`·`NativeKeyBindInput`·`NativePauseMenu.*` 등) | 설치만 됨. 패드·키 재설정이 구형 입력에 묶임 |
| Animator / Animator Controller | 모듈 | **0** / `.controller` 0개 | 캐릭터·보스 움직임 시스템 없음 |
| Animation Rigging | 없음 | 0 | 발 IK·시선·무기 잡기 없음 |
| Timeline | 설치(6.6.0) | 1개 파일 / `.playable` 1개 | 거의 안 씀 |
| Cinemachine | 설치(6.6.0) | 3 | 카메라 기본만. Impulse(타격 흔들림)·Confiner 없음 |
| URP Renderer Feature / RenderGraph | URP 설치 | **0 / 0** | 렌더 파이프라인 확장 없음 |
| URP Volume·후처리 | URP | 3 | 기본 Volume만 |
| Decal Projector | URP | 0 | 바닥 장식은 자체 `GroundDecal.shader` |
| Shader Graph | 설치(17.6.0) | **`.shadergraph` 0개** | 손으로 쓴 셰이더 10개(`SpriteLit3D`·`GroundDecal`·`LightShaft`·`ToxicFlow`·`FgCard`·`DropIconMask`·`HudOrb`·`KiSlashAdditive`·`KiSlashInk`·`SkillAdditive`) |
| VFX Graph | 설치(17.6.0) | 1개 파일 / `.vfx` 1개 | 거의 안 씀 |
| Terrain / ProBuilder / AI Navigation | 설치 | 3 / 2 / 3 | 맵 빌더에서 사용 중 |
| Splines | 잠금 파일에만(의존성) | 0 | 강·길·덩굴 경로를 손 메시로 만듦 |
| Audio Mixer | 모듈 | **`.mixer` 0개** | 볼륨 버스·덕킹·스냅샷 없음 |
| UI Toolkit | 모듈 | 1 | — |
| IMGUI `OnGUI` | — | **11** (`NativeGame`·`NativeLobby`·`NativeStatPanel`·각종 `*.Capture`) | 게임 화면 UI가 디버그용 IMGUI에 일부 걸려 있음 |
| Addressables | 없음 | 0 | 내용 로딩·패치 크기 관리 없음 |
| ScriptableObject 데이터 | — | **0** | 맵·보스·VFX 설정이 코드 상수 |
| EditorWindow·커스텀 인스펙터 | — | **0** | 도구가 정적 메서드·배치 실행뿐 |
| Assembly Definition(asmdef) | — | **0** | 스크립트 전체가 한 어셈블리 → 한 줄 고쳐도 전부 재컴파일(병합 직후 컴파일 26~69초, 개발툴 마스터 §1.1) |
| Unity Test Framework | 잠금 파일에만 | `[Test]` 0 | 검증이 Unity 밖 dotnet oracle·캡처 스크립트뿐 |
| Profiler 마커 | — | 0 | 프레임 예산을 코드 구간별로 못 봄 |
| Burst·Jobs·Collections | 잠금 파일에만 | 0 | — |
| 조명 베이크·Light Probe·APV | — | 0 | 실시간 광원만(URP 추가광 8개 한도 문제) |

**판단**: CLAUDE.md 리모델링 원칙이 나열한 도구(URP·Volume, Terrain·ProBuilder·NavMesh, Cinemachine, Timeline·Animator, VFX Graph·Shader Graph, Input System, Audio Mixer) 중 **제대로 쓰는 것은 Terrain·ProBuilder·NavMesh뿐**이다. 나머지는 설치만 됐거나 아예 없다. 엔진 커스텀(렌더 파이프라인 확장, 패키지 구조)은 0이다.

## 2. 커스텀 단계 — 어디까지 엔진을 고치나

| 단계 | 내용 | 우리 쓰임 | 결정 |
|---|---|---|---|
| L1 에디터 확장 | EditorWindow·인스펙터·임포터·메뉴·씬 도구 | 맵·보스·VFX 저작 도구 | 바로 한다 |
| L2 자체 패키지 | `unity/Packages/com.exoduser.*` 내장 패키지 + asmdef(Core·Runtime·Rendering·Editor·DevTools 분리) | 컴파일 시간 단축, 부품 재사용, 경계 강제(Core가 표현 코드를 못 부름) | 바로 한다(C-01) |
| L3 렌더 파이프라인 확장 | URP `ScriptableRendererFeature`+RenderGraph 패스, 자체 Volume 컴포넌트, Shader Graph Custom Function·서브그래프 | 가림 페이드·외곽선·지옥 안개·피격 섬광·열기 왜곡 | 바로 한다(C-03·C-04) |
| L4 URP 패키지 포크 | URP/Core RP 17.6.0을 `Packages/`에 내장해 직접 수정(버전 고정, 변경점 목록 유지) | L3로 안 되는 것만(예: 라이트 루프 한도·그림자 방식 변경) | 필요가 실제로 확인될 때만. 업그레이드 비용이 생기므로 항목마다 이 문서에 근거를 남긴다 |
| L5 엔진 C++ 소스 | Unity 소스 접근 라이선스(유료, Enterprise급) | — | 하지 않는다. 필요해지면 유료 지출이라 사용자 결정 |

## 3. 활용 로드맵 (C-xx)

우선순위 기준: ① 모든 팀의 반복 속도를 올리는 것 ② M1 "1-1 한 판 완주"와 맵·보스 리메이크 화질에 바로 필요한 것 ③ 나중에 바꾸면 비싼 구조.

### P0 — 기반 (지금)

| id | 과제 | 효과 | 실행 | 완료 판정 |
|---|---|---|---|---|
| C-01 | **asmdef 분리 + 자체 패키지 구조**: `Exoduser.Core`(Core만, UnityEngine 최소 참조) · `Exoduser.Runtime` · `Exoduser.Rendering` · `Exoduser.Editor` · `Exoduser.DevTools.Editor`. 맵 빌더는 Editor, Capture 파일은 별도 어셈블리 | 표현 코드만 고칠 때 Core 재컴파일 없음. Core가 표현 코드를 참조하면 컴파일 오류로 막힘 | 소속 Sonnet, 병합은 유니티 총괄 순번 | 같은 수정 1줄의 컴파일 시간 전후 비교 · oracle 불일치 0 · Win 빌드 1회 · 진행 중 브랜치(RM-1~4·RM-B·M1 HUD) 병합 충돌 목록 |
| C-02 | **Input System 전환**: Input Actions 에셋 1개(웹 `BINDS` 기본값 그대로), 키·패드 동시, 재설정 저장은 기존 세이브 키. 구형 `Input.*` 16개 파일 교체 | 패드 지원·키 재설정·로컬 입력 일원화 | 소속 Sonnet → 유니티 총괄 순번 | 웹과 같은 키 표 전부 동작, 패드로 1-1 이동·공격·구르기 |
| C-05 | **Profiler 마커 + Memory Profiler·Profile Analyzer 도입**: Core 틱·몹 갱신·렌더 준비·UI 구간에 `ProfilerMarker` | 프레임 예산을 구간별로 본다 → DT-10 회귀 측정의 기초 | 소속 Sonnet | 1-1 표준 컷에서 구간별 ms 표 |
| C-06 | **Unity Test Framework**: EditMode(에디터 도구·임포터), PlayMode 스모크(씬 열기→Core 틱 N프레임→예외 0), `com.unity.test-framework.performance`로 성능 기준선 | 캡처 스크립트 대신 표준 테스트 러너, 작업 서버(DT-01)가 그대로 돌림 | 개발툴 총괄과 공동(러너는 그쪽, 테스트 구조는 이쪽) | 스모크 3종이 작업 서버 job으로 통과 |

### P1 — 리메이크 화질 (맵·보스 리메이크와 같이)

| id | 과제 | 쓰는 팀 | 첫 적용 |
|---|---|---|---|
| C-03 | **URP Renderer Feature 세트**(RenderGraph): 탑다운 가림 페이드, 외곽선(피격·선택), 높이 안개, 피격 섬광, 열기 왜곡 — 개발툴 마스터 DT-11을 이쪽으로 옮김 | 맵·디자인·VFX | 1-3 키 큰 버섯 가림 페이드 |
| C-04 | **Shader Graph 서브그래프 라이브러리**(그을림·용해·발광 핏줄·젖음·이끼, 공통 HLSL include) + 손 셰이더 10개 중 옮길 것 정리 — DT-12를 이쪽으로 옮김 | 디자인·VFX·맵 | 1-1 바닥·나무 재질 |
| C-07 | **Animator + Animation Rigging + Timeline**: 영웅·보스 상태 기계, 루트 모션 끔(위치는 Core가 정답), 발 IK·시선, 보스 등장 Timeline(Signal로 Core 이벤트 연결) | 보스전·캐릭터 | 1-1 드루이드 리메이크 무브(No Rest for the Wicked 기준) |
| C-08 | **Cinemachine 확장**: Impulse(타격·보스 강타 흔들림), Confiner, 보스전 그룹 프레이밍 | 보스전·VFX | 드루이드 강타 |
| C-09 | **VFX Graph 표준**: 임팩트를 VFX Graph로, GPU 이벤트, 공용 블록(서브그래프), 프리뷰 벤치는 DT-08 | VFX | 독 폭발 1종 |
| C-10 | **Audio Mixer**: Master·Music·SFX·UI·Voice·Ambient 버스, 보스·일시정지 스냅샷, 대사 덕킹, 웹 설정 볼륨과 연결 | 사운드 | RM-1 사운드 슬라이스 |
| C-11 | **ScriptableObject 데이터 + 저작 창**: 맵 구역(`MapSliceDef`, DT-05와 공동)·보스 무브 세트·VFX 프리셋을 SO로, EditorWindow로 편집 | 맵·보스·VFX | 1-1 구역 정의 |
| C-12 | **조명**: Light Layers(영웅 광원), Adaptive Probe Volumes·정적 베이크로 추가광 8개 한도 회피 | 맵·디자인 | 1-1 |
| C-13 | **Splines**: 독 강·길·덩굴·사슬을 Spline으로(손 메시 대체) | 맵 | RM-1 독 강 |

### P2 — 출시·규모

| id | 과제 | 비고 |
|---|---|---|
| C-14 | Addressables: 장·구역 단위 로딩, Steam 일일 패치 크기 축소 | M1 뒤 |
| C-15 | Burst·Jobs: 프로파일러(C-05)가 CPU 병목을 보인 곳만(투사체·대량 몹) | Core 수치는 바꾸지 않음 |
| C-16 | 게임 UI의 IMGUI(`OnGUI` 11개 파일) 정리: 실제 화면 UI는 UI Toolkit(USS로 웹 CSS 모양 재현), IMGUI는 캡처·디버그 전용으로 한정 | UI 모양은 웹 그대로. 유니티 총괄·디자인총괄과 합의 후 |
| C-17 | URP 포크(L4) 필요 여부 판정 | C-03·C-12 결과로 결정 |

## 4. 기능 사용 표준 (새 코드에 적용)

1. 새 입력은 Input System만 쓴다(C-02 전에는 기존 파일 수정만 허용).
2. 새 화면 효과는 Renderer Feature·Volume·Shader Graph로 만든다. 카메라 앞 판 메시·OnGUI 그리기로 효과를 만들지 않는다.
3. 새 조정 값(맵·보스·VFX)은 ScriptableObject에 둔다. 코드 상수는 Core 규칙값만.
4. 새 셰이더는 Shader Graph 우선. 손 HLSL은 Custom Function 또는 성능 근거가 있을 때만.
5. 새 스크립트는 맞는 asmdef 폴더에 둔다(C-01 이후). Core 어셈블리는 표현·에디터 코드를 참조하지 않는다.
6. 무거운 구간에는 `ProfilerMarker`를 단다.
7. 패키지 추가·버전 변경은 이 문서 §5에 기록하고 이 총괄이 승인한다(`manifest.json` 충돌 방지).

## 5. 패키지 계획

| 패키지 | 지금 | 계획 | 과제 |
|---|---|---|---|
| `com.unity.inputsystem` | 1.20.1 설치 | 사용 시작 | C-02 |
| `com.unity.animation.rigging` | 없음 | 추가 | C-07 |
| `com.unity.splines` | 의존성만 | manifest에 직접 추가 | C-13 |
| `com.unity.test-framework`·`.performance` | 의존성만 | 직접 추가 | C-06 |
| `com.unity.memoryprofiler`·`com.unity.performance.profile-analyzer` | 없음 | 추가 | C-05 |
| `com.unity.addressables` | 없음 | M1 뒤 | C-14 |
| `com.unity.burst`·`collections`·`mathematics` | 의존성만 | 필요 시 직접 추가 | C-15 |

버전은 Unity 6000.6.7f1 패키지 관리자에서 확인한 값을 쓴다(추가하는 세션이 확인·기록).

## 6. 경계 — Unity 개발툴 총괄과 나눔

| 항목 | 유니티 커스텀 총괄 | Unity 개발툴 총괄 |
|---|---|---|
| 기능 활용도·사용 표준·패키지 | 소유 | 따름 |
| asmdef·자체 패키지 구조(C-01) | 소유 | DT-14 빠른 컴파일 검사가 이 구조를 씀 |
| URP Renderer Feature(옛 DT-11)·셰이더 라이브러리(옛 DT-12) | **소유(이관)** | — |
| 작업 서버·순번 큐(DT-01)·MapLint(DT-02)·LookDev(DT-03)·빌드 루프(DT-15)·Web 빌드 조사(DT-16) | 사용 | 소유 |
| 테스트 | 테스트 구조·스모크 내용(C-06) | 러너·job 실행 |
| 데이터 기반 맵(DT-05) | SO 표준(C-11) | MapKit 빌더 |
| 성능 회귀(DT-10) | 마커(C-05) | 자동 측정·회귀 job |

개발툴 총괄 합의(10-28, 그쪽 main e9b2ccd8d에 반영):
- C-01에서 `unity/Assets/Exoduser/Editor/DevTools/<도구>/` 전체를 **에디터 전용 asmdef 하나**(`Exoduser.DevTools.Editor`)로 묶는다. 실행 스크립트 `unity/Tools/devtools/`는 asmdef 대상이 아니다.
- 모든 자동 실행은 공용 무창 실행기 DT-01 `exo-unity.ps1`을 거친다(사용자 지시: 창·소리 없이). C-06 스모크도 이 실행기로 돌린다.
- DT-15 브랜치에서 `NativeGame.M1Check.cs` 캡처를 RenderTexture로 바꾸고 `--unity-mute` 플래그를 추가하는 중이다. C-06 테스트 구조와 C-01 partial 분리는 이 변경이 병합된 뒤의 형태를 기준으로 한다.

## 7. 운영

- 소속 Sonnet 세션: (생성 후 기입). 첫 배정 = C-01 사전 조사(어셈블리 경계 후보·순환 참조 목록·진행 중 브랜치 충돌 예상) → 그다음 C-01 구현.
- 활용도 재측정: §1 표를 주 1회 같은 방식(`git grep -l`)으로 다시 잰다. 측정 스크립트는 `unity/Tools/custom/feature_usage.sh`로 정식화(C-01과 함께).
- 완료 기준: CLAUDE.md·`UNITY_DONE_BUILD_PLAYTEST_RULE` 그대로 — 병합 전 빌드 → 실제 렌더 스모크 → 플레이 판정. 기능을 "넣었다"가 아니라 그 기능으로 만든 화면이 게임에서 돌아야 완료.

## 8. 결정 기록

| 날짜 | 결정 | 근거 |
|---|---|---|
| 10-28 | 이 세션 = 유니티 커스텀 총괄(사용자 지정). Unity 개발툴 총괄 `local_55f5cfd6`은 작업 흐름 도구를 계속 맡는다 | 같은 파일을 두 총괄이 건드리지 않게 §6으로 나눔 |
| 10-28 | 옛 DT-11(Renderer Feature)·DT-12(셰이더 라이브러리)를 이쪽 C-03·C-04로 옮김 | 엔진 커스텀(L3)에 해당 |
| 10-28 | P0 = asmdef 분리 → Input System → Profiler·Test Framework | 모든 팀 반복 속도·나중에 바꾸면 비싼 구조부터 |
| 10-28 | L4 URP 포크는 필요가 확인될 때만, L5 엔진 소스는 하지 않음(유료) | 업그레이드 비용·유료 지출은 사용자 결정 |

## 부록 A. PC·저장소 점검 (10-28 10:20~10:40) — CTO에 넘김

이 세션 처음에 잰 개발 PC 상태. 소유는 CTO(`local_7072229c`). 원자료 `I:\EXODUSER-Storage\devtools\survey\worktree_inventory_20261028.tsv`.

- **메모리 커밋 83.4/95.8GB(87%)**, 재부팅(08:56) 1시간 반 만. 커밋 한도가 재부팅 전 127.8GB → 95.8GB로 줄었다(페이지 파일 시스템 관리 추정 → 고정 크기 권고, 시스템 설정이라 사용자가 직접).
- **세션마다 따라 뜨는 MCP 서버 18.6GB(커밋의 약 22%)**: desktop-commander 56개 6.6GB · pdf-viewer 56개 6.0GB(둘 다 claude.ai 동기화 플러그인, 내장 Bash·Read와 기능 중복) · ElevenLabs 162개 6.0GB(`tools/mcp_elevenlabs_launcher.cjs` → `uvx`, 사운드 외 세션은 안 씀). 권고: 앞 둘은 사용자가 앱 플러그인 설정에서 끔(약 12.6GB), ElevenLabs는 런처를 "첫 도구 호출 때만 실서버 시작"으로 바꿈(약 6GB).
- claude 41개 24.4GB(세션 1개 0.8~1.1GB), node 163개 14.5GB.
- 디스크: C 여유 246GB · E 801GB · G 641GB · I 12.7TB. C Temp 32GB(Claude 작업 출력 8GB, 끝난 세션의 100MB 넘는 출력 11개 약 5.6GB — 10-27 REPL 루프 3.4GB 포함). Playwright 임시 프로필 96개(0.2GB) 남음.
- worktree **94개**: 깨끗하고 원격에 들어간 것 26개(Steam `rel-0.7.1~0.7.7`·Godot 시절 `codex-*`·`docs-merge` 등), 더러움 표시 66개(Unity worktree 다수는 `.meta` 400여 개 — 에디터가 연 흔적일 가능성, 실제 작업 여부는 소유자 확인 필요), 디스크에 없는 등록 1개(`G:/exoduser-wt/snd10-ui`), C 드라이브 worktree 1개(`C:\Users\심도진\.codex\worktrees\5615`). 삭제는 사용자 승인 사항.
- git: gc 꺼짐(10-27 팩 손상 대응, 유지), 팩 24개 21.8GB, 느슨한 객체 3.97GB. 공유 폴더 main은 로컬 19 / 원격 246 갈라짐(각 세션이 다른 SHA로 원격 반영 중).
- PATH 25항목·938자 정상, `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false` 유지. REPL 감시기 23:30까지 실행 중. API 실행기 키 파일 없음. `python -` 루프 0개.

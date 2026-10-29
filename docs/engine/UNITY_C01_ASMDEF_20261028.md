# C-01 asmdef 1차 분리 (2026-10-28, unity-core-oracle)

> 명세: main `docs/engine/UNITY_CUSTOM_LEAD_MASTER_20261028.md` "C-01 상세 명세". 브랜치 `claude/unity-pc-c01-asmdef-20261028`.
> 커밋: ① 6d8d6e2cd PortVerification typeof · ②③ 2271793ee asmdef 3개 · d2321dbba origin/unity/main 4a22a22af merge(충돌 0).

## 1. 바뀐 것 (파일 이동 0, `unity/Tools` csproj 0)

| 어셈블리 | 위치 | 설정 |
|---|---|---|
| `Exoduser.Core` | `Runtime/Core/Exoduser.Core.asmdef` | `noEngineReferences: true`, 참조 없음, autoReferenced |
| `Exoduser.Runtime` | `Runtime/Exoduser.Runtime.asmdef` | Core, Input System, Cinemachine, `Unity.RenderPipelines.Universal.Runtime`, `Unity.RenderPipelines.Core.Runtime`(NativeGame.cs:53 `CameraExtensions`) |
| `Exoduser.Editor` | `Editor/Exoduser.Editor.asmdef` | Editor 전용. Core, Runtime, URP Runtime·Editor, RP Core Runtime·Editor, Cinemachine, AI Navigation, ProBuilder, VFX Graph Runtime·Editor, Timeline |

참조는 모두 어셈블리 이름으로 적었다(GUID 아님). `PortVerification.CheckCorePresence`는 `Type.GetType("…, Assembly-CSharp")` 대신 `typeof(Simulation).AssemblyQualifiedName`으로 찾고, 로그에 실제 어셈블리 이름을 남긴다.

## 2. 사전 점검 (정적)

- Core의 UnityEngine 사용 0. API 프로필은 .NET Standard 2.1(`apiCompatibilityLevel: 6`)이라 `System.Numerics.BigInteger`(ItemFactory)도 컴파일된다(실제 컴파일로 확인).
- Core의 `internal` 멤버(Js, KiSlash.HitEnemies, Simulation.TickCrossbow/StartRoll 등)를 어셈블리 밖에서 쓰는 곳 0. Editor가 쓰는 Runtime 타입 20개는 전부 public.
- `Type.GetType` 문자열 조회는 PortVerification 1곳뿐.

## 3. Unity 검증 (10-28 15:38~15:46, `_pc_lock.json` 잠금, 창 없음, 플레이어 없음)

| 항목 | 기준(asmdef 없음) | C-01 |
|---|---|---|
| 기준 커밋 | o1-killtail 938394077 (= unity/main efae9aa11에 병합된 O-1 끝) | d2321dbba (efae9aa11 + C-01 + unity/main 4a22a22af) |
| 첫 컴파일 | — | 오류 0, 84초(전체 674항목, Exoduser.Core·Runtime·Editor 새로 생성) |
| CheckCorePresence | — | 통과, `UNITY_CORE_PRESENCE True Exoduser.Core` |
| `Runtime/NativeHud.cs` 끝에 같은 주석 1줄 → 컴파일 | script compilation 3.709초, Tundra 3.14초/6항목, 다시 컴파일 = **Assembly-CSharp** | script compilation 3.079초, Tundra 2.54초/6항목, 다시 컴파일 = **Exoduser.Runtime만** (Core·Editor 재컴파일 없음) |
| Windows 빌드 | — | 성공, 빌드 오류 0, 80초, 영수증 출력 == exe |
| 씬 스크립트 연결(GUID) | 끊김 경고 0 | 끊김 경고 0 (FirstPlayable·빌드 씬) |
| 경고 | — | CS0618 30 · CS0219 · CS0414 (기존 코드, asmdef와 무관) |
| PortVerification.Verify (GPU, D3D12) | exit 2: `A15 SFX right must step by one and write once` | exit 2: **같은 지점·같은 메시지**. 앞 5단계(FEEDBACK_FRAME_SEQUENCE·UI_COMPOSITION_BOUNDS·HUD_GPU_RESOURCE_MASK·INVENTORY_SEED_STATS_UNARMED·LOBBY_MEDIA_CAPTIONS_29X32) 둘 다 통과 |

- Verify 실패는 C-01 회귀가 아니다. 기준에서도 같은 단계에서 멈추는 기존 결함이다. `-nographics`(GfxDevice Null)로 돌리면 그 앞 HUD GPU 픽셀 검사에서 먼저 멈추므로, Verify는 GPU 장치로 돌려야 한다.
- 1줄 수정 시간은 약 17 %(3.71→3.08초) 줄었다. 큰 이득은 "Runtime만 고치면 Core·Editor를 다시 컴파일하지 않는다"는 구조이고, Core 쪽 수정의 이득은 Core가 커질수록 커진다.

## 4. 남은 것

- 1-1 실제 렌더 스모크(GPU m1-check): CTO 지시로 플레이어 실행 보류(NativeQaSandbox fail-closed 병합 전). 재개 신호 뒤 실행.
- oracle(dotnet)은 csproj가 `Runtime/Core/**/*.cs`를 직접 넣어 asmdef와 무관하다(LT-5 브랜치에서 31종 0 확인, C-01은 .cs 변경 0).
- `Editor/Rm3SliceBuilder.cs`에 .meta가 없다(RM-3에서 온 것, 손대지 않음) — C-01 뒤에도 GUID가 worktree마다 새로 생긴다.
- DT-01이 먼저 병합되면 `Editor/DevTools/**`는 `Exoduser.Editor`에 그대로 들어간다(MapLint가 쓰는 URP·RP Core 참조 포함). 병합 때 컴파일로 한 번 더 확인.
- 기존 결함 후보: Verify `A15 SFX right must step by one and write once`(unity/main).
- 산출: `I:\EXODUSER-Storage\qa\c01\` (로그 `base-*.log`·`c01-*.log`·`verify-gpu-*.log`, `build-commit.json`).

## 2026-10-29 미리보기 재개: Remodel 어셈블리 경계

| 항목 | 변경·근거 |
|---|---|
| 실패 재현 근거 | 이전 job `930e5a24`의 Editor CS0246, `Rm4PoolLightCuller` |
| 원인 | `Remodel`의 C# 3개가 명시 asmdef 바깥 기본 `Assembly-CSharp`에 들어가 `Exoduser.Editor`에서 참조 불가 |
| 수정 | `Remodel/Exoduser.Runtime.asmref`로 기존 `Exoduser.Runtime`에 귀속. Runtime은 이미 Core를, Editor는 이미 Runtime을 참조 |
| 대상 | `BossArenas/ArenaChannelPlan.cs`, `CH1_3/Rm3PoolLightCuller.cs`, `CH1_4/Rm4PoolLightCuller.cs` |
| 보존 | 파일 이동·스크립트 GUID·Core·게임 규칙·장면 배치 변경 0. 기본 어셈블리를 향한 역참조 추가 0 |
| 검증 | 새 사용자 재개 지시에 따른 참조 경계 수정 단위. Unity 빌드 결과는 후속 보고에 기록하며 기존 실패 2회를 성공으로 바꾸지 않음 |

### 미리보기 재개 검증 결과(10-29)

`41bfcae6`에서 Remodel의 기존 CS0246은 사라졌다. 전체 컴파일은 RM0 검수 도구의 미제출 `WarriorImport`·`WeaponImport` 참조 CS0103 세 곳으로 실패했다. asmref의 Player 성공·전체 컴파일 PASS로 확대하지 않는다. 실제 원인·파일 소유권·중단 근거는 `UNITY_PC_PREVIEW_ALL_20261029.md`에 기록했다.


## 2026-10-29 brief2 최종 검증

미리보기 전용 인수·보스 부활 null 역참조 수정 후 Unity 6000.6.7f1 Win 빌드 `23271fa4` 컴파일·빌드 오류 0, 최종 D3D11 batch M1 `a7774943` **23/23·exit 0·창 0·잔존 0·세이브 변경 0**를 확인했다. 3D `fb7ad923` 1,800틱·네 지점 캡처·정상 종료도 통과했다. 이전 컴파일 실패는 해결 이력이며 unity/main 반영을 뜻하지 않는다. UI 포함 캡처는 숨은 모드에서 별도 확보했으며 그 모드의 종료 지연은 미해결로 기록했다. 세부·시각 RETOUCH·바로가기는 `UNITY_PC_PREVIEW_ALL_20261029.md`를 따른다.

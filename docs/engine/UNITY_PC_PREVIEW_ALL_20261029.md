# Unity 전체 미리보기 통합 보고 — 2026-10-29 재개 결과

## 현재 판정

**미완료: 후보 16개 소스 포함은 확인했으나 컴파일 0 오류·Windows 빌드·M1·캡처·미리보기 바로가기를 완료하지 못했다.**

- 소유 경로: `E:/exoduser-wt/codex-unity-integrator`.
- 브랜치: `codex/pc-preview-all-20261029`.
- 현재 코드 SHA: `6da76bcce70607a2d95098b803f7874c1d4439fc`. 비강제 push 후 같은 원격 SHA 확인.
- `unity/main`은 변경·병합·push하지 않았다. 시작·최종 조회 모두 `1ae7366a3d17272db4ff8871ff9fc180a21c13b7`.
- 2026-10-29 08:53 KST의 두 번째 Unity 실행 `41bfcae6`은 Editor의 미제출 전사 임포터 참조 3곳에서 실패했다. 성공 EXE와 빌드 영수증이 없다.
- [공통 규칙](../codex-takeover/COMMON_RULES.md)의 “테스트 실패는 원인 수정 후 1회 재실행, 2번 실패면 멈추고 기록”에 따라 추가 Unity·Player 실행을 중단했다. 재개 전 두 번의 컴파일 실패도 별도 이력으로 보존한다.

## 포함 브랜치와 SHA

fetch 후 아래 원격 끝점을 고정했다. 16개 모두 현재 코드 체크포인트의 조상임을 `resume-assembly/branch-proof.json`에서 확인했다. 브리프의 RM0/RM2/RM3/RM4/arena/VFX/character/sound 이전 SHA는 아래 동일 계보 최신 tip에 포함되어 중복 병합하지 않았다. H5 작업 브랜치는 병합하지 않았다.

| 브랜치 | 고정 SHA | 처리 |
|---|---|---|
| `claude/unity-rm0-engine-20261027` | `dc929d6829458a7eedf8686b14b39e9a49422edc` | 병합 |
| `claude/unity-pc-rm2-20261028` | `3317e7f30e3579f6597a7520c15ba5cab61ab10c` | 병합 |
| `claude/unity-pc-rm3-20261028` | `08ef231b1e6365c559807c96680fe0be80964335` | 병합 |
| `claude/unity-pc-rm4-20261028` | `ef2536291812564b94b648a1a4ce66f69477abbc` | 병합 |
| `codex/pc-map-arena-20261028` | `2f2e8bc9b64487338b8499695356814d745df127` | 병합 |
| `codex/pc-vfx-rm1-int-20261028` | `919fd0597714e2544a8ceb3905aedfa57442ff56` | 병합 |
| `codex/pc-character-heroes-20261028` | `52d8a923293eb78ec899a56819979ea00b771bb9` | 병합 |
| `codex/pc-sound-takeover-20261028` | `9a9067b295a050580cdb0d0321e137f2a16ceab9` | 병합 |
| `codex/pc-custom-c02b-20261028` | `b953a4c05f59fea2ff9ba1bf51da16177c6d3efc` | 충돌 해결 병합 |
| `codex/pc-boss-takeover-20261028` | `21b6dd9301f1bcdc71fbd4b30bbb1b42b15f1f68` | 충돌 해결 병합 |
| `claude/unity-pc-hud-webgpu-20261028` | `a56a40d0dce74e1d8dd1c617b93fa1f980bb0eb2` | 병합 |
| `claude/unity-pc-lt34-20261028` | `9b18477125068df5790cc6db7d493bc4c8923d4c` | 병합 |
| `claude/unity-pc-rm1-20261027` | `8eed73a6b5ab1d1705c2d0cf8156fedec27b529d` | 충돌 해결 병합 |
| `claude/unity-pc-c01-asmdef-20261028` | `2c4cc7245f364d15d25bf1ee80a3f0b2f75d0afd` | 병합 |
| `claude/unity-pc-rmb1-20261027` | `00353dda915a640f5ba77487e6f556090ea3e9e8` | 충돌 해결 병합 |
| `claude/unity-pc-sound-rm1-20261027` | `acf2fb948edd17c739169f002346c9c57615f897` | 이미 포함 |

## 충돌 처리

| 파일 | 선택 이유 |
|---|---|
| `NativeGame.cs` | 최신 공통 줄기의 `AimWorld()` 3D 바닥 투영을 보존하고 자동 병합된 `ExoInput` 전환을 유지했다. |
| `NativeKeyBindInput.cs` | 10-29 `4d7b82a0b`의 웹 마우스 번호 변환을 우선했다. 웹 1=중간·2=오른쪽을 Unity 번호로 바꾸고, 후보의 `ExoInput.MouseDown/Mouse/KeyDown/Key`로 읽도록 결합했다. |
| `NativeGame.BossView.cs`(보스 후보) | 최신 RB1-3 예고 뷰 초기화·해제를 채택하고 기존 침강 소리용 `sinkSounded.Clear()`도 보존했다. |
| `Rm1SliceBuilder.cs` | 공용 job 서버의 `ExoArgs.Get()`를 보존하고 최신 RM-1의 `AudioListener.volume=0f`를 FPS·캡처 진입부에 결합했다. |
| `NativeGame.BossView.cs`(RM-B1 중복) | 앞서 통합한 동일 예고 구현과 침강 소리 초기화가 모두 있는 현재 통합본을 보존했다. |

원래 충돌 파일은 `conflict-original/`, 병합 기록은 `merge.log`, 병합 커밋별 원장은 `integration.json`에 있다.


## 이번 재개에서 수정한 것

| 커밋 | 변경 | 실제 검증·한계 |
|---|---|---|
| `dc2a83856c5139866d17aaa46427103722928cd7` | `Remodel/Exoduser.Runtime.asmref`와 .meta. Remodel의 C# 3개를 기존 Runtime으로 귀속. 관련 C-01·커스텀·미리보기 docs 동기화 | `41bfcae6`에서 기존 `Rm4PoolLightCuller` 오류가 사라지고 Runtime 컴파일이 진행됨. 전체 Editor·Player 빌드 성공은 아님 |
| `6da76bcce70607a2d95098b803f7874c1d4439fc` | M1 비 batch 검수의 강제 1920×1080을 1600×900으로 통일. batch RenderTexture 1600×900은 보존 | 원본 캡처 규격 변경. 빌드 실패로 실제 PNG 해상도·UI 캡처는 미검증 |

어셈블리 변경은 파일 이동·기존 스크립트 GUID·게임 수치·Core 규칙·장면 배치를 바꾸지 않는다. 대상은 `BossArenas/ArenaChannelPlan.cs`, `CH1_3/Rm3PoolLightCuller.cs`, `CH1_4/Rm4PoolLightCuller.cs`다. 기본 어셈블리 역참조·임시 타입·stub을 추가하지 않았다.

## 컴파일·빌드 영수증

| 구분 | 실행·결과 | 원인·처치 |
|---|---|---|
| 재개 전 1 | `a734042a`, exit 1 | Runtime Cinemachine 참조 누락. 기존 `c36431bc7`에서 보완 |
| 재개 전 2 | `930e5a24`, exit 1 | Editor가 기본 어셈블리의 `Rm4PoolLightCuller`를 참조하지 못함. 이번 `dc2a83856`에서 asmref 보완 |
| 이번 제출 전 환경 오류 | `resume-assembly/build.console.log`, Unity 미시작 | 상속 PATHEXT가 사실상 없어 PowerShell이 Node EXE를 문서로 분류. 작업 자식 환경의 확장자 인식만 보완 |
| 이번 Unity 1 | `a5d1e9f0`, exit 1, 컴파일 미시작 | UPM IPC 30초 연결 실패. Node 도구 자식 환경에 APPDATA·ProgramFiles·ProgramData·ComSpec 등이 누락됨을 확인. 레지스트리/.NET 읽기 조회값을 이 작업 자식 환경에만 보완 |
| 이번 Unity 2 | `41bfcae6`, exit 1 | 이전 Remodel 오류 해소. `Rm0LightCapture.cs:169,196,218`의 `WeaponImport`·`WarriorImport` CS0103 세 곳에서 실패. 로그에는 같은 세 오류가 컴파일 단계별로 반복되어 9건 기록됨 |

이번 두 Unity 실행 모두 공용 `exo-unity.ps1`·Unity 6000.6.7f1·격리 세이브를 사용했다. 필수 로비·전사 영상 복원과 9개 영상 검사는 통과했다. 실행기 영수증의 사용자 세이브 변경은 모두 0이다. 최종 상태 조회에서 Unity 0개·잠금 없음·예약 없음이다.

환경 보완은 `run-job-resume.cjs`가 만든 자식 프로세스에만 적용된다. 시스템·사용자 영구 환경, 인증·권한·백신 설정, 공용 실행기 소스는 변경하지 않았다. 원본 로그와 실행기 JSON은 `resume-assembly/a5d1e9f0.log/json`, `resume-assembly/41bfcae6.log/json`에 있다.

## 남은 컴파일 원인의 소유권

`Rm0LightCapture.cs`는 `using Exoduser.CharacterLab`를 이미 갖고 있다. 이름공간 문제가 아니라 참조하는 전사 임포터 소스가 원격 후보에 없다. Git 전체 이력에서 해당 임포터 클래스의 커밋을 찾지 못했다.

| 필요한 파일·자산 | 실제 상태 | 처리 |
|---|---|---|
| `Editor/CharacterLab/WarriorImport.cs` | `E:/exoduser-wt/pc-unity-rm0`에서 미추적 | 읽기만 확인. 미인수 타 팀 WIP이므로 복사·stage하지 않음 |
| `Editor/CharacterLab/WeaponImport.cs` | 같은 소유 작업 폴더에서 미추적 | 위와 같음 |
| `Art/Characters/Warrior/` | 같은 폴더 전체가 미추적이며 이 통합 브랜치에는 없음 | 임포터만 가져오면 실제 RM0 검수 자산도 빠질 수 있으므로 함께 소유권·필수 자산 인수가 필요 |

위 소스에서 확인한 기존 계약은 전사 프리팹 `Assets/Exoduser/Art/Characters/Warrior/Warrior.prefab`, 대검 프리팹 `Assets/Exoduser/Art/Characters/Warrior/Weapon/Warrior_Greatsword.prefab`, 대검 길이 1.60f다. 이는 미추적 소스의 관찰값이며 채택·런타임 승인값으로 보고하지 않는다. 원래 검수 도구를 삭제하거나 더미 클래스로 컴파일을 우회하지 않았다.

## 다음 실행 시 필요한 빌드 인자와 범위

`PortVerification.Build`는 기본적으로 FirstPlayable만 넣고, `-remodel-scenes 1`일 때만 RM1_Slice를 포함한다. 이번 실패 제출에는 해당 인자가 없었으므로, 다음 성공 빌드는 반드시 다음 인자를 써야 1-1 3D를 검수할 수 있다.

`-output,I:/EXODUSER-Storage/unity-preview/build,-receipt,I:/EXODUSER-Storage/unity-preview/build-receipt.json,-remodel-scenes,1`

현재 RM-INT 런타임은 1-1의 RM1_Slice만 연결하고 보스 아레나에서 2D 표현으로 돌아간다. RM2·RM3·RM4·arena·3D 영웅 후보가 소스에 포함됐다는 사실만으로 실제 플레이 동선 연결을 완료했다고 보지 않는다. 사운드 청음·후보 채택도 별도다. H5 브랜치와 웹 코드는 추가하지 않았다.

## 빠진 결과와 이유

| 요구 결과 | 현재 상태 |
|---|---|
| 컴파일 0 오류·Windows EXE | 미완료: 미제출 임포터 의존성 세 곳 |
| 무창 M1 스모크 | 미실행: 실행할 이번 Player 없음 |
| 로비·1-1 3D·전투·보스·HUD 원본 1600×900 PNG | 전부 미생성·시각 미검수 |
| 캡처 격자·장면별 시각 판정 | 미생성: 이번 캡처 없음. 과거 화면으로 대체하지 않음 |
| `지옥의 길 (Unity 미리보기).lnk` | 미생성: 존재하지 않는 EXE를 대상으로 만들지 않음 |
| 기존 `지옥의 길 (Unity).lnk` | 보존. 대상 `I:/EXODUSER-Storage/unity-latest/build/EXODUSER-Unity.exe`, 인자 없음. SHA-256 `5802346D9ED491C5E50331E75F25ECD329720E9DA2D28D687A31C1A0AC681D06` |
| 손 조작·청음·Mac 실제 동기화·Steam | 이번 작업에서 미확인·미실행 |

## Git·보존·디스크

- 이번 fetch 후 원격 16개 끝점은 인수 전과 같고, 모두 코드 `6da76bcce`의 조상이다. `resume-assembly/branch-proof.json`에서 각 SHA·동일 여부·포함 여부를 확인했다.
- 코드 수정 두 커밋 모두 미리보기 전용 브랜치에 비강제 push하고 원격 SHA를 대조했다. 최종 문서 커밋·main docs 반영 증거는 `remote-proof.json`에서 확인한다.
- E: 여유는 재개 약 48.11GiB, 두 번째 Unity 시작 전 47.55GiB, 종료 확인 46.52GiB다. 30GiB 미만 중단 조건은 발생하지 않았다. 로그·백업·진단 산출물은 I:에만 뒀다.
- 기존 `tools/guard.baseline.json`의 미스테이징 변경과 기존 Unity 생성 미추적 .meta는 보존했다. 이 작업 커밋에 넣지 않았다. 미인수 전사 소스·에셋도 보존했다.
- 원본 보고는 `resume-assembly/REPORT-재개전.md`, 이번 소스 증거는 `resume-assembly/source-proof.json`, 바로가기 조회는 `resume-assembly/shortcuts.json`에 있다.

================= MAP PRODUCTION REPORT =================

STAGE: 1-1 미리보기 후보 통합. 맵 제작·배치 변경 없음.
MASTER: silhouette·regions·main route·side spaces = 기존 후보 보존, 실행 검수 미완료.
OUTER MASS: LEFT·RIGHT·TOP·SOUTH·major holes = 캡처 없어 미검수.
LARGE: source assets·composites·overlap·repeated silhouette = 후보 소스 포함만 확인.
MEDIUM: connections·remaining holes = 미검수.
GROUND: shadow·contamination·structure integration = 미검수.
PLAYABLE: main arenas·travel·breathing·threat space·combat readability = Player 부재로 미검수.
LANDMARK: primary·secondary·tertiary = 미검수.
CAMERA QA: START·EARLY·ARENA·SIDE L·SIDE R·LANDMARK·LATE·EXIT = 전부 미검수.
TECH QA: route·collision·seam·loading·performance = 미검수. pageerror·404 = 브라우저 미실행. Unity compile = 실패.
FILES: stage-owned = asmref+.meta·M1 캡처 규격·관련 docs; concurrent touched = 없음; unrelated touched = 기존 baseline 보존.
GIT: staged = 자기 경로만; commit = 미리보기 전용; push = 비강제; deploy = 없음.
VISUAL VERDICT: FAIL — 미리보기 검수 산출물 부재에 따른 검수 차단. 아트 자체의 시각 판정은 미실행.
NEXT PASS: 전사 임포터·필수 자산 소유권 인수 → 새 검수 단위에서 컴파일 0 → RM1 씬 포함 빌드 → 숨은 M1·3D 캡처·격자·바로가기.

================= 끝 =================


## 09시 후속 인수 — brief2 승인 범위

`unity-preview-brief2.md`의 명시 인수 지시에 따라 캐릭터 총괄의 `pc-unity-char` 미커밋 원본을 같은 경로에 동일 바이트로 복사했다. 원본 폴더는 수정하지 않았다.

| 인수 파일 | 의존성·계약 | 상태 |
|---|---|---|
| `Editor/CharacterLab/WarriorImport.cs` + `.meta` | UnityEditor·UnityEngine·표준 라이브러리만 참조. 프리팹 `Assets/Exoduser/Art/Characters/Warrior/Warrior.prefab` | 컴파일 의존성 인수, 임포터 실행·전사 자산 채택 아님 |
| `Editor/CharacterLab/WeaponImport.cs` + `.meta` | UnityEditor·UnityEngine·표준 라이브러리만 참조. 대검 길이 `1.60f`, 프리팹 `Assets/Exoduser/Art/Characters/Warrior/Weapon/Warrior_Greatsword.prefab` | 위와 같음 |

같은 폴더의 추가 `.cs` 의존성은 없다. 직전 실패 `41bfcae6`의 CS0103 세 곳이 수정 전 실패 근거이며, 후속 Win 빌드에서 실제 컴파일 해소를 검증한다. 원본·대상 SHA-256은 `I:/EXODUSER-Storage/unity-preview/resume-brief2/인수-증거.json`에 보존했다. `unity/main`은 변경하지 않는다.


## 2026-10-29 미리보기 통합 중 보스 부활 예외 수정

| 항목 | 확인·변경 |
|---|---|
| 실패 근거 | M1 `player-8628b9b7.log`에서 보스 사망 시 `RunWebDeath` NullReferenceException. 기존 kill-wire-test도 `Simulation.Death.cs:143`에서 동일 실패 |
| 원인 | `EnemyHurt.DeathHead`는 BossRevive·Decoy·Doppelganger 조기 반환 시 `null`을 돌려준다. 침강 위험요소 제거 분기가 반환값을 무조건 역참조했다 |
| 최소 수정 | `head != null`일 때만 `_sinkDruid`를 읽고 `Druid.ClearSinkHazards()`를 호출한다. 실제 침강 시 정리는 보존하고 부활 판정·난수·수치는 바꾸지 않는다 |
| 회귀 | 기존 `kill-wire-test` 수정 전 예외 재현 → 수정 후 **31검사 / 0실패**. 보스 즉시 부활·최종 침강·보상·사망 꼬리 연결 검사 포함 |
| 범위 | 미리보기 전용 브랜치. Unity 재빌드·최종 M1 결과는 `UNITY_PC_PREVIEW_ALL_20261029.md`에서 갱신한다 |

증거: `I:/EXODUSER-Storage/unity-preview/resume-brief2/kill-wire-red.log`, `kill-wire-green.log/json`.

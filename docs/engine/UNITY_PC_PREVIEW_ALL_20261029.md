# Unity 전체 미리보기 통합 보고 — 2026-10-29

## 현재 판정

**작업 미완료: 브랜치 통합은 완료했으나 Windows 빌드는 컴파일 오류로 2회 실패했다.** COMMON_RULES.md의 “테스트 실패는 원인 수정 후 1회 재실행, 2번 실패면 멈추고 기록”에 따라 추가 Unity·Player 실행을 중단했다. 빌드·스모크·캡처·격자·미리보기 바로가기는 아직 없다. 과거 실행본이나 과거 캡처를 이번 결과로 대체하지 않았다.

- 실제 소유 경로: `E:/exoduser-wt/codex-unity-integrator`.
- 브랜치: `codex/pc-preview-all-20261029`.
- 시작 공통 원격: `1ae7366a3d17272db4ff8871ff9fc180a21c13b7`.
- 코드 수정 체크포인트: `c36431bc76d5cae485ca831c1b7bc42d8383ac79`(Cinemachine 참조 보완). 보고·인계 docs 후속 커밋은 별도로 남긴다.
- 최초 통합 `2b974826a4aa3dd5eee4ff84ae30c60d574fe7f5`는 비강제 push했다. 수정·최종 보고의 원격 확인은 `remote-proof.json`을 따른다.
- `unity/main`은 이 작업에서 커밋·병합·push하지 않았다. 조회 원격 SHA는 시작과 같은 `1ae7366a3d17272db4ff8871ff9fc180a21c13b7`다.

## 포함 브랜치와 SHA

fetch 후 아래 원격 끝점을 고정했다. 16개 모두 최종 코드 체크포인트의 조상임을 `source-proof.json`에서 확인했다. 브리프의 RM0/RM2/RM3/RM4/arena/VFX/character/sound 이전 SHA는 아래 동일 계보 최신 tip에 포함되어 중복 병합하지 않았다. H5 작업 브랜치는 병합하지 않았다.

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

## 컴파일·빌드 결과

| 차수 | 실행기 job | 결과 | 원인·처치 |
|---|---|---|---|
| 1 | `a734042a` | 실패, exit 1 | Runtime의 `NativeGame.Remodel3D.cs:5,20`에서 CS0234·CS0246. C-01 asmdef에 `Unity.Cinemachine` 참조가 누락됐다. 참조 한 항목과 관련 docs를 별도 `c36431bc7` 커밋으로 보완했다. |
| 2 | `930e5a24` | 실패, exit 1 | Runtime 컴파일 단계는 통과했으나 Editor `Rm4SliceBuilder.cs:1004`가 `Rm4PoolLightCuller`를 찾지 못했다(CS0246). 2회 실패 규칙에 따라 추가 실행하지 않았다. |

두 번째 실행은 참조 수정이 스테이징된 상태에서 시작됐고, 같은 내용이 실행 중 `c36431bc7`로 커밋됐다. 실패 빌드이며 이 커밋의 성공 바이너리 증거는 없다.

두 작업 모두 Unity 6000.6.7f1·공용 `exo-unity.ps1`·격리 저장소를 사용했다. 필수 로비 영상 복원과 9개 영상 누락 검사는 통과했다. 사용자 세이브 변경은 두 작업 모두 0이다. 종료 후 실행기에서 Unity PID 종료를 확인했고 최종 프로세스 조회에도 Unity·EXODUSER-Unity가 남지 않았다. 소리·사용자 창을 띄우는 경로는 사용하지 않았다.

원본 로그·실행기 영수증 사본: `a734042a.log/json`, `930e5a24.log/json`. 출력 EXE는 존재하지 않아 `build-receipt.json` 성공 영수증도 없다.

## 남은 컴파일 원인과 다음 단위

`Rm4PoolLightCuller.cs`는 누락된 파일이 아니다. `Assets/Exoduser/Remodel/CH1_4/`에 존재하지만 새 `Exoduser.Editor` asmdef 바깥 기본 어셈블리에 들어간다. 명시 asmdef는 기본 `Assembly-CSharp` 타입을 직접 참조할 수 없어 컴파일이 끊긴다. 같은 경계에는 `CH1_3/Rm3PoolLightCuller.cs`와 `BossArenas/ArenaChannelPlan.cs`도 있다. 다음 수정 단위는 이 Remodel 스크립트들의 어셈블리 귀속과 Editor 참조를 함께 정리하는 일이다. 파일 이동·임시 stub·타입 삭제로 회피하지 않았으며 아직 수정·재검증하지 않았다.

## 빠진 결과와 이유

| 요구 결과 | 상태·이유 |
|---|---|
| 컴파일 0 오류·Windows 빌드 | 미완료: 두 번째 컴파일 오류와 실행 중단 규칙 |
| 무창 M1 스모크 | 미실행: 실행할 미리보기 Player가 없음 |
| 로비·1-1 3D·전투·보스·HUD 1600×900 캡처 | 모두 미생성·시각 미검수: 성공 빌드 없음 |
| 캡처 격자와 장면별 판정 | 미생성: 이번 빌드 캡처 없음 |
| `지옥의 길 (Unity 미리보기).lnk` | 미생성: 존재하지 않는 EXE를 가리키는 바로가기를 만들지 않음 |
| 기존 `지옥의 길 (Unity).lnk` | 보존: 대상 `I:/EXODUSER-Storage/unity-latest/build/EXODUSER-Unity.exe`, 인자 없음 |
| 게임 전체 최신·Mac 동기화·손 조작·청음 | 미확인: 이번 브랜치 통합만으로 완료 판정하지 않음 |

RM2·RM3·RM4·arena·캐릭터·VFX 후보의 소스 포함은 해당 콘텐츠가 실제 플레이 동선에서 연결됐다는 증거가 아니다. 후속 빌드 뒤 도달 가능 장면과 미연결 후보를 구분해야 한다. 사운드 후보의 기존 사용자 청음 대기는 이번 통합으로 승인되지 않는다.

## 보존과 디스크

E 여유: 시작 48.71GiB, 빌드 전 약 48.45GiB, 종료 약 48.45GiB. 30GiB 미만 중단 조건에는 해당하지 않았다. 산출물은 모두 I:에 뒀다. 타 팀 WIP·기존 빌드·사용자 세이브를 수정·삭제하지 않았다. 커밋 훅이 `tools/guard.baseline.json`의 줄 수를 64266→65693으로 자동 갱신한 미스테이징 변경은 보존하고 미리보기 코드 커밋에는 넣지 않았다. Unity 임포트가 만든 미추적 .meta 55개는 현재 실행 자산의 임포트 메타데이터로 보존했고 임의 stage·삭제하지 않았다(정확한 목록은 `source-proof.json`).

================= MAP PRODUCTION REPORT =================

STAGE: 1-1 미리보기 통합 검수 준비. 실제 맵 제작·배치 변경 없음.

MASTER: silhouette·regions·main route·side spaces = 기존 후보 보존, 실행 검수 미완료.
OUTER MASS: LEFT·RIGHT·TOP·SOUTH·major holes = 캡처 없음으로 미검수.
LARGE: source assets·composites·overlap·repeated silhouette = 후보 포함만 확인.
MEDIUM: connections·remaining holes = 미검수.
GROUND: shadow·contamination·structure integration = 미검수.
PLAYABLE: main arenas·travel·breathing·threat space·combat readability = Player 부재로 미검수.
LANDMARK: primary·secondary·tertiary = 미검수.
CAMERA QA: START·EARLY·ARENA·SIDE L·SIDE R·LANDMARK·LATE·EXIT = 전부 미검수.
TECH QA: route·collision·seam·loading·performance = 미검수. pageerror·404 = 브라우저 미실행. Unity compile = 실패.
FILES: stage-owned = 미리보기 통합 docs·Runtime asmdef; concurrent touched = 없음; unrelated touched = 훅 생성 baseline 보존.
GIT: commit = 미리보기 전용; push = 비강제; deploy = 없음.
VISUAL VERDICT: 미검수(성공 빌드·캡처 없음, PASS 판정 불가).
NEXT PASS: Remodel 어셈블리 경계 수정 → 새 검증 단위 → 성공 빌드 → M1·3D 캡처·격자·바로가기.

================= 끝 =================

# 병합 대기 브랜치 한 판·설정 예외 정적 점검 2차 — 2026-11-04

기준 SHA: `dc838b5ab9809f844d06268dbb0224875ca5d28a`. 보고 커밋은 이 문서의 최신 변경 커밋이며 레인 REPORT.md 첫 줄에 실제 SHA를 기록한다. 실행본 반영 없음.
관문: **정적 점검·제안 작성**, 코드 적용 0. Runtime 변경 파일 39/32/14개, 중복 제외 **52개**. 상위 위험 10개: 확실(정적 논리) 1 / 가능 5 / 낮음 4. 실발생을 새로 확인한 예외 0건이라는 뜻이 아니라, **실행 자체를 하지 않았다**.
다음: 유니티 총괄이 통합 후보의 구형 필드 수명 처리를 최신 필드본과 대조한 뒤 공통 제안 5개를 선별 검토한다. Unity HALT 유지, 컴파일·Mac 한 판·디자인 판정은 미검증.

## 상위 10 위험

줄 번호는 아래 고정 SHA에서의 `unity/Assets/Exoduser/Runtime/` 상대 경로다. C=통합 후보, O=설정 2차, F=최신 필드. ‘확실’은 조건부 경로의 정적 논리가 확정됐다는 뜻이며 실제 예외 재현 확정이 아니다. ‘가능’도 정상 자산·정상 한 판에서 도달했다고 주장하지 않는다. 기존 코드에서 이어진 항목은 신규 회귀와 구분했다. 담당은 모두 **유니티 총괄**이다.

|순위·등급|브랜치·파일:줄|발생 조건·근거|최소 제안·현재 상태|
|---|---|---|---|
|R01 확실(정적 논리)|C `NativeTransitionPrepare.cs:74~82`|stall·hard-cap·owner-disabled가 `Abort(false)`로 들어오면 실패 횟수를 늘리지 않는다. 다음 필드 진입은 deferred를 지워 같은 중단을 횟수 제한 없이 되풀이할 수 있다. 예외를 관측했다는 판정은 아님.|**F:74~85에서 중단 사유 전체를 1회 재시도 상한으로 보완함.** C만 잔존. 기존 F 수정을 우선 인수하고 별도 중복 패치는 만들지 않음.|
|R02 가능|C `NativeGame.Remodel3D.cs:85~90,104~108`|비동기 로드가 완료됐지만 코루틴이 r3Scene을 저장하기 전 중단하면 op.isDone=true·r3Scene=default일 수 있다. 이때 `R3UnloadScene(r3Scene)`은 아무것도 회수하지 않아 고아 장면·카메라/리스너가 남을 위험. 정확한 실행 순서·도달 여부 미검증.|**F:89~93의 GetSceneByName 폴백으로 보완됨.** C만 잔존. F 인수 우선.|
|R03 가능|C `NativeGame.Remodel3D.cs:85~91`, `NativeGame.A2Field.cs:63~70,97~118`|필드 조립 중단 때 장면은 내리지만 new Mesh/Material/Texture2D의 명시적 소유·파괴 처리가 없다. 참조를 버리고 다음 입장에서 다시 만들므로 반복 중단 때 native 자산 누적 우려. 실제 메모리 증가·크래시 측정 없음.|**F:93~103 및 생성 지점 R3Track으로 보완됨.** C에 새 정리 코드를 따로 중복 제안하지 않고 최신 F 대조. 성공 후 자산은 세션 유지 계약.|
|R04 가능|C `NativeTransitionPrepare.cs:92~104`, `NativeGame.Remodel3D.cs:60~62`; F 같은 파일 `:104~116`, `:61~63`|StopCoroutine으로 중단할 때 바깥 finally는 진행 토큰만 끝낸다. 수동으로 MoveNext한 AssemblyGuard와 내부 iterator를 Dispose하지 않아, 내부 A2FieldSetup finally(카메라 복원·진행 종료)가 실행될 보장이 없다. 정상 종료/예외 종료는 별개. Abort의 Release·카메라 끄기가 일부 증상을 가림.|`shared-coroutine-dispose.patch`: 바깥 소유자와 guard 스택 양쪽에 Dispose 보장. Unity StopCoroutine 시 실제 finally 전달은 미검증.|
|R05 가능|C `NativeGame.Remodel3D.cs:110~118`; F `:122~130`|로드된 장면에 필수 rig/Terrain/Camera 컴포넌트가 없으면 r3Failed만 세우고 yield break. 유효한 additive 장면은 내려가지 않는다. Camera가 있는 rig 일부 누락 분기는 listener 비활성화보다 먼저 종료하므로 활성 카메라·오디오·Volume이 남을 수 있음. 파손 rig의 현재 유입은 확인 안 됨.|`shared-invalid-rig-cleanup.patch`: 해당 2분기를 기존 AssemblyGuard 오류 경로로 넘겨 Abort/teardown 수행. **명시적 진단 예외를 잡아 복구하는 제안**, 로그 예외 0을 보장하는 제안 아님.|
|R06 가능|C·F `NativeGame.A2Field.cs:51~52`; C Remodel3D `:126~128`, F `:138~140`|필수 지면 재질을 못 찾으면 내부 조립만 정상 종료한다. 상위는 성공으로 돌아와 r3Loaded=true를 세우므로 절반 필드가 준비 완료로 열릴 수 있다. 원래 동기 코드의 필수 준비 계약 부채가 async에도 잔존. 현재 생성 경로에서 실제 재질 누락은 미확인.|`shared-required-field-material.patch`: 해당 필수 실패만 guard에 전달. 선택 장식 누락은 그대로 유지. 이 패치도 명시적 진단 예외·2D 복구이며 성공 위장 방지 목적.|
|R07 낮음|C·F `NativeGame.A2Field.cs:51~79,80~82`|여러 프레임을 yield한 뒤 r3Cam을 GetUniversalAdditionalCameraData·depthTextureMode 등에서 사용한다. 조립 중 외부 장면 회수/카메라 파괴가 끼면 MissingReference/NRE 가능. 정상 Abort는 코루틴을 먼저 중단하며 guard도 예외를 잡으므로 정상 경로에서 독립 도달은 확인 못 함.|임의 외부 파괴를 확정 결함으로 올리지 않음. 기존 guard/Abort 유지·Mac에서 중단 경계 확인. 중복 방어 패치 없음.|
|R08 낮음|C·O `NativeDemoEndText.cs:13~16`, `BuildFlavor.cs:87~88`, `NativeStageClearOverlay.cs:148~149`|새 데모 종료 표 로더는 Resources 결과·bundle.entries·행을 무검사로 읽고, 요청 언어와 en이 없으면 null을 반환한다. 호출자가 .demoSub/.demoNext를 바로 읽어 NRE 가능. 공용 완료 라벨 로더도 잘못된 표 구조에 취약. **현재 두 브랜치 표는 29언어·en·데모 3필드 모두 정상**.|`shared-demo-end-labels.patch`: 잘못된 표를 안전하게 건너뛰고 기존 완료 화면 기본 문구 사용. 번역 내용의 품질·정확성 검증은 별도.|
|R09 낮음|F `NativeGame.A2RootRelief.cs:45~48`|MeshFilter가 정확히 1개이지만 sharedMesh가 null인 prefab이면 :46의 isReadable에서 NRE. 이번 F에서 추적 대상으로 바꾼 Instantiate보다 먼저 실패한다. **기준본에도 같은 선행 검사 누락이 있어 신규 회귀로 세지 않음**. 현재 prefab 손상 미확인.|`field-rootrelief-null-mesh.patch`: null 메시를 기존 부조 제외 분기로 보냄. 필터 수·정점 색 조건은 유지.|
|R10 낮음(상태 잔존)|O `NativeGraphicsOptions.cs:16~18,51~71`|postfx/bloom을 끈 동안 장면이 내려가면 savedWeight/savedBloom에 파괴된 Unity 객체의 관리 참조가 남는다. 재검색은 살아 있는 새 객체만 갱신하며 오래된 키는 두 설정을 모두 켜거나 종료해야 비운다. **기존 복원 루프는 Unity-null 검사하므로 이 항목의 직접 NRE 근거는 없음**. 장면 교체 뒤 캐시 수명 부채로만 분류.|파괴된 키만 제거하는 정리 권고. 실제 메모리 영향은 미측정. 제안 생성기 2회 실패 후 추가 생성을 중단해 이 항목 패치 없음. 크래시 차단 필수 수정으로 확대하지 않음.|

## 브랜치별 요약

|구분|고정 SHA·변경 Runtime C# 수|요약|
|---|---|---|
|기준|`dc838b5ab9809f844d06268dbb0224875ca5d28a`|시작 fetch 뒤 최신 origin/unity/main. 이후 움직이는 ref 대신 이 SHA로 점검.|
|C 통합 후보 3차|`856d4eaa5b7954f077fa3f6e8b1344184ee06091` · 39개|R01~R03의 구형 필드 처리가 남음. 1차 감사의 루트 생존 검사·폰트 이름·demo_text/hellgate 구조 검증은 이미 반영돼 재배정하지 않음.|
|O 설정 2차+BGM P1|`0da3d7822dc632a211b030c3dbee768ceda8a851` · 32개|C와 저장 경로·프리셋·기본 BGM 선택 공통. 추가 커서/그래픽/BGM P1 변경 확인. R08 공통, R10 전용. 필드 새 수명 코드는 이 브랜치 변경분 아님.|
|F 필드 전환 최신|`741b2d6b0dff88f00b7299f155051064f65a951a` · 14개|R01~R03 보완 존재. 공통 guard 취소·잘못된 rig·필수 조립 실패 계약은 남음. R09는 기존 코드에서 잔존.|

동일 blob은 한 번 읽고 다른 브랜치의 동일성을 Git 객체 ID로 대조했으며, 서로 다른 blob은 각 변경분을 확인했다. 브랜치끼리 임의 병합하거나 Runtime을 worktree에 복사하지 않았다. 위 위험 행에 여러 브랜치를 함께 적어 중복 배정하지 않았다.

## 데이터·세이브·입력 경계 확인

- Node로 브랜치별 JSON 10개, 총 30개 스냅샷을 파싱했다. 대상은 buildflavor_web, stageclear_labels, stageclear_web, demo_text, hellgate_objectives, death_web, death_decision_text, a15_options_web, visual_select_labels, screen_transition_labels. 언어 행/코드가 있는 7표는 각 29개 고유 코드와 en을 보유했다. demo_text·a15_options_web의 null/길이 불일치·중복 키 0, death_web petPool 참조 키 누락 0. 각 문자열·포맷 인수·Unity 패키지 포함을 전수 검증한 것은 아니다.
- C/O의 stageclear_labels는 demoSub/demoNext/demoWishlist 빈 필드 0. F에는 신설 demoWishlist가 없으나 F의 Runtime은 그 필드를 요구하지 않으므로 단독 예외 결함으로 세지 않았다. 브랜치 병합 때 표 전체를 구버전으로 덮어쓰면 안 된다.
- BGM values/labels의 언어별 길이 불일치 0. C/O가 사용하는 기본·회전 곡과 O의 추가 곡에 대응하는 추적 리소스는 존재한다. O의 forge는 실제 클립 forge가 아니라 NativeBgmCues가 3개 take로 변환한다. 단순 이름 대조가 만든 ‘forge 없음’은 결함에서 제외했다. F에는 새 회전곡을 요구하는 Runtime 변경이 없어 그 파일 부재도 결함으로 세지 않았다. 실제 AudioClip import/재생·청취는 미검증.
- O 커서 PNG bytes 경로 2종×12단계 24개 존재. Apply는 kind를 clamp하고 step은 Steps에서 고르므로 private Load의 인덱스를 현재 호출로 범위 초과시킨다는 근거는 없음. 키 포커스는 StopCount/IsSlot/IsReset과 Listed 개수 검사를 거친다. 프리셋 슬롯 호출은 0/1 고정, 언어 선택은 Count 내에서 이동한다. 무검사 private API만 보고 실제 범위 오류로 올리지 않았다.
- 저장 루트는 C/O NativeFlavorStorage에서 full의 공식/구제품만 legacy root, demo/BIC/EA는 namespace 하위로 정한다. 빈 BIC/EA SaveNamespace는 고정 flavor 이름 기반으로 보완한다. QA는 sandbox를 먼저 선택하며 명령행 flavor를 허용한 실행도 QA로 분류한다. 실제 사용자 저장 폴더는 열거나 쓰지 않았다.
- NativeGame.CombatSave.cs:24~29(변경 없는 호출 의존성)은 roster 부모 아래 combat-save-v1을 선택하므로 이번 roster 루트 변경을 따른다. settings만 옮기고 combat을 원래 루트에 남긴다는 결함은 확인되지 않았다.
- NativeSettingsStore의 Read/Acquire/TrySave는 IOException·UnauthorizedAccessException을 상태로 반환하고 잠금·revision 충돌·잘못된 스키마를 보존한다. CharacterRosterStore도 같은 보호 경로를 확인했다. 새 flavor 경로 해석은 Argument/NotSupported/PathTooLong/Security 오류를 false로 돌린다. **실제 OS 권한·파일 잠금·정상 재시작 IO는 시험하지 않았다.** 의도적인 QA sandbox 실패 종료는 실제 세이브 폴백 결함으로 바꾸지 않았다.
- NativeOptionText는 표 누락/구조 오류 시 byKey를 비우고 기존 문구를 반환한다. 언어 전환으로 없는 사전 키를 바로 인덱싱한다는 신규 경로는 찾지 못했다. C의 m.resetConfirm 부재는 그 브랜치에서 새 확인창을 호출하지 않으므로 예외 위험으로 세지 않았고, O에는 키가 있다.
- 재시작/로비/이어하기 호출 의존성으로 ResetRun, CombatBeginRun/Restore, StageFlow, NativeLobby 전환을 읽었다. 이번 변경만으로 확정된 별도의 전투 상태 유실·중복 저장 예외는 찾지 못했다. 보스 로직·Core 전투 수치·전체 VFX 풀의 무결성을 검증했다는 뜻은 아니다.

## 제안과 검증 범위

레인 `proposed/*.patch` 5개를 만들었다. 아래 부록은 같은 소스 변경이며 Markdown 안 줄바꿈은 LF로 표시한다. 독립 .patch는 각 소스의 문맥 줄바꿈을 유지한다. 실제 Runtime·실제 Git 인덱스에 적용 0.

|패치|대상·확인|
|---|---|
|shared-coroutine-dispose.patch|C/F 각각 임시 인덱스 git apply --check --cached 통과|
|shared-invalid-rig-cleanup.patch|C/F 각각 같은 문맥 검사 통과|
|shared-required-field-material.patch|C/F 각각 같은 문맥 검사 통과|
|shared-demo-end-labels.patch|C/O 각각 같은 문맥 검사 통과|
|field-rootrelief-null-mesh.patch|F 문맥 검사 통과|

문맥 검사 **9건 통과**, C# 컴파일·Unity IEnumerator 취소 동작·자산 import·Mac Player·자연 한 판·실청취는 모두 미검증이다. 패치는 합쳐 적용하거나 병합한 결과를 검증하지 않았다. R05/R06은 잘못된 필수 준비를 정상 성공으로 넘기지 않는 복구 제안이므로 로그의 진단 예외를 제거하는 패치라고 보고하면 안 된다.

제안 생성기의 원문 문자열 일치 검사에서 BuildFlavor 들여쓰기 1회, 그래픽 캐시 들여쓰기 1회로 **총 2회 실패**했다. 두 번째 실패 뒤 생성기 재실행·추가 패치 생성은 중단했다. 그 전에 만들어진 5개만 독립적인 Git 임시 인덱스 문맥 검사로 확인했으며, 그래픽 캐시 패치는 미생성으로 남긴다. 실패한 검사를 PASS로 바꾸거나 Unity 테스트를 실행한 것으로 쓰지 않았다. 임시 인덱스는 검사 뒤 제거했다.

## 작업 경계·인계

- 작업 전 지정 origin/unity/main:CLAUDE.md, 두 매뉴얼, 1차 감사, 관련 설정·전환·세이브 문서를 읽었다. 메모리 레지스트리는 관련어 검색만 했고 이 보고서의 사실 근거로 사용하지 않았다. 감사 방법은 systematic-debugging의 변경·원인·경계 추적을 적용했다.
- docs 전용 sparse worktree `I:/exoduser-wt/codex-run-exception-audit2-20261104`, 브랜치 `codex/unity-run-exception-audit2-20261104`. LANES에 이 감사 레인 배정이 있음을 확인했다. 쓰기 소유권은 이 문서 한 파일과 Git 밖 레인 산출물뿐이다. cto-unity-rules의 타 세션 tracked WIP는 읽거나 수정하지 않았다.
- I: 여유 약 8.97TB, G: 약 96.5GB. 새 Unity 작업본·Library·빌드·캡처·캐시를 만들지 않고 I: docs sparse 작업본만 사용했다. G:의 타인 산출물을 정리하지 않았다. 자기 Unity/Player 실행 0, HALT·예약 작업·세이브·실행본 변경 0.
- 지정 절대 경로 WindowsPowerShell·NoProfile·Command로 실행했다. PowerShell에서 Bash의 `</dev/null`은 지원되지 않아 외부 호출은 빈 입력 파이프, Node Git 자식은 stdio ignore로 닫았다. 초기 규칙/브리프 조회는 비대화형 도구 입력으로 실행했다. python 0, I:/EXODUSER-Storage 전체 재귀 검색 0.
- TTY 호출 1회는 도구 호스트가 지정 셸 대신 WindowsApps/pwsh.exe를 시작하려다 CreateProcessW os error 5로 본문 실행 전에 실패했다. 같은 TTY 오류를 반복하지 않고 이미 정상인 지정 PowerShell 비TTY 경로로 이어갔다. 이 실패는 Git·검사 성공 증거가 아니다. exFAT 작업본은 실제 .git 공용 경로 확인 뒤 정확한 경로에만 명령 범위 safe.directory를 사용했다. 전역 신뢰·권한·인증 설정 변경 없음.
- 브리프의 **docs 1파일 제한**을 우선해 CHANGELOG_SYNC·기존 SSOT·Runtime은 수정하지 않는다. 원격 push·SHA 대조 결과는 Git 밖 REPORT.md에 최종 기록한다. 이후 줄기 병합·자산 수정·사용자 실행본 갱신은 담당 총괄 범위다.
- 우선 인계: ① C에 F의 R01~R03이 빠지지 않게 통합 ② R04~R06 준비·중단 계약 검토 ③ R08/R09 조건부 방어 선별 ④ HALT 해제 후 동일 SHA로 Mac 정상 입장→필드→드루이드→클리어/사망→재시작/로비→이어하기와 설정 언어·프리셋·잠금 실패 확인. 이번 감사는 제품 PASS가 아니다.

## 점검한 변경 Runtime 파일

아래는 중복 제외 52개이며 변경 hunk를 중심으로 호출 경계를 추가로 읽었다. 전체 프로젝트 정적 분석을 수행한 목록은 아니다.

```text
BuildFlavor.cs
Core/CharacterRoster.cs
Core/LobbyLanguage.cs
Core/NativeBgmRotation.cs
Core/NativeBgmSelection.cs
Core/NativeCursorSteps.cs
Core/NativeGraphicsPolicy.cs
Core/NativeKeyFocus.cs
Core/NativeOptionSet.cs
Core/NativeSettingsJsonCodec.cs
Core/NativeSettingsPreset.cs
HellFogFeature.cs
NativeBgmCatalog.cs
NativeBgmCues.cs
NativeCursorOption.cs
NativeDeathOverlay.cs
NativeDemoEndText.cs
NativeDemoText.cs
NativeFlavorSavePaths.cs
NativeFlavorStorage.cs
NativeGame.A2Bramble.cs
NativeGame.A2Field.cs
NativeGame.A2Forest.cs
NativeGame.A2RootRelief.cs
NativeGame.A2ShoreField.cs
NativeGame.HellEnvironment.cs
NativeGame.HellGround.cs
NativeGame.HellLighting.cs
NativeGame.LobbySmoke.cs
NativeGame.Remodel3D.cs
NativeGame.SettingsOptions.cs
NativeGame.SettingsPersistence.cs
NativeGame.TransitionLoadingCapture.cs
NativeGame.cs
NativeGameMusic.cs
NativeGraphicsOptions.cs
NativeHellGateLabels.cs
NativeKeyBindList.cs
NativeLobby.CharacterPresentation.cs
NativeLobby.CharacterStore.cs
NativeLobby.SilverCharacter.cs
NativeLobby.SilverLobby.cs
NativePauseMenu.A15Web.cs
NativePauseMenu.Keyboard.cs
NativeQaSandbox.cs
NativeRevive.DeathScreen.cs
NativeScreenTransition.cs
NativeStageClearOverlay.cs
NativeStageClearPresentation.cs
NativeTransitionPrepare.cs
Tools/PauseInputCheck.cs
Vfx/KiSlashVfxView.cs
```

## 부록 — 미적용 최소 제안

### field-rootrelief-null-mesh.patch

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.A2RootRelief.cs b/unity/Assets/Exoduser/Runtime/NativeGame.A2RootRelief.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.A2RootRelief.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.A2RootRelief.cs
@@ -43,7 +43,7 @@
                 var go=Instantiate(useRaised?raised:source,a2Root.transform);go.name=useRaised?"A2 거목 높은 스캔 뿌리":"A2 연속 뿌리 부조";
                 go.transform.SetPositionAndRotation(new Vector3(placement.x,baseY,placement.y),Quaternion.Euler(0,placement.w,0));go.transform.localScale=Vector3.one*placement.z;
                 var filters=go.GetComponentsInChildren<MeshFilter>();
-                if(filters.Length!=1||!filters[0].sharedMesh.isReadable||filters[0].sharedMesh.colors.Length!=filters[0].sharedMesh.vertexCount)
+                if(filters.Length!=1||filters[0].sharedMesh==null||!filters[0].sharedMesh.isReadable||filters[0].sharedMesh.colors.Length!=filters[0].sharedMesh.vertexCount)
                 {Debug.LogError("[A2] 부조 메시 읽기/재질 가중 누락. 기존 거목 접합 유지");go.SetActive(false);Destroy(go);continue;}
                 var filter=filters[0];var mesh=R3Track(Instantiate(filter.sharedMesh));var vertices=mesh.vertices;
                 var center=filter.transform.TransformPoint(mesh.bounds.center);
```

### shared-coroutine-dispose.patch

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeTransitionPrepare.cs b/unity/Assets/Exoduser/Runtime/NativeTransitionPrepare.cs
--- a/unity/Assets/Exoduser/Runtime/NativeTransitionPrepare.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeTransitionPrepare.cs
@@ -92,15 +92,17 @@
  internal static class AssemblyGuard {
   internal static System.Collections.IEnumerator Run(System.Collections.IEnumerator root,Action<Exception> fail){
    var stack=new System.Collections.Generic.Stack<System.Collections.IEnumerator>();stack.Push(root);Exception error=null;
-   while(stack.Count>0){
-    var top=stack.Peek();bool more=false;object current=null;
-    try{more=top.MoveNext();if(more)current=top.Current;}catch(Exception e){error=e;}
-    if(error!=null)break;
-    if(!more){stack.Pop();continue;}
-    var inner=current as System.Collections.IEnumerator;if(inner!=null){stack.Push(inner);continue;}
-    yield return current;
-   }
-   if(error!=null){while(stack.Count>0){var d=stack.Pop() as IDisposable;try{if(d!=null)d.Dispose();}catch(Exception){}}fail(error);}
+   try{
+    while(stack.Count>0){
+     var top=stack.Peek();bool more=false;object current=null;
+     try{more=top.MoveNext();if(more)current=top.Current;}catch(Exception e){error=e;}
+     if(error!=null)break;
+     if(!more){stack.Pop();continue;}
+     var inner=current as System.Collections.IEnumerator;if(inner!=null){stack.Push(inner);continue;}
+     yield return current;
+    }
+   }finally{while(stack.Count>0){var d=stack.Pop() as IDisposable;try{if(d!=null)d.Dispose();}catch(Exception){}}}
+   if(error!=null)fail(error);
   }
  }
  // The same curve ScreenTransitionFlow uses for its ember pulse, kept host-side so the pulse keeps breathing
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs b/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
@@ -59,7 +59,7 @@
             string failure = null;
             var run = AssemblyGuard.Run(Remodel3DLoadSteps(), e => { failure = e.GetType().Name + ": " + e.Message; Debug.LogException(e); });
             try { while (run.MoveNext()) yield return run.Current; }
-            finally { NativeTransitionProgress.End(token); }
+            finally { (run as System.IDisposable)?.Dispose(); NativeTransitionProgress.End(token); }
             if (failure != null) Remodel3DAbort("assembly-exception: " + failure, true);
         }
 
```

### shared-demo-end-labels.patch

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeDemoEndText.cs b/unity/Assets/Exoduser/Runtime/NativeDemoEndText.cs
--- a/unity/Assets/Exoduser/Runtime/NativeDemoEndText.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeDemoEndText.cs
@@ -10,9 +10,10 @@
   [Serializable] sealed class Bundle {public Row[] entries;}
   static Bundle bundle;
   public static Row ForLocale(string locale){
-   if(bundle==null)bundle=JsonUtility.FromJson<Bundle>(Resources.Load<TextAsset>("Data/stageclear_labels").text);
+   if(bundle==null){var asset=Resources.Load<TextAsset>("Data/stageclear_labels");if(asset==null)return null;try{bundle=JsonUtility.FromJson<Bundle>(asset.text);}catch(ArgumentException){return null;}}
+   if(bundle==null||bundle.entries==null)return null;
    string code=LobbyLanguage.Normalize(locale);Row english=null;
-   foreach(var row in bundle.entries){if(row.code==code)return row;if(row.code=="en")english=row;}
+   foreach(var row in bundle.entries){if(row==null)continue;if(row.code==code)return row;if(row.code=="en")english=row;}
    return english;
   }
  }
diff --git a/unity/Assets/Exoduser/Runtime/BuildFlavor.cs b/unity/Assets/Exoduser/Runtime/BuildFlavor.cs
--- a/unity/Assets/Exoduser/Runtime/BuildFlavor.cs
+++ b/unity/Assets/Exoduser/Runtime/BuildFlavor.cs
@@ -84,8 +84,8 @@
   // JsonUtility turns a JSON null into a default object, so presence is judged by the sub text
   bool HasClearFinal{get{return def.clearFinal!=null&&def.clearFinal.sub!=null&&def.clearFinal.sub.Length>0;}}
   public bool DemoEndAtStage(int stageIndex){return HasClearFinal&&def.clearFinal.stage==stageIndex;}
-  public string DemoEndSub(string locale){return HasClearFinal?NativeDemoEndText.ForLocale(locale).demoSub:null;}
+  public string DemoEndSub(string locale){if(!HasClearFinal)return null;var row=NativeDemoEndText.ForLocale(locale);return row==null?null:row.demoSub;}
-  public string DemoEndButton(string locale){return HasClearFinal?NativeDemoEndText.ForLocale(locale).demoNext:null;}
+  public string DemoEndButton(string locale){if(!HasClearFinal)return null;var row=NativeDemoEndText.ForLocale(locale);return row==null?null:row.demoNext;}
   public string DemoEndSub(bool english){return DemoEndSub(english?"en":"ko");}
   public string DemoEndButton(bool english){return DemoEndButton(english?"en":"ko");}
   // web: 'v'+version+' · '+date without dashes (index.html _LOBBY_VER)
diff --git a/unity/Assets/Exoduser/Runtime/NativeStageClearOverlay.cs b/unity/Assets/Exoduser/Runtime/NativeStageClearOverlay.cs
--- a/unity/Assets/Exoduser/Runtime/NativeStageClearOverlay.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeStageClearOverlay.cs
@@ -145,11 +145,11 @@
   // ---- window ----
   [Serializable] sealed class LocaleRow {public string code,title,hellTitle,sub,time,kills,reward,sp,regions,potions,deaths,score,next,demoSub,demoNext,demoWishlist;}
   [Serializable] sealed class LocaleBundle {public LocaleRow[] entries;}
-  readonly Dictionary<string,LocaleRow> localeRows=new Dictionary<string,LocaleRow>();Font japanese,latin;
+  readonly Dictionary<string,LocaleRow> localeRows=new Dictionary<string,LocaleRow>();Font japanese,latin;bool localeRowsTried;
   public bool AuditText;public int MissingGlyphs{get;private set;}public readonly List<string> VisibleTexts=new List<string>();
   string EffectiveLocale{get{string c=Exoduser.UnityPort.Core.LobbyLanguage.Normalize(LocaleCode);return c=="ar"?"en":c;}}
   LocaleRow CurrentLabels(){
-   if(localeRows.Count==0){var asset=Resources.Load<TextAsset>("Data/stageclear_labels");if(asset!=null){var b=JsonUtility.FromJson<LocaleBundle>(asset.text);foreach(var e in b.entries)localeRows[e.code]=e;}}
+   if(!localeRowsTried){localeRowsTried=true;var asset=Resources.Load<TextAsset>("Data/stageclear_labels");if(asset!=null)try{var b=JsonUtility.FromJson<LocaleBundle>(asset.text);if(b!=null&&b.entries!=null)foreach(var e in b.entries)if(e!=null&&!string.IsNullOrEmpty(e.code))localeRows[e.code]=e;}catch(ArgumentException){}}
    LocaleRow row;if(localeRows.TryGetValue(EffectiveLocale,out row))return row;if(localeRows.TryGetValue("en",out row))return row;
    return new LocaleRow{title="ZONE CLEARED",hellTitle="HELL ESCAPED",sub="Prepare, then continue",time="Clear time",kills="Kills",reward="Reward",sp="Stat points",regions="Regions cleared",potions="Potions",deaths="Deaths",score="Score",next="Return to lobby",demoSub="The Rotten Forest is not finished yet.",demoNext="End demo",demoWishlist="Wishlist the full game"};
   }
```

### shared-invalid-rig-cleanup.patch

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs b/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
@@ -109,9 +109,9 @@
             if (!r3Scene.IsValid() || !r3Scene.isLoaded) { r3Failed = true; r3Loading = false; yield break; }
             r3Roots = r3Scene.GetRootGameObjects();
             Transform camT = R3Find("Main Camera"), markerT = R3Find("Player Marker"), vcamT = R3Find("CM LOOK-001"), terrT = R3Find("Terrain");
-            if (camT == null || markerT == null || terrT == null || terrT.GetComponent<Terrain>() == null) { Debug.LogWarning("[RM-INT] RM-1 scene rig / terrain not found: staying 2D"); r3Failed = true; r3Loading = false; yield break; }
+            if (camT == null || markerT == null || terrT == null || terrT.GetComponent<Terrain>() == null) throw new System.InvalidOperationException("RM-1 scene rig / terrain missing");
             r3Cam = camT.GetComponent<Camera>(); r3Marker = markerT; r3Vcam = vcamT != null ? vcamT.GetComponent<CinemachineCamera>() : null;
-            if (r3Cam == null) { Debug.LogWarning("[RM-INT] camera component missing: staying 2D"); r3Failed = true; r3Loading = false; yield break; }
+            if (r3Cam == null) throw new System.InvalidOperationException("RM-1 camera component missing");
             r3Brain=r3Cam.GetComponent<CinemachineBrain>();
             if(NativeHd2D.Enabled&&r3Brain!=null)r3Brain.UpdateMethod=CinemachineBrain.UpdateMethods.ManualUpdate;
             NativeRemodel3D.Ground = terrT.GetComponent<Terrain>();
```

### shared-required-field-material.patch

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs b/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs
@@ -49,7 +49,7 @@
                 if(profile.TryGet<ColorAdjustments>(out tone)){tone.postExposure.Override(.55f);tone.contrast.Override(16);}
             }
             NativeTransitionProgress.Report("a2-lights",.04f);yield return null;
-            if(a2FieldSoil==null){Debug.LogError("[A2 필드] 지면 재질 누락");yield break;}
+            if(a2FieldSoil==null)throw new InvalidOperationException("A2 field soil material missing");
             a2FieldSoil.SetFloat("_ForestBlend",1);a2FieldSoil.SetFloat("_ForestTextureMix",.65f);a2FieldSoil.SetFloat("_SoilTextureMix",1);a2FieldSoil.SetFloat("_FullField",1);
             foreach(var pair in new[]{new[]{"_ForestMap","A2_ForestFloor_BaseColor"},new[]{"_ForestNormal","A2_ForestFloor_Normal"},new[]{"_ForestRough","A2_ForestFloor_Roughness"},new[]{"_SoilMap","A2_ForestSoil_BaseColor"},new[]{"_SoilNormal","A2_ForestSoil_Normal"},new[]{"_SoilRough","A2_ForestSoil_Roughness"},new[]{"_RootMap","A2_ExposedRoots_BaseColor"},new[]{"_RootNormal","A2_ExposedRoots_Normal"},new[]{"_RootRough","A2_ExposedRoots_Roughness"}})
             {
```

END

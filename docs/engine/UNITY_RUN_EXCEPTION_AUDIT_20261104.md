# Unity 1-1 한 판 흐름 예외 위험 정적 점검 — 2026-11-04

기준 커밋: `bea021bcf1b2d20689e9f014834456879c5a722a` / 보고 커밋: 이 문서의 최근 변경 커밋(외부 REPORT.md 상단에 실제 SHA 기록).
점검: C# **30개**(부분 호출 경로 포함, 기준본 27개 + 후속본 3개), JSON **9개**. 위험 **10개: 확실 2 / 가능 5 / 낮음 3**.
관문: **정적 점검·제안 패키지 작성**, 코드 적용 0. Unity 실행·컴파일·Mac 한 판·크래시 0 판정은 **미검증**.

## 상위 10개

아래 줄은 별도 표시가 없으면 기준 bea021bcf의 `unity/Assets/Exoduser/Runtime/` 상대 경로다. ‘확실’은 지정된 과거 로그에서 해당 예외의 발생이 확인됐다는 뜻이다. 현재 기준본에서 재현하거나, 모든 null 피연산자를 확정했다는 뜻은 아니다.

|순위·분류|파일:줄|발생 조건·근거|최소 제안·상태|
|---|---|---|---|
|1 R01 확실(과거 발생)|후속 f1bf8c62b `NativeGame.A2RPlay.cs:27`, `A2RLighting.cs:60`|로그 player-0d6673d4:37~40에서 A2RPlayShot NRE. 촬영은 3프레임+종료 프레임을 yield하며, lighting 본체만 검사하고 나중에 SetHeroSprite가 만드는 Readability를 역참조한다.|시작/로비와 필드 촬영의 준비 조건 구분, 필드는 Ready·카메라·Readability 대기, yield 뒤 생존 재검사, 준비 실패를 영수증 FAIL에 기록. **null 피연산자의 최종 확정은 미완료**. 후속본 전용 패치.|
|2 R02 확실(과거 발생)|`NativeGame.A2Field.cs:270`, `NativeGame.HellLighting.cs:34`, `NativeGame.Remodel3D.cs:64`|같은 로그 :48~57에서 A2FieldAtmosphere → GetComponentsInChildren NRE. HellLighting이 장면 루트를 Destroy한 뒤, 후속 단계 분할/yield가 지난 r3Roots 원소를 사용했다는 08f969779 커밋 설명과 일치한다.|r3Roots 열거 11곳 생존 검사. **08f969779에서 이미 수정됨**. 기준본용 제안에 같은 방어를 담았으며, 후속 통합본에는 중복 적용 금지. 기준본 조립은 동기식이므로 후속 yield 결함을 기준본에서 재현했다고 쓰지 않는다.|
|3 R03 가능|`NativeGame.Remodel3D.cs:51~56`|Additive 로드 뒤 장면 유효성 확인 없이 루트 조회. 이름이 Main Camera인 Transform은 있어도 Camera 컴포넌트가 없으면 GetComponent 결과가 null이고 다음 줄 GetComponent가 NRE.|로드 후 scene.IsValid/isLoaded, Camera 검사 후 기존 2D 대체 실패 경로로 종료. 자산 계약 파괴 시의 조건부 위험, 실제 발생 미확인.|
|4 R04 가능|`NativeGame.Remodel3D.cs:101~108`|LateUpdate의 조건은 r3Cam·Simulation만 검사. 별도로 저장한 r3Marker가 파괴되고 카메라가 살아 있으면 marker.position에서 MissingReference/NRE.|같은 종료 조건에 r3Marker 생존 검사. 현재 기준본에서 marker를 독립 파괴하는 호출자는 확인되지 않아 실제 도달은 미확정.|
|5 R05 가능|`NativeGame.A2Field.cs:198~205`|뿌리 prefab은 있지만 대응 Material이 배포에서 빠지면 new Material(Resources.Load<Material>(...))에 null이 전달됨.|Material 결과를 검사하고 기존 모듈 누락과 같은 오류 기록 후 해당 장식 조립 중단. 정상 재질·Core 수치는 유지. 실제 패키지 누락 미확인.|
|6 R06 가능|`NativeGame.A2Field.cs:212,224,237~245`, `NativeGame.A2Forest.cs:214,230,271`|MeshFilter.sharedMesh가 null이면 isReadable NRE. 수피 normals.Length가 vertices.Length보다 작으면 normals[i] 범위 초과. 이끼 prefab에 Renderer가 없으면 rs[0] 범위 초과.|null 메시 건너뛰기, 노멀 길이 검증, 빈 Renderer 장식 제외. 정상 메시 변형은 유지. 손상 prefab의 실제 유입 미확인.|
|7 R07 가능|`NativeDeathOverlay.cs:155`, `NativeRevive.DeathScreen.cs:201`|결정 화면 Cinzel-400 또는 명조 대체 폰트가 없으면 캐시 키 f.name, 쓰러짐 화면은 감사 메타데이터 tf.name에서 NRE. 렌더 함수 자체의 대체 글꼴 처리보다 앞/뒤에서 직접 역참조한다.|메타데이터·키의 이름 조회만 null 안전하게 변경. 글꼴·스타일·게임 표시 문자열을 새로 만들지 않음. 실제 설치본 폰트 누락 미확인.|
|8 R08 낮음|`NativeDeathOverlay.cs:44~45,58~62`|death_web 누락/빈 구조면 생성자에서 NRE·ArgumentNull. 사망 이벤트나 petPool에 petLines에 없는 키가 있으면 SetLine의 Dictionary 인덱서 KeyNotFound.|선택용 과거 대사/재생 자료만 안전하게 비우고, 없어진 키는 빈 대사. 결정 화면과 행동은 유지. 현재 JSON은 petPool·필수 dd 키 누락 **0**.|
|9 R09 낮음|`NativeDemoText.cs:22~24`|빈 객체·null 행·null texts면 NRE. 중복/null key는 Dictionary.Add 실패. 앞 행이 이미 삽입된 뒤 뒤 행이 실패하면 loaded=false라 다음 호출도 부분 상태에서 재실패할 수 있음.|전체 구조·중복을 먼저 검증한 뒤 사전에 반영. **자료 손상 시 명시적 InvalidOperationException으로 로딩을 중단하는 제안이며 예외 0을 보장하는 수정이 아님**. 현재 81개 entries, 29언어 길이 오류·중복 키 **0**.|
|10 R10 낮음|`NativeHellGateLabels.cs:19,24,31`|영어 행 없는 불완전한 표에서 미등록 언어가 선택되면 locales["en"] KeyNotFound. null/중복 행은 로딩 자체 실패.|구조·키·영어 대체 행을 사전 검증하고 부분 초기화를 막음. **손상 자료는 명시적 로딩 실패로 남김**, 배포 전 검사가 별도로 필요. 현재 표 29언어·en 있음.|
|11 R11 높음(P1)|`Vfx/CombatImpactView.cs:138,244`|피격 클립 렌더러는 생성 직후 enabled=true·sprite=null 상태로 DrawEnemyHits(BeforeCamera)에 노출돼 `c.renderer.sprite.rect`에서 NRE. 적을 때린 프레임에 발생.|생성 직후 `renderer.enabled=false`, DrawEnemyHits 조건에 `c.renderer.sprite==null` 추가(L11, 컴파일 미확인).|
|12 R12 높음(P1)|`NativeGame.PauseFocus.cs:12`|사망 결정 화면("다시 일어선다")에서 창 포커스를 잃으면 SetGameFocus(false)가 menu=true로 바꿔 결정 화면이 일시정지 메뉴에 가려지고 상태가 바뀜.|조건에 `!(Simulation!=null&&PlayerDown&&death.Active)` 추가(L11, 컴파일 미확인).|
|13 R13 중간(P2)|`NativeEnemyRigRenderer.cs:65,68`|사망 연출 중 gone 루프의 SyncActor와 Observe의 SyncActor는 try/catch·failed 가드가 없어 애니메이션 예외가 Sync/피드백 호출 밖으로 전파.|`!a.failed` + try/catch로 실패 시 failed=true·failedIds·Fallbacks++·Fallback(a) (63행 갱신 루프와 동일, L11, 컴파일 미확인).|

## 범위와 서로 다른 소스 버전

- 작업본은 브리프가 지정한 E:/exoduser-wt/codex-run-exception-audit, 브랜치는 codex/unity-run-exception-audit-20261104. NTFS·시작 시 E: 여유 약 1.27TB 확인. 복제본 편집이나 Runtime 수정은 하지 않았다.
- 시작에 지시된 origin/unity/main:CLAUDE.md, 두 매뉴얼, 전역 메모리 관련 항목을 읽었다. 전역 메모리 본문은 Git에 넣지 않았다. 과거 직접 입장 fixture의 예외와 일반 흐름은 구분하라는 주의만 참고했으며, 아래 발생 판정은 이번에 읽은 로그·소스에 근거한다.
- 전체 fetch에서 다른 세션의 원격 추적 ref 경합 1건 발생. 해당 ref를 고치지 않고 unity/main만 fetch했으며, 지정 기준 SHA를 유지했다. 타 checkout의 tools/guard.baseline.json 수정은 건드리지 않았다.
- 기준본에는 NativeTransitionPrepare.cs와 NativeGame.A2RPlay.cs가 없다. 후속 통합 커밋 **f1bf8c62b578904cf7f8ced6c26cc25618c21867**에서 두 파일과 A2RLighting을 추가로 읽었다. 후속 파일을 기준 worktree로 가져오지 않았다.
- player-0d6673d4.log 자체에는 소스 SHA·PDB 줄 번호가 없다. 로그의 메서드명·호출 순서와 후속 소스를 대조한 것이며, 로그 바이너리를 f1bf8c62b와 동일하다고 확인한 것은 아니다.
- 기준본 r3Loaded는 동기식 HellLighting/A2FieldSetup 완료 뒤 설정된다. 후속 단계 분할로 바뀐 시점의 수명 문제는 별도 구분했다. a2Root/r3Cam/Volume의 임의 파괴 경로가 실제 한 판에서 도달한다고 증명하지 않았다.

## 로그 근거

|읽은 경로|확인 결과|
|---|---|
|I:/EXODUSER-Storage/unity-jobs/_exec/logs/player-0d6673d4.log|:37 A2RPlayShot NRE, :48 A2FieldAtmosphere NRE. :40/:57의 ExtractStringFromExceptionInternal은 같은 스택의 일부로 추가 예외 집계하지 않음.|
|I:/EXODUSER-Storage/druid-vfx-candidate/capture-1920/Player.log|SCREEN_TRANSITION_RECOVER return-lobby prepare-timeout (12s) **12회**. 예외 시작 행 없음. 타임아웃은 NRE 12건이 아니며, 드루이드 필수 활성화 실패 로그와 함께 실행 미완주 증거로만 취급.|
|unity-latest/loop/runs/20261104-150218680_8ad7fa3|smoke/ui-check 폴더 없음. 빌드 실행기 로그만 있음. 무예외 실행 성공으로 판단 불가.|
|unity-latest/loop/runs/20261104-145006292_1fe5c43|smoke/ui-check 폴더 없음. 빌드 실행기 로그만 있음.|
|unity-latest/loop/runs/20261104-125554561_44edc52/smoke/player.log|엔진 초기화·Begin MonoManager ReloadAssembly까지의 짧은 로그이며 Exception·NullReference 문자열 없음. ui-check 없음. 한 판 실행 증거가 아니므로 크래시 0 PASS로 올리지 않음.|

최근 회차는 시작 시 디렉터리 시각으로 위 3개를 선택했다. 저장소 전체나 I:/EXODUSER-Storage 전체 재귀 검색은 하지 않았다.

### 전환 타임아웃 해석

기준 NativeScreenTransition.cs:29는 실제 경과 시간을 ScreenTransitionFlow로 전달하고 :32에서 12초 타임아웃을 적는다. 이것만으로 복귀 대상 영상 실패·긴 동기 조립·호출 순서 중 어느 것이 원인인지 확정할 수 없다. 후속 NativeTransitionPrepare.cs:29~43은 진행 박동을 감시하고 Preparing 동안 Core 시계를 멈춘다. 타임아웃을 없애려고 12초 상수를 늘리는 새 패치나 Core 변경은 제안하지 않았다. 기존 후속 조치를 확인하는 참고 사항으로만 남기고 위험 10개에 중복 집계하지 않았다.

## 데이터·경계 확인

- JSON 9개를 Node로 파싱: demo_text, hellgate_objectives, death_decision_text, death_screen_labels, startup_intro, lobby_frontend, screen_transition_labels, death_web, visual_select_labels. 언어표 8개 모두 29개 코드와 en 행 보유, null 상위 행 0. demo_text entries 81개 길이 불일치/중복 키 0. death_web의 petPool·dd_first·dd_repeat5/10·dd_ch0~6 키 누락 0.
- 위 결과는 체크아웃 JSON에 대한 정적 검사다. Unity 직렬화·패키지 Resources 포함·StreamingAssets 영상 존재·모든 빈 문자열·포맷 인수 일치를 검증했다는 뜻은 아니다. null JSON 행이나 빈 번역 필드는 추가 수명 문제와 별개이며, 이번 자료에서 재현 확정하지 않았다.
- 직업 표시 i는 SilverCharacter:118에서 0~4로 제한하며 고정 특성 표는 5×3이다. 언어 메뉴 커서는 Count 내에서 이동한다. Core/LobbyLanguage.GetCode의 무검사 인덱서를 바로 결함으로 보고하지 않았다.
- 재시작 ResetRun:221~248은 연습 연결·적 뷰·피해 표시·VFX 소유자·드롭을 정리하고 새 Simulation을 붙인다. 연습 종료 NativePracticeFlow:42~44도 이벤트 해제와 기존 Simulation 복원 후 뷰를 지운다. 보스방 복귀 StageFlow:191~197은 같은 Simulation을 사용한다. 조사한 경로에서 이전 개체 id 재사용 때문에 발생하는 **확정 예외는 찾지 못함**. 전체 VFX 풀과 모든 코루틴의 부재 증명은 아니다.
- Resources.Load 결과 누락을 이미 검사하고 의도적으로 InvalidOperationException을 던지는 NativeGame.Awake/SpriteFor·아이콘 로더는 검사 없는 NRE와 구분했다. 경고를 없애기 위해 임의 원화나 수치를 대체하지 않았다.

## 제안 패치와 검증

- 레인 proposed/*.patch **9개**. 기준본용 8개는 bea021bcf에서 `git apply --check` 통과. NativeGame.A2RPlay.patch만 f1bf8c62b 전용이며, 임시 Git 인덱스에 해당 트리를 읽어 `git apply --check --cached` 통과. 실제 인덱스와 Runtime에는 적용하지 않았다. 임시 인덱스는 제거했다.
- 아래 부록에 패치 원문을 넣어 **브리프가 허용한 신규 docs 문서 한 파일만 커밋**한다. CHANGELOG_SYNC는 브리프의 파일 제한에 따라 수정하지 않았다. 독립 패치 파일은 레인 폴더에도 제공한다.
- 패치 적용 가능성은 문법·문맥 수준이다. C# 컴파일, Unity 생존 연산자, Mac Player 회귀·시각 품질은 미검증이다. R09/R10은 자료 손상을 조기에 명시하는 패치로, 손상 입력을 정상 한 판으로 만들지 않는다.
- R02의 11곳 방어는 이미 존재하는 08f969779와 겹친다. 최신 총괄 브랜치에 그대로 일괄 적용하지 말고, 현재 담당자 수정과 겹치지 않는 항목만 선별해야 한다.
- Runtime 실파일은 변경하지 않았으며 `git diff --numstat`와 `git diff --ignore-cr-at-eol --numstat`는 모두 빈 결과였다. 신규 보고서 stage 후 두 numstat도 비교한다. `git diff --check`는 쓰지 않았다.
- NativeDeathOverlay 원본은 CRLF 262개·단독 LF 0개다. 해당 제안의 추가/삭제/문맥 소스 줄에 CRLF를 유지한다. 패치 머리글은 LF다. 원본 CRLF 파일의 쓰기 0회.
- 셸은 지정 절대 경로 WindowsPowerShell -NoProfile -Command. TTY 경로는 도구 호스트가 pwsh.exe를 호출하다 os error 5로 시작하지 못했으므로 확인 결과로 쓰지 않았고, 이미 정상 동작한 동일 지정 셸의 비TTY 경로에서 실행했다. PowerShell에서 지원하지 않는 Bash `</dev/null` 대신 비대화형 도구 실행을 사용했고, Node가 띄운 Git 자식의 stdin은 stdio ignore로 닫았다. python·Unity·창·오디오 실행 0.

## 남은 일·인계

1. 총괄은 R01을 현재 A2R 담당 코드와 대조하고, 과거 바이너리의 정확한 null 피연산자를 확정해야 한다. 정상 BeginCharacterEntry와 격리 저장 경로로 검증하고, 준비 실패를 성공 영수증으로 바꾸지 않는다.
2. R02는 수정 커밋 08f969779의 실제 통합 여부와 후속 yield 뒤 루트 방어 유지 여부를 확인한다. 이미 수정된 내용을 새 결함으로 중복 배정하지 않는다.
3. R03~R07의 조건부 위험은 담당자가 실제 배포 자산/수명을 확인한 뒤 필요한 방어만 채택한다. R08~R10은 현 데이터 결함이 아니며, 손상/누락 입력과 부분 초기화가 실제로 차단되는지 별도 검사한다.
4. 적용은 다른 레인의 소유 파일을 관리하는 총괄이 한다. 동일 SHA로 Mac에서 로비→캐릭터→이야기→필드→쓰러짐/부활→보스→사망 재도전/로비→클리어를 확인해야 ‘한 판 예외 0’ 판정 가능하다. 이번 레인은 빌드·캡처·세이브·실행본을 만들거나 바꾸지 않았다.
5. 점검한 명시 흐름 파일의 1회 순회로 추가 탐색을 종료하고 이 시점 결과를 정리했다. 브리프의 2시간 상한까지 의미 없는 추가 탐색을 이어 가지 않는다.

## 점검 파일 목록

|파일(별도 SHA 없는 항목은 기준본)|확인 범위|
|---|---|
|NativeScreenTransition.cs|전체|
|NativeGame.Remodel3D.cs|전체|
|NativeGame.A2Field.cs|전체|
|NativeGame.A2Forest.cs|전체|
|NativeGame.HellLighting.cs|전체|
|NativeLobby.SilverCharacter.cs|전체|
|NativeLobby.SilverLobby.cs|주요 표시·입장 경로|
|NativeDeathOverlay.cs|전체|
|NativeLobbyVideo.cs|전체|
|NativeLobby.Transition.cs|전체|
|NativeGame.StartupFlow.cs|전체|
|NativeGame.StageFlow.cs|전체|
|NativeGame.cs|초기화·ResetRun·Update·적/드롭 갱신·사망/재시작·종료 경로|
|NativeLobby.StartupPresentation.cs|전체|
|NativeLobby.Characters.cs|입장·생성 경로 부분|
|NativeLobby.LanguageMenu.cs|전체|
|NativeGame.CombatSave.cs|전체|
|Core/LobbyLanguage.cs|전체·읽기만|
|NativeLobby.cs|초기화·영상·언어·로비 복귀 부분|
|NativePracticeFlow.cs|전체|
|NativeDemoText.cs|전체|
|NativeHellGateLabels.cs|전체|
|NativeGame.WorldDrops.cs|전체|
|NativeInventory.cs|아이콘 대체 경로 부분|
|NativeLobby.CharacterPresentation.cs|고정 5직업·3특성·지역화 초기화 부분|
|NativeRevive.cs|전체|
|NativeRevive.DeathScreen.cs|전체|
|NativeTransitionPrepare.cs|후속 f1bf8c62b 전체|
|NativeGame.A2RPlay.cs|후속 f1bf8c62b 전체|
|A2RLighting.cs|후속 f1bf8c62b 전체|

## 부록 — 적용하지 않은 제안 패치

각 블록은 proposed/의 동명 파일과 같은 원문이다. 소스 기준이 다른 패치를 섞어 적용하지 않는다.

### NativeGame.Remodel3D.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs b/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs
@@ -49,10 +49,12 @@
             var op = SceneManager.LoadSceneAsync(R3SceneName, LoadSceneMode.Additive);
             while (op != null && !op.isDone) yield return null;
             r3Scene = SceneManager.GetSceneByName(R3SceneName);
+            if (!r3Scene.IsValid() || !r3Scene.isLoaded) { r3Failed = true; r3Loading = false; yield break; }
             r3Roots = r3Scene.GetRootGameObjects();
             Transform camT = R3Find("Main Camera"), markerT = R3Find("Player Marker"), vcamT = R3Find("CM LOOK-001"), terrT = R3Find("Terrain");
             if (camT == null || markerT == null || terrT == null || terrT.GetComponent<Terrain>() == null) { Debug.LogWarning("[RM-INT] RM-1 scene rig / terrain not found: staying 2D"); r3Failed = true; r3Loading = false; yield break; }
             r3Cam = camT.GetComponent<Camera>(); r3Marker = markerT; r3Vcam = vcamT != null ? vcamT.GetComponent<CinemachineCamera>() : null;
+            if (r3Cam == null) { Debug.LogWarning("[RM-INT] camera component missing: staying 2D"); r3Failed = true; r3Loading = false; yield break; }
             r3Brain=r3Cam.GetComponent<CinemachineBrain>();
             if(NativeHd2D.Enabled&&r3Brain!=null)r3Brain.UpdateMethod=CinemachineBrain.UpdateMethods.ManualUpdate;
             NativeRemodel3D.Ground = terrT.GetComponent<Terrain>();
@@ -61,7 +63,7 @@
             r3Cam.depth = view.depth + 10;
             Remodel3DViewport();
             // 원본 피부 결을 지우던 +1.3 EV 노출과 붉은 색조를 이 필드의 프로필 사본에서만 조정한다.
-            foreach (var root in r3Roots) foreach (var volume in root.GetComponentsInChildren<Volume>(true))
+            foreach (var root in r3Roots) if (root != null) foreach (var volume in root.GetComponentsInChildren<Volume>(true))
                 if (volume.profile != null && volume.profile.TryGet<ColorAdjustments>(out var tone))
                 { tone.postExposure.Override(1f); tone.saturation.Override(-18f); tone.colorFilter.Override(new Color(.82f,.9f,1f)); }
             if (System.Array.IndexOf(System.Environment.GetCommandLineArgs(), "--unity-keyshot-baseline") < 0) HellLightingSetup();
@@ -72,7 +74,7 @@
         // by name through the loaded scene: the baked scene has the rig loose at the root; the rebuilt one wraps it in RM1_CameraRig
         Transform R3Find(string name)
         {
-            foreach (var root in r3Roots) { var t = R3FindIn(root.transform, name); if (t != null) return t; }
+            foreach (var root in r3Roots) { if (root == null) continue; var t = R3FindIn(root.transform, name); if (t != null) return t; }
             return null;
         }
         static Transform R3FindIn(Transform t, string name)
@@ -98,7 +100,7 @@
         void Remodel3DLate()
         {
             HellArenaLate();
-            if (!NativeRemodel3D.Active || r3Cam == null || Simulation == null) return;
+            if (!NativeRemodel3D.Active || r3Cam == null || r3Marker == null || Simulation == null) return;
             NativeGroundSkillProjection.BeginFrame(r3Cam);
             bool hidden = view.cullingMask == 0;   // the lobby / startup hides the world through the 2D camera mask: mirror it
             view.cullingMask = 0;                  // the 2D camera only clears the frame while the 3D one draws
```

### NativeGame.HellLighting.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.HellLighting.cs b/unity/Assets/Exoduser/Runtime/NativeGame.HellLighting.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.HellLighting.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.HellLighting.cs
@@ -20,6 +20,7 @@
             hellOldFogStart=RenderSettings.fogStartDistance;hellOldFogEnd=RenderSettings.fogEndDistance;
             foreach(var root in r3Roots)
             {
+                if(root==null)continue;
                 foreach(var v in root.GetComponentsInChildren<Volume>(true))
                 {
                     var profile=v.profile;if(profile==null)continue;hellProfile=profile;
```

### NativeGame.A2Forest.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.A2Forest.cs b/unity/Assets/Exoduser/Runtime/NativeGame.A2Forest.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.A2Forest.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.A2Forest.cs
@@ -28,7 +28,7 @@
             var timer=System.Diagnostics.Stopwatch.StartNew();Debug.Log("[A2 초기화] 숲 조립 시작");
             NativeRemodel3D.ForestA2=true;
             NativeRemodel3D.PrepareForestHeightCache();
-            foreach(var root in r3Roots)foreach(var volume in root.GetComponentsInChildren<UnityEngine.Rendering.Volume>(true))
+            foreach(var root in r3Roots)if(root!=null)foreach(var volume in root.GetComponentsInChildren<UnityEngine.Rendering.Volume>(true))
             {
                 var profile=volume.profile;if(profile==null)continue;
                 UnityEngine.Rendering.Universal.ColorAdjustments tone;if(profile.TryGet<UnityEngine.Rendering.Universal.ColorAdjustments>(out tone)){tone.postExposure.Override(.25f);tone.contrast.Override(16);}
@@ -53,9 +53,9 @@
             a2Root = new GameObject("A2 썩은 숲·나무다리 제작 후보");
             a2Root.transform.SetParent(ground.transform.parent, false);
             var oldFire=GameObject.Find("실제 철제 지옥불 화로");if(oldFire!=null)oldFire.SetActive(false);
-            foreach(var root in r3Roots)foreach(var light in root.GetComponentsInChildren<Light>(true))
+            foreach(var root in r3Roots)if(root!=null)foreach(var light in root.GetComponentsInChildren<Light>(true))
                 if(light.name.StartsWith("Pool_Hell",StringComparison.Ordinal))light.intensity=0;
-            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
+            foreach(var root in r3Roots)if(root!=null)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
                 if(r.name.StartsWith("Decals_blood",StringComparison.Ordinal))r.enabled=false;
             // LEFT/MID 주간, RIGHT 강가, TOP 먼 숲, SOUTH 낮은 전경. 중앙 전투면은 유지한다.
             A2RootedTree(34.8f,-70.5f,1.8f,1.6f,1.65f,25);
@@ -211,7 +211,7 @@
             go.transform.localScale=new Vector3(sx,sy,sz)*units;
             if(roots||stump||hollow||id=="Dead_Leaf_Litter"||foreground&&a2Field!=null)foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
             {
-                if(!mf.sharedMesh.isReadable){if(a2UnreadableMeshes.Add(id))Debug.LogError("[A2] 지면 접합 정점읽기 누락. 원본 메시 유지: "+id);continue;}
+                if(mf.sharedMesh==null||!mf.sharedMesh.isReadable){if(a2UnreadableMeshes.Add(id))Debug.LogError("[A2] 지면 접합 정점읽기 누락. 원본 메시 유지: "+id);continue;}
                 var mesh=Instantiate(mf.sharedMesh);var points=mesh.vertices;
                 for(int i=0;i<points.Length;i++){var p=mf.transform.TransformPoint(points[i]);float groundY=a2Field==null&&A2ForestLayout.Water(p.x,p.z)&&!A2ForestLayout.Island(p.x,p.z)?A2ForestLayout.WaterLevel-.18f:NativeRemodel3D.GroundY(p.x,p.z);float weight=hollow?1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(1,3,p.y-height)):1;p.y+=(groundY-placementGround)*weight;
                     if(hollow&&a2Field!=null)
@@ -227,7 +227,7 @@
             {
                 foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
                 {
-                    if(!mf.sharedMesh.isReadable){Debug.LogError("[A2 목교] 지지목 읽기 누락");continue;}
+                    if(mf.sharedMesh==null||!mf.sharedMesh.isReadable){Debug.LogError("[A2 목교] 지지목 읽기 누락");continue;}
                     var mesh=Instantiate(mf.sharedMesh);var vertices=mesh.vertices;var xyz=new float[vertices.Length*3];
                     for(int i=0;i<vertices.Length;i++){var p=mf.transform.TransformPoint(vertices[i]);xyz[i*3]=p.x;xyz[i*3+1]=p.y;xyz[i*3+2]=p.z;}
                     int changed=a2Field.ExtendBridgeSupports(xyz,mesh.triangles);
@@ -268,7 +268,7 @@
         }
         void A2AttachMoss()
         {
-            var root=a2Root;if(root==null)return;var trees=new System.Collections.Generic.List<GameObject>();var moss=new System.Collections.Generic.List<GameObject>();foreach(Transform t in root.transform){if(t.name=="A2_Hollow_Loft_Tree")trees.Add(t.gameObject);if(t.name=="A2_Hanging_Moss")moss.Add(t.gameObject);}int fixedCount=0;foreach(var go in moss){GameObject tree=null;float best=999999;foreach(var candidate in trees){float d=(candidate.transform.position-go.transform.position).sqrMagnitude;if(d<best){best=d;tree=candidate;}}if(tree==null)continue;var direction=go.transform.position-tree.transform.position;direction.y=0;if(direction.sqrMagnitude<.01f)direction=Vector3.back;direction.Normalize();var rs=go.GetComponentsInChildren<MeshRenderer>();if(rs.Length==0)continue;var bounds=rs[0].bounds;foreach(var r in rs)bounds.Encapsulate(r.bounds);var origin=tree.transform.position+direction*12;origin.y=bounds.max.y;var ray=-direction;float nearest=24;Vector3 hit=Vector3.zero;foreach(var mf in tree.GetComponentsInChildren<MeshFilter>()){if(!mf.sharedMesh.isReadable)continue;var vertices=mf.sharedMesh.vertices;var triangles=mf.sharedMesh.triangles;for(int i=0;i<triangles.Length;i+=3){var a=mf.transform.TransformPoint(vertices[triangles[i]]);var b=mf.transform.TransformPoint(vertices[triangles[i+1]]);var c=mf.transform.TransformPoint(vertices[triangles[i+2]]);var e1=b-a;var e2=c-a;var p=Vector3.Cross(ray,e2);float det=Vector3.Dot(e1,p);if(Mathf.Abs(det)<.000001f)continue;float inv=1/det;var tv=origin-a;float u=Vector3.Dot(tv,p)*inv;if(u<0||u>1)continue;var q=Vector3.Cross(tv,e1);float v=Vector3.Dot(ray,q)*inv;if(v<0||u+v>1)continue;float distance=Vector3.Dot(e2,q)*inv;if(distance>0&&distance<nearest){nearest=distance;hit=origin+ray*distance;}}}if(nearest<24){go.transform.position+=hit-direction*.025f-new Vector3(bounds.center.x,bounds.max.y,bounds.center.z);fixedCount++;}foreach(var r in rs){var block=new MaterialPropertyBlock();r.GetPropertyBlock(block);block.SetColor("_BaseColor",new Color(.8f,.76f,.6f,1));r.SetPropertyBlock(block);}}Debug.Log("[A2] 이끼 상단 표면 접합 "+fixedCount+"/"+moss.Count);
+            var root=a2Root;if(root==null)return;var trees=new System.Collections.Generic.List<GameObject>();var moss=new System.Collections.Generic.List<GameObject>();foreach(Transform t in root.transform){if(t.name=="A2_Hollow_Loft_Tree")trees.Add(t.gameObject);if(t.name=="A2_Hanging_Moss")moss.Add(t.gameObject);}int fixedCount=0;foreach(var go in moss){GameObject tree=null;float best=999999;foreach(var candidate in trees){float d=(candidate.transform.position-go.transform.position).sqrMagnitude;if(d<best){best=d;tree=candidate;}}if(tree==null)continue;var direction=go.transform.position-tree.transform.position;direction.y=0;if(direction.sqrMagnitude<.01f)direction=Vector3.back;direction.Normalize();var rs=go.GetComponentsInChildren<MeshRenderer>();if(rs.Length==0)continue;var bounds=rs[0].bounds;foreach(var r in rs)bounds.Encapsulate(r.bounds);var origin=tree.transform.position+direction*12;origin.y=bounds.max.y;var ray=-direction;float nearest=24;Vector3 hit=Vector3.zero;foreach(var mf in tree.GetComponentsInChildren<MeshFilter>()){if(mf.sharedMesh==null||!mf.sharedMesh.isReadable)continue;var vertices=mf.sharedMesh.vertices;var triangles=mf.sharedMesh.triangles;for(int i=0;i<triangles.Length;i+=3){var a=mf.transform.TransformPoint(vertices[triangles[i]]);var b=mf.transform.TransformPoint(vertices[triangles[i+1]]);var c=mf.transform.TransformPoint(vertices[triangles[i+2]]);var e1=b-a;var e2=c-a;var p=Vector3.Cross(ray,e2);float det=Vector3.Dot(e1,p);if(Mathf.Abs(det)<.000001f)continue;float inv=1/det;var tv=origin-a;float u=Vector3.Dot(tv,p)*inv;if(u<0||u>1)continue;var q=Vector3.Cross(tv,e1);float v=Vector3.Dot(ray,q)*inv;if(v<0||u+v>1)continue;float distance=Vector3.Dot(e2,q)*inv;if(distance>0&&distance<nearest){nearest=distance;hit=origin+ray*distance;}}}if(nearest<24){go.transform.position+=hit-direction*.025f-new Vector3(bounds.center.x,bounds.max.y,bounds.center.z);fixedCount++;}foreach(var r in rs){var block=new MaterialPropertyBlock();r.GetPropertyBlock(block);block.SetColor("_BaseColor",new Color(.8f,.76f,.6f,1));r.SetPropertyBlock(block);}}Debug.Log("[A2] 이끼 상단 표면 접합 "+fixedCount+"/"+moss.Count);
         }
         void A2RootWeb(float x,float z,float scale,float yaw)
         {
@@ -305,7 +305,7 @@
             r3Cam.depthTextureMode|=DepthTextureMode.Depth;
             UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(r3Cam).requiresDepthTexture=true;
             // A2의 단일 경계로 지형과 보행을 함께 나눈다. 원본 맵 데이터/비A2 실행은 보존한다.
-            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
+            foreach(var root in r3Roots)if(root!=null)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
                 if(r.name.StartsWith("River_",StringComparison.Ordinal)||r.name.StartsWith("Pool_",StringComparison.Ordinal))r.enabled=false;
             var mesh=new Mesh{name="A2 외곽으로 이어지는 독액"};
             const float waterHeight=A2ForestLayout.WaterLevel;
```

### NativeGame.A2Field.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs b/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.A2Field.cs
@@ -18,14 +18,14 @@
             a2Root=new GameObject("A2 1-1 전체 썩은 숲");
             UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(a2Root,r3Scene);
             a2Root.transform.SetParent(ground.transform,true);
-            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
+            foreach(var root in r3Roots)if(root!=null)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
             {
                 if(r.name=="지옥 바닥 PBR 표면")a2FieldSoil=new Material(r.sharedMaterial);
                 r.enabled=false;
             }
             if(hellEnvironment!=null)hellEnvironment.SetActive(false);
             var oldFire=GameObject.Find("실제 철제 지옥불 화로");if(oldFire!=null)oldFire.SetActive(false);
-            foreach(var root in r3Roots)foreach(var light in root.GetComponentsInChildren<Light>(true))
+            foreach(var root in r3Roots)if(root!=null)foreach(var light in root.GetComponentsInChildren<Light>(true))
             {
                 if(light.type==LightType.Directional)
                 {
@@ -34,7 +34,7 @@
                 }
                 else if(light.name.StartsWith("Pool_",StringComparison.Ordinal))light.enabled=false;
             }
-            foreach(var root in r3Roots)foreach(var volume in root.GetComponentsInChildren<Volume>(true))
+            foreach(var root in r3Roots)if(root!=null)foreach(var volume in root.GetComponentsInChildren<Volume>(true))
             {
                 var profile=volume.profile;if(profile==null)continue;ColorAdjustments tone;
                 if(profile.TryGet<ColorAdjustments>(out tone)){tone.postExposure.Override(.55f);tone.contrast.Override(16);}
@@ -199,7 +199,9 @@
             if(source==null){Debug.LogError("[A2 필드] 스캔 뿌리 지면 누락");return;}
             if(a2FieldRootMaterial==null)
             {
-                a2FieldRootMaterial=new Material(Resources.Load<Material>("Art/map/a2/rootrelief/Materials/A2_Root_Cluster_Patch"));
+                var sourceMaterial=Resources.Load<Material>("Art/map/a2/rootrelief/Materials/A2_Root_Cluster_Patch");
+                if(sourceMaterial==null){Debug.LogError("[A2 필드] 스캔 뿌리 재질 누락");return;}
+                a2FieldRootMaterial=new Material(sourceMaterial);
                 foreach(var key in new[]{"_BaseMap","_BumpMap","_RockMap","_AshMap","_RockNormal","_RockRough","_ForestMap","_ForestNormal","_ForestRough","_SoilMap","_SoilNormal","_SoilRough","_RootMap","_RootNormal","_RootRough","_FieldSdf","_FieldCover","_FieldMoss","_FieldMossNormal","_FieldMossRough"})
                     if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetTexture(key,a2FieldSoil.GetTexture(key));
                 foreach(var key in new[]{"_ForestBlend","_ForestTextureMix","_SoilTextureMix","_FullField"})if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetFloat(key,a2FieldSoil.GetFloat(key));
@@ -209,7 +211,7 @@
             go.transform.SetPositionAndRotation(new Vector3(x,baseY,z),Quaternion.Euler(0,yaw,0));go.transform.localScale=new Vector3(scale,.8f,scale);
             foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
             {
-                if(!mf.sharedMesh.isReadable){Debug.LogError("[A2 필드] 뿌리 메시 읽기 누락");continue;}
+                if(mf.sharedMesh==null||!mf.sharedMesh.isReadable){Debug.LogError("[A2 필드] 뿌리 메시 읽기 누락");continue;}
                 var mesh=Instantiate(mf.sharedMesh);var vertices=mesh.vertices;var center=mf.transform.TransformPoint(mesh.bounds.center);var shift=new Vector3(center.x-x,0,center.z-z);
                 for(int i=0;i<vertices.Length;i++){var v=mf.transform.TransformPoint(vertices[i])-shift;v.y=a2Field.TerrainHeight(v.x,v.z)+Mathf.Max(0,v.y-baseY)+.006f;vertices[i]=mf.transform.InverseTransformPoint(v);}
                 mesh.vertices=vertices;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();mf.sharedMesh=mesh;
@@ -221,7 +223,7 @@
             foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
             {
                 if(NativeGroundSkillProjection.IsProxy(mf))continue;
-                var mesh=mf.sharedMesh;if(!mesh.isReadable){Debug.LogError("[A2 필드] 접지 표면 읽기 누락 "+go.name);continue;}
+                var mesh=mf.sharedMesh;if(mesh==null||!mesh.isReadable){Debug.LogError("[A2 필드] 접지 표면 읽기 누락 "+go.name);continue;}
                 var vertices=mesh.vertices;var xyz=new float[vertices.Length*3];
                 for(int i=0;i<vertices.Length;i++){var p=mf.transform.TransformPoint(vertices[i]);xyz[i*3]=p.x;xyz[i*3+1]=p.y;xyz[i*3+2]=p.z;}
                 var indices=mesh.triangles;
@@ -234,15 +236,16 @@
             var filters=tree.GetComponentsInChildren<MeshFilter>();
             foreach(var mf in filters)
             {
-                if(!mf.sharedMesh.isReadable)continue;
+                if(mf.sharedMesh==null||!mf.sharedMesh.isReadable)continue;
                 var points=mf.sharedMesh.vertices;var normals=mf.sharedMesh.normals;
+                if(normals.Length!=points.Length){Debug.LogError("[A2 필드] 수피 메시 노멀 누락");continue;}
                 for(int j=0;j<3;j++)
                 {
                     var desired=tree.transform.position+new Vector3((j-1)*.45f,1.5f+j*.8f,-.8f);float best=float.MaxValue;var hit=Vector3.zero;var hitNormal=Vector3.back;
                     for(int i=0;i<points.Length;i++){var p=mf.transform.TransformPoint(points[i]);var n=mf.transform.TransformDirection(normals[i]);if(n.z>-.12f)continue;float score=(p-desired).sqrMagnitude;if(score<best){best=score;hit=p;hitNormal=n.normalized;}}
                     if(best>9)continue;
                     var moss=A2Module("Hanging_Moss",hit.x,hit.z,.4f,.55f,.4f,variation*37+j*67);if(moss==null)continue;
-                    var rs=moss.GetComponentsInChildren<Renderer>();var bounds=rs[0].bounds;foreach(var r in rs)bounds.Encapsulate(r.bounds);
+                    var rs=moss.GetComponentsInChildren<Renderer>();if(rs.Length==0){Destroy(moss);continue;}var bounds=rs[0].bounds;foreach(var r in rs)bounds.Encapsulate(r.bounds);
                     moss.transform.position+=hit-new Vector3(bounds.center.x,bounds.max.y,bounds.center.z);moss.name="A2 수피 표면에 붙은 이끼";
                     foreach(var renderer in rs){var tint=new MaterialPropertyBlock();renderer.GetPropertyBlock(tint);tint.SetColor("_BaseColor",new Color(.60f,.62f,.40f,1));renderer.SetPropertyBlock(tint);}
                     if(j==0)
@@ -267,7 +270,7 @@
             haze.AddComponent<MeshFilter>().sharedMesh=screen;var fog=haze.AddComponent<MeshRenderer>();fog.sharedMaterial=new Material(Shader.Find("EXODUSER/A2HeightFog"));fog.shadowCastingMode=ShadowCastingMode.Off;
             var shader=Shader.Find("EXODUSER/A2Atmosphere");
             var moonDirection=Quaternion.Euler(49,-32,0)*Vector3.forward;
-            foreach(var root in r3Roots)foreach(var light in root.GetComponentsInChildren<Light>(true))if(light.enabled&&light.type==LightType.Directional)moonDirection=light.transform.forward;
+            foreach(var root in r3Roots)if(root!=null)foreach(var light in root.GetComponentsInChildren<Light>(true))if(light.enabled&&light.type==LightType.Directional)moonDirection=light.transform.forward;
             foreach(var p in new[]{new Vector2(39,-70),new Vector2(26,-60),new Vector2(60,-58),new Vector2(21,-40),new Vector2(43,-34),new Vector2(64,-39),new Vector2(30,-18),new Vector2(53,-16),new Vector2(40,-6)})
             {
                 var bottom=new Vector3(p.x,a2Field.Height(p.x,p.y),p.y);var top=bottom-moonDirection*(13/Mathf.Max(.1f,-moonDirection.y));
```

### NativeGame.A2RPlay.patch

대상 기준: `f1bf8c62b`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeGame.A2RPlay.cs b/unity/Assets/Exoduser/Runtime/NativeGame.A2RPlay.cs
--- a/unity/Assets/Exoduser/Runtime/NativeGame.A2RPlay.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeGame.A2RPlay.cs
@@ -24,7 +24,9 @@
         void A2RPlayWrite(){File.WriteAllText(Path.Combine(a2rPlayOutput,"play-smoke.json"),JsonUtility.ToJson(a2rPlay,true));}
         IEnumerator A2RPlayShot(string id)
         {
-            UpdateViews();for(int i=0;i<3;i++)yield return null;yield return new WaitForEndOfFrame();var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(a2rPlayOutput,id+".png"),image.EncodeToPNG());Destroy(image);if(r3Cam!=null&&playerView!=null&&a2rLighting!=null){var v=r3Cam.WorldToScreenPoint(a2rLighting.Readability.HeroBounds.center);var f=new A2RPlayFrame{id=id,width=Screen.width,height=Screen.height,heroScreen=new Vector2(v.x,Screen.height-v.y),cameraPosition=r3Cam.transform.position,cameraFov=r3Cam.fieldOfView};foreach(var e in enemies.Values)if(e.body!=null&&e.body.enabled&&e.body.gameObject.activeInHierarchy){var q=r3Cam.WorldToScreenPoint(e.body.bounds.center);if(q.z>0&&q.x>0&&q.x<Screen.width&&q.y>Screen.height*.60f&&q.y<Screen.height)f.distantEnemies.Add(new Vector2(q.x,Screen.height-q.y));}a2rPlay.frames.Add(f);}A2RCompositionWrite(id);a2rPlay.steps.Add(id+" stage="+lobby.StageName+" player="+Simulation.Player.X+","+Simulation.Player.Y);A2RPlayWrite();
+            bool fieldShot=id!="00-startup"&&id!="01-lobby";
+            if(fieldShot){float readyBy=Time.realtimeSinceStartup+45;while((!Remodel3DReady||r3Cam==null||playerView==null||a2rLighting==null||a2rLighting.Readability==null)&&Time.realtimeSinceStartup<readyBy){UpdateViews();yield return null;}if(!Remodel3DReady||r3Cam==null||playerView==null||a2rLighting==null||a2rLighting.Readability==null){a2rPlay.failures.Add("Field capture preparation failed: "+id);A2RPlayWrite();yield break;}}
+            UpdateViews();for(int i=0;i<3;i++)yield return null;yield return new WaitForEndOfFrame();var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(a2rPlayOutput,id+".png"),image.EncodeToPNG());Destroy(image);if(r3Cam!=null&&playerView!=null&&a2rLighting!=null&&a2rLighting.Readability!=null){var v=r3Cam.WorldToScreenPoint(a2rLighting.Readability.HeroBounds.center);var f=new A2RPlayFrame{id=id,width=Screen.width,height=Screen.height,heroScreen=new Vector2(v.x,Screen.height-v.y),cameraPosition=r3Cam.transform.position,cameraFov=r3Cam.fieldOfView};foreach(var e in enemies.Values)if(e.body!=null&&e.body.enabled&&e.body.gameObject.activeInHierarchy){var q=r3Cam.WorldToScreenPoint(e.body.bounds.center);if(q.z>0&&q.x>0&&q.x<Screen.width&&q.y>Screen.height*.60f&&q.y<Screen.height)f.distantEnemies.Add(new Vector2(q.x,Screen.height-q.y));}a2rPlay.frames.Add(f);}else if(fieldShot)a2rPlay.failures.Add("Field capture references lost after yield: "+id);A2RCompositionWrite(id);a2rPlay.steps.Add(id+" stage="+lobby.StageName+" player="+Simulation.Player.X+","+Simulation.Player.Y);A2RPlayWrite();
         }
         IEnumerator A2RPlayKey(Key key,bool hold=false)
         {
```

### NativeDeathOverlay.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeDeathOverlay.cs b/unity/Assets/Exoduser/Runtime/NativeDeathOverlay.cs
--- a/unity/Assets/Exoduser/Runtime/NativeDeathOverlay.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeDeathOverlay.cs
@@ -41,8 +41,11 @@
   public string EventId{get;private set;}
 
   public NativeDeathOverlay(){
-   defs=JsonUtility.FromJson<Defs>(Resources.Load<TextAsset>("Data/death_web").text);
-   foreach(var t in defs.atlas)tok[t.n]=t;foreach(var l in defs.petLines)lines[l.id]=l;
+    var asset=Resources.Load<TextAsset>("Data/death_web");
+    if(asset!=null)try{defs=JsonUtility.FromJson<Defs>(asset.text);}catch(ArgumentException e){Debug.LogError("[사망] 대사 자료 해석 실패: "+e.Message);}
+    if(defs==null){Debug.LogError("[사망] 대사 자료 누락");defs=new Defs();}
+    if(defs.atlas!=null)foreach(var t in defs.atlas)if(t!=null&&!string.IsNullOrEmpty(t.n))tok[t.n]=t;
+    if(defs.petLines!=null)foreach(var l in defs.petLines)if(l!=null&&!string.IsNullOrEmpty(l.id))lines[l.id]=l;
   }
   float Now{get{return Time.unscaledTime;}}
   float Age{get{return ForcedAge.HasValue?ForcedAge.Value:Now-start;}}
@@ -55,11 +58,11 @@
   }
   public void Show(Info value){
    info=value;active=true;start=Now;BuildChoices();
-   var list=new List<string>(defs.petPool);for(int i=list.Count-1;i>0;i--){int j=rng.Next(i+1);var t=list[i];list[i]=list[j];list[j]=t;}
+   var list=new List<string>(defs.petPool??new string[0]);for(int i=list.Count-1;i>0;i--){int j=rng.Next(i+1);var t=list[i];list[i]=list[j];list[j]=t;}
    EventId=PickEvent();var s=new List<string>{EventId};s.AddRange(list);seq=s.ToArray();seqIdx=0;SetLine(0);
   }
   public void Hide(){active=false;}
-  void SetLine(int i){var l=lines[seq[i%seq.Length]];CrowLine=l.crow;CatLine=l.cat;}
+  void SetLine(int i){PetLine l;if(seq==null||seq.Length==0||!lines.TryGetValue(seq[i%seq.Length]??"",out l)){CrowLine=CatLine="";return;}CrowLine=l.crow;CatLine=l.cat;}
 
   // ---- resources ----
   static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
@@ -87,10 +90,10 @@
    return 3*(1-t)*t*t+t*t*t;
   }
   // Numeric probes for the capture receipt (compared with the web opacity series).
-  public float DebugFade(float age){return EaseOut(age/defs.timing.fade);}
+  public float DebugFade(float age){return defs.timing!=null?EaseOut(age/defs.timing.fade):0;}
   public float DebugTitleOpacity(float age){return TitlePulse(age);}
   float TitlePulse(float age){
-   var T=defs.timing;float ph=Mathf.Repeat(age+PulseOffset,T.titlePulse)/T.titlePulse;float seg=ph<.5f?ph*2:(1-ph)*2;float e=Mathf.SmoothStep(0,1,seg);
+   var T=defs.timing;if(T==null)return 0;float ph=Mathf.Repeat(age+PulseOffset,T.titlePulse)/T.titlePulse;float seg=ph<.5f?ph*2:(1-ph)*2;float e=Mathf.SmoothStep(0,1,seg);
    return Mathf.Lerp(T.titleMin,T.titleMax,e);
   }
 
@@ -152,7 +155,7 @@
   // Long languages (th, el, ru, de ...) shrink by whole point sizes until the run fits maxW at the widest tracking; no ellipsis, no wrap. Floor = 60% of the design size.
   readonly Dictionary<string,int> fitCache=new Dictionary<string,int>();
   int FitSize(string t,Font f,int size,float lsEm,float maxW){
-   string key=f.name+"|"+size+"|"+lsEm+"|"+maxW+"|"+t;if(fitCache.TryGetValue(key,out var hit))return hit;
+   string key=(f!=null?f.name:"")+"|"+size+"|"+lsEm+"|"+maxW+"|"+t;if(fitCache.TryGetValue(key,out var hit))return hit;
    int min=Mathf.Max(9,Mathf.RoundToInt(size*.6f)),s=size;while(s>min&&SpacedWidth(t,f,s,s*lsEm)>maxW)s--;
    fitCache[key]=s;return s;
   }
@@ -235,7 +238,8 @@
 
   // ---- death replay screen (#deathReplay, CSS 649-656): shape only, there is no recording in Unity ----
   public void DrawReplayShape(float progress01,float remainingSeconds){
-   Init();var old=GUI.matrix;var color=GUI.color;
+    if(defs.replayScreen==null||!tok.ContainsKey("g:☠"))return;
+    Init();if(atlas==null)return;var old=GUI.matrix;var color=GUI.color;
    try {
     GUI.matrix=Matrix4x4.identity;Fill(new Rect(0,0,Screen.width,Screen.height),Color.black);
     float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
```

### NativeRevive.DeathScreen.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeRevive.DeathScreen.cs b/unity/Assets/Exoduser/Runtime/NativeRevive.DeathScreen.cs
--- a/unity/Assets/Exoduser/Runtime/NativeRevive.DeathScreen.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeRevive.DeathScreen.cs
@@ -198,7 +198,7 @@
             Font tf=latin?deathLatin:NativeSilverHellUi.TextFont(deathBody,title);int ts=latin?62:74;
             float em=thai?0:Cjk(title)?.34f:latin?.2f:.16f,settle=1+.35f*(1-t),spacing=ts*em*settle;
             float tw=CenteredText(cx,titleY,title,tf,ts,spacing,A(Bone,.96f*t),.9f);
-            NativeUiAudit.Region(new Rect(cx-tw/2,titleY-ts*.8f,tw,ts*1.6f),"component","death-title","명조 큰 제목 "+tf.name+" "+ts+"px");
+            NativeUiAudit.Region(new Rect(cx-tw/2,titleY-ts*.8f,tw,ts*1.6f),"component","death-title","명조 큰 제목 "+(tf!=null?tf.name:"")+" "+ts+"px");
             // 금빛 헤어라인: 제목 양옆, 안쪽이 진하고 바깥으로 사라진다. 안쪽 끝에 짧은 세로 획.
             float gap=44,len=Mathf.Clamp(560-tw*.5f,180,300);float inner=tw*.5f+gap;
             GUI.color=A(Gold,.62f*t);
```

### NativeDemoText.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeDemoText.cs b/unity/Assets/Exoduser/Runtime/NativeDemoText.cs
--- a/unity/Assets/Exoduser/Runtime/NativeDemoText.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeDemoText.cs
@@ -19,9 +19,13 @@
    if(loaded)return;
    var asset=Resources.Load<TextAsset>("Data/demo_text");
    if(asset==null)throw new InvalidOperationException("Missing demo_text locale resource");
-   var data=JsonUtility.FromJson<Bundle>(asset.text);codes=data.codes;
-   foreach(var entry in data.entries){if(entry.texts.Length!=codes.Length)throw new InvalidOperationException("Incomplete demo text: "+entry.key);entries.Add(entry.key,entry.texts);}
-   foreach(var line in data.bossLines)bossLines.Add(line.key,line.text);loaded=true;
+    var data=JsonUtility.FromJson<Bundle>(asset.text);
+    if(data==null||data.codes==null||data.entries==null||data.bossLines==null)throw new InvalidOperationException("Incomplete demo text bundle");
+    var keys=new HashSet<string>();
+    foreach(var entry in data.entries)if(entry==null||string.IsNullOrEmpty(entry.key)||entry.texts==null||entry.texts.Length!=data.codes.Length||!keys.Add(entry.key))throw new InvalidOperationException("Invalid demo text entry");
+    keys.Clear();foreach(var line in data.bossLines)if(line==null||string.IsNullOrEmpty(line.key)||!keys.Add(line.key))throw new InvalidOperationException("Invalid boss text entry");
+    codes=data.codes;foreach(var entry in data.entries)entries.Add(entry.key,entry.texts);
+    foreach(var line in data.bossLines)bossLines.Add(line.key,line.text);loaded=true;
   }
   public static string Get(string key,string locale,string fallback=null)
   {
```

### NativeHellGateLabels.patch

대상 기준: `bea021bcf1b2d20689e9f014834456879c5a722a`. 코드 적용 0.

```diff
diff --git a/unity/Assets/Exoduser/Runtime/NativeHellGateLabels.cs b/unity/Assets/Exoduser/Runtime/NativeHellGateLabels.cs
--- a/unity/Assets/Exoduser/Runtime/NativeHellGateLabels.cs
+++ b/unity/Assets/Exoduser/Runtime/NativeHellGateLabels.cs
@@ -16,7 +16,12 @@
             if (locales.Count > 0) return;
             var asset = Resources.Load<TextAsset>("Data/hellgate_objectives");
             if (asset == null) throw new InvalidOperationException("Missing hellgate_objectives locale resource");
-            foreach (var entry in JsonUtility.FromJson<Bundle>(asset.text).entries) locales.Add(entry.code,entry);
+            var data=JsonUtility.FromJson<Bundle>(asset.text);
+            if(data==null||data.entries==null)throw new InvalidOperationException("Incomplete hellgate locale bundle");
+            var keys=new HashSet<string>();bool english=false;
+            foreach(var entry in data.entries){if(entry==null||string.IsNullOrEmpty(entry.code)||!keys.Add(entry.code))throw new InvalidOperationException("Invalid hellgate locale entry");if(entry.code=="en")english=true;}
+            if(!english)throw new InvalidOperationException("Missing hellgate English fallback");
+            foreach(var entry in data.entries)locales.Add(entry.code,entry);
         }
         public static void Lines(NativeHellGateObjective objective,string code,out string heading,out string detail)
         {
```

END

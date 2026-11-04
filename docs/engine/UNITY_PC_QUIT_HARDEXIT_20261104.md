# Unity PC 종료 멈춤 대응: Windows 하드 종료 (PC-QUIT-1, 2026-11-04)

## 증상
Windows 11 Player가 종료 단계(`Input System module state changed to: Shutdown.`, `CodeReloadManager destroyed` 다음)에서 멈춰 프로세스가 남는다. 2026-11-04 이 PC에서 여러 번 재현.

## 근본 원인 조사 결론 (11-04 13:50, 반박 검증 포함)
- 종료 멈춤 29건(10-29~11-04)은 모두 **창 모드**에서 `<RI> Initializing input`·`Using Windows.Gaming.Input`을 쓴 실행이다. `-batchmode`(입력 미초기화) 61건에서는 0건이다.
- 시작 시점: 10-28 GameInput 4.0.302와 XBOX Synthetic Gamepad Bus 자동 설치, 10-29 WGI DLL 교체 직후부터.
- 대부분 `taskkill`로 끝난다(사용자 모드 해제 정지, Unity Issue Tracker UUM-91181과 같은 위치). **일부는 kill도 안 된다(커널 층, 원인 미확정).**
- 따라서 하드 종료(TerminateProcess)는 **사용자 모드 WGI 해제 정지만** 건너뛸 수 있다. 커널 층 정지는 못 막을 수 있다. 이 수정이 모든 멈춤을 없앤다고 말하지 않는다.
- 13:08에 보인 **시작 지연**(`Mono config path` 다음)은 별개다(디스크·백신 첫 실행 검사 추정). 이 수정 범위가 아니다.

## 웹 근거
- Unity Issue Tracker, "Player .exe remains open as a background task after closing it when Active Input Handling is set to 'Input System Package (New)'" — `RoUninitialize` 중 `Windows.Gaming.Input.dll` 언로드에서 멈춤. 6000.0.37f1 등에서 고쳤다고 했으나 6000.2.14f1(2025-11)에서 다시 보고됨.
- Unity Discussions, "[BUG] Unity 6 Build Game Process Continues Running in Background After Closing Window" — 우회: 종료 시 kernel32 `TerminateProcess(GetCurrentProcess(), 0)`.
- 우리 프로젝트: Unity 6000.6.7f1, com.unity.inputsystem 1.20.1, `activeInputHandler: 2`(둘 다).

## 우회 방식
`Runtime/Platform/WindowsHardExit.cs` (`#if UNITY_STANDALONE_WIN && !UNITY_EDITOR`만 실제 동작; 에디터·다른 플랫폼은 `Quit`가 `Application.Quit`와 같음).
1. 모든 종료는 `WindowsHardExit.Quit(code)`를 거친다. 코드를 정적 변수에 기록한 뒤 `Application.Quit(code)`를 부른다. 0이 아닌 값이 우선.
2. `Application.quitting`(마지막 관리 콜백)에서 다음 순서로 실행한다: 등록된 fallback flush(`RegisterFlush`, `OnApplicationQuit`이 이미 돌았으면 건너뜀) → **최종 flush(`RegisterFinalFlush`, 항상 실행)** → `PlayerPrefs.Save()` → `[HardExit] code=<n> reason=<...>`를 Debug.Log와 `-logFile`에 직접 추가(`(direct)`) → `TerminateProcess(GetCurrentProcess(), code)`.
3. X 버튼·Alt+F4·엔진 종료는 `Quit`을 거치지 않아 코드 0으로 같은 hook을 탄다(`reason=window-close-or-engine-quit`).
4. 끄기: 실행 인자 `--unity-no-hard-exit` (원래 Unity 종료 경로, 진단용).

## 종료 때 파일을 쓰는 경로 (하드 종료에서 유실되지 않게 한 것)
| 경로 | 파일 | 처리 |
|---|---|---|
| `NativeGame.OnApplicationQuit` → `QuitFlush` (`NativeGame.SettingsPersistence.cs`) | 설정, 전투 세이브 | `RegisterFlush` fallback(기존) |
| `NativeEnemyRigRenderer.OnDestroy` → `WriteReceipt` (`NativeEnemyRigRenderer.cs`) | `enemy3d-render.json` | `RegisterFinalFlush(HardExitFlush)`. OnDestroy는 하드 종료에서 돌지 않는다 |
| `NativePerfProbe.OnApplicationQuit` → `Write` (`NativePerfProbe.cs`) | `perf-probe.json` | `RegisterFinalFlush` (같은 `Write`, 덮어쓰기라 중복 안전) |
| `PauseInputCheck.OnApplicationQuit` (`Tools/PauseInputCheck.cs`) | `quitObserved` 영수증 | `RegisterFinalFlush(ObserveQuit)` |
| `CinematicInputCheck` + `NativeQaCaptureWriter` (`Tools/`) | 프레임·영수증 | `RegisterFinalFlush`에서 `writer.WaitIdle(10000)`로 백그라운드 드레인을 최대 10초 기다림 |
| 엔진 Screenmanager 키(해상도·창 위치·전체화면) PlayerPrefs | 레지스트리 | `TerminateProcess` 직전 `PlayerPrefs.Save()`(최선 노력; 엔진이 네이티브 종료 중에만 쓰는 값이 있으면 못 지킬 수 있음) |

Runtime 전체에서 `OnDestroy`/`OnDisable`/`Application.quitting`/`wantsToQuit`를 검색했고, 위 외에 종료 때 파일을 쓰는 경로는 찾지 못했다(`NativeLobbyVideo.OnWantsToQuit`는 디코더 정리, 파일 없음).

### 정정과 미검증 표기
- **`OnApplicationQuit`이 `quitting`보다 먼저 돈다는 순서는 미검증이다.** Windows Player 로그로 확인하지 않았다. 그래서 위 fallback·최종 flush로 순서와 무관하게 방어한다. (이전 문서의 "먼저 실행된다" 단정은 철회.)
- 이전 문서의 "`Task.Run`/`Thread` 검색 0건"은 **틀렸다.** `Runtime/Tools/NativeQaCaptureWriter.cs:13`이 `Task.Run(Drain)`으로 QA 캡처를 백그라운드에서 쓴다(QA 전용, `CinematicInputCheck`만 사용). 위 표대로 최종 flush에서 Idle을 최대 10초 기다린다. 제품 경로의 비동기 저장은 찾지 못했다.

## 종료 코드 보존
공용 실행기 `exo-unity.ps1`은 `Process.ExitCode`를 읽어 QA 의미(0/2/3)로 쓴다. `TerminateProcess`에 기록한 코드를 그대로 넘긴다. 모든 종료가 `WindowsHardExit.Quit`을 거치므로 코드가 유지된다. **직접 `Application.Quit(code)`는 Windows Player에서 코드 0으로 바뀌어 실패가 거짓 PASS가 된다.** `unity/Tools/language-oracle/LanguageRuntimeProbe.cs`의 3곳(23·27·45줄)을 래퍼로 바꿨다. 소스 검사 `unity/Tools/devtools/selftest/quit-wrapper-source-test.cjs`가 `Assets/Exoduser/Runtime`과 `unity/Tools` 전체 .cs에서 `Application.Quit(` 직접 호출을 찾아 실패시킨다(`WindowsHardExit.cs` 제외). 주석·문자열은 무시한다.

## 검증
- 이 PC, Unity 미실행: `buildloop/compile-check.ps1` Player·Editor 오류 0. `quit-wrapper-source-test.cjs` PASS.
- **실제 종료 검증은 Mac이 아니라 PC Windows에서 개발툴 총괄이 A/B로 한다**: `--unity-no-hard-exit`(대조) vs 기본(하드 종료)를 창 모드로 각 실행·종료 30~50회, 정지율, 종료 코드 0/2/3, `[HardExit]` 로그 줄, 세이브·설정 파일 mtime을 비교한다. 이 문서 작성 시점에는 미실행이다.

## 남은 위험
- 커널 층 정지는 하드 종료로도 못 막을 수 있다(원인 미확정).
- `OnApplicationQuit`/`quitting` 순서 미검증(위 방어책 있음).
- Screenmanager PlayerPrefs는 `PlayerPrefs.Save()` 최선 노력이다. 해상도·창 위치가 복원되는지 A/B 때 확인한다.
- `-logFile` 인자가 없으면 `[HardExit]` 마지막 줄이 유실될 수 있다.

## 적용 범위 (11-04 보완)
- `-batchmode`(`Application.isBatchMode`)에서는 `WindowsHardExit.Install`이 hook을 등록하지 않는다. 근거: `-batchmode` 실행 61건에서 종료 정지 0건. 하드 종료는 창 모드에만 적용한다. 종료 코드 보존용 `Quit(code)` 래퍼는 그대로 쓴다.
- DBT-5 재현(`--unity-quit-during-video`, `--unity-skip-video-quit-cleanup`)은 Windows에서 `--unity-no-hard-exit`를 함께 줘야 엔진 종료 경로를 탄다(안 주면 하드 종료가 먼저 프로세스를 끝낸다). `NativeGame.QuitDuringVideo.cs` 주석에도 적었다.
- `CinematicInputCheck`의 `writer.WaitIdle(10000)`이 false이면 `[HardExit] QA capture writer drain timeout` 경고를 남긴다.

## PC A/B 시나리오 (경로별 기록표)
실행은 사용자 11-04 결정 3(PC 무창 후보 촬영 허용)과 공용 실행기(`exo-unity.ps1`, 무창·무음·세이브 격리) 규칙 안에서만 한다. 창 모드가 필요한 경로는 공용 실행기의 무창 옵션으로 하고, 직접 실행·보조 모니터 창은 쓰지 않는다. 각 경로를 대조(`--unity-no-hard-exit`)와 기본으로 나눠 기록한다.

| 경로 | 방법 | 기록 항목 |
|---|---|---|
| X 버튼 | 창 닫기 | 아래 공통 |
| Alt+F4 | 키 입력 | 아래 공통 |
| 메뉴 종료 | 일시정지/로비 메뉴의 종료 | 아래 공통 |
| QA 종료 | 종료 코드 0/2/3 각각 | 종료 코드가 `Process.ExitCode`와 같은지 포함 |
| 로딩 중 종료 | 로딩 화면에서 종료 | 아래 공통 |
| 사망(fallen) 중 종료 | 사망 연출 중 종료 | combat-save 갱신 여부 포함 |
| 로비 영상 중 X 버튼 | 로비 영상 재생 중 창 닫기 | 아래 공통 |

공통 기록 항목(경로마다 전후):
- `combat-save-v1/<이름>.json`과 `settings.v1.json`의 mtime과 revision.
- `HKCUSoftware<회사><제품>` Screenmanager 레지스트리 값(해상도·창 위치·전체화면) 전후.
- 마지막 `CaptureScreenshot` PNG 존재 여부.
- `[HardExit]` 로그 줄(code·reason, `(direct)` 줄 포함).
- 프로세스 정지 여부(종료 요청 뒤 일정 시간 안에 프로세스가 사라지는지).

## 소스 검사 한계
`quit-wrapper-source-test.cjs`는 아직 자동 실행(BuildLoop·pre-commit)에 연결되지 않았다. 줄 나눔(`Application
.Quit(`), 메서드 그룹(`Action a = Application.Quit`), using 별칭(`using A = UnityEngine.Application`)은 못 잡는다.

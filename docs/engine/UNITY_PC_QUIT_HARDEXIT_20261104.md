# Unity PC 종료 좀비 대응: Windows 하드 종료 (PC-QUIT-1, 2026-11-04)

## 증상
Windows 11 Player가 종료 단계(`Input System module state changed to: Shutdown.`, `CodeReloadManager destroyed` 다음)에서 멈춰 프로세스가 남는다(강제 종료 불가 좀비). 2026-11-04 이 PC에서 여러 번 재현.

## 원인과 근거 (웹 조사)
- Unity Issue Tracker, "Player .exe remains open as a background task after closing it when Active Input Handling is set to 'Input System Package (New)'" — Windows 11에서 새 Input System을 쓰면 종료 후 프로세스가 남는다. 원인은 `RoUninitialize` 중 `Windows.Gaming.Input.dll` 언로드에서 멈춤. 6000.0.37f1 등에서 고쳤다고 했으나 6000.2.14f1(2025-11)에서 다시 보고됨.
- Unity Discussions, "[BUG] Unity 6 Build Game Process Continues Running in Background After Closing Window" — Input System 1.10~1.12. 우회: 종료 시 kernel32 `TerminateProcess(GetCurrentProcess(), 0)`(IL2CPP에서도 동작), `RuntimeInitializeOnLoadMethod`로 등록하는 정적 클래스, Windows 스탠드얼론에만.
- 우리 프로젝트: Unity 6000.6.7f1, com.unity.inputsystem 1.20.1, `activeInputHandler: 2`(둘 다).

## 우회 방식
`Runtime/Platform/WindowsHardExit.cs` (`#if UNITY_STANDALONE_WIN && !UNITY_EDITOR`만 실제 동작; 에디터·다른 플랫폼은 `Quit`가 `Application.Quit`와 같음).
1. Runtime의 모든 `Application.Quit(code)`는 `WindowsHardExit.Quit(code)`로 바꿨다(75파일 160곳). 종료 코드를 정적 변수에 기록한 뒤 `Application.Quit(code)`를 부른다. 0이 아닌 값이 우선(`DeferredQuitIntent`와 같은 규칙).
2. `Application.quitting`(마지막 관리 코드 콜백)에서 `[HardExit] code=<n> reason=<...>` 한 줄을 Debug.Log와 `-logFile`에 직접 추가(`(direct)`)한 뒤 `TerminateProcess(GetCurrentProcess(), code)`를 호출한다.
3. X 버튼·Alt+F4·엔진 종료는 `Quit`을 거치지 않아 코드 0으로 같은 hook을 탄다(`reason=window-close-or-engine-quit`).
4. 끄기: 실행 인자 `--unity-no-hard-exit` (원래 Unity 종료 경로, 진단용).

## 세이브 안전
종료 직전 데이터 쓰기는 전부 메인 스레드 동기 호출이다. 설정(`NativeSettingsStore`)과 전투 세이브(`CombatSaveStore`)는 임시 파일에 쓰고 `Flush(true)` 뒤 교체하며 락(`settings.lock`, `characters.lock`)은 `using` 범위 안에서 풀린다. `NativeGame.OnApplicationQuit`(설정·전투 세이브 flush)은 `quitting`보다 먼저 실행된다. 영상 디코더 정리(`NativeLobbyVideo.OnWantsToQuit`)는 종료를 한 번 거절하고 재요청해 `wantsToQuit` 단계에서 끝난다. 만약 엔진이 `quitting`을 먼저 올리면(`MarkApplicationQuitSeen` 미호출) 등록된 flush(`NativeGame.QuitFlush`, 중복 안전)를 먼저 실행하고 로그에 `+fallback-flush`를 남긴다. 비동기 저장·스레드 저장 경로는 없다(`Task.Run`/`Thread` 검색 0건).

## 종료 코드 보존
공용 실행기 `exo-unity.ps1`은 `Process.ExitCode`(`Invoke-Guarded`)를 읽어 QA 의미(0/2/3 등)로 쓴다. `TerminateProcess`의 코드 인자에 기록한 코드를 그대로 넘긴다. 모든 호출이 `WindowsHardExit.Quit`을 거치므로 코드가 사라지지 않는다. 새 코드에서 `Application.Quit(`를 직접 부르지 않는다.

## 검증 (이 PC, Unity 미실행)
- `unity/Tools/devtools/buildloop/compile-check.ps1` Player(UNITY_STANDALONE_WIN 정의)·Editor 모두 오류 0.
- `Tools/save-oracle`: Core 미변경이며 oracle 대조에서 기존 차이(`game.html`의 `stageDiffOff` 키 vs Core)로 FAIL 1회. 이번 변경과 무관하므로 재실행하지 않고 별도 확인 대상.
- 실제 종료 확인(X 닫기, 메뉴 종료, QA exit 0/2/3, 로그의 `[HardExit]` 줄)은 Mac 판정 몫이다(PC Player 실행 금지).

## 남은 위험
- `quitting`이 `OnApplicationQuit`보다 먼저 올라오는지 Windows 실기에서 미확인(위 fallback이 방어).
- `Debug.Log` 비동기 flush는 `-logFile` 직접 추가로 보완했으나 인자가 없으면 마지막 줄이 유실될 수 있다.
- 직접 `Application.Quit(`를 쓰는 새 코드는 코드 0으로 종료된다(소스 검사 규칙).

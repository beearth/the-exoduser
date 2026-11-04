# Unity PC 종료 멈춤 대응: Windows 하드 종료 (PC-QUIT-1, 2026-11-04)

## 증상
Windows 11 Player가 종료 단계(`Input System module state changed to: Shutdown.`, `CodeReloadManager destroyed` 다음)에서 멈춰 프로세스가 남는다. 2026-11-04 이 PC에서 여러 번 재현.

## 근본 원인 조사 결론 (11-04 13:50, 반박 검증 포함) — 19:30 오염 상태 A/B로 일부 정정, 아래 "오염 상태 A/B 결과" 참고
- 종료 멈춤 29건(10-29~11-04)은 모두 **창 모드**에서 `<RI> Initializing input`·`Using Windows.Gaming.Input`을 쓴 실행이다. `-batchmode`(입력 미초기화) 61건에서는 0건이다.
- 시작 시점: 10-28 GameInput 4.0.302와 XBOX Synthetic Gamepad Bus 자동 설치, 10-29 WGI DLL 교체 직후부터.
- 대부분 `taskkill`로 끝난다(사용자 모드 해제 정지, Unity Issue Tracker UUM-91181과 같은 위치). **일부는 kill도 안 된다(커널 층, 원인 미확정).**
- 따라서 하드 종료(TerminateProcess)는 **사용자 모드 WGI 해제 정지만** 건너뛸 수 있다. 커널 층 정지는 못 막을 수 있다. 이 수정이 모든 멈춤을 없앤다고 말하지 않는다.
- 13:08에 보인 **시작 지연**(`Mono config path` 다음)은 별개다(디스크·백신 첫 실행 검사 추정). 이 수정 범위가 아니다.

## 오염 상태 A/B 결과 (11-04 19:12~19:30, 같은 부팅) — 위 결론 정정
11-04 17:17 다른 레인 Player(3d05cf81, map25d a2r-build-swamp)가 이 부팅 첫 정지를 냈고, kill 뒤에도 커널 좀비(PID 14612)로 남아 HALT가 됐다. CTO 결정으로 HALT를 둔 채 claude-quit-fix만 예외로 같은 부팅에서 짧은 A/B를 돌렸다(실행기 2026.11.04-haltexempt → zombieknown → zombiehalt, 좀비는 증거라 아무도 죽이지 않음). 시나리오는 모두 `--unity-quit-during-video fdg 2 --unity-mute`, 시간 초과 90초.

| 시각 | 변형(빌드) | 정지 줄(`Input System … Shutdown.`) 도달 | 종료 | 프로세스가 사라졌나 |
|---|---|---|---|---|
| 17:17 | 다른 레인 A2R 3d05cf81 | 예 | 8분 뒤 실행기 정리, exit −1 | 아니오(14612, 스레드 1개) |
| 19:12 | base a51d49a0 (unity/main 1e70f25d1) | 예 | 90초 시간 초과 → kill | 아니오(40496) |
| 19:16 | xinput 7250a577 (시작 중 실행기 정리로 종료) | 아니오(마지막 줄 `UnloadTime`) | kill | 아니오(42160) |
| 19:26 | hdev 383fe37f (하드 종료 f4472bc68) | 아니오, `[HardExit] code=0 reason=app-quit-request` | **43.6초에 exit 0** | 아니오(65984) |
| 19:27 | xinput 19e8ad44 | 예 | 90초 시간 초과 → kill | 아니오(67576) |
| 19:29 | hdev f0b80a99 (시작 중 종료) | 아니오, `[HardExit] code=0` | 하드 종료 | 아니오(50348) |

- 좀비는 모두 같은 모양이다: `HasExited=True`, 스레드 1개(ThreadState 5 / WaitReason 0 = Executive), 핸들 1,640~2,363개, 작업 집합 0.5~1.1GB가 재부팅 전까지 남는다.
- XInput 빌드(19e8ad44)에는 `Windows.Gaming.Input.dll`·`GameInput.dll`이 **로드되지 않았다**(로드된 입력 DLL은 HID.DLL, xinput1_4.dll, xinput1_3.dll뿐). 그래도 정지하고 좀비가 됐다. 시작 중에 끊긴 실행(7250a577)도 좀비가 됐다.
- **판정:** 오염 상태에서는 종료 방식(Unity 정상 종료·하드 종료 TerminateProcess·외부 kill)과 게임패드 백엔드(WGI·XInput)에 상관없이, 창 모드에서 입력을 초기화한 Player 6/6이 커널 좀비로 남는다. 원인은 Unity 종료 코드나 WGI 해제가 아니라 **이 PC의 입력 장치(HID) 커널 경로에서 끝나지 않는 I/O**다. 위 "근본 원인 조사 결론"의 'WGI/GameInput 해제 정지' 설명은 사용자 모드 정지(10-31형, kill 됨)에는 맞을 수 있지만, kill 불가 층의 원인으로는 **틀렸다**. `-batchmode`가 안전한 이유는 WGI가 아니라 입력(HID) 초기화를 아예 안 하기 때문으로 본다.
- 원인 드라이버는 좀비 스레드의 커널 스택(관리자 Process Explorer)으로 특정한다(아래 절차). 후보: 은행 보안 키보드 필터(nosku·noskp·np_ck64s·TKCtrl·Mkd2Nadr·JRSUKD25·asc_kbc, 모두 실행 중), Razer(RzDev_00b6·RzCommon), UMDF(WUDFRd — XBOX Synthetic Gamepad Bus 등), xboxgip, amdxe(AMD Controller Emulation).

### 제품 결론 (11-04 19:30)
- **XInput 전환은 넣지 않는다.** 오염 상태에서 효과가 0이었고, Unity도 WGI를 권장한다(XInput은 창이 포커스를 잃으면 패드를 읽을 수 없는 등 차이가 있다).
- **하드 종료는 유지를 권한다.** 커널 층 좀비는 못 막는다. 하지만 같은 오염 상태에서 base·xinput은 스스로 끝나지 못해 90초 시간 초과가 났고, hdev는 43초에 exit 0을 돌려줬다. 사용자 쪽에서 "안 꺼지는 게임"이 "바로 종료되는 게임"이 된다(남은 좀비는 보이지 않고 재부팅 때 정리). 10-31형 사용자 모드 정지는 해제 코드 자체를 건너뛰므로 막을 것으로 본다. Steam이 같은 상태에서 게임을 종료로 보는지는 미확인이다.
- 병합 조건: 종료 경로 검사 18회(하드 종료 켬/끔 × X·Alt+F4·메뉴·QA 0/2/3·로딩 중·사망 중·영상 중 X)에서 켬 쪽 종료 코드 보존·세이브/설정 마지막 쓰기 반영·창 0. 재부팅 뒤 H 빌드를 다시 만들어 돌린다(17:29 HALT로 H·HX 빌드가 거부돼 없음).

## 정지 묶음 구조 (11-04 15시 재집계, claude-quit-fix)
`_exec/logs` Player 로그 659개(10-28 이후)를 실행기 영수증과 맞춰 시간순으로 놓았다(스크립트는 세션 scratchpad `timeline.cjs`, 결과만 여기 적는다).
- 정지 29건은 **5개 묶음**이다. 묶음 시작(첫 정지): 10-29 09:15, 10-30 15:18, 10-31 05:03, 11-03 10:25, 11-04 05:15.
- 묶음이 시작되면 **재부팅 전까지 그 뒤 창 모드 실행은 거의 모두 정지**한다(예: 10-30 15:18·15:21·15:24·15:29·15:44 연속 정지). 사이에 낀 `-batchmode` 실행은 정상 종료한다(10-30 15:47~15:56 3건, 19:23 1건).
- 첫 정지 직전 실행은 정상 종료였고(대부분 동시 실행 0), 부팅 뒤 경과 시간도 1.5~29시간으로 제각각이다.
- 묶음 시작 −45분~+3분의 System·Application·Kernel-PnP/Configuration·AppXDeployment·DeviceSetupManager·WindowsUpdateClient·UserPnp 이벤트에 공통 사건(서비스 재시작·장치 연결·업데이트)이 없다. **촉발 사건은 아직 못 찾았다.** 10-29 09:01 Application Hang 1002(사용자 실행본 unity-latest)가 첫 묶음 14분 전에 있었지만 다른 묶음에는 이런 선행 사건이 없다.
- 촉발 후보 "WGI를 초기화한 창 모드 Player를 강제 종료(timeout taskkill·expectedKill)하면 오염된다"(개발툴 총괄 제안, 11-04 04:20 c21ffb38 timeout kill 뒤 05:06부터 정지)는 **이력과 맞지 않는다.** 부팅 구간별로 보면 묶음 5개 중 3개(10-29·10-31·11-03)는 같은 부팅에서 앞선 강제 종료가 없고, 반대로 11-04 07:32 부팅 뒤에는 timeout kill 3건(08:36 8f5dff4b, 10:26 baa5909e, 14:50 0d6673d4) 뒤에도 정지가 0회다. 그래서 오염을 일부러 만드는 실험은 하지 않았다(재현 수단이 없는데 공용 PC 전체가 재부팅 전까지 정지 상태가 된다).
- 11-04 07:32 재부팅 뒤 창 모드 Player 49회(15:00까지)는 **정지 0회**다. 즉 지금 PC는 "오염 전" 상태이고, 이 상태의 A/B는 base도 0이 나올 가능성이 크다. 그래서 A/B는 ① 4종을 회차마다 번갈아 돌려(묶음이 시작되면 모든 변형이 같은 시점에 영향을 받게) ② 하드 종료가 정지 지점(`Input System … Shutdown.`)에 아예 도달하지 않는지 로그로 확인하고 ③ XInput 빌드에 WGI·GameInput DLL이 실제로 로드되는지 모듈 목록으로 확인하는 방식으로 판정한다.
- 기준 상태(정상, 11-04 15:20): `GameInputRedistService` 프로세스 2개(서비스 PID 5540, 07:33 사용자 세션 11316), `GameInputRawInputProxy` 1개(스레드 1), `GameInputSvc` 중지. 장치: XBOX Synthetic Gamepad Bus(SWD), Xbox Wireless Adapter for Windows, AMD Controller Emulation(가상 패드), Razer DeathAdder V3 Pro. 다음 묶음이 생기면 이 값과 비교한다.
- 웹: UUM-91181(같은 위치, `RoUninitialize` 중 `Windows.Gaming.Input.dll` 언로드)은 6000.0.37f1에서 고쳤다고 했지만 6000.2.14f1(2025-11-30)에서 재발 보고가 있고, 우리 6000.6.7f1에서도 난다. 커뮤니티 우회책은 `Application.quitting`에서 `TerminateProcess`(mnemotic 등, IL2CPP 포함 동작 보고)다.

## 판정 방식 (11-04 16:05 CTO 결정)
- "오염 전" 상태에서 단독 150회 A/B는 모든 변형이 0으로 나와 원인을 가르지 못하므로 하지 않는다. 순번은 데모 v0 레인이 우선이다.
- 대신 감시 스크립트 `I:\EXODUSER-Storage\stall-ab\sentinel.ps1`(읽기 전용)가 11-04 07:32 부팅 뒤 실행기 Player 전체를 base 관측으로 센다. 첫 정지(로그 끝이 `Input System module state changed to: Shutdown.` 또는 실행기 stall 영수증)를 보면 즉시 끝나며 `sentinel\first-stall.json`에 부팅 후 경과, 그 전 창 모드 실행 수, 동시 실행, kill 15초 안 성공 여부, 입력 장치 목록, GameInput 프로세스 상태를 남긴다. 장치·GameInput 변화는 `sentinel\events.jsonl`에 계속 쌓인다.
- 첫 정지가 나오면 **같은 부팅 안에서** `run-ab.ps1`로 짧은 A/B(base·hdev·xinput·xh·hnohard 회차 교대 각 5회)를 돌린다. 이때는 CTO가 순번을 당긴다.
- 하드 종료 병합은 그 결과가 나올 때까지 보류한다(CTO).
- 그 사이 오염과 무관하게 확인할 수 있는 것(종료 경로별 종료 코드·세이브·레지스트리, XInput 빌드의 WGI DLL 로드 여부)은 보통 순번으로 미리 해 둔다.

### 부팅별 첫 정지까지 (④, `_exec/logs` 기준 WGI 로그가 있는 창 모드 실행 수)
| 부팅 | 첫 정지 | 부팅 후 경과 | 첫 정지 전 창 모드 실행 | 첫 정지 뒤 창 모드 실행 → 정지 |
|---|---|---|---|---|
| 10-29 06:40 | 10-29 09:15 | 2.6시간 | 1 | 1 → 1 |
| 10-29 10:18 | 10-30 15:18 | 29.0시간 | 72 | 9 → 6 |
| 10-30 20:17 | 10-31 05:03 | 8.8시간 | 68 | 12 → 12 |
| 10-31 09:00 | 없음 | — | 105 | — |
| 11-01 09:43 | 없음 | — | 17 | — |
| 11-02 18:38 | 없음 | — | 131 | — |
| 11-03 09:01 | 11-03 10:25 | 1.4시간 | 34 | 3 → 3 |
| 11-03 10:51 | 없음 | — | 23 | — |
| 11-03 15:39 | 11-04 05:15(개발툴 집계로는 05:06 ui-candidate) | 13.6시간 | 48 | 2 → 2 |
| 11-04 07:32 | 16:07 현재 없음 | 8.6시간 경과 | 실행기 영수증 152회(timeout kill 4회) | — |

부팅 10번 중 5번은 묶음이 생겼고 5번은 없었다. 첫 정지까지의 실행 수(1~72회)·경과 시간(1.4~29시간)에 규칙이 없다. 실행 횟수가 쌓여서 생기는 문제로 보이지 않는다.
11-04 16:07 기준 입력 장치: Razer DeathAdder V3 Pro, HID Keyboard, XBOX Synthetic Gamepad Bus(실제 패드 연결 없음). Xbox Wireless Adapter는 Net 클래스로 있다. GameInput: RedistService 2개(스레드 12/2), RawInputProxy 1개(스레드 1), XboxGipSvc 실행 중.

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

## kill 불가 정지가 다시 생기면 (원인 장치 특정, 사용자 작업)
kill 불가 층은 커널에서 끝나지 않은 I/O 요청(IRP)이 프로세스를 붙잡는 경우라 게임 코드로는 못 푼다. 다음에 생기면 **재부팅 전에** 아래만 하면 원인 드라이버가 이름으로 나온다.
1. Sysinternals Process Explorer를 **관리자 권한**으로 연다(Options → Configure Symbols는 기본값으로 두면 된다).
2. 남아 있는 `EXODUSER-Unity.exe`(또는 `EXODUSER-*.exe`)를 더블클릭 → Threads 탭 → 상태가 `Wait:Executive`이거나 커널 시간이 멈춘 스레드를 고르고 Stack을 연다.
3. 스택 맨 위쪽 `.sys` 이름을 적는다. 후보와 뜻: `nosku.sys`·`noskp.sys`(INCA nProtect 키보드 보안), `Mkd2Nadr.sys`(AhnLab MyKeyDefense), `JRSUKD25.sys`(RaonSecure TouchEn), `RzDev_00b6.sys`(Razer), `WUDFRd.sys`(UMDF 가상 장치 — XBOX Synthetic Gamepad Bus 등), `hidclass.sys`/`kbdhid.sys`(입력 공통 경로).
4. Handles 탭에서 `\Device\...` 이름(HID·가상 패드 장치 경로)도 함께 적는다.
그 결과로 장치·드라이버 정리(가상 패드 제거, 은행 보안 키보드 프로그램 제거·갱신, GameInput 갱신)를 **사용자가 결정**한다. 실험 결과 전에는 아무것도 지우지 않는다.

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

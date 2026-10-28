# C-02a Unity 입력 폴링 전환 — 2026-10-28

## 적용 범위

`unity/Assets/Exoduser/Runtime/Input/ExoInput.cs`가 기존 `UnityEngine.Input` 폴링의 정적 파사드다. Runtime의 실제 구형 호출 143건을 19개 파일에서 교체했다. 브리프의 135건·20개 파일과 현재 트리가 달랐다. 현재 트리에는 `LobbyKeys.cs`, `NativeLobby.TitleMenu.cs`가 없고 `NativeLobby.cs`의 13건이 있다. `NativeLobby.TitleMenu.cs`에 예고된 `GetAxisRaw("Vertical")` 호출도 없어서 호출 교체는 없으며, 파사드에 `VerticalRaw()` 계약을 마련했다.

| 입력 | 기존 의미 | C-02a 읽기 경로 |
|---|---|---|
| `KeyDown` / `Key` / `KeyUp` | 해당 `KeyCode`의 현재 프레임 누름·유지·뗌 | `Keyboard.current`의 `KeyControl` 프레임 상태; 키보드 없음은 false |
| `MouseDown(0..4)` / `Mouse(0..4)` | 0 좌, 1 우, 2 가운데, 3 뒤, 4 앞으로 | `Mouse.current`의 개별 버튼 |
| `MousePosition` | 화면 왼쪽 아래 원점, z=0 | `Mouse.current.position`을 `Vector3`로 확장 |
| `AnyKey` / `AnyKeyDown` | 키보드·마우스·패드 버튼 포함 | 키보드 `anyKey`, 마우스 0..4, Gamepad·Joystick 버튼 |
| `PadConnected` | 패드 안내 표시 | `Gamepad.all.Count>0 || Joystick.all.Count>0` |
| `VerticalRaw()` | 위/W +1, 아래/S -1, 패드 왼스틱·십자 Y | 디지털 키와 Y 임계값 0.5, 충돌은 0 |
| `CompositionString` | IME 미확정 조합 문자열 | 현재 키보드의 `onIMECompositionChange` 최신 값; 빈 조합 또는 확정 문자 이벤트에서 빈 문자열 |

첫 Unity 컴파일에서 `IMECompositionString` 형식 조회가 CS0246으로 실패했다. Input System 1.20.1 패키지 선언(`InputSystem/Runtime/Events/IMECompositionEvent.cs`)의 실제 네임스페이스는 `UnityEngine.InputSystem.LowLevel`이므로 `ExoInput.cs`에 해당 using 한 줄을 추가했다. 수정 뒤 컴파일·가상 장치 검증은 별도 재실행 결과로 판정한다.

### Codex 재실행 결과 — 10-28 23:09 KST

| 항목 | 결과 | 증거 |
|---|---|---|
| 첫 실행(기존 C-02a) | `DONE`, 4개 작업 exit 1. `IMECompositionString` CS0246으로 컴파일 중단 | `I:\EXODUSER-Storage\custom\c02\verify\verify.log`, `run.log` |
| 수정본 Unity 6000.6.7f1 컴파일 | CS0246 해소, 스크립트 컴파일 51.610초, 이 실행의 컴파일 오류 0 | `I:\EXODUSER-Storage\custom\c02\verify-fix\run.log`, `unity-jobs\codex-custom\logs\7ccc2968.log` |
| 웹 코드 매핑 | 107개 모두 변환 검사를 지나감. 이 지점까지 검사 카운트 109 | `verify-fix\exoinput\exo-input-verification.json` |
| 가상 W 입력 | **FAIL** `W press frame` (exit 2). `KeyDown(W) && Key(W) && AnyKeyDown` 결합 단언 중 어느 값이 false인지는 현재 영수증에 없음 | 동일 JSON의 `error`, `ExoInputVerification.cs:50` |
| 후속 Core presence·FrontendPad·Win 빌드·Player | 수정본에서 **미실행**. 첫 실패에서 fail-fast로 중단 | `verify-fix\verify.log` |

초기 실패 뒤 원인 한 건만 고쳐 재실행 한 번을 수행했다. 공통 인수 규칙의 2회 실패 한도에 따라 이 상태에서 추가 재실행하지 않는다. `W press frame` 원인은 아직 분리되지 않았으며 물리 키보드/패드 동작 결함으로 단정하지 않는다. C-02a는 **컴파일 통과·가상 입력 실패·병합 보류**다.

`NativeKeyBindInput`의 웹 코드↔`KeyCode` 107개 표는 유지했다. 새 파사드는 이 107개를 `InputSystem.Key`로 매핑하고, 매핑 없는 키는 false 및 `KeyCode`당 경고 1회로 처리한다. 로비에 직접 쓰인 `JoystickButton0/1/7/9`는 각각 Gamepad South/East/Start/RightStick 버튼에 연결했다. `CodeDown`/`CodeHeld`와 그 위의 주·보조 바인딩은 파사드를 거친다. Core 게임 규칙, 입력 바인딩 저장 포맷, `activeInputHandler: 2`, 패키지 버전은 변경하지 않았다.

## 검증 경계

`Editor/ExoInputVerification.Run`은 절대 `-output` 폴더에 `exo-input-verification.json`을 쓰며, 107개 변환·가상 W 누름/유지/뗌·`AnyKeyDown`·기본 무기 mouse0·마우스 좌표·가상 Gamepad South 버튼을 검사한다. 수동 Input System update mode와 추가 장치는 종료 시 복구한다. 이 작업에서는 Unity 에디터·플레이어 실행을 금지받아 영수증, 컴파일 결과, 실제 OS 키·IME·게임패드·화면 동작 결과가 아직 없다. 특히 기종별 구형 joystick 버튼 번호와 새 Gamepad 버튼 명칭의 실기기 동등성은 Player에서 별도 확인해야 한다.

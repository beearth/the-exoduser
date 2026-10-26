# Mac Unity A03/A04 통합 UI 실창 검수 — 2026-10-27

## QA 후보 빌드 계약

`PortVerification.Build`의 `-a03a04UiQa true`는 이번 통합 UI 검수 전용이다. `-settingsQa true`와 동시 지정은 거부한다. `StandaloneOSX`는 기존대로 ARM64, 출력명은 고유 `_out` 아래 `EXODUSER-Unity.app`이다. 이 QA 분기에서만 productName `EXODUSER A03 A04 QA`, applicationIdentifier `com.fordeargamers.exoduser.a03a04qa20261027`, identifier override `true`로 빌드하고 `finally`에서 원래 product/id/override를 복원한다. 빌드 영수증에 `uiQa`·product·identifier·architecture를 기록한다. 일반 빌드와 기존 Settings QA의 값은 그대로다.

검수 실행은 **이 고유 앱의 Contents/MacOS 실제 실행 파일**에 `--unity-frontend-review -output /Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A03A04-UI-20261027/player-data`를 지정한다. `NativeSettingsStorageScope.IsQa`는 `-review`일 때 설정 store 초기화를 건너뛰며, `NativeLobby.CharacterStore`는 새 절대 output 하위 `character-roster-v1`만 사용한다. 앱 identity가 별도라 Unity PlayerPrefs 네임스페이스도 분리된다. 기존 사용자 앱·개인 저장 경로는 읽기 전용 기준 해시만 확인한다. 이 분기의 코드 변경은 Editor 빌드 정체성에만 있으며 A03/A04 일반 UI 경로에는 영향을 주지 않는다.

실제 빌드·창 식별·입력 결과는 영수증과 함께 후속 기록한다. 창 식별이 검증되지 않으면 원본 앱을 자동 실행하는 CUA 경로를 사용하지 않는다.

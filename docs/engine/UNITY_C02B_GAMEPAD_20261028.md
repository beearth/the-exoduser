# C-02b Input System 패드 연결 계약 — 2026-10-28

상태: **명세 완료, 구현·Unity 검증 대기**. 기준은 원격 `main`의 웹 `game.html` blob `d676c50e236bca7159d28e1c9d2ec5a9ce640a66`(13651, 13703–13718, 14045–14086, 14165–14320)와 `docs/3.3 키바인딩+설정/게임패드_매핑표.md`, Unity `FrontendPadPolicy`·`NativeKeyBindInput`이다. 공유 `G:\exoduser\game.html`은 별도 미커밋 변경이 있어 이 명세의 원본으로 사용하지 않았다. C-02a의 `ExoInput`은 키보드·마우스 폴링을 신형 API로 옮겼으나 전투용 웹 패드 키 주입과 UI 차단은 아직 없다. 이 문서를 C-02b의 구현·검수 기준으로 쓴다.

## 1. 입력 경계

| 경계 | 계약 | 검증 |
|---|---|---|
| 장치 선택 | `Gamepad.all`의 연결된 첫 장치를 프레임마다 읽는다. 재연결 시 새 장치로 갈아타며 예전 held·edge는 모두 해제한다. `Joystick` 폴백은 기종별 버튼 맵이 확인되기 전까지 전투 버튼을 추정하지 않는다. | 가상 장치 2개, 제거·재추가·held 해제 |
| 활성화 | 새 장치의 이미 눌린 버튼을 첫 프레임의 새 누름으로 보지 않는다. 의도적인 디지털 새 누름 또는 스틱 절댓값 0.5 초과에서 활성화한다. 좌스틱 이동 데드존은 웹 `GP_DEAD=0.25`, 우스틱 마법은 크기 0.2 초과다. | 연결 중 held, 드리프트 0.2/0.3/0.51 경계 |
| 전투 누출 | 로비·이야기·컷씬·설정·일시정지·인벤토리·스킬·대장간·사망·기타 오버레이에서는 전투 주입을 끄고 held를 비운다. 열린 UI는 해당 UI의 의미 입력만 소비한다. | 패널 열고 닫을 때 공격·이동·스킬 0 |
| 동시 입력 | 기존 `KeyBindings`의 웹 키 코드 저장값을 바꾸지 않는다. 신형 패드 입력은 전투 단계에서 키보드/마우스의 Down·Held와 합친다. 패드 매핑은 저장된 키보드 바인딩을 덮어쓰지 않는다. | 재설정 키+패드 동시, 키보드 단독 회귀 |
| 프런트엔드 | `FrontendPadPolicy`에는 `ConfirmDown/ConfirmHeld/CancelHeld/StartDown/StartHeld` 의미 상태를 준다. 구형 Unity `JoystickButton7/9` 번호를 웹 물리 인덱스의 증거로 사용하지 않는다. | 전사 Next와 Skip hold 동시, Guide Start 우선순위 |

## 2. 기본 전투 매핑

웹 `_GP_KEY_DEFAULT`를 새 Gamepad의 **명명된 control**로 옮긴다. 아래 표의 숫자는 웹 Gamepad API 인덱스 기록이며 Unity `JoystickButtonN` 번호가 아니다.

| 웹 인덱스 / 버튼 | 신형 control | 웹 코드 / 의미 |
|---|---|---|
| 0 A | `buttonSouth` | `mouse0` 무기 |
| 1 B | `buttonEast` | `Space` 분노·구르기 기존 키 경로 |
| 2 X | `buttonWest` | `KeyE` 칼등 |
| 3 Y | `buttonNorth` | `KeyQ` 마법 패링 |
| 4 LB | `leftShoulder` | `ShiftLeft` 사슬 |
| 5 RB | `rightShoulder` | `ControlLeft` CT |
| 8 Back | `selectButton` | UI 뒤로/인벤토리 전용, 전투 키 주입 없음 |
| 9 Start | `startButton` | `Escape` 설정, 프런트엔드는 Skip/hold 정책에 전달 |
| 10 L3 | `leftStickButton` | `KeyR` 줍기 |
| 11 R3 | `rightStickButton` | `mouse2` 마법 |
| 12–15 D-pad | `dpad` 방향 | 패널 토글 전용; 키 주입 없음 |
| 좌스틱 X/Y | `leftStick` | 데드존 0.25 뒤 `KeyA/D/W/S` (Unity Y 양수=위) |
| RT | `rightTrigger` 값 >0.7 | `KeyZ`; LT+RT면 `KeyX`이며 Z 해제 |
| LT | `leftTrigger` 값 >0.7 | LT+A/B/Y/X = `Digit1/2/3/4`; 단독 release = `KeyF` 한 번 |
| 우스틱 | `rightStick` | 크기 >0.2면 `mouse2`와 조준 방향. 실제 카메라 좌표 변환은 별도 Player 판정 |

`NativeGame.FixedUpdate`는 현재 `NativeKeyBindInput.Held`로 이동·공격·방어·구르기·줍기를, `SetSkillKeys`로 스킬을 소비한다. C-02b는 이 소비자 앞에서만 패드 상태를 합쳐야 하며 Core의 전투 수치·타이밍을 바꾸지 않는다. `SkillUiState.AttackHeld`의 포인터 위 공격 차단은 패드 공격에서 실제 포인터 위치와 분리해야 한다. R3/우스틱 마법의 조준점도 마우스 잔류 좌표가 되면 안 된다.

## 3. 구현·검수 순서

1. 가상 Gamepad 입력 테스트를 먼저 작성해 연결 중 held 억제, 첫 새 누름, 0.25 이동 경계, A 공격, B·좌스틱 구르기, LT 콤보와 단독 탭, UI 차단·해제, 장치 제거 후 잔류 0을 재현한다. `FrontendPadPolicy`의 기존 22개 논리 검사도 유지한다.
2. 패드 프레임을 한 곳에서 읽고 전투/프런트엔드/UI 의미 상태로 분기한다. `NativeKeyBindInput`의 저장 키 표와 Core는 바꾸지 않는다. `activeInputHandler`는 C-02c 전까지 2를 유지한다.
3. `exo-unity.ps1`로 Editor 가상 장치 검사, Core presence, FrontendPadVerification, 컴파일 오류 0, Windows 빌드와 격리 1-1 Player 스모크를 확인한다. 가상 장치 PASS는 실물 컨트롤러의 기종별 매핑이나 1-1 직접 조작 PASS로 쓰지 않는다.
4. 1600×900 화면에서 패드 힌트·UI 포커스·전투 커서를 웹과 비교한다. A 무기, 좌스틱 이동, B+방향 구르기, 장치 해제, 포커스 이탈, 키보드 복귀를 실물 패드에서 확인해야 C-02b 최종 판정이다.

검증 준비: `Editor/C02bGamepadVerification.cs`는 가상 Gamepad의 A 공격·좌스틱 이동·B+방향 구르기·UI 전투 차단·장치 제거 해제를 영수증으로 확인한다. 현재 제품에는 `NativeKeyBindInput.GameplayPadEnabled` 게이트가 없으므로 첫 RED는 `gameplay pad gate missing`이어야 한다. **아직 실행하지 않았고 제품 코드는 C-02b에 대해 변경하지 않았다.**

## 4. 현재 보류

- C-02a Editor 가상 W 검증은 10-29 새 진단/수정본에서도 exit 2다. C-02b RED·제품 구현·빌드는 C-02a 성공 영수증 전까지 보류한다.
- 웹 사용자 지정 `gpKeyMap`의 저장 이식은 C-02c 저장 설계와 함께 판단한다. 기본 매핑만 구현한 결과를 전체 웹 패드 지원으로 표시하지 않는다.
- 웹 패널별 가상 커서, 우스틱 스크롤, 진동, 특수 조준·포격은 각각 화면/기종별 판정이 필요하다. C-02b가 이를 구현하지 못하면 개별 미이식 항목으로 기록한다.

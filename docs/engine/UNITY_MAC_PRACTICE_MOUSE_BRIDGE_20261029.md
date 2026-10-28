# Mac 첫 연습 실입력·마우스 버튼 브리지 — 2026-10-29

## 수정 계약

웹 `MouseEvent.button`과 Unity `Input.GetMouseButton`/IMGUI `Event.button`은 오른쪽·가운데 버튼 번호가 반대다. `NativeKeyBindInput.WebMouseButton`이 아래 표대로 양방향 변환하며, `CodeDown`/`CodeHeld`와 `NativeKeyBindList`의 마우스 바인딩 캡처가 같은 변환을 쓴다. `KeyBindings`의 웹 코드·저장 schema·기본값은 바꾸지 않았다.

| 실제 버튼 | 웹 `mouseN`/`MouseEvent.button` | Unity 버튼 번호 | 적용 위치 |
|---|---:|---:|---|
| 왼쪽 | `mouse0` / 0 | 0 | 무기 기본 입력·캡처 |
| 가운데 | `mouse1` / 1 | 2 | 보조 바인딩 입력·캡처 |
| 오른쪽 | `mouse2` / 2 | 1 | `beam` 기본 마법 입력·캡처 |
| 추가 버튼 | `mouse3`~`mouse9` / 3~9 | 3~9 | 기존 번호 유지 |

기존 앱은 실제 오른쪽 버튼 2.4초에 우클릭 실습 0/5, **가운데** 버튼 2.4초에 5/5였다. 따라서 원인은 실습 처치 계산이 아니라 웹 코드 `mouse2`를 Unity 버튼 2로 읽던 브리지였다. 수정 파일은 `NativeKeyBindInput.cs`와 `NativeKeyBindList.cs` 두 개이며 PC A18 소유 `NativePractice*`는 수정하지 않았다. 변경 전 파일과 Unity 직렬화 백업은 `_out/UNITY-MAC-A05-IO-PRACTICE-20261029/before/`에 보존했다.

## ARM64 빌드와 실제 OS 순회

Unity 6000.6.7f1 ARM64 Settings QA 빌드 1회: `_out/UNITY-MAC-A05-IO-PRACTICE-20261029/rebuild/receipt.json`, `Succeeded`, `errors=0`, 앱 실행 파일 SHA-256 `22a177a31717f396e47ce33334ccbab254f82508c1ade3aff2d854cc0809d1cc`. 빌드 중 Unity가 생성한 직렬화 파일은 백업에서 원래 bytes로 복원하여 제품 차분은 위 두 C# 파일만 남겼다.

수정 앱을 고유 Settings QA identity `com.fordeargamers.exoduser.settingsqa`, marker가 있는 `_out/UNITY-MAC-A05-IO-PRACTICE-FIX-20261029/`의 전용 설정·로스터 경로로 실행했다. 사용자 일반 앱·저장에는 쓰지 않았다. 실제 OS `Return`→시네마틱/안내 `Escape`→첫 연습 진입 후 아래 결과를 화면에서 확인했다. 이미지의 1280×784에는 상단 64px macOS 제목막대가 포함된다.

| 연습 번호 | 실제 입력 | 화면 판정 |
|---:|---|---|
| 1~2 | W 1.2초, 왼쪽 클릭 3.8초 | 이동, 좌클릭 10/10·3단 차징 처치 1/1 |
| 3 | **오른쪽** 클릭 2.4초 | 마법 처치 **5/5**; `right-click-5of5.jpg` |
| 4 | 1번 키 0.5초, S 이동 | 가시덫 설치·탈출·처치 10/10 |
| 5~6 | 근접 탄환에 Q, E | 마법·물리 패링 반사 처치 체크. E는 CUA 스크린샷 픽셀의 탄 위치를 읽어 즉시 실제 E 키를 보냄 |
| 7~8 | Q 2.15초, E 3.1초 홀드 뒤 해제 | 각각 다수 탄환 패링 체크 |
| 9 | Shift+W 0.055/0.125/0.65초 | 사슬 이동 1·2·3단 체크 |
| 10 | W와 Space 병행 호출 2방식 | 구르기 **0/5**; `practice-10of12-roll-blocked.jpg` |
| 11~12·일반 1-1 | 도달하지 않음 | 완료·일반 몹 처치·드롭 미검증 |

10단계는 방향키와 Space의 동시 key-down이 필요하다. 현재 CUA `pressKey('w+space')`는 `keyPressIncludedMultipleNonModifierKeys`로 입력 전 거부했다. 별도 `pressKey` 호출의 `Promise.all` 및 키를 동반한 마우스 hold와 Space 병행은 연습 카운터 0/5였다. 게임의 구르기 로직이 실패했다고 판정할 근거는 없다. 이 지점은 **OS 입력 도구의 동시 일반키 표현 제한으로 인한 인수 HOLD**다. 실제 물리 키보드에서 방향+Space 5회, 뒤의 분노 단계, 완료 후 1-1 일반 몹 처치·드롭을 이어 검수해야 한다. PC A18 `NativePractice*` 소유자는 건드리지 않는다. 제품 변경 없이 적합한 동시 키 입력 수단을 먼저 확인한다.

범위: 첫 연습의 1~9 실제 입력 PASS, 수정된 오른쪽 마우스 5/5 PASS. 첫 연습 전체 완료와 첫 일반 몹·드롭은 **HOLD**다. 스크립트형 `NativePracticeCapture` 전체 PASS는 이 실입력 결과를 대체하지 않는다.

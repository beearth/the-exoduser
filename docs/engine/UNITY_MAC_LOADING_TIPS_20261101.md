# Mac 전환 로딩 팁 — 2026-11-01 KST

## 적용 범위

`NativeGame.StageFlowDrawLoad`의 게임 구역 전환 화면에 승인된 팁 네 개를 표시한다. 로비 진입 로딩 화면은 대상이 아니다. PC 후보 `0a60cbcee273e1150ba7df8909acb77dd9f18edc`의 팁 계약만 Mac 공통 코드에 옮겼으며, 후보의 로딩 원화 선택·초광폭 viewport·캡처 도구는 옮기지 않았다. 현재 Mac 화면은 진행선 없이 문양·제목·구역명으로 구성되어 있어 팁을 구역명 아래에 배치한다.

|순서 (`StageIndex mod 4`)|한국어|영어 및 기타 언어 폴백|동적 값|
|---:|---|---|---|
|0|보스의 패턴을 읽으면 패링 타이밍이 보인다|Read boss patterns and the parry timing shows|없음|
|1|인벤토리(`{0}`)에서 장비를 비교하고 장착|`{0}` for inventory — compare and equip gear|`inventory` 현재 primary, 없으면 secondary|
|2|`{0}`키로 아이템 수거|Press `{0}` to collect items|`interact` 현재 primary, 없으면 secondary|
|3|물약은 설정한 HP% 이하에서 자동 사용|Potions auto-use when HP falls below set %|없음|

각 팁 앞에 `◆ `를 붙인다. 키 표시 이름은 `KeyBindings.KeyName(code, English)`에서 얻는다. 필요한 두 바인딩이 모두 비어 있으면 임의 키를 안내하지 않고 0번 보스 패턴 팁을 표시한다. `English`는 로비 언어가 `ko`가 아닐 때 참이므로 `en` 외의 언어는 영어 문구로 폴백한다. 팁 순서는 난수·시각·저장 상태를 사용하지 않는다. 현재 이식 구역은 stage 0뿐이므로 자연 플레이에서 다른 순서의 노출은 이후 구역 구현에 달려 있다.

|화면 값|구현 값|
|---|---|
|노출 조건|`LoadPhase >= 2`, `LoadFade > 0.5`|
|서체|`NativeSilverHellUi.TextFont`가 고른 본문 폰트, 보통 400|
|물리 글자 크기|`round(clamp(Screen.height × 0.0125, 11, 16))` px, 중간값은 0에서 멀어지게 반올림|
|예시|높이 900 → 11px, 1080 → 14px, 1600 → 16px|
|색|`#b2a996`, 기존 `nt` 등장 알파|
|그림자|검정 80% × `nt`, 오른쪽·아래 각 2 물리 px|
|좌표|기준 1920×1080에서 x=580, y=700, width=760을 현재 화면 크기로 환산; `GUI.matrix=identity`에서 실제 물리 px로 렌더|
|줄 높이|`max(fontPixels × 1.4, GUIStyle.CalcSize(tip).y + 4)` 물리 px|

이 화면은 PC 후보의 진행선과 전체 원화 구성이 아직 없다. 그러므로 PC 후보의 `진행선 아래 8px` 배치와 1395 PNG·실기기 1x 검수는 Mac에서 통과했다고 주장하지 않는다. 실제 보이는 화면, 키 변경 중 전환 화면, 세 언어 폴백은 별도 Player 검수가 필요하다.

## 실제 Player 전환 화면 검수 도구

`--unity-loading-tip-capture -output <절대 폴더> --unity-qa-sandbox <절대 폴더> --unity-mute`는 비배치 Player에서만 실행한다. `NativeGame.LoadingTipCapture.cs`가 본 게임의 `OnGUI`를 1920×1080 창과 Mac 내장 화면 3024×1964 전체 창에서 캡처한다. 각 크기에서 `ko/en/fr` × 기본 팁 4개·실제 재바인딩 2개·두 슬롯 모두 미지정 2개, 합계 48개 GUI JSON과 PNG를 생성한다. 수치 검사뿐 아니라 PNG의 실제 가독성과 겹침을 1x에서 별도로 판정한다.

|검수 상태|값·격리|
|---|---|
|네 팁|QA 전용으로 `StageIndex=0..3`, `LoadPhase=2`, `LoadFade=1`, `LoadT=35`를 잠시 설정; 자연 플레이에서 stage 0 외 노출을 주장하지 않음|
|변경 키|제품 `KeyBindings.TrySet`으로 인벤토리 `KeyV`, 수거 `F2`; 캡처 직후 원래 primary·secondary 복원|
|미지정 키|각 action의 primary·secondary를 모두 null로 설정; 일반 보스 팁 대체 확인|
|오디오|`AudioListener.pause=true`, volume=0, 출력 샘플 peak=0, 살아 있는 `VideoPlayer` Direct 경로 0 검사. 제품의 기본 영화 출력은 AudioSource이고 예외 플래그 `--unity-video-direct`는 사용하지 않음. 물리 청음 검사는 별도|
|저장·종료|QA sandbox에서만 실행, 영상 닫고 1초 drain 후 정상 `Application.Quit(0)`|

검수 산출물과 실제 판정은 새 Player 실행 뒤 기록한다. 이 도구의 API로 만든 화면은 실제 Player 렌더이며 OS 손조작이나 자연 구역 진행을 뜻하지 않는다.

## Mac 새 Player 결과 — 2026-11-01 KST

|항목|실제 결과|
|---|---|
|기존 사용자 앱 3개|PID 38141·48476·52157 각각 요청 직전 PID/시작시각/실행 파일 일치 확인. AppKit `NSRunningApplication.terminate()` 일반 Quit 반환 1/1/1, 이후 세 PID와 다른 EXODUSER Player 0. 강제 종료 0. 38141 지정 로그에는 Physics/InputSystem/CodeReloadManager 정리 기록, 나머지 두 앱의 개별 teardown 로그는 없으므로 요청 수락·프로세스 소멸 범위로 한정|
|소스·빌드|`071cb00e950812f3d259af1eda47c7b74a1e480f`의 `unity/` 파일을 APFS 복제한 QA 프로젝트에서 공식 `PortVerification.Build -settingsQa true`; Unity 6000.6.7f1/ARM64, Succeeded, 오류0, 3,668,445,454 bytes. 빌드 영수증 SHA-256 `64ee4337cd6381cf4f5453a2d254072f63e350d8a1037cb6a12509447baf3e26`|
|같은 새 앱|실행 파일 SHA-256 `86ed207d41b6b62afee3aef393d4ddc322590f1120fd53a3324f9644390458ba`; Runtime DLL `6a79503146e5d4c4e930dfcc01f6b7bb62a3fa273571064a6c92a720d79515aa`이며 GUI 영수증의 실행 중 Runtime SHA와 같음|
|격리 M1|같은 앱 `-batchmode --unity-mute --unity-m1-check` exit0, Apple M5 Pro/Metal, 23/23 `ok`, `firstBlocked=""`, 32 월드 캡처. `guiRepaints=0`이므로 GUI 증거로 사용하지 않음. 영수증 SHA-256 `189d8c07c4add9e820d7970f66d4096023d29fe2c1e39e5aac655836241f6f54`|
|실제 GUI|같은 앱 비배치 `--unity-loading-tip-capture`, exit0. PNG 48장·각 프레임 실제 OnGUI Repaint 1회인 audit 48개. 1920×1080 24장(font 14 물리 px), 3024×1964 24장(font 16 물리 px). ko/en/fr 각 16장, 기본4·키 변경2·미지정2 케이스를 크기별로 확인. GUI 영수증 SHA-256 `590a2b2f272150577b16f133d823487d0a4d87f6fd8dfe26ae09fb15659c85ee`|
|키·언어|실제 제품 바인딩 API로 `KeyV`→표시 `V`, `F2`→표시 `F2`; 두 슬롯 모두 비면 ko/en의 보스 패턴 일반 팁. fr은 네 팁 모두 영어 문구. 48 audit에서 기대 문구의 본문·2px 그림자 쌍 모두 확인|
|1x 가독·겹침|실제 원본 픽셀 PNG의 1920 ko 기본·변경 키, 3024 fr 기본을 육안 확인. 모든 48 audit에서 팁 잉크와 다른 텍스트 교차 0; 대표 잉크 높이 1920에서 20.28px, 3024에서 23.17px, 알파1·캡처 파일 최소 434,849bytes. 중앙 패널 안에서 판독 가능. **팁 영역 VISUAL VERDICT: PASS**|
|무음·저장·종료|GUI 영수증 `batchMode=false`, `listenerPaused=true`, volume0, 실제 Listener 출력 샘플 peak0, 활성 Direct VideoPlayer 0. 영화 기본 출력은 AudioSource이며 예외 Direct 플래그 미사용. M1·GUI에 별도 `--unity-qa-sandbox` 절대 경로를 지정했고 사용자 저장 경로를 직접 열거나 정리하지 않음. 앱 `QA_MEDIA_DRAIN_COMPLETE LOADING_TIPS` 후 exit0, 잔여 Unity/EXODUSER 프로세스0. OS 물리 출력 루프백·청음과 사용자 저장 파일의 전후 바이트 비교는 미검증|

산출물은 `/Users/fordeargamers/exoduser-wt/_out/mac-loading-ui-qa-20261101/`의 `build-receipt.json`, `m1/m1-check.json`, `gui/loading-tip-receipt.json`, 각 PNG/JSON, Player/Editor 로그에 있다. 비배치 캡처는 실제 새 Player가 생성했지만 `StageIndex`와 키를 QA에서 설정했다. 자연 구역 진행에서 노출된 것은 stage0뿐이며 1~3번 팁의 자연 플레이·OS 입력은 입증하지 않는다. 다른 HUD의 번역이나 전체 게임 화면을 PASS로 확대하지 않는다.

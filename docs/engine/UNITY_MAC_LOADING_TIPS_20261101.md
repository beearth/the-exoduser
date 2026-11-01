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

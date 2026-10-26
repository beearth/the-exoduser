# Unity 우측 상단 상태 표시 보정 — 2026-10-26

## 범위와 근거

일반 실행의 `NativeGame.OnGUI()`가 우측 상단 상태 정보를 항상 그린다. 개발 플래그 조건이 없다. 기존 720p 실제 Player 캡처 `/_out/UNITY-MAC-HUD-BLEND-20261026/capture-world-blend/hud-blend-idle-720p.png`에서는 이 영역이 화면 가장자리의 불투명한 검정 직사각형으로 분리되어 보인다. 웹 원본 `game.html`의 `#mmLvl`도 우측 상단 정보 묶음이며, 최신 사용자 방향은 게임 월드와 어울리는 약한 배경이다. 이번 변경은 Unity의 이 표시만 다룬다. 웹 원본 수치·로직·CSS는 수정하지 않는다.

| 항목 | 변경 전 | 변경 후 / 적용 위치 |
|---|---|
| 표시 조건·위치 | 일반 게임 화면 상시, 우상단 접촉, `statusX = Screen.width / min(Screen.width/1920, Screen.height/1080) - 316` | 동일, `NativeGame.OnGUI` |
| 영역 | 316×124 논리 px, 720p에서 약 211×83px | 동일, `StatusBackdrop` |
| 배경 | 불투명도 .94의 검정에 위·아래 전폭 1px 테두리, 공용 `Panel` | 좌→우 24개 띠, 어두운 녹흑색 RGB(.025,.032,.027), 불투명도 `Lerp(.16,.40,t²)` (`t=(i+.5)/24`), 테두리 없음. `Panel`은 다른 표시용으로 그대로 유지 |
| 제목 | 20px, x+20/y+12, 276×32 | 20px 굵게, RGB(.90,.84,.69), x+18/y+14, 280×30 |
| 상세 2줄 | 16px, x+20/y+47 및 y+77, 276×30 | 16px, RGB(.84,.82,.75), x+18/y+48 및 y+78, 280×28 |
| 내용·값 | `1장 · 썩은 숲`; `Lv.{Level}   경험치 {Experience} / {MaxExperience}`; `처치 {Kills}   악의 {Materials}` | 문자열·값 공급자·갱신 주기·언어 분기 변경 없음 |
| 하단 HUD | 13슬롯, 자원 구슬, 입력·수치 | 변경 없음 |

소스는 `unity/Assets/Exoduser/Runtime/NativeGame.cs`다. `StatusBackdrop`은 기존 `Fill`/Unity 기본 흰 텍스처를 재사용한다. 새 이미지나 에셋은 없다. 기존 오른쪽 정보 영역 이외의 패널에는 적용되지 않는다.

## 검수 경계

변경 전 원본 파일·HEAD·INDEX 항목과 관련 문서 검색 결과는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-STATUS-BLEND-20261026/`에 별도 보존했다. 코드 변경 전 다른 작업자의 tracked 변경은 없었다. 현재 여러 이전 Unity Player가 실행 중이어서 사용자 앱을 종료하거나 기존 빌드를 덮어쓰지 않았다. 새 720p/1080p Player 캡처와 실제 시각 판정은 독점 실행 가능 여부 확인 뒤 기록한다. 기존 캡처는 변경 전 근거이며 변경 후 합격 증거가 아니다.

2026-10-26 후속: 최신 HEAD `207ffc8bf`로 만든 새 Player의 `status-world.png`에서 우측 상단 텍스트와 월드 위의 약한 배경을 확인했다. 이것은 한 정상 화면의 최소 시각 확인이며 720p/1080p 전수·수치 픽셀 측정·게임 전체 HUD 판정은 아니다. [빌드 출처](UNITY_MAC_HEAD_PLAYER_20261026.md).

# Unity UI 새 Player 검수 — 2026-10-26

Mac 호스트 연결이 현재 불가능하여 사용자가 허용한 PC 대체 실행 검수를 진행한다. 공유 체크아웃과 Claude의 PC 인벤토리 작업 폴더는 수정하지 않는다. 이 브랜치는 검수 입력과 복구점이며 main 병합 또는 사용자 실행본 교체를 뜻하지 않는다.

| 항목 | 고정 입력 |
|---|---|
| PC 인벤토리 커밋 | 5146c0f7abca35590164ae9174f566f1add02912 |
| Mac 자막·로비 커밋 | 207ffc8bf9ffc7b653b321a8682d24549f586272 |
| 충돌 없는 병합 트리 | 37fea13095e57f4d92854cee5f6138266ee28481 |
| 로컬 Unity Editor | 6000.4.8f1 / Windows x64 |
| 사용자 세계관 정본 | world_intro_v22b_steam.mp4 / 102204634 bytes / SHA256 3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f |
| 검수 옵션 | --unity-ui-resume-smoke -output <절대 새 경로> |
| 진단 UI 비교 | 별도 프로세스에 --unity-ui-diagnostics 추가 |
| 실행 격리 | PortVerification.Build -settingsQa true |

UiResumeReview는 명시적 검수 옵션이 없으면 설치되지 않는다. 기존 public 로비·영상·입장 메서드를 호출하고, 검수 실행 중 lobbySmoke/Running 상태만 reflection으로 제어한다. 실제 Font 로드·єії glyph 질의·uk→ko 스타일 객체 복귀 및 720p/1080p Player PNG를 검사한다. 일반 캐릭터 저장은 기존 generic smoke 옵션 계약에 따라 열지 않는다. 제품 설정과 다른 QA product/identifier를 사용한다.

루트 프로젝트는 E:/exoduser-runtime/codex-ui-resume-20261026/unity 이며, 테스트·출력·원본 archive·로그·영수증은 I:/EXODUSER-Storage/qa/unity-ui-resume-20261026 에 둔다. MediaRecovery로 이미 승인된 byte를 가진 두 누락 MP4는 기존 PC StreamingAssets에서 읽기 전용 복사했고, 세계관 정본 SHA를 다시 확인했다. 프로젝트 버전은 이 Windows 환경에만 6000.4.8f1로 고정하며 병합 입력의 ProjectVersion도 6000.4.8f1이며 그 원문은 I:에 보존했다.

현재 검증 상태: 소스 준비와 정본 해시 확인 완료. 새 Unity import/빌드/실제 Player 실행·이미지 육안 검수는 아직 미완료다. 자동 fixture 결과는 OS 직접 마우스·키보드 입력이나 전체 플레이 인수와 다르다. 결과가 나오면 실제 영수증과 이미지를 근거로 갱신한다.

## 실제 Player 1차 결과와 추가 회귀

일반/진단 두 실행 각각 42개 검증과 8 PNG, 합계 84개 검증/16 PNG를 확보했다. 실제 Unity Font의 єії 질의, uk→ko 스타일 객체 복귀, 720p·1080p 이미지의 자막 누락/잘림 없음, 일반 로비의 검수 버튼 숨김 및 진단 모드 노출을 직접 확인했다.

추가 회귀: 원본 game.html의 charNameHud는 display:none인데 NativeGame.OnGUI는 이름 있는 캐릭터에 420×50 미리보기 패널을 출력한다. 새 fixture는 멈춘 동일 월드에서 빈 이름/QA 이름을 바꿔 좌상단 310×80 픽셀 차이를 비교한다. 일반 모드는 변화율 <0.001, 진단 모드는 >0.02가 기대값이다. 현재 단계는 제품 수정 전 실패 재현을 위한 검수 코드만 추가했으며 실제 결과는 아직 대기 중이다.

환경: 기본 UPM 초기화에서 path undefined 오류가 발생했다. 외부 패키지가 없는 현재 manifest에 대해 설치된 내장 모듈만 쓰는 -noUpm 경로로 빌드 성공했다. 글로벌 환경/캐시/사용자 설정 변경은 없고 패키지 관리자 자체 복구를 주장하지 않는다. TagManager 기존 파싱 경고와 Windows 영상 타임스탬프/색상 기본값 경고는 별도 미해결로 기록한다. OS 직접 입력은 대상 창 캡처 불일치로 진행하지 않았고 제 인터랙티브 QA 앱만 종료했다. 다른 실행창은 건드리지 않았다.

## 이름 있는 캐릭터의 개발 표시 최소 수정

수정 전 실제 Player에서 이름 변경만으로 좌상단 변화율 0.3755241930484772가 발생해 일반 HUD 회귀가 실패했다. NativeLobby의 기존 --unity-ui-diagnostics 값을 읽기 전용 internal DiagnosticUiEnabled로 노출하고 NativeGame의 기존 미리보기 패널 조건에 그 값을 추가했다. 다른 이름·선택·저장·전투·입력 처리는 변경하지 않는다. 일반 실행에서는 원본 웹처럼 이 개발 패널을 그리지 않으며 명시 진단 실행은 기존 패널을 유지한다. 수정 후 실행 검수는 다음 단계다.

RED 실행에서는 별도로 첫 GUI 렌더 전에 스타일을 질의한 검수 순서 문제 6건, 첫 검정 PNG, 종료 코드 0xc0000005도 관측했다. 명시적으로 숨긴 GUI 실행기가 원인 후보여서 실제 GUI Player를 숨기지 않게 바꾸고 CaptionVisible·폰트·영상 texture/PNG 내용 준비 대기 및 decoder 종료 후 프레임·0.5초 정리 대기를 fixture에 추가했다. 제품 폰트는 변경하지 않았다. 이 검수 결함과 종료 문제의 해소는 GREEN 재실행 결과로만 판정한다.

## 비동기 PNG 읽기 검수 보정

첫 GREEN 실행은 자막/폰트 준비 판정을 통과했으나 ScreenCapture 파일 존재·크기만으로는 쓰기 핸들이 닫혔는지 확인할 수 없어 내용 검사에서 SharingViolation이 발생했다. 검수 코드만 보정해 공유 모드를 제한한 읽기 열기 성공과 PNG 끝 IEND까지 기다린다. 제품 폰트·영상·저장 로직은 변경하지 않는다. 종료 코드 0xc0000005도 관측되어 UI 렌더 결과와 프로세스 종료를 따로 판정한다.

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

루트 프로젝트는 E:/exoduser-runtime/codex-ui-resume-20261026/unity 이며, 테스트·출력·원본 archive·로그·영수증은 I:/EXODUSER-Storage/qa/unity-ui-resume-20261026 에 둔다. MediaRecovery로 이미 승인된 byte를 가진 두 누락 MP4는 기존 PC StreamingAssets에서 읽기 전용 복사했고, 세계관 정본 SHA를 다시 확인했다. 프로젝트 버전은 이 Windows 환경에만 6000.4.8f1로 고정하며 원본 6000.6.7f1 파일은 I:에 보존한다.

현재 검증 상태: 소스 준비와 정본 해시 확인 완료. 새 Unity import/빌드/실제 Player 실행·이미지 육안 검수는 아직 미완료다. 자동 fixture 결과는 OS 직접 마우스·키보드 입력이나 전체 플레이 인수와 다르다. 결과가 나오면 실제 영수증과 이미지를 근거로 갱신한다.

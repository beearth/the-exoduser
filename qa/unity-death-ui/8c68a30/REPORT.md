FAIL — 1. 빌드 오류 0·smoke 영수증 오류 0 — 빌드 1회 Succeeded/errors=0(Unity 6000.6.7f1 ARM64, PortVerification.Build, -remodel-scenes 1, FirstPlayable·RM1_Slice 포함). 그러나 1920·3840 영수증 모두 passed=false, `filter at 2s 0 | saturation volume at 2s 0 | phase after revive None` 3개 실패. launcher exit 0은 합격 근거로 쓰지 않음 — [1920 PNG](pick/01-smoke-1920-wrong-screen.png), build-receipt.json, capture-current/{1920,3840}/death-screen-capture.json.

FAIL — 2. 슈퍼와이드 양끝 탈채도·감광 / 빨간 판 없음 — 실제 3840×1080 PNG지만 FDG 인트로+검은 좌우 여백이므로 사망 필터 판정 불가. 좌/중/우 64px 전높이 띠 HSV 채도 평균 0/0.088752/0, sRGB 명도 가중평균 0/0.254804/0(0~1); 검은 여백을 필터 PASS로 인정하지 않음. 5120×1440은 동일 단계 2회 실패 중단 규칙으로 미실행이며, Mac 창 크기 제한 때문이라고 판단하지 않음 — [전체](pick/02-smoke-3840-wrong-screen.png), [양끝·중앙 1x 크롭](pick/03-smoke-3840-edge-strips.png), death-metrics.json.

FAIL — 3. 3D 필드·보스전 카메라 필터 — death smoke는 필드/보스 장면을 전환하지 않았고 PNG에는 인트로만 출력됨. 해당 카메라 적용 미검증 — [잘못 촬영된 장면](pick/01-smoke-1920-wrong-screen.png), source-evidence.log.

FAIL — 4. 사망 글자 1x·3배 잔점 0 / 부활 0.5초 페이드 — 사망 글자가 출력되지 않아 1x·3배 글자 품질 미검증. 영수증 부활 단계 None, 중간·부활 후 PNG도 인트로. 코드의 ForcedReviveAge=.25와 이후 .7초 대기 캡처는 0.5초 연속 프레임 증거가 아니므로 페이드 PASS 불가 — [1920 결과](pick/01-smoke-1920-wrong-screen.png), capture-current/1920/death-screen-capture.json, source-evidence.log.

FAIL — 5. 일시정지·설정·로비·종료 확인·캐릭터 삭제 확인 버튼 — 로비 입장 버튼에 회색 그라데이션이 남음: (1500,735) RGB 78/75/73, (1500,775) 61/59/59. 로비 금빛 선은 y726 한 물리 픽셀 행(196/185/160) 확인. 나머지 화면은 미검증: parity가 이름 OnGUI hit-test에서 중단; UI-finish pause 영수증 passed=true/failures=0이나 일시정지·설정·종료확인 이름의 PNG가 모두 로비여서 시각 PASS 거절. 격리 캐릭터 삭제 확인은 CUA 클릭 2회에도 로비 유지 후 중단(삭제 실행 없음) — [로비 1x+버튼 3배 크롭](pick/04-lobby-button-gray-full-and-x3.png), button-metrics.json, capture-current/buttons/Player.log, capture-current/pause/ui-finish-pause.json, manual-dialog-attempts.json.

PASS — 6. 인트로 홀드 게이지 SPACE/ESC 링 내부 — 1920×1080 실제 Player 가상 Input System 장치 검수 132/132 PASS, 897프레임, 실패 0. Space·Escape 각 진행률 약 .489 프레임의 3배 크롭에서 두 글자가 모두 링 내부에 들어옴. OS 손조작 검사와 구분 — [전체 1x](pick/05-intro-space-full-1920.png), [SPACE·ESC 3배](pick/06-intro-space-esc-x3.png), capture-current/intro/cinematic-input.json, intro-selected.json.

원인: NativeGame.cs의 legacyFixture 목록에 death smoke가 없어 lobby.Begin()이 호출됨. 로비가 blocking일 때 TickScreen에는 null Player가 전달되고 OnGUI가 사망 화면 전에 반환한다. 새 smoke는 이 로비를 닫지 않는다. 이는 검수 진입 경로 결함이며, 사망 필터 자체의 실게임 품질은 미검증이다. 버튼은 실제 회색 표면 FAIL이며 PlateTextures/ActionPlate의 색 공간·합성 경로가 원인 조사 지점이다(원인 확정 아님). 직접 코드 수정·커밋·push 0.

실행·격리: 모든 Player는 open -g -n -W, 창 모드 -screen-fullscreen 0 -popupwindow, -nosound/--unity-mute, 명시 sandbox 사용. 이 SHA에는 저장 경로 바인딩 로그가 없어 요구된 로그 확인은 미검증; 실행 인자·NativeQaSandbox 소스·격리 파일로만 확인했다(sandbox-binding.json). dialogs는 검수자 SIGTERM, 나머지는 자체 종료; 최종 Editor/Player 잔여 0. 실패 조건 그대로 재실행 0, 다른 해상도 smoke 2회 후 중단.

정리: build-current·PlayerDataCache·sandbox·임시 Python 환경 삭제, 인트로 중간 PNG 897장(2.41GiB)과 나머지 불필요 원본 PNG 삭제. 마지막 정리 df 실회수 5.97GiB(인트로 선행 정리 별도). 판정 PNG는 직접 눈검수한 pick/ 6장만 보존, 작업 폴더 약22MiB. Unity 자동 tracked 변경 복원·신규 Assets 생성물 제거; 시작 전 미추적 2개·기존 Library 보존. cleanup-receipt.json·final-state.log 참조.

SHA 8c68a3008f12094607fd95d1f32c95e0acfce72f | 소요 412초(체크아웃 준비~검수·정리·보고) | df /System/Volumes/Data 남은 용량 684Gi | DEATH-UI-GATE: FAIL 8c68a3008

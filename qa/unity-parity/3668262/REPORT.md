PASS — 정식 빌드 오류 0 — Unity 6000.6.7f1/ARM64, 정식 빌드 1회 Succeeded, receipt errors=0·로그 규칙 오류0, Runtime SHA 일치 — 캡처 없음; build-receipt.json·build-rule-judgment.json·package-receipt.json.
PASS — M1 23/23·정상 종료 — 23/23 ok, 32장 촬영, guiRepaints=2125, 로그 오류0·강제 종료0·잔여 Player0 — pick/1600x900_m1_clear_full.png; m1/m1-check.json·m1/launch-receipt.json.
FAIL — ko/de/fr × 5해상도 1410장·issueCount 0 — 실제 2560×1600/ko 12/1410장(1398장 미촬영), issueCount=58(메뉴48+캐릭터선택10), 필수 관측 누락1213, 원본 분석 exit2 — pick/2560x1600_menu_full.png·pick/menu_issue_x3.png·pick/2560x1600_character4_full.png·pick/character_buttons_x3.png; overlap/overlap-summary.json.
FAIL — 가림·로딩 관측 누락 0 — 확보12장 가림 계측 누락0이나 전체 미완료; 로딩 0/270장, 미촬영270장(첫 로딩15+전환255), 분석기 필수 로딩 관측 누락100 — 해당 캡처 없음; loading-judgment.json.
FAIL — scroll-ink 4/4 — 0/4 검증, 입력4장 모두 미촬영; 원본 scroll-ink.py exit1/FileNotFoundError(2560x1600-ko-튜토리얼0.png) — 해당 캡처 없음; scroll-ink-analyze.log·analysis-receipt.json.

중단 원인 — overlap/Player.log:51 `UI_OVERLAP_FAILED System.InvalidOperationException: 잠긴 직업/이름 열기 실제 OnGUI hit-test 실패`; UiNameGateAtCurrentSize가 전체 캡처 경로에서 예외를 던짐. nameOpened는 Mac 판정에서 제외하며, 이번 FAIL은 캡처 중단·미검증 및 계측58건에 대한 판정이다. 무수정 재실행0, 제품 코드 수정·커밋·push0.
직전 5b6b4fce9 대비 — 빌드·M1은 동일 PASS; 전체 캡처1410→12장으로 조기 중단, issueCount18→부분58(모수가 달라 직접 증감 비교 불가), 로딩270→0장·scroll-ink1/4→0/4 미검증; footer 수정 효과 미검증.
육안 — pick/ 5장 전체를 직접 확인. 메뉴 footer 두 줄과 캐릭터 하단 버튼 문구는 읽히며 다른 문구의 실제 충돌은 확정하지 않음; 계측58건은 그대로 FAIL. 1920/3840 및 설정 하단 footer는 중단 전에 도달하지 못해 캡처·판정 불가. 2560 전체2장·3배 무보간 크롭2장·M1 전체1장 보존.
실행 — 맵 4차 REPORT4 근거로 무창 시도0. open -g -n -W·창 모드 -screen-fullscreen 0 -popupwindow·-nosound/--unity-mute. 두 실행 --unity-qa-sandbox는 작업 sandbox/ 아래 지정; M1 제품은 -output 우선으로 작업 m1/ 아래 저장함. 두 Player.log에 네이티브 sandbox 바인딩 줄은 없어 해당 로그 요건은 미검증(sandbox-binding.log). 임시 저장은 모두 삭제.
정리 — build-current·PlayerDataCache·임시 저장·임시 Pillow 환경 삭제, 논리11.97GiB 제거(df 즉시 +5.96GiB). 미선정 PNG44장 삭제, 판정 PNG5장만 pick/에 보존. Unity 자동변경857개 복원·신규 생성 Assets 정리, 기존 untracked2개·Library 보존, tracked 변경0·잔여 Editor/Player0 — cleanup-receipt.json·final-state.log.

SHA 366826269075a8a2dc04b9a4699fca45d52f3b1d | 소요 284초(빌드 착수~검수·정리·보고) | df -h /System/Volumes/Data 남은 용량 684Gi
PARITY-GATE: FAIL 366826269

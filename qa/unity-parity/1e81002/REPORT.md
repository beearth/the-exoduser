PASS — 정식 빌드 errors 0 — 지정 SHA detach·fetch 0, 전체 checkout/기존 Library 재사용. PortVerification.Build·-remodel-scenes 1 정식 1회 Succeeded, errors=0, Unity 6000.6.7f1 ARM64. 캡처 영수증과 패키지 Runtime SHA 일치 — 캡처 없음; build-receipt.json·package-summary.json·build.log.
PASS — M1 23/23·정상 종료 — 23/23 ok, firstBlocked 비어 있음, guiRepaints=2136, 32장 촬영, QA_MEDIA_DRAIN_COMPLETE M1·open -W exit0·잔여 Player 0 — pick/1600x900_m1_clear.png; m1/m1-check.json·m1/summary.json.
FAIL — Mac 이름 입력 hit-test — 다섯 해상도 모두 UNVERIFIED, nameOpened=false, 전달 이벤트 영수증 0건. 두 클릭 모두 네이티브 큐 이벤트의 제품 OnGUI 수신 시간초과. lockedBlocked=true도 입력 성공 증거로 승격하지 않음. 이름 화면은 capturePreparedByApi=true로 수집했으므로 hit-test PASS 근거 아님 — pick/2560x1600_character4.png; name-input-summary.json·overlap/Player.log:51,66,80,94,108.
FAIL — 1410장 완주·issueCount 0 — ko/de/fr×5해상도 1410/1410장, 정상 종료·필수 관측 누락 0·가림 계측 누락 0이나 issueCount=9103, 원본 analyze.cjs exit2. 글자-글자8524·글자-버튼152·화면 이탈250·글자-판177 — pick/2560x1600_menu.png·2560x1600_character4.png·2560x1600_settings_footer.png·2560x1600_stash.png; overlap/overlap-summary.json·issue-summary.json·selected-frame-summary.json.
PASS — 로딩 270장·관측 누락 0 — 첫 로딩15+전환255, 15개 해상도/언어 조합마다18장, Repaint/가시 텍스트 관측270/270·원본 분석기 missing=[] — pick/2560x1600_loading.png; loading-summary.json.
FAIL — scroll-ink 4/4 — 원본 scroll-ink.py --candidate exit1, 실제 후보 2/4. 튜토리얼 두 해상도 PASS; 보관함 두 해상도 nearReference=false. 보관함 감사 x=583.00/364.00이 고정 ROI x=623/388과 불일치해 잉크 포함 검사를 통과하지 못함. 화면의 글자가 없다는 의미는 아님 — pick/2560x1600_stash.png; scroll-ink-summary.json.

FAIL — 남은 원인 — 이름 검사 전송 경로의 OnGUI 수신 확인 실패(NativeGame.UiOverlapCapture.cs:170–176, NativeLobby.cs:149–165); 실제 이름 버튼 고장 여부는 미확정. 겹침 후보는 설정스크롤3 852건·설정3 635건·봉안함300건 등이며 NativeLobby.SilverHell.cs:11 출처5774건·NativeKeyBindList.cs:135 출처1469건. 보관함 scroll-ink 좌표 불일치도 남음. 검사기/임계 변경·무수정 Player 재실행 0 — 위 캡처 및 issue-summary.json.
PASS — 직접 눈검수·직전 issue 비교 — pick/ 6장을 모두 직접 열어 확인. 메뉴 footer 두 줄·캐릭터 하단 버튼 문구·설정 footer는 읽히고 분리되어 보임. 2560×1600/ko 메뉴 계측은 직전48→현재0, 캐릭터선택4는 현재2건. 현재 설정0의1건은 상단 탭 T/A 경계0.547px이며 footer 건이 아님. 계측9103건을 육안 확정 충돌9103개로 단정하지 않으며 요구한 0건 게이트는 FAIL 유지 — pick/ 전체6장.
FAIL — sandbox 로그 바인딩 확인 — 지정 인자는 두 실행 모두 작업 sandbox/ 하위로 전달. 관측된 저장은 M1의 -output 우선 경로(m1/) 및 sandbox/overlap 내부이며 모두 삭제. 두 Player.log에는 sandbox 바인딩 문구가 없어 요청한 로그 확인은 미검증 — 캡처 없음; sandbox-binding-summary.json·각 launch-receipt.json.
PASS — 실행·정리 — Player 두 실행 모두 open -g -n -W·창 모드·무음, 추가 Player 인자0·Player batchmode0. 코드 수정·커밋·push0. 빌드/PlayerDataCache/임시 저장/Pillow 환경·overlap PNG1410장/개별 JSON/상세 보고 삭제, 판정 PNG6장·요약 JSON·로그만 보존. 논리 19.58GiB 삭제. Unity 생성 tracked857개 복원·새 Assets 생성물56개 제거, 기존 untracked2개·Library·prev/ 및 타 작업 유지, tracked 변경0·잔여 해당 Player/Editor0 — 캡처 없음; cleanup-summary.json·final-state-summary.json.

직전 366826269 대비 — 전체12장 중단→1410장 완주, 로딩0→270장, scroll-ink 미검증0/4→2/4. 직전58건은 부분 모수이고 현재9103건은 전체 모수라 단순 증감 비교하지 않음. 이름 입력은 여전히 통과하지 못함.

SHA 1e810024dd86f39ecce6d0aafa3f6c2c1295d94e | 소요 1220초(빌드 착수~검수·정리·보고) | df -h /System/Volumes/Data 남은 용량 646Gi
PARITY-GATE: FAIL 1e810024d

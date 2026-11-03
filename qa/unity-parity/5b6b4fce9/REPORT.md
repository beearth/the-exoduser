PASS — 대상·정식 빌드 1회 — fetch/HEAD=5b6b4fce9a8350e80ed73e9c4e9c49204bd8b2e7; 전체 checkout·기존 Library 재사용, Unity6000.6.7f1/ARM64 Succeeded/errors=0 — 캡처 없음; build.log·build-receipt.json  
PASS — 같은 패키지 M1·정상 종료 — 23/23 ok, 32PNG, guiRepaints=2145, 실패 로그0·강제 종료0; Runtime SHA 일치 — m1/caps/·m1/m1-check.json·m1/launch-receipt.json  
FAIL — 전체 UI 겹침 — ko/de/fr×5해상도 1410/1410, overlap 147(제공된 이전값)→18(목표0), 가림 계측 누락30프레임; 촬영 중단0·정상 종료 — pick/2560x1600_settings_full.png·pick/settings_footer_x3.png; overlap/overlap-summary.json  
PASS — 로딩 관측 — 270/270장(첫 스테이지15+전환255), 관측 누락0 — overlap/*-로딩.png·overlap/*-전환로딩*.png; loading-judgment.json  
FAIL — 게이트6 scroll-ink 원본 대조 — 1/4: 2560튜토리얼만 PASS, 1600튜토리얼·양해상도 보관함 FAIL(exit1); 임계/판정 변경0·재실행0 — pick/tutorial_ink_x3.png·pick/stash_ink_x3.png; scroll-ink.json  
FAIL — nameOpened 1920x1080 — true 미검증(null), lockedBlocked도 미검증; Mac 실제 마우스 영수증 없음 — overlap/1920x1080-ko-이름입력.png(API 진입 참고 캡처); name-gate.json  
FAIL — nameOpened 2560x1080 — true 미검증(null), lockedBlocked도 미검증; Mac 실제 마우스 영수증 없음 — overlap/2560x1080-ko-이름입력.png(API 진입 참고 캡처); name-gate.json  
FAIL — nameOpened 3840x1080 — true 미검증(null), lockedBlocked도 미검증; Mac 실제 마우스 영수증 없음 — overlap/3840x1080-ko-이름입력.png(API 진입 참고 캡처); name-gate.json  
FAIL — nameOpened 1600x900 — true 미검증(null), lockedBlocked도 미검증; Mac 실제 마우스 영수증 없음 — overlap/1600x900-ko-이름입력.png(API 진입 참고 캡처); name-gate.json  
FAIL — nameOpened 2560x1600 — true 미검증(null), lockedBlocked도 미검증; 보충 로비 클릭2회 진입 미관측 후 중단 — overlap/2560x1600-ko-이름입력.png(API 진입 참고 캡처); name-gate.json  
PASS — 수정① 대장간 확률 줄 반영 — y471.8→467.8, 비용447.4·행 간격20.4 design px; 실제 두 해상도 줄 분리 확인 — pick/forge_lines_x3.png·pick/1600x900_forge_full.png; source-checks.log  
PASS — 수정② 스크롤 원점 보정 소스 반영 — 두 BeginScrollView의 clamped scroll 보정·중첩 원점 push/pop 확인; 제품 잉크 판정은 위 게이트6 FAIL — pick/tutorial_ink_x3.png·pick/stash_ink_x3.png; source-checks.log  
PASS — 수정③ exo-unity 위임 스텁 반영 — install-bin 예외 소스 확인, 공용 bin 없는 실제 pwsh 실행 exit1 — 캡처 없음; source-checks.log·forward-missing-bin.log  
무창 불가 — 근거: 맵 4차 REPORT4 (_out/UNITY-MAP25D-GB1A-MAC/REPORT4.md). Player batchmode 시도0; open -g·창 모드 -screen-fullscreen 0 -popupwindow·-nosound/--unity-mute, 명시 QA sandbox 사용.  
PASS — 실행·정리 — Editor/Player 잔여0, 빌드·PlayerDataCache·임시 세이브 삭제(논리11.95GiB, 삭제 직후 df +5.81GiB); 자동 tracked857개 복원·신규meta56개 삭제, 기존 untracked2개/Library 보존. 직접 코드 수정·커밋·push0; pick PNG6장 — cleanup-receipt.json·final-state.log  
원인 — failure-evidence.log:1 "issueCount=18 missing=30": 2560×1600 ko/fr 설정 하단 Rect가 0.620px 교차; 일시정지/종료확인 표면은 "내부 상태별 GUIStyle 바탕 알파 미증명". 육안 글자 충돌 확정과 계측 FAIL을 구분함.  
원인 — failure-evidence.log:2 "productionPassed=false": 1600튜토리얼 잉크912/ROI912픽셀(배경까지 선택), 보관함 잉크1/0픽셀(필요110/51 미만); 현재 Mac PNG로 잉크 포함을 증명하지 못함. 색·밝기 판정과 Mac 렌더 차이의 원인 분리는 미확정.  
원인 — failure-evidence.log:3 "Mac actual-mouse result: UNVERIFIED": 실제 마우스 검사/영수증은 #if UNITY_STANDALONE_WIN 전용. Mac 보충 클릭은 로비에서 진입 미관측2회 후 종료했으며 제품 원인은 확정하지 않음.  
SHA 5b6b4fce9a8350e80ed73e9c4e9c49204bd8b2e7 | 소요 1058초(빌드 착수~검수·정리·보고) | df -h /System/Volumes/Data 남은 용량 684Gi  
MERGE-GATE: FAIL 5b6b4fce9

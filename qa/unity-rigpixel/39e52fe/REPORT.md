PASS — 대상·정식 빌드 1회 — 39e52fe22f73c92001531cad1b38096cf952bbe9 detach·전체 checkout·기존 Library 재사용. PortVerification.Build/-remodel-scenes 1, Unity6000.6.7f1 ARM64 Succeeded·errors=0·117.55초, RM1_Slice 포함 — 캡처 없음; build-command.json·build-receipt.json·build.log
PASS — 최우선 검격 뒤 검은 사각 면 0 — 두 해상도 entry/2초/6초/10초 원본 직접 열람, 검격이 보이는 6초·10초 표본에서 큰 검은 면 관측0. 6초 검격 3배도 배경이 그대로 보임. 직전 aa9538206의 회전 사각 면과 직접 비교. 정지 표본 판정이며 연속 영상 검증은 아님 — pick/1920_full.png·3840_full.png·*_hero_slash_x3.png
PASS — 망토 낱픽셀 0 — 두 해상도 정지·이동 망토 nearest3x 직접 열람, 드러난 망토에서 고립 1~2텍셀 섬 관측0. 몸체에 연결된 끝의 계단과 구분, 검격·적 가림 구간은 제외 — pick/1920_cape_armor_x3.png·3840_cape_armor_x3.png
PASS — 흑철 판금 유지 — 중성의 짙은 몸통·하체, 제한된 어깨·팔 밝은 금속 면이 붉은 망토·피부·대검과 분리됨. 직전 PASS 횃불 영웅과 비교해 회귀 관측0 — pick/*_cape_armor_x3.png
PASS — 칼 궤적 동일 픽셀 크기 — 영웅·대검·검격 외곽 모두 화면1px 계단, 3배 크롭에서3px 단위. 두 영수증 textureWidth480·texelScale1 — pick/*_hero_slash_x3.png
FAIL — 60fps 유지 — 1920 평균67.75fps/p95 26.49ms는 PASS, 3840 평균56.13fps/p95 41.52ms로60 미달. 직전127.11/83.11fps보다 하락. 713/719틱·이동2065.40/2107.52px·anchor오차0.434/0.090. 원인 확정은 프로파일링이 필요하며 이번 검수는 성능 미달 관측까지만 확인 — pick/1920_full.png·3840_full.png; capture-current/*/rigpixel-natural.json
FAIL — 영수증 최종 오류 0 — 빌드errors0·두Player.log Error/Exception0, entry는 둘다 passed=true/Playing/blocking=false. natural은1920 passed=true, 3840 passed=false(위 FPS 미달); 따라서 최종 영수증 실패1건 — pick/*_full.png; capture-current/*/rigpixel-*.json·Player.log
PASS — Player·저장 파일 격리 — 실제Player 각1회, 지정 인자만 open -g -n -W/창 모드/무음, batchmode0. 1920 종료 후 같은qa-current를 교체해3840 실행. 각53.30/37.12초·openExit0·timeout0·잔여PID0. qa-current의 roster/combat 파일 생성·시각을 기록 — 캡처 없음; capture-current/*/launch-receipt.json
FAIL — 저장 바인딩 로그 확인 — 두Player.log 모두 sandbox 절대경로/Persistent namespace 로그가 없어 공통 규칙의 ‘로그에서 바인딩 확인’ 미충족. 명령행·실제 QA 파일 생성 증거와 별개이며 직전부터 남은 요건 — 캡처 없음; capture-current/*/Player.log·launch-receipt.json
FAIL — 사전 open 호출 절차 — 대기 도구가 잘린 ps comm을 판독해 빌드 완료 전open1회 실패(app 미생성·Player 실행0). ps 전체command 판독과 빌드 영수증/앱 존재 사전검사를 고친 뒤 실제 검수 수행. 게임 코드 수정·실패Player 무수정 재실행0 — 캡처 없음; launch-failure.json
PASS — PNG 6장·눈검수 — 해상도별 전체1·검격3배1·망토/갑옷3배2패널1. 원본8장과 최종크롭 모두 직접 열람; 무색보정·nearest3x, 원본/중간PNG8장 삭제, prev/ 비교자료 보존 — pick/ 6PNG; capture-manifest.json
PASS — 종료·정리·검수만 수행 — 직접 코드수정·커밋·push0, UNITY-MAC-20261024 접근0. 프로세스 종료 뒤 build-current6.24GiB·PlayerDataCache5.92GiB·임시QA세이브·도구22MiB 삭제(du 합계, 공유블록 포함), 실제약6.00GiB 회수. 자동변경883개복원·새Assets56개제거, 기존미추적2개와Library 보존 — 캡처 없음; cleanup-receipt.json·generated-cleanup.json·cleanup-git.log

SHA 39e52fe22f73c92001531cad1b38096cf952bbe9 | 소요 587초(빌드 시작~정리·보고, 순번대기 포함) | df /System/Volumes/Data 남은 용량 645.3GiB
RIGPIXEL-GATE: FAIL 39e52fe22

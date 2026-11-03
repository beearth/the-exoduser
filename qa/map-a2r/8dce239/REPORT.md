# A2R Mac 검수 — FAIL

PASS — 1. 빌드 errors 0 — 지정 HEAD 8dce239753302a8e5f323a8e3cf04af15580b3b4, Unity 6000.6.7f1, A2RBuilder.Build 1회; Succeeded/errors=0/exit=0, EXODUSER-A2R.app 생성. fetch·checkout·추가 Unity 옵션 없음 — 캡처 없음; build.log, build-receipt.json, build-exit.txt
FAIL — 2. 촬영 영수증 — passed=false/errors=2, Player 실제 exit=3(kqueue wait status 768), open launcher exit=0. A/B 8+가림 3+구조도 1장 모두 존재하고 실제 PNG 크기 전부 일치(1920×1080 7장, 3840×1080 4장, 구조4096² 1장). 3840 native mismatch 없음 — capture-current/*.png, a2r1-capture.json; image-verification.json, launch-receipt.json
PASS — 3. 웹 소품 접지·직립 — 캠프 천막·상자·뼈더미, 다리 옆 나무 카드의 밑부분을 3배로 직접 확인; 명백한 기울어짐·지면 아래 매몰 없음. 기존 3D 나무가 캠프 원화를 많이 가리는 중첩은 잔여 문제 — pick/web-props-grounding-x3.png
PASS — 4. 떠 있는 소품 0 — 제공된 전체 PNG·접지 크롭에서 공중에 분리된 소품이나 명백히 떨어진 접촉 그림자 미관측; 웹 영수증 floating=0, 추가31개 rayHit=true/gapCm=0. 촬영 범위의 정지 화면 판정 — pick/web-props-grounding-x3.png, pick/3840-bridge-c10.png
FAIL — 5. C10 어둡고 따뜻한 조명 — 캠프는 원본보다 어두워지고 불 주위 주황빛 확인. 다리는 청회색 안개·밝은 빛 덩어리가 화면을 덮어 원본보다 밝고 뿌옇게 보임. 보조 측정: 동일 ROI(150,170,width−150,850) 8bit 회색 평균 camp 1920 84.13→68.67/3840 67.50→62.47, bridge 1920 68.49→82.87/3840 51.12→69.33(순수 조명 분리 측정 아님) — pick/camp-original-vs-c10.png, pick/3840-bridge-c10.png; capture-current/{1920,3840}-bridge-original.png
FAIL — 6. 고목 원형·부드러운 가림 — 3컷 모두 영웅은 보임. 영웅 주변의 부드러운 원형 구멍으로 읽히지 않고 고목의 넓은 상하 면이 비치며 각진 다각형·띠 경계가 보임. 0.2초 시간 전환은 정지 PNG로 미검증 — pick/occlusion-1-2-x3.png, pick/occlusion-3-x3.png
PASS — 7. 4096 정사영 구조도·좌표 — 실제 지형·숲·목교를 확인. JSON 28포인트: START(4020,7420), H01~H14, FB1~FB4, camp(1820,4020), BRIDGE(4320,7180) 포함; FB4(5940,1700). 별도 정사영 카메라 사용 소스 확인 — pick/structure-original.png(원본4096² 그대로), capture-current/structure-coordinates.json
PASS — 웹 에셋 영수증 — 총34, added31, 기존3D 유지 duplicates3, 배치 실패0(중복 유지 제외), floating0. 실패 전용 필드는 없으며 추가 항목의 rayHit/gapCm로 확인 — capture-current/web-assets-receipt.json; pick/web-props-grounding-x3.png
FAIL — 세이브 바인딩 로그 증거 — 절대 qa-current 인자, 폴더 생성, 촬영 진입의 NativeQaSandbox.Active 조건은 확인. 이번 player.log에는 요청된 namespace/root 바인딩 로그가 없고 qa-current는 빈 폴더였으므로 로그 기반 확인은 미검증 — 캡처 없음; launch-receipt.json, player.log
PASS — 실행·정리 — 백그라운드 창·무음 실행 1회, 자연 종료 확인, Editor/Player 잔여0. build-current·PlayerDataCache·qa-current·이미지 처리 임시환경 삭제: du 합계 12.41GiB(공유블록 포함), df 실증가 6.07GiB. Unity 자동변경932개 복원·새 meta56개 제거, 착수 전 미추적2개 그대로 보존. 코드 수정·커밋·push·실패 재실행0 — 캡처 없음; cleanup-receipt.json
PASS — 결과물 보존 — capture-current 원본12PNG·JSON3개 유지, pick/ PNG6장. 크롭은 nearest 3배이며 좌표는 image-verification.json에 기록. 모든 원본 및 판정 합성을 직접 눈검수 — pick/, capture-current/

오류 근거: player.log의 `Material 'EXODUSER/GroundSkillReceiverDepth' with Shader 'EXODUSER/GroundSkillReceiverDepth' doesn't have a texture property '_MainTex'` 2회가 영수증 errors=2와 일치한다. KeyshotLog는 Error/Exception/Assert를 센다. 원인 후보는 A2ROcclusion.cs:16의 _BaseMap 미보유 재질에 대한 mainTexture 접근(재질 쌍 순회2회)이며, 스택이 없어 호출점은 확정하지 않았다. 추가 경고로 그림자 atlas가 43개 shadow map을 맞추려고 해상도를 2배 낮췄다. 수정 없이 CTO/맵 담당에 전달할 결함이다.

MAP PRODUCTION REPORT: STAGE=Mac 동일 패키지 검수 / MASTER·OUTER MASS·LARGE·MEDIUM·GROUND·PLAYABLE·LANDMARK=기존 A2Field 유지, 변경0 / CAMERA QA=camp·bridge A/B 및 고목3고정위치, 자연 도보·밀집 전투 미검증 / TECH QA=빌드PASS·촬영영수증FAIL / FILES=출력 보고·증거만 / GIT=commit·push·deploy0 / VISUAL VERDICT: FAIL / NEXT=담당자가 재질 속성 오류·고목 알파 경계·다리 안개 밝기를 수정한 새 SHA 제출.

SHA 8dce239753302a8e5f323a8e3cf04af15580b3b4 | 소요 277초(빌드 착수~검수·정리·보고) | df 남은 용량 684Gi
A2R-GATE: FAIL 8dce23975

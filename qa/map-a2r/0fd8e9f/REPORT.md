# A2R Mac 재검수 — FAIL

PASS — ① 웹 에셋 — source189→카드173/중복16, 바닥64, moat1, floating0; 추가173개 rayHit=true·최대gap0cm. 촬영 범위에서 떠 있는 소품 육안0 — pick/camp-c10.png, pick/bridge-c10.png; evidence/web-assets-receipt.json
FAIL — ② 나무 가림 — 직전 prev/pick/occlusion 두 판과 같은 (870,330,350,400) 3배 비교. 3/3 고목 컷에 직선·다각형 면과 겹친 반투명층 잔존(직선면0 조건 실패); 원형·부드러운 구멍으로 읽히지 않음. 전장 ON은 1920/3840 fadedRenderers4/5·targets14·누락0이나 시각 결함 잔존 — pick/occlusion-x3.png, pick/foreground-off-on.png(왼쪽OFF/오른쪽ON)
PASS — ③ 위쪽 먼 적 — 두 해상도에서 상단 원경의 적 실루엣이 보임; 1920 캠프 상단 적 최소4개 육안 확인. 고정 전장 fixture도 화면 내12/12. 실제 도보 화면은 별도 보존 — pick/combat-1920.png, pick/combat-3840.png; evidence/a2r1-capture.json
FAIL — ④ 안개·불빛·다리 — 캠프와 횃불 주변의 주황 접지광은 보이나, 다리 주변에 탁한 회청층과 베이지색 빛 덩어리가 여러 개 남음. 동일 ROI L평균: 1920 원본68.44→C10 69.59(직전 C10 82.87 대비−13.28), 3840 51.05→68.33(직전69.33 대비−1.00). 밝기 개선만으로 시각 PASS 불가 — pick/camp-c10.png, pick/bridge-c10.png; image-verification.json
FAIL — ⑤ 전투 중 영웅 식별 — 캠프 도착 두 해상도 2/2에서 영웅 머리 일부와 체력바는 찾을 수 있으나 몸통·무기가 적/연속 탄막과 겹쳐 빠른 실루엣 식별 불충분 — pick/combat-1920.png, pick/combat-3840.png
PASS — 빌드·촬영 영수증 — 지정 detached SHA·원격 ref 일치. Unity6000.6.7f1/A2RBuilder 1회 Succeeded/errors0/Editor exit0. 기본18PNG 전부 규격 일치, 카메라34°·A/B 위치/FOV 일치; capture passed=true/errors0/Player exit0. _MainTex 오류 직전2→이번0(두 Player 로그 모두0) — evidence/a2r1-capture.json, build-receipt.json, capture-launch.json, player.log; pick/foreground-off-on.png
PASS — 실제 도보·격리 — route+play smoke 1회 passed/arrived/noTeleport=true, errors0/failures0/blockedTicks0, 1829틱·4974.28px·camp74.32FPS(1920의3초 표본), Player exit0. 캠프(2051.8503,4402.5039)에서1920·3840 촬영. 두 로그에 qa-current namespace 바인딩 확인 — evidence/play-smoke.json, smoke-launch.json, smoke-player.log; pick/combat-1920.png, pick/combat-3840.png
PASS — 정리 — 본 작업 Editor/Player 잔여0 확인 후 build-current·PlayerDataCache·capture-current·qa-current·이미지 처리 임시환경 삭제. du합계14.87GiB(공유블록 포함), df 실증가7.36GiB. Unity 자동변경1301개 복원·신규meta56개 제거, 착수 전 미추적2개 보존. Library 재사용·prev/ 유지·판정PNG6장. 코드 수정/커밋/push/실패 재실행0 — cleanup-receipt.json; pick/

가림 원인 후보는 A2R LitFade의 Cull Off/ZWrite Off 투명 패스에서 겹친 면이 노출되는 경로다. 실제 GPU 호출 추적은 하지 않아 원인을 확정하지 않는다. 담당 CTO/맵팀은 고목 투명 면 중첩, 다리 주변 빛·안개 덩어리, 전투 영웅 실루엣을 보정한 새 SHA를 제출해야 한다. 정지 촬영으로 0.2초 fade/깜빡임 연속 동작은 미검증이다. 그림자 atlas 해상도2배 축소 경고는 잔존한다.

MAP PRODUCTION REPORT: STAGE=Mac 재검수 / MASTER·OUTER MASS·LARGE·MEDIUM·GROUND·PLAYABLE·LANDMARK=기존 A2Field, 수정0 / CAMERA QA=고정A/B8·고목3·전장비교6·구조도1 + 실제도보/전투1920·3840 / TECH QA=빌드·촬영·도보PASS / FILES=보고·로그·영수증·판정PNG6 / GIT=commit·push·deploy0 / VISUAL VERDICT: FAIL / NEXT=CTO 가림·안개·전투가독성 수정.

SHA 0fd8e9f1971a2b8cdf3bf346a0ea014063d5fed8 | 소요 348초(빌드 착수~검수·정리·보고) | df 남은 용량 626Gi
A2R-GATE: FAIL 0fd8e9f19

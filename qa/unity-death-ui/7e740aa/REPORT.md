FAIL — 최종 관문 — 버튼 불투명 판·따뜻한 띠 제거는 개선됐으나 remodel3d 오른쪽 가장자리 HSV 채도 2/2 초과, GPU 색 프로브 2/2 실패. 검수만 수행, 게임 코드 수정·커밋·push 0 — pick/05-vignette-edges-3x.png, pick/06-titles-and-probes.png.

PASS — 1. 대상·빌드 — 7e740aa6187043e596607da3f6b171de6fdde8e2 detach, UNITY-BUILD 전체 checkout·기존 Library 재사용. PortVerification.Build / -remodel-scenes 1 / Unity 6000.6.7f1 ARM64 정식 빌드 1회, Succeeded / errors=0. FirstPlayable·RM1_Slice 포함 — build-receipt.json, build.log, evidence/build-scenes-result.txt; 캡처 없음.

PASS — 1. 정적 검사 — 지정 node 명령 1회, exit=0, PASS 13줄·FAIL 0. Mac Contents/Resources/Scripting 탐색, Player·Editor 8개 스킨 상태, Editor HiDPI, Gamma·Linear 불투명 판 검사 통과 — static-tests.log, evidence/static-result.txt; 캡처 없음.

PASS — 1. 사망 영수증 — HD2D/remodel3d × 1920×1080·3840×1080·5120×1440 = 6/6 passed/fieldVisible/actualRevive/actualDeath/bossCamera/bossAlive/cameraPostProcessing/combatTextHidden/persistenceDisabled=true. filterAtWait=volumeAtWait=bossFilter=bossVolume=1, revivePhase=Reviving, filterAfterRevive=0, failures="". 영수증·PNG 해상도 모두 요청과 일치 — evidence/death-*-death-screen-capture.json, verification.json; pick/01-death-hd2d-5120-full.png, pick/02-revive-5frames-6runs.png.

PASS — 1. UI 영수증 — pause/settings/quit/character-delete/lobby/lobby-quit × 1920·3840 = 12/12 passed/dialogOpen/rosterUnchanged/persistenceDisabled=true, 로스터 1→1. 스킨 2회 및 지정 로비 색 플래그 2회의 UI 영수증도 true이나, 색 진단 실행 여부는 아래 별도 FAIL — evidence/ui-*-death-ui-*.json, smoke-summary.json; pick/03-buttons-12screens-1x-3x.png.

PASS — 2. 스킨 회색 원인·불투명 — 두 해상도 모두 ui_skin_control 위/아래 RGB=110/110/110 / 138/138/138, ui_skinless=13/13/13 / 13/13/13. 직전 비교 기준 74~78(위)·55~61(아래)와 달리 이번 실제 판은 두 지점 모두 동일한 흑철색이다. 기본 IMGUI 스킨을 의도적으로 덧그리면 회색 그라데이션이 생긴다는 대조 결과다. skinless는 opacityUnderlayUsed=true인 자홍색 underlay 위에서도 같은 RGB를 유지해 불투명을 확인했다. 플랫폼 OSXPlayer / Metal / Linear, 두 skin 영수증 passed=true. strippedStates=0이므로 이번 실행에서 실제 제거된 배경 개수를 증명했다고 주장하지 않는다 — evidence/skin-*-death-ui-lobby.json, metrics.json; pick/06-titles-and-probes.png.

PASS — 2. 버튼 12화면 1x·3x — 대표 ActionPlate 내부 위·아래 RGB 전부 13/13/13, 검사한 왼쪽 내부 영역의 채널 최대−최소=0/0/0. 회색 그라데이션·로비 입장 원화 비침 육안 0. 로비 (1500,735)/(1500,775), 3840 실제 좌표 (3420,735)/(3420,775)도 모두 13/13/13 — metrics.json; pick/03-buttons-12screens-1x-3x.png, pick/04-lobby-slot-buttons.png.

| 화면 | 1920 위 / 아래 RGB | 3840 위 / 아래 RGB | 대표 버튼 상단 y / 테두리 두께 |
|---|---|---|---|
| pause | 13/13/13 / 13/13/13 | 13/13/13 / 13/13/13 | 405 / 1px |
| settings | 13/13/13 / 13/13/13 | 13/13/13 / 13/13/13 | 994 / 1px |
| quit | 13/13/13 / 13/13/13 | 13/13/13 / 13/13/13 | 654 / 1px |
| character-delete | 13/13/13 / 13/13/13 | 13/13/13 / 13/13/13 | 562 / 1px |
| lobby | 13/13/13 / 13/13/13 | 13/13/13 / 13/13/13 | 722 / 1px |
| lobby-quit | 13/13/13 / 13/13/13 | 13/13/13 / 13/13/13 | 548 / 1px |

PASS — 2. 테두리 1px·붉은 번짐 — pause·quit 포함 12/12 대표 버튼 테두리 물리 1px 유지. 이번 테두리 색은 금색이 아닌 은회색(기본 RGB138/139/136, 선택201/199/195)이다. 외곽 붉은 광휘·슬롯 빨간 단색 채움 0, 선택 버튼 안쪽의 좁은 붉은 선은 남는다. 기본 상단 탭 원화는 대표 ActionPlate 측정 범위에 포함하지 않았다 — metrics.json; pick/03-buttons-12screens-1x-3x.png, pick/04-lobby-slot-buttons.png.

FAIL — 3. 가장자리 채도 ≤ 중앙 — HD2D 와이드 2/2 PASS, remodel3d 와이드 2/2 오른쪽 FAIL. 좌·중·우 64px 전높이 띠 평균, HSV S·V=0~1, 검정 S=0. HUD·사망 글자를 포함한 최종 합성 PNG를 직전과 같은 방식으로 측정했다 — metrics.json; pick/05-vignette-edges-3x.png.

| 모드·해상도 | S 좌 / 중 / 우 | V 좌 / 중 / 우 | 판정 |
|---|---|---|---|
| hd2d-3840×1080 | .03875 / .05727 / .04612 | .02258 / .07595 / .02420 | PASS |
| hd2d-5120×1440 | .03624 / .05843 / .04594 | .01651 / .07014 / .02118 | PASS |
| remodel3d-3840×1080 | .02637 / .07924 / .11611 | .02090 / .12908 / .02243 | FAIL |
| remodel3d-5120×1440 | .02898 / .07991 / .09500 | .01483 / .12422 / .01947 | FAIL |

PASS — 3. 따뜻한 띠·계단 띠·점 육안 — 검정 URP Vignette와 가장자리 감광 확인. 직전 따뜻한 수평 띠는 제거됐고, 동심원 계단 띠·고립 잔점은 육안 0. 소스에서도 후처리 뒤 IMGUI DeathBand 합성이 제거됨 — evidence/source-evidence.txt; pick/01-death-hd2d-5120-full.png, pick/05-vignette-edges-3x.png.

FAIL — 3. 채도 진단 한계·색 프로브 — 지정된 --unity-death-ui-smoke --unity-death-color-probe -ui-screen lobby 2회는 UI만 캡처하며 색 플래그를 처리하지 않는다(NativeGame.cs:144~145). 실제 구현 경로인 --unity-death-screen-smoke --unity-death-color-probe --unity-boss-direct 0으로 별도 1920·3840 각 1회 실행했으나 2/2 passed=false, failures="color probe shader/camera unavailable", colorProbeRequested=true, colorProbeUniform=false, 전후 RGB·S 배열은 빈 배열이었다. 같은 색 진단 단계 2회 실패 후 추가 테스트 중단, 실패 재실행 0. CreateDeathColorCards의 HudCamera 또는 Shader.Find("Universal Render Pipeline/Unlit") 가드에서 중단되며, 어느 쪽인지는 이 영수증이 구분하지 않는다 — evidence/color-ui-*-death-ui-lobby.json, evidence/color-death-*-death-screen-capture.json, evidence/source-evidence.txt; pick/06-titles-and-probes.png.

FAIL — 3. 남은 수치 초과의 원인 범위 — remodel3d 오른쪽 띠 높이 40~60% 구간은 V≈.002, RGB가 전부 0~1 코드값이다. 3840에서는 RGB(0,0,1) 6,444px·(0,1,1) 1,260px, 5120에서는 각각 6,169px·2,224px가 검출됐다. 거의 검정인 1코드 채널 차이도 HSV에서는 S=1로 계산돼 평균 S를 높인다. 따라서 남은 수치 FAIL을 직전의 눈에 보이는 따뜻한 띠와 동일 원인으로 단정할 수 없다. GPU 카드 프로브가 실패해 URP의 공간별 채도 감소율 자체는 미검증이다 — evidence/right-edge-diagnosis.json, evidence/right-edge-rgb-histogram.json; pick/05-vignette-edges-3x.png.

PASS — 4. 사망 글자 위 전투 문구 — 본 사망 6/6 combatTextHidden=true. 사망 중 새로 삽입한 쉴드 파괴!·한방킬! ×5도 숨김. 필드·보스 제목 12컷에서 문구 겹침 육안 0 — evidence/death-*-death-screen-capture.json; pick/06-titles-and-probes.png.

PASS — 5. 부활 5프레임 — 6/6 reviveTimes=[0,.125,.25,.375,.5], reviveFilters=reviveVolumes=[1,.84375,.5,.15625,0]. 30컷에서 어두운 필드→밝은 필드, 글자·필터 해제를 직접 확인. 실제 Core 부활도 6/6 true. ForcedReviveAge 고정 표본이며 연속 자연 시간 영상 검증은 아니다 — evidence/death-*-death-screen-capture.json; pick/02-revive-5frames-6runs.png(중앙 16:9 영역 크롭).

PASS — 실행·저장 격리 — 지정 22회+별도 실제 색 진단 2회=24회. 24/24 qaRoot=capture-current/<런>/qa-save 및 settings/roster/combat=disabled 바인딩 일치, sandbox 저장 파일 0, 런타임 예외 0, PNG 168장 해상도 일치. PLAYER는 build-current 앱 실행파일, open -g -n -W -a / 창 모드 -screen-fullscreen 0 -popupwindow / 무음, Player batchmode 0. 다른 세션 전체 플레이 QA 발견 후 첫 Player와 런처를 스모크 전에 보류하고 상대 종료 후 동일 Player를 계속 실행했다. 첫 open의 종료코드는 수집하지 못했으며 영수증·PNG로 판정했다. 색 진단 2회는 open exit=0이어도 영수증 false로 FAIL 처리 — run.log, smoke-summary.json, verification.json, evidence/*-player.log; 캡처 위와 같음.

PASS — 증거·정리 — pick/ 최종 PNG 6장 모두 직접 열어 확인, 밝기·색 보정 0, 확대 nearest. 종료 확인 후 capture-current·tests-current·build-current·PlayerDataCache·qa-save·임시 분석 환경·스크립트 삭제. 삭제 논리합 12.89GiB(공유 블록 포함), 삭제 직후 df 가용량 6.65GiB 증가. Unity 자동변경 tracked 887개 복원·신규 Assets 생성물 56개 제거, 시작 전 미추적 2개·기존 Library·prev/ 보존. 대상 Editor/Player 잔여 0, 코드 수정·커밋·push 0 — cleanup-receipt.json, cleanup.log, evidence/final-status.txt; pick/01~06.

다음 확인은 PC CTO의 색 프로브 진입 경로·Player 셰이더/카메라 가드 수정과 remodel3d 극저명도 픽셀의 채도 기준 해소다. 이번 검수에서 코드를 바꾸지 않았다.

SHA 7e740aa6187043e596607da3f6b171de6fdde8e2 | 소요 988초(정적 검사 시작~정리·보고, 다른 QA 대기 포함) | df /System/Volumes/Data 남은 용량 648Gi
DEATH-UI-GATE: FAIL 7e740aa61

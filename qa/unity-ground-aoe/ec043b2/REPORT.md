PASS — 지정 SHA·정식 빌드 1회 — 전체 checkout·기존 Library 재사용, HEAD=ec043b26d730e4a30a2f1e8f3477c32bbb33f8c3. GIT_NO_LAZY_FETCH 없이 detach 성공. Unity 6000.6.7f1 ARM64, PortVerification.Build -remodel-scenes 1, Succeeded·passed=true·errors=0 — 캡처 없음; build-receipt.json·build.log.

PASS — 영수증·GPU 오류 — Metal/M5 Pro, 실제 DispatchSlot 시전 12회·1920×1080 PNG 57장, ground-skills-receipt passed=true. Player Shader/RenderGraph/Exception 오류0, 빌드 Shader 오류0. 영수증 visualVerified=false는 자동 시각 승인하지 않는 필드이며 아래 눈검수와 구분 — pick/01~06; ground-skills-receipt.json·Player.log.

PASS — 네 지형 실제 스킬 증거·3배 크롭 — 평지(37,-76; 경사량0.00336), 경사(35,-71;0.83166), 목교(43.2,-71.8; 상판 anchorY0.291), 늪 가장자리(41,-75; 인접 수면Y-0.45)에서 가시덫·성역·대지치기 각 T15. QA 사각형 대신 생산 NativeSkillView의 실제 시전. 장판이 지형·목교·수면으로 이어지고 직립 공중 카드0 관측 — pick/01-flat-skills-x3.png·02-slope-skills-x3.png·03-bridge-skills-x3.png·04-swamp-skills-x3.png.

FAIL — 수신면 연결 틈0 — 경사 대지치기 T15에서 중앙 위쪽 흙 경사와 아래쪽 뿌리 접합부에 검은 톱니/띠 형태의 투영 누락이 여러 군데 보임. 원본 좌표 약(x=900~1010,y=460~680), 뿌리 오른쪽에도 발생. 따라서 네 곳 전체의 틈0 조건 불충족. 원인 후보는 receiver depth와 화면 depth의 접합 불일치 및 shader의 sceneEye+0.02-receiverEye clip이며 정지 PNG만으로 원인을 확정하지 않음 — pick/02-slope-skills-x3.png 하단 대지치기 패널.

PASS — 목교 대지치기 연속컷 직선 잘림0 — 런타임 영수증 T0~44 일치·45에 제거, 46컷 전부 직접 확인. 4셀 전환과 T15/29 오른쪽 아래 외곽에서 직전처럼 갑자기 끝나는 직선 경계0 관측. prev/ T15/29와 정성 비교했으며 이번 시전 위치가 목교 중앙으로 달라 픽셀 정렬 비교는 아님 — pick/05-bridge-slam-t00-t45.png·06-prev-boundary-and-center-x3.png; crop-receipt.json.

PASS — 배우 숨김·중앙 섬광 반쪽 가림0 — actorsHidden/uiHidden=true·hiddenRenderers=3. T0~10의 섬광을 확인했고 흰 타원 전체 윤곽이 보임. 상판 틈에 따른 가는 선은 있으나 배우·숫자에 의해 반쪽이 가려지는 현상0 — pick/05-bridge-slam-t00-t45.png·06-prev-boundary-and-center-x3.png 하단 T0/4/10.

PASS — 실행·격리·종료 — open -g -n -W 창 모드 백그라운드·무음, 지정 Player 인자만 사용(batchmode0·추가 인자0). 로그의 GROUND_SKILLS_SANDBOX_BOUND가 sandbox-current 절대경로와 일치. 정상 완료 뒤 해당 Player·Editor 잔여0. Player1회·무수정 실패 재실행0·코드 수정/커밋/push0, UNITY-MAC-20261024 변경0 — 캡처 위 6장; launch.json·Player.log.

PASS — 증거·정리 — pick PNG 정확히6장 직접 눈검수. 각 지형 판정본은 전체 화면 축소+원본 ROI(540,360,900,520) 최근접3배이며 밝기·색 보정0. 연속컷은 원본1배 ROI 합성. build-current·PlayerDataCache·sandbox-current·원본57컷·임시 도구 삭제 합계 12.197GiB; 삭제 구간 df 가용량 변화 6.011GiB(타 작업 동시 사용으로 전체 df 변화와 구분). Unity 자동 tracked857개 복원·신규meta56개 삭제, 기존 미추적2개·Library 보존 — pick/·cleanup-receipt.json·generated-cleanup.log·final-state.json.

VISUAL VERDICT: FAIL — 이번 AOE 게이트 한정. 남은 문제는 경사 흙/뿌리 접합부의 투영 누락이며 수정하지 않았다.

SHA ec043b26d730e4a30a2f1e8f3477c32bbb33f8c3 | 소요 454초(정식 빌드 시작~검수·정리·보고) | df 남은 용량 627Gi | AOE-GATE: FAIL ec043b26d

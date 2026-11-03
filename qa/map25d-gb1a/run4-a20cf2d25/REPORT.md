# GB1a Mac 4차 — FAIL

PASS — 대상·빌드 1회 — 지정 브랜치 fetch 후 지정 SHA detach; 3차와 같은 명령(-remodel-scenes 1 포함), Unity 6000.6.7f1 ARM64 Succeeded·errors=0. 패키지 globalgamemanagers에서 FirstPlayable·RM1_Slice 확인 — 캡처 없음; run4-1920/build.log·build-receipt.json·build-scenes.log
PASS — 무창·무음·격리 — 두 실행 모두 -batchmode -nosound, Player에 -nographics 없음. 각 Player.log의 Persistent HUMAN save namespace와 영수증 sandbox4-1920/3840 일치 — 캡처 없음; run4-{1920,3840}/Player.log·launch-receipt.json·play-smoke.json
PASS — RT PNG·world-only 기록 — 두 실행에서 PNG 각 3장 생성; notes에 world-only RenderTexture 및 OnGUI HUD 제외 기록. MAP25D_CAPTURE_NULL 없음 — run4-{1920,3840}/00-startup.png·play-smoke.json
FAIL — 실제 캡처 해상도 — 1920×1080·3840×1080 인자를 줬으나 PNG 6장 전부 640×480. 캡처 코드가 요청 인자가 아닌 Screen.width/height로 RT를 생성함(NativeGame.Map25D.cs:167–170) — run4-{1920,3840}/png-sizes.log; pick4/{1920,3840}_requested_actual640x480_fdg.png

FAIL — 1920 로비 — FDG에서 정지, Product title keys did not reach Lobby — run4-1920/02-FDG.png(640×480)·play-smoke.json
FAIL — 1920 1-1 — 진입 전 실패, 단계 영수증·PNG 없음 — 캡처 없음
FAIL — 1920 캠프 — 도보 미실행(ticks=0·walkedPixels=0), 단계 영수증·PNG 없음 — 캡처 없음
FAIL — 1920 다리 — 도달·PNG 없음 — 캡처 없음
FAIL — 3840 로비 — FDG에서 정지, Product title keys did not reach Lobby — run4-3840/02-FDG.png(640×480)·play-smoke.json
FAIL — 3840 1-1 — 진입 전 실패, 단계 영수증·PNG 없음 — 캡처 없음
FAIL — 3840 캠프 — 도보 미실행(ticks=0·walkedPixels=0), 단계 영수증·PNG 없음 — 캡처 없음
FAIL — 3840 다리 — 도달·PNG 없음 — 캡처 없음
FAIL — 최종 스모크 — 두 실행 모두 passed=false·arrived=false·errors=0, failures=[Product title keys did not reach Lobby]. 각 약165.05초 후 종료; 프로세스 exit=0이므로 exit만으로 PASS하지 않음 — run4-{1920,3840}/play-smoke.json·launch-receipt.json
FAIL — 원인 — 두 Player.log에서 SCREEN_TRANSITION_RECOVER splash-menu prepare-timeout (12s) 반복. 정적 근거: NativeScreenTransition.cs:30–31의 swap은 blackLatch.TryConsume을 기다리고, Paint는 OnGUI Repaint(:44)에서만 호출됨. 무창에서 OnGUI가 돌지 않아 전환이 막히는 구조와 관측이 일치함 — run4-{1920,3840}/02-FDG.png·Player.log

FAIL — 떠 있는 물체 수 — 월드 PNG가 없어 산정 불가(0개 판정 아님) — 캡처 없음
FAIL — S자 길 — 월드 미진입으로 시각 미검증 — 캡처 없음
FAIL — 남→북 다리 양쪽 늪 — 월드 미진입으로 시각 미검증 — 캡처 없음
FAIL — 숲 벽 좌우 끝 — 월드 미진입으로 시각 미검증 — 캡처 없음
FAIL — 알려진 늪 높이 절벽·다리 면 겹침 — 이번 실행에서 보이는지 미검증; 3차 결함을 4차 관측으로 대신하지 않음 — 캡처 없음
FAIL — 3차 월드 비교·요청 크롭 — 3차 pick/의 두 다리 전체와 이번 PNG를 직접 대조했으나 이번 6장은 모두 검정에 가까운 FDG 화면이라 월드 동일성 비교·영웅/결함 3배 크롭 불가 — pick/1920_bridge_full.png·3840_bridge_full.png; pick4/*_fdg.png
PASS — 판정 증거·정리 — pick4/를 비우고 실패 전체 PNG 2장만 선별. 빌드1회·해상도별 실행 각1회·추가 재시도0·창 모드 전환0·코드 수정/커밋/push0. 두 실행 같은 단계 실패 후 중단. 프로세스 종료 확인 뒤 build-current·이번 PlayerDataCache·sandbox4-* 삭제(논리합15.19GiB, 공유블록 포함; df683→691Gi). Unity 생성 변경857개 복원·신규meta56개 삭제; 기존 미추적2개와 나머지 Library·이전 기록 보존 — run4-1920/cleanup.log·cleanup-receipt.json; pick4/

VISUAL VERDICT: FAIL — 월드 시각 미검증. C10 비교는 지시대로 생략.

SHA a20cf2d25d26b1a16427b44acd6b34258f76cd43 | 소요 484초(체크아웃 완료~검수·정리) | df 남은 용량 691Gi

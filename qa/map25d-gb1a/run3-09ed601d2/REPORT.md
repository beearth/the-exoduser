# GB1a Mac 3차 — 스모크 PASS / 시각 FAIL

PASS — 대상·빌드1회 — 지정 SHA, Unity6000.6.7f1 ARM64, errors=0. 2차 빌드 인자에 `-remodel-scenes 1` 추가; build.log 및 패키지 씬 목록에서 FirstPlayable·RM1_Slice 확인 — 캡처 없음; run3-1920/build.log·build-scenes.log·build-receipt.json
PASS — 세이브 격리 — 두 Player.log에 각각 요청한 sandbox-1920/3840의 `Persistent HUMAN save namespace` 확인; 영수증 sandbox도 일치 — 캡처 없음; run3-{1920,3840}/Player.log·play-smoke.json
PASS — 1920 로비 — Lobby 도달, PNG 1920×1080 — run3-1920/03-lobby.png
PASS — 1920 1-1 — fieldActive=true·단일 인스턴스, PNG 1920×1080 — run3-1920/05-field-entry.png
PASS — 1920 캠프 — 실제 도보 (2051.85,4402.50) 도착, PNG 1920×1080 — run3-1920/07-camp-arrival.png
PASS — 1920 다리 — 실제 도보 북단 (2140,2563.82) 도착, PNG 1920×1080 — run3-1920/gb1a-bridge-north.png
PASS — 3840 로비 — Lobby 도달, PNG 3840×1080 — run3-3840/03-lobby.png
PASS — 3840 1-1 — fieldActive=true·단일 인스턴스, PNG 3840×1080 — run3-3840/05-field-entry.png
PASS — 3840 캠프 — 실제 도보 (2051.85,4402.50) 도착, PNG 3840×1080 — run3-3840/07-camp-arrival.png
PASS — 3840 다리 도달·와이드 캡처 — 실제 도보 북단 (2140,2563.82), 와이드 PNG 3840×1080. 기본 다리 PNG는 아래 해상도 결함 참조 — run3-3840/gb1a-bridge-north-3840.png
PASS — 스모크 최종 영수증 — 두 실행 passed/arrived/noTeleport=true, errors=0·failures=[]·blockedTicks=0, 각3262ticks·8871.65px 도보. PNG 각38장; exit0만으로 판정하지 않음 — run3-{1920,3840}/play-smoke.json 및 단계별 PNG
FAIL — 실행 해상도 고정 — 3840 실행의 기본 다리·캠프귀환 등9장은1920×1080. GB1WideShot(GrayboxProof.cs:25)이 와이드 촬영 후1920으로 강제 복귀함. 전체 PNG: 1920실행=1920×1080 33장/3840×1080 4장/5120×1440 1장; 3840실행=각9/28/1장. 전체 크기는 각 png-sizes.log — run3-3840/gb1a-bridge-north.png 및 gb1a-bridge-north-3840.png
FAIL — 떠 있는 물체0 보증 — 육안으로 확정할 만큼 뚜렷한 부유0개이나 1920 A2에서 Enemy101 접지감사1개(4.97cm·1.56px), 캠프귀환에서 Enemy93 1개(5.20cm·1.87px). 화면상 작은 간격의 육안 확정은 어려워0개PASS 보류. 3840실행 접지감사9컷은 모두0 — pick/1920_a2_contact_x3.png; run3-1920/gb1a-{a2,camp-return}-grounding.json
FAIL — S자 길 가독성 — 굽은 경계는 보이나 길·주변 지면이 같은 청회색으로 합쳐지고 큰 단차에 끊겨 S형 연속 동선이 읽히지 않음 — run3-3840/05-field-entry.png·gb1a-a2-3840.png
PASS — 남→북 다리 양쪽 늪 배치 — 중앙 세로 다리 좌우에 파인 늪 구역 확인; 높이 품질은 별도FAIL — pick/1920_bridge_full.png·3840_bridge_full.png
PASS — 숲 벽 좌우 끝 — 회색 박스 기둥 열이 와이드 화면 좌우 끝까지 이어짐(완성 숲 아트 판정 아님) — run3-3840/05-field-entry.png; pick/3840_bridge_full.png
FAIL — 알려진 늪 높이 절벽 — 양안 높이 연결이 급격히 끊겨 수직 벽·톱니 단차·틈이 노출됨. Height의 물/육지 분기(Map25DGraybox.cs:21)가 원인 후보이며 실행 중 수정하지 않음 — pick/1920_swamp_cliff_x3.png
FAIL — 알려진 다리 면 겹침 — 북단 상판에 별도 다각형 면의 색 경계가 겹쳐 보이고 주변 지형과 연결이 어색함; 정지 PNG로 시간축 깜빡임까지 판정하지 않음 — pick/3840_bridge_overlap_x3.png
PASS — 판정 PNG — pick/ 비운 뒤6장: 두 해상도 다리 전체, 영웅·늪절벽·다리겹침·적 접지 각3배 크롭. 크롭 원점/크기(x,y,w,h): hero(875,490,170,210), cliff(500,605,340,305), overlap(1730,545,410,340), contact(1022,456,256,256). 원본 PNG도 보존 — pick/*.png
PASS — 실행·정리 — Player는 batchmode/nographics 없이 open -g·창 모드·무음(-nosound) 실행; Mac 창의 잠깐 노출 허용 조건을 적용했고 두 실행 모두 종료 확인. 빌드1회·Player2회·실패 재실행0·직접 코드 수정/커밋/push0. 빌드-current·이번 PlayerDataCache·BMP 영상 중간물·이번 QA sandbox 삭제: du합계 약19.5GiB(공유블록 포함), df682→691Gi. Unity 자동변경857개 복원·신규meta56개 제거; 기존 미추적2개와 나머지 Library·2차 기록 보존 — 캡처 없음; run3-1920/cleanup.log·run3-3840/cleanup-receipt.json

C10 비교는 지시대로 생략. 판정은 실제 PNG 눈검수와 단계 영수증을 함께 사용했으며, 접지감사 결과는 눈검수와 구분했다.

SHA 09ed601d2ca2102ea582a91d0f5afd69ca38fe91 | 소요 689초(빌드 시작~정리·보고) | df 남은 용량 691Gi

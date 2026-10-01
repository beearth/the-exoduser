# QA D17 비동기 후보 독립 반례 검수

기존 QA 세션에서 한 건. ITEM은 d17-async-boundary-candidate/check를 작성 중이다. 먼저 기존 d17-lifecycle-roll-candidate의 pending 중 등록/효과 및 늦은 완료 재현을 독립 fixture로 확인한다. 새 후보가 완성되면 같은 반례를 그 후보에 적용하되 ITEM 파일 수정0. A/B 겹침·역순 성공/실패·pending 생성/시전·clear/player/character/zones 교체·원함수 this/인수/반환/호출횟수·기본 비활성을 검사한다. fixture로 결함을 증명하고 새 보고서만 만드는 작업으로 대체하지 않는다. 아직 후보가 쓰이는 중이면 불완전 결과를 확정하지 말고 root에 구체 대기 조건을 인계한다.

소유는 QA/d17-async-independent-* 새 파일. 기존 QA 결과·ITEM 파일·생산·공유 docs·세이브·Git·queue·새세션·서버·게임·성능측정 변경/실행0. 실제 수신/Read/Edit/명령/완료 시각과 source SHA, 재현/새 후보 PASS를 구분해 한국어 receipt/result에 기록한다. source 검수이며 앱 인수/생산 활성 아님.

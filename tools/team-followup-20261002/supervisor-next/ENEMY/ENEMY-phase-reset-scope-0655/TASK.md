# ENEMY 수정 피드백 한 건 — phase reset 근거 범위 정정

실제 checkout은 /Users/fordeargamers/Projects/exoduser-migration-20261001. 이 TASK, continuous/COMMON.md, AGENTS.md, 감독 STATE의 ENEMY 행을 먼저 실제 읽는다. 다른 담당과 공유 중이며 타인 변경을 되돌리지 않는다. 이 TASK는 감독 소유 read-only. 새 소유 폴더의 result.md/evidence.json 최대2파일만 작성한다. 이전 산출/TASK/checks 수정0, Node/검사/fixture 재실행 및 새 checks 작성0. production·공유docs·기존test·Git 조회/쓰기/index·실게임/UI/사용자게임/세이브/서버/빌드·삭제/이동/cleanup·권한/인증/설치·미디어·외부메시지·새세션/하위팀0. 보호2_3·Q전용 blackBean magic 패링·어택티켓금지·캐릭터LOCK 유지. CH1-1 사망 복귀는 root 단독 소유이며 중복 조사0. 맵 제작/geometry/collision/camera QA 범위 밖.

## 인수한 완료와 제한

직전 TASK actual peer06:35:02.277Z → exact Read06:35:06.234Z → end_turn4f8b9016-ae6b-4654-a846-9a771310a885, 06:47:47.373Z를 감독이 대조했다. 실제 _bossAI 선택으로 CD60=64를 기록하고 HP.50을 합성하여 원문 _bossPhaseCheck phase1→2를 실행했을 때 현행64 유지/메모리 reset 후보0 결과는 제한 인수한다. 8PASS+6REPRODUCED는 정의된 assertion/witness 집계이며, 6은 양판 결함 P2 2개+정상 비전환 P3 2개+후보 P4 2개다. 실패6개나 실제 게임 PASS로 쓰지 않는다. 전체 spawn은 미실행이며 인용 초기화식을 VM에서 실행했을 뿐이다.

## 이번 한 건: 기존 근거를 재실행 없이 정확히 정정

직전 result/evidence/checks와 현행 원문을 읽기만 하여 다음 표와 root 인계 문안을 새 2파일에 정리한다. 기존 3파일은 그대로 보존한다.

1. P2/P4/P5 harness의 P.iframes=1과 원문 충격파 조건 P.iframes<=0을 대조한다. 현재 fixture에서는 hurtP 호출0이며, result 추적표의 '충격파 hurtP 발생' 주장은 틀렸다. projectile 호출 수는 기존 코드로 계산/정적 대조하고, 실제 피해/탄 실체/teleport 좌표/실제충돌 PASS와 구분한다. 검사는 재실행하지 않는다.
2. P5가 실제로 비교한 필드/카운터 목록만 표시한다. projectile 인자/el 종류·순서, VFX/SFX 파라미터·순서, RNG 소비 횟수, P.kb/전체 P/G, 전체 엔티티 필드 등 미비교 항목을 적어 'CD60만 차이/그 외 전부 동일'을 해당 관측 필드 범위로 한정한다.
3. P3 비전환은 현행만 실행한 증거다. 후보와 비전환 양쪽 비교라고 쓰지 않는다. P6은 s=recover 확인과 _bossScore 직접 gate 결과이며, 실제 recover→idle 복귀/후속 _bossAI 재선택/실제 패턴 실행은 미실행이다. 반복형/1회성 설계 UNKNOWN과 productionApplied=false를 유지한다.
4. 감소문 위치가 result/final의37031/35834 역사값인 반면 해당 fixture _bossAI 선언37059/35864 뒤에 있으므로, 현재 실제 행과 fragment SHA를 정확히 인용한다. root가 사운드를 통합 중이므로 전체 SHA가 변하면 과거 실행 SHA7d579/109926을 그대로 보존하고 읽기시각/현재 fragment SHA를 구분한다. BOSS_MOVES 59개 정의의 idx가 단순0..58이 아니며 30/59 공백·60 존재, idx41 cageTrap 예약이 reset과 score허용에서 다름을 정적 표로 표시한다. 임의 idx재번호/설계라벨/수치 변경0.
5. 실행UTC06:41:58.909Z의 KST는15:41:58.909+09:00이다. 기존 approx15:42:30은 별도 작성 추정값이지 실행 시각이 아니다. 실제 새 TASK Read/최종 end_turn은 감독이 독립 확인하므로 thinking/인증/주소추정/SendMessage0.

docs 전체의 이번 관련 키워드 검색 결과를 경로/행/현행·후보·UNKNOWN 표로 root에 인계한다. 이전 실행/목록 감사/300f/phase 전환 검사를 반복하지 않는다. canonical 편집과 최종 통합·Git는 root 소유. '두 곳 모두 정의 idx 기준이어야 완전 복구'는 감소/reset 두 계약에 대한 후보 범위로 쓰며 실게임 완전성·모든무브 동등을 보증하지 않는다.

현재 전역 Changes는 감독의 -uall 관측에 따른다. 자신의2파일로80/100 판단0;80이면root checkpoint,100 전에 신규산출중단. 완료 시 한국어로 이 정정 한 건만 보고하고 추가 업무를 자율 생성하지 않는다.


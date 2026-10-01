# 짧은 R 입력 조사·11팀 후속 착수 — 2026-10-01

원격 dd3bdc1888e506ec4c418d3679461f0491823728 재조회 일치, 기존22항목·빈인덱스를 확인했다. 이전 짧은 자동화 R 입력 누락은 전달 간격 근거가 없어 사용자 결함으로 확정하지 않는다. root가 단일 격리 게임에서 DOM→K/KH→edge/held→update→bag/worldItems와 0/20/50/100ms·홀드를 구분한다. 실제 재현 뒤 RED와 최소 함수 소유권을 확정한다. 공용 HTML은 root만 편집한다.

기존11CLI 모두 마지막 end_turn 상태를 읽고 같은 세션에 신규 작업을 실제 전송했다. 아직 수신·실행 완료로 세지 않고 로그로 후속 확인한다. 지난 ITEM 때 다른6팀은 추천만 남았으며 이번 전송과 구분한다.

| 팀 | 배정한 한 건 |
|---|---|
| ITEM | 획득 조건과 필터·가방·거리·포털 우선순위 |
| QA | 짧은 입력/hold와 update 타임라인 검수 |
| UIUX | 포커스·IME·바인딩·정규 FPS 옵션 게이트 |
| BUILD | INT004 자식 자산 매니페스트 |
| BALANCE | onHitFireball 단/복수장착·프록재귀 실제 훅 |
| MAP | M5 접근→진입→이탈 실동선 fixture 본문 |
| ART | wa24 실제 타임라인 관측기 본문 |
| SKILL | iceStorm 취소 뒤 다음 LMB 관측기 본문 |
| ENEMY | etype3 정규 idle→첫 발사 관측기 본문 |
| ANIMVFX | GL 정규 활성 경로 게이트 probe 본문 |
| SOUND | 네메시아 루프 A/B 청취 페이지 본문 |

지원3명은 각각 test/interactTap.test.js, tools/qa/r-input-followup/build-assets.py, test/onHitFireballStack.test.js를 소유한다. BUILD/BALANCE 실행은 root 게임 측정 종료 후다. CLI는 읽기와 실행 가능한 산출 본문을 제공하며 실제 저장·실행은 별도 인수한다. 단일 게임·격리 저장·PC/원본 Mac·정규화22항목·타 팀 인덱스를 보존한다. 대형 빌드/인코딩/이미지 생성은 없다.


최종 인수: 11팀 모두 이번 전달 뒤 실제 읽기·end_turn을 확인했다. 입력 진단은 일반 CI와 구분하여 tools/qa/r-input-followup/interact-diagnostic.mjs로 이동했다. 실제 실행과 미완료는 [종합 검수](R-입력과-GL-후속검수.md)를 따른다.

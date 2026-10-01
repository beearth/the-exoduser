# NORMAL-ELIGIBILITY-ROOT-FIX-REVIEW — 독립 검수

완료 2026-10-01 15:00:31 UTC (KST 10월2일00:00:31). 기존 ITEM 세션에서 수신·읽기·작은 메모리 분석만 수행했다. root의 기존12반례 수정은 재작성하지 않았다.

## 기존 수정 인수: PASS

before analyzer SHA가 BUILD 원실패 SHA `78fa5e6b81c66b6d629df1a4ada39f0cf7926996caa7bb18c7ff373658df10f8`와 일치한다. before analysis도 BUILD 당시 SHA와 동일하다. 현재 analyzer `1b2b17e0b3ef0391be43dbacef2120ca00d3b0eb48f8bbbc89fdfeced595025f`를 VM에서 실행한 출력은 현재 analysis와 정확히 일치한다. before VM 출력 역시 보존 before analysis와 정확히 일치한다.

BUILD12개 이름/순서를 evidence와 직접 대조하고 같은 변이를 메모리 복사에 주입했다. before는12개 모두 eligible=true, current는12개 모두 eligible=false와 배제 사유를 반환했다. root의 실제21검사 스크립트도 fs 쓰기를 메모리 캡처로 치환해 실행하여21PASS/0FAIL을 재확인했다. root evidence/analysis는 덮어쓰지 않았다.

정상 원자료는 before/current 모두 eligible=true다. full/firstKillWindow/denseLongest의 전체분포, denseSegments, kills, inputs, firstObservedKill이 정확히 불변이다. 첫 batch2처치·입력 이후76.10000002384186ms 관측, 총15처치, 전체 RAF max133.4ms·동기draw max129.8ms라는 기존 해석을 유지한다. 이는 개별 사망 시각/CPU계산 전용/GPU완료가 아니다. firstInput은 실제 입력객체, firstKill은 실제 row 전체와 연결된다. schema/필수배열/누락첫입력·첫처치/종료paused 추가 거부도 확인했다.

## 새 누락: RETOUCH 후보3건

| 최소 변이(다른 필드 수정 없음) | current 실제 출력 | 문제 |
|---|---|---|
| rows[last].timestamp=rows[last].at+1000000 | eligible=true, RAF max1000051.5999999285ms | 동일 performance.now 축에서 snapshot 미래의 rAF timestamp를 확정 허용 |
| rows[0].timestamp=-1 | eligible=true | performance.now 기반 음수 시각 허용; 입력 전 row라 통계에는 영향 없지만 schema 확정 잘못 |
| inputs[0]과 inputs[1] 순서 교환 | eligible=true | 비시간순 입력배열 허용; find가 실제 최소시각 첫입력임을 검증하지 않음 |

실제 정상 원자료에는 미래/음수 rAF 또는 입력 역행이 없다. 위는 단독 메모리 변이이며 실제 캡처 실패라고 주장하지 않는다. 부가적인 포괄 schema 검증 완료도 주장하지 않는다.

최소 미적용 후보 `normal-eligibility-minimal.patch`: 기존 row 검사에 finite·비음수 timestamp 및 timestamp<=snapshot at를 추가하고 입력배열의 at가 비감소인지 검증하는2줄만 제안한다. 같은 at의 입력은 허용한다. 시작 직전 예약된 rAF가 가능하므로 timestamp>=raw.start 제약은 추가하지 않는다. 현재 계약은 row.timestamp=rAF 콜백 인수, row.at=그 콜백에서 관측한 performance.now이며 동일축임을 전제로 한다. 다른 clock/schema에서는 별도 계약이 필요하다.

검수기는 이2줄을 **소스 문자열 메모리 사본**에만 넣어 정상 출력 전체 동일 및 기존12+추가8 모두 제외를 확인했다. root21과 비교·반례 검사 통과는 신규 후보 채택 승인이나 실전 QA 완료가 아니다. 후보는 root가 독립검토·반영할 때만 적용한다. QA/root/BUILD/생산 수정0.

## 재현·보존·한계

- 실행: `node tools/team-followup-20261001/ITEM/normal-eligibility-check.mjs`. stdout JSON만 반환하며 실제 분석기 fs.writeFileSync는 메모리 결과로 치환한다. before/current/BUILD/root 증거와 모든 원자료 hash는 `normal-eligibility-evidence.json`에 보존했다. 검사 전후9개 읽기대상 SHA 동일.
- 최초 root 검수 VM 치환에서 문자열 내부 import.meta.url까지 치환해 문법오류1회가 있었다. 실행부2곳만 치환하도록 검수기를 수정하고21PASS 재확인했다. 원 분석기 실패가 아니다. evidence 갱신의 같은경로 delete+add 패치는 도구가 거부하여 단일 Update로 반영했다. 공유파일 영향0.
- 관련 docs 전체검색과 총괄18.40/18.41·DRAW-attribution-root-review·SUPPORT-normal-combat·아이템/QA 해석을 대조했다. 소유 제한 때문에 공유docs는 불변; root 인수 시 이 새 누락과 후보 상태만 연결하면 된다.
- `synchronousDrawCPU`는 역사적 필드명으로 동기 경과시간이다. 기존Chrome/cache UNKNOWN/오버헤드미측정/GPU미측정/단일표본·개선율 미확정 유지. firstKill batch 관측과 실제 개별 death 이벤트를 혼동하지 않는다.
- root live와 겹쳐도 작은 읽기/VM검사만 했다. 게임/브라우저/서버/대형빌드/Git/권한/queue/새세션/에이전트0. 원자료·현재analysis·타팀파일 쓰기0. 남은게이트: root 새3반례와2줄후보 독립검수·필요시 채택.

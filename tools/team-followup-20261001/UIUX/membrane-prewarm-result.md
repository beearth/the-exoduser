# MEMBRANE-VARIANT-IDENTIFICATION 결과

## 결론

정확 variant **UNKNOWN**. 추측 사전준비·전 variant 생성·생산 연결은 하지 않았다. 기존 ART 지원 및 draw 분석은 별도 완료 산출물로 보존했다. 동일 소유 prefix에는 지시서만 있었고 중복 구현은 없었다.

가이드 v0.9 전체(1047줄)를 분할 Read, SSOT index 전체(343줄), CH1_VERTICAL_SLICE DESIGN LOCK, compose의 현행 composition/gameplay lock 및 바닥87·유휴준비86 계약을 대조했다. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→CAMERA→TECH 순서 중 이번에는 기존 구도를 보존한 기술 식별만 수행했다. 총괄 §18.40 정상자료와 §18.41 별도 profiler 자료는 서로 다른 사건이다.

## 실제 근거와 캐시 계약

99ms draw는 loop686 / performance.now 71976~72075 / 처치9→9이다. 원자료 재귀 검색에서 variant/membrane/atlas/cacheKey 필드가 없으며 CPU profile node에는 인수·지역변수·캐시값이 없다. 플레이어 좌표는 렌더 대상 o.x/o.y가 아니고, 가시 대상 순서·카메라·기존 캐시 상태를 복원하지 못하므로 정적 배치로 역추정하지 않는다.

`ch1-living-detail.js?v=20260929-87`의 draw:331→atlas:312→paint:173→membrane:120→getImageData 스택. 실제 원식 draw:350은 `wet||surfaceOnly?0:Math.abs(Math.floor(o.x/40)*7+Math.floor(o.y/40)*11)%3`이다. getImageData:155는 dry 분기이며 paint:190은 비 surface 경로이다. 따라서 동일 소스에 한해 wet=false / surfaceOnly=false / 두 캐시 miss를 추론할 수 있다. 지역 피부막 regionalSkin의 variant0~4와 혼동하면 안 된다.

| 가능한 dry variant | membrane key | atlas key | 초기 seed |
|---|---|---|---|
| 0 | 0 | 0 | 781 |
| 1 | 1 | 4 | 1138 |
| 2 | 2 | 5 | 1495 |

membrane:121은 wet?3:variant, atlas:313은 surfaceOnly?(wet?2:3):wet?1:variant?3+variant:0. 배열은 모듈 평가 때 각각119/311줄에서 초기화하며, 최초 가시 draw→atlas 16프레임의 첫 paint→membrane 순으로 lazy 제작하고164/329줄에서 완성 결과를 공개한다. 배열 초기화의 실제 시각·해당 key 최초 호출 시각은 기존 자료에 없다.86차 캠프/나무 유휴큐는 이 배열을 준비하지 않는다.

시계 정렬은 `(profile microsecond timestamp − NavigationStart×1e6)/1000`. NavigationStart=816904.114954초, anchor34665.821ms는 Runtime.evaluate bracket34659.6~34670.2ms 안에 있다. 새 작은 분석기는 원자료부터65개 membrane 하위 샘플의 전방 간격 겹침95.892ms를 재현한다. 이는 native getImageData 단독91.387ms와 다른 **membrane inclusive** 집계이며, 실제 CPU 점유·네이티브·GPU 대기 완전 분해가 아니다. 오버헤드 미측정·캐시 UNKNOWN·기존 Chrome 프로필 제한은 유지한다.

## 원소스·원자료 SHA256

전체 해시는 `membrane-prewarm-analysis.json`에 있다. living 소스는 `e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640`로87차 및 직전 분석과 동일하다. 현재 game.html은 `7c681cfaa592778ab6d7cc5b88c46906b332e4395bb60fda1b837d09ed6ee1de`이며 직전 분석의 `8ebc3b7b52a651c1a3bc5e8c285b00d186c6dacc18429ada7499781acc72b0b9`와 다르다. root 통합 중 변경으로 취급하고 현재 game을 과거 캡처 실행 바이트라고 주장하지 않는다. UIUX는 읽기만 했다. 네 원자료 SHA는 직전 제출과 모두 일치한다.

## 미적용 최소 캡처 계약

`membrane-prewarm-capture.mjs`의 instrumentSource는 **메모리 문자열만** 변환한다. 파일·브라우저에 쓰거나 실행하지 않는다. 문맥이 다르거나 두 번 변환하면 거부한다. 원 함수·캐시키 계산 뒤 miss 시점과 완성 commit 뒤, 두 배열 init 시점만 opt-in `root.__uiuxMembraneCapture.observe`에 전달하는 후보다. cache hit에는 호출을 추가하지 않는다. 실패한 제작은 miss만 남으며 commit이 없다고 성공으로 판정하지 않는다. 관측 오류는 격리되지만 원 함수 예외·return·랜덤순서·seed·알파·lazy 폴백은 변경하지 않는다. 작은 훅 fixture만 실행했고 게임 모듈 실행0이다.

root가 **다음 승인된 단일 실행**에서만 적용 여부를 결정한다. 소스 SHA를 먼저 고정하고 QA 복사본 변환 전 collector를 준비하여 모듈 평가 전에 opt-in port를 연결한다. now는 해당 페이지 performance.now, runId는 고유 실행 ID. 모듈 평가 전에 설치하지 못하면 init 시각·시작 캐시는 UNKNOWN으로 기록하고 이전 캐시 상태를 가정하지 않는다. 실행 후 close→snapshot→port 제거; 생산 연결은 없다.

캡처 행: runId/time(ms)/stage(membrane 또는 atlas)/phase(init,miss,commit)/wet/surfaceOnly/variant/key. 최대64행·runId128자·스칼라만 허용, 넘으면 dropped 증가. 이미지/Canvas/객체 참조 저장0, 이미지 RAM/VRAM 상한 변경0. 별도 스케줄러·전 variant 준비·랜덤 호출·픽셀 readback·epoch 예약 작업0. close는 해당 관측 실행 종료이며 게임 epoch 취소 구현을 대신하지 않는다. root가 runId를 새로 발급하고 이전 port를 제거하여 실행 간 자료를 섞지 않는다.

같은 실행의 draw start/end/loopId 및 clock 전후 bracket·profile을 함께 보존한다. 해당 draw와 겹치는 atlas miss→membrane miss→membrane commit→atlas commit의 **유일한 중첩**과 실제 variant/key를 대조한다. 다중 후보·dropped>0·init 누락·관측 오류·clock 불일치는 식별 불충분으로 보존한다. 새 훅은 줄번호를 이동하므로 새 변환 소스 SHA와 새 profile의 줄번호를 사용해야 한다. 기존99ms의 variant가 소급 확정되는 것은 아니다. 오버헤드를 별도 검수하기 전 프레임 개선율을 계산하지 않는다.

## 검사·재현

`node --test tools/team-followup-20261001/UIUX/membrane-prewarm-capture.test.mjs`

`node tools/team-followup-20261001/UIUX/membrane-prewarm-analyze.mjs`

독립 fixture **6 PASS / 0 FAIL**. 문자열 역제거 후 원문 완전일치로 원식·랜덤·알파·함수 본체 보존을 검사했다. 검사 종료 UTC2026-10-01T15:03:43.957Z에 이번 첫 분석 대비 소스2개·원자료4개 SHA 불변을 확인했다. 실제 픽셀/프레임 개선은 UNKNOWN. docs 전체 membrane/피부막/캐시/모듈버전 검색은 `membrane-prewarm-doc-matches.txt`에 보존했다. 생산 계약 변경이 없으므로 공유 docs 수정0, 이번 기술 근거는 이 소유 보고서에만 기록한다.

## MAP PRODUCTION REPORT

| 항목 | 이번 범위 판정 |
|---|---|
| STAGE / MASTER | CH1-1 기술 식별만. 기존 silhouette·regions·main route·side spaces 읽기 전용 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes 변경0 |
| LARGE | source assets·composites·overlap·repeated silhouette 변경0 |
| MEDIUM | connections·remaining holes 변경0 |
| GROUND | shadow·contamination·structure integration·seed·alpha 변경0 |
| PLAYABLE | arenas/travel/breathing/threat/combat readability 변경0·새 실전검수0 |
| LANDMARK | primary/secondary/tertiary 변경0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새 캡처0·미검수 |
| TECH QA | 원자료·소스·캐시키·독립 fixture만. route/collision/pageerror/404/seam/loading 새 런타임 검수0 |
| FILES | UIUX/membrane-prewarm-*만 작성. 원 MAP/생산/공유/타팀 수정0 |
| GIT | 조회·쓰기·staged·commit·push·deploy 모두0 |
| VISUAL VERDICT | RETOUCH: 기존 전체 맵 판정 유지. 이번 실제 픽셀은 UNKNOWN이며 시각 PASS 아님 |
| NEXT PASS | root 다음 단일 실행에서 exact variant 관측. 식별 전 사전준비 후보·생산 연결0 |

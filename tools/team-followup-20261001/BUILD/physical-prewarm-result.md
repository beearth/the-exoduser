# 물리 임팩트 사전준비 통합 독립 검수

## 수신·Read·검사·완료
- 수신/첫 실제Read 2026-10-01T14:57:03Z. 사용자 AGENTS, 하위 AGENTS 검색(해당 경로 추가파일 없음), 총괄18.40, 전용task, BALANCE 결과·후보, 실제game 함수/부트수명, 원함수 fixture, QA 픽셀원자료와 root normal-analyzer-final-evidence의21PASS를 읽었다. 전용task만 있어 중복완료 없음.
- 첫명령은 UTC시각/범위검색/실제함수위치 읽기. 독립명령 `node tools/team-followup-20261001/BUILD/physical-prewarm-check.mjs`: 최종 2026-10-01T14:58:17.089Z~14:58:17.362Z, **15PASS/0FAIL**.
- 회귀명령 `node --test test/physicalImpactPrewarm.test.mjs test/darkSphereIdentity.test.js`: **17PASS/0FAIL**, physical13+darkSphere4. 약227ms. 전용 regression.txt에 실제 출력 보존.
- 판정: 코드 통합/독립 경계 PASS, 비상손실·정상API하 무한대기 반례 미발견. 실제 게임 부트 호출·live성능 인수는 root 후속 게이트이며 완료로 대체하지 않는다.
- 한국어 결과·receipt 기록 완료시각: 2026-10-01T14:59:36Z.

## 실제 소스 SHA-256
| 읽은 파일 | SHA-256 |
|---|---|
| game.html | 7c681cfaa592778ab6d7cc5b88c46906b332e4395bb60fda1b837d09ed6ee1de |
| test/physicalImpactPrewarm.test.mjs | f8bc0b5073a3feb838680017fc1ecd56df707cc1666ab0ba0f6440b369ccc3c2 |
| QA/physical-prewarm-original.js | 681989477a37b39bdcc961afa07e9e00af01fe2a3414f0ee3052d9d756a5f5be |
| BALANCE/physical-prewarm-candidate.js | 34524ef90d3549aa60448b2bee0d6a25b04af71e43f20be0823ded8723e5f6ed |
| outputs/team-review-20261001/draw-attribution/physical-fixture.json | 570f7fdcdb6f844f16633053a9dbd9e4eeb88930818556444a9cba480b1acabc |

QA/BALANCE 상대경로는 tools/team-followup-20261001 아래다. 5개 입력의 검사 전후 SHA 일치를 evidence 최종 검사에서 확인했다.

## 실행 근거와 독립 경계
기존test에서 synthetic Canvas/fake clock 하니스만 재사용하고 독립 검사 입력은 별도 정의했다. VM에는 현재game에서 추출한 실제 helper/tint/preparation을 넣었다. 원helper/tint는 저장original과 문자열 일치, preparation은 BALANCE후보 및 브라우저fixture 저장함수와 일치한다. 별도 계산 구현으로 대체하지 않았다. 새 이미지 요청·게임 전체 실행0.

| 독립 입력/경계 | 실제 결과 |
|---|---|
| 부트 순서/호출 수 | showBootLoading→assets→dropFx→itemSkins→physical→renderer. await호출1개, boot globals 정의 이후 |
| microtask 시작전 epoch 변경/동시호출 | 같은pending Promise, cancelled/read0. 다음prepared, 그다음reused, 합계read1 |
| load 동시 src/currentSrc/identity 변경 | 각각stale/read0, timer/listener0. 현재이미지 원lazy호출은read1 성공 |
| currentSrc 빈값→src, complete512² 정상load | stale로 준비 생략. 명시재호출prepared. 부트 자동재시도없음 |
| load249ms/250ms/400ms | 249는시작가능, 합성동기5ms로prepared-over-budget(254ms). 250/400은timeout/read0, 정상청소 |
| killed설정과load 동시 | cancelled우선, read0 |
| setTimeout throw | error로settle, listener0, pending=null |
| load remove만throw, error발화 | load-failed로settle, error측remove/timer청소계속. errors1, load listener1잔존명시 |
| tint throw→원함수복원 | error, cache entry없음. 원lazy재시도read1 성공 |

부트 정적 검수에서 showBootLoading은 DOM누락시 조기return하므로 active=false면 outside-boot다. 실제화면에서 호출되어 준비됐는지는 root가 확인한다. 정적순서를 실제부트성공으로 추정하지 않는다.

## 제약 평가·남은 인수 게이트
1. source/currentSrc/identity 변경을 보수적으로stale 처리하는 계약 유지. 정상currentSrc 빈값→로드완료도 생략하는 입력을 재현했다. 이는 화면손실이 아니라 lazy처리비용이 남는 제약이다. live측정 전 실제boot stats/status·source/currentSrc·캐시동일성 확인 필요. 현재정책상 수정필수 결함은 아니다. 변경한다면 정상로드와 다른source전환을 구분해야 하며 guard단순삭제는 부적절하다.
2. 250ms는 협력예산이며 hard timeout이 아니다. 원동기tint는 선점중단불가, 249ms시작→254ms완료도 허용. 이벤트루프정지시 실제wall-time내settle 보장불가. 정상타이머가 실행되는 하니스에서 무한대기없음.
3. remove/clear API가throw하면 errors기록 후 다른청소·settle을 계속하나 거절된청소를 성공으로 보장하지 않는다. listener잔존은 이상API주입의 기존제약이다. 정상브라우저 종료후listener/timer 확인은 root실기게이트. 직접수정0.
4. 원WeakMap/흰RGB/alpha식/물리lazy불변. 기존512²한장만 대상. pixelBytes=1,048,576은 출력명목RGBA크기이며 추가GPU/총메모리실측이 아니다. 보호전투함수를 준비에서 호출하지 않으며 RNG금지 원회귀도 통과했다. 전체생산diff/실전전체행동 검증을 주장하지 않는다.
5. 저장브라우저fixture의 전수1,048,576바이트0diff/동일캐시/준비tint1회·재사용추가0은 읽기대조한 증거이며 이번 새브라우저측정이 아니다. 실전개선율/첫전투부하이동/CPU-GPU원인은 미판정.

## 인계·보존
검사근거 physical-prewarm-evidence.json, 회귀출력 physical-prewarm-regression.txt, docs전체관련검색 physical-prewarm-docs.txt. 공유docs는 소유제한으로 수정하지 않았다. root가 실제boot호출·취소stats·live첫물리draw/전투회귀·후속tint0을 확인해 인수한다.
생산/타팀/원자료쓰기0. 새게임/브라우저/서버/대형빌드/Git/권한변경/queue/새세션/하위에이전트0. 검사완료, 남은백그라운드작업0. root단독실전측정을 방해하지 않는다.

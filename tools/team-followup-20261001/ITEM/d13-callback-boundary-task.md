# ITEM: D13 callback 전환 경계 최소 수정

root가 실제 현재 d13-deferred-contract-candidate.mjs를 import하여 첫 callback의 clear() 및 getZones 배열 교체 두 경우에 두 번째 stale callback 실행을 독립 재현했다. outputs/team-review-20261002/four-candidate-acceptance/item-callback-red.json에 두 경우 callbacks=2/expected1. 원 후보 bytes/SHA는 같은 폴더 before.json 및 d13-deferred-contract-candidate.mjs.before에 보존했다.

먼저 실제 후보 import로 독립 반례를 확인하고 재현되면 기존 ITEM 소유 d13-deferred-contract-candidate.mjs에 최소 수정한다. 새 회귀/receipt/result는 ITEM/d13-callback-boundary-*로 작성한다. callback 루프 안의 epoch/배열 identity 유효성을 확인하며 callback 중 신규 등록·재진입·예외 이후 큐의 필요한 경계도 조사한다. 원 피해/원 RNG/동기 return/기본 비활성/생산0을 보존하고 child수치·cap·중첩은 미결 유지한다. 기존19검사가 쓰는 원증거를 덮지 않도록 새 하니스/출력을 사용해 필요한 인접 회귀만 검증한다. 단순 stale callback 억제 때문에 새 출처/상태를 잘못 삭제하지 않는지도 확인한다.

기존 세션의 다음 한 건만 수행한다. 같은 과제 진행/대기/초안이 있으면 중복하지 않는다. 생산 server/node-main/HTML/에셋은 읽기 전용이고 소유 prefix 및 명시 후보 이외 타팀·사용자 초안·stage·세이브를 수정하지 않는다. 서버 전체 import/실행·HTTP·listen·포트·앱·게임·브라우저·빌드·새 팀/세션/에이전트·Git쓰기·권한 변경0. 기존 제한 우회0. 한국어 실제 수신/Read/명령/Edit/한계와 결과를 구분한다. 80개부터 체크포인트·100미만 규칙을 유지하고 불필요한 전체 복사 산출을 만들지 않는다.

# MEDIA-RANGE 독립 검수·최소 후보

수신/첫 Read 2026-10-01T17:53:45Z. 동일 prefix task만 존재, 진행/대기/완료 중복 없음. AGENTS/BUILD 대장/기존 media 결과 및 실제 server.cjs를 읽었다. 실제 수정/최종 검사/완료 시각은 receipt에 기록한다. 서버/포트/API/앱/브라우저 실행0.

## 원결함·후보 실행
실제 server.cjs Range IfStatement를 acorn으로 추출해 async VM에 req/res/fs stream 대역을 주입했다. 서버 전체를 import/실행하지 않았다.
정확 입력 `GET`, size10000, `Range: bytes=-500`:
- 원분기:206, Content-Range `bytes 0-500/10000`, Content-Length501, createReadStream start0/end500.
- 후보:206, `bytes 9500-9999/10000`, length500, start9500/end9999.
이것은 실제 suffix 계산 결함이며 이전 native 영상 오류의 원인이라는 증거는 아니다.

## 표준·정책
[RFC9110 §14.1.2/14.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-14.1.2)에 따라 suffix는 마지막N바이트, 길이초과는 전체를 선택한다. GET 외 Range와 알 수 없는 단위는 무시한다. 후보는 단일bytes만 지원하고 malformed/다중범위는 무시하여 기존200 경로를 사용한다. invalid 역순·suffix0·범위밖 시작은416, 끝초과는 clamp. 큰 숫자는 BigInt로 변환하여 overflow 없이 clamp/416한다. 빈 파일 Range는 무시하여200을 유지한다(표준이 허용하는 선택). 다중범위 multipart 지원을 주장하지 않는다.
17개 범위/이상입력, GET 캐시/압축4개 원후보 동일, HEAD Range 무시1개, fallback AST byte보존1개 = **23검사 PASS**. 원본 NaN/부분숫자 수용 등 결과도 evidence에 기록했다. stream close cleanup 대역도 호출 확인. 실제 응답 byte전송·Node HTTP 검수는 아니다.
HEAD는 Range 무시만 후보에 포함했다. 기존200분기 stream.pipe 동작은 보존했고 HEAD의 실제 wire body 금지/불필요파일읽기 개선은 별도후속이다. precondition/If-Range/조건부 Range 우선순위도 이번 최소수정에 포함하지 않았다. 기존 conditional GET304/gzip HTML캐시/gzip JS/non-gzip GET은 그대로다. HEAD·If-Range 전체 HTTP 적합성 PASS로 확대하지 않는다.

## 적용가능성·원자료
source SHA256 `339fad6ab51cba92f6ca7a386c8aeb251f68cdb58cdfa55c109f57b1758a42ad`. 적용 전 정확 SHA와 두 치환 바늘 각1개를 확인한다. pure applyCandidate는 구조 변경 시 SOURCE_CONTRACT_CHANGED로 거부한다. 실제 적용 후 전체 source parse 성공, 원 server의 최종 SHA 동일을 검사했다.
`media-range-candidate.patch`는 diff -u로 생성한 실제 최소2hunk 후보, `media-range-candidate-server.cjs`는 적용 검사용 사본이며 **실행하지 않는다**. root가 생산소유권/백업/회귀 후 적용한다. 최초 fixture의 서로 다른 VM realm header deepEqual 오류는 JSON data 정규화로 고쳤고 first-fixture-error.log에 보존했다. 원 서버 결함/후보실패와 구분한다.
docs 전체 Range/suffix/Content-Range 검색은 docs-search.txt. BUILD 대장 본인 구역만 갱신; 공용server/총괄docs/Git/index/타팀/기존후보/사용자초안 수정0. QA 슬롯·사용자게임·세이브·EPERM/권한경계 접촉0. root 인계 후 대기.

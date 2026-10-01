# 조건부 Range 독립 후보 — 미적용

## 실제 수신·검수
수신/첫 Read 2026-10-01T18:14:13Z, 첫 Edit18:15:12Z, 첫 검사완료18:15:12.406Z, 최종 재검수/문법/SHA확인18:15:24Z. 동일 prefix task만 존재하여 진행/대기 중복 없음. 초안/이전media-range 원자료와 타팀변경 보존. AGENTS/BUILD 대장/실제server 및 RFC9110을 읽었다. task 기준 원격8e4ed4e는 제공근거이며 신규 Git/네트워크 원격조회0.

실제 server SHA256 `6a7c1083ac10b105cca3624c8fd0e919d14a59b32774612ff0a00cb881be8538`와 task 일치, 종료SHA 동일. 실제 handler의 Range·전체200 분기와 선언을 AST로 추출해 req/res/fs/압축/cache 대역 VM에 주입했다. 서버 전체 import/listen/HTTP/포트/API 실행0. 추출/후보 분기SHA 및 저장route를 포함한 동일prefix SHA는 evidence에 기록했다.

## 정확 원결과와 변경
size10000, mtimeMs1의 기존 ETag는 `"2710-1"`이다.
|실제 요청|기존|후보|
|---|---|---|
|GET bytes=0-9 + If-None-Match:"2710-1"|206/stream0-9|304/body0·stream0|
|GET bytes=20000- + 동일If-None-Match|416|304/body0·stream0|
|GET bytes=0-9 + If-Range:"other"|206/부분응답|200/전체경로|
|GET bytes=0-9 + 약한If-Range W/"2710-1"|206|200/전체경로|
|GET bytes=0-9 + date/invalid/empty If-Range|206|200/전체경로|
|GET Range + 동일INM + 불일치If-Range|206|304 우선|

[RFC9110 §13.1.5/13.2/14.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.5)에 대조: Range보다 조건부304가 먼저이며 If-Range false는 Range를 무시해야 한다. 후보는 기존 정확단일 If-None-Match304 검사를 GET/HEAD의 Range 앞으로 이동한다. 저장helper/route와 suffix 계산은 바꾸지 않았다.

## 보수적 If-Range 정책·범위
현재 size+floor(mtimeMs) ETag의 strong validator 성질(같은size/같은ms 내용변경·gzip 표현 차이)을 검증하지 않았고 Last-Modified도 제공하지 않는다. 따라서 **If-Range가 있으면 모두 기존 전체응답으로 폴백**한다. 동일 ETag의 If-Range도 후보200이며 이것은 기존206이 잘못됐다는 반례가 아니라 안전한 성능정책 변경이다. 서버의 Range 무시는 표준상 허용된다. date 매칭/강한validator 기반 부분206 지원을 주장하지 않는다. 멋대로 date를 Date.parse만으로 받아들이거나 현재 ETag를 strong로 확정하지 않았다.

## 실제 회귀·남은 게이트
**31검사 PASS**: 조건/정책9 + 기존suffix/fixed/open/oversuffix/끝초과/zero/reverse/large/invalid15 + 일반GET/빈파일/HEAD/기존304/HTML gzip/JS gzip6 + 저장route 포함prefix byte보존1. 동일If-Range의200은 정책검사, 나머지 원결과는 red.json에 보존했다. 후보 전체구문/원본SHA보존도 확인. candidate.patch SHA `7a853f14b3cb2c8d17b658792967d87b16fa128cad0afbea34c5efed6e358ea0`.
**별도 미해결**: If-None-Match wildcard/weak/list, If-Modified-Since·If-Match·If-Unmodified-Since 전반; 현재 후보에서 앞 세INM와IMS+Range는 여전히206을 반환한다. 실제 입력/결과를 limitations에 남겼다. HTML no-cache 경로의 기존INM 무시는 유지한다. 전체 conditional HTTP 적합성은 FAIL/미완료이며31PASS로 덮지 않는다. HEAD wire/body·precondition representation별ETag·실HTTP·native media 원인은 미검수다. 적용 전 root가 범위 승인 및 필요하다면 이 게이트를 따로 해결해야 한다.
실제 생성 candidate-server.cjs는 미적용검사용 사본이며 실행금지. exactSHA 및 치환바늘 각1개 조건으로 applyCandidate를 검수했고 diff -u 최소2hunk를 제출했다. prefix의 저장helper/route byte동일, 기존200캐시/gzip 결과동일, HEAD 기존동작 보존. docs 전체검색은 docs-search.txt, 공유docs/BUILD대장에는 쓰지 않고 반영안만 제출: 조건부304우선·보수적IfRange200·미지원validator목록을 BUILD 백로그에 구분 기록.
쓰기 소유conditional-range-*만. 생산server/HTML/타팀/stage/초안/이전자료/사용자게임1573846373/세이브/권한/Git쓰기/새세션/팀/에이전트 변경0. EPERM 우회0. 완료 후 root 검토대기.

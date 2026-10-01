# INM 약한 비교 후보 — 생산 미적용

## 실제 인수·시각
수신/첫Read 2026-10-01T18:24:19Z, 첫Edit18:25:14Z, 최초40검사완료18:25:14.706Z, 최종 재검사/구문/SHA확인18:25:28Z. 중복은 task만 존재하여 없음·기존초안/타팀변경/원자료 보존. AGENTS/BUILD 대장/실제server/이전 root 인수78(31+40+7) 자료/RFC를 읽었다.
시작 로컬HEAD `c2420b0e797b4c7f116ed60c37353c4fbed8cdf1`, root 제공 remote-checkpoint-final.json 실제 확인시각18:24:53.974780Z의 동일 ref/SHA와 sourceSHA를 인수했다. BUILD 신규 원격조회가 아니며 최초 파일조회 시 아직 없던 증거는 후속 실제Read에서 확인했다. 생산 sourceSHA `441bacbd8a5e0f7ae883e5c9a0a2e0368bf5190f50d2cb0246b89a4e6771bb6d`, 시작/종료 동일.

## 실제 RED/GREEN
실제 정적 If-None-Match/Range/전체GET 분기를 AST 추출하고 req/res/fs/cache/압축 대역으로 실행했다. 서버 전체 import0.
size10000/mtimeMs1/ETag `"2710-1"`, GET Range bytes=0-9에 대해 원분기206, 후보304인7반례: `W/"2710-1"`, `*`, OWS로 감싼별표, `"other", W/"2710-1"`, `"other,tag", "2710-1"`, OWS 약한tag, 빈 list member가 포함된 유효목록. 정확 각 입력/원stream범위/후보body0·stream0은 red.json에 보존했다. strong 정확일치 기존304는 유지.

## 최소 정책
[RFC9110 §13.1.2 및 §8.8.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.2)에 직접 대조했다. GET/HEAD INM은 weak comparison, wildcard는 현재표현 존재, list는 하나라도 opaque-tag가 같으면304다. 인용 안 쉼표는 구분자로 자르지 않는다. W/는 대소문자 구분, opaque-tag는 역슬래시를 unescape하지 않는다. OWS는 SP/HTAB만 허용한다.
작은 top-level `matchesIfNoneMatch`를 추가하고 기존 exact 비교1곳만 호출로 치환하는2hunk 후보다. 전체목록 끝까지 검증 후 match를 반환하여 `"2710-1",bad`처럼 유효앞부분만 보고304하지 않는다. malformed/배열/빈/제어문자/lowercase w/·star혼합/과도빈member 입력은 INM 전체무시 정책(기존Range/GET 진행). 빈list member는 합리적32개까지 수용하고 과도입력은 무시한다. 단순split(',') 사용0.

## 실제 검사·보존
**40검사 PASS**: parser/실원분기21 + quoted-comma/empty opaque/current weak/backslash5 + 인접보존12 + HEAD weak3041 + 두 변경 외 전체소스 byte동일1. 신규 IfNoneMatch 처리를 제외한 If-Range 전부전체200·HTML 기존정책·suffix/open/large/invalid·GET/gzip·HEAD·빈파일·POST 경계를 보존했다. source 전체 역치환으로 저장helper/route 포함한 나머지 byte동일 검증. 후보 전체구문 PASS.
source/후보/helper/추출분기SHA는 evidence. patch SHA `bc196eff69919522d206e1e4a876d7c5f848ff52d82fc115b801fd73cd4834bf`. candidate.mjs SHA `bb9139bbd4fdd1ee1e1c42d1585d77f38660832d6b942f58d96e4b3a1fb5a81b`. 미적용candidate-server.cjs/patch는 root 인계용이며 서버실행 금지. exact sourceSHA/치환바늘 각1개 적용게이트를 유지한다.

## 남은 게이트·기록
IMS/If-Match/If-Unmodified-Since/조건부쓰기 전체로 확장하지 않았다. size+mtime ETag의 strong보장·gzip별표현 적합성, HEAD 실제wire·304전체header·실HTTP·native UI 인수 미완료. HTML의 INM 무시도 기존정책으로 유지했으므로 모든 정적표현 HTTP 적합성 선언0. 원78회귀 재실행 대신 꼭 필요한40소형검사만 했다.
docs 전체 INM/IfRange/ETag/조건부 검색을 docs-search.txt에 보존. 공유docs/대장 쓰기0, 반영안만 제출: BUILD 조건부 캐시 항목에 weak/list/wildcard·quoted-comma·malformed전체무시·40fixture PASS와 위미완료를 분리 기재한다.
쓰기 inm-matching-*만, 생산/공유checkout/타팀/stage/Git쓰기/서버/listen/HTTP/포트/UI/앱/빌드/에셋/세이브/권한/새세션/팀/에이전트 변경0. QA실UI 슬롯/사용자탭1573846373 보존. root 통합검토 대기.

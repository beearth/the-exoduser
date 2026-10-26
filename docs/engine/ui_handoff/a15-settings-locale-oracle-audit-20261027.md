# A15 설정 라벨 후보 독립 교차 검수 — 2026-10-27

## 고정 입력

- UI 후보: ui-simple/a15-settings-locale-source-candidate.json, SHA-256 25FD0D15ACB6B76C28B9A99FEDC87BB0C4E006981949E7EBD14140E2823EF7EC. 웹 607110d52a56a1e5622a78e2ce7d09582946920a, Mac e7fe487bfba541f01ac4033f4d4d744210e7b04e에서 추출한 62 ID·29 locale의 미적용 후보.
- QA 원본: qa-contract/a15-label-oracle.cjs/.json, 웹 98c8f0359713ab365ce8a85ddda0469d64da1d32, Mac e7fe487…. 29×17 매핑. 원본 JSON SHA-256 CB9CCDFB3A27A3EE2BDF172C25DCA0CB293CDBCB2EB89FC2F153F05D25DD7445.
- 두 웹 revision의 game.html·localization-data.js는 다르다. 이번 비교는 각 고정 revision의 실제 번역 로드 규칙을 적용한 공통 라벨 부분만 검증한다.

## 원본 QA 추출기 누락과 보정

- game.html:72–98은 lang_*.js 27개를 localization-data.js보다 먼저 로드한다. 원본 QA 추출기는 localization-data.js와 game.html의 테이블 구성만 실행해 27개 언어 사전을 건너뛰었다. 원본 JSON의 비한국어 한국어/영어 폴백 다수는 웹 런타임의 최종값이 아니다.
- 원본 ar 표본의 영어 탭4·명시 영어3·한국어 키10은 이 누락에 따른 결과다. I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/verification/recheck-a15-oracle.cjs는 원본을 변경하지 않고 사본에 27개 언어 스크립트 실행만 삽입했다. I: 보정 JSON SHA-256 168BD1239DE5F56E52917F25E277859A1C50B1A3BC96C2CE6D4EC3EB74FDB68E. 보정 ar 표본은 영어 탭4·병합 언어 테이블13이다.

## 후보 대조 결과와 한계

- 후보와 보정 오라클에서 동일 웹 키·동작으로 연결된 13개 매핑을 선택했다. 29언어 377개 중 native 한국어 문구와 웹 한국어 키가 의도적으로 다른 semantic 매핑 4개를 제외한 373개를 문자 그대로 비교해 불일치 0개였다. 비한국어 탭은 후보 JSON의 기존 nativeEn 폴백을 사용해 비교했다.
- 나머지 QA 매핑 4개는 전체화면 토글 관련 3개와 조작 목록 제목 1개로 제품 의미나 역할이 달라 일치 분모에 넣지 않았다. 후보 전체 62 ID의 런타임 연결, 29언어 실표시, 글리프·Arabic shaping·RTL·길이·마우스 입력은 미검증이다. 후보 게시는 출처 전달이며 Unity 채택이나 전체 A15 PASS가 아니다. 기존 ko/en fallback을 보존한다.
- Git 고정 소스와 I: 파일만 읽었다. 공유 G: HEAD·INDEX·WORK, E: Editor/lock, Mac 제품, 사용자 설정·세이브는 수정하지 않았다.

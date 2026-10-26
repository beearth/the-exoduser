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

## 07:25 후속: QA 62 ID 전체 분류와 후보 메타데이터

- 위 373/373은 최초 게시 157e3e8f3cb63299c48fd484ba7056fd9dceb9b8 당시의 공통 13매핑 감사 이력이다. QA가 웹 607110d52a56a1e5622a78e2ce7d09582946920a의 실제 27개 언어 파일을 로드해 만든 I: qa-contract/a15-label-oracle-v2.json SHA-256 54D16AA0D70CC739371F5C4B2F501634D2DB206C6B382408F7EAF0C3019B0364가 후속 정본이다. 원본 결함 JSON과 373분모는 삭제하지 않는다.
- QA v2는 62 ID를 직접 대응 43, 의미 대응 6, 웹 정본 없는 native-only 13으로 분류했다. 직접 대응은 43×29=1,247/1,247 유효 표시값 일치. 이 중 탭4와 보관함 동작명의 27개 언어 행, 합계 135값은 명시 번역이 아니라 현행 영어 fallback이다. 의미 대응 6×29=174 중 문자 일치 168, 한국어 6값은 의도적 문구 차이이며 제품 동작 parity가 아니다. native-only 13×29=377값은 웹 정본 비교 대상이 아니다.
- QA v2는 게시 후보 JSON SHA-256 25FD0D15ACB6B76C28B9A99FEDC87BB0C4E006981949E7EBD14140E2823EF7EC을 입력으로 평가했다. UI가 이후 62개 entry에 nativeSite/adapterOwner, 최상위에 macSiteCommit/macSiteBlobs 메타데이터를 추가한 최신 I: 후보 SHA-256은 10308928CEBFDD117ABF6009691E084C9E129E59565B443F6E5914A8C1B4DB78이다. 이전 62 ID의 locale 값과 기존 모든 필드 및 최상위 기존 필드는 전부 동일함을 별도 비교했으므로 QA의 1,247값 판정은 새 후보 값에도 적용된다. 이 메타데이터는 연결 계획일 뿐 구현·채택 증거가 아니다.
- Mac 읽기 전용 preflight 원격 5b0c8ed580be03099dc30249bc4e141902474d0b는 62 ID 전체 QA 확정 전 제품 채택0을 기록했다. 1098px Settings QA Player 1회에서 사운드 카드 1열·첫/끝 카드와 footer 비겹침·휠 뒤 위치 유지가 관찰됐다. 이는 레이아웃 한 조건의 시각 PASS이며 라벨 언어/글꼴/RTL PASS가 아니다.
- 본 후속 게시의 JSON은 미적용 후보와 QA v2 비교 결과다. 일반 마우스 입력·청각 출력·미지원 게임 옵션·전체 A15 완료는 계속 HOLD다.

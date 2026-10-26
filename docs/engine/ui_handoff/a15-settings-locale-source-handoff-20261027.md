# A15 설정·키 목록 29언어 원문 후보 인계 — 2026-10-27

## 출처와 목적

- 후보 JSON: a15-settings-locale-source-candidate.json, SHA-256 25FD0D15ACB6B76C28B9A99FEDC87BB0C4E006981949E7EBD14140E2823EF7EC, 62 ID·29 locale. UI 원자료는 I: ui-simple의 동명 파일이다.
- 웹 원본은 607110d52a56a1e5622a78e2ce7d09582946920a의 game.html, ui-panels.js, localization-data.js, lang_*.js이다. 대응 Mac 소스는 e7fe487bfba541f01ac4033f4d4d744210e7b04e의 NativePauseMenu/NativeKeyBindList/키 목록 리소스다.
- 이 JSON은 웹 원문 출처 후보이며 현재 Unity 런타임이 로드하지 않는다. 한국어/영어 현행 fallback은 그대로 유지한다.

## 실제 웹 표시 규칙

- 설정 4탭 제목은 ui-panels.js의 한국어/영어 리터럴을 사용한다. 나머지 27언어에서는 탭 제목이 영어다. 해당 언어의 번역 사전에 동명 키가 존재해도 탭에 자동 적용되지 않는다.
- 설정 항목과 키 목록은 game.html이 먼저 27개 lang_*.js를 로드하고, localization-data.js의 생성 UI 사전으로 동일 키를 덮어쓴 뒤 조회한다. _T 누락은 한국어 키, _L/키 동작명 누락은 명시 영어 fallback이다.
- 후보의 조회 키 45개 중 44개는 추가 27언어 모두에 값이 있다. 보관함 동작명은 exact key가 없어 기존 영어 Storage fallback을 유지한다. Native 전용 QA/저장/미지원 안내는 웹 동등 키가 없어 임의 번역하지 않았다.
- Native의 프레임 제한·전체 화면 토글·효과음·배경 음악은 웹의 관련 라벨과 의미를 대응한 항목이다. 웹 해상도/모드 선택을 지원한다고 주장하거나 문구가 같다는 이유로 동작을 확장하지 않는다.

## 독립 대조와 채택 게이트

- 별도 감사 문서 a15-settings-locale-oracle-audit-20261027.md의 보정 오라클과 공통 13매핑의 373값을 문자 대조해 불일치 0개였다. 원 QA 추출기는 lang_*.js를 누락했으므로 비한국어 fallback 판정은 사용하지 않는다. 서로 다른 웹 revision을 고정해 비교한 범위는 감사 문서를 따른다.
- 후보 전체 62 ID를 실제 Native 조회 지점에 연결한 결과는 없다. Arabic 원문 존재는 IMGUI glyph coverage, shaping, bidi/RTL, 길이 fit의 시각 PASS가 아니다. 언어별 실화면과 입력 검수 전 제품 채택 0.
- 자료 게시는 제품 코드·설정·번역 런타임·사용자 데이터 변경을 수반하지 않는다. 일반 마우스·청각 출력·미지원 게임 옵션과 전체 A15는 별도 HOLD다.

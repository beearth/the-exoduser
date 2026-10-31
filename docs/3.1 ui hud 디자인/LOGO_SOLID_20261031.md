# EXODUSER 로고 불투명 흑철 바탕 — 2026-10-31

사용자 브리프 `I:/EXODUSER-Storage/codex-takeover/logo-solid-brief.md`에 따른 웹 로고 알파 보정이다. 직접 확인한 레퍼런스는 사용자 `user-report.webp`와 같은 후보의 실제 첫 화면이다. 원본의 금속·악마 머리·눈 고리·크기를 유지하면서 인장 고리가 글자 내부를 통과하는 문제를 해결한다. 유료 생성·영상 재인코딩·DEMO/EA 복사·배포는 실행하지 않는다.

## 제작 계약

| 항목 | 값·적용 |
|---|---|
| 원본 | `img/logo_exoduser.png`, 1506×719 RGBA. 덮어쓰지 않음 |
| 런타임 | `img/logo_exoduser_solid.png`, 같은 1506×719 RGBA |
| 방법 | `python tools/build-logo-solid.py OUTPUT`. Pillow·numpy·scipy의 로컬 합성, AI 재생성 없음 |
| 실루엣 | 원본 alpha >24 윤곽의 3회 closing과 닫힌 내부 메움. E/U/S의 열린 음각 여백과 글자 사이 공간은 유지. 치아 사이만 머리 내부로 채움 |
| 흑철 | RGB (12,13,15), 저주파 음각 변화 약 ±1. 원본 아래에만 합성 |
| 외곽 | 원본 해상도에서 3px 짙은 rim. Gaussian σ0.85 경계 정리, 1px 내부 core 불투명. 반투명 금속 가장자리는 어두운 matte 위 합성 |
| 그림자 | 검정, 아래 6px, Gaussian 10px, 알파 ×0.72. 네온·밝은 테두리 없음 |
| 원화 보존 | 원본의 alpha=255 금속 115,815픽셀 RGBA 완전 동일. 원본 PNG byte 보존 |
| 합격/중단 | 붉은색·흰색·실제 배경의 1x/3x에서 구멍·흰 띠·잔점 없음, 인장 관통 없음, 기존 크기·위치·겹침 회귀 없음. 같은 핵심 결함 2회 연속이면 제작법 재검토 |

## 사용처

| 소스 | 대상 | 참조 수 |
|---|---|---:|
| `index.html` | splashTitleLogo, gateLock `.gl-logo`, `.cin-title-art`, cinImg19, chGateImg, 로그인/회원 UI 2곳, lobby-brand-logo, showLoading, preload | 10 |
| `game.html` | `_renderIntroCutscene`의 `ln.title` 로고 이미지 | 1 |

기존 인장과 로고의 CSS 위치·크기·fade·후광은 유지한다. gateLock의 로고는 폭57.3%·좌23.86%·위26.2%, splash는 폭520px·(96,96)이다. 추가 비네트 없이 PNG 자체의 바탕과 그림자로 분리한다. 로딩 실패 때 인게임 타이틀의 기존 텍스트 폴백과 splash의 기존 캔버스 폴백은 유지한다.

## 검수·증거

`G:/exoduser/tmp/design-review/20261031_logo_solid/REPORT.md`와 `verification.json`에 최종 판정·결과·원격 영수증을 둔다. 재현: `python tools/verify-logo-solid.py OUTPUT http://127.0.0.1:3376`. 전용 `server.cjs`, 격리 저장, headless·무음·DPR1로 확인한다.

1920×1080·3840×1080의 첫 화면·splash·로비·시네마틱 제목·chapterGate를 같은 크기로 비교한다. 시네마틱의 보존 DOM 제목과 인게임 타이틀은 실제 렌더 함수를 강제 표시한 fixture이며 자연 플레이 증거와 구분한다. 현행 PRO/INTRO 대사에는 `title:true`가 없어 인게임 타이틀 분기는 임시 QA 대사로 호출한다. MP4 안에 이미 합성된 로고는 PNG 경로 교체로 바뀌지 않으며 이번 수정 대상이 아니다. 과거 영상 제작·소스 추적·이식 영수증의 `logo_exoduser.png` 기록은 당시 원본 근거이므로 소급 치환하지 않는다.

Unity에는 같은 새 PNG를 사용하도록 기존 `ui-ultrawide-brief.md`에 전달한다. Unity 반영·Player·M1·바탕화면 검수 완료를 뜻하지 않는다. 이번 main 반영과 DEMO/EA 동기화·배포는 구분한다.

### 최종 결과

| 항목 | 확인값 |
|---|---|
| 실제 화면·1x/3x | 2해상도 × 6화면 × 전후 = 24캡처. 흰색·붉은색 배경 및 같은 크기 전후 비교 직접 검수 |
| 인장 관통 | 동일 core129,578픽셀에서 인장 on/off 비교. 1920: 33,818→0, 3840: 33,816→0. 수정 후 최대 채널 차이0 |
| 알파 | 새 바탕 core348,577픽셀의 반투명 구멍0, 기존 금속115,815픽셀 동일 |
| 겹침·실행 | 대상 로고/조작부 및 텍스트 겹침0, pageerror0. index/game/PNG HTTP와 디스크 SHA 일치 |
| 회귀·guard | 로비·시네마틱276/276, guard PASS, diff --check PASS |
| 시각 판정 | **PASS — 웹 PNG 로고 배경 분리 범위**. MP4·Unity·제품 전체 완료로 확대하지 않음 |

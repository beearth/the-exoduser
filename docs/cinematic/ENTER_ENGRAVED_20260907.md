# 흑백 판화형 진입 화면 — 2026-09-07

사용자 최신 지시: CSS 제목 대신 실제 이미지 생성 API를 사용한다. EXODUSER / HELL LORD를 로고 이미지로 만들고 아래 ENTER는 작은 버튼으로 유지한다. 원본 문 영상은 보존했다.

| 항목 | 현재 계약 |
|---|---|
| 연결 | `index.html` → `cin-enter-engraved.css?v=20260907-api-3` |
| 버튼 | `.cin-enter-btn`, type=button, aria-label="입장 / Enter", 리프 span에 ENTER |
| 배치 | 기존 contain 프레임 기준 left 51.7%, top 74%, translate(-50%,-50%) |
| 크기 | 210×64px, max-width 70%, 글자 clamp(15px,1.3vw,19px), 자간 .3em, weight 400 |
| 서체·색 | Cinzel / Georgia / serif, #d5d0c4, hover #fff4dc |
| 장식 | 위·아래 1px 선, 좌우 15%, 상하 3px, 회백색 알파 .55에서 투명 그라데이션 |
| 버튼 배경 | 타원형 검정 그라데이션 알파 .85 → .4(58%) → 0(74%), 맥동·확대 없음 |
| 암부 | `#cinClickPrompt::before`, radial 중심 51.7% 43%, 알파 .30(0%) / .43(28%) / .77(63%) / .96(100%) |
| 상하 보정 | linear 0deg, 검정 .8 → transparent 35% → transparent 75% → 검정 .3 |
| 전환 | 버튼과 암부 1.1s, 버튼 blur 12px·translate(-50%,-60%), 기존 1200ms 숨김 유지 |
| 접근성 | 네이티브 버튼의 포커스·Enter 지원, focus-visible 1px #d5d0c4 / offset 6px, reduced-motion 시 전이·블러·이동 없음 |
| 보존 | 영상·사운드·게임패드 핸들러 변경 없음. 이전 금속 이미지와 JS는 미사용 보존 |
| 테스트 | `tmp/test_enter_engraved.py`: 1440×900 클릭, 1920×1080 Enter, 900×900 클릭, 작은 네이티브 버튼 및 진입 전환 확인 |
| 키 입력 분기 | 기존 keyHandler가 기본 버튼 동작을 preventDefault하므로 Enter/Space에서 `_vidStarted=false`이면 onVidClick, 시작 후에는 기존 onSubSkip 호출 |

기존 인라인 이미지용 스타일보다 이 스타일시트의 선택자 우선순위가 높다. 금속 에셋 로더는 연결하지 않아 이미지 디코딩 후 재교체되지 않는다.

## EXODUSER / HELL LORD API 타이틀 (현재)

| 항목 | 값 |
|---|---|
| 생성 경로 | imagegen 스킬의 CLI/API 모드, OpenAI Images API, gpt-image-2, quality high, 1536×1024, 1장 |
| 원본·실제 적용 파일 | `output/imagegen/exoduser-hell-lord-logo-api-v1.png` |
| 전체 프롬프트 | `output/imagegen/exoduser-hell-lord-logo-v1.prompt.txt` |
| 프롬프트 요약 | 정확한 EXODUSER / HELL LORD, 커스텀 고딕 각인·마모된 은빛 금속·중앙 칼날 문양, 검정 배경, ENTER 제외 |
| 구조 | `.cin-game-title` h1 → `.cin-title-art` img, alt="EXODUSER — HELL LORD" |
| 배치 | contain 프레임 left 51.7%, top 37%, width 52%, translate(-50%,-50%) |
| 이미지 | display block, width 100%, height auto. 원본 비율 유지, 잘라내기 없음 |
| 합성 | `cin-logo-art.js?v=20260907-api-1`이 원본 로드 후 canvas에서 검정 매트를 한 번 투명화. light=max(R,G,B), alpha=round(255*clamp((light-8)/24,0,1)). RGB 유지, PNG data URL 디코딩 후 src 교체 |
| 준비 표시 | `.cin-title-art`는 visibility hidden, data-ready=true 후 visible. 검정 사각형이 로딩 중 노출되지 않음. 원본 PNG는 변경 없이 보존 |
| 가독성 | 제목 뒤 ::before, inset 0 -20%, 검정 타원 알파 .94 → .8(35%) → transparent(72%) |
| 입력·퇴장 | pointer-events none, 기존 1.1s 디졸브·reduced-motion 유지, ENTER 별도 버튼 유지 |
| 검증 | 기존 3개 화면 크기 테스트에 API 이미지 존재·로드·alt 및 ENTER 위 배치 확인 |

## CSS 타이틀 (과거 구현, 현재 미사용)

| 항목 | 값 |
|---|---|
| 구조 | `.cin-game-title` h1, `.cin-game-name` EXODUSER, `.cin-game-subtitle` HELL LORD |
| 위치 | contain 프레임 left 51.7%, top 43%, width 86%, translate(-50%,-50%) |
| 주제목 | Cinzel / Georgia / serif, clamp(36px,min(7.6vw,13vh),126px), weight 700, 자간·좌측 패딩 .055em, line-height 1.15 |
| 금속 명암 | 176deg: #f0eadb 8%, #a29d92 35%, #f0e8d7 46%, #77776f 50%, #bab5a6 72%, #6e6b63 100%. text clip, 폴백 #c8c3b6 |
| 그림자 | drop-shadow 0 2px 0 #171817, 0 5px 12px #000 |
| 제목 뒤 암부 | inset -85% -12%, radial 검정 .94 → .72(34%) → transparent(69%) |
| 부제 | clamp(13px,min(2vw,3.4vh),30px), weight 400, #b8a08a, 자간·좌측 패딩 .42em, line-height 1.3, 위 여백 18px |
| 부제 구분선 | gap 24px, width clamp(20px,6vw,92px), height 1px, transparent → #746150, 우측 180deg 반전 |
| 퇴장 | 1.1s opacity/filter/transform, opacity 0, blur 12px, translate(-50%,-54%). reduced-motion에서 전이·블러·이동 생략 |
| 입력 | 제목은 pointer-events:none. 기존 ENTER 클릭·Enter/Space·게임패드 처리 유지 |
| 번역 안전 | `_applyLobbyLang`의 광범위한 h1 → HELL 치환 제거. EXODUSER / HELL LORD 리프 노드 보존 |
| 검증 | 기존 3개 화면 크기 테스트에 제목 문구 및 ENTER 위 배치 검증 추가 |

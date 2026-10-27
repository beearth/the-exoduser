# 흑백 판화형 진입 화면 — 2026-09-07

사용자 최신 지시: CSS 제목 대신 실제 이미지 생성 API를 사용한다. EXODUSER / HELL LORD를 로고 이미지로 만들고 아래 ENTER는 작은 버튼으로 유지한다. 원본 문 영상은 보존했다.

| 항목 | 현재 계약 |
|---|---|
| 연결 | `index.html` → `cin-enter-engraved.css?v=20260907-enter-4`, `cin-logo-art.js?v=20260907-enter-2` |
| 버튼 | `.cin-enter-btn`, type=button, aria-label="입장 / Enter", `.cin-enter-art` 이미지. span ENTER는 로딩·실패 시 폴백 |
| 배치 | 기존 contain 프레임 기준 left 53.3%, top 80%, translate(-50%,-50%). 문양과 타이틀이 겹치지 않도록 하단 공간 확보 |
| 크기 | width clamp(180px,16vw,240px), max-width 70%, height auto, aspect-ratio 3/2. 폴백 글자 clamp(15px,1.3vw,19px), 자간 .3em, weight 400 |
| 서체·색 | Cinzel / Georgia / serif, #d5d0c4, hover #fff4dc |
| 장식 | `output/imagegen/enter-gothic-api-v1.png`: 마모된 은빛 곡선 조각·청동빛 홈·고딕 테두리와 ENTER 각인. 기존 CSS 선·마름모 제거 |
| 생성 | imagegen 스킬 CLI/API 모드, OpenAI Images API, gpt-image-2, high, 1536×1024, 1장. 전체 프롬프트 `output/imagegen/enter-gothic-api-v1.prompt.txt` |
| 로드 | 공용 cin-logo-art.js에서 제목·ENTER 모두 검정 매트 투명화. light=max(R,G,B), alpha=round(255*clamp((light-8)/24,0,1)). 원본 파일 보존 |
| 준비 | 이미지 data-ready=true 후 visible, 부모 data-art-ready=true 후 폴백 span 숨김. 폴백은 absolute left/top 50%, translate(-50%,-50%) |
| 버튼 배경·점멸 | 타원형 검정 그라데이션 알파 .85 → .4(58%) → 0(74%). cinEnterBreathe 2.6s ease-in-out infinite, opacity .45 → 1 → .45. 확대 없음 |
| 점멸 예외 | hover·focus-visible에서는 animation none, opacity 1. dissolve에서는 animation none, opacity 0. reduced-motion에서는 animation none |
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
| 배치 | contain 프레임 left 53.3%, top 37%, width 52%, translate(-50%,-50%). 사용자 스크린샷 중앙 정렬 요청으로 로고·ENTER를 오른쪽 1.8%p 이동한 뒤, 추가 요청으로 왼쪽 0.2%p 미세 조정 |
| 이미지 | display block, width 100%, height auto. 원본 비율 유지, 잘라내기 없음 |
| 합성 | `cin-logo-art.js?v=20260907-enter-2`가 제목·ENTER 각각 원본 로드 후 canvas에서 검정 매트를 한 번 투명화. light=max(R,G,B), alpha=round(255*clamp((light-8)/24,0,1)). RGB 유지, PNG data URL 디코딩 후 src 교체 |
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

## 2026-10-27 개정 — 첫 화면 재디자인(안 C 지옥왕의 관)

사용자 "간판인데 너무 구리다" → 디자인총괄 재디자인, 사용자가 후보 C를 선택. 위 표 중 아래 항목이 바뀐다(나머지 계약 유지).

| 항목 | 이전 | 현재 |
|---|---|---|
| 연결 | `cin-enter-engraved.css?v=20260907-enter-4` + `cin-logo-art.js` | `cin-enter-engraved.css?v=20261027-title-c`만. `cin-logo-art.js` 로드 제거(파일은 미참조 보존) |
| 타이틀 이미지 | `output/imagegen/exoduser-hell-lord-logo-api-v1.png`(RGB 검정판, 런타임 키잉) | `img/logo_exoduser.png`(안 C, 1551×740 RGBA). 로비·게이트·인트로 컷과 같은 파일 |
| 타이틀 배치 | left 53.3% top 37% width 52% | left 53.3% top 23% width 46%(프레임 기준, 1920×1080에서 852×406 @ x595 y45 — 문 아치 위쪽 여백·위 1/3) |
| 타이틀 뒤 | 검정 타원판(알파 .94) | 진홍 후광 radial `#b0281c` 알파 .14→.07→0, 아래 drop-shadow 검정(3px/.75 + 16px 20px/.85) |
| 문 감광 | 비네트만 | `.cin-hell-frame::before` 위→아래 검정 .62→.5(22%)→.2(40%)→0(56%) + 전체 균일 .14 + 가장자리 radial(53% 55%, 투명 42%→.22). ENTER 주변은 mask `radial-gradient(ellipse 17% 14% at 53.3% 80%,transparent 35%,#000 100%)`로 비워 이전 밝기 유지 |
| 문 틈 | 없음 | `.cin-hell-frame::after` left 53.2% top 0 width 6.8% height 100%. 코어 가로 49.3→50→50.7% `#b0281c` 알파 .22(약 1.5px) + 넓은 번짐 알파 .04/.08/.04. 세로 마스크(프레임 %) 0~37 투명·41~50 켜짐·53~69 투명(잠금쇠 철판 y≈570~750)·71.5~75 켜짐·79↑ 투명. 로고 부제 아래 y≈410 위는 지움. dissolve 시 같이 사라짐(1.1s). 1x에서는 약하게 보이는 것이 의도(넓은 어둠+작은 밝음, 붉은 빛은 로고가 맡음) |
| ENTER 이미지 | `enter-gothic-api-v1.png`(RGB 은빛, 런타임 키잉) | `output/imagegen/enter-gothic-v2-brass.png`(RGBA 1536×1024). 오프라인 키잉 alpha=clamp((max(r,g,b)-8)/24)+binary_closing 2회로 어두운 홈 구멍 메움, 색 램프 어두운 면 `#5a4426` → 빛면 `#c9a46a`(감마 1.35, 중성 회색·흰 없음) |
| 폴백 span | 로딩·실패 시 노출 | 항상 visibility:hidden(이미지는 처음부터 보임, 런타임 게이트 `data-ready`·`data-art-ready` 폐기) |
| 펄스 | cinEnterBreathe 2.6s, opacity .45↔1 | cinEnterBreathe 3s, opacity .74↔1 + 진홍 drop-shadow 7px/.16 ↔ 14px/.34 (진폭 약 절반) |
| hover | 흰 밝기 | brightness 1.1 + 진홍 drop-shadow 10px/.5 |
| 버전 보존 | — | 해골 로고 `img/logo_exoduser_v1_skull.png` 보존 |

캡처·후보·목업: `E:/exoduser-wt/_out/title-logo-redesign/`(Git 밖). 로비 로고(`.lobby-brand-logo`)는 `.lobby-divider` 안에서 object-fit:contain이라 비율이 2.40→2.10이 되어, 높이 104px에서는 폭이 250→218px로 작아져 HELL LORD가 안 읽혔다. `index.html` 507행 divider 높이를 148px로 키워 1920·1600 모두 폭 310px(310×148)로 한다(max-height:760px 이하 규칙은 그대로). 캐릭터 문구·찜 블록과 겹침 없음(캐릭터 없는 상태 캡처). **미검증: 캐릭터 목록이 있는 로비 화면(로그인 필요)** — 추정 콘텐츠 높이 약 711px(900 높이에서 여유 약 190px, 761 높이에서 약 50px).

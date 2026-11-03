# FDG P2-007a — Godot UI 마감 3건: 원본 글꼴 · 검기 색/합성 · 인트로 키 가이드 4컷 (2026-10-20)

클라우드 세션 cloud-ui-polish, 브랜치 `claude/p2-007a-ui-polish`(main `af9a59f` 기준). 원본 근거는 저장소 루트 `game.html`(읽기 전용, 65,692줄) 현재 행 번호와 `parry-lesson.css`·`ui-foundation.css`·`ui-refinement.css`.
실행 환경: 공식 Godot 4.7.2 Linux 빌드(SHA512 `9aa00f7a…ed54c65`, 릴리스 `SHA512-SUMS.txt` 대조 일치), `--headless --import` 1회(+자산 추가 후 1회), 격리 사용자 폴더 `EXODUSER-P2007A-Isolated-20261020`(override.cfg는 실행 때만 만들고 매번 삭제 — 커밋 없음).

## 결과 요약

| 항목 | 결과 |
|---|---|
| A 글꼴 | Nanum Myeongjo(400/700/800)·Cinzel(가변 wght)·Cinzel Decorative(700/900)를 google/fonts 공식 저장소에서 받아 OFL·METADATA와 함께 `godot/assets/fonts/ofl/`에 보관. 단일 공급자 `scripts/native_ui_fonts.gd`가 원본 CSS 스택 순서(1순위=base_font, 이후=fallbacks)와 @import 로드 굵기 매칭(CSS Fonts 4 §5.2)을 그대로 재현. HUD·레슨·펫 자막·미니맵 화폐·키 가이드에 적용. Noto Serif KR은 `--font-hell` 2순위 폴백으로 유지 |
| B 검기 | 구 청백 `ki_slash_radiant_sheet`+3타 hue150 → 원본 2026-10-11 "실버+블랙": `ki_slash_silver_sheet.png`/`ki_slash_hit_silver_sheet.png`(바이트 복사), 색 변환 폐지, 검은 잉크 층(일반 합성) 추가, 명중광 VFX 알파 규칙. **웹 Canvas2D 원본 함수로 그린 PNG와 픽셀 평균 절대차 0.04~0.23/255** |
| C 키 가이드 | `#introKeys` 4컷 패널을 원본 텍스트·레이아웃 그대로 이식(이미지 요소는 원본에 없음), 클릭/Enter/Space 진행·Esc·Space 2초 홀드·Tab 포커스·voice_wakeup. **웹 Chromium 1920×1080 실측과 패널 높이·요소 위치 ±0.1px, 글자 잉크 ±2px** |
| 결함 수정(발견) | 가이드 중 Space를 플레이어 `_unhandled_input`이 먼저 소비해 진행·홀드가 막히던 문제 → 원본 캡처 단계 리스너처럼 `_input`+`set_input_as_handled` |
| 테스트 | 신규 `test_p2007a_ui_polish` **115/0**(헤드리스) · **115/0**(xvfb 실 디스플레이, 실제 GUI 클릭 경로). 회귀 7종 기준선과 동일 통과 |
| 화면 캡처 | **가능** — xvfb + Mesa llvmpipe(OpenGL, gl_compatibility)로 실제 렌더 캡처. 웹 원본도 Playwright Chromium으로 같은 해상도 캡처해 1x 대조 |

## A. 원본 글꼴

### A-1 받은 파일 (google/fonts `main`, raw.githubusercontent.com — OFL)
| 원본 경로 | 보관 경로 | SHA-256 |
|---|---|---|
| ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf | assets/fonts/ofl/nanummyeongjo/ (동명) | 7ed9e8653a8ed04285d51dc343ffea6eb3d9c73afc27383ea8929ee4ffd03205 |
| ofl/nanummyeongjo/NanumMyeongjo-Bold.ttf | 〃 | bc9ed8e60d93fe6db054b8fb988481b625f2eef8cb2317ad0e9834681b8fe3f3 |
| ofl/nanummyeongjo/NanumMyeongjo-ExtraBold.ttf | 〃 | 60c0077fce069ba90ae97c0a3679f6eb3712e0ca637bdd0c15b72d335ec46db7 |
| ofl/cinzel/Cinzel[wght].ttf | assets/fonts/ofl/cinzel/**Cinzel-VariableFont_wght.ttf**(대괄호만 개명, 바이트 동일) | f4d83d34d1f6c741193e4acf4b3dff9531e5a67b6aa65228d00a7db72a4e0f34 |
| ofl/cinzeldecorative/CinzelDecorative-Bold.ttf | assets/fonts/ofl/cinzeldecorative/ | e854e68a388aa50d742a4415c1ae5c17a617ef7956c95a70021d0a4a44f20518 |
| ofl/cinzeldecorative/CinzelDecorative-Black.ttf | 〃 | a6c1eb3e228f639a98aafd8a8e8a035582dd50ad5f8a84e9dcbc8664e7457114 |
| OFL.txt (nanummyeongjo / cinzel / cinzeldecorative) | 각 폴더 | 8eb1c1019fe7fe6d0b6e7d7bbbba1d9cbdd969d8c5f26455708f6cfb8a77284c / f2b3029aba64c378bf0963b62945eee15e564fe4330b934c8f2eb058282b5e83 / 1e5d6660366ddcfca4f2fc10e2acfba9fa4d97d40aec80d7dbfd41d730a420ae |
| METADATA.pb (같은 3폴더) | 각 폴더 | 9b5fb78c… / 86d647e7… / bafa57b7… (원본 가족·굵기·소스 커밋 기록) |

Regular(Cinzel Decorative 400)는 game.html이 로드하지 않아(104: `Cinzel+Decorative:wght@700;900`) 받지 않았다. Gowun Batang(`--font-hell` 3순위)·Apple SD Gothic Neo·Black Han Sans는 범위 밖 — 스택 기록에 `absent`로 남긴다(가짜 대체 금지).
import 설정은 기존 NotoSerifKR-VF와 동일(.import 비교). **잔여:** export 프리셋 include_filter는 `*.json`뿐이라 OFL.txt가 배포 묶음에 자동 포함되지 않는다 — 출시 패키징 담당 확인 필요.

### A-2 원본 토큰·굵기 (game.html)
| 행 | 원문 |
|---|---|
| 103 | `@import Black+Han+Sans & Noto+Sans+KR:wght@400;500;700;900` |
| 104 | `@import Cinzel:wght@700;900 & Cinzel+Decorative:wght@700;900 & … & Nanum+Myeongjo:wght@400;700;800 & Gowun+Batang:wght@400;700 & Noto+Serif+KR:wght@400;600;700;900` |
| 115 | `--font:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif` (body 139) |
| 117 | `--font-hell:'Nanum Myeongjo','Noto Serif KR','Gowun Batang',serif` |
| 118 | `--font-hell-title:'Cinzel Decorative','Nanum Myeongjo','Noto Serif KR',serif` |

굵기 매칭: 로드 굵기 집합에 대해 CSS Fonts 4 §5.2 그대로(`native_ui_fonts.match_weight`). 예) `'Cinzel'` 400 요청 → 700 face(브라우저도 동일 — 700/900만 로드), Nanum 900 → 800, Nanum 600 → 700, Noto Serif KR 500 → 400.
줄높이 normal: Chromium(Blink) = round(asc)+round(desc)+round(lineGap)(1순위 글꼴 hhea). 번들 TTF에서 직접 읽은 hhea를 `HHEA` 표로 보관 — 실측 일치: Cinzel 12px→16, Cinzel Decorative 28→37, Nanum 13.6→17, Noto Sans KR 16→24.

### A-3 요소별 근거 표 (Godot 적용처)
| Godot 요소 | 원본 요소·CSS 행 | 원본 font-family | Godot 체인(보유분, 순서) | 굵기 |
|---|---|---|---|---|
| HUD 목표 패널 레벨/경험치/처치/악의(hud.gd `_native_hud_label`) | `#mmLvl` 372 | var(--font-hell) | Nanum Myeongjo → Noto Serif KR | 라벨 400, 레벨 값 700(.objective-rank 374)→Bold |
| HUD 스테이지 타이머 | `#stageClock` 364 / `#stageTimerHud` 366 | 'Cinzel',var(--font-hell) | Cinzel → Nanum → Noto Serif KR | 400(미지정)→Cinzel 700 face. 기존 700 하드코딩 → CSS 값 400으로 정정(결과 face 동일) |
| 미니맵 화폐 ✦ SP / ◇ CP | `#hudCorner` 327 | 'Cinzel',var(--font-hell) | Cinzel → Nanum → Noto Serif KR | 400→700 face. ✦(U+2726)는 번들 4종 모두 미보유 → 엔진 시스템 폴백(웹도 총칭 serif 폴백) |
| 스킬 슬롯 쿨다운 초 | `_skCdSweep` 44147 인라인(font-weight:900, family 상속=body) | var(--font) | Noto Sans KR | 900. 기존 명조 700 → 원본 산세리프 900 정정 |
| 레슨 패널 전체(제목·행·힌트·버튼 등) | parry-lesson.css 12/38/42/56 | var(--font-hell,…) | Nanum → Noto Serif KR | 실측 굵기 그대로 |
| 레슨 키캡 | parry-lesson.css 23 `.lesson-key` | 'Cinzel',serif | Cinzel → (총칭 serif 대리) Noto Serif KR | 400(원문)→Cinzel 700 face. 기존 "대체 글꼴 보정 700" 근사 제거 |
| 펫 자막 | `#petSubtitle` 2587 인라인 / `#petBubbleTxt` 700 | **'Malgun Gothic',sans-serif** | 시스템에 Malgun Gothic 있으면 그것(SystemFont), 없으면 총칭 sans-serif 대리 Noto Sans KR | 700. **기존 명조(Noto Serif KR)는 원본과 달랐음** — Malgun Gothic은 MS 소유라 재배포 불가 |
| 키 가이드 진행 "1 / 4" | `#ikProgress` 631 | 'Cinzel',serif | Cinzel → Noto Serif KR(serif 대리) | 400→700 |
| 키 가이드 대사·제목 | `#introTextKr` 613 / `#ikTitle` 621 | var(--font-hell-title) | Cinzel Decorative → Nanum → Noto Serif KR | 700 |
| 키 가이드 키 열 | `#ikBody span` 623 | 'Cinzel',var(--font-hell) | Cinzel → Nanum → Noto Serif KR | 400→700 |
| 키 가이드 설명·힌트 | `#ikBody` 622 / `#ikHint` 624 | var(--font-hell) | Nanum → Noto Serif KR | 400 |
| 키 가이드 노트·버튼 | `#ikNote`·버튼(font:inherit) — 상속 body | var(--font) | Noto Sans KR | 400 |

"총칭 serif/sans-serif 대리"는 한글이 총칭 글꼴로 떨어지는 두 스택(`'Cinzel',serif`, 펫 자막)에서만 붙인다(웹 Windows는 바탕/맑은고딕류 시스템 글꼴 — 같은 계열 번들 대리, 스택 메타에 `generic_proxy:` 로 기록). 그 외 스택의 총칭 자리는 엔진 시스템 폴백.

### A-4 공용/타 담당 파일 변경 줄 (최소)
- `native_parry_lesson_flow.gd`(P2-001l 소유 — **폰트 참조만**): 40행 `FONT_PATH`(→ NanumMyeongjo-Regular), `_weighted_font` 본문(→ 공용 공급자 `stack("hell", w)`), 600~601행 키캡(굵기 인자 700→400 + `'Cinzel',serif` 덮어쓰기 1줄), 684행 건너뛰기 버튼 폰트(`_font`→`_weighted_font(400)`), 811행 unported 문구. 다른 로직·입력 무변경. `var _font_bold`는 미사용으로 남김(줄 최소화).
- `hud.gd`(공용): 폰트 함수 교체(`_native_serif` 제거, `_native_hud_label`에 `font_stack` 인자) + 호출 4곳 인자 + unported 문구 2곳. 레이아웃·색·P3-003 훅 위치 무변경.
- `native_pets.gd`(P2-004b는 대사 테이블 소유): 자막 라벨 폰트 3줄.
- `player.gd`(공용): 2줄 — 차지 미리보기 시트 경로·hue(B).

### A-5 발견했지만 범위 밖(후속 후보)
- `#stageClock`은 ui-refinement.css 1316~1318이 opacity .9·글자 .75rem·색 rgba(240,226,197,.92)·패딩/상단선으로 재정의하나 포트는 game.html 기본값(.57·.68rem·rgba(215,207,189,.78)) — **뒤쪽 CSS 미반영**. `#mmLvl`도 1310~1315(min-width 216, 글자 1rem/.79rem 등) 재정의 확인 필요.
- HUD 라벨의 letter-spacing(예: `#stageTimerHud` .14em/.18em, `#hudCorner` .05em) 미적용 — 공급자는 소수 px 자간을 그리는 쪽(`CssText`)에서 처리하는 방식을 마련했으므로 HUD에도 같은 방식 적용 가능.
- `#mmLvl` `font-variant-numeric:tabular-nums` — Nanum Myeongjo에 tnum 기능 없음(무영향 추정, 미검증).

## B. 기검참(kiSlash) 색·합성

### B-1 원본 추적
| 행 | 내용 |
|---|---|
| 16739~16753 | `_kiSlashRadiant` = `assets/vfx/ki_slash_silver_sheet.png`(1254², 3×3). 2026-10-11 "실버+블랙": `_kiSlashPalette(c){return 0}`(16743), `_kiSlashTintSurfaces` 색 변환 폐지(16744, 동일 참조 3개), `_kiSlashShadowSurface`(16745~16751): `blur(max(2,round(w/260))px)`=5px → 픽셀 l=max(r,g,b)·a/255 → a=min(255,l·2.4), rgb=(5,4,6) |
| 19205~19230 `_drawRadiantKiSlash` | ① 잉크 층: GPU면 `_setBlend(false)`, source-over, alpha×.9, 1.14배 ② 잔상 2장(n=2,1: alpha×.08/.18, .9배, trail[(th−2n+5)%5]) ③ 글로우 1.08배 alpha×(3타 .3 / 그 외 .18) ④ 본체 1배 — ②~④ `'lighter'` |
| 19197~19203 `_drawKiSlashFrame` | GPU 경로: ONE/ONE + RGB를 opacity로 premultiply(쿼드 정점색 alpha×4) — Canvas2D `'lighter'`와 같은 가산 |
| 6028 | GL 프록시 `globalCompositeOperation` set = no-op → 가산/일반 전환은 `_setBlend`(5846: ONE,ONE / SRC_ALPHA,ONE_MINUS_SRC_ALPHA). renderCrescents 19267~19272가 GPU면 `_setBlend(true)` — 결과는 Canvas2D와 동일한 가산 |
| 19360~19384 | 명중광 `ki_slash_hit_silver_sheet.png`(2×2·4f, blend 'lighter'), `_kiHitShadowImg` 잉크(같은 함수), `_drawKiHitShadows`: alpha .85·(1−fr·.18), 1.14배, fr=⌊age/3⌋ — `_playKiSlashHit`만 잉크 동반(16846 풀차지 섬광 `ki_slash_hit_2`는 잉크 없음) |
| 54577~54620 | VFX 풀: `_vAlpha=1−(frame/maxFrames)·.3`, 'lighter' |
| 19242~19262 `_drawKiSlashCharge` | 차지 미리보기 `surfaces[2]` = 같은 실버(색 변환 없음) |

### B-2 Godot 반영
| 파일 | 변경 |
|---|---|
| assets/vfx/ki_slash_silver_sheet.png · ki_slash_hit_silver_sheet.png | 저장소 `assets/vfx/` 원본 바이트 복사(cmp 동일). 구 radiant 시트는 삭제하지 않음(패키지 테스트 RUNTIME_ART 목록 유지) |
| assets/vfx/ki_slash_ink.gdshader (신규) | `_kiSlashShadowSurface` 재현: 가우시안 σ=5px(11×11 탭) 블러의 premultiplied max(RGB)·2.4 → alpha, rgb(5,4,6)/255, `blend_mix`(일반 합성) |
| crescent.gd | SHEET→실버, `_palette=0` 고정(구 3타 2·실버테일 1 분기 제거), 칼날 4층 hue 0, 잉크 스프라이트를 칼날보다 먼저(아래) 추가: 1.14배·alpha=칼날 opacity×.9·같은 프레임. 칼날 가산 셰이더(radiant.gdshader blend_add)는 유지 — 원본 가산과 동일 |
| hit_effect.gd | SHEET→실버 명중, hue 0, 잉크 층(`with_ink`=crescent 명중만, 풀차지 섬광 제외), 가산 스프라이트 alpha `1−f/4·.3` 추가(54584 — 기존 누락) |
| player.gd | 차지 미리보기 시트→실버, hue 150→0 (2줄) |
| native_perspective_view.gd | 기본 실행(`--fdg-native-perspective-first`)의 3D 미러가 잉크 스프라이트를 지면 평면·일반 합성(spatial `blend_mix`, render_priority −1 = 칼날 아래)으로 그리도록 분기 추가(없으면 세운 빌보드로 잘못 보임) |

### B-3 대조(웹 원본 함수 vs Godot, 800² #303030, 같은 위치·진행도)
웹: Playwright Chromium에서 원본 `_drawRadiantKiSlash`/명중 코드(19370~·54618)를 별도 캔버스에 직접 호출. Godot: `tests/visual_p2007a_kislash_compare.gd`(xvfb 실 렌더).
| 케이스 | 채널 평균 절대차(0~255) |
|---|---|
| 1타 진행 .3 | 0.11 |
| 3타 풀차지(×2.2) 진행 .3 / .7 | 0.23 / 0.21 |
| 명중 1타 f0 / 3타 풀차지 f2 | 0.04 / 0.06 |
1타 작은 크기에서 가장자리 239px만 >30 차이 — Chrome 축소 보간과 Godot 무밉맵 선형 보간 차(원본 GPU 경로도 무밉맵 업로드라 같은 계열). 실게임 캡처(2D·원근)에서도 은빛 칼날+검은 테두리 확인.

## C. 인트로 키 가이드 4컷 (`#introKeys`)

### C-1 원본
- HTML 3174~3190, CSS 607~640(재정의 627~640 "Four-cut wake-up + controls"; ui-foundation/ui-refinement 등 뒤쪽 CSS에 `#introKeys`/`#ik*`/`.intro-key-*` 재정의 없음 — 전수 grep).
- 문구: `_INTRO_LINES` 63209, `_INTRO_KEY_STEPS` 63295~63300, 키 표기 `_introGuideKeys` 63310(= BINDS 기본값 6188 + `keyName(code,true)` 6279~6306), 조립 `_renderIntroGuide` 63311~63329(`#introTextEn`은 ''), 힌트 63325(textContent의 4칸 공백은 렌더 시 1칸으로 접힘).
- 동작: 63357~63407 — keydown 캡처 단계 전부 가로채기, Tab=포커스 전환, Esc=스킵, Enter/Space=포커스가 건너뛰기면 스킵·아니면 진행(250ms 스로틀), Space 누름=홀드 시작·2초면 스킵(건너뛰기 버튼 배경 진행 바, 인라인 background라 버튼 바탕색은 투명), keyup Space/창 blur=홀드 취소, 패널 클릭=진행, 버튼 클릭 stopPropagation, 시작 시 `#ikNext.focus()`(문서 내 포인터 조작 전이라 :focus-visible 테두리 — 웹 실측), voice_wakeup `sfx/voice/voice_wakeup.mp3`(10192) 가이드 진행 중일 때만 재생, 끝나면 opacity .4s 페이드 아웃(63345).

### C-2 Godot 구현
- 신규 `scripts/native_intro_key_guide_panel.gd`: 표시·클릭·음성 소유. 진행 판정은 기존 `native_intro_curtain_sequence.gd`가 계속 소유(250ms 스로틀 등). 커튼과 같은 HUD 부모에 커튼 다음 자식으로 붙어 z50>45.
- 텍스트는 `CssText`(TextParagraph 글리프 직접 그리기): Godot Label은 첫 줄 상승값에 폴백 글꼴(Noto Serif KR) 메트릭을 섞어 CSS 기준선과 3~4px 어긋남을 실측 → 1순위 hhea 기반 CSS 줄 상자·기준선으로 직접 배치. letter-spacing은 소수 px 그대로(FontVariation 자간은 정수뿐이라 .544px→1px 반올림 시 힌트가 30px 길어짐을 실측), 줄바꿈용 가상 글리프 제외.
- 레이아웃 상수는 1920×1080(포트 viewport, --ui-scale 1) CSS 계산값: 패널 720폭(min(720, 100vw−96)), padding 20/12, 키 열 minmax(160,38%)=264.48 + gap 20, 행 margin 9(제목 14·노트 16·힌트 20과 마진 상쇄 반영), 버튼 min-width 120·padding 10/20.
- 시퀀스 변경: 패널 생성/표시/숨김 호출, `_input` 단계 키 처리(keydown 전부·keyup은 Space만 가로챔), Space 홀드·Tab·포커스 기반 Enter, 창 포커스 아웃 시 홀드 취소, 스냅샷 `guide_panel`.
- 음성: `assets/sfx/voice/voice_wakeup.mp3` 원본 바이트 복사. main의 원본 샘플 버스(`read_native_attack_audio_settings` 준비 시)로 gain=min(1,1·sfxVol), rate×(0.92+rand·.16)(12366). 준비 전이면 가이드 중 재시도, 가이드 종료 시 폐기(원본 play 가드).
- 번역 목록: 새로 Godot 화면에 나오는 원본 문구를 `docs/16번역·로컬라이제이션/번역대상_전체목록.md` No.3312~3337에 등록.

### C-3 웹 대조 (Chromium 1920×1080, 원본 `_startIntroGuide()` 직접 호출)
| 컷 | 웹 패널 높이 | Godot | 비고 |
|---|---|---|---|
| 1 | 452.92 | 452.96 | 행 top 207/250.31/293.63 동일, 버튼 120×46 동일 |
| 2 | 496.23 | 496.28 | |
| 3 | 539.55 | 539.60 | |
| 4 | 490.92 | 490.96 | 노트 343.96·힌트 385.96·버튼 424.96(웹 343.92/385.92/424.92) |
글자 잉크 상자(픽셀): 진행·대사·제목·키·설명·버튼 ±2px. 힌트 오른쪽 끝만 +10px(13.6px→14px 정수 반올림). 1x 나란히 비교 캡처로 같은 화면임을 눈으로 확인.

### C-4 미이식/근사 (스냅샷 `not_rendered`/`unported`에도 기록)
- 게임패드 표기·A/Start 폴링(63394~63399) — 패드 입력 owner 미이식(데이터·표기 분기는 보유).
- 언어 전환(_L 영어) — 포트 언어 설정 owner 부재(EN 데이터 보유, 기본 한국어).
- text-shadow 블러(8/6/3px)·#introTextKr 붉은 글로우 — 오프셋 그림자만.
- 소수 px 글자 크기 → 정수 반올림. `#introKeys::before` 줄무늬(유효 알파 0.4% — 8bit 1단계 미만) 생략.

## 검증

| 테스트 | 결과 | 기준선(변경 전) |
|---|---|---|
| test_p2007a_ui_polish (신규, git add -f) | 115/0 헤드리스 · 115/0 xvfb(실제 GUI 클릭) | — |
| test_p2002a_hud | 36/0 | 36/0 |
| test_p2002b_minimap_corner | 16/0 | 16/0 |
| test_p2001i_boot_intro | 18/0 | 18/0 |
| test_p2001k_lesson_practice | 32/0 | 32/0 |
| test_p2004a_pets | 17/0 | 17/0 |
| test_p1002g_kislash_hurte | 214/0 | 214/0 |
| test_contracts | 5 PASS / 0 | 5 PASS / 0 |
| (참고) test_windows_native_package | 3 PASS / `packaged_icu_data` FAIL | `res://icudt_godot.dat`(에디터 생성 ICU 데이터) 체크아웃 부재 — 이번 변경 무관 환경 실패. 런타임 자산 목록 케이스는 PASS |

신규 테스트 그룹: ① 원본 game.html을 직접 읽어 `--font`/`--font-hell`/`--font-hell-title` 순서·@import 굵기·요소별 원문 대조 + 굵기 매칭 + 번들/OFL + 줄높이 실측값 ② 실제 Main의 HUD·펫·레슨·가이드 노드 폰트 체인 ③ 실제 디스패치 기검참의 시트·hue·잉크(순서·1.14·×.9)·명중 알파·차지·원근 미러 ④ 4컷 문구(원본 조립 결과)·웹 실측 레이아웃·클릭/Enter/Space 진행·Space 2초 스킵·종료 페이드 ⑤ Tab→Enter 스킵·Space 탭 홀드 취소·버튼 클릭 신호.
헤드리스에선 Godot GUI가 마우스를 라우팅하지 않음(hover null·push_input 미도달 실측) → 클릭은 같은 이벤트를 핸들러에 직접 전달하고 `click_route`로 기록, xvfb 실행에서 실제 GUI 라우팅으로 같은 단정 통과.

## 화면 캡처 (실제 렌더)
- Godot: `tests/visual_p2007a_capture.gd`(인트로 4컷·Tab 포커스·홀드 50%·커튼 후 HUD·레슨·펫 자막 2종·기검참 1/3타·원근 3타), `tests/visual_p2007a_kislash_compare.gd`. 실행: `xvfb-run -s "-screen 0 1920x1080x24" godot --path . --resolution 1920x1080 --script res://tests/<파일> -- --out=<폴더>`(격리 userdir 필요). 렌더러 `llvmpipe (LLVM 20.1.2) / Mesa / X11`.
- 웹: Playwright Chromium(1920×1080, dpr 1) + 로컬 `server.cjs`, Google Fonts 로드 확인(Cinzel 700, Cinzel Decorative 700/900, Nanum Myeongjo 400/700, Noto Sans KR 400/700/900).
- 캡처 PNG는 커밋하지 않았다(세션 임시 폴더). 1x 판정: 가이드 4컷·버튼·포커스·홀드·펫 자막·HUD 화폐/타이머·레슨 키캡 모두 Hell Gothic 톤(뼈색 문자·금빛 헤어라인·흑철 바탕) 유지, 이모지 없음.

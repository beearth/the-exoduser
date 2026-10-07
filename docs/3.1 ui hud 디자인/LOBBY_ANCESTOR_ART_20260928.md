# 로비 전대 원화 교체 — 2026-09-28

> 2026-09-29 현행: **미선택 기본 화면은 선대 소환체 · 묘왕 바르칸**, 캐릭터 카드 선택 후에는 해당 CHAR_VISUALS의 원화/아이들 영상과 이름·직업을 표시한다. 데모도 자동 선택 없이 시작하며 카드 클릭 후 입장을 활성화한다. 선택 해제 시 전대 화면으로 복귀한다. 아래 2026-09-28 제작·검수는 당시 이력이며, 현재 선택 표시 규칙은 [기본 전대 / 선택 캐릭터 전환 SSOT](<../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md>)를 우선한다.

## 2026-09-29 기본 전대 / 선택 캐릭터 전환 — 현행 SSOT

| id / 적용 위치 | 현행 계약 |
|---|---|
| LOBBY_DEFAULT / _updateCharDisplay() | 미선택: 묘왕 바르칸 / Varkan, the Tomb King; 선대 소환체 / ANCESTRAL SUMMON; 플레이어가 소환하는 선대의 영체 / A spirit summoned by the player. 전대·그림자·독립 배경 표시, 캐릭터 src/poster/onerror 해제, 입장 disabled=true |
| LOBBY_SELECTED / _updateCharDisplay(s) | CHAR_VISUALS[s.charIdx ?? 0], 잘못된 인덱스는0으로 폴백. #lobby.has-selected-character로 전대·그림자·ambient video 숨김. 선택 캐릭터 이름과 _TL(job 또는 cls) 표시, 소환체 상세 설명은 빈 리프. 입장 disabled=false |
| DEMO_SELECTION / _renderSlotList | 최초 미선택, active 카드 없음. 클릭/선택 버튼으로 _selectedSlot/_selectedSlotName=demo, active 추가 및 charIdx0 선택. 내부 DEMO CHARACTER는 화면에서 대검전사 / Greatsword Warrior. 재렌더는 기존 선택만 유지, 자동 선택 없음 |
| SELECTED_MEDIA | idleVid 재생, idleRate 없으면1. 전사 assets/charselect/idle_warrior_cs3_4k.mp4?v=20260929-cs3, playbackRate0.75; poster_idle_warrior_cs3_4k.jpg 같은 버전 (2026-09-29 CS3.0 재생성, 아래 §전사 아이들 재생성 참조; 구 idle_warrior_higgsfield_4k.* 파일은 미참조로 보존). 실버테일 idle_silvertail.mp4 및 poster_idle_silvertail.jpg, 버전20260927-restored. 공개 comingSoon/생성 제한 변경 없음 |
| SELECTED_STILL | 정적 이미지 poster → portrait → bust. 영상 실패/재생 거절은 캐릭터의 동일 정적 이미지 유지 및 영상 src/poster 해제. 정적 이미지 실패는 같은 캐릭터 portrait 또는 bust, 이것도 실패하면 이미지 숨김; 컨트롤/이름/배경 유지 |
| MEDIA_LIFECYCLE | 다른 외형/해제 시 이전 콜백·src/poster 제거 및 pause/load. 이전 실패 콜백은 현재 onerror 함수와 같을 때만 동작. 같은 외형의 이름/언어 갱신은 재로드/재생 시간 초기화 없음 |
| ANCESTOR_LIFECYCLE / lobby-ancestor-sprite.js | visible = !document.hidden && lobby display≠none && getClientRects.length>0; active=visible && !has-selected-character. 선택 중 전대 rAF 취소 및 ambient video.pause. 선택 영상도 숨김/모션 감소 시 pause; 모션 감소는 정적 이미지, 해제 시 영상 재개 |
| BACKGROUND | 기본 v2 crypt 포스터/독립 영상 유지. 선택 외형에 scene이 있으면 같은 캐릭터 배경 원화로 교체; 해제 시 _swapLobbyBg(0)로 crypt 복원. 새 이미지 생성/게임 전대 에셋 변경 없음 |
| SELECTED_LAYOUT / lobby-ancestor-art.css | 원래 전체 화면 구도 복원: inset0, width100%, height100%, object-fit:cover, object-position:center center, transform:none, mask-image:none. 원본 종횡비 유지, 창 비율이 다르면 cover의 가장자리 크롭만 적용. 65%/55% 패널 축소·강제 aspect-ratio·마스크 제거. 정적 이미지 z-index1, 영상2; 선택 상태의 좌·우 UI3으로 이름/카드/입장 버튼을 원화 위에 표시. **초광폭 예외**: `@media(min-aspect-ratio:17/9)`에서 object-fit:contain, object-position:left center, mask-image 우측 페이드(원화 폭 `100vh*16/9`의 마지막 12vh를 투명으로) — 21:9/32:9에서 cover가 16:9 원화를 최대 2배 확대해 머리가 잘리던 문제 수정 |
| SELECTED_CAPTION | .lobby-left 내부 중앙 left50%(뷰포트 기준32.5%, 화면폭≤1100px는27.5%); bottom3% 기존 유지. 전대 배치 함수는 선택 중 이름 좌표를 덮어쓰지 않음. charDispDetail:empty 숨김 |
| CACHE | lobby-ancestor-art.css query20260929-slotart3 (초광폭 예외 추가), lobby-ancestor-sprite.js query20260929-slotart2. 기존 미디어 버전/스프라이트96셀·24fps·셀384×624 변경 없음 |
| SAVE / INPUT | hellsave_demo 등 저장 형식/진행/사용자 원문 보존. 기존 버튼·키보드·패드 선택 경로 유지. 기본 상태에서 입장 전에 카드를 선택 |
| VALIDATION | 관련 회귀306 PASS, inline script4개 구문 통과. 실제 브라우저의 최종 화면 크기/모션 감소/폴백 검수는 아래 완료 기록 참조 |



## 2026-09-29 전사 아이들 재생성 + 초광폭 크롭 수정

| 항목 | 값 / 근거 |
|---|---|
| 발단 | 사용자 5119×1439(≈32:9) 모니터 F11 전체화면에서 선택 원화가 크게 확대되고 머리가 잘림. 원인=SELECTED_LAYOUT의 object-fit:cover가 16:9 원화를 가로에 맞춰 약2배 확대 |
| CSS 수정 | lobby-ancestor-art.css `@media(min-aspect-ratio:17/9)` contain+좌측정렬+우측 페이드. 16:9 이하는 기존 cover 전체화면 유지 |
| 원화 | Higgsfield GPT Image 2.5 **sunburst** (사용자 직접 생성, job 90882b0d), 레퍼런스=구 poster_idle_warrior_higgsfield_4k.jpg, 3456×2048(27:16). 같은 구도·디자인 유지, 고해상 재묘사 |
| 영상 모델 | Higgsfield **Cinema Studio Video 3.0** (최상위, 4K), 16:9, 8초, 오디오 off, start_image=end_image=원화(루프). job 3c17b51e. 원본 HEVC 3840×2160 24fps 33Mbps |
| 비교 폐기 (Kling) | Kling 3.0 4K mode(job 695db6a0, 48크레딧): H.264 3740×2216(원화 27:16 유지) 3.8Mbps, 루프 SSIM 0.983(최고)이나 1:1 얼굴·갑옷 비교에서 CS3 대비 뚜렷이 흐리고 대비 약함 → CS3 유지 |
| 비교 폐기 | Seedance 2.0 4K high bitrate(job 2259e692) — 카메라 고정·품질 양호했으나 루프 이음매 SSIM 0.848 < CS3 0.864로 CS3 채택. 21:9 flare 후보 2장(5315dc4a/76711264)은 sunburst 원화로 대체되어 미사용 |
| 인코딩 | NW.js Chromium HEVC 재생 불확실 → libx264 High@5.1, yuv420p, 18M VBR(max24M), +faststart, 무음. 결과 idle_warrior_cs3_4k.mp4 14.1MB, 8.04s |
| 포스터 | poster_idle_warrior_cs3_4k.jpg = 영상 0프레임(q2) → 영상 로딩 전/실패 시 동일 구도 |
| 루프 | 첫/끝 프레임 SSIM 0.864, 프레임0 vs 96 구도·스케일 동일(카메라 무이동) |
| 재생 속도 | idleRate 0.75 기존값 유지 (8.04s → 체감 10.7s) |
| 브라우저 검수 | Edge(Playwright) 1920×1080: cover, rect 0,0,1920,1080 / 3440×1440·5120×1440: contain·0% 50%, readyState4, videoWidth3840. 5120×1440에서 전신 표시+배경 페이드, 1920×1080 기존 전체화면 유지 육안 확인 |
| 크레딧 | 이미지 flare 4.25 + Seedance 176 + CS3 192 (sunburst 원화는 사용자 생성) |

## 2026-09-29 사용자 정정 — 선택 원화 전체 화면 비율 복원

| 항목 | 현행 값 / 검수 |
|---|---|
| 원인·수정 | 선택 원화를65%/작은 창55% 왼쪽 패널 안에 contain으로 축소하여 종전 전체 화면 구도를 바꿈. 전체 viewport100%×100%/cover/중앙 배치로 복원, 원본 비율 보존 |
| 실제 화면 | 1920×1080 / 1280×720 / 960×540 / 2160×720에서 선택 영상 DOM rect x0/y0/width=innerWidth/height=innerHeight 및 objectFit=cover 확인. 기본 전대→카드 선택→대검전사 전환 및 입장 활성 유지. 좌·우 UI가 영상보다 높은 z-index, 카드/입장/언어 버튼의 elementFromPoint 도달 확인; 1920×1080·960×540 캡처 육안 검수 |
| 상태 검증 | 언어·정적 폴백·선택 해제·숨김·모션 감소·실버테일 매핑 검수 유지, pageerror0/API 쓰기0. 같은 원본3840×2160 재생, AI 생성/리샘플링 없음 |
| 증거 | tmp/lobby-selected-art-20260929/full-ratio-fixed-browser.json 및 full-ratio-fixed-{1920x1080,1280x720,960x540,2160x720}-warrior.png. 아래 final-*는 패널 축소 상태의 이전 검수 이력 |

## 2026-09-29 선택 전환 검수 이력 (전체 화면 정정 이전)

| 검수 | 결과 / 증거 |
|---|---|
| 재현 | 수정 전 카드 클릭 후에도 묘왕 바르칸/소환 표제/전대 스프라이트 유지. 42개 재현·관련 검사 중33 PASS/9 FAIL → 수정 후 관련 전체306 PASS. inline script4개 구문 통과 |
| 실제 데모 | Node server.cjs의 새 Chrome 페이지, 1920×1080 / 1280×720 / 960×540 / 2160×720. 기본 전대/미선택/입장 비활성, 카드 선택 후 대검전사/전사/기존4K 영상/입장 활성. 각 크기 횡넘침0 및 선택 이름의 왼쪽 패널 중앙 오차<1px |
| 상태 수명 | 선택 중 전대 프레임 고정/crypt 영상 pause 및 캐릭터 영상 시간 증가. EN 전환 후 Greatsword Warrior / Warrior와 재생 시간 유지. 로비 숨김 pause/표시 재개 및 reduced-motion에서 영상 정지·정적 이미지 확인 |
| 전환·폴백 | 기존 실버테일 charIdx1 매핑으로 이름/직업/이미지 전환, 전사 영상 요청 차단 시 같은 전사 포스터 유지. 선택 해제 시 src/poster·정적 원화 해제 및 전대 복귀. 실버테일은 격리 페이지의 함수 호출 검수이며 공개 생성 잠금 유지 |
| 저장·오류 | 격리 브라우저에서 API 쓰기0/pageerror0. 슬롯 GET은 격리 대역; 사용자 실제 저장/계정 쓰기 없음. 공개 데모 표시 흐름 검수이며 실제 온라인 인증·실물 패드·NW.js 재패키징은 미검증 |
| 증거 | tmp/lobby-selected-art-20260929/final-browser.json, final-{1920x1080,1280x720,960x540,2160x720}-{default,warrior}.png, final-silvertail.png, final-fallback.png, tests.txt. 수정 전 파일/스테이징 원문은 before/ 보존 |

## 2026-09-28 게시 계약: 독립 배경 영상과 묘왕 바르칸 애니메이션 (제작 이력)

누적 게시 스냅샷에는 아래 후속 구현이 포함된다. 아래의 정적 어깨 대검 원화 배율 및 과거 검수는 이전 제작 이력이다.

| 항목 | 현행 코드값 |
|---|---|
| 표시 이름 | `_lobbyAncestorName`: 한국어 묘왕 바르칸 / 그 외 Varkan, the Tomb King. `_lobbyAncestorCaption`: 선대 소환체 / ANCESTRAL SUMMON. 미선택에만 이 이름 표시; 선택 시 저장 이름/데모 대검전사와 CHAR_VISUALS 직업으로 전환 (2026-09-29 갱신) |
| 배경 | `assets/lobby/lobby_varkan_crypt_loop_v2.mp4`, muted/autoplay/loop/playsinline, preload metadata. 포스터 `lobby_varkan_crypt_poster_v2.webp`; cover, center 75%, `_curBg=varkan-crypt-v2` |
| 스프라이트 | `lobby-ancestor-sprite.js`, defer. `assets/lobby/varkan_idle_v3.png`: 셀384×624, 8열×12행, 96프레임, 24fps/4초. frame=floor(max(0,seconds)×24)%96 |
| 기준점 | baseline603.682092555332, heartX182.43863179074447. canvas384×624. 배경 기준1920×1088; 좌측 폭65%, 화면폭1100px 이하55% |
| 배치 | scale=max(width/bgWidth,height/bgHeight); footY=min(height×0.89,max(height×0.76,bgHeight×scale×0.84+(height−bgHeight×scale)×0.75)); displayHeight=min(height×0.8,footY−28); displayWidth=displayHeight×384/624. footX=max(displayWidth×0.52+12,min(leftWidth−displayWidth×0.48−12,bgWidth×scale×0.33+(width−bgWidth×scale)×0.5)); left=footX−heartX/384×displayWidth; top=footY−baseline/624×displayHeight |
| 그림자 | footX/footY 위치, 너비displayWidth×0.42, 높이displayHeight×0.045, translate(−50%,−50%) |
| 재생 수명 | 미선택 로비 표시 중이며 document.hidden이 아닐 때만 rAF 및 배경 재생. 선택/숨김/비표시 때 rAF 취소 및 video.pause. ResizeObserver로 배치 갱신 |
| 최초 언어 갱신 | `_refreshLobbyCardsLanguage()`는 `$` 초기화 전에도 호출되므로 `document.getElementById('charList')` 사용. 카드가 없으면 반환하며 기존 카드 리프/접근성 라벨만 갱신. 초기 TDZ 오류 회귀 검사 및 새 페이지 로그인/로비 진입 확인 |
| 접근성/폴백 | reduced-motion 시 배경 숨김·일시정지 및 frame0. 스프라이트 실패 시 CSS `varkan_idle_first_v3.png` 유지; 배경 영상 실패 시 영상 숨기고 포스터 유지 |
| 배포 | 공통 FILES에 `lobby-ancestor-art.css`와 `lobby-ancestor-sprite.js`; 로컬 미디어는 assets 복사. HTML 루트 CSS/JS 참조 회귀 검사로 누락 방지 |

## 현행 v3 — 화면에서 보이는 대기 호흡

| 항목 | 현행 값 |
|---|---|
| 원인 | v2는 천1.2px·핵±4%뿐이고 상체가 정지해 작은 창에서 대기 동작이 보이지 않음. v1의 생성 변형은 재사용하지 않음 |
| 모션 | 4초 연속 주기의 상체 상승0~4px, 갈비뼈 영역 가로 팽창3.5%, 유물 좌우±3px, 붉은 천 좌우±6px, 핵 밝기±10%. 발 영역 y562~623 고정. 검·가면·견갑은 함께 움직여 형태와 어깨 지지 유지 |
| 보간/주기 | 96셀/24fps, premultiplied alpha bilinear. 정현파·smoothstep만 사용, 프레임별 생성 변형 없음 |
| 배경 | v2의 바닥/구조물 고정 영상 유지. 스프라이트 및 CSS/JS 캐시는20260928-idle3 |
| 검수 | 1920×1080/960×540/2160×720의 실제 재생에서 상체 상승 확인, 발 픽셀 고정, 설명 유지. 숨김/reduced-motion 확인. 관련 회귀13개 통과. 증거 captures/ancestor_grok_review/idle-v3/ |

## 이전 v2 안정화와 설명 검수

| 항목 | 현행 값 |
|---|---|
| 소환체 설명 | `_lobbyAncestorDetail`: 플레이어가 소환하는 선대의 영체 / A spirit summoned by the player. `_lobbyDemoCharacterName`: 대검전사 / Greatsword Warrior. 소환체와 저장 슬롯의 역할을 분리 |
| 안정화 | 가면·검·몸통·발 고정. 붉은 천만 최대1.2px 수평 변위, 가슴핵 밝기±4%. 배경 y≥0.72 고정; 최종 영상290프레임의 하단 RGB 변화0 |
| 후속 v2 검수 | 1920×1080/2160×720/960×540 재생 및 배치 확인, 숨김·reduced-motion 확인, pageerror0. 관련 회귀57개 통과. varkan-lobby-runtime-report.json |

## 이전 정적 원화 제작 이력

사용자 당시 지시: 로비의 기존 이미지들을 새 전대 모습으로 교체한다. 이 문서는 종전의 미선택 3종 랜덤 배경 및 선택 캐릭터 아이들 영상/포스터 표시 계약을 대체한다. 캐릭터 생성 외형창과 전투 스프라이트는 별도 시스템이다.

| 항목 | 현행 값 / 적용 위치 |
|---|---|
| 원화 | `img/vfx_ancestor/ancestor_new_grok_shoulder_anchor_v4.png`, 1456×2912. Higgsfield Grok Image 2 job `a3ab54ce-61b8-42f8-9fb3-5100d4a58231`. 이미 생성한 승인 시안 사용; 이번 작업의 신규 AI 생성 없음 |
| 전대 특징 | 백색 세로 균열 가면, 세 묘비, 석관 견갑과 네 유물, 푸른 유골핵, 붉은 천, 오른쪽 어깨에 지지한 대검 |
| 전신 런타임 이미지 | `assets/lobby/lobby_ancestor_shoulder_v4.png`, 1355×2503 RGBA. 크로마 제거 후 전체 alpha bbox 바깥 32px 여백(원본 경계 안에서 제한), 종횡비 보존 |
| 슬롯 초상화 | `assets/lobby/lobby_ancestor_portrait_v4.webp`, 512×512 RGB. 원본 좌표 (470,390)~(1250,1170) 크롭을 Lanczos 축소, 바탕색 `#14161d`, quality94. 데모 카드 및 외형 초상화가 없는 슬롯의 폴백 |
| 전처리 | `tools/prepare-lobby-ancestor.py`. ex=G−max(R,B), alpha=clamp(1−(ex−22)/88,0,1); G=min(G,max(R,B)+8); alpha<0.02 픽셀 RGBA=0 |
| 로더 | `_preloadLobbyBgs`와 `_swapLobbyBg(stage)`가 같은 전신 PNG 1종을 사용. 버전 `20260928-shoulder-v4`, `_curBg='ancestor-shoulder-v4'`. stage·무작위 값에 따른 원화 교체 없음 |
| 선택 상태 | `_updateCharDisplay(s)`에서 전신 장면을 계속 표시. 기존 영상은 pause·src/poster 해제·load, 정적 캐릭터 장면 src도 해제, 이전 onerror 제거. 이름·직업 및 입장 버튼 활성/비활성은 기존 선택 상태를 사용 |
| 레이아웃 | 기존 좌우 구조와 DOM ID 유지. 좌측 장면 폭65%; 화면폭1100px 이하는55%. `lobby-ancestor-art.css`를 기존 UI CSS 뒤에 로드 |
| 빌드 | 2026-09-28 누적 게시 검수에서 공통 `build-nwjs.mjs` FILES 누락을 보완. 웹·NW 패키지에 `lobby-ancestor-art.css` 및 추가된 `lobby-ancestor-sprite.js` 포함, HTML/CSS/JS 참조 경로 유지. `assets/lobby/varkan_idle_v1.png`는 assets 디렉터리 복사로 포함 |
| 전신 배율 | 배경 크기 `auto calc(100% - 100px)`, 위치 center 24px. 높이600px 이하는 `auto calc(100% - 76px)`, 위치 center 14px. 이름은 bottom3%. 검·묘비·발끝 전체 표시 |
| 합성 | 원본 RGBA를 밝기 틴트 없이 normal 합성. 로비 바탕은 어두운 청회색 radial/linear gradient. 왼쪽 패널은 투명. 전신 아래는 0~12% 검정 페이드 |
| 실패 폴백 | 에셋 로딩 실패 시 어두운 그라디언트·이름·슬롯·입장 컨트롤 유지. 옛 전사 이미지/영상으로 되돌리지 않음 |
| 폐기된 로비 연결 | frost/flame/abyss 무작위 메인 배경, `lobby_bg_new.png` 우측 CSS 참조, `lobby_portrait.png` 폴백. 기존 파일은 로딩·기록 등 다른 사용처 보존을 위해 삭제하지 않으며 로비에서 요청하지 않음 |
| 다른 캐릭터 데이터 | 실제 외형별 슬롯 bust·portrait 및 이름·직업은 유지. 생성 외형창의 CHAR_VISUALS 영상·초상화는 이 로비 장면 교체의 대상이 아님 |
| 게임 전대 | `_ANC_SPRITE_POOL`, `_ANC_WALK_SHEET`, 강림·칼꽂기 시트는 이번 작업에서 변경하지 않음. 새 16프레임 보행의 게임 연결/특수 동작 교체는 아직 미완료 |

## 확인 결과

| 확인 | 결과 |
|---|---|
| 실제 사용자 Chrome 로비 | 새 어깨 대검 전신과 데모 슬롯 초상화 표시, 대검/묘비/발끝 잘림 없음 |
| Chromium 실제 페이지 1920×1080 / 1280×720 / 960×540 | 선택/해제 후 같은 전대 원화, 횡넘침 없음. 영상/옛 선택 장면 src 없음. 선택 시 입장 활성·해제 시 비활성 |
| 네트워크·오류 | 위 새 페이지에서 기존 lobby_bg/옛 초상화/캐릭터 idle 영상 요청0, pageerror0. API 쓰기는 테스트에서 차단 |
| 회귀 | `lobbyAncestorArt`, `lobbyCharacterSelectionInfo`, `lobbyStageInfo` 총10개 통과 |
| 이전 검사 정정 | `test/lobbySelectedScene.test.js`의 종전 선택 캐릭터 영상 계약을 현행 전대 원화 유지 계약으로 변경. 전대 이름·소환 표제/입장 상태, 이전 미디어·오류 콜백 제거, 재선택, 선택 해제를 검사 |
| 증거 | `captures/ancestor_grok_review/lobby-runtime-report.json`, `lobby-1920x1080.png`, `lobby-1280x720.png`, `lobby-960x540.png` |
| 범위 | 로비 표시 교체 완료. 새 보행의 게임 내 적용 완료를 뜻하지 않음 |


## 2026-09-28 로비 카드 언어 즉시 갱신·DOM 상태 보존

| id / 적용 위치 | 현행 계약 |
|---|---|
| _applyLobbyLang | 기존 _refreshStatusLanguage 다음에 _refreshLobbyCardsLanguage 호출. charList 안의 .char-item/.char-item-new에 등록한 _refreshLanguage 콜백만 실행. 목록 재조회·재렌더 없음 |
| 최초 적용 | _refreshLobbyCardsLanguage는 document.getElementById 사용. 초기 언어 적용은 const $ 초기화 전일 수 있으므로 $나 슬롯 상태를 읽지 않음. 리스트가 없으면 반환, 빈 카드/미등록 콜백은 건너뜀 |
| _addLobbyCardControl | label은 기존 문자열 또는 현재 언어를 계산하는 함수. card._refreshLanguage에서 label 함수 실행 후 .char-info 리프의 trim한 설명을 구분자 · 로 추가해 기존 button.char-select의 aria-label/title 동시 갱신. data-card-key·이벤트·DOM 노드 유지 |
| _lobbyCardLeaf | 지정한 카드 내부 셀렉터의 children.length===0일 때만 textContent 변경. 부모 컨테이너·이미지·하위 DOM 보존. 삭제 버튼은 title 속성만 갱신 |
| _lobbyCharacterCardLabel | 기존 CHAR_VISUALS 직업/클래스와 _formatLobbyStageProgress(stage,_TL) 재사용. .char-cls/.char-info/삭제 title 번역. 사용자 저장 이름, charIdx, 레벨, 스테이지 유지. 로컬 구분자 · /온라인 구분자 | 유지 |
| _lobbyDemoCardLabel | 표시 이름은 KO 대검전사 / 그 외 Greatsword Warrior. 초상화는 CHAR_VISUALS[0].bust. 소환체 이름·역할·영체 설명은 왼쪽 독립 표시. 기존 렌더에서 캡처한 진행으로 레벨·Stage 1-1·처치·브라우저 저장 안내 재번역. 초기 Lv.1 START · Stage 1-1 · Lv.100 Cap 유지. 언어 전환 중 세이브 다시 읽기/쓰기 없음 |
| _lobbyNewCardLabel | 새 캐릭터/슬롯 가득참 및 기존 최대 개수 안내 재번역. 기존 공개5개·개발 Infinity 제한 유지. 가득찬 비활성 카드도 콜백 등록하되 버튼/생성 이벤트를 새로 만들지 않음 |
| 상태 보존 | 같은 카드·선택 버튼·이미지·초점 유지. _selectedSlot/_selectedSlotName/_slotScrollIdx/_onlineScrollIdx/_characterLoadSeq 변경 없음. 번역 카탈로그 신규 키·전투/저장 형식 변경 없음 |
| 회귀 | test/lobbyCardLanguage.test.js 신규11건: 데모2·온라인/로컬2·생성/가득참3·중첩 노드2·초기 적용1·기존 문자열 호환1. 원본7실패/4통과→수정 후11통과. $ 없는 초기화 검사도 수정 전1실패/10통과. 관련 통합239건 및 inline script4개 구문 통과 |
| 실제 언어 검증 | 960×540/1920×1080에서29언어×데모1·로컬 생성가능/가득참2·온라인 생성가능/가득참2=290조합. 동일 카드/버튼/이미지·선택·스크롤·초점 보존 및 가로 넘침 없음, pageerror0. 생성/삭제 저장 요청0 |
| 상세 계약·증거 | [언어 런타임](../16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md)의 동명 절. 문서8개 동기화. Lv.46/처치1795 저장 원문 보존, 실제 언어 메뉴와 새 페이지 초기화 확인 |


## 2026-09-28 데모 카드 줄바꿈·입장 버튼 스크롤 분리

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 데모 진행 안내가 일반 카드의 한 줄 ellipsis에 묶여 1280×720에서도 잘림. 내용이 늘어나면 같은 스크롤 안의 입장 버튼도 아래로 밀림 |
| 데모 카드 | ui-refinement.css의 #lobby .char-item:has(>.char-select[data-card-key="demo"])에 height:auto/min-height:84px. .char-name/.char-info는 white-space:normal/overflow:visible/text-overflow:clip/overflow-wrap:anywhere. .char-info line-height:1.45. 카드 내용만큼 세로로 증가 |
| 일반 슬롯 | online:id/local:name/new 키는 위 선택자에 해당하지 않음. 기존 높이84px·진행 한 줄 말줄임·삭제 영역 유지. 이전 공통 한 줄/고정 높이 설명에서 데모는 이 절의 예외 |
| 입장 영역 | index.html의 .lobby-footer를 .lobby-content 뒤, #lobbyStatus 앞의 .lobby-right 직계 자식으로 이동. 기존 flex-shrink:0/padding-bottom:8px 사용. 입장 원화의 비율·점등·disabled·이벤트 유지. 목록/배너만 세로 스크롤하며 입장은 스크롤과 독립 |
| 캐시 | index.html의 ui-refinement.css?v=20260928-lobby-card-wrap. 기존 lobby-quit 캐시 다음 버전 |
| 언어·저장 | 기존 _refreshLanguage 리프 갱신·선택 제어·세이브 구조 유지. 격리 Lv.46/처치1795 저장 원문 보존 확인. CSS와 DOM 위치만 변경하며 사용자 저장/계정 요청 없음 |
| 브라우저 | 실제 Node 서버 데모 페이지:29언어×새 진행/저장 진행2×960×540,1280×720,1920×1080,2560×1080,800×480,640×480,480×360의7크기=406조합. 텍스트 범위 카드 안·가로 넘침 없음·입장 전체 화면 안/중앙 클릭 대상 유지·카드/버튼/이미지 동일 노드. pageerror0/쓰기 요청0 |
| 짧은 창 | 목록/배너 내용은 세로 스크롤이 필요할 수 있음. 960×540에서 실제 Steam 버튼까지 스크롤한 뒤 클릭 대상 확인, 입장 위치 동일. 실제 Tab으로 Steam→입장→시네마틱→전원 초점 순서 확인. 입장/종료/Steam 외부 동작 자체는 실행하지 않음 |
| 일반 슬롯 검증 | 격리 원본 HTML의 _LOBBY_BUILD만 full로 전환, API/슬롯 메타데이터 대역. 로컬/온라인×3크기960×540,1280×720,1920×1080=6조합에서 카드84px/nowrap 유지 및 입장 스크롤 독립. 인증·실제 저장 종단 검증은 아님 |
| 회귀 | 관련 기존105건 및 inline script4개 구문 통과. lobbyStageInfo의 오래된 formatter 호출수2 고정 검사를 온라인/로컬 렌더와 언어 갱신의3함수별 연결 검사로 보완. 원본104통과/1실패→105통과. CSS를 그대로 반복하는 신규 단위 테스트 없음 |
| 기록·커밋 | tmp/lobby-demo-card-layout/browser-before.json,browser-after.json,browser-full.json,browser-interaction.json,tests.txt,changes.patch. 기존 WindowsApps 런처 오류317 및 .git 쓰기 제한으로 커밋 미완료. 다른 작업의 에셋/맵/스테이징 보존 |


## 2026-09-28 짧은 창 Steam 배너·RTL 여백 마감

| 항목 | 현행 계약 |
|---|---|
| 짧은 창 | 높이≤600px는 배너 문장/.lobby-card-gap 숨김, 배너 내부padding0/gap0. 찜 버튼 최소높이44px/최대폭100%, 이미지 최대190px. 데모 카드 세로padding10px·최소높이84px. 높이≥601px는 기존 문장·간격 표시 |
| RTL·언어 | .lobby-content의 여백은 padding-inline-end8px. #lobbyWishlistBtn aria-label/title은 기존 번역키 STEAM 위시리스트 추가(id2841)로 즉시 갱신, 이미지 alt 빈값. 부모 DOM 교체·새 번역키·저장 형식 변경 없음 |
| 검증·캐시 | 실제29언어×진행2×화면9=522조합, 일반 슬롯 대역16조합, 기존105회귀/inline4구문 통과. 가로 이미지 잘림/페이지 오류/쓰기 요청0. CSS 캐시20260928-lobby-banner-compact2 |
| 상세 | [배너·논리 여백 현행 계약](lobby_full_patch.md). 기존 padding-right8px와 데모 카드 간격 설명은 이 절을 우선. 아주 작은480×360에서는 세로 스크롤 후 찜 버튼 접근. 동시 전대 아트·표제 변경 보존 |


## 2026-09-28 언어 메뉴 키 반복·IME 보호와 찜 버튼 초점선

| 항목 | 현행 계약 |
|---|---|
| 언어 메뉴 | 4개 select의 반복 열기와 팝업의 Enter/공백/Escape 반복 확정·취소 차단. isComposing/keyCode229 및 숨김·선택 노드 없는 메뉴는 처리하지 않음. 방향키 반복/Home/End/Tab·마우스·패드 경로 유지 |
| 찜 버튼 | #lobbyWishlistBtn도 기존 로비 focus-visible outline-offset−2px 적용. 공통2px/#ead6a5 테두리·버튼 크기·600px 배너 경계·언어·저장 계약 유지 |
| 검증 | 신규24건 원본19실패→통과, 관련167건/inline4구문 통과. 실제 키보드3크기·초점5크기 및 원본 패드 콜백 대역 확인. IME는 합성 이벤트/실물 패드·OS IME 검증 별도 |
| 상세 | [언어 키 입력·초점 현행 계약](../3.3%20키바인딩+설정/게임패드_호버_상호작용.md). 기존 언어 팝업 계약에 키 유지와 IME 보호 추가. 새 번역키/부모 DOM 교체/사용자 저장 요청 없음 |


## 2026-09-28 오른쪽 대검전사 캐릭터 정보 복구

| id / 적용 위치 | 현행 계약 |
|---|---|
| 의도 | 오른쪽은 실제 플레이어 캐릭터 정보를 보여 준다. 소환체 설명을 분리하며 임의로 붙였던 플레이어 기록 표제를 제거 |
| _lobbyDemoCharacterName / .char-name | 한국어 대검전사, 그 외 Greatsword Warrior. 기존 _lobbyPlayerRecordName 제거. 초기 렌더와 언어 갱신 모두 같은 함수 사용 |
| .char-thumb img | 고정 데모 charIdx0의 CHAR_VISUALS[0].bust, assets/charselect/portrait_warrior.png?v=1. 소환체 초상화를 이 카드에서 제거. width/height100%, object-fit:cover, object-position:center20%, radius2px 유지 |
| .char-info | 유효 hellsave_demo는 Lv.{lv} · Stage 1-1 · 처치 {kills} · 브라우저 저장. 언어별 처치/저장 안내 번역 유지. 저장 없으면 Lv.1 START · Stage 1-1 · Lv.100 Cap |
| 왼쪽 | 미선택은 선대 소환체 · 묘왕 바르칸 / 플레이어가 소환하는 선대의 영체 및 v3 스프라이트/v2 배경. 선택 후 해당 캐릭터 이미지/아이들 영상·이름·직업 표시 (2026-09-29 갱신) |
| 저장/선택 | hellsave_demo, 내부 DEMO CHARACTER, charIdx0 유지. _selectedSlot/_selectedSlotName=demo는 카드 선택 후 설정; 최초 null. 이름 변경으로 저장을 재작성하지 않음 |
| DOM/언어 | _lobbyCardLeaf는 특정 리프의 children.length===0만 갱신. 선택 제어/이미지 노드/초점 유지. 언어 전환 중 세이브 읽기/쓰기 없음 |
| 검증 | 기존 언어·데모 슬롯·소환체 회귀와 격리 브라우저의 신규/저장 진행, 한국어/영어, 새로고침 및3크기 확인. 상세 증거 captures/ancestor_grok_review/player-card/runtime-report.json |


---

## 2026-10-07 같은 후보의 정상 UI·필드 플레이 부분 관측 — ROOT-CH1-NORMAL-UI-PARTIAL-COVERAGE-20261007

기존 날짜별 단위 검수는 당시 이력으로 보존한다. 이번 절은 새 `normal01` 실제 로비/UI에서 시작한 부분 플레이 결과이며, 이전 class seed/bosstest/Canvas 조각 또는 과거 패키지 검사와 합산하지 않는다. 제품 코드는 변경하지 않았다. 이번 root 인수는 동일 source/context의 시작·전투/획득·일반 필드 사망/직접 retry 부분 coverage이며 `sameCandidateSixStageAccepted=false`를 유지한다.

root 소유의 실제 Chrome/context/page/maxLive 각 1개를 같은 세션으로 유지했다. 실제 UI에서 전사(class0)를 선택·생성하고 캐릭터 스토리 Escape 홀드, main 컷신 Escape, 안내 `건너뛰기`, `연습 건너뛰기`를 거쳤다. class seed·HP/시간/전투/해금/spawn/좌표 강제는 없었다. 로비가 만든 실제 URL은 `http://127.0.0.1:3387/game.html?test=1&slot=demo&demo=1&story=warrior-v21&classic=1&ch1Three=1&ch1Rig=1&webgpu=0`이다. 이는 fresh 비영속 context의 normal DEMO이며 durable 저장 경로 인수가 아니다.

| 실제 UI 관측 | 결과/경계 |
|---|---|
| 로비 → 새 캐릭터 → 전사(class0) → 생성 | 실제 selector 클릭/이름 입력의 trusted 이벤트 기록. localStorage class seed 없음 |
| 캐릭터 스토리 및 main 도입 | Escape 홀드와 기존 스킵 UI 사용; 강제 스토리 플래그/함수 호출 없음 |
| 안내/연습 | 실제 `건너뛰기`, `연습 건너뛰기` 버튼 클릭 뒤 main 진행 |
| 생성 후 플레이 | W 이동·필드 전투/사망/직접 retry/새 획득 부분 관측 |
| 실버테일/저장 | 공개 comingSoon 잠금 우회 없음. fresh DEMO 제품 저장은 서버 durable ACK 아님 |

기존 로비 원화/전사 영상/실버테일 격리 함수 검수는 당시 별도 이력으로 보존한다. 이번 새 UI Warrior 진행을 전체 캐릭터 생성/시각/모든 언어/영속 저장 인수로 확대하지 않는다.

완료 관측 JSON은 17개이며 명령 metadata 18번째 `close01`은 원문의 STARTED를 보존한다. 이를 17/18조건 PASS 또는 전체 clean suite로 계산하지 않는다. source5의 실제 HTTP 및 로컬 전후 핀은 정확했고 pageErrors0·httpErrors0·cleanup0·exit0이다. renderer/GL wrapping 및 getError 계측은 0이므로 GL 결과는 UNKNOWN이다. requestFailures는 별도로 12개다: 외부 폰트·supabase 명시 차단 `ERR_FAILED`7, 로컬 `ERR_ABORTED`5(스토리 영상1/lobby.mp3 1/intro.mp4 3). 로컬5는 skip/navigation과 함께 관측됐지만 개별 직접 원인은 UNKNOWN이며 전부 의도 차단으로 단정하지 않는다.

API synthetic 10회는 모두 `POST /api/mats`, forwarded0이다. `POST /api/save`는 0회였다. retry의 기존 dbSave 경로와 fresh context 제품 localStorage 저장, 서버의 durable ACK를 구분하며 실제 백엔드 영속 저장은 미인수다. root 명시 close 후 context/owned browser가 닫혔고 stdin EOF 뒤 PTY exit0도 확인됐다. 원문 scope의 `actualMainNormalDemoExpectedButNotYetObserved=true`는 준비 당시 라벨이며, 새 root 판정이 실제 관측을 따로 기록한다. 원문을 고쳐 실행 결과로 꾸미지 않았다.

보스방 개방/정상 진입·4지역 정화·보스전 사망/부활/재도전·해금된 필드 보존·전체 native6·실청취·durable save ACK는 계속 미인수다. root의 PNG6 직접 판독은 반복 회색 baked 평면 지면, 작고 어두운 몸과 큰 전투FX 겹침, retry 뒤 사망 fade/금빛FX 잔존을 확인했다. SW 희귀 획득 팝업은 식별되지만 몸 가독성은 여전히 혼잡하다. **VISUAL VERDICT: RETOUCH**.

현재 상세 근거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/root-partial-coverage/validation-receipt.json` (35791B / `627816f881f7fd6c5c981a503be792bbffa66430a7d38bd20ed68ff9841c6e4e`), `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/root-partial-coverage/visual-verdict.json` (3310B / `805409879cfa1bb2e301ab07be882fc0d361d2d3b624403ded60627eaaf1ce85`)이다. 완료 원문은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/run-normal01/`, session 영수증은 3509449B / `4de3f0bfab85d9a55665173fc4c6ebbe599ab67f37bd24f013a4d97b2a5e42db`이다. Git 정상 보존 사실은 같은 `root-partial-coverage/remote-preservation-receipt.json`의 commit/push/원격 정확 SHA로 확정하며 문서 자기 commit SHA를 순환 기입하지 않는다.

# 로비 전대 원화 교체 — 2026-09-28

> 2026-09-29 현행: **미선택 기본 화면은 선대 소환체 · 묘왕 바르칸**, 캐릭터 카드 선택 후에는 해당 CHAR_VISUALS의 원화/아이들 영상과 이름·직업을 표시한다. 데모도 자동 선택 없이 시작하며 카드 클릭 후 입장을 활성화한다. 선택 해제 시 전대 화면으로 복귀한다. 아래 2026-09-28 제작·검수는 당시 이력이며, 현재 선택 표시 규칙은 [기본 전대 / 선택 캐릭터 전환 SSOT](<../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md>)를 우선한다.

## 2026-09-29 기본 전대 / 선택 캐릭터 전환 — 현행 SSOT

| id / 적용 위치 | 현행 계약 |
|---|---|
| LOBBY_DEFAULT / _updateCharDisplay() | 미선택: 묘왕 바르칸 / Varkan, the Tomb King; 선대 소환체 / ANCESTRAL SUMMON; 플레이어가 소환하는 선대의 영체 / A spirit summoned by the player. 전대·그림자·독립 배경 표시, 캐릭터 src/poster/onerror 해제, 입장 disabled=true |
| LOBBY_SELECTED / _updateCharDisplay(s) | CHAR_VISUALS[s.charIdx ?? 0], 잘못된 인덱스는0으로 폴백. #lobby.has-selected-character로 전대·그림자·ambient video 숨김. 선택 캐릭터 이름과 _TL(job 또는 cls) 표시, 소환체 상세 설명은 빈 리프. 입장 disabled=false |
| DEMO_SELECTION / _renderSlotList | 최초 미선택, active 카드 없음. 클릭/선택 버튼으로 _selectedSlot/_selectedSlotName=demo, active 추가 및 charIdx0 선택. 내부 DEMO CHARACTER는 화면에서 대검전사 / Greatsword Warrior. 재렌더는 기존 선택만 유지, 자동 선택 없음 |
| SELECTED_MEDIA | idleVid 재생, idleRate 없으면1. 전사 assets/charselect/idle_warrior_higgsfield_4k.mp4?v=20260913-detail1, playbackRate0.75; poster_idle_warrior_higgsfield_4k.jpg 같은 버전. 실버테일 idle_silvertail.mp4 및 poster_idle_silvertail.jpg, 버전20260927-restored. 공개 comingSoon/생성 제한 변경 없음 |
| SELECTED_STILL | 정적 이미지 poster → portrait → bust. 영상 실패/재생 거절은 캐릭터의 동일 정적 이미지 유지 및 영상 src/poster 해제. 정적 이미지 실패는 같은 캐릭터 portrait 또는 bust, 이것도 실패하면 이미지 숨김; 컨트롤/이름/배경 유지 |
| MEDIA_LIFECYCLE | 다른 외형/해제 시 이전 콜백·src/poster 제거 및 pause/load. 이전 실패 콜백은 현재 onerror 함수와 같을 때만 동작. 같은 외형의 이름/언어 갱신은 재로드/재생 시간 초기화 없음 |
| ANCESTOR_LIFECYCLE / lobby-ancestor-sprite.js | visible = !document.hidden && lobby display≠none && getClientRects.length>0; active=visible && !has-selected-character. 선택 중 전대 rAF 취소 및 ambient video.pause. 선택 영상도 숨김/모션 감소 시 pause; 모션 감소는 정적 이미지, 해제 시 영상 재개 |
| BACKGROUND | 기본 v2 crypt 포스터/독립 영상 유지. 선택 외형에 scene이 있으면 같은 캐릭터 배경 원화로 교체; 해제 시 _swapLobbyBg(0)로 crypt 복원. 새 이미지 생성/게임 전대 에셋 변경 없음 |
| SELECTED_LAYOUT / lobby-ancestor-art.css | 선택 영상/정적 원화 폭65%, 화면폭≤1100px는55%; left0/top50%, height:auto/max-height100%, aspect-ratio16/9, object-fit:contain, translateY(-50%). mask-image linear-gradient: 0% transparent / 5% black / 96% black / 100% transparent. 캐릭터 z-index1, 영상2; 바탕 background-position:center |
| SELECTED_CAPTION | .lobby-left 내부 중앙 left50%(뷰포트 기준32.5%, 화면폭≤1100px는27.5%); bottom3% 기존 유지. 전대 배치 함수는 선택 중 이름 좌표를 덮어쓰지 않음. charDispDetail:empty 숨김 |
| CACHE | lobby-ancestor-art.css / lobby-ancestor-sprite.js query20260929-slotart1. 기존 미디어 버전/스프라이트96셀·24fps·셀384×624 변경 없음 |
| SAVE / INPUT | hellsave_demo 등 저장 형식/진행/사용자 원문 보존. 기존 버튼·키보드·패드 선택 경로 유지. 기본 상태에서 입장 전에 카드를 선택 |
| VALIDATION | 관련 회귀306 PASS, inline script4개 구문 통과. 실제 브라우저의 최종 화면 크기/모션 감소/폴백 검수는 아래 완료 기록 참조 |



## 2026-09-29 검수 완료

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

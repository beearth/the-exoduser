# 로비 전대 원화 교체 — 2026-09-28

## 현행 게시 계약: 독립 배경 영상과 묘왕 바르칸 애니메이션

누적 게시 스냅샷에는 아래 후속 구현이 포함된다. 아래의 정적 어깨 대검 원화 배율 및 과거 검수는 이전 제작 이력이다.

| 항목 | 현행 코드값 |
|---|---|
| 표시 이름 | `_lobbyAncestorName`: 한국어 묘왕 바르칸 / 그 외 Varkan, the Tomb King. `_lobbyAncestorCaption`: 전대 소환 / ANCESTRAL SUMMON. 선택 여부와 무관하게 이 이름 유지; 슬롯 선택은 입장 활성 상태에 반영 |
| 배경 | `assets/lobby/lobby_varkan_crypt_loop_v1.mp4`, muted/autoplay/loop/playsinline, preload metadata. 포스터 `lobby_varkan_crypt_poster_v1.webp`; cover, center 75%, `_curBg=varkan-crypt-v1` |
| 스프라이트 | `lobby-ancestor-sprite.js`, defer. `assets/lobby/varkan_idle_v1.png`: 셀384×624, 8열, 24프레임, 12fps. phase=floor(seconds×12)%46; phase<24면 phase, 그 외46−phase |
| 기준점 | baseline603.682092555332, heartX182.43863179074447. canvas384×624. 배경 기준1920×1088; 좌측 폭65%, 화면폭1100px 이하55% |
| 배치 | scale=max(width/bgWidth,height/bgHeight); footY=min(height×0.89,max(height×0.76,bgHeight×scale×0.84+(height−bgHeight×scale)×0.75)); displayHeight=min(height×0.8,footY−28); displayWidth=displayHeight×384/624. footX=max(displayWidth×0.52+12,min(leftWidth−displayWidth×0.48−12,bgWidth×scale×0.33+(width−bgWidth×scale)×0.5)); left=footX−heartX/384×displayWidth; top=footY−baseline/624×displayHeight |
| 그림자 | footX/footY 위치, 너비displayWidth×0.42, 높이displayHeight×0.045, translate(−50%,−50%) |
| 재생 수명 | 로비 표시 중이며 document.hidden이 아닐 때만 rAF 및 배경 재생. 숨김/비표시 때 rAF 취소 및 video.pause. ResizeObserver로 배치 갱신 |
| 접근성/폴백 | reduced-motion 시 배경 숨김·일시정지 및 frame0. 스프라이트 실패 시 CSS `varkan_idle_first_v1.png` 유지; 배경 영상 실패 시 영상 숨기고 포스터 유지 |
| 배포 | 공통 FILES에 `lobby-ancestor-art.css`와 `lobby-ancestor-sprite.js`; 로컬 미디어는 assets 복사. HTML 루트 CSS/JS 참조 회귀 검사로 누락 방지 |

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

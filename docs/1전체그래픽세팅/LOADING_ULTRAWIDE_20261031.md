# 로딩·대기 화면 초광폭 수정 — 2026-10-31

## 최종 보정 — 전체 35장 / 전체 화면 / 하단 오버레이

사용자의 `loading-ultrawide-brief.md` 마지막 보정 지시가 아래 최초안보다 우선한다. 새 브랜치 `codex/web-loading-final35-20261031`의 시작은 fetch한 `origin/main` `baabceeae25cccb35f149223d9d540bc0499063b`이며 시작 tracked INDEX/WORK는 비어 있었다.

직접 확인한 자료는 아래 목록 35장 원본 캔버스, 35회 내장 image_gen 생성 결과, 이전 실제 game.html 네 해상도 캡처다. 목표는 캐릭터·펫·로고 구도를 유지하고 배경을 끝까지 채우며 평평한 하단 검은 띠를 없애는 것이다. 생성된 캐릭터를 원본 대신 채택하지 않고 원본 전경 마스크를 복원한다. 사각 원본 패널을 합성한 4번의 접합 결함은 탈락시켜, 배경 위치/등비 크기 정렬과 전경 마스크 방식으로 전환했다. 보호 마스크의 불투명 픽셀은 원본 등비 리샘플 RGB와 무손실 WebP 디코드 RGB를 비교한다. 이 검사는 배경 전체가 원본 픽셀 그대로라는 뜻이 아니다.

| 항목 | 최종 구현 계약 |
|---|---|
| 대상 | 아래 최초안 목록의 모든 35장: 1~19.png와 rd1,rd2,rd4~rd10.png,rd11.jpg,rd12~rd17.png. 활성 랜덤 풀 19장·프리로드 후보 16장 구분 유지 |
| 공통 파일·캐시 | loading-art.js / loading-art.css, index.html·game.html 캐시 `20261031-final35` |
| 파일 선택 | viewport W/H > 2560/1080이면 `-32.webp`, >1920/1080이면 `-21.webp`, 그 이외 `-16.webp`. rd11.jpg도 확장자 제거 후 같은 규칙 |
| 32판 | `img/lording/wide/{id}-32.webp`, 35개, 3840×1080 |
| 21판 | 같은 폴더 `{id}-21.webp`, 35개, 2560×1080 |
| 16판 | 같은 폴더 `{id}-16.webp`, 35개, 1920×1200. 1920×1080에서는 추가 배경 위/아래 각60px만 화면 밖이며 원본 전경은 중앙1080px 안에 배치. 2560×1600에서는 전체 등비 표시 |
| 원본·배경 | 원본 파일 byte 유지, 신규 105개 무손실 WebP. 원본 인물/펫/로고 마스크 복원, 새 배경은 장면별 내장 생성. 생성 배경의 정렬은 등비 변환, 이미지 가로 늘이기 없음 |
| 화면 채움 | `.loading-art` inset0, `.loading-expanded` 성공 시 전면 생성 캔버스 cover. 위 네 해상도에서 원본 전경 영역은 가시 범위 안, 배경만 화면 비율에 맞춰 잘림. 정상 성공 시 블러 backdrop 숨김 |
| 실패 폴백 | 실제 확장판 네트워크 실패 시에만 원본 contain + 같은 원본 blur24px/brightness .28. 최신 요청 ticket/state 확인 후 적용하고 resize마다 선택 |
| 게임 상태 오버레이 | 그림 전체 높이 유지. 하단 최소높이 clamp(150px,22vh,300px), padding 위 clamp(44px,7vh,96px) / 좌우24px / 아래 clamp(18px,3vh,44px), gap8px. 배경 rgba(5,5,6,0) → .32(35%) → .78 그라데이션, 상단 경계선 없음 |
| 제목 | `var(--font-hell-title,'Nanum Myeongjo',serif)`, 400 clamp(16px,2.1vh,26px)/1.5, 뼈색 #e6dfce, 자간 .12em |
| 층 정보·팁 | `var(--font-hell,'Nanum Myeongjo',serif)`, 층 정보400 clamp(11px,1.35vh,17px)/1.4 #c0b8a6, 팁400 clamp(11px,1.25vh,16px)/1.4 #b2a996 |
| 진행 선 | min(32vh,80vw) 폭·1px 높이, 바탕 rgba(176,145,82,.28), 금빛 #c7a76b, 광택 rgba(199,167,107,.4). 진행률·종료 콜백 유지 |
| 로비 gate | 기존 로고 contain, 그림 inset0. 동일 투명 시작 그라데이션·뼈색·본문 font-hell 오버레이, 최소높이 clamp(150px,22vh,300px), padding 위 clamp(44px,7vh,96px)/좌우26px/아래 clamp(24px,4vh,56px) |
| 접근성·DOM | 기존 status/aria-live, reduced-motion, 최신 요청 경쟁 보호. 부모 textContent 교체 없음 |

### 생성·검수 자료

내장 `image_gen` 기본 35회와 보정 2회 성공, 보정 1회 도구 거부. 외부 유료 서비스·직접 API 사용 없음. 기본 생성 파일은 Codex generated_images에 보존하고 프로젝트 파일은 위 wide 폴더에 둔다. 입력/생성/master/전후 화면/영수증은 `I:/EXODUSER-Storage/web-loading/20261031-final35/`에 보존한다. `final-selected-map.json`은 최종 35개 개별 배경 파일과 id를 연결한다. 공통 생성 지시: 회색 캔버스의 빈 영역을 같은 장면의 건축·지면·하늘·안개·색·조명으로 이어 그리기, 중앙 원본의 위치/크기/전체 구도 유지, DESIGN LOCK 인물·펫 재생성/추가 금지, 새 영역은 배경만, 늘이기·거울 반복·블러·검정 띠·문자 추가 금지. 1은 보라색 성채, 2는 대장간, 3은 석주/사슬을 구체화했고 나머지 각 원본을 독립 편집 입력으로 사용했다. rd15는 중복 인물을 제거한 빈 배경 위에 원본 전경을 복원했다. rd5는 직접 접합 보정 요청이 도구에 거부되어 인물 없는 회색 암석·안개 배경을 별도 생성하고 원본 중앙을 192px 경계 feather로 보존했다. 결과 전경과 보정 배경의 최종 채택 SHA256·규격은 `img/lording/wide/manifest.json`을 따른다.

재현 도구 `tools/check-loading-wide.mjs`는 실제 game.html 로딩 DOM의 35장×4해상도 140화면과 로비4화면, 네트워크 실패, 최신 요청, resize를 확인한다. 검수에서만 로딩 DOM을 최상단으로 유지하며 자연 플레이·Unity 검수와 구분한다. 최종 상태는 아래 최종 보정 영수증 절에 기록한다.

### 최종 보정 검수·인계 영수증

| 범위 | 결과 | 근거 |
|---|---|---|
| 기본·보정 배경 | 35장·105개, 원본35개 byte 무변경, 모든 보호 마스크 RGB 일치 | img/lording/wide/manifest.json, asset-receipt.json |
| 실제 game.html | 네 해상도×35장 140화면. 그림 폭·높이 채움, 전경 가시 영역, 정상 블러 숨김, 투명 시작 그라데이션, 평평한 상단 경계0, 금빛1px, 텍스트 폭 넘침0 | verified/receipt.json |
| 로비·동적 처리 | 로비4화면 표시/닫기, 실패 시 원본 contain 복귀, 최신 요청·resize, pageerror0 | verified/receipt.json |
| 실제 시각 확인 | 전체35장 보드, 70개 경계1x 스트립, 원본 동일 크기 비교, 실제 네 해상도 캡처. 4번 사각 합성·rd15 중복·rd5 접합은 수정 후 최종 비교 | review/, before/와 verified/ |
| 코드·보호 | 관련회귀5/5, project-check105/105, guard PASS. guard가 쓴 baseline은 검사본을 외부에 보존하고 시작 원본 byte 복원 | 검수 로그 |
| 패키지 | 공통 JS/CSS2개·105이미지 모두 웹 런타임 manifest 포함, 누락0 | packaging.json |
| 원격·Unity | 경로 지정 커밋 뒤 최신 main 정상 통합·비강제 push와 ref 대조. Unity 추가 계약은 기존 ui-ultrawide-brief.md 끝에 전달하며 실제 Unity 실행은 별도 | remote-receipt.json, REPORT.md |

VISUAL VERDICT: PASS — 위 네 해상도의 최종 로딩 화면·전체35장 배경 채움·전경 구도·하단 오버레이 범위. 생성 결과의 사각 패널 합성/인물 중복/수직 접합 실패를 그대로 채택하지 않았다. 웹 전체 게임·자연 플레이·Unity·NW.js 실행·Steam/웹 배포 판정은 포함하지 않는다. 최신 main 통합 이후 최종 확인은 REPORT.md와 별도 영수증을 따른다.

## 최초안 이력 — 아래 표시 계약과 PASS는 최종 보정 이전 기록

아래 3장 생성·32장 폴백·하단 별도 영역·은빛3px 선은 최초안 이력이며 현행 계약으로 적용하지 않는다. 현재는 위 전체35장·105파일·전체 높이·금빛1px 오버레이 계약을 따른다.

## 범위와 제작 기준

사용자 브리프: I:/EXODUSER-Storage/codex-takeover/loading-ultrawide-brief.md. 담당 작업본 G:/exoduser-wt/codex-web-loading, 시작 source/origin main 513d14fb46a8ccb6679c05b512bc1c6bb4d9bfa3. tracked INDEX/WORK는 시작 시 깨끗했다. 기존 작업본·실행기·사용자 세이브는 보존했다.

직접 본 레퍼런스는 현행 1.png(네메시아),2.png(핵터),3.png(디로이) 원본과 수정 전 실제 game.html 3840×1080 로딩 화면이다. 기존 구도·LOCK 인물을 유지하고 배경만 확장한다. 기존 cover가 핵터 원본을 화면 높이 1080px에 대해 2161.15px로 렌더해 세로 1081.15px를 잘랐다. 목표는 머리·꼬리·주인공 전체 구도 보존과 로딩 문구 비중첩이다. 중앙 인물 변경·눈에 띄는 접합·늘어짐·원본 잘림은 탈락 조건이다.

## 사용 이미지 전수 목록

| 파일(img/lording/) | 원본 규격 | 실제 사용 | 표시 |
|---|---|---|---|
| 1.png | 1672×941 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 + 생성 21:9·32:9 |
| 2.png | 1672×941 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 + 생성 21:9·32:9 |
| 3.png | 2048×1152 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 + 생성 21:9·32:9 |
| 4.png | 2170×725 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 5.png | 5119×1439 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 6.png | 5119×1439 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 7.png | 5119×1439 | 게임 부트·스테이지 전환·로비 대기 배경 / 난이도 카드 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 8.png | 5119×1439 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 9.png | 5119×1439 | 게임 부트·스테이지 전환·로비 대기 배경 / 난이도 카드 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 10.png | 2170×725 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 11.png | 2172×724 | 게임 부트·스테이지 전환·로비 대기 배경 / 난이도 카드 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 12.png | 5119×1439 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 13.png | 2170×725 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 14.png | 2171×724 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 15.png | 2170×725 | 게임 부트·스테이지 전환·로비 대기 배경 / 난이도 카드 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 16.png | 2172×724 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 17.png | 2170×725 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 18.png | 2170×725 | 게임 부트·스테이지 전환·로비 대기 배경 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| 19.png | 2170×725 | 게임 부트·스테이지 전환·로비 대기 배경 / 난이도 카드 | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd1.png | 1536×1024 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd2.png | 2560×1440 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd4.png | 2048×1152 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd5.png | 2560×1440 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd6.png | 1536×1024 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd7.png | 1536×1024 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd8.png | 2048×1152 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd9.png | 1536×1024 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd10.png | 1536×1024 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd11.jpg | 2752×1536 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd12.png | 2560×1440 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd13.png | 2048×1152 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd14.png | 2048×1152 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd15.png | 2170×725 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd16.png | 2560×1440 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| rd17.png | 1536×1024 | 로비 후보 프리로드(현재 표시 안 함) | 원본 전체 contain + 어둡고 흐린 같은 그림 폴백 |
| img/logo_exoduser_solid.png | 불투명 흑철 바탕 보정본(원본 logo_exoduser.png 보존) | index.html chapterGate 실제 진입 대기 | 원본 contain, 별도 하단 상태 문구 |

_RD_IMGS 16장은 목록·preload 후보이며 showLoading의 현재 실제 그림은 로고다. 챕터 진입과 장 사이 전환은 위 gate·stageTransition을 사용한다. 별도 장 시작 원화 배열은 없다. rd1·rd2의 적 스프라이트 참조는 로딩 화면 대상이 아니므로 보존한다. 난이도 선택 카드의 art 9·7·11·15·19는 기존 제한 카드 구도이며 화면 폭에 따라 확대되는 전체 화면 로딩과 구분한다. 디스크의 그 외 미참조 파일은 새 랜덤 풀에 추가하지 않는다.

## 런타임 계약

| 항목 | 구현값 |
|---|---|
| 공통 표시기 | loading-art.js / loading-art.css, 캐시 20261031-wide1 |
| 구도 | 이미지 전체 object-fit:contain / center, 비율 유지. 폭이 부족한 16:10·원래 3:1 배경도 원본 전부 보존 |
| 네메시아·핵터·디로이 선택 | viewport W/H >2.5 → -32.webp, >1.8 → -21.webp, 그 이외 원본 |
| 32 판 | img/lording/wide/1-32.webp,2-32.webp,3-32.webp = 4096×1152, 무손실 WebP |
| 21 판 | 같은 폴더 1-21.webp,2-21.webp,3-21.webp = 2730×1152(2560×1080과 같은 64:27 비율, 21:9 모니터용), 32 판의 가운데 배경 크롭 |
| 원본 보존 | 원본 파일 byte 무변경. 원본을 높이1152로 등비 리샘플하고 중앙 합성. 좌우128px는 배경 접합 smoothstep feather, 그 안 중앙 전 높이는 원본 리샘플과 raw RGB SHA256 동일(3장 모두) |
| 미생성·실패 폴백 | 같은 원본의 cover 배경에 blur24px / brightness .28, 전면은 원본 contain. 원본·확장판 늘이기 없음. 확장판 로딩 실패·이전 비동기 완료는 현재 원본 요청을 덮지 못함 |
| 게임 상태 영역 | artwork와 분리, 하단 높이 clamp(120px,15vh,200px). 제목 Hahmlet300 clamp(16px,2.1vh,26px), 층 정보400 clamp(11px,1.35vh,17px), 팁400 clamp(11px,1.25vh,16px) |
| 진행 선 | 폭 min(32vh,80vw), 높이3px, 은빛 #b7b6af. 기존 진행률·종료·콜백 시간 유지 |
| 로비 gate | 로고 아래 clamp(100px,13vh,170px) 별도 상태 영역. showLoading(msg) 동일 메시지, hideLoading 종료 유지 |
| 반응형·보호 | resize 재선택, 최신 요청 ticket 확인. 로딩 상태 role=status/aria-live=polite, reduced-motion 지원. 부모 textContent 교체 없음 |

기존 4~19·rd*는 이번 신규 생성 대상이 아니며 브리프에서 허용한 임시 원본+블러 폴백이다. 전체 35장에 신규 outpaint가 있다고 보고하지 않는다. 32:9보다 넓어지는 artwork 가용 영역도 남은 외곽은 동일 폴백으로 채운다. 과거 리마스터 수치·원본 캐시는 이력으로 유지하며 이 절의 표시 계약이 최신이다.

## 생성 방법과 프롬프트

내장 image_gen 편집만 사용, 외부 유료 생성/API 사용0. 시안·입력·master: G:/exoduser/tmp/design-review/20261031_loading_wide/. 기본 생성 원본은 Codex generated_images에 보존했다. 런타임은 위 작업본 img/lording/wide/의 6개만 참조한다. 생성 결과의 화면비·인물이 자동 보존된다고 가정하지 않고, letterbox trim → 등비 크롭/리샘플 → 원본 중앙 합성 → 경계 배경 feather → 무손실 출력으로 마감했다. 새 인물·펫은 확장 영역에 배치하지 않았다.

| 원본 | 실제 최종 생성 지시 핵심(영문) |
|---|---|
| 1 | OUTPAINT ONLY blank gray side areas of supplied 32:9 panorama canvas. Original occupies central half. Fill outer left quarter and outer right quarter seamlessly with continuation of purple storm clouds, black gothic skull towers, distant stone architecture and chains. Preserve exact original central rectangle, composition, top/bottom boundaries, face, hair, hand, armor, pose and color. Do not redraw or extend the character. Background only in new sides. No new people, creatures, characters, figures, faces, text, logo, stars, glitter, speckles, grain or dithering. |
| 2 | Outpaint the provided 4096x1152 (32:9 aspect ratio) canvas. Fill ONLY the blank dark-gray left quarter and right quarter with continuous infernal forge background. Keep original central half unchanged: same exact raven Hector, anvil, necklace, height, position, framing, chains, furnaces, color and light. Extend stone architecture and chains, purple haze and orange furnace glow. No additional characters, creatures, birds, text, UI, border. Do not resize or zoom the central original. |
| 3 | Outpaint blank LEFT and RIGHT quarters only of this 4096x1152 32:9 image. Fill dark-gray side panels with existing background: shadowy gigantic rough stone columns, hanging iron chains, purple fog, dark cracked rocks. Preserve central half EXACTLY with existing black cat Diroy, violet eyes, silver pendant, curled tail, stone altar, skull ornament, their sizes and positions. No duplicate cat or skull outside original; no zoom, move, crop, text, UI, logos, creatures, stars, speckles, grain or dithering. Source top/bottom borders and height are locked. |

핵터 1차는 중앙 구도/출력 비율이 맞지 않아 캔버스 고정 방식으로 전환했다. 2차와 나머지 두 장은 원본 중앙 재합성으로 디자인 변형을 제거했다. 후보를 그대로 런타임 원본으로 바꾸지 않았다.

## 검수 근거

검수 산출물 I:/EXODUSER-Storage/web-loading/20261031-wide/. server.cjs를 독립포트3447·격리 SAVE_DIR로 실행, 사용자 서버 재시작 없음. 외부 네트워크와 쓰기 API는 검수 브라우저에서 차단했다. 전체 game.html의 실제 로딩 함수·DOM을 명시적으로 유지한 캡처이며 자연 플레이 증거와 구분한다.

재현 도구 tools/check-loading-wide.mjs: 35장×1920×1080/2560×1080/3840×1080/2560×1600 총140장과 실제 로비gate4장, 확장판 실패·최신 요청 경쟁을 검수한다. test/loadingWide.test.js는 표시계약·선택 회귀, test/audioBootLoading.test.js는 기존 오디오 부트 비차단 계약을 확인한다. 최종 영수증·시각 판정은 아래에 기록한다.

검수 보정: 첫140장에 자동 인트로가 상위에서 렌더된 것을 직접 확인했다. 좌표 통과와 가시성을 구분해 해당 캡처·영수증을 obstructed-captures/에 FAIL 증거로 보존했다. 최종 도구는 검수에서만 실제 로딩 DOM의 z-index를1000000으로 고정하고 elementFromPoint로 전면 가시성을 검사한다. 제품의 z-index38·컷신 흐름은 변경하지 않는다. nw-boot.html에는 로딩 이미지가 없음을 확인했다.

패키징: build-nwjs.mjs FILES에 loading-art.js·loading-art.css를 명시했다. img/lording/wide/6개는 기존 img 런타임 디렉터리 및 웹 참조 추적으로 포함한다. 패키징 manifest 검사와 실제 데스크톱 빌드 실행은 구분한다.

## 최종 판정·영수증

| 검수 | 결과 | 근거 |
|---|---|---|
| 실제 로딩 DOM 전체35장×4해상도 | PASS, 140장 모두 전면 가시성·원본 contain·상태 영역 비중첩·텍스트 폭 넘침0 | captures/receipt.json, review/grid-*.png |
| 실제 로비 gate | PASS, 4해상도 표시/종료·로고 비율·하단 상태 문구 | captures/lobby-*.png, supplement-v3/lobby-*.png |
| 배경 확장3장 접합·구도 | PASS(해당 로딩 표시 범위), 좌우 경계6개 1x 직접 확인, 네 해상도 원본 동일 크기 비교12개 | review/*-left-1x.png,*-right-1x.png,same-size-*.png |
| 중앙 원본 보존 | PASS, 3개 중앙 전 높이 RGB SHA256 동일 | core-preservation.json |
| 확장판 실패·비동기 경쟁·resize | PASS, 실제 wide 요청 실패 이벤트 이후 원본 유지·최신3번 요청 유지·16/21/32/16:10 재선택 | supplement-v3/receipt.json, fallback-3840x1080.png |
| 소스·회귀·문서 | project-check104/104, 관련 테스트7/7, docs-sync-check --staged 통과 | validation.json |
| 패키지 포함 | 공통JS/CSS2개와 신규WebP6개 모두 웹 manifest 포함 | packaging.json |
| Unity | 지시 인계 완료, Unity 실제 실행/통합/빌드는 이 작업에서 미실행 | ui-ultrawide-brief.md 끝 추가 절 |

VISUAL VERDICT: PASS — 지정 해상도에서 로딩 원본 구도·생성3장 배경 접합·하단 정보 비중첩 범위. 미생성 나머지32장은 브리프 허용 임시 폴백이며 새 배경 확장 완료로 확대하지 않는다. 자연 플레이·Unity·NW.js 빌드·Steam·웹 배포 완료 판정은 아니다.

보완 검사 중 Node 도구 세션의30초 제한으로 격리 서버가 종료된 연결 거부는 supplement-v2.log에 보존했다. 동일 포트의 자기 QA 서버만 다시 준비해 HTTP200 확인 후 supplement-v3에서 최종 보완 검사를 완료했다. 사용자 서버/실행기는 변경하지 않았다.

원격 통합 전 expected origin/main=9f5db2ac6223cd1696870865057f37721922ecae. 자기 변경을 먼저 경로 지정 커밋하고 최신 main을 정상 merge한 뒤, 검수·원격 ref 대조를 진행한다. 최종 SHA와 반영 결과는 외부 원격 영수증 remote-receipt.json 및 작업 완료 보고로 연결한다.

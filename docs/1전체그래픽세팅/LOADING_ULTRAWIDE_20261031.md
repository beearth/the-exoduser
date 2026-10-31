# 로딩·대기 화면 초광폭 수정 — 2026-10-31

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

## 2026-09-29 — HUD 창 크기·페이지 줌 적응 복원

| 대상 | 현행 동작 | 검증 |
|---|---|---|
| UI 자동 배율 | min(innerWidth/1920,innerHeight/1080), 고정0.5~3 상하한 제거; 유한한 양수만 반영 | uiAutoScale8 + HUD 관련6 =14 PASS |
| HUD 앵커 | 기본 inset·미니맵·상단 상태/자원/시계·하단 바/툴팁도 같은 배율; 시계170px·보스 HP500px 기준 폭 | 두 HTML 실제 DOM/CSS12 viewport 사례 |
| 실행 페이지 | 저장된 UI 함수/CSS만 hot apply; 게임 on/paused 및2813×1262/DPR1 유지 | 실제 플레이 화면 확인, Chrome 설정 변경 없음 |
| 범위/상태 | 월드 렌더·카메라·resScale·저장·전투/VFX 로직 변경 없음. Git은 관리형 .git 읽기 전용으로 미커밋 | [상세 계약](3.1 ui hud 디자인/UI_SCALING_20260929.md) |

# 2026-05-20 작업 보고서

## 커서 시스템 대개편
- 커서 최대 크기 100% → **200%** (클램프 128→256)
- 기본 커서 사신낫 → **다크커서** (ChatGPT 이미지 기반)
- **다크 레드 / 다크 퍼플** 2종 커서 (Normal + Hover)
- CSS `cursor:pointer` → **다크 호버 커서** 자동 적용 (index.html + game.html)
- 구 canvas draw 커서 코드 262줄 삭제, 불필요 이미지 정리
- **커서 이미지 onload 시 자동 재적용** (로드 경쟁 해결)

## 로비 패드 네비게이션 전면 개편
- **모든 상호작용 요소** 패드 접근 가능 (캐릭터 슬롯, ENTER, Steam 위시리스트, 로그아웃, 시네마틱 다시보기)
- **ENTER 호버**: 패드 포커스 시 사운드 + 글로우 애니메이션 (`.gp-hover` 클래스)
- **Steam 위시리스트 호버**: 패드 포커스 시 글로우
- **우측 스틱**: 캐릭터 슬롯 스크롤 (휠처럼)
- **캐릭터 삭제**: X 버튼 → 커스텀 확인 모달 (브라우저 `confirm()` 제거)
- 삭제 확인 모달 패드 조작 (D-pad 좌우 + A/B)
- **캐릭터 선택 ≠ 입장**: PC와 동일하게 ENTER 버튼 별도 클릭 필요
- ENTER 사운드 2배 볼륨 (Web Audio API gain:2.0) + 패드 진동 최대 600ms

## 가상 키보드 (게임패드용)
- **한글 자동 조합 엔진** 구현 (초성+중성+종성, 복합 종성, 자모 단위 백스페이스)
- 한글 자모 + 복합 모음 + 영문 + 숫자 8행 배치
- 패드: D-pad 이동, A=입력, B=취소, X=백스페이스, Y=생성

## 인게임 패드 UI 확장
- **`_gpUINav` 셀렉터 대폭 확장**: `.inv-eq-slot`, `.gc-btn`, `.inv-storage-toggle`, `.cmp-close`, `label[cursor:pointer]`, `a[href]`, `[style*="cursor:pointer"]`
- **오버레이 목록 확장**: `victory`, `stageTransition` 추가
- **설정 패널**: A/B/X/Y + D-pad 설정 불가(고정 표시), LB/RB/Select/Start/L3/R3만 변경 가능
- 키바인딩 입력 대기 중 B=취소
- **인트로 가이드**: 패드 연결 시 자동으로 패드 버전 표시 (A/B/X/Y/LB/RB 등)
- `.gp-hover` 전역 패턴 정립 (docs 참조: `게임패드_호버_상호작용.md`)

## 로비 UI
- ENTER 버튼: 당시 선택 전 완전 투명 규격은 2026-09-27 소등·점등 방식으로 대체. 현재 미선택도 버튼 표시, grayscale(1) brightness(.45); 선택하면 원본 보라색으로 0.45초 전환.
- 온라인 모드 자동 활성화 버그 수정 (로드 시 `btn.disabled=true` 유지)
- **시네마틱 다시보기** 버튼 추가 (현행: 로비 우측 패널 하단)
- 시네마틱 다시보기 시 비디오/자막/이미지/문 전부 초기화
- CLICK TO HELL 패드 핸들러 **break** 추가 (다른 핸들러 중복 실행 방지)

## BGM
- 장 BGM 소진 후 **전체 랜덤** 전환 (기존: 장+공용 혼합 → 변경: 전체 1~7장+gameplay 풀 랜덤)

## 시네마틱 연출 강화
- 모든 이미지 전환 시 **슬로우 줌** (4초, 1→1.08x)
- **화면 떨림 + 패드 진동** 4곳: 학살(img:4), 지옥추락(img:5), 탈출하라(img:7)
- `cinShake`, `cinShakeLight`, `cinZoomSlow`, `cinZoomIn` CSS 애니메이션 추가

## 1차 컷씬 연출 변경
- "탈출하라" 장면: 손가락 클로즈업(`08.png`) → 뒷모습(`09.png`, "또 보자 망자여") 분리
- 뒷모습 페이드아웃 제거 (다음 장면까지 유지)
- **컷씬 이미지 넘버링 정리**: 사용 순서대로 `00.png`~`20.png`
- **모든 shake 장면 패드 진동 동기화** (웃음 shake:2, 목마 shake:3, 탈출하라 shake:0.5, 디로이 "..." shake:3)
- `_cutVibDone` 플래그로 라인당 1회 진동 보장

## NW.js / Steam 환경
- **웹 버전 폐기**, NW.js 빌드만 취급 (2026-05-19 결정)
- `G:\hell`에 NW.js 런타임 설치 → `EXODUSER.exe` 직접 실행으로 테스트
- `.gitignore`에 NW.js 런타임 제외 (*.exe, *.dll, *.dat, *.pak, *.bin, locales/ 등)
- git 히스토리에서 대용량 파일 제거 (filter-branch)
- **SteamCMD 설치** + 빌드 업로드 스크립트 (`steam/steam_deploy.bat`, `steam/app_build_4749590.vdf`)
- Steamworks App ID: 4749590, 파트너 ID: 398693

## 번역 목록 추가 (2842~2849)
| No | 한국어 | English |
|----|--------|---------|
| 2842 | 다크 레드 | Dark Red |
| 2843 | 다크 퍼플 | Dark Purple |
| 2844 | 계정으로 입장하세요 | Sign in to enter |
| 2845 | 오프라인 모드 | Offline Mode |
| 2846 | A 버튼으로 계속 | Press A to continue |
| 2847 | A 버튼으로 시작 | Press A to start |
| 2848 | 고정 | Fixed |
| 2849 | ▶ 시네마틱 | ▶ Cinematic |

## 새 docs
- `docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md` — 패드 호버 전체 리스트 + gp-hover 패턴

## TODO (다음 세션)
- [ ] 인게임 `_gpUINav` gp-hover 전역 적용 (모든 :hover에 .gp-hover 병기)
- [ ] xbow+holy 렌더 40ms 병목 최적화
- [ ] envVig 11.5ms 최적화
- [ ] drawP S7 전체 프로파일링
- [ ] 1차 컷씬에 제공된 네메시아 이미지 2장 적절한 위치에 활용


## 2026-09-27 캐릭터 선택에 따른 ENTER 소등·점등

| 항목 | 현행 규격 |
|---|---|
| 미선택 | disabled 유지, display:block!important, opacity:1!important, 버튼 filter:none!important. 이미지 grayscale(1) brightness(.45)로 보석·문양 소등, 클릭 불가 |
| 선택 | 기존 _updateCharDisplay(s) 및 온라인 선택 처리의 disabled=false를 그대로 사용. 이미지 filter:none으로 원본 보라색 점등 |
| 선택 해제 | 기존 _updateCharDisplay()의 disabled=true로 소등 복귀 |
| 전환 | 이미지 filter .45s ease, prefers-reduced-motion:reduce에서는 transition:none |
| 배치·원본 | assets/lobby/lobby_enter_btn.png 재사용. 상태 전환 시 버튼 영역 높이 동일, 숨김에 따른 레이아웃 이동 제거. 입장은 별도 클릭 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-enter-light |
| 검증 | 스크립트 비활성 로비에서 실제 _updateCharDisplay 함수만 추출 실행, 번역·배경 교체·캐릭터 영상은 격리. 미선택 disabled/display:block/opacity1/filter grayscale(1) brightness(.45), 선택 disabled=false/filter none, 해제 disabled=true 확인. 두 상태 높이120px 동일. tmp/lobby-enter-light/off.png 및 on.png. 로그인·세이브 API 미실행 |


## 2026-09-27 가상 키보드 선택 키 자동 스크롤

| 항목 | 현행 규격 |
|---|---|
| 재현 |640×360에서 가상 키보드 마지막 OK 키 하단442px,생성창 하단348px. 게임패드 선택 표시만 이동하여 키가 화면 밖에 남음 |
| 처리 | _vkbHighlight에서 data-vr/data-vc로 선택 키 확인. closest(.create-modal-inner) 내부 가시영역을 panelRect.top+clientTop부터 clientHeight까지 계산,위아래4px 여유 |
| 이동 | 선택 키가 위/아래 경계를 넘을 때 필요한 거리만 panel.scrollTop 보정. 이미 보이면 스크롤하지 않음. 문서·로비 및 실제 입력 초점은 이동하지 않음 |
| 유지 | 기존8행·키 크기·한글 조합·게임패드 입력 방식 유지. 신규 이미지·저장 없음 |
| 검증 | 실제 _vkbShow/_vkbHighlight 격리 실행,1280×720/640×360/360×480/320×280에서 첫행→마지막행→첫행12경우 선택 키 가시성 통과. 640×360 마지막행 scrollTop99px. inline4개 구문 통과. 게임패드 선택 좌표 시뮬레이션이며 실물 하드웨어 검증은 아님. tmp/lobby-vkb-scroll/report.json 및 after.png |


## 2026-09-27 로비 하단 버튼 접근성 보완

| 항목 | 현행 규격 |
|---|---|
| 다시보기 | replayCinBtn을 span에서 type=button으로 변경. 기존 _goCinematic onclick·번역 셀렉터·게임패드 목록 유지. 키보드 Enter/Space로 동작 |
| 표시 | 최소높이32px,padding4px0,border0,transparent배경,글자#b8a386/.7rem/자간.08em. hover·gp-hover #ead6a5, focus-visible outline-offset0 |
| 입장 | enterGameBtn 기본 aria-label=입장, _applyLobbyLang에서 _TL(입장)로 갱신. 이미지 노드·선택 전 disabled 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-footer-controls |
| 검증 | 실제 마크업 격리 브라우저에서 Enter/Space 각각 다시보기 콜백1회(시네마틱 실행은 스텁). 입장 접근성 이름·이미지1개·disabled 보존,영문/한글 라벨 갱신 확인. 로비 언어·선택 회귀5개 통과. tmp/lobby-footer-controls/report.json 및 after.png |


## 2026-09-27 가상 키보드 한글 8글자 경계 보호

| 항목 | 현행 규격 |
|---|---|
| 대상 | index.html의 _vkbInput(k), 이름 최대 8글자 유지 |
| 재현 | 8번째 초성 뒤 새 초성을 입력하면 표시되지 않은 입력이 _hgState를 덮어써 다음 모음에서 마지막 글자 변경. 8번째 음절의 받침 뒤 모음을 입력하면 새 글자 추가 없이 기존 받침만 소실 |
| 경계 처리 | 길이 8 이상이고 조합 중이면 상태 변경 전에 sameSyllable 검사. 중성 전에는 모음(_isJung), 중성 이후 종성 전에는 초성이면서 종성 가능한 자음(_isCho와 _isJong), 종성 이후에는 _JONG_MERGE가 있는 자음만 허용. 그 외 입력은 input 이벤트 후 반환하여 값과 조합 상태 보존 |
| 유지 | 같은 음절의 모음·받침·겹받침 조합 및 기존 백스페이스 유지. 여유 글자 수가 있으면 받침 분리 후 다음 음절 생성 유지 |
| 회귀 | test/lobbyHangulInput.test.js: 초성 덮어쓰기·받침 소실·종성 불가 초성 덮어쓰기 방지, 겹받침·백스페이스·여유 길이 받침 분리 총 6건. 수정 전 3건 실패, 수정 후 6건 통과 |
| 검증 | 한글 입력·캐릭터 생성·언어 선택 관련 테스트 총 36건 통과. 실제 함수 VM 실행이며 실물 게임패드·OS IME 검증은 아님. tmp/lobby-hangul-limit/changes.patch에 코드·테스트·문서 함께 보관 |


## 2026-09-27 로비 입장 버튼 자동 배율 복원

| 항목 | 현행 구현 |
|---|---|
| 원인 | ui-foundation.css의 고정 max-height 120px 및 낮은 화면 96px 규칙이 index.html의 반응형 배율을 덮어씀 |
| 크기 | .lobby-right .enter-game-btn img: width 100%, height auto, object-fit contain; max-height min(500px,28dvh), 미지원 환경은 min(500px,28vh) |
| 선택 상태 | 선택/미선택 이미지 크기는 동일. 기존 점등/소등 필터 유지 |
| 실측 | 3840×2160: 높이490.17px, 2560×1440:319.14px, 1920×1080:233.63px, 1280×720:148.11px, 960×540:135.14px. 이미지 원본 종횡비 유지 |
| 검증 | 실제 index.html/CSS를 스크립트 비활성 상태로 확인. 5개 해상도 가로 넘침 없음 및 선택 전후 동일 크기. 별도 3개 더미 카드 배치 후 1080/720/540 높이에서 스크롤로 버튼 전체 접근 확인. 로그인·세이브 API 미실행 |
| 캐시 | index.html의 ui-foundation.css?v=20260927-enter-responsive |
| 이전 기록 | 소등 검증 당시 높이120px 기록은 과거 측정값이며 현행 크기 계약은 이 표를 따름 |


## 2026-09-28 데모 카드 줄바꿈·입장 버튼 스크롤 분리

| 항목 | 현행 계약 |
|---|---|
| 데모 전용 | data-card-key=demo인 선택 버튼을 직접 가진 카드만 높이auto/최소84px 및 이름·정보 줄바꿈. 정보 줄높이1.45. 일반 로컬/온라인 카드는84px/진행nowrap 유지 |
| 입장 | .lobby-footer는 .lobby-right 직계 자식으로 .lobby-content 뒤/#lobbyStatus 앞. 목록/배너 세로 스크롤과 독립. CSS 캐시20260928-lobby-card-wrap |
| 검증 | 실제 데모29언어×진행2×화면7=406조합 및 일반 슬롯 대역6조합. 텍스트/입장 경계·초점 순서·저장 원문 보존, 가로 넘침/페이지 오류/쓰기 요청0. 기존105회귀+inline4구문 통과 |
| 상세 | [데모 카드·입장 배치 현행 계약](3.1%20ui%20hud%20디자인/LOBBY_ANCESTOR_ART_20260928.md). 기존 공통 말줄임/84px 설명의 데모 예외 및 짧은 창의 배너 세로 스크롤을 이 절로 갱신. 신규 자산/저장 형식/게임패드 동작 변경 없음 |


## 2026-09-28 짧은 창 Steam 배너·RTL 여백 마감

| 항목 | 현행 계약 |
|---|---|
| 짧은 창 | 높이≤600px는 배너 문장/.lobby-card-gap 숨김, 배너 내부padding0/gap0. 찜 버튼 최소높이44px/최대폭100%, 이미지 최대190px. 데모 카드 세로padding10px·최소높이84px. 높이≥601px는 기존 문장·간격 표시 |
| RTL·언어 | .lobby-content의 여백은 padding-inline-end8px. #lobbyWishlistBtn aria-label/title은 기존 번역키 STEAM 위시리스트 추가(id2841)로 즉시 갱신, 이미지 alt 빈값. 부모 DOM 교체·새 번역키·저장 형식 변경 없음 |
| 검증·캐시 | 실제29언어×진행2×화면9=522조합, 일반 슬롯 대역16조합, 기존105회귀/inline4구문 통과. 가로 이미지 잘림/페이지 오류/쓰기 요청0. CSS 캐시20260928-lobby-banner-compact2 |
| 상세 | [배너·논리 여백 현행 계약](3.1%20ui%20hud%20디자인/lobby_full_patch.md). 기존 padding-right8px와 데모 카드 간격 설명은 이 절을 우선. 아주 작은480×360에서는 세로 스크롤 후 찜 버튼 접근. 동시 전대 아트·표제 변경 보존 |


## 2026-09-28 언어 메뉴 키 반복·IME 보호와 찜 버튼 초점선

| 항목 | 현행 계약 |
|---|---|
| 언어 메뉴 | 4개 select의 반복 열기와 팝업의 Enter/공백/Escape 반복 확정·취소 차단. isComposing/keyCode229 및 숨김·선택 노드 없는 메뉴는 처리하지 않음. 방향키 반복/Home/End/Tab·마우스·패드 경로 유지 |
| 찜 버튼 | #lobbyWishlistBtn도 기존 로비 focus-visible outline-offset−2px 적용. 공통2px/#ead6a5 테두리·버튼 크기·600px 배너 경계·언어·저장 계약 유지 |
| 검증 | 신규24건 원본19실패→통과, 관련167건/inline4구문 통과. 실제 키보드3크기·초점5크기 및 원본 패드 콜백 대역 확인. IME는 합성 이벤트/실물 패드·OS IME 검증 별도 |
| 상세 | [언어 키 입력·초점 현행 계약](3.3%20키바인딩+설정/게임패드_호버_상호작용.md). 기존 언어 팝업 계약에 키 유지와 IME 보호 추가. 새 번역키/부모 DOM 교체/사용자 저장 요청 없음 |


## 2026-09-28 외형 선택 하단 버튼 폭·줄바꿈 보완

| id / 적용 위치 | 현행 계약 |
|---|---|
| 레이아웃 | index.html의 .cs-actions width100%/max-width760px/flex-wrap:wrap/gap12px. #charVisualPop .cs-actions button min-width0/min-height44px/max-width100%/overflow-wrap:anywhere. 폭700px 이하 취소/생성 가로 패딩16px/20px, 세로10px/11px 유지 |
| 동작·검수 | 출시 잠금·생성/취소 경로 유지. 29언어×2외형×8크기=464조건에서 버튼/텍스트 내부·간격·44px 높이·최대2줄·가로 넘침 없음. 4크기 실제 Tab/Shift+Tab/Enter/Escape/취소 클릭 정상, pageerror0/쓰기 요청0. 관련187회귀/inline4개 구문 통과 |
| 범위·기록 | 이 절은 하단 버튼 폭·줄바꿈 기록. 좁은 창 설명 가독성은 아래 외형 선택 설명 최소 글꼴·반응형 스크롤 절에서 후속 보완. 상세 계약은 캐릭터선택_리모델링_기획서.md의 동명 절. 증거 tmp/lobby-visual-fit/, 커밋은 기존 WindowsApps 오류317 및 .git 쓰기 제한으로 미완료 |


## 2026-09-28 외형 선택 설명 최소 글꼴·반응형 스크롤

| 항목 | 현행 계약 |
|---|---|
| 가독성·배치 | 글꼴 clamp 최소: 표제20px/직업11px/이름22px/설명13px/플레이 제목·특성 제목13px/특성 본문12px/아이콘 이름12px/출시 배지11px. 아이콘 링 최소44px. 넓은 창은 각 정보 패널 내부 스크롤, 폭≤760은 설명→플레이 방식→무대의 한 열·본문 세로 스크롤. 중간761~900은 썸네일 장식 포함 숨김 |
| 키보드·수명 | csLeft/csRight도 tabindex0 지역으로 Tab 순환에 포함, 일반6개/출시 잠금5개. 정보 초점은 제목부터 노출하고 읽기 키는 네이티브 스크롤 허용. _resetVisualInfoScroll로 열기/다른 외형 선택의 본문·패널 위치0, 동일 외형은 보존. 저장 형식 변경 없음 |
| 검증 | 실제29언어×2외형×12크기=696조건, 4크기 키보드·480×360 휠 검수. 글꼴/마지막 줄·헤더/하단 분리·생성 잠금·썸네일 경계 확인. 회귀195건/inline4개 구문, pageerror0/쓰기 요청0. 전체 수치는 캐릭터선택_리모델링_기획서.md의 동명 절 |
| 기록 | tmp/lobby-visual-readability/ 검수 및 changes.patch. 문서7개 동기화, 현재 .git 쓰기 제한 및 기존 WindowsApps 오류317로 커밋 미완료 |


## 2026-09-28 외형 선택 배치 전환의 정보 초점 유지

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 960×540에서 csRight를 End로 읽은 뒤480×360으로 바꾸면 초점은 csRight에 남고 플레이 방식 제목은 본문 밖으로 이동. 반대 전환에서는 이전 패널 scrollTop69가 다시 적용될 수 있음. 기존 열기/외형 변경 초기화만으로는 열린 창의 배치 전환을 처리하지 못함 |
| 등록 | window.matchMedia('(max-width:760px)').addEventListener('change',_visualInfoLayoutChanged) 1회. CSS의760px 이하 단일 열 /761px 이상 좌우 패널 경계와 동일. 모든 resize에 스크롤 초기화를 연결하지 않음 |
| _visualInfoLayoutChanged | charVisualPop.style.display가 flex이고 document.activeElement가 csLeft 또는 csRight일 때만 처리. _resetVisualInfoScroll로 본문·양쪽 패널 scrollTop0 후 현재 초점 영역에 scrollIntoView(block:start). 초점 대상·_pendingVisualIdx·생성 잠금·미디어 경로 유지 |
| 보존·제외 | 같은 배치 안에서 크기 조절은 해당 change 이벤트 없음. 아이콘/액션/외부 초점 및 숨긴 팝업은 스크롤·초점을 변경하지 않음. 기존 열기/다른 외형 선택 초기화, 동일 외형 선택 보존 계약 유지. 새 세이브 필드 없음 |
| 네이티브 보정 | 그리스어 실버테일480→500px의 본문 scrollTop47→50은 수정 전 HTML 격리 페이지에서도 재현. 브라우저의 레이아웃 스크롤 앵커 보정을 강제로 되돌리지 않음. 같은 배치 검증은 실제 _resetVisualInfoScroll 호출 증가0과 읽기 위치 비초기화·초점 유지로 판정 |
| 실제 브라우저 | Node 서버 원본29언어×전사0/실버테일1×정보 영역2개×761↔760px 양방향=232조건. 현재 초점 제목 노출·패널 scrollTop0·선택/출시 잠금 유지·헤더/본문/하단 분리·가로 넘침 없음. 같은 배치480→500/960→980px·높이360px는 KO/EN/DE/FR/EL/AR×2외형×2영역×2전환=48조건 |
| 실제 키보드 | Shift+Tab 정보 초점/End 후960×540↔480×360,1920×1080↔320×360의4조건에서 제목 노출·초점 유지. 리사이즈 후 ArrowRight로 실버테일 잠금/ArrowLeft로 전사 복귀, Escape 후 찜 버튼 초점 복귀와 숨긴 창 리사이즈 보존. pageerror0/쓰기 요청0 |
| 회귀 | lobbyVisualKeyboard25→31건. 수정 전6실패/25통과→31통과. 양쪽 정보 영역 재노출·아이콘/액션/외부 초점 비간섭·숨긴 창 비간섭 및 실제 MediaQueryList change 등록 검증. 관련12파일201건/inline script4개 구문 통과 |
| 기록 | tmp/lobby-visual-resize의 browser-before.json,native-anchor-before.json,browser-matrix.json,same-mode.json,interaction.json,summary.json,red-tests.txt,tests.txt,changes.patch. 코드·테스트 및 문서7개를 함께 검토할 수 있도록 패치 준비. 현재 환경의 .git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 외형 재선택 영상 재시작 방지

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | selectVisual이 idleVid/sceneVid의 물음표 앞 경로를 src.endsWith로 비교. 실제 src에는 ?v=20260913-detail1 또는 ?v=20260927-restored 등이 남아 같은 캐릭터 재선택도 다른 영상으로 판정. 960×540 전사 영상2초에서 재클릭 후 emptied/loadstart 발생·0.213648초로 재시작 확인 |
| csIdleVid | idle.getAttribute('src')!==ch.idleVid 또는 idle.error가 있으면 on 클래스 제거·src 지정·load 실행. 동일한 전체 경로·쿼리이며 오류 없으면 기존 영상과 currentTime 유지. _isrc/split('?')/endsWith 비교 제거 |
| csSceneVid | 정적 초상화+씬 영상 분기의 vid.getAttribute('src')!==ch.sceneVid 또는 vid.error일 때만 src 지정. 동일 버전 재선택은 재로드하지 않음. 분기 내 _src/split('?')/endsWith 비교 제거 |
| 버전·실패 | 파일 경로가 같아도 쿼리 버전이 바뀌면 영상 교체. MediaError가 있는 같은 주소는 재선택으로 다시 로드하여 정상 복구 가능. 정상 영상만 재사용하며 재시도 경로를 차단하지 않음 |
| 수명·UI | selectVisual의 _visualPreviewSeq/isCurrent와 기존 오류·180ms 폴백·5000ms 스톨 보호 유지. 닫기에서 src/poster·이벤트·타이머 해제, 재열기에서 선택 영상 재생. 전사0.75배속·실버테일1배속/comingSoon:true·포스터/초상화·contain 비율 및 선택/초점/스크롤 계약 유지. 새 미디어나 세이브 필드 없음 |
| 실제 재선택 | Node 서버 원본480×360/960×540/1920×1080×2외형×클릭·경계 방향키 유지=12조건. sceneVid 분기는 기존 bg_scene1_loop.mp4?v=2로960×540 클릭/Home의2조건. 총14조건 모두 currentTime 연속 증가·emptied/loadstart0·선택/출시 잠금·속도 보존 |
| 실제 교체·재시도 | 버전 교체7조건(아이들6/씬1), 캐릭터 교체6조건, 취소·재열기6조건 통과. 아이들/씬 GET를 각각 일시404로 실패시키고 같은 버튼 재선택: MediaError4→null·readyState4·loadstart 확인2조건. pageerror0/쓰기 요청0 |
| 회귀 | lobbyCreationOverlayLifecycle17→25건. src 속성·대입과 currentTime/load를 반영한 미디어 대역으로 동일 버전 재사용·쿼리 변경·캐릭터 변경/이전 폴백·오류 재시도를 각각2분기 검증. 첫23건2실패/21통과, 재시도25건2실패/23통과→최종25통과. 관련12파일209건/inline script4개 구문 통과 |
| 기록·범위 | tmp/lobby-preview-reselection의 browser-before.json,browser-matrix.json,lifecycle.json,summary.json,red-tests.txt,retry-red-tests.txt,tests.txt,changes.patch. 코드·테스트와 관련 문서9개를 함께 검토 가능한 패치로 정리. 현재 환경의 .git 쓰기 제한으로 이번 변경 커밋 미완료; 기존 스테이징은 보존 |


## 2026-09-28 이름 입력 안내 상시 표시·취소 글자 가독성

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 기존 입력칸 placeholder #443322와 취소 글자 #884433이 어두운 창에서 읽기 어려움. 320×360의 입력 내용 폭220px에서 영어 안내224.733px/일본어220.160px로 끝부분 잘림. 이름 입력 후에는 placeholder 안내가 사라짐 |
| charNameLabel | index.html에서 charName 바로 앞에 label.name-label/id charNameLabel/for charName 추가. 기존 번역키 캐릭터 이름 (2~8자)를 표시. 입력 중에도 안내·글자 제한 유지, 네이티브 input.labels로 입력 이름 제공. 부모·입력 DOM 교체 없음 |
| .name-label | display:block/text-align:start/color #bda183/font-size .875rem/line-height1.5/letter-spacing .05em/margin-bottom8px/overflow-wrap:anywhere. 실제16px 루트의 글꼴14px·줄높이21px. RTL은 논리 시작 방향 사용, 긴 번역은 줄바꿈 |
| charName | placeholder 속성과 기존 .name-input::placeholder 색 규칙 제거. maxlength8·입력 글꼴1rem·입력값/이름2~8자 검증·한글 IME/Enter 반복 보호·가상 키보드·생성/저장 경로 유지 |
| _applyLobbyLang | charNameLabel을 document.getElementById로 찾아 기존 _TL(캐릭터 이름 (2~8자))를 label 리프 textContent에 갱신. 입력값·초점·새 번역키·저장 형식 변경 없음. 처음 초기화 또는 노드 없는 화면에도 null 가드 유지 |
| 취소 글자 | 현행 .create-cancel-btn은 #dfceb0 중성 흑철 버튼. 활성 hover brightness1.13/border #c9ab7d, focus-visible2px #ead1a0/offset-4px. 이름·종료·삭제 확인창 흑철 마감 절이 이전 #bda183·붉은 호버를 대체하며 클릭/취소 정책 유지 |
| 대비 계산 | 계산용 창 배경 상한 RGB(26,17,11)에 새 안내/취소 RGB(189,161,131) 대비7.60846. 이전 취소2.58784, 이전 placeholder는 입력 배경 RGB(16,11,7)에서1.62392. CSS 합성 배경에 대한 계산이며 화면 픽셀 측정값은 아님 |
| 실제 브라우저 | Node 서버 원본29언어×320×280/320×360/480×360/960×540/1920×1080의5창×가상 키보드 꺼짐/켜짐2=290조건. 안내 전체 줄 경계·label 연결·입력값 이름유지/maxlength8·최소14px·색·팝업/버튼 접근·가로 넘침 없음 확인. pageerror0/쓰기 요청0 |
| 실제 키보드 | 320×280/480×360/960×540에서 Hero7 입력 후 KO→EN 값/초점 유지. Tab 이름→취소→생성→이름/Shift+Tab 역방향 및 Escape 후 기존 캐릭터 버튼 초점 복귀 확인. 실제 캐릭터 저장 요청 없음 |
| 회귀 | lobbyCardLanguage 기존11→12건: 안내 번역·동일 label 노드·입력값/빈 placeholder·초점 유지·API 요청0. 수정 전1실패/11통과→12통과. 관련12파일210건/inline script4개 구문 통과 |
| 기록·커밋 | tmp/lobby-name-detail의 placeholder-before.json,contrast.json,browser-matrix.json,interaction.json,summary.json,red-tests.txt,tests.txt,changes.patch. 코드·테스트 및 문서7개를 검토 패치로 정리. 현재 .git 쓰기 제한으로 이번 변경 커밋 미완료. 기존 스테이징 보존 |


## 2026-09-28 종료창 취소 후 키 유지 재열림 방지

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 종료 확인창의 취소에 Enter keydown을 보내면 창 none/초점 lobbyQuitBtn으로 복귀. 같은 키의 repeat keydown이 로비 전원 버튼의 네이티브 click을 실행해 확인창을 다시 flex로 열었음. 기존 delConfirmModal의 반복 차단은 이미 닫힌 창 밖까지 처리하지 못함 |
| lobbyQuitBtn | 기존 onclick _showLobbyQuit() 옆 onkeydown _lobbyQuitKeydown(event) 연결. SVG·번역된 aria-label/title·전원 터치 영역·초점 표시·레이아웃 유지 |
| _lobbyQuitKeydown | repeat가 true이고 key가 Enter 또는 공백일 때 preventDefault/stopPropagation. 단일 입력 및 Tab/Escape/좌우 방향키는 소비하지 않음. 키를 놓고 새로 누르는 네이티브 버튼 활성화·마우스/프로그램 click 유지 |
| 확인창 수명 | 기존 delConfirmModal 내부의 Enter/Space 반복 차단, 기본 취소 초점, Escape/B 취소, Tab 순환, busy 보호와 _showLobbyQuit의 실제 전원 버튼 초점 복귀 정책 유지. 종료 API 우선순위·150ms 브라우저 안내·요청 번호 보호 변경 없음 |
| 실제 키보드 | Node 서버 원본320×280/480×360/960×540×KO/EN/AR×Enter/Space=18흐름. Enter 취소 후 repeat4회에도 창 닫힘·전원 초점·열기 횟수 불변·종료0회. Space는 초기 키 유지 중 창 닫힘/해제 후1회 열기, 새 입력 취소·재열기 확인. Escape 복귀, 열린 창 경계·가로 넘침 없음 |
| 클릭·확정 | 각3크기에서 실제 마우스 및 프로그램 click의 열기/취소6흐름 유지. 의도적인 Tab→확인→Enter3흐름은 원래 종료 콜백1회씩 실행. NW App.quit만 카운터 대역으로 대체하여 실제 앱 종료 없음. 실물 패드 검증은 아님. pageerror0/쓰기 요청0 |
| 회귀 | lobbyConfirmStick7→10건. 새 Enter/Space 취소 복귀 반복 및 다른 탐색 키 비간섭3건은 수정 전3실패/7통과→10통과. 기존 스틱 중립·실행 버튼 복귀·온라인/로컬 삭제 취소 보존. 관련8파일160건/inline script4개 구문 통과 |
| 기록·커밋 | tmp/lobby-quit-held-key의 browser-before.json,browser-after-smoke.json,browser-matrix.json,confirmation.json,summary.json,red-tests.txt,tests.txt,changes.patch. 코드·테스트 및 문서6개를 함께 검토할 수 있게 정리. 현재 .git 쓰기 제한으로 이번 변경 커밋 미완료. 다른 작업의 스테이징 보존 |


## 2026-09-28 작은 생성창 이름 오류 즉시 노출

| id / 적용 위치 | 현행 계약 |
|---|---|
| 재현 | 320×280 실제 로비에서 외형 확정 후 1글자 이름을 Enter로 제출. 입력칸149~203px에 초점이 남고 오류는270~304px,생성창 하단268px 밖으로 완전히 가려졌다. |
| DOM 위치 | index.html의 #status를 #charName 바로 다음,#vkbWrap 및 .create-modal-btns 앞에 배치. role=status/aria-live=polite,입력 aria-describedby=status. 기존 리프와 번역키 사용,부모 내용 교체 없음. |
| 표시 규격 | ui-refinement.css .create-modal-inner #status: font-size12px/line-height1.5/max-height:min(80px,20dvh)/overflow-y:auto/overflow-wrap:anywhere/margin-bottom12px. 빈 안내는 :empty display:none. 종전 max-height140px를 대체한다. |
| 오류 노출 | setStatus가 status 리프에 비어 있지 않은 오류를 표시하고 createModal이 show일 때,charName→status 순서로 scrollIntoView(block:nearest). 입력값과 activeElement는 변경하지 않는다. 가상 키보드 OK나 같은 오류 재제출도 창 바깥에 있던 입력칸과 안내를 다시 노출한다. |
| 읽기 위치 | 새 문구는 기존 scrollTop0,같은 문구의 안내 내부 scrollTop은 유지. 오류 영역 상한을 넘는 서버 원문은 안내 내부에서 스크롤하며,창 버튼은 기존 세로 스크롤·Tab 순서로 접근한다. 빈값/진행 안내/숨은 생성창/자식이 있는 상태 컨테이너에는 새 노출 동작이 없다. |
| 실패 UI | _showCreateFailure는 버튼 잠금 해제→이름 복원→창 show→입력 focus→setStatus 오류 순서. 온라인 doCreateChar의 오류도 같은 helper를 사용하며23505 중복 안내와 기타 오류 원문을 보존한다. 요청 번호/저장/목록/스토리 후처리는 기존 계약 유지. |
| 브라우저 | Node 서버 원본 페이지320×280/480×360/960×540×ko/en/ar×가상 키보드 off/on. 길이 오류/특수문자/같은 오류 재제출/긴 서버 오류 총72조건에서 입력·오류 영역 노출 및 횡넘침 없음. 입력값·초점과 같은 긴 오류의 내부 읽기 위치 보존,새 오류 초기화,pageerror0/쓰기 요청0. 서버 실패는 원본 helper 직접 호출이며 실서버 저장 실패를 유발한 검사가 아니다. |
| 실제 컨트롤 | 320×280의 실제 가상 키보드 OK 마우스 클릭 후 이름·오류 동시 노출,Tab→취소/Shift+Tab→입력/Escape 닫기 확인. 데모에 생성 카드가 없어 openVisualSelect로 진입한 뒤 실제 외형 생성 확정/입력/컨트롤을 사용했다. |
| 회귀·캐시 | test/characterSync,characterStoryCreation,lobbyCreationResponse,lobbyCreationOverlayLifecycle,lobbyVisualKeyboard,lobbyCardLanguage,lobbyHangulInput,lobbyConfirmStick 총146건 PASS. inline script4개 구문 PASS. CSS 쿼리20260928-lobby-name-error. |
| 기록·상태 | tmp/lobby-name-error-focus/의 red-browser.txt,browser-matrix.json,summary.json,verify-error.mjs,native-extra.json,after-320-ko.png,after-320-vkb.png,after-320-server.png,tests.txt,changes.patch. 코드2개·문서7개 범위. 현재 .git 쓰기 제한으로 커밋 미완료,기존 타 작업 스테이징 보존. |


## 2026-09-28 외형 미리보기 RTL 좌우 입력 정합

| id / 적용 위치 | 현행 계약 |
|---|---|
| 재현 | Node 서버 원본960×540·아랍어 dir=rtl. 전사0의 x492.48px,실버테일1의 x413.78px로1이 왼쪽에 있지만0에서 ArrowLeft가0을 유지했다. 패드도 좌=-1/우=+1 고정 인덱스 연산이라 같은 역방향 문제가 있었다. |
| 표시 방향 | 기존 ExoduserI18n.applyDocumentLanguage가 아랍어만 document.documentElement.dir=rtl,나머지는ltr로 설정한다. #visualGrid의 기존 flex 배치가 이 방향을 상속한다. 배치·아이콘·캐릭터 에셋을 바꾸지 않는다. |
| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |
| Home/End·잠금 | Home은 논리 첫 버튼0,End는 마지막 버튼icons.length-1. RTL에서 첫 버튼이 오른쪽이라는 기존 DOM 순서 유지. 선택/초점/aria-pressed/설명·미디어·생성 잠금은 같은 캐릭터로 갱신. 일반 전사0 생성 활성,실버테일1 출시 준비 잠금. |
| 패드 | 기존 lobbyNav의 외형 팝업 분기에서 step=현재 dir===rtl?-1:1. D-pad14 또는 좌스틱x<-0.5의 새 입력은 clamp(idx-step,0,cards.length-1),D-pad15 또는 x>0.5의 새 입력은 clamp(idx+step,0,cards.length-1). 기존 _viL/_viR 유지 판정·selectVisual·A확정/B취소 유지. |
| 언어 전환 | 입력 처리 때마다 현재 document.documentElement.dir를 읽는다. 열린 상태에서 en→ar→en으로 전환해도 다음 새 방향 입력이 현재 보이는 순서에 맞는다. 미리보기 재생·저장 순서·캐릭터 id는 바꾸지 않는다. |
| 보호 범위 | 키보드 Tab/Escape/IME·정보 영역 네이티브 스크롤 및 아이콘 밖 방향키 규칙 유지. 이름 가상 키보드/삭제 확인창 등 다른 패드 분기는 이번 변경 대상이 아니다. |
| 회귀 | test/lobbyVisualKeyboard.test.js31→37,새6건:RTL 좌우/경계/Home·End/잠금,열린 창 방향 전환,LTR·RTL×D-pad·스틱4조건. 수정 전37건33PASS/4FAIL→수정 후37PASS. 관련9파일155건 PASS,inline script4개 구문 PASS. |
| 실제 브라우저 | 320×280/960×540/1920×1080×ko/en/ar×키보드/D-pad/스틱=27흐름. 네이티브 키보드9·가상 패드18,선택·잠금·aria-pressed·좌우 끝 경계·취소 후 초점 복귀·횡넘침 없음. 열린 창 en→ar→en 추가 확인,pageerror0/쓰기 요청0. |
| 검증 범위 | 실제 서버 페이지의 기존 navigator.getGamepads 폴링과 lobbyNav를 사용하되패드 장치 표본만 브라우저 대역으로 주입했다. 실물 패드·진동 검증은 수행하지 않았다. 데모에는 생성 카드가 없어 openVisualSelect로 진입한 뒤 실제 버튼/키보드를 사용했다. |
| 기록·상태 | tmp/lobby-visual-rtl의 browser-before.json,browser-matrix.json,summary.json,verify-rtl.mjs,after-960-ar.png,red-tests.txt,green-tests.txt,tests.txt,changes.patch. 코드1·테스트1·관련문서8개. 현재 .git 쓰기 제한으로 커밋 미완료,기존 타 작업 스테이징 보존. |


## 2026-09-28 이름 입력 혼합 시 한글 조합·초점 보존

| id / 적용 위치 | 현행 계약 |
|---|---|
| 재현 | 실제 로비 이름창에서 가상 키ㄱ→ㅏ로가 생성 후 입력칸을 이름으로 교체하고 가상ㄴ 입력:이름→이간으로 마지막 글자를 덮어썼다. 가상 키 span을 실제 클릭하면 초점이 body로 빠져 Escape도 이름창에서 처리되지 않았다. |
| 조합 상태 | 기존 _hgState의 cho/jung/jong 및 초성/모음/받침·겹받침 규칙 유지. 새 _hgValue=''는 마지막 가상 input 통지 당시 전체 입력값을 보관하는 일시 문자열이며 저장 데이터가 아니다. _hgState가 있을 때만 현재 이름값과 비교한다. |
| 외부 input | #charName의 input 리스너에서 e._fromVkb가 아니면 _hgState=null로 기존 조합 확정. 실제 타이핑·텍스트 삽입·삭제 및 외부 합성 InputEvent도 적용. 화면 문자열이 같은 외부 입력도 이전 가상 음절을 이어 붙이지 않는다. |
| 이벤트 없는 교체 | _vkbInput 시작 시 inp.value!==_hgValue이고 _hgState가 있으면 상태를 null로 정리한 뒤 입력 처리. 실패 UI 등 프로그램이 값만 복원해도 새 음절은 복원된 이름 뒤에 추가한다. 현재 값이8글자면 종전 경계 규칙에 따라 그대로 보존한다. |
| _vkbDispatchInput | 기존 _vkbInput의6곳 input 통지를 공용 helper로 연결. _hgValue=inp.value 후 기존 Event('input')에 _fromVkb=true를 지정해 dispatch한다. 기본 bubbles=false 유지. 자체 input 리스너로 조합이 끊기지 않으며 기존 이벤트 구독자도 통지를 받는다. |
| 키 입력 초점 | _vkbDispatchInput은 통지 후 inp.focus(preventScroll:true). 문자·공백·백스페이스·8글자 제한 반환에서 이름칸 초점을 유지하며 키보드가 보이는 위치를 초점 이동으로 바꾸지 않는다. _vkbInput의OK도 상태 null→입력 초점 복귀→기존 createBtn.click 순서로 처리해 오류 후 입력·Escape를 계속 받는다. |
| 보존 | 기존 이름2~8자 검증/maxlength8,키 배열8행,8번째 음절 받침·겹받침 및 백스페이스,여유가 있을 때 받침 분리,생성 잠금·요청 번호·저장·스토리 경로 유지. 부모 DOM 내용 교체나 새 번역키 없음. |
| 회귀 | test/lobbyHangulInput.test.js6→15건. 외부 교체/삭제/영문 덧붙이기/같은 문자4,이벤트 없는 복원/8글자 보존2,가상 이벤트 보존1,문자 키/OK 초점2 추가. 첫13건 원본6PASS/7FAIL,초점15건 중13PASS/2FAIL→최종15PASS. 관련8파일175건 및 inline script4개 구문 PASS. |
| 실제 브라우저 | Node 서버 원본320×280/480×360/960×540에서 화면 키를 실제 마우스로 클릭. 네이티브 교체/삭제/영문 입력/텍스트 삽입,같은값 composition InputEvent 대역,이벤트 없는 복원,8글자 보존,내부 받침·백스페이스,교체 후 가상 삭제의9종×3창=27흐름 통과. 이름/maxlength8/초점·횡넘침 확인. |
| OK·Escape | 각3창에서 실제OK 클릭 후1글자 오류 표시·입력 초점·오류 노출·조합 null과 Escape 닫기 확인3흐름. 총30브라우저 흐름/pageerror0/쓰기 요청0. 실제 Windows OS IME·실물 게임패드·세이브 저장은 검증하지 않았다. 데모에는 생성 카드가 없어 openVisualSelect로 진입한 뒤 실제 컨트롤을 사용했다. |
| 기록·상태 | tmp/lobby-hangul-mixed의 browser-before.json,browser-matrix.json,summary.json,native-ok.json,verify-mixed.mjs,after-960.png,red-tests.txt,focus-red-tests.txt,focus-red-browser.json,green-tests.txt,tests.txt,changes.patch. 코드1·테스트1·문서7개. 현재 .git 쓰기 제한으로 커밋 미완료,타 작업 스테이징 보존. |

## 2026-09-29 이름·종료·삭제 확인창 흑철 마감 — 기존 크기 보존

사용자 지시: UI 디테일 작업으로 UI 크기를 반복 변경하지 않는다. 2026-09-28 마감이 추가한 패딩·글자·버튼 치수·구분선·테두리 두께 덮어쓰기를 제거하고, 그 직전 크기로 복원했다. 아래 규격이 현행이다.

| id / 적용 위치 | 현행 계약 |
|---|---|
| 범위 | 이름창 width440px, 확인창 width400px. 기존 max-width:calc(100vw - 24px)/max-height:calc(100dvh - 24px), 내부 세로 스크롤·가로 숨김·scroll-padding-block8px 유지 |
| 기본 여백·테두리 | 이름창 padding48px 40px/border1px/radius2px; 확인창 padding24px 32px/border2px/radius8px. 폭≤480px 또는 높이≤480px는 두 창의 기존 padding24px 18px 유지. 공통 padding32px/3px double/radius0 덮어쓰기는 제거 |
| 글자·간격 | 이름 제목은 기존 Cinzel Decorative/1.5rem/letter-spacing.1em/margin-bottom8px. 설명은 기존 .8rem/.05em/margin-bottom28px, 입력은 기존16px/padding14px 18px/margin-bottom20px/radius2px. 폰트·줄높이·마진·자간을 재질 CSS에서 덮어쓰지 않음 |
| 버튼 | 기존 flex:1 1 96px/min-width0/min-height44px/줄바꿈 유지. 이름 생성·취소 padding12px 32px/.9rem/radius2px 및 각 버튼 기존 자간·굵기, 확인·취소 padding8px 28px/1rem/700/radius4px 유지. 재질 CSS에서 display·정렬·패딩·font를 덮어쓰지 않음 |
| 확인 안내 | 기존1rem/margin-bottom20px 및 기존 글꼴·줄높이 유지. 새18px 아래 패딩·구분선과16px/600/1.6 덮어쓰기는 제거 |
| 재질 | #756247 테두리색, linear-gradient(#131215ee,#0b0b0eef)/iron.png center320px/#111013, shadow0 18px 56px #000c/inset3px #090a0d/inset4px #a68a5433. 내부6px/1px #a68a542b 장식은 absolute/pointer-events:none으로 배치 치수에 영향 없음 |
| 색상 | 제목·확인문구 #ecd9b7/설명 #c4b69e/label #d3c1a2/입력 #f1e4c9 및 #090a0d. 기본 버튼 #dfceb0/border #74604a/중성 button.webp, 활성 생성·확인 #fff0d1/border #b57b59/가넷 오버레이 유지 |
| 상태 | 기존 .14s 재질·초점 transition, hover brightness1.13/#c9ab7d, active brightness.96/inset0 3px 7px #000a, focus-visible2px #ead1a0/offset-4px, disabled opacity.7/grayscale1/#aaa08e, reduced-motion transition:none. scrollbar-color만 유지하며 scrollbar-width 덮어쓰기도 제거 |
| 검수 | 현재 기본 브라우저 viewport2353×1262/scale1에서 KO·EN·AR×이름/확인창6조건. 기존 CSS 백업과 각11요소의 폭·높이·패딩·테두리 두께·font·줄높이·마진·자간·display 등23속성을 비교, 차이0. 이름창 실측 KO440×340/EN440×367/AR440×364, 확인창 KO·EN400×140/AR400×150. 번역에 따른 기존 줄바꿈·높이 차이는 유지 |
| 검수 경계 | 원본 DOM·CSS를 Node 서버에서 제공하고 앱 스크립트를 제거한 격리 렌더의 치수 대조. 저장·생성·삭제·종료 실행이나 게임패드 검증을 대체하지 않는다. 이전435배치/148회귀는 이전 마감 기록이며 이번 현행 크기의 검수 결과로 재사용하지 않음. 검수 viewport override는 해제하고 화면 크기를 다시 바꾸지 않음 |
| 회귀 | 관련 로비6개 테스트 파일132건 PASS. 이번 수정은 CSS 치수 복원·캐시 키 변경이며 생성·취소·이름 조합·초점 처리 코드는 변경하지 않음 |
| 캐시·상태 | index.html의 ui-refinement.css?v=20260929-lobby-size-preserved. tmp/lobby-size-restore-20260929에 백업·검색·검수·patch 보관. .git 읽기 전용으로 커밋 미완료, 타 작업 스테이징 보존 |

## 2026-09-29 필살기 미사용 이미지·3D 애니메이션 자원 로딩 수정

| id / 적용 위치 | 현행 계약 및 검증 |
|---|---|
| 실제 오류 | localhost 게임 탭의 G._ultImg.lava가 complete=true/naturalWidth0. 같은 로드에서 SFX Failed to fetch·GLTF blob 텍스처 실패·WebGL context lost가 함께 기록됨. PNG는 서버HTTP200/4072255바이트/디스크와 SHA256 동일,1743×1890 RGBA 디코드 약12.57MiB. 호스트 freeRAM 약41.74GiB였으므로 시스템 RAM 부족으로 단정하지 않음 |
| 미사용 VFX | draw 초기화의 G._ultImg에는 black:new Image() 및 assets/vfx/boss/ult_black_c.png만 보관. ult_holy_c.png·ult_lava_c.png 초기 요청은 제거. 실제 _ultBurst 생성은 kind:black이며 탄막블랙홀 재분출은 기존 원형 보존 반사탄을 사용. 파일 자체·블랙 회전/버스트·신성 필살기의 기존 별도 렌더는 유지 |
| VFX 수명 | 기존 G._ultImg 가드로 같은 게임 상태에서 한 번만 요청. 로딩 실패 시 이미지 complete/naturalWidth 기존 가드를 사용하며 프레임마다 재요청하지 않음. 새 자동 재시도·추가 이미지·해상도 변경 없음 |
| _b3loadActions | idle 모델 설치 뒤12개 상태를 src별 Map으로 묶음. walk/aggro/run/hit/chargeWind/charge/multiDashWind/multiDash/spinWind/spin/slamWind/slam. 동일GLB는 한 번만 fetch/parse하고 각 상태에는 AnimationClip.clone() 후 개별 name을 지정해 mixer.clipAction에 등록 |
| 동시 요청 | 애니메이션 job의 inFlight<2일 때만 시작. idle은 먼저1개 로드하며, 완료 뒤 애니메이션 GLB 최대2개. 성공·실패·동기 load 예외 모두 슬롯을 반환. 실패그룹은 로그 후 나머지 job을 계속 진행하며 무제한 재시도하지 않음 |
| 임시 자원 | 현재 generation의 성공 GLB도 clip 추출 후 _b3disposeGltf(g2)로 scene의 geometry/material/texture/skeleton을 각 객체별1회 dispose하고 소유 ImageBitmap을 close. stale generation 또는 mixer 불일치도 같은 해제를 사용하며 action 설치 및 다음 대기 job 시작을 차단. 표시 중 idle 모델은 임시해제 대상이 아니며 교체 시 _b3releaseModel에서 해제 |
| 실제 파일 수 | Vinebound: idle/walking/running/dead/charged_ground_slam의5파일, 기존idle1+상태12=13회 load→5회. Meshy_AI_1 fallback도 idle/Walking/Monster_Walk/Running/Unsteady_Walk의5파일. 상태13개(idle+12),기존 경로·애니메이션 매핑·모델 스케일·위치 유지 |
| 회귀 | test/resourceLoading.test.js6건:미사용 VFX/GLB중복/동시상한/임시해제/실패후진행/stale가드. 수정 전2PASS·4FAIL→6PASS. 관련 bulletBlackHoleVfx·bulletBlackHoleUltimate·audioBootLoading·bootAssetSlowDiagnostics 포함20PASS. game.html inline/classic/module 스크립트6개 acorn 구문 PASS |
| 실제 브라우저 | 격리127.0.0.4의 Node 서버 게임에서 실제 Escape→안내 건너뛰기로 G.on=true 진입. black 텍스처1857×1849 complete/naturalWidth 정상,holy/lava resource 요청0. window._b3loadModel(0) 실호출의 신규 네트워크 기록은truncated=false, GLB5파일/동시peak2/실패0/13상태 등록 로그 확인. 새 게임 console error0,기존 Multiple instances of Three.js 경고1은 별도 현행 제약 |
| 검수 경계 | 새 게임 시작 초기 전체 네트워크 버퍼는truncated이므로 전체 부트의 네트워크 실패0으로 확대 해석하지 않음. 수정 뒤 별도 모델 로드 구간은 유실 없이 수집. 장시간 전투·모든 GPU 환경·WebGL 컨텍스트 소실 예방 전체 해결·3D 모든 공격 모션의 시각 승인은 주장하지 않음. 사용자 기존 게임 탭은 강제 새로고침하지 않고 검수 탭만 정리 |
| 기록·소스 제어 | tmp/resource-loading-20260929에 game-before.html,docs 전체 검색,red/green 테스트,검수 summary 및 changes.patch. .git 읽기 전용으로 커밋 미완료,타 작업 변경·스테이징 보존. UI 크기·배율은 변경하지 않음 |


## 2026-09-29 안개 WebGL 컨텍스트 소실 보호·복원

| id / 적용 위치 | 현행 계약 및 검증 |
|---|---|
| 재현 근거 | 이전 localhost 실제 오류는 Three.js shader 생성의 null.trim 예외 → _fogGLRender → draw. 이번 수정은 이 별도 안개 렌더 경로를 보호하며 WebGL 소실 자체의 원인을 RAM/VRAM 부족으로 확정하지 않음 |
| _fogGLInit | _fogGLR 또는 _fogThree가 이미 있으면 새 renderer를 생성하지 않음. 컨텍스트 소실 중 _fogGLR=false여도 기존 객체와 resize listener를 유지 |
| fogGL webglcontextlost | event.preventDefault()로 복원을 허용하고 _fogGLR=false. 메인 C/GL과 UI/CSS 크기·배율은 건드리지 않음. 소실 상태에서 안개 render와 uTime 증가를 건너뜀 |
| fogGL webglcontextrestored | Three.js 생성자가 먼저 등록한 복원 처리 뒤 renderer.getContext().isContextLost()가 false일 때 _fogGLR=true. 동일 renderer/scene/camera/material/uniform을 재사용 |
| _fogGLRender 사전 검사 | renderer.getContext()의 isContextLost()가 true이면 _fogGLR=false로 정지하고 즉시 반환. _fogGLTime과 uTime을 증가시키지 않음 |
| 렌더 도중 소실 | renderer.render의 예외 발생 뒤 context.isContextLost()가 true일 때만 안개를 정지하고 예외를 메인 draw로 전파하지 않음. 컨텍스트가 유효한 다른 render 예외는 그대로 throw. 소실이 사전 검사 뒤 발생한 해당 프레임의 시간 증가를 되감지 않음 |
| 보존된 시각·플랫폼 계약 | 안개 시간 증가 0.016/호출, 초기 예약 500ms, OPT.fog, IS_MAC&&navigator.gpu 예약 차단, 색상·FBM·alpha0.41·중앙 mix0.50~1.0·smoothstep0.0~0.62 모두 유지. 강제 GPU 복원·자동 renderer 재생성·UI 리사이즈 추가 없음 |
| 회귀 테스트 | test/resourceLoading.test.js에 안개 사전 소실/소실 이벤트/동일 객체 복원/소실 중 중복 초기화/렌더 중 소실/무관 예외 전파의6행동 테스트 추가. 기존6개 포함 수정 전7PASS·5FAIL →12PASS. 관련4파일 포함26PASS |
| 실제 게임 소실 검증 | 사용자 게임과 분리한127.0.0.5 게임에서 G.on=true, 검증 메모리에서 OPT.fog=true. 소실 전 draw990/fogrender990/time15.840000000000012 → 소실 중 draw2256/fogrender990/동일 time. lostEvents1/_fogGLR=false/메인 GL.isContextLost=false/window error0 확인. 주입 계측과 설정은 검수 탭 폐쇄로 제거, 사용자 설정과 게임 탭은 수정·새로고침하지 않음 |
| 실제 GPU 복원 검증 | 동일 소스 _fogGLInit/_fogGLRender와 로컬 three.min.js r128을 사용한 renderer.html에서 이벤트 소실·복원 확인. 복원 전 중앙 RGBA[1,2,1,34] → 복원 후[1,2,1,39], shader programs1/GPU error0. _fogGLR=true/isContextLost=false/restoredEvents1, 동일 renderer/material/2813×1262 canvas,window error0 |
| 검증 경계 | 실제 전체 게임은 소실 시 메인 렌더 지속을 검증했고, 복원은 동일 안개 코드의 별도 실제 WebGL 화면에서 검증. 전체 게임 장시간 자연 GPU 소실·복원까지 완료했다고 주장하지 않음. 추가 QA에서 소실 이벤트 dispatch 종료 전에 즉시 restoreContext를 호출한 시도는 복원 timeout으로 무효; 별도 호출로 이벤트 종료 후 복원과 GPU 출력을 검증 |
| Three.js 중복 경고 | 이전 안개 복원 단계에서는 r128+r160이 함께 존재했다. 현행은 아래 로컬 r160 단일 런타임 계약으로 대체(2026-09-29). 컨텍스트 수 감소와 전체 공격 시각·장시간 전투 QA는 별도 |
| 기록·커밋 | tmp/fog-context-recovery-20260929의 before,red/green,renderer.html,docs-search,browser-summary,changes.patch. .git 읽기 전용이며 커밋 미완료. 타 작업 스테이징·dirty 변경 보존 |

## 2026-09-29 보스 모델 교체 자원 수명 수정

| id / 적용 위치 | 현행 계약·검증 |
|---|---|
| 원인 | _b3loadModel의 이전 모델 정리는 scene.remove와 mixer.stopAllAction 및 참조 초기화만 실행하여 geometry/texture/skeleton GPU 자원이 남음. 안개 소실 보호와 별개의 재현된 자원 누적이며 ERR_INSUFFICIENT_RESOURCES 전체의 유일 원인으로 단정하지 않음 |
| _b3releaseModel | 실제 교체 시작 시 기존 mixer.stopAllAction → 기존 model의 mixer.uncacheRoot → _b3applyFlash(false) → _b3disposeGltf({scene:_b3model}) → scene에서 anchor 제거. anchor/mixer/model/pivot/meshes/origMats/actions 초기화, state=idle,window._b3dbg=null로 이전 모델 디버그 참조 제거 |
| 공용 피격 재질 | _b3applyFlash(false)로 각 mesh에 원래 material을 복원한 뒤 폐기. 공용 _b3flash는 해제하지 않으며 새 모델의 피격 flash에 계속 사용 |
| _b3disposeGltf 소유권 | 해당 GLTF scene의 mesh geometry/material/texture/skeleton/ImageBitmap만 해제. 각 종류별 Set으로 동일 객체의 dispose/close를 한 번만 호출. 배열 material,같은 texture를 쓰는 여러 material 속성,여러 mesh가 공유하는 skeleton을 처리 |
| decoded 이미지 | texture.image가 ImageBitmap이면 bitmap.close()로 디코드 이미지도 해제. 배열 image도 지원. texture.dispose()만으로 CPU 디코드 이미지 해제를 대체하지 않음. 현재 loader의 파일별 소유권 계약을 사용하며 game에서 Three.Cache.enabled=true를 설정하지 않음. 향후 외부 GLTF 사이 texture/bitmap 공유 캐시 도입 시 이 해제 계약도 함께 변경해야 함 |
| skeleton | skeleton.dispose()로 renderer에 생성된 boneTexture를 해제. geometry/material/texture dispose와 별개이며 중복 skeleton은 1회 처리 |
| 비동기 안전 | 기존 generation/mixer identity 가드와 GLB src별 중복 제거·현재 generation 애니메이션 job 최대2개는 유지. stale idle/action GLTF에도 동일 자원 해제를 사용. 이미 같은 hell의 ready 모델 재요청은 기존 early return으로 자원과 mixer를 유지 |
| 보존 계약 | 보스 GLB 경로·13상태 매핑·scaleMul·색상/조명·카메라·UI 크기·resScale·안개 복원 계약 변경 없음. 당시 r128/r160 중복 경고는 아래 로컬 단일 런타임 계약에서 제거(2026-09-29). 컨텍스트 수 감소는 별도 |
| 자동 회귀 | test/resourceLoading.test.js에 실제 모델 교체/mixer 해제,flash 상태 교체,동일 ready 모델 보존,공유자원 중복 해제 방지의4테스트 추가. 수정 전13PASS·3FAIL →16PASS. 관련4파일을 합쳐30PASS,game.html 실행 스크립트6개 구문 PASS |
| 실제 GPU 대조 | 같은 실제 r160/GLB/보스 모듈을 추출한 격리 QA에서 수정 전 fallback→hell0→hell1→hell0: renderer.info.memory geometries1→2→3→4,textures2→4→6→8. sceneChildren4/actions13/programs1은 같으므로 장면에서 제거만 해서는 GPU 해제가 되지 않는 경로를 직접 확인 |
| 수정 후 실제 반복 교체 | fallback 피격 flash→hell0 전환 및 hell1→0→1→0의4추가 교체에서 각 기존 geometry/material/texture/boneTexture의 dispose event1회,기존 bitmap width/height0,이전 mixer stats.actions.total=0/bindings.total=0. renderer geometries1/textures2/programs1,sceneChildren4/actions13 유지. 공용 flash dispose0,window error0,contextLost=false |
| 시각·검수 경계 | 실제 fallback/Vinebound의 텍스처와 모델 표시를 브라우저에서 확인. QA 전용 확대180·카메라 z1000/far2000은 renderer.html에만 사용하며 production에는 적용하지 않음. 전체 게임 보스 전투·발 위치/전신 구도·모든 공격 모션의 시각 승인·장시간 자연 컨텍스트 소실 예방까지 완료한 것은 아님 |
| 기록·커밋 | tmp/boss-model-lifetime-20260929의 before,tests-red/green,renderer-before.html/renderer.html,docs-search,browser-summary,changes.patch. UI 파일은 이번 작업에서 수정하지 않음. .git 읽기 전용으로 커밋 미완료,타 작업 staging/dirty 변경 보존 |
| API 근거 | [Three r160 AnimationMixer uncacheRoot](https://github.com/mrdoob/three.js/blob/r160/src/animation/AnimationMixer.js),[Skeleton.dispose](https://github.com/mrdoob/three.js/blob/r160/src/objects/Skeleton.js),[GLTFLoader ImageBitmap 경로](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/loaders/GLTFLoader.js) |


## 2026-09-29 Three.js 로컬 단일 런타임 동기화

| 적용 위치 | 현행 계약·검증 |
|---|---|
| main/easy boot·importmap | `three-runtime.js`와 boss/chest import가 `assets/vendor/three-r160/build/three.module.js`의 동일 namespace 공유. r160/0.160.0, 코어 요청1/three.min.js 요청0/CDN Three 요청0 |
| 안개/VFX 색상 | `_fogGLStart` 기존500ms+공유 Promise 대기. fog/VFX `LinearSRGBColorSpace` 출력 및 `_v3legacyColor` 명시 색공간으로 기존 채널 보존. boss/chest SRGB 출력·카메라·UI 크기·resScale 유지 |
| 실제 검증 | 관련35PASS/0FAIL, 두 HTML inline6개씩 구문 통과. 두 게임 native 입력으로 G.on=true, 공유 보스 pivot/안개 renderer 및 상자/VFX API 정상, 앱 warn/error0. 안개 및 가시성용 QA VFX GPU 대조 각각131072 bytes/차이0 |
| QA 경계 | VFX 대조는 기존 mirrored Y+FrontSide culling을 제거하는 QA 전용 DoubleSide fixture. production side/카메라 변경 없음; 전체 공격 가시성·장시간 전투 QA는 별도 |
| 배포·소스 제어 | NW.js FILES 및 web 필수 목록에 새 boot/로컬 JS 포함. MIT LICENSE·provenance도 함께 추적/배포 필요. .gitignore의 전역 build/ 예외는 assets/vendor/three-r160/build/three.module.js와 상위 디렉터리로 한정. .git 쓰기 제한으로 커밋 미완료, 실제 패키징/업로드 미실행 |
| 세부 SSOT | [파일·숫자·SHA256·수명·검증 범위](12퍼포먼스·최적화/THREE_LOCAL_SINGLE_RUNTIME_20260929.md) |

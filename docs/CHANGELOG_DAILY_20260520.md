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

# 04:05 UI RETOUCH 후보 — 2026-11-04

## G0/G1와 소유

- 기준: 최신origin/unity/main a53c34e939,병합0f2a57c910. CHANGELOG양쪽보존·guard WIP제외. 브리프04:05 1~5와디자인총괄swap3/PANEL_FACE_DECISION이정본이다.
- 직접연레퍼런스: swap3 1920 death_04_cannot/이름창,철원본iron_480. 웹#death z40/regionBanner z19는전체사망화면아래의지역배너를가린다. Unity는DrawRegionHud의suppressArrow만참으로넘겨배너를남기던차이가있었다.
- 가장큰차이: 사망위배너/한영전용HUD/A면불일치/숨김창호버증거부재. 기존원화·레이아웃을재사용하고호출/조회/QA상태만수정한다.
- 소유: NativeGame.RegionHud/DeathScreenCapture/DeathUiCapture,NativeObjectivePanel,NativePauseMenu,NativeLobby의CharacterPresentation/CharacterDelete/SilverHell/SilverLobby/UiSound/미사용로드,Data/demo_text·추출도구,철blur2파생원화,관련tests/docs. Core/저장/로비배치/큰버튼원화변경0.
- 첫실물: 소스계약RED1회(4결함검출)→수정후4그룹PASS·기존소형칩/인장/슬롯계약PASS,참조컴파일뒤커밋HEAD의공용후보빌드1회. 최종디자인은CTO/디자인총괄이판정한다. 같은테스트2FAIL/후보빌드실패면무수정재시도없음.

## 1~4 계약

| 항목 | 수정 |
|---|---|
| 사망 지역 HUD | DeathPresentationActive/fallen·부활전환·death.Active/PlayerDown에서전체지역HUD조기return. Core정화/사망시간변경0. 캡처에regionHiddenAtWait/regionHiddenInBoss기록 |
| HUD 29언어 | 기존No.0374/0371/3982/0415(별칭3766)4키를29언어조회로연결. 지역처치웹키는非KO28누락:기존EN유지+27번역보완. 원래77키불변,총81키. th/아랍어등은전체문자열·서체fallback으로그려조합문자보존 |
| A면 | 일시정지/이름/삭제Panel(iron:true). 위RGB16,15,15 alpha.95→아래8,8,9 alpha.97,철14%와panel_frame_20261029. 이름본문/입력/오류는Hahmlet·명조fallback,원화버튼유지. B창/인벤별도iron:false호출불변 |
| 철 질감 | 원본128×128의3x에서미세낱점을직접확인. 명시된sigma2 blur를원화480×480에기계적용한iron_480_blur2를A공통면14%로사용,원본/밝기변경0. review-current/iron-source-vs-blur2.png는소스진단이며게임판정아님 |
| 미사용로드 | lobby_panel은로드/필드만제거,파일유지 |
| 입장호버 | -ui-entry-state normal/hover,기존-ui-state hover도동일강제상태로매핑. 자연Rect.Contains와같은EntryFocus/음향선택경로,Event/OS마우스조작0. receipt entryHoverForced/entryState/entryHoverVisible로제어표본을명시 |

## 후보1회·캡처

- 빌드고정:I:/EXODUSER-Storage/ui-candidate/build,공용exo-unity build1회(예외③)/Win64/full·remodel씬포함. 바로가기/바탕화면/Steam교체0.
- 캡처고정:G:/exoduser/tmp/design-review/20261104_ui_candidate/{1920,3840}. 각death14컷+로비0/2·생성·이름·삭제·일시정지·설정4탭·명시입장hover,기준swap3과같은25장(총50장).
- 재현: unity/Tools/death-ui-tests/candidate-capture.ps1이같은EXE를공용player -PcException candidate/hidden/무음/격리sandbox로순차호출한다. pointerScope는ReviewState표본이며물리마우스입력PASS가아니다.
- 실제소스/빌드SHA·성패·캡처/1x·3x비교판은실행후REPORT최상단에기록한다. 컴파일/영수증PASS만으로디자인합격이라하지않는다.

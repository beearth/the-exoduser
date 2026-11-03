# 04:05 UI RETOUCH 후보 — 2026-11-04

## 새 실행 정정 — JUDGEMENT 05:50 반영, 촬영 차단 유지

- 이 절은 아래의 이전 "작은 칩 유지 확정" 해석을 대체한다. 디자인총괄이 05:20 PASS를 철회한 최신 JUDGEMENT.md ⑤가 우선이다. 최신 origin/unity/main 6a61db1ea를 4daf602da6으로 병합했고, 충돌한 스토리 판정·CHANGELOG는 양쪽 기록을 보존했다.
- ActionPlate의 height<48/width<160 자동 칩 전환을 제거했다. 기본은 가시 원화이며, 설정 A15 버튼/설정 페이지의 MetalAction/키 설정 조작 요소만 settingsChip을 명시한다. 삭제 확인과 HUD 타이머는 기본 가시 경로로 돌아간다. 보스 바의 기존 전용 이름 원화/텍스트·배치에는 새 칩을 적용하지 않는다. 실제 세 곳의 swap3 모양 대조는 미실행이다.
- btn_plaque_20261029/btn_primary_composed 전체를 Lanczos3으로 높이 24/32/48/64/96의 1x·2x, 총 20개 btn_thorn 파생 PNG로 사전 축소했다. 양끝 가시·보석을 잘라내지 않으며 9-slice의 sourceEdge도 같은 비율로 줄인다. 기존 큰 원화/입장 인장/칩 원본은 변경하지 않았다. 새 meta는 밉맵 OFF/Bilinear이며 기존 btn_* importer 규칙 대상이다. 실제 Unity 임포트·mipmapCount 검사는 대기다.
- 일시정지 철 면의 원인은 공통 480px blur2 원화를 큰 판에 StretchToFill하던 샘플링 차이다. 공통 Panel(iron:true)에서 GUI 배율을 반영해 화면 픽셀당 원화 texel 비율을 고정하고 Mirror UV로 경계가 이어지게 했다. 같은 iron_480_blur2·14%·판 색·프레임을 유지한다. 표준편차 0.4±0.15/3x 낱점 0은 새 Player 캡처 전까지 미검증이다.
- 이전 1~3 구현은 유지: --remodel3d -force-d3d11, HUD 실제 숫자 폭과 최소 16px 간격/축소·줄바꿈, 이름 면 18px inset/원래 440×335 프레임 및 NanumMyeongjo 명조. 언어 데이터/Core/세이브/펫 대사 조건은 이번 수정 범위 밖이다.
- 검사: review-0540의 신규 2결함 RED 1회 → 5그룹 PASS 1회, 레이아웃·26개 파생 PNG/meta 검사 PASS, candidate 4그룹 PASS, 실제 공통 C# 메서드를 추출한 Player/Editor 재질 프로브 PASS. 전체 소스 참조 컴파일 1회: Player Core126/Runtime279, Editor Core126/Runtime279/Editor61, 5어셈블리 오류0. 이것은 Roslyn 참조 검사이며 새 Unity 컴파일·임포트·빌드·시각 판정의 근거가 아니다.
- 실행 차단: 이전 57be03df/02ef0c30에서 ReadAllText(player.log) IOException 2회. 설치된 공용 실행기 2026.11.04-winenv(11-04 04:29) Cmd-Player에 같은 ReadAllText가 남아 있고, 두 이전 PID61680/10920도 CIM 목록에 남아 있다. 공용 실행기/프로세스/잠금은 소유 밖이므로 수정·종료하지 않았다. 이전 중단 이후 새 Unity/Player·후보 빌드·촬영 0회. 원인 수정 증거가 확인되기 전 같은 촬영을 다시 돌리지 않는다.
- 기존 후보는 540fdcde2이며 1920 25장/3840 0장이다. 새 소스와 다르므로 이번 수정 증거로 쓰지 않는다. 공용 실행기 담당 수정 후 승인된 고정 I:/EXODUSER-Storage/ui-candidate/build 1회와 같은 인자 50장·1x/3x 대조가 남았다. 바탕화면·바로가기 변경0.
- 저장공간: 자기 Library/PlayerDataCache의 경로·reparse·추적·Editor 소유를 확인하고 재생성 가능 캐시 6,453,436,611B를 삭제했다. 후보 실행본·판정 캡처·세이브·원본/추적 파일은 보존했다. G: 여유 약 58GiB로 운영 기준 100GB보다 작아 추가 Unity 작업도 보류한다.


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

## 실제 후보 1회 결과와 시작 관문
- a02cb84850의 공용 f803480e 빌드1회는 Succeeded/errors0, Win64 6,819,812,394B. 실제 Unity compile26,104ms/UPM연결 통과. errorLogs2는 초기 Licensing validation/access-token 경고이며 빌드 오류0이다. 재빌드0.
- 첫 Player c21ffb38(1920 로비0명)이 Awake에서 NullReferenceException. 초기 ResetRun→UpdateViews→StageFlowBossBar가 로비 생성보다 먼저 호출되는데, 기존2cca15bef2의 bossBar.LocaleCode=lobby.Language가 null을 읽었다. 150초 뒤 공용실행기가 종료: 외부 창0/USER_SAVE0/leftovers0. 캡처0장, 나머지17작업·3840 미실행.
- 최소 후속: NativeGame.StageFlow의 첫 locale 접근에 lobby!=null?lobby.Language:"ko". 기존 NativeBossBar의 기본ko를 유지하다 로비 생성 후 실제29언어를 따른다. Core/초기화 순서/보스 수치·문구·자막 변경0, 기존 자기 문구 연결1줄의 안전성 수정이다.
- startup-locale.test.cjs가 제품의 실제 locale 표현식을 읽어 null과29언어를 검사: 수정전 null 실패1회→수정후30조건PASS1회. 이는 소스 표현식 계약이며 Unity 실행 증거가 아니다. 수정 후 기존 참조도구가 방금 생성된 자기 NTFS Library/DLL을 읽어5어셈블리 오류0.
- 후보 EXE는 a02cb84850 그대로라 이 후속 수정을 포함하지 않는다. 승인된 빌드1회 상한 때문에 추가 Unity/Player 실행0. 1920·3840 50장/1x·3x·Mac 자연입력·디자인 판정은 모두 미완료이며 CTO의 다음 빌드/검수가 필요하다. 소스와 실행본이 같다고 보고하지 않는다.
- 임포트가 button_iron/cat/crow meta의 YAML 빈 값 뒤 공백만 재직렬화했다. 의미 차이0(필터/밉맵/원화 불변), 세 파일을 실제 출력대로 기록한다. guard.baseline WIP 불간섭. 실행본/로그/최종SHA는 외부 REPORT와 고정 result-current.md.

## 05:00 최신 검증 — e3b3bc977 후보 50장 확보
- CTO 추가1회 승인으로 e3b3bc9779bc8d85ffb810270d4ccf09fd61650e를 같은 I:/EXODUSER-Storage/ui-candidate/build에 덮어썼다. 공용1922c0fa: Succeeded/errors0/errorLogs0, Win64/full/remodel씬·6,819,812,394B, USER_SAVE0. 시작 null 수정이 이번 실제 EXE에 포함된다. 아래04:05의0/50은 이전a02 실행 이력이다.
- 공용 hidden Player18회 전부 exit0/제품receiptPASS, 1920×1080 25장+3840×1080 25장=50장. 각해상도 로비0/2·생성·이름·삭제·일시정지·설정4탭·강제입장호버11장+사망14장이다. 모든 PNG실제크기와 수량을 확인했다.
- 18/18 persistenceDisabled=true, 사용자화면 창0/USER_SAVE0/leftovers0/hiddenDesktopClosed=true. 무음2인자·고유sandbox는 공용runner가 전달. 바로가기/바탕화면/Steam변경0, 런타임코드변경0·추가재시도0.
- 두해상도 사망receipt: regionHiddenAtWait/regionHiddenInBoss/objectiveLabelsComplete=true. 입장호버는 entryHoverForced/entryHoverVisible=true(자연포인터입력과 구분). 원화17종/축소본의 실제 mipCount1, artworkBrightness1, blur2면로드를 확인했다.
- G:/exoduser/tmp/design-review/20261104_ui_candidate/{1920,3840}의 원본50장, capture-current/audit-current.json. 루트 comparison-{1920,3840}-{1x,3x}.png는 swap3 db26d55f6와 같은 좌표를 나란히 둔 비교판, 3x는 nearest, 노출/색보정0. entry-state-{1920,3840}-1x.png는 같은빌드 normal/강제hover 비교다.
- 직접 검수: 1920 보스사망의 북동·번개/처치배너 겹침이 사라짐, th4키가 영어 대신태국어, 이름공통frame/명조·A3면과호버진홍빛을1x/3x에서확인. 미세철면의두드러진잔점은보이지않았다. 설정게임/조작칩에서도 SPACE/L-SHIFT/F11 글자가면안에남는다.
- 최종디자인/Mac·자연입력·펫자연이벤트PASS는 별도다. 3840 이름창의 중앙1920폭차광/양옆밝기경계는 swap3에도있는기존상태로 남아있어 디자인총괄에게판정항목으로넘긴다. 이번은 승인된빌드/50장확보만수행했다.

## 05:40 독립 대조 후속 — 계약과 소유
- 기준: death-screen-brief 05:40 1~5 및 디자인총괄 JUDGEMENT.md(e3b3bc977). 5번은 작은 칩 유지가 확정됐다. 삭제 확인/HUD 타이머/보스 이름판을 다시 가시 판으로 바꾸지 않는다. A면도 디자인총괄 PASS이므로 낱점을 늘려 표준편차를 올리는 수정은 하지 않는다.
- 최신 공통60b7f746e를 병합46fed7ef95, CHANGELOG 충돌은 양쪽 기록 보존. 공통 변경은 실행기 프로세스 환경 보완과 문서이며 이 레인에서 공용 bin/환경/잠금은 수정하지 않았다.
- 원인1: 기존 촬영 인자에 --remodel3d/-force-d3d11 누락. swap3 runner-output.log의 실제 인자를 대조해 둘 다 고정 드라이버에 추가했다. 같은 고정 출력의 50장은 이 조건으로 덮어쓰며 2D 촬영을 3D 기준선과 동등하다고 하지 않는다.
- 원인2: 악의오브 라벨 칸104px가 숫자 폭과 무관했다. 4행 모두 실제 글꼴의 라벨/현재 숫자 폭으로 판 폭을216~480px에서 정하고 최소16px 간격을 예약한다. 넘치면 라벨을11px까지 축소하고, 여전히 길면 줄바꿈한 높이만 아래 행/판/목표를 밀어낸다. 숫자/원화/수치 의미는 그대로다. 지역 화살표와 부유 문구 예약 영역도 실제 판 폭/추가 높이를 받는다.
- 29언어×4키의 실제 GUI 글꼴 측정은 사망 fixture의 objectiveLayoutAudit 116행에 남긴다. 스트레스 값은 int.MaxValue 표기이며 Simulation 수치를 바꾸지 않는다. minGap16/fits/wrapped/fontSize/locale를 검증한다. 데이터 키/번역81개와 No.등록은 불변이다.
- 원인3: 이름 판은 프레임 PNG 투명 여백보다 바탕 사각형이 컸다. 바탕+철 면만18px 안으로 넣고 같은18px outset으로 프레임 외곽440×335 위치를 유지했다. 내용 좌표도 그대로다. 디자인총괄의 이름/삭제 명조 RETOUCH는 기존 NanumMyeongjo 원화를 글꼴 우선순위로 명시하며, 실제 선택 font.name을 제품 영수증에 남긴다.
- 4번 경로 확인: 일시정지/로비/이름/삭제 모두 같은 NativeSilverHellUi.Panel(iron:true), iron_480_blur2/14% 경로였다. 승인된 A면 그림은 유지하고 IronDrawCount/LastIronRect 계측만 더해 실제 draw를 확인한다. 철 원본/블러/밝기/공용 색 공간 보정 변경0.
- 소유: NativeObjectivePanel, 이름/삭제/공통Panel, 사망/UI fixture, 두 최소 HUD 예약 연결, 촬영/관련 tests/docs. Core/저장/로비 배치/유료 생성/다른 레인 변경0. 새 회차 폴더/프로젝트 사본0.
- 소스 검사: 신규4그룹 RED1회(3누락 검출)→수정 후PASS1회, 기존 candidate4그룹/소형칩 계약PASS1회. 공용 PC 컴파일222c77f8 exit0/C#0/errorLogs0/USER_SAVE0. 그 뒤 소스 수정0. CorePresence 메서드 자체는 존재 확인이며 UI 실제 측정은 후보 Player 관문이다.
- 다음: exact 커밋 HEAD의 공용 후보 빌드1회, 동일 fixed EXE의1920/3840 50장. 실제 SHA/성패/미검증은 REPORT와 audit-current.json에 기록한다. 디자인총괄 나머지 경미 RETOUCH(빈 슬롯 면, 호버 강화, 사운드 줄 끝, 전환 제목)는 이번1~5 범위 밖으로 남긴다.

## 05:40 실제 실행 결과 — 1920 25장, 공용 후처리 2FAIL STOP
- 소스/실제 빌드540fdcde201b43c15a0b5020037431d3e71ba590, 공용 PC 컴파일222c77f8 PASS 뒤 후보f2a287d2 1회 PASS(errors0/errorLogs0/USER_SAVE0). 그 뒤 Unity 코드/에셋 수정0.
- --remodel3d/-force-d3d11을 포함한1920 원본25장과 제품receipt9/9 PASS를 확보했다. 실제3D 지면/교량/거목 배경을 확인했다. 원본은 고정1920/에 있으며 이전 회차 파일만 지우고 덮어썼다.
- 실제 GUI116행 전부 gap≥16px, 최솟값16. 가장 긴 라벨 nl 악의오브136.58px/13px, 스트레스 판 폭345.23px에서도 간격42.51px. 모든116행이 원래 크기에 들어와 실제 강제 줄바꿈은0이다. 11px 축소/줄바꿈 분기는 구현 계약이며 이번 데이터에서 실물로 발동시키지 않았다.
- 이름/삭제 실제 font.name=NanumMyeongjo-Regular. 이름면(x758,y390.5,404×299)은 기존 frame(x740,y372.5,440×335)보다18px 안이다. 일시정지/이름/삭제의 실제 공통 iron draw>0, 승인된blur2/14% 그대로. 1x/3x에서 Greek 숫자 간격·명조·이름 외곽 바탕 정리를 직접 확인했다.
- 1920 입장hover57be03df와 사망02ef0c30은 이미지/제품receipt PASS 뒤 공용 exo-unity.ps1의 ReadAllText(player.log)에서 파일잠금 IOException이 났다. 공용 최종영수증은7/9만 정상. 2건은 최종 USER_SAVE 비교/창·정리 결과를 PASS로 추정하지 않는다.
- hover 실패 조건은 반복하지 않고 미실행 사망1건만 이어서 실행했으며, 같은 공용 결함이 다시 나와 즉시 STOP. 동일조건 재시도0, 추가빌드0,3840 9조건/25장은 미실행. 전체50/50 또는18/18 PASS로 보고하지 않는다.
- 두 PID61680/10920은 최종 HasExited=true로 관측됐다. 우리 슬롯/예약은 해제됐고 다른 레인의 슬롯은 건드리지 않았다. 프로세스 객체 열거와 로그락/종료지연의 근본 원인은 미확정이다. 공용bin/잠금/권한/보안/전역환경 수정0.
- 고정 audit-current/capture-current.json은 passed=false/25 of50, runner-failures-current.json에 오류 원문2건, hud-layout-current.json에116행을 기록했다. comparison-1920-{1x,3x}.png와 entry-state-1920-1x.png는 기존 원본을 기계 크롭한 검수판이다.3840 비교판은 없다. 기존 JUDGEMENT(e3b3)는 판정 근거로 보존했으며 새 실행의 합격표로 재사용하지 않는다.
- 남은 관문: 공용 실행기 담당이 로그공유/종료 후처리 원인을 고친 뒤 실패2조건의 가드 재검증과3840 미실행 촬영, 디자인총괄/Mac 판정. 이 레인은 같은 결함2FAIL 규칙으로 추가실행을 중단했다.

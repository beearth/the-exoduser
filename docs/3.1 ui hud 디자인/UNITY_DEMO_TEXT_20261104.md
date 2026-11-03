# 데모 1-1 문구 연결 — 11-04 00:40

## G0 · G1

- 기준: `unity/main 8da100339aab1be78927abe77c1f902ea0c11e44`, STY-23 점검표, 작업 브랜치 `codex/unity-demo-text-20261104`.
- 목표: 보스 이름·지역 HUD/진행 알림·첫 입장 이야기·보스 한 줄을 선택한29언어로 표시한다. Core 판정/수치/이벤트 시점과 원화 버튼5항목은 바꾸지 않는다.
- 직접 읽은 비교 원본: latest-web의 `game.html` `#bossLine` CSS397~403·`_bossLine`·`_BOSS_LINES`·`_petSay`/디스패처·`INTRO_CUTSCENE_LINES`, `lang_*.js`. 웹 파일은 읽기만 한다.
- 가장 큰 차이: 보스 이름의 한글 전용 atlas, HUD의 ko/en 분기, 입장 이야기4언어 데이터, 구독되지 않은 BossLineRaised. 기존29언어 웹 번역을 Unity JSON 조회로 연결하고, 입장 이야기의 없는 언어를 번역한다.
- 제작법: 기존 Resources JSON 카탈로그 방식. 명조 본문과 기존 Cinzel 제목/수치, 문자 범위별 명조 fallback. 아랍어는 영어로 돌리지 않고 기존 UI Toolkit Advanced/RTL 스택으로 그린다.
- 첫 실물 판정: 동일 SHA Mac Player의 자연 보스 진입/퇴장 및 로비·HUD·보스 자막1920/3840. PC에서는 소스/데이터·DLL 참조 컴파일까지만. 이미지/실행 PASS를 대신 주장하지 않는다.

| 요소 | 연결/배치 계약 |
|---|---|
| 보스 이름 | 기존35 stage의 KO키→29언어. 한글 atlas 밖 글자도 명조 font로 표시, 기존 HP/poise/intro 시점 보존 |
| HUD | 지역 이름/정화/처치/앵글러/출구/봉인/보스 처치 알림. 장식 영문 보조행은 웹 배치대로 유지하고 실제 안내 주행은 선택 언어 |
| 입장 이야기 | KO 정본27 cue의 id/순서/시간/이미지/화자 보존,29언어 각 cue 연결. STY-23 세계관 영상과는 별도의 신규 캐릭터 입장 이야기 |
| 보스 한 줄 | 웹 `bottom:19%`, 가운데 `min(80vw,860px)`, 위/아래 은빛1px·옅은 검정 가로 감쇠. 이름 작은 Cinzel/명조, 본문 명조.3.2초,0~14% 등장/14~78% 유지/78~100% 퇴장. 점/노이즈 없음 |
| 가림/수명 | 이벤트는 Core에서 받되 Core 수정0. 구독 교체 시 이전 구독 제거. 대화상자/메뉴/사망/클리어/로딩 위로 자막을 올리지 않는다. 새 run에서 잔상 제거 |

합격선:29언어 누락/한글 누출0(고유명사 원문 유지 제외), 전달 인자·자리표시자 보존, 보스 한 줄 이벤트의 실제 화면 연결, 원화 복구 퇴보0. PC 데이터 검사는 화면·자연 입력·원어민 감수를 대체하지 않는다.

## 펫 말풍선 조사 (00:40 조사 이력)

조사 결과와 확정 범위는 아래 「펫 말풍선 후속 범위 확정」에 기록했다. 00:40 조사 회차의 게임 중 말풍선 구현은0이었다. 현재는 아래 승인 백로그 1차 절을 따른다.

## 구현·확인 결과

- 보스35 stage 이름·지역 HUD·진행 알림·보스 대사 총77개 키×29언어를 demo_text.json/NativeDemoText로 연결했다. 값은 웹 a78daf055의 최종 Object.assign까지 반영한 정본이다. 새 문구를 웹에 추가하지 않았다. No.4258 완성 알림의29언어는 Unity 데이터에 전파했다.
- 한글 아틀라스에 없는 보스 이름은 명조 전체 문자열로 그린다. 지역 안내도 비KO에서 문자를 잘게 쪼개지 않아 태국어/아랍어 연결을 보존한다. 기존 장식 영문 보조행은 남긴다. 아랍어는 UI Toolkit Advanced/RTL을 기존 Naskh 동적 폰트/PanelSettings로 격리 렌더하며 각 IMGUI 위치·깊이에서 합성한다(최대24캐시, 미초기화 렌더타깃 투명 초기화).
- startup_intro.json은29언어×KO 정본27cue(총783cue, 언어당 표시문구18개)다. KO 문장/시간/이미지/화자/순서 보존. 기존 en/ja/zh의 빠진22b를 채우고23의 깨우기 의미를 KO에 맞췄다. 신규25언어는 이번에 번역했다. 글꼴 fallback/줄바꿈/타자 노출은 기존 입장 UI에 연결했다. 새 번역의 원어민 감수는 대기다.
- BossLineRaised를 Simulation마다 구독하고 이전 구독을 해제한다. 로딩 중 intro0는 화면이 열린 뒤3.2초를 시작하도록 대기한다. 메뉴/대화상자/사망/클리어/로딩에서 표시하지 않는다. 웹 bottom19%/폭860/은빛 헤어라인/명조 배치를 사용한다. 판/버튼 원화5항목과Core 수치·판정 수정0.
- hellgate_objectives의 빠진 ar8개(No.4250~4257)도 채워29언어가 됐다. 목표 패널·로딩 이름은 같은 RTL/명조 렌더 경로를 사용한다.
- PC 데이터·소스8항 PASS(최초6FAIL→구현후PASS, 로딩 수명/촬영 진입 결함 검출 후 보강). 원화 importer38회귀PASS. 문구 최종 DLL 참조 컴파일1회: Player Core126/Runtime269, Editor Core126/Runtime269/Editor60,5어셈블리 오류0. Unity 실행/Player/빌드/캡처0. 따라서 시각/자연입력/런타임 동작은 아직 Mac 미검증이다.

## 펫 말풍선 후속 범위 확정 (00:40 조사 당시 구현0)

- 웹 원본: game.html #petSubtitle2692, _petBubbleShow9534, _petSay9557, 우선순위 디스패처9580이후, _updatePetBubble9650부근. 까마귀는 실제 화면 왼쪽20px, 고양이는 오른쪽20px. 오른쪽 조작 안내가 열리면 반대편으로 이동한다. 아래 HUD 위220px,480px 초상/원화 말풍선, UI/text scale×1.5. 텍스트 칸은 까마귀(92,237,306,51), 고양이(122,250,190,42), 원화 안에서 줄바꿈한다. 현재 웹의 산세리프 선언은 그대로 복사하지 않고 Unity 실버 헬 명조/가독성 기준으로 대조해야 한다.
- 동작: 한 번에1개. 원문키를 보존해 언어 변경/입력장치 변경 때 다시 번역·키바인딩 치환. 첫 대사 뒤 페어 대사를 순차 표시. 각 id의 쿨다운과 티어별 전역 쿨다운이 있다. T0분위기/T1튜토리얼/T2진행/T3조언/T4핵심전투/T5생존, 전역20/12/8/6/4/0초. T5는 가중치가 높은 경고로 현재 대사/페어를 인터럽트하고 낮은 티어를5초 억제한다. 보스 피날레에는 T0~T2를 차단한다.
- 1차 후속 연결 후보: STY-21 위치 펫4줄 No.3855~3858(기존29언어 JSON), 챕터 환경 _envDlg[0]의 까마귀4초→고양이4초(No.3480/0852), 첫 보스 _bi[0] 까마귀5초→고양이4초(No.3630/3631). 환경 조건은 웹에서 진입30초 누적 후 !G.bossAlive이며, 이 플래그가 Unity Stage.BossAlive와 같은 의미인지 매핑을 먼저 정해야 한다. 구간 경계/1회성 표식은 맵 총괄 GB1 확정 뒤 연결한다.
- 후속 구현물: Core 변경 없이 이벤트→표현 큐, 원화 초상/말풍선, id·티어·쿨다운/페어/생존 인터럽트,29언어/키치환, 죽음·메뉴·로딩 시 숨김, 새 run/아레나 재진입의1회성 초기화. 기존 사망 대사는 별도 흐름으로 유지한다. Mac1920/3840에서 초상/텍스트칸/하단 HUD/조작 안내 겹침·언어 변경·페어·생존 인터럽트까지 판정한다.

## Mac 촬영 인계

아래는 새 동일 SHA Player를 쓰는 제어된 표시 fixture다. 기존 바탕화면 실행본을 PC에서 실행/교체하지 않았다. 기본 요청 해상도1920,3840도 같은 인자로 가능하다. ko/en/ja/fr/ar 우선 촬영 후 나머지 언어도 데이터와 실제 글리프를 대조한다.

~~~zsh
PLAYER="<동일 SHA Mac Player/Contents/MacOS 실행파일>"
ROOT="$PWD/_out/demo-text-current"
for lang in ko en ja fr ar; do
  out="$ROOT/$lang"; mkdir -p "$out"
  "$PLAYER" -mute-audio -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 \
    --unity-demo-text-smoke --unity-boss-direct 0 -text-lang "$lang" \
    --unity-qa-sandbox "$out/qa-save" -output "$out" -logFile "$out/player.log"
done
~~~

PNG는 demo-lobby/demo-hud/demo-boss-intro/demo-boss-sink-controlled-언어_1920x1080.png, 영수증 demo-text-언어.json. coreIntroEvent/visibleIntro/storesDisabled/rosterUnchanged=true와 선택언어 이름을 확인한다. 마지막 sink0는 표현 호출을 직접 준 제어 표본이며 자연 처치의 증거가 아니다. 실제 입장 이야기27cue의29언어·아랍어 연결/타자노출, 자연 보스 진입→침강퇴장/재도전/사망/메뉴 가림은 별도 Mac 게임 관문이다. 소스 계약8PASS나 JSON passed는 시각 합격을 뜻하지 않는다.

## 11-04 01:50 문구 R1·R2

9언어 악의 용어를 화폐 용어로 맞추고(cue13/14/18b/23,36문장),No.3477 킬루를 데이터 키·KO·7장 stage33·29언어에 연결했다. 원본 KO27cue와 나머지20언어/타이밍·이미지·화자는 그대로다. 기존 보스 이름 atlas에는 킬 글자가 없어 KO도 누락 glyph일 때 명조 전체 문자열로 그린다. 추출 도구가 킬루 키를 유지한다. 데이터/소스9항PASS. 스토리총괄이 허용한 다른26개 표기는 변경하지 않았고, 실제 화면 검수는 Mac 대기다. [상세](../11내러티브·로어디자인/DEMO_V0_1_1_TEXT_AUDIT_20261104.md#6-11-04-0150-r1r2-반영).

## 11-04 01:40 실제시각 — 최종 컴파일 후속

R1/R2 e9898f7953과button_iron4cba2a857의 검증 중단을 해소했다. 수정 뒤 importer 테스트1회61PASS/0FAIL. 병합최종소스 DLL참조 Roslyn 컴파일1회:Player Core126/Runtime273,Editor Core126/Runtime273/Editor60,5어셈블리 exit0/오류0. Unity 에디터/import/Player/빌드/캡처0. 이 참조컴파일은 실제 Unity 임포트/플랫폼 빌드 판정이 아니다. Mac22종2회재임포트 meta불변/mip1 및 같은SHA 화면/폰트/RTL/선명도 판정은 대기다. R1/R2 텍스트 신규변경0,9항PASS는 이전 데이터검사 이력이며 이번에 반복하지 않았다.

## 승인 백로그 — 펫 말풍선 1차 G0/G1

- 소유: NativeGame.PetBubble/PetBubbleCapture 신규 partial, NativePetBubbleQueue/Policy/Hints/Catalog/View helper, pet_bubble JSON·원화 Resources, pet-bubble-tests, 전용 Editor compile gate와 NativeGame.cs의 시작/Update/Draw 최소 호출. Core/저장/다른 레인 배치/보스 자막 변경0.
- 기준 원본: latest-web game.html9534~9688/9832~9865와img/crow·cat_pet/portrait.png를 직접 읽고 두 원화를 열어 확인. 한 번에1개·페어·우선순위/쿨다운은 웹 공통 방식, 명조/RTL은 Unity 기존 경로. 원화 신규생성0.
- 가장 큰 차이는 게임 중 표현 큐 부재다. 원문 키를 보존하는 단일 입찰 슬롯+현재/페어 큐를 순수 C#로 만들고 자연 Update 관찰과 제어된 Mac fixture를 분리한다.
- 웹 bossAlive는 구역 단위로 false가 될 수 있고 Unity Stage.BossAlive는 미생성 필드부터true다. 환경 자동연결은 실제 보스 생존→처치가 관찰된 뒤30초초과/flag=false라는 보수적 공통부분만 사용한다. 초기 필드 환경은 조건 동등성 미확정으로자동발동하지않음. 보스 페어는live arena actor 존재. GB1 위치4줄은29언어카탈로그만,위치좌표추정/자동연결0.
- 합격/중단: 관련suite1회(이전61항반복0),공용exo-unity 컴파일1회; 같은결함2FAIL중단. 테스트 계약을 먼저 작성하되 사용자suite1회 제한에 따라 구현전RED실행은하지않는다. 첫 실물/최종판정은동일SHA Mac1920/3840·1x/3x·언어/키변경/페어/T5/가림/새run. PC는게임실행0.

## 11-04 승인 백로그: Unity 게임 중 펫 말풍선 1차

범위: 원문 키를 보존하는 전용 큐·카탈로그·원화 표현과 최소 Update/Draw 연결. Core/로비·설정 배치/보스 자막/저장/플레이 수치 변경0,웹 readonly,새 문구·재번역·유료생성0.

| 항목 | 이번 계약 |
|---|---|
| 카탈로그 | 기존14키×29언어,9cue. 웹10키+등록GB1 4키. GB1 JSON은 unity/main에 blob이 없어 latest-web의 기존 등록 JSON을 읽어 가져왔다 |
| 생존 | 실제Hp/MaxHp 읽기.0<HP<10% critical(가중100,3+3초,30초CD);10%이상30%미만 crisis(60,4+4초,20초CD);30%이상50%미만 warn(40,3+3초,60초CD).50%이상은발화0 |
| 큐 | 한 프레임 최고 입찰1개·현재1개·후속페어1개. 같은티어는먼저, T5는높은가중 우선. 현재T5보다낮거나같은가중은덮지않음. 경고를뒤늦게재생하는대기열없음 |
| 전역CD | T0~T5=20/12/8/6/4/0초. T5는현재/페어교체·T0~T4를최소5초억제. id CD와동시에적용 |
| 첫보스 | chapter1의실제InArena+Boss!=null+Alive+BossAlive를관찰해5초까마귀→4초고양이. 로딩종료뒤발화,수락된후1회처리 |
| 환경 |4+4초,id CD99999초. 웹G.bossAlive는구역단위,Unity Stage.BossAlive는필드부터true라동등하지않음. 실제live보스관찰후flag=false처치관찰+허용시간30초초과라는공통부분만자동연결. 초기필드30초멘트는보류 |
| GB1 | No.3855~3858카탈로그만연결. 새위치추정/자동발화0,경계/1회성은맵총괄확정뒤 |
| 가림/수명 | 메뉴·로비·대화/인벤/스킬/능력치/대장간·로딩·클리어·포커스상실숨김/타이머정지.죽음은현재/페어삭제. 새Simulation/스테이지/아레나출입/틱역행에서쿨다운·1회성초기화. 구독이없어이전run이벤트잔여0 |
| 피날레 | DemoMode·stage3·InArena·BossAlive에서T0~T2현재/새대사차단, T4/T5허용 |
| 원화/문자 | 웹crow/cat_pet portrait.png1536×1024그대로,Resources Art/PetBubble(밉맵OFF/Bilinear).480×320기준×1.5=720×480,아래HUD위220·좌/우20. 까마귀문자(92,237,306,51),고양이(122,250,190,42)를같이×1.5. 오른쪽연습안내가있으면고양이도왼쪽. 명조22→최저12자동맞춤·기존RTL전체문자열경로 |
| 표시 | 최대alpha.6,남은시간비율^0.6으로감쇠. 원화생성/코드판/잔점추가0. 실제1x가독성은Mac대기 |
| 언어/키 | 현재와페어의원문키보존. Draw마다선택29언어/실제Bindings다시조회해언어·키변경에즉시따름,타이머재시작0. Unity전투패드GP_KEY매핑이없어웹LB등을임의표시하지않고실제키표시만사용(패드전투안내보류). 음성/SFX추가0 |

실제트리거와QA는별도다. --unity-pet-bubble-smoke는자연HP/환경/보스이벤트를발생시키지않고전용큐를직접조작해원화/페어/언어변경/T5/메뉴숨김/현재키6컷을찍는다. storesDisabled/rosterUnchanged와scope를영수증에적는다. 자연보스진입·HP경고·사망/로딩/재진입은Mac실게임별도관문이다.

검증: 관련suite1회=실제순수C#정책38항+소스/데이터53항PASS. 기존importer61항과aa7d컴파일반복0. 공용exo-unity compile1회(job32dd8c55)는UPM IPC30초연결실패/exit1로C#컴파일전종료(compileMs0). compile gate메서드미실행,최종Unity컴파일은미검증이다. 사용자1회제한으로재시도0,PC Player/build/바탕화면/Steam0·USER_SAVE변경0.


### 펫 1차 Mac 인자와 남은 관문

공용 숨김 GPU 실행 경로에서 동일 SHA Player에 아래 인자를 전달한다(PC 실행 금지). 각 해상도는 같은 고정 출력에 덮어쓴다. Player에는 nographics를 붙이지 않는다.

~~~zsh
for w in 1920 3840; do
  out="$OUT/$w"; mkdir -p "$out"
  "$PLAYER" -mute-audio -screen-fullscreen 0 -screen-width "$w" -screen-height 1080 \
    --unity-pet-bubble-smoke --unity-boss-direct 0 -text-lang ko -pet-switch-lang ar \
    --unity-qa-sandbox "$out/qa-save" -output "$out" -logFile "$out/player.log"
done
~~~

출력: pet-env-crow / pet-env-cat / pet-language-ar / pet-T5-interrupt / pet-menu-hidden / pet-current-binding의6PNG(언어·실제해상도 접미사),pet-bubble-ko.json. ko 대신 en/ja/fr/ar 및 나머지29언어를 지정할 수 있다. passed는원화로드·페어·언어문자열갱신·인터럽트·메뉴guard·QA로스터불변의표현검사이며시각/자연발화PASS가아니다. 현재키컷은실제Bindings를읽는다. 재바인딩/입력장치전환자체를fixture가만들지않는다.

Mac 필수: 원화 프레임·텍스트칸과HUD/우측연습안내를전체1x/3x에서대조,명조12~22px의29언어줄바꿈/태국어/아랍어RTL,현재·페어언어변경,키재바인딩,실제HP 50/30/10% 경계/T5,실제보스진입,메뉴·로딩·죽음가림/새run·아레나재진입을자연플레이로확인한다. 초기환경/GB1위치/패드전투힌트는보류범위라해당 컷을완료로세지않는다. PC공용컴파일이UPM전단에서실패했으므로Mac빌드전컴파일관문도미검증이다.

## 펫91b95 미완료 컴파일 관문 후속

- 91b95 소스의 최초 DLL참조 컴파일에서 NativePetBubbleCatalog.cs(28,34) CS0103(LobbyLanguage 이름 미확인) 1건을 검출했다. LobbyLanguage는Core 네임스페이스이므로 자기펫파일에using Exoduser.UnityPort.Core; 1줄만추가했다. 관련확인1회:Player Core126/Runtime279,Editor Core126/Runtime279/Editor61의5어셈블리exit0·오류0. 전체참조컴파일은오류검출1입력+원인수정후1입력이며무수정반복0. 기존38+53suite재실행0.
- 전회공용Unity32dd8c55는C#시작전Upm-14180 IPC30초실패/exit1이다. 동일Unity6000.6.7f1의근접성공영수증c4505bef(시각기준205초전),d4c9bb48(477초전)은UPM연결0.2초/46패키지등록을확인했다. exe96002992B존재·실행인자(projectPath/method/nographics/mute/sandbox)정상전달은확인했지만작업본/그래픽인자/과거자식환경이다르다. 해당시점UPM전용로그부재로프로세스실패원인/Defender차단/PATHEXT문제는미확정이다. 현재전역Editor.log는5월다른버전이므로근접근거로쓰지않았다. Unity재실행/공용실행기·잠금·환경·권한·보안설정변경0.
- DLL참조는기존NTFS Roslyn/패키지/DLL을읽기참조한C#검증이다. 실제Unityimport/UPM복구/플랫폼빌드/게임PASS가아니다. 표시·큐·문구·로비·폰트축소·Core/저장수치변경0. Mac동일SHA자연이벤트/1920·3840/글리프·RTL·1x/3x관문은그대로다. 고정compile-current의result/attempts/핵심로그로인계하고재생성DLL/PDB/RSP는정리한다.

## 11-04 04:05 우상단 HUD 4키

NativeObjectivePanel의info.english한영분기를없애No.0374레벨/0371경험치/3982지역처치/0415악의오브(3766같은키)의29언어를조회한다. 세키는웹기존번역,지역처치는웹非KO키28누락을기존EN+27번역으로보완했다. 원래77개행/R1·R2/입장이야기/보스·펫문구는불변,총81키다. export.cjs에동일objectiveArea매핑을넣었다. Thai등은조합문자를쪼개지않고기존명조/RTL전체문자열경로를쓴다. [후보캡처·미검증](UNITY_UI_CANDIDATE_20261104.md).

## 04:05 후보 시작 결함 후속
실제 a02cb84850 후보는 빌드PASS 뒤 첫 로비 시작에서 StageFlowBossBar의 초기 locale 접근이 실패했다. Awake는 ResetRun/UpdateViews 뒤에 NativeLobby를 생성한다. 기존 문구 연결의 locale1줄만 null일 때 기본ko를 유지하도록 고쳤고, null+29언어 회귀30조건/참조5어셈블리 오류0. 새 Unity/Player 확인은 없으며 후보 EXE는 수정 전이다. 캡처0/50, 디자인·Mac 관문 대기. [빌드SHA·실패·제한](UNITY_UI_CANDIDATE_20261104.md).

## 05:00 시작 수정의 실제 실행 확인
e3b3bc977 후보에6dd5f710a의null안전화가포함됐고, 첫로비를포함한18 Player실행이정상종료해50장을확보했다. 두해상도사망fixture의29언어HUD4키완전성체크true, 실제th컷은영어대신태국어4키를표시한다. 29언어전체글리프·펫자연이벤트/GB1보류·Mac자연플레이판정과는구분한다. 이전시작HOLD는이번실행에서해소. [실행SHA/증거](UNITY_UI_CANDIDATE_20261104.md).

## 05:40 HUD 라벨 측정 후속
번역 내용 변경 없이4행 라벨/숫자 실제 폭과 최소16px 간격으로 판을216~480px에서 정한다.11px까지 축소 후 필요하면 줄바꿈 높이를 확장한다. actual GUI 폰트로29언어×4키를 int.MaxValue 표시 폭까지 측정하는 사망 fixture 116행을 추가했다(Simulation 수치 불변). 이름/삭제 질문은 기존 나눔명조 우선 선택으로 디자인총괄 글꼴 RETOUCH를 반영한다. [계약·검증 범위](UNITY_UI_CANDIDATE_20261104.md).

## 05:40 실제 측정과 한계
540fdcde20 후보의1920 실제 GUI116행은 전부 gap≥16px, 최솟값16/최장nl 라벨136.58px다. Greek 숫자 붙음 해소와 이름/삭제 실제 나눔명조를 확인했다. 새 번역0/총81키 불변. 공용 종료 로그읽기 결함2FAIL로3840·재촬영 후속은 중단했고 전체29언어의 자연플레이/글리프 합격과는 구분한다. [실행기 오류와 남은 관문](UNITY_UI_CANDIDATE_20261104.md).

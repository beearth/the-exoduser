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

## 펫 말풍선 조사 (5항 · 구현은 다음 회차)

조사 결과와 확정 범위는 아래 「펫 말풍선 후속 범위 확정」에 기록했다. 이번 회차의 게임 중 말풍선 구현은0이다.

## 구현·확인 결과

- 보스35 stage 이름·지역 HUD·진행 알림·보스 대사 총77개 키×29언어를 demo_text.json/NativeDemoText로 연결했다. 값은 웹 a78daf055의 최종 Object.assign까지 반영한 정본이다. 새 문구를 웹에 추가하지 않았다. No.4258 완성 알림의29언어는 Unity 데이터에 전파했다.
- 한글 아틀라스에 없는 보스 이름은 명조 전체 문자열로 그린다. 지역 안내도 비KO에서 문자를 잘게 쪼개지 않아 태국어/아랍어 연결을 보존한다. 기존 장식 영문 보조행은 남긴다. 아랍어는 UI Toolkit Advanced/RTL을 기존 Naskh 동적 폰트/PanelSettings로 격리 렌더하며 각 IMGUI 위치·깊이에서 합성한다(최대24캐시, 미초기화 렌더타깃 투명 초기화).
- startup_intro.json은29언어×KO 정본27cue(총783cue, 언어당 표시문구18개)다. KO 문장/시간/이미지/화자/순서 보존. 기존 en/ja/zh의 빠진22b를 채우고23의 깨우기 의미를 KO에 맞췄다. 신규25언어는 이번에 번역했다. 글꼴 fallback/줄바꿈/타자 노출은 기존 입장 UI에 연결했다. 새 번역의 원어민 감수는 대기다.
- BossLineRaised를 Simulation마다 구독하고 이전 구독을 해제한다. 로딩 중 intro0는 화면이 열린 뒤3.2초를 시작하도록 대기한다. 메뉴/대화상자/사망/클리어/로딩에서 표시하지 않는다. 웹 bottom19%/폭860/은빛 헤어라인/명조 배치를 사용한다. 판/버튼 원화5항목과Core 수치·판정 수정0.
- hellgate_objectives의 빠진 ar8개(No.4250~4257)도 채워29언어가 됐다. 목표 패널·로딩 이름은 같은 RTL/명조 렌더 경로를 사용한다.
- PC 데이터·소스8항 PASS(최초6FAIL→구현후PASS, 로딩 수명/촬영 진입 결함 검출 후 보강). 원화 importer38회귀PASS. 문구 최종 DLL 참조 컴파일1회: Player Core126/Runtime269, Editor Core126/Runtime269/Editor60,5어셈블리 오류0. Unity 실행/Player/빌드/캡처0. 따라서 시각/자연입력/런타임 동작은 아직 Mac 미검증이다.

## 펫 말풍선 후속 범위 확정 (이번 구현0)

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

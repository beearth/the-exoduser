# 데모 v0 1-1 이야기 문구 점검 (STY-23, 2026-11-04)

- 지시: CTO 11-03 야간 지시 — 1-1 진입, 지역 정화, 보스 등장·퇴장, 체험판 종료 화면의 이야기 문구를 한 표로 점검하고 29개 언어와 번역 목록 등록 상태를 본다.
- 기준: origin/unity/main `eaf67fae9`의 코드·`Resources/Data`. 웹 정본은 origin/main `a78daf055`(latest-web)의 `game.html`·`lang_*.js`.
- 방법: 코드와 데이터만 읽었다. PC에서 Player는 실행하지 않았다(11-03 사용자 지시). 화면 판정은 Mac 검수가 한다.
- "언어" 열은 실제로 화면에 나오는 언어다. "ko·en"은 나머지 27개 언어에서 영어가 나온다는 뜻이다.

## 1. 점검표

| # | 순간 | 화면 문구 (ko) | Unity 위치 | 언어 | 번역 목록 | 판정 |
|---|---|---|---|---|---|---|
| 1 | 1-1 진입 · 구역 제목 | 제1구역 · 썩은 숲 1구역 / THE ROTTEN FOREST | `NativeAreaTitle.cs` + `areatitle_web.json` | ko·en | 미등록(형식·이름 둘 다) | 결함: "구역"이 두 번 나온다. 27개 언어가 영어다. STY-21 새 제목 8개(No.3847~3854, 29개 언어 준비)로 바꿀 자리다. 구간 경계(맵 총괄 GB1)가 정해지지 않아 아직 연결하지 않았다 |
| 2 | 1-1 진입 · 펫 대사 | 까마귀 "…새 한 마리 안 우네. 숲이 다 먹었어." / 고양이 "…나무가 우릴 보고 있어. 기분 나빠." (웹 `_envDlg[0]`) | 없음 | — | 등록(No.3480·0852) | 미구현: Unity에는 게임 중 펫 말풍선이 없다(사망 화면 대사만 있다). STY-21 펫 대사 4줄(No.3855~3858)도 같은 장치가 필요하다 |
| 3 | 지역 배너 | 북서 · 어둠 — 정화 / REGION PURGED · n / 4 / 처치 n / m / 앵글러 생존 | `NativeRegionHud.cs` 코드 안 `L(ko,en)` | ko·en | 등록(No.3083 외) | 27개 언어가 영어다 |
| 4 | 지역 정화 · 목표 패널 | 지옥문 봉인 — 정화한 지역 n/4 · 이 지역 정화됨 — 남은 지역으로 · 보스방으로 — 미니맵 지옥문 표식을 따라 이동 | `NativeHellGateLabels.cs` + `hellgate_objectives.json` | 28개(ar → en) | **이번에 등록** No.4250~4257 | 수정함: ko "심연 아귀"를 정본 이름 "심연의 앵글러"(No.3001)로 맞췄다. ar은 영어로 나온다 |
| 5 | 필드보스 알림 | 심연의 앵글러 / 필드보스 처치! | `NativeGame.FieldBoss.cs` | ko·en | 등록(No.3001·3002) | 27개 언어가 영어다 |
| 6 | 보스방 진입 | 봉인됨! | `NativeGame.StageFlow.cs` `WorldTextAdd` | ko·en | 등록(No.0331) | 27개 언어가 영어다 |
| 7 | 보스 등장 · 이름표 | 다크드루이드 | `NativeBossBar.cs` + `bossbar_web.json` | **ko만** | 등록 | 결함: 영어를 포함한 모든 언어에서 한국어 이름이 나온다. 영어 이름은 STY-18(Dark Druid)에 있다 |
| 8 | 보스 등장 · 한 줄 자막 | 새 거름이 떨어졌군. (`intro0`) | Core `BossLineRaised`만 있음 | 표시 안 됨 | 등록(No.3343) | 미구현: Core가 이벤트를 내지만 그리는 곳이 없다 |
| 9 | 보스 등장 · 펫 대사 | 까마귀 "…첫 번째다. 부담 갖지 마. 죽어도 다시 와." / 고양이 "첫 보스야. 겁먹지 마, 우리도 있어." (웹 `_bi[0]`) | 없음 | — | 등록(No.3630·3631) | 미구현(2와 같은 장치) |
| 10 | 보스 퇴장 · 한 줄 자막 | 숲은 아직 배고프다. 둥지에서 보자. (`sink0`) | Core `BossLineRaised`만 있음 | 표시 안 됨 | 등록(No.3344) | 미구현(8과 같다) |
| 11 | 보스 처치 | 출구가 열렸다! (떠오르는 글자) + 보스 처치 · 출구가 열렸다 (알림) | `NativeGame.StageFlow.cs` | 떠오르는 글자 ko·en, 알림 **ko만** | 떠오르는 글자 등록(No.0516), 알림 **이번에 등록** No.4258 | 결함: 알림은 모든 언어에서 한국어로 나온다 |
| 12 | 체험판 종료 · 제목·버튼 | 구역 클리어! / 데모 종료 | `NativeStageClearOverlay.cs` + `stageclear_labels.json` | 29 | 등록(No.3675 외) | 통과 |
| 13 | 체험판 종료 · 부제 | 썩은 숲은 아직 끝나지 않았다. | 같은 곳 `demoSub` | **이번에 29개로** | 등록(No.3473) | 수정함: 옛 문구 "썩은 숲을 정복했습니다."(STY-14 A1 이전)가 남아 있었고, 27개 언어는 영어였다. 웹 정본 29개 언어로 바꿨다 |
| 14 | 첫 실행 인트로 컷신 자막 | (컷신 대사) | `startup_intro.json` | ko·en·ja·zh 4개 | — | 25개 언어에 자막이 없다(1-1 직전 첫인상 범위) |

## 2. 이번에 고친 것 (unity/main)

| 파일 | 변경 |
|---|---|
| `Resources/Data/stageclear_labels.json` | 29개 언어 `demoSub`를 웹 STY-14 A1 문구(No.3473)로 바꿨다. 언어별 번역은 latest-web `lang_*.js`의 같은 키에서 그대로 가져왔다 |
| `Resources/Data/stageclear_web.json`·`buildflavor_web.json`·`NativeStageClearOverlay.cs` 영문 기본값 | 진단 화면과 빌드 분기 대체 문구의 옛 부제를 같은 새 문구로 바꿨다 |
| `Resources/Data/hellgate_objectives.json` (ko) | 심연 아귀 남음 → 심연의 앵글러 남음, 아귀 처치됨 → 앵글러 처치됨 |

## 3. 최초 점검 시 남은 일 (현재 후속 상태는4절)

| 우선 | 일 | 필요한 것 | 담당 후보 |
|---|---|---|---|
| P0 | 보스 한 줄 자막 표시(8·10) | `BossLineRaised` 구독 + 웹 `#bossLine` 배치를 기준으로 한 Unity 자막 UI, 29개 언어 데이터 | Unity UI 구현 + 보스전 총괄 |
| P0 | 보스 이름표 언어(7) | `bossbar_web.json` 이름에 29개 언어 추가(STY-18 영어 이름 + 웹 `lang_*.js`) | 스토리(데이터) + UI 구현(조회) |
| P1 | 게임 중 펫 말풍선(2·9, STY-21 펫 4줄) | 펫 말풍선 UI 장치 | Unity UI 구현 |
| P1 | 구역 제목 교체(1) | STY-21 구간 경계(맵 총괄 GB1) | 맵 총괄 → 스토리 |
| P1 | ko·en만 나오는 HUD 문구(3·5·6·11) | 공통 언어 조회로 바꾸기. 27개 언어 번역은 웹 `lang_*.js`에 이미 있다 | Unity UI 구현 |
| P2 | 인트로 자막 25개 언어(14) | 컷신 대사 번역 전파 | 스토리(번역 일괄) |

## 4. 11-04 00:40 Codex 후속 (UI 구현, 실제 Mac 판정 대기)

| 점검 번호 | 현재 구현 | 남은 관문 |
|---|---|---|
|3·5·6·11|지역/앵글러/봉인/출구 안내를 demo_text.json77키29언어로 연결, No.4258 완성 알림 전파|선택 언어의 실제 HUD 글리프/줄바꿈|
|4|지옥문 목표 ar8키를 추가해29언어, 목표 패널 RTL 렌더 연결|실제 RTL·목표 패널 가독성|
|7|35stage 보스 이름29언어 조회, 한글atlas 밖 이름은 명조 문자열|보스 이름/HP바/상태 겹침|
|8·10|BossLineRaised 구독·원문18줄29언어, 로딩 종료 뒤3.2초 수명·웹 bottom19% 명조 배치|자연 진입/침강·재진입·메뉴/죽음 가림|
|14|입장 이야기29언어×27cue(기존4→29). KO 정본 보존·22b 누락/23 깨우기 의미 연결|29언어 첫인상/타자노출·원어민 감수|
|2·9|웹 동작·티어/페어/쿨다운·후속 연결 범위 조사 완료. 말풍선 구현0|다음 회차|
|1|STY-21 지역 제목/경계 연결은 이번 범위 밖|맵 총괄 GB1 확정|

현재 source/데이터 확인과PC DLL 참조 컴파일만 통과했다. 위 최초 점검표의 미구현은 조사 당시 이력이다. [구현·Mac 인자·펫 후속 범위](../3.1%20ui%20hud%20디자인/UNITY_DEMO_TEXT_20261104.md).

## 5. 레인 결과 문구 판정 — `codex/unity-demo-text-20261104` @2cca15bef (2026-11-04)

판정: **RETOUCH(경미)**. 아래 R1·R2를 고치면 문구 PASS다. 화면(글리프·RTL·줄바꿈)은 Mac 검수가 따로 판정한다.

대조 방법: `demo_text.json` 77키×28언어를 웹 latest-web `a78daf055`의 `lang_*.js`·`_EN` 마지막 정의와 글자 단위로 비교했다(2,100건 중 2,074건 일치). 보스 한 줄 18키는 `_BOSS_LINES` 원문과 일치한다. `startup_intro.json`은 29언어×27 cue로, id·시간·이미지·화자가 KO와 같고 KO 문장은 바뀌지 않았다. 한글 누출 0, 자리표시자 누락 0, 옛 문구("썩은 숲을 정복"·"아귀") 0.

| # | 대상 | 문제 | 고칠 내용 |
|---|---|---|---|
| R1 | `startup_intro.json` 9개 언어의 "악의" | 게임 자원·화폐 "악의오브"와 다른 낱말을 썼다. 입장 이야기는 이 자원을 처음 설명하는 대사라 용어가 같아야 한다 | 낱말을 게임 용어로 바꾼다(cue 13·14·18b·23 등 "악의"가 나오는 모든 cue). fr malveillance→malice, tr kötülük→hınç, th เจตนาร้าย→อาฆาต, id niat jahat→kedengkian, ar الخبث→الضغينة, sv ondska→illvilja, fi pahuus→ilkeys, nl kwaadaardigheid→boosaardigheid, el κακία→μοχθηρία. 문장 뜻은 그대로 둔다 |
| R2 | `demo_text.json`·`bossbar_web.json`의 7장 보스 "Killu" | 웹 STY-14 A8(No.3477)부터 한국어 이름은 "킬루"다. Unity는 옛 추출값 "Killu"를 한국어 자리에 쓰고, 언어별 표기도 빠졌다. 데모 1-1에는 보이지 않는다 | 키와 ko를 "킬루"로 바꾼다. 언어별 값: zh·zht 基路, ja キルル, th คิลลู, ru Киллу, uk Кіллу, bg Килу, el Κίλου, ar كيلو, 나머지 Killu |

고치지 않아도 되는 것:

- 26건(봉인됨!·출구가 열렸다!·출구·독버섯 거인)은 웹 마지막 정의와 글자가 다르다. 하지만 Unity 쪽이 뜻이 맞고 표기가 낫다(예: de 웹 "Ausfahrt"는 고속도로 출구, Unity "Ausgang"이 맞다). Unity 값을 그대로 쓴다.
- 입장 이야기의 조연 이름 Diroy·Hector는 정본(웹 인트로·펫 대사·Steam 상점)과 같다. 웹 `lang_*.js`의 단독 키 "디로이/핵터"가 Deroy/Hecter로 남아 있는 것은 웹 쪽 불일치다(웹 유지보수 몫, 이번 병합과 무관).
- `지옥문 봉인 (지역 `은 코드가 이어 붙이는 조각 키라 목록에 단독 행이 없다. 전체 문구 "지옥문 봉인 (지역 N/4)"로 등록된 것과 같다.
- 아랍어 데이터는 논리 순서로 저장돼 있고, UI Toolkit Advanced·RTL로 모양과 방향을 처리한다. 맞물림·정렬(왼쪽 정렬 상자 안의 RTL 문장)은 Mac 화면에서만 판정할 수 있다.
- 새로 번역한 25개 언어 입장 이야기는 원어민 감수 전이다. de·fr·es·ru·ar 18줄을 읽어 본 범위에서는 오역이 없었다.

## 5. 체험판 flavor 문구 판정 — `codex/unity-demo-flavor-20261103` @d53d9b6fa (2026-11-04)

판정: **RETOUCH(경미)**. F1·F2를 고치면 문구 PASS다. F3은 demo-text 병합 뒤의 후속이고, 이번 병합을 막지 않는다.

대조 결과, 그대로 써도 되는 것:
- `demoSub` 29개 언어는 STY-23 정본(No.3473)과 같다.
- `demoNext` 29개 언어는 기존 등록 No.2824 "데모 종료 / End of Demo"와 같다.
- 한글 누출 0, 옛 문구 0.
- 게임 안 "데모 종료"(No.2824)는 그대로 둔다. 스팀 9.2 초안의 "체험판"은 Steam 상점 화면의 용어라서 화면이 다르다.

| # | 대상 | 문제 | 고칠 내용 |
|---|---|---|---|
| F1 | `demoWishlist`(No.4261) | ko "본편"이 스팀 9.2 초안("정식판")과 웹 게임 용어 `'정식판'`과 다르다. 17개 언어도 웹 `'정식판'` 번역어와 다른 낱말을 썼다. vi "danh sách ước"는 Steam 용어가 아니다 | 아래 문구로 바꾼다(나머지 11개 언어는 그대로) |
| F2 | 번역 목록 No.4259·4260 | 4259는 이미 등록된 No.3473과 같은 문구다. 4260 "데모 종료"는 기존 No.2824이고, 영어도 "End demo"가 아니라 "End of Demo"다 | 4259·4260 행을 지우고 No.3473·2824를 참조한다. `buildflavor_web.json` button 영어 "End demo"도 "End of Demo"로 바꾼다 |
| F3 | 완료 화면 아랍어 | `EffectiveLocale`이 ar을 en으로 돌린다(기존 동작). demo-text 브랜치에 아랍어 RTL 경로(`NativeDemoArabicText`)가 생겼다 | 후속: demo-text 병합 뒤 완료 화면도 같은 경로로 아랍어를 표시한다 |

F1 바꿀 문구:

| 언어 | 문구 |
|---|---|
| ko | 정식판 위시리스트에 추가 |
| zh | 将正式版加入愿望单 |
| zht | 將正式版加入願望清單 |
| vi | Thêm bản đầy đủ vào danh sách mong muốn |
| th | เพิ่มเวอร์ชันเต็มในรายการสิ่งที่อยากได้ |
| id | Tambahkan versi penuh ke wishlist |
| ms | Tambah versi penuh ke senarai hajat |
| de | Vollspiel auf die Wunschliste setzen |
| sv | Lägg fullversionen på önskelistan |
| da | Føj den fulde version til ønskelisten |
| no | Legg fullversjonen på ønskelisten |
| ru | Добавить полную версию в желаемое |
| uk | Додати повну версію до бажаного |
| pl | Dodaj pełną wersję do listy życzeń |
| cs | Přidat plnou verzi do seznamu přání |
| bg | Добавяне на пълната версия в желания |
| fi | Lisää täysversio toivelistalle |
| tr | Tam sürümü istek listesine ekle |
| ar | أضف النسخة الكاملة إلى قائمة الأمنيات |

번역 목록 No.4261의 KO 칸도 "정식판 위시리스트에 추가"로 바꾼다.
## 6. 11-04 01:50 R1·R2 반영

- R1:한국어에 악의가 있는 cue13·14·18b·23에서9언어36문장의 용어만 화폐 용어로 정합했다. fr malice/tr hınç/th อาฆาต/id kedengkian/ar الضغينة/sv illvilja/fi ilkeys/nl boosaardigheid/el μοχθηρία. 터키어·핀란드어·그리스어 조사/소유형, 아랍어 명사의 성에 따른 동사·형용사 일치만 함께 맞췄다. KO/나머지20언어/시간·이미지·화자·순서 불변.
- R2:No.3477의 킬루를 demo_text 키/ko와 bossbar stage33에 연결했다. zh·zht基路/jaキルル/thคิลลู/ruКиллу/ukКіллу/bgКилу/elΚίλου/arكيلو,기타 Killu. 추출 도구에도 같은 override. KO atlas에 킬이 없어 명조 전체 문자열 경로로 fallback하도록 이름 표시를 보완했다.
- 다른76개 카탈로그 키·기존26건 허용 표기/문장 뜻/데모1-1 구조는 유지한다. 번역 목록3477/3876/3877/3881/3885 상태 갱신·CRLF 보존.
- 데이터/소스 회귀9항PASS. PC 최종 참조컴파일은02:00 meta 정합 뒤1회로 확인한다. 스토리총괄의 R1/R2 조건에 맞춘 반영이며 실제 글리프/RTL·줄바꿈/디자인·원어민 판정은 별도 Mac 대기다.

### 02:00 검증 중단 후속

R1/R2 데이터·소스9항PASS는 유지한다. 예정했던 최종 PC컴파일은 후속 importer 검사 확장 SyntaxError2회로 중단되어 미실행이다. 이전 컴파일을 이번 문구 소스의 컴파일 근거로 쓰지 않는다. 문구 구현/번역 검토 상태와 실제 Mac 폰트·RTL·화면/자연재생 검수는 분리한다.

### 01:40 실제시각 재개 결과

위02:00 중단은 이전 실행 이력이다. 추가 검사 작성의 문자열 치환 문제를 직접패치로 제거해61항1회PASS,최신c4b388903 병합소스의PC DLL참조컴파일1회5어셈블리 오류0을 확인했다. R1/R2 문구는 그대로이며 실제Unity/Mac 폰트·RTL·자연재생 판정은 여전히 대기다.

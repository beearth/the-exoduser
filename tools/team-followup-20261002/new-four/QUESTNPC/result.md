# QUESTNPC 초기 설계·구현 지도와 최소 흐름 검토

작업 ID: `QUESTNPC-INITIAL-FLOW-20261002`  
담당: Codex 퀘스트·NPC팀. 총괄1+전문15=16역할 / Claude8·Codex8.  
실제 체크아웃: `/Users/fordeargamers/Projects/exoduser-migration-20261001`  
TASK 기준 HEAD: `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82`  
착수·작성 전 실제 HEAD: `4cd0cb4906daee2b7953af7284f9ecc3ef96dd49` — TASK 작성 뒤 기준이 달라졌으나 이 작업은 Git을 수정하지 않았다. 변경 원인은 이번 조회 범위에서 UNKNOWN.  
상태 / 반영 단계: **초기 정적 인수 완료 / 소유 보고서 2개. 기획 초안 미채택, 생산 적용 없음.** 완료 시각·최종 SHA·Changes는 evidence.json을 기준으로 한다.

## 확인 결과

디로이·핵터는 WORLD_CORE의 동료/거점 NPC 설계와 현행 펫 화자 구현이 함께 존재한다. 거점에 서서 대장간 서비스를 제공하는 NPC로 연결됐다고 계산할 근거는 찾지 못했다. 대장간은 독립 패널이며 펫 대사가 열기 방법을 알려준다.

별도 `src/fieldNpcRoster.js`에는 마렌·에단·이실라의 데이터와 상호작용 반환 함수가 있다. 정의·호출 검색 C52에서는 해당 모듈과 기존 테스트만 매칭됐으며, 지정 3개 HTML의 import/생성/렌더/입력 연결은 미발견이다. 이 결과는 roster 문서의 runtime hookup pending과 일치한다. 기존 기획을 새 캐릭터로 추가하거나 STORY 정본으로 승격하지 않았다.

양쪽 HTML에 펫 대사·시스템 안내·상인 악마 거래·스테이지 진행·INTRO 완료 저장이 있다. 그러나 이들은 서로 다른 시스템이다. 전용 퀘스트 ID/상태/목록을 검색했을 때 지정 3개 HTML에서 명시적 식별자가 나오지 않았다. **프로젝트 전체 퀘스트 미구현 확정으로 확대하지 않는다.**

## 설계·구현 지도 1판

행 번호는 이번에 읽은 디스크 소스 기준이며 모든 경로는 위 체크아웃 아래다. “구현”은 정의·호출을 읽었다는 뜻이고 이번 실게임 검수 PASS가 아니다. 보상 수치는 기존 계약을 옮긴 경우만 적는다. 행의 QN 식별자는 이 보고서의 지도 행 ID이며 production questId가 아니다.

| 설계 id | 한글명·인물 | SSOT 파일·행 | source 파일·행·식별자 | 시작·상호작용·조건·종료·보상 | 저장·복원 연결 | 판정 | 관련 팀·Gate |
|---|---|---|---|---|---|---|---|
| QN01 / WORLD_CORE 동료 | 디로이·핵터 거점 NPC 역할 | docs/11내러티브·로어디자인/WORLD_CORE.md:295–298, 382–386; PETS_DESIGN_LOCK.md:3–15 | game.html:30417,40091–40098 / G.pets.cat·crow, updatePet; easy:29235,38891–38898 | 현재는 follow 펫 실체와 자동 대사. 거점 접근·서비스 대화·목표·완료·보상 연결은 미확인. 충 보유는 TBD | 펫 일시 상태와 거점 NPC 진행 저장을 동일시하지 않음. 거점 상태 필드 연결 미발견 | 동료/거점 역할 **설계**; 펫 실체·대사 **소스 구현**; 거점 서비스 **UNKNOWN** | STORY 로어/충 결정, QUESTNPC 상호작용 계약, UIUX 대화 진입. MAP 배치 별도 배정 |
| QN02 / tut_firstItem | 첫 아이템 안내 / 핵터→디로이 | docs/11내러티브·로어디자인/펫_대사_스크립트.md:11–15,39,89–93; docs/2_4 펫시스템/2_4 펫시스템.md:21–22 | game.html:8982–8987,9066–9077,9148–9155,9231–9243; easy:8438,8521–8532,8682–8694 | G.on·G.pets에서 체크. si=0·P.lv≤200·firstItem=false·INV.bag.length≥1. 핵터 “TAB을 눌러. 가방을 열고 장비를 입어야 한다.”→디로이 “주웠으면 껴야지! TAB!”. 목표 수락/장착 완료/보상 연결 없음. flags를 표시 성공 전에 true로 만드는 현행 순서 | _petTut은 런 내 임시 플래그(소스 주석), 게임 저장 필드에 연결 미발견. 재접속 단발 보장으로 계산하지 않음 | 대사 트리거 **구현**; 완료 퀘스트 **미연결/UNKNOWN** | UIUX·QUESTNPC 출력 성공/우선순위 인수, ITEM 실제 객체 사건 |
| QN03 / pickup·inventory·equipment | 기존 시스템 안내 / 인물 없는 관찰 UI | docs/2게임디자인레벨디자인/SYSTEM_TUTORIAL_20260912.md:3–25; docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md:373–377 | system-lesson.js:19–31,65–97,128–146; main:10,15641,15700,30858; easy:10,14748,14805,14817,29676 | 전투 실습 종료·stage0·G.on·HP>0·기상/실습/저장 중 아님을 만족하면 자동 시작. pickedUp은 실제 소유 객체, equipped는 실제 장착 객체 확인. 패널 열림/eq: 선택도 equipment 완료. skip은 성공과 분리, close는 closed=true·active=false. 순서 자유. 전체 기존 7항목 성공 때 기존 systems 장식 배지 | checks/skipped는 메모리 Set. tutorial-badges.js:16–17,53–59의 슬롯별 localStorage에 획득 시각 저장. 서버·게임 세이브·새 NPC 완료 필드 아님 | 정의·호출·완료·취소·기존 배지 저장 **구현**. 실제 화면/패드/저장 왕복 **미실행** | UIUX 안내 UI/입력, QUESTNPC 대사 연동 Gate, ITEM/BALANCE 신규 보상 금지 |
| QN04 / etype93 | 상인 악마 | docs/8.2레어몹디자인/8.2레어몹디자인.md:9,24–27; 마스터 바이블:839 | main:29721,30114,38904–38932; easy:28552,28934,37698–37725 | 미사용·도주 아님·거리<50, raw KeyF. 비용 _malCost(100+~~(G.stage*5)); 충분하면 차감 후 rarity4 30%/rarity3 70% 장비를 바닥에 생성, 즉시 가방 지급 아님. 성공/부족 모두 _mcShopUsed=true와 _mcFleeDelay=120. 실제 구현은 직접 거래 분기, 독립 상점 패널은 이 구역에서 없음 | flags는 적 객체. main _saveZoneState:28920–28922 / easy:27754–27756의 ens 투영에 거래 flags 없음. 표준 game/inv 세이브에 거래 완료 필드 미발견. 재진입·구역 이동·재시작의 단발 보장은 UNKNOWN | 거래 **소스 구현**; 문서 “상점 UI”와 실제 직접 거래 표현 차이. 내구성 있는 NPC 진행 저장 **UNKNOWN** | ENEMY 적 객체 수명, ITEM/BALANCE 거래 경제, UIUX raw KeyF/사용자 바인딩·패드 별도 |
| QN05 / ch1-merchant | 마렌 / 필드 상인 데이터 | docs/4.1맵디자인+설정/CH1_FIELD_NPC_ROSTER_20260923.md:3,9,19,29 | src/fieldNpcRoster.js:1–10,31–41 / open_shop, buildCh1FieldNpcRoster, getNpcInteraction | 기존 상호작용 문장/역할·action 데이터. 모듈은 조회/복사만 수행하며 실제 상점 실행·조건·종료·보상 코드 없음. 기존 좌표 유지, 새 배치 제안 없음 | 자체 저장 경로 없음. 런타임 생성/렌더/입력 미발견 | 데이터·조회 **구현**, production 연결 **미발견/미연결**, 작동 **UNKNOWN** | MAP 기존 배치 소유, STORY 기존 명단 정본성 검토, UIUX/ITEM open_shop 소비 Gate |
| QN06 / ch1-survivor | 에단 / 생존자 데이터 | 같은 roster:3,10,19,29 | src/fieldNpcRoster.js:11–19,31–41 / start_rescue_hint | 기존 북쪽 길 안내 문장 반환. rescue 목표·수락·대상·성공·실패·보상 없음. action 이름을 구조 퀘스트 구현으로 계산하지 않음 | 상태/보상 저장 없음. 테스트 호출만 확인 | 데이터·조회 **구현**, 구조 퀘스트 **UNKNOWN** | STORY 문안, MAP 연동, QUESTNPC 조건/완료 계약 별도 배정 |
| QN07 / ch1-guide | 이실라 / 북문 안내 데이터 | 같은 roster:3,11,19,29 | src/fieldNpcRoster.js:20–27,31–41 / show_gate_hint | 기존 성문 문장 반환. 실제 출입 사건·완료·보상 소비 없음 | 자체 저장/복원 소비 없음 | 데이터·조회 **구현**, production 연결 **미발견/미연결** | STORY·MAP·UIUX, 기존 gate 사건과 연결 별도 |
| QN08 / forge·tut_keyG | 복수의 대장간 / 핵터·디로이 안내 | docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md:302,373–377; 펫_대사_스크립트.md:30 | main:9252–9257,42569,48876–48892; easy:8703–8708,41366,47449; system-lesson.js:144 | 일반 forge 입력/패널 → G.paused=true·renderForge → G.forgeOpen=true. keyG 안내는 P.lv≤200·G.mats≥30·장착 rarity≥3·keyG=false. 시스템 forge 완료는 패널 열림, 강화 소비 요구 안 함. 펫을 클릭해야 열리는 서비스는 미발견 | 강화/제작의 기존 item/mats 저장은 해당 시스템 소유. NPC 방문/대화 완료 저장으로 재해석하지 않음 | 패널·안내 **구현**, 디로이/핵터 대장장이 상호작용 **UNKNOWN** | UIUX 패널, ITEM/BALANCE 경제, STORY 인물 역할 |
| QN09 / INTRO·cutsceneDone·cin_seen | 네메시아·디로이·핵터 도입과 기존 인트로 완료 | docs/11내러티브·로어디자인/11내러티브·로어디자인.md:48–50,66–73; docs/15 세이브+데이터구조/15 세이브+데이터구조.md:40,217–221,394–416 | main:60529–60532,60907–60922,3718; easy:59251–59255,3489; index:2179–2194,3279–3300,4176–4184 | 생성 성공 뒤 char0 스토리→showCharGate→기존 INTRO/기상. INTRO 종료는 G._cutsceneDone=true·_startIntro. 완료/스킵은 전체 시청 증명이나 NPC 퀘스트 완료가 아님. 계정 세계관 시청과 캐릭터 INTRO를 구분 | game.cutsceneDone은 표준/데모/로컬/웹 저장·dbRestore 연결. cin_seen은 계정 정본/로컬 캐시. 신규 quest 완료 플래그 아님 | 정의·호출·직렬화 **구현**, 현재 재생/수동 입력 **미실행** | STORY 서사/원문, UIUX 입력, BUILD 패키지, QUESTNPC 완료 필드 혼용 금지 |
| QN10 / stageCleared·clearRecords·hellCleared | 기존 구역/장 진행 사건 | docs/15 세이브+데이터구조/15 세이브+데이터구조.md:33–41,207–209; 메타 문서:3,5–19 | main:40496,40522–40541,40585–40608,42415,3537–3543,3707–3723; easy:41212,3310–3316,3479–3489 | 보스 아레나 출구·bossAlive=false→stageCleared, 기존 SP+10·기록·장 탈출 상태. nextStage가 초기화/다음 stage 진입. NPC 완료/턴인 코드와 연결 없음. 기존 SP를 퀘스트 추가 보상으로 재지급하지 않음 | stage/kills/clearRecords/hellCleared는 저장. stageCleared와 퀘스트 수락/턴인 상태는 같은 저장 필드가 아님 | 기존 진행 **소스 구현**, 신규 퀘스트 관측 후보 **미연결** | BOSS/ENEMY 사건 정확성, BALANCE 기존 보상, SAVE/BUILD 기존 호환 인수 |
| QN11 / 전용 퀘스트 식별자 | quest·questId·questState·questLog·NPC | 메타 문서:3,21–26은 미작성/예정 범위; WORLD_CORE:403은 메모리 파편 수집 채택 TBD | C23: 지정 game.html/game-easy-test.html/index.html, 경계 포함 정규식 검색 0매칭(exit1 정상 미발견) | 별도 수락→목표→턴인→보상 파이프라인을 확인할 명시적 식별자 없음. requestIdleCallback은 제외 | 검사한 game/inv 직렬화와 dbRestore에 새 quest 필드 없음 | **지정 범위 미발견 / 전체 상태 UNKNOWN** | 총괄 후속 소유 범위 확정 후 다른 모듈/외부 구현 조사 |

## 기존 인물을 활용한 최소 초안 1건 — 디로이의 “주웠으면 껴야지”

**기획 제안이며 미채택·미구현이다.** 새 인물·새 로어·충 정체·거점 좌표·새 맵 배치·새 저장 필드·새 보상량을 만들지 않는다. 디로이는 기존 cat 동료 화자로 활용한다. 이미 있는 장비 실습을 대체하거나 별도 장비 퀘스트 상태를 병렬로 만들기보다, 기존 안내의 실제 사건을 이용한 대사 연동 후보를 제시한다.

| 단계 | 구체적인 후보 흐름 | 현행 근거 / 구현 의존성 |
|---|---|---|
| 등장/접근 | 기존 G.pets.cat이 있는 일반 진행에서만 접근 가능한 안내. 새 NPC 스폰·거리·위치 없음. 시스템 실습이 열린 이후, 기상/앞선 전투실습/사망/QA/에디터/보스테스트/튜토리얼 해제 경로를 기존 eligible/available로 존중 | system-lesson.js:19–27,128–133. companion cat 생성은 main:30417/40092. 시스템 안내와 _petTut의 stage0·Lv≤200 제한은 서로 다름; 새 레벨 조건 확정하지 않음 |
| 대화 진입 | 기존 첫 아이템 대사를 재활용할 수 있는 안전 시점에 짧은 cat 안내. 전투를 강제로 멈추거나 새로운 상호작용 키/모달을 추가하지 않는 방향. 기존 tut_firstItem이 이미 출력됐으면 같은 목표 문장을 중복 출력하지 않도록 UIUX/QUESTNPC가 실제 성공 기준으로 연결 | 기존 cat 원문 “주웠으면 껴야지! TAB!”은 펫_대사_스크립트.md:39 및 main:9243/easy:8694. 기존 flags는 표시 성공 증명이 아니므로 그대로 수락/완료 근거로 쓰지 않음 |
| 목표 안내 | 본편은 “주운 장비를 인벤토리에서 선택해 장착/확인”. easy는 이미 자동 장착된 장비가 있으면 “인벤토리를 열어 장착품 확인”. 패널의 현재 키는 BINDS/BINDS2를 따른다. 원문 TAB은 기존 대사이며 새 고정 바인딩을 확정하지 않음 | system-lesson.js:11–13,29–31. main pickupItem은 가방행, easy:14795–14805는 자동 장착. UIUX 목표/키 표기별 인수 필요 |
| 기존 진행 사건 관측 | 기존 checks의 pickup·inventory·equipment가 실제 완료됐는지 관측하는 후보. pickup 성공은 실제 소유 객체, equipment는 equipItem 성공 또는 실제 eq: 장착칸 선택. 장착 거부/가방 부족/유골 등록을 성공으로 세지 않는다. 기존 안내의 equipment를 “동일 획득품 수동 장착 성공”으로 강화하지 않음 | system-lesson.js:85–97,138–140; main:15632–15642,15675–15700; easy:14739–14749,14795–14817. 같은 아이템을 끝까지 추적하는 별도 의뢰가 필요하면 새 계약·저장 논의 Gate로 분리 |
| 완료 대화 | 기존 안내의 해당 실제 성공을 확인한 뒤 cat의 짧은 마무리 1회 후보. 문안 **“그래, 이제 네 손으로 고른 장비네. 계속 가자.”**는 새 제안이며 승인 원문 아님. 서사 반전·인물 충 보유·새 사실을 담지 않는다. 출력 충돌 중이면 지연·재확인하고 표시 성공 전에 완료 처리하지 않는 후보 | 기존 _petSay/_petSayCD 성공 bool과 우선순위·보스 피날레 차단 보존. 새 문장/번역/음성·분류·길이·재시도 수치는 STORY/UIUX/SOUND/QUESTNPC 후속 결정 |
| 중복 방지 | 이미 기록된 기존 checks를 다시 성공시키거나 badge complete를 새로 호출하지 않는다. 마무리의 임시 발화 상태는 표시 성공 이후에만 소비하는 방향. listener 등록/해제와 늦은 콜백은 이번 진입의 cat/guide 수명 확인 뒤 처리하는 후보 | 시스템 checks/skipped·closed는 기존 메모리 계약. 지속적인 questId/완료 필드가 있다고 가장하지 않는다. 이벤트 bridge 구현은 총괄 함수 소유권 배정 뒤 |
| 취소·재진입 | 안내 전체 닫기 또는 해당 항목 건너뛰기는 완료 대화/보상 없이 종료. 메뉴를 닫았다 다시 열어도 기존 checks를 존중. 사망·stage/캐릭터 이동·페이지 이탈이면 연결 해제. 재접속 때는 기존 인벤/진행/튜토리얼 설정을 읽고 안내가 허용되는 경우에만 재진입; 지난 회차의 디로이 대화 완료 여부는 저장된 사실로 복원할 수 없음 | system-lesson.js:65–71,85–86,128–146. 페이지 간 완료 보장이 필요하면 저장 schema/로컬 키 확정 Gate이며 현재 초안에서 생성하지 않음 |
| 보상 | 후보 목적은 기존 실습의 이해를 돕는 대사다. 신규 화폐·SP·장비·배지·강제 소비 없음이라는 **초안 방향**만 둔다. 장식 배지는 기존 systems 7항목 전체 완료에만 기존 경로가 지급. 이 짧은 안내만으로 기존 배지를 지급하지 않는다 | tutorial-badges.js:53–59 / SYSTEM_TUTORIAL:21. 보상 필요·종류·량·경제는 ITEM/BALANCE/총괄 결정. 기존 stage SP+10과 합산/복제 금지 |

**기존 제약만으로 현재 가능한 부분:** 기존 디로이 원문과 펫 출력기, 실제 획득/장착/패널 관측, 기존 guide 취소/skip과 badge 중복 차단이 존재한다.  
**새 구현이 필요한 부분:** 디로이 발화와 시스템 안내의 안전한 연동, 출력 성공에 따른 임시 중복 차단/해제, 마무리 문안/번역과 입력·시각 인수. 아직 연결 코드/목표 UI/완료 대화는 없다. 현행 checks는 장비 같은 객체 수동 장착만을 보증하지 않으며, 일반 퀘스트 로그/수락/턴인 저장의 대체물이 아니다.

## 발견된 문서·소스 차이와 정확한 보충 문안

공유 docs는 읽기 전용이므로 아래 문안을 **총괄 반영 후보**로 이 보고서에만 기록했다. 소스·수치·확정 설계를 변경하지 않았다. 보호 2_3 문서 수정 제안도 없다.

| 대상 | 발견 / 현행 근거 | 보충 또는 정정 문안 (그대로 사용 가능한 후보) |
|---|---|---|
| docs/11내러티브·로어디자인/11내러티브·로어디자인.md | WORLD_CORE의 거점 NPC 역할과 현행 펫 대사를 구분할 상세 구현표 부족 | **디로이·핵터 구현 단계:** WORLD_CORE의 동료·거점 NPC 역할은 설계 계약이다. 현행 game.html/game-easy-test.html의 cat/crow는 추종 펫 및 대사 화자로 연결돼 있다. 대장간은 독립 forge 패널이며 펫 대사가 접근 키를 안내한다. 두 인물의 거점 NPC 생성·상호작용·서비스 제공·별도 의뢰 완료 상태 연결은 이번 지정 소스 범위에서 미발견이며 전체 구현 여부는 UNKNOWN이다. 충 보유 여부는 WORLD_CORE의 TBD를 유지한다. |
| 펫_대사_스크립트.md의 tut_firstItem·tut_keyG | firstItem은 첫 픽업 이벤트 자체가 아니라 가방 길이 상태 조건. keyG의 “레어 아이템 보유”는 현행 장착 rarity≥3·mats≥30·Lv≤200보다 거침. flags를 호출 전에 소비 | **현행 조건:** tut_firstItem은 G.on·G.pets의 대사 체크 중 si=0·P.lv≤200·_petTut.firstItem=false·INV.bag.length≥1에서 발생한다. tut_keyG는 P.lv≤200·G.mats≥30·장착품 rarity≥3·_petTut.keyG=false를 요구한다. _petTut은 런 내 임시 플래그이며 표시 함수의 성공 전에 true가 되는 현행 순서가 있으므로 플래그를 대사 실제 표시/퀘스트 완료의 증거로 사용하지 않는다. |
| docs/3.2메타·진행시스템/3.2메타·진행시스템.md | 신규 quest 전용 필드/수락/턴인 설계 미발견 | **퀘스트·NPC 초기 조사 범위:** 지정 game.html/game-easy-test.html/index.html에서 경계를 둔 quest/quests/questId/questState/questLog/NPC/퀘스트 식별자 검색은 0매칭이다. requestIdleCallback을 quest 구현으로 세지 않는다. 기존 펫 안내·시스템 실습·상인 거래·stage 진행은 별개 기능이며 전용 수락/목표/턴인/보상 상태머신 구현 여부는 UNKNOWN이다. 새로운 퀘스트 수치·보상·저장 schema는 확정하지 않았다. |
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md | cat 안내·system checks·badge·cutsceneDone의 저장 범위 혼동 위험 | **안내와 진행 저장 경계:** _petTut과 _systemLesson.checks/skipped는 런 내 상태다. 기존 systems 배지 획득은 exoduser:tutorial-badges:v1:<slot> localStorage에 저장하며 서버/게임 세이브와 동기화하지 않는다. game.cutsceneDone·stage·kills·clearRecords·hellCleared·inv 저장은 기존 서사/진행/아이템 상태이며 신규 NPC 의뢰 완료를 뜻하지 않는다. 이번 초기 조사에서 quest 완료 필드를 추가하거나 기존 플래그를 전용하지 않았다. |
| docs/8.2레어몹디자인/8.2레어몹디자인.md:27 | “상점 UI 제공”에 비해 실제 etype93은 근접 raw KeyF 직접 거래 | **etype93 현행 거래:** 미사용·미도주 상태에서 거리<50이면 [F] 상점 안내를 띄우고 raw KeyF로 1회 거래 분기를 실행한다. 비용은 _malCost(100+~~(G.stage*5))이며 충분할 때 차감 후 rarity4 30%/rarity3 70% 장비를 월드에 생성한다. 비용 부족 때도 _mcShopUsed=true와 _mcFleeDelay=120이 설정된다. 이 분기는 독립 상점 패널과 구분한다. flags의 구역 재진입/재시작 보장은 별도 검수 대상이다. |
| docs/2게임디자인레벨디자인/SYSTEM_TUTORIAL_20260912.md / system-lesson.js:11 | JS pickup 설명은 “빈 슬롯 자동 장착”이 공통인데 main은 가방 우선, easy는 자동 장착. 문서 실제 완료 조건은 객체 소유로 올바르게 구분 | **판본별 획득 안내:** 본편 game.html은 일반 장비를 빈 슬롯 여부와 관계없이 가방에 넣고 플레이어가 장착한다. game-easy-test.html은 빈 슬롯 자동 장착 경로를 유지한다. 시스템 pickup 성공은 실제 가방/장착 객체 소유로 판정하며 equipment 성공은 장착품 선택 또는 equipItem 성공이다. 같은 안내 문안의 자동 장착 표현을 모든 판본에 적용하지 않는다. 수정 후보는 UIUX 소유로 양쪽 문구/키/언어 인수 후 반영한다. |
| CH1_FIELD_NPC_ROSTER_20260923.md | data implemented/runtime pending과 실제 모듈 정의·테스트 호출 정합 | **초기 인수:** src/fieldNpcRoster.js의 3개 기존 NPC 데이터와 buildCh1FieldNpcRoster/getNpcInteraction은 존재한다. 이번 정의·호출 검색에서 production HTML의 소비는 미발견이고 테스트의 호출만 확인했다. action 문자열이 상점·구조 의뢰·gate 관측 구현을 뜻하지 않는다. 기존 좌표/충돌 계약은 변경하지 않았으며 새 배치·MAP 시각 판정은 수행하지 않았다. |

## 미실행 Gate와 다음 인계

| Gate | 소유/협업 | 미결정·미검증 내용 |
|---|---|---|
| 제안 채택·함수 소유 | 총괄 / QUESTNPC·UIUX | 디로이 안내 후보 채택, 기존 systemLesson 소비 경로·생명주기/초점 소유 확정. 지금 임의 후속 작업 생성하지 않음 |
| 원문·서사 | STORY / QUESTNPC | 기존 문장 재사용 여부·새 마무리 원문 승인. 충 보유/TBD·새 인물·새 로어 확정 없음 |
| 실제 사건·판본별 안내 | ITEM·UIUX / QUESTNPC | 본편 가방행/easy 자동장착, 장착품 선택 완료 의미, 실패·유골·요구레벨·강화이전비용 경계. UI 변경/테스트/실행 없음 |
| 대사 우선순위·언어·SFX | UIUX·SOUND / QUESTNPC | 표시 성공 후 소비, 긴급/보스 차단, 한영/사용자 키/패드, 중복·취소·늦은 콜백. main sourceTxt와 easy 미보존 차이 인수 필요 |
| 보상 경제 | ITEM·BALANCE / 총괄 | 신규 보상 미확정, 기존 7항목 배지·stage 보상 중복 금지. 새 보상량/비용 변경 없음 |
| 저장·재진입 | BUILD·UIUX / QUESTNPC | 기존 slot/char 튜토리얼 설정과 game 기록 구분, 페이지 간 대화 완료 기억 필요 여부. 새 key/schema·실저장·재시작 검수 없음 |
| 필드 NPC와 상인 | MAP·ENEMY·ITEM·STORY | 기존 roster 미연결 인수, etype93 거래 수명/부족/입력 계약, 실제 action 소비. 추가 배치 시 MAP 가이드 전체/SSOT/§23 보고 선행 |
| 검수 | QA / 해당 소유 팀 | 이번 테스트 재실행·new tests·checks·UI·서버·실게임·빌드 모두 0. 정적 인수 완료를 기능/플레이/시각/저장 PASS로 쓰지 않음 |
| 공유 작업 보존·checkpoint | 총괄 | 시작 Changes 53 → 중간 59 → 작성 직전 59. 타 담당 항목 증가이며 소유권/원인은 UNKNOWN. 80/100 기준의 Git 작업은 이 팀 금지; 임계 도달 시 총괄에 보고. 최종 count와 보호 SHA는 evidence.json |

## 검색 범위와 결과

전체 docs/ 검색에서 569개 매칭 행을 완전 회수했다. 파일별 개수는 아래 부록, 전체 원문은 evidence.json의 docsSearch.rawMatches에 있다. 검색 중 공유 문서가 변할 수 있어 앞선 C22 파일별 집계와 C56 원문은 각각의 조회 시점으로 분리한다.

전체 검색 패턴: `\bquests?\b|퀘스트|\bNPC\b|거점|상점|대장간|디로이|핵터|_petSay|_checkPetDialogue` (`rg -n -i … docs/`). rg 기본 ignore/hidden/binary 정책을 적용했으며 docs 밖 한글 백업 폴더는 이 검색 범위가 아니다. 외부 Steam 상점/영상/번역 기록 매칭은 게임 내 상점 구현으로 세지 않았다. 모든 매칭 문서 본문을 완독했다는 주장은 하지 않으며 직접 관련 절을 선별해 읽었다.

소스 고유 식별자는 C23의 `\bquests?\b|\bquest(Id|State|Log|Complete|Active)\b|\bNPCS?\b|퀘스트`를 3개 HTML에 적용했다(0매칭, exit1). C19의 초기 넓은 quest(Id…) 패턴이 requestIdleCallback을 잡은 오탐은 이 경계 검색으로 제외했다. 초기 출력 한도가 걸린 C11/C12/C17/C18은 불완전 검색 영수증으로 남겼으며 C56은 전체 docs 원문을 완전 회수한 별도 영수증이다.

### docs 전체 파일별 매칭 수 (C22 조회)

| 파일 | 매칭 행 |
|---|---:|
| docs/미구현+구현예정.md | 1 |
| docs/8.2레어몹디자인/8.2레어몹디자인.md | 3 |
| docs/2_4 펫시스템/2_4 펫시스템.md | 19 |
| docs/2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md | 2 |
| docs/0마스터플랜/TEAM_STRUCTURE_PROPOSAL_20260930.md | 1 |
| docs/2_4 펫시스템/대사_스크립트.md | 35 |
| docs/16번역·로컬라이제이션/STEAM_LANGUAGE_SCOPE_20260909.md | 3 |
| docs/2_4 펫시스템/대사_개편_v7_설계.md | 4 |
| docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md | 2 |
| docs/16번역·로컬라이제이션/LANGUAGE_PACKAGE_20260923.md | 2 |
| docs/7아이템디자인/exoduser-item-system-full.md | 1 |
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md | 2 |
| docs/16번역·로컬라이제이션/CHARACTER_STORY_TRANSLATIONS_20260909.md | 5 |
| docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md | 1 |
| docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md | 5 |
| docs/16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md | 5 |
| docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md | 1 |
| docs/0마스터플랜/EXODUSER_PRODUCT_MARKET_STRATEGY.md | 2 |
| docs/3.3 키바인딩+설정/게임패드_벤치마킹_엘든링_디아블로4.md | 2 |
| docs/3.3 키바인딩+설정/게임패드_매핑표.md | 3 |
| docs/7아이템디자인/어픽스_시스템_현황분석_2026-08-10.md | 1 |
| docs/14밸런스+수치테이블/14밸런스+수치테이블.md | 1 |
| docs/16번역·로컬라이제이션/번역_가이드.md | 2 |
| docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md | 3 |
| docs/CHANGELOG_SYNC.md | 33 |
| docs/7아이템디자인/유니크_어픽스_리스트.md | 3 |
| docs/16번역·로컬라이제이션/번역대상_전체목록.md | 97 |
| docs/CHANGELOG_DAILY_20260520.md | 1 |
| docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md | 2 |
| docs/16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md | 1 |
| docs/7아이템디자인/어픽스_Layer_재분류_설계_2026-08-10.md | 1 |
| docs/1전체그래픽세팅/GODDESS_INTRO_REMASTER_20260930.md | 2 |
| docs/16번역·로컬라이제이션/번역대상_펫대사.md | 7 |
| docs/16번역·로컬라이제이션/번역대상_UI시스템.md | 6 |
| docs/1전체그래픽세팅/IMAGE_TEXTURE_RUNTIME_20260913.md | 4 |
| docs/8.0몬스터디자인/몬스터_총관리.md | 2 |
| docs/4.1맵디자인+설정/DEPTH_2_5D_BENCHMARK_20260930.md | 3 |
| docs/4.1맵디자인+설정/tilemap-editor.html | 3 |
| docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md | 1 |
| docs/16번역·로컬라이제이션/RESUME_LANGUAGE_INTEGRATION_20260923.md | 2 |
| docs/4.1맵디자인+설정/map-objects-placeholder-prompt (2).md | 1 |
| docs/4.1맵디자인+설정/DIABLO_FIELD_REBUILD_PLAN_20260923.md | 1 |
| docs/4.1맵디자인+설정/CH1_FIELD_NPC_ROSTER_20260923.md | 3 |
| docs/3.1 ui hud 디자인/기사 인물 아트 공용화 2026-09-27.md | 1 |
| docs/1전체그래픽세팅/맵_화면효과_전수조사.md | 2 |
| docs/4.1맵디자인+설정/맵디자인_벤치마크.md | 2 |
| docs/8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md | 1 |
| docs/1전체그래픽세팅/INTRO_QUALITY_CONTINUITY_20260913.md | 10 |
| docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md | 3 |
| docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md | 1 |
| docs/8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md | 1 |
| docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md | 16 |
| docs/3.1 ui hud 디자인/GEM_ATELIER_20260927.md | 1 |
| docs/10ai에셋프롬프트모음/게임패드_가이드_이미지_프롬프트.md | 1 |
| docs/3.1 ui hud 디자인/능력치_패시브_개편_20260909.md | 2 |
| docs/10ai에셋프롬프트모음/UI_아이콘_GPT_생성프롬프트팩.md | 1 |
| docs/4.1맵디자인+설정/MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md | 1 |
| docs/10ai에셋프롬프트모음/IMAGE_PROVIDER_PRIORITY_20260925.md | 1 |
| docs/10ai에셋프롬프트모음/UI_프레임_배경_생성프롬프트.md | 3 |
| docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md | 29 |
| docs/3.1 ui hud 디자인/UI_SCALING_20260929.md | 1 |
| docs/3.1 ui hud 디자인/PASSIVE_BODY_TREE_UI_20260909.md | 2 |
| docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md | 2 |
| docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md | 1 |
| docs/4.1맵디자인+설정/tilemap-editor.html.broken | 2 |
| docs/3.1 ui hud 디자인/exoduser-hud-redesign.md | 5 |
| docs/16영문화(i18n)/영문화_진행현황.md | 7 |
| docs/모바일패키징_Android_해결리포트.md | 1 |
| docs/11내러티브·로어디자인/펫_대사_스크립트.md | 5 |
| docs/17게임아트팀/ART_TEAM_MASTER.md | 9 |
| docs/0마스터플랜/mac-resume-20261001/gap-attribution-evidence/attribution.json | 1 |
| docs/4.1맵디자인+설정/EXODUSER_MAP_BIBLE_v3 (1).md | 1 |
| docs/4.1맵디자인+설정/맵제작_타게임전수조사.md | 1 |
| docs/11내러티브·로어디자인/WORLD_CORE.md | 9 |
| docs/4.1맵디자인+설정/tilemap-editor.html.bak2 | 3 |
| docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md | 1 |
| docs/11내러티브·로어디자인/11내러티브·로어디자인.md | 2 |
| docs/4.1맵디자인+설정/DIABLO_FIELD_IMPLEMENTATION_CONTRACT_20260923.md | 1 |
| docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-CHATS-20261002.json | 1 |
| docs/11내러티브·로어디자인/PETS_DESIGN_LOCK.md | 4 |
| docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md | 2 |
| docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md | 17 |
| docs/6사운드디자인/6사운드디자인.md | 3 |
| docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.json | 2 |
| docs/2_8 퀵슬롯+물약시스템/2_8 퀵슬롯+물약시스템.md | 2 |
| docs/cinematic/STORY_KOREAN_GRAMMAR_20260910.md | 5 |
| docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md | 9 |
| docs/4.1맵디자인+설정/tilemap-editor.html.bak | 2 |
| docs/cinematic/WARINTRO_CREATION_RUNTIME_20260910.md | 1 |
| docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-CHATS-20261002.md | 1 |
| docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md | 2 |
| docs/2게임디자인레벨디자인/SYSTEM_TUTORIAL_20260912.md | 1 |
| docs/13출시·마케팅/STEAM_DASHBOARD_AUDIT_20260909.md | 20 |
| docs/2게임디자인레벨디자인/2게임디자인레벨디자인.md | 1 |
| docs/2게임디자인레벨디자인/TUTORIAL_GAP_AUDIT_20260913.md | 1 |
| docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md | 7 |
| docs/13출시·마케팅/STEAM_STORE_LOCALIZATION_20260909.md | 4 |
| docs/13출시·마케팅/시장포지셔닝_정통루팅ARPG.md | 1 |
| docs/13출시·마케팅/STEAM_REVIEW_SUBMISSION_20260920.md | 2 |
| docs/13출시·마케팅/STEAM_LATEST_DEPLOY_20260909.md | 1 |
| docs/최종기획서/build_document.py | 1 |
| docs/13출시·마케팅/STEAM_REVIEW_REMEDIATION_20260916.md | 8 |
| docs/13출시·마케팅/13출시·마케팅.md | 2 |
| docs/13출시·마케팅/STEAM_REVIEW_FINAL_CHECK_20260918.md | 12 |
| docs/13출시·마케팅/STEAM_EARLYACCESS_LOCALIZATION_20260910.md | 5 |
| docs/13출시·마케팅/STEAM_REVIEW_20260926.md | 17 |
| docs/13출시·마케팅/STEAM_INSTALL_REVIEW_20260916.md | 9 |
| docs/13출시·마케팅/STEAM_LANGUAGE_UPLOAD_20260923.md | 5 |
| docs/13출시·마케팅/STEAM_REVIEW_READY_CHECKLIST_20260918.md | 9 |
| docs/API연결_가이드.md | 1 |
| docs/13출시·마케팅/HELL_DIROI_종합확장전략기획서_v2_0.md | 2 |

## 소유·보존과 완료 경계

완료 관측에서 HEAD는 `2e451ee8be7019fe540010ae862d7142da4170e6`, Changes는 48개(C79/C80)였다. 착수 HEAD 이후 공유 체크아웃의 변경이며 이 팀 Git 쓰기는 0이다. 정책·PM 두 문서의 SHA도 달라져 최신 본문을 다시 읽었다(C83/C84). 작성자·변경 원인은 UNKNOWN이며 되돌리지 않았다. 필수 생산·기존 테스트 6경로의 시작/완료 SHA는 동일하다.

작성은 이 폴더의 result.md·evidence.json 두 파일뿐이다. 공유 docs 보충은 위 후보 문안으로 인계했으며 실제 공유 문서 수정·production 변경·Git 쓰기·삭제·cleanup·계정·외부 게시·새 세션·하위 팀·다른 채팅 메시지는 0이다. test/nodeMainMats.test.js는 보존 SHA만 읽었고 테스트를 실행하지 않았다. 필수 생산 6경로와 읽은 핵심 SSOT의 시작/완료 SHA·실제 명령·exit·Read 행은 evidence.json에 기록했다. 타 담당 변경은 보존하고 되돌리지 않았다.

다음 TASK 배정을 기다린다. 퀘스트 실제 구현·대화/패드/실게임·보상 지급·세이브 왕복·시각 품질·빌드 완료는 이번 완료 범위에 포함되지 않는다.

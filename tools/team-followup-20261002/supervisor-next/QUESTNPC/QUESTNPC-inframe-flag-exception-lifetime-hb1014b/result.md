# QUESTNPC — _petInFrame 예외 수명 검수

양판 실제 소스에서 생존 mid-fire 중 오디오 setup 예외가 전파되면 `_petInFrame=true`가 남는 것을 재현했다. 메모리 후보는 동일한 Error 객체를 전파하며 `finally`로 flag만 false로 정리한다. 같은 입력의 정상 종료 control은 원본과 전체 관측 상태가 동등했다. 신규 case group 4개 PASS. **productionApplied=false, runtimeAccepted=false**.

## 범위·영수증

| 항목 | 값 |
|---|---|
| TASK | QUESTNPC-inframe-flag-exception-lifetime-hb1014b |
| checkout | /Users/fordeargamers/Projects/exoduser-migration-20261001 |
| 기존 담당 chat | 01a0fae0-ccb2-7572-9d58-8c3176f9afff |
| 배정 UTC / KST | 2026-10-02T11:02:19.288804+00:00 / 2026-10-02 20:02:19.288804 KST |
| 관측 UTC / KST | 2026-10-02 11:03:06 UTC ~ 2026-10-02 11:06:57 UTC / 2026-10-02 20:03:06 ~ 20:06:57 KST |
| 성공 실행 UTC / KST | 2026-10-02T11:06:34.572Z / 2026-10-02 20:06:34.572 KST |
| 역사적 제공 checkpoint | d5c1b62d. Git 조회 0; current HEAD 확인·주장 0 |
| 소유 산출 | 이 폴더 checks.mjs + result.md만 |
| Node | /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node |
| 실제 Node 시도 | 2회: 구문 실패 exit 1 한 번, 복구 후 완료 exit 0 한 번 |
| 완료 검사 | 양판 × (예외/후속 이벤트 + 정상 control) = 신규 4 group |
| 이전 검사 재실행 | 0. urgent mapQA/firstItem/T4/T5 종전 회귀 재검수 0 |

TASK·COMMON·AGENTS·TEAM_CONTINUATION_POLICY 및 펫 SSOT 관련 구간을 읽었다. 최초 TASK 정확 read 후 실행했다. 코드/공유 docs/Git/index/이전 산출/서버/실게임/사용자 save/audio 장치/빌드 수정·사용 0. root mapQA guard WIP 소유 보존. 다른 담당 작업·기존 검사를 확장하지 않았다.

## primary / candidate / control 관측

입력: `G.on=true`, pause false, stage 4, bossAlive true, bossRef null, `P.lv=501`, HP 5/100, MP/ST full, dt=1, pets 존재, 적/투사체 빈 배열, `_MAP_QA_MODE=false`. 실제 생존 producer가 `hp_critical` T5/weight100을 제출한다. 실제 lv>500 guard로 생존 mid-fire 후 tail이 종료된다. 후보의 정상 동등 판정은 이 입력 경로에 한정된다.

| 경계 | 원본 양판 | 후보 양판 |
|---|---|---|
| 실제 call chain | update guard/pet call → updatePet → full _checkPetDialogue → urgent → fireBid → say → bubbleShow/SFX → playFM | 동일 |
| createOscillator 예외 직후 flag | true 잔존 | false |
| Error | injected-createOscillator-failure, 주입한 원 Error와 identity 동일 | 동일 Error identity; 삼키거나 교체하지 않음 |
| 예외 직후 PB | tier5, weight100, id hp_critical | 원본과 동일 |
| 예외 직후 bubble/pair | HP 위기 crow 180f / cat 180f 이미 저장됨 | 원본과 동일 |
| 예외 직후 CD / tier CD | ID CD 빈 객체, tier 6개 모두0 | 동일 |
| 예외 직후 HUD/오디오 trace | 실제 leaf HUD 작성됨, oscillator1, activeNodes0 | 동일 |
| 하니스 지정 후속 boss_gate_open 호출 | inFrame true, returned false: 기존 weight100에 default50 입찰 거절 | inFrame false, returned true: 실제 프레임 외 인터럽트 |
| 후보 후속 결과 | 기존 HP 위기 상태 유지 | gate crow240f/pair cat240f, UID boss_gate_open, CD1800f, T0~T4 각각300f |
| 후속 이벤트 뒤 PB | hp_critical tier5 잔존 | **같은 PB 잔존**; 추가 cleanup 정책 없음 |
| 정상 control | flag false, PB tier -1, hp_critical ID CD1800f, 실제 HUD/SFX 경로 | 원본 snapshot과 deepEqual |

후보는 flag 수명만 복구한다. 예외 전에 쓰인 bubble·pair·PB·HUD 상태와 예외 뒤 아직 쓰이지 않은 CD를 rollback하지 않는다. 오디오 전체 복구나 frame 성공을 주장하지 않는다. 내부 우선순위·CD·pair·tier 정책을 수정하지 않았다.

## 최소 메모리 패치

```diff
 function _checkPetDialogue(){
   // 기존 선행 guard 보존
   _PB.tier=-1;_petInFrame=true;
+  try{
     // 원본의 나머지 함수 본문 전체
     // 기존 mid-fire 및 _petInFrame=false;_PB.tier=-1; 그대로 유지
+  }finally{_petInFrame=false}
 }
```

실제 checks는 생략 주석을 대체한 full 원문 함수를 추출하여, 고유한 true assignment 직후 try를 삽입하고 최종 함수 brace 직전에 finally를 넣는다. catch/return 추가 0. 기존 mid-fire reset 삭제 0. 후보 함수 SHA256 양판 동일 `2cc47215c3f2e6df85be975b2e50156054ebd25299ff677131afbf3fb2c27f3a`. 이는 후보 함수 hash이며 전체 production 파일 hash가 아니다.

## 실행한 소스와 대역 경계

- full dispatcher, updatePet, urgent/fire/bid/CD/timer/TierOf/BagNext/say/SFX/HUD 및 실제 pet·priority·opacity 선언을 추출했다. full playFM setup도 실행했다. 원문 line/fragment SHA는 아래 JSON에 포함했다.
- update는 실제 guard prefix와 pet call만 연결했다. 중간 gameplay, 나머지 update/AI/combat/브라우저 loop는 실행하지 않았다.
- DOM은 leaf node/style 대역, 번역·padify는 identity. 실제 _petBubbleShow는 실행했다. 실제 화면 픽셀 검수 0.
- AudioContext/node/params/connect/start/stop은 합성 대역. createOscillator에서 공유 Error 객체를 의도적으로 throw했다. playNoise·timer는 sink. 실제 장치 예외 관측·청취 0.
- 실제 playFM setup(main12056–12072/easy11460–11476)에는 해당 setup 예외를 삼키는 catch가 없다. disconnect cleanup catch와 구분한다.
- 전체 실제 gate caller(main40503–40527/easy39305–39329)는 합성 region count4/gate 상태에서 실행했다. 예외 catch 뒤 하니스가 해당 block을 호출했다.

**실제 게임 호출 시점은 미검수다.** gate block은 보통 동일 update의 뒤쪽에 있으며 앞선 예외는 그 update를 중단한다. 실제 outer loop catch(main60035/easy58367)는 다음 RAF(main60040/easy58371)를 예약한다. 다음 정상 dispatcher가 stale flag를 먼저 정리할 수 있다. 따라서 이번 자료는 예외 직후 flag 불변식과 명시적으로 지정한 후속 이벤트 분류 차이를 증명한다. 실제 비동기 이벤트가 그 사이 도착하거나 플레이어가 gate 대사를 잃는다는 runtime 관측은 아니다.

## 실패·복구 기록

1. 파일 작성/Node 실행 전 authoring functions.exec에서 이전 turn store `fall`이 없어 `TypeError: Cannot read properties of undefined (reading 'commands')` 발생. 현 turn self-contained extractor로 교체했다. production 또는 fixture 판정 실패와 구분한다.
2. 첫 Node 시도 exit1: checks.mjs의 VM boot 작성 도중 nested backtick으로 원문이 잘려, 36행 파일 끝이 `vm.runInContext(`였다. 37행 `SyntaxError: Unexpected end of input`. 어떤 case도 시작하지 못했다.
3. 소유 checks 파일 tail을 실제 읽어 확인하고, dangling tail을 JSON 문자열 boot 및 남은 하니스로 복구했다. 두 번째 Node 시도 exit0, 신규4 group 완료. 완료된 검사를 반복 실행하지 않았다.
4. 실패 시도별 UTC 별도 clock receipt는 채집하지 않았다. 두 시도는 위 관측 UTC 구간 안이며 성공 실행은 하니스 자체 ISO timestamp로 고정했다. 개별 실패 timestamp를 추정하지 않는다.

실제 명령·exit·오류 출력은 아래 evidence에 포함했다. 기대한 fault injection의 Error 관측은 case PASS의 일부이며 첫 Node 구문 실패와 다른 사건이다.

## docs 전체 검색 및 root 동기화 인계

코드 산출 작성 뒤 관련 docs 전체 rg를 실제 **1회**, exit0 수행했다. 21개 matching line. 이후 변경은 소유 하니스 잘린 tail 복구와 이 결과 작성이다. 공유 docs는 TASK 소유 제한에 따라 수정하지 않았다. 원본 검색은 아래 JSON에 보존했으며 긴 line의 preview omitted 부분까지 읽었다고 주장하지 않는다.

```sh
rg -n --max-columns 420 --max-columns-preview '_petInFrame|_checkPetDialogue|_petFireBid|_petSayUrgent|finally.*대사|대사.*예외' docs/
```

다음 표는 **root가 후보를 production 통합할 때 적용할 정확 handoff**다. 현재 구현완료라고 기록하면 안 된다.

| 정본/위치 | 현재 old | 통합 후 new / 현재 후보 상태 |
|---|---|---|
| 2_4/대사_스크립트.md:30 | 프레임 내 T5 입찰 / 프레임 외 즉시 인터럽트 | 기존 정책 그대로. flag가 true로 설정된 dispatcher 본문에서 예외가 나도 finally로 false 종료; 그 이후 외부 호출은 프레임 외 분류. 현재 memory 후보 검수만 완료 |
| 같은 문서:31 | 프레임 끝 및 생존 mid-fire PB 승자 발동, T5 강제종료 | 정책 동일. fireBid/SFX/HUD 예외는 원 Error 그대로 전파; finally는 flag만 정리하며 PB/CD/pair rollback 없음 |
| 같은 문서:35 | 시작 PB tier=-1/flag=true → 생존 mid-fire → 경쟁 → 끝 fire | 기존 mid-fire flag=false/PB tier=-1 reset 유지. true assignment 직후부터 최종 함수 종료까지 try/finally 추가. lv>500 정상 return 포함 모든 post-assignment 종료에 flag=false 보장 |
| 2_4/2_4 펫시스템.md:63 | 생존 actual urgent, ID/UID guard, tier CD 설명 | 수치/공식 동일. flag 예외 수명 계약 위 내용 추가; runtimeAccepted false이며 synthetic callback fault로만 검수 |
| 11내러티브·로어디자인/펫_대사_스크립트.md:93 | T5 mid-fire 우선 실행; 전체 T5/DOM 별도 검수 | 기존 우선순위 유지. 이번 것은 mid-fire setup 예외 뒤 flag cleanup 후보, 전체 T5/DOM/실게임 검수와 구분 |
| 2_4/대사_개편_v7_설계.md:16,51,205 | 기존 설계·기존 fire/사망화면 분리 설명 | 역사적 설계/정책 보존; 현행 예외 수명 계약은 대사_스크립트.md로 연결. 경쟁 weight 또는 생존 정책 재확정 없음 |
| 2_4/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:12,13,29,30,53 | 이전 firstItem 구현/추출 증거 | 이전 결과 그대로 보존. 이 TASK 별도 증거 링크만 필요 시 추가; 이전 결과를 이번 반복 검수로 표시하지 않음 |
| CONTINUOUS-INTEGRATION-20261002.md:203,205 및 CHANGELOG_SYNC.md:52224,52226 | 이전 추출/티어 증거 | 이전 행 보존하고 이번 독립 항목 추가: 양판 source 후보4 group, flag만 finally, 원Error 유지, runtime false, 후속시점 미검수 |
| gap-attribution-evidence/attribution.json:1397 | 과거 함수 귀속 evidence | 역사적 artifact 수정 대상 아님. current production 상태로 덮어쓰지 않음 |

고정 수치 변경0: HP위기 weight100, event default weight50, HP bubble/pair180f, gate240f, ID CD1800f, T0~T4 interrupt cooldown300f는 기존 코드 관측값. protected2_3 수정0, Q전용 blackBean/어택티켓 금지/LOCK·TBD 보존. 코드+canonical docs 동기화 및 커밋은 root 통합 단계이며 담당 Git 작업0.

## 제품 인수 Gate

root는 최신 WIP와 source hash 차이를 확인하고 true assignment 이후 전체 body에 finally가 놓였는지 검토해야 한다. 기존 mid-fire reset 및 root mapQA guard와 병합해야 한다. 실제 browser/device fault·outer loop·다음 dispatcher 사이 이벤트 타이밍은 별도 제품 검수 대상이다. 현재 새로운 설계 결정이 필요하다는 근거는 없고, 독립 source 후보 검수는 완료했다. native/청취/GPU픽셀/맵 visual/배포 PASS 주장0.

## SHA 및 실행 evidence

아래 JSON에 실제 source 전체/fragment, TASK·규칙·SSOT·checks hash, command receipt, raw docs search, 관측 snapshot을 포함한다. result 자기 hash는 순환참조 때문에 포함하지 않는다.

```json
{
  "taskId": "QUESTNPC-inframe-flag-exception-lifetime-hb1014b",
  "executionUTC": "2026-10-02T11:06:34.572Z",
  "productionApplied": false,
  "runtimeAccepted": false,
  "previousCompletedRuns": 0,
  "sources": [
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "candidateSha256": "2cc47215c3f2e6df85be975b2e50156054ebd25299ff677131afbf3fb2c27f3a"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "candidateSha256": "2cc47215c3f2e6df85be975b2e50156054ebd25299ff677131afbf3fb2c27f3a"
    }
  ],
  "fragments": [
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "actual full pet state",
      "fromLine": 8980,
      "toLine": 9018,
      "sha256": "3133b77010c7f2ae7aba12fa5553d82b8c141d643e6faf01b8749e86f1b4f6d7"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "actual priority state",
      "fromLine": 9085,
      "toLine": 9089,
      "sha256": "2dfcd3df763296ca3ff2ce52c6ef5f9a2b3c52f0087899e9315863e939f69960"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "opacity",
      "fromLine": 9045,
      "toLine": 9045,
      "sha256": "a7eef8d7e48d24adef18f721ad40f540e9cc128abd86b4d810dfc14e92dbf242"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_checkPetDialogue",
      "fromLine": 9184,
      "toLine": 9415,
      "sha256": "660b4ad74fe1792067e88dab0826c644bd925439c3adde1c678ff4b18f751ef3"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petTierOf",
      "fromLine": 9091,
      "toLine": 9100,
      "sha256": "f3910551bc3a70f0776527c62b0b76a3b43f460a0bcd9247a055b41a0de09cb9"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petSay",
      "fromLine": 9066,
      "toLine": 9078,
      "sha256": "bd56437223a8a5a9d16bce6b0358c8f7a673182b76cdb33cf2745f4661f604fe"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petSfx",
      "fromLine": 9021,
      "toLine": 9031,
      "sha256": "134051f55ff0d4ad48c2a531f9887feabebbac14a79ddab3abd802bba8366227"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petBubbleShow",
      "fromLine": 9046,
      "toLine": 9065,
      "sha256": "fc0ba0e3136e0c8a898dfb5c7d2de13dc61bb33b844c4035ec0fa7aa610a6f22"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petSayCD",
      "fromLine": 9148,
      "toLine": 9156,
      "sha256": "c453435f5581aab6608ea07f420f1b0590affb7b3fb5284a65e4c41217841768"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petBidCD",
      "fromLine": 9102,
      "toLine": 9108,
      "sha256": "774fe5a3eb3f8c006300fd7f2a7dc4da1825dbcc01575cefcaaa3d3dd2fda24a"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petSayUrgent",
      "fromLine": 9110,
      "toLine": 9124,
      "sha256": "6696d4d51ccfa879aae4d5aa7415de8400e8f8b3dd8b9498ba60b89c74332bb3"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petFireBid",
      "fromLine": 9126,
      "toLine": 9141,
      "sha256": "5450766696f150b1205d9d19f107ade1c8980c9aa2adde4a1cb5d9b50dd1642e"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_updatePetBubble",
      "fromLine": 9159,
      "toLine": 9181,
      "sha256": "a9a102db61ad844dea0fe59d73f04da476fc4b82c9f7ed146c60e7e352e14b82"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "_petBagNext",
      "fromLine": 9143,
      "toLine": 9146,
      "sha256": "318cff51506fa7baaadbb3010bd5a1bbe5e293197ce64805f348b357bd02aec5"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "updatePet",
      "fromLine": 40123,
      "toLine": 40131,
      "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "playFM",
      "fromLine": 12056,
      "toLine": 12072,
      "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "update guards",
      "fromLine": 30889,
      "toLine": 30913,
      "sha256": "3e7388ee3a3a695e7e1214fc81fac922a532c0ffe4223faaa93d0a75ced14ee2"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "update pet call",
      "fromLine": 30942,
      "toLine": 30942,
      "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "external gate caller",
      "fromLine": 40503,
      "toLine": 40527,
      "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "actual full pet state",
      "fromLine": 8435,
      "toLine": 8473,
      "sha256": "3133b77010c7f2ae7aba12fa5553d82b8c141d643e6faf01b8749e86f1b4f6d7"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "actual priority state",
      "fromLine": 8536,
      "toLine": 8540,
      "sha256": "2dfcd3df763296ca3ff2ce52c6ef5f9a2b3c52f0087899e9315863e939f69960"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "opacity",
      "fromLine": 8500,
      "toLine": 8500,
      "sha256": "a7eef8d7e48d24adef18f721ad40f540e9cc128abd86b4d810dfc14e92dbf242"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_checkPetDialogue",
      "fromLine": 8635,
      "toLine": 8866,
      "sha256": "660b4ad74fe1792067e88dab0826c644bd925439c3adde1c678ff4b18f751ef3"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petTierOf",
      "fromLine": 8542,
      "toLine": 8551,
      "sha256": "f3910551bc3a70f0776527c62b0b76a3b43f460a0bcd9247a055b41a0de09cb9"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petSay",
      "fromLine": 8521,
      "toLine": 8533,
      "sha256": "fd6a4073462290ac189b48a5683c7ad952ce154d4fdb0f803a1beb34dcfe32c1"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petSfx",
      "fromLine": 8476,
      "toLine": 8486,
      "sha256": "134051f55ff0d4ad48c2a531f9887feabebbac14a79ddab3abd802bba8366227"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petBubbleShow",
      "fromLine": 8501,
      "toLine": 8520,
      "sha256": "fc0ba0e3136e0c8a898dfb5c7d2de13dc61bb33b844c4035ec0fa7aa610a6f22"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petSayCD",
      "fromLine": 8599,
      "toLine": 8607,
      "sha256": "c453435f5581aab6608ea07f420f1b0590affb7b3fb5284a65e4c41217841768"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petBidCD",
      "fromLine": 8553,
      "toLine": 8559,
      "sha256": "774fe5a3eb3f8c006300fd7f2a7dc4da1825dbcc01575cefcaaa3d3dd2fda24a"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petSayUrgent",
      "fromLine": 8561,
      "toLine": 8575,
      "sha256": "6696d4d51ccfa879aae4d5aa7415de8400e8f8b3dd8b9498ba60b89c74332bb3"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petFireBid",
      "fromLine": 8577,
      "toLine": 8592,
      "sha256": "5450766696f150b1205d9d19f107ade1c8980c9aa2adde4a1cb5d9b50dd1642e"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_updatePetBubble",
      "fromLine": 8610,
      "toLine": 8632,
      "sha256": "ec177353a6713bbfcc2b487429dceed6120adcc19f375c51907b92e3577821e4"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "_petBagNext",
      "fromLine": 8594,
      "toLine": 8597,
      "sha256": "318cff51506fa7baaadbb3010bd5a1bbe5e293197ce64805f348b357bd02aec5"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "updatePet",
      "fromLine": 38925,
      "toLine": 38933,
      "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "playFM",
      "fromLine": 11460,
      "toLine": 11476,
      "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "update guards",
      "fromLine": 29709,
      "toLine": 29732,
      "sha256": "7d17b08360f80ef1b13c4becd8901b61332c71331c9d254fb5247798509c1d28"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "update pet call",
      "fromLine": 29761,
      "toLine": 29761,
      "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "external gate caller",
      "fromLine": 39305,
      "toLine": 39329,
      "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
    }
  ],
  "cases": [
    {
      "source": "game.html",
      "case": "real-playFM-callback-error-and-following-event",
      "status": "PASS",
      "failures": [
        {
          "message": "injected-createOscillator-failure",
          "sameErrorIdentity": true
        },
        {
          "message": "injected-createOscillator-failure",
          "sameErrorIdentity": true
        }
      ],
      "currentAfterError": {
        "inFrame": true,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "sourceTxt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false,
          "sourceTxt": "…죽기 직전이다. 패링해. 피를 채워."
        },
        "cd": {},
        "tiers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "activeNodes": 0,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            }
          ],
          "oscillatorCalls": 1,
          "noise": 0,
          "timers": 0,
          "gate": 0,
          "victory": 0
        }
      },
      "candidateAfterError": {
        "inFrame": false,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "sourceTxt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false,
          "sourceTxt": "…죽기 직전이다. 패링해. 피를 채워."
        },
        "cd": {},
        "tiers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "activeNodes": 0,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            }
          ],
          "oscillatorCalls": 1,
          "noise": 0,
          "timers": 0,
          "gate": 0,
          "victory": 0
        }
      },
      "currentAfterEvent": {
        "inFrame": true,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "sourceTxt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false,
          "sourceTxt": "…죽기 직전이다. 패링해. 피를 채워."
        },
        "cd": {},
        "tiers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "activeNodes": 0,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            },
            {
              "id": "boss_gate_open",
              "inFrame": true,
              "returned": false
            }
          ],
          "oscillatorCalls": 1,
          "noise": 0,
          "timers": 0,
          "gate": 1,
          "victory": 1
        }
      },
      "candidateAfterEvent": {
        "inFrame": false,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
          "t": 240,
          "mt": 240,
          "pair": {
            "who": "cat",
            "sourceTxt": "문 열렸어! 이제 보스 잡으러 가자!",
            "txt": "문 열렸어! 이제 보스 잡으러 가자!",
            "mt": 240
          },
          "pairFired": false,
          "sourceTxt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
          "_uid": "boss_gate_open"
        },
        "cd": {
          "boss_gate_open": 1800
        },
        "tiers": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "activeNodes": 1,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            },
            {
              "id": "boss_gate_open",
              "inFrame": false,
              "returned": true
            }
          ],
          "oscillatorCalls": 3,
          "noise": 1,
          "timers": 1,
          "gate": 1,
          "victory": 1
        }
      }
    },
    {
      "source": "game.html",
      "case": "same-frame-normal-no-error-control",
      "status": "PASS",
      "state": {
        "inFrame": false,
        "pb": {
          "tier": -1,
          "weight": 0,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "sourceTxt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false,
          "sourceTxt": "…죽기 직전이다. 패링해. 피를 채워.",
          "_uid": "hp_critical"
        },
        "cd": {
          "hp_critical": 1800
        },
        "tiers": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "activeNodes": 1,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            }
          ],
          "oscillatorCalls": 2,
          "noise": 1,
          "timers": 1,
          "gate": 0,
          "victory": 0
        }
      }
    },
    {
      "source": "game-easy-test.html",
      "case": "real-playFM-callback-error-and-following-event",
      "status": "PASS",
      "failures": [
        {
          "message": "injected-createOscillator-failure",
          "sameErrorIdentity": true
        },
        {
          "message": "injected-createOscillator-failure",
          "sameErrorIdentity": true
        }
      ],
      "currentAfterError": {
        "inFrame": true,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false
        },
        "cd": {},
        "tiers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "activeNodes": 0,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            }
          ],
          "oscillatorCalls": 1,
          "noise": 0,
          "timers": 0,
          "gate": 0,
          "victory": 0
        }
      },
      "candidateAfterError": {
        "inFrame": false,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false
        },
        "cd": {},
        "tiers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "activeNodes": 0,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            }
          ],
          "oscillatorCalls": 1,
          "noise": 0,
          "timers": 0,
          "gate": 0,
          "victory": 0
        }
      },
      "currentAfterEvent": {
        "inFrame": true,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false
        },
        "cd": {},
        "tiers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "activeNodes": 0,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            },
            {
              "id": "boss_gate_open",
              "inFrame": true,
              "returned": false
            }
          ],
          "oscillatorCalls": 1,
          "noise": 0,
          "timers": 0,
          "gate": 1,
          "victory": 1
        }
      },
      "candidateAfterEvent": {
        "inFrame": false,
        "pb": {
          "tier": 5,
          "weight": 100,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
          "t": 240,
          "mt": 240,
          "pair": {
            "who": "cat",
            "txt": "문 열렸어! 이제 보스 잡으러 가자!",
            "mt": 240
          },
          "pairFired": false,
          "_uid": "boss_gate_open"
        },
        "cd": {
          "boss_gate_open": 1800
        },
        "tiers": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "activeNodes": 1,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            },
            {
              "id": "boss_gate_open",
              "inFrame": false,
              "returned": true
            }
          ],
          "oscillatorCalls": 3,
          "noise": 1,
          "timers": 1,
          "gate": 1,
          "victory": 1
        }
      }
    },
    {
      "source": "game-easy-test.html",
      "case": "same-frame-normal-no-error-control",
      "status": "PASS",
      "state": {
        "inFrame": false,
        "pb": {
          "tier": -1,
          "weight": 0,
          "id": "hp_critical",
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "dur": 3,
          "cd": 30,
          "pw": "cat",
          "pt": "한 방이면 죽어! 패링으로 HP 채워!!",
          "pd": 3
        },
        "bubble": {
          "who": "crow",
          "txt": "…죽기 직전이다. 패링해. 피를 채워.",
          "t": 180,
          "mt": 180,
          "pair": {
            "who": "cat",
            "txt": "한 방이면 죽어! 패링으로 HP 채워!!",
            "mt": 180
          },
          "pairFired": false,
          "_uid": "hp_critical"
        },
        "cd": {
          "hp_critical": 1800
        },
        "tiers": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "activeNodes": 1,
        "dom": {
          "petSubtitle": {
            "style": {
              "opacity": 0.6,
              "left": "20px",
              "right": "auto",
              "transformOrigin": "left bottom",
              "transform": "scale(calc(var(--ui-scale) * 1.5))"
            }
          },
          "petPortrait": {
            "style": {},
            "src": "img/crow/portrait.png?v=4"
          },
          "petBubbleTxt": {
            "style": {
              "left": "92px",
              "top": "237px",
              "width": "306px",
              "height": "51px",
              "fontSize": "0.92rem"
            },
            "textContent": "…죽기 직전이다. 패링해. 피를 채워.",
            "children": []
          }
        },
        "trace": {
          "urgent": [
            {
              "id": "hp_critical",
              "inFrame": true,
              "returned": true
            }
          ],
          "oscillatorCalls": 2,
          "noise": 1,
          "timers": 1,
          "gate": 0,
          "victory": 0
        }
      }
    }
  ],
  "patch": "try after _petInFrame=true; finally{_petInFrame=false} at dispatcher exit; original mid-fire reset retained",
  "stubs": [
    "AudioContext nodes/DOM synthetic; createOscillator fault, same Error object propagates",
    "actual playFM/_petSfx/_petBubbleShow execute; playNoise and timer sinks",
    "full dispatcher/updatePet; update guard prefix/pet call only, middle gameplay omitted",
    "synthetic Lv501 HP5 stage4, region count4; no actual combat/audio/browser loop"
  ],
  "chatId": "01a0fae0-ccb2-7572-9d58-8c3176f9afff",
  "historicalCheckpointProvided": "d5c1b62d",
  "currentHeadQueried": false,
  "observationWindowUTC": {
    "start": "2026-10-02 11:03:06 UTC",
    "end": "2026-10-02 11:06:57 UTC"
  },
  "nodeAttempts": 2,
  "completedProcesses": 1,
  "newCaseGroups": 4,
  "previousCasesRerun": 0,
  "authoringError": {
    "tool": "functions.exec",
    "message": "TypeError reading absent previous-turn store fall; before file write or Node run",
    "recovered": "new self-contained extractor, no dependence on previous store"
  },
  "commands": [
    {
      "purpose": "contracts",
      "cmd": "cat tools/team-followup-20261002/continuous/COMMON.md docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md AGENTS.md",
      "exitCode": 0,
      "wallTimeSeconds": 0.000005292,
      "chunkId": "de04f2"
    },
    {
      "purpose": "SSOT",
      "cmd": "nl -ba 'docs/2_4 펫시스템/대사_스크립트.md' | sed -n '11,37p'; nl -ba 'docs/2_4 펫시스템/2_4 펫시스템.md' | sed -n '60,73p'",
      "exitCode": 0,
      "wallTimeSeconds": 0.000005208,
      "chunkId": "0b93fe"
    },
    {
      "purpose": "current flag and helper/caller index",
      "cmd": "rg -n --max-columns 250 --max-columns-preview '_petInFrame|function (_checkPetDialogue|_petSayUrgent|_petFireBid|_petSfx|_petBubbleShow|updatePet|update)\\(' game.html game-easy-test.html",
      "exitCode": 0,
      "wallTimeSeconds": 0.000006667,
      "chunkId": "01d3d2"
    },
    {
      "purpose": "full main dispatcher",
      "cmd": "nl -ba game.html | sed -n '9184,9415p'",
      "exitCode": 0,
      "wallTimeSeconds": 0.000008417,
      "chunkId": "426901"
    },
    {
      "purpose": "full easy dispatcher",
      "cmd": "nl -ba game-easy-test.html | sed -n '8635,8866p'",
      "exitCode": 0,
      "wallTimeSeconds": 0.000005541,
      "chunkId": "fac20b"
    },
    {
      "purpose": "real callback and callers",
      "cmd": "nl -ba game.html | sed -n '8980,9078p;9102,9181p;30889,30944p;40123,40131p;40535,40559p'",
      "exitCode": 0,
      "wallTimeSeconds": 0.000007667,
      "chunkId": "45d510"
    },
    {
      "purpose": "easy callbacks/caller",
      "cmd": "nl -ba game-easy-test.html | sed -n '8435,8533p;8553,8632p;29709,29764p;38925,38933p'",
      "exitCode": 0,
      "wallTimeSeconds": 0.00000825,
      "chunkId": "1f549d"
    },
    {
      "purpose": "오디오 하위 helper/상위 loop exception index",
      "cmd": "rg -n 'function playFM|const playFM|function playNoise|requestAnimationFrame|try.*update\\(|update\\(\\).*catch' game.html game-easy-test.html; nl -ba game.html | sed -n '30889,30914p;9085,9090p;9225,9233p'; nl -ba game-easy-test.html | sed -n '29709,29734p;8676,8684p'",
      "exitCode": 0,
      "wallTimeSeconds": 0.00000775,
      "chunkId": "78c52d"
    },
    {
      "purpose": "실제 playFM 예외 처리·loop catch 범위",
      "cmd": "nl -ba game.html | sed -n '12056,12092p;60008,60042p'; nl -ba game-easy-test.html | sed -n '11460,11496p;58340,58373p'",
      "exitCode": 0,
      "wallTimeSeconds": 0.000007041,
      "chunkId": "a0d422"
    },
    {
      "purpose": "새 fixture 뒤 docs 전체 관련 검색1회",
      "cmd": "rg -n --max-columns 420 --max-columns-preview '_petInFrame|_checkPetDialogue|_petFireBid|_petSayUrgent|finally.*대사|대사.*예외' docs/",
      "exitCode": 0,
      "wallTimeSeconds": 0.000006208,
      "chunkId": "f67e64"
    },
    {
      "purpose": "새 flag-exception primary/candidate/control 최초 실행",
      "cmd": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/checks.mjs",
      "exitCode": 1,
      "wallTimeSeconds": 0.000006625,
      "chunkId": "07ba26",
      "errorOutput": "file:///Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/checks.mjs:37\n\n\n\nSyntaxError: Unexpected end of input\n    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)\n    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:90:18)\n    at #translate (node:internal/modules/esm/loader:451:20)\n    at afterLoad (node:internal/modules/esm/loader:507:29)\n    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:512:12)\n    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:555:36)\n    at afterResolve (node:internal/modules/esm/loader:603:52)\n    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:609:12)\n    at node:internal/modules/esm/loader:628:32\n    at TracingChannel.tracePromise (node:diagnostics_channel:362:14)\n\nNode.js v24.15.0\n"
    },
    {
      "purpose": "하니스 구문 실패 원인 소유 파일 실제 읽기",
      "cmd": "nl -ba tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/checks.mjs | tail -n 12",
      "exitCode": 0,
      "wallTimeSeconds": 0.0000065,
      "chunkId": "a67a98"
    },
    {
      "purpose": "하니스 구문 복구 후 최초 경계 완료 시도",
      "cmd": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/checks.mjs",
      "exitCode": 0,
      "wallTimeSeconds": 0.000005833,
      "chunkId": "94d58c"
    },
    {
      "purpose": "완료 source/fixture/TASK/읽은 SSOT 실제 SHA",
      "cmd": "shasum -a 256 game.html game-easy-test.html AGENTS.md docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md tools/team-followup-20261002/continuous/COMMON.md 'docs/2_4 펫시스템/대사_스크립트.md' 'docs/2_4 펫시스템/2_4 펫시스템.md' tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/TASK.md tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/checks.mjs",
      "exitCode": 0,
      "wallTimeSeconds": 0.000007166,
      "chunkId": "96d677"
    }
  ],
  "hashReceipt": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b  game.html\n50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057  game-easy-test.html\nfd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4  AGENTS.md\n86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520  docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md\nde5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e  tools/team-followup-20261002/continuous/COMMON.md\nd267a4d846a73a0c9a6b95f3112b07c5e0dd1a79e915f14bbd018d09ef19a889  docs/2_4 펫시스템/대사_스크립트.md\ncb3cfad3579649f7e5cf4974bfe9f898c5806ea4d15202dbff5f8c72c96fd1ff  docs/2_4 펫시스템/2_4 펫시스템.md\n004bba566e62f14978da6021463f5db93f5a8eee34f6d9c3c762a92508ab7819  tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/TASK.md\ncec4accc9b48d46f13125bc66dec7a2e8da9cfa33a0e642ad81c9aa55a7c764d  tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-inframe-flag-exception-lifetime-hb1014b/checks.mjs\n",
  "docsSearch": {
    "performed": 1,
    "matchingLines": 21,
    "raw": "docs/11내러티브·로어디자인/펫_대사_스크립트.md:93:- **우선순위**: 비긴급 즉시 대사는 활성 bubble·ID CD·티어 CD 등에 거절될 수 있다. 기존 T5 `_petSayUrgent` 입찰과 mid-fire는 먼저 실행하며 ID CD/같은 UID 활성 가드를 유지하고 필요 시 기존 bubble·pair를 중단한다. firstItem false는 이 긴급 정책을 바꾸지 않고 후속 검사로 진행한다. 전체 T5·DOM 보장은 별도 검수다.\r\ndocs/2_4 펫시스템/2_4 펫시스템.md:63:- **시스템**: `_petSayCD`는 즉시 수락/거절과 티어별 글로벌쿨을 사용한다. 일반 경쟁은 `_petBidCD`→`_petFireBid`, 생존은 실제 `_petSayUrgent` 경로다. ID 쿨과 같은 UID 활성 가드는 유지한다. 단일 글로벌쿨 15초는 v6 이력이며 현행 T1=720f/T4=240f와 구분한다.\r\ndocs/2_4 펫시스템/2_4 펫시스템.md:77:> **위치**: `game.html` `_checkPetDialogue()` — mp_warn(`[?]`), 빌드 힌트 블록(`if(!G.bossAlive&&P.lv>=50&&G.frame%300===0)`).\r\ndocs/2_4 펫시스템/2_4 펫시스템.md:88:**검증 (Playwright, before/after 동일 harness, lv60, `_checkPetDialogue` 직접 구동)**:\r\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:12:| `_checkPetDialogue` / firstItem | 9184 / 8635, 수정 접점 9243 / 8694 |\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:13:| 실제 긴급 helper `_petSayUrgent` | 9110 / 8561. 양판 `_petUrgent` 이름·alias 원문 0개 |\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:29:| 긴급 경로 | `_petSayUrgent`는 ID CD를 먼저 검사하고, 프레임 안에서는 생존 weight 입찰·밖에서는 같은 UID의 활성 대사를 가드한 뒤 인터럽트 | “긴급은 모든 쿨 무시”라는 절대 설명은 부정확. 기존 T5 경로의 내부 `_petSay` 반환 무시 정책도 변경 0 |\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:30:| 수락·거절 | 새 검사 wrapper가 실제 `_petSayCD` false/true를 직접 기록. `_petSay` true도 실제 반환 관측 | `_petBidCD`와 `_petFireBid`의 정상 undefined 반환을 false로 취급하지 않음 |\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:53:현재 대역은 실제 full `_checkPetDialogue`, `updatePet`, `pickupItem`, say/CD/urgent/bid/fire/timer/TierOf/BagNext/dst2 및 실제 상태 선언을 실행한다. 이동 함수는 no-op, DOM/번역/SFX는 sink, 공간·스탯·save·guide는 대역이다. 본편 일반 headband 2개는 가방으로, easy는 첫 장비 자동장착 후 두 번째가 가방으로 들어가는 해당 소스 경로만 관측했다. 실제 인벤토리 배치/저장 파일을 인수한 것이 아니다. [... omitted end of long line]\ndocs/2_4 펫시스템/대사_스크립트.md:30:| `_petSayUrgent(id,...)` | 생존(T5) | 프레임 내: T5 입찰(내부 weight `_PET_SURV_W`). 프레임 외(이벤트): 즉시 인터럽트 |\r\ndocs/2_4 펫시스템/대사_스크립트.md:31:| `_petFireBid()` | 승자 발동 | 프레임 끝(및 생존 mid-fire)에 `_PB` 승자 1건 발동. T5는 현재 말풍선 강제종료 |\r\ndocs/2_4 펫시스템/대사_스크립트.md:35:- **호출 흐름**: `_checkPetDialogue` 시작 시 `_PB.tier=-1;_petInFrame=true` → 생존블록 입찰 → mid `_petFireBid()`(생존 인터럽트) → 경쟁블록 `_petBidCD` 입찰 → 끝에서 `_petFireBid()`(승자 발동).\r\ndocs/2_4 펫시스템/대사_스크립트.md:77:| v3 | 81종 | _petSayUrgent + HP 50% + 기절 명확화 |\r\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:16:- `_checkPetDialogue()`가 매 프레임 `_petSayCD(...)`를 **코드 작성 순서대로** 실행.\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:51:  if(_PB.tier>=0) _petFireBid()       // 티어별 글로벌쿨 검사 후 발동\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:205:- **내 dispatcher와 무충돌**: death_dual은 `G.on=false` 사망화면 전용, dispatcher는 게임 중(`_checkPetDialogue`)이라 실행 시점 분리.\ndocs/0마스터플랜/mac-resume-20261001/gap-attribution-evidence/attribution.json:1397:          \"function\": \"_checkPetDialogue\",\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md:203:| 실제 추출 | full _checkPetDialogue/updatePet/pickupItem 및 say/CD/urgent/bid/fire/timer/TierOf/BagNext/dst2·state 원문 | 전체 update/AI 생략·이동 no-op·DOM/번역/SFX sink·공간/stat/save/guide 대역. main일반장비2bag, easy첫자동장착/둘째bag 경로만 관측 |\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md:205:| 실제 helper·티어 | [S03e] main8978/easy8433, actual _petSayUrgent9110/8561. _petUrgent 이름·alias0. T0~T5 글로벌1200/720/480/360/240/0f 보존 | ID CD·외부 같은UID활성가드 유지. 일반동일티어는 코드순, 생존weight별도. v6단일15초/일반plannedweight65·45를 현재코드로 이식0 |\ndocs/CHANGELOG_SYNC.md:52224:| 실제 추출 | full _checkPetDialogue/updatePet/pickupItem 및 say/CD/urgent/bid/fire/timer/TierOf/BagNext/dst2·state 원문 | 전체 update/AI 생략·이동 no-op·DOM/번역/SFX sink·공간/stat/save/guide 대역. main일반장비2bag, easy첫자동장착/둘째bag 경로만 관측 |\ndocs/CHANGELOG_SYNC.md:52226:| 실제 helper·티어 | [S03e] main8978/easy8433, actual _petSayUrgent9110/8561. _petUrgent 이름·alias0. T0~T5 글로벌1200/720/480/360/240/0f 보존 | ID CD·외부 같은UID활성가드 유지. 일반동일티어는 코드순, 생존weight별도. v6단일15초/일반plannedweight65·45를 현재코드로 이식0 |\n"
  }
}
```


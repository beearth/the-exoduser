# QUESTNPC — callback 예외 뒤 같은 생존 사건의 CD 미저장·다음 프레임 재시도

실제 양판 source의 연속 update에서 오디오 또는 HUD callback 예외가 나면 UID/ID CD 저장에 도달하지 못해 다음 프레임에도 같은 hp_critical 발화를 시도한다. 이 경계는 이전 외부 gate 이벤트/flag 검사가 아니라 **다음 실제 dispatcher 호출**이다. 새4 case group PASS, 정상2-frame control 포함, Node1회 exit0. 이전 완료 검사 실행0. 새 정책 패치0. productionApplied=false/runtimeAccepted=false.

## 권한·산출 범위

autonomy-user-20261002-1126-v1 정책 SHA256 `80f7e3cf084c440658b1fae27ad60999ea6e41aa048bb5d22d62a099ab4b9608`를 감독 STATE에서 실제 읽었다. 승인된 QUESTNPC 다음 경계는 “pet sound/bubble 실패 이후 cooldown 미저장으로 같은 사건 재발화하는 caller source 확인”이다. protected CD/priority 정책 임의변경0.

최초 memory 검수 당시 Changes94/allowNewOwnedFiles=false라 새 파일0으로 Node stdin에서 검사했다. 이번 저장 전 STATE를 읽어 epoch `capacity-after-8c317a73-1134`, Changes68, allowNewOwnedFiles=true, 역할당 저장1회/최대2파일을 확인했다. 이 폴더 **checks.mjs/result.md 두 파일만** 저장한다. 추가 저장은 다음 capacity epoch까지 하지 않는다. 제출한 이전 TASK·산출·production·공유 docs·Git/index·타인 WIP·사용자게임/세이브/오디오 장치/서버/빌드 수정0.

## 실제 신규 검수

입력은 stage4, on true, paused false, bossAlive true, bossRef null, lv501, HP5/100, full MP/ST, dt1, pets 존재, 적/투사체 빈 배열, mapQA false. actual update guard prefix/pet call → full updatePet → full _checkPetDialogue → actual hp_critical urgent producer → fireBid → say/bubbleShow/SFX/playFM 경로다. update의 나머지 gameplay는 생략했다. lv>500 실제 guard를 사용하므로 생존 블록 이후 tail 경로는 범위 밖이다.

이전 인수된 flag-finally **메모리 wrapper를 baseline**으로 사용했다. flag 구현을 새로 비교/검수하지 않았다. CD/UID/tier/priority/pair 함수 원문은 유지했다. memory checks SHA256 `bc442e9a23784ad5b5d0b0fa4408953b99ba04efb454dd31260a23e5e8424626` (7720 bytes).

| 양판 공통 관측 | 연속 실패frame1 | 연속 실패frame2 | fault 해제frame3 | 후속frame4 | 정상control frame2 |
|---|---|---|---|---|---|
| 같은 사건 say 시도 누적 | 1 | 2 | 3 | 3 | 1 |
| UID | 미저장 | 미저장 | hp_critical | hp_critical | hp_critical |
| hp_critical ID CD | 미저장 | 미저장 | 1800f | 1799f | 1799f |
| crow bubble t | 180f | 180f로 재시작 | 180f | 179f | 179f |
| cat pair mt | 180f | 180f로 재예약 | 180f | 180f | 180f |
| pairFired | false | false | false | false | false |
| T0~T4 CD | 각0 | 각0 | 각300f | 각299f | 각299f |

오디오 fault는 fake AudioContext.createOscillator에서 의도적 throw: 두 실패 frame까지 oscillatorCalls2. HUD fault는 fake leaf textContent setter에서 throw: 두 실패 frame까지 oscillatorCalls0. fault 해제 후 actual HUD/audio setup이 성공해 CD가 저장된다. 각 실패는 같은 Error 객체 identity로 전파된다.

HUD fault에도 공통 fixture Error 이름 `injected-createOscillator-failure`를 재사용했다. 메시지는 오류 지점을 나타내지 않는다. **HUD case의 실제 주입 지점은 textContent setter**이며 실제 oscillator가 throw했다고 해석하면 안 된다. 실제 DOM setter가 자연스럽게 해당 예외를 발생시킨 관측은 아니다.

Node 실행 UTC `2026-10-02T11:26:52.728Z` ~ `2026-10-02T11:26:52.849Z` / KST 2026-10-02 20:26:52.728 ~ 20:26:52.849. 첫 시도 완료 exit0; 하니스 실패0. 이전 turn authoring/구문 실패는 이 신규 실행의 실패로 재집계하지 않는다. 이후 memory 코드 hash만 계산했으며 fixture 재실행0. 저장 후에도 검사를 재실행하지 않는다.

실행 명령은 지정 Node `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module -`에 checks.mjs와 byte 동일한 메모리 원문을 heredoc `QUESTNPC_MEMORY_1126`로 전달했다. 파일 실행을 수행했다고 주장하지 않는다. 실제 stdin 원문을 이제 checks.mjs에 보존한다.

## 소스 계약과 no-fix 판단

| 함수/위치 main / easy | 현재 실제 순서 | 결과 |
|---|---|---|
| _checkPetDialogue 9197 / 8648 | HP<10%가 지속되면 actual urgent 요청 | 다음 frame에도 producer 조건 성립 |
| _petSayUrgent 9111 / 8562 | 먼저 ID CD 검사, frame 안 T5 입찰 | CD 미저장 상태는 입찰을 막지 않음 |
| _petFireBid 9130–9134 / 8581–8585 | 같은 UID 활성 guard → say/HUD/SFX → UID·CD 저장 | callback throw가 UID/ID CD/tier CD commit 전에 전파됨 |
| _petSay 9070–9076 / 8525–8531 | bubble/pair 저장 → HUD → 조건부 SFX | throw 전에 부분 bubble state가 남음 |
| _updatePetBubble 9161–9167 / 8612–8618 | CD감소·bubble t감소 → 다음 producer | 실패 다음 frame에서 t179로 감소해도 fireBid가 t0 후 같은 발화를 다시 시작 |

실패 시 CD를 미리 저장하거나 finally에서 무조건 CD를 소비하면, 미완료 발화를 성공과 같은 쿨로 취급하는 정책 변경이다. UID만 먼저 쓰면 실패한 HUD도 “활성 동일 UID”로 간주해 경고 재시도를 억제한다. SFX 예외를 삼키면 원Error 전파와 성공 정의가 달라진다. 해당 실패 수락/rollback/retry 계약이 정본에 없으므로 임의 패치를 확정하지 않았다. 현재 판단은 **경계 확인 완료·정책 변경 no-fix**, blanket runtime blocker가 아니다.

## 대역 및 제품 Gate

full source helper·state·dispatcher와 실제 playFM을 실행했고 AudioContext/node/params/connect/start/stop, DOM leaf/style, 번역/padify, timer/playNoise, movement/ghost update는 합성 대역이다. actual source helper wrapper는 실제 호출을 기록하며 가짜 counter로 producer를 대체하지 않는다. gate caller는 추출 receipt에 있으나 이번 경계에서 호출0. 외부 gate timing 종전 검사는 실행0.

순차 frame1→2→3→4는 하니스가 update를 호출한 일정이다. 실제 outer browser loop/device exception/DOM 자연 예외/사용자 청취·GPU·native·map visual·배포 판정0. 마지막 성공 다음 frame CD억제는 source contract 확인이며 실제 게임 제품 인수가 아니다.

## docs 동기화 handoff

SSOT 함수·CD 계약을 먼저 읽었다. 이후 전체 docs rg를 1회 수행했으며 exit0. 제한된 펫 docs 선행 검색과 전체 docs 검색은 구분한다. 실제 전체 command 및 raw matching line은 아래 JSON에 포함한다. 공유 docs write0.

| 정본 | old | root가 별도 증거로 보충할 new |
|---|---|---|
| docs/2_4 펫시스템/대사_스크립트.md:30–35 | urgent frame입찰·fire 승자·dispatcher 흐름; 실패 commit 경계 미기재 | actual fireBid는 say/HUD/SFX 뒤 UID/ID CD/tier CD commit. 그 전에 예외면 다음frame 같은 생존조건에 재시도 가능. fault 해제 성공 후1800f 정상억제. 값·정책 변경0 |
| docs/2_4 펫시스템/2_4 펫시스템.md:63 | ID 쿨/동일UID guard 유지 | guard는 UID/CD 저장에 도달한 경우 적용됨. 부분 bubble만으로 같은 T5의 재시도를 막는다는 보장 없음 |
| docs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:55 | 이전 검사에서 표시/SFX 예외 미검수 | 이전 결과·미검수 범위 보존. 이번 독립 source4 group 링크 추가 시 실제 장치 미검수 구분 |
| docs/2_4 펫시스템/대사_개편_v7_설계.md:48,51 | ID CD gate 및 fire 개념 | 설계·수치 보존. 실패 retry/consume/rollback 계약 미확정으로 현재 source 예외 경계만 기록 |
| 관련 changelog/integration | 이번 신규 검수 미기재 | memory stdin1회 exit0/4 group, 새정책패치0, actual audio/HUD synthetic fault, production/runtime false |

관련 없는 아이템/탄막/몬스터/키바인딩 match를 펫 실패 정책으로 수정하지 않는다. 보호2_3·Q-only blackBean·어택티켓금지·확정CD/priority/LOCK/TBD 유지. 이 결과는 이전 산출 수정이나 재검수 기록으로 덮어쓰지 않는다. root가 적용 정책을 정할 경우 canonical과 production 동기화는 root 소유다.

## 저장 byte 검증·수정 영수증

최초 apply_patch 저장은 끝 LF 하나가 추가되어 checks 7721 bytes/SHA256 `41c9d08bb8a0c0137c8d58bed5692d8bd3aaebad003be4a44237be7cbe383c96`이었다. 동일 소유 checks 파일을 실제 실행했던 메모리 문자열 그대로 저장해 7720 bytes/SHA256 `bc442e9a23784ad5b5d0b0fa4408953b99ba04efb454dd31260a23e5e8424626`으로 복구했다. Node 유틸리티 write/hash만 수행했으며 fixture 재실행0. 수정된 파일은 checks 하나뿐이며 추가 산출0.

## 전체 실행 JSON·검색 영수증

source 전체 SHA는 **실행 시점**이며 root 이후 변경을 current byte로 주장하지 않는다. 아래 fragment SHA/line은 당시 추출 receipt다. 저장 checks hash는 memory byte 동등 검증으로 고정한다. result 자기 hash는 포함하지 않는다.

```json
{
  "boundary": "QUESTNPC-same-event-cooldown-after-callback-error-memory-1126",
  "runStartUTC": "2026-10-02T11:26:52.728Z",
  "runEndUTC": "2026-10-02T11:26:52.849Z",
  "productionApplied": false,
  "runtimeAccepted": false,
  "newFiles": 0,
  "previousCasesExecuted": 0,
  "newCaseGroups": 4,
  "newCandidatePatch": false,
  "baseline": "prior accepted flag-finally memory wrapper only; CD/UID/priority untouched",
  "sources": [
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "sha256": "569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "sha256": "7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e"
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
      "fromLine": 40126,
      "toLine": 40134,
      "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "playFM",
      "fromLine": 12059,
      "toLine": 12075,
      "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "update guards",
      "fromLine": 30892,
      "toLine": 30916,
      "sha256": "3e7388ee3a3a695e7e1214fc81fac922a532c0ffe4223faaa93d0a75ced14ee2"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "update pet call",
      "fromLine": 30945,
      "toLine": 30945,
      "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "name": "external gate caller",
      "fromLine": 40506,
      "toLine": 40530,
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
      "fromLine": 38928,
      "toLine": 38936,
      "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "playFM",
      "fromLine": 11463,
      "toLine": 11479,
      "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "update guards",
      "fromLine": 29712,
      "toLine": 29735,
      "sha256": "7d17b08360f80ef1b13c4becd8901b61332c71331c9d254fb5247798509c1d28"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "update pet call",
      "fromLine": 29764,
      "toLine": 29764,
      "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "name": "external gate caller",
      "fromLine": 39308,
      "toLine": 39332,
      "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
    }
  ],
  "cases": [
    {
      "source": "game.html",
      "fault": "audio",
      "status": "PASS",
      "errors": [
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        },
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        }
      ],
      "failedFrames": [
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 1,
          "sayAttempts": 1,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        },
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 2,
          "sayAttempts": 2,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        }
      ],
      "recovered": {
        "uid": "hp_critical",
        "t": 180,
        "pairT": 180,
        "pairFired": false,
        "cd": 1800,
        "tierCD": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 4,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": true
        }
      },
      "suppressed": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 4,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      },
      "healthyTwoFrames": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 1,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      }
    },
    {
      "source": "game.html",
      "fault": "hud",
      "status": "PASS",
      "errors": [
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        },
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        }
      ],
      "failedFrames": [
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 0,
          "sayAttempts": 1,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        },
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 0,
          "sayAttempts": 2,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        }
      ],
      "recovered": {
        "uid": "hp_critical",
        "t": 180,
        "pairT": 180,
        "pairFired": false,
        "cd": 1800,
        "tierCD": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": true
        }
      },
      "suppressed": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      },
      "healthyTwoFrames": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 1,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      }
    },
    {
      "source": "game-easy-test.html",
      "fault": "audio",
      "status": "PASS",
      "errors": [
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        },
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        }
      ],
      "failedFrames": [
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 1,
          "sayAttempts": 1,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        },
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 2,
          "sayAttempts": 2,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        }
      ],
      "recovered": {
        "uid": "hp_critical",
        "t": 180,
        "pairT": 180,
        "pairFired": false,
        "cd": 1800,
        "tierCD": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 4,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": true
        }
      },
      "suppressed": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 4,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      },
      "healthyTwoFrames": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 1,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      }
    },
    {
      "source": "game-easy-test.html",
      "fault": "hud",
      "status": "PASS",
      "errors": [
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        },
        {
          "sameErrorIdentity": true,
          "message": "injected-createOscillator-failure"
        }
      ],
      "failedFrames": [
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 0,
          "sayAttempts": 1,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        },
        {
          "uid": null,
          "t": 180,
          "pairT": 180,
          "pairFired": false,
          "cd": null,
          "tierCD": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "inFrame": false,
          "oscillatorCalls": 0,
          "sayAttempts": 2,
          "urgent": {
            "id": "hp_critical",
            "inFrame": true,
            "returned": true
          }
        }
      ],
      "recovered": {
        "uid": "hp_critical",
        "t": 180,
        "pairT": 180,
        "pairFired": false,
        "cd": 1800,
        "tierCD": [
          300,
          300,
          300,
          300,
          300,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": true
        }
      },
      "suppressed": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 3,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      },
      "healthyTwoFrames": {
        "uid": "hp_critical",
        "t": 179,
        "pairT": 180,
        "pairFired": false,
        "cd": 1799,
        "tierCD": [
          299,
          299,
          299,
          299,
          299,
          0
        ],
        "inFrame": false,
        "oscillatorCalls": 2,
        "sayAttempts": 1,
        "urgent": {
          "id": "hp_critical",
          "inFrame": true,
          "returned": false
        }
      }
    }
  ],
  "memoryChecksSHA256": "bc442e9a23784ad5b5d0b0fa4408953b99ba04efb454dd31260a23e5e8424626",
  "nodeAttempts": 1,
  "exitCode": 0,
  "executionReceipt": {
    "chunkId": "b5ae7c",
    "wallTimeSeconds": 0.010873
  },
  "docsSearch": {
    "chunk_id": "a13669",
    "wall_time_seconds": 0.000005208,
    "exit_code": 0,
    "original_token_count": 1655,
    "output": "docs/7아이템디자인/고유아이템_모델_어픽스_밸런싱_프로젝트_20260930.md:22:| G4 어픽스 | 발동 입력, 조건, 롤 단위, 내부 쿨, 대상 상한, 재귀 차단, 합체·보스 예외를 명시한다. 단순 스탯 증가에 머물지 않는다. | D절 계약 + 해당 전투 훅 검토 |\ndocs/2_4 펫시스템/2_4 펫시스템.md:63:- **시스템**: `_petSayCD`는 즉시 수락/거절과 티어별 글로벌쿨을 사용한다. 일반 경쟁은 `_petBidCD`→`_petFireBid`, 생존은 실제 `_petSayUrgent` 경로다. ID 쿨과 같은 UID 활성 가드는 유지한다. 단일 글로벌쿨 15초는 v6 이력이며 현행 T1=720f/T4=240f와 구분한다.\r\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:30:| 수락·거절 | 새 검사 wrapper가 실제 `_petSayCD` false/true를 직접 기록. `_petSay` true도 실제 반환 관측 | `_petBidCD`와 `_petFireBid`의 정상 undefined 반환을 false로 취급하지 않음 |\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:55:표시/SFX 예외는 실제 helper에서 잡지 않으며 이번 예외 정책·fault 검수 추가는 없다. pair 중단 뒤 안내 재생, 장기 경쟁, 다른 튜토리얼 소비, 실제 패드/언어별 표시·음성·게임/native·저장·빌드의 판정은 미검수다.\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:48:  if(_petDlgCD[id]>0) return          // 개별 쿨 중이면 입찰 불가\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:51:  if(_PB.tier>=0) _petFireBid()       // 티어별 글로벌쿨 검사 후 발동\ndocs/2_4 펫시스템/대사_스크립트.md:31:| `_petFireBid()` | 승자 발동 | 프레임 끝(및 생존 mid-fire)에 `_PB` 승자 1건 발동. T5는 현재 말풍선 강제종료 |\r\ndocs/2_4 펫시스템/대사_스크립트.md:35:- **호출 흐름**: `_checkPetDialogue` 시작 시 `_PB.tier=-1;_petInFrame=true` → 생존블록 입찰 → mid `_petFireBid()`(생존 인터럽트) → 경쟁블록 `_petBidCD` 입찰 → 끝에서 `_petFireBid()`(승자 발동).\r\ndocs/2_4 펫시스템/대사_스크립트.md:51:### 표시 함수 `_petBubbleShow(who, txt)` (line ~7524)\r\ndocs/2_4 펫시스템/대사_스크립트.md:64:- **반투명 시작 캡 `_PET_OP_MAX=0.6` (2026-07-27)**: 표시 순간부터 최대 불투명도 0.6으로 시작 — 캐릭터 위에 겹쳐도 게임 화면이 비쳐 보이도록. 게임 시작 직후 탄막 속에서 가이드가 바로 떠야 하므로 0.45는 너무 흐려서 0.6으로 상향. `_petBubbleShow`의 초기 opacity와 매 프레임 페이드 양쪽에 곱해짐. (변천: 1.0 → 0.62 → 0.45 → 0.6)\r [... omitted end of long line]\ndocs/2_4 펫시스템/대사_스크립트.md:67:- 티키타카 후발 대사 발동 시 `_petBubbleShow(_petBubble.who, _petBubble.txt)` 재호출\r\ndocs/2_4 펫시스템/대사_스크립트.md:317:> **boss_kill 강제 재생 (2026-06-29)**: 보스 처치 순간 다른 대사(페이즈 경고 등)가 떠 있어도 `_petBubble.t=0`로 **현재 대사를 강제 종료**하고, `_petDlgCD['boss_kill']`을 초기화한 뒤 `_petSay`로 무조건 재생. (기존 `_petSayCD`는 말풍선 표시 중이면 씹혀서 처치 대사가 안 나오던 문제 수정)\r [... omitted end of long line]\ndocs/8.0몬스터디자인/탄막시스템_총정리.md:33:> 2026-09-12 불꽃칼날 예외: 쿨다운 완료로 발동한 마력 부여 검격(sBash, `_stWingT>0`, shieldFuse)은 일반 마법탄을 E로도 반사한다. 쿨다운 중 일반 E는 물리만 반사한다. 무지개·대형 에너지탄은 Q 전용을 유지한다.\ndocs/archetypes/silvertail/SILVERTAIL_ARCHETYPE_v1_1.md:293:분노기 쿨 30초는 전 아키타입 공통. 예외 없음.\ndocs/8.0몬스터디자인/몬스터_공격시스템.md:10:- **근접 접촉 데미지 (예외적 존재)**: `_meleeET`(etype 0·2·4·5·6·10·12·18·19)은 플레이어에 밀착(`d<e.r+P.r+8`) 시 **atk×0.8** 접촉 타격 + 쿨다운 40~60f. (그 외 일반 몬스터는 겹쳐도 밀어내기만, 데미지 없음)\ndocs/14밸런스+수치테이블/EARLY_COMBAT_5_7_1_20260910.md:32:| 지옥강타 비용·쿨 | `stCost('giantSlam')`, `_malCost(20)`; 기본 `floor(max(60,1800−(slv−1)×12)×(1+_cdRed()))`f | 비용·쿨 수정 없음. 특정 giantSlam2 합체는420f 기반 예외. 범위500+(slv−1)×15, 보스 포이즈25%도 유지 |\r\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json:1800:        \"text\": \"중간 예외의 다음 프레임 중복 재실행을 재현하고, 최소 try/finally 메모리 후보로 해결했습니다. exit0, 정상 대조의 전체 trace도 동일합니다. 같은 예외 전달·RNG를 보존하며 큐·카운터·쿨다운을 정리합니다. 미처리 세 번째 항목도 폐기합니다. 생산 반영·실제품 인수는 미완료입니다. 소유2파일만 작성했습니다. docs26행/13파일 검색과 사운드·성능 정본의 old/new 인계, 소스 SHA·실행 JSON 근거를 포함했습니다. 이전 검사 반복0. 결과·근거 · 검사\" [... omitted end of long line]\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json:3314:        \"publicText\": \"배정된 다음 한 건(`SKILL-hellray-focus-cancellation-hb1014`)을 완료했습니다. 한국어 보고입니다.\\n\\n## 완료 보고 — 참회(hellRay) 조준 포커스 취소 경계\\n\\n**대상:** hellRay 조준 플래그 `_hrAiming`이 `_clearHeldInput`의 held clear에서 제외된 건. mortar/storm 결과는 **재실행 0**으로 인수만 했습니다.\\n\\n**결함 형태(mortar/storm과 다름):** hellRay는 level 기반 합성 release가 아니라 **LMB edge(`MBjust[0]`) 발사**입니다. 따라서 blur [... omitted end of long line]\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-d10-result.md:31:원래스킬함수는쿨/ST gate를내부모두확인하지않으며호출부에서검사한다(본편12448/12451). 후보가원본gate를임의확대하거나실제성공을'적명중'으로새정의하지않았다. 원함수의악의부족return/예외는finish실패로복원없음; 소비자/외부호출gate통합은root가검수한다. _uEq는첫장착stat값을읽는현행이고후보는UI-10갑옷인스턴스의명시단위만사용해레거시stat중첩/다른슬롯효과이중지급을피한다. [... omitted end of long line]\ndocs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:103:- 펫 대사·튜토리얼 힌트가 패드모드에서 키보드 키 대신 **패드 글리프** 표시. `_petBubbleShow`의 텍스트 세팅에 적용.\r\n"
  },
  "capacityAtMemoryCompletion": "{\"at\": \"2026-10-02T11:09:51.440473+00:00\", \"changes\": 94, \"method\": \"git status --porcelain=v1 --untracked-files=all -z\", \"status\": \"new_file_generation_held_before_100\", \"rootCompletedRaw14CheckpointRequested\": true, \"codex7StopSentOnce\": true, \"independentMemoryWorkMayContinue\": true, \"allowNewOwnedFiles\": false, \"autonomousMemoryWorkContinues\": true}\n\"_petInFrame finally 후보는 일부 PB/bubble state rollback을 하지 않는 한계로 인수. 다음 실제 pet sound/bubble 실패 이후 cooldown이 아직 저장되지 않아 같은 사건 재발화하는 caller 경계1건을 source로 확인. 기존 urgent/firstItem/flag검사 반복0, protected CD/priority 정책 임의변경0.\"\n",
  "savedUnderCapacityEpoch": "capacity-after-8c317a73-1134"
}
```

# QUESTNPC — CH1 실제 보스 진입 횟수와 boss_retry5 연결 후보

필드에서도 true인 `G.bossAlive` 엣지는 CH1-1의 보스전 재진입 사건을 세지 못한다. 튜토리얼 early return 이전에 진입 사건을 기록해야 하는 누락도 확인했다. **최종 후보는 _enterBossArena의 기존 arena/boss 활성 commit 접점에서 기존 _petBossEngage를 증가시키고, dispatcher는 기존 T4/5회 대사를 소비한다.**

최종 신규6 group PASS. 정상 최초 진입 동등·기존 활성 bubble 거절/one-shot 소비 유지. productionApplied=false/runtimeAccepted=false. 현재 role goal은 active다. source 후보 제출을 실제6단계 시연 완료로 간주하지 않는다.

## 배정·저장·소유

기존 자율 승인 백로그와 CH1-1 목표의 “기존 가이드 one-shot·중복/CD 연결 후보”에 따른 다음 독립 실제 접점이다. 앞선 부활 안내와 리플레이 후보는 별도 메모리에 보존했고 재검수하지 않았다. 기존firstItem/urgent/mapQA/gatepair 완료 fixture 실행0.

저장 전에 `tmp/mac-migration-runtime/supervisor-20261002/CAPACITY-rolling-after-3b548b06-1300-QUESTNPC.json`을 실제 읽었다. epoch rolling-after-3b548b06-1300, 새 소유 file credits2, actualChangesAtOpen63, root예약10, projection98. 감독 전달 요약의62와 파일의63이 달라 **읽은 파일값63**을 적용한다. checkpoint3b548b06661ed42a483cba9e1c61af5bfa9352bd/receipt SHA6c3789d7742941ef540a9cc483edf0b07d8d8ff3e64c60275999cd5c12774e49는 감독 제공값이고 Git 직접조회0.

이 새 폴더 checks.mjs/result.md **2파일만** 소유·저장한다. 이전 산출/TASK·production·shared docs·Git/index·타인 WIP·사용자 game/save/서버·빌드·장치/새팀/설치/게시/삭제 작업0. protected2_3·Q-only magic blackBean·어택티켓 금지·승인수치/LOCK/TBD/저장 schema 보존. 기존 source의 atkTickets=0 같은 문장은 보존했으며 동시공격 제한을 추가하지 않는다.

## 근거와 최종 패치

actual _enterBossArena는 _bossArena=true와 bossAlive=true를 설정한다. CH1-1 사망 복귀는 _restoreBossFieldState 후 _bossArena=false, bossAlive=true를 유지한다. 원본 _checkPetDialogue는 필드 첫 full tick에서 count1을 기록하고 이후 true→true 재진입을 세지 않는다. full dispatcher의 여러 튜토리얼 return은 카운터 블록보다 앞에 있어, 그동안 실제 진입 사건이 아예 기록되지 않을 수도 있다.

정본은 “같은 보스전 5회째”와 “bossAlive 상승엣지”를 함께 설명한다. 본 후보는 **명시된 기존 재진입 안내 의도에 실제 caller를 연결**하며 trigger 기술이 바뀌므로 root canonical 동기화가 필수다. 대사/5회/티어/CD를 새로 정하지 않는다.

양판 동일한 정확 replacement 3곳(각 함수 내 고유 anchor assertion 포함):

```diff
 // _checkPetDialogue 기존 보스 재도전 블록
-if(G.bossAlive&&!_petBossPrevAlive){_petBossEngage[_ch]=(_petBossEngage[_ch]||0)+1;
+const _petBossActive=G.bossAlive&&!!G._bossArena;
+if(_petBossActive&&!_petBossPrevAlive){
   if(_petBossEngage[_ch]===5)_petBidCD('boss_retry5', /* 기존 인수 그대로 */);
 }
-_petBossPrevAlive=G.bossAlive;
+_petBossPrevAlive=_petBossActive;

 // _enterBossArena 기존 bossAlive commit line의 앞부분만
-G.bossAlive=true;G._bossRef=null;
+G.bossAlive=true;
+{const _petCh=SI_TO_HELL[si]||0;
+ _petBossEngage[_petCh]=(_petBossEngage[_petCh]||0)+1;}
+_petBossPrevAlive=false;G._bossRef=null;
```

위 diff의 comment 표시는 설명용이며 **정확 old/new 원문 문자열 및 full 함수 SHA는 아래 JSON·checks에 보존**했다. root가 기존 대사 인수를 재작성할 필요 없다. 신규 module field/queue/save schema0. _petBossPrevAlive는 “활성 arena 안내 소비 엣지”를 나타내며 실제 진입에서는 false로 둔다. early return이 있어도 _petBossEngage 사건 횟수는 이미 기록된다.

| 항목 | old | final candidate |
|---|---|---|
| 사건 카운터 생산 | full dispatcher의 bossAlive 엣지에서 증가 | actual _enterBossArena의 arena/boss 활성 commit 접점에서 증가 |
| 필드 bossAlive true | 보스진입으로 count될 수 있음 | dispatcher 소비 조건은 bossAlive&&bossArena; 필드 tick 증가0 |
| 튜토리얼 return | 실제 진입을 기록 못할 수 있음 | 횟수는 enter에서 이미 기록; 기존 return/flag/후속분기 유지 |
| 5회 안내 | 기존 _petBidCD 한 번 | 같은 helper·인수로 소비; 기존 경쟁/거절 정책 유지 |
| 보스 처치 reset | _petOnChapterClear의 _petBossEngage[ch]=0 | 원문 변경0, 이번 reset 검수0 |
| lv>500 | 기존 dispatcher early return | 그대로. enter 사건 카운터는 level guard 이전에 기록되는 후보이며 고레벨 횟수 관측/제품 인수는 이번 범위 밖 |

## 최종 신규6 group

| 양판 각각 | primary | 최종 후보 |
|---|---|---|
| Lv50의 실제5 enter/capture/restore 및 서로 다른5 tutorial return | 다섯 진입 뒤 count0, 이후 첫 full consumer가 count1; boss_retry5 없음 | 각 진입에서1/2/3/4/5. 소비 가능 tick에서 boss_retry5 1회, ID599940f/T4 240f, crow/pair240f |
| 기존 필드 full tick→첫 실제 arena 진입 정상control | count1 | 이후 관측 전체 snapshot deepEqual |
| 이미 활성 bubble 중5회 안내 | 기존 guard 계약 | 입찰1회지만 발화/CD 저장 거절. 다음 tick 재입찰0. 새 재시도·인터럽트 정책0 |

5 tutorial return은 실제 _checkPetDialogue의 start, atk3, atk7, firstCharge, firstHit 조건을 명시 입력으로 순서대로 발생시켰다. firstParry/keyESC는 기존 별도 안내가 소비 단계를 가리지 않도록 이미 완료한 상태로 두었다. INV.bag는 비었고 이전 firstItem fixture 실행0.

대사 소비 전 실제 _updatePetBubble을 dt1000 두 번 호출해 선발·pair가 종료되도록 했다. dt1000은 명시한 합성 시간입력이며 게임의 실제 프레임 간격이 아니다. 기존 ID/Tier CD 감소를 실제 helper로 실행했다. helper 입찰이나 count5가 실제 표시 완료와 같다는 주장은 하지 않는다. 활성 bubble 거절 group이 그 차이를 증명한다.

## 단계별 후보·하니스 실패 이력

| 단계 | 실제 Node 시도 | 결과/한계 |
|---|---|---|
| V1 (Lv500 arena-active 엣지+enter에서 prev=false) 최초 | exit1 | 대역 SI_TO_HELL[0] 누락으로 _BOSS_ATHEME lookup rc 예외. 시작했지만 group 완료0 |
| V1 대역 보충 | exit0, 신규6 group | 실제 enter/capture/restore 횟수와 direct retry=true, 기존 arena alive edge 확인. 완료 fixture 재실행0 |
| V2 (이 최종 후보) 최초 | exit1 | Lv50 후속 소비 단계의 합성 ULT_SLOT 누락.5 tutorial return 관측 후 group 완료 전에 실패 |
| V2 대역 ULT_SLOT=null 보충 | exit0, 신규6 group | 최종 위3경계×양판 완료 |

**총 Node fixture4시도 = 실패2/완료2.** 서로 다른 V1/V2 완료 group12개이지만 최종 후보 PASS는 V2의6개만이다. V1은 full dispatcher에 도달하지 못한 진입을 놓치는 한계 때문에 **채택 후보에서 제외**한다. V1의 direct retry=true 검사 등을 V2 인수로 합산하지 않는다. 저장된 checks는 최종 V2 실행 원문만이며 V1 전체 stdout/실패 이력은 result 안에 함께 보존한다.

완료 V1 UTC2026-10-02T12:58:18.382Z–12:58:18.537Z(KST21:58:18), 완료 V2 UTC2026-10-02T13:00:55.467Z–13:00:55.624Z(KST22:00:55). 실패 개별 UTC clock receipt는 채집하지 않아 정확 timestamp를 추정하지 않는다. 각 실패는 대응 완료 전에 발생했다. 유틸리티 hash/save는 fixture 시도로 집계하지 않는다.

실제 실행은 지정 Node `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module -`에 heredoc stdin 원문을 전달했다. V2 repaired delimiter `QUESTNPC_BOSS_RETURN_V2_REPAIRED`. 파일 실행·저장 후 검사 실행0.

## 실제 source와 대역

full _enterBossArena/_captureBossFieldState/_restoreBossFieldState 및 full pet dispatcher/state/helper/playFM을 추출·실행했다. map geometry/collision/카메라를 검수한 것이 아니라 **가이드 사건의 caller 연결**을 검수했다. genBossArena는1cell synthetic 반환, mkEn는 synthetic boss 반환, _isDruidFinale=false, _bossSfx/buildMapCache/particle/model/오디오·DOM 등의 구현은 대역이다. P/G 실제전투·사망·retryBtn 전체 async handler 및 genArena 실제geometry는 실행0.

원본 CH1 복귀 handler의 bossAlive=true/arena=false 원문을 읽었지만 fixture에서 실제 retryBtn handler 전체는 실행하지 않았다. actual capture/restore 이후 해당 필드 상태를 명시 대입했다. BOSS팀 실제 사망 복원 검수를 재실행하거나 대체하지 않는다. DEMO si3의 _retryDruidFinale caller는 최종 V2에서 실행0. 실제 button/native/frame timing·맵 visual/청취·배포 인수0.

## docs 전체검색·정확 root handoff

V1 후보 뒤 docs 전체검색1회, **후보 생산 접점이 바뀐 V2 뒤 전체검색을 별도1회** 수행했다. 같은 완료 체크 반복 검색이 아니라 코드 변경 후 동기화 계약을 따른 것이다. V2 검색 raw는 아래 JSON에 포함하며 공유 docs 수정0.

| 정본 | old | root 통합 후 new |
|---|---|---|
| 2_4/대사_스크립트.md:343 | 같은 보스전5회째, ID9999초 | 명칭/임계5/인수/ID9999초=599940f 유지. actual entry 사건을 생산하고 dispatcher가 기존 입찰 소비 |
| 같은 문서:345 | _petBossEngage를 G.bossAlive false→true마다 증가 | _enterBossArena의 arena/boss 활성 commit에서 SI_TO_HELL[si] 챕터별 증가. _petBossPrevAlive=false. dispatcher는 bossAlive&&bossArena 엣지로5회 안내를 한 번 소비; tutorial return은 사건기록을 취소하지 않음 |
| 같은 문서 함수/flow 표 | full dispatcher에서 이벤트 기록과 소비 | record(enter)와 bid/display(dispatcher/helper) 분리. 활성bubble/티어/ID CD 거절 및 동일티어 코드순 정책 그대로. 입찰≠발화 완료 |
| 2_4/대사_개편_v7_설계.md:189,195,206 | 재진입 안내 배선 완료, death_dual과 별개 | 역사 설명 보존·현행 접점 부록 추가. CH1 field bossAlive 유지 경계의 누락과 이번 최종후보 범위를 연결 |
| 같은 문서:200, 번역대상_전체목록.md:3296–3297 | 26개국어 전파 완료 | 대사/언어key 변경0. 펫script345의 “전파 대기”와 최신 번역 목록 완료 표기는 root가 기존canonical 증거로 동기화; 이번에26 locale 파일 검수했다는 주장0 |
| CH1 boss respawn/gate 진행 정본 | 열린 field 진행과 bossAlive 유지 | 게임플레이 복귀/지역/Gate/기하/자원 수치 변경0. 가이드 생산 접점은 펫canonical로 연결; BOSS root순차 인수 |
| CHANGELOG/CONTINUOUS | 본 신규 최종후보 미기재 | V1은채택제외, V2 source6 group, 실패2/완료2, helper수락·HUD별도, production/runtime false를 독립 항목으로 기록 |

protected2_3 수정0, 새 CD/대사/가이드 콘텐츠/티어/큐/attacktickets·세이브 schema0. 원문 supersede가 필요한 trigger 계약은 root가 production+canonical 함께 통합할 때만 확정한다.

## 제품 인수 Gate와 다음 작업

root가 최신 BOSS/QA source 및 진입·재도전 소유와 2함수 anchor를 순차 병합해야 한다. low-level 실제 tutorial timing, V2 direct demo retry, lv>500 사건기록 경계, same 후보의 사용자입력/획득/사망/부활·정상intro/도중 오류는 실제 milestone 인수에 남는다. 완료 산출 보존/checkpoint를 제품 구현 완료로 합산하지 않는다. 이번 rolling credit2를 사용한 뒤에도 다음 승인독립 작업은 메모리에서 계속한다.

## 원전체 stdout·source/fragment/candidate SHA·실패 영수증

두 성공 stdout은 JSON.parse에 성공한 **온전한 원출력**을 아래에 의미변경 없이 직렬화하여 보존한다. 실패 raw도 포함했다. checks 파일은 V2 성공 실행 stdin byte를 그대로 저장했고 저장 SHA는 별도 영수증으로 확인한다. result 자기 hash는 순환참조라 본문에 넣지 않는다.

```json
{
  "final": {
    "taskId": "QUESTNPC-boss-reentry-record-before-tutorial-return-memory-v2",
    "startUTC": "2026-10-02T13:00:55.467Z",
    "endUTC": "2026-10-02T13:00:55.624Z",
    "sources": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "sha256": "eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "sha256": "b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515"
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
        "fromLine": 40129,
        "toLine": 40137,
        "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "playFM",
        "fromLine": 12062,
        "toLine": 12078,
        "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "update guards",
        "fromLine": 30895,
        "toLine": 30919,
        "sha256": "3e7388ee3a3a695e7e1214fc81fac922a532c0ffe4223faaa93d0a75ced14ee2"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "update pet call",
        "fromLine": 30948,
        "toLine": 30948,
        "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "external gate caller",
        "fromLine": 40509,
        "toLine": 40533,
        "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "_enterBossArena",
        "fromLine": 29551,
        "toLine": 29614,
        "sha256": "a8a98bdd25c78959a3d1b59889d5eaa54e72250b030fbab92adec60734f217da"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "_captureBossFieldState",
        "fromLine": 29517,
        "toLine": 29533,
        "sha256": "9dbf4bcb5a4d5957c2ef25786e2cc1330d77430844247c64cb40518ed3d03927"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "_restoreBossFieldState",
        "fromLine": 29534,
        "toLine": 29550,
        "sha256": "720937dc6b2d56928e1e86d50ad9eb92046163f7cb58dc3af9e456fcdf08db55"
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
        "fromLine": 38931,
        "toLine": 38939,
        "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "playFM",
        "fromLine": 11466,
        "toLine": 11482,
        "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "update guards",
        "fromLine": 29715,
        "toLine": 29738,
        "sha256": "7d17b08360f80ef1b13c4becd8901b61332c71331c9d254fb5247798509c1d28"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "update pet call",
        "fromLine": 29767,
        "toLine": 29767,
        "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "external gate caller",
        "fromLine": 39311,
        "toLine": 39335,
        "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "_enterBossArena",
        "fromLine": 28384,
        "toLine": 28447,
        "sha256": "94c72b4fde82b1c46eacd4ccfacfab4c198c4606f803280086ca77c3158e6aa5"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "_captureBossFieldState",
        "fromLine": 28350,
        "toLine": 28366,
        "sha256": "9dbf4bcb5a4d5957c2ef25786e2cc1330d77430844247c64cb40518ed3d03927"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "_restoreBossFieldState",
        "fromLine": 28367,
        "toLine": 28383,
        "sha256": "720937dc6b2d56928e1e86d50ad9eb92046163f7cb58dc3af9e456fcdf08db55"
      }
    ],
    "patches": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "dispatcherOld": "if(G.bossAlive&&!_petBossPrevAlive){_petBossEngage[_ch]=(_petBossEngage[_ch]||0)+1;",
        "dispatcherNew": "const _petBossActive=G.bossAlive&&!!G._bossArena;\n  if(_petBossActive&&!_petBossPrevAlive){",
        "prevOld": "_petBossPrevAlive=G.bossAlive;",
        "prevNew": "_petBossPrevAlive=_petBossActive;",
        "enterOld": "G.bossAlive=true;G._bossRef=null;",
        "enterNew": "G.bossAlive=true;{const _petCh=SI_TO_HELL[si]||0;_petBossEngage[_petCh]=(_petBossEngage[_petCh]||0)+1;}_petBossPrevAlive=false;G._bossRef=null;",
        "dispatcherOriginalSHA": "660b4ad74fe1792067e88dab0826c644bd925439c3adde1c678ff4b18f751ef3",
        "dispatcherCandidateSHA": "7fd4df98e5e3c81ea8516d5f90f3b8bce89c23d6e36e2daf025ac96ba6fbf8e7",
        "enterOriginalSHA": "a8a98bdd25c78959a3d1b59889d5eaa54e72250b030fbab92adec60734f217da",
        "enterCandidateSHA": "10ac9399bc6ad0a0c23956f148371b7ed803be8f4517d0c295364d88f40d5295"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "dispatcherOld": "if(G.bossAlive&&!_petBossPrevAlive){_petBossEngage[_ch]=(_petBossEngage[_ch]||0)+1;",
        "dispatcherNew": "const _petBossActive=G.bossAlive&&!!G._bossArena;\n  if(_petBossActive&&!_petBossPrevAlive){",
        "prevOld": "_petBossPrevAlive=G.bossAlive;",
        "prevNew": "_petBossPrevAlive=_petBossActive;",
        "enterOld": "G.bossAlive=true;G._bossRef=null;",
        "enterNew": "G.bossAlive=true;{const _petCh=SI_TO_HELL[si]||0;_petBossEngage[_petCh]=(_petBossEngage[_petCh]||0)+1;}_petBossPrevAlive=false;G._bossRef=null;",
        "dispatcherOriginalSHA": "660b4ad74fe1792067e88dab0826c644bd925439c3adde1c678ff4b18f751ef3",
        "dispatcherCandidateSHA": "7fd4df98e5e3c81ea8516d5f90f3b8bce89c23d6e36e2daf025ac96ba6fbf8e7",
        "enterOriginalSHA": "94c72b4fde82b1c46eacd4ccfacfab4c198c4606f803280086ca77c3158e6aa5",
        "enterCandidateSHA": "8617151fdb91252f48294b30ce3bc9045b2559c19f6c93027ed67bfe2a09a627"
      }
    ],
    "cases": [
      {
        "source": "game.html",
        "case": "five-real-entry-events-recorded-despite-five-different-tutorial-returns",
        "status": "PASS",
        "rounds": [
          {
            "entry": 1,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 300,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599940
              },
              "tiers": [
                0,
                720,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 1
            },
            "candidate": {
              "count": 1,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 300,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599940
              },
              "tiers": [
                0,
                720,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 1
            }
          },
          {
            "entry": 2,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 299,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599939
              },
              "tiers": [
                0,
                719,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 2
            },
            "candidate": {
              "count": 2,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 299,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599939
              },
              "tiers": [
                0,
                719,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 2
            }
          },
          {
            "entry": 3,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 298,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599938
              },
              "tiers": [
                0,
                718,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 3
            },
            "candidate": {
              "count": 3,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 298,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599938
              },
              "tiers": [
                0,
                718,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 3
            }
          },
          {
            "entry": 4,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 297,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599937
              },
              "tiers": [
                0,
                717,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 4
            },
            "candidate": {
              "count": 4,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 297,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599937
              },
              "tiers": [
                0,
                717,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 4
            }
          },
          {
            "entry": 5,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 296,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599936
              },
              "tiers": [
                0,
                716,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 5
            },
            "candidate": {
              "count": 5,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 296,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false,
                "sourceTxt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."
              },
              "cd": {
                "tut_start": 599936
              },
              "tiers": [
                0,
                716,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 5
            }
          }
        ],
        "originalAfterConsumer": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "cat",
            "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
            "t": -700,
            "mt": 300,
            "pair": null,
            "pairFired": true,
            "sourceTxt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐."
          },
          "cd": {
            "tut_start": 597935
          },
          "tiers": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "bids": [],
          "gen": 5
        },
        "candidateAfterConsumer": {
          "count": 5,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "crow",
            "txt": "다섯 번째군. 이번엔 바뀐 게 있어야지.",
            "t": 240,
            "mt": 240,
            "pair": {
              "who": "cat",
              "sourceTxt": "또 와?! 이번엔 진짜 패턴 외웠어!",
              "txt": "또 와?! 이번엔 진짜 패턴 외웠어!",
              "mt": 240
            },
            "pairFired": false,
            "sourceTxt": "다섯 번째군. 이번엔 바뀐 게 있어야지."
          },
          "cd": {
            "tut_start": 597935,
            "boss_retry5": 599940
          },
          "tiers": [
            0,
            0,
            0,
            0,
            240,
            0
          ],
          "bids": [
            "boss_retry5"
          ],
          "gen": 5
        }
      },
      {
        "source": "game.html",
        "case": "initial-field-to-first-entry-normal-control",
        "status": "PASS",
        "state": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": null,
            "txt": "",
            "t": 0,
            "mt": 0,
            "pair": null,
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
          "bids": [],
          "gen": 1
        }
      },
      {
        "source": "game.html",
        "case": "existing-active-bubble-refusal-consumes-once-no-new-retry-policy",
        "status": "PASS",
        "state": {
          "count": 5,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": null,
            "txt": "",
            "t": 8,
            "mt": 0,
            "pair": null,
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
          "bids": [
            "boss_retry5"
          ],
          "gen": 1
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "five-real-entry-events-recorded-despite-five-different-tutorial-returns",
        "status": "PASS",
        "rounds": [
          {
            "entry": 1,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 300,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599940
              },
              "tiers": [
                0,
                720,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 1
            },
            "candidate": {
              "count": 1,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 300,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599940
              },
              "tiers": [
                0,
                720,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 1
            }
          },
          {
            "entry": 2,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 299,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599939
              },
              "tiers": [
                0,
                719,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 2
            },
            "candidate": {
              "count": 2,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 299,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599939
              },
              "tiers": [
                0,
                719,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 2
            }
          },
          {
            "entry": 3,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 298,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599938
              },
              "tiers": [
                0,
                718,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 3
            },
            "candidate": {
              "count": 3,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 298,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599938
              },
              "tiers": [
                0,
                718,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 3
            }
          },
          {
            "entry": 4,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 297,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599937
              },
              "tiers": [
                0,
                717,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 4
            },
            "candidate": {
              "count": 4,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 297,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599937
              },
              "tiers": [
                0,
                717,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 4
            }
          },
          {
            "entry": 5,
            "original": {
              "count": 0,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 296,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599936
              },
              "tiers": [
                0,
                716,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 5
            },
            "candidate": {
              "count": 5,
              "prev": false,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.",
                "t": 296,
                "mt": 300,
                "pair": {
                  "who": "cat",
                  "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
                  "mt": 300
                },
                "pairFired": false
              },
              "cd": {
                "tut_start": 599936
              },
              "tiers": [
                0,
                716,
                0,
                0,
                0,
                0
              ],
              "bids": [],
              "gen": 5
            }
          }
        ],
        "originalAfterConsumer": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "cat",
            "txt": "…아직 살아있네. 좌클릭으로 저것들 쳐봐.",
            "t": -700,
            "mt": 300,
            "pair": null,
            "pairFired": true
          },
          "cd": {
            "tut_start": 597935
          },
          "tiers": [
            0,
            0,
            0,
            0,
            0,
            0
          ],
          "bids": [],
          "gen": 5
        },
        "candidateAfterConsumer": {
          "count": 5,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "crow",
            "txt": "다섯 번째군. 이번엔 바뀐 게 있어야지.",
            "t": 240,
            "mt": 240,
            "pair": {
              "who": "cat",
              "txt": "또 와?! 이번엔 진짜 패턴 외웠어!",
              "mt": 240
            },
            "pairFired": false
          },
          "cd": {
            "tut_start": 597935,
            "boss_retry5": 599940
          },
          "tiers": [
            0,
            0,
            0,
            0,
            240,
            0
          ],
          "bids": [
            "boss_retry5"
          ],
          "gen": 5
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "initial-field-to-first-entry-normal-control",
        "status": "PASS",
        "state": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": null,
            "txt": "",
            "t": 0,
            "mt": 0,
            "pair": null,
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
          "bids": [],
          "gen": 1
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "existing-active-bubble-refusal-consumes-once-no-new-retry-policy",
        "status": "PASS",
        "state": {
          "count": 5,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": null,
            "txt": "",
            "t": 8,
            "mt": 0,
            "pair": null,
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
          "bids": [
            "boss_retry5"
          ],
          "gen": 1
        }
      }
    ],
    "newCaseGroups": 6,
    "productionApplied": false,
    "runtimeAccepted": false,
    "newFiles": 0,
    "priorFixtureRuns": 0,
    "v1CompletedTestsRerun": 0
  },
  "finalAttempts": [
    {
      "attempt": 1,
      "exitCode": 1,
      "chunkId": "ecbb19",
      "wallTimeSeconds": 0.00000525,
      "rawFailure": "evalmachine.<anonymous>:278\n  if(!_petTut.keyZ&&ULT_SLOT&&ULT_SLOT.id){_petTut.keyZ=true;_petSayCD('tut_keyZ','crow','Z. 필살기다. 아껴 써라.',4,9999,'cat','Z 누르면 대박! 쿨타임 길어!',4)}\n                    ^\n\nReferenceError: ULT_SLOT is not defined\n    at _checkPetDialogue (evalmachine.<anonymous>:278:21)\n    at evalmachine.<anonymous>:1:68\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at Object.run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:39:18)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:81:24\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n\nNode.js v24.15.0\n"
    },
    {
      "attempt": 2,
      "exitCode": 0,
      "chunkId": "069ac0",
      "wallTimeSeconds": 0.052271,
      "stdoutJSONComplete": true
    }
  ],
  "earlierV1": {
    "taskId": "QUESTNPC-CH1-boss-reentry-existing-guide-wiring-memory",
    "startUTC": "2026-10-02T12:58:18.382Z",
    "endUTC": "2026-10-02T12:58:18.537Z",
    "sources": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "sha256": "eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "sha256": "b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515"
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
        "fromLine": 40129,
        "toLine": 40137,
        "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "playFM",
        "fromLine": 12062,
        "toLine": 12078,
        "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "update guards",
        "fromLine": 30895,
        "toLine": 30919,
        "sha256": "3e7388ee3a3a695e7e1214fc81fac922a532c0ffe4223faaa93d0a75ced14ee2"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "update pet call",
        "fromLine": 30948,
        "toLine": 30948,
        "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "external gate caller",
        "fromLine": 40509,
        "toLine": 40533,
        "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "_enterBossArena",
        "fromLine": 29551,
        "toLine": 29614,
        "sha256": "a8a98bdd25c78959a3d1b59889d5eaa54e72250b030fbab92adec60734f217da"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "_captureBossFieldState",
        "fromLine": 29517,
        "toLine": 29533,
        "sha256": "9dbf4bcb5a4d5957c2ef25786e2cc1330d77430844247c64cb40518ed3d03927"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "_restoreBossFieldState",
        "fromLine": 29534,
        "toLine": 29550,
        "sha256": "720937dc6b2d56928e1e86d50ad9eb92046163f7cb58dc3af9e456fcdf08db55"
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
        "fromLine": 38931,
        "toLine": 38939,
        "sha256": "7aa30305fec525743bc12c3273c4fe3fb5666850370e338b3006dcc1417ac5ed"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "playFM",
        "fromLine": 11466,
        "toLine": 11482,
        "sha256": "afd3add856318ce74e56b564f4872e02e2c64a3f6d77ff805b3555017bd7b582"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "update guards",
        "fromLine": 29715,
        "toLine": 29738,
        "sha256": "7d17b08360f80ef1b13c4becd8901b61332c71331c9d254fb5247798509c1d28"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "update pet call",
        "fromLine": 29767,
        "toLine": 29767,
        "sha256": "0f1f605394e18411fed0a213145d2cc2f51175d5cc98ecce45f300de077fc0f2"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "external gate caller",
        "fromLine": 39311,
        "toLine": 39335,
        "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "_enterBossArena",
        "fromLine": 28384,
        "toLine": 28447,
        "sha256": "94c72b4fde82b1c46eacd4ccfacfab4c198c4606f803280086ca77c3158e6aa5"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "_captureBossFieldState",
        "fromLine": 28350,
        "toLine": 28366,
        "sha256": "9dbf4bcb5a4d5957c2ef25786e2cc1330d77430844247c64cb40518ed3d03927"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "_restoreBossFieldState",
        "fromLine": 28367,
        "toLine": 28383,
        "sha256": "720937dc6b2d56928e1e86d50ad9eb92046163f7cb58dc3af9e456fcdf08db55"
      }
    ],
    "patches": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "dispatcherOriginalSHA": "660b4ad74fe1792067e88dab0826c644bd925439c3adde1c678ff4b18f751ef3",
        "dispatcherCandidateSHA": "5c05facbb5baff0f6abd79b88f3ec40ccff40c103254005792bb89cc6db56c2e",
        "enterOriginalSHA": "a8a98bdd25c78959a3d1b59889d5eaa54e72250b030fbab92adec60734f217da",
        "enterCandidateSHA": "e4306f170bcec6425fd11ae444af7b3339bcf06e4fbf5fef8ee00a45a0985b75",
        "dispatcherOld": "if(G.bossAlive&&!_petBossPrevAlive)",
        "dispatcherNew": "const _petBossActive=G.bossAlive&&!!G._bossArena; if(_petBossActive&&!_petBossPrevAlive)",
        "prevOld": "_petBossPrevAlive=G.bossAlive;",
        "prevNew": "_petBossPrevAlive=_petBossActive;",
        "enterOld": "G.bossAlive=true;G._bossRef=null;",
        "enterNew": "G.bossAlive=true;_petBossPrevAlive=false;G._bossRef=null;"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "dispatcherOriginalSHA": "660b4ad74fe1792067e88dab0826c644bd925439c3adde1c678ff4b18f751ef3",
        "dispatcherCandidateSHA": "5c05facbb5baff0f6abd79b88f3ec40ccff40c103254005792bb89cc6db56c2e",
        "enterOriginalSHA": "94c72b4fde82b1c46eacd4ccfacfab4c198c4606f803280086ca77c3158e6aa5",
        "enterCandidateSHA": "b0870db07f245142137114f56e18d53b701e21e9534439a50619909493fab5e5",
        "dispatcherOld": "if(G.bossAlive&&!_petBossPrevAlive)",
        "dispatcherNew": "const _petBossActive=G.bossAlive&&!!G._bossArena; if(_petBossActive&&!_petBossPrevAlive)",
        "prevOld": "_petBossPrevAlive=G.bossAlive;",
        "prevNew": "_petBossPrevAlive=_petBossActive;",
        "enterOld": "G.bossAlive=true;G._bossRef=null;",
        "enterNew": "G.bossAlive=true;_petBossPrevAlive=false;G._bossRef=null;"
      }
    ],
    "cases": [
      {
        "source": "game.html",
        "case": "CH1-field-restore-and-five-actual-arena-entries",
        "status": "PASS",
        "rounds": [
          {
            "entry": 1,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 1
            },
            "candidate": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 1
            }
          },
          {
            "entry": 2,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 2
            },
            "candidate": {
              "count": 2,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 2
            }
          },
          {
            "entry": 3,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 3
            },
            "candidate": {
              "count": 3,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 3
            }
          },
          {
            "entry": 4,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 4
            },
            "candidate": {
              "count": 4,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 4
            }
          },
          {
            "entry": 5,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 5
            },
            "candidate": {
              "count": 5,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "다섯 번째군. 이번엔 바뀐 게 있어야지.",
                "t": 240,
                "mt": 240,
                "pair": {
                  "who": "cat",
                  "sourceTxt": "또 와?! 이번엔 진짜 패턴 외웠어!",
                  "txt": "또 와?! 이번엔 진짜 패턴 외웠어!",
                  "mt": 240
                },
                "pairFired": false,
                "sourceTxt": "다섯 번째군. 이번엔 바뀐 게 있어야지."
              },
              "cd": {
                "boss_retry5": 599940
              },
              "tiers": [
                0,
                0,
                0,
                0,
                240,
                0
              ],
              "bids": [
                "boss_retry5"
              ],
              "gen": 5
            }
          }
        ]
      },
      {
        "source": "game.html",
        "case": "direct-retry-true-without-field-tick",
        "status": "PASS",
        "original": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": null,
            "txt": "",
            "t": 0,
            "mt": 0,
            "pair": null,
            "pairFired": false,
            "_uid": null
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
          "bids": [],
          "gen": 5
        },
        "candidate": {
          "count": 5,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "crow",
            "txt": "다섯 번째군. 이번엔 바뀐 게 있어야지.",
            "t": 240,
            "mt": 240,
            "pair": {
              "who": "cat",
              "sourceTxt": "또 와?! 이번엔 진짜 패턴 외웠어!",
              "txt": "또 와?! 이번엔 진짜 패턴 외웠어!",
              "mt": 240
            },
            "pairFired": false,
            "_uid": null,
            "sourceTxt": "다섯 번째군. 이번엔 바뀐 게 있어야지."
          },
          "cd": {
            "boss_retry5": 599940
          },
          "tiers": [
            0,
            0,
            0,
            0,
            240,
            0
          ],
          "bids": [
            "boss_retry5"
          ],
          "gen": 5
        }
      },
      {
        "source": "game.html",
        "case": "existing-in-arena-alive-edge-normal-control",
        "status": "PASS",
        "state": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "crow",
            "txt": "…따라오는 거 아니야. 같은 방향일 뿐이지.",
            "t": 299,
            "mt": 300,
            "pair": null,
            "pairFired": false,
            "sourceTxt": "…따라오는 거 아니야. 같은 방향일 뿐이지."
          },
          "cd": {
            "chapter_0": 5999939
          },
          "tiers": [
            1199,
            0,
            0,
            0,
            0,
            0
          ],
          "bids": [
            "chapter_0"
          ],
          "gen": 0
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "CH1-field-restore-and-five-actual-arena-entries",
        "status": "PASS",
        "rounds": [
          {
            "entry": 1,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 1
            },
            "candidate": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 1
            }
          },
          {
            "entry": 2,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 2
            },
            "candidate": {
              "count": 2,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 2
            }
          },
          {
            "entry": 3,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 3
            },
            "candidate": {
              "count": 3,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 3
            }
          },
          {
            "entry": 4,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 4
            },
            "candidate": {
              "count": 4,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 4
            }
          },
          {
            "entry": 5,
            "original": {
              "count": 1,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": null,
                "txt": "",
                "t": 0,
                "mt": 0,
                "pair": null,
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
              "bids": [],
              "gen": 5
            },
            "candidate": {
              "count": 5,
              "prev": true,
              "bossAlive": true,
              "arena": true,
              "bubble": {
                "who": "crow",
                "txt": "다섯 번째군. 이번엔 바뀐 게 있어야지.",
                "t": 240,
                "mt": 240,
                "pair": {
                  "who": "cat",
                  "txt": "또 와?! 이번엔 진짜 패턴 외웠어!",
                  "mt": 240
                },
                "pairFired": false
              },
              "cd": {
                "boss_retry5": 599940
              },
              "tiers": [
                0,
                0,
                0,
                0,
                240,
                0
              ],
              "bids": [
                "boss_retry5"
              ],
              "gen": 5
            }
          }
        ]
      },
      {
        "source": "game-easy-test.html",
        "case": "direct-retry-true-without-field-tick",
        "status": "PASS",
        "original": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": null,
            "txt": "",
            "t": 0,
            "mt": 0,
            "pair": null,
            "pairFired": false,
            "_uid": null
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
          "bids": [],
          "gen": 5
        },
        "candidate": {
          "count": 5,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "crow",
            "txt": "다섯 번째군. 이번엔 바뀐 게 있어야지.",
            "t": 240,
            "mt": 240,
            "pair": {
              "who": "cat",
              "txt": "또 와?! 이번엔 진짜 패턴 외웠어!",
              "mt": 240
            },
            "pairFired": false,
            "_uid": null
          },
          "cd": {
            "boss_retry5": 599940
          },
          "tiers": [
            0,
            0,
            0,
            0,
            240,
            0
          ],
          "bids": [
            "boss_retry5"
          ],
          "gen": 5
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "existing-in-arena-alive-edge-normal-control",
        "status": "PASS",
        "state": {
          "count": 1,
          "prev": true,
          "bossAlive": true,
          "arena": true,
          "bubble": {
            "who": "crow",
            "txt": "…따라오는 거 아니야. 같은 방향일 뿐이지.",
            "t": 299,
            "mt": 300,
            "pair": null,
            "pairFired": false
          },
          "cd": {
            "chapter_0": 5999939
          },
          "tiers": [
            1199,
            0,
            0,
            0,
            0,
            0
          ],
          "bids": [
            "chapter_0"
          ],
          "gen": 0
        }
      }
    ],
    "newCaseGroups": 6,
    "productionApplied": false,
    "runtimeAccepted": false,
    "newFiles": 0,
    "priorFixtureRuns": 0
  },
  "earlierV1Attempts": [
    {
      "attempt": 1,
      "exitCode": 1,
      "chunkId": "02ce19",
      "rawFailure": "evalmachine.<anonymous>:88\n  const _sCol=_sBt.rc+'.8)';\n                   ^\n\nTypeError: Cannot read properties of undefined (reading 'rc')\n    at _enterBossArena (evalmachine.<anonymous>:88:20)\n    at evalmachine.<anonymous>:1:11\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at Object.run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:39:18)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:69:26\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n\nNode.js v24.15.0\n"
    },
    {
      "attempt": 2,
      "exitCode": 0,
      "chunkId": "b92d96",
      "stdoutJSONComplete": true
    }
  ],
  "docsSearch": {
    "cmd": "rg -n --max-columns 360 --max-columns-preview '_petBossPrevAlive|_petBossEngage|boss_retry5|재도전 카운트' docs/",
    "exitCode": 0,
    "raw": "docs/2_4 펫시스템/대사_스크립트.md:343:| boss_retry5 | **같은 보스전 재진입 5회째** (v7 배선 ✅) | 9999 | 다섯 번째군. 이번엔 바뀐 게 있어야지. | 또 와?! 이번엔 진짜 패턴 외웠어! |\r\ndocs/2_4 펫시스템/대사_스크립트.md:345:> **boss_retry5 배선 (2026-07-05, v7)**: `_petBossEngage[_ch]` — `G.bossAlive` 상승엣지(false→true)마다 챕터별 카운트, 5회째 발동(T4). 보스 처치(`_petOnChapterClear`) 시 리셋. 번역 No.2908/2909, ⏳26개국어 전파 대기.\r\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:189:- **미배선 대사 배선**: ✅ 진행. `boss_retry5`(보스전 재진입 5회째)·`trophy_legendary_kill`(etype99 처치) **배선 완료**. `syn_*`는 시너지 시스템 미구현이라 **배선 불가**(스킵).\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:195:  - #2 미배선 2대사 배선(`boss_retry5`·`trophy_legendary_kill`), `syn_*`는 시스템 미구현으로 스킵.\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:200:- **Phase C ✅ (2026-07-06)**: 신규 8문자열(펫 6: boss_retry5·trophy_legendary_kill·boss_exec + 탭라벨 2, No.2908~2915) **26개국어 전파 완료**. death_dual 정착 확인 후 진행, node --check 26/26 통과. `X`(처형)는 렌더타임 `_padifyHint`가 패드모드서 LT+RT로 치환하므로 lang엔 X 유지.\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:206:- 개념 보완관계: `boss_retry5`(게임 중 보스 재진입)와 `dd_repeat5`/`dd_boss`(사망화면)는 문맥이 달라 중복 아님.\ndocs/16번역·로컬라이제이션/번역대상_전체목록.md:3296:| 2908 | 다섯 번째군. 이번엔 바뀐 게 있어야지. | The fifth time. Something had better change this round. | 펫 v7 배선 boss_retry5(핵터). ✅ 26개국어 전파 완료 (2026-07-06) |\r\ndocs/16번역·로컬라이제이션/번역대상_전체목록.md:3297:| 2909 | 또 와?! 이번엔 진짜 패턴 외웠어! | Again?! This time I really did memorize the pattern! | 펫 v7 배선 boss_retry5(디로이 pair). ✅ 26개국어 전파 완료 (2026-07-06) |\r\n"
  }
}
```

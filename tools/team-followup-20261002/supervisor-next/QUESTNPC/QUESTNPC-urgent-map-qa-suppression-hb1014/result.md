# QUESTNPC urgent map QA suppression — 한 건 완료

**현행 결함을 양판에서 재현했다.** mapqa=1에서도 프레임 외 _petSayUrgent는 기존 bubble/pair를 중단하고 새 pet 자막·urgent SFX·ID/티어 CD를 생성한다. 문서의 map QA/combatqa 펫 대사 차단 계약에 어긋난다. 최소 메모리 후보는 urgent 진입을 거절하고, 같은 사건의 잔여 입찰 소비도 발화 없이 정리한다. mapqa=false 정상 외부 인터럽트와 프레임 슬롯 소비는 현행과 전체 상태/trace 동등했다.

productionApplied=false / runtimeAccepted=false. 새 Node 실행1회 exit0, 양판 각각 primary/candidate·동일 사건 소비·정상 control2개로 신규 관측8건이다. 이전 firstItem/b9/T4/T5 완료 회귀·전체 검사·root expanded _skUnclick 중복0. 실행 실패0, 재실행0. 새 산출은 이 result.md와 checks.mjs 두 파일뿐이다.

## 계약과 실제 source

| 근거 | 현행 확인 |
|---|---|
| MAP_TEST_SERVER.md:51,53 | 기본 mapqa는 펫 대사 차단. stage4 combatqa=1에서도 차단 유지 |
| 맵설정_소환굴.md:65–66 / WORLD_STRUCTURE_SSOT.md:208 | 전투 배치를 보존하는 관람 옵션이어도 스킬·펫 대사 차단 유지 |
| URL source | main3457/easy3232의 실제 URLSearchParams 선언으로 mapqa=1을 읽음 |
| 일반 helper | main9103/9149, easy8554/8600은 _MAP_QA_MODE에서 false 반환 |
| urgent / 소비 | main9110–9124/9126–9141, easy8561–8575/8577–8592에는 QA guard 없음 |
| 외부 caller | main40503–40527 / easy39305–39329 지옥문 개방 블록은 QA guard 없이 boss_gate_open 호출 |
| 프레임 소비 계약 | _petInFrame=true에서 urgent는 실제 _PB에 tier5 입찰, _petFireBid는 그 슬롯을 소비해 인터럽트 |

현행 입력 SHA는 본편 **8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b**, easy **50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057**다. 실행 입력과 마지막 hash 관측 동일. helper 전체·URL 선언·실제 gate caller의 각각 행/SHA는 아래 inline evidence에 고정했다. root WIP 및 공용 소스에 수정0. parent의6b865637은 과거 제공 값이며 현재 HEAD를 주장하지 않는다.

## Primary → candidate → 정상 control

기존 speech/pair는 실제 _petSay로 생성했다(텍스트는 합성 seed). QA flag는 실제 URL 선언에서 얻었고 bubble/CD를 가짜 대입하지 않았다. 실제 gate-open caller 전체를 실행했으며 _regionClearedCount=4, stage4/bossAlive/regions 등은 명시적 합성 입력이다. mapqa의 combatqa 관람 계약을 사용하므로 무전투 QA의 적 제거를 무시한 일반 플레이 반례로 확장하지 않는다. 전체 전투/지역 처치/bootstrap/update는 실행하지 않았다.

| 같은 이벤트의 관측 | 현행 mapqa=true | 메모리 후보 mapqa=true | mapqa=false 정상 control |
|---|---|---|---|
| 외부 urgent | 기존 pair 중단, 새 crow t240/pair cat240 | pet 상태·trace 완전 보존 | 원본/후보 전체 deepEqual |
| pet subtitle 호출 증가 | 1 | 0 | 1 |
| pet SFX 호출 증가 | urgent1 | 0 | urgent1 |
| ID CD | boss_gate_open=1800f(30초) | 새 CD 없음 | 동일1800f |
| T0~T4 CD | 각각 최소300f, T5=0 | 입력 상태 유지 | 원본/후보 동일 |
| gate gameplay 상태 | bossUnlocked=true | 동일 true | 동일 |
| 기존 pet pair | 새 gate cat pair로 교체 | 이전 pair 유지 | 실제 교체 확인 |
| queued 연결 | original urgent가 QA에서 tier5 생성→fire 발화 | 같은 original urgent 슬롯을 patched fire가 tier=-1/weight=0으로 무음 폐기 | 원본/후보 실제 enqueue→fire 동등 |

queued 검사는 **소비 가드만 고립**해 실행했다. candidate urgent 진입 가드를 의도적으로 사용하지 않고 현재 urgent가 만든 실제 슬롯을 patched fire에 넘겼다. 따라서 잔여 슬롯을 가짜 _PB 대입으로 만들지 않았다. 통합 후보에서는 urgent 첫 guard가 입찰 자체를 막는다. QA 슬롯 폐기는 기존 소비 함수의 tier/weight 정리 규칙과 같고 ID/text 등 슬롯 저장 공간의 나머지 필드는 초기화하지 않는다.

urgent bool을 caller wrapper로 별도 기록하지 않았다. QA 후보의 false는 실제 추가 guard와 부수효과 부재에서 판독한다. 일반 _petSayCD/_petBidCD의 QA false는 직접 반환 assert했다. 소비 함수의 일반 undefined 반환을 성공 bool로 취급하지 않았다.

## 최소 미적용 patch

양판의 다음 함수 입구만 메모리에서 변경했다. 상수·ID·대사·화자·우선순위·기존 ID/같은UID 활성 가드는 그대로다.

```diff
 function _petSayUrgent(id,who,txt,dur,cd,pw,pt,pd){
+  if(_MAP_QA_MODE)return false;
   if(_petDlgCD[id]>0)return false;

 function _petFireBid(){
+  if(_MAP_QA_MODE){_PB.tier=-1;_PB.weight=0;return}
   if(_PB.tier<0)return;
```

_petSay 자체의 direct-call 억제, 일반 timer/이미 표시된 자막의 일괄 종료, map QA 다른 SFX 억제는 이번 후보의 범위 밖이다. gate의 addTxt/victory 효과는 후보에서도 유지했다. 이번 PASS는 pet helper 사건만이며 “QA 전체 무음” 완료가 아니다. 일반 게임의 생존 우선 정책을 바꾸는 새 기획 판단은 없다.

## docs 전체 검색 및 root old/new 인계

checks 작성 뒤 docs/ 전체 관련키워드 rg를 정확히1회 수행했다(exit0, 56 매칭 행). --max-columns400/preview 때문에 긴 행 후반은 생략되므로 모든 매칭 본문 완독 주장0. MAP_TEST_SERVER51–53 등 차단 근거 절은 별도 numbered Read로 원문 확인했다. 전체 명령과 검색 영수증은 아래 JSON에 있다. 공유 docs는 쓰지 않았다.

| canonical 정확 위치 | old / 현재 | new / root 순차 반영 문안 |
|---|---|---|
| docs/2_4 펫시스템/대사_스크립트.md §시스템 함수30–35 | urgent는 프레임내 T5 입찰/외부 인터럽트, fire는 T5 종료·발화 설명. QA 예외 없음 | mapqa=1에서는 _petSayUrgent가 false로 즉시 거절하여 bubble/pair/ID·tier CD/pet SFX를 바꾸지 않는다. _petFireBid는 남은 _PB.tier/weight를 -1/0으로 폐기하고 발화하지 않는다. 일반 mode=false 정책은 그대로. 현재 이 두 guard는 **메모리 후보만 검수/생산 미적용**이다. |
| docs/2_4 펫시스템/2_4 펫시스템.md:63,71 | 생존 경로와 보스전 긴급 정상 발동 설명 | 보스전 긴급 정상 발동은 일반 플레이 계약이다. map QA는 예외로 urgent 진입·잔여 소비 억제가 필요하다. 후보는 QA flag만 추가하며 CD·가중치·화자·문구 변경0. |
| docs/4.1맵디자인+설정/MAP_TEST_SERVER.md:51,53 | mapqa/combatqa는 펫 대사 차단을 보장한다고 기재 | 차단 목표는 유지하되 현행 urgent 진입/슬롯 소비 guard 누락을 source로 확인했다. 양판 메모리 후보에서는 외부 gate pet subtitle/SFX/CD 누출 억제 및 일반 control 동등. production/runtimeAccepted=false, 실제 관람·청취 미검수. |
| docs/4.1맵디자인+설정/맵설정_소환굴.md:65–66 | combatqa도 스킬/펫 대사 차단 | 숫자·geometry 변경 없이 위 MAP_TEST_SERVER의 urgent 누락/미적용 후보·검수 범위를 연계한다. 소환굴11/스폰900 및 stage4 한정 계약 변경0. |
| docs/4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md §12c:208 | stage4 관람 옵션의 펫 대사 차단 | 기존 계약을 유지하고 urgent source 누락과 후보 인수 상태를 MAP_TEST_SERVER에 연결한다. 몬스터 수치/동선/geometry 변경0. |

CHANGELOG_SYNC의3928/48700 등 기존 차단 보장 이력에는 root 인수 시 같은 구현 상태를 연결한다. v7 설계의 일반 생존 우선순위와 피날레 tier≤2 억제는 다른 계약으로 보존한다. 보호2_3·Q전용 blackBean·어택티켓 금지·인물LOCK/TBD 변경0.

## 실제품 Gate와 완료 경계

독립 source 후보 검수는 완료했고 구현을 막는 별도 blocker는 없었다. root가 최신 소스 소유권/변경 구역을 확인해 양판 guard·canonical을 순차 통합해야 한다. 실제 URL 진입→gate 이벤트·활성 HUD·이미 표시된 자막 처리·SFX 청취·다른 direct _petSay 호출 누출은 실제품 Gate다. full game/native/실저장/GPU/맵 visual/패키지/배포 검수0. 맵 geometry·오브젝트·카메라 제작/시각 QA 수행0이며 visual PASS를 선언하지 않는다.

실행 UTC 2026-10-02T10:38:49.576Z / KST 2026-10-02T19:38:49.576+09:00, exit0. checks SHA **40166acc9552b6d933abfa438eb065781c88357bd0002e4b5f0aabd676503264**. Git 조회·쓰기0, production/공유docs/기존산출/WIP쓰기0, 새팀·채팅·메시지/삭제/cleanup0. Changes는 미조회 UNKNOWN, 80/100 checkpoint는 감독/root 소유다. 지정 한 건 보고 후 다음 지시를 기다린다.

## Inline evidence JSON

최종 산출 읽기: exec_command로 source/checks SHA와 두 소유 파일 wc를 관측(exit0). 양판 source와 checks SHA는 위 실행 스냅샷과 동일, 검사 재실행0. 실제 명령: `shasum -a 256 game.html game-easy-test.html tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/checks.mjs; wc -l tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/result.md tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/checks.mjs`.

result의 자기 해시는 재귀 문제로 포함하지 않는다. SHA는 실제 읽기 스냅샷이며 원문 TASK/프롬프트·인증·thinking은 복사하지 않는다.

```json
{
  "taskId": "QUESTNPC-urgent-map-qa-suppression-hb1014",
  "provider": "Codex",
  "sourceSupervisorChatId": "01a0fb1e-4ec3-7dd3-bba2-f87518e881fa",
  "chatId": null,
  "sessionId": null,
  "actualCwd": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
  "providedCheckpoint": "6b865637 (TASK history only; current HEAD not independently observed)",
  "times": {
    "firstReadObservedUTC": "2026-10-02 10:37:10 UTC",
    "firstReadObservedKST": "2026-10-02T19:37:10.000+09:00",
    "executionUTC": "2026-10-02T10:38:49.576Z",
    "executionKST": "2026-10-02T19:38:49.576+09:00",
    "finalHashObservedUTC": "2026-10-02 10:39:08 UTC",
    "finalHashObservedKST": "2026-10-02T19:39:08.000+09:00"
  },
  "execution": {
    "runs": 1,
    "exitCode": 0,
    "errors": [],
    "previousCompletedRuns": 0,
    "firstItemB9T4T5RegressionRuns": 0,
    "rootSkUnclickWork": 0,
    "completedObservations": 8
  },
  "sourceFixture": {
    "taskId": "QUESTNPC-urgent-map-qa-suppression-hb1014",
    "executionUTC": "2026-10-02T10:38:49.576Z",
    "productionApplied": false,
    "runtimeAccepted": false,
    "previousCompletedRuns": 0,
    "sources": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
        "candidateFunctions": {
          "urgentSha256": "d1d7bba1594b1fe7d9c803afae0e0e8b4b98c51aae791c402c40842886ae8053",
          "fireSha256": "d2bab4daa2711f7df0c7144336c7fd676e230498597d0f15c338f1e8ef83f21d"
        }
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
        "candidateFunctions": {
          "urgentSha256": "d1d7bba1594b1fe7d9c803afae0e0e8b4b98c51aae791c402c40842886ae8053",
          "fireSha256": "d2bab4daa2711f7df0c7144336c7fd676e230498597d0f15c338f1e8ef83f21d"
        }
      }
    ],
    "fragments": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "bubble and CD",
        "fromLine": 8980,
        "toLine": 8981,
        "sha256": "c413ac4249e92678bddad64e9a0fc81b421250d67b3d0f3ea0ba8cbffac9ed21"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "priority state",
        "fromLine": 9085,
        "toLine": 9089,
        "sha256": "2dfcd3df763296ca3ff2ce52c6ef5f9a2b3c52f0087899e9315863e939f69960"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "URL QA mode",
        "fromLine": 3457,
        "toLine": 3457,
        "sha256": "d84267d86c85d272626be9b5c27ab943ede6c40bd251cb4a5a648713d1fa00ee"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "name": "real gate-open caller block",
        "fromLine": 40503,
        "toLine": 40527,
        "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
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
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "bubble and CD",
        "fromLine": 8435,
        "toLine": 8436,
        "sha256": "c413ac4249e92678bddad64e9a0fc81b421250d67b3d0f3ea0ba8cbffac9ed21"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "priority state",
        "fromLine": 8536,
        "toLine": 8540,
        "sha256": "2dfcd3df763296ca3ff2ce52c6ef5f9a2b3c52f0087899e9315863e939f69960"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "URL QA mode",
        "fromLine": 3232,
        "toLine": 3232,
        "sha256": "d84267d86c85d272626be9b5c27ab943ede6c40bd251cb4a5a648713d1fa00ee"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "name": "real gate-open caller block",
        "fromLine": 39305,
        "toLine": 39329,
        "sha256": "854dc5c0946260c08a5d20a7e1f08f3659a540610df2a7b44994945991855772"
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
      }
    ],
    "cases": [
      {
        "source": "game.html",
        "case": "mapqa-external-urgent-caller",
        "status": "PASS",
        "initial": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "sourceTxt": "synthetic old pair",
              "txt": "synthetic old pair",
              "mt": 240
            },
            "pairFired": false,
            "sourceTxt": "synthetic existing speech"
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 0,
            "victory": 0
          },
          "unlocked": false
        },
        "current": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        },
        "candidate": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "sourceTxt": "synthetic old pair",
              "txt": "synthetic old pair",
              "mt": 240
            },
            "pairFired": false,
            "sourceTxt": "synthetic existing speech"
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      },
      {
        "source": "game.html",
        "case": "same-QA-urgent-slot-consumer",
        "status": "PASS",
        "queued": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "sourceTxt": "synthetic old pair",
              "txt": "synthetic old pair",
              "mt": 240
            },
            "pairFired": false,
            "sourceTxt": "synthetic existing speech"
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
          "pb": {
            "tier": 5,
            "weight": 50,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        },
        "current": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        },
        "candidate": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "sourceTxt": "synthetic old pair",
              "txt": "synthetic old pair",
              "mt": 240
            },
            "pairFired": false,
            "sourceTxt": "synthetic existing speech"
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      },
      {
        "source": "game.html",
        "case": "normal-external-control",
        "status": "PASS",
        "state": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      },
      {
        "source": "game.html",
        "case": "normal-slot-control",
        "status": "PASS",
        "state": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "mapqa-external-urgent-caller",
        "status": "PASS",
        "initial": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "txt": "synthetic old pair",
              "mt": 240
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 0,
            "victory": 0
          },
          "unlocked": false
        },
        "current": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        },
        "candidate": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "txt": "synthetic old pair",
              "mt": 240
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "same-QA-urgent-slot-consumer",
        "status": "PASS",
        "queued": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "txt": "synthetic old pair",
              "mt": 240
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
          "pb": {
            "tier": 5,
            "weight": 50,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        },
        "current": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        },
        "candidate": {
          "bubble": {
            "who": "crow",
            "txt": "synthetic existing speech",
            "t": 300,
            "mt": 300,
            "pair": {
              "who": "cat",
              "txt": "synthetic old pair",
              "mt": 240
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "normal-external-control",
        "status": "PASS",
        "state": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "",
            "who": "",
            "txt": "",
            "dur": 0,
            "cd": 0,
            "pw": null,
            "pt": null,
            "pd": 0
          },
          "inFrame": false,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      },
      {
        "source": "game-easy-test.html",
        "case": "normal-slot-control",
        "status": "PASS",
        "state": {
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
          "pb": {
            "tier": -1,
            "weight": 0,
            "id": "boss_gate_open",
            "who": "crow",
            "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어.",
            "dur": 4,
            "cd": 30,
            "pw": "cat",
            "pt": "문 열렸어! 이제 보스 잡으러 가자!",
            "pd": 4
          },
          "inFrame": true,
          "trace": {
            "shows": [
              {
                "who": "crow",
                "txt": "synthetic existing speech"
              },
              {
                "who": "crow",
                "txt": "…지옥문이 열렸다. 안에서 그것이 기다리고 있어."
              }
            ],
            "sfx": [
              {
                "who": "crow",
                "urgent": false
              },
              {
                "who": "crow",
                "urgent": true
              }
            ],
            "gate": 1,
            "victory": 1
          },
          "unlocked": true
        }
      }
    ],
    "stubs": [
      "HUD/SFX sinks (actual helper calls, no audio hardware)",
      "gate caller regionClearedCount=4, G/P are explicit synthetic inputs",
      "URLSearchParams real mode declaration; no browser/bootstrap/full update",
      "existing pair is synthetic text via real _petSay; no fake CD/counter mutation"
    ],
    "patch": {
      "urgent": "if(_MAP_QA_MODE)return false;",
      "fire": "if(_MAP_QA_MODE){_PB.tier=-1;_PB.weight=0;return}"
    }
  },
  "hashes": [
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/AGENTS.md",
      "sha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "sha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
      "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/2_4 펫시스템/대사_스크립트.md",
      "sha256": "d267a4d846a73a0c9a6b95f3112b07c5e0dd1a79e915f14bbd018d09ef19a889"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/2_4 펫시스템/대사_개편_v7_설계.md",
      "sha256": "8f8b41160acf2545c5223fecebccf028d46802122837c239bdebab49d1bea5ff"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/2_4 펫시스템/2_4 펫시스템.md",
      "sha256": "cb3cfad3579649f7e5cf4974bfe9f898c5806ea4d15202dbff5f8c72c96fd1ff"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/MAP_TEST_SERVER.md",
      "sha256": "d6e9ebc32cf20b1435b685e4149bb4699fc5f26adf05a065edf1c49cf4986cee"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/맵설정_소환굴.md",
      "sha256": "d5b08844abd0912fc8bbd877ee50f4ee6cd7d3d16a7b5c4cf546f9d3d14273ca"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md",
      "sha256": "03cf112c16d8cff427a48c3fa047216b5a10a315805f47072862f0963dcbecf6"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/TASK.md",
      "sha256": "c0d4eef4d79f402d373f801ce0c1e4746cd52bb3b21cad07757ca737a7d1cee6"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/checks.mjs",
      "sha256": "40166acc9552b6d933abfa438eb065781c88357bd0002e4b5f0aabd676503264"
    }
  ],
  "commands": [
    {
      "tool": "exec_command",
      "command": "cat /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/TASK.md",
      "exitCode": 0,
      "purpose": "exact TASK first read"
    },
    {
      "tool": "exec_command",
      "command": "cat tools/team-followup-20261002/continuous/COMMON.md docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "contract",
      "exitCode": 0,
      "outputTokens": 6937
    },
    {
      "tool": "exec_command",
      "command": "cat AGENTS.md",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "rules",
      "exitCode": 0,
      "outputTokens": 6519
    },
    {
      "tool": "exec_command",
      "command": "nl -ba 'docs/2_4 펫시스템/대사_스크립트.md' | sed -n '1,40p'; nl -ba 'docs/2_4 펫시스템/대사_개편_v7_설계.md' | sed -n '33,81p'",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "pet SSOT",
      "exitCode": 0,
      "outputTokens": 1732
    },
    {
      "tool": "exec_command",
      "command": "rg -n --max-columns 260 --max-columns-preview '_MAP_QA_MODE|_petSayUrgent\\(|function _pet(FireBid|SayCD|BidCD|SayUrgent|Say)' game.html game-easy-test.html",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "suppression callers",
      "exitCode": 0,
      "outputTokens": 2030
    },
    {
      "tool": "exec_command",
      "command": "nl -ba game.html | sed -n '8980,8987p;9085,9156p;9066,9078p;40492,40530p;12430,12442p'",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "actual main helpers/caller",
      "exitCode": 0,
      "outputTokens": 2392
    },
    {
      "tool": "exec_command",
      "command": "nl -ba game-easy-test.html | sed -n '8435,8442p;8521,8533p;8536,8607p;39298,39332p;11827,11839p'",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "actual easy helpers/caller",
      "exitCode": 0,
      "outputTokens": 2336
    },
    {
      "tool": "exec_command",
      "command": "nl -ba game.html | sed -n '3452,3465p;30439,30449p'; nl -ba game-easy-test.html | sed -n '3228,3236p;29259,29269p'",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "mode declared/input contract",
      "exitCode": 0,
      "outputTokens": 1062
    },
    {
      "tool": "exec_command",
      "command": "rg -n --max-columns 400 --max-columns-preview '_MAP_QA_MODE|mapqa=1|펫.*(억제|차단)|대사.*(억제|차단)|_petSayUrgent|_petFireBid' docs/",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "fixture 작성 뒤 docs 전체 관련 검색 정확히1회",
      "exitCode": 0,
      "outputTokens": 4541
    },
    {
      "tool": "exec_command",
      "command": "nl -ba 'docs/4.1맵디자인+설정/MAP_TEST_SERVER.md' | sed -n '45,57p'; nl -ba 'docs/4.1맵디자인+설정/맵설정_소환굴.md' | sed -n '58,70p'; nl -ba 'docs/4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md' | sed -n '204,210p'; nl -ba 'docs/2_4 펫시스템/2_4 펫시스템.md' | sed -n '60,73p'",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "검색에서 확인된 차단 계약 실제 절",
      "exitCode": 0,
      "outputTokens": 1046
    },
    {
      "tool": "exec_command",
      "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/checks.mjs",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "새 suppression 재현/후보/control 최초 실행",
      "exitCode": 0,
      "outputTokens": 7496
    },
    {
      "tool": "exec_command",
      "command": "shasum -a 256 game.html game-easy-test.html AGENTS.md docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md tools/team-followup-20261002/continuous/COMMON.md 'docs/2_4 펫시스템/대사_스크립트.md' 'docs/2_4 펫시스템/대사_개편_v7_설계.md' 'docs/2_4 펫시스템/2_4 펫시스템.md' 'docs/4.1맵디자인+설정/MAP_TEST_SERVER.md' 'docs/4.1맵디자인+설정/맵설정_소환굴.md' 'docs/4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md' tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/TASK.md tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/checks.mjs",
      "workdir": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "purpose": "실제 읽은 파일·새 fixture SHA 최종 관측",
      "exitCode": 0,
      "outputTokens": 376
    }
  ],
  "docsSearch": {
    "runs": 1,
    "rawMatches": "docs/11내러티브·로어디자인/펫_대사_스크립트.md:3:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다. [... omitted end of long line]\ndocs/11내러티브·로어디자인/펫_대사_스크립트.md:93:- **우선순위**: 비긴급 즉시 대사는 활성 bubble·ID CD·티어 CD 등에 거절될 수 있다. 기존 T5 `_petSayUrgent` 입찰과 mid-fire는 먼저 실행하며 ID CD/같은 UID 활성 가드를 유지하고 필요 시 기존 bubble·pair를 중단한다. firstItem false는 이 긴급 정책을 바꾸지 않고 후속 검사로 진행한다. 전체 T5·DOM 보장은 별도 검수다.\r [... omitted end of long line]\ndocs/16번역·로컬라이제이션/번역대상_전체목록.md:21:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다. [... omitted end of long line]\ndocs/CHANGELOG_SYNC.md:2062:| 대사 | 피날레 전투 중 tier≤2 잡담 억제, 긴급 생존/핵심 전투 안내 유지 |\r\ndocs/CHANGELOG_SYNC.md:2067:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다.\r [... omitted end of long line]\ndocs/CHANGELOG_SYNC.md:3848:- 실제 `game.html?testchar=1&stage=10&classic=1` CH3-1 런타임을 Playwright로 촬영했다. 시네마틱 컷은 펫 대사·미니맵·스킬바·구슬 HUD와 캔버스 펫을 촬영 세션에서만 억제하며, 게임 코드/밸런스/맵/collision은 변경하지 않았다.\r\ndocs/CHANGELOG_SYNC.md:3925:| CH2-1 테스트 관람 | `mapqa=1`이 적·문지기·소환굴을 전부 제거 | `stage=4&mapqa=1&combatqa=1`에서 기존 전투 구성을 유지 | `game.html` |\r\ndocs/CHANGELOG_SYNC.md:3928:| 안전 계약 | 무적·스킬 차단·시작 배리어 제거 | 동일; 몬스터 미리보기에서도 플레이어 무적과 스킬/펫 대사 차단 유지 | `game.html` |\r\ndocs/CHANGELOG_SYNC.md:3931:- `_MAP_QA_COMBAT`은 `_MAP_QA_MODE && stage===4 && combatqa=1`일 때만 참이다. 다른 34개 스테이지의 기존 무전투 관람 계약과 CH2-1 geometry·collision·START/EXIT·authored `108/108`·`MAP_OBJS=110`은 변경하지 않았다.\r\ndocs/CHANGELOG_SYNC.md:4052:- 당시 적용(2026-08-30 이력; 2026-09-24 폐기): `mapqa=1`에서만 `_ssaa=clamp(devicePixelRatio,1,2)`를 적용했다. 현행은 사용자 지시로 일반 게임과 QA 모두 backing1x이며 MAP_TEST_SERVER.md를 따른다.\r\ndocs/CHANGELOG_SYNC.md:48695:| 직접 경로 | `/map/{si}` → `test=1&testchar=1&stage={si}&classic=1&mapqa=1` | `tools/local-static-server.mjs` |\r\ndocs/CHANGELOG_SYNC.md:48700:- 1-1은 `classic=1` 강제로 QA 통그림이 아닌 200×200 본편 `_MAP_COMPOSE[0]` 구성을 연다. `mapqa=1`은 적·문지기·소환굴·필드보스·시작 화톳불 배리어를 제거하고 무적 999999프레임을 적용하며 스킬 슬롯 발동과 펫 대사를 차단해 환경 관람을 보장한다.\r\ndocs/CHANGELOG_SYNC.md:52226:| 실제 helper·티어 | [S03e] main8978/easy8433, actual _petSayUrgent9110/8561. _petUrgent 이름·alias0. T0~T5 글로벌1200/720/480/360/240/0f 보존 | ID CD·외부 같은UID활성가드 유지. 일반동일티어는 코드순, 생존weight별도. v6단일15초/일반plannedweight65·45를 현재코드로 이식0 |\ndocs/5.1임펙트디자인/사망VFX_변경로그.md:28:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다. [... omitted end of long line]\ndocs/4.1맵디자인+설정/맵설정_소환굴.md:65:- 일반 production 플레이는 기존과 동일하다. 맵 QA에서는 기본적으로 소환굴을 제거하지만 `stage=4&mapqa=1&combatqa=1`일 때만 11개를 보존한다.\ndocs/4.1맵디자인+설정/맵설정_소환굴.md:66:- `combatqa=1`은 테스트 관람 옵션일 뿐 스폰 수·간격·몬스터 풀·AI를 변경하지 않는다. 테스트 플레이어는 무적이고 스킬과 펫 대사는 차단된다.\ndocs/4.1맵디자인+설정/DIABLO_FIELD_REBUILD_PLAN_20260923.md:123:- `game.html`에는 **`mapqa=1&fieldrebuild=1&stage=0` 전용** 런타임 실험 경로를 연결했다. 나머지 실행 URL과 CH1-1 production map은 변경하지 않는다. `_buildDiabloField(0,200,200)`이 deterministic 200×200 tileRLE 및 south→north six-region layout을 만들고 기존 `genFromTemplate`으로 넘긴다. 시작 중심은 tile `(100,181)`, 북쪽 boss room은 `(100,24)` 부근이고 보스 접근은 engine gate generator가 잇는다. 일반 enemy wave는 map QA 설정이 비운다. [... omitted end of long line]\ndocs/4.1맵디자인+설정/DIABLO_FIELD_REBUILD_PLAN_20260923.md:126:- 실행: `http://127.0.0.1:3334/map/field` → `/game.html?test=1&testchar=1&stage=0&classic=1&mapqa=1&fieldrebuild=1`. 기존 `/map/0`은 본편 CH1-1 QA를 그대로 연다. 허브에는 “지옥 필드 실험맵” 링크가 추가됐다.\ndocs/16번역·로컬라이제이션/번역_가이드.md:5:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다. [... omitted end of long line]\ndocs/4.1맵디자인+설정/맵제작_SSOT.md:3:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다. [... omitted end of long line]\ndocs/4.1맵디자인+설정/맵제작_SSOT.md:402:**35맵 본편 QA 허브:** `npm run serve:map` → `http://127.0.0.1:3334/`. 모든 맵에 `classic=1&mapqa=1`을 강제하며 `si 0~34`를 무전투 상태로 선택·새로고침·새 창·에디터로 열 수 있다. 세부 계약은 `MAP_TEST_SERVER.md`.\ndocs/4.1맵디자인+설정/ROOTWORLD_OUTER_MASS_20260924.md:24:| 활성화 | `_DIABLO_FIELD_QA` / `mapqa=1&fieldrebuild=1&stage=0` | 기존 CH1 외곽 스트리머 |\ndocs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md:15:| 초기화 | `_regionInit(si)` — `initStage` 내 소환굴 확정(플레이어 근접 소환굴 splice + `_MAP_QA_MODE` 클리어) **이후** 호출. 재도전(retry)도 initStage 경유라 자동 리셋. 세이브는 스테이지 중간상태를 저장하지 않으므로(로드=스테이지 재시작) 별도 직렬화 없음 |\ndocs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md:105:| `_regionInit(si)` 호출 | initStage, `if(_MAP_QA_MODE)G._bonfire=null;` 직후 |\ndocs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:41:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다.\r [... omitted end of long line]\ndocs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:332:- **DPR 논리 시야 고정 (현행, 2026-09-24)**: `_dpr=1`, `_ssaa=1`을 일반 게임과 `mapqa=1`에 공통 적용한다. 창 크기 또는 `_renderRes`에 `OPT.resScale/100`을 곱해 짝수 픽셀로 정렬한 `VW/VH`가 메인 캔버스 백킹과 같다. DPR2/창1920×1080/100%는 logical=backing=1920×1080이며 CSS는 창 크기를 유지한다.\r\ndocs/cinematic/WARINTRO_CREATION_RUNTIME_20260910.md:17:| 건너뛰기 |클릭·확인 입력으로 다음 대사,Space·Esc·게임패드B/Start·하단 버튼1200ms 홀드로 전체 종료. 재생 중 로비 입력 차단 |\ndocs/4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md:208:- si4 production은 기존 소환굴 11개(S 4/M 5/L 2), 총 스폰 예산 900과 etype 39 출구 문지기/동반 웨이브를 유지한다. `combatqa=1`은 map QA에서 이를 지우지 않는 stage4 전용 관람 옵션이며, 플레이어 무적·스킬/펫 대사 차단·시작 배리어 제거는 유지한다. 세계 geometry·collision·START/EXIT·동선·몬스터 밸런스에는 변화가 없다. [... omitted end of long line]\ndocs/12퍼포먼스·최적화/12퍼포먼스·최적화.md:25:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다. [... omitted end of long line]\ndocs/4.1맵디자인+설정/맵구성_1장.md:122:1-1 본편은 `handProps` 123 + 필수 `boss_gate_col` 1 구성이다. 테스트는 `?stage=0` (`?classic=1`, `?mapqa=1`로 전투 제거)을 사용한다.\ndocs/4.1맵디자인+설정/맵구성_1장.md:124:전용 QA는 `npm run serve:map` 후 `http://127.0.0.1:3334/`에서 실행한다. 허브가 `classic=1&mapqa=1`을 강제하므로 1-1 선택 시 통그림 테스트판이 아니라 위 본편 구성이 무전투 관람 상태로 열린다.\ndocs/4.1맵디자인+설정/MAP_TEST_SERVER.md:42:| `/map/field` | CH1-1 hell-field rebuild 실험 경로(`/mapqa=1&fieldrebuild=1`)로 302; production layout은 보존 |\ndocs/4.1맵디자인+설정/MAP_TEST_SERVER.md:47:/game.html?test=1&testchar=1&stage={si}&classic=1&mapqa=1\ndocs/4.1맵디자인+설정/MAP_TEST_SERVER.md:48:/game.html?test=1&testchar=1&stage=4&classic=1&mapqa=1&combatqa=1\ndocs/4.1맵디자인+설정/MAP_TEST_SERVER.md:51:`classic=1`은 필수다. 특히 `si 0`에서 이를 빼면 1-1 본편 200×200 `_MAP_COMPOSE[0]` 대신 QA 통그림 경로가 열린다. 기본 `mapqa=1`은 맵 관람 전용으로 초기 적·문지기·소환굴·1-1 필드보스를 제거하고 플레이어 무적 프레임을 999999로 두며 스킬 슬롯 발동과 펫 대사를 차단한다. 시작 화톳불 배리어는 모든 map QA에서 제거한다. 이동과 카메라 시뮬레이션은 계속 실행한다. [... omitted end of long line]\ndocs/4.1맵디자인+설정/MAP_TEST_SERVER.md:53:CH2-1(si4)만 `combatqa=1`을 함께 주면 `_MAP_QA_COMBAT`이 활성화되어 production의 소환굴 11개와 출구 수비대를 유지한다. 플레이어 무적·스킬/펫 대사 차단·시작 배리어 제거는 그대로라서 맵 구조를 안전하게 보면서 몬스터 배치도 확인할 수 있다. 다른 stage에서는 `combatqa=1`을 주어도 무시한다.\ndocs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md:138:- [경관 입력 종주](../../captures/ch1_depth_20260917/input-walk.webm): Lv500, mapqa=1, 적 OFF, QA 무적. START→북측 출구 앞. 일반 클리어가 아니다.\r\ndocs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:641:런타임 QA (배치수는42차갱신; 아래종주증거는2026-08-30기존이력이며42차종주재검증아님): `game.html?stage=4&mapqa=1`에서 authored **105/105, skipped 0**, 전체 `MAP_OBJS` **107**, collision/non-collision **51/54**, backfill/filler/seam collision **0/0/0**, off-path **0**, accidental floor patch **0**, automatic wall eye **0**, map **200×200**, START world `(4020,7420)`/tile `(100,185)`/wall=false다. `central_right_recess`는 authored `(11 [... omitted end of long line]\ndocs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:645:CH2-1 production은 경로 기반 소환굴 **11개(S 4/M 5/L 2, 총 스폰 예산 900)**와 etype 39 출구 문지기/동반 웨이브를 이미 포함한다. `mapqa=1`의 기본 무전투 제거는 유지하되 si4의 `combatqa=1`에서만 이 구성을 보존한다. 허브의 `몬스터 ON/OFF`는 오브젝트 registry, authored 105개, `MAP_OBJS=107`, collision 51/비충돌 54, START/EXIT를 변경하지 않는다.\r [... omitted end of long line]\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md:205:| 실제 helper·티어 | [S03e] main8978/easy8433, actual _petSayUrgent9110/8561. _petUrgent 이름·alias0. T0~T5 글로벌1200/720/480/360/240/0f 보존 | ID CD·외부 같은UID활성가드 유지. 일반동일티어는 코드순, 생존weight별도. v6단일15초/일반plannedweight65·45를 현재코드로 이식0 |\ndocs/2_4 펫시스템/2_4 펫시스템.md:15:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다.\r [... omitted end of long line]\ndocs/2_4 펫시스템/2_4 펫시스템.md:63:- **시스템**: `_petSayCD`는 즉시 수락/거절과 티어별 글로벌쿨을 사용한다. 일반 경쟁은 `_petBidCD`→`_petFireBid`, 생존은 실제 `_petSayUrgent` 경로다. ID 쿨과 같은 UID 활성 가드는 유지한다. 단일 글로벌쿨 15초는 v6 이력이며 현행 T1=720f/T4=240f와 구분한다.\r\ndocs/2_4 펫시스템/2_4 펫시스템.md:64:- **보스전 차단 규칙**: `G.bossAlive` 중 평대사 4개 섹션 억제\r\ndocs/2_4 펫시스템/2_4 펫시스템.md:67:  | [7] Idle 잡담·팁 | `G.bossAlive` 시 타이머 리셋, 대사 차단 |\r\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:13:| 실제 긴급 helper `_petSayUrgent` | 9110 / 8561. 양판 `_petUrgent` 이름·alias 원문 0개 |\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:29:| 긴급 경로 | `_petSayUrgent`는 ID CD를 먼저 검사하고, 프레임 안에서는 생존 weight 입찰·밖에서는 같은 UID의 활성 대사를 가드한 뒤 인터럽트 | “긴급은 모든 쿨 무시”라는 절대 설명은 부정확. 기존 T5 경로의 내부 `_petSay` 반환 무시 정책도 변경 0 |\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:30:| 수락·거절 | 새 검사 wrapper가 실제 `_petSayCD` false/true를 직접 기록. `_petSay` true도 실제 반환 관측 | `_petBidCD`와 `_petFireBid`의 정상 undefined 반환을 false로 취급하지 않음 |\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:3:> **2026-09-09 피날레 v0.3:** 데모/bic 마지막 si3 보스의 전용 카메라(.30~.80)·마우스 조준 보정·최종 부활 판정 후210f 승리 배너/음악·잔류 독탄/독늪 제거·비긴급 펫 잡담 억제는 [현행 계약과 검수 기록](../8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md)을 따른다. 일반 보스/일반 bosstest 및 기존 부활/HP/피해/패링 수치는 유지한다. [... omitted end of long line]\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:17:- 먼저 조건 통과한 대사가 말풍선을 점유하고 `_petGlobalCD=900`(15초)로 **나머지 전부 차단**.\ndocs/2_4 펫시스템/대사_개편_v7_설계.md:51:  if(_PB.tier>=0) _petFireBid()       // 티어별 글로벌쿨 검사 후 발동\ndocs/2_4 펫시스템/대사_스크립트.md:5:> **피날레 재도전 대사(2026-09-09):** 데모 마지막si3 아레나의 bossAlive 동안 `_petSay`는 bossRef가 아직 null인 첫 프레임도 tier≤2 잡담을 억제한다. 생존 `_PET_SURV_W`는 유지. 재도전 시 이전 `_petBubble.t/pair/_uid`를0/null/null로 초기화한다.\ndocs/2_4 펫시스템/대사_스크립트.md:30:| `_petSayUrgent(id,...)` | 생존(T5) | 프레임 내: T5 입찰(내부 weight `_PET_SURV_W`). 프레임 외(이벤트): 즉시 인터럽트 |\r\ndocs/2_4 펫시스템/대사_스크립트.md:31:| `_petFireBid()` | 승자 발동 | 프레임 끝(및 생존 mid-fire)에 `_PB` 승자 1건 발동. T5는 현재 말풍선 강제종료 |\r\ndocs/2_4 펫시스템/대사_스크립트.md:35:- **호출 흐름**: `_checkPetDialogue` 시작 시 `_PB.tier=-1;_petInFrame=true` → 생존블록 입찰 → mid `_petFireBid()`(생존 인터럽트) → 경쟁블록 `_petBidCD` 입찰 → 끝에서 `_petFireBid()`(승자 발동).\r\ndocs/2_4 펫시스템/대사_스크립트.md:77:| v3 | 81종 | _petSayUrgent + HP 50% + 기절 명확화 |\r\ndocs/8.0몬스터디자인/스테이지_몹분배.md:70:| 맵 QA 확인 | `stage=4&mapqa=1&combatqa=1` | 무적 관람, production 수치 불변 |\n",
    "matchingLines": 56,
    "linePreviewOmission": true,
    "toolOutputTruncation": false
  },
  "tools": {
    "mutations": [
      {
        "tool": "apply_patch",
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/checks.mjs",
        "operation": "add only new validator"
      },
      {
        "tool": "apply_patch",
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/result.md",
        "operation": "add report with inline evidence"
      }
    ],
    "clock": "clock__curr_time",
    "orchestration": "functions.exec",
    "skills": [],
    "externalAPIMCP": []
  },
  "scope": {
    "productionApplied": false,
    "runtimeAccepted": false,
    "ownership": [
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/checks.mjs",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/QUESTNPC/QUESTNPC-urgent-map-qa-suppression-hb1014/result.md"
    ],
    "gitQueriesWrites": 0,
    "sharedDocsWrites": 0,
    "previousOutputWrites": 0,
    "newFiles": 2,
    "newAgentsChatsMessages": 0,
    "gameServerBuildImageSaveAudioHardwareRuns": 0,
    "deletionMoveCleanup": 0,
    "changes": null,
    "changesReason": "Git queries prohibited; supervisor controls80/100"
  }
}
```

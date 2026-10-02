# 데모 종료 CTA·로비 복귀 경로 — 소스 재현 및 checker 후보

taskId: MARKETING-demo-release-route-closure-hb1014
provider: Codex / OpenAI; chatId: 01a0fae0-cff3-78f0-aa73-32b08c6d6055; sessionId: UNKNOWN.
productionApplied=false / runtimeAccepted=false.

**실제 소스에서 결함 두 종류를 재현했다.** 양쪽 `openWishlist()`는 게임 상점 대신 Steam 홈을 연다. easy판 `goToLobby()`의 데모 대상 `indexdemo.html`은 디스크에 존재하지만 현재 NW.js FILES/DIRS에 포함되지 않는다. main판 데모 복귀와 로비→게임의 demo/slot 경로는 이번 source control 범위에서 정상이다. 메모리 후보·정상 control·고의 파손 검출을 완료했으며 생산 적용은 하지 않았다.

## 실제 경로와 최소 후보

| 위치 | 원본 실행 관측 | 최소 메모리 후보 | 판정 |
|---|---|---|---|
| game.html:61632 / game-easy-test.html:59970 openWishlist | `window.open('https://store.steampowered.com/','_blank')` | URL만 `https://store.steampowered.com/app/4749590/`로 교체 | 양판 RED→후보 GREEN. URL은 로컬 docs AppID 계약에서 가져옴. 실제 상점 접근·공개 상태 확인0. |
| game.html:61637 goToLobby | 데모 `/?lobby=1&demo=1`, 일반 `/?lobby=1` | 변경 없음 | 현재 main 정상 control. node-main의 /→index.html rewrite와 FILES 포함을 source에서 확인. HTTP 실행0. |
| game-easy-test.html:59975 goToLobby | 데모 `indexdemo.html` | 데모 문자열만 `/?lobby=1&demo=1`로 변경 | 원본 target 존재=true / packaging included=false. 후보 target index.html 존재·포함·demo query 정상. |
| index.html:4176 showCharGate | `game.html?test=1&slot=demo&demo=1`; storySeen이면 story=warrior-v21 추가 | 변경 없음 | 실제 함수 전체 실행, 두 storySeen control 정상. slot/test/demo 유지. |
| game.html:42447 / easy:41246 nextStage 및 nextBtn.onclick | 각 소스의 실제 _DEMO_LAST_STAGE(main0/easy3)에서 종료 화면 flex·G.on=false·stage 유지 | 변경 없음 | 실제 함수·실제 caller 재현. 두 종료 CTA 버튼의 실제 onclick을 이어 실행. |

easy의 demo-query-missing은 checker가 채택한 **현재 공용 로비 demo=1 계약**과의 불일치다. 구형 indexdemo 자체에 query가 없다는 사실만으로 모든 legacy 데모가 고장이라고 단정하지 않는다. 확정 결함은 현재 NW.js 포함 정책에서 그 target이 빠진 것이다. 구형 배포와 역사 문서를 삭제하거나 재정의하지 않는다.

최소 생산 patch **인계용·미적용**:

```diff
--- game.html / game-easy-test.html: openWishlist
-  // TODO: 스팀 앱 등록 후 'https://store.steampowered.com/app/[APPID]/EXODUSER/' 로 교체
-  window.open('https://store.steampowered.com/','_blank');
+  window.open('https://store.steampowered.com/app/4749590/','_blank');

--- game-easy-test.html: goToLobby
-  window.location.href=_DEMO_MODE?'indexdemo.html':'/?lobby=1';
+  window.location.href=_DEMO_MODE?'/?lobby=1&demo=1':'/?lobby=1';
```

메모리 실행 후보는 URL/복귀 문자열만 바꿨다. TODO 제거는 root 통합 시 함께 할 문서성 정리이며 함수 동작 검수에 영향을 주지 않는다. 저장·사망 복구·일반 모드·수치·진행 종료 조건은 변경하지 않는다.

## 실행과 정상·음성 control

재사용 checker: [checks.mjs](/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/checks.mjs). 실제 실행 명령:

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/checks.mjs /Users/fordeargamers/Projects/exoduser-migration-20261001
```

| 실행 영수증 | exit / 관측 | 후속 이유 |
|---|---|---|
| 최초 실행, 정확 실행 UTC 미수집(10:38:28 UTC 이전) | 1, checks L69 nextBtn DOM 대역이 등록 전 없어 TypeError | 하니스 결함. production 실패로 계산하지 않음. 다음 실행 전에 nextBtn 대역을 caller 설치보다 먼저 생성. |
| 대역 수정 실행 2026-10-02 10:38:28.31… UTC | 0. stdout7246 tokens를 max900으로 받아 잘림; functions JSON.parse가 Unexpected token W 오류 | exit0을 숨기지 않음. 완전 영수증 확보를 위한 재실행이며 기존 완료 검사 합산 없음. |
| 영수증 확보 실행 10:38:38.589 UTC | 0, 구조화 전체 stdout 확보 | 검토 중 easy 실제 종료 인덱스3 대신 대역0을 쓴 경계를 발견. |
| 최종 경계 수정 실행 **10:38:57.521 UTC / 19:38:57.521 KST** | **0**, main0/easy3의 실제 source 상수 사용, SOURCE_CANDIDATE_AND_CONTROLS_PASS | 최종 한 실행만 완료 근거로 채택. |

최종 실행은 양판 실제 원본 CTA/종료 흐름, 후보 control24개(각 판 save 미준비/성공/거절 × demo/일반 × 생존/사망), 음성 control2개, 로비 entry control2개를 포함한다. 이는 fixture 사례 수이며 이전 검수를 합산한 제품 PASS 수가 아니다.

후보 control에서는 위시리스트 이외 stop/save/error 호출 내용과 P 복구 상태가 원본과 같고, main 복귀 URL과 양판 일반 복귀 URL도 같다. 저장 promise 거절 후에도 기존처럼 error 기록 후 이동하며 미준비면 저장 호출을 건너뛴다. 음성 control은 후보의 실제 함수 body를 메모리에서 AppID0·없는 local target으로 훼손해 validator가 검출함을 증명했다. 원소스 수정0.

## 대역 및 소스 고정 경계

전체 실제 `openWishlist`, `goToLobby`, `nextStage`, `showCharGate` 함수, 실제 demoEnd 버튼 onclick과 nextBtn caller를 읽어 Node VM에서 실행했다. DOM 노드·타이머·Image·음향·DB 저장·전투 초기화·언어 함수는 명시적 대역이며 window.open/location도 관측 객체다. 실제 사용자 저장·브라우저 이벤트·네트워크·팝업 허용·Steam/NW shell 동작·HTTP 파일 serving·렌더링을 실행하지 않았다. FILES/DIRS는 실제 배열 literal만 VM으로 읽고 빌더 본문은 실행하지 않는다.

최종 source SHA와 caller/fragment SHA는 아래 JSON에 고정했다. checks SHA: `2ebb9dfff9282f0d30c911b4bbd82a7e7fd0fc76cbaf7623735ce54f668f17c0`. 실행 시작/끝 source bytes 비교에서 변경0. root WIP로 전체 SHA가 바뀌면 이번 anchor와 별도로 기록하며 다른 팀 코드를 덮어쓰지 않는다. root expanded _skUnclick 및 카드 minus 검사/소유0.

TASK parent 제공 `6b865637`은 역사 기준이다. COMMON의 제공 commit도 역사 정책 입력이다. 현재 HEAD와 독립 Changes는 UNKNOWN, Git 호출0. 감독 registry의 10:39:24.917 UTC 관찰에는 Changes63(updatedAt10:36:55.932 UTC)가 기록되어 있어 checkpoint 임계80 전이다. 이는 감독 snapshot이며 Git 독립 조회가 아니다. 현재 TASK 연결도 그 registry에서 확인했다.

## docs 검색과 정확 old/new 인계

코드 산출 뒤 docs 전체 관련 키워드 검색을 수행했다. 먼저 markdown 한정 상세 검색 exit0, 이어 확장자 제한을 제거한 **전체 docs 검색**을 한 번 실행(exit0)하여 txt 포함 결과를 확보했다. shared docs 쓰기0.

```sh
rg -l 'demoEndWishlist|demoEndLobby|openWishlist\(|goToLobby\(|indexdemo\.html|lobby=1&demo=1|4749590' docs/
```

| canonical / 정확 절 | old·현재 기록 | new 인계 문안·상태 |
|---|---|---|
| docs/13출시·마케팅/13출시·마케팅.md 「데모 종료 화면 (#demoEnd)」 L95–104 | openWishlist는 AppID 등록 후 교체 예정; nextStage 종료 조건에 옛 _BUILD_TIER 언급 | “현재 양판 openWishlist는 Steam 홈을 열며 App4749590 직접 경로 후보는 미적용. 실제 종료 조건은 _DEMO_MODE && G.stage===_DEMO_LAST_STAGE && SI_TO_HELL[G.stage]===0. 본 source는 main0/easy3이며 실제 출하 범위 확정은 별도.” root 적용 뒤 URL 상태만 구현으로 변경. |
| 같은 문서 「데모 1랩 시작」 로비 복귀 표 L122 | goToLobby→indexdemo.html 단일 기록 | “main 데모: /?lobby=1&demo=1; main/easy 일반: /?lobby=1. easy 데모: indexdemo.html(현재 FILES/DIRS 미포함). easy 공용 로비 복귀 후보는 미적용. _dbReady 때 dbSave await, 사망 HP/ST/MP/shield 복구, 저장 오류 후에도 기존 이동 정책 유지.” 역사 DEMO 폴더 경로는 이력으로 보존. |
| docs/13출시·마케팅/PC_PACKAGING_20260910.md 실행 설정 표·PM-002 누락 처리 아래 「데모 종료 경로 source 검수」 신설 | index main·easy 포함, 반환 target 연결 검수 없음 | “현재 build-nwjs FILES에 index.html/game.html/game-easy-test.html 포함, indexdemo.html 제외. source checker는 target 존재와 포함 정책을 분리한다. easy 반환 target 누락 후보는 현재 실제 빌드 manifest/HTTP 검수 전이다.” |
| docs/13출시·마케팅/STEAM_REVIEW_20260926.md 「데모 연결」 | 본편4749590 / demo5337590 / 본편 데모 버튼 계약 | AppID 수치·과거 심사/출시 상태 변경 없음. “위시리스트 CTA 후보는 본편4749590 URL; source 문자열 관측은 현재 live store·데모 출시 승인 근거가 아니다.” 보충만 인계. |
| docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md, DEMO/HELL_DEMO_BUILD_NOTES.md; CHANGELOG*, STEAM_* 과거 기록, cinematic 감사 | legacy indexdemo/gamedemo와 과거 제출·매체 기록 | 수치·이력 수정 없음. 현재 NW.js 복귀 계약을 위 canonical로 링크하는 보충만 가능. 구형 배포 삭제/소실 주장0. |

새 검사 문안: “checks.mjs는 실제 함수/CTA caller+명시적 대역으로 원본 결함→메모리 후보→정상/음성 control을 검수한 소스 경로 checker다. productionApplied=false/runtimeAccepted=false. 출하 BuildID·manifest 및 실제 Steam/NW 브라우저 종료/복귀/재입장/저장 검수는 별도 Gate다.”

## JSON 실행 evidence

```json
{
  "metadata": {
    "at": "2026-10-02T10:39:24.917Z",
    "cwd": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
    "files": [
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/TASK.md",
        "sha256": "e5ae7d3e7f561f78b8640dbeca6f220c7152be28c857dd9a4f29a7c72121a150"
      },
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
        "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e"
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
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/13출시·마케팅.md",
        "sha256": "856eac0abbf6bfbdca46da11de682f24f3b31be81f8b58c69cc7212ca8063832"
      },
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/PC_PACKAGING_20260910.md",
        "sha256": "434d760b2d7d97f0a817574596ad508d3164a6af1e926eb98b97294d86841a3a"
      },
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_REVIEW_20260926.md",
        "sha256": "e1ce6d97671250bdd646c7dba8d26ffd69b962b2bdb6aba0820fcc289e2661f2"
      }
    ],
    "registry": {
      "path": "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json",
      "updatedAt": "2026-10-02T10:36:55.932172+00:00",
      "changesCountCurrent": 63,
      "marketing": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/TASK.md"
    }
  },
  "execution": {
    "taskId": "MARKETING-demo-release-route-closure-hb1014",
    "executedAt": "2026-10-02T10:38:57.521Z",
    "node": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node",
    "root": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
    "sourceInputs": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html",
        "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json",
        "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/build-nwjs.mjs",
        "sha256": "567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node-main.js",
        "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/indexdemo.html",
        "sha256": "83d33f8df8a2d7b802e88d4d47ec2e3a3f3870f25db541103e598bf44bd568c6"
      }
    ],
    "anchors": [
      {
        "file": "game.html",
        "id": "demoEndWishlist",
        "line": 3204,
        "sha256": "470a5eae314b881f739f502353af3407a1453913968505b09fe45c5bb5a5ef28"
      },
      {
        "file": "game.html",
        "id": "demoEndLobby",
        "line": 3205,
        "sha256": "fce5da713b2f376c5c89b31a6ca11137c821e929f22a235304df51a363ae9172"
      },
      {
        "file": "game.html",
        "name": "nextBtn.onclick",
        "sha256": "fe48c6801f523c60a973a823111f752f2f8e528793237f402d0de39daaeaab7d"
      },
      {
        "file": "game.html",
        "name": "openWishlist",
        "line": 61632,
        "sha256": "308747400598c0f33356d001d234c79894af942e5b39d5af108c3ae4735a22d1"
      },
      {
        "file": "game.html",
        "name": "goToLobby",
        "line": 61637,
        "sha256": "0ad806fa64f401c091cbb22b8188c46b8a31a55c05649d659f0303709c1d9dc8"
      },
      {
        "file": "game.html",
        "name": "nextStage",
        "line": 42447,
        "sha256": "9e53b012d584d296e004dbb15fe3f52bf9cab0b37ac825d6a426dc65562c9321"
      },
      {
        "file": "game-easy-test.html",
        "id": "demoEndWishlist",
        "line": 2979,
        "sha256": "470a5eae314b881f739f502353af3407a1453913968505b09fe45c5bb5a5ef28"
      },
      {
        "file": "game-easy-test.html",
        "id": "demoEndLobby",
        "line": 2980,
        "sha256": "fce5da713b2f376c5c89b31a6ca11137c821e929f22a235304df51a363ae9172"
      },
      {
        "file": "game-easy-test.html",
        "name": "nextBtn.onclick",
        "sha256": "fe48c6801f523c60a973a823111f752f2f8e528793237f402d0de39daaeaab7d"
      },
      {
        "file": "game-easy-test.html",
        "name": "openWishlist",
        "line": 59970,
        "sha256": "308747400598c0f33356d001d234c79894af942e5b39d5af108c3ae4735a22d1"
      },
      {
        "file": "game-easy-test.html",
        "name": "goToLobby",
        "line": 59975,
        "sha256": "f74baf5d0881ea238015abea884856055a495a1df61741bb19e390e490d70667"
      },
      {
        "file": "game-easy-test.html",
        "name": "nextStage",
        "line": 41246,
        "sha256": "9e53b012d584d296e004dbb15fe3f52bf9cab0b37ac825d6a426dc65562c9321"
      },
      {
        "file": "index.html",
        "name": "showCharGate",
        "line": 4176,
        "sha256": "475b7013544010e793267300afa8174d5c6ac06626f8407c34ad365a8c401e4d"
      }
    ],
    "packageMain": "http://localhost:3333/index.html?demo=1",
    "packagingScope": {
      "requiredTargets": [
        "index.html",
        "game.html",
        "game-easy-test.html"
      ],
      "legacyIndexdemoIncluded": false,
      "rootIndexRewrite": "source contract only; no HTTP executed"
    },
    "observations": [
      {
        "file": "game.html",
        "phase": "actual",
        "wishlist": {
          "ok": false,
          "url": "https://store.steampowered.com/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "lobby": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "ending": {
          "display": "flex",
          "stage": 0,
          "on": false
        },
        "calls": [
          [
            "beamStop"
          ],
          [
            "cacheExit"
          ],
          [
            "open",
            "https://store.steampowered.com/",
            "_blank"
          ],
          [
            "stop"
          ],
          [
            "save",
            {
              "hp": 10,
              "mhp": 100,
              "st": 0,
              "mst": 20,
              "mp": 0,
              "mmp": 30,
              "shield": 0,
              "mshield": 40,
              "s": "dead"
            }
          ]
        ]
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": true,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": true,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": false,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": false,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": true,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": true,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": false,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": false,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": true,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": true,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": false,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": false,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game.html",
        "phase": "negative-control",
        "wishlistDetected": true,
        "missingLocalAndDemoQueryDetected": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "actual",
        "wishlist": {
          "ok": false,
          "url": "https://store.steampowered.com/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "lobby": {
          "ok": false,
          "raw": "indexdemo.html",
          "target": "indexdemo.html",
          "exists": true,
          "included": false,
          "errors": [
            "not-in-FILES-or-DIRS",
            "demo-query-missing"
          ]
        },
        "ending": {
          "display": "flex",
          "stage": 3,
          "on": false
        },
        "calls": [
          [
            "beamStop"
          ],
          [
            "cacheExit"
          ],
          [
            "open",
            "https://store.steampowered.com/",
            "_blank"
          ],
          [
            "stop"
          ],
          [
            "save",
            {
              "hp": 10,
              "mhp": 100,
              "st": 0,
              "mst": 20,
              "mp": 0,
              "mmp": 30,
              "shield": 0,
              "mshield": 40,
              "s": "dead"
            }
          ]
        ]
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": true,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": true,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": false,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "not-ready",
        "demo": false,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": true,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": true,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": false,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "ready",
        "demo": false,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": true,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": true,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1&demo=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": false,
        "dead": false,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-control",
        "save": "reject",
        "demo": false,
        "dead": true,
        "route": {
          "ok": true,
          "raw": "/?lobby=1",
          "target": "index.html",
          "exists": true,
          "included": true,
          "errors": []
        },
        "wishlist": {
          "ok": true,
          "url": "https://store.steampowered.com/app/4749590/",
          "expected": "https://store.steampowered.com/app/4749590/"
        },
        "sideEffectsEqual": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "negative-control",
        "wishlistDetected": true,
        "missingLocalAndDemoQueryDetected": true
      },
      {
        "file": "index.html",
        "phase": "entry-control",
        "storySeen": false,
        "route": {
          "ok": true,
          "raw": "game.html?test=1&slot=demo&demo=1",
          "target": "game.html",
          "exists": true,
          "included": true,
          "errors": []
        }
      },
      {
        "file": "index.html",
        "phase": "entry-control",
        "storySeen": true,
        "route": {
          "ok": true,
          "raw": "game.html?test=1&slot=demo&demo=1&story=warrior-v21",
          "target": "game.html",
          "exists": true,
          "included": true,
          "errors": []
        }
      }
    ],
    "sourceChangedDuringRun": [],
    "productionApplied": false,
    "runtimeAccepted": false,
    "boundary": "Full actual CTA/goToLobby/nextStage/showCharGate bodies and actual button/nextBtn callers in Node VM; DOM, timers, audio, DB save, combat/init are explicit stubs; no browser, actual storage, network or build.",
    "checksSha256": "2ebb9dfff9282f0d30c911b4bbd82a7e7fd0fc76cbaf7623735ce54f668f17c0",
    "status": "SOURCE_CANDIDATE_AND_CONTROLS_PASS"
  },
  "tools": {
    "nodeCommand": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/checks.mjs /Users/fordeargamers/Projects/exoduser-migration-20261001",
    "finalExit": 0,
    "taskReadExit": 0,
    "policyReadsExit": 0,
    "sourceReadsExit": 0,
    "docsFullSearch": {
      "command": "rg -l 'demoEndWishlist|demoEndLobby|openWishlist\\(|goToLobby\\(|indexdemo\\.html|lobby=1&demo=1|4749590' docs/",
      "exit": 0,
      "matches": [
        "docs/CHANGELOG_SYNC.md",
        "docs/CHANGELOG_DAILY_20260520.md",
        "docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md",
        "docs/0마스터플랜/DEMO/HELL_DEMO_BUILD_NOTES.md",
        "docs/16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md",
        "docs/cinematic/WARINTRO_STILLS_AUDIT_20261001.md",
        "docs/13출시·마케팅/STEAM_DASHBOARD_AUDIT_20260909.md",
        "docs/13출시·마케팅/STEAM_REVIEW_REMEDIATION_20260916.md",
        "docs/13출시·마케팅/STEAM_EARLYACCESS_LOCALIZATION_20260910.md",
        "docs/13출시·마케팅/STEAM_REVIEW_READY_CHECKLIST_20260918.md",
        "docs/13출시·마케팅/STEAM_LANGUAGE_UPLOAD_20260923.md",
        "docs/13출시·마케팅/STEAM_REVIEW_20260926.md",
        "docs/13출시·마케팅/STEAM_REVIEW_FINAL_CHECK_20260918.md",
        "docs/13출시·마케팅/STEAM_LATEST_DEPLOY_20260909.md",
        "docs/13출시·마케팅/13출시·마케팅.md",
        "docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md",
        "docs/13출시·마케팅/STEAM_REVIEW_NOTES_20260916.txt",
        "docs/13출시·마케팅/STEAM_STORE_LOCALIZATION_20260909.md",
        "docs/13출시·마케팅/STEAM_INSTALL_REVIEW_20260916.md"
      ]
    },
    "metadataCommand": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'\nimport {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';\nconst ps=['tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','AGENTS.md','docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/13출시·마케팅/13출시·마케팅.md','docs/13출시·마케팅/PC_PACKAGING_20260910.md','docs/13출시·마케팅/STEAM_REVIEW_20260926.md'];\nconst p='docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json';const d=JSON.parse(readFileSync(p));console.log(JSON.stringify({at:new Date().toISOString(),cwd:process.cwd(),files:ps.map(p=>({path:process.cwd()+'/'+p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})),registry:{path:p,updatedAt:d.updatedAt,changesCountCurrent:d.changesCountCurrent,marketing:d.rows.find(x=>x.role==='MARKETING')?.currentTaskPath}}));\nJS",
    "metadataExit": 0,
    "errors": [
      "first fixture nextBtn missing before caller install, exit1",
      "stdout truncation caused orchestration JSON parse error after exit0"
    ]
  },
  "ownership": [
    "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/checks.mjs",
    "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/result.md"
  ],
  "skillsUsed": [],
  "skillsReason": "local source/Node fixture task; no external product or artifact skill needed"
}
```

## 남은 실제 제품 Gate

root는 두 URL 교체 후보와 easy 복귀 후보를 순차 검토·적용하고 위 canonical를 동기화한다. 실제 배포본 manifest에 target 포함 및 source SHA 연결, 데모 종료 화면 표시, 위시리스트 외부 열기, 로비 복귀/재입장, 저장 완료·실패에서 진행 보존을 해당 native build로 별도 검수해야 한다. 저장 fixture 성공을 실제 저장 성공으로 계산하지 않는다. 해당 Gate 대기는 이번 독립 source checker 완료의 blocker가 아니다.

새 파일2개 외 production·공유docs·Git·서버·실게임·빌드·이미지·세이브·설치·게시·외부사이트·외부 메시지·새팀/채팅·삭제/이동/cleanup0. 추가 업무 자체 생성0.

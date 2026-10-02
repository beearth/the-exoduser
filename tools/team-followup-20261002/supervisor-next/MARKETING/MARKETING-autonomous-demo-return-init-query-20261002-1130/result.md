# 데모 복귀 query→로비 초기화 caller — 자율 독립 검수

taskId: MARKETING-autonomous-demo-return-init-query-20261002-1130  
Codex / OpenAI; chatId 01a0fae0-cff3-78f0-aa73-32b08c6d6055; sessionId UNKNOWN.  
productionApplied=false / runtimeAccepted=false.

**NO-FIX.** index.html의 실제 query 선언과 Init async caller 전체를 메모리 VM에서 실행한10조건은 현재 source 분기대로 동작했다. 고의로 lobby 비교값1을0으로 바꾼 메모리 입력은 잘못된 cinematic 진입으로 검출했고, 원본 조건 복구 후보는 정상 login 진입으로 돌아왔다. 실제 원본 결함으로 보고하지 않는다.

## 관측과 이전 작업 경계

| 조건 | 실제 caller 관측 |
|---|---|
| NW + demo=1&lobby=1 | _fromGame=true, _testMode=true, _goLogin 호출 |
| query 순서 lobby=1&demo=1 | 같은 login 경로 |
| web + test=1 + lobby=1 | demo offline 분기의 login 경로 |
| NW + 첫 demo=1, cinematic 미시청 | _goCinematic |
| NW + demo=1, cinematic 시청 | _goLogin |
| NW + lobby=0 | _fromGame=false, cinematic |
| web + lobby=1 + 세션 없음 | getSession 뒤 _testMode=true, _goLobby |
| web + lobby=1 + 세션 있음 | currentUser=대역 user, _goLobby |
| web + lobby=1 + sb 없음 | _enterOffline |
| lobby=1 + cinematic=1 | 명시적 preview가 먼저 적용되어 cinematic. 현재 우선순위 관측이며 정책 변경하지 않음. |

demo=1 query는 이 Init에서 빌드 모드 결정자가 아니다. 현재 _LOBBY_BUILD='demo' 선언과 NW/test/return/preview 분기가 경로를 결정한다. NW에서 “복귀=무조건 _goLobby 직접 호출”이라고 검사하면 현재 demo 입장 화면 계약을 잘못 판단한다. 실제 login/offline/lobby 함수 내부·목록 로드·사용자 클릭·캐릭터 gate·저장은 이번 대역 이후의 Gate다.

전건 showCharGate/nextStage/CTA route control과 five-leaf 번역 checker를 재실행하지 않았다. 이번 새로운 caller는 index.html L2825 Init IIFE와 L2670 query 선언이다. 기존 전건의 gate/return source 근거는 역사 인수로 유지하며 이번 검수 PASS에 합산0. root _skUnclick 검사0.

## 실행·저장 영수증

- 실제 메모리 실행: **2026-10-02 11:27:12.580 UTC / 20:27:12.580 KST**, exec_command exit0.
- 명령 방식: 지정 Node `--input-type=module <<'JS'` stdin으로 아래 checks.mjs와 같은 본문 실행. 원문 명령은 JSON evidence에 보존.
- 당시 STATE Changes94, allowNewOwnedFiles=false로 파일/폴더 생성0. code/stdout는 세션 메모리에 보존.
- 저장 전 실제 STATE Read: capacity-after-8c317a73-1134, Changes68, allowNewOwnedFiles=true, role당1반복/2파일 허용 확인. root 제공 checkpoint는 독립 Git 관측 아님.
- 이번 epoch에 checks.mjs/result.md **2파일만 저장**. 이미 끝난 검수를 파일에서 다시 실행하지 않았다. 이후 새 epoch 전에는 추가 파일0.
- 저장 메타데이터 관찰: 2026-10-02T11:40:20.465Z; input index SHA는 실행 때와 같다. checker SHA `c2f1f0a817d52d84678933b0c5b7584b085f0577b047914edd7ce458025103e1`, 3619 bytes. 이 SHA는 저장된 본문 byte 식별자이며 새 checker 실행 승인 기록이 아니다.

재사용 명령(이번 저장 뒤 재실행0):

```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-autonomous-demo-return-init-query-20261002-1130/checks.mjs
```

최소 생산 patch 없음. 주입 음성 patch는 `_qp.get('lobby')==='1'`→`==='0'`, 메모리 복구 후보는0→1이다. 원본 조건과 byte-equivalent이므로 생산 수정 필요 없다.

## source·대역 경계

index SHA `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8`  
query fragment SHA `9b499f2c7b1d552727cdbeefcbbadeda7273761109e0acf85359495810313ca4`  
Init caller SHA `be722c5e90374aaf2cf2a52f8c0dd1006eb4420e06104f4395a1f4d82f690d4d`

실제 전체 Init IIFE·query 선언을 실행했고, query 값은 실제 URLSearchParams를 사용했다. _goLogin/_goCinematic/_enterOffline/_goLobby·showLoading·_cinSeenChk 및 Supabase session/listener는 명시적 메모리 대역이다. 실제 인증·외부 HTTP·DOM 전환·목록·localStorage·native 게임/빌드 미실행. 세션 대역 성공으로 실제 로그인/온라인 기능을 승인하지 않는다. original byte 시작/끝 변동0.

## docs 검색과 root 인계

checker 저장 뒤 전체 docs에 아래 rg1회 exit0. 결과6080tokens 중 출력2400tokens로 잘림; 전 매칭 정독했다고 주장하지 않는다.

```sh
rg -n --max-columns 180 --max-columns-preview '_fromGame|lobby=1|_goLogin|_enterOffline|_goLobby|_cinPreview' docs/
```

| canonical | old | new 보충안 |
|---|---|---|
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md 「공개 데모 캐릭터 생성·삭제」 입장/복귀 계약 | 슬롯→활성 저장·복귀 역복사 설명, Init query 경로 구분 없음 | “현재 index Init은 lobby=1을 _fromGame으로 읽는다. NW/test demo 복귀는 _goLogin, web session 경로 복귀는 _goLobby, sb 부재는 _enterOffline이다. 이는 caller 연결 source 검수이며 저장/목록 실제 검수와 분리한다.” |
| docs/13출시·마케팅/PC_PACKAGING_20260910.md 게임 진입점 표 아래 | index.html?demo=1 진입점 | “demo=1 자체로 Init의 _testMode를 켜지 않는다. 현재 _LOBBY_BUILD='demo', NW 여부·test=1·lobby=1·cinematic=1에 따른 경로를 유지한다. 해당 native 빌드의 복귀/재입장 UX는 별도.” |
| docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md 화면전환 계약 | _goLogin/_goLobby의 실제 수명/선택/목록 보호 기록 | 기존값 수정0. “Init caller 분기 source 검수는 MARKETING NO-FIX 보고를 참조하며 화면전환·초점·실제 목록/슬롯 승인으로 대체하지 않는다.” 링크 보충만. |
| CHANGELOG 및 나머지 전환 함수 매칭 이력 | 과거 완료 기록 | 이력·보호설계·수치·출시 상태 변경0. |

공유docs 쓰기0. 정상 query/caller이므로 기존 canonical 계약을 덮어쓰지 않는다.

## JSON stdout 및 명령 evidence

```json
{
  "provider": "Codex",
  "chatId": "01a0fae0-cff3-78f0-aa73-32b08c6d6055",
  "sessionId": null,
  "autonomyPolicy": {
    "version": "autonomy-user-20261002-1126-v1",
    "actualRead": true,
    "verifiedSha": "80f7e3cf084c440658b1fae27ad60999ea6e41aa048bb5d22d62a099ab4b9608"
  },
  "memoryRun": {
    "tool": "exec_command",
    "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'\nimport {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import vm from 'node:vm';import assert from 'node:assert/strict';\nconst root=process.cwd(),src=readFileSync('index.html','utf8'),sha=x=>createHash('sha256').update(x).digest('hex');\nconst query=src.slice(src.indexOf('const _qp=new URLSearchParams(window.location.search);'),src.indexOf('\\nfunction _goLogin',src.indexOf('const _qp=new URLSearchParams(window.location.search);')));\nconst start=src.indexOf('(async()=>{',src.indexOf('// ═══ Init ═══'));\nconst end=src.indexOf('\\n})();',start)+7;const caller=src.slice(start,end);new vm.Script(caller);\nasync function run(search,{nw=false,sbPresent=true,session=false,seen=false}={},querySource=query){\n const calls=[],offline={style:{}},user={id:'fixture-user'};\n const s={window:{location:{search}},location:{hostname:'localhost'},URLSearchParams,_LOBBY_BUILD:'demo',_TL:x=>x,currentUser:null,\n $:id=>id==='offlineBtn'?offline:null,showLoading:t=>calls.push(['loading',t]),_cinSeenChk:()=>seen,\n _goLogin:()=>calls.push(['login']),_goCinematic:()=>calls.push(['cinematic']),_enterOffline:()=>calls.push(['offline']),_goLobby:async()=>calls.push(['lobby']),\n sb:sbPresent?{auth:{getSession:async()=>{calls.push(['getSession']);return {data:{session:session?{user}:null}};},onAuthStateChange:()=>calls.push(['authListener'])}}:null};\n if(nw)s.nw={};const ctx=vm.createContext(s);vm.runInContext(querySource,ctx);await vm.runInContext(caller,ctx);\n return {search,nw,sbPresent,session,seen,calls,testMode:vm.runInContext('_testMode',ctx),fromGame:vm.runInContext('_fromGame',ctx),currentUser:s.currentUser};\n}\nconst cases=[\n ['?demo=1&lobby=1',{nw:true},'login'],\n ['?lobby=1&demo=1',{nw:true},'login'],\n ['?demo=1&lobby=1&test=1',{},'login'],\n ['?demo=1',{nw:true},'cinematic'],\n ['?demo=1',{nw:true,seen:true},'login'],\n ['?demo=1&lobby=0',{nw:true},'cinematic'],\n ['?demo=1&lobby=1',{session:false},'lobby'],\n ['?demo=1&lobby=1',{session:true},'lobby'],\n ['?demo=1&lobby=1',{sbPresent:false},'offline'],\n ['?demo=1&lobby=1&cinematic=1',{nw:true},'cinematic']\n];\nconst observations=[];for(const[q,opts,expected]of cases){const r=await run(q,opts);const sink=r.calls.find(x=>['login','cinematic','lobby','offline'].includes(x[0]))?.[0];assert.equal(sink,expected);observations.push({...r,expected});}\nconst broken=query.replace(\"_qp.get('lobby')==='1'\",\"_qp.get('lobby')==='0'\");assert.notEqual(broken,query);\nconst failure=await run('?demo=1&lobby=1',{nw:true},broken);assert.equal(failure.fromGame,false);assert(failure.calls.some(x=>x[0]==='cinematic'));\nconst candidate=broken.replace(\"_qp.get('lobby')==='0'\",\"_qp.get('lobby')==='1'\");assert.equal(candidate,query);\nconst repaired=await run('?demo=1&lobby=1',{nw:true},candidate);assert.equal(repaired.fromGame,true);assert(repaired.calls.some(x=>x[0]==='login'));\nassert.equal(sha(readFileSync('index.html','utf8')),sha(src));\nconsole.log(JSON.stringify({taskId:'MARKETING-autonomous-demo-return-init-query-20261002-1130',at:new Date().toISOString(),root,inputSha:sha(src),querySha:sha(query),callerSha:sha(caller),query,callerStartLine:src.slice(0,start).split('\\n').length,observations,injectedFailure:failure,memoryCandidate:repaired,decision:'NO-FIX: current query/caller branch controls pass; injected parser defect detected and restored',boundary:'actual whole init async caller plus actual query declarations; screen/navigation/loading/auth endpoints are explicit in-memory stubs, no showCharGate/route function rerun, no live auth/browser/storage',filesWritten:0,productionApplied:false,runtimeAccepted:false},null,2));\nJS",
    "exit": 0,
    "stdout": {
      "taskId": "MARKETING-autonomous-demo-return-init-query-20261002-1130",
      "at": "2026-10-02T11:27:12.580Z",
      "root": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
      "inputSha": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
      "querySha": "9b499f2c7b1d552727cdbeefcbbadeda7273761109e0acf85359495810313ca4",
      "callerSha": "be722c5e90374aaf2cf2a52f8c0dd1006eb4420e06104f4395a1f4d82f690d4d",
      "query": "const _qp=new URLSearchParams(window.location.search);\nconst _fromGame=_qp.get('lobby')==='1';\nconst _cinPreview=_qp.get('cinematic')==='1';\nlet _testMode=_qp.get('test')==='1';\n",
      "callerStartLine": 2825,
      "observations": [
        {
          "search": "?demo=1&lobby=1",
          "nw": true,
          "sbPresent": true,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "login"
            ]
          ],
          "testMode": true,
          "fromGame": true,
          "currentUser": null,
          "expected": "login"
        },
        {
          "search": "?lobby=1&demo=1",
          "nw": true,
          "sbPresent": true,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "login"
            ]
          ],
          "testMode": true,
          "fromGame": true,
          "currentUser": null,
          "expected": "login"
        },
        {
          "search": "?demo=1&lobby=1&test=1",
          "nw": false,
          "sbPresent": true,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "login"
            ]
          ],
          "testMode": true,
          "fromGame": true,
          "currentUser": null,
          "expected": "login"
        },
        {
          "search": "?demo=1",
          "nw": true,
          "sbPresent": true,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "cinematic"
            ]
          ],
          "testMode": true,
          "fromGame": false,
          "currentUser": null,
          "expected": "cinematic"
        },
        {
          "search": "?demo=1",
          "nw": true,
          "sbPresent": true,
          "session": false,
          "seen": true,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "login"
            ]
          ],
          "testMode": true,
          "fromGame": false,
          "currentUser": null,
          "expected": "login"
        },
        {
          "search": "?demo=1&lobby=0",
          "nw": true,
          "sbPresent": true,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "cinematic"
            ]
          ],
          "testMode": true,
          "fromGame": false,
          "currentUser": null,
          "expected": "cinematic"
        },
        {
          "search": "?demo=1&lobby=1",
          "nw": false,
          "sbPresent": true,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "getSession"
            ],
            [
              "lobby"
            ],
            [
              "authListener"
            ]
          ],
          "testMode": true,
          "fromGame": true,
          "currentUser": null,
          "expected": "lobby"
        },
        {
          "search": "?demo=1&lobby=1",
          "nw": false,
          "sbPresent": true,
          "session": true,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "getSession"
            ],
            [
              "lobby"
            ],
            [
              "authListener"
            ]
          ],
          "testMode": false,
          "fromGame": true,
          "currentUser": {
            "id": "fixture-user"
          },
          "expected": "lobby"
        },
        {
          "search": "?demo=1&lobby=1",
          "nw": false,
          "sbPresent": false,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "offline"
            ]
          ],
          "testMode": false,
          "fromGame": true,
          "currentUser": null,
          "expected": "offline"
        },
        {
          "search": "?demo=1&lobby=1&cinematic=1",
          "nw": true,
          "sbPresent": true,
          "session": false,
          "seen": false,
          "calls": [
            [
              "loading",
              "데이터를 불러오는 중..."
            ],
            [
              "cinematic"
            ]
          ],
          "testMode": false,
          "fromGame": true,
          "currentUser": null,
          "expected": "cinematic"
        }
      ],
      "injectedFailure": {
        "search": "?demo=1&lobby=1",
        "nw": true,
        "sbPresent": true,
        "session": false,
        "seen": false,
        "calls": [
          [
            "loading",
            "데이터를 불러오는 중..."
          ],
          [
            "cinematic"
          ]
        ],
        "testMode": true,
        "fromGame": false,
        "currentUser": null
      },
      "memoryCandidate": {
        "search": "?demo=1&lobby=1",
        "nw": true,
        "sbPresent": true,
        "session": false,
        "seen": false,
        "calls": [
          [
            "loading",
            "데이터를 불러오는 중..."
          ],
          [
            "login"
          ]
        ],
        "testMode": true,
        "fromGame": true,
        "currentUser": null
      },
      "decision": "NO-FIX: current query/caller branch controls pass; injected parser defect detected and restored",
      "boundary": "actual whole init async caller plus actual query declarations; screen/navigation/loading/auth endpoints are explicit in-memory stubs, no showCharGate/route function rerun, no live auth/browser/storage",
      "filesWritten": 0,
      "productionApplied": false,
      "runtimeAccepted": false
    }
  },
  "savedMetadata": {
    "at": "2026-10-02T11:40:20.465Z",
    "indexSha": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
    "checkerSha": "c2f1f0a817d52d84678933b0c5b7584b085f0577b047914edd7ce458025103e1",
    "checkerBytes": 3619
  },
  "capacity": {
    "at": "2026-10-02T11:35:03.518638+00:00",
    "changes": 68,
    "method": "git status --porcelain=v1 --untracked-files=all -z",
    "status": "released_bounded_autonomous_outputs",
    "allowNewOwnedFiles": true,
    "epoch": "capacity-after-8c317a73-1134",
    "maxNewOutputFilesPerRole": 2,
    "maxSavedIterationsPerRole": 1,
    "maximumAdditionalTeamFiles": 30,
    "maximumProjectedChanges": 98,
    "afterBudgetExhausted": "continue independent memory work; no new files until a newer capacity epoch",
    "rootCheckpointCommit": "8c317a73a2b68c0dd7b80e128aa4d50c3b0ef096",
    "rootReceiptSHA256": "0e73363a040a32abc3fc9780090ad7540b9a044483d629da5562ce82dcf4fcb9",
    "checkpointAt80StopBefore100": true,
    "independentMemoryWorkMayContinue": true
  },
  "docsSearch": {
    "tool": "exec_command",
    "command": "rg -n --max-columns 180 --max-columns-preview '_fromGame|lobby=1|_goLogin|_enterOffline|_goLobby|_cinPreview' docs/",
    "exit": 0,
    "outputTruncated": true
  },
  "ownership": [
    "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-autonomous-demo-return-init-query-20261002-1130/checks.mjs",
    "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-autonomous-demo-return-init-query-20261002-1130/result.md"
  ],
  "productionApplied": false,
  "runtimeAccepted": false,
  "errors": [],
  "skillsUsed": [],
  "scope": {
    "gitCalls": 0,
    "productionWrites": 0,
    "sharedDocsWrites": 0,
    "storageWrites": 0,
    "realAuthCalls": 0,
    "servers": 0,
    "games": 0,
    "builds": 0,
    "externalPublication": 0,
    "deletedFiles": 0,
    "newSessionsOrAgents": 0
  }
}
```

## 실제 제품 Gate와 다음 독립 경계

실제 NW/웹의 return query에서 화면 전환·사용자 데모 입장 버튼·목록 선택/활성 저장·재입장까지는 해당 배포 source SHA에 맞춰 root/QA가 별도 인수한다. source NO-FIX는 UX/제품 PASS가 아니다.

자율 승인 백로그의 다음 독립 경계는 demo lobby의 **실제 demoEnterBtn caller→_enterOffline→_goLobby와 목록 로딩 실패 경계**다. 이번 epoch 저장 예산을 사용했으므로 다음 검수는 메모리에서 계속하고 새로운 capacity epoch까지 파일 생성0. 외부 권한·새 정책·제품 공약을 만들지 않는다.


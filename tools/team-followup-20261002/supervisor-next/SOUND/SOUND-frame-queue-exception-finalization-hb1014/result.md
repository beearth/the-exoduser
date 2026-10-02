# SOUND-frame-queue-exception-finalization-hb1014

현재 중간 예외로 첫 성공음이 다음 reset에서 재실행되는 **RED 재현 → finally 메모리 후보 GREEN**. 무예외3항목 control의 순서/volume/rate/category/priority/queue/RNG/수명/쿨다운 trace가 원문과 완전히 같다. 새 실패1·정상1 입력을 원문/후보 총4회 실행, 비교1건, assertion FAIL0, Node exit0. 양판 동일 source 1그룹만 실행. 이전완료/전체검사/import/root _skUnclick 중복0.

productionApplied=false, runtimeAccepted=false, priorityPolicyAdopted=false. source fixture PASS ≠ 실게임/native/청취/GPU/제품/배포 PASS.

| 영수증 | 실제 근거 |
|---|---|
| 수신·Read | TASK Assigned 2026-10-02T10:35:54.431195+00:00; 첫실제Read chunk a07096 exit0. 정확수신/첫Read시각 추정0. COMMON/AGENTS/TEAM_CONTINUATION_POLICY/담당표/사운드SSOT/시작실패정본과 이전보고를 실제읽음, SHA/시각 아래JSON. |
| 작업경로/소유 | /Users/fordeargamers/Projects/exoduser-migration-20261001 cwd/realpath. 새폴더 result.md/checks.mjs2개만 작성. TASK/공유docs/생산/타WIP/이전산출 쓰기0. |
| 실행 | 2026-10-02T10:39:35.705Z→2026-10-02T10:39:35.915Z UTC (2026-10-02 19:39:35.705 KST→2026-10-02 19:39:35.915 KST), /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node, v24.15.0, exit0. 실행 당시 checks SHA=ff3f71ca4cc9e9ad8d3efe5aaf440d694712889b9e2b605e2bdd96529c2aa40c; docs 인계 문안만 보충한 최종 checks SHA=e8f5343070be53d64f130a1bbb9f17d615b0cbfb42c540a5de43138eb4b33fa5. |
| HEAD/용량 | parent 제공6b865637은역사근거, Git조회0/currentHEAD·Changes=null. Changes80/100은감독관리, 별도capacity중단신호수신0. |

| source | 본편/easy 시작행 | SHA256 | 양판 |
|---|---:|---|---|
| _sfxFrameReset | 11840/11244 | a1e9ed017b19ea9adb736eaa53ff9f1b9f548db8b14763ed7068854a54705370 | 동일 |
| _playSampleNow | 11800/11204 | 88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7 | 동일 |
| _r | 12004/11408 | a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3 | 동일 |
| playSample | 11899/11303 | 4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79 | 동일 |
| _evictLowest | 11793/11197 | 01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88 | 동일 |
| _sfxPri | 11778/11182 | ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5 | 동일 |
| _sfxCat | 11883/11287 | b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b | 동일 |
| _isFootstepSfx | 11777/11181 | d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853 | 동일 |
| _isSkillSfx | 11897/11301 | 1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a | 동일 |
| _MAX_ACTIVE_NODES | 11767/11171 | 7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267 | 동일 |
| _SFX_MAX | 11768/11172 | 409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470 | 동일 |
| _SFX_PER_FRAME | 11770/11174 | 74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9 | 동일 |
| _SFX_PRI | 11772/11176 | 3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965 | 동일 |
| _SKILL_SFX_KEYS | 11896/11300 | e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271 | 동일 |
| _MAX_PROJ_NODES | 11774/11178 | 9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d | 동일 |
| _MAX_HIT_NODES | 11775/11179 | f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011 | 동일 |
| _MAX_STEP_NODES | 11776/11180 | f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1 | 동일 |

전체 현재 SHA 본편=8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b, easy=50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057. caller site·행·SHA와 실행후고정anchor보존은 아래evidence. 현재 _playSampleNow start catch는 이미생산반영된정본이며 재수정/독립재검사0; 이번 중간실패가 실제로 이함수를 통과하도록 사용했다.

| id | frame1 원Error전달 | frame1 queue/카운터/sbCd | frame1 성공 | frame2 성공 | caller/pitch RNG | 검수 |
|---|---|---|---|---|---|---|
| second-start-exception-current | true | 3/{"ghost_laugh":2,"g_voice":5}/3 | ghost_laugh | ghost_laugh,voice_fixture_second,voice_fixture_tail | 3/3 | PASS |
| second-start-exception-memory | true | 0/{"ghost_laugh":0,"g_voice":0}/2 | ghost_laugh | 없음 | 3/3 | PASS |
| normal-three-queue-current | false | 0/{"ghost_laugh":0,"g_voice":0}/2 | ghost_laugh,voice_fixture_second,voice_fixture_tail | 없음 | 3/3 | PASS |
| normal-three-queue-memory | false | 0/{"ghost_laugh":0,"g_voice":0}/2 | ghost_laugh,voice_fixture_second,voice_fixture_tail | 없음 | 3/3 | PASS |

원큐는 ghost_laugh(pri1), voice_fixture_second(pri0), voice_fixture_tail(pri0), nodepriority는모두VOICE9. actual playSample의 unshift/push로 구성, ghost카테고리 자체+g_voice2개; clock100/116ms, active0부터 시작, duration0.2초 buffer대역. enqueue callerRNG3/pitchRNG3은ghost포함3항목준비구간이고 flush에는추가RNG0. 임의전역RNG값으로확대하지않음.

현행 frame1에서 첫ghost start성공 뒤 두번째 start가 같은합성Error를throw한다. 이미채택된backend catch는실패노드를즉시회수하지만 부모queue3·frameCounts2/5·sbCd3을남긴다. frame2에서ghost를다시start하고두번째·세번째도실행한다. 메모리finally는원Error를그대로전달하면서queue0·frameCounts0/0·sbCd2로정리해frame2 replay0. 세번째미처리항목도해당배치와함께폐기되며 retry/전역큐정책/pri재설계는추가하지않았다. death/hit 감소와mPlaying리셋은기존선행위치유지, _resumeAudioCtx는기존후행위치유지로backend예외시호출하지않는다.

최소메모리후보(원함수전체/정확SHA/치환fragment는JSON):

```js
try {
  // 기존 for 큐 dispatcher 전체를 그대로 실행
} finally {
  _sfxQueue.length=0;
  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;
  if(SFX._sbSndCd>0)SFX._sbSndCd--;
}
// 기존 suspended-context resume 위치 유지
```

docs 전체키워드검색 실제1회=26행/13파일. 정확결과/정본별목록/출력SHA 아래JSON. 보호2_3·Q전용blackBean·LOCK/TBD·확정수치·어택티켓금지 유지. 원총괄이생산채택할때반영할 old/new 인계:

| 정본 / 항목 | old 현재 | new 인계(이번은미적용) |
|---|---|---|
| docs/6사운드디자인/6사운드디자인.md / 샘플시작동기실패 표 정상/부모실패 | failed flush가큐clear전throw하여fixture queue1유지; 큐부모실패는별도 | _sfxFrameReset dispatcher를try/finally로보호. backend예외는같은Error전달, queue배치전부폐기·_sfxFrameCnt모든키0·_sbSndCd>0이면1감소. 성공했던앞항목의다음frame재실행0. |
| docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md / 정상/dispatcher | 실패가flush로전달되면queueclear미도달, 큐실패처리인수별도 | backend즉시_dn계약유지. 부모finally후예외전달로중간실패의성공prefix재실행방지. 미처리tail도폐기하며재시도추가0. |
| docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md / 샘플시작실패 부록 정상·정책 | failed flush queue1는별도미수정경계 | 부모dispatcher finally에서queue전부폐기·frameCounts0·sbCd양수일때1감소후같은Error전달. 중간실패의성공prefix는다음reset에서중복start하지않음. 실제장치/시간/성능개선율미검수. |
| docs/CHANGELOG_SYNC.md 및 마스터 인수문서 / 과거 시작실패 인수 | 당시queue/dedup/RNG정책변경0 기록 | 과거기록은수정하지않고 이번부모finally의별도후속인수행을추가. SOURCE후보/미채택과생산채택시점을구분. |
| 위 시스템정본 / 수치·검수상태 | desktop48/mobile16,frame6/3,category2/1,30msdedup,startcatch정본 | 수치·우선순위·볼륨·피치·기존startcatch불변. 새failure/control source검수만, productionApplied=false/runtimeAccepted=false; 통합후표시를별도갱신. |

오디오장치/청취/실시간timer/native/실게임/저장/빌드미검수. create/actx/panner 등다른실패·예외중재진입·suspended-context·모바일/포화/반복동일키전수는확대0. realbackend/_dn/fullflush와명시WebAudio/clock/RNG/heldtimer대역을구분했다. timer수동실행·lateonended는메모리노드회수만이며파일cleanup0. 새blocker없음; 남은Gate는감독검토→원총괄생산/docs순차인수→별도허가실제품검수다. 외부skill/API/MCP필요없어사용0. 독자적다음업무배정0.

## 실행 evidence JSON

```json
{
  "taskId": "SOUND-frame-queue-exception-finalization-hb1014",
  "provider": "Codex",
  "chatId": "01a0faaf-956a-74a3-9bf1-77032f124e2d",
  "supervisorChatId": "01a0fb1e-4ec3-7dd3-bba2-f87518e881fa",
  "sessionId": null,
  "assignedUTC": "2026-10-02T10:35:54.431195+00:00",
  "firstTaskRead": {
    "chunk": "a07096",
    "exitCode": 0,
    "exactTimestamp": null
  },
  "status": "CURRENT_RED_MEMORY_GREEN_NORMAL_EQUAL",
  "productionApplied": false,
  "runtimeAccepted": false,
  "priorityPolicyAdopted": false,
  "execution": {
    "startedAt": "2026-10-02T10:39:35.705Z",
    "completedAt": "2026-10-02T10:39:35.915Z",
    "startedAtKST": "2026-10-02 19:39:35.705 KST",
    "completedAtKST": "2026-10-02 19:39:35.915 KST",
    "node": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node",
    "version": "v24.15.0",
    "command": [
      "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node",
      "tools/team-followup-20261002/supervisor-next/SOUND/SOUND-frame-queue-exception-finalization-hb1014/checks.mjs"
    ],
    "exitCode": 0,
    "uniqueInputs": 2,
    "sourceExecutions": 4,
    "comparisons": 1,
    "assertionFailures": 0,
    "sourceGroups": 1,
    "previousTestsRerun": 0,
    "previousScriptsImported": 0,
    "rootSkUnclickWork": 0,
    "executedChecksSha256": "ff3f71ca4cc9e9ad8d3efe5aaf440d694712889b9e2b605e2bdd96529c2aa40c"
  },
  "ownership": {
    "rootReal": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
    "ownerReal": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-frame-queue-exception-finalization-hb1014",
    "initialOwnedFiles": [
      "TASK.md",
      "checks.mjs"
    ],
    "outputs": [
      "result.md",
      "checks.mjs"
    ],
    "checksSha256": "e8f5343070be53d64f130a1bbb9f17d615b0cbfb42c540a5de43138eb4b33fa5"
  },
  "reads": [
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-frame-queue-exception-finalization-hb1014/TASK.md",
      "at": "2026-10-02T10:39:35.706Z",
      "sha256": "68b4aa14b939108847a7a35c8dc8abd692d3e4f24423e8faa623de71692b3ad4",
      "bytes": 3903
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
      "at": "2026-10-02T10:39:35.706Z",
      "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "bytes": 3373
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/AGENTS.md",
      "at": "2026-10-02T10:39:35.706Z",
      "sha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "bytes": 26076
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "at": "2026-10-02T10:39:35.706Z",
      "sha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "bytes": 24374
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md",
      "at": "2026-10-02T10:39:35.707Z",
      "sha256": "16cbe4b9d0c9d0e0e8cabc1ac8d4f7718f78b4e013b6e5cb169e5bb6d397be6d",
      "bytes": 11624
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/6사운드디자인.md",
      "at": "2026-10-02T10:39:35.707Z",
      "sha256": "0eeff22b671e41ae3c079e489678d2ef40b0ca35c92ddc1a95fc4e3433ded65d",
      "bytes": 75382
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md",
      "at": "2026-10-02T10:39:35.708Z",
      "sha256": "2548092228e1a6702d9285ffb0676683d997ca3017338198f5c61f21d7e0c450",
      "bytes": 4230
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/TASK.md",
      "at": "2026-10-02T10:39:35.708Z",
      "sha256": "4f8031b604769963983729b0ec49c32d207b20fa43b30281998e8286897f01d2",
      "bytes": 3705
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/result.md",
      "at": "2026-10-02T10:39:35.708Z",
      "sha256": "e8610674b4136cb2feb8d6d6f92a9976eade78414b167be135e47a5fbc44c66b",
      "bytes": 7386
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "at": "2026-10-02T10:39:35.709Z",
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "bytes": 4028178
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "at": "2026-10-02T10:39:35.759Z",
      "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "bytes": 3905625
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md",
      "at": "2026-10-02T10:40:35.343Z",
      "sha256": "ff30d8abec2d2be0a374ed3649cf03c8478c2dbda073708be98614f9cbb0bab9",
      "bytes": 95399
    }
  ],
  "sources": [
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "blocks": [
        {
          "name": "_sfxFrameReset",
          "sha256": "a1e9ed017b19ea9adb736eaa53ff9f1b9f548db8b14763ed7068854a54705370",
          "line": 11840,
          "endLine": 11867
        },
        {
          "name": "_playSampleNow",
          "sha256": "88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7",
          "line": 11800,
          "endLine": 11839
        },
        {
          "name": "_r",
          "sha256": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3",
          "line": 12004,
          "endLine": 12004
        },
        {
          "name": "playSample",
          "sha256": "4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79",
          "line": 11899,
          "endLine": 11911
        },
        {
          "name": "_evictLowest",
          "sha256": "01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88",
          "line": 11793,
          "endLine": 11799
        },
        {
          "name": "_sfxPri",
          "sha256": "ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5",
          "line": 11778,
          "endLine": 11792
        },
        {
          "name": "_sfxCat",
          "sha256": "b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b",
          "line": 11883,
          "endLine": 11895
        },
        {
          "name": "_isFootstepSfx",
          "sha256": "d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853",
          "line": 11777,
          "endLine": 11777
        },
        {
          "name": "_isSkillSfx",
          "sha256": "1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a",
          "line": 11897,
          "endLine": 11897
        },
        {
          "name": "_MAX_ACTIVE_NODES",
          "sha256": "7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267",
          "line": 11767,
          "endLine": 11767
        },
        {
          "name": "_SFX_MAX",
          "sha256": "409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470",
          "line": 11768,
          "endLine": 11768
        },
        {
          "name": "_SFX_PER_FRAME",
          "sha256": "74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9",
          "line": 11770,
          "endLine": 11770
        },
        {
          "name": "_SFX_PRI",
          "sha256": "3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965",
          "line": 11772,
          "endLine": 11772
        },
        {
          "name": "_SKILL_SFX_KEYS",
          "sha256": "e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271",
          "line": 11896,
          "endLine": 11896
        },
        {
          "name": "_MAX_PROJ_NODES",
          "sha256": "9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d",
          "line": 11774,
          "endLine": 11774
        },
        {
          "name": "_MAX_HIT_NODES",
          "sha256": "f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011",
          "line": 11775,
          "endLine": 11775
        },
        {
          "name": "_MAX_STEP_NODES",
          "sha256": "f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1",
          "line": 11776,
          "endLine": 11776
        }
      ],
      "callerSites": [
        {
          "line": 11840,
          "text": "function _sfxFrameReset(){"
        },
        {
          "line": 59917,
          "text": "_lastLoopTs=timestamp;if(_DCP.on)_DCP._entry.main++;_sfxFrameReset();_partSpawnCnt=0;_aoeHitCnt=0;try{_pollGamepad()}catch(e){console.error('[GAMEPAD] poll error:',e)}"
        }
      ],
      "callerSitesSha256": "d9802a2eb42b8a86e48530bb3aa94f3b25d2c8a17183bb85a640b3571c7fd6e1",
      "fingerprint": "a4b851759e16a019017694e072e47f7298ec2a69d3331801afd16ed43a9d0bb9"
    },
    {
      "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "blocks": [
        {
          "name": "_sfxFrameReset",
          "sha256": "a1e9ed017b19ea9adb736eaa53ff9f1b9f548db8b14763ed7068854a54705370",
          "line": 11244,
          "endLine": 11271
        },
        {
          "name": "_playSampleNow",
          "sha256": "88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7",
          "line": 11204,
          "endLine": 11243
        },
        {
          "name": "_r",
          "sha256": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3",
          "line": 11408,
          "endLine": 11408
        },
        {
          "name": "playSample",
          "sha256": "4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79",
          "line": 11303,
          "endLine": 11315
        },
        {
          "name": "_evictLowest",
          "sha256": "01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88",
          "line": 11197,
          "endLine": 11203
        },
        {
          "name": "_sfxPri",
          "sha256": "ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5",
          "line": 11182,
          "endLine": 11196
        },
        {
          "name": "_sfxCat",
          "sha256": "b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b",
          "line": 11287,
          "endLine": 11299
        },
        {
          "name": "_isFootstepSfx",
          "sha256": "d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853",
          "line": 11181,
          "endLine": 11181
        },
        {
          "name": "_isSkillSfx",
          "sha256": "1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a",
          "line": 11301,
          "endLine": 11301
        },
        {
          "name": "_MAX_ACTIVE_NODES",
          "sha256": "7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267",
          "line": 11171,
          "endLine": 11171
        },
        {
          "name": "_SFX_MAX",
          "sha256": "409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470",
          "line": 11172,
          "endLine": 11172
        },
        {
          "name": "_SFX_PER_FRAME",
          "sha256": "74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9",
          "line": 11174,
          "endLine": 11174
        },
        {
          "name": "_SFX_PRI",
          "sha256": "3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965",
          "line": 11176,
          "endLine": 11176
        },
        {
          "name": "_SKILL_SFX_KEYS",
          "sha256": "e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271",
          "line": 11300,
          "endLine": 11300
        },
        {
          "name": "_MAX_PROJ_NODES",
          "sha256": "9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d",
          "line": 11178,
          "endLine": 11178
        },
        {
          "name": "_MAX_HIT_NODES",
          "sha256": "f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011",
          "line": 11179,
          "endLine": 11179
        },
        {
          "name": "_MAX_STEP_NODES",
          "sha256": "f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1",
          "line": 11180,
          "endLine": 11180
        }
      ],
      "callerSites": [
        {
          "line": 11244,
          "text": "function _sfxFrameReset(){"
        },
        {
          "line": 58249,
          "text": "_lastLoopTs=timestamp;if(_DCP.on)_DCP._entry.main++;_sfxFrameReset();_partSpawnCnt=0;_aoeHitCnt=0;try{_pollGamepad()}catch(e){console.error('[GAMEPAD] poll error:',e)}"
        }
      ],
      "callerSitesSha256": "b46193e546622232c517c518f85bf1c7cda586c38b75471a8e67727ca0fff8be",
      "fingerprint": "a4b851759e16a019017694e072e47f7298ec2a69d3331801afd16ed43a9d0bb9"
    }
  ],
  "memoryEdits": [
    {
      "files": [
        "game.html",
        "game-easy-test.html"
      ],
      "target": "_sfxFrameReset",
      "originalFunction": "function _sfxFrameReset(){\n  _sfxFrameT++;\n  if(_deathSfxCd>0)_deathSfxCd--;\n  if(_hitSfxCd>0)_hitSfxCd--;\n  _mSfxPlaying=0;\n  // 큐에서 프레임당 최대 8개만 실제 재생 (나머지는 다음 프레임)\n  // 단 키 중복 제거 — 같은 소리 여러개면 1개만\n  const _seen={};const _catSeen={};let _cnt=0;\n  const c=actx();const _t=c.currentTime;\n  for(let i=0;i<_sfxQueue.length;i++){\n    const q=_sfxQueue[i];\n    if(_activeNodeCnt>=_MAX_ACTIVE_NODES&&!q.pri)continue; // 일반음: 노드 한도 시 스킵\n    if(!q.pri&&_cnt>=_SFX_PER_FRAME)continue; // 우선순위 소리는 프레임 제한 무시\n    const _cat=_sfxCat(q.key);\n    if(!q.pri&&(_catSeen[_cat]||0)>=_SFX_MAX)continue; // 우선순위 소리는 카테고리 제한 무시\n    _catSeen[_cat]=(_catSeen[_cat]||0)+1;\n    if(!_seen[q.key])_seen[q.key]=0;\n    const _n=_seen[q.key];\n    const _volMul=_n<2?1:Math.max(0.08,Math.pow(0.5,_n-1));\n    const _pitchMul=_n<2?1:Math.max(0.7,1-(_n-1)*0.05);\n    _playSampleNow(q.key,q.vol*_volMul,q.rate*_pitchMul,_t,q.pan||0);\n    _seen[q.key]++;_cnt++;\n  }\n  _sfxQueue.length=0;\n  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;\n  if(SFX._sbSndCd>0)SFX._sbSndCd--;\n  if(_actx&&_actx.state==='suspended')_resumeAudioCtx(false);\n}",
      "candidateFunction": "function _sfxFrameReset(){\n  _sfxFrameT++;\n  if(_deathSfxCd>0)_deathSfxCd--;\n  if(_hitSfxCd>0)_hitSfxCd--;\n  _mSfxPlaying=0;\n  // 큐에서 프레임당 최대 8개만 실제 재생 (나머지는 다음 프레임)\n  // 단 키 중복 제거 — 같은 소리 여러개면 1개만\n  const _seen={};const _catSeen={};let _cnt=0;\n  const c=actx();const _t=c.currentTime;\n  try{\n  for(let i=0;i<_sfxQueue.length;i++){\n    const q=_sfxQueue[i];\n    if(_activeNodeCnt>=_MAX_ACTIVE_NODES&&!q.pri)continue; // 일반음: 노드 한도 시 스킵\n    if(!q.pri&&_cnt>=_SFX_PER_FRAME)continue; // 우선순위 소리는 프레임 제한 무시\n    const _cat=_sfxCat(q.key);\n    if(!q.pri&&(_catSeen[_cat]||0)>=_SFX_MAX)continue; // 우선순위 소리는 카테고리 제한 무시\n    _catSeen[_cat]=(_catSeen[_cat]||0)+1;\n    if(!_seen[q.key])_seen[q.key]=0;\n    const _n=_seen[q.key];\n    const _volMul=_n<2?1:Math.max(0.08,Math.pow(0.5,_n-1));\n    const _pitchMul=_n<2?1:Math.max(0.7,1-(_n-1)*0.05);\n    _playSampleNow(q.key,q.vol*_volMul,q.rate*_pitchMul,_t,q.pan||0);\n    _seen[q.key]++;_cnt++;\n  }\n  }finally{\n  _sfxQueue.length=0;\n  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;\n  if(SFX._sbSndCd>0)SFX._sbSndCd--;\n  }\n  if(_actx&&_actx.state==='suspended')_resumeAudioCtx(false);\n}",
      "originalSha256": "a1e9ed017b19ea9adb736eaa53ff9f1b9f548db8b14763ed7068854a54705370",
      "candidateSha256": "644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905",
      "edits": [
        {
          "old": "  for(let i=0;i<_sfxQueue.length;i++){",
          "new": "  try{\n  for(let i=0;i<_sfxQueue.length;i++){"
        },
        {
          "old": "  _sfxQueue.length=0;\n  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;\n  if(SFX._sbSndCd>0)SFX._sbSndCd--;",
          "new": "  }finally{\n  _sfxQueue.length=0;\n  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;\n  if(SFX._sbSndCd>0)SFX._sbSndCd--;\n  }"
        }
      ],
      "productionApplied": false
    }
  ],
  "records": [
    {
      "id": "second-start-exception-current",
      "failure": true,
      "memory": false,
      "sourceFiles": [
        "game.html",
        "game-easy-test.html"
      ],
      "status": "PASS",
      "events": [
        {
          "index": 0,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "ghost_laugh",
          "cat": "ghost_laugh"
        },
        {
          "index": 1,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "ghost_laugh",
          "vol": 0.8,
          "rate": 1.3037999999999998,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 2,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 0
        },
        {
          "index": 3,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain0",
          "target": "plain-bus"
        },
        {
          "index": 4,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 0,
          "target": "gain0"
        },
        {
          "index": 5,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 0
        },
        {
          "index": 6,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 0,
          "key": "ghost_laugh",
          "at": 0.1,
          "rate": 1.3037999999999998
        },
        {
          "index": 7,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 0,
          "key": "ghost_laugh"
        },
        {
          "index": 8,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "ghost_laugh",
          "sameSource": true
        },
        {
          "index": 9,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "voice_fixture_second",
          "cat": "g_voice"
        },
        {
          "index": 10,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "voice_fixture_second",
          "vol": 0.4,
          "rate": 1.1856,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 11,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 1
        },
        {
          "index": 12,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain1",
          "target": "plain-bus"
        },
        {
          "index": 13,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 1,
          "target": "gain1"
        },
        {
          "index": 14,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 1
        },
        {
          "index": 15,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 1,
          "key": "voice_fixture_second",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "index": 16,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.throw",
          "id": 1,
          "key": "voice_fixture_second"
        },
        {
          "index": 17,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.disconnect",
          "id": 1
        },
        {
          "index": 18,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.disconnect",
          "id": "gain1"
        },
        {
          "index": 19,
          "phase": "frame1",
          "clockMs": 100,
          "type": "fixture.error",
          "sameError": true,
          "name": "FixtureQueueStartError"
        },
        {
          "index": 20,
          "phase": "frame2",
          "clockMs": 116,
          "type": "category",
          "key": "ghost_laugh",
          "cat": "ghost_laugh"
        },
        {
          "index": 21,
          "phase": "frame2",
          "clockMs": 116,
          "type": "backend.enter",
          "key": "ghost_laugh",
          "vol": 0.8,
          "rate": 1.3037999999999998,
          "startTime": 0.116,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 22,
          "phase": "frame2",
          "clockMs": 116,
          "type": "source.create",
          "id": 2
        },
        {
          "index": 23,
          "phase": "frame2",
          "clockMs": 116,
          "type": "gain.connect",
          "id": "gain2",
          "target": "plain-bus"
        },
        {
          "index": 24,
          "phase": "frame2",
          "clockMs": 116,
          "type": "source.connect",
          "id": 2,
          "target": "gain2"
        },
        {
          "index": 25,
          "phase": "frame2",
          "clockMs": 116,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 2
        },
        {
          "index": 26,
          "phase": "frame2",
          "clockMs": 116,
          "type": "start.attempt",
          "id": 2,
          "key": "ghost_laugh",
          "at": 0.116,
          "rate": 1.3037999999999998
        },
        {
          "index": 27,
          "phase": "frame2",
          "clockMs": 116,
          "type": "start.success",
          "id": 2,
          "key": "ghost_laugh"
        },
        {
          "index": 28,
          "phase": "frame2",
          "clockMs": 116,
          "type": "backend.return",
          "key": "ghost_laugh",
          "sameSource": true
        },
        {
          "index": 29,
          "phase": "frame2",
          "clockMs": 116,
          "type": "category",
          "key": "voice_fixture_second",
          "cat": "g_voice"
        },
        {
          "index": 30,
          "phase": "frame2",
          "clockMs": 116,
          "type": "backend.enter",
          "key": "voice_fixture_second",
          "vol": 0.4,
          "rate": 1.1856,
          "startTime": 0.116,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 31,
          "phase": "frame2",
          "clockMs": 116,
          "type": "source.create",
          "id": 3
        },
        {
          "index": 32,
          "phase": "frame2",
          "clockMs": 116,
          "type": "gain.connect",
          "id": "gain3",
          "target": "plain-bus"
        },
        {
          "index": 33,
          "phase": "frame2",
          "clockMs": 116,
          "type": "source.connect",
          "id": 3,
          "target": "gain3"
        },
        {
          "index": 34,
          "phase": "frame2",
          "clockMs": 116,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 3
        },
        {
          "index": 35,
          "phase": "frame2",
          "clockMs": 116,
          "type": "start.attempt",
          "id": 3,
          "key": "voice_fixture_second",
          "at": 0.116,
          "rate": 1.1856
        },
        {
          "index": 36,
          "phase": "frame2",
          "clockMs": 116,
          "type": "start.success",
          "id": 3,
          "key": "voice_fixture_second"
        },
        {
          "index": 37,
          "phase": "frame2",
          "clockMs": 116,
          "type": "backend.return",
          "key": "voice_fixture_second",
          "sameSource": true
        },
        {
          "index": 38,
          "phase": "frame2",
          "clockMs": 116,
          "type": "category",
          "key": "voice_fixture_tail",
          "cat": "g_voice"
        },
        {
          "index": 39,
          "phase": "frame2",
          "clockMs": 116,
          "type": "backend.enter",
          "key": "voice_fixture_tail",
          "vol": 0.3,
          "rate": 1.1280000000000001,
          "startTime": 0.116,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 40,
          "phase": "frame2",
          "clockMs": 116,
          "type": "source.create",
          "id": 4
        },
        {
          "index": 41,
          "phase": "frame2",
          "clockMs": 116,
          "type": "gain.connect",
          "id": "gain4",
          "target": "plain-bus"
        },
        {
          "index": 42,
          "phase": "frame2",
          "clockMs": 116,
          "type": "source.connect",
          "id": 4,
          "target": "gain4"
        },
        {
          "index": 43,
          "phase": "frame2",
          "clockMs": 116,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 4
        },
        {
          "index": 44,
          "phase": "frame2",
          "clockMs": 116,
          "type": "start.attempt",
          "id": 4,
          "key": "voice_fixture_tail",
          "at": 0.116,
          "rate": 1.1280000000000001
        },
        {
          "index": 45,
          "phase": "frame2",
          "clockMs": 116,
          "type": "start.success",
          "id": 4,
          "key": "voice_fixture_tail"
        },
        {
          "index": 46,
          "phase": "frame2",
          "clockMs": 116,
          "type": "backend.return",
          "key": "voice_fixture_tail",
          "sameSource": true
        },
        {
          "index": 47,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 0
        },
        {
          "index": 48,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain0"
        },
        {
          "index": 49,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 2
        },
        {
          "index": 50,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain2"
        },
        {
          "index": 51,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 3
        },
        {
          "index": 52,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain3"
        },
        {
          "index": 53,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 4
        },
        {
          "index": 54,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain4"
        }
      ],
      "rngTrace": [
        {
          "index": 0,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.25
        },
        {
          "index": 1,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.75
        },
        {
          "index": 2,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.5
        },
        {
          "index": 3,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.125
        },
        {
          "index": 4,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.625
        },
        {
          "index": 5,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.875
        }
      ],
      "before": {
        "frameT": 0,
        "activeCount": 0,
        "nodes": [],
        "queue": [
          {
            "key": "ghost_laugh",
            "vol": 0.8,
            "rate": 1.3037999999999998,
            "pri": 1
          },
          {
            "key": "voice_fixture_second",
            "vol": 0.4,
            "rate": 1.1856
          },
          {
            "key": "voice_fixture_tail",
            "vol": 0.3,
            "rate": 1.1280000000000001
          }
        ],
        "frameCounts": {
          "ghost_laugh": 2,
          "g_voice": 5
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 2,
        "hitCd": 3,
        "mPlaying": 7,
        "sbCd": 3
      },
      "frame1Error": {
        "threw": true,
        "sameError": true,
        "name": "FixtureQueueStartError",
        "message": "synthetic second queued sample start failure"
      },
      "afterFrame1": {
        "frameT": 1,
        "activeCount": 1,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          }
        ],
        "queue": [
          {
            "key": "ghost_laugh",
            "vol": 0.8,
            "rate": 1.3037999999999998,
            "pri": 1
          },
          {
            "key": "voice_fixture_second",
            "vol": 0.4,
            "rate": 1.1856
          },
          {
            "key": "voice_fixture_tail",
            "vol": 0.3,
            "rate": 1.1280000000000001
          }
        ],
        "frameCounts": {
          "ghost_laugh": 2,
          "g_voice": 5
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 1,
        "hitCd": 2,
        "mPlaying": 0,
        "sbCd": 3
      },
      "frame2Error": {
        "threw": false,
        "sameError": false
      },
      "afterFrame2": {
        "frameT": 2,
        "activeCount": 4,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          },
          {
            "key": "ghost_laugh",
            "pri": 9
          },
          {
            "key": "voice_fixture_second",
            "pri": 9
          },
          {
            "key": "voice_fixture_tail",
            "pri": 9
          }
        ],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 2
      },
      "frame1Successes": [
        "ghost_laugh"
      ],
      "frame2Successes": [
        "ghost_laugh",
        "voice_fixture_second",
        "voice_fixture_tail"
      ],
      "firstSuccessReplay": true,
      "desiredNoReplay": false,
      "callerRng": 3,
      "pitchRng": 3,
      "categoryAndPriority": [
        {
          "key": "ghost_laugh",
          "category": "ghost_laugh",
          "priority": 9,
          "queuePri": 1
        },
        {
          "key": "voice_fixture_second",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        },
        {
          "key": "voice_fixture_tail",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        }
      ],
      "afterCallbacks": {
        "frameT": 2,
        "activeCount": 0,
        "nodes": [],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 2
      },
      "stopCalls": 0,
      "createdNodes": 5,
      "timerCount": 5
    },
    {
      "id": "second-start-exception-memory",
      "failure": true,
      "memory": true,
      "sourceFiles": [
        "game.html",
        "game-easy-test.html"
      ],
      "status": "PASS",
      "events": [
        {
          "index": 0,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "ghost_laugh",
          "cat": "ghost_laugh"
        },
        {
          "index": 1,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "ghost_laugh",
          "vol": 0.8,
          "rate": 1.3037999999999998,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 2,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 0
        },
        {
          "index": 3,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain0",
          "target": "plain-bus"
        },
        {
          "index": 4,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 0,
          "target": "gain0"
        },
        {
          "index": 5,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 0
        },
        {
          "index": 6,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 0,
          "key": "ghost_laugh",
          "at": 0.1,
          "rate": 1.3037999999999998
        },
        {
          "index": 7,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 0,
          "key": "ghost_laugh"
        },
        {
          "index": 8,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "ghost_laugh",
          "sameSource": true
        },
        {
          "index": 9,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "voice_fixture_second",
          "cat": "g_voice"
        },
        {
          "index": 10,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "voice_fixture_second",
          "vol": 0.4,
          "rate": 1.1856,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 11,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 1
        },
        {
          "index": 12,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain1",
          "target": "plain-bus"
        },
        {
          "index": 13,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 1,
          "target": "gain1"
        },
        {
          "index": 14,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 1
        },
        {
          "index": 15,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 1,
          "key": "voice_fixture_second",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "index": 16,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.throw",
          "id": 1,
          "key": "voice_fixture_second"
        },
        {
          "index": 17,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.disconnect",
          "id": 1
        },
        {
          "index": 18,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.disconnect",
          "id": "gain1"
        },
        {
          "index": 19,
          "phase": "frame1",
          "clockMs": 100,
          "type": "fixture.error",
          "sameError": true,
          "name": "FixtureQueueStartError"
        },
        {
          "index": 20,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 0
        },
        {
          "index": 21,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain0"
        }
      ],
      "rngTrace": [
        {
          "index": 0,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.25
        },
        {
          "index": 1,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.75
        },
        {
          "index": 2,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.5
        },
        {
          "index": 3,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.125
        },
        {
          "index": 4,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.625
        },
        {
          "index": 5,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.875
        }
      ],
      "before": {
        "frameT": 0,
        "activeCount": 0,
        "nodes": [],
        "queue": [
          {
            "key": "ghost_laugh",
            "vol": 0.8,
            "rate": 1.3037999999999998,
            "pri": 1
          },
          {
            "key": "voice_fixture_second",
            "vol": 0.4,
            "rate": 1.1856
          },
          {
            "key": "voice_fixture_tail",
            "vol": 0.3,
            "rate": 1.1280000000000001
          }
        ],
        "frameCounts": {
          "ghost_laugh": 2,
          "g_voice": 5
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 2,
        "hitCd": 3,
        "mPlaying": 7,
        "sbCd": 3
      },
      "frame1Error": {
        "threw": true,
        "sameError": true,
        "name": "FixtureQueueStartError",
        "message": "synthetic second queued sample start failure"
      },
      "afterFrame1": {
        "frameT": 1,
        "activeCount": 1,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          }
        ],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 1,
        "hitCd": 2,
        "mPlaying": 0,
        "sbCd": 2
      },
      "frame2Error": {
        "threw": false,
        "sameError": false
      },
      "afterFrame2": {
        "frameT": 2,
        "activeCount": 1,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          }
        ],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 1
      },
      "frame1Successes": [
        "ghost_laugh"
      ],
      "frame2Successes": [],
      "firstSuccessReplay": false,
      "desiredNoReplay": true,
      "callerRng": 3,
      "pitchRng": 3,
      "categoryAndPriority": [
        {
          "key": "ghost_laugh",
          "category": "ghost_laugh",
          "priority": 9,
          "queuePri": 1
        },
        {
          "key": "voice_fixture_second",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        },
        {
          "key": "voice_fixture_tail",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        }
      ],
      "afterCallbacks": {
        "frameT": 2,
        "activeCount": 0,
        "nodes": [],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 1
      },
      "stopCalls": 0,
      "createdNodes": 2,
      "timerCount": 2
    },
    {
      "id": "normal-three-queue-current",
      "failure": false,
      "memory": false,
      "sourceFiles": [
        "game.html",
        "game-easy-test.html"
      ],
      "status": "PASS",
      "events": [
        {
          "index": 0,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "ghost_laugh",
          "cat": "ghost_laugh"
        },
        {
          "index": 1,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "ghost_laugh",
          "vol": 0.8,
          "rate": 1.3037999999999998,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 2,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 0
        },
        {
          "index": 3,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain0",
          "target": "plain-bus"
        },
        {
          "index": 4,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 0,
          "target": "gain0"
        },
        {
          "index": 5,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 0
        },
        {
          "index": 6,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 0,
          "key": "ghost_laugh",
          "at": 0.1,
          "rate": 1.3037999999999998
        },
        {
          "index": 7,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 0,
          "key": "ghost_laugh"
        },
        {
          "index": 8,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "ghost_laugh",
          "sameSource": true
        },
        {
          "index": 9,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "voice_fixture_second",
          "cat": "g_voice"
        },
        {
          "index": 10,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "voice_fixture_second",
          "vol": 0.4,
          "rate": 1.1856,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 11,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 1
        },
        {
          "index": 12,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain1",
          "target": "plain-bus"
        },
        {
          "index": 13,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 1,
          "target": "gain1"
        },
        {
          "index": 14,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 1
        },
        {
          "index": 15,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 1,
          "key": "voice_fixture_second",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "index": 16,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 1,
          "key": "voice_fixture_second"
        },
        {
          "index": 17,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "voice_fixture_second",
          "sameSource": true
        },
        {
          "index": 18,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "voice_fixture_tail",
          "cat": "g_voice"
        },
        {
          "index": 19,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "voice_fixture_tail",
          "vol": 0.3,
          "rate": 1.1280000000000001,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 20,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 2
        },
        {
          "index": 21,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain2",
          "target": "plain-bus"
        },
        {
          "index": 22,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 2,
          "target": "gain2"
        },
        {
          "index": 23,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 2
        },
        {
          "index": 24,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 2,
          "key": "voice_fixture_tail",
          "at": 0.1,
          "rate": 1.1280000000000001
        },
        {
          "index": 25,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 2,
          "key": "voice_fixture_tail"
        },
        {
          "index": 26,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "voice_fixture_tail",
          "sameSource": true
        },
        {
          "index": 27,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 0
        },
        {
          "index": 28,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain0"
        },
        {
          "index": 29,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 1
        },
        {
          "index": 30,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain1"
        },
        {
          "index": 31,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 2
        },
        {
          "index": 32,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain2"
        }
      ],
      "rngTrace": [
        {
          "index": 0,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.25
        },
        {
          "index": 1,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.75
        },
        {
          "index": 2,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.5
        },
        {
          "index": 3,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.125
        },
        {
          "index": 4,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.625
        },
        {
          "index": 5,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.875
        }
      ],
      "before": {
        "frameT": 0,
        "activeCount": 0,
        "nodes": [],
        "queue": [
          {
            "key": "ghost_laugh",
            "vol": 0.8,
            "rate": 1.3037999999999998,
            "pri": 1
          },
          {
            "key": "voice_fixture_second",
            "vol": 0.4,
            "rate": 1.1856
          },
          {
            "key": "voice_fixture_tail",
            "vol": 0.3,
            "rate": 1.1280000000000001
          }
        ],
        "frameCounts": {
          "ghost_laugh": 2,
          "g_voice": 5
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 2,
        "hitCd": 3,
        "mPlaying": 7,
        "sbCd": 3
      },
      "frame1Error": {
        "threw": false,
        "sameError": false
      },
      "afterFrame1": {
        "frameT": 1,
        "activeCount": 3,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          },
          {
            "key": "voice_fixture_second",
            "pri": 9
          },
          {
            "key": "voice_fixture_tail",
            "pri": 9
          }
        ],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 1,
        "hitCd": 2,
        "mPlaying": 0,
        "sbCd": 2
      },
      "frame2Error": {
        "threw": false,
        "sameError": false
      },
      "afterFrame2": {
        "frameT": 2,
        "activeCount": 3,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          },
          {
            "key": "voice_fixture_second",
            "pri": 9
          },
          {
            "key": "voice_fixture_tail",
            "pri": 9
          }
        ],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 1
      },
      "frame1Successes": [
        "ghost_laugh",
        "voice_fixture_second",
        "voice_fixture_tail"
      ],
      "frame2Successes": [],
      "firstSuccessReplay": false,
      "desiredNoReplay": true,
      "callerRng": 3,
      "pitchRng": 3,
      "categoryAndPriority": [
        {
          "key": "ghost_laugh",
          "category": "ghost_laugh",
          "priority": 9,
          "queuePri": 1
        },
        {
          "key": "voice_fixture_second",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        },
        {
          "key": "voice_fixture_tail",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        }
      ],
      "afterCallbacks": {
        "frameT": 2,
        "activeCount": 0,
        "nodes": [],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 1
      },
      "stopCalls": 0,
      "createdNodes": 3,
      "timerCount": 3
    },
    {
      "id": "normal-three-queue-memory",
      "failure": false,
      "memory": true,
      "sourceFiles": [
        "game.html",
        "game-easy-test.html"
      ],
      "status": "PASS",
      "events": [
        {
          "index": 0,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "ghost_laugh",
          "cat": "ghost_laugh"
        },
        {
          "index": 1,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "ghost_laugh",
          "vol": 0.8,
          "rate": 1.3037999999999998,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 2,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 0
        },
        {
          "index": 3,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain0",
          "target": "plain-bus"
        },
        {
          "index": 4,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 0,
          "target": "gain0"
        },
        {
          "index": 5,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 0
        },
        {
          "index": 6,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 0,
          "key": "ghost_laugh",
          "at": 0.1,
          "rate": 1.3037999999999998
        },
        {
          "index": 7,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 0,
          "key": "ghost_laugh"
        },
        {
          "index": 8,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "ghost_laugh",
          "sameSource": true
        },
        {
          "index": 9,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "voice_fixture_second",
          "cat": "g_voice"
        },
        {
          "index": 10,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "voice_fixture_second",
          "vol": 0.4,
          "rate": 1.1856,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 11,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 1
        },
        {
          "index": 12,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain1",
          "target": "plain-bus"
        },
        {
          "index": 13,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 1,
          "target": "gain1"
        },
        {
          "index": 14,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 1
        },
        {
          "index": 15,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 1,
          "key": "voice_fixture_second",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "index": 16,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 1,
          "key": "voice_fixture_second"
        },
        {
          "index": 17,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "voice_fixture_second",
          "sameSource": true
        },
        {
          "index": 18,
          "phase": "frame1",
          "clockMs": 100,
          "type": "category",
          "key": "voice_fixture_tail",
          "cat": "g_voice"
        },
        {
          "index": 19,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.enter",
          "key": "voice_fixture_tail",
          "vol": 0.3,
          "rate": 1.1280000000000001,
          "startTime": 0.1,
          "pan": 0,
          "priOverride": null,
          "priority": 9
        },
        {
          "index": 20,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.create",
          "id": 2
        },
        {
          "index": 21,
          "phase": "frame1",
          "clockMs": 100,
          "type": "gain.connect",
          "id": "gain2",
          "target": "plain-bus"
        },
        {
          "index": 22,
          "phase": "frame1",
          "clockMs": 100,
          "type": "source.connect",
          "id": 2,
          "target": "gain2"
        },
        {
          "index": 23,
          "phase": "frame1",
          "clockMs": 100,
          "type": "timer.schedule",
          "delay": 700,
          "nodeId": 2
        },
        {
          "index": 24,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.attempt",
          "id": 2,
          "key": "voice_fixture_tail",
          "at": 0.1,
          "rate": 1.1280000000000001
        },
        {
          "index": 25,
          "phase": "frame1",
          "clockMs": 100,
          "type": "start.success",
          "id": 2,
          "key": "voice_fixture_tail"
        },
        {
          "index": 26,
          "phase": "frame1",
          "clockMs": 100,
          "type": "backend.return",
          "key": "voice_fixture_tail",
          "sameSource": true
        },
        {
          "index": 27,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 0
        },
        {
          "index": 28,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain0"
        },
        {
          "index": 29,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 1
        },
        {
          "index": 30,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain1"
        },
        {
          "index": 31,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "source.disconnect",
          "id": 2
        },
        {
          "index": 32,
          "phase": "held-callback-reclaim",
          "clockMs": 800,
          "type": "gain.disconnect",
          "id": "gain2"
        }
      ],
      "rngTrace": [
        {
          "index": 0,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.25
        },
        {
          "index": 1,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.75
        },
        {
          "index": 2,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.5
        },
        {
          "index": 3,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.125
        },
        {
          "index": 4,
          "phase": "enqueue",
          "origin": "caller_r",
          "value": 0.625
        },
        {
          "index": 5,
          "phase": "enqueue",
          "origin": "playSample_pitch",
          "value": 0.875
        }
      ],
      "before": {
        "frameT": 0,
        "activeCount": 0,
        "nodes": [],
        "queue": [
          {
            "key": "ghost_laugh",
            "vol": 0.8,
            "rate": 1.3037999999999998,
            "pri": 1
          },
          {
            "key": "voice_fixture_second",
            "vol": 0.4,
            "rate": 1.1856
          },
          {
            "key": "voice_fixture_tail",
            "vol": 0.3,
            "rate": 1.1280000000000001
          }
        ],
        "frameCounts": {
          "ghost_laugh": 2,
          "g_voice": 5
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 2,
        "hitCd": 3,
        "mPlaying": 7,
        "sbCd": 3
      },
      "frame1Error": {
        "threw": false,
        "sameError": false
      },
      "afterFrame1": {
        "frameT": 1,
        "activeCount": 3,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          },
          {
            "key": "voice_fixture_second",
            "pri": 9
          },
          {
            "key": "voice_fixture_tail",
            "pri": 9
          }
        ],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 1,
        "hitCd": 2,
        "mPlaying": 0,
        "sbCd": 2
      },
      "frame2Error": {
        "threw": false,
        "sameError": false
      },
      "afterFrame2": {
        "frameT": 2,
        "activeCount": 3,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          },
          {
            "key": "voice_fixture_second",
            "pri": 9
          },
          {
            "key": "voice_fixture_tail",
            "pri": 9
          }
        ],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 1
      },
      "frame1Successes": [
        "ghost_laugh",
        "voice_fixture_second",
        "voice_fixture_tail"
      ],
      "frame2Successes": [],
      "firstSuccessReplay": false,
      "desiredNoReplay": true,
      "callerRng": 3,
      "pitchRng": 3,
      "categoryAndPriority": [
        {
          "key": "ghost_laugh",
          "category": "ghost_laugh",
          "priority": 9,
          "queuePri": 1
        },
        {
          "key": "voice_fixture_second",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        },
        {
          "key": "voice_fixture_tail",
          "category": "g_voice",
          "priority": 9,
          "queuePri": 0
        }
      ],
      "afterCallbacks": {
        "frameT": 2,
        "activeCount": 0,
        "nodes": [],
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0,
          "g_voice": 0
        },
        "lastT": {
          "voice_fixture_second": 100,
          "voice_fixture_tail": 100
        },
        "deathCd": 0,
        "hitCd": 1,
        "mPlaying": 0,
        "sbCd": 1
      },
      "stopCalls": 0,
      "createdNodes": 3,
      "timerCount": 3
    }
  ],
  "comparisons": [
    {
      "files": [
        "game.html",
        "game-easy-test.html"
      ],
      "status": "PASS",
      "normalFullTraceEqual": true,
      "sameErrorAndRngPreserved": true,
      "currentRedMemoryGreen": true
    }
  ],
  "preservation": [
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-frame-queue-exception-finalization-hb1014/TASK.md",
      "before": "68b4aa14b939108847a7a35c8dc8abd692d3e4f24423e8faa623de71692b3ad4",
      "after": "68b4aa14b939108847a7a35c8dc8abd692d3e4f24423e8faa623de71692b3ad4"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
      "before": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "after": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/AGENTS.md",
      "before": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "after": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "before": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "after": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md",
      "before": "16cbe4b9d0c9d0e0e8cabc1ac8d4f7718f78b4e013b6e5cb169e5bb6d397be6d",
      "after": "16cbe4b9d0c9d0e0e8cabc1ac8d4f7718f78b4e013b6e5cb169e5bb6d397be6d"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/6사운드디자인.md",
      "before": "0eeff22b671e41ae3c079e489678d2ef40b0ca35c92ddc1a95fc4e3433ded65d",
      "after": "0eeff22b671e41ae3c079e489678d2ef40b0ca35c92ddc1a95fc4e3433ded65d"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md",
      "before": "2548092228e1a6702d9285ffb0676683d997ca3017338198f5c61f21d7e0c450",
      "after": "2548092228e1a6702d9285ffb0676683d997ca3017338198f5c61f21d7e0c450"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/TASK.md",
      "before": "4f8031b604769963983729b0ec49c32d207b20fa43b30281998e8286897f01d2",
      "after": "4f8031b604769963983729b0ec49c32d207b20fa43b30281998e8286897f01d2"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/result.md",
      "before": "e8610674b4136cb2feb8d6d6f92a9976eade78414b167be135e47a5fbc44c66b",
      "after": "e8610674b4136cb2feb8d6d6f92a9976eade78414b167be135e47a5fbc44c66b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "before": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "after": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
      "before": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "after": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md",
      "before": "ff30d8abec2d2be0a374ed3649cf03c8478c2dbda073708be98614f9cbb0bab9",
      "after": "ff30d8abec2d2be0a374ed3649cf03c8478c2dbda073708be98614f9cbb0bab9"
    }
  ],
  "anchors": [
    {
      "file": "game.html",
      "wholeBefore": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "wholeAfter": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "ownedAnchorsPreserved": true
    },
    {
      "file": "game-easy-test.html",
      "wholeBefore": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "wholeAfter": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "ownedAnchorsPreserved": true
    }
  ],
  "immutablePreserved": true,
  "currentHead": null,
  "currentChanges": null,
  "parentProvidedHistoricalCommit": "6b865637",
  "docsSearch": {
    "at": "2026-10-02T10:39:35.802Z",
    "command": [
      "rg",
      "-n",
      "ghost_laugh|_sfxFrameReset|_playSampleNow|_sfxQueue|_sfxFrameCnt|_sbSndCd|failed flush|큐 부모 실패|큐 실패",
      "docs/"
    ],
    "exitCode": 0,
    "lines": 26,
    "fileCount": 13,
    "files": [
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/CHANGELOG_SYNC.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/6사운드디자인.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/12퍼포먼스·최적화/코드전수조사_디버그_최적화_2026-09-03.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/GAMEPLAY_TRAILER_20260909_PRODUCTION.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/INTEGRATION-REVIEW-20261002.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.json",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-WORK-DISPATCH-20261002.json",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md",
      "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md"
    ],
    "outputSha256": "fe7885055b4d5cdb63cf24d17d7188fa9672325765c50d4a5a3c2c5741879271",
    "matchedLines": [
      "docs/CHANGELOG_SYNC.md:52134:양판 `_playSampleNow`의 `src.start(startTime||0)` 한 접점을 `try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}`로 교체했다(각 +33바이트, 원 접점24→57바이트). 시작 실패 시 등록된 노드/카운터를 즉시 회수하고 동일 Error 객체를 재전달한다. 기존 실패도 timeout 뒤 회수되므로 영구 누수로 설명하지 않는다. 기존 `_dn` 회계 guard·공유 disconnect catch·`_dnP`의 반복 panner disconnect 시도·`(_dur+.5)*1000`(`_dur=buf.duration||2`) 예약은 유지한다. queue/dedup/RNG/우선순위/상한/정상 반환 정책 변경0이다.\r",
      "docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md:3:`_playSampleNow`의 `src.start(startTime||0)` 접점만 양판 생산에 반영했다. 수정 전에는 start의 동기 throw 뒤 등록 카운터/노드가 예약 정리까지 남았다. duration 0.2초 대역의 예약은 700ms이며, 콜백을 수동 실행하면 회수되므로 **영구 누수로 판정하지 않는다**.",
      "docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md:16:| 정상/dispatcher | 정상 src 반환·trace·gain/rate·timer/onended 흐름 유지. 실패가 `_sfxFrameReset`로 전달되면 큐 clear에 도달하지 않아 fixture queue 1 유지. 큐 실패 처리 변경·인수는 별도 |",
      "docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md:17:| 정책/수치 | 우선순위·전체/프레임/카테고리/PROJ/HIT/STEP 상한·30ms dedup·큐·음원·호출부 변경 0. fixture ghost_laugh backend pri 9/queued pri 0, gain .8/rate1.1856/caller+pitch RNG 2는 이 입력의 source 결과이며 전 호출/가청 보장 아님 |",
      "docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md:21:| game.html | `068808244450ce2a7dc9fbb7ba7b7186dd295224dd4072a3d2402acd90ba8bc3` | `_playSampleNow` 11800, start catch 11837 |",
      "docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md:22:| game-easy-test.html | `482ec94f53ba88639e09e113cf1fa15eba98567f6197d2cf88b399e86649bd27` | `_playSampleNow` 11204, start catch 11241 |",
      "docs/6사운드디자인/6사운드디자인.md:329:`playSampleAt`/`_playSampleNow`에 6번째 인자 `priOverride` 추가. 미전달 시 기존 `_sfxPri(key)`와 동일(하위호환). 특정 호출부가 키의 기본 우선순위를 무시하고 캡을 적용받게 함.",
      "docs/6사운드디자인/6사운드디자인.md:347:| 미준비 SFX | `_playSampleNow()`의 기존 lazy load/무음 폴백 유지. 게임 로직·입력·전투 진행을 막지 않음 |",
      "docs/6사운드디자인/6사운드디자인.md:828:양판 `_playSampleNow`의 start 접점에 `try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}`를 반영했다. 우선순위/폴리포니 정책의 새 채택이 아닌 이 동기 실패 source 경계만의 인수다.",
      "docs/6사운드디자인/6사운드디자인.md:835:| 정상/부모 실패 | 정상 source 반환/trace 유지. failed flush가 큐 clear 전 throw하여 fixture queue1 유지; 큐 부모 실패 처리는 별도 |",
      "docs/12퍼포먼스·최적화/CLAUDE_CODE_인수인계_전체작업보고서_2026-08-10.md:420:**최소수정(behavior-preserving, 사용자 승인)**: `playSampleAt`/`_playSampleNow`에 옵셔널 `priOverride` 추가(미전달=기존 동작, 하위호환). 두 히트음 호출부에 `_SFX_PRI.PROJ` 전달 → 탄막 히트음답게 동시 5개 캡. `playSampleAt` 반환값 미사용이라 **게임플레이 상태 완전 불변**(투사체 수/궤적/데미지/hit timing/충돌). 상세: `docs/6사운드디자인/6사운드디자인.md` \"우선순위 오버라이드(2026-08-13)\".",
      "docs/12퍼포먼스·최적화/코드전수조사_디버그_최적화_2026-09-03.md:24:| `AUD-AUDIO-RESUME-01` | `game.html` 오디오 컨텍스트 제어부, `_sfxFrameReset()` | 최초 사용자 입력 전 Chromium autoplay 경고가 프레임마다 반복 | `suspended` 컨텍스트에 대해 매 프레임 직접 `AudioContext.resume()` 호출 | 최초 unlock은 사용자 제스처에서만 허용하고, unlock 이후 복구만 프레임 경로에서 허용. `_actxResumePending`으로 진행 중 Promise를 1개로 합침 | `test/audioContextResumeGate.test.js` 2/2 PASS, 브라우저 스모크에서 동일 autoplay 경고 0건 |",
      "docs/13출시·마케팅/GAMEPLAY_TRAILER_20260909_PRODUCTION.md:77:| SFX | 기존 fire_magic2 / slam heavy_hit / ice_storm / death_ice_shatter / ghost_laugh / hit heavy_hit. 12개 배치, 타임라인·레벨·길이는 편집 스크립트와 edit_report.json에 기록 |",
      "docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md:62:| 노드 카운터 | `_activeNodeCnt` — `_playSampleNow` start 시 +1, `onended` 시 -1 | 동일 |",
      "docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md:71:| 사용자 제스처 전 `suspended` 상태 | `_sfxFrameReset()`이 매 프레임 `resume()` 호출 | 자동 resume를 건너뜀 |",
      "docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md:998:기존 AudioContext 표의 “_playSampleNow start시+1/onended시-1” 설명을 아래 정확한 등록·회수 순서로 보강한다. 상한과 swap-remove 정책은 유지한다.",
      "docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md:1006:| 정상·정책 | 정상 return/trace·48/16/6/3 및 기타 상한·우선순위·큐·dedup·RNG 유지. failed flush queue1는 별도 미수정 경계 |",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/INTEGRATION-REVIEW-20261002.md:24:| 처음 r0/t0 유골 등록, 유골함 미보유 | 42 | ghost_laugh 1 | 1 | mkItem 전체41(직접37+rollAffixes4), 등록 피치 _r1. 고정 유골함 실제 필드·스탯·소켓·어픽스 검증 |",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/INTEGRATION-REVIEW-20261002.md:25:| 유골함 장착 또는 가방 보유, 신규 등록 | 1 | ghost_laugh 1 | 1 | mkItem0, 가방 보유품 자동장착0, r0/t0 등록 유효 |",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/INTEGRATION-REVIEW-20261002.md:29:| 4번째 부위 r0/t0 등록 | 1 | ghost_laugh 1 | 1 | 실제 4부위 해금 조건·알림·shake2 호출 |",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/INTEGRATION-REVIEW-20261002.md:58:코드 산출 후 docs 전체에서 `mkItem|_grantOssuaryIfNeeded|_boneRegister|bonePart|ghost_laugh|playItemPickupSfx|atomicSaveJSON|_sharedMats|공유 악의|If-None-Match`를 rg 검색했다. 이 문서 작성 전121행/46문서이며 원자료는 `docs-keywords.txt`다. 생산 수치·계약 변경0이므로 관련 SSOT 원문을 수정하지 않고 검수 상태/한계만 이 소유 문서로 root에 인계한다.",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md:59:감독이 인계한 `SOUND-start-failure-0543` 최소 후보를 현재 `226348940a4dc91a87301aac88219dfadc0621a9` 이후 source로 인수했다. 양판 원 `_playSampleNow` 함수SHA는 기존 제출의 `9b0733ee9355782ea98e0e959eafec27e04544b850c8b33eb0c076d1b2459e4a`와 동일했고, 이번 검수는 양판을 각각 실행하며 panned 경계도 포함한다. 기존 담당 checks는 재실행하지 않았다.",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.json:147:      \"subject\": \"ghost_laugh 실제 backend 포화 경계\",",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-WORK-DISPATCH-20261002.json:188:            \"command\": \"/bin/zsh -lc \\\"rg -n -i '유골.*(SFX|사운드|효과음|습득음|획득음)|bone.*pickup|bone.*sfx|mkitem-sideeffects|ghost_laugh' tools/team-followup-20261001/SOUND docs/6사운드디자인 docs/0마스터플랜/mac-resume-20261001/vscode-dispatch tools/team-followup-20261002/project-teams/SOUND/task.md\\\"\",",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md:15:| SOUND | Codex | ghost_laugh 실제 backend 포화 경계 | `tools/team-followup-20261002/continuous/SOUND/TASK.md` | read_confirmed_in_progress |",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md:12:| Codex | 사운드 | EXODUSER 사운드팀 / 01a0faaf-956a-74a3-9bf1-77032f124e2d | ghost_laugh 큐 포화·dedup/RNG | TASK 실제 읽기·진행 관찰 |"
    ],
    "writes": 0
  },
  "actualSource": [
    "_sfxFrameReset",
    "_playSampleNow",
    "_r",
    "playSample",
    "_evictLowest",
    "_sfxPri",
    "_sfxCat",
    "_isFootstepSfx",
    "_isSkillSfx",
    "backend internal _dn"
  ],
  "stubs": [
    "prepared buffer objects duration0.2",
    "WebAudio source/gain/bus plain recorders",
    "src.start second queued key throws original Error once only",
    "held700ms timers/manual onended",
    "identity voice mapping",
    "currentTime/performance100/116ms",
    "deterministic counted Math.random"
  ],
  "limits": [
    "normal/control covers three distinct keys with g_voice category pair and queue pri1/0/0, no mobile/saturation/repeated-key-volume scaling expansion",
    "actx setup before dispatch try unchanged; failures before loop are not covered",
    "resume remains after finally and is skipped on propagating backend exception; no suspended-context test",
    "candidate discards unprocessed third queue entry along with batch; it does not retry failed or remaining audio",
    "real device failure/audio listening/native/game/package not accepted"
  ],
  "tools": {
    "actual": [
      "functions.exec",
      "exec_command",
      "apply_patch",
      "Node fs/vm/crypto",
      "acorn",
      "rg"
    ],
    "skills": [],
    "externalAPI": [],
    "MCP": []
  },
  "prohibited": {
    "productionWrites": 0,
    "sharedDocsWrites": 0,
    "outsideOwnedWrites": 0,
    "Git": 0,
    "server": 0,
    "HTTP": 0,
    "game": 0,
    "UI": 0,
    "build": 0,
    "audioDevice": 0,
    "realAudioContext": 0,
    "realTimer": 0,
    "fetch": 0,
    "decode": 0,
    "image": 0,
    "saves": 0,
    "installation": 0,
    "publishing": 0,
    "newChat": 0,
    "newTeam": 0,
    "subagent": 0,
    "messages": 0,
    "deletion": 0,
    "moving": 0,
    "cleanup": 0
  },
  "reportOnlyFinalization": {
    "at": "2026-10-02T10:40:35.343Z",
    "reason": "one docs search revealed additional performance canonical; read and add exact old/new handoff",
    "fixtureReruns": 0,
    "additionalDocsSearches": 0,
    "changedChecksSections": "report template only; source fixture unchanged",
    "executedChecksSha256": "ff3f71ca4cc9e9ad8d3efe5aaf440d694712889b9e2b605e2bdd96529c2aa40c",
    "currentChecksSha256": "e8f5343070be53d64f130a1bbb9f17d615b0cbfb42c540a5de43138eb4b33fa5"
  }
}
```

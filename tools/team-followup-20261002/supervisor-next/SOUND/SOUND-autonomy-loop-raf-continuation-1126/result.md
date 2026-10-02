# SOUND actual loop → RAF source Gate

Task: SOUND-autonomy-loop-raf-continuation-1126

## Decision

SOURCE_GATE_CONFIRMED_NO_RAF_RECOVERY. Full actual no-argument game _startLoop, loop, actx, dispatcher and backend extracted from both HTML sources; constructor exception preserves Error identity but no following RAF is scheduled. Memory-only flush finally expansion clears queue/frame counters and decrements positive cooldown without restoring RAF. _looping stays true, so calling actual _startLoop again cannot restart. No loop recovery, exception swallowing, priority change or production fix adopted.

## Evidence

| Item | Result |
|---|---|
| Actual source groups | 2 (whole loop bodies differ) |
| Executions | 8/8 PASS; exit 0 |
| Normal controls | Exact event trace, RNG and state equal in each group |
| Failure | same Error; pending RAF 0; _looping true; restart guard blocks |
| Production preservation | Full source hashes unchanged across execution |
| Native / visible gameplay / listening | Not executed |
| Previous tests rerun | 0 |

Initial harness extraction selected the earlier audio helper named _startLoop; 8 assertions failed. Extraction was corrected to exact no-argument game-driver signature. That failed execution and corrected stdout are preserved below. The correction was followed by one execution, not repeated after PASS.

## Ownership and capacity

Saved only checks.mjs and result.md in this new SOUND folder, under capacity-after-8c317a73-1134 (STATE read: Changes 68, allowNewOwnedFiles true; role budget 1 iteration / 2 files). Test ran earlier entirely in memory under the previous Changes 94 hold. No rerun during saving. No production/shared-docs/Git/game/audio/session modifications.

Root owns production application and docs synchronization. Current docs explicitly identify RAF recovery as not adopted: SOUND_FRAME_QUEUE_EXCEPTION_FINALIZATION_20261002.md, sound bible, performance bible. Read-only rg performed for _sfxFrameReset/_startLoop/RAF/requestAnimationFrame/constructor in those two docs areas; no production code changed in this task.

## Executed command

Working directory: /Users/fordeargamers/Projects/exoduser-migration-20261001

The saved checks.mjs bytes are the corrected module passed verbatim through this command's heredoc:

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'SOUND_FIXTURE'
[exact checks.mjs contents]
SOUND_FIXTURE
```

Started 2026-10-02T11:29:30.938Z; completed 2026-10-02T11:29:31.086Z; exit 0; tool chunk bae301.

## Corrected execution stdout (verbatim)

```json
{
  "taskId": "SOUND-autonomy-loop-raf-continuation-1126",
  "status": "SOURCE_GATE_CONFIRMED_NO_RAF_RECOVERY",
  "execution": {
    "startedAt": "2026-10-02T11:29:30.938Z",
    "completedAt": "2026-10-02T11:29:31.086Z",
    "exitCode": 0,
    "sourceGroups": 2,
    "sourceExecutions": 8,
    "failed": 0,
    "previousTestsRerun": 0,
    "newFiles": 0
  },
  "sources": [
    {
      "file": "game.html",
      "readAt": "2026-10-02T11:29:31.007Z",
      "sha256": "569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103",
      "blocks": [
        {
          "name": "_startLoop",
          "line": 58758,
          "endLine": 58758,
          "sha256": "b0c53cf72198bbc744017ac71c6476fa567511a465344026c7b58df50d7188e6"
        },
        {
          "name": "loop",
          "line": 59909,
          "endLine": 60044,
          "sha256": "0d2a0c02d3235ef73738573079165ff0c344f131c374640623d1bb430e964151"
        },
        {
          "name": "actx",
          "line": 9695,
          "endLine": 9711,
          "sha256": "909640711fd7f4c86e890157df6a02dd5c550df68761d2179d8de00735cfc32b"
        },
        {
          "name": "_sfxFrameReset",
          "line": 11840,
          "endLine": 11870,
          "sha256": "644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905"
        },
        {
          "name": "_playSampleNow",
          "line": 11800,
          "endLine": 11839,
          "sha256": "88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7"
        },
        {
          "name": "playSample",
          "line": 11902,
          "endLine": 11914,
          "sha256": "4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79"
        },
        {
          "name": "_r",
          "line": 12007,
          "endLine": 12007,
          "sha256": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3"
        },
        {
          "name": "_sfxCat",
          "line": 11886,
          "endLine": 11898,
          "sha256": "b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b"
        },
        {
          "name": "_sfxPri",
          "line": 11778,
          "endLine": 11792,
          "sha256": "ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5"
        },
        {
          "name": "_isSkillSfx",
          "line": 11900,
          "endLine": 11900,
          "sha256": "1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a"
        },
        {
          "name": "_isFootstepSfx",
          "line": 11777,
          "endLine": 11777,
          "sha256": "d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853"
        },
        {
          "name": "_evictLowest",
          "line": 11793,
          "endLine": 11799,
          "sha256": "01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88"
        },
        {
          "name": "_MAX_ACTIVE_NODES",
          "line": 11767,
          "endLine": 11767,
          "sha256": "7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267"
        },
        {
          "name": "_SFX_MAX",
          "line": 11768,
          "endLine": 11768,
          "sha256": "409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470"
        },
        {
          "name": "_SFX_PER_FRAME",
          "line": 11770,
          "endLine": 11770,
          "sha256": "74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9"
        },
        {
          "name": "_SFX_PRI",
          "line": 11772,
          "endLine": 11772,
          "sha256": "3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965"
        },
        {
          "name": "_SKILL_SFX_KEYS",
          "line": 11899,
          "endLine": 11899,
          "sha256": "e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271"
        },
        {
          "name": "_MAX_PROJ_NODES",
          "line": 11774,
          "endLine": 11774,
          "sha256": "9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d"
        },
        {
          "name": "_MAX_HIT_NODES",
          "line": 11775,
          "endLine": 11775,
          "sha256": "f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011"
        },
        {
          "name": "_MAX_STEP_NODES",
          "line": 11776,
          "endLine": 11776,
          "sha256": "f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1"
        }
      ],
      "fingerprint": "03984dfa5537931de4227f0c68ddc808adeedd9f8964fa281e7b64860ae7fb85"
    },
    {
      "file": "game-easy-test.html",
      "readAt": "2026-10-02T11:29:31.072Z",
      "sha256": "7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e",
      "blocks": [
        {
          "name": "_startLoop",
          "line": 57097,
          "endLine": 57097,
          "sha256": "b0c53cf72198bbc744017ac71c6476fa567511a465344026c7b58df50d7188e6"
        },
        {
          "name": "loop",
          "line": 58241,
          "endLine": 58375,
          "sha256": "b0a6e30418623b6bb79596f77564d0fdcae9e4802bca329454936a33332e8be5"
        },
        {
          "name": "actx",
          "line": 9146,
          "endLine": 9162,
          "sha256": "909640711fd7f4c86e890157df6a02dd5c550df68761d2179d8de00735cfc32b"
        },
        {
          "name": "_sfxFrameReset",
          "line": 11244,
          "endLine": 11274,
          "sha256": "644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905"
        },
        {
          "name": "_playSampleNow",
          "line": 11204,
          "endLine": 11243,
          "sha256": "88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7"
        },
        {
          "name": "playSample",
          "line": 11306,
          "endLine": 11318,
          "sha256": "4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79"
        },
        {
          "name": "_r",
          "line": 11411,
          "endLine": 11411,
          "sha256": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3"
        },
        {
          "name": "_sfxCat",
          "line": 11290,
          "endLine": 11302,
          "sha256": "b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b"
        },
        {
          "name": "_sfxPri",
          "line": 11182,
          "endLine": 11196,
          "sha256": "ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5"
        },
        {
          "name": "_isSkillSfx",
          "line": 11304,
          "endLine": 11304,
          "sha256": "1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a"
        },
        {
          "name": "_isFootstepSfx",
          "line": 11181,
          "endLine": 11181,
          "sha256": "d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853"
        },
        {
          "name": "_evictLowest",
          "line": 11197,
          "endLine": 11203,
          "sha256": "01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88"
        },
        {
          "name": "_MAX_ACTIVE_NODES",
          "line": 11171,
          "endLine": 11171,
          "sha256": "7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267"
        },
        {
          "name": "_SFX_MAX",
          "line": 11172,
          "endLine": 11172,
          "sha256": "409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470"
        },
        {
          "name": "_SFX_PER_FRAME",
          "line": 11174,
          "endLine": 11174,
          "sha256": "74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9"
        },
        {
          "name": "_SFX_PRI",
          "line": 11176,
          "endLine": 11176,
          "sha256": "3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965"
        },
        {
          "name": "_SKILL_SFX_KEYS",
          "line": 11303,
          "endLine": 11303,
          "sha256": "e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271"
        },
        {
          "name": "_MAX_PROJ_NODES",
          "line": 11178,
          "endLine": 11178,
          "sha256": "9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d"
        },
        {
          "name": "_MAX_HIT_NODES",
          "line": 11179,
          "endLine": 11179,
          "sha256": "f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011"
        },
        {
          "name": "_MAX_STEP_NODES",
          "line": 11180,
          "endLine": 11180,
          "sha256": "f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1"
        }
      ],
      "fingerprint": "8f3afb204ac383a8d96ee305288177d120f6ab7250829705be7cb98fd012057a"
    }
  ],
  "edits": [
    {
      "files": [
        "game.html"
      ],
      "target": "_sfxFrameReset",
      "originalSHA": "644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905",
      "memorySHA": "d181b35ea147eb818865244b66c87ea28c34a3fa903979c03e3a093785fa9a44",
      "old": "  const c=actx();const _t=c.currentTime;\n  try{",
      "new": "  try{\n  const c=actx();const _t=c.currentTime;",
      "productionApplied": false
    },
    {
      "files": [
        "game-easy-test.html"
      ],
      "target": "_sfxFrameReset",
      "originalSHA": "644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905",
      "memorySHA": "d181b35ea147eb818865244b66c87ea28c34a3fa903979c03e3a093785fa9a44",
      "old": "  const c=actx();const _t=c.currentTime;\n  try{",
      "new": "  try{\n  const c=actx();const _t=c.currentTime;",
      "productionApplied": false
    }
  ],
  "records": [
    {
      "id": "loop-constructor-error-current",
      "files": [
        "game.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "fixture.catches",
          "sameError": true,
          "name": "FixtureRAFContextError"
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": true,
      "after": {
        "looping": true,
        "loopRunning": false,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 0,
        "partSpawnCnt": 9,
        "aoeHitCnt": 9,
        "queue": [
          {
            "key": "ghost_laugh",
            "vol": 0.8,
            "rate": 1.1856
          }
        ],
        "frameCounts": {
          "ghost_laugh": 2
        },
        "sbCd": 3,
        "context": null,
        "watchdog": null,
        "activeCount": 0,
        "nodes": []
      },
      "pendingRAF": 0,
      "totalRAFRegistrations": 1,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 0,
      "startGuardPreventsRestart": true,
      "schedulingRecovered": false,
      "productionApplied": false,
      "runtimeAccepted": false
    },
    {
      "id": "loop-constructor-error-scope-expanded",
      "files": [
        "game.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "fixture.catches",
          "sameError": true,
          "name": "FixtureRAFContextError"
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": true,
      "after": {
        "looping": true,
        "loopRunning": false,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 0,
        "partSpawnCnt": 9,
        "aoeHitCnt": 9,
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0
        },
        "sbCd": 2,
        "context": null,
        "watchdog": null,
        "activeCount": 0,
        "nodes": []
      },
      "pendingRAF": 0,
      "totalRAFRegistrations": 1,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 0,
      "startGuardPreventsRestart": true,
      "schedulingRecovered": false,
      "productionApplied": false,
      "runtimeAccepted": false
    },
    {
      "id": "loop-normal-hidden-current",
      "files": [
        "game.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "interval.schedule",
          "delay": 500
        },
        {
          "phase": "raf-delivery",
          "type": "gain.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "source.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "timer.schedule",
          "delay": 700
        },
        {
          "phase": "raf-delivery",
          "type": "source.start",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "phase": "raf-delivery",
          "type": "pollGamepad"
        },
        {
          "phase": "raf-delivery",
          "type": "raf.schedule",
          "sameLoop": true
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": false,
      "after": {
        "looping": true,
        "loopRunning": true,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 1,
        "partSpawnCnt": 0,
        "aoeHitCnt": 0,
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0
        },
        "sbCd": 2,
        "context": {
          "state": "running"
        },
        "watchdog": 501,
        "activeCount": 1,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          }
        ]
      },
      "pendingRAF": 1,
      "totalRAFRegistrations": 2,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 1,
      "startGuardPreventsRestart": false,
      "schedulingRecovered": true,
      "productionApplied": false,
      "runtimeAccepted": false
    },
    {
      "id": "loop-normal-hidden-scope-expanded",
      "files": [
        "game.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "interval.schedule",
          "delay": 500
        },
        {
          "phase": "raf-delivery",
          "type": "gain.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "source.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "timer.schedule",
          "delay": 700
        },
        {
          "phase": "raf-delivery",
          "type": "source.start",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "phase": "raf-delivery",
          "type": "pollGamepad"
        },
        {
          "phase": "raf-delivery",
          "type": "raf.schedule",
          "sameLoop": true
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": false,
      "after": {
        "looping": true,
        "loopRunning": true,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 1,
        "partSpawnCnt": 0,
        "aoeHitCnt": 0,
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0
        },
        "sbCd": 2,
        "context": {
          "state": "running"
        },
        "watchdog": 501,
        "activeCount": 1,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          }
        ]
      },
      "pendingRAF": 1,
      "totalRAFRegistrations": 2,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 1,
      "startGuardPreventsRestart": false,
      "schedulingRecovered": true,
      "productionApplied": false,
      "runtimeAccepted": false
    },
    {
      "id": "loop-constructor-error-current",
      "files": [
        "game-easy-test.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "fixture.catches",
          "sameError": true,
          "name": "FixtureRAFContextError"
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": true,
      "after": {
        "looping": true,
        "loopRunning": false,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 0,
        "partSpawnCnt": 9,
        "aoeHitCnt": 9,
        "queue": [
          {
            "key": "ghost_laugh",
            "vol": 0.8,
            "rate": 1.1856
          }
        ],
        "frameCounts": {
          "ghost_laugh": 2
        },
        "sbCd": 3,
        "context": null,
        "watchdog": null,
        "activeCount": 0,
        "nodes": []
      },
      "pendingRAF": 0,
      "totalRAFRegistrations": 1,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 0,
      "startGuardPreventsRestart": true,
      "schedulingRecovered": false,
      "productionApplied": false,
      "runtimeAccepted": false
    },
    {
      "id": "loop-constructor-error-scope-expanded",
      "files": [
        "game-easy-test.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "fixture.catches",
          "sameError": true,
          "name": "FixtureRAFContextError"
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": true,
      "after": {
        "looping": true,
        "loopRunning": false,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 0,
        "partSpawnCnt": 9,
        "aoeHitCnt": 9,
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0
        },
        "sbCd": 2,
        "context": null,
        "watchdog": null,
        "activeCount": 0,
        "nodes": []
      },
      "pendingRAF": 0,
      "totalRAFRegistrations": 1,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 0,
      "startGuardPreventsRestart": true,
      "schedulingRecovered": false,
      "productionApplied": false,
      "runtimeAccepted": false
    },
    {
      "id": "loop-normal-hidden-current",
      "files": [
        "game-easy-test.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "interval.schedule",
          "delay": 500
        },
        {
          "phase": "raf-delivery",
          "type": "gain.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "source.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "timer.schedule",
          "delay": 700
        },
        {
          "phase": "raf-delivery",
          "type": "source.start",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "phase": "raf-delivery",
          "type": "pollGamepad"
        },
        {
          "phase": "raf-delivery",
          "type": "raf.schedule",
          "sameLoop": true
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": false,
      "after": {
        "looping": true,
        "loopRunning": true,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 1,
        "partSpawnCnt": 0,
        "aoeHitCnt": 0,
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0
        },
        "sbCd": 2,
        "context": {
          "state": "running"
        },
        "watchdog": 501,
        "activeCount": 1,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          }
        ]
      },
      "pendingRAF": 1,
      "totalRAFRegistrations": 2,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 1,
      "startGuardPreventsRestart": false,
      "schedulingRecovered": true,
      "productionApplied": false,
      "runtimeAccepted": false
    },
    {
      "id": "loop-normal-hidden-scope-expanded",
      "files": [
        "game-easy-test.html"
      ],
      "status": "PASS",
      "trace": [
        {
          "phase": "boot-raf",
          "type": "raf.schedule",
          "sameLoop": true
        },
        {
          "phase": "raf-delivery",
          "type": "constructor",
          "options": {
            "latencyHint": "playback",
            "sampleRate": 44100
          }
        },
        {
          "phase": "raf-delivery",
          "type": "interval.schedule",
          "delay": 500
        },
        {
          "phase": "raf-delivery",
          "type": "gain.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "source.connect"
        },
        {
          "phase": "raf-delivery",
          "type": "timer.schedule",
          "delay": 700
        },
        {
          "phase": "raf-delivery",
          "type": "source.start",
          "at": 0.1,
          "rate": 1.1856
        },
        {
          "phase": "raf-delivery",
          "type": "pollGamepad"
        },
        {
          "phase": "raf-delivery",
          "type": "raf.schedule",
          "sameLoop": true
        }
      ],
      "rngTrace": [
        {
          "origin": "caller",
          "value": 0.25,
          "phase": "enqueue"
        },
        {
          "origin": "pitch",
          "value": 0.75,
          "phase": "enqueue"
        }
      ],
      "sameError": false,
      "after": {
        "looping": true,
        "loopRunning": true,
        "lastLoopTs": 100,
        "prevTs": 0,
        "perfFrames": 1,
        "partSpawnCnt": 0,
        "aoeHitCnt": 0,
        "queue": [],
        "frameCounts": {
          "ghost_laugh": 0
        },
        "sbCd": 2,
        "context": {
          "state": "running"
        },
        "watchdog": 501,
        "activeCount": 1,
        "nodes": [
          {
            "key": "ghost_laugh",
            "pri": 9
          }
        ]
      },
      "pendingRAF": 1,
      "totalRAFRegistrations": 2,
      "loopCrashCaught": false,
      "pendingAfterExistingStart": 1,
      "startGuardPreventsRestart": false,
      "schedulingRecovered": true,
      "productionApplied": false,
      "runtimeAccepted": false
    }
  ],
  "afterSource": [
    {
      "file": "game.html",
      "before": "569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103",
      "after": "569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103"
    },
    {
      "file": "game-easy-test.html",
      "before": "7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e",
      "after": "7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e"
    }
  ],
  "capacity": {
    "observedChanges": 94,
    "allowNewOwnedFiles": false,
    "source": "supervisor STATE read"
  },
  "productionApplied": false,
  "runtimeAccepted": false,
  "decision": "NO_LOOP_FIX_ADOPTED; error propagates before post-reset RAF even with flush scope cleanup. Preserving original error and scheduling another frame on failure needs explicit root recovery/retry policy; no swallowing/priority change adopted.",
  "limits": [
    "full loop executed only hidden-document normal path; visible combat/draw/native scheduler not simulated",
    "RAF callback held and manually delivered once, not real browser RAF",
    "watchdog/timers held only",
    "no file writes/Git/game/audio/previous tests"
  ],
  "normalEquivalence": [
    {
      "files": [
        "game.html"
      ],
      "exactTrace": true,
      "exactRNG": true,
      "exactState": true
    },
    {
      "files": [
        "game-easy-test.html"
      ],
      "exactTrace": true,
      "exactRNG": true,
      "exactState": true
    }
  ],
  "harnessFailureHistory": [
    {
      "exitCode": 1,
      "failed": 8,
      "reason": "First same-name _startLoop declaration was audio helper; corrected extraction to exact no-argument game-driver signature",
      "preservedInMemory": true
    }
  ]
}

```

## Initial failed execution (verbatim tool result)

```json
{
  "chunk_id": "a8055e",
  "wall_time_seconds": 0.034285334,
  "exit_code": 1,
  "original_token_count": 5107,
  "output": "{\n  \"taskId\": \"SOUND-autonomy-loop-raf-continuation-1126\",\n  \"status\": \"FAIL\",\n  \"execution\": {\n    \"startedAt\": \"2026-10-02T11:27:30.743Z\",\n    \"completedAt\": \"2026-10-02T11:27:30.873Z\",\n    \"exitCode\": 1,\n    \"sourceGroups\": 2,\n    \"sourceExecutions\": 8,\n    \"failed\": 8,\n    \"previousTestsRerun\": 0,\n    \"newFiles\": 0\n  },\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"readAt\": \"2026-10-02T11:27:30.806Z\",\n      \"sha256\": \"569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103\",\n      \"blocks\": [\n        {\n          \"name\": \"_startLoop\",\n          \"line\": 12093,\n          \"endLine\": 12099,\n          \"sha256\": \"4ff4ab28753074ecd8f0ed46634af272251789b0a489cbc0f526f53cb46ba9b4\"\n        },\n        {\n          \"name\": \"loop\",\n          \"line\": 59909,\n          \"endLine\": 60044,\n          \"sha256\": \"0d2a0c02d3235ef73738573079165ff0c344f131c374640623d1bb430e964151\"\n        },\n        {\n          \"name\": \"actx\",\n          \"line\": 9695,\n          \"endLine\": 9711,\n          \"sha256\": \"909640711fd7f4c86e890157df6a02dd5c550df68761d2179d8de00735cfc32b\"\n        },\n        {\n          \"name\": \"_sfxFrameReset\",\n          \"line\": 11840,\n          \"endLine\": 11870,\n          \"sha256\": \"644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905\"\n        },\n        {\n          \"name\": \"_playSampleNow\",\n          \"line\": 11800,\n          \"endLine\": 11839,\n          \"sha256\": \"88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7\"\n        },\n        {\n          \"name\": \"playSample\",\n          \"line\": 11902,\n          \"endLine\": 11914,\n          \"sha256\": \"4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79\"\n        },\n        {\n          \"name\": \"_r\",\n          \"line\": 12007,\n          \"endLine\": 12007,\n          \"sha256\": \"a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3\"\n        },\n        {\n          \"name\": \"_sfxCat\",\n          \"line\": 11886,\n          \"endLine\": 11898,\n          \"sha256\": \"b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b\"\n        },\n        {\n          \"name\": \"_sfxPri\",\n          \"line\": 11778,\n          \"endLine\": 11792,\n          \"sha256\": \"ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5\"\n        },\n        {\n          \"name\": \"_isSkillSfx\",\n          \"line\": 11900,\n          \"endLine\": 11900,\n          \"sha256\": \"1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a\"\n        },\n        {\n          \"name\": \"_isFootstepSfx\",\n          \"line\": 11777,\n          \"endLine\": 11777,\n          \"sha256\": \"d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853\"\n        },\n        {\n          \"name\": \"_evictLowest\",\n          \"line\": 11793,\n          \"endLine\": 11799,\n          \"sha256\": \"01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88\"\n        },\n        {\n          \"name\": \"_MAX_ACTIVE_NODES\",\n          \"line\": 11767,\n          \"endLine\": 11767,\n          \"sha256\": \"7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267\"\n        },\n        {\n          \"name\": \"_SFX_MAX\",\n          \"line\": 11768,\n          \"endLine\": 11768,\n          \"sha256\": \"409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470\"\n        },\n        {\n          \"name\": \"_SFX_PER_FRAME\",\n          \"line\": 11770,\n          \"endLine\": 11770,\n          \"sha256\": \"74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9\"\n        },\n        {\n          \"name\": \"_SFX_PRI\",\n          \"line\": 11772,\n          \"endLine\": 11772,\n          \"sha256\": \"3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965\"\n        },\n        {\n          \"name\": \"_SKILL_SFX_KEYS\",\n          \"line\": 11899,\n          \"endLine\": 11899,\n          \"sha256\": \"e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271\"\n        },\n        {\n          \"name\": \"_MAX_PROJ_NODES\",\n          \"line\": 11774,\n          \"endLine\": 11774,\n          \"sha256\": \"9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d\"\n        },\n        {\n          \"name\": \"_MAX_HIT_NODES\",\n          \"line\": 11775,\n          \"endLine\": 11775,\n          \"sha256\": \"f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011\"\n        },\n        {\n          \"name\": \"_MAX_STEP_NODES\",\n          \"line\": 11776,\n          \"endLine\": 11776,\n          \"sha256\": \"f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1\"\n        }\n      ],\n      \"fingerprint\": \"8457c9723af4664cbfcd75763b22c138ebcf8576a4a286d6c831a2f2043894a0\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"readAt\": \"2026-10-02T11:27:30.861Z\",\n      \"sha256\": \"7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e\",\n      \"blocks\": [\n        {\n          \"name\": \"_startLoop\",\n          \"line\": 11497,\n          \"endLine\": 11503,\n          \"sha256\": \"4ff4ab28753074ecd8f0ed46634af272251789b0a489cbc0f526f53cb46ba9b4\"\n        },\n        {\n          \"name\": \"loop\",\n          \"line\": 58241,\n          \"endLine\": 58375,\n          \"sha256\": \"b0a6e30418623b6bb79596f77564d0fdcae9e4802bca329454936a33332e8be5\"\n        },\n        {\n          \"name\": \"actx\",\n          \"line\": 9146,\n          \"endLine\": 9162,\n          \"sha256\": \"909640711fd7f4c86e890157df6a02dd5c550df68761d2179d8de00735cfc32b\"\n        },\n        {\n          \"name\": \"_sfxFrameReset\",\n          \"line\": 11244,\n          \"endLine\": 11274,\n          \"sha256\": \"644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905\"\n        },\n        {\n          \"name\": \"_playSampleNow\",\n          \"line\": 11204,\n          \"endLine\": 11243,\n          \"sha256\": \"88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7\"\n        },\n        {\n          \"name\": \"playSample\",\n          \"line\": 11306,\n          \"endLine\": 11318,\n          \"sha256\": \"4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79\"\n        },\n        {\n          \"name\": \"_r\",\n          \"line\": 11411,\n          \"endLine\": 11411,\n          \"sha256\": \"a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3\"\n        },\n        {\n          \"name\": \"_sfxCat\",\n          \"line\": 11290,\n          \"endLine\": 11302,\n          \"sha256\": \"b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b\"\n        },\n        {\n          \"name\": \"_sfxPri\",\n          \"line\": 11182,\n          \"endLine\": 11196,\n          \"sha256\": \"ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5\"\n        },\n        {\n          \"name\": \"_isSkillSfx\",\n          \"line\": 11304,\n          \"endLine\": 11304,\n          \"sha256\": \"1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a\"\n        },\n        {\n          \"name\": \"_isFootstepSfx\",\n          \"line\": 11181,\n          \"endLine\": 11181,\n          \"sha256\": \"d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853\"\n        },\n        {\n          \"name\": \"_evictLowest\",\n          \"line\": 11197,\n          \"endLine\": 11203,\n          \"sha256\": \"01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88\"\n        },\n        {\n          \"name\": \"_MAX_ACTIVE_NODES\",\n          \"line\": 11171,\n          \"endLine\": 11171,\n          \"sha256\": \"7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267\"\n        },\n        {\n          \"name\": \"_SFX_MAX\",\n          \"line\": 11172,\n          \"endLine\": 11172,\n          \"sha256\": \"409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470\"\n        },\n        {\n          \"name\": \"_SFX_PER_FRAME\",\n          \"line\": 11174,\n          \"endLine\": 11174,\n          \"sha256\": \"74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9\"\n        },\n        {\n          \"name\": \"_SFX_PRI\",\n          \"line\": 11176,\n          \"endLine\": 11176,\n          \"sha256\": \"3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965\"\n        },\n        {\n          \"name\": \"_SKILL_SFX_KEYS\",\n          \"line\": 11303,\n          \"endLine\": 11303,\n          \"sha256\": \"e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271\"\n        },\n        {\n          \"name\": \"_MAX_PROJ_NODES\",\n          \"line\": 11178,\n          \"endLine\": 11178,\n          \"sha256\": \"9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d\"\n        },\n        {\n          \"name\": \"_MAX_HIT_NODES\",\n          \"line\": 11179,\n          \"endLine\": 11179,\n          \"sha256\": \"f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011\"\n        },\n        {\n          \"name\": \"_MAX_STEP_NODES\",\n          \"line\": 11180,\n          \"endLine\": 11180,\n          \"sha256\": \"f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1\"\n        }\n      ],\n      \"fingerprint\": \"a449d95f5607c9db91dc00ff77a57ab5b8fae661daba76eb9d1b3015dc729ccc\"\n    }\n  ],\n  \"edits\": [\n    {\n      \"files\": [\n        \"game.html\"\n      ],\n      \"target\": \"_sfxFrameReset\",\n      \"originalSHA\": \"644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905\",\n      \"memorySHA\": \"d181b35ea147eb818865244b66c87ea28c34a3fa903979c03e3a093785fa9a44\",\n      \"old\": \"  const c=actx();const _t=c.currentTime;\\n  try{\",\n      \"new\": \"  try{\\n  const c=actx();const _t=c.currentTime;\",\n      \"productionApplied\": false\n    },\n    {\n      \"files\": [\n        \"game-easy-test.html\"\n      ],\n      \"target\": \"_sfxFrameReset\",\n      \"originalSHA\": \"644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905\",\n      \"memorySHA\": \"d181b35ea147eb818865244b66c87ea28c34a3fa903979c03e3a093785fa9a44\",\n      \"old\": \"  const c=actx();const _t=c.currentTime;\\n  try{\",\n      \"new\": \"  try{\\n  const c=actx();const _t=c.currentTime;\",\n      \"productionApplied\": false\n    }\n  ],\n  \"records\": [\n    {\n      \"id\": \"loop-constructor-error-current\",\n      \"files\": [\n        \"game.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    },\n    {\n      \"id\": \"loop-constructor-error-scope-expanded\",\n      \"files\": [\n        \"game.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    },\n    {\n      \"id\": \"loop-normal-hidden-current\",\n      \"files\": [\n        \"game.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        },\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"interval.schedule\",\n          \"delay\": 500\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    },\n    {\n      \"id\": \"loop-normal-hidden-scope-expanded\",\n      \"files\": [\n        \"game.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        },\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"interval.schedule\",\n          \"delay\": 500\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    },\n    {\n      \"id\": \"loop-constructor-error-current\",\n      \"files\": [\n        \"game-easy-test.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    },\n    {\n      \"id\": \"loop-constructor-error-scope-expanded\",\n      \"files\": [\n        \"game-easy-test.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    },\n    {\n      \"id\": \"loop-normal-hidden-current\",\n      \"files\": [\n        \"game-easy-test.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        },\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"interval.schedule\",\n          \"delay\": 500\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    },\n    {\n      \"id\": \"loop-normal-hidden-scope-expanded\",\n      \"files\": [\n        \"game-easy-test.html\"\n      ],\n      \"status\": \"FAIL\",\n      \"trace\": [\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"constructor\",\n          \"options\": {\n            \"latencyHint\": \"playback\",\n            \"sampleRate\": 44100\n          }\n        },\n        {\n          \"phase\": \"boot-raf\",\n          \"type\": \"interval.schedule\",\n          \"delay\": 500\n        }\n      ],\n      \"rngTrace\": [\n        {\n          \"origin\": \"caller\",\n          \"value\": 0.25,\n          \"phase\": \"enqueue\"\n        },\n        {\n          \"origin\": \"pitch\",\n          \"value\": 0.75,\n          \"phase\": \"enqueue\"\n        }\n      ],\n      \"error\": \"AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\\n\\n0 !== 1\\n\\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:105\\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async node:internal/modules/esm/loader:246:26\\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\"\n    }\n  ],\n  \"afterSource\": [\n    {\n      \"file\": \"game.html\",\n      \"before\": \"569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103\",\n      \"after\": \"569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"before\": \"7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e\",\n      \"after\": \"7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e\"\n    }\n  ],\n  \"capacity\": {\n    \"observedChanges\": 94,\n    \"allowNewOwnedFiles\": false,\n    \"source\": \"supervisor STATE read\"\n  },\n  \"productionApplied\": false,\n  \"runtimeAccepted\": false,\n  \"decision\": \"NO_LOOP_FIX_ADOPTED; error propagates before post-reset RAF even with flush scope cleanup. Preserving original error and scheduling another frame on failure needs explicit root recovery/retry policy; no swallowing/priority change adopted.\",\n  \"limits\": [\n    \"full loop executed only hidden-document normal path; visible combat/draw/native scheduler not simulated\",\n    \"RAF callback held and manually delivered once, not real browser RAF\",\n    \"watchdog/timers held only\",\n    \"no file writes/Git/game/audio/previous tests\"\n  ]\n}\n"
}
```

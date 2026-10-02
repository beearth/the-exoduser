# CH1-1 death spatial connection cleanup source patch

Task: SOUND-ch1-death-spatial-connect-cleanup-1210. Goal document SHA 889fb16f97416a582818d6a93e49421e8eb704c11806ab50279fec9dc41b5a09 read fully. Source candidate, not product/native/listening acceptance.

## Root adoption target

Replace only full _playSampleNow in both source files using the original/candidate bodies embedded below or emitted by checks.mjs --emit-patch. Emission writes no files. The source and function hashes are guards; root must reconcile intervening WIP rather than overwrite it.

Original function SHA: 88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7
Candidate function SHA: edaa50841ca6c897a30c812035b018c0b09c4db2510ddae7337965c6ce0d336d

Move _dnP definition/registration before source→panner→gain connection. Extend the existing start failure try/catch to cover panner construction/property/connection, source connection, onended and timer wiring. Catch invokes current _nd._dn and rethrows same Error. Registered count/list release immediately; panner is available to cleanup before connect throws.

| Contract | Candidate |
|---|---|
| Error | Same Error rethrown; no swallowing |
| RAF | Unchanged; cleanup does not recover RAF |
| Queue tail | Existing queue-finally discard unchanged; deathFX bypasses queue |
| Death burst | Existing frameN/CD consumption preserved; no rollback or replay |
| Priority / caps / volume / RNG | Unchanged |
| Root Gate | Expands start-only cleanup to connection/wiring failures; adoption and shared docs owned by root |
| Outside scope | actx/source/gain creation and gain.connect before node registration; disconnect guarantees remain current |

## Actual source boundary and verification

Full deathFX, backend and category/mapping helpers extracted from both HTMLs; complete extracted blocks equal across editions. Entry uses actual deathFX, not an upstream hurtE/kill/boss state machine or real input. Synthetic WebAudio nodes, held timers, deterministic Math.random and VFX recorders.

Three new failures: second same-frame death panner.connect throw; second death source.connect throw; first death source.connect throw. Each current path leaves count/list 1 after all existing timers are manually fired (failed node had no timer), while candidate leaves 0; same Error identity preserved. Normal two deaths and stage0 boss death controls have exact event/RNG/state equality. 5 cases × current/candidate = 10 executions, 10 PASS, exit0. No previous start/flush/constructor/RAF test rerun. Normal controls do call start successfully as setup; no start-failure case repeated.

Native device/audio/decode/listening, real timers/RAF, gameplay/boss progression: NOT RUN. Production modifications: 0. Sources preserved during execution.

## Execution and save history

Execution 2026-10-02T12:07:03.566Z → 2026-10-02T12:07:03.698Z, exit 0, tool chunk a04937. Ran memory script via fixed Node --input-type=module heredoc SOUND_CH1 from /Users/fordeargamers/Projects/exoduser-migration-20261001. No harness failure in this iteration.

Saved under capacity-after-6a39b828-1212 after STATE read actual Changes60/allowNewOwnedFiles true. Owned outputs only checks.mjs + result.md; 1 saved iteration / 2 files consumed. No tests rerun after PASS or save. During execution previous gate was Changes82/new files false; original snapshot in stdout intentionally preserved.

Saved checks differs from executed module only by an optional --emit-patch early branch before scenarios. The execution path is unchanged. That emission convenience was added without another test run; saved script was not executed on save. Exact executed module SHA is appended by save utility below.

Read-only docs-wide rg for relevant terms performed; first broad output was truncated, then targeted sound/performance rg examined exact _playSampleNow/_dnP/connection matches. Root needs docs synchronization when adopting. No team writes to shared docs/Git.

## Runnable commands (not rerun on save)

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs --emit-patch
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
```

## Original execution stdout (verbatim, includes exact patch bodies)

```json
{
  "taskId": "SOUND-ch1-death-spatial-connect-cleanup-1210",
  "status": "SOURCE_PATCH_CANDIDATE",
  "execution": {
    "startedAt": "2026-10-02T12:07:03.566Z",
    "completedAt": "2026-10-02T12:07:03.698Z",
    "executions": 10,
    "failed": 0,
    "exitCode": 0
  },
  "sources": [
    {
      "file": "game.html",
      "sha256": "391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2",
      "blocks": [
        {
          "name": "deathFX",
          "line": 23523,
          "sha256": "1a675676500ebd0cd005a802f9628d60462bf373468246d64f126130f2a686ec"
        },
        {
          "name": "_deathBloodScale",
          "line": 23522,
          "sha256": "7b8c1a0e1b9d322c8a83b9a2e191bf38db1b9dcb7c0760a6eeeeed50b897db6b"
        },
        {
          "name": "_deathSfxKey",
          "line": 23487,
          "sha256": "7120ae1d336bf3a6f2da818359bb5b1c6699745ef912a9536c01519cd4415622"
        },
        {
          "name": "_pickDeathVar",
          "line": 23478,
          "sha256": "cb9614197dd20ce2e7570116c32d87a5ce30c4ca98f32c4c42d25b2ca961aecc"
        },
        {
          "name": "_bossSfx",
          "line": 23486,
          "sha256": "3cb833e83f368daa91f0e0dacfa1d78cbc95d09092778be8caa28218fdc5d1ff"
        },
        {
          "name": "_playSampleNow",
          "line": 11800,
          "sha256": "88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7"
        },
        {
          "name": "_sfxPri",
          "line": 11778,
          "sha256": "ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5"
        },
        {
          "name": "_isSkillSfx",
          "line": 11900,
          "sha256": "1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a"
        },
        {
          "name": "_isFootstepSfx",
          "line": 11777,
          "sha256": "d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853"
        },
        {
          "name": "_evictLowest",
          "line": 11793,
          "sha256": "01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88"
        },
        {
          "name": "_r",
          "line": 12007,
          "sha256": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3"
        },
        {
          "name": "_HUMANOID_ET",
          "line": 23446,
          "sha256": "4e7f433e2462f75d6f965ecade9a386752319430649708be60dc13102fa42b82"
        },
        {
          "name": "_INSECT_ET",
          "line": 23447,
          "sha256": "79e2d84ec8c587877a55727c9a7bb5d0c4152b0ccc1bc7778147211e92e6faca"
        },
        {
          "name": "_GHOST_ET",
          "line": 23448,
          "sha256": "2edde2a5a9c56c1b1b3a192ec194ab9f08780a95fbe50db525e52b7c98fb5dfc"
        },
        {
          "name": "_FLESH_ET",
          "line": 23449,
          "sha256": "e35f5b3c5177a37171c52d9d888261c68a2ae8762fe717ea473ea21313876733"
        },
        {
          "name": "_BONE_ET",
          "line": 23450,
          "sha256": "bc692de5498a4b85376ea87fdd5083a601ec6d3379c18444c63ad3599f88cbf7"
        },
        {
          "name": "_BEAST_ET",
          "line": 23452,
          "sha256": "61fbecf7936408d54012e57f96b930c2163e9f11a7d3a2a0deafd23ae165b198"
        },
        {
          "name": "_MAGIC_ET",
          "line": 23453,
          "sha256": "b4627a10222c9529ab6a09ad2d3f9fac55bd66fc404430f9777be993ae339ca1"
        },
        {
          "name": "_ARMOR_ET",
          "line": 23454,
          "sha256": "f9869094a5e04bfee1728f71ce6b86b52344bc0a8e5ae3fdf8e963b915064379"
        },
        {
          "name": "_DEATH_VARIANTS",
          "line": 23457,
          "sha256": "240d8aa3cfdccd8aa2d419dd88ba83686eabad2dda26baca2b0384438485794d"
        },
        {
          "name": "_BOSS_SFX",
          "line": 23480,
          "sha256": "341dbaebf942080d966f5386839f6763c631c57eb53aa936914187d0789138d4"
        },
        {
          "name": "_SFX_PRI",
          "line": 11772,
          "sha256": "3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965"
        },
        {
          "name": "_SKILL_SFX_KEYS",
          "line": 11899,
          "sha256": "e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271"
        },
        {
          "name": "_MAX_ACTIVE_NODES",
          "line": 11767,
          "sha256": "7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267"
        },
        {
          "name": "_MAX_PROJ_NODES",
          "line": 11774,
          "sha256": "9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d"
        },
        {
          "name": "_MAX_HIT_NODES",
          "line": 11775,
          "sha256": "f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011"
        },
        {
          "name": "_MAX_STEP_NODES",
          "line": 11776,
          "sha256": "f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1"
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "sha256": "21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a",
      "blocks": [
        {
          "name": "deathFX",
          "line": 22553,
          "sha256": "1a675676500ebd0cd005a802f9628d60462bf373468246d64f126130f2a686ec"
        },
        {
          "name": "_deathBloodScale",
          "line": 22552,
          "sha256": "7b8c1a0e1b9d322c8a83b9a2e191bf38db1b9dcb7c0760a6eeeeed50b897db6b"
        },
        {
          "name": "_deathSfxKey",
          "line": 22517,
          "sha256": "7120ae1d336bf3a6f2da818359bb5b1c6699745ef912a9536c01519cd4415622"
        },
        {
          "name": "_pickDeathVar",
          "line": 22508,
          "sha256": "cb9614197dd20ce2e7570116c32d87a5ce30c4ca98f32c4c42d25b2ca961aecc"
        },
        {
          "name": "_bossSfx",
          "line": 22516,
          "sha256": "3cb833e83f368daa91f0e0dacfa1d78cbc95d09092778be8caa28218fdc5d1ff"
        },
        {
          "name": "_playSampleNow",
          "line": 11204,
          "sha256": "88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7"
        },
        {
          "name": "_sfxPri",
          "line": 11182,
          "sha256": "ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5"
        },
        {
          "name": "_isSkillSfx",
          "line": 11304,
          "sha256": "1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a"
        },
        {
          "name": "_isFootstepSfx",
          "line": 11181,
          "sha256": "d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853"
        },
        {
          "name": "_evictLowest",
          "line": 11197,
          "sha256": "01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88"
        },
        {
          "name": "_r",
          "line": 11411,
          "sha256": "a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3"
        },
        {
          "name": "_HUMANOID_ET",
          "line": 22476,
          "sha256": "4e7f433e2462f75d6f965ecade9a386752319430649708be60dc13102fa42b82"
        },
        {
          "name": "_INSECT_ET",
          "line": 22477,
          "sha256": "79e2d84ec8c587877a55727c9a7bb5d0c4152b0ccc1bc7778147211e92e6faca"
        },
        {
          "name": "_GHOST_ET",
          "line": 22478,
          "sha256": "2edde2a5a9c56c1b1b3a192ec194ab9f08780a95fbe50db525e52b7c98fb5dfc"
        },
        {
          "name": "_FLESH_ET",
          "line": 22479,
          "sha256": "e35f5b3c5177a37171c52d9d888261c68a2ae8762fe717ea473ea21313876733"
        },
        {
          "name": "_BONE_ET",
          "line": 22480,
          "sha256": "bc692de5498a4b85376ea87fdd5083a601ec6d3379c18444c63ad3599f88cbf7"
        },
        {
          "name": "_BEAST_ET",
          "line": 22482,
          "sha256": "61fbecf7936408d54012e57f96b930c2163e9f11a7d3a2a0deafd23ae165b198"
        },
        {
          "name": "_MAGIC_ET",
          "line": 22483,
          "sha256": "b4627a10222c9529ab6a09ad2d3f9fac55bd66fc404430f9777be993ae339ca1"
        },
        {
          "name": "_ARMOR_ET",
          "line": 22484,
          "sha256": "f9869094a5e04bfee1728f71ce6b86b52344bc0a8e5ae3fdf8e963b915064379"
        },
        {
          "name": "_DEATH_VARIANTS",
          "line": 22487,
          "sha256": "240d8aa3cfdccd8aa2d419dd88ba83686eabad2dda26baca2b0384438485794d"
        },
        {
          "name": "_BOSS_SFX",
          "line": 22510,
          "sha256": "341dbaebf942080d966f5386839f6763c631c57eb53aa936914187d0789138d4"
        },
        {
          "name": "_SFX_PRI",
          "line": 11176,
          "sha256": "3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965"
        },
        {
          "name": "_SKILL_SFX_KEYS",
          "line": 11303,
          "sha256": "e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271"
        },
        {
          "name": "_MAX_ACTIVE_NODES",
          "line": 11171,
          "sha256": "7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267"
        },
        {
          "name": "_MAX_PROJ_NODES",
          "line": 11178,
          "sha256": "9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d"
        },
        {
          "name": "_MAX_HIT_NODES",
          "line": 11179,
          "sha256": "f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011"
        },
        {
          "name": "_MAX_STEP_NODES",
          "line": 11180,
          "sha256": "f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1"
        }
      ]
    }
  ],
  "patch": {
    "function": "_playSampleNow",
    "originalSHA": "88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7",
    "candidateSHA": "edaa50841ca6c897a30c812035b018c0b09c4db2510ddae7337965c6ce0d336d",
    "original": "function _playSampleNow(key,vol,rate,startTime,pan,priOverride){\n  const buf=_audioBuffers[key];\n  if(!buf){if(_sampleFiles[key]&&!_audioLoadPending[key]){_audioLoadPending[key]=true;const _c2=actx();fetch(_sampleFiles[key]).then(r=>r.arrayBuffer()).then(ab=>_c2.decodeAudioData(ab)).then(b=>{_audioBuffers[key]=b;delete _audioLoadPending[key]}).catch(()=>{delete _audioLoadPending[key]})}return;}\n  const pri=(priOverride!=null)?priOverride:_sfxPri(key);\n  if(_isFootstepSfx(key)){\n    let count=0,oldest=null;\n    for(const n of _activeNodes)if(_isFootstepSfx(n.key)){count++;if(!oldest||n._st<oldest._st)oldest=n;}\n    if(count>=_MAX_STEP_NODES&&oldest){try{oldest.src.stop()}catch(e){}oldest._dn();}\n  }\n  // PROJ 하드캡: 동시 2개\n  if(pri<=_SFX_PRI.PROJ){let _pCnt=0;for(let i=0;i<_activeNodes.length;i++)if(_activeNodes[i].pri<=_SFX_PRI.PROJ)_pCnt++;if(_pCnt>=_MAX_PROJ_NODES)return;}\n  // HIT 하드캡: 동시 3개 (PROJ 포함)\n  else if(pri<=_SFX_PRI.HIT){let _hCnt=0;for(let i=0;i<_activeNodes.length;i++)if(_activeNodes[i].pri<=_SFX_PRI.HIT)_hCnt++;if(_hCnt>=_MAX_HIT_NODES)return;}\n  // 채널 포화 시 우선순위 교체\n  if(_activeNodeCnt>=_MAX_ACTIVE_NODES){if(!_evictLowest(pri))return;}\n  const c=actx();\n  const src=c.createBufferSource();src.buffer=buf;\n  src.playbackRate.value=rate||1;\n  const gain=c.createGain();\n  gain.gain.value=Math.min(1,(vol||1)*sfxVol());\n  gain.connect(mbus());\n  const _dur=buf.duration||2;\n  _activeNodeCnt++;\n  const _nd={src,gain,pri,key,_dn:null,_st:performance.now()};\n  let _d=false;\n  function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);const idx=_activeNodes.indexOf(_nd);if(idx>=0){_activeNodes[idx]=_activeNodes[_activeNodes.length-1];_activeNodes.pop()}try{src.disconnect();gain.disconnect()}catch(e){}}\n  _nd._dn=_dn;_activeNodes.push(_nd);\n  if(pan&&Math.abs(pan)>0.05){\n    const _panner=c.createStereoPanner();\n    _panner.pan.value=Math.max(-1,Math.min(1,pan));\n    src.connect(_panner);_panner.connect(gain);\n    const _dnP=function(){_dn();try{_panner.disconnect()}catch(e){}};\n    _nd._dn=_dnP;src.onended=_dnP;setTimeout(_dnP,(_dur+.5)*1000);\n  }else{\n    src.connect(gain);\n    src.onended=_dn;setTimeout(_dn,(_dur+.5)*1000);\n  }\n  try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}\n  return src;\n}",
    "candidate": "function _playSampleNow(key,vol,rate,startTime,pan,priOverride){\n  const buf=_audioBuffers[key];\n  if(!buf){if(_sampleFiles[key]&&!_audioLoadPending[key]){_audioLoadPending[key]=true;const _c2=actx();fetch(_sampleFiles[key]).then(r=>r.arrayBuffer()).then(ab=>_c2.decodeAudioData(ab)).then(b=>{_audioBuffers[key]=b;delete _audioLoadPending[key]}).catch(()=>{delete _audioLoadPending[key]})}return;}\n  const pri=(priOverride!=null)?priOverride:_sfxPri(key);\n  if(_isFootstepSfx(key)){\n    let count=0,oldest=null;\n    for(const n of _activeNodes)if(_isFootstepSfx(n.key)){count++;if(!oldest||n._st<oldest._st)oldest=n;}\n    if(count>=_MAX_STEP_NODES&&oldest){try{oldest.src.stop()}catch(e){}oldest._dn();}\n  }\n  // PROJ 하드캡: 동시 2개\n  if(pri<=_SFX_PRI.PROJ){let _pCnt=0;for(let i=0;i<_activeNodes.length;i++)if(_activeNodes[i].pri<=_SFX_PRI.PROJ)_pCnt++;if(_pCnt>=_MAX_PROJ_NODES)return;}\n  // HIT 하드캡: 동시 3개 (PROJ 포함)\n  else if(pri<=_SFX_PRI.HIT){let _hCnt=0;for(let i=0;i<_activeNodes.length;i++)if(_activeNodes[i].pri<=_SFX_PRI.HIT)_hCnt++;if(_hCnt>=_MAX_HIT_NODES)return;}\n  // 채널 포화 시 우선순위 교체\n  if(_activeNodeCnt>=_MAX_ACTIVE_NODES){if(!_evictLowest(pri))return;}\n  const c=actx();\n  const src=c.createBufferSource();src.buffer=buf;\n  src.playbackRate.value=rate||1;\n  const gain=c.createGain();\n  gain.gain.value=Math.min(1,(vol||1)*sfxVol());\n  gain.connect(mbus());\n  const _dur=buf.duration||2;\n  _activeNodeCnt++;\n  const _nd={src,gain,pri,key,_dn:null,_st:performance.now()};\n  let _d=false;\n  function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);const idx=_activeNodes.indexOf(_nd);if(idx>=0){_activeNodes[idx]=_activeNodes[_activeNodes.length-1];_activeNodes.pop()}try{src.disconnect();gain.disconnect()}catch(e){}}\n  _nd._dn=_dn;_activeNodes.push(_nd);\n  try{\n  if(pan&&Math.abs(pan)>0.05){\n    const _panner=c.createStereoPanner();\n    _panner.pan.value=Math.max(-1,Math.min(1,pan));\n    const _dnP=function(){_dn();try{_panner.disconnect()}catch(e){}};\n    _nd._dn=_dnP;\n    src.connect(_panner);_panner.connect(gain);\n    src.onended=_dnP;setTimeout(_dnP,(_dur+.5)*1000);\n  }else{\n    src.connect(gain);\n    src.onended=_dn;setTimeout(_dn,(_dur+.5)*1000);\n  }\n  src.start(startTime||0);\n  }catch(e){_nd._dn();throw e;}\n  return src;\n}"
  },
  "records": [
    {
      "id": "ch1-second-death-panner-connect",
      "patched": false,
      "status": "PASS",
      "sameError": true,
      "beforeCleanup": {
        "activeCount": 2,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          },
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "timersBefore": 1,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 1
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "gain.connect",
          "id": 2,
          "value": 0.594
        },
        {
          "type": "source.connect",
          "id": 2,
          "to": "panner"
        },
        {
          "type": "panner.connect",
          "id": 1,
          "value": -0.35
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "source",
          "id": 2,
          "disconnected": false
        },
        {
          "kind": "gain",
          "id": 2,
          "disconnected": false
        },
        {
          "kind": "panner",
          "id": 1,
          "disconnected": false
        }
      ]
    },
    {
      "id": "ch1-second-death-panner-connect",
      "patched": true,
      "status": "PASS",
      "sameError": true,
      "beforeCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "timersBefore": 1,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 1
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "gain.connect",
          "id": 2,
          "value": 0.594
        },
        {
          "type": "source.connect",
          "id": 2,
          "to": "panner"
        },
        {
          "type": "panner.connect",
          "id": 1,
          "value": -0.35
        },
        {
          "type": "source.disconnect",
          "id": 2
        },
        {
          "type": "gain.disconnect",
          "id": 2
        },
        {
          "type": "panner.disconnect",
          "id": 1
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "source",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "panner",
          "id": 1,
          "disconnected": true
        }
      ]
    },
    {
      "id": "ch1-second-death-source-connect",
      "patched": false,
      "status": "PASS",
      "sameError": true,
      "beforeCleanup": {
        "activeCount": 2,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          },
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "timersBefore": 1,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 1
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "gain.connect",
          "id": 2,
          "value": 0.594
        },
        {
          "type": "source.connect",
          "id": 2,
          "to": "panner"
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "source",
          "id": 2,
          "disconnected": false
        },
        {
          "kind": "gain",
          "id": 2,
          "disconnected": false
        },
        {
          "kind": "panner",
          "id": 1,
          "disconnected": false
        }
      ]
    },
    {
      "id": "ch1-second-death-source-connect",
      "patched": true,
      "status": "PASS",
      "sameError": true,
      "beforeCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "timersBefore": 1,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 1
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "gain.connect",
          "id": 2,
          "value": 0.594
        },
        {
          "type": "source.connect",
          "id": 2,
          "to": "panner"
        },
        {
          "type": "source.disconnect",
          "id": 2
        },
        {
          "type": "gain.disconnect",
          "id": 2
        },
        {
          "type": "panner.disconnect",
          "id": 1
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "source",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "panner",
          "id": 1,
          "disconnected": true
        }
      ]
    },
    {
      "id": "ch1-first-death-source-connect",
      "patched": false,
      "status": "PASS",
      "sameError": true,
      "beforeCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "timersBefore": 0,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": false
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": false
        }
      ]
    },
    {
      "id": "ch1-first-death-source-connect",
      "patched": true,
      "status": "PASS",
      "sameError": true,
      "beforeCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "timersBefore": 0,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        }
      ]
    },
    {
      "id": "ch1-two-deaths-normal",
      "patched": false,
      "status": "PASS",
      "sameError": false,
      "beforeCleanup": {
        "activeCount": 2,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          },
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "timersBefore": 2,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 1
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "gain.connect",
          "id": 2,
          "value": 0.594
        },
        {
          "type": "source.connect",
          "id": 2,
          "to": "panner"
        },
        {
          "type": "panner.connect",
          "id": 1,
          "value": -0.35
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 2,
          "at": 0,
          "rate": 1.08
        },
        {
          "type": "poolPart",
          "args": [
            11,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            11,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            11,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        },
        {
          "type": "source.disconnect",
          "id": 2
        },
        {
          "type": "gain.disconnect",
          "id": 2
        },
        {
          "type": "panner.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "source",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "panner",
          "id": 1,
          "disconnected": true
        }
      ]
    },
    {
      "id": "ch1-two-deaths-normal",
      "patched": true,
      "status": "PASS",
      "sameError": false,
      "beforeCleanup": {
        "activeCount": 2,
        "nodes": [
          {
            "key": "death_flesh2",
            "pri": 4
          },
          {
            "key": "death_flesh2",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 2,
        "throttled": false
      },
      "timersBefore": 2,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.825
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 1
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "gain.connect",
          "id": 2,
          "value": 0.594
        },
        {
          "type": "source.connect",
          "id": 2,
          "to": "panner"
        },
        {
          "type": "panner.connect",
          "id": 1,
          "value": -0.35
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 2,
          "at": 0,
          "rate": 1.08
        },
        {
          "type": "poolPart",
          "args": [
            11,
            20,
            0,
            0,
            "#ffffff",
            8,
            8,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            11,
            20,
            0,
            0,
            "#ffffff",
            4,
            4,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            11,
            20,
            0.95,
            4,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        },
        {
          "type": "source.disconnect",
          "id": 2
        },
        {
          "type": "gain.disconnect",
          "id": 2
        },
        {
          "type": "panner.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "source",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 2,
          "disconnected": true
        },
        {
          "kind": "panner",
          "id": 1,
          "disconnected": true
        }
      ]
    },
    {
      "id": "ch1-boss-death-normal",
      "patched": false,
      "status": "PASS",
      "sameError": false,
      "beforeCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_boss",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "timersBefore": 1,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.75
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 0.7
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            12,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "red",
            12,
            15,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            6,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            6,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            6,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            7.5,
            0,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            5.303300858899107,
            5.303300858899106,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            4.592425496802575e-16,
            7.5,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -5.303300858899106,
            5.303300858899107,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -7.5,
            9.18485099360515e-16,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -5.3033008588991075,
            -5.303300858899106,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -1.3777276490407722e-15,
            -7.5,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            5.303300858899105,
            -5.3033008588991075,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            6,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        }
      ]
    },
    {
      "id": "ch1-boss-death-normal",
      "patched": true,
      "status": "PASS",
      "sameError": false,
      "beforeCleanup": {
        "activeCount": 1,
        "nodes": [
          {
            "key": "death_boss",
            "pri": 4
          }
        ],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "afterCleanup": {
        "activeCount": 0,
        "nodes": [],
        "deathCD": 5,
        "frameMark": 1,
        "frameN": 1,
        "throttled": false
      },
      "timersBefore": 1,
      "trace": [
        {
          "type": "gain.connect",
          "id": 1,
          "value": 0.75
        },
        {
          "type": "source.connect",
          "id": 1,
          "to": "gain"
        },
        {
          "type": "timer",
          "delay": 700
        },
        {
          "type": "source.start",
          "id": 1,
          "at": 0,
          "rate": 0.7
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            8,
            12,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "red",
            12,
            15,
            3,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            6,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            6,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            0,
            0,
            "#ffffff",
            6,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            7.5,
            0,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            5.303300858899107,
            5.303300858899106,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            4.592425496802575e-16,
            7.5,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -5.303300858899106,
            5.303300858899107,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -7.5,
            9.18485099360515e-16,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -5.3033008588991075,
            -5.303300858899106,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            -1.3777276490407722e-15,
            -7.5,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "poolPart",
          "args": [
            10,
            20,
            5.303300858899105,
            -5.3033008588991075,
            "#ffffff",
            4,
            6,
            1,
            0,
            0
          ]
        },
        {
          "type": "playVFXAng",
          "args": [
            "death_blood",
            10,
            20,
            0.95,
            6,
            3.141592653589793,
            false,
            1.5
          ]
        },
        {
          "type": "source.disconnect",
          "id": 1
        },
        {
          "type": "gain.disconnect",
          "id": 1
        }
      ],
      "rng": [
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "resources": [
        {
          "kind": "source",
          "id": 1,
          "disconnected": true
        },
        {
          "kind": "gain",
          "id": 1,
          "disconnected": true
        }
      ]
    }
  ],
  "normalEquivalence": [
    {
      "id": "ch1-two-deaths-normal",
      "exactTrace": true,
      "exactRNG": true,
      "exactState": true
    },
    {
      "id": "ch1-boss-death-normal",
      "exactTrace": true,
      "exactRNG": true,
      "exactState": true
    }
  ],
  "sourcePreserved": true,
  "policies": {
    "error": "same Error rethrow; no swallowing",
    "RAF": "unchanged; no recovery claim",
    "tail": "existing queue-finally discard unchanged; actual deathFX direct bypasses queue",
    "deathCounter": "existing consumed frameN/CD preserved, no rollback/replay",
    "priority": "unchanged",
    "rootGate": "connection-failure synchronous cleanup expands current start-only cleanup; adoption owned by root"
  },
  "productionApplied": false,
  "nativeListening": false,
  "limits": [
    "actual full deathFX/backend/mapping source, synthetic AudioNodes and held timers/VFX recorders",
    "entry is actual deathFX; upstream hurtE/kill or boss death-state/real input not executed",
    "no start/flush/constructor/RAF previous tests rerun",
    "no native device/decode/listening"
  ],
  "capacity": {
    "allowNewOwnedFiles": false,
    "observedChanges": 82,
    "newFiles": 0
  }
}

```

Executed module SHA256: 0477d2b3465e03148192d9110228751858df2e69415fc8ebbf078fe6490f8fc2

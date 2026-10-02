# SOUND 1700 — 전투 HTMLAudio 풀 경계 조사

완료ID: SOUND-combat-htmlaudio-pool-boundary-audit-1700
판정: NOT_APPLICABLE_CURRENT_SOURCE. 현재 양판 전투 SFX에는 HTMLAudioElement 풀이 없다. 전투 샘플은 createBufferSource/start이며 play() 거절 Promise가 없다. new Audio는 각 판 BGM 캐시 1곳과 인트로 음성 1곳이다. 로비/BGM/큐/음소거 검사는 반복하지 않았다.

이번 신규 동작 실행 0. 정적 source toolID d9e7b4. 실제 앱/디바이스/청취/세이브/생산/Git/공유 docs 변경 0. 기존 목표 blocked 유지.

## 현재 source 근거

```json
{
  "completionId": "SOUND-combat-htmlaudio-pool-boundary-audit-1700",
  "status": "NOT_APPLICABLE_CURRENT_SOURCE",
  "rows": [
    {
      "file": "game.html",
      "sourceSHA": "fd4e55dfefad0985870dc3f6dc1633793dad22e48ddb336dda881cdd4edbfe17",
      "newAudio": [
        {
          "line": 4022,
          "context": "\n    if(!this._cache[src]){const a=new Audio(src);a.preload='auto';a.onerror=()=>{BGM._badSrcs[src]=1;delete BGM._cache[src];const i=BGM._cacheLRU.indexOf(src);if(i>=0)BGM._cacheLRU.splice(i,1);if(BGM._cur===a){BGM._cur=null;setTimeout(BGM._onEnded,300)}};this._cache[src]=a}"
        },
        {
          "line": 60728,
          "context": ", PRO 구간 BGM 대신 재생\nconst _proVoice=new Audio('bgm/공통/intro_voice.mp3');"
        }
      ],
      "blocks": {
        "playSample": {
          "sha": "4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79",
          "line": 11906
        },
        "playSampleAt": {
          "sha": "2b6d2ba5f961e65d5467c02401616c25105a1f8834c584d6c5692e6e67c49c07",
          "line": 11920
        },
        "_playSampleNow": {
          "sha": "edaa50841ca6c897a30c812035b018c0b09c4db2510ddae7337965c6ce0d336d",
          "line": 11801
        },
        "deathFX": {
          "sha": "1a675676500ebd0cd005a802f9628d60462bf373468246d64f126130f2a686ec",
          "line": 23527
        }
      },
      "htmlAudioDeclaration": false,
      "sampleBackend": "AudioBufferSourceNode createBufferSource/start; no HTMLAudio play Promise"
    },
    {
      "file": "game-easy-test.html",
      "sourceSHA": "db6019a1027464695fcc20b509db05f301eaf23ccc517a70ff8aedeadb61529c",
      "newAudio": [
        {
          "line": 3791,
          "context": "\n    if(!this._cache[src]){const a=new Audio(src);a.preload='auto';a.onerror=()=>{BGM._badSrcs[src]=1;delete BGM._cache[src];const i=BGM._cacheLRU.indexOf(src);if(i>=0)BGM._cacheLRU.splice(i,1);if(BGM._cur===a){BGM._cur=null;setTimeout(BGM._onEnded,300)}};this._cache[src]=a}"
        },
        {
          "line": 59056,
          "context": ", PRO 구간 BGM 대신 재생\nconst _proVoice=new Audio('bgm/공통/intro_voice.mp3');"
        }
      ],
      "blocks": {
        "playSample": {
          "sha": "4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79",
          "line": 11310
        },
        "playSampleAt": {
          "sha": "2b6d2ba5f961e65d5467c02401616c25105a1f8834c584d6c5692e6e67c49c07",
          "line": 11324
        },
        "_playSampleNow": {
          "sha": "edaa50841ca6c897a30c812035b018c0b09c4db2510ddae7337965c6ce0d336d",
          "line": 11205
        },
        "deathFX": {
          "sha": "1a675676500ebd0cd005a802f9628d60462bf373468246d64f126130f2a686ec",
          "line": 22557
        }
      },
      "htmlAudioDeclaration": false,
      "sampleBackend": "AudioBufferSourceNode createBufferSource/start; no HTMLAudio play Promise"
    }
  ],
  "behaviorExecutions": 0,
  "previousHoldBehaviorReruns": 0
}
```

## 재사용한 1653 정책 HOLD 후보

candidate.patch는 1700의 새 결함 수정이 아니라 기존 SOUND-death-direct-sample-isolation-policy-1653 후보의 저장본이다. 적용 금지/HOLD: root의 소비 예외 격리 정책 승인 전에는 채택하지 않는다. backend 동일 Error 전파 및 큐 finally 계약은 변경하지 않는다. deathFX 사망음 호출만 전용 wrapper로 격리한다.

기존 toolID d96dd1, 8실행/정상 exact 2쌍. 이번 재실행 0. 원본 deathFX SHA 1a675676500ebd0cd005a802f9628d60462bf373468246d64f126130f2a686ec. 후보 helper+deathFX SHA 06d74ed4fabd642c4c88572b42b67656e05ff7b29902d6b7366bc19f97caeece. helper SHA 9e29ba4b28059e92b5d1db600a98606d0dab1dea500fe59e4a86c9159cacb19b.

실제 _playSampleNow 노드 생성 전 예외 대역에서 원본 deathFX가 반환하지 않으며 후보는 후속 파티클·피 효과와 반환을 보존했다. 실제 hurtE/drop/획득 실행이 아니므로 획득 복구를 주장하지 않는다. context 생성/start/connect/축출 등 모든 실패 사이트를 검증한 후보가 아니다. 후보 catch는 그보다 넓은 예외를 소비하므로 root 추가 범위 판단 필요.

stdout 후보 문자열 일부가 잘렸으나 8기록/trace/RNG 및 종료 필드는 보존됐다. 후보는 현재 block SHA로 재구성했으며 정상 검사는 재실행하지 않았다.

```json
[
  {
    "file": "game.html",
    "fault": false,
    "patched": false,
    "sameError": false,
    "reachedAfterSound": true,
    "trace": [
      [
        "createSource"
      ],
      [
        "gainConnect"
      ],
      [
        "srcConnect"
      ],
      [
        "start"
      ],
      [
        "particle",
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
      ],
      [
        "particle",
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
      ],
      [
        "blood",
        "death_blood",
        10,
        20,
        0.95,
        4,
        3.141592653589793,
        false,
        1.5
      ]
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
      0.5
    ]
  },
  {
    "file": "game.html",
    "fault": false,
    "patched": true,
    "sameError": false,
    "reachedAfterSound": true,
    "trace": [
      [
        "createSource"
      ],
      [
        "gainConnect"
      ],
      [
        "srcConnect"
      ],
      [
        "start"
      ],
      [
        "particle",
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
      ],
      [
        "particle",
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
      ],
      [
        "blood",
        "death_blood",
        10,
        20,
        0.95,
        4,
        3.141592653589793,
        false,
        1.5
      ]
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
      0.5
    ]
  },
  {
    "file": "game.html",
    "fault": true,
    "patched": false,
    "sameError": true,
    "reachedAfterSound": false,
    "trace": [
      [
        "createSource"
      ]
    ],
    "rng": [
      0.5,
      0.5,
      0.5
    ]
  },
  {
    "file": "game.html",
    "fault": true,
    "patched": true,
    "sameError": false,
    "reachedAfterSound": true,
    "trace": [
      [
        "createSource"
      ],
      [
        "particle",
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
      ],
      [
        "particle",
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
      ],
      [
        "blood",
        "death_blood",
        10,
        20,
        0.95,
        4,
        3.141592653589793,
        false,
        1.5
      ]
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
      0.5
    ]
  },
  {
    "file": "game-easy-test.html",
    "fault": false,
    "patched": false,
    "sameError": false,
    "reachedAfterSound": true,
    "trace": [
      [
        "createSource"
      ],
      [
        "gainConnect"
      ],
      [
        "srcConnect"
      ],
      [
        "start"
      ],
      [
        "particle",
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
      ],
      [
        "particle",
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
      ],
      [
        "blood",
        "death_blood",
        10,
        20,
        0.95,
        4,
        3.141592653589793,
        false,
        1.5
      ]
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
      0.5
    ]
  },
  {
    "file": "game-easy-test.html",
    "fault": false,
    "patched": true,
    "sameError": false,
    "reachedAfterSound": true,
    "trace": [
      [
        "createSource"
      ],
      [
        "gainConnect"
      ],
      [
        "srcConnect"
      ],
      [
        "start"
      ],
      [
        "particle",
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
      ],
      [
        "particle",
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
      ],
      [
        "blood",
        "death_blood",
        10,
        20,
        0.95,
        4,
        3.141592653589793,
        false,
        1.5
      ]
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
      0.5
    ]
  },
  {
    "file": "game-easy-test.html",
    "fault": true,
    "patched": false,
    "sameError": true,
    "reachedAfterSound": false,
    "trace": [
      [
        "createSource"
      ]
    ],
    "rng": [
      0.5,
      0.5,
      0.5
    ]
  },
  {
    "file": "game-easy-test.html",
    "fault": true,
    "patched": true,
    "sameError": false,
    "reachedAfterSound": true,
    "trace": [
      [
        "createSource"
      ],
      [
        "particle",
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
      ],
      [
        "particle",
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
      ],
      [
        "blood",
        "death_blood",
        10,
        20,
        0.95,
        4,
        3.141592653589793,
        false,
        1.5
      ]
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
      0.5
    ]
  }
]
```

## docs 검색 및 정정표

| id | 현행/근거 | 후보 또는 기록 | Gate |
|---|---|---|---|
| COMBAT_AUDIO_BACKEND | 양판 _playSampleNow는 AudioBufferSourceNode.start | HTMLAudio pool play Promise 검증 대상 없음 | 다른 backend로 바뀌면 별도 조사 |
| DEATH_AUDIO_ERROR | backend는 같은 Error 전파; deathFX 직접 호출 | 전용 소비 wrapper의 격리는 기존 HOLD 후보 | root 정책 승인/docs 동기화 |
| FOLLOWUP_ACQUISITION | 후속 deathFX 효과 및 반환만 source 대조 | 실제 hurtE/drop/획득 회복 주장 없음 | 실제 caller 및 native 검수 |
| DOCS_SOURCE | docs/6사운드디자인/6사운드디자인.md §샘플 시작/프레임 큐 예외 정리 | 정책 결정 후 관련 전투/사망음/VFX docs를 root가 갱신 | 공유 docs 미수정 |

docs 전체 키워드 검색 실행: HTMLAudio|AudioBufferSource|_sfxRing|_playSampleNow|deathFX|사망음. 검색 tool 출력은 메모리 sound_1700_docs_raw에 보존.

## 배정/저장

SUPERVISOR-SOUND-1700이 실제 전달한 기존 SOUND 예약2를 소비하여 새 고유 폴더 candidate.patch+result.md 2파일만 생성. 구 제출 폴더 불변. state의 remaining0/reserved2 표시는 메시지 전달 이전 스냅샷으로 확인됐으며 별도 state 변경은 하지 않았다.

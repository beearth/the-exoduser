# BALANCE — 실제 물약 caller 및 음수 쿨감 소비 후보

완료 ID: BALANCE-potion-affix-sign-cooldown-1328.
저장 epoch: rolling-after-0d918990-1326. 새소유파일2개 result.md/checks.mjs. 기존 산출 수정0, 저장 후 재실행0. production/shared docs/Git/사용자 게임/save 조작0. checks.mjs는 앞서 Node exit0으로 실행한 stdin 코드의 정확한 보존본이다.

## 새 경제 결함과 최소 후보

현행 AFFIX_POOL의 potionCdRed는 벨트 음수 감소값 -0.04/-0.07/-0.11/-0.16/-0.22를 정의한다. 실제 rollAffixes를 해당 정의만 포함한 제한 풀에서 실행한 뒤, 실제 _eqAffix 집계와 전체 useQuickslot 및 다음 프레임 qsCooldown 갱신을 연결했다. 기존 소비자는 음수값을 다시 빼므로 쿨다운을 늘린다.

| id | 정상 생성값 | 원문 사용 후 CD | 후보 사용 후 CD | 다음 frame 원문/후보 |
|---|---:|---:|---:|---:|
| 무어픽스 control | 0 | 420 | 420 | 419 / 419 |
| potionCdRed 하옵 | -0.04 | 436 | 403 | 435 / 402 |
| potionCdRed 상옵 | -0.22 | 512 | 336 | 511 / 335 |

후보: Math.min(_eqAffix('potionCdRed'),.2) → Math.min(Math.max(0,-_eqAffix('potionCdRed')),.2).
소비부에서 부호를 감소량으로 해석하며 기존 cap20%, base420f, minimum6f를 유지한다. affix tier 값과 저장 형식은 바꾸지 않는다. HP150→250, 악의5→4, 무어픽스의 CD 및 trace 동일. 어픽스 입력에서는 CD만 의도대로 정정하며 RNG/회복/비용/효과 순서는 원문·후보 동일하다. 양판×3입력×2정책=12 새실행 exit0. 자동 물약 소비부는 potionCdRed를 읽지 않으며 이 후보는 자동 경로를 변경하지 않는다.

제한 풀 실행은 전체 드롭 확률/분포 검증이 아니다. DOM/음향/효과를 대역 처리했으며 실제 게임·native 입력·저장·시연 인수가 아니다. 제한 풀·RNG0/0.999999는 정상 부호와 양 끝 값을 재현하는 fixture다.

## docs/루트 통합 인계

후보 후 전체 docs rg potionCdRed|물약쿨감|물약.*쿨다운|useQuickslot = exit0/23매치. docs/2_8의 수동 물약 CD 공식과 docs/7의 부호 소비 위치를 표로 동기화해야 한다. 같은 음수 tiers를 유지하고 reduction=min(max(0,-sum),0.2), CD=max(6,trunc(420×(1-gl-blt-regen-reduction)))을 기록한다. 자동/수동 공유쿨다운 정책을 이 부호 수정에 섞지 않는다. QSLOTS 구조/POT 객체/useQuickslot 시그니처 및 protected2_3 변경0. 공유source/docs/Git 적용은 총괄 소유다.

같은 useQuickslot에 별도 fallen guard 후보가 있으므로 전체 함수를 덮어쓰지 말고 두 치환을 root 현재 WIP에 병합해야 한다. 아래 후보 원본SHA는 해당 읽기 시점 기준이다.

## 정확 새 후보 및 source evidence

```json
{
  "completionId": "BALANCE-potion-affix-sign-cooldown-1328",
  "evidence": {
    "task": "BALANCE-potion-affix-sign-cooldown-1328",
    "at": "2026-10-02T13:27:26.096Z",
    "sources": [
      {
        "file": "game.html",
        "wholeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "anchors": {
          "rollAffixes": "b9580a70fcc9e652d794521ca6d9afd8c83b317135634662b695eeda43f49a09",
          "_eqAffix": "71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a",
          "_eqAffixRebuild": "2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03",
          "useQuickslot": "9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483",
          "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7"
        },
        "affixDefinitionSHA": "bcd21766fae19063b59307a35f7ce7c0de916804721bb49ff10263c94db9769f",
        "qsTickSHA": "f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d",
        "patch": {
          "old": "Math.min(_eqAffix('potionCdRed'),.2)",
          "newer": "Math.min(Math.max(0,-_eqAffix('potionCdRed')),.2)"
        },
        "candidateSHA": "b9d27f20387140dcb6672c2cc6f9b563284c4e5ba1c91d670c7537e65a1de97b"
      },
      {
        "file": "game-easy-test.html",
        "wholeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "anchors": {
          "rollAffixes": "b9580a70fcc9e652d794521ca6d9afd8c83b317135634662b695eeda43f49a09",
          "_eqAffix": "71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a",
          "_eqAffixRebuild": "2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03",
          "useQuickslot": "0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60",
          "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7"
        },
        "affixDefinitionSHA": "bcd21766fae19063b59307a35f7ce7c0de916804721bb49ff10263c94db9769f",
        "qsTickSHA": "f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d",
        "patch": {
          "old": "Math.min(_eqAffix('potionCdRed'),.2)",
          "newer": "Math.min(Math.max(0,-_eqAffix('potionCdRed')),.2)"
        },
        "candidateSHA": "f49008d8ca693ffbe675887e1219cea3df5b834ecd2c22f17d2d31aff21eb86b"
      }
    ],
    "rows": [
      {
        "file": "game.html",
        "input": "no-affix",
        "policy": "current",
        "affixValue": 0,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 420
        },
        "afterFrameCD": 419,
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game.html",
        "input": "no-affix",
        "policy": "candidate",
        "affixValue": 0,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 420
        },
        "afterFrameCD": 419,
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game.html",
        "input": "generated-low-tier",
        "policy": "current",
        "affixValue": -0.04,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 436
        },
        "afterFrameCD": 435,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game.html",
        "input": "generated-low-tier",
        "policy": "candidate",
        "affixValue": -0.04,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 403
        },
        "afterFrameCD": 402,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game.html",
        "input": "generated-high-tier",
        "policy": "current",
        "affixValue": -0.22,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 512
        },
        "afterFrameCD": 511,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game.html",
        "input": "generated-high-tier",
        "policy": "candidate",
        "affixValue": -0.22,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 336
        },
        "afterFrameCD": 335,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game-easy-test.html",
        "input": "no-affix",
        "policy": "current",
        "affixValue": 0,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 420
        },
        "afterFrameCD": 419,
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game-easy-test.html",
        "input": "no-affix",
        "policy": "candidate",
        "affixValue": 0,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 420
        },
        "afterFrameCD": 419,
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game-easy-test.html",
        "input": "generated-low-tier",
        "policy": "current",
        "affixValue": -0.04,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 436
        },
        "afterFrameCD": 435,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game-easy-test.html",
        "input": "generated-low-tier",
        "policy": "candidate",
        "affixValue": -0.04,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 403
        },
        "afterFrameCD": 402,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game-easy-test.html",
        "input": "generated-high-tier",
        "policy": "current",
        "affixValue": -0.22,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 512
        },
        "afterFrameCD": 511,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      },
      {
        "file": "game-easy-test.html",
        "input": "generated-high-tier",
        "policy": "candidate",
        "affixValue": -0.22,
        "after": {
          "hp": 250,
          "mats": 4,
          "cd": 336
        },
        "afterFrameCD": 335,
        "trace": [
          "RNG",
          "RNG",
          "potion",
          "text",
          "parts",
          "updateQS"
        ]
      }
    ],
    "sourceRuns": 12,
    "docs": {
      "query": "potionCdRed|물약쿨감|물약.*쿨다운|useQuickslot",
      "exitCode": 0,
      "matches": 23,
      "sha": "47c564e4af9224f5c04cc5cbeb3d8325be98bb3a0b7081801a8d0f384bf007ab"
    },
    "limits": [
      "Actual rollAffixes executed with restricted pool containing dynamically extracted potionCdRed definition; whole loot distribution not simulated",
      "Actual _eqAffix aggregation and full useQuickslot body, following quickslot cooldown block executed; no native gameplay/frame",
      "Candidate corrects negative reduction sign to nonnegative reduction; existing cap20%,base420,min6 unchanged. Auto-path does not use potionCdRed and is untouched",
      "No affix control HP/cost/cooldown/trace unchanged; affixed controls intentionally correct cooldown, RNG/effects/HP/cost traces unchanged",
      "Audio/DOM/save/game not verified; root production/docs adoption needed"
    ],
    "productionApplied": false,
    "newFiles": 0
  },
  "candidate": "useQuickslot: Math.min(_eqAffix('potionCdRed'),.2) → Math.min(Math.max(0,-_eqAffix('potionCdRed')),.2)",
  "docsHandoff": "Root only: synchronize docs/2_8 cooldown reduction formula and docs/7 existing signed tier consumption mapping. Negative AFFIX tiers remain [-.04,-.07,-.11,-.16,-.22]; consumer converts sign to reduction magnitude and cap20%. Base420/min6/heal/cost untouched; auto path not changed. Include table id/type/tiers/apply-location/formula/current vs candidate cooldown. protected2_3 unchanged.",
  "sourceRuns": 12,
  "rootIntegrationRequired": true,
  "newFiles": 0
}
```

## 새 쿨감 검사의 완전한 도구 receipt

```json
{
  "chunk_id": "364e39",
  "wall_time_seconds": 0.000007083,
  "exit_code": 0,
  "original_token_count": 1860,
  "output": "{\n  \"task\": \"BALANCE-potion-affix-sign-cooldown-1328\",\n  \"at\": \"2026-10-02T13:27:26.096Z\",\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"anchors\": {\n        \"rollAffixes\": \"b9580a70fcc9e652d794521ca6d9afd8c83b317135634662b695eeda43f49a09\",\n        \"_eqAffix\": \"71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a\",\n        \"_eqAffixRebuild\": \"2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03\",\n        \"useQuickslot\": \"9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\"\n      },\n      \"affixDefinitionSHA\": \"bcd21766fae19063b59307a35f7ce7c0de916804721bb49ff10263c94db9769f\",\n      \"qsTickSHA\": \"f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d\",\n      \"patch\": {\n        \"old\": \"Math.min(_eqAffix('potionCdRed'),.2)\",\n        \"newer\": \"Math.min(Math.max(0,-_eqAffix('potionCdRed')),.2)\"\n      },\n      \"candidateSHA\": \"b9d27f20387140dcb6672c2cc6f9b563284c4e5ba1c91d670c7537e65a1de97b\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"anchors\": {\n        \"rollAffixes\": \"b9580a70fcc9e652d794521ca6d9afd8c83b317135634662b695eeda43f49a09\",\n        \"_eqAffix\": \"71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a\",\n        \"_eqAffixRebuild\": \"2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03\",\n        \"useQuickslot\": \"0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\"\n      },\n      \"affixDefinitionSHA\": \"bcd21766fae19063b59307a35f7ce7c0de916804721bb49ff10263c94db9769f\",\n      \"qsTickSHA\": \"f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d\",\n      \"patch\": {\n        \"old\": \"Math.min(_eqAffix('potionCdRed'),.2)\",\n        \"newer\": \"Math.min(Math.max(0,-_eqAffix('potionCdRed')),.2)\"\n      },\n      \"candidateSHA\": \"f49008d8ca693ffbe675887e1219cea3df5b834ecd2c22f17d2d31aff21eb86b\"\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"input\": \"no-affix\",\n      \"policy\": \"current\",\n      \"affixValue\": 0,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420\n      },\n      \"afterFrameCD\": 419,\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"input\": \"no-affix\",\n      \"policy\": \"candidate\",\n      \"affixValue\": 0,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420\n      },\n      \"afterFrameCD\": 419,\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"input\": \"generated-low-tier\",\n      \"policy\": \"current\",\n      \"affixValue\": -0.04,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 436\n      },\n      \"afterFrameCD\": 435,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"input\": \"generated-low-tier\",\n      \"policy\": \"candidate\",\n      \"affixValue\": -0.04,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 403\n      },\n      \"afterFrameCD\": 402,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"input\": \"generated-high-tier\",\n      \"policy\": \"current\",\n      \"affixValue\": -0.22,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 512\n      },\n      \"afterFrameCD\": 511,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"input\": \"generated-high-tier\",\n      \"policy\": \"candidate\",\n      \"affixValue\": -0.22,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 336\n      },\n      \"afterFrameCD\": 335,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"input\": \"no-affix\",\n      \"policy\": \"current\",\n      \"affixValue\": 0,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420\n      },\n      \"afterFrameCD\": 419,\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"input\": \"no-affix\",\n      \"policy\": \"candidate\",\n      \"affixValue\": 0,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 420\n      },\n      \"afterFrameCD\": 419,\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"input\": \"generated-low-tier\",\n      \"policy\": \"current\",\n      \"affixValue\": -0.04,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 436\n      },\n      \"afterFrameCD\": 435,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"input\": \"generated-low-tier\",\n      \"policy\": \"candidate\",\n      \"affixValue\": -0.04,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 403\n      },\n      \"afterFrameCD\": 402,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"input\": \"generated-high-tier\",\n      \"policy\": \"current\",\n      \"affixValue\": -0.22,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 512\n      },\n      \"afterFrameCD\": 511,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"input\": \"generated-high-tier\",\n      \"policy\": \"candidate\",\n      \"affixValue\": -0.22,\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 4,\n        \"cd\": 336\n      },\n      \"afterFrameCD\": 335,\n      \"trace\": [\n        \"RNG\",\n        \"RNG\",\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\"\n      ]\n    }\n  ],\n  \"sourceRuns\": 12,\n  \"docs\": {\n    \"query\": \"potionCdRed|물약쿨감|물약.*쿨다운|useQuickslot\",\n    \"exitCode\": 0,\n    \"matches\": 23,\n    \"sha\": \"47c564e4af9224f5c04cc5cbeb3d8325be98bb3a0b7081801a8d0f384bf007ab\"\n  },\n  \"limits\": [\n    \"Actual rollAffixes executed with restricted pool containing dynamically extracted potionCdRed definition; whole loot distribution not simulated\",\n    \"Actual _eqAffix aggregation and full useQuickslot body, following quickslot cooldown block executed; no native gameplay/frame\",\n    \"Candidate corrects negative reduction sign to nonnegative reduction; existing cap20%,base420,min6 unchanged. Auto-path does not use potionCdRed and is untouched\",\n    \"No affix control HP/cost/cooldown/trace unchanged; affixed controls intentionally correct cooldown, RNG/effects/HP/cost traces unchanged\",\n    \"Audio/DOM/save/game not verified; root production/docs adoption needed\"\n  ],\n  \"productionApplied\": false,\n  \"newFiles\": 0\n}\n"
}
```

## 함께 보존하는 미저장 fallen 소비 후보

완료 ID BALANCE-die-keydown-quick-auto-two-cd-1315. 실제 전체 keydown→useQuickslot→auto 블록 및 다음 cooldown 갱신에서 fallen HP0인데 물약키가 HP100/악의-1/QS CD420을 만들고 auto가 HP200/악의추가-1/CD420을 만들었다. 후보는 useQuickslot의 기존 !G.on/G.paused gate에 P.hp<=0/두 상태(fallen/dead)를 포함하여 stats/currency/sound/CD 이전에 반환한다. 시그니처·QSLOTS·POT·정상 회복 비용/량/쿨다운은 유지한다. 최대HP/정상 결손 control을 포함한 최초12건, actual die로 fallen을 만든 뒤 두 쿨다운 블록을 연결한 추가4건이다. 이전 Infinity/0heal/bulk 검사는 반복하지 않았다. 최초12는 QS per-frame decrement를 실행하지 않은 한계가 있고 추가4에서 그 source 블록을 실제로 연결해 QS420→419→418, auto0→420→419를 확인했다. 추가 검사 첫 시도는 _eqImplicit 대역 누락으로 die 도중 실패; 보완 뒤4건 통과했다.

전체 docs rg48매치. docs/2_8의 useQuickslot 가드와 docs/2_5의 fallen/dead 모든 행동 차단 구현 상태를 일치시킬 인계다. protected2_3은 수정하지 않는다. 실제 화면/게임/입력/저장/전체 update는 미검증이다.

```json
{
  "completionId": "BALANCE-die-keydown-quick-auto-two-cd-1315",
  "primaryEvidence": {
    "task": "BALANCE-die-keydown-quick-auto-two-cd-1315",
    "at": "2026-10-02T13:14:45.877Z",
    "sources": [
      {
        "file": "game.html",
        "wholeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "quickSHA": "9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483",
        "handlerSHA": "9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a",
        "autoSHA": "356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455",
        "candidateSHA": "4a892b8489d80d5ab09fa054d81a642f4d6e2b979dec4ca8e6069acbb3901189",
        "dieSHA": "a52d3c1519b37111857658a8255e53fe3534a3679bd9f117abb2d4b6ab6cddac",
        "qsTickSHA": "f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d",
        "patch": {
          "old": "if(!G.on||G.paused)return;",
          "newer": "if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;"
        }
      },
      {
        "file": "game-easy-test.html",
        "wholeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "quickSHA": "0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60",
        "handlerSHA": "9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a",
        "autoSHA": "356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455",
        "candidateSHA": "26edf7db17cf48cc88f424bd66c30778755c4468ad356d21f206ddad4eb1f04d",
        "dieSHA": "a52d3c1519b37111857658a8255e53fe3534a3679bd9f117abb2d4b6ab6cddac",
        "qsTickSHA": "f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d",
        "patch": {
          "old": "if(!G.on||G.paused)return;",
          "newer": "if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;"
        }
      }
    ],
    "rows": [
      {
        "file": "game.html",
        "scenario": "fallen-zero-HP",
        "policy": "current",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 100,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 200,
          "mats": 1,
          "qCd": 419,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 200,
          "mats": 1,
          "qCd": 418,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game.html",
        "scenario": "fallen-zero-HP",
        "policy": "candidate",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "preventDefault"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "fallen-zero-HP",
        "policy": "current",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 100,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 200,
          "mats": 1,
          "qCd": 419,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 200,
          "mats": 1,
          "qCd": 418,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "fallen-zero-HP",
        "policy": "candidate",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "preventDefault"
        ]
      }
    ],
    "sourceRuns": 4,
    "docs": {
      "query": "useQuickslot|fallen/dead|쓰러짐.*행동|물약.*쿨|자동.*물약",
      "exitCode": 0,
      "matches": 48,
      "sha": "72d26058d4c0815473e37f583eaa9a931a71dad29415851017dd4ec1a02c59e1"
    },
    "limits": [
      "Actual full keydown listener and useQuickslot body with automatic-potion source block connected; full update/native frame not executed",
      "Actual die function establishes fallen HP0; actual quickslot decrement block runs before automatic potion block each following source frame. Current qCd420→419→418, auto0→420→419; candidate both remain0. Full update/native not executed",
      "All pot levels finite0; no prior Infinity/zero-heal fixtures rerun",
      "HP/ST/MP current=max control uses hp350/st100/mp80; only implemented HP potion exists, ST/MP types unimplemented",
      "DOM/audio/stats visuals stubbed; actual game/save/input acceptance root only"
    ],
    "productionApplied": false,
    "newFiles": 0
  },
  "normalControlEvidence": {
    "task": "BALANCE-keydown-fallen-manual-auto-economy-1308",
    "at": "2026-10-02T13:14:03.647Z",
    "sources": [
      {
        "file": "game.html",
        "wholeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "quickSHA": "9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483",
        "handlerSHA": "9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a",
        "autoSHA": "356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455",
        "candidateSHA": "4a892b8489d80d5ab09fa054d81a642f4d6e2b979dec4ca8e6069acbb3901189",
        "patch": {
          "old": "if(!G.on||G.paused)return;",
          "newer": "if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;"
        }
      },
      {
        "file": "game-easy-test.html",
        "wholeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "quickSHA": "0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60",
        "handlerSHA": "9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a",
        "autoSHA": "356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455",
        "candidateSHA": "26edf7db17cf48cc88f424bd66c30778755c4468ad356d21f206ddad4eb1f04d",
        "patch": {
          "old": "if(!G.on||G.paused)return;",
          "newer": "if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;"
        }
      }
    ],
    "rows": [
      {
        "file": "game.html",
        "scenario": "maximum-HP",
        "policy": "current",
        "before": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "showPH",
          "preventDefault"
        ]
      },
      {
        "file": "game.html",
        "scenario": "maximum-HP",
        "policy": "candidate",
        "before": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "showPH",
          "preventDefault"
        ]
      },
      {
        "file": "game.html",
        "scenario": "normal-deficit",
        "policy": "current",
        "before": {
          "hp": 150,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 250,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game.html",
        "scenario": "normal-deficit",
        "policy": "candidate",
        "before": {
          "hp": 150,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 250,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game.html",
        "scenario": "fallen-zero-HP",
        "policy": "current",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 100,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 200,
          "mats": 1,
          "qCd": 420,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 200,
          "mats": 1,
          "qCd": 420,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game.html",
        "scenario": "fallen-zero-HP",
        "policy": "candidate",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "preventDefault"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "maximum-HP",
        "policy": "current",
        "before": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "showPH",
          "preventDefault"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "maximum-HP",
        "policy": "candidate",
        "before": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 350,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "showPH",
          "preventDefault"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "normal-deficit",
        "policy": "current",
        "before": {
          "hp": 150,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 250,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "normal-deficit",
        "policy": "candidate",
        "before": {
          "hp": 150,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 250,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 350,
          "mats": 1,
          "qCd": 420,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "fallen-zero-HP",
        "policy": "current",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 100,
          "mats": 2,
          "qCd": 420,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 200,
          "mats": 1,
          "qCd": 420,
          "autoCd": 420
        },
        "afterNext": {
          "hp": 200,
          "mats": 1,
          "qCd": 420,
          "autoCd": 419
        },
        "stats": {
          "potions": 2
        },
        "trace": [
          "potion",
          "text",
          "parts",
          "updateQS",
          "preventDefault",
          "potion",
          "text"
        ]
      },
      {
        "file": "game-easy-test.html",
        "scenario": "fallen-zero-HP",
        "policy": "candidate",
        "before": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterSelection": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterAuto": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "afterNext": {
          "hp": 0,
          "mats": 3,
          "qCd": 0,
          "autoCd": 0
        },
        "stats": {
          "potions": 0
        },
        "trace": [
          "preventDefault"
        ]
      }
    ],
    "sourceRuns": 12,
    "docs": {
      "query": "useQuickslot|fallen/dead|쓰러짐.*행동|물약.*쿨|자동.*물약",
      "exitCode": 0,
      "matches": 48,
      "sha": "cd62ba8778dde44dd529f8b35f623db3c45c4a6d275352c45642eea80f94bfef"
    },
    "limits": [
      "Actual full keydown listener and useQuickslot body with automatic-potion source block connected; full update/native frame not executed",
      "Two auto block calls model following frame only for autoPotCd; quickslot per-frame cooldown decrement not modeled, qCd remains420 in evidence",
      "All pot levels finite0; no prior Infinity/zero-heal fixtures rerun",
      "HP/ST/MP current=max control uses hp350/st100/mp80; only implemented HP potion exists, ST/MP types unimplemented",
      "DOM/audio/stats visuals stubbed; actual game/save/input acceptance root only"
    ],
    "productionApplied": false,
    "newFiles": 0
  },
  "failedSupplementAttempt": {
    "chunk_id": "371df8",
    "wall_time_seconds": 0.000006208,
    "exit_code": 1,
    "original_token_count": 205,
    "output": "evalmachine.<anonymous>:21\n  const _revPowBonus=_eqAffix('revivePow')+_eqImplicit('_iRevPow')*.01+_revZoneBonus;\n                     ^\n\nReferenceError: _eqImplicit is not defined\n    at die (evalmachine.<anonymous>:21:22)\n    at evalmachine.<anonymous>:1:1\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:20:4\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\n\nNode.js v24.15.0\n"
  },
  "sourceCandidate": "useQuickslot existing !G.on/G.paused gate extends to P.hp<=0 or fallen/dead before stats/currency/sound/cooldown. Signature,QSLOTS,POT,healing/cost/cooldown formulas unchanged.",
  "verifiedRuns": {
    "keydownManualAutoControls": 12,
    "actualDieAndBothCooldownFrames": 4
  },
  "limits": "Supplement's maximum-HP control label inherited initial harness; only primary control12 contains normal/max scenario. Actual die supplementary4 establishes natural fallen state and decrements both actual cooldown blocks. Full update/native not executed. Failure1 lacked _eqImplicit stub before comparison; fixed and source4 exit0. Old completed tests rerun0.",
  "docsHandoff": "Root adds useQuickslot guard contract to docs/2_8 and aligns death all-actions-blocked implementation state in docs/2_5. Whole docs rg executed after candidate48 matches; protected2_3 untouched.",
  "productionApplied": false,
  "newFiles": 0
}
```

### fallen caller 최초 성공 stdin 원문

```javascript
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';
const sha=x=>createHash('sha256').update(x).digest('hex');
function extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}
function balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}

const rows=[],sources=[];
for(const file of ['game.html','game-easy-test.html']){
const s=fs.readFileSync(file,'utf8'),quick=extract(s,'useQuickslot'),heal=extract(s,'potHeal');
const marker="addEventListener('keydown',";const position=s.lastIndexOf(marker,s.indexOf('// ESC → 뒤로가기'));assert(position>=0);const handler=balanced(s,position+marker.length);parse('const handler='+handler,{ecmaVersion:'latest'});
const autoStart=s.indexOf('  if(autoPotCd>0)autoPotCd-=sp;'),autoEnd=s.indexOf('  // ─── [S16c]',autoStart);assert(autoStart>=0&&autoEnd>autoStart);const auto=s.slice(autoStart,autoEnd);
const old="if(!G.on||G.paused)return;",newer="if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;";
const candidate=quick.replace(old,newer);assert.notEqual(candidate,quick);
sources.push({file,wholeSHA:sha(s),quickSHA:sha(quick),handlerSHA:sha(handler),autoSHA:sha(auto),candidateSHA:sha(candidate),patch:{old,newer}});
for(const scenario of [{id:'maximum-HP',hp:350,state:'idle'},{id:'normal-deficit',hp:150,state:'idle'},{id:'fallen-zero-HP',hp:0,state:'fallen'}])for(const policy of ['current','candidate']){
const trace=[],P={hp:scenario.hp,mhp:350,mp:80,mmp:80,st:100,mst:100,s:scenario.state,skills:{},x:0,y:0},G={on:true,paused:false,mats:3,_pStats:{_hC:0},_sStats:{potions:0}};
const nodes={},$=id=>nodes[id]??={classList:{contains:()=>false,add:()=>{},remove:()=>{}},offsetWidth:0};
const c={P,G,QSLOTS:[{type:'hp',count:1},{type:null},{type:null},{type:null}],qsCooldown:[0,0,0,0],POT:{hp:{col:'#33cc66'}},POT_LV:{hp:0},autoPotCd:0,sp:1,PASSIVES:{pRegen:0},SKILL_SLOTS:Array(6).fill(null),window:{},K:{},KH:{},BINDS:{},BINDS2:{},listeningBind:null,_cutsceneState:'NONE',Element:class {},SFX:{potion:()=>trace.push('potion')},gl:()=>({}),blt:()=>({}),_eqAffix:()=>0,_T:x=>x,showPH:()=>trace.push('showPH'),addTxt:()=>trace.push('text'),addParts:()=>trace.push('parts'),updateQS:()=>trace.push('updateQS'),$,Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}})};
const ctx=vm.createContext(c);vm.runInContext(heal+'\n'+(policy==='current'?quick:candidate)+'\nconst handler='+handler+';\nfunction nextAuto(){'+auto+'}',ctx);
const before={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
c.e={code:'Digit1',repeat:false,preventDefault:()=>trace.push('preventDefault')};
vm.runInContext('handler(e)',ctx);
const afterSelection={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
vm.runInContext('nextAuto()',ctx);const afterAuto={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
vm.runInContext('nextAuto()',ctx);const afterNext={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
if(scenario.id==='maximum-HP'){assert.deepEqual(afterNext,{hp:350,mats:3,qCd:0,autoCd:0});assert.equal(G._sStats.potions,0);}
else if(scenario.id==='normal-deficit'){assert.deepEqual(afterSelection,{hp:250,mats:2,qCd:420,autoCd:0});assert.deepEqual(afterNext,{hp:350,mats:1,qCd:420,autoCd:419});assert.equal(G._sStats.potions,2);}
else if(policy==='current'){assert.deepEqual(afterSelection,{hp:100,mats:2,qCd:420,autoCd:0});assert.deepEqual(afterNext,{hp:200,mats:1,qCd:420,autoCd:419});assert.equal(G._sStats.potions,2);assert.equal(P.s,'fallen');}
else{assert.deepEqual(afterNext,{hp:0,mats:3,qCd:0,autoCd:0});assert.equal(G._sStats.potions,0);assert.equal(P.s,'fallen');assert(!trace.includes('potion'));}
rows.push({file,scenario:scenario.id,policy,before,afterSelection,afterAuto,afterNext,stats:G._sStats,trace});
}
for(const id of ['maximum-HP','normal-deficit']){const r=rows.filter(x=>x.file===file&&x.scenario===id);assert.deepEqual(r[0].trace,r[1].trace);assert.deepEqual(r[0].afterNext,r[1].afterNext);}
}
const q='useQuickslot|fallen/dead|쓰러짐.*행동|물약.*쿨|자동.*물약',d=spawnSync('rg',['-n',q,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);
console.log(JSON.stringify({task:'BALANCE-keydown-fallen-manual-auto-economy-1308',at:new Date().toISOString(),sources,rows,sourceRuns:12,docs:{query:q,exitCode:d.status,matches:d.stdout.trim().split('\n').length,sha:sha(d.stdout)},limits:['Actual full keydown listener and useQuickslot body with automatic-potion source block connected; full update/native frame not executed','Two auto block calls model following frame only for autoPotCd; quickslot per-frame cooldown decrement not modeled, qCd remains420 in evidence','All pot levels finite0; no prior Infinity/zero-heal fixtures rerun','HP/ST/MP current=max control uses hp350/st100/mp80; only implemented HP potion exists, ST/MP types unimplemented','DOM/audio/stats visuals stubbed; actual game/save/input acceptance root only'],productionApplied:false,newFiles:0},null,2));
```

### actual die→caller→두 cooldown 성공 stdin 원문

```javascript
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';
const sha=x=>createHash('sha256').update(x).digest('hex');
function extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}
function balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}

const rows=[],sources=[];
for(const file of ['game.html','game-easy-test.html']){
const s=fs.readFileSync(file,'utf8'),quick=extract(s,'useQuickslot'),heal=extract(s,'potHeal');
const marker="addEventListener('keydown',";const position=s.lastIndexOf(marker,s.indexOf('// ESC → 뒤로가기'));assert(position>=0);const handler=balanced(s,position+marker.length);parse('const handler='+handler,{ecmaVersion:'latest'});
const autoStart=s.indexOf('  if(autoPotCd>0)autoPotCd-=sp;'),autoEnd=s.indexOf('  // ─── [S16c]',autoStart);assert(autoStart>=0&&autoEnd>autoStart);const auto=s.slice(autoStart,autoEnd);
const old="if(!G.on||G.paused)return;",newer="if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;";
const die=extract(s,'die'),pitch=extract(s,'_r');const qsStart=s.indexOf('  let _qsAnyCD=false;'),qsEnd=s.indexOf('  const _msMax2=',qsStart);assert(qsStart>=0&&qsEnd>qsStart);const qsTick=s.slice(qsStart,qsEnd);
const candidate=quick.replace(old,newer);assert.notEqual(candidate,quick);
sources.push({file,wholeSHA:sha(s),quickSHA:sha(quick),handlerSHA:sha(handler),autoSHA:sha(auto),candidateSHA:sha(candidate),dieSHA:sha(die),qsTickSHA:sha(qsTick),patch:{old,newer}});
for(const scenario of [{id:'fallen-zero-HP',hp:-1,state:'idle'}])for(const policy of ['current','candidate']){
const trace=[],P={hp:scenario.hp,mhp:350,mp:80,mmp:80,st:100,mst:100,s:scenario.state,skills:{},x:0,y:0,lv:1,facing:0},G={on:true,paused:false,mats:3,_pStats:{_hC:0},_sStats:{potions:0}};
const nodes={},$=id=>nodes[id]??={classList:{contains:()=>false,add:()=>{},remove:()=>{}},offsetWidth:0};
const c={P,G,QSLOTS:[{type:'hp',count:1},{type:null},{type:null},{type:null}],qsCooldown:[0,0,0,0],POT:{hp:{col:'#33cc66'}},POT_LV:{hp:0},autoPotCd:0,sp:1,PASSIVES:{pRegen:0},SKILL_SLOTS:Array(6).fill(null),window:{},K:{},KH:{},BINDS:{},BINDS2:{},listeningBind:null,_cutsceneState:'NONE',Element:class {},_BOOTH_MODE:false,_boothDeadF:-1,_gxTurret:null,ultUnmute:()=>{},_stopShieldLoop:()=>{},playSample:()=>{},shake:()=>{},SFX:{potion:()=>trace.push('potion'),beamStop:()=>{}},gl:()=>({}),blt:()=>({}),_eqAffix:()=>0,_eqImplicit:()=>0,_T:x=>x,showPH:()=>trace.push('showPH'),addTxt:()=>trace.push('text'),addParts:()=>trace.push('parts'),updateQS:()=>trace.push('updateQS'),$,Math:Object.assign(Object.create(Math),{random:()=>0})};
const ctx=vm.createContext(c);vm.runInContext(die+'\n'+pitch+'\n'+heal+'\n'+(policy==='current'?quick:candidate)+'\nconst handler='+handler+';\nfunction nextAuto(){'+qsTick+auto+'}',ctx);
vm.runInContext('die()',ctx);assert.equal(P.s,'fallen');assert.equal(P.hp,0);
const before={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
c.e={code:'Digit1',repeat:false,preventDefault:()=>trace.push('preventDefault')};
vm.runInContext('handler(e)',ctx);
const afterSelection={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
vm.runInContext('nextAuto()',ctx);const afterAuto={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
vm.runInContext('nextAuto()',ctx);const afterNext={hp:P.hp,mats:G.mats,qCd:c.qsCooldown[0],autoCd:c.autoPotCd};
if(scenario.id==='maximum-HP'){assert.deepEqual(afterNext,{hp:350,mats:3,qCd:0,autoCd:0});assert.equal(G._sStats.potions,0);}
else if(scenario.id==='normal-deficit'){assert.deepEqual(afterSelection,{hp:250,mats:2,qCd:420,autoCd:0});assert.deepEqual(afterNext,{hp:350,mats:1,qCd:420,autoCd:419});assert.equal(G._sStats.potions,2);}
else if(policy==='current'){assert.deepEqual(afterSelection,{hp:100,mats:2,qCd:420,autoCd:0});assert.deepEqual(afterNext,{hp:200,mats:1,qCd:418,autoCd:419});assert.equal(G._sStats.potions,2);assert.equal(P.s,'fallen');}
else{assert.deepEqual(afterNext,{hp:0,mats:3,qCd:0,autoCd:0});assert.equal(G._sStats.potions,0);assert.equal(P.s,'fallen');assert(!trace.includes('potion'));}
rows.push({file,scenario:scenario.id,policy,before,afterSelection,afterAuto,afterNext,stats:G._sStats,trace});
}

}
const q='useQuickslot|fallen/dead|쓰러짐.*행동|물약.*쿨|자동.*물약',d=spawnSync('rg',['-n',q,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);
console.log(JSON.stringify({task:'BALANCE-die-keydown-quick-auto-two-cd-1315',at:new Date().toISOString(),sources,rows,sourceRuns:4,docs:{query:q,exitCode:d.status,matches:d.stdout.trim().split('\n').length,sha:sha(d.stdout)},limits:['Actual full keydown listener and useQuickslot body with automatic-potion source block connected; full update/native frame not executed','Actual die function establishes fallen HP0; actual quickslot decrement block runs before automatic potion block each following source frame. Current qCd420→419→418, auto0→420→419; candidate both remain0. Full update/native not executed','All pot levels finite0; no prior Infinity/zero-heal fixtures rerun','HP/ST/MP current=max control uses hp350/st100/mp80; only implemented HP potion exists, ST/MP types unimplemented','DOM/audio/stats visuals stubbed; actual game/save/input acceptance root only'],productionApplied:false,newFiles:0},null,2));
```

### 최초12 완전 receipt

```json
{
  "chunk_id": "092c5c",
  "wall_time_seconds": 0.000019042,
  "exit_code": 0,
  "original_token_count": 2647,
  "output": "{\n  \"task\": \"BALANCE-keydown-fallen-manual-auto-economy-1308\",\n  \"at\": \"2026-10-02T13:14:03.647Z\",\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"quickSHA\": \"9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483\",\n      \"handlerSHA\": \"9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a\",\n      \"autoSHA\": \"356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455\",\n      \"candidateSHA\": \"4a892b8489d80d5ab09fa054d81a642f4d6e2b979dec4ca8e6069acbb3901189\",\n      \"patch\": {\n        \"old\": \"if(!G.on||G.paused)return;\",\n        \"newer\": \"if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"quickSHA\": \"0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60\",\n      \"handlerSHA\": \"9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a\",\n      \"autoSHA\": \"356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455\",\n      \"candidateSHA\": \"26edf7db17cf48cc88f424bd66c30778755c4468ad356d21f206ddad4eb1f04d\",\n      \"patch\": {\n        \"old\": \"if(!G.on||G.paused)return;\",\n        \"newer\": \"if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"maximum-HP\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"showPH\",\n        \"preventDefault\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"maximum-HP\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"showPH\",\n        \"preventDefault\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-deficit\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 150,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 250,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"normal-deficit\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 150,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 250,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 100,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"preventDefault\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"maximum-HP\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"showPH\",\n        \"preventDefault\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"maximum-HP\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"showPH\",\n        \"preventDefault\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-deficit\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 150,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 250,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"normal-deficit\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 150,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 250,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 350,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 100,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 420,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"preventDefault\"\n      ]\n    }\n  ],\n  \"sourceRuns\": 12,\n  \"docs\": {\n    \"query\": \"useQuickslot|fallen/dead|쓰러짐.*행동|물약.*쿨|자동.*물약\",\n    \"exitCode\": 0,\n    \"matches\": 48,\n    \"sha\": \"cd62ba8778dde44dd529f8b35f623db3c45c4a6d275352c45642eea80f94bfef\"\n  },\n  \"limits\": [\n    \"Actual full keydown listener and useQuickslot body with automatic-potion source block connected; full update/native frame not executed\",\n    \"Two auto block calls model following frame only for autoPotCd; quickslot per-frame cooldown decrement not modeled, qCd remains420 in evidence\",\n    \"All pot levels finite0; no prior Infinity/zero-heal fixtures rerun\",\n    \"HP/ST/MP current=max control uses hp350/st100/mp80; only implemented HP potion exists, ST/MP types unimplemented\",\n    \"DOM/audio/stats visuals stubbed; actual game/save/input acceptance root only\"\n  ],\n  \"productionApplied\": false,\n  \"newFiles\": 0\n}\n"
}
```

### die 추가 첫 실패 receipt

```json
{
  "chunk_id": "371df8",
  "wall_time_seconds": 0.000006208,
  "exit_code": 1,
  "original_token_count": 205,
  "output": "evalmachine.<anonymous>:21\n  const _revPowBonus=_eqAffix('revivePow')+_eqImplicit('_iRevPow')*.01+_revZoneBonus;\n                     ^\n\nReferenceError: _eqImplicit is not defined\n    at die (evalmachine.<anonymous>:21:22)\n    at evalmachine.<anonymous>:1:1\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:20:4\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\n\nNode.js v24.15.0\n"
}
```

### die 추가4 완전 성공 receipt

```json
{
  "chunk_id": "765311",
  "wall_time_seconds": 0.000006125,
  "exit_code": 0,
  "original_token_count": 1364,
  "output": "{\n  \"task\": \"BALANCE-die-keydown-quick-auto-two-cd-1315\",\n  \"at\": \"2026-10-02T13:14:45.877Z\",\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"quickSHA\": \"9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483\",\n      \"handlerSHA\": \"9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a\",\n      \"autoSHA\": \"356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455\",\n      \"candidateSHA\": \"4a892b8489d80d5ab09fa054d81a642f4d6e2b979dec4ca8e6069acbb3901189\",\n      \"dieSHA\": \"a52d3c1519b37111857658a8255e53fe3534a3679bd9f117abb2d4b6ab6cddac\",\n      \"qsTickSHA\": \"f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d\",\n      \"patch\": {\n        \"old\": \"if(!G.on||G.paused)return;\",\n        \"newer\": \"if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"quickSHA\": \"0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60\",\n      \"handlerSHA\": \"9e9a12260496c34229a150332dd0db82658ba7533c4dd427ac54a9f624cbaa9a\",\n      \"autoSHA\": \"356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455\",\n      \"candidateSHA\": \"26edf7db17cf48cc88f424bd66c30778755c4468ad356d21f206ddad4eb1f04d\",\n      \"dieSHA\": \"a52d3c1519b37111857658a8255e53fe3534a3679bd9f117abb2d4b6ab6cddac\",\n      \"qsTickSHA\": \"f165759341fb3b678aaf740edbfa8d3e9533a457efa2950670d373d5fb5c408d\",\n      \"patch\": {\n        \"old\": \"if(!G.on||G.paused)return;\",\n        \"newer\": \"if(!G.on||G.paused||P.hp<=0||P.s==='fallen'||P.s==='dead')return;\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 100,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 419,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 418,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"preventDefault\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"current\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 100,\n        \"mats\": 2,\n        \"qCd\": 420,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 419,\n        \"autoCd\": 420\n      },\n      \"afterNext\": {\n        \"hp\": 200,\n        \"mats\": 1,\n        \"qCd\": 418,\n        \"autoCd\": 419\n      },\n      \"stats\": {\n        \"potions\": 2\n      },\n      \"trace\": [\n        \"potion\",\n        \"text\",\n        \"parts\",\n        \"updateQS\",\n        \"preventDefault\",\n        \"potion\",\n        \"text\"\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"fallen-zero-HP\",\n      \"policy\": \"candidate\",\n      \"before\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterSelection\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterAuto\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"afterNext\": {\n        \"hp\": 0,\n        \"mats\": 3,\n        \"qCd\": 0,\n        \"autoCd\": 0\n      },\n      \"stats\": {\n        \"potions\": 0\n      },\n      \"trace\": [\n        \"preventDefault\"\n      ]\n    }\n  ],\n  \"sourceRuns\": 4,\n  \"docs\": {\n    \"query\": \"useQuickslot|fallen/dead|쓰러짐.*행동|물약.*쿨|자동.*물약\",\n    \"exitCode\": 0,\n    \"matches\": 48,\n    \"sha\": \"72d26058d4c0815473e37f583eaa9a931a71dad29415851017dd4ec1a02c59e1\"\n  },\n  \"limits\": [\n    \"Actual full keydown listener and useQuickslot body with automatic-potion source block connected; full update/native frame not executed\",\n    \"Actual die function establishes fallen HP0; actual quickslot decrement block runs before automatic potion block each following source frame. Current qCd420→419→418, auto0→420→419; candidate both remain0. Full update/native not executed\",\n    \"All pot levels finite0; no prior Infinity/zero-heal fixtures rerun\",\n    \"HP/ST/MP current=max control uses hp350/st100/mp80; only implemented HP potion exists, ST/MP types unimplemented\",\n    \"DOM/audio/stats visuals stubbed; actual game/save/input acceptance root only\"\n  ],\n  \"productionApplied\": false,\n  \"newFiles\": 0\n}\n"
}
```

## 재도전→두 소비 caller 새 연결 관측 (패치 없음)

실제 full retry/applyStats/refill 이후 만HP의 자동·숫자키는 소비0/CD0이다. 복원 뒤 결손HP150을 명시적으로 주입한 비교는 auto-only 회복100/비용1, manual+auto 같은 source frame에서 회복200/비용2다. 실제 공격/피해 caller를 실행한 것이 아니다. 기존 독립 CD 구조이며 공유쿨다운 확정 계약이 없어 이 관측만으로 공유 CD를 새로 도입하지 않았다. 다음 독립 경제경계로 이동하여 위 부호 결함을 재현했다. 첫 두 연결 시도는 하니스 SKILL_SLOTS/pRegen0 누락으로 실패; 적법한 기본값 보완 후8건 통과했다. 아래 실패와 성공 기록을 그대로 보존한다.

```json
{
  "sourceRuns": 8,
  "evidence": {
    "task": "BALANCE-retry-key-auto-same-frame-1318",
    "at": "2026-10-02T13:26:29.933Z",
    "sourceRuns": 8,
    "decision": "Full restore max state consumes0; explicit post-retry injury + manual/auto can consume2 with independent cooldowns. Shared cooldown policy not stated; no speculative patch.",
    "evidence": [
      {
        "file": "game.html",
        "wholeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "anchors": {
          "applyStats": "4c6577217205c5b3fbcd1570e5cc97082b027cc37f4a4c8d2d5e6e47d40eaaf4",
          "recalcSt": "994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99",
          "_refillRespawnResources": "46dedb3ffe0168177ae406c10efcf5d0fb0dde414bf5000f26120ddd6a146433",
          "_eqAffix": "71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a",
          "_eqAffixRebuild": "2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03",
          "_eqStat": "79bf05bdbc915cbba678f12f10be99f4451c0d8cbaaee2b5521f004adf1f3fde",
          "_eqStatRebuild": "f0ef63d4b10e0306f7e9f2f303d28f02895e834f6ab9a9922f1ea5f30e3add44",
          "_eqImplicit": "c2389a07e75ab49fa670ce644383a95e416d05422899f3ef427df5c4d5f23f03",
          "_gritTotal": "8e692e779dffca240886dc1645d5d72da5467e32f1a03138c39e6a6f7a6b418f",
          "_gritHpFlat": "609b3b3acd2db79f059ddf87f6ecd410072b4b136c3043bee538c6c3c271a430",
          "_gritMpFlat": "5db93b8ea858006daa959054b3b2baffb93bb8580f66fd8ca33ea31da23a0095",
          "_gritStFlat": "693b9e7ce888faa0e0a57498c809d086b419ce8424895dfd1d63d782349fe40f",
          "_lvB": "62529184483aa49e182f0a41976ce8eeb453a58e4d729160bbaa80b17e920a16",
          "pPredSpd": "006fe7090ceb1bc690032f5b55d965e254f69ff97d0ed98123fae3bd95911bdd",
          "ar": "c8dfab8d3c21b6d1645318dea7ddb9dc20faeca210799ae5e62c705156e72076",
          "bt": "7e441fafb3eb16099af7fe09b59d7fb56f10da7e2155d231b4985766b2a923cd",
          "isDimBreach": "4a6f50f512711556bfb94d3810042e7a10bddfe7a8965d8c3c937a6c5b418699",
          "_isFused": "f8866059e0766a852995178775588bc7b125be3ccc09b80951527526d932307d",
          "useQuickslot": "9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483",
          "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7"
        },
        "retrySHA": "7618626a079bc89deeef79874ea9a8d826a6fcb70275a9dc13aae6d1ba8fecc2",
        "snapshots": [
          {
            "via": "restored-full-auto",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 788,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 788,
              "mats": 50000,
              "qsCD": 0,
              "autoCD": 0
            },
            "traceSHA": "d0d571c7448bf898fe316918ccace6594673405dd2a9d356eb63c6bf3fb0eb1d"
          },
          {
            "via": "restored-full-manual",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 788,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 788,
              "mats": 50000,
              "qsCD": 0,
              "autoCD": 0
            },
            "traceSHA": "6f7a4dbc8f139d803bd2fe34de1b7feea3a4a447515cae80b43c860ea192f315"
          },
          {
            "via": "deficit-auto-only",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 150,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 250,
              "mats": 49999,
              "qsCD": 0,
              "autoCD": 420
            },
            "traceSHA": "438772b0b0ae7e1048e802ebc95dcb026d1fae85d126d59fc8d6ba95fb1854b9"
          },
          {
            "via": "deficit-manual-plus-auto",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 150,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 350,
              "mats": 49998,
              "qsCD": 419,
              "autoCD": 420
            },
            "traceSHA": "6b738e669a9dac94b131a37562d294e0828f38554e6aa110d6299dcc6e6186f8"
          }
        ]
      },
      {
        "file": "game-easy-test.html",
        "wholeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "anchors": {
          "applyStats": "78dc9315a79122b59ebd56f87a1479704683c78da0ed294452eafd6cd1e64036",
          "recalcSt": "994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99",
          "_refillRespawnResources": "46dedb3ffe0168177ae406c10efcf5d0fb0dde414bf5000f26120ddd6a146433",
          "_eqAffix": "71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a",
          "_eqAffixRebuild": "2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03",
          "_eqStat": "79bf05bdbc915cbba678f12f10be99f4451c0d8cbaaee2b5521f004adf1f3fde",
          "_eqStatRebuild": "f0ef63d4b10e0306f7e9f2f303d28f02895e834f6ab9a9922f1ea5f30e3add44",
          "_eqImplicit": "c2389a07e75ab49fa670ce644383a95e416d05422899f3ef427df5c4d5f23f03",
          "_gritTotal": "8e692e779dffca240886dc1645d5d72da5467e32f1a03138c39e6a6f7a6b418f",
          "_gritHpFlat": "609b3b3acd2db79f059ddf87f6ecd410072b4b136c3043bee538c6c3c271a430",
          "_gritMpFlat": "5db93b8ea858006daa959054b3b2baffb93bb8580f66fd8ca33ea31da23a0095",
          "_gritStFlat": "693b9e7ce888faa0e0a57498c809d086b419ce8424895dfd1d63d782349fe40f",
          "_lvB": "62529184483aa49e182f0a41976ce8eeb453a58e4d729160bbaa80b17e920a16",
          "pPredSpd": "006fe7090ceb1bc690032f5b55d965e254f69ff97d0ed98123fae3bd95911bdd",
          "ar": "c8dfab8d3c21b6d1645318dea7ddb9dc20faeca210799ae5e62c705156e72076",
          "bt": "7e441fafb3eb16099af7fe09b59d7fb56f10da7e2155d231b4985766b2a923cd",
          "isDimBreach": "4a6f50f512711556bfb94d3810042e7a10bddfe7a8965d8c3c937a6c5b418699",
          "_isFused": "f8866059e0766a852995178775588bc7b125be3ccc09b80951527526d932307d",
          "useQuickslot": "0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60",
          "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7"
        },
        "retrySHA": "7618626a079bc89deeef79874ea9a8d826a6fcb70275a9dc13aae6d1ba8fecc2",
        "snapshots": [
          {
            "via": "restored-full-auto",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 788,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 788,
              "mats": 50000,
              "qsCD": 0,
              "autoCD": 0
            },
            "traceSHA": "d0d571c7448bf898fe316918ccace6594673405dd2a9d356eb63c6bf3fb0eb1d"
          },
          {
            "via": "restored-full-manual",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 788,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 788,
              "mats": 50000,
              "qsCD": 0,
              "autoCD": 0
            },
            "traceSHA": "6f7a4dbc8f139d803bd2fe34de1b7feea3a4a447515cae80b43c860ea192f315"
          },
          {
            "via": "deficit-auto-only",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 150,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 250,
              "mats": 49999,
              "qsCD": 0,
              "autoCD": 420
            },
            "traceSHA": "438772b0b0ae7e1048e802ebc95dcb026d1fae85d126d59fc8d6ba95fb1854b9"
          },
          {
            "via": "deficit-manual-plus-auto",
            "snapshot": {
              "hp": 788,
              "mhp": 788,
              "mp": 299,
              "mmp": 299,
              "st": 297,
              "mst": 297,
              "shield": 216,
              "mshield": 216,
              "stocks": 5,
              "maxStocks": 5,
              "cd": 0,
              "gauge": 279,
              "maxGauge": 279,
              "exp": 700,
              "mats": 50000,
              "altSpd": 0,
              "io": false,
              "kiLv": 1
            },
            "beforeRecovery": {
              "hp": 150,
              "mats": 50000
            },
            "afterRecovery": {
              "hp": 350,
              "mats": 49998,
              "qsCD": 419,
              "autoCD": 420
            },
            "traceSHA": "6b738e669a9dac94b131a37562d294e0828f38554e6aa110d6299dcc6e6186f8"
          }
        ]
      }
    ],
    "docs": {
      "query": "_refillRespawnResources|리스폰.*완충|applyStats.*최대|기검참.*ST",
      "exitCode": 0,
      "lines": 25,
      "sha": "ab068476a6b355e9c43af40c33490aac9d01923c8ba53f2c93a9544f59b6aedc"
    },
    "limitations": [
      "Actual full retry callback and applyStats/recalcSt/refill helpers extracted dynamically; CH1 unlocked branch map/field restore and DB/DOM/media dependencies stubbed",
      "No map geometry/collision/draw QA or actual field backup correctness verified",
      "Post-retry deficit is explicitly injected HP150, actual enemy damage not run; restored HP refill source remains actual",
      "No actual game/save/API/native execution",
      "No candidate since final max/resource equality and ordering preserve source contract; formula untouched"
    ],
    "newFiles": 0,
    "productionApplied": false
  },
  "failedAttempts": [
    {
      "chunk_id": "61236e",
      "wall_time_seconds": 0.00000575,
      "exit_code": 1,
      "original_token_count": 133,
      "output": "evalmachine.<anonymous>:88\n    if(!e.repeat){if(SKILL_SLOTS[_di]){_dispatchSkillSlot(_di,'Digit'+(_di+1))}\n                  ^\n\nReferenceError: SKILL_SLOTS is not defined\n    at keyHandler (evalmachine.<anonymous>:88:19)\n    at evalmachine.<anonymous>:1:1\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:40:131\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n\nNode.js v24.15.0\n"
    },
    {
      "chunk_id": "604f88",
      "wall_time_seconds": 0.000006166,
      "exit_code": 1,
      "original_token_count": 118,
      "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n\n6 !== 420\n\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:41:240\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: 6,\n  expected: 420,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
    }
  ],
  "note": "First harness lacked SKILL_SLOTS; second lacked pRegen0 causing source fallbackCD6. Fixed fixture defaults then8 PASS. Actual max refill and actual key/auto consumers connected. Post-retry injury HP150 deliberately injected, actual hurtP not run. Existing separate cooldowns allow two actual heals/charges; docs shared-cooldown contract missing, no speculative patch. Nonfinite/fallen/bulk fixtures not rerun."
}
```

### retry 연결 성공 stdin 원문

```javascript
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';
const sha=x=>createHash('sha256').update(x).digest('hex');
function extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}
function balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}
const names=['applyStats','recalcSt','_refillRespawnResources','_eqAffix','_eqAffixRebuild','_eqStat','_eqStatRebuild','_eqImplicit','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat','_lvB','pPredSpd','ar','bt','isDimBreach','_isFused','useQuickslot','potHeal'];
const evidence=[];
for(const file of ['game.html','game-easy-test.html']){
 const s=fs.readFileSync(file,'utf8'),f=Object.fromEntries(names.map(n=>[n,extract(s,n)]));
 const marker="$('retryBtn').onclick=";const start=s.indexOf(marker)+marker.length;assert(start>=marker.length);const callback=balanced(s,start);parse('const cb='+callback,{ecmaVersion:'latest'});
 const snapshots=[];
 for(const via of ['restored-full-auto','restored-full-manual','deficit-auto-only','deficit-manual-plus-auto']){
 const trace=[],nodes={};const node=id=>nodes[id]??={classList:{contains:()=>false,add:x=>trace.push(['domadd',id,x]),remove:x=>trace.push(['domremove',id,x])}};
 const P={lv:2,hp:0,mp:0,st:0,shield:0,mhp:20,mmp:20,mst:20,mshield:20,exp:1000,s:'dead',x:0,y:0,r:10,skills:{chargeBoost:10,kiSlash:1},_fused:{},_altSpd:.15,_altAtk:.15,_altDef:.2,_ioActive:true,chargeStocks:0};
 const equipped={armor:{bStr:3,bInt:4,bonusHp:40,bonusShield:60,bonusSt:30,bonusMp:20,bonusChargeStock:1,affixes:[{id:'maxHPFlat',value:10},{id:'maxMPFlat',value:8},{id:'maxSTFlat',value:7},{id:'shieldFlat',value:11},{id:'extraST',value:9}]},boots:{enh:5,bonusChargeStock:1},ring1:{enh:5}};
 const context={P,INV:{equipped},G:{on:true,stage:0,_bossArena:false,_bossUnlocked:true,cam:{},mats:50000,parts:[],txts:[]},STATS:{str:2,dex:3,int:4,lck:0},PASSIVES:{pRegen:0,pHuman:1,pStamina:1,pVital:1,pFortify:1},SLOT_NAMES:['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'],_grit:2,_eqAffixCache:null,_eqStatCache:null,_HARP_GAUGE_COST:[0,45,98,150],_HARP_GAUGE_BASE_CELLS:5,_HARP_GAUGE_MAX:0,_harpGauge:0,_diffSigned:()=>0,crystalEffects:()=>{throw Error('unexpected crystal')},crystalVal:()=>{throw Error('unexpected crystal')},CRYSTAL_DEFS:{},window:{},$:node,Math:Object.assign(Object.create(Math),{random:()=>{trace.push(['RNG',.25]);return .25}}),_preArenaBackup:null,_bgInitQueue:[],_bgInitIdx:0,_bgInitDone:true,ens:[],projs:[],pProjs:[],worldItems:[],MAP_OBJS:[],_impacts:[],_vfxAnims:[],_fireExps:[],_forceCutscene:false,_dbReady:true,T:32,drawMM:()=>{},_eSpCache:new Map()};
 for(const key of ['_mmInitDone','_mmInitCtx','_mmDirty','_shDirty','_mmRegOvlKey','_raT','_slDirty','_litCamX','_litCamY'])context[key]=0;
 for(const n of ['_drReset','_deathDlgStop','_recycleProj','_recyclePProj','_cacheExitCenter','shRebuild','rebuildDeadPool','buildMapCache','initTorchLights','initSwayObjects','initWallEyes','_initEyes','initGlowObjects','updateQS'])context[n]=(...args)=>trace.push([n,...args]);
 context._retryDruidFinale=()=>{trace.push(['finale',false]);return false};
 context._captureBossFieldState=()=>{trace.push(['capture']);return {_bossCx:5,_gateY:8}};
 context._restoreBossFieldState=()=>trace.push(['restore']);
 context.safePt=(x,y)=>{trace.push(['safePt',x,y]);return {x,y}};
 context.BGM={stageKey:()=>0,play:()=>trace.push(['BGM'])};
 context.dbSave=async()=>trace.push(['dbSave']);
 context.initStage=()=>{throw Error('unexpected initStage')};
 const c=vm.createContext(context);
 vm.runInContext(names.map(n=>f[n]).join('\n')+'\nconst retry='+callback+';',c);
 // Trace actual functions without replacing their bodies.
 vm.runInContext("const originalApply=applyStats,originalRefill=_refillRespawnResources;applyStats=function(){traceHook('applyStats');return originalApply()};_refillRespawnResources=function(){traceHook('refill');return originalRefill()};",Object.assign(c,{traceHook:n=>trace.push([n])}));
 await vm.runInContext('retry()',c);
 const snap=JSON.parse(JSON.stringify(vm.runInContext('({hp:P.hp,mhp:P.mhp,mp:P.mp,mmp:P.mmp,st:P.st,mst:P.mst,shield:P.shield,mshield:P.mshield,stocks:P.chargeStocks,maxStocks:P.maxChargeStocks,cd:P.chargeCd,gauge:_harpGauge,maxGauge:_HARP_GAUGE_MAX,exp:P.exp,mats:G.mats,altSpd:P._altSpd,io:P._ioActive,kiLv:P.skills.kiSlash})',c)));
 for(const [cur,max] of [['hp','mhp'],['mp','mmp'],['st','mst'],['shield','mshield'],['stocks','maxStocks'],['gauge','maxGauge']])assert.equal(snap[cur],snap[max]);
 assert.deepEqual(trace.filter(x=>['applyStats','refill'].includes(x[0])),[['applyStats'],['refill']]);
 assert.equal(snap.mats,50000);assert.equal(snap.cd,0);assert.equal(snap.stocks,5);assert.equal(snap.gauge,279);assert.equal(snap.kiLv,1);
 if(true){assert.equal(snap.exp,700);assert.equal(snap.altSpd,0);assert.equal(snap.io,false);assert.deepEqual(trace.filter(x=>x[0]==='RNG'),[['RNG',.25]]);assert.equal(trace.filter(x=>x[0]==='dbSave').length,1);}
 else {assert.equal(snap.exp,1000);assert.equal(trace.filter(x=>x[0]==='RNG').length,0);}
 const marker="addEventListener('keydown',",position=s.lastIndexOf(marker,s.indexOf('// ESC → 뒤로가기'));const handler=balanced(s,position+marker.length);const qsStart=s.indexOf('  let _qsAnyCD=false;'),qsEnd=s.indexOf('  const _msMax2=',qsStart),as=s.indexOf('  if(autoPotCd>0)autoPotCd-=sp;'),ae=s.indexOf('  // ─── [S16c]',as);const frame=s.slice(qsStart,qsEnd)+s.slice(as,ae);
Object.assign(c,{SKILL_SLOTS:Array(6).fill(null),QSLOTS:[{type:'hp',count:1},{type:null},{type:null},{type:null}],qsCooldown:[0,0,0,0],POT:{hp:{col:'#33cc66'}},POT_LV:{hp:0},autoPotCd:0,sp:1,window:{},K:{},KH:{},BINDS:{},BINDS2:{},listeningBind:null,_cutsceneState:'NONE',Element:class {},SFX:{potion:()=>trace.push(['potion'])},gl:()=>({}),blt:()=>({}),showPH:()=>trace.push(['showPH']),addParts:()=>{},addTxt:()=>{},_T:x=>x});
vm.runInContext('const keyHandler='+handler+';function frame(){'+frame+'}',c);
if(via.startsWith('deficit'))P.hp=150; // Explicit post-respawn injury fixture; not an actual damage-source execution.
const beforeRecovery={hp:P.hp,mats:c.G.mats};if(via.includes('manual')){c.e={code:'Digit1',repeat:false,preventDefault:()=>{}};vm.runInContext('keyHandler(e)',c)}vm.runInContext('frame()',c);const afterRecovery={hp:P.hp,mats:c.G.mats,qsCD:c.qsCooldown[0],autoCD:c.autoPotCd};
if(via.startsWith('restored')){assert.equal(c.G.mats,50000);assert.equal(P.hp,P.mhp);assert.equal(c.qsCooldown[0],0);assert.equal(c.autoPotCd,0)}else if(via==='deficit-auto-only'){assert.equal(c.G.mats,49999);assert.equal(P.hp,250);assert.equal(c.autoPotCd,420)}else{assert.equal(c.G.mats,49998);assert.equal(P.hp,350);assert.equal(c.qsCooldown[0],419);assert.equal(c.autoPotCd,420)}
snapshots.push({via,snapshot:snap,beforeRecovery,afterRecovery,traceSHA:sha(JSON.stringify(trace))});
 }

 evidence.push({file,wholeSHA:sha(s),anchors:Object.fromEntries(names.map(n=>[n,sha(f[n])])),retrySHA:sha(callback),snapshots});
}
const docs=spawnSync('rg',['-n','_refillRespawnResources|리스폰.*완충|applyStats.*최대|기검참.*ST','docs'],{encoding:'utf8'});assert([0,1].includes(docs.status));
console.log(JSON.stringify({task:'BALANCE-retry-key-auto-same-frame-1318',at:new Date().toISOString(),sourceRuns:8,decision:'Full restore max state consumes0; explicit post-retry injury + manual/auto can consume2 with independent cooldowns. Shared cooldown policy not stated; no speculative patch.',evidence,docs:{query:'_refillRespawnResources|리스폰.*완충|applyStats.*최대|기검참.*ST',exitCode:docs.status,lines:docs.stdout.trim().split('\n').length,sha:sha(docs.stdout)},limitations:['Actual full retry callback and applyStats/recalcSt/refill helpers extracted dynamically; CH1 unlocked branch map/field restore and DB/DOM/media dependencies stubbed','No map geometry/collision/draw QA or actual field backup correctness verified','Post-retry deficit is explicitly injected HP150, actual enemy damage not run; restored HP refill source remains actual','No actual game/save/API/native execution','No candidate since final max/resource equality and ordering preserve source contract; formula untouched'],newFiles:0,productionApplied:false},null,2));
```

### retry 연결 완전 성공 receipt

```json
{
  "chunk_id": "945f41",
  "wall_time_seconds": 0.000005875,
  "exit_code": 0,
  "original_token_count": 3058,
  "output": "{\n  \"task\": \"BALANCE-retry-key-auto-same-frame-1318\",\n  \"at\": \"2026-10-02T13:26:29.933Z\",\n  \"sourceRuns\": 8,\n  \"decision\": \"Full restore max state consumes0; explicit post-retry injury + manual/auto can consume2 with independent cooldowns. Shared cooldown policy not stated; no speculative patch.\",\n  \"evidence\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"anchors\": {\n        \"applyStats\": \"4c6577217205c5b3fbcd1570e5cc97082b027cc37f4a4c8d2d5e6e47d40eaaf4\",\n        \"recalcSt\": \"994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99\",\n        \"_refillRespawnResources\": \"46dedb3ffe0168177ae406c10efcf5d0fb0dde414bf5000f26120ddd6a146433\",\n        \"_eqAffix\": \"71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a\",\n        \"_eqAffixRebuild\": \"2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03\",\n        \"_eqStat\": \"79bf05bdbc915cbba678f12f10be99f4451c0d8cbaaee2b5521f004adf1f3fde\",\n        \"_eqStatRebuild\": \"f0ef63d4b10e0306f7e9f2f303d28f02895e834f6ab9a9922f1ea5f30e3add44\",\n        \"_eqImplicit\": \"c2389a07e75ab49fa670ce644383a95e416d05422899f3ef427df5c4d5f23f03\",\n        \"_gritTotal\": \"8e692e779dffca240886dc1645d5d72da5467e32f1a03138c39e6a6f7a6b418f\",\n        \"_gritHpFlat\": \"609b3b3acd2db79f059ddf87f6ecd410072b4b136c3043bee538c6c3c271a430\",\n        \"_gritMpFlat\": \"5db93b8ea858006daa959054b3b2baffb93bb8580f66fd8ca33ea31da23a0095\",\n        \"_gritStFlat\": \"693b9e7ce888faa0e0a57498c809d086b419ce8424895dfd1d63d782349fe40f\",\n        \"_lvB\": \"62529184483aa49e182f0a41976ce8eeb453a58e4d729160bbaa80b17e920a16\",\n        \"pPredSpd\": \"006fe7090ceb1bc690032f5b55d965e254f69ff97d0ed98123fae3bd95911bdd\",\n        \"ar\": \"c8dfab8d3c21b6d1645318dea7ddb9dc20faeca210799ae5e62c705156e72076\",\n        \"bt\": \"7e441fafb3eb16099af7fe09b59d7fb56f10da7e2155d231b4985766b2a923cd\",\n        \"isDimBreach\": \"4a6f50f512711556bfb94d3810042e7a10bddfe7a8965d8c3c937a6c5b418699\",\n        \"_isFused\": \"f8866059e0766a852995178775588bc7b125be3ccc09b80951527526d932307d\",\n        \"useQuickslot\": \"9663a435ba0771b30e9238c599d8c29bfe8e69ce074257cab91b99a675b28483\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\"\n      },\n      \"retrySHA\": \"7618626a079bc89deeef79874ea9a8d826a6fcb70275a9dc13aae6d1ba8fecc2\",\n      \"snapshots\": [\n        {\n          \"via\": \"restored-full-auto\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000,\n            \"qsCD\": 0,\n            \"autoCD\": 0\n          },\n          \"traceSHA\": \"d0d571c7448bf898fe316918ccace6594673405dd2a9d356eb63c6bf3fb0eb1d\"\n        },\n        {\n          \"via\": \"restored-full-manual\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000,\n            \"qsCD\": 0,\n            \"autoCD\": 0\n          },\n          \"traceSHA\": \"6f7a4dbc8f139d803bd2fe34de1b7feea3a4a447515cae80b43c860ea192f315\"\n        },\n        {\n          \"via\": \"deficit-auto-only\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 150,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 250,\n            \"mats\": 49999,\n            \"qsCD\": 0,\n            \"autoCD\": 420\n          },\n          \"traceSHA\": \"438772b0b0ae7e1048e802ebc95dcb026d1fae85d126d59fc8d6ba95fb1854b9\"\n        },\n        {\n          \"via\": \"deficit-manual-plus-auto\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 150,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 350,\n            \"mats\": 49998,\n            \"qsCD\": 419,\n            \"autoCD\": 420\n          },\n          \"traceSHA\": \"6b738e669a9dac94b131a37562d294e0828f38554e6aa110d6299dcc6e6186f8\"\n        }\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"anchors\": {\n        \"applyStats\": \"78dc9315a79122b59ebd56f87a1479704683c78da0ed294452eafd6cd1e64036\",\n        \"recalcSt\": \"994fa2b29e5be2edc9a0333d24fd3d10c269746b6da2d3d1e380daff38528e99\",\n        \"_refillRespawnResources\": \"46dedb3ffe0168177ae406c10efcf5d0fb0dde414bf5000f26120ddd6a146433\",\n        \"_eqAffix\": \"71ce6e568ac61e5db141539ebf838e74ddf66203398e2d4e7d6ed44bc5744d7a\",\n        \"_eqAffixRebuild\": \"2f175d3cc00bc9b99c9f8c1c0d6d5d07d2929c41726d17fff7f587561229bb03\",\n        \"_eqStat\": \"79bf05bdbc915cbba678f12f10be99f4451c0d8cbaaee2b5521f004adf1f3fde\",\n        \"_eqStatRebuild\": \"f0ef63d4b10e0306f7e9f2f303d28f02895e834f6ab9a9922f1ea5f30e3add44\",\n        \"_eqImplicit\": \"c2389a07e75ab49fa670ce644383a95e416d05422899f3ef427df5c4d5f23f03\",\n        \"_gritTotal\": \"8e692e779dffca240886dc1645d5d72da5467e32f1a03138c39e6a6f7a6b418f\",\n        \"_gritHpFlat\": \"609b3b3acd2db79f059ddf87f6ecd410072b4b136c3043bee538c6c3c271a430\",\n        \"_gritMpFlat\": \"5db93b8ea858006daa959054b3b2baffb93bb8580f66fd8ca33ea31da23a0095\",\n        \"_gritStFlat\": \"693b9e7ce888faa0e0a57498c809d086b419ce8424895dfd1d63d782349fe40f\",\n        \"_lvB\": \"62529184483aa49e182f0a41976ce8eeb453a58e4d729160bbaa80b17e920a16\",\n        \"pPredSpd\": \"006fe7090ceb1bc690032f5b55d965e254f69ff97d0ed98123fae3bd95911bdd\",\n        \"ar\": \"c8dfab8d3c21b6d1645318dea7ddb9dc20faeca210799ae5e62c705156e72076\",\n        \"bt\": \"7e441fafb3eb16099af7fe09b59d7fb56f10da7e2155d231b4985766b2a923cd\",\n        \"isDimBreach\": \"4a6f50f512711556bfb94d3810042e7a10bddfe7a8965d8c3c937a6c5b418699\",\n        \"_isFused\": \"f8866059e0766a852995178775588bc7b125be3ccc09b80951527526d932307d\",\n        \"useQuickslot\": \"0c69a6c019e58bc2ea4a35905c79513470b46f301320c7bd304d02be486daf60\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\"\n      },\n      \"retrySHA\": \"7618626a079bc89deeef79874ea9a8d826a6fcb70275a9dc13aae6d1ba8fecc2\",\n      \"snapshots\": [\n        {\n          \"via\": \"restored-full-auto\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000,\n            \"qsCD\": 0,\n            \"autoCD\": 0\n          },\n          \"traceSHA\": \"d0d571c7448bf898fe316918ccace6594673405dd2a9d356eb63c6bf3fb0eb1d\"\n        },\n        {\n          \"via\": \"restored-full-manual\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 788,\n            \"mats\": 50000,\n            \"qsCD\": 0,\n            \"autoCD\": 0\n          },\n          \"traceSHA\": \"6f7a4dbc8f139d803bd2fe34de1b7feea3a4a447515cae80b43c860ea192f315\"\n        },\n        {\n          \"via\": \"deficit-auto-only\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 150,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 250,\n            \"mats\": 49999,\n            \"qsCD\": 0,\n            \"autoCD\": 420\n          },\n          \"traceSHA\": \"438772b0b0ae7e1048e802ebc95dcb026d1fae85d126d59fc8d6ba95fb1854b9\"\n        },\n        {\n          \"via\": \"deficit-manual-plus-auto\",\n          \"snapshot\": {\n            \"hp\": 788,\n            \"mhp\": 788,\n            \"mp\": 299,\n            \"mmp\": 299,\n            \"st\": 297,\n            \"mst\": 297,\n            \"shield\": 216,\n            \"mshield\": 216,\n            \"stocks\": 5,\n            \"maxStocks\": 5,\n            \"cd\": 0,\n            \"gauge\": 279,\n            \"maxGauge\": 279,\n            \"exp\": 700,\n            \"mats\": 50000,\n            \"altSpd\": 0,\n            \"io\": false,\n            \"kiLv\": 1\n          },\n          \"beforeRecovery\": {\n            \"hp\": 150,\n            \"mats\": 50000\n          },\n          \"afterRecovery\": {\n            \"hp\": 350,\n            \"mats\": 49998,\n            \"qsCD\": 419,\n            \"autoCD\": 420\n          },\n          \"traceSHA\": \"6b738e669a9dac94b131a37562d294e0828f38554e6aa110d6299dcc6e6186f8\"\n        }\n      ]\n    }\n  ],\n  \"docs\": {\n    \"query\": \"_refillRespawnResources|리스폰.*완충|applyStats.*최대|기검참.*ST\",\n    \"exitCode\": 0,\n    \"lines\": 25,\n    \"sha\": \"ab068476a6b355e9c43af40c33490aac9d01923c8ba53f2c93a9544f59b6aedc\"\n  },\n  \"limitations\": [\n    \"Actual full retry callback and applyStats/recalcSt/refill helpers extracted dynamically; CH1 unlocked branch map/field restore and DB/DOM/media dependencies stubbed\",\n    \"No map geometry/collision/draw QA or actual field backup correctness verified\",\n    \"Post-retry deficit is explicitly injected HP150, actual enemy damage not run; restored HP refill source remains actual\",\n    \"No actual game/save/API/native execution\",\n    \"No candidate since final max/resource equality and ordering preserve source contract; formula untouched\"\n  ],\n  \"newFiles\": 0,\n  \"productionApplied\": false\n}\n"
}
```

## 완료 상태

자료 저장이 CH1-1 시연 완료를 뜻하지 않는다. root production/shared docs 동기화 및 실제 연속 시연 인수가 남는다. 저장 크레딧 소진은 승인 독립 source 작업 중단 조건이 아니다. 공식 목표 상태를 임의로 active/complete로 변경했다고 보고하지 않는다.


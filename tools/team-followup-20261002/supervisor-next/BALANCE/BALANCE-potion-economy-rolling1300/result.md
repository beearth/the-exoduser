# BALANCE — 물약 실제 호출·자원 소비 후보 인계

## 저장·인수 경계

완료 ID: BALANCE-forge-potion-bulk-revalidation-1308. 저장 epoch rolling-after-3b548b06-1300, 새소유파일 credit2를 result.md+checks.mjs에 사용했다. checks.mjs는 앞서 exit0으로 실행한 stdin 스크립트의 정확한 보존본이며 저장 뒤 재실행0. 기존 산출물 수정0, production/shared docs/Git/사용자게임/save 변경0.

CH1-1 역할 목표는 active다. 이 자료는 실제 source callback 경계의 후보·정상대조이며 시연/네이티브/배포 인수가 아니다. 테스트 입력의 플레이어 Lv100/1000은 물약 강화 요구 조건을 검증하는 주입값이며 실제 CH1-1 시작 캐릭터 레벨·세이브 관측값이 아니다.

## 실제 UI 경로 결함과 후보

양쪽 HTML의 전체 renderForge → 실제 물약 card.onclick → _fgSelect → fgCraftBtn.onclick → _fgCraft를 실행했다. 반복이 첫 단계의 비용/조건을 포획한 콜백을 재사용하여 레벨 요구/최대10단/현재 비용을 우회한다. 후보는 매 반복 현재단계·요구레벨·상한·현재 비용·잔액을 검증하고 실패시 false를 반환한다. _fgCraft는 strict false를 만나면 성공 횟수를 더하지 않고 중단한다. 양판 _fgSelect 호출 및 _forgeSel 할당 전체 rg에서 해당 callback을 채우는 실제 source caller는 물약 카드 1개뿐이다. 외부 콘솔·네이티브 경로는 인수하지 않는다.

| 입력 | 원문 (최종단계,잔액) | 후보 (최종단계,잔액) | 목적 |
|---|---|---|---|
| Lv100,0단,악의500,일반클릭 | 1,497 | 1,497 | 정상 단일 강화 state/trace 동일 |
| Lv100,0단,악의500,Shift | 10,470 | 1,497 | 다음 요구레벨200에서 중단 |
| Lv1000,9단,악의500,Ctrl | 19,250 | 10,475 | 10단 상한 |
| Lv1000,0단,악의500,Shift | 10,470 | 10,360 | 반복별 비용 갱신 |
| Lv1000,0단,악의7,Shift | 2,1 | 1,4 | 다음 실제 비용5 부족 시 중단 |

각 HTML × 5입력 × 원문/후보 =20실행, Node exit0. RNG 접근시 throw를 설치했고 해당 fixture는 RNG를 호출하지 않았다. 원문 및 후보 각 구매 완료는 save trace1회/selection cleared이며 실제 DB 저장은 아니다. DOM/atlas/BGM/텍스트/저장 대역을 사용했다.

## 공식과 docs 정확 인계

공식 변경은 없다. 기준 원가=(현재단계+1)×5, 요구레벨=(현재단계+1)×100, 최대단계10. 기존 _malCost 50% 정수올림을 적용하는 실제 단계별 소모는 3/5/8/10/13/15/18/20/23/25, 총140이다. docs 물약 문서의 5..50은 기준 원가로 표기하고 실제 소모를 구분해야 한다. 자원소비량표의 기존 전역50% 계약을 그대로 따른다. 루트만 양판 candidate를 병합하고 docs 전체 대응 계약을 정리/커밋한다. 이전 후보가 renderForge를 수정하므로 전체함수 덮어쓰기를 하지 말고 아래 replacement 계약을 현재 root WIP에 병합해야 한다. 보호2_3/상한/확률/패링/어택티켓 변경0.

후보 작성 후 전체 docs rg 실행 근거는 metadata 및 raw receipt에 보존했다. 공유문서 쓰기 권한 때문에 본 보고서가 정본수정 인계이며 source와 docs 적용은 미완료다.

## 정확 bulk source metadata/patch

```json
{
  "task": "BALANCE-forge-potion-bulk-revalidation-1308",
  "sources": [
    {
      "file": "game.html",
      "wholeSHA": "eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81",
      "anchors": {
        "renderForge": "6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb",
        "_fgSelect": "850c9f8454eca6e7b5603085a993243b59676e7da87ba71f2ec2ee955cd89559",
        "_fgCraft": "7f4c2ff3532279ac63471987112838a99e2f147e613915d8a415d4242a882883",
        "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7",
        "_malCost": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
      },
      "patch": {
        "renderOld": "()=>{POT_LV[item.type]++;G.mats-=cost;addTxt",
        "renderNew": "()=>{const current=POT_LV[item.type],nextCost=_malCost((current+1)*5);if(!Number.isFinite(current)||current>=10||P.lv<(current+1)*100||G.mats<nextCost)return false;POT_LV[item.type]++;G.mats-=nextCost;addTxt",
        "craftOld": "s.fn();_done++;",
        "craftNew": "if(s.fn()===false)break;_done++;"
      },
      "candidateSHA": {
        "render": "9cd0423d1663a502513d1f9d6d157a666303a9527d96088e42c2fbd166962dc2",
        "craft": "ddc546aa43424a5865abb5c6c22f2ab2cd74b27286d7294a7f1da23f6753be53"
      }
    },
    {
      "file": "game-easy-test.html",
      "wholeSHA": "b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515",
      "anchors": {
        "renderForge": "44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1",
        "_fgSelect": "850c9f8454eca6e7b5603085a993243b59676e7da87ba71f2ec2ee955cd89559",
        "_fgCraft": "7f4c2ff3532279ac63471987112838a99e2f147e613915d8a415d4242a882883",
        "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7",
        "_malCost": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
      },
      "patch": {
        "renderOld": "()=>{POT_LV[item.type]++;G.mats-=cost;addTxt",
        "renderNew": "()=>{const current=POT_LV[item.type],nextCost=_malCost((current+1)*5);if(!Number.isFinite(current)||current>=10||P.lv<(current+1)*100||G.mats<nextCost)return false;POT_LV[item.type]++;G.mats-=nextCost;addTxt",
        "craftOld": "s.fn();_done++;",
        "craftNew": "if(s.fn()===false)break;_done++;"
      },
      "candidateSHA": {
        "render": "b3c6ed42d31f13f3e82946c716a829a65430eb5829d03b0855697978043c948a",
        "craft": "ddc546aa43424a5865abb5c6c22f2ab2cd74b27286d7294a7f1da23f6753be53"
      }
    }
  ],
  "docs": {
    "query": "_fgCraft|_fgSelect|POT_LV|物약|물약 강화|강화 비용|악의 소비.*50",
    "exitCode": 0,
    "matches": 33,
    "sha": "d7ca4c3627d641fb9a867928a4c7898382d29b2c6076e9cf06a4496d01ee49ef"
  },
  "exitCode": 0,
  "sourceRuns": 20,
  "outputTruncated": true,
  "testsRerun": 0,
  "cases": [
    {
      "scenario": "single-normal",
      "current": [
        1,
        497
      ],
      "candidate": [
        1,
        497
      ]
    },
    {
      "scenario": "shift-level-requirement",
      "current": [
        10,
        470
      ],
      "candidate": [
        1,
        497
      ]
    },
    {
      "scenario": "ctrl-cap",
      "current": [
        19,
        250
      ],
      "candidate": [
        10,
        475
      ]
    },
    {
      "scenario": "shift-current-cost",
      "current": [
        10,
        470
      ],
      "candidate": [
        10,
        360
      ]
    },
    {
      "scenario": "shift-insufficient-next-cost",
      "current": [
        2,
        1
      ],
      "candidate": [
        1,
        4
      ]
    }
  ],
  "handoff": "Root only: add per-attempt current potion level/reqLv/max10/current cost/current resource guards in potion callback, return false when no mutation. Generic _fgCraft checks strict false to stop before count. Normal single purchase source traces unchanged. Existing formulas _malCost((current+1)*5),reqLv=(current+1)*100,max10 unchanged. Update allmatchingdocs; existing potion docs show nominal5..50 but current malice50% helper actual3,5,8,10,13,15,18,20,23,25; document nominal vs actual distinction. No override of protected systems. Native modifier click and other callback full regression pending.",
  "newFiles": 0,
  "productionApplied": false,
  "callerInventory": {
    "readAtUTC": "2026-10-02T12:59:00Z",
    "method": "rg _fgSelect calls and _forgeSel assignments in both HTML files",
    "fgSelectCallersPerVariant": 1,
    "caller": "renderForge potion card callback",
    "otherForgeCallbackDependency": "No other source assignment populates _forgeSel.fn; generic change affects existing potion selection path. Native/cached external callers not verified."
  },
  "remainingGate": "Root applies candidate/shared docs + actual native modifier click/save + CH1-1 demo acceptance. Source function consumers exhaustively searched in both HTML, no other source callback."
}
```

## bulk 원 도구 receipt — 중간이 잘려 반환됨

원 stdout의 완전본으로 주장하지 않는다. 저장 가능한 receipt 자체를 수정 없이 보존한다. 원본 실행 assertion과 exit0 및 source SHA는 남아 있다. 원출력 복원을 위해 완료검사를 재실행하지 않았다.

```json
{
  "chunk_id": "fa386d",
  "wall_time_seconds": 0.000005791,
  "exit_code": 0,
  "original_token_count": 8486,
  "output": "Warning: truncated output (original token count: 8486)\nTotal output lines: 1832\n\n{\n  \"task\": \"BALANCE-forge-potion-bulk-revalidation-1308\",\n  \"at\": \"2026-10-02T12:58:18.645Z\",\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81\",\n      \"anchors\": {\n        \"renderForge\": \"6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb\",\n        \"_fgSelect\": \"850c9f8454eca6e7b5603085a993243b59676e7da87ba71f2ec2ee955cd89559\",\n        \"_fgCraft\": \"7f4c2ff3532279ac63471987112838a99e2f147e613915d8a415d4242a882883\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\",\n        \"_malCost\": \"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\"\n      },\n      \"patch\": {\n        \"renderOld\": \"()=>{POT_LV[item.type]++;G.mats-=cost;addTxt\",\n        \"renderNew\": \"()=>{const current=POT_LV[item.type],nextCost=_malCost((current+1)*5);if(!Number.isFinite(current)||current>=10||P.lv<(current+1)*100||G.mats<nextCost)return false;POT_LV[item.type]++;G.mats-=nextCost;addTxt\",\n        \"craftOld\": \"s.fn();_done++;\",\n        \"craftNew\": \"if(s.fn()===false)break;_done++;\"\n      },\n      \"candidateSHA\": {\n        \"render\": \"9cd0423d1663a502513d1f9d6d157a666303a9527d96088e42c2fbd166962dc2\",\n        \"craft\": \"ddc546aa43424a5865abb5c6c22f2ab2cd74b27286d7294a7f1da23f6753be53\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515\",\n      \"anchors\": {\n        \"renderForge\": \"44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1\",\n        \"_fgSelect\": \"850c9f8454eca6e7b5603085a993243b59676e7da87ba71f2ec2ee955cd89559\",\n        \"_fgCraft\": \"7f4c2ff3532279ac63471987112838a99e2f147e613915d8a415d4242a882883\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\",\n        \"_malCost\": \"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\"\n      },\n      \"patch\": {\n        \"renderOld\": \"()=>{POT_LV[item.type]++;G.mats-=cost;addTxt\",\n        \"renderNew\": \"()=>{const current=POT_LV[item.type],nextCost=_malCost((current+1)*5);if(!Number.isFinite(current)||current>=10||P.lv<(current+1)*100||G.mats<nextCost)return false;POT_LV[item.type]++;G.mats-=nextCost;addTxt\",\n        \"craftOld\": \"s.fn();_done++;\",\n        \"craftNew\": \"if(s.fn()===false)break;_done++;\"\n      },\n      \"candidateSHA\": {\n        \"render\": \"b3c6ed42d31f13f3e82946c716a829a65430eb5829d03b0855697978043c948a\",\n        \"craft\": \"ddc546aa43424a5865abb5c6c22f2ab2cd74b27286d7294a7f1da23f6753be53\"\n      }\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"scenario\": \"single-normal\",\n      \"policy\": \"current\",\n      \"input\": {\n        \"id\": \"single-normal\",\n        \"level\": 100,\n        \"initial\": 0,\n        \"mats\": 500,\n        \"evt\": {},\n        \"expectedLevel\": 1,\n        \"expectedMats\": 497\n      },\n      \"outcome\": {\n        \"potLv\": 1,\n        \"mats\": 497,\n        \"selectionCleared\": true,\n        \"saveCalls\": 1,\n        \"upgradeMessages\": 1\n      },\n      \"trace\": [\n        [\n          \"BGM\"\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"text\",\n          0,\n          -20,\n          \"❤️‍🔥 HP 물…6886 tokens truncated…         \"❤️‍🔥 HP 물약 Lv.9!\",\n          \"#ffcc00\",\n          50\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"text\",\n          0,\n          -20,\n          \"❤️‍🔥 HP 물약 Lv.10!\",\n          \"#ffcc00\",\n          50\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"save\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"shift-insufficient-next-cost\",\n      \"policy\": \"current\",\n      \"input\": {\n        \"id\": \"shift-insufficient-next-cost\",\n        \"level\": 1000,\n        \"initial\": 0,\n        \"mats\": 7,\n        \"evt\": {\n          \"shiftKey\": true\n        },\n        \"expectedLevel\": 1,\n        \"expectedMats\": 4\n      },\n      \"outcome\": {\n        \"potLv\": 2,\n        \"mats\": 1,\n        \"selectionCleared\": true,\n        \"saveCalls\": 1,\n        \"upgradeMessages\": 2\n      },\n      \"trace\": [\n        [\n          \"BGM\"\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"text\",\n          0,\n          -20,\n          \"❤️‍🔥 HP 물약 Lv.1!\",\n          \"#ffcc00\",\n          50\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"text\",\n          0,\n          -20,\n          \"❤️‍🔥 HP 물약 Lv.2!\",\n          \"#ffcc00\",\n          50\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"save\"\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"scenario\": \"shift-insufficient-next-cost\",\n      \"policy\": \"candidate\",\n      \"input\": {\n        \"id\": \"shift-insufficient-next-cost\",\n        \"level\": 1000,\n        \"initial\": 0,\n        \"mats\": 7,\n        \"evt\": {\n          \"shiftKey\": true\n        },\n        \"expectedLevel\": 1,\n        \"expectedMats\": 4\n      },\n      \"outcome\": {\n        \"potLv\": 1,\n        \"mats\": 4,\n        \"selectionCleared\": true,\n        \"saveCalls\": 1,\n        \"upgradeMessages\": 1\n      },\n      \"trace\": [\n        [\n          \"BGM\"\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"text\",\n          0,\n          -20,\n          \"❤️‍🔥 HP 물약 Lv.1!\",\n          \"#ffcc00\",\n          50\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"BGM\"\n        ],\n        [\n          \"save\"\n        ]\n      ]\n    }\n  ],\n  \"sourceRuns\": 20,\n  \"docs\": {\n    \"query\": \"_fgCraft|_fgSelect|POT_LV|物약|물약 강화|강화 비용|악의 소비.*50\",\n    \"exitCode\": 0,\n    \"matches\": 33,\n    \"sha\": \"d7ca4c3627d641fb9a867928a4c7898382d29b2c6076e9cf06a4496d01ee49ef\"\n  },\n  \"limits\": [\n    \"Full renderForge→actual card.onclick→_fgSelect→actual fgCraftBtn.onclick→_fgCraft source executed; DOM/media/save stubbed\",\n    \"Single normal display/cost/trace preserved; invalid bulk results intentionally differ to obey existing formula and level/cap requirements\",\n    \"No chance/RNG used in fixture; random access throws\",\n    \"New generic callback false means abort before done count; other forge callbacks regression/integration root gate pending\",\n    \"No native modifier-key/default event or actual game/save validation\"\n  ],\n  \"productionApplied\": false,\n  \"newFiles\": 0\n}\n"
}
```

## 함께 인계하는 독립 자동 물약 후보

완료 ID: BALANCE-restore-autopotion-nonfinite-1302. 전체 dbRestore 실제소스와 update의 실제 자동 물약 블록을 연결해 potLv.hp:1e309→Infinity를 복원했다. 원문에서는 만HP350에서도 회복0/악의50000→49999/CD420이 발생한다. 후보는 raw 회복량의 유한성과 정수 회복량>0을 확인하며 HP350/악의50000/CD0을 유지한다. 정상HP150→250/악의49999/CD420 및 normal trace는 동일하다. 양판×비정상/정상×원문/후보8실행 exit0. 첫 시도는 VM realm prototype trace 비교로 4시나리오 뒤 실패했다. 호출 시점 snapshot으로 하니스를 고친 뒤8건 통과. 성공 stdout도 도구 한도로 잘렸고 이후 JSON 전체 parse가 Warning접두어에서 실패했다. 모든 실패/성공 receipt를 아래 보존하며 숨기지 않는다. 복원 스키마/저장 potLv 자체/기본 회복/비용/쿨다운/임계값 정책은 변경0이다. 전체 update/native는 실행하지 않았다.

```json
{
  "task": "BALANCE-restore-autopotion-nonfinite-1302",
  "sources": [
    {
      "file": "game.html",
      "wholeSHA": "eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81",
      "anchors": {
        "dbRestore": "63385633575b51647ab02b9e27f6d840e036dc35f9cd595b1cc65063e1133c35",
        "_restoreExpProgress": "80a85d8855ecf754cfa06c164f42a6a0b6117950c248364583ebd8eee1cfd644",
        "_sanitizeCoreState": "a9a20129eaaf77a7f4b5989abe32df98c9f5fda95e23b5ff8fdfaaf8b34b9c37",
        "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7"
      },
      "autoBlockSHA": "356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455",
      "patch": {
        "old": "const _apHealAmt=~~(potHeal('hp')*(1+_eqAffix('potionPower')));",
        "newer": "const _apHealRaw=potHeal('hp')*(1+_eqAffix('potionPower'));\n  const _apHealAmt=Number.isFinite(_apHealRaw)?~~_apHealRaw:0;",
        "conditionOld": "autoPotCd<=0&&P.hp>0",
        "conditionNew": "autoPotCd<=0&&_apHealAmt>0&&P.hp>0"
      },
      "candidateSHA": "1730af43031dd7f0cfceae5e903559ee21992d115e466e8a440c2a7d3896f9fe"
    },
    {
      "file": "game-easy-test.html",
      "wholeSHA": "b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515",
      "anchors": {
        "dbRestore": "2785fd6138a7325f64bbf2c27cde281e270caa85f517b7a7c52801ad9726d274",
        "_restoreExpProgress": "80a85d8855ecf754cfa06c164f42a6a0b6117950c248364583ebd8eee1cfd644",
        "_sanitizeCoreState": "a9a20129eaaf77a7f4b5989abe32df98c9f5fda95e23b5ff8fdfaaf8b34b9c37",
        "potHeal": "320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7"
      },
      "autoBlockSHA": "356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455",
      "patch": {
        "old": "const _apHealAmt=~~(potHeal('hp')*(1+_eqAffix('potionPower')));",
        "newer": "const _apHealRaw=potHeal('hp')*(1+_eqAffix('potionPower'));\n  const _apHealAmt=Number.isFinite(_apHealRaw)?~~_apHealRaw:0;",
        "conditionOld": "autoPotCd<=0&&P.hp>0",
        "conditionNew": "autoPotCd<=0&&_apHealAmt>0&&P.hp>0"
      },
      "candidateSHA": "1730af43031dd7f0cfceae5e903559ee21992d115e466e8a440c2a7d3896f9fe"
    }
  ],
  "docs": {
    "query": "potLv|POT_LV|autoPotCd|_apHealAmt|potHeal|회복량",
    "exitCode": 0,
    "matches": 34,
    "sha": "adde052ba1e6ee3daceb7553a86c2a14a3f3aded1f9d6cc604dfbd0732fea30b"
  },
  "success": {
    "exitCode": 0,
    "sourceRuns": 8,
    "normal": {
      "hpBefore": 150,
      "hpAfter": 250,
      "matsBefore": 50000,
      "matsAfter": 49999,
      "cooldown": 420
    },
    "invalidCurrent": {
      "loadedPotLv": "Infinity",
      "hpBefore": 350,
      "hpAfter": 350,
      "matsAfter": 49999,
      "cooldown": 420
    },
    "invalidCandidate": {
      "hpAfter": 350,
      "matsAfter": 50000,
      "cooldown": 0
    }
  },
  "failures": {
    "firstRunVMRealmTraceComparison": 1,
    "scenariosReachedBeforeFailure": 4,
    "secondRunNodeExit": 0,
    "secondRunStdoutToolTruncated": true,
    "postToolParseError": 1
  },
  "handoff": "Root applies raw healing finite check plus positive integer healing trigger guard in actual auto-potion block. Synchronize potHeal/autoPotCd/POT_LV/potLv matching docs. Preserve current positive healing formula,420 base and modifiers/min6 cooldown,1 malice consumption,HP deficit design. Restored data unchanged. Actual full updateP/native integration not verified.",
  "newFiles": 0,
  "productionApplied": false
}
```

### 자동 물약 실제 성공 stdin 원문 (저장 후 실행0)

```javascript
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';
const sha=x=>createHash('sha256').update(x).digest('hex');
function extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}
function balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}

const sources=[],rows=[];
for(const file of ['game.html','game-easy-test.html']){
 const s=fs.readFileSync(file,'utf8'),names=['dbRestore','_restoreExpProgress','_sanitizeCoreState','potHeal'],f=Object.fromEntries(names.map(n=>[n,extract(s,n)]));
 const begin=s.indexOf('  if(autoPotCd>0)autoPotCd-=sp;'),end=s.indexOf('  // ─── [S16c]',begin);assert(begin>=0&&end>begin);
 const block=s.slice(begin,end);parse('function frame(){'+block+'}',{ecmaVersion:'latest'});
 const old="const _apHealAmt=~~(potHeal('hp')*(1+_eqAffix('potionPower')));";
 const newer="const _apHealRaw=potHeal('hp')*(1+_eqAffix('potionPower'));\n  const _apHealAmt=Number.isFinite(_apHealRaw)?~~_apHealRaw:0;";
 const candidate=block.replace(old,newer).replace("autoPotCd<=0&&P.hp>0","autoPotCd<=0&&_apHealAmt>0&&P.hp>0");
 assert.notEqual(candidate,block);assert(block.includes(old));
 sources.push({file,wholeSHA:sha(s),anchors:Object.fromEntries(names.map(n=>[n,sha(f[n])])),autoBlockSHA:sha(block),patch:{old,newer,conditionOld:'autoPotCd<=0&&P.hp>0',conditionNew:'autoPotCd<=0&&_apHealAmt>0&&P.hp>0'},candidateSHA:sha(candidate)});
 for(const invalid of [true,false])for(const policy of ['current','candidate']){
 const raw=JSON.stringify({charIdx:0,player:{lv:1,exp:0,maxExp:15,hp:invalid?350:150,mhp:350,mp:80,mmp:80,st:100,mst:100},inv:{bag:[],equipped:{}},game:{stage:0,mats:0},potLv:{hp:invalid?'OVERFLOW':0},gritCostModeV2:1}).replace('"OVERFLOW"','1e309');
 const d=JSON.parse(raw),trace=[],P={mhp:350,mmp:80,mst:100,skills:{},x:0,y:0},G={mats:50000},INV={};
 const stub=n=>(...a)=>trace.push(JSON.parse(JSON.stringify([n,...a],(_,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v)));
 const c={d,P,G,INV,CHAR_LIST:[{}],_charIdx:0,SLOT_NAMES:['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'],STORAGE:{},STORAGE_MAX:200,STATS:{},PASSIVES:{pRegen:0},QSLOTS:[],POT:{hp:{}},POT_LV:{hp:0},CRYSTAL_BAG:[],CRYSTAL_DUST:0,_CR_LEGACY_IDS:{},UPGRADES:{},SKILL_LIST:[],SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,_FUSE_PAIRS:{},_grit:0,BAG_MAX:300,_loadCharAtlas:stub('atlas'),_applyMaskAtlas:stub('mask'),_loadSharedMats:()=>50000,_saveSharedMats:()=>{throw Error('unexpected save')},_getStore:()=>{},_skProfCap:()=>100,_getAllAbsorbed:()=>[],_syncActiveSkAfterReset:stub('slots'),_repairAreaSkillSlot:stub('repair'),_ensureBaseWingStrike:stub('wing'),_isFused:()=>false,Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}}),window:{},sp:1,autoPotCd:0,_eqAffix:()=>0,gl:()=>({}),blt:()=>({}),SFX:{potion:stub('potionSFX')},addTxt:stub('text'),_T:x=>x};
 const ctx=vm.createContext(c);vm.runInContext(Object.values(f).join('\n')+'\nfunction tick(){'+(policy==='current'?block:candidate)+'}',ctx);
 assert.equal(vm.runInContext('dbRestore(d)',ctx),true);assert.equal(c.POT_LV.hp,invalid?Infinity:0);
 const before={hp:P.hp,mats:G.mats,cd:c.autoPotCd};
 vm.runInContext('tick()',ctx);
 if(invalid&&policy==='current'){assert.equal(G.mats,49999);assert.equal(P.hp,350);assert.equal(c.autoPotCd,420);assert(trace.some(x=>x[0]==='potionSFX'));}
 else if(invalid){assert.equal(G.mats,50000);assert.equal(P.hp,350);assert.equal(c.autoPotCd,0);assert(!trace.some(x=>x[0]==='potionSFX'));}
 else{assert.equal(G.mats,49999);assert.equal(P.hp,250);assert.equal(c.autoPotCd,420);}
 rows.push({file,policy,invalid,rawSHA:sha(raw),loadedPotLevel:invalid?'Infinity':0,before,after:{hp:P.hp,mats:G.mats,cd:c.autoPotCd},trace});
 }
 const normal=rows.filter(r=>r.file===file&&!r.invalid);assert.deepEqual(normal[0].trace,normal[1].trace);assert.deepEqual(normal[0].after,normal[1].after);
}
const q='potLv|POT_LV|autoPotCd|_apHealAmt|potHeal|회복량',d=spawnSync('rg',['-n',q,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);
console.log(JSON.stringify({task:'BALANCE-restore-autopotion-nonfinite-1302',at:new Date().toISOString(),sources,rows,sourceRuns:8,decision:'candidate prevents zero/nonfinite healing resource consumption; normal formula/amount/cooldown unchanged',docs:{query:q,exitCode:d.status,matches:d.stdout.trim().split('\n').length,sha:sha(d.stdout)},limits:['Full dbRestore source with atlas/storage/skill helper stubs; actual save/API unverified','Actual auto-potion block dynamically extracted from updateP; full updateP/frame/native run not executed','No RNG use in fixture, source random stub throws; normal trace/cost/cooldown equal within this block','No repair of stored potLv, no caps/probability/rate/formula changes','DOM/audio/text effects stubbed; root integration/shared docs exact update needed'],productionApplied:false,newFiles:0},null,2));

```

### 자동 물약 최초 실패

```json
{
  "chunk_id": "b6334c",
  "wall_time_seconds": 0.000006375,
  "exit_code": 1,
  "original_token_count": 994,
  "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal:\n\n... Skipped lines\n[\n  [\n    'mask'\n  ],\n  [\n    'slots',\n    []\n  ],\n  [\n    'repair'\n  ],\n  [\n    'wing',\n    {\n      _apBossCleared: [],\n      _cardProf: {},\n      _catProf: {},\n      _fuseProfSec: {},\n      _fused: {},\n      _goddessGift: [],\n      _passiveQueue: [],\n      _skProf: {},\n      _transLvCount: 0,\n      _transLvDate: null,\n      activeBowSk: 'normal',\n      activeChargeSk: 'charge',\n      activeCtSk: 'ghostWalk',\n      activeLMBSk: 'kiSlash',\n      activeMagicSk: 'fireball',\n      activeQSk: 'parry',\n      activeRMBSk: 'shieldBlock',\n      activeTechSk: 'giantSlam',\n      ap: 0,\n      baseAtk: 8,\n      baseDef: 2,\n      exp: 0,\n      hp: 250,\n      lv: 1,\n      maskOn: true,\n      maxExp: 15,\n      mhp: 350,\n      mmp: 80,\n      mp: 80,\n      mpR: 0,\n      mshield: 0,\n      mst: 100,\n      rage: 0,\n      shield: 0,\n      skills: {\n        giantSlam: 1,\n...}\n\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:30:64\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: [\n    [ 'mask' ],\n    [ 'slots', [] ],\n    [ 'repair' ],\n    [\n      'wing',\n      {\n        mhp: 350,\n        mmp: 80,\n        mst: 100,\n        skills: { kiSlash: 1, spikeTrap: 1, holyDome: 1, giantSlam: 1 },\n        x: 0,\n        y: 0,\n        lv: 1,\n        exp: 0,\n        maxExp: 15,\n        _transLvDate: null,\n        _transLvCount: 0,\n        _apBossCleared: [],\n        _goddessGift: [],\n        sp: 0,\n        ap: 0,\n        _passiveQueue: [],\n        baseAtk: 8,\n        baseDef: 2,\n        mpR: 0,\n        stR: 0.28,\n        hp: 250,\n        mp: 80,\n        st: 100,\n        speed: 2.6,\n        shield: 0,\n        mshield: 0,\n        rage: 0,\n        maskOn: true,\n        _fused: {},\n        _skProf: {},\n        _fuseProfSec: {},\n        _cardProf: {},\n        _catProf: {},\n        activeLMBSk: 'kiSlash',\n        activeChargeSk: 'charge',\n        activeBowSk: 'normal',\n        activeTechSk: 'giantSlam',\n        activeMagicSk: 'fireball',\n        activeRMBSk: 'shieldBlock',\n        activeQSk: 'parry',\n        activeCtSk: 'ghostWalk'\n      }\n    ],\n    [ 'potionSFX' ],\n    [ 'text', 0, -25, '👿 악의 추출: +100 HP', '#33ff33', 40 ]\n  ],\n  expected: [\n    [ 'mask' ],\n    [ 'slots', [] ],\n    [ 'repair' ],\n    [\n      'wing',\n      {\n        mhp: 350,\n        mmp: 80,\n        mst: 100,\n        skills: { kiSlash: 1, spikeTrap: 1, holyDome: 1, giantSlam: 1 },\n        x: 0,\n        y: 0,\n        lv: 1,\n        exp: 0,\n        maxExp: 15,\n        _transLvDate: null,\n        _transLvCount: 0,\n        _apBossCleared: [],\n        _goddessGift: [],\n        sp: 0,\n        ap: 0,\n        _passiveQueue: [],\n        baseAtk: 8,\n        baseDef: 2,\n        mpR: 0,\n        stR: 0.28,\n        hp: 250,\n        mp: 80,\n        st: 100,\n        speed: 2.6,\n        shield: 0,\n        mshield: 0,\n        rage: 0,\n        maskOn: true,\n        _fused: {},\n        _skProf: {},\n        _fuseProfSec: {},\n        _cardProf: {},\n        _catProf: {},\n        activeLMBSk: 'kiSlash',\n        activeChargeSk: 'charge',\n        activeBowSk: 'normal',\n        activeTechSk: 'giantSlam',\n        activeMagicSk: 'fireball',\n        activeRMBSk: 'shieldBlock',\n        activeQSk: 'parry',\n        activeCtSk: 'ghostWalk'\n      }\n    ],\n    [ 'potionSFX' ],\n    [ 'text', 0, -25, '👿 악의 추출: +100 HP', '#33ff33', 40 ]\n  ],\n  operator: 'deepStrictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
}
```

### 자동 물약 성공 — 잘린 도구 원출력

```json
{
  "chunk_id": "9e5faf",
  "wall_time_seconds": 0.000006042,
  "exit_code": 0,
  "original_token_count": 4814,
  "output": "Warning: truncated output (original token count: 4814)\nTotal output lines: 763\n\n{\n  \"task\": \"BALANCE-restore-autopotion-nonfinite-1302\",\n  \"at\": \"2026-10-02T12:55:47.075Z\",\n  \"sources\": [\n    {\n      \"file\": \"game.html\",\n      \"wholeSHA\": \"eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81\",\n      \"anchors\": {\n        \"dbRestore\": \"63385633575b51647ab02b9e27f6d840e036dc35f9cd595b1cc65063e1133c35\",\n        \"_restoreExpProgress\": \"80a85d8855ecf754cfa06c164f42a6a0b6117950c248364583ebd8eee1cfd644\",\n        \"_sanitizeCoreState\": \"a9a20129eaaf77a7f4b5989abe32df98c9f5fda95e23b5ff8fdfaaf8b34b9c37\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\"\n      },\n      \"autoBlockSHA\": \"356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455\",\n      \"patch\": {\n        \"old\": \"const _apHealAmt=~~(potHeal('hp')*(1+_eqAffix('potionPower')));\",\n        \"newer\": \"const _apHealRaw=potHeal('hp')*(1+_eqAffix('potionPower'));\\n  const _apHealAmt=Number.isFinite(_apHealRaw)?~~_apHealRaw:0;\",\n        \"conditionOld\": \"autoPotCd<=0&&P.hp>0\",\n        \"conditionNew\": \"autoPotCd<=0&&_apHealAmt>0&&P.hp>0\"\n      },\n      \"candidateSHA\": \"1730af43031dd7f0cfceae5e903559ee21992d115e466e8a440c2a7d3896f9fe\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"wholeSHA\": \"b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515\",\n      \"anchors\": {\n        \"dbRestore\": \"2785fd6138a7325f64bbf2c27cde281e270caa85f517b7a7c52801ad9726d274\",\n        \"_restoreExpProgress\": \"80a85d8855ecf754cfa06c164f42a6a0b6117950c248364583ebd8eee1cfd644\",\n        \"_sanitizeCoreState\": \"a9a20129eaaf77a7f4b5989abe32df98c9f5fda95e23b5ff8fdfaaf8b34b9c37\",\n        \"potHeal\": \"320846b67de0a24d93dab7b3f12c0ff8b499886e01defb6fc2037a8e82b0cdb7\"\n      },\n      \"autoBlockSHA\": \"356cbc793505bb733a39b4e744485fdd5c4d6d18b703c0dbe30266b41c60c455\",\n      \"patch\": {\n        \"old\": \"const _apHealAmt=~~(potHeal('hp')*(1+_eqAffix('potionPower')));\",\n        \"newer\": \"const _apHealRaw=potHeal('hp')*(1+_eqAffix('potionPower'));\\n  const _apHealAmt=Number.isFinite(_apHealRaw)?~~_apHealRaw:0;\",\n        \"conditionOld\": \"autoPotCd<=0&&P.hp>0\",\n        \"conditionNew\": \"autoPotCd<=0&&_apHealAmt>0&&P.hp>0\"\n      },\n      \"candidateSHA\": \"1730af43031dd7f0cfceae5e903559ee21992d115e466e8a440c2a7d3896f9fe\"\n    }\n  ],\n  \"rows\": [\n    {\n      \"file\": \"game.html\",\n      \"policy\": \"current\",\n      \"invalid\": true,\n      \"rawSHA\": \"81ffea6968ef743425d4ccc4ec3d609c5a8b9447c18d09581ca47c5a960b463d\",\n      \"loadedPotLevel\": \"Infinity\",\n      \"before\": {\n        \"hp\": 350,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"after\": {\n        \"hp\": 350,\n        \"mats\": 49999,\n        \"cd\": 420\n      },\n      \"trace\": [\n        [\n          \"mask\"\n        ],\n        [\n          \"slots\",\n          []\n        ],\n        [\n          \"repair\"\n        ],\n        [\n          \"wing\",\n          {\n            \"mhp\": 350,\n            \"mmp\": 80,\n            \"mst\": 100,\n            \"skills\": {\n              \"kiSlash\": 1,\n              \"spikeTrap\": 1,\n              \"holyDome\": 1,\n              \"giantSlam\": 1\n            },\n            \"x\": 0,\n            \"y\": 0,\n            \"lv\": 1,\n            \"exp\": 0,\n            \"maxExp\": 15,\n            \"_transLvDate\": null,\n            \"_transLvCount\": 0,\n            \"_apBossCleared\": [],\n            \"_goddessGift\": [],\n            \"sp\": 0,\n            \"ap\": 0,\n            \"_passiveQueue\": [],\n            \"baseAtk\": 8,\n            \"baseDef\": 2,\n            \"mpR\": 0,\n            \"stR\": 0.28,\n            \"hp\": 350,\n            \"mp\": 80,\n            \"st\": 100,\n            \"speed\": 2.6,\n            \"shield\": 0,\n            \"mshield\": 0,\n            \"rage\": 0,\n            \"maskOn\": true,\n            \"_fused\": {},\n            \"_skProf\": {},\n            \"_fuseProfSec\": {},\n            \"_cardProf\": {},\n            \"_catProf\": {},\n            \"activeLMBSk\": \"kiSlash\",\n            \"activeChargeSk\": \"charge\",\n            \"activeBowSk\": \"normal\",\n            \"activeTechSk\": \"giantSlam\",\n            \"activeMagicSk\": \"fireball\",\n            \"activeRMBSk\": \"shieldBlock\",\n            \"activeQSk\": \"parry\",\n            \"activeCtSk\": \"ghostWalk\"\n          }\n        ],\n        [\n          \"potionSFX\"\n        ],\n        [\n          \"text\",\n          0,\n          -25,\n          \"👿 악의 추출: +0 HP\",\n          \"#33ff33\",\n          40\n        ]\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"policy\": \"candidate\",\n      \"invalid\": true,\n      \"rawSHA\": \"81ffea6968ef743425d4ccc4ec3d609c5a8b9447c18d09581ca47c5a960b463d\",\n      \"loadedPotLevel\": \"Infinity\",\n      \"before\": {\n        \"hp\": 350,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"after\": {\n        \"hp\": 350,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"trace\": [\n        [\n          \"mask\"\n        ],\n        [\n          \"slots\",\n          []\n        ],\n        [\n          \"repair\"\n        ],\n        [\n          \"wing\",\n          {\n            \"mhp\": 350,\n            \"mmp\": 80,\n            \"mst\": 100,\n            \"skills\": {\n              \"kiSlash\": 1,\n              \"spikeTrap\": 1,\n              \"holyDome\": 1,\n              \"giantSlam\": 1\n            },\n            \"x\": 0,\n            \"y\": 0,\n            \"lv\": 1,\n            \"exp\": 0,\n            \"maxExp\": 15,\n            \"_transLvDate\": null,\n            \"_transLvCount\": 0,\n            \"_apBossCleared\": [],\n            \"_goddessGift\": [],\n            \"sp\": 0,\n            \"ap\": 0,\n            \"_passiveQueue\": [],\n            \"baseAtk\": 8,\n            \"baseDef\": 2,\n            \"mpR\": 0,\n            \"stR\": 0.28,\n            \"hp\": 350,\n            \"mp\": 80,\n            \"st\": 100,\n            \"speed\": 2.6,\n            \"shield\": 0,\n            \"mshield\": 0,\n            \"rage\": 0,\n            \"maskOn\": true,\n            \"_fused\": {},\n            \"_skProf\": {},\n            \"_fuseProfSec\": {},\n            \"_cardProf\": {},\n            \"_catProf\": {},\n            \"activeLMBSk\": \"kiSlash\",\n            \"activeChargeSk\": \"charge\",\n            \"activeBowSk\": \"normal\",\n            \"activeTechSk\": \"giantSlam\",\n            \"activeMagicSk\": \"fireball\",\n            \"activeRMBSk\": \"shieldBlock\",\n            \"activeQSk\": \"parry\",\n            \"activeCtSk\": \"ghostWalk\"\n          }\n        ]\n      ]\n    },\n    {\n      \"file\": \"game.html\",\n      \"policy\": \"current\",\n      \"invalid\": false,\n      \"rawSHA\": \"d301b25af29ddba505a9116513d6363d3c7478b48a332580bfa958eacf692234\",\n      \"loadedPotLevel\": 0,\n      \"before\": {\n        \"hp\": 150,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 49999,\n        \"cd\": 420\n      },\n      \"trace\": [\n        [\n          \"mask\"\n        ],\n        [\n          \"slots\",\n          []\n        ],\n        [\n          \"repair\"\n        ],\n        [\n          \"wing\",\n          {\n            \"mhp\": 350,\n            \"mmp\": 80,\n            \"mst\": 100,\n            \"skills\": {\n              \"kiSlash\": 1,\n              \"spikeTrap\": 1,\n              \"holyDome\": 1,\n              \"giantSlam\": 1\n            },\n            \"x\": 0,\n            \"y\": 0,\n            \"lv\": 1,\n            \"exp\": 0,\n            \"maxExp\": 15,\n            \"_transLvDate\": null,\n            \"_transLvCount\": 0,\n            \"_apBossCleared\": [],\n            \"_goddessGift\": [],\n            \"sp\": 0,\n            \"ap\": 0,\n            \"_passiveQueue\": [],\n            \"baseAtk\": 8,\n            \"baseDef\": 2,\n            \"mpR\": 0,\n            \"stR\": 0.28,\n            \"hp\": 150,\n            \"mp\": 80,\n            \"st\": 100,\n            \"speed\": 2.6,\n            \"shield\": 0,\n            \"mshield\": 0,\n            \"rage\": 0,\n          …1014 tokens truncated…d\": 0,\n            \"mshield\": 0,\n            \"rage\": 0,\n            \"maskOn\": true,\n            \"_fused\": {},\n            \"_skProf\": {},\n            \"_fuseProfSec\": {},\n            \"_cardProf\": {},\n            \"_catProf\": {},\n            \"activeLMBSk\": \"kiSlash\",\n            \"activeChargeSk\": \"charge\",\n            \"activeBowSk\": \"normal\",\n            \"activeTechSk\": \"giantSlam\",\n            \"activeMagicSk\": \"fireball\",\n            \"activeRMBSk\": \"shieldBlock\",\n            \"activeQSk\": \"parry\",\n            \"activeCtSk\": \"ghostWalk\"\n          }\n        ],\n        [\n          \"potionSFX\"\n        ],\n        [\n          \"text\",\n          0,\n          -25,\n          \"👿 악의 추출: +0 HP\",\n          \"#33ff33\",\n          40\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"policy\": \"candidate\",\n      \"invalid\": true,\n      \"rawSHA\": \"81ffea6968ef743425d4ccc4ec3d609c5a8b9447c18d09581ca47c5a960b463d\",\n      \"loadedPotLevel\": \"Infinity\",\n      \"before\": {\n        \"hp\": 350,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"after\": {\n        \"hp\": 350,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"trace\": [\n        [\n          \"mask\"\n        ],\n        [\n          \"slots\",\n          []\n        ],\n        [\n          \"repair\"\n        ],\n        [\n          \"wing\",\n          {\n            \"mhp\": 350,\n            \"mmp\": 80,\n            \"mst\": 100,\n            \"skills\": {\n              \"kiSlash\": 1,\n              \"spikeTrap\": 1,\n              \"holyDome\": 1,\n              \"giantSlam\": 1\n            },\n            \"x\": 0,\n            \"y\": 0,\n            \"lv\": 1,\n            \"exp\": 0,\n            \"maxExp\": 15,\n            \"_transLvDate\": null,\n            \"_transLvCount\": 0,\n            \"_apBossCleared\": [],\n            \"_goddessGift\": [],\n            \"sp\": 0,\n            \"ap\": 0,\n            \"baseAtk\": 8,\n            \"baseDef\": 2,\n            \"mpR\": 0,\n            \"stR\": 0.28,\n            \"hp\": 350,\n            \"mp\": 80,\n            \"st\": 100,\n            \"speed\": 2.6,\n            \"shield\": 0,\n            \"mshield\": 0,\n            \"rage\": 0,\n            \"maskOn\": true,\n            \"_fused\": {},\n            \"_skProf\": {},\n            \"_fuseProfSec\": {},\n            \"_cardProf\": {},\n            \"_catProf\": {},\n            \"activeLMBSk\": \"kiSlash\",\n            \"activeChargeSk\": \"charge\",\n            \"activeBowSk\": \"normal\",\n            \"activeTechSk\": \"giantSlam\",\n            \"activeMagicSk\": \"fireball\",\n            \"activeRMBSk\": \"shieldBlock\",\n            \"activeQSk\": \"parry\",\n            \"activeCtSk\": \"ghostWalk\"\n          }\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"policy\": \"current\",\n      \"invalid\": false,\n      \"rawSHA\": \"d301b25af29ddba505a9116513d6363d3c7478b48a332580bfa958eacf692234\",\n      \"loadedPotLevel\": 0,\n      \"before\": {\n        \"hp\": 150,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 49999,\n        \"cd\": 420\n      },\n      \"trace\": [\n        [\n          \"mask\"\n        ],\n        [\n          \"slots\",\n          []\n        ],\n        [\n          \"repair\"\n        ],\n        [\n          \"wing\",\n          {\n            \"mhp\": 350,\n            \"mmp\": 80,\n            \"mst\": 100,\n            \"skills\": {\n              \"kiSlash\": 1,\n              \"spikeTrap\": 1,\n              \"holyDome\": 1,\n              \"giantSlam\": 1\n            },\n            \"x\": 0,\n            \"y\": 0,\n            \"lv\": 1,\n            \"exp\": 0,\n            \"maxExp\": 15,\n            \"_transLvDate\": null,\n            \"_transLvCount\": 0,\n            \"_apBossCleared\": [],\n            \"_goddessGift\": [],\n            \"sp\": 0,\n            \"ap\": 0,\n            \"baseAtk\": 8,\n            \"baseDef\": 2,\n            \"mpR\": 0,\n            \"stR\": 0.28,\n            \"hp\": 150,\n            \"mp\": 80,\n            \"st\": 100,\n            \"speed\": 2.6,\n            \"shield\": 0,\n            \"mshield\": 0,\n            \"rage\": 0,\n            \"maskOn\": true,\n            \"_fused\": {},\n            \"_skProf\": {},\n            \"_fuseProfSec\": {},\n            \"_cardProf\": {},\n            \"_catProf\": {},\n            \"activeLMBSk\": \"kiSlash\",\n            \"activeChargeSk\": \"charge\",\n            \"activeBowSk\": \"normal\",\n            \"activeTechSk\": \"giantSlam\",\n            \"activeMagicSk\": \"fireball\",\n            \"activeRMBSk\": \"shieldBlock\",\n            \"activeQSk\": \"parry\",\n            \"activeCtSk\": \"ghostWalk\"\n          }\n        ],\n        [\n          \"potionSFX\"\n        ],\n        [\n          \"text\",\n          0,\n          -25,\n          \"👿 악의 추출: +100 HP\",\n          \"#33ff33\",\n          40\n        ]\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"policy\": \"candidate\",\n      \"invalid\": false,\n      \"rawSHA\": \"d301b25af29ddba505a9116513d6363d3c7478b48a332580bfa958eacf692234\",\n      \"loadedPotLevel\": 0,\n      \"before\": {\n        \"hp\": 150,\n        \"mats\": 50000,\n        \"cd\": 0\n      },\n      \"after\": {\n        \"hp\": 250,\n        \"mats\": 49999,\n        \"cd\": 420\n      },\n      \"trace\": [\n        [\n          \"mask\"\n        ],\n        [\n          \"slots\",\n          []\n        ],\n        [\n          \"repair\"\n        ],\n        [\n          \"wing\",\n          {\n            \"mhp\": 350,\n            \"mmp\": 80,\n            \"mst\": 100,\n            \"skills\": {\n              \"kiSlash\": 1,\n              \"spikeTrap\": 1,\n              \"holyDome\": 1,\n              \"giantSlam\": 1\n            },\n            \"x\": 0,\n            \"y\": 0,\n            \"lv\": 1,\n            \"exp\": 0,\n            \"maxExp\": 15,\n            \"_transLvDate\": null,\n            \"_transLvCount\": 0,\n            \"_apBossCleared\": [],\n            \"_goddessGift\": [],\n            \"sp\": 0,\n            \"ap\": 0,\n            \"baseAtk\": 8,\n            \"baseDef\": 2,\n            \"mpR\": 0,\n            \"stR\": 0.28,\n            \"hp\": 150,\n            \"mp\": 80,\n            \"st\": 100,\n            \"speed\": 2.6,\n            \"shield\": 0,\n            \"mshield\": 0,\n            \"rage\": 0,\n            \"maskOn\": true,\n            \"_fused\": {},\n            \"_skProf\": {},\n            \"_fuseProfSec\": {},\n            \"_cardProf\": {},\n            \"_catProf\": {},\n            \"activeLMBSk\": \"kiSlash\",\n            \"activeChargeSk\": \"charge\",\n            \"activeBowSk\": \"normal\",\n            \"activeTechSk\": \"giantSlam\",\n            \"activeMagicSk\": \"fireball\",\n            \"activeRMBSk\": \"shieldBlock\",\n            \"activeQSk\": \"parry\",\n            \"activeCtSk\": \"ghostWalk\"\n          }\n        ],\n        [\n          \"potionSFX\"\n        ],\n        [\n          \"text\",\n          0,\n          -25,\n          \"👿 악의 추출: +100 HP\",\n          \"#33ff33\",\n          40\n        ]\n      ]\n    }\n  ],\n  \"sourceRuns\": 8,\n  \"decision\": \"candidate prevents zero/nonfinite healing resource consumption; normal formula/amount/cooldown unchanged\",\n  \"docs\": {\n    \"query\": \"potLv|POT_LV|autoPotCd|_apHealAmt|potHeal|회복량\",\n    \"exitCode\": 0,\n    \"matches\": 34,\n    \"sha\": \"adde052ba1e6ee3daceb7553a86c2a14a3f3aded1f9d6cc604dfbd0732fea30b\"\n  },\n  \"limits\": [\n    \"Full dbRestore source with atlas/storage/skill helper stubs; actual save/API unverified\",\n    \"Actual auto-potion block dynamically extracted from updateP; full updateP/frame/native run not executed\",\n    \"No RNG use in fixture, source random stub throws; normal trace/cost/cooldown equal within this block\",\n    \"No repair of stored potLv, no caps/probability/rate/formula changes\",\n    \"DOM/audio/text effects stubbed; root integration/shared docs exact update needed\"\n  ],\n  \"productionApplied\": false,\n  \"newFiles\": 0\n}\n"
}
```

## 다음 인수 Gate

루트 후보 적용·공유 docs 동기화·native modifier 클릭/실저장·CH1-1 전투부터 재도전까지 시연 인수가 남는다. 파일 credit 소진은 source 작업 종료 조건이 아니다. 다음 승인 독립 자원 접점은 메모리에서 계속한다.


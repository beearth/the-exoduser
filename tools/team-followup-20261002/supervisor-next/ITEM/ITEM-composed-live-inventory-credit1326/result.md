# ITEM — 동일 가방 객체·패드·분해 선택 조합 후보

Completion ID: ITEM-composed-live-inventory-credit1326-20261002

제품 적용·native 인수 아님. 기존 완료 검사 재실행 0. 새 lease의 owned 2파일로 메모리 후보와 기존 원출력을 저장했다. goal의 실제 CH1-1 전체 시연은 미완료이며 root 통합·문서·실게임 검수 소유를 유지한다. 현재 goal blocked 상태의 저장 의존성은 이 인계로 해소되며 goal 재개는 클라이언트 제어 사항이다.

## 인수 결과

- 실제 rollDrop→mkItem→_wiPush→R pickup→render bag card→패드 이동/A선택/B장착/Y중요잠금까지 조합 소스 경로를 양판 필터·비필터에서 검증했다.
- 선택한 B의 인덱스는 A 장착 뒤 재연결되며 Y로 잠기면 분해 선택에서 제외된다. +3 이전 비용1500(10000→8500), 기존 결정1개 identity 보존, bag/equipped 분리 유지.
- 공통 fresh outline은 A/B/X/Y가 renderInv로 노드를 바꾼 경우에만 현재 카드에 기존2px/#C9A961/-1px/nearest를 복원한다. 제출된 과거 A1300 파일은 수정하지 않고, 그 모듈의 applyItemPadAOutlinePatch만 사용한다. A-only 복원 대신 공통 복원을 적용한다.
- source script12/importmap JSON2 구문 PASS. 실제 게임/브라우저/렌더 픽셀/포커스/오디오/DB 검수 없음.
- drag patch는 동일 후보에 조합되어 있으나 현재 타임라인에서 마우스 drag를 실행하지 않았다. 별도 drag4+sort2 원출력을 구분해 보존한다.

## docs 동기화 인수표

| id/변수 | 한글명 | 값/공식 | 슬롯·적용 위치 | 인수 상태 |
|---|---|---|---|---|
| inventoryBagIndex | 현재 가방 인덱스 | String(i), DOM 카드 dataset | renderInv inv-item / 기존 통합 KeyY | source 후보, 신규 save schema0 |
| _activeBagCard / _card | 표시 카드 identity | dataset===String(_gpInvIdx) | 패드 A·outline·B | source 후보 |
| _visibleBagIndices | 표시 가방 인덱스 | 정수·0≤idx<bagLen; 방향별 직전/직후 값 | _gpInvNav movement·X/Y | hidden 초기idx0+Down은 첫 표시1; no-input 자동 정규화0 |
| _freshBagCard | 변경 후 테두리 | current node≠old active node이면 기존2px 상아색 복원 | _gpInvNav bag 끝 | A/B/Y 현재 타임라인 PASS; X/eq 전환 native 미검증 |
| _salItems / _invSalSel | 장착 후 선택분해 identity | 선택 객체 포착→bag 제거→indexOf surviving object 재연결 | equipItem | mixed/selected-equipped/funds/level guard8 source PASS |
| renderInv selection prune | 중요잠금 분해 보호 | idx≥bag.length 또는 bag[idx]?.fav → 선택 제거 | 기존 유효선택 정리 | Ctrl선택→actual gpY→current 버튼 원문RED/후보GREEN |
| _invDrag.item / current | 드래그 수명 | mousedown item 포착; move/up indexOf(item), 없으면 이동0 | 인벤 drag event handlers | 장착 제거 후 다른 B 이동 방지, 정렬 후 같은 A 이동 |
| rollDrop/mkItem | 실제 일반 장비 생성 대조 | stage0/normal; RNG.22 controlled path46calls; rarity0/tier0/elF/reqLv0/socket1 | 기존 factory 전체 | 새 확률·밸런스·D13 공급/schema 변경0 |
| equip transfer/crystal | 강화·결정 보존 | +3 1500, crystal1 동일 객체 | 기존 whole equip/grid/cost | 기존 공식 그대로 |
| dbSave/dbRestore | 메모리 저장 범위 | 실제 inv식→JSON→bag/equipped/crystalBag3대입 | 메모리 전용 | object values 보존; JSON 이후 새로운 객체. 실제 DB/shared mats/whole restore 미검증 |

관련 docs: docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md, docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md, docs/7아이템디자인/ITEM_TEAM_MASTER.md, docs/15 세이브+데이터구조/15 세이브+데이터구조.md. 공용 docs 수정·제품 commit은 root 소유다. 이 표는 root가 code+docs 동시 반영할 정확 계약이며 본 역할은 공용 문서를 수정하지 않았다.

## 저장 후 docs 전체 검색 영수증

```json
{"command":["rg","-n","inventoryBagIndex|_gpInvNav|_invSalSel|_invDrag|outline|중요잠금|equipItem|rollDrop|mkItem","docs/"],"exit":0,"lines":310,"stdoutSHA256":"79447875b1ef2012448f09b187498cd0dd14f4b18d52fb3ffdf58cd18035be4d","moduleSHA256":"4848c03c751a775b868441b9d30b7461ae11f02fc6ad70c9782948ed44ffc788"}
```

## 인수 payload / 검증 범위

```json
{
  "completionId": "ITEM-composed-inventory-live-outline-memory-20261002-1321",
  "moduleKey": "item_composed_inventory_fresh_outline_module",
  "moduleDependency": {
    "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-pad-A-outline-lifetime-rolling1300/checks.mjs",
    "sha256": "c3225a479e658b9639c6c0a6e4e153e3339c1b62fb871f91020ae343b755ade4",
    "usedExport": "applyItemPadAOutlinePatch"
  },
  "evidence": {
    "task": "revised composed ITEM candidate: fresh live outline restored after A/B/Y frame, source only",
    "startedUTC": "2026-10-02T13:21:20.441Z",
    "endedUTC": "2026-10-02T13:21:20.926Z",
    "groups": [
      "game.html: composed candidates with fresh outline after A/B/Y actions: actual drop→Ctrl-select B→Down→A→B equip generated A→Y locks B and clears selection",
      "game.html: composed filtered/unfiltered core item/resource/selection equivalence",
      "game-easy-test.html: composed candidates with fresh outline after A/B/Y actions: actual drop→Ctrl-select B→Down→A→B equip generated A→Y locks B and clears selection",
      "game-easy-test.html: composed filtered/unfiltered core item/resource/selection equivalence"
    ],
    "rows": [
      {
        "file": "game.html",
        "mode": "filtered",
        "salvageOutcome": {
          "timeline": [
            {
              "button": 13,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 0,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": 3,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [],
              "equippedId": 12345.22,
              "mats": 8500
            }
          ],
          "selectionAfterLock": [],
          "locked": true,
          "hasGeneratedEquipped": true,
          "hasLockedB": true,
          "mats": 8500,
          "crystalIdentity": true
        }
      },
      {
        "file": "game.html",
        "mode": "unfiltered",
        "salvageOutcome": {
          "timeline": [
            {
              "button": 13,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 0,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": 3,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [],
              "equippedId": 12345.22,
              "mats": 8500
            }
          ],
          "selectionAfterLock": [],
          "locked": true,
          "hasGeneratedEquipped": true,
          "hasLockedB": true,
          "mats": 8500,
          "crystalIdentity": true
        }
      },
      {
        "file": "game-easy-test.html",
        "mode": "filtered",
        "salvageOutcome": {
          "timeline": [
            {
              "button": 13,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 0,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": 3,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [],
              "equippedId": 12345.22,
              "mats": 8500
            }
          ],
          "selectionAfterLock": [],
          "locked": true,
          "hasGeneratedEquipped": true,
          "hasLockedB": true,
          "mats": 8500,
          "crystalIdentity": true
        }
      },
      {
        "file": "game-easy-test.html",
        "mode": "unfiltered",
        "salvageOutcome": {
          "timeline": [
            {
              "button": 13,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 0,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                12345.22,
                "B"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                2
              ],
              "equippedId": "OLD",
              "mats": 10000
            },
            {
              "button": 1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": -1,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [
                1
              ],
              "equippedId": 12345.22,
              "mats": 8500
            },
            {
              "button": 3,
              "index": 1,
              "bag": [
                "X",
                "B",
                "OLD"
              ],
              "selected": 1,
              "outline": [
                "1"
              ],
              "salSelection": [],
              "equippedId": 12345.22,
              "mats": 8500
            }
          ],
          "selectionAfterLock": [],
          "locked": true,
          "hasGeneratedEquipped": true,
          "hasLockedB": true,
          "mats": 8500,
          "crystalIdentity": true
        }
      }
    ],
    "anchors": [
      {
        "file": "game.html",
        "label": "_gpInvNav",
        "line": 13653,
        "sha256": "4bfa67a41569c80d2881abdc6276193f509fb7c50989378d2926cae21402971c",
        "bytes": 9979
      },
      {
        "file": "game.html",
        "label": "equipItem",
        "line": 15577,
        "sha256": "32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6",
        "bytes": 3528
      },
      {
        "file": "game.html",
        "label": "actual selected-salvage render/button block",
        "line": 48778,
        "sha256": "3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72",
        "bytes": 1014
      },
      {
        "file": "game-easy-test.html",
        "label": "_gpInvNav",
        "line": 13050,
        "sha256": "cf33bcd8890a171d261086ae33cf40a823c5dac0105f2f70b340b4cf86db30c6",
        "bytes": 9954
      },
      {
        "file": "game-easy-test.html",
        "label": "equipItem",
        "line": 14685,
        "sha256": "494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179",
        "bytes": 3407
      },
      {
        "file": "game-easy-test.html",
        "label": "actual selected-salvage render/button block",
        "line": 47354,
        "sha256": "3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72",
        "bytes": 1014
      }
    ],
    "patches": [
      {
        "file": "game.html",
        "beforeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "afterSHA": "16715276040000819271f71ccd989f362fdf4920be6c3348674ad56f1d09f435",
        "replacements": "seven composed transforms; common fresh outline replaces A-only restoration"
      },
      {
        "file": "game-easy-test.html",
        "beforeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "afterSHA": "06542a56a8ff32fbdbd32e16627bbac946a7afeb4dd1b0778cb58f1313aedcd9",
        "replacements": "seven composed transforms; common fresh outline replaces A-only restoration"
      }
    ],
    "sourceEnd": [
      {
        "file": "game.html",
        "sha256": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613"
      },
      {
        "file": "game-easy-test.html",
        "sha256": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129"
      }
    ],
    "docsSearch": {
      "command": [
        "rg",
        "-n",
        "rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승",
        "docs/"
      ],
      "exit": 0,
      "lines": 126,
      "sha": "feed287eda4552e1ba16d37589d5bd0b72e9e774f8f2971f81db7574ab8dac1d"
    },
    "stubs": [
      "synthetic DOM/full focus layout not executed; _gpVCHide cursor hide observer",
      "gameConfirm resolved true only; actual confirm UI not executed",
      "audio/stats/save observers",
      "dropBonus1,random.22 ordinaryarmor actualfactory"
    ],
    "productionApplied": false,
    "runtimeAccepted": false,
    "newFiles": 0,
    "exit": 0
  },
  "syntax": {
    "task": "whole inline candidate syntax only; no test reruns/native/production",
    "startedUTC": "2026-10-02T13:21:39.817Z",
    "endedUTC": "2026-10-02T13:21:40.285Z",
    "syntax": [
      {
        "file": "game.html",
        "beforeSHA": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "candidateSHA": "16715276040000819271f71ccd989f362fdf4920be6c3348674ad56f1d09f435",
        "inlineScripts": 6,
        "importmaps": 1,
        "docs": {
          "lines": 184,
          "sha256": "e68d2ddbbbb11c616912c1f654d3d068eaf3ab19437a738a5f62f8afb9532d17"
        }
      },
      {
        "file": "game-easy-test.html",
        "beforeSHA": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "candidateSHA": "06542a56a8ff32fbdbd32e16627bbac946a7afeb4dd1b0778cb58f1313aedcd9",
        "inlineScripts": 6,
        "importmaps": 1,
        "docs": {
          "lines": 184,
          "sha256": "cbb231d78e76be0b109b0da431ee38c505bb71e9a60cf2e7b8a0273812c5ca9d"
        }
      }
    ],
    "newFiles": 0,
    "exit": 0
  },
  "receipt": {
    "chunk_id": "69ccc4",
    "wall_time_seconds": 0.000006833,
    "exit_code": 0,
    "original_token_count": 102,
    "output": "{\"module\":{\"bytes\":4768,\"sha256\":\"e4a6fdcc0f8763b0ee008ca99c5274fabc56fc6ba350501f9e86fd4e20f376e0\"},\"script\":{\"bytes\":19604,\"sha256\":\"7620c0d800fbd8362946e7d1f25018b00d3ba0c12dfddbf69cac95b5c0bd441e\"},\"stdout\":{\"bytes\":7383,\"sha256\":\"59e864bcad305351ff300f2de9699782d59ce4ed16e5c02fd220c632f7079693\"},\"syntaxStdout\":{\"bytes\":825,\"sha256\":\"166eace56a42543c5f9353e1510c7f71b447e24126079b3ab3deb9524964bd69\"}}\n"
  },
  "production": false,
  "native": false,
  "newFiles": 0,
  "capacityObserved": {
    "ITEM": 0,
    "changes97": true,
    "allowNewOwnedFiles": false
  },
  "supersedes": "in-memory composition1320 whose post-B/Y outline empty; standalone A1300 artifacts immutable",
  "preservedOldEvidence": [
    "item_composed_inventory_handoff",
    "item_live_sal_selection_handoff",
    "item_fav_sal_prune_handoff",
    "item_generated_loot_current_handoff",
    "item_inventory_goal_next_memory_submission",
    "item_pad_bridge_submission"
  ],
  "docsRows": [
    {
      "id": "pad current bag identity",
      "location": "_gpInvNav",
      "value": "dataset.inventoryBagIndex exact match for A/outline/B;visible bag indices for directional move/X/Y guards; no compaction ordinal usage"
    },
    {
      "id": "fresh outline",
      "location": "bag branch after A/B/X/Y before eq branch",
      "value": "if current target node differs from _activeBagCard set existing2px/#C9A961/-1px/nearest",
      "formula": "refresh only rebuilt live target; replacing A-only postrender restore"
    },
    {
      "id": "sal selection after equip",
      "location": "equipItem",
      "value": "snapshot selected object references→bag mutation→rebase survivingobjects;equipped selected removed;funds/lvfailed selection preserved"
    },
    {
      "id": "sal selection lock",
      "location": "renderInv pruning",
      "value": "invalid idx or item.fav cleared; normal salvage numbers unchanged"
    },
    {
      "id": "drag lifetime",
      "location": "card mousedown/move/up",
      "value": "capture item identity, resolve current index after mutation;composed here but mouse drag not executed in currenttimeline; prior4+sort2 evidence separate"
    },
    {
      "id": "integrated source evidence",
      "value": "both HTML filtered andunfiltered ordinary actualfactory→pickup→CtrlB→Down→Aselection→BequipA→YlockB;fresh outline each actionframe and1500/crystal1 invariant"
    },
    {
      "id": "syntax",
      "value": "12inline scripts+2importmap JSON parsed;memory candidate only"
    },
    {
      "id": "remaining",
      "value": "root sourceintegration/docscommit/real six-step demo unverified; no completion claim"
    }
  ],
  "goalActive": true,
  "lease": {
    "epoch": "rolling-after-0d918990-1326",
    "role": "ITEM",
    "noteSHA": "f7753cbe30f64901213f7982674d76edf1100a2dc0abdbe7b61cca7ac0da9b87",
    "credits": 2,
    "noteReadChunk": "cdb3e9",
    "SHAChunk": "ca1a8e"
  },
  "physicalCompletionId": "ITEM-composed-live-inventory-credit1326-20261002"
}
```

## 원문 오류·대역·메타데이터 정정

원문 출력은 수정을 가하지 않고 보존한다. 일부 이전 harness 메타데이터에는 실행하지 않은 padB 등의 inherited actual 목록, 실제 rg argv와 다른 command 표시, patch replacements2 표기가 남았다. 실제 script/실행 argv를 우선하며 favorite prune 교체1, composed transform7이 정확하다. 반환에 Warning: truncated가 있는 출력은 tool 반환 그대로이며 원본 stdout 전체의 SHA를 주장하지 않는다. factory4의 첫 도구 출력은 잘렸으므로 여기에서는 완전 보존된 별도 실제 생성→JSON2의 원출력을 주 근거로 삼는다. 정상 결과를 얻은 변경 전 테스트는 저장하면서 재실행하지 않았다.

```json
{
  "selection": [
    {
      "script": "import fs from 'node:fs';\nimport crypto from 'node:crypto';\nimport vm from 'node:vm';\nimport assert from 'node:assert/strict';\nimport {parseExpressionAt} from 'acorn';\nimport {spawnSync} from 'node:child_process';\n\nconst root='/Users/fordeargamers/Projects/exoduser-migration-20261001';\nassert.equal(fs.realpathSync(process.cwd()),root);\nconst startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');\nconst anchors=[],rows=[],groups=[],patches=[];\nfunction once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}\nexport function applyItemDragIdentityPatch(source){\n source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');\n source=once(source,\"  _invDragMoved=true;\\n  const grid=$('invGrid');if(!grid)return;\",\"  _invDragMoved=true;\\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\\n  const grid=$('invGrid');if(!grid)return;\");\n source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');\n return once(source,\"  if(_invCanPlace(d.idx,gx,gy)){\\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\\n  }\",\"  const current=INV.bag.indexOf(d.item);\\n  if(current>=0&&_invCanPlace(current,gx,gy)){\\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\\n  }\");\n}\nexport function applyEquipSalSelectionIdentityPatch(source){\n const start=source.indexOf('function equipItem(');assert(start>=0);\n const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;\n let body=source.slice(start,end);\n body=once(body,'  const equipSlot=_earringSlot','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\\n  const equipSlot=_earringSlot');\n body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');\n return source.slice(0,start)+body+source.slice(end);\n}\nfunction ref(file,label,source,start,end){\n const text=source.slice(start,end);assert(start>=0&&end>start,label);\n anchors.push({file,label,line:source.slice(0,start).split('\\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});\n return text;\n}\nfunction fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}\nfunction con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}\nclass Node {\n constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}\n appendChild(n){n.parentElement=this;this.children.push(n);return n;}\n replaceChildren(){this.children=[];}\n remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}\n getBoundingClientRect(){return {left:0,top:0};}\n scrollIntoView(){}\n querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}\n dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}\n}\nclass MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}\nconst sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));\nfor(const {file,text:source} of sources){\n const patched=applyEquipSalSelectionIdentityPatch(source);\n patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});\n function build(s,record){\n  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();\n  const funcs=['salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\\n');\n  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\\n');\n  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\\n');\n  const bi=s.indexOf('  // 필터 적용\\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);\n  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);\n  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);\n  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);\n  const pruning=\"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}\";\n  assert(s.includes(pruning));\n  const ki=s.indexOf(\"  if($('invPanel').classList.contains('on')){\",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);\n  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);\n  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');\n  const moveStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mousemove'\",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;\n  const upStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mouseup'\",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;\n  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);\n\n  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);\n  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);\n  return 'const _BIC=false;const location={search:\"?demo\"};\\n'+cs+'\\n'+funcs+'\\n'+ear+'\\nlet _invHover=-1;function renderInv(){const grid=$(\\'invGrid\\');grid.replaceChildren();const _GC=48;\\n'+pruning+'\\n'+bag+'\\n'+salvage+'\\n}\\nfunction inventoryKey(e){'+key+'}\\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\\nfunction rPickup(){const chestOpened=false;\\n'+pick+'\\n}\\n';\n }\n const originalProgram=build(source,true),candidateProgram=build(patched,false);\n async function run(mode,usePatch){\n  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');\n  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};\n  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};\n  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};\n  let A;\n  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};\n  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};\n  const observer=n=>()=>{trace[n]++;events.push(n);};\n  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};\n  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,\n   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,\n   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},\n   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],\n   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,\n   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),\n   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});\n  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);\n  vm.runInContext(usePatch?candidateProgram:originalProgram,c);\n  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};\n  pushPickup(X);\n  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);\n  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;\n  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);\n  const factorySnapshot=JSON.parse(JSON.stringify(A));\n  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));\n  pushPickup(B);\n  if(mode==='shift')c.invFilter.slot='armor';\n  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));\n  vm.runInContext('renderInv()',c);\n  const bCard=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex==='2');\n  bCard.onclick({ctrlKey:true});\n  assert(c._invSalSel.has(2));\n  let cards=grid.querySelectorAll('.inv-item');\n  const chosen=cards.find(card=>card.dataset.inventoryBagIndex==='1');\n  assert(chosen);\n  const hover=chosen.onmouseenter||chosen.onmouseover;hover();\n  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};\n  if(mode==='shift')vm.runInContext('inventoryKey({code:\"KeyY\",preventDefault(){}})',c);\n  const selectedBeforeSalvage=[...c._invSalSel].map(i=>c.INV.bag[i]?.id),matsBeforeSalvage=c.G.mats;\n  await salvageBtn.onclick();\n  const salvageOutcome={selectedBeforeSalvage,bag:c.INV.bag.map(it=>it.id),matsDelta:c.G.mats-matsBeforeSalvage,hasB:c.INV.bag.includes(B),hasOld:c.INV.bag.includes(old),equippedId:c.INV.equipped.armor?.id};\n  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};\n  const equipped=c.INV.equipped.armor;\n  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,\n   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,\n   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,\n   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};\n  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};\n  rows.push(row);return row;\n }\n const red=await run('shift',false),green=await run('shift',true);\n assert.deepEqual(red.salvageOutcome.selectedBeforeSalvage,['OLD']);assert.equal(red.salvageOutcome.hasB,true);assert.equal(red.salvageOutcome.hasOld,false);\n assert.deepEqual(green.salvageOutcome.selectedBeforeSalvage,['B']);assert.equal(green.salvageOutcome.hasB,false);assert.equal(green.salvageOutcome.hasOld,true);\n assert.equal(green.salvageOutcome.matsDelta,1000);\n groups.push(file+': live B ctrl-select→current A KeyY equip→new current salvage button; original loses OLD, candidate preserves B identity');\n const normal=await run('normal',false),normalCandidate=await run('normal',true);\n assert.deepEqual(normal.salvageOutcome,normalCandidate.salvageOutcome);assert.equal(normal.salvageOutcome.hasB,false);\n groups.push(file+': no equip mutation selected B salvage normal equivalence');\n\n}\nfunction crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}\nconst docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});\nassert.equal(docs.status,0);\nconst evidence={task:'live selected salvage identity after equip array shift, no detached old callback',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,\n sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,stdoutSHA256:sha(docs.stdout)},\n actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],\n stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],\n priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};\nconsole.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,patched:r.patched,salvageOutcome:r.salvageOutcome,after:r.after})),anchors:anchors.filter(a=>/equipItem|salvageVal|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));\n",
      "exec": {
        "chunk_id": "45f000",
        "wall_time_seconds": 0.174416917,
        "exit_code": 1,
        "original_token_count": 146,
        "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: unique patch anchor\n\n1 !== 2\n\n    at once (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:12:29)\n    at applyEquipSalSelectionIdentityPatch (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:23:7)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:47:16 {\n  generatedMessage: false,\n  code: 'ERR_ASSERTION',\n  actual: 1,\n  expected: 2,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
      },
      "reason": "main/easy equipSlot resolver source differs; main-specific anchor missing in easy; no successful complete report"
    },
    {
      "script": "import fs from 'node:fs';\nimport crypto from 'node:crypto';\nimport vm from 'node:vm';\nimport assert from 'node:assert/strict';\nimport {parseExpressionAt} from 'acorn';\nimport {spawnSync} from 'node:child_process';\n\nconst root='/Users/fordeargamers/Projects/exoduser-migration-20261001';\nassert.equal(fs.realpathSync(process.cwd()),root);\nconst startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');\nconst anchors=[],rows=[],groups=[],patches=[];\nfunction once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}\nexport function applyItemDragIdentityPatch(source){\n source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');\n source=once(source,\"  _invDragMoved=true;\\n  const grid=$('invGrid');if(!grid)return;\",\"  _invDragMoved=true;\\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\\n  const grid=$('invGrid');if(!grid)return;\");\n source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');\n return once(source,\"  if(_invCanPlace(d.idx,gx,gy)){\\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\\n  }\",\"  const current=INV.bag.indexOf(d.item);\\n  if(current>=0&&_invCanPlace(current,gx,gy)){\\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\\n  }\");\n}\nexport function applyEquipSalSelectionIdentityPatch(source){\n const start=source.indexOf('function equipItem(');assert(start>=0);\n const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;\n let body=source.slice(start,end);\n body=once(body,'  const old=INV.equipped[equipSlot];','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\\n  const old=INV.equipped[equipSlot];');\n body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');\n return source.slice(0,start)+body+source.slice(end);\n}\nfunction ref(file,label,source,start,end){\n const text=source.slice(start,end);assert(start>=0&&end>start,label);\n anchors.push({file,label,line:source.slice(0,start).split('\\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});\n return text;\n}\nfunction fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}\nfunction con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}\nclass Node {\n constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}\n appendChild(n){n.parentElement=this;this.children.push(n);return n;}\n replaceChildren(){this.children=[];}\n remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}\n getBoundingClientRect(){return {left:0,top:0};}\n scrollIntoView(){}\n querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}\n dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}\n}\nclass MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}\nconst sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));\nfor(const {file,text:source} of sources){\n const patched=applyEquipSalSelectionIdentityPatch(source);\n patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});\n function build(s,record){\n  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();\n  const funcs=['salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\\n');\n  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\\n');\n  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\\n');\n  const bi=s.indexOf('  // 필터 적용\\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);\n  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);\n  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);\n  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);\n  const pruning=\"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}\";\n  assert(s.includes(pruning));\n  const ki=s.indexOf(\"  if($('invPanel').classList.contains('on')){\",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);\n  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);\n  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');\n  const moveStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mousemove'\",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;\n  const upStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mouseup'\",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;\n  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);\n\n  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);\n  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);\n  return 'const _BIC=false;const location={search:\"?demo\"};\\n'+cs+'\\n'+funcs+'\\n'+ear+'\\nlet _invHover=-1;function renderInv(){const grid=$(\\'invGrid\\');grid.replaceChildren();const _GC=48;\\n'+pruning+'\\n'+bag+'\\n'+salvage+'\\n}\\nfunction inventoryKey(e){'+key+'}\\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\\nfunction rPickup(){const chestOpened=false;\\n'+pick+'\\n}\\n';\n }\n const originalProgram=build(source,true),candidateProgram=build(patched,false);\n async function run(mode,usePatch){\n  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');\n  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};\n  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};\n  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};\n  let A;\n  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};\n  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};\n  const observer=n=>()=>{trace[n]++;events.push(n);};\n  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};\n  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,\n   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,\n   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},\n   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],\n   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,\n   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),\n   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});\n  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);\n  vm.runInContext(usePatch?candidateProgram:originalProgram,c);\n  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};\n  pushPickup(X);\n  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);\n  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;\n  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);\n  const factorySnapshot=JSON.parse(JSON.stringify(A));\n  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));\n  pushPickup(B);\n  if(mode==='shift')c.invFilter.slot='armor';\n  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));\n  vm.runInContext('renderInv()',c);\n  const bCard=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex==='2');\n  bCard.onclick({ctrlKey:true});\n  assert(c._invSalSel.has(2));\n  let cards=grid.querySelectorAll('.inv-item');\n  const chosen=cards.find(card=>card.dataset.inventoryBagIndex==='1');\n  assert(chosen);\n  const hover=chosen.onmouseenter||chosen.onmouseover;hover();\n  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};\n  if(mode==='shift')vm.runInContext('inventoryKey({code:\"KeyY\",preventDefault(){}})',c);\n  const selectedBeforeSalvage=[...c._invSalSel].map(i=>c.INV.bag[i]?.id),matsBeforeSalvage=c.G.mats;\n  await salvageBtn.onclick();\n  const salvageOutcome={selectedBeforeSalvage,bag:c.INV.bag.map(it=>it.id),matsDelta:c.G.mats-matsBeforeSalvage,hasB:c.INV.bag.includes(B),hasOld:c.INV.bag.includes(old),equippedId:c.INV.equipped.armor?.id};\n  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};\n  const equipped=c.INV.equipped.armor;\n  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,\n   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,\n   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,\n   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};\n  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};\n  rows.push(row);return row;\n }\n const red=await run('shift',false),green=await run('shift',true);\n assert.deepEqual(red.salvageOutcome.selectedBeforeSalvage,['OLD']);assert.equal(red.salvageOutcome.hasB,true);assert.equal(red.salvageOutcome.hasOld,false);\n assert.deepEqual(green.salvageOutcome.selectedBeforeSalvage,['B']);assert.equal(green.salvageOutcome.hasB,false);assert.equal(green.salvageOutcome.hasOld,true);\n assert.equal(green.salvageOutcome.matsDelta,1000);\n groups.push(file+': live B ctrl-select→current A KeyY equip→new current salvage button; original loses OLD, candidate preserves B identity');\n const normal=await run('normal',false),normalCandidate=await run('normal',true);\n assert.deepEqual(normal.salvageOutcome,normalCandidate.salvageOutcome);assert.equal(normal.salvageOutcome.hasB,false);\n groups.push(file+': no equip mutation selected B salvage normal equivalence');\n\n}\nfunction crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}\nconst docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});\nassert.equal(docs.status,0);\nconst evidence={task:'live selected salvage identity after equip array shift, no detached old callback',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,\n sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,stdoutSHA256:sha(docs.stdout)},\n actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],\n stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],\n priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};\nconsole.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,patched:r.patched,salvageOutcome:r.salvageOutcome,after:r.after})),anchors:anchors.filter(a=>/equipItem|salvageVal|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));\n",
      "exec": {
        "chunk_id": "10aec5",
        "wall_time_seconds": 0.134083334,
        "exit_code": 1,
        "original_token_count": 146,
        "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: unique patch anchor\n\n1 !== 2\n\n    at once (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:12:29)\n    at applyEquipSalSelectionIdentityPatch (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:23:7)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:47:16 {\n  generatedMessage: false,\n  code: 'ERR_ASSERTION',\n  actual: 1,\n  expected: 2,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
      },
      "reason": "easy reads equipped[item.slot]; common old declaration prefix required"
    }
  ],
  "serialization": [
    {
      "script": "import fs from 'node:fs';\nimport crypto from 'node:crypto';\nimport vm from 'node:vm';\nimport assert from 'node:assert/strict';\nimport {parseExpressionAt} from 'acorn';\nimport {spawnSync} from 'node:child_process';\n\nconst root='/Users/fordeargamers/Projects/exoduser-migration-20261001';\nassert.equal(fs.realpathSync(process.cwd()),root);\nconst startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');\nconst anchors=[],rows=[],groups=[],patches=[];\nfunction once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}\nexport function applyItemDragIdentityPatch(source){\n source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');\n source=once(source,\"  _invDragMoved=true;\\n  const grid=$('invGrid');if(!grid)return;\",\"  _invDragMoved=true;\\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\\n  const grid=$('invGrid');if(!grid)return;\");\n source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');\n return once(source,\"  if(_invCanPlace(d.idx,gx,gy)){\\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\\n  }\",\"  const current=INV.bag.indexOf(d.item);\\n  if(current>=0&&_invCanPlace(current,gx,gy)){\\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\\n  }\");\n}\nfunction ref(file,label,source,start,end){\n const text=source.slice(start,end);assert(start>=0&&end>start,label);\n anchors.push({file,label,line:source.slice(0,start).split('\\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});\n return text;\n}\nfunction fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}\nfunction con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}\nclass Node {\n constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}\n appendChild(n){n.parentElement=this;this.children.push(n);return n;}\n replaceChildren(){this.children=[];}\n remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}\n getBoundingClientRect(){return {left:0,top:0};}\n scrollIntoView(){}\n querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}\n dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}\n}\nclass MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}\nconst sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));\nfor(const {file,text:source} of sources){\n const patched=source;\n patches.push({file,beforeSHA:sha(source),afterSHA:sha(source),replacements:0});\n const saveAt=source.indexOf('inv:{bag:INV.bag',source.indexOf('async function dbSave(')),saveBegin=saveAt+4;\n const invExpression=ref(file,'actual dbSave inv expression',source,saveBegin,parseExpressionAt(source,saveBegin,{ecmaVersion:'latest'}).end);\n const restoreAt=source.indexOf('function dbRestore(');\n const restoreNames=['INV.bag=','INV.equipped=','CRYSTAL_BAG='];\n const restoreStatements=restoreNames.map(n=>{const start=source.indexOf(n,restoreAt);assert(start>=0);return ref(file,'actual dbRestore '+n,source,start,source.indexOf(';',start)+1);}).join('\\n');\n function build(s,record){\n  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();\n  const funcs=['mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\\n');\n  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\\n');\n  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\\n');\n  const bi=s.indexOf('  // 필터 적용\\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);\n  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);\n  const ki=s.indexOf(\"  if($('invPanel').classList.contains('on')){\",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);\n  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);\n  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');\n  const moveStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mousemove'\",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;\n  const upStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mouseup'\",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;\n  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);\n\n  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);\n  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);\n  return 'const _BIC=false;const location={search:\"?demo\"};\\n'+cs+'\\n'+funcs+'\\n'+ear+'\\nlet _invHover=-1;function renderInv(){const grid=$(\\'invGrid\\');grid.replaceChildren();const _GC=48;\\n'+bag+'\\n}\\nfunction inventoryKey(e){'+key+'}\\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\\nfunction rPickup(){const chestOpened=false;\\n'+pick+'\\n}\\n';\n }\n const originalProgram=build(source,true),candidateProgram=build(patched,false);\n function run(mode,usePatch){\n  const grid=new Node(),panel=new Node();grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');\n  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};\n  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};\n  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};\n  let A;\n  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};\n  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};\n  const observer=n=>()=>{trace[n]++;events.push(n);};\n  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};\n  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,\n   statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,\n   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},\n   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],\n   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,\n   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),\n   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});\n  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);\n  vm.runInContext(usePatch?candidateProgram:originalProgram,c);\n  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};\n  pushPickup(X);\n  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);\n  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;\n  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);\n  const factorySnapshot=JSON.parse(JSON.stringify(A));\n  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));\n  pushPickup(B);\n  if(mode==='filtered')c.invFilter.slot='armor';\n  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));\n  vm.runInContext('renderInv()',c);\n  let cards=grid.querySelectorAll('.inv-item');\n  const chosen=cards.find(card=>card.dataset.inventoryBagIndex==='1');\n  assert(chosen);\n  const hover=chosen.onmouseenter||chosen.onmouseover;hover();\n  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};\n  vm.runInContext('inventoryKey({code:\"KeyY\",preventDefault(){}})',c);\n  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};\n  const equipped=c.INV.equipped.armor;\n  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,\n   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,\n   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,\n   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};\n  assert.equal(equipped,A);assert(!c.INV.bag.includes(A));assert.equal(A.crystals[0],crystal);assert.equal(c.G.mats,8500);assert.equal(A.enh,3);assert.equal(trace.dropSfx,1);assert.equal(c.CRYSTAL_BAG.length,0);c.CRYSTAL_BAG.push({id:crystal.id,star:1,enh:0});\n  c.invExpression=invExpression;\n  const savedInv=vm.runInContext('('+invExpression+')',c);\n  const blob=JSON.stringify({inv:savedInv,crystalBag:c.CRYSTAL_BAG});\n  const originalEquipped=equipped,originalBag=c.INV.bag,originalCrystal=A.crystals[0];\n  c.d=JSON.parse(blob);c.INV.bag=[];c.INV.equipped={};c.CRYSTAL_BAG=[];\n  vm.runInContext(restoreStatements,c);\n  const restored=c.INV.equipped.armor;\n  assert.notEqual(restored,originalEquipped);assert.notEqual(c.INV.bag,originalBag);assert.notEqual(restored.crystals[0],originalCrystal);\n  assert.deepEqual(JSON.parse(JSON.stringify(restored)),JSON.parse(JSON.stringify(originalEquipped)));\n  assert.equal(restored.id,A.id);assert.equal(restored.enh,3);assert.equal(c.INV.bag.filter(i=>i.id===A.id).length,0);\n  assert.equal(restored.crystals.filter(Boolean).length+c.CRYSTAL_BAG.length,2);\n  const restoreSummary={bag:c.INV.bag.map(it=>it.id),equippedId:restored.id,enh:restored.enh,crystals:restored.crystals,crystalBag:c.CRYSTAL_BAG,totalCrystalObjects:2,newObjectAfterJSON:restored!==originalEquipped,savedBytes:Buffer.byteLength(blob)};\n  const row={restoreSummary,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};\n  rows.push(row);return row;\n }\n const restored=run('filtered',false);\n groups.push(file+': actual generated item→filtered KeyY equip→dbSave inv expression→memory JSON→dbRestore inventory+crystal statements preserves fields; not DB/whole restore');\n\n}\nfunction crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}\nconst docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});\nassert.equal(docs.status,0);\nconst evidence={task:'fresh ordinary factory→current KeyY→actual inventory save/restore slices; independent memory JSON bridge',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,\n sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,stdoutSHA256:sha(docs.stdout)},\n actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],\n stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],\n priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};\nconsole.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,factorySnapshot:r.factorySnapshot,generatedEquippedIdentity:r.generatedEquippedIdentity,after:r.after,restoreSummary:r.restoreSummary,rngCalls:r.trace.rng})),anchors:anchors.filter(a=>/dbSave|dbRestore|mkItem|rollDrop|KeyY/.test(a.label)),sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,stdoutSHA256:sha(docs.stdout)},limits:['synthetic DOM/events/stat/audio/save observers','whole dbSave/dbRestore/DB not executed; only actual inv expression and3restore statements+memory JSON','shared mats persistence not executed','battle/death/revive not executed'],newFiles:0,productionApplied:false,runtimeAccepted:false,exit:0}));\n",
      "exec": {
        "chunk_id": "ed0ff1",
        "wall_time_seconds": 0.109272042,
        "exit_code": 1,
        "original_token_count": 174,
        "output": "evalmachine.<anonymous>:2\n      stats)\n      ^\n\nReferenceError: stats is not defined\n    at evalmachine.<anonymous>:2:7\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:109:21)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:123:17\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\n\nNode.js v24.15.0\n"
      },
      "reason": "parseExpressionAt consumed following comma and stats identifier as SequenceExpression; setup extraction bug, not product defect"
    }
  ],
  "composition": [
    {
      "script": "import {applyItemPadASelectionPatch} from './tools/team-followup-20261002/supervisor-next/ITEM/ITEM-pad-A-outline-lifetime-rolling1300/checks.mjs';\nimport fs from 'node:fs';\nimport crypto from 'node:crypto';\nimport vm from 'node:vm';\nimport assert from 'node:assert/strict';\nimport {parseExpressionAt} from 'acorn';\nimport {spawnSync} from 'node:child_process';\n\nconst root='/Users/fordeargamers/Projects/exoduser-migration-20261001';\nassert.equal(fs.realpathSync(process.cwd()),root);\nconst startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');\nconst anchors=[],rows=[],groups=[],patches=[];\nfunction once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}\nexport function applyItemDragIdentityPatch(source){\n source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');\n source=once(source,\"  _invDragMoved=true;\\n  const grid=$('invGrid');if(!grid)return;\",\"  _invDragMoved=true;\\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\\n  const grid=$('invGrid');if(!grid)return;\");\n source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');\n return once(source,\"  if(_invCanPlace(d.idx,gx,gy)){\\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\\n  }\",\"  const current=INV.bag.indexOf(d.item);\\n  if(current>=0&&_invCanPlace(current,gx,gy)){\\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\\n  }\");\n}\nexport function applyEquipSalSelectionIdentityPatch(source){\n const start=source.indexOf('function equipItem(');assert(start>=0);\n const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;\n let body=source.slice(start,end);\n body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\\n  const old=INV.equipped[');\n body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');\n return source.slice(0,start)+body+source.slice(end);\n}\nexport function applyFavSelectionPrunePatch(source){\n return once(source,'for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}','for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}');\n}\nexport function applyItemPadBIdentityPatch(source){\n const card=\"const div=document.createElement('div');div.className='inv-item';\";\n if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+\"\\n    div.dataset.inventoryBagIndex=String(i);\");\n return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent(\"contextmenu\",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent(\"contextmenu\",{bubbles:true,cancelable:true}))');\n}\n\nfunction applyVisibleNav(source){\n const nav=source.indexOf('function _gpInvNav('),i=source.indexOf(\"    const bagLen=typeof INV!=='undefined'?INV.bag.length:0;\",nav),end=source.indexOf('    _clr();',i);\n assert(i>=0&&end>i);\n let old=source.slice(i,end);\n const marker=\"const bagLen=typeof INV!=='undefined'?INV.bag.length:0;\";\n const next=once(old,marker,marker+\"\\n    const _visibleBagIndices=[...($('invGrid')?.querySelectorAll('.inv-item')||[])].map(card=>Number(card.dataset.inventoryBagIndex)).filter(idx=>Number.isInteger(idx)&&idx>=0&&idx<bagLen);\")\n .replace('if(!bagLen){','if(!_visibleBagIndices.length){')\n .replaceAll('_gpInvIdx=Math.max(0,_gpInvIdx-1)','_gpInvIdx=_visibleBagIndices.filter(idx=>idx<_gpInvIdx).at(-1)??_visibleBagIndices[0]')\n .replaceAll('_gpInvIdx=Math.min(bagLen-1,_gpInvIdx+1)','_gpInvIdx=_visibleBagIndices.find(idx=>idx>_gpInvIdx)??_visibleBagIndices.at(-1)');\n const move=source.slice(0,i)+next+source.slice(end);\n return once(once(move,'if(x&&!_gpUIPrev.x&&_gpInvIdx<bagLen)','if(x&&!_gpUIPrev.x&&_visibleBagIndices.includes(_gpInvIdx))'),'if(y&&!_gpUIPrev.y&&_gpInvIdx<bagLen)','if(y&&!_gpUIPrev.y&&_visibleBagIndices.includes(_gpInvIdx))');\n}\nfunction compose(source){\n for(const apply of [applyItemPadASelectionPatch,applyItemPadBIdentityPatch,applyVisibleNav,applyItemDragIdentityPatch,applyEquipSalSelectionIdentityPatch,applyFavSelectionPrunePatch])source=apply(source);\n return source;\n}\nfunction ref(file,label,source,start,end){\n const text=source.slice(start,end);assert(start>=0&&end>start,label);\n anchors.push({file,label,line:source.slice(0,start).split('\\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});\n return text;\n}\nfunction fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}\nfunction con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}\nclass Node {\n constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}\n appendChild(n){n.parentElement=this;this.children.push(n);return n;}\n replaceChildren(){this.children=[];}\n remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}\n getBoundingClientRect(){return {left:0,top:0};}\n scrollIntoView(){}\n querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}\n dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}\n}\nclass MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}\nconst sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));\nfor(const {file,text:source} of sources){\n const patched=compose(source);\n patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:'six composed transforms'});\n function build(s,record){\n  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();\n  const funcs=['_gpInvNav','salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\\n');\n  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\\n');\n  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\\n');\n  const bi=s.indexOf('  // 필터 적용\\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);\n  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);\n  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);\n  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);\n  const pruning=s.includes(\"if(idx>=INV.bag.length||INV.bag[idx]?.fav)\")?\"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}\":\"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}\";\n  assert(s.includes(pruning));\n  const ki=s.indexOf(\"  if($('invPanel').classList.contains('on')){\",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);\n  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);\n  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');\n  const moveStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mousemove'\",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;\n  const upStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mouseup'\",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;\n  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);\n\n  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);\n  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);\n  return 'const _BIC=false;const location={search:\"?demo\"};\\n'+cs+'\\n'+funcs+'\\n'+ear+'\\nlet _invHover=-1;function renderInv(){const grid=$(\\'invGrid\\');grid.replaceChildren();const _GC=48;\\n'+pruning+'\\n'+bag+'\\n'+salvage+'\\n}\\nfunction inventoryKey(e){'+key+'}\\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\\nfunction rPickup(){const chestOpened=false;\\n'+pick+'\\n}\\n';\n }\n const originalProgram=build(source,true),candidateProgram=build(patched,false);\n async function run(mode,usePatch){\n  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');\n  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};\n  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};\n  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};\n  let A;\n  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};\n  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};\n  const observer=n=>()=>{trace[n]++;events.push(n);};\n  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};\n  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:mode==='lock'&&i===3,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,\n   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,\n   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},\n   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],\n   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,\n   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),\n   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});\n  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);\n  vm.runInContext(usePatch?candidateProgram:originalProgram,c);\n  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};\n  pushPickup(X);\n  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);\n  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;\n  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);\n  const factorySnapshot=JSON.parse(JSON.stringify(A));\n  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));\n  pushPickup(B);\n  c.invFilter.slot=mode==='filtered'?'armor':null;\n  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));\n  vm.runInContext('renderInv()',c);\n  const bCard=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex==='2');\n  bCard.onclick({ctrlKey:true});assert(c._invSalSel.has(2));\n  const timeline=[];\n  const frame=button=>{\n   c._gpad.buttons.forEach((b,i)=>{b.pressed=i===button;b.value=0;});\n   vm.runInContext('_gpInvNav()',c);\n   timeline.push({button,index:c._gpInvIdx,bag:c.INV.bag.map(it=>it.id),selected:c.INV.selected,outline:grid.querySelectorAll('.inv-item').filter(n=>n.style.outline==='2px solid #C9A961').map(n=>n.dataset.inventoryBagIndex),salSelection:[...c._invSalSel],equippedId:c.INV.equipped.armor?.id,mats:c.G.mats});\n  };\n  c._gpInvIdx=0;frame(13);assert.equal(c._gpInvIdx,1);frame(-1);frame(0);\n  assert.equal(c.INV.selected,1);assert.deepEqual(timeline.at(-1).outline,['1']);\n  frame(-1);frame(1);\n  assert.equal(c.INV.equipped.armor,A);assert.deepEqual([...c._invSalSel],[1]);assert.equal(c.INV.bag[1],B);\n  frame(-1);frame(3);\n  assert.equal(B.fav,true);assert.deepEqual([...c._invSalSel],[]);assert.equal(salvageBtn.style.display,'none');\n  const before={bag:['X',A.id,'B']},beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};\n  const salvageOutcome={timeline,selectionAfterLock:[...c._invSalSel],locked:!!B.fav,hasGeneratedEquipped:c.INV.equipped.armor===A,hasLockedB:c.INV.bag.includes(B),mats:c.G.mats,crystalIdentity:A.crystals[0]===crystal};\n  const equipped=c.INV.equipped.armor;\n  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,\n   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,\n   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,\n   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};\n  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};\n  rows.push(row);return row;\n }\n const filtered=await run('filtered',true),normal=await run('unfiltered',true);\n assert.equal(filtered.salvageOutcome.mats,8500);assert.equal(filtered.salvageOutcome.crystalIdentity,true);\n const core=r=>({mats:r.salvageOutcome.mats,bag:r.after.bag,eq:r.after.equipped,sal:r.salvageOutcome.selectionAfterLock,hasB:r.salvageOutcome.hasLockedB,crystal:r.salvageOutcome.crystalIdentity});\n assert.deepEqual(core(filtered),core(normal));\n groups.push(file+': six composed source candidates: actual drop→Ctrl-select B→Down→A→B equip generated A→Y locks B and clears selection');\n groups.push(file+': composed filtered/unfiltered core item/resource/selection equivalence');\n\n}\nfunction crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}\nconst docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});\nassert.equal(docs.status,0);\nconst evidence={task:'composed current-source ITEM integration candidate timeline, no production writes',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,\n sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,stdoutSHA256:sha(docs.stdout)},\n actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],\n stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],\n priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};\nconsole.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,salvageOutcome:r.salvageOutcome})),anchors:anchors.filter(a=>/_gpInvNav|equipItem|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));\n",
      "exec": {
        "chunk_id": "1f57f3",
        "wall_time_seconds": 0.162553375,
        "exit_code": 1,
        "original_token_count": 209,
        "output": "evalmachine.<anonymous>:558\n  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드\n                ^\n\nReferenceError: _gpVCHide is not defined\n    at _gpInvNav (evalmachine.<anonymous>:558:17)\n    at evalmachine.<anonymous>:1:1\n    at Script.runInContext (node:vm:149:12)\n    at Object.runInContext (node:vm:301:6)\n    at frame (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:133:7)\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:136:17)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:152:23\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n\nNode.js v24.15.0\n"
      },
      "reason": "new directional frame requires _gpVCHide cursor observer, absent in base no-direction harness"
    },
    {
      "script": "import {applyItemPadASelectionPatch} from './tools/team-followup-20261002/supervisor-next/ITEM/ITEM-pad-A-outline-lifetime-rolling1300/checks.mjs';\nimport fs from 'node:fs';\nimport crypto from 'node:crypto';\nimport vm from 'node:vm';\nimport assert from 'node:assert/strict';\nimport {parseExpressionAt} from 'acorn';\nimport {spawnSync} from 'node:child_process';\n\nconst root='/Users/fordeargamers/Projects/exoduser-migration-20261001';\nassert.equal(fs.realpathSync(process.cwd()),root);\nconst startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');\nconst anchors=[],rows=[],groups=[],patches=[];\nfunction once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}\nexport function applyItemDragIdentityPatch(source){\n source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');\n source=once(source,\"  _invDragMoved=true;\\n  const grid=$('invGrid');if(!grid)return;\",\"  _invDragMoved=true;\\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\\n  const grid=$('invGrid');if(!grid)return;\");\n source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');\n return once(source,\"  if(_invCanPlace(d.idx,gx,gy)){\\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\\n  }\",\"  const current=INV.bag.indexOf(d.item);\\n  if(current>=0&&_invCanPlace(current,gx,gy)){\\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\\n  }\");\n}\nexport function applyEquipSalSelectionIdentityPatch(source){\n const start=source.indexOf('function equipItem(');assert(start>=0);\n const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;\n let body=source.slice(start,end);\n body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\\n  const old=INV.equipped[');\n body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');\n return source.slice(0,start)+body+source.slice(end);\n}\nexport function applyFavSelectionPrunePatch(source){\n return once(source,'for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}','for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}');\n}\nexport function applyItemPadBIdentityPatch(source){\n const card=\"const div=document.createElement('div');div.className='inv-item';\";\n if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+\"\\n    div.dataset.inventoryBagIndex=String(i);\");\n return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent(\"contextmenu\",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent(\"contextmenu\",{bubbles:true,cancelable:true}))');\n}\n\nfunction applyVisibleNav(source){\n const nav=source.indexOf('function _gpInvNav('),i=source.indexOf(\"    const bagLen=typeof INV!=='undefined'?INV.bag.length:0;\",nav),end=source.indexOf('    _clr();',i);\n assert(i>=0&&end>i);\n let old=source.slice(i,end);\n const marker=\"const bagLen=typeof INV!=='undefined'?INV.bag.length:0;\";\n const next=once(old,marker,marker+\"\\n    const _visibleBagIndices=[...($('invGrid')?.querySelectorAll('.inv-item')||[])].map(card=>Number(card.dataset.inventoryBagIndex)).filter(idx=>Number.isInteger(idx)&&idx>=0&&idx<bagLen);\")\n .replace('if(!bagLen){','if(!_visibleBagIndices.length){')\n .replaceAll('_gpInvIdx=Math.max(0,_gpInvIdx-1)','_gpInvIdx=_visibleBagIndices.filter(idx=>idx<_gpInvIdx).at(-1)??_visibleBagIndices[0]')\n .replaceAll('_gpInvIdx=Math.min(bagLen-1,_gpInvIdx+1)','_gpInvIdx=_visibleBagIndices.find(idx=>idx>_gpInvIdx)??_visibleBagIndices.at(-1)');\n const move=source.slice(0,i)+next+source.slice(end);\n return once(once(move,'if(x&&!_gpUIPrev.x&&_gpInvIdx<bagLen)','if(x&&!_gpUIPrev.x&&_visibleBagIndices.includes(_gpInvIdx))'),'if(y&&!_gpUIPrev.y&&_gpInvIdx<bagLen)','if(y&&!_gpUIPrev.y&&_visibleBagIndices.includes(_gpInvIdx))');\n}\nfunction compose(source){\n for(const apply of [applyItemPadASelectionPatch,applyItemPadBIdentityPatch,applyVisibleNav,applyItemDragIdentityPatch,applyEquipSalSelectionIdentityPatch,applyFavSelectionPrunePatch])source=apply(source);\n return source;\n}\nfunction ref(file,label,source,start,end){\n const text=source.slice(start,end);assert(start>=0&&end>start,label);\n anchors.push({file,label,line:source.slice(0,start).split('\\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});\n return text;\n}\nfunction fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}\nfunction con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}\nclass Node {\n constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}\n appendChild(n){n.parentElement=this;this.children.push(n);return n;}\n replaceChildren(){this.children=[];}\n remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}\n getBoundingClientRect(){return {left:0,top:0};}\n scrollIntoView(){}\n querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}\n dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}\n}\nclass MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}\nconst sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));\nfor(const {file,text:source} of sources){\n const patched=compose(source);\n patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:'six composed transforms'});\n function build(s,record){\n  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();\n  const funcs=['_gpInvNav','salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\\n');\n  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\\n');\n  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\\n');\n  const bi=s.indexOf('  // 필터 적용\\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);\n  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);\n  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);\n  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);\n  const pruning=s.includes(\"if(idx>=INV.bag.length||INV.bag[idx]?.fav)\")?\"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}\":\"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}\";\n  assert(s.includes(pruning));\n  const ki=s.indexOf(\"  if($('invPanel').classList.contains('on')){\",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);\n  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);\n  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');\n  const moveStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mousemove'\",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;\n  const upStart=s.indexOf('function(ev){',s.indexOf(\"document.addEventListener('mouseup'\",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;\n  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);\n\n  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);\n  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);\n  return 'const _BIC=false;const location={search:\"?demo\"};\\n'+cs+'\\n'+funcs+'\\n'+ear+'\\nlet _invHover=-1;function renderInv(){const grid=$(\\'invGrid\\');grid.replaceChildren();const _GC=48;\\n'+pruning+'\\n'+bag+'\\n'+salvage+'\\n}\\nfunction inventoryKey(e){'+key+'}\\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\\nfunction rPickup(){const chestOpened=false;\\n'+pick+'\\n}\\n';\n }\n const originalProgram=build(source,true),candidateProgram=build(patched,false);\n async function run(mode,usePatch){\n  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');\n  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};\n  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};\n  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};\n  let A;\n  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};\n  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};\n  const observer=n=>()=>{trace[n]++;events.push(n);};\n  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};\n  const c=vm.createContext({console,MouseEvent,_gpVCHide(){},_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:mode==='lock'&&i===3,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,\n   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,\n   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},\n   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],\n   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,\n   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),\n   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});\n  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);\n  vm.runInContext(usePatch?candidateProgram:originalProgram,c);\n  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};\n  pushPickup(X);\n  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);\n  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;\n  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);\n  const factorySnapshot=JSON.parse(JSON.stringify(A));\n  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));\n  pushPickup(B);\n  c.invFilter.slot=mode==='filtered'?'armor':null;\n  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));\n  vm.runInContext('renderInv()',c);\n  const bCard=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex==='2');\n  bCard.onclick({ctrlKey:true});assert(c._invSalSel.has(2));\n  const timeline=[];\n  const frame=button=>{\n   c._gpad.buttons.forEach((b,i)=>{b.pressed=i===button;b.value=0;});\n   vm.runInContext('_gpInvNav()',c);\n   timeline.push({button,index:c._gpInvIdx,bag:c.INV.bag.map(it=>it.id),selected:c.INV.selected,outline:grid.querySelectorAll('.inv-item').filter(n=>n.style.outline==='2px solid #C9A961').map(n=>n.dataset.inventoryBagIndex),salSelection:[...c._invSalSel],equippedId:c.INV.equipped.armor?.id,mats:c.G.mats});\n  };\n  c._gpInvIdx=0;frame(13);assert.equal(c._gpInvIdx,1);frame(-1);frame(0);\n  assert.equal(c.INV.selected,1);assert.deepEqual(timeline.at(-1).outline,['1']);\n  frame(-1);frame(1);\n  assert.equal(c.INV.equipped.armor,A);assert.deepEqual([...c._invSalSel],[1]);assert.equal(c.INV.bag[1],B);\n  frame(-1);frame(3);\n  assert.equal(B.fav,true);assert.deepEqual([...c._invSalSel],[]);assert.equal(salvageBtn.style.display,'none');\n  const before={bag:['X',A.id,'B']},beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};\n  const salvageOutcome={timeline,selectionAfterLock:[...c._invSalSel],locked:!!B.fav,hasGeneratedEquipped:c.INV.equipped.armor===A,hasLockedB:c.INV.bag.includes(B),mats:c.G.mats,crystalIdentity:A.crystals[0]===crystal};\n  const equipped=c.INV.equipped.armor;\n  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,\n   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,\n   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,\n   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};\n  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};\n  rows.push(row);return row;\n }\n const filtered=await run('filtered',true),normal=await run('unfiltered',true);\n assert.equal(filtered.salvageOutcome.mats,8500);assert.equal(filtered.salvageOutcome.crystalIdentity,true);\n const core=r=>({mats:r.salvageOutcome.mats,bag:r.after.bag,eq:r.after.equipped,sal:r.salvageOutcome.selectionAfterLock,hasB:r.salvageOutcome.hasLockedB,crystal:r.salvageOutcome.crystalIdentity});\n assert.deepEqual(core(filtered),core(normal));\n groups.push(file+': six composed source candidates: actual drop→Ctrl-select B→Down→A→B equip generated A→Y locks B and clears selection');\n groups.push(file+': composed filtered/unfiltered core item/resource/selection equivalence');\n\n}\nfunction crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}\nconst docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});\nassert.equal(docs.status,0);\nconst evidence={task:'composed current-source ITEM integration candidate timeline, no production writes',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,\n sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,stdoutSHA256:sha(docs.stdout)},\n actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],\n stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],\n priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};\nconsole.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,salvageOutcome:r.salvageOutcome})),anchors:anchors.filter(a=>/_gpInvNav|equipItem|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed; _gpVCHide cursor hide observer','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));\n",
      "exec": {
        "chunk_id": "a03801",
        "wall_time_seconds": 0.156412834,
        "exit_code": 1,
        "original_token_count": 256,
        "output": "file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:149\n  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};\n                                                                                                                                                                            ^\n\nReferenceError: cards is not defined\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:149:173)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:152:23\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)\n\nNode.js v24.15.0\n"
      },
      "reason": "row reporting referenced removed setup cards variable after new timeline; replace with current live grid query"
    }
  ],
  "compositionAdditional": [
    "4ccaed Node parse duplicate applyItemDragIdentityPatch declaration; no product tests before parse",
    "functions parse Unexpected token ')' during first repair; no node execution",
    "functions TypeError missing failure-array during subsequent repair; no node execution"
  ]
}
```

## composed revised timeline

Script store: item_composed_inventory_fresh_outline_script; tool receipt store: item_composed_inventory_fresh_outline_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import {applyItemPadAOutlinePatch} from './tools/team-followup-20261002/supervisor-next/ITEM/ITEM-pad-A-outline-lifetime-rolling1300/checks.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
export function applyEquipSalSelectionIdentityPatch(source){
 const start=source.indexOf('function equipItem(');assert(start>=0);
 const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 let body=source.slice(start,end);
 body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\n  const old=INV.equipped[');
 body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');
 return source.slice(0,start)+body+source.slice(end);
}
export function applyFavSelectionPrunePatch(source){
 return once(source,'for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}','for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}');
}
export function applyItemPadBIdentityPatch(source){
 const card="const div=document.createElement('div');div.className='inv-item';";
 if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+"\n    div.dataset.inventoryBagIndex=String(i);");
 return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))');
}

function applyVisibleNav(source){
 const nav=source.indexOf('function _gpInvNav('),i=source.indexOf("    const bagLen=typeof INV!=='undefined'?INV.bag.length:0;",nav),end=source.indexOf('    _clr();',i);
 assert(i>=0&&end>i);
 let old=source.slice(i,end);
 const marker="const bagLen=typeof INV!=='undefined'?INV.bag.length:0;";
 const next=once(old,marker,marker+"\n    const _visibleBagIndices=[...($('invGrid')?.querySelectorAll('.inv-item')||[])].map(card=>Number(card.dataset.inventoryBagIndex)).filter(idx=>Number.isInteger(idx)&&idx>=0&&idx<bagLen);")
 .replace('if(!bagLen){','if(!_visibleBagIndices.length){')
 .replaceAll('_gpInvIdx=Math.max(0,_gpInvIdx-1)','_gpInvIdx=_visibleBagIndices.filter(idx=>idx<_gpInvIdx).at(-1)??_visibleBagIndices[0]')
 .replaceAll('_gpInvIdx=Math.min(bagLen-1,_gpInvIdx+1)','_gpInvIdx=_visibleBagIndices.find(idx=>idx>_gpInvIdx)??_visibleBagIndices.at(-1)');
 const move=source.slice(0,i)+next+source.slice(end);
 return once(once(move,'if(x&&!_gpUIPrev.x&&_gpInvIdx<bagLen)','if(x&&!_gpUIPrev.x&&_visibleBagIndices.includes(_gpInvIdx))'),'if(y&&!_gpUIPrev.y&&_gpInvIdx<bagLen)','if(y&&!_gpUIPrev.y&&_visibleBagIndices.includes(_gpInvIdx))');
}
export function applyFreshBagOutlineAfterActionPatch(source){
 const start=source.indexOf('function _gpInvNav('),end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 const fn=source.slice(start,end),anchor="\n    }\n  } else if(_gpInvMode==='eq'){";
 const restore="\n      const _freshBagCard=[...grid.querySelectorAll('.inv-item')].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));\n      if(_freshBagCard&&_freshBagCard!==_activeBagCard){_freshBagCard.style.outline='2px solid #C9A961';_freshBagCard.style.outlineOffset='-1px';_freshBagCard.scrollIntoView({block:'nearest'});}";
 return source.slice(0,start)+once(fn,anchor,restore+anchor)+source.slice(end);
}
function compose(source){
 for(const apply of [applyItemPadAOutlinePatch,applyItemPadBIdentityPatch,applyVisibleNav,applyItemDragIdentityPatch,applyEquipSalSelectionIdentityPatch,applyFavSelectionPrunePatch,applyFreshBagOutlineAfterActionPatch])source=apply(source);
 return source;
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 getBoundingClientRect(){return {left:0,top:0};}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=compose(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:'seven composed transforms; common fresh outline replaces A-only restoration'});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['_gpInvNav','salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);
  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);
  const pruning=s.includes("if(idx>=INV.bag.length||INV.bag[idx]?.fav)")?"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}":"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}";
  assert(s.includes(pruning));
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);
  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');
  const moveStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mousemove'",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;
  const upStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mouseup'",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;
  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);

  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return 'const _BIC=false;const location={search:"?demo"};\n'+cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+pruning+'\n'+bag+'\n'+salvage+'\n}\nfunction inventoryKey(e){'+key+'}\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 async function run(mode,usePatch){
  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  let A;
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpVCHide(){},_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:mode==='lock'&&i===3,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,
   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};
  pushPickup(X);
  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);
  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;
  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);
  const factorySnapshot=JSON.parse(JSON.stringify(A));
  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));
  pushPickup(B);
  c.invFilter.slot=mode==='filtered'?'armor':null;
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  const bCard=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex==='2');
  bCard.onclick({ctrlKey:true});assert(c._invSalSel.has(2));
  const timeline=[];
  const frame=button=>{
   c._gpad.buttons.forEach((b,i)=>{b.pressed=i===button;b.value=0;});
   vm.runInContext('_gpInvNav()',c);
   timeline.push({button,index:c._gpInvIdx,bag:c.INV.bag.map(it=>it.id),selected:c.INV.selected,outline:grid.querySelectorAll('.inv-item').filter(n=>n.style.outline==='2px solid #C9A961').map(n=>n.dataset.inventoryBagIndex),salSelection:[...c._invSalSel],equippedId:c.INV.equipped.armor?.id,mats:c.G.mats});
  };
  c._gpInvIdx=0;frame(13);assert.equal(c._gpInvIdx,1);frame(-1);frame(0);
  assert.equal(c.INV.selected,1);assert.deepEqual(timeline.at(-1).outline,['1']);
  frame(-1);frame(1);
  assert.equal(c.INV.equipped.armor,A);assert.deepEqual([...c._invSalSel],[1]);assert.equal(c.INV.bag[1],B);assert.deepEqual(timeline.at(-1).outline,['1']);
  frame(-1);frame(3);
  assert.equal(B.fav,true);assert.deepEqual([...c._invSalSel],[]);assert.equal(salvageBtn.style.display,'none');assert.deepEqual(timeline.at(-1).outline,['1']);
  const before={bag:['X',A.id,'B']},beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};
  const salvageOutcome={timeline,selectionAfterLock:[...c._invSalSel],locked:!!B.fav,hasGeneratedEquipped:c.INV.equipped.armor===A,hasLockedB:c.INV.bag.includes(B),mats:c.G.mats,crystalIdentity:A.crystals[0]===crystal};
  const equipped=c.INV.equipped.armor;
  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:grid.querySelectorAll('.inv-item').map(n=>n.dataset.inventoryBagIndex),before,after,trace,events};
  rows.push(row);return row;
 }
 const filtered=await run('filtered',true),normal=await run('unfiltered',true);
 assert.equal(filtered.salvageOutcome.mats,8500);assert.equal(filtered.salvageOutcome.crystalIdentity,true);
 const core=r=>({mats:r.salvageOutcome.mats,bag:r.after.bag,eq:r.after.equipped,sal:r.salvageOutcome.selectionAfterLock,hasB:r.salvageOutcome.hasLockedB,crystal:r.salvageOutcome.crystalIdentity});
 assert.deepEqual(core(filtered),core(normal));
 groups.push(file+': composed candidates with fresh outline after A/B/Y actions: actual drop→Ctrl-select B→Down→A→B equip generated A→Y locks B and clears selection');
 groups.push(file+': composed filtered/unfiltered core item/resource/selection equivalence');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'revised composed ITEM candidate: fresh live outline restored after A/B/Y frame, source only',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,salvageOutcome:r.salvageOutcome})),anchors:anchors.filter(a=>/_gpInvNav|equipItem|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed; _gpVCHide cursor hide observer','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));

```

```json
{
  "chunk_id": "d90375",
  "wall_time_seconds": 0.387238459,
  "exit_code": 0,
  "original_token_count": 1846,
  "output": "{\"task\":\"revised composed ITEM candidate: fresh live outline restored after A/B/Y frame, source only\",\"startedUTC\":\"2026-10-02T13:21:20.441Z\",\"endedUTC\":\"2026-10-02T13:21:20.926Z\",\"groups\":[\"game.html: composed candidates with fresh outline after A/B/Y actions: actual drop→Ctrl-select B→Down→A→B equip generated A→Y locks B and clears selection\",\"game.html: composed filtered/unfiltered core item/resource/selection equivalence\",\"game-easy-test.html: composed candidates with fresh outline after A/B/Y actions: actual drop→Ctrl-select B→Down→A→B equip generated A→Y locks B and clears selection\",\"game-easy-test.html: composed filtered/unfiltered core item/resource/selection equivalence\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"filtered\",\"salvageOutcome\":{\"timeline\":[{\"button\":13,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":0,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":-1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":3,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[],\"equippedId\":12345.22,\"mats\":8500}],\"selectionAfterLock\":[],\"locked\":true,\"hasGeneratedEquipped\":true,\"hasLockedB\":true,\"mats\":8500,\"crystalIdentity\":true}},{\"file\":\"game.html\",\"mode\":\"unfiltered\",\"salvageOutcome\":{\"timeline\":[{\"button\":13,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":0,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":-1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":3,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[],\"equippedId\":12345.22,\"mats\":8500}],\"selectionAfterLock\":[],\"locked\":true,\"hasGeneratedEquipped\":true,\"hasLockedB\":true,\"mats\":8500,\"crystalIdentity\":true}},{\"file\":\"game-easy-test.html\",\"mode\":\"filtered\",\"salvageOutcome\":{\"timeline\":[{\"button\":13,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":0,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":-1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":3,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[],\"equippedId\":12345.22,\"mats\":8500}],\"selectionAfterLock\":[],\"locked\":true,\"hasGeneratedEquipped\":true,\"hasLockedB\":true,\"mats\":8500,\"crystalIdentity\":true}},{\"file\":\"game-easy-test.html\",\"mode\":\"unfiltered\",\"salvageOutcome\":{\"timeline\":[{\"button\":13,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":0,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":-1,\"index\":1,\"bag\":[\"X\",12345.22,\"B\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[2],\"equippedId\":\"OLD\",\"mats\":10000},{\"button\":1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":-1,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[1],\"equippedId\":12345.22,\"mats\":8500},{\"button\":3,\"index\":1,\"bag\":[\"X\",\"B\",\"OLD\"],\"selected\":1,\"outline\":[\"1\"],\"salSelection\":[],\"equippedId\":12345.22,\"mats\":8500}],\"selectionAfterLock\":[],\"locked\":true,\"hasGeneratedEquipped\":true,\"hasLockedB\":true,\"mats\":8500,\"crystalIdentity\":true}}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"_gpInvNav\",\"line\":13653,\"sha256\":\"4bfa67a41569c80d2881abdc6276193f509fb7c50989378d2926cae21402971c\",\"bytes\":9979},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15577,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":48778,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014},{\"file\":\"game-easy-test.html\",\"label\":\"_gpInvNav\",\"line\":13050,\"sha256\":\"cf33bcd8890a171d261086ae33cf40a823c5dac0105f2f70b340b4cf86db30c6\",\"bytes\":9954},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":47354,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\"afterSHA\":\"16715276040000819271f71ccd989f362fdf4920be6c3348674ad56f1d09f435\",\"replacements\":\"seven composed transforms; common fresh outline replaces A-only restoration\"},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\"afterSHA\":\"06542a56a8ff32fbdbd32e16627bbac946a7afeb4dd1b0778cb58f1313aedcd9\",\"replacements\":\"seven composed transforms; common fresh outline replaces A-only restoration\"}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":126,\"sha\":\"feed287eda4552e1ba16d37589d5bd0b72e9e774f8f2971f81db7574ab8dac1d\"},\"stubs\":[\"synthetic DOM/full focus layout not executed; _gpVCHide cursor hide observer\",\"gameConfirm resolved true only; actual confirm UI not executed\",\"audio/stats/save observers\",\"dropBonus1,random.22 ordinaryarmor actualfactory\"],\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"exit\":0}\n"
}
```

## whole candidate syntax

Script store: item_composed_inventory_fresh_outline_syntax_script; tool receipt store: item_composed_inventory_fresh_outline_syntax_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import {applyItemPadAOutlinePatch} from './tools/team-followup-20261002/supervisor-next/ITEM/ITEM-pad-A-outline-lifetime-rolling1300/checks.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
export function applyEquipSalSelectionIdentityPatch(source){
 const start=source.indexOf('function equipItem(');assert(start>=0);
 const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 let body=source.slice(start,end);
 body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\n  const old=INV.equipped[');
 body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');
 return source.slice(0,start)+body+source.slice(end);
}
export function applyFavSelectionPrunePatch(source){
 return once(source,'for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}','for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}');
}
export function applyItemPadBIdentityPatch(source){
 const card="const div=document.createElement('div');div.className='inv-item';";
 if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+"\n    div.dataset.inventoryBagIndex=String(i);");
 return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))');
}

function applyVisibleNav(source){
 const nav=source.indexOf('function _gpInvNav('),i=source.indexOf("    const bagLen=typeof INV!=='undefined'?INV.bag.length:0;",nav),end=source.indexOf('    _clr();',i);
 assert(i>=0&&end>i);
 let old=source.slice(i,end);
 const marker="const bagLen=typeof INV!=='undefined'?INV.bag.length:0;";
 const next=once(old,marker,marker+"\n    const _visibleBagIndices=[...($('invGrid')?.querySelectorAll('.inv-item')||[])].map(card=>Number(card.dataset.inventoryBagIndex)).filter(idx=>Number.isInteger(idx)&&idx>=0&&idx<bagLen);")
 .replace('if(!bagLen){','if(!_visibleBagIndices.length){')
 .replaceAll('_gpInvIdx=Math.max(0,_gpInvIdx-1)','_gpInvIdx=_visibleBagIndices.filter(idx=>idx<_gpInvIdx).at(-1)??_visibleBagIndices[0]')
 .replaceAll('_gpInvIdx=Math.min(bagLen-1,_gpInvIdx+1)','_gpInvIdx=_visibleBagIndices.find(idx=>idx>_gpInvIdx)??_visibleBagIndices.at(-1)');
 const move=source.slice(0,i)+next+source.slice(end);
 return once(once(move,'if(x&&!_gpUIPrev.x&&_gpInvIdx<bagLen)','if(x&&!_gpUIPrev.x&&_visibleBagIndices.includes(_gpInvIdx))'),'if(y&&!_gpUIPrev.y&&_gpInvIdx<bagLen)','if(y&&!_gpUIPrev.y&&_visibleBagIndices.includes(_gpInvIdx))');
}
export function applyFreshBagOutlineAfterActionPatch(source){
 const start=source.indexOf('function _gpInvNav('),end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 const fn=source.slice(start,end),anchor="\n    }\n  } else if(_gpInvMode==='eq'){";
 const restore="\n      const _freshBagCard=[...grid.querySelectorAll('.inv-item')].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));\n      if(_freshBagCard&&_freshBagCard!==_activeBagCard){_freshBagCard.style.outline='2px solid #C9A961';_freshBagCard.style.outlineOffset='-1px';_freshBagCard.scrollIntoView({block:'nearest'});}";
 return source.slice(0,start)+once(fn,anchor,restore+anchor)+source.slice(end);
}
function compose(source){
 for(const apply of [applyItemPadAOutlinePatch,applyItemPadBIdentityPatch,applyVisibleNav,applyItemDragIdentityPatch,applyEquipSalSelectionIdentityPatch,applyFavSelectionPrunePatch,applyFreshBagOutlineAfterActionPatch])source=apply(source);
 return source;
}
const syntax=[];
for(const file of ['game.html','game-easy-test.html']){
 const source=fs.readFileSync(file,'utf8'),candidate=compose(source);let scripts=0,imports=0;
 for(const m of candidate.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=/.test(m[1]))continue;
  if(/type\s*=\s*["']importmap["']/.test(m[1])){JSON.parse(m[2]);imports++;continue;}
  if(!m[2].trim())continue;
  const parser=await import('acorn');parser.parse(m[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*["']module["']/.test(m[1])?'module':'script'});scripts++;
 }
 const docs=spawnSync('rg',['-n','inventoryBagIndex|_gpInvNav|_invSalSel|_invDrag|outline|중요잠금','docs/'],{encoding:'utf8',maxBuffer:16000000});assert.equal(docs.status,0);
 syntax.push({file,beforeSHA:sha(source),candidateSHA:sha(candidate),inlineScripts:scripts,importmaps:imports,docs:{lines:docs.stdout.trimEnd().split('\n').length,sha256:sha(docs.stdout)}});
}
console.log(JSON.stringify({task:'whole inline candidate syntax only; no test reruns/native/production',startedUTC,endedUTC:new Date().toISOString(),syntax,newFiles:0,exit:0}));

```

```json
{
  "chunk_id": "208c22",
  "wall_time_seconds": 0.375832291,
  "exit_code": 0,
  "original_token_count": 207,
  "output": "{\"task\":\"whole inline candidate syntax only; no test reruns/native/production\",\"startedUTC\":\"2026-10-02T13:21:39.817Z\",\"endedUTC\":\"2026-10-02T13:21:40.285Z\",\"syntax\":[{\"file\":\"game.html\",\"beforeSHA\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\"candidateSHA\":\"16715276040000819271f71ccd989f362fdf4920be6c3348674ad56f1d09f435\",\"inlineScripts\":6,\"importmaps\":1,\"docs\":{\"lines\":184,\"sha256\":\"e68d2ddbbbb11c616912c1f654d3d068eaf3ab19437a738a5f62f8afb9532d17\"}},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\"candidateSHA\":\"06542a56a8ff32fbdbd32e16627bbac946a7afeb4dd1b0778cb58f1313aedcd9\",\"inlineScripts\":6,\"importmaps\":1,\"docs\":{\"lines\":184,\"sha256\":\"cbb231d78e76be0b109b0da431ee38c505bb71e9a60cf2e7b8a0273812c5ca9d\"}}],\"newFiles\":0,\"exit\":0}\n"
}
```

## selected salvage index shift

Script store: item_live_sal_selection_script; tool receipt store: item_live_sal_selection_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
export function applyEquipSalSelectionIdentityPatch(source){
 const start=source.indexOf('function equipItem(');assert(start>=0);
 const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 let body=source.slice(start,end);
 body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\n  const old=INV.equipped[');
 body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');
 return source.slice(0,start)+body+source.slice(end);
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 getBoundingClientRect(){return {left:0,top:0};}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyEquipSalSelectionIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);
  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);
  const pruning="for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}";
  assert(s.includes(pruning));
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);
  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');
  const moveStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mousemove'",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;
  const upStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mouseup'",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;
  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);

  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return 'const _BIC=false;const location={search:"?demo"};\n'+cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+pruning+'\n'+bag+'\n'+salvage+'\n}\nfunction inventoryKey(e){'+key+'}\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 async function run(mode,usePatch){
  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  let A;
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,
   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};
  pushPickup(X);
  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);
  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;
  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);
  const factorySnapshot=JSON.parse(JSON.stringify(A));
  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));
  pushPickup(B);
  if(mode==='shift')c.invFilter.slot='armor';
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  const bCard=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex==='2');
  bCard.onclick({ctrlKey:true});
  assert(c._invSalSel.has(2));
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(card=>card.dataset.inventoryBagIndex==='1');
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  if(mode==='shift')vm.runInContext('inventoryKey({code:"KeyY",preventDefault(){}})',c);
  const selectedBeforeSalvage=[...c._invSalSel].map(i=>c.INV.bag[i]?.id),matsBeforeSalvage=c.G.mats;
  await salvageBtn.onclick();
  const salvageOutcome={selectedBeforeSalvage,bag:c.INV.bag.map(it=>it.id),matsDelta:c.G.mats-matsBeforeSalvage,hasB:c.INV.bag.includes(B),hasOld:c.INV.bag.includes(old),equippedId:c.INV.equipped.armor?.id};
  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};
  const equipped=c.INV.equipped.armor;
  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const red=await run('shift',false),green=await run('shift',true);
 assert.deepEqual(red.salvageOutcome.selectedBeforeSalvage,['OLD']);assert.equal(red.salvageOutcome.hasB,true);assert.equal(red.salvageOutcome.hasOld,false);
 assert.deepEqual(green.salvageOutcome.selectedBeforeSalvage,['B']);assert.equal(green.salvageOutcome.hasB,false);assert.equal(green.salvageOutcome.hasOld,true);
 assert.equal(green.salvageOutcome.matsDelta,1000);
 groups.push(file+': live B ctrl-select→current A KeyY equip→new current salvage button; original loses OLD, candidate preserves B identity');
 const normal=await run('normal',false),normalCandidate=await run('normal',true);
 assert.deepEqual(normal.salvageOutcome,normalCandidate.salvageOutcome);assert.equal(normal.salvageOutcome.hasB,false);
 groups.push(file+': no equip mutation selected B salvage normal equivalence');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'live selected salvage identity after equip array shift, no detached old callback',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,patched:r.patched,salvageOutcome:r.salvageOutcome,after:r.after})),anchors:anchors.filter(a=>/equipItem|salvageVal|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));

```

```json
{
  "chunk_id": "e62123",
  "wall_time_seconds": 0.350155125,
  "exit_code": 0,
  "original_token_count": 1679,
  "output": "{\"task\":\"live selected salvage identity after equip array shift, no detached old callback\",\"startedUTC\":\"2026-10-02T13:13:49.512Z\",\"endedUTC\":\"2026-10-02T13:13:49.963Z\",\"groups\":[\"game.html: live B ctrl-select→current A KeyY equip→new current salvage button; original loses OLD, candidate preserves B identity\",\"game.html: no equip mutation selected B salvage normal equivalence\",\"game-easy-test.html: live B ctrl-select→current A KeyY equip→new current salvage button; original loses OLD, candidate preserves B identity\",\"game-easy-test.html: no equip mutation selected B salvage normal equivalence\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"shift\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"OLD\"],\"bag\":[\"X\",\"B\"],\"matsDelta\":50006,\"hasB\":true,\"hasOld\":false,\"equippedId\":12345.22},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":58506},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":58506,\"equipped\":12345.22,\"bag\":[\"X\",\"B\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}},{\"file\":\"game.html\",\"mode\":\"shift\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",\"OLD\"],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":true,\"equippedId\":12345.22},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":9500},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":9500,\"equipped\":12345.22,\"bag\":[\"X\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}},{\"file\":\"game.html\",\"mode\":\"normal\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":11000},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":11000,\"equipped\":\"OLD\",\"bag\":[\"X\",12345.22],\"oldEnh\":3,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}},{\"file\":\"game.html\",\"mode\":\"normal\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":11000},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":11000,\"equipped\":\"OLD\",\"bag\":[\"X\",12345.22],\"oldEnh\":3,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}},{\"file\":\"game-easy-test.html\",\"mode\":\"shift\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"OLD\"],\"bag\":[\"X\",\"B\"],\"matsDelta\":50006,\"hasB\":true,\"hasOld\":false,\"equippedId\":12345.22},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":58506},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":58506,\"equipped\":12345.22,\"bag\":[\"X\",\"B\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}},{\"file\":\"game-easy-test.html\",\"mode\":\"shift\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",\"OLD\"],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":true,\"equippedId\":12345.22},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":9500},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":9500,\"equipped\":12345.22,\"bag\":[\"X\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}},{\"file\":\"game-easy-test.html\",\"mode\":\"normal\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":11000},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":11000,\"equipped\":\"OLD\",\"bag\":[\"X\",12345.22],\"oldEnh\":3,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}},{\"file\":\"game-easy-test.html\",\"mode\":\"normal\",\"salvageOutcome\":{\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":11000},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":11000,\"equipped\":\"OLD\",\"bag\":[\"X\",12345.22],\"oldEnh\":3,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true}}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"salvageVal\",\"line\":26980,\"sha256\":\"b9f8e160dca1b2486c5cc8c7933751918cc638d4f24d41cc117718893b657580\",\"bytes\":741},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15577,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":48778,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014},{\"file\":\"game-easy-test.html\",\"label\":\"salvageVal\",\"line\":25855,\"sha256\":\"b9f8e160dca1b2486c5cc8c7933751918cc638d4f24d41cc117718893b657580\",\"bytes\":741},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":47354,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\"afterSHA\":\"5f9317293bbcd851e0fe2a09e130b08976dee9f0410b89b9eec3402d25c9cb35\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\"afterSHA\":\"c117dce47a2529add3fe9421be9718b4e70e7a21f942e7d71b13aefd0b2a9330\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":126,\"sha\":\"e067d34669f5cbad679ad56655bf1de9f7053b4a809d512874354a926386828a\"},\"stubs\":[\"synthetic DOM/full focus layout not executed\",\"gameConfirm resolved true only; actual confirm UI not executed\",\"audio/stats/save observers\",\"dropBonus1,random.22 ordinaryarmor actualfactory\"],\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"exit\":0}\n"
}
```

## selected salvage guards

Script store: item_live_sal_selection_guards_script; tool receipt store: item_live_sal_selection_guards_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
export function applyEquipSalSelectionIdentityPatch(source){
 const start=source.indexOf('function equipItem(');assert(start>=0);
 const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 let body=source.slice(start,end);
 body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\n  const old=INV.equipped[');
 body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');
 return source.slice(0,start)+body+source.slice(end);
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 getBoundingClientRect(){return {left:0,top:0};}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyEquipSalSelectionIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);
  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);
  const pruning="for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}";
  assert(s.includes(pruning));
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);
  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');
  const moveStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mousemove'",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;
  const upStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mouseup'",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;
  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);

  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return 'const _BIC=false;const location={search:"?demo"};\n'+cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+pruning+'\n'+bag+'\n'+salvage+'\n}\nfunction inventoryKey(e){'+key+'}\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 async function run(mode,usePatch){
  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  let A;
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,
   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};
  pushPickup(X);
  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);
  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;
  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);
  const factorySnapshot=JSON.parse(JSON.stringify(A));
  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));
  pushPickup(B);
  c.invFilter.slot='armor';if(mode==='fundsGate')c.G.mats=1499;if(mode==='levelGate')A.reqLv=20;
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  const ctrlSelect=idx=>{const card=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex===String(idx));assert(card);card.onclick({ctrlKey:true});};
  if(mode==='selectedEquipped'||mode==='mixed')ctrlSelect(1);
  if(mode!=='selectedEquipped')ctrlSelect(2);
  const beforeSelection=[...c._invSalSel],beforeMats=c.G.mats,beforeCrystal=old.crystals[0];
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(card=>card.dataset.inventoryBagIndex==='1');
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  vm.runInContext('inventoryKey({code:"KeyY",preventDefault(){}})',c);
  const selectedBeforeSalvage=[...c._invSalSel].map(i=>c.INV.bag[i]?.id),matsBeforeSalvage=c.G.mats;
  const selectionAfterEquip=[...c._invSalSel],equipSnapshot={mats:c.G.mats,equippedId:c.INV.equipped.armor?.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,oldCrystal:old.crystals[0]?.id||null};
  if(c._invSalSel.size)await salvageBtn.onclick();
  else assert.equal(salvageBtn.style.display,'none');
  const salvageOutcome={beforeSelection,selectionAfterEquip,beforeMats,equipSnapshot,selectedBeforeSalvage,bag:c.INV.bag.map(it=>it.id),matsDelta:c.G.mats-matsBeforeSalvage,hasB:c.INV.bag.includes(B),hasOld:c.INV.bag.includes(old),equippedId:c.INV.equipped.armor?.id};
  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};
  const equipped=c.INV.equipped.armor;
  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 for(const mode of ['selectedEquipped','mixed','fundsGate','levelGate']){
  const result=await run(mode,true),o=result.salvageOutcome;
  if(mode==='selectedEquipped'){assert.deepEqual(o.selectionAfterEquip,[]);assert.equal(o.matsDelta,0);assert(o.hasB&&o.hasOld);}
  if(mode==='mixed'){assert.deepEqual(o.selectionAfterEquip,[1]);assert.deepEqual(o.selectedBeforeSalvage,['B']);assert.equal(o.matsDelta,1000);assert(o.hasOld&&!o.hasB);}
  if(mode==='fundsGate'||mode==='levelGate'){assert.deepEqual(o.selectionAfterEquip,o.beforeSelection);assert.equal(o.equipSnapshot.mats,o.beforeMats);assert.equal(o.equipSnapshot.equippedId,'OLD');assert.equal(o.equipSnapshot.oldEnh,3);assert.equal(o.equipSnapshot.oldCrystal,crystalId(file));assert.equal(o.matsDelta,1000);}
  groups.push(file+': candidate selection guard '+mode);
 }

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'equip selection candidate guard boundaries: selected equip removed, mixed survivors, failed equip funds/level preserve selection',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,salvageOutcome:r.salvageOutcome})),anchors:anchors.filter(a=>/equipItem|salvageVal|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));

```

```json
{
  "chunk_id": "890c4d",
  "wall_time_seconds": 0.373794958,
  "exit_code": 0,
  "original_token_count": 1402,
  "output": "{\"task\":\"equip selection candidate guard boundaries: selected equip removed, mixed survivors, failed equip funds/level preserve selection\",\"startedUTC\":\"2026-10-02T13:15:15.087Z\",\"endedUTC\":\"2026-10-02T13:15:15.560Z\",\"groups\":[\"game.html: candidate selection guard selectedEquipped\",\"game.html: candidate selection guard mixed\",\"game.html: candidate selection guard fundsGate\",\"game.html: candidate selection guard levelGate\",\"game-easy-test.html: candidate selection guard selectedEquipped\",\"game-easy-test.html: candidate selection guard mixed\",\"game-easy-test.html: candidate selection guard fundsGate\",\"game-easy-test.html: candidate selection guard levelGate\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"selectedEquipped\",\"salvageOutcome\":{\"beforeSelection\":[1],\"selectionAfterEquip\":[],\"beforeMats\":10000,\"equipSnapshot\":{\"mats\":8500,\"equippedId\":12345.22,\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"oldCrystal\":null},\"selectedBeforeSalvage\":[],\"bag\":[\"X\",\"B\",\"OLD\"],\"matsDelta\":0,\"hasB\":true,\"hasOld\":true,\"equippedId\":12345.22}},{\"file\":\"game.html\",\"mode\":\"mixed\",\"salvageOutcome\":{\"beforeSelection\":[1,2],\"selectionAfterEquip\":[1],\"beforeMats\":10000,\"equipSnapshot\":{\"mats\":8500,\"equippedId\":12345.22,\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"oldCrystal\":null},\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",\"OLD\"],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":true,\"equippedId\":12345.22}},{\"file\":\"game.html\",\"mode\":\"fundsGate\",\"salvageOutcome\":{\"beforeSelection\":[2],\"selectionAfterEquip\":[2],\"beforeMats\":1499,\"equipSnapshot\":{\"mats\":1499,\"equippedId\":\"OLD\",\"bag\":[\"X\",12345.22,\"B\"],\"oldEnh\":3,\"oldCrystal\":\"cr_martyr_tear\"},\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game.html\",\"mode\":\"levelGate\",\"salvageOutcome\":{\"beforeSelection\":[2],\"selectionAfterEquip\":[2],\"beforeMats\":10000,\"equipSnapshot\":{\"mats\":10000,\"equippedId\":\"OLD\",\"bag\":[\"X\",12345.22,\"B\"],\"oldEnh\":3,\"oldCrystal\":\"cr_martyr_tear\"},\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game-easy-test.html\",\"mode\":\"selectedEquipped\",\"salvageOutcome\":{\"beforeSelection\":[1],\"selectionAfterEquip\":[],\"beforeMats\":10000,\"equipSnapshot\":{\"mats\":8500,\"equippedId\":12345.22,\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"oldCrystal\":null},\"selectedBeforeSalvage\":[],\"bag\":[\"X\",\"B\",\"OLD\"],\"matsDelta\":0,\"hasB\":true,\"hasOld\":true,\"equippedId\":12345.22}},{\"file\":\"game-easy-test.html\",\"mode\":\"mixed\",\"salvageOutcome\":{\"beforeSelection\":[1,2],\"selectionAfterEquip\":[1],\"beforeMats\":10000,\"equipSnapshot\":{\"mats\":8500,\"equippedId\":12345.22,\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"oldCrystal\":null},\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",\"OLD\"],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":true,\"equippedId\":12345.22}},{\"file\":\"game-easy-test.html\",\"mode\":\"fundsGate\",\"salvageOutcome\":{\"beforeSelection\":[2],\"selectionAfterEquip\":[2],\"beforeMats\":1499,\"equipSnapshot\":{\"mats\":1499,\"equippedId\":\"OLD\",\"bag\":[\"X\",12345.22,\"B\"],\"oldEnh\":3,\"oldCrystal\":\"cr_hp\"},\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game-easy-test.html\",\"mode\":\"levelGate\",\"salvageOutcome\":{\"beforeSelection\":[2],\"selectionAfterEquip\":[2],\"beforeMats\":10000,\"equipSnapshot\":{\"mats\":10000,\"equippedId\":\"OLD\",\"bag\":[\"X\",12345.22,\"B\"],\"oldEnh\":3,\"oldCrystal\":\"cr_hp\"},\"selectedBeforeSalvage\":[\"B\"],\"bag\":[\"X\",12345.22],\"matsDelta\":1000,\"hasB\":false,\"hasOld\":false,\"equippedId\":\"OLD\"}}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"salvageVal\",\"line\":26980,\"sha256\":\"b9f8e160dca1b2486c5cc8c7933751918cc638d4f24d41cc117718893b657580\",\"bytes\":741},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15577,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":48778,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014},{\"file\":\"game-easy-test.html\",\"label\":\"salvageVal\",\"line\":25855,\"sha256\":\"b9f8e160dca1b2486c5cc8c7933751918cc638d4f24d41cc117718893b657580\",\"bytes\":741},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":47354,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\"afterSHA\":\"5f9317293bbcd851e0fe2a09e130b08976dee9f0410b89b9eec3402d25c9cb35\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\"afterSHA\":\"c117dce47a2529add3fe9421be9718b4e70e7a21f942e7d71b13aefd0b2a9330\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":126,\"sha\":\"4543940a97d550cc8060bd97fed63b7ae6cc1ab7ad221f3b7792523c59e82806\"},\"stubs\":[\"synthetic DOM/full focus layout not executed\",\"gameConfirm resolved true only; actual confirm UI not executed\",\"audio/stats/save observers\",\"dropBonus1,random.22 ordinaryarmor actualfactory\"],\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"exit\":0}\n"
}
```

## selected favorite lock

Script store: item_fav_sal_prune_script; tool receipt store: item_fav_sal_prune_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
export function applyEquipSalSelectionIdentityPatch(source){
 const start=source.indexOf('function equipItem(');assert(start>=0);
 const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 let body=source.slice(start,end);
 body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\n  const old=INV.equipped[');
 body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');
 return source.slice(0,start)+body+source.slice(end);
}
export function applyFavSelectionPrunePatch(source){
 return once(source,'for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}','for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}');
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 getBoundingClientRect(){return {left:0,top:0};}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyFavSelectionPrunePatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['_gpInvNav','salvageVal','mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const salStart=s.indexOf('  // ── 선택분해 버튼 갱신 ──',be),salEnd=s.indexOf('  // ── 전체 쓰레기 지정 버튼 ──',salStart);
  const salvage=record?ref(file,'actual selected-salvage render/button block',s,salStart,salEnd):s.slice(salStart,salEnd);
  const pruning=s.includes("if(idx>=INV.bag.length||INV.bag[idx]?.fav)")?"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}":"for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}";
  assert(s.includes(pruning));
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);
  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');
  const moveStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mousemove'",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;
  const upStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mouseup'",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;
  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);

  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return 'const _BIC=false;const location={search:"?demo"};\n'+cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+pruning+'\n'+bag+'\n'+salvage+'\n}\nfunction inventoryKey(e){'+key+'}\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 async function run(mode,usePatch){
  const grid=new Node(),panel=new Node(),salvageBtn=new Node('button');grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  let A;
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:mode==='lock'&&i===3,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invSalvageBtn'?salvageBtn:id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,
   gameConfirm:async()=>true,SFX:{pickup:observer('pickup')},dbSaveNow:observer('save'),statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};
  pushPickup(X);
  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);
  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;
  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);
  const factorySnapshot=JSON.parse(JSON.stringify(A));
  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));
  pushPickup(B);
  c.invFilter.slot='armor';
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  const bCard=grid.querySelectorAll('.inv-item').find(card=>card.dataset.inventoryBagIndex==='1');
  bCard.onclick({ctrlKey:true});
  assert(c._invSalSel.has(1));
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(card=>card.dataset.inventoryBagIndex==='1');
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  if(mode==='lock')vm.runInContext('_gpInvNav()',c);
  const selectedBeforeSalvage=[...c._invSalSel].map(i=>c.INV.bag[i]?.id),matsBeforeSalvage=c.G.mats;
  const selectionAfterLock=[...c._invSalSel],locked=!!A.fav;
  if(c._invSalSel.size)await salvageBtn.onclick();else assert.equal(salvageBtn.style.display,'none');
  const salvageOutcome={selectionAfterLock,locked,hasGenerated:c.INV.bag.includes(A),selectedBeforeSalvage,bag:c.INV.bag.map(it=>it.id),matsDelta:c.G.mats-matsBeforeSalvage,hasB:c.INV.bag.includes(B),hasOld:c.INV.bag.includes(old),equippedId:c.INV.equipped.armor?.id};
  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};
  const equipped=c.INV.equipped.armor;
  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={salvageOutcome,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const red=await run('lock',false),green=await run('lock',true);
 assert.equal(red.salvageOutcome.locked,true);assert.equal(red.salvageOutcome.hasGenerated,false);assert.equal(red.salvageOutcome.matsDelta,1000);
 assert.equal(green.salvageOutcome.locked,true);assert.deepEqual(green.salvageOutcome.selectionAfterLock,[]);assert.equal(green.salvageOutcome.hasGenerated,true);assert.equal(green.salvageOutcome.matsDelta,0);
 groups.push(file+': live Ctrl-select generated armor→whole actual gamepad Y lock→current selected-salvage UI; original deletes locked object, candidate clears selection');
 const normal=await run('noLock',false),normalCandidate=await run('noLock',true);assert.deepEqual(normal.salvageOutcome,normalCandidate.salvageOutcome);assert.equal(normal.salvageOutcome.hasGenerated,false);assert.equal(normal.salvageOutcome.matsDelta,1000);
 groups.push(file+': unlocked selected generated armor salvage unchanged');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'selected item becomes fav via whole gp Y; current salvage lock invariant',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,salvageOutcome:r.salvageOutcome})),anchors:anchors.filter(a=>/_gpInvNav|salvageVal|selected-salvage/.test(a.label)),patches,sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,sha:sha(docs.stdout)},stubs:['synthetic DOM/full focus layout not executed','gameConfirm resolved true only; actual confirm UI not executed','audio/stats/save observers','dropBonus1,random.22 ordinaryarmor actualfactory'],productionApplied:false,runtimeAccepted:false,newFiles:0,exit:0}));

```

```json
{
  "chunk_id": "74cb09",
  "wall_time_seconds": 0.37426725,
  "exit_code": 0,
  "original_token_count": 1161,
  "output": "{\"task\":\"selected item becomes fav via whole gp Y; current salvage lock invariant\",\"startedUTC\":\"2026-10-02T13:16:46.970Z\",\"endedUTC\":\"2026-10-02T13:16:47.445Z\",\"groups\":[\"game.html: live Ctrl-select generated armor→whole actual gamepad Y lock→current selected-salvage UI; original deletes locked object, candidate clears selection\",\"game.html: unlocked selected generated armor salvage unchanged\",\"game-easy-test.html: live Ctrl-select generated armor→whole actual gamepad Y lock→current selected-salvage UI; original deletes locked object, candidate clears selection\",\"game-easy-test.html: unlocked selected generated armor salvage unchanged\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"lock\",\"salvageOutcome\":{\"selectionAfterLock\":[1],\"locked\":true,\"hasGenerated\":false,\"selectedBeforeSalvage\":[12345.22],\"bag\":[\"X\",\"B\"],\"matsDelta\":1000,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game.html\",\"mode\":\"lock\",\"salvageOutcome\":{\"selectionAfterLock\":[],\"locked\":true,\"hasGenerated\":true,\"selectedBeforeSalvage\":[],\"bag\":[\"X\",12345.22,\"B\"],\"matsDelta\":0,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game.html\",\"mode\":\"noLock\",\"salvageOutcome\":{\"selectionAfterLock\":[1],\"locked\":false,\"hasGenerated\":false,\"selectedBeforeSalvage\":[12345.22],\"bag\":[\"X\",\"B\"],\"matsDelta\":1000,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game.html\",\"mode\":\"noLock\",\"salvageOutcome\":{\"selectionAfterLock\":[1],\"locked\":false,\"hasGenerated\":false,\"selectedBeforeSalvage\":[12345.22],\"bag\":[\"X\",\"B\"],\"matsDelta\":1000,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game-easy-test.html\",\"mode\":\"lock\",\"salvageOutcome\":{\"selectionAfterLock\":[1],\"locked\":true,\"hasGenerated\":false,\"selectedBeforeSalvage\":[12345.22],\"bag\":[\"X\",\"B\"],\"matsDelta\":1000,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game-easy-test.html\",\"mode\":\"lock\",\"salvageOutcome\":{\"selectionAfterLock\":[],\"locked\":true,\"hasGenerated\":true,\"selectedBeforeSalvage\":[],\"bag\":[\"X\",12345.22,\"B\"],\"matsDelta\":0,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game-easy-test.html\",\"mode\":\"noLock\",\"salvageOutcome\":{\"selectionAfterLock\":[1],\"locked\":false,\"hasGenerated\":false,\"selectedBeforeSalvage\":[12345.22],\"bag\":[\"X\",\"B\"],\"matsDelta\":1000,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}},{\"file\":\"game-easy-test.html\",\"mode\":\"noLock\",\"salvageOutcome\":{\"selectionAfterLock\":[1],\"locked\":false,\"hasGenerated\":false,\"selectedBeforeSalvage\":[12345.22],\"bag\":[\"X\",\"B\"],\"matsDelta\":1000,\"hasB\":true,\"hasOld\":false,\"equippedId\":\"OLD\"}}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"_gpInvNav\",\"line\":13653,\"sha256\":\"4bfa67a41569c80d2881abdc6276193f509fb7c50989378d2926cae21402971c\",\"bytes\":9979},{\"file\":\"game.html\",\"label\":\"salvageVal\",\"line\":26980,\"sha256\":\"b9f8e160dca1b2486c5cc8c7933751918cc638d4f24d41cc117718893b657580\",\"bytes\":741},{\"file\":\"game.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":48778,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014},{\"file\":\"game-easy-test.html\",\"label\":\"_gpInvNav\",\"line\":13050,\"sha256\":\"cf33bcd8890a171d261086ae33cf40a823c5dac0105f2f70b340b4cf86db30c6\",\"bytes\":9954},{\"file\":\"game-easy-test.html\",\"label\":\"salvageVal\",\"line\":25855,\"sha256\":\"b9f8e160dca1b2486c5cc8c7933751918cc638d4f24d41cc117718893b657580\",\"bytes\":741},{\"file\":\"game-easy-test.html\",\"label\":\"actual selected-salvage render/button block\",\"line\":47354,\"sha256\":\"3fe5714fe2569460d68d3471e7b862a9b0b8d535f39dd4913b864da9f7062e72\",\"bytes\":1014}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\"afterSHA\":\"97660be9aaed77febf976a3198338cd42f774c2c3abc95159546fa8c58f94e21\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\"afterSHA\":\"82a941815b61734b9e82039236e6ac32330ad088570838a6eeeb9276aa669e38\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":126,\"sha\":\"9175c37d1dae715252d0b5450a7fa8b8a709a4f72f1795c3f9cf2f597b51effd\"},\"stubs\":[\"synthetic DOM/full focus layout not executed\",\"gameConfirm resolved true only; actual confirm UI not executed\",\"audio/stats/save observers\",\"dropBonus1,random.22 ordinaryarmor actualfactory\"],\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"exit\":0}\n"
}
```

## actual generated inventory JSON

Script store: item_actual_drop_save_bridge_script; tool receipt store: item_actual_drop_save_bridge_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 getBoundingClientRect(){return {left:0,top:0};}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=source;
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(source),replacements:0});
 const saveAt=source.indexOf('inv:{bag:INV.bag',source.indexOf('async function dbSave(')),saveBegin=saveAt+4;
 const saveAst=parseExpressionAt(source,saveBegin,{ecmaVersion:'latest'});const invAst=saveAst.type==='SequenceExpression'?saveAst.expressions[0]:saveAst;assert.equal(invAst.type,'ObjectExpression');const invExpression=ref(file,'actual dbSave inv expression',source,saveBegin,invAst.end);
 const restoreAt=source.indexOf('function dbRestore(');
 const restoreNames=['INV.bag=','INV.equipped=','CRYSTAL_BAG='];
 const restoreStatements=restoreNames.map(n=>{const start=source.indexOf(n,restoreAt);assert(start>=0);return ref(file,'actual dbRestore '+n,source,start,source.indexOf(';',start)+1);}).join('\n');
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['mkItem','rollAffixes','rollDrop','_wiPush','_minPickLvThr','pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','DROP_SLOT_POOL','_AFSLOT','AFFIX_POOL','IMPLICIT_TABLE','CHAPTER_STAGES','TOTAL_STAGES','SI_TO_HELL','_DEMO_MODE','_DEMO_AFFIX_BANNED','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);
  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');
  const moveStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mousemove'",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;
  const upStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mouseup'",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;
  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);

  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return 'const _BIC=false;const location={search:"?demo"};\n'+cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+bag+'\n}\nfunction inventoryKey(e){'+key+'}\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 function run(mode,usePatch){
  const grid=new Node(),panel=new Node();grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  let A;
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,dropSfx:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,
   statDropBonus:()=>1,playItemDropSfx:observer('dropSfx'),OPT:{minPickRar:0,minPickLvTier:0},INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{stage:0,mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  c.countRng=()=>{trace.rng++;};vm.runInContext('Date.now=()=>12345;Math.random=()=>{countRng();return .22}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  const pushPickup=item=>{const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));};
  pushPickup(X);
  c.worldItems=[];vm.runInContext('rollDrop({ib:false,etype:0,elite:0,dropTier:0,x:0,y:0})',c);
  assert.equal(c.worldItems.length,1);const realWorld=c.worldItems[0];A=realWorld.item;
  assert.equal(A.slot,'armor');assert.equal(A.rarity,0);assert.equal(A.socketCount,1);
  const factorySnapshot=JSON.parse(JSON.stringify(A));
  vm.runInContext('rPickup()',c);assert(realWorld.picked);assert(c.INV.bag.includes(A));
  pushPickup(B);
  if(mode==='filtered')c.invFilter.slot='armor';
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(card=>card.dataset.inventoryBagIndex==='1');
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  vm.runInContext('inventoryKey({code:"KeyY",preventDefault(){}})',c);
  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};
  const equipped=c.INV.equipped.armor;
  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  assert.equal(equipped,A);assert(!c.INV.bag.includes(A));assert.equal(A.crystals[0],crystal);assert.equal(c.G.mats,8500);assert.equal(A.enh,3);assert.equal(trace.dropSfx,1);assert.equal(c.CRYSTAL_BAG.length,0);c.CRYSTAL_BAG.push({id:crystal.id,star:1,enh:0});
  c.invExpression=invExpression;
  const savedInv=vm.runInContext('('+invExpression+')',c);
  const blob=JSON.stringify({inv:savedInv,crystalBag:c.CRYSTAL_BAG});
  const originalEquipped=equipped,originalBag=c.INV.bag,originalCrystal=A.crystals[0];
  c.d=JSON.parse(blob);c.INV.bag=[];c.INV.equipped={};c.CRYSTAL_BAG=[];
  vm.runInContext(restoreStatements,c);
  const restored=c.INV.equipped.armor;
  assert.notEqual(restored,originalEquipped);assert.notEqual(c.INV.bag,originalBag);assert.notEqual(restored.crystals[0],originalCrystal);
  assert.deepEqual(JSON.parse(JSON.stringify(restored)),JSON.parse(JSON.stringify(originalEquipped)));
  assert.equal(restored.id,A.id);assert.equal(restored.enh,3);assert.equal(c.INV.bag.filter(i=>i.id===A.id).length,0);
  assert.equal(restored.crystals.filter(Boolean).length+c.CRYSTAL_BAG.length,2);
  const restoreSummary={bag:c.INV.bag.map(it=>it.id),equippedId:restored.id,enh:restored.enh,crystals:restored.crystals,crystalBag:c.CRYSTAL_BAG,totalCrystalObjects:2,newObjectAfterJSON:restored!==originalEquipped,savedBytes:Buffer.byteLength(blob)};
  const row={restoreSummary,file,mode,factorySnapshot,generatedId:A.id,generatedEquippedIdentity:equipped===realWorld.item,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const restored=run('filtered',false);
 groups.push(file+': actual generated item→filtered KeyY equip→dbSave inv expression→memory JSON→dbRestore inventory+crystal statements preserves fields; not DB/whole restore');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'fresh ordinary factory→current KeyY→actual inventory save/restore slices; independent memory JSON bridge',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole rollDrop/mkItem/rollAffixes/_wiPush/minimum picker; deterministic RNG .22, real ordinary armor at stage0','whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','old equipped armor/excluded boots/other armor synthetic legal controls','statDropBonus observer=1; source drop bonus stats not executed','kill caller/battle/death/revival/native/browser not executed; actual rollDrop explicitly invoked'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify({task:evidence.task,startedUTC:evidence.startedUTC,endedUTC:evidence.endedUTC,groups,rows:rows.map(r=>({file:r.file,mode:r.mode,factorySnapshot:r.factorySnapshot,generatedEquippedIdentity:r.generatedEquippedIdentity,after:r.after,restoreSummary:r.restoreSummary,rngCalls:r.trace.rng})),anchors:anchors.filter(a=>/dbSave|dbRestore|mkItem|rollDrop|KeyY/.test(a.label)),sourceEnd:evidence.sourceEnd,docsSearch:{command:['rg','-n','rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},limits:['synthetic DOM/events/stat/audio/save observers','whole dbSave/dbRestore/DB not executed; only actual inv expression and3restore statements+memory JSON','shared mats persistence not executed','battle/death/revive not executed'],newFiles:0,productionApplied:false,runtimeAccepted:false,exit:0}));

```

```json
{
  "chunk_id": "8a945a",
  "wall_time_seconds": 0.336068458,
  "exit_code": 0,
  "original_token_count": 1442,
  "output": "{\"task\":\"fresh ordinary factory→current KeyY→actual inventory save/restore slices; independent memory JSON bridge\",\"startedUTC\":\"2026-10-02T13:11:27.408Z\",\"endedUTC\":\"2026-10-02T13:11:27.843Z\",\"groups\":[\"game.html: actual generated item→filtered KeyY equip→dbSave inv expression→memory JSON→dbRestore inventory+crystal statements preserves fields; not DB/whole restore\",\"game-easy-test.html: actual generated item→filtered KeyY equip→dbSave inv expression→memory JSON→dbRestore inventory+crystal statements preserves fields; not DB/whole restore\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"filtered\",\"factorySnapshot\":{\"id\":12345.22,\"slot\":\"armor\",\"el\":1,\"rarity\":0,\"tier\":0,\"name\":\"불꽃 갑옷\",\"emoji\":\"🦺\",\"def\":18,\"bonusSt\":16,\"charge\":7,\"chargeDist\":22,\"chargeW\":11,\"bonusRange\":0,\"bonusChargeDist\":0,\"bonusHp\":18,\"affixes\":[],\"_implicitStat\":\"_iPhysDR\",\"_implicitVal\":4.1,\"_implicitKo\":\"물리 피해감소 +X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"generatedEquippedIdentity\":true,\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":8500},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":8500,\"equipped\":12345.22,\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"restoreSummary\":{\"bag\":[\"X\",\"B\",\"OLD\"],\"equippedId\":12345.22,\"enh\":3,\"crystals\":[{\"id\":\"cr_martyr_tear\",\"enh\":0,\"star\":0}],\"crystalBag\":[{\"id\":\"cr_martyr_tear\",\"star\":1,\"enh\":0}],\"totalCrystalObjects\":2,\"newObjectAfterJSON\":true,\"savedBytes\":1104},\"rngCalls\":46},{\"file\":\"game-easy-test.html\",\"mode\":\"filtered\",\"factorySnapshot\":{\"id\":12345.22,\"slot\":\"armor\",\"el\":1,\"rarity\":0,\"tier\":0,\"name\":\"불꽃 갑옷\",\"emoji\":\"🦺\",\"def\":18,\"bonusSt\":16,\"charge\":7,\"chargeDist\":22,\"chargeW\":11,\"bonusRange\":0,\"bonusChargeDist\":0,\"bonusHp\":18,\"affixes\":[],\"_implicitStat\":\"_iPhysDR\",\"_implicitVal\":4.1,\"_implicitKo\":\"물리 피해감소 +X%\",\"legendarySpecial\":null,\"uniqueSpecial\":null,\"itemLv\":10,\"reqLv\":0,\"socketCount\":1,\"crystals\":[null]},\"generatedEquippedIdentity\":true,\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":8500},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":8500,\"equipped\":12345.22,\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"restoreSummary\":{\"bag\":[\"X\",\"B\",\"OLD\"],\"equippedId\":12345.22,\"enh\":3,\"crystals\":[{\"id\":\"cr_hp\",\"enh\":0,\"star\":0}],\"crystalBag\":[{\"id\":\"cr_hp\",\"star\":1,\"enh\":0}],\"totalCrystalObjects\":2,\"newObjectAfterJSON\":true,\"savedBytes\":1086},\"rngCalls\":46}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"actual dbSave inv expression\",\"line\":3537,\"sha256\":\"95a7dc156f09665c7d31d75810d5a26bb9f941b56096c2923006ad8d4d7a26cf\",\"bytes\":65},{\"file\":\"game.html\",\"label\":\"actual dbRestore INV.bag=\",\"line\":3615,\"sha256\":\"4880711748e26c04c5bf8aaec88a9ffb4f46ea071059752c9c4d8ccf21d06a7e\",\"bytes\":22},{\"file\":\"game.html\",\"label\":\"actual dbRestore INV.equipped=\",\"line\":3616,\"sha256\":\"650a476c7d26fd334bee264590162b8450ed07f96ff0a4a5f93a41c708ca8003\",\"bytes\":233},{\"file\":\"game.html\",\"label\":\"actual dbRestore CRYSTAL_BAG=\",\"line\":3740,\"sha256\":\"470ffba9f6484cff5587f2ad131c6c2ed19112e36d6a92062b41e1e46027fb91\",\"bytes\":29},{\"file\":\"game.html\",\"label\":\"mkItem\",\"line\":15183,\"sha256\":\"1ee1820b55f373a6db3c2041b359c393ebab34c3006972924d50cf1476373aa1\",\"bytes\":26245},{\"file\":\"game.html\",\"label\":\"rollDrop\",\"line\":30798,\"sha256\":\"99e4af8f5cc7193a01fc63e0d0e5e50ca4a5d271693d67c21fc5a15a843a7fc0\",\"bytes\":3951},{\"file\":\"game.html\",\"label\":\"actual inventory KeyY block\",\"line\":12765,\"sha256\":\"8e2331f191ae5ebe2ef63b4640f03bab49681695394c09d9d621ebc7309697d5\",\"bytes\":826},{\"file\":\"game-easy-test.html\",\"label\":\"actual dbSave inv expression\",\"line\":3310,\"sha256\":\"95a7dc156f09665c7d31d75810d5a26bb9f941b56096c2923006ad8d4d7a26cf\",\"bytes\":65},{\"file\":\"game-easy-test.html\",\"label\":\"actual dbRestore INV.bag=\",\"line\":3387,\"sha256\":\"4880711748e26c04c5bf8aaec88a9ffb4f46ea071059752c9c4d8ccf21d06a7e\",\"bytes\":22},{\"file\":\"game-easy-test.html\",\"label\":\"actual dbRestore INV.equipped=\",\"line\":3388,\"sha256\":\"c93fc3af1121aacb2fa05fc2ebe00b26242db4a01b250f8ca79ff90ac227025c\",\"bytes\":218},{\"file\":\"game-easy-test.html\",\"label\":\"actual dbRestore CRYSTAL_BAG=\",\"line\":3511,\"sha256\":\"470ffba9f6484cff5587f2ad131c6c2ed19112e36d6a92062b41e1e46027fb91\",\"bytes\":29},{\"file\":\"game-easy-test.html\",\"label\":\"mkItem\",\"line\":14307,\"sha256\":\"1a07dde50c299aceb1d34a3fdd8e122d08fe42d5ca71b2827d0806f9336a0c3d\",\"bytes\":26141},{\"file\":\"game-easy-test.html\",\"label\":\"rollDrop\",\"line\":29618,\"sha256\":\"99e4af8f5cc7193a01fc63e0d0e5e50ca4a5d271693d67c21fc5a15a843a7fc0\",\"bytes\":3951},{\"file\":\"game-easy-test.html\",\"label\":\"actual inventory KeyY block\",\"line\":12161,\"sha256\":\"8e2331f191ae5ebe2ef63b4640f03bab49681695394c09d9d621ebc7309697d5\",\"bytes\":826}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"rollDrop|mkItem|DROP_SLOT_POOL|_wiPush|KeyY|inventoryBagIndex|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":126,\"stdoutSHA256\":\"857f3e3c7174a5314c6535ba5e50e6b3f6704db182235ee42bdf39ec91bd0754\"},\"limits\":[\"synthetic DOM/events/stat/audio/save observers\",\"whole dbSave/dbRestore/DB not executed; only actual inv expression and3restore statements+memory JSON\",\"shared mats persistence not executed\",\"battle/death/revive not executed\"],\"newFiles\":0,\"productionApplied\":false,\"runtimeAccepted\":false,\"exit\":0}\n"
}
```

## drag lifetime identity

Script store: item_drag_identity_script; tool receipt store: item_drag_identity_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 getBoundingClientRect(){return {left:0,top:0};}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyItemDragIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);
  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');
  const moveStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mousemove'",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;
  const upStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mouseup'",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;
  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);

  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+bag+'\n}\nfunction inventoryKey(e){'+key+'}\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 function run(mode,usePatch){
  const grid=new Node(),panel=new Node();grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  const A={id:'A',slot:'armor',name:'chosen',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,
   INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  vm.runInContext('Date.now=()=>12345;Math.random=()=>{throw Error("unexpected RNG")}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  for(const item of [X,A,B]){const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));}
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards[1];
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  chosen.onmousedown({button:0,preventDefault(){}});
  if(mode==='equip')vm.runInContext('inventoryKey({code:"KeyY",preventDefault(){}})',c);
  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],mats:c.G.mats};
  vm.runInContext('dragMove({clientX:336,clientY:240});dragUp({clientX:336,clientY:240})',c);
  const equipped=c.INV.equipped.armor;
  const after={beforeRelease,Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={file,mode,patched:usePatch,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const red=run('equip',false),green=run('equip',true);assert.deepEqual(red.after.Bpos,[6,4]);assert.deepEqual(green.after.Bpos,green.after.beforeRelease.B);assert.equal(green.after.equipped,'A');assert.equal(green.after.dragActive,false);assert.equal(green.after.mats,8500);assert.equal(green.after.crystalTotal,1);groups.push(file+': actual card mousedown→Y equip→mousemove/up original moves B; identity guard skips removed A and preserves B');
 const normal=run('normal',false),normalCandidate=run('normal',true);assert.deepEqual(normal.after,normalCandidate.after);assert.deepEqual(normal.trace,normalCandidate.trace);assert.deepEqual(normal.events,normalCandidate.events);assert.deepEqual(normal.after.Apos,[6,4]);groups.push(file+': uninterrupted actual drag state/resource/observer equivalent');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'active ITEM goal: drag lifetime after keyboard equip actual source chain',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','synthetic legal ordinary loot items, actual rollDrop/combat not executed'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify(evidence));

```

```json
{
  "chunk_id": "e127b5",
  "wall_time_seconds": 0.230401542,
  "exit_code": 0,
  "original_token_count": 5685,
  "output": "{\"task\":\"active ITEM goal: drag lifetime after keyboard equip actual source chain\",\"startedUTC\":\"2026-10-02T12:56:42.771Z\",\"endedUTC\":\"2026-10-02T12:56:43.102Z\",\"groups\":[\"game.html: actual card mousedown→Y equip→mousemove/up original moves B; identity guard skips removed A and preserves B\",\"game.html: uninterrupted actual drag state/resource/observer equivalent\",\"game-easy-test.html: actual card mousedown→Y equip→mousemove/up original moves B; identity guard skips removed A and preserves B\",\"game-easy-test.html: uninterrupted actual drag state/resource/observer equivalent\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"equip\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":8500},\"Apos\":[2,0],\"Bpos\":[6,4],\"dragActive\":false,\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"equip\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[null,null,null],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":8500},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"normal\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":10000},\"Apos\":[6,4],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game.html\",\"mode\":\"normal\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[null,null,null],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":10000},\"Apos\":[6,4],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"equip\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":8500},\"Apos\":[2,0],\"Bpos\":[6,4],\"dragActive\":false,\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"equip\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[null,null,null],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":8500},\"Apos\":[2,0],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"normal\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":10000},\"Apos\":[6,4],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"normal\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[null,null,null],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[2,0],\"B\":[4,0],\"mats\":10000},\"Apos\":[6,4],\"Bpos\":[4,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"pickupItem\",\"line\":15681,\"sha256\":\"ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c\",\"bytes\":1786},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15577,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"_invBagRightClick\",\"line\":46970,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game.html\",\"label\":\"_invRows\",\"line\":15465,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game.html\",\"label\":\"_itemSz\",\"line\":15467,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game.html\",\"label\":\"_invCategoryKey\",\"line\":15472,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"_invGrid\",\"line\":15473,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game.html\",\"label\":\"_invFindSpace\",\"line\":15484,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game.html\",\"label\":\"_invCanPlace\",\"line\":15537,\"sha256\":\"77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90\",\"bytes\":322},{\"file\":\"game.html\",\"label\":\"xferCost\",\"line\":26894,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game.html\",\"label\":\"_malCost\",\"line\":26874,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game.html\",\"label\":\"_itemEconomyRarity\",\"line\":26979,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game.html\",\"label\":\"enhColor\",\"line\":26898,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game.html\",\"label\":\"_invCategoryMatches\",\"line\":48543,\"sha256\":\"bf6f1ec41adb83e63f2e35d8596c546da2270bb74e936a6aebb9a2030c18d9f7\",\"bytes\":277},{\"file\":\"game.html\",\"label\":\"_earringSlot\",\"line\":15562,\"sha256\":\"d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971\",\"bytes\":73},{\"file\":\"game.html\",\"label\":\"_equipSlot\",\"line\":15563,\"sha256\":\"95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e\",\"bytes\":165},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15119,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15121,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15122,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15123,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26873,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14629,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14630,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14631,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14633,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14635,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14726,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":48696,\"sha256\":\"dc09da97601fbaeb2267580621f7589cab2e0f1aafa35c1f34dd19ab42d0812e\",\"bytes\":4308},{\"file\":\"game.html\",\"label\":\"actual inventory KeyY block\",\"line\":12765,\"sha256\":\"1976ad1d060f845d1e174e55b145046ac52675a992acb0eb73cfdecd243db4e4\",\"bytes\":757},{\"file\":\"game.html\",\"label\":\"actual drag mousemove\",\"line\":48371,\"sha256\":\"9bb9584579d9d8553b9431223a992aedae4618695079dba59d4aa9eb76618197\",\"bytes\":701},{\"file\":\"game.html\",\"label\":\"actual drag mouseup\",\"line\":48386,\"sha256\":\"96fae7bf14d4161b5f3ca12b9f2aff60958610d9e8bb27d9dd7c1b61a06dcf59\",\"bytes\":636},{\"file\":\"game.html\",\"label\":\"actual R pickup selection block\",\"line\":31695,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15119,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15121,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15122,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15123,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26873,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14629,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14630,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14631,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14633,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14635,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14726,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"pickupItem\",\"line\":14788,\"sha256\":\"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\"bytes\":2552},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"_invBagRightClick\",\"line\":45573,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game-easy-test.html\",\"label\":\"_invRows\",\"line\":14588,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game-easy-test.html\",\"label\":\"_itemSz\",\"line\":14590,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryKey\",\"line\":14595,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"_invGrid\",\"line\":14596,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game-easy-test.html\",\"label\":\"_invFindSpace\",\"line\":14607,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game-easy-test.html\",\"label\":\"_invCanPlace\",\"line\":14660,\"sha256\":\"77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90\",\"bytes\":322},{\"file\":\"game-easy-test.html\",\"label\":\"xferCost\",\"line\":25769,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game-easy-test.html\",\"label\":\"_malCost\",\"line\":25749,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game-easy-test.html\",\"label\":\"_itemEconomyRarity\",\"line\":25854,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"enhColor\",\"line\":25773,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryMatches\",\"line\":47037,\"sha256\":\"f337c7995d2da57d084269483cf27e265a49c4875e6c9155b311a84334dfcefa\",\"bytes\":240},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":47272,\"sha256\":\"210994f43947ba1d15bb15c611697d4b44d8aeebee555067d43011c59f417854\",\"bytes\":4250},{\"file\":\"game-easy-test.html\",\"label\":\"actual inventory KeyY block\",\"line\":12161,\"sha256\":\"1976ad1d060f845d1e174e55b145046ac52675a992acb0eb73cfdecd243db4e4\",\"bytes\":757},{\"file\":\"game-easy-test.html\",\"label\":\"actual drag mousemove\",\"line\":46865,\"sha256\":\"9bb9584579d9d8553b9431223a992aedae4618695079dba59d4aa9eb76618197\",\"bytes\":701},{\"file\":\"game-easy-test.html\",\"label\":\"actual drag mouseup\",\"line\":46880,\"sha256\":\"96fae7bf14d4161b5f3ca12b9f2aff60958610d9e8bb27d9dd7c1b61a06dcf59\",\"bytes\":636},{\"file\":\"game-easy-test.html\",\"label\":\"actual R pickup selection block\",\"line\":30514,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81\",\"afterSHA\":\"f468a20289a212c7626fbd94e0433d7a704de1a18797177083bbd57c84823177\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515\",\"afterSHA\":\"1b75ccad40df4056e859bdba4b0e4de823c9fc579508ae1ac5d7d2d0ba5ad667\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":613,\"stdoutSHA256\":\"e76fb93fba3630bdce8544f8ae7be2a828f2a500255598a0d3a40c7d60b40399\"},\"actual\":[\"whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers\",\"actual R item-selection block\",\"actual renderInv filter/card loop\",\"whole actual _gpInvNav bag B no cursor branch\",\"live rendered card events, no retained detached callback\"],\"stubs\":[\"DOM Node/MouseEvent dispatch, no browser/native\",\"renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed\",\"detail/UI/stat/SFX/save/lesson observers\",\"synthetic legal ordinary loot items, actual rollDrop/combat not executed\"],\"priorTestsRepeated\":0,\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"errors\":[],\"exit\":0}\n"
}
```

## drag lifetime after sort

Script store: item_drag_sort_script; tool receipt store: item_drag_sort_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 getBoundingClientRect(){return {left:0,top:0};}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyItemDragIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['pickupItem','_invAutoPlace','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual inventory KeyY block',s,ki,ke):s.slice(ki,ke);
  const ds=s.indexOf('let _invDrag=null,_invDragMoved=false;');
  const moveStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mousemove'",ds)),moveEnd=parseExpressionAt(s,moveStart,{ecmaVersion:'latest'}).end;
  const upStart=s.indexOf('function(ev){',s.indexOf("document.addEventListener('mouseup'",ds)),upEnd=parseExpressionAt(s,upStart,{ecmaVersion:'latest'}).end;
  const move=record?ref(file,'actual drag mousemove',s,moveStart,moveEnd):s.slice(moveStart,moveEnd),up=record?ref(file,'actual drag mouseup',s,upStart,upEnd):s.slice(upStart,upEnd);

  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+bag+'\n}\nfunction inventoryKey(e){'+key+'}\nlet _invDrag=null,_GC_SZ=48;const dragMove='+move+';const dragUp='+up+';\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 function run(mode,usePatch){
  const grid=new Node(),panel=new Node();grid.scrollTop=0;panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  const A={id:'A',slot:'armor',name:'chosen',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  B.fav=true;
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,calcCP:()=>({total:0}),_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:id==='_invGhost'?grid.children.find(n=>n.id==='_invGhost')||null:null,
   INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:null,rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  vm.runInContext('Date.now=()=>12345;Math.random=()=>{throw Error("unexpected RNG")}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  for(const item of [X,A,B]){const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));}
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards[1];
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  chosen.onmousedown({button:0,preventDefault(){}});
  vm.runInContext('_invAutoPlace();renderInv()',c);
  const beforeRelease={A:[A._gx,A._gy],B:[B._gx,B._gy],X:[X._gx,X._gy],order:c.INV.bag.map(it=>it.id),mats:c.G.mats};
  vm.runInContext('dragMove({clientX:336,clientY:240});dragUp({clientX:336,clientY:240})',c);
  const equipped=c.INV.equipped.armor;
  const after={beforeRelease,Xpos:[X._gx,X._gy],Apos:[A._gx,A._gy],Bpos:[B._gx,B._gy],dragActive:vm.runInContext('_invDrag!==null',c),mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={file,mode,patched:usePatch,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const red=run('sort',false),green=run('sort',true);assert.deepEqual(red.after.beforeRelease.order,['B','X','A']);assert.deepEqual(red.after.Xpos,[6,4]);assert.deepEqual(red.after.Apos,[4,0]);assert.deepEqual(green.after.Xpos,green.after.beforeRelease.X);assert.deepEqual(green.after.Apos,[6,4]);assert.equal(green.after.dragActive,false);assert.equal(green.after.mats,10000);assert.equal(green.trace.lessonEquip,0);groups.push(file+': actual drag→whole sort→live render→mouseup numeric index moves X, item identity relookup moves original A');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'active ITEM goal: drag lifetime across whole actual inventory sort/rebuild',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','synthetic legal ordinary loot items, actual rollDrop/combat not executed'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify(evidence));

```

```json
{
  "chunk_id": "4d0a6c",
  "wall_time_seconds": 0.21929125,
  "exit_code": 0,
  "original_token_count": 4685,
  "output": "{\"task\":\"active ITEM goal: drag lifetime across whole actual inventory sort/rebuild\",\"startedUTC\":\"2026-10-02T13:01:56.048Z\",\"endedUTC\":\"2026-10-02T13:01:56.366Z\",\"groups\":[\"game.html: actual drag→whole sort→live render→mouseup numeric index moves X, item identity relookup moves original A\",\"game-easy-test.html: actual drag→whole sort→live render→mouseup numeric index moves X, item identity relookup moves original A\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"sort\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[4,0],\"B\":[0,0],\"X\":[2,0],\"order\":[\"B\",\"X\",\"A\"],\"mats\":10000},\"Xpos\":[6,4],\"Apos\":[4,0],\"Bpos\":[0,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"B\",\"X\",\"A\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game.html\",\"mode\":\"sort\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"0\",\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[4,0],\"B\":[0,0],\"X\":[2,0],\"order\":[\"B\",\"X\",\"A\"],\"mats\":10000},\"Xpos\":[2,0],\"Apos\":[6,4],\"Bpos\":[0,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"B\",\"X\",\"A\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"sort\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[4,0],\"B\":[0,0],\"X\":[2,0],\"order\":[\"B\",\"X\",\"A\"],\"mats\":10000},\"Xpos\":[6,4],\"Apos\":[4,0],\"Bpos\":[0,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"B\",\"X\",\"A\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"sort\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"0\",\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"beforeRelease\":{\"A\":[4,0],\"B\":[0,0],\"X\":[2,0],\"order\":[\"B\",\"X\",\"A\"],\"mats\":10000},\"Xpos\":[2,0],\"Apos\":[6,4],\"Bpos\":[0,0],\"dragActive\":false,\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"B\",\"X\",\"A\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"pickupItem\",\"line\":15681,\"sha256\":\"ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c\",\"bytes\":1786},{\"file\":\"game.html\",\"label\":\"_invAutoPlace\",\"line\":15495,\"sha256\":\"71e63d10a44ae6ffde48ca67da127339694220ae4592cb96b489381e830a65f1\",\"bytes\":1664},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15577,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"_invBagRightClick\",\"line\":46970,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game.html\",\"label\":\"_invRows\",\"line\":15465,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game.html\",\"label\":\"_itemSz\",\"line\":15467,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game.html\",\"label\":\"_invCategoryKey\",\"line\":15472,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"_invGrid\",\"line\":15473,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game.html\",\"label\":\"_invFindSpace\",\"line\":15484,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game.html\",\"label\":\"_invCanPlace\",\"line\":15537,\"sha256\":\"77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90\",\"bytes\":322},{\"file\":\"game.html\",\"label\":\"xferCost\",\"line\":26894,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game.html\",\"label\":\"_malCost\",\"line\":26874,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game.html\",\"label\":\"_itemEconomyRarity\",\"line\":26979,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game.html\",\"label\":\"enhColor\",\"line\":26898,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game.html\",\"label\":\"_invCategoryMatches\",\"line\":48543,\"sha256\":\"bf6f1ec41adb83e63f2e35d8596c546da2270bb74e936a6aebb9a2030c18d9f7\",\"bytes\":277},{\"file\":\"game.html\",\"label\":\"_earringSlot\",\"line\":15562,\"sha256\":\"d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971\",\"bytes\":73},{\"file\":\"game.html\",\"label\":\"_equipSlot\",\"line\":15563,\"sha256\":\"95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e\",\"bytes\":165},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15119,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15121,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15122,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15123,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26873,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14629,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14630,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14631,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14633,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14635,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14726,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":48696,\"sha256\":\"49b5ae99a0729034658972dc90574cc07778a7c62e7ad8ae3b6c6ac6f72e9246\",\"bytes\":4353},{\"file\":\"game.html\",\"label\":\"actual inventory KeyY block\",\"line\":12765,\"sha256\":\"8e2331f191ae5ebe2ef63b4640f03bab49681695394c09d9d621ebc7309697d5\",\"bytes\":826},{\"file\":\"game.html\",\"label\":\"actual drag mousemove\",\"line\":48371,\"sha256\":\"9bb9584579d9d8553b9431223a992aedae4618695079dba59d4aa9eb76618197\",\"bytes\":701},{\"file\":\"game.html\",\"label\":\"actual drag mouseup\",\"line\":48386,\"sha256\":\"96fae7bf14d4161b5f3ca12b9f2aff60958610d9e8bb27d9dd7c1b61a06dcf59\",\"bytes\":636},{\"file\":\"game.html\",\"label\":\"actual R pickup selection block\",\"line\":31695,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15119,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15121,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15122,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15123,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26873,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14629,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14630,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14631,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14633,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14635,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14726,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"pickupItem\",\"line\":14788,\"sha256\":\"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\"bytes\":2552},{\"file\":\"game-easy-test.html\",\"label\":\"_invAutoPlace\",\"line\":14618,\"sha256\":\"cddc667abe97e54c9fc618909c0623b6e0cf87fcf0c17e3d300f15b79a3ef9c6\",\"bytes\":1657},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"_invBagRightClick\",\"line\":45573,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game-easy-test.html\",\"label\":\"_invRows\",\"line\":14588,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game-easy-test.html\",\"label\":\"_itemSz\",\"line\":14590,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryKey\",\"line\":14595,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"_invGrid\",\"line\":14596,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game-easy-test.html\",\"label\":\"_invFindSpace\",\"line\":14607,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game-easy-test.html\",\"label\":\"_invCanPlace\",\"line\":14660,\"sha256\":\"77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90\",\"bytes\":322},{\"file\":\"game-easy-test.html\",\"label\":\"xferCost\",\"line\":25769,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game-easy-test.html\",\"label\":\"_malCost\",\"line\":25749,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game-easy-test.html\",\"label\":\"_itemEconomyRarity\",\"line\":25854,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"enhColor\",\"line\":25773,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryMatches\",\"line\":47037,\"sha256\":\"f337c7995d2da57d084269483cf27e265a49c4875e6c9155b311a84334dfcefa\",\"bytes\":240},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":47272,\"sha256\":\"4d2911e75cd0a35c6f951d2e917be1d85cfdee2f2690353d521a7bca40d95155\",\"bytes\":4295},{\"file\":\"game-easy-test.html\",\"label\":\"actual inventory KeyY block\",\"line\":12161,\"sha256\":\"8e2331f191ae5ebe2ef63b4640f03bab49681695394c09d9d621ebc7309697d5\",\"bytes\":826},{\"file\":\"game-easy-test.html\",\"label\":\"actual drag mousemove\",\"line\":46865,\"sha256\":\"9bb9584579d9d8553b9431223a992aedae4618695079dba59d4aa9eb76618197\",\"bytes\":701},{\"file\":\"game-easy-test.html\",\"label\":\"actual drag mouseup\",\"line\":46880,\"sha256\":\"96fae7bf14d4161b5f3ca12b9f2aff60958610d9e8bb27d9dd7c1b61a06dcf59\",\"bytes\":636},{\"file\":\"game-easy-test.html\",\"label\":\"actual R pickup selection block\",\"line\":30514,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\"afterSHA\":\"a563f465a4770e17e0710893c2435ae49b12e6d343791ab1ccb36db4e6d54be0\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\"afterSHA\":\"f9b3773b8012d1e70a60bd688a2d82ff4c953303c8d13751ccac1893d80ba55d\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":611,\"stdoutSHA256\":\"fb2646d550f10a5b5db767436ec795d714a7349fe3f8780ad51c7f58762b4ab9\"},\"actual\":[\"whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers\",\"actual R item-selection block\",\"actual renderInv filter/card loop\",\"whole actual _gpInvNav bag B no cursor branch\",\"live rendered card events, no retained detached callback\"],\"stubs\":[\"DOM Node/MouseEvent dispatch, no browser/native\",\"renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed\",\"detail/UI/stat/SFX/save/lesson observers\",\"synthetic legal ordinary loot items, actual rollDrop/combat not executed\"],\"priorTestsRepeated\":0,\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"errors\":[],\"exit\":0}\n"
}
```

## B whole pad identity

Script store: item_pad_bridge_script; tool receipt store: item_pad_bridge_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemPadBIdentityPatch(source){
 const card="const div=document.createElement('div');div.className='inv-item';";
 if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+"\n    div.dataset.inventoryBagIndex=String(i);");
 return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))');
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyItemPadBIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=f('_gpInvNav');
  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+bag+'\n}\n'+key+'\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 function run(mode,usePatch){
  const grid=new Node(),panel=new Node();panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  const A={id:'A',slot:'armor',name:'chosen',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:null,
   INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:mode==='unfiltered'?null:'armor',rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  vm.runInContext('Date.now=()=>12345;Math.random=()=>{throw Error("unexpected RNG")}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  for(const item of [X,A,B]){const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));}
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(n=>mode==='unfiltered'?n===cards[1]:n===cards[0]);
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  if(mode==='selected')vm.runInContext('_invHover=-1;INV.selected=1',c);
  if(mode==='hidden')vm.runInContext('_gpInvIdx=0;_invHover=-1;INV.selected=0',c);
  if(mode==='last')vm.runInContext('_gpInvIdx=2',c);
  vm.runInContext('_gpInvNav()',c);
  const equipped=c.INV.equipped.armor;
  const after={mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={file,mode,patched:usePatch,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const red=run('filtered',false),green=run('filtered',true);
 assert.equal(red.after.equipped,'B');assert.equal(green.after.equipped,'A');
 assert.equal(green.after.mats,8500);assert.equal(green.after.AEnh,3);assert.equal(green.after.BEnh,0);assert.equal(green.after.oldEnh,0);
 assert.equal(green.after.crystalTotal,1);assert(green.after.crystalIdentity&&green.after.disjoint);assert.equal(green.after.ACrystal,crystalId(file));
 groups.push(file+': R pickup→actual filter/card hover→actual whole _gpInvNav B dispatch wrong B; candidate chooses A and conserves resources');
 const held=run('selected',true);assert.equal(held.after.equipped,'A');groups.push(file+': bag index1 via whole gamepad navigation reaches A');
 const normal=run('unfiltered',false),normalCandidate=run('unfiltered',true);
 assert.deepEqual(normal.after,normalCandidate.after);assert.deepEqual(normal.events,normalCandidate.events);assert.deepEqual(normal.trace,normalCandidate.trace);
 groups.push(file+': unfiltered control state and trace equivalent');
 const hidden=run('hidden',true);assert.equal(hidden.after.equipped,'OLD');assert.equal(hidden.after.mats,10000);assert.equal(hidden.trace.lessonEquip,0);
 groups.push(file+': hidden selected card no fallback to another item');
 const last=run('last',true);assert.equal(last.after.equipped,'B');assert.equal(last.after.crystalTotal,1);
 groups.push(file+': last visible card maps to actual bag index2');
}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'ITEM gamepad B actual caller→equip/resource identity bridge hb1228 (TASK file missing)',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','synthetic legal ordinary loot items, actual rollDrop/combat not executed'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify(evidence));

```

```json
{
  "chunk_id": "063863",
  "wall_time_seconds": 0.208422792,
  "exit_code": 0,
  "original_token_count": 6918,
  "output": "{\"task\":\"ITEM gamepad B actual caller→equip/resource identity bridge hb1228 (TASK file missing)\",\"startedUTC\":\"2026-10-02T12:39:50.496Z\",\"endedUTC\":\"2026-10-02T12:39:50.797Z\",\"groups\":[\"game.html: R pickup→actual filter/card hover→actual whole _gpInvNav B dispatch wrong B; candidate chooses A and conserves resources\",\"game.html: bag index1 via whole gamepad navigation reaches A\",\"game.html: unfiltered control state and trace equivalent\",\"game.html: hidden selected card no fallback to another item\",\"game.html: last visible card maps to actual bag index2\",\"game-easy-test.html: R pickup→actual filter/card hover→actual whole _gpInvNav B dispatch wrong B; candidate chooses A and conserves resources\",\"game-easy-test.html: bag index1 via whole gamepad navigation reaches A\",\"game-easy-test.html: unfiltered control state and trace equivalent\",\"game-easy-test.html: hidden selected card no fallback to another item\",\"game-easy-test.html: last visible card maps to actual bag index2\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"filtered\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"B\",\"bag\":[\"X\",\"A\",\"OLD\"],\"oldEnh\":0,\"AEnh\":0,\"BEnh\":3,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":null,\"BCrystal\":\"cr_martyr_tear\",\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:other 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"filtered\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"selected\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"unfiltered\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"unfiltered\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"0\",\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"hidden\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game.html\",\"mode\":\"last\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"B\",\"bag\":[\"X\",\"A\",\"OLD\"],\"oldEnh\":0,\"AEnh\":0,\"BEnh\":3,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":null,\"BCrystal\":\"cr_martyr_tear\",\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:other 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"filtered\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"B\",\"bag\":[\"X\",\"A\",\"OLD\"],\"oldEnh\":0,\"AEnh\":0,\"BEnh\":3,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":null,\"BCrystal\":\"cr_hp\",\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:other 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"filtered\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"selected\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"unfiltered\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"unfiltered\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"0\",\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"hidden\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"last\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"B\",\"bag\":[\"X\",\"A\",\"OLD\"],\"oldEnh\":0,\"AEnh\":0,\"BEnh\":3,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":null,\"BCrystal\":\"cr_hp\",\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:other 장착!\",\"lessonEquip\",\"save\",\"apply\"]}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"pickupItem\",\"line\":15678,\"sha256\":\"ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c\",\"bytes\":1786},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15574,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"_invBagRightClick\",\"line\":46967,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game.html\",\"label\":\"_invRows\",\"line\":15462,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game.html\",\"label\":\"_itemSz\",\"line\":15464,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game.html\",\"label\":\"_invCategoryKey\",\"line\":15469,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"_invGrid\",\"line\":15470,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game.html\",\"label\":\"_invFindSpace\",\"line\":15481,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game.html\",\"label\":\"xferCost\",\"line\":26891,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game.html\",\"label\":\"_malCost\",\"line\":26871,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game.html\",\"label\":\"_itemEconomyRarity\",\"line\":26976,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game.html\",\"label\":\"enhColor\",\"line\":26895,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game.html\",\"label\":\"_invCategoryMatches\",\"line\":48540,\"sha256\":\"bf6f1ec41adb83e63f2e35d8596c546da2270bb74e936a6aebb9a2030c18d9f7\",\"bytes\":277},{\"file\":\"game.html\",\"label\":\"_earringSlot\",\"line\":15559,\"sha256\":\"d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971\",\"bytes\":73},{\"file\":\"game.html\",\"label\":\"_equipSlot\",\"line\":15560,\"sha256\":\"95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e\",\"bytes\":165},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15116,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15118,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15119,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15120,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26870,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14626,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14627,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14628,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14630,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14632,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14723,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":48693,\"sha256\":\"dc09da97601fbaeb2267580621f7589cab2e0f1aafa35c1f34dd19ab42d0812e\",\"bytes\":4308},{\"file\":\"game.html\",\"label\":\"_gpInvNav\",\"line\":13650,\"sha256\":\"4bfa67a41569c80d2881abdc6276193f509fb7c50989378d2926cae21402971c\",\"bytes\":9979},{\"file\":\"game.html\",\"label\":\"actual R pickup selection block\",\"line\":31692,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15116,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15118,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15119,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15120,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26870,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14626,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14627,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14628,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14630,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14632,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14723,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"pickupItem\",\"line\":14785,\"sha256\":\"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\"bytes\":2552},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14682,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"_invBagRightClick\",\"line\":45570,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game-easy-test.html\",\"label\":\"_invRows\",\"line\":14585,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game-easy-test.html\",\"label\":\"_itemSz\",\"line\":14587,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryKey\",\"line\":14592,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"_invGrid\",\"line\":14593,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game-easy-test.html\",\"label\":\"_invFindSpace\",\"line\":14604,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game-easy-test.html\",\"label\":\"xferCost\",\"line\":25766,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game-easy-test.html\",\"label\":\"_malCost\",\"line\":25746,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game-easy-test.html\",\"label\":\"_itemEconomyRarity\",\"line\":25851,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"enhColor\",\"line\":25770,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryMatches\",\"line\":47034,\"sha256\":\"f337c7995d2da57d084269483cf27e265a49c4875e6c9155b311a84334dfcefa\",\"bytes\":240},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14240,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14242,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14243,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14244,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25745,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14023,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14024,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14025,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14027,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14028,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14087,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":47269,\"sha256\":\"210994f43947ba1d15bb15c611697d4b44d8aeebee555067d43011c59f417854\",\"bytes\":4250},{\"file\":\"game-easy-test.html\",\"label\":\"_gpInvNav\",\"line\":13047,\"sha256\":\"cf33bcd8890a171d261086ae33cf40a823c5dac0105f2f70b340b4cf86db30c6\",\"bytes\":9954},{\"file\":\"game-easy-test.html\",\"label\":\"actual R pickup selection block\",\"line\":30511,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14240,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14242,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14243,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14244,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25745,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14023,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14024,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14025,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14027,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14028,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14087,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2\",\"afterSHA\":\"3e9dcf87d5b34aeac5342029bc039c95f8f4ae1163396ec66e47a51c4a96e0b5\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a\",\"afterSHA\":\"4bcc8d667627c7eceecb4e06fc5ecf42f83a1fea7a79507334d0732591f861f2\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":613,\"stdoutSHA256\":\"86e20bad564a869c65f0fd295f25cc16575c5e117545f800b036b0d215f74305\"},\"actual\":[\"whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers\",\"actual R item-selection block\",\"actual renderInv filter/card loop\",\"whole actual _gpInvNav bag B no cursor branch\",\"live rendered card events, no retained detached callback\"],\"stubs\":[\"DOM Node/MouseEvent dispatch, no browser/native\",\"renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed\",\"detail/UI/stat/SFX/save/lesson observers\",\"synthetic legal ordinary loot items, actual rollDrop/combat not executed\"],\"priorTestsRepeated\":0,\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"errors\":[],\"exit\":0}\n"
}
```

## B lifecycle

Script store: item_pad_bridge_lifecycle_script; tool receipt store: item_pad_bridge_lifecycle_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemPadBIdentityPatch(source){
 const card="const div=document.createElement('div');div.className='inv-item';";
 if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+"\n    div.dataset.inventoryBagIndex=String(i);");
 return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))');
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert(['contextmenu','mouseover','mouseleave'].includes(e.type));this['on'+e.type]?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyItemPadBIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=f('_gpInvNav');
  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+bag+'\n}\n'+key+'\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 function run(mode,usePatch){
  const grid=new Node(),panel=new Node();panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  const A={id:'A',slot:'armor',name:'chosen',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:null,
   INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:mode==='unfiltered'?null:'armor',rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  vm.runInContext('Date.now=()=>12345;Math.random=()=>{throw Error("unexpected RNG")}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  for(const item of [X,A,B]){const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));}
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(n=>mode==='unfiltered'?n===cards[1]:n===cards[0]);
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  if(mode==='selected')vm.runInContext('_invHover=-1;INV.selected=1',c);
  if(mode==='hidden')vm.runInContext('_gpInvIdx=0;_invHover=-1;INV.selected=0',c);
  if(mode==='last')vm.runInContext('_gpInvIdx=2',c);
  if(mode==='ab')c._gpad.buttons[0].pressed=true;
  if(mode==='virtual'){c._gpVC.vis=true;c.document.elementFromPoint=()=>grid.querySelectorAll('.inv-item')[0];}
  vm.runInContext('_gpInvNav()',c);
  if(mode==='held'){const beforeHeld=JSON.stringify({bag:c.INV.bag,eq:c.INV.equipped,mats:c.G.mats,trace});vm.runInContext('_gpInvNav()',c);assert.equal(JSON.stringify({bag:c.INV.bag,eq:c.INV.equipped,mats:c.G.mats,trace}),beforeHeld);}
  const equipped=c.INV.equipped.armor;
  const after={mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={file,mode,patched:usePatch,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const held=run('held',true);assert.equal(held.after.equipped,'A');assert.equal(held.trace.lessonEquip,1);groups.push(file+': held B next frame skips second equip/save/resource deduction');
 const ab=run('ab',true);assert.equal(ab.after.equipped,'A');assert.equal(ab.after.crystalTotal,1);assert.equal(ab.trace.lessonEquip,1);groups.push(file+': A selection rerender then B refetch current live cards');
 const cursorOriginal=run('virtual',false),cursorCandidate=run('virtual',true);assert.deepEqual(cursorOriginal.after,cursorCandidate.after);assert.deepEqual(cursorOriginal.trace,cursorCandidate.trace);assert.deepEqual(cursorOriginal.events,cursorCandidate.events);groups.push(file+': virtual cursor B branch remains equivalent');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','pickupItem|_gpInvNav|_gpInvIdx|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'ITEM hb1228 pad B held/selection/cursor lifecycle controls after actual TASK Read',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','synthetic legal ordinary loot items, actual rollDrop/combat not executed'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify(evidence));

```

```json
{
  "chunk_id": "4e4d44",
  "wall_time_seconds": 0.209916875,
  "exit_code": 0,
  "original_token_count": 5271,
  "output": "{\"task\":\"ITEM hb1228 pad B held/selection/cursor lifecycle controls after actual TASK Read\",\"startedUTC\":\"2026-10-02T12:40:47.030Z\",\"endedUTC\":\"2026-10-02T12:40:47.332Z\",\"groups\":[\"game.html: held B next frame skips second equip/save/resource deduction\",\"game.html: A selection rerender then B refetch current live cards\",\"game.html: virtual cursor B branch remains equivalent\",\"game-easy-test.html: held B next frame skips second equip/save/resource deduction\",\"game-easy-test.html: A selection rerender then B refetch current live cards\",\"game-easy-test.html: virtual cursor B branch remains equivalent\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"held\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"ab\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true},{\"idx\":1,\"source\":\"bag\",\"preview\":false}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game.html\",\"mode\":\"virtual\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game.html\",\"mode\":\"virtual\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_martyr_tear\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"held\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"ab\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true},{\"idx\":1,\"source\":\"bag\",\"preview\":false}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"virtual\",\"patched\":false,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":null,\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"virtual\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":10000,\"equipped\":\"OLD\",\"bag\":[\"X\",\"A\",\"B\"],\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldRefund\":7,\"oldCrystal\":\"cr_hp\",\"ACrystal\":null,\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":3,\"recalc\":0,\"equipSfx\":0,\"apply\":0,\"lessonPickup\":3,\"lessonEquip\":0,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\"]}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"pickupItem\",\"line\":15678,\"sha256\":\"ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c\",\"bytes\":1786},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15574,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"_invBagRightClick\",\"line\":46967,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game.html\",\"label\":\"_invRows\",\"line\":15462,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game.html\",\"label\":\"_itemSz\",\"line\":15464,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game.html\",\"label\":\"_invCategoryKey\",\"line\":15469,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"_invGrid\",\"line\":15470,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game.html\",\"label\":\"_invFindSpace\",\"line\":15481,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game.html\",\"label\":\"xferCost\",\"line\":26891,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game.html\",\"label\":\"_malCost\",\"line\":26871,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game.html\",\"label\":\"_itemEconomyRarity\",\"line\":26976,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game.html\",\"label\":\"enhColor\",\"line\":26895,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game.html\",\"label\":\"_invCategoryMatches\",\"line\":48540,\"sha256\":\"bf6f1ec41adb83e63f2e35d8596c546da2270bb74e936a6aebb9a2030c18d9f7\",\"bytes\":277},{\"file\":\"game.html\",\"label\":\"_earringSlot\",\"line\":15559,\"sha256\":\"d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971\",\"bytes\":73},{\"file\":\"game.html\",\"label\":\"_equipSlot\",\"line\":15560,\"sha256\":\"95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e\",\"bytes\":165},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15116,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15118,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15119,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15120,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26870,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14626,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14627,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14628,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14630,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14632,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14723,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":48693,\"sha256\":\"dc09da97601fbaeb2267580621f7589cab2e0f1aafa35c1f34dd19ab42d0812e\",\"bytes\":4308},{\"file\":\"game.html\",\"label\":\"_gpInvNav\",\"line\":13650,\"sha256\":\"4bfa67a41569c80d2881abdc6276193f509fb7c50989378d2926cae21402971c\",\"bytes\":9979},{\"file\":\"game.html\",\"label\":\"actual R pickup selection block\",\"line\":31692,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15116,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15118,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15119,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15120,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26870,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14626,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14627,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14628,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14630,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14632,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14723,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"pickupItem\",\"line\":14785,\"sha256\":\"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\"bytes\":2552},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14682,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"_invBagRightClick\",\"line\":45570,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game-easy-test.html\",\"label\":\"_invRows\",\"line\":14585,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game-easy-test.html\",\"label\":\"_itemSz\",\"line\":14587,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryKey\",\"line\":14592,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"_invGrid\",\"line\":14593,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game-easy-test.html\",\"label\":\"_invFindSpace\",\"line\":14604,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game-easy-test.html\",\"label\":\"xferCost\",\"line\":25766,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game-easy-test.html\",\"label\":\"_malCost\",\"line\":25746,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game-easy-test.html\",\"label\":\"_itemEconomyRarity\",\"line\":25851,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"enhColor\",\"line\":25770,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryMatches\",\"line\":47034,\"sha256\":\"f337c7995d2da57d084269483cf27e265a49c4875e6c9155b311a84334dfcefa\",\"bytes\":240},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14240,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14242,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14243,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14244,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25745,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14023,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14024,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14025,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14027,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14028,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14087,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":47269,\"sha256\":\"210994f43947ba1d15bb15c611697d4b44d8aeebee555067d43011c59f417854\",\"bytes\":4250},{\"file\":\"game-easy-test.html\",\"label\":\"_gpInvNav\",\"line\":13047,\"sha256\":\"cf33bcd8890a171d261086ae33cf40a823c5dac0105f2f70b340b4cf86db30c6\",\"bytes\":9954},{\"file\":\"game-easy-test.html\",\"label\":\"actual R pickup selection block\",\"line\":30511,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14240,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14242,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14243,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14244,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25745,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14023,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14024,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14025,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14027,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14028,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14087,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2\",\"afterSHA\":\"3e9dcf87d5b34aeac5342029bc039c95f8f4ae1163396ec66e47a51c4a96e0b5\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a\",\"afterSHA\":\"4bcc8d667627c7eceecb4e06fc5ecf42f83a1fea7a79507334d0732591f861f2\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":602,\"stdoutSHA256\":\"5747e043ffd6c7d381d5d720a70bc4d8e493722f424a2a7820f24bf8fb61ca11\"},\"actual\":[\"whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers\",\"actual R item-selection block\",\"actual renderInv filter/card loop\",\"whole actual _gpInvNav bag B no cursor branch\",\"live rendered card events, no retained detached callback\"],\"stubs\":[\"DOM Node/MouseEvent dispatch, no browser/native\",\"renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed\",\"detail/UI/stat/SFX/save/lesson observers\",\"synthetic legal ordinary loot items, actual rollDrop/combat not executed\"],\"priorTestsRepeated\":0,\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"errors\":[],\"exit\":0}\n"
}
```

## B entry

Script store: item_pad_bridge_entry_script; tool receipt store: item_pad_bridge_entry_exec. 기존 실행 결과이며 저장 중 재실행0.

```javascript
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemPadBIdentityPatch(source){
 const card="const div=document.createElement('div');div.className='inv-item';";
 if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+"\n    div.dataset.inventoryBagIndex=String(i);");
 return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))');
}
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 scrollIntoView(){}
 querySelectorAll(q){assert(['.inv-item','.inv-item,.inv-eq-slot,.inv-cell'].includes(q));return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert(['contextmenu','mouseover','mouseleave'].includes(e.type));this['on'+e.type]?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyItemPadBIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=f('_gpInvNav');
  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+bag+'\n}\n'+key+'\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 function run(mode,usePatch){
  const grid=new Node(),panel=new Node();panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  const A={id:'A',slot:'armor',name:'chosen',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,_gpInvIdx:1,_gpInvEqIdx:0,_gpInvMode:'bag',_gpInvBotIdx:-1,_gpUIPrev:{},_gpVC:{vis:false},_gpVCPrevHoverEl:null,_gpAxes:[0,0,0,0,0,0,0,0],_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===1,value:0})),axes:[0,0,0,0]},document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:null,
   INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:mode==='unfiltered'?null:'armor',rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  vm.runInContext('Date.now=()=>12345;Math.random=()=>{throw Error("unexpected RNG")}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  for(const item of [X,A,B]){const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));}
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(n=>mode==='unfiltered'?n===cards[1]:n===cards[0]);
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  if(mode==='selected')vm.runInContext('_invHover=-1;INV.selected=1',c);
  if(mode==='hidden')vm.runInContext('_gpInvIdx=0;_invHover=-1;INV.selected=0',c);
  if(mode==='last')vm.runInContext('_gpInvIdx=2',c);
  if(mode==='ab')c._gpad.buttons[0].pressed=true;
  if(mode==='navigate'){c._gpInvIdx=0;c._gpad.buttons[13].pressed=true;c._gpVCHide=()=>{c._gpVC.vis=false;};}
  if(mode==='virtual'){c._gpVC.vis=true;c.document.elementFromPoint=()=>grid.querySelectorAll('.inv-item')[0];}
  vm.runInContext('_gpInvNav()',c);
  if(mode==='held'){const beforeHeld=JSON.stringify({bag:c.INV.bag,eq:c.INV.equipped,mats:c.G.mats,trace});vm.runInContext('_gpInvNav()',c);assert.equal(JSON.stringify({bag:c.INV.bag,eq:c.INV.equipped,mats:c.G.mats,trace}),beforeHeld);}
  const equipped=c.INV.equipped.armor;
  const after={mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={file,mode,patched:usePatch,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const entered=run('navigate',true);assert.equal(entered.after.equipped,'A');assert(entered.trace.details.some(d=>d.idx===1&&d.source==='bag'));assert.equal(entered.after.mats,8500);assert.equal(entered.after.crystalTotal,1);groups.push(file+': initial pad index0 + down/B same frame→actual index1/detailA/live dispatch→A equip');

}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','pickupItem|_gpInvNav|_gpInvIdx|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'ITEM hb1228 normal D-pad entry→B input sequence source bridge',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','whole actual _gpInvNav bag B no cursor branch','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','synthetic legal ordinary loot items, actual rollDrop/combat not executed'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify(evidence));

```

```json
{
  "chunk_id": "d4ddd2",
  "wall_time_seconds": 0.202994334,
  "exit_code": 0,
  "original_token_count": 3918,
  "output": "{\"task\":\"ITEM hb1228 normal D-pad entry→B input sequence source bridge\",\"startedUTC\":\"2026-10-02T12:41:24.566Z\",\"endedUTC\":\"2026-10-02T12:41:24.865Z\",\"groups\":[\"game.html: initial pad index0 + down/B same frame→actual index1/detailA/live dispatch→A equip\",\"game-easy-test.html: initial pad index0 + down/B same frame→actual index1/detailA/live dispatch→A equip\"],\"rows\":[{\"file\":\"game.html\",\"mode\":\"navigate\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_martyr_tear\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true},{\"idx\":1,\"source\":\"bag\",\"preview\":false}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]},{\"file\":\"game-easy-test.html\",\"mode\":\"navigate\",\"patched\":true,\"initialBag\":[\"X\",\"A\",\"B\"],\"visibleBagIndices\":[\"1\",\"2\"],\"before\":{\"mats\":10000,\"oldEnh\":3,\"AEnh\":0,\"BEnh\":0,\"oldCrystalIdentity\":true,\"bag\":[\"X\",\"A\",\"B\"]},\"after\":{\"mats\":8500,\"equipped\":\"A\",\"bag\":[\"X\",\"B\",\"OLD\"],\"oldEnh\":0,\"AEnh\":3,\"BEnh\":0,\"oldRefund\":6,\"oldCrystal\":null,\"ACrystal\":\"cr_hp\",\"BCrystal\":null,\"crystalBag\":0,\"crystalTotal\":1,\"crystalIdentity\":true,\"disjoint\":true},\"trace\":{\"pickup\":3,\"save\":4,\"recalc\":1,\"equipSfx\":1,\"apply\":1,\"lessonPickup\":3,\"lessonEquip\":1,\"rng\":0,\"details\":[{\"idx\":1,\"source\":\"bag\",\"preview\":true},{\"idx\":1,\"source\":\"bag\",\"preview\":false}]},\"events\":[\"pickup\",\"notify:0 excluded 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 chosen 획득!\",\"lessonPickup\",\"save\",\"parts\",\"pickup\",\"notify:0 other 획득!\",\"lessonPickup\",\"save\",\"parts\",\"notify:⚒ +3 강화 이전 완료 (-1,500악의)\",\"addTxt\",\"notify:💎 결정 자동 전승 완료\",\"recalc\",\"equipSfx\",\"notify:chosen 장착!\",\"lessonEquip\",\"save\",\"apply\"]}],\"anchors\":[{\"file\":\"game.html\",\"label\":\"pickupItem\",\"line\":15681,\"sha256\":\"ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c\",\"bytes\":1786},{\"file\":\"game.html\",\"label\":\"equipItem\",\"line\":15577,\"sha256\":\"32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6\",\"bytes\":3528},{\"file\":\"game.html\",\"label\":\"_invBagRightClick\",\"line\":46970,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game.html\",\"label\":\"_invRows\",\"line\":15465,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game.html\",\"label\":\"_itemSz\",\"line\":15467,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game.html\",\"label\":\"_invCategoryKey\",\"line\":15472,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"_invGrid\",\"line\":15473,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game.html\",\"label\":\"_invFindSpace\",\"line\":15484,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game.html\",\"label\":\"xferCost\",\"line\":26894,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game.html\",\"label\":\"_malCost\",\"line\":26874,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game.html\",\"label\":\"_itemEconomyRarity\",\"line\":26979,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game.html\",\"label\":\"enhColor\",\"line\":26898,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game.html\",\"label\":\"_invCategoryMatches\",\"line\":48543,\"sha256\":\"bf6f1ec41adb83e63f2e35d8596c546da2270bb74e936a6aebb9a2030c18d9f7\",\"bytes\":277},{\"file\":\"game.html\",\"label\":\"_earringSlot\",\"line\":15562,\"sha256\":\"d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971\",\"bytes\":73},{\"file\":\"game.html\",\"label\":\"_equipSlot\",\"line\":15563,\"sha256\":\"95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e\",\"bytes\":165},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15119,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15121,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15122,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15123,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26873,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14629,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14630,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14631,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14633,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14635,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14726,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":48696,\"sha256\":\"dc09da97601fbaeb2267580621f7589cab2e0f1aafa35c1f34dd19ab42d0812e\",\"bytes\":4308},{\"file\":\"game.html\",\"label\":\"_gpInvNav\",\"line\":13653,\"sha256\":\"4bfa67a41569c80d2881abdc6276193f509fb7c50989378d2926cae21402971c\",\"bytes\":9979},{\"file\":\"game.html\",\"label\":\"actual R pickup selection block\",\"line\":31695,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game.html\",\"label\":\"ITEM_SIZE\",\"line\":15119,\"sha256\":\"72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e\",\"bytes\":251},{\"file\":\"game.html\",\"label\":\"WTYPE_SIZE\",\"line\":15121,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game.html\",\"label\":\"BTYPE_SIZE\",\"line\":15122,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game.html\",\"label\":\"INV_COLS\",\"line\":15123,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":26873,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14629,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14630,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14631,\"sha256\":\"e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e\",\"bytes\":98},{\"file\":\"game.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14633,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14635,\"sha256\":\"5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28\",\"bytes\":3218},{\"file\":\"game.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14726,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"pickupItem\",\"line\":14788,\"sha256\":\"b790a6796976fcb6c38fedf7cdbea03337829243141a089a40e524aa170d9146\",\"bytes\":2552},{\"file\":\"game-easy-test.html\",\"label\":\"equipItem\",\"line\":14685,\"sha256\":\"494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179\",\"bytes\":3407},{\"file\":\"game-easy-test.html\",\"label\":\"_invBagRightClick\",\"line\":45573,\"sha256\":\"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\",\"bytes\":264},{\"file\":\"game-easy-test.html\",\"label\":\"_invRows\",\"line\":14588,\"sha256\":\"e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37\",\"bytes\":70},{\"file\":\"game-easy-test.html\",\"label\":\"_itemSz\",\"line\":14590,\"sha256\":\"46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b\",\"bytes\":226},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryKey\",\"line\":14595,\"sha256\":\"b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"_invGrid\",\"line\":14596,\"sha256\":\"74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47\",\"bytes\":497},{\"file\":\"game-easy-test.html\",\"label\":\"_invFindSpace\",\"line\":14607,\"sha256\":\"50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788\",\"bytes\":329},{\"file\":\"game-easy-test.html\",\"label\":\"xferCost\",\"line\":25769,\"sha256\":\"1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2\",\"bytes\":124},{\"file\":\"game-easy-test.html\",\"label\":\"_malCost\",\"line\":25749,\"sha256\":\"b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f\",\"bytes\":122},{\"file\":\"game-easy-test.html\",\"label\":\"_itemEconomyRarity\",\"line\":25854,\"sha256\":\"13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509\",\"bytes\":81},{\"file\":\"game-easy-test.html\",\"label\":\"enhColor\",\"line\":25773,\"sha256\":\"8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc\",\"bytes\":444},{\"file\":\"game-easy-test.html\",\"label\":\"_invCategoryMatches\",\"line\":47037,\"sha256\":\"f337c7995d2da57d084269483cf27e265a49c4875e6c9155b311a84334dfcefa\",\"bytes\":240},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"actual renderInv filter/card loop\",\"line\":47272,\"sha256\":\"210994f43947ba1d15bb15c611697d4b44d8aeebee555067d43011c59f417854\",\"bytes\":4250},{\"file\":\"game-easy-test.html\",\"label\":\"_gpInvNav\",\"line\":13050,\"sha256\":\"cf33bcd8890a171d261086ae33cf40a823c5dac0105f2f70b340b4cf86db30c6\",\"bytes\":9954},{\"file\":\"game-easy-test.html\",\"label\":\"actual R pickup selection block\",\"line\":30514,\"sha256\":\"7d69d2276baee778bb4dcd53977f29e1379081284fbf7a23fc5a2dcd9f5c921c\",\"bytes\":671},{\"file\":\"game-easy-test.html\",\"label\":\"ITEM_SIZE\",\"line\":14243,\"sha256\":\"a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d\",\"bytes\":235},{\"file\":\"game-easy-test.html\",\"label\":\"WTYPE_SIZE\",\"line\":14245,\"sha256\":\"76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715\",\"bytes\":100},{\"file\":\"game-easy-test.html\",\"label\":\"BTYPE_SIZE\",\"line\":14246,\"sha256\":\"426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081\",\"bytes\":61},{\"file\":\"game-easy-test.html\",\"label\":\"INV_COLS\",\"line\":14247,\"sha256\":\"5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908\",\"bytes\":17},{\"file\":\"game-easy-test.html\",\"label\":\"_MALICE_COST_MUL\",\"line\":25748,\"sha256\":\"a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9\",\"bytes\":26},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ATK_SLOTS\",\"line\":14026,\"sha256\":\"b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32\",\"bytes\":44},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ARMOR_SLOTS\",\"line\":14027,\"sha256\":\"7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395\",\"bytes\":71},{\"file\":\"game-easy-test.html\",\"label\":\"CR_ACC_SLOTS\",\"line\":14028,\"sha256\":\"f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726\",\"bytes\":86},{\"file\":\"game-easy-test.html\",\"label\":\"CR_DEF_SLOTS\",\"line\":14030,\"sha256\":\"72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70\",\"bytes\":54},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_DEFS\",\"line\":14031,\"sha256\":\"aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e\",\"bytes\":1923},{\"file\":\"game-easy-test.html\",\"label\":\"CRYSTAL_BAG_MAX\",\"line\":14090,\"sha256\":\"d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175\",\"bytes\":26}],\"patches\":[{\"file\":\"game.html\",\"beforeSHA\":\"eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81\",\"afterSHA\":\"8f77b983a7a7367dc18635834a9625511f2a9c522814465a371af1efab45b499\",\"replacements\":2},{\"file\":\"game-easy-test.html\",\"beforeSHA\":\"b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515\",\"afterSHA\":\"017fa240d6dc7c9c83952bd511502a27d0e1ad3de2a95d5b11f69246a0b5ac8d\",\"replacements\":2}],\"sourceEnd\":[{\"file\":\"game.html\",\"sha256\":\"eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81\"},{\"file\":\"game-easy-test.html\",\"sha256\":\"b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515\"}],\"docsSearch\":{\"command\":[\"rg\",\"-n\",\"pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승\",\"docs/\"],\"exit\":0,\"lines\":602,\"stdoutSHA256\":\"cfce28da017f537d47647e45da01bea9cc4694b77bf24b15f7f7ec09685ef0b3\"},\"actual\":[\"whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers\",\"actual R item-selection block\",\"actual renderInv filter/card loop\",\"whole actual _gpInvNav bag B no cursor branch\",\"live rendered card events, no retained detached callback\"],\"stubs\":[\"DOM Node/MouseEvent dispatch, no browser/native\",\"renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed\",\"detail/UI/stat/SFX/save/lesson observers\",\"synthetic legal ordinary loot items, actual rollDrop/combat not executed\"],\"priorTestsRepeated\":0,\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"errors\":[],\"exit\":0}\n"
}
```


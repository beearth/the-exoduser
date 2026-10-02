# UIUX-SKILL-POPUP-INPUT-OWNER-ROLLING1445-1458

숫자 슬롯 종료·단독 팝업 패드 인식·Back 재열기의 미적용 후보 및 정상 대조. 총괄의 production/docs 통합과 실제 CH1-1 시연 검수가 남아 있다.

할당 CAPACITY-UIUX-1458, rolling-after-e764-1445. 새 파일 2개만 보존. 제출 과거 폴더·production·shared docs·Git·타팀·UI·save 변경 0. 저장을 위한 검사 재실행 0. 새 검사 래퍼 Acorn 구문 확인만 수행했다.

## 실제 결함과 최소 후보

| 경계 | 현재 결함 | 후보 | 정상 대조 |
|---|---|---|---|
| 단독 skSlotPop | poll UI 판정 누락, A 공격 주입/Dpad·Start 다른 메뉴/Back 무시 | display flex 팝업 UI 인식, 메뉴 토글 차단 | 실제 고정 탭 onclick·close owner helper |
| 고정→숫자→배정/해제 | 창만 숨겨 owned pause 잔류 | 두 numeric 콜백의 직접 숨김을 _closeSkPop()으로 변경 | HUD direct logical-open 및 기존 paused panel-state 유지, 슬롯 이동/저장 호출 trace 동일 |
| 숫자 탭 배정 대상 없음 | 전환 전 숨김 후 early return | 성공 전 선행 숨김 제거 | 알림 보존, 고정창 유지 후 close owner 해제 |
| Back 재열기 | UI 밖 release 미반영 | 일반 poll에서 _back8 pressed snapshot | 실제 닫기→release→재열기→fresh Back |
| 패드 1~4/SPACE/F 배정 | 부분 UI 인식 후보만으로는 numeric 종료 시 정지 잔류 | 후보 조합 | 3개 실제 source skill 객체/자격 판정, 슬롯 및 save 호출 trace 동일; held A 공격0/fresh A 공격1 |

## 총괄 인수 Gate

_gpUINav/forge shared caller와 root BALANCE 후보는 별도 Gate다. 이 후보는 _gpUINav를 수정하지 않으며, 현재 source의 selector와 콜백을 사용했다. 다른 미적용 toolbar/navigation 후보와 합친 동작은 검증하지 않았다. root가 source pin·공유호출자·canonical docs를 확인하고 통합한다. source/DOM/Gamepad 대역을 실제 화면·청취·게임 시연 PASS로 환산하지 않는다.

## 재현 및 편집 recipe

저장한 checks.mjs는 repository root에서 실행하는 원래 메모리 VM recipe들을 포함한다. --recipe는 source pin과 정확한 6 old/new 치환 항목만 출력한다. 기본 실행은 과거 검사 재현이므로 source 변경·새 우려 등 정당한 필요가 있을 때만 사용한다. 생산 파일을 쓰는 기능은 없다.

## 검증/후보/문서 인수 데이터

아래 captures는 실제 exit0 실행 결과를 보존하며 authoritativescope/baseline 설명이 이전 래퍼의 복사된 tutorial 메타데이터보다 우선한다. 원문 callback 대비와 부분 후보 대비를 구분한다. 초기 stdout 잘림 run은 통계에 포함하지 않는다.

```json
{
  "completionID": "UIUX-SKILL-POPUP-INPUT-OWNER-ROLLING1445-1458",
  "allocation": "CAPACITY-UIUX-1458",
  "epoch": "rolling-after-e764-1445",
  "sourcePins": [
    {
      "file": "game.html",
      "sha256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea"
    },
    {
      "file": "game-easy-test.html",
      "sha256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390"
    }
  ],
  "candidateComposition": {
    "utc": "2026-10-02T14:53:11.856Z",
    "results": [
      {
        "file": "game.html",
        "sourceSHA256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
        "candidateSHA256": "d62e49f4924dc25af9ca7d4a5af726bdeac33de2b384e65e34315d32b18ad659",
        "scripts": 56,
        "changedFunctions": [
          {
            "name": "openSkSlotPop",
            "originalSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
            "candidateSHA256": "b17b586844cfcaac1f76a5e6acdf120687c3374240b6b30c27b6695c905b6336"
          },
          {
            "name": "_openSkillSlotPop",
            "originalSHA256": "51767871e41cc75c2d458b02fa1588e58753870b4301709052a8ae975064e7b4",
            "candidateSHA256": "a3b3140b96885137bbab1ff01dcf7441b024690d96a3635e6dc513f8da95418f"
          },
          {
            "name": "_pollGamepad",
            "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
            "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de"
          }
        ],
        "edits": [
          [
            "openSkSlotPop",
            "if(t.isSlot){pop.style.display='none';_openSkillSlotPop(t.slotIdx);return}",
            "if(t.isSlot){_openSkillSlotPop(t.slotIdx);return}",
            1
          ],
          [
            "_openSkillSlotPop",
            "pop.style.display='none';updateQS();dbSaveNow();",
            "_closeSkPop();updateQS();dbSaveNow();",
            2
          ],
          [
            "_pollGamepad",
            "  const _gpOpenPanel=document.querySelector('.panel.on');",
            "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
            1
          ],
          [
            "_pollGamepad",
            "const _anyPanelOpen=!!document.querySelector('.panel.on');",
            "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
            1
          ],
          [
            "_pollGamepad",
            "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
            "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
            1
          ],
          [
            "_pollGamepad",
            "  _gpVCHide(); // 패널 닫히면 커서 숨김",
            "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
            1
          ]
        ]
      },
      {
        "file": "game-easy-test.html",
        "sourceSHA256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
        "candidateSHA256": "fefd7b76f27edb1c5e934ab20f7838e1ae7f0e093300ab0bbdb2104381b80081",
        "scripts": 48,
        "changedFunctions": [
          {
            "name": "openSkSlotPop",
            "originalSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
            "candidateSHA256": "b17b586844cfcaac1f76a5e6acdf120687c3374240b6b30c27b6695c905b6336"
          },
          {
            "name": "_openSkillSlotPop",
            "originalSHA256": "51767871e41cc75c2d458b02fa1588e58753870b4301709052a8ae975064e7b4",
            "candidateSHA256": "a3b3140b96885137bbab1ff01dcf7441b024690d96a3635e6dc513f8da95418f"
          },
          {
            "name": "_pollGamepad",
            "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
            "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de"
          }
        ],
        "edits": [
          [
            "openSkSlotPop",
            "if(t.isSlot){pop.style.display='none';_openSkillSlotPop(t.slotIdx);return}",
            "if(t.isSlot){_openSkillSlotPop(t.slotIdx);return}",
            1
          ],
          [
            "_openSkillSlotPop",
            "pop.style.display='none';updateQS();dbSaveNow();",
            "_closeSkPop();updateQS();dbSaveNow();",
            2
          ],
          [
            "_pollGamepad",
            "  const _gpOpenPanel=document.querySelector('.panel.on');",
            "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
            1
          ],
          [
            "_pollGamepad",
            "const _anyPanelOpen=!!document.querySelector('.panel.on');",
            "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
            1
          ],
          [
            "_pollGamepad",
            "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
            "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
            1
          ],
          [
            "_pollGamepad",
            "  _gpVCHide(); // 패널 닫히면 커서 숨김",
            "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
            1
          ]
        ]
      }
    ],
    "newFiles": 0,
    "productionApplied": false,
    "runtimeAccepted": false,
    "scope": "composition syntax only; separate source callback/poll evidence provides narrow behavioral gates, composed native product untested"
  },
  "captures": [
    {
      "id": "standaloneSkillPopupPollingCorrected",
      "title": "독립 팝업 UI 인식",
      "baseline": "current source poll",
      "authoritativeScope": "원문 poll/완성 UI 인식 후보의 A·Dpad·Start·Back: actual generated fixed tabs + source close owner helper. Fusion/labels/state/DOM/Gamepad/clock/render endpoints doubled.",
      "pairs": 8,
      "execution": {
        "exitCode": 0,
        "startedUTC": "2026-10-02T14:43:21.111Z",
        "endedUTC": "2026-10-02T14:43:21.428Z"
      },
      "results": [
        {
          "file": "game.html",
          "sourceSHA256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
          "navigationSHA256": "3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "scenario": "A",
              "before": {
                "mode": "source",
                "scenario": "A",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": true,
                "trace": []
              },
              "after": {
                "mode": "candidate",
                "scenario": "A",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "lmb",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": [
                  "click:DIV"
                ]
              }
            },
            {
              "scenario": "Dpad",
              "before": {
                "mode": "source",
                "scenario": "Dpad",
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": true,
                "panel": "skillPanel",
                "mouseHeld": false,
                "trace": [
                  "renderSkillPanel"
                ]
              },
              "after": {
                "mode": "candidate",
                "scenario": "Dpad",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": [
                  "vibrateSink"
                ]
              }
            },
            {
              "scenario": "Start",
              "before": {
                "mode": "source",
                "scenario": "Start",
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": true,
                "panel": "settings",
                "mouseHeld": false,
                "trace": [
                  "renderSettings"
                ]
              },
              "after": {
                "mode": "candidate",
                "scenario": "Start",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              }
            },
            {
              "scenario": "Back",
              "before": {
                "mode": "source",
                "scenario": "Back",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              },
              "after": {
                "mode": "candidate",
                "scenario": "Back",
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": false,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        },
        {
          "file": "game-easy-test.html",
          "sourceSHA256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
          "navigationSHA256": "cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "scenario": "A",
              "before": {
                "mode": "source",
                "scenario": "A",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": true,
                "trace": []
              },
              "after": {
                "mode": "candidate",
                "scenario": "A",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "lmb",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": [
                  "click:DIV"
                ]
              }
            },
            {
              "scenario": "Dpad",
              "before": {
                "mode": "source",
                "scenario": "Dpad",
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": true,
                "panel": "skillPanel",
                "mouseHeld": false,
                "trace": [
                  "renderSkillPanel"
                ]
              },
              "after": {
                "mode": "candidate",
                "scenario": "Dpad",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": [
                  "vibrateSink"
                ]
              }
            },
            {
              "scenario": "Start",
              "before": {
                "mode": "source",
                "scenario": "Start",
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": true,
                "panel": "settings",
                "mouseHeld": false,
                "trace": [
                  "renderSettings"
                ]
              },
              "after": {
                "mode": "candidate",
                "scenario": "Start",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              }
            },
            {
              "scenario": "Back",
              "before": {
                "mode": "source",
                "scenario": "Back",
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              },
              "after": {
                "mode": "candidate",
                "scenario": "Back",
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": false,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        }
      ]
    },
    {
      "id": "numericPopupPauseOwnerTransfer",
      "title": "숫자 슬롯 종료와 정상 대조",
      "baseline": "original full fixed/numeric popup functions",
      "authoritativeScope": "actual fixed numeric tab→full numeric popup callback, real spikeTrap source object and slot contract, assignment from another slot/unset/empty; HUD logical direct-open and prepaused panel-state controls. Underlying panel renderer/native/save endpoints untested.",
      "pairs": 14,
      "execution": {
        "exitCode": 0,
        "startedUTC": "2026-10-02T14:51:03.943Z",
        "endedUTC": "2026-10-02T14:51:04.252Z"
      },
      "results": [
        {
          "file": "game.html",
          "sourceSHA256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
          "functions": {
            "openSkSlotPop": {
              "sha256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9"
            },
            "_openSkillSlotPop": {
              "sha256": "51767871e41cc75c2d458b02fa1588e58753870b4301709052a8ae975064e7b4"
            },
            "_closeSkPop": {
              "sha256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540"
            },
            "_canAssignSkillSlot": {
              "sha256": "f2e82f78bd490926f3262739999b794b757bdeecbb5b1041495f8ccce706fc9c"
            }
          },
          "changes": {
            "oldTab": "if(t.isSlot){pop.style.display='none';_openSkillSlotPop(t.slotIdx);return}",
            "newTab": "if(t.isSlot){_openSkillSlotPop(t.slotIdx);return}",
            "numericOld": "pop.style.display='none';updateQS();dbSaveNow();",
            "numericNew": "_closeSkPop();updateQS();dbSaveNow();"
          },
          "candidateSHA256": {
            "openSkSlotPop": "b17b586844cfcaac1f76a5e6acdf120687c3374240b6b30c27b6695c905b6336",
            "_openSkillSlotPop": "a3b3140b96885137bbab1ff01dcf7441b024690d96a3635e6dc513f8da95418f"
          },
          "cases": [
            {
              "route": "fixed",
              "action": "assign",
              "before": {
                "route": "fixed",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "fixed",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "fixed",
              "action": "unset",
              "before": {
                "route": "fixed",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "fixed",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "fixed",
              "action": "empty",
              "before": {
                "route": "fixed",
                "action": "empty",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    [
                      "textSink",
                      0,
                      -20,
                      "배정 가능한 스킬 없음",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false
                }
              },
              "after": {
                "route": "fixed",
                "action": "empty",
                "beforeBack": {
                  "display": "flex",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    [
                      "textSink",
                      0,
                      -20,
                      "배정 가능한 스킬 없음",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false
                }
              }
            },
            {
              "route": "hud",
              "action": "assign",
              "before": {
                "route": "hud",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "hud",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "hud",
              "action": "unset",
              "before": {
                "route": "hud",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "hud",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "panel",
              "action": "assign",
              "before": {
                "route": "panel",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "panel",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "panel",
              "action": "unset",
              "before": {
                "route": "panel",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "panel",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              }
            }
          ]
        },
        {
          "file": "game-easy-test.html",
          "sourceSHA256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
          "functions": {
            "openSkSlotPop": {
              "sha256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9"
            },
            "_openSkillSlotPop": {
              "sha256": "51767871e41cc75c2d458b02fa1588e58753870b4301709052a8ae975064e7b4"
            },
            "_closeSkPop": {
              "sha256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540"
            },
            "_canAssignSkillSlot": {
              "sha256": "f2e82f78bd490926f3262739999b794b757bdeecbb5b1041495f8ccce706fc9c"
            }
          },
          "changes": {
            "oldTab": "if(t.isSlot){pop.style.display='none';_openSkillSlotPop(t.slotIdx);return}",
            "newTab": "if(t.isSlot){_openSkillSlotPop(t.slotIdx);return}",
            "numericOld": "pop.style.display='none';updateQS();dbSaveNow();",
            "numericNew": "_closeSkPop();updateQS();dbSaveNow();"
          },
          "candidateSHA256": {
            "openSkSlotPop": "b17b586844cfcaac1f76a5e6acdf120687c3374240b6b30c27b6695c905b6336",
            "_openSkillSlotPop": "a3b3140b96885137bbab1ff01dcf7441b024690d96a3635e6dc513f8da95418f"
          },
          "cases": [
            {
              "route": "fixed",
              "action": "assign",
              "before": {
                "route": "fixed",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "fixed",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "fixed",
              "action": "unset",
              "before": {
                "route": "fixed",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "fixed",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "fixed",
              "action": "empty",
              "before": {
                "route": "fixed",
                "action": "empty",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    [
                      "textSink",
                      0,
                      -20,
                      "배정 가능한 스킬 없음",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false
                }
              },
              "after": {
                "route": "fixed",
                "action": "empty",
                "beforeBack": {
                  "display": "flex",
                  "paused": true,
                  "ownsPause": true,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    [
                      "textSink",
                      0,
                      -20,
                      "배정 가능한 스킬 없음",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false
                }
              }
            },
            {
              "route": "hud",
              "action": "assign",
              "before": {
                "route": "hud",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "hud",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "hud",
              "action": "unset",
              "before": {
                "route": "hud",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "hud",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": false,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "panel",
              "action": "assign",
              "before": {
                "route": "panel",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "panel",
                "action": "assign",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    "spikeTrap",
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1: 가시덫",
                      "#ff8844",
                      40
                    ],
                    "pickupSink"
                  ]
                },
                "afterBack": null
              }
            },
            {
              "route": "panel",
              "action": "unset",
              "before": {
                "route": "panel",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              },
              "after": {
                "route": "panel",
                "action": "unset",
                "beforeBack": {
                  "display": "none",
                  "paused": true,
                  "ownsPause": false,
                  "slots": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                  ],
                  "trace": [
                    "updateQS",
                    "saveSink",
                    [
                      "textSink",
                      0,
                      -20,
                      "슬롯1 해제",
                      "#bbbbbb",
                      30
                    ]
                  ]
                },
                "afterBack": null
              }
            }
          ]
        }
      ]
    },
    {
      "id": "standaloneSkillPopupBackReopen",
      "title": "Back release/재열기",
      "baseline": "earlier UI-recognition partial candidate",
      "authoritativeScope": "actual close→release in no UI→reopen→fresh Back, earlier UI-recognition candidate compared with plus _back8 no-UI snapshot; A/Dpad/Start cases not rerun.",
      "pairs": 2,
      "execution": {
        "exitCode": 0,
        "startedUTC": "2026-10-02T14:52:08.957Z",
        "endedUTC": "2026-10-02T14:52:09.314Z"
      },
      "results": [
        {
          "file": "game.html",
          "sourceSHA256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
          "navigationSHA256": "3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de",
          "previousCandidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "syncOld": "  _gpVCHide(); // 패널 닫히면 커서 숨김",
          "syncNext": "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "scenario": "Back release outside popup then reopen/fresh Back",
              "before": {
                "mode": "previous",
                "scenario": "Back",
                "first": {
                  "display": "none",
                  "paused": false
                },
                "released": true,
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              },
              "after": {
                "mode": "complete",
                "scenario": "Back",
                "first": {
                  "display": "none",
                  "paused": false
                },
                "released": false,
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": false,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        },
        {
          "file": "game-easy-test.html",
          "sourceSHA256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
          "navigationSHA256": "cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de",
          "previousCandidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "syncOld": "  _gpVCHide(); // 패널 닫히면 커서 숨김",
          "syncNext": "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "scenario": "Back release outside popup then reopen/fresh Back",
              "before": {
                "mode": "previous",
                "scenario": "Back",
                "first": {
                  "display": "none",
                  "paused": false
                },
                "released": true,
                "initialTabs": 13,
                "popDisplay": "flex",
                "tab": "charge",
                "paused": true,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              },
              "after": {
                "mode": "complete",
                "scenario": "Back",
                "first": {
                  "display": "none",
                  "paused": false
                },
                "released": false,
                "initialTabs": 13,
                "popDisplay": "none",
                "tab": "charge",
                "paused": false,
                "panel": null,
                "mouseHeld": false,
                "trace": []
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        }
      ]
    },
    {
      "id": "skillPopupPadAssignmentIntegration",
      "title": "패드 슬롯1 전체 연결",
      "baseline": "UI recognition partial candidate + original fixed/numeric callbacks",
      "authoritativeScope": "full poll/step/nav→7 directional pulses→numeric tab A→option selection→assign→held/released/fresh gameplay A. Partial UI-recognition candidate with original callbacks vs complete candidate; no unmodified whole source baseline.",
      "pairs": 2,
      "execution": {
        "exitCode": 0,
        "startedUTC": "2026-10-02T14:54:33.465Z",
        "endedUTC": "2026-10-02T14:54:33.830Z"
      },
      "results": [
        {
          "file": "game.html",
          "sourceSHA256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
          "navigationSHA256": "3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de",
          "previousCandidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "syncOld": "  _gpVCHide(); // 패널 닫히면 커서 숨김",
          "syncNext": "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "scenario": "full-pad-slot-assignment",
              "before": {
                "mode": "previous",
                "scenario": "full-pad-slot-assignment",
                "states": [
                  {
                    "label": "numeric-tab-selected",
                    "index": 7,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink"
                    ]
                  },
                  {
                    "label": "numeric-options",
                    "index": 0,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV"
                    ]
                  },
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "release",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": "full-pad-slot-assignment",
                "states": [
                  {
                    "label": "numeric-tab-selected",
                    "index": 7,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink"
                    ]
                  },
                  {
                    "label": "numeric-options",
                    "index": 0,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV"
                    ]
                  },
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "release",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        },
        {
          "file": "game-easy-test.html",
          "sourceSHA256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
          "navigationSHA256": "cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de",
          "previousCandidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "syncOld": "  _gpVCHide(); // 패널 닫히면 커서 숨김",
          "syncNext": "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "scenario": "full-pad-slot-assignment",
              "before": {
                "mode": "previous",
                "scenario": "full-pad-slot-assignment",
                "states": [
                  {
                    "label": "numeric-tab-selected",
                    "index": 7,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink"
                    ]
                  },
                  {
                    "label": "numeric-options",
                    "index": 0,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV"
                    ]
                  },
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "release",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": "full-pad-slot-assignment",
                "states": [
                  {
                    "label": "numeric-tab-selected",
                    "index": 7,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink"
                    ]
                  },
                  {
                    "label": "numeric-options",
                    "index": 0,
                    "display": "flex",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV"
                    ]
                  },
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "release",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        }
      ]
    },
    {
      "id": "skillPopupPadRemainingSlotsIntegration",
      "title": "패드 슬롯2/3/4/SPACE/F",
      "baseline": "UI recognition partial candidate + original fixed/numeric callbacks",
      "authoritativeScope": "new five targets; actual source subset spikeTrap/giantSlam/holyDome, full source slot contract helpers. Slot1 not rerun; partial UI-recognition candidate + original callbacks vs complete candidate.",
      "pairs": 10,
      "execution": {
        "exitCode": 0,
        "startedUTC": "2026-10-02T14:55:27.387Z",
        "endedUTC": "2026-10-02T14:55:27.736Z"
      },
      "results": [
        {
          "file": "game.html",
          "sourceSHA256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
          "navigationSHA256": "3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de",
          "previousCandidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "syncOld": "  _gpVCHide(); // 패널 닫히면 커서 숨김",
          "syncNext": "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "slotIdx": 1,
              "expectedSkill": "spikeTrap",
              "before": {
                "mode": "previous",
                "scenario": 1,
                "slotIdx": 1,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 1,
                "slotIdx": 1,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 2,
              "expectedSkill": "spikeTrap",
              "before": {
                "mode": "previous",
                "scenario": 2,
                "slotIdx": 2,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 2,
                "slotIdx": 2,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 3,
              "expectedSkill": "spikeTrap",
              "before": {
                "mode": "previous",
                "scenario": 3,
                "slotIdx": 3,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 3,
                "slotIdx": 3,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 4,
              "expectedSkill": "giantSlam",
              "before": {
                "mode": "previous",
                "scenario": 4,
                "slotIdx": 4,
                "expectedSkill": "giantSlam",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 4,
                "slotIdx": 4,
                "expectedSkill": "giantSlam",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 5,
              "expectedSkill": "holyDome",
              "before": {
                "mode": "previous",
                "scenario": 5,
                "slotIdx": 5,
                "expectedSkill": "holyDome",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 5,
                "slotIdx": 5,
                "expectedSkill": "holyDome",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        },
        {
          "file": "game-easy-test.html",
          "sourceSHA256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
          "navigationSHA256": "cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0",
          "pollSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "panelNavSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
          "originalSHA256": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d",
          "candidateSHA256": "542e1390e7222e28b5c572f519f5ed8e23709e34f0e9cd9721548721fea730de",
          "previousCandidateSHA256": "d761a7505a6649cc49e1b5321c1c04e52fc7539b0cfea400ef84f29c0fdfff60",
          "syncOld": "  _gpVCHide(); // 패널 닫히면 커서 숨김",
          "syncNext": "  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpBtnsPrev['_back8']=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);",
          "openOld": "  const _gpOpenPanel=document.querySelector('.panel.on');",
          "openNext": "  const _gpSlot=$('skSlotPop');\n  const _gpOpenPanel=_gpSlot&&_gpSlot.style.display==='flex'?_gpSlot:document.querySelector('.panel.on');",
          "dpadOld": "const _anyPanelOpen=!!document.querySelector('.panel.on');",
          "dpadNext": "const _anyPanelOpen=!!document.querySelector('.panel.on')||!!($('skSlotPop')&&$('skSlotPop').style.display==='flex');",
          "startOld": "&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');",
          "startNext": "&&!(_gcEl&&_gcEl.classList.contains('on'))&&!($('skSlotPop')&&$('skSlotPop').style.display==='flex'))openPanel('settings');",
          "cases": [
            {
              "slotIdx": 1,
              "expectedSkill": "spikeTrap",
              "before": {
                "mode": "previous",
                "scenario": 1,
                "slotIdx": 1,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 1,
                "slotIdx": 1,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 2,
              "expectedSkill": "spikeTrap",
              "before": {
                "mode": "previous",
                "scenario": 2,
                "slotIdx": 2,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 2,
                "slotIdx": 2,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 3,
              "expectedSkill": "spikeTrap",
              "before": {
                "mode": "previous",
                "scenario": 3,
                "slotIdx": 3,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 3,
                "slotIdx": 3,
                "expectedSkill": "spikeTrap",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      null,
                      null,
                      null,
                      "spikeTrap",
                      null,
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 4,
              "expectedSkill": "giantSlam",
              "before": {
                "mode": "previous",
                "scenario": 4,
                "slotIdx": 4,
                "expectedSkill": "giantSlam",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 4,
                "slotIdx": 4,
                "expectedSkill": "giantSlam",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      "giantSlam",
                      null
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            },
            {
              "slotIdx": 5,
              "expectedSkill": "holyDome",
              "before": {
                "mode": "previous",
                "scenario": 5,
                "slotIdx": 5,
                "expectedSkill": "holyDome",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": true,
                    "owns": true,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              },
              "after": {
                "mode": "complete",
                "scenario": 5,
                "slotIdx": 5,
                "expectedSkill": "holyDome",
                "states": [
                  {
                    "label": "assignment",
                    "index": 1,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "still-held-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": false,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  },
                  {
                    "label": "fresh-gameplay-A",
                    "index": 0,
                    "display": "none",
                    "paused": false,
                    "owns": false,
                    "slots": [
                      "spikeTrap",
                      null,
                      null,
                      null,
                      null,
                      "holyDome"
                    ],
                    "mouseHeld": true,
                    "trace": [
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "vibrateSink",
                      "click:DIV",
                      "vibrateSink",
                      "click:DIV",
                      "updateQS",
                      "saveNowSink",
                      "textSink",
                      "pickupSink"
                    ]
                  }
                ],
                "trace": [
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "vibrateSink",
                  "click:DIV",
                  "vibrateSink",
                  "click:DIV",
                  "updateQS",
                  "saveNowSink",
                  "textSink",
                  "pickupSink"
                ]
              }
            }
          ],
          "openPopupSHA256": "a4a4b63be524fcea0c26e559179dcb1a2e42d2abfa322b754fdbfaa0095437d9",
          "closePopupSHA256": "267d1294dd397480ebc77381c2afa2e969961ea754d3508e1d2ea0d72f2f6540",
          "slotDefinitionsSHA256": "75db609ed74f85347366dac4d890f8a7c621edb59a78cefb14ce01854447bf53"
        }
      ]
    }
  ],
  "docProposals": [
    {
      "status": "memory-only/unapplied",
      "productionApplied": false,
      "runtimeAccepted": false,
      "search": {
        "utc": "2026-10-02T14:51:16.643Z",
        "command": [
          "rg",
          "-n",
          "--no-heading",
          "_skPopOwnsPause|_openSkillSlotPop|_closeSkPop|skSlotPop|openSkSlotPop",
          "docs/"
        ],
        "exit": 0,
        "rows": 14,
        "files": [
          "docs/CHANGELOG_SYNC.md",
          "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md",
          "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md"
        ],
        "sha256": "9bf1af58527d1ce272b6d6f0bf2555b17e0d97819174a00f0d2d2281534acdcb",
        "canonical": [
          "docs/CHANGELOG_SYNC.md:2980:| 일반 선택 스킬 | `sk.emoji` 시스템 이모지 | 퀵슬롯과 동일한 `_skIcon(sk.id)` PNG | `48×48px`, `object-fit:contain`; 이름 한 줄 고정; 미등록 시 기존 이모지 | `_openSkillSlotPop()`, `.sk-opt-icon`, `.sk-opt-name` |\r",
          "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:95:| **L** | 스킬 선택 관리창 | 슬롯별 활성 스킬 선택 (좌클/우클/SH/E/T/Q/CT 탭) | `openSkSlotPop()` |",
          "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:121:| 완료 후 | `_closeSkPop()` + `updateQS()` + `updateSkSlot()` + `renderSkillPanel()` + `dbSaveForce()`. 플로팅텍스트 `추천 자동: 습득 N / 합체 M`. 0건이면 `추천 진행할 항목 없음` 팝업 |",
          "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:803:| `openSkSlotPop` (L키) | 고정 슬롯 7개 + 선택 슬롯 `1/2/3/4/SP/F` 탭 표시. 선택 탭은 `_openSkillSlotPop(slotIdx)`로 연결 |",
          "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:807:| `_openSkillSlotPop` | 숫자슬롯 배정: `_getAllAbsorbed()` 제외 |",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:784:L키(`skillCycle`)로 여는 스킬 슬롯 배정 팝업(`#skSlotPop`, `openSkSlotPop()`)이 너무 작아 시인성 개선 + 배정 중 게임 정지 추가.\r",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:806:| L키 배정 팝업 탭 | 고정 슬롯 7개 + `1/2/3/4/SPACE/F` | `openSkSlotPop()`의 `isSlot:true`, `slotIdx:0~5` 탭 |\r",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:809:| 일반 팝업 목록 | 전대 소환을 포함한 일반 액티브 선택스킬, **영역·분노 폭발 제외** | `_openSkillSlotPop(0~3)` + `_canAssignSkillSlot()` |\r",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:820:| 일반 선택 스킬 | 각 `SKILL_LIST.name` | `sk.emoji` 시스템 이모지, 34px | 퀵슬롯과 같은 `_skIcon(sk.id)` PNG, `48×48px`, `object-fit:contain`; 이름은 `white-space:nowrap` | `_openSkillSlotPop()`, `.sk-opt-icon`, `.sk-opt-name` |\r",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:829:- 전역 플래그 `_skPopOwnsPause` + 닫기 헬퍼 `_closeSkPop()` 추가.\r",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:830:- 인게임에서 팝업을 열 때 `G.paused`가 false면 `G.paused=true` + `_skPopOwnsPause=true`.\r",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:831:- 닫힐 때 `_skPopOwnsPause`일 때만 `G.paused=false`로 복원 → 스킬 패널 등 **이미 정지된 상태에서 연 경우엔 정지 유지**(중첩 안전).\r",
          "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:832:- 모든 닫기 경로를 `_closeSkPop()`로 통일: L 재토글, 옵션/합체 클릭 세팅, ESC, 외부 클릭, `_panelBack`, 게임패드 Back. `closeAllPanels()`는 `_skPopOwnsPause=false` 클리어 추가.\r",
          "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:1085:| 동작 보존 |키 매핑·슬롯 수·스킬 장착/습득·저장·카드 상태 변경 없음. CSS만 수정. 좁은 화면 마지막 슬롯 클릭 시 기존 skSlotPop 열림 확인 |"
        ]
      },
      "changes": [
        {
          "path": "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md",
          "old": "- 모든 닫기 경로를 `_closeSkPop()`로 통일: L 재토글, 옵션/합체 클릭 세팅, ESC, 외부 클릭, `_panelBack`, 게임패드 Back. `closeAllPanels()`는 `_skPopOwnsPause=false` 클리어 추가.",
          "candidate": "- 닫기는 `_closeSkPop()`를 거친다. 고정 슬롯에서 선택 슬롯 `1/2/3/4/SPACE/F`로 전환하면 기존 일시정지 소유권을 유지하고, 선택 스킬 배정·해제 콜백도 `_closeSkPop()`로 닫아 팝업이 소유한 일시정지만 해제한다. 배정 가능한 스킬이 없으면 기존 고정 슬롯 팝업을 유지한다. 기존 패널에서 연 경우 그 패널의 일시정지는 유지한다. 실제 제품 통합 전 현재 소스에는 숫자 슬롯 직접 숨김 경로가 남아 있어 구현 확정으로 기록하지 않는다.",
          "table": [
            [
              "경로",
              "현재 소스",
              "후보",
              "소유권/슬롯/저장"
            ],
            [
              "고정→숫자→배정/해제",
              "숨김 후 owned pause 남음",
              "_closeSkPop 호출",
              "소유한 정지만 해제; 6슬롯, updateQS/dbSaveNow 호출 보존"
            ],
            [
              "고정→숫자(배정 스킬 없음)",
              "전환 전 숨김 후 early return",
              "전환 전 숨김 제거",
              "기존 팝업 유지, 오류 알림 보존"
            ],
            [
              "HUD 직접 숫자",
              "owned=false/G.paused=false",
              "같음",
              "스킬 이동·해제/저장 호출 trace 동등"
            ],
            [
              "기존 패널→숫자",
              "owned=false/G.paused=true",
              "같음",
              "패널 정지 보존"
            ]
          ]
        },
        {
          "path": "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md",
          "old": "| `openSkSlotPop` (L키) | 고정 슬롯 7개 + 선택 슬롯 `1/2/3/4/SP/F` 탭 표시. 선택 탭은 `_openSkillSlotPop(slotIdx)`로 연결 |",
          "candidate": "| `openSkSlotPop` (L키) | 고정 슬롯 7개 + 선택 슬롯 `1/2/3/4/SP/F` 탭 표시. 선택 탭은 `_openSkillSlotPop(slotIdx)`로 연결하며 성공 전 기존 팝업을 숨기지 않는다. 숫자 배정·해제는 `_closeSkPop()`로 종료하여 기존 일시정지 소유권을 정리한다. (총괄 통합 전 후보) |"
        }
      ],
      "protected2_3": "unchanged",
      "gate": "source/DOM doubles only; current production unmodified; root integration plus native CH1 demo required"
    },
    {
      "status": "memory-only/unapplied",
      "table": [
        [
          "항목",
          "현재 소스",
          "후보",
          "인수 조건"
        ],
        [
          "독립 #skSlotPop",
          "_pollGamepad UI 판정 누락",
          "display flex이면 UI 우선 선택, Dpad/Start 메뉴 전환 제한",
          "실제 패드 열기/닫기 확인"
        ],
        [
          "Back 재열기",
          "UI 밖 release가 _back8에 미반영",
          "일반 폴링에서도 pressed snapshot",
          "닫기→release→재열기→새 Back"
        ],
        [
          "소유한 정지",
          "_closeSkPop에서만 해제",
          "기존 full helper 사용",
          "기존 패널 정지 보존"
        ]
      ],
      "paths": [
        "docs/3.3 키바인딩+설정/",
        "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md"
      ],
      "productionApplied": false,
      "runtimeAccepted": false,
      "protected2_3": "unchanged"
    },
    {
      "status": "memory-only/unapplied",
      "sourceApplied": false,
      "nativeAccepted": false,
      "table": [
        [
          "검증 슬롯",
          "사용한 실제 source id",
          "기존 슬롯 처리",
          "후보 종료"
        ],
        [
          "1~4",
          "spikeTrap",
          "같은 스킬의 다른 슬롯 배정을 제거",
          "own pause=false"
        ],
        [
          "SPACE(index4)",
          "giantSlam",
          "일반 슬롯의 spikeTrap 유지",
          "own pause=false"
        ],
        [
          "F(index5)",
          "holyDome",
          "일반 슬롯의 spikeTrap 유지",
          "own pause=false"
        ]
      ],
      "newBoundary": "실제 _pollGamepad→_gpUINav→생성된 numeric tab onclick→_openSkillSlotPop option onclick→_closeSkPop; held A remains blocked until release/new A in full poll",
      "normalPreserved": "각 source/candidate 슬롯 결과 및 updateQS/dbSaveNow/addTxt/SFX trace 동일",
      "limitations": "DOM/Gamepad/clock/rumble/icon/fusion/renderer/save/audio endpoints doubled; 3 source skill objects only; native stage/demo acceptance absent",
      "paths": [
        "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md",
        "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md",
        "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md"
      ],
      "protected2_3": "unchanged"
    }
  ],
  "entryTriage": {
    "kind": "no source-remap candidate; documentation conflict only",
    "evidence": [
      {
        "file": "game.html",
        "sourceSHA256": "e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea",
        "cases": [
          {
            "scenario": "DpadLeft",
            "popDisplay": "none",
            "paused": true,
            "panel": "statPanel",
            "tabs": 0,
            "trace": []
          },
          {
            "scenario": "KeyboardL",
            "popDisplay": "flex",
            "paused": true,
            "panel": null,
            "tabs": 13,
            "trace": []
          }
        ]
      },
      {
        "file": "game-easy-test.html",
        "sourceSHA256": "68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390",
        "cases": [
          {
            "scenario": "DpadLeft",
            "popDisplay": "none",
            "paused": true,
            "panel": "statPanel",
            "tabs": 0,
            "trace": []
          },
          {
            "scenario": "KeyboardL",
            "popDisplay": "flex",
            "paused": true,
            "panel": null,
            "tabs": 13,
            "trace": []
          }
        ]
      }
    ],
    "finding": "actual DpadLeft→statPanel versus default KeyboardL→openSkSlotPop. GP_BINDS is explicitly unused legacy. Preserve current behavior pending root docs resolution."
  },
  "unaccepted": {
    "productionApplied": false,
    "nativeAccepted": false,
    "gameplaySaveAudioVisualAccepted": false
  },
  "sharedCallerGate": "_gpUINav is unchanged by this candidate. Test pins use current production generic selector; root BALANCE/forge candidate or pending native-toolbar/generic-navigation candidates have NOT been composed here. Root must inspect shared caller compatibility and exact source pins before applying; this evidence is not a shared caller or forge acceptance.",
  "repeatAudit": {
    "testsRerunForSaving": 0,
    "previousMinusDeathReplayReentrantPopupTestsRerun": 0,
    "distinctPairGates": 36,
    "sourceOrPartialCandidateCompleteExecutions": 72,
    "initialTruncatedNumericRunCounted": 0
  },
  "limits": [
    "Gamepad/DOM/layout/clock/rumble are explicit doubles",
    "numeric source skill objects are a 1/3 item subset, not every available skill",
    "updateQS/dbSaveNow/dbSaveForce/save/text/SFX/icon/fusion/render endpoints are explicit sinks or helpers",
    "full update entry triage returns at actual pause guard before gameplay; logical KeyL input fixture is not native keyboard",
    "source/VM evidence does not prove actual CH1-1 start/acquisition/boss/death/retry demo"
  ],
  "postCodeArtifactDocsSearch": {
    "UTC": "2026-10-02T15:01:48.309Z",
    "command": [
      "rg",
      "-n",
      "--no-heading",
      "_skPopOwnsPause|_openSkillSlotPop|_closeSkPop|skSlotPop|_back8|_pollGamepad|L키/D-pad",
      "docs/"
    ],
    "exitCode": 0,
    "rowCount": 24,
    "files": [
      "docs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md",
      "docs/2_1 스킬관리+합체시스템+자원/BONEWALL_FOCUS_CANCELLATION_20261002.md",
      "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md",
      "docs/3.3 키바인딩+설정/GAMEPAD_HUD_LABEL_FIX_20260910.md",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md",
      "docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md"
    ],
    "SHA256": "60334b0be33e2ab98b4af080fe2fde1c3a772008119c9273b3adfbbf2ca7209e",
    "matches": [
      "docs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md:100:keyboard는 실제 keyup/KH release 경로와 KBM mouse의1000 clamp를 실행한다. GP LT+조합 release는 실제 `MBjust[0]` 분기를 실행하며 KH release를 강제한 대체 모형이 아니다. 다만 전체 `_pollGamepad`나 하드웨어 입력 실행은 아니다.",
      "docs/2_1 스킬관리+합체시스템+자원/BONEWALL_FOCUS_CANCELLATION_20261002.md:31:| 대역 | pad button/event/document 및 P/G 상태, damage/stat/proficiency/presentation/audio sink. 전체 _pollGamepad/update/DOM/게임루프 실행 아님 |",
      "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:121:| 완료 후 | `_closeSkPop()` + `updateQS()` + `updateSkSlot()` + `renderSkillPanel()` + `dbSaveForce()`. 플로팅텍스트 `추천 자동: 습득 N / 합체 M`. 0건이면 `추천 진행할 항목 없음` 팝업 |",
      "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:803:| `openSkSlotPop` (L키) | 고정 슬롯 7개 + 선택 슬롯 `1/2/3/4/SP/F` 탭 표시. 선택 탭은 `_openSkillSlotPop(slotIdx)`로 연결 |",
      "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:807:| `_openSkillSlotPop` | 숫자슬롯 배정: `_getAllAbsorbed()` 제외 |",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:1085:| 동작 보존 |키 매핑·슬롯 수·스킬 장착/습득·저장·카드 상태 변경 없음. CSS만 수정. 좁은 화면 마지막 슬롯 클릭 시 기존 skSlotPop 열림 확인 |",
      "docs/CHANGELOG_SYNC.md:2980:| 일반 선택 스킬 | `sk.emoji` 시스템 이모지 | 퀵슬롯과 동일한 `_skIcon(sk.id)` PNG | `48×48px`, `object-fit:contain`; 이름 한 줄 고정; 미등록 시 기존 이모지 | `_openSkillSlotPop()`, `.sk-opt-icon`, `.sk-opt-name` |\r",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:784:L키(`skillCycle`)로 여는 스킬 슬롯 배정 팝업(`#skSlotPop`, `openSkSlotPop()`)이 너무 작아 시인성 개선 + 배정 중 게임 정지 추가.\r",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:809:| 일반 팝업 목록 | 전대 소환을 포함한 일반 액티브 선택스킬, **영역·분노 폭발 제외** | `_openSkillSlotPop(0~3)` + `_canAssignSkillSlot()` |\r",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:820:| 일반 선택 스킬 | 각 `SKILL_LIST.name` | `sk.emoji` 시스템 이모지, 34px | 퀵슬롯과 같은 `_skIcon(sk.id)` PNG, `48×48px`, `object-fit:contain`; 이름은 `white-space:nowrap` | `_openSkillSlotPop()`, `.sk-opt-icon`, `.sk-opt-name` |\r",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:829:- 전역 플래그 `_skPopOwnsPause` + 닫기 헬퍼 `_closeSkPop()` 추가.\r",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:830:- 인게임에서 팝업을 열 때 `G.paused`가 false면 `G.paused=true` + `_skPopOwnsPause=true`.\r",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:831:- 닫힐 때 `_skPopOwnsPause`일 때만 `G.paused=false`로 복원 → 스킬 패널 등 **이미 정지된 상태에서 연 경우엔 정지 유지**(중첩 안전).\r",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:832:- 모든 닫기 경로를 `_closeSkPop()`로 통일: L 재토글, 옵션/합체 클릭 세팅, ESC, 외부 클릭, `_panelBack`, 게임패드 Back. `closeAllPanels()`는 `_skPopOwnsPause=false` 클리어 추가.\r",
      "docs/3.3 키바인딩+설정/GAMEPAD_HUD_LABEL_FIX_20260910.md:8:| 표시 맵 | LT+A, LT+B, LT+Y, LT+X, LT, RT, A, RS, LB, X, Y, RB, B. `_SK_SLOTS` 순서. LT+Y=Digit3, LT+X=Digit4는 기존 `_pollGamepad`의 `_LT_COMBO`와 일치하며 입력 변경 없음 |",
      "docs/3.3 키바인딩+설정/GAMEPAD_HUD_LABEL_FIX_20260910.md:13:| 실제 런타임 | server.cjs:3333의 게임을 별도 Chrome 컨텍스트에서 실행. 모의 Gamepad API 스틱 입력→실제 `_pollGamepad`→패드13개 라벨, 실제 KeyboardEvent→KBM2개 복귀 PASS. 슬롯 API 격리·저장 차단. `tmp/pad_hud_20260910/report.json`, pad.png/keyboard.png 육안 확인 |",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:383:게임패드 연결 시 자동 감지 — 매 프레임 `_pollGamepad()`이 `getGamepads()`를 직접 폴링 (2026-07-05~ 이벤트 의존 제거, BT 재연결 대응). `gamepadconnected` 이벤트·`_gpBootDetect()`는 보조. 단절 시 `_gpClearAll()`로 주입 키 즉시 해제. 상세: 게임패드_트러블슈팅.md\r",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:409:| L키/D-pad ← 팝업 | `1/2/3/4/SPACE/F` 선택 탭 노출 | 1~4=일반, SPACE=`giantSlam`/`giantSlam2`/`skyCrusher`, F=영역만 표시 |\r",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:430:- `GP_BINDS`, `_pollGamepad()`, `_gpAct()`, `_gpJust()`: game.html `isAct` 바로 위\r",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:431:- `_pollGamepad()` 호출: `loop()` 함수 매 프레임 시작부\r",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:631:| GP LT+ABXY | 실제 `_gpInjectKey` 및 LT modifier 경계, `MBjust[0]` 기반 release | `navigator.getGamepads`·전체 `_pollGamepad`·실기기·연결 전환 |\r",
      "docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md:17:| 1 | `_pollGamepad()`이 `if(!_gpConnected)return`으로 **`gamepadconnected` 이벤트에만 의존**. BT 재연결 시 크로미움이 이벤트를 안 쏘는 경우(페이지 비포커스 중 재연결 등) `_gpConnected=false`로 고정 → 리로드 전까지 패드 영구 사망. index.html은 무조건 폴링이라 로비만 멀쩡했음 | 이벤트 의존 제거 — 매 프레임 `getGamepads()` 직접 폴링으로 연결 감지 (`[GAMEPAD] 폴링 감지:` 로그). index.html과 동일 방식 |",
      "docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md:72:| 연결 감지 | **`_pollGamepad()` 매 프레임 직접 폴링** (2026-07-05~) + `gamepadconnected` 리스너 + `_gpBootDetect()` (1초×5회 재시도) | `_gpConnected=true`, `_gpVibRef` 캐시. 폴링 감지 시 `[GAMEPAD] 폴링 감지:` 로그 |",
      "docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md:73:| 폴링 | `_pollGamepad()` — 메인 루프 매 프레임 (try/catch, 에러 시 `[GAMEPAD] poll error`) | 패드 소실 시 `_gpClearAll()` 후 return (`_gpActive`는 유지 — 재연결 시 패드모드 복귀) |"
    ]
  }
}
```

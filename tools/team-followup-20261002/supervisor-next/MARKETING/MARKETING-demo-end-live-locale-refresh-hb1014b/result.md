# 열린 데모 종료 화면 언어 갱신 — 소스 재현·메모리 후보

taskId: MARKETING-demo-end-live-locale-refresh-hb1014b  
provider: Codex / OpenAI; chatId: 01a0fae0-cff3-78f0-aa73-32b08c6d6055; sessionId: UNKNOWN.  
productionApplied=false / runtimeAccepted=false.

**양판에서 열린 종료 화면의 KO→EN 갱신 누락을 실제 caller로 재현했다.** OPT.lang과 문서 언어는 en으로 바뀌지만 demoEnd의 title/msg/support/wishlist/lobby 다섯 리프는 KO로 남는다. 실제 EN 사전에는 다섯 기존 키가 모두 존재하므로 이 사건은 번역키 부족이 아닌 refresh 연결 누락이다. 다섯 리프만 갱신하는 최소 memory 후보와 처음 표시·왕복·DOM 안전 control을 완료했다.

## 정확 위치·관측

| 대상 | game.html / easy 위치 | 원본 | memory 후보 |
|---|---|---|---|
| 설정 caller | optLang.onchange L47247 / L45848 | OPT.lang=this.value → _applyLang → renderSettings → saveSettings | caller 변경 없음 |
| refresh | _applyLang L47257 / L45858 | 기존 HUD·설정·다른 UI 갱신. demoEnd 리프5개 호출 없음 | _refreshPersistentHudLanguage 다음 _refreshDemoEndLanguage 호출1개 |
| demoEndTitle | 기존 키 데모 종료 | 열린 KO 유지 | End of Demo |
| demoEndMsg | 기존 키 여기까지 데모입니다. 정식 출시를 기대해주세요! | 열린 KO 유지 | This is the end of the demo. Looking forward to the full release! |
| demoEndSupport | 기존 키 STEAM 위시리스트로 응원해 주세요! | 열린 KO 유지 | Support us by wishlisting on Steam! |
| demoEndWishlist | 기존 키 STEAM 위시리스트 | 열린 KO 유지 | Wishlist on Steam |
| demoEndLobby | 기존 키 로비로 돌아가기 | 열린 KO 유지 | Return to Lobby |

위 EN은 **실행한 현재 _T/EN 사전·병합 데이터의 관측값**이다. 새 번역 문구나 출시 공약을 작성한 것이 아니다. URL/onclick/제품 소개문 수정0.

## root 인계용 최소 patch — 미적용

두 HTML에서 같은 helper를 추가하고 _applyLang 시작의 기존 HUD 갱신 뒤 호출한다:

```js
function _refreshDemoEndLanguage(){
  const labels=[['demoEndTitle','데모 종료'],['demoEndMsg','여기까지 데모입니다. 정식 출시를 기대해주세요!'],['demoEndSupport','STEAM 위시리스트로 응원해 주세요!'],['demoEndWishlist','STEAM 위시리스트'],['demoEndLobby','로비로 돌아가기']];
  for(const [id,ko] of labels){const el=document.getElementById(id);if(el&&el.children.length===0)el.textContent=_T(ko);}
}
```

```diff
 function _applyLang(){try{
   OPT.lang=ExoduserI18n.applyDocumentLanguage(document,OPT.lang);
   _refreshPersistentHudLanguage();
+  _refreshDemoEndLanguage();
```

parent demoEnd, title wrapper의 장식, 버튼 자식·onclick은 건드리지 않는다. 각 id를 직접 선택하고 children.length===0일 때만 textContent를 변경한다. 나중에 어떤 리프가 자식 구조를 가지면 해당 대상은 스킵하며 새 DOM 구조 정책을 임의 결정하지 않는다. hidden 상태에서도 리프 번역만 갱신하고 display를 변경하지 않는다.

## 실제 실행과 검수 영수증

checker: [checks.mjs](/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/checks.mjs)

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/checks.mjs /Users/fordeargamers/Projects/exoduser-migration-20261001
```

| 실행 시작 관찰 UTC (KST=UTC+9) | exit | 원인·수정 |
|---|---|---|
| 11:04:19 | 1 | _applyLang의 try/catch 끝을 일반 newline closing brace로 잘라 Missing catch or finally. 하니스 오류, source 결함 수로 계산0. |
| 11:04:30 | 1 | declaration/caller 합성 Unexpected end of input. 단일행 _L 추출 경계 보완. |
| 11:04:41 | 1 | 같은 합성 오류 지속. 선언별 compile로 실패 위치를 좁혔다. |
| 11:04:49 | 1 | _LANG_TBL IIFE를 내부 첫 세미콜론까지 추출한 오류 확인. _LANG_*는 실제 단일행 전체로 추출하도록 수정. |
| **11:04:57 → 완료11:04:57.860 / 20:04:57.860 KST** | **0** | SOURCE_CANDIDATE_CONTROLS_PASS, 전체 JSON 영수증 확보. |

앞선 실패를 숨기지 않았으며 최종 실행1회만 완료 근거로 채택한다. source 추출은 각 fragment의 vm.Script 컴파일과 anchor SHA로 고정한다. 기존 완료 검사·전체 검사·전건 route/nextStage/showCharGate control·root expanded _skUnclick 재실행0.

최종 실행의 관측:

- 양판 원본: 실제 onchange→전체 _applyLang 뒤 다섯 KO 텍스트 유지 RED. 사전 직접 _T 조회는 EN 다섯 키를 반환.
- 후보: normal/hidden/nested/missing 네 변형에서 KO→EN→KO 왕복. 버튼 handler·노드 identity·marker·children 보존, parent 쓰기0. nested title은 갱신하지 않고 자식 보존; 누락 노드는 안전하게 스킵.
- 정상 처음 표시: **기존 최초 표시의 다섯 label assignment fragment만** EN에서 실행한 결과와 후보 refresh 후 텍스트 동일. nextStage 함수/분기/route는 실행하지 않았다. 이미 갱신되는 일반 toLobbyBtn의 EN 결과도 유지.
- missing dictionary/key: FR lang_*.js를 로드하지 않은 명시적 대역에서 원문 KO 반환, synthetic 미등록 키는 그대로 반환. 실제 FR 배포 번역 누락으로 보고하지 않는다. fallback 정책·새 번역 추가0.
- 음성 control: helper 호출만 제거한 메모리 body에서 다섯 KO 잔존 재검출. 판별기가 연결 누락을 감지함을 확인.

## 실행 경계·source 고정

실제 optLang caller, 전체 _applyLang/_T/_L/_refreshPersistentHudLanguage, 실제 _EN/_EN_PFX/_EN_BASE와 _LANG_* 선언, 실제 localization-data 병합, localization-runtime.js를 Node VM에서 실행했다. FR 등 별도 lang_*.js는 로드하지 않는다. DOM·설정 render/save·펫 refresh·동적 슬롯 함수는 명시적 대역이다. 관련 없는 설정/HUD 노드는 fixture에서 부재이며 그 UI 전체를 검수한 것이 아니다. fake counter로 결함을 대신하지 않고 실제 다섯 textContent를 판정했다.

원본 byte 시작/끝 변동0, 입력·caller·사전·first-show fragment SHA는 아래 evidence에 고정했다. checks SHA `298c0b0378d3bbb3818c6c20a54594608b957d23be17b04b188a84cd3586c5b3`. currentHEAD UNKNOWN/Git조회0. parent 제공 d5c1b62d는 TASK가 명시한 역사 기준이며 현재 HEAD로 재해석하지 않는다. SKILL/STORY cinematic·다른 WIP 수정0. 실게임·브라우저·localStorage·native·HTTP·GPU·청취·스토어·배포 검수0.

감독 registry의 11:05:09.304 UTC 읽기에는 Changes77(updatedAt11:02:19.288 UTC)가 기록되어 있다. 독립 Git count가 아니다. registry currentTaskPath는 전건을 가리키는 snapshot이므로 현재 TASK는 이번 실제 Read와 SHA로 확인했다. 80 checkpoint 관리는 감독/root 소유이며 새 파일은2개만; 현재 누적 상태 재확인은 감독에 인계한다.

## docs 전체 검색·canonical 정확 old/new 인계

코드 산출 후 아래 전체 docs 검색 **1회**, exit0:

```sh
rg -n --max-columns 180 --max-columns-preview 'demoEndTitle|demoEndMsg|demoEndSupport|demoEndWishlist|demoEndLobby|_applyLang|_refreshPersistentHudLanguage' docs/
```

| canonical 정확 절 | old | new 문안 / 상태 |
|---|---|---|
| docs/13출시·마케팅/13출시·마케팅.md 「데모 종료 화면 (#demoEnd)」 L95–104 | 최초 표시의 키·CTA만 기록. 열린 상태 설정 언어 갱신 계약 없음 | “현재 양판 _applyLang에는 demoEnd 리프5개 refresh가 없어 열린 KO→EN 전환에서 원문이 잔존한다. _refreshDemoEndLanguage 후보는 기존키를 _T로 조회하고 직접 선택한 childless 리프5개만 갱신한다. source 후보 검수 완료·생산 미적용·native 미검수.” root 적용 후 구현 상태만 갱신. |
| docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md 「2026-09-16 Steam 반려 대응」 표 뒤 신설 「데모 종료 화면 live refresh 후보 — 2026-10-02」 | 열린 안내/펫 갱신만 있음 | “optLang.onchange→_applyLang→_refreshDemoEndLanguage 연결 후보. 대상 id=demoEndTitle/demoEndMsg/demoEndSupport/demoEndWishlist/demoEndLobby. 각 el 존재·children.length===0 검사. hidden display/parent/onclick/자식 유지. _T의 누락 키·사전 원문 반환 정책 유지.” |
| docs/16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md 「구현 계약」 뒤 검수 보충 | boot 리프 등 과거 언어 검수 | “이번 KO/EN source VM 검수는 종료화면 refresh 연결과 리프 구조 안전 검수이며 완역·29언어·native/배포 승인 아님. FR dictionary 대역 부재 관측은 실제 번역 누락으로 계산하지 않는다.” |
| docs/16영문화(i18n)/영문화_진행현황.md 「정적 HTML은 _applyLang에서 동적 교체」 기록에 보충 | 정적 HTML 동적 교체 일반 정책 | “데모 종료 리프5개 누락과 candidate 상태는 위 LOCALIZATION_RUNTIME 정본을 따른다. 새 번역키0/사전 값 변경0.” |
| HUD/펫/인벤/튜토리얼 관련 검색 매칭 문서, CHANGELOG 과거 이력 | 기존 갱신·DOM 보존 계약 | 해당 함수·수치·기존 승인 이력 변경0. 필요한 연결 링크만 위 정본으로 인계. 보호2_3 및 Q전용 blackBean·어택티켓·LOCK/TBD 변경0. |

공유docs 직접쓰기0. 생산 인수와 canonical 동기화는 root가 순차 수행한다.

## JSON evidence

```json
{
  "taskId": "MARKETING-demo-end-live-locale-refresh-hb1014b",
  "provider": "Codex / OpenAI",
  "chatId": "01a0fae0-cff3-78f0-aa73-32b08c6d6055",
  "sessionId": null,
  "policyMetadata": {
    "at": "2026-10-02T11:05:09.304Z",
    "cwd": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
    "policyHashes": [
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/TASK.md",
        "sha256": "64680b4513ca190ff1b0aad9b2e9a01dacdaf0adb995971ec832df5be5485dc0"
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
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md",
        "sha256": "54746bcb4a0b3c093a3e779c32da911a088afb383655d58ea7894690688e160e"
      }
    ],
    "registry": {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json",
      "updatedAt": "2026-10-02T11:02:19.288804+00:00",
      "changesCountCurrent": 77,
      "task": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-release-route-closure-hb1014/TASK.md"
    }
  },
  "execution": {
    "taskId": "MARKETING-demo-end-live-locale-refresh-hb1014b",
    "executedAt": "2026-10-02T11:04:57.860Z",
    "root": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
    "node": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node",
    "inputHashes": [
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
      },
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057"
      },
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization-runtime.js",
        "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
      },
      {
        "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization-data.js",
        "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
      }
    ],
    "anchors": [
      {
        "file": "game.html",
        "name": "apply",
        "line": 47257,
        "sha256": "aa96f334e56bf57b97150f76ee9f8613d509c77f9ec8943ba67891faaf00f4b8"
      },
      {
        "file": "game.html",
        "name": "caller",
        "line": 47247,
        "sha256": "a7d407cb0a3e2ed43465a16f0d5a2db0dc5b8e2e4f919352854cbf097d71b2f5"
      },
      {
        "file": "game.html",
        "name": "firstShow",
        "line": 42447,
        "sha256": "e85792d78d3478f1a5b82ea57e3b717f70bf7071d8bfdee5fcd699337acef44b"
      },
      {
        "file": "game.html",
        "name": "T",
        "line": 8409,
        "sha256": "4225bda9f6889d61287c7015f6d4db7bcf40f6fccc4db77f976862f9f1d5464e"
      },
      {
        "file": "game.html",
        "name": "EN",
        "line": 6204,
        "sha256": "8351a2249d2f4e13cde127e6cfe3ce864bfa90f9073d618285016793b54ccbb7"
      },
      {
        "file": "game-easy-test.html",
        "name": "apply",
        "line": 45858,
        "sha256": "9d3df2c3ebe432355704214efb4e417ef47b25da8499e9e741ecb9bf2cee6abd"
      },
      {
        "file": "game-easy-test.html",
        "name": "caller",
        "line": 45848,
        "sha256": "a7d407cb0a3e2ed43465a16f0d5a2db0dc5b8e2e4f919352854cbf097d71b2f5"
      },
      {
        "file": "game-easy-test.html",
        "name": "firstShow",
        "line": 41246,
        "sha256": "e85792d78d3478f1a5b82ea57e3b717f70bf7071d8bfdee5fcd699337acef44b"
      },
      {
        "file": "game-easy-test.html",
        "name": "T",
        "line": 7947,
        "sha256": "399d09ac39c60ce9388ffc6b2e623e404bd5fe3b00b3d0a68d020a9ab89d01cf"
      },
      {
        "file": "game-easy-test.html",
        "name": "EN",
        "line": 5742,
        "sha256": "49cfc7b37d0744fa31f144e8d3fc78c6e1047700a2cc3c90ded3e18acb6e0568"
      }
    ],
    "records": [
      {
        "file": "game.html",
        "phase": "actual-open-ko-en",
        "actual": [
          [
            "demoEndTitle",
            "데모 종료"
          ],
          [
            "demoEndMsg",
            "여기까지 데모입니다. 정식 출시를 기대해주세요!"
          ],
          [
            "demoEndSupport",
            "STEAM 위시리스트로 응원해 주세요!"
          ],
          [
            "demoEndWishlist",
            "STEAM 위시리스트"
          ],
          [
            "demoEndLobby",
            "로비로 돌아가기"
          ]
        ],
        "expected": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "defect": "five labels remain KO after actual onchange/_applyLang"
      },
      {
        "file": "game.html",
        "phase": "candidate-roundtrip",
        "variant": "normal",
        "en": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "flex"
      },
      {
        "file": "game.html",
        "phase": "candidate-roundtrip",
        "variant": "hidden",
        "en": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "none"
      },
      {
        "file": "game.html",
        "phase": "candidate-roundtrip",
        "variant": "nested",
        "en": [
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "flex"
      },
      {
        "file": "game.html",
        "phase": "candidate-roundtrip",
        "variant": "missing",
        "en": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "flex"
      },
      {
        "file": "game.html",
        "phase": "fresh-en-control",
        "freshText": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ]
      },
      {
        "file": "game.html",
        "phase": "fallback-observation",
        "locale": "fr",
        "labels": [
          [
            "demoEndTitle",
            "데모 종료"
          ],
          [
            "demoEndMsg",
            "여기까지 데모입니다. 정식 출시를 기대해주세요!"
          ],
          [
            "demoEndSupport",
            "STEAM 위시리스트로 응원해 주세요!"
          ],
          [
            "demoEndWishlist",
            "STEAM 위시리스트"
          ],
          [
            "demoEndLobby",
            "로비로 돌아가기"
          ]
        ],
        "absentKeyUnchanged": true,
        "scope": "FR lang_*.js not loaded: explicit missing dictionary control, not actual FR translation QA"
      },
      {
        "file": "game.html",
        "phase": "negative-control",
        "removedHookDetected": true
      },
      {
        "file": "game-easy-test.html",
        "phase": "actual-open-ko-en",
        "actual": [
          [
            "demoEndTitle",
            "데모 종료"
          ],
          [
            "demoEndMsg",
            "여기까지 데모입니다. 정식 출시를 기대해주세요!"
          ],
          [
            "demoEndSupport",
            "STEAM 위시리스트로 응원해 주세요!"
          ],
          [
            "demoEndWishlist",
            "STEAM 위시리스트"
          ],
          [
            "demoEndLobby",
            "로비로 돌아가기"
          ]
        ],
        "expected": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "defect": "five labels remain KO after actual onchange/_applyLang"
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-roundtrip",
        "variant": "normal",
        "en": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "flex"
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-roundtrip",
        "variant": "hidden",
        "en": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "none"
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-roundtrip",
        "variant": "nested",
        "en": [
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "flex"
      },
      {
        "file": "game-easy-test.html",
        "phase": "candidate-roundtrip",
        "variant": "missing",
        "en": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ],
        "leafOnly": true,
        "identityHandlersChildrenPreserved": true,
        "display": "flex"
      },
      {
        "file": "game-easy-test.html",
        "phase": "fresh-en-control",
        "freshText": [
          [
            "demoEndTitle",
            "End of Demo"
          ],
          [
            "demoEndMsg",
            "This is the end of the demo. Looking forward to the full release!"
          ],
          [
            "demoEndSupport",
            "Support us by wishlisting on Steam!"
          ],
          [
            "demoEndWishlist",
            "Wishlist on Steam"
          ],
          [
            "demoEndLobby",
            "Return to Lobby"
          ]
        ]
      },
      {
        "file": "game-easy-test.html",
        "phase": "fallback-observation",
        "locale": "fr",
        "labels": [
          [
            "demoEndTitle",
            "데모 종료"
          ],
          [
            "demoEndMsg",
            "여기까지 데모입니다. 정식 출시를 기대해주세요!"
          ],
          [
            "demoEndSupport",
            "STEAM 위시리스트로 응원해 주세요!"
          ],
          [
            "demoEndWishlist",
            "STEAM 위시리스트"
          ],
          [
            "demoEndLobby",
            "로비로 돌아가기"
          ]
        ],
        "absentKeyUnchanged": true,
        "scope": "FR lang_*.js not loaded: explicit missing dictionary control, not actual FR translation QA"
      },
      {
        "file": "game-easy-test.html",
        "phase": "negative-control",
        "removedHookDetected": true
      }
    ],
    "helper": "function _refreshDemoEndLanguage(){\n  const labels=[['demoEndTitle','데모 종료'],['demoEndMsg','여기까지 데모입니다. 정식 출시를 기대해주세요!'],['demoEndSupport','STEAM 위시리스트로 응원해 주세요!'],['demoEndWishlist','STEAM 위시리스트'],['demoEndLobby','로비로 돌아가기']];\n  for(const [id,ko] of labels){const el=document.getElementById(id);if(el&&el.children.length===0)el.textContent=_T(ko);}\n}",
    "checksSha256": "298c0b0378d3bbb3818c6c20a54594608b957d23be17b04b188a84cd3586c5b3",
    "sourceChanged": [],
    "productionApplied": false,
    "runtimeAccepted": false,
    "status": "SOURCE_CANDIDATE_CONTROLS_PASS",
    "boundary": "actual onchange and full _applyLang/_T/_L/_refreshPersistentHudLanguage plus actual EN declarations/merge and localization runtime/data; first-show labels fragment only; DOM, unrelated HUD updates, settings render/save, pet refresh explicit stubs; no routes, live game/storage/browser/network"
  },
  "tools": {
    "nodeCommand": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/checks.mjs /Users/fordeargamers/Projects/exoduser-migration-20261001",
    "finalExit": 0,
    "taskRead": {
      "command": "cat tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/TASK.md",
      "exit": 0
    },
    "policyRead": {
      "command": "cat tools/team-followup-20261002/continuous/COMMON.md\ncat AGENTS.md\ncat docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "exit": 0,
      "outputTruncated": true
    },
    "ssotRead": {
      "command": "rg -n --max-columns 230 --max-columns-preview 'optLang|_refresh.*[Ll]ang|function.*[Ll]ang|function _T\\(|demoEnd|function.*[Ll]ocal' game.html | tail -45\nsed -n '95,105p' 'docs/13출시·마케팅/13출시·마케팅.md'\nsed -n '1,38p' 'docs/16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md'",
      "exit": 0
    },
    "sourceRead": {
      "command": "sed -n '47247,47374p' game.html; sed -n '8400,8420p' game.html; source symbol rg (see exact fragments/lines)",
      "exit": 0
    },
    "docsSearch": {
      "command": "rg -n --max-columns 180 --max-columns-preview 'demoEndTitle|demoEndMsg|demoEndSupport|demoEndWishlist|demoEndLobby|_applyLang|_refreshPersistentHudLanguage' docs/",
      "exit": 0
    },
    "metadataRead": {
      "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'\nimport {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';\nconst paths=['tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','AGENTS.md','docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/13출시·마케팅/13출시·마케팅.md','docs/16번역·로컬라이제이션/STEAM_LANGUAGE_FINISH_20260923.md'];\nconst p='docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json';const d=JSON.parse(readFileSync(p));console.log(JSON.stringify({at:new Date().toISOString(),cwd:process.cwd(),policyHashes:paths.map(p=>({path:process.cwd()+'/'+p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})),registry:{path:process.cwd()+'/'+p,updatedAt:d.updatedAt,changesCountCurrent:d.changesCountCurrent,task:d.rows.find(x=>x.role==='MARKETING')?.currentTaskPath}}));\nJS",
      "exit": 0
    },
    "canonicalRead": {
      "command": "sed -n '60,71p' docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md; sed -n '1,17p' docs/16번역·로컬라이제이션/ENGLISH_CHARACTER_BADGE_HUD_20260922.md",
      "exit": 0
    },
    "runReceipts": [
      [
        "11:04:19",
        1,
        "missing catch"
      ],
      [
        "11:04:30",
        1,
        "unexpected end"
      ],
      [
        "11:04:41",
        1,
        "unexpected end"
      ],
      [
        "11:04:49",
        1,
        "_LANG_TBL truncation"
      ],
      [
        "2026-10-02T11:04:57.860Z",
        0,
        "SOURCE_CANDIDATE_CONTROLS_PASS"
      ]
    ]
  },
  "ownership": [
    "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/checks.mjs",
    "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/MARKETING/MARKETING-demo-end-live-locale-refresh-hb1014b/result.md"
  ],
  "skillsUsed": [],
  "skillsReason": "narrow local source fixture; external workflows not needed",
  "privacy": "raw prompts, thinking, auth and personal data excluded"
}
```

## 완료와 실제 제품 Gate

root가 helper·call1을 검토/통합한 뒤 해당 source SHA의 실제 native 데모 종료 화면에서 설정 언어변경 접근 가능 여부, KO↔EN 텍스트/버튼/장식·레이아웃 보존, 선택 언어 저장/복원 및 배포 포함을 별도 검수해야 한다. fixture의 render/save 대역 통과는 실제 UI·저장 통과가 아니다. 필수 새 정책 결정 없음. 이번 checker 완료는 실제품 Gate 대기로 막히지 않는다.

새 파일2개 외 생산·공유docs·Git·기존산출·타WIP·실게임/저장·서버·빌드·설치·권한·게시·외부사이트/메시지·새팀/채팅·삭제/이동/cleanup0. 추가 업무 자체 생성0.

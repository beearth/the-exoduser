# ITEM — 동일 장착 인스턴스 재장착 전승 손실

**양쪽 실제 원함수에서 강화 손실과 결정 자동탈착을 재현했고, 한 줄 메모리 guard와 정상 교체 control이 통과했다.** productionApplied=false/runtimeAccepted=false, 생산/공유docs/Git 변경0이다. 이번8실행/6검증그룹만 보고하며 기존499/500·binding/전체 검사 반복0이다.

## 재현·후보·정상 control

| 양쪽 입력/원문 | 결과 |
|---|---|
| 장착 armor와 bag[0]가 동일 객체, enh2/rarity5, 소켓1개에 해당 판의 방어 결정1개, 악의10000 | 실제 _invBagRightClick(0)→equipItem: 비용1000 차감·enh2→0·환수13→4. 소켓은null, 결정은주머니로이동1. 결정 identity/총량1 보존; 총량 손실/복제를 관측했다고 주장하지 않음 |
| 동일 입력＋메모리 guard | mats/enh/refund/crystals/binding/가방/그리드 전부 불변. equip의 recalc/SFX/lesson/save0. caller의 applyStats/renderInv 대역은 기존대로 각1회이며 전체 UI 호출0이라고 주장하지 않음 |
| 서로 다른 장착/새 armor 객체, 새 소켓1개 empty | 원문/후보 상태·호출순서 동일. mats9000, 새enh2/oldenh0·환수4, 동일결정이 새소켓으로전승·주머니0, 동일old 가방반환. old D10 binding 참조 그대로 |

2강 이전비는 실제 xferCost/_malCost의 _malCost(ceil(2×1000))=1000이며 할인상수0.5를 원문 실행했다. rarity5→경제등급4의 배율1.8, 레거시누적항ceil(2×1.8)=4를2회 합산×0.5하여환수4. 공식/비용/환수율/결정슬롯/D10 schema 변경0.

## reachable 경계

main/easy의 장착칸 상세/우클릭은 unequip을 호출하고 가방 상세 장착 버튼과 _invBagRightClick은 INV.bag 참조를 전달한다. main의 _equipEarringTo는 bag.includes 가드도 있다. 정상 pickup/장착 이동은 가방과 장착칸을 분리하므로 **정상 UI만으로 동일참조가 생성됐다고 증명하지 않았다**. world item pickup·storage withdraw는 객체를 가방으로 전달하지만 이번엔 실제 drop/restore/storage 실행0이다.

명시적 INV.bag[0]===INV.equipped.armor alias 입력에서 actual bag-right-click caller는 membership/동일객체 차단 없이 해당 참조를 넘기며 원함수의 old와item이같다. 이는 조건부 reachable source 증거다. root가 실제게임발생빈도/alias유입을 추가 확인해야 하며 사용자 세이브를 조사/수리하지 않았다. guard는 alias자료를 정리하지 않고 동일객체 호출의 추가손실만 막는다.

## 최소 메모리 patch

main은 _equipSlot/명시earring target 계산 후, easy는 item.slot 조회 후 각 old declaration 바로 다음에 아래1줄만삽입했다. 레벨/bonePart 가드·다른객체 정상전승 순서는 그대로다. 함수 시그니처를 바꾸거나 item.id로 객체 identity를 대체하지 않았다.

```diff
 const old=INV.equipped[equipSlot]; // main; easy uses INV.equipped[item.slot]
+if(old===item)return;
```

## 원문/실행 증거

UTC 2026-10-02T10:40:03.609Z→2026-10-02T10:40:03.792Z; KST는 아래JSON에기록. 각 판 전체source/read SHA 및 함수/caller/상수/패치anchors SHA를 고정했다. 공유WIP가바뀌면 시작/종료관측을 구분하며 historical6b865637을currentHEAD라쓰지 않는다.

| 원함수 | 현재행 | SHA-256 |
|---|---|---|
| game.html equipItem | 15571 | 32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6 |
| game.html _invBagRightClick | 46964 | 50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47 |
| game.html xferCost | 26888 | 1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2 |
| game.html _equipSlot | 15557 | 95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e |
| game-easy-test.html equipItem | 14679 | 494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179 |
| game-easy-test.html _invBagRightClick | 45567 | 50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47 |
| game-easy-test.html xferCost | 25763 | 1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2 |

actual 전체equip/caller와비용·환수등급·enhColor/helper·결정데이터를실행했다. 대역은level/좌표/grid·UI후처리/음향/저장관찰기이며 가짜enh/결정이전counter로core처리를대체하지않았다. 합법합성 armor 및결정인스턴스만주입했다. main은cr_martyr_tear/easy는cr_hp의현행데이터와armor허용을사용했다. real stat/UI/audio/DB/native는미검수다.

## docs old/new 인계

전체docs rg1회: 80행/32파일. 공유docs 쓰기0이며 감독/root에게다음표를인계한다.

| 정본/항목 | old 현재 | new 통합 시 정확문안 |
|---|---|---|
| 인벤토리 장착 자동전승 | old===item도강화/결정전승진입 | “equipItem은 계산된 장착 대상old와item이동일참조면전승전return한다. 동일인스턴스에는악의차감/enh초기화/_enhRefund기록/결정이동/가방교체/장착후처리가없다. caller applyStats/renderInv는기존대로다.” |
| ITEM_TEAM_MASTER | 동일인스턴스보호생산미적용 | “양쪽 원함수alias재장착의강화2→0·악의1000차감·결정소켓→주머니를재현했다. 메모리identityguard로불변, 서로다른객체control강화·결정전승동등. 담당6그룹/8실행,생산미적용·실게임미검수.” |
| 저장 SSOT/환수 | 레거시누적식floor(합×.5),비용 _malCost(ceil(n×1000)) | 공식/필드/D10 binding은불변. “동일참조guard는재호출보호이며저장schema/alias마이그레이션/누락binding보충이아니다. productionApplied=false 상태는root통합전까지유지한다.” |

양판control필수경계까지완료했으며runtime gate는실제caller/alias유입·기존강화/결정UI·저장/재실행검수다. 귀걸이슬롯간이동·가득찬결정주머니·grid실패/특수장비는이번표본범위밖이다. root _skUnclick/카드minus 조사·검사0. 소유2파일만작성, 새업무/새팀/삭제/메시지0.

## 실행 evidence JSON

```json
{
  "taskId": "ITEM-equip-same-instance-transfer-hb1014",
  "provider": "existing ITEM Codex chat",
  "supervisorChatId": "01a0fb1e-4ec3-7dd3-bba2-f87518e881fa",
  "currentChatId": null,
  "providedHistoricalPin": "6b865637; not independently observed HEAD",
  "startedUTC": "2026-10-02T10:40:03.609Z",
  "endedUTC": "2026-10-02T10:40:03.792Z",
  "endedKST": "2026-10-02T19:40:03.792+09:00",
  "root": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
  "owner": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014",
  "realpath": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014",
  "symlink": false,
  "reads": [
    {
      "path": "game.html",
      "sha256AtRead": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "sha256AtEnd": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "same": true
    },
    {
      "path": "game-easy-test.html",
      "sha256AtRead": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "sha256AtEnd": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "same": true
    },
    {
      "path": "AGENTS.md",
      "sha256AtRead": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "sha256AtEnd": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "same": true
    },
    {
      "path": "tools/team-followup-20261002/continuous/COMMON.md",
      "sha256AtRead": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "sha256AtEnd": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "same": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014/TASK.md",
      "sha256AtRead": "aa21d507fc4c4230992717d127fc3b18f0ef3378495e02875dd7be8f7b259548",
      "sha256AtEnd": "aa21d507fc4c4230992717d127fc3b18f0ef3378495e02875dd7be8f7b259548",
      "same": true
    },
    {
      "path": "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "sha256AtRead": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "sha256AtEnd": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "same": true
    },
    {
      "path": "docs/7아이템디자인/ITEM_TEAM_MASTER.md",
      "sha256AtRead": "d18f90ae89c01960e482304c39eee3a9a720cf6e4e351902560664ef34199087",
      "sha256AtEnd": "d18f90ae89c01960e482304c39eee3a9a720cf6e4e351902560664ef34199087",
      "same": true
    },
    {
      "path": "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "sha256AtRead": "29e01d81a0632beb91cac804407510f322e2bd94bee505d2db33c69b82d54c3c",
      "sha256AtEnd": "29e01d81a0632beb91cac804407510f322e2bd94bee505d2db33c69b82d54c3c",
      "same": true
    },
    {
      "path": "docs/14밸런스+수치테이블/자원소비량표.md",
      "sha256AtRead": "a2e4b4eca00af6a1cc539e42338391c812ed38786e786ce0ae543d7f167680fc",
      "sha256AtEnd": "a2e4b4eca00af6a1cc539e42338391c812ed38786e786ce0ae543d7f167680fc",
      "same": true
    },
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "sha256AtRead": "1012258348172717c7daab97daedf2f063acf82469456a5e0483d6644534cae0",
      "sha256AtEnd": "1012258348172717c7daab97daedf2f063acf82469456a5e0483d6644534cae0",
      "same": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-enhancement-gate-binding-0557/TASK.md",
      "sha256AtRead": "de15be45d277208a11833ec51f4a4706bc7e9cb19155e409cc96770aaa027a2e",
      "sha256AtEnd": "de15be45d277208a11833ec51f4a4706bc7e9cb19155e409cc96770aaa027a2e",
      "same": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-enhancement-gate-binding-0557/result.md",
      "sha256AtRead": "fd66478444e2eba61e1cd2fd44ccca01d3c1e955e7eeabc8c48c270ce717e837",
      "sha256AtEnd": "fd66478444e2eba61e1cd2fd44ccca01d3c1e955e7eeabc8c48c270ce717e837",
      "same": true
    }
  ],
  "anchors": [
    {
      "file": "game.html",
      "label": "equipItem",
      "line": 15571,
      "bytes": 3528,
      "sha256": "32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6"
    },
    {
      "file": "game.html",
      "label": "_invBagRightClick",
      "line": 46964,
      "bytes": 264,
      "sha256": "50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47"
    },
    {
      "file": "game.html",
      "label": "xferCost",
      "line": 26888,
      "bytes": 124,
      "sha256": "1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2"
    },
    {
      "file": "game.html",
      "label": "_malCost",
      "line": 26868,
      "bytes": 122,
      "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
    },
    {
      "file": "game.html",
      "label": "_itemEconomyRarity",
      "line": 26973,
      "bytes": 81,
      "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509"
    },
    {
      "file": "game.html",
      "label": "enhColor",
      "line": 26892,
      "bytes": 444,
      "sha256": "8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc"
    },
    {
      "file": "game.html",
      "label": "_earringSlot",
      "line": 15556,
      "bytes": 73,
      "sha256": "d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971"
    },
    {
      "file": "game.html",
      "label": "_equipSlot",
      "line": 15557,
      "bytes": 165,
      "sha256": "95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e"
    },
    {
      "file": "game.html",
      "label": "_MALICE_COST_MUL",
      "line": 26867,
      "bytes": 26,
      "sha256": "a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9"
    },
    {
      "file": "game.html",
      "label": "CR_ATK_SLOTS",
      "line": 14623,
      "bytes": 44,
      "sha256": "b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32"
    },
    {
      "file": "game.html",
      "label": "CR_ARMOR_SLOTS",
      "line": 14624,
      "bytes": 71,
      "sha256": "7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395"
    },
    {
      "file": "game.html",
      "label": "CR_ACC_SLOTS",
      "line": 14625,
      "bytes": 98,
      "sha256": "e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e"
    },
    {
      "file": "game.html",
      "label": "CR_DEF_SLOTS",
      "line": 14627,
      "bytes": 54,
      "sha256": "72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70"
    },
    {
      "file": "game.html",
      "label": "CRYSTAL_DEFS",
      "line": 14629,
      "bytes": 3218,
      "sha256": "5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28"
    },
    {
      "file": "game.html",
      "label": "CRYSTAL_BAG_MAX",
      "line": 14720,
      "bytes": 26,
      "sha256": "d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175"
    },
    {
      "file": "game.html",
      "label": "reachable: function pickupItem(",
      "line": 15675,
      "bytes": 20,
      "sha256": "be4fe16853f2e0b3dc227e2e63f97c09e4a150041891ee8d042965eb5a359924"
    },
    {
      "file": "game.html",
      "label": "reachable: if(source==='bag')",
      "line": 47987,
      "bytes": 18,
      "sha256": "b451c52b2ba1bb1baaefde44446b57c310686642ef45cf9379752cdd06249393"
    },
    {
      "file": "game.html",
      "label": "reachable: function withdrawStorage(",
      "line": 46970,
      "bytes": 25,
      "sha256": "6c5c0ddcef12b8e4623d0ff02af4387281f289bac0b6b0761228b356ed890883"
    },
    {
      "file": "game.html",
      "label": "reachable: onclick=\"equipItem(INV.bag[${idx}]);applyStats();renderInv()\"",
      "line": 48069,
      "bytes": 61,
      "sha256": "b814635994f4a048773d48cf8dc550bb30b2bead0f7007e0af1f512e81b9e2a7"
    },
    {
      "file": "game.html",
      "label": "reachable: onclick=\"unequipItem('${idx}');applyStats();renderInv()\"",
      "line": 48080,
      "bytes": 56,
      "sha256": "ad75bcc0ad8478ca2ecd45f59d4e43ac15ec982d9f9a59ffc8e6b34805d224e9"
    },
    {
      "file": "game-easy-test.html",
      "label": "equipItem",
      "line": 14679,
      "bytes": 3407,
      "sha256": "494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179"
    },
    {
      "file": "game-easy-test.html",
      "label": "_invBagRightClick",
      "line": 45567,
      "bytes": 264,
      "sha256": "50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47"
    },
    {
      "file": "game-easy-test.html",
      "label": "xferCost",
      "line": 25763,
      "bytes": 124,
      "sha256": "1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2"
    },
    {
      "file": "game-easy-test.html",
      "label": "_malCost",
      "line": 25743,
      "bytes": 122,
      "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
    },
    {
      "file": "game-easy-test.html",
      "label": "_itemEconomyRarity",
      "line": 25848,
      "bytes": 81,
      "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509"
    },
    {
      "file": "game-easy-test.html",
      "label": "enhColor",
      "line": 25767,
      "bytes": 444,
      "sha256": "8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc"
    },
    {
      "file": "game-easy-test.html",
      "label": "_MALICE_COST_MUL",
      "line": 25742,
      "bytes": 26,
      "sha256": "a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9"
    },
    {
      "file": "game-easy-test.html",
      "label": "CR_ATK_SLOTS",
      "line": 14020,
      "bytes": 44,
      "sha256": "b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32"
    },
    {
      "file": "game-easy-test.html",
      "label": "CR_ARMOR_SLOTS",
      "line": 14021,
      "bytes": 71,
      "sha256": "7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395"
    },
    {
      "file": "game-easy-test.html",
      "label": "CR_ACC_SLOTS",
      "line": 14022,
      "bytes": 86,
      "sha256": "f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726"
    },
    {
      "file": "game-easy-test.html",
      "label": "CR_DEF_SLOTS",
      "line": 14024,
      "bytes": 54,
      "sha256": "72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70"
    },
    {
      "file": "game-easy-test.html",
      "label": "CRYSTAL_DEFS",
      "line": 14025,
      "bytes": 1923,
      "sha256": "aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e"
    },
    {
      "file": "game-easy-test.html",
      "label": "CRYSTAL_BAG_MAX",
      "line": 14084,
      "bytes": 26,
      "sha256": "d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175"
    },
    {
      "file": "game-easy-test.html",
      "label": "reachable: function pickupItem(",
      "line": 14782,
      "bytes": 20,
      "sha256": "be4fe16853f2e0b3dc227e2e63f97c09e4a150041891ee8d042965eb5a359924"
    },
    {
      "file": "game-easy-test.html",
      "label": "reachable: if(source==='bag')",
      "line": 46571,
      "bytes": 18,
      "sha256": "b451c52b2ba1bb1baaefde44446b57c310686642ef45cf9379752cdd06249393"
    },
    {
      "file": "game-easy-test.html",
      "label": "reachable: function withdrawStorage(",
      "line": 45573,
      "bytes": 25,
      "sha256": "6c5c0ddcef12b8e4623d0ff02af4387281f289bac0b6b0761228b356ed890883"
    },
    {
      "file": "game-easy-test.html",
      "label": "reachable: onclick=\"equipItem(INV.bag[${idx}]);applyStats();renderInv()\"",
      "line": 46624,
      "bytes": 61,
      "sha256": "b814635994f4a048773d48cf8dc550bb30b2bead0f7007e0af1f512e81b9e2a7"
    },
    {
      "file": "game-easy-test.html",
      "label": "reachable: onclick=\"unequipItem('${idx}');applyStats();renderInv()\"",
      "line": 46626,
      "bytes": 56,
      "sha256": "ad75bcc0ad8478ca2ecd45f59d4e43ac15ec982d9f9a59ffc8e6b34805d224e9"
    }
  ],
  "rows": [
    {
      "file": "game.html",
      "same": true,
      "patched": false,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": []
      },
      "after": {
        "mats": 9000,
        "equipped": "old",
        "bag": [],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": [
          {
            "id": "cr_martyr_tear",
            "enh": 0
          }
        ]
      },
      "events": [
        "notify:⚒ +2 강화 이전 완료 (-1,000악의)",
        "addTxt",
        "notify:💎 결정 주머니로: ✢순교자의 눈물",
        "recalc",
        "sfx",
        "notify:검토 기존 갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 1,
        "sfx": 1,
        "save": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": false,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": false
    },
    {
      "file": "game.html",
      "same": true,
      "patched": true,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": []
      },
      "after": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": []
      },
      "events": [
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 0,
        "sfx": 0,
        "save": 0,
        "lesson": 0,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": true,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": true
    },
    {
      "file": "game.html",
      "same": false,
      "patched": false,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "next"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 0,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "after": {
        "mats": 9000,
        "equipped": "next",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 2,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "events": [
        "notify:⚒ +2 강화 이전 완료 (-1,000악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체 갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 1,
        "sfx": 1,
        "save": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": false,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": true
    },
    {
      "file": "game.html",
      "same": false,
      "patched": true,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "next"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 0,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "after": {
        "mats": 9000,
        "equipped": "next",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 2,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_martyr_tear",
              "enh": 0
            }
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "events": [
        "notify:⚒ +2 강화 이전 완료 (-1,000악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체 갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 1,
        "sfx": 1,
        "save": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": false,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": true
    },
    {
      "file": "game-easy-test.html",
      "same": true,
      "patched": false,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": []
      },
      "after": {
        "mats": 9000,
        "equipped": "old",
        "bag": [],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": [
          {
            "id": "cr_hp",
            "enh": 0
          }
        ]
      },
      "events": [
        "notify:⚒ +2 강화 이전 완료 (-1,000악의)",
        "addTxt",
        "notify:💎 결정 주머니로: ❤HP결정",
        "recalc",
        "sfx",
        "notify:검토 기존 갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 1,
        "sfx": 1,
        "save": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": false,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": false
    },
    {
      "file": "game-easy-test.html",
      "same": true,
      "patched": true,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": []
      },
      "after": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "crystalBag": []
      },
      "events": [
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 0,
        "sfx": 0,
        "save": 0,
        "lesson": 0,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": true,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": true
    },
    {
      "file": "game-easy-test.html",
      "same": false,
      "patched": false,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "next"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 0,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "after": {
        "mats": 9000,
        "equipped": "next",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 2,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "events": [
        "notify:⚒ +2 강화 이전 완료 (-1,000악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체 갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 1,
        "sfx": 1,
        "save": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": false,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": true
    },
    {
      "file": "game-easy-test.html",
      "same": false,
      "patched": true,
      "cost": 1000,
      "before": {
        "mats": 10000,
        "equipped": "old",
        "bag": [
          "next"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 2,
          "_enhRefund": 13,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 0,
          "_gy": 0,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 0,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "after": {
        "mats": 9000,
        "equipped": "next",
        "bag": [
          "old"
        ],
        "old": {
          "id": "old",
          "slot": "armor",
          "name": "검토 기존 갑옷",
          "rarity": 5,
          "enh": 0,
          "_enhRefund": 4,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            null
          ],
          "_gx": 2,
          "_gy": 3,
          "uniqueId": "UI-10",
          "uniqueRoll": {
            "version": 1,
            "effectId": "U-D10",
            "stat": "_uSlamEmberRage",
            "unit": "fraction",
            "storedValue": 0.15
          }
        },
        "target": {
          "id": "next",
          "slot": "armor",
          "name": "교체 갑옷",
          "rarity": 0,
          "enh": 2,
          "reqLv": 0,
          "socketCount": 1,
          "crystals": [
            {
              "id": "cr_hp",
              "enh": 0
            }
          ],
          "_gx": 2,
          "_gy": 3
        },
        "crystalBag": []
      },
      "events": [
        "notify:⚒ +2 강화 이전 완료 (-1,000악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체 갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "recalc": 1,
        "sfx": 1,
        "save": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      },
      "totalCrystalCount": 1,
      "returnType": "undefined",
      "bindingIdentity": true,
      "crystalArrayIdentity": true,
      "bagIdentity": false,
      "crystalIdentity": true,
      "equippedIdentity": true,
      "oldInBag": true
    }
  ],
  "validation": {
    "groups": [
      "game.html: original alias defect reproduced (enh loss; crystal ejection, no total loss)",
      "game.html: same-instance memory guard preserves all domain state",
      "game.html: distinct-object enhancement/crystal transfer normal control equivalent",
      "game-easy-test.html: original alias defect reproduced (enh loss; crystal ejection, no total loss)",
      "game-easy-test.html: same-instance memory guard preserves all domain state",
      "game-easy-test.html: distinct-object enhancement/crystal transfer normal control equivalent"
    ],
    "passed": 6,
    "failed": 0,
    "actualEquipAndCallerExecutions": 8,
    "previousTestsRepeated": 0
  },
  "candidatePatch": "Insert if(old===item)return; immediately after computed old assignment, before enhancement transfer, in each equipItem.",
  "productionApplied": false,
  "runtimeAccepted": false,
  "stubs": [
    "P.lv/position",
    "same-size 2x3 grid",
    "inventory panel dataset",
    "translation/crystal display text",
    "notify/addTxt/recalc/equipSfx/lesson/save/applyStats/renderInv observation only",
    "Math.random throw guard"
  ],
  "actual": [
    "both full equipItem and _invBagRightClick functions",
    "main _earringSlot/_equipSlot functions",
    "xferCost/_malCost/rarity/enhColor and cost constant",
    "actual crystal slot/definition/MAX constants; synthetic legal crystal instances"
  ],
  "limits": [
    "alias in bag/equipped is explicitly supplied, not produced by normal UI proof",
    "self crystal moved to bag; total crystal count preserved in sample",
    "normal single empty socket tested; full bag/grid/crystal capacity variants not tested",
    "audio/stat/DB/native/runtime not executed",
    "level/earring target/swap variant coverage not claimed"
  ],
  "docsSearch": {
    "command": [
      "rg",
      "-n",
      "equipItem|_equipSlot|xferCost|_enhRefund|결정 전승|결정 자동 전승|강화 전승|강화 이전|동일 객체|동일.*인스턴스",
      "docs/"
    ],
    "exit": 0,
    "lines": 80,
    "files": [
      "docs/HELL_EXODUSER_WORLDVIEW_v2.md",
      "docs/7아이템디자인/exoduser-item-system-full.md",
      "docs/7아이템디자인/ITEM_TEAM_MASTER.md",
      "docs/7아이템디자인/UNIQUE_TOP8_HOOK_REVIEW_20261001.md",
      "docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/CHANGELOG_DAILY_20260520.md",
      "docs/15 세이브+데이터구조/SAVE_BODY_ERROR_RESPONSE_20261002.md",
      "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md",
      "docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md",
      "docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md",
      "docs/12퍼포먼스·최적화/성능최적화_보고서_2026-05-23.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/0마스터플랜/mac-resume-20261001/map020-zoomfix-evidence/team-receipts.json",
      "docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md",
      "docs/0마스터플랜/mac-resume-20261001/map020-zoomfix-evidence/ANIMVFX-팀검토.md",
      "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "docs/16번역·로컬라이제이션/RESUME_LANGUAGE_INTEGRATION_20260923.md",
      "docs/0마스터플랜/mac-resume-20261001/map020-evidence/팀실행-영수증.json",
      "docs/16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-BALANCE-integration-result.md",
      "docs/2게임디자인레벨디자인/SYSTEM_TUTORIAL_20260912.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md",
      "docs/2게임디자인레벨디자인/RESOURCE_PRACTICE_20260912.md",
      "docs/5.1임펙트디자인/VFX_구현가이드.md",
      "docs/2게임디자인레벨디자인/PLAYER_GUIDE_20260912.md",
      "docs/0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BALANCE-refund-overflow-result.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ANIMVFX-task.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ANIMVFX-result.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BALANCE-refund-overflow-receipt.json"
    ],
    "outputSHA256": "f68e0a322a7e5008713f31e432bc3c0a864a99602e29c334f22a4c15283b30ca"
  },
  "commands": [
    {
      "command": "exact TASK first Read and bounded canonical/source/caller reads",
      "exit": 0
    },
    {
      "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014/checks.mjs",
      "exit": 0
    }
  ],
  "errors": [],
  "toolsActuallyCalled": [
    "functions.exec / exec_command",
    "functions.exec / apply_patch"
  ],
  "skillsUsed": [],
  "writes": [
    "checks.mjs",
    "result.md"
  ],
  "gitCommands": 0,
  "productionSharedDocsPriorArtifactsWrites": 0,
  "gameServerHTTPSaveBuildImageInstallPublish": 0,
  "newTeamsChatsMessages": 0,
  "deletion": 0,
  "checksSHA256": "b35567bd0886834ef481fa5f84a9a3968198a124c3ce616cbe1083fc13a9a6c2"
}
```

최종 산출 무결성 영수증(새 VM 재실행0):

```json
{
  "atUTC": "2026-10-02T10:40:32.082Z",
  "command": "designated Node --input-type=module: owned Acorn/checks SHA/embedded evidence/directory/current SHA verification",
  "exit": 0,
  "newTestsRepeated": 0,
  "ownedOutputs": 2,
  "currentObservations": [
    {
      "path": "game.html",
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "unchanged": true
    },
    {
      "path": "game-easy-test.html",
      "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "unchanged": true
    },
    {
      "path": "AGENTS.md",
      "sha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "unchanged": true
    },
    {
      "path": "tools/team-followup-20261002/continuous/COMMON.md",
      "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "unchanged": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014/TASK.md",
      "sha256": "aa21d507fc4c4230992717d127fc3b18f0ef3378495e02875dd7be8f7b259548",
      "unchanged": true
    },
    {
      "path": "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "sha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "unchanged": true
    },
    {
      "path": "docs/7아이템디자인/ITEM_TEAM_MASTER.md",
      "sha256": "d18f90ae89c01960e482304c39eee3a9a720cf6e4e351902560664ef34199087",
      "unchanged": true
    },
    {
      "path": "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "sha256": "29e01d81a0632beb91cac804407510f322e2bd94bee505d2db33c69b82d54c3c",
      "unchanged": true
    },
    {
      "path": "docs/14밸런스+수치테이블/자원소비량표.md",
      "sha256": "a2e4b4eca00af6a1cc539e42338391c812ed38786e786ce0ae543d7f167680fc",
      "unchanged": true
    },
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "sha256": "1012258348172717c7daab97daedf2f063acf82469456a5e0483d6644534cae0",
      "unchanged": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-enhancement-gate-binding-0557/TASK.md",
      "sha256": "de15be45d277208a11833ec51f4a4706bc7e9cb19155e409cc96770aaa027a2e",
      "unchanged": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-enhancement-gate-binding-0557/result.md",
      "sha256": "fd66478444e2eba61e1cd2fd44ccca01d3c1e955e7eeabc8c48c270ce717e837",
      "unchanged": true
    }
  ]
}
```

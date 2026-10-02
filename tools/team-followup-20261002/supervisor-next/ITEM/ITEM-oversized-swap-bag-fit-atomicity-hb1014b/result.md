# ITEM — 크기가 다른 장착 교체와 가방 fit 원자성

**NO-FIX: 요청된 큰 기존장비/작은 새장비 조합은 현행 합법 장착 정의에 없다.** 실제 소스 검수기를 완성하고 양판의 grid-null 관측과 정상 fit 대조를 실행했다. 임의 크기/가짜 _itemSz/_invFindSpace로 실패를 만들지 않았으며 memoryCandidate=null, productionApplied=false/runtimeAccepted=false다.

## 실패 전제와 실제 관측의 구분

| 대상 | 실제 source/SSOT | 판정 |
|---|---|---|
| ITEM_SIZE | 일반 장착 장비 모두2×2; main headband2도2×2, easy는fallback 정책을확대하지않음 | 서로 다른 크기의 합법 장착쌍0 |
| WTYPE_SIZE/BTYPE_SIZE | 현행 무기7타입/활3타입 모두2×2 | weapon/bow도크기차이없음 |
| bonePart | 1×1이지만 equipItem은 registerBonePart로조기return | 작은 새 장비로장착할수없음 |
| 가방 | cols10, BAG_MAX300, _invRows=max(10,ceil(300×4/10))=120 | 실제1200셀을2×2 장비300개로빈틈없이채움 |
| full grid helper | _invFindSpace(2,2,-1,old)=null | 아직새장비가점유중이어서추가공간없음; 교체실패와동일하지않음 |
| released replacement | _invFindSpace(2,2,0,old)={x:0,y:0} | 대상새장비의가방index0 점유를skip하면기존장비가동일footprint에fit |
| free-hole control | 장비1개제외하여299개, noSkip={x:2,y:0}, skipNext={x:0,y:0} | 정상공간관측을full-grid null과분리 |

양쪽 actual bag-right-click→equipItem은 full300 및hole299 대조 모두성공했다. 원문은 같은크기의old에새장비좌표0/0을재사용한다. 실제 _invCanPlace와 _invGrid로남은모든가방장비의배치/충돌과정확점유량(1200/1196셀)을검증했고겹침/삭제/강제확장0이다.

old armor enh3/rarity5·합법소켓결정1개·D10 binding0.15, next armor enh0/empty socket, 악의10000의원문강화/결정전승도그대로실행했다. mats8500, 새enh3/oldenh0·legacy환수6, 동일결정새소켓전승/주머니0, old동일객체가가방반환되고binding참조불변이다. 비용/환수helper를실행했지만이는새 full-grid control의부수관측이며이전499/500·alias 검사를반복하지않았다.

## memory 후보와 정책 Gate

서로 다른크기를허용하는생산정의가없으므로preflight거부patch를생산결함수정으로제안하지않았다. 새size정의/legacy 예외가승인될때만old!=item의반환공간을경제/결정변경전에검사하는후속후보를검수할수있다. 그때새장비가가방에서나가는footprint를반드시반영해야한다. full-grid noSkip=null만으로교체를거부하면이번합법control을잘못막는다.

SSOT는같은분류장비간겹침금지·10열/공통BAG_MAX300·가방좌표보존·강화부족교체차단을확정한다. 하지만본요청의oversized replacement 실패정책을승인한근거는없다. 미확정새size·거부/다른자리재배치정책을임의채택하지않았다. runtime gate를구현중단사유로삼은것이아니라actual taxonomy에서필수실패입력자체가없음을검증한결과다.

## SHA·명령·실행 경계

UTC 2026-10-02T11:05:42.951Z→2026-10-02T11:05:43.395Z; 전체source시작/종료와모든함수/상수SHA는아래evidence JSON. TASK 제공hash를실제대조했다. historical d5c1b62d는현재HEAD가아니며Git0이다. 이전산출읽기만/이전검사반복0, _skUnclick 검사0.

- game.html: actual legal wearable size definitions all 2x2; no oversized legal pair
- game.html: actual full grid null without skip, valid released replacement footprint
- game.html: whole bag caller/equip full-grid and free-hole controls preserve legal placement and transfer
- game-easy-test.html: actual legal wearable size definitions all 2x2; no oversized legal pair
- game-easy-test.html: actual full grid null without skip, valid released replacement footprint
- game-easy-test.html: whole bag caller/equip full-grid and free-hole controls preserve legal placement and transfer

새6그룹/실제caller+equip4회. actual grid/size/find/collision함수전체를실행했으며가짜grid-counter/수동nullhelper0. UI/음향/stat/DB후처리만명시대역이다. caller applyStats/renderInv각1회, save1회, RNG0은해당표본경계이며게임전체판정아님. 합법synthetic일반장비300/299개이며실게임/세이브를열지않았다.

## docs old/new 인계

전체docs rg1회: 24행/8파일. 공유docs쓰기는root 소유다.

| 정본 | old/기존 정보 | new 정확 추가문안 |
|---|---|---|
| 인벤토리 장착교체/그리드 | 크기차이시old좌표를null로만들고후처리에findSpace; 현행taxonomy설명분산 | “현재main/easy의합법일반장착장비·weapon/bow subtype는2×2, bonePart1×1은도감등록이다. 같은크기교체는새장비의기존가방footprint를old가재사용한다. full-grid findSpace(skip=-1)=null은새장비점유를해제한교체실패증거가아니다.” |
| ITEM_TEAM_MASTER | oversized 교체원자성검수없음 | “ITEM-oversized-swap-bag-fit-atomicity-hb1014b: actual양판size/grid/caller/equip의full300/hole299 control6그룹PASS. 큰old/작은new합법정의0이라실패재현·메모리patch0/NO-FIX. 미래size정의와거부정책Gate 유지,생산0·실제품미검수.” |
| 저장/경제 SSOT | BAG_MAX300·10열·좌표/강화환수/binding | 모두불변. “이번검토는새저장필드/좌표강제수리/가방확장/환수변경/결정삭제정책을채택하지않았다.” |

소유result/checks2파일만작성했다. 제품Gate는실제아이템/가방UI·저장재실행·미배치/legacy자료와미래variable-size정책이다. 이한건을종료하고자체다음업무를만들지않는다.

## evidence JSON

```json
{
  "taskId": "ITEM-oversized-swap-bag-fit-atomicity-hb1014b",
  "verdict": "NO-FIX / oversized trigger absent in current legal definitions",
  "currentChatId": "01a0faaf-92a3-7eb1-842d-eb4baa1a2954",
  "chatIdSource": "TASK provided existing assigned chat; no independent UI lookup",
  "historicalProvidedPin": "d5c1b62d; no current HEAD query",
  "startedUTC": "2026-10-02T11:05:42.951Z",
  "endedUTC": "2026-10-02T11:05:43.395Z",
  "endedKST": "2026-10-02T20:05:43.395+09:00",
  "root": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
  "owner": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/ITEM/ITEM-oversized-swap-bag-fit-atomicity-hb1014b",
  "realpath": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/ITEM/ITEM-oversized-swap-bag-fit-atomicity-hb1014b",
  "reads": [
    {
      "path": "game.html",
      "before": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "after": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "same": true
    },
    {
      "path": "game-easy-test.html",
      "before": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "after": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "same": true
    },
    {
      "path": "AGENTS.md",
      "before": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "after": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "same": true
    },
    {
      "path": "tools/team-followup-20261002/continuous/COMMON.md",
      "before": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "after": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "same": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-oversized-swap-bag-fit-atomicity-hb1014b/TASK.md",
      "before": "e659c9355bf9946d70c339df7ede27eec77b49a935286a913d60fde66dc4c25f",
      "after": "e659c9355bf9946d70c339df7ede27eec77b49a935286a913d60fde66dc4c25f",
      "same": true
    },
    {
      "path": "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "before": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "after": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "same": true
    },
    {
      "path": "docs/7아이템디자인/ITEM_TEAM_MASTER.md",
      "before": "d18f90ae89c01960e482304c39eee3a9a720cf6e4e351902560664ef34199087",
      "after": "d18f90ae89c01960e482304c39eee3a9a720cf6e4e351902560664ef34199087",
      "same": true
    },
    {
      "path": "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "before": "29e01d81a0632beb91cac804407510f322e2bd94bee505d2db33c69b82d54c3c",
      "after": "29e01d81a0632beb91cac804407510f322e2bd94bee505d2db33c69b82d54c3c",
      "same": true
    },
    {
      "path": "docs/14밸런스+수치테이블/자원소비량표.md",
      "before": "a2e4b4eca00af6a1cc539e42338391c812ed38786e786ce0ae543d7f167680fc",
      "after": "a2e4b4eca00af6a1cc539e42338391c812ed38786e786ce0ae543d7f167680fc",
      "same": true
    },
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "before": "1012258348172717c7daab97daedf2f063acf82469456a5e0483d6644534cae0",
      "after": "1012258348172717c7daab97daedf2f063acf82469456a5e0483d6644534cae0",
      "same": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014/result.md",
      "before": "1288758d599ea15622d7caeeb0e6f085658a4e2cb6819a1333b16d205cac82d1",
      "after": "1288758d599ea15622d7caeeb0e6f085658a4e2cb6819a1333b16d205cac82d1",
      "same": true
    }
  ],
  "anchors": [
    {
      "file": "game.html",
      "name": "equipItem",
      "line": 15571,
      "sha256": "32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6"
    },
    {
      "file": "game.html",
      "name": "_invBagRightClick",
      "line": 46964,
      "sha256": "50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47"
    },
    {
      "file": "game.html",
      "name": "_invRows",
      "line": 15459,
      "sha256": "e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37"
    },
    {
      "file": "game.html",
      "name": "_itemSz",
      "line": 15461,
      "sha256": "46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b"
    },
    {
      "file": "game.html",
      "name": "_invCategoryKey",
      "line": 15466,
      "sha256": "b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501"
    },
    {
      "file": "game.html",
      "name": "_invGrid",
      "line": 15467,
      "sha256": "74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47"
    },
    {
      "file": "game.html",
      "name": "_invFindSpace",
      "line": 15478,
      "sha256": "50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788"
    },
    {
      "file": "game.html",
      "name": "_invCanPlace",
      "line": 15531,
      "sha256": "77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90"
    },
    {
      "file": "game.html",
      "name": "xferCost",
      "line": 26888,
      "sha256": "1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2"
    },
    {
      "file": "game.html",
      "name": "_malCost",
      "line": 26868,
      "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
    },
    {
      "file": "game.html",
      "name": "_itemEconomyRarity",
      "line": 26973,
      "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509"
    },
    {
      "file": "game.html",
      "name": "enhColor",
      "line": 26892,
      "sha256": "8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc"
    },
    {
      "file": "game.html",
      "name": "_earringSlot",
      "line": 15556,
      "sha256": "d0c11fda07829175ada1697e77c6b086342a9d928d1ea6bd6bd0bff390537971"
    },
    {
      "file": "game.html",
      "name": "_equipSlot",
      "line": 15557,
      "sha256": "95bd4ef520c883a0e65bfe8bfb87737bcce206fee4824ff4ed092fe1175b916e"
    },
    {
      "file": "game.html",
      "name": "ITEM_SIZE",
      "line": 15113,
      "sha256": "72c417ed3bfe40586cf4658715f84e1e47d599fc5eeb9fe2d789a1a229b8504e"
    },
    {
      "file": "game.html",
      "name": "WTYPE_SIZE",
      "line": 15115,
      "sha256": "76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715"
    },
    {
      "file": "game.html",
      "name": "BTYPE_SIZE",
      "line": 15116,
      "sha256": "426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081"
    },
    {
      "file": "game.html",
      "name": "INV_COLS",
      "line": 15117,
      "sha256": "5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908"
    },
    {
      "file": "game.html",
      "name": "_MALICE_COST_MUL",
      "line": 26867,
      "sha256": "a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9"
    },
    {
      "file": "game.html",
      "name": "CR_ATK_SLOTS",
      "line": 14623,
      "sha256": "b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32"
    },
    {
      "file": "game.html",
      "name": "CR_ARMOR_SLOTS",
      "line": 14624,
      "sha256": "7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395"
    },
    {
      "file": "game.html",
      "name": "CR_ACC_SLOTS",
      "line": 14625,
      "sha256": "e907d356d27729a9d19aaa75d99afa114da2bd3cf74a5ec5b9682c415f7ce44e"
    },
    {
      "file": "game.html",
      "name": "CR_DEF_SLOTS",
      "line": 14627,
      "sha256": "72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70"
    },
    {
      "file": "game.html",
      "name": "CRYSTAL_DEFS",
      "line": 14629,
      "sha256": "5eb3ff6615ddf1f91474d0b9ddb9f01f8d25e95e6116381c5a9e2c9b269cdf28"
    },
    {
      "file": "game.html",
      "name": "CRYSTAL_BAG_MAX",
      "line": 14720,
      "sha256": "d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175"
    },
    {
      "file": "game.html",
      "name": "BAG_MAX",
      "line": 15458,
      "sha256": "86c97f737e030685f0e82ad67a11ae5b76534fd6edf2822aae52c7ac98565628"
    },
    {
      "file": "game.html",
      "name": "bonePart bypass",
      "line": 15573,
      "sha256": "dc991d664042ed9c3a1773e74f4f1b2df714c246d3c78407d6581302b0f8e19f"
    },
    {
      "file": "game-easy-test.html",
      "name": "equipItem",
      "line": 14679,
      "sha256": "494bde4a081e2c29784f33f493e1e2c96d4446e98e45d63df43141717a4b7179"
    },
    {
      "file": "game-easy-test.html",
      "name": "_invBagRightClick",
      "line": 45567,
      "sha256": "50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47"
    },
    {
      "file": "game-easy-test.html",
      "name": "_invRows",
      "line": 14582,
      "sha256": "e1415c40ede82b6b5fc6260c57ba409eb8a478179a76c9bbdd2a00b6c4614b37"
    },
    {
      "file": "game-easy-test.html",
      "name": "_itemSz",
      "line": 14584,
      "sha256": "46bd4128c19de28f26caa21c25a0acfe5e3029d0d71ca7812c57bd78337cc33b"
    },
    {
      "file": "game-easy-test.html",
      "name": "_invCategoryKey",
      "line": 14589,
      "sha256": "b8b86509119cb9ba3be57fd921c6dbd0375220d466d30a52c040d305d3a8e501"
    },
    {
      "file": "game-easy-test.html",
      "name": "_invGrid",
      "line": 14590,
      "sha256": "74b9c7e2115c4a412fe0bba26a629e2094838795645d17797b6df83a5c80cc47"
    },
    {
      "file": "game-easy-test.html",
      "name": "_invFindSpace",
      "line": 14601,
      "sha256": "50456341b2c5ccfc03684820566bc9359e97357ece10a62a6171908fd4b59788"
    },
    {
      "file": "game-easy-test.html",
      "name": "_invCanPlace",
      "line": 14654,
      "sha256": "77aa8c57656066b731b193462f0af91949ff016157b872bb30f3c6b814b1fa90"
    },
    {
      "file": "game-easy-test.html",
      "name": "xferCost",
      "line": 25763,
      "sha256": "1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2"
    },
    {
      "file": "game-easy-test.html",
      "name": "_malCost",
      "line": 25743,
      "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f"
    },
    {
      "file": "game-easy-test.html",
      "name": "_itemEconomyRarity",
      "line": 25848,
      "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509"
    },
    {
      "file": "game-easy-test.html",
      "name": "enhColor",
      "line": 25767,
      "sha256": "8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc"
    },
    {
      "file": "game-easy-test.html",
      "name": "ITEM_SIZE",
      "line": 14237,
      "sha256": "a1bcf111700ce971f309dcc79a0fd89032198f7f4bb074dd77fe41d3c3be659d"
    },
    {
      "file": "game-easy-test.html",
      "name": "WTYPE_SIZE",
      "line": 14239,
      "sha256": "76a1598a9ebbebb944f5eb0a8a68be00714d553dc0e2dae84fe155ae8ec1b715"
    },
    {
      "file": "game-easy-test.html",
      "name": "BTYPE_SIZE",
      "line": 14240,
      "sha256": "426e081b1d4280e36a021711e0e32f9a2c5e2f2ea4ffc734ea7fc6b6a711f081"
    },
    {
      "file": "game-easy-test.html",
      "name": "INV_COLS",
      "line": 14241,
      "sha256": "5d6943fb899a37daf4ee429c84d99582b7ecba57aa7732a8715a1ea433ea3908"
    },
    {
      "file": "game-easy-test.html",
      "name": "_MALICE_COST_MUL",
      "line": 25742,
      "sha256": "a98d70594523834c5297f442d133bd5295d0b8488d4a04a881b747a08f8b9ad9"
    },
    {
      "file": "game-easy-test.html",
      "name": "CR_ATK_SLOTS",
      "line": 14020,
      "sha256": "b740361cdfa98f8e343381a6ba7ef38b6ee7a6079efa5f6bf3c1332a9aa5cf32"
    },
    {
      "file": "game-easy-test.html",
      "name": "CR_ARMOR_SLOTS",
      "line": 14021,
      "sha256": "7c6f9fd005ed67047398d920c538d23fd26284fe818d1c71b76812722aa29395"
    },
    {
      "file": "game-easy-test.html",
      "name": "CR_ACC_SLOTS",
      "line": 14022,
      "sha256": "f3fed6eb028cf1b59df4ddd863319aa64e2a684c7065aaba9215c62608628726"
    },
    {
      "file": "game-easy-test.html",
      "name": "CR_DEF_SLOTS",
      "line": 14024,
      "sha256": "72fc8ec1eaa947963da068ddfd58deb2eff5bb7e5342e360a0ea5eb86a7aad70"
    },
    {
      "file": "game-easy-test.html",
      "name": "CRYSTAL_DEFS",
      "line": 14025,
      "sha256": "aa602b9cf5b6390aee7f55c5bad771ae22f349f35043bf192c0003953a15151e"
    },
    {
      "file": "game-easy-test.html",
      "name": "CRYSTAL_BAG_MAX",
      "line": 14084,
      "sha256": "d559e6500642467fdb61fd1931560e40b8af4d5a78ff924e79f0fc5952ab1175"
    },
    {
      "file": "game-easy-test.html",
      "name": "BAG_MAX",
      "line": 14581,
      "sha256": "86c97f737e030685f0e82ad67a11ae5b76534fd6edf2822aae52c7ac98565628"
    },
    {
      "file": "game-easy-test.html",
      "name": "bonePart bypass",
      "line": 14681,
      "sha256": "dc991d664042ed9c3a1773e74f4f1b2df714c246d3c78407d6581302b0f8e19f"
    }
  ],
  "rows": [
    {
      "file": "game.html",
      "hole": false,
      "bagCount": 300,
      "grid": {
        "cols": 10,
        "rows": 120,
        "capacity": 300,
        "occupied": 1200
      },
      "sizes": {
        "old": [
          2,
          2
        ],
        "next": [
          2,
          2
        ]
      },
      "noSkip": null,
      "skipNext": {
        "x": 0,
        "y": 0
      },
      "after": {
        "mats": 8500,
        "oldEnh": 0,
        "newEnh": 3,
        "refund": 6,
        "oldPosition": [
          0,
          0
        ],
        "oldInBag": true,
        "allFootprintsValid": true,
        "crystalTransferred": true,
        "bindingIdentity": true
      },
      "events": [
        "notify:⚒ +3 강화 이전 완료 (-1,500악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "save": 1,
        "recalc": 1,
        "sfx": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      }
    },
    {
      "file": "game.html",
      "hole": true,
      "bagCount": 299,
      "grid": {
        "cols": 10,
        "rows": 120,
        "capacity": 300,
        "occupied": 1196
      },
      "sizes": {
        "old": [
          2,
          2
        ],
        "next": [
          2,
          2
        ]
      },
      "noSkip": {
        "x": 2,
        "y": 0
      },
      "skipNext": {
        "x": 0,
        "y": 0
      },
      "after": {
        "mats": 8500,
        "oldEnh": 0,
        "newEnh": 3,
        "refund": 6,
        "oldPosition": [
          0,
          0
        ],
        "oldInBag": true,
        "allFootprintsValid": true,
        "crystalTransferred": true,
        "bindingIdentity": true
      },
      "events": [
        "notify:⚒ +3 강화 이전 완료 (-1,500악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "save": 1,
        "recalc": 1,
        "sfx": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      }
    },
    {
      "file": "game-easy-test.html",
      "hole": false,
      "bagCount": 300,
      "grid": {
        "cols": 10,
        "rows": 120,
        "capacity": 300,
        "occupied": 1200
      },
      "sizes": {
        "old": [
          2,
          2
        ],
        "next": [
          2,
          2
        ]
      },
      "noSkip": null,
      "skipNext": {
        "x": 0,
        "y": 0
      },
      "after": {
        "mats": 8500,
        "oldEnh": 0,
        "newEnh": 3,
        "refund": 6,
        "oldPosition": [
          0,
          0
        ],
        "oldInBag": true,
        "allFootprintsValid": true,
        "crystalTransferred": true,
        "bindingIdentity": true
      },
      "events": [
        "notify:⚒ +3 강화 이전 완료 (-1,500악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "save": 1,
        "recalc": 1,
        "sfx": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      }
    },
    {
      "file": "game-easy-test.html",
      "hole": true,
      "bagCount": 299,
      "grid": {
        "cols": 10,
        "rows": 120,
        "capacity": 300,
        "occupied": 1196
      },
      "sizes": {
        "old": [
          2,
          2
        ],
        "next": [
          2,
          2
        ]
      },
      "noSkip": {
        "x": 2,
        "y": 0
      },
      "skipNext": {
        "x": 0,
        "y": 0
      },
      "after": {
        "mats": 8500,
        "oldEnh": 0,
        "newEnh": 3,
        "refund": 6,
        "oldPosition": [
          0,
          0
        ],
        "oldInBag": true,
        "allFootprintsValid": true,
        "crystalTransferred": true,
        "bindingIdentity": true
      },
      "events": [
        "notify:⚒ +3 강화 이전 완료 (-1,500악의)",
        "addTxt",
        "notify:💎 결정 자동 전승 완료",
        "recalc",
        "sfx",
        "notify:교체갑옷 장착!",
        "lesson",
        "save",
        "apply",
        "render"
      ],
      "trace": {
        "rng": 0,
        "save": 1,
        "recalc": 1,
        "sfx": 1,
        "lesson": 1,
        "apply": 1,
        "render": 1
      }
    }
  ],
  "validation": {
    "groups": [
      "game.html: actual legal wearable size definitions all 2x2; no oversized legal pair",
      "game.html: actual full grid null without skip, valid released replacement footprint",
      "game.html: whole bag caller/equip full-grid and free-hole controls preserve legal placement and transfer",
      "game-easy-test.html: actual legal wearable size definitions all 2x2; no oversized legal pair",
      "game-easy-test.html: actual full grid null without skip, valid released replacement footprint",
      "game-easy-test.html: whole bag caller/equip full-grid and free-hole controls preserve legal placement and transfer"
    ],
    "passed": 6,
    "failed": 0,
    "actualWholeCallerEquipExecutions": 4,
    "priorTestsRepeated": 0
  },
  "memoryCandidate": null,
  "candidateGate": "No current legal different-size parent/replacement pair. Do not change ITEM_SIZE or fabricate size helpers to declare reproduction.",
  "productionApplied": false,
  "runtimeAccepted": false,
  "actual": [
    "both full _itemSz/_invRows/_invCategoryKey/_invGrid/_invFindSpace/_invCanPlace/_invBagRightClick/equipItem",
    "actual ITEM_SIZE/WTYPE_SIZE/BTYPE_SIZE/INV_COLS/BAG_MAX",
    "cost/refund helpers and crystal constants"
  ],
  "stubs": [
    "legal synthetic armor bag tiled at actual 10x120/300 limit",
    "P.lv/coords",
    "translation/notify/addTxt/recalc/audio/lesson/save/apply/render observers",
    "Math.random throw guard"
  ],
  "unknown": [
    "future variable-size wearable failure/rejection policy",
    "actual grid/UI/DB/save/runtime acceptance",
    "grid resize/unplaced/malformed/legacy items",
    "earring target slots"
  ],
  "commands": [
    {
      "command": "exact TASK first Read; bounded source/SSOT read commands",
      "exit": 0
    },
    {
      "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/ITEM/ITEM-oversized-swap-bag-fit-atomicity-hb1014b/checks.mjs",
      "exit": 0
    }
  ],
  "docsSearch": {
    "command": [
      "rg",
      "-n",
      "ITEM_SIZE|WTYPE_SIZE|BTYPE_SIZE|_itemSz|_invFindSpace|_invGrid|_invCanPlace|BAG_MAX|장착 교체|같은 분류|공간이 없습니다",
      "docs/"
    ],
    "exit": 0,
    "lines": 24,
    "files": [
      "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "docs/7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md",
      "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "docs/16번역·로컬라이제이션/번역대상_전체목록.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md"
    ],
    "outputSHA256": "f541c549c3fb2ab9db533f7288921b49ba81755b2d8f2a085a1450bdabd17212"
  },
  "errors": [],
  "toolsActuallyCalled": [
    "functions.exec / exec_command",
    "functions.exec / apply_patch"
  ],
  "skillsUsed": [],
  "checksSHA256": "91999d720441dc5feb268218ba50f675cf61b5807bc993f554ce08fee1825c86",
  "writes": [
    "result.md",
    "checks.mjs"
  ],
  "git": 0,
  "productionSharedDocsPriorWrites": 0,
  "newTeamsChatsMessages": 0,
  "deletion": 0,
  "gameServerHTTPSaveBuildInstallPublish": 0
}
```

최종 산출 무결성 영수증(새 VM 반복0):

```json
{
  "atUTC": "2026-10-02T11:05:58.124Z",
  "command": "designated Node --input-type=module: owned AST/hash/directory/current-read observations",
  "exit": 0,
  "testsRepeated": 0,
  "reads": [
    {
      "path": "game.html",
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "sameAsRunEnd": true
    },
    {
      "path": "game-easy-test.html",
      "sha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "sameAsRunEnd": true
    },
    {
      "path": "AGENTS.md",
      "sha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "sameAsRunEnd": true
    },
    {
      "path": "tools/team-followup-20261002/continuous/COMMON.md",
      "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "sameAsRunEnd": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-oversized-swap-bag-fit-atomicity-hb1014b/TASK.md",
      "sha256": "e659c9355bf9946d70c339df7ede27eec77b49a935286a913d60fde66dc4c25f",
      "sameAsRunEnd": true
    },
    {
      "path": "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "sha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "sameAsRunEnd": true
    },
    {
      "path": "docs/7아이템디자인/ITEM_TEAM_MASTER.md",
      "sha256": "d18f90ae89c01960e482304c39eee3a9a720cf6e4e351902560664ef34199087",
      "sameAsRunEnd": true
    },
    {
      "path": "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "sha256": "29e01d81a0632beb91cac804407510f322e2bd94bee505d2db33c69b82d54c3c",
      "sameAsRunEnd": true
    },
    {
      "path": "docs/14밸런스+수치테이블/자원소비량표.md",
      "sha256": "a2e4b4eca00af6a1cc539e42338391c812ed38786e786ce0ae543d7f167680fc",
      "sameAsRunEnd": true
    },
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "sha256": "1012258348172717c7daab97daedf2f063acf82469456a5e0483d6644534cae0",
      "sameAsRunEnd": true
    },
    {
      "path": "tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014/result.md",
      "sha256": "1288758d599ea15622d7caeeb0e6f085658a4e2cb6819a1333b16d205cac82d1",
      "sameAsRunEnd": true
    }
  ]
}
```

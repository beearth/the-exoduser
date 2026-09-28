> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 지면 소품 4종 폐기 — 40차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **43차 현행(2026-09-27):** m_leaf/leaf_pile 원화·고정1배치폐기. 낙엽유지였던이전기록은검수이력. scatter현재m_fbones,m_poison 2항목,전체폐기34id. 공유뼈·시체유지. [현행SSOT](CH1_LEAF_RETIREMENT_PASS43.md).

> **41차 현행(2026-09-27):** 구형장식 acid_pool/poison_puddle/flesh_pile/meat_stake 4원화·사본11개폐기. 기존배치/재작업계획은이력. 실제독구덩이·대형늪·거미줄유지. [현행SSOT](CH1_SMALL_ORGANIC_RETIREMENT_PASS41.md).

실게임39차 OLD_PILLAR에서떠있는흰돌처럼보인소품과 원화4종을비교했다. 256×256 크기와관계없이 강한밝은상면/둥근돌형태/독립된외곽이 평평한지면데칼의역할에맞지않아 REJECTED_LOW_QUALITY로분류했다. 생성시기만으로판정한것이아니다. 아래원화4파일을격리하고재사용금지. 기존지면/피부막/늪효과를보존한다.

| id | 원화 | 과거표시sz | 제거한CH1고정tile |
|---|---|---|---|
| m_moss | moss_patch.png | 90 | (80,147),(132,81),(47,47),(41,151) |
| m_ash | ash_pile.png | 60 | (128,157),(73,88) |
| m_mud | mud_stain.png | 80 | (44,97) |
| m_crack | ground_crack.png | 120 | (147,93) |

| 원본경로(제거) | 격리경로 | SHA256 |
|---|---|---|
| assets/map/ch1/floor_objects/ash_pile.png | archive/retired-map-assets/20260927-ground-decals/assets/map/ch1/floor_objects/ash_pile.png | 6e9166661ac42d2887afe02e55b25c0bf002236539a216556d6fc5aaa82a8d41 |
| assets/map/ch1/floor_objects/moss_patch.png | archive/retired-map-assets/20260927-ground-decals/assets/map/ch1/floor_objects/moss_patch.png | 0fde6ed3036a89b933aa7501fae4fa9226a996aa5376e7388537c2fc08ec5c5b |
| assets/map/ch1/floor_objects/mud_stain.png | archive/retired-map-assets/20260927-ground-decals/assets/map/ch1/floor_objects/mud_stain.png | 7bc9bb94c2482a489e855ed812678feea8a47a2dfe9d2f4c90c40db838486a70 |
| assets/map/ch1/floor_objects/ground_crack.png | archive/retired-map-assets/20260927-ground-decals/assets/map/ch1/floor_objects/ground_crack.png | 01379801e39c4ce389ef3eec8ffe1c12944eab9d1bae337c0fda498fd81f6df3 |

| 현행계약 | 값 |
|---|---|
| 폐기등록 | 이전15id+4id=19id. _RETIRED_MAP_OBJECT_TYPES에서렌더/충돌재생성제외 |
| 활성진입점 | game.html/game-easy-test.html loader·고정배치8개·_decoPool에서제거. 두편집기에는해당등록이원래없음 |
| scatter후보 | m_leaf,m_leaf,m_fbones,m_flesh,m_puddle,m_poison,m_acid. 후보가중치15항목→7항목. 배치알고리즘·시도수는변경없으며이전장식수와동일하다는보장아님 |
| 보호 | leaf_pile.png,m_c1sroot,현재피부/동맥/늪/가스/버블/야영지효과유지. assets/vfx/ground_crack_sheet.png는전투VFX로별개,변경없음 |
| 비충돌 | 제거4종은비충돌. terrain geometry/남북통로/랜드마크위치변경없음 |
| 모듈/캐시 | ch1-living-detail.js는변경없음. module20260927-39 유지,접지2장0.5MiB/전체native87.81269454956055MiB(기타shadow/GPU/임시제외) |
| 검사 | 효과36+geometry5+main구문1+폐기4=46PASS. 격리파일해시/활성경로부재/scatter제거/leaf및전투균열VFX보호검사 |
| 자료 | captures/ch1_ground_retirement40_20260927/rejected-contact.png는폐기원화비교표. 런타임결과는verify/ 별도 |
| 백업 | tmp/ch1-pass40/ 원본코드·검사백업. archive는NW.js패키징복사DIRS밖. 전체빌드미실행 |


MAP PRODUCTION REPORT — 40차

STAGE: CH1-1 지면데칼4종폐기.
MASTER: silhouette/regions/main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경없음.
LARGE: source assets 중소형지면4원화격리. composites/overlap/대형repeated silhouette변경없음.
MEDIUM: connections유지. remaining holes 신규발견없음,전수검수아님.
GROUND: 독립된밝은돌형지면8배치제거. 기존shadow/contamination/structure integration/피부막효과보존. 뼈아치우측밝은소품소멸확인.
PLAYABLE: main arenas/travel/breathing/threat space유지. 비충돌장식만제거,terrain/남북루트유지. combat readability유지.
LANDMARK: primary시체나무/secondary야영지·늪·고치보존. tertiary지면데칼정리.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE/OLD_PILLAR 총16시점+COMBAT. OLD_PILLAR원배율/전체보드직접검수. 흰부유돌제거후지면연결확인.
TECH QA: 46테스트PASS,보조game inline6구문PASS. route/collision geometry검사PASS. 실제retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures15(인트로중단포함). 64청크ready,visibleIds모두drawnIds포함. seam전청크전수검수아님. 사망UI오류없음. WASD(4020,7220)→(4020,7222.70712),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. COMBAT90RAF median16.7/p9550ms,headless1280×720녹화로전체성능PASS아님. 전체NW.js빌드미수행.
FILES: stage-owned test/mapAssetRetirement.test.js/archive4개+manifest/40차문서. concurrent touched game.html/game-easy-test.html/관련docs/CHANGELOG. 생체모듈변경없음. unrelated touched0. tmp/captures기존ignore.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸오류),push/deploy없음. 시작206→완료217개(동시작업포함). 타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 지면4원화제거확인. 전체맵재질통합/남은구형소품은추가검토.
NEXT PASS: 남은소형독액·고기·거미줄원화의실제사용과게임기능을분리해검토. 기존대형늪효과보존.

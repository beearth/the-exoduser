# CH1 구형 소품 검수·폐기 38차 — 2026-09-27

> **43차 현행(2026-09-27):** m_leaf/leaf_pile 원화·고정1배치폐기. 낙엽유지였던이전기록은검수이력. scatter현재m_fbones,m_poison 2항목,전체폐기34id. 공유뼈·시체유지. [현행SSOT](CH1_LEAF_RETIREMENT_PASS43.md).

> **42차 현행(2026-09-27):** 구형 spider_web 원화·동일사본4개와CH2 seamWeb4배치폐기. CH2 authored105/시스템포함107,충돌51+비충돌54,seam6,wall-belt27. 구형거미줄유지였던41차기록은검토이력. 큰거미줄뼈기둥보존. [현행SSOT](CH2_WEB_RETIREMENT_PASS42.md).

> **41차 현행(2026-09-27):** 구형장식 acid_pool/poison_puddle/flesh_pile/meat_stake 4원화·사본11개폐기. 기존배치/재작업계획은이력. 실제독구덩이·대형늪·거미줄유지. [현행SSOT](CH1_SMALL_ORGANIC_RETIREMENT_PASS41.md).

> **40차 현행(2026-09-27):** 흰부유돌처럼읽히는 moss_patch/ash_pile/mud_stain/ground_crack 지면원화4종폐기. loader·고정8배치·scatter후보에서제거. leaf와전투VFX ground_crack_sheet는유지. [현행SSOT](CH1_GROUND_DECAL_RETIREMENT_PASS40.md).

> **39차 현행(2026-09-27):** 구형 rotten_tree/vine_pillar 원화와사본7개 폐기. 게임·편집기·충돌·나무움직임에서제외. 과거배치/확대재작업계획은이력. dry아틀라스는전용 _atlasDry:1로분리해동작보존. [현행폐기SSOT](CH1_LOW_QUALITY_RETIREMENT_PASS39.md).

현행 맵의 바닥/충돌 소품20종 원화를 비교했다. 저해상도만으로 일괄 폐기하지 않고, 현재 야영지와의 형태·명도·재질 차이와 실제 사용을 함께 확인했다.

| 분류 | 원화 | 판단/조치 |
|---|---|---|
| REJECTED_LOW_QUALITY | weapon_pile.png,64×48 | 밝은 검·방패 중심의 단순 픽셀 원화가 주변 생체야영지와 이질적. 원본 및 동일사본4개 격리,재사용 금지 |
| 유지 | sword_pile.png,bone_arch.png,hang_cage.png,skull_totem.png | 현재검수에서 구형무기더미와 구분. 크고 세밀한 원화 유지. 최종전체맵승인 의미 아님 |
| 후속검토 | acid_pool,bones,corpse,flesh_pile,meat_stake,poison_puddle,spider_web,rotten_tree,vine_pillar | 저해상도/픽셀형 후보. 기능·충돌·다른챕터사용 확인 전 폐기확정하지 않음 |
| 후속검토 | ash_pile,ground_crack,leaf_pile,moss_patch,mud_stain | 지면데칼의 밝은외곽/형태와 실제지면 연결 검토. 이번수정없음 |

비교표: captures/ch1_asset_audit38_20260927/contact.png. 원본최대3배표시이며 실게임촬영과 구분한다.

| 원본 경로(활성경로에서 제거) | 격리 경로 |
|---|---|
| assets/map/ch1/floor_objects/weapon_pile.png | archive/retired-map-assets/20260927-weapon-pile/assets/map/ch1/floor_objects/weapon_pile.png |
| assets/map/ch5/floor_objects/weapon_pile.png | archive/retired-map-assets/20260927-weapon-pile/assets/map/ch5/floor_objects/weapon_pile.png |
| assets/objects/weapon_pile.png | archive/retired-map-assets/20260927-weapon-pile/assets/objects/weapon_pile.png |
| docs/4.1맵디자인+설정/objects/weapon_pile.png | archive/retired-map-assets/20260927-weapon-pile/docs/4.1맵디자인+설정/objects/weapon_pile.png |

4파일 SHA256 동일: 611516a43de681696ff23727ab8d32cf386b6890a5fdf1076003c7a1019d175b. manifest.status=REJECTED_LOW_QUALITY,reuseAllowed=false. archive는 NW.js 복사 DIRS에 포함되지 않음.

| 현행 코드 계약 | 값 |
|---|---|
| 사용금지 추가id | weapon_pile,m_wpile,m_c5wpile;37차5id와합계8id |
| 게임 | game.html/game-easy-test.html의loader/legacy sprite/meta/scatter 제거. CH1 authored tile(124,175),(51,105) 2배치 제거. 기존저장맵은 renderer의폐기Set으로비표시 |
| 편집기 | editor.html weapon_pile / tilemap-editor.html weapon_pile,m_wpile 등록제거 |
| 접지 | m_wpile(2060,4220)분기삭제. m_c1sbone(1940,4340),m_sword_pile(1580,4180) 2곳유지 |
| 캐시 | 2×256²RGBA=0.5MiB,37차대비0.25MiB감소. 전체native87.81269454956055MiB(기타shadow/GPU/임시제외) |
| 모듈 | ch1-living-detail.js?v=20260927-38 |
| 회귀검사 | 효과36+geometry5+main구문1+폐기2=44PASS. 파일해시·활성경로부재·별도sword_pile보호검사 포함 |
| 보존 | geometry/충돌/START6시/EXIT12시/늪·가스·버블·야영지손동작. 과거백업/로그와무관한CH3 sword_pile,시네마틱무기더미개념은변경대상아님 |


MAP PRODUCTION REPORT — 38차

STAGE: CH1-1 소형구형무기더미폐기 및CH5동일사본정리.
MASTER: silhouette/regions/남북main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경없음.
LARGE: source assets 구형무기더미1종/동일사본4개격리. composites/overlap/repeated silhouette 변경없음.
MEDIUM: connections 유지,remaining holes 전수검수아님. 새배치없음.
GROUND: 무기더미전용접지제거. shadow2곳유지,contamination/structure integration은기존상태보존.
PLAYABLE: main arenas/travel/breathing/threat space 보존. 작은픽셀더미제거로전투면확보,combat readability 유지.
LANDMARK: primary시체나무/secondary야영지·늪보존. tertiary구형무기더미제거,큰sword_pile보호.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL 총14시점+COMBAT. CAMP_DETAIL원배율/전체보드직접검수. 제거된위치의지면연결유지.
TECH QA: route/collision geometry검사PASS,전체44테스트PASS. 보조game inline6/editor1/tilemap1문법PASS. retired objects/sprites/metadata모두0,유지접지drawImage2. JS pageerror0/HTTP오류0. 외부네트워크차단6건,총requestFailures16건(인트로중단포함). 청크60/60ready,visibleIds모두drawnIds포함. seam전체전수검사아님. WASD(4020,7220)→(4017.2245,7220),전체경로종주아님. 카메라체력50ms보충/iframes60,전투전무적보충해제. 사망UI오류없음. COMBAT90RAF median33.3/p9533.5ms,headless1280×720녹화환경측정. 전체성능PASS/NW.js빌드/CH5시각검수는미수행.
FILES: stage-owned ch1-living-detail.js/test/mapAssetRetirement.test.js/archive4개+manifest/검수문서. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련맵docs/CHANGELOG. unrelated touched0.
GIT: shared index보존,staged추가없음. commit미완료(.git쓰기제한/기존셸실행오류). push/deploy없음. 시작175→완료186개. 타작업숨김/삭제/강제커밋없음.
VISUAL VERDICT: RETOUCH — 구형무기더미제거확인. 나머지구형소품과지면재질통합잔여.
NEXT PASS: rotten_tree/vine_pillar 등구형픽셀소품의충돌·공유사용부터확인후정리. 이번검수만으로폐기확정하지않음.

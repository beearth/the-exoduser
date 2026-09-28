## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 소형 독액·육편 장식 폐기 — 41차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **43차 현행(2026-09-27):** m_leaf/leaf_pile 원화·고정1배치폐기. 낙엽유지였던이전기록은검수이력. scatter현재m_fbones,m_poison 2항목,전체폐기34id. 공유뼈·시체유지. [현행SSOT](CH1_LEAF_RETIREMENT_PASS43.md).

> **42차 현행(2026-09-27):** 구형 spider_web 원화·동일사본4개와CH2 seamWeb4배치폐기. CH2 authored105/시스템포함107,충돌51+비충돌54,seam6,wall-belt27. 구형거미줄유지였던41차기록은검토이력. 큰거미줄뼈기둥보존. [현행SSOT](CH2_WEB_RETIREMENT_PASS42.md).

구형 acid_pool(64×48),poison_puddle(40×32),flesh_pile(64×64),meat_stake(48×80)는 단순픽셀외곽·강한녹색/붉은덩어리가 현재생체지면과어울리지않아 REJECTED_LOW_QUALITY로격리한다. 나이/해상도만으로판정하지않고38차원화비교와실제사용조사를함께사용했다. 거미줄은동일원화지만CH2 m_c2seamWeb 연결부가있어이번에제거하지않음.

| 원본경로(제거) | 격리경로 | SHA256 |
|---|---|---|
| assets/map/ch1/floor_objects/acid_pool.png | archive/retired-map-assets/20260927-small-organic/assets/map/ch1/floor_objects/acid_pool.png | f007500ff05ef6d17050ec12be70cafca1bab47afab4d7cb4e52e204238ba89e |
| assets/map/ch1/floor_objects/flesh_pile.png | archive/retired-map-assets/20260927-small-organic/assets/map/ch1/floor_objects/flesh_pile.png | b716cf792a9030ba22c7c51aaf12a69b89e3cb7b382ab1cf76c87a84a8b855c3 |
| assets/map/ch1/floor_objects/meat_stake.png | archive/retired-map-assets/20260927-small-organic/assets/map/ch1/floor_objects/meat_stake.png | b59b0abf3dc35d3223bd795c6fafd6ccbb84ecc164f1089dbfd6f6aa2b0b019c |
| assets/map/ch1/floor_objects/poison_puddle.png | archive/retired-map-assets/20260927-small-organic/assets/map/ch1/floor_objects/poison_puddle.png | b5d11b19f91be1635c80e198013f00347a3cd7118b76b977c8c7fd306a095f48 |
| assets/map/ch6/floor_objects/flesh_pile.png | archive/retired-map-assets/20260927-small-organic/assets/map/ch6/floor_objects/flesh_pile.png | b716cf792a9030ba22c7c51aaf12a69b89e3cb7b382ab1cf76c87a84a8b855c3 |
| assets/map/ch6/floor_objects/meat_stake.png | archive/retired-map-assets/20260927-small-organic/assets/map/ch6/floor_objects/meat_stake.png | b59b0abf3dc35d3223bd795c6fafd6ccbb84ecc164f1089dbfd6f6aa2b0b019c |
| assets/objects/acid_pool.png | archive/retired-map-assets/20260927-small-organic/assets/objects/acid_pool.png | f007500ff05ef6d17050ec12be70cafca1bab47afab4d7cb4e52e204238ba89e |
| assets/objects/flesh_pile.png | archive/retired-map-assets/20260927-small-organic/assets/objects/flesh_pile.png | b716cf792a9030ba22c7c51aaf12a69b89e3cb7b382ab1cf76c87a84a8b855c3 |
| assets/objects/poison_puddle.png | archive/retired-map-assets/20260927-small-organic/assets/objects/poison_puddle.png | b5d11b19f91be1635c80e198013f00347a3cd7118b76b977c8c7fd306a095f48 |
| docs/4.1맵디자인+설정/objects/flesh_pile.png | archive/retired-map-assets/20260927-small-organic/docs/4.1맵디자인+설정/objects/flesh_pile.png | b716cf792a9030ba22c7c51aaf12a69b89e3cb7b382ab1cf76c87a84a8b855c3 |
| docs/4.1맵디자인+설정/objects/meat_stake.png | archive/retired-map-assets/20260927-small-organic/docs/4.1맵디자인+설정/objects/meat_stake.png | b59b0abf3dc35d3223bd795c6fafd6ccbb84ecc164f1089dbfd6f6aa2b0b019c |

| 현행계약 | 값 |
|---|---|
| 추가폐기ID | acid_pool,poison_puddle,flesh_pile,meat_stake,m_acid,m_puddle,m_flesh,m_meat,m_c6flesh,m_c6meat. 이전19+10=총29id |
| 파일 | CH1원화4개+CH6동일사본2개+assets/objects3개+docs/objects2개=11개. 각해시일치확인. reuseAllowed:false |
| 게임 | main/easy loader·legacy sprite/meta·소형scatter연결제거. CH6해당등록2개제거 |
| 고정배치제거 | m_puddle tile(124,35),(164,53),(153,145),m_meat(164,47),m_acid(171,142). 합계5개 |
| scatter | _decoPool m_leaf,m_leaf,m_fbones,m_poison. 후보7항목→4항목. 배치알고리즘/시도수변경없음,최종장식개수동일보장아님 |
| 편집기 | editor해당legacy4개/tilemap-editor legacy4개+CH1별칭4개제거. 예전누락assets/objects/meat_stake.png 및docs/objects의독액2경로도카탈로그에서제거 |
| 기능 | 제거대상은비충돌장식. pit_poison,m_c1pool,m_c1gtoxicf와독피해/늪수면/가스/버블보존. m_poison/poison_pool.png도유지 |
| 보호원화 | spider_web 및CH2 m_c2web/m_c2seamWeb 유지. m_meatpole/prop_meatpole.png,큰flesh_ball/flesh_maw 등별개원화유지 |
| 모듈 | ch1-living-detail.js 변경없음,module20260927-39. 기존캐시비용동일 |
| 검사 | 효과36+geometry5+main구문1+폐기5=47PASS. 파일무결성·활성참조부재·실제독/거미줄보호검사포함 |
| 보관 | archive/retired-map-assets/20260927-small-organic/;NW.js복사DIRS밖. 전체빌드미실행 |


MAP PRODUCTION REPORT — 41차

STAGE: CH1-1 소형독액·육편장식폐기,CH6동일사본등록정리.
MASTER: silhouette/regions/main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경없음.
LARGE: 소형source assets4종11파일격리. 기존composites/overlap/repeated silhouette대형구조유지.
MEDIUM: connections유지. CH2거미줄연결부는보류/보존,remaining holes전수검수아님.
GROUND: 소형독액스티커제거,기존shadow/contamination/structure integration과실제대형늪유지.
PLAYABLE: main arenas/travel/breathing/threat space 및combat readability유지. 제거대상비충돌장식으로독피해·경로·terrain변경없음.
LANDMARK: primary시체나무/secondary늪·고치·야영지보존. tertiary구형장식정리.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE/OLD_PILLAR 총16시점+COMBAT. AUTHORED_POOL원배율/전체보드직접검수. 큰늪보존,소형장식제거후지면연결확인.
TECH QA: 47테스트PASS,보조game inline6/editor1/tilemap1문법PASS. route/collision검사PASS. 실제retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures14(인트로중단포함). 청크64ready,visibleIds모두drawnIds포함. seam전체전수검수아님. 사망UI오류없음. WASD(4020,7220)→(4022.72428,7220),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. COMBAT90RAF median33.3/p9550ms,headless1280×720녹화로전체성능PASS아님. CH6시각검수/NW.js전체빌드미수행.
FILES: stage-owned test/mapAssetRetirement.test.js/archive11개+manifest/41차문서. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련docs/CHANGELOG. 생체모듈변경없음. unrelated touched0. tmp/captures기존ignore.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸실행오류),push/deploy없음. 시작217→완료242개(동시작업포함),타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 구형장식제거확인. 전체맵재질통합과거미줄등공유구형원화는추가검토.
NEXT PASS: CH2거미줄연결부의실제사용·가림·경계기능검토. CH1정리목적으로CH2구조를무검수제거하지않음.

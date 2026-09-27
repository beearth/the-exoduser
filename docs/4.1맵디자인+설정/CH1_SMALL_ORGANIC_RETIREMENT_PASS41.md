# 소형 독액·육편 장식 폐기 — 41차 (2026-09-27)

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

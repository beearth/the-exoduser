## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# CH1 낙엽 소품 정리 — 43차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


> **47차 현행(2026-09-27):** 제단 정상부·ramp floor 반복 크기 round(_gtTileSz(floor)×1.4), texture에만 saturate(.7)/contrast(.92)/brightness(.92) 적용. 공통 월드 원점·46차 윤곽·44차 feather 유지. [현행 수치·검증](CH1_HILL_MATERIAL_PASS47.md).


> **46차 현행(2026-09-27):** 정상부의 정확한 타원을 96점 비대칭 폐곡선으로 교체. 사면 명암은 organicSkirt 전체에 적용. 44차 feather·45차 색상/월드 정렬·높이·충돌 유지. [윤곽 공식·검증](CH1_HILL_CONTOUR_PASS46.md).


> **45차 현행(2026-09-27):** 제단 사면의 갈색 radial wash를 저채도 방향광으로 교체하고, ramp 바닥을 정상부와 같은 월드 좌표에 정렬. 44차 48px alpha·높이·충돌 유지. [현행 색상·검증](CH1_HILL_SHADING_PASS45.md).


> **44차 렌더 보강(2026-09-27):** smoothing 언덕의 정상부·오르막 접합과 전체 외곽에 48px L1거리/smoothstep 알파 감쇠 적용. 캐시 1900×960 유지. 높이·충돌·서쪽ramp·원본PNG·배경청크불변. [현행공식·검증](CH1_HILL_EDGE_BLEND_PASS44.md).

bones(40×32),corpse(48×40),frozen_bones(32×32),leaf_pile(256×256) 원화를대조했다. leaf_pile은평평한낙엽이아닌둥근독립덩어리처럼읽혀현재피부지면과불일치한다. m_leaf만 REJECTED_LOW_QUALITY로폐기한다. 뼈·시체는CH3/CH5/CH6공유연결을확인했고타챕터검수전유지한다. 저해상도만으로일괄폐기하지않는다.

| 현행항목 | 값 |
|---|---|
| 원본(제거) | assets/map/ch1/floor_objects/leaf_pile.png |
| 격리 | archive/retired-map-assets/20260927-leaf-pile/assets/map/ch1/floor_objects/leaf_pile.png |
| SHA256 | b1aa8623448ecbfb85cd4ae38dae38d2b3b3918cb285acc33844ed9eac798750 |
| 상태 | REJECTED_LOW_QUALITY,reuseAllowed:false |
| 원화/과거표시 | 256×256 RGBA,sz70,비충돌 |
| 배치제거 | main/easy authored tile(132,111) 1개. loader및_decoPool의m_leaf2항목제거 |
| 폐기ID | m_leaf추가,이전33+1=총34id. 렌더/충돌재생성차단 |
| scatter현행 | m_fbones,m_poison;후보4→2항목. 알고리즘·시도수변경없음,다른후보선택비중변경 |
| 편집기 | 두편집기leaf카탈로그없음,이번편집기수정없음 |
| 유지 | bones/corpse/frozen_bones,m_c3bones/m_c3fbones/m_c5bones/m_c6corpse,큰뼈아치/시체나무/대형늪/동맥효과 |
| 모듈 | ch1-living-detail.js 변경없음,module20260927-39. 접지2장0.5MiB/전체native87.81269454956055MiB(기타shadow/GPU/임시제외) |
| 검사 | 효과36+CH1geometry5+main구문1+폐기7=49PASS. 공유뼈/시체·대형늪보호,낙엽경로부재/해시/scatter제거검사 |
| 보관 | archive/retired-map-assets/20260927-leaf-pile/. NW.js복사DIRS밖. 전체빌드미실행 |


MAP PRODUCTION REPORT — 43차

STAGE: CH1-1 낙엽소품폐기,공유뼈·시체원화검토.
MASTER: silhouette/regions/main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH변경없음. major holes추가없음. LEAF_SITE상단의기존직선형재질경계는잔여결함으로기록.
LARGE: source asset leaf1개격리. 큰뼈아치/나무/composites/overlap/repeated silhouette보존.
MEDIUM: connections유지,remaining holes전수검수아님.
GROUND: 낙엽덩어리1배치제거,shadow/contamination/동맥·피부structure integration보존. 상단직선재질경계는이번소품제거로해결되지않음.
PLAYABLE: main arenas/travel/breathing/threat space유지,비충돌장식제거. combat readability유지.
LANDMARK: primary시체나무/secondary늪·야영지·고치/tertiary큰뼈구조보존.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE/OLD_PILLAR/LEAF_SITE(132,111),총17시점+COMBAT. LEAF_SITE원배율및전체보드직접검수.
TECH QA: 49검사PASS,보조game inline6구문PASS. route/collision검사PASS. retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures15(인트로중단포함). 청크64ready,visibleIds모두drawnIds포함. seam전청크전수검수아님. 사망UI오류없음. WASD(4020,7220)→(4022.71726,7220),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. COMBAT90RAF median33.3/p9550ms,headless1280×720녹화로전체성능PASS아님. 전체NW.js빌드미수행.
FILES: stage-owned test/mapAssetRetirement.test.js/archive원화1+manifest/43차문서. concurrent touched game.html/game-easy-test.html/관련docs/CHANGELOG. 생체모듈·편집기변경없음. unrelated touched0.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸오류),push/deploy없음. 시작258→완료264개(동시작업포함). 타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 낙엽소품제거확인. LEAF_SITE상단직선재질경계/전체지면통합잔여.
NEXT PASS: LEAF_SITE상단직선형재질경계의소스레이어확인. 작은장식추가로덮지말고해당경계의원인부터검토. 공유뼈·시체는다른챕터영향확인전유지.

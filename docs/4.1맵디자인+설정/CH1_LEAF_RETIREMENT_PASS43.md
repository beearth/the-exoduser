# CH1 낙엽 소품 정리 — 43차 (2026-09-27)

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

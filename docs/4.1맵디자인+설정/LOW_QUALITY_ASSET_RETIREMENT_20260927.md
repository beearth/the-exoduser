# 저품질 맵 에셋 폐기 SSOT — 2026-09-27

> **38차 현행(2026-09-27):** 구형 weapon_pile.png 및 동일사본4개 폐기·격리. m_wpile/m_c5wpile/weapon_pile 사용금지. 과거무기더미배치·접지기록은이력이다. 접지현행2장/0.5MiB,전체native87.81269454956055MiB,모듈20260927-38. [검수·폐기 SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md).

사용자 스크린샷 스크린샷 2026-09-27 212138.png의 구형 픽셀 묘비(48×64)와 흑백 노출 뿌리(256×256)를 **REJECTED_LOW_QUALITY**로 확정했다. 더 보강하거나 재사용하지 않는다. 영구 소거 대신 비런타임 격리 보관하며, 신규 대체 원화 승인은 별도 작업이다. 다른 오래된 에셋 전체를 폐기 판정한 것은 아니다.

| 원본 경로(현재 제거) | 격리 경로 | SHA256 |
|---|---|---|
| assets/map/ch1/floor_objects/tombstone.png | archive/retired-map-assets/20260927-low-quality/assets/map/ch1/floor_objects/tombstone.png | 4a9ff48bf0f630d1c4d5c517db6fb962b1763b95b6f0af0d284360706b39093b |
| assets/map/ch5/floor_objects/tombstone.png | archive/retired-map-assets/20260927-low-quality/assets/map/ch5/floor_objects/tombstone.png | 4a9ff48bf0f630d1c4d5c517db6fb962b1763b95b6f0af0d284360706b39093b |
| assets/map/ch7/floor_objects/tombstone.png | archive/retired-map-assets/20260927-low-quality/assets/map/ch7/floor_objects/tombstone.png | 4a9ff48bf0f630d1c4d5c517db6fb962b1763b95b6f0af0d284360706b39093b |
| assets/objects/tombstone.png | archive/retired-map-assets/20260927-low-quality/assets/objects/tombstone.png | 4a9ff48bf0f630d1c4d5c517db6fb962b1763b95b6f0af0d284360706b39093b |
| docs/4.1맵디자인+설정/objects/tombstone.png | archive/retired-map-assets/20260927-low-quality/docs/4.1맵디자인+설정/objects/tombstone.png | 4a9ff48bf0f630d1c4d5c517db6fb962b1763b95b6f0af0d284360706b39093b |
| assets/map/ch1/floor_objects/exposed_root.png | archive/retired-map-assets/20260927-low-quality/assets/map/ch1/floor_objects/exposed_root.png | 8417bb2ea817f0ce96e4b1884574058c8d4207a028e956937429391d1edc5082 |

| 런타임 계약 | 현행 값 |
|---|---|
| 사용 금지 id | tombstone, m_tomb, m_root, m_c5tomb, m_c7tomb |
| 활성 진입점 | game.html / game-easy-test.html: loader, legacy sprite/meta, scatter, authored 배치에서 제거 |
| CH1 authored 제거 | m_root tile(80,176),(124,151),(126,43),(52,49),(49,98),(35,147),(152,95): 7개. m_tomb(36,97): 1개. 합계8개 |
| 기존 맵 데이터 | _RETIRED_MAP_OBJECT_TYPES Set으로 오브젝트 렌더 전에 skip. 사용자 저장 파일 자체는 변경하지 않음 |
| 편집기 | editor.html tombstone 항목, tilemap-editor.html tombstone/m_tomb 항목 제거 |
| 접지 기능 | 36차 flat 인자/rootSoilCache/두 대상 분기 제거. debrisContact(img), debrisContactCache 하나. 기존 bone/wpile/sword 3곳 유지 |
| 캐시 | 접지3×256²RGBA=0.75MiB,36차 대비0.5MiB 감소. 전체 native88.06269454956055MiB(기타shadow/GPU/임시 제외) |
| 버전 | ch1-living-detail.js?v=20260927-37 |
| 보호 대상 | m_c1sroot, m_rootcage, 생체나무와 기존 늪/가스/버블/손 움직임은 폐기 대상 아님 |
| 패키징 | archive/는 build-nwjs.mjs의 복사 DIRS에 없음. 활성 assets 경로의 폐기 PNG는 제거. 전체 NW.js 재빌드는 수행하지 않음 |
| 이력 보존 | _autosave, _deployed_game, game_backup 등 과거 스냅샷과 tilemap-editor.html.bak2는 현행 실행 진입점이 아님. 과거 docs의 해당 수치/좌표는 폐기 이력으로만 해석 |
| 백업 | tmp/ch1-pass37/ 수정 전 코드 백업. 격리 manifest.json에 reuseAllowed:false 및 각 파일 해시 저장 |
| 검증 | 효과36+geometry5+main inline 구문1+폐기1=43 PASS. 실제 화면 검수 결과는 아래 보고 참조 |


MAP PRODUCTION REPORT — 37차

STAGE: CH1-1 저품질 원화 폐기, CH5/CH7 동일 사본과 편집기 등록 정리.
MASTER: silhouette/regions/main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음.
LARGE: 구형 묘비/노출뿌리 원화2종 및 동일 사본 포함6파일 격리. 기존 composites/overlap 유지. 신규 반복실루엣 없음.
MEDIUM: connections 유지. 제거 대상은 소형 비충돌 데코로 연결구조 변경 없음. remaining holes 전수 검수 아님.
GROUND: 폐기2대상의 접촉shadow/flat모드 제거. 기존오염·야영지바닥·잔해3곳접지 유지. 기존재질통합 개선 여지 잔여.
PLAYABLE: main arenas/travel/breathing/threat space 유지. 남쪽START/북쪽EXIT와 시체나무 양쪽우회 geometry 검사 통과. 전투화면 가독성 유지.
LANDMARK: primary시체나무/secondary야영지·늪 유지,tertiary구형묘비·노출뿌리 제거.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 8개와 SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL,합계14시점+COMBAT 캡처. CAMP_REAR 원배율 및 전체보드 직접검수,밝은묘비가 사라지고 기존지면 연결 유지.
TECH QA: 43테스트 PASS. 보조game-easy-test inline6개/editor1개/tilemap-editor1개 추가 구문검사 PASS. 격리6파일 SHA256 일치 및 활성경로 부재검사 PASS. 실게임 retired objects/sprites/metadata 모두0,기존잔해shadows drawImage3. JS pageerror0/HTTP오류0,외부네트워크차단6개와인트로중단9개. 60청크 ready/60,visibleIds=drawnIds. 캡처시 seam 관찰,전청크전수검수아님. 사망UI error=null. 카메라체력50ms보충/iframes60,전투전무적보충해제. WASD왕복(4020,7220)→(4113.96369,7238.51573),전경로종주아님. COMBAT90RAF median33.3/p9533.4ms(headless1280×720녹화),전체성능PASS 아님. mapUnchanged=true;draw샘플cpuP95=0은성능근거로사용하지않음. NW.js 전체빌드와CH5/CH7화면검수 미수행.
FILES: stage-owned ch1-living-detail.js/test2개/archive6개+manifest/폐기SSOT. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련맵문서/CHANGELOG. unrelated touched0. tmp백업·captures는기존ignore.
GIT: staged 공유index보존. commit미완료(.git쓰기제한/기존승인후셸생성실패),push/deploy없음. 시작154→완료174개(동시작업포함). 타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋후속필요.
VISUAL VERDICT: RETOUCH — 지정저품질원화 제거는 확인. 전체맵소품의 재질·명도 통합은 잔여이며 전체맵최종PASS로보고하지않음.
NEXT PASS: 남은구형소품을 현재지면·랜드마크와 비교해 저품질후보를 분류. 폐기된 두원화의 재보강·재사용 금지.

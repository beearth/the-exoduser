## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 저품질 맵 에셋 폐기 SSOT — 2026-09-27

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


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

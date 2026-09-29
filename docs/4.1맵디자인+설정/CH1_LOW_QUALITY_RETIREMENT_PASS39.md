## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 구형 나무·덩굴 기둥 폐기 — 39차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **40차 현행(2026-09-27):** 흰부유돌처럼읽히는 moss_patch/ash_pile/mud_stain/ground_crack 지면원화4종폐기. loader·고정8배치·scatter후보에서제거. leaf와전투VFX ground_crack_sheet는유지. [현행SSOT](CH1_GROUND_DECAL_RETIREMENT_PASS40.md).

38차후속검수. rotten_tree 64×64, vine_pillar 48×80 픽셀원화는 현행생체맵에서 크게확대되어 사용되던 구형에셋으로 REJECTED_LOW_QUALITY 확정. 동일사본포함7파일격리,재사용금지. 신규원화생성없음.

| 기존경로(제거) | 격리경로 | SHA256 |
|---|---|---|
| assets/map/ch1/collision/rotten_tree.png | archive/retired-map-assets/20260927-tree-pillar/assets/map/ch1/collision/rotten_tree.png | f1aec9cf25add6fb0fce53f1c6c1f7f11b5b999e01cc5c194fe9e7fe26d19c51 |
| assets/map/ch1/collision/vine_pillar.png | archive/retired-map-assets/20260927-tree-pillar/assets/map/ch1/collision/vine_pillar.png | e36d222e86aa6fd3de43684460a86ce426519b860c52876da9b4cfab8bfb622b |
| assets/map/ch7/collision/vine_pillar.png | archive/retired-map-assets/20260927-tree-pillar/assets/map/ch7/collision/vine_pillar.png | e36d222e86aa6fd3de43684460a86ce426519b860c52876da9b4cfab8bfb622b |
| assets/objects/rotten_tree.png | archive/retired-map-assets/20260927-tree-pillar/assets/objects/rotten_tree.png | f1aec9cf25add6fb0fce53f1c6c1f7f11b5b999e01cc5c194fe9e7fe26d19c51 |
| assets/objects/vine_pillar.png | archive/retired-map-assets/20260927-tree-pillar/assets/objects/vine_pillar.png | e36d222e86aa6fd3de43684460a86ce426519b860c52876da9b4cfab8bfb622b |
| docs/4.1맵디자인+설정/objects/rotten_tree.png | archive/retired-map-assets/20260927-tree-pillar/docs/4.1맵디자인+설정/objects/rotten_tree.png | f1aec9cf25add6fb0fce53f1c6c1f7f11b5b999e01cc5c194fe9e7fe26d19c51 |
| docs/4.1맵디자인+설정/objects/vine_pillar.png | archive/retired-map-assets/20260927-tree-pillar/docs/4.1맵디자인+설정/objects/vine_pillar.png | e36d222e86aa6fd3de43684460a86ce426519b860c52876da9b4cfab8bfb622b |

| 현행계약 | 값 |
|---|---|
| 추가폐기ID | m_rotten_tree,m_vine_pillar,m_c7vine,rotten_tree,vine_pillar,m_rtree,m_vpillar. 이전8개와총15개 |
| 게임 배치제거 | main m_rotten_tree tile(56,47),m_vine_pillar(34,156). easy-test 나무(56,47),기둥(29,158). CH7 m_c7vine 등록제거 |
| 과거충돌 | m_rotten_tree sz380/colSz60, m_vine_pillar sz280/colSz45, m_c7vine sz240/colSz45. 현재 모두미등록 |
| 충돌안전 | _rebuildColObjs에서폐기Set이면skip. 이전메타와저장배치가있어도보이지않는충돌을재생성하지않음. 일반뼈아치는충돌유지검사 |
| 편집기 | editor rotten_tree/vine_pillar, tilemap-editor 해당2개+m_rtree/m_vpillar 카탈로그제거 |
| 생체효과 | kinds의m_rotten_tree:1,feet의m_rotten_tree:50 및isTree의두구형type삭제 |
| 내부아틀라스 | dry아틀라스가구형나무ID를재사용하던것을 _atlasDry:1로분리. paint입력scale1/1,기존크기·위상·막·동맥동작보존. 실제맵오브젝트로등록하지않음 |
| 버전/메모리 | module20260927-39. 접지2장0.5MiB 및전체native87.81269454956055MiB 유지(기타shadow/GPU/임시제외). 새캐시없음 |
| 검사 | 효과36+geometry5+main구문1+폐기3=45PASS. 폐기7파일해시·활성경로부재·구형메타충돌제외·뼈아치충돌유지포함 |
| 범위 | terrain geometry 변경없음. 두구형오브젝트의충돌은의도적으로제거. 실제생체나무/고치/뼈아치/늪/야영지효과유지 |
| 기록 | 38차두소품후속검토를폐기확정으로변경. 기존가이드의64px modify/재작업계획은취소. archive는NW.js복사DIRS밖. 전체패키징미실행 |


MAP PRODUCTION REPORT — 39차

STAGE: CH1-1 구형나무·기둥폐기,CH7동일기둥등록제거.
MASTER: silhouette/regions/main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경없음.
LARGE: source assets2종7사본격리. composites/overlap 유지,구형픽셀나무·기둥실루엣제거.
MEDIUM: connections유지,remaining holes 신규발견없음(전체전수검수아님).
GROUND: 구형나무앵커제거. shadow/contamination/structure integration의기존지역효과유지. dry아틀라스일반/표면패스원시RGBA해시수정전후동일확인. _atlasDry로내부종속성분리.
PLAYABLE: main arenas/travel/breathing/threat space/남북루트보존. 두소품충돌제거로통행면확보. 새보이지않는충돌없음. combat readability유지.
LANDMARK: primary시체나무/secondary고치·야영지·늪유지. tertiary구형나무/기둥제거,큰뼈아치보호.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 8개+SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE(56,47)/OLD_PILLAR(34,156),합계16시점+COMBAT. 제거2지점원배율과전체보드직접검수. 신규빈사각패치없음,남은밝은지면소품은후속검토.
TECH QA: 45테스트PASS. 보조game inline6/editor1/tilemap1구문PASS. route/terrain geometry검사PASS,오브젝트충돌은의도된제거. 실제retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures13(인트로중단포함). 청크64ready,visibleIds모두drawnIds포함. seam전청크전수검수아님. 최종verify-final만승인증거(중간verify는수정전내부앵커문제포함). WASD(4020,7220)→(4017.2453,7222.7547),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. 사망UI오류없음. COMBAT90RAF median16.7/p9550ms,headless1280×720녹화로전체성능PASS아님. CH7시각검수/NW.js전체빌드미수행.
FILES: stage-owned ch1-living-detail.js/test2개/archive7개+manifest/39차문서. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련docs/CHANGELOG. unrelated touched0. tmp백업·captures기존ignore.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸실행오류),push/deploy없음. 시작186→완료204개(동시작업포함),타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 구형나무·기둥제거및기존동맥동작보존확인. 전체맵지면재질/남은구형소품통합잔여.
NEXT PASS: 흰부유돌처럼보이는 moss_patch/ash_pile 등지면데칼의실제원화·배치검수. 저해상도만으로일괄폐기하지않음.

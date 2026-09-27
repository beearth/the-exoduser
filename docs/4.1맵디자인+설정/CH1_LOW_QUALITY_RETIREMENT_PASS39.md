# 구형 나무·덩굴 기둥 폐기 — 39차 (2026-09-27)

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

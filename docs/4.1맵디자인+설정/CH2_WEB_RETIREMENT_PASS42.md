> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 구형 거미줄 폐기 및 CH2 연결부 검수 — 42차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


CH2(si4) 네 연결부에서64×64 구형거미줄을잠시숨겨원래화면과비교했다. 원화는밝은붉은픽셀얼룩으로읽혔으며거대벽·BACK/MID·뼈구조가연결을유지해원화및4배치를폐기했다. 큰거미줄뼈기둥 prop_webp.png와wall_skin_web_arc.png는별개원화로보존한다.

| 원본경로(제거) | 격리경로 | SHA256 |
|---|---|---|
| assets/map/ch1/floor_objects/spider_web.png | archive/retired-map-assets/20260927-web/assets/map/ch1/floor_objects/spider_web.png | 8d02049d385ffbe0a053a4fae0a3556d7dd9d487d7792501eba2ffd123fd7af8 |
| assets/map/ch2/floor_objects/spider_web.png | archive/retired-map-assets/20260927-web/assets/map/ch2/floor_objects/spider_web.png | 8d02049d385ffbe0a053a4fae0a3556d7dd9d487d7792501eba2ffd123fd7af8 |
| assets/objects/spider_web.png | archive/retired-map-assets/20260927-web/assets/objects/spider_web.png | 8d02049d385ffbe0a053a4fae0a3556d7dd9d487d7792501eba2ffd123fd7af8 |
| docs/4.1맵디자인+설정/objects/spider_web.png | archive/retired-map-assets/20260927-web/docs/4.1맵디자인+설정/objects/spider_web.png | 8d02049d385ffbe0a053a4fae0a3556d7dd9d487d7792501eba2ffd123fd7af8 |

| 현행계약 | 값 |
|---|---|
| 분류 | REJECTED_LOW_QUALITY,reuseAllowed:false. 동일원화4파일격리 |
| 폐기ID | spider_web,m_web,m_c2web,m_c2seamWeb;이전29+4=총33id |
| CH2제거좌표 | authored(78,39,rot352),(66,78,rot10),(140,137,rot12),(64,169,rot345). 이전runtime마지막은(2620,6700)으로floor탐색이동된위치 |
| CH2배치 | 109→105 authored. collision51 유지/noncollision58→54. role backfill9/boundary50/landmark18/detail6/mask4/filler12/seam6 |
| 연결부 | seamChitin2/seamEgg4 유지. top1/central2/east1/lower2. wall-belt31→27개(back9+filler12+seam6),비충돌 |
| CH2kit | seamWeb등록제거,wall-belt등록18→17종/active17→16종. seam종류3→2 |
| 공유진입점 | main/easy loader·legacy sprite/meta·scatter원화참조제거. editor spider_web,tilemap-editor spider_web/m_web제거 |
| 보호 | MEGA17개/중형세로42개/충돌배치51개/22점w30경로/START·EXIT/보스마스크4개보존 |
| 동적효과 | CH1생체모듈·늪·버블변경없음,module20260927-39유지 |
| 검증 | 효과36+CH1geometry5+CH2layout21+구문1+폐기6=69PASS. 연결부수감소만기대값갱신,경로·대형구조·가림·충돌검사유지 |
| 진입검수 | URL stage=4라도현재부트가stage0으로들어오는현상발견. 검수세션에서initStage(4)호출후stage4를직접확인. 게임부트코드는이번범위에서변경하지않음 |
| 이전runtime | stage4,mapHash fefe09a0,authored109,total111,collision52(시스템포함). 원화숨기기는검수세션Set만수정,그후production제거 |
| 한계 | 무적관람캡처로보스전투검증아님. 전체NW.js빌드미실행. archive는패키징복사DIRS밖 |


MAP PRODUCTION REPORT — 42차

STAGE: CH2-1(si4) 연결부구형거미줄폐기,CH1공유등록정리.
MASTER: silhouette/regions/main route/side spaces보존. mapHash전후 fefe09a0동일.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes기존벽보존,비교4연결부추가구멍없음.
LARGE: 구형source asset1종동일4파일격리. MEGA17개/composites/overlap/repeated silhouette보존.
MEDIUM: connections기존BACK9/filler12유지,seamWeb4개제거후chitin2/egg4유지. remaining holes전수검수아님.
GROUND: 붉은픽셀얼룩제거,shadow/contamination/structure integration기존지면유지.
PLAYABLE: main arenas/travel/breathing/threat space보존. collision전체52(시스템포함)전후동일. 플레이어시야가림은기존대형벽구조그대로,일부연결부밀도높아전체시각완성아님. combat readability실전전투미검증.
LANDMARK: primary굴외곽MEGA/secondary알집·점액·깊은굴/tertiary큰거미줄뼈기둥보존.
CAMERA QA: START(100,185)/EARLY(95,176)/ARENA(82,148)/SIDE_R(132,129)/SIDE_L(92,90)/LANDMARK(68,65)/LATE(102,48)/EXIT(100,24)+TOP/CENTRAL/EAST/LOWER 총12시점. 연결부4곳before/hidden비교후production after촬영직접검수. 초기에stage0부트된관찰은최종증거에서제외,initStage(4)후stage4확인.
TECH QA: 69검사PASS,보조game inline6/editor1/tilemap1문법PASS. 경로·충돌검사PASS. runtime hand105,total107,retired objects/collisions0,web0. JS pageerror0/HTTP오류0. mapHash동일,collision52동일. 로컬원화로딩정상. seam4곳검수,전체seam전수검수아님. P.iframes999999관람,적은첫진입시초기화되나이후일부스폰보임. 이동종주·전투·성능측정·NW.js전체빌드미수행.
FILES: stage-owned 폐기검사/CH2layout검사/archive4개+manifest/42차문서. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련docs/CHANGELOG. unrelated touched0.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸오류),push/deploy없음. 시작242→완료256개(동시작업포함). 타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 구형붉은거미줄제거및연결부유지확인. CH2대형구조가림/전체재질통합잔여.
NEXT PASS: CH1남은소형뼈·시체와낙엽의원화/실배치검토. CH2시각밀도개선은별도작업범위로구분.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 북동 독구덩이 젖은 지면 번짐 — 51차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


49차의 균일24캐시px 접지 폭을 위치별18~44캐시px로 변경한다. 기존원화 alpha의 거리장을 유지하고, 왼쪽아래와 오른쪽에만 더 넓은 젖은 흙을 만든다. 새 원형 패치·소품 추가가 아니다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | m_c1pool world(6700,1740), stage0 enabled, 기존 shadows 호출 |
| 거리장 | alpha>80 내부0, 외부44 초기값;2회L1순회,거리상한44 |
| 왼쪽아래 | L=exp(−[((x−170)/110)²+((y−350)/105)²]) |
| 오른쪽 | R=exp(−[((x−365)/95)²+((y−260)/115)²]) |
| 전이폭 | reach=18+26×max(L,R), 캐시 좌표 px. e=max(0,1−d/reach) |
| 농도·색 | 기존 grain=.88+.12sin(.17x+2cos(.13y)); alpha=round(255×.48×e²×(3−2e)×grain),RGB(24,27,19). alpha0은RGB0 |
| 경계 | 원화416²/여백48/캐시512² 유지. 최대폭44는48px여백이내. e하한0으로음수농도재등장방지 |
| 비용 | 기존1MiB캐시 재사용,추가상시메모리0/추가draw0. 가시pool1draw 계약유지. 가우시안2개계산은최초캐시생성때만 |
| 보존 | 50차3vent/6400ms버블·가스,풀수축·원본PNG·맵·충돌·다른접지 |
| 버전 | main/easy query20260927-51 |
| 검사 | 기존pool검사에왼쪽아래24px초과번짐/왼쪽위좁은경계assert추가. 전체52PASS |
| 백업 | tmp/ch1-pass51/{ch1-living-detail.js,game.html,game-easy-test.html,test_ch1LivingDetail.test.js} |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 51차 북동pool GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존지역·남→북진행·전투공간·측면포켓보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크보존. 전체보드상새구멍없음. 전체완성판정아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존pool원화재사용. 소품추가없음. 주변식생반복은별도과제 |
| MEDIUM — connections / remaining holes | 뿌리주변접지폭을비대칭으로보정. 넓은지면통합은미완료 |
| GROUND — shadow / contamination / structure integration | 왼쪽아래·오른쪽의젖은흙번짐,나머지는좁은전이. 사각형/균일원형테두리미발견. 국소보정수준 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 공간역할·통행·피해불변. 낮은대비의흙번짐으로캐릭터·독액식별유지. 체력보충50ms QA |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 독구덩이·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점+전투1장. 전체보드·AUTHORED_POOL확대직접검토 |
| TECH — route / collision | WASD왕복확인,전경로완주아님. draw전후mapUnchanged=true. 폐기object/sprite/meta/collision잔존0. collision수정없음 |
| TECH — pageerror / 404 / seam / loading | pageerror0/HTTP오류0,64/64청크ready. 외부네트워크차단6건유지. 접지사각경계미발견 |
| TECH — performance | headless전투RAF90표본 median33.3ms/p95 49.9ms. 부하·적상태미통제,성능PASS판정안함. 추가상시캐시0/draw0 |
| TECH — other | 52검사PASS,easy6script문법PASS,사망UI error=null. NW.js빌드미실시 |
| FILES — stage-owned | ch1-living-detail.js poolContact,main/easy query,기존pool검사보강,관련문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유작업보존,신규무관수정없음 |
| GIT — staged / commit / push / deploy | 본작업미실시. 기존shell생성실패/.git쓰기제한. 시작53개→종료54개. 타작업임의정리없음 |

**VISUAL VERDICT: RETOUCH** — 국소적인지면번짐보정이며,풀주변의넓은재질통합은남아있다.

NEXT PASS: 주변지면과의색·재질관계를전체카메라에서검토. 접지폭만계속늘려해결하지않는다.

증거: captures/ch1_pool_seep51_20260927/index.html 및 verify-final/{AUTHORED_POOL.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후효과·적시각은다름.

## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 서쪽 뼈 아치 밑동 접지 — 53차 (2026-09-27)

기존세밀원화로유지판정된서쪽뼈아치의밑동만지면에붙인다. 원본에그려진돌계단·피묻은바닥윤곽을이용하며새타원그림자를만들지않는다. 같은id를쓰는CH3및다른좌표는제외한다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | enabled stage0의 m_bone_arch world(1420,6020),tile(35,150),sz300 |
| 변경 | shadows의debrisContact대상조건에위좌표아치추가.기존헬퍼재사용 |
| 캐시 | 이미지별WeakMap,256²RGBA/.25MiB추가.기존2대상+아치=3장최대/.75MiB(북동pool별도) |
| 원화정렬 | 캐시에원화192²를(32,32)에그림.실제크기dw/dh는meta.sz/scale/sourceSize/keepAR/squareDraw기존계산 |
| 알파윤곽 | alpha>80에서거리0,바깥최대12캐시px의L1거리. e=1−d/12 |
| 하단선택 | t=clamp((y−128)/64,0,1),위쪽은alpha0.밑동쪽으로smoothstep증가 |
| 색·농도 | RGB(29,24,24),grain=.82+.18sin(.37x+2cos(.21y)); alpha=round(255×.56×smoothstep(e)×smoothstep(t)×grain) |
| draw | offset(−dw/2−32dw/192,−dh/2−32dh/192),size256dw/192×256dh/192,flip반영.가시대상1draw추가 |
| 제외 | 다른stage/좌표,offscreen,미로드,srcRect/sheet/rot/anchorBottom/명시pivot제외. 기존guard유지 |
| 보존 | 원화·불꽃·배치·높이·충돌·기존잔해접지·pool버블/가스·지면전이 |
| 집계 | 이전부분집계91.31269454956055+.25=91.56269454956055MiB.전체GPU/기타shadow/언덕까지포괄한총메모리아님 |
| 버전 | main/easy query20260927-53 |
| 검사 | 아치접지생성/1회캐시/하단만alpha/상태보존/다른챕터·좌표·offscreen제외검사1+기존53=54PASS |
| 백업 | tmp/ch1-pass53/{ch1-living-detail.js,game.html,game-easy-test.html,test_ch1LivingDetail.test.js} |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 53차 서쪽아치 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존지역·남→북진행·전투공간·측면포켓보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크보존. 전체보드상새외곽구멍없음. 전체완성판정아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | bone_arch 원화유지. 밑동접지추가,타챕터동일원화에미적용 |
| MEDIUM — connections / remaining holes | 돌계단·피묻은밑동아래접촉그림자. 주변식생과넓은재질연결은잔여 |
| GROUND — shadow / contamination / structure integration | 하단alpha윤곽으로어두운접지. 윗부분·불꽃제외. 사각형그림자미발견 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 공간역할·통행·충돌불변. 불꽃·아치·캐릭터식별유지. 체력보충50ms QA. 문중앙통과가능성을새로보장한작업아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 서쪽아치·늪·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기존20+ARCH_DETAIL1=21시점및전투1장. 전체보드·아치확대직접검토 |
| TECH — route / collision | WASD왕복,전경로완주아님. draw전후mapUnchanged=true. 폐기object/sprite/meta/collision잔존0 |
| TECH — pageerror / 404 / seam / loading | pageerror0/HTTP오류0,64/64청크ready. 외부네트워크차단6건유지. 새접지사각경계미발견 |
| TECH — runtime proof | 실제로드된아치원화naturalWidth281,complete=true. 실제_OBJ_META로shadows별도호출:draws1,pixels=true. pivotX는undefined(검수JSON의null은직렬화표현),guard통과확인 |
| TECH — performance | headless전투RAF90표본 median33.3ms/p95 33.5ms. 부하·적상태미통제,성능PASS판정안함. 가시대상1draw/.25MiB추가 |
| TECH — other | 54검사PASS,easy6script문법PASS,사망UI error=null. NW.js빌드미실시. debrisProof기존2잔해집계는유지되며신규아치는별도probe확인 |
| FILES — stage-owned | ch1-living-detail.js 접지대상조건,main/easy query,신규검사,관련맵문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유작업보존. grep의bone_archer매칭3개몬스터문서는다른대상이므로미수정 |
| GIT — staged / commit / push / deploy | 본작업미실시. 기존shell생성실패/.git쓰기제한. 시작64개→종료70개. 타작업임의정리없음 |

**VISUAL VERDICT: RETOUCH** — 밑동접지는추가했지만아치주변의전체재질통합은완성되지않았다.

NEXT PASS: 서쪽아치와주변지면의색·재질관계검토. 현재접촉그림자를무작정확대하지않는다.

증거: captures/ch1_arch_contact53_20260927/index.html,verify-final/{ARCH_DETAIL.png,camera-board.jpg,runtime.json,camera-tour.webm},probe/proof.json.전후적·효과시각은다름.

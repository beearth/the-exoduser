## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 중앙 전투면 피부 재질 — 56차 (2026-09-27)

서쪽 피부 지면과 중앙 전투면의 색조를 맞춘다. 중앙 한 구역의 재질 조정이며 두 지역 사이 전체 통로의 피부화는 미완료다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | enabled stage0 region2, tile(100,120),world(4020,4820),1360×820 |
| 합성 | 진입 globalAlpha×.76(기존 .6). 서쪽 region0 .82, 나머지 region1·3·4 .6 |
| palette | #343034 / #494042 / #343034. gradient(0,0)→(180,512),stop0/.45/1 |
| 주름4개 | [sx,sy,cx,cy,ex,ey]=[190,160,255,235,310,330];[410,120,360,215,470,285];[550,260,520,352,620,390];[280,395,380,360,432,420] |
| 곡선 | moveTo(sx,sy),bezierCurveTo(cx,sy−18,cx,cy,ex,ey) |
| 음영 | rgba(31,24,30,.14),width4. offset(−1,−1) 강조 rgba(145,123,117,.12),width1 |
| 공통 재질 | seed=1397+2×971=3339. 얼룩28/grain9500/미세주름23 유지 |
| mask | 기존3lobe [300,255,288,210],[500,225,232,172],[440,332,220,152],X이동+18. gradient 반경 .12→1,alpha 0:.88/.48:.75/1:0 유지 |
| 자원 | 지역 캐시5×768×512RGBA=7.5MiB. 추가캐시0/draw0. 과거 부분메모리91.56269454956055MiB 유지(전체게임 총합 아님) |
| 적용 | main query20260927-56. easy는 Ch1LivingDetail 미연결,이번 변경 없음 |
| 백업 | tmp/ch1-pass56/{ch1-living-detail.js,game.html} |
| 회귀 | 기존55검사PASS. 지면정적성·캐시·stage제한·상태보존·폐기에셋·메인inline문법 포함 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 56차 GROUND CONNECTION 재질 조정.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 영역·남북 진행·측면공간 불변 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존 외곽 유지,새 질량 배치 없음 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 랜드마크 원화·합성 유지,신규 소품·복제 없음 |
| MEDIUM — connections / remaining holes | 서쪽과 중앙의 색조 관계 개선 대상. 두 지역 사이 전체 통로는 별도 재질 작업 필요 |
| GROUND — shadow / contamination / structure integration | 중앙 낙엽 투과 대비 감소, 회갈색 피부막과 낮은 주름4개. 접촉그림자 불변 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 중앙 전투공간·우회·여백·충돌 불변. 정적 비발광 지면 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 아치·늪·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+COMBAT1장. 전후 ARENA 확대와 전체보드 직접 검토. 낮은 주름·플레이어 식별 유지 |
| TECH — route / collision | WASD왕복만 수행,전체경로 완주 아님. mapUnchanged=true. 폐기 object/sprite/meta/collision0 |
| TECH — pageerror / 404 / seam / loading | JS예외0/HTTP오류0,64/64청크ready. 외부네트워크차단6건 포함 requestFailure14건. 새 사각경계 미발견 |
| TECH — performance | headless 전투90 RAF표본 median33.3ms/p95 50ms,부하 미통제. 성능PASS 판정하지 않음 |
| TECH — other | 최종55검사PASS,사망UI 표시/error=null. NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js,main query,관련 맵 docs·SSOT·CHANGELOG,captures 비교 |
| FILES — concurrent touched / unrelated touched | 동시 작업 보존,easy 미수정 |
| GIT — staged / commit / push / deploy | 본 작업 미실시. 기존 셸 생성 문제/.git쓰기 제한. 시작82개,타 작업 강제 정리 없음 |

**VISUAL VERDICT: RETOUCH** — 국소 재질 개선이며 전체 피부 지면과 살아 있는 지옥의 완성 판정은 아니다.

NEXT PASS: 중앙 지면과 위쪽 부패 토양 경계의 재질·접합 검토.

완료 시점 변경 83개(동시 작업 포함). 증거: captures/ch1_arena_tissue56_20260927/index.html 및 verify-final/{ARENA.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후 적·효과 시각은 다름.

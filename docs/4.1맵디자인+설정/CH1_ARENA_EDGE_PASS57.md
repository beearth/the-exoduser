> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 중앙 북쪽 피부·흙 경계 — 57차 (2026-09-28)

중앙 피부막의 북쪽을 비대칭으로 넓혀 갈라진 흙과 섞는다. 전체 경로 피부화나 새 지형 제작은 아니다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | enabled stage0 region2,world(4020,4820),1360×820 |
| 추가 lobe | [325,113,205,106]. variant2 X이동+18로 실효 중심(343,113),world(3947.3958333333335,4590.9765625). 북쪽 끝 cache y7로 투명 여백 유지 |
| 마스크 | 기존3+신규1=4 lobe. gradient 반경 .12→1,alpha 0:.88/.48:.75/1:0,destination-in 유지 |
| 이음 주름2개 | [sx,sy,cx,cy,ex,ey]=[270,98,304,128,330,202];[410,72,388,127,438,179] |
| 곡선·색 | moveTo(sx,sy),bezierCurveTo(cx,sy+18,cx,cy,ex,ey). rgba(35,26,30,.16),width3. offset(−1,−1)강조 rgba(133,117,106,.1),width1 |
| 중앙 보존 | 56차 주름4개+이음2개,공통미세주름23 유지. palette #343034/#494042/#343034,합성 .76,1360×820 |
| 자원 | 지역5×768×512RGBA=7.5MiB,추가캐시0/draw0. 과거 부분집계91.56269454956055MiB 유지(전체게임 총합 아님) |
| 버전 | main query20260928-57,easy 모듈 미연결·미수정 |
| 백업·검사 | tmp/ch1-pass57/{ch1-living-detail.js,game.html},기존55검사PASS |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 57차 GROUND CONNECTION 북쪽 재질 접합.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 영역·남북 진행·측면공간 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존 외곽 배치·청크 유지 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 원화·랜드마크 보존,신규 소품 없음 |
| MEDIUM — connections / remaining holes | 중앙 북쪽 피부막과 흙의 국소 재질 연결. 전체 구역 사이 통로는 잔여 |
| GROUND — shadow / contamination / structure integration | 비대칭 북쪽 lobe와 짧은 이음2개,기존 접촉그림자 유지 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | geometry·collision·전투 여백 불변,정적 비발광 지면 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 아치·늪·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+COMBAT1장. 중앙 확대·전체보드 직접 검토. 북쪽 부채꼴의 재질 연결 보강,새 사각경계 미발견 |
| TECH — route / collision | WASD왕복만 수행,전체 경로 완주 아님. mapUnchanged=true. 폐기 object/sprite/meta/collision0 |
| TECH — pageerror / 404 / seam / loading | JS예외0/HTTP오류0,64/64청크ready. 외부네트워크차단6건 포함 requestFailure12건 |
| TECH — performance | headless 전투90 RAF표본 median33.3ms/p95 50.1ms. 부하 미통제,성능PASS 판정 안 함 |
| TECH — other | 55검사PASS,사망UI 표시/error=null,NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js,game.html query,관련 맵 docs·SSOT·CHANGELOG,captures 비교 |
| FILES — concurrent touched / unrelated touched | 공유 작업 보존,easy 미수정 |
| GIT — staged / commit / push / deploy | 본 작업 staged/commit/push/deploy 미실시. 현재 .git 읽기전용 권한. PowerShell 실행은 이번에 정상 확인. 공유 변경 포함 시작90개 |

**VISUAL VERDICT: RETOUCH** — 국소 지면 접합 개선이며 전체 맵 완성 판정은 아니다.

NEXT PASS: 중앙 남쪽 피부막과 진입 지면의 재질 연결 검토.

완료 시점 변경 75개(동시 작업 포함). 증거: captures/ch1_arena_edge57_20260928/index.html 및 verify-final/{ARENA.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후 적·효과 시각은 다름.

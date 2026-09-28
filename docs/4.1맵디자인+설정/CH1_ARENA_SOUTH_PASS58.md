## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 중앙 남쪽 진입 지면 연결 — 58차 (2026-09-28)

중앙 피부막과 남쪽 진입 흙의 접합을 보강한다. 전체 통로 피부화는 별도 미완료다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | enabled stage0 region2,world(4020,4820),1360×820 |
| 남쪽 lobe | [400,405,182,99]. X이동+18,실효 중심(418,405),world(4080.2083333333335,5058.6328125). 하단 끝cache y504,경계 여백8px |
| 마스크 | 기본3+북쪽1+남쪽1=5. gradient 반경 .12→1,alpha 0:.88/.48:.75/1:0,destination-in 유지 |
| 남쪽 이음2개 | [sx,sy,cx,cy,ex,ey]=[338,358,302,410,354,466];[482,348,510,409,456,454] |
| 곡선·색 | 북쪽과 같은 moveTo(sx,sy),bezierCurveTo(cx,sy+18,cx,cy,ex,ey). rgba(35,26,30,.16),width3. offset(−1,−1)강조 rgba(133,117,106,.1),width1 |
| 보존 | 중앙 기존주름4+북쪽2+남쪽2,공통미세주름23. palette #343034/#494042/#343034,합성 .76,1360×820 |
| 자원 | 지역5×768×512RGBA=7.5MiB. 추가캐시0/draw0,과거 부분집계91.56269454956055MiB 유지(전체게임 총합 아님). 캐시 생성 시 선2개 추가 |
| 버전·백업 | main query20260928-58. tmp/ch1-pass58/{ch1-living-detail.js,game.html}. easy 미수정 |
| 검사 | 기존55검사PASS |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 58차 GROUND CONNECTION 남쪽 접합.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 영역·남북진행·측면공간 불변 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존 외곽 배치·청크 보존 |
| LARGE — source assets / composites / overlap / repeated silhouette | 랜드마크·원화·배치 유지,새 소품 없음 |
| MEDIUM — connections / remaining holes | 중앙 남쪽 국소 재질 연결,전체 통로의 피부화는 잔여 |
| GROUND — shadow / contamination / structure integration | 남쪽 비대칭 lobe와 이음2개,기존 북쪽·접촉그림자 보존 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | geometry·collision·전투여백 불변,정적 비발광 지면 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 아치·늪·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+COMBAT1장. 중앙 확대·전체보드 직접 검토,새 사각경계 미발견 |
| TECH — route / collision | WASD왕복만 수행,전경로 완주 아님. mapUnchanged=true,폐기 object/sprite/meta/collision0 |
| TECH — pageerror / 404 / seam / loading | JS예외0/HTTP오류0,64/64청크ready. 외부네트워크차단6건 포함 requestFailure14건 |
| TECH — performance | headless RAF90표본 median33.4ms/p95 66.8ms. 부하·적 상태 미통제,성능PASS 판정 안 함 |
| TECH — other | 55검사PASS,사망UI 표시/error=null,NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js,main query,관련 맵 docs·SSOT·CHANGELOG,captures 비교 |
| FILES — concurrent touched / unrelated touched | 공유 작업 보존,easy 미수정 |
| GIT — staged / commit / push / deploy | 본작업 미실시. 현재 .git 읽기전용·이번 PowerShell 프로세스 생성 실패. 시작81개 |

**VISUAL VERDICT: RETOUCH** — 국소 접합 개선이며 전체 생체지옥 지면 완성 판정은 아니다.

NEXT PASS: 중앙과 동측 독성 지역 사이의 재질 색조·공간 연결 검토.

완료 시점 변경 81개(동시 작업 포함). 증거: captures/ch1_arena_south58_20260928/index.html 및 verify-final/{ARENA.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후 적·효과 시각은 다름.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

# 동쪽 늪 앞 피부·오염 지면 — 59차 (2026-09-28)

동쪽 늪 앞의 낙엽 대비를 낮추고 중앙과 같은 회갈색 피부에서 독성 녹갈색으로 전환한다. 중앙부터 동쪽까지 전체 통로의 재질 교체는 미완료다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | enabled stage0 region1,tile(151,136),world(6060,5460),1440×800 |
| palette | #3a3034/#424237/#303829 → #343034/#49443c/#303829. 수평gradient(0,256)→(768,256),stop0/.45/1 유지 |
| 합성 | 진입globalAlpha×.76(기존 .6). region0 .82,region1·2 .76,region3·4 .6 |
| 서쪽 lobe | [155,282,146,140],variant1 X이동0. 실효world중심(5630.625,5500.625). 최좌측cache x9 |
| mask | 기본3+기존늪쪽1+신규서쪽1=5lobe. gradient 반경 .12→1,alpha 0:.88/.48:.75/1:0,destination-in |
| 보존 | 기존 오염주름3개,얼룩28/grain9500/미세주름23,seed2368. 늪의 원화·버블·가스·수면·접촉그림자 유지 |
| 자원 | region5×768×512RGBA=7.5MiB,추가캐시0/프레임당draw0. 최초캐시 mask lobe1개 추가. 과거부분집계91.56269454956055MiB 유지(전체게임 총합 아님) |
| 연결·백업 | main query20260928-59,easy 미수정. tmp/ch1-pass59/{ch1-living-detail.js,game.html} |
| 검사 | 기존55검사PASS |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 59차 GROUND CONNECTION 동측 재질 전이.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 영역·남북진행·측면공간 불변 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존 외곽 청크·배치 보존 |
| LARGE — source assets / composites / overlap / repeated silhouette | 원화·랜드마크·합성 유지,신규 소품 없음 |
| MEDIUM — connections / remaining holes | 동측 국소 색조 연결,중앙과 동측 사이 전체 통로는 잔여 |
| GROUND — shadow / contamination / structure integration | 회갈색 피부→탁한 녹갈색 오염,서쪽 완만한 전이. 기존 접지 보존 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | geometry·collision·전투 여백 불변,지면은 정적·비발광 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 늪·아치·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+COMBAT1장. SIDE_R 확대·전체보드 직접 검토. 낙엽 대비 감소,늪 원화와 지면 질감 차이는 잔여 |
| TECH — route / collision | WASD왕복만 수행,전경로 완주 아님. mapUnchanged=true,폐기 object/sprite/meta/collision0 |
| TECH — pageerror / 404 / seam / loading | JS예외0/HTTP오류0,64/64청크ready. 외부네트워크차단6건 포함 requestFailure14건. 새 사각경계 미발견 |
| TECH — performance | headless RAF90표본 median33.4ms/p95 66.7ms. 부하 미통제,성능PASS 판정 안 함 |
| TECH — other | 55검사PASS,사망UI 표시/error=null,NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js,main query,관련 맵 docs·SSOT·CHANGELOG,captures 비교 |
| FILES — concurrent touched / unrelated touched | 공유 변경 보존,easy 미수정 |
| GIT — staged / commit / push / deploy | 본작업 미실시,현재 .git읽기전용. 시작88개. 저장 도구 오류 후 PowerShell 쓰기로 적용 |

**VISUAL VERDICT: RETOUCH** — 국소 재질 개선이며 전체 지면 완성은 아니다.

NEXT PASS: 동측 오염 지면과 늪 원화 접합의 명도·습윤감 검토.

완료 시점 변경 96개(동시 작업 포함). 증거: captures/ch1_east_tissue59_20260928/index.html 및 verify-final/{SIDE_R.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후 적·효과 시각은 다름.

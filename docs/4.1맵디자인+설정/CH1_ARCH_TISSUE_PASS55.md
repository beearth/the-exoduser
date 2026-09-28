> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 서쪽 아치 피부질 지면 — 55차 (2026-09-27)

기존 아치 진입부의 낙엽 무늬 대비를 줄이고 피부막의 낮은 주름을 읽히게 한다. 별도 에셋·캐시·배치는 추가하지 않는다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | enabled stage0의 region0, tile(49,151)/world(1980,6060),1440×880 |
| 합성 | globalAlpha=진입 alpha×.82. 기존 .6에서 상향. region1~4는 .6 유지 |
| 조직 주름 | 캐시 안5개. [sx,sy,cx,cy,ex,ey]=[110,246,166,340,324,374];[270,170,346,220,394,298];[512,182,468,288,588,340];[264,395,358,408,430,350];[556,425,600,350,668,280] |
| 곡선 | moveTo(sx,sy), bezierCurveTo(cx,sy−22,cx,cy,ex,ey) |
| 음영 | rgba(32,23,29,.16),width5. y−1.5 강조 rgba(148,121,111,.14),width1.5 |
| 보존 재질 | palette #342e31/#4c403e/#342e2f, seed1397,기존 얼룩28/grain9500/주름23/54차 마모선3 유지 |
| 마스크 | 기존3 lobe+54차 [108,308,86,95], X이동−18. alpha gradient 0:.88/.48:.75/1:0 유지 |
| 자원 | region5×768×512=7.5MiB, 추가 캐시0/draw0. 과거 부분 메모리91.56269454956055MiB 유지(전체게임 메모리 아님) |
| 버전 | game.html query20260927-55. easy는 모듈 미연결 상태로 미수정 |
| 회귀 검사 | 기존55검사PASS. 캐시 재사용·지면 정적 출력·stage 제한·상태 보존·퇴출 에셋·inline 문법 포함 |
| 백업 | tmp/ch1-pass55/{ch1-living-detail.js,game.html} |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 55차 GROUND CONNECTION 재질 조정.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 남북 진행·넓은 전투공간·측면 포켓 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 외곽 배치·청크 불변. 새로운 외곽 제작 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 아치·생체나무·독구덩이 원화 보존, 신규 소품 없음 |
| MEDIUM — connections / remaining holes | 아치 앞에서 기존 서쪽 피부막으로 연결. 넓은 주변 숲 재질 통합은 잔여 |
| GROUND — shadow / contamination / structure integration | 서쪽 낙엽 투과 대비 감소, 캐시 안 얕은 조직 주름5개. 기존 접촉 그림자·마모선 유지 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | geometry·collision·장애물·전투 동선 불변. 비발광·정적·낮은 주름 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 서쪽아치·늪·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+전투1장. 전체보드·SIDE_L·ARCH_DETAIL 확인. 초안 평행주름을 폐기하고 최종5개 곡선으로 재검수 |
| TECH — route / collision | WASD 왕복만 수행,전경로 완주 아님. mapUnchanged=true,폐기 object/sprite/meta/collision0 |
| TECH — pageerror / 404 / seam / loading | JS예외0/HTTP오류0,64/64청크ready. 외부네트워크차단6건,요청중단 등 총requestFailure13건. 새 사각경계 미발견 |
| TECH — performance | headless 전투90 RAF표본 median33.3ms/p95 33.4ms. 부하 미통제로 성능PASS 판정하지 않음 |
| TECH — other | 최종55검사PASS,사망UI 표시/error=null. NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js,game.html query,관련 맵 docs·SSOT·CHANGELOG, captures 비교 페이지 |
| FILES — concurrent touched / unrelated touched | 공유 변경 보존. alpha .6이 검색된 스킬·UI·몬스터 문서는 대상이 달라 미수정 |
| GIT — staged / commit / push / deploy | 미실시. 기존 셸 생성 문제 및 .git쓰기 제한. 시작82개. 타작업 강제 정리 없음 |

**VISUAL VERDICT: RETOUCH** — 국소 지면 개선이며 전체 생체지옥 맵 완성 판정이 아니다.

NEXT PASS: 서쪽 개선 화면을 기준으로 중앙 전투 지면의 재질 연속성 검토.

완료 시점 변경 82개(동시 작업 포함). 증거: captures/ch1_arch_tissue55_20260927/index.html 및 verify-retouch/{SIDE_L.png,ARCH_DETAIL.png,camera-board.jpg,runtime.json,camera-tour.webm}. verify-final 폴더는 폐기한 초기 평행주름 검수 이력이며 최종 증거가 아니다.

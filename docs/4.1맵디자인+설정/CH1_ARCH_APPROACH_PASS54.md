> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 서쪽 아치 진입부 지면 연결 — 54차 (2026-09-27)

53차의 아치 접촉 그림자는 유지하고 기존 서쪽 region0을 계단 밑동까지 연결한다. 신규 원화 없이 캐시 내부의 재질·마스크만 조정한다.

| 항목 | 현행 구현 |
|---|---|
| 적용 | enabled stage0의 skinRegions variant0, tile(49,151), world(1980,6060) |
| 범위 | 1280×880 → 1440×880. 중심·높이는 유지 |
| 추가 mask lobe | 캐시 좌표 [108,308,86,95]. variant0 X 이동 −18 적용, 실효 중심(90,308), world(1428.75,6149.375) |
| 마스크 | 기존3 lobe+신규1. gradient 반경 .12→1, alpha 0:.88/.48:.75/1:0. destination-in. 새 lobe 최좌측 cache x4로 가장자리 여백 유지 |
| 마모선 | [sx,sy,cx,cy,ex,ey,width]: [105,318,164,342,290,365,6], [124,285,218,312,348,322,4], [142,346,206,382,268,401,5] |
| 선 공식 | moveTo(sx,sy), bezierCurveTo(cx,sy,cx,cy,ex,ey). rgba(43,24,27,.2), 위 표 width. y−1 하이라이트 rgba(131,106,91,.12),width1 |
| 기존 재질 | variant0 palette #342e31/#4c403e/#342e2f, seed1397, 얼룩28/미세grain9500/주름23 유지 |
| 캐시·draw | region5×768×512 RGBA=7.5MiB. 추가 없음. 가시 region당 기존1draw/globalAlpha×.6 유지 |
| 부분 메모리 이력 | 91.56269454956055MiB 유지. GPU·기타그림자·언덕 등 전체 메모리 집계 아님 |
| 보존 | 원화·불꽃·아치접지·동적 늪·충돌·배치·통행 변경 없음 |
| 연결 | game.html query20260927-54. 현재 공유 game-easy-test.html은 Ch1LivingDetail 미연결이며 이번 변경 없음. 이전 main/easy 동시 연결 기록은 현행 easy에 적용되지 않음 |
| 검사 | 밑동 alpha>64, 시간별 동일 정적 출력, canvas2개(캐시+임시마스크),768×512,게임상태보존,stage1비출력 신규검사. 전체55PASS. easy 실행script6개 문법PASS |
| 백업 | tmp/ch1-pass54/{ch1-living-detail.js,game.html,game-easy-test.html,test_ch1LivingDetail.test.js} |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 54차 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 영역·남→북 동선·측면 포켓 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 외곽64청크 보존. 전체 보드에 새 외곽 구멍 미발견. 전체 완성 판정 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 뼈 아치 원화 유지. 신규 원화·복제 오브젝트 없음 |
| MEDIUM — connections / remaining holes | 계단 앞과 서쪽 흙의 색 연결 개선. 넓은 숲 바닥 무늬의 재질 통합은 잔여 |
| GROUND — shadow / contamination / structure integration | 기존 접지 위에 낮은 대비 적갈색 마모·지면 연결. 확대에서 새 사각 경계 미발견 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 넓은 전투공간 유지, 위험표시 없는 낮은 대비. 불꽃·캐릭터 식별 유지. 아치 중앙 통과를 새로 보장한 작업 아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 아치·늪·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+COMBAT1장. 전체보드 및 전후 ARCH_DETAIL 직접 검토 |
| TECH — route / collision | WASD 왕복, 전체 경로 완주 아님. mapUnchanged=true. 폐기 object/sprite/meta/collision 모두0 |
| TECH — pageerror / 404 / seam / loading | JS 예외0/HTTP오류0,64/64청크 ready. 외부 ERR_NETWORK_ACCESS_DENIED6건, intro.mp4 ERR_ABORTED8건 기록 |
| TECH — performance | headless 전투RAF90표본 median33.3ms/p95 50ms. 부하·적 상태 미통제, 성능 PASS 판정 안 함. 캐시·draw 추가 없음 |
| TECH — other | 전체55검사PASS, easy6script문법PASS, 사망UI 표시/error=null. NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js, game.html query, test/ch1LivingDetail.test.js, 관련 맵 docs·SSOT·CHANGELOG, captures 비교 페이지 |
| FILES — concurrent touched / unrelated touched | 공유 변경 보존. easy는 module 미연결로 미수정. CH3 역사 비교 문서는 대상 아치가 달라 미수정 |
| GIT — staged / commit / push / deploy | 본작업 미실시. 기존 셸 생성 실패 및 .git 쓰기 제한. 시작70개. 타작업 임의 정리 없음 |

**VISUAL VERDICT: RETOUCH** — 계단 밑동에서 지면으로 이어지는 색은 개선했지만, 주변의 숲 무늬를 살아 있는 지옥 재질로 통합하는 작업이 남았다.

NEXT PASS: 서쪽 아치 주변의 기존 잎·흙 반복 무늬가 드러나는 구간을 검토하고 피부질 지면과의 전이를 정리한다.

증거: captures/ch1_arch_approach54_20260927/index.html 및 verify-final/{ARCH_DETAIL.png,SIDE_L.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후 적·효과 시각은 다르다.

완료 시점 소스 제어 변경: 77개(동시 작업 포함).

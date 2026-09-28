## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 북동 독구덩이 파열 버블 — 50차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


북동 독구덩이의 기존16프레임 작은 기포5개/가스3갈래/잔물결 표면 패스를 전용3vent로 교체한다. 큰 늪에서 검수한64프레임 버블을 공유하며, 겹쳐서 두 세트를 그리지 않는다. 원화에 그려진 정적 기포는 유지된다.

| 항목 | 현행 값 / 구현 |
|---|---|
| 대상 | stage0 enabled, surfaceOnly draw, m_c1pool world(6700,1740). 화면 밖 cull 후 poolSurface 호출/continue |
| vent | local(x,y,offset): (−48,−24,0),(38,−6,.31),(−3,35,.67). 위치×min(1.6,o.scale또는1) |
| 위상 | q=((now/6400+offset)%1+1)%1. 주기6400ms, offset0/1984/4288ms |
| 버블 | 기존768²/64프레임 bubbleAtlas 공유, 프레임100ms 간격. 인접2프레임 alpha보간 |
| 파열 | 주기60% 팽창 종료→막8갈래384ms, 물방울8개768ms, 잔물결1152ms. 기존 paintSwampBubble 계약 유지 |
| 크기 | s=min(1.6,o.scale또는1)×.65. 현재scale1.55→s1.0075, 버블 최대지름 약32.24world px(풀 수축 전) |
| 가스 | 신규512² atlas,4×4셀/셀128²/16프레임. paintSwampGas(64,112,f/16,1.3), 각 셀clip. 버블과 같은 q,60~100%구간3lobes,78native px상승. 400ms샘플·인접2프레임 보간 |
| 정렬 | pool과 동일 wave=sin(now×.00095+.017x+.011y), X1+.012wave/Y1−.018wave. 그림자접지는정적 유지 |
| 합성 | 기존 surfaceOnly 호출 위치 유지. vent당 버블2+가스2=12drawImage, 이전공통표면2draw 대비+10. 전체맵 상시추가 아님 |
| 메모리 | 신규 가스RGBA1MiB. 버블2.25MiB는큰늪과공유. 북동만 먼저봐도동일atlas1개. 기존wet표면atlas는다른대상용유지 |
| 집계 | 49차88.81269454956055MiB 부분집계+1=89.81269454956055MiB. 전체GPU/기타shadow/언덕캐시까지포괄한총메모리아님 |
| 보존 | 원본PNG·49차접지·map/collision·큰늪수면/가스/버블·다른pool/pit의기존표면효과 |
| 버전 | main/easy query20260927-50 |
| 검사 | 신규세vent표면/시간변화·결정성/상태보존/512²+768²캐시만생성/다른stage·offscreen제외1+기존51=52PASS |
| 백업 | tmp/ch1-pass50/{ch1-living-detail.js,game.html,game-easy-test.html,test_ch1LivingDetail.test.js} |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 50차 북동 독구덩이 표면 움직임.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 지역·남→북 진행·중앙 전투공간·측면 포켓 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크 유지. 전체 보드상 새 외곽 구멍 없음 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 pool 원화와 큰늪 버블 atlas 재사용. 새 구조물 없음 |
| MEDIUM — connections / remaining holes | 49차 뿌리 접지 유지. 주변 지면 재질 통합 과제는 유지 |
| GROUND — shadow / contamination / structure integration | 그림자·오염 변경 없음. 표면3vent의 국소 버블/가스 교체 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 통행·피해 불변. 녹황 버블과 붉은 전투VFX 구분. 적 몸체가 일부 표면 효과를 가리는 장면은 그대로 기록. 체력보충50ms QA |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 북동 독구덩이·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점+전투1장. 보드 전체 및 북동32프레임 연속사진2장 직접 검토. 팽창→파열→잔물결·가스 확인 |
| TECH — route / collision | WASD왕복 확인, 전경로 완주 아님. draw 전후 mapUnchanged=true. 폐기object/sprite/meta/collision잔존0. height/collision 변경없음 |
| TECH — pageerror / 404 / seam / loading | pageerror0/HTTP오류0, 배경64/64ready. 외부네트워크차단6건 유지. atlas 사각 테두리 미발견 |
| TECH — performance | headless전투 RAF90표본 median33.2ms/p95 50ms. 부하·적상태미통제, 성능PASS판정 안 함. 본 대상surface12draw는북동에서만, 시작지점전투표본에서는cull |
| TECH — other | 52검사PASS, easy6script문법PASS, 사망UI error=null. NW.js빌드미실시 |
| FILES — stage-owned | ch1-living-detail.js poolSurface/북동surface분기, main/easy query, 신규테스트, 관련문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유파일 기존작업 보존, 신규무관수정없음 |
| GIT — staged / commit / push / deploy | 본작업미실시. 기존shell생성실패/.git쓰기제한. 시작296개→종료34개. 타작업임의정리/커밋없음 |

**VISUAL VERDICT: RETOUCH** — 이번 버블 파열 동작은 실화면에서 확인. 전체 pool 재질·맵의 시각 완성 판정은 별도이며 아직 보정 필요.

NEXT PASS: 북동 효과의 가독성은 유지하고, 남은 주변 지면 재질 연결을 검토한다. 통제된 성능 검증은 별도 과제.

증거: captures/ch1_pool_burst50_20260927/index.html, verify-final/authored_pool-closeup.gif(실제화면32프레임), motion-board-0.jpg/motion-board-16.jpg, camera-board.jpg/runtime.json/camera-tour.webm. 연속프레임은 화면캡처 지연을 포함하므로 정확한100ms애니메이션프레임 증거는 단위검사/코드 계약과 구분.

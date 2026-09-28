> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 북동 독구덩이 남쪽 지면 연결 — 52차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


독구덩이 남쪽 진입부에 낮은 대비의 재질 전이를 추가한다. 국소 접지 폭을 더 늘리지 않고 별도의 넓은 지면 레이어로 독액 주변 흙과 회갈색 생체 지면을 연결한다.

| 항목 | 현행 구현 |
|---|---|
| 등록 | skinRegions variant4, tile(167,47), world중심(6700,1900),900×680 |
| 색 | 세로linearGradient(384,0→384,512), stop0 #353c2a / .45 #413c36 / 1 #342e31 |
| 기본 재질 | 기존 regionalSkin 공통28얼룩/9500미세입자/23얕은주름. 고정seed1397+4×971=5281,시간·Math.random독립 |
| 추가 연결주름 | (sx,sy,cx,cy,ex,ey): (330,145,260,275,235,405),(410,170,455,280,520,370),(370,230,350,340,390,450). cubic컨트롤(cx,sy)/(cx,cy) |
| 주름 명암 | 그림자rgba(24,27,21,.18)/폭4,하이라이트rgba(119,117,92,.12)/폭1,offset(−1,−1). 캐시px |
| 마스크 | lobe(x,y,rx,ry): (384,190,240,160),(295,310,220,145),(520,340,170,120). variant4 추가Xoffset0 |
| 마스크 농도 | 각lobe radial .12→1, stop0 alpha.88/.48 alpha.75/1 alpha0. destination-in 적용 |
| 렌더 | enabled CH1, surfaceOnly=false,기존regional layer. globalAlpha×.6,화면밖cull. 소품/충돌추가없음 |
| 캐시 |768×512RGBA=1.5MiB추가,지역캐시총5장/7.5MiB. 최초생성시동일크기임시mask1장.가시때drawImage1회추가 |
| 집계 | 이전부분집계89.81269454956055+1.5=91.31269454956055MiB. 기타shadow/GPU/언덕캐시까지포괄한총메모리아님 |
| 보존 | 51차비대칭접지,50차3vent버블/가스,원본PNG·맵·높이·충돌·기존variant0~3 |
| 버전 | main/easy query20260927-52 |
| 검사 | 새지면존재/정적결정성/맵상태보존/surfaceOnly·다른stage제외/사각모서리투명1+기존52=53PASS |
| 백업 | tmp/ch1-pass52/{ch1-living-detail.js,game.html,game-easy-test.html,test_ch1LivingDetail.test.js} |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 52차 북동pool 남쪽 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존지역·남→북진행·전투공간·측면포켓보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크보존. 전체보드상새외곽구멍없음. 전체완성판정아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존원화보존. 넓은지면전이추가,구조물·소품추가없음. 식생반복은별도과제 |
| MEDIUM — connections / remaining holes | 독구덩이남쪽에회갈색접근지면연결. 주변식생과질감차이는잔여 |
| GROUND — shadow / contamination / structure integration | 녹갈색→회갈색전이·얕은주름3개,불규칙페더. 사각경계미발견. 기존접지그림자유지 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 통행·공간역할·피해불변. 버블·독액·캐릭터식별유지. 체력보충50ms QA |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 북동pool·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점+전투1장. 전체보드·AUTHORED_POOL확대직접검토 |
| TECH — route / collision | WASD왕복확인,전경로완주아님. draw전후mapUnchanged=true. 폐기object/sprite/meta/collision잔존0. collision수정없음 |
| TECH — pageerror / 404 / seam / loading | pageerror0/HTTP오류0,64/64청크ready. 외부네트워크차단6건유지. 새사각seam미발견 |
| TECH — performance | headless전투RAF90표본 median33.3ms/p95 33.5ms. 부하·적상태미통제,성능개선/실기PASS주장안함. 가시지역1draw/캐시1.5MiB추가 |
| TECH — other | 53검사PASS,easy6script문법PASS,사망UI error=null. NW.js빌드미실시 |
| FILES — stage-owned | ch1-living-detail.js skinRegions/variant4,main/easy query,신규검사,관련문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유작업보존,신규무관수정없음 |
| GIT — staged / commit / push / deploy | 본작업미실시. 기존shell생성실패/.git쓰기제한. 시작58개→종료64개. 타작업임의정리없음 |

**VISUAL VERDICT: RETOUCH** — 독구덩이앞의넓은지면연결은추가됐지만 주변식생과의질감차이는남아있다.

NEXT PASS: 동일지점의층을더쌓기보다남은주변식생·전체맵의우선보정대상을다시선정한다.

증거: captures/ch1_pool_approach52_20260927/index.html 및 verify-final/{AUTHORED_POOL.png,camera-board.jpg,runtime.json,camera-tour.webm}.전후적·효과시각은다름.

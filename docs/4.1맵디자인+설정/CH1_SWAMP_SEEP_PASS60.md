## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

# 큰늪의 비대칭 젖은 흙 접지 — 60차 (2026-09-28)

원본 윤곽을 따르는 접지의 폭과 농도를 조정한다. 왼쪽·아래쪽에 더 넓은 젖은 흙을 두고 다른 부분은 좁게 감쇠한다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | swamp 전용 m_c1gtoxicf(6500,5460),enabled stage0,기존 로드·crop·rotation·pivot guard 유지 |
| 캐시 | swampApron 512²RGBA/1MiB,img를(36,31)에440×450으로 그림. 원본PNG 미수정 |
| 거리 | alpha>80에서0,나머지30,전후2패스 L1거리 상한30 |
| 폭 공식 | L=exp(−(((x−140)/120)^2+((y−340)/145)^2)); B=exp(−(((x−340)/135)^2+((y−410)/95)^2)); reach=18+12max(L,B) |
| 감쇠 | e=max(0,1−d/reach),fade=e²(3−2e). 외측폭18~30캐시px,source 여백 X36/Y31보다 작음 |
| 농도 | alpha=round(255×.58×fade×grain),기존 .48 대체. grain=.76+.14sin(.19x+2sin(.11y))+.1sin(.31y−.09x) |
| 흙색 | damp=.5+.5sin(.043x+2sin(.027y)),RGB=(27+10damp,28+10damp,19+4damp). alpha0이면RGB0,기존 색 유지 |
| 합성 | 원본 이전 기존1draw,offset(−dw/2−36dw/440,−dh/2−31dh/450),size512dw/440×512dh/450,flip/globalAlpha상속 |
| 비용 | 추가캐시0/매프레임draw0,swamp최대20draw 유지. 최초 캐시 생성에서 Gaussian2개/픽셀 추가. 과거부분집계91.56269454956055MiB 유지(전체게임총합 아님) |
| 보존 | 버블64프레임·수면/가스16프레임·6400ms주기·원화·위치·충돌 불변 |
| 적용·백업 | main query20260928-60,easy 미수정,tmp/ch1-pass60/{ch1-living-detail.js,game.html} |
| 회귀 | 기존55검사PASS,접지 바깥픽셀·투명외곽·원본보존·버블파열·수면·루프·폴백 포함 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 60차 GROUND CONNECTION 늪 가장자리.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 영역·진행·측면공간 보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 외곽 배치·청크 불변 |
| LARGE — source assets / composites / overlap / repeated silhouette | 늪 원화·랜드마크 유지,새 소품 없음 |
| MEDIUM — connections / remaining holes | 큰늪 가장자리 국소 접합. 전체맵 재질 통합은 잔여 |
| GROUND — shadow / contamination / structure integration | 좌하단 중심의18~30폭 젖은 흙,비대칭 접지 농도 보강 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | geometry·collision·전투여백 불변,접지는 정적 비발광 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 큰늪·아치·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+COMBAT1장. 늪 확대·전체보드 검토,새 사각경계 미발견. 전체 원화/지면 질감 차이는 잔여 |
| TECH — route / collision | WASD왕복만 수행,전경로 완주 아님. mapUnchanged=true,폐기 object/sprite/meta/collision0 |
| TECH — pageerror / 404 / seam / loading | JS예외0/HTTP오류0,64/64청크ready. 외부네트워크차단6건 포함 requestFailure13건 |
| TECH — performance | headless RAF90표본 median33.3ms/p95 50ms. 부하 미통제,성능PASS 판정 안 함 |
| TECH — other | 55검사PASS,사망UI 표시/error=null,NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js,main query,관련 맵 docs·SSOT·CHANGELOG,captures 비교 |
| FILES — concurrent touched / unrelated touched | 공유 작업 보존,easy 미수정 |
| GIT — staged / commit / push / deploy | 본작업 미실시,현재 .git읽기전용. 시작95개. 완료 전 다른 작업의 game.html 및 SKILL_CARD_ICON_FIT 문서가 staged임을 확인해 공용 index를 변경하지 않음 |

**VISUAL VERDICT: RETOUCH** — 국소 접지 보강이며 전체맵 완성 판정은 아니다.

NEXT PASS: 큰늪 접합의 전체 크기 화면 검토를 기준으로 남은 원화·지면 질감 차이를 정리한다.

완료 시점 변경 100개(동시 작업 포함). 증거: captures/ch1_swamp_seep60_20260928/index.html 및 verify-final/{SWAMP_DETAIL.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후 적·효과 시각은 다름.

## 61차 밝은 돌 가장자리 완화

groundSprite의 기존 원본 알파 윤곽·색 보정 캐시에서 외측의 밝은 돌 반사를 낮춘다. 대상은 stage0의 m_c1gtoxicf(6500,5460) 한 원화이며, 내부 독액·버블·가스·위치·충돌·원본 PNG는 유지한다.

| 항목 | 현행 구현 |
|---|---|
| 원본 명도 | L=.299R+.587G+.114B. 기존 보라색 spill 보정 뒤 적용 |
| 반사 감쇠 | glare=clamp((L−105)/110,0,1)×max(0,1−d/64)×.38; 출력 RGB×(1−glare) |
| 범위 | 원본 투명 윤곽으로부터 안쪽 d<64인 밝은 돌. d≥64 내부 독액의 glare=0 |
| 알파 | 기존 rock=clamp((L−35)/100), edgeSpan=24+32(1−rock), smoothstep(d/edgeSpan) 유지 |
| 자원 | 기존 원본별 캐시1장 재사용,추가 캐시·프레임당 draw0. 캐시 생성 시 픽셀 곱셈만 추가 |
| 적용·검증 | main query20260928-61,기존55검사PASS. 밝은 바깥돌 RGB<160,안쪽(100,240)=[160,160,160,255],원본 buffer 불변 추가 확인 |
| 백업 | tmp/ch1-pass61/{ch1-living-detail.js,game.html,CH1_SWAMP_SEEP_PASS60.md} |

### MAP PRODUCTION REPORT — 61차

STAGE: CH1-1 / stage0 / 큰늪 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 영역·남북 진행·측면공간 보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크·외곽 배치 유지 |
| LARGE — source assets / composites / overlap / repeated silhouette | 늪 원화 자체·랜드마크·반복 상태 유지 |
| MEDIUM — connections / remaining holes | 원화 돌과 주변 젖은 흙의 명도 차이를 줄임. 전체 재질 통합은 잔여 |
| GROUND — shadow / contamination / structure integration | 60차 비대칭 접지 유지,밝은 외측돌만 최대38% 감쇠 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | arena·통행·여백·충돌 불변,플레이어와 버블 식별 유지 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 큰늪·아치·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 필수8 포함21시점+COMBAT1장. SWAMP_DETAIL·전체보드 직접 검토. 시각 판정 RETOUCH |
| TECH — route / collision | WASD왕복만 수행,전체 경로 완주 아님. mapUnchanged=true,폐기 object/sprite/meta/collision0 |
| TECH — pageerror / 404 / seam / loading | JS예외0/HTTP오류0,64/64청크ready. 외부네트워크차단6건 포함 requestFailure15건 |
| TECH — performance | headless RAF90표본 median33.4ms/p95 83.2ms. 부하 미통제,성능PASS 판정 안 함. 프레임당 추가 draw0 |
| TECH — other | 55검사PASS,사망UI 표시/error=null,NW.js빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js,game.html query,test/ch1LivingDetail.test.js,맵docs·CHANGELOG,captures비교 |
| FILES — concurrent touched / unrelated touched | 다른 작업의 기존 스테이징·공유변경 보존. game.html 다른 수정과 혼합됨 |
| GIT — staged / commit / push / deploy | 본작업 미실시. .git/index.lock Permission denied; 권한상승 PowerShell CreateProcessW 오류. 완료시 공유변경 103개 |

**VISUAL VERDICT: RETOUCH** — 원화와 지면의 밝기 차이는 완화됐으나, 큰늪 전체의 재질 통합은 남았다.

NEXT PASS: 게임 카메라에서 늪 테두리의 어두운 홈과 지면 텍스처가 만나는 구간을 검토한다.

증거: captures/ch1_swamp_rim61_20260928/index.html 및 verify-final/{SWAMP_DETAIL.png,camera-board.jpg,runtime.json,camera-tour.webm}. 전후 적·버블 시각은 다르다.

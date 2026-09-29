## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 북동 독구덩이 접지 — 49차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


원화 뿌리 외곽이 지면에서 끊겨 보이는 북동 m_c1pool 한 곳에 실제 alpha 윤곽을 따르는 젖은 흙 그림자를 추가한다. 별도 원형 링이나 신규 소품은 만들지 않는다.

| 항목 | 현행 구현 |
|---|---|
| 대상 | stage0 enabled 조건의 m_c1pool world(6700,1740), authored tile(167,43), sz300×scale1.55=465 |
| 함수 | ch1-living-detail.js poolContact 및 shadows 대상 분기. 기존 object보다 먼저 렌더 |
| 캐시 | 이미지별 WeakMap,512×512 RGBA=1,048,576bytes/1MiB. 소스는(48,48)에416×416으로 그림 |
| 거리 | alpha>80 내부0, 외부24 초기값. 상하2회 순회 L1 거리, 최대24캐시px |
| 농도 | e=1−d/24, grain=.88+.12×sin(.17x+2×cos(.13y)), alpha=round(255×.48×e²×(3−2e)×grain). RGB(24,27,19), alpha0은RGB0 |
| 월드 정렬 | 기존 sz/scale/sourceSize/keepAR/squareDraw로 dw/dh 산출. 위치 −dw/2−48dw/416, −dh/2−48dh/416; 크기512dw/416×512dh/416. flip 반영 |
| 동작 | 접지는 정적. 기존 pool 수축X±1.2%/Y∓1.8% 유지, 외곽 여유 안에서 움직임 |
| 제외 | 미로드/이미지 없음/다른 위치·챕터/화면 밖 제외. srcRect,sheet,rot,anchorBottom,명시pivot 메타는 미지원으로 skip |
| GPU/비용 | 캐시 생성시만 getImageData/putImageData. 가시 대상당 drawImage1회 추가. 임시 ImageData1MiB+거리.25MiB. 별도 GPU/브라우저 내부 비용 미계측 |
| 기존 집계 관계 | 38차 native87.81269454956055MiB 집계에 본 접지1MiB를 더하면88.81269454956055MiB. 당시 집계에서 제외한 기타 shadow/GPU/후속 언덕 캐시는 포함한 총메모리가 아님 |
| 버전 | main/easy script query20260927-49 |
| 보존 | 원본PNG·풀 움직임·늪 버블/가스·위치·충돌·다른 접지 불변 |
| 검사 | 신규 pool 접지 생성/캐시 재사용/상태·원화 보존/타챕터·오프스크린·미로드·다른 위치 제외 검사1+기존50=51PASS |
| 백업 | tmp/ch1-pass49/{ch1-living-detail.js,game.html,game-easy-test.html,test_ch1LivingDetail.test.js} |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / 49차 북동 독구덩이 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 남→북 진행·넓은 전투공간·지역·측면 포켓 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크 유지. 전체 보드상 신규 외곽 구멍 없음. 전체 완성 승인 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 북동 pool 원화 재사용. 원형 링 없이 실제 뿌리 윤곽의 접지 합성. 원화 자체 반복/스타일은 변경 없음 |
| MEDIUM — connections / remaining holes | 뿌리 끝과 지면 사이 얇은 전이 추가. 주변 식생과 근본적 재질 통합은 잔여 |
| GROUND — shadow / contamination / structure integration | 어두운 녹갈색 젖은 접지. 가까운 뿌리 외곽의 끊김 완화, 원화 경계 전체를 지운 것은 아님 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 통행·피해·공간 역할 불변. 독액/뿌리/캐릭터 식별 유지. 체력 보충50ms QA이며 일반 생존 검증 아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 / 북동 독구덩이·캠프 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점 및 전투1장. 전체 보드와 AUTHORED_POOL 확대 직접 검토 |
| TECH — route / collision | WASD 왕복 확인, 전체 경로 완주 아님. draw 전후 mapUnchanged=true. 폐기 object/sprite/meta/collision 잔존0. 기존 수축 함수·충돌 변경 없음 |
| TECH — pageerror / 404 / seam / loading | pageerror0, HTTP오류0, 배경64/64 ready. 외부 네트워크 차단6건 유지. 새 사각 접지 경계 미발견 |
| TECH — performance | headless 전투 RAF90표본 median33.3ms/p95 66.7ms. 이전보다 느린 관측으로 성능 PASS 판정 안 함. 적 상태·동시 실행 부하 미통제. 신규 접지는 북동 대상 가시성 조건이며 전투 표본 구간 시작지점에서는 cull됨 |
| TECH — other | 51검사 PASS, easy6 script 문법 PASS, 사망 UI error=null. NW.js 빌드 미실시 |
| FILES — stage-owned | ch1-living-detail.js poolContact/shadows, main/easy query버전, test/ch1LivingDetail.test.js 신규 검사, 관련 문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유 파일 기존 변경 보존, 본 작업 신규 무관 변경 없음 |
| GIT — staged / commit / push / deploy | 본 작업 미실시. 기존 shell 생성 실패/.git 쓰기 제한. 시작339개→종료296개. 타 작업 임의 정리/커밋 안 함 |

**VISUAL VERDICT: RETOUCH** — 북동 pool 접지는 보강했지만 주변 지면과의 전체 재질 통합은 미완성. 자동검사 PASS를 맵 완성으로 판단하지 않음.

NEXT PASS: 큰 늪과 북동 pool의 주변 지면 연결을 전체 카메라에서 비교하고, 성능 측정은 적 상태·부하를 고정한 별도 검증으로 분리한다.

증거: captures/ch1_pool_contact49_20260927/index.html 및 verify-final/{camera-board.jpg,runtime.json,camera-tour.webm}. 같은 카메라지만 적·VFX 시각은 동일하지 않음.

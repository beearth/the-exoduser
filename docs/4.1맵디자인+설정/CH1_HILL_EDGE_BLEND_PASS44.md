## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# 제단 고지대 지면 연결 — 44차 (2026-09-27)

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


> **47차 현행(2026-09-27):** 제단 정상부·ramp floor 반복 크기 round(_gtTileSz(floor)×1.4), texture에만 saturate(.7)/contrast(.92)/brightness(.92) 적용. 공통 월드 원점·46차 윤곽·44차 feather 유지. [현행 수치·검증](CH1_HILL_MATERIAL_PASS47.md).


> **46차 현행(2026-09-27):** 정상부의 정확한 타원을 96점 비대칭 폐곡선으로 교체. 사면 명암은 organicSkirt 전체에 적용. 44차 feather·45차 색상/월드 정렬·높이·충돌 유지. [윤곽 공식·검증](CH1_HILL_CONTOUR_PASS46.md).


> **45차 현행(2026-09-27):** 제단 사면의 갈색 radial wash를 저채도 방향광으로 교체하고, ramp 바닥을 정상부와 같은 월드 좌표에 정렬. 44차 48px alpha·높이·충돌 유지. [현행 색상·검증](CH1_HILL_SHADING_PASS45.md).


43차 LEAF_SITE(132,111)에서 보인 단단한 재질 경계를 조사했다. 배경 chunk_5_4.png가 아니라 _buildCh1HillSmoothingTex의 별도 언덕 합성 경계였다. 정상부와 오르막을 임시 surface에 그려 가장자리를 감쇠한 뒤 skirt에 합성하고, 최종 외곽도 감쇠한다.

| 항목 | 현행 구현 |
|---|---|
| 적용 | game.html/game-easy-test.html의 _buildCh1HillSmoothingTex. _featherCh1HillSkirt(surface) 합성 후 _featherCh1HillSkirt(out) 반환. 기존 stage0+smoothing 조건 유지 |
| 크기 | 기존 1900×960. 중심 tile(147,98), rx18/ry9, west ramp125→135 유지 |
| 경계 계산 | alpha>0 픽셀 d=min(48,x,y,w-1-x,h-1-y), 투명 픽셀0. Uint8Array 전후 2회 순회 L1 거리, 상한48px |
| 공식 | t=d/48; newAlpha=round(oldAlpha×t²×(3−2t)). alpha0은 RGB0. 각 처리 대상에서 거리48px 이상 내부 RGBA 유지 |
| 정상부·오르막 | 기존 타원·rampPath를 같은 임시 surface에 렌더. rampPath(rc=c)로 context 전달. 기존 floor texture와 tint 유지 |
| 캐시 비용 | 상시 캐시 1900×960 유지. 임시 surface RGBA7,296,000bytes. helper 1회 ImageData7,296,000+거리1,824,000=9,120,000bytes. 2회 helper+surface 할당 합계25,536,000bytes(약24.35MiB). 실제 동시 peak는 GC/Canvas 구현에 따라 달라지며 GPU·기존 out 제외 |
| 실행 비용 | 캐시 생성 시만 처리. 추가 매프레임 픽셀 처리 없음. 캐시 최초 생성 지연은 별도 계측하지 않음 |
| 충돌·높이 | _ch1HillBandBlocks/_ch1HillHeightAt 수정 전후 문자열 동일. 절벽 band .84~1.04, 서쪽 오르막·정상높이 유지 |
| 정렬 | 기존 _drawCh1Hill 호출 위치 유지. legacy _buildCh1HillTex 변경 없음 |
| 검사 | 신규 alpha 감쇠/단조/내부색/main·easy 연결 검사1+기존49=50 PASS. easy 실행 script6개 문법 통과(importmap/JSON 제외) |
| 보존 | 원본 PNG·배경 청크·ch1-living-detail.js 변경 없음. living detail module20260927-39 유지 |
| 백업 | tmp/ch1-pass44/game.html, game-easy-test.html |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 / smoothing / 44차 GROUND CONNECTION 보정.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 유지. 남쪽 시작→북쪽 출구, 넓은 중앙 전투 공간 유지. 전체 경로 새 설계 없음 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존 production_finish 64청크 유지. 20개 카메라와 보드에서 이번 변경으로 새 외곽 구멍은 보이지 않음. 전체 외곽 완성 승인 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 prop_g_edge 및 floor 재사용, 신규 PNG0. 언덕 합성 alpha 변경. 외곽 식생 반복은 후속 검토 |
| MEDIUM — connections / remaining holes | 제단 정상부·서쪽 ramp·skirt 접합 완화. 구조 연결 위치 불변 |
| GROUND — shadow / contamination / structure integration | 기존 그림자·오염색 유지, 접합부 alpha 감쇠. 넓은 갈색 띠와 평평한 고지대 인상은 남음 |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 배치·통행 폭 불변. WASD 왕복 및 전투 화면 확인. 체력 보충50ms를 사용하는 QA이며 일반 난이도 생존 검증 아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 고지대 / 캠프·독액 지점 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 8기본+12세부=20개 카메라 및 전투1장. 보드 전체와 HILL_SOUTH/HILL_RAMP 확대 직접 검토. LEAF_SITE/HILL_TOP 포함 증거 저장 |
| TECH — route / collision | WASD 왕복 확인, 전 구간 보행 완주 아님. 언덕 충돌·높이 함수 동일, draw 전후 mapUnchanged=true. 폐기 object/sprite/meta/collision 잔존0 |
| TECH — pageerror / 404 / seam / loading | pageerror0, HTTP오류0, 배경64/64 ready. 외부 Google Fonts/CloudFront/three 접근 차단6, intro.mp4 중단6 기록. 지면 경계 완화, 색 띠는 추가 보정 필요 |
| TECH — performance | headless 전투 RAF90표본 median16.7ms / p95 33.4ms. 실기 성능 보증 아님. 사망 UI 표시 정상/error=null |
| FILES — stage-owned | game.html, game-easy-test.html의 언덕 helper/builder, test/ch1HillFeather.test.js, 해당 맵 문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유 HTML·문서에 다른 작업 누적 존재. 본 변경 범위 외 수정 보존, 신규 무관 수정 없음 |
| GIT — staged / commit / push / deploy | 본 작업 staging/commit/push/deploy 없음. .git 쓰기 제한 및 기존 shell 실행 문제로 commit 미완료. 종료 status274개, 타 작업 임의 정리 안 함 |

**VISUAL VERDICT: RETOUCH** — 경계 절단은 완화됐지만 고지대의 높이감과 넓은 색 띠는 추가 보정 대상. 자동검사 PASS를 맵 전체 visual PASS로 간주하지 않는다.

NEXT PASS: 기존 지형·충돌을 유지하며 제단 사면의 명암과 재질 연결을 검토한다.

증거: captures/ch1_hill_edge44_20260927/index.html 및 verify-final/{camera-board.jpg,runtime.json,camera-tour.webm}. NW.js 패키징은 이번 검증 범위에 포함하지 않음.

검증 주의: 저장소 기준 git diff --check는 공유 game-easy-test.html의 이번 언덕 수정 범위 밖 기존 공백 변경으로 실패했다. 자동 수정하지 않았다. 최종 재실행 단위 검사50/50 PASS.

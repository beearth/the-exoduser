# 제단 고지대 지면 연결 — 44차 (2026-09-27)

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

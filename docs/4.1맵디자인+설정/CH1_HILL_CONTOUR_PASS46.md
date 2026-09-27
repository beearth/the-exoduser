# 제단 정상부 윤곽 — 46차 (2026-09-27)

> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


> **47차 현행(2026-09-27):** 제단 정상부·ramp floor 반복 크기 round(_gtTileSz(floor)×1.4), texture에만 saturate(.7)/contrast(.92)/brightness(.92) 적용. 공통 월드 원점·46차 윤곽·44차 feather 유지. [현행 수치·검증](CH1_HILL_MATERIAL_PASS47.md).


정확한 타원으로 잘리던 정상부 바닥을 완만한 비대칭 폐곡선으로 바꾼다. 원본 PNG 편집 없이 정적 캐시의 clip/fill만 수정한다. 사면의 조명도 별도 타원 대신 기존 organicSkirt 윤곽을 따른다.

| 항목 | 현행 구현 |
|---|---|
| 위치 | game.html/game-easy-test.html의 _buildCh1HillSmoothingTex 내부 plateauPath |
| 표본 | i=0..95, a=i×2π/96. 마지막 점에서 closePath |
| 반경 | r=1+.055×sin(3a+.6)+.03×sin(5a−1.1); 이론 범위 .915..1.085 |
| 점 좌표 | px=rx×.9×r×cos(a), py=ry×.77×r×sin(a). −.025rad 회전 후 (cx+10,cy−12) 이동 |
| 크기 | rx=18×40=720, ry=9×40=360; cx950,cy480. 타원 기준 변위 상한 x55.08px/y23.562px(회전 전). 실제 충돌 경계 확장 아님 |
| 적용 | 같은 plateauPath로 정상부 texture clip과 tint fill. 캐시 생성시에만 96점 경로2회. 난수·시간 의존 없음 |
| 사면 | organicSkirt clip과 동일 organicSkirt 경로에 soil fill. 45차 타원 fill 범위는 이력으로 대체 |
| 보존 | 45차 명암색·ramp 월드 정렬, 44차 48px feather2회, 1900×960캐시·임시 할당 계약 유지 |
| 코드 범위 | main/easy 모두 builder 외 문자열 백업과 동일. height/collision·맵 배치·통행·원본 에셋 유지 |
| 자원 | 신규 이미지0, 추가 상시 캐시0, 추가 매프레임 draw0. living detail module20260927-39 유지 |
| 백업 | tmp/ch1-pass46/game.html, game-easy-test.html |
| 검사 | 기존50개 PASS, easy6 실행 script 문법 PASS |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 smoothing / 46차 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 공간·지역·남쪽 시작→북쪽 출구 유지. 중앙 전투공간·측면 포켓 보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크 보존. 카메라 보드상 새 외곽 구멍 없음. 전체 외곽 완성 승인 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 원본 edge/floor 유지, 정상부 clip만 비대칭화. 반복 floor 무늬는 남음 |
| MEDIUM — connections / remaining holes | 서쪽 ramp와 정상부 연결 유지. 사면 명암을 skirt 외곽에 일치시킴 |
| GROUND — shadow / contamination / structure integration | 45차 저채도 명암·오염색 유지. 가장자리 규칙성 완화. 전체 고지대는 여전히 둥근 덩어리이며 단면 높이감은 추가 보정 대상 |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 공간 역할·통행 폭 불변. 전투 보드상 플레이어/적/붉은 VFX 구분 가능. 체력 보충50ms QA로 일반 생존 검증 아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 고지대 / 캠프·늪 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점, 전투1장. 전체 보드와 HILL_TOP/HILL_RAMP 확대 직접 검토 |
| TECH — route / collision | WASD 왕복 원점 복귀. 전 경로 완주 아님. builder 밖 코드 동일, draw 전후 mapUnchanged=true. 폐기 object/sprite/meta/collision 잔존0 |
| TECH — pageerror / 404 / seam / loading | pageerror0/HTTP오류0, 배경64/64 ready. 외부 네트워크 차단6건 유지. 새 날카로운 지면 절단 미발견 |
| TECH — performance | headless 전투 RAF90표본 median16.7ms/p95 33.4ms. 45차보다 낮지만 부하·적 상태 미통제이므로 성능 개선 주장 안 함. 새 프레임 작업0, 최초 캐시 생성 비용 미계측 |
| TECH — other | 50검사 PASS, easy6 script 문법 PASS, 사망 UI error=null. NW.js 빌드 미실시 |
| FILES — stage-owned | main/easy 언덕 builder, 본 문서 및 관련 맵 문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유 HTML/docs 기존 작업 보존. 본 작업 무관 신규 수정 없음 |
| GIT — staged / commit / push / deploy | 본 작업 모두 미실시. 기존 shell 생성 실패 및 .git 쓰기 제한. 시작279개→종료282개. 타 작업 임의 삭제/커밋 안 함 |

**VISUAL VERDICT: RETOUCH** — 정확한 타원 윤곽은 비대칭으로 보정했으나 바닥 무늬 반복과 고지대 단면은 남은 과제.

NEXT PASS: 반복되는 정상부 바닥 무늬의 대비·접합을 검토한다. 높이·충돌 계약 보존.

증거: captures/ch1_hill_contour46_20260927/index.html 및 verify-final/{camera-board.jpg,runtime.json,camera-tour.webm}. 동일 카메라 전후 비교, 적·VFX 시각은 동일하지 않음.

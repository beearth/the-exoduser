# 제단 바닥 반복 완화 — 47차 (2026-09-27)

> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


정상부와 ramp의 촘촘한 붉은 균열·돌무늬 반복을 완화한다. 기존 원화를 유지하고 정적 캐시 생성 때 texture의 크기·채도·대비를 조정한다. 동일 texture의 반복 자체를 제거한 작업은 아니다.

| 항목 | 현행 구현 |
|---|---|
| 위치 | game.html/game-easy-test.html의 _buildCh1HillSmoothingTex, 정상부·ramp floor drawImage |
| 반복 크기 | sz=Math.round(_gtTileSz(floor)×1.4). 정상부·ramp 공통 |
| 월드 원점 | wx0=h.cx×T−cx, wy0=h.cy×T−cy; sx=−((wx0%sz)+sz)%sz, sy=−((wy0%sz)+sz)%sz |
| 재질 필터 | saturate(.7) contrast(.92) brightness(.92); imageSmoothingEnabled=true, imageSmoothingQuality=high |
| 필터 범위 | texture 타일에만 적용. 정상부 tint / rampTone 전에 filter='none' 복구. edge 원화·제단·캐릭터에 미적용 |
| 보존 | 46차 96점 윤곽, 45차 명암/tint, 44차 feather48px×2, 기존1900×960캐시·임시 할당 계약 |
| 자원 | 신규 이미지0, 추가 상시 캐시0, 추가 매프레임 draw0. 캐시 빌드 시 필터 비용 추가, 실측 미실시 |
| 코드 범위 | main/easy 모두 builder 밖 문자열 백업과 동일. 맵·높이·충돌·배치 보존 |
| 백업 | tmp/ch1-pass47/game.html, game-easy-test.html |
| 검사 | 기존50개 PASS, easy6 실행 script 문법 PASS |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 smoothing / 47차 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 공간·지역·남→북 진행·중앙 전투공간·측면 포켓 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크 유지. 전체 보드상 신규 외곽 구멍 없음. 전체 외곽 완성 승인 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 edge/floor 사용. 바닥 반복 간격 확대·붉은 대비 완화. 동일 무늬 반복은 여전히 남음 |
| MEDIUM — connections / remaining holes | 정상부/ramp 공통 확대율·월드 원점 유지. 기존 feather 접합 유지 |
| GROUND — shadow / contamination / structure integration | 46차 비대칭 윤곽·45차 사면 명암 유지. texture에만 낮은 채도/대비. 확대 보간 적용으로 초기 시안의 네모난 픽셀 완화 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 배치·공간 역할·통행 폭 불변. 보드와 확대 화면에서 적·캐릭터·붉은 VFX 식별. 체력 보충50ms QA이므로 일반 생존 검증 아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 고지대 / 캠프·늪 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점과 전투1장. 전체 보드·HILL_TOP/HILL_RAMP 확대 직접 검토. 최종 증거는 verify-retouch |
| TECH — route / collision | WASD 왕복 확인, 전 경로 완주 아님. draw 전후 mapUnchanged=true. 폐기 object/sprite/meta/collision 잔존0. 높이·충돌 수정 없음 |
| TECH — pageerror / 404 / seam / loading | pageerror0, HTTP오류0, 배경64/64 ready. 외부 네트워크 차단6건 유지. 새 접합 절단 미발견 |
| TECH — performance | headless 전투 RAF90표본 median16.7ms/p95 50ms. 부하·적 상태 미통제로 이전과 인과 비교 불가, 성능 PASS 판정 안 함. 필터는 캐시 생성시에만 적용 |
| TECH — other | 최종 수정 후50검사 PASS, easy6 script 문법 PASS. 사망 UI error=null. NW.js 빌드 미실시 |
| FILES — stage-owned | main/easy 언덕 builder, 본 문서·관련 맵 문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유 HTML/docs 기존 작업 보존. 본 작업 무관 신규 변경 없음 |
| GIT — staged / commit / push / deploy | 본 작업 모두 미실시. 기존 shell 생성 실패/.git 쓰기 제한. 시작281개→종료283개. 다른 작업 임의 삭제/커밋 안 함 |

**VISUAL VERDICT: RETOUCH** — 촘촘한 반복과 붉은 대비는 완화. 바닥 무늬 자체의 반복 및 고지대 단면 표현은 남은 과제.

NEXT PASS: 고지대 재질 추가 확대 대신, 정상부와 사면의 구조적 연결을 검토한다. 근본적인 반복 제거는 별도 원화/재질 보강이 필요.

증거: captures/ch1_hill_material47_20260927/index.html 및 verify-retouch/{camera-board.jpg,runtime.json,camera-tour.webm}. verify-final은 보간 수정 전 중간 시안이며 최종본 아님. 전후 적·VFX 시간은 다름.

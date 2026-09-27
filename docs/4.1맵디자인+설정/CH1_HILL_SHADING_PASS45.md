# 제단 사면 재질·방향광 — 45차 (2026-09-27)

> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


> **47차 현행(2026-09-27):** 제단 정상부·ramp floor 반복 크기 round(_gtTileSz(floor)×1.4), texture에만 saturate(.7)/contrast(.92)/brightness(.92) 적용. 공통 월드 원점·46차 윤곽·44차 feather 유지. [현행 수치·검증](CH1_HILL_MATERIAL_PASS47.md).


> **46차 현행(2026-09-27):** 정상부의 정확한 타원을 96점 비대칭 폐곡선으로 교체. 사면 명암은 organicSkirt 전체에 적용. 44차 feather·45차 색상/월드 정렬·높이·충돌 유지. [윤곽 공식·검증](CH1_HILL_CONTOUR_PASS46.md).


44차의 넓은 갈색 띠와 평평한 사면 인상을 보정한다. 원본 이미지 편집 없이 _buildCh1HillSmoothingTex 내부 정적 합성만 변경했다. 정상부와 오르막 바닥 무늬가 다른 원점에서 시작하던 부분도 같은 월드 좌표로 맞췄다.

| 항목 | 현행 값 / 적용 |
|---|---|
| 적용 파일 | game.html, game-easy-test.html의 _buildCh1HillSmoothingTex |
| edge 원화 합성 | globalAlpha .48; filter grayscale(.72) sepia(.18) saturate(.46) brightness(.68) |
| 사면 조명 | linearGradient(0,cy−ry,0,cy+ry×1.08). stop0 rgba(95,90,84,.1); .42 rgba(56,49,46,.08); .72 rgba(28,25,26,.28); 1 rgba(18,17,19,.12) |
| 조명 적용 범위 | 기존 organicSkirt clip과 ellipse(cx,cy+10,rx×1.14,ry×1.08,−.035) 내부. 북측 약한 회색광→남측 그늘 |
| 정상부 tint | rgba(78,69,63,.08) |
| ramp tint | x0→x1 linearGradient. stop0 rgba(28,25,26,.18); .62 rgba(70,63,58,.1); 1 rgba(91,83,74,.08) |
| floor 월드 정렬 | 정상부·ramp 공통 wx0=h.cx×T−cx, wy0=h.cy×T−cy; sx=−((wx0%sz)+sz)%sz, sy=−((wy0%sz)+sz)%sz. imageSmoothingEnabled=false |
| 보존 | 44차 48px feather2회, 캐시1900×960, 높이·충돌·바닥 배치·외곽64청크·원본PNG·living-detail module20260927-39 |
| 자원 | 신규 이미지0, 추가 캐시0, 추가 매프레임 draw0. 기존44차 임시 할당 계약 유지 |
| 백업 | tmp/ch1-pass45/game.html, game-easy-test.html |
| 기술 검사 | 기존50개 PASS, easy 실행 스크립트6개 문법 PASS. 백업과 비교해 두 파일 모두 builder 밖 문자열 완전 동일 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 smoothing / 45차 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 공간·지역 유지. 남쪽 시작→북쪽 출구, 중앙 전투 공간·측면 포켓 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 64개 기존 배경 청크 보존. 전체 카메라 보드에서 신규 구멍 없음. 전체 외곽 완성 승인 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 edge/floor 원화 사용. 합성 색상만 보정. 외곽 식생 반복 과제 유지 |
| MEDIUM — connections / remaining holes | 서쪽 ramp 무늬의 월드 정렬 통일. 정상부 타원 실루엣 잔여 |
| GROUND — shadow / contamination / structure integration | 넓은 갈색 wash 감소, 북측 약한 광→남측 저채도 그늘. 기존 질감 노출 향상. 고지대 단면의 구조적 깊이는 미완성 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 배치·통행 폭·공간 역할 불변. 전투 화면에서 캐릭터·적·붉은 투사체 식별 가능. 체력 보충50ms QA, 일반 난이도 생존 시험 아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 고지대 / 캠프·늪 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점 및 전투1장. 보드 전체, HILL_SOUTH/HILL_RAMP 확대 직접 검토. 타원형 고지대 윤곽 RETOUCH |
| TECH — route / collision | WASD 왕복, 전체 경로 완주 아님. main/easy builder 이외 코드 백업과 동일. draw 전후 mapUnchanged=true; 폐기 object/sprite/meta/collision 잔존0 |
| TECH — pageerror / 404 / seam / loading | pageerror0, HTTP오류0, 배경64/64 로드. 외부 네트워크 차단6건은 기존 환경 제한. ramp 원점 정렬 보정, 새 절단선 미발견 |
| TECH — performance | headless 전투 RAF90표본 median16.8ms/p95 50ms. 이전44차33.4ms보다 높은 p95이나 적 상태·녹화·실행 부하가 통제되지 않아 회귀 여부 미확정. 성능 PASS 판정하지 않음. 정적 캐시 밖 프레임 작업 추가0 |
| TECH — other | 50검사 PASS, easy6 실행 script 문법 PASS. 사망 UI error=null. NW.js 빌드 미실시 |
| FILES — stage-owned | main/easy 언덕 builder, CH1_HILL_SHADING_PASS45.md 및 연결 맵 문서/SSOT/CHANGELOG |
| FILES — concurrent touched / unrelated touched | HTML·docs 공유 작업 누적 보존. 본 작업 신규 무관 변경 없음 |
| GIT — staged / commit / push / deploy | 본 작업 모두 미실시. 기존 shell 프로세스 생성 실패 및 .git 쓰기 제한. 시작277개→종료279개. 타 작업을 임의 삭제/강제 커밋하지 않음 |

**VISUAL VERDICT: RETOUCH** — 사면의 갈색 막은 줄었으나 정상부 타원형 외곽과 고지대 단면 표현은 추가 보정 필요.

NEXT PASS: 제단 정상부의 인공적인 타원 윤곽을 기존 지형 계약 안에서 재검토. 부하를 통제한 성능 비교는 별도 과제.

증거: captures/ch1_hill_shading45_20260927/index.html, verify-final/{camera-board.jpg,runtime.json,camera-tour.webm}. 전후 카메라는 같은 위치이나 적·VFX 시간은 동일하지 않음.

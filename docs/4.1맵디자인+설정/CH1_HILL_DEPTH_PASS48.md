# 제단 사면 깊이 보강 — 48차 (2026-09-27)

정상부와 사면의 낮은 단차를 읽도록, 정상부/ramp surface 합성에 낮은 농도의 그림자를 추가한다. 기존 바닥 alpha 실루엣을 그대로 사용하며 별도 타원 테두리를 만들지 않는다. 실제 높이·충돌 변화가 아닌 정적 명암 보강이다.

| 항목 | 현행 구현 |
|---|---|
| 적용 | main/easy _buildCh1HillSmoothingTex의 surface drawImage |
| 그림자 | shadowColor=rgba(10,9,12,.32), shadowBlur=20, shadowOffsetX=0, shadowOffsetY=18. 캐시 좌표 기준 |
| 실루엣 | _featherCh1HillSkirt(surface)의 감쇠 alpha에 기반. 정상부와 연결 ramp를 같은 surface로 합성 |
| 합성 순서 | edge/soil → shadow+feathered surface → 기존 사면 선4개 → 전체 out feather |
| 상태 격리 | c.save/restore로 shadow 설정 격리. 이후 사면 선 및 다른 렌더에 전파되지 않음 |
| 보존 | 47차 texture1.4배/필터, 46차 비대칭 윤곽, 45차 명암·월드 정렬, 44차48px feather2회. main/easy builder 밖 코드 백업과 동일 |
| 비용 | 기존1900×960 캐시 사용. 신규 파일 이미지/상시 캔버스/매프레임 draw 추가0. 브라우저 그림자 생성용 내부 임시 메모리와 최초 생성 시간은 미계측 |
| 백업 | tmp/ch1-pass48/game.html, game-easy-test.html |
| 검사 | 기존50개 PASS, easy6 실행 script 문법 PASS. height/collision/맵 배치 수정 없음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0 smoothing / 48차 GROUND CONNECTION.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존 지역·남→북 진행·중앙 전투공간·측면 포켓 유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 기존64청크 유지. 전체 보드상 신규 외곽 구멍 없음. 완성 승인 아님 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 edge/floor 원화 유지. 새 에셋 없음. 바닥 반복 과제 유지 |
| MEDIUM — connections / remaining holes | 기존 정상부/ramp alpha를 따라 그림자 연결. 서쪽 입구에 새 막힘처럼 보이는 테두리 없음 |
| GROUND — shadow / contamination / structure integration | 낮은 농도의 하향 그림자 추가. 기존 오염색·46차 윤곽 유지. 작은 명암 보강 수준이며 사면 구조 완성 아님 |
| PLAYABLE — arenas / travel / breathing / threat / combat readability | 공간 역할·통행 폭 불변. 플레이어·적·붉은 VFX 구분 유지. 체력 보충50ms QA, 일반 생존 검증 아님 |
| LANDMARK — primary / secondary / tertiary | 생체나무 / 제단 고지대 / 캠프·늪 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 기본8+세부12=20시점과 전투1장. 전체 보드·HILL_SOUTH/HILL_RAMP 확대 직접 검토 |
| TECH — route / collision | WASD 왕복 확인, 전체 경로 완주 아님. builder 밖 코드 백업과 동일. draw 전후 mapUnchanged=true. 폐기 object/sprite/meta/collision 잔존0 |
| TECH — pageerror / 404 / seam / loading | pageerror0, HTTP오류0, 배경64/64 ready. 외부 네트워크 차단6건 유지. 새 지면 절단 미발견 |
| TECH — performance | headless 전투 RAF90표본 median16.7ms/p95 50.1ms. 부하·적 상태 미통제로 성능 PASS 판정 안 함. shadow 생성은 캐시 빌드 때만 수행 |
| TECH — other | 50검사 PASS, easy6 script 문법 PASS. 사망 UI error=null. NW.js 빌드 미실시 |
| FILES — stage-owned | main/easy 언덕 builder, 본 문서·관련 맵 문서·SSOT·CHANGELOG |
| FILES — concurrent touched / unrelated touched | 공유 HTML/docs 기존 작업 보존. 본 작업 신규 무관 변경 없음 |
| GIT — staged / commit / push / deploy | 본 작업 모두 미실시. 기존 shell 생성 실패/.git 쓰기 제한. 시작327개→종료336개. 타 작업 임의 삭제/커밋 안 함 |

**VISUAL VERDICT: RETOUCH** — 가장자리 명암은 보강했지만 사면의 구조적 높이감과 반복 재질은 남은 과제. 작은 그림자 추가만으로 완성 판정하지 않는다.

NEXT PASS: 제단의 미세 명암 조정은 여기서 정리하고, 전체 카메라에서 다음 우선 보정 지점을 선정한다. 사면의 근본적 개선에는 별도 구조/재질 검토가 필요하다.

증거: captures/ch1_hill_depth48_20260927/index.html 및 verify-final/{camera-board.jpg,runtime.json,camera-tour.webm}. 같은 카메라이지만 적·VFX 시간은 다름.

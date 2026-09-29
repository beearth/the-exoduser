# 화면 하단 필터 경계 — 세로 크기 변경 캐시 누락

2026-09-29 사용자 스크린샷 `스크린샷 2026-09-29 070921.png`(2828×1266) 하단에 보이는 수평 색조 경계를 조사했다. **환경광과 동적 비네트의 캐시가 너비만 확인**하여, 너비가 같은 세로 리사이즈 후에도 이전 높이의 캔버스를 합성하는 결함을 재현했다. 같은 패턴의 저체력 빨간 틴트도 함께 수정했다. 83차 맵 이미지의 청크 경계나 새 84차 후보 원화 때문이 아니다. 84차 원화는 이 진단 시점 본편 미적용이다.

| id | 대상 | 현행 재작성 조건 | 유지하는 계약 |
|---|---|---|---|
| HEIGHT_ENV | `G._envLightCvs` | 최초 / 지옥 변경 / `G._envLightW!==C.width` / `G._envLightCvs.height!==C.height` | 기존 객체 재사용, 화면 전체 `C.width×C.height` 재작성, 매 렌더 프레임 합성 |
| HEIGHT_DVG | `G._dvgCvs` | 최초 / stage 변경 / `G._dvgW!==C.width` / `G._dvgCvs.height!==C.height` | 중심 `(C.width/2,C.height/2)`, 반경 `C.width×.35`→`C.width×.7`, 매 렌더 프레임 합성 |
| HEIGHT_RED | `G._redTintCvs` | 최초 / `G._redTintW!==C.width` / `G._redTintCvs.height!==C.height` | 저체력 조건·`#880000`·심박·alpha 공식 유지 |
| HEIGHT_SCOPE | 적용 파일 | `game.html`, `game-easy-test.html` 각 3개 조건 | 기존 `_envLightW/_dvgW/_redTintW` 및 부트 웜업 보존. 별도 height 상태 변수 추가0 |
| HEIGHT_COST | 비용 | 높이 변경 직후 해당 효과 최초 렌더에서 1회 재작성 | 정지 프레임 재작성 추가0, 신규 상주 캔버스0. FPS 향상 실측·선언 없음 |

환경광 RGBA는 지옥0~6 순서 `100,160,255,.06` / `80,160,60,.05` / `120,180,255,.06` / `160,60,200,.05` / `255,220,60,.05` / `200,180,120,.04` / `120,40,220,.06` 그대로다. 동적 비네트의 stop0 투명 / .7 alpha.05 / 1 alpha.15, 일반 alpha.2 / 보스 아레나.35 / 보스 체력50% 미만 `.5+.15×(1−hp/mhp)`도 그대로다. 안개·조명·블룸 shader/세기/맵 원화·geometry·충돌·세이브 변경0.

## 재현과 검증

| 검사 | 결과 |
|---|---|
| 수정 전 테스트 | `postFxHeightCoverage.test.js`: 두 파일×세 레이어×360→480/240 높이 변화 12건 실패, 정지 캐시 6건 통과. 실패 원인: 캐시 높이360 유지 |
| 수정 후 테스트 | 신규18 + lightingCameraCoverage11 + lightingTextureFreshness6 = 35 PASS |
| 실제 본편 수정 전 | Playwright Chromium, viewport2805×1206→1256→1006→1256. main2804×현재높이, env/dvg2804×1206 고정, 별도 fogGL은 현재 viewport 높이와 일치. pageerror/HTTP오류0, GL context loss false |
| 실제 본편 수정 후 | 동일 크기 순서에서 env/dvg가 main의 현재 높이와 매번 일치. 캡처·런타임 JSON은 `captures/map-filter-height-20260929/` |
| 보호 | 자체 QA 슬롯·API 쓰기 차단, 사용자 게임 탭 새로고침/세이브 조작0. software Chromium 결과는 실제 GPU 성능 승인과 별도 |

원본 백업: `tmp/game-before-filter-height-20260929.html`, `tmp/easy-before-filter-height-20260929.html`. 원본 전체 복원은 공유 파일의 다른 변경을 덮을 수 있으므로 사용하지 않는다. 세 조건만 분리한 패치가 체크포인트 대상이다. 이전 Mac 이동 필터 이슈의 실기 해결을 이번 Windows 세로 리사이즈 수정으로 선언하지 않는다.

## MAP PRODUCTION REPORT

STAGE: 공통 후처리; 본편 CH1-1 시작 화면 검수.

MASTER — silhouette / regions / main route / side spaces: 제작 변경0, 83차 원화 보존.

OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes: 변경0, 검정 공동 감소83차 유지.

LARGE — source assets / composites / overlap / repeated silhouette: 변경0; 84차 후보 별도 보존·미적용.

MEDIUM — connections / remaining holes: 이번 작업 변경0.

GROUND — shadow / contamination / structure integration: 지면 원화 변경0, 화면 후처리 커버리지 수정.

PLAYABLE — main arenas / travel space / breathing space / threat space / combat readability: 배치·동선 변경0. 이번 검수는 세로 리사이즈 경계이며 밀집 전투 전수 검수가 아니다.

LANDMARK — primary / secondary / tertiary: 생체나무·독구덩이·시작 오브젝트 유지.

CAMERA QA — START: 세로 크기 4상태 비교. EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 이번 후처리 작업은 미촬영; 이전83차 기록과 구분.

TECH QA — route / collision: 변경0. pageerror / 404: 전후 본편 검사0. seam: 화면 하단 경계 재현 및 수정 확인, 맵 청크 변경0. loading: 일반 본편 시작. performance: 높이 변경 시 재작성 외 정상 프레임 비용 추가0, FPS 미측정.

FILES — stage-owned: game/easy의 6조건, 신규 회귀 검사와 본 문서·관련 docs. concurrent touched: 공유 game/easy/CHANGELOG의 타 작업을 보존. unrelated touched:0.

GIT — staged / commit: 필터 수정의 분리 체크포인트 준비, 기존 staged 유지; 아래 최종 상태 기록 우선. push / deploy:0.

VISUAL VERDICT: RETOUCH — 하단 필터 결함은 수정·재검수; 전체 맵 최종 승인과 Mac/NW.js 실기 장시간 검수는 별도.

NEXT PASS: 84차 접합 후보는 별도 검수 후 적용. 필터는 사용자 실행 중 게임에서 새 코드가 로드되는 다음 진입부터 반영된다.


실제 Radeon RX9070XT / ANGLE D3D11 검수: 자체 QA 슬롯에서 2828×1216→2828×1266→2828×1006, main/env/dvg 크기 모두 각 상태와 일치·하단 직선 경계 없음·GL lost=false/error0·warn/error로그0. 일반 스크린샷은 CUA trace, 파일 갤러리는 headless 캡처임. 임시 viewport override는 reset하고 자체 QA 탭을 닫았다. reset 직후 과도기 표본은 main2828×1006 / inner2228×1255로 아직 재배치 전이므로 복구 후 안정된 게임 프레임의 검사 결과로 세지 않는다. 사용자 게임 탭 변경0.


최종 회귀: 신규18+기존 조명17+GPU 텍스처 재사용3+HTML 구문1+맵 숨은 레이어6 = **45 PASS**. localhost의 game/easy 응답은 디스크 SHA와 일치(HTTP200). Git 일반 조회와 승인된 `git add` 모두 exec provider가 WindowsApps pwsh를 시작하기 전 OS -1073283067/317로 실패했다. 자동 승인 거부가 아닌 프로세스 시작 장애다. Git 쓰기0·기존 staged 보존·이번 수정 미커밋, push/deploy/패키지 재빌드0. 체크포인트의 분리 패치와 관련 docs는 함께 후속 스테이징 대상이며 전체 게임 snapshot으로 타 작업을 덮지 않는다. 변경181파일은 검사 시점 전체 WIP 수이며 이번 작업 때문에 타 작업을 정리하지 않았다.

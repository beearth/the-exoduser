> **사용자 실기 확인:** 3333 재접속 후 사용자가120FPS 지속 유지를 확인했고 이 변경의 GitHub 반영 및 배포를 승인했다. 사용자 실제 플레이 확인과 아래 진단 측정은 구분한다. 배포 결과는 후속 기록한다.

# Mac 20FPS 재제보 후 기본 렌더러 수정

2026-09-10 localhost:3333 사용자가 텍스트 캐시 수정 후에도20FPS까지 떨어진다고 재제보했다. 이전 수정은 공통 글자 캐시만 고쳤고 WebGPU120FPS 측정은 명시적 비교 URL이었다. 일반 로비 진입은 여전히 WebGL2였다. 이번 로컬 변경은 일반 진입에도 Mac의 WebGPU 경로를 적용한다. push/배포 없음.

## 현재 선택 계약

| 환경/쿼리 | 우선 경로 | 실패 시 |
|---|---|---|
| 비 Electron, Mac, navigator.gpu 존재, webgpu 미지정 | WebGPU | WebGL2→Canvas2D |
| Mac, navigator.gpu 없음, webgpu 미지정 | WebGL2 | Canvas2D |
| 비 Electron, 명시적 webgpu=1 | WebGPU 시도 | WebGL2→Canvas2D |
| 명시적 webgpu=0/true/빈 문자열 등1 이외 | WebGL2 | Canvas2D |
| Windows 기본 | WebGL2 | Canvas2D |
| Electron 기본 및 webgpu=1 | WebGL2 | Canvas2D |

`_bootRenderer`에서 `_webgpuParam===null`인 경우에만 Mac 자동 선택을 허용한다. 과거의 `webgpu=0`도 무시하던 OR 조건을 재도입하지 않는다. 요약 로그 정책은 `mac-webgpu-default-20260910`, 실제 선택 백엔드 및 query값을 출력한다. `_initWebGPU`의 성공 여부에 따른 기존 폴백을 유지한다.

## 실기 증거

환경: 이전 글자 조사와 같은 Apple M5 Pro / macOS26.6.2 / Chrome152 / headed 실제 Metal GPU. 캔버스1440×900, high/resScale100/ATMOS2/FPS표시ON/제한없음. 두 경로 모두 글자 캐시 수정 적용. 일반 si1에서 testchar=1, 별도 mac-diagnostic 슬롯을 사용했다. 별도 프로필의 fetch fixture가 /api 요청을 처리하여 사용자 서버 세이브를 쓰지 않는다.

실험은 각10초, G.on=true/P.hp 복원/P.s=idle/P.iframes999999로 사망을 방지하고 W+D 입력을 유지했다. 지형·적 생성·AI·전투 이펙트와 렌더 함수는 기존 코드를 사용했다. 캡처 전 사망화면이 남은 것을 발견해 이를 제거한 실제 화면 조건을 추가 측정했다. 아래 첫 세 행은 사망 오버레이가 남은 상태에서 게임 시뮬레이션을 재개한 참고치로, 화면이 보이는 최종 측정과 구분한다.

| 일반 si1 경로 | rAF 평균 FPS | 표시 FPS 범위 | p95 프레임 간격 | G.on/hidden | 조건 |
|---|---|---|---|---|---|
| 명시적 WebGL2 | 13.95 | 10~120 | 100.1ms | true/false | 사망 오버레이 잔류, 전체10초 실제 이동·AI |
| 명시적 WebGPU | 119.80 | 116~120 | 9.3ms | true/false | 같은 시나리오, 사망 오버레이 잔류 |
| 쿼리 없는 새 Mac 기본 | 119.30 | 112~120 | 9.2ms | true/false | 실제 WebGPU/정책로그 확인, 사망 오버레이 잔류 |
| 쿼리 없는 새 Mac 기본, 게임 화면 노출 | 119.90 | 118~120 | 8.9ms | true/false | 사망 오버레이 제거, 이동·적·투사체 렌더 확인 |
| 명시적 WebGL2, 게임 화면 노출 | 15.07 | 8~120 | 116.7ms | true/false | 사망 오버레이 제거, 이동·적·투사체 렌더. 초기 대형 이미지 업로드 포함 |
| 명시적 WebGL2, 후속 warm10초 | 20.68 | 18~22 | 58.3ms | true/false | 큰 초기 업로드 완료 후에도 저하 지속. 기존 자동 품질 정책으로 ATMOS1로 내려감 |

후속 warm WebGL2는 업로드 총10.2ms/10초, JavaScript update+draw 평균 약3.44ms인데 화면 갱신은 평균48ms 수준이었다. 따라서 초기 다운로드만의 문제나 CPU 계산량만의 문제로 설명되지 않는다. Metal/드라이버 내부의 정확한 GPU 지연 원인은 이번 측정만으로 특정하지 않았으며, 빠른 기존 WebGPU 경로 선택으로 대응했다.

WebGL2 참고 실행의 이동 좌표는(4019,7421)→(5965,5477), 측정 후 적413체. 명시적 WebGPU는(4038,7428)→(5966,5490), 적424체. 새 기본 실행은(4043,7429)→(5971,5507), 적395체. 좌표/적 수는 샘플 종료 뒤 별도 질의로 기록하여 정확히10초 시점은 아니다. 적 AI와 스폰이 실시간으로 진행되므로 동일 프레임 리플레이는 아니다.

초기 일반 WebGL2 측정에서 G.on=false/좌표변화0인120FPS 결과는 **무효로 제외**했다. 현재 실제 화면 캡처는 `tmp/mac-fps-20260910/default-webgpu-visible.png`. FPS120, 적447/투사체293 표시와 게임 씬 렌더를 확인했다. 단일 캡처는 깜빡임·필터 경계 전체 검증이 아니다.

## 검증/한계

- 선택·강제0·미지원·실패·Windows/Electron·실제 요약16개, 글자6개, 동적텍스처3개: 총25 PASS.
- 옵션 없는 URL에서 `_useGPU=true`, `_useGL=false`, `webgpu=null`, `policy=mac-webgpu-default-20260910` 실제 부팅 확인.
- 일반 진입에서 렌더러를 바꾸는 수정이며 글자 수정은 유지. GPU 리소스 수명·맵·카메라·전투 수치·해상도·조명 갱신은 변경하지 않는다.
- 사용자 실제 탭 URL/브라우저/세이브는 아직 응답 대기. Chrome 실측이며 Safari, 전체 스테이지, 장시간 안정성은 미확인이다. 사용자 탭은 새로고침해야 새 정책이 적용된다. URL에 webgpu=0이 있으면 강제0을 지우거나1로 변경해야 한다.
- 백업: `tmp/mac-fps-20260910/game.before-renderer-default.html`.

## MAP PRODUCTION REPORT (제작 없음, 성능 검사 범위)

| 항목 | 상태 |
|---|---|
| STAGE | si1 일반 이동/적 AI, 이전 si3 보스 장면 참고 |
| MASTER / OUTER MASS / LARGE / MEDIUM / GROUND / PLAYABLE / LANDMARK | 제작·geometry·collision·배치 변경 없음 |
| CAMERA QA | 이동으로 렌더 부하 측정. 전체8카메라/필터경계 시각 승인 미수행 |
| TECH QA | 실제 Metal/WebGPU 선택 및 프레임 측정,25개 회귀 PASS. 초기 로딩/사망으로 정지한 표본 제외 |
| FILES | game.html의 선택식, rendererOptIn.test.js, 정책 관련 docs |
| GIT | 로컬 수정, commit/push/deploy 없음 |
| VISUAL VERDICT | RETOUCH — 실제 화면 확인, 전체 시각·카메라 품질 승인 아님 |
| NEXT PASS | 사용자 실제 게임에서 새 정책 적용과20FPS 재발 여부 확인 |

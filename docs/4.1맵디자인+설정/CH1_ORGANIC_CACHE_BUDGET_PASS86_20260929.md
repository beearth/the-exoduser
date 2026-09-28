# CH1-1 생체 디테일 첫 캐시 제작 분할86차 — 2026-09-29

사용자 지시: 맵 작업을 계속하며 FPS도 함께 관리한다. 실제 본편의 야영지 첫 진입에서 손 애니메이션 캐시가 한 draw 안에 생성되어 멈칫거리는 것을 확인했다. 기존 손·뿌리·매달린 시체 움직임과 원화를 유지하면서 첫 캐시 제작을 짧은 유휴 작업으로 나눴다. 그림자 캐시 및 GPU 업로드 지연은 별도이며 전체 프레임 문제 해결을 선언하지 않는다.

## 현행 계약

| id / 적용 위치 | 코드와 일치하는 값 / 동작 |
|---|---|
| MODULE | 본편 game.html의 ch1-living-detail.js?v=20260929-86. easy-test는 이 모듈 script가 없어 변경0 |
| BAKED_ART | master85 / cache·bakeVersion20260929-outer-85 /21빌드레이어/64청크 유지. 신규아트·재베이크·새움직임0 |
| organicCache / organicReady | m_c1tree·m_c1camp별 WeakMap, pending·failed WeakSet. 동일 Image identity는1작업만 생성. 완성 결과만 캐시에 공개 |
| organicJobs / tickOrganicBuild | 두 종류에 단일 큐·동시에 예약된 콜백1개. performance.now 기준3ms 목표 및 idle deadline의 남은시간 검사. 작업 단위는 선점 불가하여3ms 절대상한 아님 |
| scheduleOrganicBuild | requestIdleCallback(timeout120ms) 우선. 미지원 브라우저는 setTimeout8ms. 두 스케줄러 모두 없는 비브라우저 도구에서만 동기 drain |
| buildCamp | 기존3손/24프레임/6×4atlas/6pxmesh/92blend key/5200ms주기 유지. occupancy 및 frame mesh32cell마다 yield |
| buildCampGround | 기존512×400 접지 이미지·색·알파·거리22 계산 동일. 정방향·역방향 scan8행(4096px)마다 yield. 캠프 작업 완성 전에 생성; 렌더에서 추가 제작0 |
| buildTree | 기존8프레임/4×2atlas/16pxmesh/128blend key/now×.0008주기·root2축·hanger5개 유지. 모든 mesh 경로32cell마다 yield |
| FALLBACK | 준비 중 organic=false→기존 원본 sprite가 그려진다. 준비 완료 시 기존 now/world phase의 애니메이션으로 전환. 실패하면1회 warning·failed 기록 후 매프레임 재제작 없이 원본 유지 |
| GUARDS | stage0,!bossArena,!fieldRebuildQA,loadedImage,meta 존재,srcRect 없음 유지. 비활성/미로드 항목은 작업 예약0 |
| MEMORY | 완성 atlas 규격·텍스처 해상도 유지. 작업 중 generator/private canvas가 일시적으로 살아 있으며 완료 후 큐 참조 해제. 전체 RAM/VRAM 절감 측정 아님 |
| GAMEPLAY | geometry·collision·MAP_OBJS·이동·몹공격·저장 schema 변경0. GPU map lifetime/배처/텍스처 LOCK 변경0 |

## 실제 계측

Chrome153 / Windows / ANGLE (AMD, AMD Radeon RX 9070 XT (0x00007550) Direct3D11 vs_5_0 ps_5_0, D3D11) / WebGL2 / DPR1. 측정용 자체 탭·test/mapqa 슬롯. JS draw 호출 수÷실제 elapsed를 게임 FPS로 계산한다. rAF 약240Hz와 구분한다. 모든 유효 표본 hidden/focus/state/viewport invalid0. 로컬 synthetic DOM 입력으로 이동·좌클릭·Q를 실행했고 플레이어 HP/iframes를 QA에서만 보호했다. 저장 API 비GET/HEAD 쓰기는 자체 탭에서 차단; 닫으면서 계측·임시 옵션·입력 제거. 실제 Steam/NW.js·수동 장시간 플레이 판정으로 확대하지 않는다.

| 첫 진입6초 | organic 호출 최대 | draw 최대 | texImage2D 최대 | rAF 최대 /34ms초과 |
|---|---:|---:|---:|---:|
| BEFORE /2534×1262/cap0 |67.4ms|85.1ms|13.4ms|83.5ms /1회|
| BEFORE_REPEAT /동일크기/cap0 |72.5ms|149.8ms|66.7ms|154.4ms /10회|
| AFTER /2534×1235/cap0 |0.4ms|59.7ms|290.0ms|287.8ms /16회|

첫 캐시 생성은 draw에서 제거됐지만 AFTER에도 다른 GPU 업로드·그림자 지연이 남았다. idle 제작 콜백36회,평균2.82/p956.8/최대12.6ms;3ms는 체크 목표이고 GC·캔버스 native 작업을 선점하지 못한다. 전후 viewport·부트/업로드 시점이 달라 전체FPS 개선율을 계산하지 않는다. texImage2D 계측에는 맵 외 공용 텍스처도 포함하며290ms를 맵 청크 하나의 확정 병목으로 귀속하지 않는다.

청크 준비 후 고정카메라2534×1235/60FPS 제한:

| 카메라 | 시간 | 실제 game FPS | draw p95 /p99 /max(ms) | rAF max(ms) /34ms초과 |
|---|---:|---:|---:|---:|
| start | 6초 | 59.82 | 0.80 / 1.00 / 1.00 | 12.50 / 0회 |
| early | 6초 | 59.81 | 0.80 / 0.90 / 1.00 | 4.60 / 0회 |
| ARENA | 6초 | 59.83 | 0.70 / 0.90 / 1.00 | 8.60 / 0회 |
| SIDE_L | 6초 | 59.99 | 0.70 / 2.70 / 8.50 | 8.30 / 0회 |
| SIDE_R | 6초 | 59.99 | 0.90 / 1.00 / 1.10 | 4.60 / 0회 |
| LANDMARK | 6초 | 60.00 | 0.70 / 0.80 / 0.90 | 4.50 / 0회 |
| LATE | 6초 | 59.99 | 0.80 / 1.00 / 1.00 | 8.40 / 0회 |
| EXIT | 6초 | 60.00 | 0.80 / 1.00 / 1.30 | 4.60 / 0회 |
| COMBAT /64생성,57~64생존,탄최대16 |12초|59.74|3.50 / 5.30 / 13.10|25.00 / 0회|

8뷰 각6초+전투12초는 준비 후 표본이다. 순간 GPU 비용을 CPU draw 시간만으로 설명하지 않는다. START의 외곽 평균CPU .037ms,카메라 전체 외곽CPU최대 .3ms; 이 값은 전체 GPU/compositor 비용이 아니다. 게임error0/contextloss0/관측맵청크error0(요청·ready59개). Monica 확장 content.js 오류1개는 별도 로그에 보존했다.

## 검증과 파일

| 항목 | 결과 / 증거 |
|---|---|
| RED→GREEN | 신규4검사2PASS/2FAIL→4PASS; 단일 큐·실패폴백1추가→신규5PASS. 관련5파일 총60PASS |
| 정확한 그림 유지 | Node:두종류×3시각 byte equality. 실제 Chrome:수정전 원본 모듈 대비 캠프·나무0/1600/4800ms 각880² changedPixels0,총6표본 |
| browser-pixels readyMs | 준비 대기 외 원본 동기 제작·3프레임비교·readback을 포함한 전체 검증 시간. 애니메이션 준비시간이라고 해석하지 않음 |
| 이동 | synthetic W800ms로(4020,4820)→(4020,4679.101811551984),140.8981884480163worldpx. G.map 전체 직렬화동일 |
| 원화 / seam | PNG·geometry 파일 변경0,기존85차 seam224/전체재현 증거 유지. 이번 작업의 새224경계실측이라고 보고하지 않음 |
| 저장 / 원본 | ch1-living-detail.js 및 본편1module URL 변경. 대규모 수정 전 tmp/ch1-fps-pre86 백업. 준비 중 캔버스는게임draw에 노출0 |
| 증거 | [runtime](../../captures/ch1_map_fps86/runtime.json),[수정전](../../captures/ch1_map_fps86/before.json),[재현](../../captures/ch1_map_fps86/before-repeat.json),[픽셀](../../captures/ch1_map_fps86/browser-pixels.json),[검사](../../captures/ch1_map_fps86/tests.log),[브라우저 로그](../../captures/ch1_map_fps86/browser-logs.json) |
| 작업트리 | 보고 작성 시108Changes. 타작업누적으로100미만미충족; 실제코드·에셋 숨김/삭제·강제타작업커밋0 |
| Git / 배포 | 본 범위만 별도 인덱스로 체크포인트 준비. 실제 커밋 결과는 captures/ch1_map_fps86/git-checkpoint.json 확인. push/패키징/upload/deploy0 |

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 생체 디테일86차 캐시 제작 예산화·FPS QA |
| MASTER PLAN | 넓은전투공간·피부바닥·꿈틀동맥·썩은생체나무 승인콘셉트 유지. guide v0.9 선행 및 CAMERA→TECH 품질gate 적용 |
| LARGE OUTER MASS / LARGE | master85 실루엣·64청크·large 구조 유지. 신규채우기0 |
| MEDIUM / remaining holes | 원화접합85차유지. 연결구도·빈곳 수정0; 전체외곽 art RETOUCH 남음 |
| GROUND / shadow / contamination / structure integration | 기존피부·접지·오염형상유지. 캠프 접지만 동일계산을 제작큐로 이동. 별도 그림자첫캐시최대23.7ms 후속 |
| PLAYABLE / arenas / travel / breathing / threat / combat readability | 넓은공터·동선·충돌유지. W이동+64적/Q/좌클릭. 배경이탄·플레이어광을가리지않지만64적밀집시플레이어겹침가독성은전체승인하지않음 |
| LANDMARK / primary / secondary / tertiary | primary시체나무뿌리·매달린시체,secondary야영지손동작 exactpixels유지;altar·pool변경0 |
| CAMERA QA / START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 8뷰 캡처·직접시각검수·각6초gameFPS59.81~60.00. camera teleports는종주검수와구분 |
| TECH / route / collision | geometry불변·G.map동일·syntheticW140.90px. 전체길종주·문통과·보스전미검증 |
| TECH / pageerror /404 /seam /loading | gameerror0/contextloss0/59청크ready,error0. 전체자산404전수측정아님,seam이미지수정0/85증거유지. 준비중원본폴백확인·실패회귀PASS |
| TECH / performance | cold cacheCPU67.4/72.5ms→draw organic .4ms이하. 부트·신영역GPU290ms잔여,8뷰60제한59.81~60/64적59.74FPS. 장시간·전체모드PASS아님 |
| FILES / stage-owned | ch1-living-detail.js,신규test/ch1OrganicBuildBudget.test.js,본편moduleURL1줄,관련docs·본보고서 |
| FILES / concurrent touched | shared game/docs의기존UI/VFX/시작준비/전투warmup/underlay보존. easy-test·원화·타작업source수정0 |
| FILES / unrelated touched |0. captures/tmp는검수·백업용기존ignore규칙내 |
| GIT / staged /commit /push /deploy | scoped reviewed checkpoint만 준비;actual JSON확인,타stage보존,push/deploy0 |
| VISUAL VERDICT | **RETOUCH** — 이번 변경의완성애니메이션픽셀보존은확인. 전체맵시각·첫영역GPU지연·장시간성능승인남음 |
| NEXT PASS | 새영역청크/GPU업로드 source귀속·첫그림자캐시분할을 별도측정. 맵아트계속시고정8뷰+전투FPS/최대프레임/메모리항상기록 |

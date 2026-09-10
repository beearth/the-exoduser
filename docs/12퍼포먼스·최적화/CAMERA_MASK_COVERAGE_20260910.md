# 빠른 이동 시 조명 필터의 사각 경계

2026-09-10 사용자 제보: Windows PC에서는 정상이나 MacBook에서는 빠르게 화면을 이동하면 반투명 필터가 비틀어지고 사각 경계가 보인다. 금색 세로 띠는 기본 ray OFF 이후 해소됐지만, 투명 박스는 사이드바 종료 후에도 이동 시 재발했다. 이전의 박스 해결 판정은 철회한다. 사용자 FPS는 약 40까지 하락한다. 구매내역 사진의 모델 표기는 MacBook Pro 14 / M5 Pro / 16코어 GPU / 24GB이며 GPU 고장·성능 부족은 확인되지 않았다.

| 항목 | 수정 전 | 현행 계약 |
|---|---|---|
| 동적 조명 캐시 | `frame%3===0`에서만 재작성. 화면 크기 마스크를 `_litCamX-G.cam.x`, `_litCamY-G.cam.y`만큼 옮겨 재사용하므로 노출된 화면 가장자리에 어둠이 없고 사각 경계 발생 | 정지 시 기존 3프레임 주기. 카메라 x/y 변경·최초 생성·반해상도 크기 변경 시 즉시 재작성 |
| 토치 캐시 | 최초/크기 변경/`frame%3===2`에서 재작성, 중간 프레임에 동일한 가장자리 노출 | 활성 토치도 카메라 변경 시 즉시 재작성, 정지 시 기존 주기 유지 |
| 토치 GPU 전달 | 재작성해도 `_glVer` 없음, 최초 GPU 픽셀 재사용 | 재작성 후 `_torchCache._glVer=(_torchCache._glVer||0)+1`, 합성 전에 갱신. 같은 크기 텍스처 재사용 |
| 토치 실행 조건 | 불투명도 0에서도 전체 화면 캔버스 생성·스탬프 계산·합성 | `OPT.torch&&OPT.postfx&&OPT.quality!=='low'&&_TORCH.darkAlpha>0`. 현재 `darkAlpha=0`에서는 렌더 생략 |
| 해상도 | 조명 가로/세로 각각 `~~(C.width/2)`, `~~(C.height/2)` | 동일. 토치 활성 시 C 전체 크기. `rz()`의 일반 게임 DPR/SSAA는 1, HiDPI 맵 QA만 별도 |
| 시각 수치 | CH1 ambient `[6,16,9,.60]`, `LIT_COL_MIX=.62`, 플레이어 조명 반경470/세기.86 | 유지. 토치 기본반경550/불투명도0도 유지 |

토치 GPU 결함은 활성 불투명도에서 확인한 별도 잠재 결함이다. 현재 불투명도는 0이므로 사용자의 어두운 사각형 원인으로 단정하지 않는다. 동적 조명 캐시 가장자리 노출은 재현됐으나 Mac 실기에서 같은 수정으로 사라지는지는 미확인이다.

## 검증

| 검증 | 결과 / 한계 |
|---|---|
| `test/lightingCameraCoverage.test.js` | 수정 전 이동 ±180/±70px 및 0.5px의 두 레이어 6건, 토치 갱신 주기 1건·GPU 픽셀 2건 실패. 0-opacity 불필요 할당도 별도 실패 재현. 수정 후 11건 PASS |
| GPU 캐시 검사 | WebGL2/WebGPU 업로드 함수를 실제 소스에서 추출. GPU 저장만 Canvas 픽셀 스냅샷으로 대체해 픽셀 동일성·정지 시 재업로드 억제 검사 |
| 기존 회귀 | lightingTextureFreshness 6 + webglDynamicTexReuse 3 + rendererOptIn 11 + atmosRayIsolation 2, 신규 포함 총 33건 PASS |
| 실제 Windows Chrome 게임 | RX 9070 XT / WebGL2 / 1440×900 / 동일 초기 seed, 대각선 이동 6초. 전후 pageerror 0, ray 0, 토치 할당 true→false |
| 실제 공개 서비스 | 배포 game SHA256 일치, WebGL2 실제 실행·WebGPU false·ray0·토치 미할당·이동 중 pageerror0. `captures/renderer_optin_20260910/camera-mask-live.json`, `camera-mask-game-live.png`. Mac 실기 테스트 아님 |
| Windows 참고 시간 | 평균 draw 약 .854→.837ms, 조명 .028→.051ms, 토치 .018→.0005ms. headless rAF 약237Hz. 단일 초기 장면 참고치로 Mac FPS나 전투 전체 성능 보장 아님 |
| 증거 | `captures/renderer_optin_20260910/camera-mask-game.json`, `camera-mask-game-before.png`, `camera-mask-game-after.png`, `camera-mask-benchmark.json` |
| 비용 | 이동 중 조명 갱신은 최대 매 렌더 프레임. 불투명도 0 토치는 생략. Mac에서 비용 상쇄·FPS 개선 여부는 추가 측정 필요 |
| 저장 | 로컬 브라우저 API fixture, 실제 사용자 슬롯 쓰기 없음 |
| 실기 | Mac 사각 경계·이동·전투·60FPS 유지 모두 PENDING. 약40FPS 제보를 해결된 것으로 보고하지 않음 |

## 범위와 QA

맵 가이드 v0.9 전체를 읽고 기술 검사와 시각 판정을 구분했다. 변경은 공통 후처리 캐시이며 맵 제작 단계는 수행하지 않았다.

| MAP PRODUCTION REPORT 항목 | 상태 |
|---|---|
| STAGE | 전 스테이지 공통 화면 효과, 로컬 CH1 초기 장면 확인 |
| MASTER / OUTER MASS / LARGE / MEDIUM / GROUND / PLAYABLE / LANDMARK | 제작·좌표·충돌·배치 변경 없음 |
| CAMERA QA | 빠른 이동 필터 검사. START 외 맵 camera board는 범위 밖 |
| TECH QA | 캐시 픽셀·갱신 주기·GPU 전달, 로컬 pageerror 0. route/collision/loading 제작 변경 없음, Mac FPS 미확인 |
| FILES | game.html, lightingCameraCoverage.test.js, 관련 그래픽·최적화 문서. 타 작업 CHANGELOG/guard 수정은 보존 |
| GIT | 수정 `254ef6f7d754acf34c1355705ca6b83b7deda21e` 커밋, main/작업 브랜치 push. `dpl_4TmCKo2h7UzEyE9hbMrH5UEXTr2B` READY, the-exoduser.vercel.app alias. 배포 game SHA256 `da4dc9418562c79e20657925f186180967e0f423edc55570a558952f043ead2e` |
| VISUAL VERDICT | RETOUCH — Mac 실기 재확인 필요 |
| NEXT PASS | 동일 Mac에서 빠른 이동·전투 시 필터 경계와 FPS 비교 |

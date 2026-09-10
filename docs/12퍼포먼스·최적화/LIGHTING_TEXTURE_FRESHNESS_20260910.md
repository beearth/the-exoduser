# 조명·블룸 GPU 잔상 수정 (2026-09-10)

사용자 제보: 지옥강타 같은 기술 사용 뒤 이상 광원이 남고 새로고침하면 사라짐. 제공 로그는 Windows Chrome / WebGL2 / ANGLE AMD Radeon RX 9070 XT / D3D11이며 WebGPU는 기본 비활성화 상태다.

## 확인한 원인과 수정

`_renderLighting`과 `_renderBloom`은 기존 캔버스 픽셀을 다시 그리지만 `_glVer`를 갱신하지 않았다. WebGL2의 `_getTex`·`_uploadCanvasTex`, WebGPU의 `_getTex`는 이 버전으로 재업로드를 결정하므로 최초 업로드한 조명·블룸 픽셀을 계속 사용했다. CPU에서 효과가 이동하거나 사라져도 GPU 텍스처에는 남는 결함을 재현했다.

| 캔버스 | 용도 / 해상도 | 현재 갱신 계약 | 호출 주기 |
|---|---|---|---|
| `_lightCvs` | 어둠과 광원 홀 / `~~(C.width/2)` × `~~(C.height/2)` | `_renderLighting`의 어둠 재작성 후 `_glVer=(_glVer||0)+1` | `_gameFrame%3===0`, lighting 활성 및 quality가 low가 아닐 때 |
| `_litColCvs` | 컬러 광원 / `_lightW` × `_lightH` | 컬러 재작성 후 `_glVer=(_glVer||0)+1`; 광원 0개여도 clear 결과 업로드 | 위와 동일 |
| `_bloomCvs` | 블룸 / `~~(C.width/6)` × `~~(C.height/6)` | `_renderBloom` 재작성 후, `X.drawImage` 이전에 `_glVer=(_glVer||0)+1` | `_hasGlow`가 참이고 `_gameFrame%3===1`, bloom 활성 및 quality가 low/mid가 아닐 때 |

`_hasGlow=G.bossAlive||_blCnt>0||(G.pets&&G.pets.iris&&!G._irisOff)`. 재작성 사이에는 기존 텍스처를 재사용하고 추가 업로드하지 않는다. 같은 크기 재작성 시 GPU 텍스처 할당을 재사용한다. 기존 map 텍스처 수명 관리와 ATMOS 픽셀키 정책은 유지한다.

| 유지하는 시각 수치 | 값 |
|---|---|
| 컬러 합성 | `LIT_COL_MIX=.62`, 광원별 `cl.a*.85` |
| 플레이어 등불 | `LIT_PLAYER_R=470`, `LIT_PLAYER_A=.86`, `_CENTER_GLOW=false` |
| fireZone | 프리셋 7; 반경 `_fz.r*2.6`, 세기 `.68+sin(_gameFrame*.13+_fzL)*.10` |
| 블룸 | multiply `rgb(60,60,60)`, 대각 자기복사 `(-2,-2)`·`(2,2)` 각 alpha `.18`, 합성 일반 `.08` / 보스 `.15` |

## 검증

| 검증 | 수정 전 | 수정 후 |
|---|---|---|
| `test/lightingTextureFreshness.test.js` | WebGL2/WebGPU × 어둠·색광·블룸 6개 실패: CPU 픽셀 변화가 GPU 캐시에 미반영 | 6개 PASS: 이동, 소멸, 블룸 교체, 동일 크기 할당 재사용, 미갱신 프레임 업로드 억제 |
| `test/webglDynamicTexReuse.test.js` | 기존 회귀 | 3개 PASS: 비-map 재사용, map deferred-delete, ATMOS 변경시에만 버전 갱신 |
| `test/lightingTextureFreshness.browser.html` | 실제 Chrome RX 9070 XT WebGL2에서 3개 버전 증가문만 제거한 비교군 모두 stale pixels 재현 | 어둠·색광·블룸 모두 PASS; framebuffer `readPixels`가 새로 업로드한 기준 텍스처와 일치 |

실행: `& 'C:\nvm4w\nodejs\node.exe' --test test/lightingTextureFreshness.test.js test/webglDynamicTexReuse.test.js`. 실제 GPU 검증은 `server.cjs` 실행 후 `http://localhost:3333/test/lightingTextureFreshness.browser.html`에서 자동 수행한다. 테스트 페이지는 게임의 조명 렌더 함수와 텍스처 업로드 함수를 추출해 실행하며 게임 세이브에 접근하지 않는다.

검증 범위는 조명·블룸 렌더와 GPU 캐시다. 사용자 세이브의 지옥강타 전투 시퀀스 전체 재현은 하지 않았다. `content.js`의 `Untrusted event` 반복 및 Three.js 중복 import 경고는 이 결함의 원인으로 확인되지 않았으며 이번 수정 대상이 아니다. 기존에 열린 게임에는 새 코드 로드를 위한 새로고침 1회가 필요하다.

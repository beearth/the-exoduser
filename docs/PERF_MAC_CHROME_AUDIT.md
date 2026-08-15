# Mac Chrome 프레임 드롭 진단 리포트

> **감사일**: 2026-06-09
> **대상**: `G:\hell\game.html`
> **Mac 환경 차이**: Retina DPR=2, ProMotion 120Hz rAF, ANGLE Metal 백엔드

---

## [1] DPR 검사 — 캔버스 백버퍼 크기

| 라인번호 | 현재 코드 | 맥에서 문제되는 이유 | 위험도 |
|---|---|---|---|
| L3781-3785 | `_dpr=window.devicePixelRatio\|\|1;` ... `rw=(~~(innerWidth*_dpr*_rsf))&~1` | Mac Retina DPR=2 → 백버퍼 4배 (예: 2560x1600 CSS → 5120x3200 물리). **데스크톱 DPR 상한 없음** — 모바일만 `_MOBILE_DPR_CAP=1.5` 적용. `resScale=100%`일 때 Mac 15인치는 ~16M 픽셀 백버퍼. WebGL drawElements + 매 프레임 clearColor가 16M 픽셀 대상. | **HIGH** |
| L51097 | `_b3r.setPixelRatio(Math.min(window.devicePixelRatio,2));` | 보스 3D 렌더러 — DPR=2 그대로. `setSize(innerWidth, innerHeight)` + pixelRatio=2 → 풀스크린 3D 씬이 4배 해상도로 렌더됨. | **MID** |
| L51296 | `R.setPixelRatio(Math.min(devicePixelRatio,2));` | 상자 3D 렌더러 — SZ=140 고정이므로 280x280. 무시 가능. | LOW |
| L7168-7171 | `cv.width=W;cv.height=H;` (fogGL Three.js) | 안개 Three.js 캔버스가 CSS 픽셀 크기 (`innerWidth/Height`)로 설정. DPR 미적용이라 **이건 오히려 좋음**. 하지만 5-octave FBM 셰이더가 매 프레임 전체 화면에 실행됨. | MID |
| L51580-51584 | `_v3cvs.width=w;_v3cvs.height=h;` (vfx3d) | `gameCanvas.width` = 물리 픽셀(DPR 적용)을 그대로 사용. DPR=2에서 4배 해상도. | MID |

**요약**: 데스크톱 DPR 캡이 없어서 Mac Retina에서 메인 캔버스 + 보스 3D + VFX 3D가 모두 4배 해상도로 동작. `OPT.resScale`로 줄일 수 있지만 기본값 100%.

---

## [2] 120Hz rAF 검사 — 프레임타임 가정

| 라인번호 | 현재 코드 | 맥에서 문제되는 이유 | 위험도 |
|---|---|---|---|
| L48581 | `const PHYS_STEP=1000/60;` | **정상** — Glenn Fiedler fixed timestep 패턴. 물리는 항상 60Hz 고정. rAF 120Hz면 2프레임에 1번 update, 나머지는 보간 렌더만. **이건 올바른 구현.** | OK |
| L48795 | `while(_acc>=PHYS_STEP){update();_acc-=PHYS_STEP;}` | **정상** — accumulator 기반이라 120Hz에서 매 2프레임마다 1 update. 과속 없음. | OK |
| L48760 | `const _accCap=IS_MOBILE?PHYS_STEP*2:(_prof.u<=8?PHYS_STEP*5:PHYS_STEP*3);` | 비모바일에서 최대 5틱 catch-up. 120Hz에서는 보통 0~1틱이므로 문제 없음. | OK |
| L7228 | `_fogGLTime+=0.016;` | **하드코딩 16ms**. 120Hz에서 매 프레임 호출되면 시간이 2배 속도로 흐름 (안개 애니메이션 가속). 시각적 문제만 있고 성능에는 무관. | LOW |
| L16477 | `var dt=0.016;` | 보스 스켈레탈 포즈 보간용. 매 draw에서 호출. 120Hz면 보간이 2배 빠름 (미세한 시각 차이). | LOW |
| L49714 | `_cutSkipHold+=16.67;` | 컷씬 스킵 홀드. 120Hz면 스킵이 2배 빨리 됨. 사소함. | LOW |
| L48737 | `if(_elapsed<_fpsCapInterval-1){requestAnimationFrame(loop);return}` | FPS 캡이 있으면 동작. 하지만 **기본값 fpsCap=0** (무제한). Mac ProMotion에서 120fps로 돌면 렌더 비용 2배. | **HIGH** |
| L36155 | `~~(_cDelay*16.67)` | setTimeout ms 계산. 프레임 기반 딜레이를 ms로 환산. 문제 없음. | OK |

**요약**: 물리 루프는 올바르게 fixed timestep. **그러나** `fpsCap=0` 기본값이라 120Hz Mac에서 렌더가 120fps로 실행됨 — DPR=2와 결합시 초당 16M*120 = 1.92G 픽셀 처리. 안개 시간은 하드코딩으로 2배 가속.

---

## [3] GPU 동기 스톨 검사

| 라인번호 | 현재 코드 | 맥에서 문제되는 이유 | 위험도 |
|---|---|---|---|
| L3724 | `gl.bufferSubData(gl.ARRAY_BUFFER,0,buf,0,cnt*STRIDE);` | 인스턴싱 flush — 매 프레임 적 렌더 시. Metal에서 bufferSubData는 implicit sync 유발 가능하지만, WebGL2 + dynamic hint이면 드라이버가 더블버퍼링 처리. 보통 OK. | LOW |
| L4530 | `GL.bufferSubData(GL.ARRAY_BUFFER,0,_buf.subarray(0,_qCnt*4*_FPV));` | 메인 배처 flush — **프레임당 다수 호출** (setTex/setBlend마다 flush). `_buf.subarray()` 호출 자체는 뷰만 생성. Metal에서 빈번한 bufferSubData는 fence stall 가능. | MID |
| L4619-4620 | `gl.bufferSubData(gl.ARRAY_BUFFER,0,sub);` (x2) | Burst 파티클 Transform Feedback — 입력 버퍼 2개에 매 프레임 업로드. | LOW |
| L43347 | `if(_useGL&&GL){_flush();GL.flush()}` | **게임 루프 내 명시적 `GL.flush()`**. Metal 백엔드에서 flush()는 커맨드 버퍼 제출 + GPU 동기 대기를 유발할 수 있음. "GPU 백로그 미리 제출" 목적이지만 오히려 파이프라인 스톨 원인. | **HIGH** |
| L8637,8651 등 | `cx.getImageData(0,0,c.width,c.height)` | **초기화 시점에만** 호출 (스프라이트 가공). 게임 루프 밖. | OK |
| L13610 | `_iceTintX.drawImage(mainX.canvas,cx,cy,cw,ch,0,0,cw,ch)` | 빙결 몬스터 틴트 — **매 프레임 메인 캔버스에서 영역 복사**. `readback`은 아니지만 GPU→GPU 복사. Metal에서 다른 컨텍스트 간 캔버스 복사는 implicit sync. | MID |
| L34615 | `// getImageData 제거 — GPU stall 방지` (주석) | 사망 리플레이 캡처에서 getImageData 이미 제거됨. **좋은 최적화 완료**. | OK |

**요약**: `GL.flush()` 명시 호출이 게임 루프 중간에 있음. Metal 백엔드에서 이것은 커맨드 버퍼 강제 제출로 파이프라인 버블 유발.

---

## [4] Canvas2D 합성 비용 검사

| 라인번호 | 현재 코드 | 맥에서 문제되는 이유 | 위험도 |
|---|---|---|---|
| L41868-41885 | 보스레이저 `shadowBlur=16/8/4/2` x4레이어 + `globalCompositeOperation='lighter'` | 보스 레이저 렌더 시 **shadowBlur 4단계 + lighter 합성 4번**. Canvas2D shadowBlur는 Mac에서 CPU 가우시안 블러로 폴백됨. `_skipShadow` 보호가 GL 모드에서는 **동작 안 함** (L4796-4801: Canvas2D 전용). GL 모드에서도 ProxyX의 shadowBlur setter는 no-op (L4670)이므로 **GL 모드에서는 안전**. Canvas2D 폴백 시에만 위험. | MID |
| L43248-43302 | VFX 렌더: `globalCompositeOperation='lighter'` 다수 | lighter 합성이 프레임당 10~30회 토글. 각 토글마다 GL flush. | MID |
| L45606 | `X.filter='hue-rotate(200deg) saturate(1.4)';` | **Canvas2D filter를 게임 루프 내에서 설정**. Mac Chrome에서 Canvas2D filter는 매우 무거움 — CPU 래스터 폴백. 빙결 오브 형성 시에만 발생하지만 다수 동시 가능. | **HIGH** |
| L44055-44056 | `C.style.filter='contrast(1.05) brightness(.97*brVal)'` | CSS filter on canvas — GPU 합성 레이어. 매 프레임 문자열 비교만 하고, 값이 같으면 갱신 안 함. 비용은 CSS 합성기가 부담. DPR=2에서 합성 비용 증가. | MID |
| L3836-3845 | `bx.globalCompositeOperation='multiply'` + `X.globalCompositeOperation='lighter'` | 블룸 효과 — multiply + lighter 합성. 오프스크린 캔버스에서 처리 후 메인에 합성. | LOW |
| L3967-3977 | `lx.globalCompositeOperation='destination-out'` | 라이트맵 — destination-out으로 구멍 뚫기. 별도 캔버스. | LOW |
| L15977-15987 | `X.globalCompositeOperation='destination-out'` x2 | 메인 캔버스에서 destination-out. 프레임당 2회. | LOW |
| L13217-13430 | `ctx.globalCompositeOperation='lighter'` x5 | VFX 서브시스템 (히트/일렉/버스트/다크/라이트닝) — 각각 lighter 합성. | LOW |

**요약**: `X.filter` 런타임 설정이 가장 위험. shadowBlur는 GL 모드에서 ProxyX가 no-op 처리하므로 안전하나, Canvas2D 폴백 시 위험. lighter 합성은 빈도가 높지만 개별 비용은 낮음.

---

## [5] 컨텍스트 생성 옵션 검사

| 라인번호 | 현재 코드 | 맥에서 문제되는 이유 | 위험도 |
|---|---|---|---|
| L4470 | `GL=C.getContext('webgl2',{alpha:false, premultipliedAlpha:false, powerPreference:'high-performance', antialias:false, preserveDrawingBuffer:true})` | **`preserveDrawingBuffer:true`** — Metal 백엔드에서 매 프레임 백버퍼 복사 유발. Chrome ANGLE Metal은 이 옵션이 있으면 프레임마다 resolve용 복사본을 만듦. DPR=2에서 16M 픽셀 복사. **제거하면 성능 향상 가능하지만 스크린샷/사망리플레이 기능에 영향.** | **HIGH** |
| L3652 | `gl=cvs.getContext('webgl2',{alpha:true, premultipliedAlpha:true, antialias:false, depth:false, stencil:false})` | 인스턴싱 보조 GL — `alpha:true`는 합성 비용 추가하지만 인스턴싱이라 OK. | LOW |
| L4573 | `gl=cvs.getContext('webgl2',{alpha:true, premultipliedAlpha:true, antialias:false, depth:false, stencil:false})` | Burst GL — alpha:true이지만 별도 캔버스. | LOW |
| L7170 | `new THREE.WebGLRenderer({canvas:cv, alpha:true, premultipliedAlpha:false, antialias:false})` | 안개 Three.js — `powerPreference` 미지정. Mac에서 통합 GPU(인텔/M시리즈)로 기본 할당될 수 있음. 하지만 M시리즈는 GPU가 하나뿐이라 사실상 영향 없음. | LOW |
| L4292 | `navigator.gpu.requestAdapter(_isWin?{}:{powerPreference:'high-performance'})` | WebGPU — Mac에서 `powerPreference:'high-performance'` 정상 적용. | OK |
| L4458 | `X=CT.getContext('2d')` | Canvas2D — `willReadFrequently` 미지정. 초기화 후 `getImageData` 호출 없으므로 OK. | OK |

**요약**: 메인 WebGL2의 `preserveDrawingBuffer:true`가 가장 큰 문제. Metal 백엔드에서 매 프레임 풀 해상도 백버퍼 복사.

---

## [6] 텍스처/배칭 검사

| 라인번호 | 현재 코드 | 맥에서 문제되는 이유 | 위험도 |
|---|---|---|---|
| L4527-4532 | `_flush` — `useProgram` + `bindVAO` + `bufferSubData` + `bindTexture` + `drawElements` | 매 flush마다 5개 GL 호출. _setTex마다 flush 발생 → 텍스처 전환 횟수 = flush 횟수. 500마리 난전 시 draw call 수백개 예상. | MID |
| L4534 | `_setTex=function(t){if(t!==_curTex){_flush();_curTex=t}}` | 텍스처 변경 시 즉시 flush — 배칭 단절. 아틀라스 사용으로 완화되지만 오프스크린 캔버스 텍스처(맵 청크 등)는 각각 별도 텍스처. | MID |
| L4513-4524 | `_getTex` — CLAMP_TO_EDGE, NEAREST/LINEAR, **mipmap 없음** | `texParameteri(TEXTURE_MIN_FILTER, NEAREST/LINEAR)` — mipmap 미생성. NPOT 텍스처 + mipmap 없음이면 문제없음 (WebGL2에서 NPOT 텍스처 자체가 허용됨). | OK |
| L48654-48659 | drawCalls/useProgram/bindTexture 프로파일러 카운터 | 측정 인프라 존재. 실제 값은 장면에 따라 다름. | INFO |
| L20028-20030 | `GL.texImage2D(...)` 맵 청크 프리핀 | 맵 전환 시 텍스처 GPU 업로드. 초기화 시점. | OK |

**요약**: 배칭 시스템은 존재하나, 텍스처 전환마다 flush가 발생하는 구조. 대규모 전투에서 draw call 급증 가능. 이것은 모든 플랫폼 공통 이슈이며 Mac 특유는 아님.

---

## [7] 타이머/GC 검사

| 라인번호 | 현재 코드 | 맥에서 문제되는 이유 | 위험도 |
|---|---|---|---|
| L3397 | `_autoSaveTimer=setInterval(doAutoSave,30000)` | 30초 자동저장 — 게임 루프와 병렬. 저장 시 JSON 직렬화 + Supabase API 호출. **GC 스파이크 유발 가능**. | MID |
| L38760 | `setInterval(_updateDiagUI,1000)` | 진단 UI 1초 갱신 — DOM 업데이트. 사소함. | LOW |
| L50111 | `_loadTipIv=setInterval(...)` | 로딩 팁 3초 갱신 — 로딩 화면에서만. | OK |
| L50592 | `setInterval(()=>{if(window._btBoss...)},200)` | 보스 테스트베드 200ms — 테스트 전용. | OK |
| L50850,50879 | `setInterval(...)` | 테스트베드 전용. | OK |
| L51050 | `_btDpsInterval=setInterval(function(){...` | DPS 측정 — 테스트 전용. | OK |
| L11893 | `const item={id:Date.now()+Math.random(),...` | 아이템 ID 생성 — 드랍 시. 루프 외부 이벤트. Date.now() precision은 무관. | OK |
| L13613-13614 | `performance.now()` x2 in `_drawIceTint` | 게임 루프 내 `performance.now()` 호출 — 빙결 틴트 펄스 계산. 2회/프레임이라 무시 가능. | OK |
| L48730-48844 | 루프 내 `performance.now()` ~15회 | 프로파일링용. 프로덕션에서도 실행됨 (조건 가드 없이 일부). | LOW |
| L3601 | `this._fade=setInterval(...)` | BGM 페이드 — 일시적. | OK |
| L7994 | `_actxWatchdog=setInterval(...)` | AudioContext 워치독 — 사소함. | OK |
| L8245 | `setInterval(...)` (AudioContext 대기) | 초기화 시점. | OK |

**요약**: 게임 루프 내 `Date.now()` 직접 사용은 없음 (대부분 `performance.now()` 또는 `_now` 사용). `setInterval` 병렬 실행은 자동저장만 주의 대상.

---

## HIGH 우선순위 항목 종합

### 1순위: DPR 미제한 + 120fps 무제한 조합 (L3781-3785, L48737)
- **문제**: Mac Retina DPR=2에서 데스크톱 DPR 캡 없음. `fpsCap=0` 기본값이라 ProMotion 120Hz에서 120fps 렌더.
- **영향**: 초당 ~1.92G 픽셀 처리 (5120x3200 x 120fps). Windows DPR=1 대비 **8배** 렌더 부하.
- **해결 방향**: 데스크톱 DPR 상한 추가 (예: `_DESKTOP_DPR_CAP=1.5`) 또는 Mac 기본 `fpsCap=60` 설정. `OPT.resScale` 기본값을 DPR=2일 때 75%로 자동 조정하는 것도 고려.

### 2순위: preserveDrawingBuffer:true (L4470)
- **문제**: Metal ANGLE 백엔드에서 `preserveDrawingBuffer:true`는 매 프레임 백버퍼 전체 복사 유발.
- **영향**: DPR=2 기준 ~16M 픽셀의 GPU→GPU 복사가 매 프레임 발생. 이것만으로 ~2-4ms/frame 소모 가능.
- **해결 방향**: `preserveDrawingBuffer:false`로 변경하되, 스크린샷/사망리플레이 캡처 시에만 별도 처리 (예: `readPixels` 전에 한 프레임 다시 그리기, 또는 `toDataURL` 직전 draw 재실행).

### 3순위: 게임 루프 내 GL.flush() + Canvas2D X.filter (L43347, L45606)
- **문제 A**: `GL.flush()` — Metal 백엔드에서 커맨드 버퍼 강제 제출. GPU 파이프라인 버블 유발하여 병렬성 저하.
- **문제 B**: `X.filter='hue-rotate(200deg) saturate(1.4)'` — Canvas2D filter는 Mac Chrome에서 CPU 소프트웨어 래스터로 폴백. 빙결 오브 다수 동시 발생 시 심각한 CPU 스파이크.
- **해결 방향 A**: `GL.flush()` 제거. GPU는 `requestAnimationFrame` 끝에서 자동 flush됨.
- **해결 방향 B**: `X.filter` 대신 사전 렌더된 색조 변환 캔버스 사용, 또는 GL 셰이더로 hue-rotate 구현.

---

## 추가 발견사항 (MID)

- **보스 3D 렌더러** (`_b3r`): `setSize(innerWidth, innerHeight)` + `pixelRatio=2` → Mac에서 풀스크린 3D가 4배 해상도. `_b3resize()`에서 DPR 적용 안 하므로 실제는 CSS 크기. 하지만 `setPixelRatio(2)`로 인해 내부 렌더 타겟은 2배.
- **안개 셰이더 시간 가속**: `_fogGLTime+=0.016` 하드코딩 — 120fps에서 안개가 2배 빨리 움직임. 시각적 버그.
- **bufferSubData 빈번 호출**: 텍스처 전환마다 flush → bufferSubData. 프레임당 수십회. Metal의 implicit fence와 충돌 가능하나 현대 드라이버에서는 보통 ring buffer로 처리.
- **CSS filter on canvas**: `brightness()`가 매 프레임 비교/적용됨. GPU 합성 비용이 DPR=2에서 증가.

---

## 권장 조치 순서

1. **`resScale` 자동 조정**: `devicePixelRatio >= 2`이면 `OPT.resScale` 기본값을 `75` 또는 `50`으로 변경
2. **`fpsCap` Mac 기본값**: Mac 감지 후 기본 `fpsCap=60` 설정 (또는 UI에서 120fps 옵션 제공)
3. **`preserveDrawingBuffer:false`** 전환 + 스크린샷 시 별도 처리
4. **`GL.flush()` 제거** (L43347)
5. **`X.filter` 제거** — 빙결 오브 hue-rotate를 프리렌더 캔버스로 대체
6. **`_fogGLTime` 수정**: `+=0.016` → `+=actualDeltaTime` (또는 `_dtSp/60`)

---

## 인시던트: 맵 전환 시 WebGL context lost + 루프 크래시 스팸 (2026-08-15)

### 증상 (콘솔 로그, slot=119)
- 맵 로드 직후 첫 PERF 리포트에서 **`drawCalls:2775741`** (평소 7천~9천 대 → 약 300~400배 폭발).
- 직후 `WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost` (GPU 드라이버 리셋).
- context lost 구간 동안 `[LOOP CRASH] Cannot read properties of null (reading 'bindTexture')` 무한 반복.
- context restored 후 `GL_INVALID_OPERATION: glDrawElements: Insufficient buffer size` 1회.
- 사용자 관찰: **사망 리플레이가 "이상함"** (검은 프레임 섞임).

### 원인 사슬 (단일 root → 3증상)
| 단계 | 위치 | 내용 |
|---|---|---|
| **root** | 맵 전환 렌더 창 | drawCall 폭발(~277만) → GPU 컨텍스트 리셋. **미해결 (아래 TODO)** |
| 증상1 | `_uploadCanvasTex` (game.html ~L4906) | context lost 핸들러(L4787)가 `GL=null` + 형제 함수(`_flush/_setTex/_getTex/_setBlend/_glFlush/_clearFrame`) no-op 교체 시 **`_uploadCanvasTex`만 누락** → `GL.bindTexture` 직접 호출 → null crash. `fillText`/`drawImage` 경로에서 매 프레임 스팸. |
| 증상2 | `_drCapture` (game.html ~L35753) | 메인 캔버스 `C`를 `drawImage`로 복사 → context lost 구간엔 빈/검은 프레임이 리플레이 버퍼에 섞임. |

### 적용한 수정 (2026-08-15)
1. `_uploadCanvasTex`: `if(_useGPU)` 분기 직후 **`if(!_useGL||!GL)return;`** 가드 추가. restored 시 `_initWebGL`이 텍스처 자동 재업로드하므로 손실 없음.
2. `_drCapture`: 초입에 **`if(!_useGL&&!_useGPU)return;`** 가드 추가. context lost 구간 캡처 스킵 → 리플레이 검은 프레임 오염 차단.

두 수정 모두 방어 가드(no-op skip)로 로직 변경 없음. 컨텍스트 손실 시 **크래시 스팸 대신 프레임 정지 후 자동 복구**.

### 미해결 TODO (root cause)
- **맵 전환 프레임의 drawCall 폭발(~277만)**: 맵 캐시(`_tickBuildMapCache`, `_bmcDone`) 완성 전 렌더 창에서 무엇이 프레임당 ~92k 드로우콜을 내는지 미확정. 후보: (a) 맵 캐시 미완성 시 타일 단위 immediate 드로우 폴백, (b) 적 300+ 인스턴싱 버퍼 미준비 시 per-enemy 폴백, (c) restored 후 `Insufficient buffer size`로 보아 배처/인스턴싱 버퍼 용량 초과 flush 누락.
- **다음 단계**: 맵 전환 첫 30프레임 동안 drawCall 소스를 세분(맵/적/파티클/텍스트) 카운터로 분해 → 폴백 경로 특정 후 배칭/캐시-게이트 적용. 성능·다중경로 변경이므로 heavy 에이전트 위임 권장.

---

## 진단 계측 착수 (2026-08-15) — measurement-first, 아직 수정 없음

> root cause를 **추측으로 수정하지 않기 위해** drawCall 폭발을 subsystem/flush-사유 단위로 실측하는 게이트를 먼저 구현했다. production 기본 OFF, `?dcprof` URL 파라미터(또는 `localStorage.dcprof='1'`)로만 ON. 모든 훅이 `_DCP.on` 게이트라 정상 실행 성능/동작 무영향.

### 구현 위치 (game.html, 전부 `_DCP.on` 게이트)
| 항목 | 위치 | 기록 내용 |
|---|---|---|
| `_DCP` 계측 객체 | `_flush` 포인터 선언 직후 (`const _DCP={...}`) | on 판정, 프레임 카운터, 사유별 분포, subsystem 델타, runaway 캡처, restore 프로브 |
| WebGL2 `_flush` | 즉시모드 flush | `_onFlush(qc,true)` — drawElements 1회=dc 1, qc*4 vtxPeak/qc*6 idxPeak, **EBO 초과 감지**(`_qc*6>_idx.length`), restore 직후 `getError` 프로브 |
| WebGL2 `_setTex`/`_setBlend` | 텍스처/블렌드 전환 | `setTex++`/`setBlend++` + `reason='tex'\|'blend'` (다음 flush 사유 귀속) |
| `_quad` 버퍼풀 | `(_bufOff+_qCnt)>=_MQ` 분기 | `bufFull++` + `reason='buffull'` |
| WebGPU `_flush`/`_setTex`/`_setBlend` | deferred 커맨드 기록 | 동일 패턴 (cmds 1개=drawIndexed 1회=dc 1) |
| 인스턴싱 draw | 적(`_ensGLCount`/8dir) + VFX | `_onInst(cnt)` — drawArraysInstanced 1회=dc 1 |
| `draw()` 진입 | 함수 첫 줄 | `drawInvokes++` (프레임당 scene traversal 횟수 = **중복 traversal 감지**) |
| subsystem 마크 ×7 | 기존 `_snapPara/_snapTile/_snapMobj/_snapEns/_snapProj/_snapPart/_snapPost` 경계 | `_mark('bg'\|'map'\|'worldobj'\|'enemies'\|'projectiles'\|'particles'\|'post')` — 구간별 dc 델타 |
| loop 프레임 끝 | 최종 `_glFlush()` 직후 | `frame++`, `report()`(임계 초과 or 60프레임마다), `resetFrame()` |
| `buildMapCache` 진입 | 함수 첫 줄 | `markTransition()` — 전환 태그 + runaway 재무장 |
| context-lost/restored | GL 핸들러 | lost: 직전 dc 로그 / restored: `restoreProbe=600` getError 무장 + runaway 재무장 + `[DCPROF GLBUF]` VBO/EBO 크기 |

### 기록 필드
- **프레임별**: `dc`(총 drawCall), `flush`, `inst`, `setTex`, `setBlend`, `bufFull`, 사유분포 `{tex,blend,buffull,expl}`, `drawInvokes`, `transState`, subsystem별 dc(`sub={}`), `vtxPeak`/`idxPeak`.
- **runaway one-shot**(`dc>50000` 최초 초과 시 1회만, 전환마다 재무장): frame, drawInvokes, trans, stage/map, 사유, batch vtx/idx, subsystem 스냅샷, 짧은 stack.
- **restore 프로브**: drawElements count/type/offset, EBO idx 용량, VBO bytes, qCnt.

### 정적 분석으로 좁힌 범위
- **맵/배경/리플레이는 폭발원 아님**: 맵 캐시는 단일 `drawImage`(L42154/42157), 배경은 뷰포트 한정(L42047~), 리플레이 캡처는 `drawImage(C,…)` 캔버스 복사(L35767) — 어느 것도 scene를 재순회하지 않음.
- **2.7M drawCall ≈ 2.7M flush**: WebGL2 `_flush`는 1 flush=1 drawElements이며 텍스처/블렌드 전환·버퍼풀에서만 flush → 폭발은 (a) 텍스처 thrash로 flush 폭증, 또는 (b) 단일 프레임 내 scene traversal 중복. `_DCP.sub`/`reasons`/`drawInvokes`가 즉시 판별.
- **500마리 프로파일러(`_PERF_PROF`)는 전환 시 OFF**: `_alive>300` 게이트라 저-적군 맵 전환 프레임은 계측 공백 → 이 게이트가 그 공백을 메움.

### 독립 결함 후보 (root cause와 분리) — `Insufficient buffer size`
정적 근거로 **restore-path 독립 결함**을 특정:
- context-lost 핸들러(L~4873)가 `_flush/_setTex/_clearFrame`를 no-op로 교체하지만 **`_qCnt`/`_bufOff`를 리셋하지 않음**.
- ProxyX의 `fillRect`/`drawImage`→`_quad`(L5017~)는 `_useGL` 게이트 없이 **무조건** `_qCnt`를 증가. lost 구간엔 `_flush`(no-op)가 리셋 안 하므로 `_qCnt`가 **lost 전 구간 누적**(수만~수백만 가능).
- restore 후 첫 `_clearFrame`→real `_flush`가 stale 거대 `_qCnt`로 `drawElements(_qCnt*6,…)` 실행. **EBO 최대 인덱스=`_MQ*6`=393216**(계측 `[DCPROF GLBUF]`로 실측 확인) 초과 → **`glDrawElements: Insufficient buffer size`**.
- 즉 이 오류는 폭발의 **원인이 아니라, 어떤 원인이든 context-loss가 발생하면 터지는 하류(downstream) 별도 버그**. `_DCP` EBO-초과 가드 + restore getError 프로브가 런타임 확증 예정.
- (참고) `_idx=Uint16Array(_MQ*6)`, `_MQ=65536` → 인덱스값 `i*4`가 uint16(65535) 초과분 wrap. 단일 flush가 16384쿼드↑면 잘못된 정점 참조(용량초과는 아님). 정상 경로에선 `_quad`가 `_MQ`에서 flush하므로 count는 항상 EBO 용량 이하.

### 현재 Chrome 환경(SwiftShader headless) 검증
- 부팅 정상, `_useGL=true`(WebGL2 — 인시던트 오류문자열과 일치), `_DCP.on`은 `?dcprof`에서만 true.
- `[DCPROF GLBUF] VBO bytes=11534336 EBO idx=393216 maxDrawIdx=393216` — Insufficient-buffer 임계=393216 실측 확인.
- `markTransition`(`buildMapCache`) 정상 발화, dc 카운터 실측 증가 확인, **crash/regression 0**.
- 한계: headless는 `document.hidden=true`로 게임 루프가 프레임 유지 안 됨(게임 `if(document.hidden)return` 가드) → `G.on` 지속 게임플레이 미도달로 `[DCPROF f]` 프레임 리포트·전환 폭발 실측은 **실기 repro 필요**. 폭발은 Mac Metal 특유 조건이라 SwiftShader 재현도 기대 어려움.

### 실기(Mac Chrome) 캡처 방법 — 폭발 재현 시 실행
1. `game.html?dcprof` 로 실행(정식 빌드 그대로, 게이트만 ON).
2. 콘솔 열고 **문제의 맵 전환을 반복 수행**.
3. 아래 로그 수집:
   - `[DCPROF f…]` — 폭주 프레임의 `dc`/`sub`/`reasons`/`drawInvokes` (어느 subsystem·사유가 폭증했는지).
   - `[DCPROF RUNAWAY]` — 5만 최초 초과 지점의 subsystem·flush 사유·batch count·**stack**.
   - `[DCPROF EBO-OVERFLOW]` / `[DCPROF RESTORE-ERR]` — restore 직후 stale `_qCnt`·drawCount·EBO 용량 (독립 결함 확증).
   - `[DCPROF CTX-LOST]`/`[DCPROF CTX-RESTORED]` — 폭발→손실→복구 타임라인.
4. 이 로그가 나오면 root cause subsystem이 확정되고, 그때 **최소 수정**을 제시한다. (현재는 수정 없음.)

---

## 계측 성능 회귀 수정 (2026-08-15) — install-time gating

> b2790050 적용 후 로컬 인게임 FPS 하락 신고 → root-cause 조사 중단하고 **계측 자체의 성능 회귀**부터 처리.

### 원인
b2790050은 핫패스 함수 `_flush`/`_setTex`/`_setBlend`(배치당 수천 회/프레임 호출)의 본문을
직접 확장하고 `_DCP` 참조 + 무조건 `const _qc=_qCnt`를 넣었다. `_DCP.on` 게이트라 OFF 시
로직은 안 타지만, **함수 본문이 커져 V8 인라이닝/최적화 손실 위험**(실 GPU에선 프레임이
CPU-bound라 이 손실이 크게 체감). `_quad`(정점당 최핫)에도 버퍼풀 훅을 넣었다.

### 측정 (JS-isolated, GL 스텁 → 순수 JS 핫패스 비용, 동일 V8)
| 빌드 | flushJS ns/iter | quadJS ns/quad |
|---|---|---|
| 계측 이전(parent) | 53~88 | 12.7~21.3 |
| b2790050 OFF | 64~96 | 14~24 |
| **수정 후 OFF** | **56~87 (parent와 동일)** | **13~18 (parent와 동일)** |
| 수정 후 ON | 72~101 | 13~21 |
- SwiftShader 실 drawElements 포함 벤치는 GPU가 지배해 μs 단위 노이즈로 JS 차이 불가시 →
  GL no-op 스텁으로 순수 JS만 격리 측정. (headless document.hidden 루프는 성능 증거로 미사용.)

### 수정 내용 (install-time gating, game.html)
- `_initWebGL`/`_initWebGPU`: `_flush`/`_setTex`/`_setBlend`를 **계측 이전 원본 그대로 설치**하고,
  **`if(_DCP.on)`일 때만** 계측판으로 재할당. → dcprof OFF면 설치되는 함수가 원본과 **바이트 동일**,
  `_DCP` 참조/분기/`_qc` 전부 없음. (`_glFlush`/`_clearFrame`는 현재 `_flush` 바인딩을 호출하므로
  재정의 불필요.)
- `_quad`: 버퍼풀 훅 제거 → **원본 바이트 동일**. 버퍼풀 사유 귀속은 계측판 `_onFlush`에서
  `qc>=_MQ`로 판정(핫패스 무개입).
- draw() 진입/subsystem 마크 ×7/loop 리포트/인스턴싱 훅은 프레임당(또는 few/frame) 단일
  `if(_DCP.on)` 분기 — per-primitive 아님, 측정상 OFF 영향 0이라 유지.
- ON에서도 per-call allocation/string/stack 없음. stack은 runaway 최초 1회(`_capture`)만.

### 결과
- **OFF 핫패스 = 계측 이전과 동일**(측정 확인). b2790050의 계측은 그대로 유지(진단 기능 무손실).
- 회귀 원인이 계측 OFF 오버헤드였다면 이 수정으로 해소. (신고된 실기 하락이 dcprof ON 잔존/
  URL·localStorage 지속 때문이었다면, OFF 확인 + 이 구조로 확정 해소.)
- root-cause(2.7M) fix 및 restore-bug fix는 여전히 **미적용** — 별도 issue로 분리 유지.

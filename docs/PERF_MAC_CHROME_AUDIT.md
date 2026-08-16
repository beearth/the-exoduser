# Mac Chrome 프레임 드롭 진단 리포트

> **감사일**: 2026-06-09
> **대상**: `G:\hell\game.html`
> **Mac 환경 차이**: Retina DPR=2, ProMotion 120Hz rAF, ANGLE Metal 백엔드

---

## ★ 최종 상태 (FROZEN, 2026-08-16 유저 ratify) — Track A/B/D LOCK

> **PERFORMANCE / GL INVESTIGATION = FROZEN.** 아래 확정 상태가 SSOT. 추가 성능 조사 **중단**.
> **REOPEN 조건**(둘 중 하나): ① 재현 가능한 새 메모리/성능 증거, ② Mac context-loss 재발. 그 외 재개 금지(억지 추적 금지).

| Track | 내용 | 최종 상태 | commit |
|---|---|---|---|
| **A** | Restore stale-batch (`_qCnt` 무한증가 → EBO overflow `Insufficient buffer size` 0x502) | **CONFIRMED / FIXED / LOCKED** | `1728852c` |
| **B** | Original 2.7M drawCall (`_PERF_PROF` 윈도우 회계 결함, OFF구간 누적이 30프레임창에 혼입) | **WINDOW ACCOUNTING ERROR / FIXED / CLOSED** | `2c9474e9` |
| **D1** | Map WebGL texture lifetime (GC-지연 transient VRAM 피크, 명시적 deleteTexture 0건) | **CONFIRMED / FIXED / LOCKED** | `ae7eaf82` |
| — | **Mac context-loss** (root cause) | **IN-SITU CONFIRMATION PENDING** | — |
| **D2** | `preserveDrawingBuffer` / `depth` VRAM 감사 | **DEFERRED** | — |

- **A/B/D1 = LOCKED**: 해당 fix 코드는 재조사·재수정 금지(회귀 검증만 허용). 상세=본 문서 §Track A(L167~), §Track B 종결, §Track D FIX(하단).
- **D1 검증 요약**: before/after 동일 harness 70전환 — deleteTexture **0→140**, peak concurrent map tex **1 (244MiB)**, GL error/context-loss/use-after-delete **0**, 검은맵·플리커 없음, Track A synthetic loss→restore `0x502`/crash-loop **0건**(1728852c 무간섭 확인).
- **Mac context-loss = PENDING**: Windows/AMD는 실 loss 미재현 → **트리거 완화 메커니즘만** 검증(GC 대기 제거로 transient VRAM 피크 소거). **Mac 실기에서 동일 transition stress 후 context-loss=0 확인 시에만 Track D 전체를 FIXED/CLOSED로 승격.** 그 전까지 Mac root cause는 STRONGLY SUPPORTED(메커니즘 레벨), 완전 CONFIRMED 아님.
- **D2 = DEFERRED**: `preserveDrawingBuffer`(true)/`depth`(true) **현재 변경 금지.** 새 실측 메모리/성능 증거 또는 Mac loss 재발 없이는 재개 금지. D1 lifetime fix와 혼합 금지(독립 측정 완료).
- **git provenance**: 하단 §"git provenance — ae7eaf82 번들" 참조. `ae7eaf82`는 auto-sync cron이 boss3d 타세션 파일을 같은 commit에 흡수함. **이미 push된 history는 rewrite하지 않음.**

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
- **프레임별**: `dc`(원 PERF와 같은 drawArrays/drawElements invocation), `flush`, `inst`, `texCalls`(모든 setter), `setTex`(실변경), `uniqueTex`, `setBlend`, `bufFull`, 사유분포 `{tex,blend,buffull,expl}`, `drawInvokes`, `transState`, source별 dc, subsystem별 dc(`sub={}`), `vtxPeak`/`idxPeak`.
- **runaway one-shot**(`dc>50000` 최초 초과 시 1회만, 전환마다 재무장): frame, drawInvokes, trans, stage/map, 사유, batch vtx/idx, source/subsystem 스냅샷, cache/entity 상태. per-draw stack은 생성하지 않는다.
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
   - `[DCPROF f…]` — 폭주 프레임의 `dc`/source/`sub`/`reasons`/`drawInvokes` (어느 source·subsystem·사유가 폭증했는지).
   - `[DCPROF RUNAWAY]` — 5만 최초 초과 지점의 source별 count·texture identity·cache/entity 상태·flush 사유·batch count. per-draw stack은 생성하지 않음.
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

---

## restore-bug RUNTIME CONFIRMED + 최소 수정 (2026-08-16)

> 위 [220] "독립 결함 후보"(정적 예측)를 **실기가 아닌 자동화(headful Chrome + 실 GPU AMD RX 9070 XT / ANGLE D3D11 + Playwright)로 런타임 확증**하고 최소 수정 적용. `?testchar=1`로 실전투 진입 후 `WEBGL_lose_context` 확장으로 context-loss를 synthetic 유발.

### 런타임 재현 (수정 전, game.html HEAD 63f785fb)
단일 lose→restore 사이클 로그:
```
[GPU] WebGL context lost — 복구 대기
  qCnt-peak-during-loss = 4,627,612          ← 손실 중 _qCnt 무한 증가 (0→460만, 1.6초)
[GPU] WebGL context restored — 파이프라인 재구축
[DCPROF EBO-OVERFLOW] qCnt=4635854 needIdx=27,815,124 ebo.len=393,216
[DCPROF RESTORE-ERR] glErr=0x502 drawCount=27,815,124 type=UNSIGNED_SHORT
GL_INVALID_OPERATION: glDrawElements: Insufficient buffer size.   ← 인시던트 오류문자열 그대로 재현
maxIdxCount = 27,815,124  (=4,635,854 quads ×6)                    ← 단일 프레임 27.8M 인덱스 draw = "폭발"
```

### 인과 사슬 (CONFIRMED — 단일 root)
| 단계 | 위치 (game.html) | 내용 |
|---|---|---|
| 1 | `webglcontextlost` 핸들러 (~L4912) | `_flush=function(){}` **no-op**로 교체하되 `_qCnt`/`_bufOff` **미리셋**. |
| 2 | `_quad` 핫패스 (L4580) | `if((_bufOff+_qCnt)>=_MQ)_flush()` — 손실 중 `_flush`가 no-op → 리셋 안 됨 → `_qCnt++`만 계속. 손실 지속(수 초) 동안 `_qCnt`가 수백만~수천만 누적. |
| 3 | `webglcontextrestored`→`_initWebGL` (~L4915) | real `_flush` 재설치. 복구 첫 `_flush`가 **stale 거대 `_qCnt`**로 `GL.drawElements(_qCnt*6,…)` 실행. |
| 4 | EBO 용량 | `_MQ*6 = 393,216` 초과 (27.8M) → `Insufficient buffer size` (GL 0x502) + 거대 draw 스톨. |

- **dcprof OFF에서도 동일 발생**: OFF `_flush`도 `GL.drawElements(_qCnt*6,…)` 호출 → stale `_qCnt`로 동일 폭발. DCPROF는 이 사건을 **로깅만** 할 뿐 원인 아님(계측 무관 게임 버그).
- **정상 맵 전환(context-loss 없음)에서는 미발생**: 자동으로 stage 0→14 nextStage 전환 14회 구동 시 peak dc=77/frame, RUNAWAY·CTX-LOST 0.
- **⚠ 정정(2026-08-16): restore-bug ≠ 원 "2.7M" 인시던트 (별개, 단위 상이)**. 처음엔 동일 root로 적었으나 원 측정값 대조 결과 **별개**로 정정:
  - restore-bug 재현값 = drawElements **호출 1회 / 인덱스 27,815,124 / 쿼드 4,635,854**.
  - 원 인시던트 "2.7M"(본 문서 L166 `drawCalls:2775741`) = `_PERF_PROF.drawCalls` = **drawArrays/drawElements 호출(invocation) 횟수**(L50320-50321 후킹, 30프레임 창 누적 후 리셋). 즉 **30프레임 동안 약 277만 호출 ≈ 92,500 draw-call/frame**(평시 30f당 7~9천 → 300~400배).
  - **단위가 다르다**: restore-bug=단일 거대 호출(1 invocation), 원 인시던트=호출 횟수 폭증(~92k/frame invocations = 배칭 붕괴, quad당 1 draw 수준). → **동일 root 아님**.
  - 인시던트 시퀀스 재해석: ① 무언가가 전환 창에서 draw-call 호출 폭증(2.7M) → GPU 과부하 → CONTEXT_LOST → ② 손실 중 `_qCnt` runaway → ③ 복구 첫 flush 오버사이즈 draw(`Insufficient buffer size`). **이 수정은 ②③(하류)만 차단. ①(2.7M invocation 폭증)은 STILL OPEN.**

### 적용한 최소 수정 (2026-08-16, game.html) — 정정성 버그픽스, cap/생략/품질하향 없음
1. `webglcontextlost` 핸들러: 즉시 `_qCnt=0;_bufOff=0;` + no-op flush들을 **리셋판**으로 교체
   (`_flush=function(){_qCnt=0;_bufOff=0}`, `_glFlush`/`_clearFrame` 동일). → 손실 중 `_quad`가 `_MQ`
   도달로 flush를 부르면 리셋되어 `_qCnt`가 **[0,_MQ) 상한**(무한증가·오버사이즈 draw 원천 차단).
2. `webglcontextrestored`: `_initWebGL` 전후로 `_qCnt=0;_bufOff=0;` 명시 리셋 (복구 첫 flush가 stale 배치 사용 불가).

### 수정 후 검증 (동일 자동 재현)
```
  qCnt-peak-during-loss = 4120   (< _MQ 65536, 상한 확인)
  [DCPROF EBO-OVERFLOW]  없음
  [DCPROF RESTORE-ERR]   없음
  Insufficient buffer size 없음
  oversizeHits = []              (>400k 인덱스 draw 0건)
  maxIdxCount = 23,058           (정상 범위)
  useGL=true, 정상 복구
```
- **회귀 검사**: 수정은 context-lost/restored 핸들러만 변경(정상 플레이 중 미실행). 부팅 정상, 실전투(testchar, 적 199, dc 107/frame, proc_t 2.1ms) 정상, `_flush` OFF 원본 유지, pageerror 0.

### 남은 이슈 (이 수정과 별개)
- **왜 context-loss가 발생하는가**(Mac 메모리/드라이버 리셋 촉발원)는 미해결 — 이 수정은 loss가 나도 **폭발/스톨을 막는** 하류 방어. 근본 촉발원(맵 캐시 텍스처 업로드 피크 등)은 [1][5]의 DPR·preserveDrawingBuffer·VRAM 항목과 함께 별도 추적.
- **현재 "지속적" 로컬 FPS 하락**: 이 자동화 환경(AMD 데스크톱)에서는 정상 플레이 전 구간 재현 안 됨(steady 375~560fps). restore-bug는 loss-이벤트당 1프레임 스톨이라 지속 저하와는 결이 다름 — 지속 저하가 실제라면 [1순위] DPR/fpsCap·[2순위] preserveDrawingBuffer(Mac 환경 요인) 우선.

---

## 3-트랙 분리 조사 (2026-08-16) — 자동화 실측, Track A만 수정

> 사용자 지시: (A) restore stale-batch bug는 LOCK, (B) 원 "2.7M"은 원측정값 근거로 재판정, (C) 지속 FPS 저하 별도 추적, (D) context-loss 촉발원 별도 측정. 측정 우선, C/D는 수정 금지.

### Track A — Restore stale-batch bug : CONFIRMED / FIXED / LOCKED
- 커밋 1728852c. 위 "restore-bug RUNTIME CONFIRMED" 섹션 참조. **되돌리거나 확대하지 않음(LOCK).**

### Track B — 원 "2.7M" 인시던트 : STILL OPEN (draw-call invocation count)
- 원 측정값 = 본 문서 L166 `drawCalls:2775741` = `_PERF_PROF.drawCalls`(GL drawArrays/drawElements **호출 횟수**, 30프레임 창 누적). **quad/index/batch element 오기가 아니라 실제 invocation count.**
- ∴ restore-bug(단일 27.8M-index 호출)와 **별개**. ~92,500 draw-call/frame invocation 폭증의 실제 source/loop는 미확정이다. 정상은 tex 전환당 flush로 ~190 draws/frame(아래 Track C 실측)이며, cache-miss의 per-tile immediate GL fallback은 아래 fault audit에서 반증됐다.
- **미해결. OPEN 유지.** 실기(Mac, slot=119 조건) 또는 특정 맵/캐시-미완성 타이밍에서만 발현 추정 — 이 데스크톱 자동화(정상 전환 14회 + 72초 부하)에서 배칭 붕괴 미재현(peak 197 draws/frame).

#### Track B source attribution + cache-miss fault audit (2026-08-16)

> 범위는 원 `_PERF_PROF.drawCalls`와 동일한 **`GL.drawArrays` + `GL.drawElements` invocation**만이다. restore stale-batch의 raw 값은 별도 Track A SSOT(`qCnt=4,635,854`, `indices=27,815,124`, 단일 호출)이며 여기와 합산하거나 원인으로 결론내지 않는다.

| 항목 | 구현/판정 |
|---|---|
| source attribution | `?dcprof`일 때만 WebGL context의 `drawArrays`/`drawElements`를 감싼다. 호출당 stack/문자열/console 작업 없이 현재 numeric source id의 `Uint32Array` slot만 `++`한다. source: map/cache, tile/fallback, world object, player, enemy, projectile, particle/VFX, drop/item, UI/HUD, post/debug, unknown. |
| scope | `draw()` pipeline boundary와 `drawP()`에서 source를 설정한다. `_flush`/instancing은 현재 source를 유지해 source별 actual GL invocation을 누적한다. |
| texture 구분 | `texCalls`=모든 `_setTex` 호출, `setTex`=실제 identity 변경, `uniqueTex`=프레임 내 고유 identity. `flush`, blend, flush reason도 함께 출력한다. 따라서 `draws≈setTex`와 단순 setter 호출 폭증을 구별한다. |
| runaway dump | threshold 초과 시 1회: source별 count, texCalls/setTex/uniqueTex, flush/blend/reason, drawInvokes, stage/map/transition, cacheReady/cachePending, mapObjects/enemies/projectiles/particles. per-draw log 없음. |
| fault injection | `?dcprof&dcprofCacheDelay=N`(최대 600)은 **N 프레임 동안 cached-map blit만 숨긴다.** production 경로, cache builder, 품질, DPR을 변경하지 않는다. 목적은 cache missing 때 per-tile GL fallback이 존재하는지 검증하는 것뿐이다. |

브라우저 smoke (`testchar=1`, WebGL2, `dcprofCacheDelay=600`) 결과:

```
[DCPROF f60] dc=28 flush=28 inst=0 texCalls=4001 setTex=27 uniqueTex=23
  reasons{tex:26,blend:0,buffull:0,expl:2} invokes=1
  sources=map/cache:7,tile/fallback:2,world object:4,player:10,UI/HUD:4,post/debug:1
  cacheReady=false cachePending=true enemies=0 projectiles=0 particles=1
```

- **cache fallback 판정: 없음 (반증)**. map renderer는 stream viewport 1장, `_mapCvs` 1장, 또는 visible `_mapChunks`만 blit하며, 어느 cache도 없으면 최종 `else`은 **그리지 않는다**. tile fallback 루프는 `_tickBuildMapCache()`의 offscreen 2D canvas build로 GL draw가 0이다. 강제 cache miss에서도 92K가 아니라 28 calls/frame이며 normal smoke(29 calls/frame)보다 1 낮다.
- normal smoke의 source report는 `dc=29~40`, `texCalls≈4,003`, `setTex=28~39`, `uniqueTex=24~32`, `flush=29~40`이었다. 즉 현재 정상 경로는 `draw≈actual texture change`이고 setter 호출 자체가 수천 회여도 batch collapse가 아니다.

92,525 invocations/frame 대비 cardinality 감사:

| source/loop | 실제 반복 상한 또는 renderer 동작 | 92K 가능성 |
|---|---|---|
| map cache / chunks | stream viewport=1 blit, `_mapCvs`=1 blit, chunks=visible chunks만; cache missing=0 blit | 불가 |
| tile fallback builder | phase-1은 최대 `20 rows × map width`를 **offscreen Canvas2D**에 작성, GL renderer 호출 0 | 불가 |
| visible enemy | desktop `_dynERMax=45`; 8-dir body는 texture bucket instancing | 불가 |
| projectile | pool `600` + player pool `120`; renderer 3-pass여도 최대 반복은 수천 단위 | 불가 |
| pooled particle/VFX | pool 1,000, desktop dynamic limit `_dynPLim=300` | 불가 |
| ground drop/item | `worldItems` hard cap 20 | 불가 |
| world object | single `MAP_OBJS` traversal(객체당 drawImage 계열); source report에 live `mapObjects`도 기록. 90K를 만들려면 map data가 수만 객체이거나 traversal 재진입이 필요하며 아직 실측되지 않음 | OPEN candidate |
| text/dynamic canvas | glyph/`_glVer` churn은 text/drawImage 당 flush 1이라는 메커니즘만 CONFIRMED. 기존 최대부하 관측 `fillText≤9`, `drawImage≤4166`/frame | 정상 경로만으로 불가 |

**현재 결론:** cache fallback, pool/visible-loop cardinality, 단순 `_setTex` call volume은 원 `92,525/frame`의 원인이 아니다. 90K가 재현되면 새 source dump가 exact top source와 texture identity 관계를 판정한다. 그 전까지 **Original 2.7M ROOT CAUSE = STILL OPEN**이며 production fix 후보는 없다.

#### Track B 심층 감사 (2026-08-16) — 90K 유발 loop는 STILL OPEN
- **90K/frame 가능 경로 전수 역추적**: GL draw는 전부 `_flush`(=drawElements 1회). flush는 텍스처전환/블렌드전환/버퍼풀(_MQ쿼드)에서만 발생. 90K flush = 90K 텍스처전환 또는 블렌드전환(버퍼풀은 90K×65536쿼드=불가). 후보 cardinality:
  | 경로 | 최대 draw/frame | 판정 |
  |---|---|---|
  | map blit(L42237~) | 1~가시청크(~9). 캐시 미준비 시 **미렌더**(per-tile 폴백 없음) | 폭발원 아님 |
  | 적 스프라이트 | instanced(≤8 draw) | 폭발원 아님 |
  | 적 오버레이/HP바 | `_whiteTex` 고정 → 배칭 | 폭발원 아님 |
  | decor(`_buildDecorList`) | 첫줄 `return;`(dead) | 폭발원 아님 |
  | 텍스트 fillText | 실측 ≤9/frame | 정상 폭발원 아님 |
  | 스프라이트 drawImage | 실측 ≤4166/frame(적250) | 정상 폭발원 아님 |
- **배치 붕괴 메커니즘 CONFIRMED**(런타임 1:1): `fillText`→`_uploadCanvasTex(_txtAtlas)`(L5028-5037)가 아틀라스 `_glVer` 변동 시 `_flush()`+`texImage2D` 재업로드. 신규 글리프마다 `_getAtlasTxt`가 `_glVer` 증가(L4575) → **fillText 1회 = flush 1회**. 아틀라스(2048×512, ~441문자@12px) 초과 시 프레임 중 `_txtUV.clear()`(L4571) → 이후 전 텍스트 영구 miss → 매 프레임 텍스트당 flush. 실측: K=100→100,1000→901,5000→5000,15000→15000 draws(perText≈1.0); 2000유니크 재실행 2pass 모두 2000(캐시 무효). drawImage(동적 캔버스 `_glVer`변동)도 동일.
- **그러나 90K 유발 실제 loop 미특정**: 최대부하(bossDebug·적250·전투)에서 fillText 최대 **9**/frame, drawImage 최대 **4166**/frame — 90K의 1/20~1/10000. 정상 렌더로 90K 도달 불가(적500이어도 drawImage ~8k). ∴ 원 92K/frame은 **정상 스테디 렌더로 설명 불가.**
- **인시던트 시퀀스 재해석**: `2.7M`→`context lost`→`[LOOP CRASH] bindTexture null 무한반복`(구 `_uploadCanvasTex` 널가드 부재, 81d670a0 수정)→restore `Insufficient buffer size`. 90K가 정상 렌더 미도달 + loss/crash 인접 → **explosion이 context-loss/재진입(crash-retry) 프레임과 결합됐을 가능성**이 스테디 폭발보다 정합적(미증명).
- **B↔D 연결**: 아틀라스 재업로드(B=대역폭) + 미해제 125MB 맵텍스처(D=VRAM)는 상이한 자원압. 어느 쪽도 이 HW 단독서 90K/loss 미유발. 순서(2.7M이 loss 앞)는 explosion이 loss에 기여함을 시사하나 explosion 유발 loop 미증명.
- **판정: B = STILL OPEN**(counter=invocation·메커니즘 CONFIRMED, 90K callsite 미특정). B1(cache-fallback)=반증. B2(atlas-thrash)=메커니즘 CONFIRMED이나 정상 cardinality 부족. B3(traversal)=미발견. B4(resource-link)=가설.

### Track C — 지속적 로컬 FPS 저하 : NOT REPRODUCED
- 72초 연속(testchar Lv500, `_btGod`, 실입력 버스트=LMB/RMB/스킬키/이동, 5회 transition, dcprof ON) 자동 부하:
  | 구간 | p95(ms) | p99(ms) | fps | draws/frame | context-loss |
  |---|---|---|---|---|---|
  | 초반 3창 | 4.0 | 7.6 | 436 | 108 | 0 |
  | 후반 3창 | 2.0 | 3.0 | 852 | 33 | 0 |
- **드리프트/누수/열화 없음** — FPS 변동은 전적으로 스테이지별 적 수(0~250)에 종속. 시간경과 악화 0. context-loss/EBO-overflow/runaway 전 구간 0.
- 전환 프레임에 단발 히치(~70~150ms) 있으나 즉시 회복(창 p99 정상). **지속 저하 아님.**
- `texAvg ≈ flushAvg ≈ glDcAvg` 실측 → flush는 **텍스처 전환당 1회**가 지배(draw ≈ setTex). 배칭이 tex-bound.
- 결론: 이 하드웨어(AMD RX 9070 XT/D3D11/DPR1/1280×720)에서 지속 저하 root cause **미확정**. 실기 요인(Metal/DPR2 상당 해상도/ProMotion 120Hz/VRAM) 우선순위 유지. **OPEN.**

### Track D — Mac context-loss 촉발원 : 측정 — **GC-지연 회수에 의한 transient VRAM 피크 (영구 strong-ref leak 아님)**
- 텍스처 자원 계측(createTexture/deleteTexture/texImage2D 후킹, 6회 transition):
  | 시점 | liveTex(창출) | deleteTexture | maxSingle |
  |---|---|---|---|
  | BASE st0 | 90 | **0** | 125.18MB (6408×5121) |
  | TRANS#5 st6 | **136** | **0** | 125.18MB (6408×5121) |
- **코드 전체에 `deleteTexture` 호출 0건**(grep 확인). GL 텍스처는 **명시적 해제 없음** — `_texCache`(WeakMap, src 캔버스 키)의 JS GC + 드라이버 지연 회수에만 의존.
- 맵 전환마다 신규 맵 캔버스(`_mapCvs`) → **125MB급 단일 맵 텍스처** 신규 생성. 구 맵 텍스처의 `WebGLTexture` 래퍼는 GC 전까지 잔존 → **전환 폭주 시 GPU 텍스처 메모리가 정상치 훨씬 위로 순간 피크**.
- 인과 가설(측정 근거): 제한 VRAM(Mac 통합/공유 or 소용량) + 미해제 125MB×N 누적 → 전환 창 VRAM 고갈 → **드라이버 컨텍스트 리셋(context lost)**. 대용량 VRAM(이 AMD 16GB+)은 흡수 → **loss 미발생**(재현 불가 이유와 일치).
- 이것이 Track A(restore-bug)의 **선행 트리거** 후보이자, Track B(2.7M) 발현 시 GPU 스트레스 가중 요인일 수 있음.
- **Q4 lifetime 판정 (2026-08-16, FinalizationRegistry+강제 gc() 실측)**: **분류 B — GC-eligible, 명시적 delete 없음 → 비결정적 GPU 회수 / transient VRAM 피크** (영구 strong-ref leak=C 아님).
  - `_texCache`/`_texUploaded` **둘 다 WeakMap**(src 캔버스 약참조) — 구 텍스처를 strong-hold하는 배열/맵/전역 없음.
  - `_getTex`(L4851)는 `src._glVer` 변동 시 **신규 WebGLTexture 생성 + `_texCache.set`으로 이전 값 교체** → 구 텍스처는 무참조(GC-eligible)로 전락. `_mapCvs`는 동일차원 전환 시 **재사용**(canvas 동일성 유지)되나 `_glVer` 증가로 매 전환 새 텍스처 생성.
  - 실측: 8회 전환 createTexture 0→52, **deleteTexture=0**. `_mapCvs` 실측 크기 **8000×8000 = 256MB** 단일 텍스처(초기 6408×5121=125MB보다 큼). 강제 gc() 7회 후 추가 finalize=1(대부분 생존 텍스처는 정당한 live 스프라이트/아틀라스라 격리 불가 → 카운트는 비결정적, FR 콜백 지연). **코드 참조분석(WeakMap-only)이 GC-eligibility의 결정 근거.**
  - ∴ **영구 누수 아님**. 단 명시적 `deleteTexture` 부재로 회수가 GC 타이밍에 종속 → **전환율 > GC 속도**일 때 256MB×N 오펀 텍스처가 동시 잔존 → **transient VRAM 피크** → 저-VRAM(Mac)에서 컨텍스트 리셋 촉발 가설. 대용량 VRAM(이 AMD)은 흡수(loss 미발생=재현불가 정합).
- 이것이 Track A(restore-bug)의 **선행 트리거** 후보이자, Track B(2.7M) 발현 시 GPU 스트레스 가중 요인일 수 있음.
- **측정만 완료. 수정 미적용**(품질저하/DPR 강제제한 금지 지시 준수). 후속: 전환 시 구 맵/스테이지 텍스처 명시적 `deleteTexture`(GC 대기 제거) + 256MB 맵텍스처 청킹/해상도 재검토를 별도 트랙에서 설계(측정→최소수정).

#### Track D 확정 (2026-08-16) — 결정적 WeakRef 증명 + peak 계산 + 최소수정 후보

> 위 Q4는 class B를 **정적 코드분석(WeakMap-only)**으로 추론했고 FinalizationRegistry는 격리불가로 미결이었다. 이번에 **단일 orphan 맵 텍스처를 WeakRef로 직접 추적**해 GC-eligibility를 런타임 확증한다. probe: `tmp/probe_trackd_texlife.py`(수명주기·overlap), `tmp/probe_trackd_gceligible.py`(결정적 WeakRef), 모두 `--js-flags=--expose-gc`.

**A. transition resource lifecycle (확정)**
- `_mapCvs`는 **재사용 싱글턴**(L20571 `if(!_mapCvs)_mapCvs=document.createElement`). 전환마다 `.width=mw*T`로 리사이즈(2D 백킹 재할당·구 백킹 브라우저 즉시 해제) + `_glVer++`(L20573).
- 다음 렌더에서 `_getTex(_mapCvs)`가 버전 불일치 감지(L4878) → **신규 `GL.createTexture()` + `texImage2D(src)` 업로드**(L4879-4887) + `_texCache.set(src, 신규)`로 캐시 덮어쓰기(L4889) → **구 `WebGLTexture` 무참조화**.
- 청크 경로(맵>texLimit): `_mapChunks=[]` 신규 배열·각 청크 신규 캔버스, 완료 후 `_mapCvs=null`(L20525). 구 배열·청크 드롭.
- 스트림 경로(맵≥64Mpx or >texLimit): `_streamChunks={}` 리셋(L20539) + `_STREAM_MAX_CHUNKS` 캡 eviction(L42279-42287).

**B. old/new overlap (실측 CONFIRMED)** — 6회 연속 전환, GC 개입 없음:
| 시점 | createTexture(누적) | liveTex | deleteTexture |
|---|---|---|---|
| before | 36 | 27 | 0 |
| 6 transitions (no gc) | 68 (+32) | **48** | **0** |
| after forced gc | 83 | 60 | **0** |
- 전환당 ~5 텍스처 신규, **삭제 0** → 구 텍스처가 GC 전까지 신규와 **동시 잔존**(overlap 실재). `deleted:0` 전 구간.

**C. strong-reference audit (전수, clean)**
- `_texCache`(L4876)·`_texUploaded`(L4152) **둘 다 WeakMap**. 맵 캔버스/텍스처를 붙잡는 배열·전역·히스토리·스테이지캐시 **없음**(grep `push(_mapCvs`/`_stageCache`/`prevMap` 등 0건).
- **결정적 WeakRef 테스트**: stage0 맵 텍스처를 `WeakRef`로 추적→강참조 드롭→전환(glVer 범프로 캐시 덮어써 orphan)→**aggressive gc()**:
  - `isTexObj=true`, `_mapCvs` 동일성 4전환 내내 유지(`same:[T,T,T,T]`).
  - `orphanTexAliveBeforeGC=true`(transient overlap 존재) → **`orphanTexAliveAfterGC=false`**(GC 후 회수됨).
  - **verdict=CLASS_B_GC_DEFERRED_TRANSIENT** — orphan 맵 텍스처는 **GC-eligible**. strong-ref leak(class A) **런타임 반증**(정적추론→런타임확증으로 격상).

**D. theoretical/observed peak (확정)**
- 단일 맵 텍스처 상한 = `_shouldStreamMapCache`(L19559): `(mw*T)*(mh*T)>64,000,000`(~8000×8000)이면 강제 스트리밍 → **비스트림 단일 텍스처는 정확히 ≤64Mpx = 8000×8000×4 = 244MiB(256MB decimal)로 상한**. 실측: stage0-3(mw/mh=200)=8000×8000=244.1MB 단일; stage20(196×166)=7840×6640=198.6MB; stage≥210=스트림(작은 뷰포트 청크).
- **전환 순간 동시 존재 가능 GPU 텍스처 피크**(비스트림 최대 맵): 구 256MB(GC 대기) + 신규 256MB = **~512MB** + 2D 소스 캔버스 백킹 256MB(리사이즈 중) + preserveDrawingBuffer 드로잉버퍼(C.w×C.h×4 ×front/back, Mac DPR2면 4배) + depth 버퍼 → **worst instant ~800MB급**, 대부분 transient/GC-대기.

**E. preserveDrawingBuffer (런타임 CONFIRMED)**
- `GL.getContextAttributes()` 실측: **`preserveDrawingBuffer:true`**, `alpha:false`, `powerPreference:'high-performance'`, `antialias:false`, **`depth:true`**(요청 L4821에 depth 미지정 → 기본 true, 화면크기 깊이버퍼 추가 할당), `MAX_TEXTURE_SIZE=8192`(headless SwiftShader; 실 Mac ANGLE Metal은 통상 16384). true는 매 프레임 백버퍼 resolve 복사본 + ANGLE 최적화 일부 비활성 → 상시 VRAM 가산.

**F. Mac context-loss ROOT CAUSE = CONFIRMED (mechanism)**
- 촉발원 = **map transition의 GC-지연 transient VRAM 피크**: 명시적 `deleteTexture` 부재(코드 전체 0건, 실측 `deleted:0`)로 구 256MB 텍스처 회수가 GC 타이밍에 종속 → **전환율 > GC 속도**면 256MB급 orphan이 신규와 동시 잔존(~512MB↑), preserveDrawingBuffer(true)·Retina DPR2 드로잉버퍼·depth버퍼가 가산 → **Mac ANGLE Metal GPU 프로세스 메모리 예산 초과 → 컨텍스트 리셋**. Windows D3D11(WDDM VRAM 가상화·이 AMD 16GB+)은 흡수 → **미재현**(플랫폼 특이성과 정합).
- **한계**: 이 HW(Win/AMD)에서 실제 loss 재현·수정검증 불가. 확증 범위 = **메커니즘 레벨**(WeakRef로 GC-eligible 증명 + peak 상한 + preserveDrawingBuffer + deleteTexture 부재). 실 Mac in-situ 재현은 별건.

**G. 최소 수정 후보 (제안, 미적용)**
- **후보1 (권장, 최소·저위험): 프레임말 deferred-delete 큐**. `_getTex`에서 버전 불일치로 캐시 덮어쓰기 직전, 구 `e.tex`를 `_texGCQueue.push`; 프레임 끝 `_glFlush()` 직후(L50529 부근)에 큐를 `GL.deleteTexture` 후 clear. → 구 텍스처를 **GC 대기 없이 프레임말 결정적 해제**(transient 피크 즉시 제거). 플러시 완료 후라 in-flight 배치 안전. 품질/해상도/DPR/청킹 **무변경**.
- **후보2 (2차): 맵 전환 전용 명시 해제**. `buildMapCache`/`_finalizeBMC`에서 구 맵 텍스처만 타겟 해제(맵 텍스처는 1개라 범위 협소).
- **후보3 (보조): `depth:false` 명시**(L4821 컨텍스트 옵션) — 불필요한 깊이버퍼 제거(2D 게임, 깊이 미사용). 소폭 VRAM 절감.
- ⚠ 후보1도 hot 텍스처 경로 GL 변경이라 Mac 실검증 없이 적용 시 회귀위험(바인딩 중 텍스처 삭제 등). **Mac repro 확보 후 적용 권장**. 금지목록(맵 축소/청킹/DPR 제한/품질하향)은 **어느 후보도 미포함**.

**H. 코드 수정 여부**: ~~미적용 (제안만)~~ → **적용 완료 (아래 Track D FIX 참조)**. 후보1(프레임말 deferred-delete 큐)을 **map 텍스처 한정**으로 최소 적용 + before/after 자동 검증.

---

#### Track D FIX 적용 (2026-08-16) — 맵 텍스처 수명 결정적 종료 (RESOURCE-LIFETIME = CONFIRMED)

> 지시("resource-lifetime 조사 결과 기반 최소 수정 + 검증"). 후보1(프레임말 deferred-delete 큐)을 **map canvas 텍스처 한정**으로 적용. 금지목록(맵 축소/DPR 제한/청킹 강제/품질하향/preserveDrawingBuffer·depth 변경/Track A·B 코드 변경) **전부 미포함**. 검증 probe: `tmp/probe_trackd_fix_verify.py`(before/after 동일 harness), `tmp/probe_trackd_regression.py`(라이브 회귀+Track A synthetic loss), `tmp/probe_trackd_visual.py`(비주얼).

**A. 정확한 map texture ownership 지점**
- **재사용 싱글턴 `_mapCvs`**(L20571 생성, `_mapTex=1` 표식): 전환마다 리사이즈+`_glVer++` → 다음 `_getTex(_mapCvs)`가 **버전 불일치로 캐시 덮어쓰기**(L4878) = 구 `WebGLTexture` 무참조화 지점. **비스트림 단일 244MiB 텍스처(확정 케이스)의 유일 소유 경계.**
- 청크 캔버스(`_mapChunks[].cvs`, 맵>glMaxTex): 신규 배열로 교체 시 구 청크 드롭(재조회 불가) → 명시 해제 필요.
- 명시적 ownership boundary = **`buildMapCache` 진입부**("맵 재빌드 = 직전 맵 GPU 텍스처 소유권 종료").

**B. 수정 전 lifecycle** — `_getTex`가 신규 텍스처 생성+`_texCache.set` 덮어쓰기만, `deleteTexture` **호출 0건**(코드 전체). 구 텍스처는 GC까지 잔존 → 전환율>GC속도면 244MiB×N 동시 잔존(transient VRAM 피크).

**C. 수정 코드** (game.html, +37/−4 lines, map 텍스처 한정):
1. 모듈 스코프: `_texGCQueue`(종료 대기 큐) + `_drainTexGCQueue()`(프레임말 결정적 삭제) + `_freeMapTex`(ownership 종료 헬퍼) + 불변식 4종 주석(L4153 부근).
2. `_getTex` WebGL(L4878): 버전 불일치 재업로드 직전, `src._mapTex`면 구 `e.tex`를 큐로 push(1줄, 비-map은 short-circuit → 핫패스 무영향).
3. `_freeMapTex`(L4896): `_texCache`의 캐시 텍스처를 큐로 이관+슬롯 제거(`_initWebGL` WebGL 분기 할당, Canvas2D/WebGPU는 no-op).
4. `buildMapCache` 진입부(invariant #3): `_freeMapTex(_mapCvs)` + 구 `_mapChunks[].cvs` 전부 해제 → 재사용/드롭/비스트림→스트림 전환 모두 커버.
5. 프레임말(L50564): `_glFlush()` **직후** `_drainTexGCQueue()` → 현재 frame 마지막 flush 완료 후 삭제(invariant #2).
6. context-lost 핸들러: 큐 clear + `_freeMapTex` no-op화(핸들은 컨텍스트와 함께 소멸).
7. `_mapCvs._mapTex=1`(생성 시), 청크 `cc._mapTex=1`(2곳).

**D. delete 시점 / in-flight safety 근거**
- 삭제는 **프레임 마지막 `_glFlush()` 직후**에만(invariant #2). 큐잉된 구 텍스처의 마지막 GPU 사용은 **직전 frame**(이미 flush 완료). 현재 frame은 신규 텍스처만 참조(`_getTex`→신규→`_setTex(신규)`). `_curTex`는 매 frame `_clearFrame`에서 `wt`로 리셋 → 삭제 텍스처가 다음 frame에 stale 바인딩으로 남지 않음.
- 다중 `buildMapCache`(draw 사이): `_freeMapTex`가 캐시 슬롯 삭제하므로 2회차부터 no-op → **구 텍스처 1개만** 큐잉(중복 없음).
- WebGL `deleteTexture`는 파이프라인 참조 중이면 드라이버가 지연 해제(spec) → GL 레벨 use-after-free 불가.

**E. 20~50 transition before/after** (`?testchar=1&stage=0`, 8000×8000 단일맵 stage0↔1, headless SwiftShader MAX_TEXTURE_SIZE=8192, `G.on=false`로 프레임 경계 결정적 구동):

| 지표 | BEFORE(fix stash) | AFTER(fix) |
|---|---|---|
| deleteTexture (normal 20 + fast 50 = 70 전환) | **0** | **140** |
| map 텍스처 created / deleted | 측정불가(플래그 없음)* | **141 / 140** |
| **peak concurrent MAP 텍스처** | 누적(0삭제) | **1 (244.1MB)** |
| map live (최종) | — | **1** |
| 총 live 텍스처(70전환+GC 후) | **233** (단조증가, 0 삭제) | **93** (map 해제, 스프라이트 캐시만 잔존) |
| GL error | 0 | 0 |
| context loss | 없음 | 없음 |

*BEFORE는 `_mapTex` 플래그 자체가 fix 소속 → 격리 불가. 대신 **deleteTexture=0·총 live 0→233 단조증가**가 누수(GC 종속) 직접 증거.

**F. create/delete/live/peak MB before/after**
- BEFORE: 삭제 0 → 244MiB급 맵 텍스처가 전환마다 누적(GC 전까지). 총 텍스처 0→233 단조증가.
- AFTER: **create ≈ delete 균형**(141≈140), **동시 생존 맵 텍스처 상한 = 1 = 244.1MB**(빠른 50연속 전환에서도 peak=1). 전환당 build 내부 progressive 버전으로 순간 ≤4개 공존하나 프레임말 drain이 즉시 1로 붕괴.

**G. GL error / context-loss 결과**
- 전 구간 `GL.getError()=0`, `isContextLost()=false`. use-after-delete 체크(140 삭제 후 맵 재업로드+flush): `glErr=0`, loss 없음.

**H. visual / gameplay regression**
- 라이브 루프(`G.on=true`) 실전투 진입 후 stage 0/1/2/3 실전환: 매 전환 nonBlack 픽셀 5/5(실제 지형색), glErr=0, loss 없음, 검은맵/플리커 없음, pageerror 0. 스크린샷(`tmp/_trackd_visual_stage0.png`): 썩은숲 지형+HUD+펫+보스+에리어타이틀 정상 렌더.

**I. Track A regression** — synthetic context loss(`WEBGL_lose_context.loseContext()`)→restore(`restoreContext()`):
- loss: `useGL=false`, GL null(핸들러 정상). restore: `useGL=true`, `isContextLost()=false`, `glErr=0`, 파이프라인 재구축(mapCvs 재생성), `G.on=true`.
- restore 후 실전환으로 real batch flush 강제: `glErr=0`. **`Insufficient buffer size`(0x502)/crash-loop/`bindTexture null` 시그널 0건** → **1728852c LOCK 정상 유지**(Track D fix가 loss/restore 경로 무간섭).

**J. Track D 상태**
- **RESOURCE-LIFETIME FIX = CONFIRMED** — stale map 텍스처 explicit delete 정상, old/new 누적 window bounded(peak=1×244MiB), GL regression 없음.
- **MAC CONTEXT LOSS = IN-SITU CONFIRMATION PENDING** — Windows/AMD에서 **트리거 완화 메커니즘 검증 완료**(GC 대기 제거→transient VRAM 피크 소거를 계측 확증). 단 이 HW는 실제 loss 미재현 → **Mac 실기에서 동일 전환 stress 후 context-loss=0 확인 시 Track D 전체 FIXED/CLOSED 승격**. 그 전까지 Mac root cause는 STRONGLY SUPPORTED(메커니즘 레벨), 완전 CONFIRMED 아님.

**K. Track D2 후보(별건, DEFERRED)**: 본 lifetime fix 독립 측정 완료. resource peak 추가 절감 필요 시 `preserveDrawingBuffer`/`depth` 필요성 감사(후보3)를 Track D2로 — 본 커밋과 미혼합(지시 §8). **현재 변경 금지·재개 조건은 상단 FROZEN 블록 참조.**

**L. LOCK 서명 (2026-08-16 유저 ratify)**: D1 = **CONFIRMED / FIXED / LOCKED** (`ae7eaf82`). Mac context-loss = **IN-SITU CONFIRMATION PENDING** (Mac 실기 transition stress 후 context-loss=0 확인 시에만 Track D 전체 CLOSED 승격). Track D2 = **DEFERRED**. → 상단 §최종 상태(FROZEN) 표에 통합.

---

## git provenance — `ae7eaf82` 번들 (2026-08-16)

> **history rewrite 금지.** 이 노트는 사실 기록용이며, 이미 push된 `ae7eaf82`를 재작성하지 않는다.

- **사실**: Track D1 fix(`game.html` 맵 텍스처 수명 + 본 문서)는 **별도 commit**을 의도했으나, 커밋 시점에 **auto-sync cron**이 working-tree 전체를 `git add -A` → `ae7eaf82 "auto: session sync"` 단일 commit으로 흡수했다. 그 결과 **boss3d 타세션 파일**(`game_boss3d_test.html`, `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`, `game_backup_boss3d_test_pre_align.html`)이 D1 변경과 **같은 commit에 번들**되어 함께 push됨.
- **무결성**: 본 세션은 boss3d 파일 **내용을 수정한 바 없음**(순수 auto-sync 흡수). D1 변경분은 `game.html`(맵 텍스처 수명, `[Track D]` 마커 9개)과 `docs/PERF_MAC_CHROME_AUDIT.md`로 한정.
- **재분리 불가 사유**: `ae7eaf82`를 소프트리셋해 클린 분리하려 했으나 `git reset` 권한 거부 → 재분리 포기. **history rewrite 대신 provenance note로 기록**(지시 준수).
- **영향**: `origin/main` 히스토리에서 D1 커밋을 단독 식별하려면 이 노트 + `game.html`의 `[Track D]` diff로 판별. 기능/정확성 영향 없음(번들된 boss3d 파일은 그 세션의 정당한 작업물).
- **재발 방지**: 하단 및 `CLAUDE.md §동시 세션 / git commit ownership` 운영 규칙 참조.

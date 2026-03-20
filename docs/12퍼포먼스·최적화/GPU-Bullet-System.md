# GPU Bullet System — 하드웨어 최적화 총정리

## Tier 로드맵

### Tier 1: WebGL2 (브라우저/지금 당장)

| 기술 | 효과 | 상태 |
|------|------|------|
| **Transform Feedback ping-pong** | CPU 개입 0, 1만발 업데이트 GPU 완전 처리 | 설계 완료 |
| **Instanced Rendering** | drawCall 1번, 10만발도 동일 비용 | 설계 완료 |
| **MRT (Multiple Render Targets)** | 색상+발광+속도 한 번에 렌더, bloom 패스 분리 불필요 | 미구현 |

### Tier 2: WebGPU Compute (Electron)

| 기술 | 효과 |
|------|------|
| **Compute Shader** | 탄막 물리: 병렬 10만 스레드, 충돌판정: BVH 트리 GPU 빌드/쿼리, 파티클: spawn/update/cull 전부 GPU |
| **Storage Buffer** | 탄 상태 GPU 메모리 상주, CPU 전송 0 |
| **Indirect Draw** | GPU가 드로우콜 인자까지 생성, CPU는 "그려" 한 마디만 |

### Tier 3: 멀티스레드 (지금도 가능)

| 기술 | 효과 |
|------|------|
| **SharedArrayBuffer + Worker** | 충돌판정 Worker (이미 있음), AI Worker (이미 있음), 탄막 물리 전용 Worker 추가 → 메인스레드 완전 분리 |
| **OffscreenCanvas** | 렌더링 자체를 Worker로 이전, 메인스레드 = 게임로직만 |

### Tier 4: WASM (극한)

| 기술 | 효과 |
|------|------|
| **Rust/C++ → WASM** | SIMD 명령어로 탄막 위치 업데이트, 4발을 1 SIMD 연산으로 처리, JS 대비 10~20배 속도 |
| **wasm-bindgen** | JS: 인터페이스만, WASM: 물리/충돌 전부 |

### 현실적 적용 순서

```
지금      → Transform Feedback + Instanced (WebGL2, 브라우저 1만발)
Electron  → WebGPU Compute (GPU 완전 장악, 10만발)
극한      → WASM + WebGPU (RX 9070 XT 완전히 쓸 수 있음)
```

---

## 듀얼패스 아키텍처

### 런타임 분기

```
게임 시작
  ├─ IS_ELECTRON && GPU → WebGPU Compute 풀가동
  │   ├─ Compute Shader: 탄 10만개 워크그룹 병렬 처리
  │   ├─ Storage Buffer: GPU 메모리 상주, CPU 전송 0
  │   ├─ 충돌판정: atomicAdd (GPU에서 완결)
  │   └─ Indirect Draw: GPU가 draw 인자까지 생성
  │
  ├─ GL (브라우저) → WebGL2 fallback
  │   ├─ Transform Feedback: ping-pong 버퍼, CPU 개입 0
  │   ├─ Instanced Rendering: drawCall 1번
  │   ├─ 충돌판정: CPU Grid 샘플링 (1/10 탄)
  │   └─ 제한: 1만발 (GPU 성능 의존)
  │
  └─ Canvas2D (최종 폴백)
      ├─ CPU TypedArray 루프 + fillRect
      └─ 제한: 1000발 이하 권장
```

### 코드 분기 패턴

```js
function initBulletSystem() {
  if (_useGPU) {
    initComputeBullets();   // WebGPU Compute
  } else if (_useGL) {
    initTFBullets();        // Transform Feedback
    initBurstRenderer();    // Instanced (TF 실패 시 폴백)
  }
  // Canvas2D는 초기화 불필요
}

function updateBullets(sp) {
  if (_useGPU)      updateComputeBullets(sp);
  else if (_useGL)  updateAndDrawTF(sp);       // TF는 update+draw 통합
  else              updateBurstBullets(sp);    // CPU 루프
}

function drawBullets() {
  if (_useGPU)      drawComputeBullets();
  else if (_useGL)  {}  // TF에서 이미 렌더됨
  else              drawBurstBullets2D();      // Canvas2D 폴백
}
```

### 성능 목표

| 환경 | 백엔드 | 탄 수 | CPU 부하 | GPU 부하 | drawCall |
|------|--------|-------|---------|---------|---------|
| **Electron** | WebGPU Compute | 10만 | 0ms | ~2ms | 1 (Indirect) |
| **Chrome/Edge** | WebGL2 TF | 1만 | 0ms | ~1ms | 1 (Instanced) |
| **Safari/폴백** | Canvas2D | 1000 | ~3ms | 0 | N/A |

### Compute vs Transform Feedback 비교

| | WebGPU Compute | WebGL2 TF |
|---|---|---|
| 업데이트 | Compute Shader (병렬) | TF vertex shader (순차) |
| 충돌판정 | GPU atomicAdd | CPU Grid 샘플링 |
| 버퍼 관리 | Storage Buffer 1개 | ping-pong 2개 |
| 탄 생성/소멸 | Indirect + atomic counter | CPU에서 count 관리 |
| 최대 스레드 | 워크그룹 256 × dispatch N | 버텍스 1:1 |
| 지연 | 0프레임 | 0프레임 (충돌만 1프레임) |

---

## 현재 게임 인프라

| 항목 | 값 | 비고 |
|------|-----|------|
| 메인 캔버스 | `C` | id="c" |
| WebGPU context | `GPU` (device), `_gpuCtx` | Electron 우선, `?webgpu=1` |
| WebGL2 context | `GL` | WebGPU 실패 시 폴백 |
| Canvas2D | `X` | 최종 폴백 |
| 렌더 백엔드 플래그 | `_useGPU`, `_useGL` | |
| 카메라 | `G.cam.x`, `G.cam.y` | |
| 해상도 | `C.width`, `C.height` | |
| 기존 flush | `_flush()` | 기존 드로우큐 비우기 |
| 기존 blend 전환 | `_setBlend(additive)` | |
| 투사체 배열 | `projs[]` (적탄), `pProjs[]` (아군탄) | Object Pool 사용 |

### 주의사항
- **같은 캔버스에서 context 2개 불가** — 별도 `initBurstRenderer(gl)` 금지
- 기존 `GL`에 프로그램/VAO 추가하는 방식으로 통합
- `_flush()` 호출 후 burst 렌더, 끝나면 기존 프로그램 복원
- Canvas2D 폴백 시 `fillRect` 루프로 대체 (성능 저하 감수)

---

## Phase 1: Instanced Rendering (CPU 업데이트 + GPU 1-draw)

### 성능 비교

| 방식 | 1만발 CPU | 드로우콜 |
|------|----------|---------|
| 기존 (개별 draw) | ~5ms 루프 | 10000번 |
| Instanced | ~1ms TypedArray | **1번** |

### 전역 선언

```js
// ── GPU BURST BULLET SYSTEM ──────────────────────
let _burstProg = null;       // WebGL2 전용 셰이더 프로그램
let _burstVAO = null;
let _burstQuadVBO = null;    // 사각형 버텍스 (공유)
let _burstInstVBO = null;    // 인스턴스 데이터
const BURST_MAX = 10000;     // 최대 탄 수
const BURST_STRIDE = 6;      // x, y, vx, vy, life, size
const _burstBuf = new Float32Array(BURST_MAX * BURST_STRIDE);
let _burstCount = 0;
let _burstActive = false;
let _burstColor = [1, 0.5, 0.1, 1];
```

### 초기화 (기존 GL에 추가)

```js
function initBurstRenderer() {
  if (!GL) return; // WebGL2 없으면 스킵

  const vsrc = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aPos;      // 쿼드 (-1~1)
  layout(location=1) in vec2 aInst;     // 인스턴스: world x,y
  layout(location=2) in float aSize;    // 인스턴스: 크기
  layout(location=3) in float aLife;    // 인스턴스: 수명 0~1

  uniform vec2 uCam;      // G.cam.x, G.cam.y
  uniform vec2 uRes;      // C.width, C.height

  out float vLife;

  void main() {
    vec2 world = aInst - uCam;
    vec2 screen = world + uRes * 0.5;   // 화면 중심 보정
    vec2 ndc = screen / uRes * 2.0 - 1.0;
    ndc.y = -ndc.y;                      // Y축 반전 (기존 GL과 동일)
    vec2 vert = aPos * (aSize / uRes);
    gl_Position = vec4(ndc + vert, 0.0, 1.0);
    vLife = aLife;
  }`;

  const fsrc = `#version 300 es
  precision mediump float;
  in float vLife;
  out vec4 fragColor;
  uniform vec4 uColor;

  void main() {
    float a = vLife * uColor.a;
    fragColor = vec4(uColor.rgb * a, a);
  }`;

  function _mkSh(src, t) {
    const s = GL.createShader(t);
    GL.shaderSource(s, src);
    GL.compileShader(s);
    if (!GL.getShaderParameter(s, GL.COMPILE_STATUS))
      console.error('burst shader:', GL.getShaderInfoLog(s));
    return s;
  }

  _burstProg = GL.createProgram();
  GL.attachShader(_burstProg, _mkSh(vsrc, GL.VERTEX_SHADER));
  GL.attachShader(_burstProg, _mkSh(fsrc, GL.FRAGMENT_SHADER));
  GL.linkProgram(_burstProg);

  // VAO
  _burstVAO = GL.createVertexArray();
  GL.bindVertexArray(_burstVAO);

  // 쿼드 버텍스 (location 0)
  const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
  _burstQuadVBO = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, _burstQuadVBO);
  GL.bufferData(GL.ARRAY_BUFFER, quad, GL.STATIC_DRAW);
  GL.enableVertexAttribArray(0);
  GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
  GL.vertexAttribDivisor(0, 0);

  // 인스턴스 버퍼 (location 1,2,3)
  _burstInstVBO = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, _burstInstVBO);
  GL.bufferData(GL.ARRAY_BUFFER, _burstBuf.byteLength, GL.DYNAMIC_DRAW);

  const stride = BURST_STRIDE * 4;
  // aInst: x,y (location 1)
  GL.enableVertexAttribArray(1);
  GL.vertexAttribPointer(1, 2, GL.FLOAT, false, stride, 0);
  GL.vertexAttribDivisor(1, 1);
  // aSize (location 2) — offset 20 = float[5] = size
  GL.enableVertexAttribArray(2);
  GL.vertexAttribPointer(2, 1, GL.FLOAT, false, stride, 20);
  GL.vertexAttribDivisor(2, 1);
  // aLife (location 3) — offset 16 = float[4] = life
  GL.enableVertexAttribArray(3);
  GL.vertexAttribPointer(3, 1, GL.FLOAT, false, stride, 16);
  GL.vertexAttribDivisor(3, 1);

  GL.bindVertexArray(null);
}
```

### 호출 위치

```js
// _initWebGL() 마지막, return true 직전에:
initBurstRenderer();
```

### 발사 함수

```js
function fireBurstSkill(cx, cy, count, spd, size, color) {
  count = count || 100;
  spd = spd || 6;
  size = size || 5;
  color = color || [1, 0.5, 0.1, 1];

  _burstCount = Math.min(count, BURST_MAX);
  _burstActive = true;
  _burstColor = color;

  for (let i = 0; i < _burstCount; i++) {
    const a = (Math.PI * 2 / _burstCount) * i;
    const b = i * BURST_STRIDE;
    _burstBuf[b]   = cx;                // x
    _burstBuf[b+1] = cy;                // y
    _burstBuf[b+2] = Math.cos(a) * spd; // vx
    _burstBuf[b+3] = Math.sin(a) * spd; // vy
    _burstBuf[b+4] = 1.0;               // life (1→0)
    _burstBuf[b+5] = size;              // size(px)
  }
}
```

### 업데이트 (update 루프 안에)

```js
function updateBurstBullets(sp) {
  if (!_burstActive) return;
  let alive = 0;
  for (let i = 0; i < _burstCount; i++) {
    const b = i * BURST_STRIDE;
    if (_burstBuf[b+4] <= 0) continue;
    _burstBuf[b]   += _burstBuf[b+2] * sp; // x += vx * sp
    _burstBuf[b+1] += _burstBuf[b+3] * sp; // y += vy * sp
    _burstBuf[b+4] -= sp * 0.007;           // life 감소 (약 2.4초)
    alive++;
  }
  if (alive === 0) { _burstActive = false; return; }

  // GPU 업로드
  if (GL && _burstInstVBO) {
    GL.bindBuffer(GL.ARRAY_BUFFER, _burstInstVBO);
    GL.bufferSubData(GL.ARRAY_BUFFER, 0,
      _burstBuf, 0, _burstCount * BURST_STRIDE);
  }
}
```

### 렌더 (draw 루프 끝에, _flush() 이후)

```js
function drawBurstBullets() {
  if (!_burstActive || !_burstProg || !GL) return;

  _flush(); // ★ 기존 드로우큐 먼저 비우기

  GL.useProgram(_burstProg);
  GL.bindVertexArray(_burstVAO);

  const uLoc = (n) => GL.getUniformLocation(_burstProg, n);
  GL.uniform2f(uLoc('uCam'), G.cam.x, G.cam.y);
  GL.uniform2f(uLoc('uRes'), C.width, C.height);
  GL.uniform4fv(uLoc('uColor'), _burstColor);

  GL.enable(GL.BLEND);
  GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA); // premultiplied

  // ★ 1번 드로우콜로 전체 탄
  GL.drawArraysInstanced(GL.TRIANGLE_STRIP, 0, 4, _burstCount);

  // 기존 상태 복원
  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
  GL.bindVertexArray(null);
  // 기존 프로그램은 다음 _flush()에서 자동 바인딩됨
}
```

### Canvas2D 폴백

```js
function drawBurstBullets2D() {
  if (!_burstActive || GL) return; // GL 있으면 WebGL 경로 사용
  const ox = C.width / 2 - G.cam.x;
  const oy = C.height / 2 - G.cam.y;
  const r = _burstColor[0] * 255, g = _burstColor[1] * 255, b = _burstColor[2] * 255;

  for (let i = 0; i < _burstCount; i++) {
    const bi = i * BURST_STRIDE;
    const life = _burstBuf[bi+4];
    if (life <= 0) continue;
    const sz = _burstBuf[bi+5];
    X.globalAlpha = life * _burstColor[3];
    X.fillStyle = `rgb(${r},${g},${b})`;
    X.fillRect(~~(_burstBuf[bi] + ox - sz/2),
               ~~(_burstBuf[bi+1] + oy - sz/2), sz, sz);
  }
  X.globalAlpha = 1;
}
```

---

## Phase 2: Transform Feedback (GPU 업데이트 + GPU 렌더)

### 성능 비교

| 방식 | 1만발 CPU | 드로우콜 |
|------|----------|---------|
| Instanced | ~1ms TypedArray | 1번 |
| Transform Feedback | **0ms (GPU가 처리)** | 1번 |

### 핵심: Ping-Pong 버퍼

```
프레임 N: GPU가 BufA 읽기 → BufB 쓰기 → BufB로 렌더
프레임 N+1: GPU가 BufB 읽기 → BufA 쓰기 → BufA로 렌더
CPU: uniform 세팅만 (dt, 벽 좌표)
```

### 전역 선언

```js
let _tfUpdateProg = null;  // TF 업데이트 셰이더
let _tfRenderProg = null;  // 인스턴스 렌더 셰이더
let _tfBufA = null;        // ping
let _tfBufB = null;        // pong
let _tfVAO_A = null;       // BufA 읽기용 VAO
let _tfVAO_B = null;       // BufB 읽기용 VAO
let _tfRVAO_A = null;      // BufA 렌더용 VAO
let _tfRVAO_B = null;      // BufB 렌더용 VAO
let _tfObj = null;          // TransformFeedback 오브젝트
let _tfCount = 0;
let _tfActive = false;
let _tfPing = true;         // true=A읽기B쓰기, false=B읽기A쓰기
```

### Update 셰이더 (렌더 없음, RASTERIZER_DISCARD)

```glsl
#version 300 es
precision highp float;

// 입력: 현재 상태
layout(location=0) in vec2 aPos;   // x, y
layout(location=1) in vec2 aVel;   // vx, vy
layout(location=2) in float aLife; // 수명 0~1
layout(location=3) in float aSize; // 크기

// Transform Feedback 출력
out vec2 vPos;
out vec2 vVel;
out float vLife;
out float vSize;

uniform float uDt;        // sp (delta * slowmo)
uniform vec4  uBounds;    // 맵 경계 (minX, minY, maxX, maxY)
uniform float uDecay;     // life 감소 속도

void main() {
  vec2 pos = aPos + aVel * uDt;
  vec2 vel = aVel;
  float life = aLife - uDt * uDecay;

  // 맵 경계 반사 (선택)
  if (pos.x < uBounds.x || pos.x > uBounds.z) vel.x *= -0.8;
  if (pos.y < uBounds.y || pos.y > uBounds.w) vel.y *= -0.8;

  // 감속 (공기저항)
  vel *= pow(0.995, uDt * 60.0);

  vPos  = pos;
  vVel  = vel;
  vLife = max(life, 0.0);
  vSize = aSize;
}
```

### Render 셰이더 (Instanced, Phase 1과 동일)

Phase 1의 vsrc/fsrc 그대로 사용. 인스턴스 버퍼만 TF 출력 버퍼로 교체.

### 초기화

```js
function initTFBullets() {
  if (!GL) return;

  // ── Update Program (Transform Feedback) ──
  const tfVS = /* 위 GLSL */;
  const tfFS = `#version 300 es
  precision lowp float; out vec4 o; void main(){o=vec4(0);}`;

  _tfUpdateProg = GL.createProgram();
  GL.attachShader(_tfUpdateProg, _mkSh(tfVS, GL.VERTEX_SHADER));
  GL.attachShader(_tfUpdateProg, _mkSh(tfFS, GL.FRAGMENT_SHADER));

  // ★ TF varying 등록 — linkProgram 전에
  GL.transformFeedbackVaryings(
    _tfUpdateProg,
    ['vPos', 'vVel', 'vLife', 'vSize'],
    GL.INTERLEAVED_ATTRIBS
  );
  GL.linkProgram(_tfUpdateProg);

  // ── Render Program (Phase 1 코드 재사용) ──
  _tfRenderProg = _burstProg; // 또는 별도 생성

  // ── 버퍼 2개 (ping-pong) ──
  const byteSize = BURST_MAX * 6 * 4; // 6 floats × 4 bytes
  _tfBufA = GL.createBuffer();
  _tfBufB = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, _tfBufA);
  GL.bufferData(GL.ARRAY_BUFFER, byteSize, GL.DYNAMIC_COPY);
  GL.bindBuffer(GL.ARRAY_BUFFER, _tfBufB);
  GL.bufferData(GL.ARRAY_BUFFER, byteSize, GL.DYNAMIC_COPY);

  // ── VAO 4개: 업데이트A, 업데이트B, 렌더A, 렌더B ──
  _tfVAO_A = _makeTFUpdateVAO(_tfBufA);
  _tfVAO_B = _makeTFUpdateVAO(_tfBufB);
  _tfRVAO_A = _makeTFRenderVAO(_tfBufA);
  _tfRVAO_B = _makeTFRenderVAO(_tfBufB);

  // ── TF 오브젝트 ──
  _tfObj = GL.createTransformFeedback();
}

function _makeTFUpdateVAO(buf) {
  const vao = GL.createVertexArray();
  GL.bindVertexArray(vao);
  GL.bindBuffer(GL.ARRAY_BUFFER, buf);
  const stride = 6 * 4; // 6 floats
  // aPos (location 0)
  GL.enableVertexAttribArray(0);
  GL.vertexAttribPointer(0, 2, GL.FLOAT, false, stride, 0);
  // aVel (location 1)
  GL.enableVertexAttribArray(1);
  GL.vertexAttribPointer(1, 2, GL.FLOAT, false, stride, 8);
  // aLife (location 2)
  GL.enableVertexAttribArray(2);
  GL.vertexAttribPointer(2, 1, GL.FLOAT, false, stride, 16);
  // aSize (location 3)
  GL.enableVertexAttribArray(3);
  GL.vertexAttribPointer(3, 1, GL.FLOAT, false, stride, 20);
  GL.bindVertexArray(null);
  return vao;
}

function _makeTFRenderVAO(instBuf) {
  const vao = GL.createVertexArray();
  GL.bindVertexArray(vao);
  // 쿼드 (location 0)
  GL.bindBuffer(GL.ARRAY_BUFFER, _burstQuadVBO);
  GL.enableVertexAttribArray(0);
  GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
  GL.vertexAttribDivisor(0, 0);
  // 인스턴스 (location 1,2,3) — TF 출력 버퍼
  GL.bindBuffer(GL.ARRAY_BUFFER, instBuf);
  const stride = 6 * 4;
  GL.enableVertexAttribArray(1);
  GL.vertexAttribPointer(1, 2, GL.FLOAT, false, stride, 0);  // pos
  GL.vertexAttribDivisor(1, 1);
  GL.enableVertexAttribArray(2);
  GL.vertexAttribPointer(2, 1, GL.FLOAT, false, stride, 20); // size
  GL.vertexAttribDivisor(2, 1);
  GL.enableVertexAttribArray(3);
  GL.vertexAttribPointer(3, 1, GL.FLOAT, false, stride, 16); // life
  GL.vertexAttribDivisor(3, 1);
  GL.bindVertexArray(null);
  return vao;
}
```

### 발사 (CPU → GPU 초기 데이터 업로드, 1회)

```js
function fireTFBurst(cx, cy, count, spd, size) {
  count = Math.min(count || 10000, BURST_MAX);
  spd = spd || 6;
  size = size || 5;

  const init = new Float32Array(count * 6);
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 / count) * i;
    const b = i * 6;
    init[b]   = cx;
    init[b+1] = cy;
    init[b+2] = Math.cos(a) * spd;
    init[b+3] = Math.sin(a) * spd;
    init[b+4] = 1.0;   // life
    init[b+5] = size;
  }

  // 양쪽 버퍼에 동일 데이터 업로드
  GL.bindBuffer(GL.ARRAY_BUFFER, _tfBufA);
  GL.bufferSubData(GL.ARRAY_BUFFER, 0, init);
  GL.bindBuffer(GL.ARRAY_BUFFER, _tfBufB);
  GL.bufferSubData(GL.ARRAY_BUFFER, 0, init);

  _tfCount = count;
  _tfActive = true;
  _tfPing = true;
}
```

### 매 프레임 (업데이트 + 렌더, CPU 개입 0)

```js
function updateAndDrawTF(sp) {
  if (!_tfActive || !GL) return;

  _flush(); // 기존 드로우큐 비우기

  const readBuf  = _tfPing ? _tfBufA : _tfBufB;
  const writeBuf = _tfPing ? _tfBufB : _tfBufA;
  const readVAO  = _tfPing ? _tfVAO_A : _tfVAO_B;
  const renderVAO = _tfPing ? _tfRVAO_B : _tfRVAO_A; // 쓴 버퍼로 렌더

  // ── Pass 1: GPU 업데이트 (렌더 없음) ──
  GL.useProgram(_tfUpdateProg);
  GL.uniform1f(GL.getUniformLocation(_tfUpdateProg, 'uDt'), sp);
  GL.uniform1f(GL.getUniformLocation(_tfUpdateProg, 'uDecay'), 0.007);
  // 맵 경계 (현재 방 기준)
  const rm = G.rooms && G.rooms[G.curRoom];
  if (rm) {
    GL.uniform4f(GL.getUniformLocation(_tfUpdateProg, 'uBounds'),
      rm.x, rm.y, rm.x + rm.w, rm.y + rm.h);
  }

  GL.enable(GL.RASTERIZER_DISCARD); // ★ 렌더 끔

  GL.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, _tfObj);
  GL.bindBufferBase(GL.TRANSFORM_FEEDBACK_BUFFER, 0, writeBuf);
  GL.bindVertexArray(readVAO);

  GL.beginTransformFeedback(GL.POINTS);
  GL.drawArrays(GL.POINTS, 0, _tfCount);
  GL.endTransformFeedback();

  GL.bindTransformFeedback(GL.TRANSFORM_FEEDBACK, null);
  GL.disable(GL.RASTERIZER_DISCARD); // ★ 렌더 켬

  // ── Pass 2: 렌더 (업데이트된 버퍼) ──
  GL.useProgram(_tfRenderProg);
  GL.bindVertexArray(renderVAO);

  const uLoc = (n) => GL.getUniformLocation(_tfRenderProg, n);
  GL.uniform2f(uLoc('uCam'), G.cam.x, G.cam.y);
  GL.uniform2f(uLoc('uRes'), C.width, C.height);
  GL.uniform4fv(uLoc('uColor'), _burstColor);

  GL.enable(GL.BLEND);
  GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);

  GL.drawArraysInstanced(GL.TRIANGLE_STRIP, 0, 4, _tfCount);

  // 복원
  GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
  GL.bindVertexArray(null);

  // Ping-pong 스왑
  _tfPing = !_tfPing;
}
```

---

## Phase 3: Compute Shader (WebGPU, Electron 전용)

### 성능 비교

| 방식 | CPU 부하 | GPU 패스 | 장점 |
|------|---------|---------|------|
| Transform Feedback | 0 | 2패스 (update+render) | WebGL2 호환 |
| Compute Shader | 0 | 1패스 (compute+render) | 충돌판정도 GPU |

### WGSL Compute Shader

```wgsl
struct Bullet {
  pos: vec2f,
  vel: vec2f,
  life: f32,
  size: f32,
};

struct Params {
  dt: f32,
  decay: f32,
  bounds: vec4f,   // minX, minY, maxX, maxY
  playerPos: vec2f,
  playerR: f32,
  _pad: f32,
};

@group(0) @binding(0) var<storage, read_write> bullets: array<Bullet>;
@group(0) @binding(1) var<uniform> params: Params;
@group(0) @binding(2) var<storage, read_write> hitFlag: atomic<u32>; // 피격 플래그

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= arrayLength(&bullets)) { return; }

  var b = bullets[i];
  if (b.life <= 0.0) { return; }

  // 위치 업데이트
  b.pos += b.vel * params.dt;

  // 벽 반사
  if (b.pos.x < params.bounds.x || b.pos.x > params.bounds.z) { b.vel.x *= -0.8; }
  if (b.pos.y < params.bounds.y || b.pos.y > params.bounds.w) { b.vel.y *= -0.8; }

  // 감속
  b.vel *= pow(0.995, params.dt * 60.0);

  // 수명 감소
  b.life -= params.dt * params.decay;

  // ★ 충돌판정 (플레이어)
  let d = distance(b.pos, params.playerPos);
  if (d < params.playerR + b.size) {
    atomicAdd(&hitFlag, 1u);  // CPU에서 읽기
    b.life = 0.0;             // 탄 소멸
  }

  bullets[i] = b;
}
```

### 초기화 (WebGPU)

```js
function initComputeBullets() {
  if (!GPU) return;

  const module = GPU.createShaderModule({ code: /* 위 WGSL */ });

  _computePipeline = GPU.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'main' }
  });

  // Storage 버퍼 (bullets)
  _bulletStorageBuf = GPU.createBuffer({
    size: BURST_MAX * 6 * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX |
           GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });

  // Uniform 버퍼 (params)
  _paramsBuf = GPU.createBuffer({
    size: 48, // 12 floats × 4 bytes
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Hit flag 버퍼 (atomic, CPU 읽기용)
  _hitBuf = GPU.createBuffer({
    size: 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });
  _hitReadBuf = GPU.createBuffer({
    size: 4,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  _computeBG = GPU.createBindGroup({
    layout: _computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: _bulletStorageBuf } },
      { binding: 1, resource: { buffer: _paramsBuf } },
      { binding: 2, resource: { buffer: _hitBuf } },
    ],
  });
}
```

### 매 프레임 (Compute → Render → Hit 읽기)

```js
async function updateComputeBullets(sp) {
  if (!_computeActive || !GPU) return;

  // Params 업로드
  const params = new Float32Array([
    sp,           // dt
    0.007,        // decay
    rm.x, rm.y, rm.x+rm.w, rm.y+rm.h, // bounds
    P.x, P.y,    // playerPos
    P.r,          // playerR
    0,            // pad
  ]);
  GPU.queue.writeBuffer(_paramsBuf, 0, params);

  // Hit flag 리셋
  GPU.queue.writeBuffer(_hitBuf, 0, new Uint32Array([0]));

  // Compute pass
  const enc = GPU.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(_computePipeline);
  pass.setBindGroup(0, _computeBG);
  pass.dispatchWorkgroups(Math.ceil(_computeCount / 256));
  pass.end();

  // Hit flag → 읽기 버퍼 복사
  enc.copyBufferToBuffer(_hitBuf, 0, _hitReadBuf, 0, 4);
  GPU.queue.submit([enc.finish()]);

  // 비동기 Hit 읽기 (다음 프레임에 적용 — 1프레임 딜레이)
  if (_hitReadBuf.mapState === 'unmapped') {
    _hitReadBuf.mapAsync(GPUMapMode.READ).then(() => {
      const hits = new Uint32Array(_hitReadBuf.getMappedRange())[0];
      _hitReadBuf.unmap();
      if (hits > 0) {
        // CPU 피격 처리
        hurtP(hits * _computeDmgPerBullet);
      }
    });
  }

  // Render pass — _bulletStorageBuf를 vertex로 바인딩
  // (기존 WebGPU 렌더 파이프라인에 인스턴스 추가)
}
```

---

## 충돌판정 전략 비교

| 방법 | 구현 | 정확도 | 지연 | 적합 |
|------|------|--------|------|------|
| **Compute atomicAdd** | WGSL atomic | 완벽 | 1프레임 | Electron (WebGPU) |
| **Occlusion Query** | GL Query | 히트 여부만 (1bit) | 1~2프레임 | WebGL2 |
| **CPU Grid 샘플링** | 1/10 탄만 체크 | 근사 | 0 | 범용 폴백 |
| **readPixels (금지)** | GPU→CPU 전체읽기 | - | stall | 사용 금지 |

### 추천 조합
- **Electron**: Compute Shader (충돌판정 포함, 완전 GPU)
- **브라우저 WebGL2**: Transform Feedback + CPU Grid 샘플링
- **Canvas2D 폴백**: Phase 1 Instanced의 2D 폴백

---

## 적용 순서

| 단계 | 내용 | 의존 |
|------|------|------|
| **Step 1** | Phase 1 Instanced 적용 | GL 변수만 |
| **Step 2** | Canvas2D 폴백 추가 | Step 1 |
| **Step 3** | 스킬 1개에 연결 (테스트) | Step 1 |
| **Step 4** | Phase 2 Transform Feedback | Step 1 검증 후 |
| **Step 5** | Phase 3 Compute (Electron) | GPU 변수 |
| **Step 6** | 충돌판정 통합 | Step 4 or 5 |
| **Step 7** | 기존 projs[] 마이그레이션 | 전체 검증 후 |

### projs[] 마이그레이션 주의

기존 `projs[]`는 Object 배열 + 개별 속성(parryable, rainbow, friendly, el 등)이 있어서
**전부 GPU로 옮기기 어려움**. 적합한 대상:
- 대량 동일탄 (보스 탄막, 악의폭풍, 해골폭풍 등)
- 비주얼 전용 파티클 (히트 불필요)

복잡한 투사체(패링 가능, 속성별 처리)는 기존 projs[] 유지.

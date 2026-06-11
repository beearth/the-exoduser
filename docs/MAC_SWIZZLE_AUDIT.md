# MAC_SWIZZLE_AUDIT — Mac Chrome Skia Graphite BGRA8 Swizzle 진단

**날짜**: 2026-06-11  
**증상**: Mac Chrome (M5 Pro, Skia Graphite + GraphiteDawnMetal)에서 10fps 이하 폭락  
**콘솔**: `"No valid write swizzle for color type 5 with format BGRA8"` + `"ProduceSkia non-existent mailbox"` 매 프레임 폭주  
**윈도우**: 정상 동작  
**color type 5**: Chromium 내부에서 `kBGRA_8888_SkColorType` — Canvas2D backing store의 네이티브 픽셀 포맷

---

## [1] 텍스처 포맷 지정 (texImage2D / texSubImage2D)

모든 texImage2D 호출이 `gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE` 조합 사용. **BGRA internalFormat은 없음.**

| 라인 | 코드 요약 | swizzle 유발 | 위험도 |
|------|-----------|-------------|--------|
| 3700 | `gl.texImage2D(...gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img)` — SpriteBatcher getTex | source가 Image → 낮음 | ⚪ 낮음 |
| 3703 | `refreshTex` — 동일 포맷, Image 소스 | Image → 낮음 | ⚪ 낮음 |
| 4503 | 메인 WebGL2 white texture 1x1 Uint8Array | Uint8Array → 무관 | ⚪ 없음 |
| **4521** | **`GL.texImage2D(...gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src)`** — **메인 _getTex, src는 HTMLCanvasElement/ImageBitmap/Image** | **Canvas → BGRA backing** | 🔴 **높음** |
| 4522 | fallback 1x1 Uint8Array | 무관 | ⚪ 없음 |
| **4658** | **`GL.texImage2D(...gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src)`** — **_uploadCanvasTex, Canvas 전용** | **Canvas → BGRA backing** | 🔴 **높음** |
| **20027** | **`GL.texImage2D(...gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,_mapCvs)`** — 맵 Canvas 프리핀 | **Canvas → BGRA backing** | 🟡 중간 (1회성) |
| **20029** | **`GL.texImage2D(...gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ch.cvs)`** — 맵 청크 Canvas 프리핀 | **Canvas → BGRA backing** | 🟡 중간 (1회성) |

**핵심**: WebGL2 spec에서 `texImage2D(RGBA, RGBA, UNSIGNED_BYTE, canvas)`를 호출하면 브라우저가 Canvas2D backing store (Mac에서 BGRA_8888)를 RGBA로 swizzle해야 함. Skia Graphite Metal 백엔드에서 이 BGRA→RGBA swizzle 경로가 미구현/버그.

---

## [2] Canvas2D를 텍스처 소스로 매 프레임 업로드 (핵심 범인 구간)

| 라인 | 코드 | 호출 빈도 | swizzle 유발 | 위험도 |
|------|------|-----------|-------------|--------|
| **4651-4658** | **`_uploadCanvasTex(src)`** — Canvas를 WebGL 텍스처로 매번 texImage2D | **매 프레임, drawImage(canvas) 호출마다** | **BGRA Canvas → RGBA texImage2D = swizzle 실패** | 🔴 **최고** |
| **4760** | `drawImage` proxy: `if(img instanceof HTMLCanvasElement) _uploadCanvasTex(img)` | 매 프레임 수십~수백 회 | **모든 Canvas drawImage가 이 경로** | 🔴 **최고** |
| **4748** | `_uploadCanvasTex(_txtAtlas)` — 텍스트 아틀라스 Canvas 업로드 | 매 프레임 | BGRA Canvas 업로드 | 🔴 높음 |
| 3843 | `X.drawImage(_bloomCvs,0,0,C.width,C.height)` — 블룸 Canvas 합성 | 3프레임 중 1회 | Proxy X → _uploadCanvasTex | 🔴 높음 |
| 43875 | `X.drawImage(_lightCvs,...)` — 라이팅 Canvas 합성 | 3프레임 중 1회 | Proxy X → _uploadCanvasTex | 🔴 높음 |
| 18584 | `createImageBitmap(_built.cvs)` — 스트리밍 청크 Canvas→ImageBitmap | 비동기, 청크 빌드 시 | ImageBitmap은 GPU-native 가능 → 낮음 | ⚪ 낮음 |
| 7256-7269 | `createImageData` + `putImageData` — torch stamp 등 1회성 전처리 | 초기화 시 1회 | 직접 업로드 아님 → 무관 | ⚪ 없음 |
| 8636-8652 | `getImageData`/`putImageData` — 스프라이트 팔레트 전처리 | 초기화 시 | 1회성 → 무관 | ⚪ 없음 |

**_uploadCanvasTex 호출 경로 분석:**
1. `X.drawImage(canvas소스)` → line 4760 → `_uploadCanvasTex(canvas)` → line 4657-4658 `GL.texImage2D(RGBA,RGBA,UNSIGNED_BYTE,canvas)`
2. 매 프레임 호출 소스: `_bloomCvs`, `_lightCvs`, `_fogCvs`, `_txtAtlas`, 맵 청크 Canvas들, gib Canvas, ice tint Canvas 등
3. **프레임당 Canvas→texImage2D 횟수: 최소 5~20회 이상** (블룸+라이팅+텍스트아틀라스+맵청크+각종 이펙트)

---

## [3] 다중 캔버스 합성 구조

게임은 **6개 이상의 Canvas 레이어**를 z-index로 중첩:

| 라인 | 캔버스 | 컨텍스트 | z-index | 역할 |
|------|--------|----------|---------|------|
| 2177 | `#c` (메인) | WebGL2 (또는 Canvas2D 폴백) | — | 메인 렌더 |
| 2178 | `#fogGL` | WebGL2 (alpha:true, premultiplied) | 0 | 안개 오버레이 |
| 2179 | `#burstCvs` | WebGL2 (alpha:true, premultiplied) | 1 | 파티클 버스트 |
| 2180 | `#ct` | Canvas2D | 2 | 텍스트/UI 오버레이 |
| 51086 | `#boss3dCvs` | THREE.WebGLRenderer (alpha:true) | 5000 | 보스 3D |
| 51087 | `#vfx3dCvs` | THREE.WebGLRenderer (alpha:true) | 4999 | VFX 3D |

**mailbox 공유 문제**: 6개 캔버스가 각각 GPU 텍스처(mailbox)를 가지며, Skia Graphite가 합성할 때 각 Canvas의 backing store를 읽음. BGRA 포맷 Canvas와 RGBA WebGL Canvas가 혼재 → compositor에서 swizzle 실패 → "ProduceSkia non-existent mailbox" 경고.

---

## [4] 컨텍스트 옵션

| 라인 | 컨텍스트 | 옵션 | 위험 요인 |
|------|----------|------|-----------|
| **4469** | **메인 WebGL2** | `alpha:false, premultipliedAlpha:false, powerPreference:'high-performance', preserveDrawingBuffer:false` | **premultipliedAlpha:false** — Graphite Metal은 premultiplied를 기본으로 기대. non-premultiplied 백엔드에서 swizzle 경로 불일치 가능 |
| 3652 | SpriteBatcher WebGL2 | `alpha:true, premultipliedAlpha:true` | 정상 |
| 4572 | Burst WebGL2 | `alpha:true, premultipliedAlpha:true` | 정상 |
| 7169 | THREE.WebGLRenderer (chest3d) | `alpha:true, premultipliedAlpha:false` | premultipliedAlpha:false 주의 |
| 51097 | THREE.WebGLRenderer (boss3d) | `alpha:true` | 기본(premultiplied) |
| 51296 | THREE.WebGLRenderer (vfx3d) | `alpha:true, powerPreference:'high-performance'` | 기본 |
| — | Canvas2D (오프스크린들) | 기본 옵션 (no colorSpace 지정) | **Mac은 P3 디스플레이** — colorSpace 미지정 시 sRGB 기본, 직접 문제는 아니지만 Graphite 내부 변환 경로 추가 |

**colorSpace**: 어떤 Canvas/WebGL 컨텍스트도 `colorSpace`를 명시적으로 지정하지 않음. Mac P3 디스플레이에서 Graphite가 sRGB↔P3 변환을 자동 시도할 수 있으나, 이것 자체가 swizzle 에러의 직접 원인은 아님.

---

## [5] 렌더 백엔드 분기 (WebGPU)

| 라인 | 코드 | 설명 |
|------|------|------|
| 4780 | `const _useWebGPU=(!IS_ELECTRON)&&...get('webgpu')==='1'` | **WebGPU는 ?webgpu=1 파라미터 필요 — 기본 비활성** |
| 4781-4786 | `if(_useWebGPU)...else ok=false` | **Mac에서도 기본 WebGL2 경로** |
| 4313 | `navigator.gpu.getPreferredCanvasFormat()` | Mac에서 `bgra8unorm` 반환 — 그러나 WebGPU 비활성이므로 도달 안 함 |
| 4298 | `device.createTexture({format:'rgba8unorm'})` | WebGPU 텍스처는 rgba8unorm 고정 |
| 4388-4392 | `GPU.queue.copyExternalImageToTexture()` | WebGPU 경로에서는 texImage2D 대신 이것 사용 — Graphite 호환 |

**결론: WebGPU 경로는 기본 비활성. Mac에서 실제 타는 경로는 WebGL2 (line 4468-4557).**  
swizzle 에러는 WebGPU가 아니라 WebGL2 + Graphite Metal 조합에서 발생.

---

## [REPORT] 최종 진단

### A) 가장 유력한 단일 지점

**`_uploadCanvasTex` (line 4651-4658) + ProxyX `drawImage` (line 4758-4760)**

```javascript
// line 4651-4658
function _uploadCanvasTex(src){
  if(_useGPU){const bg=_getTex(src);_setTex(bg);return}
  const tex=_getTex(src);_setTex(tex);
  const prev=_texUploaded.get(src);const ver=src._glVer||0;
  if(!prev||prev.w!==src.width||prev.h!==src.height||prev.v!==ver){
    if(src.width>0&&src.height>0&&src.width<=_glMaxTex&&src.height<=_glMaxTex){
      _flush();GL.bindTexture(GL.TEXTURE_2D,tex);
      try{GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA,GL.RGBA,GL.UNSIGNED_BYTE,src)}catch(e){}}
    _texUploaded.set(src,{w:src.width,h:src.height,v:ver})}}
```

**원인 메커니즘:**
1. Mac Canvas2D backing store = BGRA_8888 (Skia Graphite 기본)
2. `texImage2D(RGBA, RGBA, UNSIGNED_BYTE, canvas)` 호출 시 브라우저가 BGRA→RGBA swizzle 필요
3. Skia Graphite Metal 백엔드에서 이 swizzle 경로 미구현/회귀 → "No valid write swizzle for color type 5 with format BGRA8"
4. 실패 시 CPU 폴백으로 픽셀 단위 변환 → 매 프레임 5~20회 = 10fps 이하
5. "ProduceSkia non-existent mailbox"는 swizzle 실패 후 mailbox texture가 생성 안 되어 compositor가 빈 참조

**프레임당 Canvas→texImage2D 호출 소스:**
- `_txtAtlas` (텍스트 아틀라스) — 매 프레임
- `_bloomCvs` (블룸 Canvas) — 3프레임당 1회
- `_lightCvs` (라이팅 Canvas) — 3프레임당 1회
- `_mapChunks[].cvs` (맵 청크 Canvas) — 시야 내 청크
- `_iceTintC` (빙결 이펙트 Canvas) — 빙결 시
- 각종 gib/gore/split Canvas — 몬스터 사망 시

### B) 수정 방향 (적용 금지 — 제안만)

**방안 1 (권장): Canvas2D → ImageBitmap 변환 후 texImage2D**
```javascript
// _uploadCanvasTex 내부에서 canvas 직접 전달 대신:
createImageBitmap(src, {premultiplyAlpha:'premultiply'}).then(bmp => {
  GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA,GL.RGBA,GL.UNSIGNED_BYTE,bmp);
  bmp.close();
});
```
- ImageBitmap은 GPU-native 포맷으로 사전 변환되므로 Graphite swizzle 경로를 우회
- 단, 비동기라서 기존 동기 렌더 파이프라인 구조 변경 필요

**방안 2 (가벼운 우회): `premultipliedAlpha:true`로 메인 WebGL2 컨텍스트 변경**
```javascript
// line 4469: alpha:false → alpha:true, premultipliedAlpha:false → true
GL=C.getContext('webgl2',{alpha:true,premultipliedAlpha:true,...});
```
- premultiplied 경로가 Graphite에서 더 잘 지원될 수 있음
- 그러나 기존 블렌딩 공식 전체 영향 → 알파 합성 깨질 위험

**방안 3 (근본 해결): Canvas2D 오프스크린 제거, 블룸/라이팅/텍스트를 WebGL FBO로 이관**
- Canvas2D → texImage2D 경로 자체를 없앰
- 가장 확실하지만 공수 최대

**방안 4 (Chromium 회피): Canvas2D에 `willReadFrequently:true` 힌트**
```javascript
// 오프스크린 Canvas 생성 시:
canvas.getContext('2d', {willReadFrequently: true});
```
- CPU 래스터 경로를 강제하여 Graphite GPU 경로 우회
- 성능 약간 저하되지만 swizzle 에러 자체를 피할 수 있음

### C) 수정 시 윈도우/기존 동작 깨질 위험

| 방안 | 위험도 | 설명 |
|------|--------|------|
| 방안 1 (ImageBitmap) | 🟡 중간 | 비동기 전환으로 1프레임 지연 가능, 윈도우에서는 무해하지만 동기→비동기 구조 변경 필요 |
| 방안 2 (premultiplied) | 🔴 높음 | `alpha:false` → `true` 변경 시 Canvas 배경이 투명해지고, 기존 블렌딩 공식(SRC_ALPHA, ONE_MINUS_SRC_ALPHA) 결과 변경. 윈도우에서도 시각적 차이 발생 |
| 방안 3 (FBO 이관) | 🟡 중간 | 구조 대변경이지만 WebGL 내부 완결이라 플랫폼 차이 없음. 단 공수 대비 이슈 |
| 방안 4 (willReadFrequently) | 🟢 낮음 | Canvas2D CPU 폴백 강제 — 윈도우에서도 동작 변화 없음. Mac에서 Canvas2D 연산이 약간 느려질 수 있으나 swizzle CPU 폴백보다는 빠름. **가장 안전한 1차 대응** |

---

## 부록: Canvas 목록 (오프스크린, GPU 업로드 대상)

| 변수 | 용도 | 크기 | 업로드 빈도 |
|------|------|------|-------------|
| `_txtAtlas` | 텍스트 렌더 아틀라스 | 가변 | 매 프레임 |
| `_bloomCvs` | 블룸 패스 | C.width/6 × C.height/6 | 3프레임당 1 |
| `_lightCvs` | 다이나믹 라이팅 | C.width/2 × C.height/2 | 3프레임당 1 |
| `_fogCvs`, `_fogBotCvs`, `_fogTopCvs` | 안개/비네팅 | 가변 | 초기화+리사이즈 |
| `_vignCvs` | 비네팅 | 가변 | 초기화 |
| `_mapChunks[].cvs` | 맵 청크 | 최대 2048×2048 | 청크 진입 시 |
| `_iceTintC` | 빙결 이펙트 | 가변 | 빙결 활성 시 |
| `_gibC` | 고어/기브 처리 | 48×48 | 몬스터 사망 시 |
| light stamps | 조명 스탬프 (13종) | 20~800px | 초기화 시 1회 |

---

*진단 완료. 수정 대기 중.*

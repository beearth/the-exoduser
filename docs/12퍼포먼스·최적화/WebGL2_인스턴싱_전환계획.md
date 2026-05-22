# WebGL2 인스턴싱 전환 계획 (2026-05-21)

> Canvas2D → WebGL2 인스턴싱 하이브리드 전환. 기존 DOM HUD 유지, 월드 렌더만 GPU 전환.

## 현재 렌더 구조

```
draw() — 39710~47175
  ├─ S0: 배경 패럴랙스 (drawImage ×30~50)
  ├─ S1: 맵 청크 캐시 (drawImage ×20~40)
  ├─ S2: 보스 아레나 FX (arc/fill 절차적)
  ├─ S3: MAP_OBJS (drawImage + 절차적 혼합)
  ├─ S4: 소환굴 (VFX 시트 drawImage)
  ├─ S5: 적 렌더 (아틀라스 drawImage ×80~100) ← 핵심 병목
  ├─ S5b: 적 투사체 3패스 (drawImage + 절차적)
  ├─ S6: 장판/스킬 FX (arc/fill 절차적)
  ├─ S7: pProjs + 보호막 + 펫 (save/rotate/drawImage/restore ×100+)
  ├─ 후처리: bloom/torch/chromatic (오프스크린 캔버스)
  └─ HUD: DOM (이미 분리됨)
```

### 호출 통계 (매 프레임)

| API | 호출 수 | 비고 |
|-----|---------|------|
| drawImage | ~227 | 배경/맵/적/투사체 |
| save/restore | ~231/231 | 회전/알파 변경마다 |
| arc+fill | ~1000 | 절차적 이펙트 |
| fillText | ~115 | 월드 텍스트 (HUD는 DOM) |
| beginPath | ~1500~2000 | 절차적 경로 |

### 텍스처 소스

| 종류 | 예시 |
|------|------|
| 보스 아틀라스 | atlas_bosses.png (8방향 대형) |
| 몬스터 아틀라스 | _ch8Atlas (스테이지별) |
| 투사체 아틀라스 | _projAtlas (이미 존재) |
| VFX 시트 | void_black 등 (스프라이트 시트) |
| MAP_OBJS 스프라이트 | _OBJ_SPR[type] (개별 이미지) |
| 오프스크린 캔버스 | bloom/torch/맵캐시 |

---

## 전환 전략: 하이브리드 (Canvas2D + WebGL2 공존)

### 왜 하이브리드인가

- **전면 WebGL2 전환**은 fillText/arc/절차적 렌더 전부 재구현 필요 (2~4주)
- **하이브리드**는 대량 스프라이트(적/투사체)만 WebGL2, 나머지 Canvas2D 유지 (3~5일)
- 적 렌더(S5)가 전체 drawImage의 ~40%이므로 여기만 GPU화해도 효과 큼

### 구조

```
<canvas id="glCanvas">  ← WebGL2 (적/투사체 배칭)
<canvas id="C">          ← Canvas2D (맵/FX/UI/후처리) — 기존 그대로
```

- glCanvas를 C 뒤에 겹쳐서 투명 합성
- 또는 glCanvas에 적/투사체 렌더 후 C에 drawImage로 합성 (더 안전)

---

## PHASE별 계획

### PHASE A: 스프라이트 배처 인프라 (1일)

**목표**: WebGL2 인스턴스드 스프라이트 배처 생성

```
SpriteBatcher:
  - init(gl, maxSprites=2000)
  - begin(atlas, blendMode)
  - push(x, y, w, h, srcX, srcY, srcW, srcH, angle, alpha, tint)
  - flush() → drawArraysInstanced
  - end()
```

**구현 상세**:
- 버텍스 셰이더: 쿼드 4정점 + 인스턴스 attribute (pos, uv, angle, alpha, tint)
- 프래그먼트 셰이더: texture2D + alpha + tint
- 인스턴스 버퍼: Float32Array(maxSprites × stride)
- 카메라 유니폼: u_viewProj (ortho + 카메라 오프셋)

**파일**: `_spriteBatcher` 객체를 game.html 내 인라인

### PHASE B: 적 렌더 GPU 전환 (2일)

**목표**: S5 적 렌더를 SpriteBatcher로 교체

**현재 흐름**:
```javascript
for(let _ei=0; _ei<ens.length; _ei++){
  const e=ens[_ei];
  // 뷰포트 체크
  // save → translate → scale → globalAlpha → drawImage(아틀라스) → restore
}
```

**전환 후**:
```javascript
_spBatch.begin(_ch8Atlas.img, 'normal');
for(let _ei=0; _ei<ens.length; _ei++){
  const e=ens[_ei];
  // 뷰포트 체크
  _spBatch.push(e.x, e.y, sw, sh, sx, sy, cw, ch, 0, sa, tint);
}
_spBatch.flush();
// Canvas2D에 합성
X.drawImage(glCanvas, 0, 0);
```

**주의사항**:
- 보스(atlas_bosses)와 일반몹(_ch8Atlas)은 아틀라스가 다름 → 2회 flush
- 구울/슬라임은 절차적 렌더 → Canvas2D 유지 (GPU화 대상 아님)
- 엘리트 이름/오라 텍스트 → Canvas2D 유지
- 빙결/독/상태 오버레이 → Canvas2D 유지 (tint로 일부 대체 가능)

### PHASE C: 투사체 GPU 전환 (1일)

**목표**: 적 투사체(projs) + 플레이어 투사체(pProjs) 중 아틀라스 기반만 GPU화

**대상**:
- _projAtlas 사용 투사체 → SpriteBatcher
- 프로시저럴 투사체 (독칼, 번개 등) → Canvas2D 유지

### PHASE D: 파티클 GPU 전환 (1일)

**목표**: poolRender 파티클을 GPU 포인트 스프라이트로

**현재**: fillRect/arc 80개 렌더캡
**전환 후**: gl.POINTS + pointSize + 텍스처 → 1000개 풀 전부 렌더 가능

### PHASE E: 후처리 GPU 전환 (선택)

**목표**: bloom/torch를 프래그먼트 셰이더로

**현재**: 오프스크린 캔버스 + drawImage 합성
**전환 후**: FBO + 블러 셰이더 (가우시안 2패스)

---

## 셰이더 설계

### 버텍스 셰이더 (인스턴스드 스프라이트)

```glsl
#version 300 es
// 쿼드 정점 (4개)
in vec2 a_pos;       // (0,0)(1,0)(0,1)(1,1)
// 인스턴스 데이터
in vec4 a_destRect;  // x, y, w, h (월드 좌표)
in vec4 a_srcRect;   // sx, sy, sw, sh (텍스처 UV, 0~1)
in float a_angle;    // 회전 라디안
in float a_alpha;    // 투명도
in vec3 a_tint;      // 틴트 색상

uniform mat3 u_viewProj; // 카메라 + 줌

out vec2 v_uv;
out float v_alpha;
out vec3 v_tint;

void main(){
  // 로컬 좌표
  vec2 local = (a_pos - 0.5) * a_destRect.zw;
  // 회전
  float c = cos(a_angle), s = sin(a_angle);
  vec2 rotated = vec2(local.x*c - local.y*s, local.x*s + local.y*c);
  // 월드 좌표
  vec2 world = rotated + a_destRect.xy;
  // 카메라 변환
  vec3 clip = u_viewProj * vec3(world, 1.0);
  gl_Position = vec4(clip.xy, 0.0, 1.0);
  // UV
  v_uv = a_srcRect.xy + a_pos * a_srcRect.zw;
  v_alpha = a_alpha;
  v_tint = a_tint;
}
```

### 프래그먼트 셰이더

```glsl
#version 300 es
precision mediump float;
in vec2 v_uv;
in float v_alpha;
in vec3 v_tint;
uniform sampler2D u_tex;
out vec4 fragColor;

void main(){
  vec4 col = texture(u_tex, v_uv);
  col.rgb *= v_tint;
  col.a *= v_alpha;
  if(col.a < 0.01) discard;
  fragColor = col;
}
```

---

## 인스턴스 버퍼 레이아웃

```
stride = 14 floats = 56 bytes per sprite

offset 0:  destRect (x, y, w, h)     — 4 float
offset 16: srcRect  (sx, sy, sw, sh) — 4 float  
offset 32: angle                      — 1 float
offset 36: alpha                      — 1 float
offset 40: tint     (r, g, b)        — 3 float
offset 52: padding                    — 1 float (정렬)

2000 sprites × 56 bytes = 112KB 버퍼
```

---

## 합성 방식

### 방법 1: glCanvas → Canvas2D drawImage (권장)

```javascript
// WebGL2 렌더 (적/투사체)
_spBatch.begin(atlas); 
// ... push sprites ...
_spBatch.flush();

// Canvas2D에 합성 (기존 코드 흐름에 삽입)
X.drawImage(glCanvas, 0, 0);

// 이후 Canvas2D로 절차적 FX/텍스트/후처리 계속
```

**장점**: 기존 코드 최소 변경, Canvas2D 레이어 순서 보존
**단점**: drawImage(glCanvas) 1회 비용 (~0.5ms)

### 방법 2: 공유 캔버스 (Canvas2D + WebGL 불가)

브라우저 제약: 같은 캔버스에 getContext('2d')와 getContext('webgl2') 동시 불가

---

## 예상 효과

| 항목 | Canvas2D (현재) | 하이브리드 (PHASE B 후) |
|------|----------------|----------------------|
| 적 500마리 렌더 | drawImage ×500 + save/restore ×500 | **drawArraysInstanced ×2** + drawImage(합성) ×1 |
| 적 렌더 시간 | ~2.5ms | **~0.3ms** |
| 투사체 300발 (PHASE C) | drawImage ×300 + save/restore ×300 | **drawArraysInstanced ×1** |
| 투사체 렌더 시간 | ~1.5ms | **~0.15ms** |
| 총 draw 시간 | ~5ms | **~2ms** |
| FPS 500적 | 58~60 | **60 안정 + 3ms 여유** |
| FPS 1000적 (확장) | 불가 | **55~60 가능** |

---

## 위험 요소 및 대응

| 위험 | 확률 | 대응 |
|------|------|------|
| WebGL2 컨텍스트 생성 실패 | 낮음 (NW.js) | Canvas2D 폴백 유지 |
| 아틀라스 UV 오차 | 중간 | 0.5px 텍셀 마진 |
| 블렌딩 차이 (premultiplied alpha) | 높음 | gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA, true) |
| 적 상태 오버레이 (빙결 틴트 등) | 중간 | tint uniform으로 처리 or Canvas2D 폴백 |
| 줌 스케일 반영 | 낮음 | u_viewProj에 스케일 포함 |
| 기존 비주얼 깨짐 | 중간 | A/B 비교 테스트 (Canvas2D vs GPU 토글) |

---

## 일정

| PHASE | 내용 | 기간 | 전제조건 |
|-------|------|------|---------|
| A | SpriteBatcher 인프라 | 1일 | 없음 |
| B | 적 렌더 GPU 전환 | 2일 | A 완료 |
| C | 투사체 GPU 전환 | 1일 | A 완료 |
| D | 파티클 GPU (선택) | 1일 | A 완료 |
| E | 후처리 GPU (선택) | 1일 | A+B 완료 |
| **총** | | **3~6일** | |

**최소 MVP**: PHASE A+B (3일) → 적 렌더만 GPU화해도 가장 큰 효과

---

## 토글 설계

```javascript
OPT.gpuRender = true;  // 설정에서 토글 가능
// 적 렌더 분기
if(OPT.gpuRender && _spBatch.ready){
  _renderEnsGPU();  // WebGL2 인스턴싱
} else {
  _renderEnsC2D();  // 기존 Canvas2D (폴백)
}
```

Canvas2D 코드는 **삭제하지 않고** 폴백으로 유지. GPU 문제 시 즉시 전환.

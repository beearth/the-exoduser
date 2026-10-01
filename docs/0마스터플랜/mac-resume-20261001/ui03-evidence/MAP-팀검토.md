# MAP — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:07:02.538Z

정확성 한 건을 잇기 위해 `prop_pool.png` 원본을 다시 그림으로 확인합니다(크롭 윈도우가 검은 빈 영역/투명 배경을 포함하는지 판정 목적).

## 2026-10-01T06:09:25.337Z

`prop_pool.png` 원본을 다시 그림으로 재확인했습니다. 아래는 **후보/검증 코드 제안만**이며, 이번 턴에 게임·렌더·파일/Git 변경, 코드 실행, 새 팀/PC접속/보안·신뢰 변경은 하지 않았습니다. 잠정 좌표는 확정·채택하지 않습니다.

## 1) 원본 그림 판정 — 크롭이 검은 빈 영역/배경을 포함하는지
- 구성: 가로로 긴 타원형 독성 웅덩이. **중앙은 녹색 독액(불투명)** — 뿌리/뼈 재질이 **아님**. 뿌리+뼈+이끼는 바깥 **테두리 밴드만** 차지.
- **투명(알파 0, "검은 빈 영역")은 네 모서리**에 집중: 좌상·우상·좌하·우하 코너. 좌측 중앙엔 뿌리가 바깥으로 들쭉날쭉 돌출해 알파 경계가 불규칙.
- 따라서 크롭 윈도우의 오염 위험은 두 방향:
  - **바깥/모서리로 이동** → 투명 코너(검은 빈 영역) 포함.
  - **위/안쪽으로 이동(y 작아지고 x가 중앙)** → 녹색 독액(오재질) 포함(투명은 아니나 테두리가 아님).
- `buildRim`의 현재 크롭 `(200,530,440,120)`은 **하단 밴드**로, 뿌리 엮임 위 거의 불투명 → 검은 빈 영역/중앙 독액 **미포함(검증영역)**. 직전 제안 중 "세로 상향 슬라이드/상단·좌하 아크"는 위 두 위험에 걸릴 수 있어 **실측 전 확정 불가**. 가장 안전한 변주는 **같은 하단 밴드에서 x만 수평 슬라이드**(sy·sh 고정 → 수직 알파 프로파일 동일, x 양끝만 확인).

## 2) buildRim/draw 전용 최소 패치 후보 (305앵커·rng·법선·92 보존)
`build()`는 **한 글자도 수정하지 않습니다** — 305 앵커·`rng(20261001)` 호출 순서·far-field 법선(`rot`)·`ROOT_GAP=92`가 모두 그대로 유지됩니다. variant 선택은 **draw 시점에 좌표 해시로만**(=`R()` 호출 0) 합니다.

```js
// ===== MAP-020 뿌리 반복 완화 — buildRim/draw 전용 최소 패치 후보 (PROVISIONAL, 미채택) =====
// build()·roots·rng(20261001)·ROOT_GAP=92·법선 계산은 수정하지 않음.
// RIM_CROPS[0]은 기존 검증 크롭. [1],[2]는 '잠정' — verify-prop-pool-crops.cjs 통과 전 채택 금지.
const RIM_CROPS = [
  [200, 530, 440, 120], // 0: 기존 검증(하단 밴드)
  [ 80, 530, 440, 120], // 1: 잠정 — 같은 밴드 좌측 슬라이드(sy/sh 동일) → 양끝 알파 검증 필요
  [320, 530, 440, 120]  // 2: 잠정 — 같은 밴드 우측 슬라이드(sy/sh 동일) → 양끝 알파 검증 필요
];
let rims = null; // 기존 단일 rim → 변주 배열로 확장

// 기존 buildRim의 마스크 파이프라인을 그대로 함수화(피처/암부/그라디언트 수치 동일)
function buildStrip(sx, sy, sw, sh){
  const c = cv(440,120), rc = c.getContext('2d');
  rc.drawImage(pool, sx, sy, sw, sh, 0, 0, 440, 120);
  rc.globalCompositeOperation = 'destination-in';
  const rh = rc.createLinearGradient(0,0,440,0);
  rh.addColorStop(0,'rgba(0,0,0,0)'); rh.addColorStop(.16,'#000'); rh.addColorStop(.84,'#000'); rh.addColorStop(1,'rgba(0,0,0,0)');
  rc.fillStyle = rh; rc.fillRect(0,0,440,120);
  const rv = rc.createLinearGradient(0,0,0,120);
  rv.addColorStop(0,'rgba(0,0,0,0)'); rv.addColorStop(.26,'#000'); rv.addColorStop(.9,'#000'); rv.addColorStop(1,'rgba(0,0,0,0)');
  rc.fillStyle = rv; rc.fillRect(0,0,440,120);
  rc.globalCompositeOperation = 'source-atop';
  rc.fillStyle = 'rgba(10,7,8,.12)'; rc.fillRect(0,0,440,120);
  return c;
}

// 기존 buildRim() 교체: 이름/호출부 유지, 변주 N장 생성. rim은 하위호환으로 [0] 유지.
function buildRim(){
  rims = RIM_CROPS.map(function(c){ return buildStrip(c[0],c[1],c[2],c[3]); });
  rim = rims[0];
}

// draw()의 뿌리 루프만 교체 (:90-93). 선택은 r.x,r.y 해시 → rng 미사용, build() 불변.
// (상단 분기 ':89' 그대로: if(!rim){ if(!(pool.complete&&pool.naturalWidth>1)) return; buildRim(); })
const NV = rims ? rims.length : 1;
for (let i = 0; i < roots.length; i++){
  const r = roots[i];
  if (r.x < x0-90 || r.x > x1+90 || r.y < y0-90 || r.y > y1+90) continue;
  // 좌표 공간 해시로 변주 선택: ABAB 띠 방지, R() 호출 0, 305 배치·scale·flip 불변
  const vi = NV > 1 ? ((((r.x|0)*73856093) ^ ((r.y|0)*19349663)) >>> 0) % NV : 0;
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.rotate(r.rot);
  ctx.scale(r.flip ? -r.s : r.s, r.s);
  ctx.drawImage(rims ? rims[vi] : rim, -220, -46);
  ctx.restore();
  lastDraws++;
}
```

보존 근거: `roots` 생성(`:46-58`)·`R()` 3콜 순서(스킵 `R()<.35` → scale → flip)·법선 `rot`·`ROOT_SCALE=.42`·`ROOT_GAP=92`·배치 오프셋 `(-220,-46)`·마스크 수치 전부 불변. 추가 비용은 B 최초 프레임에 440×120 소형 래스터 N장 1회뿐이며 per-root `drawImage` 수(=`lastDraws`)는 동일.

## 3) 독립 검증 스크립트 (총괄이 실행 — 이번 턴 미실행)
치수·alpha bbox·중앙 독액 오염을 **도구상 측정할 수 없어**, 검증은 아래 Node/Canvas 코드로 총괄에 인계합니다. 읽기 전용(에셋 미변경)이며, 모든 크롭이 **경계 내 + 투명(검은 빈 영역) 미포함 + 녹색 독액 미포함**인지 PASS/FAIL로 판정합니다. 통과 전에는 `RIM_CROPS[1],[2]`를 **확정·채택하지 마세요**.

```js
// verify-prop-pool-crops.cjs — 읽기 전용 검증 (총괄 실행용, 본 세션 미실행)
// 선행: npm i canvas   (node-canvas). 에셋은 읽기만, 수정 없음.
// 실행: node verify-prop-pool-crops.cjs
const path = require('path');
const { loadImage, createCanvas } = require('canvas');

const SRC = path.join(__dirname, 'assets/map/ch1/collision/prop_pool.png');
const RIM_CROPS = [        // ch1-boundary-edge.js 후보와 동일하게 유지할 것
  [200, 530, 440, 120],    // 0 기존 검증
  [ 80, 530, 440, 120],    // 1 잠정
  [320, 530, 440, 120]     // 2 잠정
];
// 임계값(필요 시 총괄이 조정)
const TH = {
  transpFrac: 0.02,  // 알파<8 픽셀 비율 상한(검은 빈 영역 허용치)
  greenFrac:  0.06,  // 중앙 독액(녹색·고채도) 비율 상한(오재질 허용치)
  minOpaque:  0.80   // 불투명(알파>200) 최소 비율
};

(async () => {
  const img = await loadImage(SRC);
  const W = img.width, H = img.height;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  console.log(`prop_pool.png = ${W} x ${H}`);

  let allPass = true;
  for (let n = 0; n < RIM_CROPS.length; n++){
    const [sx, sy, sw, sh] = RIM_CROPS[n];
    const inBounds = sx >= 0 && sy >= 0 && sx + sw <= W && sy + sh <= H;
    if (!inBounds){
      console.log(`crop#${n} [${sx},${sy},${sw},${sh}]  FAIL: OUT OF BOUNDS (img ${W}x${H})`);
      allPass = false; continue;
    }
    const d = x.getImageData(sx, sy, sw, sh).data;
    let total = 0, transp = 0, opaque = 0, green = 0;
    for (let p = 0; p < d.length; p += 4){
      const r = d[p], g = d[p+1], b = d[p+2], a = d[p+3];
      total++;
      if (a < 8) transp++;
      if (a > 200){
        opaque++;
        // 녹색 독액 추정: G가 R·B보다 뚜렷이 크고 밝은 픽셀
        if (g > 90 && g - r > 25 && g - b > 25) green++;
      }
    }
    const transpFrac = transp / total;
    const opaqueFrac = opaque / total;
    const greenFrac  = opaque ? green / opaque : 0;
    const pass = transpFrac <= TH.transpFrac && greenFrac <= TH.greenFrac && opaqueFrac >= TH.minOpaque;
    allPass = allPass && pass;
    console.log(
      `crop#${n} [${sx},${sy},${sw},${sh}] ` +
      `투명=${(transpFrac*100).toFixed(2)}% 불투명=${(opaqueFrac*100).toFixed(2)}% ` +
      `녹색(오재질)=${(greenFrac*100).toFixed(2)}%  => ${pass ? 'PASS' : 'FAIL'}`
    );
  }
  console.log(allPass ? 'ALL PASS — 좌표 확정 검토 가능' : 'FAIL 포함 — 좌표 확정·채택 금지');
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error('검증 실패:', e.message); process.exit(2); });
```

- 의존성 없이 치수만 빠르게 볼 때: `sips -g pixelWidth -g pixelHeight assets/map/ch1/collision/prop_pool.png` (읽기 전용). alpha/녹색 판정은 위 Node 스크립트 필요.
- 임계값(`transpFrac/greenFrac/minOpaque`)은 총괄이 baseline `crop#0`의 출력값을 기준선으로 보정 권장(0번이 FAIL 나오면 임계값부터 조정).

## 4) 미실행 제약 / 마감
- 본 세션: 읽기 도구만 사용. **코드 미실행, 게임·렌더 미실행, 파일/Git/HTML 미수정, 새 에셋 미생성, 새 팀/PC접속/보안·신뢰 변경 없음.**
- `RIM_CROPS[1],[2]`와 해시 선택은 **후보**일 뿐 — `verify-prop-pool-crops.cjs` ALL PASS + 305 배치 전후 해시 동일 + 경계 모듈 단독 RGBA diff(mode 0/A 차이 0) 확인 후에만 총괄이 채택 판단.
- MAP-020 전체는 **RETOUCH 유지**(줌 절단만 기존 PASS), 뿌리 반복·M5 전체 보행 경로 미확정. 정확성 한 건(크롭 좌표 검증 경로 확정) 인계 완료로 **종료**합니다.

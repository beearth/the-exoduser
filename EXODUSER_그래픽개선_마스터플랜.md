# THE EXODUSER — 그래픽 개선 마스터 플랜
## "동그라미 지옥"에서 "핵슬 탄막" 비주얼로

---

## 📊 현재 상태 진단

### 렌더링 파이프라인 (game.html 8,154줄 기준)

```
[Canvas 2D API 호출] → [WebGL2 프록시 배칭] → [GPU 렌더]
```

| 구성요소 | 현재 상태 | 평가 |
|---------|----------|------|
| WebGL2 프록시 | ✅ 배칭 렌더러 (8192 쿼드/배치) | 좋음 |
| 텍스트 아틀라스 | ✅ 2048×512 캐시 (600개 엔트리) | 좋음 |
| 맵 렌더링 | ✅ 오토타일+노이즈, 오프스크린 캐시 | **훌륭함** |
| 파티클 시스템 | ✅ 500개 풀, fillRect 기반 | 괜찮음 |
| 적 렌더링 | ❌ **원형+속성링** (arc+stroke) | **핵심 문제** |
| 보스 렌더링 | ⚠️ 원형+눈+이펙트 | 구조는 있음 |
| 투사체 렌더링 | ✅ 빨간콩/파란콩/화살 차별화 | 나쁘지 않음 |
| 플레이어 | ✅ 스프라이트 이미지 (idle/action) | 있음 |
| 궁수 적 | ✅ 4프레임 스프라이트시트 | 있음 |
| 포스트프로세싱 | ⚠️ 비네팅만 존재 | 부족 |
| 히트 피드백 | ✅ 히트스탑+셰이크+슬로모 | 좋음 |

### 핵심 문제 요약

**"적이 동그라미다."** 이게 전부야. 맵은 예쁘고, 투사체는 괜찮고, 이펙트도 있는데, **화면의 80%를 차지하는 적이 색칠한 원**이니까 전체가 구려 보인다.

궁수(etype 1)에 4프레임 스프라이트가 있는데 이것만 봐도 다른 적이랑 비주얼 격차가 심하다. **스프라이트가 있으면 즉시 다른 게임이 된다**는 증거.

### 성능 제약

- 적 150마리 시 30fps 이하 (최적화 전 기준)
- O(n²) 최적화 후에도 GPU 드로우콜이 병목 가능
- WebGL 프록시 한계: fillStyle 변경마다 배치 브레이크
- 스프라이트 drawImage는 배치 가능 (같은 텍스처면 연속 쿼드)

---

## 🎯 목표: "탄막 핵슬" 비주얼

참고 게임 비주얼 레벨:
- **Vampire Survivors**: 32×32 스프라이트 + 이펙트 밀도 → 성공
- **Hades**: 스프라이트 + 화려한 이펙트 레이어 → 업계 최고
- **동방 프로젝트**: 단순 스프라이트 + 빛나는 탄환 = "탄막"
- **Dead Cells**: 스프라이트 + 조명 + 파티클 = 인디 명작

**THE EXODUSER 타깃: Dead Cells의 70% 비주얼, Vampire Survivors의 물량감**

---

## 🔧 개선 단계 (성능 영향 최소 → 최대 순서)

---

### 1단계: 제로코스트 — 색감·글로우·피드백 (성능 영향 0%)

지금 코드에서 **숫자만 바꿔도** 즉시 좋아지는 것들.

#### 1-1. 적 본체 색상 체계 재설계

현재: 모든 적이 칙칙한 단색 (etype별 col)
문제: 적 타입 구분이 안 됨, 전체적으로 어둡고 칙칙

```
현재 색상 (추정):
근접(0): #cc4444 (칙칙한 빨강)
궁수(1): 스프라이트
돌격(2): #ffaa00 (주황)
떼(3):   #44aa44 (녹색)
탱커(4): #888888 (회색)
자폭(5): #ff6600 (주황)
방패(6): #4466cc (파랑)
리치(7): #8833cc (보라)
화약(8): #cc8800 (갈색)
주술(9): #aa44cc (보라)

→ 개선 방향: 채도 UP, 명도 차이 확대, 타입별 톤 확실히 분리
```

핵슬/탄막 게임은 **네온톤**이 핵심이다. 적이 빛나야 "와 화려하다"가 나옴.

#### 1-2. 엘리트/보스 글로우 강화

현재 보스 글로우(line 6744):
```javascript
X.globalAlpha=sa*.2;X.fillStyle=e.col;
X.beginPath();X.arc(e.x,e.y,e.r+5,0,Math.PI*2);X.fill();
```

이건 너무 약함. **다중 레이어 글로우**로 교체:
```javascript
// 외곽 글로우 (넓고 연함)
X.globalAlpha=.08;X.fillStyle=e.col;
X.beginPath();X.arc(e.x,e.y,e.r*2.5,0,Math.PI*2);X.fill();
// 중간 글로우 (중간)
X.globalAlpha=.15;
X.beginPath();X.arc(e.x,e.y,e.r*1.8,0,Math.PI*2);X.fill();
// 내곽 글로우 (밝고 좁음)
X.globalAlpha=.25;
X.beginPath();X.arc(e.x,e.y,e.r*1.3,0,Math.PI*2);X.fill();
```

이것만으로 보스가 "빛나는 존재"가 됨. arc 3개 추가 비용은 미미.

#### 1-3. 투사체 트레일 강화

현재 일반탄은 트레일 없음. 빨간콩/파란콩만 있음.
**모든 투사체에 1줄짜리 트레일** 추가:
```javascript
X.globalAlpha=.3;X.strokeStyle=pc;X.lineWidth=_ps*1.5;
X.beginPath();X.moveTo(p.x,p.y);
X.lineTo(p.x-p.vx*6,p.y-p.vy*6);X.stroke();
```

탄막 게임 느낌의 핵심 = 탄환 뒤에 꼬리. 이 1줄 추가로 투사체 밀도감 2배.

#### 1-4. 피격 플래시 (화면 전체)

현재: 셰이크+히트스탑은 있는데 **화면 플래시**가 없음.
강한 타격 시 흰색/빨간색 순간 플래시:

```javascript
// draw() 끝에 추가
if(G._flashT>0){
  X.globalAlpha=G._flashT*.15;
  X.fillStyle=G._flashCol||'#ffffff';
  X.fillRect(0,0,C.width,C.height);
  G._flashT-=sp;
}
```

hurtE에서 강타 시 `G._flashT=3;G._flashCol='#ff4400';` 세팅.
보스 광역 패턴에서 `G._flashT=5;G._flashCol='#ffffff';` 세팅.

**비용: fillRect 1회/프레임 (사실상 0)**

---

### 2단계: 스프라이트 교체 — 핵심 비주얼 점프 (성능 영향 긍정적)

**가장 큰 임팩트. 이걸 하면 게임이 완전히 달라짐.**

#### 2-1. 스프라이트 시스템이 이미 있다

현재 코드에 **이미 작동하는 구조**가 있음:
- 플레이어: `_playerImg` → `_pS` (idle), `_playerActImg` → `_aS` (action)
- 궁수: `_archerFrames[4]` → 4프레임 애니메이션
- 적 캐시: `_getESpr(col, el, r)` → 오프스크린 캔버스 drawImage 1회

**핵심: `_getESpr` 시스템을 확장하면 된다.**

현재 _getESpr는 원형+속성링을 오프스크린에 그리고 캐싱.
이걸 **스프라이트 이미지 기반**으로 바꾸면:

```javascript
// 현재 (원형)
function _getESpr(col,el,r){
  // ... arc + stroke → 캔버스 캐시
}

// 개선 (스프라이트)
const _eSprSheets = {}; // etype → Image (스프라이트시트)
function _getESpr(etype, el, r, frame){
  const k = etype+'_'+el+'_'+r+'_'+frame;
  let c = _eSpCache.get(k);if(c) return c;
  // 스프라이트시트에서 해당 프레임 잘라서 캐시
  const sheet = _eSprSheets[etype];
  if(!sheet) return _getECircle(col,el,r); // 폴백: 원형
  c = document.createElement('canvas');
  // ... 시트에서 프레임 추출, 속성 색상 틴팅
  _eSpCache.set(k, c); return c;
}
```

**성능 영향: 오히려 좋아짐.** 현재 원형 적은 arc+stroke+fill = 3~5 드로우콜.
스프라이트 drawImage = 1 드로우콜. **적당 렌더 비용 60% 감소.**

#### 2-2. 필요한 스프라이트 에셋

GenSpark으로 생성 (이미 v3.0 프롬프트 가이드 만들어둠):

| etype | 이름 | 스프라이트 요구 | 프레임 수 | 크기 |
|-------|------|---------------|---------|------|
| 0 | 근접 보병 | idle 걷기 | 4프레임 | 32×32 |
| 1 | 궁수 | ✅ 이미 있음 | 4프레임 | 있음 |
| 2 | 돌격병 | idle + 돌격 | 4+2 | 32×32 |
| 3 | 떼거리 | 작은 idle | 2프레임 | 16×16 |
| 4 | 탱커 | 느린 idle | 4프레임 | 48×48 |
| 5 | 자폭 | idle + 깜빡 | 4프레임 | 24×24 |
| 6 | 방패기사 | idle + 방패 | 4프레임 | 40×40 |
| 7 | 리치 | 부유 idle | 4프레임 | 36×36 |
| 8 | 화약병 | idle | 4프레임 | 28×28 |
| 9 | 주술사 | 채널링 idle | 4프레임 | 28×28 |
| Boss | 보스 | idle+공격+패턴 | 8~12 | 64×64 |

**총 에셋: 약 42프레임 (보스 제외) + 보스 12프레임 = 54프레임**
GenSpark 비용: 약 50~70크레딧 (스프라이트시트 형태)

#### 2-3. 스프라이트 로딩 패턴 (궁수 코드 그대로 복제)

```javascript
// 궁수와 동일한 패턴 — 이미 검증됨
const _meleeFrames=[]; let _meleeReady=false;
const _meleeRaw=new Image(); _meleeRaw.src='img/melee_enemy.png';
_meleeRaw.onload=()=>{
  const fw=~~(_meleeRaw.naturalWidth/4), fh=_meleeRaw.naturalHeight;
  for(let i=0;i<4;i++){
    const oc=document.createElement('canvas');oc.width=fw;oc.height=fh;
    const ox=oc.getContext('2d');ox.drawImage(_meleeRaw,i*fw,0,fw,fh,0,0,fw,fh);
    // 배경 제거 (체크무늬/흰배경 → 투명)
    const id=ox.getImageData(0,0,fw,fh), d=id.data;
    for(let p=0;p<d.length;p+=4){
      const avg=(d[p]+d[p+1]+d[p+2])/3;
      if(avg>180&&Math.abs(d[p]-d[p+1])<15)d[p+3]=0;
    }
    ox.putImageData(id,0,0); _meleeFrames.push(oc);
  }
  _meleeReady=true;
};
```

**이 패턴을 10개 etype에 복붙하면 끝.** 궁수가 이미 돌아가고 있으니 100% 안전.

#### 2-4. 속성 틴팅

같은 스프라이트를 속성별로 색 입히기:
```javascript
// 스프라이트에 속성 색상 오버레이
function tintSprite(src, tintColor, alpha=0.3){
  const c=document.createElement('canvas');
  c.width=src.width; c.height=src.height;
  const ctx=c.getContext('2d');
  ctx.drawImage(src, 0, 0);
  ctx.globalCompositeOperation='source-atop';
  ctx.globalAlpha=alpha;
  ctx.fillStyle=tintColor;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}
```

속성(화/빙/뇌/암/성) 5종 × 10 etype × 4프레임 = 200개 캐시.
한 번 생성하면 재사용. 메모리 약 3~5MB (32×32 캔버스 200개).

---

### 3단계: 포스트프로세싱 — "분위기" 만들기 (성능 영향 중간)

#### 3-1. 블룸 (Bloom) — 가짜 버전

진짜 블룸은 다운샘플+블러+합성이라 비쌈. **가짜 블룸**으로 90% 효과:

```javascript
// draw() 마지막에 추가
// 방법: additive 블렌딩으로 밝은 부분 번지기
const _bloomCvs=document.createElement('canvas');
_bloomCvs.width=C.width/4; _bloomCvs.height=C.height/4; // 1/4 해상도
const _bloomCtx=_bloomCvs.getContext('2d');

function drawBloom(){
  // 1) 메인 캔버스를 1/4 크기로 축소 (자동 블러 효과)
  _bloomCtx.drawImage(C, 0, 0, _bloomCvs.width, _bloomCvs.height);
  // 2) additive로 메인 캔버스에 합성
  X.save();
  X.globalCompositeOperation='lighter';
  X.globalAlpha=0.15; // 블룸 강도
  X.drawImage(_bloomCvs, 0, 0, C.width, C.height);
  X.restore();
}
```

**문제점**: WebGL 프록시가 globalCompositeOperation을 무시함 (line 918).
**해결**: 블룸은 GL flush 후에 별도 2D 컨텍스트로 처리하거나,
WebGL 셰이더에 additive 패스 추가.

**현실적 대안 — 개별 오브젝트 글로우**:
보스/엘리트/투사체에만 큰 반투명 원을 그리는 현재 방식을 강화.
이게 오히려 성능 좋고 제어 쉬움. "선택적 블룸".

#### 3-2. 색수차 (Chromatic Aberration) — 피격 시

강한 피격 시 RGB 채널 분리 효과. 매 프레임이 아니라 **이벤트 트리거**:

```javascript
// 보스 피격/광역 패턴 시만 3~5프레임 활성화
if(G._chromaT>0){
  G._chromaT-=sp;
  const shift=G._chromaT*1.5;
  // R 채널 왼쪽, B 채널 오른쪽으로 밀기
  // → 이건 WebGL 셰이더에서 해야 깔끔함
  // Canvas 2D에서는 drawImage offset으로 흉내:
  X.globalCompositeOperation='lighter';
  X.globalAlpha=0.06;
  X.drawImage(C, -shift, 0); // R shift
  X.drawImage(C, shift, 0);  // B shift
  X.globalCompositeOperation='source-over';
  X.globalAlpha=1;
}
```

**비용: 피격 시 drawImage 2회 (3~5프레임만). 평소 0.**

#### 3-3. 속성별 바닥 이펙트

화염 적이 지나간 자리에 불자국, 얼음 적이 지나간 자리에 서리.
이건 **맵 오프스크린 캔버스에 직접 그리면** 추가 드로우콜 0:

```javascript
// updateE에서 이동 시:
if(e.el===EL.F && Math.random()<.02){ // 화염 2% 확률
  _mapCtx.globalAlpha=.03;
  _mapCtx.fillStyle='#331100';
  _mapCtx.beginPath();
  _mapCtx.arc(e.x, e.y, e.r+5, 0, Math.PI*2);
  _mapCtx.fill();
}
```

맵 캐시에 직접 그리니까 렌더 비용 0 (이미 drawImage 1회로 그려짐).
누적되면서 전투가 격렬했던 구역이 자연스럽게 더러워짐 → 분위기.

---

### 4단계: 파티클 업그레이드 — 물량감 (성능 영향 주의)

#### 4-1. 파티클 풀 확장 + 타입 분화

현재: 500개 풀, 모든 파티클이 fillRect (사각형).
문제: 사각형 파티클은 값싸 보임.

```javascript
// 파티클 타입 추가 (기존 구조 확장)
{
  x, y, vx, vy, col, sz, life,
  type: 'rect'|'circle'|'spark'|'ring', // 새 필드
  rot: 0,      // 회전 (spark용)
  fade: true,  // 수명에 따라 페이드
  gravity: 0,  // 중력 (불꽃 떨어지기)
}
```

렌더링:
```javascript
switch(p.type){
  case 'circle':
    X.beginPath();X.arc(p.x,p.y,p.sz,0,Math.PI*2);X.fill();break;
  case 'spark':
    X.save();X.translate(p.x,p.y);X.rotate(p.rot);
    X.fillRect(-p.sz*2,-0.5,p.sz*4,1);X.restore();break;
  case 'ring':
    X.strokeStyle=p.col;X.lineWidth=1;
    X.beginPath();X.arc(p.x,p.y,p.sz,0,Math.PI*2);X.stroke();break;
  default: // rect (현재)
    X.fillRect(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.sz);
}
```

#### 4-2. 사망 이펙트 강화

현재 적 사망: `addParts(e.x, e.y, e.col, 25)` — 사각형 25개.

개선 — **사망 이펙트 함수** 분리:
```javascript
function deathFX(x, y, col, r, isBoss){
  const cnt = isBoss ? 50 : 15;
  // 1) 외곽으로 퍼지는 링
  for(let i=0;i<cnt;i++){
    const a=Math.PI*2*i/cnt;
    _partsPush({x, y,
      vx: Math.cos(a)*(isBoss?8:4), vy: Math.sin(a)*(isBoss?8:4),
      col, sz: isBoss?4:2, life: isBoss?25:15,
      type: 'spark', rot: a, gravity: .1
    });
  }
  // 2) 중심 플래시 링 (확장하다 사라짐)
  _partsPush({x, y, vx:0, vy:0,
    col: '#ffffff', sz: r, life: 12,
    type: 'ring', fade: true
  });
  // 3) 잔해 (중력 적용)
  for(let i=0;i<8;i++){
    _partsPush({x, y,
      vx: (Math.random()-.5)*6, vy: -2-Math.random()*4,
      col, sz: 1.5+Math.random()*2, life: 20+Math.random()*10,
      type: 'rect', gravity: .15
    });
  }
}
```

**비용: 적 사망 순간만 발생. 평소 0. 사망당 파티클 ~25개 (현재와 동일).**

---

### 5단계: 조명 시스템 — "분위기 킬러" (성능 영향 높음, 선택적)

이건 **Unity 이식 후** 또는 **성능 여유 확보 후** 할 것.

#### 5-1. 다이내믹 라이팅 (가짜)

WebGL 셰이더에 라이트맵 패스 추가:
- 플레이어 주변: 따뜻한 원형 조명
- 횃불/용암: 포인트 라이트
- 나머지: 어둠

이건 현재 WebGL 프록시 프래그먼트 셰이더를 확장해야 함:
```glsl
// 현재 FS에 추가
uniform vec2 uLights[8]; // 라이트 위치 (최대 8개)
uniform vec3 uLightCols[8];
uniform float uLightCount;

// 라이트맵 계산
float light = 0.05; // 기본 암흑
for(int i=0; i<8; i++){
  if(float(i)>=uLightCount) break;
  float d = distance(gl_FragCoord.xy, uLights[i]);
  light += max(0.0, 1.0 - d/200.0) * 0.8;
}
oC.rgb *= min(light, 1.2);
```

**비용: 프래그먼트 셰이더에 루프 1개 추가. 픽셀당 연산 증가.**
**판단: HTML5 버전에선 보류, Unity 버전에서 본격 적용.**

#### 5-2. 대안 — 비네팅 강화 + 시야 제한

현재 비네팅(line 7086)을 **동적**으로:
- 평상시: 약한 비네팅 (현재)
- 심해 지옥: 강한 비네팅 (시야 좁힘) → 긴장감
- 용암 지옥: 빨간 비네팅 → 열기 느낌
- 탐욕 지옥: 보라 비네팅 → 광기 느낌

이건 RadialGradient 색상만 바꾸면 됨. **비용 0.**

---

## ⚡ 성능 vs 비주얼 트레이드오프 정리

| 개선 | 비주얼 임팩트 | 성능 비용 | 우선순위 |
|------|------------|---------|---------|
| 적 스프라이트 교체 | ★★★★★ | **마이너스** (더 빨라짐) | 🔴 최우선 |
| 글로우 강화 (보스/엘리트) | ★★★☆☆ | 거의 0 | 🔴 |
| 투사체 트레일 | ★★★☆☆ | 미미 | 🔴 |
| 화면 플래시 | ★★☆☆☆ | 0 | 🔴 |
| 사망 이펙트 분화 | ★★★★☆ | 순간적 | 🟡 |
| 색수차 (피격) | ★★☆☆☆ | 순간적 | 🟡 |
| 바닥 흔적 | ★★☆☆☆ | 0 | 🟡 |
| 파티클 타입 분화 | ★★★☆☆ | 약간 | 🟡 |
| 비네팅 동적화 | ★★☆☆☆ | 0 | 🟡 |
| 가짜 블룸 | ★★★☆☆ | 중간 | 🟢 선택 |
| 다이내믹 라이팅 | ★★★★★ | 높음 | 🟢 Unity 후 |

---

## 📋 실행 로드맵

### Week 1: "즉시 개선" (코드만)

1. 적 색상 네온 톤 교체 (30분)
2. 보스/엘리트 다중 레이어 글로우 (1시간)
3. 모든 투사체에 트레일 추가 (30분)
4. 화면 플래시 시스템 (30분)
5. 사망 이펙트 함수 분리·강화 (1시간)
6. 비네팅 지옥별 동적화 (30분)

**결과: 같은 동그라미인데도 체감 2배 화려해짐**

### Week 2: "스프라이트 혁명" (에셋 + 코드)

1. GenSpark으로 10종 적 스프라이트시트 생성 (1~2일)
2. 궁수 패턴 복제해서 10종 스프라이트 로딩 (2시간)
3. 속성 틴팅 시스템 구현 (1시간)
4. _getESpr → 스프라이트 기반 교체 (2시간)
5. 보스 스프라이트 (별도 — 64×64, 8~12프레임) (1일)

**결과: "이게 그 게임 맞아?" 수준 변화**

### Week 3: "연출 강화" (포스트프로세싱)

1. 색수차 피격 이펙트 (1시간)
2. 바닥 속성 흔적 (1시간)
3. 파티클 타입 분화 (spark/ring/circle) (2시간)
4. 가짜 블룸 실험 (성능 체크 후 결정)

**결과: 인디 게임 데모 수준 비주얼**

---

## 🎨 GenSpark 스프라이트 생성 가이드

### 프롬프트 핵심 키워드

기존 v3.0 프롬프트 가이드와 연계. 핵심은:

```
스타일: "2D top-down sprite, dark fantasy, pixel art inspired,
        32x32 transparent background, 4-frame walk cycle spritesheet,
        Diablo 2 aesthetic, high contrast, readable silhouette"

근접 보병: "skeleton warrior, rusted sword, tattered armor"
돌격병: "skeleton knight, charging pose, heavy armor, horned helmet"
떼거리: "small imp, hunched posture, glowing eyes, minimal detail"
탱커: "large demon, bulky frame, thick stone armor, slow stance"
자폭: "explosive imp, glowing cracks in body, unstable energy"
방패기사: "shield bearer, tower shield, energy barrier effect"
리치: "floating lich, tattered robes, magic orbs, skeletal"
화약병: "goblin bomber, carrying explosive barrel, fuse lit"
주술사: "dark shaman, ritual pose, purple energy swirl"
보스: "massive demon lord, multiple attack poses, imposing presence"
```

### 스프라이트시트 규격

```
일반 적: 128×32 (32×32 × 4프레임 가로 배치)
보스: 768×64 또는 384×128 (64×64 × 12프레임)
파일명: melee_enemy.png, charger_enemy.png, swarm_enemy.png 등
```

배경 제거는 궁수 코드의 체크무늬 제거 로직 그대로 사용 가능.
혹은 GenSpark에서 투명 배경으로 생성 요청.

---

## 🔑 핵심 결론

**렉 걱정**: 스프라이트 교체는 **성능이 오히려 좋아진다**. arc+stroke 여러 번 → drawImage 1회. 이건 걱정할 필요 없음.

**그래픽 구림 해결 80%**: 적 스프라이트 교체 하나로 해결됨. 나머지 20%는 이펙트/포스트프로세싱.

**현실적 비용**: GenSpark 스프라이트 생성 50~70크레딧 + 코드 작업 3~5일.

**가장 중요한 한 마디**: 맵은 이미 예쁘다. 투사체도 괜찮다. **적만 바꾸면 된다.**

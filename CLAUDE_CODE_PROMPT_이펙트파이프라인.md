# 🔥 지옥의 길 — 투사체/이펙트 그래픽 파이프라인 업그레이드

## 현재 상황
game.html (12,000줄) 액션 RPG 게임. WebGL2 프록시 렌더링 시스템 사용중.
`OPT.bloom=true`, `OPT.trail=true`, `OPT.postfx=true` 플래그는 있지만 **실제 블룸/트레일 렌더링 코드가 구현되어있지 않음.**
투사체가 Canvas2D `arc()`, `lineTo()`, `ellipse()` 프리미티브로만 렌더링되어 80년대 느낌.

## 목표
투사체와 이펙트에 **모던 렌더링 파이프라인**을 추가해서 Dead Cells 수준의 비주얼 달성.
**60fps 유지 필수** (적 150마리 + 투사체 다수 상황에서).

## 핵심 코드 위치 (line numbers)
- 렌더러 초기화 (WebGPU/WebGL2/Canvas2D): **L888~L1210**
- `_setBlend(additive)`: WebGPU L1081 / WebGL2 L1198 — additive 블렌딩 전환
- `_glFlush()`: WebGPU L1087 / WebGL2 L1201
- 품질 옵션: `OPT` 객체 **L1400** — bloom, trail, slash, postfx, deathFx, parts
- 품질 티어 자동설정 (S/A/B/C): **L1465~L1468**
- 파티클 풀: `poolPart()` **L2561**
- 적 투사체 배열: `projs[]` **L2526**
- 플레이어 투사체 배열: `pProjs[]` **L2526**
- 원소 색상: `ELC[]`, `ELN[]`, `ELG[]`, `ELG2[]`, `ELP[]` **L2147~L2150, L10773~L10776**
- `draw()` 메인: **L9860**
- 적 투사체 렌더: **L10445~L10540** (projs 루프 — redBean, blackBean, blueBean, bomb, mine 등)
- 플레이어 투사체 렌더: **L11513~L11604** (pProjs 루프 — 화/빙/암/뇌/물리 매직, 화살, 칼날오브 등)
- 색수차: **L10766** (G._chromaT — 이미 구현됨)
- 비네팅: **L10768** (G._dvgCache — 이미 구현됨)
- 포스트프로세싱 영역: **L10763~L10770** (flashT, chromaT, vignette)

## 구현할 6개 레이어 (우선순위 순)

### 1. 블룸 패스 (OPT.bloom 활용)
**가장 임팩트 큰 개선.** draw() 함수 끝(L10770 부근)에 추가.

```
구현 방법:
1) 오프스크린 캔버스 생성 (메인의 1/4 해상도)
2) 투사체+이펙트만 별도 렌더 (또는 메인 캔버스를 다운스케일 복사)
3) 2패스 가우시안 블러 (수평→수직, 각 5탭)
4) 결과를 메인 캔버스에 globalCompositeOperation='lighter'로 합성
5) OPT.bloom false면 스킵

주의: _setBlend(true) 사용하면 WebGL2에서도 additive 가능하지만,
블룸 패스는 Canvas2D 레이어로 처리하는게 안전 (현재 X = 2D 컨텍스트 기반).
draw() 끝에서 CT 캔버스(L243: <canvas id="ct">)를 블룸 버퍼로 활용 가능.
```

```javascript
// 블룸 버퍼 초기화 (한번만)
const _bloomCvs = document.createElement('canvas');
const _bloomX = _bloomCvs.getContext('2d');
const _blurCvs = document.createElement('canvas');
const _blurX = _blurCvs.getContext('2d');

// draw() 함수 끝, 비네팅 직전에:
if(OPT.bloom){
  const bw=~~(C.width/4), bh=~~(C.height/4);
  if(_bloomCvs.width!==bw){_bloomCvs.width=bw;_bloomCvs.height=bh;_blurCvs.width=bw;_blurCvs.height=bh}
  // 다운스케일
  _bloomX.clearRect(0,0,bw,bh);
  _bloomX.drawImage(C,0,0,bw,bh);
  // 수평 블러
  _blurX.clearRect(0,0,bw,bh);
  for(let i=-2;i<=2;i++){_blurX.globalAlpha=[.06,.24,.4,.24,.06][i+2];_blurX.drawImage(_bloomCvs,i*4,0)}
  _blurX.globalAlpha=1;
  // 수직 블러
  _bloomX.clearRect(0,0,bw,bh);
  for(let i=-2;i<=2;i++){_bloomX.globalAlpha=[.06,.24,.4,.24,.06][i+2];_bloomX.drawImage(_blurCvs,0,i*4)}
  _bloomX.globalAlpha=1;
  // 합성
  X.save();X.setTransform(1,0,0,1,0,0);
  X.globalCompositeOperation='lighter';
  X.globalAlpha=.35;X.drawImage(_bloomCvs,0,0,C.width,C.height);
  X.globalAlpha=.15;X.drawImage(_bloomCvs,0,0,C.width,C.height);
  X.globalCompositeOperation='source-over';X.globalAlpha=1;X.restore();
}
```

### 2. Additive 글로우 레이어
**모든 투사체 뒤에 방사형 글로우 추가.** 현재 redBean/blackBean/blueBean은 이미 간단한 글로우 있음 (L10471~L10519). 일반 투사체(L10530+)와 pProjs(L11513+)에 동일하게 추가 필요.

```
각 투사체 렌더 직전에:
1) globalCompositeOperation='lighter' 설정
2) 속성색 RadialGradient (투사체 중심 → 투명) 그리기 (반경: 투사체 크기의 3~5배)
3) globalAlpha = 0.08~0.15 (너무 밝으면 눈뽕)
4) 복원 후 본체 그리기

기존 _setBlend(true) 활용해도 됨 (WebGL2에서 GL.blendFunc(GL.ONE, GL.ONE))
```

### 3. 모션 트레일
**투사체 이전 위치를 저장해서 잔상 그리기.** `OPT.trail` 활용.

```
구현:
1) projs[], pProjs[] 각 투사체에 trail[] 배열 추가 (push 시점: update() L4913)
2) 매 프레임 trail.unshift({x, y}) / trail.length > 6이면 pop
3) 렌더 시 trail 각 위치에 페이딩 복사본 그리기 (alpha = 1 - i/len * 0.7)
4) OPT.trail false면 스킵

주의: projs.push() 호출이 20곳 이상 — trail:[] 초기값 추가 필요
→ L2526 근처 또는 push하는 곳마다 trail:[] 추가하는 대신,
  렌더 루프에서 if(!p.trail)p.trail=[] 로 lazy init 추천
```

### 4. 투사체 회전/펄스 애니메이션
현재 일부 투사체(빨간콩, 검은콩)는 `_now` 기반 sin 펄스가 있지만 일반 투사체는 정적.

```
모든 투사체에 적용:
- 스케일 펄스: scale = 1 + sin(_now/150 + p.x) * 0.08
- 약간의 회전: rot += 0.001 * dt (화살은 진행방향 고정, 오브류만 회전)
- 적용 위치: L10445~L10540 (projs), L11513~L11604 (pProjs)
```

### 5. 서브파티클 이미터 강화
현재 `poolPart()`가 점 파티클만 생성. 투사체 비행중에도 속성별 파티클 방출 필요.

```
현재 이미 일부 구현됨 (L11528 화염: Math.random()>.8 → poolPart)
BUT: 빈도가 너무 낮고 (80% 확률로 스킵), 일반 투사체(projs[])에는 아예 없음.

개선:
1) 적 투사체(L10445 루프)에도 동일한 파티클 이미터 추가
2) 빈도를 Math.random()>.6 정도로 상향 (OPT.parts에 비례)
3) 파티클 색상을 ELP[p.el] 사용
4) 폭탄/지뢰 투사체에는 불꽃 스파크 파티클 추가
```

### 6. 히트 임팩트 이펙트 강화
투사체 소멸 시 이펙트. 현재 `deathBurst()` (L3485~L3510)가 있지만 적 사망용.
투사체 소멸 전용 이펙트 필요.

```
투사체 제거 시점 (update() 내 projs/pProjs 제거 로직 근처):
1) 플래시: poolPart(p.x, p.y, 0, 0, '#fff', 크기, 짧은수명, type=3) — type 3이 플래시
2) 링 확산: 이미 deathBurst에 있는 패턴 재활용
3) 속성색 파편: 4~6개 방사형 파티클
```

## 성능 가이드라인
- 블룸 패스: 1/4 해상도에서 처리 → draw call 부담 최소
- 트레일: 배열 길이 6으로 제한, OPT.trail false면 완전 스킵
- 글로우: RadialGradient 캐싱 (매 프레임 새로 안만들기)
- 파티클: OPT.parts 값(40~100)에 비례해서 spawn 확률 조절
- 전체: 품질 티어별 분기 (L1465~L1468) 준수
  - S: 전부 ON
  - A: 전부 ON, 파티클 80%
  - B: 블룸 OFF, 나머지 ON
  - C: 블룸/트레일/슬래시/포스트FX 전부 OFF

## 절대 건드리지 말 것
- WebGL2/WebGPU 렌더러 코어 (L888~L1210) — 건드리면 전체 깨짐
- 스프라이트 아틀라스 시스템 (L2992~L3400)
- 게임 로직 (update() 내 충돌/데미지/AI)
- 기존 HUD/패널/인벤토리 시스템

## 작업 순서
1. 블룸 패스 구현 (draw() 끝에 추가)
2. 적 투사체(projs[]) 글로우 레이어 추가 (L10445 루프)
3. 플레이어 투사체(pProjs[]) 글로우 강화 (L11513 루프)
4. 트레일 시스템 (lazy init + 렌더)
5. 파티클 이미터 빈도 상향
6. 테스트: OPT 토글별 동작 확인, C등급에서 60fps 확인

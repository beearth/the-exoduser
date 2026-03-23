# THE EXODUSER — 전체 그래픽 세팅 마스터 기획서
### v3.0 MASTER | 2026-03-10
### 통합: 출시최적화_그래픽_v2 + 비주얼시스템_final-spec v1.0
### 기준: game.html 20,000줄+ (현재)

---

## 🎯 비전 공식 (확정)

```
맵/환경 = Ori and the Blind Forest / Will of the Wisps — 발광+서정적 어둠
캐릭터  = 베르세르크 작화 × FromSoftware 디자인
사운드  = 젤다 시리즈 스킬/모션/환경음
전체톤  = 다크 판타지, 멜랑콜리, 실루엣 대비
```

**금지 키워드:** 그로테스크, 단순 고어, 비대칭 살덩이
**필수 키워드:** 서정적 어둠, 발광체, 실루엣 대비, 유기적 곡선, 멜랑콜리

---

## 목차

### Part A. 환경 비주얼 시스템 (맵/분위기)
1. [현재 상태 진단](#1-현재-상태-진단)
2. [STEP 1: 7지옥 팔레트 교체](#step-1-7지옥-컬러-팔레트-교체)
3. [STEP 2: 타일 렌더링 디테일](#step-2-타일-렌더링-디테일-교체)
4. [STEP 3: 환경 데코 정적 Pass 5](#step-3-환경-데코-정적-pass-5)
5. [STEP 4: 동적 흔들림 + 벽 눈동자](#step-4-동적-흔들림--벽-눈동자)
6. [STEP 5: 발광 오브젝트 Ori 스타일](#step-5-발광-오브젝트-ori-스타일)
7. [STEP 6: OPT 옵션 확장](#step-6-opt-옵션-확장)
8. [STEP 7: 횃불 조명 시스템](#step-7-횃불-조명-시스템)
9. [STEP 8: 앰비언트 파티클](#step-8-앰비언트-파티클)
10. [STEP 9: 안개](#step-9-안개)
11. [STEP 10: 필름 그레인 + 스캔라인](#step-10-필름-그레인--스캔라인)
12. [STEP 11: 비네팅 색조 교체](#step-11-비네팅횃불-색조-교체)
13. [STEP 12: 보스 등장 시네마틱](#step-12-보스-등장-시네마틱)
14. [STEP 13: 카메라 look-ahead](#step-13-카메라-look-ahead--보스-중간점)
15. [STEP 14: 사망 화면 리디자인](#step-14-사망-화면-리디자인)

### Part B. 스프라이트 & 성능 시스템
16. [크롬 성능 병목 분석](#16-크롬-성능-병목--원인-확정)
17. [성능 Tier 시스템](#17-성능-tier-시스템)
18. [스프라이트 아틀라스 시스템](#18-스프라이트-아틀라스-시스템--핵심-해결책)
19. [몬스터 스프라이트 10종](#19-몬스터-스프라이트--전-10종)
20. [보스 스프라이트 & 브레스](#20-보스-스프라이트--브레스)
21. [캐릭터 모션 강화](#21-캐릭터-모션-강화)
22. [이펙트 & 포스트프로세싱 확장](#22-이펙트--포스트프로세싱-확장)
23. [런타임 감지 & 품질 자동 조정](#23-런타임-감지--품질-자동-조정)

### Part C. 에셋 & 출시
24. [AI 에셋 생산 계획](#24-ai-에셋-생산-계획-genspark--god-mode)
25. [출시 플랫폼 전략](#25-출시-플랫폼-전략)
26. [성능 예산](#26-성능-예산)
27. [QA 매트릭스](#27-qa-매트릭스)
28. [draw() 렌더링 순서 최종](#28-draw-렌더링-순서-최종)
29. [클코 프롬프트 컨텍스트 헤더](#29-클코-프롬프트-컨텍스트-헤더)

---

## 1. 현재 상태 진단

### 이미 있는 것 — 절대 중복 구현 금지

| 시스템 | 위치 | 상태 |
|--------|------|------|
| `OPT.bloom` | ~1370줄 | 설정만 있음, **렌더 코드 없음** → 구현 필요 |
| `OPT.postfx` | ~1370줄 | 설정 있음 |
| `G._dvgCache` (비네팅) | ~9510줄 | 7지옥별 라디알 그라데이션, 작동 중 |
| `_MTHEME[0~6]` | 타일 색상 | 벽(w)/바닥(f)/악센트(ac) |
| `HELL_PALETTES[0~6]` | 스프라이트 팔레트 | dark/mid/light/bright/eye |
| `_tseed(tx,ty)` | 맵 시드 | 결정론적 랜덤, **절대 건드리지 마** |
| `buildMapCache()` | 맵 캐시 | Pass 1(바닥)→2(그림자)→3(벽)→4(분위기 광원) |
| `_partPool` | 전투 파티클 | 오브젝트 풀, OPT.parts 연동 |
| `_hwTier` | 하드웨어 등급 | S/A/B/C 자동 분류 |
| 색수차/히트스톱/슬로모션 | draw() 후반 | 작동 중 |
| `ELC[]`, `ETYPE_COL[]` | 속성/적 색상 | **절대 건드리지 마** |
| WebGL2 프록시 | ~797~1029줄 | _flush()로 배칭, 8192 쿼드/배치 |
| 맵 오프스크린 | ~1933~2070줄 | 오토타일+노이즈+그림자 — 훌륭 |
| 적 스프라이트 캐시 | ~1920~1932줄 | 개별 캔버스 캐시 100개 — **병목 원인** |

### 없는 것 — 이번에 추가

- 횃불 조명 (어둠 오버레이)
- 앰비언트 파티클
- 안개
- 필름 그레인/스캔라인
- 환경 데코레이션 (정적 + 동적)
- 발광 오브젝트 (Ori 스타일)
- 보스 등장 시네마틱
- 카메라 look-ahead
- 스프라이트 아틀라스 시스템
- OPT.bloom 실제 렌더 코드

### 폐기 확정

| 항목 | 폐기 사유 |
|------|----------|
| 패럴랙스 배경 | 탑다운 장르와 불일치 |
| 전경 레이어 FG1/FG2 | 패럴랙스 폐기 + 가시성 방해 |
| 별도 lightmap 캔버스 | `_torchCache`가 이 역할을 함 |
| Cinzel Decorative 외부 폰트 | CDN 의존성 금지 → Noto Sans KR |
| Dead Cells 비주얼 목표 | **Ori+Hollow Knight로 비전 통일** |

---

## Part A. 환경 비주얼 시스템

### STEP 1: 7지옥 컬러 팔레트 교체

> 난이도: ⭐ | 위험도: 낮음 | 런타임 비용: 0

**설계 원칙**
- 채도는 낮추되, 포인트 컬러 하나가 강렬하게 (Hollow Knight)
- 어두운 베이스 + 발광 악센트 (Ori)
- 각 지옥이 완전히 다른 감정 전달

```javascript
// 기존 _MTHEME 배열을 통째로 교체
const _MTHEME = [
  // 0 얼음굴 → "잠든 호수" (Ori Ginso Tree)
  { w:'#1a2838', f:'#0c1620', ac:'#44ddee' },
  // 1 곤충굴 → "독의 정원" (Hollow Knight Greenpath)
  { w:'#1c2a18', f:'#0e1a0c', ac:'#66ee55' },
  // 2 악마굴 → "불꽃의 성소" (Hollow Knight Kingdom's Edge + Ori Mount Horu)
  { w:'#2a1418', f:'#180a0c', ac:'#ff8844' },
  // 3 괴물굴 → "심연의 꿈" (Hollow Knight Deepnest + Ori Silent Woods)
  { w:'#1a1428', f:'#0c0a18', ac:'#bb77ff' },
  // 4 뇌전봉 → "폭풍의 제단" (Ori Forlorn Ruins)
  { w:'#28241a', f:'#18140c', ac:'#ffcc44' },
  // 5 백골묘 → "고요한 안식처" (Hollow Knight Resting Grounds)
  { w:'#24221c', f:'#14120e', ac:'#ddcc99' },
  // 6 허공균열 → "허무의 바다" (Hollow Knight Abyss)
  { w:'#100820', f:'#060410', ac:'#cc88ff' },
];
```

```javascript
const HELL_PALETTES = [
  // 0 림보 (얼음) — 서리빛 블루
  { id:0, name:'림보',
    dark:[20,30,50], mid:[50,80,120], light:[100,150,200],
    bright:[160,210,240], eye:[100,220,255] },
  // 1 색욕 (곤충) — 독 그린 + 자주
  { id:1, name:'색욕',
    dark:[30,50,20], mid:[60,100,40], light:[100,160,70],
    bright:[140,210,100], eye:[180,255,80] },
  // 2 탐식 (악마) — 따뜻한 주황/적갈색
  { id:2, name:'탐식',
    dark:[50,20,10], mid:[120,50,20], light:[180,90,40],
    bright:[230,140,60], eye:[255,160,50] },
  // 3 탐욕 (괴물) — 딥 퍼플
  { id:3, name:'탐욕',
    dark:[25,15,45], mid:[60,35,100], light:[100,65,160],
    bright:[150,100,210], eye:[180,120,255] },
  // 4 분노 (뇌전) — 골드/앰버
  { id:4, name:'분노',
    dark:[45,35,10], mid:[100,80,20], light:[170,140,40],
    bright:[220,190,60], eye:[255,230,50] },
  // 5 이단 (백골) — 따뜻한 그레이/크림
  { id:5, name:'이단',
    dark:[35,30,25], mid:[80,70,60], light:[140,125,110],
    bright:[190,175,155], eye:[220,200,160] },
  // 6 폭력 (허공) — 냉정한 흑자
  { id:6, name:'폭력',
    dark:[15,10,25], mid:[40,30,65], light:[80,60,120],
    bright:[130,100,180], eye:[180,140,255] },
];
```

**주의사항**
- `ELC[]` (속성 색상) 건드리지 마
- `ETYPE_COL[]` (적 타입별 색상) 유지
- `_MTHEME` 바꾸면 `buildMapCache()` 자동 반영
- `HELL_PALETTES` 바꾸면 `_buildAtlasE()`/`_buildAtlasB()` 자동 반영

---

### STEP 2: 타일 렌더링 디테일 교체

> 난이도: ⭐⭐ | 위험도: 낮음 | 런타임 비용: 0 (맵 캐시에 프리렌더)

**`_tseed(tx,ty)` 시드 절대 건드리지 마**

**바닥 디테일 교체 (Pass 1의 switch문)**

```javascript
switch(hell) {
  case 0: // 얼음 → 얼음 결정 + 서리 패턴
    if(R()<.2) {
      c.strokeStyle = 'rgba(100,200,255,.12)'; c.lineWidth = .5;
      const ix=px+R()*T, iy=py+R()*T;
      for(let a=0; a<6; a++) {
        const ag = a*Math.PI/3 + R()*.3;
        const len = 3+R()*5;
        c.beginPath(); c.moveTo(ix, iy);
        c.lineTo(ix+Math.cos(ag)*len, iy+Math.sin(ag)*len);
        c.stroke();
      }
    }
    if(R()<.08) {
      const gr = c.createRadialGradient(px+R()*T,py+R()*T,0,px+R()*T,py+R()*T,8+R()*12);
      gr.addColorStop(0,'rgba(100,200,255,.06)');
      gr.addColorStop(1,'rgba(100,200,255,0)');
      c.fillStyle=gr; c.fillRect(px,py,T,T);
    }
    break;

  case 1: // 곤충 → 이끼 패치 + 발광 포자 (Greenpath)
    if(R()<.25) {
      c.fillStyle = `rgba(60,140,40,${.04+R()*.04})`;
      c.beginPath();
      c.ellipse(px+R()*T,py+R()*T, 4+R()*8, 2+R()*4, R()*Math.PI, 0, Math.PI*2);
      c.fill();
    }
    if(R()<.06) {
      const sx=px+R()*T, sy=py+R()*T;
      const gr = c.createRadialGradient(sx,sy,0,sx,sy,4+R()*3);
      gr.addColorStop(0,'rgba(120,255,80,.15)');
      gr.addColorStop(1,'rgba(120,255,80,0)');
      c.fillStyle=gr; c.beginPath();
      c.arc(sx,sy,6+R()*4,0,Math.PI*2); c.fill();
    }
    break;

  case 2: // 악마 → 용암 줄기 + 잔불 글로우
    if(R()<.12) {
      c.strokeStyle = `rgba(255,120,30,${.06+R()*.06})`;
      c.lineWidth = .5+R();
      c.beginPath();
      let lx=px+R()*T, ly=py+R()*T;
      c.moveTo(lx,ly);
      for(let s=0;s<2+~~(R()*3);s++) { lx+=R()*14-7; ly+=R()*14-7; c.lineTo(lx,ly); }
      c.stroke();
    }
    if(R()<.04) {
      const ex=px+R()*T,ey=py+R()*T;
      const gr=c.createRadialGradient(ex,ey,0,ex,ey,5+R()*6);
      gr.addColorStop(0,'rgba(255,100,20,.1)');
      gr.addColorStop(.5,'rgba(255,60,10,.04)');
      gr.addColorStop(1,'rgba(255,60,10,0)');
      c.fillStyle=gr; c.beginPath(); c.arc(ex,ey,10,0,Math.PI*2); c.fill();
    }
    break;

  case 3: // 괴물 → 보라빛 버섯/안개 (Deepnest)
    if(R()<.1) {
      const mx=px+R()*T, my=py+R()*T;
      c.fillStyle = `rgba(160,80,220,${.05+R()*.06})`;
      c.beginPath(); c.arc(mx,my,2+R()*3,0,Math.PI*2); c.fill();
      c.strokeStyle = 'rgba(120,60,180,.04)'; c.lineWidth=.5;
      c.beginPath(); c.moveTo(mx,my); c.lineTo(mx+(R()-.5)*4,my+3+R()*5); c.stroke();
    }
    if(R()<.06) {
      const gr=c.createRadialGradient(px+R()*T,py+R()*T,0,px+R()*T,py+R()*T,10+R()*15);
      gr.addColorStop(0,'rgba(140,60,200,.05)');
      gr.addColorStop(1,'rgba(140,60,200,0)');
      c.fillStyle=gr; c.fillRect(px,py,T,T);
    }
    break;

  case 4: // 뇌전 → 정전기 라인
    if(R()<.08) {
      c.strokeStyle = `rgba(255,220,50,${.08+R()*.06})`;
      c.lineWidth = .5;
      c.beginPath();
      let lx=px+R()*T, ly=py+R()*T; c.moveTo(lx,ly);
      for(let s=0;s<2+~~(R()*2);s++) { lx+=R()*8-4; ly+=R()*8-4; c.lineTo(lx,ly); }
      c.stroke();
    }
    break;

  case 5: // 백골 → 마른 풀/꽃 (Resting Grounds)
    if(R()<.15) {
      c.strokeStyle = `rgba(160,140,100,${.06+R()*.04})`;
      c.lineWidth = .5;
      const gx=px+R()*T, gy=py+T;
      c.beginPath(); c.moveTo(gx,gy);
      c.quadraticCurveTo(gx+(R()-.5)*6, gy-6-R()*8, gx+(R()-.5)*3, gy-10-R()*8);
      c.stroke();
    }
    if(R()<.03) {
      c.fillStyle = `rgba(220,180,100,${.1+R()*.08})`;
      c.beginPath(); c.arc(px+R()*T,py+R()*T,1+R(),0,Math.PI*2); c.fill();
    }
    break;

  case 6: // 허공 → 별/공허 (Abyss)
    if(R()<.05) {
      const sx=px+R()*T, sy=py+R()*T;
      c.fillStyle = `rgba(200,160,255,${.1+R()*.15})`;
      c.beginPath(); c.arc(sx,sy,.5+R(),0,Math.PI*2); c.fill();
      const gr=c.createRadialGradient(sx,sy,0,sx,sy,3+R()*3);
      gr.addColorStop(0,'rgba(200,160,255,.08)');
      gr.addColorStop(1,'rgba(200,160,255,0)');
      c.fillStyle=gr; c.beginPath(); c.arc(sx,sy,6,0,Math.PI*2); c.fill();
    }
    break;
}
```

**벽면 장식 교체 (Pass 3의 switch문)**

```javascript
switch(hell) {
  case 0: // 고드름
    if(R()<.3) {
      c.fillStyle='rgba(130,200,255,.08)';
      const ix=px+4+R()*(T-8), iy=fy, ih=4+R()*8;
      c.beginPath(); c.moveTo(ix-1,iy); c.lineTo(ix+1,iy);
      c.lineTo(ix,iy+ih); c.fill();
    }
    break;

  case 1: // 덩굴 (bezier 곡선 + 잎사귀)
    if(R()<.35) {
      c.strokeStyle = `rgba(80,160,50,${.12+R()*.08})`;
      c.lineWidth = .8+R();
      const vx=px+R()*T;
      c.beginPath(); c.moveTo(vx, fy);
      c.bezierCurveTo(vx+R()*15-7, fy+fH*.3, vx+R()*15-7, fy+fH*.7, vx+R()*8-4, fy+fH);
      c.stroke();
      if(R()<.5) {
        c.fillStyle = 'rgba(100,180,60,.1)';
        c.beginPath();
        c.ellipse(vx+R()*6-3, fy+R()*fH, 2+R()*2, 1+R(), R()*Math.PI, 0, Math.PI*2);
        c.fill();
      }
    }
    break;

  case 2: // 용암 흔적
    if(R()<.25) {
      c.strokeStyle = `rgba(255,100,30,${.08+R()*.08})`;
      c.lineWidth = 1+R();
      const gx=px+R()*T, gy=fy+R()*fH;
      const gr=c.createRadialGradient(gx,gy,0,gx,gy,3);
      gr.addColorStop(0,'rgba(255,80,20,.06)');
      gr.addColorStop(1,'rgba(255,80,20,0)');
      c.fillStyle=gr; c.fillRect(px,fy,T,fH);
    }
    break;

  case 3: // 벽면 눈 (괴물 심연) — 정적
    if(R()<.12) {
      const ex=px+6+R()*(T-12), ey=fy+3+R()*(fH-6);
      c.fillStyle = 'rgba(60,30,80,.15)';
      c.beginPath(); c.ellipse(ex,ey,3,2,0,0,Math.PI*2); c.fill();
      c.fillStyle = 'rgba(180,100,255,.25)';
      c.beginPath(); c.arc(ex,ey,1,0,Math.PI*2); c.fill();
    }
    break;

  case 4: // 금속 볼트/리벳
    if(R()<.2) {
      c.fillStyle = `rgba(200,180,100,${.08+R()*.06})`;
      c.beginPath();
      c.arc(px+4+R()*(T-8), fy+3+R()*(fH-6), 1.5, 0, Math.PI*2);
      c.fill();
    }
    break;

  case 5: // 풍화된 부조 (원형 문양)
    if(R()<.1) {
      c.strokeStyle = 'rgba(180,160,130,.06)'; c.lineWidth = .5;
      const cx2=px+R()*T, cy2=fy+fH/2;
      c.beginPath(); c.arc(cx2,cy2,3+R()*4,0,Math.PI*2); c.stroke();
    }
    break;

  case 6: // 균열 틈새 보라빛
    if(R()<.15) {
      c.fillStyle = `rgba(160,100,255,${.06+R()*.06})`;
      c.fillRect(px+R()*T, fy+R()*(fH-3), 1+R()*3, 1+R()*2);
    }
    break;
}
```

---

### STEP 3: 환경 데코 정적 (Pass 5)

> 난이도: ⭐⭐ | 위험도: 낮음 | 런타임 비용: 0 (맵 캐시에 프리렌더)

**위치: buildMapCache() Pass 4 뒤에 추가**

```javascript
// ── Pass 5: 환경 데코레이션 [DECOR-STATIC] ──
for(let ty=0;ty<mh;ty++) for(let tx=0;tx<mw;tx++){
  if(map[ty][tx]!==0) continue;
  const R=_tseed(tx+200,ty+200); // 데코 전용 시드 오프셋
  const px=tx*T, py=ty*T;
  
  const wallN = ty>0 && map[ty-1][tx]>=1;
  const wallS = ty<mh-1 && map[ty+1][tx]>=1;
  const wallW = tx>0 && map[ty][tx-1]>=1;
  const wallE = tx<mw-1 && map[ty][tx+1]>=1;
  const nearWall = wallN||wallS||wallW||wallE;

  switch(hell) {
    case 0: // 얼음 — 결정 클러스터, 대형 얼음 기둥
      if(nearWall && R()<.08) {
        const cx=px+T/2+R()*10-5, cy=py+T/2+R()*10-5;
        c.fillStyle='rgba(100,200,255,.08)';
        for(let i=0;i<3;i++){
          const a=R()*Math.PI*2, s=4+R()*6;
          c.beginPath();
          c.moveTo(cx+Math.cos(a)*s, cy+Math.sin(a)*s);
          c.lineTo(cx+Math.cos(a+2.1)*s*.6, cy+Math.sin(a+2.1)*s*.6);
          c.lineTo(cx+Math.cos(a-2.1)*s*.6, cy+Math.sin(a-2.1)*s*.6);
          c.closePath(); c.fill();
        }
      }
      if(R()<.02) {
        c.fillStyle='rgba(80,180,240,.06)';
        c.fillRect(px+T*.2, py-T*.3, T*.6, T*1.3);
        c.strokeStyle='rgba(130,210,255,.1)'; c.lineWidth=.5;
        c.strokeRect(px+T*.2, py-T*.3, T*.6, T*1.3);
      }
      break;

    case 1: // 곤충 — 버섯, 고치
      if(nearWall && R()<.12) {
        const mx=px+R()*T, my=py+T-2;
        const mh2=4+R()*8, mw2=3+R()*5;
        c.fillStyle=`rgba(60,130,40,${.06+R()*.04})`;
        c.beginPath(); c.ellipse(mx,my-mh2,mw2,mh2*.4,0,Math.PI,0); c.fill();
        c.strokeStyle='rgba(80,140,50,.06)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(mx,my); c.lineTo(mx,my-mh2); c.stroke();
      }
      break;

    case 2: // 화염 — 균열, 재 더미
      if(nearWall && R()<.1) {
        c.strokeStyle='rgba(255,80,20,.08)'; c.lineWidth=.8;
        c.beginPath();
        let lx=px+R()*T*.3, ly=py+R()*T; c.moveTo(lx,ly);
        for(let s=0;s<4;s++){ lx+=3+R()*8; ly+=(R()-.5)*6; c.lineTo(lx,ly); }
        c.stroke();
      }
      break;

    case 3: // 심연 — 촉수 뿌리, 유기체 돌기
      if(nearWall && R()<.1) {
        c.strokeStyle=`rgba(120,50,180,${.06+R()*.04})`;
        c.lineWidth=1+R();
        const sx=px+R()*T, sy=wallN?py:py+T;
        const ey=wallN?py+T*.8:py+T*.2;
        c.beginPath(); c.moveTo(sx,sy);
        c.bezierCurveTo(sx+R()*15-7, sy+(ey-sy)*.3, sx+R()*15-7, sy+(ey-sy)*.7, sx+R()*8-4, ey);
        c.stroke();
      }
      break;

    case 4: // 뇌전 — 부서진 기둥
      if(nearWall && R()<.06) {
        c.fillStyle=`rgba(140,120,80,${.05+R()*.03})`;
        const bw=3+R()*5, bh=6+R()*10;
        c.fillRect(px+R()*(T-bw), py+T-bh, bw, bh);
      }
      break;

    case 5: // 백골 — 뼈 조각, 두개골
      if(nearWall && R()<.1) {
        const bx=px+R()*T, by=py+T-2;
        c.strokeStyle='rgba(180,160,130,.06)'; c.lineWidth=.8;
        const ba=R()*Math.PI-Math.PI/2, bl=5+R()*8;
        c.beginPath(); c.moveTo(bx, by);
        c.lineTo(bx+Math.cos(ba)*bl, by+Math.sin(ba)*bl);
        c.stroke();
      }
      if(R()<.02) {
        const sx=px+R()*T, sy=py+T-5;
        c.fillStyle='rgba(200,180,150,.05)';
        c.beginPath(); c.arc(sx,sy,4,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(30,20,15,.08)';
        c.beginPath(); c.arc(sx-1.5,sy-1,1,0,Math.PI*2); c.fill();
        c.beginPath(); c.arc(sx+1.5,sy-1,1,0,Math.PI*2); c.fill();
      }
      break;

    case 6: // 허공 — 부유 타일 조각, 차원 균열
      if(R()<.06) {
        c.save(); c.translate(px+R()*T, py+R()*T); c.rotate(R()*Math.PI);
        c.fillStyle=`rgba(100,60,180,${.04+R()*.03})`;
        const ts=2+R()*4; c.fillRect(-ts/2,-ts/2,ts,ts); c.restore();
      }
      break;
  }
}
```

---

### STEP 4: 동적 흔들림 + 벽 눈동자

> 난이도: ⭐⭐⭐ | 런타임 비용: 낮음 (최대 40+8개)

**4-A: SWAY_OBJECTS — initStage()에서 생성**

```javascript
// ═══ [DECOR-SWAY] ═══
let SWAY_OBJECTS = [];
const SWAY_MAX = 40;

function initSwayObjects() {
  SWAY_OBJECTS = [];
  const hell = Math.min(6, ~~(G.stage/10));
  const map = G.map;
  let count = 0;
  
  for(let ty=1; ty<G.mh-1 && count<SWAY_MAX; ty++) {
    for(let tx=1; tx<G.mw-1 && count<SWAY_MAX; tx++) {
      if(map[ty][tx] !== 0) continue;
      const R = _tseed(tx+300, ty+300);
      if(map[ty-1][tx] >= 1 && R() < 0.25) {
        SWAY_OBJECTS.push({
          x: tx*T + R()*T, y: ty*T, hell: hell,
          height: 8 + R()*12, width: 2 + R()*4,
          phase: R() * Math.PI * 2,
          speed: 1500 + R() * 2000,
          amplitude: 2 + R() * 3, col: null
        });
        count++;
      }
    }
  }
  
  const swayColors = [
    'rgba(130,200,255,.15)', 'rgba(80,160,50,.12)', 'rgba(255,100,30,.1)',
    'rgba(120,50,180,.1)',   'rgba(200,180,80,.08)', 'rgba(180,160,130,.08)',
    'rgba(140,80,220,.08)',
  ];
  for(const sw of SWAY_OBJECTS) sw.col = swayColors[sw.hell];
}
```

**draw()에서 렌더링 (맵 캐시 후, 적 전)**

```javascript
// [DECOR-SWAY]
if(SWAY_OBJECTS.length > 0 && _hwTier !== 'C') {
  const now = performance.now();
  for(const sw of SWAY_OBJECTS) {
    const screenX = sw.x - G.cam.x + C.width/2;
    const screenY = sw.y - G.cam.y + C.height/2;
    if(screenX < -30 || screenX > C.width+30 || screenY < -30 || screenY > C.height+30) continue;
    
    const sway = Math.sin(now/sw.speed + sw.phase) * sw.amplitude;
    X.strokeStyle = sw.col; X.lineWidth = 1.5;
    X.beginPath(); X.moveTo(sw.x, sw.y);
    const segments = 4;
    for(let h=1; h<=segments; h++) {
      const ratio = h/segments;
      X.lineTo(sw.x + sway * ratio * ratio, sw.y - sw.height * ratio);
    }
    X.stroke();
  }
}
```

**4-B: WALL_EYES — 심연(3) 벽 눈동자 (플레이어 추적)**
베르세르크 식이안 오마주. 벽에 박힌 눈동자가 플레이어 추적.

```javascript
// ═══ [DECOR-EYES] ═══
let WALL_EYES = [];
const WALL_EYES_MAX = 8;

function initWallEyes() {
  WALL_EYES = [];
  const hell = Math.min(6, ~~(G.stage/10));
  if(hell !== 3) return;
  
  const map = G.map; let count = 0;
  for(let ty=1; ty<G.mh-1 && count<WALL_EYES_MAX; ty++) {
    for(let tx=1; tx<G.mw-1 && count<WALL_EYES_MAX; tx++) {
      if(map[ty][tx] < 1) continue;
      const R = _tseed(tx+400, ty+400);
      const adjFloor = (ty>0&&map[ty-1][tx]===0)||(ty<G.mh-1&&map[ty+1][tx]===0)||
                       (tx>0&&map[ty][tx-1]===0)||(tx<G.mw-1&&map[ty][tx+1]===0);
      if(adjFloor && R() < 0.05) {
        WALL_EYES.push({
          x: tx*T + T/2 + (R()-.5)*T*.5,
          y: ty*T + T/2 + (R()-.5)*T*.5,
          radius: 6 + R()*4, pupilR: 2 + R()*1.5,
          pupilOff: 3, veinCount: 2 + ~~(R()*3),
          blinkTimer: 0, blinkInterval: 3000 + R()*5000,
        });
        count++;
      }
    }
  }
}
```

**draw()에서 눈동자 렌더링**

```javascript
// [DECOR-EYES]
if(WALL_EYES.length > 0) {
  const now = performance.now();
  for(const eye of WALL_EYES) {
    const sx = eye.x - G.cam.x + C.width/2;
    const sy = eye.y - G.cam.y + C.height/2;
    if(sx<-20||sx>C.width+20||sy<-20||sy>C.height+20) continue;
    
    const blinkPhase = (now % eye.blinkInterval) / eye.blinkInterval;
    if(blinkPhase > 0.95) continue;
    const squint = blinkPhase > 0.90 ? (blinkPhase - 0.90) / 0.05 : 0;
    const angle = Math.atan2(P.y - eye.y, P.x - eye.x);
    
    X.fillStyle = 'rgba(30,15,50,.6)';
    X.beginPath(); X.ellipse(eye.x, eye.y, eye.radius, eye.radius*(1-squint*.8), 0, 0, Math.PI*2); X.fill();
    X.fillStyle = 'rgba(80,30,140,.5)';
    X.beginPath(); X.arc(eye.x+Math.cos(angle)*eye.pupilOff*.5, eye.y+Math.sin(angle)*eye.pupilOff*.5, eye.pupilR*1.5, 0, Math.PI*2); X.fill();
    
    const px2 = eye.x + Math.cos(angle)*eye.pupilOff;
    const py2 = eye.y + Math.sin(angle)*eye.pupilOff;
    X.fillStyle = 'rgba(255,30,30,.7)';
    X.beginPath(); X.arc(px2, py2, eye.pupilR, 0, Math.PI*2); X.fill();
    X.fillStyle = 'rgba(255,50,50,.15)';
    X.beginPath(); X.arc(px2, py2, eye.pupilR*3, 0, Math.PI*2); X.fill();
    
    X.strokeStyle = 'rgba(150,40,60,.12)'; X.lineWidth = .5;
    for(let v=0; v<eye.veinCount; v++){
      const va = (v/eye.veinCount)*Math.PI*2 + Math.sin(now/2000)*.2;
      X.beginPath();
      X.moveTo(eye.x+Math.cos(va)*eye.radius*.3, eye.y+Math.sin(va)*eye.radius*.3);
      X.lineTo(eye.x+Math.cos(va)*eye.radius*.95, eye.y+Math.sin(va)*eye.radius*.95);
      X.stroke();
    }
  }
}
```

---

### STEP 5: 발광 오브젝트 (Ori 스타일)

> 난이도: ⭐⭐⭐ | **gradient 사용 금지 — arc + fillRect + globalAlpha로만**

```javascript
// ═══ [GLOW-ORI] ═══
let GLOW_OBJECTS = [];
const GLOW_MAX = 30;

function initGlowObjects() {
  GLOW_OBJECTS = [];
  const hell = Math.min(6, ~~(G.stage/10));
  const map = G.map; let count = 0;
  
  const glowDefs = [
    [.08, .15, '#66ccee', '#44aacc', 20, 3],
    [.06, .12, '#88ff44', '#66cc33', 18, 2],
    [.05, .10, '#ff8833', '#cc5500', 22, 2],
    [.04, .08, '#bb66ff', '#8833cc', 16, 4],
    [.05, .10, '#ffdd44', '#ccaa00', 20, 2],
    [.06, .12, '#ddcc88', '#aa9955', 14, 2],
    [.04, .08, '#cc88ff', '#9944cc', 18, 3],
  ];
  const def = glowDefs[hell];
  
  for(let ty=1; ty<G.mh-1 && count<GLOW_MAX; ty++) {
    for(let tx=1; tx<G.mw-1 && count<GLOW_MAX; tx++) {
      if(map[ty][tx] !== 0) continue;
      const R = _tseed(tx+500, ty+500);
      const adjWall = (ty>0&&map[ty-1][tx]>=1)||(ty<G.mh-1&&map[ty+1][tx]>=1)||
                      (tx>0&&map[ty][tx-1]>=1)||(tx<G.mw-1&&map[ty][tx+1]>=1);
      const prob = adjWall ? def[1] : def[0];
      if(R() < prob) {
        GLOW_OBJECTS.push({
          x: tx*T + T/2 + (R()-.5)*T*.6, y: ty*T + T/2 + (R()-.5)*T*.6,
          col: def[2], glowCol: def[3],
          radius: def[4] + (R()-.5)*8,
          orbiterCount: def[5], orbiterRadius: 8 + R()*7,
          phase: R() * Math.PI * 2, pulseSpeed: 1500 + R()*2000,
        });
        count++;
      }
    }
  }
}
```

**draw()에서 렌더링**

```javascript
// [GLOW-ORI]
if(GLOW_OBJECTS.length > 0) {
  const now = performance.now();
  for(const g of GLOW_OBJECTS) {
    const sx = g.x - G.cam.x + C.width/2;
    const sy = g.y - G.cam.y + C.height/2;
    if(sx<-g.radius*2||sx>C.width+g.radius*2||sy<-g.radius*2||sy>C.height+g.radius*2) continue;
    
    const pulse = Math.sin(now/g.pulseSpeed + g.phase) * 0.3 + 0.7;
    X.fillStyle = g.glowCol;
    X.globalAlpha = 0.06 * pulse;
    X.beginPath(); X.arc(g.x, g.y, g.radius * pulse, 0, Math.PI*2); X.fill();
    X.globalAlpha = 0.12 * pulse;
    X.beginPath(); X.arc(g.x, g.y, g.radius * 0.4 * pulse, 0, Math.PI*2); X.fill();
    X.globalAlpha = 0.5 * pulse; X.fillStyle = g.col;
    X.beginPath(); X.arc(g.x, g.y, 3, 0, Math.PI*2); X.fill();
    X.globalAlpha = 0.3 * pulse;
    for(let i=0; i<g.orbiterCount; i++) {
      const angle = now/1200 + Math.PI*2*i/g.orbiterCount + g.phase;
      X.beginPath(); X.arc(g.x+Math.cos(angle)*g.orbiterRadius, g.y+Math.sin(angle)*g.orbiterRadius*.6, 1.5, 0, Math.PI*2); X.fill();
    }
    X.globalAlpha = 1;
  }
}
```

---

### STEP 6: OPT 옵션 확장

```javascript
// OPT에 4개 키 추가 (~1370줄)
torch: true,
ambPart: true,
fog: true,
grain: true

// 하드웨어 프리셋
if(tier==='S'||tier==='A'){ OPT.torch=true; OPT.ambPart=true; OPT.fog=true; OPT.grain=true; }
else if(tier==='B'){ OPT.torch=true; OPT.ambPart=true; OPT.fog=false; OPT.grain=false; }
else { OPT.torch=false; OPT.ambPart=false; OPT.fog=false; OPT.grain=false; }
```

---

### STEP 7: 횃불 조명 시스템 (어둠 오버레이)

> 난이도: ⭐⭐⭐⭐ | 분위기 핵심

```javascript
// ═══ [TORCH] ═══
const _TORCH = {
  baseRadius: 220, flickerSpeed: 0.003, flickerAmp: 15,
  darkAlpha: 0.55, combatBoost: 60, lowHpShrink: 0.4, bossBoost: 100,
};
let _torchR = _TORCH.baseRadius;
let _torchCache = null, _torchW = 0, _torchH = 0;
```

**update()에서 반경 업데이트**

```javascript
// [TORCH] tick/update 내, shake 코드 직후
if(OPT.torch) {
  let _tTarget = _TORCH.baseRadius;
  if(P.s==='attack'||P.s==='charge') _tTarget += _TORCH.combatBoost;
  if(P.hp/P.mhp <= .3) _tTarget *= _TORCH.lowHpShrink + .6*(P.hp/P.mhp/.3);
  if(G._bossRef && G._bossRef.alive) _tTarget += _TORCH.bossBoost;
  const _tw = INV.equipped.weapon;
  if(_tw && _tw.el === EL.F) _tTarget += 40;
  _torchR += (_tTarget - _torchR) * .05 * sp;
  _torchR += Math.sin(_now*_TORCH.flickerSpeed)*_TORCH.flickerAmp
           + Math.sin(_now*.0071)*_TORCH.flickerAmp*.6;
}
```

**draw()에서 어둠 오버레이 (색수차 후 / 비네팅 전)**

```javascript
// [TORCH]
if(OPT.torch && OPT.postfx) {
  X.save(); X.setTransform(1,0,0,1,0,0);
  const _psx = C.width/2 + (P.x - G.cam.x);
  const _psy = C.height/2 + (P.y - G.cam.y);
  const _tR = Math.max(80, _torchR);
  const _ahell = Math.min(6, ~~(G.stage/10));

  if(!_torchCache || _torchW!==C.width || _torchH!==C.height){
    _torchCache = document.createElement('canvas');
    _torchCache.width=C.width; _torchCache.height=C.height;
    _torchW=C.width; _torchH=C.height;
  }
  const _tc = _torchCache.getContext('2d');
  _tc.clearRect(0,0,C.width,C.height);

  const _darkCols = ['#061018','#061008','#120608','#0a0614','#0e0c06','#0c0a08','#04020c'];
  _tc.fillStyle = _darkCols[_ahell];
  _tc.globalAlpha = _TORCH.darkAlpha;
  _tc.fillRect(0,0,C.width,C.height);

  _tc.globalCompositeOperation = 'destination-out';
  const _tg = _tc.createRadialGradient(_psx,_psy,0,_psx,_psy,_tR);
  _tg.addColorStop(0,'rgba(0,0,0,1)');
  _tg.addColorStop(.3,'rgba(0,0,0,.95)');
  _tg.addColorStop(.6,'rgba(0,0,0,.6)');
  _tg.addColorStop(.85,'rgba(0,0,0,.2)');
  _tg.addColorStop(1,'rgba(0,0,0,0)');
  _tc.globalAlpha=1; _tc.fillStyle=_tg;
  _tc.beginPath(); _tc.arc(_psx,_psy,_tR,0,Math.PI*2); _tc.fill();
  _tc.globalCompositeOperation = 'source-over';
  X.drawImage(_torchCache,0,0);

  const _warmCols = [
    'rgba(80,180,240,.06)','rgba(100,200,80,.05)','rgba(240,120,40,.07)',
    'rgba(140,80,200,.05)','rgba(220,200,80,.06)','rgba(200,170,120,.04)','rgba(140,100,220,.05)'
  ];
  const _wg = X.createRadialGradient(_psx,_psy,0,_psx,_psy,_tR*.6);
  _wg.addColorStop(0,_warmCols[_ahell]); _wg.addColorStop(1,'rgba(0,0,0,0)');
  X.fillStyle=_wg; X.fillRect(_psx-_tR,_psy-_tR,_tR*2,_tR*2);
  X.restore();
}
```

---

### STEP 8: 앰비언트 파티클

> Float32Array 풀, 80개, Ori 글로우 통합

```javascript
// ═══ [AMB-PART] ═══
const _AMB_MAX = 80;
const _ambData = new Float32Array(_AMB_MAX * 10);
const _ambCols = new Array(_AMB_MAX).fill('#fff');
const _ambTypes = new Uint8Array(_AMB_MAX);
let _ambCnt = 0, _ambSpawnT = 0;

const _AMB_THEMES = [
  { cols:['#88ddff','#aaeeff','#66ccee','#ffffff'], vy:0.12, vx:0.4, sz:[1.5,4], life:[250,500], tp:0, glow:true, glowR:3.0, glowA:.15 },
  { cols:['#88ff66','#66ee44','#aaff88'], vy:-0.25, vx:0.15, sz:[1,2.5], life:[200,450], tp:1, glow:true, glowR:4.0, glowA:.2 },
  { cols:['#ff8833','#ffaa44','#ff6611','#ffcc66'], vy:-0.5, vx:0.2, sz:[1,3], life:[80,200], tp:1, glow:true, glowR:3.5, glowA:.18 },
  { cols:['#aa66ee','#cc88ff','#8844cc','#dd99ff'], vy:0.05, vx:0.25, sz:[2,5], life:[300,600], tp:2, glow:true, glowR:3.0, glowA:.12 },
  { cols:['#ffee44','#ffffff','#ffdd00'], vy:-0.15, vx:0.6, sz:[.5,1.5], life:[30,100], tp:3, glow:true, glowR:2.5, glowA:.25 },
  { cols:['#ddcc99','#ccbb88','#eeddaa','#ffeecc'], vy:-0.03, vx:0.06, sz:[1.5,3.5], life:[400,800], tp:0, glow:false, glowR:0, glowA:0 },
  { cols:['#bb77ff','#dd99ff','#9955ee','#ffffff'], vy:-0.2, vx:0.5, sz:[1,3], life:[150,350], tp:1, glow:true, glowR:4.0, glowA:.22 },
];
```

(update/draw 코드는 visual-final-spec STEP 8 전체 참고)

---

### STEP 9: 안개

> `_fogPool` 24개, `_FOG_COLS` 지옥별, OPT.fog로 on/off, _hwTier 'B' 이하 비활성

---

### STEP 10: 필름 그레인 + 스캔라인

```javascript
// [GRAIN] 128px 타일, 3프레임마다 갱신
let _grainCvs=null, _grainCtx=null, _grainT=0;

// draw() 끝
if(OPT.grain && OPT.postfx) {
  _grainT++;
  if(!_grainCvs || _grainT%3===0){
    if(!_grainCvs){ _grainCvs=document.createElement('canvas'); _grainCvs.width=128; _grainCvs.height=128; _grainCtx=_grainCvs.getContext('2d'); }
    const gd=_grainCtx.createImageData(128,128); const d=gd.data;
    for(let i=0;i<d.length;i+=4){ const v=~~(Math.random()*255); d[i]=d[i+1]=d[i+2]=v; d[i+3]=12; }
    _grainCtx.putImageData(gd,0,0);
  }
  X.save(); X.setTransform(1,0,0,1,0,0); X.globalAlpha=.08;
  const pat=X.createPattern(_grainCvs,'repeat');
  if(pat){X.fillStyle=pat; X.fillRect(0,0,C.width,C.height);}
  X.globalAlpha=1; X.restore();
}

// [SCANLINE]
if(OPT.postfx) {
  X.save(); X.setTransform(1,0,0,1,0,0);
  X.globalAlpha=.025; X.fillStyle='#000';
  for(let y=0;y<C.height;y+=3) X.fillRect(0,y,C.width,1);
  X.globalAlpha=1; X.restore();
}
```

---

### STEP 11: 비네팅/횃불 색조 교체

```javascript
// ~9510줄 _vCols 교체
const _vCols = [
  'rgba(20,60,120,',  // 얼음: 짙은 남색
  'rgba(20,60,15,',   // 곤충: 짙은 숲
  'rgba(100,20,10,',  // 악마: 짙은 적색
  'rgba(50,15,80,',   // 괴물: 짙은 보라
  'rgba(80,60,10,',   // 뇌전: 짙은 앰버
  'rgba(50,40,25,',   // 백골: 짙은 갈색
  'rgba(30,10,60,',   // 허공: 짙은 보라
];
```

---

### STEP 12: 보스 등장 시네마틱

> **Cinzel Decorative 금지 → Noto Sans KR 사용**

```javascript
let _bossCine = { active:false, t:0, maxT:180, name:'', phase:0, lastBossId:null };
```

트리거 (update()), 렌더링 (draw()) — dark-souls-atmosphere-patch 코드 기반, 폰트 교체:
```javascript
X.font = 'bold ' + Math.min(16, 11+t*.05) + 'px "Noto Sans KR"';
```

---

### STEP 13: 카메라 look-ahead + 보스 중간점

```javascript
// [CAMERA] tick() 카메라 코드 교체
const camSpd = P.s==='dodge'?0.15 : P.s==='attack'?0.05 : 0.08;
const lookX = (P.vx||0) * 25;
const lookY = (P.vy||0) * 25;
let targetX = P.x + lookX;
let targetY = P.y + lookY;

// 보스전: 플레이어와 보스 중간점
if(G._bossRef && G._bossRef.alive) {
  targetX = (P.x + G._bossRef.x)*0.5 + lookX*0.3;
  targetY = (P.y + G._bossRef.y)*0.5 + lookY*0.3;
}
G.cam.x += (targetX - G.cam.x) * camSpd;
G.cam.y += (targetY - G.cam.y) * camSpd;
```

---

### STEP 14: 사망 화면 리디자인

```css
#death {
  position: fixed; inset: 0; z-index: 40;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: radial-gradient(ellipse at center, rgba(10,5,15,.92), rgba(2,1,5,.98));
  opacity: 0; pointer-events: none;
  transition: opacity 2.5s ease-out;
}
#death.on { opacity: 1; pointer-events: all; }
.dt {
  font-family: 'Noto Sans KR', sans-serif; font-weight: 700;
  font-size: clamp(1.2rem, 3vw, 2rem);
  color: rgba(180,140,100,.7);
  letter-spacing: .5em;
  text-shadow: 0 0 40px rgba(180,140,100,.2);
  animation: dp 5s ease-in-out infinite;
}
@keyframes dp { 0%, 100% { opacity: .3; } 50% { opacity: .8; } }
```

사망 텍스트: `"빛이 꺼졌다"` 또는 `"어둠이 삼켰다"`

---

## Part B. 스프라이트 & 성능 시스템

### 16. 크롬 성능 병목 — 원인 확정

```
적 1마리 렌더 사이클:
1. whiteTex → 글로우 arc fill    [_setTex → _flush]
2. spriteTexA → 본체 drawImage   [_setTex → _flush]
3. whiteTex → 마커 fillRect      [_setTex → _flush]
... 반복 ...

적 100마리 = 텍스처 스위칭 200~300회/프레임
```

**왜 Firefox는 빠른가?**
```
Firefox: WebGL2 → 네이티브 OpenGL → 텍스처 바인드 비용 낮음
Chrome:  WebGL2 → ANGLE → DirectX 변환 → 텍스처 바인드마다 오버헤드
```

**실측 FPS (현재)**

| 환경 | 적 100 | 적 150 | 적 200 |
|------|--------|--------|--------|
| Firefox/AMD | 240fps | 200fps+ | 170fps+ |
| Chrome/AMD | 40~55fps | 30~45fps | 20~35fps |
| Chrome WARP | ~30fps | ~20fps | 플레이 불가 |

---

### 17. 성능 Tier 시스템

| Tier | 조건 | 최대 몹 | 이펙트 |
|------|------|---------|--------|
| **S** | 초기 avg 120fps+ | 400+ | 풀 ON |
| **A** | 60~120fps | 300 | 블룸/트레일 ON |
| **B** | 40~60fps | 200 | 트레일만 |
| **C** | 40fps 미만 / WARP | 150 | 전부 OFF |

**점진적 강등 순서 (FPS 급락 시)**
```
1차: 바닥 흔적 OFF
2차: 블룸 OFF
3차: 파티클 50% 감소
4차: 스프라이트 애니메이션 → 정지 프레임
5차: Tier 한 단계 강등
```

---

### 18. 스프라이트 아틀라스 시스템 — 핵심 해결책

**아틀라스 레이아웃 (1024×1024)**

```
┌──────────────────────────────────────────────┐
│ Row 0 (y=0,  h=32): 근접(0)×4f | 돌격(2)×6f  │
│ Row 1 (y=32, h=48): 떼(3)×2f   | 탱커(4)×4f  │
│ Row 2 (y=80, h=40): 자폭(5)×4f | 방패(6)×4f  │
│ Row 3 (y=120,h=36): 리치(7)×4f | 화약(8)×4f  │
│ Row 4 (y=156,h=32): 주술(9)×4f | 궁수(1)×4f  │
│ Row 5 (y=188,h=64): 보스 idle×4 | 보스 atk×4 │
│ Row 6 (y=252,h=64): 보스 패턴×4 | 보스 특수×4 │
│ Row 7 (y=316,h=32): 속성 이펙트 오버레이      │
│ Row 8~15:           여유 (추가 적/변형)        │
└──────────────────────────────────────────────┘
```

**코드 변경 (~1920줄)**

```javascript
// ═══ 변경 전 (병목 원인) ═══
const _eSpCache = new Map();
function _getESpr(col, el, r){
  const k = col+'_'+el+'_'+r;
  let c = _eSpCache.get(k); if(c) return c;
  if(_eSpCache.size >= 100) _eSpCache.clear(); // 100개 초과 시 전체 초기화!
  c = document.createElement('canvas');
  // arc + stroke 원형...
  _eSpCache.set(k, c); return c;
}

// ═══ 변경 후 ═══
const _atlas = new Image();
const _atlasUV = {};
let _atlasReady = false;

_atlas.src = 'img/enemy_atlas.png';
_atlas.onload = () => { _atlasReady = true; buildAtlasUV(); };

function drawEnemy(e, frame){
  if(!_atlasReady) return drawEnemyCircle(e); // 폴백
  const uv = _atlasUV[e.etype][frame];
  X.drawImage(_atlas, uv.sx, uv.sy, uv.sw, uv.sh, e.x-uv.sw/2, e.y-uv.sh/2, uv.sw, uv.sh);
  // 같은 _atlas → 배칭 유지 → flush 없음!
}
```

**예상 성능 변화**

| 상황 | 변경 전 draw call | 변경 후 draw call | 크롬 FPS |
|------|------------------|------------------|----------|
| 적 100 | 200~300 | 10~20 | 40→150+ |
| 적 150 | 350~450 | 15~25 | 30→120+ |
| 적 200 | 500~600 | 20~30 | 20→100+ |

---

### 19. 몬스터 스프라이트 — 전 10종

| etype | 이름 | 크기 | 프레임 | 실루엣 핵심 |
|-------|------|------|--------|------------|
| 0 | 해골 보병 | 32×32 | idle×4 | 직립, 칼, 각진 어깨 |
| 1 | 백골 궁수 | 32×32 | idle×4 | 이미 있음 → 아틀라스 이전 |
| 2 | 해골 기사 | 32×32 | idle×4+charge×2 | 뿔 투구, 무거운 갑옷 |
| 3 | 떼거리 임프 | 16×16 | idle×2 | 작고 웅크린, 빛나는 눈 |
| 4 | 해골 장군 | 48×48 | idle×4 | 크고 육중, 돌갑옷 |
| 5 | 자폭 임프 | 24×24 | idle×2+glow×2 | 몸 균열, 빛 새어나옴 |
| 6 | 방패기사 | 40×40 | idle×4 | 대형 방패, 에너지 배리어 |
| 7 | 리치 | 36×36 | float×4 | 부유, 너덜 로브, 마법구 |
| 8 | 화약병 | 28×28 | idle×4 | 폭탄통, 도화선 |
| 9 | 주술사 | 28×28 | idle×2+channel×2 | 주술 포즈, 보라 에너지 |

**지옥층별 팔레트 스왑**

| 지옥 | 팔레트 톤 |
|------|----------|
| 얼음굴 | 파랑-흰, 서리 결정 |
| 곤충굴 | 초록-갈색, 키틴 광택 |
| 악마굴 | 검붉은, 뿔/날개 강조 |
| 괴물굴 | 보라-검정, 촉수/변이 |
| 심해굴 | 청록-암녹, 이끼/산호 |
| 용암굴 | 주황-검정, 균열 빛 |
| 탐욕굴 | 금-보라, 화려+부패 |

---

### 20. 보스 스프라이트 & 브레스

**보스 스프라이트 (64×64, 16프레임)**

```
[0-3]   idle (부유/호흡)
[4-5]   windup (공격 준비)
[6-7]   attack (휘두르기)
[8-9]   charge (돌진)
[10]    cast (마법 시전)
[11]    grab (잡기)
[12-13] roar (브레스/광폭화)
[14-15] stagger (그로기)
```

**7층 보스 고유 스킨**

| 층 | 보스명 | 비주얼 |
|----|--------|--------|
| 1 | 빙결의 군주 | 얼음 왕관, 동결 갑옷 |
| 2 | 군충의 여왕 | 곤충 복합체, 키틴 날개 |
| 3 | 혈마 아스모데 | 뿔 4개, 날개, 화염 눈 |
| 4 | 심연의 거인 | 촉수, 눈 여러개 |
| 5 | 리바이어던 | 해룡, 비늘, 발광 |
| 6 | 용암왕 이프리트 | 용암 균열 몸체 |
| 7 | 고통의 대마왕 | 전 보스 혼합, 형태 변환 |

---

### 21. 캐릭터 모션 강화

**추가 모션**

| 모션 | 파라미터 |
|------|---------|
| 팔 분리 스윙 | 몸통+팔+무기 레이어 분리 |
| 돌진 잔상 | 반투명 복사본 3~5개, alpha: 0.3→0.05 |
| 피격 넉백 | 색상 플래시 3f (tint: #ff0000) |
| 콤보 피니셔 | scale: 1.15, slowMo: 30 |
| 패링 성공 | flash: #ffffff, hitStop: 12 |
| 레벨업 | 수직 빛기둥 + 몸체 발광 |

**무기별 스윙 궤적**

```
대검(sword):  넓은 호 (-90°→+135°, 0.3초)
단검(dagger): 빠른 찌르기 (직선 0→+10→0, 0.12초)
해머(hammer): 내려치기 (0°→+180°, 0.4초, 충격파)
메이스(mace): 사선 휘두르기 (-45°→+90°, 0.25초)
창(spear):    빠른 찌르기 (직선 0→+15→0, 0.15초)
도끼(axe):    대각선 내려치기 (-30°→+150°, 0.35초)
```

---

### 22. 이펙트 & 포스트프로세싱 확장

**파티클 타입**
```
현재: RECT만
추가: CIRCLE, SPARK, RING, EMBER, SNOW, RUNE
```

**사망 이펙트**
```
일반 적: spark 12개 + ring 1개 + rect 잔해 6개
엘리트:  일반 + 모디파이어 색상 폭발 + hitStop 8f
보스:    spark 30개 + ring 3개(시간차) + 화면 플래시 + hitStop 15f + slowMo 60f
```

**히트 슬래시 (타격 궤적선)**
```
수명: 6프레임, 페이드아웃
무기별: 대검 넓은 호, 단검 짧은 직선, 해머 수직선
히트스탑 1-2프레임이 체감 임팩트의 80%
```

---

### 23. 런타임 감지 & 품질 자동 조정

```javascript
// GPU 감지
const dbg = GL.getExtension('WEBGL_debug_renderer_info');
const renderer = GL.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
const isWARP = /Basic Render|SwiftShader|llvmpipe/i.test(renderer);
const isLowEnd = /Intel HD [234]|Mali-4|Adreno 3/i.test(renderer);

// 프레임타임 샘플링 (첫 120프레임 평균)
// < 4ms → Tier S | 4~8ms → Tier A | 8~16ms → Tier B | > 16ms → Tier C
```

---

## Part C. 에셋 & 출시

### 24. AI 에셋 생산 계획 (Genspark + God Mode)

| 카테고리 | 수량 | 도구 | 우선순위 |
|---------|------|------|---------|
| 일반 적 9종 스프라이트시트 | 9장 | Genspark | 🔴 최우선 |
| 보스 베이스 1종 | 1장 | God Mode | 🔴 |
| 보스 변형 7종 | 7장 | God Mode | 🟡 |
| 플레이어 팔/무기 레이어 | 3장 | God Mode | 🟡 |
| 맵 타일 HD 텍스처 | 7세트 | Genspark | 🟡 |
| 속성 이펙트 오버레이 | 1장 | Genspark | 🟢 |

**Genspark 프롬프트 템플릿 (Ori 비주얼 목표)**

```
"2D top-down sprite, dark lyrical fantasy, Ori and the Blind Forest aesthetic,
high contrast luminous silhouette, transparent background,
spritesheet horizontal layout, 32-bit color, anti-aliased,
glowing accents, atmospheric darkness, melancholic mood"

금지: "3D", "realistic", "photograph", "cartoony"
사이즈: 적 128×32 (32×32 × 4f), 보스 1024×64 (64×64 × 16f)
```

---

### 25. 출시 플랫폼 전략

```
[Phase A] 아틀라스 최적화 + 스프라이트 교체 (2주)
    ↓
[Phase B] itch.io 무료 데모 출시
    ↓
[Phase C] Steam Electron 래핑 얼리억세스
    ↓
[Phase D] Unity 이식 정식 출시 (2~3개월)
```

Vampire Survivors 선례: HTML5 프로토 → itch.io → Steam EA → 네이티브 이식

---

### 26. 성능 예산 (크롬 60fps = 16.6ms)

| 항목 | 현재 (ms) | 아틀라스 후 (ms) |
|------|----------|----------------|
| 로직 (update) | 4~8 | 4~8 |
| 맵 렌더 | 1~2 | 1~2 |
| 적 렌더 (150) | **8~14** | **1~3** |
| 파티클 (300) | 1~2 | 1~3 |
| 포스트프로세싱 | 0 | 0.5~1.5 |
| **합계** | **16~30** | **9~19** |

→ 아틀라스만 넣으면 적 렌더 80% 절감 → 크롬 60fps 안정 + 이펙트 추가 여유 확보

---

### 27. QA 매트릭스

**성능 체크 (최소 8조합)**
- [ ] Chrome/AMD 100몹 → 150fps+
- [ ] Chrome/AMD 200몹 → 100fps+
- [ ] Firefox/AMD 100몹 → 250fps+
- [ ] Chrome/iGPU 100몹 → 80fps+

**비주얼 품질 체크**
- [ ] 적 10종 실루엣만으로 식별 가능
- [ ] 속성 틴팅 (화/빙/뇌/암) 한눈에 구분
- [ ] 보스 패턴 windup/attack 예측 가능
- [ ] 사망 이펙트 "시원하다" 느낌
- [ ] Ori 분위기 맵 — 발광+서정적 어둠 달성

**시스템 체크**
- [ ] _hwTier 'C'에서: torch/ambPart/fog/grain/sway/eyes 전부 비활성
- [ ] _hwTier 'B'에서: fog/grain 비활성
- [ ] 앰비언트 파티클 80개 초과 안 함
- [ ] 안개 24개 초과 안 함
- [ ] SWAY 40개, WALL_EYES 8개, GLOW 30개 초과 안 함
- [ ] 보스 시네마틱 1회만 재생
- [ ] `_tseed` 미수정 확인
- [ ] `ELC[]`, `ETYPE_COL[]` 미수정 확인

---

### 28. draw() 렌더링 순서 최종

```
draw() {
  X.clearRect(...)
  X.save(); X.translate(카메라)
  
  // ── 맵 ──
  _mapCvs (Pass 1~5 포함)           ← STEP 2, 3

  // ── 오리 스타일 분위기 오버레이 (스크린 좌표) ──
  하단 안개띠 (LinearGradient, hell별 색상)
  비네팅 (RadialGradient, rgba(0,0,0,.55))
  플레이어 포인트 라이트 (RadialGradient, lighter blend, r=220)

  // ── 맵 위 월드 오브젝트 ──
  [GLOW-ORI] 발광 오브젝트           ← STEP 5
  [AMB-PART] layer=0 앰비언트       ← STEP 8
  [DECOR-SWAY] 동적 흔들림           ← STEP 4
  [DECOR-EYES] 벽 눈동자             ← STEP 4
  
  // ── 엔티티 ──
  적 렌더 (아틀라스)                  ← Part B
  플레이어 렌더
  투사체/이펙트
  전투 파티클
  
  X.restore();
  
  // ── 화면 후처리 (화면 좌표) ──
  색수차 (기존)
  [TORCH] 횃불 조명                  ← STEP 7
  [FOG] 안개                        ← STEP 9
  비네팅 (색조 교체)                  ← STEP 11
  [GRAIN] 필름 그레인                ← STEP 10
  [SCANLINE] 스캔라인                ← STEP 10
  [BOSS-CINE] 보스 시네마틱          ← STEP 12
  HUD (기존)
}
```

---

### 29. 클코 프롬프트 컨텍스트 헤더

**모든 클코 프롬프트 앞에 붙이기**

```
game.html은 20,000줄+ 단일 HTML 파일.
WebGL2 프록시 배칭 렌더러. X = Canvas 2D context proxy.
_flush(), _setTex(), _setBlend(additive)로 GPU 배치 드로잉.
_MTHEME[hell] = {w, f, ac} 7지옥 테마.
HELL_PALETTES[] = 팔레트 스왑 시스템.
buildMapCache() = 맵 오프스크린 캐시 (Pass 1~5).
draw() = 메인 렌더 루프. tick()/update() = 게임 로직.
initStage() = 스테이지 초기화.
G.cam = 카메라, P = 플레이어, ens[] = 적.
OPT = 설정 (bloom, postfx, trail, parts, torch, ambPart, fog, grain).
_hwTier = 'S'/'A'/'B'/'C'.
_atlas = 스프라이트 아틀라스 (1024×1024, 단일 텍스처).
⚠️ _tseed(tx,ty) = 절대 건드리지 마 (결정론적 시드).
⚠️ ELC[], ETYPE_COL[] = 절대 건드리지 마.
⚠️ 게임 루프 내 new Audio(), splice, filter, Date.now() 금지.
성능 최우선 — Chrome 60fps 목표.
기존 코드 존중, 새 기능은 독립 모듈 [태그] 주석으로.
```

**모든 클코 프롬프트 뒤에 붙이기**

```
수정한 코드에 [시스템이름] 주석 달아줘.
OPT 설정으로 on/off 가능하게.
_hwTier 'C'일 때 간소화 로직 포함.
기존 코드와 충돌 안 되는지 확인.
```

---

## 📊 통합 로드맵 (4주)

```
Week 1: 아틀라스 + 즉시 이펙트 코드 (에셋 불필요)
  Day 1-2: 아틀라스 시스템 구현 + 크롬 성능 테스트
  Day 3-4: 팔레트/타일/데코/파티클 타입 확장
  Day 5:   Tier 시스템 v2 + 점진적 강등

Week 2: 환경 비주얼 14 STEP
  Day 6-7: STEP 1~5 (팔레트~발광오브젝트)
  Day 8-9: STEP 6~11 (횃불~비네팅)
  Day 10:  STEP 12~14 (시네마틱~사망화면)

Week 3: 스프라이트 에셋 + 캐릭터
  Day 11-12: Genspark 10종 적 스프라이트 생성 + 통합
  Day 13-14: God Mode 보스 베이스 + 7층 변형
  Day 15:    캐릭터 모션 강화 (무기별 궤적)

Week 4: 출시 준비
  Day 16-17: QA 매트릭스 8조합 검증
  Day 18-19: itch.io 빌드 + Steam Electron 테스트
  Day 20:    itch.io 무료 데모 배포
```

---

*v3.0 MASTER — 출시최적화_그래픽_v2 + 비주얼시스템_final-spec v1.0 완전 통합*
*절대 수정 금지: `ELC[]`, `ETYPE_COL[]`, `_tseed(tx,ty)`*

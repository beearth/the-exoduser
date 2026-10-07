> 2026-10-01 현행 상단 상태 표시: [UI03 검수/수치 계약](../0마스터플랜/mac-resume-20261001/UI03-상단전투정보-검수.md). 아래 예전 스타일 예시는 설계 이력이며, opacity·색·글꼴·600px 배치는 ui-refinement.css의 #hudTop 규칙이 우선한다.

# THE EXODUSER — HUD 리디자인 마스터 플랜

> 2026-09-27 인벤토리 최신 창 규격은 [장비 시스템 최신 절](../2_7%20인벤토리+장비시스템/2_7%20인벤토리+장비시스템.md)의 `100dvh−24px`(620px 이하 `−8px`) 및 장비/가방/정보 가변폭 1.28fr/clamp(400px,30vw,600px)/1fr이다. 아래 기존 270px 장비 행과 680px 창 높이는 당시 제작 기록이다.

> 2026-09-12 튜토리얼 예외: 사용자 GPT 디자인 요청에 따라 1-1 패링 연습 패널에 생성 배경 1개를 사용한다. 기존 전투 HUD의 아래 제약은 유지한다. [튜토리얼 UI 사양](../2게임디자인레벨디자인/PARRY_TUTORIAL_20260912.md)

> **목표**: "프로그래머 UI" → 게임 아이덴티티가 있는 HUD
> **디자인 컨셉**: "단조된 철과 잔불" (Forged Iron & Ember)
> **제약**: 외부 이미지 0개. 순수 CSS + inline SVG + Canvas HUD만 사용.
> **파일**: game.html (21,814줄)

---

## 🎯 디자인 비전

```
현재:  프로그래머가 만든 기능적 UI — 작동은 하지만 개성 없음
목표:  "이 HUD만 봐도 어떤 게임인지 안다"

레퍼런스 매핑:
- Dead Cells → 세그먼트 HP바 + 무기 프리뷰
- Hollow Knight → 극도의 미니멀 + 커스텀 아이콘
- Hades → 보석 프레임 + 풍부한 장식
- Blasphemous → 고딕 장식 + 로자리오/기도 게이지

EXODUSER = Hades급 장식 밀도 × Blasphemous 고딕 톤
         = "지옥 대장간에서 단조된 철 프레임"
```

**컬러 팔레트 (HUD 전용)**:
- 철 프레임: `#2a1f18` (어두운 철) → `#4a3828` (밝은 철)
- 테두리 하이라이트: `#6b4f3a` (따뜻한 금속광)
- 리벳/장식: `#8a6840` (황동)
- HP 빨강: `#cc2200` → `#ff4422` (그라디언트)
- ST 초록: `#226600` → `#44cc00`
- DP 보라: `#442288` → `#7744cc`
- SH 파랑: `#2244aa` → `#44aaff`
- 잔불 글로우: `rgba(255,120,40,.15)` (모든 활성 요소에 은은하게)

---

## 현재 → 목표 비교

### HP/ST/DP 바

**현재**:
```
[HP] ████████████░░░░░░░  ← 12px 직선, border-radius:2px, 그라디언트만
[ST] █████████░░░░░░░
[DP] ██████░░░░░░
```

**목표**:
```
┌─── 철 프레임 (beveled border + inner shadow) ───┐
│ HP ▓▓▓▓▓▓▓▓▓▓░░░░░  348/500  │  ← 숫자 표시
│    ╵    ╵    ╵    ╵          │  ← 25% 세그먼트 눈금
└─── 바 아래 미세한 잔불 글로우 ───┘
```

### 퀵슬롯

**현재**:
```
[1][2][3][4][Q][SP][CT] | [Z] | [E🔮][SH💨][F👿] | [K📜][G⚒️][TAB🎒][ESC⚙️]
 ← 46px 사각, 이모지, 플랫 border
```

**목표**:
```
┌─ 스킬 그룹 (철 프레임) ─┐  ┌─ 필살 ─┐  ┌─ 액션 ─┐  ┌─ 메뉴 ─┐
│ [1][2][3][4][Q][SP][CT] │  │ [Z]  │  │[E][⇧][F]│  │[K][G]… │
│  SVG 아이콘 + 쿨다운    │  │ 붉은光│  │ SVG    │  │ SVG   │
└── 리벳 장식 ──────────┘  └──────┘  └────────┘  └───────┘
```

### 포이즈 게이지
스킬바(`#skBar`) 상단에 가로 바 표시.
- 위치: 퀵슬롯 행 바로 위, 높이 6px
- 색상: 50%+ 흰색(#fff→#ddc), 25~50% 주황(#fa4→#f62), 25%↓ 빨강(#f33→#a00)
- `P.poise / P.maxPoise` 비율로 width% 업데이트
- 포이즈 0 → 기절(pStun) 발동, 게이지 리셋

### 상단 HUD

**현재**:
```
[이름] [LV.1] [━EXP━] | [💀 0] [👿 0] [⭐ 0] [⚡ 0] | [? 조작법]
 ← 전부 같은 크기 텍스트, 그룹핑 약함
```

**목표**:
```
┌ 캐릭터 ─────────┐         ┌ 리소스 (작은 아이콘+숫자) ┐
│ 이름  LV.12     │         │ 💀23  👿5  ⭐3  ⚡1,280  │
│ ═══EXP════░░░░  │         └──────────────────────────┘
└─────────────────┘
```

---

## WORK 1: HP/ST/DP/SH 바 리디자인

### 1-A: CSS 교체

**기존 CSS 삭제** (line ~30~40 근처):
```css
/* 삭제 대상 */
.bar{height:12px;border:1px solid rgba(255,255,255,.15);overflow:hidden;border-radius:2px}
.bar.hp{width:220px;background:rgba(80,0,0,.4)}
.bar.hp .fill{background:linear-gradient(90deg,#880000,#cc2200)}
.bar.st{width:170px;background:rgba(0,50,0,.4)}
.bar.st .fill{background:linear-gradient(90deg,#226600,#44aa00)}
.bar.mp{width:130px;background:rgba(0,25,70,.4)}
.bar.mp .fill{background:linear-gradient(90deg,#224488,#4488dd)}
.bar.sh{width:220px;background:rgba(0,30,80,.4)}
.bar.sh .fill{background:linear-gradient(90deg,#2244aa,#44aaff)}
.fill{height:100%;transition:width .12s}
.bar-label{color:#aaa;font-size:1.1rem;width:32px;text-align:right;font-weight:700}
```

**신규 CSS**:
```css
/* ══ HUD 바 — Forged Iron ══ */
.bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}
.bar-label {
  color: #8a7860;
  font-size: .75rem;
  width: 22px;
  text-align: right;
  font-weight: 900;
  letter-spacing: .05em;
  text-shadow: 0 1px 2px rgba(0,0,0,.8);
}
.bar {
  height: 16px;
  position: relative;
  overflow: hidden;
  /* 철 프레임: 3중 border로 beveled 효과 */
  border: 2px solid #3a2a1e;
  outline: 1px solid #1a1008;
  box-shadow:
    inset 0 1px 3px rgba(0,0,0,.6),      /* 내부 상단 그림자 */
    inset 0 -1px 2px rgba(255,200,100,.04), /* 내부 하단 반사 */
    0 1px 4px rgba(0,0,0,.5);              /* 외부 그림자 */
}
/* 바 배경: 어두운 철판 느낌 */
.bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20,12,8,.9), rgba(30,18,12,.7));
  z-index: 0;
}
.fill {
  height: 100%;
  transition: width .15s ease-out;
  position: relative;
  z-index: 1;
}
/* 바 위에 세그먼트 눈금 (25% 간격) */
.bar::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent calc(25% - 1px),
    rgba(0,0,0,.4) calc(25% - 1px),
    rgba(0,0,0,.4) 25%
  );
}
/* 바 우측 수치 표시 */
.bar-val {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: .6rem;
  font-weight: 700;
  color: rgba(255,255,255,.5);
  z-index: 3;
  text-shadow: 0 1px 2px rgba(0,0,0,.9);
  letter-spacing: .03em;
}

/* ── 개별 바 ── */
.bar.hp { width: 230px; }
.bar.hp .fill {
  background: linear-gradient(90deg, #881100, #cc2200, #ee3311);
  box-shadow: 0 0 8px rgba(255,50,0,.2);
}
.bar.st { width: 180px; }
.bar.st .fill {
  background: linear-gradient(90deg, #1a5500, #33aa00, #44cc00);
  box-shadow: 0 0 6px rgba(80,200,0,.15);
}
.bar.mp { width: 140px; }
.bar.mp .fill {
  background: linear-gradient(90deg, #332266, #5533aa, #7744cc);
  box-shadow: 0 0 6px rgba(120,70,200,.2);
}
.bar.sh { width: 230px; }
.bar.sh .fill {
  background: linear-gradient(90deg, #1a3388, #3366cc, #44aaff);
  box-shadow: 0 0 8px rgba(80,150,255,.15);
}

/* ── 위험 상태 (HP 30% 이하) ── */
.bar.hp.danger .fill {
  animation: hpPulse 1s ease-in-out infinite;
}
@keyframes hpPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(255,50,0,.2); }
  50% { box-shadow: 0 0 16px rgba(255,50,0,.5), inset 0 0 8px rgba(255,100,0,.15); }
}
```

### 1-B: HTML 교체

**기존 bar-wrap 교체** (hud-left 내부):
```html
<div class="hud-left">
  <div class="bar-wrap">
    <span class="bar-label">HP</span>
    <div class="bar hp" id="hpBar">
      <div class="fill" id="hpF"></div>
      <span class="bar-val" id="hpVal"></span>
    </div>
    <span id="hpPotCd" style="font-size:.7rem;color:#ff6633;font-weight:700;min-width:32px;margin-left:2px"></span>
  </div>
  <div class="bar-wrap" id="shWrap" style="display:none">
    <span class="bar-label">SH</span>
    <div class="bar sh" id="shBar">
      <div class="fill" id="shF"></div>
      <span class="bar-val" id="shVal"></span>
    </div>
  </div>
  <div class="bar-wrap">
    <span class="bar-label">ST</span>
    <div class="bar st">
      <div class="fill" id="stF"></div>
    </div>
  </div>
  <div class="bar-wrap">
    <span class="bar-label">DP</span>
    <div class="bar mp">
      <div class="fill" id="mpF"></div>
    </div>
  </div>
</div>
```

### 1-C: JS — updateHUD() 수정

기존 `updateHUD()` 에서 **HP 수치 표시 + 위험 상태 클래스** 추가:

```javascript
// 기존 코드 바로 아래에 추가:
// HP 수치 표시
const _hpEl=$('hpVal');
if(_hpEl) _hpEl.textContent = ~~P.hp + '/' + ~~P.mhp;

// HP 위험 상태
const _hpBar=$('hpBar');
if(_hpBar) {
  if(P.hp/P.mhp <= 0.3) _hpBar.classList.add('danger');
  else _hpBar.classList.remove('danger');
}

// SH 수치 표시
const _shEl=$('shVal');
if(_shEl && P.mshield>0) _shEl.textContent = ~~P.shield + '/' + ~~P.mshield;
```

---

## WORK 2: 퀵슬롯 프레임 리디자인

### 2-A: CSS 교체

**기존 .qs CSS 삭제 후 교체**:
```css
/* ══ 퀵슬롯 — Forged Iron ══ */
.qs-row {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  margin-bottom: 6px;
  align-items: center;
}

/* 슬롯 그룹 프레임 */
.qs-group {
  display: flex;
  gap: 3px;
  padding: 3px 5px;
  border: 2px solid #3a2a1e;
  background: linear-gradient(180deg, rgba(30,20,12,.6), rgba(20,12,8,.8));
  box-shadow:
    inset 0 1px 0 rgba(255,200,100,.04),
    0 2px 6px rgba(0,0,0,.5);
  position: relative;
}
/* 그룹 라벨 */
.qs-group::before {
  content: attr(data-label);
  position: absolute;
  top: -8px;
  left: 6px;
  font-size: .45rem;
  color: #6b4f3a;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  background: #1a0e08;
  padding: 0 3px;
}
/* 스킬 그룹 강조 */
.qs-group.skill { border-color: rgba(204,102,34,.3); }
.qs-group.action { border-color: rgba(100,120,200,.2); }
.qs-group.menu { border-color: rgba(120,110,100,.2); }
.qs-group.ult { border-color: rgba(200,50,0,.4); }

/* 개별 슬롯 */
.qs {
  width: 44px;
  height: 44px;
  background: linear-gradient(180deg, rgba(40,28,18,.9), rgba(25,16,10,.95));
  border: 1.5px solid #4a3828;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  position: relative;
  pointer-events: all;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
  /* 미세한 철판 텍스처 */
  box-shadow:
    inset 0 1px 0 rgba(255,200,100,.03),
    inset 0 -1px 2px rgba(0,0,0,.3);
}
.qs:hover {
  border-color: #8a6840;
  box-shadow:
    inset 0 1px 0 rgba(255,200,100,.06),
    0 0 8px rgba(255,150,50,.1);
}
.qs.empty { opacity: .35; }
.qs.cd {
  border-color: #2a2018;
  opacity: .5;
}

/* 슬롯 키 라벨 */
.qs .qs-key {
  position: absolute;
  top: 2px;
  left: 3px;
  font-size: .7rem;
  color: #7a6850;
  font-weight: 900;
  text-shadow: 0 1px 1px rgba(0,0,0,.8);
}
/* 슬롯 수량 */
.qs .qs-cnt {
  position: absolute;
  bottom: 1px;
  right: 3px;
  font-size: .75rem;
  color: #ccaa77;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,.9);
}
/* 자동 사용 표시 */
.qs .qs-auto {
  position: absolute;
  top: 2px;
  right: 3px;
  font-size: .7rem;
  color: #44ff88;
  font-weight: 700;
  display: none;
  text-shadow: 0 0 4px rgba(68,255,136,.5);
}
.qs.auto-on .qs-auto { display: block; }
.qs.auto-on {
  box-shadow: inset 0 0 10px rgba(68,255,136,.15);
  border-color: #44aa66;
}

/* 스킬 장착 슬롯 활성 */
.qs.skill-active {
  border-color: #cc6622;
  box-shadow: inset 0 0 10px rgba(204,102,34,.25), 0 0 6px rgba(255,120,40,.1);
}

/* 쿨다운 오버레이 */
.qs .qs-cd-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.55);
  pointer-events: none;
  transition: height .1s;
}
.qs .qs-cd-text {
  position: absolute;
  bottom: 1px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: .75rem;
  color: #ff8844;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0,0,0,.9);
}
/* 슬롯 이름 라벨 */
.qs .qs-name {
  position: absolute;
  bottom: 1px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: .45rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,.9);
}

/* 플래시 애니메이션 */
.qs-flash { animation: qsFlash .3s; }
@keyframes qsFlash {
  0% { border-color: #ffdd44; box-shadow: inset 0 0 15px rgba(255,220,68,.4), 0 0 10px rgba(255,200,50,.3); }
  100% { border-color: #4a3828; box-shadow: none; }
}
/* 스왑 선택 */
.qs.swap-sel {
  border-color: #ffcc44 !important;
  box-shadow: 0 0 10px rgba(255,204,68,.4) !important;
}
/* 드래그 드롭 */
.qs.sk-drop-hover {
  border-color: #ffcc44 !important;
  box-shadow: 0 0 16px rgba(255,200,60,.5), inset 0 0 12px rgba(255,200,60,.2) !important;
  transform: scale(1.1);
  transition: all .12s;
}
```

### 2-B: HTML — 퀵슬롯 그룹에 data-label 추가

**기존 qsRow 내부 교체**:
```html
<div class="qs-row" id="qsRow">
  <!-- 전투 스킬 그룹 -->
  <div class="qs-group skill" data-label="SKILL">
    <div class="qs empty" id="qs0"><span class="qs-key">1</span><span class="qs-auto">A</span><span class="qs-cnt"></span></div>
    <div class="qs empty" id="qs1"><span class="qs-key">2</span><span class="qs-auto">A</span><span class="qs-cnt"></span></div>
    <div class="qs empty" id="qs2"><span class="qs-key">3</span><span class="qs-auto">A</span><span class="qs-cnt"></span></div>
    <div class="qs empty" id="qs3"><span class="qs-key">4</span><span class="qs-auto">A</span><span class="qs-cnt"></span></div>
    <div class="qs empty" id="qs5"><span class="qs-key" style="font-size:.55rem">Q</span><span class="qs-cnt"></span></div>
    <div class="qs empty" id="qs4"><span class="qs-key" style="font-size:.5rem">SP</span><span class="qs-cnt"></span></div>
    <div class="qs empty" id="qs6"><span class="qs-key" style="font-size:.5rem">CT</span><span class="qs-cnt"></span></div>
  </div>
  <!-- 필살기 -->
  <div class="qs-group ult" data-label="ULT">
    <div class="qs" id="ultSlot" style="cursor:pointer" onclick="_cycleUlt()"></div>
  </div>
  <!-- 액션키 그룹 -->
  <div class="qs-group action" data-label="ACTION">
    <div class="qs" id="qsE"><span class="qs-key" style="font-size:.55rem">E</span></div>
    <div class="qs" id="qsSH"><span class="qs-key" style="font-size:.5rem">SH</span></div>
    <div class="qs" id="qsF"><span class="qs-key" style="font-size:.55rem">F</span></div>
  </div>
  <!-- 메뉴 그룹 -->
  <div class="qs-group menu" data-label="MENU">
    <div class="qs" id="qsK"><span class="qs-key" style="font-size:.55rem">K</span></div>
    <div class="qs" id="qsG"><span class="qs-key" style="font-size:.55rem">G</span></div>
    <div class="qs" id="qsTAB"><span class="qs-key" style="font-size:.4rem">TAB</span></div>
    <div class="qs" id="qsESC"><span class="qs-key" style="font-size:.4rem">ESC</span></div>
  </div>
</div>
```

### 2-C: SVG 아이콘 상수 (이모지 대체)

JS에 상수 추가 — `_updateActionKeys()` 등에서 이모지 대신 사용:

```javascript
// ═══ [HUD-ICONS] SVG 아이콘 (이모지 대체) ═══
const HUD_ICON = {
  magic: '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" fill="none" stroke="#7744cc" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#aa66ff"/><line x1="9" y1="2" x2="9" y2="5" stroke="#7744cc" stroke-width="1"/><line x1="9" y1="13" x2="9" y2="16" stroke="#7744cc" stroke-width="1"/><line x1="2" y1="9" x2="5" y2="9" stroke="#7744cc" stroke-width="1"/><line x1="13" y1="9" x2="16" y2="9" stroke="#7744cc" stroke-width="1"/></svg>',
  
  dash: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 9 L15 9" stroke="#88ccff" stroke-width="2" stroke-linecap="round"/><path d="M10 5 L15 9 L10 13" fill="none" stroke="#88ccff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 6 L5 9 L2 12" fill="none" stroke="#6699aa" stroke-width="1" opacity=".5"/></svg>',
  
  absorb: '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="5" fill="none" stroke="#cc4422" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ff6644"/><path d="M9 1 L9 4 M9 14 L9 17 M1 9 L4 9 M14 9 L17 9" stroke="#cc4422" stroke-width="1" opacity=".6"/></svg>',
  
  skill: '<svg width="18" height="18" viewBox="0 0 18 18"><rect x="3" y="2" width="12" height="14" rx="1" fill="none" stroke="#aa8844" stroke-width="1.2"/><line x1="5" y1="5" x2="13" y2="5" stroke="#aa8844" stroke-width=".8"/><line x1="5" y1="8" x2="13" y2="8" stroke="#aa8844" stroke-width=".8"/><line x1="5" y1="11" x2="10" y2="11" stroke="#aa8844" stroke-width=".8"/></svg>',
  
  forge: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M5 3 L9 7 L13 3" fill="none" stroke="#cc7744" stroke-width="1.5" stroke-linejoin="round"/><rect x="7" y="7" width="4" height="8" rx="1" fill="none" stroke="#cc7744" stroke-width="1.2"/><line x1="4" y1="15" x2="14" y2="15" stroke="#cc7744" stroke-width="1.5"/></svg>',
  
  bag: '<svg width="18" height="18" viewBox="0 0 18 18"><rect x="3" y="7" width="12" height="9" rx="1.5" fill="none" stroke="#669966" stroke-width="1.2"/><path d="M6 7 V5 a3 3 0 0 1 6 0 V7" fill="none" stroke="#669966" stroke-width="1.2"/></svg>',
  
  gear: '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="3" fill="none" stroke="#888" stroke-width="1.2"/><path d="M9 2v2 M9 14v2 M2 9h2 M14 9h2 M4.2 4.2l1.4 1.4 M12.4 12.4l1.4 1.4 M4.2 13.8l1.4-1.4 M12.4 5.6l1.4-1.4" stroke="#888" stroke-width="1"/></svg>',
  
  bow: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 3 C4 3 4 15 4 15" stroke="#aa8855" stroke-width="1.2" fill="none"/><path d="M4 3 Q12 9 4 15" stroke="#aa8855" stroke-width="1.2" fill="none"/><line x1="4" y1="9" x2="14" y2="9" stroke="#ccaa66" stroke-width="1"/><path d="M12 7 L15 9 L12 11" fill="#ccaa66"/></svg>'
};
```

### 2-D: _updateActionKeys() 수정

기존 이모지(`🔮💨👿⚒️📜🎒⚙️`)를 `HUD_ICON.xxx`로 교체.

**교체 패턴** (각 슬롯별):
```javascript
// 기존: <span style="font-size:14px">🔮</span>
// 신규: <span style="display:flex;align-items:center;justify-content:center">${HUD_ICON.magic}</span>

// 기존: <span style="font-size:14px">💨</span>
// 신규: <span style="...">${HUD_ICON.dash}</span>

// 기존: <span style="font-size:14px">👿</span>
// 신규: <span style="...">${HUD_ICON.absorb}</span>

// 기존: <span style="font-size:14px">📜</span>
// 신규: <span style="...">${HUD_ICON.skill}</span>

// 기존: <span style="font-size:14px">⚒️</span>
// 신규: <span style="...">${HUD_ICON.forge}</span>

// 기존: <span style="font-size:14px">🎒</span>
// 신규: <span style="...">${HUD_ICON.bag}</span>

// 기존: <span style="font-size:14px">⚙️</span>
// 신규: <span style="...">${HUD_ICON.gear}</span>
```

또한 `updateQS()` 에서 빈 슬롯 기본 아이콘도 교체:
```javascript
// 기존: ${i===4?'\u{1F3F9}':'🔮'}
// 신규: ${i===4?HUD_ICON.bow:HUD_ICON.magic}
```

각 슬롯 하단 이름 라벨도 `<div class="qs-name" style="color:#6699aa">돌진</div>` 형태로 통일.

---

## WORK 3: 상단 HUD 리디자인

### 3-A: CSS

```css
/* ══ 상단 HUD — Forged Iron ══ */
.hud-top {
  position: fixed;
  top: 8px;
  left: 12px;
  z-index: 20;
  pointer-events: none;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  opacity: 0;
  transition: opacity .5s;
}
.hud-top.on { opacity: 1; }

/* 캐릭터 정보 블록 */
.hud-char {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 10px 6px;
  border: 1.5px solid #3a2a1e;
  background: linear-gradient(180deg, rgba(30,20,12,.8), rgba(20,12,8,.9));
  box-shadow: 0 2px 6px rgba(0,0,0,.5);
}
.hud-char-name {
  color: #cc8855;
  font-size: .85rem;
  font-weight: 900;
  letter-spacing: .08em;
  text-shadow: 0 1px 3px rgba(0,0,0,.8);
}
.hud-char-lv {
  color: #ffaa00;
  font-size: .75rem;
  font-weight: 700;
}
/* 경험치 바 (캐릭터 블록 내부) */
.hud-exp {
  width: 100%;
  height: 3px;
  background: rgba(0,0,0,.5);
  border: 1px solid #2a1f18;
  margin-top: 2px;
}
.hud-exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #aa7700, #ffcc00);
  box-shadow: 0 0 4px rgba(255,200,0,.3);
  transition: width .2s;
}

/* 리소스 블록 */
.hud-res {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 3px 8px;
  border: 1px solid #2a2018;
  background: rgba(15,10,6,.7);
}
.hud-res-item {
  color: #8a7860;
  font-size: .8rem;
  font-weight: 700;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,.8);
}
```

### 3-B: HTML 교체

```html
<div class="hud-top" id="hudTop">
  <div class="hud-char">
    <div style="display:flex;align-items:baseline;gap:6px">
      <span class="hud-char-name" id="charNameHud"></span>
      <span class="hud-char-lv" id="lvLbl">LV. 1</span>
    </div>
    <div class="hud-exp" id="expBar">
      <div class="hud-exp-fill" id="expF" style="width:0%"></div>
    </div>
  </div>
  <div class="hud-res">
    <span class="hud-res-item" id="killCnt" style="color:#aa8866">💀 0</span>
    <span class="hud-res-item" id="matCnt" style="color:#cc66ff;cursor:pointer;pointer-events:all" title="[G] 대장간">👿 0</span>
    <span class="hud-res-item" id="spCnt" style="color:#ffcc00;cursor:pointer;pointer-events:all" title="[C] 능력치">⭐ 0</span>
  </div>
  <div class="hud-res">
    <span class="hud-res-item" id="cpHud" style="color:#ffcc44;font-size:.9rem">⚡ 0</span>
  </div>
  <div class="st-b" id="keyGuideToggle" style="color:#5a4a3a;font-size:.8rem;cursor:pointer;pointer-events:all;user-select:none">⌨</div>
</div>
```

**변경점**:
- 캐릭터 이름+레벨+EXP바를 철 프레임 블록으로 묶음
- 리소스(킬/악의/SP)를 별도 블록으로
- CP(전투력)를 별도 블록으로
- "? 조작법" → 키보드 아이콘 "⌨"로 축소
- `expBar`가 캐릭터 블록 안으로 이동

### 3-C: JS 수정

`updateHUD()` 에서 expBar opacity 설정하는 코드 확인:
```javascript
// 기존: $('expBar').style.opacity='1';
// 이제 hud-top.on 클래스로 제어되므로 이 줄 삭제 또는 유지 (무해)
```

---

## WORK 4: HUD 전체 배경 그라데이션

**목표**: HUD 하단에 은은한 어둠→투명 그라데이션으로 게임 화면과 분리.

```css
#hud::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(5,3,2,.6), transparent);
  pointer-events: none;
  z-index: -1;
}
```

상단도:
```css
.hud-top::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -12px;
  right: -12px;
  bottom: -8px;
  background: linear-gradient(to bottom, rgba(5,3,2,.4), transparent);
  pointer-events: none;
  z-index: -1;
  border-radius: 0 0 8px 0;
}
```

---

## 작업 순서

| 순서 | 작업 | 영향 범위 | 위험도 |
|------|------|----------|--------|
| **WORK 1** | HP/ST/DP/SH 바 | CSS 교체 + HTML 소폭 + JS 3줄 | ⭐⭐ |
| **WORK 2** | 퀵슬롯 프레임 + SVG 아이콘 | CSS 교체 + HTML 교체 + JS 상수+교체 | ⭐⭐⭐ |
| **WORK 3** | 상단 HUD | CSS 추가 + HTML 교체 | ⭐⭐ |
| **WORK 4** | 배경 그라데이션 | CSS 2개 추가 | ⭐ |

**WORK 순서**: 1 → 2 → 3 → 4 (문서 순서대로 진행)

---

## 컨텍스트 (클코에 같이 전달)

- game.html 단일 파일, 현재 21,814줄
- `updateHUD()` — line 21957 근처. 빠른경로(매 3프레임) + 느린경로(매 30프레임)
- `updateQS()` — line 7065. 퀵슬롯 7개(qs0~qs6) + 필살기(ultSlot) 갱신
- `_updateActionKeys()` — line 7138. E/SH/F/K/G/TAB/ESC 슬롯 갱신
- `_updateUltSlot()` — line 7119. Z슬롯(필살기) 갱신
- 기존 인라인 style로 박힌 퀵슬롯 그룹 div 3개 (전투/액션/메뉴) → `.qs-group` 클래스로 교체
- `HUD_ICON` 상수는 전역 스코프에 추가 (BINDS 근처)
- `$()` = `document.getElementById()` 래퍼
- `keyName(bind)` = 키 표시명 변환 함수
- `_tseed()`, `ELC[]`, `ETYPE_COL[]` = 절대 수정 금지
- 외부 이미지/CDN 금지 — SVG inline만 허용
- 기존 이벤트 리스너(qs0~6 click/contextmenu, qsK/G/TAB/ESC click) 유지 필수
- `qsFlash`, `swap-sel`, `sk-drop-hover` 클래스 유지 필수 (드래그앤드롭 시스템)

---

## 2026-08-08 — 인게임 시네마틱 HUD 정리 완료

> 범위: `game.html`의 **플레이 중 HUD 표현만** 변경. 맵·카메라·캐릭터·몬스터·전투·스테이지/결과 로직은 변경하지 않는다.

### 항상 표시하는 정보

| 위치 | DOM/표현 | 표시 규칙 | 갱신 원본 | 적용 위치 |
|---|---|---|---|---|
| 상단 중앙 2행 | `#spCnt` → `✦ {SP}` | `SP` 라벨 제거. AP가 있을 때만 `+{AP}` 보조 수치. `#stageClock` 아래 기준 `+32px×--ui-scale`에 중앙 정렬해 좌측 미니맵을 비움. 테두리·배경·구분선 없음 | `P.sp`, `P.ap` | `updateHUD(true)` |
| 상단 중앙 2행 | `#cpHud` → `◇ {CP}` | 지옥/층 접두어 및 `CP` 라벨 제거. SP·콤보와 동일한 **텍스트 전용** 보조 정보 묶음 | `calcCP().total` | `updateHUD(true)` |
| 상단 중앙 | `#stageTimerHud` → `MM:SS` | `TIME`, `CLEAR`, `TOTAL`, BEST 표기를 플레이 중 숨김 | `G.stageTime / 60` | `updateHUD(true)` |
| 상단 중앙 | `#stageProgressFill` | 숫자 없이 2px 진행선만 표시 | `G._stageKills / G._totalSpawned × 100` | `updateHUD(true)`, width `.6s ease-out` |
| 우측 상단 | `#hudLevelLabel` + `#lvLbl` | **레벨 10**처럼 이름+아라비아 숫자. `_hudRoman` 제거, 3999 표시 상한 제거 | `P.lv` | `updateHUD(true)`, `_hudReadableNumber()` |
| 우측 상단 | `#hudExpLabel` + `#expTxt` → `경험치 {현재 EXP} / {필요 EXP}` | 천단위 쉼표, K/M 축약 없이 정확한 정수. 기존 경험치 라인 유지 | `P.exp`, `P.maxExp` | `updateHUD()` |
| 우측 상단(목표 패널 `#mmLvl`) | `#hudKillLabel` + `#killCnt` → `지역 처치 {처치} / {총스폰}` | 아이콘 대신 뜻이 명확한 라벨과 천단위 쉼표를 표시. 현재 스테이지 진행도(`#stageProgressFill`과 동일 분모) | `G._stageKills / G._totalSpawned` | `updateHUD(true)`, `_hudPulse('killCnt',_stageK)` |
| 우측 상단 | `#hudMaliceLabel` + `#matCnt` | `악의 6,600,000`처럼 정수 전체와 천단위 쉼표 표시. 기존 K/M/B 축약 제거 | `G.mats` | `updateHUD(true)`, `_hudReadableNumber()` |

> **[2026-08-18 correctness fix] 처치 카운터 분자 stale (game.html:50934)**
> - **버그**: `#killCnt`가 `G.kills`(런 전체 누적) / `G._totalSpawned`(스테이지별 스폰) 조합이라, 2번째 지역부터 분자>분모(예: `150 / 92`)로 100% 초과 표시. 바로 아래 진행바(`#stageProgressFill`)는 `G._stageKills/_totalSpawned`로 정상 → 카운터만 어긋남.
> - **canonical**: 스테이지 진행 지표는 `G._stageKills`(initStage에서 0 리셋, 킬마다 `G.kills`와 동시 증가). ([REGION] 2026-09-30부터 게이트 해금=4지역 클리어·`#killCnt`=현재 지역 kills/total·진행바=지역 N/4 — 아래 §REGION HUD 참조. `_stageKills`는 타임어택/폴백 유지)
> - **수정**: 분자를 `G.kills`→`G._stageKills`로 교체(`_hudPulse`도 `_stageK` 기준). 밸런스/기능 변경 없음(표시값만 정정).
> - **검증**: 라이브 시뮬(kills=150,stageKills=20,total=92) `150/92`→`20/92`, 진행바 21.7%와 일치. 스테이지 전환 3회 매번 per-stage 리셋(`1/650`→`1/1000`→`1/1100`), 누적 `G.kills`는 유지. pageerror 0.

### §REGION HUD — 4분면 지역 클리어 가이드 (2026-09-30, SSOT=`docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`)

오픈필드 맵을 4분면 지역(북서/북동/남서/남동, CH1-1은 속성 테마명)으로 나누고 게이트 개방을 "4지역 전부 클리어"로 바꾼 개편의 HUD/UI 반영분.

| 요소 | 값 | 구현 |
|---|---|---|
| `#killCnt` (지역 처치 X / Y) | **현재 지역**(`G._regCurIdx`) `min(kills,total) / total`. 지역 없는 맵(한 변<180타일 소형 맵)은 기존 `_stageKills/_totalSpawned` 폴백 | `updateHUD` slow 경로 인라인 분기 |
| `#stageProgressFill` | **지역 클리어 N/4** 비율(0/25/50/75/100%). 게이트 조건이 지역 단위라 킬 비율보다 명확 — 채택 근거 문서화 | 동일 지점 분기 |
| 지역 입장 배너 [3차 디자인] | 전용 `#regionBanner`(#areaTitle 계열, top 28% — areaTitle/펫대사/구슬 비충돌): KR 지역명 --font-hell-title ls.16em 뼈색 + 양옆 속성색(채도 완화) 다이아 젬 + 금 헤어라인 / EN 대문자 Cinzel ls.32em / 상태줄 `처치 k / t (· 앵글러 생존)` --font-hell 13~15px rgba(219,208,190,.92)(4차 가독성), 정화 지역 재진입 시 `정화`. blur-in/out `regionBanner` 2.7s. 이모지·원색 없음 | `_regionBannerShow(idx,false)` ← `_regionTick` (15프레임 스로틀, 히스테리시스 1.5타일, 쿨다운 5s) |
| 지역 정화 배너 [3차 디자인] | purge 모드: KR `{지역명} — 정화`(금-뼈색) / EN `REGION PURGED · N / 4` + 금 젬 + 지옥불 플레어(`regionFlare` 1.4s) + `SFX.magic`. N=4는 지옥문 개방 연출에 인계(배너 생략). 구 showPH 초록 토스트/addTxt 제거 | `_regionBannerShow(idx,true)` ← `_regionCheckClears` |
| 화면 가장자리 방향 화살표 [3차 디자인] | 고딕 창날(미늘+꼬리 홈)+흑철 외곽+드롭섀도+내부 엠버 코어(타겟색 글로우), 절제 펄스. 라벨: 이름 명조 700 14px 뼈색 / 거리 Cinzel 600 12px 금-은은(이름 바로 아래 +16px), 42px 근접 오프셋. 창날 4차 20% 확대(선단 32px), fillText 8방향 오프셋 그림자(GPU 프록시 strokeText 금지). 타겟별 색(채도 완화): 지역=금-앰버 #d8b778·앵글러=_raDesat(ELC)·지옥문=_raDesat(#66ccff). HUD 세이프존(타이머 아래·스킬바/구슬 위·미니맵/스탯/펫대사 박스 회피, DOM rect 90프레임 캐시). 타겟 화면 안이면 숨김. 아레나/컷신/일시정지/튜토리얼 숨김 — **펫 대사 중에는 표시 유지**. 20프레임 타겟 재계산·per-frame 할당 0 | `_drawRegionArrow`+`_raMeasureSafe` (drawMM 직전) |
| 미니맵 마커 | 4분면 십자선(정적 캐시) + 클리어 지역 **바닥 한정 틴트 오버레이**(`_mmRegOvlEnsure`, 클리어셋 변경 시만 리빌드 ≤4회/스테이지) + **벡터 자물쇠**(`_mmDrawLock`, 봉인 빨강/개방 파랑, 이모지 제거) + CH1-1 앵글러 속성색 원 r3+외곽 1px(생존만) | `_mmTickBuild`/`drawMM` |
| 봉인 안내문 | `지옥문이 봉인됨 — 지역 클리어 N/4`(addTxt) / 포탈 라벨 `▼ 지옥문 봉인 (지역 N/4) ▼` | 기존 지점 분기 |
| DOM 안전 | 신규 DOM 요소 0 (기존 `#ph`/`#killCnt`/`#stageProgressFill` 리프만 갱신, 컨테이너 교체 없음) | — |

### §CLEAR-RESULT — 보스 클리어 결과 블록 (2026-09-30, SSOT=`docs/2게임디자인레벨디자인/클리어결과_점수랭크_20260930.md`)

**[2026-09-30 3차 디자인]** `#stageClear` 패널의 `#clearResult` 리프(`#clearSub`↔`#clearStats` 사이), Hell Gothic 마감(이모지 전면 금지):
- **컨테이너**: 흑철 그라디언트 배경(rgba(18,11,8,.92)→rgba(8,5,4,.94)) + 보더 rgba(102,94,80,.5) + 내부 그림자, max-width 560px, 상단 금 헤어라인.
- **랭크 크레스트**: 68px 회전 다이아 이중 프레임(금 헤어라인+흑철면+랭크색 글로우) 안 랭크 레터 --font-hell-title 1.85rem. 랭크색 저채도: S #e3c27a / A #a9c8a4 / B #9db8cc / C #c2b6a9 / D #8d7c65 (`_RANK_COL`).
- **2열 행**: 라벨 --font-hell ls.2em #c2b6a9 / 수치 Cinzel #e6d6b9(점수 1.18rem 강조), 기준(par) #8d7c65 소자.
- **breakdown**: 2열 그리드, 항목별 라벨 좌(#9a8a72 명조)/수치 우(Cinzel #c9bda6, 감점 −표기 #a8776a), 점선 리더(rgba(164,147,115,.16)). 항목: 처치/지역 정화/보스 처치/시간 보너스/(무사망)/(무피격)/최대콤보/(사망 감점).
- **베스트 행**: 상단 헤어라인 구분, `베스트 t · s · r`(랭크 레터는 랭크색 제목체). **신기록 씰**: 금 보더 소형 태그(rgba(216,183,120,.6) 보더, #d8b778, ls.2em) — 이모지 아님.
- **[4차] 헤더/버튼**: `#clearTitle` #areaTitle 계열(제목체 1.3rem+금 헤어라인)+`#clearTitleEn`(Cinzel 영문 장식줄 ZONE CLEARED/HELL ESCAPED, 항상 영어), `#clearSub` 명조 뼈-은은, `#nextBtn` UI_COMPOSITION 표준 암적색 행동 버튼 마감(min 44px, 기능·id·리스너 무변). 본행/breakdown/베스트 라벨 13px(#cfc3b0/#c5b8a3), par 12px, 타임 1.12rem/점수 1.3rem.
- **하위 `#clearStats`**: 이모지·원색 제거, 명조 #9a8a72/#bcab90 저채도 톤 + `·` 구분자(데이터·의미 무변, 뱃지 텍스트만 유지).
클리어 타임=보스 사망 시점 `G.stageTime` 스냅샷(일시정지/튜토리얼/시네마틱 자동 제외). DOM 안전: 전용 리프 innerHTML만. 데모에선 demoEnd 이전에 표시. nextBtn 진행 흐름 무변경.

### 지역 진입 연출

| 항목 | 값 | 구현 |
|---|---|---|
| 표시 내용 | `제{stage+1}구역 · {STG.kr}` / `THE {STG.n}` | `#areaTitleKr`, `#areaTitleEn` |
| 지속시간 | **3.1초** (진입/유지/페이드 포함) | `.show` + `hudAreaTitle` keyframe |
| 재생 조건 | `G.stage`가 직전 HUD 기록 `_hudAreaStage`와 달라질 때 1회 | `_showHudAreaTitle(G.stage, STG[G.stage])` |
| 화면 영향 | 중앙 상단 일시 표시 후 opacity 0. 상시 HUD는 타이머 1행·보조 정보 2행의 상단 중앙 및 우측 목표 영역에만 유지하며, 좌측 상단은 미니맵 전용으로 비움 | `#areaTitle` |

### 시각 규격과 보존 항목

| 항목 | 규격 | 의도 |
|---|---|---|
| 프레임 | 상단 중앙 자원은 텍스트만 유지. 우측 상태는 최소200px 패널, padding10px 12px, 외곽1px 선과 어두운 배경 | 우측 숫자별 의미와 대비를 확보 |
| 타이포그래피 | 지역명 `--font-hell-title`, 영문/수치 `Cinzel`/`--font-hell` | 현대식 sans HUD 인상을 축소 |
| 색상 | dirty ivory, aged silver, muted bronze만 사용 | 밝은 cyan/네온/gold 패널을 추가하지 않음 |
| 결과 화면 | 기존 `stageClear` 및 종료 결과의 TIME/TOTAL/CLEAR/KILL 상세 통계는 보존 | 상세 분석은 플레이 중이 아닌 결과 시점에만 노출 |
| 안전성 | 기존 ID(`spCnt`, `cpHud`, `killCnt`, `matCnt`, `lvLbl`, `expF`)와 클릭 이벤트 유지 | 능력치 패널, 자원/경험치 갱신, 게임 플레이 로직 보존 |

### 2026-08-23 — 커스텀 미니맵 캐릭터 아이콘 (현행 구현)

| id / 에셋 | 한글명 | 수치·형태 | 적용 위치 | 폴백·갱신 규칙 |
|---|---|---|---|---|
| `img/ui/minimap_warrior.png` | 대검전사 미니맵 초상 | **128×128 PNG**, 투명 배경, 흑발·얼굴 흉터·붉은 망토·흑철 갑옷 얼굴 아이콘 | `_mmPortraitImgs[0]`; `_charIdx=0`일 때 `_mmDrawPlayerMarker()`에서 **14×14px**(`D=14`, `R=7`)로 축소 렌더 | 사용자가 지정한 `ChatGPT Image 2026년 8월 23일 오전 11_03_23.png`를 알파 보존 축소한 전용 에셋이다. |
| `img/ui/minimap_silvertail.png` | 실버테일 미니맵 초상 | **128×128 PNG**, 투명 배경, 은발·청안·하이 포니테일 얼굴 아이콘 | `_mmPortraitImgs[1]`; `_charIdx=1`일 때 같은 크기로 렌더 | 사용자가 지정한 `ChatGPT Image 2026년 8월 23일 오전 10_57_10.png`를 알파 보존 축소한 전용 에셋이다. |
| `_mmPortraitSrc` / `_mmPortraitImgs` | 캐릭터별 초상 선택 | 배열 순서 `[대검전사, 실버테일]` = `CHAR_LIST`의 `charIdx [0,1]`과 동일 | `portrait=_mmPortraitImgs[_charIdx] || _mmPortraitImgs[0]` | 선택 초상이 `complete && naturalWidth > 0`이면 우선 사용한다. 로딩 전/오류 시 `atlas_player`의 `idle_s[0]` 상단 중앙 얼굴 크롭(`fw=frame.w×0.5`, `fy=frame.y+frame.h×0.10`)을 사용하고, 그것도 없으면 `#e8e2d0` 원을 표시한다. 범위 밖 인덱스는 대검전사(0)로 폴백한다. |
| `_mmDrawPlayerMarker()` 방향 화살표 | 플레이어 방향 표시 | 끝점 `R+5.5=12.5px`, 밑변 x=`R+0.5=7.5px`, 반높이 `3.4px`; 흰색 채움 + 검정 `1px` 외곽선 | 초상보다 먼저 `P.facing` 각도로 회전 렌더 | `P.facing`이 숫자일 때만 표시한다. 원형 초상이 화살표 밑부분을 덮어 방향과 얼굴을 한 마커로 읽게 한다. |
| `_mmDrawPlayerMarker()` 초상 테두리 | 미니맵 가독성 링 | 바깥 검정 `2px`(`R+0.5`), 안쪽 흰색 `1px`(`R-0.5`) | 전용 초상/폴백 위에 마지막 렌더 | 지형·방·적 색상과 무관하게 14px 마커 외곽을 유지한다. 동적 마커 갱신 주기는 기존 `drawMM()`의 **20프레임** 캐시 주기를 그대로 따른다. |

- 두 전용 아이콘은 사용자가 지정한 다운로드 PNG를 알파 보존 128×128로 축소했다. 런타임에는 다운로드 원본을 읽지 않고 프로젝트 내부의 `img/ui/minimap_*.png`만 사용한다.
- 새 캐릭터 초상을 읽지 못해도 기존 아틀라스 기반 표시가 유지되므로 미니맵의 플레이어 위치 표시는 사라지지 않는다.

---

## 2026-08-09 — 하단 오브 자원 링 (현행 구현)

> `game.html`의 `updateHUD()` 빠른 경로가 오브 수위와 링을 함께 갱신한다. 좌측의 파란 링은 방어용 에너지 쉴드, 우측의 노란 링은 **Shift 사슬기동 게이지**다. 사슬기동은 기존 `_harpGauge`를 소비·재생하므로, ST(`P.st`)와 동일시하지 않는다.

| id / DOM | 한글명 | 위치·색상 | 갱신 원본·공식 | 표시 규칙 | 적용 위치 |
|---|---|---|---|---|---|
| `shieldRing` | 에너지 쉴드 링 | 좌측 HP 오브 외곽, 파랑 `#3399ff` | `shPct = clamp(P.shield / P.mshield × 100)` | `P.mshield > 0`일 때만 `conic-gradient`로 잔량을 표시. 0이면 링을 숨긴다. | `#globeHP > .globe-ring-wrap`, `updateHUD()` |
| `mobilityRing` + `mobilityRingTicks` | 공용 기동게이지 링 | 우측 MP/SP 오브 외곽, 노랑 `#ffcc33` / `rgba(255,204,51,.95)` | 채움: `mobilityPct = clamp(_harpGauge / _HARP_GAUGE_MAX, 0, 1) × 100`; 구분선: `shiftCellDeg = 360 × _HARP_GAUGE_COST[1] / _HARP_GAUGE_MAX` | Shift 사슬기동과 방향키 더블탭 전격이동이 같은 게이지를 소비한다. `mobilityRingTicks`가 1단 탭 코스트(45)마다 간격을 내며, **한 칸은 최소 사슬 이동거리 1회(45), 전격이동은 0.7칸(31.5)**를 뜻한다. 기본 5칸(225)이며, 게이지가 0이면 채움 링을 숨기고 빈 트랙과 구분선은 유지한다. | `#globeMP > .globe-ring-wrap`, `updateHUD()` |
| `stFill`, `stCur`, `stMax` | SP 수치·수위 | 우측 오브의 오른쪽 반, 초록 | `P.st / P.mst` | 기존 수위·숫자 표기는 유지한다. 노란 사슬기동 링은 ST와 독립된 기존 `_harpGauge` 보조표시다. | `#globeMP`, `updateHUD()` |

- 공통 링은 오브의 붉은 프레임 가장자리 안쪽(`inset: 11px`)에 두고, 글라스 레이어 위(`z-index: 33`)에 렌더한다.
- 노란 링은 새 자원을 만들지 않고, 기존 `_harpGauge`를 즉시 읽도록 한 HUD 표현이다. Shift 사슬기동과 전격이동(방향키 더블탭)이 이를 공용으로 사용한다. SP 수위는 초록 오브 수위와 숫자로 별도 확인한다.
- 노란 링의 구분선은 장식용 균등 점선이 아니다. 최대치가 변해도 최소 Shift 탭 1회분인 `_HARP_GAUGE_COST[1]`(45)마다 배치되어, 각 칸이 최소 사슬 이동거리 1회를 보장한다. 구분 간격은 `3deg`, 불투명도는 `0.9`로 두어 실제 플레이 해상도에서도 한 칸의 경계가 보인다.

---

## 2026-09-14 시작 대사·키 안내 통합 4컷

첫 스테이지의 `_INTRO_LINES` 네 대사를 조작 안내와 같은 화면에 표시한다. 기존 대사 자동재생 뒤 별도 키 안내를 여는 흐름은 제거했다. 상세 입력·검증 계약: [INTRO_FOUR_CUTS_20260914.md](INTRO_FOUR_CUTS_20260914.md).

| 컷 | 대사 | 조작 안내 |
|---|---|---|
| 1 | 눈을 떠 / Open your eyes | 이동, 무기 공격, 마법 |
| 2 | 정신 차려 / Get a grip | Q 마법 패링·보호막, E 칼등 처내기, Shift 사슬 이동, 전격이동 |
| 3 | 이제 진짜 지옥이야 / This is real hell | Space 지옥강타, 1 가시덫, F 회복의 영역, Ctrl CT 스킬, T 석궁 자동발사 |
| 4 | 야! 몬스터다!!! / Hey! Monsters!!! | R 줍기, Tab 인벤토리, Esc 설정, 자동 물약 |

| 화면 요소 | 현재 구현 |
|---|---|
| 통합 패널 | `#introKeys > .intro-key-panel`, 뷰포트 중앙, 폭 `min(720px,calc(100vw - 96px))`, 최대 높이 `calc(100vh - 48px)` 및 내부 스크롤 |
| 시작 대사 | `#introTextPanel`을 통합 패널 안에 배치. `#introTextKr`와 `#introTextEn` 리프 노드만 갱신 |
| 조작 목록 | `_INTRO_KEY_STEPS` 4개, DOM 행 생성. 정식 game.html은 대사·제목·설명·버튼을 `_L`로 조회하고 열린 컷도 언어 변경 즉시 갱신(미등록 비KO 문구는 영어 폴백). 선택 언어 대사는 `introTextKr` 한 줄, `introTextEn`은 비움. 시험용 엔트리는 기존 한영 분기 유지. 재바인딩 가능한 키는 `BINDS` 조회 |
| 진행 | `1 / 4`~`4 / 4`, 자동 넘김 없음. 클릭/Enter/Space/패드 A 또는 다음 버튼. 마지막은 시작 |
| 건너뛰기 | 모든 컷의 건너뛰기 버튼, Esc, 패드 Start. 반복 입력에도 커튼 열기 1회 |
| 입력 수명 | 다음 입력 간격 250ms, key repeat 무시. 종료 즉시 패드 RAF 취소, 커튼 900ms 동안 키 입력 차단 후 핸들러 해제 |
| 커튼 | 기존 상·하 열림 0.8초, 900ms 뒤 숨김, 기존 스폰·안전지대 유지 |

## 검증 방법 (각 WORK 완료 후)

```bash
# WORK 1
grep -c "bar-val" game.html   # 2 이상
grep "danger" game.html        # hpPulse 존재

# WORK 2
grep -c "qs-group" game.html  # 4 이상 (HTML)
grep "HUD_ICON" game.html     # 상수 존재
grep -c "🔮" game.html         # 감소 확인 (0이면 완벽)

# WORK 3
grep "hud-char" game.html     # 존재
grep "hud-res" game.html      # 존재

# WORK 4
grep "hud.*::before" game.html  # 2개
```

---

## 2026-08-10 시네마틱 HUD 2차 정비 (Dark Industrial / Black Iron)

> 목표: "HUD가 게임 위에 얹힌 정보가 아니라 세계의 일부처럼" — 중앙 비우기, 시스템 텍스트 최소화, 저채도/저투명 융합.
> 게임플레이·맵·캐릭터·카메라 등 로직 무변경. HUD 표현만 수정.

### 변경 요약

| 요소 | 변경 전 | 변경 후 |
|---|---|---|
| ✦SP/◇CP 자원 | `#hudTop` 상단 중앙 (시계 아래 나열) | 신설 `#hudCorner` 좌측 상단(미니맵 아래 top=`188px×--ui-scale + safe-area-top`), Cinzel .62rem, opacity **.48** |
| 우측 목표 프레임 `.objective-frame` | `display:none` (킬/악의 숨김) | 2026-09-10: `#mmLvl` 전체를 하나의 패널로 묶고 `.objective-frame`은 상단 구분선만 표시. 지역 처치/악의 라벨 추가 |
| `#killCnt` | JS가 `☠ 0 / 0` 기록 (아이콘 span과 중복) | 2026-09-10: `지역 처치` 라벨 + 천단위 쉼표 숫자 `0 / 1,100` |
| `#expF` 경험치 라인 | 밝은 골드 그라디언트 | 뮤트 브론즈 rgba(122,101,72,.55)→rgba(196,171,124,.85), 2px 룬 라인 |
| CP 숫자 | 원시값 그대로 | `1,584` 천단위 구분, 10만 이상은 `1.06M` 압축 |
| LV 표기 | 로마숫자 | 2026-09-10: 레벨 라벨+아라비아 숫자, 레벨업 `hud-pulse` 유지 |
| COMBO HUD | 네온 오렌지 #ff6600 + 글로우, 최대 1.2rem | 뮤트 엠버 rgba(201,168,110)→고콤보 rgba(196,74,48), 글로우 축소, 최대 1.1rem |
| MAX COMBO 기록 | 콤보 발생 후 **상시 표시** | 콤보 진행 중(combo≥2)에만 표시 (결과 화면에서 상세) |
| DPS HUD | 네온 레드 #ff4466, 1.4~1.8rem 900weight | 뮤트 브론즈/엠버, 0.92~1.05rem 600weight |
| MAX HIT HUD | 네온 레드 계열 | dirty ivory→엠버 티어 (적색은 최상위 티어만) |
| HUD 토글 배열 12곳 | `['hud','hudTop','mmWrap',…]` | `'hudCorner'` 추가 |

### 유지된 기존 시네마틱 요소 (2026-06 1차 정비분)
- `#areaTitle` 지역 진입 타이틀: `제N구역 · 이름` + `THE ~` 영문 각인체, 3.1s fade in/out ✓
- `#stageClock` 상단 중앙 `02:19` (TIME 텍스트 없음) + 2px 진행 룬 라인 (숫자 % 없음), opacity .57 ✓
- TIME/CLEAR/TOTAL 나열 HUD는 1차 정비에서 이미 제거 — 구버전(_deployed_game.html 6/16)에만 존재. **배포 동기화 필요.**
- 우측 상단은 2026-09-10 가독성 개선으로 `#mmLvl.on` opacity1, 레벨·경험치·지역 처치·악의 라벨+정수 표기 적용.

### 색상 규칙 (준수)
dirty ivory `rgba(214,205,187)` / aged silver `rgba(196,187,168)` / dark iron `rgba(88,72,54)` / muted bronze `rgba(196,171,124)` — 순백·네온·시안 금지, 적색은 위험/최상위 티어 한정.

### 신규 표시 텍스트: 없음 (아이콘+숫자만) → 번역대상_전체목록.md 변경 불필요.

## 2026-09-10 우측 상단 숫자 의미와 가독성 개선

| 항목 | 현행 표시 / 구현 |
|---|---|
| 레벨 | `hudLevelLabel` + `lvLbl`: 레벨10 (기존 X). 로마숫자 함수 제거 |
| 경험치 | `hudExpLabel` + `expTxt`: 경험치7 / 45. 현재/다음 레벨 필요 경험치 |
| 지역 처치 | `hudKillLabel` + `killCnt`: 지역 처치0 / 1,100. `_stageKills / _totalSpawned` 유지 |
| 악의 | `hudMaliceLabel` + `matCnt`: 악의6,600,000. K/M/B 대신 전체 정수 |
| 포맷 | `_hudNumberFormatter`: 재사용 `Intl.NumberFormat('en-US',{maximumFractionDigits:0})`. `_hudReadableNumber`: `max(0,floor(Number(n)||0))`에 천단위 쉼표 |
| 외형 | 최소200px, padding10px 12px, on opacity1, 바깥1px 브론즈 선. 레벨 .94rem/700, 라벨·행 .75rem, 행최소21px, 행간3px, 수치 tabular-nums |
| 색상 | 수치 #eee4d4, 라벨 #cbbd9f, 레벨 #f2e6cb, 경험치 #dfcfaa(Lv1000+ #d6aaff). 배경 rgba(12,13,15,.88)→rgba(9,10,12,.76) |
| DOM / 언어 | 기존 값 ID와 갱신·펄스·이벤트 유지. 새 라벨 span 리프에만 `_hset` 적용. `_L` 기존 번역 재사용·미등록 언어 영어 폴백. 정보 패널의 aria-hidden 제거 |
| 확인 | 실제 game.html CSS·DOM으로 만든 별도 Chrome 미리보기에서 네 행의 한글 라벨/수치 가독성 확인. HUD 테스트5개 및 인라인 JS 문법 검사 통과. 실제 진행 중 게임 상태는 변경하지 않음 |

이전 시네마틱 HUD 문서의 우측 무라벨·로마숫자·저대비 규격은 이 계약으로 대체한다. 중앙 타이머·SP/CP·맵·진행 수치 로직은 유지한다.


## 2026-09-12 패널 상단 메뉴 텍스트 가독성

| 적용 대상 | 설정·인벤토리·대장간·스킬·능력치·창고 공통 `.panel-nav-tab`, `game.html` 및 `game-easy-test.html` |
|---|---|
| 글자 크기·굵기 | `.85rem`, `800` |
| 기본 글자 | 불투명 밝은 뼈색 `#eee4d4` (기존 반투명 갈색 제거) |
| 마우스 올림 | `#fff8ee` |
| 선택 글자 | 밝은 금색 `#ffd28a` |
| 텍스트 그림자 | `0 1px 2px #000, 0 0 5px #000` — 장식 배경에서 글자 분리 |
| 수정 범위 | 메뉴명과 단축키 텍스트 표현. 탭 배경·테두리·배치·동작은 기존 유지 |


## 2026-09-17 Shift 잔량 이동 현행 계약

| 항목 | 현재 동작 |
|---|---|
| 입력·소비 | 게이지>0이면 Shift 준비 가능. 실제 소비=min(잔량,1/2/3단 정규 비용45/98/150). 0이면 미발사 |
| 거리·홀드 | 단계 거리×실제 소비/정규 비용. 릴리즈·홀드 자동 발사·벽 감지·착지 재발사 공통. ST는 최대 ST×단계×1% 조건 유지 |
| 표시 | 조준선도 잔량 비례 거리. 노란 링 한 칸45는 정규1단 탭 기준이며, 한 칸 미만도 짧게 이동 가능 |
| 실습 | 완충하는 사슬 실습의 정규 비용·거리는 유지. 실전 잔량 처리에는 새 비례 이동 적용 |
| 상세·검증 | [공용 기동게이지](../2_1%20스킬관리+합체시스템+자원/전격이동_사슬기동_공용기동게이지_개편.md)의 2026-09-17 절. 이전 문서의 최소 거리/정규 비용 표기는 게이지가 충분할 때의 기준 |


## 2026-09-22 영어 캐릭터·배지·HUD 후속

| 대상 | 현재 구현 |
|---|---|
| 캐릭터 | 신규 소개·직업·특성19개 영어 등록 |
| 배지 | 3종 이름·조건·모음·알림 영어, 언어 전환 시 획득/알림 타이머 보존 |
| HUD | _applyLang에서 리프4개 및 플레이어 상태 aria-label 즉시 갱신. 일시정지에서도 적용 |
| 악의기둥 | 기존27언어 원본 JSON에는 5초가 남아 있었음. ui-needed와 실제 번역을10초로 고쳐 strict 빌드 복구 |
| 검증 | 번역 빌드와 관련14개 검사 PASS. 캐릭터 영상/타 언어 신규 실습은 후속 |

상세: docs/16번역·로컬라이제이션/ENGLISH_CHARACTER_BADGE_HUD_20260922.md


## 2026-09-25 공통 UI 현재 적용 계약

최종 표면·버튼 상태·슬롯 음영은 UI_COMPOSITION_20260925.md의 디테일 마감 절을 따른다. 기존 기본표에서 동일 항목의 색·그림자는 해당 절이 우선한다.

2026-09-24 전체화면 Hell Gothic 구성은 2026-09-25 재구성으로 대체됐다. 사용자 제공 Diablo IV/POE2 화면의 구획·정렬·재질 규칙을 반영했다. ui-foundation.css 뒤에 ui-refinement.css?v=20260926-10을 로드하고 게임 두 HTML은 ui-panels.js?v=20260925-1을 defer 로드한다. 전체 세부 수치·컨트롤 목록·에셋 생성 기록의 SSOT: docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md.

| 대상 | 현재 계약 |
|---|---|
| 설정 | 화면 중앙 width100vw−24px/height100dvh−24px, 폭600px 이하 각각−12px. 게임(시스템 통합)/화면/사운드/조작 4탭, 본문만 스크롤, 자동저장/닫기 고정. 현행 상세: SETTINGS_UI_WORKSPACE_20260929.md |
| 장비 | 오른쪽 clamp(640px,36vw,780px), 화면폭−24px 상한. 장비/유골함/보석/보관함 탭(보석은 전용 그리드, 나머지는 기존 가방), 필터 접기. 폭≤780은 화면폭−16px. 유골함·보관함 탭은 폭min(980px,100vw−24px)/높이min(680px,94vh),왼쪽 가방·오른쪽 각 전용 패널 동등폭(폭899px 이하 상하) |
| 스킬/대장간/창고 | 각각 최대1020/980/700px, 화면폭−24px 상한. 스킬 왼쪽, 대장간/창고 중앙 |
| 성장 | 기존 전체화면/인체 트리 유지, 공통 표면/내비게이션 마감 적용 |
| 재질/프레임 | iron.png 1254×1254,480px 반복+감광 CSS. 3px double선, 기존 frame.png 22%/24px/opacity.65. pbox 상단 문장 제거, 설정/대장간/창고 제목에144×48px 문장 |
| 공통 크기 | 패딩18px22px20px, 폭≤780은14px. 메뉴최소32px/12px, 분류최소35px/13px(작은화면12px), 설정행최소42px |
| 입력 보존 | 기존 노드/ID/리스너/값/자동저장 유지. 분류 탭만 새 DOM. 키보드 좌우/Home/End 지원. 새 라벨 한국어/영어, 기타언어 영어 폴백 |
| 월드/HUD | 패널 뒷배경은 검정 반투명 그라디언트. 기존 메뉴 중 HUD 감춤/일시정지 유지. 패널 동시열기 미구현 |
| 튜토리얼/로비 | ui-foundation.css의 2026-09-24 튜토리얼/로비 전용 계약 유지 |



현재 공통 프레임·제목 및 독립 창고 선택/이동 UI는 `UI_COMPOSITION_20260925.md`의 **2026-09-25 조각 프레임·창고 슬롯 개편 절**을 따른다. 이전 중복 수치는 해당 최신 표로 대체한다.

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 금속 마감 보강 절**을 따른다.

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 테두리 중첩 수정 절**을 따른다.

게임 메뉴의 최신 문장·프레임 에셋과 표시 규격은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 Blackiron 아트 교체 절**을 따른다. 과거 생성 기록은 이력이며, 로비/튜토리얼/HUD의 기존 에셋 계약은 유지한다.

인벤토리의 최신 제목·텍스트·박스 규격은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 인벤토리 텍스트·박스 정비 절**을 따른다. 다른 메뉴와 기존 아트 생성 기록은 유지한다.

인벤토리의 최신 박스·슬롯·텍스트·조작부 계약은 UI_COMPOSITION_20260925.md의 **2026-09-25 참고 화면 조사·인벤토리 디테일 통합 절**을 따른다.

최신 메뉴 문장 에셋과 알파·표시 규격은 UI_COMPOSITION_20260925.md의 **2026-09-25 흑철 해골 문장 원본 교체 절**을 따른다. 이전 문장 생성 기록은 이력으로 보존한다.

메뉴 문장의 최신 원본과 표시 규격은 UI_COMPOSITION_20260925.md의 **2026-09-25 해골 문장 재생성 — skull2 절**을 따른다. 직전 skull.png는 사용 중단한 제작 이력이다.

설정 화면의 최신 제목·박스·탭·키·버튼 재질은 UI_COMPOSITION_20260925.md의 **2026-09-25 설정을 인벤토리 스타일로 통일 절**을 따른다. 생성 가죽판은 채택하지 않으며 기존 인벤토리 에셋을 재사용한다.

설정·인벤토리·스킬의 최신 중앙 제목판과 본문 구획 계약은 UI_COMPOSITION_20260925.md의 **2026-09-26 정보 배경과 통합 제목판 절**을 따른다. 이 세 창은 skull2.png 대신 header.png를 사용한다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 전체 메뉴 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 슬롯과 상호작용 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 유니크 분해 NaN 수정과 상세창 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 창고와 상세 스크롤 마감 절**을 따른다.


## 2026-09-27 인벤토리 중복 제목 제거

사용자 지시: 메뉴 탭으로 인벤토리임을 알 수 있으므로 큰 제목 장식은 제거하고 배낭 공간을 확보한다. 앞선 인벤토리 제목판 118px 계약을 대체한다.

| 항목 | 현재 계약 |
|---|---|
| 인벤토리 제목판 | 직계 헤더의 .ptitle display:none. 제목 이미지와 가상요소도 표시하지 않음 |
| 정보행 | 전투력/악의/닫기 유지. gap0, margin4px 0 8px |
| 높이 배분 | 장비 탭 inv-wrap 첫 행270px, 가방 행 minmax(min-content,1fr). invCenter height:auto/min-height260px,invGrid height140px/flex1 1 140px. 필터 높이를 반영하며 나머지 높이는 가방에 배정. 작은 화면은 기존 바깥 세로 스크롤 사용 |
| 적용 범위 | 인벤토리 내부 장비/유골함/보석/보관함 페이지 공통. 다른 메뉴 제목 유지 |

CSS 캐시 ui-refinement.css?v=20260927-3. 신규 이미지/아이템 데이터 변경/자동 테스트 추가·실행 없음.

정확한 CSS는 UI_COMPOSITION_20260925.md의 같은 절을 따른다.


## 2026-09-28 HUD·텍스트 프레임 드랍 수정

| 적용 위치 | 현행 계약 |
|---|---|
| GPU proxy text | _buildProxyX의 font/textAlign/textBaseline setter와 restore는 proxy 상태만 갱신. native fillText 폴백·strokeText·measureText는 _syncTextFont로 요청값/정규화된 실제값 확인 후 필요한 글꼴 지정만 수행 |
| skSlot1 분노 | _updateActionKeys에서 기본→분노 테두리 왕복 제거. 최종 색·그림자를 한 번 계산, 높이/숫자 span도 _hset으로 변경 시에만 기록. 기존 색/공식/transition 유지 |
| _hset 캐시 | _h_<prop> 요청값과 실제 DOM을 함께 비교. _hn_<prop>에 정규화된 style값 기록, 외부 변경 시 복구 |
| 검증 한계 | 관련 회귀35 PASS/두 HTML 인라인 script 각6 parse PASS. 전체 FPS 최종 비교는 화면 전환으로 무효; 완전 해결 판정 보류 |

[원인별 실측·정확한 수치·남은 검증](../12퍼포먼스·최적화/FRAME_DROP_HUD_TEXT_20260928.md).

## 2026-09-28 전투 프레임 후속 검증

| 구분 | 현행 검증 상태 |
|---|---|
| 수정·단기 전투 | HUD/proxy 수정 유지,실제 AI100마리·전투 활성6초에서 평균207.75FPS/p95 8.4ms,초기최대83.4ms 1회. 장시간·스킬 난사·보스·Steam 실측은 미완료 |
| Chrome 확대 | localhost 저장 배율50%가 5626×2524 viewport를 만든 것으로 확인. Steam용 ./userdata와 분리; Steam 화면/FPS가 정상이라고 실측 완료를 주장하지 않음 |
| 근거 | [유효 측정·중단 제외·배율 경계](../12퍼포먼스·최적화/FRAME_DROP_HUD_TEXT_20260928.md#2026-09-28-후속-전투-실측과-chrome-배율) |


## 2026-09-29 발사 경고 문구 프레임 병목·설정 복원

| 항목 | 현행 구현·검수 |
|---|---|
| native 글꼴 | 두HTML _buildProxyX의 _syncTextFont: 같은 요청/정규화 실제값이면 setter 생략. Canvas초기화·외부 변경·다른 글꼴은 재적용 |
| 경고 폭 | 본편 _drawProjectileChargeLabel의 _chargeLabelMetrics 한항목(ctx/label/font/width) 재사용. 렌더러/번역문구/글꼴 변경 및 document.fonts loadingdone/loadingerror에서 재측정. 기존13px·박스폭tw+14/높이20·링60틱·탄종/패링 규칙 유지 |
| 해상도 복원 | 두HTML 최초 설정과 _loadPreset OPT 복원 뒤 rz(). 저장60%/프리셋70% 실제C/CT/burst 반영, 동일치수no-op |
| 근거·경계 | 전투 경고의 font/measureText 약29~42ms 스택 확인. 저장본 새로고침100AI/1920×1080/10초 draw p99 4.1ms(직전31.9ms),max44.7ms 잔여2회. 전후CSS창 크기가 달라 평균FPS 개선율 확정하지 않음. 예열20초 연결중단/최종visual·Steam·보스 미검증 |
| 검사·상태 | 관련57PASS,두HTML실행script각6구문PASS. 기존경고fixture의실제_projectileParryClass 누락복구. 커밋/패키지/Steam업로드미완료,타작업스테이징보존. [상세 계약·실측·검수 경계](../12퍼포먼스·최적화/FRAME_DROP_HUD_TEXT_20260928.md) |


## 2026-09-29 — HUD 창 크기·페이지 줌 적응

자동 배율의 0.5~3.0 고정 상하한을 제거하고 HUD 가장자리 여백을 같은 디자인 배율로 맞췄다. 1920×1080 기준 배치·구체175px·스킬바820×182px·구체/바 배율0.9·미니맵166×166px/0.85는 유지한다. 시계는 기준 폭170px에 자동 배율을 한 번 적용한다. 세부 여백·회귀 검증·범위는 [현행 계약](UI_SCALING_20260929.md)을 따른다.


## 2026-09-29 미획득 배지 HUD 숨김·상태 수치 겹침 수정

| 대상 / id | 현행 구현·검수 |
|---|---|
| 사용자 기준 | 획득 배지가 없으면 HUD에 배지0/3·빈 버튼·자리 표시를 남기지 않는다. 지역 처치·악의 수치를 가리지 않는다 |
| 표시 조건 | tutorial-badges.js의 init에서 button.hidden=true로 시작. render에서 count=Object.keys(earned).length; count===0이면 button/panel hidden=true 및 aria-expanded=false. 1~3개 획득·복원 시 button.hidden=false. 언어 갱신에도 같은 조건 적용 |
| 모음 열기 | toggle(open)은 button.hidden이면 열기를 거부하며 숨긴 버튼에 focus하지 않는다. 배지가 있으면 기존 닫기 초점/버튼 복귀·aria-expanded·3개 카드 정책 유지 |
| 위치 | button과 collection을 #mmLvl의 자식으로 연결. 둘 모두 position:absolute/right0/pointer-events:auto; 버튼 top:calc(100% + 8px),모음 top:calc(100% + 46px). 상태창의 기존 크기·UI배율·safe-area 이동을 따라가며 수치 행과 겹치지 않음 |
| 표시 CSS | button[hidden]/collection[hidden]/toast[hidden]은 display:none!important. 기존 버튼 padding5px10px/border1px/radius3px/font12px/1.5 유지. #mmLvl 미존재 폴백은 body에 연결,button fixed right20px/top180px,collection fixed right20px/top218px/width min(360px,100vw−40px)/max-height calc(100dvh−238px) |
| 획득·보관 | combat12/resources8/systems7 실제 완료 체크·중복 지급 차단·저장키·3.5초 알림 유지. 알림은 body에 남기며 배지 표시 정책으로 획득 기록이나 저장 데이터를 삭제하지 않음 |
| 적용·캐시 | tutorial-badges.js/css와 game.html/game-easy-test.html. 두HTML 모두 JS/CSS캐시20260929-earned-hud |
| 회귀 | 신규 표시·첫획득·복원·HUD연결4건 수정 전FAIL→수정 후PASS,기존 번역1건PASS. tools/test-tutorial-badges.cjs의 지급/중복/저장/슬롯격리/차단폴백/양HTML연결 검사PASS |
| 원본 브라우저 | Node3333 본편 독립 QA 슬롯에서 수정 전 배지0/3의 상태창 겹침true→수정 후 hidden=true/display:none/rect0. 메모리의 획득1개 상태는 상태창 bottom171.834px/버튼 top180.014px,겹침false. 모의 획득은 저장 API 호출 없이 earned만 변경 |
| 시각·입력 검수 | 원본 HUD DOM/CSS·배지JS를 분리한 fixture에서0개/1개 스크린샷,배지 모음 실제 클릭→닫기 초점/화면내 배치→닫기→0개 숨김 확인. 브라우저 viewport2534×1262,override없음. fixture는 UI 검수이며 튜토리얼 완료 플레이 검증은 아님 |
| 현재 게임 | 열린 demo 게임에도 디스크의 render/toggle 함수와 CSS를 hot apply. count0/hiddentrue/displaynone/지역 처치0/168 전체 노출을 실제 플레이 스크린샷으로 확인. 게임 ontrue/pausedfalse 유지; 재시작·저장쓰기·획득기록 수정 없음 |
| 기록·상태 | tmp/badge-hud-20260929에 before/fixture/docs전체검색/검수계약 보존. 기존 dirty·staged 작업 보존. .git 관리형 읽기 전용으로 커밋 미완료; NW.js패키지·Steam배포 미수행 |


## 2026-09-29 설정창 가독성 확장

| 대상 | 현행 규칙 |
|---|---|
| 설정창 | 고정680px 폭 제거, 화면 여백12px(폭600px 이하6px), 본문 그룹2열/작은 화면1열 |
| 가독성 | 기본 설정명16px·키캡14px, 행60px·키캡42px 이상, 제목80px로 압축. 전체 값/선택자는 SETTINGS_UI_WORKSPACE_20260929.md 참조 |
| 검수 | 메인/쉬운 테스트 실제 설정 화면, 6개 화면 크기×5탭에서 가로 잘림 없음·닫기 고정 확인 |


## 2026-10-03 source24 — 현재 스테이지 콤보와 저장 최고 기록 분리

| id / 적용 위치 | 현행 값·공식 | 수명·보존 경계 |
|---|---|---|
| stageCombo / `G._sStats.comboMax` | `initStage`에서0. 기존 `hurtE` 처치 콤보 증가 뒤 `G.combo > (G._sStats.comboMax || 0)`일 때 갱신 | 콤보 종료 때 최대값은 유지. 새 스테이지 생성 때만 기존 다른 `_sStats`와 함께 리셋 |
| lifetimeCombo / `G.comboMax` | 기존 킬 최대값·`game.comboMax` 저장/복원 유지 | HUD·사망 화면은 기존 저장 최고 기록 사용. 본편 저장 빌더4곳/Easy3곳 및 복원 원문 불변 |
| clearScore / `_showClearResult` | `comboMax:_ss.comboMax || 0`, 콤보 기여×5 | 계수·시간·처치·지역·보스·사망/무피격·랭크 공식 불변. 이전 최고60/이번0은 기존+300 대신0 |
| clearStats / 현재 최대콤보 | `(_ss.comboMax || 0)` | 배지 콤보마스터≥50, 콤보광20~49. 이름·번역키·기존DOM/선택/버튼 구조 불변 |
| bossDeathReturn / capture→restore | `_sStats`는46-key 필드 snapshot에 포함하지 않음 | 현재 stage 최대콤보/사망 횟수 유지. 보스 진입 전 기록으로 rewind하지 않음. 해금 완료 CH1 필드 복귀도 `initStage` 미호출 |
| save / 재개 | 새 저장 필드 없음. `_sStats`는 기존대로 런타임 통계 | 로드로 새 stage를 생성하면 현재 통계는0부터 시작. 저장 최고와 기존 `_clearRecords`를 지우거나 과거 inflated 점수를 재계산하지 않음 |
| failure / 검증 | 최종 원본2PASS/8FAIL → 후보10PASS → 생산50PASS | 실제 reset/kill/clearStats/score/best/capture·restore source 실행. DOM 기록/필드 입력은 대역. 실제 Mac 플레이·화면·청취 인수 아님 |
| source / 적용 범위 | 양판 각6치환, 각+112B. 신규 `test/stageComboResult.test.cjs` | 역치환 원본 전체 byte-exact, index/전투 피해/RNG/저장 builder/capture·restore 함수 불변. source24 앱3399 포장·타이틀·HTTP 확인; source23 앱3398은 이전 코드 보존 |

최종 source 검증은 신규10 + 기존 클리어 공식6 + 보스 필드 복귀34 =50건이다. 테스트 준비 단계에서 기존 결측 통계의 무피격+500과 Easy 저장 빌더3곳을 잘못 가정한 fixture를 수정했고, 최초 결과를 보존한 뒤 최종 원본 실패대조·후보·생산 검증을 완료했다. 게임 코드의 버그 수정과 fixture 교정을 구분한다. 원자료는 `tmp/mac-migration-runtime/continued-review-20261003/root-stage-combo-source24/`의 before/candidate/baseline-test-corrected/candidate-test-corrected/production-test 및 영수증이다.

같은 후보 CH1-1 시작→전투/획득→4지역/보스문→보스 사망·부활→재도전의 실제 Mac 인수는 미완이며 source50PASS를 그 완료로 계산하지 않는다. 기존 사용자 게임·세이브·앱8·보호2_3·Q-only magic/E불가·어택티켓 금지·타인WIP는 보존했다.


## 2026-10-03 source38 — 일반 스테이지 재생성 시 킬 체인 초기화

| id / 위치 | 현행 계약 | 보존·검수 경계 |
|---|---|---|
| chain-reset / 일반 initStage(si) | 기존 G.combo=0;G.comboTimer=0; 뒤에 G._chainCnt=0;G._chainT=0; 추가. 본편/Easy 각26B, 각1정확치환 | 새 필드 없음. 저장 schema/빌더/복원 불변. normal map 생성 성공 뒤 기존 stage 통계 초기화 위치에서 실행 |
| chain-producer / hurtE 처치 | 처치마다 _chainCnt++, _chainT=180. 일반 적 처치에서 count≥5이면 count=0 및 균열 {t:0,maxT:120,spawned:false,si:G.stage} 생성 | 기존 3초 윈도우/5처치 임계/2초 소환 및 균열 전투 수치 변경0. G.combo 처치 콤보와 별도 상태 |
| chain-consumer / update, draw | 게임 진행중 _chainT-=sp, ≤0이면 count/time 둘 다0. count≥2일 때 N CHAIN 표시, ≥4일 때 균열 임박 표시, bar폭=100×time/180 | HUD 좌표·문구·색·폰트·타이머·스폰 변경0. 시각 pixel/플레이 인수로 계산하지 않음 |
| death-caller / die→fallen→_fallenResolve | die()는 fallen300f를 설정하고 G.on을 유지. 실패 resolve 때 dead/G.on=false | 사망 전 체인180f만 있다면 300f 대기 중 이미 만료. ANIM0747의 die 즉시 false/체인 즉시 동결 전제는 틀려 정정 |
| 실제 재현 범위 | 쓰러짐 중 기존 독 피해가 적을 추가 처치하면 체인 재갱신. 일반 retry의 전체 initStage 뒤 이전 count/time가 남았고, 새 생애의 첫 일반 적 처치가 이전 4체인을5로 이어 균열을 생성할 수 있었다 | 합성 적4개: HP450/독pool500/T300, pDotDmg·Dur=1, sp=1. 실제 독 분기+전체 hurtE에서 241번째 tick 처치→실패 resolve 때 count4/time120. fixture값은 게임 설계 상수 아님 |
| 경로 보존 | 일반 retry→initStage 및 일반 새 진입만 초기화. 기존 nextStage의 선행 chain=0 동작은 동일 | bosstest early return·보스 arena/해금CH1 field capture→restore·si3 직접 재도전·1회/자연부활의 체인 정책은 변경0. 맵/보스문/기존 필드 몬스터 상태를 초기화하는 추가 호출0 |
| 검수 | 양판 실제 전체 die/fallenResolve/hurtE/retry callback/initStage/nextStage, 실제 fallen/독/chain/HUD 발췌 분기 실행 | 맵·적 생성/오디오/Canvas/DOM/장비배율·드롭·XP/저장 등 외부 대역. 전체 update/AI·실기기/사용자세이브·native 플레이 미실행 |
| 적용·인수 | code38 소스 수정. 현재 격리 앱source29/3404에 미포함 | source PASS를 보스 사망·부활·재도전/4지역·저장재로드·시각/청취 완료로 대체0 |

원자료: tmp/mac-migration-runtime/continued-review-20261003/source38-chain-stage-reset/의 원본 백업·ANIM0747 원 completion UUID fbcb71c9-8897-4bef-af8b-557f9fc06c1e·docs전체검색·baseline/candidate/production·정확 역치환·checkpoint 영수증. 최초 fixture 실행의 미정의 외부 상태/함수 실패는 검수 대역 준비 오류이며 게임 결함 수로 계산하지 않는다. 최종 10개 원본 assertion 실패는 하나의 초기화 누락을 경로별로 확인한 결과다.

최종 검수: 신규 체인 수명22 + 인접 기존 스테이지 ORB16 + 보스 필드 복귀68 =106 PASS/0 FAIL. 최종 원본 대조는22개 중12 PASS/10 FAIL(서로 다른 결함10개 아님). 두HTML inline JS12/importmap JSON2 구문 검수 통과. 일반 clean-initStage 및 nextStage의 전체 G/P/기록 sink 동등을 원본과 비교했다. 보호67개 경로 hash 보존과 HTML 전체 정확 역치환은 별도 precommit 영수증으로 확인한다.


## 2026-10-03 source39 — 연속 알림 타이머 수명

| id / 적용 위치 | 현행 값·동작 | 보존·검수 경계 |
|---|---|---|
| notify / 본편·Easy notify(msg) | 기존 #notif 텍스트 _T(msg), on 추가, bottom260px 뒤 clearTimeout(notify._timer);notify._timer=setTimeout(기존callback,1500) | 각1정확치환/+42B. 함수 property에만 핸들 보관. 기존 callback은 bottom270px/on 제거 그대로 |
| 교체 수명 | 같은 노드의 새 알림 호출에서 이전 timer를 취소하고 마지막 호출 기준1500ms에 on 제거 예약 | A@0/B@800이면 기존 A@1500가 B를 일찍 숨겼다. 변경 후 B@2300 제거. 이는 class 수명 검사이며 CSS fade/pixel/native 관측 아님 |
| 표시 CSS / #notif 리프 | 기존 빈 div 리프 하나. z-index22/pointer-events:none/opacity0, on이면1. opacity transition0.3s/bottom transition0.5s 유지 | 1500ms는 숨김 시작(on 제거)까지의 timeout. 페이드 포함 총 픽셀 노출1500ms로 단정하지 않음. 부모 DOM/선택자/CSS 구조 변경0 |
| showPH / 자원 경고 | 기존 clearTimeout(showPH._timer) 및 duration 기본500ms 유지 | 서로 다른 두 timer property는 독립. notify 교체로 PH·외부 timer를 취소하지 않음. 언어·색·음성 조건 불변 |
| 실제 caller / 패드 연결·해제 | 실제 등록된 gamepadconnected/disconnected callback 전체를 source 추출해 notify까지 실행 | callback 원문/연결상태·cursor·inputMode 저장 호출 순서 불변. 실제 하드웨어/사용자 localStorage는 조작하지 않은 대역 검사 |
| 게임 전환 경계 | setTimeout wall-clock은 G.on/paused와 독립. stage/death 전환 시 새 clear 정책을 추가하지 않음 | 새 알림이 없으면 기존 자동 숨김 유지. 사망/보스 HUD·지역 배너·입력/설정/장비·save schema 정책 변경0 |
| 검수 | 양판20 PASS. 원본4 PASS/16 assertion FAIL은 같은 timer 겹침 결함의 조건별 확인 | 실제 whole notify/showPH/패드 callback + controlled clock/DOM leaf/번역·입력상태·storage sinks. 실제 browser event queue/시각/청취/native·전체 gameplay 미인수 |
| 정상·보존 | KR/EN 단일 호출의 text/on/bottom·timer1500ms 동등. 교체0/200/800/1499ms·연속12·만료핸들·PH/외부timer·패드 blip·정지게임 조건 확인 | 두HTML inline JS12/importmap JSON2 구문PASS. HTML 전체 역치환 source38 exact. 보호67경로/hash·공유index 보존 |
| 실행본 | source39 소스 적용. 현재 격리 앱source29/3404에 미포함 | 빌드/앱 재시작/native 입력/사용자 세이브 변경0. CH1-1/보스문·몬스터 보존/부활·재도전·청취/시각 완료와 별개 |

원 후보: ANIM0824 completion c917f67c-1b1f-4820-9efd-5da96a2ca739 (source37 조사). source38 위에서 별도 root 검수·최소 적용했다. 원자료/backup·docs전체키워드검색·baseline/candidate/production·역치환·원격 SHA 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source39-notification-timer/에 보존한다. 제작팀 TASK·이전 핀/후보 이력은 덮어쓰지 않았다.


---

## 2026-10-07 본편 출구 표시의 앵글러 완료 조건 — ROOT-CH1-EXIT-LABEL-DISPLAY-20261007

기존 REGION HUD 표의 봉인 라벨·방향 안내는 본편에서 다음 조건을 우선 적용한다.

| UI 항목 | 현재 본편 표시 계약 |
|---|---|
| 출구 포털/나무 포털/미니맵 잠금 | `_bossGateDisplayOpen()` 결과를 함께 사용 |
| 지옥문 방향 분기 | 같은 helper가 참일 때 개방 안내 분기; 기존 지역 목표 처리와 안전영역 유지 |
| 지역 4/4이나 CH1 앵글러 미완료 | `지옥문 봉인 · 앵글러 목표 미완료` / `Gate Sealed · Angler objective incomplete` |
| 지역 카운터/진행바 | kills/total 및 지역 N/4 비율 변경 없음 |

표시용 `_bossGateDisplayOpen()`는 `!!G._bossUnlocked && (G.stage!==0 || !!G._fbDone)`만 반환하며 상태를 쓰지 않는다. CH1은 해금과 앵글러 완료가 모두 참일 때 표시상 개방이고, 다른 stage는 기존 해금 플래그를 따른다. 실제 진입·해금 생산자·지역 정화·전투·재도전·저장 순서는 변경하지 않는다.

기존 addTxt 진입 차단 안내, 색·폰트·위치·방향 재계산 주기 및 Easy는 변경하지 않는다.

통제 Canvas의 640 CSS 폭 cell에서 13px 선언의 한영 문구 6개는 잘리지 않았다. 실제 webfont는 로드하지 않아 resolved face는 UNKNOWN이다. 실제 맵·포털·미니맵·화살표·정상 게이트 도달, 전체 native6·음향·실저장 ACK는 미인수다. VISUAL VERDICT: RETOUCH. 과거 실버테일 공격 검수와 합산하거나 재실행하지 않는다.

상세 정본: `docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`의 이번 후속 절. 외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/display-cpu-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/native-display-fixture-result.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/validation-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/visual-verdict.json`. Git 사실은 같은 디렉터리의 `remote-preservation-receipt.json`에서 정상 commit/push 및 원격 정확 SHA로 확정한다. 이 문서 안에 자기 commit SHA를 순환 기입하지 않는다.

## 2026-10-07 지역 목표·앵글러·게이트 사유 HUD — ROOT-CH1-REGION-PROGRESS-HUD-20261007

기존 단일 “지역 처치” 설명은 이전 표시 epoch 또는 비활성 폴백 설명으로 보존한다. 현재 Main CH1 필드의 활성 HUD는 `#hudKillLabel` 3줄과 `#killCnt` 숫자를 분리한다. 3387 opt-in에 한정된 기능이 아니라 stage0의 전역 소비자다.

| 위치/항목 | 현재 계약 |
|---|---|
| `_updateRegionKillLabel(r)` 활성 | 두 leaf 존재 + `G.on` + `G.stage===0` + 현재 지역 + 보스방 아님 + boss load phase 양수 아님 + stage 미완료 + `G.bossAlive` |
| 1행 | 미정화 시 `목표 N` / `Target N`; 정화 지역은 `정화 완료` / `Purged` |
| 2행 | `_regionFbAlive(r)`에 따라 `앵글러 생존` / `Angler alive` 또는 `앵글러 조건 충족` / `Angler OK` |
| 3행 | `Gate open` 우선 → 미정화 지역 수 → 앵글러 조건 → 개방 대기 순의 표시 사유 |
| 목표 N | total>0이면 `max(0,ceil((.8−1e−9−bonus)×total))`, total0이면0; bonus는 해당 게이트 지역의 guardKilled 때만 .10 |
| 기존 숫자/펄스 | 지역의 `min(kills,total)/total`, 지역이 없으면 `_stageKills/_totalSpawned`; 기존 숫자 펄스 유지 |
| leaf 정렬 | 활성 label `whiteSpace='pre-line'`, 숫자 `alignSelf='flex-start'`; 비활성에서는 둘 다 `''` 복귀 |
| 활성 패널 | `#mmLvl.region-progress`에 `transform:scale(max(var(--ui-scale),1))`; 기존 font/폭/offset/padding 유지, 활성 최소 scale1 / 기본 글자12CSSpx |
| scope exit | 클래스 제거, 기존 transform과 `지역 처치` / `Area kills` 폴백 복귀 |
| 갱신 | slow HUD 훅과 `_refreshPersistentHudLanguage` labels loop 직후 동기 갱신. paused는 활성 제외 조건이 아니므로 언어 변경도 유지 |

`Angler OK`는 조건 충족 표시이며 실제 사망 증거가 아니다. 정화 래치·보스방 권한·저장·전투 수치·새 타이머/RAF 변경은 없다. 기존 `stageProgressFill`도 이번 변경 대상이 아니다.

29c1의 CPU68 및 native6조건은 이전 epoch다. 최종 B8의 새 한정 CPU8조건과 KO/EN640 native2조건은 별개이며 clean 합산하지 않는다. ROOT의 최종 PNG 판독에서 12CSSpx 가독성과 clock/minimap 비겹침은 확인했으나, transient `startareaTitle` 오른쪽과 커진 패널의 겹침이 남아 **VISUAL VERDICT: RETOUCH**다. 최종1280 native 재실행은 없다.

최종 `game.html` working 4,092,122B / SHA256 `b8be6378b7d2805b32ca38f92cca03179f8f1ebb2732bebacec6300f5fe7ad3a`, ROOT owned 4,091,937B / SHA256 `05fa7031c8f1d4b1e02643e9fd9964f81c3a80a25d698ab22a002c2330f1ddc0`의 6개 hunk 기준이다. 기존 foreign 185B는 미채택 상태로 보존한다.

전체 런타임 계약·검수 epoch·§23 보고는 [MAP_RUNTIME_ARCHITECTURE.md](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md)의 `ROOT-CH1-REGION-PROGRESS-HUD-20261007` 절을 따른다.

## 2026-10-08 시작 지역 제목의 조건부 HUD 회피

이번 기록은 **ROOT-CH1-AREA-TITLE-HUD-SEPARATION-20261008**의 현재 구현 계약이다. 이전 640×720 KO/EN 화면의 시작 제목·커진 HUD 겹침은 당시 관측 이력이며, 이번 소스만으로 시각 해결을 인수하지 않는다. 최종 working `game.html`은 4,112,493B / SHA256 `0b6beffafbb9d2335d668d14993a0b9b5d0e1f9a98a14d8668f019a0ff946e88`이다.

| id/상수 | 현재 값·소비 |
|---|---|
| `#areaTitle` | 기존 stage 변경 시 제목 표시·3.1s 유지. 재생 중 지역 진행 HUD가 유효하면 resting top `max(18%, HUD 실제 bottom+15px+var(--gap-md))` |
| `--gap-md` | 기존8px. 제목 animation Y−15..+7px·문구·폰트 변경0 |
| `#mmLvl.region-progress` | 기존3줄·scale 최소1/12CSSpx 유지. observer가 실제 bbox를 읽고 update 활성 scope 확인은 bbox0 |
| 복원 | 첫 쓰기의 inline top 값/priority 캡처, 자기 값/priority 일치 시만 복원. 외부 변경 시 hidden-first도 해당 animation yield. observer 미지원 legacy/pagehide 정리 |
| 권한 | 기존 stage/nav/충돌/입력/보상/save 불변, 새 state 권한·RAF·timer0 |

앞선 지역 배너 행의 `top28% — areaTitle/펫대사/구슬 비충돌`과 기존 중앙 상단 고정 위치 설명은 해당 설계 epoch이다. 현재 제목은 위 조건부 계산을 우선하며, regionBanner top28% 자체는 변경하지 않았다. 두 요소의 show class는 종료 뒤 남고 opacity0이 될 수 있어 class 둘만으로 실제 동시 가시성/겹침을 판정하지 않는다. source 읽기상 동시 재생 가능성과 실제 화면 겹침은 구분하며, 실제 겹침은 UNKNOWN이다.

검수는 실제 controller를 통제 DOM·MutationObserver·ResizeObserver·animation event에 연결한 Node1/VM9, 새6그룹25조건 PASS/FAIL0/준비실패0/미도달0/exit0이다. 이전 view zoom CPU25와 별도 epoch이며 합산하지 않는다. 새 Chrome/GPU/PNG0, native NOT_RUN, 이번 UI 시각 NOT_ASSESSED, 전체 **VISUAL VERDICT: RETOUCH**다. 사용자 IAB13의 이전 로드 화면은 재로드 없이 유지했다. 세부 계약·가이드 §23은 [MAP_RUNTIME_ARCHITECTURE](<../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md>)의 같은 TASK 절을 따른다.

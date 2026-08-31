# THE EXODUSER — HUD 리디자인 마스터 플랜

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
| 상단 중앙 2행 | `#spCnt` → `✦ {SP}` | `SP` 라벨 제거. AP가 있을 때만 `+{AP}` 보조 수치. `#stageClock` 아래 `+32px`에 중앙 정렬해 좌측 미니맵을 비움. 테두리·배경·구분선 없음 | `P.sp`, `P.ap` | `updateHUD(true)` |
| 상단 중앙 2행 | `#cpHud` → `◇ {CP}` | 지옥/층 접두어 및 `CP` 라벨 제거. SP·콤보와 동일한 **텍스트 전용** 보조 정보 묶음 | `calcCP().total` | `updateHUD(true)` |
| 상단 중앙 | `#stageTimerHud` → `MM:SS` | `TIME`, `CLEAR`, `TOTAL`, BEST 표기를 플레이 중 숨김 | `G.stageTime / 60` | `updateHUD(true)` |
| 상단 중앙 | `#stageProgressFill` | 숫자 없이 2px 진행선만 표시 | `G._stageKills / G._totalSpawned × 100` | `updateHUD(true)`, width `.6s ease-out` |
| 우측 상단 | `#lvLbl` → Roman numeral | 현대식 `LV` 라벨/대형 숫자 대신 I~MMMCMXCIX. 프레임 없이 단독 표기 | `P.lv` | `updateHUD(true)`, `_hudRoman()` |
| 우측 상단 | `#expTxt` → `{현재 EXP} / {필요 EXP}` | 경험치 바 없이 텍스트만 표시 | `P.exp`, `P.maxExp` | `updateHUD()` |
| 우측 상단(목표 패널 `#mmLvl`) | `#killCnt` → `{처치} / {총스폰}` | 미니맵 옆 목표 패널에 **표시됨**(구 "숨김" 기술은 stale). 현재 스테이지 진행도(`#stageProgressFill`과 동일 분모) | `G._stageKills / G._totalSpawned` | `updateHUD(true)`, `_hudPulse('killCnt',_stageK)` |
| 우측 상단 | `#matCnt`, `#expBar` | 처치·악의·게이지 UI 노출 축소 방향 | `G.mats`, `P.exp` | 기존 갱신/DOM은 호환을 위해 보존 |

> **[2026-08-18 correctness fix] 처치 카운터 분자 stale (game.html:50934)**
> - **버그**: `#killCnt`가 `G.kills`(런 전체 누적) / `G._totalSpawned`(스테이지별 스폰) 조합이라, 2번째 지역부터 분자>분모(예: `150 / 92`)로 100% 초과 표시. 바로 아래 진행바(`#stageProgressFill`)는 `G._stageKills/_totalSpawned`로 정상 → 카운터만 어긋남.
> - **canonical**: 스테이지 진행 지표는 `G._stageKills`(initStage에서 0 리셋, 킬마다 `G.kills`와 동시 증가). 게이트 해금(80%)·진행바 모두 `_stageKills` 사용.
> - **수정**: 분자를 `G.kills`→`G._stageKills`로 교체(`_hudPulse`도 `_stageK` 기준). 밸런스/기능 변경 없음(표시값만 정정).
> - **검증**: 라이브 시뮬(kills=150,stageKills=20,total=92) `150/92`→`20/92`, 진행바 21.7%와 일치. 스테이지 전환 3회 매번 per-stage 리셋(`1/650`→`1/1000`→`1/1100`), 누적 `G.kills`는 유지. pageerror 0.

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
| 프레임 | 상단 중앙 자원과 우측 레벨/경험치는 프레임·배경·구분선 없이 텍스트만 사용 | 플레이 화면을 완전히 비우고 정보는 필요한 수치만 읽게 함 |
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
| `mobilityRing` + `mobilityRingTicks` | 공용 기동게이지 링 | 우측 MP/SP 오브 외곽, 노랑 `#ffcc33` / `rgba(255,204,51,.95)` | 채움: `mobilityPct = clamp(_harpGauge / _HARP_GAUGE_MAX, 0, 1) × 100`; 구분선: `shiftCellDeg = 360 × _HARP_GAUGE_COST[1] / _HARP_GAUGE_MAX` | Shift 사슬기동과 방향키 더블탭 전격이동이 같은 게이지를 소비한다. `mobilityRingTicks`가 1단 탭 코스트(45)마다 간격을 내며, **한 칸은 최소 사슬 이동거리 또는 전격이동 1회**를 뜻한다. 기본 5칸(225)이며, 게이지가 0이면 채움 링을 숨기고 빈 트랙과 구분선은 유지한다. | `#globeMP > .globe-ring-wrap`, `updateHUD()` |
| `stFill`, `stCur`, `stMax` | SP 수치·수위 | 우측 오브의 오른쪽 반, 초록 | `P.st / P.mst` | 기존 수위·숫자 표기는 유지한다. 노란 사슬기동 링은 ST와 독립된 기존 `_harpGauge` 보조표시다. | `#globeMP`, `updateHUD()` |

- 공통 링은 오브의 붉은 프레임 가장자리 안쪽(`inset: 11px`)에 두고, 글라스 레이어 위(`z-index: 33`)에 렌더한다.
- 노란 링은 새 자원을 만들지 않고, 기존 `_harpGauge`를 즉시 읽도록 한 HUD 표현이다. Shift 사슬기동과 전격이동(방향키 더블탭)이 이를 공용으로 사용한다. SP 수위는 초록 오브 수위와 숫자로 별도 확인한다.
- 노란 링의 구분선은 장식용 균등 점선이 아니다. 최대치가 변해도 최소 Shift 탭 1회분인 `_HARP_GAUGE_COST[1]`(45)마다 배치되어, 각 칸이 최소 사슬 이동거리 1회를 보장한다. 구분 간격은 `3deg`, 불투명도는 `0.9`로 두어 실제 플레이 해상도에서도 한 칸의 경계가 보인다.

---

## 2026-08-08 — 게임 시작 가이드 시네마틱 정리 완료

> 범위: 첫 스테이지 인트로의 대사와 3단계 조작 가이드. 초상화/캐릭터가 놓이는 좌측 영역을 비우고, 게임 플레이·난이도 기본값·입력 진행 규칙은 변경하지 않는다. **모바일 전용 레이아웃은 제공하지 않는다.**

| 화면 | 요소 | 위치/형태 | 보존한 동작 |
|---|---|---|---|
| 시작 대사 | `#introTextPanel` | 화면 폭 **50%의 실제 중앙**(컨테이너 좌측 padding 0), 최대 480px, 외곽선 없는 약한 좌→우 음영과 짧은 하단 룬선 | `_INTRO_LINES` 4개를 기존대로 각 1.5초 표시 후 다음 문장으로 진행 |
| 시작 대사 | `#introTextKr`, `#introTextEn` | dirty ivory 고딕 한글 + aged silver Cinzel 영문 | `_showIntroLine()`이 각 리프 노드에 `textContent`로 갱신. 부모 HTML을 교체하지 않음 |
| 조작 가이드 | `#introKeys > .intro-key-panel` | 화면 폭 **50%의 실제 중앙**(컨테이너 좌측 padding 0), 폭 최대 **650px**, 외곽선 없는 약한 좌→우 음영 | 공격 → 스킬 → 생존의 3단계, 클릭/키보드/게임패드 다음 단계 및 350ms 전환 유지 |
| 조작 가이드 글자 | `#ikTitle`, `#ikBody`, `#ikHint` | 제목 `2rem–2.84rem`, 본문 `1.45rem–1.8rem`, 힌트 `1rem` | 모든 안내 문구와 키 입력 표기를 기존 내용 그대로 노출 |
| 커튼 | `#introCurtainTop`, `#introCurtainBot` | 검은 철 그라데이션과 1px aged-silver 봉합선 | 기존 상·하 열림 0.8초와 몬스터 스폰 시점 유지 |
| 모바일 | — | 별도 media query 없음 | 현재 프로젝트는 데스크톱 전용 |

### 시각 의도

- 시작 가이드는 관리형 팝업이 아니라, 짧은 **지옥의 교리문**처럼 한 문장씩 읽히도록 설계한다.
- 울트라와이드에서도 대사·조작 가이드·난이도 선택의 중심은 뷰포트 정확히 50%에 고정한다. 컨테이너에 좌측 padding을 추가해 flex 중심을 밀지 않는다.
- 사각 패널 테두리·좌측 세로선·`GUIDE` 장식·불투명 카드 배경은 사용하지 않는다. 약한 좌→우 음영과 대사의 짧은 하단 룬선만 남긴다.
- 가이드는 실제 플레이 직전의 필수 안내이므로 기존 대비 약 2배의 제목·본문·힌트 크기로 읽히게 하되, 화면 중앙의 전투/캐릭터 영역은 계속 비운다.
- 사용 색상은 dirty ivory / aged silver / muted bronze만 사용하며, 큰 네온·밝은 버튼·모바일형 카드 장식은 추가하지 않는다.

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
| ✦SP/◇CP 자원 | `#hudTop` 상단 중앙 (시계 아래 나열) | 신설 `#hudCorner` 좌측 상단(미니맵 아래 y≈178px), Cinzel .62rem, opacity **.48** |
| 우측 목표 프레임 `.objective-frame` | `display:none` (킬/악의 숨김) | **활성화** — 얇은 철제 프레임(1px rgba(88,72,54,.42), 반투명 흑철 배경) 안에 ☠ 킬 / ◆ 악의 |
| `#killCnt` | JS가 `☠ 0 / 0` 기록 (아이콘 span과 중복) | 숫자만 `0 / 0` (아이콘은 row의 span이 담당) |
| `#expF` 경험치 라인 | 밝은 골드 그라디언트 | 뮤트 브론즈 rgba(122,101,72,.55)→rgba(196,171,124,.85), 2px 룬 라인 |
| CP 숫자 | 원시값 그대로 | `1,584` 천단위 구분, 10만 이상은 `1.06M` 압축 |
| LV 로마숫자 | 정적 | 레벨업 순간 `hud-pulse` 반응 추가 |
| COMBO HUD | 네온 오렌지 #ff6600 + 글로우, 최대 1.2rem | 뮤트 엠버 rgba(201,168,110)→고콤보 rgba(196,74,48), 글로우 축소, 최대 1.1rem |
| MAX COMBO 기록 | 콤보 발생 후 **상시 표시** | 콤보 진행 중(combo≥2)에만 표시 (결과 화면에서 상세) |
| DPS HUD | 네온 레드 #ff4466, 1.4~1.8rem 900weight | 뮤트 브론즈/엠버, 0.92~1.05rem 600weight |
| MAX HIT HUD | 네온 레드 계열 | dirty ivory→엠버 티어 (적색은 최상위 티어만) |
| HUD 토글 배열 12곳 | `['hud','hudTop','mmWrap',…]` | `'hudCorner'` 추가 |

### 유지된 기존 시네마틱 요소 (2026-06 1차 정비분)
- `#areaTitle` 지역 진입 타이틀: `제N구역 · 이름` + `THE ~` 영문 각인체, 3.1s fade in/out ✓
- `#stageClock` 상단 중앙 `02:19` (TIME 텍스트 없음) + 2px 진행 룬 라인 (숫자 % 없음), opacity .57 ✓
- TIME/CLEAR/TOTAL 나열 HUD는 1차 정비에서 이미 제거 — 구버전(_deployed_game.html 6/16)에만 존재. **배포 동기화 필요.**
- 우측 상단 `#mmLvl` opacity .68, 로마숫자 LV ✓

### 색상 규칙 (준수)
dirty ivory `rgba(214,205,187)` / aged silver `rgba(196,187,168)` / dark iron `rgba(88,72,54)` / muted bronze `rgba(196,171,124)` — 순백·네온·시안 금지, 적색은 위험/최상위 티어 한정.

### 신규 표시 텍스트: 없음 (아이콘+숫자만) → 번역대상_전체목록.md 변경 불필요.

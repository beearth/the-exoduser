# THE EXODUSER — 인터페이스 2차 정비 (UI 폴리시 + 반응형)

> **1차 정비 완료**: 키바인딩 불일치 수정, 스킬 디스패치 통합, HUD 그룹핑, 데드코드, Cinzel 폰트 제거
> **2차 목표**: 다양한 해상도에서 깨지지 않는 UI, 일관된 디자인 시스템, 빠진 UX 흐름 보완
> **파일**: game.html (21,814줄)

---

## 현재 문제 진단

### 문제 1: 반응형 CSS 전무 — `@media` 0개

모든 UI 요소가 고정 px/rem 크기. 1920×1080 기준으로만 작동.
- HP바 `width:220px`, ST바 `170px`, DP바 `130px` — 작은 화면에서 잘림
- 인벤토리 `min-width:400px` + 창고 `220px` + 상세 `260px` = 최소 880px 필요
- 능력치 패널 `width:90vw` + 내부 `min-width:400px` 2개 = 800px 이하에서 깨짐
- 퀵슬롯 `46px × 17개` + gap = 최소 900px 필요
- 미니맵 `130×130` 고정 — 작은 화면에서 게임 영역 과다 점유

### 문제 2: CSS 변수 없음 — 색상/크기 하드코딩

동일한 색상이 수십 곳에 흩어져 있음:
- `#443322` (테두리): 패널, 설정, 인벤, 대장간, 퀵슬롯 등 40+회
- `#886644` (텍스트): 라벨, 설명, 가이드 등 30+회
- `#ff8844` (강조): 타이틀, 알림, 쿨다운 등 20+회
- `#ccaa77` (밝은 텍스트): 값, 키 이름 등 15+회

테마 변경/일관성 유지 불가능.

### 문제 3: eq-row 데드 HTML/CSS 잔존

- HTML line 291~297: `<div class="eq-row" style="display:none">` + 6개 슬롯
- CSS line 34~37: `.eq-row`, `.eq-s`, `.ed`, `.ee` — 미사용

### 문제 4: HUD 정보 밀도 불균형

- 상단 HUD: 캐릭이름, LV, 킬수, 악의, SP, CP, 조작법 — **7개 항목 일렬 나열**
- 작은 화면에서 겹침/잘림 가능
- CP(전투력)가 상단에도 있고 인벤토리에도 있음 — 불필요한 중복?

### 문제 5: 스테이지 전환 UX

- 클리어 시 `#stageClear` 오버레이(하단 버튼) → 즉시 다음 맵 생성
- 로딩 인디케이터 없음 — `buildMapCache()`가 무거워지면 프레임 드롭으로 보임
- 사망→재시작/로비 전환 시에도 피드백 부족

---

## 작업 순서 (5단계)

---

### WORK 1: CSS Custom Properties 도입

**목표**: 색상/크기 하드코딩 → CSS 변수로 통합. 향후 테마 변경 가능.

`:root`에 추가 (style 시작 부분, line 10 이후):

```css
:root {
  /* ══ 색상 시스템 ══ */
  --c-bg: #0a0600;
  --c-panel-bg: #1a0e08;
  --c-panel-bg2: #221510;
  --c-border: #443322;
  --c-border-hover: #886644;
  --c-border-active: #ff6633;
  
  --c-text: #aa8866;
  --c-text-bright: #ccaa77;
  --c-text-dim: #665544;
  --c-text-muted: #443322;
  
  --c-accent: #ff8844;
  --c-accent-dim: #cc6622;
  --c-gold: #ffcc44;
  --c-red: #cc2200;
  --c-green: #44aa00;
  --c-blue: #4488dd;
  --c-purple: #bb66ff;
  
  /* ══ 크기 시스템 ══ */
  --hud-bar-h: 12px;
  --qs-size: 46px;
  --panel-pad: 20px;
  --gap-sm: 4px;
  --gap-md: 8px;
  --gap-lg: 16px;
  
  /* ══ 폰트 ══ */
  --font: 'Noto Sans KR', sans-serif;
  --fs-xs: 0.75rem;
  --fs-sm: 0.85rem;
  --fs-md: 1rem;
  --fs-lg: 1.2rem;
  --fs-xl: 1.6rem;
  --fs-title: 2.2rem;
}
```

**교체 대상** (우선순위 높은 것만 — 전부 한꺼번에 안 해도 됨):

| 기존 하드코딩 | CSS 변수 | 사용 빈도 |
|-------------|---------|----------|
| `#443322` (border) | `var(--c-border)` | 40+ |
| `#886644` (text) | `var(--c-text)` | 30+ |
| `#ff8844` (accent) | `var(--c-accent)` | 20+ |
| `#ccaa77` (bright text) | `var(--c-text-bright)` | 15+ |
| `#665544` (dim text) | `var(--c-text-dim)` | 10+ |
| `46px` (qs size) | `var(--qs-size)` | 3 |
| `'Noto Sans KR'` | `var(--font)` | 10+ |

**주의**: JS 인라인 스타일(innerHTML로 넣는 것)은 CSS 변수로 교체 불가. CSS 클래스로 분리 가능한 것만 변경.

---

### WORK 2: 반응형 브레이크포인트 추가

**목표**: 1024px 이하 / 768px 이하에서 UI 깨지지 않게.

style 맨 아래에 추가:

```css
/* ══ 반응형 ══ */
@media (max-width: 1200px) {
  /* 퀵슬롯 축소 */
  .qs { width: 40px; height: 40px; }
  .qs .qs-key { font-size: .65rem; }
  .qs .qs-cnt { font-size: .75rem; }
  
  /* HUD 바 축소 */
  .bar.hp { width: 180px; }
  .bar.st { width: 140px; }
  .bar.mp { width: 110px; }
  .bar.sh { width: 180px; }
  .bar-label { font-size: .95rem; width: 28px; }
  
  /* 상단 HUD 간격 축소 */
  .hud-top { gap: 8px; }
  .st-b { font-size: 1rem; }
}

@media (max-width: 900px) {
  /* 퀵슬롯 더 축소 */
  .qs { width: 36px; height: 36px; }
  .qs .qs-key { font-size: .55rem; }
  
  /* HUD 바 더 축소 */
  .bar.hp { width: 150px; height: 10px; }
  .bar.st { width: 120px; height: 10px; }
  .bar.mp { width: 95px; height: 10px; }
  .bar.sh { width: 150px; height: 10px; }
  .bar-label { font-size: .85rem; width: 24px; }
  
  /* 미니맵 축소 */
  #mm { width: 100px !important; height: 100px !important; }
  
  /* 상단 HUD */
  .hud-top { gap: 6px; flex-wrap: wrap; }
  .st-b { font-size: .85rem; }
  
  /* 패널 풀스크린화 */
  .pbox { width: 100vw !important; max-width: 100vw !important; height: 100vh; max-height: 100vh; border: none; border-radius: 0; }
  
  /* 인벤토리 세로 스택 */
  .inv-wrap { flex-direction: column; overflow-y: auto; gap: 10px; }
  .inv-left { width: 100%; min-width: 0; border-right: none; border-bottom: 1px solid var(--c-border); }
  .inv-storage { width: 100%; min-width: 0; border-top: 1px solid var(--c-border); padding-right: 0; padding-bottom: 10px; max-height: 220px; }
  .inv-right { width: 100%; min-width: 0; border-left: none; border-top: 1px solid var(--c-border); }
  .inv-grid { grid-template-columns: repeat(auto-fill, minmax(38px, 1fr)); max-height: none; }
  
  /* 능력치 패널 세로 스택 */
  #statPanel .pbox > div:nth-child(2) { flex-direction: column; }
  #statLeft, #statRight { min-width: 0 !important; }
}

@media (max-width: 600px) {
  /* 메뉴 그룹 숨김 — 터치로 대체 (미래) */
  #qsRow > div:last-child { display: none; }
  
  /* HUD 최소화 */
  .bar.hp { width: 120px; }
  .bar.st { width: 100px; }
  .bar.mp { width: 80px; }
  
  /* 보스바 축소 */
  .bhw { width: 200px; }
  
  /* 스테이지 라벨 */
  .stage-lbl { font-size: 1rem; }
  .room-lbl { font-size: .8rem; }
}
```

**주의사항**:
- 미니맵 캔버스는 JS에서 `width/height` 속성으로 그리므로, CSS `!important`로 표시 크기만 변경
- 인벤토리 그리드 `repeat(30,1fr)`은 900px 이하에서 `auto-fill`로 전환
- 능력치 패널의 좌/우 레이아웃도 세로 스택으로

#### 2026-04-14 적용 로그 (코드 동기화)

| 구분 | 적용값 | 위치 |
|---|---|---|
| 퀵슬롯 1200px | `.qs 40x40`, `.qs-key .65rem`, `.qs-cnt .75rem` | `game.html` `@media (max-width:1200px)` |
| 퀵슬롯 900px | `.qs 36x36`, `.qs-key .55rem`, `.qs-cnt .72rem` | `game.html` `@media (max-width:900px)` |
| 인벤토리 세로 스택 | `.inv-wrap{flex-direction:column}` | `game.html` `@media (max-width:900px)` |
| 좌측 장비영역 | `.inv-left{width:100%;min-width:0;border-right:none;border-bottom:1px solid var(--c-border)}` | `game.html` `@media (max-width:900px)` |
| 창고영역 | `.inv-storage{width:100%;min-width:0;border-top:1px solid var(--c-border);padding-right:0;padding-bottom:10px;max-height:220px}` | `game.html` `@media (max-width:900px)` |
| 우측 상세영역 | `.inv-right{width:100%;min-width:0;border-left:none;border-top:1px solid var(--c-border);padding:10px 0 0}` | `game.html` `@media (max-width:900px)` |
| 가방 그리드 | `.inv-grid{repeat(auto-fill,minmax(38px,1fr))}`, `#invGrid{max-height:42vh}` | `game.html` `@media (max-width:900px)` |
| 창고 그리드 | `#invStGrid{repeat(8,minmax(28px,1fr))}` | `game.html` `@media (max-width:900px)` |
| 600px 보조 규칙 | `.hud-top{left:8px;right:8px;justify-content:center}` | `game.html` `@media (max-width:600px)` |

#### 2026-04-14 대장간 아이콘 가독성 개선

| 항목 | 변경 내용 | 위치 |
|---|---|---|
| 탭 구조 | 텍스트만 출력 → `아이콘 박스 + 라벨` 2요소 구조로 분리 (`fg-tab-ico`, `fg-tab-txt`) | `game.html` `renderForge()` |
| 탭 메타 | 탭별 `icon/ko/en` 메타 객체 도입 (`_fgTabMeta`)으로 아이콘/언어 라벨 일관화 | `game.html` `renderForge()` |
| 탭 시각 | 대장간 전용 `#forge` 오버라이드에서 4열 카드형 탭, 34x34 아이콘 칩, 활성 탭 주홍-금색 하이라이트, hover 리프트를 적용 | `game.html` `#forge .fg-tabs`, `#forge .fg-tab`, `#forge .fg-tab .fg-tab-ico`, `#forge .fg-tab.act` |
| 아이콘 소스 | 탭별 개별 PNG 직접 삽입: `output/imagegen/forge-tabs-v3/{tabKey}.png` | `game.html` `renderForge()` |
| 에셋 경로 | `output/imagegen/forge-tabs-v3/upgrade.png` ~ `headband.png` (총 17개) | 프로젝트 루트 출력물 |
| 가독성 미세조정 | 아이콘 18→22px, 탭 패딩 5→6px, 아틀라스 배율 `400x300%`(4x3 시트 기준), 대비/밝기/글로우 강화 | `game.html` `.fg-tab`, `.fg-tab-ico`, `.fg-tab-ico.atlas` |
| 렌더 우선순위 | `<img>` 직접 렌더, v3 기반 PNG 우선 사용, 파일 누락/로드 실패 시 data URI SVG 아이콘으로 자동 대체(빈칸 방지) | `game.html` `.fg-tab-ico-img`, `_forgeTabFallbackData()`, `renderForge()` |
| 로드 재시도 | 최초 이미지 로드 실패 시에도 대장간 열림 상태에서 1.3초 간격 자동 재시도(1회 실패 고정 방지) | `game.html` `_ensureForgeAtlasLoad()` |

---

### 2026-04-16 하드코어 고어 UI 디자인셋 개편

| 항목 | 변경 내용 | 위치 |
|---|---|---|
| 디자인 방향 | `Diablo IV` 계층감 + `Path of Exile` 정보 밀도 + `Darkest Dungeon` 대비 + `Hades` 버튼 식별성을 참조한 `검은 금속 / 피빛 봉합선 / 악의 보라 코어` 세트로 통일 | 구현 의도 |
| 타이포그래피 | 공통 본문은 `Noto Sans KR`, 타이틀/핵심 라벨은 `Black Han Sans`로 분리 (`--font-display`) | `game.html` `@import`, `:root`, `.ptitle`, `#bossBar .bn`, `#forge #forgeMats` |
| HUD 상단 | 자원/정보칸을 뼈빛 텍스트 + 혈흔 금속 캡슐 배경으로 재정의 | `game.html` `#hud`, `.hud-top`, `.st-b`, `#matCnt`, `#goldCnt` |
| 보스바 | 이름은 디스플레이 폰트, 체력/포이즈 바는 혈흔-뼈색 그라데이션으로 재정의 | `game.html` `#bossBar .bn`, `.bhw`, `.bhf`, `.bpw`, `.bpf` |
| 공통 패널 | 모든 `pbox`에 검은 금속 배경, 주홍 반사광, 봉합선 텍스처, 라운드 18px 프레임 적용 | `game.html` `.panel`, `.pbox`, `.pbox::before`, `.ptitle`, `.pclose` |
| 퀵슬롯 | 슬롯 프레임을 둥근 금속 조각 형태로 변경하고 키캡/카운트 가독성 강화 | `game.html` `.qs`, `.qs .qs-key`, `.qs .qs-cnt`, `.sk-pop`, `.sk-opt` |
| 대장간 성소화 | 대장간 패널 폭 확대, 보라 악의 바, 4열 탭, 고어 금속 카드, 강화된 제작 확인 바 적용 | `game.html` `#forge .pbox`, `#forge #forgeMats`, `#forge #forgeLore`, `#forge .fg-tabs`, `#forge .fg-i`, `#forge #forgeConfirm`, `#forge #fgCraftBtn` |
| 인벤/스탯 카드 | 인벤 슬롯과 스탯/패시브 행에 동일한 검은 금속 카드 재질과 좌측 혈흔 액센트 추가 | `game.html` `#invPanel .inv-grid>div`, `#statPanel .stat-row`, `#statPanel .passive-row` |

### 2026-04-16 스킬 슬롯 아이콘 인셋 보정

| 항목 | 변경 내용 | 위치 |
|---|---|---|
| 슬롯 컨테이너 유지 | `.qs`의 크기/배치/패딩은 원본 그대로 유지하고, 슬롯 실루엣은 건드리지 않음 | `game.html` `.qs` |
| 아이콘 렌더 클래스 | `_skIcon()`이 인라인 `width:100%; height:100%` 대신 `.qs-icon` 클래스를 사용하도록 변경 | `game.html` `_skIcon()` |
| 아이콘 인셋 | `.qs-icon`을 `position:absolute`로 두고 `top:3px; left:3px; width:calc(100% - 6px); height:calc(100% - 6px)`를 적용해 슬롯 내부 공백을 상하좌우 대칭으로 유지 | `game.html` `.qs .qs-icon` |

---

### WORK 3: eq-row 데드코드 완전 제거

**삭제 대상 1 — CSS (line 34~37):**
```css
.eq-row{display:flex;gap:6px;justify-content:flex-end}
.eq-s{width:46px;height:46px;background:rgba(0,0,0,.5);border:1px solid #332211;display:flex;align-items:center;justify-content:center;font-size:18px;position:relative;cursor:pointer;pointer-events:all}
.eq-s .ed{position:absolute;bottom:1px;width:100%;text-align:center;font-size:.8rem;color:#888}
.eq-s .ee{position:absolute;top:2px;right:2px;width:6px;height:6px;border-radius:50%}
```

**삭제 대상 2 — HTML (line 291~298):**
```html
<div class="eq-row" style="display:none">
  <div class="eq-s" id="eq0" title="검 (좌클릭)"><div class="ed">검</div></div>
  <div class="eq-s" id="eq1" title="견갑 (우클릭)"><div class="ed">견갑</div></div>
  <div class="eq-s" id="eq2" title="부츠"><div class="ed">부츠</div></div>
  <div class="eq-s" id="eq3" title="갑옷 (SHIFT)"><div class="ed">갑옷</div></div>
  <div class="eq-s" id="eq4" title="투구 (E)"><div class="ed">투구</div></div>
  <div class="eq-s" id="eq5" title="활 (SPACE)"><div class="ed">활</div></div>
</div>
```

**보존 대상 — 절대 건드리지 마:**
- `.inv-eq-slot` (인벤토리 장비 슬롯)
- `.inv-eq-sil` (인벤토리 실루엣 SVG)
- `inv-eq-wrap` (인벤토리 장비 그리드)

---

### WORK 4: 상단 HUD 정보 정리

**현재 (line 305~312):**
```
[캐릭이름] [LV.1] [💀 0] [👿 0] [⭐ 0] [⚡ 0] [? 조작법]
```
→ 7개 항목 일렬 — 좁은 화면에서 겹침

**개선안**: 2행 구조 + 논리적 그룹핑

```html
<div class="hud-top" id="hudTop">
  <div style="display:flex;gap:10px;align-items:center">
    <div class="st-b" id="charNameHud" style="color:#cc8855;font-size:1rem"></div>
    <div class="st-b" id="lvLbl" style="color:#ffaa00">LV. 1</div>
    <div id="expBar" style="width:80px;height:3px;background:rgba(0,0,0,.5);border:1px solid #332211;border-radius:2px"><div id="expF" style="height:100%;background:#ffaa00;width:0%"></div></div>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <div class="st-b" id="killCnt">💀 0</div>
    <div class="st-b" id="matCnt" style="color:#cc66ff;cursor:pointer;pointer-events:all" title="[G] 대장간">👿 0</div>
    <div class="st-b" id="spCnt" style="color:#ffcc00;cursor:pointer;pointer-events:all" title="[C] 능력치">⭐ 0</div>
    <div class="st-b" id="cpHud" style="color:#ffcc44;font-size:1.1rem">⚡ 0</div>
  </div>
  <div class="st-b" id="keyGuideToggle" style="color:#887744;font-size:1rem;cursor:pointer;user-select:none">? 조작법</div>
</div>
```

**변경점**:
- 이름+레벨+경험치바를 한 그룹으로
- 리소스(킬/악의/SP/CP)를 한 그룹으로
- expBar를 상단 HUD 안으로 이동 (기존 별도 div 제거)
- 조작법 버튼은 우측 끝

**기존 expBar div (line 333) 제거**:
```html
<!-- 삭제 -->
<div id="expBar" style="position:fixed;top:32px;left:14px;...">
```

**주의**: `updateHUD()` 함수에서 `$('expF').style.width = ...` 로 경험치 업데이트 — ID가 동일하므로 JS 수정 불필요.

---

### WORK 5: 스테이지 전환 로딩 인디케이터

**현재 문제**: 다음 층 버튼 클릭 → `buildMapCache()` + `initSwayObjects()` + `initGlowObjects()` 등 비주얼 시스템 초기화가 한 프레임에 몰려서 버벅임.

**해결**: 전환 시 간단한 로딩 오버레이 표시.

**HTML 추가** (#stageClear 아래):
```html
<div id="stageTransition" style="position:fixed;inset:0;z-index:38;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.95);opacity:0;pointer-events:none;transition:opacity .3s">
  <div style="text-align:center">
    <div id="stNextName" style="color:#886644;font-size:1.5rem;font-weight:700;letter-spacing:.2em;margin-bottom:12px"></div>
    <div style="width:200px;height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin:0 auto">
      <div id="stLoadBar" style="height:100%;background:#ff8844;width:0%;transition:width .2s"></div>
    </div>
    <div style="color:#554433;font-size:.8rem;margin-top:8px;letter-spacing:.1em">지옥으로 내려가는 중...</div>
  </div>
</div>
```

**JS — 기존 다음층 이동 로직을 감싸기**:

기존 `nextBtn` 클릭 핸들러에서 `nextStage()` 또는 유사 함수 호출 부분을 찾아서:

```javascript
// nextBtn 클릭 시:
function showStageTransition(callback) {
  const el = $('stageTransition');
  const bar = $('stLoadBar');
  const name = $('stNextName');
  
  const nextStg = G.stage + 1;
  const hell = Math.min(6, ~~(nextStg / 10));
  const HELL_NAMES = ['얼어붙은 호수','독의 정원','불꽃 성소','심연의 꿈','폭풍 제단','고요한 안식처','허공의 바다'];
  name.textContent = (nextStg + 1) + '층 — ' + HELL_NAMES[hell];
  
  el.style.opacity = '1';
  el.style.pointerEvents = 'all';
  bar.style.width = '0%';
  
  // 프레임 분산: 30% → 맵 생성, 60% → 캐시, 100% → 완료
  requestAnimationFrame(() => {
    bar.style.width = '30%';
    setTimeout(() => {
      callback(); // 실제 스테이지 전환
      bar.style.width = '100%';
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }, 400);
    }, 300);
  });
}
```

**주의**: 실제 `nextStage` / 스테이지 전환 함수명을 코드에서 확인 후 적용. `grep -n "nextBtn\|nextStage\|G.stage++" game.html`로 위치 파악.

---

## 작업 순서 요약

| 순서 | 작업 | 줄 수 영향 | 위험도 |
|------|------|-----------|--------|
| WORK 1 | CSS 변수 도입 | +20줄 `:root`, 교체 100+ | ⭐⭐ (CSS만) |
| WORK 2 | 반응형 @media | +80줄 CSS 추가 | ⭐⭐ (CSS만) |
| WORK 3 | eq-row 데드코드 제거 | -12줄 | ⭐ (삭제만) |
| WORK 4 | 상단 HUD 구조 | HTML 교체 | ⭐⭐ (레이아웃) |
| WORK 5 | 스테이지 전환 로딩 | +30줄 HTML+JS | ⭐⭐ (새 기능) |

**WORK 순서**: 1 → 2 → 3 → 4 → 5 (문서 순서대로 진행)

---

## 컨텍스트 (클코에 같이 전달)

- game.html 21,814줄 단일 HTML
- 현재 `@media` 쿼리 0개, CSS 변수 0개
- `.inv-eq-slot`, `.inv-eq-sil` = 인벤토리 장비 UI → 보존
- `.eq-row`, `.eq-s`, `.ed`, `.ee` = 미사용 데드 CSS → 삭제
- `updateHUD()` = 매 3프레임마다 HUD 갱신 (line 근처에서 `_hudSkip` 검색)
- `$('expF').style.width` = 경험치바 업데이트 — ID 유지 필수
- `buildMapCache()` = 맵 캐시 빌드 (비주얼 14스텝 포함, 무거움)
- `_tseed()`, `ELC[]`, `ETYPE_COL[]` = 절대 수정 금지
- 외부 CDN: Supabase만 허용, 폰트는 Noto Sans KR만

---

## 스킬 슬롯 쿨다운 표기 시스템

스킬이 SKILL_SLOTS에 등록되면 `_skCdMap`에서 해당 스킬의 쿨다운 변수를 참조하여 HUD에 자동 표시.

### _skCdMap (game.html updateQS 내)
| 스킬 id | 쿨다운 변수 | 비고 |
|---|---|---|
| maliceMortar | P._mmCd | 악의포격 |
| holyBlast | P._hbCd | 신성폭발 |
| bladeShot | P._bltCd | 칼날탄 |
| lavaSummon | P._lvCd | 용암소환 |
| iceOrb | P._ioCd | 얼음보주 |
| ghostWalk | P._gwCd | 뇌전걸음 |
| bladeDash | P._bdCd | 전격이동 |
| plagueBurst | P._pbCd | 역병폭발 |
| shieldThrow | P._stCd | 칼등날개 |
| blastShot | P._bsCd2 | 폭렬탄 |
| giantSlam | P._gslCd | 거대슬램 |
| holyDome | P._hdCd | 신성돔 |
| spikeTrap | P._gcCd | 가시덫 |
| needleShot | P._ndCd | 만화방창 II |
| holyPrison | P._hpCd | 신성감옥 |
| execution | P._execCd | 처형 |
| peaceShield | P._psCd | 평화보호 |
| blueShot | P._blueCd | 푸른탄 |
| blackStar | P._bsCd | 블랙스타 |
| weakPhys | P._wpCd | 파쇄의 영역 |
| weakMag | P._wmCd | 침식의 영역 |
| weakPj | P._wjCd | 관통의 영역 |
| weakRev | P._wrCd | 역전의 영역 |
| voidScarecrow | P._vsCd | 허수아비 |
| ghostXbowTurret | 0 | 유령석궁 (쿨 없음) |

### 별도 처리 스킬 (스택/충전 방식)
- maliceHunt: P._mhCd (단독 분기)
- maliceStorm/iceStorm/boneWall/hellRay: 스택 시스템 (_msStk/_isStk/_bwStk/_hrStk + 충전타이머)
- maliceStorm (boneStorm/elecRepent 합체): P._bnsCd (쿨다운 방식으로 전환)

> 새 스킬 추가 시 _skCdMap에 쿨다운 변수 등록 필수. 등록하지 않으면 HUD에 쿨다운 미표시.

### 메인 스킬바 13슬롯 복구 (2026-04-16)
- 메인 스킬바는 원본 기준 13슬롯만 사용: `qs0~qs3`, `qs5`, `ultSlot`, `skSlotLMB`, `skSlotRMB`, `skSlot0`, `qsE`, `qsQ`, `skSlotCT`, `skSlot1`
- `qsT`는 메인바 DOM/호버 집합에서 제외해 13칸 바에 14번째 스킬 아이콘이 올라오지 않도록 복구
- `qsQ`, `skSlotCT`, `skSlot1` 좌표를 한 칸씩 당겨 원본 실루엣으로 복귀

### 메인바 키 텍스트 오버레이 제거 (2026-04-16)
- `_initFixedSlotKeys()`는 visible 슬롯의 `.qs-key`를 제거만 수행
- 키 표기는 스킬 이미지 위 오버레이 대신 바 하단 원본 아트 라벨 기준으로 유지
- `#qsRow .qs .qs-key { display:none }`로 잔여 키캡 노드가 있어도 메인바 위에 표시되지 않게 고정

### Space 슬롯 (skSlot1) 쿨다운 표시
Space 슬롯(SKILL_SLOTS[4])에도 모든 스킬 쿨다운 오버레이+숫자 표시 추가됨.
- `_spCdMap`: 1~4번 슬롯과 동일한 쿨다운 변수 참조
- 스택형 스킬(maliceStorm/iceStorm/boneWall/hellRay)도 스택 숫자 표시
- 쿨다운 중: 어두운 오버레이 + 초 단위 카운트다운 + 이모지 반투명

### 고정 슬롯 CD sweep 추가 (2026-04-16)
`_updateActionKeys()` 내 3개 슬롯에 `_skCdSweep(pct,txt)` conic-gradient 오버레이 + 초단위 카운트다운 신규 적용. (`game.html:15882`)

> **z-index 버그 수정 (2026-04-16)**: 모든 `_skCd` 오버레이 cssText에 `z-index:3` 추가. 이전: `.qs .qs-icon { z-index:1 }`이 sweep 오버레이(기본 z-index:auto)를 덮어 전 슬롯(skSlot0/qsE/qsQ/skSlotCT/skSlot1/ultSlot/qs0~5) sweep이 보이지 않았음. RMB `_rmbCdOv`만 bottom-up fill 구조라 무관했음.

| 슬롯 | 대상 쿨다운 | Max 공식 | 비고 |
|------|------------|----------|------|
| `skSlot0` (Shift/돌진) | `P.chargeCd` | `isDimBreach()?max(180,420-cbLv*20):(chargeBoost>=1?600:300)` | 스택<최대 && cd>0 일 때만 표시. `chargeBoost` 레벨에 따라 차원돌진 감소 반영 |
| `qsE` (E/마법) | `activeMagicSk` 기반 | blueShot:300, fireAura:720, 나머지는 `SKILL_LIST[...].cd` | fireball/omniBeam/elemMissile/burstLoop은 내장 CD 없음 (미표시) |
| `qsQ` (Q/보호막) | `activeQSk==='peaceShield'?P._psCd:0` | `SKILL_LIST.peaceShield.cd` 또는 폴백 900 | 기본 `parry`는 CD 없음 |

공통: pct = cdNow/cdMax, txt = `(cd/60).toFixed(1)+'s'`. 요소는 `._skCd` 클래스로 DOM 생성/제거.

### HUD CD sweep 전체 커버리지 (2026-04-16 완료 후)
13개 메인 스킬바 슬롯 전부 CD 가시화:

| 슬롯 | CD 표기 방식 | 구현 위치 |
|------|--------------|-----------|
| qs0~qs3, qs5 | 포션: 하단 초, 스킬: sweep+초 | `updateQS` (game.html:15792) |
| ultSlot | sweep+초 | `_updateUltSlot` (15864) |
| skSlotLMB | 없음 (회전참은 hold-to-spin) | — |
| skSlotRMB | 하단 bottom-up bar (shieldThrow) | `_updateActionKeys` (15977) |
| skSlot0 | sweep+초 (chargeCd) | **신규** 15915 |
| qsE | sweep+초 (magic CD) | **신규** 15892 |
| qsQ | sweep+초 (peaceShield) | **신규** 15952 |
| skSlotCT | sweep+초 | `_updateActionKeys` (15968) |
| skSlot1 | sweep+초 (Space) | `_updateActionKeys` (15937) |

### 패널 UI 창별 프레임 배정 (2026-04-16)

- 적용 범위는 `메인화면/메인 스킬바`가 아니라 `설정`, `인벤토리`, `대장간`, `창고`, `능력치`, `스킬 패널`만 한정
- `width/height/position/grid/flex/슬롯 수/DOM 배치`는 유지하고, 패널 표면/텍스트/아이콘/버튼 스킨만 변경
- 목표 톤은 `네온 금속`이 아니라 `타버린 흑철 + 붉은 동테두리 + 잿빛 금속 활자`
- 새 프레임 생성 프롬프트 기준은 `docs/10ai에셋프롬프트모음/UI_프레임_배경_생성프롬프트.md`

| 항목 | 적용 내용 | 실제 위치 |
|---|---|---|
| 패널 표면 | 검정-암적갈 매트 그라데이션 + 코너 불씨 + 이중 프레임 오버레이 | `game.html` `/* ══ INFERNAL RELIC PANEL THEME ══ */` |
| 타이틀 아이콘 | `img/ui_icons/ui_panel_*.svg`를 `ptitle::before`로 삽입, grayscale/sepia 저채도 처리 | `#settings/#invPanel/#forge/#storagePanel/#statPanel/#skillPanel .ptitle::before` |
| 타이틀 활자 | 뼛빛-구리빛 그라데이션 텍스트, 과한 glow 제거, `Noto Sans KR` 기반 고딕 톤 | `.ptitle` |
| 패널 카드 | `set-section`, `combatPower`, `forgeMats`, `forgeConfirm`, `statSummary`를 동일한 흑철 카드 톤으로 통일 | `#settings`, `#invPanel`, `#forge`, `#statPanel` |
| 버튼류 | 버튼/닫기/능력치요약/결정버튼을 검정 배경 + 은회색 테두리로 통일, hover는 밝기만 소폭 상승 | `button`, `#smToggleBtn`, `#combatPower + div` |
| 대장간 탭 | 중앙 정렬 아이콘+텍스트 카드형 유지, active는 레퍼런스처럼 붉은 동테두리만 약하게 점등 | `#forge .fg-tab*` |
| 인벤/창고 셀 | 인벤 슬롯/장비칸/창고칸을 검정 배경 + 은회색 테두리로 통일 | `#invPanel .inv-*`, `#storagePanel #storageGrid>div` |
| 스킬 패널 | 카테고리 헤더/스킬 카드/설명 박스를 동일한 지옥 유물 프레임 톤으로 정렬 | `#skillGrid*`, `#skillInfo`, `#skillGridWrap` |
| 이모지 제거 | `결정`, `지옥창고`, `능력치 요약`, `키 설정 초기화`, `장비 강화`, `악의의 분해로`, `결정 분해` 등 패널 UI 텍스트에서 이모지 제거 | 정적 HTML + `_applyLang()` + `_T()` 번역 키 |

#### 패널 텍스트 정리 규칙

| 대상 | 이전 | 현재 |
|---|---|---|
| 결정 버튼 | `💎 결정` | `결정` |
| 창고 토글 | `🏚 지옥창고` | `지옥창고` |
| 능력치 요약 | `📋 능력치 요약` | `능력치 요약` |
| 키 설정 초기화 | `⟲ 키 설정 초기화 (또는 F5 키)` | `키 설정 초기화 (또는 F5 키)` |
| 대장간 강화 헤더 | `⚒️ 장비 강화 (실패 시 재료만 소멸)` | `장비 강화 (실패 시 재료만 소멸)` |
| 악의 분해 헤더 | `🔥 악의의 분해로 — 장비를 악의로 갈아버려라` | `악의의 분해로 — 장비를 악의로 갈아버려라` |
| 결정 분해 헤더 | `🔥 결정 분해 → 결정 가루` | `결정 분해 → 결정 가루` |

> 확인 포인트: 패널은 더 이상 전부 같은 배경을 쓰지 않고, `창별로 다른 프레임 이미지`를 배정한다. 공통으로 남기는 것은 `텍스트/카드/버튼의 톤`뿐이다.

#### 창별 프레임 아트 배정

| 창 | 배경 자산 | 레퍼런스 출처 | 비고 |
|---|---|---|---|
| 설정 | `img/ui_refs/window_frames/panel-settings-chains-v2.png` | `ChatGPT Image 2026년 4월 16일 오후 11_05_52.png` | **v2(2026-04-17)** 분할 2단 프레임, 체인/후크 |
| 인벤토리 | `img/ui_refs/window_frames/panel-inventory-chains-v2.png` | `00.png` (2026-04-17) | **v2(2026-04-17)** 체인+해골 전체 프레임 |
| 대장간 | `img/ui_refs/window_frames/panel-forge-skulls-v2.png` | `ChatGPT Image 2026년 4월 16일 오후 11_07_39.png` | **v2(2026-04-17)** 하단 해골 악세, 분할 2단 프레임 |
| 창고 | `img/ui_refs/window_frames/panel-storage-bones.png` | `ChatGPT Image 2026년 4월 16일 오후 11_05_52.png` 좌상 | 뼈무더기/잔불 프레임 |
| 능력치 | `img/ui_refs/window_frames/panel-stats-thorns.png` | `ChatGPT Image 2026년 4월 16일 오후 11_05_52.png` 우상 | 뿔/가시 프레임 |
| 스킬 | `img/ui_refs/window_frames/panel-skills-runes.png` | `ChatGPT Image 2026년 4월 16일 오후 11_05_52.png` 우하 | 룬/촛불 프레임 |

> **v2 히스토리 (2026-04-17)**: 설정/인벤토리/대장간 3개 창을 공통 디자인의 신규 프레임(`*-v2.png`)으로 전면 교체. 기존 `panel-settings-chains.png` / `panel-inventory-bloodhands.png` / `panel-forge-relic.png`는 레거시 아카이브로 남겨둠(코드에서는 더 이상 참조하지 않음).

> **v2 업스케일 (2026-04-17 추가)**: 원본이 ~770×510이라 95vw에서 흐림 발생 → PIL LANCZOS 3배 + UnsharpMask(radius=1.2, 60%, threshold=2)로 재저장. 현재 해상도 `2307×1581 / 2223×1452 / 2313×1545`. 다음 재생성 시에는 1600~2048 원본으로 뽑을 것. CSS URL에는 `?v=20260417a` 캐시 버전 쿼리가 붙어 있음.

#### HELLISH PANEL RESET (2026-04-17)

사용자 피드백: "너무 정적이고 포멀" → 프레임 안 **상자-인-상자**를 전부 뜯어내고 프레임 아트 위에 텍스트만 유기적으로 올리는 방향.

| 층 | 기존 | 2026-04-17 리셋 |
|---|---|---|
| 프레임 껍데기 | `.pbox` 배경 PNG | **유지** |
| 중앙 다크닝 | `.pbox::after` radial `rgba(0,0,0,.56~.86)` | **약화** → `rgba(0,0,0,.12~.42)` |
| 설정 추가 오버레이 | `.window-frame-bg::after` 의 ember glow + inset box-shadow | **약화** → box-shadow 제거, 그라디언트 대폭 완화 |
| 내부 패널 | `.frame-inner-panel` 반투명 검정 카드 | **투명** 처리, 패딩만 유지 |
| 설정 섹션 카드 | `.set-section` 어두운 그라디언트 + 보더 | **투명** + 상단 얇은 dashed 라인만 |
| 인벤 컬럼 카드 | `.inv-left/center/right` 반투명 검정 | **투명** 처리, 슬롯 셀 단위만 미세 배경 |
| 대장간 그리드 | `#fgGrid` 어두운 배경 + 보더 | **투명** 처리 |
| 타이틀 | `.ptitle` 2rem 고딕체 | **2.4rem 명조 serif + Cinzel + 주황 글로우 32px** |
| 라벨 | `.set-label` 어두운 라인 border-bottom | **좌우 ember 그라디언트 장식 라인** + 중앙 정렬 |

**폰트 교체**:
- 본문: `--font-hell: 'Nanum Myeongjo', 'Noto Serif KR', 'Gowun Batang', serif` — 한글 명조체(카빙/비석 느낌)
- 타이틀: `--font-hell-title: 'Cinzel Decorative', 'Nanum Myeongjo', 'Noto Serif KR', serif` — 라틴 장식 serif + 한글 명조
- 적용 범위: `#settings`, `#invPanel`, `#forge` 와 그 자식 모두 (`input/select/button` 포함) `!important` 강제
- Google Fonts 추가 import: `Cinzel Decorative (700/900)`, `Nanum Myeongjo (400/700/800)`, `Gowun Batang (400/700)`, `Noto Serif KR (400/600/700/900)`

**설계 원칙**:
- 프레임 아트가 주연, 텍스트는 그 위에 **부드럽게** 올림 (읽기 용이성은 `text-shadow` 2중(흑색 + 주황 glow)로 확보)
- "카드/섹션" 개념을 없애고 텍스트 스트림처럼 흘리는 레이아웃 → 정적 폼에서 벗어남
- 상호작용 요소(key/button/select)는 테두리 선 + 반투명 배경을 최소 강도로만 유지해 **클릭 가능성**은 보존
- 다른 UI(HUD, 창고, 능력치, 스킬창)는 영향 없음 — 이 섹션은 3개 창 전용

#### 구현 규칙

| 규칙 | 적용 |
|---|---|
| 공통 베이스 | `INFERNAL RELIC PANEL THEME`가 카드/버튼/텍스트 톤을 유지 |
| 창별 분기 | `PANEL-SPECIFIC FRAME ART`에서 패널별 `background-image`만 덮어씀 |
| 레이아웃 보존 | `width/height/position/grid/flex/DOM 구조`는 유지 |
| 프레임 오버레이 | 공통 `::after` 이중 프레임은 끄고, 실제 배경 자산 프레임을 사용 |
| 프레임 사용법 | 프레임 이미지는 `border shell`처럼 쓰고, 실제 UI 내용은 별도 내부 패널 위에 올린다 |

#### 프레임 구조 규칙 (2026-04-16 확정)

```css
.frame {
  position: relative;
  padding: 40px;
  background: url('/img/ui_refs/window_frames/...') no-repeat center;
  background-size: 100% 100%;
}

.panel {
  background: rgba(0, 0, 0, 0.65);
  border-radius: 12px;
  padding: 20px;
}

.frame::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(0,0,0,0.6),
    rgba(0,0,0,0.85)
  );
  pointer-events: none;
}
```

| 층 | 역할 | 현재 구현 |
|---|---|---|
| 프레임 껍데기 | 배경 이미지로 외곽 장식만 담당 | `.pbox`, `.skill-pbox` |
| 중앙 다크닝 | 중앙 질감/노이즈를 눌러 가독성 확보 | `.pbox::after`, `.skill-pbox::after` |
| 내부 패널 | 실제 텍스트/슬라이더/그리드가 올라가는 읽기 영역 | `.frame-inner-panel` |
| 내부 보조 카드 | 인벤 좌/중/우, 스킬그리드, 창고리스트 등 2차 정보 박스 | 개별 `background: rgba(0,0,0,...)` 카드 |

#### 프롬프트 고정 규칙

| 항목 | 규칙 |
|---|---|
| 공통 베이스 | `dark fantasy game UI background frame...` 베이스 프롬프트를 모든 창 프레임 생성의 시작점으로 사용 |
| 필수 키워드 | `center area clean`, `low detail center`, `no text`, `UI readability`, `detail only on border` 반드시 포함 |
| 금지 키워드 | `high detail everywhere`, `grunge full background`, `blood splatter all over`, `complex texture center` 금지 |
| 창별 파생 | 설정=`체인`, 팝업=`고어`, 스킬=`룬/스킬` 버전을 베이스 뒤에 추가 |

#### 가독성/배경 스케일 보정 (2026-04-16)

- 기준은 `ChatGPT Image 2026년 4월 16일 오후 11_18_47.png`처럼 `배경 프레임은 더 크게`, `실제 텍스트/슬라이더 영역은 중앙 백플레이트 위에 또렷하게` 보이는 상태
- 이후 확정 규칙은 `배경 확대`보다 `프레임 shell + 내부 panel + 중앙 dark overlay` 조합을 우선한다

| 항목 | 보정 내용 | 적용 위치 |
|---|---|---|
| 프레임 shell | 프레임 이미지는 `100% 100%`로 전체 패널에 맞추고, 외곽 장식만 담당 | `#settings/#invPanel/#forge/#storagePanel/#statPanel/#skillPanel` background-image |
| 패널 폭 확대 | 설정/능력치/스킬/대장간/창고/인벤의 실폭을 키워 내부 2열/그리드가 덜 답답하게 보이도록 조정 | `.pbox`, `.skill-pbox` width/padding |
| 중앙 다크닝 | 패널 전체 위에 radial gradient를 덮어 중앙 질감을 죽이고 텍스트 대비 확보 | `.pbox::after`, `.skill-pbox::after` |
| 중앙 백플레이트 | 설정/능력치/인벤/대장간/창고/스킬 메인 영역에 반투명 어둠 백플레이트를 추가해 텍스트 대비 확보 | `.frame-inner-panel` |
| 컬럼 카드화 | 인벤 좌/중/우 컬럼 자체에도 얕은 카드 배경을 추가해 아이템/설명 가독성 보강 | `.inv-left/.inv-center/.inv-right` |
| 리스트 영역 보강 | 대장간/창고/스킬 내부 스크롤 영역에 완만한 백플레이트와 padding 추가 | `#fgGrid`, `#storageGrid`, `#skillGridWrap` |

> 목표: 프레임은 `테두리`, 정보 레이어는 `안쪽 별도 패널`. 중앙 질감은 죽이고 바깥 장식만 남겨서 읽기 쉽게 만든다.

#### 설정/인벤토리/대장간 공통 사이즈 통일 (2026-04-17)

- 3개 창을 신규 v2 프레임으로 교체하면서 **공통 사이즈**로 맞춤. "보통 모니터(16:9)에서 최대한 크게" 요청 반영.
- 기존: 설정 `min(1180px,94vw)`, 인벤 `min(1600px,96vw) × min(94vh,1040px)`(사실상 풀스크린), 대장간 `min(760px,92vw)` — 제각각이었음
- **신규 공통 규격 (`game.html` L1433~L1442, `PANEL-SPECIFIC FRAME ART`)**:

| 속성 | 값 |
|---|---|
| width | `min(1800px, 95vw)` |
| height | `min(1080px, 90vh)` |
| max-width | `95vw` |
| max-height | `90vh` |
| padding | `28px 38px 22px` |
| box-sizing | `border-box` |

> 프레임 PNG 비율(~1.52:1 가로) 기준으로 16:9 모니터에서 약간 세로로 늘어나지만, 기존 `background-size:100% 100%` 스트레치 방식을 유지해 프레임 외곽이 패널 테두리와 정확히 맞음.

- **영향받은 인라인 스타일 정리**:
  - 설정 `#settings .pbox` 인라인: `width:85vw;max-width:1000px;max-height:90vh;padding:25px 35px` → `display:flex;flex-direction:column;overflow:hidden` (사이즈 CSS로 이관)
  - 인벤 `#invPanel .pbox` 인라인: `width:100vw;height:100vh;max-width:100vw;max-height:100vh;padding:12px 20px` 제거 → `display:flex;flex-direction:column;overflow-y:auto;box-sizing:border-box`
  - 대장간 `#forge .pbox` 인라인: `width:400px` 제거 → `display:flex;flex-direction:column;overflow:hidden`
  - 대장간 중복 규칙 `#forge .pbox{width:min(468px,calc(100vw - 40px))!important}`(L862) 중 width 라인 삭제, `overflow:hidden`만 남김
- **기존 인벤토리 풀스크린 정책 폐기**: 데이터/DOM(장착·창고·가방·상세 3컬럼)은 유지, 컨테이너만 공통 사이즈로 축소. 좁은 모니터 대비는 `@media (max-width:900px)` 기존 반응형 블록이 계속 유효.

#### 설정 프레임 선예도 보정 (2026-04-16)

- 현재 설정 프레임 자산 `panel-settings-chains.png`는 `768x512` 원본이라, 넓은 설정창에 업스케일되며 체인/상단 바 선예도가 약해질 수 있음
- 임시 보정은 CSS에서 수행:

| 항목 | 적용 |
|---|---|
| 프레임 레이어 분리 | `.window-frame-bg::before`에 프레임 이미지를 별도 레이어로 렌더 |
| 선예도 필터 | `contrast(1.08) saturate(1.05) brightness(0.92)` |
| 경계 강조 | inset highlight + ember tone box-shadow로 상단/측면/하단 프레임 존재감 강화 |
| 중앙 유지 | 중앙 dark overlay는 유지하되 체인/상단 바 가독성은 별도 하이라이트로 보강 |

> 근본 해결은 고해상도 재생성이다. 다음 설정 프레임 생성은 `docs/10ai에셋프롬프트모음/UI_프레임_배경_생성프롬프트.md`의 sharp 프롬프트 기준으로 다시 뽑는다.

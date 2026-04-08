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
  .inv-wrap { flex-direction: column; overflow-y: auto; }
  .inv-storage { width: 100%; min-width: 0; border-right: none; border-bottom: 1px solid var(--c-border); padding-right: 0; padding-bottom: 10px; max-height: 200px; }
  .inv-left { min-width: 0; }
  .inv-right { width: 100%; min-width: 0; }
  .inv-grid { grid-template-columns: repeat(auto-fill, minmax(38px, 1fr)); }
  
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

### Space 슬롯 (skSlot1) 쿨다운 표시
Space 슬롯(SKILL_SLOTS[4])에도 모든 스킬 쿨다운 오버레이+숫자 표시 추가됨.
- `_spCdMap`: 1~4번 슬롯과 동일한 쿨다운 변수 참조
- 스택형 스킬(maliceStorm/iceStorm/boneWall/hellRay)도 스택 숫자 표시
- 쿨다운 중: 어두운 오버레이 + 초 단위 카운트다운 + 이모지 반투명

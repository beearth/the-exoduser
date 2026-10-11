# EXODUSER 엔진 레이어 설계 — PoE2 제작 구조 학습 기반 (2026-10-12)

> **상태: 설계 문서 · 구현 미착수.** 이 문서는 구현·빌드·배포 승인이 아니다. 각 단계는 별도 작업 요청으로 착수한다.
>
> **목적**: Path of Exile 2(이하 PoE2)가 맵·VFX·보스를 "데이터로 조립"하는 방식을 배워서, EXODUSER: HELL LORD가 **우리만의 데이터 주도 엔진 레이어**를 만드는 기준 문서로 쓴다. 사용자 지시: "참고해서 엔진 만드는 데 써라". 학습 전용 — PoE2의 에셋·코드·데이터·이름은 저장소에 한 줄도 넣지 않는다.
>
> **입력 문서 (둘을 합친 것이 이 문서)**
> - (a) 제작 구조 실측: [`docs/5.1임펙트디자인/POE2_REFERENCE_STUDY.md`](../5.1임펙트디자인/POE2_REFERENCE_STUDY.md) §6 — 파일 348만 개 인덱스와 텍스트 정의 984개에서 센 수치
> - (b) 게임플레이/UX 비교 + 23작업: [`POE2_REFERENCE_ANALYSIS_DOT_20261012.md`](POE2_REFERENCE_ANALYSIS_DOT_20261012.md) (Codex)
>
> **코드 위치 표기**: `game.html`은 여러 세션이 매일 편집하므로 줄 번호는 2026-10-12 조회 시점 값이다(±수백 줄 이동 가능). 함수·변수 이름으로 다시 찾을 것.

---

## 0. 한 장 요약

**PoE2에서 배운 것 한 줄**: 캐릭터·이펙트·보스·맵 모두 "부품 목록 + 시간축 이벤트 + 이름으로 연결"하는 텍스트 데이터이고, 엔진은 그 데이터를 재생할 뿐이다.

**EXODUSER의 현재 한 줄**: 같은 일을 `game.html` 안의 스킬별·보스별 전용 함수와 프레임 카운터 상수로 하고 있다. 결과 품질은 좋아졌지만(기검참 실버 시트, 드루이드 장판 등) **새 스킬·보스·맵을 만들 때마다 코드를 새로 짜야 하고, 수치·타이밍이 코드에 흩어져 docs 동기화와 QA가 비싸다.**

**해야 할 일**: 엔진을 갈아엎지 않는다(Codex §5: 엔진 이사 금지). 기존 렌더러(Canvas2D + GPU 프록시 `X`)·60Hz 고정스텝·풀·공간 해시 위에 **얇은 데이터 레이어 5개**를 얹고, 기존 하드코딩을 한 번에 하나씩 데이터로 옮긴다.

| 순위 | 모듈 | 왜 먼저인가 | 첫 시범 |
|---|---|---|---|
| 0 | **공통 기반**: 곡선·타임라인 러너·정의 레지스트리·검증기·FX 랩 뷰어 + 성능 기준선(PERF-01) | 나머지 4개 모듈이 모두 같은 "시간축 이벤트 재생기"를 쓴다. 기준선이 없으면 이전 전후 비교 불가 | 단위 테스트 + 뷰어 |
| 1 | **VFX 정의(FX_DEF)** + **프레임 이벤트/앵커(SPRITE_META)** | 화면 품질 체감이 가장 크고, 기검참은 이미 시트·테스트·문서가 갖춰져 위험이 낮다 | 기검참 비행·명중·충전 |
| 2 | **보스 공격 정의(BOSS_DEF)** | PoE2 실측의 핵심(조준 고정→판정 0.31s, 연출 60~90ms 선행)을 데이터로 강제. Codex L01·COMBAT-01/02·PERF-04를 흡수 | CH1 다크드루이드 3패턴 |
| 3 | **방 조립 + 환경 프리셋(ROOM/GRAPH/ENV)** | 반복 플레이 다양성. 단, CH1-1은 98차까지 손으로 구운 LOCK 맵이라 가장 늦게·옆 지역에서 시작 | 환경 프리셋 → 비-LOCK 지역 방 3종 |
| 4 | **에셋 파이프라인 정식화** | AI 생성 시트를 위 형식(시트 메타·앵커·곡선)에 자동으로 맞춤. 1~3에서 쓰면서 필요한 도구를 굳힌다 | 시트 메타 생성기·점 검사 |

Codex의 23작업 대부분(LOOT·UI·BAL)은 엔진과 독립인 **게임플레이 정합 레인(G레인)**으로 병행한다. 엔진에 걸리는 것(COMBAT·PERF·MAP·L01·L02·L06)은 §3 표대로 해당 단계에 합친다.

---

## 1. PoE2에서 가져올 원리 7개 (근거 수치는 STUDY §6)

| # | 원리 | PoE2 실측 근거 | 우리 엔진에서의 규칙 |
|---|---|---|---|
| R1 | **정의 / 실행 / 자산 분리** | 이펙트 = .aoc 타임라인 + .pet 레이어 + .mat 재질 + 텍스처, 보스 = .ot/.otc/.act/.ao/.aoc/.amd 6종 | 정의는 JSON(데이터 파일), 실행은 공용 러너 1개, 자산은 시트 PNG/WebP. 스킬별 그리기 함수 신설 금지(예외는 문서화) |
| R2 | **시간축 이벤트가 접착제** | 이펙트 aoc 18,376개에 파티클 42,881·사운드 30,129·트레일 11,123·흔들림 2,765 이벤트 | 판정·이펙트·소리·히트스톱·흔들림을 같은 타임라인의 `{t, type}` 줄로 |
| R3 | **이름으로 연결** | 무기 이펙트는 "칼날" 본 그룹 하나에 붙임(부착 2,974건), 맵 조각은 가장자리 타입 이름 비교, 환경은 그룹 이름 | 앵커 7종(`blade, handR, handL, head, chest, feet, root`), 가장자리 타입 문자열, 프리셋 id |
| R4 | **기본 + 차분(override)** | 보스전 환경 = 키 8~13개짜리 부분 파일, 페이즈 = 자세(stance)별 덮어쓰기, 단계 강화 = 같은 구조 + 흔들림 12.5→20 | 모든 정의에 `inherit` + `overrides`. 페이즈·속성·강화는 복사 대신 차분 |
| R5 | **공용 부품 + 곡선 변주** | GPU 이미터 62%가 공용 도형 메시(템플릿 203), 셰이더 그래프 중앙 58노드·곡선 샘플 노드 184 | 공용 도형 텍스처 8장 + 곡선 프리셋으로 레이어 대부분을 만든다 |
| R6 | **레이어 타이밍 3단** | 시작지연 중앙 0.05s, 충격 섬광/링 0.2~0.35s → 불길 0.6~1.5s → 연기·데칼 3~10s, 알파 정점 = 수명의 16.7% | 충격 기본 스택 4층, 레이어 시작을 0~0.15s에 흩뿌림, 알파 프리셋 "빠르게 차고 길게 빠짐" |
| R7 | **예고 = 조준 고정, 연출 선행** | 추적 종료→판정 중앙 0.31s(714건), 첫 판정 중앙 0.82s(보스 1.08s), 연출이 판정보다 60~90ms 먼저 | 보스 공격 정의에 `track`·`lock`·`hits`를 필수 필드로, 검증기가 `lock→hit ≥ 0.2s`·`fx선행 ≤ 0.1s` 위반을 경고 |

---

## 2. 엔진 모듈

각 모듈은 같은 순서로 쓴다: **PoE2 원리 → EXODUSER 현재 → 우리 설계(스키마) → 런타임 구현 → 이전 경로 → 검증**. 스키마 필드 이름은 전부 자체 설계다.

### 2.0 공통 기반 (Phase 0)

**PoE2 원리**: 이펙트·보스·환경이 모두 "시간(초) 기준 이벤트 목록"이고, 곡선은 `키프레임 + 보간(Linear/Smooth/Flat)`(레거시 보간 집계 Linear 19,200 / Smooth 3,446 / Flat 675). 애니메이션은 30fps 기준으로 저작되지만 데이터는 초 단위.

**우리 설계 — 4개 부품**

| 부품 | 파일(제안) | 역할 |
|---|---|---|
| 곡선 | `exo-curve.js` | `[[t, v, interp?], …]` (t: 0~1 정규화, interp: `lin`·`smooth`·`step`) + 이름 프리셋. 로드 시 **64칸 LUT(Float32Array)로 굽기** → 핫패스는 배열 인덱스 1회 |
| 타임라인 러너 | `exo-timeline.js` | 정의의 `events:[{t,type,…}]`를 로드 시 **60Hz 틱으로 변환**(`tick = round(t×60)`) 후 정렬. 인스턴스는 `startTick`만 저장, 고정스텝 `update()`에서 `now-startTick`이 지난 이벤트를 발화. **렌더 주사율과 무관**(피격 플래시 25ms/100ms 사고의 재발 방지 — ANIMVFX §11) |
| 레지스트리 | `exo-registry.js` | `EXO.def('fx', id, obj)` / `EXO.get('fx', id)`. `inherit` 해석(얕은 병합 + `overrides` 경로 병합)을 **로드 시 1회** 수행, 런타임엔 평탄화된 객체만 |
| 검증기 | `tools/validate_defs.mjs` (Node) | 스키마 필드·타입, 참조 텍스처/사운드 존재, 앵커 이름, 보스 공격 타이밍 규칙(R7), 레이어 수 예산 검사. CI 대신 커밋 전 수동 실행 + 테스트에 포함 |

**정의 파일 형식**: 저작은 `data/<kind>/<id>.json`(사람이 편집·diff 보기 쉬움). 런타임 로드는 `tools/build_defs.mjs`가 묶은 **`exo_defs.js` 한 파일**(`EXO.load({...})` 호출) — `maps_data.js`와 같은 방식이라 file:// · NW.js · Vercel 모두 동기 로드, fetch 비동기·404 위험 없음. `data/`는 저장소 소스, `exo_defs.js`는 빌드 산출물(커밋 포함, DEMO/EA 동기화 대상).

**곡선 프리셋 (STUDY §6.3.6 수치에서 도출)**

| 이름 | 키 | 근거 |
|---|---|---|
| `flash` | `[[0,1],[0.2,0.225,"smooth"],[1,0,"smooth"]]` | 착지 섬광 재질 곡선 1→0.225(20%)→0 |
| `riseFall` | `[[0,0],[0.167,1,"smooth"],[1,0,"smooth"]]` | 알파 "올랐다 내림" 47%, 정점 중앙 16.7% |
| `fadeOut` | `[[0,1],[1,0]]` | 알파 "계속 감소" 43% |
| `grow` | `[[0,0.6],[1,1.4]]` | 크기 "증가" 54%, 키 2개가 최다(2,701) |
| `growFast` | `[[0,0.3],[0.3,1,"smooth"],[1,1.15]]` | 링·충격파용(우리 제안) |
| `const` | `[[0,1],[1,1]]` | — |

**FX 랩(`fx-lab.html`)**: 게임 밖 독립 페이지. `exo-*.js` + `exo_defs.js` + 실제 렌더 경로(가능하면 GPU 프록시 포함)를 로드해 정의 하나를 반복 재생, 타임라인 막대(이벤트 눈금), 속도 0.25×/1×, 배경 3종(CH1 바닥 캡처·검정·회색). Phase 4에서 앵커 찍기 탭 추가. **게임 상태·세이브와 완전 분리**.

**성능 기준선(PERF-01)**: 기존 `tools/qa_frame_probe.mjs`·`QA_PERFORMANCE_TEAM_MASTER.md` 절차로 첫 처치·밀집전·보스 진입 20초×5회, p50/p95/p99·50/100ms 초과 횟수. 이후 모든 Phase의 "이전 스텝"이 이 기준선 대비로 판정.

### 2.1 VFX 시스템 — `FX_DEF`

**PoE2 원리 (STUDY §6.3)**
- 이펙트 1개 = 타임라인(.aoc) + 레이어(이미터) 묶음. 레이어 수 평균 4.0(중앙 3), 대형 충격 6~12.
- 레이어 = 모양·블렌드·정렬(카메라 정면 59% / 바닥 평면 25%)·수명·개수·곡선(크기·색·알파·속도). 블렌드 명시분의 38%가 덧셈.
- 공용 도형(구·반구·링·평면·토러스 조각)에 곡선/재질만 바꿔 대량 변주(GPU 이미터 62%가 메시).
- 부착: 이펙트팩이 본 그룹(칼날·손잡이·상체·`grp_*` 와일드카드)에 레이어를 붙임, `limit`으로 개수 제한.
- 속성 변형 = 레이어 교체 + 속성 사운드 1겹, 단계 강화 = 같은 구조 + 흔들림 진폭 상승.

**EXODUSER 현재**

| 요소 | 현재 구현 (game.html, 2026-10-12 조회) | 데이터화 정도 |
|---|---|---|
| 범용 파티클 풀 | `POOL_SZ=1000`, `_partPool`, `poolPart(x,y,vx,vy,col,sz,life,tp,rot,grav,isSkill)`(L19104), 종류 `tp` 0사각/1원/2불꽃선/3링, 소프트 상한 `_VFX_SOFT_CAP` 150(모바일 60), 프레임당 생성 50, 렌더 상한 `_PR_CAP` 80 + 32px 셀 겹침 제한 `_partGrid`. `poolPart(` 호출 **320곳**, `addParts(` **263곳** | 없음 — 호출마다 인자 하드코딩 |
| 시트 VFX 레지스트리 | `_VFX_SHEETS` + `registerVFX(id,src,fw,fh,frames,cols,blend)`(L18894) **68건 등록**, `playVFXAng(id,x,y,scale,speed,ang,isSkill,alpha)`(L18899) 동시 20개, GL 인스턴싱 `_VFX_GL_MAX=256` 가산 전용 | **부분** — 시트 규격은 표, 타이밍·층은 호출부 |
| 개별 풀 | `HIT_VFX_MAX=15`, `_IO_VFX_MAX=8`, `_DET_VFX_MAX=8`, `_fxAnims/_spawnFxAnim`, 각자 `update*/render*` 쌍 | 없음 |
| 층 조합 표 | `_TVFX2_COMBOS`(L18351, 시트 겹치기 src/cols/rows/sc/delay/spd), `_V3_SHEETS`(L64061), 품질 `_GFX_PRESETS` | **부분** — 우리 FX_DEF의 씨앗 |
| 충격 헬퍼 | `_addBoom`(L8676), `_projHitFx`(L8656), `_addImpact`(L24598), `deathFX`(L24016) | 없음 |
| 기검참 | `_drawRadiantKiSlash`(L18778): `progress=1−life/ml`, `frame=min(8,⌊progress×9⌋)`, 192px(3타 252)×충전배율, `alpha=min(1,(1−progress)×2.5)`. 순서: 검은 층(source-over) → 잔상 2장(가산) → 글로우 1.08× → 본체. `_drawKiSlashFrame`(L18770)이 GPU 쿼드 버퍼에 직접 기록. 충전 `_drawKiSlashCharge`(L18806). 투사체 풀 `_CRES_MAX=16`/`spawnCrescent`/`renderCrescents`(L18837) | 없음 — 전용 함수 4개 |
| 블렌드 | `globalCompositeOperation='lighter'` **88곳**(전체 gCO 줄 218). GPU 프록시 `X`에서 이 setter는 무동작(L5934) → 실제 가산은 `_setBlend(true)`(L5753, 플러시 후 ONE/ONE) | 호출부마다 이중 지정 필요 — 누락 시 GPU에서 가산이 안 됨(구조적 버그 원천) |
| 흔들림 | `shake(n)`(L19224) 호출 **217곳** + `G.shake=k*OPT.shake/100` 직접 대입 다수, 감쇠 `G.shake*=.86**sp` | 없음. 2단(강타+여진) 개념 없음 |
| 히트스톱 | `G.hitStop` 프레임 수, 스킬별 표 `_HS`(L8526~), 대입 64곳, 모두 `×OPT.hitStop/100`. **기본 `OPT.hitStop:0`(L6171) → 기본 설정에서 히트스톱 꺼짐** | 부분(표) |

→ 요약: 생성 함수는 몇 개로 모여 있지만 **"어떤 층을 언제, 어떤 곡선으로"는 600곳 가까운 호출부에 흩어져 있다**. 같은 효과의 GPU/Canvas 이중 블렌드 지정도 호출부 책임이다.

**우리 설계 — 스키마**

```jsonc
// data/fx/kiSlash.json — 우리 형식 예시 (수치는 현행 KI_SLASH_RADIANT 문서 값을 옮긴 것)
{
  "id": "kiSlash.hit",
  "dur": 0.20,                       // 초. 12f@60Hz (현행 frameTime3 × 4프레임)
  "budget": { "pool": "combatFx", "max": 20, "drop": "oldest" },
  "params": { "size": 140, "ang": 0 },           // 호출 시 덮어쓰기: 3타 184×chargeScale
  "layers": [
    { "id": "ink",  "kind": "sheet", "tex": "ki_slash_hit_silver#shadow",
      "grid": [2,2], "frames": 4, "fps": 20, "blend": "normal",
      "start": 0.0, "life": 0.20, "scale": 1.14,
      "alpha": { "base": 0.85, "curve": [[0,1],[1,0.46]] } },
    { "id": "core", "kind": "sheet", "tex": "ki_slash_hit_silver",
      "grid": [2,2], "frames": 4, "fps": 20, "blend": "add",
      "start": 0.0, "life": 0.20, "scale": 1.0, "alpha": { "base": 1, "curve": "const" } }
  ],
  "events": [ { "t": 0, "type": "sfx", "id": "kiSlash_hit" } ]
}
```

```jsonc
// 범용 충격 스택 — 공용 도형으로 만드는 4층 기본형 (R6)
{
  "id": "impact.base",
  "dur": 3.0,
  "layers": [
    { "id": "flash", "kind": "shape", "shape": "disc",  "blend": "add",    "start": 0.00, "life": 0.25, "scale": { "base": 1, "curve": "grow" },     "alpha": "flash" },
    { "id": "ring",  "kind": "shape", "shape": "ring",  "blend": "add",    "start": 0.05, "life": 0.30, "scale": { "base": 1, "curve": "growFast" }, "alpha": "fadeOut" },
    { "id": "body",  "kind": "sheet", "tex": "@element.burst", "blend": "add", "start": 0.05, "life": 0.80, "alpha": "riseFall" },
    { "id": "scorch","kind": "shape", "shape": "decalSoft", "face": "ground", "blend": "normal", "start": 0.03, "life": 3.0, "alpha": { "base": 0.6, "curve": "fadeOut" } }
  ],
  "events": [
    { "t": 0.00, "type": "hitstop", "frames": 3 },
    { "t": 0.00, "type": "shake", "amp": 6, "dur": 0.12 },
    { "t": 0.12, "type": "shake", "amp": 2, "dur": 0.6, "damp": "lin" }
  ]
}
// 변형: { "id": "impact.poison", "inherit": "impact.base", "overrides": { "palette": "poison", "@element.burst": "poison_burst" } }
```

| 필드 | 의미 | 값 |
|---|---|---|
| `kind` | 레이어 종류 | `sheet`(플립북) · `shape`(공용 도형) · `particles`(작은 조각 N개) · `trail`(궤적) · `light`(가산 원광) · `decal`(바닥) · `text`(fillText 오프셋 외곽선만) |
| `blend` | 합성 | `add` · `normal` · `multiply` — **런타임이 Canvas2D `globalCompositeOperation`과 GPU 프록시 `_setBlend()`로 각각 번역**(프록시에서 `globalCompositeOperation` setter는 무동작) |
| `face` | 정렬 | `screen`(기본) · `ground`(Y 0.5 눌림 + 바닥 층에 그림) · `dir`(발사각 회전) |
| `anchor` | 부착점 | `world`(기본) · `owner.root` · `owner.blade` 등 — §2.2 앵커 이름. `follow:true`면 매 프레임 따라감 |
| `start / life` | 시작 지연 / 수명(초) | 검증기 경고: 레이어 3개 이상인데 `start`가 전부 0이면 "흩뿌림 없음" |
| `alpha / scale / color` | 곡선 | 프리셋 이름 또는 키 배열, `base` 배수 |
| `budget` | 풀·상한 | 풀 이름·최대 개수·초과 시 정책(`oldest`·`skip`·`merge`). **표시 예산이 게임 데이터를 지우지 않는다**(LOOT-01 원리 동일) |
| `inherit / overrides` | 차분 | 속성·단계·스킨 변형 |

**런타임 구현**
- `exo-fx.js`: `EXO.fx.play(id, x, y, opts)` → 고정 크기 인스턴스 풀(정의별 `budget.max`, 전체 상한)에서 슬롯 할당, **할당 없는 핫패스**(객체 재사용, 클로저 생성 금지).
- 이벤트(`hitstop/shake/sfx/spawnFx`)는 `update()`의 타임라인 러너에서 발화 → 기존 `shake()`·`G.hitStop`·사운드 함수를 호출(새 흔들림 시스템을 만들지 않음). 사용자 설정 배율 `OPT.shake/100`·`OPT.hitStop/100`을 기존과 똑같이 곱한다(기본 `OPT.hitStop:0`이므로 히트스톱 이벤트는 기본 설정에서 0프레임 — 손맛 설계 시 이 기본값 자체를 별도 결정 사항으로 올림, §6).
- 렌더: `draw()`의 기존 VFX 그리기 위치에서 `EXO.fx.render(X, layerGroup)` 호출. 레이어를 **블렌드별로 묶어** 블렌드 전환 횟수를 최소화(기검참 검은 층이 이미 쓰는 "활성 0개면 블렌드 변경 0회" 규칙을 일반화). 바닥(`face:ground`) 레이어는 엔티티 전에, 나머지는 엔티티 뒤에.
- 텍스처: 정의가 참조하는 모든 텍스처를 로드 시 기존 전투 텍스처 준비 큐(`_queueCombatTextureWarmup`)에 등록 → 첫 사용 업로드 스파이크 제거(PERF-02 자동화).
- 공용 도형 8장(우리 제작): `disc`·`ring`·`ringThin`·`halfRing`·`cone`·`beam`·`decalSoft`·`spark` — 256² 흑백 알파, 색은 런타임 틴트(GPU) / 사전 틴트 캐시(Canvas2D).

**이전 경로**
1. 기검참(Phase 1) → 2. 플레이어 공용 명중·폭발(`_addBoom` 계열) → 3. 보스 장판·텔레그래프(Phase 2와 함께) → 4. 드롭 빔(LOOT-03) → 5. 나머지 스킬. 각 단계 **기존 함수 보존 + 플래그 전환**, 픽셀 비교 통과 후 기존 함수 삭제는 별도 커밋.

**검증**: 정의별 fx-lab 캡처(0.25×) · 게임 실화면 A/B · 블렌드 전환 횟수/프레임 · p95 · 1x 크롭 점묘 검사 · `budget` 초과 시 오래된 것부터 제거 확인.

### 2.2 애니메이션·프레임 이벤트 — `SPRITE_META`

**PoE2 원리 (STUDY §6.4.1~6.4.3)**
- 애니메이션 목록(.amd)이 이름·loop/once·길이(ms)를 갖고, 게임플레이 이벤트(.ao: 판정 contact 9,190 / 발소리 4,083 / 이동 3,291 / 조준추적 1,081 …)와 연출 이벤트(.aoc)가 **같은 애니메이션 이름 아래 시각(초)으로** 붙는다.
- 본 그룹 20개의 **표준 이름**에 이펙트를 붙이므로 모델이 바뀌어도 이펙트 정의는 재사용.
- 행동→애니메이션 매핑(.act)이 별도: "공격1"이라는 추상 행동이 자세(stance)별로 다른 애니에 연결.

**EXODUSER 현재**

| 요소 | 현재 구현 | 비고 |
|---|---|---|
| 플레이어 | `SpriteAnimator`(L10146) `{img,fm,anim,f,t,spd,loop,done}`, 키 `anim_dir`, `spd`=틱/프레임(대기48·달리기12·기본8·대시4·체인3, L57544). 아틀라스 `atlas_player.json`, 캐릭터 8방향 `_load8Dir`(L10227), 상태→애니 `_P_ANIM_MAP`(L11652: `wWindup→atk1`, `wSwing→atk2`, `wRecover→atk3`) | 시간 기준은 이미 고정스텝 틱 — 좋은 출발점 |
| 공격 타이밍 | 준비 `P.st2=~~(10/wp().spd)`(L33239) → 휘두름 `st2=5`(L32516) → 회복 `~~(16/(spd×dex×(1+공속)))`(L32525). **판정 `hitArc()`는 휘두름 5틱 중 `st2`가 3을 지날 때**(L32518). 시트 프레임은 진행률에서 역산(`_warriorAttackFrame` L11632: 0~1 준비, 2~5 들기, 6~7 베기, 6=판정) | 판정 시각과 시트 프레임이 **두 군데서 따로** 정의 — 시트 교체 시 어긋날 위험 |
| 프레임 이벤트 | **범용 시스템 없음** | 신설 대상 |
| 앵커 | **없음**. 캐릭터별 하드코딩(예: 실버테일 등검 `_silvNeckLift=11`, 칼끝 길이 49 — `_drawSilvertailBackBlade` L11693). 피벗 메타는 맵 오브젝트(`pvx/pvy/anchorBottom`)뿐 | 신설 대상 |
| 일반 적 | 챕터별 8방향 아틀라스 `img/atlas_ch{N}_8dir_{dir}.png+.json`, 걷기 프레임 = 이동거리 기반 `~~(e._walkDist/128)%N`(L52661), GL 인스턴싱 `_queueEnemy8DirInstanced` | 공격 windup 표시(`e._atkWindup`)는 죽은 코드(ANIMVFX §6) |
| 드루이드 | `_loadDruidSheets`(L10535) 시트 10종(8dir_v3·walk·attack·idle·aoe·orb·beast·transform·dive·emerge), `_drawDruidBoss`(L10549): 공격/걷기 프레임 = **벽시계 시간** `(_nw/150)%4`(150ms/프레임), 변신·잠행·출현은 상태 진행률 `1−st2/max` | 벽시계 기준이라 히트스톱·슬로모·일시정지와 어긋날 수 있음 — 이전 시 틱 기준으로 |
| 보스 포즈 | `STAGE1_CODEX_BOSS_MOTION`(L10450) 찌그러짐 표, 스켈레탈 `_bPose`/`_bLerpPose`(보스_스켈레탈_애니메이션.md) | 부분 데이터 |

**우리 설계 — 스키마**

```jsonc
// data/sprites/druid_attack.meta.json — 시트 1장의 메타 (우리 형식)
{
  "sheet": "img/bosses/druid/attack.png",
  "grid": [4, 8], "cell": [256, 256],          // 열×행, 셀 px — 셀 크기는 예시(실제 시트에서 자동 검출)
  "layout": "rowPerDir",                       // 행 = 방향(8), 열 = 프레임
  "dirs": 8, "frames": 4, "fps": 10,
  "pivot": [0.5, 0.93],                        // 발밑 (셀 비율) — 중심 앵커 → 발밑 앵커 전환(ANIMVFX §6 백로그)
  "anchors": {                                  // 프레임별 [x,y] (셀 비율). 생략 프레임은 보간, dir 생략은 좌우 대칭 규칙
    "handR": { "d0": [[0.62,0.40],[0.66,0.35],[0.70,0.55],[0.64,0.52]] },
    "root":  { "*":  [[0.5,0.93]] }
  },
  "events": [                                   // 프레임 → 이벤트 (fps가 바뀌어도 초로 환산되어 유지)
    { "f": 0, "type": "sfx",  "id": "druid_windup" },
    { "f": 2, "type": "fx",   "id": "druid.slamDust", "anchor": "handR" },
    { "f": 2, "type": "mark", "name": "hit" }     // 판정은 직접 안 넣고 "표식"만 — 판정 시각은 BOSS_DEF가 소유
  ]
}
```

| 결정 | 이유 |
|---|---|
| 앵커 이름 7개 고정: `blade, handR, handL, head, chest, feet, root` | R3. 시트가 바뀌어도 FX_DEF는 이름만 참조 |
| 판정(`hit`)은 **표식(mark)**으로만 — 실제 판정 시각·도형은 스킬/보스 정의가 소유 | 판정은 보호·밸런스 영역. 시트 교체가 판정을 몰래 바꾸지 못하게 |
| 시간은 저장 시 프레임(f), 로드 시 초→60Hz 틱 | 시트 fps(10~16)와 물리 60Hz가 다름. PoE2도 30fps 저작·초 단위 데이터 |
| 8방향 앵커는 `d0`(오른쪽)과 몇 방향만 찍고 나머지는 대칭·보간 | 프레임당 7점 × 8방향을 전부 찍으면 AI 시트마다 수백 점 — 사람 작업량 제한 |

**런타임 구현**: `exo-anim.js` — `EXO.anim.frameAt(meta, tStart, now)`(고정스텝 틱 기준), `EXO.anim.anchor(meta, dir, frame, name)` → 월드 좌표. 기존 스프라이트 그리기 함수가 프레임 인덱스를 계산하는 자리에서 이 함수로 교체(그리기 자체는 기존 경로). 이벤트는 엔티티의 애니 시작 시 타임라인 러너에 등록.

**이전 경로**: Phase 1에서 플레이어 기본 공격 1종 + 기검참 시전 프레임, Phase 2에서 드루이드 `attack`/`walk`/`emerge` 시트. 시트 메타는 Phase 4 도구가 자동 생성(그리드·피벗), 앵커만 사람이 찍는다.

**검증**: 30/60/144/240Hz에서 이벤트 발화 틱 동일 · 앵커 오버레이 디버그(점·이름) 실화면 확인 · 피벗 전환 시 그림자·충돌 원과 발 위치 일치.

### 2.3 보스 조우 정의 — `BOSS_DEF`

**PoE2 원리 (STUDY §6.4)**
- 보스 1체 = 서버 타입(상속·스탯) + 클라 연출 + 행동→애니 매핑(자세별 덮어쓰기) + 애니별 게임플레이 이벤트(판정·조준추적·무적·충돌·소환) + 애니별 연출 이벤트 + 애니 길이표.
- 공격 = **조준추적 구간 → 고정 → 판정(들) → 회복**. 추적 종료→판정 중앙 0.31s(10% 0.03 / 90% 1.40), 보스 첫 판정 중앙 1.08s, 판정 후 회복 1.2~2.3s.
- 연출(진동·사운드·강한 트레일·파티클)이 판정보다 60~90ms 먼저.
- 페이즈 = 자세 전환(1막 보스: 분노 2.5s 애니 → 이동속도 175→386.4, 걷기→달리기). "막을 수 없음"은 공용 경고 1종을 몬스터 aoc 3,418개 중 100개가 공유.

**EXODUSER 현재 — 이미 절반은 데이터다**

| 요소 | 현재 구현 | 데이터화 정도 |
|---|---|---|
| 기술 표 | `BOSS_MOVES`(L9539) **59항목**: `{id, idx, tele, rec, canFeint, canDelay, range, phase, combo, tags, cd}` — 예고·회복 프레임과 사거리·쿨·콤보 후보가 **이미 표**. ※ `BOSS_BATTLE_SETTINGS.md`와 L9678 주석은 "49종" — 문서 동기화 필요(§6 미해결) | **높음** |
| 콤보·페이즈 | `BOSS_COMBOS`(L9600) `{seq, phase}`, `BOSS_PHASES`(L9670) 5단(HP 80/60/40/20%) `{spdM, teleM, cdM, comboC, feintC, delayC}` | **높음** — PoE2의 "자세 덮어쓰기"와 같은 역할 |
| 스테이지별 허용 | `_BOSS_MOVESET[si]`(L9679~), si0 = si3 드루이드 세트 복사, `cageTrap` 제거 | 높음 |
| 선택 AI | `_bossAI(e,sp,d)`(L37520) → `_bossScore`(L36799) 가중 랜덤 → `_bossStartPattern(e,mv,d,phase,extraDelay)`(L36851)이 `tele×teleM`을 `e.st2`에, 상태 문자열을 `e.s`(예 `'bossChargeWind'`)에 | 중간 |
| 실행 | `updateE`(L37727~40541)의 `switch(e.s)`(L39599)에 상태별 case(`'bossChargeWind'` L39798 등) — **판정 시점·도형·피해·소환은 case 코드 안** | **낮음** |
| 예고 그리기 | `draw()` 안 인라인(`bossBurstWind` L51985, `bossFanWind` L52079, `bossChargeWind` L52117), `_drawEnemyShotWarnings`(L19395), `_drawDruidFinaleTell`(L16788), `_drawDruidGroundRing`(L10523) | **낮음** — 예고 도형과 판정 도형이 다른 코드 |
| 드루이드 전용 | 데모 피날레 덮어쓰기(L36855~: 최소 tele 36/48, `_druidRest` 96/48), `_isDruidFinale(e)`(L16635), 3막·부활·재도전(`DARK_DRUID_FINALE_PACING_v04.md`) | 조건 분기 |

**우리 설계 — `BOSS_MOVES`를 버리지 않고 확장한다**

```jsonc
// data/boss/darkDruid.json — 우리 형식 예시. 숫자는 "이전 스텝"에서 현행값을 그대로 옮긴 뒤 바꾼다.
{
  "id": "darkDruid",
  "stages": [0, 3],
  "sprite": { "idle": "druid_8dir_v3", "move": "druid_walk", "attack": "druid_attack", "emerge": "druid_emerge" },
  "stances": {
    "base":  { "moveSpd": 1.0 },
    "act2":  { "inherit": "base", "moveSpd": 1.15, "overrides": { "moves.groundFissure.hits.0.r": 1.1 } }
  },
  "phases": "@BOSS_PHASES",                 // 기존 5단 표 참조 (복사 금지)
  "moves": {
    "groundFissure": {
      "base": "@BOSS_MOVES.groundFissure",  // tele/rec/range/cd/combo/tags를 기존 표에서 상속
      "anim": "attack",
      "track": [0, 0.30],                   // 초. 플레이어 방향 추적 구간 (현행 코드에서 측정해 기입)
      "lock": 0.30,                         // 방향 고정 = 회피 창 시작
      "tele": { "shape": "@hit0", "t": [0.0, 0.42], "style": "groundRing.poison", "fill": "grow" },
      "hits": [ { "t": 0.42, "shape": { "kind": "line", "len": 400, "w": 70 }, "dmg": "@move", "parry": "@resolver" } ],
      "fx":   [ { "t": 0.35, "id": "druid.fissure.crack", "at": "hit0" } ],
      "sfx":  [ { "t": 0.00, "id": "druid_warn" }, { "t": 0.35, "id": "druid_crack" } ],
      "shake":[ { "t": 0.40, "amp": 6, "dur": 0.12 }, { "t": 0.52, "amp": 2, "dur": 0.6, "damp": "lin" } ],
      "recover": 0.58,
      "commit": "lock"                      // lock 이후는 '확정 공격' — 예산 초과에도 갱신 보장 (PERF-04)
    }
  },
  "env": { "enter": "ch1.rotForest#boss", "defeat": "ch1.rotForest#bossDefeat" }   // §2.4 환경 차분
}
```

| 필드 | 규칙 |
|---|---|
| `base: "@BOSS_MOVES.x"` | 기존 표 항목을 상속 — 표와 정의가 **이중 진실 공급원이 되지 않게** 표의 키는 덮어쓰기만 허용 |
| `tele.shape: "@hit0"` | 예고 도형은 **판정 도형을 참조**(COMBAT-02의 "예고 영역 밖 피격" 구조적 차단) |
| `parry: "@resolver"` | 위협 신호 resolver(COMBAT-01)가 실제 판정 헬퍼로 E/Q/회피 안내를 계산. 정의에 패링 가능 여부를 **새로 적지 않는다**(보호 시스템) |
| `commit` | `lock`(기본)·`tele`·`hit` — 이 시점 이후 공격은 취소·누락 불가 |
| 검증기 경고 | `lock→첫 hit < 0.20s`, `fx/sfx 선행 > 0.10s 또는 < 0`, `recover < 0.4s`(보상 창 부족), 예고 없는 판정, 같은 시각 3개 이상 위협 중첩 |

**현행 → PoE2 실측 대조 (60Hz 환산, 드루이드 시범 3종)** — 이전 스텝에서는 값 불변, 아래는 개선 스텝 검토용

| 기술 | 현행 `tele` / `rec` (BOSS_MOVES) | 초 | PoE2 참고 | 검토 포인트 |
|---|---|---|---|---|
| `slam` | 35f / 40f | 0.58 / 0.67s | 보스 첫 판정 중앙 1.08s, 회복 1.2s(1막 땅 찍기) | 예고가 PoE2 대비 짧음 — 단, 핵슬래시 템포·다수 적이 우리 정체성. **고정(lock) 구간을 명시**하는 것이 수치 연장보다 우선 |
| `groundFissure` | 25f / 35f | 0.42 / 0.58s | 추적 종료→판정 0.31s | 장판형은 예고 도형이 판정 도형과 같으면 0.42s도 읽힘 |
| `charge` | 40f / 60f | 0.67 / 1.00s | 돌진 시작/루프/끝 1.0/0.53/1.0s | 회복 1.0s는 PoE2와 비슷 — 재공격 창으로 적절 |
| 페이즈 배율 | `teleM` 등 5단 | — | 자세별 덮어쓰기 | 그대로 `phases`로 참조 |
| 데모 피날레 | 최소 tele 36/48f, `_druidRest` 96/48f | 0.6~0.8s / 1.6s | — | 피날레 계약은 `stances`/조건 정의로 옮기되 값 불변 |

**런타임 구현**
- `exo-boss.js`: `_bossStartPattern`이 상태 문자열을 세팅하는 자리에서 정의가 있으면 `EXO.boss.start(e, moveId)` → 공격 인스턴스(시작 틱·고정 방향·도형) 생성, 타임라인 러너에 `track/lock/hits/fx/sfx/shake` 등록. 정의가 없는 기술은 **기존 `switch(e.s)` 경로 그대로**(점진 이전).
- 판정: `hits[]` 발화 시 기존 피해 함수(피해·속성·중독 규칙 그대로)를 호출. 도형 판정은 공용 `shapeHit(shape, x, y, ang, target)` 하나.
- 예고 그리기: `tele` 정의를 FX 레이어(`face:ground`)로 렌더 — draw() 인라인 예고는 해당 기술 이전 시 제거.
- 디버그: `?bossdbg` 오버레이 — 현재 공격의 타임라인 막대(track/lock/hit/recover 색 구간)와 판정 도형 외곽선.
- **일반 적에게 공격 제한을 거는 코드 없음**(§5.2).

**이전 경로**: 드루이드 3종 → 드루이드 나머지 20종 → CH1 다른 보스(si1·si2) → 장별. 각 기술 이전 시 "현행 틱 재현" 자동 비교(같은 시드에서 예고 시작·판정·회복 틱 0차).

**검증**: 자동 재생 틱 비교 · `tools/verify_druid_finale_pacing.py` 회귀 · 패링 분류 대조표(COMBAT-01) · 실플레이 회피/패링/재공격 관찰 · 30/60/120 렌더 FPS 동일 결과.

### 2.4 맵 방 조립 + 환경 프리셋 — `ROOM / GRAPH / ENV_PRESET`

**PoE2 원리 (STUDY §6.2)**
- 지역 마스터 1장이 타일셋·채움·재질·방 목록·소품·동물·환경을 연결. 레이아웃은 **사람이 그린 뼈대 그래프 5~12장 중 하나**(노드=방 자리, 간선=가장자리 타입) + 빈 노드·빈 공간을 규칙/가중치로 채움.
- 조각 네 변의 가장자리 타입(= 왼쪽·오른쪽 바닥 타입 이름 쌍)이 같아야만 붙음. 전이는 "가상 가장자리" 하나.
- 실내: 방 단위 9타일, 2칸 방 17·3칸 25(겹침 1타일). 표준 방은 연결 수(막다른/직선/코너/T/십자)로 분류, 허용 회전·반전 2~4종.
- 손으로 만든 방(보스·입구·이벤트)은 고정, 보스 아레나도 변형 4종. 소품 군락도 "타일 0개짜리 방"으로 재사용.
- 환경 = 그룹 10~12개 JSON, 보스전·처치 후는 키 8~13개짜리 차분.

**EXODUSER 현재**

| 요소 | 현재 구현 | 비고 |
|---|---|---|
| 레이아웃 데이터 | `maps_data.js` `FIXED_MAPS[si]={mw,mh,rooms:[{id,type,cx,cy,shape,rx,ry,spawns,…}],corridors:[{from,to,width,style,waypoints}],features}` → `genFromTemplate`(폴백 `genGauntlet`) → `G.map` 타일(T=40px, 1=벽) | **이미 방·통로 그래프 형태** — PoE2 그래프와 개념 동일. 단 지역당 1장 고정(랜덤 뼈대 선택 없음) |
| 아트 | CH1-1: 8192² 마스터를 **1024px × 64청크**로 구움(`_CH1_START_OUTER.chunks['x,y']` → `assets/map/ch1/production_finish/chunk_x_y.png`, L11244), `buildMapCache`(L26132), 대형 맵 스트리밍 `_streamChunks`·`_STREAM_MAX_CHUNKS` 64~144 | 98차까지 손으로 다듬은 **LOCK 품질** — 재조립 대상 아님 |
| 전경·깊이 | `_dsDrawFrontPass()`(L18132) 발 Y 정렬 + 플레이어 겹침 페이드, `ch1-border-foreground.js`(경계 나무 띠 170px, 최대 12 그리기) | 위험 예고 보호는 미보장(MAP-01) |
| 환경 | 장(hell) 단위 상수 표 다수: `HELL_THEMES`(L16264), `_MTHEME`(L25659), `_BOSS_ATHEME`(L25669), `HELL_PALETTES`(L22312), `_HELL_AMBIENT`(L4471), `_ENV_LIGHT`(L11617), `_FOG_COLORS`(L8711), `_FOG_BOT_COLS/_FOG_TOP_COLS`, 후처리 `PP_TONE`(L50622)·`PP_A_GRADE/LIFT/VIG`·`ATMO_CH`(L50499)·`_ATM_A` | **값은 표지만 10곳 이상에 흩어짐**, 보스전 차분은 `_BOSS_ATHEME` 일부만 |
| 문법 문서 | `MAP_GRAMMAR_VARIANTS.md` 위상 8종(선형·분기·허브·관문척추·위성아레나·미로포켓·동심탑·위험지대) | PoE2 "뼈대 그래프"와 같은 층 — 이 8종이 그래프 템플릿 후보 |

**우리 설계 (1) — 환경 프리셋 (먼저, 위험 낮음)**

```jsonc
// data/env/ch1.rotForest.json — 흩어진 표 값을 "그대로" 모은 것 (이전 스텝)
{
  "id": "ch1.rotForest",
  "palette": "@HELL_PALETTES[0]",
  "ambient": { "color": "#…", "alpha": 0.0 },            // _HELL_AMBIENT
  "light":   { "dir": [0.0, -1.0], "color": "#…" },       // _ENV_LIGHT
  "fog":     { "color": "#…", "top": "#…", "bottom": "#…" },
  "post":    { "tone": "…", "grade": 0.0, "lift": 0.0, "vignette": 0.0 },   // PP_TONE, PP_A_*
  "atmo":    { "particles": "spores", "godray": "#…", "alpha": 0.0 },        // ATMO_CH, _ATM_A
  "audio":   { "bgm": "ch1", "amb": "rot_forest" },
  "variants": {
    "boss":       { "audio": { "bgm": "boss" }, "fog": { "color": "#…" } },   // 차분만 (PoE2 보스 env 8~13키 원리)
    "bossDefeat": { "audio": { "bgm": "victory" } },
    "finaleAct3": { "inherit": "boss", "audio": { "bgm": "finalboss" } }
  }
}
```
런타임 `exo-env.js`: `EXO.env.apply(id, variant)` → 기존 상수 표 변수에 값을 **써 넣는** 어댑터(읽는 쪽 코드 무변경). 전환은 0.5~1.0s 보간(색·알파만). 보스 진입 `_enterBossArena`·처치·피날레 막 전환에서 variant 호출.

**우리 설계 (2) — 방 조립 (비-LOCK 지역 시범)**

```jsonc
// data/rooms/ch1/rot_clearing_a.json — 방 1개 (우리 형식)
{
  "id": "ch1.rot.clearingA",
  "size": [26, 26],                        // 타일(T=40px) → 1040px. 청크 1024px 정렬 위해 25+겹침1 규칙
  "overlap": 1,                            // 이음매 1타일 겹침 (PoE2 실내 9×2−1=17 원리)
  "edges": { "n": "rotPath", "s": "rotPath", "e": "skinWall", "w": "skinWall" },   // 가장자리 타입 = 문자열
  "transforms": ["I", "FX"],               // 허용 반전/회전
  "art": { "base": "assets/map/rooms/ch1/clearingA.webp", "fg": "assets/map/rooms/ch1/clearingA_fg.webp" },
  "collision": { "rle": "…" },             // 기존 tileRLE 형식 재사용
  "tags": [ { "type": "spawn", "x": 13, "y": 10, "grade": 1 }, { "type": "checkpoint", "x": 13, "y": 22 } ],
  "props": "@cluster.rotRoots.small"       // 소품 군락 = 타일 없는 방 (재사용)
}
```
```jsonc
// data/graphs/ch1_region2.json — 뼈대 그래프 2장 중 하나를 시드로 선택
{
  "id": "ch1.region2.g1", "archetype": "BRANCHING_FORK",       // MAP_GRAMMAR_VARIANTS 위상
  "grid": [4, 5],
  "nodes": [ { "id": "start", "room": "ch1.rot.entrance", "at": [1,4], "fixed": true },
             { "id": "boss",  "room": "ch1.rot.arena#v1|v2", "at": [1,0], "fixed": true },
             { "id": "n1",    "room": "(any:rotPath)", "at": [1,3] } ],
  "edges": [ ["start","n1","rotPath"], ["n1","boss","rotPath"] ],
  "fill":  { "pool": "ch1.rot.fill", "weights": { "clearingA": 30, "rootsB": 20, "empty": 50 } }
}
```
런타임: `genFromTemplate`의 입력(`FIXED_MAPS` 형식)을 **조립 결과로 생성**하는 전처리 `EXO.map.assemble(graphId, seed)` → 기존 파이프라인(`genFromTemplate`→`buildMapCache`→청크 스트리밍) 그대로. 방 아트는 방 크기를 청크(1024px) 배수에 정렬해 청크 1장 = 방 일부로 구움(`tools/room_bake.mjs`). 시작 6시·출구 12시·상단 통로 보장은 그래프 검증기 규칙.

**층 순서 계약 (MAP-01/02 입력)**: 바닥 → 바닥 FX(`face:ground`, 예고 포함) → 엔티티(발 Y 정렬) → 공중 FX → 전경(페이드) → **근접 위험 예고 실루엣(전경 위, MAP-02 실패 재현 시만)** → HUD.

**검증**: 환경 프리셋 ON/OFF 화면 동일 · 보스 진입/처치/재도전 전환 · 조립 맵 10시드 보행 연결성(시작→출구 경로 100%) · 이음매 보행 끊김 0 · VRAM 피크 기준선 이하 · `MAP PRODUCTION REPORT` + VISUAL VERDICT.

### 2.5 에셋 파이프라인 — AI 시트 → 우리 형식

**PoE2 원리**: 텍스처·메시는 엔진 형식으로, 정의는 이름으로 참조. 몬스터 텍스처를 다른 계열과 **공유**(1막 보스 폴더 텍스처 0개, 재질 4개 공유)하고, 공용 도형 메시 203 템플릿을 재질로 변주. 몬스터 메시는 별도 LOD를 거의 안 둠(.smd 2,051 중 lod 3).

**EXODUSER 현재**: 아틀라스 JSON 여러 형식(`atlas_player.json` `{anim_dir:[{x,y,w,h}]}`, `atlas_bosses.json`, `monster_asset_map.json`, 챕터 8방향 `img/atlas_ch1_8dir*.json`), VFX는 `registerVFX` 인자로 규격 전달 — **통일 메타 형식 없음**. `tools/`에 시트별 포장 스크립트 다수(`build_boss_atlas_si0.cjs`, `build_monster_atlas.cjs`, `pack-warrior-bat-swing.cjs`, `pack-silvertail-*`, `process-boss-cage-trap-sheet.mjs`, `generate_slam_vfx.mjs`, `repair_ch1_empty_atlas_cells.py` 등). 생성은 MagicLight(GPT Image 2.5 sunburst / Seedream 5.0 Pro) → Higgsfield 폴백, PixelLab은 기존 에셋만.

**우리 설계 — 4단 파이프라인**

| 단 | 도구(제안) | 입력 → 출력 | 자동 검사 |
|---|---|---|---|
| ① 생성 | MagicLight Toolbox(기존 절차, `MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md`·`KI_SLASH_RADIANT_PROMPTS_20260915.md`) | 프롬프트+레퍼런스 → 원본 PNG(2048²) | — (사람: DESIGN LOCK 대조) |
| ② 정규화 | `tools/sheet_meta.mjs` | 원본 → 리사이즈(LANCZOS)·그리드 검출·빈 셀·셀 넘침 검사 → `<name>.png` + `<name>.meta.json`(§2.2 형식, 피벗 = 알파 bbox 하단 중앙 자동) | 셀 경계 밝기 넘침, **점·디더링 검출(1x 고주파 점 밀도)**(CLAUDE.md 규칙 8), 가산용 시트는 배경 순흑 검사, 무채색 요구 시 채도 검사 |
| ③ 앵커·이벤트 | fx-lab 앵커 탭 | 메타 → 사람이 `d0` 몇 프레임만 클릭 → 대칭·보간 | 앵커 누락·범위 밖 |
| ④ 등록 | `tools/build_defs.mjs` | 메타·FX_DEF → `exo_defs.js` + **전투 텍스처 준비 큐 목록 자동 생성**(PERF-02) | 참조 무결성, 총 텍스처 MP 예산(기존 프리워밍 96항목·64MP 한도) |

공용 도형 8장(§2.1)과 곡선 LUT는 직접 제작(생성 AI 불필요). 모든 에셋은 `ART_TEAM_MASTER.md` 현황표에 기록.

**검증**: 새 시트 1장이 코드 0줄로 게임에 나타남 · 첫 사용 업로드 스파이크 0 · 1x 크롭 점 0.

---

## 3. Codex 23작업 병합 (ID 유지, 중복 제거)

Codex 문서의 23작업은 **ID를 그대로 쓴다**(새 ID 발급 없음). "레인"은 G=게임플레이 정합 레인(엔진과 독립 병행), E=엔진 단계에 흡수. 엔진 단계 번호는 §4.

| ID | Codex 우선 | 레인 / 모듈 | 단계 | 선행(의존) | 병합 메모 |
|---|---|---|---|---|---|
| LOOT-01 | P01 | G | 1차 묶음 | 없음 | 엔진 무관. 단, 보존 정책의 "표시 예산 ≠ 데이터 예산" 원리는 FX 풀에도 똑같이 적용(§2.1 예산 규칙) |
| LOOT-02 | P01 | G | 1차 묶음 | LOOT-01 | 엔진 무관 |
| LOOT-03 | P01 | G → E(§2.1) | 1차 묶음, 신호 연출은 Phase 1 이후 FX_DEF로 이전 | LOOT-01/02 | 중요 드롭 빔·짧은 음은 처음엔 기존 `playItemDropSfx`·빔 재사용. Phase 1 뒤 `fx: "drop.tierN"` 정의로 옮김 |
| COMBAT-01 | P02 | E — §2.3 위협 신호 resolver | **Phase 2 선행**(G레인에서 먼저 해도 됨) | PERF-01 기준캡처 권장 | 보스 공격 정의의 `parry` 필드가 이 resolver를 호출. 패링 판정 자체(보호 시스템)는 읽기만 |
| COMBAT-02 | P02 | E — §2.1 텔레그래프 레이어 + §2.3 | Phase 2 | COMBAT-01 | 예고 경계 = `tele.shape`와 `hits[].shape`를 **같은 도형 데이터**에서 그림 → 불일치가 구조적으로 불가능. 문구 캐시는 G레인 |
| UI-01 | P03 | G | 1차 묶음 | 없음 | 엔진 무관 |
| UI-02 | P03 | G | 1차 묶음 | UI-01 | 엔진 무관 |
| UI-03 | P03 | G | 1차 묶음 | UI-01 | 키캡 resolver는 COMBAT-01의 키 표시와 **같은 함수** 공유 |
| UI-04 | P03 | G | 1차 묶음 | (BAL-01 분리) | 엔진 무관 |
| UI-05 | P03 | G | 1차 묶음 | 없음 | 엔진 무관 |
| MAP-01 | P04 | E — §2.4 렌더 층 규칙 QA | Phase 3 착수 조건(먼저 해도 됨) | COMBAT-01 권장 | 결과가 §2.4 "층 순서 계약"(위험 예고·탄 > 전경 페이드 판정)의 입력 |
| MAP-02 | P04 | E — §2.4 | Phase 3 | MAP-01 실패 재현 시만 | 전경 페이드 판정에 "근처 위험 도형" 포함 — 도형 데이터는 §2.3 `tele`를 재사용 |
| PERF-01 | P05 | E — §2.0 공통 기반 | **Phase 0** | QA 환경 | 엔진 모든 단계의 전후 비교 기준선. `tools/qa_frame_probe.mjs` 확장 |
| PERF-02 | P05 | E — §2.5 에셋 파이프라인(준비 큐) | Phase 4 (실측 재현 시 앞당김) | PERF-01 | FX_DEF가 참조 텍스처 목록을 알고 있으므로 "정의 등록 = 준비 큐 등록"으로 자동화 |
| PERF-03 | P05 | G | PERF-01 뒤 | PERF-01 | 엔진 무관(HUD DOM) |
| PERF-04 | P05 | E — §2.3 | Phase 2 | PERF-01 재현 | 보스 공격 정의의 "확정된 공격(lock 이후)"은 예산 초과에도 갱신 보장 — 정의에 상태가 명시되므로 보장 대상 식별이 쉬워짐. **일반 적 어택 티켓·적 수 감소 없음** |
| L01 | 나중 | E — §2.3 | **Phase 2 본체** | COMBAT-01/02 | "한 보스 공격 문법 정리" = Phase 2 시범 그 자체. 별도 작업으로 중복 진행하지 않음 |
| L02 | 나중 | E — §2.4 방 태그 | Phase 3 | MAP-01, 맵 SSOT | 방 태그(`entrance/exit/checkpoint/bossSpawn`)와 목표 상태를 한 상태에서 안내 |
| L03 | 나중 | G | Phase 2 이후 | COMBAT-01, UI-01/02/05 | 엔진 무관 |
| L04 | 나중 | G | 나중 | UI-04 | 엔진 무관 |
| L05 | 나중 | G + E(§2.1/§2.2) | Phase 5 | UI-03, L04 | 행동 변형의 연출은 FX_DEF `inherit`+`overrides`로, 발동은 타임라인 이벤트로 — `triggerDepth`·쿨 가드는 러너에 내장 |
| L06 | 나중 | E — §2.4/§2.5 | Phase 3~4 | PERF-01/02/03 | 방 단위 로딩이 되면 청크 수명 = 방 수명으로 단순화 |
| BAL-01 | 나중 | G | 아무 때나(감사) | 없음 | 엔진 무관 |

**집계**: G레인 11개(LOOT-01·02, UI-01~05, PERF-03, L03, L04, BAL-01) / 엔진 흡수 10개(COMBAT-01·02, MAP-01·02, PERF-01·02·04, L01·L02·L06) / 걸침 2개(LOOT-03, L05). 합 23.

**의존 그래프 요약**

```
PERF-01 ─┬─> (Phase 0 기준선) ─> Phase 1 ─> Phase 2 ─> Phase 3 ─> Phase 4
         ├─> PERF-02 (Phase 4)          ^          ^
         ├─> PERF-03 (G)                |          |
         └─> PERF-04 ───────────────────┤          |
COMBAT-01 ─> COMBAT-02 ─> L01 ══════════╛ (Phase 2 본체)
COMBAT-01 ─> MAP-01 ─> MAP-02 ──────────────────────┤ (Phase 3)
                    └─> L02 ────────────────────────╛
LOOT-01 ─> LOOT-02 ─> LOOT-03 (G, 연출은 Phase 1 뒤 FX_DEF)
UI-01 ─> UI-02 / UI-03 ;  UI-04 ;  UI-05 ;  BAL-01 (G, 독립)
```

---

## 4. 단계 로드맵

일수는 1인·새 원화 없이의 대략 추정(약속 아님). 각 Phase는 **"이전(값 불변)" 스텝과 "개선(값 변경)" 스텝을 분리**한다 — 이전 스텝이 통과해야 개선 스텝을 시작한다.

| Phase | 내용 | 산출물 | 수용 기준 | 추정 |
|---|---|---|---|---|
| **0 도구** | 공통 기반(§2.0) + 성능 기준선 | `exo-curve.js`·`exo-timeline.js`·`exo-registry.js`, `tools/validate_defs.mjs`, `fx-lab.html`(정의 미리보기), Node 단위 테스트, PERF-01 기준 장면 캡처(첫 처치/밀집전/보스 진입 20초×5회) | ① 곡선 평가·러너 테스트 PASS(30/60/144/240Hz 렌더에서 이벤트 발생 틱 동일) ② 검증기가 샘플 정의 오류 5종(없는 텍스처·음수 수명·lock>hit·fx 선행 과다·미등록 앵커) 검출 ③ `game.html` 동작 변화 0(로더만 추가, 정의 0개) ④ DEMO/EA 동기화·`build-nwjs.mjs` 목록 갱신 ⑤ p50/p95/p99 기준선 문서화 | 3~5일 |
| **1 VFX·프레임 이벤트 시범 — 기검참** | `kiSlash.flight / kiSlash.hit / kiSlash.chargeFlash / kiSlash.chargeFull` FX_DEF 4종 + 전사 기본 공격 1종에 SPRITE_META 이벤트(`hit` 프레임 → 히트스톱·흔들림·사운드) | `data/fx/kiSlash.json`, `data/sprites/<player>.meta.json`, 기존 전용 함수는 **폴백으로 보존**(플래그 `EXO_FX.kiSlash`) | 이전 스텝: ① 플래그 ON/OFF 동일 장면 픽셀 비교 — 프레임별 차이 ≤ 2/255 평균(블렌드 순서 동일) ② `test/kiSlashRadiantRender.test.js` PASS(GPU 블렌드 순서 `[true,false,…]` 계약 유지) ③ 피해·속도·반경·홀드 단계·히트스톱 3/6f(×`OPT.hitStop/100`)·shake 8 불변 ④ p95 프레임 시간 기준선 대비 +0.3ms 이하. 개선 스텝: 레이어 시작 흩뿌림(0~0.15s)·알파 프리셋 적용 후 실화면 1x 판정 PASS | 4~6일 |
| **2 보스 정의 시범 — CH1 다크드루이드** | BOSS_DEF 골격(자세/페이즈/공격) + 공격 3종 이전(`slam`·`groundFissure`·`charge` 권장 — 근접 1·장판 1·이동 1) + 위협 신호 resolver(COMBAT-01) + 예고·판정 같은 도형(COMBAT-02) + 확정 공격 갱신 보장(PERF-04) | `data/boss/darkDruid.json`, `exo-boss.js`, 패턴 타임라인 디버그 오버레이(fx-lab/`?bossdbg`) | 이전 스텝: ① 3패턴의 예고 시작·판정·회복 **틱이 현행과 동일**(자동 재생 비교, 0틱 차) ② 피해·범위·안전 틈 불변 ③ 데모 피날레 v0.4 계약(`DARK_DRUID_FINALE_PACING_v04.md`) 회귀 PASS(`tools/verify_druid_finale_pacing.py`) ④ 패링 분류 불변. 개선 스텝(L01): 검증기 경고(lock→hit<0.2s, 연출 선행>0.1s) 해소안을 **수치표로 사용자 승인 후** 적용, 실플레이 회피·재공격 가능 확인 | 6~10일 |
| **3 환경·방 조립** | (3a) ENV_PRESET: CH1 기존 대기·조명·안개·음악 값을 **그대로** 데이터화 + 보스전/처치 후 차분 (3b) MAP-01 QA (3c) 비-LOCK 지역(또는 `mapqa` 시험 스테이지)에서 방 3종 × 그래프 2장 조립 프로토타입, 방 태그로 스폰·체크포인트·출구(L02) | `data/env/*.json`, `exo-env.js`, `data/rooms/…`, `tools/room_bake.mjs`(방 이미지 → 청크 정렬) | ① 환경 프리셋 ON/OFF 화면 동일 ② 보스 진입·처치 시 차분 전환 정상, 음악 계약 불변 ③ 조립 맵: 시작 6시·출구 12시·상단 통로 보장(AGENTS §6), 이음매 1타일 겹침에서 보행 끊김 0, 청크 스트리밍 VRAM 피크 기준선 이하 ④ `MAP PRODUCTION REPORT` + VISUAL VERDICT | 8~15일 |
| **4 에셋 파이프라인 정식화** | 시트 메타 생성기·앵커 찍기 도구·점/디더링 검사·준비 큐 자동 등록(PERF-02) | `tools/sheet_meta.mjs`, fx-lab 앵커 편집 탭, `docs/5.0애니메이션파이프라인/` 갱신 | 신규 AI 시트 1장이 "생성 → 메타 → 앵커 → FX_DEF 참조 → 준비 큐"까지 수작업 코드 0줄로 연결. 첫 사용 업로드 스파이크 0(기준선 대비) | 4~6일 |
| **5 확대** | 나머지 스킬 VFX·보스·챕터 이전, L05 행동 변형, L06 수명 | 정의 파일 증가 | 이전한 항목마다 Phase 1/2와 같은 이전·개선 2스텝 기준 | 지속 |

**단계 착수 게이트**: Phase N+1은 Phase N의 이전 스텝 수용 기준 통과 + docs 동기화 커밋 후. G레인(LOOT/UI/BAL/PERF-03)은 언제든 병행하되 `game.html` 동시 편집은 피한다(한 번에 한 작업).

---

## 5. 규칙

### 5.1 독창성 (절대)

| 허용 | 금지 |
|---|---|
| PoE2 파일의 **구조·수치 통계·타이밍 패턴**을 우리 말로 요약해 설계 근거로 쓰기 | PoE2 텍스처·메시·애니메이션·사운드·셰이더·코드·데이터 테이블을 저장소·빌드에 넣기(그대로든 변형이든) |
| 일반 업계 개념(가산 합성, 플립북, 곡선, 방 조립, 가장자리 매칭) | PoE2 고유 이름(스킬·보스·지역·리그·파일 키 이름)을 우리 데이터 id나 UI 문구에 쓰기 |
| 우리가 새로 만든 JSON 필드 이름(이 문서의 스키마는 전부 자체 설계) | PoE2 정의 파일의 문법·키를 그대로 흉내 낸 포맷(우리 스키마는 우리 런타임 요구에서 출발) |
| 공개 자료(공식 패치노트·GDC) 인용 | 실행 파일 디컴파일, Content.ggpk 쓰기 열기, 다운로드한 툴 exe 실행 |

- 분석용 추출물은 저장소 밖(`G:\poe2-study\`)에만 둔다. 사용자 지시로 당분간 보존, 열람 종료 후 삭제.
- 새 VFX·스프라이트는 MagicLight(→ 부족 시 Higgsfield) 생성 또는 직접 제작. PixelLab **캐릭터 생성 금지**(AGENTS §4).
- 결과물이 "PoE2 그 스킬처럼 보인다"는 평가가 나오면 실패다. 우리 톤(Hell Gothic, 실버+검은 잉크, 썩은 생체 지옥)으로 판정한다.

### 5.2 보호 시스템 (엔진 레이어가 건드리면 안 되는 것)

| 보호 대상 | 엔진 레이어의 허용 범위 |
|---|---|
| `docs/2_3 돌진+패링+방패시스템/` (수정금지) 및 그 런타임(돌진·패링 윈도·방패·포이즈 계약) | **읽기 전용 호출만**. 위협 신호 resolver(COMBAT-01)는 실제 판정 헬퍼(`_projectileParryClass`·`_eCanReflectProjectile` 등)를 호출해 표시만 결정. 판정 수치·윈도·회복량 변경 금지 |
| 무지개탄(blackBean) = Q 전용, Q 성공 시 블루콩 유도반사 | 보스 정의의 `parry.class`는 기존 분류를 그대로 옮긴다 |
| **일반 적 어택 티켓/동시 공격 제한 금지** (AGENTS §4, 핵슬래시) | 보스 정의·스케줄러가 일반 적 공격 수를 제한하는 기능을 갖지 않는다. PERF-04도 "보장"만 추가하고 "제한"은 추가하지 않는다 |
| 피해·쿨다운·판정 반경·HP 공식 | 데이터 이전 단계(Phase 1·2의 "이전" 스텝)에서는 **값 불변**이 수용 기준. 밸런스 조정은 별도 스텝·별도 커밋·docs 14밸런스 갱신 |
| 맵 LOCK(CH1-1 98차 등)·`EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 순서·`MAP PRODUCTION REPORT` | Phase 3는 LOCK 지역을 재조립하지 않는다. 환경 프리셋만 "현재 값 그대로 데이터화" |
| 캔버스 텍스트 외곽선(GPU 프록시 `strokeText` 문제) | FX 텍스트 레이어는 fillText 오프셋 외곽선만 |

### 5.3 동시 작업·커밋

1. **`game.html`은 main 단일 브랜치에서만 편집**(메모리 규칙). 엔진 레이어는 가능한 한 **새 파일**(`exo-*.js`, `data/*.json`)에 두어 `game.html` 충돌 면적을 줄인다. `game.html`에는 로더 `<script>` 1줄 + 연결 지점 호출만.
2. 커밋은 경로 지정: `git commit -- <내 파일>`. `git add -A` 금지(타 세션 번들 사고 이력).
3. 새 런타임 파일을 만들면 **CLAUDE.md의 DEMO/EA 동기화 목록과 `build-nwjs.mjs` 포함 목록에 추가**해야 한다(현재 동기화 스크립트는 `lang_*.js lobby_i18n.js maps_data.js`만 복사 → 새 `exo-*.js`가 빠지면 DEMO/EA가 깨짐). Phase 0 완료 조건에 포함.
4. 각 단계 착수 시 해당 시스템 docs(5.1·8.1·4.1·14밸런스)를 먼저 읽고, 끝나면 수치를 동기화(CLAUDE.md docs 동기화 규칙). 화면에 보이는 새 텍스트가 생기면 번역 목록 등록.
5. 완료 판정은 테스트 PASS가 아니라 **실화면 1600×900 / 1920×1080 + 1x 크롭 검수**(CLAUDE.md 퀄리티 규칙). 디자인 미검수면 "기능만 완료"로 보고.

---

## 6. 미해결·불확실 (착수 전 확인)

| # | 항목 | 내용 | 처리 |
|---|---|---|---|
| U1 | `BOSS_MOVES` 개수 불일치 | 코드 59항목(L9539~9599) vs `BOSS_BATTLE_SETTINGS.md`·L9678 주석 "49종" | 이 문서 커밋 범위 밖(타 문서). 다음 보스 작업에서 docs 동기화 |
| U2 | 히트스톱 기본값 | `OPT.hitStop:0`(L6171) → 기본 설정에서 모든 히트스톱이 0프레임. 문서(기검참 3/6f 등)의 히트스톱은 사용자가 옵션을 올렸을 때만 체감 | 손맛 설계 결정 필요(기본값 변경은 밸런스·접근성 결정 — 사용자 승인 사항) |
| U3 | 보스 "추적/고정" 실측 | 현행 `_bossStartPattern`/`updateE` case에서 방향 추적이 언제 멈추는지 기술별로 다름(코드 미전수 조사). `track/lock` 값은 Phase 2 이전 스텝에서 기술별로 측정해 기입 | Phase 2 첫 작업 |
| U4 | 드루이드 애니 시간 기준 | `_drawDruidBoss`가 벽시계(`_nw/150`) 기준 → 히트스톱·슬로모·일시정지와 판정(틱)이 어긋날 수 있음. 이전 시 틱 기준으로 바꾸면 화면 프레임이 달라짐 | 이전 스텝 "픽셀 동일" 기준에서 이 항목만 예외로 명시 |
| U5 | 방 조립 대상 지역 | CH1-1은 LOCK. 시범을 CH1의 어느 지역(또는 `mapqa` 시험 스테이지)에서 할지 맵 팀장 결정 필요 | Phase 3 착수 시 |
| U6 | PoE2 수치의 표본 한계 | 레거시 .pet 3,000·GPU .pet 2,000·.mat 2,000은 표본, .trl·.epk·몬스터 .ao/.aoc·이펙트 .aoc는 전수. 수치 테이블(.datc64)·애니 커브(.ast)는 바이너리라 미해석(STUDY §6.6) | 비율·중앙값을 "경향"으로만 사용, 우리 수치는 실플레이로 확정 |
| U7 | GPU 프록시 블렌드 | 가산은 `_setBlend` 필수. FX 러너가 블렌드별 묶음을 하면 기존 호출부와 그리기 순서(z)가 바뀔 수 있음 | Phase 1 픽셀 비교로 확인 |
| U8 | 새 파일 배포 경로 | `exo-*.js`·`exo_defs.js`를 DEMO/EA 동기화·`build-nwjs.mjs`·Steam 패키지에 넣는 절차(CLAUDE.md 갱신은 사용자 확인 후) | Phase 0 완료 조건 |

# MAP 후속 한 건 — easy CH1-1 지원 계약과 source hook 차이 (continuous-MAP-easy-contract)

main의 CH1-1 source hook을 easy에 **전파하기 전에**, `game-easy-test.html`이 현재 지원·진입·출하 대상인지와 hook 차이가 **버전 의도인지 누락인지**를 계약으로 심사했다. 결론: **CH1-1 geometry parity를 요구하는 실제 계약은 없다 → 의도(INTENT) 우위, 강제 동기화 금지, 미적용 patch 제안 생략, 결정 대기.** 본 작업은 **source 계약 심사**이며 맵 제작/geometry/collision/camera/전투 QA·fixture 실행 **0**, 이전 3FAIL/23검사 **재실행 0**, Git/서버/빌드/UI/게임 **0**. source 차이를 실게임/시각 실패로 선언하지 않는다. `visualGateExecuted=false`, `visualVerdict=null(미판정)`.

## 0) 실행 계약·SHA 시점 구분 (공유 checkout 주의)

- 실제 cwd `/Users/fordeargamers/Projects/exoduser-migration-20261001`, checkout 20261001, 다른 담당과 공유 중. **타인 변경 되돌림 0.** 총괄이 **UI minus(카드) 수명 가드**를 순차 통합 중이라 공유 소스가 세션 중 변경됨.
- **Git 조회 0** (COMMON 준수). SHA는 모두 **파일 내용 SHA-256**(shasum)이며 HEAD 독립 관측이 아니다. 총괄 제공 commit은 출처/시각만 기록:
  - COMMON 제공 `7e69495046323b3120578f67635c20feb48b2a4f` (카드 수명 + NW.js 실패 응답 반영).
  - TEAM_UTILIZATION `currentRemoteCheck.verifiedSha 5b8e6ba9…` @ 2026-10-01T23:28:42Z, ref `codex/mac-environment-20261001`.
- **source SHA 시점 분리:** native-6 read 시점 `game.html 30ae8544…/easy 9c7c25c1…` ≠ **현재 read 시점** `game.html 2e45ee0e…/easy 3e5969ca…`. 그러나 CH1-1 hook/include 사실(main 보유·easy 미보유)은 **두 시점 모두 동일** → **계약 결론은 SHA-불변**. 과거 입력 SHA는 과거 검수값으로만 쓰고 현재로 재사용하지 않았다.
- 쓰기 소유 2파일(`result.md`, `evidence.json`)만. TASK·COMMON·이전 산출·생산·공유 docs 읽기전용.

## 1) 지원/진입/패키징/callsite 전표 (사실 분리)

> "파일 존재 · 서버 접근 가능 · 패키지 포함 · 사용자 진입점 있음 · 실제 지원/출하 승인"은 서로 다른 사실이다.

| 축 | game-easy-test.html 사실 | 근거 (현재 SHA) |
|---|---|---|
| **대상/현재 SHA** | `3e5969ca…` (현재 read). main `2e45ee0e…` | shasum |
| **파일 존재** | ✅ 존재 | 디스크 |
| **서버 접근** | △ **간접만** — `server.cjs:127-291`/`node-main.js:65-203` 정적서빙은 `/`→index.html, `/game.html`→game.html **명시 라우트뿐**, easy는 **라우트·리다이렉트 없음**. generic static 폴백으로 **직접 URL 입력 시에만** 서빙 | server.cjs/node-main.js |
| **패키지 포함** | ✅ **포함** — NW.js 빌드 복사 목록 | `build-nwjs.mjs:37` `'game-easy-test.html', 'game-guide.html',` |
| **사용자 진입점** | ❌ **없음** — index.html/로비에 링크 0 | `rg game-easy-test index.html` = 0 |
| **지원/출하 승인** | ❓ **부분 확정** — "추가 진입 파일 포함, **기본 진입점은 index.html 유지**" | `PC_PACKAGING_20260910.md:28` |
| **직접 호출 chain** | `_cloneField11→genFromTemplate`의 si0&forestBoundary 분기에서 `_buildCh1StartForestRLE(200,200)` 호출 | easy:27654 / main:28818 |
| **CH1-1 generator 선택** | **hook 없음 → bell-curve 폴백** (main은 hook@28742 → `CH1_1_PRODUCTION.buildRLE` 53점 polygon) | easy:27578-27593 / main:28741-28742 |
| **fg/edge 아트** | draw call은 **있으나**(`48795-48796`) script include **없음** → `globalThis.Ch1BorderForeground/Ch1BoundaryEdge` undefined → **inert no-op** | easy vs main:50272-50273, 62/67/68 |

**간접/직접 호출 구분:** CH1-1 generator hook은 **직접 호출**(builder 내부 분기)이고, fg/edge는 **간접 호출**(전역 모듈 가드). 과거 패키징 문서만으로 현재 출하를 확정하지 않는다 — PC_PACKAGING은 "포함"까지, 사용자 대상 지원/QA 범위는 UNKNOWN.

## 2) 동일성(parity) 요구가 실제 계약에 있는가 — 의도 vs 누락

**테스트 계약 (source of truth):**

| 테스트 | easy 검사? | 내용 | 함의 |
|---|---|---|---|
| `ch1StartForestBoundary.test.js` | ❌ game.html only | `_buildCh1StartForestRLE` + forest geometry + 북측 gate | **CH1-1 geometry 계약은 main 전용** |
| `ch1ProductionFinish.test.js` | ❌ game.html only | production finish | main 전용 |
| `ch1BorderForeground.test.js:134` | ✅ (명시) | **`assert.doesNotMatch(easySrc, /<script src="ch1-border-foreground/)`** — "easy-test는 호출 줄만 (다른 CH1 런타임과 동일)" | **easy의 script 태그 omission을 테스트가 강제 = 의도** |
| `ch1BoundaryEdge.test.js` | ✅ (draw call) | script 태그는 `gameSrc`만, draw call만 both | 동일 패턴(의도) |

**문서 계약:** `EASY_BALANCE_TEST` = easy 델타는 **밸런스 수치**(피해/스턴/무적/소환량), "**맵 geometry 비수정**" 명시. `PM_MASTER`는 여러 팀 작업에서 **standing policy "easy/패키지 미적용 유지"**를 반복(라인 492/497/511) — main 변경은 easy에 **자동 전파되지 않으며 별도 의도 단계**임을 뜻한다.

### 판정: **의도(INTENT) 우위 — 계약상 main-easy CH1-1 geometry parity 요구 미확인**

- easy의 CH1-1 아트/geometry 미포함은 **(a) foreground는 테스트로 강제된 의도, (b) forest/production 테스트는 main 전용, (c) 밸런스 문서가 geometry 비수정 명시, (d) PM_MASTER standing 'easy 미적용'** 로 수렴한다.
- 따라서 이전 **3FAIL(S03/S04/M15)은 계약 확인 전 "drift 관찰"**이며, **지금은 생산 수정 사유가 아니다.** native-6가 보인 "hook 1줄 주입 → parity 해소"는 **기계적으로 가능함**을 증명할 뿐 **계약상 필요함**을 뜻하지 않는다.

## 3) 최소 후보 / 결정 대기

**미적용 patch 제안을 내지 않는다.** TASK 조건("동일 계약 적용이 **근거로 확인되면**")이 **미충족**이기 때문이다(오히려 반대 근거 우위). 강제 동기화 대신 필요한 결정과 담당을 명시한다.

**잔존 리스크 / UNKNOWN**
- easy는 패키지 포함 "추가 진입 파일" → **최종 사용자가 `game-easy-test.html`을 직접 열면** CH1-1이 legacy bell-curve + production 아트(fg/edge/layout) 없이 렌더된다. 이 상태가 출하 품질로 허용되는지는 **기획/총괄 결정**.
- easy의 실제 지원 의도(개발 밸런스 미러 vs 사용자 노출 보조 진입)는 "추가 진입 파일 포함"까지만 확정, **사용자 QA/지원 범위 UNKNOWN**.
- easy 라이브 실행·script 실제 로딩·활성 여부 **미측정**(이번 실행 0).

**필요한 결정 (총괄/기획)**
1. `game-easy-test.html` = **(a) 개발용 밸런스 미러** 인가 **(b) 사용자 노출 보조 진입(출하 플레이 표면)** 인가?
2. **(b)라면** CH1-1 production geometry/art(layout include + `_buildCh1StartForestRLE` hook + `ch1-border-foreground.js` + `ch1-boundary-edge.js`) 전파가 필요 → 그 때 비로소 "동일 계약" 성립 → **geometry Gate**로 처리. 전파 실행 = **MAP+BUILD(패키징)**, 테스트 계약 갱신 = **QA**. (레이아웃 재생성·geometry 덮어쓰기·벽/좌표/오브젝트 편집은 **제안 범위에도 넣지 않음**.)
3. **(a)라면** 현행 drift = 의도된 테스트 미러 상태로 **문서 종결**(공유 docs 반영은 총괄).

## 4) canonical 문서/section·인계 문안 (공유 docs 미작성 — 총괄 순차 반영)

| canonical 대상 | 인계 문안 (미적용) |
|---|---|
| `docs/14밸런스+수치테이블/EASY_BALANCE_TEST_20260912.md` | "2026-10-02 계약 심사: `game-easy-test.html`의 CH1-1 production geometry/art(layout include+hook+fg+edge) 미포함은 **테스트(`ch1BorderForeground.test.js:134` doesNotMatch)·밸런스 문서(geometry 비수정)·PM standing(easy 미적용)으로 뒷받침되는 의도**이며 parity 계약 아님. 이전 3FAIL은 drift 관찰. 전파는 easy 지원 의도(미러 vs 보조 진입) 결정 후." |
| `docs/13출시·마케팅/PC_PACKAGING_20260910.md:28` 주석 | "`game-easy-test.html`은 패키지 '추가 진입 파일'로 **포함**되나 index.html 링크 0·서버 명시 라우트 0(직접 URL만). 직접 진입 시 CH1-1은 production 아트 없이 legacy geometry로 렌더됨 — 출하 품질 결정 필요." |
| `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md` CH1-1 PRODUCTION 적용 계약절 | "본 생산 계약은 main `STAGES[0]` 기준. 테스트 미러 `game-easy-test.html` 전파는 **명시 계약 미기재**이며 easy 지원 의도 결정 후 geometry Gate로 처리." |
| 총괄 작업표/JSON | "continuous-MAP-easy-contract: easy 지원/진입/패키징/callsite 전표 + 의도 판정(parity 계약 없음) 완료. 생산/geometry/UI/게임/패키지 실행 0. 결정 대기(easy 의도) — 총괄/기획." |

> rg 전수: `game-easy-test|추가 진입|EASY_BALANCE|production_finish/layout|_buildCh1StartForestRLE` → **374매칭 / 174파일**. 공유 docs 쓰기 0.

## 5) MAP PRODUCTION REPORT — 가이드 §23 (후속 제작 인계표 전용)

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 / easy 지원·hook source 계약 심사 (제작 단계 실행 0, source/data only)

MASTER
- silhouette: 미검수 (제작 실행 0). 사실: main=53점 polygon, easy=legacy bell-curve
- regions: 미검수
- main route: 미검수
- side spaces: 미검수

OUTER MASS / LARGE / MEDIUM / GROUND: 전 항목 미검수 (제작/geometry 실행 0)

PLAYABLE
- main arenas / travel / breathing / threat / combat readability: 전부 미검수

LANDMARK: 미검수

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 전부 미검수 (실제 8뷰 0)

TECH QA
- route/collision: 미검수 (이전 3FAIL 재실행 0; 계약상 drift 관찰로 분류)
- pageerror/404/seam/loading/performance: 미검수 (게임/서버/빌드 0)

FILES
- stage-owned: continuous/MAP/{result.md, evidence.json} 2개만
- concurrent touched: 0 (easy HTML·생산·에셋·공유 docs 불변; 타세션 UI 가드 변경 되돌림 0)
- unrelated touched: 0

GIT
- staged: 0 / commit: 0 / push: 0 / deploy: 0  (Git 조회도 0)

visualGateExecuted: false
VISUAL VERDICT: null (미판정 — 시각 Gate 미수행; RETOUCH를 미검수 별칭으로 쓰지 않음)

NEXT PASS: 총괄/기획이 easy 지원 의도(미러 vs 보조 진입) 결정 → (보조 진입이면) CH1-1 production geometry/art 전파를 geometry Gate로 처리(MAP+BUILD) + 테스트 계약 갱신(QA) + 실제 8뷰 시각 Gate 수행 후 PASS/RETOUCH/FAIL 판정. (미러면) 의도된 drift로 문서 종결.
```

## 6) 완료 Gate 체크

- ✅ 가이드 v0.9 전체(1-1047) 선행 Read, `_MAP_SSOT_INDEX` CH1-1 LOCK 확인 (범위 `evidence.json`에 기록)
- ✅ easy 현재 지원 범위와 hook 호출 근거 **분리** (전표 §1)
- ✅ 부족한 지원/출하 근거 **UNKNOWN 명시** (§3)
- ✅ 이전 검사 반복 0 / 생산·geometry·UI·게임·패키지 실행 0 / Git 조회·쓰기 0
- ✅ `visualGateExecuted=false, visualVerdict=null`, source 일치를 visual PASS로 대체 안 함
- ✅ 소유 2파일만 작성, TASK/COMMON/이전 산출/공유 docs 미변경

## 7) 결과·영향·검증 한계·남은 의존성

- **결과:** easy의 CH1-1 hook/geometry/art 미포함은 **의도된 버전 분기**(테스트·문서·운영 policy 근거)이며 **parity 계약 부재** → 생산 수정 보류, patch 미제안, **결정 대기**.
- **영향:** 총괄은 지금 main hook을 easy에 전파하면 안 된다(계약 근거 없음). 전파는 easy 의도 결정 뒤 geometry Gate에서만.
- **검증 한계:** 정적 source/문서/테스트 계약 심사만. 실게임·서버·8뷰·easy 라이브 로딩 미측정. SHA는 파일 내용 해시(HEAD 관측 아님).
- **남은 의존성:** (1) easy 지원 의도 결정(총괄/기획), (2) 결정 시 전파(MAP+BUILD)·테스트 갱신(QA)·시각 Gate, (3) 공유 docs 4건 반영(총괄 순차). Changes: 중간 47(<80), stage/commit/push 0.

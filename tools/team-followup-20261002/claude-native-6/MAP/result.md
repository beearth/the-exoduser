# MAP (claude-native-6) — native-easy-hook-candidate-validation 결과

쉬운판(`game-easy-test.html`) CH1-1 생성 **3FAIL(S03/S04/M15)**의 단일 근본원인을, **production layout include + `_buildCh1StartForestRLE` hook 한 줄**만 메모리 후보로 주입한 **실제 생성함수 재현**으로 검증했다. geometry/RLE/좌표를 새로 정의하지 않고 production `layout.js`(SSOT)와 main의 hook 바이트를 그대로 사용했다. **후보는 미적용**(easy HTML·에셋 디스크 무변경)이며, easy의 제품 채택 여부는 결정하지 않는다. 자체 하니스 **11검사 전원 PASS**. 기존 23검사/BFS는 재실행하지 않았다(최소 반례 + 후보 대조로 한정). 실제 게임·8뷰·시각/청취 인수 0 → **VISUAL VERDICT: RETOUCH, 실제 8뷰 0/8 유지**.

## 0) 인수 구분 (이전 완료 vs 별도 provider vs 본 작업)

| 산출물 | 성격 | 본 작업과의 관계 |
|---|---|---|
| `tools/.../project-teams/MAP/{checks.mjs,result.md,evidence.json}` | 이전 MAP 소스검수 완료 (23검사 20PASS/3FAIL) | **재실행·합산 안 함.** 3FAIL의 입력/식별자/SHA를 근거로 인수 |
| `tools/.../claude-provider/MAP/result.md` | 별도 Claude-provider **읽기전용** 후속(23검사/BFS 재실행0, drift 단일원인 판별) | **인수.** "production hook/layout 동기 누락" 판별을 이어받아 **실제 주입 재현으로 검증** |
| `tools/.../claude-native-6/MAP/{checks.mjs,result.md,evidence.json}` | **본 작업 신규 3파일(소유)** | 후보 주입 하니스 + 본 보고서 + 실행 이력 |

이전/별도 결과를 본인 실행으로 합산하지 않았다. 본 작업은 provider가 "결정대기/묵시추론"으로 남긴 "**hook 한 줄 주입 시 parity 실제 해소 여부**"를 격리 VM 실행으로 메운다.

## 1) 소스 근거 (실제 Read·식별자·현행 SHA)

경로는 루트 `/Users/fordeargamers/Projects/exoduser-migration-20261001` 기준. 아래 SHA는 본 실행에서 측정한 **현행 입력 SHA**다(원격 ref 대조는 총괄 단계).

| 근거 | 위치 | 확인 | 현행 SHA-256 |
|---|---|---|---|
| main production layout include | `game.html:62` `<script src="assets/map/ch1/production_finish/layout.js?v=20260916-finish-1">` | main만 로드 | game.html `30ae8544…3ce9ba3f` |
| main production hook | `game.html:28742` `if(typeof CH1_1_PRODUCTION!=='undefined')return CH1_1_PRODUCTION.buildRLE(mw,mh);` | main 빌더만 53점 polygon 분기 | — |
| main 빌더 본문 | `game.html:28741–28757` | 28742 hook 1줄 + bell-curve 폴백 | 빌더 `28caed8b…d16225db` |
| easy 빌더 본문 | `game-easy-test.html:27578–27593` | **hook 없음**, 곧장 bell-curve. 27579–27592는 main 28743–28756과 바이트 동일 | 빌더 `8f6ad81b…a87d6ca8` / easy.html `9c7c25c1…03799af8` |
| 공통 호출 경로 | `game.html:28818` / `game-easy-test.html:27654` `(si===0&&_pc&&_pc.forestBoundary)?_buildCh1StartForestRLE(200,200):…` | 양쪽 si0 진입 동일, easy만 legacy RLE 수신 | — |
| production layout SSOT | `assets/map/ch1/production_finish/layout.js:20 buildRLE` / `:39 CH1_1_PRODUCTION=Object.freeze({…buildRLE})` | 53점 polygon `contains` → RLE. **본 작업이 새로 정의하지 않고 그대로 호출** | layout.js `94b974df…b89a20dab` |
| CH1-1 생산 LOCK | `_MAP_SSOT_INDEX.md`(2026-09-16 "CH1-1 PRODUCTION 적용 계약") "현행 경계는 `production_finish/layout.js`의 53점 polygon/8구역 … authored62/runtime63" | canonical = 53점 polygon(main 기준 서술) | — |
| easy 성격 | `docs/14밸런스+수치테이블/EASY_BALANCE_TEST_20260912.md`(※provider가 적은 `4.1맵…` 경로는 오기, 실제는 `14밸런스…`) | easy 문서 델타는 **밸런스 수치**(피해/스턴/무적/소환량), "맵 geometry 비수정" 명시 | — |
| foreground/edge 스크립트 | `game.html:67 ch1-border-foreground.js`, `:68 ch1-boundary-edge.js` — easy에는 **둘 다 없음** | **별도 시각 Gate**(생성 parity와 무관) | fg `ch1-border-foreground.js`, edge `ch1-boundary-edge.js`(inputsBefore 참조) |

> 입력 6개 현행 SHA는 `evidence.latest.inputsBefore`에 보존. game.html/easy/layout.js의 현행 SHA는 provider가 참조한 evidence SHA(`30ae8544…`/`9c7c25c1…`/`94b974df…`)와 **일치** — 다만 원격 ref SHA 재대조는 총괄 단계로 남긴다.

## 2) 후보 주입 하니스 — 입력/예상/관찰/판정

**후보 = 두 가지만.** (a) production layout include: 이미 두 fixture가 `layout.js`를 VM 선로드(기존 fixture 관례). (b) `_buildCh1StartForestRLE` hook: main의 84바이트 1줄(`injectedHookLineSHA256 6e0414cd…`)을 easy 빌더 머리글 뒤에 **메모리 문자열로만** 삽입. geometry/RLE/좌표/소스 신규 정의 0.

세 fixture를 격리 Node VM에서 실제 `_cloneField11(0)→genFromTemplate` 전체 실행: **main(기준) / easyLegacy(현행) / easyCandidate(hook 주입)**.

### 2-A. 최소 반례 (현행 drift 재현)

| id | 입력 | 예상 | 관찰 | 판정 |
|---|---|---|---|---|
| C01 | 소스 include/hook 전수 | main=layout+hook 有, easy=無 | `mainLayoutInclude/hook=true`, `easyLayoutInclude/hook=false` | **PASS** |
| C02 | easy 빌더 + hook 1줄 == main 빌더? | 바이트 단일 차이 | 재구성본 == main 빌더(`28caed8b…`) | **PASS** |
| C03 | main vs easyLegacy G.map SHA | 상이 | main `8a5dfe9f…` ≠ easy `7c7e8d31…` | **PASS**(S04 재현) |
| C04 | `(6660,6305)` canMv | main=false / easy=true | 관찰 일치 | **PASS**(M15 재현) |

### 2-B. 후보 대조 (hook 주입 후 3FAIL 해소)

| id | 대응 FAIL | 입력 | 예상 | 관찰 | 판정 |
|---|---|---|---|---|---|
| P03 | **S03** | easyCandidate 빌더 바이트 | == main | `candidateSHA256 28caed8b… == mainSHA256` | **PASS** |
| P04 | **S04** | easyCandidate G.map SHA | == main `8a5dfe9f…` | `easyCandidate 8a5dfe9f…` | **PASS** |
| P15 | **M15** | 5탐침점 isW/canMv/tile | main==candidate 전부 | `(6660,6305)` candidate canMv=**false**(=main); 5점 전원 일치 | **PASS** |
| P06 | (근거) | candidate raw RLE | == main(layout.js 그대로) | `719b6813… == 719b6813…` | **PASS** |
| P07 | (제약) | 주입 바이트·디스크 | 85바이트(1줄+\n), easy.html SHA 불변 | 일치, `9c7c25c1…` 불변 | **PASS** |
| G01/G02 | (보호) | 가드 호출 / 입력 6 SHA | 0 / 전후 동일 | 0 / 동일 | **PASS** |

**결론:** S03·S04·M15 세 FAIL은 **모두 easy의 hook 1줄 누락(+include 미동기) 하나로 수렴**하며, 그 1줄만 주입하면 생성함수 수준에서 **완전 해소**된다(G.map SHA가 main과 비트 단위 동일 `8a5dfe9f…`). `isW`/`canMv`/`_rebuildColObjs`/hill 등 **공식 차이는 없음**(빌더 외 전 함수 바이트 동일). 즉 "쉬운판이 의도된 별도 geometry"가 아니라 **2026-09-16 생산 적용이 2026-09-12 분기 테스트 사본으로 전파되지 않은 drift**임을 실행으로 확정.

**UNKNOWN(미측정):** easy 페이지 라이브 실행·script 실제 로딩·활성 여부, 실제 런타임 seed 재현, 시각/8뷰. "동일맵=확정계약" 명시 문구는 SSOT에 **없음**(밸런스 문서·양쪽 반영 관례로부터의 추론). → 아래 결정대기.

## 3) 미적용 후보 (명시)

- **생산 수정 보류(결정대기).** easy에 `layout.js` include + hook 추가는 geometry/소스 변경이며 본 과제 범위 밖. "확정계약" 명시 근거 부재 + easy 활성도 UNMEASURED → **임의 통합 0**. 후보는 **메모리에서만 검증**했고 `game-easy-test.html`은 디스크 불변(SHA `9c7c25c1…` 전후 동일).
- 적용 가능한 것은 **문서 기록(소스 무변경)**뿐 — 아래 §4 정정표. 공용 docs 반영·생산 통합은 **총괄의 순차 인수**.

## 4) docs 정정표 (총괄 동기화용, 미적용)

shared docs는 본 작업이 직접 수정하지 않는다. 아래 문안을 총괄이 인수 시 반영.

| 대상 docs | 정확한 변경안 | 비고 |
|---|---|---|
| `docs/14밸런스+수치테이블/EASY_BALANCE_TEST_20260912.md` 말미 | **2026-10-02 geometry drift 실행검증**: `game-easy-test.html`은 2026-09-16 CH1-1 생산 적용(`production_finish/layout.js` include + `_buildCh1StartForestRLE` hook)을 전파받지 못해 si0 CH1-1이 53점 polygon이 아닌 pre-production bell-curve로 생성됨. **hook 1줄(84B)만 메모리 주입하면 main과 G.map SHA 완전 동일(`8a5dfe9f…`)·`(6660,6305)` canMv도 main과 일치(false)**. `isW`/`canMv` 공식 차이 아님 → 의도된 별도맵 아님·**동기 누락**. 생산 수정은 geometry 변경이라 **결정대기**(easy 활성여부 확인 후 총괄/런타임 Gate). | provider는 경로를 `4.1맵…`로 오기 → 실제 `14밸런스…`. 본 정정으로 교정 |
| `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md` CH1-1 PRODUCTION 적용 계약 절 | 한 줄 병기: "테스트 사본 `game-easy-test.html`은 본 생산 계약을 **미전파**(include·hook 0). 동일맵 요구는 밸런스 문서·반영 관례상의 추론이며 명시 계약 문구는 미기재 — easy 동등검수 전 전파 필요." | 역사 수치는 당시 이력로 유지, 최신 상태만 추가 |
| `docs/4.1맵디자인+설정/CH1_BOUNDARY_EDGE_MAP020_20261001.md` §9 / `MAP_IMPROVEMENT_PROJECT.md` MAP-020 행 | drift 원인 1줄 병기 + "foreground/edge 스크립트(easy 미포함)는 **별도 시각 Gate**"로 분리 명기 | — |
| `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MAP-ART-REVIEW-20261002.md` MAP 상태절 | "쉬운판 3FAIL 후속: hook 1줄 메모리 주입으로 parity 실제 해소 검증(11검사 PASS), 생산 미적용·결정대기, foreground/edge 별도 시각 Gate, 실제 8뷰 0" | 정식 8뷰 0/8 유지 |
| 총괄 작업표/JSON | 이번 건은 **source/실행 재현 검증 완료**로만 인수. runtime/visual 완료로 표시 금지. 시작 HEAD `8fd5b7ec…`·입력 SHA 함께 기록 | 총괄 소유 자료만 총괄이 반영 |

## 5) MAP PRODUCTION REPORT — 가이드 §23

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 / MAP-020 / 쉬운판 3FAIL hook 후보 검증 (source/VM 실행, no game bootstrap)

MASTER
- silhouette: 변경0. main=53점 polygon(layout.js), easy=legacy bell-curve; hook 주입 시 easy→polygon 동일 확인
- regions: 기존 8구역 유지; M5 독립 pocket/entrance ID 미확인(임의정의0)
- main route: 계약 유지; 라이브 종주 미검수
- side spaces: 재판단 안 함

OUTER MASS / LARGE / MEDIUM / GROUND: 변경0, 새 시각 미검수

PLAYABLE
- travel space: BFS 재실행0(기존 샘플 인수)
- combat readability: 미검수

TECH QA
- route/collision: 기존 20PASS/3FAIL 재실행0. 3FAIL 단일원인(easy hook/layout 누락) → hook 1줄 주입으로 S03/S04/M15 전부 해소 실행검증(11검사 PASS)
- pageerror/404/seam/loading/performance: UNMEASURED (게임/서버/빌드 0)

FILES
- stage-owned: claude-native-6/MAP/{checks.mjs, result.md, evidence.json} 3개만 신규
- concurrent touched: 0 (easy HTML·에셋·공용 docs 불변)
GIT: staged 0 / commit 0 / push 0 / deploy 0

VISUAL VERDICT: RETOUCH
실제 8뷰: 0/8 (시각/청취 인수 미수행)
NEXT PASS: 총괄이 easy 활성 여부 확인 → 확정계약이면 easy에 production layout include+hook 전파(geometry Gate, 이번 검증이 무결성 근거) / 아니면 테스트 사본 drift로 문서 종결. foreground+edge 스크립트 전파는 별도 시각 Gate. M5 주머니 전체 왕복은 UNMEASURED 유지.
```

## 6) 실행 시각·소유 파일 (evidence)

| 단계 | 시각 (UTC) | 근거 |
|---|---|---|
| 최신 TASK 첫 Read | 세션 시작 직후 | `claude-native-6/MAP/TASK.md` 읽기 |
| 선행 Read | TASK 이후–작성 전 | AGENTS.md, 이전 project-teams/MAP 3파일, claude-provider/MAP result·TASK, 가이드 참조·`_MAP_SSOT_INDEX.md`, 양쪽 빌더/include 원문 |
| 명령(하니스 실행) | `2026-10-02T04:26:24.957Z`–`04:26:25.158Z` | `evidence.latest.startedAt/finishedAt`, HEAD `8fd5b7ec…`, 11 PASS/0 FAIL |
| 작성 | 명령 이후 | checks.mjs 작성 → 실행 → evidence.json(`--evidence`) → 본 result.md |
| 검수 | docs rg 전수(453매칭/184파일) + 입력 6 SHA 전후 동일 + 소유 3파일 확인 | `evidence.latest.inputsAfter` |

- 소유 신규 3파일: `checks.mjs`(실행 하니스, SHA `2c7de4fb…`), `evidence.json`, `result.md`. **TASK.md 미수정**(총괄 소유).
- 재현: `cd /Users/fordeargamers/Projects/exoduser-migration-20261001 && /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/claude-native-6/MAP/checks.mjs` (기본 stdout, `--evidence`만 소유 evidence 갱신). exit 0 = 11 PASS.
- Changes 개수(읽기전용 기록): 시작 42 → 중간 49(신규 2파일 포함) → 80 미만. stage/commit/push 0.

## 7) 수행 / 미수행 구분

- **수행:** 이전 project-teams/MAP·claude-provider/MAP 산출 Read(재실행0), 양쪽 빌더/include/호출경로 원문 Read, production `layout.js` SSOT 확인, **hook 1줄 메모리 후보 주입 + 실제 `genFromTemplate` 격리 VM 실행으로 S03/S04/M15 해소 검증(11 PASS)**, docs rg 전수(453/184).
- **미수행(명시):** 기존 23검사/BFS **재실행 0**, **생산 적용·소스/geometry/좌표/RLE 변경 0**(hook은 메모리 문자열), easy HTML·에셋·공용 docs **쓰기 0**, 실제 게임·서버·빌드·8뷰·시각/청취 **0**, 원격 ref SHA 재대조(총괄 단계), Git stage/commit/push **0**. "easy 라이브 활성·동일맵 확정계약"은 각각 **UNMEASURED / 추론**으로 남겨 임의 통합하지 않음.

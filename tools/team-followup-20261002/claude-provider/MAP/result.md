필요한 소스 근거를 모두 확보했습니다. 재실행(23검사/BFS)은 하지 않았고 기존 evidence와 소스 원문만 Read/Grep으로 검토했습니다. 아래가 최종 검토 결과입니다.

---

# MAP 쉬운판 3FAIL 원인분기 — 읽기전용 후속 검토

## 1) 소스 근거 (실제 Read/Grep한 위치·식별자)

| 근거 | 위치 | 확인 내용 |
|---|---|---|
| main 생산 layout include | `game.html:62` `<script src="assets/map/ch1/production_finish/layout.js?v=20260916-finish-1">` | main은 생산 layout 스크립트 로드 |
| main production hook | `game.html:28742` `if(typeof CH1_1_PRODUCTION!=='undefined')return CH1_1_PRODUCTION.buildRLE(mw,mh);` | main `_buildCh1StartForestRLE`는 53점 polygon 경로로 분기 |
| easy include 전수 | `game-easy-test.html` Grep: `CH1_1_PRODUCTION\|production_finish/layout.js\|production/layout.js\|ch1-boundary-edge\|ch1-border-foreground` → **No matches** | easy에는 생산 layout 스크립트·hook·경계/전경 스크립트가 **하나도 없음** |
| easy 생성 함수 원문 | `game-easy-test.html:27578–27592` | `_buildCh1StartForestRLE`에 hook 라인 없음 → 곧바로 bell-curve 절차생성. 27579–27591 본문은 main 28743–28755와 바이트 동일, **차이는 28742 hook 한 줄뿐** |
| easy 호출 경로 | `game-easy-test.html:27648 _cloneField11` → si0 `forestBoundary`면 `_buildCh1StartForestRLE(200,200)` 호출(27654), `genFromTemplate`(27821) | easy si0도 동일 진입이나 legacy RLE를 받음 |
| layout.js 실제 경로 | Glob `assets/map/ch1/**/layout.js` → `assets/map/ch1/production_finish/layout.js` 단일 | task 문의 `…/production/layout.js`는 부정확, 실제는 `production_finish/` |
| CH1-1 생산 LOCK | `_MAP_SSOT_INDEX.md:212` (2026-09-16) "실제 `STAGES[0]`에 고정 수작업 전체맵 적용 … 현행 경계는 `production_finish/layout.js`의 53점 polygon/8구역" | 현행 CH1-1 canonical = 53점 polygon (main 기준으로 기술) |
| easy 파일 성격 | `EASY_BALANCE_TEST_20260912.md:5` "`game-easy-test.html`은 `EXODUSER-easy-patch/game.html`의 밸런스 변경을 포함한 테스트 사본", `:34` "이번 변경은 **맵 geometry나 배치를 수정하지 않는** 소환량 밸런스 조정" | easy의 문서화된 델타는 피해/스턴/무적/소환량 수치뿐, **맵 geometry 아님** |
| 양쪽 반영 관례 | `_MAP_SSOT_INDEX.md:49`(REGION gate), `:343`(POSTFX), `EASY_BALANCE_TEST:26` 등 "game.html + game-easy-test.html 동일 반영" | gameplay/geometry는 양쪽 미러링이 운영 관례 |

> 기존 23검사·BFS·parity는 재실행 0. 위는 evidence.json(§parity: `mainProductionLayoutHook:true / easyProductionLayoutHook:false`, easySHA 상이)과 소스 원문을 대조한 것이다. 기존 evidence 입력 11개 SHA(예 `game.html 30ae8544…`, `game-easy-test.html 9c7c25c1…`, `production_finish/layout.js 94b974df…`)의 **현행 SHA 재검증은 총괄 단계**이며 이번에 재해시하지 않았다.

## 2) 3FAIL 원인분기표

| id | 한글명 | 조건(트리거) | 현재분기 | 영향 | 기대행동(SSOT 기준) |
|---|---|---|---|---|---|
| **S03** | 생성 함수 원문 parity | `_buildCh1StartForestRLE`/`_cloneField11`/`genFromTemplate` 원문 비교 | main=hook 포함(28742)·easy=hook 없음(27578). 차이는 production 분기 라인 | easy si0가 53점 polygon 대신 legacy bell-curve를 빌드 | main과 동일 생성 계약이어야 함(geometry 비변경 정책). 단 easy는 생산 스크립트 미동기 |
| **S04** | 생성 격자 parity | 동일 `.5/.9` fixture로 genFromTemplate 전량 실행 | main 격자 SHA `8a5dfe9f…` ≠ easy `7c7e8d31…` | CH1-1 벽/바닥 배치가 두 빌드에서 상이 | 동일 입력→동일 격자여야 함. 현재는 hook 유무로 분기 |
| **M15** | 선택점 판정 parity | `(6660,6305)` 등 접근·벽·남쪽정지점 canMv | main canMv=false(polygon 벽 가장자리), easy=true(bell-curve 바닥). `isW`/`canMv` 공식은 **양쪽 SHA 동일** | 동일 좌표가 한쪽은 벽, 한쪽은 통행 → 쉬운판 충돌/도달성 체감 상이 | 판정 공식이 같으므로, 격자만 일치하면 자동 해소 |

**단일 근본 원인**: 세 FAIL 모두 "easy가 `production_finish/layout.js` 스크립트 + `CH1_1_PRODUCTION` hook을 포함하지 않아 CH1-1 si0 geometry가 2026-09-16 생산 적용 이전의 legacy bell-curve로 남아 있음" 하나로 수렴한다. `isW`/`canMv`/`_rebuildColObjs`/hill 함수는 양쪽 SHA 동일(공식 차이 아님).

**판별 결론 (쉬운판 의도된 별도 생성 vs production hook 누락)**:
→ **production hook/스크립트 동기 누락(drift) 쪽이 근거 우위.** 이유: (a) SSOT 어디에도 easy에 다른 CH1-1 geometry를 두라는 승인이 없고, (b) easy 전용 델타는 밸런스 수치로 명시되며 밸런스 문서가 "맵 geometry 비수정"을 못박고 있으며, (c) gameplay/geometry 변경은 "양쪽 동일 반영"이 관례다. 2026-09-16 생산 LOCK이 main `STAGES[0]`에만 서술되어 있고 테스트 사본(2026-09-12 분기)으로 전파되지 않은 것이 drift의 직접 원인으로 보인다.

## 3) 논리 반례 후보 / 불확실성 (미실행)

- **반례 후보 1 — "확정계약" 미기재**: SSOT에 "`game-easy-test.html`은 `production_finish/layout.js`를 반드시 로드한다"는 **명시 계약 문구는 없다.** 동일맵 요구는 밸런스 문서·반영 관례로부터의 **묵시적 추론**이다. 따라서 "동일맵=확정계약"이라 단정할 수는 없다.
- **반례 후보 2 — easy 활성도 UNMEASURED**: game-easy-test.html이 현재도 쓰이는 밸런스 테스트 타깃인지, 방치된 사본인지 **실제 페이지 로드/런타임을 측정하지 않았다**(기존 MAP 결과도 "easy 실제 페이지 실행·script 로딩 0"). 방치 사본이면 drift는 무해하며 수정 불요.
- **불확실성 — VM 비교 한계**: parity는 격리 VM이 동일 pure layout 정의를 선로드했으나 easy 추출 builder가 legacy fallback을 실행한 **소스 수준 재현**이다. easy 라이브 맵의 실제 생성/도달성은 미증명.

## 4) 최소 후보 / 보류·정책 결정

- **생산 수정 보류(결정대기)**: easy에 layout.js include + hook 추가는 **geometry/소스 변경**이라 이번 과제 범위 밖(geometry/collision/좌표/소스 변경 0). 또한 "확정계약" 명시 근거가 없고 easy 활성도가 UNMEASURED이므로 **임의 통합하지 않고 총괄/런타임 Gate 결정으로 남긴다.** M5 주머니 임의정의 0 유지.
- **적용 가능한 것(문서 기록만, 소스 무변경)**: 아래 docs 정정 문안을 제안한다. 이는 사실 기록이며 생산 적용이 아니다.

**docs 정정 문안 (총괄 동기화용, 미적용)**

1. `docs/4.1맵디자인+설정/EASY_BALANCE_TEST_20260912.md` 말미에 추가:
   > **2026-10-02 geometry drift 기록(소스 검수)**: `game-easy-test.html`은 2026-09-16 CH1-1 생산 적용(`production_finish/layout.js` + `CH1_1_PRODUCTION` hook, `_MAP_SSOT_INDEX.md:212`)을 전파받지 않아, si0 CH1-1이 생산 53점 polygon이 아닌 pre-production bell-curve로 생성된다(`game-easy-test.html:27578`에 hook 없음, 생산 layout include 0). 격자 SHA main `8a5dfe9f…` ≠ easy `7c7e8d31…`, `(6660,6305)` canMv main=false/easy=true. `isW`/`canMv` 공식 차이는 아님. 밸런스 델타(피해×.5 등)는 geometry 비수정이 원칙이므로 이 차이는 **의도된 별도 맵이 아니라 동기 누락으로 판단**. 생산 수정(easy에 layout.js+hook 전파)은 geometry 변경이라 **결정대기** — easy 활성 여부 확인 후 총괄/런타임 Gate에서 처리.

2. `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MAP-ART-REVIEW-20261002.md` 현행 MAP 상태절: "쉬운판 3FAIL 후속 검토 완료 — 단일 근본원인(easy 생산 layout 미포함) 확인, 의도된 별도 생성 아님, 생산수정 결정대기, 실제8뷰0" 한 줄 추가.

3. (기존 MAP result.md가 이미 제안한) `CH1_BOUNDARY_EDGE_MAP020_20261001.md §9` / `MAP_IMPROVEMENT_PROJECT.md MAP-020` 행에 위 drift 원인 한 줄 병기.

## 5) 가이드 §23 MAP PRODUCTION REPORT (후속 검토 요약)

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 / MAP-020 / 쉬운판 3FAIL 원인검토 (read-only follow-up, source/data only)

MASTER
- silhouette: 변경0. main=53점 polygon(layout.js), easy=legacy bell-curve 확인
- regions: 기존 8구역 유지; M5 독립 pocket/entrance ID 미확인(임의정의0)
- main route: 계약 유지; 라이브 종주 미검수
- side spaces: M5 투영 228 통행중심(기존 evidence) 재판단 안 함

OUTER MASS / LARGE / MEDIUM / GROUND: 변경0, 새 시각 미검수

PLAYABLE
- travel space: 기존 99중심 샘플 재실행0
- combat readability: 미검수

TECH QA
- route/collision: 기존 20PASS/3FAIL 재실행0; 3FAIL 단일 원인(easy 생산 layout 누락) 판별
- pageerror/404/seam/loading/performance: UNMEASURED (게임/서버/빌드 0)

FILES
- stage-owned: 없음(읽기전용, 신규 산출 0 — Write/Edit/Bash 미사용)
- concurrent touched: 0
GIT: staged 0 / commit 0 / push 0 / deploy 0

VISUAL VERDICT: RETOUCH
실제 8뷰: 0/8 (시각/청취 인수 미수행)
NEXT PASS: 총괄이 easy 활성 여부 확인 → 확정계약이면 easy에 production layout 전파(geometry Gate), 아니면 테스트 사본 drift로 문서화 종결. M5 주머니 전체 왕복은 UNMEASURED 유지.
```

---

### 수행/미수행 구분
- **수행**: 기존 MAP task/result/evidence 전량 Read, 가이드 v0.9 전체(1–1047), `_MAP_SSOT_INDEX.md` 전체, 양쪽 HTML script include Grep, `_buildCh1StartForestRLE` 양쪽 원문 Read, `_cloneField11`/`genFromTemplate` 호출경로 확인, layout.js 정확경로 Glob, 생산 LOCK·easy 성격 docs 확인. → 3FAIL 단일 원인 판별.
- **미수행(명시)**: 23검사/BFS/parity **재실행 0**, 입력 11 SHA **현행 재검증 0**(총괄 단계), 생산 적용·소스/geometry/좌표 변경 **0**, 실제 게임·서버·빌드·8뷰·시각/청취 인수 **0**, 파일 쓰기 **0**. "easy 라이브 맵 실제 생성/도달성"과 "동일맵 확정계약 여부"는 각각 **UNMEASURED / 묵시추론**으로 남겨 임의통합하지 않았다.

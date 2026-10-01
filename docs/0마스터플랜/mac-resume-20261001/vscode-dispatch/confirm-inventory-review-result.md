# QA-20261002-CONFIRM-INVENTORY-REVIEW — 결과 (한국어)

- 담당 QA / 기존 세션 `88c3f903…`. HEAD `98aedab7`(작업 중 디스크 변동 있음).
- 수신 15:52:26Z / 첫 Read 15:53Z / Edit 착수 15:55Z / 완료 15:56Z (UTC). receipt: `confirm-inventory-review-receipt.json`.
- 범위: `NEXT_TASK.md`(완료된 fire 과제 중복 초안)는 **재실행 안 함**. `confirm-inventory-review-task.md` 한 건만.
- 성격: root의 SKILL hellRay 게이트·UIUX inventory-focus 후보를 **실제 공용 소스·SSOT와 독립 대조**.
  기존 테스트 통째 복사 아님. 게임/브라우저/서버/빌드/계측 미실행. **실제 브라우저 검수 주장 아님.**

## 실제 소스 SHA-256 (대조 시점)
- game.html `f7212ac287665f831975c47523783967374db4c1219b898e57bca5f97cfa1649`
- game-easy-test.html `34ffa8ae1ff4a4509e695f921eef53e0a236aff63184459d13a915f37434bd04`

## 산출물 (QA 소유)
- 소형 독립 회귀: `tools/team-followup-20261001/QA/confirm-inventory-review-regression.mjs` → **17 PASS / 0 FAIL, exit 0**
- 실행: `node tools/team-followup-20261001/QA/confirm-inventory-review-regression.mjs`

## A. SKILL hellRay 확정 게이트

| # | 검사 | 결과 |
|---|---|---|
| A1 | game·easy 확정 블록 **동일**(한 patch로 커버) | PASS |
| A2 | SSOT 수치가 실제 소스에 존재: `P.mp-=100`(MP100)·`200+(_hrLv-1)*22`(범위)·`P._hrRech=600`(10초)·`P._hrStk--`(스택1). docs `2_1:408`·`자원공식:247` 일치 | PASS |
| A3 | **현재 상태 판정** | PASS — **현재 game.html/easy = PATCHED** |
| A4 | 양쪽 patch 본문 동일(오프셋만 상이) + 확정 블록 내 앵커 유일 | PASS |
| A5·A6 | **RED(게이트 없는 before 블록)**: MP99→mp −1, 스택0→stk −1, 장판 설치(결함 재현) | PASS |
| A7 | patched ≠ before | PASS |
| A8·A9 | **GREEN**: MP99/스택0 → 무차감·무설치·부작용0(조준 유지/종료) | PASS |
| A10 | 동시취소(RMB+클릭) 우선 → 무설치·부작용0 | PASS |
| A11 | 성공(MP100/스택1) 기존 행동·클릭소비·충전(600f) 보존 | PASS |
| A12 | 합체(elecRepent) 성공 2장판 / 실패(MP99) 0장판·부작용0 | PASS |

### A 핵심 발견 — **이중 patch 금지 (중요)**
- 검토 착수 시점(HEAD 98aedab7)엔 before였으나, **작업 중 root가 hellRay 게이트를 game.html·game-easy-test.html 양쪽에 이미 적용**했다(uncommitted; `L34991~34993` 가드 확인, `git diff`에 `+` 가드 3줄).
- 따라서 **현재 소스 = PATCHED**. `hellray-confirm-game/easy.patch`를 **재적용하면 가드가 2중 삽입**된다(회귀가 재적용 시 `MP 부족! (100)` 2회 등장으로 증명). → **root는 재적용 금지.**
- RED 결함(조준 후 MP/스택 변경 미재검사 → 자원 음수·무조건 설치)은 재구성한 before 블록에서 재현되고, 현재 patched 블록은 GREEN(무차감·무설치·부작용0)이며 성공/취소/합체 경로·SSOT 수치 모두 보존됨을 독립 확인했다.
- 참고: root SKILL 테스트 `hellray-confirm-gate.test.mjs` 25/25 PASS, UIUX `inventory-focus.test.mjs` 21/21 PASS (읽기 실행, 미수정).

## B. UIUX inventory-focus 후보 (숨김/분리 위험)

| # | 검사 | 결과 |
|---|---|---|
| B1 | 소스 해시 drift 탐지 | PASS — **drift 있음**(기록 `2026-10-01T15:32:07Z` 이후 game·easy 변경됨) |
| B2 | `connectCandidate` 앵커 **13개 전부 현재 game.html에 정확히 1회** → 치환 적용 가능 | PASS |
| B3 | 실제 소스에 `_invClearHover`(L47967)·`renderInv`(L48384)·`_invRenderDetail`·`closeAllPanels` 존재 | PASS |
| B4 | `usable()`가 `[hidden]`/`[aria-hidden]`/비연결/disabled 노드 거부(분리·숨김 포커스 방지) | PASS |
| B5 | `missing()`이 detail 정리 시 `inv-side-compare`/`inv-hover-preview` 제거 + 비교 플로트 숨김 + 안전 노드로 포커스 복귀 | PASS |

### B 핵심 발견
- UIUX 후보의 숨김/분리 위험 가드는 유효: 분리/숨김 노드에는 포커스를 두지 않고(`usable`), 상세가 사라지면(`missing`) detail을 상태 힌트로 교체·잔상 클래스 제거·플로트 숨김 후 `anchor→invClose` 폴백으로 포커스를 복구한다.
- **단, 기록 해시 drift**: 후보의 `inventory-focus-source-hashes.json`은 변경 전 스냅샷 기준이다. 앵커 13개는 현재 소스에 그대로 1회씩 있어 적용 자체는 가능하나, **root 적용 전 해시 재검증 권장**.
- UIUX 담당 소유 `inventory-dom-*`는 읽기만 했고 수정하지 않았다.

## 판정 요약
- hellRay: 게이트 로직은 7경계(MP100/99·스택1/0·동시취소·클릭소비·조준후 자원변동·합체·실패부작용0) 독립 검증 통과. **현재 소스에 이미 적용됨 → 재적용 금지.**
- UIUX: 숨김/분리 가드 유효·앵커 정합. **적용 전 소스 해시 재검증** 권장(현 drift).

## 미실행 / 한계
- game.html·game-easy-test.html·공유 test·docs·타팀 파일(SKILL/*, UIUX/inventory-dom-*) 수정 0.
- 신규 측정·게임·브라우저·서버·빌드·에셋·계측 0. Git/queue/새세션/에이전트 0. 사용자탭 1573846373 미접촉.
- 실제 화면·실브라우저 포커스 거동은 검증 범위 밖(최소 DOM 스텁 기반 불변 검사). 성능 해결 주장 없음.

## 인계 (한 건 완료)
- root: hellRay는 이미 양쪽 적용 완료 상태 — **재적용하지 말 것**. 커밋/반영은 root 소유.
- UIUX 담당: inventory-focus 후보 적용 전 소스 해시 재검증 후 `inventory-dom-*`에서 진행.

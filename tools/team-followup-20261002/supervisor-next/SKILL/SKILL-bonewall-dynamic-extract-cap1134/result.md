# SKILL-bonewall-dynamic-extract-cap1134 — boneWall `_bwAiming` 포커스 취소 (동적 소스추출 검증)

**감독 STATE `nextByRole.SKILL` 수행.** boneWall `_bwAiming`의 blur/hidden 포커스 취소 경계를,
이전 hand-copy 하니스가 아니라 **양판(game.html·game-easy-test.html)의 실제 `_clearHeldInput`/aim
caller/`fireBoneWall` 바이트를 디스크에서 동적 추출·SHA-256 해시·`new Function` 실행**으로 검증했다.
이로써 hand-copy 하니스가 남긴 **source-extraction 회귀 Gate를 닫는다**.

- 저장 epoch: `capacity-after-8c317a73-1134` (allowNewOwnedFiles=true 인수). **이 저장은 이미 확보한
  근거의 인계이며 재실행이 아니다** — 아래 "원 stdout"은 용량 해제 전 스크래치패드 실행의 원문.
- `productionApplied=false`, `runtimeAccepted=false`. **source/fixture PASS ≠ native/시각/청취/실게임
  PASS** — boneWall은 특히 **게임패드** 입력 실게임 Gate 필요(미검수).
- mortar/storm/hellRay 기존검사 **반복 0**. 비용/자원 정책 변경 **0**. 이 건은 hb1946의 boneWall
  hand-copy 결과를 **동적 실제 바이트 실행으로 재입증 + provenance Gate 해소**(기능 반복이 아니라
  소스 출처 검증이 새 목적).

---

## 1. 명령 · Node · 시각

- Node: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`
- 분석 실행(스크래치패드, 용량 해제 전): `extract.mjs`(추출·해시·parity) → `run_dynamic.mjs`(동적
  실행), 둘 다 **exit 0**.
- 저장 시각: 2026-10-02T11:40Z / 20:40 KST. `checks.mjs`는 두 스크립트를 합친 재현 아티팩트
  (SHA-256 `082f3df3688a474425630e8cf805859a74157823e0d5b4e47a00ff546505c3af`).

---

## 2. 원 stdout — 추출·해시·parity (extract 단계, 재실행 아님, 그대로 인계)

```
MAIN file 569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103
EASY file 7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e
clear  main 1fc97dca14701e9d645168f844779fca286bdcafc4741917261b4b39109dbb5f len 410 | easy 1fc97dca… len 410 | parity true
fireBW main 6c59ddc5977f6ca323f58bf1915c4dfbe76c8fc5c72bf2faf7d832f8d07adc1b len 922 | easy 6c59ddc5… len 922 | parity true
aimBW  main 43ace3658a92e0b7ccf7a798a9bcfb1b2ca1c069ee075df0b0f5a6ced0e29eab len 437 | easy 43ace365… len 437 | parity true
```

- **양판 byte-identical (parity=true) 확정:** `_clearHeldInput`(410B, `1fc97dca…`),
  `fireBoneWall`(922B, `6c59ddc5…`), boneWall aim 블록(437B, `43ace365…`).
- game.html 파일 SHA는 추출 시점 `569e8def…`(root WIP로 수시 변동, 이전 과제엔 `8b4653f3…` 등).
  **그러나 위 3개 슬라이스는 변동 중에도 양판 동일·안정** — 입력 수명 로직은 root WIP에 영향받지
  않았다. `checks.mjs` 재실행 시 `fileSha`는 현행값으로 갱신되며 slice SHA가 위와 같으면 동일 소스.

---

## 3. 원 stdout — 동적 실행 결과 (run_dynamic 단계, 재실행 아님)

```json
{
  "dynamicSource": true,
  "sliceSha": { "clear":"1fc97dca…", "fireBW":"6c59ddc5…", "aimBW":"43ace365…",
                "clearCandidate":"e5349553045eeecb2cea724cf9a065eeb9dba0eb022ccc13fb89f74a1af44ca5" },
  "parityBothBuilds": { "clear":true, "fireBW":true, "aimBW":true },
  "verdicts": { "CONTROL_EQUIV":"PASS", "CURRENT_DEFECT":"FAIL(결함 재현)", "CANDIDATE_FIX":"PASS" }
}
```

| 변형 / 시나리오 | aim clear후 | fired | MPΔ | 악의Δ | `_bwStk`Δ | 쿨`_bwRech` | LMB after | SFX / RNG |
|---|---|---|---|---|---|---|---|---|
| current / controlLMB | — | T | 0 | **12** | 1 | **1500** | 소비(false) | `[magic(3),skull_summon,shake(6)]` / 1 |
| candidate / controlLMB | — | T | 0 | 12 | 1 | 1500 | 소비(false) | **동일** / 1 |
| current / blurThenLMB | **true(sticky)** | **T** | 0 | **12** | 1 | **1500** | **소비(false)** | 3종 / 1 |
| candidate / blurThenLMB | **false(취소)** | **F** | 0 | **0** | **0** | **0** | **보존(true)** | [] / 0 |

- **CONTROL_EQUIV=PASS:** 조준 중 정상 LMB 설치가 current==candidate 완전 동일(악의-12·`_bwStk`-1·
  쿨1500·벽 1개·SFX·RNG1·LMB 소비).
- **CURRENT_DEFECT=FAIL:** blur 뒤 `_bwAiming` 잔존(sticky) → 복귀 후 평타 의도의 다음 LMB가 의도치
  않은 해골무덤 설치로 소비(악의-12·`_bwStk`-1·쿨1500, LMB가 평타로 못 감).
- **CANDIDATE_FIX=PASS:** 후보는 blur에서 `_bwAiming=false`로 조준만 취소 → 설치 0·악의/stk/쿨/RNG
  **불변**·LMB 보존(평타 등 정상 처리로 전달).

> **boneWall 한정 조건:** docs 395/406대로 KBM은 "키 즉발 설치"(`_bwAiming` 미사용)라 결함은 **게임
> 패드 조준 확정 모드에서만** 성립. (iceStorm·thunderStake는 hb1946에서 KBM·패드 공통으로 확인.)

---

## 4. 후보 (checks 안 결정적 변환 — 생산 적용 0)

추출한 **실제 `_clearHeldInput` 텍스트**(`1fc97dca…`)의 기존 guard `…P._msCharging=false}` 끝에
`;P._bwAiming=false`만 삽입한 결정적 변환(= `clearCandidate` `e5349553…`):

```js
// 실제 현행 guard:
if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false}
// 후보(+_bwAiming):
if(typeof P!=='undefined'&&P){…;P._msCharging=false;P._bwAiming=false}
```

- **불변:** MP/ST/충전(`_bwStk`)/CD(`_bwRech`)/벽 zone/숙련/RNG, 악의 비용(`_malCost`), 입력 배열,
  `_dashHold/_beamHold/_cutSkipHold`, 보호 2_3·패링·합체수치·키바인딩·스킬 공식.
- **가족 완결 라인(권고):** `_hrAiming`(hb1014)·`_isAiming`/`_tsAiming`(hb1946)와 함께 통합 시
  `…;P._hrAiming=false;P._isAiming=false;P._bwAiming=false;P._tsAiming=false`. `_ebAiming`은 미사용(제외).

---

## 5. docs 동기화 인계 (미적용 — root canonical)

| docs 파일·행 | old | new (반영안) |
|---|---|---|
| `docs/2_1 …/2_1 스킬관리+합체시스템.md:406` boneWall | "키 즉발 설치(KBM)…패드는 조준 후 확정" | 각주: "**패드 조준 확정 모드 한정** — `_bwAiming` 중 blur/hidden 뒤 조준 미취소 → 복귀 LMB가 의도치 않은 해골무덤 설치(악의-12·`_bwStk`-1·쿨1500). `_clearHeldInput`가 `_bwAiming` 미초기화. 후보 `_bwAiming=false`. **양판 동적추출 실행 재현**(slice SHA `43ace365…`, parity true). KBM 즉발은 `_bwAiming` 미사용이라 무관." |
| `docs/2_1 …/MALICE_STORM_FOCUS_CANCELLATION_20261002.md` 정본 | 조준 가족 미완결 | **가족 확장 권고:** hellRay/iceStorm/boneWall(패드)/thunderStake = "LMB edge 조준 설치형 → 합성 release 없음, 조준 잔존이 다음 클릭 가로채기". 완결 후보 4플래그. boneWall은 **동적추출로 provenance 해시(`1fc97dca`/`6c59ddc5`/`43ace365`) 검증**, 나머지는 hand-copy(회귀 Gate는 이 건으로 패턴 입증). |

---

## 6. 준수 · Gate · 다음

- **소유 2파일:** 이 `result.md` + `checks.mjs`. 이 epoch 저장 1회·2파일 한정 준수. 제출 원자료/
  TASK/기존 산출 불변. 다른 역할·타팀 WIP 불간섭.
- **미수행:** production·shared docs·Git(조회 포함)·사용자게임/save·삭제/이동·권한·설치·새세션·CLI.
  권한/모드 변경·Ask 응답대행 안 함.
- **Gate(미검수):** 실게임 창 focus/alt-tab, **게임패드 입력**(boneWall 진입 전제), 음향
  (skull_summon), 시각/GPU/맵 visual/배포 — QA/실게임.
- **blocker:** 없음. 조준-플래그 포커스 취소 가족(mortar/storm/hellRay/iceStorm/boneWall/thunderStake)
  은 이로써 **동적추출 provenance Gate까지 포함해 조사 완결**. 다음 독립 승인 업무는 감독 STATE
  `nextByRole.SKILL` 갱신 또는 새 capacity epoch에서 메모리로 이어가며, 추가 저장은 다음 epoch에 한다.

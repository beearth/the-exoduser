# SKILL-hellray-focus-cancellation-hb1014 — 참회(hellRay) 조준이 blur/hidden 뒤 남는 취소 경계

**한 건 완료.** 참회 조준 `_hrAiming`이 `_clearHeldInput`의 held clear에서 제외되어, 충전 중 창
blur/탭 hidden 뒤 복귀하면 **다음 LMB(평타 의도)가 의도치 않은 참회 설치로 가로채이는** 경계를
실제 소스 함수 전체 + 명시적 대역으로 재현하고, 최소 memory 후보와 정상 승인 control을 검수했다.

- **실제 defect 재현: 확인(FAIL)** / **최소 후보: 수정 확인(PASS)** / **정상 control: 동등(PASS)**
- `productionApplied=false`, `runtimeAccepted=false`. **source/fixture PASS ≠ 실게임/native/청취/GPU
  픽셀/맵 visual/배포 PASS.** 실입력 포커스·음향·시각·게임 Gate는 미검수(아래 §Gate).
- 이전 완료(mortar root 통합 / maliceStorm plain 4f7 통합·66 회귀)는 **재실행 0**. 이번은 새 대상만.

---

## 1. 소스 앵커 (본인 실제 Read 시점, Git 조회 없음)

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| Read/실행 시각 | 2026-10-02T10:46Z / 19:46 KST (exit 0) |
| `game.html` SHA-256 (본인 Read 시점 앵커) | `8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b` |
| `game-easy-test.html` SHA-256 | `50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057` |
| parent 제공 `6b865637` (이력 기준, currentHEAD 주장 없음) | 역사적 근거로만 보존 |
| `checks.mjs` SHA-256 (본인 소유 산출) | `1308eca603f4d9a5ee47a077c7e3dea40fb29ec9e6f99256fc03cff7259bb0bb` |
| 하니스 fragment self-hash | aim=`59667ce8…`, clearCur=`a8b5b47b…` |

**현행 game.html에서 직접 확인한 실제 심볼·행(이전 행힌트로 추측 안 함):**

| fragment | game.html 행 | 핵심 |
|---|---|---|
| hellRay 조준/발사 블록 | 35030–35061 | 발사 트리거 **`MBjust[0]`(LMB edge)**, 취소 `MBjust[2]||K['Escape']`, 발사 시 `P.mp-=100;P._hrStk--`, `G._fireZones.push({type:'hellRay'})`, `P._hrAiming=false` |
| router hellRay 진입/취소 | 31818–31820 | `P._hrAiming=true`(MP≥100·`_hrStk>0` 조건), 재입력/E로 토글 취소(31800, 31818) |
| `_clearHeldInput` | 12877–12885 | 12883 guard: `_beamHold/_mmAiming/_mmCharging/_msAiming/_msCharging` 취소(= mortar·storm **root 기통합**). **`_hrAiming` 미포함** → 참회 조준은 held clear에서 제외 |
| `_isFused`/`_r`/`EL` | 43007 / 12004 / 13838 | verbatim |

**결함 구조(mortar/storm과 다른 형):** hellRay는 **level 기반 합성 release가 아니라 LMB edge
(`MBjust[0]`) 발사**다. 그래서 `_clearHeldInput`가 `MBjust`를 비우면 **"즉시 유령발사"는 없다**.
그러나 `_hrAiming`이 **취소되지 않아 조준 모드가 blur/hidden을 관통**한다. 복귀 후 플레이어가
평타(공격)로 누른 **다음 LMB가 `if(P._hrAiming)` 블록의 `else if(MBjust[0])`에 먼저 소비**되어
의도치 않은 참회가 설치된다(MP-100·`_hrStk`-1·`G._fireZones` 추가·쿨 600).

> **참고:** 조준 모드 중 평타 차단 로직(31801 `else if(...P._hrAiming...){}`)이 있어, 조준이 남아
> 있는 한 그 LMB는 평타로도 못 가고 참회로만 소비된다 — 즉 "조준 잔존"이 입력 가로채기의 직접 원인.

---

## 2. source fragment / 대역 / 합성입력 (명시)

- **실제 source fragment (verbatim 실행):** hellRay 조준/발사 블록(35030–35061, elec 합체 분기 포함
  전문), `_clearHeldInput`(현행 + 후보 변형), `_isFused`, `_r`, `EL`.
- **대역(band):** `SFX.magic/playSample/addTxt/shake` = 호출 레코더; `magicRef/statInt/pMagicMul/
  pBeamMul/_skMul/_fuseMul` = `_hrDmg` 데미지 helper baseline 1 (**피해값은 결함 대상 아님, 비용
  가짜대입 아님**); `dst` = 거리 band; `Math.random` = 시드 PRNG(mulberry32 seed `0x5EED`)로 두
  변형 동일 스트림(호출/RNG 순서 결정적 대조); `mouse/VW/VH/G.cam` = 합성 조준 좌표.
- **합성입력:** `_hrAiming=true`(router 31820 진입), 그 뒤 `MBjust[0]=true`로 LMB 1회. 결함
  시나리오는 그 사이에 `_clearHeldInput`(blur) 삽입.
- **P baseline:** `skills={hellRay:1}`(Lv1, max 1충전), `_fused=null`(무합체 → 플레인 참회),
  `mp=200`, `_hrStk=1`(발사 시 0→`1충전 미만`이라 쿨 `_hrRech=600` **실제 engage**). 가짜 counter로
  계약 대체 안 함 — MP/_hrStk/쿨은 실제 소스 분기로 변동.

---

## 3. 대조 결과 (Node v24.15.0, exit 0)

| 변형 / 시나리오 | 입력 | `_hrAiming` clear후 / fired(참회) / MPΔ / `_hrStk`Δ / 쿨`_hrRech` / LMB(MBjust0)after / SFX / RNG | 판정 |
|---|---|---|---|
| **current / controlLMB** | 조준 중 정상 LMB | — / **T** / **100** / **1** / **600** / **소비(false)** / 3종 / 1 | 기준 |
| **candidate / controlLMB** | 동일 | — / T / 100 / 1 / 600 / 소비(false) / **동일** / 1 | **CONTROL_EQUIV=PASS** |
| **current / blurThenLMB** | 조준 중 blur→복귀 후 LMB(평타 의도) | **true(sticky)** / **T** / **100** / **1** / **600** / **소비(false)** / 3종 / 1 | **CURRENT_DEFECT=FAIL** |
| **candidate / blurThenLMB** | 동일 + 후보 `_clearHeldInput` | **false(취소)** / **F** / **0** / **0** / **0** / **보존(true)** / [] / 0 | **CANDIDATE_FIX=PASS** |

### 관측 결론
1. **정상 승인 control 동등(실측):** 조준 중 LMB → 참회 설치가 current==candidate 완전 동일
   (MP-100·`_hrStk`-1·zone 1개·쿨 600·SFX 3종·RNG 1·LMB 소비). 후보가 정상 발사 계약을 **불변**.
2. **현행 결함 실재:** blur 후 `_hrAiming` **잔존(sticky)** → 복귀 후 평타 의도의 LMB가 **참회로
   소비**(MBjust0 false), MP-100·`_hrStk`-1·zone 설치·쿨 600 발생. 평타로 못 간다.
3. **후보 수정 확인:** 후보는 blur에서 `_hrAiming=false`로 조준만 취소 → `if(P._hrAiming)` 미진입 →
   **LMB 미소비(MBjust0 true 보존, 평타 등 정상 처리로 전달)**, 참회 미설치, **MP/`_hrStk`/쿨/zone/
   RNG 전부 불변(추가 0)**.

---

## 4. 최소 memory 후보 (checks 안 변환 — 생산 적용 0, root 통합 대기)

현행 `_clearHeldInput` 12883의 **기존 P guard 안**에 참회 aim 플래그 하나만 추가:

```js
// 현행:
if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false}
// 후보(+1):
if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false;P._hrAiming=false}
```

- 추가분은 **`P._hrAiming=false` 단 하나(aim 취소)**. `_mm/_ms`는 root 기통합(본인 미수정).
- **불변:** MP/ST/충전/`_hrStk`/CD(`_hrRech`)/zone/숙련(`_addSkProf`)/RNG, 입력 배열,
  `_dashHold/_beamHold/_cutSkipHold`, 참링·합체수치, 보호 2_3, 키바인딩, 스킬 공식.
- 입력 모델을 keyup 엣지로 교체하거나 pause/death/revive/패드/stage/다른 조준스킬로 확장 **안 함**.
- **root 소유 제외:** root가 진행 중인 `_skUnclick`/스킬카드 minus 작업은 재현·소유하지 않음(중복 0).
- **잔여 동형 대상(참고, 본 건 범위 외):** `_bwAiming`(boneWall)·`_tsAiming`(thunderStake)·
  `_isAiming`(iceStorm)·`_ebAiming`도 13463/31801에서 조준군으로 묶이며 `_clearHeldInput` 미포함 —
  LMB edge 발사형이면 동일한 "조준 잔존→다음 클릭 가로채기" 경계 가능성. **별건 검토 권고(미검증).**

---

## 5. docs 동기화 인계 (미적용 — root canonical 처리. rg 1회 수행)

rg(`hellRay|참회|_hrAiming|_hrStk`) 결과, **참회 패밀리 정본 문서 부재**(mortar/storm은
`MALICE_STORM_FOCUS_CANCELLATION_20261002.md`로 정본화돼 있음). hellRay 조작 계약(229/408행)에
**포커스 취소 경계 미기재**.

| docs 파일·행 | old (현행) | new (반영안, 미적용) |
|---|---|---|
| `docs/2_1 …/2_1 스킬관리+합체시스템.md:229` | hellRay "히든, 에너지 쐐기 설치, 회전+뎀" | 각주: "**조준 모드 LMB 설치형.** 조준(`_hrAiming`) 중 창 blur·visibilitychange(hidden) 뒤 **조준이 취소되지 않아**, 복귀 후 평타 의도의 **다음 LMB가 참회 설치로 소비**(MP-100·`_hrStk`-1·zone·쿨 600). `_clearHeldInput`가 `MBjust`만 비우고 `_hrAiming` 미초기화. 후보: guard에 `_hrAiming=false` 추가(source fixture 재현). 미적용." |
| `docs/2_1 …/2_1 스킬관리+합체시스템.md:408` | hellRay 상세표 "MP 100, 범위 200+(Lv-1)×22" | 동일 포커스 취소 경계 1줄 보강(수치·설계 변경 아님). |
| `docs/2_1 …/MALICE_STORM_FOCUS_CANCELLATION_20261002.md` (mortar/storm 정본) | 참회 미포함 | **hellRay 항목 추가 권고:** "LMB edge 발사형 → 합성 release는 없으나 **조준 잔존이 다음 클릭을 가로채는** 변형 결함. 후보 `_hrAiming=false`. mortar/storm과 같은 포커스 취소 패밀리." + 잔여 동형(`_bwAiming/_tsAiming/_isAiming/_ebAiming`) 미검토 TODO. |

> 정확 old/new·값·함수·구현상태는 root가 순차 docs 동기화. 본인 공유 docs 수정 0. 보호 2_3·Q전용
> blackBean 패링·어택티켓 금지·LOCK/TBD·확정수치 **보존**. 새 정책 임의 확정 안 함.

---

## 6. 실행 영수증 · 실제품 Gate · 블로커

- **실행 영수증:** `node v24.15.0` → `checks.mjs` 1회, **exit 0**, 하니스 실패/예외 없음. 판정
  CONTROL_EQUIV=PASS / CURRENT_DEFECT=FAIL / CANDIDATE_FIX=PASS. (전체 matrix JSON은 `checks.mjs`
  재실행으로 재현 가능 — 결정적 seed `0x5EED`.)
- **소유 파일(2개):** `result.md`(이 파일, evidence/해시/영수증 포함), `checks.mjs`. 별도 evidence/
  log/fixture/patch/backup 추가 0.
- **미수행:** production·공유docs·기존tests·타팀 산출·Git(조회 포함 0)·실게임/세이브·서버·빌드·
  audio 장치·이미지 생성/교체·권한/인증/설치/결제/게시·삭제/이동/cleanup·팀외 메시지·새 세션/팀/
  하위 에이전트. 이전 검사/완료/지시 재실행·합산.
- **실제품 Gate(미검수, UNKNOWN):** 실게임 창 focus/alt-tab 타이밍, 실제 입력장치(KBM/패드), 음향
  (repentance/electric_storm), 시각/GPU 픽셀, 맵 visual, 배포 — 전부 QA/실게임 Gate. **source/fixture
  PASS를 이들로 치환하지 않음.**
- **진짜 blocker/필수 결정:** 없음(독립 소스 구현 완료). 후보 통합·canonical 반영은 감독→root
  순차. `_bwAiming/_tsAiming/_isAiming/_ebAiming` 동형 여부는 **별도 승인 건**(자체 배정 안 함).

이 한 건만 수행했고, 자체 다음 건·기능·정책 확장은 하지 않았다.

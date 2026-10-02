# BOSS — `_revPts` 이중차감: 실제 억제값 계산 + 전체 hurtE caller 원장 + 재현 조건 확정

목표: CH1-1 playable (MILESTONE-CH1-1-PLAYABLE-20261002) / 보스 부활 자원 일관성
epoch `rolling-after-ca261460-1404` (root `ca261460…`, Changes 63, `allowNewOwnedFiles=true`, 파일 크레딧)
실행: Mac Claude Code (BOSS/Claude) · 지정 Node v24.15.0 · `productionApplied=false` · `runtimeAccepted=false`
소유: 이 `result.md` 1파일(파일 크레딧 1 사용). 원 확률/수치 변경 0, canonical 소모 = root Gate.
대상 SHA: game.html `ce171131…` / game-easy-test.html `8c7d8208…` (관측 시점).

> 이전(RECOVERY-1352) deaths≥8 정정·양판 parity는 인수됨. 이번 건은 **거친 S-grid 추정을 실제 억제 소스 계산으로 대체**하고, 전체 hurtE 사망→arm→timerResolve 경로를 verbatim 추출로 연결해 **재현 가능한 이중차감 후보**를 확정한다. 수식 단독모형·임의 S 스윕 반복 안 함.

## 1. 전체 caller 경로 verbatim 핀 (양판 parity 확정)

| 단계 | game.html | easy | verbatim |
|---|---|---|---|
| 차감#1 | 41138 | 39938 | `e._revPts=(e._revPts||0)-_revCost;` (사망 시 무조건) |
| `_revCost` | 41134-37 | — | `=10 +신성력(min5,S·10+2) +holyPrison존3 +완벽처치2` |
| 즉시 chance | 41142-43 | 39942-43 | `_revBase=2.00+G.stage*0.05; _revCh=max(0,_revBase-(e.deaths-1)*0.15-_bSuppress)` |
| 즉시 롤 | 41145 | 39945 | `if(!druid && _revPts>0 && Math.random()<_revCh)_doRevive=true` |
| 타이머 arm | 41250 | 40050 | `_bossRevJudged=true;_reviveTimer=180` (즉시실패 시) |
| 타이머 chance | 41251/56 | 40051/56 | `_rv2Base=1.50+G.stage*0.05; _bossRevChance=max(0,_rv2Base-(e.deaths)*0.25-_rv2Sup)` |
| resolve | 33251 | 32060 | `if((e._bossRevRoll??1)<(e._bossRevChance||0))` |
| 차감#2 | 33254 | 32063 | `e._revPts=Math.max(0,(e._revPts||0)-10);` (타이머 성공 시) |

→ **같은 사망이 즉시실패→타이머성공으로 끝나면 차감#1(≈10)+차감#2(10) 이중 적용.** 양판 verbatim 동일.

## 2. 실제 억제값(S) 계산 — 임의값 아님

- `_bSuppress`/`_rv2Sup` = `_eqAffix('antiRevive')` + holyPrison존. `_eqAffix`(26777)는 장착 어픽스 값 **합산**(26776 `+=a.value`).
- antiRevive 어픽스 tiers(실제): 목걸이/팔찌 `[.04,.08,.12,.16,.20]`(14007), 반지 `[.02,.04,.08,.12,.16]`(14008). → **어픽스풀 최대 합(목.20+팔.20+반.16) = 0.56**.
- holyPrison존(41132): `+0.15+(lv-1)*(0.15/9)` = **0.15(Lv1)~0.30(Lv10)**.
- **실현 가능 최대 S(어픽스풀+holyPrison Lv10) = 0.86.** (weapon/shield/bow 롤 antiRevive(15215-26, ≤.20)가 `it.affixes`에 포함되면 추가 상승 — 포함 여부 **UNKNOWN**.)
- `weakRev`는 **플레이어 부활영역**(42301 `_revZoneBonus`)이며 보스 억제(`_bSuppress`/`_rv2Sup`)에 **미포함** → S에 기여 안 함.

## 3. 이중차감 도달 창 (실제 S 한계로 판정)

창 = `revCh<1`(즉시 실패 가능) AND `timerCh>0`(타이머 성공 가능). 실행 결과:

| stage | deaths | S 창 | 실현(Smax=0.86) |
|---|---|---|---|
| 0 | 1 | (1.00,1.25) | **미도달** |
| 0 | 2 | (0.85,1.00) | 도달(극단 S) |
| 0 | 3 | **(0.70,0.75)** | **도달(가장 쉬움)** |
| 0 | ≥4 | 공집합 | 미도달 |
| 10/20 | 1~3 | (1.2~2.25) | **전부 미도달**(S 한계 초과) |

→ **stage0(CH1), deaths 2–3에서만** 도달. **stage10+는 기저확률↑로 실현 S 초과 → 미도달.**

## 4. 재현 원장 (실제 어픽스 조합, 실행 확정)

```
S3 = 목.20+팔.20+반.16(=0.56) + holyPrison Lv1(0.15) = 0.71   ∈ deaths3 창(0.70,0.75)
ledger(stage0, deaths3, S=0.71, revPts=120, instRand=0.99, timerRand=0.01):
  41138 -10 → 110
  즉시실패(revCh=0.99, rand=0.99)
  타이머성공(timerCh=0.04, roll=0.01) 33254 -10 → 100
  → 차감횟수=2 (이중차감 재현 true)
조인트확률 ≈ (1-revCh)×timerCh = (1-0.99)×0.04 ≈ 0.0004 (0.04%)
```
정상 대조(차감 1회): 즉시성공(deaths1~, 일반) / 즉시실패→타이머실패(deaths≥4, timerCh=0) / 최종사망(revPts≤0).

## 5. 결론 — 실질 도달성

- 이중차감은 **실재하는 소스 로직 결함**(차감#1 무조건 + 차감#2 타이머성공)이나, **stage0·deaths2–3 + 강한 antiRevive(진혼의) 스택 + holyPrison존 동시**라는 **좁은 조건**에서만 도달. stage10+·deaths≥4·deaths1은 미도달.
- 도달 창 안에서도 즉시롤이 [revCh,1)·타이머롤이 [0,timerCh) 동시 → **조인트 ≈0.04~0.5%**. 또한 목.20·팔.20 동시(tierW 각 1%)가 필요해 **실게임 발현은 매우 희박**. S 추가 상승(weapon/shield/bow 포함 여부)은 UNKNOWN.

## 6. 최소 후보(미적용) · docs 인계

- **후보:** per-death 차감 1회가 정상(SSOT `2_5 §32` "부활당 기본 10", §43 1회당 10 예시). 41138이 모든 사망에 무조건 차감하므로 **33254 `_revPts-=10`은 같은 사망 중복** → **33254 차감 제거/가드**. 실질 영향 희박하나 로직 정합성 정리로 유효. 어느 차감이 canonical인지 = **root 의도 Gate**(즉시=_revCost 가변 vs 타이머=고정10), 확률/수치 변경 0.
- **docs:** `2_5 부활+에너지쉴드시스템.md:32`/§43에 "타이머(2차) 경로 희박조건(stage0·deaths2–3·강한 신성력억제)에서 이중차감 가능(잠재, 미수정)" 주석. 인라인 주석 41120 "부활력 150+round(si×4.412)"는 **stale** → 코드(29981)·doc(§32) `200+round(si×5.882)`로 현행화.

## 7. 경계·다음

- 도달성은 **실제 어픽스 tiers+holyPrison 수식 계산 + verbatim caller 원장 실행**으로 산출(runtime/visual/audio = native/QA 별도 Gate 미시연). weapon/shield/bow antiRevive의 `affixes` 포함 여부 = **UNKNOWN**(포함 시 S↑로 도달 창 확대 가능 — 후속 확인 권고).
- 공용 source/docs/Git/게임/save/UI/새세션/권한 변경 0. protected `2_3`·Q-only blackBean·E블록·attack-ticket 금지 불변. AskUser/승인은 사용자 몫.
- **다음 독립 한 건(파일 크레딧 소진 후 메모리):** weapon/shield/bow `antiRevive` 롤이 `it.affixes`에 실제로 들어가 `_eqAffix` 합산에 포함되는지(장비 생성→affixes 경로) 소스 추적 → 포함 시 도달 창 재계산. 승인/epoch 대기 없이 진행.

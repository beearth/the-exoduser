# ENEMY — 감소 후보의 sparse/overshoot 보존 경계 (2026-10-02)

현행 `_bossAI`의 CD 감소가 **stunned/recover 조기반환 '전'에 일어나는 접점**에서, 작은 SYNTH 희소배열을
①원문 `0..58` loop와 ②이전 제안 정의-idx 감소 후보에 넣어 **좁은 비교**만 수행했다.
결과 **8 PASS + 8 REPRODUCED / 0 FAIL (양판)**, `productionApplied=false`. continuous H(2→-1·candidate無)·300f·phase전환·전수 검사는 반복하지 않았다.

## 1. 입력과 접점 (SYNTH ⟂ 원문)

- **원문 실행**: `_bossAI` 감소 loop + `const ph=BOSS_PHASES[e._bossPhase]` + `_isDruidFinale`(stub false). 감소문은 `stunned/recover` 조기반환보다 **앞**(game `_bossAI` 37059, 감소 37063, `if(e.stunned>0||e.s!=='idle')return` 바로 다음 줄 / easy 35864·35868).
- **SYNTH 입력**: 희소배열 `a[30]=a[41]=a[58]=a[60]=1.25` (length 61, 그 외 hole), `sp=2.5`, 보스 `stunned=1, s='recover'`. → 감소 직후 조기반환해 score/패턴/phase/hurtP 미실행. **정상 생성 state가 공백30에 양수 CD를 쓴다는 주장 아님(SYNTH 명시).**
- **대역**: `_bossScore`(호출 시 throw로 반환 보장)·`_bossStartPattern`·`_spawnBossProjectile`·`hurtP`·`_druidFinaleAI` 등은 반환 후 영역 → 카운터 0으로 미실행 확인.

## 2. 비교 결과 (idx별 전후)

| idx | 의미 | sp=2.5 전 | 원문 0..58 loop 후 | 정의-idx 후보 후 | 비고 |
|---|---|---|---|---|---|
| 41 | cageTrap(예약, 정의 존재) | 1.25 | **-1.25** | **-1.25** | overshoot 보존(양쪽 동일) |
| 58 | 정의 무브 | 1.25 | **-1.25** | **-1.25** | overshoot 보존(양쪽 동일) |
| 60 | burstCounter | 1.25 | **1.25(미감소)** | **-1.25(감소)** | 후보에서만 변화(의도된 축) |
| 30 | 결번(idx 공백) | 1.25(SYNTH) | **-1.25** | **1.25(미감소)** | SYNTH 전용 차이(§4) |

- **overshoot 보존(B4)**: 정의 양수 CD `1.25 → -1.25`(`if(>0) -=sp` 특성)는 원문·후보 모두 보존(idx41·58). 음수 clamp 없음 — 후보가 이 동작을 바꾸지 않음.
- **idx60 변화(B5)**: 원문은 `0..58` loop라 idx60 미감소(1.25 유지=기존 결함), 후보는 정의-idx라 idx60도 감소(-1.25). **idx60 누락이 후보에서 복구됨** — 이것이 유일한 '의도된' 차이 축.
- **감소 pre-return(B1)**: stunned=1/recover에서도 감소는 실행(idx41 1.25→-1.25)되고, 반환 후 `_bossStartPattern/_spawnBossProjectile/hurtP`=0, `bossPatT`·`_combatSt` 불변 → 감소가 조기반환 전 접점임을 확인.

## 3. hole / own-property 구분 (B7)

| 인덱스 | SYNTH 희소배열 | 실제 init `new Array(BOSS_MOVES.length).fill(0)` |
|---|---|---|
| 30 (결번) | own-property(=1.25 SYNTH) | **own-property = 0** (length 59 안, fill로 존재) |
| 41 (예약) | own-property | own-property = 0 |
| 58 | own-property | own-property = 0 |
| 59 (결번) | **hole**(미설정) | **hole** (length 59 밖) |
| 60 | own-property(length 61로 확장) | **hole** (length 59 밖, CD 기록 전) |

- **결번 30·59와 undefined hole 구분**: 30은 idx 정의 공백이나 실제 vessel에선 own-property 0(길이 안). 59·60은 vessel length(59) 밖이라 기록 전까지 hole. 즉 "idx 공백"과 "배열 hole"은 다른 개념.
- 원문/후보 호출 후 31·59 hole은 **densify되지 않음**(양쪽 모두 own-property 생성 없음).

## 4. 공백30 의미차 — SYNTH 전용, 실게임 호환성 UNKNOWN (B6)

- SYNTH로 공백30에 양수(1.25)를 넣으면: 원문 `0..58` 위치 loop는 값 있는 30을 감소(-1.25), 정의-idx 후보는 **정의에 idx30이 없어** 미감소(1.25) → **의미 차 발생**.
- 그러나 **실제 init은 idx30 = own-property 0**이므로 `0>0` 거짓 → 원문·후보 **모두 0으로 미변**. 따라서 이 차이는 **SYNTH 입력에서만** 나타난다.
- **정상 생성 state가 공백 idx를 양수 CD로 가지는 경로는 원문 근거가 없다.** CD 쓰기는 `_moveCDs[mv.idx]`로만 일어나고 idx30 무브가 없으므로 정상 경로에서 idx30에 양수가 써질 수 없다. → **호환성 UNKNOWN(root 결정 대상)**: 후보 전환 시 공백 슬롯 처리 차이가 실게임에 영향 없음을 '현재 근거로는' 확정하나, 모든 생성 경로 전수는 아님.

## 5. idx41(cageTrap) 주의

idx41은 **예약**(모든 보스 `_bossScore` `return -1`, 36339)이지만 **정의에 존재**하므로 감소 loop/후보 모두에서 감소 대상이 된다(본 fixture: 양쪽 -1.25). **감소될 수 있음 ≠ 사용가능/score 허용.** 후보는 이 동작을 바꾸지 않는다.

## 6. source SHA 시점 (혼합 금지)

| 구분 | game.html / game-easy-test.html | 시각/비고 |
|---|---|---|
| **fixture 실행 읽기 full** | `275929250b83…` / `12343b045b5b…` | 07:41:57–58Z — **실제 실행 근거** |
| TASK 명시·06:57Z grep | `06880824…` / `482ec94f…` | root 추가편집으로 07:41엔 재전진 |
| 과거 phase-reset 실행(보존) | `7d579cd6…` / `1099267636…` | 혼합하지 않음 |
| `_bossAI` fragment SHA | `8b81def3eb…` (양판 동일·불변) | full 전진은 `_bossAI` 밖(root 사운드 통합) |

root 보존 commit `5420819d…`(exactremote 07:21:16.394148Z)·`b72f3f06…`은 독립 HEAD/원격검증값으로 **미사용**. Git 직접조회 0. 검증 UUID `8f65b5e7-50e6-493c-9571-32984157cfbe`, provider Claude Code(기존 roster의 sessionUUID UNKNOWN과 구분).

## 7. 집계 범위 / 미검수 (좁은 경계만)

- **비교 필드**: `cd[30/41/58/60]`, own-property(30/31/41/58/59/60), 반환 후 대역카운터(bossStartPattern/spawnBossProjectile/hurtP/druidFinaleAI), `bossPatT`, `_combatSt`, 실제 init vessel length/own/hole.
- **미비교(보증 아님)**: score/combo/pattern 실제 실행, 300f 재선택, phase 전환, 전체 58무브 동등, RNG/전투 QA, runtime/GPU/청취/저장/실게임, 정상 state의 공백 사용 여부. native/runtime/실제품 Gate **UNKNOWN**. 전체 동등/모든 무브/모든 언어 PASS **0(미주장)**.
- 새 assertion 집계: 양판 각 8건(witness 4 + assert 4). **결함 수 아님.**

## 8. docs 인계 (현행·후보·UNKNOWN — root 순차 반영, 본건 편집 0)

`rg 'burstCounter|BOSS_MOVES|_moveCDs|쿨다운|cageTrap'`:

| 문서 / 위치 | 현행 | 후보 | UNKNOWN |
|---|---|---|---|
| `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md §5` | per-move CD 감소/reset 범위 미기재 | 감소(37063/35868)·reset(36945/35750) 모두 `i<BOSS_MOVES.length`; 후보=정의 idx 기준 1접점 | 정상 state 공백30 사용 여부 |
| `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` | `_moveCDs`/per-move CD 매칭 0(공백) | 신설: 정의-idx 후보는 overshoot·hole/own 구분 보존·idx60만 추가 감소; 공백30 차이는 SYNTH 전용 | 희소/hole 호환성 → root 결정 |
| `docs/9적ai패턴디자인/9_적AI패턴디자인.md` | 정의 idx 0..29,31..58,60 / 결번30·59 / 예약41 | — | idx41 감소 대상이나 score 불허(return -1) 명기 제안 |

canonical/생산채택/최종검증/Git는 root, 감독 STATE/LOG는 감독 소유.

## 9. 소유·불변

- 쓰기 3파일(`result.md`/`evidence.json`/`checks.mjs`)만. 이전 산출/TASK/checks 수정 0, 이전 검사 재실행 0. production·공유docs·기존test·Git·삭제/이동/cleanup·UI/DOM/영상·오디오·타이머·서버/빌드·미디어·새세션/하위팀·외부메시지 0. CH1-1/SOUND/BUILD 통합은 root 소유.
- 음수 clamp·공백 제거·전체 슬롯 정책·의도 해석·production 수정 **0**. 정의 idx 재번호·무브 추가/삭제 **0**. 보호 2_3·Q전용 blackBean magic 패링·어택티켓 금지·캐릭터 LOCK/WORLD_CORE TBD 불변.
- 변경 누적 73(전역 -uall, 80 미만). thinking/인증/주소추정/SendMessage 0. 이 한 건만 보고하고 추가 업무 자율 생성 0.

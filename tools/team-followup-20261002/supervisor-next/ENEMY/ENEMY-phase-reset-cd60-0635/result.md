# ENEMY 후속 — 실제 페이즈 전환(phase1→2)의 idx60 reset 경계 (2026-10-02)

실제 양판에서 `_bossPhaseCheck`·`BOSS_PHASES`·`BOSS_MOVES`·`_bossAI`·`_bossScore`를 원문 추출하여,
**"직전 phase1에서 실제 `_bossAI` 선택 1회로 CD60 기록 → HP 임계값 합성 → 실제 `_bossPhaseCheck` 호출"** 흐름을 실행했다.
결과 **8 PASS + 6 REPRODUCED / 0 FAIL (양판)**, `productionApplied=false`.
**source fixture PASS ≠ runtime/visual/실게임 전환·재공격 PASS.** 이전(continuous) A~I·300f·격리 reset-loop 검사는 반복하지 않았다.

## 1. 판정 — CONFIRMED: 전환 reset이 idx60 제외

실제 `_bossPhaseCheck`(phase1→2)가 수행하는 per-move CD reset(`for i<BOSS_MOVES.length=59` → `game.html:36945 / game-easy-test.html:35750`)은 **idx60(burstCounter)을 건드리지 않는다.** 전환 전 실제 `_bossAI` 선택으로 기록된 `_moveCDs[60]=64`가 전환 후에도 **생존**했다(P2). 정상 idx(13)는 0으로 reset. 최소 후보(reset을 정의 idx 기준으로)에서는 idx60도 reset(P4).

## 2. source SHA 시점 (root 수정중 — 역사값과 구분)

| 구분 | 값 |
|---|---|
| **본 과제 실제 읽기시점(full)** | game.html `7d579cd6…de5d27c3` · game-easy-test.html `1099267636…` |
| 역사: continuous 최종 | `2e45ee0e` / `3e5969ca` |
| 역사: 감독 evidence 실행근거 | `dc711864…` / `1f139e0c…` |
| 역사: root 06:10 push 보고 | `b72f3f06…` (독립 현재HEAD 아님, 원격검증값으로 미사용) |

Git 직접조회 없음. `_bossPhaseCheck` 36922(game)/35727(easy), reset문 36945/35750, `_bossAI` 선택·쓰기 경로는 continuous 인수분과 동일 구조임을 실행으로 재확인. (fragment/전체 SHA·행은 evidence.json)

## 3. 추적표 — 입력 순서 / 최종 phase·HP / idx60 / 정상 idx / boss 상태 / 부수 호출

| 케이스 | 입력 | phase | hp | idx60 | idx13 | s / revive / atk | 부수호출 | 판정 |
|---|---|---|---|---|---|---|---|---|
| **P2 현행 전환** | 실제 선택(CD60=64) → hp=mhp·0.50 → 실제 `_bossPhaseCheck` | 1→**2** | 회복(mhp·0.60) | **64 생존** | 0 reset | recover / 90 / ×1.3 | 빨간콩 spawn·충격파 hurtP 발생 | REPRODUCED |
| P3 전환없음 | hp=mhp·0.70 (`_bp1<=phase1`) | 1(불변) | 불변 | 64 불변 | 36 불변 | idle(불변) | 없음(조기 return) | REPRODUCED |
| **P4 후보 전환** | 동일 전환, reset만 idx기준 | 1→2 | 회복 | **0 reset** | 0 reset | recover / 90 / ×1.3 | 동일 | REPRODUCED |

- **CD60 기록**은 전환 전 실제 `_bossAI` 선택 1회(원문 `_moveCDs[bestMv.idx]=bestMv.cd*ph.cdM`, phase1 cdM 0.4 → 160×0.4=64). 직접 가짜대입 아님.
- **idx13=36**은 SYNTH 주입(정상 idx가 reset 범위 안임을 보이는 대조용, 표시).

## 4. 차이 한정 (P5) — CD60 reset에만 국한

현행 vs 후보 전환 결과에서 **idx60 CD만** 다르고(64 vs 0), 그 외는 전부 동일: `phase, hp, atk, speed, maxPoise, bossPatCd, reviveIframes, stunned, s, bossPatT, 빨간콩 spawn 횟수, 충격파 hurtP 횟수`. 후보는 reset문 1줄만 바꾸며 임계값/HP회복/스탯/텔레포트/충격파/드루이드 피날레/parry는 불변(P7: 역치환 시 원문과 완전 동일 + 임계값·`atk*1.3`·`reviveIframes=90` 식 존재 확인).

## 5. 전환 직후 CD gate ⟂ 패턴상태/무브허용 분리 (P6)

전환 직후 burstCounter를 못 쓰는 이유는 **두 독립 조건**:
- **패턴상태**: `e.s='recover'`(전환이 설정) → `_bossAI`는 `e.s!=='idle'`이면 선택 자체를 안 함. 현행·후보 **동일**.
- **CD gate**: `_bossScore`의 `_moveCDs[mv.idx]>0 → 0`. 현행은 `[60]=64>0` → **0(차단)**, 후보는 `[60]=0` → **통과(>0 아님)**.

즉 패턴상태 복귀(recover→idle) 후를 가정하면, 현행은 CD gate가 계속 burstCounter를 막고(영구), 후보는 phase2 무브셋에 burstCounter가 포함되어 재선택 가능해진다. CD gate 결과는 패턴상태·무브허용(moveset)과 분리해 보고한다.

## 6. 감소(continuous)와 reset(본건)의 관계 — root 인계

| 위치 | 함수 / 행 | 범위 | idx60 처리 | 후보 |
|---|---|---|---|---|
| per-move CD **감소** | `_bossAI` 37031/35834 (continuous 과제) | `for i<BOSS_MOVES.length` | 미감소 → 영구고정 | 감소를 정의 idx 기준으로 |
| per-move CD **reset**(페이즈 전환) | `_bossPhaseCheck` 36945/35750 (**본건**) | `for i<BOSS_MOVES.length` | 미초기화 → 전환서도 생존 | reset을 정의 idx 기준으로 |

**완전 복구는 두 곳 모두** 정의 idx 기준이어야 한다. 본건은 reset 경계만 실제 전환으로 확인했고, 감소는 continuous/ENEMY 인계분이다. **최종 통합 수정·Git는 root 소유.** 설계 반복형/1회성은 여전히 **UNKNOWN**(문서 부재), production 미적용.

## 7. docs 정정 인계 (root 순차 반영 — 본건 공유docs 편집 0)

`rg '페이즈 전환|_bossPhaseCheck|reset|_moveCDs|쿨다운|cageTrap' docs`:

| 문서 / 위치 | 현행 | 인계 문안 |
|---|---|---|
| `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` §5 "전환 시 처리 순서" 4번(162행) | `4 \| 상태 초기화 — stunned=0, s='recover', 콤보/딜레이 리셋` (**per-move CD reset 누락**) | 보강: `… 콤보/딜레이 리셋, per-move CD reset '_moveCDs[i]=0' for i<BOSS_MOVES.length(=59)`. 현행은 burstCounter(idx60)가 범위 밖이라 전환 reset에서도 제외되어 CD 유지(원인은 continuous 감소결함과 동일). 전환조건/HP회복/스탯/텔레포트·충격파·탄막·연출 수치 불변. |
| `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` (ENEMY canonical) | per-move CD 전환 reset 범위 미기재 | 신설: "페이즈 전환(_bossPhaseCheck 36945/35750) reset도 `i<BOSS_MOVES.length`라 idx>length-1(idx60)은 전환서도 미초기화. 완전 복구는 감소(_bossAI)+reset(_bossPhaseCheck) 두 곳 모두 정의 idx 기준." |
| 같은 §5 피날레 예외(3행) | 드루이드 피날레 경로 | reset문(36945)은 `_isDruidFinale` 분기 **이전** 실행 → 피날레에서도 idx60 동일 미초기화(본 fixture는 비드루이드 경로만 실행=경계). |

보호 문서·canonical 설계 라벨은 임의 변경 0. 공유 docs/Git는 root 소유.

## 8. SYNTH 경계 / 미검수 (대역 표시)

- **원문 실행**: `_bossPhaseCheck` 전환 판정·HP회복·스탯·**reset**, 전환 전 `_bossAI` 선택·CD쓰기, `_bossScore` gate. CD 그릇은 실제 식 `new Array(BOSS_MOVES.length).fill(0)` 실행.
- **SYNTH**: HP 임계값(.50 전환 / .70 비전환) 주입, idx13=36 대조 주입, 무브셋 Set, `Math.random=()=>0.5`.
- **대역(전환 핵심 아님)**: 텔레포트/파티클(`poolPart`)/VFX/`_reviveVFX`/SFX/지연사운드(`setTimeout` 미실행)/빨간콩 `_spawnBossProjectile`/충격파 `hurtP`/충돌 `canMv`·`safePt`/`P`·`G`·타이머. **전환 핵심·reset은 대역화하지 않음.**
- **경계/미실행**: 전체 spawn·`mkEn`·보스전 루프·드루이드 피날레 분기·텔레포트 실제좌표·충격파 실제피해·GPU/청취/저장/실게임. 전체 RNG/score 완전동등·다른 58무브 전수·후보 음수처리 완전동등은 본 fixture 범위 밖(미입증). spawn 초기화 확대는 하지 않음.

## 9. 소유·변경 누적

- 쓰기 3파일(`checks.mjs`/`result.md`/`evidence.json`)만. 이전 continuous/ENEMY 3파일 **수정/재실행 0**. TASK/COMMON·생산·공유docs·기존test·Git·삭제/이동/cleanup·UI/서버/빌드·미디어·새세션/하위팀·외부메시지 0. Node = 지정 경로.
- 변경 누적(읽기전용 관찰): 시작 71 → 완료 55(타팀 병행 포함 전역값). 자신의 신규 파일 수로 80/100 판단 안 함. 80 미만. 본인 Git 미수행.
- 감독은 기존 세션 JSONL end_turn·소유 파일을 직접 열람하므로 별도 SendMessage/주소요청 하지 않는다. 이 한 건을 보고하고 추가 업무를 자율 생성하지 않는다.

# ENEMY-roundrobin-array-mutation-hb1014 — F06 예산 루프의 배열 변경 후 순환 cursor 기아

F06 budget 루프(비보스 `_ei%32`·`>12ms` → `break`)로 매 tick 일부만 처리되는 상황에서, tick 사이 적 배열이
변이(앞 원소 사망 splice→인덱스 shift / tail 생성→성장)할 때 **위치기반 roundrobin cursor가 유효 적을 과도 기아**시키는지를
actual 소스 식 + 가상시계 validator로 측정했다. **1 PASS + 8 REPRODUCED / 0 FAIL.** `productionApplied=false`, `runtimeAccepted=false`.
source/fixture PASS는 실게임/native/청취/GPU/맵visual/배포 PASS로 치환하지 않는다. 이전 idx60/CD/phase/음수정규화 검사 반복 0.

## 1. 실제 소스 앵커 (읽기전용, 드리프트 감지)

| 대상 | 위치 | 근거 |
|---|---|---|
| 현행 production 루프 | `game.html:33162` / `game-easy-test.html:31982` | `for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];` + budget break `if(_ei%(IS_MOBILE?8:32)===0&&_ei>0&&!e.ib&&performance.now()-_eUpdateStart>(IS_MOBILE?8:12))break;` — **cursor 없음(항상 _ei=0)**, `G._eLoopStart` production 미사용(C0 PASS) |
| F06 roundrobin 후보 | `tools/team-followup-20261001/ENEMY/roundrobin-boundary.game.patch` (미적용 참조) | 위치 cursor `_eStart=norm(G._eLoopStart)%_elen; G._eLoopStart=(_eStart+1)%_elen` + `_ei=(_eStart+_k)%_elen` + break(`_k`) |

- 읽기시점 full SHA: `game.html` `8b4653f3f7282cf2…` · `game-easy-test.html` `50f9a24bb11d95bd…` (root WIP로 수시 드리프트 — owned anchor만 고정, 원소스 변경 0). prod break fragment SHA(game) `8b1a329bb591edc3…`, cand cursor 식 SHA `bbdf466b0c19ffda…`. parent 제공 `6b865637`은 역사 기준, currentHEAD 주장 0. Git 직접조회 0.
- 실행: Node `v24.15.0`, `node checks.mjs` exit 0, startedAt `2026-10-02T10:59:36.556Z`, 완료 `2026-10-02T10:59:36.596Z` (보고 UTC `2026-10-02T11:01:38Z` / KST `20:01:38+09:00`). 검증 UUID `8f65b5e7-50e6-493c-9571-32984157cfbe`, provider Claude Code.

## 2. 모델·대역 경계 (실제 계약 vs SYNTH)

- **실제 반영**: budget break 식(비보스·`_x%32===0&&_x>0`·`elapsed>12ms`)·cursor init/+1전진·`(_eStart+_k)%_elen` 회전 — 세 variant(prod/cand/idcand)에 그대로.
- **명시 대역(stub)**: `updateE(e)` → served 기록. 가상시계 `nowRel = servedThisTick × COST`. **근접 priority·LOD parity(`_ei&1/3/7`)·상태/타이머 순서는 '처리/미처리 커버리지'와 직교**하므로 served 여부만 본다(미모델 = 명시 대역).
- **SYNTH 입력**: `N=40`(>INTERVAL 32라야 break 발생), `COST=0.5ms`(→ `_k=32`에서 16ms>12 → 32기 처리/8기 미처리), `T=400`(M2는 200). 변이 cadence(`mutFrontChurn`/`mutTailGrow`)는 실제 게임식(splice 제거 + tail push)을 모사하나 **정확 발생빈도는 실게임 아님** — 실게임 기아 발생은 QA 실측(§3-C 조건 A/B).

## 3. 관측 결과 (actual 숫자)

| 시나리오 | prod(현행) | cand(F06 roundrobin) | idcand(identity 후보) | 판정 |
|---|---|---|---|---|
| **A1 control (무변이)** | maxGap **400**, neverServed **8** (tail 영구 기아 = baseline F06) | maxGap **8**, never 0 (문서 "_elen tick 내 1회 선두" 성립) | maxGap **1**, never 0 | cand는 정적 배열서 정상 |
| **M1 앞-churn** (splice shift + tail spawn) | maxGap **400**, never **8** | ctlGap 8 → **mutGap 9**, never 0 (**경미 저하, 영구기아 아님**) | maxGap **1**, never 0 | cand 변이 민감하나 경미 |
| **M2 tail 성장** (배열 계속 증가) | — | **candGap 199**(≫ N=40), never 0 | **idcandGap 7**(≤ N) | **cand 과도 기아 — 핵심 결함** |

## 4. 결함 분석 (honest)

- **baseline (prod)**: cursor가 없어 항상 `_ei=0`부터 → budget break 이후 **tail 인덱스(≥32) 영구 기아**. 변이와 무관(M1에서도 400/8). = §3-C가 기술한 F06 원결함.
- **cand 앞-churn (M1)**: 위치 cursor가 인덱스 shift에 민감해 최악 gap이 8→9로 **경미 저하**, 그러나 persistent 영구기아 0. 이 cadence에서는 roundrobin이 대체로 버틴다.
- **cand tail 성장 (M2) = 핵심 경계 결함**: cursor wrap 주기 = `_elen`인데 **tail 성장으로 `_elen`이 무한 증가** → `+1/tick` cursor가 배열 성장을 못 따라가고, 초기 인덱스의 persistent 적은 cursor가 지나간 뒤 run 내내 미처리(gap **199** ≈ 전체 T). 즉 후보의 **"모든 인덱스가 `_elen` tick 내 1회 선두" 보장은 '정적 `_elen`' 전제이며, 성장 배열에서는 per-identity 기아가 `_elen`(성장값)에 비례해 과도**해진다. neverServed=0이지만 gap이 N의 5배 이상 → 실질적 과도 기아.
- **idcand (최소 memory 후보)**: cursor를 '다음 선두가 될 적의 **identity**(`G._eLoopId`)'로 보관, 변이 후 그 id의 현재 위치에서 재개. 모든 시나리오에서 persistent gap ≤ N(M2 7, M1/A1 1) → **변이·성장에도 per-identity 유계 커버리지 복원**. 단 '완전 게임 복구/모든 무브 동등/실제품 PASS'는 인수하지 않는다 — 이 validator는 served 커버리지만 본다.

## 5. 최소 memory 후보 (cursor normalization/identity) — 미적용

```
// F06 roundrobin cand의 위치 cursor 1접점만 교체:
- const _eStart = norm(G._eLoopStart) % _elen;           // 위치(변이 비대응)
- G._eLoopStart = (_eStart+1) % _elen;
+ let _eStart = 0;                                         // identity 재개
+ if(G._eLoopId!=null){ const _ix=ens.findIndex(x=>x&&x.id===G._eLoopId); _eStart = _ix>=0?_ix:0; }
  ... 루프(break·회전·LOD·바디 불변) ...
+ const _nx = ens[(_eStart+_lastServedK+1)%_elen];        // 이번 미처리분 선두 승격 = identity 저장
+ G._eLoopId = _nx ? _nx.id : null;
```
- 변경 범위는 **cursor 저장/복원 1접점**뿐: budget 식(12/8ms·`%32`)·회전·LOD parity·상태/타이머/근접 priority·`if(!e)continue`·바디·수치 불변. **신규 attack ticket/지연/수치/탄 수명 정책 0.** 적 id는 기존 엔티티 식별자 재사용(새 필드 요구 시 root 결정).
- 정적 control(무변이)에서 idcand=cand와 동급(기아 0) → 회귀 없음. 이 후보는 **미적용**(root/QA 소유). bossdeath/roomgate 범위 밖.

## 6. docs 동기화 인계 (root, 직접 편집 0)

`rg 'ENEMY-F06|round-robin|라운드로빈|_eLoopStart|타임버짓|기아|starv' docs` = 60매칭 / 23경로. 정본 = `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` §3-C(F06 행 102, 본문 152~).

| 문서 / 위치 | 현행(old) | 인계(new) |
|---|---|---|
| `ENEMY_AI_TEAM_MASTER.md` §3-C "후보 A (round-robin)" | 시작 인덱스 회전 → "모든 인덱스가 `_elen` tick 내 1회 선두"(정적 전제) + 음수/오버플로 하드닝(roundrobin-boundary) | **배열 변이 민감성 추가**: 위치 cursor는 ⓐ 앞-churn(splice shift)에 경미 저하(gap 8→9, 영구기아 아님) ⓑ **tail 성장 시 wrap 주기=`_elen` 증가로 초기 인덱스 적이 과도 기아(모델 gap 199 ≫ N)**. "`_elen` tick 내 1회"는 **index** 보장이며 변이 시 **identity** 보장 아님. 최소 memory 후보 = **identity cursor(`G._eLoopId`)**로 per-identity 유계 복원(모델 gap ≤ N). 검수 `tools/team-followup-20261002/supervisor-next/ENEMY/ENEMY-roundrobin-array-mutation-hb1014/`(1P/8R). 미적용·per-tick 비보장·soft-cap은 QA 결정 |
| `ENEMY_AI_TEAM_MASTER.md` §3-C F06 행(102) 상태 | "재현·계측 완료 / 수정=QA 인계" | 변이 경계 하위항목 추가(위 ⓐⓑ + identity 후보). **설계 임의확정 0** — soft-cap/정상 발생빈도는 QA 실측 소유 |

보호 2_3 수정 0, Q전용 blackBean 패링·어택티켓 금지·LOCK/TBD·확정 수치 보존. 공유 docs 동기화·canonical·생산 채택·최종 검증·Git는 **root**, 처리 marker는 **감독** 소유.

## 7. 실제품 Gate / 한계

- **실게임/native/청취/GPU 픽셀/맵 visual/배포 PASS로 치환 0.** validator는 served 커버리지(처리/미처리)만 결정적으로 측정 — 실제 updateE 비용·근접 priority·LOD·tick 수(`_accCap`)·실제 발생빈도는 QA 실측(§3-C 조건 A 현재 미발생/조건 B 고부하 재현).
- 변이 cadence는 SYNTH(모델). 실게임에서 tail 성장/front churn이 어느 빈도로 과도 기아를 유발하는지는 QA 실측 대상. **no-fix 여부가 아니라, 위치 cursor가 성장 배열에서 per-identity 유계를 잃는다는 구조적 사실**을 validator로 재현.
- runtime gate 대기를 독립 소스 구현의 blanket blocker로 삼지 않음 — 본 validator·최소 후보·control은 완성. 새 기능·정책확장·자체 다음건 배정 0.

## 8. 소유·불변

- 새 파일 2개: `result.md`, `checks.mjs`만(별도 evidence/log/patch/backup 0 — 검수 evidence/SHA/영수증은 본 result 내 보존). 이전 TASK/산출·타인 WIP 보존, 원소스 변경 0.
- production·공유docs·기존tests·다른팀산출·Git/index(조회 포함) 0, 실게임/세이브·서버·빌드·audio·이미지·권한/인증/설치·삭제/이동/cleanup·팀외 메시지·새세션/하위팀 0. 단일 세션.
- 전역 Changes는 감독 STATE 제공값만 사용(자체 Git 조회 0). 자신 2파일로 80/100 판단 0. 이 한 건만 수행, 추가 업무 자율 생성 0.

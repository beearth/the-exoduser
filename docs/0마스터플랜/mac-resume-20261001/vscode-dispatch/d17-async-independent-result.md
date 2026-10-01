# QA D17 비동기 후보 독립 반례 검수 — 결과 (한국어)

- 담당 QA / 기존 세션 `88c3f903…`. HEAD `f965a15b`.
- 수신 17:30:22Z / 첫 Read 17:30:50Z / Edit 착수 17:36Z / 완료 17:37Z (UTC). receipt: `d17-async-independent-receipt.json`.
- 범위: `d17-async-independent-task.md` 한 건. **source 검수(read-only)** — 앱 인수·생산 활성 아님. ITEM 파일 수정 0.
- 후보 완성 상태: `d17-async-boundary` 후보 **완성 확인**(ITEM receipt `completedUtc 17:30:53Z`) → 대기 불필요, 같은 반례 적용.

## 대상 source SHA-256(앞16)
| 파일 | SHA |
|---|---|
| d17-lifecycle-roll-candidate.mjs (prior) | `381e43c79b4b16d7` |
| d17-async-boundary-candidate.mjs (new) | `f4c15457b7636557` |
| d17-source-adapter-candidate.mjs | `6bf70e525a6a7aa1` |
| d17-source-adapter-callsite.mjs | `0e1f024e3d631f11` |
| d17-zone-selection-candidate.mjs | `a505c072dbf18d31` |
| UI-17 | effectId U-D17 · slot helmet · stat `_uBlackZoneGather` · unit count · min1 max3 |

## 산출물
- 독립 fixture: `tools/team-followup-20261001/QA/d17-async-independent-regression.mjs` → **20 PASS / 0 FAIL, exit 0**
  - ITEM check(d17-*-check) 복제 아님. 유효 롤(UI-17)로 black-end 이동 효과를 직접 관찰하는 독립 시나리오.

## 결함 재현(prior) — 2건 독립 증명
| ID | 결함 | 재현 결과 |
|---|---|---|
| **FAIL-A** pending 중 등록/효과 | 비동기 경계 `wrapBoundary` 가 단일 pending 추적이 없어, 경계 진행(pending) 중 `onInfernoSlamFixedCreated` 가 **등록 true** 되고 `fireBlackStar` 시전이 provenance zone 을 center 로 **이동(효과 발생)** | 재현됨(prior: 등록 true·zone.x=0) |
| **FAIL-B** 늦은 finally·A/B 겹침 | 각 경계가 `Promise.resolve(result).finally(clear)` 로 **늦게·독립적으로 clear** → b1 늦은 settle 뒤 b2 pending 중 zC 오등록(true), b2 늦은 settle 의 clear 가 zC provenance **늦게 삭제** → 이후 시전 미이동 | 재현됨(prior: 겹침 중 등록 true, 이후 미이동) |

## 수정 확인(new) — 같은 반례 전부 억제·정상 재개
| 반례 | new 결과 |
|---|---|
| FAIL-A | pending 중 `onInfernoSlamFixedCreated` **false(억제)**, 시전은 **원 fireBlackStar만 통과(무효과, zone 미이동)** — 게임플레이 보존 |
| FAIL-B(A/B 겹침) | `pending` Set 으로 겹침 추적(size 2→1→0). **진행 경계가 하나라도 있으면 억제**, 늦은 clear 없음. 전 경계 완료 후에만 재개(zD 등록·이동) — 영구 차단 아님 |
| 역순 완료 | b2 먼저 settle→b1 — 전부 완료까지 억제, 이후 재개 |
| 실패(reject)/동기 throw | pending 누수 0, 예외 전파, 이후 재개 |

## 공통 계약 검증(양 후보)
- **기본 비활성(enabled=false)**: 등록 false·시전 무효과(원함수만 통과). ✓
- **원함수 this/인수/반환/호출횟수**: `wrapBoundary` 동기 경로 this·args·return·1회 보존, `fireBlackStar`/`activateSpikeTrap` 반환·this·1회 보존. ✓
- **clear / player·character·zones 교체**: character 또는 zones identity 변경 시 `current()` 재구성으로 stale provenance 폐기(이전 zone 미이동). ✓
- **pending 생성/시전**: new `getPendingCount()` 로 생성/완료 추적 확인. ✓

## 판정
- prior 의 비동기 경계 2결함(pending 등록/효과·겹침/늦은 clear 삭제)을 **독립 fixture로 모두 재현**했고, new 후보가 **동일 반례를 전부 억제하며 정상 재개**함을 확인했다. ITEM 이 보고한 "FAIL 2건 재현·수정"과 **독립적으로 일치**.
- 결함 증명은 fixture 실행으로 수행(보고서 대체 아님).

## 미실행 / 한계
- ITEM 파일·production game/easy·공유 docs/CHANGELOG·세이브 수정 0. Git/queue/새세션/하위에이전트/서버/게임/성능측정/빌드 0.
- fixture 는 `player._bsCasting`·`_bsX/Y`·fireAura zone 대역으로 **black-end 경로만** 관찰. Promise identity·추가 microtask·never-settle·실제 생산 callsite(initStage/_enterBossArena/_fallenResolve/_loadCharAtlas/dbRestore/startGameFromDB)의 장착·저장·전투 부작용은 범위 밖(ITEM check·생산 게이트 소관).
- review-only·기본 비활성·생산 미연결 유지. 저장 공급 필드 실제 연결은 미확인 경계로 분리.

## 인계 (root)
- new(async-boundary) 후보는 독립 검수상 prior 비동기 2결함을 수정하고 공통 계약을 보존 — 안전. 생산 연결·실전 게이트는 root/ITEM 소관(후보 미적용 유지).
- 남은 게이트: 실제 생산 callsite 장착 시 부작용·저장 공급 필드 실제 연결·never-settle 경계.

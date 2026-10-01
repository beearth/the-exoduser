# MAP-20261002-CLEANUP-RETRY 결과 — 초기hidden/정리재시도/중복start 부분정리 수정

- 팀: Mac MAP / 터미널 3 / 세션 d447a49d / 과제일 2026-10-02
- HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`
- 상태: **2반례 RED→GREEN + 재시도/중복정리 보강 + 전체 회귀 완료.** 실맵 시각 PASS 없음(**RETOUCH 유지**).

## 1. 착수 시각 (실제 UTC, receipt와 동일)
수신 16:12Z · 첫Read 16:12Z(과제/재현기/MAP-counterexamples.json) · 첫Edit 16:13Z(관측기) · 실행 16:15Z · 완료 16:16Z.

## 2. 읽은 원자료 (동결·읽기전용)
- 과제: `cleanup-retry-task.md`, 담당 MD 이력, AGENTS.md.
- 재현기: `tools/team-followup-20261001/root-review/persistence-cycle-counterexamples.mjs`
- RED 기준: `outputs/team-review-20261002/persistence/MAP-counterexamples.json`
- before 동결 스냅샷 생성: `cleanup-retry-before-observer.js` (sha256 `f7514fbf…`, 수정 전 원본).

## 3. 확인된 원코드 실패 (RED)
| 반례 | 원인(원코드) | RED |
|---|---|---|
| initially-hidden | `start()`가 초기 포커스/가시성과 무관하게 `armed:true, focused:true` → 숨김 상태에서도 tick이 표본 생성 | samples **1** (기대 0) |
| clear-retry | `_teardown()`이 `clearInterval` 예외 후에도 `st.interval=null`로 **핸들 폐기**, `_dispose`가 `disposed`면 무조건 early-return → stop 재시도해도 잔여 timer | remainingTimers **1**, handle null, cleanup partial (기대 0) |

추가 지시 범위: 중복 start 시 기존 인스턴스 **부분 정리 예외**에서 핸들 유실 방지.

## 4. 수정 (단일 lifecycle, 관측기 추가 없음 — `manual-input-observer.js`)
1. **초기 hidden/focus 반영** — `start()`에서 `doc.hidden===true` 또는 `doc.hasFocus()===false`면 `armed:false, focused:false, awaitingFresh:true`로 **disarmed 시작**. `start-hidden`/`start-unfocused` 이벤트 기록. 명시적 visible/focus 복귀 + 새 keydown에서만 재개(이전 held 무시).
2. **정리 실패 시 핸들 보존 + stop 재시도** — `_teardown()`은 `clearInterval` **성공 시에만** `st.interval=null`, 실패 시 핸들 보존하고 `teardownErrors`에 `{op,retry:true,err}` 기록. `removeEventListener` 실패 핸들도 `st.listeners`에 보존. `cleanup='partial-unknown-retry-possible'`.
3. **재시도 가능한 `_dispose`** — 1차 호출은 전체 폐기(leg 종료·결과 생성), 이후 호출도 `cleanup!=='ok'`이면 **_teardown 재시도**. 정리 완료(`ok`)된 인스턴스만 `_instances`에서 제거 → 미완은 레지스트리에 남겨 재시도 대상 유지(핸들 유실 방지).
4. **중복 start 부분정리 예외** — supersede 루프의 `inst._dispose`가 부분 실패해도 크래시 없이 진행, 해당 인스턴스는 partial로 기록되고 핸들 보존(레지스트리 잔류). 새 인스턴스는 정상 설치.

`teardownErrors`는 매 시도마다 최신 시도 기준으로 재작성(현 재시도 상태 반영).

## 5. RED→GREEN 대조 (MAP-counterexamples.json → cleanup-retry-after.json)
| 반례 | RED(before) | GREEN(after) |
|---|---|---|
| initially-hidden | samples **1** | **0** |
| clear-retry | remainingTimers **1**, cleanup partial | **0**, handle null, **cleanup ok**(재시도 후) |

## 6. 검수 (실행함, node v24.15.0)
- `node --check` 관측기/fixture PASS.
- **cleanup-retry-fixture 24 PASS / 0 FAIL** (exit 0): CR1 초기hidden·CR1' 초기unfocused·CR2 복귀재개·CR3 clearInterval 재시도·CR4 removeEventListener 재시도·CR5 중복start 부분정리 유실방지.
- **전체 회귀 GREEN**: lifecycle 22 / manual 27 / evidence-gate 26 / safe-mock 32 모두 exit 0.
- 미수행(이번 금지): 실게임/브라우저/서버 기동, 사용자 게임 입력/리로드/계측/닫기, 8뷰·시각 PASS.

## 7. 산출물 (소유 MAP 폴더만) — SHA256
| 경로 | 상태 | sha256 |
|---|---|---|
| `manual-input-observer.js` | 수정 | `9191e7dd25ed5b2b631a1aa6ecc4db665fa8523c975514cc2abaf1ffd5724332` |
| `cleanup-retry-before-observer.js` | before 동결 | `f7514fbfea8d0eda6caa26c491e3f21b25b7b0a2abcaa62b4b0dc8979f9cd6c6` |
| `cleanup-retry-fixture.cjs` | 신규 | `5e7107f119d31e1b306a811fed68bbdc9d832fdf92aad5bed1f5ab6470514a9e` |
| `cleanup-retry-fixture-output.txt` | 신규 | — |
| `cleanup-retry-after.json` | 신규(재측정) | — |

## 8. 범위·무간섭
- 변경은 전부 `tools/team-followup-20261001/MAP/` 내. 관측기 **추가 없이** 원코드 실패만 수정.
- 동결 유지: 재현기(`persistence-cycle-counterexamples.mjs`), `MAP-counterexamples.json`, `counterexamples-before.json` — 읽기만.
- 타 세션/타 팀 동시작업(`game.html` M, `ANIMVFX/*`, vscode-dispatch ANIMVFX-*)은 **미간섭**(읽지도 쓰지도 않음, game.html은 심볼 확인용 과거 read만).
- Git/queue/새세션/새에이전트/공유docs/production 쓰기 0. 사용자 게임 그대로.

## 9. 한계 / MAP PRODUCTION REPORT
- VISUAL QA 이번 측정 없음: 실맵 화면·8뷰·좌표경계·반복무늬·원거리 shade **미측정**. 미방문 8뷰=UNKNOWN. **VISUAL VERDICT: RETOUCH 유지.**
- 검증은 오프라인(vm) 한정. 실브라우저 passive 리스너·실제 isW·실사용자 입력 타이밍은 root 후속 실측 필요.
- `cleanup='partial-unknown-retry-possible'`는 "정리 미확정, 재시도 권장" 신호이지 "정리 실패 확정"이 아님 — 영구 실패 환경에서는 매 stop마다 재시도하며 상태를 계속 노출.

## 10. 인계
확인된 2반례 + 중복정리 보강 완료, 한 건 종료. 실사용자 관측·8뷰·시각 검수는 root 단독 후속으로 인계. docs 공유 반영은 root 통합 시 판단(이번엔 소유 폴더에만 기록).

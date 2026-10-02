# QA-cached-port-function-revocation-hb1014 (결과)

**새 경계:** 설치 중 `const savedCreate = port.createReview`로 **함수 자체를 포획**한 뒤, uninstall / 설치실패 rollback 이후 `savedCreate(request)`를 직접 호출하면 **여전히 실제 D10 아이템이 생성**되는가. 이전 residual-port task의 raw object reference·`Proxy.revocable` 단독 demo(완료/HOLD)와 구분되는, **포획 함수** 한 경계만 수행했다. 기존 6/8 descriptor 전체 회귀는 반복하지 않았다.

실제 `browser-bootstrap-api.js` 원문(VM) + 실제 `createD10PersistenceIntegration` factory + 실제 `createReview` D10 binding을 실행했다. 가짜 counter port로 계약을 대체하지 않았다. **productionApplied=false / runtimeAccepted=false.** 실게임/사용자세이브/서버/Git/삭제·이동 0, activation 0 / `runtimeReady=false` / `status='proposal'` 보존.

## 결론 요약

| 항목 | 결과 |
|---|---|
| defect 재현 | **DEFECT-CONFIRMED** (정상 uninstall·설치실패 rollback 양쪽 모두 포획 함수 생존) |
| 정상 control | **PASS** (handle.create ≡ direct ≡ savedCreate 동등) |
| Proxy 단독 후보 | **CANDIDATE-REJECTED** (포획 함수 누수로 기각 — TASK 요건) |
| 최소 memory 후보 | **CANDIDATE-VIABLE** (lifetime closure guard — 포획 함수까지 무력화, source 미patch) |

## 1. 입력 / 소스 / checks SHA (실제 Read 고정, Git 조회 0)

| 파일 | SHA256 | 역할 |
|---|---|---|
| `tools/team-followup-20261001/ITEM/browser-bootstrap-api.js` | `dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb` | 실제 설치/rollback API(VM 실행 바이트=디스크 원문) |
| `.../browser-host/persistence-integration-port.js` | `9d2536fef5608d18dda3a6e557e24b48d5c262f9566f3c0cd37a52d8e4058491` | 실제 factory + caller fragment |
| `.../browser-host/mk-item-fixture.js` | `5476174988858bd50b700cd48b1aa681cf7c002719a0e54248c199473e1cc0a8` | 실제 mkItem fixture |
| 본 `checks.mjs` | 생성 후 동결(수정 0) — 이 result와 동일 폴더 | primary 재현 + validator |

- Node: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` v24.15.0, flag `--experimental-vm-modules`.
- parent 제공 `6b865637`은 역사적 기준이며 **현재 HEAD로 주장하지 않는다**. 지시대로 **Git 직접조회(쓰기·읽기 전부) 0**. root가 확장한 `_skUnclick`/스킬카드 minus 작업은 **중복 소유·검사 0**.
- **fragment/대역/합성 경계:** 실제=api 원문 + 실제 factory `createD10PersistenceIntegration` + 실제 `createReview` binding(`createNewIdentifiedD10Instance` 등) + 실제 `getOwnPropertyDescriptor`. 대역=rollback delete 실패 Proxy host(`deleteProperty` trap=false). 합성=mkItem `random`·D10 `rng`만 `()=>0.5`(생성 로직은 실제).

## 2. caller fragment 근거 (defect가 실제 사용 패턴인 이유)

`persistence-integration-port.js:29-39` `persistenceReviewCallsite`:

```
const port=window._d10PersistenceReviewPort;        // 31
…                                                    // 32 계약 검사
return port.createReview(request);                   // 33
```

생산 callsite는 매 호출 port를 다시 읽지만, 한 번 `const savedCreate = port.createReview`로 **함수를 캐시**하면 이후 port가 사라져도(uninstall/rollback 실패) 그 함수는 **closure(mkItem/rng)만으로** 동작한다. 즉 이 경계는 가상의 공격이 아니라 **함수 캐싱이라는 흔한 코드 패턴**에서 비활성 제안 포트가 실제 아이템을 만드는 결함이다.

## 3. 실행 관측 (checks.mjs 영수증 — UTC 2026-10-02T10:46:24.023Z, exit 0)

| id | band | 판정 | 핵심 관찰 |
|---|---|---|---|
| **CONTROL-EQUIV** | 정상 owned 동등성 | **PASS** | handle.create ≡ direct ≡ savedCreate = `instance{uniqueId:UI-10, uniqueRoll, 29 keys}`; activation 보존(enabled=false/runtimeReady=false/status=proposal) |
| **PRIMARY-A** | 정상 uninstall 후 포획 함수 생존 | **DEFECT-CONFIRMED** | close=restored·descriptor absent·handle.create 거부, 그러나 `savedCreate(request)` → 실제 instance 생성, **post-uninstall mkItem=1 rng=1** |
| **PRIMARY-B** | 설치실패 rollback 후 포획 함수 생존 | **DEFECT-CONFIRMED** | AggregateError(설치실패+delete 실패)·residual·handle.create 거부, 그러나 onInstalled에서 포획한 `savedCreate` → 실제 instance 생성, **post-rollback mkItem=1 rng=1** |
| **REJECT-PROXY** | Proxy 단독 revoke 누수 | **CANDIDATE-REJECTED** | revoke 후 `proxy.createReview` 접근은 TypeError지만, revoke 전 포획한 `savedCreate`(raw 함수)는 여전히 동작(post-revoke mkItem=1) → Proxy 단독 후보 기각 |
| **CANDIDATE-GUARD** | lifetime closure guard | **CANDIDATE-VIABLE** | revoke 후 `savedCreate` throw(`포트 수명 종료 · 포획 함수 호출 금지`), **post 호출수 mkItem=0 rng=0 factory=0**, realPort 보존(foreign preservation), activation 보존 |

전체 exit 0, 하니스 실패·숨김 0. 각 defect의 post-call 카운터(mkItem/rng)로 "실제 생성이 일어났는가"를 증명했고, 후보에서는 그 카운터가 0임을 확인했다. storage 호출은 proposal `createReview` 경로에 없어 **0 by design**.

## 4. 최소 memory 후보 (lifetime closure guard) — 생산 미적용

```js
function guardLifetime(realPort){
  let live=true;
  const g=fn=>(...a)=>{ if(!live) throw new Error('포트 수명 종료 · 포획 함수 호출 금지'); return fn.apply(realPort,a); };
  const wrapped=Object.freeze({
    status:realPort.status, enabled:realPort.enabled, runtimeReady:realPort.runtimeReady,
    createReview:g(realPort.createReview), readItem:g(realPort.readItem),
    restoreItem:g(realPort.restoreItem), serializeItem:g(realPort.serializeItem),
  });
  return { wrapped, revoke(){ live=false; } };   // revoke 를 uninstall()/catch rollback 에 연결
}
```

- **왜 Proxy 단독보다 나은가:** 각 메서드를 installation lifetime 토큰(`live`)에 묶은 **closure**이므로, `savedCreate = wrapped.createReview`로 함수를 포획해도 그 함수가 매 호출 `live`를 검사한다 → revoke 후 throw. Proxy 단독은 포획 시점에 raw 함수가 새어나가 무력화 불가(REJECT-PROXY).
- **최소 patch 위치(기술만, 적용 0):** `browser-bootstrap-api.js`의 설치값을 `guardLifetime(port).wrapped`로, `uninstall()`과 `catch` rollback 자리에 `lifetime.revoke()` **1줄** 연결. **새 API/데이터 schema 0.**
- **foreign preservation:** 원 `realPort`와 그 함수는 파괴하지 않으며(내부 재사용 가능), descriptor/host의 외부 교체값도 건드리지 않는다. 외부 descriptor 강제정리·추가 삭제 0.
- **productionApplied=false / runtimeAccepted=false.** 실제 source는 수정하지 않았다(격리 검증).

## 5. docs 동기화 인계 (root 반영용 — 공유docs 쓰기 0)

docs 전체 `rg "cached|포획|savedCreate|closure guard|수명 종료|createReview|_d10PersistenceReviewPort"` 실제 1회 수행. canonical SSOT(`ITEM_TEAM_MASTER.md`·`QA_PERFORMANCE_TEAM_MASTER.md`)에 이 포획-함수 경계 문안 **없음**(유일 매칭은 supervisor dispatch `SUPERVISOR_STATE.json` bookkeeping). 정확 old/new 표:

| 정본 | 현재(old) | 추가(new) |
|---|---|---|
| `docs/7아이템디자인/ITEM_TEAM_MASTER.md` 검토 bootstrap/host 계약 | (포획 함수 수명 항목 없음) | 2026-10-02 QA: 설치 중 `const savedCreate=port.createReview`로 포획한 **함수**는 uninstall(restored)·설치실패 rollback(AggregateError) 이후에도 `savedCreate(request)` 직접 호출로 **실제 D10 instance 생성**(mkItem/rng 재호출). `handle.create`는 거부되나 포획 함수는 closure(mkItem/rng) 기반이라 생존. 생산 callsite `persistence-integration-port.js:33 port.createReview(request)`가 근거. 최소 후보=lifetime closure guard(revoke 시 포획 함수까지 throw, factory/RNG 0, realPort·foreign preservation 보존). Proxy 단독 revoke 후보는 포획 함수 누수로 **기각**. **productionApplied=false, 새 API/schema 0, source patch 0.** SHA api `dcea3ff9…`/integration `9d2536fe…`. |
| `docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md` QA 제한 | (해당 항목 없음) | 위는 Node VM source fixture Gate 한정. 실브라우저/CUA/native/청취/GPU픽셀/맵visual/배포 미검수. 대역=Proxy deleteProperty trap(delete 실패 주입), 합성=mkItem random/rng. activation 0·runtimeReady false 보존. storage 호출 0 by design. |

> protected `2_3`·Q전용 blackBean 패링·어택티켓 금지·LOCK/TBD·확정수치 **보존(수정 0)**. 반영·canonical 인계·Git은 감독 검수 후 root 순차 수행.

## 6. 실제품 Gate / blocker / 소유

- **source/fixture PASS ≠ 실게임/native/청취/GPU픽셀/맵visual/배포 PASS.** 이번은 Node VM + 실제 factory source 경계 단독. 실제 window/브라우저/UI/저장 미사용.
- rollback 실패 host는 합성 Proxy 대역 1 사건, 실제 index.html host 미재현.
- **진짜 blocker/필수결정:** 없음(no-fix 아님 — defect 재현·후보·control 모두 완성). 후보 채택/최소 patch 적용은 **root/감독 판단**이며 runtime gate 대기를 소스 구현의 blanket blocker로 삼지 않았다.
- **소유 2파일만 생성:** `result.md`(evidence/해시/영수증 포함) + `checks.mjs`. 별도 evidence/log/fixture/patch/backup 0. production·공유docs·기존tests·다른팀산출·Git(조회 포함)·실게임/세이브·서버·빌드·audio·이미지·권한/인증/설치/결제/게시·삭제/이동/cleanup 0. 팀외 메시지 0. 이전 TASK/산출·타인 WIP 보존. 자체 다음건 배정 0.
- **Changes:** Git 직접조회 0(지시). 80 checkpoint/100 전 중단은 감독 관리. capacity 중단 신호 시 추가파일 작성 중단.

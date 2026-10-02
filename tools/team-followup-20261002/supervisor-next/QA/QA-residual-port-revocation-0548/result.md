# QA 작업감독 후속 — QA-residual-port-revocation-0548 (결과)

작업감독 피드백을 인수하고, 지정된 **한 새 경계**(실패 후 host에 잔존한 raw `_d10PersistenceReviewPort`의 직접 메서드 호출 수명)만 진행했다. 이전 continuous/QA의 rollback 실패 2건 RESIDUAL·3 PASS 및 claude-native-6/QA 6검사·project-teams 16검사는 **재실행·합산 0**이다. 실제 `browser-bootstrap-api.js`·실제 `createD10PersistenceIntegration` factory·실제 `createMkItemFixture`를 사용했고, 가짜 counter port로 안전 PASS를 선언하지 않았다. 실제품/GPU/청취/저장/실UI/브라우저 검증 0, `productionApplied=false`.

**총평: 3건 — RESID-LIFETIME(수명 누수 관찰) / NORMAL-CMP(PASS) / REVOKE-CAND(후보 성립). 직접 잔존 호출 계속 가능 = true.**

## 0. 감독 피드백 인수 — Git 조회 이탈과 쓰기0의 정확한 분리 (0으로 지우지 않음)

감독 지적: 이전 `continuous/QA` 보고표에 실제 `git rev-parse`·`git status --porcelain` 조회가 있었는데 "마지막 Git0" 문장과 충돌했다. 정확히 분리한다(이전 파일 직접 수정 0, 기록 보존):

| 구분 | 이전 continuous/QA (2026-10-02 05:38~05:43) | 이번 task (QA-residual-port-revocation-0548) |
|---|---|---|
| Git **쓰기**(stage/commit/push/index) | **0** (사실) | **0** |
| Git **읽기 조회**(rev-parse/status) | **실제 수행함** — `git rev-parse HEAD`(093ca555), `git status --porcelain\|wc -l`(55→68). 이것을 "Git 0"으로 뭉뚱그린 것이 충돌이었음 | **0** — 이번엔 Git 명령 자체를 실행하지 않음(지시 "Git로 재조회0" 준수) |
| 비-Git 조회 | `shasum`, `rg`, `ls`, `node` (Git 아님) | `shasum`, `rg`, `ls`, `find`, `node` (Git 아님) |

- 이전의 read-only Git 조회 이탈은 **역사 기록으로 보존**하며 0으로 지우지 않는다. 이번 보고는 그 이탈(읽기 조회 수행)과 이후 쓰기0을 명확히 구분한다.
- **Changes 수치:** 이번엔 Git 재조회 0이라 현재 Changes를 새로 측정하지 않았다. 직전 관측값(68, 이전 task)이 마지막 근거이며 **80 임계 근접** — root checkpoint 필요 판단은 root가 Git로 확인한다. 내 산출은 이 폴더 3파일뿐.

## 1. source 실제 Read 시각·SHA (이번 새 기록, 이전 값은 이력 보존)

이번 실제 Read/SHA 산출 시각: 2026-10-02T05:57:48Z UTC / 14:57:48 KST (harness 실행 시점 동일 바이트).

| 파일 | 이번 실측 SHA256 | 비고 |
|---|---|---|
| `browser-bootstrap-api.js` | `dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb` | VM 실행 바이트 = 디스크 원문 (이전 이력과 동일값, 불변) |
| `browser-host/persistence-integration-port.js` | `9d2536fef5608d18dda3a6e557e24b48d5c262f9566f3c0cd37a52d8e4058491` | 실제 factory (이번 신규 기록) |
| `browser-host/mk-item-fixture.js` | `5476174988858bd50b700cd48b1aa681cf7c002719a0e54248c199473e1cc0a8` | 실제 mkItem fixture (이번 신규 기록) |

- 총괄 제공 원격검증 checkpoint `f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c`(2026-10-02 감독 인수)·`game2e45`/`easy3e59`/`node541ff8`은 **그 조회 시점 근거**이며 **독립 현재 HEAD로 쓰지 않는다**. 이번 Git 조회 0.
- Node: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` v24.15.0, flag `--experimental-vm-modules`.
- **fragment/대역/합성 명시:** 실제=api 원문 VM 실행 + 실제 factory `createD10PersistenceIntegration` + 실제 `createReview` binding + 실제 `getOwnPropertyDescriptor`. 대역=rollback delete 실패 Proxy host(`deleteProperty` trap=false, 1 사건). 합성=mkItem의 `random`과 D10 `rng`만 `()=>0.5`(생성 로직은 실제). 후보 데모=격리된 `Proxy.revocable`(source 미patch).

## 2. 새 경계 결과

| id | 경계 | 입력 | 예상(실제 source) | 관찰 | 판정 |
|---|---|---|---|---|---|
| **RESID-LIFETIME** | 잔존 raw port 직접 호출 수명 vs handle 거부 | rollback delete 실패 Proxy host 1 사건: `onInstalled`에서 handle 포획 후 throw → AggregateError → 잔존 port | `handle.create`는 `assertOwned`(active=false)로 거부, 그러나 잔존 `host[prop].createReview` **직접호출은 가드 없이 실제 D10 instance 반환** | AggregateError errors=[`late-install-failure`,`검토 property 정리 실패`] · 잔존 port{status:proposal} sameRef=true · **handle.create 거부**(해제/교체된 검토 포트 호출 금지) · **직접 createReview 성공** → `instance{uniqueId:UI-10, hasUniqueRoll:true, 29 keys}` · factory=1 mkItem=1 rng=1(실제 실행 증명) | **OBSERVED-LIFETIME-LEAK** |
| **NORMAL-CMP** | 정상 installed 포트 1 대조 | 정상 install → `handle.create` vs `ownedPort.createReview`(같은 요청) → 정상 uninstall | owned 상태 둘 다 D10 instance 반환, uninstall(delete 성공) 후 handle.create 거부·descriptor absent, 단 보관 raw 참조는 여전히 호출됨 | handle.create=직접=`instance{UI-10,29 keys}` · close=restored, after.present=false · uninstall후 handle.create 거부=true · **보관 raw 참조 호출가능=true** | **PASS** |
| **REVOKE-CAND** | revocation/owned wrapper 메모리 후보 1개 | `Proxy.revocable(realPort)`를 설치값 가정, `revoke()`로 수명 종료(descriptor/foreign 삭제 0) | revoke 전 호출 가능 → revoke 후 TypeError 차단 → 원 realPort 보존(foreign preservation) | revoke전=true · revoke후 차단=true(TypeError) · 원 port 보존=true | **CANDIDATE-VIABLE** |

## 3. 핵심 발견 — 잔존/보관 raw port의 revocation 부재 (handle ≠ port)

- **handle과 raw port의 수명이 분리돼 있다.** `handle.create`는 `assertOwned`(api.js:25: `!active || !same(descriptor,installed)`)로 보호되어, rollback 실패로 `active=false`가 되면 **거부**된다. 그러나 host에 잔존한 **raw port 객체 자체(`host._d10PersistenceReviewPort`)에는 어떤 revocation도 없어** `.createReview` 직접 호출이 **실제 D10 instance를 그대로 반환**한다(uniqueId:UI-10, uniqueRoll 포함, 29 keys — 실제 binding 실행).
- **생산 근거(실제 source):** `persistence-integration-port.js:29-39` `persistenceReviewCallsite` 자체가
  `const port=window._d10PersistenceReviewPort; … return port.createReview(request);`
  로 **handle이 아니라 raw port를 window에서 직접 읽어 호출**한다. 즉 잔존 port의 직접 호출 가능성은 가상의 공격 경로가 아니라 **생산 callsite의 실제 사용 패턴**이다.
- **근본 원인은 잔존뿐 아니라 정상 경로에도 존재(NORMAL-CMP):** 정상 uninstall(delete 성공)로 descriptor를 지워도, 외부가 미리 `const p=host[prop]`로 **참조를 보관**했다면 `p.createReview`는 계속 동작한다. descriptor 삭제는 "조회 경로"만 끊을 뿐 **port 객체의 메서드 수명**을 끝내지 못한다.
- **복원 실패 분리(감독 요청 유지):** RESID-LIFETIME은 rollback delete 실패로 원 property 복원 불가 → `OBSERVED-LIFETIME-LEAK`로 표기하고 잔존 상태 보고. **PASS로 정리하지 않음.** 외부 descriptor 강제정리·추가 삭제 0.

## 4. 메모리 후보 1개 (대조만, 생산 미적용)

| 후보 | 메커니즘 | 검증(격리 데모) | foreign preservation | 상태 |
|---|---|---|---|---|
| **revocable owned-wrapper** | raw port 대신 `Proxy.revocable(port)`(또는 `active`/`same` 재검 delegating wrapper)를 설치값으로 쓰고, uninstall/rollback-실패 시 `revoke()` | revoke 전 호출 가능 → revoke 후 `TypeError`로 **직접 호출 수명 종료** → 원 realPort는 파괴되지 않아 재사용 가능 | **성립** — descriptor value(wrapper)·host·원 port 삭제 0, 외부 교체값 보존과 양립 | **CANDIDATE-VIABLE / productionApplied=false** |

- 후보는 **1개만** 대조했다. **새 API·데이터 schema 신설 0, 실제 source patch 0, 생산 채택 0.** 실제 `browser-bootstrap-api.js`는 수정하지 않았다(격리 데모).
- 직접 잔존 호출이 **계속 가능**(residualDirectCallPossible=true)하므로 NO-FIX가 아니라 위 후보를 근거로 제시한다. 채택·적용은 root/총괄 판단.

## 5. docs 반영 문안 (root 순차 인수 — 공유docs 쓰기 0)

docs 전체 `rg "revocation|revocable|persistenceReviewCallsite|assertOwned|잔존 port|raw port|lifetime|수명"` 결과: canonical SSOT(`ITEM_TEAM_MASTER.md`·`QA_PERFORMANCE_TEAM_MASTER.md`)에 이 port revocation/수명 경계 문안 **없음**(기존 `수명` 매칭은 뇌전창·맵 텍스처·스킬 카드 minus 등 **무관** 시스템). 아래는 root가 code+docs 체크포인트에서 넣을 정확한 문안.

| 반영 대상 | 추가할 정확한 내용 |
|---|---|
| `docs/7아이템디자인/ITEM_TEAM_MASTER.md` 검토 bootstrap/host 계약 말미 | 2026-10-02 QA: rollback delete 실패로 host에 **잔존한 raw `_d10PersistenceReviewPort`의 직접 메서드 호출 수명**을 실제 factory로 검증. `handle.create`는 `assertOwned`(active=false)로 거부되나, 잔존 raw `host[prop].createReview(request)`는 가드 없이 실제 D10 instance(uniqueId:UI-10, uniqueRoll 포함) 반환 → **handle과 port의 수명 분리(revocation 부재)**. 생산 callsite `persistence-integration-port.js:29-39 persistenceReviewCallsite`가 window에서 raw port를 직접 읽어 호출하므로 실제 사용 패턴. 정상 uninstall(delete 성공)로 descriptor를 지워도 **보관된 raw 참조**는 계속 호출 가능. 메모리 후보 1개(revocable owned-wrapper, revoke 시 직접 호출만 TypeError 차단, 원 port·foreign preservation 보존) — **생산 미적용, 새 API/schema 0, source patch 0**. source SHA api `dcea3ff9…`, integration `9d2536fe…`, Node v24.15.0 VM. |
| `docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md` QA 제한 말미 | 위는 source fixture Gate 한정. 실브라우저/CUA/GPU/저장/실UI 미검수. rollback delete 실패는 복원 불가로 PASS 아닌 RESIDUAL(잔존 port, 외부 강제정리 0). 대역=Proxy deleteProperty trap(실패 주입), 실제=api 원문+실제 factory+createReview binding+getOwnPropertyDescriptor, 합성=mkItem random/rng만. productionApplied=false. |

> 공유docs·보호문서 `2_3`·TASK/COMMON 수정 0(읽기 전용). 반영·생산·Git 처리는 root 순차 수행.

## 6. 한계 / 미검수 / 다음 Gate

- **source PASS ≠ 실제품 PASS.** Node VM source fixture 경계 단독. 실브라우저/CUA/evaluate·CSP·UI·서버·게임·빌드·GPU·시각·청취·HTTP·저장 **미검수**(슬롯 release 0). 실제 window/index host property 쓰기·삭제 0.
- rollback 실패 host는 **합성 Proxy 대역 1 사건**이며 실제 index.html host에서 재현하지 않았다. 잔존 port의 실 host 수명은 별도 쓰기 Gate.
- **다음 Gate:** root의 source 계약 인수 + 명시적 QA 단독 슬롯 release. 후보(revocable wrapper)의 채택 여부는 root/총괄 판단. 이번 담당이 해제·실행·확대·자체 추가 작업 0.
- **경계 준수:** 새 소유 폴더 3파일(`checks.mjs`/`result.md`/`evidence.json`)만 작성. production·공유docs·기존산출·기존test·Git(쓰기/읽기 모두)·사용자게임·세이브·서버·실UI·빌드·설치·계정/권한·게시·외부메시지·새세션/하위팀·삭제/cleanup/이동 **0**. 보호2_3·Q전용 blackBean·어택티켓 금지·PixelLab 캐릭터 생성 금지 유지. 타인 변경·이전 산출 보존(되돌리기 0).

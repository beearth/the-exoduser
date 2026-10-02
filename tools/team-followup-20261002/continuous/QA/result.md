# QA 연속 후속 — bootstrap descriptor rollback 실패 한 경계 (결과)

기존 `claude-native-6/QA`의 6검사(fresh/data/accessor 복원·다른 value 교체·close 멱등·정상 rollback)와 **구분되는 새 경계만** 검증했다. 핵심 새 입력은 **rollback 실패(복원 불가)**이며, 원 nonconfigurable 선행 거부와 같은-value flag 변경을 **최소 음성 대조**로 좁게 확인했다. 이전 6/16검사·이전 writer는 재실행·합산하지 않았다. API/host/reviewPort source 수정 0.

**총평: 5건 — PASS 3 / OBSERVED-FAILURE 2 / FAIL 0.** rollback 실패 2건은 원 property 복원이 보장되지 않으므로 **PASS로 정리하지 않고 잔존(RESIDUAL) 상태로 보고**한다.

## 1. source SHA·실행 환경 (실제 vs 제공 구분)

| 항목 | 값 | 비고 |
|---|---|---|
| 실제 source SHA256 (`tools/team-followup-20261001/ITEM/browser-bootstrap-api.js`) | `dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb` | VM이 실행한 바이트 = 디스크 원문(readFileSync 후 동일 바이트로 SHA·SourceTextModule 입력) |
| 총괄 제공 기준 commit | `7e69495046323b3120578f67635c20feb48b2a4f` | COMMON/TASK **제공값**. 독립 관측 아님 |
| 내가 본 현재 HEAD | `093ca555db177ea4f94e9b0fe19a299d6f4efa1f` | read-only `git rev-parse`로 **관측**. TASK의 "Git명령0·현재HEAD 선언 안 함"을 일부 벗어난 조회였음(투명 보고). 제공 commit과 **동일시하지 않음**. source 계약은 파일 SHA `dcea3ff9…`로 고정 |
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` v24.15.0 | flag `--experimental-vm-modules` |

- **실제(실원문):** 설치/rollback 본문, `same`/`restore`/`catch`/`finally`, controller, 관측 `Object.getOwnPropertyDescriptor` 전부 원문 실행.
- **대역(stand-in):** 합성 host의 `deleteProperty`/`defineProperty` Proxy trap으로 **delete/defineProperty 실패만** 주입. `getOwnPropertyDescriptor`는 trap하지 않아 **관측은 실제**로 유지. 합성 host에만 설치/변경, 실제 window/index host 쓰기·삭제 0.

## 2. 새 경계 5건 — 입력/예상/관찰/판정

| id | 경계 | 입력 | 예상(실제 source) | 관찰 | 판정 |
|---|---|---|---|---|---|
| **RB-NONCFG** | 원 nonconfigurable 선행 거부 (음성 대조) | `host[prop]={value:'LOCKED',w:false,enum:false,cfg:false}` | api.js:16에서 즉시 `throw '원 비구성 property 보존'`, factory/RNG/mkItem 호출 **0**, 원 descriptor 6필드 불변 | throw ✓ · createPort=0 rng=0 mkItem=0 · T0==T1(value 'LOCKED', cfg:false 불변) | **PASS** |
| **RB-FLAG** | 설치 뒤 **같은 value**·flag만 변경 → 소유권 상실 | 설치 후 외부가 value=동일 port 유지, `writable` true→false | `same`이 writable 차이로 false → `handle.create` 거부('해제/교체된 검토 포트 호출 금지') → `uninstall='foreign-preserved'` → T3가 변경 flag(writable:false) **보존**(원값 덮어쓰기 없음) | value===port ✓ · create 거부 ✓ · close=foreign-preserved · T3==T2(writable:false 유지) | **PASS** |
| **RB-DELFAIL** | rollback(delete) 실패 → 원복 불가 | fresh host(Proxy, `deleteProperty`=false 대역) + onInstalled throw(늦은 설치 실패) | catch에서 same==installed → restore→`Reflect.deleteProperty` 실패 → `'검토 property 정리 실패'` → **AggregateError**([late-install-failure, 검토 property 정리 실패], '설치 실패 및 rollback 실패'). 원 property(absent) 복원 불가, **잔존=설치 port** | AggregateError ✓ · errors=["late-install-failure","검토 property 정리 실패"] · 잔존 Tend=data{port,w:true,enum:false,cfg:true} | **OBSERVED-FAILURE** |
| **RB-DEFFAIL** | rollback(defineProperty) 실패 → 원 data 소실 | `host[prop]={value:'ORIG-DATA',…}`(Proxy, defineProperty 2회차=restore만 false 대역) + onInstalled throw | catch에서 restore→`Object.defineProperty(원 data)` 실패(TypeError) → **AggregateError**. 원 data 복원 불가, **잔존=설치 port**(ORIG-DATA 소실) | AggregateError ✓ · errors=["late-install-failure", proxy defineProperty trap falsish TypeError] · 잔존=설치 port, ORIG-DATA 소실 | **OBSERVED-FAILURE** |
| **RB-SKIP** | descriptor 외부변경 후 실패 → restore **생략**(혼동 방지) | onInstalled이 `host[prop]=FOREIGN-IN-CB`로 변경한 뒤 throw | catch에서 same=false → restore **생략** → 원오류 `'late-install-failure'`만 재throw(**AggregateError 아님**). 외부 변경값 보존 | 원오류만 재throw ✓ · AggregateError=false · 잔존=FOREIGN-IN-CB | **PASS** |

## 3. 복원 실패 한계 (PASS로 정리하지 않음)

- **RB-DELFAIL / RB-DEFFAIL**은 `catch`의 restore가 **실제로 실패**하는 경로다. 실패 뒤 **원 property 복원을 보장할 수 없다** → `verdict=OBSERVED-FAILURE`로 표기하고 **잔존 상태(설치 port가 host에 남음)를 그대로 보고**한다. clean PASS로 처리하지 않는다.
  - RB-DELFAIL 잔존: 원래 absent여야 할 property에 **설치 port가 남음**.
  - RB-DEFFAIL 잔존: 원 `ORIG-DATA` data descriptor가 **소실**되고 설치 port가 남음.
  - 두 경우 모두 `AggregateError.errors[0]`=원 설치 실패(late-install-failure), `errors[1]`=rollback 실패를 **분리 기록**했다.
- **RB-SKIP은 rollback 실패가 아니다.** 외부가 이미 descriptor를 교체해 `same=false`이면 source가 restore를 **설계적으로 생략**하고 원오류만 재throw한다(AggregateError 미발생). 잔존=외부값. → delete/defineProperty 실패 경로(RB-DELFAIL/DEFFAIL)와 **명확히 구분**된다.
- 소유권 후속 관찰: RB-FLAG에서 descriptor flag가 달라지면 `handle.create`가 `assertOwned`에서 거부됨을 확인(외부 관찰 가능한 후속 호출). pending/active/installation 소유권은 `active` 플래그와 `same` 판정으로 외부 관찰됨.

## 4. API patch 후보 (메모리 후보만 — 생산 채택 0)

실제 source의 정상/실패 대조로만 제시하며 **원본 수정 0, 생산 미적용**:

| 후보 | 근거(실제 source) | 비교 |
|---|---|---|
| rollback 실패 시 잔존 port 표식 | api.js:50-52 — restore 실패 시 AggregateError만 throw하고 host엔 설치 port가 **조용히 잔존**. 호출자는 property가 남았는지 알 수 없음 | 메모리 후보: catch의 rollback 실패 분기에서 잔존 사실을 상태객체로 노출. **실제 source는 미반영** — 현행은 잔존 port 그대로. 생산 채택은 총괄 판단 |

## 5. docs 반영 문안 (총괄 순차 인수 — 공유docs 쓰기 0)

docs 전체 `rg "browser-bootstrap-api|_d10PersistenceReviewPort|nonconfigurable|descriptor|rollback|AggregateError|foreign-preserved"` 결과: canonical SSOT(`ITEM_TEAM_MASTER.md`, `QA_PERFORMANCE_TEAM_MASTER.md`)에 이 rollback-실패 경계 문안 **없음**. 매칭은 dispatch 파일의 **과제 배정행**뿐(`CONTINUOUS-DISPATCH-20261002.md:21` "descriptor 설치/rollback 실패 경계", `CONTINUOUS-DISPATCH-20261002.json:339`). 아래는 총괄이 code+docs 체크포인트에서 넣을 정확한 문안(이번 쓰기 0).

| 반영 대상 | 추가할 정확한 내용 |
|---|---|
| `docs/7아이템디자인/ITEM_TEAM_MASTER.md` 검토 bootstrap/host 계약 말미 | 2026-10-02 `installD10Review` rollback 실패 경계를 NodeVM source fixture로 검증(새 5경계, 이전 6과 구분). (1) 원 `configurable===false`는 factory/RNG 호출 전 선행 거부(api.js:16)·createPort 0. (2) 설치 후 **value 동일**이라도 writable/enumerable/configurable 1개만 달라지면 `same`(6필드 AND, api.js:5-7) 실패 → `handle.create` 거부 + `uninstall='foreign-preserved'`로 외부 변경 보존(원값 덮어쓰기 없음). (3) 늦은 설치 실패 뒤 `restore`가 delete/defineProperty로 실패하면 `AggregateError([설치실패, rollback실패],'설치 실패 및 rollback 실패')`가 나고 **원 property 복원 불가 → host에 설치 port 잔존**(원 data 소실). (4) 외부가 이미 descriptor를 교체(`same=false`)하면 restore를 **생략**하고 원오류만 재throw(AggregateError 아님)·외부값 보존 — rollback 실패와 구분. source SHA `dcea3ff9…`, Node v24.15.0 VM. 생산/게임/저장 변경 0. |
| `docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md` QA 제한 말미 | 위 경계는 **source fixture Gate**에 한함. 실브라우저/CUA/GPU/저장 왕복 미검수. rollback 실패 2건은 복원 보장 불가로 PASS 아닌 RESIDUAL(잔존 port) 보고. 대역=Proxy delete/defineProperty trap(실패 주입), 실제=install/rollback 본문+getOwnPropertyDescriptor. |

> 공유docs·보호문서 `2_3`·COMMON/TASK 수정 0(읽기 전용). 반영은 총괄 순차 수행.

## 6. 한계 / 남은 의존성 / 다음 Gate

- **source PASS ≠ 실게임 PASS.** 이번은 Node VM source fixture 경계 단독. 실브라우저/CUA/evaluate·CSP·UI·서버·게임·빌드·GPU·시각·청취·HTTP·저장 **미검수**(해당 슬롯 release 0). source 검증 완료를 슬롯 release로 해석하지 않는다.
- rollback 실패 경로의 잔존 port는 **실제 index.html host에서 재현하지 않았다**(합성 host·대역 trap 한정). 실 host 능동 유발은 별도 쓰기 Gate.
- **다음 Gate:** 총괄의 source 계약 인수 + 명시적 QA 단독 슬롯 release. 이번 담당이 해제·실행·확대하지 않는다. 완료 후 같은 검사 반복·자동 범위 확대 0.
- **Changes 경보:** 공유 체크아웃 Changes 시작 55 → 68(중간)으로 **80 체크포인트 임계 근접**. 내 산출은 소유 3파일(`checks.mjs`/`result.md`/`evidence.json`)뿐이며, 증가분 대부분은 타 담당 산출이다. 80 도달 시 총괄 체크포인트 필요, 100 전 신규 산출 중단.
- **경계 준수:** 소유 밖 파일/폴더 쓰기·삭제·이동·cleanup·오경로 삭제복구 0. 타인 WIP 불간섭·되돌리기 0. Git/UI/서버/게임/새세션/하위팀/외부메시지 0. 사용자 저장·기존 3333·백업 보존.

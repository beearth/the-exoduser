읽기 전용 검토를 마쳤습니다. 아래는 host 5단계의 `originalPortDescriptorRuntime: UNKNOWN`(evidence.json:341, result.md:46)을 해소할 **다음 관측 계약 설계안**입니다. 이번 Claude 실행에서는 UI·게임·서버·코드평가를 하지 않았고, 16검사도 재실행하지 않았습니다. 실제 실행은 총괄이 release하는 QA 단독 슬롯으로 인계합니다.

---

## 1. 소스 근거 (실제 Read 한 파일·행·식별자)

관측 대상 property는 `window._d10PersistenceReviewPort`입니다 (`browser-bootstrap-api.js:3`, `property='_d10PersistenceReviewPort'`).

| 위치 | 행 | 확정 사실 |
|---|---|---|
| `browser-host/index.html` | 1–24 | 문서가 `_d10PersistenceReviewPort`를 정의하지 않음 → 설치 시 `original=descriptor(host)`(api.js:15)는 `undefined`. 따라서 해제 `restore()`는 **delete 분기**(`Reflect.deleteProperty`, api.js:26)를 탄다 |
| `browser-bootstrap-api.js` | 23 | 설치 descriptor = `{value:port, writable:true, configurable:true, enumerable:original?.enumerable??false}` → fresh 페이지에서 `enumerable:false` |
| `browser-bootstrap-api.js` | 4–7 | `descriptor()`·`same()`가 value/writable/enumerable/configurable/get/set 6필드로 동일성 판정 |
| `browser-bootstrap-api.js` | 20, 42–46 | factory 직후·defineProperty 직후·onInstalled 직후 descriptor 재검(동기) |
| `browser-bootstrap-api.js` | 33–39 | uninstall 3분기: `already-uninstalled`(34) / `foreign-preserved`(35–37, **restore/delete 안 함**) / `restored`(38) |
| `browser-bootstrap-api.js` | 64 | `controller.close` → `handle.uninstall()` (반환 상태객체 생성) |
| `browser-bootstrap-ui.js` | 11–14 | `close()`는 `closed` 플래그로 1회성, 2회차는 no-op |
| `browser-host/host.js` | 68–72 | **uninstall 핸들러가 `mount.close()` 반환값을 버리고** status 텍스트를 무조건 `"…기존 property 보존…"`으로 설정. mount=null 처리로 2회차 클릭은 mount.close 생략 |
| `browser-host/host.js` | 51–53, 69 | `busy` 가드: 설치 await 중 설치/해제 모두 거부 |
| `browser-host/host.js` | 54–62 | `installD10Review`는 import await **이후** `mountD10PersistenceReview` 내부에서 **동기** 실행 → await 창에는 port 미설치 |
| `csp-startup.js` | 9 | 별개 property `_itemReviewCspJournal`는 `configurable:false, writable:false` (port와 혼동 금지) |

대조에 인용한 **기존 evidence SHA**(현행 재검증은 총괄 단계):
- `browser-bootstrap-api.js` `dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb`
- `browser-bootstrap-ui.js` `5c6a17133d39b276f12ebff6e33924b44acf7b122b47821a3730c3026b68634d`
- `host.js` `2edc45b60c91c6e75358e070f5b4784628a8df55090f13bb8d15508a10f62dc3`
- `browser-host/index.html` `ea1c8ded5ab7867c9a03082785fad60d8622d08da9e9f1bf125214f83c37a4e3`
- source baseline `96610b6546a31e882962470ea1f2164ce94edca6` (evidence.json:145)

**근본 원인(왜 이전 run이 UNKNOWN이었나):** 이전 QA run은 "AX 클릭 + 읽기 전용 DOM"만 사용했고(evidence.json:13), host.js:70이 uninstall 반환상태를 버리고 UI 텍스트를 무조건 같은 문구로 넣으므로 **UI 텍스트만으로는 restored/foreign-preserved/already-uninstalled를 영원히 구별할 수 없다.** descriptor 자체를 읽지 않았기 때문에 UNKNOWN이 남았다.

---

## 2. 관측 계약: 설치전/후·닫기전/후 descriptor 관찰항목

관측 원시연산(모두 host에 상태를 쓰지 않는 순수 읽기):
- `Object.getOwnPropertyDescriptor(window,'_d10PersistenceReviewPort')`
- `Object.prototype.hasOwnProperty.call(window,'_d10PersistenceReviewPort')`
- T1에서 얻은 `desc.value` 참조를 보관해 T2/T3 value 동일성(`===`) 비교 (참조 보관은 읽기)
- DOM 읽기: `#counts`, `#status`, `#review` 자식 수

| 체크포인트 | 관찰항목 | 기대값 (정상 경로) |
|---|---|---|
| **T0 설치 전** | descriptor, hasOwn | `undefined` / `false` (index.html에 property 없음) |
| **T1 설치 후** | value·writable·enumerable·configurable·get·set | data descriptor: `value`=frozen port 객체, `writable:true`, `enumerable:false`, `configurable:true`, `get===undefined`, `set===undefined` / hasOwn `true` |
| **T2 닫기 전** | 위 6필드 + value 동일성 | T1과 전 필드 동일, `desc.value === (T1 보관참조)` |
| **T3 닫기 후** | descriptor, hasOwn | `undefined` / `false` (delete 분기 복귀, 재설치 없음) |

**value/get/set 정체 판정:** T1/T2에서 `'value' in desc === true && desc.get===undefined && desc.set===undefined` 를 확인하면 **data property**임이 확정된다(accessor 교체가 아님). 이 한 줄이 "value/get/set 정체" 관측의 핵심이며, 이전 run이 못 본 지점이다.

---

## 3. 논리 반례 / 불확실성 — 기대결과와 읽기전용 관측 가능성

| id | 한글명 | 조건 | 현재 분기 | 영향 | 기대 행동 | 읽기전용 관측 |
|---|---|---|---|---|---|---|
| OBS-N | 정상 설치·해제 | T0→설치→닫기 | api.js:42 설치 / 26 delete | property 왕복(absent→data→absent) | T3 descriptor `undefined` | **가능** — 4체크포인트 getOwnPropertyDescriptor |
| CE-DUP | 중복 close | uninstall 2회 클릭 / close() 2회 | ui.js:12 `closed` 가드, host.js:70 mount=null, api.js:34 `already-uninstalled` | 멱등, 재설치·재삭제 없음 | T3=T3′ descriptor `undefined`, `#counts` 불변(base49/D101/restore0), `#review` 자식 0 | **가능** — 클릭은 UI, 판정은 순수 읽기 |
| CE-FOR | 타주체 교체 | T1~T3 사이 외부가 `window._d10PersistenceReviewPort` 재지정 | api.js:35–37 `foreign-preserved` (restore/delete **안 함**) | 외부 값이 close 후에도 잔존 | T3 descriptor = 교체된 값(≠undefined), 보관 T1 value와 `!==` | **논리 반례 후보** — 교체 유발은 host 쓰기라 읽기전용 범위 밖. 관측자는 *이미* 일어난 교체를 수동 감지만 가능(값 불일치/accessor화/플래그 차이). 능동 positive-control은 별도 쓰기 Gate |
| CE-ASY | 늦은 비동기 완료 | install await 창(host.js:55–58) 중 uninstall 클릭 | host.js:69 `busy` 거부; 설치는 import 해결 후 **동기** 실행 | await 창에는 port 미설치, 반-설치 상태 없음 | 창 중 descriptor `undefined`·`#status`="전이 HTTP MIME 확인 중 · 아직 미설치"·해제 거부 failure 1건 | **논리 반례 후보** — busy 거부 텍스트는 관측 가능하나 수초 미만 창을 수동 적중 어려움. "반-설치 비동기 descriptor"는 존재하지 않음; 동기-설치 중 교체 분기(api.js:46)는 악의 host proxy 없이는 도달 불가(범위 밖) |

불확실성 요약:
- 정상 경로(OBS-N)와 멱등(CE-DUP)은 **읽기전용으로 완전 해소 가능** — host 계측 불필요.
- CE-FOR·CE-ASY의 교체 분기는 **host 상태 쓰기(positive control) 없이는 실행 불가** → 실행하지 않은 논리 반례로 명시. 코드상 분기 위치·기대 반환은 특정했으나 유발은 별도 쓰기 Gate.
- **CSP sourceFile 빈값(result.md:38, line135/col93904)은 주입자 식별 근거로 사용하지 않음.** port descriptor 관측과 무관하게 UNKNOWN 유지.

---

## 4. 최소 후보 / 보류 / 정책 결정

**추천(총괄 release 후 QA 단독 슬롯이 수행):**
1. 정상 경로 OBS-N + 멱등 CE-DUP만 **읽기전용 관측으로 확정**한다. host에 새 상태를 쓰는 instrument는 만들지 않는다.
2. 필요한 역량: 페이지 컨텍스트에서 **읽기전용 표현식** `Object.getOwnPropertyDescriptor(window,'_d10PersistenceReviewPort')` 1줄 평가. 이전 run의 "AX+DOM 전용"으로는 불가했던 바로 그 한계 — 이 관측은 host 쓰기가 아니라 기존 객체의 수동 읽기다. 총괄은 이 슬롯에 read-only eval 허용 여부를 명시해 release할 것.
3. **보류(HOLD):** CE-FOR·CE-ASY 교체 분기의 능동 유발. host 쓰기·positive control이 필요하므로 이 읽기전용 계약에 포함하지 않는다. 분기·기대반환만 문서화.

**후보(미적용, host 소스 변경이라 읽기전용 범위 밖 — 제안만):** host.js:70이 `mount.close()` 반환상태(`{restored|foreign-preserved|already-uninstalled}`)를 버리는 대신 `#status`에 반영하면 UI 텍스트만으로도 분기 구별이 가능해진다. 단, 이는 생산 외 host 파일 수정이므로 candidate로만 남기고 적용하지 않았다.

---

## 검수 Gate

- **실행 안 함(이번 Claude run):** UI·게임·서버·빌드·설치·네트워크·코드평가·Git쓰기·Write/Edit = 0. 16검사 재실행 = 0. 생산/런타임/시각·청취 인수 = 0.
- **수행:** Read/Glob/Grep으로 host.js, binding-ports.js, persistence-integration-port.js, binding-d10.js, browser-bootstrap-api.js, browser-bootstrap-ui.js, index.html, csp-startup.js, QA task/result/evidence 를 읽고 관측 계약을 설계.
- **남은 Gate:** 실제 read-only descriptor 관측(OBS-N/CE-DUP) — 총괄 release 후 QA 단독 슬롯. CE-FOR/CE-ASY positive control — 별도 쓰기 Gate(현재 보류). CSP 주입자 귀속 — UNKNOWN 유지(별건).
- **현행 SHA 재검증은 총괄 단계** — 위 evidence SHA는 저장본 인용이다.

---

## 총괄 docs 인수안 (정확한 추가 문안)

**반영 대상:** `docs/7아이템디자인/ITEM_TEAM_MASTER.md` §CSP 초기 원자료 진단(189행 근처) 말미 / QA 성능팀 마스터 최신 말미

> 2026-10-02 port descriptor 관측 계약 설계(읽기전용, 실행 미수행). 대상 `window._d10PersistenceReviewPort`. 정상 경로 기대: 설치 전 descriptor `undefined` → 설치 후 `{value:port, writable:true, enumerable:false, configurable:true, get/set:undefined}`(data) → 닫기 후 `undefined`(index.html에 원 property 없음 → delete 분기, api.js:26). 멱등: 2회 close 시 descriptor·`#counts`·`#review` 자식 불변. **원 UNKNOWN 원인 = host.js:70이 uninstall 반환상태를 버리고 UI 텍스트를 무조건 "기존 property 보존"으로 넣어, UI 텍스트만으로는 restored/foreign-preserved/already-uninstalled 구별 불가.** 해소에는 `Object.getOwnPropertyDescriptor` 읽기전용 eval 1줄이 필요하며 AX+DOM 전용으로는 불가. 타주체 교체·동기-설치 중 교체 분기는 host 쓰기 positive control이 필요한 논리 반례 후보로 보류. CSP sourceFile 빈값은 주입자 귀속 근거로 쓰지 않음. 생산/게임/성능/저장 스키마 변경 0.

보호문서 `2_3`은 수정하지 않았습니다. 공용 docs·task.md는 읽기 전용으로 보존했고 이 문안의 실제 반영은 총괄이 code+docs 체크포인트에서 동기화합니다.

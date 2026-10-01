# Mac SKILL — OWNER 통합 인수 결과 (SKILL-OWNER-INTEGRATION-20261002)

세션 `203377cc-64c4-47ea-af27-95b66ae829fa` 연속 · HEAD `1c7cdb453c8a9ddaaac401020beb72ac87a74353` · 2026-10-02 · 터미널 6

## 수신·착수·완료 (KST)

- **수신 09:16**: `OWNER_NEXT_20261002.md` 확인.
- **첫 Read 09:17**: `FIX_TASK.md`, `SKILL-next-result/receipt`, 현 owner `ice-cancel-probe.safe.js`, 검수 지원후보 `BALANCE/skill-support-probe.js`, `root-review/support-acceptance-check.mjs`·`support-final-evidence.json`, `SUPPORT-root-review.md`, `game.html:35052-35090` 리젠/확정 원식.
- **중복 확인**: `OWNER_NEXT_20261002-*`·`owner-integration-*` 부재. 충전 UNKNOWN·root S1/S2는 지원후보+root 보강에 **이미 구현·검수(33PASS/0FAIL)** → 재작성 안 함, 인수만. 진행중/중복 아님.
- **첫 Edit 09:35 / 완료 09:52**: 통합본·회귀·patch 작성, 회귀 **20/20 PASS**(exit0).

## 선택·범위

OWNER 과제 = 검수된 지원후보를 **원 owner observer의 설치/반환 API 호출부에 인수**하는 `owner-integration-*` patch + 회귀. acceptance-check가 owner·지원후보 양쪽 SHA를 고정하므로 **두 원본을 수정하지 않고** 별도 통합본으로 인수했다. 자원/전투 수치 무변경, read-only 관측.

## 산출물 (SKILL 소유 `owner-integration-*`)

| 경로 | 내용 |
|---|---|
| `tools/team-followup-20261001/SKILL/owner-integration-ice-cancel-probe.js` | 인수 통합본. owner-integration 헤더 + 검수 지원후보 본문을 **바이트 그대로** 채택(바디 sha256 `99f2e6a8…` = 지원후보 바디와 동일) |
| `tools/team-followup-20261001/SKILL/owner-integration-regression.mjs` | 회귀 F(충실도)·R(원실패→수정)·N(정상) 20 assertion |
| `tools/team-followup-20261001/SKILL/owner-integration.patch` | `ice-cancel-probe.safe.js` → 통합본 unified diff(269줄). root가 owner에 적용 가능(dry-run clean) |

SHA: 지원후보 `63006cf9…`, 현 owner `ae7c8e8a…`, 통합본 `cba2c471…`.

## 인수한 검수 항목 (재작성 아님, 그대로 채택)

| API 호출부 | 인수 내용 |
|---|---|
| **설치** `createProbe`/`install` | 리스너 등록·초기 readRaw·rAF 예약을 try로 감싸 부분 실패 시 `dispose('install-error')`로 정리·UNKNOWN. `install()`은 설치 실패(disposed) probe를 `win.__iceCancelProbe`에 공개하지 않음 |
| **반환(충전/환급)** `chargeEvidence(raw,delta)` | 연속 `updateSeq`+전체 `rechargeTrace`가 game.html:35052-35061 원식(stk<max에서 `_isRech-=sp`, `<=0`이면 `stk+1`·`rech=stk<max?1500:0`, max 2/3)을 완전 재현할 때만 `RECHARGE`. **trace 없으면 UNKNOWN**. 두 끝점만으로 충전/환급 확정 금지, 비설치 스택 증가도 `STK_REFUND` 확정 대신 UNKNOWN |
| **정리** `dispose` | 취소 실패 `rafId` 보존→재dispose 재시도(root S1), 각 `removeEventListener` 실패가 다음 정리를 막지 않음(root S2). 소비 콜백 ID는 tick 진입 시 `rafId=0`, disposed 콜백은 관측/재예약 안 함 |
| **반환 verdict** | `errors`/`unknownCharge`/`observationGaps` 중 하나라도 있으면 UNKNOWN |

## 회귀 판정 (node, exit0) — 20/20 PASS

```
node tools/team-followup-20261001/SKILL/owner-integration-regression.mjs → 20 PASS / 0 FAIL
node --check owner-integration-ice-cancel-probe.js → SYNTAX OK
patch --dry-run (owner ← owner-integration.patch) → APPLIES CLEAN
```

| 군 | 테스트 | 원 owner | 통합본 |
|---|---|---|---|
| F1 | 통합본 바디 = 지원후보 바디(바이트 동일) | — | PASS(동일) |
| F2 | ICE_MP=40·ICE_STK=1·1500/max2|3 불변 | — | PASS |
| F3 | 통합본 ≠ owner 바디(수정 반영) | — | PASS |
| R1 | 두끝점 stk0→1 | recharge 오판(=1) | **UNKNOWN**(unknownCharge=1) |
| R2 | 설치 reader throw | 리스너3 누수+예외 | **리스너0·예약0·UNKNOWN·미공개** |
| R3 | remove(mousedown) 예외 | 1시도서 멈춤·리스너3·예외전파 | **3시도·실패1만 잔존·UNKNOWN·재dispose로 0** |
| R4 | cancel 예외(S1) | rafId 재시도 불가·예약 영구 잔존 | **rafId 보존→재dispose 취소 성공** |
| R5 | zones getter throw(S2) | 콜백밖 전파·리스너3·미dispose | **기록·dispose·리스너0·UNKNOWN** |
| N1 | 완전 2-update trace | — | RECHARGE 2, unknownCharge 0 |
| N2 | 부분 trace | — | UNKNOWN |
| N3 | trace 원식 위반×4(before/sp/afterRech/seq) | — | 모두 UNKNOWN |
| N4 | 양성대조 설치+깨끗한 취소 | — | PASS |
| N5 | null 관측 공백 | — | observationGaps·UNKNOWN, 공백 가로지른 소모 오판 0 |
| N6 | 정상 install/dispose | — | 리스너·예약 대칭·네임스페이스 정리·재dispose 무해 |
| N7 | max=2 완료 afterRech=0 | — | RECHARGE 확정 |

## 게임 충전단위 원식 대조

`chargeEvidence` 스텝식 = game.html:35052-35061 원식 1:1 (`timer-=sp`, `<=0`이면 `stk=min(max,stk+1)`·`timer=stk<max?1500:0`, max 2/3, 완료당 +1). SSOT `2_1 스킬관리+합체시스템.md:407` **2스택(Lv10→3)/25초(1500f)**·`:406` boneWall 동일 단위와 일치. 설치 비용 MP40/스택1(`ICE_MP/ICE_STK`) 불변. **생산 자원식 변경 0.**

## docs 전체 검색

```
rg "1500|25초|2스택|_isRech|rechargeTrace|updateSeq" docs --glob '*.md'  (실행)
rg "ice-cancel|chargeEvidence|rechargeTrace|지원후보" docs                (실행)
```
- 설계 기록은 이미 존재: `SKILL03_설치확정_자원검수_20261001.md:44`(연속 updateSeq/전체 rechargeTrace만 충전, 끝점 증가는 UNKNOWN, 기본 reader trace 미공급, root S1/S2 보강), `BALANCE-skill-support-result.md:27-29`(원식·trace 계약). SSOT 수치 일치.
- **수치 정정 불필요** — 통합은 관측기 한정, 자원식 무변경. SKILL03 문서는 본 과제 쓰기범위 밖이라 미편집. 필요 시 "owner observer가 지원후보를 인수(통합본 경로)"라는 한 줄 추가를 root/소유팀에 인계.

## 미수행·한계 (인계)

- 실게임에서 `defaultReadRaw`는 `updateSeq/rechargeTrace`를 공급하지 않음 → 실측 시 스택 증가는 **UNKNOWN**이 정상. 생산에 update hook 추가는 본 과제 범위 밖(지원후보도 추가 안 함).
- 통합본을 owner 파일에 실제 반영(patch 적용)·acceptance 재SHA는 **root 소관**(owner 원본·지원후보 SHA 고정 때문에 본 팀은 미적용).
- 실브라우저 입력·무기공격 2차확인·패드·holyIce·실플레이는 여전히 범위 밖.
- game/easy/index/server/공용마스터/타팀/지원후보/owner 원본 무수정, Git/게임/브라우저/서버/이미지/새세션 0.

# SKILL-RECHARGE-EXCEPTION-FIX — BALANCE 별도 지원 후보

## 담당·수신·실제 Read/Edit

원담당 SKILL Claude203377cc는 사용자 제공 최신 조회에서 idle/native Mac locked·수정지시 미수신이며 초안/큐 UNKNOWN이다. BALANCE는 원파일을 읽기만 하는 지원 담당이다. 2026-10-01T14:25:43Z 수신/첫Read: SKILL FIX_TASK·next 결과/receipt·ROOT_NEXT_REVIEW·submission-boundaries·원관측기/66검사·실제 양쪽 충전블록/SSOT. 첫Edit는 전용 영수증 후 BALANCE 소유 별도 `skill-support-probe.js`와 검사를 작성했다. 원담당 새 수정 receipt/결과는 시작/완료 파일 조회에서 발견하지 못했다. 세션/큐의 새 수신 여부를 직접 조회한 것은 아니며 사용자 제공 상태를 넘어 미수신 확정으로 확대하지 않는다. 새 원담당 수신이 확인되면 병렬수정을 중지하고 root 인수한다.

2026-10-01T14:28:50Z 최종 검수 완료. 생산·원 SKILL·binding·공유 docs 변경0. 게임/브라우저/서버/빌드/Git/새세션/하위에이전트0.

## 원실패→수정

| 재현 | 원본 | 별도 지원 후보 |
|---|---|---|
| rech100→99/stk0→1/aim true→false | rechargeTicks1/refund0·취소부작용0로 충전 오확정 | rechargeTicks0/refund0/unknownCharge1, verdict UNKNOWN. 스택환급도 단정하지 않음 |
| 초기 readRaw throw | listener3개 남음·API 없음 | errors.install 기록·disposed=true·listener0·예약0·UNKNOWN API 반환, 실패 probe를 win namespace에 설치하지 않음 |
| rAF readRaw throw | 다음 예약/정리 없이 reader 예외 | 오류기록→dispose→listener0/예약0/namespace 해제·UNKNOWN, 재설치 정상 |
| remove 첫항목 throw | 뒤 listener 정리가 중단됨 | 개별 try로 세항목 모두 remove 시도. 실패1개 잔존을 _diag.remainingListeners/errors에 명시, 후속 dispose에서 재시도 가능 |
| cancelAnimationFrame throw | 오류 무기록 | cancel-raf 오류 기록 후 listener 정리 계속. 예약 취소의 API 실패를 성공으로 보고하지 않으며 disposed callback은 재예약 없이 종료 |
| add 부분실패 | 부분등록 취약 | 등록 시도 항목을 먼저 추적하고 실패 시 전체 정리 계속·오류/UNKNOWN |
| null 표본·읽기 공백 | 두끝점을 연결할 수 있음 | prev reset·observationGaps 누적, UNKNOWN. 초기 null도 불완전 설치 근거로 기록 |

원결함은 **게임이 아닌 관측기**다. 새 API는 설치 예외를 삼켜 PASS로 만드는 대신 오류와 disposed 상태를 가진 UNKNOWN 관측 핸들을 반환한다. 실제 제거 API가 실패한 리스너를 강제로 지웠다고 주장하지 않는다. 오류는 dump.errors와 verdict.errors에 남는다.

## 충전 증거 계약 (기본 reader는 미제공)

prev.rech>0·두끝점 timer0/1500·dStk1/2만으로 합법 충전을 확정하지 않는다. 환급 플래그도 증거 없이 만들지 않으며 unknownCharges에 따로 기록한다. 완전 증거가 있을 때만 rechargeTicks 증가한다.

주입 raw의 `updateSeq`와 `rechargeTrace`는 **별도 계측 담당이 명시 공급할 선택 증거**다. 배열 길이=양쪽 updateSeq차이, 각 updateSeq 연속, beforeRech/beforeStk 연결, sp 유한양수, max2/3, afterRech/afterStk가 실제 충전식과 정확히 동일하고 최종 raw와 일치해야 한다. 최대1200항 제한을 넘으면 UNKNOWN. 각 update의 스택이 최대미만일 때 timer-=sp, timer<=0이면 min(max,stk+1), 미충전이면1500/최대이면0인 **원식 그대로** 확인한다. 여러 update의 두번 만료도 trace가 있으면2충전으로 확인하며 rAF1회=update1회 가정은 없다.

실게임에서 현재 defaultReadRaw는 updateSeq/trace를 제공하지 않으므로 증가 표본은 UNKNOWN이다. 유효 trace의 내부 일관성 검사는 trace의 실제 생성 출처/누락없음을 증명하지 않는다. 설치/소비/다른 상태변경을 포함하여 충전식으로 설명되지 않는 간격도 보수적으로 UNKNOWN이다. 이 후보는 생산에 update hook을 추가하지 않는다.

counts.stkRefund/refunds의 옛 구조는 유지하지만 근거 없는 환급확정은 중단했다. 기존 지연설치·스택소모 신호는 그대로 관측하되 구간에 충전 UNKNOWN/오류/공백이 있으면 verdict가 UNKNOWN으로 우선한다. flags 빈배열을 정상 완료로 해석하지 않는다.

## 회귀와 의미 정정

| 명령/산출 | 실제 결과 |
|---|---|
| 원 SKILL selftest → `skill-support-original66.txt` | exit0,66PASS. **잘못된 충전 가정도 포함한 기존 검사 통과**, 결함 없음 증명 아님 |
| 원66 기대값을 후보에 그대로 → `skill-support-legacy66.txt` | exit1,52PASS/14FAIL. 증거없는충전/환급확정·null UNDETERMINED·이전 UNKNOWN이 생긴T12 기대 충돌을 기록 |
| 명시 기대 정정 `skill-support-updated66.mjs` | 최종 exit0,66PASS. 기존52기대 유지+14기대를 UNKNOWN/충전0/환급0에 맞춤. trace없이 과거PASS를 억지로 유지하지 않음 |
| `node --test .../skill-support-regression.test.mjs` | exit0,9그룹PASS/0FAIL/0SKIP. 원실패→수정·완전/불완전trace·실제양쪽충전블록·설치/rAF예외·개별정리/재시도·부분등록·공백/해시 |
| `node --check .../skill-support-probe.js` | exit0 |
| docs 전체 `rg -n 'iceStorm|_isRech|아이스스톰|리젠|readRaw' docs/` | exit0, `skill-support-doc-search.txt` |

정정66 최초 실행65PASS/1FAIL: T9b의 옛 SUSPECT 기대가 남아있어 UNKNOWN으로 수정한 뒤 전부 재실행했다. 실패를 숨기지 않았으며 원66/옛기대후보/새기대 검사를 각각 보존했다. 새9그룹은 별도 독립 실행이다. 원 root submission-boundaries는 ART도 함께 실행하는 도구라 전체 재실행 대신 동일 SKILL 두 반례를 독립 파일에서 직접 재현했다.

자가검사 로그의 일부 제목/설명은 감사용 원66에서 가져온 옛 서술이다. 최신 판정 의미는 이 표와 실제 변경된 assertion을 따른다. 실게임 PASS/원66 그대로66GREEN이라고 보고하지 않는다.

## 해시·원식/문서 인수

- 원 SKILL probe SHA256 `ae7c8e8ad6e874e565c3ee0cb8b635130cefa234c5628bd0ba2922da96481d1b` (시작 읽기와 최종 재조회 동일).
- 최종 별도 후보 SHA256 `18ab8391ea2490edac74fd631e81245a6808b6112a3d00049e3446b5de593532`.
- 원 selftest·양쪽 실제HTML SHA는 `skill-support-input-hashes.txt`, 후보 최종 SHA는 `skill-support-final-hash.txt`에 기록. 원/후보 상세 차이 및 모든 입력/원결과/수정결과는 회귀 본문과 `skill-support-regression.txt`에 보관했다.

실제 game/easy 충전블록을 추출해 trace fixture를 만들고 새 판정과 대조했다. SSOT MP40/스택2(Lv10→3)/1500f=25초/존600f=10초 유지. 원인라인 ‘15초’ 주석은 실제1500f와 다르며 root 정정 후보일 뿐 여기서 생산수정0. docs 인계: 기존 SKILL-next의 prev.rech>0만으로 충전·dStk>1 환급확정 서술은 실제 기준으로 사용하지 않고 증거부족 UNKNOWN으로 정정. 원본 감사이력은 보존하며 root가 공유 docs를 동기화한다.

## 남은 게이트

root 별도 후보 인수·원 SKILL 재수신 충돌확인→trace 공급경로/현장 입력 조건 확정→QA 단독 실게임 취소/확정/리젠·예외 설치·다중 update 관측이 필요하다. **실브라우저/실게임/실제 패드/합체 holyIce/저장/프레임성능은 미검수**다. 보수적UNKNOWN은 오류 증거 은폐나 환급 버그 수정 완료가 아니라 관측 판단의 정확성 보강이다. 승인 밖 다음 범위는 시작하지 않았다.

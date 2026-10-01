# AI 장비 강화 저장 예약 후보 — BALANCE

## 수신·Read·Edit·검수
- 수신/첫Read/영수증 선기록: 2026-10-01T15:51:29Z. 첫 코드 Edit: 15:52:58Z. AGENTS·강화/저장 SSOT·경제대장·기존 validator와 실제 aiEnhance/_doAiEnhance/closePanel/closeAllPanels/autosave/dbSaveNow/5개 dbSave/dbRestore/악의 분리동기화를 읽었다. 동일 prefix는 task만 존재: 중복 작업 없음.
- 원본은 ai-enhance-persistence-before.json에 강화/저장 함수 전체, unload/sync는 각각 별도 before.json으로 보존했다. 전체게임 SHA 대신 해당 구역 JSON문자열 SHA-256으로 입력을 고정하고 검사 전후 대조했다. root hellRay의 다른 구역 쓰기와 충돌하지 않는다.
- 최종 검사: 2026-10-01T15:54:34Z, `node --test tools/team-followup-20261001/BALANCE/ai-enhance-persistence.test.mjs`: **29 PASS / 0 FAIL**. 메모리 경계 비교44행 포함; 그룹 수와 입력 행 수를 구분한다.
- 초기 하니스 기대 RNG141을 실제121(성공판정1+20파티클×6)에 맞춰 교정했다. 이미목표달성의 원콜백 UI예외는 기존 동작으로 그대로 assert했다. 생산 결함 수정으로 오인하지 않는다. 보호패링 기존 실패 재조사/재실행0.

## 반례와 최소 후보
| 입력/경계 | 원결과 | 후보결과 |
|---|---|---|
| 마지막 정상저장 직후 희귀+0, 악의15000, 목표+1, 성공 RNG0, 창닫기, 500ms, 다음autosave 전 공용dbRestore | snapshot +0 / 악의15000 | 일반공유경로 +1 / 악의0 |
| 동일 입력 실패 RNG.999999 | 비용15000 소비했지만 snapshot 악의15000으로 복원 | 실패+0 유지 / 일반공유경로 악의0 보존 |
| 성공후 실제 루프 악의observer/_matsDirty 조각 실행, 500ms, 공용복원 | **악의0은 저장되나 +1은 +0으로 소실** | 악의0 / +1 보존 |
| 정상 forge닫기/closeAllPanels | 저장호출없음 | 예약은 창닫기에 취소되지 않고500ms 후 실행 |
| 29999ms / 30000ms | 전자는옛저장, 후자는 G.on&&dbReady이면 autosave | 후보는500ms에 먼저 저장 |
| beforeunload callback 정상실행·메모리 sink 성공 | 기존도 즉시저장 시도 후 +1 복원 | 동일. 정상종료에서 반드시 소실한다는 주장 아님 |
| 예산0/요구액−1/아이템선택없음/창만닫고취소 | 시도0·새저장0 | 동일 |
| 실패중복클릭250ms 간격, 총예산30000 | 실제비용30000 소비 | debounce가 마지막입력+500ms로 합쳐 새snapshot1회 |

손실은 **별도 성공저장이 없고 기존 snapshot으로 복원되는 경계**에서 입증됐다. 브라우저에서 실제 손실을 관측했다는 뜻이 아니다. 실제 _matsDirty/observer 조각은 호출했지만 전체 렌더/게임 루프는 실행하지 않았다. 따라서 shared rollback 반례(관측frame 없음)와 실제분리동기화후 item-only loss를 분리 기록했다.

미적용 ai-enhance-persistence-candidate.diff는 본편/easy 각각 `_doAiEnhance`의 `const res=aiEnhance(...)` 바로 다음에 **`if(res.used>0)dbSaveNow();`** 한 줄을 추가한다. 실패라도 실제 비용을 소비한 정상 시도만 저장예약하며 res.ok만으로 성공전용 저장하지 않는다. aiEnhance 비용·확률·횟수·성공효과·RNG·목표/상한·환수식 불변. 양쪽 성공콜백 기존효과 이벤트 배열·자원·RNG 동등성을 대조했다. 저장예약을 UI효과보다 앞에 두어 후속 표시 예외가 예약을 가로막지 않도록 한다.

## 실제 저장 분기와 인수 한계
| route | 실행한 실제 dbSave | 판정 |
|---|---|---|
| 0 | 기본 DB 함수: _sanitizeCoreState→공유악의→Supabase update | fake query chain 성공 후 전체공용 dbRestore; 아이템/악의 보존 |
| 1 | demo500 localStorage override | snapshot에는 변경된 enh/mats가 기록되지만 **실제생산 demo500은 장비복원하지 않는 별도 초기화/선택복원**. 공용dbRestore 대조를 생산경로완료라 부르지 않음 |
| 2 | demo localStorage override | 저장game.mats=잔여값, 공유악의직접저장없음. 공용dbRestore가 기존공유값과 max 동기화하므로 이번fixture에서는 공유악의15000이 남음. 예약만으로 이 별도 구조문제까지 해결했다고 주장하지 않음 |
| 3 | 로컬 fetch override | fake /api/save sink 및 serverOk=false 폴백/HTTP실패→메모리localStorage까지 직접실행. 일반공유경로 보존 |
| 4 | standalone localStorage override | 전체함수→메모리JSON sink→공용복원. 일반공유경로 보존 |

dbSave는 객체식투영이 아닌 **원본전체함수**를 실행했다. dbRestore도 원본전체함수이며 관련없는 atlas/skill/UI hook은 메모리 no-op이다. fixture 장비는 기존 affixes/socketCount를 명시해 불필요마이그레이션RNG를 막았다. 전송 sink·공유악의 sink·DOM·시계는 fake이며 Supabase/사용자API/실제localStorage/세이브 접근0. 공유풀과 아이템 snapshot의 원자적 트랜잭션을 구현하거나 보장하지 않는다.

남은 경계:
- 후보도 **500ms 이전 비정상중단**은 보장하지 않는다(499ms 옛snapshot 복원 회귀). beforeunload는 저장시도이지 브라우저 종료시 비동기전송 완료 보장이 아니다.
- _dbReady=false 또는 기존 _saving=true일 때 예약/저장이 생략될 수 있다. _saving guard 반례를 그대로 검수했으며 이번 한 줄 후보로 save-in-flight 재시도/원자성을 해결했다고 주장하지 않는다.
- 기존 이미목표달성 res에 tries/used가 없어 결과DOM이 있으면 toLocaleString 예외가 난다. 예외에서도 신규저장0, 원동작 유지. 별도수정지원은 root 배정 전 착수0.
- demo/공유악의 max복원·demo500 선택복원은 기존 분기별 계약 차이이며 이번 예약 수정 범위 밖. root가 실제 사용분기와 저장인수 범위를 확인해야 한다.

## 해시·docs·인계
| 원구역(JSON문자열 SHA-256) | 본편 | easy |
|---|---|---|
| _doAiEnhance | e4f3ea6ec13e19dba3ab211f1d6a26f5b0c3aa2685ff6f5054ee2f7efd33d683 | 동일 |
| dbRestore | 563d0fae0a802ef60c0f7872adb58b474ebd831dd17ebf734e108562c8b01566 | 10615ec25b5a1ebe52382a8d0efa42cb556f276def25c4f720db9e24b4efb36d |
| 5개 dbSave 배열 | 4c937159632dec648ef1045b8d939a78b787d1495c7cc9e34ae4b510aa4fb229 | 9d182bc1c772674169bff5fff948b2b0ad3579c95481ec1075ab7e8a32f25185 |

최종 후보diff SHA-256 `4bae21e35fa875c3bddf32301bfd5d75f8c19d4194fb109dff25c0ee7c9b80f6`。
원본before.json SHA-256 `3130c3056bcfc30edb34fccd67a0b2ca6876bf48e04a0ae4a290f0b8853933e4`。
전체 구역해시는 evidence.json, 실제출력은 tests.txt에 보존. docs 전체검색 ai-enhance-persistence-doc-search.txt. docs 제안: 저장타이밍표에 AI 실제비용 used>0→dbSaveNow500ms 후보/인수단계 추가, 499ms/진행중저장/분기별악의·demo500 한계를 분리한다. 공유 docs 직접수정0.
결과·receipt 완료 2026-10-01T15:55:34Z.
root 적용 전 함수SHA/호출위치를 재대조하고 일반공유경로·실제종료 전송·demo 정책을 인수한다. 본편/easy 생산미적용, root 순차통합용 후보만 제출. 경제수치/환수/드롭/보호전투·사용자Chrome/게임/브라우저/서버/설치/빌드/Git/queue/새세션/에이전트 변경/실행0. 이번 한 건 뒤 추가범위 착수0.

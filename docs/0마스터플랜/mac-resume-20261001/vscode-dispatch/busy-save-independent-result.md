# QA-busy-save-independent — 결과 (한국어)

- 담당 QA / 기존 세션 `88c3f903…`. HEAD `ae230e74`(원격 확인됨).
- 수신 16:28:10Z / 첫 Read 16:28:40Z / Edit 착수 16:33Z / 완료 16:33Z (UTC). receipt: `busy-save-independent-receipt.json`.
- 범위: `busy-save-independent-task.md` 한 건. **BALANCE/save-inflight-candidate 독립 검토(후보 미적용).** 기존 29테스트 복제 아님.
- 실제 사용자 세이브 0(fake sink). 게임/브라우저/대형빌드 직접 실행 0. Mac 앱 빌드·부하 중복 없음. tab1573846373 미접촉.

## 원함수 SHA-256(앞16)
| 대상 | SHA |
|---|---|
| dbSaveNow (game, 현재) | `f31e1ecf47f3df72` |
| dbSave (game, 현재 async) | `2152c5b37d34f6de` |
| save-inflight-candidate.mjs | `96750107f0da4dce` |

## 검토 대상(후보 요지, 미적용)
- `dbSaveNow`: `request={charId,charIdx,P,save}` 캡처. 디바운스 발화 시 컨텍스트 불일치면 abort,
  `_saving` 중이면 `dbSaveNow.pending=request` 로 보류.
- `_drainPendingSaveNow()`: 모든 `_saving=false` 직후 호출 → pending 을 현재 컨텍스트와 대조 후 `dbSaveNow()` 재호출.

## 산출물
- 독립 반례 회귀: `tools/team-followup-20261001/QA/busy-save-independent-regression.mjs` → **7 PASS / 0 FAIL, exit 0**
  - 후보 함수 **원문 추출**(`saveNowCandidate`) + **요청시점 직렬화·완료 분리 fake sink**.

## 발견 반례 (최소 재현) — 1건

**[R1] drain 이 즉시 저장이 아니라 재디바운스(+500ms) → in-flight 완료 직후 500ms 내 종료 시 busy-보류분 유실.**
- `_drainPendingSaveNow()`는 `dbSave()`를 즉시 부르지 않고 `dbSaveNow()`(500ms 재디바운스)를 호출한다.
  따라서 차단 저장 완료 후에도 보류분은 **추가 500ms** 뒤에야 전송되며, 그 사이 종료하면 유실된다.
- 최소 재현(C2): `hold dbSave()` → `dbSaveNow()` → `advance(500)`(pending 보류) → `releaseInflight()`(완료·drain·재디바운스)
  → `advance(300)` 종료 ⇒ `transmits=1`(보류분 없음).
- **회귀 아님**: 원본은 `_saving` 중 발화분을 drain 자체가 없어 **항상** 유실했다. 후보는 대부분 복구하되 "완전 배수"는 아님.
- 개선 여지(미적용, BALANCE 과제 제안): `_drainPendingSaveNow`에서 `dbSaveNow()` 대신 `dbSave()`를 즉시 호출하면 이 500ms 창을 제거할 수 있다(단, 완료 epilogue 재귀/중복 저장 주의).

## 반례가 아니었던 항목(안전 확인)

| # | 시나리오 | 결과 |
|---|---|---|
| S1 | 모든 `_saving=false` 사이트에 drain 삽입 | 게임 토글 3곳(3570/61727/61878)·easy 3곳 전부 diff 포함(6). **누락 drain 없음** |
| C1 | busy-defer 보완 | `_saving` 중 발화→pending→완료 drain→재디바운스 후 저장됨(설계 목적 동작) |
| C3 | 캐릭터 전환(busy pending 뒤 A→B) | drain 에서 컨텍스트 불일치 abort → **잘못된 캐릭 저장 0**, in-flight(A) 1건만 |
| C4 | 재디바운스 500ms 창 중 전환 | 재무장 저장도 `request(A)!==현재(B)` abort → **B 행에 A 보류분 기록 0** |
| C5 | 실패/force 경쟁 | 완료 epilogue 에서 drain + `_pendingForce`(≥5s 즉시 dbSave) 동시 동작 → **유실 없음**(동일 상태 중복 저장 가능, 무해) |
| C6 | `charIdx`만 변경 | drain abort(컨텍스트 체크 민감도 유효) |

- 컨텍스트 체크 유효성 근거: 게임은 캐릭터 로드 시 `P=mkP()`로 P 객체를 **재생성**(59867/60042/60148/60260/61734/61882)하고 `_charId`/`_charIdx`도 갱신 → `request.player!==P`·`charId`·`charIdx` 중 하나로 전환을 감지한다.

## 판정 요약
- 후보는 **busy(_saving) 보류 저장 유실을 pending/drain 으로 대부분 복구**하고, **잘못된(타 캐릭) 저장을 유발하지 않는다**(컨텍스트 abort 안전). 모든 `_saving=false` 분기에 drain 이 삽입되어 누락이 없다.
- **유일 잔여(R1)**: drain 이 재디바운스라서 in-flight 완료 직후 500ms 내 종료 시 보류분이 유실될 수 있다. 원본 대비 **악화가 아니라 부분 개선**이며, 완전 해결엔 즉시 `dbSave()` 배수가 필요.

## 미해결 / 한계
- **창닫기(≤500ms) 완전 해결 아님**(R1). beforeunload 동기 저장·즉시 drain 연계는 별도 설계(BALANCE).
- fake sink·가짜 클럭 기반 — 실제 Supabase/`/api/save` I/O, 실브라우저 종료 타이밍, 로컬↔서버 save 혼재 동시성은 검증 범위 밖.
- 후보 **미적용 유지**. 생산 반영은 root 순차.

## 인계
- root: 후보는 안전·부분 개선. 적용 시 R1(재디바운스 잔여창) 인지. 원함수 SHA 상단 표로 고정.
- BALANCE: R1 개선(즉시 `dbSave()` 배수) + 창닫기(beforeunload) 연계는 별도 과제로 제안.

## 미실행
- game/easy/index/server/공유 test/공유 docs/타팀 파일 수정 0. Git/queue/새세션/에이전트 0. 게임·브라우저·대형빌드 0, tab1573846373 미접촉, 사용자 세이브 0.

# LANES_CLOUD — 공용 작업표 (git 정본)

- PC 원장 `I:/EXODUSER-Storage/codex-takeover/LANES.md`와 같은 역할을 git 안에서 한다. 클라우드 세션은 I:에 닿지 않으므로 이 표를 쓴다. PC CTO는 이 표를 LANES.md에 반영(또는 반대로)해 둘을 맞춘다.
- 갱신: 2026-11-04 21:40 KST, 클라우드 CTO(session_01RpEygYGKUQUXhk8Yw9obNZ). 기준 unity/main = `2f9fb68ab`.

## 역할 (사용자 11-04 결정)

| 역할 | 누가 | 권한 |
|---|---|---|
| Claude 1 — CTO | 클라우드 CTO 세션(PC CTO가 다시 열리면 PC CTO와 이 표로 조율, 병합 권한은 한 명) | 우선순위·배정·충돌 조율·**최종 병합/배포(유일)** |
| Claude 2 — 구현 | 레인 세션(L1~L4 등) | 지정 브랜치·소유 파일만 수정, commit/push. unity/main 직접 push 금지 |
| Claude 3 — 독립 검수 | 검수 세션(R1) | 제출된 같은 SHA만 검사, PASS/RETOUCH/FAIL. 코드 수정 금지 |
| 사용자 — 교차 확인 | 사용자 | 원격 SHA·영수증·실제 화면 대조, 누락·정체 보고 |

- 흐름: CTO 배정 → 구현 제출(브랜치@SHA) → 검수 판정(같은 SHA) → CTO 병합 → 사용자 교차 확인.
- 디자인 화면이 바뀌는 병합은 여기에 더해 디자인총괄 PASS(Mac 화면) 뒤에만 한다.

## 작업표

| ID | 담당(세션) | 일 | 소유 파일 | 기준 SHA | 제출 SHA | 상태 | 완료 조건 | 다음 담당 |
|---|---|---|---|---|---|---|---|---|
| L1 | 구현 session_01RpEygVEfumGGbZqob5jp8m | combo4 5브랜치 병합 사전 점검 | cloud-lanes/L1-merge-ready_20261104.md | 2f9fb68ab | `f815cf516` (PR #12) | 제출 | 표·병합안 | CTO: combo4 PASS 뒤 병합 실행(5개 모두 --no-ff, demo-flavor 먼저) |
| L2 | 구현 session_01RpEygWPyYA9KRzPWLek58q | docs-sync 3차 | docs 2개 + CHANGELOG_SYNC 절 | 2f9fb68ab | `739f7acb4` (PR #9) | 검수 대기 | R1 PASS | R1 → CTO 병합 |
| L3 | 구현 session_01RpEygYkweqhr8VLKXTQHzY | oracle FAIL 10 분석 | cloud-lanes/oracle-triage_20261104.md | 2f9fb68ab | `ed6bfef08` (PR #11) | 검수 대기 | R1 PASS | R1 → CTO: P1(Killu→킬루) 구현 배정, P2(skill-ui 13/16) 담당 판단 |
| L4 | 구현 session_01RpEygYUELC7Miq8avZy83J | 앵글러 물 + VFX 감사 합본 | FieldBullets.cs 외 두 부모 범위 | 2f9fb68ab | `0ac134a80` (PR #10) | 검수 대기 | R1 PASS + PC 컴파일 + 화면 | R1 → PC 컴파일 → 임펙트·디자인 화면 |
| R1 | 검수 session_01RpEygVD4RmKSE2tzZ66rJP | L2·L3·L4 독립 검수 | cloud-lanes/REVIEW_20261104.md | 2f9fb68ab | — | 진행 | 판정표 | CTO |

## PC에만 닿는 일 (클라우드 불가 — PC 세션 담당)

- 코덱스 레인 8개 상태·재개, 대기열(debug-t2-harness → vfx-capture → map-b5-main 검증 → fullrun-3d 2회차).
- Editor 컴파일(L4 합본 `0ac134a80`), 하드 종료 18회, BuildLoop·바탕화면 실행본 SHA.
- combo4·preview 6·A2R 화면 판정(Mac).

## 주의 (L1에서 확인)

- unity/main이 인수인계 시점보다 나아가 5개 모두 FF 불가 → `--no-ff`.
- options-wave2에 demo-flavor 옛 커밋 포함 → demo-flavor를 반드시 먼저.
- demo-flavor는 세이브 폴더가 바뀌는 위험 병합 → 병합 뒤 Mac에서 옛 세이브 이어하기 1회.
- 병합 뒤 후속 docs 2건: 번역대상 감사 표 4274~4287, 15 세이브 문서 `lang` 키.

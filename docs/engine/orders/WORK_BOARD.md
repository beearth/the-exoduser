# 공동 작업판 (Claude 총괄 ↔ Codex 총괄) — 단일 기준

> 이 문서가 **지금 누가 무엇을 하는지의 유일한 기준**이다. 새 작업을 시작하거나 끝낼 때 양쪽 총괄 모두 이 표를 먼저 읽고 갱신한다(경로 지정 커밋, 문서만 main 직접 push 허용).
> 상위 계획: [FDG_GAME_DEVELOPMENT_PLAN.md](../FDG_GAME_DEVELOPMENT_PLAN.md) · 사용자용 현황: [FDG_GODOT_PORT_STATUS.md](../FDG_GODOT_PORT_STATUS.md) · Mac 지시서: [MAC_ORDERS_20261020.md](MAC_ORDERS_20261020.md)

## 역할 (2026-10-20 사용자 지시 기준)
| 역할 | 누구 | 하는 일 |
|---|---|---|
| Claude 총괄 | PC Claude 세션 "Godot PC/Mac 이식 작업 지침" | 작업 배정·검수(원본 행·테스트 독립 재실행·화면 1x 확인)·main 병합·계획/현황 문서 |
| Codex 총괄 | Mac Codex(ROOT/ENGINE) | Mac 쪽 Codex 작업 배정·진행 관측·Mac 실행 인수, 이 표 갱신 |
| 맥북총괄 | Mac Claude 세션 | Mac 검증(실창 플레이·녹화), Codex 터미널 진행 관측·SHA 보고 |
| 실행 원칙 | 사용자 | "맥북으로 거의다", "단순업무는 코덱스", "토큰도 다 쓰고 환경도 다 쓰고" |

## 공통 규칙
1. **main 병합은 Claude 총괄만**(검수 후). 다른 모두는 자기 브랜치(`codex/…`, `claude/…`)에 커밋·push만.
2. 작업 시작 전 아래 "진행 중" 표에 행 추가 + **소유 파일** 기재. 다른 행의 소유 파일은 수정 금지(필요하면 그 담당에게 요청 또는 보고서에 기재).
3. 작업 끝 = 보고서(`docs/engine/orders/reports/<작업ID>_REPORT.md`, 자기 브랜치) + 이 표의 상태를 "검수 대기"로 + 브랜치명·SHA 기재.
4. 원본 행 근거·수치 무조정·가짜 PASS 금지·원본 에셋 바이트 복사·격리 사용자 폴더·2_3/Q·E/세이브 불변 — 계획 문서 규칙 그대로.
5. 같은 일을 두 곳에서 하지 않는다. 비어 보이면 표를 먼저 확인.

## 진행 중 (2026-10-20 갱신: Claude 총괄)
| 작업ID | 내용 | 담당·환경 | 브랜치 | 소유 파일(다른 담당 수정 금지) | 상태 |
|---|---|---|---|---|---|
| P2-001l | 패링 연습 단계 0~7·입력 제한(allows) | PC heavy 담당 | claude/p2-001l-lesson-steps-20261020 | native_parry_lesson_flow.gd 등 레슨 파일, player.gd·main.gd 입력 처리 함수 | 진행 중 |
| P2-006a | 드랍 바닥 표시·줍기·인벤 반입 | PC heavy 담당 | claude/p2-006a-drop-pickup-20261020 | 드랍 렌더·줍기 신규 스크립트, P2-001c 드랍 레코드 소비부 | 진행 중 |
| P3-002 | 소환굴 시스템·후속 스폰·지역 처치 분모 | 클라우드 세션 cloud-spawnholes | claude/p3-002-spawn-holes | 소환굴 신규 스크립트, world 동적 등록 호출부 | 시작 요청됨 |
| P2-007a | UI 마감: 원본 글꼴(나눔명조·Cinzel)·검기 색·인트로 가이드 패널 | 클라우드 세션 cloud-ui-polish | claude/p2-007a-ui-polish | assets/fonts, crescent.gd 색, 인트로 가이드 패널 | 시작 요청됨 |
| MAC-VERIFY | 최근 통합분 Mac 테스트·Mac 실창 첫 전투 녹화 | Mac Codex ttys001(맥북총괄 관측) | codex/mac-verify-20261020 | 없음(관측 전용) | 진행 중 |
| QA-001 | 기존 실패 테스트 7종 원인 진단 | Mac Codex ttys002 | codex/qa-001-20261020 | 해당 테스트 파일 | 대기→착수 |
| P3-001 | 맵 pit_poison 타원 충돌 계약 | Mac Codex ttys003 | codex/p3-001-20261020 | engine/fdg/map-source-adapter.js, 맵 계약 테스트 | 대기→착수 |
| P2-004b | 펫 원문171 ID·선언연결60/데이터전용111 실제 적용 | PC Codex (사용자 재배정) | codex/p2-004b-pc-20261020 / 기준 f1df29a86 | native_pets.gd·catalogue·P2004A/B 테스트·관련 docs | 검수 대기: 원문171/0·신규822/0·실제Main연결10/0. 회귀최초17/5→실패그룹14/0(기통과6 유지). [보고서](reports/P2-004B_REPORT.md); 자연발화60/60·화면 미인수 |
| P3-003 | 지역 시스템(G._regions·필드보스 사이트·지역 처치·미니맵 마커) | **Codex 총괄 배정 대기**(Mac, 다음 빈 Codex) | codex/p3-003-20261020 | 지역 신규 스크립트 | 대기 |

## 공용(누구도 단독 소유 아님 — 수정 시 최소 줄·보고 필수)
`godot/scripts/main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`(공용 피해 집행자), `native_source_new_run_state.gd`(G/P 소유자)

## 검수·병합 완료 기록 (최근)
P1-002.C~H, P2-001a~k, P2-002a/b, P2-003a, P2-004a, P2-005a~d — main ad7f15777까지. 상세는 계획 문서 작업표.

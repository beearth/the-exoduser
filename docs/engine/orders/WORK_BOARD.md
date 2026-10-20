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
| P2-006a | 드랍 바닥 표시·줍기·인벤 반입 | PC heavy 담당 — **Claude 사용 한도로 중단**(작업 폴더 G:\exoduser-wt\p2-002a-hud에 진행분 보존) | claude/p2-006a-drop-pickup-20261020 | 드랍 렌더·줍기 신규 스크립트 | 중단·인계 대기 |
| P3-002 | 소환굴 시스템·후속 스폰·지역 처치 분모 | 클라우드 세션 cloud-spawnholes | claude/p3-002-spawn-holes | 소환굴 신규 스크립트, world 동적 등록 호출부 | 시작 요청됨 |
| P2-007a | UI 마감: 원본 글꼴(나눔명조·Cinzel)·검기 색·인트로 가이드 패널 | 클라우드 세션 cloud-ui-polish | claude/p2-007a-ui-polish | assets/fonts, crescent.gd 색, 인트로 가이드 패널 | 시작 요청됨 |
| MAC-VERIFY | 최근 통합분 Mac 테스트·Mac 실창 첫 전투 녹화 | Mac Codex ttys001(맥북총괄 관측) | codex/mac-verify-20261020 | 없음(관측 전용) | 진행 중 |
| QA-001 | 기존 실패 테스트 7종 원인 진단 | PC Codex(codex exec) | codex/qa-001-pc-20261020 | 지정 테스트 7종 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 실패 18건+스크립트 오류 1건 해소, 제품 코드 0줄, 총괄 독립 재실행 7종 0실패 |
| P3-001 | 맵 pit_poison 타원 충돌 계약 | PC Codex(codex exec) | codex/p3-001-pc-20261020 | engine/fdg/map-source-adapter.js, godot/data/map.json, 맵 계약 테스트 | **검수 완료·main 병합(Claude 총괄 대리 커밋 3081760c5)** — Godot 195/195·Node 10, 실창 미검증 |
| P2-004b | 펫 대사 카테고리 160여 종 | **PC Codex**(codex exec) | codex/p2-004b-pc-20261020 | native_pets.gd 대사 테이블 | 진행 중 |
| P3-003 | 지역 시스템(G._regions·필드보스 사이트·지역 처치·미니맵 마커) | Mac Codex ENGINE (`01a1235a-f2b8-73d1-bf58-c51c7dfb7638`, ROOT 관측) | codex/p3-003-20261020 | `godot/scripts/native_regions.gd`, `godot/tests/test_p3003_regions.gd`, `docs/engine/FDG_P3_003_REGIONS_20261020.md`, `docs/engine/orders/reports/P3-003_REPORT.md`; 공용 최소 hook: `main.gd::_ready`의 HUD/state bind 직후 NativeRegions 생성·configure(약6줄, 입력·리젠 제외), `hud.gd::_draw_native_minimap`의 base-cache draw 직후 호출(약3줄), `_refresh_native_first_fight_hud`의 지역 kill/진행 표시(약10줄), `get_native_minimap_corner_snapshot().unported`의 현행 미연결 진단 문자열1줄; `docs/engine/FDG_P2_002B_MINIMAP_CORNER_20261020.md`에는 P3 부분 연결의 날짜·현행 P3문서 링크만 추가(기존 검수 이력 보존); `docs/CHANGELOG_SYNC.md`에는 P3 날짜·구현/검사/미연결 경계·문서 링크의 짧은 append만 | 진행 중 · core 27/0·실Main 최초9/0 및 배선 정정후9/0; docs-sync 훅 필수 변경로그 추가 후 자기브랜치 커밋·push 마감(C/분모/화면 미완) |
| FEATURE-INVENTORY | 전체 기능 분모 표·이식 상태 판정 | **PC VS Code Codex 1**(P3-003 중복 배정을 중단하고 전환 — P3-003은 Mac ENGINE 단독) | codex/feature-inventory-pc-20261020 | docs/engine/FDG_FEATURE_INVENTORY_20261020.md | 진행 중 |

## 공용(누구도 단독 소유 아님 — 수정 시 최소 줄·보고 필수)
`godot/scripts/main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`(공용 피해 집행자), `native_source_new_run_state.gd`(G/P 소유자)

## 검수·병합 완료 기록 (최근)
P1-002.C~H, P2-001a~k, P2-002a/b, P2-003a, P2-004a, P2-005a~d — main ad7f15777까지. 상세는 계획 문서 작업표.

## 보존된 미완 작업 (현재 배정과 별도)

- Mac Codex ENGINE의 이전 `GODOT-INTEGRATE-DEATH-CORPSE-ONE-ENEMY-20261020`은 구 worktree(`codex/p1-002-audio-live-queue-20261018`, HEAD `3c5023a4`)에서 보존 마감했습니다. `world.gd`·`enemy_melee_flesh_crawler.gd`·신규 `native_normal_enemy_corpses.gd` WIP만 해당 구 worktree에 남아 있으며, 최신 main 파일의 소유권을 주장하지 않습니다. 담당 보고는 compile 통과, 실제 경로는 imported ctex 누락 실패이며 화면·양성 사망 인수 및 관련 docs 동기화는 미완료입니다. 신규 SHA·main 반영 없음. 원로그/변경 보존: Mac ENGINE의 `death-runtime-resume-20261020/PRESERVED-HANDOFF-20261020.json`. P3-003에는 섞지 않습니다.

## 공용 연결 요청 (미수정·총괄 조정)

- **P3-003 → PC Claude 총괄:** `native_normal_enemy_hurte.gd::_kill_pipeline`의 원본 42702 `stageKills` write 직후 실제 적을 `NativeRegions`의 `_regKill` 대응 경로에 전달하는 약4줄이 필요합니다. MAC 지시서의 ‘공용 피해 집행자 — 수정 필요하면 보고서에만’에 따라 ENGINE는 이 파일을 수정하지 않습니다. PC 총괄이 삽입 또는 정확한 수정 범위를 확정해 주세요. 피해 계산·드랍·입력 변경은 요청하지 않습니다.
- **P3-003 ↔ P3-002:** 소환굴 확정 후 `NativeRegions.initialize_stage()`를 호출하는 연결 지점은 P3-002 담당·PC 총괄이 조정합니다. P3-003은 `_totalSpawned`·World 동적 등록에 쓰지 않으며, 실제 소환굴 분모가 없으면 미연결 상태를 그대로 보고합니다.

- **P3-003 환경 검증 기록:** 원앱 Godot 4.7.2의 첫 import에서 WT asset reimport·editor layout 완료 후 `~/Library/Application Support/Godot/editor_settings-4.7.tres` 저장 ERROR로 중단(exit −15). clean import PASS가 아닙니다. 원로그 `~/exoduser-wt/_out/P3-003/import-01.*` 보존, 추가 import·전역 설정 권한 확대 없이 생성된 자기 WT 캐시와 고유 격리 userdir로 실Main A/B 첫 검수 9assert/0fail·exit0·ERROR0을 확인했습니다(`actual-01.*`). Main HUD-bind 직후 배선 정정 후 `actual-order-02`(PID1015)도 9assert/0fail·exit0·ERROR0으로 보고됐습니다. override는 비웠고 editor_settings는 사전 사본과 exact hash 동일입니다. 실제 화면·전체 지역 전투 인수는 아직 없습니다.
- **P3-003 중복 방지:** 현재 이 판의 담당은 기존 Mac ENGINE입니다. Mac 지시서의 추가 `ttys002=P3-003` 문구는 이 행과 총괄이 정합할 사항이며, ROOT가 예약된 네 터미널에 별도 지시하거나 같은 지역 작업을 중복 배정하지 않습니다.

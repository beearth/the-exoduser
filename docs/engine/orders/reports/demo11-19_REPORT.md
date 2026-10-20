# DEMO11-19 — 런타임 applyStats 쓰기 권위 선행 필요 (BLOCKED)

기준 origin/main **8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4**에 승인된 DEMO11-20 **3ea7b63d0d508d71b74ec8258ea425c74d1b3233**를 정상 merge한 **9110c2bbc6c90097e52dfb50e849d8cf7d1a5a2d**에서 조사했다. CHANGELOG 최상단 충돌은 양쪽 신규 절을 모두 보존하여 해결했다. 기존 main에 이미 있던 하위 충돌 표식은 본 단위 범위 밖이므로 보존했다. R 변경0, rebase0. GAP 지시서는 main에 없어 codex/demo11-gap-20261021:61ab71be의 DEMO11-19 행을 읽기 참조했다.

## 원본과 현재 연결 경계

| 경로·행 | 확인한 계약 / 차단 근거 |
|---|---|
| game.html:51242–51249 | evaluatePlan → 감소한 패시브의 예약 제거 → STATS/PASSIVES/근성/SP/AP 대입 → 예약 처리 → applyStats → 표시/저장 요청 순서 |
| game.html:51262–51275 | 직접 스탯·패시브 증감도 기존 point 정책 계산 뒤 실제 applyStats 호출. 포인트 차감만으로 완료할 수 없음 |
| game.html:51219–51233,43157–43158 | FIFO·선두 부족 중단·투자 때만 applyStats. XP 일괄 레벨 증가 후 예약을 **먼저** 처리하고 새 상한으로 회복함 |
| godot/scripts/native_meta_point_policy.gd:57–99 / native_meta_passive_queue.gd:32–52 | 메모리 계산·예약 처리 정책은 존재. 호출자는 실제 applyStats를 공급해야 하며 State/actor 쓰기 없음 |
| godot/scripts/native_source_player_initialization.gd:167–174,396–400 | 유일한 applyStats 조합 진입점은 1회 pre-Tree 초기화. 재호출은 not_configured_or_initialization_already_attempted, Tree 진입은 거부 |
| godot/scripts/native_source_new_run_state.gd:733–740 / native_source_resource_authority.gd:285–290 | State와 resource sink 역시 생성 전 lifecycle만 허용. dispatcher만 새로 만들거나 재설정해도 런타임 쓰기 권위가 되지 않음 |
| game.html:27927,27943,27961–27962 | 실제 applyStats는 speed·방패 상한/현재값 등을 갱신. 사용자 보호 범위인 이동·방패 쓰기 경로를 임의로 새로 열지 않음 |

## 요청 인터페이스 — 제안만, 미구현

| 위치 | OLD → NEW 제안 / 소유 경계 |
|---|---|
| native_source_player_initialization.gd:167 / :396 및 native_source_player_initialization_services.gd의 cohort 서비스 | OLD: 새 게임 1회 pre-Tree 조합만. NEW: **PC/통합 담당**이 실제 Main·State·resources 동일 owner를 확인하는 반복 가능한 runtime applyStats 진입점을 제공. 기존 producer 재사용·수식 복제0·pass별 신선한 cohort·원본 쓰기 순서·실패 부분 적용 명시. 초기화 거부 검사는 그대로 유지 |
| native_source_resource_authority.gd:285 및 기존 player 이동/방패 sink | OLD: 초기화 전용. NEW: **보호 경로 담당**이 runtime 성장 재계산의 합법적 resource/actor commit을 제공. Math.min clamp·현재 자원 보존·regen parameter·ST 재계산을 원본 그대로 반영. 테스트가 직접 player 필드에 써서 대체하지 않음 |
| native_source_new_run_state.gd:586–587 (현재 levels>0 직후) | OLD: heal 즉시 실행, passive_queue 미이식 표시. NEW: 위 권위 인수 후 META-05 처리 → 투자 시 runtime applyStats 완료 → 기존 heal → 표시/저장 인계. AP가 없는 선두 대기·만렙 선두 제거·대량 XP 한 번 처리 보존 |
| Main/State 성장 호출자 (본 단위 허용 범위) | 권위 인수 뒤 META-04 live/base 검증과 실제 raw_grit holder를 사용한 투자/환불·META-05 enqueue/cancel/process 연결. pending/가짜 applyStats 성공 콜백 금지. 표시용 detached snapshot만 최소 UI에 제공 |

전투 핵심 변경 금지와 WORK_BOARD의 타 담당 파일 변경 금지에 따라 **제품 구현을 보류**한다. Main/State의 범위 승인이 pre-Tree 검사를 해제하거나 resource/player의 이동·방패 권위를 새로 만드는 승인으로 확대되지는 않는다. 포인트·큐만 커밋하면 효과·상한·XP 회복 순서가 서로 달라져 반쪽 상태가 되므로 그런 코드는 넣지 않았다. 필요한 것은 사용자 추가 확인 절차가 아니라 위 보호 경로 담당의 runtime 재계산 인터페이스 인수다.

## 검증·제출

본 단위 제품/테스트 변경 **0줄**, Main/State 공용 변경 범위 **없음**(기준은 위 dependency merge). 새 UI·테스트·세이브·맵·에셋 변경0, Godot 실행0·새 통과 수 주장0. 직접 관련 실행 suite는 변경이 없어 미실행했다. 정적 점검은 원본 호출 순서, 세 곳의 lifecycle 차단, dependency 포함, 제품 diff0만 확인하고 원로그에 남긴다. 틱 경로에 새 코드가 없고 목록 생성 API 추가0, 성능 벤치 미실행이다.

관련 META 추적 문서·WORK_BOARD·CHANGELOG에 BLOCKED를 기록한다. 자기 브랜치만 일반 push하고 원격 SHA 일치 후 `~/exoduser-wt/_out/demo11-19/DONE.txt`에 **BLOCKED**와 dependency SHA를 쓴 뒤 자기 worktree를 제거한다. 최종 SHA·원격·R 보존·제거 결과는 DONE 및 final-receipt.json을 따른다.

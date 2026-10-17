# Native play_time typed owner source boundary - 2026-10-17

## 2026-10-17 play_time typed owner — 검증 WIP 소스 경계

| id / 항목 | 코드와 동일한 현행 계약 |
|---|---|
| 공개 API | Services `read_normal_enemy_play_time() -> Dictionary`, arity 0. callback 등록 없음: 실제 11/25, 미14 유지 |
| Main 검사 | `is_native_source_play_time_context_current(services, state, raw_g=null, require_g_identity=false)`: 총 4인자, 필수 2 / 메타데이터 선택 2 |
| State 검사 | `is_native_play_time_owner_current(main, expected_player, expected_world, expected_resources, raw_g=null, require_g_identity=false)`: 총 6인자, 필수 4 / 선택 2 |
| State 관측 | `read_native_normal_enemy_play_time(main, services) -> Dictionary`, arity 2 |
| Script 증명 메타데이터 | Main `_native_source_play_time_owner_script: WeakRef = weakref(get_script())` 필드 1개, 생성 시 1회. Script 객체 identity 확인용이며 clock 값·counter·writer·setter·epoch는 추가하지 않음 |
| 범위 | 동일 Services self와 weak Main/State → Main의 현재 `source_initialization_services/source_state/player/world/source_resources` → 기존 State `_g`의 literal `playTime`. 새 native source-context mapping이며 원JS G identity/초기화/자연수명/clock 증가 동등성 증거는 아님 |
| 직접 소유 검사 | 실제 Main Script weak witness / Services·State 실제 Script 객체 / 현재 역할 ref / live 같은 Tree와 parent / State strict bool `_initialized` / actor `INITIALIZED_META` strict bool true / `CLAIM_META` live WeakRef(self). Script path 문자열을 실제 Script-token 대신 사용하지 않음 |
| 제외된 검사 | 기존 일반 getter·legacy guard·Provider/Formula를 호출하거나 수정하지 않음. HP/state/facing/resource parameters/regen/clock domain query 없음. 미검증 `world.player`·resource-ready·legacy 전체 권위가 통과했다고 주장하지 않음. pre-Tree는 지원하지 않음 |
| 실제 값 조회 | precheck 실패는 scalar query 0. `_g` ref 확보 후 literal key presence 1회, present일 때 값 lookup 정확히 1회. post는 같은 G ref/역할/Script/Tree/claim만 검사하며 scalar 재조회·같은 값 불변 검사 없음 |
| READY 부분지원 | present finite native int/float. raw type/value 및 int0/float+0/raw-0 보존. int 범위 [-9007199254740991,9007199254740991]는 local 정확표현 지원 부분집합이며 게임 cap·전역 finite 정책이 아님 |
| raw NOT_READY | copied key 미확정/부재, bool/String/StringName/null/NaN/Infinity/reference, int 지원범위 밖, owner pre/postloss. top `value` 없음. 결손을 JS undefined/known absence로 인증하거나 0으로 채우지 않음 |
| 원 ref / prefix | 관측 Dict의 `raw_g/raw_value/raw_owner/raw_main/raw_services/query_prefix`는 원 ref/type/value를 보존. presence prefix 뒤 present면 value prefix만 추가. clone/snapshot/cache strip/JSON 대체/retry/refund/rollback 없음 |
| postloss | State 새 NR envelope의 `read_result`는 원 관측 Dict, Services 새 NR의 `read_result`는 State 원 반환 Dict를 그대로 가리킴. `query_prefix`와 사용 가능한 raw alias도 같은 ref. 기존 Dict의 READY value를 삭제하거나 변형하지 않음 |
| schema | 정상 상태 `READY` 또는 `NOT_READY`; `source/reason` 필수. READY만 `value` 존재. State source `native.State._g.playTime`, Services source `native.Services.play_time`. 원시 값이 관측되지 않은 필드는 임의 null/0 대신 부재로 남김 |
| State reason | `native_play_time_owner_not_current`, `native_play_time_observation_pending_validation`(postloss 안쪽 원기록), `native_play_time_owner_changed_after_observation`, `native_play_time_field_unresolved`, `unsupported_native_play_time_integer`, `unsupported_native_play_time_non_finite`, `unsupported_native_play_time_type` |
| Services reason | `native_play_time_services_owner_not_current`, `native_play_time_services_context_not_current`, `native_play_time_services_owner_changed_after_observation`, `native_play_time_owner_result_malformed` |
| 미래 consumer | 원42328/42329의 서로 다른 lazy 0/1/2 query와 두 번째 write=두 번째 query값을 유지해야 함. owner raw-0와 미래 consumer의 supported numeric0→literal+0 `||0` 투영은 별개. 이번에는 consumer 투영/V11/V12/등록12/World hook/14 dummy·25 gate 우회를 구현하지 않음 |
| 검수 현행 | 첫 소스 정적 17개 중15통과2실패(원 wholefalse 보존), 후속 문서·경로 독립2확인 true, 첫 공개 API 격리34case·477확인(설정163·행동314) ROOT 인수. 각 실행은 별개이며 원17 전체 PASS로 합산하지 않음. 실제 게임·자연 clock·원JS identity는 미인수 |
| 현재 한계 | 실제 Main/State clock 필드 presence·진행·게임 실행·PC 배포·전체 hurtE·전체 게임 완료율은 미확인. 격리 fixture QA도 이번에 만들지 않음 |

현재 원시 Dictionary는 JSON wire 형식으로 변환하지 않는다. 강한 참조를 포함한 결과의 동기 관측 범위와 실제 게임의 자연수명 증거는 구분한다. 새 경계는 소유 메타데이터를 관측하는 직접 검사이며 기존 모든 getter나 실행 중 엔진 전체의 순수성을 인증하지 않는다.

## 2026-10-17 검증 WIP 소유 체크포인트

| 구분 | 인수 범위와 한계 |
|---|---|
| 소스·등록 | Main/Services/State 신규4 API와 Main Script 메타데이터1필드. 현재 callback11/25·미14, play_time 미등록 |
| 분리된 증거 | 원정적17중15통과2실패 wholefalse / 이후 독립2확인 true / 첫격리34case477확인(설정163·행동314) 인수. 서로 다른 실행을 단일 전체 PASS로 소급하지 않음 |
| 값·ref 경계 | finite native int/float 부분지원, safe int ±9007199254740991은 local 표현 한계. raw-0·원type/ref/prefix와 postloss 원read_result를 보존하며 missing unknown/unsupported/loss는 top value 없는 NR. 0fallback·clone·retry·clock writer 없음 |
| 검수 한계 | 명시 fixture와 predicate probe에서의 검수. 실제 Main/State clock 존재·진행·자연수명·원JS identity·실게임·PC 인수 증거는 아님. raw-0 owner와 미래 consumer numeric0→literal+0 투영은 별개 |
| 후속 consumer | V12 후보 소스3+첫parse2 완료보고가 도착해 ROOT가 회수 중이다. 현재 제품 V11/V12 copy·등록12·World hook은 수행하지 않음. 두 lazy query0/1/2와 두번째write=두번째query는 별도 consumer 범위 |
| 보존 단위 | 소유 브랜치 codex/native-play-time-owner-20261017. 문서의 자체 commit SHA를 선행 선언하지 않으며 실제 local/remote SHA·tree·parent·비강제 보존 결과는 아래 단위 receipt를 기준으로 확인 |

[체크포인트 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>) · [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md)

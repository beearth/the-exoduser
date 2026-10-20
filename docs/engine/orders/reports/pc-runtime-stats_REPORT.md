# PC-RUNTIME-STATS — 런타임 applyStats 재계산 + DEMO11-06 보호 handoff/자원 restore writer

브랜치 `claude/pc-runtime-stats-20261021` (origin/main 33755331b에서 시작, rebase0). Mac 팀이 BLOCKED로 넘긴 DEMO11-19(스탯 투자)·DEMO11-22(장착 transaction)·DEMO11-06(복원) 인터페이스 요청을 PC 전투 핵심 owner로서 제공한다. **공개 API 계약: [PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md](../../PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md)**.

## 무엇을 · 어디를

| 구분 | 파일 | 내용 |
|---|---|---|
| A 신규 | `godot/scripts/native_source_player_runtime_stat_refresh.gd` | 반복 가능한 runtime applyStats owner. 원본 producer 6종을 pass마다 새로 만들어 초기화 dispatcher와 같은 앵커 순서로 detached P overlay에 단계 적용 → 세 sink 사전 검증 → 동기 일괄 commit → readback. 모드 `apply_stats`(원본 applyStats 직접 호출)/`equipment_refresh`(G16287–16292). 재진입·외부 owner·identity 교체 거부, 실패 시 무변이 |
| A 공용 | `godot/scripts/main.gd` (+39, 끝에 추가) | `request_native_runtime_stat_refresh(mode, reason)`, `read_native_runtime_stat_refresh_snapshot()`, `invalidate_native_runtime_refresh_legendary_cache(refresh)`(Main 소유 `_lEqCache`). 부팅 순서 변경0(첫 요청 시 생성) |
| A sink | `godot/scripts/player.gd` (+56) | `validate_/commit_native_runtime_stat_refresh` — hp/mhp/baseDef/speed(+movement)/maxPoise/poise/poiseR. refresh commit 창 안에서만 |
| A sink | `godot/scripts/native_source_new_run_state.gd` (+47) | 같은 이름 — _effStats/baseAtk/hpR/_oocSpeed/_crystalStats/mshield/shield |
| A·B sink | `godot/scripts/native_source_resource_authority.gd` (+106) | A: st/mst/stR/mp/mmp/mpR runtime sink. B: `commit_native_restore_resources(owner, 8필드)` 복원 writer |
| B 신규 | `godot/scripts/native_source_protected_restore_handoff.gd` | `protected_qe / protected_active_sync / protected_wing` — detached state → flow `_handoff` 관측 형식 |
| 테스트 | `godot/tests/test_pc_runtime_stat_refresh.gd`, `pc_runtime_stat_refresh_oracle.mjs` | 실제 Main 부팅, 원본 JS VM oracle(applyStats/recalcSt/_refreshEquipmentStats 본문을 이름으로 추출) |
| 테스트 | `godot/tests/test_pc_protected_restore_handoff.gd`, `pc_restore_flow_oracle_to_file.mjs` | 기존 `tools/sv_restore_flow_oracle.cjs`(원본 slice) 321 fixture 대조 + flow e2e + 실제 Main restore writer |

초기화 단회 guard(`initialize_new_run` → `not_configured_or_initialization_already_attempted`, pre-Tree sink 3종)는 **수정0**이며 테스트에서 재확인했다. Q/E 판정·피해 수식·세이브 형식·docs/2_3 수정0. 기존 테스트 수정·삭제0.

## 설계 근거

- 기존 sink 3종은 pre-Tree·초기화 owner·태그 전용이라 런타임 쓰기 권위가 없었다(DEMO11-19/22 보고서 근거와 일치). guard를 풀지 않고 **별도 runtime sink + Main 등록 refresh 모듈의 동기 commit 창**으로 권위를 한정했다.
- 원본에서 applyStats 각 줄은 직전 대입을 읽는다(예: crystal hp clamp가 같은 pass의 mhp를 읽음). overlay P에 단계 적용하면 같은 관측을 보장하면서 실패 시 실제 owner 무변이가 된다.
- 원본 특성 보존: apply_stats 모드는 pFortify/pVital 중간 clamp 때문에 만피 hp가 `mhp−300×fLv`로 떨어진다(원본 JS와 일치). equipment 모드는 사후 `min(new max, old)`로 복구. 두 모드를 분리한 이유.
- 현 main recalcSt(G16426)는 `_lEqCache`도 비운다. producer invalidate packet은 2캐시만 명시하므로 refresh 중 Main 캐시도 함께 비운다.
- 성능: Services reader는 호출마다 전체 owner 재검증(~0.7ms)을 해 1회 refresh가 ~46ms였다. pass 시작·commit 직전 2회 전체 검증 후 같은 원본 provider 객체에 직접 묶어 ~15ms로 낮췄다(이벤트 경로 전용, 틱 경로 코드0).

## 검증 (각 1회, 격리 user dir, override 종료 0byte)

| 테스트 | 결과 |
|---|---|
| 신규 test_pc_runtime_stat_refresh (EXODUSER-pc-runtime-stats-Isolated-20261021) | **300/0** (final2 최종 실행). 원본 JS oracle 10사례×20필드=200필드 일치. 스탯 증가 무료충전0·감소 clamp·장착(+bonus/affix stale 캐시 미사용)·해제 clamp·재장착·fortify/vital 모드 차이·이른/늦은 실패 무변이·재진입(시그널 내 재호출) 거부·외부 owner/모드 오타/2번째 모듈/State 교체 거부·sink 창 밖 직접 호출 거부·addExp 레벨업 창 안 호출 READY·반복 20회 commit. 단정 수는 랜덤 스타터 장비 소켓 수에 따라 ±(소켓 null 확인 단정) 변동(이전 실행 294/0·286/0·291/0) |
| oracle 음성 대조 | S4 apply_stats 사례를 equipment 모드로 바꾸면 oracle hp 579→879로 달라짐 → 대조가 모드를 구분함 확인 |
| 신규 test_pc_protected_restore_handoff | **4830/0**. 321 fixture × 3 handoff 직접 대조(before/after/state) + 321/321 flow e2e READY(최종 state=원본) + restore writer 거부 4종 무변이·raw 대입(hp>mhp 허용)·readback |
| 회귀 11종 + restore flow | contracts 5그룹/0, main_source_starter 148/0, regen_phase 88/0, qe_binding 155/0, resource_regeneration_binding 170/0, p2005d 10/0, p1002g 220/0, demo11_20 214/0, demo11_16 393/0, p4001a 318/0, map_look 16/0, native_restore_flow 819262/0 — final2(최종 코드) 재실행에서 전부 rc=0, 위 수치 동일 |

로그: `G:/exoduser-wt/_out/pc-runtime-stats/` (final_*.log, final2_*.log, pcrs*.log, pcrh*.log, prof/). 기존 Camera2D WARNING 외 SCRIPT ERROR0.

## 성능

- 틱 경로에 새 코드 없음(신규 메서드는 refresh/복원 호출 시에만 실행, `_physics_process`/`_process` 변경0, 목록 생성 API 호출0) → **물리 300틱 벽시계 벤치는 생략**.
- refresh 1회 비용: 장착 모드 20회 평균 **15.0ms**(final2; 직전 실행 15.7ms)(Windows 개발 PC headless). 최적화 전 74ms. UI/레벨업 이벤트에서 1프레임 이내 수준이나 틱마다 호출하면 안 된다(계약 명시).

## 미확인·HOLD

- Mac 쪽 실제 호출자(META-04/05 투자·예약 처리, DEMO11-22 bag↔slot transaction, DEMO11-06 Main 복원 흐름) 연결은 **미구현**(Mac 소유). 이 API로 가능함만 테스트로 보였다.
- 결정(crystal) 장착 사례는 oracle에 CRYSTAL_DEFS가 없어 **원본 대조 미실행**(스타터 소켓 비어 있음만 확인). 결정 경로는 기존 producer 재사용이며 수식 복제0.
- 실제 화면 HUD 갱신은 `Player.stats_changed` 발생까지만 확인, 스크린샷 미실행.
- pre-Tree 복원 경로·Mac 실기 성능 미측정.
- 4 공용 파일(main/player/state/authority)은 Mac 팀 동시 편집 대상 — 모두 기존 줄 수정0의 순수 추가라 충돌 시 양쪽 보존으로 해소 가능.

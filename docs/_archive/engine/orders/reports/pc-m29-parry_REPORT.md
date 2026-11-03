# PC-M29-PARRY — M29 비투사체 접촉 패링 제공자 (DEMO11-30 재개 접점 1)

2026-10-21 KST, PC Claude. 기준 `origin/main 969c194e6`, 브랜치 `claude/pc-m29-parry-20261021`, worktree `G:\exoduser-wt\pc-m29-parry`. 계약: [PC_M29_PARRY_CONTRACT_20261021.md](../../PC_M29_PARRY_CONTRACT_20261021.md). 출발점: DEMO11-30 BLOCKED 보고서(`origin/codex/demo11-30-20261021` 94d26012) 「PC 인터페이스 부재」 행·「재개에 필요한 접점」 1번.

**판정: PC 제공자 구현·검증 완료(기능). 자연 스폰·EL-01·단일 lock·실제 warning/impact/detonate 소비자는 Mac/후속 범위로 미연결.** 실제 게임 화면에 보이는 요소 추가 0이라 화면 캡처 검수 대상 없음.

| 구분 | 내용 |
|---|---|
| 신규 제품 | `godot/scripts/native_m29_contact_services.gd`(+346): `player_context`(live isPWin), `handle_m29_parry`/`resolve_m29_contact_parry`, `emit_m29_event`(능력별 단일 소비자 라우팅), `m29_readiness`, `bind/unbind_m29_fx_consumer`, `source_is_p_win`, 스냅샷 |
| Main(공용) | `godot/scripts/main.gd` +22/−5. 추가: 31(preload)·60(필드)·326(준비 구역 설치 1줄)·1339–1354(`native_source_parry_reward`·`read_native_source_parry_bank`·`get_native_m29_services`). **기존 줄 수정 3곳(동작 동일 단일화)**: Q 반사 bank 읽기 3줄→helper 1줄(1300), Q 반사 보상식 1줄(1317), E 파동 반사 보상식 1줄(1904, `×1.0` 추가 — IEEE 곱 항등) |
| type3 actor(공용) | `godot/scripts/type3_summoned_actor.gd` +25/−0: `apply_native_source_poise_core(amount)` = 원본 `_poiseHit` 코어(G19973–19983). 기존 줄 수정 0 |
| 테스트 | 신규 `godot/tests/test_pc_m29_parry.gd`, 원본 VM oracle `godot/tests/pc_m29_parry_source_oracle.cjs`(game.html 원문 그대로 실행, UTF-8 JSON 파일 출력) |
| 문서 | 계약 신규, 이 보고서, `FDG_GODOT_TYPE3_BINDING_20261013.md` 제공자 행 1줄, CHANGELOG_SYNC 최상단 절 |

## 원본 대조 (Node VM oracle)

추출: isPWin G38469, `_lParryWinTicks` G16622, `_PARRY_WIN` G8670, doParry G38470–38575, `_poiseHit` G19972–19998, eModHitP G31098–31116, `case'eCharge'` G40527–40538. 앵커 문자열 불일치 시 oracle이 실패한다.

| 대조 | 결과 |
|---|---|
| isPWin 480행(상태10×st2 4×_sbParryT 2×_kiParryT 2×망토 3) | `source_is_p_win`·망토 창 틱 식과 **480/480 일치** |
| 패링 순서 5사례 | 원본 `isPWin → P.parryBank= → addTxt → doParry → _poiseHit`, hurtP 0 ↔ 실제 `parryBank → (addTxt 미연결) → doParry writer → poiseHit20` |
| 피해 순서 3사례 | 원본 `isPWin → elMul → hurtP → eModHitP → _addBoom → bigImpact → shake → SFX.detonate` ↔ 실제 `hurtP → KB100 → impact_fx → detonate_sound`(eModHitP 원본 무효과) |
| doParry 보상 | 원본 st 증가 50(기본)·77(parryBonus .1, pRegen 2) = `main.native_source_parry_reward` 50·77 |
| `_poiseHit` 코어 4사례 | 일반(50→30, poiseR0)·그로기(→0, stunned/_maxStunned 180)·보스(90, _pImmune300)·보스 면역(무변경) — poise/poiseR/stunned/_maxStunned/_pImmune 전부 일치 |

## 실제 Main 검증 — `test_pc_m29_parry` **100단정/0실패**, ERROR 0, SCRIPT ERROR 0

| 그룹 | 확인 |
|---|---|
| main_services_exposed | Main 설치, 4 Callable, combat_qe true / FX 3개 false(실제 소비자 없음), idle 문맥 창 false, 외부 target 문맥 거부, 신규 런 parryBonus·pRegen 0 |
| binder_rejects_until_fx_consumers | 실제 binding이 FX 미준비 시 `unavailable_actual_M29_warning_fx`로 구성 거부. 소비자 등록 뒤 4개 모두 true, 중복 등록·미지 능력 거부 |
| rejection_matrix_zero_writes | 외부 actor·외부 target·비패링 이벤트·**projectile:true**·poise_hit 위조·비접촉 상태·미등록 actor·미지 kind 거부, bank/hp/st/mp/iframes/poise/적 poise/Q 반사 수 변화 0 |
| live_damage_contact | 실제 binding+kernel 540틱 누적→windup→charge→접촉. 창 닫힘, 순서 `hurtP → impact_fx → detonate_sound`, raw 1200 = atk40×30×elMul1.0, KB 증분 = 이벤트 100 벡터(크기 100), `_iceOnHit=false/_lavaBurn=null/mods=[M29]` → eModHitP 무효과, 패링 writer 0. windup 시 FX 소비자 안 중첩 handle/emit **재진입 거부** |
| live_parry_contact | charge 시작 틱에 실제 Q 입력 → sBlock, live isPWin true. accepted, 순서 `parryBank → doParry → poiseHit20`, bank +40(atk), hp 387.9→437.9(+50), iframes 25, poise 3→4, 적 poise 1751→1731·poiseR 0, **player_damage 0**, Q 반사 수·반사 telemetry 변화 0, projectile_contact_calls 0, kernel recover 진입, binding runtime 오류 없음 |
| consumer_failure_and_reentry | 소비자 false 전파, 소비자 불필요 kind true, 소유자 해제 뒤 `m29_consumer_missing:warning_fx`, 재등록 |
| tick_bench_300 | 아래 성능 |

Fixture 경계(정직 기록): 엘리트·접사 레시피 RNG `[.01,.1]` fixture(자연 선택 아님), FX 소비자·`emit_charged_projectile`는 테스트 기록기, `is_tile_wall`=`world.is_world_blocked` fixture, 540틱 대기 중 Player 위치를 actor 기준 ±300px 재배치 1111회, poise 코어 oracle용 미등록 fixture actor raw 강제 설정 17필드, 명시 phase 1544회.

## 성능 (틱 경로 신규 코드 있음 → 측정)

헤드리스 Main 부팅, 고정 300 물리틱 벽시계. M29 actor가 있을 때만 서비스가 틱마다 호출된다(현재 제품 자연 스폰 0).

| 측정 | 값 |
|---|---|
| 물리 1틱(actor 없음) | 16.58ms |
| 물리 1틱(M29 actor 매 틱 phase) | **16.66ms — 60Hz 실시간 유지** |
| actor phase 1회 평균(type3 AI 전체 포함) | 0.46ms |
| `m29_readiness` 프레임당(캐시 무효화 최악) | 0.049ms |
| `player_context` 1회 | 0.097ms (phase당 2회) |
| 전체 패링 원천 검사 1회 | 2.73ms → 60프레임마다 1회로 제한 |

1차 구현은 readiness가 매 프레임 전체 원천 검사를 해 phase 평균 3.26ms였다. 구조 검사(매 프레임)+전체 검사(60프레임 주기, 패링 처리 시점은 항상 전체 검사)로 바꿔 0.46ms. 틱 경로 목록 생성 API(`get_method_list`/`get_property_list`/`get_signal_list`) 호출 0.

## 회귀 — 각 1회, 변경 전 기준선(같은 base, import 후)과 대조

| 테스트(격리 user dir) | 기준선 | 변경 후 |
|---|---|---|
| test_native_qe_binding(pc-m29) | 155/0 | **155/0** |
| test_type3_native_binding(pc-m29) | 4그룹/실패0 | **4그룹/실패0** |
| test_enemy_mod_m29(pc-m29) | 143/0 | **143/0** |
| test_type3_summoned_actor(pc-m29) | 118/0 | **118/0** |
| test_m30_epicenter(pc-m29) | 4그룹/0 (의도 ERROR 1: 누락 텍스처 거부 검사) | **4그룹/0**, 같은 의도 ERROR 1 |
| test_p1002g_kislash_hurte(P1002G) | 220/0 | **220/0** |
| test_native_main_source_starter_state(MainSourceStarter) | 148/0 | **148/0** |
| test_native_source_player_regeneration_phase(SourceRegenPhase) | 88/0 | **88/0** |
| test_demo11_boss_actor(demo11-34) | 162/0 | **166/0** (실제 RNG ack 단정 수 변동 — DEMO11-34 보고서에 기존 기록) |
| test_contracts(pc-m29) | 5그룹/0 | **5그룹/0** |
| test_native_type7_runtime(pc-m29) | **2실패**(`exact_source_actual_assembly`: source 6/10·7/9 기대) | **같은 2실패** — base 969c194e6에서 이미 실패, 이번 변경과 무관(미수리, 범위 밖) |

예상 밖 ERROR/SCRIPT ERROR 0. Main 부팅 테스트의 기존 Camera2D 물리보간 WARNING, regen 하니스의 의도 WARNING은 기존 그대로. `test_type3_spawn_recipe`는 oracle fixture 인자 필요로 기준선부터 미실행 상태(지시 목록 밖). 최초 import 전 실행은 클래스 캐시 부재로 전부 무효 — `_out/pc-m29-parry/preimport_invalid/`에 보존, 집계 0. 신규 테스트 1차 98/1 실패(`_iceOnHit`가 null이 아닌 false — 테스트 가정 오류, JS truthy 판정으로 수정)와 보상 cap 가림 보완(피해 접촉을 먼저) 이력 보존.

## 미확인·HOLD

| 항목 | 상태 |
|---|---|
| 자연 스폰·EL-01·M29/M30 단일 lock 연결 | Mac 범위, 미연결. 서비스는 modT/RNG/registry 접근 0이라 순서를 막지 않음 |
| 실제 warning/impact/detonate 소비자 | 없음 → FX readiness false(정상 거부). M29 텔레그래프 그리기(vfx_m29)도 미이식 |
| doParry 나머지·`_poiseHit` 연출 꼬리·'⚡패링!' 텍스트 | 미이식(계약 §8 목록). 사운드 이식 시 원본 `Math.random` 소비 순서 함께 처리 필요 |
| `is_tile_wall` 실제 provider | 미확정(isW 동등성 미검증) |
| 기존 `CombatQEProducer.is_parry_window` | isPWin과 망토0 160행 중 54행 다름(Q/E 경로 소유, 변경 0 — 별도 판단) |
| `_kiParryT` writer | Godot에 없음(현재 항상 0) |
| 쓰기 도중 실패 롤백 | 없음(사전 검사로 차단) |
| Mac 환경·실창 1920×1080 | 미실행·미확인 |

원로그: `G:/exoduser-wt/_out/pc-m29-parry/`(`baseline/`, `after/`, `test_pc_m29_parry.log`, `pc_m29_parry_oracle.json`, `pc_m29_parry_result.json`). 매 실행 격리 `override.cfg` 지정 후 0바이트로 비움. 실제 사용자 폴더 접근 0.

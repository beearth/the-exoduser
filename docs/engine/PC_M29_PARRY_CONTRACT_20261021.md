# PC-M29-PARRY 계약 — M29(돌진) 비투사체 접촉 서비스 (2026-10-21, PC 전투 핵심)

DEMO11-30(Mac) 보고서 「재개에 필요한 접점」 1번에 대한 PC 제공물이다. Mac 팀은 이 문서만 보고 `type3_native_binding.gd`(또는 `native_type7_runtime.gd`)의 `type3_interfaces`에 연결한다.

- 원본(읽기 전용, `game.html` SHA256 `4d911cdd…85e5d4`): eCharge 접촉 **G40531–40535**, isPWin **G38469**, `_lParryWinTicks` **G16622**(`_PARRY_WIN=16` G8670), doParry **G38470–38575**, `_poiseHit` **G19972–19998**, eModHitP **G31098–31116**.
- 제품 소유: `godot/scripts/native_m29_contact_services.gd`(신규, PC), Main 준비 구역 설치 1줄, type3 actor의 `_poiseHit` 코어 메서드 1개.

## 1. 얻는 방법

| 호출 | 반환 | 시점 |
|---|---|---|
| `main.get_native_m29_services()` | `{player_context, handle_m29_parry, emit_m29_event, m29_readiness}` 4개 `Callable` | Main `_ready` 이후 언제든. 미설치면 `{}` |
| `main.native_m29_contact` | 서비스 객체(RefCounted) | FX 소비자 등록·관측용 |

Main은 `_install_native_q_control()` 바로 뒤에서 `M29ContactServicesScript.install_native_boot(self)`로 1회 설치한다(실패 시 null, 부팅 계속). 틱 처리(`_process`/`_physics_process`)는 없다. 서비스는 호출될 때만 동작한다.

연결 예(Mac 쪽):
```gdscript
var interfaces: Dictionary = existing_type3_interfaces.duplicate()
interfaces.merge(main.get_native_m29_services(), true)   # 4개 키만 덮어씀
# element_multiplier / is_tile_wall / native_random / emit_charged_projectile 은 호출자 소유(아래 §6)
```

## 2. 공개 API

| API | 인자 | 반환 | 호출 시점·계약 |
|---|---|---|---|
| `player_context(target: Node2D)` | Main 실제 Player만 허용 | `{x, y, r, hp, iframes, state, parry_window: bool}` / 거부 시 `{}` | binding이 configure 1회 + owner phase마다(readiness 확인 1회 + root 문맥 1회). `parry_window` = **live isPWin**(G38469). `{}`이면 binding이 그 phase를 fail-closed(`actual_M29_context_became_unavailable`)로 멈춘다 |
| `handle_m29_parry(actor, target, event)` | binding 자신, Main Player, kernel `player_parry` 이벤트 | `bool` (accepted) | binding `_on_m29_event`가 kernel `player_parry` 직후 호출(binding :248, 호출 위치·시그니처 그대로). false면 binding이 `actual_M29_parry_consumer_rejected` 기록 |
| `resolve_m29_contact_parry(actor, target, event)` | 같음 | `{accepted, reason, order, skipped, before, after, doparry, poise, damage_applied:0, projectile_contact_calls:0, full_doparry:false}` | 관측판(테스트·진단). `handle_m29_parry`는 이것의 `accepted`만 돌려준다. 마지막 결과는 `get_last_parry()` |
| `emit_m29_event(actor, event)` | binding 자신, kernel 이벤트 | `bool` | binding :250. 아래 §4 라우팅대로 등록된 소비자를 순서대로 호출, 하나라도 없거나 false면 false |
| `m29_readiness()` | — | `{schema, combat_qe, warning_fx, impact_fx, detonate_sound, combat_qe_reason}` 전부 bool | binding configure와 매 owner phase. 같은 World 프레임은 캐시. `combat_qe`는 매 프레임 구조 검사 + 60프레임마다(첫 호출 포함) 전체 패링 원천 검사(`read_native_q_parry_source`). FX 3개는 해당 소비자가 등록·유효할 때만 true |
| `bind_m29_fx_consumer(capability, consumer)` | `"warning_fx"`/`"impact_fx"`/`"detonate_sound"`, `consumer(actor: Node2D, event: Dictionary) -> bool` | `bool` | 능력당 단일 owner. 살아있는 소비자가 있으면 거부(덮어쓰기 0). 알 수 없는 능력 거부 |
| `unbind_m29_fx_consumer(capability, consumer)` | 등록한 같은 Callable | `bool` | 등록자만 해제 |
| `read_parry_window()` | — | `{ready, value, state, fields:{st2,_sbParryT,_kiParryT}, l_parry_win_ticks}` | 진단용. `player_context`가 내부에서 사용 |
| `static source_is_p_win(state, st2, sb_parry_t, ki_parry_t, l_parry_win_ticks)` | — | `bool` | isPWin 식 그대로. 원본 VM 480행 표와 일치 검증 |
| `get_snapshot()` | — | 설정·live·소비자 결합·카운터(`parry_accepted/rejected`, `emit_*`, `context_*`, `readiness_calls`, `projectile_contact_calls`=0) | 관측 |

보조 Main API(같은 커밋에서 기존 식을 단일화한 것, 동작 동일):
- `main.native_source_parry_reward(parry_bonus, regen_lv, multiplier) -> int` = `js_int32(50*(1+parryBonus)*(1+pRegen*0.2)*multiplier)` (doParry `_prBase`, 빨콩·무지개 외). Q 반사(×1/×1.5)·E 파동 반사·M29가 공유.
- `main.read_native_source_parry_bank(p) -> float` = `(P.parryBank||0)`.
- type3 actor `apply_native_source_poise_core(amount) -> {ready, source_return, entered, staggered, ...}` = `_poiseHit(e,amt)` 코어(G19973–19983: `!alive||amt<=0` false / 보스 `_pImmune>0` false / poise-=amt, poiseR=0 / poise≤0 → 0, stunned·_maxStunned=max(,ib?90:180), 보스 _pImmune=300).

## 3. 패링 처리 순서 (G40533–40534)

`handle_m29_parry`가 받은 이벤트 하나에 대해, 모든 사전 검사를 쓰기 전에 끝낸 뒤 원본 순서대로 **기존 PC writer**만 호출한다.

| 순서 | 원본 | 실제 writer | 비고 |
|---|---|---|---|
| 1 | `P.parryBank=(P.parryBank\|\|0)+(e.atk\|\|10)` | `main.commit_native_q_control_state({"parryBank": bank+add})` | add = kernel 이벤트 `parry_bank_add`(= `int(e.atk\|\|10)`, actor raw atk와 대조) |
| — | `addTxt('⚡패링!')` | 미연결(`skipped:["addTxt_parry_text"]`) | 새 표시 문자열 추가 0 |
| 2 | `doParry(e.atk,e.x,e.y,false,e.el)` | `source_resources.commit_native_q_parry_reward(main, reward)` | hp/st/mp += reward(각 최대치 cap), iframes=25(원본 max(,18) 뒤 =25), poise+1(cap). reward = `native_source_parry_reward(parryBonus, pRegen, 1.0)` |
| 3 | `_poiseHit(e,20)` | `actor.apply_native_source_poise_core(20)` | 피해 0. kernel이 이어서 `recover`(st2=30) 진입 |

피해 분기(창 밖)는 binding 기존 경로 그대로다: `target.receive_damage(int(atk*30*elMul),"phys")`(hurtP) → eModHitP(단일 M29 + `_iceOnHit/_lavaBurn` falsy에서 원본도 무효과·RNG 0, binding이 호출 생략) → `apply_native_posthurt_knockback(100 벡터)` → `emit_m29_event`(impact_fx → detonate_sound). 이 서비스는 피해 분기에 writer를 추가하지 않는다.

### 사전 검사(하나라도 실패하면 쓰기 0, false)

| 거부 사유(`reason`) | 조건 |
|---|---|
| `reentrant_m29_service_call` | 이 서비스의 handle/emit 처리 중 중첩 호출 |
| `actual_main_world_player_not_live` | Main/World/Player 해제·트리 이탈·Player 부모/World.player 불일치 |
| `external_actor_not_type3_binding` | actor가 `type3_native_binding.gd` 인스턴스가 아님 |
| `actor_not_registered_in_main_world` | actor 부모 ≠ Main World(미등록 provisional 포함) |
| `actor_not_live_m29_owner` | registry 미준비·사망·M29 미보유 |
| `external_target_not_main_player` | target ≠ Main Player |
| `tree_paused` / `player_dead` | 일시정지 / hp≤0 (Q 반사 경로와 같은 게이트) |
| `not_m29_player_parry_event` | kind≠player_parry 또는 do_parry 누락 |
| `projectile_contact_not_accepted_here` | `do_parry.projectile`이 정확히 false가 아님(투사체·반사 경로 오인 차단) |
| `invalid_m29_parry_payload` | parry_bank_add 비정수 또는 poise_hit≠20 |
| `actor_not_in_eCharge_contact` | actor raw `s`≠eCharge(kernel은 recover 진입 전에 이벤트를 낸다) |
| `event_position_not_actor_owned` / `event_attack_not_actor_owned` | 이벤트 x/y/atk·bank가 actor raw와 불일치 |
| `player_iframes_gate` | Player iframes>0 |
| `parry_window_not_ready:*` / `live_parry_window_closed` | live isPWin 계산 불가 / false |
| `parry_source_not_ready:*` | `read_native_q_parry_source()` 미준비(예: detonate·peaceShield 미채택) |
| `actor_poise_core_missing` | actor에 poise 코어 없음 |

쓰기 도중 실패(정상 경로에서는 사전 검사로 차단)는 `partial_writes`를 남기고 false — 되돌리기는 하지 않는다(HOLD 참고).

## 4. emit_m29_event 라우팅

| kernel 이벤트 kind | 호출 소비자(순서) |
|---|---|
| `windup_started`, `vfx_spark`, `charge_started`, `vfx_trail`, `recover_entered` | `warning_fx` |
| `player_damage` | `impact_fx` → `detonate_sound` |
| `player_parry`, `player_charge_state_immune` | 없음(true) — 패링 연출은 §7 HOLD |
| 그 밖 | false(`unknown_m29_event_kind`) |

소비자는 `event` 사본을 받는다. 소비자 안에서 이 서비스의 handle/emit을 다시 부르면 거부된다.

## 5. lock → M29 → M30 순서와의 관계

- 이 서비스는 `modT`(eliteBusy/eliteCharge)·World RNG·registry·World clock을 **읽지도 쓰지도 않는다**. lock 감소와 M29/M30 trigger 순서는 호출자(Mac 단일 owner adapter) 소유다.
- `m29_readiness`/`player_context`는 actor 상태 부작용 0이라, 단일 owner가 `lock 감소 → M29 trigger → M30 trigger/zone → 기존 AI` 순서로 부르든 binding 기존 순서로 부르든 결과가 같다.
- 패링 writer는 kernel 이벤트 sink 안에서 동기 실행되고 같은 틱의 M30 단계보다 먼저 끝난다.

## 6. 호출자(Mac) 소유로 남는 것

| 키 | 비고 |
|---|---|
| `element_multiplier` | 기존 실제 provider `Callable(player, "get_native_element_multiplier")` 사용 가능(이 단위 테스트에서 사용) |
| `is_tile_wall` | **미확정.** 테스트는 `world.is_world_blocked`(fireball isW 선례, props 포함)를 fixture로 썼다. type3 binding 문서는 isW를 can_move/props와 구분하라고 하므로 원본 isW 동등성 확인 후 Mac이 결정 |
| `native_random`, `emit_charged_projectile` | 기존대로 World 샘플러·원소 탄 emitter |
| warning/impact/detonate 실제 소비자 | 아직 없음 → readiness FX false → binding 구성 거부(정상). 실제 소비자를 `bind_m29_fx_consumer`로 등록하면 true |
| 자연 스폰·EL-01 선택기·M29/M30 단일 lock | Mac 범위(이번 변경 0) |

## 7. 금지 사항

- 이 서비스는 투사체 facade를 만들지 않고 `resolve_native_contact`·Q 반사·E 파동 반사 경로를 호출하지 않는다(`projectile_contact_calls`=0).
- 패링·피해 수식 복제 금지: 보상식·bank 읽기는 Main 단일 helper, poise는 actor 코어, 피해는 binding 기존 경로.
- 틱 경로에서 `get_method_list()`/`get_property_list()`/`get_signal_list()` 호출 0.
- 테스트 기록기 소비자·all-ready constructor readiness를 제품 경로에 넣지 않는다.
- `docs/2_3 돌진+패링+방패시스템/`(수정금지) 변경 0.

## 8. 미이식·HOLD

| 항목 | 상태 |
|---|---|
| doParry 나머지 | `full_doparry:false`. pet, 통계, 사운드·보이스(원본 `Math.random` 2~3회 소비 — 이식 시 RNG 순서 함께 처리), hitStop/slowMo/shake/진동, 하프 게이지, 분노+20·텍스트, 분노스킬 쿨 감소, 유니크 트리거(u_d01/03/12/20), 펫 대사, 악의구슬(mats)+2000, parryExplosion, 패링 임팩트 VFX/플래시/파티클, PARRY 텍스트 — Q 반사 경로 remaining과 같은 묶음 |
| `_poiseHit` 연출 꼬리 | G19984–19997(천공쇄기 환급·`_uPoiseOrbFracture` 토큰·SFX.groggy·그로기 텍스트·slowMo·파티클) 미이식 |
| '⚡패링!' 텍스트 | 표시 소비자 미연결 |
| 쓰기 도중 실패 롤백 | 없음(사전 검사로 차단, `partial_writes` 기록) |
| 기존 `CombatQEProducer.is_parry_window` | isPWin과 망토0 160행 중 54행 다름(sBash+_sbParryT, _kiParryT 항 없음). Q/E 경로 소유라 이번에 변경하지 않음 — 별도 판단 필요 |
| 원본 `_kiParryT`/`_lCapeParry` 공급 | 현재 Godot에 _kiParryT writer 없음(값 0). 망토는 `formula.l_eq` 실제 읽기 |
| 실제 1920×1080 화면·경고 캡처 | 미실행(이번 단위는 화면 요소 추가 0) |

검증 근거는 [pc-m29-parry 보고서](orders/reports/pc-m29-parry_REPORT.md).

## Native 기본 합체 E 파동 — 2026-10-15 현행

| 범위 | 현재 구현 |
|---|---|
| 실제 소비 | 기본 shieldFuse의 _autoShieldThrow→실제 post-move wave 이동·사각 공간명중/Enemy HP·KB·소스 _stCd/_stWingT·실제 생성40보호·기존 source 입자/원근 quad 및 자연 gbBean의 같은 carrier blue 반사 연결. 추가 ST0. |
| 수치 | L=max(1,min(maliceSwipe 또는1,shieldThrow 또는1)), cooldown=max(120,720−15L), 기본705. M=(1+.05(L−1))×clamp(charge,1,3), maxDist210M/r50M/w95M/속도12. source 피해·실fusion/affix 및 wave 반사 base(true)×1.5/life120/gb유지. |
| 검수·후보 | 새 GPU/Main3에서 고유23 PASS/제품ERROR0·기존 Camera2DWarning각1. 실제 자연 명중과 자연 탄→blue 피해/최대차징 확인. 새 native-review-e-wave-20261015 후보는 기존camera0b도 포함, 초기pause/명시선택/수동재개. 기존 실행본 자동교체0. |
| 한계 | DEFAULT_FUSED_WAVE_PARTIAL/E_CONTROL_PARTIAL/latest_full_game=false/RETOUCH. 비합체·다른탄·boss/full hurtE/doParry·고유모션/audio·전체스킬24고유장24FPS 미완. blackBean은 Q only/E 제외. |
| 상세 | FDG_GODOT_NATIVE_FIRST_20261013.md의 e-default-fused-wave-20261015 절이 API·공식·입자·소유·첫검수·새후보의 현행 SSOT다. 아래 이전 파동/40보호 미채택 문장은 그 이전 제출의 이력이며 현재 상태를 덮어쓰지 않는다. |

## E 제어·실제 타격 부분 연결 — 2026-10-15

현재 native Main은 공개 E→sDraw(10tick 게이트/.5이동)→tap 또는 kiGather(2배속/.18이동)→sBash20→sRecover ToInt32(28/(1+현재pParry×.1))→정상종료를 실제 P/ST/World/명시profile과 연결했다. 비용은5+((maliceSwipe||1)−1)×2를 tap release 또는 charge 진입1회, charged release 재차감0. Silver 차징만 원150+175×(mult−1) 전진과 진입8iframe, 원Normal E 공간hit/HP·KB8/stun60을 소비한다. 첫actualMain/GPU1/20.469초/새18PASS/제품ERROR0·Camera보간경고2, 옛Q/공간/독립군 재연0. 기본shieldFuse의 별도파동·40보호·쿨다운, E투사체패링·고유모션/연출 등은 미채택이므로 E_CONTROL_PARTIAL/fullEfalse/latestfullfalse/RETOUCH. [정확API·필드·수치·자연타격·새후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015)를 따른다. 아래 과거 E 전체 미연결 표기는 이 부분 범위에서만 현행 계약으로 대체한다.

## Q 다크볼 실제 성공 반사 — 2026-10-15

현재 START의 실제 gbBean만 공개Q→같은 탄 반사→기존 blue 원 clock·자연 AoE/정상 적 피해에 연결했다. live 원 pParryProjDmg base×2 ToInt32/life200, actual HP·ST·MP 성공보상/iframe25/poise+1, 실제 World128px source-order query를 소비한다. 실제 blackBean과 구분하며 black 자연 caller/E/full doParry 보상·audio/FX/core absorb 등은 미완이다. Q_CONTROL_PARTIAL/latestfullfalse/RETOUCH를 유지한다. [정확한 API·원 수치·실패1과 영향검수1·새 후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015)를 따른다. 아래 과거 “반사 전부 미연결” 표기는 다크볼 범위에서만 현행 계약으로 대체한다.

## 2026-10-15 현재 Q 제어와 버전 범위

현재 실제 Main은 Q_CONTROL_PARTIAL: 진입MP10, 홀드 MP=max(0,MP−최대MP×0.000833×sp), 이동0.35배, 반경100+400×clamp(hold/240,0,1), 해제창12tick을 실제 source MP/P와 연결했다. 원 초기창20/cooldown30×(1+shieldCdRed), 단일60Hz clock을 유지한다. fullQE·반사carrier·E·Space·기폭팔/평화방패·저장복원·24고유장24FPS·전체 최신 이식은 미완이다. 초기 미채택 반사창에 무료 무적을 만들지 않으며 창 이후 원 실패흡수식(min(0.25,block_base×0.5),×1.3)을 기존 실제 피해 경로에서 소비한다.

새 검토본은 native-review-q-control-20261015이며 기존 native-review-input-20261015는 보존한다. 자산·모듈 읽기 링크를 포함한 별도 snapshot이므로 최신 원본 전체/독립 배포본이 아니다. GUI 자동실행0. [정확한 API·수치·실패/영향 검수·새 후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15)를 따른다. 아래는 이전 checkpoint 이력이며 Q owner 미바인딩·공간 명중 미검증의 당시 표기는 현행 계약으로 대체한다.

> **2026-10-15 native 입력 교정:** 현재Main은원BINDS기본값을참고한명시native기본키이며원본저장BINDS/BINDS2복원은미구현이다. WASD와LMBpress/hold/release는실제consumer에연결했고Q무료취소·Space접근성토글을actualMain에서제거했다. Q실제owner미바인딩/E완료·Space분노slot미연결을HUD에명시한다. [현행계약·별도검토경로](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-기본-입력과-새-검토-실행본--2026-10-15).

| 현재 native 범위 | 계약 / 검수 |
|---|---|
| Main / Player / HUD | read_native_input_bindings0,handle_native_input_event1,get_native_input_snapshot0,clear_native_input_states0. 실제event→held→기존이동·공격/해제,HUDleaf안내. 원수치·QE반사·60Hz·collision/nav/LOCK불변. |
| 실행본 | 외부native-review-input-20261015/수정본_검토_실행.command,처음정지·캐릭터명시선택필수. 기존launcher·보호창·ship변경0,GUI자동실행0. |
| 새 검수 / 한계 | 입력14PASS/후보기동5PASS,초기fixture QEowner가정오류1이력유지. currentQ/E/Space·원설정복원미완,publicplay/공간명중NOT_PROVEN/latestfullfalse/전체RETOUCH. |

# FDG Godot QE 실제 Player 연결 — 2026-10-14

## Adapter API

신규 `godot/scripts/native_combat_qe_adapter.gd`는 `RefCounted` composition proxy다. 기존 `CombatQERuntime`·`CombatQEProducer`를 재사용하며 별도 Player, 자동 입력, 자동 physics, HP/KB 적용 경로를 만들지 않는다. 이 섹션은 새 adapter의 API 계약이며 기존 G2 성공 검사를 다시 실행하거나 본편 Q/E 전체 완료를 인수한 기록이 아니다.

| API | 정확한 계약 |
|---|---|
| `configure(player:Node2D,world:Node,stats_provider:Object,resource_provider:Object,sinks:Dictionary)->bool` | 실제 동일 SceneTree의 Player/World, `player.get_combat_world()==world`, `world.player==player`, 필수 메서드·필드·유한 수치·context·provider·sink를 binding 전에 검사한다. 실패 시 Player/자원/World/자식/등록 변경 0. 이미 구성된 adapter의 재구성은 거절 |
| `is_native_qe_ready()->bool` | 실제 lifecycle·provider·services readiness·현재 stats/resource 공급을 다시 확인한다. 실제 값이 없으면 false; 상속 subclass의 150/.5/100MP 등의 기본값을 실제 공급으로 세지 않음 |
| `get_native_qe_player()->Node2D` | 구성한 실제 동일 Player 참조. 유효하지 않으면 null |
| `get_native_qe_world()->Node` | 구성한 실제 동일 World 참조. 유효하지 않으면 null. 읽기 전용이며 별도 World를 만들지 않음 |
| `allows_native_qe_iframe_reflection()->bool` | typed readiness·未pause·Qmode·activewindow·sBash 아님 조건만 기존 iframe 반사 접촉 예외를 허용. 실제 HP/iframe gate를 해제하지 않음 |
| `advance_native(ticks:float,frame:float,ens:Variant)->bool` | World 실제 frame/context.dt_sp/ens **참조 identity**와 같고 frame·epoch가 마지막 성공보다 증가할 때만 `Runtime.tick(self,burst,ticks/60,impact_sink)` 1회. pause/stale/duplicate/잘못된 dt·복사 token은 clock 변경 0 |
| `request_q()->Dictionary` | 살아 있는 실제 idle Player의 공개 명령. sBlock은 실제 MP 비용10을 1회 commit한 뒤 Runtime 진입. 평화방패의 별도 source cooldown/state body가 미채택이므로 `peace_shield_full_runtime_not_adopted`로 상태·비용 변경 전에 거절. 자동 InputMap hook0 |
| `request_e(chg_mul:float=1)->Dictionary` | 살아 있는 실제 idle Player에서 실제 `shield_st_cost` STAMINA를 소비하고 `sBash`·`sbash_st2=20`·`chg_mul=clamp(1..3)`·Q 모드 false. 기검참 `attack_cost()`로 비용 대체 0. E 이동·전진·상태 완료 본문은 이번 adapter에서 미연결 |
| `release_shield()->Dictionary` | 실제 `sBlock/peaceShield`에서 provider의 `release_r`로 Runtime release. Q 모드 true, 원 sBlock 해제 창12·peace det=false·release flag 보존 |
| `resolve_native_contact(proj:Object,raw_damage:int,is_dot:bool=false)->Dictionary` | 현재 실제 보호막 상태/패링창이 없으면 `NONE`으로 원 피해 경로에 넘긴다. reduce는 **raw_damage**, reflect는 **proj.dmg**를 사용한다. E/비Q blackBean은 `NO_REFLECT_PASS`로 반사 없이 원 피해 경로 유지. BLACK/Q/활성창은 source 계산·실 carrier 채택이 미완이므로 `blackbean_source_carrier_not_adopted`로 mutation 전에 accepted=false |
| `get_snapshot()->Dictionary` | 실제 readiness/error, counter, burst 값 복사, contact 결과 deep copy, 마지막 frame/epoch·clock/rejection 지표. 자동 입력/physics false, E movement/completion false, stat default authority false |

| 실제 데이터 공급자 | 필수 형태·제약 |
|---|---|
| stats | `read_native_qe_stats(player)->Dictionary`: `{provided:{shield_cd_red,block_base,q_shield_mp_cost,parry_bonus,parry_dmg_mul,leg_shield_parry,parry_scale,p_atk_mul},missing:{}}`. 8값 모두 실제 유한 numeric, missing 비어 있음, `q_shield_mp_cost==10` |
| resource identity | `get_native_qe_player()->Node2D`가 실제 동일 Player |
| resource read | `read_native_qe_resources()->Dictionary`: `mana/max_mana` 유한 비음수·mana≤max_mana, `active_q_skill:String`, `detonate_lv` 비음수 정수, 실제 `shield_st_cost` 유한 비음수, 실제 `release_r` 유한 양수. 기본 MP/ST 비용·흡수율 발명 0 |
| resource commit | `spend_native_qe_mana(amount)->bool`: false이면 변경0, true이면 정확 amount(이 slice에서10)만 원자 차감. 동기 호출 중 Player/World lifecycle·binding 변경0 및 provider read/readiness는 읽기 전용이어야 한다. adapter 재진입 guard 안에서 1회 호출. Runtime `mana -= 10` setter는 이미 commit된 debit의 proxy mirror만 갱신하며 두 번째 차감0. 외부 provider의 이 계약 위반에 대한 rollback/보정 구현0 |
| shared fields | `state/poise/stamina/global_position`은 실제 Player read/write-through. 반경·melee_ref·stat_str도 실제 Player 읽기. 별도 HP/state Player 복제0 |
| adapter counters | `sb_parry_t/parry_t/shield_cd/sbash_st2` native60 소수 유지. 감소 순서 sb window→sBlock 누적→sBlock 외 cooldown→sBash timer. Runtime tick이 counter를 호출하므로 추가 native_advance 중복호출0 |

| Services sink | 필수 인터페이스 |
|---|---|
| services descriptor | `schema='exoduser.godot.qe-services.v1'`, `readiness:Callable()->bool` 실제 bool true. Callable owner 및 provider/sink Node는 같은 Tree 안에서 유효하고 queued deletion이 아니어야 한다. RefCounted provider/sink는 유효 Object를 실제 binding으로 유지 |
| projectile | `spawn_burst(ring)` 1인자 |
| enemy | `apply_poise(source_enemy,amount)`·`apply_stun(source_enemy,frames)` 각각2인자 |
| impact | `on_burst_expire(ring)` 1인자·`on_parry_reflect(proj,reflect_dmg)` 2인자 |
| hit | `hit_sink`는 실제 동일 Player이고 `receive_native_projectile_contact(proj,raw_amount,dtype,dir,KB)` 5인자 소비 메서드가 있어야 함. adapter가 이 메서드를 재호출하거나 HP/KB/stun을 추가 적용하지 않음 |
| reserved black carrier proposal | `carrier_sink.spawn_reflected(proj,intent)`는 과거 G2 seam 제안이며 실제 ROOT kernel의 `apply_source_q_reflection(ctx)` 소비로 채택하지 않았다. 현재 모든 BLACK/Q/활성창 성공 분기는 사전거절하므로 이 seam/Runtime blackbody를 호출하지 않는다. E/비Q raw 피해는 원 경로 유지 |
| contact facade | `ptype`는 기존 enum PHYSICAL/MAGIC/BLACKBEAN, `dmg`는 실제 원 탄 피해. 반사 시 실제 bool blue_bean/parry_blue_bean/homing/magic/friendly 및 String col 필요. black은 vx/vy/life/ml/aoe_r/aoe_dmg 유한 수치와 black_bean/from_rainbow bool도 필요. 현재 P/F/I/D/L/H kernel은 이 facade가 없어 birth attribution/facade 연결이 다음 경계이며 dark gbBean을 blackBean으로 분류하지 않음 |

공통 명령/contact 반환은 `{ready:bool,accepted:bool,reaction:int,reduced:null|Dictionary,parry:null|Dictionary,missing:Dictionary,error?:String}`이다. `accepted=false`는 중앙 HP commit0이다. `reduced`의 피해/poise_after/stunned는 중앙 source 피해 pipeline이 소비한다. Runtime의 초기 shield poise penalty를 중복 적용하지 않는다. nonzero일 때 HP 후단의 별도 일반 hit penalty는 source 순서대로 유지하고, 초기0이면 pStun을 HP 후단 전에 설정하여 일반 hit guard가 그 단계를 제외한다. adapter의 새 iframe/KB 추가0이다.

World 문맥은 실제 `get_native_frame()/get_native_world_identity()/get_native_projectile_fx_context()`로 읽는다. context schema는 `exoduser.godot.native-projectile-fx-context.v1`, clock_mode는 `godot_delta_native60`, dt_sp는 실제 유한 양수, frame_reset_epoch는 실제 비음수 정수다. 새로운 global/native clock·원소 피해 배율·whole equipment provider·full Q/E 입력/FSM·공개 visual/240 성능 완료 주장은 없다. 현재 Main의 실제 stats/resources/sinks가 없으면 configure=false가 정확한 상태다.

## 실제 Player / World 단일 소비 경로

## 현재 ENGINE 연결 — 2026-10-14 Q/E 단일 피해 경로 (FIRST_VALID10_PLUS_NEW1_PASS)

실제 `scripts/player.gd` / `scripts/world.gd`에 선택 Q/E adapter 바인딩과 접촉 API를 추가했다. 실제 Player의 state·poise·stamina만 proxy로 사용하며 두 번째 Player를 만들지 않는다. source stats8·실제 MP/비용 공급·효과 소비자가 없으면 바인딩은 false이며 본편 Q/E 입력의 자동 활성화는 0이다. 필수 값에 150/.5/100MP 같은 중립 기본을 채워 ready로 만들지 않는다.

| 실제 API / 필드 | 계약 |
|---|---|
| `Player.bind_native_combat_qe(adapter:Object)->bool` / `_native_combat_qe:Object` | 실제 동일 Player·World 및 7개 method·exact bool-ready를 확인한 뒤 한 번 바인딩. 같은 active binding의 중복 교체는 false |
| `Player.get_native_combat_qe_snapshot()->Dictionary` | 실제 adapter snapshot; 미바인딩은 `{ready:false,bound:false}` |
| `World.bind_native_player_combat_qe(adapter:Object)->bool` | ready World의 기존 player 및 `get_combat_world()==self`만 사용. 새 actor·input driver 생성0 |
| `Player.receive_native_projectile_contact(projectile:Object,raw_amount:int,damage_type:String="phys",source_direction:Vector2=ZERO,native_knockback_strength:float=-1)->Dictionary` | HP/iframe gate → QE 결과 → 감소 raw를 단일 내부 피해 경로에 소비. 원 carrier damage와 hurtP raw 요청을 분리 |
| `allows_native_qe_iframe_reflection()->bool` | Q mode·실 active window만 기존 iframe 반사 접촉 예외를 허용. 일반 HP/iframe gate와 E/비Q 거절은 보존 |
| 반사 reaction2 | `PARRY_REFLECT_BLUE` 성공 시 같은 접촉의 HP/KB 적용0. 실제 탄 이동·발사자 귀속·반사 렌더링은 별도 실제 carrier 연결이 필요 |
| `_apply_native_damage` / `_enter_native_hit_stun` | 기존 void `receive_damage`도 같은 내부 경로 사용. shield 초기 penalty가 poise0을 만들면 HP tail 전에 기존 pStun240 진입; 그 외 일반 hit poise−1은 별도 유지. cap33%→DR75% cap/2500 denominator→minimum0.5%의 기존 계산은 변경0 |
| 실제 clock | World priority−1의 `dt_sp/frame/ens`를 Player physics의 HP0 early-return 앞에서 1회 전달. 살아 있는 World의 원 global burst는 Player 사망 후에도 해당 시계로 전개·소멸하며 추가 owner-death 회수0. adapter는 실제 reference·epoch·pause·중복을 검사하고 `Runtime.tick(ticks/60)`만 실행. 추가 자동 physics0. 이 slice는 counter/ring을 Player0에서 함께 처리하므로 원 post-projectile burst phase의 전체 순서까지 완료로 주장하지 않으며 `full_source_phase_order_ready=false` |
| 보존 / 미완 | 실제 6탄 kernel의 기존 receive_damage 호출·후속 상태이상·impact·끝처리는 현재 변경0. 새 facade/birth actor attribution·E 이동/완료·실 source provider·본편 입력·공개 pixels/240FPS는 미완 |

새 코드의 최초 검사 결과와 정확한 provider 계약은 [Q/E 연결 SSOT](FDG_GODOT_QE_BINDING_20261014.md)에 기록한다. 블랙콩 성공 Q 반사는 원 공식 불일치 때문에 `blackbean_source_carrier_not_adopted`로 상태·탄·HP 변경 전에 거절한다. 현재 Source Runtime의 과거19 검사는 canonical 피해/bank 식의 PASS 증거가 아니며 소유자가 같은 affected 분기를 수리 중이다. 원식은 변이 전 `pParryProjDmg(incoming,_sbPW)`→`trunc(base×1.5)`→탄 피해→`bank+=(탄피해||10)`→`doParry(탄피해)`이다. 실제 root `apply_source_q_reflection` 소비는 미연결이며 proposed `spawn_reflected`는 새 탄 발사 권한이 아니다.

기인수한 성공 suite, 원PNG, 보호된 플레이 세션과 `2_3` 확정 문서의 변경0.

First valid integration: 10 groups / 135 assertions / FAIL0 / ERROR0 / exit0 after fixture-only setup repair. Attempt01 remains INVALID with 10 script errors and cleanPASS0. Stats8/resources6/services are constructor fixtures; actual Main providers, input, six projectile facades, BLACK Q and complete source phases remain unadopted. Peace-shield admission is held until its separate source cooldown/state is adopted; its independent new gate test does not rerun the clean10.

The independent peace_shield_admission_hold group then passed FIRST 1/20 with FAIL0/ERROR0/exit0, without rerunning the prior clean10/135. Unique new QE coverage is 10 first-valid repaired groups plus 1 later independent group, not an 11-group replay. Peace MP0/12 fixtures both reject before state/ST/MP/debit/burst/bank changes. Full production Q/E admission remains pending.

---

## 최초 실제 통합 검증

| 새 그룹 | 실제 소비 결과 / 첫 유효 판정 |
|---|---|
| unbound_damage_once | 실제 Player HP350→236(phys raw200/cap115/DR114)→121(magic raw120/cap115), poise4→2. 새 접촉 API와 기존 void 함수가 동일 내부 피해 경로 사용 |
| atomic_provider_gate | 실제 Tree의 같은 Player/World에서 fixture stats8/resources6/services 사용. null/missing/string/bool/nonfinite 등 거절·실제 필드·비용·burst 변이0. fixture는 Main actual provider가 아님 |
| q_expire_reduce | 실제 Q→World frame으로 창 만료→raw100→shield97→phys96→HP254. carrier400과 raw100 분리. 초기 shield poise4→3과 별도 ordinary tail3→2 |
| shield_stun_order | 공개 일반 피해3회로 poise1→실제 state 회복/clock 후 Q→창 만료→초기poise0/pStun→HP248. stun event1, HPtail의 일반 poise는 원 guard로 제외 |
| q_reflect_once | ordinary carrier400→fixture parry300, raw2 분리. 실제 Player HP350·KB 유지, enemy poise20/stun60/impact 각sink1회. 실제6탄 비행·반사 증거는 아님 |
| e_black_guard | 실제 ST에서 fixture cost24 차감·Qmode false. BLACK은 NO_REFLECT_PASS→raw HP, carrier·bank·반사sink 변경0 |
| actual_clock_rejections | 실제 World epoch/frame/dt/ens reference 1회. copy/stale/duplicate/wrong delta/pause는 counter/ring/frame 변이0 |
| q_positive_iframe_reflect | 공개 피해4회→자연 pStun240 종료→실제 iframe60에서 Q 반사 접촉만 허용. 일반/E iframe gate 유지, live iframe setter0 |
| black_q_atomic_gate | BLACK 성공 Q는 source/carrier 미채택으로 atomic 거절. 성공 BLACK·ROOT carrier 소비로 승격하지 않음 |
| dead_player_world_burst_clock | 실제 Q 뒤 공개 피해로 HP0/dead→살아 있는 World9tick에 burst expiry1. 임의 radius/life/clock·owner death recall0 |

총10그룹·135assertion, FAIL0·exit0·ERROR0. 권위는 `dependency-qe-binding-first/tests/attempt-02-first-valid.receipt.json`과 raw stdout/stderr/runtime ledger다. 최초 attempt01은 `World.set_player`를 World ready보다 먼저 호출하여 tiles 접근 SCRIPT ERROR10이 났다. assertion 실패0이어도 INVALID/cleanPASS0으로 보존했다. fixture 순서만 `paused World ready → authored start의 pre-tree Player → public set_world/set_player → 자연 시계`로 수리했다. 공유 product body 수리로 그 오류를 없앴다고 주장하지 않는다. 기존 성공 suite 재실행0.

검사 SourceRuntime는 ENGINE 최초 고정0014 snapshot이다. source owner의0035/0051 current WIP 차이는 별도로 기록한다. checkpoint dependency blob은 검사된 snapshot을 쓰고 더 최신 owner WIP를 덮어쓰지 않는다. BLACK canonical 채택은 다음 실제 carrier unit의 새 증거가 필요하다. 평화방패 admission hold는 이후 별도 새 그룹으로 검사하며 clean10을 재실행하지 않는다.

## 23. MAP PRODUCTION REPORT

| 항목 | 이번 범위 |
|---|---|
| MASTER/LARGE/MEDIUM/GROUND | 기존 Cground canonical geometry·자원 유지, 새 map/nav/충돌·좌표 제작0 |
| PLAYABLE/COMBAT | 실제 Player/World 선택 QE 접촉·시계 API. Main 입력·actual providers·6탄 facade·BLACKQ·E 이동/완료·전체 source phase 미완 |
| CAMERA QA | 격리 실제 CameraTree fixture, 공개 Main 화면·fidelity 비교0 |
| TECH QA | 최초INVALID10 보존, fixture-only 수리 뒤 firstvalid10/135 오류0. 옛 성공 suite 재실행0 |
| VISUAL VERDICT | **RETOUCH** — 기술 연결을 전체 교전·public pixel·최저240 품질로 승격하지 않음 |

## Independent peace-shield admission proof

FIRST new1 group / 20 checks / FAIL0 / ERROR0 / exit0. MP0 and MP12 constructor fixtures both retain actual idle Player, ST200, MP0/12, debit0, burst0 and bank0. The prior clean10/135 and initial INVALID10 raw files were neither overwritten nor rerun. Exact receipt: dependency-qe-binding-first/tests/peace-hold-first/worker-receipt.json. Unique new coverage is 10 first-valid repaired groups plus this independent1; no combined11 replay.

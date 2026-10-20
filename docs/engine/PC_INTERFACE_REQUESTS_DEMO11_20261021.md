# 1-1 데모 PC 전투 핵심 인터페이스 요청 통합

기준: fetch 후 `origin/main 0138c5bb9188d27cee10cb1a901d075092ddb88f`(2026-10-21). **문서 전용이며 제품·테스트 변경0, Godot 실행0**이다. 아래는 Mac 차단 보고의 통합 요청이며, PC 구현/병합/전투 인수를 완료했다는 뜻이 아니다. main에 없는 보고서는 지정 SHA에서 읽었고 제품 merge는 하지 않았다. 원본 `G행`은 이 main의 `game.html`이다.

**시그니처 중 ‘제안’은 아직 존재한다고 확인한 API가 아니다.** PC가 같은 계약을 이미 구현했다면 새 함수를 만들지 말고 실제 함수·인수 SHA·접점 대응표를 회신한다. 반환 shape는 아래 공통 영수증으로 설명하되 기존 PC 반환을 Mac wrapper에서 읽을 수 있으면 이름/형식을 억지로 통일하지 않는다. 실제 구현은 PC가 소유하고, Mac은 원문 producer·레슨/소환/화면 소비자를 연결한다.

## 1. 근거와 범위

| 보고서 스냅샷 | 차단 근거 위치·이번 사용 범위 |
|---|---|
| [DEMO11-39](orders/reports/demo11-39_REPORT.md) `aa23dd31` | ‘PC에 필요한 OLD→NEW’ 및 HP0/fallen/retry 표. HP0 토큰·부활/리스폰 집행·clear 경합 |
| [DEMO11-48](orders/reports/demo11-48_REPORT.md) `a6956978` | ‘PC 인터페이스 요청과 재개 순서’. normalBow hurtE 옵션·동일 packet 반사·관통 후속 |
| [DEMO11-30](orders/reports/demo11-30_REPORT.md) `94d26012` / [EL-01](orders/reports/el-01_REPORT.md) `654845e4` | M29 실제 비투사체 패링/문맥. EL-01 선택기·단일 modT lock은 이미 Mac 부품이므로 PC 재작성 요청 아님 |
| [etype-c](orders/reports/demo11-etype-c_REPORT.md) `9fde1d4a` | 타입별 표·‘PC 요청·A/B 통합 후보’. 13 web90·14 급강하·15 사망 중간 분열·16 덫. 원격 SHA와 로컬 OUT/DONE 일치 확인 |
| [etype-e](orders/reports/demo11-etype-e_REPORT.md) `70d1ca22` | 타입3/7/29별 NOT_READY. hurtE 실제 field owner, M29, gate 최종사망/사망탄. Mac29 actor 미구현도 별도 표시 |
| [etype-b](orders/reports/demo11-etype-b_REPORT.md) `c6d19973` / [etype-f](orders/reports/demo11-etype-f_REPORT.md) `ef64bd17` | B8~12/F26~28 표. 특수/일반 탄·돌진·강타·시체 부활·자식 소환 후속. 등록/비치명 피해 PASS를 전체 전투 성공으로 승격하지 않음 |
| [DEMO11-29](orders/reports/demo11-29_REPORT.md) `ff7d85c3` | ‘재련 HOLD / PC 요청’. recalcSt 단독 writer 부재, equipment_refresh 대체 시 추가 clamp 불일치 |
| [DEMO11-15](orders/reports/demo11-15_REPORT.md) `f1359e1e` | 첫 표의 실제 연결기 계약·step별 NOT_READY. 기본/step0/8은 이미 있으며 재작성 대상 아님 |
| [perf](orders/reports/demo11-perf-enemy_REPORT.md) `aaf52dc0` | ‘PC 펫 초상 cold load’ OLD/NEW. 초상 캐시만 이번 요청에 포함; 자원 authority 읽기 캐시 확대는 별도 검토 |
| DEMO11-24 | `~/exoduser-wt/demo11-24` 존재, 제출 DONE/원격 지정 ref는 미확인. 진행 worktree는 건드리지 않고 사용자 지시대로 이번 집계 제외. 확정 보고서 인수 뒤 추가 |

위 상대 링크는 같은 저장소의 **목표 경로**다. 기준 main에는 일부 보고서가 없으므로 재현 시 위 SHA의 해당 경로를 읽는다. 원로그 `~/exoduser-wt/_out/pc-iface-pack/evidence-index.json`에 11개 보고서의 전체 commit SHA와 blob ID를 보존한다. 이 문서만으로 미병합 코드가 main에 있다고 간주하지 않는다.

## 2. 우선순위 — 데모 영향 큰 순

‘필수’는 모든 시점에 무조건 실행한다는 뜻이 아니라, 해당 원문 경로에 도달할 때 생략할 수 없다는 뜻이다. 자연 소환 타입은 도달 조건부 필수이며 임의 데모 제외/다른 타입 대체로 닫지 않는다. 장비/부활 기능도 임의 비활성화하지 않는다.

| 요청 ID | 우선순위·막히는 Mac 단위/SHA | 호출 시점 | 1-1 필수 여부 | 중복 묶음 |
|---|---|---|---|---|
| PCI-01 | P0: 39 `aa23dd31`, 37 clear 인계 | HP0·fallen 진입/만료·retry/로비 이벤트; countdown은 Mac 한 source clock | 필수: 사망→재개·부활 중 clear 차단 | A 생명주기 |
| PCI-02 | P0: E3 `70d1ca22`, B/F/C 신규 actor의 동일 hurtE 수용 | actor bind 시 계약 확인, 실제 타격 이벤트마다 live owner 확인 | 조건부 필수: 실제 적 타격·처치 | A 피해 owner |
| PCI-03 | P0: 48 `a6956978`, E3 `70d1ca22` | 화살/beam 적중 이벤트 | 필수(기본 활)/조건부(해당 적·스킬) | A 옵션 보존 |
| PCI-04 | P0: 30/EL-01 `94d26012`/`654845e4`, E7 `70d1ca22`, C14 `9fde1d4a`, F27/28 `ef64bd17` | AI tick의 **충돌 성립 이벤트**·공격당 원문 허용 횟수 | 조건부 필수: 자연 정예·급강하/돌진/강타 | B 비투사체 접촉 |
| PCI-05 | P0: B8/10/12 `c6d19973`, F26/27 `ef64bd17`, E29 `70d1ca22`, 48 `a6956978` | 발사 이벤트→registry tick/접촉/만료 | 조건부 필수: 실제 탄 삭제 없이 전투 | B 실제 탄 carrier |
| PCI-06 | P0: 48 `a6956978`, 15 `f1359e1e` step1~3/6, B/F 탄 | 실제 충돌·Q/E 해제 이벤트; 최초 분류는 bind/출생 때 | 필수: 원문 반사·패링을 쓰는 경로 | B 동일 packet 반사 |
| PCI-09 | P0: B8 `c6d19973`, C15 `9fde1d4a`, E29 `70d1ca22` | hurtE 사망 파이프라인의 **지정 중간 prefix**, 최종사망과 구분 | 조건부 필수: 폭발·분열·사망탄/보상 순서 | A 사망 효과 |
| PCI-11 | P0: E29 `70d1ca22`, 39/37 `aa23dd31`·관련 clear | 실제 최종사망/부활 보류 확정 이벤트 | 필수: gate·clear·보상 단회 귀속 | A 최종사망 인계 |
| PCI-07 | P1: C13 `9fde1d4a`(C17은13에 의존) | web 탄 접촉 이벤트, 감소는 PC의 기존 source tick | 조건부 필수: HP 피해 없는 web90 | B 상태 |
| PCI-08 | P1: C16 `9fde1d4a` | registry tick의 선행 밟기→후행 Q/일반 접촉 순서 | 조건부 필수: 정지 덫 | B 상태+탄 순서 |
| PCI-10 | P1: B9 `c6d19973` | revive timer 만료 이벤트 | 조건부 필수: 동일 시체 객체 부활 | A 적 부활 |
| PCI-12 | P1: 29 `ff7d85c3` 재련·빈 슬롯 제작 | 거래 commit 이벤트(매 tick 호출 아님) | 기능 도달 시 필수: 둘은 데모 금지가 아님 | C 원문 ST writer |
| PCI-L01~L07 | P1: 15 `f1359e1e` step1..7 | step begin/실제 advance·retry·finish; 아래 단계별 표 | 튜토리얼 완료 목표에 필수. 현재 **7단계 NOT_READY** | B 재사용+C 레슨 어댑터 |
| PCI-13 | P1 성능: perf `aaf52dc0`(P2-004b 소유) | configure 1회 prewarm·발화 때 cached texture 배정 | 게임플레이 기능은 유지, 데모 성능 인수에 필요한 hitch 개선 후보 | D 펫 표현 캐시 |

## 3. 공통 입출력·실패 계약

공통 입력 `ctx`는 실제 Main/World/State/Player 또는 enemy identity, stage/provider revision, 단회 request token과 해당 PC 소유 source clock/RNG 참조다. **캐릭터/적/packet 식별값만 받아 임의 새 객체로 바꾸지 않는다.** 초기 계약 검증은 최초 bind/스크립트 교체 때 하고, tick에서 `get_method_list/get_property_list/get_signal_list` 같은 목록 생성 API를 사용하지 않는다. 캐시를 쓰더라도 현재 owner 소멸/reparent·stage 변경·cap/state·중복 token 거절은 유지한다.

제안 `Receipt`는 `{status,accepted,reason,token,source_prefix,applied_fields,before,after,rng_span,replayed}` 및 요청별 결과다. `REJECTED/NOT_READY/FAILED`는 **해당 요청 실패 시 HP/poise/상태/자원/registry/이벤트/RNG 무변이**여야 한다. PC는 변경 전에 owner·옵션·callback·Marker 예약·수명·소비자 준비를 검증한다. 사전검증으로 보장하지 못하는 operation은 NOT_READY로 거절하고 절반 실행을 성공 처리하지 않는다.

원문이 허용하는 early return/부분 prefix는 API 실패와 구분해 `SOURCE_RETURN` 및 실제 적용 prefix를 반환한다. 이미 앞선 **다른 요청**에서 확정한 prefix나 공용 RNG를 거절 한 건 때문에 되감지 않는다. 실제 타격 이후 원문 분기가 끝난 것을 거절로 재분류해 환불/전체 롤백하지 않는다. commit 후 예외를 무변이 실패로 숨겨서는 안 되며, 예외 시 원자성을 지킬 수 없는 경로는 입장 전에 막아야 한다. 중복 token은 재집행 없이 이전 영수증만 반환한다.

| 요청 ID | 필요한 PC 함수 시그니처·입력(모두 제안, 예외는 명시) | 반환·실패 시 무변이 및 원문 근거 |
|---|---|---|
| PCI-01 | `request_native_player_life_transition(request:Dictionary)->Dictionary`. op=`fallen_enter/revive_once/revive_resolve/final_death/respawn/lobby_prepare`, 실제 player/Main identity·PC 발급 death_token·source 판정 receipt. `read_native_player_life_phase()->Dictionary`는 읽기 전용 | Receipt+`death_token,life_phase,state,hp,mp,st,iframes` 실제 P/Player readback. 이미 dead가 된 HP0 이벤트도 유효 토큰으로만 인수. 중복 사망·외부 actor/오래된 토큰은 무변이. G43721–43751,43847–43865,63476–63477,63521–63530,63673–63682. reviveOnce 우선/iframe120·fallen300/9999·retry300은 op별 source 그대로. 임의 iframe setter 금지. Mac300 source-sp countdown(정지 중0)/사망 순간 저장 roll 재사용과 PC 집행 분리 |
| PCI-02 | `bind_native_enemy_hurte_owner(actor:Node,ctx:Dictionary)->Dictionary`; 기존 `read_native_normal_enemy_hurte_fields()`와 PC의 제한된 동기 field commit 계약에 **실제** type3/대상 actor를 연결 | binding Receipt+`owner_token,revision,readback` 및 PC hurtE가 요구하는 전체 필드 지원. standalone receive_damage를 공용 hurtE 성공으로 대체하지 않음. 초기 bind 뒤 타격 때 live identity 확인; 실패 HP/shield/poise/RNG0. G42110 이후 및 type3 constructor G31131–31167; E 보고서의 현재 hurtE105 field-owner 요구가 정확한 차단점. PC가 필수 write 메서드명을 회신해야 하며 존재를 미확인한 writer 이름은 확정하지 않음 |
| PCI-03 | `request_native_hurte(actor:Node,damage:float,angle:float,no_sound:bool,opts:Dictionary,attack_element:int,ctx:Dictionary)->Dictionary` **기존 hurtE 실행자에 대한 호환 facade 제안** | Receipt+`ok,halted_at,alive_before,alive_after,kill_receipt`. normalBow/ghostXbow/beam 및 실제 packet opts를 보존, unsupported 옵션은 삭제/일반 근접으로 치환하지 않음. source에 없는 opts 확대도 금지. G28702–28730,35407,42466,35560–35617. 현재48 진단은 `hurte_opts_unsupported:normalBow`,42110,RNG0; 이것은 성공 아님. beam 수용은 E3 조건을 별도 인수 |
| PCI-04 | `read_native_nonprojectile_parry_context(player:Node,ctx:Dictionary)->Dictionary`; `resolve_native_enemy_contact(actor:Node,player:Node,event:Dictionary,ctx:Dictionary)->Dictionary`. 기존 binder의 **실제 호출** `handle_m29_parry(actor:Node,target:Node,event:Dictionary)->bool`는 이 PC owner로 연결하는 어댑터로 보존 | 문맥 `{ready,parry_window,player_state,iframes,revision}`+Receipt `{parried,damage_applied,poise_delta,kb,mod_hit,source_branch}`. live isPWin→parryBank→doParry(non-projectile)→poise20 또는 원문 hurtP/eModHitP/KB 순서. G38469–38470,40531–40535(M29),40540–40549(eSwoop). **G40550–40558 강타에는 isPWin/doParry 분기가 없으므로 패링을 새로 추가하지 않음**; profile별 적/Player KB도 원문대로. iframe/charge/벽 충돌 및 recovery 분기를 단일 true/false로 생략하지 않음. 기존 `type3_native_binding.gd:249–252`는 callback 반환을 bool로 검사하므로 **거절 Receipt Dictionary를 직접 반환하지 말고** 실제 성공 여부를 bool로 변환. M29의 player_damage는 이미 receive_damage→posthurt KB 경로가 있어 이 callback에서 재집행0; callback은 player_parry 분기만 소비. FX/audio readiness도 실제 owner 인수 후 제공. 가짜 projectile facade 금지; 거절 피해·poise·RNG·recover 전이0 |
| PCI-05 | `admit_native_source_projectile(owner:Node,packet:Dictionary,ctx:Dictionary)->Dictionary`; 기존 DEMO11-35 registry가 호출할 `advance_native_source_projectile(handle:Variant,sp:float,ctx:Dictionary)->Dictionary`(carrier adapter 명칭 제안) | Receipt+동일 `packet_id,registry_handle,source_owner,collision_receipt,expired,release_receipt`. B 일반 charged/mouth·F blizzard/icicle·E29 사망8탄을 각 원문 profile로 수용. G40456–40524,41232–41241,39086–39108,20119,42817–42824,48의G35176–35236. 미지정 element=-1을 physical0으로 위장하지 않음. emitter3/7/21 whitelist를 Mac이 임의 확대하지 않음. 새로운 경쟁 registry는 만들지 않고 Mac enemy-base/기존 registry 통합 재사용; PC 소유 접촉·패링 부분만 인수. 잘못된 carrier는 출생/RNG/packet 변이 없이 거절 |
| PCI-06 | `resolve_native_projectile_interaction(packet:Dictionary,target:Node,event:Dictionary,ctx:Dictionary)->Dictionary`. event=`q_release/e_release/player_contact/enemy_reflect/wall_reflect`, source 분류/소유권/해제 token 포함 | Receipt+`parry_class,friendly,reflected,damage_receipt,packet_return_owner,released_once`. G16917(web Q금지),33757/38460(holdRelease),35040 이후 Q 분류,35176–35236·35407·35560–35617(normalBow 벽/적 반사·피해/관통 순서),38470 physicalParry. 물리/다종 마법을 현재 gbBean 전용 반사로 대체하지 않음. source identity/친화·blueBean flags/실제 적 생존 결과를 보존해 레슨과 관통이 같은 packet을 관측. 거절 resource/방향/탄 반납/RNG0; 단회 pool 반환 권위 명시 |
| PCI-07 | `request_native_player_status(player:Node,kind:String,source:Node,packet:Dictionary,ctx:Dictionary)->Dictionary`, 우선 kind=`web` | Receipt+`status_field,before_ticks,after_ticks,clock_owner,cleanse_receipt`. G35083–35084의 web90은 HP 피해 아님. G33005/33022 감소·이동×.5, Q 분류G16917 및 기존 정화 순서를 PC owner가 소유. freezeSlow로 치환/새로 중첩 시간 합산 금지. 실패 Player 상태·속도·HP 무변이. 트랩 slow는 다음 요청의 저항/접촉 순서 안에서만 처리 |
| PCI-08 | `resolve_native_trap_contact(packet:Dictionary,player:Node,phase:String,ctx:Dictionary)->Dictionary`, phase=`pre_step/q_reflect/post_contact`는 registry source 순서로 호출 | Receipt+`consumed,damage_applied,slow_ticks,stagger_ticks,parry_receipt`. G34690–34707 **먼저** 반경28·!charge, iframe이면 피해/slow 없이도 밟으면 소멸; 피해·KB8·trapSlow=trunc(120×(1−min(.5,slowRes))). 반사 덫 제거·life 만료 제거 없음. 그 뒤 Q/후행 G35085–35088의 별도30틱 stagger. 실패는 탄 소비/HP/KB/slow0; source의 정상 iframe 소비는 SOURCE_RETURN/APPLIED로 구분. 이 순서 없이 단순 status setter만 제공하면 인수 불가 |
| PCI-09 | `register_native_enemy_death_effect(profile:String,consumer:Callable,ctx:Dictionary)->Dictionary`; hurtE 내부 지정 위치에서 `consumer.call(prefix_context)->Dictionary`(동기 예약/commit 영수증) | Receipt+`death_token,prefix,spawn/effect_receipts,continued`. G42784–42790(B8 반경50 hurtE/hurtP 폭발),42792–42800(C15 분열2자식),42817–42824(E29 사망8탄/빙결). **모두 최종 died 신호 뒤에 몰아 실행하지 않음**. E29의 black U<.5/red U>=.5는 실제50/50이며 주석30%를 수치로 재사용하지 않음. C15는 gore/후행 보상 앞 원문 위치, child mkEn·stats 후대입·RNG interleave·실패 continue를 보존. Marker child 예약은 Mac 공통 owner가 담당; PC는 필수 callback/예약 없으면 lethal 요청 **쓰기 전** NR. 다른 타입/이미 확정된 앞선 prefix는 되돌리지 않음 |
| PCI-10 | `request_native_enemy_revive(caster:Node,ctx:Dictionary)->Dictionary` | Receipt+`pool_revision,corpse_id,selected_index,revived,readback,next_timer`. G38944–38958 실제 `_deadPool` 원래 순서의 최초 !ib/etype!=9/!absorbed/거리<150 객체를 같은 identity로 부활; HP trunc(mhp*.5),shield0/recover60/poise/각 필드 원문대로. 실제 empty이면 정상 SOURCE_RETURN·retry60, owner 부재는 NR·timer/시체 무변이. 새 적 생성/가짜 빈 pool 금지 |
| PCI-11 | `subscribe_native_final_enemy_death(consumer:Callable,ctx:Dictionary)->Dictionary`; 이벤트 payload `{actor,death_token,life_phase,stage,provider_revision,kill_receipt,gate_guard}` | binding Receipt·단회 final-death 신호, revival-pending/cancel 구분. G42733–42744 문지기/보스 사망 문맥,39의 boss-final-death 대기 요청 및 E29 보고서. **Main37 clear sink를 PC가 복제하지 않음**. Mac37/P3-003은 `_gateGuardKilled`10%·gate/arena/clear/랭크 귀속을 기존대로 소비; `_bossUnlocked` 직접 setter 요청 아님. failed subscription 무변이·중복 발행0; 플레이어 fallen/최종사망 동안 clear 유예/취소는 PCI-01 token과 Mac37 협약으로 검수 |
| PCI-12 | `request_native_recalc_st(owner:Node,ctx:Dictionary)->Dictionary`(PC 공개 모드/함수 제안) | Receipt+ST/mST·3캐시 readback. G16425–16431: 캐시 무효화→**기존** `resource_parameters.run_recalc_st`→ST/mST commit만. G50836·51176의 뒤 **별도 apply_stats1회**는 Mac29가 기존 API 호출. 재련/빈 슬롯 제작 admission에서 readiness 확인 후 비용/RNG 소비; 실패 ST/캐시/장비/악의/RNG0. equipment_refresh의 HP/MP/shield clamp를 몰래 추가하지 않음. recalcSt 원문 자체의 `st=min(st,mst)`는 제거하면 안 됨 |
| PCI-13 | PC `native_pets.gd` 내부 `prepare_native_pet_portrait(who:String)->Dictionary` 및 `_show_bubble(who:String,txt:String)->void` 캐시 소비(제안, **Mac 외부 호출 추가 불필요**) | `{ready,who,cached,resource_identity,reason}`. configure에서 crow/cat 각1회 로드·강한 참조 유지, 발화 시 exists/load0. 해당 key 준비 실패는 그 cache/현재 portrait 무변이, 대사 텍스트/트리거는 원래대로 계속. G9364–9378의 초상 선택/레이아웃 보존. port aaf52dc0 `native_pets.gd:633–673`가 최적화 위치; 캐시는 웹 원문 기능이 아닌 Godot 개선 제안. profiler self 약14.9ms, cold 약15.3–15.7ms→warm4µs 관측. 기동으로 옮기는 합계 약31ms 비용과 최초/전환/pair를 PC가 검수해야 하며 전체120fps 보장으로 환산하지 않음 |

## 4. 레슨 step별 독립 PC 인수 — PCI-L01~L07

**이미 있는 계약:** `f1359e1e`의 `Main.source_intro_sequence.lesson_flow.bind_native_lesson_step(step:int,consumer:Node)->bool`. 소비자는 실제 world 자손이며 `native_demo11_lesson_step_consumer.gd`를 상속한다. true는 binding 수락뿐이다. 각 step은 따로 등록하고, 없는 step만 NOT_READY로 유지한다. 단계 중 하나 때문에 다른 단계/기본/0/8을 닫지 않는다.

PC가 구현할 공통 메서드(기존15의 실제 포트): `supports_lesson_step(step:int)->bool`, `begin_lesson_step(step:int,context:Dictionary)->Dictionary{ready,reason}`, `advance_lesson_step(step:int)->Dictionary{ready,failed,failure_kind?,completed}`, `retry_lesson_step(step:int)->bool`, `restore_lesson_step(step:int,reason:String)->void`. context는 실제 world/player/state/flow다. begin·retry는 이벤트, advance는 해당 레슨 source tick, restore는 완료/거절/skip/owner 해제 이벤트다. `ready=false`/실행 거부는 현재 요청 쓰기0이다. 반면 `ready=true,failed=true`는 **정상 집행된 연습 실패**(원문 탄 피격 등)이므로 실제 source HP 차감/탄 소비를 영수증에 남기며 이를 무변이 API 실패로 위장하지 않는다. restore는 소비자가 **이미 성공적으로 얻은 lease의 자체 자원만** 원상복원하며 중복 실행0이어야 한다. cleanup이 필요한 거절은 begin의 부분 집행을 허용한다는 뜻이 아니다.

레슨 source는 `game.html:14`가 로드하는 **별도 원본 `parry-lesson.js`**다. 아래 JS행을 game.html 행으로 위장하지 않는다. G32111의 tick 진입, G33757/38460 해제, G38470 physicalParry, G46480 rageCast가 게임 본체 연결 근거다. PC는 전투 판정/HP·poise·패링 writer를 소유하고, Mac15는 이미 있는 allows·focus150·실패60·다음 단계·skip/finish 복원 연결기를 재사용한다.

| 요청 ID / Mac·SHA / 필수·묶음 | PC 소비자 입력·완료 반환 조건 | 원본 근거·호출/실패 계약 |
|---|---|---|
| PCI-L01 / 15 `f1359e1e` step1 / 레슨 필수·B | 공통 step=1. 실제 lesson 물리탄의 E 반사·친화/blueBean·원래 발사 적 identity와 실제 kill receipt. **그 처치 뒤만** completed=true | G38470 및 JS204–230,409–425,653–654. shot ack/반사만으로 완료0. PCI-02/03/05/06 재사용. 실제 E snapshot의 projectile_parry_adopted=false인 상태는 NR |
| PCI-L02 / 같은 step2 / 레슨 필수·B | step=2, 원본5종 마법탄·Q hold120·release24틱 window 내 서로 다른3발, releaseR≥300/parryT>0·actual hit receipts | G33757 및 JS550–580,409–425,592–611. 한 탄 중복 count/ready ack 금지. PCI-05/06. 실제 다종 carrier 없는 경우 이 step만 NR |
| PCI-L03 / 같은 step3 / 레슨 필수·B | step=3, 원본5종 물리탄·hold180·chargeMul≥3·동일 해제의 실제3개 distinct hit | G38460/38470 및 같은 JS409–425,550–611. Q 물리 반사/일반 피해로 위장0; PCI-05/06 공유 |
| PCI-L04 / 같은 step4 / 레슨 필수·C | step=4. PC 사슬 owner의 읽기 증인 `{tier,gauge_before/after,flight_active,pulled,position_before/after,released}`. 원문1→2→3단 실제 끌림·이동≥1·해제 완료 후만 completed | G12851/13352(단계/실제 발사), JS348–383. 입력 토큰/물리 LeftShift·시작/종료와 readback는 PC 원문 owner가 제공. Node 좌표를 Mac이 옮겨 성공 위장0. 실패 시 기동력/ST0변이, 시도 사이 원문 refill만 PC retry/제어 owner로 집행 |
| PCI-L05 / 같은 step5 / 레슨 필수·C | step=5. 방향+Space arm token→실제 `_bdMoveT>0` 비행5회. 비행 종료+Space 해제 전 재크레딧0. 읽기 증인 `{armed,flight,move_ticks,count,pressed}` | G32985/45344 이후 `_tickBladeDash`, JS326–344,523–525. 일반 이동/돌진 대체0. chapter1의 requireCost=false를 비용 소비 성공조건으로 강화하지 않음; 실패 MP/기동/위치 무변이 |
| PCI-L06 / 같은 step6 / 레슨 필수·B+C | step=6. 실제10탄 Q 패링 증인+ragemeter 읽기, `rageParried && rage>=100`일 때만 completed | G27890(레슨 rage max100)/33757, JS409–425,534–545,550–574. 직접 rage100 설정0, PCI-06 실제 자원 writer/관측 재사용. 未연결은 NR |
| PCI-L07 / 같은 step7 / 레슨 필수·C+A | step=7. 원문 분노 실행/대상 피해 owner 및 actual rageCast amount≥100 receipt. focus150 종료·방향 해제 이후만 완료 | G46480, JS505,529–532,639–649,683. 현재 player.gd523의 rage_slot 미연결을 mock cast로 대체0. rage·HP·poise 쓰기 PC 전용. skip/실패/finish 때 PC 적/탄/카메라 focus·제어 lease만 복원, 기존 기본/0/8 재작성0 |

모든 레슨의 `completed=true`는 **실제 전투 증인**의 소유자가 반환해야 한다. f1359e1e의125/0은 연결기/거절·복원 계약 검사이며 실제 step1..7 전투 완료0이다. 이 수치를 PC 소비자 인수로 재사용하지 않는다. UI에는 NOT_READY 같은 개발 진단을 노출하지 않고 기존 게임 폰트/Hell Gothic·번역 CRLF 규칙을 유지한다.

## 5. PC 요청과 혼동하면 안 되는 Mac 후행

| 항목·원보고 | 필요한 선행·소유권 | PC 완료만으로 해결되지 않는 것 |
|---|---|---|
| E29 `70d1ca22` | PCI-02/04/05/09/11은 PC 경계 | exact29 constructor·공격/사망탄 소비자·MAP11 Marker 등록은 **Mac 미구현**. PC 함수 이름만으로 READY 판정 금지 |
| B11/타입7·C17 `c6d19973`/`70d1ca22`/`9fde1d4a` | B11은 G40777–40797의type3 2~3개, type7은1~2개(exact004 prepare/install 한정, 미지원008까지 확대0); C17은G39031–39047의type13 2~3개. PCI-02/04와 C13 상태 선행 필요 | 기존 recipe/kernel·동적 Marker 예약/부모 origin·분모·취소/중복 receipt는 **ttys006 demo11-enemy-base와 DEMO11-43/MAP11의 Mac 접점**. PC에 새 factory/경쟁 소환 helper를 만들라고 요청하지 않음. 원문 좌표 복제 금지·개수/constructor RNG·stats 후대입 계약 보존. C15만 PCI-09의 정확한 PC death-prefix에서 Mac 예약을 호출 |
| B/F 일반 탄·48 player 탄 | PCI-05/06으로 PC 보호 부분 인수 | 기존35 registry/natural route/queue·pool 반환·carrier 연결은 Mac 공통 기반과 조정. emitter/registry 존재 자체가 해당 profile 실행 준비를 의미하지 않음 |
| EL-01 | PCI-04 실제 M29 context/callback 후속 | 이미 구현된 elite 선택/constructor 순서/단일 busy 감소·M29→M30 owner를 PC가 다시 만들지 않음. forced29 Mac constructor/등록도 별도 |
| 39/37 | PCI-01/11 + 기존 P3-003 실제 귀속 | life pending 중 clear gate·pending token 단회 재개/폐기, retry EXP·저장 영수증·화면은 Mac 후속. PC life 성공을 저장/clear 완료로 세지 않음 |
| factory / 24 | 자연 등록 공통화는 ttys006,24는 진행 worktree | 앞선 ‘factory 등록만 추가’ 권한 메시지를 이번 PC 필수 요청으로 재활성화하지 않음. 24의 미확정 접점 추측 추가0 |

## 6. PC가 한 번에 만들면 좋은 묶음 4개

| 권장 묶음·순서 | 함께 전달할 요청 | 묶는 이유·최소 인수 |
|---|---|---|
| A — 피해/사망/부활 실제 owner (1순위) | PCI-01/02/03/09/10/11 | 같은 HP/생존/사망 prefix의 단회 token·readback을 공유. player life와 enemy corpse의 writer는 **서로 분리**, 임의 공용 HP setter로 합치지 않음. 실제 normalBow/beam,15 lethal 분열 prefix,8 폭발,9 동일 객체 부활,29 최종사망 gate·fallen 중 clear 차단을 각각 인수. Mac actor/child 예약이 미준비인 case는 독립 NR로 남김 |
| B — 접촉/탄/패링/상태 (2순위) | PCI-04/05/06/07/08 + L01~03/L06의 공통 전투 접점 | 실제 isPWin 및 원문 분류/충돌 순서 재사용. M29/eSwoop의 non-projectile과 normalBow/다종탄의 projectile을 같은 가짜 facade로 만들지 않음. web·trap·slam의 패링 가능/불가·무적/charge 분기는 source별 검수. typed profile별 NR로 이미 지원된 암흑 step0 등을 회귀시키지 않음 |
| C — Player 자원/제어 공개 및 레슨 소비자 (3순위) | PCI-12 + L01~L07 adapter, 특히L04/05/06/07 | recalcSt는 기존 producer·원문 clamp만 공개, 사슬/전격이동/분노는 기존 PC owner 실행+관측을 공개. 서로 다른 거래/제어 writer를 하나의 거대 트랜잭션으로 묶으라는 뜻 아님. PC scope 밖에서 새 전투식 복제0. 단계별 actual witness/실패 무변이/skip 복원과 기존 기본·0·8 회귀 |
| D — 펫 초상 prewarm (작은 독립 병행 후보) | PCI-13 | 전투 식과 무관하나 PC 파일 소유. configure 두 초상 강한 참조·발화 cache-only·missing key 원래 fallback·텍스트/trigger/RNG0변경. 최초/전환/pair·기동 비용·고정 N틱 벽시계 측정. 원 보고의15ms가 실제 제거됐는지 확인하고 전체 FPS 보장과 구분 |

A/B 일부를 먼저 제공해도 Mac은 **완료된 개별 요청/step부터** 재개할 수 있다. 네 묶음 모두 완료될 때까지 일괄 대기시키지 않는다. 동일 요청에 여러 Mac 단위가 붙은 경우 PC는 한 owner/하나의 실제 API를 제공하고 각 Mac adapter가 재사용한다.

## 7. 회신·인수와 이번 문서의 검증 한계

PC 회신 최소 필드는 `요청ID→실제 함수/파일:행→인수 SHA→입력/반환 예시→실패 전후 무변이·RNG/이벤트 수→단회/소유권 해제→실제 source 분기 증거→Mac 후행`이다. 이전 PC 브랜치나 이미 제출된 DEMO11-36/49 등에 구현이 있으면 그 SHA를 대조하고 중복 구현하지 않는다. 이 문서는 해당 미지정 브랜치의 준비 상태를 추정하지 않는다.

검수는 실제 Main/actor/packet 연결과 원본 행·접촉 순서를 대조한다. callback true/생성 ack/옵션 거절 재현/constructor fixture만으로 피해·패링·부활·전투 완료를 PASS로 세지 않는다. 관련 기존 회귀는 무수정 유지하고 수정 범위에 닿는 것만 실행한다. 실패/잘못된 actor·stage·token/owner 해제/중복 호출도 검사한다. 실행 시 격리 userdir·Godot 수2이상30초대기·UTF-8 하니스·명시 node 경로·tick 목록 생성 API 금지 등 기존 규칙을 그대로 적용한다.

**이번 문서는 보고서 지정 절·최신 main 원문 좁은 행 범위의 정적 대조만 수행했다.** 코드/테스트/공용/저장/맵 변경0, Godot/Node 테스트·벤치·새 캡처0. PC 인터페이스 구현 PASS 수는 없으며, 소스 수치/맵 배치/보호 경로를 바꾸지 않았다. 자기 브랜치 push·원격 SHA 일치·DONE 뒤 자기 sparse worktree를 제거한다. 원로그는 `~/exoduser-wt/_out/pc-iface-pack/`에 보존한다.

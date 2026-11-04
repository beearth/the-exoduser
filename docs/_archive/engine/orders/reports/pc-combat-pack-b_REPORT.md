# PC-COMBAT-PACK-B — normalBow hurtE·신규 actor hurtE owner·실제 탄 carrier·동일 packet·사망 중간 prefix

2026-10-21 KST, PC Claude. 기준 `origin/main c06184592`(M29 패링 포함), 브랜치 `claude/pc-combat-pack-b2-20261021`, worktree `G:\exoduser-wt\pc-combat-b2`(이전 `pc-combat-b`는 정리 사고로 손상 — 미커밋 carrier·oracle 2파일만 보관본에서 이관 후 재검토). 계약: [PC_COMBAT_PACK_B_CONTRACT_20261021.md](../../PC_COMBAT_PACK_B_CONTRACT_20261021.md). 요청: `origin/codex/pc-iface-pack-20261021` PC_INTERFACE_REQUESTS_DEMO11 §3 PCI-03/02/05/06/09.

**판정: PCI-03 완료 · PCI-02 완료 · PCI-05 완료(플레이어 normalBow; 적 탄 birth는 기존 DEMO11-35 registry 유지) · PCI-06 부분(플레이어 탄 동일 packet 완료, 적 탄 Q 위임만·E/접촉 NOT_READY) · PCI-09 완료 · PCI-07/08 미구현(설계만).** 화면에 보이는 요소 추가 0(표현 미이식은 아래 HOLD).

## 1. PCI별 상태

| PCI | API(확정) | 상태 | 근거 |
|---|---|---|---|
| 03 | `Main.request_native_hurte(actor,damage,angle,no_sound,opts,attack_element,ctx)` | **완료** | normalBow 패킷을 opts 그대로(동일성) 기존 hurtE 실행자가 수용. 42270 `_isArrow`·타입%·critRateBow·`_weakPj`·42466 넉백 없음. 원본 VM 대조 일치. 미이식 opts는 거절(삭제/근접 치환 0). beam=NOT_READY(쓰기 전), 불 원소 석궁=REJECTED(42700) |
| 02 | `Main.bind_native_enemy_hurte_owner(actor,ctx)` + 서비스 `is_native_hurte_binding_live/release_native_enemy_hurte_owner` | **완료** | type3 bind 1회 계약 검사(has_method) → 타격 때 O(1) live identity. 실제 normalBow 탄으로 type3 처치까지. 요구 write 메서드명 계약 §4 확정 |
| 05 | `admit_native_source_projectile` / `advance_native_player_projectile_pass` / `advance_native_source_projectile` | **완료(플레이어 normalBow)** | 기존 World 플레이어 탄 store(pProjs 풀) 재사용 — 경쟁 registry 0. G35176–35628 normalBow 문장 실행, 원본 VM과 궤적·접촉·RNG·운명(재활용/drop) 일치. 적 탄 birth는 `NOT_READY → 기존 DEMO11-35 _birth_request` |
| 06 | `resolve_native_projectile_interaction(packet,target,event,ctx)` | **부분** | 플레이어 탄 벽 반사·적 접촉은 pass 안에서 같은 `packet_id` 영수증(단독 재실행 거절). 적 carrier `q_release`는 기존 `reflect_native_q_source_projectile` 위임(gbBean/blackBean), DEMO11-35 carrier Q·E 물리 패링·플레이어 접촉 피해는 NOT_READY(실제 owner 미이식) |
| 09 | `register_native_enemy_death_effect(profile,consumer,ctx)` | **완료** | 42784/42792/42817 위치 동기 consumer, 같은 RNG provider로 interleave. 필수 consumer 부재 시 첫 쓰기·RNG 전 NOT_READY. 최종 died/PCI-11보다 앞 |
| 07 web 둔화 / 08 덫 접촉 순서 | — | **미구현** | 아래 §6 설계만 |

## 2. 변경 파일

| 파일 | 줄 수 | 기존 줄 수정 |
|---|---|---|
| `godot/scripts/native_combat_pack_b.gd` (신규) | 586 | — |
| `godot/scripts/native_player_arrow_carrier.gd` (신규) | 325 | — |
| `godot/scripts/native_bound_enemy_hurte_owner.gd` (신규) | 117 | — |
| `godot/scripts/native_normal_enemy_hurte.gd` | +130/−5 | **5줄**: 레슨 위임 인자 `opts→source_opts`(비패킷 동일 객체), 타입% `_affix("meleeDmgPct")→_type_damage_affix()`(비패킷 같은 키), 크리 어픽스 식→`_crit_rate_affix_id()`(비패킷 같은 식), `_lClubKB` 읽기·KB 조건에 `_packet_mode`(비패킷 동일). 회귀 p1002e/f/g·kiSlash·근접 전부 0실패로 동작 동일 근거 |
| `godot/scripts/main.gd` | +29/−0 | 0 (preload·필드·설치 1줄·공개 API 7개) |
| `godot/scripts/type3_native_binding.gd` | +51/−0 | 0 (owner 메서드 10개·`data`) |
| 테스트 | `godot/tests/test_pc_combat_pack_b.gd`(신규), `godot/tests/pc_combat_pack_b_source_oracle.cjs`(신규) | — |
| 문서 | 계약(신규)·이 보고서·CHANGELOG_SYNC 최상단·`2_2 무기+활+속성시스템`·`FDG_GODOT_TYPE3_BINDING`·`FDG_P1_002E_MELEE_HURTE_TRACE` 절 추가 | — |

**동작 변화(명시)**: type3가 owner 메서드를 가지게 되어 Player 근접·검기도 type3를 hurtE로 보낸다 — bind 전 type3는 hurtE 0행 정지(쓰기 0). 현재 main에 type3 자동 World 등록 경로는 없다(test_native_world_phases·type7 회귀 영향 없음).

## 3. 원본 대조 (Node VM oracle)

`pc_combat_pack_b_source_oracle.cjs`가 game.html 원문을 그대로 실행한다: hurtE G42110–43119, pProjs 블록 G35176–35630, `_mkPProj/_resetPProj/_recyclePProj/_getPProj` G17309–17362, `_hurtFieldMobs` G18733–18756, elMul G14344, `_UNDEAD_ET` G24729, nc/rg1/rg2/_hunterMul/_predBonus. 나머지 식별자는 Proxy `with` 기록 stub. Math.random은 **호출 원본 행(stack trace, lineOffset 정렬)**으로 gameplay/표현을 구분해, Godot이 실제로 뽑은 값을 gameplay 위치에 같은 순서로 공급한다. scenario/out은 UTF-8 파일(artifacts-dir).

| 대조 | 결과 |
|---|---|
| hurtE 비치명(쉴드 흡수) | HP·쉴드·생존·KB0·gameplay RNG 행 순서 `[42316]`·타입/크리 어픽스 읽기 `[rangedDmgPct,projDmgPct,critRateBow]` 일치 |
| hurtE 치명 | HP·생존·킬+1·RNG 행 `[42316,42633,(42635),42729,42730,(42731),42946,43092,43093]`(drop은 원본 rollDrop stub이라 비교 제외) 일치 |
| carrier 킬관통 | 매 틱 x/y/vx/vy/dist(오차<1e-6)·접촉(틱·적·elMul 후 dmg·packet 동일성)·운명 일치 |
| carrier 재활용→재사용 | 첫 화살 적중→`_recyclePProj`, 두 번째 borrow가 같은 패킷·`_pierceRate=50` → 통일 관통 보장 분기 일치 |
| carrier 벽 반사 | 반사 횟수·스텝백/탈출·h/v 반전 후 궤적·운명 일치. oracle isW = 테스트가 넘긴 실제 World 맵 스냅샷(경계·tile=1·prop 타원), 경로 위 점에서 `world.is_world_blocked`와 같음을 별도 단정 |

## 4. 테스트

인자 공통: `--source-game=<wt>/game.html --node-bin=C:/nvm4w/nodejs/node.exe --artifacts-dir=G:/exoduser-wt/_out/pc-combat-b2/<run>-art`, NODE_PATH=G:/exoduser/node_modules(worktree junction 없음). 매 실행 `godot/override.cfg`로 격리 userdir 지정 후 0바이트로 비움(상수 없는 테스트는 `EXODUSER-pc-combat-b-Isolated-20261021`). 신규 스크립트 추가 후 격리 `--import` 1회.

| 테스트 | 단정/실패 | ERROR | 비고 |
|---|---|---|---|
| **test_pc_combat_pack_b**(신규, 실제 Main) | **349/0** | 0 | setup13·pci03_facade21·pci03_lethal15·pci03_refusals8·pci05_kill_pierce40·pci05_recycle_reuse113·pci05_wall88·pci06 6·pci02_type3 35·pci09 9·perf1. 테스트 개입 48건(발사 필드 채움·배치·HP 회복·etype15 강제·풀 비우기) |
| test_contracts | 5 PASS/0 | 0 | |
| test_native_main_source_starter_state (EXODUSER-MainSourceStarter-Isolated-20261014) | 148/0 | 0 | |
| test_native_source_player_regeneration_phase (EXODUSER-SourceRegenPhase-Isolated-20261014) | 88/0 | 0 | |
| test_native_qe_binding | 155/0 | 0 | |
| test_p1002e_melee_hurte / f_dedicated / g_kislash | 93/0 · 357/0 · 220/0 | 0 | 기존 줄 5개 변경의 동작 동일 근거 |
| test_pc_m29_parry | 100/0 | 0 | |
| test_demo11_boss_projectiles / auto / coordinates / draw (EXODUSER-demo11-35-Isolated-20261021) | 29/0 · 14/0 · 4/0 · 6/0 | 0 | |
| test_boss_ch1_bc09_projectiles | 56664/0 | 0 | |
| test_demo11_boss_actor | 164/0 | 0 | base 실행은 161/0(테스트 자체 수치 변동, 이번 변경 경로와 무관) |
| test_type3_native_binding | 실패 0 | 0 | |
| test_enemy_mod_m29 | 143 PASS | 0 | |
| test_native_auto_bow_spec (w01) | 361/0 | 0 | 이름에 bow/xbow/beam/w01이 들어간 기존 테스트는 이것뿐 |
| test_native_world_phases | 실패 0 | 0 | type3 World 등록 경로 영향 확인 |
| test_native_type7_runtime | **실패 2** | 0 | base(c06184592)와 같은 2실패(`exact_source_actual_assembly`) — 회귀 아님(Mac type7-fix 교정 예정) |

의도된 거부(신규 테스트 안): normalBow 패킷 explode 활성 REJECTED, beam NOT_READY, 비패킷 `{foo}` 기존 엄격 게이트 REJECTED, token 누락, 비정수 dmg, 불 원소 석궁 REJECTED, 미bind type3 REJECTED(직접 실행자는 0행 정지), 이중 bind, 필수 consumer 부재 NOT_READY, 중복 consumer, 알 수 없는 profile, 플레이어 패킷 단독 상호작용, 적 탄 birth 라우팅, 비normalBow kind admit, 외부 owner admit, E 해제 NOT_READY. HP·쉴드·G·World RNG 카운터 무변이 단정 포함. 중복 token 재생은 실행 0(RNG 카운터 불변) 확인.

중간 발견·수정: 첫 회귀에서 Main 부팅 테스트에 "ObjectDB leaked / 2 resources still in use" ERROR가 생김 → carrier↔서비스 RefCounted 순환 참조. carrier가 서비스를 weakref로 들도록 고친 뒤 p1002e/f/g·m29·starter·신규 재실행 ERROR 0. base 실행에서 test_pc_m29_parry 실패는 artifacts 폴더 부재(하니스) 때문이었고 폴더 생성 후 base 100/0.

## 5. 성능

실제 Main 부팅 후 물리 300틱 벽시계(헤드리스, 60Hz 물리, 다른 세션 Godot 2개 동시 실행 중). pass는 테스트가 매 물리 프레임 1회 호출(source sp=1.0 테스트 공급).

| 모드 | 300틱 벽시계 | 틱당 | pass 비용 |
|---|---|---|---|
| idle(탄 0) | 4917.8 ms | 16.39 ms | — |
| normalBow 30발 비행 | 4978.2 ms | **16.59 ms (실시간 유지)** | 활성 pass 37회 평균 2.58 ms·최대 7.31 ms(30발, 접촉 0) |

구성 실측(별도 프로파일, 커밋 안 함): provider 사전 생성 ~0.28 ms, `u_eq` 1회 ~0.49 ms, `is_world_blocked` ~12 µs, `query_native_enemies` ~1.3 µs, 발당 1스텝 ~30 µs. 처음 구현은 발마다 provider·유니크를 읽어 활성 pass 6.5 ms·틱당 22 ms(실시간 미달)였고, 원본 읽기 위치대로 지연 캐시(_uBowPoisonRicochet=첫 접촉, _uBowPierce=관통 판정 때, pass당 1회)로 바꿔 위 수치가 됐다. 접촉이 생기면 hurtE 실행자 비용(호출마다 provider 사전·어픽스 provider)이 더해진다 — 기존 근접 경로와 같은 구조이며 이번에 바꾸지 않았다. 틱 경로 목록 생성 API 0.

## 6. PCI-07 / PCI-08 설계(미구현)

| PCI | 원본 | 설계 |
|---|---|---|
| 07 web | G35083–35084 접촉 시 `P._webSlow=90`(HP 피해 0), G33005/33022 감소·이동×0.5, G16917 web은 Q 패링 불가 | `request_native_player_status(player,"web",source,packet,ctx)`: 적 탄 접촉 owner(PCI-06 `player_contact`) 안에서 호출, 상태 필드는 Player 원본 owner(State P)에 단일 writer로, 감소는 기존 Player source tick. freezeSlow 치환·중첩 합산 금지. 선행: 적 탄 접촉 owner(현재 NOT_READY) |
| 08 trap | G34690–34707 선행 밟기(반경28·!charge, iframe이면 피해 없이 소멸), 피해·KB8·trapSlow=trunc(120×(1−min(.5,slowRes))) → Q/후행 G35085–35088 30틱 stagger | `resolve_native_trap_contact(packet,player,phase,ctx)` phase=`pre_step/q_reflect/post_contact`를 DEMO11-35 registry tick 순서로 호출. 선행: 적 탄 접촉 owner·Player 경직 writer |

## 7. 레슨(L01~L07)

이번 범위 아님. API가 레슨을 막지 않음은 계약 §9: L01/L02는 PCI-06 적 탄 Q/E owner 준비 전까지 NOT_READY 영수증(가짜 성공 없음), 42111 레슨 위임은 패킷 동일성 보존.

## 8. 미확인·HOLD

| 항목 | 상태 |
|---|---|
| 실제 발사 owner(DEMO11-48 INV→최근접→interval→ST)·실제 source sp | Mac 미병합 → 테스트가 `_fireXbow` 필드·sp=1.0을 공급. World 틱 자동 구동 미연결 |
| beam hurtE | NOT_READY |
| 적 탄 Q 마법 블루콩·E 물리 패링·플레이어 접촉 피해(PCI-06 적 탄 쪽) | NOT_READY 영수증만 |
| PCI-07/08 | 미구현(§6 설계) |
| 표현: normalBow 피격음(DEMO11-40 소비자 필터가 weapon/kiSlash만)·bow_hit·G.hitStop(35473)·파티클·트레일 렌더 | 미이식 |
| 불 원소 석궁·터렛/펫 석궁·필드몹 존재 | 쓰기 전 거절 |
| type3 냉기(freeze_hit 42446) | type3 owner 미이식 → 냉기 공격은 그 지점 정지 |
| 실제 etype 8/15/29 actor·Mac consumer | 미구현(테스트는 기존 적에 etype15 강제 + 기록기 consumer) |
| PCI-11과의 순서 | 묶음 A 병합(46b8f7187)에서 해소: PCI-09 profile 사망은 G42733 발행을 prefix 뒤로 미룸. 같은 사망 PCI-09→PCI-11 각 1회 단정(구독 소비자 순서·버스 published +1·저널) 통과. 실제 Mac 소비자 연결은 미확인 |
| 화면 검수 | 화면 요소 추가 0이라 캡처 없음. 실제 플레이에서 화살이 맞고 적이 죽는 화면은 미확인(발사 owner 미병합) |
| 성능 | 헤드리스·다른 Godot 2개 동시 실행 상태 측정. Mac/릴리스 빌드 미측정 |
| 공유 저장소 | 커밋 때 자동 gc가 `G:/exoduser/.git`의 기존 손상 loose object `05194456…`로 실패(이번 커밋 객체는 읽기 확인). 원인 조사·복구는 하지 않음 |

## 9. origin/main 0edeec658(PC 묶음 A) 병합 (merge 46b8f7187)

rebase 없이 merge. 충돌은 `main.gd` 파일 끝(묶음 B 공개 API ↔ 묶음 A PCI-01/10/11/12 블록) 1곳 — 양쪽 보존. hurtE 실행자는 자동 병합 후 PCI-11 발행 순서만 조정(계약 §7). 병합 결과 기준 각 1회(모두 exit0·ERROR 0):

| 테스트 | 결과 |
|---|---|
| test_pc_combat_pack_b | 353/0 (순서 단정 4개 추가) |
| test_pc_player_life / final_death / enemy_revive / recalc_st / pet_portrait_cache | 101/0 · 60/0 · 50/0 · 49/0 · 23/0 |
| test_contracts / starter_state / regen_phase / qe_binding | 5 PASS · 148/0 · 88/0 · 155/0 |
| test_p1002e / f / g · pc_m29_parry · pc_runtime_stat_refresh | 93/0 · 357/0 · 220/0 · 100/0 · 287/0 |
| test_demo11_boss_actor · boss_projectiles / auto / coordinates / draw · bc09 | 163/0 · 29/0 · 14/0 · 4/0 · 6/0 · 56664/0 |
| test_native_auto_bow_spec · p2001b_death_fx · p2001c_kill_rewards | 361/0 · 43/0 · 45/0 |

30발 300틱 벤치(병합 후): 4986ms, 16.62ms/틱(실시간 유지).

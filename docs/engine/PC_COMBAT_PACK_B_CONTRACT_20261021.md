# PC-COMBAT-PACK-B 계약 — normalBow hurtE·신규 actor hurtE owner·실제 탄 carrier·동일 packet·사망 중간 prefix (2026-10-21, PC 전투 핵심)

[PC_INTERFACE_REQUESTS_DEMO11_20261021.md](PC_INTERFACE_REQUESTS_DEMO11_20261021.md)(origin/codex/pc-iface-pack-20261021) §3의 PCI-03·02·05·06·09에 대한 PC 제공물이다. Mac 단위(DEMO11-48 기본 자동 석궁, etype-b/c/e/f 신규 actor, DEMO11-15 레슨)는 이 문서만 보고 연결한다. 요청 문서의 시그니처는 **제안**이었고, 아래가 실제 확정 이름이다.

- 원본(읽기 전용, `game.html` SHA256 `4d911cdd…85e5d4`): `_fireXbow` G28703–28712, `_mkPProj/_resetPProj/_recyclePProj/_getPProj` G17309–17362, pProjs 갱신 블록 G35176–35630, `hurtE` G42110–43119(그중 42266–42283 분류·타입%, 42309–42312 크리 어픽스, 42466 `_isRanged`, 42784/42792/42817 사망 효과), `_hurtFieldMobs` G18733–18756.
- 제품 소유(PC): `godot/scripts/native_combat_pack_b.gd`(서비스, 신규), `native_player_arrow_carrier.gd`(normalBow carrier, 신규), `native_bound_enemy_hurte_owner.gd`(bind 프로토콜 owner 구현, 신규). 공용 파일은 순수 추가 위주: `main.gd`(설치 1줄+공개 API 7개), `type3_native_binding.gd`(owner 메서드 10개·`data`), `native_normal_enemy_hurte.gd`(아래 §7 대응표).

## 1. 얻는 방법

Main `_ready`가 `_install_native_q_control()`·M29 서비스 설치 직후 `native_combat_pack_b = CombatPackBScript.install_native_boot(self)`로 1회 설치한다(실패 시 null, 부팅 계속 — 이때 공개 API는 `REJECTED pc_combat_pack_b_service_not_installed`). 서비스는 틱 처리(`_process`/`_physics_process`)가 없다. **World 틱에 자동 연결하지 않았다** — normalBow pass는 발사 owner(Mac DEMO11-48)가 실제 source sp와 함께 호출한다(현재 `read_current_source_projectile_context`가 sp 미발행이므로 PC가 임의 delta*60 시계를 만들지 않음).

## 2. 공통 영수증·실패 계약

모든 요청은 `ctx.token`(비어 있지 않은 String 또는 int) 필수. 같은 token은 **재집행 없이** 이전 영수증 복사본(`replayed:true`)을 돌려준다(최근 1024개). token 누락은 `REJECTED request_token_missing`(기록 안 함).

| 필드 | 뜻 |
|---|---|
| `status` | `APPLIED`(원본 분기 완료) / `SOURCE_RETURN`(원본 early return: 사망 가드·부활 무적·레슨 위임) / `NOT_REQUIRED`(기존 owner, bind 불필요) / `REJECTED`·`NOT_READY`(**쓰기·RNG 0**, `mutation:"none"`) / `PARTIAL`(원본 분기 도중 정지 — 이미 적용된 prefix 유지, `journal`·`halted_at` 보고) |
| `accepted` | APPLIED·SOURCE_RETURN·NOT_REQUIRED만 true |
| `reason`, `token`, `replayed`, `request`, `schema`(`exoduser.godot.pc-combat-pack-b.v1`) | 공통 |

REJECTED/NOT_READY는 사전 검사 단계에서만 반환한다(owner·옵션·profile·consumer). PARTIAL을 무변이 실패로 위장하지 않으며 되돌리기(롤백)는 하지 않는다 — 기존 hurtE 실행자와 fireball consumer의 규약 그대로다.

## 3. PCI-03 — `request_native_hurte`

```
main.request_native_hurte(actor, damage, angle, no_sound: bool, opts, attack_element, ctx) -> Receipt
```

| 인자 | 계약 |
|---|---|
| `actor` | Main World에 등록된(`get_native_world_identity().has`) 적. 기존 owner(enemy.gd·전용 4종)는 7개 owner 메서드 존재만 확인, bind 프로토콜 actor(type3)는 **live binding 필수**(§4) |
| `damage` | 정수 값(int 또는 정수 float). **elMul을 곱하기 전** 값 — 실행자가 37614/35398처럼 `~~(damage×elMul(atkEl,e.el))`을 먼저 적용(기존 근접 호출과 같은 규약). normalBow는 `p.dmg` 그대로 |
| `angle` | 유한 float. 원본 `ang===undefined` 호출부는 미지원(REJECTED) |
| `opts` | 원본 opts **그대로**. normalBow는 store `Packet.fields` 객체 자체(동일성 보존 — 영수증 `opts_identity_preserved`) |
| `attack_element` | 0..6 int |

반환 추가 필드: `ok, halted_at, profile("normalBow_packet"/"direct_opts"), alive_before, alive_after, applied_fields{dmg_to_hp,hp_before,hp_after,shield_before,shield_after,absorbed,is_crit,stat_crit}, kill_receipt{killed,death_prefix[]}, rng_span, rng_draws[{line,purpose,value}], type_affix_reads, journal`.

normalBow 패킷 profile(`opts.normalBow===true`):

| 원본 | 이식 |
|---|---|
| 42270 `_isArrow = maxDist!==undefined && !magic` | 패킷에 maxDist 필수(없으면 REJECTED `normalbow_packet_maxDist_undefined_unported`) |
| 42276–42277 타입% | 근접 `meleeDmgPct` 대신 `rangedDmgPct+projDmgPct` 합(1회 곱) |
| 42287 `_weakPj` | 패킷 전용 곱(소유 필드 없으면 0) |
| 42312 크리 어픽스 | `critRateMelee` 대신 `critRateBow` |
| 42466 `_isRanged` | 넉백 분기 전체 미진입(`_lClubKB`도 미읽기) |
| 42417 임팩트 | `_isGunpowder`→비마법 → 기존 그대로 출력 |
| 42700 `_isBurnDeath` | atkEl=불(1) 패킷은 쓰기 전 REJECTED(`burn_death_42700_fire_arrow`, 화상 사망 분기 미이식) |
| 이식 안 된 opts 키 | `pure, explode, proj, beam, bladeShard, bladeOrb, maliceHunt, mhBlade, blueBean, ltnChaser, lightning, parryBlueBean, bleed, poison, detonate, _blastKill, _lClubWall, noKB, noStun, magic, dot, iceBlade, poiseHit, _kiFull`가 truthy면 REJECTED(`normalbow_packet_opt_unported:<키>`). **삭제·근접 치환 0** |
| 패킷의 그 밖 키(x,y,vx,…,_hitSet,_trail) | hurtE 본문이 읽지 않으므로 원본과 같이 무영향. `kbMult`의 store `SourceUndefined`는 JS undefined(=1.0) |
| `ghostXbow` | hurtE 미읽기(무영향) |

beam(`opts.beam` truthy)은 **NOT_READY**(쓰기 전): beam 호출부(G33226·34235…)는 elMul을 곱한 float dmg를 넘기고 본문 42295 `_comboBmT`·42700 화상 사망(사운드 RNG)·`_quiet` 분기를 쓴다. 이 실행자 미이식.

비패킷 opts(근접 weapon·kiSlash·DOT·iceOrb 등)는 기존 엄격 게이트(`hurte_opts_unsupported:<키>`)와 기존 분류 그대로다.

## 4. PCI-02 — `bind_native_enemy_hurte_owner`

```
main.bind_native_enemy_hurte_owner(actor, ctx) -> Receipt{owner_kind, owner_token, revision, readback, write_methods}
```

- **bind 때 1회** `has_method`로 계약 검사(목록 생성 API 0): Main World 등록·`is_native_registry_ready()`·alive·아래 메서드 전부. 통과하면 `actor.accept_native_hurte_owner_binding(service, owner_token)` → readback(`read_native_normal_enemy_hurte_fields`)이 ready여야 APPLIED. 이미 bind된 actor는 REJECTED `actor_already_bound`.
- 기존 owner(enemy.gd·flesh_crawler·spine_beast·ice_soul_flame·hive_bloater)는 `NOT_REQUIRED`(자체 owner_current 검사).
- **타격 때는 live identity만**: `service.is_native_hurte_binding_live(actor, token)` = 바인딩 사전 O(1) 조회 + 같은 actor·같은 World 부모·트리 안·`is_same(world.get_native_world_identity(), bind 때 배열)`. 레슨 분리/인트로 정리로 World 적 배열이 교체되면 stale → 거절.
- `release_native_enemy_hurte_owner(actor, owner_token) -> bool`(서비스)로 해제.

**PC hurtE가 field owner에게 요구하는 메서드(확정)** — bind 프로토콜 actor는 아래 10개 + 속성 `data`·`alive`·`state`·`mods`·`etype`·`radius`·`hp`를 가진다(type3_native_binding.gd에 구현됨):

| 메서드 | 원본 | 비고 |
|---|---|---|
| `read_native_normal_enemy_hurte_fields(world) -> Dictionary{ready,...}` | 42112~ | live binding 아니면 `{ready:false}` |
| `apply_native_normal_enemy_field_write(field, value) -> {applied}` | eShield 42347 / alerted 42380 / contact_clamp 42382 / hit_flash 42412 / hit_stun 42414 | `freeze_hit`(42446)은 type3 미이식 → 거절(냉기 공격은 그 지점에서 정지) |
| `apply_native_normal_enemy_bookkeeping(fields)` | 42120·42633 | reviveIframes/_revived/_reviveTimer/_reviveX/_reviveY/_reviveAsGhoul만 |
| `apply_native_normal_enemy_hp_write({field:"hp",value})` | 42383 | |
| `apply_native_normal_enemy_death_write()` | 42702 | receive_damage 사망 블록과 같은 actor 측 효과 |
| `report_native_normal_enemy_hurte_event(kind, payload)` | 42191 등 | telemetry_event |
| `add_native_knockback(Vector2)` | 42472 | `_native.kb += ` |
| `apply_native_normal_enemy_poise_core(int) -> {applied, staggered}` | 42490 `_poiseHit` | 기존 `apply_native_source_poise_core` 재사용 |
| `accept_native_hurte_owner_binding(service, token) -> bool` / `release_native_hurte_owner_binding(service, token) -> bool` | — | 서비스만 호출 |

**동작 변화(명시)**: type3 actor가 owner 메서드를 갖게 되어 Player 근접·검기(`_has_native_hurte_owner_api`)도 type3를 hurtE 경로로 보낸다. **bind 전 type3는 hurtE가 0행에서 정지(쓰기 0, receive_damage 폴백 없음)**. 현재 main에서 type3를 실제 World에 자동 등록하는 경로는 없다(etype-e: 자연 등록 0) — Mac은 `register_summoned_enemy` 직후 bind해야 한다.

## 5. PCI-05 — 실제 탄 carrier (normalBow)

registry = 기존 **World 플레이어 탄 store**(`native_player_projectile_store.gd`, 원본 `pProjs`+`_getPProj` 풀). DEMO11-35 `Demo11BossProjectiles`는 원본 `projs`(적 탄) 대응이므로 플레이어 탄을 넣지 않는다 — 원본도 두 배열이 분리돼 있다. 새 registry 0.

```
main.admit_native_source_projectile(owner, packet, ctx) -> Receipt{packet_id, admission_serial, registry_handle, registry_index, source_owner, profile}
main.advance_native_player_projectile_pass(sp, ctx) -> Receipt{results[], survivors, blocked, source_order}
main.advance_native_source_projectile(handle, sp, ctx) -> Receipt{step_status, packet_id, collision_receipt[], reflect_receipt[], expired, release_receipt, released_once}
```

| 단계 | 계약 |
|---|---|
| 발사(Mac) | `world.borrow_native_player_projectile(main)`로 패킷을 빌려 `_fireXbow` G28712 필드(x=ox+cdx·10, vx=cdx·spec.spd, dmg, el, maxDist=spec.range, dist0, r3, stagger0, kb0, pierce0, pierceMax0, normalBow/ghostXbow true)를 채운다 |
| admit | owner=Main Player만(터렛/펫 석궁 미이식), phase=borrowed, normalBow 사전 검사 통과 → store publish. 적 탄 Dictionary는 `NOT_READY hostile_birth_owner_is_existing_demo11_35_registry`(기존 `_birth_request` 사용) |
| pass | store 배열 순서(35176)로 normalBow만 1스텝, 그 외 패킷은 제자리 유지(기존/향후 owner 소유). 호출자가 **실제 source sp**와 프레임 serial token을 준다. 같은 token 두 번째 호출은 재집행 0 |
| 1스텝(35179–35628) | 트레일6→spd→_bounceCool→이동→`dist>maxDist` 소멸(재활용 없이 drop) / `isW` → `canBounce=dist<maxDist·0.5&&bounces<2` 반사(스텝백·탈출5회·h/v 반전·bounces++·_bounceCool=6) 또는 소멸 → **35279 필드몹(§5a)** → `query_native_enemies(x,y,r+20)` → hitSet 스킵 → `dst<e.r+p.r` → hurtE(§3, 패킷=opts) → 35562 통일 관통(`_pierceRate`: 재활용 패킷은 `_resetPProj`가 50+pierceFlat → 4회 보장 후 확률, RNG 35572) → 35606 패시브 관통(RNG 35608) → 35617 **석궁 킬관통**(처치한 적은 hitSet 후 계속) → 적중 시 `_recyclePProj`(store retire recycle) |
| 사전 거절(쓰기 0) | fireball/burst/explosive/magic/유도/독사/역병/체인/블루콩/터렛/_aoeR/_uqRico/_uqEcho/칼날메아리 활성 패킷, `_uBowPoisonRicochet>0`(35433, 첫 접촉 hurtE 전 확인), 약점 배율 `mult>=2` 경직(35472), **웜/화마귀 실제 접촉 스텝(§5a)**. ~~필드몹 존재~~(2026-10-21 PC-FOLLOWUPS에서 해제 — 존재만으로는 거절하지 않음) |
| 정지 | 접촉 도중 hurtE PARTIAL → 그 패킷 blocked(유지·이후 미처리), pass 나머지는 제자리(이번 pass 중단) |
| 표현(미이식·기록) | 트레일 렌더, 서브파티클 35212, 벽 반사 파티클, 소멸 임팩트 35273, bow_hit 사운드 35454/35624, G.hitStop 35473(소비자 32585 완전 비활성), 관통 텍스트, 히트 파티클 |

단일 handle 호출은 pass가 열려 있지 않을 때만 허용한다(원본은 배열 순서로 일괄 처리 — 여러 발이면 pass를 쓴다).

## 5a. 35279 `_hurtFieldMobs` — 필드보스 지원 범위 (PC-FOLLOWUPS 2026-10-21)

원본 `if(_hurtFieldMobs(p.x,p.y,(p.r||6)+8,p.dmg||p.atk||10,p._hitSet,null)){hit=true;…}`(G35279, 함수 G18733–18756). 이전 묶음 B는 `G._fieldBosses/_fieldBoss/_worms/_fireDevils` 중 하나라도 비어 있지 않으면 **admit와 pass 전체를 쓰기 전에 거절**(`field_mob_owner_unported:<key>`)해서 MAP11(앵글러 4슬롯 상시 존재)에서 기본 자동 석궁 발사가 0이었다. 이제 존재만으로는 거절하지 않는다.

| 원본 | 이식(소유) |
|---|---|
| G18734 `fbs=G._fieldBosses\|\|(G._fieldBoss?[G._fieldBoss]:[])` | pass당 1회 `read_env(g)` — 현재 G 배열 참조(복사 0), null/사망 슬롯 제외 후보 |
| G18629 `_fmCanHit(fb,1)`: `hp>0 && (!hid\|\|tpT>0\|\|emT>0)` / G18628 `_fmXY`: `tpT>0`이면 (tpX,tpY) | `native_field_mob_hit_owner.gd` `can_hit_fb`/`fb_xy` (같은 식) |
| G18738 `dst<hitR+(fb.r\|\|120) && !hitSet.has(fb)` → `hitSet.add(fb)` | hitSet 키 = 같은 record를 그리는 family actor 노드의 Godot instance id(fireball 계약 `hit_set_key_kind=godot_instance_id`). **hitCd 거절보다 먼저** 기록 |
| G18700 `if(hitCd>0)return false` | 피해 0·n 미증가 → 화살은 hit=false로 계속 비행(원본 그대로 관통처럼 지나감) |
| G18701–18702 `dmg=max(1,~~dmg); hp-=dmg; hitCd=8` | 피해 = `max(1, ToInt32(p.dmg\|\|p.atk\|\|10))`(elMul·hurtE 없음 — 원본도 _fmApply만). `hitCd=8`은 PC가 같은 record에 기록. **HP는 Mac family 기존 seam** `bind_pc_source(owner,&"field_boss_health")` 신호 `(index, hp, final_death, serial)`로 반영(family `_pc_readback`이 `fb.hp=hp`) |
| G18706 `hp<=0` → G18677 `_fmDeathFx`: `_deathFxDone` 가드·기록, 고어 롤 Math.random 3회(18692 common/rare, 18693 index, 18694 isFb 추가) | hurtE 42729–42731과 같은 gameplay RNG provider·원본 순서로 3회 소비, `_deathFxDone=true` 기록. 시각(deathFX/시체/고어 조각/임팩트/shake/flash)·`showPH('필드보스 처치!')`는 **표현 미이식**(영수증 `presentation`) |
| G18708 → G61036 `_fbMarkDead`: `alive=false`, 슬롯 null, `_fieldBoss` 해제, 생존 0이면 `_fbDone=true` | family readback(final_death=true, **hp=0**)이 그대로 수행. family는 hp<0을 받지 않으므로 최종 사망은 hp=0으로 보고 — 원본의 음수 hp는 슬롯이 즉시 null이 되어 이후 관측되지 않는다(일치 범위 밖: 사망 record의 hp 값만 0 vs 음수) |
| 반환 n>0 → `hit=true` | carrier `hit=true`로 적 루프 시작. 이어지는 적 접촉의 관통 분기(35571/35572/35608/35617 `hit=false;continue`)가 원본처럼 hit을 다시 끈다(같은 스텝 필드보스 적중 + 일반 적 킬관통 → 화살 계속 비행) |
| G18744 웜 `_worms` / G18751 화마귀 `_fireDevils` | **NOT_READY 유지(접촉 시에만)**: 실제 접촉이 성립하는 스텝은 쓰기 전에 `REFUSED field_mob_owner_unported:_worms\|_fireDevils`. 이유: 두 family의 PC hit seam(`bind_hit_owner`/`apply_hit`)은 있으나 제품 PC 연결 owner·hitSet 키 계약이 아직 없음(MAP11에는 두 family가 배치되지 않음). 존재만으로는 거절하지 않는다 |
| `_fieldBosses` 없이 `_fieldBoss` 단독 | 접촉 시 `REFUSED field_mob_owner_unported:_fieldBoss_singleton_without_slots`(family readback이 4슬롯 배열 전제) |

- 영수증: pass/advance 결과에 `field_mob_receipt[]`(line 35279, index, key, hp_before/hp_after, dmg, outcome `hit_18702`/`hitcd_reject_18700`/`final_death_18706`, serial, rng_draws, fbDone_after, presentation). `collision_receipt`(hurtE 적 접촉)와 분리 — Mac `native_demo11_auto_crossbow.gd`의 hits/kills 집계는 hurtE 적 접촉만 센다.
- 바인딩: PC owner 노드 `PCFieldMobHitOwner`(Main 자식)는 필드몹 목록이 처음 보이는 pass에서 생성, family seam 바인딩은 **첫 실제 필드보스 접촉 때 1회**(lazy). 다른 owner가 seam을 이미 잡았으면 그 접촉은 쓰기 전에 `REFUSED field_boss_pc_source_bind_refused`/`field_boss_pc_source_bound_to_other_owner`. 쓰기 전 확인: family 설치·같은 G·`stage==0`·`!_bossArena`·`_fieldBosses` 배열.
- 정지: readback 불일치(family 가드가 신호를 무시) → `PARTIAL field_boss_family_readback_not_applied:index<i>`(hitSet·hitCd 쓰기 prefix 유지, 롤백 없음). RNG provider 미준비 → `PARTIAL rand_not_ready:fm_gore_*`.
- 웜/화마귀·단독 필드보스 접촉 거절은 스텝 이동(35206) 뒤 접촉 시점에서 일어난다 — 기존 약점 배율 거절(35472)과 같은 규약(이동 prefix 유지, 그 패킷은 blocked).
- 틱 경로 비용(헤드리스 GDScript 실측): 스텝당 scan ≈ 6 µs(4슬롯·접촉 없음), pass당 env ≈ 2.5 µs. 목록 생성 API 0.

## 6. PCI-06 — `resolve_native_projectile_interaction`

```
main.resolve_native_projectile_interaction(packet, target, event{kind,...}, ctx) -> Receipt{packet_id, parry_class, friendly, delegate?, delegate_receipt?, reflected?}
```

| packet / kind | 처리 |
|---|---|
| 플레이어 store 패킷 / `wall_reflect`·`enemy_contact`·`enemy_reflect` | REJECTED `player_packet_interactions_resolved_inside_source_pass` — 원본은 pProjs pass 안에서만 발생(단독 재실행=중복 집행). pass 영수증의 `reflect_receipt`·`collision_receipt`가 같은 `packet_id`로 기록된다(벽 반사는 같은 Packet.fields의 vx/vy를 반전, 동일성 유지) |
| 적 carrier / `q_release` | DEMO11-35 carrier(raw.parryClass 보유)는 NOT_READY `demo11_35_carrier_q_release_unported:<class>:G35043-35063`. 그 밖 실제 Q carrier는 **기존** `Main.reflect_native_q_source_projectile(carrier, distance)`에 그대로 위임(gbBean/blackBean만 채택, 그 외 kind는 그 함수의 거절 사유) |
| 적 carrier / `e_release` | NOT_READY `source_e_release_physical_parry_unported:G38460/38470` |
| 적 carrier / `player_contact` | NOT_READY `source_hurtProjectilePlayer_contact_unported:G35066-35088` |
| 적 carrier / `enemy_reflect`·`wall_reflect` | NOT_READY |

물리탄·다종 마법탄을 gbBean 전용 반사로 뭉개지 않는다(위임은 기존 owner의 채택 범위 그대로).

## 7. PCI-09 — 사망 중간 prefix consumer

```
main.register_native_enemy_death_effect(profile, consumer: Callable, ctx) -> Receipt{profile, source_lines, registration_revision, position}
service.unregister_native_enemy_death_effect(profile, consumer) -> bool
consumer.call(prefix_context) -> Dictionary{applied: bool, ...}
```

| profile | 원본 위치 | 대상 |
|---|---|---|
| `etype8_death_explosion` | G42784–42790 (반경50 hurtE/hurtP 폭발) | etype 8 |
| `etype15_death_split` | G42792–42800 (2자식 mkEn, `_splitDone` 아닌 경우) | etype 15 |
| `etype29_death_shots` | G42817–42824 (8탄, black U<.5 / red U>=.5 = 50/50) | etype 29 |

- profile당 단일 owner(살아 있는 consumer가 있으면 REJECTED).
- **필수 consumer가 없으면** 해당 etype에 대한 hurtE는 42112 생존 가드 직후, **첫 쓰기·RNG 전**에 NOT_READY `death_prefix_consumer_not_ready:<profile>`(치명 여부를 RNG 전에 알 수 없으므로 비치명 타격도 막힌다 — 원자성 우선의 의도된 보수 선택).
- 호출 위치: 처치 파이프라인에서 42702 사망 확정·킬 카운트·고어(42729–42731)·킬 체인(42756)·M26 스캔(42764) **뒤**, 42946 속성 사망 장판·43092 물약·rollDrop·addExp **앞**. 최종 died/PCI-11 신호보다 앞이다. **묶음 A(0edeec658) 병합 후 순서**: 묶음 A의 PCI-11 발행 앵커는 G42733(42732 사망 FX 꼬리 직후)이다. PCI-09 profile 사망(etype 8/15/29, 15는 `_splitDone` 아님)은 그 발행을 미뤄 prefix dispatch 직후 단회 발행한다(prefix 성공·정지 모두, 42733~42824 사이 다른 정지도 `execute`에서 단회 flush) → 같은 사망에서 **PCI-09 → PCI-11 각 1회**. 저널에는 42733 `final_death_deferred_after_pci09` 다음 `death_prefix:<profile>` 다음 `final_death_published`. prefix 없는 사망은 묶음 A 앵커 그대로(test_pc_final_death S3 순서 유지).
- `prefix_context`: `{profile, source_lines, death_prefix_token, actor, etype, x, y, r, el, lv, kill_ang, dmg, rand: Callable()->float|null, hurt_enemy: Callable(=request_native_hurte), main, world}`. `rand`는 hurtE와 같은 provider이며 draw가 실행자 `rng_draws`에 원본 행(42794/42818)으로 기록된다 → 원본 RNG interleave 보존. 중첩 hurtE(폭발)는 `hurt_enemy`로 호출(깊이 16 제한).
- consumer가 `applied:false`를 돌려주면 그 위치에서 PARTIAL 정지(앞선 prefix 유지). Marker child 예약은 Mac 공통 owner가 consumer 안에서 수행한다.

## 8. 기존 줄 변경 대응표 (native_normal_enemy_hurte.gd)

| 위치 | 변경 | 비패킷 동작 동일 근거 |
|---|---|---|
| execute 진입 옵션 게이트 | 패킷 판정·view 투영 추가, 기존 for 루프에 `if _packet_mode: break` 1줄 | 비패킷은 `_packet_mode=false` → 기존 루프 그대로. 회귀 p1002e/f/g + 신규 `legacy_strict_opts_gate_unchanged` |
| `source_label` | 다음 줄에 패킷이면 "normalBow" | 비패킷 불변 |
| 42111 레슨 위임 인자 | `opts` → `source_opts` | 비패킷은 `source_opts`가 같은 객체 |
| 42112 뒤 | PCI-09 진입 게이트 추가 | etype 8/15/29 외 required=false |
| 42276 타입% | `_affix("meleeDmgPct")` → `_type_damage_affix()` | 비패킷은 같은 키 1회 읽기 |
| 42287 | `_weakPj` 패킷 전용 추가 | 비패킷 미진입 |
| 42311 크리 어픽스 | 식 → `_crit_rate_affix_id(is_magic)` | 비패킷은 같은 식 |
| 42472 넉백 | `_lClubKB` 읽기·KB 조건에 `_packet_mode` 추가 | 비패킷 동일 |
| `_affix` | 타입/크리 어픽스 id 관측 기록 1줄 | 반환 불변 |
| 42769 뒤 | PCI-09 dispatch 추가 | 해당 etype만 |

## 9. 레슨(L01~L07) 소비자와의 관계

이번 범위에서 레슨 소비자는 구현하지 않았다. 위 API는 레슨 step1·2를 막지 않는다: step1(E 물리 반사 처치)·step2(Q 마법탄 3발)는 PCI-06의 적 carrier `q_release`/`e_release`가 실제 owner를 갖춰야 하므로 현재 **NOT_READY 영수증을 그대로 받는다**(가짜 성공 없음). 레슨 탄이 hurtE에 닿는 42111 위임은 기존 경로를 유지하며, 패킷 opts는 동일성 보존(`source_opts`)으로 넘어가 레슨이 같은 packet을 관측한다. 처치 증인(L01)은 `request_native_hurte` 영수증의 `kill_receipt`를 쓴다.

## 10. 금지 준수

- `docs/2_3 돌진+패링+방패시스템/` 변경 0. Q/E 판정·피해 수식·세이브 형식 변경 0. `CombatQEProducer.is_parry_window` 미변경.
- 틱 경로 `get_method_list/get_property_list/get_signal_list` 0 (bind 때 `has_method`만).
- 새 경쟁 registry 0, 피해 수식 복제 0(hurtE 실행자 단일 owner), 테스트 기록기를 제품 경로에 넣지 않음.

## 11. 미이식·HOLD

| 항목 | 상태 |
|---|---|
| beam hurtE | NOT_READY (§3) |
| PCI-06 적 탄 Q 마법 블루콩 전환·E 물리 패링·플레이어 접촉 피해 | NOT_READY 영수증만(실제 owner 미구현) |
| PCI-07 web 둔화 / PCI-08 덫 접촉 순서 | **미구현** — 설계만 보고서에 기록 |
| normalBow 피격음·bow_hit·hitStop·파티클 | 표현 미이식(§5). 42191 피격음 이벤트는 source `normalBow`로 나가지만 기존 DEMO11-40 소비자 필터(`weapon`/`kiSlash`)가 재생하지 않는다 |
| 불 원소 석궁 | 쓰기 전 REJECTED (§3) |
| 필드몹 — 필드보스(앵글러) | **지원**(§5a, PC-FOLLOWUPS). 표현(데미지 숫자·처치 연출·showPH)만 미이식 |
| 필드몹 — 웜/화마귀·`_fieldBoss` 단독 | 실제 접촉 스텝만 REFUSED(§5a). 제품 PC hit owner 연결 필요 |
| 터렛/펫 석궁(_gxFiring/G.pets.xbow) | admit REJECTED |
| World 틱 자동 구동 | 미연결(실제 source sp 미발행). fireball consumer와 같은 pass 통합은 fireball 의존성 준비 시 단일 pass로 병합 필요 |

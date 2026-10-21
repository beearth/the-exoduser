# PC 생명주기·최종 처치·시체 부활·recalcSt·펫 초상 계약 (2026-10-21, PC-LIFE-PACK)

Mac 담당(DEMO11-39 사망/부활 화면, DEMO11-37 clear/gate, B9 주술사, DEMO11-29 재련, perf aaf52dc0)이 **이 문서만 보고 연결**할 수 있도록 PC 공개 API를 고정한다. 브랜치 `claude/pc-life-pack-20261021`. 요청 원문: `codex/pc-iface-pack-20261021:docs/engine/PC_INTERFACE_REQUESTS_DEMO11_20261021.md` §3. 원본 행(G)은 `game.html` 65,692행 sha256 `4d911cdd…e5d4` 기준이다.

공통 원칙(기존 [PC_RUNTIME_STAT_REFRESH_CONTRACT](PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md)와 같은 방식):
- 모든 API는 **이벤트 호출 전용**이다. 틱 경로에 새 코드 0, `get_method_list/get_property_list/get_signal_list` 호출 0.
- 실패(`REJECTED`/`NOT_READY`/`FAILED`)는 해당 요청의 actor·자원·P·레지스트리·이벤트·RNG를 바꾸지 않는다. `SOURCE_RETURN`은 원본이 허용한 정상 조기 종료(쓰기 0 또는 원본 prefix만)다.
- 같은 `request_id`를 다시 보내면 재실행 없이 이전 성공 영수증을 `replayed:true`로 돌려준다(거절/실패는 무변이라 보관하지 않고 다시 판정한다).
- 처리 중(시그널 콜백 안) 재호출은 `*_reentrant`로 거부된다.
- PC는 RNG를 소비하지 않는다(모든 영수증 `rng_span.consumed=0`). 원본 Math.random 지점(사망음 샘플·부활 roll·시각 FX)은 Mac 소유로 남는다.

## PCI 대응표

| 요청 | 실제 API (main.gd) | 구현 파일 | 상태 |
|---|---|---|---|
| PCI-01 | `request_native_player_life_transition(request) -> Dictionary`, `read_native_player_life_phase() -> Dictionary`, signal `native_player_life_phase_changed(snapshot)` | `scripts/native_source_player_life.gd` + sink(player/state/authority 끝에 추가) | 완료(6 op). u_d21 재점화 분노 쓰기만 NOT_READY |
| PCI-11 | `subscribe_native_final_enemy_death(consumer, ctx)`, `unsubscribe_native_final_enemy_death(id)`, signal `native_enemy_final_death(actor, stage_index)`, `read_native_final_enemy_death_snapshot()` | `scripts/native_final_enemy_death.gd` + hurtE `_kill_pipeline` G42733 발행 1곳 | 일반 적 hurtE 처치 완료. **보스(ib) NOT_READY** — 아래 §2.4 |
| PCI-10 | `request_native_enemy_revive(caster, ctx) -> Dictionary` | `scripts/native_enemy_corpse_revive.gd` + actor writer `apply_native_enemy_corpse_revive(world)` | 완료(generic·전용 4종+type7). 그 밖 actor는 NOT_READY |
| PCI-12 | `request_native_recalc_st(owner, ctx) -> Dictionary` (= 기존 refresh owner의 `"recalc_st"` 모드) | `scripts/native_source_player_runtime_stat_refresh.gd` 모드 추가 | 완료 |
| PCI-13 | 외부 호출 불필요. `NativePets.prepare_native_pet_portrait(who)`, `get_native_pet_portrait_cache_snapshot()` | `scripts/native_pets.gd` | 완료 |

## 1. PCI-01 플레이어 생명주기

### 1.1 토큰 발급(PC)

부팅 때 Main이 `source_player_life`를 1회 구성하고 Player `telemetry_event`에 연결한다(틱 0). 기존 `player.gd`의 HP0 블록(직접 피해 `_apply_native_damage`, 화상 `_receive_native_burn_damage`: `state="dead"` + `player_died`)은 **수정하지 않았다**.

| 이벤트 | PC 동작 |
|---|---|
| `player_damage` (hp==0) | 그 시점의 `player.state`(hurtP가 남긴 stagger/pStun/idle…)를 원본 die() 시점의 `P.s`로 보관 — HP0 블록이 `dead`를 쓰기 **전**에 발생하는 기존 순서를 이용 |
| `player_died` (phase alive) | `death_token = "pdeath:<Main id>:<serial>"` 발급, phase `hp0` |
| `player_died` (phase ≠ alive) | 중복 — 새 토큰 0, 무변이(`duplicate_hp0` 카운트) |

### 1.2 요청

```gdscript
var r: Dictionary = main.request_native_player_life_transition({
	"op": "fallen_enter",            # 아래 표
	"request_id": "demo11-39:<고유>", # 필수, 단회
	"player": main.player,           # 실제 Player identity(다르면 player_life_foreign_actor)
	"death_token": main.read_native_player_life_phase().death_token,
	# op별 추가: "roll_receipt" / "step"
})
```

| op | 허용 phase | 원본 | PC 쓰기(이것만) | 결과 phase |
|---|---|---|---|---|
| `revive_once` | hp0 | G43727 | P._reviveOnceUsed=true · hp=mhp · mp=mmp · st=mst · iframes=120 · state=보관한 die() 직전 상태(원본은 P.s 유지) | alive(토큰 폐기) |
| `fallen_enter` | hp0 | G43729·43731·43732 | hp=0 · state='fallen' · iframes=9999 · P._fallenAng=facing+π | fallen |
| `revive_resolve` | fallen | G43849–43854 | P._demonRevCd=roll.cd_frames · hp=mhp · mp=mmp · st=mst · state='idle' · st2(_state_left)=0 · iframes=120. **shield 불충전** | alive(토큰 폐기) |
| `final_death` | fallen | G43870 | state='dead' · iframes=0 | dead |
| `respawn` step `exp_loss` | dead | G63476–63477 | P.exp=max(0, exp−~~(exp×0.3)) | respawning |
| `respawn` step `reset` | respawning | G63521 → G63525 → G63526(G63453–63455) | ①hp=mhp·st=mst·mp=mmp·shield=mshield·state='idle'·iframes=300·kb=0 → ②기존 `request_native_runtime_stat_refresh("apply_stats")` → ③hp/mp/st/shield 최대치 재충전 + 화상 스택·빙결 둔화 해제 | alive(토큰 폐기) |
| `lobby_prepare` | hp≤0이면 토큰 필수(모든 비-alive phase) / hp>0이면 SOURCE_RETURN | G63678 | hp=mhp·st=mst·mp=mmp·shield=mshield·state='idle'(iframes 미변경 — 원본 그대로) | lobby(종료, 이후 모든 op 거부) |

순서 규칙:
- **reviveOnce 우선**: `_eqAffix('reviveOnce')>0 && !P._reviveOnceUsed`이면 `fallen_enter`는 `revive_once_priority:G43727`로 거부된다. 반대로 미보유/사용됨이면 `revive_once`는 `revive_once_not_eligible`.
- `roll_receipt = {can_revive:bool, roll:number, chance:number, cd_frames:number}`는 **Mac이 사망 순간(G43738–43751) 계산·저장한 값**을 그대로 넘긴다. PC는 `can_revive && roll < chance`만 검사한다: 성공이면 `revive_resolve`만, 실패면 `final_death`만 허용(반대 op는 `revive_roll_success_requires_revive_resolve` / `revive_roll_not_success`).
- `respawn`은 원본처럼 EXP 손실 → (Mac: 보스방 복원/initStage, G63478–63520) → reset 순서다. reset 전에 exp_loss가 없으면 `respawn_reset_requires_exp_loss_first`.
- reset 중 applyStats가 실패하면 ①의 쓰기를 되돌리고 `FAILED`(phase는 respawning 유지, 같은 토큰으로 재시도 가능).

### 1.3 반환

`{schema, op, token(request_id), status: APPLIED|SOURCE_RETURN|REJECTED|NOT_READY|FAILED, accepted, reason, death_token, life_phase, before, after, applied_fields{player,resources,p}, source_prefix[], mac_followups[], presentation[], rng_span, replayed, state, hp, mp, st, iframes}`. reset은 `apply_stats{status,reason,pass_serial}`와 `applied_fields{reset,refill}`. `before/after`는 `hp mhp st mst mp mmp shield mshield exp iframes state _reviveOnceUsed _demonRevCd _fallenAng` 실제 readback이다.

### 1.4 읽기 전용 `read_native_player_life_phase()`

`{phase: alive|hp0|fallen|dead|respawning|lobby, death_token, clear_blocked (phase≠alive), pre_death_state, fallen_countdown_ticks:300, countdown_owner, roll_owner, readback{...}, token_serial, accepted, rejected, duplicate_hp0, tick_path:false}`. 쓰기 0.

### 1.5 Mac 소유(PC가 하지 않는 것)

fallen 300 countdown(`P.st2`, G43729·G32989–32992, source-sp, 정지 중 0) · 사망 순간 확률/쿨다운/roll(G43738–43751, Math.random) · 사망음/보이스/텍스트/슬로모/shake/파티클 · `G._sStats.deaths`, `G.on`, 탄·장판 배열 정리, BGM, HUD, 사망 화면, `_ddDeaths` · `_resetInteractInput`(G43869·G63472) · 보스방 복원/initStage · `G._bonfire` · 저장(dbSave)·로비 이동. 각 영수증 `mac_followups`에 원본 행이 들어 있다.

### 1.6 금지

- 임의 iframe setter 없음: Player sink는 iframes ∈ {0, 120, 300, 9999}만, 그리고 등록된 life 모듈의 동기 commit 창 안에서만 수락한다(`player_life_not_in_commit_window`).
- sink 3종(`Player.commit_native_player_life`, `Authority.commit_native_player_life_resources`, `State.commit_native_player_life_p`)을 직접 호출하지 않는다.
- 저장 형식 변경 0. 새 P 필드(`_reviveOnceUsed`, `_demonRevCd`, `_fallenAng`)는 원본 P에 있던 이름 그대로다.

### 1.7 미이식/HOLD

| 항목 | 상태 |
|---|---|
| u_d21 `_uDemonRekindle` 재점화(G43860–43861, P.rage) | 값>0이면 `revive_resolve`가 쓰기 전 `NOT_READY:unported_branch_active:_uDemonRekindle_rage_writer`. 분노 writer PC 미연결 |
| die() 첫 3줄 ultUnmute/_esAutoFire/_alActive(G43722–43724) | Godot 미이식 상태라 쓰기 0 |
| chargeStocks/chargeCd(G63522)·maxChargeStocks/_HARP_GAUGE(G63456–63462)·poison/bleed/_webSlow/_trapSlowT(G63455) | Godot Player에 대응 필드 없음 — 쓰기 0, `mac_followups` 표기 |
| 기존 HP0 블록의 `charge_frames=0`/입력 해제 | 원본 die() reviveOnce 경로에는 없지만 기존 Godot terminal 코드가 토큰 발급 전에 이미 수행(수정 금지 범위) |

### 1.8 연결 예 (DEMO11-39)

```gdscript
main.native_player_life_phase_changed.connect(func(s):
	if s.phase == "hp0":
		var t: String = s.death_token
		var once := main.request_native_player_life_transition({"op":"revive_once","request_id":t+":once","player":main.player,"death_token":t})
		if once.status != "APPLIED":
			# Mac: 원본 G43738–43751 확률/roll 계산·저장, 300 countdown 시작
			main.request_native_player_life_transition({"op":"fallen_enter","request_id":t+":fallen","player":main.player,"death_token":t}))
# countdown 0 (Mac clock):
var op := "revive_resolve" if roll.can_revive and roll.roll < roll.chance else "final_death"
main.request_native_player_life_transition({"op":op,"request_id":t+":resolve","player":main.player,"death_token":t,"roll_receipt":roll})
# retry 버튼: exp_loss → (stage 재구성) → reset → dbSave
```

## 2. PCI-11 최종 처치 인계

### 2.1 구독

```gdscript
var r := main.subscribe_native_final_enemy_death(Callable(self, "_on_enemy_death"), {"subscriber": self, "events": ["final_death","revival_pending","cancel"]})
# r = {status:"READY", accepted, subscription_id:"fdsub:N", events, coverage, revision}
```
- `subscriber`는 Main 자신 또는 Main 자손 Node(필수). 무효 Callable·외부 subscriber·모르는 event·같은 consumer 중복·전달 중 구독은 무변이 REJECTED.
- `events` 생략 시 3종 전부.
- DEMO11-37 `bind_final_death_source(owner, event)` 호환: `bind_final_death_source(main, &"native_enemy_final_death")` — 이 시그널은 **final_death만**, 인자 `(actor, stage_index)`.

### 2.2 발행 지점과 payload

발행은 실제 hurtE 처치 파이프라인(`native_normal_enemy_hurte._kill_pipeline`)의 **G42733 앵커 한 곳**: 42702 사망 확정·kills·_stageKills·_regKill, 42704–42732 사망 FX/콤보/고어 롤 **뒤**, 42734–42744 보스 사망 문구·문지기 해방 **앞**, 42756 킬 체인 앞. 발행은 관찰 전용이라 실패해도 처치 prefix·나머지 파이프라인(드랍/EXP)을 바꾸지 않는다. 구독자는 같은 호출 스택에서 동기로 받는다(중첩 발행은 FIFO 단회 전달).

```
{event: "final_death"|"revival_pending"|"cancel", actor: Node, death_token: "edeath:<Main>:<n>",
 life_phase: "final"|"revival_pending"|"canceled", stage: int(G.stage),
 provider_revision: {bus_revision, main, world, registry_index},
 kill_receipt: {line:42702, kills, stage_kills, reg_kill_applied, dmg, ang, atk_el, executor},
 gate_guard: {is_gate_guard, ib, source_lines:"G42734-42744", effects_owner:"Mac37/P3-003", applied_by_pc:false},
 player_life: {phase, death_token, clear_blocked}, source_anchor:"G42733"}
```
- `revival_pending`: 이번 사망이 G42633 일반몹 부활(`_revived`)을 예약함. 원본은 G34497~ `_reviveTimer` 만료 때 되살린다 — **Godot 재스폰은 미이식**이라 토큰이 열린 채 남는다.
- `cancel`: 열린 토큰의 actor가 PCI-10으로 다시 살아남. `{event:"cancel", death_token, canceled_phase, reason:"corpse_revived:G38949"}`.
- 같은 actor의 final 중복 발행·살아 있는 actor 발행은 거절(이벤트 0).
- **clear 차단 신호**: `player_life.clear_blocked == true`(플레이어 hp0/fallen/dead/respawning)인 동안 Mac37은 clear·보상 commit을 보류하고 토큰을 보존한다. `native_player_life_phase_changed`에서 phase가 `alive`로 돌아오면(revive_once/revive_resolve/respawn) 보존한 토큰을 같은 actor/stage/provider로 확인 후 1회 재개, `final_death`→retry/lobby면 폐기. 이 재개·폐기 규칙은 Mac37 소유이며 PC는 신호만 낸다.

### 2.3 PC가 하지 않는 것

Main37 clear sink 복제 0, `_gateGuardKilled`·`bossGateOpen`·`_bossUnlocked`·랭크·보상 쓰기 0(G 상태 쓰기 0).

### 2.4 커버리지(구독 영수증 `coverage`)

| 경로 | 상태 |
|---|---|
| 일반 적 hurtE 처치(generic·전용 4종·type7) | READY |
| 보스(ib) | **NOT_READY** — PC hurtE가 G42124 `unported_branch_active:boss_hurtE`에서 정지. 보스 HP/부활 판정(G42516–42625 1차, G34497–34530 `_reviveTimer` 2차 판정)과 demo boss actor(`native_demo11_boss_actor.gd`: "No damage/parry/HP/poise writer") HP writer가 origin/main에 없다. DEMO11-36/49 브랜치는 원격에서 확인되지 않았다. 이 경로가 들어오면 "부활 실패 → 완전 사망"(G34528) 확정 지점에서 같은 `publish`를 호출하면 된다 |
| `enemy.receive_damage` 레거시 사망 | NOT_READY(원본 hurtE 파이프라인 아님) |
| 일반몹 부활 대기 재스폰 | NOT_READY(G34497~ 미이식) |

## 3. PCI-10 시체 부활

```gdscript
var r := main.request_native_enemy_revive(caster, {"request_id": "b9:<고유>", "revive_cd": caster_revive_cd})
if r.accepted: caster_revive_t = r.next_timer   # 성공: revive_cd, 시체 없음: 60
```
- 호출 시점: caster(etype 9, `state=='idle'`) 자기 tick에서 `reviveT -= sp; reviveT <= 0`일 때(G38945–38947, **Mac B9 소유**). reviveT/reviveCd 필드 쓰기는 caster owner가 `next_timer`로 한다.
- 선택: 실제 world 등록 배열(ens identity) 순서로 `!alive && !_absorbed`(=_deadPool 멤버) 중 첫 `!ib && etype!=9 && dist<150`(G38948).
- 쓰기(같은 노드): alive=true · hp=~~(mhp×0.5) · eShield=0 · eShieldMax=0 · state='recover' · st2=60 · stunned=0 · poise=maxPoise · reviveIframes=0(G38949–38950) + 사망 쓰기가 끈 충돌(layer4/mask1|2)·본체 표시 복원. st2 매핑: flesh_crawler/type7 `st2`, spine·ice_soul_flame `_contact_ticks`, hive_bloater `_state_ticks`(각 기존 recover→idle 전이 타이머), generic enemy.gd는 recover 상태기계가 없어 state 표기+`_hit_stun=60`.
- 반환: `{status, accepted, reason, token, revived, actor, corpse_id, selected_index, pool_revision{registry_size, dead_pool_size, native_frame, pool_source}, before, after, readback, next_timer, applied_fields, source_prefix, presentation, death_cancel, rng_span, replayed}`.
- 실패: caster 미등록/사망 → NOT_READY, etype≠9/idle 아님/revive_cd·request_id 없음 → REJECTED, 첫 후보 actor에 writer가 없으면 NOT_READY(다음 후보로 바꾸지 않음) — 모두 시체·타이머 무변이. 시체 없음 → SOURCE_RETURN `next_timer=60`.
- 표현(G38951–38952 `_reviveVFX`/텍스트/파티클)은 Mac.
- HOLD: 원본 `_deadPool`은 G34391에서 2프레임마다 재구성된 스냅샷이다. PC는 호출 시점에 즉시 평가하므로 직전 ≤1프레임에 죽은 시체가 원본보다 먼저 보일 수 있다.

## 4. PCI-12 recalcSt 단독 writer

```gdscript
var r := main.request_native_recalc_st(main, {"reason": "forge:reroll"})
if r.committed: main.request_native_runtime_stat_refresh("apply_stats", "forge:reroll")  # G51176 뒤 applyStats는 호출자
```
- 순서(G16425–16431): 캐시 3종(`_eqAffixCache`·`_eqStatCache`·`_lEqCache`) 무효화 → 기존 `resource_parameters.run_recalc_st` → **mst/st만** commit. 원문 `P.st=Math.min(P.st,P.mst)` 유지, applyStats·HP/MP/shield clamp 추가 없음.
- owner는 실제 Main 자신(아니면 `runtime_stat_refresh_foreign_owner`). 반환은 기존 refresh 영수증(`mode:"recalc_st"`, `cache_invalidations:1`, `cache_targets`, `committed_fields{actor:[],resources:[mst,st],state:[]}`, before/after).
- 실패(producer NOT_READY 등)는 무변이. 원본 JS 의미는 보존된다: 예) STATS.dex가 문자열이면 원본처럼 `~~NaN=0`으로 READY(테스트 S4b, oracle 일치).
- 재련/빈 슬롯 제작 admission의 비용/RNG 소비 판단은 Mac29 거래 owner가 한다.

## 5. PCI-13 펫 초상 캐시

- `configure` 때 crow/cat 초상을 각 1회 로드해 `_portrait_cache`에 강한 참조로 보관. `_show_bubble`은 캐시만 소비(`ResourceLoader.exists`/`load` 0회). 원본 초상 선택(crow→crow_portrait, 그 외→cat_portrait)·레이아웃·대사·트리거·RNG 변경 0.
- 준비 실패 key는 그 key 캐시·현재 초상 무변이(기존 exists 실패와 같은 관측), 대사 텍스트는 계속.
- 측정(Windows 개발 PC headless): 기존 방식은 TextureRect가 직전 초상 하나만 참조해 **화자가 바뀔 때마다 재로드** — 발화당 17.4~29.5ms(crow→cat→crow→cat→crow). 캐시 후 발화당 15~65µs(첫 cat만 라벨 재배치로 0.4~0.65ms, 1회 4.85ms 잡음 관측). configure 추가 비용 = 두 초상 cold load 합 약 41~45ms(부팅 1회).

## 6. 변경 파일과 기존 줄 수정

순수 추가가 원칙이다. 기존 줄을 바꾼 곳은 아래뿐이다.
- `native_pets.gd` `_show_bubble`의 초상 3줄(exists/load → 캐시 조회), `configure` 끝 2줄 앞 준비 호출.
- `native_source_player_runtime_stat_refresh.gd` `MODES`/`MODE_SOURCE` 상수, `refresh()`의 `_run_apply_stats()` 호출 1줄(모드 분기), `_consume_resource_command` 앞 2줄.
- `native_normal_enemy_hurte.gd` 부활 판정 블록에 지역 변수 2줄, G42732 뒤 발행 블록 추가.
- `main.gd` `_ready` 끝 1줄(`_install_native_player_life()`).
Q/E 판정·패링·hurtP 분기·피해 수식·세이브 형식·docs/2_3 변경 0.

## 7. 회귀 테스트 맵 전제 (PC-FOLLOWUPS 2026-10-21)

MAP11이 데모 1-1 기본 부팅(ON)이 된 뒤 `test_pc_final_death`·`test_pc_enemy_revive`는 기본 부팅에서 대상 적 0으로 실패했다(`S3 at least 2 real hurtE kills (got 0)`, `at least 4 revivable actors booted (got 0)`). 두 테스트는 **부팅 때 배치된 기존 맵 적**(전용 owner 3종+generic)을 Main 처리 정지 장면에서 실제 hurtE로 처치·부활시키는 계약 검사이고, MAP11은 부팅 직후 적이 없다(hole·스케줄러 자연 스폰).

| 테스트 | 조치 | 판정 |
|---|---|---|
| test_pc_final_death | Main 메타 `native_map11="off"`(= `--map11=off`)로 기존 맵 부팅을 테스트 안에서 명시, 부팅 맵 확인 단정 1개 추가 | 기존 단정 그대로(약화 0). 단정 수는 G42633 부활 롤 결과(final/revival_pending 수)에 따라 60~61 |
| test_pc_enemy_revive | 같은 방식 | 기존 단정 그대로 + 부팅 맵 단정 1개 = 51 |

API·계약 자체는 맵과 무관하다. MAP11 기본 ON에서의 실제 처치→PCI-11 경로는 `test_pc_followups_fieldboss.gd`(자동 석궁 자연 적 처치)와 E2E가 관측한다.

extends RefCounted
## PC-M29-PARRY (2026-10-21, PC 전투 핵심) — M29(돌진) 비투사체 접촉 서비스의 실제 제공자.
##
## type3_native_binding.gd 가 M29 actor 구성 때 요구하는 4개 Callable 을 Main 소유 실제 객체로 제공한다.
##   player_context(target)              -> Dictionary  (binding :128/:177, root actor 문맥)
##   handle_m29_parry(actor,target,event)-> bool        (binding :248, 패링 분기 소비)
##   emit_m29_event(actor,event)         -> bool        (binding :250, 경고·충격·폭발음 소비자 라우팅)
##   m29_readiness()                     -> Dictionary  (binding :122/:172, 4개 능력 bool)
##
## 원본(game.html, 읽기 전용):
##   eCharge 접촉       G40531~40535  isPWin→parryBank+=(e.atk||10)→addTxt→doParry(e.atk,e.x,e.y,false,e.el)→_poiseHit(e,20)
##                                    else P.s!=='charge'→hurtP→eModHitP→P.kb+=100 (피해 분기는 binding :242~246 기존 경로)
##   isPWin             G38469        _lParryWinTicks G16622 = min(20, ~~(_PARRY_WIN16*(1+_lEq('_lCapeParry'))))
##   doParry            G38470~38575  기존 PC writer 가 적용하는 부분집합만: hp/st/mp += 보상, iframes=25, poise+1
##                                    (보상식 = Main.native_source_parry_reward, Q 반사·E 파동 반사와 같은 식)
##   _poiseHit          G19972~19983  코어만(type3 actor apply_native_source_poise_core). 연출 꼬리 19984~ 미이식.
##
## 금지 준수: 투사체 facade 합성 0(resolve_native_contact/Q 반사 경로 호출 0), 패링·피해 수식 복제 0,
## modT/eliteBusy/RNG/registry 접근 0(lock→M29→M30 순서는 호출자 소유), 틱 경로 목록 생성 API 0.

const BindingScript = preload("res://scripts/type3_native_binding.gd")
const M29Script = preload("res://scripts/enemy_mod_m29.gd")
const SERVICE_SCHEMA = "exoduser.godot.m29-contact-services.v1"
const CAPABILITIES = ["combat_qe", "warning_fx", "impact_fx", "detonate_sound"]
const FX_CAPABILITIES = ["warning_fx", "impact_fx", "detonate_sound"]
## emit_m29_event 라우팅: 이벤트 kind → 순서대로 호출할 소비자 능력. 빈 배열 = 이 서비스에서 소비자 불필요.
const EVENT_ROUTES = {
	"windup_started": ["warning_fx"], "vfx_spark": ["warning_fx"], "charge_started": ["warning_fx"],
	"vfx_trail": ["warning_fx"], "recover_entered": ["warning_fx"],
	"player_damage": ["impact_fx", "detonate_sound"],
	"player_parry": [], "player_charge_state_immune": []}
## 전체 패링 원천 재검사 주기(World 프레임). 매 프레임은 구조 검사만 한다 — 전체 검사(read_native_q_parry_source)는
## 헤드리스 실측 약 2.8ms 라 틱마다 돌리지 않는다. 패링 처리 시점에는 항상 전체 검사를 다시 한다(fail-closed).
const FULL_CHECK_INTERVAL = 60.0
const SOURCE_PARRY_WIN = 16 # game.html:8670 var _PARRY_WIN=16 (재대입 0건)
const SOURCE_PARRY_WIN_CAP = 20 # G16622 Math.min(20, ...)
const SBASH_TICKS = 20 # G38469 P.st2>(20-_lParryWinTicks())
## doParry 중 기존 writer 가 아직 적용하지 않는 부분(Q 반사 경로 remaining 과 같은 묶음 + 접촉 전용 항목).
## _parryLesson.physicalParry(x,y) 는 레슨 탄 좌표 일치 때만 작동 → 적 접촉 좌표에서는 원본도 무효과(별도 기록).
const DOPARRY_REMAINING = ["pet_on_parry", "parry_stats_counters_pStats_pH",
	"parry_sound_voice_math_random", "hitstop_slowmo_shake_vibrate", "harp_gauge", "rage_and_rage_text",
	"rage_skill_cd_cut", "unique_parry_triggers", "u_d20_shield_bank", "rage_pet_lines", "mats_reward",
	"parry_explosion_affix", "parry_impact_vfx_flash_particles", "parry_text"]

var _main: Node
var _world: Node
var _player: Node
var _busy := false
var _consumers: Dictionary = {}
var _ready_frame := NAN
var _full_check_frame := NAN
var _full_reason := "not_checked"
var _ready_cache: Dictionary = {}
var _last_error := ""
var _last_parry: Dictionary = {}
var _counts = {"context_calls": 0, "context_rejected": 0, "parry_accepted": 0, "parry_rejected": 0,
	"emit_accepted": 0, "emit_rejected": 0, "readiness_calls": 0, "projectile_contact_calls": 0}

## Main 준비 구역(_install_native_q_control 직후)에서 1회 호출. 실패 시 null(부팅은 계속).
static func install_native_boot(main: Node) -> RefCounted:
	var services = new()
	if not services.configure(main): return null
	return services

func configure(main: Node) -> bool:
	if is_instance_valid(_main) or not is_instance_valid(main):
		return _fail("already_configured_or_missing_main")
	var world: Variant = main.get("world")
	var player: Variant = main.get("player")
	if not is_instance_valid(world) or not is_instance_valid(player) or world.get("player") != player \
			or player.get_parent() != main or not player.has_method("get_combat_world") or player.get_combat_world() != world:
		return _fail("actual_main_world_player_not_bound")
	for method in ["read_native_q_parry_source", "commit_native_q_control_state", "native_source_parry_reward", "read_native_source_parry_bank"]:
		if not main.has_method(method): return _fail("missing_actual_main_" + method)
	_main = main
	_world = world
	_player = player
	_last_error = ""
	return true

func _fail(reason: String) -> bool:
	_last_error = reason
	return false

# ── 공개 1: type3 binding interface 묶음 ─────────────────────────────────────────
## binding/type7 runtime 의 type3_interfaces 에 그대로 merge 할 4개 Callable.
func get_type3_m29_interfaces() -> Dictionary:
	return {"player_context": Callable(self, "player_context"), "handle_m29_parry": Callable(self, "handle_m29_parry"),
		"emit_m29_event": Callable(self, "emit_m29_event"), "m29_readiness": Callable(self, "m29_readiness")}

# ── 공개 2: FX 소비자 등록(능력당 단일 owner) ───────────────────────────────────
## consumer(actor: Node2D, event: Dictionary) -> bool. 이미 살아있는 소비자가 있으면 거부(덮어쓰기 0).
func bind_m29_fx_consumer(capability: String, consumer: Callable) -> bool:
	if _busy or not FX_CAPABILITIES.has(capability) or not consumer.is_valid(): return false
	var existing: Variant = _consumers.get(capability)
	if existing is Callable and (existing as Callable).is_valid(): return false
	_consumers[capability] = consumer
	_ready_frame = NAN
	return true

func unbind_m29_fx_consumer(capability: String, consumer: Callable) -> bool:
	if _busy or not _consumers.has(capability) or _consumers[capability] != consumer: return false
	_consumers.erase(capability)
	_ready_frame = NAN
	return true

# ── 공개 3: 준비 상태 ─────────────────────────────────────────────────────────
## 4개 능력 모두 bool. 같은 World 프레임 안 반복 호출은 캐시(틱당 actor 수만큼 호출됨).
## combat_qe: 매 프레임 구조 검사 + FULL_CHECK_INTERVAL 프레임마다(첫 호출 포함) 전체 패링 원천 검사.
func m29_readiness() -> Dictionary:
	_counts.readiness_calls += 1
	var frame: float = float(_world.get_native_frame()) if _live() else NAN
	if is_nan(frame) or frame != _ready_frame:
		var reason := _structural_reason()
		if not reason.is_empty():
			_full_check_frame = NAN
		else:
			if is_nan(_full_check_frame) or frame < _full_check_frame or frame - _full_check_frame >= FULL_CHECK_INTERVAL:
				_full_reason = _full_combat_reason()
				_full_check_frame = frame
			reason = _full_reason
		_ready_cache = {"schema": SERVICE_SCHEMA, "combat_qe": reason.is_empty(), "combat_qe_reason": reason}
		for capability in FX_CAPABILITIES:
			var consumer: Variant = _consumers.get(capability)
			_ready_cache[capability] = consumer is Callable and (consumer as Callable).is_valid()
		_ready_frame = frame
	return _ready_cache.duplicate()

func _live() -> bool:
	return is_instance_valid(_main) and is_instance_valid(_world) and is_instance_valid(_player) \
		and _main.is_inside_tree() and _world.is_inside_tree() and _player.get_parent() == _main \
		and _world.get("player") == _player

func _structural_reason() -> String:
	if not _live(): return "actual_main_world_player_not_live"
	var state_owner: Variant = _main.get("source_state")
	var resources: Variant = _main.get("source_resources")
	var providers: Variant = _main.get("source_providers")
	if not is_instance_valid(state_owner) or state_owner.is_queued_for_deletion() or not is_instance_valid(resources) 			or not resources.is_native_source_resources_ready() or providers == null or not providers.is_native_source_providers_ready():
		return "source_owners_not_ready"
	return ""

func _full_combat_reason() -> String:
	if not _live(): return "actual_main_world_player_not_live"
	var source: Dictionary = _main.read_native_q_parry_source()
	if source.get("ready") != true: return "parry_source_not_ready:" + str(source.get("reason"))
	return ""

# ── 공개 4: 플레이어 문맥(live isPWin) ─────────────────────────────────────────
## target 은 Main 의 실제 Player 만. 준비 안 되면 {} → binding 이 해당 phase 를 fail-closed 로 멈춘다.
func player_context(target: Node2D) -> Dictionary:
	_counts.context_calls += 1
	if not _live() or target != _player:
		_counts.context_rejected += 1
		return {}
	var window: Dictionary = read_parry_window()
	if window.get("ready") != true:
		_counts.context_rejected += 1
		return {}
	var at: Vector2 = _player.global_position
	return {"x": at.x, "y": at.y, "r": float(_player.radius), "hp": float(_player.hp), "iframes": float(_player.iframes),
		"state": String(_player.state), "parry_window": window["value"]}

## 원본 isPWin(G38469) 실시간 평가. 입력: Player.state, P.st2/_sbParryT/_kiParryT, _lEq('_lCapeParry').
func read_parry_window() -> Dictionary:
	if not _live(): return {"ready": false, "reason": "actual_main_world_player_not_live"}
	var state_owner: Variant = _main.get("source_state")
	var providers: Variant = _main.get("source_providers")
	if not is_instance_valid(state_owner) or providers == null: return {"ready": false, "reason": "source_owners_not_ready"}
	var p: Variant = state_owner.read_current_p()
	if not p is Dictionary: return {"ready": false, "reason": "current_p_not_ready"}
	var bundle: Dictionary = providers.get_provider_bundle()
	var affix: Object = bundle.get("affix")
	if affix == null: return {"ready": false, "reason": "affix_reader_not_ready"}
	var state := String(_player.state)
	var fields := {}
	for key in ["st2", "_sbParryT", "_kiParryT"]:
		var raw: Variant = p.get(key)
		fields[key] = affix.js_to_number(raw if affix.js_truthy(raw) else 0, true)
	var win_ticks := -1
	if state == "sBash":
		# JS && 단락: _lParryWinTicks()/_lEq 는 sBash 일 때만 호출된다.
		var cape: Dictionary = bundle.formula.l_eq("_lCapeParry")
		if cape.get("status") != "READY": return {"ready": false, "reason": "l_eq_not_ready:" + str(cape.get("reason"))}
		var cape_value: float = affix.js_to_number(cape.get("value"), true)
		win_ticks = mini(SOURCE_PARRY_WIN_CAP, bundle.formula.js_to_int32(float(SOURCE_PARRY_WIN) * (1.0 + cape_value)))
	var value := source_is_p_win(state, float(fields["st2"]), float(fields["_sbParryT"]), float(fields["_kiParryT"]), win_ticks)
	return {"ready": true, "value": value, "state": state, "fields": fields, "l_parry_win_ticks": win_ticks}

## isPWin 식 그대로(G38469). 기존 CombatQEProducer.is_parry_window 는 _kiParryT·sBash+_sbParryT 항이 없어
## 접촉 판정에 재사용하지 않는다(그 producer 는 Q/E 경로 소유, 변경 0).
static func source_is_p_win(state: String, st2: float, sb_parry_t: float, ki_parry_t: float, l_parry_win_ticks: int) -> bool:
	return (state == "sBash" and st2 > float(SBASH_TICKS - l_parry_win_ticks)) or ki_parry_t > 0.0 \
		or (state == "sBlock" and sb_parry_t > 0.0) or (state == "peaceShield" and sb_parry_t > 0.0) \
		or (state != "whirlwind" and state != "beam" and state != "elecRepent" and sb_parry_t > 0.0)

# ── 공개 5: 패링 분기 소비 ───────────────────────────────────────────────────
## binding 이 kernel 의 player_parry 이벤트 직후 호출. 성공 여부만 bool 로 돌려준다(관측은 get_last_parry()).
func handle_m29_parry(actor: Node2D, target: Node2D, event: Dictionary) -> bool:
	return resolve_m29_contact_parry(actor, target, event).get("accepted") == true

## 같은 처리의 관측 반환판. 순서: parryBank → (addTxt 미이식) → doParry 기존 writer → _poiseHit(e,20) 코어.
func resolve_m29_contact_parry(actor: Node2D, target: Node2D, event: Dictionary) -> Dictionary:
	var out := {"accepted": false, "reason": "", "order": [], "skipped": [], "before": {}, "after": {},
		"damage_applied": 0, "projectile_contact_calls": 0, "full_doparry": false}
	if _busy: return _reject_parry(out, "reentrant_m29_service_call")
	_busy = true
	var reason := _parry_preflight(actor, target, event)
	if not reason.is_empty():
		_busy = false
		return _reject_parry(out, reason)
	var current: Dictionary = _main.read_native_q_parry_source()
	var bank: float = _main.read_native_source_parry_bank(current.p)
	var reward: int = _main.native_source_parry_reward(float(current.stats.parry_bonus), float(current.regen_lv), 1.0)
	if not is_finite(bank) or reward < 0:
		_busy = false
		return _reject_parry(out, "parry_bank_or_reward_not_finite")
	var raw: Dictionary = actor.get_native_modifier_state()
	# doParry _isQ(G38470 = _forceQ||sBlock||peaceShield||_sbParryT>0): 연출·유니크 분기 관측용, 보상 writer 값 영향 0.
	var window := read_parry_window()
	var is_q: bool = String(_player.state) in ["sBlock", "peaceShield"] or float(window.fields._sbParryT) > 0.0
	out.before = _observe(raw, bank)
	# 1) G40533 P.parryBank=(P.parryBank||0)+(e.atk||10) — 기존 Q 필드 writer.
	if not _main.commit_native_q_control_state({"parryBank": bank + float(event.parry_bank_add)}):
		_busy = false
		return _reject_parry(out, "parry_bank_commit_rejected")
	out.order.append("parryBank")
	# 2) G40534 addTxt('⚡패링!') — 표시 소비자 미연결(번역 등록 대상 문자열 추가 0).
	out.skipped.append("addTxt_parry_text")
	# 3) doParry(e.atk,e.x,e.y,false,e.el) — 기존 writer(hp/st/mp+보상, iframes=25, poise+1).
	var resources: Dictionary = _main.source_resources.commit_native_q_parry_reward(_main, float(reward))
	if resources.get("accepted") != true:
		_busy = false
		out.partial_writes = ["parryBank"]
		return _reject_parry(out, "doparry_reward_commit_rejected:" + str(resources.get("reason")))
	out.order.append("doParry")
	_main.record_native_parry_session_stat() # PC-SYS-3 G38472 doParry parries++
	out.doparry = {"reward": reward, "in_dmg": event.do_parry.atk, "force_q": false, "el": event.do_parry.el,
		"is_q": is_q, "remaining": DOPARRY_REMAINING.duplicate(), "source_noop": ["parry_lesson_physicalParry"]}
	# 4) _poiseHit(e,20) — type3 actor 의 원본 코어.
	var poise: Dictionary = actor.apply_native_source_poise_core(float(event.poise_hit))
	if poise.get("ready") != true:
		_busy = false
		out.partial_writes = ["parryBank", "doParry"]
		return _reject_parry(out, "poise_core_rejected:" + str(poise.get("reason")))
	out.order.append("poiseHit20")
	out.poise = poise
	out.after = _observe(raw, _main.read_native_source_parry_bank(_main.source_state.read_current_p()))
	out.accepted = true
	_busy = false
	_counts.parry_accepted += 1
	_last_error = ""
	_last_parry = out.duplicate(true)
	_player.emit_signal("telemetry_event", "m29_contact_parry", out.duplicate(true))
	return out

func _reject_parry(out: Dictionary, reason: String) -> Dictionary:
	out.reason = reason
	_counts.parry_rejected += 1
	_last_error = reason
	_last_parry = out.duplicate(true)
	return out

func _parry_preflight(actor: Node2D, target: Node2D, event: Dictionary) -> String:
	var owner := _actor_owner_error(actor)
	if not owner.is_empty(): return owner
	if target != _player: return "external_target_not_main_player"
	if _main.get_tree().paused: return "tree_paused"
	if float(_player.hp) <= 0.0: return "player_dead"
	if event.get("kind") != "player_parry" or not event.get("do_parry") is Dictionary: return "not_m29_player_parry_event"
	var dp: Dictionary = event.do_parry
	# 비투사체 접촉만. projectile 이 true/누락이면 반사 경로로 오인될 수 있으므로 거부.
	if not dp.has("projectile") or dp.projectile != false: return "projectile_contact_not_accepted_here"
	if typeof(event.get("parry_bank_add")) != TYPE_INT or not _num(event.get("poise_hit")) \
			or float(event.poise_hit) != M29Script.POISE_HIT_ON_PARRY: return "invalid_m29_parry_payload"
	var raw: Dictionary = actor.get_native_modifier_state()
	if str(raw.get("s")) != "eCharge": return "actor_not_in_eCharge_contact"
	if not _num(dp.get("x")) or not _num(dp.get("y")) or float(dp.x) != float(raw.get("x")) or float(dp.y) != float(raw.get("y")):
		return "event_position_not_actor_owned"
	var atk: Variant = raw.get("atk")
	if not _num(dp.get("atk")) or not _num(atk) or float(dp.atk) != float(atk) or event.parry_bank_add != int(M29Script._or(atk, float(M29Script.DEFAULT_PARRY_ATK))):
		return "event_attack_not_actor_owned"
	if float(_player.iframes) > 0.0: return "player_iframes_gate"
	var window := read_parry_window()
	if window.get("ready") != true: return "parry_window_not_ready:" + str(window.get("reason"))
	if window.value != true: return "live_parry_window_closed"
	var source: Dictionary = _main.read_native_q_parry_source()
	if source.get("ready") != true: return "parry_source_not_ready:" + str(source.get("reason"))
	if not actor.has_method("apply_native_source_poise_core"): return "actor_poise_core_missing"
	return ""

func _actor_owner_error(actor: Node2D) -> String:
	if not _live(): return "actual_main_world_player_not_live"
	if not is_instance_valid(actor) or not actor is BindingScript: return "external_actor_not_type3_binding"
	if actor.get_parent() != _world: return "actor_not_registered_in_main_world"
	if not actor.is_native_registry_ready() or not actor.alive or not actor.mods.has("M29"): return "actor_not_live_m29_owner"
	return ""

func _observe(raw: Dictionary, bank: float) -> Dictionary:
	var mp: Variant = _main.source_state.read_current_p().get("mp")
	return {"parryBank": bank, "hp": float(_player.hp), "st": float(_player.stamina), "mp": mp, "iframes": float(_player.iframes),
		"poise": int(_player.poise), "enemy_poise": raw.get("poise"), "enemy_poiseR": raw.get("poiseR"),
		"enemy_stunned": raw.get("stunned"), "enemy_maxStunned": raw.get("_maxStunned"), "enemy_pImmune": raw.get("_pImmune")}

static func _num(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

# ── 공개 6: 이벤트 소비자 라우팅 ─────────────────────────────────────────────
func emit_m29_event(actor: Node2D, event: Dictionary) -> bool:
	if _busy:
		_counts.emit_rejected += 1
		_last_error = "reentrant_m29_service_call"
		return false
	var owner := _actor_owner_error(actor)
	var kind: Variant = event.get("kind")
	if not owner.is_empty() or not kind is String or not EVENT_ROUTES.has(kind):
		_counts.emit_rejected += 1
		_last_error = owner if not owner.is_empty() else "unknown_m29_event_kind"
		return false
	_busy = true
	var ok := true
	for capability in EVENT_ROUTES[kind]:
		var consumer: Variant = _consumers.get(capability)
		if not consumer is Callable or not (consumer as Callable).is_valid():
			ok = false
			_last_error = "m29_consumer_missing:" + capability
			break
		var result: Variant = (consumer as Callable).call(actor, event.duplicate(true))
		if not result is bool or not result:
			ok = false
			_last_error = "m29_consumer_rejected:" + capability
			break
	_busy = false
	_counts["emit_accepted" if ok else "emit_rejected"] += 1
	return ok

func get_last_parry() -> Dictionary:
	return _last_parry.duplicate(true)

func get_snapshot() -> Dictionary:
	var bound := {}
	for capability in FX_CAPABILITIES:
		var consumer: Variant = _consumers.get(capability)
		bound[capability] = consumer is Callable and (consumer as Callable).is_valid()
	return {"schema": SERVICE_SCHEMA, "configured": is_instance_valid(_main), "live": _live(), "last_error": _last_error,
		"consumers_bound": bound, "counts": _counts.duplicate(), "busy": _busy, "full_doparry": false,
		"natural_m29_spawn_bound": false}

extends RefCounted
## BC3-02: pure CH3 entry points delegating to approved generalized CH1 owners.
## No actor, Main/State/World, actual effects, projectile store, save or singleton RNG.
const Catalog = preload("res://scripts/native_ch3_boss_catalog.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const Spawn = preload("res://scripts/native_ch1_boss_spawn_contract.gd")
const Utility = preload("res://scripts/native_ch1_boss_utility.gd")
const Selector = preload("res://scripts/native_ch1_boss_selector.gd")
const Phase = preload("res://scripts/native_ch1_boss_phase.gd")
const Start = preload("res://scripts/native_ch1_boss_pattern_start.gd")
const Melee = preload("res://scripts/native_ch1_boss_melee_states.gd")

static func source_receipt() -> Dictionary:
	var result: Dictionary = Catalog.source_receipt()
	result["ready"]=Context.resolve(Catalog)["ready"]
	result["dependency_integration_sha"]="dcd32b491910c0a1485b4cde8b3ba6b1009aedfc"
	result["shared_start_count"]=21
	result["other_start_owner_required"]=16
	result["ch2_start_owner_required"]=9
	result["ch3_new_start_owner_required"]=7
	result["shared_melee_families"]=["slashCombo","slam","sweep"]
	result["live_combat_connected"]=false
	return result

static func build_spawn_packet(request: Dictionary, rng: Callable,
		can_move: Callable, safe_point: Callable = Callable()) -> Dictionary:
	return Spawn.build_spawn_packet(request,rng,can_move,safe_point,Catalog)
static func evaluate_move(si: int, move: Dictionary, distance: float, ps: Variant,
		phase: int, enemy: Dictionary, rng: Callable = Callable()) -> Dictionary:
	return Utility.evaluate_move(si,move,distance,ps,phase,enemy,rng,Catalog)
static func select_tick(si: int, enemy: Dictionary, sp: float, distance: float,
		ps: Variant, rng: Callable = Callable(), boss_debug: bool = false) -> Dictionary:
	return Selector.select_tick(si,enemy,sp,distance,ps,rng,boss_debug,Catalog)
static func phase_transition(si: int, enemy: Dictionary) -> Dictionary:
	return Phase.phase_transition(si,enemy,Catalog)
static func clock_step(si: int, checkpoint: String, enemy: Dictionary, sp: float,
		context: Dictionary = {}, rng: Callable = Callable()) -> Dictionary:
	return Phase.clock_step(si,checkpoint,enemy,sp,context,rng,Catalog)
static func begin_phase_effects(si: int, enemy: Dictionary, player: Dictionary) -> Dictionary:
	return Phase.begin_phase_effects(si,enemy,player,Catalog)
static func phase_effect_step(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if not owns_continuation(token): return _unowned()
	return Phase.phase_effect_step(token,response,rng)
static func begin_start(si: int, id: String, enemy: Dictionary, distance: float,
		phase: int, extra_delay: float = 0.0, context: Dictionary = {}) -> Dictionary:
	return Start.begin_start(si,id,enemy,distance,phase,extra_delay,context,Catalog)
static func next_start(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if not owns_continuation(token): return _unowned()
	return Start.next_start(token,response,rng)
static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary, options: Dictionary = {}) -> Dictionary:
	return Melee.begin_tick(si,enemy,sp,player,options,Catalog)
static func next_tick(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if not owns_continuation(token): return _unowned()
	return Melee.next_tick(token,response,rng)

## Ownership only: future packet kinds can inspect their exact catalog binding.
## The delegated owner still validates its own version/body/ack protocol.
static func owns_continuation(token: Dictionary) -> bool:
	if token.get("_chapter_catalog")!=Catalog or not token.get("si") is int \
		or token["si"]<10 or token["si"]>13: return false
	return Context.from_token(token)["ready"]
static func _unowned() -> Dictionary:
	return {"status":"NOT_READY","reason":"ch3_continuation_required","enemy":null,
		"player":null,"continuation":null,"command":null,"full_tick_complete":false}

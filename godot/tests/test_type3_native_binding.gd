extends SceneTree
## New binding integration only. No Root module suites, Main, GUI, save/import.
## Constructor providers record delegated requests; they do not prove actual
## Q/E, FX, audio, six projectile kernels or public play. No live field setters.
const Binding = preload("res://scripts/type3_native_binding.gd")
const SpawnRecipe = preload("res://scripts/type3_spawn_recipe.gd")

class ConstructorRandom extends RefCounted:
	var sequence: Array
	var calls = 0
	func _init(initial: Array) -> void:
		sequence = initial.duplicate()
	func next() -> float:
		calls += 1
		return float(sequence.pop_front()) if not sequence.is_empty() else 0.5

class TargetContext extends Node2D:
	var hp = 350
	var radius = 15.0
	var iframes = 0.0
	var state = "idle"
	var damage_packets: Array = []
	var impulses: Array = []
	var damage_order: Array = []
	func _init(initial_position: Vector2) -> void:
		position = initial_position
	func receive_damage(amount: int, dtype: String = "phys") -> void:
		damage_packets.append({"amount": amount, "dtype": dtype})
		damage_order.append("damage:"+dtype)
	func apply_native_posthurt_knockback(impulse: Vector2) -> void:
		impulses.append(impulse)
		damage_order.append("posthurt_KB")

class WorldContext extends Node2D:
	var frame: float
	var identity: Array = []
	var final_body_min_x: float
	func _init(initial_frame: float = 100.0, constructor_body_min_x: float = INF) -> void:
		frame = initial_frame
		final_body_min_x = constructor_body_min_x
	func advance_fixture_frame() -> void:
		# This is the constructor world's phase service, not an observer write
		# into the product world's private clock or a game-time injection.
		frame += 1.0
	func get_native_frame() -> float:
		return frame
	func get_native_world_identity() -> Array:
		return identity
	func can_move(_point: Vector2, r: float) -> bool:
		# A narrow constructor corridor admits mkEn's radius10 but the final
		# randomized larger body is blocked. LOS remains clear down the lane.
		return r <= 10.0 or _point.x >= final_body_min_x
	func has_line_of_sight(_start: Vector2, _end: Vector2) -> bool:
		return true
	func get_path_direction(_point: Vector2) -> Vector2:
		return Vector2.RIGHT
	func get_enemies() -> Array:
		return identity

class RequestProviders extends RefCounted:
	var events: Array = []
	var packets: Array = []
	var parries: Array = []
	var capability_unavailable: String
	func _init(unavailable: String = "") -> void:
		capability_unavailable = unavailable
	func readiness() -> Dictionary:
		var result = {"combat_qe": true, "warning_fx": true, "impact_fx": true, "detonate_sound": true, "constructor_request_fixture_only": true}
		if not capability_unavailable.is_empty(): result[capability_unavailable] = false
		return result
	func player_context(target: Node2D) -> Dictionary:
		return {"x": target.global_position.x, "y": target.global_position.y, "r": target.get("radius"), "hp": target.get("hp"), "iframes": target.get("iframes"), "state": target.get("state"), "parry_window": false}
	func element_multiplier(_element: int) -> float:
		return 1.0
	func is_tile_wall(_point: Vector2) -> bool:
		return false
	func emit(_actor: Node2D, packet: Dictionary) -> bool:
		packets.append(packet.duplicate(true))
		return true
	func emit_m29(_actor: Node2D, event: Dictionary) -> bool:
		events.append(event.duplicate(true))
		return true
	func parry(_actor: Node2D, _target: Node2D, event: Dictionary) -> bool:
		parries.append(event.duplicate(true))
		return true

var failures = 0
var completed: Array = []
var passing: Array = []
var only: Array = []
var phase_calls = 0
var observations: Dictionary = {}

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="): only = Array(arg.trim_prefix("--only=").split(","))
	call_deferred("run")

func check(value: bool, label: String) -> void:
	if not value:
		failures += 1
		print("ASSERT_FAIL " + label)

func near(a: float, b: float, label: String) -> void:
	check(absf(a-b) < 0.0001, "%s actual=%s expected=%s" % [label,a,b])

func recipe_for(mod: String, element: int = 0) -> Dictionary:
	var sequence = [0.5] if mod.is_empty() else [0.01, 0.1 if mod == "M29" else 0.9]
	var rng = ConstructorRandom.new(sequence)
	var builder = SpawnRecipe.new()
	check(builder.configure(rng.next, func(_x,_y,_r): return true, func(x,y,_r): return {"x":x,"y":y}), "actual source recipe producer configured")
	var outcome = builder.build_child(0, 0, {"stage":0,"room":0,"player_level":1,"difficulty":5,"stage_difficulty_offset":0}, element)
	check(outcome.get("valid",false), "actual recipe construction valid")
	return outcome["recipe"]

func interfaces_for(requests: RequestProviders, rng: ConstructorRandom) -> Dictionary:
	return {"render_body":false,"native_random":rng.next,"emit_charged_projectile":requests.emit,"player_context":requests.player_context,"element_multiplier":requests.element_multiplier,"is_tile_wall":requests.is_tile_wall,"handle_m29_parry":requests.parry,"emit_m29_event":requests.emit_m29,"m29_readiness":requests.readiness}

func configure_fixture(mod: String, element: int = 0, missing_capability: String = "", constructor_body_min_x: float = INF, constructor_target: Vector2 = Vector2(200,0), install_actor: bool = true) -> Dictionary:
	var world = WorldContext.new(100,constructor_body_min_x)
	root.add_child(world)
	var target = TargetContext.new(constructor_target)
	world.add_child(target)
	var actor = Binding.new()
	var requests = RequestProviders.new(missing_capability)
	var rng = ConstructorRandom.new([])
	var recipe = recipe_for(mod,element)
	var outcome = actor.configure(recipe,target,world,interfaces_for(requests,rng))
	if outcome and install_actor: world.add_child(actor)
	return {"world":world,"target":target,"actor":actor,"requests":requests,"rng":rng,"recipe":recipe,"valid":outcome}

func advance(f: Dictionary) -> void:
	f["world"].advance_fixture_frame()
	f["actor"].advance_native_phase(1,f["world"].get_native_frame(),f["world"].get_native_world_identity())
	phase_calls += 1

func dispose(f: Dictionary) -> void:
	if f["actor"].get_parent() == null: f["actor"].free()
	f["world"].free()

func strict_providers_and_world_phase() -> void:
	for missing in ["combat_qe","warning_fx","impact_fx","detonate_sound"]:
		var f = configure_fixture("M29",0,missing)
		check(not f["valid"], "missing actual M29 dependency rejects binding: "+missing)
		check(not f["actor"].is_native_registry_ready(), "unavailable provider cannot claim registry readiness")
		check(f["actor"].get_native_modifier_state().is_empty(), "readiness failure never configures root actor")
		check(f["world"].get_child_count()==1 and f["requests"].events.is_empty() and f["requests"].packets.is_empty(), "no registration/world children/events on unavailable dependency")
		dispose(f)
	var f = configure_fixture("")
	check(f["valid"], "normal type3 binds actual emitter and world")
	check(f["actor"].is_native_registry_ready(), "actual complete binding is ready before registration")
	var actor = f["actor"]
	check(actor.set_player(f["target"]), "actual registration set_player accepted same player")
	check(not actor.is_physics_processing(), "world phase owns AI; own physics remains off")
	advance(f)
	var snapshot = actor.get_snapshot()
	near(snapshot["native_frame"],1,"root local clock consumes one actual method")
	near(snapshot["global_native_frame"],101,"global frame cached separately")
	var before = snapshot["native"].duplicate(true)
	actor.advance_native_phase(1,101,f["world"].get_native_world_identity())
	phase_calls += 1
	check(actor.get_snapshot()["native"]==before,"same world phase cannot dispatch actor twice")
	actor.advance_native_phase(1,102,f["world"].get_native_world_identity())
	phase_calls += 1
	near(actor.get_snapshot()["native_frame"],1,"caller cannot invent world frame")
	var equal_new = f["world"].get_native_world_identity().duplicate()
	actor.advance_native_phase(1,101,equal_new)
	phase_calls += 1
	near(actor.get_snapshot()["native_frame"],1,"equal-content new identity cannot bind actual world phase")
	check(snapshot["stun_ticks"]==before["stunned"] and snapshot["frozen_ticks"]==before.get("_frozen",0),"flattened guards read actual raw fields")
	near(actor.facing,before["facing"],"public facing delegates current actual raw value")
	snapshot["native"]["hp"]=-999
	check(actor.hp==f["recipe"]["hp"],"snapshot mutation cannot alter actual HP")
	observations["clock_boundary"]={"root_local":1,"actual_constructor_world_global":101,"Main_boot":false,"registered_type7":false}
	dispose(f)

func m29_actual_owner_hook_order() -> void:
	# Constructor collision lane blocks small idle movements from x0 but allows
	# source charge's endpoint jump to x32; no live actor state/position setter.
	var f = configure_fixture("M29",2,"",32,Vector2(150,0))
	check(f["valid"],"M29 actual binder configured with constructor request providers")
	for phase in range(540): advance(f)
	var snapshot = f["actor"].get_snapshot()
	check(snapshot["native"]["s"]=="eChargeWind","actual source trigger reached through owner540 phases")
	near(snapshot["native"]["st2"],59,"owner st2 once after same-phase windup60; kernel false prevents58")
	near(snapshot["native"]["modT"]["eliteBusy"],78,"M29 fresh lock preserved after trigger")
	check(snapshot["M29_lock_calls"]==540 and snapshot["M29_trigger_calls"]==540 and snapshot["M30_native_calls"]==0,"single M29 driver; no second modifier decrement")
	advance(f)
	near(f["actor"].get_snapshot()["native"]["modT"]["eliteBusy"],77,"next actual owner phase decrements busy once")
	near(f["actor"].get_snapshot()["native"]["st2"],58,"next windup actor decrement once")
	check(f["requests"].events.filter(func(e):return e["kind"]=="windup_started").size()==1,"actual kernel sink delegated one windup event")
	check(not f["requests"].packets.is_empty(),"actual root charge producer uses passed emitter callback")
	if not f["requests"].packets.is_empty():
		check(f["requests"].packets[0]["el"]==2 and f["requests"].packets[0].get("waterBean",false),"new binder forwards actual raw ice packet rather than normalized alias")
	for phase in range(63):advance(f)
	check(f["target"].damage_packets.size()==1,"actual M29 body reached target through source FSM and real binder sink")
	if f["target"].damage_packets.size()==1:
		check(f["target"].damage_packets[0]["dtype"]=="phys","ice element body still uses source default phys damage")
		check(f["target"].damage_order==["damage:phys","posthurt_KB"],"actual binder calls ordinary damage before independent additive KB")
		near(f["target"].impulses[0].length(),100,"source M29 independent KB100 unchanged")
	observations["m29_boundary"]={"phase_count":604,"windup_creation_st2":59,"next_st2":58,"ice_body_damage_packets":f["target"].damage_packets,"damage_order":f["target"].damage_order,"actual_public_QE_or_FX_audio_verified":false,"provider_kind":"constructor request recorders"}
	dispose(f)

func m30_actual_single_driver_and_raw_flags() -> void:
	var f = configure_fixture("M30")
	check(f["valid"],"actual M30 module binds source rawref with original descriptor/resources")
	for phase in range(480): advance(f)
	var snapshot = f["actor"].get_snapshot()
	near(snapshot["native"]["modT"]["eliteBusy"],54,"M30 fresh busy54 is not additionally ticked by M29")
	check(snapshot["M30_native_calls"]==480 and snapshot["M29_lock_calls"]==0,"only actual M30 owns its lock phase")
	check(snapshot["M30_world_sibling"],"source FX modifier is world sibling")
	check(snapshot["native_flags"]["ib"]==f["recipe"]["ib"],"native flag comes from source recipe")
	check(snapshot["native"]["modT"]["eliteRing"]==0,"actual source kernel reset ring after480")
	check(snapshot["native_frame"]==480 and snapshot["global_native_frame"]==580,"root native frame remains local under external world580")
	observations["m30_boundary"]={"source_owner_steps":480,"world_global":580,"local_actor":480,"old_kernel_suite_reexecution":false,"render_or_public_pixel_proof":false}
	dispose(f)

func unregistered_dependency_cleanup() -> void:
	var pending = configure_fixture("M30",0,"",INF,Vector2(200,0),false)
	check(pending["valid"] and pending["actor"].get_parent()==null,"actual provisional M30 actor configured before registry installation")
	check(pending["world"].get_child_count()==2,"provisional actual M30 helper is world sibling beside target")
	check(pending["actor"].dispose_unregistered_native_dependencies(),"unregistered actual helper cleanup accepted")
	check(pending["world"].get_child_count()==1 and pending["target"].get_parent()==pending["world"],"cleanup removes only owned helper and preserves actual target")
	check(not pending["actor"].is_native_registry_ready(),"disposed provisional binding cannot be registered")
	check(pending["actor"].dispose_unregistered_native_dependencies() and pending["world"].get_child_count()==1,"missing helper cleanup is idempotent")
	dispose(pending)
	var installed=configure_fixture("M30")
	var before=installed["world"].get_child_count()
	check(not installed["actor"].dispose_unregistered_native_dependencies(),"installed actor cannot dispose live native dependencies")
	check(installed["actor"].is_native_registry_ready() and installed["world"].get_child_count()==before,"installed actual helper/actor remain intact")
	dispose(installed)
	var normal=configure_fixture("",0,"",INF,Vector2(200,0),false)
	check(normal["actor"].dispose_unregistered_native_dependencies() and not normal["actor"].is_native_registry_ready(),"ordinary unregistered actor cleanup needs no helper and disables readiness")
	check(normal["world"].get_child_count()==1,"ordinary cleanup preserves unrelated target")
	dispose(normal)
	observations["cleanup_boundary"]={"actual_world_sibling_helper_removed":true,"installed_actor_preserved":true,"other_world_children_removed":false,"source_suite_reexecuted":false}

func group(name: String, callback: Callable) -> void:
	if not only.is_empty() and not only.has(name):return
	print("GROUP_BEGIN "+name)
	var before=failures
	callback.call()
	completed.append(name)
	if before==failures:
		passing.append(name)
		print("GROUP_PASS "+name)
	else:print("GROUP_FAIL "+name)

func run() -> void:
	group("type3_binding_strict_providers_and_world_phase",strict_providers_and_world_phase)
	group("type3_binding_m29_actual_owner_hook_order",m29_actual_owner_hook_order)
	group("type3_binding_m30_actual_single_driver_and_raw_flags",m30_actual_single_driver_and_raw_flags)
	group("type3_binding_unregistered_dependency_cleanup",unregistered_dependency_cleanup)
	print("TYPE3_BINDING_RECEIPT "+JSON.stringify({"completed":completed,"passed":passing,"failed_assertions":failures,"explicit_binding_phase_method_calls":phase_calls,"automatic_fixture_physics":0,"explicit_render":0,"public_play_or_pixel":false,"constructor_provider_only":true,"live_field_injection":false,"observations":observations}))
	quit(0 if failures==0 else 1)

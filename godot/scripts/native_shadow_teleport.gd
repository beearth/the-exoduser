extends "res://scripts/native_type7_teleport.gd"

func configure_shadow(actor: Node2D, target: Node2D, owner_world: Node2D, state_ref: Dictionary) -> bool:
	if _configured or not is_instance_valid(actor) or not is_instance_valid(target) or not is_instance_valid(owner_world): return false
	for method in ["receive_damage", "apply_native_posthurt_knockback", "get_native_element_multiplier"]:
		if not target.has_method(method): return false
	var descriptor: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/type7_teleport.json"))
	var originals: Dictionary = {}
	for asset in descriptor.assets:
		var original: Texture2D = load(asset.resource)
		if original == null: return false
		originals[asset.key] = original
	_actor = actor
	_target = target
	_world = owner_world
	_state = state_ref
	_textures = originals
	_effect_color = Color("#cc44ff")
	_configured = true
	_error = ""
	return true

func complete_shadow(destination: Vector2) -> bool:
	var radius := float(_actor.get("radius"))
	if not _world.can_move(destination, radius): return false
	var departure := _actor.global_position
	_spawn_effect("smoke_out", departure, radius * 4.0, 18.0)
	_actor.global_position = destination
	if _target.global_position.distance_to(destination) < (radius + 10.0) * 2.0 + float(_target.get("radius")) and float(_target.get("iframes")) <= 0.0 and str(_target.get("state")) != "charge":
		var request := int(float(_actor.get("attack")) * 10.5 * float(_target.get_native_element_multiplier(0)))
		_target.receive_damage(request, "phys")
		_target.apply_native_posthurt_knockback(Vector2.from_angle((_target.global_position - destination).angle()) * 120.0)
		_world.emit_native_text(_target.global_position.x, _target.global_position.y - 25.0, "충격파!", "#cc44ff", 30)
	_spawn_effect("impact", destination, radius * 4.0, 24.0)
	_spawn_effect("burst", destination, 64.0 * radius / 8.0, 0.0)
	_spawn_effect("smoke_in", destination, radius * 5.0, 22.0)
	_spawn_effect("bolt", departure, 0.0, 12.0, destination)
	_state["_tpFlashT"] = 12.0
	_state["_tpFlashCol"] = "#cc44ff"
	telemetry_event.emit("shadow_tp_completed", {"departure": [departure.x, departure.y], "arrival": [destination.x, destination.y]})
	return true
